// js/core/utils_gongfa.js
// 功法数据工具类：适配新版存档结构 (equipment.gongfa 数组 + player.skills 映射)

const UtilsGongfa = {

    /**
     * 获取玩家当前装备的所有功法详情
     * @returns {Array} 功法对象数组 [{id, name, rarity, level, color...}]
     */
    getEquippedGongfaDetail: function() {
        if (!window.player || !player.equipment) return [];

        const p = window.player;

        // 1. 获取已装备的功法ID列表
        // 根据截图，ID存储在 player.equipment.gongfa 数组中
        let rawIds = [];

        // 主要来源：equipment.gongfa 数组
        if (p.equipment.gongfa && Array.isArray(p.equipment.gongfa)) {
            rawIds = rawIds.concat(p.equipment.gongfa);
        }

        // 兼容性检查：防止某些旧逻辑还在用 gongfa_int/ext
        if (p.equipment.gongfa_int && Array.isArray(p.equipment.gongfa_int)) {
            rawIds = rawIds.concat(p.equipment.gongfa_int);
        }
        if (p.equipment.gongfa_ext && Array.isArray(p.equipment.gongfa_ext)) {
            rawIds = rawIds.concat(p.equipment.gongfa_ext);
        }

        // 去重并过滤掉 null/undefined/空字符串
        rawIds = [...new Set(rawIds)].filter(id => id);

        // 2. 组装详细数据
        const result = [];

        // 稀有度颜色配置 (背景色用于书皮)
        const rarityMap = {
            1: { color: '#757575', bg: '#e0e0e0' }, // 凡品 (灰)
            2: { color: '#2e7d32', bg: '#a5d6a7' }, // 良品 (绿)
            3: { color: '#1565c0', bg: '#90caf9' }, // 上品 (蓝)
            4: { color: '#7b1fa2', bg: '#ce93d8' }, // 极品 (紫)
            5: { color: '#ff8f00', bg: '#ffcc80' }, // 绝品 (橙)
            6: { color: '#c62828', bg: '#ef9a9a' }  // 仙品 (红)
        };

        rawIds.forEach(sid => {
            // A. 获取静态配置 (从数据库拿名字、稀有度、描述)
            let item = null;
            if (window.GAME_DB && window.GAME_DB.items) {
                item = window.GAME_DB.items.find(i => i.id === sid);
            }
            // 兼容旧书本数据源
            if (!item && typeof books !== 'undefined') {
                item = books.find(i => i.id === sid);
            }

            if (!item) return; // 如果数据库里都没这个书，跳过

            // B. 获取动态数据 (从 player.skills 里拿熟练度、等级)
            // 根据截图，skills 是一个对象: { "book_id": { exp: 100, level: 0 ... } }
            let skillData = { exp: 0, level: 0, mastered: false };
            if (p.skills && p.skills[sid]) {
                skillData = p.skills[sid];
            }

            const rarityConf = rarityMap[item.rarity] || rarityMap[1];

            result.push({
                id: sid,
                name: item.name,
                rarity: item.rarity,
                rarityColor: rarityConf.color, // 文字/边框色
                rarityBg: rarityConf.bg,       // 背景色
                exp: skillData.exp || 0,
                level: skillData.level || 0,
                mastered: skillData.mastered || false,
                desc: item.desc
            });
        });

        return result;
    }
};

window.UtilsGongfa = UtilsGongfa;