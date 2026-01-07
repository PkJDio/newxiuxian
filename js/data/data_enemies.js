// ================= 1. 敌人模板 (Templates) =================
const ENEMY_TEMPLATES = {
    "minion": {
        name       : "杂鱼",
        color      : "#212121",
        multipliers: {hp: 1.0, atk: 1.0, def: 1.0, speed: 1.0, exp: 1.0, money: 1.0}
    },
    "elite" : {
        name       : "精英",
        color      : "#1e5faf",
        multipliers: {hp: 2.5, atk: 1.5, def: 1.2, speed: 1.1, exp: 2.5, money: 2.0}
    },
    "boss"  : {
        name       : "头目",
        color      : "#56059f",
        multipliers: {hp: 8.0, atk: 2.0, def: 1.5, speed: 1.2, exp: 8.0, money: 10.0}
    },
    "lord"  : {
        name       : "领主",
        color      : "#a60518",
        multipliers: {hp: 20.0, atk: 3.5, def: 2.5, speed: 1.3, exp: 50.0, money: 50.0}
    }
};

// 辅助函数：应用模板属性
// (游戏初始化时需调用此逻辑处理 rawEnemies)
// ================= 2. 敌人列表 (Enemies) =================
// ================= 2. 敌人数据构建 =================

// --- Part A: 全区域通用 (Global) [20条] ---
const enemies_all = [
    // 1. 基础野兽
    {
        id   : "global_001", template: "minion", name: "流浪野狗", region: "all", spawnType: "all", timeStart: 0,
        stats: {hp: 30, atk: 5, def: 0, speed: 6}, money: [0, 0],
        drops: [{id: "materials_001", rate: 0.4}, {id: "materials_002", rate: 0.3}, {id: "foodMaterial_050", rate: 0.5}],
        desc : "乱世中随处可见的野狗，双眼发红，为了护食非常凶狠。"
    },
    {
        id   : "global_002", template: "minion", name: "疯狂老鼠", region: "all", spawnType: "all", timeStart: 0,
        stats: {hp: 20, atk: 3, def: 0, speed: 15}, money: [0, 0],
        drops: [{id: "materials_009", rate: 0.1}], // 极低概率掉杂物
        desc : "体型硕大的老鼠，为了抢一口吃的，连人都敢咬。"
    },
    {
        id   : "global_003", template: "minion", name: "草丛毒蛇", region: "all", spawnType: "grass", timeStart: 0,
        stats: {hp: 25, atk: 20, def: 0, speed: 12, toxicity :40}, money: [0, 0],
        drops: [{id: "materials_010", rate: 0.2}, {id: "materials_005", rate: 0.4}, {id: "materials_006", rate: 0.4}],
        desc : "潜伏在草丛深处，攻击带有剧毒，咬一口可能致命。"
    },
    {
        id   : "global_004", template: "minion", name: "山林灰狼", region: "all", spawnType: "mountain", timeStart: 0,
        stats: {hp: 60, atk: 12, def: 2, speed: 10}, money: [0, 0],
        drops: [{id: "materials_007", rate: 0.5}, {id: "materials_008", rate: 0.4}, {id: "foodMaterial_053", rate: 0.6}],
        desc : "成群结队出没的掠食者，听到狼嚎时最好赶紧爬树。"
    },
    {
        id   : "global_005", template: "minion", name: "暴躁野猪", region: "all", spawnType: "mountain", timeStart: 0,
        stats: {hp: 80, atk: 15, def: 5, speed: 8}, money: [0, 0],
        drops: [{id: "materials_003", rate: 0.5}, {id: "materials_004", rate: 0.4}, {id: "foodMaterial_051", rate: 0.8}],
        desc : "皮糙肉厚，发起疯来连老虎都要避让三分。"
    },

    // 2. 乱世流民与强盗
    {
        id   : "global_006", template: "minion", name: "饥饿流民", region: "all", spawnType: "road", timeStart: 0,
        stats: {hp: 40, atk: 4, def: 0, speed: 4}, money: [0, 5],
        drops: [{id: "weapons_001", rate: 0.2}, {id: "weapons_006", rate: 0.3}, {id: "foodMaterial_006", rate: 0.1}],
        desc : "衣衫褴褛，面黄肌瘦，为了活下去已经不顾一切。"
    },
    {
        id   : "global_007", template: "minion", name: "疯癫乞丐", region: "all", spawnType: "road", timeStart: 0,
        stats: {hp: 50, atk: 10, def: 0, speed: 6}, money: [0, 10],
        drops: [
            {id: "weapons_002", rate: 0.4},
            {id: "foods_008", rate: 0.2},
            {id: "booksCultivation_r1_01_upper", rate: 0.01},
            {id: "booksCultivation_r1_01_middle", rate: 0.01},
            {id: "booksCultivation_r1_01_lower", rate: 0.01},
            {id: "booksCultivation_r1_02_upper", rate: 0.01},
            {id: "booksCultivation_r1_02_middle", rate: 0.01},
            {id: "booksCultivation_r1_02_lower", rate: 0.01},
            {id: "booksCultivation_r1_03_upper", rate: 0.01},
            {id: "booksCultivation_r1_03_middle", rate: 0.01},
            {id: "booksCultivation_r1_03_lower", rate: 0.01},
            {id: "booksCultivation_r1_04_upper", rate: 0.01},
            {id: "booksCultivation_r1_04_middle", rate: 0.01},
            {id: "booksCultivation_r1_04_lower", rate: 0.01},


        ], // 极低概率掉破书
        desc : "神智不清的乞丐，嘴里念叨着无人能懂的疯话。"
    },
    {
        id   : "global_008", template: "minion", name: "拦路蟊贼", region: "all", spawnType: "road", timeStart: 0,
        stats: {hp: 70, atk: 10, def: 1, speed: 6}, money: [5, 20],
        drops: [{id: "weapons_008", rate: 0.3}, {id: "weapons_003", rate: 0.3}, {id: "materials_009", rate: 0.1}],
        desc : "手里拿着生锈的刀，专门在官道旁打劫过路客。"
    },
    {
        id   : "global_009", template: "minion", name: "秦军逃兵", region: "all", spawnType: "road", timeStart: 1, // 秦末起义后出现
        stats: {hp: 90, atk: 15, def: 5, speed: 5}, money: [10, 40],
        drops: [{id: "weapons_024", rate: 0.2}, {id: "weapons_023", rate: 0.1},

            {id: "booksBody_r2_09_upper", rate: 0.01},
            {id: "booksBody_r2_09_middle", rate: 0.01},
            {id: "booksBody_r2_09_lower", rate: 0.01},
        ],
        desc : "受不了繁重徭役逃出来的士兵，依然保留着军中的杀人技。"
    },
    {
        id   : "global_010", template: "elite", name: "强盗头子", region: "all", spawnType: "road", timeStart: 0,
        stats: {hp: 160, atk: 25, def: 8, speed: 7}, money: [50, 120],
        drops: [{id: "weapons_030", rate: 0.2}, {id: "head_002", rate: 0.2}, {id: "pills_001", rate: 0.3}],
        desc : "【精英】纠集了一帮亡命之徒，占据山头称大王。"
    },

    // 3. 特殊人类与江湖客
    {
        id   : "global_011", template: "minion", name: "采药竞争者", region: "all", spawnType: "mountain", timeStart: 0,
        stats: {hp: 60, atk: 8, def: 2, speed: 9}, money: [20, 50],
        drops: [{id: "herbs_001", rate: 0.3}, {id: "weapons_010", rate: 0.2}],
        desc : "同行是冤家，为了争夺一株灵草可能会拔刀相向。"
    },
    {
        id   : "global_012", template: "elite", name: "通缉大盗", region: "all", spawnType: "road", timeStart: 0,
        stats: {hp: 180, atk: 30, def: 10, speed: 10}, money: [100, 200],
        drops: [{id: "weapons_035", rate: 0.1}, {id: "pills_001", rate: 0.2},
            {id: "booksBody_r1_21_upper", rate: 0.01},
            {id: "booksBody_r1_21_middle", rate: 0.01},
            {id: "booksBody_r1_21_lower", rate: 0.01},

        ],
        desc : "【精英】官府悬赏百金的要犯，杀人不眨眼，身手了得。"
    },
    {
        id   : "global_013", template: "elite", name: "赏金猎人", region: "all", spawnType: "road", timeStart: 0,
        stats: {hp: 150, atk: 28, def: 12, speed: 8}, money: [50, 100],
        drops: [{id: "weapons_040", rate: 0.1}, {id: "weapons_025", rate: 0.2}, {id: "head_012", rate: 0.1}],
        desc : "【精英】拿人钱财替人消灾，把你当成了行走的赏金。"
    },
    {
        id   : "global_014", template: "elite", name: "蒙面杀手", region: "all", spawnType: "road", timeStart: 1,
        stats: {hp: 140, atk: 40, def: 5, speed: 15,toxicity: 10}, money: [80, 150],
        drops: [{id: "weapons_039", rate: 0.2}, {id: "pills_053", rate: 0.3}], // 掉匕首、毒药
        desc : "【精英】不知受何人指使的刺客，招招直奔要害。"
    },
    {
        id   : "global_015", template: "boss", name: "义军首领", region: "all", spawnType: "road", timeStart: 2, // 乱世中期出现
        stats: {hp: 350, atk: 45, def: 18, speed: 10}, money: [150, 400],
        drops: [
            {id: "weapons_036", rate: 0.1},
            {id: "weapons_038", rate: 0.1},
        ],
        desc : "【头目】打着起义旗号的枭雄，手下聚集了数千人马。"
    },

    // 4. 环境与超自然
    {
        id   : "global_016", template: "minion", name: "食腐秃鹫", region: "all", spawnType: "desert", timeStart: 0,
        stats: {hp: 40, atk: 18, def: 2, speed: 14}, money: [0, 0],
        drops: [{id: "materials_009", rate: 0.5}, {id: "materials_016", rate: 0.2}],
        desc : "盘旋在战场上空，专门啄食死尸的眼睛。"
    },
    {
        id   : "global_017", template: "minion", name: "河中水鬼", region: "all", spawnType: "river", timeStart: 0,
        stats: {hp: 70, atk: 20, def: 5, speed: 8}, money: [0, 5],
        drops: [{id: "materials_012", rate: 0.1}, {id: "weapons_015", rate: 0.2}], // 掉骨头、杀鱼刀
        desc : "溺死之人的怨气所化，会把路过岸边的人拖入水中。"
    },
    {
        id   : "global_018", template: "elite", name: "吊睛白额虎", region: "all", spawnType: "mountain", timeStart: 0,
        stats: {hp: 250, atk: 45, def: 15, speed: 12}, money: [0, 0],
        drops: [{id: "materials_020", rate: 0.5}, {id: "materials_021", rate: 0.5}, {id: "materials_022", rate: 0.5}],
        desc : "【精英】山中霸主，体型巨大，寻常刀剑难伤分毫。"
    },
    {
        id   : "global_019", template: "elite", name: "狂暴黑熊", region: "all", spawnType: "mountain", timeStart: 0,
        stats: {hp: 300, atk: 40, def: 25, speed: 6}, money: [0, 0],
        drops: [{id: "materials_011", rate: 0.6}, {id: "materials_012", rate: 0.5}, {id: "materials_023", rate: 0.1}],
        desc : "【精英】力大无穷的黑熊，人立起来有一丈高。"
    },
    {
        id   : "global_020", template: "minion", name: "游荡尸傀", region: "all", spawnType: "all", timeStart: 1,
        stats: {hp: 120, atk: 15, def: 20, speed: 3}, money: [0, 0],
        drops: [{id: "materials_002", rate: 0.3}, {id: "pills_097", rate: 0.1}], // 掉牙、解毒丹
        desc : "死而不僵的尸体，受到阴气侵蚀重新站了起来，不知疼痛。"
    }
];

