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

            // =========== 【核心修改开始】 ===========

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

            // =========== 【核心修改结束】 ===========

            // 4. 计算下一级经验
            let nextLevelExp = -1;
            // 如果没大成，且没到系统最大等级，且没被卡在瓶颈(或者卡在瓶颈显示当前等级上限)
            if (!isMastered && currentLevelIdx < cfg.levels.length - 1) {
                // 如果是瓶颈状态，nextExp 显示为升级所需经验，方便 UI 显示进度条满了
                // 或者是 limitLevel 的下一级经验
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
                id: skillId, // 补充ID方便UI使用
                name: item.name,
                levelName: isMastered ? "大圆满" : (cfg.levelNames[currentLevelIdx] || `${currentLevelIdx}层`),
                levelIdx: currentLevelIdx,
                exp: currentExp,
                nextExp: nextLevelExp,
                bonusRate: bonusRate,
                baseEffects: item.effects || {},
                finalEffects: computedEffects,

                // 【关键】必须返回这两个状态，UI 才能判断是否变灰
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
        }

        const skillData = player.skills[skillId];
        skillData.exp += expGain;

        // 获取全篇物品名称及颜色 (用于日志)
        let fullItemName = item.name;
        let rarityColor = "#333";
        if (typeof RARITY_CONFIG !== 'undefined' && RARITY_CONFIG[item.rarity]) {
            rarityColor = RARITY_CONFIG[item.rarity].color || rarityColor;
        }
        const styledName = `<span style="color:${rarityColor}; font-weight:bold;">[${fullItemName}]</span>`;

        // ----------------------------------------------------
        // 【核心修改点】满级自动参悟检查 + 注入轮回属性
        // ----------------------------------------------------
        // 注意：这里需要调用真实的 getSkillInfo 来判断是否满了
        const info = this.getSkillInfo(skillId);

        // 如果 经验已达瓶颈(isCapped) 且 尚未标记大成
        if (info && info.isCapped && !skillData.mastered) {
            skillData.mastered = true;

            // >>> 调用新方法：生成并写入轮回属性 <<<
            const bonusInfo = this._applyMasteryBonus(skillId);

            // 构造提示信息
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
        // ----------------------------------------------------

        if (!silent && window.showToast) {
            if (isNew) {
                window.showToast(`顿悟习得 ${styledName}！`);
            } else if (expGain > 0) {
                // 如果刚刚大成，上面已经弹窗了，这里可以根据需求决定是否再弹
                // 简单起见，这里不再重复弹 "勤学苦练"
            }
        }

        // 检查融合
        this._checkAndFuseSkills(skillId);
        this._refreshSystem();
    },

    /**
     * 【新增】内部方法：计算并写入功法大成属性
     * 规则：取功法属性加成最高的一项（若相同则随机），数值为难度系数
     */
    _applyMasteryBonus: function(skillId) {
        const skillData = player.skills[skillId];
        const item = window.GAME_DB.items.find(i => i.id === skillId);

        if (!skillData || !item) return null;

        // 如果已经有属性了，直接返回现有的（防止重复随机）
        if (skillData.attr && skillData.value) {
            return { attr: skillData.attr, value: skillData.value };
        }

        const cfg = window.SKILL_CONFIG;
        const rarity = item.rarity || 1;

        // 1. 获取加成数值 (难度系数)
        const diffMult = (cfg && cfg.difficulty) ? (cfg.difficulty[rarity] || 1.0) : 1.0;

        // 2. 检查功法属性倾向
        // 候选属性池
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

        // 如果该功法没有任何基础属性加成（例如纯机制类），则从所有属性中随机一个
        if (bestAttrs.length === 0) {
            bestAttrs = candidates;
        }

        // 3. 随机取一个 (如果有多个最高属性)
        const pickedAttr = bestAttrs[Math.floor(Math.random() * bestAttrs.length)];

        // 4. 写入存档
        skillData.attr = pickedAttr;
        skillData.value = diffMult;

        console.log(`[UtilsSkill] 功法[${item.name}]大成结算: ${pickedAttr} +${diffMult}`);

        return { attr: pickedAttr, value: diffMult };
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