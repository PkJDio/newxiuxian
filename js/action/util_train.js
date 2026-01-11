// js/action/util_train.js
// 修炼核心逻辑 v1.5 (公式详解适配版)

const UtilTrain = {
    // ================= 配置区域 =================
    COST_TIME: 4,       // 消耗 4 时辰
    COST_STAMINA: 0,    // 消耗 0 精力
    FATIGUE_ADD: 16,    // 增加 16 疲劳
    HUNGER_COST: 16,    // 消耗 16 饱食

    /**
     * 【核心公式】计算基础产出点数
     */
    _calculateBaseOutput: function(item, attr) {
        let statVal = 0;
        let desc = "";

        if (item.subType === 'body') {
            // 外功：(精 + 神) / 2
            statVal = ((attr.jing || 0) + (attr.shen || 0)) / 2;
            desc = "10 + (精+神)/2";
        } else {
            // 内功：(气 + 神) / 2
            statVal = ((attr.qi || 0) + (attr.shen || 0)) / 2;
            desc = "10 + (气+神)/2";
        }

        return {
            val: 10 + statVal,
            attrBonus: statVal,
            desc: desc
        };
    },

    /**
     * 预测修炼收益 (用于UI显示和实际计算)
     */
    predictGain: function(skillId) {
        const item = typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i => i.id === skillId) : null;
        if (!item) return { gain: 0, efficiency: 0, breakdown: [], formulaDesc: "" };

        const p = window.player;
        const attr = p.derived || p.attributes || { jing:10, qi:10, shen:10 };

        // 1. 基础值计算
        const baseResult = this._calculateBaseOutput(item, attr);
        let baseGain = baseResult.val;

        // 2. 状态检测 (基于 Buff)
        let hasFatigue = false;
        let hasHunger = false;
        let buffBonus = 0; // 正面Buff总加成
        let breakdown = [];

        // 初始基础显示
        breakdown.push({ label: `基础点数 [${baseResult.desc}]`, val: Math.floor(baseGain) });

        if (p.buffs) {
            const buffList = Array.isArray(p.buffs) ? p.buffs : Object.values(p.buffs);
            buffList.forEach(b => {
                if (!b) return;

                // 正面加成：累加
                if (b.attr === 'trainEff') {
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

        // 3. 计算综合效率 (按新公式)
        // 公式：1.0 * (疲惫0.5) * (饥饿0.5) * (1 + Buff加成)
        let efficiency = 1.0;

        // 应用负面 (乘法)
        if (hasFatigue) {
            efficiency *= 0.5;
            breakdown.push({ label: "身体疲惫", val: "x 50%", color: "#f44336" });
        }
        if (hasHunger) {
            efficiency *= 0.5;
            breakdown.push({ label: "腹中饥饿", val: "x 50%", color: "#f44336" });
        }

        // 应用正面 (加法后乘入)
        if (buffBonus > 0) {
            efficiency *= (1 + buffBonus);
        }

        // 效率保底 10%
        if (efficiency < 0.1) efficiency = 0.1;

        // 4. 最终产出
        const finalGain = Math.floor(baseGain * efficiency);

        return {
            gain: finalGain,
            baseGain: Math.floor(baseGain),
            efficiency: efficiency,
            breakdown: breakdown,
            formulaDesc: `(${baseResult.desc}) × 效率`
        };
    },

    /**
     * 执行修炼动作
     */
    train: function(skillId) {
        const p = window.player;
        const item = GAME_DB.items.find(i => i.id === skillId);

        // 2. 瓶颈/满级检查
        const info = window.UtilsSkill.getSkillInfo(skillId);
        if (info.isCapped) {
            if(window.showToast) window.showToast("已达当前瓶颈，无法精进，请寻找后续篇章或参悟。");
            return;
        }
        if (info.mastered) {
            if(window.showToast) window.showToast("此功法已臻化境，无需再练。");
            return;
        }

        // 3. 扣除消耗
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_TIME);
        } else if (window.Time) { // 兼容
            window.Time.passTime(this.COST_TIME);
        }

        // 消耗逻辑
        p.status.hunger = Math.max(0, p.status.hunger - this.HUNGER_COST);

        // 疲劳增加逻辑 (使用 derived.fatigueMax)
        const maxFatigue = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;
        p.status.fatigue = Math.min(maxFatigue, p.status.fatigue + this.FATIGUE_ADD);

        // 4. 获取收益
        const predict = this.predictGain(skillId);

        // 5. 应用熟练度
        if (window.UtilsSkill) {
            window.UtilsSkill.learnSkill(skillId, predict.gain, true);
        }

        // 6. 反馈提示
        if (window.showToast) {
            const effPct = Math.round(predict.efficiency * 100);
            window.showToast(`修炼结束，[${item.name}] 熟练度 +${predict.gain} (效率${effPct}%)`);
        }
        if (window.LogManager) {
            window.LogManager.add(`闭关修炼 [${item.name}] ${this.COST_TIME} 个时辰，感悟颇深，熟练度提升 ${predict.gain}。`);
        }

        // 7. 刷新相关界面
        if(window.UITrain && typeof window.UITrain.refresh === 'function') {
            window.UITrain.refresh();
        }
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
    }
};

window.UtilTrain = UtilTrain;