// --- Part B: 关中地区 (r_c_1_1) [12条] ---
// 范围：咸阳、雍城、蓝田、骊山、秦始皇陵
const enemies_r_c_1_1 = [
    // 1. 帝都守备力量
    {
        id   : "rc11_001", template: "minion", name: "秦军城门卫", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        stats: {hp: 100, atk: 15, def: 10, speed: 5}, money: [10, 30],
        drops: [{id: "weapons_023", rate: 0.2}, {id: "weapons_024", rate: 0.1}],
        desc : "驻守咸阳各门的士兵，盘查过往行人，神情严肃。"
    },
    {
        id   : "rc11_002", template: "elite", name: "金吾卫巡逻队", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        stats: {hp: 180, atk: 30, def: 20, speed: 7}, money: [30, 80],
        drops: [{id: "weapons_037", rate: 0.15},

            {id: "booksBody_r1_16_upper", rate: 0.01},
            {id: "booksBody_r1_16_middle", rate: 0.01},
            {id: "booksBody_r1_16_lower", rate: 0.01},
        ], // 掉落长戈
        desc : "【精英】负责京城治安的精锐部队，披坚执锐，昼夜巡逻。"
    },
    {
        id   : "rc11_003", template: "elite", name: "大秦锐士", region: "r_c_1_1", spawnType: "road", timeStart: 0,
        stats: {hp: 200, atk: 35, def: 15, speed: 8}, money: [50, 100],
        drops: [{id: "weapons_038", rate: 0.1}, {id: "head_011", rate: 0.1}], // 掉落阔剑
        desc : "【精英】秦军中最精锐的战士，曾横扫六国，战功赫赫。"
    },

    // 2. 骊山与皇陵 (苦役与机关)
    {
        id   : "rc11_004", template: "minion", name: "骊山刑徒", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 60, atk: 12, def: 2, speed: 5}, money: [0, 5],
        drops: [{id: "weapons_020", rate: 0.3}, {id: "weapons_010", rate: 0.3}, {id: "materials_005", rate: 0.1}],
        desc : "修筑皇陵的七十万刑徒之一，衣不蔽体，眼神麻木。"
    },
    {
        id   : "rc11_005", template: "elite", name: "监工酷吏", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 120, atk: 20, def: 5, speed: 6}, money: [20, 60],
        drops: [{id: "weapons_027", rate: 0.2}], // 掉落鞭子
        desc : "【精英】手持皮鞭，以折磨刑徒为乐，心狠手辣。"
    },
    {
        id   : "rc11_006", template: "elite", name: "机关铜人(残)", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 250, atk: 25, def: 40, speed: 3}, money: [0, 0],
        drops: [{id: "weapons_018", rate: 0.2}, {id: "materials_012", rate: 0.1}], // 掉铁锤
        desc : "【精英】墨家或公输家制造的守陵机关，虽然破损但依然坚硬。"
    },
    {
        id   : "rc11_007", template: "boss", name: "守陵尸将", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 600, atk: 55, def: 35, speed: 5}, money: [0, 0],
        drops: [{id: "weapons_090", rate: 0.01}, {id: "materials_021", rate: 0.2}, {id: "pills_071", rate: 0.3}],
        desc : "【头目】死在皇陵中的秦军将领，被阴气转化为不知疲倦的杀戮机器。"
    },

    // 3. 渭水与蓝田
    {
        id   : "rc11_008", template: "minion", name: "渭河水鬼", region: "r_c_1_1", spawnType: "river", timeStart: 0,
        stats: {hp: 80, atk: 18, def: 5, speed: 12}, money: [0, 10],
        drops: [{id: "materials_012", rate: 0.1}, {id: "weapons_015", rate: 0.2}],
        desc : "溺死在渭水中的怨魂，皮肤浮肿，会把路过岸边的人拖下水。"
    },
    {
        id   : "rc11_009", template: "minion", name: "发疯的采玉人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 70, atk: 10, def: 3, speed: 7}, money: [10, 50],
        drops: [{id: "weapons_011", rate: 0.3}, {id: "materials_005", rate: 0.2}],
        desc : "在蓝田山中寻找美玉而迷失心智的可怜人。"
    },

    // 4. 暗流涌动
    {
        id   : "rc11_010", template: "elite", name: "六国死士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        stats: {hp: 140, atk: 45, def: 5, speed: 18}, money: [50, 150],
        drops: [{id: "weapons_039", rate: 0.2}, {id: "pills_001", rate: 0.4},

            {id: "booksCultivation_r1_19_upper", rate: 0.03},
            {id: "booksCultivation_r1_19_middle", rate: 0.03},
            {id: "booksCultivation_r1_19_lower", rate: 0.03},

        ],
        desc : "【精英】潜伏在咸阳企图刺杀秦皇的刺客，怀着国破家亡的仇恨。"
    },
    {
        id   : "rc11_011", template: "minion", name: "炼丹方士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        stats: {hp: 80, atk: 5, def: 2, speed: 6}, money: [20, 100],
        drops: [{id: "pills_001", rate: 0.3}, {id: "materials_010", rate: 0.2},

            {id: "booksCultivation_r2_01_upper", rate: 0.01},
            {id: "booksCultivation_r2_01_middle", rate: 0.01},
            {id: "booksCultivation_r2_01_lower", rate: 0.01},
            {id: "booksCultivation_r2_02_upper", rate: 0.01},
            {id: "booksCultivation_r2_02_middle", rate: 0.01},
            {id: "booksCultivation_r2_02_lower", rate: 0.01},
            {id: "booksCultivation_r2_03_upper", rate: 0.01},
            {id: "booksCultivation_r2_03_middle", rate: 0.01},
            {id: "booksCultivation_r2_03_lower", rate: 0.01},
            {id: "booksCultivation_r2_04_upper", rate: 0.01},
            {id: "booksCultivation_r2_04_middle", rate: 0.01},
            {id: "booksCultivation_r2_04_lower", rate: 0.01},
            {id: "booksCultivation_r2_05_upper", rate: 0.01},
            {id: "booksCultivation_r2_05_middle", rate: 0.01},
            {id: "booksCultivation_r2_05_lower", rate: 0.01},
        ],
        desc : "声称能炼制长生不老药的术士，其实多半是骗子。"
    },
    {
        id   : "rc11_012", template: "elite", name: "宫廷乐师(刺客)", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        stats: {hp: 130, atk: 35, def: 5, speed: 15}, money: [40, 90],
        drops: [{id: "weapons_040", rate: 0.2},], // 掉落袖箭
        desc : "【精英】以击筑为掩护，乐器中藏着致命的武器，类似高渐离。"
    },
    {
        id   : "rc11_lord_01", template: "lord", name: "始皇陵守灵人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 400, atk: 60, def: 40, speed: 8}, money: [500, 1000],
        drops: [{id: "weapons_090", rate: 0.05}, {id: "booksCultivation_r3_01_upper", rate: 0.1}],
        desc : "【领主】活了不知多少岁月的守陵人，掌握着秦皇扫六合的恐怖武学。"
    },
    {
        id   : "rc11_lord_02", template: "lord", name: "堕落的蒙恬英灵", region: "r_c_1_1", spawnType: "road", timeStart: 1,
        stats: {hp: 450, atk: 70, def: 35, speed: 12}, money: [600, 1200],
        drops: [{id: "weapons_053", rate: 0.05}, {id: "head_012", rate: 0.1}],
        desc : "【领主】被奸臣害死的大将怨气不散，率领幽冥鬼军徘徊在长城脚下。"
    },
    {
        id   : "rc11_lord_03", template: "lord", name: "楚霸王(分身)", region: "r_c_1_1", spawnType: "city", timeStart: 2,
        stats: {hp: 600, atk: 90, def: 30, speed: 15}, money: [1000, 2000],
        drops: [{id: "weapons_065", rate: 0.05}, {id: "mounts_005", rate: 0.05}], // 掉霸王枪、乌骓马
        desc : "【领主】力拔山兮气盖世，即使只是霸王留下的一道战意分身，也足以横扫千军。"
    }
];

