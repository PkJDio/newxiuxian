// js/modules/combat/combat_core.js
// 职责：时间轴管控、自动攻击逻辑 (Auto-Battler Core)
// 适配：V3.0 精确跑条 + 自动普攻

const CombatCore = {
    CONFIG: {
        MAX_GAUGE: 10000,
        TICK_RATE: 50, // 50ms 刷新一次 (1秒20帧)
        BASE_TIME: 3.0, // 0速度时 5秒一动
        SPD_FACTOR: 0.01 // 速度系数
    },

    /** 初始化战斗数据 */
    init: function(ctx) {
        ctx.gauges = { player: 0, enemy: 0 };
        ctx.state = 'running';
        ctx.globalTimer = 0;
        ctx.turnCount = 1; // 内部轮次计数
    },

    /** 启动时间循环 */
    startLoop: function(ctx) {
        if (ctx.isEnded) return;
        ctx.state = 'running';
        this._tick(ctx);
    },

    /** 单帧心跳逻辑 */
    _tick: function(ctx) {
        // 1. 状态检查：暂停或结束后停止心跳
        if (ctx.isStopped || ctx.isEnded || ctx.isPaused) return;

        // 2. 获取动态属性 (实时速度)
        const pStats = CombatCalc.getDynamicStats(ctx, 'player');
        const eStats = CombatCalc.getDynamicStats(ctx, 'enemy');

        // 3. 精确计算增量 (修复速度感觉一样的问题)
        // 逻辑：计算跑满所需的总时间(秒) -> 换算成帧数 -> 算出每帧加多少
        // 帧率 = 1000 / TICK_RATE (默认20)
        const fps = 1000 / this.CONFIG.TICK_RATE;

        // 玩家目标时间 (秒) = 基准 / (1 + 速度加成)
        const pTargetTime = this.CONFIG.BASE_TIME / (1 + pStats.speed * this.CONFIG.SPD_FACTOR);
        // 玩家每帧增量
        const pInc = this.CONFIG.MAX_GAUGE / (Math.max(0.1, pTargetTime) * fps);
        // 敌人目标时间 (秒)
        const eTargetTime = this.CONFIG.BASE_TIME / (1 + eStats.speed * this.CONFIG.SPD_FACTOR);
        const eInc = this.CONFIG.MAX_GAUGE / (Math.max(0.1, eTargetTime) * fps);

        // 应用增量
        ctx.gauges.player += pInc;
        ctx.gauges.enemy += eInc;
        ctx.globalTimer += this.CONFIG.TICK_RATE;

        // 4. 更新 UI 进度条
        const pPct = Math.min(100, (ctx.gauges.player / this.CONFIG.MAX_GAUGE) * 100);
        const ePct = Math.min(100, (ctx.gauges.enemy / this.CONFIG.MAX_GAUGE) * 100);

        if (window.CombatUI && CombatUI.updateGauges) {
            CombatUI.updateGauges(ctx, pPct, ePct);
        }

        // 5. 检查满条 (自动攻击逻辑)
        let actionHappened = false;

        // --- 玩家满条 ---
        if (ctx.gauges.player >= this.CONFIG.MAX_GAUGE) {
            // 保留溢出值 (模拟 CTB 机制，速度极快时不会亏损进度)
            ctx.gauges.player -= this.CONFIG.MAX_GAUGE;

            // 执行自动普攻
            // 注意：这里不再暂停等待 UI 输入，而是直接打出去
            const dmg = CombatCalc.performAttack(ctx, "你", pStats, eStats, true);
            ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg);

            // 触发行动后结算 (Buff/毒) - 谁动谁结算
            this._onTurnEnd(ctx, 'player');
            actionHappened = true;
        }

        // --- 敌人满条 ---
        if (ctx.gauges.enemy >= this.CONFIG.MAX_GAUGE) {
            ctx.gauges.enemy -= this.CONFIG.MAX_GAUGE;

            // 执行敌人 AI
            CombatAction.enemyAction(ctx, eStats, pStats);

            this._onTurnEnd(ctx, 'enemy');
            actionHappened = true;
        }

        // 6. 状态同步与胜负判定
        if (actionHappened) {
            ctx._syncPlayerStatus();
            ctx._updateUIStats();

            // 每次有人行动，检查一次死活
            if (ctx.currentEHp <= 0) {
                this.handleVictory(ctx);
                return; // 结束循环
            }
            if (ctx.currentPHp <= 0) {
                this.handleDefeat(ctx);
                return; // 结束循环
            }
        }

        // 7. 继续下一帧
        ctx.timer = setTimeout(() => this._tick(ctx), this.CONFIG.TICK_RATE);
    },

    /** 单个实体行动后的结算 (原回合结束逻辑) */
    _onTurnEnd: function(ctx, targetKey) {
        // 结算 Buff 持续时间 (回合数 -1)
        CombatAction.processBuffs(ctx, targetKey);

        // 结算毒伤
        if (targetKey === 'player') CombatAction.processPoisonOnPlayer(ctx);
        else CombatAction.processPoisonOnEnemy(ctx);
// --- 核心修复：添加以下代码 ---
        if (ctx._updateToxUI) {
            ctx._updateToxUI();
        }
        // 刷新技能/物品 CD (按行动次数减少)
        // 只有玩家行动时才刷新玩家 CD，或者你可以设定为全场时间刷新，这里按行动次数更符合回合制直觉
        if (targetKey === 'player') {
            for(let i=0; i<3; i++) if (ctx.itemCDs[i] > 0) ctx.itemCDs[i]--;
            for(let k in ctx.skillCDs) if (ctx.skillCDs[k] > 0) ctx.skillCDs[k]--;
            ctx._refreshItemCDUI();
            ctx._refreshSkillCDUI();
        }
    },

    // ================== 结算相关 (保持原有逻辑框架) ==================

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
        ctx.isEnded = true;
        if (window.player) {
            const rank = ctx.enemy.template || "minion";
            const gain = { "minion": 5, "elite": 10, "boss": 50, "lord": 100 }[rank] || 0;
            window.player.danger = Math.min(100, (window.player.danger || 0) + gain);
        }

        ctx._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`);

        const money = this._randomInt(ctx.enemy.money[0], ctx.enemy.money[1]);
        if (money > 0) { if (window.UtilsAdd) UtilsAdd.addMoney(money); else ctx.player.money += money; }

        const drops = this._calculateFinalDrops(ctx);

        console.log("原始掉落物:", drops);
        const realDrops = [];
        drops.forEach(d => {
            if (window.addItem) {
                // 执行添加，并捕获返回值 (假设 addItem 返回添加成功的对象，失败返回 null)
                const added = window.addItem(d.id, 1);
                if (added) {
                    // 标记是否为悬赏物品以便 UI 渲染
                    added.isBounty = d.isBounty;
                    realDrops.push(added);
                } else {
                    console.warn(`[CombatCore] 掉落物 ${d.id} 添加失败 (背包满或ID无效)`);
                }
            }
        });
        // ---【核心修复】结束 ---

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
        ctx.isEnded = true;
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
        // 通过调整 TICK_RATE 来改变速度
        let newRate = this.CONFIG.TICK_RATE;
        if (delta < 0) newRate = Math.max(10, newRate - 10); // 加速 (间隔变小)
        else newRate = Math.min(100, newRate + 10); // 减速 (间隔变大)

        this.CONFIG.TICK_RATE = newRate;

        const spdEl = document.getElementById('combat_speed_display');
        const baseFps = 1000 / 50; // 基准 20fps
        const currentFps = 1000 / newRate;
        const displaySpd = (currentFps / baseFps).toFixed(1);

        if(spdEl) spdEl.innerText = displaySpd + "x";
    },

    // --- 内部辅助 (保持不变) ---
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