// js/action/util_study.js
// 研读核心逻辑 v3.3 (修复基础点数文案显示)

const UtilStudy = {
    // ================= 配置区域 =================
    COST_HOUR: 2,       // 每次研读消耗 2 时辰
    FATIGUE_GAIN: 8,    // 每次研读增加 8 疲劳

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
     * 预测研读收益 (核心计算逻辑)
     * 公式：基础点数 × (疲劳?0.5) × (饥饿?0.5) × (1 + Buff加成)
     */
    predictGain: function(bookId) {
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return { gain: 0, efficiency: 0, breakdown: [], formulaDesc: "" };

        const p = window.player;
        const attr = p.derived || p.attributes || { jing:10, qi:10, shen:10 };

        // 1. 基础值计算
        const baseResult = this._calculateBaseOutput(book, attr);
        let baseGainRaw = baseResult.val;

        // 2. 状态检测
        let buffBonus = 0; // 正面Buff总加成
        let hasFatigue = false;
        let hasHunger = false;
        let breakdown = [];

        // 【修正】根据功法类型显示具体的基础点数公式
        let baseLabel = "";
        if (book.subType === 'body') {
            baseLabel = "基础点数 (10 + 精/2)";
        } else {
            baseLabel = "基础点数 (10 + (气+神)/2)";
        }

        // 初始基础显示
        breakdown.push({ label: baseLabel, val: Math.floor(baseResult.base) });
        breakdown.push({ label: `稀有度系数 (1 + ${book.rarity || 1}×0.1)`, val: `÷ ${baseResult.rarityFactor.toFixed(1)}` });

        if (p.buffs) {
            const buffList = Array.isArray(p.buffs) ? p.buffs : Object.values(p.buffs);
            buffList.forEach(b => {
                if (!b) return;

                // 研读效率 Buff (studyEff) -> 累加
                if (b.attr === 'studyEff') {
                    let val = parseFloat(b.val);
                    if (String(b.val).includes('%')) val /= 100;
                    if (val > 0) {
                        buffBonus += val;
                        breakdown.push({ label: b.name, val: `+${Math.round(val*100)}%`, color: "#4caf50" });
                    }
                }

                // 负面状态检测
                if (b.id === 'debuff_fatigue' || (b.name && b.name.includes('疲'))) hasFatigue = true;
                if (b.id === 'debuff_hunger' || (b.name && b.name.includes('饿'))) hasHunger = true;
            });
        }

        // 3. 综合效率计算
        let efficiency = 1.0;

        // 应用负面 (乘法)
        if (hasFatigue) {
            efficiency *= 0.5;
            breakdown.push({ label: "精神疲惫", val: "x 50%", color: "#f44336" });
        }
        if (hasHunger) {
            efficiency *= 0.5;
            breakdown.push({ label: "腹中饥饿", val: "x 50%", color: "#f44336" });
        }

        // 应用正面 (加法后乘入)
        if (buffBonus > 0) {
            efficiency *= (1 + buffBonus);
        }

        // 保底效率 10%
        if (efficiency < 0.1) efficiency = 0.1;

        // 4. 最终计算
        const finalGain = Math.max(1, Math.floor(baseGainRaw * efficiency));

        // 5. 生成公式描述字符串 (用于UI底部小字)
        let attrDesc = book.subType === 'body' ? "精/2" : "(气+神)/2";
        let formulaDesc = `(10 + ${attrDesc}) ÷ (1 + 稀有度×0.1) × 效率`;

        return {
            gain: finalGain,
            baseGain: Math.floor(baseGainRaw),
            efficiency: efficiency,
            breakdown: breakdown,
            formulaDesc: formulaDesc
        };
    },

    /**
     * 兼容旧接口
     */
    calcGain: function(book) {
        if (!book) return 0;
        return this.predictGain(book.id).gain;
    },

    /**
     * 执行研读动作
     */
    performStudy: function(bookId) {
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;

        // 1. 消耗时间
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_HOUR);
        } else if (window.Time) { // 兼容旧版 Time
            window.Time.passTime(this.COST_HOUR);
        }

        // 2. 增加疲劳 (手动处理)
        const p = window.player;
        const maxFatigue = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;
        p.status.fatigue = Math.min(maxFatigue, p.status.fatigue + this.FATIGUE_GAIN);

        // 3. 增加进度
        if (!p.studyProgress) p.studyProgress = {};
        if (p.studyProgress[bookId] === undefined) p.studyProgress[bookId] = 0;

        const predict = this.predictGain(bookId);
        p.studyProgress[bookId] += predict.gain;

        // 4. 反馈
        if (window.showToast) {
            const effPct = Math.round(predict.efficiency * 100);
            window.showToast(`研读结束，[${book.name}] 进度 +${predict.gain} (效率${effPct}%)`);
        }
        if (window.LogManager) {
            window.LogManager.add(`挑灯夜读 [${book.name}] ${this.COST_HOUR} 个时辰，感悟良多，进度提升 ${predict.gain}。`);
        }

        // 5. 检查是否完成
        const maxProgress = book.studyCost || 100;
        if (p.studyProgress[bookId] >= maxProgress) {
            this.onLearnSuccess(book);
            return true;
        }

        // 6. 存档与刷新
        if (window.saveGame) window.saveGame();
        if (window.UIStudy && typeof window.UIStudy.refresh === 'function') {
            window.UIStudy.refresh();
        }

        return false;
    },

    /**
     * 研读成功逻辑
     */
    onLearnSuccess: function(book) {
        const p = window.player;

        // 确保 skills 结构正确
        if (!p.skills || Array.isArray(p.skills)) {
            p.skills = (!Array.isArray(p.skills) && p.skills) ? p.skills : {};
        }

        if (!p.skills[book.id]) {
            // 学会新技能
            if (window.UtilsSkill && window.UtilsSkill.learnSkill) {
                window.UtilsSkill.learnSkill(book.id);
            } else {
                p.skills[book.id] = { id: book.id, level: 1, exp: 0, mastered: false };
            }
            if (window.showToast) window.showToast(`✨ 豁然开朗！你已领悟《${book.name}》`);
            if (window.LogManager) window.LogManager.add(`[功法大成] 经过不懈研读，你终于领悟了《${book.name}》的奥秘！`);
        } else {
            // 已有技能，增加熟练度
            if (window.UtilsSkill) {
                window.UtilsSkill.learnSkill(book.id, 100);
            }
            if (window.showToast) window.showToast(`你对《${book.name}》有了更深的理解`);
        }

        if (window.recalcStats) window.recalcStats();
        if (window.saveGame) window.saveGame();

        // 刷新UI
        if(window.UIStudy && typeof window.UIStudy.refresh === 'function') {
            window.UIStudy.refresh();
        }
    }
};

window.UtilStudy = UtilStudy;