// --- Part C: 中原地区 (r_c_2_1) [8条] ---
// 范围：洛阳、三晋、邯郸、黄河中下游
const enemies_r_c_2_1 = [
    // 1. 洛阳与周室
    {
        id   : "rc21_001", template: "minion", name: "洛阳游侠", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        stats: {hp: 90, atk: 20, def: 5, speed: 12}, money: [10, 40],
        drops: [{id: "weapons_021", rate: 0.3}],
        desc : "混迹于洛阳市井的少年剑客，轻生死，重然诺。"
    },
    {
        id   : "rc21_002", template: "elite", name: "周室守藏史(亡魂)", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        stats: {hp: 150, atk: 25, def: 0, speed: 8}, money: [0, 0],
        drops: [

            {id: "booksCultivation_r3_01_upper", rate: 0.01},
            {id: "booksCultivation_r3_01_middle", rate: 0.01},
            {id: "booksCultivation_r3_01_lower", rate: 0.01},
            {id: "booksCultivation_r3_02_upper", rate: 0.01},
            {id: "booksCultivation_r3_02_middle", rate: 0.01},
            {id: "booksCultivation_r3_02_lower", rate: 0.01},
            {id: "booksCultivation_r3_03_upper", rate: 0.01},
            {id: "booksCultivation_r3_03_middle", rate: 0.01},
            {id: "booksCultivation_r3_03_lower", rate: 0.01},
            {id: "booksCultivation_r3_04_upper", rate: 0.01},
            {id: "booksCultivation_r3_04_middle", rate: 0.01},
            {id: "booksCultivation_r3_04_lower", rate: 0.01},
            {id: "booksCultivation_r3_05_upper", rate: 0.01},
            {id: "booksCultivation_r3_05_middle", rate: 0.01},
            {id: "booksCultivation_r3_05_lower", rate: 0.01},
        ],
        desc : "【精英】周朝覆灭后不愿离去的史官亡魂，守护着残缺的典籍。"
    },

    // 2. 三晋旧地
    {
        id   : "rc21_003", template: "elite", name: "魏武卒英灵", region: "r_c_2_1", spawnType: "road", timeStart: 0,
        stats: {hp: 200, atk: 30, def: 25, speed: 6}, money: [0, 0],
        drops: [{id: "weapons_037", rate: 0.1},

            {id: "booksBody_r1_09_upper", rate: 0.01},
            {id: "booksBody_r1_09_middle", rate: 0.01},
            {id: "booksBody_r1_09_lower", rate: 0.01},

        ],
        desc : "【精英】战国时期最强步兵的英灵，即便死去依然身披重甲。"
    },
    {
        id   : "rc21_004", template: "minion", name: "韩国弩手(残部)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 80, atk: 35, def: 2, speed: 9}, money: [5, 20],
        drops: [{id: "weapons_025", rate: 0.3}, {id: "weapons_060", rate: 0.01}], // 极低概率掉诸葛连弩(代指强弩)
        desc : "天下强弓劲弩皆出韩，躲在暗处放冷箭的残兵。"
    },

    // 3. 黄河与商业
    {
        id   : "rc21_005", template: "minion", name: "陵墓盗贼", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 80, atk: 12, def: 4, speed: 8}, money: [20, 80],
        drops: [{id: "weapons_020", rate: 0.4}, {id: "materials_019", rate: 0.1}], // 掉洛阳铲(矿镐)、龟甲
        desc : "活跃在邙山一带的盗墓贼，擅长分金定穴。"
    },
    {
        id   : "rc21_006", template: "elite", name: "黄河河伯娶亲队", region: "r_c_2_1", spawnType: "river", timeStart: 0,
        stats: {hp: 180, atk: 20, def: 10, speed: 8}, money: [50, 200],
        drops: [{id: "head_004", rate: 0.2}],
        desc : "【精英】崇拜邪神河伯的狂热信徒，敲锣打鼓要把活人扔进河里。"
    },
    {
        id   : "rc21_007", template: "minion", name: "豪强恶奴", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        stats: {hp: 90, atk: 15, def: 5, speed: 6}, money: [10, 50],
        drops: [{id: "weapons_003", rate: 0.4},
            {id: "booksBody_r1_03_upper", rate: 0.01},
            {id: "booksBody_r1_03_middle", rate: 0.01},
            {id: "booksBody_r1_03_lower", rate: 0.01},
        ],
        desc : "中原富商豪强豢养的打手，仗势欺人。"
    },
    {
        id   : "rc21_008", template: "boss", name: "鬼谷弃徒", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 500, atk: 60, def: 20, speed: 15}, money: [200, 500],
        drops: [

            {id: "booksCultivation_r3_01_upper", rate: 0.02},
            {id: "booksCultivation_r3_01_middle", rate: 0.02},
            {id: "booksCultivation_r3_01_lower", rate: 0.02},
            {id: "booksCultivation_r3_02_upper", rate: 0.02},
            {id: "booksCultivation_r3_02_middle", rate: 0.02},
            {id: "booksCultivation_r3_02_lower", rate: 0.02},
            {id: "booksCultivation_r3_03_upper", rate: 0.02},
            {id: "booksCultivation_r3_03_middle", rate: 0.02},
            {id: "booksCultivation_r3_03_lower", rate: 0.02},
            {id: "booksCultivation_r3_04_upper", rate: 0.02},
            {id: "booksCultivation_r3_04_middle", rate: 0.02},
            {id: "booksCultivation_r3_04_lower", rate: 0.02},
            {id: "booksCultivation_r3_05_upper", rate: 0.02},
            {id: "booksCultivation_r3_05_middle", rate: 0.02},
            {id: "booksCultivation_r3_05_lower", rate: 0.02},

            {id: "weapons_055", rate: 0.1}],
        desc : "【头目】云梦山上下来的纵横家弃徒，精通剑术与权谋。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rc21_lord_01", template: "lord", name: "鬼谷子(幻影)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 350, atk: 80, def: 20, speed: 20}, money: [500, 1000],
        drops: [{id: "booksCultivation_r3_20_upper", rate: 0.1}, {id: "pills_071", rate: 0.2}],
        desc : "【领主】纵横家的鼻祖，在此地留下的一道考验后人的神念。"
    },
    {
        id   : "rc21_lord_02", template: "lord", name: "信陵君食客首领", region: "r_c_2_1", spawnType: "city", timeStart: 1,
        stats: {hp: 420, atk: 65, def: 30, speed: 10}, money: [600, 1200],
        drops: [{id: "weapons_055", rate: 0.05}, {id: "materials_026", rate: 0.2}],
        desc : "【领主】曾窃符救赵的义士首领，如今聚集在魏地试图恢复旧秩序。"
    },
    {
        id   : "rc21_lord_03", template: "lord", name: "黄河巨龟", region: "r_c_2_1", spawnType: "river", timeStart: 2,
        stats: {hp: 800, atk: 50, def: 80, speed: 4}, money: [0, 0],
        drops: [{id: "materials_019", rate: 1.0}, {id: "materials_026", rate: 0.5}], // 必掉玄武甲
        desc : "【领主】背负洛书的神龟后裔，体型如小岛，兴风作浪。"
    }
];

