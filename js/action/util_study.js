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
    /**
     * 执行研读动作
     */
    performStudy: function(bookId) {
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;

        const p = window.player;
        const maxFatigue = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;

        // =========== 【新增检查】 ===========
        // 如果疲劳值已满，禁止研读
        if (p.status.fatigue >= maxFatigue) {
            if (window.showToast) window.showToast("精神困乏，头昏脑涨，实在读不进去了。（疲劳已满）");
            return false;
        }
        // ===================================

        // 1. 消耗时间
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_HOUR);
        } else if (window.Time) { // 兼容旧版 Time
            window.Time.passTime(this.COST_HOUR);
        }

        // 2. 增加疲劳 (手动处理)
        // 这里可以直接使用上面获取到的 maxFatigue
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
     * 兼容旧接口
     */
    calcGain: function(book) {
        if (!book) return 0;
        // 0. 安全检查：如果没有书，返回空结构
        if (!book) return { gain: 0, efficiency: 0, breakdown: [], formulaDesc: "" };

        const p = window.player;
        // 获取属性，兼容不同存档结构
        const attr = p.derived || p.attributes || { jing: 0, qi: 0, shen: 0 };
        const rarity = book.rarity || 1;

        // ==========================================
        // 1. 基础值计算 (保持原公式逻辑)
        // ==========================================
        let relatedAttrValue = 0;
        let attrDesc = ""; // 用于描述使用了什么属性

        if (book.subType === 'body') {
            relatedAttrValue = attr.shen || 0;
            attrDesc = "神识";
        } else {
            const qi = attr.qi || 0;
            const shen = attr.shen || 0;
            relatedAttrValue = Math.floor((qi + shen) / 2);
            attrDesc = "(气+神)/2";
        }

        // 原公式: (10 + 关联属性) / (1 + 稀有度 * 0.1)
        let rawBaseGain = (10 + relatedAttrValue) / (1 + rarity * 0.1);

        // 初始化 breakdown 数组
        let breakdown = [];
        breakdown.push({
            label: `基础研读 [${attrDesc}]`,
            val: Math.floor(rawBaseGain)
        });

        // ==========================================
        // 2. 状态检测 (Buff/Debuff)
        // ==========================================
        let buffEffMultiplier = 1.0; // 基础倍率为 1.0 (原逻辑)
        let hasFatigue = false;
        let hasHunger = false;

        if (p.buffs) {
            const buffList = Array.isArray(p.buffs) ? p.buffs : Object.values(p.buffs);

            buffList.forEach(b => {
                if (!b) return;

                // 正面加成：studyEff (原逻辑是累加到倍率上)
                if (b.attr === 'studyEff') {
                    let val = parseFloat(b.val);
                    // 处理百分比字符串 (如 "20%" -> 0.2)
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

                // 负面状态检测
                if (b.id === 'debuff_fatigue' || (b.name && b.name.includes('疲'))) hasFatigue = true;
                if (b.id === 'debuff_hunger' || (b.name && b.name.includes('饿'))) hasHunger = true;
            });
        }

        // ==========================================
        // 3. 计算综合效率 & 最终产出
        // ==========================================

        // 初始效率设为 Buff 累加后的倍率
        let totalEfficiency = buffEffMultiplier;

        // 应用负面状态 (原逻辑是乘法)
        if (hasFatigue) {
            totalEfficiency *= 0.5;
            breakdown.push({ label: "精神疲惫", val: "x 50%", color: "#f44336" });
        }
        if (hasHunger) {
            totalEfficiency *= 0.5;
            breakdown.push({ label: "腹中饥饿", val: "x 50%", color: "#f44336" });
        }

        // 计算最终值 (原逻辑: Math.max(1, Math.ceil(gain)))
        let finalGain = rawBaseGain * totalEfficiency;
        finalGain = Math.max(1, Math.ceil(finalGain));

        const return_data= {
            gain: finalGain,                                // 最终收益
            baseGain: Math.floor(rawBaseGain),              // 基础收益(未乘效率前)
            efficiency: totalEfficiency,                    // 综合效率倍率
            breakdown: breakdown,                           // 详细构成数组
            formulaDesc: `(10 + ${attrDesc}) ÷ (1 + 稀有度×0.1)` // 公式描述文本
        };

        return return_data;
    },

    /**
     * 执行研读动作
     */
    performStudy: function(bookId) {
        // 1. 获取书籍数据
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;

        // 2. 消耗时间 (调用时间系统)
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_HOUR);
        } else if (window.Time) {
            window.Time.passTime(this.COST_HOUR);
        }

        // 3. 增加疲劳 (手动处理)
        const p = window.player;
        const maxFatigue = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;
        p.status.fatigue = Math.min(maxFatigue, p.status.fatigue + this.FATIGUE_GAIN);

        // 4. 【核心同步】计算收益
        // 直接调用上一轮定义好的 calcGain，确保逻辑一致
        const result = this.calcGain(book);

        // 5. 增加进度
        if (!p.studyProgress) p.studyProgress = {};
        if (p.studyProgress[bookId] === undefined) p.studyProgress[bookId] = 0;

        // 使用计算出的最终 gain
        p.studyProgress[bookId] += result.gain;

        // 6. 反馈 (利用 result 中的 efficiency 显示百分比)
        if (window.showToast) {
            const effPct = Math.round(result.efficiency * 100);
            window.showToast(`研读结束，[${book.name}] 进度 +${result.gain} (效率${effPct}%)`);
        }
        if (window.LogManager) {
            window.LogManager.add(`挑灯夜读 [${book.name}] ${this.COST_HOUR} 个时辰，感悟良多，进度提升 ${result.gain}。`);
        }

        // 7. 检查是否完成
        const maxProgress = book.studyCost || 100;
        if (p.studyProgress[bookId] >= maxProgress) {
            this.onLearnSuccess(book);
            // 学习成功后 return true，通常用于外层刷新 UI
            // 注意：这里 return true 后下面的刷新逻辑可能不会执行，视你外层调用逻辑而定
            // 建议在 onLearnSuccess 内部也做一次刷新，或者在这里继续往下走
        }

        // 8. 存档与刷新
        if (window.saveGame) window.saveGame();
        if (window.UIStudy && typeof window.UIStudy.refresh === 'function') {
            window.UIStudy.refresh();
        }

        // 如果学习完成了，可能返回 true 告知上层关闭窗口等操作
        return p.studyProgress[bookId] >= maxProgress;
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