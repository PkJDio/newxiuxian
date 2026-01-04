// js/core/utils_skill.js
// 功法/技能核心计算逻辑

const UtilsSkill = {
    /**
     * 计算功法详细信息
     * @param {string} skillId 功法ID
     * @returns {Object} 包含等级、加成、当前属性等信息的对象
     */
    getSkillInfo: function(skillId) {
        const item = GAME_DB.items.find(i => i.id === skillId);
        if (!item) return null;

        // 1. 获取当前熟练度 (XP)
        const currentExp = (player.skills && player.skills[skillId] && player.skills[skillId].exp)
            ? player.skills[skillId].exp
            : 0;

        // 2. 获取配置
        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;
        const diffMult = cfg.difficulty[rarity] || 1.0; // 难度系数
        const limitLevel = item.max_skill_level || 3;   // 自身上限 (默认最高大成)

        // 3. 计算当前境界 (Level Index)
        // 遍历阈值，找到当前XP所在的最高档位
        let currentLevelIdx = 0;
        for (let i = 0; i < cfg.levels.length; i++) {
            const reqExp = cfg.levels[i] * diffMult;
            if (currentExp >= reqExp) {
                currentLevelIdx = i;
            } else {
                break;
            }
        }

        // 4. 限制最高境界 (受 max_skill_level 限制)
        // 注意：levelNames[0]是未入门，通常 max_skill_level 1对应入门
        // 这里假设 max_skill_level 直接对应 levelNames 的索引上限
        let isCapped = false;
        if (currentLevelIdx > limitLevel) {
            currentLevelIdx = limitLevel;
            isCapped = true;
        }

        // 5. 计算下一级所需经验
        let nextLevelExp = -1; // -1 表示已满级
        if (currentLevelIdx < limitLevel && currentLevelIdx < cfg.levels.length - 1) {
            nextLevelExp = cfg.levels[currentLevelIdx + 1] * diffMult;
        }

        // 6. 计算属性加成 (Bonus Multiplier)
        const bonusRate = cfg.dmgBonus[currentLevelIdx] || 0;

        // 7. 计算实际生效属性
        // 这是一个对象，例如 { atk: 12, def: 5 } (基础10, 加成20% -> 12)
        let computedEffects = {};
        if (item.effects) {
            for (let key in item.effects) {
                // 跳过非数值属性
                if (key === 'map' || key === 'unlockRegion') continue;

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
            levelName: cfg.levelNames[currentLevelIdx],
            levelIdx: currentLevelIdx,
            exp: currentExp,
            nextExp: nextLevelExp,
            bonusRate: bonusRate,     // 例如 0.1
            baseEffects: item.effects || {},
            finalEffects: computedEffects,
            isCapped: isCapped,
            limitLevelName: cfg.levelNames[limitLevel]
        };
    }
};

window.UtilsSkill = UtilsSkill;