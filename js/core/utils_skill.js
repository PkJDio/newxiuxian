// js/core/utils_skill.js
// 功法/技能核心逻辑工具箱 (修复境界上限读取)
console.log("加载 功法核心逻辑");

const UtilsSkill = {
    getSkillInfo: function(skillId) {
        const item = GAME_DB.items.find(i => i.id === skillId);
        if (!item) return null;

        const currentExp = (player.skills && player.skills[skillId] && player.skills[skillId].exp)
            ? player.skills[skillId].exp
            : 0;

        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;
        const diffMult = cfg.difficulty[rarity] || 1.0;

        // 【核心修复】获取境界上限 (max_skill_level)
        // 优先从 effects 中读取，如果没有再看 item 根属性，最后默认 3 (大成)
        let limitLevel = 3;
        if (item.effects && item.effects.max_skill_level !== undefined) {
            limitLevel = item.effects.max_skill_level;
        } else if (item.max_skill_level !== undefined) {
            limitLevel = item.max_skill_level;
        }

        // 计算当前境界
        let currentLevelIdx = 0;
        for (let i = 0; i < cfg.levels.length; i++) {
            const reqExp = cfg.levels[i] * diffMult;
            if (currentExp >= reqExp) {
                currentLevelIdx = i;
            } else {
                break;
            }
        }

        // 限制上限
        let isCapped = false;
        if (currentLevelIdx > limitLevel) {
            currentLevelIdx = limitLevel;
            isCapped = true;
        }

        // 计算下一级经验
        let nextLevelExp = -1;
        if (currentLevelIdx < limitLevel && currentLevelIdx < cfg.levels.length - 1) {
            nextLevelExp = cfg.levels[currentLevelIdx + 1] * diffMult;
        }

        // 计算属性加成
        const bonusRate = cfg.dmgBonus[currentLevelIdx] || 0;
        let computedEffects = {};
        if (item.effects) {
            for (let key in item.effects) {
                if (key === 'map' || key === 'unlockRegion') continue;
                // 【新增】max_skill_level 不是加成属性，不参与计算，也不放入 finalEffects
                if (key === 'max_skill_level') continue;

                const baseVal = item.effects[key];
                if (typeof baseVal === 'number') {
                    // 向下取整
                    computedEffects[key] = Math.floor(baseVal * (1 + bonusRate));
                } else {
                    computedEffects[key] = baseVal;
                }
            }
        }

        return {
            name: item.name,
            levelName: cfg.levelNames[currentLevelIdx], // 当前中文境界
            levelIdx: currentLevelIdx,
            exp: currentExp,
            nextExp: nextLevelExp,
            bonusRate: bonusRate,
            baseEffects: item.effects || {},
            finalEffects: computedEffects,
            isCapped: isCapped,
            limitLevelName: cfg.levelNames[limitLevel] || "未知" // 【核心】上限中文名称
        };
    },

    /* ================= 功法管理 ================= */

    learnSkill: function(skillId, expGain = 0, silent = false) {
        if (!player.skills) player.skills = {};
        const item = GAME_DB.items.find(i => i.id === skillId);

        if (!item) {
            console.error(`[UtilsSkill] 尝试学习不存在的功法: ${skillId}`);
            return;
        }

        let isNew = false;
        if (!player.skills[skillId]) {
            player.skills[skillId] = { exp: 0, level: 0, mastered: false };
            isNew = true;
        }

        const skillData = player.skills[skillId];
        skillData.exp += expGain;

        // 满级自动参悟检查
        const info = this.getSkillInfo(skillId);
        if (info.isCapped && !skillData.mastered) {
            skillData.mastered = true;
            if(window.showToast) window.showToast(`恭喜！[${item.name}] 已参悟透彻！(轮回可继承属性)`);
        }

        if (!silent && window.showToast) {
            if (isNew) {
                window.showToast(`顿悟习得 [${item.name}]！熟练度 +${expGain}`);
            } else if (expGain > 0) {
                let msg = `[${item.name}] 勤学苦练，熟练度 +${expGain}`;
                if (skillData.mastered) msg += " (已参悟)";
                window.showToast(msg);
            }
        }

        this._refreshSystem();
    },

    forgetSkill: function(skillId) {
        if (!player.skills || !player.skills[skillId]) return;
        this._unequipIfEquipped(skillId);
        delete player.skills[skillId];
        this._refreshSystem();
        console.log(`[UtilsSkill] 已遗忘功法: ${skillId}`);
    },

    forgetSkills: function(skillIdList) {
        if (!Array.isArray(skillIdList)) return;
        let count = 0;
        skillIdList.forEach(id => {
            if (player.skills && player.skills[id]) {
                this._unequipIfEquipped(id);
                delete player.skills[id];
                count++;
            }
        });
        if (count > 0) {
            if(window.showToast) window.showToast(`已废弃 ${count} 门功法`);
            this._refreshSystem();
        }
    },

    _unequipIfEquipped: function(skillId) {
        if (!player.equipment) return;
        const slots = ['gongfa_ext', 'gongfa_int'];
        slots.forEach(type => {
            if (Array.isArray(player.equipment[type])) {
                const list = player.equipment[type];
                const idx = list.indexOf(skillId);
                if (idx !== -1) {
                    list[idx] = null;
                }
            }
        });
    },

    _refreshSystem: function() {
        if (window.recalcStats) window.recalcStats();
        if (window.UISkill && typeof UISkill.refresh === 'function') {
            UISkill.refresh();
        }
        if (window.updateUI) window.updateUI();
        if (window.saveGame) {
            window.saveGame();
        }
    }
};

window.UtilsSkill = UtilsSkill;