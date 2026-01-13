/**
 * js/core/utils_transmit.js
 * 地图相关工具类 v1.0
 */

let UtilsTransmit = {
    // 基础：计算两点距离
    getDistance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    // 核心功能：传送到最近的城镇/村庄 (用于战败重生等)
    teleportToNearestTown: function() {
        const player = window.player;
        if (!player || !player.coord) return;

        const playerPos = player.coord;
        // console.log(`[UtilsMap] 正在寻找最近城镇... 当前位置: (${playerPos.x}, ${playerPos.y})`);

        // 兼容不同的世界数据源
        const townData = window.WORLD_TOWNS || [];
        // 如果是对象格式转数组，如果是数组直接用
        const towns = Array.isArray(townData) ? townData : Object.values(townData);

        let nearestTown = null;
        let minDistance = Infinity;

        towns.forEach(t => {
            // 排除野外点，只保留城镇村庄
            if (t.level === 'city' || t.level === 'town' || t.level === 'village') {
                // 计算中心点距离
                const centerX = t.x + (t.w / 2);
                const centerY = t.y + (t.h / 2);
                const dist = this.getDistance(centerX, centerY, playerPos.x, playerPos.y);

                if (dist < minDistance) {
                    minDistance = dist;
                    nearestTown = t;
                }
            }
        });

        if (nearestTown) {
            const targetX = Math.floor(nearestTown.x + (nearestTown.w / 2));
            const targetY = Math.floor(nearestTown.y + (nearestTown.h / 2));

            // console.log(`[UtilsMap] 锁定最近: ${nearestTown.name}, 距离: ${Math.floor(minDistance)}`);

            // 1. 修改坐标
            player.coord.x = targetX;
            player.coord.y = targetY;

            // 2. 刷新地图相关的UI
            if (window.updateUI) window.updateUI();
            if (window.MapView && window.MapView.render) window.MapView.render();
            if (window.MapCamera && window.MapCamera.update) window.MapCamera.update();

            // 3. 尝试自动进入客栈 (给玩家一种被救回来的感觉)
            // 延迟一点执行，防止弹窗冲突
            setTimeout(() => {
                if (window.closeModal) window.closeModal();
                if (window.InnShop && typeof window.InnShop.enter === 'function') {
                    if (window.showToast) window.showToast(`你被好心人救回了 ${nearestTown.name} 的客栈...`);
                    window.InnShop.enter(nearestTown);
                }
            }, 500);

            return nearestTown;
        } else {
            console.error("[UtilsMap] 未找到有效城镇数据！");
            return null;
        }
    },

    // 辅助：获取某个方向上最近的N个城镇
    // direction: 'north'(上/北), 'south'(下/南), 'west'(左/西), 'east'(右/东)
    getTownsInDirection: function(currentTown, direction, limit = 3) {
        if (!window.WORLD_TOWNS) return [];
        const towns = Array.isArray(window.WORLD_TOWNS) ? window.WORLD_TOWNS : Object.values(window.WORLD_TOWNS);

        // 当前城镇中心
        const cx = currentTown.x + currentTown.w / 2;
        const cy = currentTown.y + currentTown.h / 2;

        // 筛选符合方向的城镇
        const candidates = towns.filter(t => {
            if (t.id === currentTown.id) return false; // 排除自己
            // 排除非聚落点 (如副本点)
            if (!['city', 'town', 'village'].includes(t.level)) return false;

            const tx = t.x + t.w / 2;
            const ty = t.y + t.h / 2;

            // 简单的方向判定 (以 45度角为界)
            const dx = tx - cx;
            const dy = ty - cy;

            // 阈值：防止纯垂直/水平判定过于严格
            switch(direction) {
                case 'north': return dy < 0 && Math.abs(dx) < Math.abs(dy); // y更小(向上)，且横向偏差小于纵向
                case 'south': return dy > 0 && Math.abs(dx) < Math.abs(dy);
                case 'west':  return dx < 0 && Math.abs(dy) < Math.abs(dx);
                case 'east':  return dx > 0 && Math.abs(dy) < Math.abs(dx);
                default: return false;
            }
        });

        // 计算距离并排序
        const result = candidates.map(t => {
            const tx = t.x + t.w / 2;
            const ty = t.y + t.h / 2;
            const dist = this.getDistance(cx, cy, tx, ty);
            return { town: t, dist: dist };
        });

        result.sort((a, b) => a.dist - b.dist);

        return result.slice(0, limit);
    }
};

window.UtilsTransmit = UtilsTransmit;