// --- Part D: 齐鲁大地 (r_e_0_1) [10条] ---
// 范围：临淄、曲阜、泰山、东海之滨
const enemies_r_e_0_1 = [
    // 1. 商业与百家
    {
        id   : "re01_001", template: "minion", name: "私盐贩子", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        stats: {hp: 110, atk: 15, def: 8, speed: 8}, money: [40, 100],
        drops: [{id: "weapons_034", rate: 0.15}, {id: "foodMaterial_008", rate: 0.8}], // 掉落长柄叉、盐
        desc : "齐地多盐铁，贩卖私盐利润极高，他们为了护盐敢于拼命。"
    },
    {
        id   : "re01_002", template: "minion", name: "临淄斗鸡", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        stats: {hp: 50, atk: 25, def: 2, speed: 18}, money: [0, 0],
        drops: [{id: "materials_009", rate: 0.5}, {id: "foodMaterial_050", rate: 0.5}], // 掉羽毛、肉
        desc : "齐国贵族好斗鸡，这些精心饲养的斗鸡凶猛异常，啄人极痛。"
    },
    {
        id   : "re01_003", template: "elite", name: "墨家机关兽(暴走)", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 200, atk: 25, def: 35, speed: 6}, money: [0, 0],
        drops: [{id: "weapons_011", rate: 0.3}, {id: "weapons_055", rate: 0.05}, {id: "materials_012", rate: 0.2}], // 掉凿子、铁骨扇
        desc : "【精英】墨家留下的木石机关，因年久失修而敌我不分。"
    },
    {
        id   : "re01_004", template: "minion", name: "落魄方士", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        stats: {hp: 70, atk: 10, def: 2, speed: 10}, money: [10, 50],
        drops: [{id: "pills_001", rate: 0.4},
            {id: "booksCultivation_r1_01_upper", rate: 0.01},
            {id: "booksCultivation_r1_01_middle", rate: 0.01},
            {id: "booksCultivation_r1_01_lower", rate: 0.01},
            {id: "booksCultivation_r1_02_upper", rate: 0.01},
            {id: "booksCultivation_r1_02_middle", rate: 0.01},
            {id: "booksCultivation_r1_02_lower", rate: 0.01},
            {id: "booksCultivation_r1_03_upper", rate: 0.01},
            {id: "booksCultivation_r1_03_middle", rate: 0.01},
            {id: "booksCultivation_r1_03_lower", rate: 0.01},
            {id: "booksCultivation_r1_04_upper", rate: 0.01},
            {id: "booksCultivation_r1_04_middle", rate: 0.01},
            {id: "booksCultivation_r1_04_lower", rate: 0.01},
            {id: "booksCultivation_r1_05_upper", rate: 0.01},
            {id: "booksCultivation_r1_05_middle", rate: 0.01},
            {id: "booksCultivation_r1_05_lower", rate: 0.01},

        ],
        desc : "整日炼丹求仙，精神恍惚，会扔出失败的丹药炸人。"
    },

    // 2. 泰山与响马
    {
        id   : "re01_005", template: "minion", name: "泰山响马", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        stats: {hp: 120, atk: 20, def: 10, speed: 10}, money: [20, 60],
        drops: [{id: "weapons_029", rate: 0.2}, {id: "head_002", rate: 0.2}], // 掉板斧
        desc : "盘踞在泰山险要之处的强盗，大碗喝酒大口吃肉。"
    },
    {
        id   : "re01_006", template: "elite", name: "武馆教头", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        stats: {hp: 220, atk: 35, def: 15, speed: 10}, money: [50, 150],
        drops: [{id: "weapons_050", rate: 0.1},
            {id: "booksBody_r1_09_upper", rate: 0.01},
            {id: "booksBody_r1_09_middle", rate: 0.01},
            {id: "booksBody_r1_09_lower", rate: 0.01},
        ], // 掉三节棍、武学书
        desc : "【精英】齐地尚武，临淄城中武馆林立，教头功夫深不可测。"
    },
    {
        id   : "re01_007", template: "boss", name: "大盗跖(伪)", region: "r_e_0_1", spawnType: "mountain", timeStart: 1,
        stats: {hp: 600, atk: 60, def: 20, speed: 20}, money: [200, 600],
        drops: [{id: "weapons_054", rate: 0.1}, {id: "weapons_062", rate: 0.01}], // 掉飞爪、极低掉血滴子
        desc : "【头目】自称盗圣柳下跖传人的巨寇，轻功卓绝，来去无踪。"
    },

    // 3. 边境与东夷
    {
        id   : "re01_008", template: "minion", name: "东夷射手", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        stats: {hp: 80, atk: 30, def: 3, speed: 12}, money: [5, 20],
        drops: [{id: "weapons_048", rate: 0.15},

            {id: "booksBody_r1_07_upper", rate: 0.01},
            {id: "booksBody_r1_07_middle", rate: 0.01},
            {id: "booksBody_r1_07_lower", rate: 0.01},

           ],
        desc : "生活在东部山林的古老部族，箭术精准。"
    },
    {
        id   : "re01_009", template: "elite", name: "蓬莱引路人", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        stats: {hp: 150, atk: 20, def: 10, speed: 15}, money: [50, 200],
        drops: [{id: "materials_019", rate: 0.3}, {id: "pills_041", rate: 0.2}], // 掉龟甲、大力丸
        desc : "【精英】专门诱骗富人出海寻仙的骗子头目，熟悉海路。"
    },
    {
        id   : "re01_010", template: "minion", name: "海边巨蟹", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        stats: {hp: 60, atk: 20, def: 20, speed: 4}, money: [0, 0],
        drops: [{id: "foodMaterial_005", rate: 0.6}, {id: "materials_017", rate: 0.2}],
        desc : "海边沙滩上的大螃蟹，横行霸道。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "re01_lord_01", template: "lord", name: "东海蛟龙", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        stats: {hp: 600, atk: 70, def: 40, speed: 15}, money: [0, 0],
        drops: [{id: "materials_025", rate: 0.5}, {id: "weapons_075", rate: 0.05}],
        desc : "【领主】深海中的恶蛟，传说是龙的远亲，能呼风唤雨。"
    },
    {
        id   : "re01_lord_02", template: "lord", name: "孔门弃徒(狂)", region: "r_e_0_1", spawnType: "city", timeStart: 1,
        stats: {hp: 400, atk: 60, def: 30, speed: 12}, money: [500, 1000],
        drops: [{id: "weapons_050", rate: 0.05}, {id: "booksCultivation_r2_05_upper", rate: 0.1}],
        desc : "【领主】修习儒家六艺走火入魔的狂人，力大无穷，以力服人。"
    },
    {
        id   : "re01_lord_03", template: "lord", name: "泰山石敢当(灵)", region: "r_e_0_1", spawnType: "mountain", timeStart: 2,
        stats: {hp: 1000, atk: 40, def: 100, speed: 2}, money: [0, 0],
        drops: [{id: "materials_023", rate: 0.5}, {id: "materials_012", rate: 0.5}],
        desc : "【领主】泰山灵石化成的精怪，坚不可摧，镇压一切邪祟。"
    }
];

