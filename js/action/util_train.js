// js/action/util_train.js
// 修炼核心逻辑 v1.5 (公式详解适配版)

const UtilTrain = {
    // ================= 配置区域 =================
    COST_TIME: 4,       // 消耗 4 时辰
    COST_STAMINA: 0,    // 消耗 0 精力
    FATIGUE_ADD: 20,    // 增加 16 疲劳
    HUNGER_COST: 20,    // 消耗 16 饱食

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
        const item = typeof books !== 'undefined' ? books.find(i => i.id === skillId) : null;
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

        // 【新增】城镇惩罚逻辑
        if (window.UtilsPlayer && window.UtilsPlayer.isInTown()) {
            efficiency *= 0.5;
            breakdown.push({ label: "红尘扰心", val: "-50%", color: "#f44336" }); // 红色表示减益
        }

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
    /**
     * 执行修炼动作
     */
    train: function(skillId) {
        const p = window.player;
        const item = GAME_DB.items.find(i => i.id === skillId);

        // 1. 基础检查：瓶颈/满级
        // 注意：这里的检查是为了防止已经大成的功法重复修炼
        const info = window.UtilsSkill.getSkillInfo(skillId);
        if (info.isCapped) {
            if(window.showToast) window.showToast("已达当前瓶颈，无法精进，请寻找后续篇章或参悟。");
            return;
        }
        if (info.mastered) {
            if(window.showToast) window.showToast("此功法已臻化境，无需再练。");
            return;
        }

        // =========== 【新增检查】 ===========

        // A. 检查饱食度 (不能为0)
        if (p.status.hunger <= 0) {
            if(window.showToast) window.showToast("腹中饥饿，四肢无力，无法进行修炼。（饱食度不足）");
            return;
        }

        // B. 检查疲劳度 (不能已满)
        const maxFatigue = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;
        if (p.status.fatigue >= maxFatigue) {
            if(window.showToast) window.showToast("精神困乏，心神不宁，容易走火入魔。（疲劳已满）");
            return;
        }
        // ===================================

        // 3. 扣除消耗
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_TIME);
        } else if (window.Time) {
            window.Time.passTime(this.COST_TIME);
        }

        // 消耗逻辑
        UtilsAttribute.consumeHunger(this.HUNGER_COST);
        p.status.fatigue = Math.min(maxFatigue, p.status.fatigue + this.FATIGUE_ADD);

        // 4. 获取收益
        const predict = this.predictGain(skillId);

        // 5. 应用熟练度
        if (window.UtilsSkill) {
            // 第三个参数 true 表示静默模式，我们在下面手动处理提示
            window.UtilsSkill.learnSkill(skillId, predict.gain, true);

            // =========== 【核心修改：大成判定】 ===========
            // 再次获取技能信息，检查熟练度增加后的状态
            const afterInfo = window.UtilsSkill.getSkillInfo(skillId);
            const skillData = p.skills[skillId];

            // 如果练完之后达到了瓶颈(满级)，且还没标记大成，则强制标记为大成
            // (isCapped 为 true 说明等级已达上限)
            if (afterInfo && afterInfo.isCapped && !skillData.mastered) {
                skillData.mastered = true;

                // 播放大成提示
                const msg = `✨ 醍醐灌顶！《${item.name}》已修炼至大成境界！`;
                if(window.showToast) window.showToast(msg);
                if(window.LogManager) window.LogManager.add(`[系统] ${msg}`);
            }
            // ===========================================
        }

        // 6. 反馈提示 (普通修炼提示)
        // 如果刚刚大成了，这里依然显示一次修炼结算，或者你可以加个判断不显示
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