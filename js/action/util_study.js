// js/action/util_study.js
// 研读核心逻辑 v3.4 (修复消耗计算 + 客栈休息快捷键)

const UtilStudy = {
    // ================= 配置区域 =================
    COST_HOUR: 2,       // 每次研读消耗 2 时辰
    FATIGUE_GAIN: 10,    // 额外疲劳 (配合时间流逝 total=10)
    HUNGER_COST_EXTRA: 10, // 额外饱食消耗 (配合时间流逝 total=10)

    /**
     * 【核心公式】计算基础产出点数 (未乘效率前)
     * 外功：(10 + 精/2) / (1 + 稀有度*0.1)
     * 内功：(10 + (气+神)/2) / (1 + 稀有度*0.1)
     */
    _calculateBaseOutput: function(book, attr) {
        let relatedAttrValue = 0;
        const rarity = book.rarity || 1;

        if (book.subType === 'body') {
            // 外功：精 / 2
            const jing = attr.jing || 0;
            relatedAttrValue = jing / 2;
        } else {
            // 内功：(气 + 神) / 2
            const qi = attr.qi || 0;
            const shen = attr.shen || 0;
            relatedAttrValue = (qi + shen) / 2;
        }

        // 基础公式分子：(10 + 属性加成)
        const base = 10 + relatedAttrValue;
        const rarityFactor = 1 + rarity * 0.1;

        return {
            val: base / rarityFactor,
            base: base,
            attrBonus: relatedAttrValue,
            rarityFactor: rarityFactor
        };
    },

    /**
     * 预测研读收益
     */
    calcGain: function(book) {
        if (!book) return { gain: 0, efficiency: 0, breakdown: [], formulaDesc: "" };

        const p = window.player;
        const attr = p.derived || p.attributes || { jing: 0, qi: 0, shen: 0 };
        const rarity = book.rarity || 1;

        // 1. 基础值计算
        let relatedAttrValue = 0;
        let attrDesc = "";

        if (book.subType === 'body') {
            relatedAttrValue = attr.shen || 0;
            attrDesc = "神识";
        } else {
            const qi = attr.qi || 0;
            const shen = attr.shen || 0;
            relatedAttrValue = Math.floor((qi + shen) / 2);
            attrDesc = "(气+神)/2";
        }

        let rawBaseGain = (10 + relatedAttrValue) / (1 + rarity * 0.1);

        let breakdown = [];
        breakdown.push({
            label: `基础研读 [${attrDesc}]`,
            val: Math.floor(rawBaseGain)
        });

        // 2. 状态检测 (Buff/Debuff)
        let buffEffMultiplier = 1.0;
        let hasFatigue = false;
        let hasHunger = false;

        if (p.buffs) {
            const buffList = Array.isArray(p.buffs) ? p.buffs : Object.values(p.buffs);
            buffList.forEach(b => {
                if (!b) return;
                if (b.attr === 'studyEff') {
                    let val = parseFloat(b.val);
                    if (String(b.val).includes('%')) val /= 100;
                    if (val > 0) {
                        buffEffMultiplier += val;
                        breakdown.push({
                            label: b.name,
                            val: `+${Math.round(val * 100)}%`,
                            color: "#4caf50"
                        });
                    }
                }
                if (b.id === 'debuff_fatigue' || (b.name && b.name.includes('疲'))) hasFatigue = true;
                if (b.id === 'debuff_hunger' || (b.name && b.name.includes('饿'))) hasHunger = true;
            });
        }

        // 3. 计算综合效率
        let totalEfficiency = buffEffMultiplier;

        // 【新增】城镇加成逻辑
        if (window.UtilsPlayer && window.UtilsPlayer.isInTown()) {
            totalEfficiency *= 1.3;
            breakdown.push({ label: "市井便利", val: "+50%", color: "#4caf50" }); // 绿色表示增益
        }

        if (hasFatigue) {
            totalEfficiency *= 0.5;
            breakdown.push({ label: "精神疲惫", val: "x 50%", color: "#f44336" });
        }
        if (hasHunger) {
            totalEfficiency *= 0.5;
            breakdown.push({ label: "腹中饥饿", val: "x 50%", color: "#f44336" });
        }

        let finalGain = rawBaseGain * totalEfficiency;
        finalGain = Math.max(1, Math.ceil(finalGain));

        return {
            gain: finalGain,
            baseGain: Math.floor(rawBaseGain),
            efficiency: totalEfficiency,
            breakdown: breakdown,
            formulaDesc: `(10 + ${attrDesc}) ÷ (1 + 稀有度×0.1)`
        };
    },

    /**
     * 执行研读动作
     */
    performStudy: function(bookId) {
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;

        const p = window.player;
        const maxFatigue = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;

        // =========== 【检查状态】 ===========
        // 1. 检查饱食度 (总消耗约10点)
        if (p.status.hunger < 10) {
            if (window.showToast) window.showToast("腹中饥饿难耐，无法集中精神研读。");
            return false;
        }

        // 2. 检查疲劳值 (若已满则不能读)
        if (p.status.fatigue >= maxFatigue) {
            if (window.showToast) window.showToast("精神困乏，头昏脑涨，实在读不进去了。");
            return false;
        }
        // ===================================

        // 3. 消耗时间 & 扣除属性
        // passTime(hours, extraHungerCost, extraFatigueCost)
        // 基础消耗(2小时): -4饱食, +2疲劳
        // 目标消耗: -10饱食, +10疲劳
        // 补差价: extraHunger=6, extraFatigue=8
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_HOUR, this.HUNGER_COST_EXTRA, this.FATIGUE_GAIN);
        } else if (window.Time) {
            window.Time.passTime(this.COST_HOUR);
            // 兼容旧版手动扣除
            p.status.hunger = Math.max(0, p.status.hunger - 10);
            p.status.fatigue = Math.min(maxFatigue, p.status.fatigue + 10);
        }

        // 4. 计算并增加进度
        if (!p.studyProgress) p.studyProgress = {};
        if (p.studyProgress[bookId] === undefined) p.studyProgress[bookId] = 0;

        const predict = this.calcGain(book); // 使用 calcGain 统一逻辑
        p.studyProgress[bookId] += predict.gain;

        // 5. 反馈
        if (window.showToast) {
            const effPct = Math.round(predict.efficiency * 100);
            window.showToast(`研读结束，[${book.name}] 进度 +${predict.gain} (效率${effPct}%)`);
        }
        if (window.LogManager) {
            window.LogManager.add(`挑灯夜读 [${book.name}] ${this.COST_HOUR} 个时辰，感悟良多，进度提升 ${predict.gain}。`);
        }

        // 6. 检查是否完成
        const maxProgress = book.studyCost || 100;
        if (p.studyProgress[bookId] >= maxProgress) {
            this.onLearnSuccess(book);
            return true;
        }

        // 7. 存档与刷新
        if (window.saveGame) window.saveGame();
        if (window.UIStudy && typeof window.UIStudy.refresh === 'function') {
            window.UIStudy.refresh();
        }

        return false;
    },

    /**
     * 【新增】客栈快捷休息 (修复疲劳无法清空的问题)
     * 花费100文，回复200饱食，清空疲劳，睡到天亮
     */
    quickRest: function() {
        const p = window.player;

        // 1. 检查金钱
        if (p.money < 100) {
            if(window.showToast) window.showToast("囊中羞涩，住不起店 (需100文)。");
            return;
        }

        // 2. 扣钱
        p.money -= 100;

        // 3. 计算需要睡多久 (睡到清晨6点)
        const currentHour = p.time.hour || 0;
        let sleepHours = 0;
        if (currentHour < 6) {
            sleepHours = 6 - currentHour;
        } else {
            sleepHours = (24 - currentHour) + 6;
        }

        // 4. 【关键修复】先流逝时间，并禁止自然增长疲劳
        // 传入第4个参数 customRates，将 fatigue 增长率设为 0
        // 这样 passTime 就不会给你加疲劳了
        if (window.TimeSystem) {
            window.TimeSystem.passTime(sleepHours, 0, 0, { hunger: 0, fatigue: 0 });
        }

        // 5. 强制覆盖状态 (确保清零)
        const maxHunger = (p.derived && p.derived.hungerMax) ? p.derived.hungerMax : 100;
        p.status.hunger = Math.min(maxHunger, p.status.hunger + 200);
        p.status.fatigue = 0; // 强制归零
        if(p.status.toxicity) p.status.toxicity = 0; // 顺便清个毒

        // 移除疲惫 Debuff (如果有)
        if (p.buffs) {
            delete p.buffs['debuff_fatigue'];
            delete p.buffs['fatigue'];
        }

        // 6. 反馈
        if(window.showToast) window.showToast(`支付100文，在客栈美美睡了一觉，精神焕发。`);
        if(window.LogManager) window.LogManager.add(`在客栈休息至清晨，疲劳尽消，饱食度恢复。`);

        // 7. 刷新
        // 必须调用 recalcStats 或 updateUI 来重新计算 derived 属性
        if(window.recalcStats) window.recalcStats();
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();

        if(window.UIStudy && typeof window.UIStudy.refresh === 'function') {
            window.UIStudy.refresh();
        }
    },

    /**
     * 研读成功逻辑
     */
    onLearnSuccess: function(book) {
        const p = window.player;

        if (!p.skills || Array.isArray(p.skills)) {
            p.skills = (!Array.isArray(p.skills) && p.skills) ? p.skills : {};
        }

        if (!p.skills[book.id]) {
            if (window.UtilsSkill && window.UtilsSkill.learnSkill) {
                window.UtilsSkill.learnSkill(book.id);
            } else {
                p.skills[book.id] = { id: book.id, level: 1, exp: 0, mastered: false };
            }
            if (window.showToast) window.showToast(`✨ 豁然开朗！你已领悟《${book.name}》`);
            if (window.LogManager) window.LogManager.add(`[功法大成] 经过不懈研读，你终于领悟了《${book.name}》的奥秘！`);
        } else {
            if (window.UtilsSkill) {
                window.UtilsSkill.learnSkill(book.id, 100);
            }
            if (window.showToast) window.showToast(`你对《${book.name}》有了更深的理解`);
        }

        if (window.recalcStats) window.recalcStats();
        if (window.saveGame) window.saveGame();

        if(window.UIStudy && typeof window.UIStudy.refresh === 'function') {
            window.UIStudy.refresh();
        }
    }
};

window.UtilStudy = UtilStudy;