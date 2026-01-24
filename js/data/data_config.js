// 常量配置：RARITY_CONFIG 等
//console.log("加载 常量配置")


const RARITY_CONFIG = {
    1: {name: "普通", color: "#818181"}, // 灰
    2: {name: "优秀", color: "#258625"}, // 绿
    3: {name: "精良", color: "#2b58a6"}, // 蓝
    4: {name: "史诗", color: "#a61a73"}, // 紫
    5: {name: "传说", color: "#ceae04"}, // 金
    6: {name: "神话", color: "#c23601"}  // 红
};

const TYPE_MAPPING = {
    'material': '材料', 'foodMaterial': '食材',"herbs":"草药","spiritItem":"灵物","fooding":"食材", 'food': '料理','fish':'鱼', 'weapon': '武器', 'head': '头盔', 'body': '铠甲', 'feet': '靴子', 'book': '书籍', 'pill': '丹药', 'herb': '草药', 'tool': '工具', 'mount': '坐骑', 'fishing_rod': '渔具'
};
// 【新增】属性名映射表 (用于悬浮窗显示)
const ATTR_MAPPING = {
    "jing": "精(体质)", "qi": "气(能量)", "shen": "神(悟性)","herbs":"草药",
    "hpMax": "生命上限", "hp_max": "生命上限", "max_hp": "生命上限",
    "mpMax": "法力上限", "max_mp": "法力上限",
    "hp": "生命", "mp": "法力",
    "atk": "攻击力", "def": "防御力",
    "phy_atk": "物理攻击", "mag_atk": "法术攻击",
    "phy_def": "物理防御", "mag_def": "法术防御",
    "crit": "物理暴击率", "mag_crit": "法术暴击率",
    "plate": "板甲", "heavy": "重甲", "light": "轻甲", "leather": "皮甲", "cloth": "布甲",
    "speed": "速度", "critRate": "暴击率", "critDmg": "暴击伤害", "dodge": "闪避",
    "toxicity": "毒性", "space": "背包空间", "catchRate": "钓鱼成功机率",
    "sharpness": "锋利度", "penetration": "法术穿透",
    "mining": "采矿效率", "gathering": "采集效率", "alchemy": "炼丹成功率", "luck": "气运",
    "storage": "背包空间", "hunger": "饱食度",
    "max_skill_level": "修行上限", "studyEff": "研读效率",
    "money": "金钱", "stabilizer": '稳定', "catalyst": '药引', "heal": "愈合","fooding":"食材"
};

/* ================= 游戏核心常量配置 ================= */

// 1. 游戏版本
const CURRENT_GAME_VERSION = "3.0";

// 全局配置：存档键名 (修改此处可重置所有玩家存档)
const SAVE_KEY = "xiuxian_save_data_v1";

// 【新增】日志系统配置
const LOG_SAVE_KEY = "xiuxian_game_logs_v1"; // 日志缓存Key
const LOG_MAX_ENTRIES = 250; // 最大保留条数 (250条 x 2行/条 = 500行)

// 2. 时辰名称
const SHICHEN_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 3. 技能/功法配置
const SKILL_CONFIG = {
    levels: [0, 100, 400, 999],
    levelNames: ["未入门", "入门", "进阶", "大成"],
    dmgBonus: [-0.5, -0.2, 0, 0.30],
    hitRate: [0.7, 1.0, 1.0, 1.0],
    // 【新增】难度系数/转世加成系数 (索引对应稀有度：0位占位, 1=普通, 2=优秀...)
    // 稀有度:  0  1    2    3    4    5    6
    difficulty: [1, 1, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0], // 【新增】全局熟练度需求系数 (控制不同类型功法的升级快慢)
    // 这里的数值会直接乘在升级所需经验上
    // 例如：外功 0.85 意味着只需要 85% 的熟练度就能升级
    typeExpRate: {
        "body"       : 1.0,       // 外功：修炼要求降低
        "cultivation": 1.0  // 内功：标准要求
    }
};

