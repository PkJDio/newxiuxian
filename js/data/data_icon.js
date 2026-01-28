// js/data/data_icon.js
//console.log("加载 图标配置");
// 辅助函数：生成图标 HTML

const ITEM_ICONS = {
    // 默认类型图标 (兜底用)
    default: "📦",

    // 基础类型映射
    material: "🧱",      // 材料
    foodMaterial: "🌾",  // 食材
    food: "🍲",          // 料理
    weapon: "⚔️",         // 兵器
    head: "🧢",          // 头盔
    body: "🥋",          // 衣服
    feet: "👢",          // 鞋子
    book: "📘",          // 书籍
    pill: "💊",          // 丹药
    herb: "🌿",          // 草药
    tool: "🪓",          // 工具
    mount: "🐎",         // 坐骑
    fishing_rod: "🎣",   // 钓具
    fish: "🐟",
    spiritItem: "💎",
    herbs:"🌿",
    // 属性图标 (供 UI 使用)
    money: "💰",
    attack: "⚔️",
    defense: "🛡️",
    speed: "🦶",
    hp: "❤️",
    mp: "💧"
};

/**
 * 名字关键词映射表
 * 系统会遍历这个列表，如果物品名字包含 key，就使用对应的 icon。
 * 注意：越具体的词应该放在越前面，越通用的放后面。
 */
const NAME_KEYWORD_MAP = [
    // --- 兵器类 ---
    // { key: "剑", icon: "🗡️" },
    // { key: "刀", icon: "🔪" },
    // { key: "刃", icon: "🗡️" },
    // { key: "枪", icon: "🔱" }, // 长枪
    // { key: "矛", icon: "🔱" },
    // { key: "弓", icon: "🏹" },
    // { key: "弩", icon: "🏹" },
    // { key: "箭", icon: "🏹" },
    // { key: "斧", icon: "🪓" },
    // { key: "锤", icon: "🔨" },
    // { key: "棍", icon: "🥢" },
    // { key: "杖", icon: "🥖" },
    // // { key: "鞭", icon: "🧶" },
    // { key: "镖", icon: "✴️" },

    // --- 装备类 ---
    // { key: "盔", icon: "⛑️" },
    // { key: "帽", icon: "🧢" },
    // { key: "冠", icon: "👑" },
    // { key: "巾", icon: "🧣" },
    // { key: "甲", icon: "🛡️" }, // 铠甲
    // { key: "袍", icon: "👘" },
    // { key: "衣", icon: "👕" },
    // { key: "衫", icon: "👕" },
    // { key: "鞋", icon: "👞" },
    // { key: "靴", icon: "👢" },
    // { key: "履", icon: "🥿" },
    // { key: "戒", icon: "💍" },
    // { key: "镯", icon: "⭕" },
    // { key: "玉佩", icon: "📿" },
    // { key: "护符", icon: "🧿" },

    // --- 丹药/草药类 ---
    // { key: "丹", icon: "💊" },
    // { key: "丸", icon: "💊" },
    // { key: "散", icon: "🧂" }, // 粉末状
    // { key: "膏", icon: "🧴" },
    // { key: "液", icon: "🧪" },
    // { key: "露", icon: "💧" },
    // { key: "水", icon: "💧" },
    // { key: "草", icon: "🌿" },
    // { key: "花", icon: "🌸" },
    // { key: "叶", icon: "🍃" },
    // { key: "根", icon: "🥕" },
    // { key: "果", icon: "🍎" },
    // { key: "莲", icon: "🏵️" },
    // { key: "参", icon: "🥕" }, // 人参
    // { key: "芝", icon: "🍄" }, // 灵芝
    // { key: "菇", icon: "🍄" },

    // --- 书籍/功法类 ---
    // { key: "经", icon: "📜" },
    // { key: "书", icon: "📖" },
    // { key: "籍", icon: "📘" },
    // { key: "谱", icon: "🎼" },
    // { key: "卷", icon: "📜" },
    // { key: "图", icon: "🗺️" },
    // { key: "诀", icon: "📑" },
    // { key: "法", icon: "📚" },
    // { key: "功", icon: "🧘" },

    // --- 食材/料理类 ---
    // { key: "肉", icon: "🍖" },
    // { key: "鱼", icon: "🐟" },
    // { key: "虾", icon: "🦐" },
    // { key: "蟹", icon: "🦀" },
    // { key: "鸡", icon: "🐓" },
    // { key: "鸭", icon: "🦆" },
    // { key: "牛", icon: "🐂" },
    // { key: "羊", icon: "🐏" },
    // { key: "猪", icon: "🐖" },
    // { key: "蛋", icon: "🥚" },
    // { key: "米", icon: "🍚" },
    // { key: "饭", icon: "🍚" },
    // { key: "面", icon: "🍜" },
    // { key: "粉", icon: "🍜" },
    // { key: "汤", icon: "🍲" },
    // { key: "酒", icon: "🍶" },
    // { key: "酿", icon: "🍶" },
    // { key: "茶", icon: "🍵" },
    // { key: "饼", icon: "🥮" },
    // { key: "菜", icon: "🥬" },
    // { key: "瓜", icon: "🍈" },
    //
    // // --- 材料/矿物类 ---
    // { key: "矿", icon: "⛏️" },
    // // { key: "石", icon: "🪨" },
    // { key: "铁", icon: "🔩" },
    // { key: "铜", icon: "🥉" },
    // { key: "银", icon: "🥈" },
    // { key: "金", icon: "🥇" },
    // { key: "玉", icon: "💎" },
    // { key: "晶", icon: "💎" },
    // // { key: "木", icon: "🪵" },
    // { key: "树", icon: "🌲" },
    // { key: "皮", icon: "🦴" }, // 兽皮
    // { key: "毛", icon: "🦴" },
    // { key: "骨", icon: "🦴" },
    // { key: "鳞", icon: "🧬" },
    // { key: "符", icon: "🟨" },
    //
    // // --- 坐骑/动物 ---
    // { key: "马", icon: "🐎" },
    // // { key: "驴", icon: "🫏" },
    // { key: "鹿", icon: "🦌" },
    // { key: "鹤", icon: "🦢" },
    // { key: "虎", icon: "🐅" },
    // { key: "狮", icon: "🦁" },
    // { key: "龙", icon: "🐉" },
    // { key: "剑", icon: "🗡️" }, // 飞剑
    //
    // // --- 工具 ---
    // { key: "镐", icon: "⛏️" },
    // { key: "锄", icon: "⚒️" },
    // { key: "镰", icon: "🌾" },
    // { key: "竿", icon: "🎣" }
];

