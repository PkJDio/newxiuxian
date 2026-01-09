// js/core/utils_enemy.js
// 敌人生成工具类 v15.3 (修复：分离中毒状态(toxicity)与毒性攻击(toxAtk))
console.log("加载 敌人生成系统 (UtilsEnemy v15.3 - Field Separation)");

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

    createRandomEnemy: function(x, y) {
        const gx = Math.floor(x / 10);
        const gy = Math.floor(y / 10);

        if (this.isDefeated(gx, gy)) return null;

        const timeKey = this._getTimeKey();
        if (typeof RandomSystem === 'undefined') {
            console.error("缺少 RandomSystem");
            return null;
        }

        const spawnRng = RandomSystem.get(gx, gy, timeKey, "spawn_chance");
        if (spawnRng > this.SPAWN_RATE) return null;

        if (!window.enemies || window.enemies.length === 0) return null;

        const checkX = gx * 10 + 5;
        const checkY = gy * 10 + 5;

        if (this._isInTown(checkX, checkY)) return null;

        const regionId = this._getRegionId(checkX, checkY);
        const isWater = this._isWater(checkX, checkY);
        const playerTimeStart = (window.player && window.player.timeStart !== undefined) ? window.player.timeStart : 0;

        const envCandidates = window.enemies.filter(e => {
            if (e.region !== 'all' && e.region !== regionId) return false;
            const isWaterMob = (e.spawnType === 'river' || e.spawnType === 'ocean');
            if (isWater) { if (!isWaterMob) return false; } else { if (isWaterMob) return false; }
            const enemyTime = e.timeStart || 0;
            if (enemyTime > playerTimeStart) return false;
            return true;
        });

        if (envCandidates.length === 0) return null;

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

        const offX = Math.floor(RandomSystem.get(gx, gy, timeKey, "pos_off_x") * 10);
        const offY = Math.floor(RandomSystem.get(gx, gy, timeKey, "pos_off_y") * 10);
        const finalX = gx * 10 + offX;
        const finalY = gy * 10 + offY;

        const type = template.template || "minion";
        const style = TEMPLATE_STYLES[type] || TEMPLATE_STYLES["minion"];
        let displayColor = template.template ? ENEMY_TEMPLATES[template.template].color : "#333";

        return {
            instanceId: `mob_${timeKey}_${gx}_${gy}`,
            id: template.id,
            name: template.name,
            template: type,
            timeStart: template.timeStart || 0,
            region: template.region,
            x: finalX,
            y: finalY,
            gx: gx,
            gy: gy,

            hp: template.stats.hp,
            maxHp: template.stats.hp,
            atk: template.stats.atk,
            def: template.stats.def,
            speed: template.stats.speed,

            // 【核心修复】分离字段
            // toxAtk: 攻击附带的毒性 (固定属性)
            toxAtk: template.stats.toxicity || 0,
            // toxicity: 当前已中毒深度 (状态值，初始为0)
            toxicity: 0,

            exp: template.exp,
            money: template.money,
            drops: template.drops,
            desc: template.desc,
            // 【关键修复】拷贝技能列表
            skills: template.skills ? JSON.parse(JSON.stringify(template.skills)) : [] ,
            visual: {
                icon: ENEMY_TEMPLATES[template.template].icon || "💀",
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
        const layout = (typeof REGION_LAYOUT !== 'undefined') ? REGION_LAYOUT :
            ((typeof SUB_REGIONS !== 'undefined') ? SUB_REGIONS : null);
        if (!layout) return "r_c";
        const region = layout.find(r => x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]);
        if (!region) return "unknown";
        const localX = x - region.x[0];
        const localY = y - region.y[0];
        const subX = Math.floor(localX / 300);
        const subY = Math.floor(localY / 300);
        return `${region.id}_${subX}_${subY}`;
    },

    _isInTown: function(x, y) {
        if (typeof WORLD_TOWNS === 'undefined') return false;
        return WORLD_TOWNS.some(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
    },

    _isWater: function(x, y) {
        if (typeof TERRAIN_ZONES === 'undefined') return false;
        const zone = TERRAIN_ZONES.find(z => (z.type === 'river' || z.type === 'ocean') && x >= z.x[0] && x < z.x[1] && y >= z.y[0] && y < z.y[1]);
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