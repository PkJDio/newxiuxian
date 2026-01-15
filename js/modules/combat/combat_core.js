// js/modules/combat/combat_core.js
// 职责：战斗流程管控、生命周期管理、胜负判定

const CombatCore = {
    /** 战斗主心跳循环 */
    runLoop: function(ctx) {
        if (ctx.isStopped || ctx.isPaused) return;

        let pStats = CombatCalc.getDynamicStats(ctx, 'player');
        let eStats = CombatCalc.getDynamicStats(ctx, 'enemy');

        if (ctx.currentTurn === 1) ctx._log(`<br>遭遇了 ${ctx.enemy.name} (HP: ${ctx.currentEHp})！<br>`);
        if (ctx.currentTurn > ctx.maxTurns) { ctx._log("双方罢兵..."); this.handleEnd(ctx, "平局"); return; }

        ctx._log(`<div class="turn-divider">--- 第 ${ctx.currentTurn} 回合 ---</div>`);

        // 回合起始处理
        for(let i=0; i<3; i++) if (ctx.itemCDs[i] > 0) ctx.itemCDs[i]--;
        for(let k in ctx.skillCDs) if (ctx.skillCDs[k] > 0) ctx.skillCDs[k]--;
        ctx._refreshItemCDUI(); ctx._refreshSkillCDUI();

        // 行动顺序判定
        const playerFirst = pStats.speed >= eStats.speed;
        let isWin = false; let isDead = false;

        if (playerFirst) {

            const dmg = CombatCalc.performAttack(ctx, "你", pStats, eStats, true);
            ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg); // <--- 防止负数

            if (ctx.currentEHp <= 0) isWin = true;
            else { CombatAction.enemyAction(ctx, eStats, pStats); if (ctx.currentPHp <= 0) isDead = true; }
        } else {
            CombatAction.enemyAction(ctx, eStats, pStats);
            if (ctx.currentPHp <= 0) isDead = true;
            else {

                const dmg = CombatCalc.performAttack(ctx, "你", pStats, eStats, true);
                ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg); // <--- 防止负数

                if (ctx.currentEHp <= 0) isWin = true;
            }
        }

        // 后置结算
        if (!isWin && !isDead) { isWin = CombatAction.processPoisonOnEnemy(ctx); isDead = CombatAction.processPoisonOnPlayer(ctx); }
        if (!isWin && !isDead) { CombatAction.processBuffs(ctx); if (ctx.currentPHp <= 0) isDead = true; if (ctx.currentEHp <= 0) isWin = true; }

        ctx.enemy.hp = ctx.currentEHp;
        ctx._syncPlayerStatus(); ctx._updateUIStats(); ctx._updateToxUI();

        if (isWin) { this.handleVictory(ctx); return; }
        if (isDead) { this.handleDefeat(ctx); return; }

        ctx.currentTurn++;
        ctx.timer = setTimeout(() => this.runLoop(ctx), ctx.turnSpeed);
    },

    /** 停止战斗逻辑 */
    stop: function(ctx) {
        if (ctx.options && ctx.options.canEscape === false) {
            if(window.showToast) window.showToast("强敌环伺，无路可退！");
            return;
        }
        ctx.isStopped = true; ctx.isEnded = true;
        if (ctx.timer) clearTimeout(ctx.timer);
        ctx._log(`<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">🏃 你看准时机，脚底抹油溜之大吉！</div>`);
        ctx._syncPlayerStatus();
        if (window.saveGame) window.saveGame();
        CombatUI.renderEnd(ctx, "逃跑");
        const footer = document.getElementById('map_combat_footer');
        if (footer) footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">关闭</button>`;
        ctx.clearCache();
    },

    /** 胜利结算 */
    handleVictory: function(ctx) {
        ctx.isEnded = true;
        // 1. 危险度逻辑
        if (window.player) {
            const rank = ctx.enemy.template || "minion";
            const gain = { "minion": 5, "elite": 10, "boss": 50, "lord": 100 }[rank] || 0;
            window.player.danger = Math.min(100, (window.player.danger || 0) + gain);
            window.player.need_kill = 0;
            // if (window.LogManager) window.LogManager.add(`[系统] 击杀${rank}级目标，当前危险度: ${window.player.danger}`);
        }

        ctx._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`);

        // 2. 奖励逻辑
        const money = ctx._randomInt(ctx.enemy.money[0], ctx.enemy.money[1]);
        if (money > 0) { if (window.UtilsAdd) UtilsAdd.addMoney(money); else ctx.player.money += money; }

        const drops = this._calculateFinalDrops(ctx);
        let rewardHtml = this._buildRewardHtml(ctx, money, drops);

        if (window.UtilsEnemy) UtilsEnemy.markDefeated(ctx.enemy.x, ctx.enemy.y);
        ctx._syncPlayerStatus();

        // 3. 连续战斗判断
        if (ctx.onWinCallback) {
            ctx.onWinCallback();
            // 如果是连续战斗且 options.isMultiWave 开启，则不渲染结算 UI
            if (ctx.options && ctx.options.isMultiWave) return;
        }

        if (window.saveGame) window.saveGame();
        CombatUI.renderEnd(ctx, "胜利", rewardHtml);
    },

    /** 失败结算 */
    handleDefeat: function(ctx) {
        ctx.isEnded = true;
        ctx._log(`<div style="color:red; font-weight:bold; margin-top:10px;">💀 战斗失败...</div>`);

        // 1. 渲染失败界面（界面变灰、停止动画，但不关闭）
        CombatUI.renderEnd(ctx, "失败");

        // 2. 生成底部按钮，但不要直接调用 closeModal
        const footer = document.getElementById('map_combat_footer');
        if (footer) {
            // 生成唯一ID，确保事件绑定正确
            const btnId = 'btn_defeat_confirm_' + Date.now();

            footer.innerHTML = `<button id="${btnId}" class="ink_btn_normal" style="width:100%; height:40px;">黯然离去</button>`;

            // 3. 绑定点击事件：点击后才真正执行结算
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.onclick = () => {
                    this._finalizeDefeat(ctx);
                };
            }
        }
    },

    /** * 【新增】内部方法：执行失败惩罚并关闭
     * (只有用户点击了“黯然离去”才会执行这里)
     */
    _finalizeDefeat: function(ctx) {
        // 1. 执行数值惩罚 (HP变为1, MP清空)
        if (window.player.status) {
            window.player.status.hp = 1;
            window.player.status.mp = 0;
        }

        // 2. 执行外部失败逻辑 (如掉落物品、传送到重生点等)
        if (window.UtilsFail && window.UtilsFail.onCombatDefeat) {
            window.UtilsFail.onCombatDefeat(ctx.enemy);
        }

        // 3. 关闭弹窗
        if (window.closeModal) window.closeModal();

        // 4. 清理战斗缓存
        ctx.clearCache();
    },

    togglePause: function(ctx) {
        if (ctx.isStopped || ctx.isEnded) return;
        ctx.isPaused = !ctx.isPaused;
        const btn = document.getElementById('combat_btn_pause');
        if (btn) btn.innerHTML = ctx.isPaused ? "▶ 继续战斗" : "⏸ 暂停";
        if (!ctx.isPaused) ctx._runCombatLoopAsync(); else if (ctx.timer) clearTimeout(ctx.timer);
    },

    changeSpeed: function(ctx, delta) {
        ctx.turnSpeed = Math.max(500, Math.min(3000, ctx.turnSpeed + delta));
        const spdEl = document.getElementById('combat_speed_display');
        if(spdEl) spdEl.innerText = (1000 / ctx.turnSpeed).toFixed(1) + "x";
    },

    syncStatus: function(ctx) { if(ctx.player.status) { ctx.player.status.hp = ctx.currentPHp; ctx.player.status.mp = ctx.currentPMp; } },
    canAct: function(ctx) { return !(ctx.isStopped || ctx.isEnded || ctx.isPaused); },
    handleEnd: function(ctx, type) { ctx.isEnded = true; ctx._syncPlayerStatus(); if (window.saveGame) window.saveGame(); CombatUI.renderEnd(ctx, type); },

    _calculateFinalDrops: function(ctx) {
        const drops = [];
        if (ctx.enemy.drops) ctx.enemy.drops.forEach(e => { if (Math.random() <= e.rate) drops.push({ id: e.id }); });
        // 悬赏掉落
        const bounty = this._checkBountyDrops(ctx);
        bounty.forEach(b => drops.push({ id: b.id, isBounty: true }));
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
        // ... (保持原有复杂掉落池筛选逻辑)
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
                let info = window.UtilsAdd ? UtilsAdd.addItem(d.id, 1, false) : {sid: d.id};
                let itemData = (Array.isArray(window.GAME_DB.items) ? window.GAME_DB.items.find(i=>i.id===d.id) : window.GAME_DB.items[d.id]);
                let name = itemData ? itemData.name : d.id;
                let extra = d.isBounty ? "border-color:#ff9800; background:#fff3e0; color:#e65100;" : "";
                h += `<span onmouseenter="TooltipManager.showItem(event, '${info.sid}')" onmouseleave="TooltipManager.hide()" onmousemove="TooltipManager._move(event)" style="cursor:help; background:#fff; border:1px solid #ccc; padding:2px 6px; font-size:12px; border-radius:3px; ${extra}">${d.isBounty?'✨ ':''}${name}</span>`;
            });
            h += `</div>`;
        }
        return h + `</div>`;
    }
};