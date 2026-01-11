// js/core/utils_skill.js
// 功法/技能核心逻辑工具箱
// 【更新】融合提示增加物品稀有度颜色支持 + 日志输出
// console.log("加载 功法核心逻辑");

const UtilsSkill = {
    getSkillInfo: function(skillId) {
        // 尝试从 GAME_DB 或全局 books 获取数据
        let item = null;
        if (typeof GAME_DB !== 'undefined' && GAME_DB.items) {
            item = GAME_DB.items.find(i => i.id === skillId);
        }
        if (!item && typeof books !== 'undefined') {
            item = books.find(i => i.id === skillId);
        }

        if (!item) return null;

        const currentExp = (player.skills && player.skills[skillId] && player.skills[skillId].exp)
            ? player.skills[skillId].exp
            : 0;

        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;

        // 1. 获取各项系数
        const diffMult = cfg.difficulty[rarity] || 1.0;
        const typeRate = (cfg.typeExpRate && cfg.typeExpRate[item.subType]) ? cfg.typeExpRate[item.subType] : 1.0;

        // 2. 获取境界上限
        let limitLevel = 3;
        if (item.effects && item.effects.max_skill_level !== undefined) {
            limitLevel = item.effects.max_skill_level;
        } else if (item.max_skill_level !== undefined) {
            limitLevel = item.max_skill_level;
        }

        // 3. 计算当前境界
        let currentLevelIdx = 0;
        for (let i = 0; i < cfg.levels.length; i++) {
            const reqExp = Math.floor(cfg.levels[i] * diffMult * typeRate);
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

        // 4. 计算下一级经验
        let nextLevelExp = -1;
        if (currentLevelIdx < limitLevel && currentLevelIdx < cfg.levels.length - 1) {
            nextLevelExp = Math.floor(cfg.levels[currentLevelIdx + 1] * diffMult * typeRate);
        }

        // 5. 计算属性加成
        const bonusRate = cfg.dmgBonus[currentLevelIdx] || 0;
        let computedEffects = {};
        let masteryBonus = null;

        if (item.effects) {
            let bestAttr = null;
            let maxVal = -1;

            for (let key in item.effects) {
                if (key === 'map' || key === 'unlockRegion') continue;
                if (key === 'max_skill_level') continue;

                const baseVal = item.effects[key];
                if (typeof baseVal === 'number') {
                    computedEffects[key] = Math.ceil(baseVal * (1 + bonusRate));
                    if (baseVal > maxVal) {
                        maxVal = baseVal;
                        bestAttr = key;
                    }
                } else {
                    computedEffects[key] = baseVal;
                }
            }

            if (bestAttr) {
                masteryBonus = {
                    attr: bestAttr,
                    val: diffMult
                };
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
            limitLevelName: cfg.levelNames[limitLevel] || "未知",
            masteryBonus: masteryBonus
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


        // D. 获取全篇物品名称及颜色
        let fullItemName = "绝世神功";
        let rarityColor = "#333"; // 默认颜色

        const fullItem = books.find(i => i.id === skillId);
        if (fullItem) {
            fullItemName = fullItem.name;
            // 从全局配置获取颜色
            if (typeof RARITY_CONFIG !== 'undefined' && RARITY_CONFIG[fullItem.rarity]) {
                rarityColor = RARITY_CONFIG[fullItem.rarity].color || rarityColor;
            }
        }
        // 构建带颜色的名称 HTML
        const styledName = `<span style="color:${rarityColor}; font-weight:bold;">[${fullItemName}]</span>`;
        const kill_name = `${styledName}！`;

        // 满级自动参悟检查
        const info = this.getSkillInfo(skillId);
        if (info.isCapped && !skillData.mastered) {
            skillData.mastered = true;
            const msg = ` 已参悟透彻 [${kill_name}] ！(轮回可继承属性)`;
            if(window.showToast) window.showToast(msg);
            if (window.LogManager && typeof window.LogManager.add === 'function') {
                window.LogManager.add(msg);
            }
        }

        if (!silent && window.showToast) {
            if (isNew) {
                let msg = `顿悟习得 [${kill_name}]！`;
                window.showToast(msg);
                if (window.LogManager && typeof window.LogManager.add === 'function') {
                    window.LogManager.add(msg);
                }
            } else if (expGain > 0) {
                let msg = `勤学苦练 [${kill_name}]，熟练度 +${expGain}`;
                if (skillData.mastered) msg += " (已参悟)";
                window.showToast(msg);
                if (window.LogManager && typeof window.LogManager.add === 'function') {
                    window.LogManager.add(msg);
                }
            }
        }

        // 检查是否集齐上中下三篇，自动融合
        this._checkAndFuseSkills(skillId);

        this._refreshSystem();
    },

    // 【核心修改】功法融合检查逻辑（增加颜色样式和日志）
    _checkAndFuseSkills: function(triggerId) {
        const suffixes = ["_upper", "_middle", "_lower"];
        const targetSuffix = "_full";

        // 1. 判断当前技能是否属于残卷
        const matchedSuffix = suffixes.find(s => triggerId.endsWith(s));
        if (!matchedSuffix) return;

        // 2. 获取基础ID
        const baseId = triggerId.substring(0, triggerId.lastIndexOf(matchedSuffix));

        // 3. 构建所有相关ID
        const partIds = suffixes.map(s => baseId + s);
        const fullId = baseId + targetSuffix;

        // 4. 检查是否集齐 3 个残卷
        const hasAllParts = partIds.every(id => player.skills && player.skills[id]);
        if (!hasAllParts) return;

        // 5. 检查是否已经学会全篇
        if (player.skills[fullId]) return;

        // === 执行融合逻辑 ===

        // A. 计算熟练度总和
        let totalExp = 0;
        partIds.forEach(id => {
            totalExp += player.skills[id].exp;
        });
        const newExp = Math.floor(totalExp / 3);

        // B. 删除残卷
        partIds.forEach(id => {
            this._unequipIfEquipped(id);
            delete player.skills[id];
        });

        // C. 添加全篇
        player.skills[fullId] = {
            exp: newExp,
            level: 0,
            mastered: false
        };

        // D. 获取全篇物品名称及颜色
        let fullItemName = "绝世神功";
        let rarityColor = "#333"; // 默认颜色

        const fullItem = books.find(i => i.id === fullId);
        if (fullItem) {
            fullItemName = fullItem.name;
            // 从全局配置获取颜色
            if (typeof RARITY_CONFIG !== 'undefined' && RARITY_CONFIG[fullItem.rarity]) {
                rarityColor = RARITY_CONFIG[fullItem.rarity].color || rarityColor;
            }
        }

        // E. 播放提示 (带样式的文本)
        if (window.showToast) {
            setTimeout(() => {
                // 构建带颜色的名称 HTML
                const styledName = `<span style="color:${rarityColor}; font-weight:bold;">[${fullItemName}]</span>`;
                const msg = `✨ 集齐上中下三篇，融会贯通，领悟 ${styledName}！`;

                // 1. 弹窗提示
                window.showToast(msg, 4000);

                // 2. 日志输出 (确保 LogManager 存在)
                if (window.LogManager && typeof window.LogManager.add === 'function') {
                    window.LogManager.add(msg);
                } else if (window.UtilsLog && typeof window.UtilsLog.add === 'function') {
                    // 兼容旧版 UtilsLog
                    window.UtilsLog.add(msg);
                }
            }, 500);
        }
    },

    forgetSkill: function(skillId) {
        if (!player.skills || !player.skills[skillId]) return;
        this._unequipIfEquipped(skillId);
        delete player.skills[skillId];
        this._refreshSystem();
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