// --- Part E: 荆楚大地 (r_c_1_2) [10条] ---
// 范围：郢都、寿春、云梦泽、长江
const enemies_r_c_1_2 = [
    // 1. 云梦大泽
    {
        id   : "rc12_001", template: "minion", name: "云梦水匪", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        stats: {hp: 70, atk: 14, def: 2, speed: 9}, money: [10, 30],
        drops: [{id: "weapons_012", rate: 0.3},

            {id: "booksBody_r1_03_upper", rate: 0.01},
            {id: "booksBody_r1_03_middle", rate: 0.01},
            {id: "booksBody_r1_03_lower", rate: 0.01},

            {id: "foods_048", rate: 0.2}], // 掉断桨、莲藕汤
        desc : "潜伏在芦苇荡里，靠打劫过往商船为生。"
    },
    {
        id   : "rc12_002", template: "minion", name: "扬子鳄", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        stats: {hp: 180, atk: 30, def: 20, speed: 5}, money: [0, 0],
        drops: [{id: "materials_013", rate: 0.4}, {id: "materials_014", rate: 0.4}, {id: "foodMaterial_056", rate: 0.8}], // 掉鳄鱼皮
        desc : "云梦泽中的霸主，被称为猪婆龙，咬合力惊人。"
    },
    {
        id   : "rc12_003", template: "elite", name: "沼泽巨蟒", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        stats: {hp: 250, atk: 35, def: 10, speed: 10}, money: [0, 0],
        drops: [{id: "materials_005", rate: 0.5}, {id: "materials_010", rate: 0.5}],
        desc : "【精英】能吞下一头牛的巨蟒，在泥沼中行动如飞。"
    },

    // 2. 楚国遗民与巫蛊
    {
        id   : "rc12_004", template: "minion", name: "楚地巫祝", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 60, atk: 25, def: 0, speed: 8, toxicity : 10}, money: [10, 40],
        drops: [{id: "pills_097", rate: 0.3}, {id: "materials_006", rate: 0.3}],
        desc : "戴着狰狞面具，擅长使用毒虫和诅咒。"
    },
    {
        id   : "rc12_005", template: "elite", name: "负隅顽抗的楚军", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 160, atk: 32, def: 15, speed: 7}, money: [20, 60],
        drops: [{id: "weapons_038", rate: 0.15}], // 掉青铜剑、楚地菜
        desc : "【精英】楚虽三户，亡秦必楚。不愿投降的楚军残部。"
    },
    {
        id   : "rc12_006", template: "minion", name: "湘西赶尸人", region: "r_c_1_2", spawnType: "road", timeStart: 0,
        stats: {hp: 80, atk: 10, def: 5, speed: 5}, money: [30, 80],
        drops: [{id: "weapons_002", rate: 0.3}, {id: "pills_001", rate: 0.2}],
        desc : "摇着铃铛，赶着尸体回乡安葬的神秘人，生人勿进。"
    },

    // 3. 传说与自然
    {
        id   : "rc12_007", template: "boss", name: "九头鸟(幼体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 450, atk: 50, def: 10, speed: 20}, money: [0, 0],
        drops: [{id: "materials_009", rate: 0.8}, {id: "pills_053", rate: 0.2}],
        desc : "【头目】楚地传说中的不祥之鸟，鬼车，叫声能摄人魂魄。"
    },
    {
        id   : "rc12_008", template: "minion", name: "剧毒蟾蜍", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        stats: {hp: 40, atk: 15, def: 10, speed: 4, toxicity : 30}, money: [0, 0],
        drops: [{id: "pills_053", rate: 0.4}], // 掉毒药原料
        desc : "浑身长满脓包，碰到就会中毒。"
    },
    {
        id   : "rc12_009", template: "elite", name: "项氏家臣", region: "r_c_1_2", spawnType: "city", timeStart: 1, // 起义后
        stats: {hp: 200, atk: 40, def: 15, speed: 10}, money: [60, 150],
        drops: [{id: "weapons_044", rate: 0.15},

            {id: "booksBody_r1_09_upper", rate: 0.15},
            {id: "booksBody_r1_09_middle", rate: 0.15},
            {id: "booksBody_r1_09_lower", rate: 0.15},
        ],
        desc : "【精英】项羽家族的家臣，个个武艺高强，忠心耿耿。"
    },
    {
        id   : "rc12_010", template: "minion", name: "神农架野人", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 140, atk: 30, def: 5, speed: 12}, money: [0, 0],
        drops: [{id: "materials_024", rate: 0.05}, {id: "foodMaterial_002", rate: 0.5}], // 极低掉熊猫皮(毛皮)
        desc : "深山中直立行走的红毛野兽，力大无穷。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rc12_lord_01", template: "lord", name: "云梦龙君", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        stats: {hp: 550, atk: 65, def: 30, speed: 14}, money: [0, 0],
        drops: [{id: "materials_025", rate: 0.3}, {id: "materials_026", rate: 0.3}],
        desc : "【领主】云梦泽中修行的千年白蛇，已化为半龙之躯。"
    },
    {
        id   : "rc12_lord_02", template: "lord", name: "巫神代言人", region: "r_c_1_2", spawnType: "mountain", timeStart: 1,
        stats: {hp: 300, atk: 85, def: 10, speed: 10}, money: [400, 800],
        drops: [{id: "pills_097", rate: 0.5}, {id: "booksCultivation_r3_21_upper", rate: 0.1}],
        desc : "【领主】楚地大巫，能沟通鬼神，施展恐怖的即死诅咒。"
    },
    {
        id   : "rc12_lord_03", template: "lord", name: "九头神鸟(完全体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 2,
        stats: {hp: 500, atk: 80, def: 20, speed: 25}, money: [0, 0],
        drops: [{id: "materials_015", rate: 0.5}, {id: "materials_020", rate: 0.5}],
        desc : "【领主】展开羽翼遮天蔽日的上古凶兽，九个头颅能喷吐九种灾厄。"
    }
];

