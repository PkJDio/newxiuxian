// js/core/utils_fail.js
const UtilsFail = {
    onCombatDefeat: function(enemy) {
        console.log("[UtilsFail] 开始处理战败后果...");
        if (!window.player) {
            console.error("[UtilsFail] 错误：window.player 不存在");
            return;
        }

        // 1. 扣钱逻辑
        const lostMoney = Math.floor((window.player.money || 0) / 2);
        window.player.money -= lostMoney;
        console.log(`[UtilsFail] 玩家钱财变动：损失 ${lostMoney}, 剩余 ${window.player.money}`);

        if (window.LogManager) {
            window.LogManager.add(`你在与 <span style="color:#d32f2f;">${enemy.name}</span> 的对决中惨败，丢失了 <span style="color:#f57f17;">${lostMoney}</span> 文钱财。`);
        }

        // 2. 濒死判定
        const NEAR_DEATH_ID = "buff_near_death";
        if (window.player.buffs && window.player.buffs[NEAR_DEATH_ID]) {
            console.warn("[UtilsFail] 检测到已有濒死 Buff，执行最终死亡流程");
            if (window.LogManager) window.LogManager.add(`<span style="color:#d32f2f; font-weight:bold;">伤势过重，你支撑不住倒了下去...</span>`);
            if (window.attemptDie) {
                setTimeout(() => window.attemptDie(), 800);
            }
            return;
        }

        // 3. 添加濒死 Buff
        console.log("[UtilsFail] 尝试添加濒死 Buff");
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

        // 4. 执行传送
        console.log("[UtilsFail] 准备执行城镇传送...");
        this.teleportToNearestTown();

        if (window.saveGame) window.saveGame();
    },

    teleportToNearestTown: function() {
        const playerPos = window.player.coord || { x: 0, y: 0 };
        console.log(`[UtilsFail] 当前位置: x=${playerPos.x}, y=${playerPos.y}`);

        // 兼容不同的世界数据源
        const townData = window.WORLD_TOWNS || {};
        const towns = Object.values(townData);

        console.log(`[UtilsFail] 扫描到 ${towns.length} 个地图对象`);

        let nearestTown = null;
        let minDistance = Infinity;

        towns.forEach(t => {
            // 确保只传送到城镇/村庄，排除野外点
            if (t.level === 'city' || t.level === 'town' || t.level === 'village') {
                // 计算当前城镇的中心点，用于更准确的距离判定
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
            // 计算中心点坐标：左上角坐标 + 宽高的一半
            const targetX = Math.floor(nearestTown.x + (nearestTown.w / 2));
            const targetY = Math.floor(nearestTown.y + (nearestTown.h / 2));

            console.log(`[UtilsFail] 锁定最近城镇: ${nearestTown.name}，移动至中心点: (${targetX}, ${targetY})`);

            // 瞬移至中心位置
            window.player.coord.x = targetX;
            window.player.coord.y = targetY;

            // UI 刷新
            if (window.updateUI) window.updateUI();
            if (window.MapView && window.MapView.render) window.MapView.render();
            if (window.MapCamera && window.MapCamera.update) window.MapCamera.update();

            // 自动关闭战斗窗口并尝试进入客栈
            setTimeout(() => {
                if (window.closeModal) window.closeModal();
                // 传送完成后自动打开客栈界面
                if (window.Inn && typeof window.Inn.enter === 'function') {
                    window.Inn.enter(nearestTown);
                }
            }, 1500);
        } else {
            console.error("[UtilsFail] 无法找到任何合法的城镇进行传送！请检查 window.WORLD_TOWNS 数据");
        }
    }
};

window.UtilsFail = UtilsFail;