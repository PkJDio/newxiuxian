// js/action/util_fish.js
// 垂钓核心逻辑 v10.0 (水草封锁机制 + 次数调整)

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

        // 【修改】熟练度配置：次数调整为 18/16/14/12
        MASTERY_TIERS: [
            { exp: 999, rate: 0.3, attempts: 18, hintProb: 1.0, name: "大成" },
            { exp: 400, rate: 0.2, attempts: 16, hintProb: 0.7, name: "进阶" },
            { exp: 100, rate: 0.1, attempts: 14, hintProb: 0.6, name: "入门" },
            { exp: 0,   rate: 0.0, attempts: 12, hintProb: 0.5, name: "初学" }
        ],

        GRID_COLS: 12,
        GRID_ROWS: 8,
        // 【新增】随机事件配置
        RANDOM_EVENTS: {
            // 祥瑞类 (Good)
            blessing: [
                { id: 'fish_god', name: '水神庇护', prob: 0.001, type: 'good', desc: '金鳞岂是池中物，本池接下来的下三次起竿必定中鱼！', effect: { buffCount: 3, forceFish: true } },
                { id: 'old_man',  name: '仙人指路', prob: 0.01,  type: 'good', desc: '偶遇神秘老者传授秘诀，本池的钓鱼次数恢复了3次。', effect: { addAttempts: 3 } },
                { id: 'tide',     name: '灵气潮汐', prob: 0.002, type: 'good', desc: '池中灵气暴涨，尚未翻开的鱼儿似乎发生了蜕变...未翻开的格子稀有度群体+1', effect: { upgradeRarity: true } },
                { id: 'net',      name: '一网打尽', prob: 0.002, type: 'good', desc: '灵力激荡，瞬间震落了周围的水纹，随机翻开4格。', effect: { revealArea: true, revealCount: 4 } },
                { id: 'koi',      name: '锦鲤附体', prob: 0.008, type: 'good', desc: '鸿运当头，本池接下来的接下来五次探查将看破迷雾，必定得到信息。', effect: { buffCount: 5, forceHint: true } },
                { id: 'time',     name: '时光溯游', prob: 0.004, type: 'good', desc: '神思游历太虚，疲惫与饥饿感竟消散了大半。', effect: { refundStats: 0.5 } }
            ],
            // 波折类 (Bad)
            calamity: [
                { id: 'thunder',  name: '惊鱼之灾', prob: 0.01,  type: 'bad',  desc: '旱天惊雷，胆小的鱼儿都被吓跑了，接下来两次怕是难有收获。', effect: { debuffCount: 2, forceEmpty: true } },
                { id: 'tangle',   name: '鱼线缠绕', prob: 0.015, type: 'bad',  desc: '哎呀，鱼线拧成了麻花，维修花费了不少时间，剩余次数-2。', effect: { addAttempts: -2 } },
                { id: 'muddy',    name: '浑水摸鱼', prob: 0.01,  type: 'bad',  desc: '泥沙翻涌，什么都看不清了，直觉彻底失效，接下来3次未中的话无法得知信息。', effect: { debuffCount: 3, hideHint: true } }
            ]
        }
    },