// --- Part F: 巴蜀之地 (r_c_0_2) [10条] ---
// 范围：成都、汉中、剑阁、江州
const enemies_r_c_0_2 = [
    // 1. 天府之国与险途
    {
        id   : "rc02_001", template: "minion", name: "剑阁剪径贼", region: "r_c_0_2", spawnType: "road", timeStart: 0,
        stats: {hp: 90, atk: 18, def: 5, speed: 6}, money: [10, 40],
        drops: [{id: "weapons_029", rate: 0.2}], // 掉板斧、烧酒
        desc : "盘踞在蜀道险要之处，利用地势打劫过往商旅。"
    },
    {
        id   : "rc02_002", template: "minion", name: "井盐矿工(暴躁)", region: "r_c_0_2", spawnType: "village", timeStart: 0,
        stats: {hp: 100, atk: 15, def: 8, speed: 5}, money: [20, 60],
        drops: [{id: "weapons_020", rate: 0.3}, {id: "foodMaterial_008", rate: 0.8}], // 掉矿镐、盐
        desc : "在自贡一带开采井盐的工匠，因繁重劳役而变得极具攻击性。"
    },
    {
        id   : "rc02_003", template: "elite", name: "食铁兽(熊猫)", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 350, atk: 40, def: 20, speed: 4}, money: [0, 0],
        drops: [{id: "materials_024", rate: 0.2}, {id: "foodMaterial_002", rate: 0.5}], // 掉毛皮、竹笋
        desc : "【精英】外表憨态可掬，实则乃上古凶兽蚩尤坐骑，能轻易咬碎铁锅。"
    },

    // 2. 蛮荒与毒物
    {
        id   : "rc02_004", template: "minion", name: "竹林花斑蛇", region: "r_c_0_2", spawnType: "grass", timeStart: 0,
        stats: {hp: 40, atk: 25, def: 1, speed: 12, toxicity : 40}, money: [0, 0],
        drops: [{id: "materials_010", rate: 0.3}, {id: "pills_097", rate: 0.1}], // 掉蛇胆
        desc : "隐藏在翠绿竹林中的毒蛇，保护色极好，令人防不胜防。"
    },
    {
        id   : "rc02_005", template: "elite", name: "南蛮藤甲兵", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 180, atk: 20, def: 45, speed: 6}, money: [5, 20],
        drops: [{id: "weapons_035", rate: 0.1}, {id: "head_012", rate: 0.1},


            {id: "booksBody_r1_11_upper", rate: 0.15},
            {id: "booksBody_r1_11_middle", rate: 0.15},
            {id: "booksBody_r1_11_lower", rate: 0.15},

        ],
        desc : "【精英】身穿桐油浸泡过的藤甲，刀枪不入，唯一的弱点是火。"
    },
    {
        id   : "rc02_006", template: "minion", name: "巴山夜猿", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 60, atk: 12, def: 2, speed: 15}, money: [0, 0],
        drops: [{id: "materials_002", rate: 0.3}, {id: "foods_021", rate: 0.4}], // 掉牙、桃子
        desc : "巴东三峡巫峡长，猿鸣三声泪沾裳。成群结队骚扰路人。"
    },

    // 3. 古蜀传说
    {
        id   : "rc02_007", template: "minion", name: "古蜀遗民", region: "r_c_0_2", spawnType: "city", timeStart: 0,
        stats: {hp: 80, atk: 15, def: 5, speed: 8}, money: [10, 50],
        drops: [{id: "weapons_023", rate: 0.2}, {id: "materials_019", rate: 0.1}], // 掉青铜剑
        desc : "崇拜金沙太阳神鸟的古蜀国后裔，行踪神秘。"
    },
    {
        id   : "rc02_008", template: "boss", name: "六牙白象", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 800, atk: 70, def: 30, speed: 5}, money: [0, 0],
        drops: [{id: "materials_022", rate: 0.5}, {id: "materials_021", rate: 1}], // 掉象牙(用猛虎獠牙代替/或新增)、骨
        desc : "【头目】峨眉山中的灵兽，据说曾是普贤菩萨的坐骑（化身）。"
    },
    {
        id   : "rc02_009", template: "elite", name: "青城剑客", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 160, atk: 35, def: 10, speed: 14}, money: [50, 150],
        drops: [{id: "weapons_035", rate: 0.2},
            {id: "booksCultivation_r1_19_upper", rate: 0.03},
            {id: "booksCultivation_r1_19_middle", rate: 0.03},
            {id: "booksCultivation_r1_19_lower", rate: 0.03},

        ], // 掉柳叶刀、剑谱
        desc : "【精英】隐居青城山的剑术高手，剑法轻灵飘逸。"
    },
    {
        id   : "rc02_010", template: "minion", name: "入蜀流民", region: "r_c_0_2", spawnType: "road", timeStart: 1,
        stats: {hp: 50, atk: 5, def: 0, speed: 4}, money: [0, 5],
        drops: [{id: "weapons_001", rate: 0.2}],
        desc : "为了躲避中原战乱，翻越秦岭逃入巴蜀的难民。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rc02_lord_01", template: "lord", name: "蚕丛王尸", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        stats: {hp: 500, atk: 50, def: 40, speed: 6}, money: [500, 1500],
        drops: [{id: "materials_019", rate: 0.3}, {id: "materials_021", rate: 0.3}],
        desc : "【领主】古蜀国第一代王，纵目面具下是一双看透阴阳的眼睛。"
    },
    {
        id   : "rc02_lord_02", template: "lord", name: "食铁兽之王", region: "r_c_0_2", spawnType: "mountain", timeStart: 1,
        stats: {hp: 800, atk: 70, def: 50, speed: 8}, money: [0, 0],
        drops: [{id: "materials_024", rate: 1.0}, {id: "weapons_018", rate: 0.05}],
        desc : "【领主】体型如象的巨型熊猫，一巴掌能拍碎城墙。"
    },
    {
        id   : "rc02_lord_03", template: "lord", name: "唐门老祖(伪)", region: "r_c_0_2", spawnType: "city", timeStart: 2,
        stats: {hp: 350, atk: 100, def: 10, speed: 20}, money: [1000, 2000],
        drops: [{id: "weapons_062", rate: 0.1}, {id: "pills_053", rate: 0.5}],
        desc : "【领主】巴蜀暗器名家的开创者，全身藏有千种暗器，令人防不胜防。"
    }
];

// --- Part G: 辽东与东胡 (r_ne) [10条] ---
// 范围：襄平、扶余、长白山、黑水
const enemies_r_ne = [
    // 1. 白山黑水猛兽
    {
        id   : "rne_001", template: "elite", name: "东北虎", region: "r_ne", spawnType: "mountain", timeStart: 0,
        stats: {hp: 300, atk: 50, def: 12, speed: 10}, money: [0, 0],
        drops: [{id: "materials_020", rate: 0.4}, {id: "materials_021", rate: 0.4}, {id: "materials_022", rate: 0.4}],
        desc : "【精英】体型巨大的吊睛白额虎，雪原上的绝对王者。"
    },
    {
        id   : "rne_002", template: "elite", name: "黑瞎子(熊)", region: "r_ne", spawnType: "mountain", timeStart: 0,
        stats: {hp: 350, atk: 45, def: 20, speed: 6}, money: [0, 0],
        drops: [{id: "materials_011", rate: 0.5}, {id: "materials_012", rate: 0.4}, {id: "materials_023", rate: 0.1}],
        desc : "【精英】皮糙肉厚，嗅觉灵敏，发起狂来能撞断大树。"
    },
    {
        id   : "rne_003", template: "minion", name: "雪原狼群", region: "r_ne", spawnType: "grass", timeStart: 0,
        stats: {hp: 70, atk: 18, def: 3, speed: 12}, money: [0, 0],
        drops: [{id: "materials_007", rate: 0.6}, {id: "materials_008", rate: 0.5}],
        desc : "毛色雪白，耐力极强，擅长围猎。"
    },

    // 2. 特产与各方势力
    {
        id   : "rne_004", template: "minion", name: "采参客", region: "r_ne", spawnType: "mountain", timeStart: 0,
        stats: {hp: 80, atk: 12, def: 4, speed: 7}, money: [20, 100],
        drops: [{id: "herbs_030", rate: 0.3}, {id: "weapons_010", rate: 0.3}], // 掉人参、锄头
        desc : "在深山老林中寻找人参的冒险者，背包里可能藏着宝贝。"
    },
    {
        id   : "rne_005", template: "elite", name: "关外响马", region: "r_ne", spawnType: "road", timeStart: 0,
        stats: {hp: 130, atk: 25, def: 6, speed: 14}, money: [30, 90],
        drops: [{id: "weapons_025", rate: 0.2}, {id: "mounts_003", rate: 0.05},

            {id: "booksBody_r1_06_upper", rate: 0.15},
            {id: "booksBody_r1_06_middle", rate: 0.15},
            {id: "booksBody_r1_06_lower", rate: 0.15},

        ],
        desc : "【精英】骑术精湛的强盗，来去如风，手段残忍。"
    },
    {
        id   : "rne_006", template: "minion", name: "苦寒流放犯", region: "r_ne", spawnType: "road", timeStart: 0,
        stats: {hp: 60, atk: 8, def: 2, speed: 4}, money: [0, 5],
        drops: [{id: "weapons_008", rate: 0.3}],
        desc : "被发配到辽东苦寒之地的罪犯，为了生存不择手段。"
    },

    // 3. 异族部落
    {
        id   : "rne_007", template: "minion", name: "肃慎猎手", region: "r_ne", spawnType: "mountain", timeStart: 0,
        stats: {hp: 90, atk: 22, def: 5, speed: 9}, money: [5, 20],
        drops: [{id: "weapons_048", rate: 0.1}, {id: "materials_003", rate: 0.3}], // 掉弓、野猪皮
        desc : "使用楛矢石砮的古老部族猎人，擅长在林海雪原中追踪。"
    },
    {
        id   : "rne_008", template: "minion", name: "扶余战士", region: "r_ne", spawnType: "grass", timeStart: 0,
        stats: {hp: 110, atk: 20, def: 10, speed: 8}, money: [10, 40],
        drops: [{id: "weapons_037", rate: 0.1}],
        desc : "来自松嫩平原的农耕与游牧混合部族，性格豪爽。"
    },
    {
        id   : "rne_009", template: "elite", name: "鲜卑突骑", region: "r_ne", spawnType: "grass", timeStart: 0,
        stats: {hp: 180, atk: 30, def: 12, speed: 16}, money: [30, 100],
        drops: [{id: "weapons_049", rate: 0.1}, {id: "mounts_004", rate: 0.05}], // 掉斩马刀、良马
        desc : "【精英】鲜卑山的精锐骑兵，装备比普通匈奴更好。"
    },
    {
        id   : "rne_010", template: "boss", name: "长白山雪怪", region: "r_ne", spawnType: "mountain", timeStart: 0,
        stats: {hp: 600, atk: 65, def: 25, speed: 8}, money: [0, 0],
        drops: [{id: "materials_023", rate: 0.5}, {id: "herbs_030", rate: 0.5}], // 掉金胆、大人参
        desc : "【头目】传说中守护圣山的白色巨兽，浑身长满白毛。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rne_lord_01", template: "lord", name: "长白山龙脉守护", region: "r_ne", spawnType: "mountain", timeStart: 0,
        stats: {hp: 600, atk: 60, def: 40, speed: 10}, money: [0, 0],
        drops: [{id: "herbs_030", rate: 1.0}, {id: "materials_023", rate: 0.5}],
        desc : "【领主】由万年冰雪凝聚而成的元素生物，守护着龙脉禁地。"
    },
    {
        id   : "rne_lord_02", template: "lord", name: "东胡战神", region: "r_ne", spawnType: "grass", timeStart: 1,
        stats: {hp: 500, atk: 75, def: 25, speed: 16}, money: [500, 1500],
        drops: [{id: "weapons_049", rate: 0.1}, {id: "mounts_004", rate: 0.1}],
        desc : "【领主】东胡部落传说中的勇士，手持千斤重的狼牙棒。"
    },
    {
        id   : "rne_lord_03", template: "lord", name: "北冥巨鲲(幼)", region: "r_ne", spawnType: "ocean", timeStart: 2,
        stats: {hp: 1200, atk: 80, def: 60, speed: 5}, money: [0, 0],
        drops: [{id: "materials_025", rate: 0.5}, {id: "materials_026", rate: 0.5}],
        desc : "【领主】北冥有鱼，其名为鲲。虽然是幼体，但已有吞天之志。"
    }
];

