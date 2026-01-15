// js/core/utils_fail.js
const UtilsFail = {
    onCombatDefeat: function(enemy) {
        if (window.closeModal) window.closeModal();
        setTimeout(() => {
            console.log("[UtilsFail] 开始处理战败后果...");
            if (!window.player) return;

            // 1. 扣钱逻辑 (立即执行，不用等弹窗)
            const lostMoney = Math.floor((window.player.money || 0) / 2);
            window.player.money -= lostMoney;
            console.log(`[UtilsFail] 玩家钱财变动：损失 ${lostMoney}, 剩余 ${window.player.money}`);

            if (window.LogManager) {
                window.LogManager.add(`你在与 <span style="color:#d32f2f;">${enemy.name}</span> 的对决中惨败，丢失了 <span style="color:#f57f17;">${lostMoney}</span> 文钱财。`);
            }

            // 2. 死亡判定 (如果触发死亡，直接走死亡流程，后续的战败弹窗就不弹了)
            const NEAR_DEATH_ID = "buff_near_death";
            const DYING_MARK_ID = "debuff_dying_mark";

            const hasNearDeath = window.player.buffs && window.player.buffs[NEAR_DEATH_ID];
            const hasDyingMark = window.player.buffs && window.player.buffs[DYING_MARK_ID];

            if (hasNearDeath || hasDyingMark) {
                console.warn("[UtilsFail] 触发死亡判定流程");

                let deathReason = "伤势过重，旧疾复发，终是无力回天。";
                let deathTitle = "身死道消";

                if (hasDyingMark) {
                    deathTitle = "绝境陨落";
                    deathReason = `在与强敌 <span style="color:#d32f2f; font-weight:bold;">${enemy.name}</span> 的殊死搏斗中不幸落败。`;
                }

                const contentHtml = `
                <div style="padding: 10px 0;">
                    <div style="font-size: 60px; margin-bottom: 20px;">💀</div>
                    <p style="font-size: 18px; margin-bottom: 10px; color:#444;">${deathReason}</p>
                    <div style="background:#eee; padding:10px; border-radius:4px; font-size:14px; color:#666; margin-top:10px;">
                        <p>肉身已毁，灵台崩塌。</p>
                        <p>请点击下方按钮，开启轮回转世。</p>
                    </div>
                </div>
            `;

                if (window.showDeathModal) {
                    window.showDeathModal(deathTitle, contentHtml, () => {
                        if (window.performDirectRebirth) window.performDirectRebirth();
                    });
                } else {
                    if (window.performDirectRebirth) window.performDirectRebirth();
                }
                return; // 【关键】死亡了就结束，不走下面的战败流程
            }

            // ==========================================
            // 3. 战败弹窗 (玩家没死，弹出战败确认)
            // ==========================================
            const defeatContent = `
            <div style="padding: 15px 0;">
                <div style="font-size: 50px; margin-bottom: 15px; opacity: 0.6;">🤕</div>
                <p style="font-weight:bold; margin-bottom: 10px;">技不如人，败下阵来。</p>
                <p style="font-size:16px; color:#666;">不仅丢失了 <span style="color:#f57f17; font-weight:bold;">${lostMoney}</span> 文钱财，<br>还受了极重的内伤...</p>
            </div>
        `;
            setTimeout(() => {
                if (window.showDefeatModal) {
                    window.showDefeatModal("败走麦城", defeatContent, () => {
                        // 用户点击“黯然离去”后，执行后续逻辑
                        this._executeSurvivalPenalty();
                    });
                } else {
                    // 保底：如果没有弹窗方法，直接执行
                    this._executeSurvivalPenalty();
                }
            }, 500);
        }, 300);




    },

    // 内部方法：执行存活后的惩罚 (加Buff + 传送)
    _executeSurvivalPenalty: function() {
        // 3. 添加濒死 Buff
        console.log("[UtilsFail] 尝试添加濒死 Buff");
        const NEAR_DEATH_ID = "buff_near_death";
        if (window.addBuff) {
            window.addBuff(NEAR_DEATH_ID, {
                name: "濒死",
                attr: "状态",
                val: "重伤",
                days: 7,
                source: "战斗失败",
                isDebuff: true,
                desc: "你刚从鬼门关回来，身体极度虚弱。若在此期间再次重伤，恐有性命之忧。"
            });
        }

        if(window.showToast) window.showToast("受到重创，进入【濒死】状态！");

        // 4. 执行传送
        console.log("[UtilsFail] 准备执行城镇传送...");
        this.teleportToNearestTown();

        if (window.saveGame) window.saveGame();
    },

    teleportToNearestTown: function() {
        const playerPos = window.player.coord || { x: 0, y: 0 };
        const townData = window.WORLD_TOWNS || {};
        const towns = Object.values(townData);

        let nearestTown = null;
        let minDistance = Infinity;

        towns.forEach(t => {
            if (t.level === 'city' || t.level === 'town' || t.level === 'village') {
                const centerX = t.x + (t.w / 2);
                const centerY = t.y + (t.h / 2);
                const dx = centerX - playerPos.x;
                const dy = centerY - playerPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDistance) {
                    minDistance = dist;
                    nearestTown = t;
                }
            }
        });

        if (nearestTown) {
            const targetX = Math.floor(nearestTown.x + (nearestTown.w / 2));
            const targetY = Math.floor(nearestTown.y + (nearestTown.h / 2));

            window.player.coord.x = targetX;
            window.player.coord.y = targetY;

            if (window.updateUI) window.updateUI();
            if (window.MapView && window.MapView.render) window.MapView.render();
            if (window.MapCamera && window.MapCamera.update) window.MapCamera.update();

            // 自动关闭战斗窗口并尝试进入客栈
            setTimeout(() => {
                // if (window.closeModal) window.closeModal();
                if (window.Inn && typeof window.Inn.enter === 'function') {
                    window.Inn.enter(nearestTown);
                }
            }, 500); // 稍微快一点进客栈，因为弹窗已经拖延了时间
        } else {
            console.error("[UtilsFail] 无法找到任何合法的城镇进行传送！");
        }
    }
};

window.UtilsFail = UtilsFail;