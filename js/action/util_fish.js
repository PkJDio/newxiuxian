// js/action/util_fish.js
// 垂钓核心逻辑 v11.0 (适配新版技艺等级 Lv.0-10)

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

        GRID_COLS: 12,
        GRID_ROWS: 8,

        // 随机事件配置 (保持不变)
        RANDOM_EVENTS: {
            blessing: [
                { id: 'fish_god', name: '水神庇护', prob: 0.001, type: 'good', desc: '金鳞岂是池中物，本池接下来的下三次起竿必定中鱼！', effect: { buffCount: 3, forceFish: true } },
                { id: 'old_man',  name: '仙人指路', prob: 0.01,  type: 'good', desc: '偶遇神秘老者传授秘诀，本池的钓鱼次数恢复了3次。', effect: { addAttempts: 3 } },
                { id: 'tide',     name: '灵气潮汐', prob: 0.002, type: 'good', desc: '池中灵气暴涨，尚未翻开的鱼儿似乎发生了蜕变...未翻开的格子稀有度群体+1', effect: { upgradeRarity: true } },
                { id: 'net',      name: '一网打尽', prob: 0.002, type: 'good', desc: '灵力激荡，瞬间震落了周围的水纹，随机翻开4格。', effect: { revealArea: true, revealCount: 4 } },
                { id: 'koi',      name: '锦鲤附体', prob: 0.008, type: 'good', desc: '鸿运当头，本池接下来的接下来五次探查将看破迷雾，必定得到信息。', effect: { buffCount: 5, forceHint: true } },
                { id: 'time',     name: '时光溯游', prob: 0.004, type: 'good', desc: '神思游历太虚，疲惫与饥饿感竟消散了大半。', effect: { refundStats: 0.5 } }
            ],
            calamity: [
                { id: 'thunder',  name: '惊鱼之灾', prob: 0.01,  type: 'bad',  desc: '旱天惊雷，胆小的鱼儿都被吓跑了，接下来两次怕是难有收获。', effect: { debuffCount: 2, forceEmpty: true } },
                { id: 'tangle',   name: '鱼线缠绕', prob: 0.015, type: 'bad',  desc: '哎呀，鱼线拧成了麻花，维修花费了不少时间，剩余次数-2。', effect: { addAttempts: -2 } },
                { id: 'muddy',    name: '浑水摸鱼', prob: 0.01,  type: 'bad',  desc: '泥沙翻涌，什么都看不清了，直觉彻底失效，接下来3次未中的话无法得知信息。', effect: { debuffCount: 3, hideHint: true } }
            ]
        }
    },

    // 运行时状态
    eventStatus: {
        buffCount: 0,
        debuffCount: 0,
        activeBuffId: null,
        activeDebuffId: null
    },
    flippedCount: 0,
    totalCells: 96,
    gridState: [],

    currentAttempts: 0,
    maxAttempts: 12,

    // 【新增】获取基于等级的属性加成
    _getStats: function() {
        let level = 0;
        if (window.UtilsLifeSkills) {
            level = UtilsLifeSkills.getLevel('fishing');
        }

        // 公式化配置
        // Lv0: 12次, +0%几率, 50%提示
        // Lv10: 18次, +30%几率, 100%提示
        return {
            level: level,
            // 次数：12 ~ 18
            attempts: 12 + Math.floor(level * 0.8),
            // 命中率加成：0 ~ 0.3
            rateBonus: level * 0.03,
            // 提示概率：0.5 ~ 1.0
            hintProb: 0.5 + (level * 0.05)
        };
    },

    init: function() {
        this.totalCells = this.CONFIG.GRID_COLS * this.CONFIG.GRID_ROWS;
        if (!this.gridState || this.gridState.length !== this.totalCells) {
            this.refreshPond();
        }
    },

    refreshPond: function() {
        console.log("鱼池已重构，临时奇遇状态已清空");
        this.eventStatus = {
            buffCount: 0,
            debuffCount: 0,
            activeBuffId: null,
            activeDebuffId: null
        };
        this.flippedCount = 0;
        this.gridState = [];

        // 【修改】从新版逻辑获取最大次数
        const stats = this._getStats();
        this.maxAttempts = stats.attempts;
        this.currentAttempts = this.maxAttempts;

        const p = window.player;
        const region = (p.coord ? p.coord.region : "all");
        const season = this.getCurrentSeason();
        const hitRate = this.calculateHitRate(); // 内部会调用 _getStats

        let hasHighRarityFish = false;

        // 1. 生成基础网格
        for (let i = 0; i < this.totalCells; i++) {
            let isHit = Math.random() < hitRate;
            let loot = null;

            if (isHit) {
                loot = this._rollFish(region, season);
                if (!loot) isHit = false;
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
                isBlocked: false
            });
        }

        // 2. 水草封锁逻辑
        if (hasHighRarityFish) {
            const blockCount = Math.floor(Math.random() * 3) + 4;
            const candidates = [];
            for (let i = 0; i < this.totalCells; i++) {
                const cell = this.gridState[i];
                if (!cell.hasFish) {
                    candidates.push(i);
                } else if (cell.loot && cell.loot.rarity <= 3) {
                    candidates.push(i);
                }
            }
            this._shuffleArray(candidates);
            for (let i = 0; i < Math.min(blockCount, candidates.length); i++) {
                const idx = candidates[i];
                this.gridState[idx].isBlocked = true;
            }
        }

        // 3. 计算周围雷数
        this._updateAllHints();
        console.log(`[Fishing] 池塘刷新: 次数=${this.maxAttempts}, 高级鱼=${hasHighRarityFish}`);
    },

    _shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },

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

    getPondLootPool: function() {
        if (typeof fishes === 'undefined') return [];
        const p = window.player;
        const region = (p.coord ? p.coord.region : "all");
        const season = this.getCurrentSeason();
        const pool = fishes.filter(f => {
            const regionMatch = (f.region === "all" || f.region === region);
            const seasonMatch = (!f.seasons || f.seasons.includes(season));
            return regionMatch && seasonMatch;
        });
        return pool.sort((a, b) => (b.rarity || 1) - (a.rarity || 1));
    },

    tryFlip: function(index) {
        if (!this.gridState[index]) return { error: true, msg: "数据异常" };
        const cell = this.gridState[index];

        if (cell.isFlipped) return { error: true, msg: "已翻开" };
        if (cell.isBlocked) return { error: true, msg: "此处水草丛生，无法下竿" };
        if (this.currentAttempts <= 0) return { error: true, msg: "次数已尽" };

        const p = window.player;
        const curSat = (p.status && p.status.hunger) || 0;
        const curFat = (p.status && p.status.fatigue) || 0;
        const maxFat = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;
        if (curSat < this.CONFIG.COST_SATIETY) return { error: true, msg: "饱食度不足" };
        if (curFat + this.CONFIG.COST_FATIGUE > maxFat) return { error: true, msg: "精神困顿" };

        p.status.hunger = Math.max(0, curSat - this.CONFIG.COST_SATIETY);
        p.status.fatigue = Math.min(maxFat, curFat + this.CONFIG.COST_FATIGUE);
        if (window.TimeSystem) window.TimeSystem.passTime(this.CONFIG.COST_TIME);

        // --- 判定状态影响 ---
        let forceFish = false;
        let forceEmpty = false;

        if (this.eventStatus.buffCount > 0 && this.eventStatus.activeBuffId === 'fish_god') {
            forceFish = true;
            this.eventStatus.buffCount--;
            if (this.eventStatus.buffCount <= 0) this.eventStatus.activeBuffId = null;
        }

        if (this.eventStatus.debuffCount > 0 && this.eventStatus.activeDebuffId === 'thunder') {
            forceEmpty = true;
            this.eventStatus.debuffCount--;
            if (this.eventStatus.debuffCount <= 0) this.eventStatus.activeDebuffId = null;
        }

        cell.isFlipped = true;
        this.flippedCount++;
        this.currentAttempts--;

        let result = { success: false, loot: null, nearCount: 0, showHint: false, triggeredEvent: null };
        const finalHasFish = forceFish ? true : (forceEmpty ? false : cell.hasFish);

        if (finalHasFish) {
            if (!cell.hasFish || !cell.loot) {
                cell.hasFish = true;
                cell.loot = this._rollFish(p.coord?.region || "all", this.getCurrentSeason());
            }

            result.success = true;
            result.loot = cell.loot;

            if (window.UtilsAdd) window.UtilsAdd.addItem(cell.loot.id, 1);

            // 【修改】调用新版经验接口 (每次+1)
            this._addFishingExp(1);

            this._updateFishHistory(cell.loot);
            this._updateAllHints();
        } else {
            if (cell.hasFish && forceEmpty) {
                cell.hasFish = false;
                cell.loot = null;
                this._updateAllHints();
            }

            result.nearCount = this._countSurroundingFish(index);

            // 【修改】使用新版概率判定
            const stats = this._getStats();
            let showHint = Math.random() < stats.hintProb;

            if (this.eventStatus.activeBuffId === 'koi' && this.eventStatus.buffCount > 0) showHint = true;
            if (this.eventStatus.activeDebuffId === 'muddy' && this.eventStatus.debuffCount > 0) showHint = false;

            cell.hintRevealed = showHint;
            result.showHint = showHint;

            // 没钓到鱼也给 1 点经验
            this._addFishingExp(1);
        }

        if (this.eventStatus.buffCount <= 0 && this.eventStatus.debuffCount <= 0) {
            result.triggeredEvent = this._rollRandomEvent();
        }

        if (this.currentAttempts <= 0) result.isPondEmpty = true;
        return result;
    },

    _rollRandomEvent: function() {
        const events = this.CONFIG.RANDOM_EVENTS;
        const allEvents = [...events.blessing, ...events.calamity];
        const r = Math.random();
        let cumulative = 0;

        for (let event of allEvents) {
            cumulative += event.prob;
            if (r < cumulative) {
                this._applyEventEffect(event);
                return event;
            }
        }
        return null;
    },

    _applyEventEffect: function(event) {
        const eff = event.effect;
        const p = window.player;

        if (eff.addAttempts) this.currentAttempts = Math.max(0, this.currentAttempts + eff.addAttempts);
        if (eff.buffCount) {
            this.eventStatus.buffCount = eff.buffCount;
            this.eventStatus.activeBuffId = event.id;
        }
        if (eff.debuffCount) {
            this.eventStatus.debuffCount = eff.debuffCount;
            this.eventStatus.activeDebuffId = event.id;
        }
        if (eff.refundStats) {
            p.status.hunger = Math.min(p.derived.hungerMax, p.status.hunger + (p.derived.hungerMax * eff.refundStats));
            p.status.fatigue = Math.max(0, p.status.fatigue - (p.derived.fatigueMax * eff.refundStats));
        }
        if (eff.upgradeRarity) {
            this.gridState.forEach(c => {
                if (c.hasFish && c.loot && c.loot.rarity < 6 && !c.isFlipped) {
                    c.loot.rarity++;
                }
            });
        }
        if (eff.revealArea) {
            let availableIndices = [];
            this.gridState.forEach((c, i) => { if(!c.isFlipped && !c.isBlocked) availableIndices.push(i); });
            this._shuffleArray(availableIndices);
            const targets = availableIndices.slice(0, eff.revealCount);
            targets.forEach(idx => {
                const c = this.gridState[idx];
                c.isFlipped = true;
                if(c.hasFish) {
                    if (window.UtilsAdd) window.UtilsAdd.addItem(c.loot.id, 1);
                    this._updateFishHistory(c.loot);
                }
            });
            this._updateAllHints();
        }
    },

    _updateFishHistory: function(loot) {
        if (!player.fishHistory) player.fishHistory = {};
        if (!player.fishHistory[loot.id]) player.fishHistory[loot.id] = { nums: 0 };
        player.fishHistory[loot.id].nums++;
        if(window.saveGame) window.saveGame();
    },

    calculateHitRate: function() {
        const stats = this._getStats();
        return Math.min(1.0, this.CONFIG.BASE_HIT_CHANCE + stats.rateBonus);
    },

    _getEquippedRodData: function() {
        const p = window.player;
        const data = (p.equipment && p.equipment.fishing_rod) ? p.equipment.fishing_rod : null;
        if (!data) return null;

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

    // 【修改】统一经验接口
    _addFishingExp: function(amt) {
        if (window.UtilsLifeSkills) {
            UtilsLifeSkills.addExp('fishing', amt);
        }
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
        const stats = this._getStats();
        const rodData = this._getEquippedRodData();

        // 【新增】生成标准化的等级名称 (如 Lv.3 略有小成)
        let levelName = "Lv.0 未入门";
        if (window.UtilsLifeSkills) {
            const realmNames = ["初窥门径", "略有小成", "融会贯通", "登峰造极", "返璞归真"];
            const idx = Math.min(Math.floor(stats.level / 3), realmNames.length - 1);
            levelName = `Lv.${stats.level} ${realmNames[idx]}`;
        }

        return {
            levelName: levelName,
            remainingFish: this.getRemainingFishCount(),
            attempts: this.currentAttempts,
            maxAttempts: this.maxAttempts,
            rodBonus: rodData ? rodData.catchRate : 0
        };
    },

    getTotalCells: function() { return this.totalCells; }
};

window.UtilFish = UtilFish;