// --- Part H: 漠北草原 (r_n) [6条] ---
// 范围：龙城、狼居胥、瀚海
const enemies_r_n = [
    {
        id   : "rn_001", template: "minion", name: "匈奴射雕手", region: "r_n", spawnType: "grass", timeStart: 0,
        stats: {hp: 110, atk: 28, def: 5, speed: 14}, money: [10, 50],
        drops: [{id: "weapons_048", rate: 0.2}, {id: "materials_015", rate: 0.3}], // 掉复合弓、鹰羽
        desc : "从小在马背上长大的神射手，箭无虚发。"
    },
    {
        id   : "rn_002", template: "minion", name: "草原巨狼", region: "r_n", spawnType: "grass", timeStart: 0,
        stats: {hp: 80, atk: 18, def: 3, speed: 12}, money: [0, 0],
        drops: [{id: "materials_008", rate: 0.5}, {id: "materials_007", rate: 0.5}],
        desc : "比中原狼体型更大，性格更凶残。"
    },
    {
        id   : "rn_003", template: "elite", name: "匈奴百夫长", region: "r_n", spawnType: "grass", timeStart: 0,
        stats: {hp: 220, atk: 35, def: 15, speed: 12}, money: [50, 150],
        drops: [{id: "weapons_049", rate: 0.1}, {id: "mounts_004", rate: 0.05}], // 掉斩马刀、良马
        desc : "【精英】统领百骑的勇士，身经百战。"
    },
    {
        id   : "rn_004", template: "elite", name: "萨满巫师", region: "r_n", spawnType: "mountain", timeStart: 0,
        stats: {hp: 140, atk: 15, def: 5, speed: 8}, money: [20, 80],
        drops: [{id: "pills_041", rate: 0.3}, {id: "materials_002", rate: 0.4}],
        desc : "【精英】沟通长生天的祭司，能用诡异的舞蹈诅咒敌人。"
    },
    {
        id   : "rn_005", template: "boss", name: "白狼王(灵兽)", region: "r_n", spawnType: "mountain", timeStart: 0,
        stats: {hp: 500, atk: 55, def: 20, speed: 18}, money: [0, 0],
        drops: [{id: "materials_020", rate: 0.5}, {id: "weapons_053", rate: 0.05}], // 掉极品皮毛、极低掉蛇矛
        desc : "【头目】草原上传说的白色狼神，速度快如闪电。"
    },
    {
        id   : "rn_006", template: "minion", name: "北海牧羊人", region: "r_n", spawnType: "river", timeStart: 0,
        stats: {hp: 60, atk: 10, def: 2, speed: 6}, money: [5, 20],
        drops: [{id: "weapons_002", rate: 0.3}, {id: "foodMaterial_053", rate: 0.5}],
        desc : "在极北苦寒之地放牧的流亡者，性格孤僻。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rn_lord_01", template: "lord", name: "冒顿单于", region: "r_n", spawnType: "grass", timeStart: 0,
        stats: {hp: 550, atk: 70, def: 30, speed: 18}, money: [1000, 3000],
        drops: [{id: "weapons_048", rate: 0.1}, {id: "mounts_005", rate: 0.1}],
        desc : "【领主】统一草原的匈奴霸主，鸣镝所指，万骑冲锋。"
    },
    {
        id   : "rn_lord_02", template: "lord", name: "长生天大祭司", region: "r_n", spawnType: "mountain", timeStart: 1,
        stats: {hp: 400, atk: 80, def: 20, speed: 12}, money: [500, 1000],
        drops: [{id: "pills_041", rate: 0.5}, {id: "booksCultivation_r3_01_upper", rate: 0.1}],
        desc : "【领主】能召唤雷霆与风暴的萨满教主，法力无边。"
    },
    {
        id   : "rn_lord_03", template: "lord", name: "瀚海沙虫王", region: "r_n", spawnType: "desert", timeStart: 2,
        stats: {hp: 800, atk: 65, def: 40, speed: 10}, money: [0, 0],
        drops: [{id: "materials_018", rate: 0.8}],
        desc : "【领主】潜伏在戈壁深处的远古生物，每一次翻身都会引发沙尘暴。"
    }
];

