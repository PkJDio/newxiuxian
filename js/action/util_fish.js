// js/action/util_fish.js
// 垂钓核心逻辑 v4.1 (精细化速度控制 + 稀有度倍率)

const UtilFish = {
    // ================= 配置区域 =================
    CONFIG: {
        COST_STAMINA: 5,
        TENSION_DECAY: 1.5,
        TENSION_RISE: 2.0,
        STAMINA_DROP: 0.5,
        ESCAPE_RISE: 1.0,
        ESCAPE_DROP: 0.5,
        UPDATE_RATE: 20,

        // --- 核心速度设置 ---
        // 建议值：3.0 到 10.0 之间。数值越大，移动越快。
        // 你现在的 BASE_MOVE_SPEED: 0.5 太小了，因为逻辑里是用 除法，导致结果巨大（移动极慢）
        MOVE_SPEED_LEVEL: 7.0,
        // R1 = 1.0倍, R6 = 2.5倍
        SPEED_MULT_MIN: 1.0,
        SPEED_MULT_MAX: 2.5,

        BASE_BITE_CHANCE: 0.3,
    },

    state: "IDLE",
    gameTimer: null,
    loopTimer: null,
    fishStamina: 100,
    fishEscapeProgress: 0,
    lineTension: 0,
    fishStrength: 1,
    isReeling: false,
    currentLoot: null,
    currentMoveSpeed: 6.0, // 记录当前鱼的实际移动速度

    reset: function() {
        this.state = "IDLE";
        this.lineTension = 0;
        this.fishStamina = 100;
        this.fishEscapeProgress = 0;
        this.isReeling = false;
        this.currentLoot = null;
        this._clearTimers();
        if (window.UIFish) window.UIFish.resetView();
    },

    handleSceneClick: function() {
        if (this.state === "RESULT") { this.reset(); return; }
        if (this.state === "IDLE") this._doCastLine();
        else if (this.state === "HOOKED") this._doHookFish();
    },

    _doCastLine: function() {
        const p = window.player;
        // 获取 UI 上的开关状态
        const skipGame = document.getElementById('skip_fish_game')?.checked || false;

        // 【修改】根据是否跳过决定消耗时间
        const timeCost = skipGame ? 2 : 1;

        if (window.TimeSystem && window.TimeSystem.passTime) {
            window.TimeSystem.passTime(timeCost);
        }

        const region = p.coord ? p.coord.region : "all";
        const season = this._getCurrentSeason();
        const rod = this._getEquippedRodData();
        const rodRateBonus = (rod.catchRate || 0) * 0.01;
        let biteChance = this.CONFIG.BASE_BITE_CHANCE + rodRateBonus;
        biteChance = Math.min(1.0, biteChance);

        this.state = "WAITING";
        if (window.UIFish) window.UIFish.onCastLine();

        const isSuccessfulBite = Math.random() < biteChance;
        const waitTime = skipGame ? 500 : (2000 + Math.random() * 3000); // 跳过游戏时缩短等待感

        this.gameTimer = setTimeout(() => {
            if (isSuccessfulBite) {
                this.currentLoot = this._getRandomFish(region, season);
                if (this.currentLoot) {
                    // --- 【核心修改点】 ---
                    if (skipGame) {
                        // 如果跳过游戏：咬钩即代表成功，直接结算
                        this._finishGame(true);
                    } else {
                        // 正常游戏：触发咬钩提醒，等待玩家反应
                        this._triggerBite();
                    }
                } else {
                    this._finishGame(false, "此地水灵枯竭，鱼儿皆已远去...");
                }
            } else {
                this._finishGame(false, "寒江寂寂，终无鱼儿上钩...");
            }
        }, waitTime);
    },

    _triggerBite: function() {
        if (this.state !== "WAITING") return;
        this.state = "HOOKED";

        // 【修改点】获取当前鱼的稀有度并传给 UI 层
        const rarity = this.currentLoot ? this.currentLoot.rarity : 1;
        if (window.UIFish) window.UIFish.onBite(rarity);

        // 根据稀有度设置反应时间
        let reactionTime = 5000;
        if (rarity === 3) reactionTime = 4000;
        else if (rarity === 4) reactionTime = 3000;
        else if (rarity >= 5) reactionTime = 2000;

        this.gameTimer = setTimeout(() => {
            if (this.state === "HOOKED") {
                this._finishGame(false, "鱼儿机警，已衔饵遁入深潭！");
            }
        }, reactionTime);
    },

    _doHookFish: function() {
        if (this.state !== "HOOKED") return;
        this._clearTimers();
        this.state = "REELING";

        const rarity = this.currentLoot ? this.currentLoot.rarity : 1;
        this.fishStrength = 0.4 + (rarity * 0.4) + Math.random() * 0.5;
        this.lineTension = 40;
        this.fishEscapeProgress = 0;

        // --- 重新设计计算公式 ---
        const rarityFactor = (Math.min(6, rarity) - 1) / 5;
        const speedMultiplier = this.CONFIG.SPEED_MULT_MIN + (rarityFactor * (this.CONFIG.SPEED_MULT_MAX - this.CONFIG.SPEED_MULT_MIN));

        // 最终动画时长(秒) = 15 / (基础速度等级 * 稀有度倍率)
        // 这样 MOVE_SPEED_LEVEL 越大，分母越大，时长越短，速度就越快！
        this.currentMoveSpeed = 15 / (this.CONFIG.MOVE_SPEED_LEVEL * speedMultiplier);

        if (window.UIFish) window.UIFish.onReelingStart();

        this.loopTimer = setInterval(() => {
            this._gameLoop();
        }, this.CONFIG.UPDATE_RATE);
    },

    _gameLoop: function() {
        if (this.isReeling) this.lineTension += this.CONFIG.TENSION_RISE;
        else this.lineTension -= this.CONFIG.TENSION_DECAY;
        this.lineTension += (Math.random() - 0.5) * this.fishStrength;
        this.lineTension = Math.max(0, this.lineTension);

        if (this.lineTension >= 100) {
            this._finishGame(false, "崩！劲道过猛，鱼线断了！");
            return;
        }

        const safeZoneEl = document.getElementById('ink_safe_zone');
        let isInSafeZone = false;
        if (safeZoneEl) {
            const parentWidth = safeZoneEl.parentElement.offsetWidth;
            const zoneLeftPct = (safeZoneEl.offsetLeft / parentWidth) * 100;
            const zoneWidthPct = (safeZoneEl.offsetWidth / parentWidth) * 100;
            const zoneRightPct = zoneLeftPct + zoneWidthPct;
            if (this.lineTension >= zoneLeftPct && this.lineTension <= zoneRightPct) isInSafeZone = true;
        }

        if (isInSafeZone) {
            this.fishStamina -= this.CONFIG.STAMINA_DROP;
            this.fishEscapeProgress = Math.max(0, this.fishEscapeProgress - (this.CONFIG.ESCAPE_DROP * this.CONFIG.UPDATE_RATE / 1000));
        } else {
            this.fishEscapeProgress += (this.CONFIG.ESCAPE_RISE * this.CONFIG.UPDATE_RATE / 1000);
        }

        if (this.fishEscapeProgress >= 10) {
            this._finishGame(false, "挣扎太久，鱼儿挣脱鱼钩逃走了！");
            return;
        }
        if (this.fishStamina <= 0) { this._finishGame(true); return; }

        if (window.UIFish) window.UIFish.updateReeling(this.lineTension, this.fishStamina, this.fishEscapeProgress);
    },

    _finishGame: function(isWin, failReason) {
        this._clearTimers();
        this.state = "RESULT";
        if (isWin && this.currentLoot) {
            this._addFishingExp(this.currentLoot.rarity || 1);
            if (window.UtilsAdd) window.UtilsAdd.addItem(this.currentLoot.id, 1);
            LogManager.add(`【鱼儿】你钓到 <span class="text_item quality_${this.currentLoot.rarity}">${this.currentLoot.name}</span>！`);
            if (window.UIFish) window.UIFish.onResult(true, this.currentLoot);
        } else {
            if (window.UIFish) window.UIFish.onResult(false, failReason || "鱼儿逃之夭夭...");
        }
    },

    _addFishingExp: function(amt) {
        if (!window.player.lifeSkills) window.player.lifeSkills = {};
        if (!window.player.lifeSkills.fishing) window.player.lifeSkills.fishing = { exp: 0 };
        window.player.lifeSkills.fishing.exp += amt;
    },

    getFishingLevelData: function() {
        const exp = (window.player.lifeSkills && window.player.lifeSkills.fishing) ? window.player.lifeSkills.fishing.exp : 0;
        if (exp >= 999) return { name: "大成", width: 35 };
        if (exp >= 400) return { name: "进阶", width: 30 };
        if (exp >= 100) return { name: "入门", width: 25 };
        return { name: "未入门", width: 20 };
    },

    _getCurrentSeason: function() {
        const month = (window.player.time && window.player.time.month) ? window.player.time.month : 1;
        if (month >= 3 && month <= 5) return 0;
        if (month >= 6 && month <= 8) return 1;
        if (month >= 9 && month <= 11) return 2;
        return 3;
    },

    _getRandomFish: function(region, season) {
        if (typeof fishes === 'undefined') return null;
        const pool = fishes.filter(f => {
            const regionMatch = (f.region === "all" || f.region === region);
            const seasonMatch = f.seasons.includes(season);
            return regionMatch && seasonMatch;
        });
        console.log(pool)
        if (pool.length === 0) return null;
        const totalWeight = pool.reduce((acc, f) => acc + (1 / Math.pow(f.rarity, 2)), 0);
        let random = Math.random() * totalWeight;
        for (const fish of pool) {
            const weight = (1 / Math.pow(fish.rarity, 2));
            if (random < weight) return fish;
            random -= weight;
        }
        return pool[0];
    },

    _getEquippedRodData: function() {
        const p = window.player;
        const id = (p.equipment && p.equipment.fishing_rod) ? p.equipment.fishing_rod : null;
        if (!id) return { catchRate: 0 };
        const data = fishingRods.find(r => r.id === id);
        return data ? { catchRate: data.effects.catchRate } : { catchRate: 0 };
    },

    _clearTimers: function() {
        if (this.gameTimer) clearTimeout(this.gameTimer);
        if (this.loopTimer) clearInterval(this.loopTimer);
    },

    startReeling: function() {
        if (this.state === "IDLE" || this.state === "RESULT") this.handleSceneClick();
        else if (this.state === "HOOKED") this.handleSceneClick();
        else if (this.state === "REELING") this.isReeling = true;
    },

    stopReeling: function() { if (this.state === "REELING") this.isReeling = false; }
};
window.UtilFish = UtilFish;