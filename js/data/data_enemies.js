// ================= 1. 敌人模板 (Templates) =================
const ENEMY_TEMPLATES = {
    "minion": {
        name       : "杂鱼",
        color      : "#212121",
        basePen    : 0,
        multipliers: {hp: 1.0, atk: 1.0, def: 1.0, speed: 1.0, exp: 1.0, money: 1.0}
    },
    "elite" : {
        name       : "精英",
        color      : "#1e5faf",
        basePen    : 5, // 精英微量穿甲
        multipliers: {hp: 3.5, atk: 1.3, def: 1.2, speed: 1.1, exp: 3.0, money: 2.5}
    },
    "boss"  : {
        name       : "头目",
        color      : "#56059f",
        basePen    : 15, // 头目具备穿甲能力
        multipliers: {hp: 12.0, atk: 1.8, def: 1.4, speed: 1.15, exp: 10.0, money: 10.0}
    },
    "lord"  : {
        name       : "领主",
        color      : "#a60518",
        basePen    : 30, // 领主高穿甲，克制重甲
        multipliers: {hp: 30.0, atk: 2.2, def: 1.8, speed: 1.25, exp: 50.0, money: 50.0}
    }
};
// 定义怪物的具体生态类型
const MONSTER_SUBTYPES = {
    HUMAN: 'human',     // 人型 (强盗、叛军)
    BEAST: 'beast',     // 兽型 (狼、熊)
    INSECT: 'insect',   // 虫豸型 (蜘蛛、蝎子)
    GIANT: 'giant',     // 巨兽型 (独眼巨人)
    UNDEAD: 'undead'    // (扩展) 亡灵型
};

// 定义类型的掉落规则配置
const SUBTYPE_CONFIG = {
    [MONSTER_SUBTYPES.HUMAN]: {
        label: "人型",
        dropGold: true,      // 人会带钱
        dropMaterial: true,  // 人会掉装备或杂物
        goldRate: 1.0        // 金钱掉落倍率
    },
    [MONSTER_SUBTYPES.BEAST]: {
        label: "兽型",
        dropGold: false,     // 野兽通常没钱
        dropMaterial: true,  // 掉皮毛、牙齿
        goldRate: 0.0
    },
    [MONSTER_SUBTYPES.INSECT]: {
        label: "虫豸型",
        dropGold: false,
        dropMaterial: true,  // 掉毒囊、甲壳
        goldRate: 0.0
    },
    [MONSTER_SUBTYPES.GIANT]: {
        label: "巨兽型",
        dropGold: true,      // 巨兽巢穴可能有宝藏
        dropMaterial: true,  // 掉稀有素材
        goldRate: 2.0        // 掉落更多金钱
    }
};

// 辅助函数：应用模板属性
// (游戏初始化时需调用此逻辑处理 rawEnemies)
// ================= 2. 敌人列表 (Enemies) =================
// ================= 2. 敌人数据构建 =================

// --- Part A: 全区域通用 (Global) [20条] ---
const enemies_all = [
    // ==========================================
    // 1. 基础野兽
    // ==========================================
    {
        id: "global_001", template: "minion", name: "流浪野狗", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        stats: { hp: 30, atk: 5, def: 0, speed: 6 },
        money: [0, 0],
        drops: [
            { id: " materials_001", rate: 0.4 },
            { id: "materials_002", rate: 0.3 },
        ],
        skills: [],
        desc: "乱世中随处可见的野狗，双眼发红，为了护食非常凶狠。"
    },
    {
        id: "global_002", template: "minion", name: "疯狂老鼠", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        stats: { hp: 20, atk: 3, def: 0, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_028", rate: 0.1 }
        ],
        skills: [],
        desc: "体型硕大的老鼠，为了抢一口吃的，连人都敢咬。"
    },
    {
        id: "global_003", template: "minion", name: "草丛毒蛇", region: "all", spawnType: "grass", timeStart: 0,
        subType: "insect", // 爬虫类归为insect或beast，此处用insect区分毒物特性
        stats: { hp: 25, atk: 20, def: 0, speed: 12, toxicity: 40 }, // toxicity 保留
        money: [0, 0],
        drops: [
            { id: "materials_029", rate: 0.2 },
            { id: "materials_005", rate: 0.4 },
            { id: "materials_010", rate: 0.4 }
        ],
        skills: [],
        desc: "潜伏在草丛深处，攻击带有剧毒，咬一口可能致命。"
    },
    {
        id: "global_004", template: "minion", name: "山林灰狼", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 60, atk: 12, def: 2, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_007", rate: 0.5 },
            { id: "materials_008", rate: 0.4 },
            { id: "foodMaterial_053", rate: 0.6 }
        ],
        skills: [],
        desc: "成群结队出没的掠食者，听到狼嚎时最好赶紧爬树。"
    },
    {
        id: "global_005", template: "minion", name: "暴躁野猪", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 80, atk: 15, def: 5, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_030", rate: 0.5 },
            { id: "materials_004", rate: 0.4 },
        ],
        skills: [],
        desc: "皮糙肉厚，发起疯来连老虎都要避让三分。"
    },

    // ==========================================
    // 2. 乱世流民与强盗
    // ==========================================
    {
        id: "global_006", template: "minion", name: "饥饿流民", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 40, atk: 4, def: 0, speed: 4 },
        money: [0, 5],
        drops: [
            { id: "weapons_003", rate: 0.2 },
        ],
        skills: [],
        desc: "衣衫褴褛，面黄肌瘦，为了活下去已经不顾一切。"
    },
    {
        id: "global_007", template: "minion", name: "疯癫乞丐", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 50, atk: 10, def: 0, speed: 6 },
        money: [0, 10],
        drops: [
            { id: "weapons_069", rate: 0.4 },
            // R1 功法残页 (假设是基础内功/心法)
            { id: "book_cultivation_r1_00_full", rate: 0.01 },
            { id: "book_cultivation_r1_01_full", rate: 0.01 },
            { id: "book_cultivation_r1_02_full", rate: 0.01 },
            { id: "book_cultivation_r1_03_full", rate: 0.01 },
            { id: "book_cultivation_r1_04_full", rate: 0.01 },
            { id: "book_cultivation_r1_05_full", rate: 0.01 },
            { id: "book_cultivation_r1_06_full", rate: 0.01 },
            { id: "book_cultivation_r1_07_full", rate: 0.01 },
            { id: "book_cultivation_r1_08_full", rate: 0.01 },
            { id: "book_cultivation_r1_09_full", rate: 0.01 },
            { id: "book_cultivation_r1_10_full", rate: 0.01 },
            { id: "book_cultivation_r1_11_full", rate: 0.01 }
        ],
        skills: [],
        desc: "神智不清的乞丐，嘴里念叨着无人能懂的疯话。"
    },
    {
        id: "global_008", template: "minion", name: "拦路蟊贼", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 70, atk: 10, def: 1, speed: 6 },
        money: [5, 20],
        drops: [
            { id: "weapons_013", rate: 0.3 }, // weapons_008
        ],
        skills: [],
        desc: "手里拿着生锈的刀，专门在官道旁打劫过路客。"
    },
    {
        id: "global_009", template: "minion", name: "秦军逃兵", region: "all", spawnType: "road", timeStart: 1,
        subType: "human",
        stats: { hp: 90, atk: 15, def: 5, speed: 5 },
        money: [10, 40],
        drops: [
            { id: "weapons_037", rate: 0.2 }, // weapons_024
            { id: "weapons_220", rate: 0.1 },      // weapons_023
            // R2 身体功法 (假设是军中硬气功)
            { id: "book_body_r1_14_full", rate: 0.01 },
        ],
        skills: [],
        desc: "受不了繁重徭役逃出来的士兵，依然保留着军中的杀人技。"
    },
    {
        id: "global_010", template: "elite", name: "强盗头子", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 160, atk: 25, def: 8, speed: 7 },
        money: [50, 120],
        drops: [
            { id: "weapons_013", rate: 0.2 },    // weapons_030
            { id: "head_017", rate: 0.2 },    // head_002
            { id: "pills_001", rate: 0.3 }       // pills_001
        ],
        // 精英怪添加 1 个技能
        skills: [
            { id: "凶狠劈砍", rate: 0.3, type: 1, damage: 35 } // 伤害技，比普攻(25)高
        ],
        desc: "【精英】纠集了一帮亡命之徒，占据山头称大王。"
    },
