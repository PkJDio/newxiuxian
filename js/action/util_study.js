// js/action/util_study.js

const UtilStudy = {
    COST_HOUR: 2,
    FATIGUE_GAIN: 8,

    /**
     * 计算单次研读获得的进度值
     * 公式: (10 + 相关属性) / (1 + 功法稀有度 * 0.1)
     * 增益逻辑：
     * - 检查 studyEff 属性，按加法叠加倍率（如 +0.1 即为 1.1倍）
     * 减益逻辑:
     * - 存在“疲惫”Buff (debuff_fatigue): 收益 x 0.5
     * - 存在“饥饿”Buff (debuff_hunger): 收益 x 0.5
     * - 若两者共存: 收益将变为 0.25 倍
     */
    calcGain: function(book) {
        if (!book) return 0;
        const attr = window.player.derived || window.player.attributes;
        const rarity = book.rarity || 1;

        let relatedAttrValue = 0;
        if (book.subType === 'body') {
            relatedAttrValue = attr.shen || 0; // 外功主要参考“神” (悟性)
        } else {
            const qi = attr.qi || 0;
            const shen = attr.shen || 0;
            relatedAttrValue = Math.floor((qi + shen) / 2); // 内功参考 (气+神)/2
        }

        // 基础收益计算
        let gain = (10 + relatedAttrValue) / (1 + rarity * 0.1);

        // --- 【核心修改：状态与丹药加成判定】 ---
        if (window.player && window.player.buffs) {

            // 1. 处理 studyEff 效率 Buff 加成
            let buffEffMultiplier = 1.0;
            for (let bId in window.player.buffs) {
                let b = window.player.buffs[bId];
                // 匹配 studyEff 字段
                if (b.attr === 'studyEff') {
                    // 叠加倍率，例如 val 为 0.35 则倍率为 1.35
                    buffEffMultiplier += parseFloat(b.val);
                }
            }
            gain *= buffEffMultiplier;

            // 2. 检查疲惫状态：效率减半
            if (window.player.buffs['debuff_fatigue']) {
                gain *= 0.5;
            }
            // 3. 检查饥饿状态：效率减半
            if (window.player.buffs['debuff_hunger']) {
                gain *= 0.5;
            }
        }

        // 确保收益至少为 1，并向上取整保持 UI 同步
        return Math.max(1, Math.ceil(gain));
    },

    /**
     * 执行研读动作
     * @param {string} bookId 功法书籍ID
     */
    performStudy: function(bookId) {
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;

        // 1. 消耗时间与增加疲劳
        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_HOUR, 0, this.FATIGUE_GAIN);
        }

        // 2. 初始化进度记录 (确保字段存在于 player 对象中以便存档)
        if (!window.player.studyProgress) window.player.studyProgress = {};
        if (window.player.studyProgress[bookId] === undefined) window.player.studyProgress[bookId] = 0;

        // 3. 计算并应用本次获得的进度
        const gain = this.calcGain(book);
        window.player.studyProgress[bookId] += gain;

        // 4. 【关键】数据变动后立即保存存档
        if (window.ArchiveSystem && window.ArchiveSystem.saveGame) {
            window.ArchiveSystem.saveGame();
        } else if (window.saveGame) {
            window.saveGame();
        }

        const curProgress = window.player.studyProgress[bookId];
        const maxProgress = book.studyCost || 100;

        // 5. 检查是否达到大成
        if (curProgress >= maxProgress) {
            this.onLearnSuccess(book);
            return true; // 研读完成
        }
        return false; // 研读继续
    },

    /**
     * 研读完成后的技能解锁逻辑
     */
    onLearnSuccess: function(book) {
        if (!Array.isArray(window.player.skills)) window.player.skills = [];
        const alreadyHas = window.player.skills.find(s => s.id === book.id);

        if (!alreadyHas) {
            // 将书籍转化为玩家技能
            window.player.skills.push({
                id: book.id,
                name: book.name,
                level: 0,
                exp: 0,
                subType: book.subType,
                effects: JSON.parse(JSON.stringify(book.effects || {}))
            });
            if (window.showToast) window.showToast(`✨ 功法大成！你已领悟《${book.name}》`);
        }

        if (window.recalcStats) window.recalcStats();
        if (window.saveGame) window.saveGame();
    }
};

window.UtilStudy = UtilStudy;