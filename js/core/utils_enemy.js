// js/core/utils_enemy.js
// 敌人生成工具类 v16.0 (重构版：分离随机逻辑与实例构建)

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
    SPAWN_RATE: 0.5,

    /**
     * 【重构核心】将原始模板转换为战斗实例数据
     * 无论来源是地图点击还是袭击事件，最终都统一调用此函数。
     */
    _buildEnemyInstance: function(template, x, y, instanceId = null) {
        if (!template) return null;

        const type = template.template || "minion";
        const style = TEMPLATE_STYLES[type] || TEMPLATE_STYLES["minion"];

        // 获取配置中的基础颜色
        let displayColor = "#333";

        if (window.ENEMY_TEMPLATES && ENEMY_TEMPLATES[type]) {
            displayColor = ENEMY_TEMPLATES[type].color;
        }

        const timeKey = this._getTimeKey();

        return {
            instanceId: instanceId || `raid_${timeKey}_${Math.floor(Math.random() * 10000)}`,
            id: template.id,
            name: template.name,
            template: type,
            timeStart: template.timeStart || 0,
            region: template.region,
            x: x,
            y: y,
            gx: Math.floor(x / 10),
            gy: Math.floor(y / 10),

            // 属性应用
            hp: template.stats.hp,
            maxHp: template.stats.hp,
            atk: template.stats.atk,
            def: template.stats.def,
            phy_atk: template.stats.phy_atk,
            mag_atk: template.stats.mag_atk,
            phy_def: template.stats.phy_def,
            mag_def: template.stats.mag_def,
            speed: template.stats.speed,

            // 毒性处理
            toxAtk: template.stats.toxicity || 0,
            toxicity: 0,

            exp: template.exp,
            money: template.money,
            drops: template.drops,
            desc: template.desc,

            // 技能拷贝
            skills: template.skills ? JSON.parse(JSON.stringify(template.skills)) : [],

            visual: {
                icon: (window.ENEMY_TEMPLATES && ENEMY_TEMPLATES[type]) ? ENEMY_TEMPLATES[type].icon : "💀",
                color: displayColor,
                scale: style.scale,
                shadowBlur: style.shadowBlur,
                shadowColor: style.shadowColor,
                displayName: style.prefix + template.name,
                zIndex: style.zIndex
            }
        };
    },

    /**
     * 地图随机生成：现在的逻辑只负责计算“谁应该出现”
     */
    createRandomEnemy: function(x, y) {
        const gx = Math.floor(x / 10);
        const gy = Math.floor(y / 10);

        if (this.isDefeated(gx, gy)) return null;

        const timeKey = this._getTimeKey();
        if (typeof RandomSystem === 'undefined') return null;

        const spawnRng = RandomSystem.get(gx, gy, timeKey, "spawn_chance");
        if (spawnRng > this.SPAWN_RATE) return null;

        if (!window.enemies || window.enemies.length === 0) return null;

        const checkX = gx * 10 + 5;
        const checkY = gy * 10 + 5;

        if (this._isInTown(checkX, checkY)) return null;

        const regionId = this._getRegionId(checkX, checkY);
        const isWater = this._isWater(checkX, checkY);
        const playerTimeStart = (window.player && window.player.timeStart !== undefined) ? window.player.timeStart : 0;

        // 筛选地理符合条件的模板
        const envCandidates = window.enemies.filter(e => {
            if (e.region !== 'all' && e.region !== regionId) return false;
            const isWaterMob = (e.spawnType === 'river' || e.spawnType === 'ocean');
            if (isWater) { if (!isWaterMob) return false; } else { if (isWaterMob) return false; }
            if ((e.timeStart || 0) > playerTimeStart) return false;
            return true;
        });

        if (envCandidates.length === 0) return null;

        // 随机阶级
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

        const candidates = envCandidates.filter(e => (e.template || "minion") === targetRank);
        const pool = candidates.length > 0 ? candidates : envCandidates;

        const indexRng = RandomSystem.get(gx, gy, timeKey, "enemy_select");
        const template = pool[Math.floor(indexRng * pool.length)];

        // 计算精确坐标
        const offX = Math.floor(RandomSystem.get(gx, gy, timeKey, "pos_off_x") * 10);
        const offY = Math.floor(RandomSystem.get(gx, gy, timeKey, "pos_off_y") * 10);

        // 调用统一构建函数
        return this._buildEnemyInstance(
            template,
            gx * 10 + offX,
            gy * 10 + offY,
            `mob_${timeKey}_${gx}_${gy}`
        );
    },

    /**
     * 【为袭击事件设计】根据级别获取袭击者
     */
    createEnemyByRank: function(rank) {
        if (!window.EVENT_RAID_ENEMIES || !window.EVENT_RAID_ENEMIES[rank]) {
            console.error("未找到事件敌人配置:", rank);
            return null;
        }

        const pool = window.EVENT_RAID_ENEMIES[rank];
        const template = pool[Math.floor(Math.random() * pool.length)];

        // 获取玩家当前坐标（如果没在地图上则默认为咸阳附近）
        const px = window.player?.x || 400;
        const py = window.player?.y || 300;

        // 直接调用统一构建函数
        return this._buildEnemyInstance(template, px, py);
    },

    // --- 以下辅助方法保持不变 ---
    _getRegionId: function(x, y) {
        const layout = (typeof REGION_LAYOUT !== 'undefined') ? REGION_LAYOUT : ((typeof SUB_REGIONS !== 'undefined') ? SUB_REGIONS : null);
        if (!layout) return "r_c";
        const region = layout.find(r => x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]);
        if (!region) return "unknown";
        const subX = Math.floor((x - region.x[0]) / 300);
        const subY = Math.floor((y - region.y[0]) / 300);
        return `${region.id}_${subX}_${subY}`;
    },
    _isInTown: function(x, y) {
        if (typeof WORLD_TOWNS === 'undefined') return false;
        return WORLD_TOWNS.some(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
    },
    _isWater: function(x, y) {
        if (typeof TERRAIN_ZONES === 'undefined') return false;
        return TERRAIN_ZONES.some(z => (z.type === 'river' || z.type === 'ocean') && x >= z.x[0] && x < z.x[1] && y >= z.y[0] && y < z.y[1]);
    },
    isDefeated: function(gx, gy) {
        if (!window.player || !window.player.defeatedEnemies) return false;
        const timeKey = this._getTimeKey();
        return !!window.player.defeatedEnemies[`kill_${timeKey}_${gx}_${gy}`];
    },
    markDefeated: function(x, y) {
        if (!window.player) return;
        if (!window.player.defeatedEnemies) window.player.defeatedEnemies = {};
        const gx = Math.floor(x / 10);
        const gy = Math.floor(y / 10);
        const timeKey = this._getTimeKey();
        window.player.defeatedEnemies[`kill_${timeKey}_${gx}_${gy}`] = true;
        this._cleanOldCache(timeKey);
        if(window.saveGame) window.saveGame();
    },
    _cleanOldCache: function(currentTimeKey) {
        if (!window.player.defeatedEnemies) return;
        Object.keys(window.player.defeatedEnemies).forEach(k => {
            if (!k.startsWith("kill_" + currentTimeKey)) delete window.player.defeatedEnemies[k];
        });
    },
    _getTimeKey: function() {
        if (window.player?.time) return `${window.player.time.year}_${window.player.time.month}`;
        return "1_1";
    }
};

window.UtilsEnemy = UtilsEnemy;