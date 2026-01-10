// js/action/util_study.js

const UtilStudy = {
    COST_HOUR: 2,
    FATIGUE_GAIN: 8,

    /**
     * 计算收益 (保持不变，这部分逻辑没问题)
     */
    calcGain: function(book) {
        if (!book) return 0;
        const attr = window.player.derived || window.player.attributes;
        const rarity = book.rarity || 1;

        let relatedAttrValue = 0;
        if (book.subType === 'body') {
            relatedAttrValue = attr.shen || 0;
        } else {
            const qi = attr.qi || 0;
            const shen = attr.shen || 0;
            relatedAttrValue = Math.floor((qi + shen) / 2);
        }

        let gain = (10 + relatedAttrValue) / (1 + rarity * 0.1);

        if (window.player && window.player.buffs) {
            // 兼容 buffs 为数组或对象的情况
            const buffList = Array.isArray(window.player.buffs) ? window.player.buffs : Object.values(window.player.buffs);

            let buffEffMultiplier = 1.0;
            let hasFatigue = false;
            let hasHunger = false;

            buffList.forEach(b => {
                if (!b) return;
                if (b.attr === 'studyEff') {
                    buffEffMultiplier += parseFloat(b.val);
                }
                // 兼容 ID 或 Name 检测
                if (b.id === 'debuff_fatigue' || (b.name && b.name.includes('疲'))) hasFatigue = true;
                if (b.id === 'debuff_hunger' || (b.name && b.name.includes('饿'))) hasHunger = true;
            });

            gain *= buffEffMultiplier;
            if (hasFatigue) gain *= 0.5;
            if (hasHunger) gain *= 0.5;
        }

        return Math.max(1, Math.ceil(gain));
    },

    /**
     * 执行研读
     */
    performStudy: function(bookId) {
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;

        if (window.TimeSystem) {
            window.TimeSystem.passTime(this.COST_HOUR, 0, this.FATIGUE_GAIN);
        }

        if (!window.player.studyProgress) window.player.studyProgress = {};
        if (window.player.studyProgress[bookId] === undefined) window.player.studyProgress[bookId] = 0;

        const gain = this.calcGain(book);
        window.player.studyProgress[bookId] += gain;

        if (window.ArchiveSystem && window.ArchiveSystem.saveGame) {
            window.ArchiveSystem.saveGame();
        } else if (window.saveGame) {
            window.saveGame();
        }

        const curProgress = window.player.studyProgress[bookId];
        const maxProgress = book.studyCost || 100;

        // 检查是否大成
        if (curProgress >= maxProgress) {
            // 【关键】调用修复后的成功逻辑
            this.onLearnSuccess(book);
            return true;
        }
        return false;
    },

    /**
     * 【核心修复】研读完成后的技能解锁逻辑 (适配对象结构)
     */
    onLearnSuccess: function(book) {
        // 1. 确保 skills 是对象，如果不存在则初始化为 {}
        if (!window.player.skills || Array.isArray(window.player.skills)) {
            // 如果以前错误地变成了数组，或者为空，这里强制转回对象，防止报错
            // 注意：如果以前是数组且有数据，这里会清空。
            // 但既然你的设定是对象，这里必须保证它是对象。
            window.player.skills = window.player.skills && !Array.isArray(window.player.skills) ? window.player.skills : {};
        }

        // 2. 使用对象 Key 检查是否存在
        const alreadyHas = window.player.skills[book.id];

        if (!alreadyHas) {
            // 3. 调用 UtilsSkill 添加技能
            if (window.UtilsSkill && window.UtilsSkill.learnSkill) {
                window.UtilsSkill.learnSkill(book.id);
            } else {
                // 兜底逻辑：手动添加对象结构
                window.player.skills[book.id] = {
                    id: book.id,
                    level: 1,
                    exp: 0,
                    mastered: false // 刚学会是否算mastered看你设定，通常刚学会是入门
                };
            }

            if (window.showToast) window.showToast(`✨ 功法大成！你已领悟《${book.name}》`);
            if (window.LogManager) window.LogManager.add(`[功法大成] 恭喜你，你已领悟《${book.name}》`);
        } else {
            // 如果已经有了，可能增加熟练度？这里暂时只提示
            if (window.showToast) window.showToast(`你对《${book.name}》有了更深的感悟`);
        }

        // 刷新属性和保存
        if (window.recalcStats) window.recalcStats();
        if (window.saveGame) window.saveGame();
    }
};

window.UtilStudy = UtilStudy;