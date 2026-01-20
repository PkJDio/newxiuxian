// js/core/utils_life_skills.js
// 生活技能核心管理器 v2.2 (UI数据适配 + 技能裁剪)

const UtilsLifeSkills = {
    MAX_LEVEL: 10,
    BASE_EXP_REQ: 100,

    // 定义要显示的技能列表 (顺序控制)
    // 已移除: swimming(泅水), medicine(岐黄)
    SKILL_KEYS: ["fishing", "cooking", "alchemy", "gathering", "gambling"],

    getNextLevelExp: function(currentLevel) {
        if (currentLevel >= this.MAX_LEVEL) return 999999999;
        return (currentLevel + 1) * this.BASE_EXP_REQ;
    },

    getSkillData: function(key) {
        if (!window.player) return null;
        if (!window.player.lifeSkills) window.player.lifeSkills = {};

        if (!window.player.lifeSkills[key]) {
            window.player.lifeSkills[key] = {
                name: this._getDefaultName(key),
                exp: 0,
                level: 0,
                desc: this._getDefaultDesc(key)
            };
        }

        const skill = window.player.lifeSkills[key];
        if (skill.level === undefined) {
            skill.level = 0;
            this._processLevelUp(skill, false);
        }
        return skill;
    },

    addExp: function(key, amount) {
        const skill = this.getSkillData(key);
        if (!skill) return;
        if (skill.level >= this.MAX_LEVEL) return;

        skill.exp = (skill.exp || 0) + amount;
        this._processLevelUp(skill, true);

        if (window.saveGame) window.saveGame();
    },

    getLevel: function(key) {
        const skill = this.getSkillData(key);
        return skill ? (skill.level || 0) : 0;
    },

    // --- 【新增】UI 数据接口 ---
    /**
     * 获取所有生活技能的显示数据列表
     * @returns {Array} 包含技能详情的数组
     */
    getSkillListForUI: function() {
        return this.SKILL_KEYS.map(key => {
            const skill = this.getSkillData(key);
            const maxExp = this.getNextLevelExp(skill.level);
            const isMax = skill.level >= this.MAX_LEVEL;

            // 计算进度百分比
            let percent = 0;
            if (isMax) percent = 100;
            else percent = Math.min(100, (skill.exp / maxExp) * 100);

            // 获取境界名称 (每3级一个境界，或者简单的 Lv 显示)
            const realmNames = ["初窥门径", "略有小成", "融会贯通", "登峰造极", "返璞归真"];
            const realmIndex = Math.min(Math.floor(skill.level / 3), realmNames.length - 1);
            const realmStr = realmNames[realmIndex];

            return {
                key: key,
                name: skill.name,
                desc: skill.desc || this._getDefaultDesc(key),
                level: skill.level,
                exp: skill.exp,
                maxExp: maxExp,
                isMax: isMax,
                percent: percent,
                realm: realmStr
            };
        });
    },

    // --- 内部逻辑 ---

    _processLevelUp: function(skill, showToast) {
        let leveledUp = false;
        while (true) {
            let reqExp = this.getNextLevelExp(skill.level);
            if (skill.exp >= reqExp && skill.level < this.MAX_LEVEL) {
                skill.exp -= reqExp;
                skill.level++;
                leveledUp = true;
                console.log(`[LifeSkill] ${skill.name} 升级 -> Lv.${skill.level}`);
            } else {
                break;
            }
        }
        if (leveledUp && showToast) {
            const msg = `生活技能【${skill.name}】提升至 Lv.${skill.level}！`;
            if (window.showToast) window.showToast(msg);
            if (window.LogManager) window.LogManager.add(`<span style="color:#4caf50">${msg}</span>`);
        }
    },

    _getDefaultName: function(key) {
        const names = {
            "cooking": "庖丁",
            "fishing": "垂钓",
            "gathering": "寻幽",
            "alchemy": "炼丹",
            "gambling": "赌术"
        };
        return names[key] || "未知技能";
    },

    _getDefaultDesc: function(key) {
        const descs = {
            "cooking": "烹饪美食，去除毒性。",
            "fishing": "姜太公钓鱼，获取水产。",
            "gathering": "搜山寻宝，提升采集产量。",
            "alchemy": "炼丹术，提升炼丹成功率。",
            "gambling": "推牌九，掷骰子，洞察天机。"
        };
        return descs[key] || "尚不熟练。";
    }
};

window.UtilsLifeSkills = UtilsLifeSkills;