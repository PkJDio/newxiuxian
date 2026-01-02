// 常量配置：RARITY_CONFIG 等
console.log("加载 常量配置")


const RARITY_CONFIG = {
    1: { name: "普通", color: "#818181" }, // 灰
    2: { name: "优秀", color: "#258625" }, // 绿
    3: { name: "精良", color: "#2b58a6" }, // 蓝
    4: { name: "史诗", color: "#a61a73" }, // 紫
    5: { name: "传说", color: "#ceae04" }, // 金
    6: { name: "神话", color: "#c23601" }  // 红
};

const TYPE_MAPPING = {
    'material': '材料', 'foodMaterial': '食材', 'food': '料理',
    'weapon': '兵器', 'head': '头盔','body': '衣服','feet': '鞋子',
    'book': '书籍',
    'pill': '丹药', 'herb': '草药', 'tool': '工具',
    'mount': '坐骑', 'fishing_rod': '钓具'
};
// 【新增】属性名映射表 (用于悬浮窗显示)
const ATTR_MAPPING = {
  // 基础属性
  "jing": "精(体质)",
  "qi": "气(能量)",
  "shen": "神(悟性)",

  // 战斗属性
  "hpMax": "生命上限",
  "hp_max": "生命上限",
  "mpMax": "法力上限",
  "hp": "生命",
  "mp": "法力",
  "atk": "攻击",
  "def": "防御",
  "speed": "速度",
  "critRate": "暴击率",
  "critDmg": "暴击伤害",
  "dodge": "闪避",

  // 生活/特殊
  "mining": "采矿效率",
  "gathering": "采集效率",
  "alchemy": "炼丹成功率",
  "luck": "气运",
  "storage": "背包空间",
  //饱食度
  "hunger": "饱食度",
  //功法上限
  "max_skill_level": "修行上限",
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
  dmgBonus: [0, 0.10, 0.20, 0.30],
  hitRate: [0.7, 1.0, 1.0, 1.0],
  difficulty: [1, 1, 1.5, 2.0,2.5,3.0],

};

// 4. 玩家初始模板 (新档使用)
const PLAYER_TEMPLATE = {
  version: CURRENT_GAME_VERSION,
  name: "未命名",
  isAlive: true,
  generation:1 ,
  money: 10,

  // 基础进度
  age: 16,
  dayCount: 0,
  timeHours: 7, // 辰时
  worldSeed: 20251227, // 默认种子，开始游戏时会随机覆盖

  // 位置
  coord: { x: 1350, y: 1350 }, // 对应新地图关中区域
  location: 'guanzhong',
  mapUnlocked: false,

  // 核心属性
  attr: { jing: 5, qi: 5, shen: 5 },

  // 衍生属性 (初始占位，实际由 recalcStats 计算)
  derived: { hpMax: 200, mpMax: 100, storageMax: 40, speed: 3 },

  // 动态状态
  status: { hp: 200, mp: 100, hunger: 100, mood: 100, toxicity: 0 },

  // 疲劳系统
  fatigue: 0,
  lastRestTime: 0,

  // 经济与经验
  money: 0,
  levelIndex: 0,
  exp: 0,
  maxExp: 100,
  cultivation_base: 0,

  // 战斗与探索记录
  defeatedEnemies: [], // ["unique_key_1", ...]
  harvestedGrids: {},  // { "month_x_y": count }

  // 物品与装备
  inventory: [],
  equipment: {
    weapon: null, head: null, body: null, feet: null,
    mount: null, fishing_rod: null,
    gongfa_ext: [], // 外功数组
    gongfa_int: []  // 内功数组
  },

  // 技能与Buff
  skills: {}, // { "skill_id": { level:0, exp:0, mastered:false } }
  lifeSkills: {
    "swimming": { name: "泅水", exp: 0, desc: "浪里白条，影响水域移动速度。" },
    "cooking":  { name: "庖丁", exp: 0, desc: "烹饪美食，去除毒性。" },
    "fishing":  { name: "垂钓", exp: 0, desc: "姜太公钓鱼，获取水产。" },
    "medicine": { name: "岐黄", exp: 0, desc: "悬壶济世，提升药效与鉴定。" },
    "gathering":{ name: "采薇", exp: 0, desc: "搜山寻宝，提升采集产量。" }
  },
  learnedRecipes: [], // ["food_01", ...]
  buffs: {}, // { "buff_id": { attr, val, days } }

  logs: []
};