// 4. 玩家初始模板 (新档使用)
const PLAYER_TEMPLATE = {
    version: CURRENT_GAME_VERSION, name: "未命名", isAlive: true, generation: 1, money: 10,
    // 【新增】灵气资源
    spiritEnergy: 0,
    gongfa_nums: 1,
    zhaoshi_nums: 1,
    // --- 新增凡尘修行字段 ---
    mortal_rank: 0,        // 当前境界索引 (0:开窍...4:登峰)
    mortal_exp: 0,         // 当前积淀值
    mortal_exp_max: 1200,  // 当前境界所需最大值
    is_bottleneck: false,  // 是否处于瓶颈期

    // 记录每层突破的选择，用于 recalcStats 计算属性加成
    // 格式示例: [ {path: 'attack', val: 0.15}, {path: 'balance', val: 0.05} ]
    mortal_path_history: {},
    studyProgress: {},
    currentStudyTarget: null,
    age: 16, dayCount: 0, timeHours: 7,
    worldSeed: 20251227,
    timeStart: 0,
    startDanger: 0,
    coord: {x: 2770, y: 2653},
    location: 'guanzhong', mapUnlocked: false,
    consumables: [null, null, null],

    // 【修改】基础属性模板 (新增拆分属性)
    attr: {
        jing: 5, qi: 5, shen: 5,
        atk: 0, def: 0, // 保留作为基础值或显示值
        phy_atk: 0, mag_atk: 0, // 新增
        phy_def: 0, mag_def: 0, // 新增
        speed: 0, space: 0,
        hpMax: 200, mpMax: 100, hungerMax: 0, fatigueMax: 0,
        //物理暴击率


    },

    // 【修改】额外加成
    exAttr: {
        jing: 0, qi: 0, shen: 0,
        atk: 0, def: 0,
        phy_atk: 0, mag_atk: 0,
        phy_def: 0, mag_def: 0,
        speed: 0, space: 0,
        hpMax: 0, mpMax: 0, hungerMax: 0, fatigueMax: 0
    },

    // 【修改】最终衍生属性
    derived: {
        jing: 5, qi: 5, shen: 5,
        atk: 0, def: 0,
        phy_atk: 0, mag_atk: 0,
        phy_def: 0, mag_def: 0,
        speed: 0, space: 0,
        hpMax: 200, mpMax: 0, hungerMax: 0, fatigueMax: 0
    },
    // 动态状态
    status: {hp: 9999, mp: 9999, hunger: 9999, mood: 100, toxicity: 0, fatigue: 0},
    //寻幽记录
    gatherRecords:{},
    // 经济与经验
    money: 0, levelIndex: 0, exp: 0, maxExp: 100, cultivation_base: 0,

    // 战斗与探索记录
    defeatedEnemies: [], // ["unique_key_1", ...]
    harvestedGrids : {},  // { "month_x_y": count }

    // 物品与装备
    inventory: [], equipment: {
        weapon    : null, head: null, body: null, feet: null, mount: null, fishing_rod: null, gongfa_ext: [], // 外功数组
        gongfa_int: []  // 内功数组
    },

    // 技能与Buff
    skills           : {}, // { "skill_id": { level:0, exp:0, mastered:false } }
    lifeSkills       : {

        "cooking": {name: "庖丁", exp: 0, desc: "烹饪美食，去除毒性。"},
        "fishing": {name: "垂钓", exp: 0, desc: "姜太公钓鱼，获取水产。"},

        "gathering": {name: "寻幽", exp: 0, desc: "搜山寻宝，提升采集产量。"},
        //炼丹
        "alchemy": {name: "炼丹", exp: 0, desc: "炼丹术，提升炼丹成功率。"},
    }, learnedRecipes: [], // ["food_01", ...]
    alchemyHistory:{},
    buffs            : {}, // { "buff_id": { attr, val, days } }

    logs: [], time: {         // 新增：时间系统存档数据
        year: 37, month: 1, day: 1, hour: 0 // 0-23
    }
};
// =========================================================
// 【核心修正】将常量显式挂载到 window，防止其他文件访问不到
// =========================================================
window.RARITY_CONFIG = RARITY_CONFIG;
window.TYPE_MAPPING = TYPE_MAPPING;
window.ATTR_MAPPING = ATTR_MAPPING;
window.CURRENT_GAME_VERSION = CURRENT_GAME_VERSION;
window.SAVE_KEY = SAVE_KEY;
window.SKILL_CONFIG = SKILL_CONFIG;
window.PLAYER_TEMPLATE = PLAYER_TEMPLATE;
window.SHICHEN_NAMES = SHICHEN_NAMES;
