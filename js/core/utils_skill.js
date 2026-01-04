// js/core/utils_skill.js
// 功法/技能核心逻辑工具箱
console.log("加载 功法核心逻辑");

const UtilsSkill = {
    /**
     * 计算功法详细信息 (保持不变)
     * @param {string} skillId 功法ID
     */
    getSkillInfo: function(skillId) {
        const item = GAME_DB.items.find(i => i.id === skillId);
        if (!item) return null;

        // 1. 获取当前熟练度
        const currentExp = (player.skills && player.skills[skillId] && player.skills[skillId].exp)
            ? player.skills[skillId].exp
            : 0;

        // 2. 配置参数
        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;
        const diffMult = cfg.difficulty[rarity] || 1.0;
        const limitLevel = item.max_skill_level || 3;

        // 3. 计算境界
        let currentLevelIdx = 0;
        for (let i = 0; i < cfg.levels.length; i++) {
            const reqExp = cfg.levels[i] * diffMult;
            if (currentExp >= reqExp) {
                currentLevelIdx = i;
            } else {
                break;
            }
        }

        // 4. 上限限制
        let isCapped = false;
        if (currentLevelIdx > limitLevel) {
            currentLevelIdx = limitLevel;
            isCapped = true;
        }

        // 5. 下一级经验
        let nextLevelExp = -1;
        if (currentLevelIdx < limitLevel && currentLevelIdx < cfg.levels.length - 1) {
            nextLevelExp = cfg.levels[currentLevelIdx + 1] * diffMult;
        }

        // 6. 属性计算
        const bonusRate = cfg.dmgBonus[currentLevelIdx] || 0;
        let computedEffects = {};
        if (item.effects) {
            for (let key in item.effects) {
                if (key === 'map' || key === 'unlockRegion') continue;
                const baseVal = item.effects[key];
                if (typeof baseVal === 'number') {
                    computedEffects[key] = Math.floor(baseVal * (1 + bonusRate));
                } else {
                    computedEffects[key] = baseVal;
                }
            }
        }

        return {
            name: item.name,
            levelName: cfg.levelNames[currentLevelIdx],
            levelIdx: currentLevelIdx,
            exp: currentExp,
            nextExp: nextLevelExp,
            bonusRate: bonusRate,
            baseEffects: item.effects || {},
            finalEffects: computedEffects,
            isCapped: isCapped,
            limitLevelName: cfg.levelNames[limitLevel]
        };
    },

    /* ================= 功法管理 (新增) ================= */

    /**
     * 习得或提升功法
     * @param {string} skillId 功法ID
     * @param {number} expGain 获得的熟练度
     * @param {boolean} silent 是否静默（不弹窗提示），默认false
     */
    learnSkill: function(skillId, expGain = 0, silent = false) {
        if (!player.skills) player.skills = {};
        const item = GAME_DB.items.find(i => i.id === skillId);

        if (!item) {
            console.error(`[UtilsSkill] 尝试学习不存在的功法: ${skillId}`);
            return;
        }

        let isNew = false;

        // 1. 初始化或增加经验
        if (!player.skills[skillId]) {
            player.skills[skillId] = { exp: 0, level: 0 }; // level 字段其实由 exp 动态计算，这里留着备用
            isNew = true;
        }

        player.skills[skillId].exp += expGain;

        // 2. 提示信息
        if (!silent && window.showToast) {
            if (isNew) {
                window.showToast(`顿悟习得 [${item.name}]！熟练度 +${expGain}`);
            } else if (expGain > 0) {
                window.showToast(`[${item.name}] 勤学苦练，熟练度 +${expGain}`);
            }
        }

        // 3. 刷新系统
        this._refreshSystem();
    },

    /**
     * 遗忘单个功法
     * @param {string} skillId
     */
    forgetSkill: function(skillId) {
        if (!player.skills || !player.skills[skillId]) return;

        // 1. 检查并卸下装备 (核心安全逻辑)
        this._unequipIfEquipped(skillId);

        // 2. 删除数据
        delete player.skills[skillId];

        // 3. 刷新
        this._refreshSystem();
        console.log(`[UtilsSkill] 已遗忘功法: ${skillId}`);
    },

    /**
     * 批量遗忘功法
     * @param {Array<string>} skillIdList 功法ID列表
     */
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

    /**
     * 内部：如果功法正在装备中，强制卸下
     */
    _unequipIfEquipped: function(skillId) {
        if (!player.equipment) return;
        const slots = ['gongfa_ext', 'gongfa_int'];

        slots.forEach(type => {
            if (Array.isArray(player.equipment[type])) {
                const list = player.equipment[type];
                const idx = list.indexOf(skillId);
                if (idx !== -1) {
                    list[idx] = null; // 置空槽位
                }
            }
        });
    },

    /**
     * 内部：统一刷新属性和界面
     */
    _refreshSystem: function() {
        // 重新计算属性
        if (window.recalcStats) window.recalcStats();

        // 如果UI打开，刷新UI
        if (window.UISkill && typeof UISkill.refresh === 'function') {
            UISkill.refresh(); // 假设 UISkill 有 refresh 方法
        }
        if (window.updateUI) window.updateUI();
    }
};

window.UtilsSkill = UtilsSkill;