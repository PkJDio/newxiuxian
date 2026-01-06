// js/core/utils_enemy.js
// 敌人生成工具类 v2.1 (带缓存记录 + 调试日志)
console.log("加载 敌人生成系统 (Debug版)");

const UtilsEnemy = {
    // 基础生成率 (0.05 代表 5%，你可以调高这个数值测试，比如 0.5)
    SPAWN_RATE: 0.05,

    /**
     * 在指定网格尝试生成敌人
     */
    generate: function(gx, gy, inTown, hasWater, terrainType = 'wild') {
        // 0. 安全检查
        if (!window.player || !window.RandomSystem || !window.enemies) {
            // console.warn("UtilsEnemy: 缺少必要依赖 (player/RandomSystem/enemies)");
            return null;
        }

        // 1. 获取当前时间 (月份)
        const currentMonth = (player.time.year * 12 + player.time.month) || 0;

        // 【新增】2. 检查缓存：该位置本月是否已击杀过？
        if (this.isDefeated(gx, gy, currentMonth)) {
            // console.log(`[Enemy] ${gx},${gy} 本月已击杀，跳过`);
            return null;
        }

        // 3. 概率检查
        const spawnRng = RandomSystem.get(gx, gy, currentMonth, "enemy_spawn");

        // 调试：只打印极少数日志防止刷屏，或者当你修改概率时可以取消注释
        // if (gx === 135 && gy === 135) console.log("中心点概率:", spawnRng, "阈值:", this.SPAWN_RATE);

        if (spawnRng > this.SPAWN_RATE) return null;

        // 4. 区域判定与筛选
        const worldX = gx * 10;
        const worldY = gy * 10;
        const regionId = this._getRegionId(worldX, worldY);

        const candidates = this._filterEnemies(regionId, inTown, hasWater, terrainType, currentMonth);

        if (candidates.length === 0) {
            // console.log(`[Enemy] ${gx},${gy} 触发生成但无匹配敌人 (Region: ${regionId})`);
            return null;
        }

        // 5. 抽取结果
        const pickRng = RandomSystem.get(gx, gy, currentMonth, "enemy_pick");
        const index = Math.floor(pickRng * candidates.length);
        const enemy = candidates[index];

        // console.log(`[Enemy] 生成成功: ${enemy.name} at [${gx},${gy}]`);
        return enemy;
    },

    /**
     * 【新增】检查是否已击杀
     */
    isDefeated: function(gx, gy, month) {
        if (!player.defeatedEnemies) return false;
        const key = `${gx}_${gy}_${month}`;
        return !!player.defeatedEnemies[key];
    },

    /**
     * 【新增】标记为已击杀 (战斗胜利后调用)
     * 调用方式: UtilsEnemy.markDefeated(gx, gy);
     */
    markDefeated: function(gx, gy) {
        if (!player) return;
        if (!player.defeatedEnemies) player.defeatedEnemies = {};

        const currentMonth = (player.time.year * 12 + player.time.month) || 0;
        const key = `${gx}_${gy}_${currentMonth}`;

        player.defeatedEnemies[key] = true;
        console.log(`[Enemy] 标记击杀: ${key}`);

        // 触发保存防止SL大法
        if(window.saveGame) window.saveGame();
    },

    /**
     * 内部筛选逻辑
     */
    _filterEnemies: function(regionId, inTown, hasWater, terrainType, currentMonth) {
        let spawnTypeCheck = terrainType;
        if (inTown) spawnTypeCheck = 'city';
        if (hasWater && spawnTypeCheck !== 'ocean') spawnTypeCheck = 'river';

        return window.enemies.filter(e => {
            // 简单阶段检查 (这里默认全部开放，你可以加逻辑)
            // if (e.timeStart > currentMonth / 12) return false;

            // 区域匹配
            if (e.region !== 'all' && e.region !== regionId) return false;

            // 地形匹配
            if (e.spawnType === 'all') return true;
            if (inTown) return e.spawnType === 'city' || e.spawnType === 'village';
            if (hasWater) return e.spawnType === 'river' || e.spawnType === 'ocean';
            return e.spawnType === spawnTypeCheck;
        });
    },

    _getRegionId: function(x, y) {
        if (typeof REGION_LAYOUT === 'undefined') return "r_c";
        const region = REGION_LAYOUT.find(r =>
            x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]
        );
        if (!region) return "r_c";

        const localX = x - region.x[0];
        const localY = y - region.y[0];
        const sX = Math.floor(localX / 300);
        const sY = Math.floor(localY / 300);
        return `${region.id}_${sX}_${sY}`;
    }
};

window.UtilsEnemy = UtilsEnemy;