/**
 * 获取物品图标
 * 优先级:
 * 1. 物品数据自带 icon
 * 2. 物品名字匹配关键字
 * 3. 物品类型默认图标
 * 4. 通用默认图标
 */
function getItemIcon(item) {
    if (!item) return ITEM_ICONS.default;

    // 1. 如果物品数据里单独配了 icon 字段，且不为空，优先用那个
    if (item.icon && item.icon.trim() !== "") {
        return item.icon;
    }

    // 2. 根据中文名字匹配 (遍历映射表)
    // if (item.name) {
    //     for (let i = 0; i < NAME_KEYWORD_MAP.length; i++) {
    //         const entry = NAME_KEYWORD_MAP[i];
    //         // 只要名字里包含这个字，就返回对应图标
    //         if (item.name.includes(entry.key)) {
    //             return entry.icon;
    //         }
    //     }
    // }
    if (item.id=="spiritItem_001"){
        return "👝";
    }

    if(item.subType=="herbs" || item.subType=="草药"){
        return "🌿";
    }
    if(item.subType=="fish"){
        return "🐟️";
    }
    if(item.type=="weapon"){
        return "⚔️";
    }


    // 3. 根据类型返回 (类型映射表)
    if (item.type && ITEM_ICONS[item.type]) {
        return ITEM_ICONS[item.type];
    }



    // 4. 绝对保底
    return ITEM_ICONS.default;
}

// 导出到全局
window.ITEM_ICONS = ITEM_ICONS;
window.getItemIcon = getItemIcon;