// ==========================================
    // 3. 特殊人类与江湖客
    // ==========================================
    {
        id: "global_011", template: "minion", name: "采药竞争者", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 60, atk: 8, def: 2, speed: 9 },
        money: [20, 50],
        drops: [
            { id: "herbs_001", rate: 0.3 }, // herbs_001
            { id: "weapons_010", rate: 0.2 }   // weapons_010
        ],
        skills: [],
        desc: "同行是冤家，为了争夺一株灵草可能会拔刀相向。"
    },
    {
        id: "global_012", template: "elite", name: "通缉大盗", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 180, atk: 30, def: 10, speed: 10 },
        money: [100, 200],
        drops: [
            { id: "weapons_013", rate: 0.1 },    // weapons_035
            { id: "pills_001", rate: 0.2 },    // pills_001
            { id: "book_body_r1_03_full", rate: 0.01 }, // booksBody_r1_21
        ],
        skills: [
            // 技能 Type 2: 撒石灰/致盲 (降低命中难以模拟，这里模拟降低攻击atk)
            { id: "撒石灰", rate: 0.25, type: 2, debuffValue: 10, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【精英】官府悬赏百金的要犯，杀人不眨眼，身手了得。"
    },
    // ==========================================
// 3. 特殊人类与江湖客 (续)
// ==========================================
    {
        id: "global_013", template: "elite", name: "赏金猎人", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 150, atk: 28, def: 12, speed: 8 },
        money: [50, 100],
        drops: [
            { id: "weapons_040", rate: 0.1 },      // 袖箭
            { id: "weapons_025", rate: 0.2 },      // 猎弓
            { id: "head_012", rate: 0.1 }          // 丝绸抹额
        ],
        skills: [
            // 技能 Type 1: 精准射击
            { id: "穿心箭", rate: 0.3, type: 1, damage: 45 }
        ],
        desc: "【精英】拿人钱财替人消灾，把你当成了行走的赏金。"
    },
    {
        id: "global_014", template: "elite", name: "蒙面杀手", region: "all", spawnType: "road", timeStart: 1,
        subType: "human",
        stats: { hp: 140, atk: 40, def: 5, speed: 15, toxicity: 10 },
        money: [80, 150],
        drops: [
            { id: "weapons_039", rate: 0.2 },      // 精铁匕首
            { id: "pills_053", rate: 0.3 }         // 见血封喉散
        ],
        skills: [
            // 技能 Type 3: 淬毒 (增加攻击力)
            { id: "刀刃淬毒", rate: 0.2, type: 3, buffValue: 15, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【精英】不知受何人指使的刺客，招招直奔要害。"
    },
    {
        id: "global_015", template: "boss", name: "义军首领", region: "all", spawnType: "road", timeStart: 2,
        subType: "human",
        stats: { hp: 350, atk: 45, def: 18, speed: 10 },
        money: [150, 400],
        drops: [
            { id: "weapons_036", rate: 0.1 },      // 百炼钢刀
            { id: "weapons_038", rate: 0.1 },      // 青铜阔剑
            { id: "materials_038", rate: 0.5 }     // 起义军兵符 (替代为将军枯骨)
        ],
        skills: [
            // 技能1 (伤害)
            { id: "力劈华山", rate: 0.3, type: 1, damage: 65 },
            // 技能2 (增益)
            { id: "振臂高呼", rate: 0.2, type: 3, buffValue: 20, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【头目】打着起义旗号的枭雄，手下聚集了数千人马。"
    },

// ==========================================
// 4. 环境与超自然
// ==========================================
    {
        id: "global_016", template: "minion", name: "食腐秃鹫", region: "all", spawnType: "desert", timeStart: 0,
        subType: "beast",
        stats: { hp: 40, atk: 18, def: 2, speed: 14 },
        money: [0, 0],
        drops: [
            { id: "materials_031", rate: 0.5 },    // 破布条
            { id: "foodMaterial_050", rate: 0.2 }  // 腐烂的肉 (替代为狗肉)
        ],
        skills: [],
        desc: "盘旋在战场上空，专门啄食死尸的眼睛。"
    },
    {
        id: "global_017", template: "minion", name: "河中水鬼", region: "all", spawnType: "river", timeStart: 0,
        subType: "undead", // 不死/灵异生物
        stats: { hp: 70, atk: 20, def: 5, speed: 8 },
        money: [0, 5],
        drops: [
            { id: "materials_032", rate: 0.1 },    // 白骨
            { id: "weapons_015", rate: 0.2 }       // 杀鱼刀
        ],
        skills: [],
        desc: "溺死之人的怨气所化，会把路过岸边的人拖入水中。"
    },
    {
        id: "global_018", template: "elite", name: "吊睛白额虎", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 250, atk: 45, def: 15, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_020", rate: 0.5 },    // 斑斓虎皮
            { id: "materials_021", rate: 0.5 },    // 虎骨
            { id: "materials_022", rate: 0.5 }     // 猛虎獠牙
        ],
        skills: [
            // 技能 Type 2: 虎啸 (降低防御，模拟震慑)
            { id: "百兽之王", rate: 0.25, type: 2, debuffValue: 8, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【精英】山中霸主，体型巨大，寻常刀剑难伤分毫。"
    },
    {
        id: "global_019", template: "elite", name: "狂暴黑熊", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 300, atk: 40, def: 25, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_023", rate: 0.6 },    // 金胆 (熊胆)
            { id: "materials_034", rate: 0.5 },    // 硬骨
            { id: "foodMaterial_006", rate: 0.1 }  // 野蜂蜜 (替代为野菜)
        ],
        skills: [
            // 技能 Type 3: 激怒 (大幅增加攻击)
            { id: "野性激怒", rate: 0.2, type: 3, buffValue: 10, buffAttr: "atk", buffTimes: 4 }
        ],
        desc: "【精英】力大无穷的黑熊，人立起来有一丈高。"
    },
    {
        id: "global_020", template: "minion", name: "游荡尸傀", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        stats: { hp: 120, atk: 15, def: 20, speed: 3 },
        money: [0, 0],
        drops: [
            { id: "materials_035", rate: 0.3 },    // 僵尸牙
            { id: "foodMaterial_002", rate: 0.1 }  // 糯米 (替代为大米)
        ],
        skills: [],
        desc: "死而不僵的尸体，受到阴气侵蚀重新站了起来，不知疼痛。"
    }
];

// --- Part B: 关中地区 (r_c_1_1) [12条] ---
// 范围：咸阳、雍城、蓝田、骊山、秦始皇陵
const enemies_r_c_1_1 = [
    // ==========================================
    // 1. 帝都守备力量
    // ==========================================
    {
        id: "rc11_001", template: "minion", name: "秦军城门卫", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 100, atk: 15, def: 10, speed: 5 },
        money: [10, 30],
        drops: [
            { id: "weapons_023", rate: 0.2 }, // 青铜短剑
            { id: "weapons_024", rate: 0.1 }  // 红缨枪(旧)
        ],
        skills: [],
        desc: "驻守咸阳各门的士兵，盘查过往行人，神情严肃。"
    },
    {
        id: "rc11_002", template: "elite", name: "金吾卫巡逻队", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 180, atk: 30, def: 20, speed: 7 },
        money: [30, 80],
        drops: [
            { id: "weapons_037", rate: 0.15 }, // 秦军长戈
            { id: "book_body_r1_16_full", rate: 0.01 }, // 《铁甲功》上篇 (铁布衫)
            { id: "book_body_r1_16_full", rate: 0.01 }, // 《铁甲功》中篇
            { id: "book_body_r1_16_full", rate: 0.01 }  // 《铁甲功》下篇
        ],
        skills: [
            // 技能 Type 1: 穿刺 (长戈攻击)
            { id: "长戈穿刺", rate: 0.3, type: 1, damage: 45 }
        ],
        desc: "【精英】负责京城治安的精锐部队，披坚执锐，昼夜巡逻。"
    },
    {
        id: "rc11_003", template: "elite", name: "大秦锐士", region: "r_c_1_1", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 200, atk: 35, def: 15, speed: 8 },
        money: [50, 100],
        drops: [
            { id: "weapons_038", rate: 0.1 },  // 青铜阔剑
            { id: "head_011", rate: 0.1 }      // 桑木面具
        ],
        skills: [
            // 技能 Type 3: 战吼 (增加攻击)
            { id: "锐士战吼", rate: 0.25, type: 3, buffValue: 15, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【精英】秦军中最精锐的战士，曾横扫六国，战功赫赫。"
    },

    // ==========================================
    // 2. 骊山与皇陵 (苦役与机关)
    // ==========================================
    {
        id: "rc11_004", template: "minion", name: "骊山刑徒", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 60, atk: 12, def: 2, speed: 5 },
        money: [0, 5],
        drops: [
            { id: "weapons_020", rate: 0.3 },      // 矿镐
            { id: "weapons_010", rate: 0.3 },      // 锄头
            { id: "materials_036", rate: 0.1 }     // 麻绳
        ],
        skills: [],
        desc: "修筑皇陵的七十万刑徒之一，衣不蔽体，眼神麻木。"
    },
    {
        id: "rc11_005", template: "elite", name: "监工酷吏", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 120, atk: 20, def: 5, speed: 6 },
        money: [20, 60],
        drops: [
            { id: "weapons_027", rate: 0.2 }     // 九节鞭
        ],
        skills: [
            // 技能 Type 2: 鞭挞 (降低玩家防御)
            { id: "残酷鞭挞", rate: 0.3, type: 2, debuffValue: 8, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【精英】手持皮鞭，以折磨刑徒为乐，心狠手辣。"
    },
    {
        id: "rc11_006", template: "elite", name: "机关铜人(残)", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "construct", // 机关/构装体
        stats: { hp: 250, atk: 25, def: 40, speed: 3 },
        money: [0, 0],
        drops: [
            { id: "weapons_018", rate: 0.2 },      // 铁锤
            { id: "materials_037", rate: 0.1 }     // 废铁块
        ],
        skills: [
            // 技能 Type 1: 重击 (高伤但低命中，此处仅体现数值)
            { id: "机械重锤", rate: 0.25, type: 1, damage: 40 }
        ],
        desc: "【精英】墨家或公输家制造的守陵机关，虽然破损但依然坚硬。"
    },
    {
        id: "rc11_007", template: "boss", name: "守陵尸将", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "undead",
        stats: { hp: 600, atk: 55, def: 35, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "weapons_090", rate: 0.01 }, // 大秦定秦剑
            { id: "materials_038", rate: 0.2 }, // 将军枯骨
            { id: "pills_071", rate: 0.3 }      // 镇尸丹
        ],
        skills: [
            // 技能 1: 尸毒剑气 (伤害)
            { id: "幽冥剑气", rate: 0.3, type: 1, damage: 80 },
            // 技能 2: 尸吼 (减益)
            { id: "亡者咆哮", rate: 0.2, type: 2, debuffValue: 10, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【头目】死在皇陵中的秦军将领，被阴气转化为不知疲倦的杀戮机器。"
    },

    // ==========================================
    // 3. 渭水与蓝田
    // ==========================================
    {
        id: "rc11_008", template: "minion", name: "渭河水鬼", region: "r_c_1_1", spawnType: "river", timeStart: 0,
        subType: "undead",
        stats: { hp: 80, atk: 18, def: 5, speed: 12 },
        money: [0, 10],
        drops: [
            { id: "materials_032", rate: 0.1 }, // 水草缠绕的骨头 (白骨)
            { id: "weapons_015", rate: 0.2 }    // 杀鱼刀
        ],
        skills: [],
        desc: "溺死在渭水中的怨魂，皮肤浮肿，会把路过岸边的人拖下水。"
    },
    {
        id: "rc11_009", template: "minion", name: "发疯的采玉人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 70, atk: 10, def: 3, speed: 7 },
        money: [10, 50],
        drops: [
            { id: "weapons_011", rate: 0.3 },      // 木工凿
            { id: "materials_045", rate: 0.2 }     // 未经打磨的玉石 (石精)
        ],
        skills: [],
        desc: "在蓝田山中寻找美玉而迷失心智的可怜人。"
    },

    // ==========================================
    // 4. 暗流涌动
    // ==========================================
    {
        id: "rc11_010", template: "elite", name: "六国死士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 140, atk: 45, def: 5, speed: 18 },
        money: [50, 150],
        drops: [
            { id: "weapons_039", rate: 0.2 },     // 精铁匕首
            { id: "pills_001", rate: 0.4 },       // 金创药 (止血散)
            { id: "book_cultivation_r1_19_full", rate: 0.03 }, // 《刺客信条》上篇 (隐息诀)
            { id: "book_cultivation_r1_19_full", rate: 0.03 }, // 《刺客信条》中篇
            { id: "book_cultivation_r1_19_full", rate: 0.03 }  // 《刺客信条》下篇
        ],
        skills: [
            // 技能 Type 1: 背刺 (高伤)
            { id: "绝命背刺", rate: 0.3, type: 1, damage: 60 }
        ],
        desc: "【精英】潜伏在咸阳企图刺杀秦皇的刺客，怀着国破家亡的仇恨。"
    },
    {
        id: "rc11_011", template: "minion", name: "炼丹方士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 5, def: 2, speed: 6 },
        money: [20, 100],
        drops: [
            { id: "pills_001", rate: 0.3 },       // 金创药 (止血散)
            { id: "materials_010", rate: 0.2 },   // 丹砂 (蛇胆/朱砂)
            { id: "book_cultivation_r2_02_full", rate: 0.05 } // 《炼丹术入门》系列残页 (炼气诀)
        ],
        skills: [],
        desc: "声称能炼制长生不老药的术士，其实多半是骗子。"
    },
    {
        id: "rc11_012", template: "elite", name: "宫廷乐师(刺客)", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 130, atk: 35, def: 5, speed: 15 },
        money: [40, 90],
        drops: [
            { id: "weapons_040", rate: 0.2 }          // 袖箭
        ],
        skills: [
            // 技能 Type 2: 魔音 (降攻)
            { id: "断肠之音", rate: 0.25, type: 2, debuffValue: 10, debuffAttr: "atk", debuffTimes: 2 }
        ],
        desc: "【精英】以击筑为掩护，乐器中藏着致命的武器，类似高渐离。"
    },

    // ==========================================
    // 5. 领主级 (Lord)
    // ==========================================
    {
        id: "rc11_lord_01", template: "lord", name: "始皇陵守灵人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human", // 或 undead
        stats: { hp: 400, atk: 60, def: 40, speed: 8 },
        money: [500, 1000],
        drops: [
            { id: "weapons_090", rate: 0.05 },  // 大秦定秦剑
            { id: "book_cultivation_r3_01_full", rate: 0.1 } // 《皇陵秘典》上篇 (先天功)
        ],
        skills: [
            { id: "定秦一剑", rate: 0.2, type: 1, damage: 100 },
            { id: "帝陵威压", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "def", debuffTimes: 3 },
            { id: "护陵罡气", rate: 0.2, type: 3, buffValue: 20, buffAttr: "def", buffTimes: 5 }
        ],
        desc: "【领主】活了不知多少岁月的守陵人，掌握着秦皇扫六合的恐怖武学。"
    },
    {
        id: "rc11_lord_02", template: "lord", name: "堕落的蒙恬英灵", region: "r_c_1_1", spawnType: "road", timeStart: 1,
        subType: "undead",
        stats: { hp: 450, atk: 70, def: 35, speed: 12 },
        money: [600, 1200],
        drops: [
            { id: "weapons_053", rate: 0.05 },       // 蛇矛
            { id: "head_012", rate: 0.1 }            // 丝绸抹额
        ],
        skills: [
            { id: "万军辟易", rate: 0.25, type: 1, damage: 110 },
            { id: "筑城", rate: 0.2, type: 3, buffValue: 30, buffAttr: "def", buffTimes: 3 },
            { id: "英灵怒号", rate: 0.2, type: 2, debuffValue: 10, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【领主】被奸臣害死的大将怨气不散，率领幽冥鬼军徘徊在长城脚下。"
    },
    {
        id: "rc11_lord_03", template: "lord", name: "楚霸王(分身)", region: "r_c_1_1", spawnType: "city", timeStart: 2,
        subType: "human", // 神级人类
        stats: { hp: 600, atk: 90, def: 30, speed: 15 },
        money: [1000, 2000],
        drops: [
            { id: "weapons_065", rate: 0.05 },     // 破阵戟
            { id: "materials_038", rate: 0.05 }    // 乌骓马 (将军枯骨 - 占位)
        ],
        skills: [
            { id: "霸王扛鼎", rate: 0.2, type: 1, damage: 150 }, // 极高伤害
            { id: "破釜沉舟", rate: 0.2, type: 3, buffValue: 40, buffAttr: "atk", buffTimes: 3 }, // 极高加攻
            { id: "盖世气魄", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【领主】力拔山兮气盖世，即使只是霸王留下的一道战意分身，也足以横扫千军。"
    }
];

// --- Part C: 中原地区 (r_c_2_1) [8条] ---
// 范围：洛阳、三晋、邯郸、黄河中下游
const enemies_r_c_2_1 = [
    // ==========================================
    // 1. 洛阳与周室
    // ==========================================
    {
        id: "rc21_001", template: "minion", name: "洛阳游侠", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 90, atk: 20, def: 5, speed: 12 },
        money: [10, 40],
        drops: [
            { id: "weapons_021", rate: 0.3 }    // 生锈铁剑
        ],
        skills: [],
        desc: "混迹于洛阳市井的少年剑客，轻生死，重然诺。"
    },
    {
        id: "rc21_002", template: "elite", name: "周室守藏史(亡魂)", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "undead", // 亡魂
        stats: { hp: 150, atk: 25, def: 0, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "book_cultivation_r3_01_full", rate: 0.05 } // 《周礼残卷》系列 (R3内功占位)
        ],
        skills: [
            // 技能 Type 2: 封印/降攻
            { id: "史笔如刀", rate: 0.25, type: 2, debuffValue: 10, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【精英】周朝覆灭后不愿离去的史官亡魂，守护着残缺的典籍。"
    },

    // ==========================================
    // 2. 三晋旧地
    // ==========================================
    {
        id: "rc21_003", template: "elite", name: "魏武卒英灵", region: "r_c_2_1", spawnType: "road", timeStart: 0,
        subType: "undead",
        stats: { hp: 200, atk: 30, def: 25, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "weapons_037", rate: 0.1 },     // 秦军长戈
            { id: "book_body_r1_09_full", rate: 0.03 } // 《重甲操典》
        ],
        skills: [
            // 技能 Type 3: 方阵防御 (加防)
            { id: "魏武方阵", rate: 0.2, type: 3, buffValue: 15, buffAttr: "def", buffTimes: 4 }
        ],
        desc: "【精英】战国时期最强步兵的英灵，即便死去依然身披重甲。"
    },
    {
        id: "rc21_004", template: "minion", name: "韩国弩手(残部)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 35, def: 2, speed: 9 },
        money: [5, 20],
        drops: [
            { id: "weapons_025", rate: 0.3 },        // 猎弓
            { id: "weapons_060", rate: 0.01 }    // 诸葛连弩
        ],
        skills: [],
        desc: "天下强弓劲弩皆出韩，躲在暗处放冷箭的残兵。"
    },

    // ==========================================
    // 3. 黄河与商业
    // ==========================================
    {
        id: "rc21_005", template: "minion", name: "陵墓盗贼", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 12, def: 4, speed: 8 },
        money: [20, 80],
        drops: [
            { id: "weapons_020", rate: 0.4 },        // 矿镐
            { id: "materials_019", rate: 0.1 }     // 龟甲碎块
        ],
        skills: [],
        desc: "活跃在邙山一带的盗墓贼，擅长分金定穴。"
    },
    {
        id: "rc21_006", template: "elite", name: "黄河河伯娶亲队", region: "r_c_2_1", spawnType: "river", timeStart: 0,
        subType: "human",
        stats: { hp: 180, atk: 20, def: 10, speed: 8 },
        money: [50, 200],
        drops: [
            { id: "head_004", rate: 0.2 }   // 生牛皮额带
        ],
        skills: [
            // 技能 Type 2: 恐吓/降防
            { id: "邪神祭祀", rate: 0.25, type: 2, debuffValue: 8, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【精英】崇拜邪神河伯的狂热信徒，敲锣打鼓要把活人扔进河里。"
    },
    {
        id: "rc21_007", template: "minion", name: "豪强恶奴", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 90, atk: 15, def: 5, speed: 6 },
        money: [10, 50],
        drops: [
            { id: "weapons_003", rate: 0.4 },      // 粗木棍
            { id: "book_body_r1_03_full", rate: 0.03 } // 《家丁护院法》
        ],
        skills: [],
        desc: "中原富商豪强豢养的打手，仗势欺人。"
    },
    {
        id: "rc21_008", template: "boss", name: "鬼谷弃徒", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 500, atk: 60, def: 20, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "weapons_055", rate: 0.1 },      // 铁骨扇
            { id: "book_cultivation_r3_05_full", rate: 0.1 } // 《纵横家手稿》系列 (R3内功占位)
        ],
        skills: [
            // 技能 1: 纵剑术 (伤害)
            { id: "百步飞剑", rate: 0.25, type: 1, damage: 85 },
            // 技能 2: 横剑术 (Buff)
            { id: "横贯八方", rate: 0.2, type: 3, buffValue: 15, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【头目】云梦山上下来的纵横家弃徒，精通剑术与权谋。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "rc21_lord_01", template: "lord", name: "鬼谷子(幻影)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "spirit", // 幻影/神念
        stats: { hp: 350, atk: 80, def: 20, speed: 20 },
        money: [500, 1000],
        drops: [
            { id: "book_cultivation_r3_20_full", rate: 0.1 }, // 《本经阴符七术》上篇 (R3内功)
            { id: "pills_071", rate: 0.2 }       // 镇尸丹
        ],
        skills: [
            { id: "天地棋局", rate: 0.2, type: 1, damage: 120 },
            { id: "万物归元", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "atk", debuffTimes: 3 },
            { id: "纵横捭阖", rate: 0.2, type: 3, buffValue: 25, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【领主】纵横家的鼻祖，在此地留下的一道考验后人的神念。"
    },
    {
        id: "rc21_lord_02", template: "lord", name: "信陵君食客首领", region: "r_c_2_1", spawnType: "city", timeStart: 1,
        subType: "human",
        stats: { hp: 420, atk: 65, def: 30, speed: 10 },
        money: [600, 1200],
        drops: [
            { id: "weapons_055", rate: 0.05 },     // 铁骨扇
            { id: "materials_039", rate: 0.2 }     // 精金矿石
        ],
        skills: [
            { id: "窃符救赵", rate: 0.2, type: 3, buffValue: 20, buffAttr: "atk", buffTimes: 3 },
            { id: "士为知己死", rate: 0.25, type: 1, damage: 90 },
            { id: "门客三千", rate: 0.15, type: 3, buffValue: 20, buffAttr: "def", buffTimes: 4 }
        ],
        desc: "【领主】曾窃符救赵的义士首领，如今聚集在魏地试图恢复旧秩序。"
    },
    {
        id: "rc21_lord_03", template: "lord", name: "黄河巨龟", region: "r_c_2_1", spawnType: "river", timeStart: 2,
        subType: "beast", // 或 giant
        stats: { hp: 800, atk: 50, def: 80, speed: 4 },
        money: [0, 0],
        drops: [
            { id: "materials_019", rate: 1.0 },      // 玄武甲 (龟甲)
            { id: "materials_039", rate: 0.5 }     // 精金矿石
        ],
        skills: [
            { id: "惊涛骇浪", rate: 0.2, type: 1, damage: 80 },
            { id: "玄水护盾", rate: 0.2, type: 3, buffValue: 40, buffAttr: "def", buffTimes: 5 }, // 极高防御Buff
            { id: "翻江倒海", rate: 0.15, type: 2, debuffValue: 15, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【领主】背负洛书的神龟后裔，体型如小岛，兴风作浪。"
    }
];

// --- Part D: 齐鲁大地 (r_e_0_1) [10条] ---
// 范围：临淄、曲阜、泰山、东海之滨
const enemies_r_e_0_1 = [
    // ==========================================
    // 1. 商业与百家
    // ==========================================
    {
        id: "re01_001", template: "minion", name: "私盐贩子", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 110, atk: 15, def: 8, speed: 8 },
        money: [40, 100],
        drops: [
            { id: "weapons_034", rate: 0.15 },    // 长柄叉
            { id: "foodMaterial_008", rate: 0.8 }      // 粗盐包 (假设ID)
        ],
        skills: [],
        desc: "齐地多盐铁，贩卖私盐利润极高，他们为了护盐敢于拼命。"
    },
    {
        id: "re01_002", template: "minion", name: "临淄斗鸡", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "beast",
        stats: { hp: 50, atk: 25, def: 2, speed: 18 },
        money: [0, 0],
        drops: [
            { id: "materials_040", rate: 0.5 },   // 鲜艳羽毛
            { id: "foodMaterial_050", rate: 0.5 }        // 鸡肉 (狗肉占位)
        ],
        skills: [],
        desc: "齐国贵族好斗鸡，这些精心饲养的斗鸡凶猛异常，啄人极痛。"
    },
    {
        id: "re01_003", template: "elite", name: "墨家机关兽(暴走)", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        subType: "construct", // 机关
        stats: { hp: 200, atk: 25, def: 35, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "weapons_011", rate: 0.3 },     // 木工凿
            { id: "weapons_055", rate: 0.05 },    // 铁骨扇
            { id: "materials_041", rate: 0.2 }    // 废弃齿轮
        ],
        skills: [
            // 技能 Type 1: 旋转攻击 (AOE模拟)
            { id: "刃轮旋风", rate: 0.25, type: 1, damage: 35 }
        ],
        desc: "【精英】墨家留下的木石机关，因年久失修而敌我不分。"
    },
    {
        id: "re01_004", template: "minion", name: "落魄方士", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 70, atk: 10, def: 2, speed: 10 },
        money: [10, 50],
        drops: [
            { id: "pills_001", rate: 0.4 },     // 金创药 (止血散)
            { id: "book_cultivation_r1_01_full", rate: 0.05 } // 《炼气诀》残页
        ],
        skills: [],
        desc: "整日炼丹求仙，精神恍惚，会扔出失败的丹药炸人。"
    },

    // ==========================================
    // 2. 泰山与响马
    // ==========================================
    {
        id: "re01_005", template: "minion", name: "泰山响马", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 120, atk: 20, def: 10, speed: 10 },
        money: [20, 60],
        drops: [
            { id: "weapons_029", rate: 0.2 },       // 板斧
            { id: "head_002", rate: 0.2 }    // 农家草笠
        ],
        skills: [],
        desc: "盘踞在泰山险要之处的强盗，大碗喝酒大口吃肉。"
    },
    {
        id: "re01_006", template: "elite", name: "武馆教头", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 220, atk: 35, def: 15, speed: 10 },
        money: [50, 150],
        drops: [
            { id: "weapons_050", rate: 0.1 },     // 三节棍
            { id: "book_body_r1_09_full", rate: 0.03 } // 《硬气功》
        ],
        skills: [
            // 技能 Type 2: 卸力 (降低玩家攻击)
            { id: "接化发", rate: 0.3, type: 2, debuffValue: 10, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【精英】齐地尚武，临淄城中武馆林立，教头功夫深不可测。"
    },
    {
        id: "re01_007", template: "boss", name: "大盗跖(伪)", region: "r_e_0_1", spawnType: "mountain", timeStart: 1,
        subType: "human",
        stats: { hp: 600, atk: 60, def: 20, speed: 20 },
        money: [200, 600],
        drops: [
            { id: "weapons_054", rate: 0.1 },       // 飞爪
            { id: "weapons_062", rate: 0.01 }     // 血滴子
        ],
        skills: [
            // 技能 1: 偷袭 (高伤)
            { id: "如影随形", rate: 0.25, type: 1, damage: 90 },
            // 技能 2: 轻功 (加闪避，模拟加防或速度)
            { id: "神行百变", rate: 0.2, type: 3, buffValue: 20, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【头目】自称盗圣柳下跖传人的巨寇，轻功卓绝，来去无踪。"
    },

    // ==========================================
    // 3. 边境与东夷
    // ==========================================
    {
        id: "re01_008", template: "minion", name: "东夷射手", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 30, def: 3, speed: 12 },
        money: [5, 20],
        drops: [
            { id: "weapons_048", rate: 0.15 },    // 复合弓
            { id: "book_body_r1_07_full", rate: 0.03 } // 《鹰眼术》残篇
        ],
        skills: [],
        desc: "生活在东部山林的古老部族，箭术精准。"
    },
    {
        id: "re01_009", template: "elite", name: "蓬莱引路人", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "human",
        stats: { hp: 150, atk: 20, def: 10, speed: 15 },
        money: [50, 200],
        drops: [
            { id: "materials_019", rate: 0.3 },       // 龟甲
            { id: "pills_041", rate: 0.2 }      // 大力丸
        ],
        skills: [
            // 技能 Type 2: 迷魂汤 (降命中/降攻)
            { id: "仙境迷雾", rate: 0.3, type: 2, debuffValue: 12, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【精英】专门诱骗富人出海寻仙的骗子头目，熟悉海路。"
    },
    {
        id: "re01_010", template: "minion", name: "海边巨蟹", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "beast",
        stats: { hp: 60, atk: 20, def: 20, speed: 4 },
        money: [0, 0],
        drops: [
            { id: "foodMaterial_005", rate: 0.6 },       // 蟹肉 (鲜肉占位)
            { id: "materials_048", rate: 0.2 }    // 坚硬蟹壳
        ],
        skills: [],
        desc: "海边沙滩上的大螃蟹，横行霸道。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "re01_lord_01", template: "lord", name: "东海蛟龙", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "beast", // 或 dragon
        stats: { hp: 600, atk: 70, def: 40, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_044", rate: 0.5 },       // 龙鳞
            { id: "weapons_075", rate: 0.05 } // 寒冰绵掌手套
        ],
        skills: [
            { id: "水龙卷", rate: 0.25, type: 1, damage: 100 },
            { id: "龙威", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "def", debuffTimes: 3 },
            { id: "呼风唤雨", rate: 0.2, type: 3, buffValue: 20, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【领主】深海中的恶蛟，传说是龙的远亲，能呼风唤雨。"
    },
    {
        id: "re01_lord_02", template: "lord", name: "孔门弃徒(狂)", region: "r_e_0_1", spawnType: "city", timeStart: 1,
        subType: "human",
        stats: { hp: 400, atk: 60, def: 30, speed: 12 },
        money: [500, 1000],
        drops: [
            { id: "weapons_050", rate: 0.05 },    // 三节棍
            { id: "book_cultivation_r2_05_full", rate: 0.1 } // 《儒门浩然气》
        ],
        skills: [
            { id: "以力服人", rate: 0.3, type: 1, damage: 110 }, // 物理说服
            { id: "浩然正气", rate: 0.2, type: 3, buffValue: 30, buffAttr: "def", buffTimes: 3 },
            { id: "礼崩乐坏", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【领主】修习儒家六艺走火入魔的狂人，力大无穷，以力服人。"
    },
    {
        id: "re01_lord_03", template: "lord", name: "泰山石敢当(灵)", region: "r_e_0_1", spawnType: "mountain", timeStart: 2,
        subType: "elemental", // 精怪
        stats: { hp: 1000, atk: 40, def: 100, speed: 2 },
        money: [0, 0],
        drops: [
            { id: "materials_023", rate: 0.5 },     // 野蜂蜜 (金胆占位)
            { id: "materials_045", rate: 0.5 }        // 石精
        ],
        skills: [
            { id: "不动如山", rate: 0.3, type: 3, buffValue: 50, buffAttr: "def", buffTimes: 5 }, // 极硬
            { id: "泰山压顶", rate: 0.2, type: 1, damage: 130 }, // 单次高伤
            { id: "镇压邪祟", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【领主】泰山灵石化成的精怪，坚不可摧，镇压一切邪祟。"
    }
];

// --- Part E: 荆楚大地 (r_c_1_2) [10条] ---
// 范围：郢都、寿春、云梦泽、长江
const enemies_r_c_1_2 = [
    // ==========================================
    // 1. 云梦大泽
    // ==========================================
    {
        id: "rc12_001", template: "minion", name: "云梦水匪", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "human",
        stats: { hp: 70, atk: 14, def: 2, speed: 9 },
        money: [10, 30],
        drops: [
            { id: "weapons_012", rate: 0.3 },   // 断裂的桨
            { id: "foods_048", rate: 0.2 },     // 莲藕汤
            { id: "book_body_r1_03_full", rate: 0.03 } // 《家丁护院法》
        ],
        skills: [],
        desc: "潜伏在芦苇荡里，靠打劫过往商船为生。"
    },
    {
        id: "rc12_002", template: "minion", name: "扬子鳄", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "beast",
        stats: { hp: 180, atk: 30, def: 20, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "materials_049", rate: 0.4 },     // 鳄鱼皮
            { id: "materials_046", rate: 0.4 },   // 尖锐兽牙
            { id: "foodMaterial_056", rate: 0.8 }      // 鳄鱼肉
        ],
        skills: [],
        desc: "云梦泽中的霸主，被称为猪婆龙，咬合力惊人。"
    },
    {
        id: "rc12_003", template: "elite", name: "沼泽巨蟒", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        subType: "beast", // 或 reptile
        stats: { hp: 250, atk: 35, def: 10, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_005", rate: 0.5 }, // 未经打磨的玉石
            { id: "materials_010", rate: 0.5 }        // 丹砂
        ],
        skills: [
            // 技能 Type 2: 死亡缠绕 (降速)
            { id: "死亡缠绕", rate: 0.3, type: 2, debuffValue: 15, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】能吞下一头牛的巨蟒，在泥沼中行动如飞。"
    },

    // ==========================================
    // 2. 楚国遗民与巫蛊
    // ==========================================
    {
        id: "rc12_004", template: "minion", name: "楚地巫祝", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 60, atk: 25, def: 0, speed: 8, toxicity: 10 },
        money: [10, 40],
        drops: [
            { id: "foodMaterial_002", rate: 0.3 },       // 糯米
            { id: "materials_006", rate: 0.3 }      // 毒虫干
        ],
        skills: [],
        desc: "戴着狰狞面具，擅长使用毒虫和诅咒。"
    },
    {
        id: "rc12_005", template: "elite", name: "负隅顽抗的楚军", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 160, atk: 32, def: 15, speed: 7 },
        money: [20, 60],
        drops: [
            { id: "weapons_038", rate: 0.15 }   // 青铜阔剑
        ],
        skills: [
            // 技能 Type 3: 不屈 (加防)
            { id: "楚魂不灭", rate: 0.2, type: 3, buffValue: 10, buffAttr: "def", buffTimes: 5 }
        ],
        desc: "【精英】楚虽三户，亡秦必楚。不愿投降的楚军残部。"
    },
    {
        id: "rc12_006", template: "minion", name: "湘西赶尸人", region: "r_c_1_2", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 10, def: 5, speed: 5 },
        money: [30, 80],
        drops: [
            { id: "weapons_002", rate: 0.3 },       // 竹竿
            { id: "pills_001", rate: 0.2 }      // 金创药
        ],
        skills: [],
        desc: "摇着铃铛，赶着尸体回乡安葬的神秘人，生人勿进。"
    },

    // ==========================================
    // 3. 传说与自然
    // ==========================================
    {
        id: "rc12_007", template: "boss", name: "九头鸟(幼体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", // 异兽
        stats: { hp: 450, atk: 50, def: 10, speed: 20 },
        money: [0, 0],
        drops: [
            { id: "materials_040", rate: 0.8 },   // 鲜艳羽毛
            { id: "pills_053", rate: 0.2 }  // 见血封喉散
        ],
        skills: [
            // 技能 1: 摄魂叫声 (AOE伤害)
            { id: "鬼车夜鸣", rate: 0.3, type: 1, damage: 70 },
            // 技能 2: 厄运 (降运/降防，模拟降防)
            { id: "厄运降临", rate: 0.2, type: 2, debuffValue: 10, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【头目】楚地传说中的不祥之鸟，鬼车，叫声能摄人魂魄。"
    },
    {
        id: "rc12_008", template: "minion", name: "剧毒蟾蜍", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        subType: "beast",
        stats: { hp: 40, atk: 15, def: 10, speed: 4, toxicity: 30 },
        money: [0, 0],
        drops: [
            { id: "pills_053", rate: 0.4 }  // 见血封喉散
        ],
        skills: [],
        desc: "浑身长满脓包，碰到就会中毒。"
    },
    {
        id: "rc12_009", template: "elite", name: "项氏家臣", region: "r_c_1_2", spawnType: "city", timeStart: 1,
        subType: "human",
        stats: { hp: 200, atk: 40, def: 15, speed: 10 },
        money: [60, 150],
        drops: [
            { id: "weapons_044", rate: 0.15 },    // 点钢枪
            { id: "book_body_r1_09_full", rate: 0.45 } // 《重甲操典》
        ],
        skills: [
            // 技能 Type 1: 霸王枪法入门 (连击)
            { id: "单手挑", rate: 0.3, type: 1, damage: 55 }
        ],
        desc: "【精英】项羽家族的家臣，个个武艺高强，忠心耿耿。"
    },
    {
        id: "rc12_010", template: "minion", name: "神农架野人", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", // 或 human (类人)
        stats: { hp: 140, atk: 30, def: 5, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_024", rate: 0.05 },  // 奇异毛皮
            { id: "foodMaterial_006", rate: 0.5 }        // 生菜
        ],
        skills: [],
        desc: "深山中直立行走的红毛野兽，力大无穷。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "rc12_lord_01", template: "lord", name: "云梦龙君", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "beast", // 龙
        stats: { hp: 550, atk: 65, def: 30, speed: 14 },
        money: [0, 0],
        drops: [
            { id: "materials_044", rate: 0.3 },       // 龙鳞
            { id: "materials_039", rate: 0.3 }    // 精金矿石
        ],
        skills: [
            { id: "云梦泽国", rate: 0.2, type: 1, damage: 90 },
            { id: "兴云吐雾", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "speed", debuffTimes: 4 },
            { id: "真龙之躯", rate: 0.2, type: 3, buffValue: 20, buffAttr: "def", buffTimes: 5 }
        ],
        desc: "【领主】云梦泽中修行的千年白蛇，已化为半龙之躯。"
    },
    {
        id: "rc12_lord_02", template: "lord", name: "巫神代言人", region: "r_c_1_2", spawnType: "mountain", timeStart: 1,
        subType: "human", // 巫师
        stats: { hp: 300, atk: 85, def: 10, speed: 10 },
        money: [400, 800],
        drops: [
            { id: "foodMaterial_002", rate: 0.5 },       // 糯米
            { id: "book_cultivation_r3_21_full", rate: 0.1 } // 《巫蛊咒怨》
        ],
        skills: [
            { id: "摄魂咒", rate: 0.3, type: 1, damage: 120 }, // 极高伤害
            { id: "衰弱诅咒", rate: 0.2, type: 2, debuffValue: 30, debuffAttr: "atk", debuffTimes: 3 }, // 大幅降攻
            { id: "巫神附体", rate: 0.2, type: 3, buffValue: 30, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【领主】楚地大巫，能沟通鬼神，施展恐怖的即死诅咒。"
    },
    {
        id: "rc12_lord_03", template: "lord", name: "九头神鸟(完全体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 2,
        subType: "beast",
        stats: { hp: 500, atk: 80, def: 20, speed: 25 },
        money: [0, 0],
        drops: [
            { id: "materials_047", rate: 0.5 },     // 凤凰羽
            { id: "materials_020", rate: 0.5 }        // 虎皮
        ],
        skills: [
            { id: "九首齐鸣", rate: 0.25, type: 1, damage: 100 },
            { id: "灾厄风暴", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "def", debuffTimes: 3 },
            { id: "凌空扑击", rate: 0.25, type: 1, damage: 110 }
        ],
        desc: "【领主】展开羽翼遮天蔽日的上古凶兽，九个头颅能喷吐九种灾厄。"
    }
];

// --- Part F: 巴蜀之地 (r_c_0_2) [10条] ---
// 范围：成都、汉中、剑阁、江州
const enemies_r_c_0_2 = [
    // ==========================================
    // 1. 天府之国与险途
    // ==========================================
    {
        id: "rc02_001", template: "minion", name: "剑阁剪径贼", region: "r_c_0_2", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 90, atk: 18, def: 5, speed: 6 },
        money: [10, 40],
        drops: [
            { id: "板斧", rate: 0.2 },       // weapons_029
            { id: "烧酒", rate: 0.2 }        // (代指)
        ],
        skills: [],
        desc: "盘踞在蜀道险要之处，利用地势打劫过往商旅。"
    },
    {
        id: "rc02_002", template: "minion", name: "井盐矿工(暴躁)", region: "r_c_0_2", spawnType: "village", timeStart: 0,
        subType: "human",
        stats: { hp: 100, atk: 15, def: 8, speed: 5 },
        money: [20, 60],
        drops: [
            { id: "矿镐", rate: 0.3 },       // weapons_020
            { id: "粗盐包", rate: 0.8 }      // foodMaterial_008
        ],
        skills: [],
        desc: "在自贡一带开采井盐的工匠，因繁重劳役而变得极具攻击性。"
    },
    {
        id: "rc02_003", template: "elite", name: "食铁兽(熊猫)", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 350, atk: 40, def: 20, speed: 4 },
        money: [0, 0],
        drops: [
            { id: "奇异毛皮", rate: 0.2 },   // materials_024
            { id: "新鲜竹笋", rate: 0.5 }    // foodMaterial_002
        ],
        skills: [
            // 技能 Type 2: 咬碎 (破甲)
            { id: "咬碎", rate: 0.25, type: 2, debuffValue: 10, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【精英】外表憨态可掬，实则乃上古凶兽蚩尤坐骑，能轻易咬碎铁锅。"
    },

    // ==========================================
    // 2. 蛮荒与毒物
    // ==========================================
    {
        id: "rc02_004", template: "minion", name: "竹林花斑蛇", region: "r_c_0_2", spawnType: "grass", timeStart: 0,
        subType: "beast", // 或 reptile
        stats: { hp: 40, atk: 25, def: 1, speed: 12, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "丹砂", rate: 0.3 },       // materials_010 (materials_010)
            { id: "糯米", rate: 0.1 }        // pills_097
        ],
        skills: [],
        desc: "隐藏在翠绿竹林中的毒蛇，保护色极好，令人防不胜防。"
    },
    {
        id: "rc02_005", template: "elite", name: "南蛮藤甲兵", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 180, atk: 20, def: 45, speed: 6 },
        money: [5, 20],
        drops: [
            { id: "柳叶刀", rate: 0.1 },     // weapons_035
            { id: "丝绸抹额", rate: 0.1 },   // head_012
            { id: "《铁甲功》残篇", rate: 0.45 } // booksBody_r1_11
        ],
        skills: [
            // 技能 Type 3: 藤甲护体 (极高防御，模拟刀枪不入)
            { id: "藤甲护体", rate: 0.25, type: 3, buffValue: 20, buffAttr: "def", buffTimes: 5 }
        ],
        desc: "【精英】身穿桐油浸泡过的藤甲，刀枪不入，唯一的弱点是火。"
    },
    {
        id: "rc02_006", template: "minion", name: "巴山夜猿", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 60, atk: 12, def: 2, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "僵尸牙", rate: 0.3 },     // materials_002 (牙)
            { id: "山野鲜桃", rate: 0.4 }    // foods_021
        ],
        skills: [],
        desc: "巴东三峡巫峡长，猿鸣三声泪沾裳。成群结队骚扰路人。"
    },

    // ==========================================
    // 3. 古蜀传说
    // ==========================================
    {
        id: "rc02_007", template: "minion", name: "古蜀遗民", region: "r_c_0_2", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 15, def: 5, speed: 8 },
        money: [10, 50],
        drops: [
            { id: "青铜短剑", rate: 0.2 },   // weapons_023
            { id: "龟甲碎块", rate: 0.1 }    // materials_019
        ],
        skills: [],
        desc: "崇拜金沙太阳神鸟的古蜀国后裔，行踪神秘。"
    },
    {
        id: "rc02_008", template: "boss", name: "六牙白象", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", // 灵兽
        stats: { hp: 800, atk: 70, def: 30, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "虎牙", rate: 0.5 },       // materials_022 (象牙)
            { id: "将军枯骨", rate: 1.0 }    // materials_021 (骨)
        ],
        skills: [
            // 技能 1: 战争践踏 (AOE)
            { id: "神象镇狱", rate: 0.25, type: 1, damage: 95 },
            // 技能 2: 震慑 (减攻)
            { id: "灵兽威压", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【头目】峨眉山中的灵兽，据说曾是普贤菩萨的坐骑（化身）。"
    },
    {
        id: "rc02_009", template: "elite", name: "青城剑客", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 160, atk: 35, def: 10, speed: 14 },
        money: [50, 150],
        drops: [
            { id: "柳叶刀", rate: 0.2 },     // weapons_035
            { id: "《刺客信条》残篇", rate: 0.1 } // booksCultivation_r1_19
        ],
        skills: [
            // 技能 Type 1: 剑花 (多段伤害模拟)
            { id: "青城剑诀", rate: 0.3, type: 1, damage: 50 }
        ],
        desc: "【精英】隐居青城山的剑术高手，剑法轻灵飘逸。"
    },
    {
        id: "rc02_010", template: "minion", name: "入蜀流民", region: "r_c_0_2", spawnType: "road", timeStart: 1,
        subType: "human",
        stats: { hp: 50, atk: 5, def: 0, speed: 4 },
        money: [0, 5],
        drops: [
            { id: "枯树枝", rate: 0.2 }      // weapons_001
        ],
        skills: [],
        desc: "为了躲避中原战乱，翻越秦岭逃入巴蜀的难民。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "rc02_lord_01", template: "lord", name: "蚕丛王尸", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "undead", // 尸王
        stats: { hp: 500, atk: 50, def: 40, speed: 6 },
        money: [500, 1500],
        drops: [
            { id: "龟甲", rate: 0.3 },       // materials_019
            { id: "将军枯骨", rate: 0.3 }    // materials_021
        ],
        skills: [
            { id: "纵目神光", rate: 0.25, type: 2, debuffValue: 20, debuffAttr: "def", debuffTimes: 3 },
            { id: "尸毒云", rate: 0.2, type: 1, damage: 80 },
            { id: "古蜀咒怨", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【领主】古蜀国第一代王，纵目面具下是一双看透阴阳的眼睛。"
    },
    {
        id: "rc02_lord_02", template: "lord", name: "食铁兽之王", region: "r_c_0_2", spawnType: "mountain", timeStart: 1,
        subType: "beast",
        stats: { hp: 800, atk: 70, def: 50, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "奇异毛皮", rate: 1.0 },   // materials_024
            { id: "铁锤", rate: 0.05 }       // weapons_018
        ],
        skills: [
            { id: "泰山压顶", rate: 0.25, type: 1, damage: 120 },
            { id: "金刚不坏", rate: 0.2, type: 3, buffValue: 30, buffAttr: "def", buffTimes: 5 },
            { id: "狂暴怒吼", rate: 0.2, type: 3, buffValue: 25, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【领主】体型如象的巨型熊猫，一巴掌能拍碎城墙。"
    },
    {
        id: "rc02_lord_03", template: "lord", name: "唐门老祖(伪)", region: "r_c_0_2", spawnType: "city", timeStart: 2,
        subType: "human", // 宗师
        stats: { hp: 350, atk: 100, def: 10, speed: 20 },
        money: [1000, 2000],
        drops: [
            { id: "血滴子", rate: 0.1 },     // weapons_062
            { id: "见血封喉散", rate: 0.5 }  // pills_053
        ],
        skills: [
            { id: "暴雨梨花针", rate: 0.3, type: 1, damage: 150 }, // 极高爆发
            { id: "千机变", rate: 0.2, type: 3, buffValue: 30, buffAttr: "speed", buffTimes: 4 },
            { id: "含沙射影", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【领主】巴蜀暗器名家的开创者，全身藏有千种暗器，令人防不胜防。"
    }
];

// --- Part G: 辽东与东胡 (r_ne) [10条] ---
// 范围：襄平、扶余、长白山、黑水
const enemies_r_ne = [
    // ==========================================
    // 1. 白山黑水猛兽
    // ==========================================
    {
        id: "rne_001", template: "elite", name: "东北虎", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 300, atk: 50, def: 12, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_020", rate: 0.4 },       // 虎皮
            { id: "materials_021", rate: 0.4 },       // 虎骨
            { id: "materials_022", rate: 0.4 }        // 虎牙
        ],
        skills: [
            // 技能 Type 2: 虎啸山林 (降防)
            { id: "虎啸山林", rate: 0.3, type: 2, debuffValue: 12, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【精英】体型巨大的吊睛白额虎，雪原上的绝对王者。"
    },
    {
        id: "rne_002", template: "elite", name: "黑瞎子(熊)", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 350, atk: 45, def: 20, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_011", rate: 0.5 },       // 熊胆
            { id: "materials_012", rate: 0.4 },       // 硬骨
            { id: "materials_023", rate: 0.1 }      // 野蜂蜜
        ],
        skills: [
            // 技能 Type 1: 熊抱/猛撞 (高伤)
            { id: "野蛮冲撞", rate: 0.25, type: 1, damage: 60 }
        ],
        desc: "【精英】皮糙肉厚，嗅觉灵敏，发起狂来能撞断大树。"
    },
    {
        id: "rne_003", template: "minion", name: "雪原狼群", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "beast",
        stats: { hp: 70, atk: 18, def: 3, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_050", rate: 0.6 },   // 破损狼皮
            { id: "materials_008", rate: 0.5 }        // 狼牙
        ],
        skills: [],
        desc: "毛色雪白，耐力极强，擅长围猎。"
    },

    // ==========================================
    // 2. 特产与各方势力
    // ==========================================
    {
        id: "rne_004", template: "minion", name: "采参客", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 80, atk: 12, def: 4, speed: 7 },
        money: [20, 100],
        drops: [
            { id: "herbs_030", rate: 0.3 }, // 长白山人参
            { id: "weapons_010", rate: 0.3 }        // 锄头
        ],
        skills: [],
        desc: "在深山老林中寻找人参的冒险者，背包里可能藏着宝贝。"
    },
    {
        id: "rne_005", template: "elite", name: "关外响马", region: "r_ne", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 130, atk: 25, def: 6, speed: 14 },
        money: [30, 90],
        drops: [
            { id: "weapons_025", rate: 0.2 },       // 猎弓
            { id: "mounts_003", rate: 0.05 },    // 枣红马
            { id: "book_body_r1_06_full", rate: 0.45 } // 《骑射心得》残卷
        ],
        skills: [
            // 技能 Type 1: 骑射 (连击/高敏)
            { id: "回马箭", rate: 0.3, type: 1, damage: 40 }
        ],
        desc: "【精英】骑术精湛的强盗，来去如风，手段残忍。"
    },
    {
        id: "rne_006", template: "minion", name: "苦寒流放犯", region: "r_ne", spawnType: "road", timeStart: 0,
        subType: "human",
        stats: { hp: 60, atk: 8, def: 2, speed: 4 },
        money: [0, 5],
        drops: [
            { id: "weapons_008", rate: 0.3 }    // 生锈铁片
        ],
        skills: [],
        desc: "被发配到辽东苦寒之地的罪犯，为了生存不择手段。"
    },

    // ==========================================
    // 3. 异族部落
    // ==========================================
    {
        id: "rne_007", template: "minion", name: "肃慎猎手", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 90, atk: 22, def: 5, speed: 9 },
        money: [5, 20],
        drops: [
            { id: "weapons_048", rate: 0.1 },     // 复合弓
            { id: "materials_003", rate: 0.3 }      // 野猪皮
        ],
        skills: [],
        desc: "使用楛矢石砮的古老部族猎人，擅长在林海雪原中追踪。"
    },
    {
        id: "rne_008", template: "minion", name: "扶余战士", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "human",
        stats: { hp: 110, atk: 20, def: 10, speed: 8 },
        money: [10, 40],
        drops: [
            { id: "weapons_037", rate: 0.1 }    // 秦军长戈
        ],
        skills: [],
        desc: "来自松嫩平原的农耕与游牧混合部族，性格豪爽。"
    },
    {
        id: "rne_009", template: "elite", name: "鲜卑突骑", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "human",
        stats: { hp: 180, atk: 30, def: 12, speed: 16 },
        money: [30, 100],
        drops: [
            { id: "weapons_049", rate: 0.1 },     // 斩马刀
            { id: "mounts_004", rate: 0.05 }   // 乌桓良马
        ],
        skills: [
            // 技能 Type 1: 冲锋
            { id: "铁骑冲锋", rate: 0.3, type: 1, damage: 50 }
        ],
        desc: "【精英】鲜卑山的精锐骑兵，装备比普通匈奴更好。"
    },
    {
        id: "rne_010", template: "boss", name: "长白山雪怪", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast", // 异兽
        stats: { hp: 600, atk: 65, def: 25, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_023", rate: 0.5 },     // 野蜂蜜
            { id: "herbs_030", rate: 0.5 }  // 长白山人参
        ],
        skills: [
            { id: "巨石投掷", rate: 0.25, type: 1, damage: 85 },
            { id: "雪崩怒吼", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【头目】传说中守护圣山的白色巨兽，浑身长满白毛。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "rne_lord_01", template: "lord", name: "长白山龙脉守护", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "elemental", // 元素生物
        stats: { hp: 600, atk: 60, def: 40, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "herbs_030", rate: 1.0 }, // 长白山人参
            { id: "materials_023", rate: 0.5 }      // 野蜂蜜
        ],
        skills: [
            { id: "寒冰吐息", rate: 0.3, type: 1, damage: 90 },
            { id: "极寒领域", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "speed", debuffTimes: 4 },
            { id: "冰晶护甲", rate: 0.2, type: 3, buffValue: 30, buffAttr: "def", buffTimes: 5 }
        ],
        desc: "【领主】由万年冰雪凝聚而成的元素生物，守护着龙脉禁地。"
    },
    {
        id: "rne_lord_02", template: "lord", name: "东胡战神", region: "r_ne", spawnType: "grass", timeStart: 1,
        subType: "human",
        stats: { hp: 500, atk: 75, def: 25, speed: 16 },
        money: [500, 1500],
        drops: [
            { id: "weapons_049", rate: 0.1 },     // 斩马刀
            { id: "mounts_004", rate: 0.1 }    // 乌桓良马
        ],
        skills: [
            { id: "旋风斩", rate: 0.25, type: 1, damage: 100 },
            { id: "战神之怒", rate: 0.2, type: 3, buffValue: 30, buffAttr: "atk", buffTimes: 3 },
            { id: "震慑咆哮", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【领主】东胡部落传说中的勇士，手持千斤重的狼牙棒。"
    },
    {
        id: "rne_lord_03", template: "lord", name: "北冥巨鲲(幼)", region: "r_ne", spawnType: "ocean", timeStart: 2,
        subType: "beast", // 神兽
        stats: { hp: 1200, atk: 80, def: 60, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "materials_044", rate: 0.5 },       // 龙鳞
            { id: "materials_039", rate: 0.5 }    // 精金矿石
        ],
        skills: [
            { id: "吞噬天地", rate: 0.2, type: 1, damage: 150 }, // 极高单体
            { id: "巨浪冲击", rate: 0.25, type: 1, damage: 80 }, // AOE
            { id: "水击三千里", rate: 0.2, type: 2, debuffValue: 30, debuffAttr: "speed", debuffTimes: 5 } // 强力减速
        ],
        desc: "【领主】北冥有鱼，其名为鲲。虽然是幼体，但已有吞天之志。"
    }
];

// --- Part H: 漠北草原 (r_n) [6条] ---
// 范围：龙城、狼居胥、瀚海
const enemies_r_n = [
    // ==========================================
    // 1. 北方草原势力
    // ==========================================
    {
        id: "rn_001", template: "minion", name: "匈奴射雕手", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human",
        stats: { hp: 110, atk: 28, def: 5, speed: 14 },
        money: [10, 50],
        drops: [
            { id: "weapons_048", rate: 0.2 },     // 复合弓
            { id: "materials_015", rate: 0.3 }        // 鹰羽
        ],
        skills: [],
        desc: "从小在马背上长大的神射手，箭无虚发。"
    },
    {
        id: "rn_002", template: "minion", name: "草原巨狼", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "beast",
        stats: { hp: 80, atk: 18, def: 3, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_008", rate: 0.5 },       // 狼牙
            { id: "materials_050", rate: 0.5 }    // 破损狼皮
        ],
        skills: [],
        desc: "比中原狼体型更大，性格更凶残。"
    },
    {
        id: "rn_003", template: "elite", name: "匈奴百夫长", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human",
        stats: { hp: 220, atk: 35, def: 15, speed: 12 },
        money: [50, 150],
        drops: [
            { id: "weapons_049", rate: 0.1 },     // 斩马刀
            { id: "mounts_004", rate: 0.05 }   // 乌桓良马
        ],
        skills: [
            // 技能 Type 1: 冲锋斩 (高伤)
            { id: "草原冲锋", rate: 0.3, type: 1, damage: 55 }
        ],
        desc: "【精英】统领百骑的勇士，身经百战。"
    },
    {
        id: "rn_004", template: "elite", name: "萨满巫师", region: "r_n", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 140, atk: 15, def: 5, speed: 8 },
        money: [20, 80],
        drops: [
            { id: "pills_041", rate: 0.3 },     // 大力丸
            { id: "materials_035", rate: 0.4 }      // 僵尸牙
        ],
        skills: [
            // 技能 Type 2: 虚弱诅咒 (降攻)
            { id: "长生天诅咒", rate: 0.25, type: 2, debuffValue: 10, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【精英】沟通长生天的祭司，能用诡异的舞蹈诅咒敌人。"
    },
    {
        id: "rn_005", template: "boss", name: "白狼王(灵兽)", region: "r_n", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 500, atk: 55, def: 20, speed: 18 },
        money: [0, 0],
        drops: [
            { id: "materials_020", rate: 0.5 },       // 虎皮 (代指极品皮毛)
            { id: "weapons_053", rate: 0.05 }       // 蛇矛
        ],
        skills: [
            // 技能 1: 闪电撕咬 (连击/高敏)
            { id: "闪电撕咬", rate: 0.3, type: 1, damage: 80 },
            // 技能 2: 狼群呼唤 (加攻)
            { id: "狼群呼唤", rate: 0.2, type: 3, buffValue: 15, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【头目】草原上传说的白色狼神，速度快如闪电。"
    },
    {
        id: "rn_006", template: "minion", name: "北海牧羊人", region: "r_n", spawnType: "river", timeStart: 0,
        subType: "human",
        stats: { hp: 60, atk: 10, def: 2, speed: 6 },
        money: [5, 20],
        drops: [
            { id: "weapons_002", rate: 0.3 },       // 竹竿
            { id: "foodMaterial_053", rate: 0.5 }        // 羊肉 (狼肉占位)
        ],
        skills: [],
        desc: "在极北苦寒之地放牧的流亡者，性格孤僻。"
    },

    // ==========================================
    // 2. 领主级 (Lord)
    // ==========================================
    {
        id: "rn_lord_01", template: "lord", name: "冒顿单于", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human",
        stats: { hp: 550, atk: 70, def: 30, speed: 18 },
        money: [1000, 3000],
        drops: [
            { id: "weapons_048", rate: 0.1 },     // 复合弓
            { id: "mounts_005", rate: 0.1 }      // 乌骓马
        ],
        skills: [
            { id: "鸣镝箭", rate: 0.25, type: 1, damage: 100 },
            { id: "万骑冲锋", rate: 0.2, type: 3, buffValue: 20, buffAttr: "speed", buffTimes: 4 }, // 增加速度
            { id: "霸主威压", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【领主】统一草原的匈奴霸主，鸣镝所指，万骑冲锋。"
    },
    {
        id: "rn_lord_02", template: "lord", name: "长生天大祭司", region: "r_n", spawnType: "mountain", timeStart: 1,
        subType: "human",
        stats: { hp: 400, atk: 80, def: 20, speed: 12 },
        money: [500, 1000],
        drops: [
            { id: "pills_041", rate: 0.5 },     // 大力丸
            { id: "book_cultivation_r3_01_full", rate: 0.1 } // 《雷法总纲》残卷
        ],
        skills: [
            { id: "九天雷霆", rate: 0.25, type: 1, damage: 130 }, // 极高法术伤害
            { id: "风暴护盾", rate: 0.2, type: 3, buffValue: 25, buffAttr: "def", buffTimes: 3 },
            { id: "灵魂震慑", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "atk", debuffTimes: 3 }
        ],
        desc: "【领主】能召唤雷霆与风暴的萨满教主，法力无边。"
    },
    {
        id: "rn_lord_03", template: "lord", name: "瀚海沙虫王", region: "r_n", spawnType: "desert", timeStart: 2,
        subType: "beast", // 巨兽
        stats: { hp: 800, atk: 65, def: 40, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_048", rate: 0.8 }    // 沙虫硬皮 (使用坚硬蟹壳占位)
        ],
        skills: [
            { id: "吞噬", rate: 0.2, type: 1, damage: 110 },
            { id: "沙尘暴", rate: 0.2, type: 2, debuffValue: 30, debuffAttr: "speed", debuffTimes: 5 }, // 强力减速
            { id: "钻地突袭", rate: 0.2, type: 1, damage: 90 }
        ],
        desc: "【领主】潜伏在戈壁深处的远古生物，每一次翻身都会引发沙尘暴。"
    }
];

// --- Part I: 西域大漠 (r_w) [7条] ---
// 范围：河西走廊、塔里木、楼兰、天山
const enemies_r_w = [
    // ==========================================
    // 1. 大漠风情与危机
    // ==========================================
    {
        id: "rw_001", template: "minion", name: "沙暴巨蝎", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "insect", // 虫类
        stats: { hp: 90, atk: 25, def: 12, speed: 8, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "materials_048", rate: 0.5 },   // 坚硬蟹壳 (代指蝎壳)
            { id: "materials_018", rate: 0.4 }    // 沙虫硬皮 (毒蝎尾针)
        ],
        skills: [],
        desc: "隐藏在黄沙之下，尾针有剧毒，甲壳坚硬。"
    },
    {
        id: "rw_002", template: "minion", name: "马匪", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "human",
        stats: { hp: 100, atk: 20, def: 5, speed: 14 },
        money: [30, 80],
        drops: [
            { id: "weapons_043", rate: 0.15 },    // 雁翎刀
            { id: "pills_002", rate: 0.2 }        // 西域葡萄 (甘草片占位)
        ],
        skills: [],
        desc: "来去如风的沙盗，骑术精湛，手段残忍。"
    },
    {
        id: "rw_003", template: "elite", name: "楼兰古尸", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "undead",
        stats: { hp: 200, atk: 30, def: 25, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "weapons_023", rate: 0.1 },   // 青铜短剑
            { id: "materials_012", rate: 0.2 }        // 枯骨
        ],
        skills: [
            // 技能 Type 2: 尸毒 (降防/中毒模拟)
            { id: "千年尸毒", rate: 0.3, type: 2, debuffValue: 10, debuffAttr: "def", debuffTimes: 3 }
        ],
        desc: "【精英】被黄沙掩埋千年的干尸，受诅咒而动，不惧刀剑。"
    },
    {
        id: "rw_004", template: "elite", name: "西域刀客", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 160, atk: 40, def: 8, speed: 15 },
        money: [50, 150],
        drops: [
            { id: "weapons_043", rate: 0.2 },     // 雁翎刀
            { id: "book_cultivation_r2_25_full", rate: 0.1 } // 《雁翎刀法》残卷
        ],
        skills: [
            // 技能 Type 1: 拔刀术 (高伤)
            { id: "大漠孤烟", rate: 0.3, type: 1, damage: 60 }
        ],
        desc: "【精英】流浪在丝绸之路上的独行侠，刀法极快。"
    },
    {
        id: "rw_005", template: "boss", name: "沙虫之母", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "beast",
        stats: { hp: 700, atk: 60, def: 30, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_018", rate: 0.5 },   // 沙虫硬皮
            { id: "pills_053", rate: 0.5 }  // 见血封喉散
        ],
        skills: [
            { id: "吞噬", rate: 0.2, type: 1, damage: 90 },
            { id: "流沙陷阱", rate: 0.25, type: 2, debuffValue: 20, debuffAttr: "speed", debuffTimes: 4 }
        ],
        desc: "【头目】体型如小山的巨大沙虫，张开巨口能吞噬一切。"
    },

    // ==========================================
    // 2. 丝路传说
    // ==========================================
    {
        id: "rw_006", template: "minion", name: "苦行僧", region: "r_w", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 120, atk: 15, def: 15, speed: 6 },
        money: [0, 10],
        drops: [
            { id: "weapons_051", rate: 0.2 },       // 戒刀
            { id: "book_cultivation_r3_20_full", rate: 0.05 } // 《金刚经》残页
        ],
        skills: [],
        desc: "从天竺东来的僧人，虽然慈悲，但也会金刚怒目。"
    },
    {
        id: "rw_007", template: "elite", name: "大宛卫士", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 150, atk: 25, def: 20, speed: 10 },
        money: [40, 100],
        drops: [
            { id: "weapons_044", rate: 0.1 }      // 点钢枪
        ],
        skills: [
            // 技能 Type 3: 铁壁 (加防)
            { id: "铁壁方阵", rate: 0.25, type: 3, buffValue: 15, buffAttr: "def", buffTimes: 4 }
        ],
        desc: "【精英】守护汗血宝马的精锐士兵，装备精良。"
    },

    // ==========================================
    // 3. 领主级 (Lord)
    // ==========================================
    {
        id: "rw_lord_01", template: "lord", name: "楼兰女王(怨灵)", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "undead",
        stats: { hp: 450, atk: 85, def: 10, speed: 15 },
        money: [800, 2000],
        drops: [
            { id: "materials_039", rate: 0.3 },   // 精金矿石 (西域财宝)
            { id: "book_cultivation_r2_25_full", rate: 0.1 } // 《魅影身法》
        ],
        skills: [
            { id: "绝望尖啸", rate: 0.2, type: 1, damage: 100 }, // 音波伤害
            { id: "倾国诅咒", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "atk", debuffTimes: 3 },
            { id: "怨灵缠身", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【领主】国破家亡的楼兰女王，用倾国倾城的容貌掩盖致命的诅咒。"
    },
    {
        id: "rw_lord_02", template: "lord", name: "天山雪莲妖", region: "r_w", spawnType: "mountain", timeStart: 1,
        subType: "elemental", // 精怪
        stats: { hp: 500, atk: 50, def: 50, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "herbs_025", rate: 1.0 },   // 天山雪莲
            { id: "pills_071", rate: 0.2 }      // 镇尸丹
        ],
        skills: [
            { id: "冰封万里", rate: 0.25, type: 1, damage: 80 },
            { id: "自然愈合", rate: 0.2, type: 3, buffValue: 30, buffAttr: "def", buffTimes: 5 }, // 加防回血模拟
            { id: "寒气侵蚀", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【领主】生长在天山之巅的万年雪莲修炼成精，浑身是宝。"
    },
    {
        id: "rw_lord_03", template: "lord", name: "火焰山牛魔", region: "r_w", spawnType: "mountain", timeStart: 2,
        subType: "beast", // 魔兽
        stats: { hp: 900, atk: 80, def: 60, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "weapons_029", rate: 0.1 },       // 板斧
            { id: "materials_023", rate: 0.3 }      // 野蜂蜜
        ],
        skills: [
            { id: "烈焰重劈", rate: 0.25, type: 1, damage: 130 },
            { id: "蛮牛冲撞", rate: 0.2, type: 1, damage: 100 },
            { id: "火焰护盾", rate: 0.2, type: 3, buffValue: 40, buffAttr: "def", buffTimes: 4 }
        ],
        desc: "【领主】从火焰山中走出的火焰巨牛，所过之处寸草不生。"
    }
];

// --- Part J: 岭南与南海 (r_s / r_se) [7条] ---
// 范围：百越、苍梧、南海、交趾
const enemies_r_s = [
    // ==========================================
    // 1. 岭南丛林 (r_s)
    // ==========================================
    {
        id: "rs_001", template: "minion", name: "越人战士", region: "r_s", spawnType: "mountain", timeStart: 0,
        subType: "human",
        stats: { hp: 90, atk: 18, def: 2, speed: 12 },
        money: [5, 20],
        drops: [
            { id: "weapons_023", rate: 0.1 },   // 青铜短剑
            { id: "materials_005", rate: 0.3 } // 未经打磨的玉石 (蛇皮占位)
        ],
        skills: [],
        desc: "断发文身，善于在丛林中伏击。"
    },
    {
        id: "rs_002", template: "minion", name: "五彩瘴气蛛", region: "r_s", spawnType: "grass", timeStart: 0,
        subType: "insect", // 虫
        stats: { hp: 50, atk: 30, def: 5, speed: 10, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "pills_053", rate: 0.3 }, // 见血封喉散
            { id: "materials_006", rate: 0.3 }      // 毒虫干 (毒蛇牙占位)
        ],
        skills: [],
        desc: "生活在瘴气弥漫的丛林中，颜色越鲜艳毒性越强。"
    },
    {
        id: "rs_003", template: "elite", name: "南越战象", region: "r_s", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        stats: { hp: 400, atk: 45, def: 25, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "materials_044", rate: 0.5 },       // 龙鳞 (代指象牙/厚皮)
            { id: "materials_011", rate: 0.5 }        // 熊胆 (代指珍稀药材)
        ],
        skills: [
            // 技能 Type 1: 践踏 (AOE)
            { id: "战争践踏", rate: 0.3, type: 1, damage: 65 }
        ],
        desc: "【精英】身披木甲的战象，冲锋起来地动山摇。"
    },
    {
        id: "rs_004", template: "elite", name: "蛊术师", region: "r_s", spawnType: "village", timeStart: 0,
        subType: "human",
        stats: { hp: 100, atk: 20, def: 5, speed: 8, toxicity: 20 },
        money: [30, 80],
        drops: [
            { id: "foodMaterial_002", rate: 0.4 }        // 糯米 (大米占位)
        ],
        skills: [
            // 技能 Type 2: 下蛊 (持续伤害/减益，模拟减防)
            { id: "百毒蛊", rate: 0.25, type: 2, debuffValue: 10, debuffAttr: "def", debuffTimes: 4 }
        ],
        desc: "【精英】操控毒虫作为武器，令人防不胜防。"
    },

    // ==========================================
    // 2. 南海海域 (r_se)
    // ==========================================
    {
        id: "rs_005", template: "minion", name: "采珠人(溺亡)", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "undead",
        stats: { hp: 70, atk: 15, def: 5, speed: 8 },
        money: [10, 50],
        drops: [
            { id: "materials_039", rate: 0.2 },   // 精金矿石 (代指珍珠)
            { id: "weapons_015", rate: 0.3 }      // 杀鱼刀
        ],
        skills: [],
        desc: "为了采集海底珍珠而溺亡的怨魂。"
    },
    {
        id: "rs_006", template: "minion", name: "南海大鲨", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "beast",
        stats: { hp: 200, atk: 40, def: 10, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_046", rate: 0.4 }    // 尖锐兽牙
        ],
        skills: [],
        desc: "海中嗜血的猎手，闻到血腥味就会疯狂。"
    },
    {
        id: "rs_007", template: "boss", name: "深海巨妖", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "beast", // 海怪
        stats: { hp: 900, atk: 70, def: 20, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_039", rate: 1.0 },   // 精金矿石 (珍珠)
            { id: "weapons_075", rate: 0.1 } // 寒冰绵掌手套
        ],
        skills: [
            { id: "触手绞杀", rate: 0.25, type: 1, damage: 100 },
            { id: "墨汁喷吐", rate: 0.2, type: 2, debuffValue: 15, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【头目】多条触手的海怪，能轻易掀翻楼船。"
    },

    // ==========================================
    // 3. 领主级 (Lord)
    // ==========================================
    {
        id: "rs_lord_01", template: "lord", name: "南越武王(赵佗)", region: "r_s", spawnType: "city", timeStart: 0,
        subType: "human",
        stats: { hp: 500, atk: 65, def: 35, speed: 14 },
        money: [1000, 3000],
        drops: [
            { id: "weapons_038", rate: 0.1 },   // 青铜阔剑
            { id: "book_body_r1_16_full", rate: 0.1 } // 《铁甲功》上篇
        ],
        skills: [
            { id: "天子剑法", rate: 0.25, type: 1, damage: 95 },
            { id: "帝王霸气", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "def", debuffTimes: 3 },
            { id: "割据一方", rate: 0.2, type: 3, buffValue: 25, buffAttr: "def", buffTimes: 5 }
        ],
        desc: "【领主】割据岭南的秦朝将领，虽已年迈，但帝王霸气犹存。"
    },
    {
        id: "rs_lord_02", template: "lord", name: "万蛊之王", region: "r_s", spawnType: "mountain", timeStart: 1,
        subType: "insect", // 蛊王
        stats: { hp: 350, atk: 90, def: 20, speed: 18, toxicity: 30 },
        money: [0, 0],
        drops: [
            { id: "pills_053", rate: 1.0 }, // 见血封喉散
            { id: "materials_010", rate: 0.5 }        // 丹砂 (蛇胆占位)
        ],
        skills: [
            { id: "万蛊噬心", rate: 0.3, type: 1, damage: 130 }, // 极高毒伤
            { id: "剧毒新星", rate: 0.2, type: 2, debuffValue: 30, debuffAttr: "speed", debuffTimes: 4 },
            { id: "蛊神护体", rate: 0.2, type: 3, buffValue: 30, buffAttr: "atk", buffTimes: 3 }
        ],
        desc: "【领主】吞噬了无数毒虫后诞生的蛊王，剧毒无比，触之即死。"
    },
    {
        id: "rs_lord_03", template: "lord", name: "南海龙王(伪)", region: "r_se", spawnType: "ocean", timeStart: 2,
        subType: "beast", // 巨鲸
        stats: { hp: 800, atk: 75, def: 40, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_039", rate: 0.8 },   // 精金矿石 (深海宝藏)
            { id: "weapons_075", rate: 0.1 } // 寒冰绵掌手套
        ],
        skills: [
            { id: "深海重压", rate: 0.25, type: 1, damage: 110 },
            { id: "惊涛骇浪", rate: 0.2, type: 2, debuffValue: 20, debuffAttr: "speed", debuffTimes: 3 },
            { id: "水幕天华", rate: 0.2, type: 3, buffValue: 40, buffAttr: "def", buffTimes: 4 }
        ],
        desc: "【领主】统御南海水族的一头巨型鲸鲵，自封为王。"
    }
];

// ================= 3. 数据合并与初始化 =================

// 将所有区域数组合并为总数组
const rawEnemies = [
    ...enemies_all,
    ...enemies_r_c_1_1,
    ...enemies_r_c_2_1,
    ...enemies_r_e_0_1,
    ...enemies_r_c_1_2,
    ...enemies_r_c_0_2,
    ...enemies_r_ne,
    ...enemies_r_n,
    ...enemies_r_w,
    ...enemies_r_s
];

// 初始化函数：将模板属性应用到敌人数据上
function initEnemyData() {
    return rawEnemies.map(e => {
        const tmpl = ENEMY_TEMPLATES[e.template || "minion"];
        if (!tmpl) return e;

        // 深拷贝基础属性
        let finalStats = {...e.stats};

        // 应用模板倍率
        finalStats.hp = Math.floor(finalStats.hp * tmpl.multipliers.hp);
        finalStats.atk = Math.floor(finalStats.atk * tmpl.multipliers.atk);
        finalStats.def = Math.floor(finalStats.def * tmpl.multipliers.def);
        finalStats.speed = Math.floor(finalStats.speed * tmpl.multipliers.speed);

        // 计算经验值和金钱倍率
        const expBase = Math.floor(finalStats.hp / 2 + finalStats.atk * 2);
        const exp = Math.floor(expBase * tmpl.multipliers.exp);

        const money = [
            Math.floor(e.money[0] * tmpl.multipliers.money),
            Math.floor(e.money[1] * tmpl.multipliers.money)
        ];

        // 加上颜色标签
        const nameHtml = `<span style="color:${tmpl.color}">${e.name}</span>`;

        return {
            ...e,
            nameHtml : nameHtml, // 用于UI显示
            levelType: tmpl.name, // 显示为 [精英] 等
            stats    : finalStats,
            exp      : exp,
            money    : money
        };
    });
}

// 导出最终数据
const enemies = initEnemyData();
window.enemies = enemies; // 挂载到全局