// 【新增】运行时状态
    eventStatus: {
        buffCount: 0,    // 正面状态剩余次数
        debuffCount: 0,  // 负面状态剩余次数
        activeBuffId: null,
        activeDebuffId: null
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
        // 【核心修改】：刷新鱼池时，重置所有临时 Buff/Debuff
        console.log("鱼池已重构，临时奇遇状态已清空");
        this.eventStatus = {
            buffCount: 0,
            debuffCount: 0,
            activeBuffId: null,
            activeDebuffId: null
        };
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
            let isHit = Math.random() < hitRate;
            let loot = null;

            if (isHit) {
                loot = this._rollFish(region, season);
                console.log(`[Fishing] 获取到稀有度 ${loot.rarity} 的鱼: ${loot.name}`)
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
    /**
     * 【新增】获取当前鱼池中存在的所有鱼种列表
     * 用于 UI 图鉴展示
     */
    getPondLootPool: function() {
        if (typeof fishes === 'undefined') return [];

        const p = window.player;
        const region = (p.coord ? p.coord.region : "all"); // 获取当前地区
        const season = this.getCurrentSeason(); // 获取当前季节

        // 从全局库 fishes 中筛选符合当前地区和季节的所有鱼
        const pool = fishes.filter(f => {
            const regionMatch = (f.region === "all" || f.region === region);
            const seasonMatch = (!f.seasons || f.seasons.includes(season));
            return regionMatch && seasonMatch;
        });

        // 稀有度从高到低排序 (6 -> 1)
        return pool.sort((a, b) => (b.rarity || 1) - (a.rarity || 1));
    },
    /**
     * 【核心修改】尝试翻牌逻辑，加入事件影响判定
     */
    tryFlip: function(index) {
        if (!this.gridState[index]) return { error: true, msg: "数据异常" };
        const cell = this.gridState[index];

        if (cell.isFlipped) return { error: true, msg: "已翻开" };
        if (cell.isBlocked) return { error: true, msg: "此处水草丛生，无法下竿" };
        if (this.currentAttempts <= 0) return { error: true, msg: "次数已尽" };

        // 消耗逻辑 (保持不变)
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

        // 如果有水神庇护 Buff
        if (this.eventStatus.buffCount > 0 && this.eventStatus.activeBuffId === 'fish_god') {
            forceFish = true;
            this.eventStatus.buffCount--;
            // 如果 Buff 耗尽，清除标记
            if (this.eventStatus.buffCount <= 0) this.eventStatus.activeBuffId = null;
        }

        // 如果有惊鱼之灾 Debuff
        if (this.eventStatus.debuffCount > 0 && this.eventStatus.activeDebuffId === 'thunder') {
            forceEmpty = true;
            this.eventStatus.debuffCount--;
            if (this.eventStatus.debuffCount <= 0) this.eventStatus.activeDebuffId = null;
        }

        // 执行翻牌
        cell.isFlipped = true;
        this.flippedCount++;
        this.currentAttempts--;

        let result = { success: false, loot: null, nearCount: 0, showHint: false, triggeredEvent: null };

        // 【核心修改】：判定最终是否有鱼
        // 规则：Buff 强制有鱼 > Debuff 强制没鱼 > 原始状态
        const finalHasFish = forceFish ? true : (forceEmpty ? false : cell.hasFish);

        if (finalHasFish) {
            // 如果是 Buff 强制生成的鱼，或者是原始有鱼但 loot 丢失的，立即生成鱼数据并写入格子
            if (!cell.hasFish || !cell.loot) {
                cell.hasFish = true; // 关键：修改格子原始状态，确保 UI 渲染正确
                cell.loot = this._rollFish(p.coord?.region || "all", this.getCurrentSeason());
                console.log(`[Buff生效] 强制生成鱼: ${cell.loot.name}`);
            }

            result.success = true;
            result.loot = cell.loot;

            if (window.UtilsAdd) window.UtilsAdd.addItem(cell.loot.id, 1);
            this._addFishingExp(1);
            this._updateFishHistory(cell.loot);

            // 鱼被钓走了，更新周围的数字提示
            this._updateAllHints();
        } else {
            // 【核心修改】：如果是因为 Debuff 导致的“本来有鱼变没鱼”，也需要修改格子状态
            if (cell.hasFish && forceEmpty) {
                cell.hasFish = false;
                cell.loot = null;
                console.log("[Debuff生效] 鱼儿遁走了");
                this._updateAllHints(); // 鱼跑了，提示也要变
            }

            result.nearCount = this._countSurroundingFish(index);
            const tier = this._getMasteryTier();

            // 锦鲤/浑水摸鱼的提示逻辑
            let showHint = Math.random() < tier.hintProb;
            if (this.eventStatus.activeBuffId === 'koi' && this.eventStatus.buffCount > 0) showHint = true;
            if (this.eventStatus.activeDebuffId === 'muddy' && this.eventStatus.debuffCount > 0) showHint = false;

            cell.hintRevealed = showHint;
            result.showHint = showHint;
        }

        // --- 随机事件滚动 ---
        // 只有在没有活跃 Buff/Debuff 时才滚动新事件，防止无限套娃
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
                    c.loot.rarity++; // 简单提升，实际可查库换 ID
                }
            });
        }
        if (eff.revealArea) {
            // 一网打尽：随机翻开 revealCount 个
            let availableIndices = [];
            this.gridState.forEach((c, i) => { if(!c.isFlipped && !c.isBlocked) availableIndices.push(i); });
            this._shuffleArray(availableIndices);
            const targets = availableIndices.slice(0, eff.revealCount);
            // 注意：这里由于直接修改状态，UI 需要 syncGrid
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
        console.log("Rarity: ", rarity)
        const filterPool = (r) => fishes.filter(f => {
            const regionMatch = (f.region === "all" || f.region === region);
            const seasonMatch = (!f.seasons || f.seasons.includes(season));
            const rarityMatch = f.rarity === r;
            return regionMatch && seasonMatch && rarityMatch;
        });

        let pool = filterPool(rarity);
        console.log("[Fish]pool1 ", pool)
        if (pool.length === 0 && (rarity === 5 || rarity === 6)) {
            rarity = 4;
            pool = filterPool(rarity);
        }

        if (pool.length === 0) return null;
        console.log("[Fish]pool4 ", pool)
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
        // 获取当前钓具数据
        const rodData = this._getEquippedRodData();
        return {
            levelName: tier.name,
            remainingFish: this.getRemainingFishCount(),
            attempts: this.currentAttempts,
            maxAttempts: this.maxAttempts,
            // 【新增】返回当前钓具的百分比加成
            rodBonus: rodData ? rodData.catchRate : 0
        };
    },

    getTotalCells: function() { return this.totalCells; }
};

window.UtilFish = UtilFish;