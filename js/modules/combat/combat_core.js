// js/modules/combat/combat_core.js
// 职责：时间轴管控、自动攻击逻辑 (Auto-Battler Core)
// 适配：V4.8 全局3秒心跳机制 (Buff/CD 与 攻速解耦)

const CombatCore = {
    CONFIG: {
        MAX_GAUGE: 10000,
        TICK_RATE: 50,    // 50ms 刷新一次 (物理帧)
        BASE_TIME: 3.0,   // 3.0秒 = 1个标准回合周期 (用于Buff/CD结算)
        SPD_FACTOR: 0.01  // 速度系数
    },

    /** 初始化战斗数据 */
    init: function(ctx) {
        ctx.gauges = { player: 0, enemy: 0 };
        ctx.state = 'running';
        ctx.globalTimer = 0;

        // 【新增】3秒周期累积器
        ctx.roundAccumulator = 0;
        // 显示用的回合数计数
        ctx.displayTurn = 1;
    },

    /** 启动时间循环 */
    startLoop: function(ctx) {
        if (ctx.isEnded) return;
        ctx.state = 'running';
        this._tick(ctx);
    },

    /** 单帧心跳逻辑 */
    _tick: function(ctx) {
        // 1. 状态检查
        if (ctx.isStopped || ctx.isEnded || ctx.isPaused) return;

        // 获取时间倍率 (默认为 1.0)
        const scale = this.CONFIG.TIME_SCALE || 1.0;
        // 计算本帧流逝的“逻辑时间” (ms)
        const delta = this.CONFIG.TICK_RATE * scale;

        // ---------------------------------------------------------
        // 【模块 A】全局 3秒 心跳 (Buff / DoT / CD 结算)
        // ---------------------------------------------------------
        ctx.roundAccumulator += delta;
        const ROUND_INTERVAL = this.CONFIG.BASE_TIME * 1000; // 3000ms

        // 可能因为高倍速一次跳过多个周期，用 while 处理
        while (ctx.roundAccumulator >= ROUND_INTERVAL) {
            ctx.roundAccumulator -= ROUND_INTERVAL;
            this._processGlobalRound(ctx);

            // 如果结算由于DoT导致战斗结束，立即中止
            if (ctx.currentEHp <= 0 || ctx.currentPHp <= 0) {
                this._checkVictoryCondition(ctx);
                return;
            }
        }

        // ---------------------------------------------------------
        // 【模块 B】行动条跑条 (Action Gauge)
        // ---------------------------------------------------------

        // 获取动态速度
        const pStats = CombatCalc.getDynamicStats(ctx, 'player');
        const eStats = CombatCalc.getDynamicStats(ctx, 'enemy');

        // 计算跑条增量 (基于 3.0s 基准时间)
        const fps = 1000 / this.CONFIG.TICK_RATE;

        // 玩家增量
        const pTargetTime = this.CONFIG.BASE_TIME / (1 + pStats.speed * this.CONFIG.SPD_FACTOR);
        const pInc = this.CONFIG.MAX_GAUGE / (Math.max(0.1, pTargetTime) * fps);

        // 敌人增量
        const eTargetTime = this.CONFIG.BASE_TIME / (1 + eStats.speed * this.CONFIG.SPD_FACTOR);
        const eInc = this.CONFIG.MAX_GAUGE / (Math.max(0.1, eTargetTime) * fps);

        // 应用增量 (受倍速影响)
        ctx.gauges.player += pInc * scale;
        ctx.gauges.enemy += eInc * scale;
        ctx.globalTimer += delta;

        // 更新 UI 进度条
        const pPct = Math.min(100, (ctx.gauges.player / this.CONFIG.MAX_GAUGE) * 100);
        const ePct = Math.min(100, (ctx.gauges.enemy / this.CONFIG.MAX_GAUGE) * 100);

        if (window.CombatUI && CombatUI.updateGauges) {
            CombatUI.updateGauges(ctx, pPct, ePct);
        }

        // ---------------------------------------------------------
        // 【模块 C】满条行动触发 (Action Trigger)
        // ---------------------------------------------------------
        let actionHappened = false;

        // --- 玩家满条 ---
        if (ctx.gauges.player >= this.CONFIG.MAX_GAUGE) {
            ctx.gauges.player -= this.CONFIG.MAX_GAUGE;

            // 执行自动普攻
            const dmg = CombatCalc.performAttack(ctx, "你", pStats, eStats, true);
            ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg);

            // 【注意】这里不再调用 _onTurnEnd 结算Buff/CD，只负责行动
            actionHappened = true;
        }

        // --- 敌人满条 ---
        if (ctx.gauges.enemy >= this.CONFIG.MAX_GAUGE) {
            ctx.gauges.enemy -= this.CONFIG.MAX_GAUGE;

            // 执行敌人 AI
            CombatAction.enemyAction(ctx, eStats, pStats);

            actionHappened = true;
        }

        // ---------------------------------------------------------
        // 【模块 D】状态同步与胜负判定
        // ---------------------------------------------------------
        if (actionHappened) {
            ctx._syncPlayerStatus();
            ctx._updateUIStats();
            this._checkVictoryCondition(ctx);
            if (ctx.isEnded) return;
        }

        // 继续下一帧
        ctx.timer = setTimeout(() => this._tick(ctx), this.CONFIG.TICK_RATE);
    },

    /** * 【核心新增】全局回合结算 (每3秒触发一次)
     * 职责：刷新CD、结算DoT/HoT、更新Buff回合数
     */
    _processGlobalRound: function(ctx) {
        // 1. 日志分割线
        if (window.CombatUI) {
            CombatUI.log(ctx, `<div class="turn-divider">--- 第 ${ctx.displayTurn} 回合 (3秒) ---</div>`);
        }
        ctx.displayTurn++;

        // 2. 结算 玩家 身上的 Buff/DoT
        if (CombatAction.processBuffs) {
            CombatAction.processBuffs(ctx, 'player');
            CombatAction.processPoisonOnPlayer(ctx); // 毒素结算
        }

        // 3. 结算 敌人 身上的 Buff/DoT
        if (CombatAction.processBuffs) {
            CombatAction.processBuffs(ctx, 'enemy');
            CombatAction.processPoisonOnEnemy(ctx); // 毒素结算
        }

        // 4. 刷新 玩家 冷却时间 (CD)
        // 技能 CD
        for (let k in ctx.skillCDs) {
            if (ctx.skillCDs[k] > 0) ctx.skillCDs[k]--;
        }
        // 物品 CD
        for (let i = 0; i < 3; i++) {
            if (ctx.itemCDs[i] > 0) ctx.itemCDs[i]--;
        }

        // 5. 统一刷新 UI (CD遮罩、状态栏)
        if (ctx._refreshSkillCDUI) ctx._refreshSkillCDUI();
        if (ctx._refreshItemCDUI) ctx._refreshItemCDUI();
        if (ctx._updateToxUI) ctx._updateToxUI();
        if (ctx._updateUIStats) ctx._updateUIStats();
    },

    /** 胜负检查辅助方法 */
    _checkVictoryCondition: function(ctx) {
        if (ctx.currentEHp <= 0) {
            this.handleVictory(ctx);
            return true;
        }
        if (ctx.currentPHp <= 0) {
            this.handleDefeat(ctx);
            return true;
        }
        return false;
    },

    // ================== 结算与控制 (保持原有逻辑) ==================

    syncStatus: function(ctx) {
        if(ctx.player.status) {
            ctx.player.status.hp = ctx.currentPHp;
            ctx.player.status.mp = ctx.currentPMp;
        }
    },

    canAct: function(ctx) {
        return !(ctx.isStopped || ctx.isEnded || ctx.isPaused);
    },

    /** 逃跑 */
    stop: function(ctx) {
        if (ctx.options && ctx.options.canEscape === false) {
            if(window.showToast) window.showToast("强敌环伺，无路可退！");
            return;
        }
        ctx.isStopped = true; ctx.isEnded = true;
        if (ctx.timer) clearTimeout(ctx.timer);
        ctx._log(`<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">🏃 你看准时机，脚底抹油溜之大吉！</div>`);
        this.syncStatus(ctx);
        if (window.saveGame) window.saveGame();
        CombatUI.renderEnd(ctx, "逃跑");
        const footer = document.getElementById('map_combat_footer');
        if (footer) footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">关闭</button>`;
        ctx.clearCache();
    },

    /** 胜利 */
    handleVictory: function(ctx) {
        if (ctx.isEnded) return; // 防止重复结算
        ctx.isEnded = true;
        if (ctx.timer) clearTimeout(ctx.timer);

        if (window.player) {
            const rank = ctx.enemy.template || "minion";
            const gain = { "minion": 5, "elite": 10, "boss": 50, "lord": 100 }[rank] || 0;
            window.player.danger = Math.min(100, (window.player.danger || 0) + gain);
        }

        ctx._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`);

        const money = this._randomInt(ctx.enemy.money[0], ctx.enemy.money[1]);
        if (money > 0) { if (window.UtilsAdd) UtilsAdd.addMoney(money); else ctx.player.money += money; }

        const drops = this._calculateFinalDrops(ctx);
        const realDrops = [];
        drops.forEach(d => {
            if (window.addItem) {
                const added = window.addItem(d.id, 1);
                if (added) {
                    added.isBounty = d.isBounty;
                    realDrops.push(added);
                }
            }
        });

        let rewardHtml = this._buildRewardHtml(ctx, money, drops);

        if (window.UtilsEnemy) UtilsEnemy.markDefeated(ctx.enemy.x, ctx.enemy.y);
        this.syncStatus(ctx);

        if (ctx.onWinCallback) {
            ctx.onWinCallback();
            if (ctx.options && ctx.options.isMultiWave) return;
        }

        if (window.saveGame) window.saveGame();
        CombatUI.renderEnd(ctx, "胜利", rewardHtml);
    },

    /** 失败 */
    handleDefeat: function(ctx) {
        if (ctx.isEnded) return;
        ctx.isEnded = true;
        if (ctx.timer) clearTimeout(ctx.timer);

        ctx._log(`<div style="color:red; font-weight:bold; margin-top:10px;">💀 战斗失败...</div>`);
        CombatUI.renderEnd(ctx, "失败");

        const footer = document.getElementById('map_combat_footer');
        if (footer) {
            const btnId = 'btn_defeat_confirm_' + Date.now();
            footer.innerHTML = `<button id="${btnId}" class="ink_btn_normal" style="width:100%; height:40px;">黯然离去</button>`;
            setTimeout(() => {
                const btn = document.getElementById(btnId);
                if (btn) btn.onclick = () => this._finalizeDefeat(ctx);
            }, 0);
        }
    },

    _finalizeDefeat: function(ctx) {
        if (window.player.status) {
            window.player.status.hp = 1;
            window.player.status.mp = 0;
        }
        if (window.UtilsFail && window.UtilsFail.onCombatDefeat) {
            window.UtilsFail.onCombatDefeat(ctx.enemy);
        }
        if (window.closeModal) window.closeModal();
        ctx.clearCache();
    },

    /** 暂停控制 */
    togglePause: function(ctx) {
        if (ctx.isStopped || ctx.isEnded) return;
        ctx.isPaused = !ctx.isPaused;

        const btn = document.getElementById('combat_btn_pause');
        if (btn) btn.innerHTML = ctx.isPaused ? "▶ 继续" : "⏸ 暂停";

        if (!ctx.isPaused && ctx.state === 'running') {
            this._tick(ctx);
        } else if (ctx.timer) {
            clearTimeout(ctx.timer);
        }
    },

    /** 变速 */
    changeSpeed: function(ctx, delta) {
        let current = this.CONFIG.TIME_SCALE || 1.0;
        if (delta > 0) current += 0.5;
        else current -= 0.5;
        current = Math.max(0.5, Math.min(5.0, current));
        this.CONFIG.TIME_SCALE = current;

        const spdEl = document.getElementById('combat_speed_display');
        if(spdEl) spdEl.innerText = current.toFixed(1) + "x";
    },

    _randomInt: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },

    _calculateFinalDrops: function(ctx) {
        const drops = [];
        if (ctx.enemy.drops) ctx.enemy.drops.forEach(e => { if (Math.random() <= e.rate) drops.push({ id: e.id }); });
        if (this._checkBountyDrops) {
            const bounty = this._checkBountyDrops(ctx);
            bounty.forEach(b => drops.push({ id: b.id, isBounty: true }));
        }
        return drops;
    },

    _checkBountyDrops: function(ctx) {
        if (!window.player.bounty || !window.player.bounty.activeTasks) return [];
        const res = []; const id = ctx.enemy.id;
        window.player.bounty.activeTasks.forEach(task => {
            if (task.type === 1 && task.status === 'active' && task.targets) {
                const target = task.targets.find(t => t.id === id);
                if (target && target.curCount < target.reqCount && Math.random() < 0.3) {
                    const item = this._rollBountyEquip(ctx.enemy.template);
                    if (item) res.push(item);
                }
            }
        });
        return res;
    },

    _rollBountyEquip: function(rank) {
        let rw = rank === 'lord' ? {3:40,4:20,5:5,6:1} : (rank === 'boss' ? {1:80,2:40,3:20,4:5,5:1} : {1:100});
        let tw = 0; for (let r in rw) tw += rw[r];
        let rv = Math.random() * tw; let sr = 1;
        for (let r in rw) { rv -= rw[r]; if (rv <= 0) { sr = parseInt(r); break; } }
        const pool = (Array.isArray(window.GAME_DB.equipments) ? window.GAME_DB.equipments : Object.values(window.GAME_DB.equipments || {}))
            .filter(i => ['weapon','head','body','feet'].includes(i.type) && i.rarity === sr);
        return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    },

    _buildRewardHtml: function(ctx, money, drops) {
        if (money <= 0 && drops.length === 0) return `<span style="color:#888;">(一无所获)</span>`;
        let h = `<div style="background:#e8f5e9; border:1px solid #c8e6c9; padding:10px; margin-top:10px; border-radius:4px;">`;
        if (money > 0) h += `<p>获得钱财: <span style="color:#f57f17; font-weight:bold;">+${money}</span></p>`;
        if (drops.length > 0) {
            h += `<div style="font-weight:bold; margin-top:5px;">战利品:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`;
            drops.forEach(d => {
                let itemData = (Array.isArray(window.GAME_DB.items) ? window.GAME_DB.items.find(i=>i.id===d.id) : window.GAME_DB.items[d.id]);
                let name = itemData ? itemData.name : d.id;
                let extra = d.isBounty ? "border-color:#ff9800; background:#fff3e0; color:#e65100;" : "";
                h += `<span style="background:#fff; border:1px solid #ccc; padding:2px 6px; font-size:12px; border-radius:3px; ${extra}">${d.isBounty?'✨ ':''}${name}</span>`;
            });
            h += `</div>`;
        }
        return h + `</div>`;
    }
};

window.CombatCore = CombatCore;