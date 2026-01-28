// js/core/utils_skill.js
// 功法/技能核心逻辑工具箱
// 【更新】融合提示增加物品稀有度颜色支持 + 日志输出 + 凡尘任务监听
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

        const skillData = (player.skills && player.skills[skillId]) ? player.skills[skillId] : { exp: 0, mastered: false };
        const currentExp = skillData.exp || 0;

        // 1. 获取各项系数
        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;
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

        // A. 获取存档中的大成状态
        let isMastered = skillData.mastered === true;

        // B. 限制上限与瓶颈判断
        let isCapped = false;

        // 如果已经大成，就不存在瓶颈了
        if (isMastered) {
            isCapped = false;
        } else {
            // 如果计算出的等级 超过了 书本的上限
            if (currentLevelIdx >= limitLevel) {
                currentLevelIdx = limitLevel;
                isCapped = true; // 标记为瓶颈，UI会让按钮变灰
            }
        }

        // 4. 计算下一级经验
        let nextLevelExp = -1;
        if (!isMastered && currentLevelIdx < cfg.levels.length - 1) {
            let nextIdx = currentLevelIdx + 1;
            if (nextIdx < cfg.levels.length) {
                nextLevelExp = Math.floor(cfg.levels[nextIdx] * diffMult * typeRate);
            }
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
            id: skillId,
            name: item.name,
            levelName: isMastered ? "大圆满" : (cfg.levelNames[currentLevelIdx] || `${currentLevelIdx}层`),
            levelIdx: currentLevelIdx,
            exp: currentExp,
            nextExp: nextLevelExp,
            bonusRate: bonusRate,
            baseEffects: item.effects || {},
            finalEffects: computedEffects,
            isCapped: isCapped,
            mastered: isMastered,
            limitLevelName: cfg.levelNames[limitLevel] || "未知",
            masteryBonus: masteryBonus
        };
    },

    /* ================= 功法管理 ================= */

    learnSkill: function(skillId, expGain = 0, silent = false) {
        if (!player.skills) player.skills = {};

        const item = GAME_DB.items.find(i => i.id === skillId);
        if (!item) return;

        let isNew = false;
        if (!player.skills[skillId]) {
            player.skills[skillId] = { exp: 0, level: 0, mastered: false };
            isNew = true;

            // ============================================================
            // 【核心修改】凡尘任务埋点：学会新功法 (明心智)
            // ============================================================
            if (window.UtilsMortalTask) {
                window.UtilsMortalTask.updateProgress('learn_skill', 1);
            }
            // ============================================================
        }

        const skillData = player.skills[skillId];
        skillData.exp += expGain;

        this._tryComprehendZhaoshi(skillId);

        let fullItemName = item.name;
        let rarityColor = "#333";
        if (typeof RARITY_CONFIG !== 'undefined' && RARITY_CONFIG[item.rarity]) {
            rarityColor = RARITY_CONFIG[item.rarity].color || rarityColor;
        }
        const styledName = `<span style="color:${rarityColor}; font-weight:bold;">[${fullItemName}]</span>`;

        // 满级自动参悟检查
        const info = this.getSkillInfo(skillId);

        if (info && info.isCapped && !skillData.mastered) {
            skillData.mastered = true;
            const bonusInfo = this._applyMasteryBonus(skillId);

            let bonusMsg = "";
            if (bonusInfo) {
                const attrMap = { 'jing': '精', 'qi': '气', 'shen': '神', 'atk': '攻击', 'def': '防御', 'speed': '速度' };
                const attrName = attrMap[bonusInfo.attr] || bonusInfo.attr;
                bonusMsg = ` 获得轮回加成: ${attrName} +${bonusInfo.value}`;
            }

            const msg = `✨ 醍醐灌顶！${styledName} 已臻大成！${bonusMsg}`;

            if(window.showToast) window.showToast(msg);
            if (window.LogManager) window.LogManager.add(`[系统] ${msg}`);
        }

        if (!silent && window.showToast) {
            if (isNew) {
                window.showToast(`顿悟习得 ${styledName}！`);
            }
        }

        this._checkAndFuseSkills(skillId);
        this._refreshSystem();
    },

    _applyMasteryBonus: function(skillId) {
        const skillData = player.skills[skillId];
        const item = window.GAME_DB.items.find(i => i.id === skillId);

        if (!skillData || !item) return null;

        if (skillData.attr && skillData.value) {
            return { attr: skillData.attr, value: skillData.value };
        }

        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;
        const diffMult = (cfg && cfg.difficulty) ? (cfg.difficulty[rarity] || 1.0) : 1.0;

        const candidates = ['jing', 'qi', 'shen', 'atk', 'def', 'speed'];
        let bestAttrs = [];
        let maxVal = -999;

        if (item.effects) {
            candidates.forEach(key => {
                if (item.effects[key] !== undefined) {
                    const val = item.effects[key];
                    if (val > maxVal) {
                        maxVal = val;
                        bestAttrs = [key];
                    } else if (val === maxVal) {
                        bestAttrs.push(key);
                    }
                }
            });
        }

        if (bestAttrs.length === 0) {
            bestAttrs = candidates;
        }

        const pickedAttr = bestAttrs[Math.floor(Math.random() * bestAttrs.length)];

        skillData.attr = pickedAttr;
        skillData.value = diffMult;

        console.log(`[UtilsSkill] 功法[${item.name}]大成结算: ${pickedAttr} +${diffMult}`);

        return { attr: pickedAttr, value: diffMult };
    },

    _checkAndFuseSkills: function(triggerId) {
        const suffixes = ["_upper", "_middle", "_lower"];
        const targetSuffix = "_full";

        const matchedSuffix = suffixes.find(s => triggerId.endsWith(s));
        if (!matchedSuffix) return;

        const baseId = triggerId.substring(0, triggerId.lastIndexOf(matchedSuffix));
        const partIds = suffixes.map(s => baseId + s);
        const fullId = baseId + targetSuffix;

        const hasAllParts = partIds.every(id => player.skills && player.skills[id]);
        if (!hasAllParts) return;

        if (player.skills[fullId]) return;

        let totalExp = 0;
        partIds.forEach(id => {
            totalExp += player.skills[id].exp;
        });
        const newExp = Math.floor(totalExp / 3);

        partIds.forEach(id => {
            this._unequipIfEquipped(id);
            delete player.skills[id];
        });

        player.skills[fullId] = {
            exp: newExp,
            level: 0,
            mastered: false
        };

        // ============================================================
        // 【核心修改】凡尘任务埋点：合成全篇也算学会新功法
        // ============================================================
        if (window.UtilsMortalTask) {
            window.UtilsMortalTask.updateProgress('learn_skill', 1);
        }
        // ============================================================

        let fullItemName = "绝世神功";
        let rarityColor = "#333";

        const fullItem = books.find(i => i.id === fullId);
        if (fullItem) {
            fullItemName = fullItem.name;
            if (typeof RARITY_CONFIG !== 'undefined' && RARITY_CONFIG[fullItem.rarity]) {
                rarityColor = RARITY_CONFIG[fullItem.rarity].color || rarityColor;
            }
        }

        if (window.showToast) {
            setTimeout(() => {
                const styledName = `<span style="color:${rarityColor}; font-weight:bold;">[${fullItemName}]</span>`;
                const msg = `✨ 集齐上中下三篇，融会贯通，领悟 ${styledName}！`;
                window.showToast(msg, 4000);
                if (window.LogManager && typeof window.LogManager.add === 'function') {
                    window.LogManager.add(msg);
                } else if (window.UtilsLog && typeof window.UtilsLog.add === 'function') {
                    window.UtilsLog.add(msg);
                }
            }, 500);
        }
    },

    _tryComprehendZhaoshi: function(skillId) {
        if (!skillId.endsWith("_full")) return;

        const skillData = player.skills[skillId];
        if (!skillData) return;

        const probability = (skillData.exp || 0) / 1000;

        if (Math.random() < probability) {
            if (typeof all_zhaoshi === 'undefined') {
                console.warn("[UtilsSkill] 招式库 all_zhaoshi 未加载");
                return;
            }

            const targetMove = all_zhaoshi.find(m => m.link_book_id === skillId);
            if (!targetMove) return;

            if (!player.zhaoshi_list) player.zhaoshi_list = {};

            if (!player.zhaoshi_list[targetMove.id]) {
                player.zhaoshi_list[targetMove.id] = JSON.parse(JSON.stringify(targetMove));

                // ============================================================
                // 【核心修改】凡尘任务埋点：领悟新招式 (明心智)
                // ============================================================
                if (window.UtilsMortalTask) {
                    window.UtilsMortalTask.updateProgress('learn_skill', 1);
                }
                // ============================================================

                const msg = `✨ 灵光一闪！你在修炼中领悟了招式：【${targetMove.name}】！`;

                if (window.showToast) window.showToast(msg, 5000);
                if (window.LogManager) {
                    window.LogManager.add(`[领悟] ${msg}`);
                } else {
                    console.log(`[领悟] ${msg}`);
                }

                if (window.saveGame) window.saveGame();
            }
        }
    },

    checkSkillComprehension: function() {
        if (!player.skills || typeof all_zhaoshi === 'undefined') return false;

        let hasNewChange = false;
        if (!player.zhaoshi_list || Array.isArray(player.zhaoshi_list)) {
            player.zhaoshi_list = {};
        }

        for (let skillId in player.skills) {
            const skillData = player.skills[skillId];

            if (skillData.exp >= 600) {
                const move = all_zhaoshi.find(m => m.link_book_id === skillId);

                if (move && !player.zhaoshi_list[move.id]) {
                    player.zhaoshi_list[move.id] = JSON.parse(JSON.stringify(move));
                    hasNewChange = true;

                    // ============================================================
                    // 【核心修改】补发招式也算进度
                    // ============================================================
                    if (window.UtilsMortalTask) {
                        window.UtilsMortalTask.updateProgress('learn_skill', 1);
                    }
                    // ============================================================

                    console.log(`[系统补丁] 检测到功法 ${skillId} 熟练度达标，补发招式：${move.name}`);
                    LogManager.add(`再入世，你突然顿悟了招式：${move.name}`);
                }
            }
        }
        return hasNewChange;
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
    },

    /**
     * 【新增】校验并修复玩家招式数据的完整性
     * 专门用于修复老存档中招式缺少 subType 导致战斗无伤害的问题
     */
    validateZhaoshiIntegrity: function() {
        // 1. 基础检查
        if (!window.player || !window.player.zhaoshi_list) return;

        // 确保全局招式库已加载
        if (typeof window.all_zhaoshi === 'undefined') {
            console.warn("[UtilsSkill] 全局招式库 all_zhaoshi 未加载，跳过完整性校验");
            return;
        }

        let fixCount = 0;
        const userSkills = window.player.zhaoshi_list;

        // 2. 遍历玩家所有招式
        for (let skillId in userSkills) {
            const userSkill = userSkills[skillId];

            // 检查 subType 是否存在且有效
            if (!userSkill.subType) {
                // 从全局配置中查找原始数据
                const originalData = window.all_zhaoshi.find(s => s.id === skillId);

                if (originalData) {
                    // 3. 修复数据
                    console.log(`[UtilsSkill] 发现招式 [${userSkill.name}] 数据残缺，正在修复...`);

                    userSkill.subType = originalData.subType;

                    // 顺便检查一下其他关键战斗字段，如果缺失一并补全
                    if (!userSkill.formulaType) userSkill.formulaType = originalData.formulaType;
                    if (userSkill.damageType) userSkill.damageType = originalData.damageType;

                    fixCount++;
                } else {
                    console.warn(`[UtilsSkill] 招式 [${skillId}] 在全局配置中未找到，无法修复。`);
                }
            }
        }

        // 4. 如果有修复，保存存档
        if (fixCount > 0) {
            console.log(`[UtilsSkill] 招式完整性校验完成，共修复 ${fixCount} 个招式。`);
            if (window.saveGame) window.saveGame();
            if (window.showToast) window.showToast(`系统自动修复了 ${fixCount} 个招式数据`);
        }
    },
};

window.UtilsSkill = UtilsSkill;