// js/core/utils_enemy.js
// 敌人生成工具类 v15.0 (环境感知 + 进度控制 timeStart)
console.log("加载 敌人生成系统 (UtilsEnemy v15 - Progression)");

// 1. 阶级生成权重
const RANK_PROBS = {
    "minion": 0.60,
    "elite":  0.29,
    "boss":   0.10,
    "lord":   0.01
};

// 2. 视觉表现配置
const TEMPLATE_STYLES = {
    "minion": { scale: 1.0, shadowBlur: 5, shadowColor: "rgba(0, 0, 0, 0.2)", prefix: "", zIndex: 1 },
    "elite": { scale: 1.3, shadowBlur: 15, shadowColor: "rgba(74, 144, 226, 0.7)", prefix: "【精英】", zIndex: 2 },
    "boss": { scale: 1.6, shadowBlur: 25, shadowColor: "rgba(144, 19, 254, 0.8)", prefix: "【头目】", zIndex: 3 },
    "lord": { scale: 2.2, shadowBlur: 40, shadowColor: "rgba(208, 2, 27, 0.9)", prefix: "【领主】", zIndex: 4 }
};

const UtilsEnemy = {
    SPAWN_RATE: 0.3,

    /**
     * 【核心】在大地图指定网格生成一个确定性的敌人
     */
    createRandomEnemy: function(x, y) {
        const gx = Math.floor(x / 10);
        const gy = Math.floor(y / 10);

        // 1. 检查击杀记录
        if (this.isDefeated(gx, gy)) return null;

        const timeKey = this._getTimeKey();
        if (typeof RandomSystem === 'undefined') {
            console.error("缺少 RandomSystem");
            return null;
        }

        // 2. 随机生成判定
        const spawnRng = RandomSystem.get(gx, gy, timeKey, "spawn_chance");
        if (spawnRng > this.SPAWN_RATE) return null;

        if (!window.enemies || window.enemies.length === 0) return null;

        const checkX = gx * 10 + 5;
        const checkY = gy * 10 + 5;

        // 3. 安全区检测
        if (this._isInTown(checkX, checkY)) return null;

        // 4. 环境检测
        const regionId = this._getRegionId(checkX, checkY);
        const isWater = this._isWater(checkX, checkY);

        // 5. 【新增】获取玩家当前的时间进度 (timeStart)
        // 从 player 对象中读取，如果没有则默认为 0 (游戏初期)
        const playerTimeStart = (window.player && window.player.timeStart !== undefined) ? window.player.timeStart : 0;

        // 6. 筛选候选怪物
        const envCandidates = window.enemies.filter(e => {
            // A. 区域匹配
            if (e.region !== 'all' && e.region !== regionId) return false;

            // B. 水陆匹配
            const isWaterMob = (e.spawnType === 'river' || e.spawnType === 'ocean');
            if (isWater) {
                if (!isWaterMob) return false; // 水里必须是水怪
            } else {
                if (isWaterMob) return false; // 陆地不能是水怪
            }

            // C. 【核心修改】时间/进度匹配
            // 怪物的 timeStart 必须 <= 玩家的 timeStart 才能生成
            // 例如：玩家处于阶段0，不能刷出阶段1的怪
            const enemyTime = e.timeStart || 0;
            if (enemyTime > playerTimeStart) return false;

            return true;
        });

        // 如果没有符合条件的怪，直接返回
        if (envCandidates.length === 0) return null;

        // 7. 决定阶级 (Rank)
        const rankRoll = RandomSystem.get(gx, gy, timeKey, "rank_roll");
        let targetRank = "minion";
        let cumulative = 0;
        for (let rank in RANK_PROBS) {
            cumulative += RANK_PROBS[rank];
            if (rankRoll < cumulative) {
                targetRank = rank;
                break;
            }
        }

        // 8. 筛选对应阶级
        const candidates = envCandidates.filter(e => (e.template || "minion") === targetRank);
        const pool = candidates.length > 0 ? candidates : envCandidates; // 兜底

        // 9. 具体抽取
        const indexRng = RandomSystem.get(gx, gy, timeKey, "enemy_select");
        const template = pool[Math.floor(indexRng * pool.length)];

        // 10. 网格内偏移
        const offX = Math.floor(RandomSystem.get(gx, gy, timeKey, "pos_off_x") * 10);
        const offY = Math.floor(RandomSystem.get(gx, gy, timeKey, "pos_off_y") * 10);
        const finalX = gx * 10 + offX;
        const finalY = gy * 10 + offY;

        // 11. 视觉属性
        const type = template.template || "minion";
        const style = TEMPLATE_STYLES[type] || TEMPLATE_STYLES["minion"];

        // let displayColor = template.color || "#333";
        // if (displayColor.toLowerCase() === "#fff" || displayColor.toLowerCase() === "#ffffff") {
        //     displayColor = "#444";
        // }
        // console.log("生成怪物:", template)
        let displayColor = template.template? ENEMY_TEMPLATES[template.template].color:"#333";

        return {
            instanceId: `mob_${timeKey}_${gx}_${gy}`,
            id: template.id,
            name: template.name,
            template: type,
            // 传递怪物配置里的 timeStart，供 MapCamera 刷新逻辑使用(如果需要)
            timeStart: template.timeStart || 0,

            x: finalX,
            y: finalY,
            gx: gx,
            gy: gy,

            hp: template.stats.hp,
            maxHp: template.stats.hp,
            atk: template.stats.atk,
            def: template.stats.def,
            speed: template.stats.speed,

            exp: template.exp,
            money: template.money,
            drops: template.drops,
            desc: template.desc,

            visual: {
                icon: template.icon || "💀",
                color: displayColor,
                scale: style.scale,
                shadowBlur: style.shadowBlur,
                shadowColor: style.shadowColor,
                displayName: style.prefix + template.name,
                zIndex: style.zIndex
            }
        };
    },

    _getRegionId: function(x, y) {
        // 优先使用 REGION_LAYOUT (data_world.js 常用命名)
        const layout = (typeof REGION_LAYOUT !== 'undefined') ? REGION_LAYOUT :
            ((typeof SUB_REGIONS !== 'undefined') ? SUB_REGIONS : null);

        if (!layout) return "r_c";

        const region = layout.find(r =>
            x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]
        );

        if (!region) return "unknown";

        const localX = x - region.x[0];
        const localY = y - region.y[0];
        const subX = Math.floor(localX / 300);
        const subY = Math.floor(localY / 300);

        return `${region.id}_${subX}_${subY}`;
    },

    _isInTown: function(x, y) {
        if (typeof WORLD_TOWNS === 'undefined') return false;
        return WORLD_TOWNS.some(t =>
            x >= t.x && x < t.x + t.w &&
            y >= t.y && y < t.y + t.h
        );
    },

    _isWater: function(x, y) {
        if (typeof TERRAIN_ZONES === 'undefined') return false;
        const zone = TERRAIN_ZONES.find(z =>
            (z.type === 'river' || z.type === 'ocean') &&
            x >= z.x[0] && x < z.x[1] &&
            y >= z.y[0] && y < z.y[1]
        );
        return !!zone;
    },

    isDefeated: function(gx, gy) {
        if (!window.player || !window.player.defeatedEnemies) return false;
        const timeKey = this._getTimeKey();
        const key = `kill_${timeKey}_${gx}_${gy}`;
        return !!window.player.defeatedEnemies[key];
    },

    markDefeated: function(x, y) {
        if (!window.player) return;
        if (!window.player.defeatedEnemies) window.player.defeatedEnemies = {};

        const gx = Math.floor(x / 10);
        const gy = Math.floor(y / 10);
        const timeKey = this._getTimeKey();
        const key = `kill_${timeKey}_${gx}_${gy}`;

        window.player.defeatedEnemies[key] = true;
        console.log(`[UtilsEnemy] ✅ 记录击杀: ${key}`);

        this._cleanOldCache(timeKey);
        if(window.saveGame) window.saveGame();
    },

    _cleanOldCache: function(currentTimeKey) {
        if (!window.player.defeatedEnemies) return;
        const keys = Object.keys(window.player.defeatedEnemies);
        keys.forEach(k => {
            if (!k.startsWith("kill_" + currentTimeKey)) delete window.player.defeatedEnemies[k];
        });
    },

    _getTimeKey: function() {
        if (window.player && window.player.time) {
            return `${window.player.time.year}_${window.player.time.month}`;
        }
        return "1_1";
    }
};

window.UtilsEnemy = UtilsEnemy;