// --- Part I: 西域大漠 (r_w) [7条] ---
// 范围：河西走廊、塔里木、楼兰、天山
const enemies_r_w = [
    {
        id   : "rw_001", template: "minion", name: "沙暴巨蝎", region: "r_w", spawnType: "desert", timeStart: 0,
        stats: {hp: 90, atk: 25, def: 12, speed: 8, toxicity : 40}, money: [0, 0],
        drops: [{id: "materials_018", rate: 0.5}, {id: "materials_017", rate: 0.4}],
        desc : "隐藏在黄沙之下，尾针有剧毒，甲壳坚硬。"
    },
    {
        id   : "rw_002", template: "minion", name: "马匪", region: "r_w", spawnType: "desert", timeStart: 0,
        stats: {hp: 100, atk: 20, def: 5, speed: 14}, money: [30, 80],
        drops: [{id: "weapons_043", rate: 0.15}, {id: "mounts_003", rate: 0.02}], // 掉雁翎刀、葡萄
        desc : "来去如风的沙盗，骑术精湛，手段残忍。"
    },
    {
        id   : "rw_003", template: "elite", name: "楼兰古尸", region: "r_w", spawnType: "desert", timeStart: 0,
        stats: {hp: 200, atk: 30, def: 25, speed: 5}, money: [0, 0],
        drops: [{id: "weapons_023", rate: 0.1}, {id: "materials_012", rate: 0.2}],
        desc : "【精英】被黄沙掩埋千年的干尸，受诅咒而动，不惧刀剑。"
    },
    {
        id   : "rw_004", template: "elite", name: "西域刀客", region: "r_w", spawnType: "city", timeStart: 0,
        stats: {hp: 160, atk: 40, def: 8, speed: 15}, money: [50, 150],
        drops: [{id: "weapons_043", rate: 0.2},
            {id: "booksCultivation_r2_25_upper", rate: 0.03},
            {id: "booksCultivation_r2_25_middle", rate: 0.03},
            {id: "booksCultivation_r2_25_lower", rate: 0.03},

        ], // 掉雁翎刀法
        desc : "【精英】流浪在丝绸之路上的独行侠，刀法极快。"
    },
    {
        id   : "rw_005", template: "boss", name: "沙虫之母", region: "r_w", spawnType: "desert", timeStart: 0,
        stats: {hp: 700, atk: 60, def: 30, speed: 6}, money: [0, 0],
        drops: [{id: "materials_018", rate: 0.5}, {id: "pills_053", rate: 0.5}],
        desc : "【头目】体型如小山的巨大沙虫，张开巨口能吞噬一切。"
    },
    {
        id   : "rw_006", template: "minion", name: "苦行僧", region: "r_w", spawnType: "mountain", timeStart: 0,
        stats: {hp: 120, atk: 15, def: 15, speed: 6}, money: [0, 10],
        drops: [{id: "weapons_051", rate: 0.2},
            {id: "booksCultivation_r3_20_upper", rate: 0.01},
            {id: "booksCultivation_r3_20_middle", rate: 0.01},
            {id: "booksCultivation_r3_20_lower", rate: 0.01},
            {id: "booksCultivation_r3_21_upper", rate: 0.01},
            {id: "booksCultivation_r3_21_middle", rate: 0.01},
            {id: "booksCultivation_r3_21_lower", rate: 0.01},


        ], // 掉戒刀
        desc : "从天竺东来的僧人，虽然慈悲，但也会金刚怒目。"
    },
    {
        id   : "rw_007", template: "elite", name: "大宛卫士", region: "r_w", spawnType: "city", timeStart: 0,
        stats: {hp: 150, atk: 25, def: 20, speed: 10}, money: [40, 100],
        drops: [{id: "weapons_044", rate: 0.1}],
        desc : "【精英】守护汗血宝马的精锐士兵，装备精良。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rw_lord_01", template: "lord", name: "楼兰女王(怨灵)", region: "r_w", spawnType: "city", timeStart: 0,
        stats: {hp: 450, atk: 85, def: 10, speed: 15}, money: [800, 2000],
        drops: [{id: "materials_026", rate: 0.3}, {id: "booksCultivation_r2_25_upper", rate: 0.1}],
        desc : "【领主】国破家亡的楼兰女王，用倾国倾城的容貌掩盖致命的诅咒。"
    },
    {
        id   : "rw_lord_02", template: "lord", name: "天山雪莲妖", region: "r_w", spawnType: "mountain", timeStart: 1,
        stats: {hp: 500, atk: 50, def: 50, speed: 12}, money: [0, 0],
        drops: [{id: "herbs_025", rate: 1.0}, {id: "pills_071", rate: 0.2}],
        desc : "【领主】生长在天山之巅的万年雪莲修炼成精，浑身是宝。"
    },
    {
        id   : "rw_lord_03", template: "lord", name: "火焰山牛魔", region: "r_w", spawnType: "mountain", timeStart: 2,
        stats: {hp: 900, atk: 80, def: 60, speed: 8}, money: [0, 0],
        drops: [{id: "weapons_029", rate: 0.1}, {id: "materials_023", rate: 0.3}],
        desc : "【领主】从火焰山中走出的火焰巨牛，所过之处寸草不生。"
    }
];

// --- Part J: 岭南与南海 (r_s / r_se) [7条] ---
// 范围：百越、苍梧、南海、交趾
const enemies_r_s = [
    {
        id   : "rs_001", template: "minion", name: "越人战士", region: "r_s", spawnType: "mountain", timeStart: 0,
        stats: {hp: 90, atk: 18, def: 2, speed: 12}, money: [5, 20],
        drops: [{id: "weapons_023", rate: 0.1}, {id: "materials_005", rate: 0.3}],
        desc : "断发文身，善于在丛林中伏击。"
    },
    {
        id   : "rs_002", template: "minion", name: "五彩瘴气蛛", region: "r_s", spawnType: "grass", timeStart: 0,
        stats: {hp: 50, atk: 30, def: 5, speed: 10, toxicity : 40}, money: [0, 0],
        drops: [{id: "pills_053", rate: 0.3}, {id: "materials_006", rate: 0.3}],
        desc : "生活在瘴气弥漫的丛林中，颜色越鲜艳毒性越强。"
    },
    {
        id   : "rs_003", template: "elite", name: "南越战象", region: "r_s", spawnType: "mountain", timeStart: 0,
        stats: {hp: 400, atk: 45, def: 25, speed: 5}, money: [0, 0],
        drops: [{id: "materials_025", rate: 0.5}, {id: "materials_011", rate: 0.5}], // 掉象牙(用巨猿獠牙代)、厚皮
        desc : "【精英】身披木甲的战象，冲锋起来地动山摇。"
    },
    {
        id   : "rs_004", template: "elite", name: "蛊术师", region: "r_s", spawnType: "village", timeStart: 0,
        stats: {hp: 100, atk: 20, def: 5, speed: 8, toxicity : 20}, money: [30, 80],
        drops: [{id: "pills_097", rate: 0.4}],
        desc : "【精英】操控毒虫作为武器，令人防不胜防。"
    },
    {
        id   : "rs_005", template: "minion", name: "采珠人(溺亡)", region: "r_se", spawnType: "ocean", timeStart: 0,
        stats: {hp: 70, atk: 15, def: 5, speed: 8}, money: [10, 50],
        drops: [{id: "materials_026", rate: 0.2}, {id: "weapons_015", rate: 0.3}], // 掉珍珠
        desc : "为了采集海底珍珠而溺亡的怨魂。"
    },
    {
        id   : "rs_006", template: "minion", name: "南海大鲨", region: "r_se", spawnType: "ocean", timeStart: 0,
        stats: {hp: 200, atk: 40, def: 10, speed: 15}, money: [0, 0],
        drops: [{id: "materials_014", rate: 0.4}], // 掉牙、鱼翅
        desc : "海中嗜血的猎手，闻到血腥味就会疯狂。"
    },
    {
        id   : "rs_007", template: "boss", name: "深海巨妖", region: "r_se", spawnType: "ocean", timeStart: 0,
        stats: {hp: 900, atk: 70, def: 20, speed: 8}, money: [0, 0],
        drops: [{id: "materials_026", rate: 1}, {id: "weapons_075", rate: 0.1}], // 掉珍珠、寒冰手套
        desc : "【头目】多条触手的海怪，能轻易掀翻楼船。"
    },
    // --- 领主级 (Lord) ---
    {
        id   : "rs_lord_01", template: "lord", name: "南越武王(赵佗)", region: "r_s", spawnType: "city", timeStart: 0,
        stats: {hp: 500, atk: 65, def: 35, speed: 14}, money: [1000, 3000],
        drops: [{id: "weapons_038", rate: 0.1}, {id: "booksBody_r1_16_upper", rate: 0.1}],
        desc : "【领主】割据岭南的秦朝将领，虽已年迈，但帝王霸气犹存。"
    },
    {
        id   : "rs_lord_02", template: "lord", name: "万蛊之王", region: "r_s", spawnType: "mountain", timeStart: 1,
        stats: {hp: 350, atk: 90, def: 20, speed: 18, toxicity : 30}, money: [0, 0],
        drops: [{id: "pills_053", rate: 1.0}, {id: "materials_010", rate: 0.5}],
        desc : "【领主】吞噬了无数毒虫后诞生的蛊王，剧毒无比，触之即死。"
    },
    {
        id   : "rs_lord_03", template: "lord", name: "南海龙王(伪)", region: "r_se", spawnType: "ocean", timeStart: 2,
        stats: {hp: 800, atk: 75, def: 40, speed: 10}, money: [0, 0],
        drops: [{id: "materials_026", rate: 0.8}, {id: "weapons_075", rate: 0.1}],
        desc : "【领主】统御南海水族的一头巨型鲸鲵，自封为王。"
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