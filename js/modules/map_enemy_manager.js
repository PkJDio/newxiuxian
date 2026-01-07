// js/modules/map_enemy_manager.js
// 地图敌人管理器 v1.0
// 职责：管理地图上怪物的生成、销毁、点击判定
console.log("加载 地图敌人管理器 (MapEnemyManager)");

const MapEnemyManager = {
    spawnConfig: {
        despawnDist: 60,
        scanRadius: 4,
    },

    // 更新怪物列表（生成新怪、移除远怪）
    update: function(px, py) {
        if (!window.GlobalEnemies) window.GlobalEnemies = [];
        if (!window.UtilsEnemy) return;

        const cfg = this.spawnConfig;

        // 1. 过滤掉过期的怪 (比如跨月了)
        if (window.player && window.player.time) {
            const currentTag = `${window.player.time.year}_${window.player.time.month}`;
            const prefix = `mob_${currentTag}_`;
            window.GlobalEnemies = window.GlobalEnemies.filter(e => {
                if (e.instanceId && e.instanceId.startsWith("mob_")) return e.instanceId.startsWith(prefix);
                return true;
            });
        }

        // 2. 移除距离过远的怪
        window.GlobalEnemies = window.GlobalEnemies.filter(e => {
            const dist = Math.abs(e.x - px) + Math.abs(e.y - py);
            return dist < cfg.despawnDist;
        });

        // 3. 在周围格子尝试生成新怪
        const pGx = Math.floor(px / 10);
        const pGy = Math.floor(py / 10);
        const r = cfg.scanRadius;

        for (let gx = pGx - r; gx <= pGx + r; gx++) {
            for (let gy = pGy - r; gy <= pGy + r; gy++) {
                if (Math.abs(gx - pGx) + Math.abs(gy - pGy) > r * 1.5) continue;

                // 检查该格子是否已经有怪
                const alreadyExists = window.GlobalEnemies.some(e => e.gx === gx && e.gy === gy);
                if (alreadyExists) continue;

                const newEnemy = UtilsEnemy.createRandomEnemy(gx * 10, gy * 10);
                if (newEnemy) window.GlobalEnemies.push(newEnemy);
            }
        }
    },

    // 检查是否有敌人被点击
    checkClick: function(clickX, clickY, cameraX, cameraY, tileSize, scale, canvasWidth, canvasHeight) {
        if (!window.GlobalEnemies) return null;

        const ts = tileSize * scale;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        for(let i = 0; i < window.GlobalEnemies.length; i++) {
            const enemy = window.GlobalEnemies[i];
            // 计算敌人在屏幕上的像素坐标
            const ex = (enemy.x - cameraX) * ts + centerX;
            const ey = (enemy.y - cameraY) * ts + centerY;

            // 点击判定范围 (25px)
            if (Math.abs(clickX - ex) < 25 && Math.abs(clickY - ey) < 25) {
                return enemy;
            }
        }
        return null;
    }
};

window.MapEnemyManager = MapEnemyManager;