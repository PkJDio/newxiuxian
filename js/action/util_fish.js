// js/action/util_fish.js
// 垂钓核心逻辑 v9.0 (水草封锁机制 + 次数调整)

const UtilFish = {
    // ================= 配置区域 =================
    CONFIG: {
        COST_TIME: 1,
        COST_SATIETY: 10,
        COST_FATIGUE: 5,

        BASE_HIT_CHANCE: 0.2,
        BASE_RARITY_WEIGHTS: [100, 60, 30, 10, 5, 1],

        USE_TEXT_HINTS: true,
        HINT_TEXTS: [
            "死水微澜<br>寂静无声",
            "偶见涟漪<br>似有孤鱼",
            "水纹微动<br>鱼影绰绰",
            "波光粼粼<br>暗流涌动",
            "水花轻溅<br>鱼群往来",
            "浪涌频现<br>鱼跃欢腾",
            "水沸鱼腾<br>热闹非凡",
            "群鱼争食<br>水面翻涌",
            "万鱼朝宗<br>满塘皆活"
        ],

        // 【修改】熟练度配置：次数调整为 25/20/16/12
        MASTERY_TIERS: [
            { exp: 999, rate: 0.3, attempts: 25, hintProb: 1.0, name: "大成" },
            { exp: 400, rate: 0.2, attempts: 20, hintProb: 0.7, name: "进阶" },
            { exp: 100, rate: 0.1, attempts: 16, hintProb: 0.6, name: "入门" },
            { exp: 0,   rate: 0.0, attempts: 12, hintProb: 0.5, name: "初学" }
        ],

        GRID_COLS: 12,
        GRID_ROWS: 8,
    },

    flippedCount: 0,
    totalCells: 96,
    gridState: [],

    currentAttempts: 0,
    maxAttempts: 12,

    init: function() {
        this.totalCells = this.CONFIG.GRID_COLS * this.CONFIG.GRID_ROWS;
        if (!this.gridState || this.gridState.length !== this.totalCells) {
            this.refreshPond();
        }
    },

    refreshPond: function() {
        this.flippedCount = 0;
        this.gridState = [];

        const tier = this._getMasteryTier();
        this.maxAttempts = tier.attempts;
        this.currentAttempts = this.maxAttempts;

        const p = window.player;
        const region = (p.coord ? p.coord.region : "all");
        const season = this.getCurrentSeason();
        const hitRate = this.calculateHitRate();

        let hasHighRarityFish = false; // 标记是否有 R4+ 鱼

        // 1. 生成基础网格
        for (let i = 0; i < this.totalCells; i++) {
            const isHit = Math.random() < hitRate;
            let loot = null;

            if (isHit) {
                loot = this._rollFish(region, season);
                if (!loot) isHit = false;

                // 检查稀有度
                if (loot && loot.rarity >= 4) {
                    hasHighRarityFish = true;
                }
            }

            this.gridState.push({
                hasFish: isHit,
                loot: loot,
                nearCount: 0,
                isFlipped: false,
                hintRevealed: false,
                isBlocked: false // 【新增】封锁状态
            });
        }

        // 2. 【新增】水草封锁逻辑
        if (hasHighRarityFish) {
            // 随机 4-6 个
            const blockCount = Math.floor(Math.random() * 3) + 4;

            // 筛选候选格子：(无鱼) 或 (鱼稀有度 <= 3)
            const candidates = [];
            for (let i = 0; i < this.totalCells; i++) {
                const cell = this.gridState[i];
                if (!cell.hasFish) {
                    candidates.push(i);
                } else if (cell.loot && cell.loot.rarity <= 3) {
                    candidates.push(i);
                }
            }

            // 洗牌并选取
            this._shuffleArray(candidates);
            for (let i = 0; i < Math.min(blockCount, candidates.length); i++) {
                const idx = candidates[i];
                this.gridState[idx].isBlocked = true;
                // console.log(`[Fishing] 格子 ${idx} 被水草封锁`);
            }
        }

        // 3. 计算周围雷数
        this._updateAllHints();

        console.log(`[Fishing] 池塘刷新: 次数=${this.maxAttempts}, 高级鱼=${hasHighRarityFish}`);
    },

    // 内部洗牌算法
    _shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

    // 计算周围鱼数 (排除 blocked 格子里的鱼吗？通常扫雷逻辑是不排除的，这里暂不排除，保持逻辑一致)
    // 之前逻辑是：只计算"未翻开"的鱼。这里保持不变。
    _countSurroundingFish: function(index) {
        const cols = this.CONFIG.GRID_COLS;
        const rows = this.CONFIG.GRID_ROWS;
        const x = index % cols;
        const y = Math.floor(index / cols);
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    const nIndex = ny * cols + nx;
                    if (this.gridState[nIndex].hasFish && !this.gridState[nIndex].isFlipped) {
                        count++;
                    }
                }
            }
        }
        return count;
    },

    _updateAllHints: function() {
        for (let i = 0; i < this.totalCells; i++) {
            if (!this.gridState[i].hasFish) {
                this.gridState[i].nearCount = this._countSurroundingFish(i);
            }
        }
    },

    tryFlip: function(index) {
        if (!this.gridState[index]) return { error: true, msg: "数据异常" };
        const cell = this.gridState[index];

        if (cell.isFlipped) return { error: true, msg: "已翻开" };
        // 【新增】封锁检查
        if (cell.isBlocked) return { error: true, msg: "此处水草丛生，无法下竿" };

        if (this.currentAttempts <= 0) {
            return { error: true, msg: "本次尝试次数已用尽" };
        }

        const p = window.player;
        const curSat = (p.status && p.status.hunger) || 0;
        const curFat = (p.status && p.status.fatigue) || 0;
        const maxFat = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;

        if (curSat < this.CONFIG.COST_SATIETY) return { error: true, msg: "饱食度不足" };
        if (curFat + this.CONFIG.COST_FATIGUE > maxFat) return { error: true, msg: "精神困顿" };

        if (p.status) {
            p.status.hunger = Math.max(0, curSat - this.CONFIG.COST_SATIETY);
            p.status.fatigue = Math.min(maxFat, curFat + this.CONFIG.COST_FATIGUE);
        }
        if (window.TimeSystem && window.TimeSystem.passTime) window.TimeSystem.passTime(this.CONFIG.COST_TIME);

        // --- 执行翻牌 ---
        cell.isFlipped = true;
        this.flippedCount++;
        this.currentAttempts--;

        let result = {
            success: false,
            loot: null,
            nearCount: 0,
            showHint: false,
            attemptsLeft: this.currentAttempts,
            isPondEmpty: false
        };

        if (cell.hasFish && cell.loot) {
            result.success = true;
            result.loot = cell.loot;
            if (window.UtilsAdd) window.UtilsAdd.addItem(cell.loot.id, 1);
            this._addFishingExp(1);
            this._updateAllHints(); // 钓走鱼后更新全场提示
        } else {
            result.success = false;
            cell.nearCount = this._countSurroundingFish(index); // 即使没鱼也要更新一下当前格子的计数
            result.nearCount = cell.nearCount;

            const tier = this._getMasteryTier();
            if (Math.random() < tier.hintProb) {
                cell.hintRevealed = true;
                result.showHint = true;
            } else {
                cell.hintRevealed = false;
                result.showHint = false;
            }
        }

        if (this.currentAttempts <= 0) {
            result.isPondEmpty = true;
        }

        return result;
    },

    calculateHitRate: function() {
        const tier = this._getMasteryTier();
        return Math.min(1.0, this.CONFIG.BASE_HIT_CHANCE + tier.rate);
    },

    _getMasteryTier: function() {
        const p = window.player;
        const exp = (p.lifeSkills && p.lifeSkills.fishing) ? p.lifeSkills.fishing.exp : 0;
        for (let tier of this.CONFIG.MASTERY_TIERS) {
            if (exp >= tier.exp) return tier;
        }
        return this.CONFIG.MASTERY_TIERS[this.CONFIG.MASTERY_TIERS.length - 1];
    },

    _getEquippedRodData: function() {
        const p = window.player;
        const id = (p.equipment && p.equipment.fishing_rod) ? p.equipment.fishing_rod : null;
        if (!id) return null;
        if (typeof fishingRods === 'undefined') return null;
        const data = fishingRods.find(r => r.id === id);
        return data ? { catchRate: (data.effects ? data.effects.catchRate : 0) } : null;
    },

    _rollFish: function(region, season) {
        if (typeof fishes === 'undefined') return null;

        let rarity = this._rollRarity();
        const filterPool = (r) => fishes.filter(f => {
            const regionMatch = (f.region === "all" || f.region === region);
            const seasonMatch = (!f.seasons || f.seasons.includes(season));
            const rarityMatch = f.rarity === r;
            return regionMatch && seasonMatch && rarityMatch;
        });

        let pool = filterPool(rarity);
        if (pool.length === 0 && (rarity === 5 || rarity === 6)) {
            rarity = 4;
            pool = filterPool(rarity);
        }

        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    _rollRarity: function() {
        let weights = [...this.CONFIG.BASE_RARITY_WEIGHTS];
        const rodData = this._getEquippedRodData();
        if (rodData && rodData.catchRate > 0) {
            const r = rodData.catchRate;
            weights[2] += r * 0.5;
            weights[3] += r * 0.3;
            weights[4] += r * 0.1;
            weights[5] += r * 0.05;
        }

        const totalW = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalW;
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) return i + 1;
        }
        return 1;
    },

    _addFishingExp: function(amt) {
        if (!window.player.lifeSkills) window.player.lifeSkills = {};
        if (!window.player.lifeSkills.fishing) window.player.lifeSkills.fishing = { exp: 0 };
        window.player.lifeSkills.fishing.exp += amt;
    },

    getCurrentSeason: function() {
        const month = (window.player.time && window.player.time.month) ? window.player.time.month : 1;
        if (month >= 3 && month <= 5) return 0;
        if (month >= 6 && month <= 8) return 1;
        if (month >= 9 && month <= 11) return 2;
        return 3;
    },

    getRemainingFishCount: function() {
        if (!this.gridState) return 0;
        let count = 0;
        for (let cell of this.gridState) {
            if (cell.hasFish && !cell.isFlipped) {
                count++;
            }
        }
        return count;
    },

    getInfo: function() {
        const tier = this._getMasteryTier();
        return {
            levelName: tier.name,
            remainingFish: this.getRemainingFishCount(),
            attempts: this.currentAttempts,
            maxAttempts: this.maxAttempts
        };
    },

    getTotalCells: function() { return this.totalCells; }
};

window.UtilFish = UtilFish;