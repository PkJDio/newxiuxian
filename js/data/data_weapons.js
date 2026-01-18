/*
 * =========================================================================================
 * ⚔️ 武器与法宝系统全域生成规范 (MASTER WEAPON CONFIG V11.0)
 * =========================================================================================
 * 1. 属性价值换算 Price per Point (用于计算 Value, R = 稀有度 1-6)
 * -----------------------------------------------------------------------------------------
 * 1点 物理/法术攻击 (atk)   = 90 * R
 * 1点 物理/法术暴击 (crit)  = 180 * R
 * 1点 锐利/灵透 (sharpness) = 10 * R
 * 1点 速度 (speed)          = 45 * R
 *
 * =========================================================================================
 * 2. 基准数值区间 Base Stats (基于 Rarity)
 * -----------------------------------------------------------------------------------------
 * 攻击总和基准 : [R*10, R*15]
 * 暴击总和基准 : [R*2, R*4]
 * 锐利/灵透基准 : [R*10, R*20]  (远射类固定为 0)
 * 速度偏移基数 : [R*2, R*4]    (用于计算加减速的偏移量跨度)
 *
 * =========================================================================================
 * 3. 属性需求逻辑 (Requirement Calculation) - 【修正：R1/R2无门槛】
 * -----------------------------------------------------------------------------------------
 * 属性总门槛 (Total_Req):
 * - IF R <= 2: Total_Req = 0 (新手武器无属性要求)
 * - IF R >  2: Total_Req = R * 15 (从 R3 开始产生属性门槛)
 *
 * 最终需求分配:
 * - 物理系: jing_req = Total_Req * (jing / 10), qi_req = 0, shen_req = Total_Req * (shen / 10)
 * - 法宝系: jing_req = Total_Req * (jing / 10), qi_req = Total_Req * (qi / 10), shen_req = Total_Req * (shen / 10)
 *
 * =========================================================================================
 * 4. 战斗全局逻辑：武器模组对护甲伤害系数 (辅助战斗计算)
 * -----------------------------------------------------------------------------------------
 * 模组类型 | 板甲 | 重甲 | 轻甲 | 皮甲 | 布甲 | 无甲 | 核心定位
 * -----------------------------------------------------------------------------------------
 * 轻盈 Agile| 0.6  | 0.8  | 1.0  | 1.1  | 1.3  | 1.5  | 物理暴击，低伤高频
 * 均衡 Bal  | 0.8  | 0.9  | 1.0  | 1.1  | 1.2  | 1.3  | 属性平均，稳定输出
 * 长兵 Reach| 0.9  | 1.0  | 1.1  | 1.1  | 1.0  | 1.2  | 物理压制，自带防御
 * 重型 Heavy| 1.3  | 1.2  | 1.1  | 0.9  | 0.7  | 1.1  | 牺牲速度，追求破甲
 * 远射 Range| 0.7  | 0.8  | 1.0  | 1.2  | 1.4  | 1.5  | 远程打击，面板压制
 * 法宝 Relic| 1.1  | 1.0  | 0.9  | 0.8  | 0.6  | 1.2  | 灵力穿透，专克凡铁
 *
 * =========================================================================================
 * 5. 武器子类定制系数与属性需求配比 (Weapon Stats & Req Multipliers)
 * -----------------------------------------------------------------------------------------
 * 模组 | 子类 | 攻击系 | 暴击系 | 速度系 | 锐利/灵透 | 需求配比(精:气:神) | 备注
 * -----------------------------------------------------------------------------------------
 * 轻盈 | 匕   | 0.50   | 2.5    | +2.0   | 1.20      | [ 2 : 0 : 8 ]    | 极致灵活
 * 轻盈 | 手戟 | 0.70   | 1.6    | +1.2   | 1.00      | [ 4 : 0 : 6 ]    |
 * 轻盈 | 吴钩 | 0.75   | 1.4    | +0.8   | 1.10      | [ 5 : 0 : 5 ]    |
 * 轻盈 | 奇门 | 0.60   | 2.0    | +1.5   | 0.80      | [ 3 : 0 : 7 ]    |
 * -----------------------------------------------------------------------------------------
 * 均衡 | 剑   | 1.00   | 1.1    |  0.0   | 1.00      | [ 5 : 0 : 5 ]    | 绝对平衡
 * 均衡 | 刀   | 1.15   | 0.9    | -0.5   | 1.10      | [ 7 : 0 : 3 ]    |
 * 均衡 | 铍   | 1.20   | 0.8    | -0.8   | 1.20      | [ 6 : 0 : 4 ]    |
 * -----------------------------------------------------------------------------------------
 * 长兵 | 矛   | 1.25   | 0.8    | -1.0   | 1.20      | [ 6 : 0 : 4 ]    |
 * 长兵 | 戈   | 1.30   | 0.7    | -1.2   | 0.90      | [ 7 : 0 : 3 ]    |
 * 长兵 | 戟   | 1.40   | 0.6    | -1.5   | 1.10      | [ 6 : 0 : 4 ]    |
 * 长兵 | 长铩 | 1.45   | 0.5    | -1.8   | 1.00      | [ 8 : 0 : 2 ]    |
 * -----------------------------------------------------------------------------------------
 * 重型 | 钺   | 1.60   | 0.4    | -2.2   | 0.80      | [ 9 : 0 : 1 ]    |
 * 重型 | 斧   | 1.65   | 0.3    | -2.5   | 0.90      | [ 8 : 0 : 2 ]    |
 * 重型 | 椎   | 1.85   | 0.0    | -3.5   | 0.40      | [ 10: 0 : 0 ]    | 纯物理碾压
 * 重型 | 殳   | 1.55   | 0.5    | -2.0   | 0.50      | [ 8 : 0 : 2 ]    |
 * -----------------------------------------------------------------------------------------
 * 远射 | 弩   | 1.35   | 1.0    | -2.0   | 0.00      | [ 3 : 0 : 7 ]    |
 * 远射 | 弓   | 1.05   | 1.5    | -0.5   | 0.00      | [ 5 : 0 : 5 ]    |
 * -----------------------------------------------------------------------------------------
 * 法宝 | 飞剑 | 1.00   | 1.2    | +1.2   | 1.30      | [ 1 : 6 : 3 ]    |
 * 法宝 | 法印 | 1.60   | 0.5    | -3.0   | 1.10      | [ 4 : 5 : 1 ]    |
 * 法宝 | 宝葫芦| 0.95   | 1.0    |  0.0   | 1.40      | [ 2 : 7 : 1 ]    |
 * 法宝 | 阵盘 | 1.10   | 1.4    | -1.5   | 1.90      | [ 1 : 4 : 5 ]    |
 * 法宝 | 灵镜 | 1.20   | 1.8    | -0.5   | 0.90      | [ 1 : 3 : 6 ]    |
 * 法宝 | 长幡 | 1.30   | 0.8    | -1.2   | 1.20      | [ 2 : 7 : 1 ]    |
 * 法宝 | 玉佩 | 0.65   | 2.2    | +2.5   | 0.80      | [ 0 : 4 : 6 ]    |
 * =========================================================================================
 */
const weaponTypes = [
    // === 类别 A：17 种物理系武器 (Qi 恒等于 0) ===
    // --- 轻盈 (Agile) ---
    { type: "匕", icon: "🗡️", module: "Agile", jing: 2, qi: 0, shen: 8, desc: "图穷匕见，极度依赖敏捷与破绽捕捉。" }, // 短剑
    { type: "手戟", icon: "⚔️", module: "Agile", jing: 4, qi: 0, shen: 6, desc: "双持短兵，需灵巧格挡与身法。" }, // 交叉双剑
    { type: "吴钩", icon: "🌙", module: "Agile", jing: 5, qi: 0, shen: 5, desc: "曲刃如钩，身法与巧劲并重。" }, // 新月（形似钩，且意境美）
    { type: "奇门", icon: "❄️", module: "Agile", jing: 3, qi: 0, shen: 7, desc: "奇门暗器，神识控器，身随影动。" }, // 雪花（形似暗器/飞镖）

    // --- 均衡 (Balanced) ---
    { type: "剑", icon: "🤺", module: "Balanced", jing: 5, qi: 0, shen: 5, desc: "百兵之君，精与神要求各半。" }, // 击剑者（象征剑术技巧）
    { type: "刀", icon: "🔪", module: "Balanced", jing: 7, qi: 0, shen: 3, desc: "单刃厚背，更看重体质与臂力。" }, // 菜刀（最直观的单刃刀符号）
    { type: "铍", icon: "🎋", module: "Balanced", jing: 6, qi: 0, shen: 4, desc: "长柄短剑，砍劈凶猛，需稳健体魄。" }, // 竹饰（象征长柄结构）

    // --- 长兵 (Reach) ---
    { type: "矛", icon: "🚩", module: "Reach", jing: 6, qi: 0, shen: 4, desc: "直刺突击，攻守平衡，需身手矫健。" }, // 三角旗（古代长矛常挂红缨/旗帜）
    { type: "戈", icon: "⛏️", module: "Reach", jing: 7, qi: 0, shen: 3, desc: "横向勾啄，需极强的臂力与体质。" }, // 镐（形状最接近戈的横向啄击结构）
    { type: "戟", icon: "🔱", module: "Reach", jing: 6, qi: 0, shen: 4, desc: "勾刺结合，需持久体力支撑复杂招式。" }, // 三叉戟（完美对应戟的形状）
    { type: "长铩", icon: "🧹", module: "Reach", jing: 8, qi: 0, shen: 2, desc: "长柄宽刃，横扫千军，体质为重。" }, // 扫帚（象征“横扫千军”的动作范围）

    // --- 重型 (Heavy) ---
    { type: "钺", icon: "🦁", module: "Heavy", jing: 9, qi: 0, shen: 1, desc: "重型战斧，力劈华山，唯蛮力可驭。" }, // 狮子（象征权柄与绝对力量，钺常作为礼器）
    { type: "斧", icon: "⚒️", module: "Heavy", jing: 8, qi: 0, shen: 2, desc: "破甲利器，断金碎玉，需体质刚猛。" }, // 锤与镐（象征工业级的破坏力，比单一斧头更通用）
    { type: "椎", icon: "🔨", module: "Heavy", jing: 10, qi: 0, shen: 0, desc: "极致重器，唯有天生神力(精)者方可挥动。" }, // 锤子（最直观的钝器）
    { type: "殳", icon: "🏏", module: "Heavy", jing: 8, qi: 0, shen: 2, desc: "长柄钝击，需强健骨骼体魄支撑。" }, // 球板（象征长柄钝击武器）

    // --- 远射 (Ranged) ---
    { type: "弩", icon: "🔫", module: "Ranged", jing: 3, qi: 0, shen: 7, desc: "强弩机巧，需敏锐观察力与稳定神识。" }, // 手枪（象征机械发射结构）
    { type: "弓", icon: "🏹", module: "Ranged", jing: 5, qi: 0, shen: 5, desc: "挽弓当挽强，既需臂力也需精准。" }, // 弓箭

    // === 类别 B：7 种法力系法宝 (Jing/Qi/Shen 三者分配) ===
    // --- 法宝 (Relic) ---
    { type: "飞剑", icon: "🌠", module: "Relic", jing: 1, qi: 6, shen: 3, desc: "御剑乘风，以气驭剑，神识导向。" }, // 流星（象征飞行的速度与轨迹）
    { type: "法印", icon: "🔲", module: "Relic", jing: 4, qi: 5, shen: 1, desc: "镇压之宝，需浑厚灵气与强健体魄。" }, // 方块按钮（象征方正的印章）
    { type: "宝葫芦", icon: "🍶", module: "Relic", jing: 2, qi: 7, shen: 1, desc: "纳藏天地，核心在于海量的灵力储量。" }, // 酒壶（最接近葫芦的通用图标）
    { type: "阵盘", icon: "☯️", module: "Relic", jing: 1, qi: 4, shen: 5, desc: "演化阵法，极度看重悟性(神)与灵力。" }, // 阴阳鱼（象征阵法与道）
    { type: "灵镜", icon: "💿", module: "Relic", jing: 1, qi: 3, shen: 6, desc: "神光直射，需精准的神识锁定目标。" }, // 光盘（象征镜面的反光与科技感）
    { type: "长幡", icon: "🏴", module: "Relic", jing: 2, qi: 7, shen: 1, desc: "招魂引气，乃是纯粹的灵力(气)操控之器。" }, // 黑旗（象征招魂幡）
    { type: "玉佩", icon: "💮", module: "Relic", jing: 0, qi: 4, shen: 6, desc: "随身灵宝，需极高的悟性与灵力共鸣。" } // 白花（象征精致雕琢的玉器纹路）
];
/*
* R1 级别数据生成逻辑：
* - 编号: weapons_001 - weapons_009
* - 子类: 匕 (轻盈模组 | 系数: Atk 0.5, Crit 2.5, Spd +2.0, Sharp 1.2)
* - 分布: [低/中/高数值] x [物(1:0)/混(3:1)/平(1:1)]
*/

const weapons_r1_batch1 = [
    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_001",
        name: "缺口削皮刀",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 0, crit: 5, speed: 4, sharpness: 12 },
        value: 1650,
        desc: "锈迹斑斑的厨房弃物，刀刃上有好几个崩口，只能欺负一下野兔。"
    },
    {
        id: "weapons_002",
        name: "受潮的竹签",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 1, crit: 5, speed: 4, sharpness: 12 },
        value: 1650,
        desc: "原本是串肉用的，沾染了些许烟火气，刺入肉体时带有微弱的热力。"
    },
    {
        id: "weapons_003",
        name: "断裂的木箸",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 2, mag_atk: 3, crit: 5, speed: 4, sharpness: 12 },
        value: 1650,
        desc: "折断的旧筷子，断口处参差不齐，却意外地对灵力有着不错的传导性。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_004",
        name: "生锈的剔骨钩",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 0, crit: 8, speed: 6, sharpness: 18 },
        value: 2430,
        desc: "屠宰场丢弃的弯钩，虽然没了光泽，但那股陈年血腥味让人胆寒。"
    },
    {
        id: "weapons_005",
        name: "浸血的碎瓷片",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 1, crit: 8, speed: 6, sharpness: 18 },
        value: 2430,
        desc: "从富人家打碎的灵瓷瓶里捡出的碎片，边缘极利，带有微弱的灵力残余。"
    },
    {
        id: "weapons_006",
        name: "发霉的修鞋锥",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 3, mag_atk: 3, crit: 8, speed: 6, sharpness: 18 },
        value: 2430,
        desc: "鞋匠多年未用的老锥子，由于长期在各种皮料中穿刺，自带一种刺穿意志。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_007",
        name: "旧货摊的锈匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 0, crit: 10, speed: 8, sharpness: 24 },
        value: 3120,
        desc: "虽然名字很一般，但在 R1 武器中，它的钢材厚度已经算是个中翘楚了。"
    },
    {
        id: "weapons_008",
        name: "老旧的刻刀",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 2, crit: 10, speed: 8, sharpness: 24 },
        value: 3120,
        desc: "用来修剪法阵纹路的废弃刻刀，即便是旧物，其锋利度依然不可小觑。"
    },
    {
        id: "weapons_009",
        name: "烧焦的祭祀短刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 4, crit: 10, speed: 8, sharpness: 24 },
        value: 3120,
        desc: "在祭坛火余烬中翻出来的残刃，虽然失去了华丽的装饰，但灵魂尚存。"
    }
];
const weapons_r1_batch2 = [
    // === 手戟 (Agile 模组 | 系数: Atk 0.7, Crit 1.6, Spd +1.2, Sharp 1.0) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_010",
        name: "断齿旧草叉",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 0, crit: 3, speed: 2, sharpness: 10 },
        value: 1360,
        desc: "断掉一截的农用草叉，虽然重心不稳，但钩人的力道还在。"
    },
    {
        id: "weapons_011",
        name: "包铜烂木叉",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 2, crit: 3, speed: 2, sharpness: 10 },
        value: 1360,
        desc: "在朽烂的木叉柄上包了层劣质铜片，使其能勉强承载一丝微弱法力。"
    },
    {
        id: "weapons_012",
        name: "浸油枯枝叉",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 3, crit: 3, speed: 2, sharpness: 10 },
        value: 1360,
        desc: "浸透了不明油脂的坚韧枯木枝，极其轻便，对灵气的排斥很小。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_013",
        name: "弃置的小铁戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 0, crit: 5, speed: 4, sharpness: 15 },
        value: 1950,
        desc: "在乱石堆中翻出来的残次品，虽然满是缺口，但质地尚在。"
    },
    {
        id: "weapons_014",
        name: "血渍短戈残片",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 2, crit: 5, speed: 4, sharpness: 15 },
        value: 1950,
        desc: "残留着暗红血渍的戈头碎片，仿佛还回荡着战场上的杀伐之气。"
    },
    {
        id: "weapons_015",
        name: "断弦琴木戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 4, crit: 5, speed: 4, sharpness: 15 },
        value: 1950,
        desc: "由名贵但已腐朽的琴颈削制，依然保留着极佳的灵力共鸣。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_016",
        name: "老旧磨损双刺",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 0, crit: 6, speed: 5, sharpness: 20 },
        value: 2495,
        desc: "虽然刃口被磨得几乎消失，但沉稳的钢材显示出它曾经的不凡。"
    },
    {
        id: "weapons_017",
        name: "雷劈焦黑木戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 3, crit: 6, speed: 5, sharpness: 20 },
        value: 2495,
        desc: "被天雷劈中后的残存木核，坚硬如铁且自带微弱的焦灼法力。"
    },
    {
        id: "weapons_018",
        name: "古旧石刻手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 6, crit: 6, speed: 5, sharpness: 20 },
        value: 2495,
        desc: "出土自古墓的石制祭祀器具，内部充盈着岁月的荒凉法力。"
    }
];
const weapons_r1_batch3 = [
    // === 吴钩 (Agile 模组 | 系数: Atk 0.75, Crit 1.4, Spd +0.8, Sharp 1.1) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_019",
        name: "生锈割麦镰",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 0, crit: 3, speed: 2, sharpness: 11 },
        value: 1460,
        desc: "丢弃在田边的老旧镰刀，刀尖有些弯曲，但勾人的弧度依然危险。"
    },
    {
        id: "weapons_020",
        name: "歪斜铁锅铲",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 2, crit: 3, speed: 2, sharpness: 11 },
        value: 1460,
        desc: "被烧变形的铁锅铲，残留着些许灶火的烟火气，似乎能引动一丝微热。"
    },
    {
        id: "weapons_021",
        name: "老旧竹钩条",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 4, crit: 3, speed: 2, sharpness: 11 },
        value: 1460,
        desc: "原本是撑起窗户的竹钩，由于长期接触书香雅气，意外地适合灵力运转。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_022",
        name: "豁口吴钩残片",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 0, crit: 4, speed: 2, sharpness: 17 },
        value: 1790,
        desc: "在旧货摊底部翻出的残兵，虽然中段有豁口，但刃部的钢质极佳。"
    },
    {
        id: "weapons_023",
        name: "血丝朽木钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 2, crit: 4, speed: 2, sharpness: 17 },
        value: 1790,
        desc: "浸透了陈年血迹的坚韧木钩，干涸的血渍中残留着不甘的微弱意念。"
    },
    {
        id: "weapons_024",
        name: "旧式祭坛引钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, crit: 4, speed: 2, sharpness: 17 },
        value: 1880,
        desc: "曾用于牵引祭祀火盆的长钩，金属表面布满了灵力侵蚀的暗纹。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_025",
        name: "遗迹生锈短吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 0, crit: 6, speed: 3, sharpness: 22 },
        value: 2425,
        desc: "从古代营帐废墟中挖掘出的兵器，锈壳之下依然包裹着致命的锋芒。"
    },
    {
        id: "weapons_026",
        name: "幽蓝铁索钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 3, crit: 6, speed: 3, sharpness: 22 },
        value: 2425,
        desc: "一截断裂的铁索末端带着弯钩，长期浸泡在阴冷泉水中，自带一股寒气。"
    },
    {
        id: "weapons_027",
        name: "枯萎灵蔓钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, crit: 6, speed: 3, sharpness: 22 },
        value: 2515,
        desc: "由于灵力枯竭而石质化的古蔓，保留了天然的弯钩形状，灵透力惊人。"
    }
];
const weapons_r1_batch4 = [
    // === 奇门 (Agile 模组 | 系数: Atk 0.6, Crit 2.0, Spd +1.5, Sharp 0.8) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_028",
        name: "带刺破渔网",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 0, crit: 4, speed: 3, sharpness: 8 },
        value: 1475,
        desc: "挂着碎贝壳和生锈铁钩的烂渔网，虽然破烂，但甩在脸上绝不好受。"
    },
    {
        id: "weapons_029",
        name: "浸毒麻绳圈",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 1, crit: 4, speed: 3, sharpness: 8 },
        value: 1475,
        desc: "泡过劣质毒药的粗麻绳，不仅能勒人，还会让伤口感到阵阵麻痒。"
    },
    {
        id: "weapons_030",
        name: "旧陶埙残片",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 3, mag_atk: 3, crit: 4, speed: 3, sharpness: 8 },
        value: 1475,
        desc: "破损的乐器碎片，灌注灵力后能发出刺耳的哨音，扰乱敌人的心神。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_031",
        name: "生锈的铁算盘",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 0, crit: 6, speed: 5, sharpness: 12 },
        value: 2055,
        desc: "当铺账房丢弃的铁算盘，珠子哗啦作响，格挡与敲击意外地顺手。"
    },
    {
        id: "weapons_032",
        name: "绘魔旧纸扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 2, crit: 6, speed: 5, sharpness: 12 },
        value: 2055,
        desc: "扇面已破损的折扇，骨架里藏有锋利的铁片，并附带微弱的法术加持。"
    },
    {
        id: "weapons_033",
        name: "铜钱红丝索",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 4, crit: 6, speed: 5, sharpness: 12 },
        value: 2145,
        desc: "系着几枚劣质铜钱的红绳，挥舞间能产生微弱的辟邪之力。 "
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_034",
        name: "老旧机巧手套",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 0, crit: 8, speed: 6, sharpness: 16 },
        value: 2680,
        desc: "机关已经半废的护手，指尖处依然露着锋利的倒钩，抓挠力惊人。"
    },
    {
        id: "weapons_035",
        name: "邪道魂钟残骸",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 2, crit: 8, speed: 6, sharpness: 16 },
        value: 2680,
        desc: "破裂的小铜钟，轻轻一摇便会散发出令人不安的阴冷气息。"
    },
    {
        id: "weapons_036",
        name: "古旧星盘残件",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, crit: 8, speed: 6, sharpness: 16 },
        value: 2770,
        desc: "原本是观测星象的圆盘，虽然已经无法运作，但内部积攒的星辰灵力依然充盈。"
    }
];
const weapons_r1_batch5 = [
    // === 剑 (Balanced 模组 | 系数: Atk 1.0, Crit 1.1, Spd 0.0, Sharp 1.0) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_037",
        name: "卷刃的练习铁剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 0, crit: 2, speed: 0, sharpness: 10 },
        value: 1360,
        desc: "武馆里淘汰下来的铁片，剑刃已经快被磨平了，更像是一根铁条。"
    },
    {
        id: "weapons_038",
        name: "包铁的木柄剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 2, crit: 2, speed: 0, sharpness: 10 },
        value: 1360,
        desc: "木剑前端钉了几块生锈的铁皮，看起来不伦不类，但附带一丝凡尘烟火气。"
    },
    {
        id: "weapons_039",
        name: "腐烂的仪式木剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, crit: 2, speed: 0, sharpness: 10 },
        value: 1360,
        desc: "路边土地庙丢弃的桃木剑，虽然已经腐朽，但内里仍存有一丁点辟邪之力。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_040",
        name: "生锈的制式青铜剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 0, crit: 3, speed: 0, sharpness: 15 },
        value: 1770,
        desc: "在古战场边缘挖出来的青铜片，虽然布满了绿斑，但分量还算扎实。"
    },
    {
        id: "weapons_041",
        name: "染血的侍卫断剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 3, crit: 3, speed: 0, sharpness: 15 },
        value: 1770,
        desc: "折断的侍卫配剑，干涸的血迹渗透进了钢材的裂缝中，隐隐透着煞气。"
    },
    {
        id: "weapons_042",
        name: "老旧的刻纹木剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, crit: 3, speed: 0, sharpness: 15 },
        value: 1770,
        desc: "刻有模糊符文的练习木剑，纹路里积攒了不少年头的陈旧灵气。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_043",
        name: "废弃的卫队阔剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 0, crit: 4, speed: 0, sharpness: 20 },
        value: 2270,
        desc: "城防卫队丢弃的报废装备，虽然有很多缺口，但依然具备极强的斩击力。"
    },
    {
        id: "weapons_044",
        name: "幽蓝的生铁剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 4, crit: 4, speed: 0, sharpness: 20 },
        value: 2270,
        desc: "锻造失败的废剑，由于在冷水中淬火时间过长，剑身呈现出一种不祥的寒芒。"
    },
    {
        id: "weapons_045",
        name: "残破的灵纹法剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 7, crit: 4, speed: 0, sharpness: 20 },
        value: 2270,
        desc: "破落道观中供奉的铁剑，剑格已裂，但剑身积聚的灵力尚未散尽。"
    }
];
const weapons_r1_batch6 = [
    // === 刀 (Balanced 模组 | 系数: Atk 1.15, Crit 0.9, Spd -0.5, Sharp 1.1) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_046",
        name: "生锈的劈柴刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 0, crit: 2, speed: -1, sharpness: 11 },
        value: 1505,
        desc: "农家劈柴用的旧刀，刀背极厚，刃口虽然生锈，但势头很猛。"
    },
    {
        id: "weapons_047",
        name: "焦黑的火灶刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 3, crit: 2, speed: -1, sharpness: 11 },
        value: 1505,
        desc: "在灶火里烧红过的烂铁刀，刀身焦黑，挥舞时隐约散发出一股焦热气。"
    },
    {
        id: "weapons_048",
        name: "断裂的桑木刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, crit: 2, speed: -1, sharpness: 11 },
        value: 1505,
        desc: "练武用的粗糙桑木刀，虽然断了一截，但木质致密，对内气的承载力极佳。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_049",
        name: "豁口的剥皮大刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 0, crit: 3, speed: -2, sharpness: 17 },
        value: 1880,
        desc: "屠夫丢弃的大型剥皮刀，刀刃上满是崩口，但那股积攒的凶戾气机还在。"
    },
    {
        id: "weapons_050",
        name: "浸血的劫掠者残刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 3, crit: 3, speed: -2, sharpness: 17 },
        value: 1880,
        desc: "土匪遗留的断刀，钢材低劣却浸透了陈年血迹，带有一丝令人心悸的煞气。"
    },
    {
        id: "weapons_051",
        name: "旧货摊的灵纹砍刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, crit: 3, speed: -2, sharpness: 17 },
        value: 1880,
        desc: "表面布满划痕的厚背砍刀，依稀可见当初铭刻在刀身上的聚灵残纹。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_052",
        name: "废弃的步卒重刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 0, crit: 4, speed: -2, sharpness: 22 },
        value: 2380,
        desc: "正规军步卒报废的佩刀，刀身沉重，虽然失去光泽，但挥砍威力极大。"
    },
    {
        id: "weapons_053",
        name: "幽蓝的生铁厚刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 4, crit: 4, speed: -2, sharpness: 22 },
        value: 2380,
        desc: "锻造不精的厚铁片，由于加入了过多杂质，刀身在夜色下透着一股幽蓝。"
    },
    {
        id: "weapons_054",
        name: "残破的僧门戒刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 8, crit: 4, speed: -2, sharpness: 22 },
        value: 2380,
        desc: "破落佛龛前供奉的宽刃刀，刀柄已烂，但刀身蕴含的微弱法力尚未散尽。"
    }
];
const weapons_r1_batch7 = [
    // === 铍 (Balanced 模组 | 系数: Atk 1.20, Crit 0.8, Spd -0.8, Sharp 1.2) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_055",
        name: "木柄钝铁凿",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 0, crit: 2, speed: -2, sharpness: 12 },
        value: 1470,
        desc: "木匠淘汰的长柄铁凿，凿头已钝，但分量十足，能勉强用来捅刺。"
    },
    {
        id: "weapons_056",
        name: "焦木长矛残",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 3, crit: 2, speed: -2, sharpness: 12 },
        value: 1470,
        desc: "在山林火场中找到的半截焦黑长矛，木质虽然碳化，但保留了一丝炙热灵气。"
    },
    {
        id: "weapons_057",
        name: "破损的竹管尖枪",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, crit: 2, speed: -2, sharpness: 12 },
        value: 1470,
        desc: "渔民废弃的竹管尖枪，矛头虽然已裂，但竹管内部对灵力的传导性不错。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_058",
        name: "锈蚀的民兵短矛",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 0, crit: 2, speed: -3, sharpness: 18 },
        value: 1665,
        desc: "民兵营地角落的废品，矛头锈蚀，但依然能感受到一股粗犷的杀伐之意。"
    },
    {
        id: "weapons_059",
        name: "符咒绑铁叉",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 3, crit: 2, speed: -3, sharpness: 18 },
        value: 1665,
        desc: "将一张破损的符咒绑在普通铁叉上，符咒的残余法力能增强其穿透力。"
    },
    {
        id: "weapons_060",
        name: "废弃的祭矛木柄",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, crit: 2, speed: -3, sharpness: 18 },
        value: 1665,
        desc: "古老祭祀矛的木柄，虽然矛头已失，但木质中蕴含的灵性使其适合法力附着。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_061",
        name: "残破的拓荒者长刀",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 18, mag_atk: 0, crit: 3, speed: -4, sharpness: 24 },
        value: 2220,
        desc: "拓荒者遗失的宽刃长刀，刀柄粗长，刀身厚重，虽然伤痕累累，但力道依然凶猛。"
    },
    {
        id: "weapons_062",
        name: "灰烬木杆尖刃",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 4, crit: 3, speed: -4, sharpness: 24 },
        value: 2220,
        desc: "浸泡在火山灰中的坚韧木杆，前端尖锐，其内部蕴含着微弱的火系灵力。"
    },
    {
        id: "weapons_063",
        name: "枯骨之刺",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 9, crit: 3, speed: -4, sharpness: 24 },
        value: 2220,
        desc: "某无名野兽的巨大尖骨，虽然外表粗糙，却能高效地传导亡灵法术。"
    }
];
const weapons_r1_batch8 = [
    // === 矛 (Reach 模组 | 系数: Atk 1.25, Crit 0.8, Spd -1.0, Sharp 1.2) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_064",
        name: "削尖的硬木棍",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 0, crit: 2, speed: -2, sharpness: 12 },
        value: 1560,
        desc: "随手捡来的硬木，一头被削得尖锐，虽然简单但刺击范围极大。"
    },
    {
        id: "weapons_065",
        name: "带刺的旧晾衣杆",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 3, crit: 2, speed: -2, sharpness: 12 },
        value: 1560,
        desc: "带有铁钩的竹质长杆，因为常年晾晒被灵气浸润的道袍，附带了一丝灵力。"
    },
    {
        id: "weapons_066",
        name: "枯萎的藤心枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, crit: 2, speed: -2, sharpness: 12 },
        value: 1470,
        desc: "自然枯萎的坚硬藤蔓，内部呈中空状，法力流转其中几乎没有阻碍。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_067",
        name: "绑着生锈长钉的木矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 0, crit: 2, speed: -3, sharpness: 18 },
        value: 1755,
        desc: "在粗木前端用麻绳缠死了一枚巨大的铁钉，极其阴损的临时武器。"
    },
    {
        id: "weapons_068",
        name: "废弃的卫队旗杆",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 4, crit: 2, speed: -3, sharpness: 18 },
        value: 1755,
        desc: "折断的营旗杆，前端的铜头虽然变绿，但依然保留着军阵的一丝锐气。"
    },
    {
        id: "weapons_069",
        name: "雷击后的焦木尖",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 7, crit: 2, speed: -3, sharpness: 18 },
        value: 1755,
        desc: "被天雷击碎的树干残片，被削成矛状，焦黑的表面下潜藏着暴躁的能量。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_070",
        name: "遗失的民兵铁尖矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 19, mag_atk: 0, crit: 3, speed: -4, sharpness: 24 },
        value: 2310,
        desc: "R1级别的杀器，标准的铁质矛头虽然生锈，但其穿透力依然令人心惊。"
    },
    {
        id: "weapons_071",
        name: "符布缠绕的长枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 5, crit: 3, speed: -4, sharpness: 24 },
        value: 2310,
        desc: "枪杆上缠满了褪色的咒符布条，每一次穿刺都能带起细微的灵力波动。"
    },
    {
        id: "weapons_072",
        name: "古旧祭祀长刺",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 9, crit: 3, speed: -4, sharpness: 24 },
        value: 2310,
        desc: "从荒废祭坛下挖出的长柄尖刺，材质似石非石，能将精神力转化为锋芒。"
    }
];
const weapons_r1_batch9 = [
    // === 戈 (Reach 模组 | 系数: Atk 1.30, Crit 0.7, Spd -1.2, Sharp 0.9) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_073",
        name: "缺齿老木耙",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 0, crit: 1, speed: -2, sharpness: 9 },
        value: 1350,
        desc: "缺了几个齿的木质草耙，虽然已经半朽，但横向勾拽的力道依然能让人摔个跟头。"
    },
    {
        id: "weapons_074",
        name: "铁丝缠绕的横木",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 3, crit: 1, speed: -2, sharpness: 9 },
        value: 1350,
        desc: "在长棍顶端横绑了一截带刺铁丝，外层涂抹了些许灵粉，挥舞间带起微弱的电火花。"
    },
    {
        id: "weapons_075",
        name: "断裂的引魂幡杆",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 6, crit: 1, speed: -2, sharpness: 9 },
        value: 1350,
        desc: "折断的法事幡杆，顶端的横木依然挂着残碎的符纸，对灵体有着奇特的勾取效果。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_076",
        name: "生锈的民用短戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, crit: 2, speed: -4, sharpness: 14 },
        value: 1760,
        desc: "乡间自造的防御兵器，戈头用的是劣质生铁，虽然锈迹厚重，但由于分量沉，威力尚可。"
    },
    {
        id: "weapons_077",
        name: "浸血的战车残戟",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, crit: 2, speed: -4, sharpness: 14 },
        value: 1760,
        desc: "从废弃战车上拆下的横戈碎片，其上沾染的陈年血渍已干涸成黑色，自带一股肃杀之气。"
    },
    {
        id: "weapons_078",
        name: "雷劈木横钩",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, crit: 2, speed: -4, sharpness: 14 },
        value: 1760,
        desc: "被雷击中的老柳木，天然裂成了戈形，内部碳化的木质中封存了暴躁的自然灵力。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_079",
        name: "古旧的制式青铜戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 20, mag_atk: 0, crit: 3, speed: -5, sharpness: 18 },
        value: 2295,
        desc: "古战场出土的制式兵器，虽然青铜戈头已泛出绿锈，但其锋利的勾啄结构依然是致命的。"
    },
    {
        id: "weapons_080",
        name: "咒纹铁矿戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 5, crit: 3, speed: -5, sharpness: 18 },
        value: 2295,
        desc: "用含有微量灵矿的粗铁打制的戈，戈身上刻有模糊的破甲符文，能轻易撕裂厚重的皮甲。"
    },
    {
        id: "weapons_081",
        name: "枯骨勾魂索",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 10, crit: 3, speed: -5, sharpness: 18 },
        value: 2295,
        desc: "由巨大兽类肋骨磨制的横向钩刺，骨质洁白阴寒，对神魂的伤害更甚于肉体。"
    }
];
const weapons_r1_batch10 = [
    // === 戟 (Reach 模组 | 系数: Atk 1.40, Crit 0.6, Spd -1.5, Sharp 1.1) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_082",
        name: "绑刀的旧木叉",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 0, crit: 1, speed: -3, sharpness: 11 },
        value: 1415,
        desc: "在简陋的木叉一侧绑了一块断掉的柴刀片，勉强具备了戟的雏形。"
    },
    {
        id: "weapons_083",
        name: "浸魔铜片长杆",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 3, crit: 1, speed: -3, sharpness: 11 },
        value: 1415,
        desc: "木杆顶端钉着两块变形的铜片，因长期放置在灵石废矿边，带有细微的法力波动。"
    },
    {
        id: "weapons_084",
        name: "朽烂的仪仗戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, crit: 1, speed: -3, sharpness: 11 },
        value: 1415,
        desc: "衙门废弃的仪仗兵器，木杆已生虫蛀，但戟头残留的朱砂和灵漆仍有微弱法效。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_085",
        name: "松动的生锈大戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 0, crit: 2, speed: -5, sharpness: 17 },
        value: 1835,
        desc: "沉重的生铁大戟，戟头与杆子的连接处咔哒作响，虽然摇摇欲坠但杀伤力十足。"
    },
    {
        id: "weapons_086",
        name: "染血的偏将残戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 4, crit: 2, speed: -5, sharpness: 17 },
        value: 1835,
        desc: "战场上捡到的断戟，金属表面浸透了干涸的血渍，那股不甘的杀意能转化为破法之力。"
    },
    {
        id: "weapons_087",
        name: "雷痕焦木戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 8, crit: 2, speed: -5, sharpness: 17 },
        value: 1835,
        desc: "被天雷劈裂的铁桦木，形状天然似戟，内部残留的雷击能量对灵力极为敏感。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_088",
        name: "古旧的制式铁戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 21, mag_atk: 0, crit: 2, speed: -6, sharpness: 22 },
        value: 2200,
        desc: "曾经正规军配备的利器，虽然锈迹包裹了锋芒，但其结构和分量依然远胜凡品。"
    },
    {
        id: "weapons_089",
        name: "符缠重钢戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 5, crit: 2, speed: -6, sharpness: 22 },
        value: 2200,
        desc: "戟杆上层层叠叠缠绕着褪色的符布，重钢打造的戟头在法力催动下能带起阵阵恶风。"
    },
    {
        id: "weapons_090",
        name: "遗迹噬灵戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 10, crit: 2, speed: -6, sharpness: 22 },
        value: 2200,
        desc: "从古修遗迹中挖出的半损毁兵器，其材质能吞噬周围的游离灵气，化为沉重的打击感。"
    }
];
const weapons_r1_batch11 = [
    // === 长铩 (Reach 模组 | 系数: Atk 1.45, Crit 0.5, Spd -1.8, Sharp 1.0) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_091",
        name: "绑铁片的长木桩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 0, crit: 1, speed: -4, sharpness: 10 },
        value: 1450,
        desc: "在粗糙的长木桩顶端绑了一块生锈的扁铁，挥舞起来呼呼作响，全靠重量压人。"
    },
    {
        id: "weapons_092",
        name: "包铜碎石铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 4, crit: 1, speed: -4, sharpness: 10 },
        value: 1450,
        desc: "木杆顶端镶嵌了带尖角的碎灵石，并用废铜片固定，每次横扫都能带出一丝紊乱气流。"
    },
    {
        id: "weapons_093",
        name: "枯萎的旗杆长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 7, crit: 1, speed: -4, sharpness: 10 },
        value: 1450,
        desc: "不知从哪棵古树上砍下的长直枝条，末端削成了宽刃状，木质干燥且灵导性极强。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_094",
        name: "生锈的城门横闩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 0, crit: 2, speed: -5, sharpness: 15 },
        value: 1815,
        desc: "废弃城门上的铁皮横闩，虽然没有刃口，但沉重的打击感足以媲美真正的长铩。"
    },
    {
        id: "weapons_095",
        name: "浸血的战车横木",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 4, crit: 2, speed: -5, sharpness: 15 },
        value: 1815,
        desc: "战车碎裂后的长轴，末端带有断裂的青铜刃，由于常年经受杀伐洗礼，自带一股煞气。"
    },
    {
        id: "weapons_096",
        name: "雷劈铁桦长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 8, crit: 2, speed: -5, sharpness: 15 },
        value: 1815,
        desc: "被天雷劈中的铁桦木，一端裂成了扁平的刃状，碳化的表面覆盖着暗淡的雷纹。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_097",
        name: "弃置的卫队重铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 22, mag_atk: 0, crit: 2, speed: -7, sharpness: 20 },
        value: 2225,
        desc: "正规军步卒报废的长柄宽刃，铩头虽然布满锈点，但钢芯未损，横扫千军之势不减。"
    },
    {
        id: "weapons_098",
        name: "咒布缠绕的重杆",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 5, crit: 2, speed: -7, sharpness: 20 },
        value: 2225,
        desc: "重型长木杆上缠满了褪色的咒符布带，每一次重击都能激发出潜藏在木质中的沉重灵压。"
    },
    {
        id: "weapons_099",
        name: "遗迹噬魂铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 11, crit: 2, speed: -7, sharpness: 20 },
        value: 2225,
        desc: "从地底深处挖掘出的半损毁长兵，由不知名的灰暗金属铸造，能将被击中者的意志强行拖慢。"
    }
];
const weapons_r1_batch12 = [
    // === 钺 (Heavy 模组 | 系数: Atk 1.60, Crit 0.4, Spd -2.2, Sharp 0.8) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_100",
        name: "绑木桩的烂铁犁",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, crit: 1, speed: -4, sharpness: 8 },
        value: 1520,
        desc: "将报废的铁犁头强行绑在粗木桩上，虽然完全不平衡，但砸下去的力量极大。"
    },
    {
        id: "weapons_101",
        name: "浸魔碎铁钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, crit: 1, speed: -4, sharpness: 8 },
        value: 1520,
        desc: "在沉重的生铁块中嵌入了几枚废弃灵石，挥动时能带起一阵紊乱的重力波动。"
    },
    {
        id: "weapons_102",
        name: "朽烂的行刑重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, crit: 1, speed: -4, sharpness: 8 },
        value: 1520,
        desc: "在阴冷地牢中弃置多年的大钺，虽然木柄已朽，但其承载的阴冷之气对灵力反应剧烈。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_103",
        name: "生锈的拓荒重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 19, mag_atk: 0, crit: 1, speed: -7, sharpness: 12 },
        value: 1695,
        desc: "开拓山林时使用的巨型斧钺，刃部布满了厚厚的铁锈，每一次劈砍都像是山石崩落。"
    },
    {
        id: "weapons_104",
        name: "染血的偏将残钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 5, crit: 1, speed: -7, sharpness: 12 },
        value: 1695,
        desc: "战场上遗留的重型兵器残件，干涸的血迹掩盖了原本的铭文，自带一股压抑的煞气。"
    },
    {
        id: "weapons_105",
        name: "雷劈焦铁重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 9, crit: 1, speed: -7, sharpness: 12 },
        value: 1695,
        desc: "被天雷击中的生铁块，由于瞬间的高温和电击，内部结构发生了奇妙的灵力化转变。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_106",
        name: "古旧的制式重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 24, mag_atk: 0, crit: 2, speed: -9, sharpness: 16 },
        value: 2275,
        desc: "R1级别的巅峰重武，虽然只是古代卫队丢弃的旧物，但其纯粹的物理破坏力依然惊人。"
    },
    {
        id: "weapons_107",
        name: "符缠黑铁巨钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 18, mag_atk: 6, crit: 2, speed: -9, sharpness: 16 },
        value: 2275,
        desc: "厚重的黑铁面上缠绕着发黑的咒符，每一斧劈下都仿佛带着千钧之力的灵压。"
    },
    {
        id: "weapons_108",
        name: "遗迹噬灵钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 12, crit: 2, speed: -9, sharpness: 16 },
        value: 2275,
        desc: "从地脉深处挖出的巨大金属块，虽无利刃，但能通过灵力渗透直接粉碎敌人的经络。"
    }
];
const weapons_r1_batch13 = [
    // === 斧 (Heavy 模组 | 系数: Atk 1.65, Crit 0.3, Spd -2.5, Sharp 0.9) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_109",
        name: "卷刃的破柴斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 0, crit: 1, speed: -5, sharpness: 9 },
        value: 1575,
        desc: "刃部已经完全翻卷的农家旧斧，比起劈砍，更像是靠重量在砸东西。"
    },
    {
        id: "weapons_110",
        name: "焦木柄短斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 4, crit: 1, speed: -5, sharpness: 9 },
        value: 1575,
        desc: "木柄曾被雷火烧过，不仅焦黑坚硬，还残留着一丝微弱的爆裂气息。"
    },
    {
        id: "weapons_111",
        name: "朽铁石斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 8, crit: 1, speed: -5, sharpness: 9 },
        value: 1575,
        desc: "将半块生锈的铁片绑在磨损的石斧上，虽然简陋，却对灵力有着奇妙的感应。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_112",
        name: "缺口的开山斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 20, mag_atk: 0, crit: 1, speed: -8, sharpness: 14 },
        value: 1760,
        desc: "在矿区捡到的废弃大斧，斧面布满缺口，沉重异常，一击便能裂石。"
    },
    {
        id: "weapons_113",
        name: "浸血的砍肉斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 5, crit: 1, speed: -8, sharpness: 14 },
        value: 1760,
        desc: "屠夫丢弃的巨刃，刃口残留着干涸的凶兽血迹，带有一种令人心悸的煞气。"
    },
    {
        id: "weapons_114",
        name: "旧货摊的灵纹斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 10, crit: 1, speed: -8, sharpness: 14 },
        value: 1760,
        desc: "表面涂抹了劣质灵漆的短斧，虽然纹路模糊，但依然能引导微弱的元气。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_115",
        name: "废弃的步卒战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 25, mag_atk: 0, crit: 1, speed: -10, sharpness: 18 },
        value: 2160,
        desc: "正规军步兵训练用的旧斧，斧头厚实，全靠一身蛮力即可破开寻常皮甲。"
    },
    {
        id: "weapons_116",
        name: "幽蓝的生铁斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 19, mag_atk: 6, crit: 1, speed: -10, sharpness: 18 },
        value: 2160,
        desc: "锻造不精的废斧，斧身带有诡异的蓝色纹路，挥击时隐约有寒风伴随。"
    },
    {
        id: "weapons_117",
        name: "古旧祭坛斧残件",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 12, crit: 1, speed: -10, sharpness: 18 },
        value: 2160,
        desc: "从荒废祭坛里捡出的石铁混铸斧，其厚重的质地似乎封存了某种古老的威慑。"
    }
];
const weapons_r1_batch14 = [
    // === 椎 (Heavy 模组 | 系数: Atk 1.85, Crit 0.0, Spd -3.5, Sharp 0.4) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_118",
        name: "绑绳的压菜石",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 19, mag_atk: 0, crit: 0, speed: -7, sharpness: 4 },
        value: 1435,
        desc: "在粗糙的青石块上绑了圈烂草绳，只要能举起来砸中，骨头准得裂。"
    },
    {
        id: "weapons_119",
        name: "浸油的实心木夯",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 5, crit: 0, speed: -7, sharpness: 4 },
        value: 1435,
        desc: "浸透了不明油脂的重型木桩，不仅沉重，还附带一丝粘稠的沉闷法力。"
    },
    {
        id: "weapons_120",
        name: "破裂的捣药杵",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 9, crit: 0, speed: -7, sharpness: 4 },
        value: 1435,
        desc: "石质的捣药杵，因长期研磨灵草，杵头已变色并带有微弱的药香灵气。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_121",
        name: "生锈的实心铁砣",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 22, mag_atk: 0, crit: 0, speed: -11, sharpness: 6 },
        value: 1545,
        desc: "巨大的老式秤砣，由于内部是实心铁，砸击力远超其不起眼的外观。"
    },
    {
        id: "weapons_122",
        name: "染血的城防落石",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 5, crit: 0, speed: -11, sharpness: 6 },
        value: 1545,
        desc: "从城墙根捡到的滚木礌石残片，浸透了守军的血迹，带有一股压抑的重力感。"
    },
    {
        id: "weapons_123",
        name: "旧货摊的残印胚",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 11, crit: 0, speed: -11, sharpness: 6 },
        value: 1545,
        desc: "未雕刻完成的法印胚料，虽然还未成型，但这种奇矿石天生就排斥轻灵之物。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_124",
        name: "废弃的铁匠铺铁砧",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 28, mag_atk: 0, crit: 0, speed: -14, sharpness: 8 },
        value: 1970,
        desc: "R1重击之冠。这本是用来锻铁的底座，哪怕只是垂直落下，也能压扁铁铠。"
    },
    {
        id: "weapons_125",
        name: "雷劈焦黑石碾",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 21, mag_atk: 7, crit: 0, speed: -14, sharpness: 8 },
        value: 1970,
        desc: "被雷击中的小型石磨，由于电流的高温，石材表面呈现出暗淡的焦灼纹路。"
    },
    {
        id: "weapons_126",
        name: "遗迹噬气铁胎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 14, crit: 0, speed: -14, sharpness: 8 },
        value: 1970,
        desc: "从地脉废墟中挖出的神秘圆球，密度高得吓人，能像黑洞般吸附周围的游离灵气。"
    }
];
const weapons_r1_batch15 = [
    // === 殳 (Heavy 模组 | 系数: Atk 1.55, Crit 0.5, Spd -2.0, Sharp 0.5) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_127",
        name: "包铁皮的枣木杠",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, crit: 1, speed: -4, sharpness: 5 },
        value: 1490,
        desc: "在坚硬的枣木杠顶端钉了几圈铁皮，虽然做工粗糙，但横扫力量极大。"
    },
    {
        id: "weapons_128",
        name: "浸魔长木杵",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, crit: 1, speed: -4, sharpness: 5 },
        value: 1490,
        desc: "原本是洗衣服用的木棒槌，因为长期在灵泉边拍打，木头里渗入了一些微弱灵力。"
    },
    {
        id: "weapons_129",
        name: "断裂的战鼓槌",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, crit: 1, speed: -4, sharpness: 5 },
        value: 1490,
        desc: "军阵遗落的重型鼓槌，木质中积攒了多年的擂鼓震荡感，对灵力共鸣极其强烈。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_130",
        name: "生锈的长柄铁锤",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 19, mag_atk: 0, crit: 2, speed: -6, sharpness: 8 },
        value: 1880,
        desc: "铁匠铺报废的长柄重锤，锤头锈迹斑斑且有些松动，每一次打击都势沉力大。"
    },
    {
        id: "weapons_131",
        name: "染血的偏将长殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 5, crit: 2, speed: -6, sharpness: 8 },
        value: 1880,
        desc: "古战场捡回来的残破钝器，包铁处残留着干涸的血块，透着一股不屈的煞气。"
    },
    {
        id: "weapons_132",
        name: "雷痕焦木殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 9, crit: 2, speed: -6, sharpness: 8 },
        value: 1880,
        desc: "被雷火烧灼过的硬木长棒，焦黑的裂纹中偶尔闪过细微的雷火灵气。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_133",
        name: "古旧的步卒重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 23, mag_atk: 0, crit: 2, speed: -8, sharpness: 10 },
        value: 2170,
        desc: "曾经正规步卒配备的重型长钝兵，虽已过时且满是划痕，但其钢芯结构依然稳固。"
    },
    {
        id: "weapons_134",
        name: "符缠黑铁长棒",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 6, crit: 2, speed: -8, sharpness: 10 },
        value: 2170,
        desc: "长棒顶端缠绕着由于岁月流逝而发黑的符纸，挥舞间能产生阵阵令人心悸的压迫感。"
    },
    {
        id: "weapons_135",
        name: "遗迹噬元重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 11, crit: 2, speed: -8, sharpness: 10 },
        value: 2170,
        desc: "挖掘自地底祭坛的古老长兵，其材质具有奇特的吸能性，能将对手的灵力防护敲出裂痕。"
    }
];
const weapons_r1_batch16 = [
    // === 弩 (Ranged 模组 | 系数: Atk 1.35, Crit 1.0, Spd -2.0, Sharp 0.0) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_136",
        name: "生锈的打鸟手弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 0, crit: 2, speed: -4, sharpness: 0 },
        value: 1440,
        desc: "顽童丢弃的小弩，青铜机括长满了绿锈，上弦时嘎吱作响，只能勉强射出十步远。"
    },
    {
        id: "weapons_137",
        name: "包铜碎木弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 4, crit: 2, speed: -4, sharpness: 0 },
        value: 1440,
        desc: "用废弃的灵龛木料修补过的弩架，弩臂上缠着带法力的碎铜片，射出的箭矢带有微弱的破空声。"
    },
    {
        id: "weapons_138",
        name: "朽烂的灵木短弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, crit: 2, speed: -4, sharpness: 0 },
        value: 1440,
        desc: "虽然弩架已经腐朽，但这种木材天生对灵力敏感，能将内气转化为箭矢的推动力。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_139",
        name: "拼凑的铁胎弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, crit: 3, speed: -6, sharpness: 0 },
        value: 1710,
        desc: "由几件报废农具的铁片拼凑成的弩臂，虽然张力不匀，但由于弹力巨大，威力相当惊人。"
    },
    {
        id: "weapons_140",
        name: "染血的哨所旧弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, crit: 3, speed: -6, sharpness: 0 },
        value: 1710,
        desc: "废弃边境哨所里的存货，弩机浸透了岁月的潮气，由于常年经受杀伐洗礼，自带一股杀气。"
    },
    {
        id: "weapons_141",
        name: "旧货摊的符文弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, crit: 3, speed: -6, sharpness: 0 },
        value: 1710,
        desc: "弩身上刻满了由于磨损而模糊的符文，虽然聚灵效果大减，但依然比凡弩更精准。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_142",
        name: "弃置的卫队腰弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 20, mag_atk: 0, crit: 4, speed: -8, sharpness: 0 },
        value: 2160,
        desc: "正规卫队淘汰的制式弩，弩机设计精妙，虽然有些准头偏移，但足以射穿厚实的木质盾牌。"
    },
    {
        id: "weapons_143",
        name: "幽蓝的生铁机弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 5, crit: 4, speed: -8, sharpness: 0 },
        value: 2160,
        desc: "锻造质量低劣的铁胎弩，由于淬火不当，弩机呈现出一种不祥的暗蓝色光泽。"
    },
    {
        id: "weapons_144",
        name: "残破的猎妖机弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 10, crit: 4, speed: -8, sharpness: 0 },
        value: 2160,
        desc: "曾属于某个落魄猎妖师，弩弦由妖兽筋绞合而成，即便破损不堪，依然能引动大量灵气。"
    }
];
const weapons_r1_batch17 = [
    // === 弓 (Ranged 模组 | 系数: Atk 1.05, Crit 1.5, Spd -0.5, Sharp 0.0) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Sharp 10, Spd 2) ---
    {
        id: "weapons_145",
        name: "受潮的开裂竹弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 0, crit: 3, speed: -1, sharpness: 0 },
        value: 1485,
        desc: "在柴房受潮腐坏的竹弓，弓身已经有些开裂，拉满时发出的吱呀声让人担心它随时会断。"
    },
    {
        id: "weapons_146",
        name: "麻绳弦的桑木弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 3, crit: 3, speed: -1, sharpness: 0 },
        value: 1485,
        desc: "弦线断裂后被强行接上麻绳的旧弓，虽然弹力大减，但桑木残存的灵性还能引导一丝箭气。"
    },
    {
        id: "weapons_147",
        name: "朽烂的练习木弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, crit: 3, speed: -1, sharpness: 0 },
        value: 1395,
        desc: "武馆淘汰的幼童练习弓，木质虽然朽烂，但由于长期被灵墨浸润，灵力传导极其流畅。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Sharp 15, Spd 3) ---
    {
        id: "weapons_148",
        name: "旧货摊的漆木弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 0, crit: 5, speed: -2, sharpness: 0 },
        value: 1980,
        desc: "漆面已经剥落大半的老旧长弓，曾经应该是某个猎户的家当，弓身依然保留着不错的韧性。"
    },
    {
        id: "weapons_149",
        name: "浸血的蛮兵残弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 3, crit: 5, speed: -2, sharpness: 0 },
        value: 1980,
        desc: "荒野战场上捡到的蛮族角弓，弓背浸透了暗红色的血渍，带有一种原始而狂暴的意念。"
    },
    {
        id: "weapons_150",
        name: "绘有残符的短弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, crit: 5, speed: -2, sharpness: 0 },
        value: 1890,
        desc: "绘满了由于磨损而难以辨认符文的弓箭，灵气在断开的纹路间跳跃，射速意外地快。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_151",
        name: "弃置的卫队战弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, crit: 6, speed: -2, sharpness: 0 },
        value: 2430,
        desc: "正规军步卒报废的制式战弓，用料厚实，虽然弓弦有些松弛，但其物理贯穿力依然惊人。"
    },
    {
        id: "weapons_152",
        name: "幽蓝的雷击木弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, crit: 6, speed: -2, sharpness: 0 },
        value: 2430,
        desc: "由被雷火烧灼过的枣木削制成的短弓，弓身呈现出一种奇异的幽蓝色，隐约有雷鸣余音。"
    },
    {
        id: "weapons_153",
        name: "遗迹噬灵残弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, crit: 6, speed: -2, sharpness: 0 },
        value: 2430,
        desc: "从地脉废墟中挖掘出的古弓残体，弦虽已断，但以气为弦却能射出极具穿透力的灵力矢。"
    }
];
const weapons_r1_batch18 = [
    // === 飞剑 (Relic 模组 | 系数: Atk 1.00, Crit 1.2, Spd +1.2, Sharp/Pen 1.3) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_154",
        name: "缺口的生铁飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 0, mag_crit: 2, speed: 2, penetration: 13 },
        value: 1480,
        desc: "外门弟子淘汰的劣质铁剑，虽然无法承载高深御剑术，但其重量足以用来物理砸人。"
    },
    {
        id: "weapons_155",
        name: "受损的练习木飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 2, mag_crit: 2, speed: 2, penetration: 13 },
        value: 1480,
        desc: "木质剑身上满是比斗留下的凹痕，内里仅余一丝微弱的御气感，在世俗界算是个宝物。"
    },
    {
        id: "weapons_156",
        name: "朽烂的灵竹剑胚",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, mag_crit: 2, speed: 2, penetration: 13 },
        value: 1480,
        desc: "尚未成型的灵竹剑坯，因存放不当而腐朽，但竹质天然的空灵感使其对灵力极为亲和。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_157",
        name: "生锈的门派弃剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 0, mag_crit: 4, speed: 4, penetration: 20 },
        value: 2180,
        desc: "在宗门废墟中翻出的老旧飞剑，剑格已经松动，铁锈之下仍藏着几分往日的锋芒。"
    },
    {
        id: "weapons_158",
        name: "染血的散修残刃",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 3, mag_crit: 4, speed: 4, penetration: 20 },
        value: 2180,
        desc: "某位落魄散修遗留的断刃，干涸的血渍中混杂着一丝不甘的真元，煞气与灵气并存。"
    },
    {
        id: "weapons_159",
        name: "旧货摊的灵漆木剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, mag_crit: 4, speed: 4, penetration: 20 },
        value: 2180,
        desc: "表面涂抹了劣质灵漆的桃木剑，虽然漆面已剥落，但作为法力媒介依然比凡铁强出许多。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_160",
        name: "弃置的护山制式剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 0, mag_crit: 5, speed: 5, penetration: 26 },
        value: 2735,
        desc: "虽是报废的守山剑，但采用的精铁材质极佳，即便灵性散尽，依然是一柄沉重的利器。"
    },
    {
        id: "weapons_161",
        name: "幽蓝的生铁法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 4, mag_crit: 5, speed: 5, penetration: 26 },
        value: 2735,
        desc: "锻造不精的半成品法剑，因淬火时掺入了杂质，剑身在夜里发出的幽幽蓝光有些唬人。"
    },
    {
        id: "weapons_162",
        name: "古旧的祭祀石飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 7, mag_crit: 5, speed: 5, penetration: 26 },
        value: 2735,
        desc: "从地底古庙挖出的石刻短剑，由于经年累月受香火供奉，石材已玉质化，极具灵透力。"
    }
];
const weapons_r1_batch19 = [
    // === 法印 (Relic 模组 | 系数: Atk 1.60, Crit 0.5, Spd -3.0, Pen 1.1) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_163",
        name: "断裂的石狮底座",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, mag_crit: 1, speed: -6, penetration: 11 },
        value: 1460,
        desc: "破败门庭前的石狮底座碎片，虽然毫无灵性，但胜在沉重，砸人极稳。"
    },
    {
        id: "weapons_164",
        name: "浸魔的生铁秤砣",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, mag_crit: 1, speed: -6, penetration: 11 },
        value: 1460,
        desc: "在灵石铺子用了几十年的老秤砣，因为长期接触灵物，铁块里渗入了一丝重力感。"
    },
    {
        id: "weapons_165",
        name: "破裂的木质祭印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, mag_crit: 1, speed: -6, penetration: 11 },
        value: 1460,
        desc: "村口土地庙丢弃的旧木印，木纹已裂，但其承载的多年香火愿力能勉强镇压邪祟。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_166",
        name: "缺角的镇宅石印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 19, mag_atk: 0, mag_crit: 2, speed: -9, penetration: 17 },
        value: 1835,
        desc: "在大户人家废墟捡到的镇宅印，石材坚硬，虽然缺了一角，但那份威严厚重感尤在。"
    },
    {
        id: "weapons_167",
        name: "染血的偏将私印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 5, mag_crit: 2, speed: -9, penetration: 17 },
        value: 1835,
        desc: "战场上遗留的铜印，浸透了将领的鲜血，煞气与官印的刚阳气交织，能震慑心神。"
    },
    {
        id: "weapons_168",
        name: "旧货摊的残缺法印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 9, mag_crit: 2, speed: -9, penetration: 17 },
        value: 1835,
        desc: "表面磨损严重的青玉印，依稀可见当初铭刻在底部的聚灵残阵，法力波动沉稳。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_169",
        name: "废弃的守城铁台印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 24, mag_atk: 0, mag_crit: 2, speed: -12, penetration: 22 },
        value: 2200,
        desc: "古代卫队用来封存公文的重型铁印，沉重如山，全力拍下足以令地基微颤。"
    },
    {
        id: "weapons_170",
        name: "幽蓝的生铁阵石",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 18, mag_atk: 6, mag_crit: 2, speed: -12, penetration: 22 },
        value: 2200,
        desc: "锻造不精的压阵铁块，因吸收了阵法废料，表面呈现出幽蓝色，带有不祥的压制力。"
    },
    {
        id: "weapons_171",
        name: "古旧的祭祀石玺",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 12, mag_crit: 2, speed: -12, penetration: 22 },
        value: 2200,
        desc: "从荒废祭坛下挖出的石质大玺，其厚重的质地似乎封存了某种古老的镇压法则。"
    }
];
const weapons_r1_batch20 = [
    // === 宝葫芦 (Relic 模组 | 系数: Atk 0.95, Crit 1.0, Spd 0.0, Pen 1.4) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_172",
        name: "受潮的干瘪葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 0, mag_crit: 2, speed: 0, penetration: 14 },
        value: 1400,
        desc: "在农家仓库受潮发霉的小葫芦，虽然外壳已经变软，但砸在人身上还是挺响的。"
    },
    {
        id: "weapons_173",
        name: "缠麻绳的药葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 2, mag_crit: 2, speed: 0, penetration: 14 },
        value: 1310,
        desc: "郎中丢弃的旧药葫芦，长年盛放劣质丹药，内里渗入了一些苦涩的药力灵气。"
    },
    {
        id: "weapons_174",
        name: "断颈的酒葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, mag_crit: 2, speed: 0, penetration: 14 },
        value: 1400,
        desc: "酒鬼碎裂的葫芦，仅剩半边，却因为长期受陈年老酒浸润，意外地适合引导灵力。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_175",
        name: "老旧的盛砂葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 0, mag_crit: 3, speed: 0, penetration: 21 },
        value: 1740,
        desc: "石匠用来装磨砂的厚壳葫芦，质地极其坚硬，即使没有灵力加持也是件沉重的钝器。"
    },
    {
        id: "weapons_176",
        name: "浸血的蛮兵葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 3, mag_crit: 3, speed: 0, penetration: 21 },
        value: 1740,
        desc: "从荒野捡到的兽皮葫芦，外层浸透了野兽的干涸血迹，带有一种原始的吞噬感。"
    },
    {
        id: "weapons_177",
        name: "旧货摊的灵漆葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, mag_crit: 3, speed: 0, penetration: 21 },
        value: 1830,
        desc: "表面涂抹了廉价灵漆的艺术品，原本是摆件，但漆面下的聚灵纹路依然在缓缓运作。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_178",
        name: "弃置的护山药钵壶",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 0, mag_crit: 4, speed: 0, penetration: 28 },
        value: 2260,
        desc: "宗门药园弃置的容器，由铁胎木制成，分量扎实，砸向敌人时犹如飞石。"
    },
    {
        id: "weapons_179",
        name: "幽蓝的雷击木葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 4, mag_crit: 4, speed: 0, penetration: 28 },
        value: 2350,
        desc: "雷火洗礼后的焦黑木核化作的葫芦，表面有蓝色的焦痕，吞吐间隐约有火光闪现。"
    },
    {
        id: "weapons_180",
        name: "古旧的祭祀玉葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, mag_crit: 4, speed: 0, penetration: 28 },
        value: 2260,
        desc: "荒废祭坛里捡到的玉石质葫芦，虽然早已失去神采，但其吸纳灵力的效率远超凡俗。"
    }
];
const weapons_r1_batch21 = [
    // === 阵盘 (Relic 模组 | 系数: Atk 1.10, Crit 1.4, Spd -1.5, Pen 1.90) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_181",
        name: "缺角的石磨盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 0, mag_crit: 3, speed: -3, penetration: 19 },
        value: 1585,
        desc: "农家丢弃的小磨盘，虽然没有阵纹，但砸人极重，也能勉强作为防御屏障。"
    },
    {
        id: "weapons_182",
        name: "画有乱符的木盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 3, mag_crit: 3, speed: -3, penetration: 19 },
        value: 1585,
        desc: "木质托盘上用劣质朱砂画着乱七八糟的符号，由于材料低廉，灵力波动极不稳定。"
    },
    {
        id: "weapons_183",
        name: "受潮的旧棋盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 5, mag_crit: 3, speed: -3, penetration: 19 },
        value: 1585,
        desc: "在书院杂物间找到的霉烂棋盘，木纹中残留了些许文人的儒雅气机，极利法术穿透。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_184",
        name: "生锈的铜制星盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 0, mag_crit: 4, speed: -5, penetration: 29 },
        value: 1955,
        desc: "在旧货摊翻出的铜盘，刻度早已模糊，但金属分量扎实，破甲力惊人。"
    },
    {
        id: "weapons_185",
        name: "染血的偏将罗盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 3, mag_crit: 4, speed: -5, penetration: 29 },
        value: 1955,
        desc: "战场遗落的堪舆盘，浸透了鲜血后呈现出诡异的暗红色，带有一种指向杀戮的灵性。"
    },
    {
        id: "weapons_186",
        name: "旧货摊的残缺阵基",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, mag_crit: 4, speed: -5, penetration: 29 },
        value: 2045,
        desc: "曾是某个低阶阵法的中枢底座，虽然表面满是划痕，但其构筑灵力场的能力尚未完全消失。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_187",
        name: "弃置的护山石阵残片",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 17, mag_atk: 0, mag_crit: 6, speed: -6, penetration: 38 },
        value: 2720,
        desc: "宗门倒塌后的围墙石砖，材质为罕见的青钢石，沉重且具有极强的物理抗性。"
    },
    {
        id: "weapons_188",
        name: "幽蓝的生铁阵图",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 4, mag_crit: 6, speed: -6, penetration: 38 },
        value: 2720,
        desc: "锻造不精的铁盘，由于在淬火时吸收了大量的灵矿残渣，表面闪烁着不稳定的幽蓝色光点。"
    },
    {
        id: "weapons_189",
        name: "古旧的祭祀骨纹盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 8, mag_crit: 6, speed: -6, penetration: 38 },
        value: 2720,
        desc: "从荒废祭坛挖出的兽骨圆盘，表面刻满了繁杂的原始咒纹，即便能量流失严重，依然具备恐怖的灵透力。"
    }
];
const weapons_r1_batch22 = [
    // === 灵镜 (Relic 模组 | 系数: Atk 1.20, Crit 1.8, Spd -0.5, Pen 0.90) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_190",
        name: "模糊的旧铜镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 0, mag_crit: 4, speed: -1, penetration: 9 },
        value: 1845,
        desc: "镜面早已磨花的旧铜镜，照不出人影，但边缘厚实，拍人倒也顺手。"
    },
    {
        id: "weapons_191",
        name: "水银涂层铁片",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 3, mag_crit: 4, speed: -1, penetration: 9 },
        value: 1845,
        desc: "在生锈的铁片上强行涂抹了一层劣质水银，反光效果极差，但自带一丝毒性灵力。"
    },
    {
        id: "weapons_192",
        name: "受潮的玄武岩片",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 6, mag_crit: 4, speed: -1, penetration: 9 },
        value: 1845,
        desc: "天然平整的石片，在浸满灵气的溪水中泡了多年，表面泛着水光，利于法力折射。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_193",
        name: "生锈的梳妆铜镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 0, mag_crit: 5, speed: -2, penetration: 14 },
        value: 2210,
        desc: "在深宅废墟翻出的梳妆镜，青铜柄已经变绿，镜身沉重，每一次挥舞都带起破空声。"
    },
    {
        id: "weapons_194",
        name: "染血的护心镜残片",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 11, mag_atk: 3, mag_crit: 5, speed: -2, penetration: 14 },
        value: 2210,
        desc: "战场上被击碎的铁质护心镜，镜面布满血污和划痕，残留着士兵垂死时的强烈意志。"
    },
    {
        id: "weapons_195",
        name: "旧货摊的残灵镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 7, mag_crit: 5, speed: -2, penetration: 14 },
        value: 2210,
        desc: "表面刻有模糊八卦纹路的铜镜，虽然已经无法作为真正的法阵核心，但聚光能力尚在。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_196",
        name: "废弃的步卒圆镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 18, mag_atk: 0, mag_crit: 7, speed: -2, penetration: 18 },
        value: 2970,
        desc: "正规卫队弃用的抛光钢镜，不仅能够闪瞎敌人的眼，其厚实的钢体更是钝击利器。"
    },
    {
        id: "weapons_197",
        name: "幽蓝的生铁法镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 14, mag_atk: 4, mag_crit: 7, speed: -2, penetration: 18 },
        value: 2970,
        desc: "锻造不精的生铁圆盘，由于在淬火时加入了大量寒铁矿渣，镜面呈现出一种冰冷的幽蓝色。"
    },
    {
        id: "weapons_198",
        name: "古旧的祭祀石照",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 9, mag_atk: 9, mag_crit: 7, speed: -2, penetration: 18 },
        value: 2970,
        desc: "从地底荒坟挖出的石质照妖镜，表面虽然坑洼，但只要有一丝光亮，就能激发出致命的暴击力。"
    }
];
const weapons_r1_batch23 = [
    // === 长幡 (Relic 模组 | 系数: Atk 1.30, Crit 0.8, Spd -1.2, Pen 1.20) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_199",
        name: "油腻的酒肆幌子",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 13, mag_atk: 0, mag_crit: 2, speed: -2, penetration: 12 },
        value: 1560,
        desc: "挂在竹竿上的破烂酒家旗子，被油烟熏了多年，竟然变得厚实且有弹性，甩起来很沉。"
    },
    {
        id: "weapons_200",
        name: "缠麻绳的烂布杆",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 3, mag_crit: 2, speed: -2, penetration: 12 },
        value: 1560,
        desc: "在长棍上捆了一截受潮的粗麻布，布料里残留着一丝微弱的土系灵力波动。"
    },
    {
        id: "weapons_201",
        name: "褪色的招魂残幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 6, mag_crit: 2, speed: -2, penetration: 12 },
        value: 1560,
        desc: "路边乱坟岗捡到的招魂幡，幡面虽已破碎不堪，但吸纳阴气的能力尚存，极易引导法术。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_202",
        name: "生锈的执事仪仗旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 16, mag_atk: 0, mag_crit: 2, speed: -4, penetration: 18 },
        value: 1800,
        desc: "官府废弃的礼仪长幡，木杆沉重，顶端的铁尖虽锈，但挥舞起来威慑力十足。"
    },
    {
        id: "weapons_203",
        name: "染血的哨兵营旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 12, mag_atk: 4, mag_crit: 2, speed: -4, penetration: 18 },
        value: 1800,
        desc: "废墟哨所找到的旧旗，旗面浸透了血迹后变得僵硬，带有一种战场特有的血煞灵气。"
    },
    {
        id: "weapons_204",
        name: "旧货摊的残灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 8, mag_crit: 2, speed: -4, penetration: 18 },
        value: 1800,
        desc: "表面绘有模糊云纹的旧幡，布料中嵌入了廉价的碎灵矿丝，对周遭灵力的感应非常敏锐。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_205",
        name: "弃置的护山道幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 20, mag_atk: 0, mag_crit: 3, speed: -5, penetration: 24 },
        value: 2355,
        desc: "宗门倒塌前留下的制式长幡，幡杆由沉重的铁胎木制成，单靠物理力量便能横扫群敌。"
    },
    {
        id: "weapons_206",
        name: "幽蓝的生铁聚灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 15, mag_atk: 5, mag_crit: 3, speed: -5, penetration: 24 },
        value: 2355,
        desc: "锻造不精的生铁幡杆，幡面上绣着诡异的蓝色符文，挥动间能带起阵阵阴冷的灵力寒风。"
    },
    {
        id: "weapons_207",
        name: "古旧的祭祀丝绒幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 10, mag_crit: 3, speed: -5, penetration: 24 },
        value: 2355,
        desc: "荒废祭坛里捡出的丝绒幡，材质经过古法特殊处理，即便历经千年，其灵透力依然冠绝R1。"
    }
];
const weapons_r1_batch24 = [
    // === 玉佩 (Relic 模组 | 系数: Atk 0.65, Crit 2.2, Spd +2.5, Pen 0.80) ===

    // --- [低数值] (基准: Atk 10, Crit 2, Pen 10, Spd 2) ---
    {
        id: "weapons_208",
        name: "开裂的杂玉片",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 0, mag_crit: 4, speed: 5, penetration: 8 },
        value: 1655,
        desc: "质地极其低劣的碎玉，表面布满了蜘蛛网般的裂纹，虽灵性全无，但极为轻巧。"
    },
    {
        id: "weapons_209",
        name: "泥垢包裹的碎玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 2, mag_crit: 4, speed: 5, penetration: 8 },
        value: 1655,
        desc: "从田埂里挖出的断裂玉环，沾满了洗不掉的泥垢，隐约还残留着一丝大地灵气。"
    },
    {
        id: "weapons_210",
        name: "磨损的平安扣",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 3, mag_atk: 4, mag_crit: 4, speed: 5, penetration: 8 },
        value: 1655,
        desc: "不知被多少人佩戴过的老旧平安扣，玉质已经发乌，却因此对人体的法力波动异常敏感。"
    },

    // --- [中数值] (基准: Atk 12, Crit 3, Pen 15, Spd 3) ---
    {
        id: "weapons_211",
        name: "生锈铜丝缠玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 8, mag_atk: 0, mag_crit: 7, speed: 8, sharpness: 12 },
        value: 2460,
        desc: "用生锈铜丝强行固定的碎玉块，虽然做工粗糙，但增加了物理撞击的硬度。"
    },
    {
        id: "weapons_212",
        name: "染血的如意残件",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 6, mag_atk: 2, mag_crit: 7, speed: 8, penetration: 12 },
        value: 2460,
        desc: "从乱军丛中捡到的半截玉如意，断口处浸透了血迹，在爆发时能引动一丝杀伐意念。"
    },
    {
        id: "weapons_213",
        name: "旧货摊的残灵佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 4, mag_atk: 4, mag_crit: 7, speed: 8, penetration: 12 },
        value: 2460,
        desc: "表面纹路已被磨平的青玉佩，虽然法阵几乎全毁，但仍保留了极高的灵力引导频率。"
    },

    // --- [高数值] (基准: Atk 15, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_214",
        name: "弃置的护山灵玉残",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 10, mag_atk: 0, mag_crit: 9, speed: 10, penetration: 16 },
        value: 3130,
        desc: "虽是碎裂的守山大阵边角，但石材本身极其坚硬，佩戴在身上能显著提升身法的灵动感。"
    },
    {
        id: "weapons_215",
        name: "幽蓝的生铁扣灵玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 7, mag_atk: 3, mag_crit: 9, speed: 10, penetration: 16 },
        value: 3130,
        desc: "镶嵌在劣质蓝金中的碎玉片，在极速移动时会留下一道淡淡的幽蓝色残影。"
    },
    {
        id: "weapons_216",
        name: "古旧的祭祀石蝉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 1,
        effects: { phy_atk: 5, mag_atk: 5, mag_crit: 9, speed: 10, penetration: 16 },
        value: 3130,
        desc: "从地底古墓挖出的玉蝉，虽然土腥味重，但其内涵的古老法力一旦爆发，威能惊人。"
    }
];
const weapons_r2_batch1 = [
    // === 匕 (Agile 模组 | 系数: Atk 0.5, Crit 2.5, Spd +2.0, Sharp 1.2) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_217",
        name: "普通的精铁匕首",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 0, crit: 10, speed: 8, sharpness: 24 },
        value: 6600,
        desc: "市面上最常见的防身利刃，做工及格，刃口平整且耐用。"
    },
    {
        id: "weapons_218",
        name: "涂油的猎户短刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 8, mag_atk: 2, crit: 10, speed: 8, sharpness: 24 },
        value: 6600,
        desc: "长期涂抹防锈油脂的短刀，因为处理过不少灵兽皮毛，附带了一丝兽灵气息。"
    },
    {
        id: "weapons_219",
        name: "陈旧的符文小刀",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 5, mag_atk: 5, crit: 10, speed: 8, sharpness: 24 },
        value: 6600,
        desc: "曾是学徒练习画符用的刻刀，虽然法阵已模糊，但法力传导十分顺畅。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_220",
        name: "雇佣兵的随身匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 0, crit: 15, speed: 12, sharpness: 36 },
        value: 9540,
        desc: "老练佣兵的战利品，钢材经过反复捶打，重心完美，适合快速突刺。"
    },
    {
        id: "weapons_221",
        name: "浸过灵墨的解剖刀",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 3, crit: 15, speed: 12, sharpness: 36 },
        value: 9540,
        desc: "药剂师解剖灵植时用的工具，刀刃长期受灵墨浸润，能轻易划开低级法术护盾。"
    },
    {
        id: "weapons_222",
        name: "古旧的骨柄灵刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 7, mag_atk: 7, crit: 15, speed: 12, sharpness: 36 },
        value: 9720,
        desc: "用成年角鹿骨头作为刀柄的灵力短刃，对持有者的精神力反馈非常敏锐。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_223",
        name: "黑市淬火短刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 0, crit: 20, speed: 16, sharpness: 48 },
        value: 12300,
        desc: "R2级别的暗杀利器，经过秘密淬火处理，刃部漆黑不反光，极其锋利。"
    },
    {
        id: "weapons_224",
        name: "幽蓝的卫队副刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 4, crit: 20, speed: 16, sharpness: 48 },
        value: 12300,
        desc: "精锐卫队配备的副武器，刃身掺入了少许蓝钢，挥动时带有细微的破法寒芒。"
    },
    {
        id: "weapons_225",
        name: "宗门练习法匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 8, mag_atk: 8, crit: 20, speed: 16, sharpness: 48 },
        value: 12480,
        desc: "入门弟子使用的标准法匕，结构严谨，在保证物理切割的同时具备优秀的灵透力。"
    }
];
const weapons_r2_batch2 = [
    // === 手戟 (Agile 模组 | 系数: Atk 0.7, Crit 1.6, Spd +1.2, Sharp 1.0) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_226",
        name: "精铁单头手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 0, crit: 6, speed: 5, sharpness: 20 },
        value: 5530,
        desc: "由普通铁匠铺打造的单头小戟，结构稳固，是江湖客常用的防身兵器。"
    },
    {
        id: "weapons_227",
        name: "包钢加固木戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 4, crit: 6, speed: 5, sharpness: 20 },
        value: 5530,
        desc: "在硬木杆上包了一层薄钢皮，并在槽内嵌入了碎灵石粉，手感扎实。"
    },
    {
        id: "weapons_228",
        name: "浸过陈油的桃木戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 7, mag_atk: 7, crit: 6, speed: 5, sharpness: 20 },
        value: 5530,
        desc: "浸泡过多年陈油的硬质桃木，质地如铁且富有弹性，能极好地引导真气。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_229",
        name: "护院精钢双戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 0, crit: 10, speed: 7, sharpness: 30 },
        value: 8070,
        desc: "豪强府邸护院常用的精钢短戟，重心调配得宜，非常适合近身格挡与反击。"
    },
    {
        id: "weapons_230",
        name: "符文刻印的小戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 5, crit: 10, speed: 7, sharpness: 30 },
        value: 8070,
        desc: "戟身上刻有简单的聚气纹路，虽然只是学徒级作品，但在战斗中能提供微弱的破甲法力。"
    },
    {
        id: "weapons_231",
        name: "古旧的紫檀手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 9, mag_atk: 9, crit: 10, speed: 7, sharpness: 30 },
        value: 8070,
        desc: "用名贵紫檀木心制作的手戟，不仅能作为兵器，由于木质通灵，亦可作为施法媒介。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_232",
        name: "百炼精铁对戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 0, crit: 13, speed: 10, sharpness: 40 },
        value: 10160,
        desc: "由成名铁匠精心打造，钢材质地纯净，刃口锋利持久，是 R2 中的极品物攻兵器。"
    },
    {
        id: "weapons_233",
        name: "雷痕木柄短戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 5, crit: 13, speed: 10, sharpness: 40 },
        value: 10160,
        desc: "采用了受过雷击的木料作为手柄，不仅坚硬异常，每一次挥动都隐隐有风雷之声。"
    },
    {
        id: "weapons_234",
        name: "宗门授剑堂练习戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 10, crit: 13, speed: 10, sharpness: 40 },
        value: 10160,
        desc: "宗门授艺堂发给入门弟子的制式兵器，完美兼顾了物理打击与灵力流转。"
    }
];
const weapons_r2_batch3 = [
    // === 吴钩 (Agile 模组 | 系数: Atk 0.75, Crit 1.4, Spd +0.8, Sharp 1.1) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_235",
        name: "精铁小吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 0, crit: 6, speed: 3, sharpness: 22 },
        value: 5570,
        desc: "标准的曲刃短刀，刃口向内弯曲，是江湖新手常用的锁喉兵刃。"
    },
    {
        id: "weapons_236",
        name: "嵌铜柳木钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 4, crit: 6, speed: 3, sharpness: 22 },
        value: 5570,
        desc: "在柔韧的柳木钩身镶嵌了铜质刃口，并涂抹了少许灵砂，具备微弱的破甲法力。"
    },
    {
        id: "weapons_237",
        name: "陈旧的通灵木钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 8, mag_atk: 7, crit: 6, speed: 3, sharpness: 22 },
        value: 5570,
        desc: "虽然看起来只是一截弯曲的旧木，但材质极其致密，对气的流转有特殊的加持作用。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_238",
        name: "镖局标准的吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 0, crit: 8, speed: 5, sharpness: 33 },
        value: 7410,
        desc: "镖局押运员常用的标准装备，曲刃经过反复拉拔，韧性极佳，能轻易勾住敌方兵刃。"
    },
    {
        id: "weapons_239",
        name: "符纹淬火钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 5, crit: 8, speed: 5, sharpness: 33 },
        value: 7410,
        desc: "在淬火液中加入了灵石碎屑，钩身表面隐约可见如丝线般的符文脉络。"
    },
    {
        id: "weapons_240",
        name: "古旧的灵竹吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 9, crit: 8, speed: 5, sharpness: 33 },
        value: 7410,
        desc: "用生长百年的灵竹根部削制，天然的弧度配合灵气的运转，如影随形。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_241",
        name: "百炼亮银钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 0, crit: 11, speed: 6, sharpness: 44 },
        value: 9520,
        desc: "R2级别的工艺极限，钢材质地纯亮如银，钩尖锐利无比，一勾之下血肉横飞。"
    },
    {
        id: "weapons_242",
        name: "寒铁浸邪钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 17, mag_atk: 6, crit: 11, speed: 6, sharpness: 44 },
        value: 9520,
        desc: "加入了寒铁矿石打制，由于制作时沾染了阴冷气息，挥舞间能产生阵阵寒芒。"
    },
    {
        id: "weapons_243",
        name: "门派外门法钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 12, crit: 11, speed: 6, sharpness: 44 },
        value: 9520,
        desc: "宗门外门弟子的制式兵器，完美平衡了勾拽的物理力量与灵力的快速渗透。"
    }
];
const weapons_r2_batch4 = [
    // === 奇门 (Agile 模组 | 系数: Atk 0.6, Crit 2.0, Spd +1.5, Sharp 0.8) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_244",
        name: "精钢九节鞭",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 12, mag_atk: 0, crit: 8, speed: 6, sharpness: 16 },
        value: 5900,
        desc: "标准的精钢长鞭，收放自如，虽然杀伤面散乱，但极难防御。"
    },
    {
        id: "weapons_245",
        name: "浸毒的铁线索",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 9, mag_atk: 3, crit: 8, speed: 6, sharpness: 16 },
        value: 5900,
        desc: "带有细微倒钩的铁索，表面涂抹了能引发法力紊乱的毒素。"
    },
    {
        id: "weapons_246",
        name: "通灵的铜响板",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 6, mag_atk: 6, crit: 8, speed: 6, sharpness: 16 },
        value: 5900,
        desc: "曾由江湖说书人使用的铜板，长期经受神识熏陶，拍击时能震荡他人灵台。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_247",
        name: "飞爪索套",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 0, crit: 12, speed: 9, sharpness: 24 },
        value: 8310,
        desc: "探险者常用的抓钩改制，五个爪刃极其尖锐，能轻易抓破皮甲。"
    },
    {
        id: "weapons_248",
        name: "阵图绘饰扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 4, crit: 12, speed: 9, sharpness: 24 },
        value: 8310,
        desc: "扇面绘有初级困阵的铁骨扇，挥动间能产生干扰感官的灵力气流。"
    },
    {
        id: "weapons_249",
        name: "古旧的八卦罗盘",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 8, mag_atk: 7, crit: 12, speed: 9, sharpness: 24 },
        value: 8310,
        desc: "带有磁力的古旧罗盘，可引导星辰之力进行小范围的法力干扰。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_250",
        name: "子母机巧环",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 0, crit: 16, speed: 12, sharpness: 32 },
        value: 10720,
        desc: "环中藏环的高级暗器，旋转时不仅能割裂目标，还能发出刺耳啸音。"
    },
    {
        id: "weapons_251",
        name: "幽蓝摄魂铃",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 5, crit: 16, speed: 12, sharpness: 32 },
        value: 10720,
        desc: "加入了寒铜制造的铜铃，铃声低沉，能引导阴冷法力直接攻击对方神智。"
    },
    {
        id: "weapons_252",
        name: "古遗迹星象仪残片",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 2,
        effects: { phy_atk: 9, mag_atk: 9, crit: 16, speed: 12, sharpness: 32 },
        value: 10720,
        desc: "精密计算过的星象仪碎片，极度轻便，能通过共振将灵力增幅数倍。"
    }
];
const weapons_r2_batch5 = [
    // === 剑 (Balanced 模组 | 系数: Atk 1.0, Crit 1.1, Spd 0.0, Sharp 1.0) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_253",
        name: "洗练的精钢长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 0, crit: 4, speed: 0, sharpness: 20 },
        value: 5440,
        desc: "经过多次淬火的精钢剑，去除了杂质，刃口平整，深受江湖新进欢迎。"
    },
    {
        id: "weapons_254",
        name: "浸过朱砂的木柄剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 5, crit: 4, speed: 0, sharpness: 20 },
        value: 5440,
        desc: "在剑柄处浸泡了驱邪朱砂，不仅手感扎实，在斩击时还能带起微弱的热力。"
    },
    {
        id: "weapons_255",
        name: "受供奉的旧桃木剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 10, crit: 4, speed: 0, sharpness: 20 },
        value: 5440,
        desc: "道观中供奉了一段时间的桃木剑，虽然木质已有裂纹，但灵力导性极佳。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_256",
        name: "卫队统领的佩剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 25, mag_atk: 0, crit: 7, speed: 0, sharpness: 30 },
        value: 7620,
        desc: "军中统领级别的标准配剑，钢材厚度与锋利度达到了完美的平衡。"
    },
    {
        id: "weapons_257",
        name: "刻有符文的青钢剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 6, crit: 7, speed: 0, sharpness: 30 },
        value: 7620,
        desc: "在青钢剑脊上刻有简单的聚灵咒文，能在物理斩击中渗透一丝法力伤害。"
    },
    {
        id: "weapons_258",
        name: "灵竹芯打制的木剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 12, crit: 7, speed: 0, sharpness: 30 },
        value: 7620,
        desc: "采用深山老竹的竹芯制作，质地坚韧不逊于凡铁，且对灵力反应极其灵敏。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_259",
        name: "百炼纹钢阔剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 30, mag_atk: 0, crit: 9, speed: 0, sharpness: 40 },
        value: 9440,
        desc: "R2级别的工艺杰作，剑身布满折叠锻造产生的花纹，物理杀伤力极强。"
    },
    {
        id: "weapons_260",
        name: "幽蓝的水晶法剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 7, crit: 9, speed: 0, sharpness: 40 },
        value: 9440,
        desc: "剑刃边缘镶嵌了碎裂的灵晶，挥舞间能产生阵阵幽蓝残影，极具穿透力。"
    },
    {
        id: "weapons_261",
        name: "门派授徒用真武剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 15, crit: 9, speed: 0, sharpness: 40 },
        value: 9440,
        desc: "名门正派授予优秀弟子的入门宝剑，能将持有者的精气神完美转化为攻击力。"
    }
];
const weapons_r2_batch6 = [
    // === 刀 (Balanced 模组 | 系数: Atk 1.15, Crit 0.9, Spd -0.5, Sharp 1.1) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_262",
        name: "厚背精铁砍刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 0, crit: 4, speed: -2, sharpness: 22 },
        value: 5840,
        desc: "铁匠铺打造的加厚型砍刀，虽然沉重，但劈砍时力量感十足，刃口极厚。"
    },
    {
        id: "weapons_263",
        name: "淬火的屠夫厚刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 17, mag_atk: 6, crit: 4, speed: -2, sharpness: 22 },
        value: 5840,
        desc: "不仅经过油淬，还加入了微量兽骨灰，使得刀身在劈砍时带有一丝狂暴的冲击感。"
    },
    {
        id: "weapons_264",
        name: "陈旧的桑木朴刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 12, mag_atk: 11, crit: 4, speed: -2, sharpness: 22 },
        value: 5840,
        desc: "由致密桑木芯削制而成的练习刀，虽然是木质，但通过内气灌注后的硬度不亚于钢铁。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_265",
        name: "精锐步卒大刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 0, crit: 5, speed: -3, sharpness: 33 },
        value: 7410,
        desc: "军中精锐普遍装备的长柄大刀，钢材质地紧实，能够承受高强度的白刃战。"
    },
    {
        id: "weapons_266",
        name: "符纹淬火砍山刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 22, mag_atk: 7, crit: 5, speed: -3, sharpness: 33 },
        value: 7410,
        desc: "在刀身上刻有破甲符文的宽刃刀，劈砍时能释放微弱的震荡波，专门对付厚重护甲。"
    },
    {
        id: "weapons_267",
        name: "老旧的灵木斩马刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 15, crit: 5, speed: -3, sharpness: 33 },
        value: 7410,
        desc: "用带有些许灵性的老木打制，由于刀身宽大，极其适合作为大面积法力输出的载体。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_268",
        name: "百炼夹钢环首刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 35, mag_atk: 0, crit: 7, speed: -4, sharpness: 44 },
        value: 9340,
        desc: "R2级别的工艺杰作，采用了复杂的夹钢工艺，兼具了硬度与韧性，刃口寒气逼人。"
    },
    {
        id: "weapons_269",
        name: "幽蓝的雷击铁厚刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 26, mag_atk: 9, crit: 7, speed: -4, sharpness: 44 },
        value: 9340,
        desc: "加入了雷火灼烧过的生铁精炼而成，刀身呈现不规则的暗紫色，挥舞间有沉闷的雷鸣。"
    },
    {
        id: "weapons_270",
        name: "门派授徒用戒律刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 17, mag_atk: 18, crit: 7, speed: -4, sharpness: 44 },
        value: 9340,
        desc: "宗门授艺堂配发的标准重刀，能将持有者的刚猛灵气毫无保留地通过刀锋宣泄而出。"
    }
];
const weapons_r2_batch7 = [
    // === 铍 (Balanced 模组 | 系数: Atk 1.20, Crit 0.8, Spd -0.8, Sharp 1.2) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_271",
        name: "精铁制式长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 0, crit: 3, speed: -3, sharpness: 24 },
        value: 5610,
        desc: "标准的乡村卫队兵器，长柄配以如短剑般的铍头，结构简单而实用。"
    },
    {
        id: "weapons_272",
        name: "加固的木柄铁铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 6, crit: 3, speed: -3, sharpness: 24 },
        value: 5610,
        desc: "木杆经过桐油反复浸泡并包以铁皮，不仅耐用，还能引导微弱的土系气劲。"
    },
    {
        id: "weapons_273",
        name: "陈旧的通灵长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 12, mag_atk: 12, crit: 3, speed: -3, sharpness: 24 },
        value: 5610,
        desc: "由带有一定岁数的硬木削制长杆，铍头处缠绕了少量灵丝，传导法力十分平稳。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_274",
        name: "武馆标准的劈刺铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 30, mag_atk: 0, crit: 5, speed: -5, sharpness: 36 },
        value: 7470,
        desc: "地方武馆用来传授枪术基础的教具，钢材质地紧致，劈砍性能被专门强化过。"
    },
    {
        id: "weapons_275",
        name: "符文加固的长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 7, crit: 5, speed: -5, sharpness: 36 },
        value: 7470,
        desc: "在铍头与柄部连接处刻有稳固符文，不仅极大提升了耐用度，突刺时还带有微弱风压。"
    },
    {
        id: "weapons_276",
        name: "灵木芯制成的长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 15, crit: 5, speed: -5, sharpness: 36 },
        value: 7470,
        desc: "采用灵竹根部的老料作为杆身，铍头轻薄而锋利，在法力灌注下能产生极强的灵透。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_277",
        name: "百炼精钢步卒铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 36, mag_atk: 0, crit: 6, speed: -6, sharpness: 48 },
        value: 9060,
        desc: "R2级别的步战精品，铍身呈现出反复锻打后的折叠纹路，穿刺与扫击威力极大。"
    },
    {
        id: "weapons_278",
        name: "幽蓝冷铁长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 27, mag_atk: 9, crit: 6, speed: -6, sharpness: 48 },
        value: 9060,
        desc: "加入了少量冷铁矿石熔炼，铍头在阳光下透着不详的蓝色，挥舞间阴冷法力逼人。"
    },
    {
        id: "weapons_279",
        name: "宗门练习用真武铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 18, crit: 6, speed: -6, sharpness: 48 },
        value: 9060,
        desc: "宗门发给具备一定根基弟子的制式兵器，能将修士的真元完美引导至铍尖锋芒之上。"
    }
];
const weapons_r2_batch8 = [
    // === 矛 (Reach 模组 | 系数: Atk 1.25, Crit 0.8, Spd -1.0, Sharp 1.2) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_280",
        name: "普通的精铁长矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 25, mag_atk: 0, crit: 3, speed: -4, sharpness: 24 },
        value: 5700,
        desc: "标准的护院长矛，矛头经过简单的淬火处理，足以应付一般的野兽或盗匪。"
    },
    {
        id: "weapons_281",
        name: "包铜的硬木枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 6, crit: 3, speed: -4, sharpness: 24 },
        value: 5700,
        desc: "在枪尖下部包了一层薄铜，刻有微小的聚气槽，能将微弱法力引导至枪尖。"
    },
    {
        id: "weapons_282",
        name: "受潮的通灵杆矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 12, crit: 3, speed: -4, sharpness: 24 },
        value: 5700,
        desc: "选用带有些许灵性的木材制作的练习矛，虽然存放已久，但灵力传导依然极其平稳。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_283",
        name: "武馆标准的白蜡矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 31, mag_atk: 0, crit: 5, speed: -6, sharpness: 36 },
        value: 7560,
        desc: "白蜡木杆具有极佳的韧性，矛头设计考究，是练习刺击与点拨的上好器械。"
    },
    {
        id: "weapons_284",
        name: "符文加固的破阵矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 8, crit: 5, speed: -6, sharpness: 36 },
        value: 7560,
        desc: "枪杆上贴有稳固符咒，枪头经过破法液处理，对一般的法术护甲有一定的穿透力。"
    },
    {
        id: "weapons_285",
        name: "老旧的刻纹灵矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 15, crit: 5, speed: -6, sharpness: 36 },
        value: 7560,
        desc: "矛身上刻有用于聚集灵气的回旋纹路，突刺时能产生极窄且密集的灵力锋芒。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_286",
        name: "百炼精钢步卒枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 38, mag_atk: 0, crit: 6, speed: -8, sharpness: 48 },
        value: 9240,
        desc: "正规步兵配发的锐利战枪，精钢矛头锃亮，一击之下可轻易刺穿厚实的鱼鳞甲。"
    },
    {
        id: "weapons_287",
        name: "幽蓝的雷击木枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 28, mag_atk: 10, crit: 6, speed: -8, sharpness: 48 },
        value: 9240,
        desc: "采用雷击枣木制作的枪杆，极度坚硬且自带焦灼气息，是物法结合的极品长矛。"
    },
    {
        id: "weapons_288",
        name: "门派授徒用流萤矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 19, crit: 6, speed: -8, sharpness: 48 },
        value: 9240,
        desc: "宗门发给入室弟子的制式兵器，矛尖颤动间如流萤乱舞，灵力爆发极强。"
    }
];
const weapons_r2_batch9 = [
    // === 戈 (Reach 模组 | 系数: Atk 1.30, Crit 0.7, Spd -1.2, Sharp 0.9) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_289",
        name: "精铁制式短戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 26, mag_atk: 0, crit: 3, speed: -5, sharpness: 18 },
        value: 5670,
        desc: "工整打造的生铁戈，横刃锋利，是城防卫兵用来勾取梯子的常用器械。"
    },
    {
        id: "weapons_290",
        name: "铜皮包木横戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 6, crit: 3, speed: -5, sharpness: 18 },
        value: 5670,
        desc: "在横向木刃上包裹了抛光的薄铜，内部填塞了少量朱砂，具备微弱的阳气。"
    },
    {
        id: "weapons_291",
        name: "通灵的桑木长戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 13, crit: 3, speed: -5, sharpness: 18 },
        value: 5670,
        desc: "选用致密的老桑木削制，戈身一体成型，法力在曲折的结构中运转毫无滞涩。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_292",
        name: "护院精钢啄戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 33, mag_atk: 0, crit: 4, speed: -7, sharpness: 27 },
        value: 7290,
        desc: "针对勾啄设计的重型戈，戈尖极长且带有细微倒钩，一击之下能轻易撕裂厚皮甲。"
    },
    {
        id: "weapons_293",
        name: "符文淬火长戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 9, crit: 4, speed: -7, sharpness: 27 },
        value: 7290,
        desc: "横刃经过符水淬火，泛着淡淡的青光，勾拽时能产生微弱的吸附力，干扰敌人动作。"
    },
    {
        id: "weapons_294",
        name: "灵竹芯打制的曲戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 17, crit: 4, speed: -7, sharpness: 27 },
        value: 7290,
        desc: "采用灵竹根部的天然曲度制成，极度柔韧且对灵力反应灵敏，是术武双修者的爱物。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_295",
        name: "百炼青铜重戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 39, mag_atk: 0, crit: 6, speed: -10, sharpness: 36 },
        value: 9000,
        desc: "R2级别的步战精品，复古的百炼青铜工艺使其坚硬无比，沉重的打击力令人胆寒。"
    },
    {
        id: "weapons_296",
        name: "寒铁浸邪长戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 10, crit: 6, speed: -10, sharpness: 36 },
        value: 9000,
        desc: "加入了寒铁碎屑熔炼的戈头，呈现出一种不祥的暗紫色，勾取间带有丝丝寒毒。"
    },
    {
        id: "weapons_297",
        name: "宗门练习用真武戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 19, crit: 6, speed: -10, sharpness: 36 },
        value: 9000,
        desc: "宗门外门弟子的进阶兵器，戈身铭刻了标准的引灵纹路，钩啄间能带起大范围灵力激荡。"
    }
];
const weapons_r2_batch10 = [
    // === 戟 (Reach 模组 | 系数: Atk 1.40, Crit 0.6, Spd -1.5, Sharp 1.1) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_298",
        name: "精铁制式方天戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 28, mag_atk: 0, crit: 2, speed: -6, sharpness: 22 },
        value: 5660,
        desc: "标准的城防步卒戟，结构紧凑，矛头与月牙刃连接稳固，是战场上的多面手。"
    },
    {
        id: "weapons_299",
        name: "包钢加固长杆戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 7, crit: 2, speed: -6, sharpness: 22 },
        value: 5660,
        desc: "在硬木杆身包覆了防裂钢皮，并涂抹了少许灵油，使其在劈刺间带有微弱法力震荡。"
    },
    {
        id: "weapons_300",
        name: "陈旧的通灵木戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 14, crit: 2, speed: -6, sharpness: 22 },
        value: 5660,
        desc: "选用有一定年份的通灵木打制，戟头镶嵌了薄钢，极其适合法力在尖端汇聚。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_301",
        name: "武馆标准的教练戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 35, mag_atk: 0, crit: 4, speed: -9, sharpness: 33 },
        value: 7590,
        desc: "武馆用来教授长兵法门的标准大戟，钢材厚实，不仅能刺击，横向钩切力也极其可观。"
    },
    {
        id: "weapons_302",
        name: "符文淬火破甲戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 26, mag_atk: 9, crit: 4, speed: -9, sharpness: 33 },
        value: 7590,
        desc: "戟刃经过符水淬火，表面留下了如水波般的纹路，能够有效干扰敌方护甲的防御流气。"
    },
    {
        id: "weapons_303",
        name: "灵木芯制成的长戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 17, crit: 4, speed: -9, sharpness: 33 },
        value: 7590,
        desc: "采用灵木核心打制的杆身，戟头轻量化处理，使得灵力爆发时的指向性非常明确。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_304",
        name: "百炼精钢步卒重戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 42, mag_atk: 0, crit: 5, speed: -12, sharpness: 44 },
        value: 9160,
        desc: "R2级别的步战精品，经过反复锻打，戟身沉重而坚固，是重装步兵的噩梦。"
    },
    {
        id: "weapons_305",
        name: "幽蓝冷铁残月戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 32, mag_atk: 10, crit: 5, speed: -12, sharpness: 44 },
        value: 9160,
        desc: "加入了寒铁碎屑熔炼的月牙刃，在阳光下呈现深蓝色，劈砍间自带阵阵阴寒之气。"
    },
    {
        id: "weapons_306",
        name: "宗门练习用真武戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 21, crit: 5, speed: -12, sharpness: 44 },
        value: 9160,
        desc: "宗门发给具备根基弟子的制式重兵，戟尖缠绕着引灵丝，能在大范围挥舞中宣泄真元。"
    }
];
const weapons_r2_batch11 = [
    // === 长铩 (Reach 模组 | 系数: Atk 1.45, Crit 0.5, Spd -1.8, Sharp 1.0) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_307",
        name: "粗糙的生铁长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 0, crit: 2, speed: -7, sharpness: 20 },
        value: 5710,
        desc: "乡村铁匠随手打制的长铁片，边缘毛糙，勉强能用来横扫，重心极差。"
    },
    {
        id: "weapons_308",
        name: "抹了灵灰的旧木铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 22, mag_atk: 7, crit: 2, speed: -7, sharpness: 20 },
        value: 5710,
        desc: "在宽大的木刃上涂抹了一层灵石废灰，看起来脏兮兮的，但挥舞时确实带点法力感。"
    },
    {
        id: "weapons_309",
        name: "开裂的枯藤长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 14, crit: 2, speed: -7, sharpness: 20 },
        value: 5710,
        desc: "虽然藤身已经干裂，但这种野生的灵木材质比凡铁更易导气，只是看起来快断了。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_310",
        name: "劣质的卫队淘汰铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 36, mag_atk: 0, crit: 3, speed: -11, sharpness: 30 },
        value: 7170,
        desc: "城防队换装换下的淘汰品，铩头满是锈迹且有些弯曲，仅仅比烧火棍强一些。"
    },
    {
        id: "weapons_311",
        name: "符纸加固的铁片铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 27, mag_atk: 9, crit: 3, speed: -11, sharpness: 30 },
        value: 7170,
        desc: "在摇摇欲坠的铁片连接处缠了几圈灵符布，勉强加固了结构，也附带了些许杂乱法力。"
    },
    {
        id: "weapons_312",
        name: "老旧的刻痕木铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 18, crit: 3, speed: -11, sharpness: 30 },
        value: 7170,
        desc: "不知从哪间废弃道观翻出来的练习木铩，表面刻痕斑驳，由于年份久了，灵力反应还算敏感。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_313",
        name: "粗制滥造的重钢铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 44, mag_atk: 0, crit: 4, speed: -14, sharpness: 40 },
        value: 8900,
        desc: "用未经提纯的劣质钢材铸造的重物，极其沉重，全靠蛮力压制，毫无技巧可言。"
    },
    {
        id: "weapons_314",
        name: "暗沉的黑铁残铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 33, mag_atk: 11, crit: 4, speed: -14, sharpness: 40 },
        value: 8900,
        desc: "加入了少量矿渣打制的厚铁刃，表面呈现不详的暗色，挥舞起来带有沉闷的杂质嗡鸣。"
    },
    {
        id: "weapons_315",
        name: "半截的古庙仪仗铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 2,
        effects: { phy_atk: 22, mag_atk: 22, crit: 4, speed: -14, sharpness: 40 },
        value: 8900,
        desc: "原本是仪仗队的兵器，虽说材质比一般废品好，但年久失修，铩尖已钝，仅剩法力尚可。"
    }
];
const weapons_r2_batch12 = [
    // === 钺 (Heavy 模组 | 系数: Atk 1.60, Crit 0.4, Spd -2.2, Sharp 0.8) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_316",
        name: "生锈的土作坊大钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 32, mag_atk: 0, crit: 2, speed: -9, sharpness: 16 },
        value: 5990,
        desc: "由村头铁匠随意敲打出来的铁块，钺面厚薄不一，重心歪斜，勉强能劈开木柴。"
    },
    {
        id: "weapons_317",
        name: "包了废铜的旧钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 8, crit: 2, speed: -9, sharpness: 16 },
        value: 5990,
        desc: "在裂掉的钺刃上包了几块废弃的灵龛铜片，看起来花里胡哨，但确实能渗出一丝杂乱灵气。"
    },
    {
        id: "weapons_318",
        name: "朽木柄的石铁钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 16, crit: 2, speed: -9, sharpness: 16 },
        value: 5990,
        desc: "将半块生铁和一块青石绑在腐朽的杆子上，虽然简陋得可笑，但对内气的传导意外地还行。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_319",
        name: "缺口的矿用开山钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 40, mag_atk: 0, crit: 2, speed: -13, sharpness: 24 },
        value: 7230,
        desc: "挖矿时用来崩石的重型工具，因为操作不当崩了几个大口子，虽被淘汰但仍是笨重的杀器。"
    },
    {
        id: "weapons_320",
        name: "符纸缠绕的废铁钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 30, mag_atk: 10, crit: 2, speed: -13, sharpness: 24 },
        value: 7230,
        desc: "钺身上贴满了皱巴巴的旧符纸来稳固结构，挥动时法力像漏风一样四散，但也算有点威力。"
    },
    {
        id: "weapons_321",
        name: "老旧的刻纹练习钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 20, crit: 2, speed: -13, sharpness: 24 },
        value: 7230,
        desc: "武馆里用了几十年的木芯钺，刻满了各种划痕，由于长期被弟子们的汗水和灵气浸泡，导性尚可。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_322",
        name: "粗制滥造的黑铁钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 48, mag_atk: 0, crit: 3, speed: -18, sharpness: 32 },
        value: 8740,
        desc: "用未经脱渣的劣质黑铁铸造而成，钺身巨大且极其笨重，几乎没有刃口，全靠蛮力下砸。"
    },
    {
        id: "weapons_323",
        name: "暗沉的染血旧钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 36, mag_atk: 12, crit: 3, speed: -18, sharpness: 32 },
        value: 8740,
        desc: "从死人堆里扒出来的重兵器，血渍早已渗入金属缝隙，挥舞时有一股令人作呕的陈年煞气。"
    },
    {
        id: "weapons_324",
        name: "地摊上的古怪大钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 24, crit: 3, speed: -18, sharpness: 32 },
        value: 8740,
        desc: "在旧货摊底部翻出来的铁坨子，勉强接了个歪斜的长柄，由于材质不明，法力吞吐量竟然不小。"
    }
];
const weapons_r2_batch13 = [
    // === 斧 (Heavy 模组 | 系数: Atk 1.50, Crit 0.6, Spd -1.8, Sharp 0.9) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_325",
        name: "卷刃的樵夫铁斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 30, mag_atk: 0, crit: 2, speed: -7, sharpness: 18 },
        value: 5850,
        desc: "砍柴砍到卷刃的破斧子，斧柄松动，但铁头沉重，抡起来还算有点力道。"
    },
    {
        id: "weapons_326",
        name: "粘有灵芝灰的短柄斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 22, mag_atk: 8, crit: 2, speed: -7, sharpness: 18 },
        value: 5850,
        desc: "在斧刃和斧柄缝隙里粘着一些干枯灵芝的碎屑，偶尔能激发出微弱的生发灵力。"
    },
    {
        id: "weapons_327",
        name: "开裂的桃木战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 15, crit: 2, speed: -7, sharpness: 18 },
        value: 5850,
        desc: "虽然是桃木，但由于年代久远，木质已经半玉化，能勉强引导灵力进行劈砍。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_328",
        name: "劣质的护院重斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 37, mag_atk: 0, crit: 3, speed: -11, sharpness: 27 },
        value: 7290,
        desc: "某家大户淘汰下来的看家斧，斧头铸造粗糙，但分量十足，全凭力气劈砍。"
    },
    {
        id: "weapons_329",
        name: "符纸加固的矿工镐斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 28, mag_atk: 9, crit: 3, speed: -11, sharpness: 27 },
        value: 7290,
        desc: "矿工用来劈开灵矿的改造斧，斧柄缠满了发黄的符纸，挥动时法力泄露严重。"
    },
    {
        id: "weapons_330",
        name: "老旧的刻纹训练斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 19, crit: 3, speed: -11, sharpness: 27 },
        value: 7470,
        desc: "武馆里年久失修的训练斧，斧身刻满了模糊的裂纹，灵力在其中流转并不稳定。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_331",
        name: "粗制滥造的重型战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 45, mag_atk: 0, crit: 4, speed: -14, sharpness: 36 },
        value: 9000,
        desc: "用劣质矿石铸造的巨斧，斧头巨大而笨重，挥舞起来带起阵阵恶风，纯粹的蛮力兵器。"
    },
    {
        id: "weapons_332",
        name: "暗沉的染血双头斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 34, mag_atk: 11, crit: 4, speed: -14, sharpness: 36 },
        value: 9000,
        desc: "从战场遗骸上搜来的双头斧，斧刃布满豁口和血污，散发着一股令人不安的煞气。"
    },
    {
        id: "weapons_333",
        name: "地摊上的古怪铁胎斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 22, crit: 4, speed: -14, sharpness: 36 },
        value: 9000,
        desc: "在旧货堆里找到的铁胎木斧，斧身已严重腐朽，但内里的铁胎却意外地对法力有些反应。"
    }
];
const weapons_r2_batch14 = [
    // === 椎/锤 (Heavy 模组 | 系数: Atk 1.85, Crit 0.0, Spd -3.5, Sharp 0.4) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_334",
        name: "生锈的实心铁缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 37, mag_atk: 0, crit: 0, speed: -14, sharpness: 8 },
        value: 5560,
        desc: "工坊里用来压货的铁坨子，焊了个把手就当武器使，挥舞起来重心全无。"
    },
    {
        id: "weapons_335",
        name: "包铜皮的重木槌",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 28, mag_atk: 9, crit: 0, speed: -14, sharpness: 8 },
        value: 5560,
        desc: "洗衣服用的重木槌包了层劣质铜皮，由于材质粗糙，法力在其中乱冲乱撞。"
    },
    {
        id: "weapons_336",
        name: "开裂的青石椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 18, crit: 0, speed: -14, sharpness: 8 },
        value: 5380,
        desc: "路边捡来的青石条，虽然裂纹密布，但石材本身的通灵性比废铁强点。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_337",
        name: "劣质的铸铁圆锤",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 46, mag_atk: 0, crit: 0, speed: -21, sharpness: 12 },
        value: 6630,
        desc: "铸造时留下了大量气泡的铁锤，虽然一磕就容易裂，但现下的分量还是足的。"
    },
    {
        id: "weapons_338",
        name: "符纸缠绕的压舱石",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 35, mag_atk: 11, crit: 0, speed: -21, sharpness: 12 },
        value: 6630,
        desc: "从沉船里捞出来的压舱石，贴了几张皱巴巴的符咒，砸下去时带点沉闷的法力波动。"
    },
    {
        id: "weapons_339",
        name: "陈旧的训练石椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 23, crit: 0, speed: -21, sharpness: 12 },
        value: 6630,
        desc: "武馆淘汰下来的举重石椎，由于长期被汗水浸润，对持有者的真气反馈非常迟钝。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_340",
        name: "废弃的铁匠铺大锤",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 55, mag_atk: 0, crit: 0, speed: -28, sharpness: 16 },
        value: 7700,
        desc: "锤头已经变形的打铁大锤，柄部磨损严重，每一次下砸都全凭一身蛮力。"
    },
    {
        id: "weapons_341",
        name: "暗沉的生铁坨",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 41, mag_atk: 14, crit: 0, speed: -28, sharpness: 16 },
        value: 7700,
        desc: "从废弃矿坑捡来的生铁疙瘩，杂质极多，挥动时隐约能带起一股浑浊的土系灵压。"
    },
    {
        id: "weapons_342",
        name: "古旧祭坛的垫脚石",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 28, mag_atk: 27, crit: 0, speed: -28, sharpness: 16 },
        value: 7700,
        desc: "荒废祭坛角落里的条石，勉强加了个歪斜的柄，由于长年受香火熏陶，灵导性尚可。"
    }
];
const weapons_r2_batch15 = [
    // === 殳 (Heavy 模组 | 系数: Atk 1.55, Crit 0.5, Spd -2.0, Sharp 0.5) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_343",
        name: "受潮的重木桩",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 31, mag_atk: 0, crit: 2, speed: -8, sharpness: 10 },
        value: 5780,
        desc: "工地用来夯地的重木头，受潮后沉得要命，抡动时甚至能听到里面水渍的晃荡声。"
    },
    {
        id: "weapons_344",
        name: "包了铁皮的残殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 8, crit: 2, speed: -8, sharpness: 10 },
        value: 5780,
        desc: "在裂开的木桩头上钉了几层废铜铁皮，看起来像个疙瘩，法力流转断断续续。"
    },
    {
        id: "weapons_345",
        name: "枯萎的石皮木棒",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 15, crit: 2, speed: -8, sharpness: 10 },
        value: 5780,
        desc: "天然形成的坚硬木棍，表面覆盖了一层像石头的皮，虽然丑陋但导气性勉强合格。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_346",
        name: "生锈的矿用长夯",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 39, mag_atk: 0, crit: 3, speed: -12, sharpness: 15 },
        value: 7320,
        desc: "矿井里淘汰的碎石长棒，生铁头已经凹凸不平，砸在硬物上震得手生疼。"
    },
    {
        id: "weapons_347",
        name: "符布缠绕的烂木殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 10, crit: 3, speed: -12, sharpness: 15 },
        value: 7320,
        desc: "长棒顶端缠了一圈又一圈褪色的灵符布条，法力像漏水一样散出，但也算有点威势。"
    },
    {
        id: "weapons_348",
        name: "老旧的刻纹练习殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 19, crit: 3, speed: -12, sharpness: 15 },
        value: 7140,
        desc: "武馆里用了多年的演示器械，木杆已经有些歪斜，法力在曲折的木纹中运行极慢。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_349",
        name: "粗制滥造的黑铁殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 47, mag_atk: 0, crit: 4, speed: -16, sharpness: 20 },
        value: 8860,
        desc: "用未经提纯的生铁铸成的长棒，极其沉重且表面满是砂眼，全靠这一坨死重杀敌。"
    },
    {
        id: "weapons_350",
        name: "暗沉的染血重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 35, mag_atk: 12, crit: 4, speed: -16, sharpness: 20 },
        value: 8860,
        desc: "从废弃哨所里扒出来的旧兵器，包铁上布满陈年血垢，挥动间隐约有股不详的阴风。"
    },
    {
        id: "weapons_351",
        name: "地摊上的古怪铁胎殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 23, crit: 4, speed: -16, sharpness: 20 },
        value: 8680,
        desc: "在黑市角落里翻出的废品，铁芯已锈，但外层木料却对法力有种奇特的吸附效果。"
    }
];
const weapons_r2_batch16 = [
    // === 弩 (Ranged 模组 | 系数: Atk 1.30, Crit 0.8, Spd -1.5, Sharp 1.2) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_352",
        name: "生锈的劣质猎弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 26, mag_atk: 0, crit: 3, speed: -6, sharpness: 24 },
        value: 5700,
        desc: "弩弦松弛，瞄具歪斜，扳机卡涩，勉强能将弩箭射出，准头全看运气。"
    },
    {
        id: "weapons_353",
        name: "包了铜皮的旧木弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 6, crit: 3, speed: -6, sharpness: 24 },
        value: 5700,
        desc: "木制弩臂用废铜皮加固，弩弦上残留着劣质灵油，射出去的箭带有一丝火星。"
    },
    {
        id: "weapons_354",
        name: "开裂的竹制灵弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 13, crit: 3, speed: -6, sharpness: 24 },
        value: 5700,
        desc: "弩身用开裂的竹子拼接而成，虽然竹节处漏风，但对灵力的传导还算凑合。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_355",
        name: "劣质的军用淘汰弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 32, mag_atk: 0, crit: 5, speed: -9, sharpness: 36 },
        value: 7470,
        desc: "军械库淘汰下来的破烂弩，弩身被虫蛀了好几个洞，射程短且威力衰减严重。"
    },
    {
        id: "weapons_356",
        name: "符纸加固的废铁弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 8, crit: 5, speed: -9, sharpness: 36 },
        value: 7470,
        desc: "弩臂缠满了发黄的符纸，虽然看着摇摇欲坠，但射出的弩箭能附带微弱法力灼烧。"
    },
    {
        id: "weapons_357",
        name: "老旧的刻纹训练弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 16, crit: 5, speed: -9, sharpness: 36 },
        value: 7470,
        desc: "武馆里训练学员用的旧弩，弩身刻痕模糊，法力在其中流转并不稳定，经常射偏。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_358",
        name: "粗制滥造的重型手弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 39, mag_atk: 0, crit: 6, speed: -12, sharpness: 48 },
        value: 9060,
        desc: "用未经提纯的劣质钢铸就的重弩，扳机极硬，拉弦费力，但射出去的动能巨大。"
    },
    {
        id: "weapons_359",
        name: "暗沉的染血旧弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 9, crit: 6, speed: -12, sharpness: 48 },
        value: 8880,
        desc: "从战场上捡来的半截弩，弩身布满血垢，发射时伴有沉闷的邪气嗡鸣，箭矢难以控制。"
    },
    {
        id: "weapons_360",
        name: "地摊上的古怪灵石弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 19, crit: 6, speed: -12, sharpness: 48 },
        value: 8880,
        desc: "弩身歪歪扭扭地镶嵌着几颗发乌的灵石，虽然看起来随时会散架，但对法力有奇特增幅。"
    }
];
const weapons_r2_batch17 = [
    // === 弓 (Ranged 模组 | 系数: Atk 1.05, Crit 1.5, Spd -0.5, Sharp 0.0) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Sharp 20, Spd 4) ---
    {
        id: "weapons_361",
        name: "受潮的开裂桑木弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 0, crit: 6, speed: -2, sharpness: 0 },
        value: 5760,
        desc: "在柴房受潮腐坏的旧弓，弓身已经有些纵向开裂，拉弓时发出的木材断裂声让人心惊。"
    },
    {
        id: "weapons_362",
        name: "麻绳缠绕的烂竹弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 5, crit: 6, speed: -2, sharpness: 0 },
        value: 5760,
        desc: "竹片已经失去弹性的劣质弓，用粗麻绳胡乱缠绕加固，勉强能带起一丝驳杂法力。"
    },
    {
        id: "weapons_363",
        name: "发霉的练习用小弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 10, crit: 6, speed: -2, sharpness: 0 },
        value: 5760,
        desc: "武馆淘汰的幼童练习具，木质发霉发黑，但因为长期接触聚灵阵，导气性竟然还没全散。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_364",
        name: "劣质的猎户长弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 26, mag_atk: 0, crit: 9, speed: -3, sharpness: 0 },
        value: 7650,
        desc: "山民自造的大弓，用料粗糙且没经过正规阴干，弹力极不均匀，每次射箭都要重新校准。"
    },
    {
        id: "weapons_365",
        name: "符布缠绕的断筋弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 7, crit: 9, speed: -3, sharpness: 0 },
        value: 7650,
        desc: "弓弦已经快要起毛断裂，用褪色的灵符布条勉强打结接合，射出的箭矢轨迹歪歪斜斜。"
    },
    {
        id: "weapons_366",
        name: "地摊上的古怪灵木弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 13, crit: 9, speed: -3, sharpness: 0 },
        value: 7650,
        desc: "不知从哪棵死掉的灵树上砍下的枝条制成，由于制作工艺极其简陋，法力在弓身里四处乱窜。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Sharp 40, Spd 8) ---
    {
        id: "weapons_367",
        name: "城防队淘汰的旧战弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 32, mag_atk: 0, crit: 12, speed: -4, sharpness: 0 },
        value: 9720,
        desc: "正规军步卒报废的战弓，弓背被虫蛀了大半，虽然物理结构危在旦夕，但底子还在。"
    },
    {
        id: "weapons_368",
        name: "幽蓝的生铁片复合弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 8, crit: 12, speed: -4, sharpness: 0 },
        value: 9720,
        desc: "强行在木弓上加装了生锈的生铁片来增加拉力，铁片带有诡异的杂质蓝光，极其沉重。"
    },
    {
        id: "weapons_369",
        name: "古旧的祭祀石弓架",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 16, crit: 12, speed: -4, sharpness: 0 },
        value: 9720,
        desc: "从地脉遗迹挖出的半截石制弓架，弓弦已无，勉强配上劣质兽筋，依靠残余灵力勉强攒射。"
    }
];
const weapons_r2_batch18 = [
    // === 飞剑 (Relic 模组 | 系数: Atk 1.00, Crit 1.2, Spd +1.2, Pen 1.3) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_370",
        name: "生锈的生铁练习剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 0, mag_crit: 5, speed: 5, penetration: 26 },
        value: 6370,
        desc: "粗铁打造的飞剑，生锈严重且重心不稳，与其说是飞剑，不如说是能飞的铁片。"
    },
    {
        id: "weapons_371",
        name: "包铜皮的劣质木剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 5, mag_crit: 5, speed: 5, penetration: 26 },
        value: 6370,
        desc: "木剑身上胡乱包了层薄铜片，灵气流转极不顺畅，御使时会发出刺耳的嗡鸣。"
    },
    {
        id: "weapons_372",
        name: "枯萎的灵竹残刃",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 10, mag_crit: 5, speed: 5, penetration: 26 },
        value: 6370,
        desc: "因灵气枯竭而变黄的竹剑，表面布满细小裂纹，勉强能承载一丝真元运转。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_373",
        name: "旧货摊的钝口飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 25, mag_atk: 0, mag_crit: 7, speed: 7, penetration: 39 },
        value: 8430,
        desc: "在旧货摊底部翻出的沉重飞剑，剑刃早已磨平，仅剩一副坚硬的精铁架子。"
    },
    {
        id: "weapons_374",
        name: "符布缠绕的断剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 6, mag_crit: 7, speed: 7, penetration: 39 },
        value: 8430,
        desc: "折断后的飞剑用褪色的符布强行拼接，法力输出极其不稳定，随时可能脱靶。"
    },
    {
        id: "weapons_375",
        name: "老旧的刻纹木法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 12, mag_crit: 7, speed: 7, penetration: 39 },
        value: 8430,
        desc: "刻满了笨拙符文的练习木剑，木质疏松且已经发黑，但在 R2 中灵性还算尚存。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_376",
        name: "粗制滥造的重钢法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 30, mag_atk: 0, mag_crit: 10, speed: 10, penetration: 52 },
        value: 10940,
        desc: "用劣质钢材铸造的巨型飞剑，极其沉重且毫无灵气感，全靠惯性对敌方造成打击。"
    },
    {
        id: "weapons_377",
        name: "幽蓝的劣质矿渣剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 23, mag_atk: 7, mag_crit: 10, speed: 10, penetration: 52 },
        value: 10940,
        desc: "加入了大量未经提炼的矿渣打制，剑身闪烁着杂乱的蓝光，挥动间灵压极不稳定。"
    },
    {
        id: "weapons_378",
        name: "古旧的祭祀石飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 15, mag_crit: 10, speed: 10, penetration: 52 },
        value: 10940,
        desc: "从废弃庙宇里翻出的石制剑胚，虽然表面坑洼，但由于材质古老，灵透力勉强达标。"
    }
];
const weapons_r2_batch19 = [
    // === 法印 (Relic 模组 | 系数: Atk 1.60, Crit 0.5, Spd -3.0, Pen 1.1) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_379",
        name: "生锈的实心铁砣印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 32, mag_atk: 0, mag_crit: 2, speed: -12, penetration: 22 },
        value: 5840,
        desc: "在路边铁匠铺随便打制的实心铁块，底部刻了个模糊的印记，砸下去全靠重量。"
    },
    {
        id: "weapons_380",
        name: "浸油的碎裂木印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 8, mag_crit: 2, speed: -12, penetration: 22 },
        value: 5840,
        desc: "木头已经开裂，为了防止散架而浸泡在陈油里，散发着一股令人不悦的烟火杂气。"
    },
    {
        id: "weapons_381",
        name: "发霉的青石残印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 16, mag_crit: 2, speed: -12, penetration: 22 },
        value: 5840,
        desc: "不知从哪间废弃土地庙搬来的石块，长满了霉斑，灵力流转在裂缝中断断续续。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_382",
        name: "劣质的铸铁镇纸",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 40, mag_atk: 0, mag_crit: 3, speed: -18, penetration: 33 },
        value: 7320,
        desc: "铸造时满是气孔的劣等铁镇纸，虽然法力感极差，但作为钝器劈砸还算有点威力。"
    },
    {
        id: "weapons_383",
        name: "符纸糊住的裂石印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 30, mag_atk: 10, mag_crit: 3, speed: -18, penetration: 33 },
        value: 7320,
        desc: "石材已经碎成了几瓣，用廉价符纸勉强糊住，法力波动像漏风的风箱一样紊乱。"
    },
    {
        id: "weapons_384",
        name: "老旧的练习木法印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 20, mag_crit: 3, speed: -18, penetration: 33 },
        value: 7320,
        desc: "武馆学员用来练手的重型木印，边缘磨损严重，只能勉强激发出微弱的震荡感。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_385",
        name: "粗制滥造的黑铁砣",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 48, mag_atk: 0, mag_crit: 4, speed: -24, penetration: 44 },
        value: 8800,
        desc: "用矿渣熔炼出的沉重疙瘩，毫无章法的形制，每次砸击都会因为重心不稳而反震。"
    },
    {
        id: "weapons_386",
        name: "暗沉的染血古印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 36, mag_atk: 12, mag_crit: 4, speed: -24, penetration: 44 },
        value: 8800,
        desc: "从乱葬岗捡回来的旧印，沾满了洗不掉的污血，挥舞时散发着一股令人压抑的邪气。"
    },
    {
        id: "weapons_387",
        name: "地摊上的古怪石疙瘩",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 24, mag_crit: 4, speed: -24, penetration: 44 },
        value: 8800,
        desc: "在旧货摊底部翻出的无名石块，表面有些模糊的刻痕，对真气的吸纳出奇地混乱。"
    }
];
const weapons_r2_batch20 = [
    // === 宝葫芦 (Relic 模组 | 系数: Atk 0.95, Crit 1.0, Spd 0.0, Pen 1.4) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_388",
        name: "皮壳斑驳的干葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 19, mag_atk: 0, mag_crit: 4, speed: 0, penetration: 28 },
        value: 5420,
        desc: "表皮长满了霉斑的干葫芦，木质极其粗糙，甩动时能听到里面干枯种子的撞击声。"
    },
    {
        id: "weapons_389",
        name: "抹了劣漆的药葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 5, mag_crit: 4, speed: 0, penetration: 28 },
        value: 5420,
        desc: "为了掩盖裂纹而涂了一层厚厚的黑漆，由于密封不严，每次引导法力都会溢出苦涩的药味。"
    },
    {
        id: "weapons_390",
        name: "受潮的旧酒葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 9, mag_crit: 4, speed: 0, penetration: 28 },
        value: 5420,
        desc: "酒鬼丢弃在路边的旧物，由于长期被劣酒浸泡，葫芦壁已经有些软化，灵力流转非常散乱。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_391",
        name: "粗制的生铁胎葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 0, mag_crit: 6, speed: 0, penetration: 42 },
        value: 7320,
        desc: "在木质葫芦外面强行焊了一层铁皮，做工极其粗糙，不仅重得离谱，而且毫无美感。"
    },
    {
        id: "weapons_392",
        name: "符纸糊口的木葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 6, mag_crit: 6, speed: 0, penetration: 42 },
        value: 7320,
        desc: "嘴部已经崩裂，用褪色的黄符勉强缠了几圈当作密封，法力波动像漏风一般不稳定。"
    },
    {
        id: "weapons_393",
        name: "地摊上的裂纹灵葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 12, mag_atk: 12, mag_crit: 6, speed: 0, penetration: 42 },
        value: 7320,
        desc: "廉价地摊货，表面刻满了模仿名家的伪造灵纹，虽然是假货，但材质还算能勉强导气。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_394",
        name: "厚重的矿质石葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 0, mag_crit: 8, speed: 0, penetration: 56 },
        value: 9220,
        desc: "用不知名的杂矿石雕琢而成，不仅沉重如石块，且表面满是砂眼，毫无灵宝的轻灵感。"
    },
    {
        id: "weapons_395",
        name: "暗沉的渗血兽皮葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 7, mag_crit: 8, speed: 0, penetration: 56 },
        value: 9040,
        desc: "由劣质兽皮拼接而成，由于硝制工艺不精，表面总是渗出暗红色的腥臭液滴。"
    },
    {
        id: "weapons_396",
        name: "古旧的枯木大葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 14, mag_crit: 8, speed: 0, penetration: 56 },
        value: 9040,
        desc: "从废弃庙宇后的老树上摘下的枯萎葫芦，虽然外壳干裂得厉害，但勉强能容纳不少真元。"
    }
];
const weapons_r2_batch21 = [
    // === 阵盘 (Relic 模组 | 系数: Atk 1.10, Crit 1.4, Spd -1.5, Pen 1.90) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_397",
        name: "粗糙的方石阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 22, mag_atk: 0, mag_crit: 6, speed: -3, penetration: 38 },
        value: 6610,
        desc: "用普通的青石板随意刻了几道线，石质疏松，比起布阵更适合用来砸人。"
    },
    {
        id: "weapons_398",
        name: "包铁边的旧木托",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 17, mag_atk: 5, mag_crit: 6, speed: -3, penetration: 38 },
        value: 6610,
        desc: "原本是茶托，钉了一圈生锈铁边试图充当阵基，法力在木纹间散乱不堪。"
    },
    {
        id: "weapons_399",
        name: "开裂的泥塑占盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 11, mag_atk: 11, mag_crit: 6, speed: -3, penetration: 38 },
        value: 6610,
        desc: "地摊上随处可见的泥塑仿品，虽然已经干裂，但内里掺杂的少量灵土还能勉强导气。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_400",
        name: "劣质的铸铁算盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 28, mag_atk: 0, mag_crit: 8, speed: -5, penetration: 57 },
        value: 8610,
        desc: "铸造时留下了大量砂眼的铁盘，虽然作为法宝极度不称职，但物理硬度还算马虎。"
    },
    {
        id: "weapons_401",
        name: "符纸加固的碎石盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 7, mag_crit: 8, speed: -5, penetration: 57 },
        value: 8610,
        desc: "石盘中心已经断裂，用几张发黄的灵符强行贴合，阵法激发时伴随着危险的颤抖。"
    },
    {
        id: "weapons_402",
        name: "老旧的刻痕木方阵",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 14, mag_crit: 8, speed: -5, penetration: 57 },
        value: 8610,
        desc: "武馆淘汰的演练具，木料已经腐朽发黑，由于长期被劣质灵石摩擦，表面凹凸不平。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_403",
        name: "粗制滥造的重钢盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 33, mag_atk: 0, mag_crit: 11, speed: -6, penetration: 76 },
        value: 10880,
        desc: "用未经脱渣的废钢强行压制成的厚盘，极其笨重，边缘甚至还能割伤持有者的手。"
    },
    {
        id: "weapons_404",
        name: "暗沉的染血阵基",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 25, mag_atk: 8, mag_crit: 11, speed: -6, penetration: 76 },
        value: 10880,
        desc: "从被毁的村寨祭坛中抠出来的石板，浸透了陈年血渍，带有一种令人不安的沉重压制感。"
    },
    {
        id: "weapons_405",
        name: "地摊上的古怪铁胎阵",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 17, mag_atk: 16, mag_crit: 11, speed: -6, penetration: 76 },
        value: 10880,
        desc: "黑市角落里无人问津的铁芯盘，木质外壳已经掉光，露出的锈蚀纹路竟能勉强引导灵压。"
    }
];
const weapons_r2_batch22 = [
    // === 灵镜 (Relic 模组 | 系数: Atk 0.80, Crit 1.8, Spd +0.8, Pen 1.5) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_406",
        name: "生锈的旧铜镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 0, mag_crit: 7, speed: 3, penetration: 30 },
        value: 6270,
        desc: "锈迹斑斑，镜面模糊不清，勉强能反射出一点光线，作为暗器砸人还行。"
    },
    {
        id: "weapons_407",
        name: "包铜边的裂纹玉牌",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 12, mag_atk: 4, mag_crit: 7, speed: 3, penetration: 30 },
        value: 6270,
        desc: "玉牌已经碎成了几片，用粗劣铜边强行包住，反射的灵光也带着裂缝的影子。"
    },
    {
        id: "weapons_408",
        name: "发霉的旧木制小盾",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 8, mag_atk: 8, mag_crit: 7, speed: 3, penetration: 30 },
        value: 6270,
        desc: "原本是戏班道具，涂了厚厚的防腐漆也发霉了，勉强能将一丝灵气反射出去。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_409",
        name: "劣质的铸铁照妖镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 0, mag_crit: 10, speed: 5, penetration: 45 },
        value: 8550,
        desc: "铸造时有大量杂质的铁镜，虽然号称照妖，但只能模模糊糊地照出个鬼影。"
    },
    {
        id: "weapons_410",
        name: "符纸糊住的碎光盘",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 15, mag_atk: 5, mag_crit: 10, speed: 5, penetration: 45 },
        value: 8550,
        desc: "一个被敲碎的古老陶片，用符纸强行贴合，反射的法力光束总是歪七扭八。"
    },
    {
        id: "weapons_411",
        name: "老旧的刻纹训练镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 10, mag_crit: 10, speed: 5, penetration: 45 },
        value: 8550,
        desc: "武馆里用来练习反击的旧镜，镜面布满划痕，反射的灵光效果极差。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_412",
        name: "粗制滥造的重铜镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 0, mag_crit: 14, speed: 6, penetration: 60 },
        value: 11100,
        desc: "用未经提纯的粗铜铸成的巨大铜镜，异常沉重，反射出来的只是凡光，但物理攻击力惊人。"
    },
    {
        id: "weapons_413",
        name: "暗沉的染血古镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 18, mag_atk: 6, mag_crit: 14, speed: 6, penetration: 60 },
        value: 11100,
        desc: "从废弃古墓里挖出来的青铜镜，镜面布满血渍，反射出的灵光带有一种令人不安的猩红。"
    },
    {
        id: "weapons_414",
        name: "地摊上的古怪灵石片",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 12, mag_atk: 12, mag_crit: 14, speed: 6, penetration: 60 },
        value: 11100,
        desc: "黑市里叫卖的无名石片，表面凹凸不平，但能勉强聚拢灵气，反射出微弱的法力光束。"
    }
];
const weapons_r2_batch23 = [
    // === 长幡/符箓 (Relic 模组 | 系数: Atk 1.30, Crit 0.8, Spd -1.2, Pen 1.20) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_415",
        name: "受潮的厚纸符页",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 26, mag_atk: 0, mag_crit: 3, speed: -5, penetration: 24 },
        value: 5790,
        desc: "用劣质黄纸层层浆洗过的厚符，硬得像块木板，砸在身上生疼，但法力反应极弱。"
    },
    {
        id: "weapons_416",
        name: "朱砂不匀的布幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 6, mag_crit: 3, speed: -5, penetration: 24 },
        value: 5790,
        desc: "在粗麻布上胡乱涂抹的符文，朱砂里掺了太多杂质，挥动时灵力波动断断续续。"
    },
    {
        id: "weapons_417",
        name: "发霉的废弃经页",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 13, mag_crit: 3, speed: -5, penetration: 24 },
        value: 5790,
        desc: "道观角落里受潮发霉的废纸，字迹已模糊不清，由于长期受香火熏染，仍有一丝残存法力。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_418",
        name: "劣质的木柄招魂幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 33, mag_atk: 0, mag_crit: 5, speed: -7, penetration: 36 },
        value: 7830,
        desc: "杆子开裂且重心不稳的法旗，幡布厚重得像门帘，物理横扫的威力胜过其法力表现。"
    },
    {
        id: "weapons_419",
        name: "符咒补丁的旧帘",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 24, mag_atk: 9, mag_crit: 5, speed: -7, penetration: 36 },
        value: 7830,
        desc: "由数十张碎符纸拼凑成的布帘，由于各符文效果冲突，激发时常伴有不稳定的火花。"
    },
    {
        id: "weapons_420",
        name: "老旧的练习用长幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 17, mag_crit: 5, speed: -7, penetration: 36 },
        value: 7830,
        desc: "武馆学员用来练习挥旗的道具，布料早已磨损起毛，只能勉强承载少量的内气灌注。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_421",
        name: "粗制滥造的重帛幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 39, mag_atk: 0, mag_crit: 6, speed: -10, penetration: 48 },
        value: 9240,
        desc: "用未经脱脂的粗丝织成的重幡，沉重且僵硬，挥舞时呼呼作响，全靠蛮力带动机道。"
    },
    {
        id: "weapons_422",
        name: "暗沉的染血咒旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 29, mag_atk: 10, mag_crit: 6, speed: -10, penetration: 48 },
        value: 9240,
        desc: "从废墟中捡回的破旗，浸透了陈年血渍后变得暗红，每次祭出都散发着阵阵令人不适的阴气。"
    },
    {
        id: "weapons_423",
        name: "地摊上的古怪符图",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 20, mag_atk: 19, mag_crit: 6, speed: -10, penetration: 48 },
        value: 9240,
        desc: "在旧货摊底部翻出的无名卷轴，画工极差且纸张发脆，但其内涵的古怪灵压竟然不弱。"
    }
];
const weapons_r2_batch24 = [
    // === 玉佩 (Relic 模组 | 系数: Atk 0.70, Crit 2.0, Spd +0.5, Pen 1.6) ===

    // --- [低数值] (基准: Atk 20, Crit 4, Pen 20, Spd 4) ---
    {
        id: "weapons_424",
        name: "粗糙的磨损玉玦",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 14, mag_atk: 0, mag_crit: 8, speed: 2, penetration: 32 },
        value: 6220,
        desc: "玉质浑浊且边缘磨损严重的玉玦，与其说是法宝，不如说是能砸人的石头。"
    },
    {
        id: "weapons_425",
        name: "包金边的裂纹玉片",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 4, mag_crit: 8, speed: 2, penetration: 32 },
        value: 6220,
        desc: "玉片已经碎裂，用劣质金边强行包住，灵力流转在裂缝中断断续续。"
    },
    {
        id: "weapons_426",
        name: "泥土浸泡的旧玉坠",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 7, mag_atk: 7, mag_crit: 8, speed: 2, penetration: 32 },
        value: 6220,
        desc: "从废墟泥土里挖出的发黄玉坠，灵气几乎散尽，只能勉强引发一丝共鸣。"
    },

    // --- [中数值] (基准: Atk 25, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_427",
        name: "劣质的假玉雕像",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 17, mag_atk: 0, mag_crit: 12, speed: 3, penetration: 48 },
        value: 8610,
        desc: "用粗劣石头仿制的神像，玉质感极差，但其物理硬度尚可，砸人时很有分量。"
    },
    {
        id: "weapons_428",
        name: "符纸加固的碎灵玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 13, mag_atk: 4, mag_crit: 12, speed: 3, penetration: 48 },
        value: 8610,
        desc: "灵玉已经崩碎，用几张发黄的符纸强行贴合，法力激发时伴随着细微的能量泄露。"
    },
    {
        id: "weapons_429",
        name: "老旧的刻纹训练玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 9, mag_atk: 9, mag_crit: 12, speed: 3, penetration: 48 },
        value: 8790,
        desc: "武馆学员用来练习感应的旧玉，玉面布满划痕，灵力在其中流转异常迟钝。"
    },

    // --- [高数值] (基准: Atk 30, Crit 8, Pen 40, Spd 8) ---
    {
        id: "weapons_430",
        name: "粗制滥造的重石佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 21, mag_atk: 0, mag_crit: 16, speed: 4, penetration: 64 },
        value: 11180,
        desc: "用未经打磨的重石雕成的假玉佩，极其笨重，虽然法力感极差，但物理撞击力惊人。"
    },
    {
        id: "weapons_431",
        name: "暗沉的染血古玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 16, mag_atk: 5, mag_crit: 16, speed: 4, penetration: 64 },
        value: 11180,
        desc: "从乱葬岗捡回来的旧玉佩，沾满了洗不掉的污血，激发时散发着一股令人不安的阴气。"
    },
    {
        id: "weapons_432",
        name: "地摊上的古怪灵石片",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 2,
        effects: { phy_atk: 10, mag_atk: 10, mag_crit: 16, speed: 4, penetration: 64 },
        value: 11000,
        desc: "黑市里叫卖的无名石片，表面凹凸不平，但能勉强聚拢灵气，激发微弱的法力波动。"
    }
];
const weapons_r3_batch1 = [
    // === 匕 (Agile 模组 | 系数: 0.5, 2.5, +2.0, 1.2 | Req 配比: 2:0:8) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_433",
        name: "精铁防身匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 15, mag_atk: 0, crit: 15, speed: 12, sharpness: 36 },
        value: 14850,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "市面上最常见的精铁短匕，江湖行商与镖师几乎人手一把，胜在坚固实用。"
    },
    {
        id: "weapons_434",
        name: "铭文短刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 11, mag_atk: 4, crit: 15, speed: 12, sharpness: 36 },
        value: 14850,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "在刀柄处铭刻了简单导气纹路的短刺，是许多初入门径的修士的首选副手兵刃。"
    },
    {
        id: "weapons_435",
        name: "流云练手短刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 8, mag_atk: 7, crit: 15, speed: 12, sharpness: 36 },
        value: 14850,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "武林各派弟子练习快攻时常用的短刃，重心平稳，法力适应性较为平均。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_436",
        name: "军中制式暗刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 19, mag_atk: 0, crit: 23, speed: 18, sharpness: 54 },
        value: 21600,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "军中斥候标配的暗刃，采用精炼钢材，刀身涂有防反光层，兼具破甲与便携性。"
    },
    {
        id: "weapons_437",
        name: "灵砂淬火匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 14, mag_atk: 5, crit: 23, speed: 18, sharpness: 54 },
        value: 21600,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "在淬火过程中加入了灵砂的短匕，刃口泛着微弱的红光，对真气有着不错的承载力。"
    },
    {
        id: "weapons_438",
        name: "江湖客惯用锋刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 9, mag_atk: 10, crit: 23, speed: 18, sharpness: 54 },
        value: 21600,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "经验丰富的独行侠偏爱的武器，虽然外观朴素，但其材质与法力流通感非常协调。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_439",
        name: "精钢破甲锥",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 23, mag_atk: 0, crit: 30, speed: 24, sharpness: 72 },
        value: 27810,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "百炼精钢打制的三棱尖刃，在 R3 级别中拥有顶级的破甲能力，是军中校尉的爱物。"
    },
    {
        id: "weapons_440",
        name: "寒铁法纹匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 17, mag_atk: 6, crit: 30, speed: 24, sharpness: 72 },
        value: 27810,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "嵌入了寒铁碎片的精品飞匕，其灵性在江湖武器中属于上乘，法力穿透感极强。"
    },
    {
        id: "weapons_441",
        name: "名坊出品练习短兵",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 11, mag_atk: 11, crit: 30, speed: 24, sharpness: 72 },
        value: 27540,
        req: { jing: 9, qi: 0, shen: 36 },
        desc: "由知名铸造坊大批量生产的高级练习具，其工艺在普通人眼中已近乎完美，法力传导极佳。"
    }
];
const weapons_r3_batch2 = [
    // === 手戟 (Agile 模组 | 系数: 0.7, 1.6, +1.2, 1.0 | Req: 4:0:6) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_442",
        name: "精铁制式手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 21, mag_atk: 0, crit: 10, speed: 7, sharpness: 30 },
        value: 12915,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "军中步卒常备的副手兵刃，精铁铸造，结构稳固，适合近身缠斗与钩挂。"
    },
    {
        id: "weapons_443",
        name: "纹铁短戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 16, mag_atk: 5, crit: 10, speed: 7, sharpness: 30 },
        value: 12915,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "在戟尖揉入了少量灵材纹铁，对真气的承载力尚可，是江湖散修常用的防身兵器。"
    },
    {
        id: "weapons_444",
        name: "流云演武手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 10, mag_atk: 11, crit: 10, speed: 7, sharpness: 30 },
        value: 12915,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "武馆中常见的高级演武具，重心经过精密调校，不仅外形美观，法力导向亦十分平衡。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_445",
        name: "百炼精钢手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 26, mag_atk: 0, crit: 14, speed: 11, sharpness: 45 },
        value: 17415,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "由熟练铁匠经百炼工序打制的精钢手戟，刃口锋利且坚韧，是精锐士卒的爱物。"
    },
    {
        id: "weapons_446",
        name: "淬灵精铁戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 19, mag_atk: 7, crit: 14, speed: 11, sharpness: 45 },
        value: 17415,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "经过灵泉淬火的精铁戟，戟身泛着淡淡青光，能在战斗中有效传导持有者的内息。"
    },
    {
        id: "weapons_447",
        name: "江湖游侠小戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 13, mag_atk: 13, crit: 14, speed: 11, sharpness: 45 },
        value: 17415,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "走南闯北的游侠惯用的武器，兼顾了物理穿透与灵力响应，应对各类敌人皆得心应手。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_448",
        name: "校尉督造手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 32, mag_atk: 0, crit: 19, speed: 14, sharpness: 60 },
        value: 22590,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "军中校尉级别督造的实战精品，用料扎实，在 R3 级别中拥有极高的破甲与杀伤力。"
    },
    {
        id: "weapons_449",
        name: "寒晶嵌锋戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 8, crit: 19, speed: 14, sharpness: 60 },
        value: 22590,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "在戟刃边缘镶嵌了微小寒晶，赋予了武器更强的法力穿透力，挥舞时寒气逼人。"
    },
    {
        id: "weapons_450",
        name: "名门制式法戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 16, mag_atk: 15, crit: 19, speed: 14, sharpness: 60 },
        value: 22320,
        req: { jing: 18, qi: 0, shen: 27 },
        desc: "名门大派统一配发的标准兵刃，工艺极其考究，法力流转顺畅无比，是 R3 中的佼佼者。"
    }
];
const weapons_r3_batch3 = [
    // === 吴钩 (Agile 模组 | 系数: 0.75, 1.4, +0.8, 1.1 | Req: 5:0:5) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_451",
        name: "精铁制式吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 23, mag_atk: 0, crit: 8, speed: 5, sharpness: 33 },
        value: 12195,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "州郡守备军常见的制式武器，曲刃如月，能够有效钩开敌人的盾牌或锁住兵器。"
    },
    {
        id: "weapons_452",
        name: "青铜纹饰钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 17, mag_atk: 6, crit: 8, speed: 5, sharpness: 33 },
        value: 12195,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "江湖中随处可见的青铜制吴钩，刃部刻有基础的引灵纹路，适合初学真气的江湖新人。"
    },
    {
        id: "weapons_453",
        name: "流云堂练习钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 11, mag_atk: 12, crit: 8, speed: 5, sharpness: 33 },
        value: 12195,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "武馆大批量订购的演武用具，虽然并非名家打造，但法力导向十分平顺，适合日常修习。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_454",
        name: "百炼精钢吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 28, mag_atk: 0, crit: 13, speed: 7, sharpness: 50 },
        value: 17025,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "由熟练铁匠反复捶打出的精钢刃，韧性极佳，是许多跑江湖的老手赖以生存的伙伴。"
    },
    {
        id: "weapons_455",
        name: "淬火灵锋钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 21, mag_atk: 7, crit: 13, speed: 7, sharpness: 50 },
        value: 17025,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "经过灵矿粉淬火的钩身，隐隐透着蓝光，能让持有者的内息更容易渗透进目标的甲胄。"
    },
    {
        id: "weapons_456",
        name: "镖局特制曲刃",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 14, mag_atk: 14, crit: 13, speed: 7, sharpness: 50 },
        value: 17025,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "大镖局为旗下镖头定制的精锐武器，材质匀称，在格挡与反击间拥有极佳的灵力平衡感。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_457",
        name: "校尉督造斩风钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 34, mag_atk: 0, crit: 17, speed: 10, sharpness: 66 },
        value: 21690,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "军中千户亲自监督打制的精品，重钢铸就，在 R3 级别中具备惊人的切割力与破坏力。"
    },
    {
        id: "weapons_458",
        name: "寒铁嵌灵吴钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 25, mag_atk: 9, crit: 17, speed: 10, sharpness: 66 },
        value: 21690,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "刃尖镶嵌了深海寒铁，挥动时带起一丝冷冽灵压，常被用于对抗身披轻甲的敌对修士。"
    },
    {
        id: "weapons_459",
        name: "名坊制式法刃",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 17, mag_atk: 17, crit: 17, speed: 10, sharpness: 66 },
        value: 21690,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "出自名家之手的批量成品，虽无独特属性，但其顺滑的导气手感是普通人能接触到的顶级工艺。"
    }
];
const weapons_r3_batch4 = [
    // === 奇门 (Agile 模组 | 系数: 0.6, 2.0, +1.5, 0.8 | Req: 3:0:7) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_460",
        name: "精铁九节鞭",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 0, crit: 12, speed: 9, sharpness: 24 },
        value: 13275,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "走江湖的卖艺人或护院常用的精铁九节鞭，收放灵活，由于鞭节厚实，抽打威力不俗。"
    },
    {
        id: "weapons_461",
        name: "嵌铜铁骨扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 14, mag_atk: 4, crit: 12, speed: 9, sharpness: 24 },
        value: 13275,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "扇骨中镶嵌了薄铜片的格斗扇，是武林文士常见的防身武器，扇面绘有基础的聚气图。"
    },
    {
        id: "weapons_462",
        name: "通灵响板",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 9, mag_atk: 9, crit: 12, speed: 9, sharpness: 24 },
        value: 13275,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "民间法事中常见的铜响板，由致密铜材铸造，能通过撞击声传导微弱的法力震荡。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_463",
        name: "捕快专用锁镰",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 0, crit: 18, speed: 14, sharpness: 36 },
        value: 18630,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "州府捕快为了拿贼专门配备的锁镰，链条紧密，镰刃锋利，适合在大范围缠斗中制敌。"
    },
    {
        id: "weapons_464",
        name: "符纹淬火乾坤圈",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 17, mag_atk: 5, crit: 18, speed: 14, sharpness: 36 },
        value: 18630,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "经过简单符纹淬火处理的钢环，旋转投掷时由于法力激荡，能带起刺耳的啸音干扰对手。"
    },
    {
        id: "weapons_465",
        name: "江湖杂学铁算盘",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 11, mag_atk: 11, crit: 18, speed: 14, sharpness: 36 },
        value: 18630,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "账房先生或商队首领常用的重型铁算盘，算珠滑动顺滑，法力流通感极佳。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_466",
        name: "校尉督造飞钩爪",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 27, mag_atk: 0, crit: 24, speed: 18, sharpness: 48 },
        value: 24120,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "军中特种步卒使用的精钢抓钩，五爪锐利如鹰，钢索坚韧，是攻城掠阵的利器。"
    },
    {
        id: "weapons_467",
        name: "寒晶嵌心扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 20, mag_atk: 7, crit: 24, speed: 18, sharpness: 48 },
        value: 24120,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "名坊出品的高级奇门扇，扇轴处镶有微小寒晶，挥动间灵压密集，法力穿透力极强。"
    },
    {
        id: "weapons_468",
        name: "名坊制式判官笔",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 3,
        effects: { phy_atk: 14, mag_atk: 13, crit: 24, speed: 18, sharpness: 48 },
        value: 24120,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "专为点击穴位设计的重质钢笔，工艺考究，能将周身法力瞬间凝聚于笔尖爆发。"
    }
];
const weapons_r3_batch5 = [
    // === 剑 (Bal 模组 | 系数: 1.00, 1.1, 0.0, 1.0 | Req: 5:0:5) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_469",
        name: "精铁制式青锋剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 30, mag_atk: 0, crit: 7, speed: 0, sharpness: 30 },
        value: 12780,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "武馆弟子与护院标配的精铁长剑，剑身坚固，平衡感良好，是武林中最常见的风景。"
    },
    {
        id: "weapons_470",
        name: "铭文练习剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 8, crit: 7, speed: 0, sharpness: 30 },
        value: 12780,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "剑刃处刻有简易导灵纹的练习剑，能帮助初学者更好地感受法力在兵刃中的流转。"
    },
    {
        id: "weapons_471",
        name: "松纹钢剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 15, mag_atk: 15, crit: 7, speed: 0, sharpness: 30 },
        value: 12780,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "市面上广泛流通的折铁钢剑，纹理如松针，对内气与真元的承载力非常均衡。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_472",
        name: "百炼制式钢剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 37, mag_atk: 0, crit: 10, speed: 0, sharpness: 45 },
        value: 16740,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "由正规军工坊经过百炼打制的钢剑，弹性与硬度兼备，足以应对大多数江湖冲突。"
    },
    {
        id: "weapons_473",
        name: "淬灵青铜长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 28, mag_atk: 9, crit: 10, speed: 0, sharpness: 45 },
        value: 16740,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "在古法青铜中掺入灵砂复铸而成的长剑，剑身隐现微光，对破除低级护体罡气有一定效果。"
    },
    {
        id: "weapons_474",
        name: "流云堂制式法剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 19, crit: 10, speed: 0, sharpness: 45 },
        value: 16740,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "江湖名门“流云堂”大批量产出的精品，工艺严谨，法力传导效率在同类中属于上乘。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_475",
        name: "校尉督造斩钢剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 45, mag_atk: 0, crit: 13, speed: 0, sharpness: 60 },
        value: 20970,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "军中校尉定做的实战佩剑，用料极厚，在 R3 级别中拥有顶级的物理切割力。"
    },
    {
        id: "weapons_476",
        name: "寒铁嵌纹长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 34, mag_atk: 11, crit: 13, speed: 0, sharpness: 60 },
        value: 20970,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "嵌入了寒铁矿渣的精品钢剑，挥动间寒气凛然，能够有效穿透敌人的真元防护。"
    },
    {
        id: "weapons_477",
        name: "名坊出品·制式君子剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 23, mag_atk: 22, crit: 13, speed: 0, sharpness: 60 },
        value: 20970,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "出自著名铸剑坊的批量代表作，整体材质通透无暇，法力流通感极佳，深受江湖俊杰喜爱。"
    }
];
const weapons_r3_batch6 = [
    // === 刀 (Bal 模组 | 系数: 1.15, 0.9, -0.5, 1.1 | Req: 7:0:3) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_478",
        name: "精铁制式阔刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 35, mag_atk: 0, crit: 5, speed: -3, sharpness: 33 },
        value: 12735,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "最为常见的厚背阔刀，军中步卒标配，不仅能劈砍，必要时甚至可以当作挡箭的盾牌。"
    },
    {
        id: "weapons_479",
        name: "百炼环首刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 26, mag_atk: 9, crit: 5, speed: -3, sharpness: 33 },
        value: 12735,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "江湖中大批量产出的环首刀，钢质尚可，刀脊处嵌入了少许导灵矿粉，法力流通顺畅。"
    },
    {
        id: "weapons_480",
        name: "练习用重朴刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 17, mag_atk: 17, crit: 5, speed: -3, sharpness: 33 },
        value: 12465,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "武馆学徒在步战训练时常用的重刀，重心偏前，能有效锻炼使用者的真气爆发力。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_481",
        name: "步卒百炼钢刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 43, mag_atk: 0, crit: 8, speed: -5, sharpness: 50 },
        value: 16755,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "军工坊出品的高级步卒刀，经过数百次捶打，刃部硬度极高，适合高强度的正面劈杀。"
    },
    {
        id: "weapons_482",
        name: "符文淬火斩马刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 32, mag_atk: 11, crit: 8, speed: -5, sharpness: 50 },
        value: 16755,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "刀身刻有稳固符文的重型长刀，淬火工艺精湛，在对抗轻型法力护盾时有奇效。"
    },
    {
        id: "weapons_483",
        name: "江湖名坊砍山刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 21, mag_atk: 21, crit: 8, speed: -5, sharpness: 50 },
        value: 16485,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "出自民间著名铸造坊的宽刃刀，虽然外形朴实，但法术与物理攻击的契合度极高。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_484",
        name: "校尉督造陷阵刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 52, mag_atk: 0, crit: 11, speed: -6, sharpness: 66 },
        value: 21150,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "军中校尉亲自督造的杀伐利器，刀头宽阔，由于加重了脊背，劈砍威能极其惊人。"
    },
    {
        id: "weapons_485",
        name: "寒铁浸蓝长刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 39, mag_atk: 13, crit: 11, speed: -6, sharpness: 66 },
        value: 21150,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "加入了少量寒铁矿提炼的刀具，刃部泛着幽蓝寒光，每一次挥舞都能透出凛冽的灵压。"
    },
    {
        id: "weapons_486",
        name: "名坊出品·制式雁翎刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 26, mag_atk: 26, crit: 11, speed: -6, sharpness: 66 },
        value: 21150,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "名坊流水线生成的顶级制式刀，工艺严丝合缝，能将内力与真元完美结合，倾泻而出。"
    }
];
const weapons_r3_batch7 = [
    // === 铍 (Bal 模组 | 系数: 1.20, 0.8, -0.8, 1.2 | Req: 6:0:4) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_487",
        name: "精铁制式长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 0, crit: 5, speed: -5, sharpness: 36 },
        value: 12825,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "城防守军最常见的长柄铍，铍头如短剑般修长，杆身采用坚固的杂木，适合在阵列中突刺。"
    },
    {
        id: "weapons_488",
        name: "包钢木杆铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 27, mag_atk: 9, crit: 5, speed: -5, sharpness: 36 },
        value: 12825,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "在硬木杆身包覆了防裂钢皮的长铍，铍尖刻有简单的回灵纹，是地方豪强护院的标配。"
    },
    {
        id: "weapons_489",
        name: "流云练手长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 18, crit: 5, speed: -5, sharpness: 36 },
        value: 12825,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "武馆中大量产出的长柄练习器，铍头轻薄，重心调校偏向法力传导，适合修习基础枪法。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_490",
        name: "百炼步卒长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 0, crit: 7, speed: -7, sharpness: 54 },
        value: 16335,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "军工坊督造的百炼钢铍，铍身挺直且弹性十足，能轻易刺穿厚实的鱼鳞甲。"
    },
    {
        id: "weapons_491",
        name: "符纹淬火铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 33, mag_atk: 11, crit: 7, speed: -7, sharpness: 54 },
        value: 16335,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "铍头经过符水淬火，表面留下了不规则的深色纹理，突刺时能产生细微的法力穿透力。"
    },
    {
        id: "weapons_492",
        name: "江湖客惯用长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 22, crit: 7, speed: -7, sharpness: 54 },
        value: 16335,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "经验丰富的江湖游侠偏爱的重型长兵，铍头设计兼顾了劈砍与突刺，法力流通平稳。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_493",
        name: "校尉督造陷阵铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 54, mag_atk: 0, crit: 10, speed: -10, sharpness: 72 },
        value: 20790,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "正规军校尉级别的实战精品，铍头硕大且极其锋利，是 R3 级别中长距离压制的利器。"
    },
    {
        id: "weapons_494",
        name: "寒铁嵌灵长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 40, mag_atk: 14, crit: 10, speed: -10, sharpness: 72 },
        value: 20790,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "铍尖部镶嵌了深山寒铁，挥舞间能产生阵阵寒芒，极大地提升了针对法力护罩的破坏力。"
    },
    {
        id: "weapons_495",
        name: "名坊出品·制式战铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 3,
        effects: { phy_atk: 27, mag_atk: 27, crit: 10, speed: -10, sharpness: 72 },
        value: 20790,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "出自知名铸造名坊的顶级制式品，铍身结构极其稳定，能将武者的内气毫无损耗地传导至尖端。"
    }
];
const weapons_r3_batch8 = [
    // === 矛 (Reach 模组 | 系数: 1.25, 0.8, -1.0, 1.2 | Req: 6:0:4) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_496",
        name: "精铁红缨矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 38, mag_atk: 0, crit: 5, speed: -6, sharpness: 36 },
        value: 13230,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "标准的军中步卒长矛，配有红缨以遮挡敌血流向杆身，矛头经过基础淬火，锐利耐用。"
    },
    {
        id: "weapons_497",
        name: "包铜练习长枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 28, mag_atk: 10, crit: 5, speed: -6, sharpness: 36 },
        value: 13230,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "在枪头连接处包有黄铜加固，并在矛尖刻有导灵槽，适合初步修习内气的士卒。"
    },
    {
        id: "weapons_498",
        name: "漆木杆通灵矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 19, mag_atk: 19, crit: 5, speed: -6, sharpness: 36 },
        value: 13230,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "武馆中常见的制式长矛，杆身涂有防腐黑漆，对灵力的传导十分稳定，是江湖新人的首选。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_499",
        name: "百炼白蜡战矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 46, mag_atk: 0, crit: 7, speed: -9, sharpness: 54 },
        value: 16605,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "选用上好白蜡木制杆，矛头经百炼精锻，具有极佳的弹性与突刺破坏力。"
    },
    {
        id: "weapons_500",
        name: "符文淬火刺穴矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 35, mag_atk: 11, crit: 7, speed: -9, sharpness: 54 },
        value: 16605,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "枪头经过微弱符咒加持，突刺时能产生极窄的法力流，专门针对护甲缝隙进行穿刺。"
    },
    {
        id: "weapons_501",
        name: "镖局特制护行矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 23, mag_atk: 23, crit: 7, speed: -9, sharpness: 54 },
        value: 16605,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "大镖局批量订制的护镖兵刃，用料考究，在物理震荡与灵力震慑间达到了完美的平衡。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_502",
        name: "校尉督造破阵矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 56, mag_atk: 0, crit: 10, speed: -12, sharpness: 72 },
        value: 21060,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "军中精锐使用的陷阵利器，矛头硕大且具有菱形放血槽，一击之下可破重甲。"
    },
    {
        id: "weapons_503",
        name: "寒铁尖流光矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 42, mag_atk: 14, crit: 10, speed: -12, sharpness: 72 },
        value: 21060,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "矛尖揉入寒铁，刺出时隐约有流光闪烁，对身披轻质法袍的修士极具威胁。"
    },
    {
        id: "weapons_504",
        name: "名坊出品·制式透甲枪",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 28, mag_atk: 28, crit: 10, speed: -12, sharpness: 72 },
        value: 21060,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "知名工坊流水线生产的顶级货色，矛头硬度与灵导性处于 R3 巅峰，法力灌注极快。"
    }
];
const weapons_r3_batch9 = [
    // === 戈 (Reach 模组 | 系数: 1.30, 0.7, -1.2, 0.9 | Req: 7:0:3) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_505",
        name: "精铁制式平戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 39, mag_atk: 0, crit: 4, speed: -7, sharpness: 27 },
        value: 12555,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "城防守军最常见的步战戈，戈头横向锋利，适合在混乱的战线中勾拽敌军。"
    },
    {
        id: "weapons_506",
        name: "包铜加固横戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 10, crit: 4, speed: -7, sharpness: 27 },
        value: 12555,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "在戈刃衔接处包覆了黄铜加固，并刻有简单的聚气槽，是护院保镖常用的制式长兵。"
    },
    {
        id: "weapons_507",
        name: "漆木杆演武戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 20, mag_atk: 20, crit: 4, speed: -7, sharpness: 27 },
        value: 12825,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "武馆大批量采购的教具，杆身经过漆面处理，对内气的传导十分平稳，适合新人修习基础勾法。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_508",
        name: "百炼精钢重戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 48, mag_atk: 0, crit: 6, speed: -11, sharpness: 41 },
        value: 15945,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "军工坊出品的百炼钢戈，戈头坚硬无比，能够轻易啄破普通的皮甲甚至轻型金属甲。"
    },
    {
        id: "weapons_509",
        name: "符纹淬火啄戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 12, crit: 6, speed: -11, sharpness: 41 },
        value: 15945,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "经过符咒淬火的戈刃，表面泛着淡淡的青光，勾击时能带起微弱的法力震荡。"
    },
    {
        id: "weapons_510",
        name: "江湖客常用长戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 24, crit: 6, speed: -11, sharpness: 41 },
        value: 15945,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "走江湖的长兵武者惯用的武器，兼顾了物理啄击力与灵力传导，是行走武林的可靠伙伴。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_511",
        name: "校尉督造陷阵戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 59, mag_atk: 0, crit: 8, speed: -14, sharpness: 54 },
        value: 19980,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "精锐营校尉定做的实战精品，戈头硕大且重心平衡，在 R3 级别中具备恐怖的横扫力量。"
    },
    {
        id: "weapons_512",
        name: "寒铁嵌锋重戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 15, crit: 8, speed: -14, sharpness: 54 },
        value: 19980,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "戈尖嵌入了寒铁碎矿，挥舞间能产生阵阵冷冽灵压，对依赖灵气护罩的敌人威胁极大。"
    },
    {
        id: "weapons_513",
        name: "名坊出品·制式锐戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 29, crit: 8, speed: -14, sharpness: 54 },
        value: 19710,
        req: { jing: 31, qi: 0, shen: 14 },
        desc: "出自知名铸造坊的顶级制式货色，整体材质严丝合缝，能将持有者的真元毫无损耗地传导至戈锋。"
    }
];
const weapons_r3_batch10 = [
    // === 戟 (Reach 模组 | 系数: 1.40, 0.6, -1.5, 1.1 | Req: 6:0:4) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_514",
        name: "精铁制式方天戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 42, mag_atk: 0, crit: 4, speed: -9, sharpness: 33 },
        value: 13275,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "标准的军用方天戟，双侧月牙刃设计对称，虽然用料普通，但胜在结构平衡，攻守兼备。"
    },
    {
        id: "weapons_515",
        name: "包钢加固青铜戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 32, mag_atk: 10, crit: 4, speed: -9, sharpness: 33 },
        value: 13275,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "在青铜戟尖包覆了薄钢层，并刻有聚气铭文，是地方豪强护院武者常用的标准长兵。"
    },
    {
        id: "weapons_516",
        name: "漆木杆演武戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 21, mag_atk: 21, crit: 4, speed: -9, sharpness: 33 },
        value: 13275,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "武馆中常见的高级教具，戟头轻量化处理，对真气的承载力平稳，适合新人修习劈刺技巧。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_517",
        name: "百炼步卒大戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 52, mag_atk: 0, crit: 5, speed: -14, sharpness: 50 },
        value: 16350,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "军工坊督造的百炼钢戟，矛尖锐利且月牙刃宽厚，一挥之下可轻易斩断敌军的长矛杆。"
    },
    {
        id: "weapons_518",
        name: "符文淬火月牙戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 39, mag_atk: 13, crit: 5, speed: -14, sharpness: 50 },
        value: 16350,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "戟刃经过符水淬火，泛着冷冽的青光，劈砍时能产生微弱的法力震荡，干扰敌人真气。"
    },
    {
        id: "weapons_519",
        name: "江湖客惯用战戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 26, mag_atk: 26, crit: 5, speed: -14, sharpness: 50 },
        value: 16350,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "经验丰富的长兵行家偏爱的重型武器，整体平衡性极佳，兼顾了物理冲击与灵力共鸣。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_520",
        name: "校尉督造陷阵戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 63, mag_atk: 0, crit: 7, speed: -18, sharpness: 66 },
        value: 20340,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "军中校尉亲自督造的杀伐利器，戟头沉重且边缘极度锋利，在 R3 级别中具备极致的压制力。"
    },
    {
        id: "weapons_521",
        name: "寒铁嵌灵青钢戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 47, mag_atk: 16, crit: 7, speed: -18, sharpness: 66 },
        value: 20340,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "月牙刃尖镶嵌了寒铁碎屑，挥动间寒气逼人，专门用于对抗拥有法力护甲的敌对目标。"
    },
    {
        id: "weapons_522",
        name: "名坊出品·制式虎戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 32, mag_atk: 31, crit: 7, speed: -18, sharpness: 66 },
        value: 20340,
        req: { jing: 27, qi: 0, shen: 18 },
        desc: "出自知名铸造名坊的批量代表作，法力流转顺滑如水，能将使用者的全力一击增幅至巅峰。"
    }
];
const weapons_r3_batch11 = [
    // === 长铩 (Reach 模组 | 系数: 1.45, 0.5, -1.8, 1.0 | Req: 8:0:2) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_523",
        name: "精铁制式长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 0, crit: 3, speed: -11, sharpness: 30 },
        value: 12915,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "标准的军用长铩，宽大的刃头经过简单淬火，是步战阵列中扫除敌兵的常用兵刃。"
    },
    {
        id: "weapons_524",
        name: "包钢加固铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 33, mag_atk: 11, crit: 3, speed: -11, sharpness: 30 },
        value: 12915,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "在硬木杆身包覆了铁皮加固的长铩，刃面刻有粗糙的聚气槽，适合天生神力的江湖武人。"
    },
    {
        id: "weapons_525",
        name: "流云演武重铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 22, crit: 3, speed: -11, sharpness: 30 },
        value: 12915,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "武馆中用于力量训练的制式铩，整体分量极重，对内气的传导表现较为平稳。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_526",
        name: "百炼精钢大铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 54, mag_atk: 0, crit: 5, speed: -16, sharpness: 45 },
        value: 16470,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "军工坊督造的精钢长铩，刃身如巨剑般宽阔，在正面冲撞中具备惊人的破坏力。"
    },
    {
        id: "weapons_527",
        name: "符纹淬火宽刃铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 41, mag_atk: 13, crit: 5, speed: -16, sharpness: 45 },
        value: 16470,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "经过简单淬灵处理的长铩，刃口泛着沉闷的暗色，扫击时能带起微弱的劲风压力。"
    },
    {
        id: "weapons_528",
        name: "江湖客定制重铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 27, mag_atk: 27, crit: 5, speed: -16, sharpness: 45 },
        value: 16470,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "经验丰富的江湖壮士定制的长兵，用料扎实，能将持用者的刚猛内劲转化为沉重的法力砸击。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_529",
        name: "校尉督造陷阵铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 65, mag_atk: 0, crit: 6, speed: -22, sharpness: 60 },
        value: 19620,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "精锐营校尉督造的实战精品，铩头沉重且边缘经过精细开刃，在 R3 级别中是力气活的巅峰。"
    },
    {
        id: "weapons_530",
        name: "寒铁嵌灵重铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 49, mag_atk: 16, crit: 6, speed: -22, sharpness: 60 },
        value: 19620,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "刃尖镶嵌了少许寒铁碎屑，挥舞间能产生阵阵寒芒，能有效对付敌方的法力护罩。"
    },
    {
        id: "weapons_531",
        name: "名坊出品·制式铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 3,
        effects: { phy_atk: 33, mag_atk: 32, crit: 6, speed: -22, sharpness: 60 },
        value: 19620,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "知名工坊流水线生产的高级长兵，结构极其紧固，能将使用者的每一分气力转化为致命伤害。"
    }
];
const weapons_r3_batch12 = [
    // === 钺 (Heavy 模组 | 系数: 1.60, 0.4, -2.2, 0.8 | Req: 9:0:1) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_532",
        name: "精铁处刑钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 48, mag_atk: 0, crit: 2, speed: -13, sharpness: 24 },
        value: 13005,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "刑部常见的执法大钺，钺身沉重，虽然灵活性较差，但其单纯的物理劈砍力已足够令人生畏。"
    },
    {
        id: "weapons_533",
        name: "包钢加固重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 12, crit: 2, speed: -13, sharpness: 24 },
        value: 13005,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "在厚木杆上加装了钢箍的长柄钺，钺刃刻有简易回气纹，是地方豪强镇压叛乱的利器。"
    },
    {
        id: "weapons_534",
        name: "流云练力钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 24, crit: 2, speed: -13, sharpness: 24 },
        value: 13005,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "武馆中专供横练武者练习气力的重器，法力传导中规中矩，主要用于磨练使用者的体魄。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_535",
        name: "百炼陷阵大钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 59, mag_atk: 0, crit: 4, speed: -20, sharpness: 36 },
        value: 16470,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "军工坊督造的精钢重钺，钺头宽大且脊部加重，一击之下足以劈碎最坚硬的木盾。"
    },
    {
        id: "weapons_536",
        name: "符纹淬火斩首钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 15, crit: 4, speed: -20, sharpness: 36 },
        value: 16470,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "经过简单淬灵处理的重钺，钺刃泛着幽幽冷光，劈砍时产生的气浪能压制敌方的真气流动。"
    },
    {
        id: "weapons_537",
        name: "江湖豪强定制钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 30, mag_atk: 30, crit: 4, speed: -20, sharpness: 36 },
        value: 16740,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "走刚猛路子的江湖成名武者定制的兵刃，用料极为扎实，法力与物理冲击力的结合非常紧密。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_538",
        name: "校尉督造威武钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 72, mag_atk: 0, crit: 5, speed: -26, sharpness: 48 },
        value: 20070,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "正规军重甲先锋使用的制式精品，刃口磨洗极锐，在 R3 级别中具备毁灭性的下砸破坏力。"
    },
    {
        id: "weapons_539",
        name: "寒铁嵌灵大钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 54, mag_atk: 18, crit: 5, speed: -26, sharpness: 48 },
        value: 20070,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "钺刃边缘揉入了寒铁砂，挥舞间能产生阵阵沉重的法力压迫，专门对付身负灵力防御的对手。"
    },
    {
        id: "weapons_540",
        name: "名坊出品·制式重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 36, crit: 5, speed: -26, sharpness: 48 },
        value: 20070,
        req: { jing: 41, qi: 0, shen: 4 },
        desc: "名坊流水线生成的顶级制式兵刃，结构平衡性在重武器中已臻化境，能最大限度转化持有者的蛮力。"
    }
];
const weapons_r3_batch13 = [
    // === 斧 (Heavy 模组 | 系数: 1.65, 0.3, -2.5, 0.9 | Req: 8:0:2) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_541",
        name: "精铁工兵斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 50, mag_atk: 0, crit: 2, speed: -15, sharpness: 27 },
        value: 13365,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "军中工兵常备的破障斧，钢材扎实，斧脊加厚，既能劈砍也能当作重锤使用。"
    },
    {
        id: "weapons_542",
        name: "包铜重战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 37, mag_atk: 13, crit: 2, speed: -15, sharpness: 27 },
        value: 13365,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "在硬木柄上包覆了黄铜加固的战斧，斧面刻有简单的导灵纹，能承受一定强度的真气爆发。"
    },
    {
        id: "weapons_543",
        name: "流云练手斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 25, mag_atk: 25, crit: 2, speed: -15, sharpness: 27 },
        value: 13365,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "武馆里常见的制式练习斧，重量分布均匀，法力传导稳定，适合初学者磨练劈山气劲。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_544",
        name: "步卒百炼战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 61, mag_atk: 0, crit: 3, speed: -23, sharpness: 41 },
        value: 16215,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "军工坊督造的制式大斧，斧刃经过反复折叠锻打，锋利程度足以切断敌阵的拒马。"
    },
    {
        id: "weapons_545",
        name: "符文淬火山岳斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 46, mag_atk: 15, crit: 3, speed: -23, sharpness: 41 },
        value: 16215,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "斧面刻有稳固符文的重型武器，劈砍时伴随着低沉的嗡鸣，能有效震散目标的防守真元。"
    },
    {
        id: "weapons_546",
        name: "江湖名坊砍山斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 31, mag_atk: 30, crit: 3, speed: -23, sharpness: 41 },
        value: 16215,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "出自知名铸造坊的批量兵刃，整体结构紧凑，物理杀伤与灵力响应在同类中表现优异。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_547",
        name: "校尉督造陷阵斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 74, mag_atk: 0, crit: 4, speed: -30, sharpness: 54 },
        value: 19710,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "军中陷阵营校尉配发的精良战斧，斧头极重，一挥之威可令数人莫敌，是 R3 级别的重力之魁。"
    },
    {
        id: "weapons_548",
        name: "寒铁尖流光斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 56, mag_atk: 18, crit: 4, speed: -30, sharpness: 54 },
        value: 19710,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "斧刃边缘镶嵌了少许寒铁，挥击时带起凛冽的寒意，能大幅削弱敌人的身体活性与灵气护甲。"
    },
    {
        id: "weapons_549",
        name: "名坊出品·制式重战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 37, mag_atk: 37, crit: 4, speed: -30, sharpness: 54 },
        value: 19710,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "名坊出品的顶级制式货，斧头与杆身的接合处使用了秘传工艺，使得法力倾泄顺畅无阻。"
    }
];
const weapons_r3_batch14 = [
    // === 椎 (Heavy 模组 | 系数: 1.85, 0.0, -3.5, 0.4 | Req: 10:0:0) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_550",
        name: "精铁制式重缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 56, mag_atk: 0, crit: 0, speed: -21, sharpness: 12 },
        value: 12645,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "步卒阵列中用来破坏敌方盾阵的精铁重锤，锤头实心打造，每一次挥击都势大力沉。"
    },
    {
        id: "weapons_551",
        name: "包钢圆木槌",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 42, mag_atk: 14, crit: 0, speed: -21, sharpness: 12 },
        value: 12645,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "在硬质檀木外包覆了厚钢片的重槌，内部刻有简单的震荡符纹，适合兼修气力的力士。"
    },
    {
        id: "weapons_552",
        name: "流云练功石缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 28, mag_atk: 28, crit: 0, speed: -21, sharpness: 12 },
        value: 12645,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "武馆中大批量产出的石制训练缒，虽然笨重，但对内气的容纳度极佳，法力传导稳健。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_553",
        name: "百炼铸铁瓜缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 68, mag_atk: 0, crit: 0, speed: -32, sharpness: 18 },
        value: 14580,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "军工坊督造的百炼铸铁锤，呈多瓣瓜棱形，能在砸击时将力量集中于一点，粉碎重甲。"
    },
    {
        id: "weapons_554",
        name: "符纹淬火八角锤",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 51, mag_atk: 17, crit: 0, speed: -32, sharpness: 18 },
        value: 14580,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "经过符术淬火处理的八角重锤，砸击地面时能产生微弱的法力余波，震慑周身敌人。"
    },
    {
        id: "weapons_555",
        name: "江湖名坊重铁缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 34, mag_atk: 34, crit: 0, speed: -32, sharpness: 18 },
        value: 14580,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "出自知名铸造名坊的平衡型重锤，不仅外形威猛，更能将使用者的蛮力与内劲完美融合。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_556",
        name: "校尉督造破阵缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 83, mag_atk: 0, crit: 0, speed: -42, sharpness: 24 },
        value: 17460,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "陷阵营校尉标配的纯钢巨锤，砸击力在 R3 级别中无出其右，是城门攻坚的绝对主力。"
    },
    {
        id: "weapons_557",
        name: "寒铁嵌灵重缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 62, mag_atk: 21, crit: 0, speed: -42, sharpness: 24 },
        value: 17460,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "缒头嵌入了深海寒铁，砸下时带起极其沉重的冷冽灵压，能直接击碎敌人的真元护盾。"
    },
    {
        id: "weapons_558",
        name: "名坊出品·制式博浪缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 42, mag_atk: 41, crit: 0, speed: -42, sharpness: 24 },
        value: 17460,
        req: { jing: 45, qi: 0, shen: 0 },
        desc: "名坊流水线生产的顶级货色，由于重心校准极佳，即便法力灌注极大，也依然能精准打击。"
    }
];
const weapons_r3_batch15 = [
    // === 殳 (Heavy 模组 | 系数: 1.55, 0.5, -2.0, 0.5 | Req: 8:0:2) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Sharp 30, Spd 6) ---
    {
        id: "weapons_559",
        name: "精铁六棱殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 47, mag_atk: 0, crit: 3, speed: -12, sharpness: 15 },
        value: 13140,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "军中常见的六棱铁殳，长柄末端配以厚重的钝头，足以敲碎一般的步卒头盔。"
    },
    {
        id: "weapons_560",
        name: "包钢加固重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 35, mag_atk: 12, crit: 3, speed: -12, sharpness: 15 },
        value: 13140,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "在硬质枣木上包覆了三层钢皮的制式长殳，头部刻有引灵纹路，适合修行刚猛内气的武者。"
    },
    {
        id: "weapons_561",
        name: "流云堂练习殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 23, mag_atk: 23, crit: 3, speed: -12, sharpness: 15 },
        value: 12870,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "武馆中大批量订购的重型木质练习器，杆身沉重，法力传导在钝击兵器中属于上乘。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Sharp 45, Spd 9) ---
    {
        id: "weapons_562",
        name: "百炼铸铁圆头殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 57, mag_atk: 0, crit: 5, speed: -18, sharpness: 23 },
        value: 16350,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "由军工坊经过百炼打制的重型长殳，头部呈圆球状，打击面积广，是重甲步兵的克星。"
    },
    {
        id: "weapons_563",
        name: "符纹淬火震击殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 43, mag_atk: 14, crit: 5, speed: -18, sharpness: 23 },
        value: 16350,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "殳头经过符水淬火，泛着沉闷的暗紫光泽，砸击时能引发微弱的法力震荡波。"
    },
    {
        id: "weapons_564",
        name: "江湖镖局巡哨殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 28, crit: 5, speed: -18, sharpness: 23 },
        value: 16350,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "大型镖局为守夜护卫配发的制式重兵，法力流通顺畅，非常适合作为防守反击之用。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Sharp 60, Spd 12) ---
    {
        id: "weapons_565",
        name: "校尉督造陷阵殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 70, mag_atk: 0, crit: 6, speed: -24, sharpness: 30 },
        value: 19800,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "军中精锐校尉督造的实战精品，殳头巨大且加重，在 R3 级别中拥有顶级的破甲冲击力。"
    },
    {
        id: "weapons_566",
        name: "寒铁嵌灵长殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 52, mag_atk: 17, crit: 6, speed: -24, sharpness: 30 },
        value: 19530,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "殳头顶部镶嵌了寒铁结晶，挥动间带起沉重的冷冽灵压，能直接震慑敌方的护体真气。"
    },
    {
        id: "weapons_567",
        name: "名坊出品·制式重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 3,
        effects: { phy_atk: 35, mag_atk: 34, crit: 6, speed: -24, sharpness: 30 },
        value: 19530,
        req: { jing: 36, qi: 0, shen: 9 },
        desc: "知名铸造名坊批量生产的顶级成品，结构极其稳定，能将全身气力与法力完美汇聚于一点。"
    }
];
const weapons_r3_batch16 = [
    // === 弩 (Range 模组 | 系数: 1.35, 1.0, -2.0, 0.0 | Req: 3:0:7) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Spd 6) ---
    {
        id: "weapons_568",
        name: "精铁制式手弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 41, mag_atk: 0, crit: 6, speed: -12, sharpness: 0 },
        value: 12690,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "州郡城防卫队标配的手弩，采用精铁机头，结构紧凑，适合在中近距离压制轻装敌军。"
    },
    {
        id: "weapons_569",
        name: "包铜加固木弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 31, mag_atk: 10, crit: 6, speed: -12, sharpness: 0 },
        value: 12690,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "在硬木弩臂上包覆了黄铜片，并在望山处刻有基础导灵纹，是江湖镖局常用的远程火器。"
    },
    {
        id: "weapons_570",
        name: "流云演武弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 21, mag_atk: 20, crit: 6, speed: -12, sharpness: 0 },
        value: 12690,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "武馆中大量采购的训练弩，结构简单可靠，弩弦拉力均匀，法力传导在制式弩中表现稳定。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Spd 9) ---
    {
        id: "weapons_571",
        name: "步卒百炼强弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 50, mag_atk: 0, crit: 9, speed: -18, sharpness: 0 },
        value: 15930,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "军工坊督造的百炼钢弩，拉力巨大，弩机经过多次调校，射程与杀伤力均优于普通手弩。"
    },
    {
        id: "weapons_572",
        name: "符纹淬火破甲弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 38, mag_atk: 12, crit: 9, speed: -18, sharpness: 0 },
        value: 15930,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "弩臂经过符咒淬火处理，发射出的箭矢能附带微弱的撕裂法力，对轻型法术护盾有较好穿透性。"
    },
    {
        id: "weapons_573",
        name: "江湖客惯用战弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 25, mag_atk: 25, crit: 9, speed: -18, sharpness: 0 },
        value: 15930,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "走南闯北的散修或刺客偏爱的中型弩，兼顾了箭矢的物理重量与使用者的灵力共鸣。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Spd 12) ---
    {
        id: "weapons_574",
        name: "校尉督造陷阵弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 61, mag_atk: 0, crit: 12, speed: -24, sharpness: 0 },
        value: 19710,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "军中校尉亲自督造的杀伐利器，弩臂极长且具有多层复合结构，一击之下可贯穿重甲。"
    },
    {
        id: "weapons_575",
        name: "寒铁嵌灵强弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 46, mag_atk: 15, crit: 12, speed: -24, sharpness: 0 },
        value: 19710,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "弩箭滑槽处镶嵌了寒铁结晶，射击时带起沉闷的法力波动，专门针对依赖灵力防御的对手。"
    },
    {
        id: "weapons_576",
        name: "名坊出品·制式神臂弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 31, mag_atk: 30, crit: 12, speed: -24, sharpness: 0 },
        value: 19710,
        req: { jing: 14, qi: 0, shen: 31 },
        desc: "出自知名铸造名坊的顶级制式成品，弩机极其灵敏，能最大限度转化持有者的神识引导力。"
    }
];
const weapons_r3_batch17 = [
    // === 弓 (Range 模组 | 系数: 1.05, 1.5, -0.5, 0.0 | Req: 5:0:5) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Spd 6) ---
    {
        id: "weapons_577",
        name: "精选桑木长弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 32, mag_atk: 0, crit: 9, speed: -3, sharpness: 0 },
        value: 13095,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "由正规军械库精选老桑木制成的长弓，弹性均匀，是边境守军步弓手的标准装备。"
    },
    {
        id: "weapons_578",
        name: "包铜加固弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 8, crit: 9, speed: -3, sharpness: 0 },
        value: 13095,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "在弓弰处包覆了薄铜以防裂，并在握柄处缠绕了浸灵丝线，是江湖镖客常用的随身弓。"
    },
    {
        id: "weapons_579",
        name: "流云练手角弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 16, mag_atk: 16, crit: 9, speed: -3, sharpness: 0 },
        value: 13095,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "武馆大批量订购的复合练习弓，弓身虽然偏重，但法力导向稳定，适合修习基础箭术。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Spd 9) ---
    {
        id: "weapons_580",
        name: "百炼拓木战弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 39, mag_atk: 0, crit: 14, speed: -5, sharpness: 0 },
        value: 17415,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "军中精锐射手使用的重拉力长弓，由名匠反复揉制，射出的箭矢破空声极大，极具威胁。"
    },
    {
        id: "weapons_581",
        name: "符纹淬灵短弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 10, crit: 14, speed: -5, sharpness: 0 },
        value: 17415,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "弓身刻有增强弹性的简易符文，能在拉弓时积聚少量法力，使箭矢带有穿透性的灵压。"
    },
    {
        id: "weapons_582",
        name: "江湖客定制拓弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 20, mag_atk: 19, crit: 14, speed: -5, sharpness: 0 },
        value: 17415,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "走江湖的成名猎手或散修惯用的武器，兼顾了弓身的坚韧程度与灵力共鸣的灵敏度。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Spd 12) ---
    {
        id: "weapons_583",
        name: "校尉督造陷阵大弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 47, mag_atk: 0, crit: 18, speed: -6, sharpness: 0 },
        value: 21600,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "军中骁骑校尉督造的重型战弓，采用多层兽筋复合，在 R3 级别中拥有极致的瞬间爆发力。"
    },
    {
        id: "weapons_584",
        name: "寒铁嵌灵角弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 35, mag_atk: 12, crit: 18, speed: -6, sharpness: 0 },
        value: 21600,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "弓胎中揉入了寒铁丝，拉弦时隐约有寒气流转，专门用于针对法力防御较强的对手。"
    },
    {
        id: "weapons_585",
        name: "名坊出品·制式虎筋弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 23, crit: 18, speed: -6, sharpness: 0 },
        value: 21600,
        req: { jing: 22, qi: 0, shen: 23 },
        desc: "知名铸造名坊的顶级货，其工艺在普通弓类中属于巅峰，能将射手的每一分真元转化为箭雨。"
    }
];
const weapons_r3_batch18 = [
    // === 飞剑 (Relic 模组 | 系数: 1.0, 1.2, +1.2, 1.3 | Req: 1:6:3) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_586",
        name: "精铁制式飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 30, mag_atk: 0, mag_crit: 7, speed: 7, penetration: 39 },
        value: 13995,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "修仙界最常见的精铁飞剑，通过简单的阵法加持即可御空，是散修和宗门杂役的首选。"
    },
    {
        id: "weapons_587",
        name: "青铜淬灵剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 8, mag_crit: 7, speed: 7, penetration: 39 },
        value: 13995,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "在青铜中揉入少量灵砂铸成，剑身泛着古朴的青光，法力传导性能稳定，足以应对常规战斗。"
    },
    {
        id: "weapons_588",
        name: "流云木心飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 15, mag_atk: 15, mag_crit: 7, speed: 7, penetration: 39 },
        value: 13995,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "选用百年桃木心打制的轻量级飞剑，重心平稳，对初学御剑术的弟子来说非常易于掌控。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_589",
        name: "百炼淬火飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 37, mag_atk: 0, mag_crit: 11, speed: 11, penetration: 58 },
        value: 19155,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "由炼器工坊大批量产出的钢剑，经过反复淬火，剑质坚硬，物理斩击力在同阶中相当可观。"
    },
    {
        id: "weapons_590",
        name: "符纹刻印剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 28, mag_atk: 9, mag_crit: 11, speed: 11, penetration: 58 },
        value: 19155,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "剑身上刻有完整的聚灵符纹，能有效减少御剑时的灵力损耗，是宗门外门弟子的常用装备。"
    },
    {
        id: "weapons_591",
        name: "江湖名坊法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 19, mag_crit: 11, speed: 11, penetration: 58 },
        value: 19155,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "出自民间著名炼器坊的代表作，法力与物理平衡性极佳，深受广大散修喜爱。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_592",
        name: "精锐执事飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 45, mag_atk: 0, mag_crit: 14, speed: 14, penetration: 78 },
        value: 23940,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "宗门执事级别的制式配剑，用料扎实，不仅御剑迅捷，近身格斗亦不输于凡铁兵刃。"
    },
    {
        id: "weapons_593",
        name: "寒铁灵光剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 34, mag_atk: 11, mag_crit: 14, speed: 14, penetration: 78 },
        value: 23940,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "加入了少量寒铁精矿，剑气冷冽，对付身披轻型皮甲的敌人有极佳的穿透效果。"
    },
    {
        id: "weapons_594",
        name: "内门选拔练习剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 23, mag_atk: 22, mag_crit: 14, speed: 14, penetration: 78 },
        value: 23940,
        req: { jing: 5, qi: 27, shen: 13 },
        desc: "为准备内门选拔的优秀弟子提供的制式飞剑，灵导率极高，能完美传导持有者的真元。"
    }
];
const weapons_r3_batch19 = [
    // === 法印 (Relic 模组 | 系数: 1.6, 0.5, -3.0, 1.1 | Req: 4:5:1) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_595",
        name: "精铁镇纸印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 48, mag_atk: 0, mag_crit: 3, speed: -18, penetration: 33 },
        value: 13140,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "由实心精铁铸造的方印，虽然法力平平，但胜在沉重，直接砸下亦有不俗的物理破坏力。"
    },
    {
        id: "weapons_596",
        name: "青铜淬灵印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 12, mag_crit: 3, speed: -18, penetration: 33 },
        value: 13140,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "在青铜胎体中注入了少量灵液，印底刻有基础的“重力”铭文，是各派弟子常见的入门法印。"
    },
    {
        id: "weapons_597",
        name: "流云练手石印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 24, mag_crit: 3, speed: -18, penetration: 33 },
        value: 13140,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "选用质地均匀的青石磨制，作为练习用具，其法力导向非常稳定，适合稳扎稳打的修士。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_598",
        name: "百炼铸铁山岳印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 59, mag_atk: 0, mag_crit: 4, speed: -27, penetration: 50 },
        value: 15945,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "军中随军法师常用的铁印，经过百炼成钢，印身坚固无比，专门用来强行砸开敌军盾阵。"
    },
    {
        id: "weapons_499", // 此处修正ID逻辑应为 599
        id: "weapons_599",
        name: "符纹镇灵法印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 15, mag_crit: 4, speed: -27, penetration: 50 },
        value: 15945,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "印身布满了标准的禁锢符纹，激发时能产生沉重的灵压，有效限制对手的移动与真元流转。"
    },
    {
        id: "weapons_600",
        name: "江湖名坊重元印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 30, mag_atk: 29, mag_crit: 4, speed: -27, penetration: 50 },
        value: 15945,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "出自著名炼器坊的制式成品，法力与物理冲击力平衡得极佳，是散修中颇具名气的实战法器。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_601",
        name: "内门执事覆地印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 72, mag_atk: 0, mag_crit: 6, speed: -36, penetration: 66 },
        value: 19800,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "宗门内门执事级别的标配重印，通体由黑铁精母打造，每一次砸击都伴随着山崩地裂之势。"
    },
    {
        id: "weapons_602",
        name: "寒铁浸蓝封神印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 54, mag_atk: 18, mag_crit: 6, speed: -36, penetration: 66 },
        value: 19800,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "加入了寒铁矿脉的核心料，印面泛着冷冽蓝光，对灵力防护较强的对手有极佳的破防效果。"
    },
    {
        id: "weapons_603",
        name: "名坊出品·制式玄武印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 36, mag_crit: 6, speed: -36, penetration: 66 },
        value: 19800,
        req: { jing: 18, qi: 23, shen: 4 },
        desc: "名坊流水线出的顶级制式货，结构稳定至极，能完美承载并放大修士灌注的厚重真元。"
    }
];
const weapons_r3_batch20 = [
    // === 宝葫芦 (Relic 模组 | 系数: 0.95, 1.0, 0.0, 1.4 | Req: 2:7:1) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_604",
        name: "精铁胎木葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 0, mag_crit: 6, speed: 0, penetration: 42 },
        value: 12330,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "在厚实的木葫芦内层加装了铁胎，增加了其物理强度，是江湖游医常用的耐用款。"
    },
    {
        id: "weapons_605",
        name: "浸灵朱漆葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 7, mag_crit: 6, speed: 0, penetration: 42 },
        value: 12330,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "表面涂有一层掺了朱砂的灵漆，能有效防止法力外泄，法力传导性能中规中矩。"
    },
    {
        id: "weapons_606",
        name: "流云堂常用药葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 14, mag_atk: 14, mag_crit: 6, speed: 0, penetration: 42 },
        value: 12060,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "武馆常用的弟子配给品，虽然材质普通，但容纳真气的效率极其平稳。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_607",
        name: "百炼铸铁重葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 35, mag_atk: 0, mag_crit: 9, speed: 0, penetration: 63 },
        value: 16200,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "由重工坊铸造的生铁葫芦，外壳异常坚硬，不仅能喷吐气劲，关键时刻亦可作钝器挥砸。"
    },
    {
        id: "weapons_608",
        name: "符纹聚气葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 26, mag_atk: 9, mag_crit: 9, speed: 0, penetration: 63 },
        value: 16200,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "葫芦身刻有一圈完整的聚气符文，极大提升了对天地灵气的转化率，是宗门外门弟子的首选。"
    },
    {
        id: "weapons_609",
        name: "江湖客惯用灵葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 18, mag_crit: 9, speed: 0, penetration: 63 },
        value: 16470,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "经验丰富的散修常用的葫芦，材质厚实且导气顺畅，在应对不同真气属性时表现均衡。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_610",
        name: "校尉督造铁胎战葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 43, mag_atk: 0, mag_crit: 12, speed: 0, penetration: 84 },
        value: 20610,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "军中特制，用于储存爆裂性质的法力，在 R3 级别中拥有顶级的物理防御与反震性能。"
    },
    {
        id: "weapons_611",
        name: "寒铁嵌纹灵液葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 32, mag_atk: 11, mag_crit: 12, speed: 0, penetration: 84 },
        value: 20610,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "嵌入了微量寒铁丝以稳固结构，出气时带有一丝冷冽之意，能显著降低目标的法力活性。"
    },
    {
        id: "weapons_612",
        name: "名坊出品·制式紫金葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 21, mag_atk: 21, mag_crit: 12, speed: 0, penetration: 84 },
        value: 20340,
        req: { jing: 9, qi: 31, shen: 5 },
        desc: "由知名坊市大批量产的精品，外涂金漆内含灵脉，对修士真元的转化率在制式品中堪称巅峰。"
    }
];
const weapons_r3_batch21 = [
    // === 阵盘 (Relic 模组 | 系数: 1.1, 1.4, -1.5, 1.9 | Req: 1:4:5) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_613",
        name: "精铁边框方盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 33, mag_atk: 0, mag_crit: 8, speed: -9, penetration: 57 },
        value: 13725,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "在厚石盘边缘加装了精铁框，极大增强了物理抗性，是边境营哨常见的耐用型阵基。"
    },
    {
        id: "weapons_614",
        name: "包铜导灵阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 25, mag_atk: 8, mag_crit: 8, speed: -9, penetration: 57 },
        value: 13725,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "在木质盘面上包覆了导灵铜箔，刻有基础的五行转换回路，法力传导性能中规中矩。"
    },
    {
        id: "weapons_615",
        name: "流云制式练手盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 17, mag_atk: 16, mag_crit: 8, speed: -9, penetration: 57 },
        value: 13725,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "武馆及宗门外门大量采购的教学具，盘面刻线清晰，法力在各阵脚间的流转十分平均。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_616",
        name: "百炼青钢阵基",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 41, mag_atk: 0, mag_crit: 13, speed: -14, sharpness: 86 },
        value: 18780,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "军工坊督造的重型阵盘，采用百炼青钢压制，在激烈的斗法中不易因外力冲击而位移。"
    },
    {
        id: "weapons_617",
        name: "符纹淬灵石盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 31, mag_atk: 10, mag_crit: 13, speed: -14, penetration: 86 },
        value: 18780,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "经过灵符淬火处理的石盘，表面隐现流光，能大幅度提升阵法覆盖范围内的灵气浓度。"
    },
    {
        id: "weapons_618",
        name: "江湖客惯用圆阵",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 20, mag_atk: 20, mag_crit: 13, speed: -14, penetration: 86 },
        value: 18510,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "经验丰富的江湖阵法师常用的折叠式圆盘，兼顾了携带的便利性与灵力输入的稳定性。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_619",
        name: "校尉督造陷阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 50, mag_atk: 0, mag_crit: 17, speed: -18, penetration: 114 },
        value: 23670,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "军中校尉标配，用于在冲阵时快速建立临时防御屏障，物理防御与冲击能力在 R3 中名列前茅。"
    },
    {
        id: "weapons_620",
        name: "寒铁嵌灵大阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 37, mag_atk: 12, mag_crit: 17, speed: -18, penetration: 114 },
        value: 23400,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "关键阵眼处嵌有寒铁矿心，能有效传导并放大冰寒或重力系的法力效果，极具穿透力。"
    },
    {
        id: "weapons_621",
        name: "名坊出品·制式太极盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 25, mag_atk: 25, mag_crit: 17, speed: -18, penetration: 114 },
        value: 23670,
        req: { jing: 5, qi: 18, shen: 22 },
        desc: "名坊流水线生成的顶级制式阵法法具，平衡性极其出色，即便在混乱真气中也能保持稳定。"
    }
];
const weapons_r3_batch22 = [
    // === 灵镜 (Relic 模组 | 系数: 1.2, 1.8, -0.5, 0.9 | Req: 1:3:6) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_622",
        name: "精铁护心灵镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 0, mag_crit: 11, speed: -3, penetration: 27 },
        value: 16065,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "在军中广泛装备的厚实铁镜，原本用于护心，后经加持可反射微弱灵光，物理撞击力极强。"
    },
    {
        id: "weapons_623",
        name: "包铜青石镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 27, mag_atk: 9, mag_crit: 11, speed: -3, penetration: 27 },
        value: 16065,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "以平滑青石为底，包覆了一层抛光铜膜，法力传导中规中矩，是江湖散修常见的法器。"
    },
    {
        id: "weapons_624",
        name: "流云堂练习镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 18, mag_crit: 11, speed: -3, penetration: 27 },
        value: 16065,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "武馆及宗门外门大量采购的教学法宝，镜面清晰，灵力在镜面上的反射路径极其规律。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_625",
        name: "百炼青钢照妖镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 0, mag_crit: 16, speed: -5, penetration: 41 },
        value: 21075,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "军工坊督造的制式照妖镜，采用百炼钢精磨，虽然法力平平，但对邪祟气息的反射非常敏感。"
    },
    {
        id: "weapons_626",
        name: "符纹淬灵圆镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 33, mag_atk: 11, mag_crit: 16, speed: -5, penetration: 41 },
        value: 21075,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "镜背刻有聚灵符文的黄铜镜，镜面经过灵泉淬火，反射出的光束带有显著的法力灼烧感。"
    },
    {
        id: "weapons_627",
        name: "江湖客惯用灵鉴",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 22, mag_crit: 16, speed: -5, penetration: 41 },
        value: 21075,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "经验丰富的江湖术士随身携带的灵镜，材质均匀，在防御与辅助施法间有极佳的平衡。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_628",
        name: "内门执事通玄镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 54, mag_atk: 0, mag_crit: 22, speed: -6, penetration: 54 },
        value: 27270,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "宗门内门执事标配，镜框加重以备近战，镜面反射的物理冲击力在 R3 级别中堪称顶尖。"
    },
    {
        id: "weapons_629",
        name: "寒铁嵌纹照影镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 41, mag_atk: 13, mag_crit: 22, speed: -6, penetration: 54 },
        value: 27270,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "镜缘嵌入了少许寒铁，能让反射出的灵光带有迟缓敌人的冷冽寒意，法力穿透性极佳。"
    },
    {
        id: "weapons_630",
        name: "名坊出品·制式乾坤镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 27, mag_atk: 27, mag_crit: 22, speed: -6, penetration: 54 },
        value: 27270,
        req: { jing: 5, qi: 13, shen: 27 },
        desc: "名坊流水线出的顶级制式灵镜，镜面由整块水系灵玉切削磨制，真元流转毫无滞涩。"
    }
];
const weapons_r3_batch23 = [
    // === 长幡 (Relic 模组 | 系数: 1.3, 0.8, -1.2, 1.2 | Req: 2:7:1) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_631",
        name: "精铁柄制式长幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 39, mag_atk: 0, mag_crit: 5, speed: -7, penetration: 36 },
        value: 13365,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "军中随军祭司使用的长幡，采用实心精铁为杆，幡面厚重，在大规模混战中亦可作为短矛攒刺。"
    },
    {
        id: "weapons_632",
        name: "包铜导灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 10, mag_crit: 5, speed: -7, penetration: 36 },
        value: 13365,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "在木杆顶端包覆了黄铜以增幅灵压，旗面绘有基础的聚气图阵，是江湖游方道士常见的行头。"
    },
    {
        id: "weapons_633",
        name: "流云练手经幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 20, mag_atk: 19, mag_crit: 5, speed: -7, penetration: 36 },
        value: 13365,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "武馆中大量采购的教学法宝，幡布采用了耐磨的粗麻，法力在幡面纹路中的流转十分规整。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_634",
        name: "百炼青钢招魂幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 48, mag_atk: 0, mag_crit: 7, speed: -11, penetration: 54 },
        value: 16875,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "由正规炼器坊打制的重型法幡，杆身极重且幡尖锐利，物理打击感在法宝中属于异类。"
    },
    {
        id: "weapons_635",
        name: "符纹淬灵摄魂旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 36, mag_atk: 12, mag_crit: 7, speed: -11, penetration: 54 },
        value: 16875,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "幡面经过灵泉淬火工艺处理，呈现出淡淡的紫色，挥动间能带起阵阵阴柔的法力气浪。"
    },
    {
        id: "weapons_636",
        name: "江湖名坊宣法幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 24, mag_crit: 7, speed: -11, penetration: 54 },
        value: 16875,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "出自名家之手的批量精品，整体材质匀称，能将持有者的内气毫无损耗地转化为大范围的法力覆盖。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_637",
        name: "内门执事荡魔幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 59, mag_atk: 0, mag_crit: 10, speed: -14, penetration: 72 },
        value: 21600,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "宗门内门执事下山除魔时的标配，杆身由乌金木制成，即便面对妖兽的强力撞击也不会折断。"
    },
    {
        id: "weapons_638",
        name: "寒铁嵌纹聚灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 44, mag_atk: 15, mag_crit: 10, speed: -14, penetration: 72 },
        value: 21600,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "幡杆顶部的装饰中嵌入了寒铁矿芯，极大提升了法力的穿透力，挥舞间冷冽之气逼人。"
    },
    {
        id: "weapons_639",
        name: "名坊出品·制式混元幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 29, mag_crit: 10, speed: -14, penetration: 72 },
        value: 21330,
        req: { jing: 9, qi: 32, shen: 4 },
        desc: "名坊流水线出的顶级成品，幡面丝线掺杂了细微的灵石碎屑，法力爆发力在 R3 级别中冠绝全系。"
    }
];
const weapons_r3_batch24 = [
    // === 玉佩 (Relic 模组 | 系数: 0.65, 2.2, +2.5, 0.8 | Req: 0:4:6) ===

    // --- [低数值] (基准: Atk 30, Crit 6, Pen 30, Spd 6) ---
    {
        id: "weapons_640",
        name: "精雕白玉玦",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 20, mag_atk: 0, mag_crit: 13, speed: 15, penetration: 24 },
        value: 15165,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "选材普通的白玉玦，由于采用了标准的打磨工艺，即便没有法力加持，作为暗器投掷也颇具准头。"
    },
    {
        id: "weapons_641",
        name: "青铜护边玉佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 15, mag_atk: 5, mag_crit: 13, speed: 15, penetration: 24 },
        value: 15165,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "在灵玉边缘镶嵌了薄青铜以防磕碰，印有基础的聚气铭文，是江湖修仙家族常见的传家小件。"
    },
    {
        id: "weapons_642",
        name: "流云堂制式佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 10, mag_atk: 10, mag_crit: 13, speed: 15, penetration: 24 },
        value: 15165,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "武馆大批量发放的身份凭证，虽然材质匀称度一般，但胜在法力传导极为顺滑，毫无阻塞感。"
    },

    // --- [中数值] (基准: Atk 37, Crit 9, Pen 45, Spd 9) ---
    {
        id: "weapons_643",
        name: "百炼淬火铁胎玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 24, mag_atk: 0, mag_crit: 20, speed: 23, penetration: 36 },
        value: 21465,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "在灵玉内部嵌入了精钢铁胎，赋予了其异乎寻常的重量与硬度，物理碰撞力远超普通玉佩。"
    },
    {
        id: "weapons_644",
        name: "符纹淬灵紫髓佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 18, mag_atk: 6, mag_crit: 20, speed: 23, penetration: 36 },
        value: 21465,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "由蕴含紫髓的玉石雕琢，并在内部镂刻了连锁引灵阵，能在瞬间爆发极高的法力暴击。"
    },
    {
        id: "weapons_645",
        name: "江湖名坊通灵佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 12, mag_atk: 12, mag_crit: 20, speed: 23, penetration: 36 },
        value: 21465,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "出自民间著名炼器坊的制式成品，灵性十足，能根据持有者的真气属性自我调节频率，极为好用。"
    },

    // --- [高数值] (基准: Atk 45, Crit 12, Pen 60, Spd 12) ---
    {
        id: "weapons_646",
        name: "内门执事龙纹佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 29, mag_atk: 0, mag_crit: 26, speed: 30, penetration: 48 },
        value: 27360,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "宗门内门执事配发的精品，玉质极其致密，御空速度极快，是 R3 级别中顶级的灵巧法器。"
    },
    {
        id: "weapons_647",
        name: "寒铁嵌纹凝神玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 22, mag_atk: 7, mag_crit: 26, speed: 30, penetration: 48 },
        value: 27360,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "嵌入了微量寒铁丝以稳固灵压，佩戴时能让人心神宁静，射出的法力射线带有明显的透甲效果。"
    },
    {
        id: "weapons_648",
        name: "名坊出品·制式太极玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 3,
        effects: { phy_atk: 15, mag_atk: 14, mag_crit: 26, speed: 30, penetration: 48 },
        value: 27360,
        req: { jing: 0, qi: 18, shen: 27 },
        desc: "名坊流水线生成的顶级货色，材质近乎透明无杂质，对修士的神识反馈极快，爆发力惊人。"
    }
];
const weapons_r4_batch1 = [
    // === 匕 (Agile 模组 | 系数: 0.5, 2.5, +2.0, 1.2 | Req 配比 2:0:8) ===
    // Total_Req 60 -> 精 12 / 气 0 / 神 48

    {
        id: "weapons_649",
        name: "冷月玄铁匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 20, mag_atk: 0, crit: 20, speed: 16, sharpness: 48 },
        value: 26400,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "采用深山玄铁经七七四十九日锻打而成，刃面隐现冷月华光，是江湖成名刺客的钟爱之物。"
    },
    {
        id: "weapons_650",
        name: "青花流萤短刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 15, mag_atk: 5, crit: 20, speed: 16, sharpness: 48 },
        value: 26400,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "名家打造的艺术品，不仅外形优雅，刃部更淬有灵萤粉，挥舞间能带起细碎的星火，干扰敌方视线。"
    },
    {
        id: "weapons_651",
        name: "凝霜真元匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 10, mag_atk: 10, crit: 20, speed: 16, sharpness: 48 },
        value: 26400,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "剑身通体透明如霜，对真气的传导几乎毫无阻力，常被内门精英弟子用作贴身护命兵刃。"
    },
    {
        id: "weapons_652",
        name: "破风百炼刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 25, mag_atk: 0, crit: 30, speed: 24, sharpness: 72 },
        value: 37800,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "军中精锐暗哨的顶级装备，三棱结构极易放血，刃尖经过特殊风磨工艺，刺出时悄无声息。"
    },
    {
        id: "weapons_653",
        name: "赤练淬灵刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 19, mag_atk: 6, crit: 30, speed: 24, sharpness: 72 },
        value: 37800,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "采用赤铁精矿淬炼，刃口带有灼热感，能轻易切开寻常士卒的皮甲并灼烧伤口，是成名游侠的利器。"
    },
    {
        id: "weapons_654",
        name: "紫气东来短剑",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 12, mag_atk: 13, crit: 30, speed: 24, sharpness: 72 },
        value: 37800,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "剑柄镶嵌有东海紫髓，法力流通感极佳，挥动时隐隐有紫气缭绕，乃是名门望族的随身佩兵。"
    },
    {
        id: "weapons_655",
        name: "断金乌钢匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 0, crit: 40, speed: 32, sharpness: 96 },
        value: 49200,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "R4级别中的极品，以极沉的乌钢精炼，虽轻薄却有断金削铁之能，军中偏将亦难得一见。"
    },
    {
        id: "weapons_656",
        name: "惊雷瞬闪刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 22, mag_atk: 8, crit: 40, speed: 32, sharpness: 96 },
        value: 49200,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "刃身刻有雷鸣阵纹，极速挥动时会产生细微的电弧，对敌方神识产生震慑，法穿极高。"
    },
    {
        id: "weapons_657",
        name: "名坊·秋水无痕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 15, mag_atk: 15, crit: 40, speed: 32, sharpness: 96 },
        value: 49200,
        req: { jing: 12, qi: 0, shen: 48 },
        desc: "名动江湖的“秋水”系列，剑身薄如蝉翼，能完美契合使用者的每一丝法力波动。"
    },

    // === 手戟 (Agile 模组 | 系数: 0.7, 1.6, +1.2, 1.0 | Req 配比 4:0:6) ===
    // Total_Req 60 -> 精 24 / 气 0 / 神 36

    {
        id: "weapons_658",
        name: "校尉镇岳手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 28, mag_atk: 0, crit: 13, speed: 10, sharpness: 40 },
        value: 22840,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "军中校尉的成名武具，戟头采用特殊的重击结构，在钩锁敌兵器时能轻易崩断凡铁。"
    },
    {
        id: "weapons_659",
        name: "碧波纹钢戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 21, mag_atk: 7, crit: 13, speed: 10, sharpness: 40 },
        value: 22840,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "在纹铁中掺入碧海灵砂，戟身泛着水色涟漪，挥舞时能产生层叠的柔劲，化解敌方攻势。"
    },
    {
        id: "weapons_660",
        name: "流云堂真传手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 14, mag_atk: 14, crit: 13, speed: 10, sharpness: 40 },
        value: 22840,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "流云堂内门弟子使用的平衡型武器，灵导性远超外门制式品，手感轻盈且劲力穿透性佳。"
    },
    {
        id: "weapons_661",
        name: "裂石精钢手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 35, mag_atk: 0, crit: 19, speed: 14, sharpness: 60 },
        value: 31200,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "由江湖名匠“裂石者”打造，戟尖异常锐利，能够轻易破开普通铁甲的防御，是战场冲阵利器。"
    },
    {
        id: "weapons_662",
        name: "雷痕淬灵短戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 26, mag_atk: 9, crit: 19, speed: 14, sharpness: 60 },
        value: 31200,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "引雷雨后的闪电淬火而成，戟身上留有永久的焦灼雷纹，对法力护罩有极佳的穿透力。"
    },
    {
        id: "weapons_663",
        name: "逍遥游侠小戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 17, mag_atk: 18, crit: 19, speed: 14, sharpness: 60 },
        value: 31200,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "深受江湖名宿喜爱的多功能小戟，材质极佳，不仅能近身缠斗，亦能承载极强的内劲爆发。"
    },
    {
        id: "weapons_664",
        name: "将军令·斩将戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 42, mag_atk: 0, crit: 26, speed: 19, sharpness: 80 },
        value: 40460,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "军中上层将领赐下的赏赐品，采用百炼寒钢制作，是无数前线士卒梦寐以求的成名之证。"
    },
    {
        id: "weapons_665",
        name: "玄晶嵌纹法戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 31, mag_atk: 11, crit: 26, speed: 19, sharpness: 80 },
        value: 40460,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "镶嵌了完整玄晶碎片的极品手戟，挥舞时能产生沉重的法力灵压，专克修士的真元护甲。"
    },
    {
        id: "weapons_666",
        name: "名坊·百战不殆",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 21, mag_atk: 21, crit: 26, speed: 19, sharpness: 80 },
        value: 40460,
        req: { jing: 24, qi: 0, shen: 36 },
        desc: "名家铸造坊的抗鼎之作，将物理抗震与法力传导发挥到极致，经受过无数次实战验证。"
    }
];
const weapons_r4_batch2 = [
    // === 吴钩 (Agile 模组 | 系数: 0.75, 1.4, +0.8, 1.1 | Req 配比 5:0:5) ===
    // Total_Req 60 -> 精 30 / 气 0 / 神 30

    {
        id: "weapons_667",
        name: "冷月清辉钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 0, crit: 11, speed: 6, sharpness: 44 },
        value: 21560,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "刃如弯月，通体呈冷白色，采用了罕见的银母精炼，挥舞时快若闪电，是江湖成名刀客的利刃。"
    },
    {
        id: "weapons_668",
        name: "灵蛇吐信钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 23, mag_atk: 7, crit: 11, speed: 6, sharpness: 44 },
        value: 21560,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "在钩尖处淬有微量的剧毒，且柄部嵌入了导灵玉，不仅钩锁精准，更带有诡异的法力波波。"
    },
    {
        id: "weapons_669",
        name: "流云真传曲刃",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 15, mag_atk: 15, crit: 11, speed: 6, sharpness: 44 },
        value: 21560,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "由名门正派流云堂嫡传弟子配发的长兵，材质极其通透，物理劈砍与真气传导完美平衡。"
    },
    {
        id: "weapons_670",
        name: "断魂精钢钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 38, mag_atk: 0, crit: 17, speed: 10, sharpness: 66 },
        value: 30360,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "军中精锐斥候队长常用的兵器，经过千锤百炼，刃口带有细小的倒钩，极难防备。"
    },
    {
        id: "weapons_671",
        name: "炎晶淬火钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 28, mag_atk: 10, crit: 17, speed: 10, sharpness: 66 },
        value: 30360,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "采用炎热地脉产出的矿石淬火，钩身常温下亦隐隐发烫，破除土系防御法术有奇效。"
    },
    {
        id: "weapons_672",
        name: "江湖游侠成名钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 19, mag_atk: 19, crit: 17, speed: 10, sharpness: 66 },
        value: 30360,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "曾由多位成名游侠持用的钩刃，历经无数实战而不卷刃，是 R4 级别中的佼佼者。"
    },
    {
        id: "weapons_673",
        name: "校尉督造斩风钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 45, mag_atk: 0, crit: 22, speed: 13, sharpness: 88 },
        value: 37900,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "军中校尉定做的杀伐之器，刃口磨洗极锐，能轻易切开轻骑兵的连环锁子甲。"
    },
    {
        id: "weapons_674",
        name: "寒铁灵犀钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 34, mag_atk: 11, crit: 22, speed: 13, sharpness: 88 },
        value: 37900,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "刃缘处镶嵌了寒铁结晶，每一次勾击都能带起冷冽的灵压，极大迟滞敌人的血气运行。"
    },
    {
        id: "weapons_675",
        name: "名坊·万象生辉",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 23, mag_atk: 22, crit: 22, speed: 13, sharpness: 88 },
        value: 37900,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "名家坊市的镇店之作，整体结构严丝合缝，能将使用者的每一丝法力化作致命的弧光。"
    },

    // === 奇门 (Agile 模组 | 系数: 0.6, 2.0, +1.5, 0.8 | Req 配比 3:0:7) ===
    // Total_Req 60 -> 精 18 / 气 0 / 神 42

    {
        id: "weapons_676",
        name: "紫檀金丝九节鞭",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 24, mag_atk: 0, crit: 16, speed: 12, sharpness: 32 },
        value: 23600,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "由沉重的紫檀木芯嵌金丝制成，每一节都暗藏玄机，挥动间虎虎生风，威力惊人。"
    },
    {
        id: "weapons_677",
        name: "流云暗香扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 18, mag_atk: 6, crit: 16, speed: 12, sharpness: 32 },
        value: 23600,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "扇骨由精钢打造，扇面则绘有复杂的迷幻阵纹，虚虚实实，令对手难以捉摸其轨迹。"
    },
    {
        id: "weapons_678",
        name: "精铁通灵响算盘",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 12, mag_atk: 12, crit: 16, speed: 12, sharpness: 32 },
        value: 23600,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "江湖算计高手的随身物，算珠皆由导灵石磨制，不仅能计算账目，更是杀人于无形的法器。"
    },
    {
        id: "weapons_679",
        name: "追魂索命锁镰",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 0, crit: 24, speed: 18, sharpness: 48 },
        value: 33240,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "成名捕头或高级刺客的专属，链长一丈，刃薄如翼，一旦锁住敌方兵刃便绝难脱身。"
    },
    {
        id: "weapons_680",
        name: "雷音八角震魂锤",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 23, mag_atk: 7, crit: 24, speed: 18, sharpness: 48 },
        value: 33240,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "锤头内部空心并装有震波符咒，击中目标时会发出沉闷雷音，直接震慑敌方心神。"
    },
    {
        id: "weapons_681",
        name: "名坊出品·点穴笔",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 15, mag_atk: 15, crit: 24, speed: 18, sharpness: 48 },
        value: 33240,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "出自著名奇门工坊，笔尖采用极其罕见的透骨钢，能将法力高度凝聚成一点爆发。"
    },
    {
        id: "weapons_682",
        name: "绝命飞爪·掠影",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 36, mag_atk: 0, crit: 32, speed: 24, sharpness: 64 },
        value: 42880,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "军中特等死士配发的攀爬及截杀利器，五爪由黑钢铸造，张合间能撕裂重型盾牌。"
    },
    {
        id: "weapons_683",
        name: "玄晶嵌纹百变伞",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 27, mag_atk: 9, crit: 32, speed: 24, sharpness: 64 },
        value: 42880,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "伞骨镶嵌了多枚玄晶，不仅防御力惊人，更能作为法力喷射的媒介，攻防一体，极为罕见。"
    },
    {
        id: "weapons_684",
        name: "千机阁·无影轮",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 4,
        effects: { phy_atk: 18, mag_atk: 18, crit: 32, speed: 24, sharpness: 64 },
        value: 42880,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "千机阁出品的顶级奇门，轮周布满暗刃，法力驱动下旋转如飞，是 R4 中的巅峰工艺。"
    }
];
const weapons_r4_batch3 = [
    // === 剑 (Bal 模组 | 系数: 1.0, 1.1, 0.0, 1.0 | Req 配比 5:0:5) ===
    // Total_Req 60 -> 精 30 / 气 0 / 神 30

    {
        id: "weapons_685",
        name: "霜华百炼长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 40, mag_atk: 0, crit: 9, speed: 0, sharpness: 40 },
        value: 22480,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "江湖名家打造，剑身经霜雪淬火，色泽如冰，乃是成名侠士行走武林的身份象征。"
    },
    {
        id: "weapons_686",
        name: "青虹贯日剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 10, crit: 9, speed: 0, sharpness: 40 },
        value: 22480,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "剑脊嵌入了赤铜丝，挥动时隐约有虹光流转，法力在剑尖凝聚极快，破甲力不俗。"
    },
    {
        id: "weapons_687",
        name: "流云真传宗门剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 20, mag_atk: 20, crit: 9, speed: 0, sharpness: 40 },
        value: 22480,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "流云宗嫡传弟子所使，采用灵纹钢铸造，物理与真气适配性达到绝佳的平衡。"
    },
    {
        id: "weapons_688",
        name: "沉钢玄影剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 0, crit: 13, speed: 0, sharpness: 60 },
        value: 29760,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "军中校尉级统领的佩剑，选用黑沉钢锻造，势大力沉却不失剑器灵巧，能生生震断凡铁。"
    },
    {
        id: "weapons_689",
        name: "符光淬影剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 38, mag_atk: 12, crit: 13, speed: 0, sharpness: 60 },
        value: 29760,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "名坊大师在剑身刻下微型聚灵阵，激发时剑气带起阵阵波纹，专克外家硬功。"
    },
    {
        id: "weapons_690",
        name: "玉虚堂制式宝剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 25, mag_atk: 25, crit: 13, speed: 0, sharpness: 60 },
        value: 29760,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "道门玉虚堂出品，虽为制式但工艺极其严苛，灵气流转极顺，深受江湖俊杰追捧。"
    },
    {
        id: "weapons_691",
        name: "龙渊百战利剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 60, mag_atk: 0, crit: 18, speed: 0, sharpness: 80 },
        value: 37760,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "R4级别剑器巅峰，剑刃磨至吹毛断发，纵是军中重甲在其面前也薄如蝉翼。"
    },
    {
        id: "weapons_692",
        name: "紫电裂空锋",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 45, mag_atk: 15, crit: 18, speed: 0, sharpness: 80 },
        value: 37760,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "剑中揉入雷击枣木碎片，法力催动下电光隐现，对一切阴戾真气有极强的克制力。"
    },
    {
        id: "weapons_693",
        name: "名坊出品·清风徐来",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 30, crit: 18, speed: 0, sharpness: 80 },
        value: 37760,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "名铸剑坊的得意作，不仅是一件兵器，更是内气修行的极佳引导物，极具成名价值。"
    },

    // === 刀 (Bal 模组 | 系数: 1.15, 0.9, -0.5, 1.1 | Req 配比 7:0:3) ===
    // Total_Req 60 -> 精 42 / 气 0 / 神 18

    {
        id: "weapons_694",
        name: "精钢厚背砍山刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 46, mag_atk: 0, crit: 7, speed: -4, sharpness: 44 },
        value: 22640,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "江湖帮派二把手的招牌兵刃，重钢打造，劈砍时力道惊人，能在战场上轻易开路。"
    },
    {
        id: "weapons_695",
        name: "赤铜流火刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 35, mag_atk: 11, crit: 7, speed: -4, sharpness: 44 },
        value: 22640,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "赤铁与精钢合铸，刀身散发温热。在江湖争斗中，这把刀能通过灵力震荡灼伤敌人的血气。"
    },
    {
        id: "weapons_696",
        name: "青锋护行快刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 23, mag_atk: 23, crit: 7, speed: -4, sharpness: 44 },
        value: 22640,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "成名镖头常用的趁手家伙，重心调校极为讲究，物理杀伤与内劲加持并重。"
    },
    {
        id: "weapons_697",
        name: "百将陷阵雁翎刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 58, mag_atk: 0, crit: 11, speed: -6, sharpness: 66 },
        value: 30360,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "军中百夫长督造的高级战刀，弧度利于破甲，曾在万军丛中饮过敌将之血。"
    },
    {
        id: "weapons_698",
        name: "寒霜淬灵直刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 43, mag_atk: 15, crit: 11, speed: -6, sharpness: 66 },
        value: 30360,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "以北地寒泉淬火，刀气凛冽。挥舞时灵力附带霜冻效果，能大幅延缓目标的反应速度。"
    },
    {
        id: "weapons_699",
        name: "江湖成名·狂风快刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 29, mag_atk: 29, crit: 11, speed: -6, sharpness: 66 },
        value: 30360,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "某位快刀游侠的成名之兵，在江湖上名声赫赫，是集力量与灵活性于一体的杰作。"
    },
    {
        id: "weapons_700",
        name: "破阵乌金斩马刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 69, mag_atk: 0, crit: 14, speed: -8, sharpness: 88 },
        value: 37000,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "R4巅峰重刃，乌金铁母所制。即使不加灵力，也能单凭蛮力将盾兵连人带甲劈碎。"
    },
    {
        id: "weapons_701",
        name: "血煞通灵大刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 52, mag_atk: 17, crit: 14, speed: -8, sharpness: 88 },
        value: 37000,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "不仅是锋利的兵器，更能在战斗中与主人的杀意共鸣，法术攻击中带有极强的威慑力。"
    },
    {
        id: "weapons_702",
        name: "名坊·百战不屈",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 35, mag_atk: 34, crit: 14, speed: -8, sharpness: 88 },
        value: 37000,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "名铸造坊为江湖高手量身打造，韧性极佳，足以支撑在数千人的战场中力战而不败。"
    }
];
const weapons_r4_batch4 = [
    // === 铍 (Bal 模组 | 系数: 1.20, 0.8, -0.8, 1.2 | Req 配比 6:0:4) ===
    // Total_Req 60 -> 精 36 / 气 0 / 神 24

    {
        id: "weapons_703",
        name: "百炼精钢长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 48, mag_atk: 0, crit: 6, speed: -6, sharpness: 48 },
        value: 22440,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "名匠打造的实战长铍，铍头宽大如剑，中脊加厚，能够轻易刺穿江湖中常见的锁子甲。"
    },
    {
        id: "weapons_704",
        name: "赤铜流光铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 36, mag_atk: 12, crit: 6, speed: -6, sharpness: 48 },
        value: 22440,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "采用赤铜混合精铁铸成，铍身刻有引灵纹路，在挥舞时能产生微弱的火行真气震荡。"
    },
    {
        id: "weapons_705",
        name: "松风堂武铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 24, mag_atk: 24, crit: 6, speed: -6, sharpness: 48 },
        value: 22440,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "成名武馆“松风堂”的镇馆系列，杆身采用韧性极佳的古木包铁，对内气的传导极其均衡。"
    },
    {
        id: "weapons_706",
        name: "陷阵乌金铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 60, mag_atk: 0, crit: 10, speed: -10, sharpness: 72 },
        value: 29880,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "军中千夫长的精锐佩兵，铍尖掺入了乌金，不仅坚硬异常，且自带破障之势，是冲阵的绝佳利器。"
    },
    {
        id: "weapons_707",
        name: "符光淬影长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 45, mag_atk: 15, crit: 10, speed: -10, sharpness: 72 },
        value: 29880,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "经过高级符水淬火，铍面上留下了如波浪般的暗纹，每一次突刺都能带起撕裂法力的灵压。"
    },
    {
        id: "weapons_708",
        name: "成名客惯用铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 30, crit: 10, speed: -10, sharpness: 72 },
        value: 29880,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "曾由多位江湖游侠持用的名器，历经百战而不损，物理力量与法力爆发结合得丝丝入扣。"
    },
    {
        id: "weapons_709",
        name: "校尉督造斩将铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 72, mag_atk: 0, crit: 13, speed: -13, sharpness: 96 },
        value: 36780,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "军中校尉亲自监督名师打造，铍头长两尺有余，锋利如名剑，在战场上拥有极高的斩将成功率。"
    },
    {
        id: "weapons_710",
        name: "寒铁嵌灵铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 54, mag_atk: 18, crit: 13, speed: -13, sharpness: 96 },
        value: 36780,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "镶嵌了深海寒铁矿心的长铍，挥动间寒气逼人，能显著压制敌人的真元流动，法穿极强。"
    },
    {
        id: "weapons_711",
        name: "名坊·百战无前",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 4,
        effects: { phy_atk: 36, mag_atk: 36, crit: 13, speed: -13, sharpness: 96 },
        value: 36780,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "名家坊市的扛鼎之作，将铍这种古兵器的平衡性发挥到了极致，是无数长兵武者梦寐以求的利刃。"
    },

    // === 矛 (Reach 模组 | 系数: 1.25, 0.8, -1.0, 1.2 | Req 配比 6:0:4) ===
    // Total_Req 60 -> 精 36 / 气 0 / 神 24

    {
        id: "weapons_712",
        name: "精钢红缨成名矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 0, crit: 6, speed: -8, sharpness: 48 },
        value: 22800,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "选用上好精钢打造的红缨长矛，枪尖具有四个放血槽，是江湖成名枪客的标志性武器。"
    },
    {
        id: "weapons_713",
        name: "缠龙绕纹矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 38, mag_atk: 12, crit: 6, speed: -8, sharpness: 48 },
        value: 22800,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "矛杆由柔韧的蛇纹木制成，并缠绕了引灵丝线，突刺时能产生螺旋状的法力劲气。"
    },
    {
        id: "weapons_714",
        name: "太乙武会制式矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 25, mag_atk: 25, crit: 6, speed: -8, sharpness: 48 },
        value: 22800,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "太乙武会优胜者的赏赐品，工艺严谨，无论是物理撞击还是法力导向都属上佳。"
    },
    {
        id: "weapons_715",
        name: "黑虎摧坚矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 62, mag_atk: 0, crit: 10, speed: -12, sharpness: 72 },
        value: 30240,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "江湖成名侠士“黑虎手”曾持用的长矛，矛头沉重，具有碎金裂石之威，寻常圆盾一击即破。"
    },
    {
        id: "weapons_716",
        name: "流火淬锋矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 47, mag_atk: 15, crit: 10, speed: -12, sharpness: 72 },
        value: 30240,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "枪尖经过地火淬炼，通体暗红，刺出时会带起灼热的破空声，能有效穿透敌人的护体罡气。"
    },
    {
        id: "weapons_717",
        name: "名门真传白蜡矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 31, mag_atk: 31, crit: 10, speed: -12, sharpness: 72 },
        value: 30240,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "名门大派真传弟子配发的长兵，杆身弹性极佳，不仅利于防御，更能将内气灌注至矛尖瞬间爆发。"
    },
    {
        id: "weapons_718",
        name: "大将军破阵矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 75, mag_atk: 0, crit: 13, speed: -16, sharpness: 96 },
        value: 37320,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "军中上层将领使用的精品长矛，通体由寒钢精炼，是 R4 级别中物理突刺力的巅峰之作。"
    },
    {
        id: "weapons_719",
        name: "紫髓嵌心矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 56, mag_atk: 19, crit: 13, speed: -16, sharpness: 96 },
        value: 37320,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "矛头核心嵌入了一颗紫髓灵石，极大地增强了对真元的增幅作用，刺击时伴有雷鸣异响。"
    },
    {
        id: "weapons_720",
        name: "名坊·一丈威",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 37, mag_atk: 38, crit: 13, speed: -16, sharpness: 96 },
        value: 37320,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "名铸造坊出品的极品长矛，取名“一丈威”，意为一丈之内尽显威能，是平衡性极佳的长兵瑰宝。"
    }
];
const weapons_r4_batch5 = [
    // === 戈 (Reach 模组 | 系数: 1.10, 0.9, -1.0, 1.3 | Req 配比 6:0:4) ===
    // Total_Req 60 -> 精 36 / 气 0 / 神 24

    {
        id: "weapons_721",
        name: "百炼青铜古戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 44, mag_atk: 0, crit: 7, speed: -8, sharpness: 52 },
        value: 21520,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "模仿古法打造的精炼青铜戈，戈头加宽且刃口极薄，是江湖中擅长钩法的高手常用的成名兵刃。"
    },
    {
        id: "weapons_722",
        name: "纹银引灵戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 33, mag_atk: 11, crit: 7, speed: -8, sharpness: 52 },
        value: 21520,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "在戈脊处镶嵌了纹银导灵线，挥动时能产生细微的破空声，法力导向稳定，足以应对多种真气。"
    },
    {
        id: "weapons_723",
        name: "流云堂真传横戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 22, mag_atk: 22, crit: 7, speed: -8, sharpness: 52 },
        value: 21520,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "流云宗为外派使者定制的横戈，杆身极具韧性，不仅防御稳固，反击时的内劲爆发也极其均衡。"
    },
    {
        id: "weapons_724",
        name: "断魂乌钢横戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 55, mag_atk: 0, crit: 11, speed: -12, sharpness: 78 },
        value: 28680,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "军中校尉级统领的利器，乌钢打造的戈头具有极强的咬合力，在钩锁敌方重盾时能生生将其撕裂。"
    },
    {
        id: "weapons_725",
        name: "符光淬火灵戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 41, mag_atk: 14, crit: 11, speed: -12, sharpness: 78 },
        value: 28680,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "戈刃经过烈焰符文淬火，呈现出暗红色，啄击时附带灼热灵压，专破敌人的护体罡气。"
    },
    {
        id: "weapons_726",
        name: "成名侠客‘铁指’戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { jing: 36, qi: 0, shen: 24, phy_atk: 27, mag_atk: 28, crit: 11, speed: -12, sharpness: 78 },
        value: 28680,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "江湖名宿曾持用的奇门长戈，结构精密，物理杀伤与内息转化达到了 R4 级别的优秀平衡点。"
    },
    {
        id: "weapons_727",
        name: "将军令·斩马戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 66, mag_atk: 0, crit: 14, speed: -16, sharpness: 104 },
        value: 35120,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "军中大将亲赏，采用寒铁精炼，其物理破坏力足以在混战中横扫千军，钩杀重型骑兵。"
    },
    {
        id: "weapons_728",
        name: "玄晶嵌纹蚀灵戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 16, crit: 14, speed: -16, sharpness: 104 },
        value: 35120,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "嵌入了完整玄晶碎片的极品长戈，每一次啄击都能腐蚀对方的防御灵力，法术穿透极高。"
    },
    {
        id: "weapons_729",
        name: "名坊·独步天下",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 33, mag_atk: 33, crit: 14, speed: -16, sharpness: 104 },
        value: 35120,
        req: { jing: 36, qi: 0, shen: 24 },
        desc: "名家坊市的巅峰戈器，兼具古兵器的韵味与现代炼器的精密，是江湖顶级长兵武者的身份象征。"
    },

    // === 戟 (Reach 模组 | 系数: 1.30, 0.7, -1.2, 1.1 | Req 配比 7:0:3) ===
    // Total_Req 60 -> 精 42 / 气 0 / 神 18

    {
        id: "weapons_730",
        name: "精钢双耳成名戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 52, mag_atk: 0, crit: 6, speed: -10, sharpness: 44 },
        value: 23000,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "工艺精湛的双耳方天戟，采用高强度精钢打磨，刺、勾、切功能兼备，是战场百夫长的爱将之兵。"
    },
    {
        id: "weapons_731",
        name: "青虹贯灵长戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 39, mag_atk: 13, crit: 6, speed: -10, sharpness: 44 },
        value: 23000,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "戟尖隐现青色虹光，杆身缠绕有导灵铜丝，在施展强力突刺时能显著增幅内劲的贯穿力。"
    },
    {
        id: "weapons_732",
        name: "松风堂内传武戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 26, mag_atk: 26, crit: 6, speed: -10, sharpness: 44 },
        value: 23000,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "成名武馆为真传弟子打造的重戟，强调物理爆发与灵力灌注的协调，是修行长戟战技的不二之选。"
    },
    {
        id: "weapons_733",
        name: "黑煞重钢方天戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 65, mag_atk: 0, crit: 8, speed: -14, sharpness: 66 },
        value: 29280,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "江湖成名凶器，由于采用了极沉的黑煞石合铸，每一击都伴随雷霆万钧之势，寻常兵刃触之即碎。"
    },
    {
        id: "weapons_734",
        name: "烈焰淬锋战戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 49, mag_atk: 16, crit: 8, speed: -14, sharpness: 66 },
        value: 29280,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "戟面宽大，经过火山地火长期浸润，挥舞时能产生肉眼可见的火浪，是大规模阵战中的破甲神器。"
    },
    {
        id: "weapons_735",
        name: "逍遥将领佩戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 32, mag_atk: 33, crit: 8, speed: -14, sharpness: 66 },
        value: 29280,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "某位成名儒将使用的轻量化重戟，材质通灵，法力流动极顺，在优雅中暗藏致命的杀机。"
    },
    {
        id: "weapons_736",
        name: "霸王令·破阵戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 78, mag_atk: 0, crit: 11, speed: -19, sharpness: 88 },
        value: 36100,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "军中上将级别的专属武具，物理攻击力在 R4 中傲视群雄，是纯粹力量与顶级锻造的结晶。"
    },
    {
        id: "weapons_737",
        name: "紫气东来御灵戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 58, mag_atk: 20, crit: 11, speed: -19, sharpness: 88 },
        value: 36100,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "戟身由极其珍贵的紫金打造，对修士的神识与内劲具有极强的共鸣作用，法术覆盖面极广。"
    },
    {
        id: "weapons_738",
        name: "名坊·定海神珍",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 4,
        effects: { phy_atk: 39, mag_atk: 39, crit: 11, speed: -19, sharpness: 88 },
        value: 36100,
        req: { jing: 42, qi: 0, shen: 18 },
        desc: "名铸造坊的镇店重器，将戟这一兵器的复杂性与炼器的灵感完美融合，是 R4 级别的长兵巅峰。"
    }
];
const weapons_r4_batch6 = [
    // === 钺 (Heavy 模组 | 系数: 1.45, 0.6, -1.8, 1.2 | Req 配比 8:0:2) ===
    // Total_Req 60 -> 精 48 / 气 0 / 神 12

    {
        id: "weapons_739",
        name: "精钢开山大钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 58, mag_atk: 0, crit: 5, speed: -14, sharpness: 48 },
        value: 23880,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "由实心精铁锻造的开山重钺，钺面宽大如门板，即便没有内力，单凭重量也足以砸碎精钢盾牌。"
    },
    {
        id: "weapons_740",
        name: "赤铜震山钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 44, mag_atk: 14, crit: 5, speed: -14, sharpness: 48 },
        value: 23880,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "在重钺边缘镶嵌了赤铜导灵线，挥砍时会产生剧烈的空气震荡，令敌人的气血翻涌。"
    },
    {
        id: "weapons_741",
        name: "松风堂力士钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 29, mag_atk: 29, crit: 5, speed: -14, sharpness: 48 },
        value: 23880,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "成名武馆特供，专门针对天生神力的弟子设计，兼顾了物理劈砍与内劲的浑厚传导。"
    },
    {
        id: "weapons_742",
        name: "黑钢断魂重钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 73, mag_atk: 0, crit: 7, speed: -22, sharpness: 72 },
        value: 30240,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "江湖成名猛将“断魂客”的招牌武器，黑钢铸造，钺身极重，每一击都有雷霆万钧之势。"
    },
    {
        id: "weapons_743",
        name: "符纹淬灵开山钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 54, mag_atk: 18, crit: 7, speed: -22, sharpness: 72 },
        value: 29880,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "经过高级力量符文淬火，钺刃呈现出血红色的纹路，能大幅增幅使用者的爆发力。"
    },
    {
        id: "weapons_744",
        name: "成名镖师镇车钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 36, mag_atk: 37, crit: 7, speed: -22, sharpness: 72 },
        value: 30240,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "曾伴随成名镖师走过塞北的重钺，物理结构稳定，法力兼容性极佳，是江湖罕见的重型平衡法宝。"
    },
    {
        id: "weapons_745",
        name: "先锋将领破阵钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 87, mag_atk: 0, crit: 10, speed: -29, sharpness: 96 },
        value: 37140,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "军中先锋官的标配利器，采用极沉的乌金铁母精炼，在冲锋陷阵时无一合之敌。"
    },
    {
        id: "weapons_746",
        name: "寒铁嵌纹裂空钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 65, mag_atk: 22, crit: 10, speed: -29, sharpness: 96 },
        value: 37140,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "镶嵌了深海寒铁的重钺，其沉重的灵压能直接撕裂敌人的护体罡气，物理与法穿皆为顶级。"
    },
    {
        id: "weapons_747",
        name: "名坊·万钧开山",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 44, mag_atk: 43, crit: 10, speed: -29, sharpness: 96 },
        value: 37140,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "名家坊市为成名力士量身打造，在保证恐怖杀伤力的同时，极大地优化了法力的流通效率。"
    },

    // === 矟 (Heavy 模组 | 系数: 1.40, 0.7, -1.5, 1.1 | Req 配比 8:0:2) ===
    // Total_Req 60 -> 精 48 / 气 0 / 神 12

    {
        id: "weapons_748",
        name: "百炼精钢重矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 56, mag_atk: 0, crit: 6, speed: -12, sharpness: 44 },
        value: 24080,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "模仿古代马矟打造的长兵，矟头极长且厚重，由百炼精钢反复锻打而成，是江湖豪强常用的重器。"
    },
    {
        id: "weapons_749",
        name: "青铜回纹矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 42, mag_atk: 14, crit: 6, speed: -12, sharpness: 44 },
        value: 24080,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "矟身刻有螺旋状的回纹导灵槽，在贯穿敌人时能引发真元爆裂，产生二次伤害。"
    },
    {
        id: "weapons_750",
        name: "流云堂真传重矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 28, mag_atk: 28, crit: 6, speed: -12, sharpness: 44 },
        value: 24080,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "流云宗力士一脉的真传武器，强调一力降十会，杆身弹性与硬度结合得极其完美。"
    },
    {
        id: "weapons_751",
        name: "校尉督造斩马矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 70, mag_atk: 0, crit: 8, speed: -18, sharpness: 66 },
        value: 30360,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "军中校尉定制的战矟，长度惊人，专门用于针对敌军重型骑兵，一刺之下人马俱碎。"
    },
    {
        id: "weapons_752",
        name: "符光淬火灵矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 53, mag_atk: 17, crit: 8, speed: -18, sharpness: 66 },
        value: 30360,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "矟尖经过符文金汤淬炼，通体金黄，刺击时伴随着尖锐的法力破空声，极具威慑力。"
    },
    {
        id: "weapons_753",
        name: "江湖成名·撼山矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 35, mag_atk: 35, crit: 8, speed: -18, sharpness: 66 },
        value: 30360,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "某位成名独行侠的贴身利器，材质极其坚硬，物理撞击与灵力渗透力在 R4 中属于上乘。"
    },
    {
        id: "weapons_754",
        name: "霸王令·陨铁矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 84, mag_atk: 0, crit: 11, speed: -24, sharpness: 88 },
        value: 37360,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "由天外陨铁精炼而成的神兵，重逾千斤，不仅锋利绝伦，更带有某种奇特的磁力震荡。"
    },
    {
        id: "weapons_755",
        name: "紫金嵌灵透骨矟",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 63, mag_atk: 21, crit: 11, speed: -24, sharpness: 88 },
        value: 37360,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "紫金丝线缠绕整个矟杆，矟尖具有恐怖的穿透效果，即便是一尺厚的城门也能轻易贯穿。"
    },
    {
        id: "weapons_756",
        name: "名坊·百战不磨",
        type: "weapon" , subType: "矟",
        combatType: "未知",
        rarity: 4,
        effects: { phy_atk: 42, mag_atk: 42, crit: 11, speed: -24, sharpness: 88 },
        value: 37360,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "名家坊市的顶级重兵，经过百余场战斗而不卷刃，将重兵的杀伤力与平衡感发挥到了极致。"
    }
];
const weapons_r4_batch7 = [
    // === 斧 (Heavy 模组 | 系数: 1.65, 0.3, -2.5, 0.9 | Req 配比 8:0:2) ===
    // Total_Req 60 -> 精 48 / 气 0 / 神 12

    {
        id: "weapons_757",
        name: "精钢宣花斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 66, mag_atk: 0, crit: 2, speed: -20, sharpness: 36 },
        value: 23040,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "江湖成名武客常用的长柄宣花斧，斧面阔大，以百炼精钢打就，每一劈都有开山碎石之能。"
    },
    {
        id: "weapons_758",
        name: "包铜赤金战斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 16, crit: 2, speed: -20, sharpness: 36 },
        value: 23040,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "在厚重斧脊上包覆了赤铜导灵层，劈砍时伴随着滚烫的真气波动，是成名镖头的镇车利器。"
    },
    {
        id: "weapons_759",
        name: "松风堂力士斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 33, mag_atk: 33, crit: 2, speed: -20, sharpness: 36 },
        value: 23040,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "成名武馆专供横练高手的兵刃，配重精妙，能将持有者的刚猛内劲毫无损耗地传导至斧刃。"
    },
    {
        id: "weapons_760",
        name: "黑钢陷阵大斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 83, mag_atk: 0, crit: 3, speed: -30, sharpness: 54 },
        value: 28800,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "军中千夫长级的攻坚武具，采用极沉的黑钢铸造，即便是不动用灵力的劈砍也能震碎重型木盾。"
    },
    {
        id: "weapons_761",
        name: "符光淬火烈焰斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 62, mag_atk: 21, crit: 3, speed: -30, sharpness: 54 },
        value: 28800,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "经过高级熔岩符文淬火，斧刃隐隐透出暗红光泽，在劈砍时能引发剧烈的法力爆震。"
    },
    {
        id: "weapons_762",
        name: "成名侠客‘开山’斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 41, mag_atk: 42, crit: 3, speed: -30, sharpness: 54 },
        value: 28800,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "曾由多位江湖豪客持用的名斧，斧身布满实战伤痕却从不卷刃，是物理与灵力结合的典范。"
    },
    {
        id: "weapons_763",
        name: "将军令·断金斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 99, mag_atk: 0, crit: 5, speed: -40, sharpness: 72 },
        value: 34920,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "军中大将亲赐，采用罕见的乌金铁母精炼，在 R4 级别中拥有毁灭性的单一物理破坏力。"
    },
    {
        id: "weapons_764",
        name: "寒铁嵌灵透甲斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 74, mag_atk: 25, crit: 5, speed: -40, sharpness: 72 },
        value: 34920,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "斧刃中心嵌入了深海寒铁，极大地增强了对真元护罩的撕裂作用，专门对付高阶护法卫兵。"
    },
    {
        id: "weapons_765",
        name: "名坊·百战霸王",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 49, crit: 5, speed: -40, sharpness: 72 },
        value: 34920,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "名家坊市的顶级重兵，整体由灵纹钢铸造，每一次挥舞都带起排山倒海般的劲气，名震江湖。"
    },

    // === 椎 (Heavy 模组 | 系数: 1.85, 0.0, -3.5, 0.4 | Req 配比 10:0:0) ===
    // Total_Req 60 -> 精 60 / 气 0 / 神 0

    {
        id: "weapons_766",
        name: "百炼实心铁椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 74, mag_atk: 0, crit: 0, speed: -28, sharpness: 16 },
        value: 22240,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "江湖成名力士的惯用兵刃，不设刃口，全凭实心精铁的恐怖重量直接碾碎敌方的筋骨。"
    },
    {
        id: "weapons_767",
        name: "纹铜重木缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 56, mag_atk: 18, crit: 0, speed: -28, sharpness: 16 },
        value: 22240,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "在极沉的黑檀木外包覆了引灵铜纹，不仅能造成沉重的物理打击，更附带震荡内气的异能。"
    },
    {
        id: "weapons_768",
        name: "流云堂镇山缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 37, mag_atk: 37, crit: 0, speed: -28, sharpness: 16 },
        value: 22240,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "武馆专门为天生神力的真传弟子订制的重型器械，灵力传导极为通畅，法力与蛮力并重。"
    },
    {
        id: "weapons_769",
        name: "乌金八角镇岳椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 93, mag_atk: 0, crit: 0, speed: -42, sharpness: 24 },
        value: 26880,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "军中陷阵营先锋所持，八角结构能将千斤之力汇于一点，是 R4 中物理伤害的绝对巅峰。"
    },
    {
        id: "weapons_770",
        name: "符纹淬灵雷鸣椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 70, mag_atk: 23, crit: 0, speed: -42, sharpness: 24 },
        value: 26880,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "经过雷音符文淬火，击中目标时会发出闷雷般的响声，能直接通过震动干扰对手的真元运行。"
    },
    {
        id: "weapons_771",
        name: "成名将领‘憾山’缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 46, mag_atk: 47, crit: 0, speed: -42, sharpness: 24 },
        value: 26880,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "某位成名猛将的随身兵器，材质特殊，物理重压与内力爆发相得益彰，是江湖中赫赫有名的名兵。"
    },
    {
        id: "weapons_772",
        name: "霸王令·陨铁重椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 111, mag_atk: 0, crit: 0, speed: -56, sharpness: 32 },
        value: 31160,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "由天外陨铁打造，重逾千斤，在战场上横扫而过时犹如泰山压顶，凡铁护甲触之即碎。"
    },
    {
        id: "weapons_773",
        name: "寒铁嵌灵裂骨缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 83, mag_atk: 28, crit: 0, speed: -56, sharpness: 32 },
        value: 31160,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "椎头核心嵌入了极寒矿心，砸击时带起沉重的法力压迫，能显著击穿敌人的灵力护持。"
    },
    {
        id: "weapons_774",
        name: "名坊·百战无前",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 56, mag_atk: 55, crit: 0, speed: -56, sharpness: 32 },
        value: 31160,
        req: { jing: 60, qi: 0, shen: 0 },
        desc: "名坊流水线出的顶级成品，虽为钝器却工艺极其严密，是成名力士在江湖中彰显武力的绝佳伙伴。"
    }
];
const weapons_r4_batch8 = [
    // === 殳 (Heavy 模组 | 系数: 1.55, 0.5, -2.0, 0.5 | Req 配比 8:0:2) ===
    // Total_Req 60 -> 精 48 / 气 0 / 神 12

    {
        id: "weapons_775",
        name: "精铁六棱成名殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 62, mag_atk: 0, crit: 4, speed: -16, sharpness: 20 },
        value: 23120,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "由成名铁匠精铸的六棱铁殳，长柄末端配以厚重的钝头，足以在乱军之中敲碎最坚硬的校尉头盔。"
    },
    {
        id: "weapons_776",
        name: "缠金绕纹重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 47, mag_atk: 15, crit: 4, speed: -16, sharpness: 20 },
        value: 23120,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "在硬质檀木杆身缠绕了金丝引灵纹，不仅能造成沉重的钝击伤害，更附带了破坏真气的余震。"
    },
    {
        id: "weapons_777",
        name: "流云堂真传长殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 31, mag_atk: 31, crit: 4, speed: -16, sharpness: 20 },
        value: 23120,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "流云宗为力士一脉弟子定制的练功重兵，杆身韧性极佳，法力传导极为通透。"
    },
    {
        id: "weapons_778",
        name: "黑煞镇岳殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 78, mag_atk: 0, crit: 6, speed: -24, sharpness: 30 },
        value: 29280,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "军中校尉标配的攻坚武器，头部采用了沉重的黑煞石，其下砸之力在江湖中名声显赫。"
    },
    {
        id: "weapons_779",
        name: "符光淬火震击殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 58, mag_atk: 19, crit: 6, speed: -24, sharpness: 30 },
        value: 28920,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "经过高级雷震符文淬火，每一次打击都会引发沉闷的爆裂声，令敌人的防御真元瞬间涣散。"
    },
    {
        id: "weapons_780",
        name: "成名游侠‘铁脊’殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 39, mag_atk: 39, crit: 6, speed: -24, sharpness: 30 },
        value: 29280,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "某位成名游侠持用的兵刃，外形古朴却法力惊人，在格挡与挥砸之间拥有绝佳的平衡感。"
    },
    {
        id: "weapons_781",
        name: "将军令·斩马重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 93, mag_atk: 0, crit: 8, speed: -32, sharpness: 40 },
        value: 35080,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "大将军亲赐给陷阵猛将的勋章之物，通体百炼精钢，挥舞时呼啸生风，万军莫敌。"
    },
    {
        id: "weapons_782",
        name: "寒铁嵌心裂骨殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 70, mag_atk: 23, crit: 8, speed: -32, sharpness: 40 },
        value: 35080,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "殳头顶部镶嵌了深海寒铁，极大地增强了法力的穿透性，专门针对高阶灵力护甲。"
    },
    {
        id: "weapons_783",
        name: "名坊·百战霸王",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 4,
        effects: { phy_atk: 47, mag_atk: 46, crit: 8, speed: -32, sharpness: 40 },
        value: 35080,
        req: { jing: 48, qi: 0, shen: 12 },
        desc: "名铸造坊的顶尖作品，不仅物理防御惊人，更能将修士的内劲转化为排山倒海的法力砸击。"
    },

    // === 弩 (Range 模组 | 系数: 1.35, 1.0, -2.0, 0.0 | Req 配比 3:0:7) ===
    // Total_Req 60 -> 精 18 / 气 0 / 神 42

    {
        id: "weapons_784",
        name: "百炼精钢强弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 54, mag_atk: 0, crit: 8, speed: -16, sharpness: 0 },
        value: 22320,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "由名匠调校的军中强弩，弩机采用了复杂的杠杆结构，射程远超普通弓箭，是江湖镖头的远程依仗。"
    },
    {
        id: "weapons_785",
        name: "包金引灵手弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 41, mag_atk: 13, crit: 8, speed: -16, sharpness: 0 },
        value: 22320,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "在精巧的木弩身包覆了赤金导灵纹，射出的弩箭能附带微弱的撕裂法力，威力不容小觑。"
    },
    {
        id: "weapons_786",
        name: "太乙武会优胜弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 27, mag_atk: 27, crit: 8, speed: -16, sharpness: 0 },
        value: 22320,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "曾作为武林盛会奖品的名弩，射速与准确度极为平衡，是成名侠客常用的副手利器。"
    },
    {
        id: "weapons_787",
        name: "校尉督造斩风弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 68, mag_atk: 0, crit: 12, speed: -24, sharpness: 0 },
        value: 28800,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "军中精锐弩手标配，弩臂采用了三层复合结构，发射时带有尖锐的破空声，中者必死。"
    },
    {
        id: "weapons_788",
        name: "符光淬火透甲弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 51, mag_atk: 17, crit: 12, speed: -24, sharpness: 0 },
        value: 28800,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "弩机经过特殊的符法淬炼，射出的箭矢带有暗红流光，能轻易穿透修士的真气防御层。"
    },
    {
        id: "weapons_789",
        name: "江湖名宿·穿云弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 34, mag_atk: 34, crit: 12, speed: -24, sharpness: 0 },
        value: 28800,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "某位成名神射手的随身利器，其瞄准机构极度精准，是 R4 级别中远程压制的典范。"
    },
    {
        id: "weapons_790",
        name: "将军令·神臂巨弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 81, mag_atk: 0, crit: 16, speed: -32, sharpness: 0 },
        value: 34920,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "军中上将级别的杀伐重器，拉力惊人，一击之下可贯穿千斤重盾，是战场上的死神之吻。"
    },
    {
        id: "weapons_791",
        name: "寒铁嵌灵强袭弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 61, mag_atk: 20, crit: 16, speed: -32, sharpness: 0 },
        value: 34920,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "弩机核心镶嵌了寒铁矿芯，发射时伴随凛冽的灵压，极大增加了箭矢的法力穿透性能。"
    },
    {
        id: "weapons_792",
        name: "名坊·百步穿杨",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 41, mag_atk: 40, crit: 16, speed: -32, sharpness: 0 },
        value: 34920,
        req: { jing: 18, qi: 0, shen: 42 },
        desc: "名家坊市的巅峰弩作，不仅威力惊人，更能将射手的神识引导力发挥至极致，箭无虚发。"
    }
];
const weapons_r4_batch9 = [
    // === 弓 (Range 模组 | 系数: 1.05, 1.5, -0.5, 0.0 | Req 配比 5:0:5) ===
    // Total_Req 60 -> 精 30 / 气 0 / 神 30

    {
        id: "weapons_793",
        name: "拓木铁胎弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 42, mag_atk: 0, crit: 12, speed: -4, sharpness: 0 },
        value: 23040,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "名匠选百年拓木为胎，内嵌精钢片，弹力惊人，是江湖成名神射手的标志性装备。"
    },
    {
        id: "weapons_794",
        name: "流光飞羽弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 32, mag_atk: 10, crit: 12, speed: -4, sharpness: 0 },
        value: 23040,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "弓身采用了特殊的漆金工艺，能汇聚周遭灵气于弦上，射出的箭矢带有夺目的流光。"
    },
    {
        id: "weapons_795",
        name: "流云真传长弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 3, // 修正：规范要求 R4
        rarity: 4,
        effects: { phy_atk: 21, mag_atk: 21, crit: 12, speed: -4, sharpness: 0 },
        value: 17280,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "流云宗为门下精英弟子配发的战弓，法力导向极佳，能完美契合内气的瞬间爆发。"
    },
    {
        id: "weapons_796",
        name: "校尉督造强袭弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 53, mag_atk: 0, crit: 18, speed: -6, sharpness: 0 },
        value: 30960,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "军中校尉定做的重弓，弦拉力达三百斤，射出的重箭足以在百步之外贯穿重盾。"
    },
    {
        id: "weapons_797",
        name: "符光淬火灵弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 40, mag_atk: 13, crit: 18, speed: -6, sharpness: 0 },
        value: 30960,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "弓弰刻有增强穿透力的灵符，发射时伴随雷鸣之声，法术侵蚀力极强。"
    },
    {
        id: "weapons_798",
        name: "江湖名宿·落雁弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 26, mag_atk: 27, crit: 18, speed: -6, sharpness: 0 },
        value: 30960,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "曾由成名游侠持用的名弓，材质极其坚韧，在多次江湖决斗中立下赫赫战功。"
    },
    {
        id: "weapons_799",
        name: "霸王令·陨铁弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 63, mag_atk: 0, crit: 24, speed: -8, sharpness: 0 },
        value: 38520,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "由陨铁残片融入弓胎，物理张力达到了 R4 级别的巅峰，是力大无穷者的不二选择。"
    },
    {
        id: "weapons_800",
        name: "寒铁嵌灵啸月弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 47, mag_atk: 16, crit: 24, speed: -8, sharpness: 0 },
        value: 38520,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "弓身镶嵌了极寒灵铁，能在箭矢飞行时形成冰霜灵压，专门克制敌方的火行法盾。"
    },
    {
        id: "weapons_801",
        name: "名坊·百战穿云",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 4,
        effects: { phy_atk: 32, mag_atk: 31, crit: 24, speed: -8, sharpness: 0 },
        value: 38520,
        req: { jing: 30, qi: 0, shen: 30 },
        desc: "名家坊市的顶级代表作，不仅威力惊人，更能将射手的神识与弓弦完美融合。"
    },

    // === 飞剑 (Relic 模组 | 系数: 1.0, 1.2, +1.2, 1.3 | Req 配比 1:6:3) ===
    // Total_Req 60 -> 精 6 / 气 36 / 神 18

    {
        id: "weapons_802",
        name: "精钢淬火灵剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 40, mag_atk: 0, mag_crit: 10, speed: 10, penetration: 52 },
        value: 25480,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "内门弟子标配的精钢飞剑，通过高级淬火工艺提升了韧性，即便在灵力耗尽时也是一把利刃。"
    },
    {
        id: "weapons_803",
        name: "青虹流光剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 10, mag_crit: 10, speed: 10, penetration: 52 },
        value: 25480,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "剑身采用青色流金装饰，法力导向极为顺畅，御剑飞行时如虹光过境。"
    },
    {
        id: "weapons_804",
        name: "玉虚堂真传法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 20, mag_atk: 20, mag_crit: 10, speed: 10, penetration: 52 },
        value: 25480,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "道门玉虚堂真传弟子专用，材质极其匀称，能在瞬间将内气转化为锐利的剑气。"
    },
    {
        id: "weapons_805",
        name: "沉钢玄影飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 0, mag_crit: 14, speed: 14, penetration: 78 },
        value: 33720,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "由沉重玄铁精炼而成，重力感极强，在御剑斩击时带有惊人的惯性冲击力。"
    },
    {
        id: "weapons_806",
        name: "符印淬灵长剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 38, mag_atk: 12, mag_crit: 14, speed: 14, penetration: 78 },
        value: 33720,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "剑面刻满了聚灵符印，能显著减少御剑时的法力损耗，是成名剑修的钟爱兵刃。"
    },
    {
        id: "weapons_807",
        name: "江湖名坊法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 25, mag_atk: 25, mag_crit: 14, speed: 14, penetration: 78 },
        value: 33720,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "名坊出品，工艺标准极高，物理切割与灵力穿透完美平衡，在江湖上享誉盛名。"
    },
    {
        id: "weapons_808",
        name: "校尉督造斩灵剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 60, mag_atk: 0, mag_crit: 19, speed: 19, penetration: 104 },
        value: 42860,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "军中高级将领配发的实战型飞剑，剑锋极其锐利，专门针对高阶修士的近身防御。"
    },
    {
        id: "weapons_809",
        name: "寒铁灵犀飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 45, mag_atk: 15, mag_crit: 19, speed: 19, penetration: 104 },
        value: 42860,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "采用深海寒铁为主材，剑气凛冽，能轻易冻结目标的防御灵力，法穿极高。"
    },
    {
        id: "weapons_810",
        name: "名坊·独步青云",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 30, mag_crit: 19, speed: 19, penetration: 104 },
        value: 42860,
        req: { jing: 6, qi: 36, shen: 18 },
        desc: "名家坊市的扛鼎之作，将剑器的轻盈与破坏力发挥到极致，名动一方。"
    }
];
const weapons_r4_batch10 = [
    // === 法印 (Relic 模组 | 系数: 1.6, 0.5, -3.0, 1.1 | Req 配比 4:5:1) ===
    // Total_Req 60 -> 精 24 / 气 30 / 神 6

    {
        id: "weapons_811",
        name: "精铁镇岳印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 64, mag_atk: 0, mag_crit: 4, speed: -24, penetration: 44 },
        value: 23360,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "由实心精铁胎铸造而成，表面覆有稳固金辉。虽法术攻击内敛，但其物理砸击之力足以令地表震颤。"
    },
    {
        id: "weapons_812",
        name: "五行流光印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 48, mag_atk: 16, mag_crit: 4, speed: -24, penetration: 44 },
        value: 23360,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "印身流转着五彩光华，通过内部的灵石核心平衡阴阳，是成名散修常用的多功能攻防法宝。"
    },
    {
        id: "weapons_813",
        name: "流云堂供奉法印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 32, mag_atk: 32, mag_crit: 4, speed: -24, penetration: 44 },
        value: 23360,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "流云宗专门为外派执事打造的成名法器，整体材质浑然天成，法力传导在重型法宝中极其平顺。"
    },
    {
        id: "weapons_814",
        name: "黑钢陷阵大印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 80, mag_atk: 0, mag_crit: 6, speed: -36, penetration: 66 },
        value: 29280,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "军中随军法师领袖所执，以重黑钢铸就，底部刻有“崩城”纹路，物理破坏力极强。"
    },
    {
        id: "weapons_815",
        name: "符光淬火灵犀印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 60, mag_atk: 20, mag_crit: 6, speed: -36, penetration: 66 },
        value: 29280,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "经过天火阵淬炼，印身微热，激发时能产生沉重的灵压波，直接压制敌方的真元运行速度。"
    },
    {
        id: "weapons_816",
        name: "江湖名宿·覆地印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 40, mag_atk: 40, mag_crit: 6, speed: -36, penetration: 66 },
        value: 29280,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "某位成名阵法大师常用的压阵法印，在武林中享有盛誉，法力爆发瞬间极具震撼力。"
    },
    {
        id: "weapons_817",
        name: "校尉督造斩灵印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 96, mag_atk: 0, mag_crit: 8, speed: -48, penetration: 88 },
        value: 35200,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "R4级别的重型巅峰，通体由寒铁精母打造，不仅坚不可摧，更能在砸击时撕裂敌人的肉身防御。"
    },
    {
        id: "weapons_818",
        name: "玄晶嵌纹蚀魂印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 72, mag_atk: 24, mag_crit: 8, speed: -48, penetration: 88 },
        value: 35200,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "镶嵌了完整紫玄晶的极品印，激发出的光柱带有蚀灵效果，专门克制高阶修士的真气护层。"
    },
    {
        id: "weapons_819",
        name: "名坊·四海平波",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 48, mag_atk: 48, mag_crit: 8, speed: -48, penetration: 88 },
        value: 35200,
        req: { jing: 24, qi: 30, shen: 6 },
        desc: "名家坊市的镇店重宝，将法印的厚重与灵力的变幻完美融合，是名动一方的江湖重器。"
    },

    // === 宝葫芦 (Relic 模组 | 系数: 0.95, 1.0, 0.0, 1.4 | Req 配比 2:7:1) ===
    // Total_Req 60 -> 精 12 / 气 42 / 神 6

    {
        id: "weapons_820",
        name: "精铁胎朱砂葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 38, mag_atk: 0, mag_crit: 8, speed: 0, penetration: 56 },
        value: 21680,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "在灵木材质中嵌入精铁胎骨，再涂以秘制朱砂。外壳极其坚硬，内蕴气劲浑厚无比。"
    },
    {
        id: "weapons_821",
        name: "青虹流萤葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 28, mag_atk: 10, mag_crit: 8, speed: 0, penetration: 56 },
        value: 21680,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "葫芦口常年喷薄出细微的荧光，不仅能储存丹药灵气，更能在对敌时喷出混合劲气。"
    },
    {
        id: "weapons_822",
        name: "流云真传药葫芦",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 19, mag_atk: 19, mag_crit: 8, speed: 0, penetration: 56 },
        value: 21680,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "流云宗核心子弟下山历练常用的成名法宝，对真元具有极佳的提纯与放大作用。"
    },
    {
        id: "weapons_823",
        name: "沉钢玄水葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 47, mag_atk: 0, mag_crit: 12, speed: 0, penetration: 84 },
        value: 28920,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "采用黑沉钢精磨而成的葫芦，沉重异常。内里空间宽广，发射出的空气炮带有一种沉重的压制感。"
    },
    {
        id: "weapons_824",
        name: "符纹淬灵聚气葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 35, mag_atk: 12, mag_crit: 12, speed: 0, penetration: 84 },
        value: 28920,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "葫芦身布满聚灵符纹，能不断吸收周遭灵气。喷发时法力汹涌，是成名修士的看家宝贝。"
    },
    {
        id: "weapons_825",
        name: "江湖名宿·醉仙葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 23, mag_atk: 24, mag_crit: 12, speed: 0, penetration: 84 },
        value: 28920,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "曾为江湖成名散修随身之物，材质经过多年酒气与真元浸泡，具有奇特的法力共鸣性。"
    },
    {
        id: "weapons_826",
        name: "校尉督造烈风葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 57, mag_atk: 0, mag_crit: 16, speed: 0, penetration: 112 },
        value: 36520,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "军中特制，用于储存高压气爆，威力惊人。其物理防御力在同级别法宝中堪称变态。"
    },
    {
        id: "weapons_827",
        name: "寒铁嵌纹透灵葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 43, mag_atk: 14, mag_crit: 16, speed: 0, penetration: 112 },
        value: 36520,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "镶嵌了极其稀有的寒铁丝，能极度压缩法力并在瞬间喷射，具有无与伦比的灵透穿刺力。"
    },
    {
        id: "weapons_828",
        name: "名坊·乾坤纳气",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 28, mag_atk: 29, mag_crit: 16, speed: 0, penetration: 112 },
        value: 36520,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "名家坊市的顶级代表作，不仅是一件法器，更是一种身份。其灵气转换效率达到了 R4 巅峰。"
    }
];
const weapons_r4_batch11 = [
    // === 阵盘 (Relic 模组 | 系数: 1.1, 1.4, -1.5, 1.9 | Req 配比 1:4:5) ===
    // Total_Req 60 -> 精 6 / 气 24 / 神 30

    {
        id: "weapons_829",
        name: "精铁边框山河盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 44, mag_atk: 0, mag_crit: 11, speed: -12, penetration: 76 },
        value: 24640,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "在厚重的石盘外铸造了精铁护边，盘身刻有基础的地理脉络图，是江湖成名阵修常用的稳固阵基。"
    },
    {
        id: "weapons_830",
        name: "青虹流光演阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 33, mag_atk: 11, mag_crit: 11, speed: -12, penetration: 76 },
        value: 24640,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "盘面由青色流金勾勒出复杂的阵法回路，能显著加速真元的转化效率，适用于中距离法术对决。"
    },
    {
        id: "weapons_831",
        name: "流云真传星璇盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 22, mag_atk: 22, mag_crit: 11, speed: -12, penetration: 76 },
        value: 24640,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "流云宗专门为真传阵法弟子配发的成名法具，材质轻盈且灵力响应极快，法术覆盖面非常均衡。"
    },
    {
        id: "weapons_832",
        name: "黑钢陷阵督战盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 55, mag_atk: 0, mag_crit: 17, speed: -18, penetration: 114 },
        value: 33360,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "军中千夫长级别的布阵利器，黑钢铸就的盘身具有惊人的反震力，在混战中能作为盾牌护身。"
    },
    {
        id: "weapons_833",
        name: "符光淬影乾坤盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 41, mag_atk: 14, mag_crit: 17, speed: -18, penetration: 114 },
        value: 33360,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "经过高级符咒师淬灵，盘面布满了若隐若现的灵光，激发时能产生沉重的法力压迫，困敌杀敌于瞬息。"
    },
    {
        id: "weapons_834",
        name: "江湖名宿·六合盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 27, mag_atk: 28, mag_crit: 17, speed: -18, penetration: 114 },
        value: 33360,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "某位成名已久的阵法散修的贴身法具，在武林中享有盛誉，其法力波动的深度令人叹为观止。"
    },
    {
        id: "weapons_835",
        name: "校尉督造斩灵阵基",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 66, mag_atk: 0, mag_crit: 22, speed: -24, penetration: 152 },
        value: 41360,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "军中上层将领亲自督办的实战精品，采用寒钢精母压制，物理防御与法力穿透力均达到 R4 巅峰。"
    },
    {
        id: "weapons_836",
        name: "紫髓嵌心通玄盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 50, mag_atk: 16, mag_crit: 22, speed: -24, penetration: 152 },
        value: 41360,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "盘眼中心嵌有一枚完整的紫髓灵石，极大地增幅了神识对阵法的操控力，法力输出极其狂暴。"
    },
    {
        id: "weapons_837",
        name: "名坊·万阵之源",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 33, mag_atk: 33, mag_crit: 22, speed: -24, penetration: 152 },
        value: 41360,
        req: { jing: 6, qi: 24, shen: 30 },
        desc: "名家坊市的扛鼎之作，工艺极其严苛，灵气流转顺畅如水，是无数阵法师梦寐以求的成名重宝。"
    },

    // === 灵镜 (Relic 模组 | 系数: 1.2, 1.8, -0.5, 0.9 | Req 配比 1:3:6) ===
    // Total_Req 60 -> 精 6 / 气 18 / 神 36

    {
        id: "weapons_838",
        name: "精铁玄照护心灵镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 48, mag_atk: 0, mag_crit: 14, speed: -4, penetration: 36 },
        value: 28080,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "不仅是防御护具，其镜面由高强度精铁抛光，反射出的物理灵压能在瞬间击退近身的敌手。"
    },
    {
        id: "weapons_839",
        name: "青虹流影照妖镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 36, mag_atk: 12, mag_crit: 14, speed: -4, penetration: 36 },
        value: 28080,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "在镜缘包覆了青金流光，对于隐匿形迹的妖邪具有极强的勘破作用，是江湖驱邪人的成名法器。"
    },
    {
        id: "weapons_840",
        name: "流云堂真传照影镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 24, mag_atk: 24, mag_crit: 14, speed: -4, penetration: 36 },
        value: 28080,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "流云宗为核心弟子定制的配套灵镜，镜面如水，能平稳反射使用者的本源法力，攻守一体。"
    },
    {
        id: "weapons_841",
        name: "黑钢镇魂通玄镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 60, mag_atk: 0, mag_crit: 22, speed: -6, penetration: 54 },
        value: 38520,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "军中校尉级统领用于压制敌方心神的重型灵镜，采用黑钢铸边，砸击力与法力反射力并重。"
    },
    {
        id: "weapons_842",
        name: "符光淬火烈阳镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 45, mag_atk: 15, mag_crit: 22, speed: -6, penetration: 54 },
        value: 38520,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "经过高级熔岩符文反复淬炼，镜面带有一丝暗红，反射出的灵光带有强烈的法力灼烧效果。"
    },
    {
        id: "weapons_843",
        name: "江湖名宿·鉴心镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 30, mag_atk: 30, mag_crit: 22, speed: -6, penetration: 54 },
        value: 38520,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "曾由成名散修持用的灵镜，历经无数江湖风雨，镜面依旧清澈如初，在真气导向方面极具名望。"
    },
    {
        id: "weapons_844",
        name: "校尉督造斩影镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 72, mag_atk: 0, mag_crit: 29, speed: -8, penetration: 72 },
        value: 48240,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "军中顶级工坊督造，镜面硬度足以硬撼凡铁兵刃，是 R4 级别中近战灵镜的巅峰之作。"
    },
    {
        id: "weapons_845",
        name: "寒铁嵌灵彻地镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 54, mag_atk: 18, mag_crit: 29, speed: -8, penetration: 72 },
        value: 48240,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "镜背中心嵌有一块寒铁矿心，能使反射的法术带有极强的灵力穿透效果，专克厚重护甲。"
    },
    {
        id: "weapons_846",
        name: "名坊·洞若观火",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 36, mag_atk: 36, mag_crit: 29, speed: -8, penetration: 72 },
        value: 48240,
        req: { jing: 6, qi: 18, shen: 36 },
        desc: "名家坊市的得意之作，取名“洞若观火”，意为一切破绽皆在镜中。是江湖成名高手的身份象征。"
    }
];
const weapons_r4_batch12 = [
    // === 长幡 (Relic 模组 | 系数: 1.3, 0.8, -1.2, 1.2 | Req 配比 2:7:1) ===
    // Total_Req 60 -> 精 12 / 气 42 / 神 6

    {
        id: "weapons_847",
        name: "精铁柄百战旌旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 52, mag_atk: 0, mag_crit: 6, speed: -10, penetration: 48 },
        value: 23160,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "曾立于边境战场的军旗，杆身由实心精铁所制，不仅能调动士气灵压，挥舞间更有万钧破甲之力。"
    },
    {
        id: "weapons_848",
        name: "流云纹银召灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 39, mag_atk: 13, mag_crit: 6, speed: -10, penetration: 48 },
        value: 23160,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "在幡布中编织了纹银丝线，能有效汇聚周遭散乱的灵气，是江湖成名散修常用的聚灵利器。"
    },
    {
        id: "weapons_849",
        name: "松风堂内传法幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 26, mag_atk: 26, mag_crit: 6, speed: -10, penetration: 48 },
        value: 23160,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "成名武馆专为内传弟子打造的法幡，平衡性极佳，能将物理劲力与法力爆发完美契合。"
    },
    {
        id: "weapons_850",
        name: "黑钢陷阵督师幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 65, mag_atk: 0, mag_crit: 9, speed: -14, penetration: 72 },
        value: 30240,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "军中先锋统领使用的重型幡旗，黑钢铸就的杆头犹如短矛，是战场上破阵开路的成名利器。"
    },
    {
        id: "weapons_851",
        name: "符光淬灵噬魂旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 49, mag_atk: 16, mag_crit: 9, speed: -14, penetration: 72 },
        value: 30240,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "经过高级符法淬炼，幡面泛着暗红色的幽光，挥舞时伴随凄厉啸音，法术穿透效果惊人。"
    },
    {
        id: "weapons_852",
        name: "江湖名宿·通天幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 32, mag_atk: 33, mag_crit: 9, speed: -14, penetration: 72 },
        value: 30240,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "某位成名道长的招牌兵刃，名震江湖，其稳定的真元传导能力在法宝中享有极高声望。"
    },
    {
        id: "weapons_853",
        name: "校尉督造斩灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 78, mag_atk: 0, mag_crit: 13, speed: -19, penetration: 96 },
        value: 37860,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "由军中精锐工坊督造，采用乌金铁母精炼杆身，在 R4 级别中拥有极致的物理压制力。"
    },
    {
        id: "weapons_854",
        name: "寒铁嵌灵聚气幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 58, mag_atk: 20, mag_crit: 13, speed: -19, penetration: 96 },
        value: 37860,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "幡杆顶部镶嵌了极寒铁母，能极大增幅法力的灵透穿刺力，专克强力灵力护甲。"
    },
    {
        id: "weapons_855",
        name: "名坊·百战不摇",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 39, mag_atk: 39, mag_crit: 13, speed: -19, penetration: 96 },
        value: 37860,
        req: { jing: 12, qi: 42, shen: 6 },
        desc: "名家坊市的扛鼎之作，取“百战而不摇”之意，在极其混乱的灵气战场中亦能保持稳健输出。"
    },

    // === 玉佩 (Relic 模组 | 系数: 0.65, 2.2, +2.5, 0.8 | Req 配比 0:4:6) ===
    // Total_Req 60 -> 精 0 / 气 24 / 神 36

    {
        id: "weapons_856",
        name: "百炼淬火铁胎玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 26, mag_atk: 0, mag_crit: 18, speed: 20, penetration: 32 },
        value: 27200,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "在灵玉内嵌有精钢铁胎，通过特殊淬火工艺结合，不仅灵动非凡，更具有不俗的物理冲击感。"
    },
    {
        id: "weapons_857",
        name: "青虹流萤玉髓",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 20, mag_atk: 6, mag_crit: 18, speed: 20, penetration: 32 },
        value: 27200,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "选材自深山玉髓，表面附有流萤般的法力光斑，是成名游侠常用的随身增幅法器。"
    },
    {
        id: "weapons_858",
        name: "流云真传同心佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 13, mag_atk: 13, mag_crit: 18, speed: 20, penetration: 32 },
        value: 27200,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "流云宗核心弟子下山历练的信物，灵性十足，在法力流转与物理敏捷度间达到了绝佳平衡。"
    },
    {
        id: "weapons_859",
        name: "沉钢玄影镇灵玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 33, mag_atk: 0, mag_crit: 25, speed: 28, penetration: 48 },
        value: 36840,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "采用黑沉钢精磨外壳的灵玉，分量极重。投掷而出时力逾千钧，是 R4 中物理性极强的玉佩。"
    },
    {
        id: "weapons_860",
        name: "符纹聚气紫灵佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 24, mag_atk: 9, mag_crit: 25, speed: 28, penetration: 48 },
        value: 36840,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "玉身雕刻有繁复的聚灵符纹，能让持有者的暴击法力成倍增长，在江湖中颇有成名背景。"
    },
    {
        id: "weapons_861",
        name: "江湖名宿·鉴心玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 16, mag_atk: 17, mag_crit: 25, speed: 28, penetration: 48 },
        value: 36840,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "某位成名已久的神识大师所用的法玉，材质通灵，能将内劲与神识完美转化为锐利的法力爆发。"
    },
    {
        id: "weapons_862",
        name: "校尉督造斩将佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 39, mag_atk: 0, mag_crit: 35, speed: 38, penetration: 64 },
        value: 48640,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "军中特制，用于在万军丛中精准狙杀敌将的暗器型法宝，其物理瞬发力达到了同类巅峰。"
    },
    {
        id: "weapons_863",
        name: "寒铁嵌灵彻影玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 29, mag_atk: 10, mag_crit: 35, speed: 38, penetration: 64 },
        value: 48640,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "镶嵌了极其罕见的寒铁碎屑，法力射线带有极强的灵透效果，专门刺破各种高阶法术护盾。"
    },
    {
        id: "weapons_864",
        name: "名坊·独步灵犀",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 4,
        effects: { phy_atk: 19, mag_atk: 20, mag_crit: 35, speed: 38, penetration: 64 },
        value: 48640,
        req: { jing: 0, qi: 24, shen: 36 },
        desc: "名家坊市的顶级代表作，不仅是一件法器，更是成名高手的身份标识。其爆发力在 R4 中无可比拟。"
    }
];
const weapons_r5_batch1 = [
    // === 匕 (Agile 模组 | 系数: 0.5, 2.5, +2.0, 1.2 | Req 配比 2:0:8) ===
    // Total_Req 75 -> 精 15 / 气 0 / 神 60

    {
        id: "weapons_964",
        name: "鸣鸿残影刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 25, mag_atk: 0, crit: 25, speed: 20, sharpness: 60 },
        value: 41250,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "传闻为上古神兵鸣鸿的碎片重铸，刃身自带唳鸣，挥动时空气中会留下经久不散的残影。"
    },
    {
        id: "weapons_965",
        name: "幽冥曼陀罗",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 19, mag_atk: 6, crit: 25, speed: 20, sharpness: 60 },
        value: 41250,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "以深渊剧毒曼陀罗淬炼七七四十九日，刃口发紫。不仅刺穿肉身，更直接侵蚀敌人的真元根基。"
    },
    {
        id: "weapons_966",
        name: "昆仑冰魄刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 13, mag_atk: 12, crit: 25, speed: 20, sharpness: 60 },
        value: 41250,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "采取昆仑万年寒冰之核，辅以秘法灵银打制，握之如冰，真气流转间带有凛冽的绝对零度感。"
    },
    {
        id: "weapons_967",
        name: "太阿副刃·宵练",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 32, mag_atk: 0, crit: 38, speed: 30, sharpness: 90 },
        value: 59850,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "无影无形的绝世凶兵，白昼见影而不见光，入肉无痕，是顶级刺客梦寐以求的传世之刃。"
    },
    {
        id: "weapons_968",
        name: "焚天劫火短匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 24, mag_atk: 8, crit: 38, speed: 30, sharpness: 90 },
        value: 59850,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "刃身流淌着地脉劫火，接触空气即产生高温。刺入护甲时如切腐乳，法穿与物理极具毁灭性。"
    },
    {
        id: "weapons_969",
        name: "万象森罗秘刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 16, mag_atk: 16, crit: 38, speed: 30, sharpness: 90 },
        value: 59850,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "能够随使用者内劲属性自动衍化攻击形态的神奇短兵，是上古宗门秘传的宗师武装。"
    },
    {
        id: "weapons_970",
        name: "弑神乌金芒",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 38, mag_atk: 0, crit: 50, speed: 40, sharpness: 120 },
        value: 77100,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "R5级别的物理巅峰，纯粹的乌金精母打造，极度的沉重压榨出极度的锐利，足以弑杀神魔。"
    },
    {
        id: "weapons_971",
        name: "九天雷动刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 28, mag_atk: 10, crit: 50, speed: 40, sharpness: 120 },
        value: 77100,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "雷劫余烬中诞生的异兵，挥动间电芒肆虐。其暴击带来的麻痹效果能让高阶强者瞬间僵直。"
    },
    {
        id: "weapons_972",
        name: "名剑·惊鸿",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 19, mag_atk: 19, crit: 50, speed: 40, sharpness: 120 },
        value: 77100,
        req: { jing: 15, qi: 0, shen: 60 },
        desc: "翩若惊鸿，婉若游龙。此刃的灵性已经觉醒，能主动寻觅敌人的真气漏洞，乃传世孤品。"
    },

    // === 手戟 (Agile 模组 | 系数: 0.7, 1.6, +1.2, 1.0 | Req 配比 4:0:6) ===
    // Total_Req 75 -> 精 30 / 气 0 / 神 45

    {
        id: "weapons_973",
        name: "龙鳞御卫戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 35, mag_atk: 0, crit: 16, speed: 12, sharpness: 50 },
        value: 35350,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "由真龙逆鳞揉入玄钢铸造，戟头具有不可思议的硬度，是远古皇朝禁卫军统领的信物。"
    },
    {
        id: "weapons_974",
        name: "天罡北斗钩戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 26, mag_atk: 9, crit: 16, speed: 12, sharpness: 50 },
        value: 35350,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "戟面对应北斗七星镶嵌了陨星石，挥舞时能引发星辰灵压，对于邪祟有着天然的压制力。"
    },
    {
        id: "weapons_975",
        name: "归元宗师手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 18, mag_atk: 17, crit: 16, speed: 12, sharpness: 50 },
        value: 35350,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "万法归宗。此戟不求华丽，只求极致的真元兼容，能将使用者的每一分气力转化为致命劲风。"
    },
    {
        id: "weapons_976",
        name: "玄武裂甲手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 44, mag_atk: 0, crit: 24, speed: 18, sharpness: 75 },
        value: 49200,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "厚重如山的杀伐之器。虽是短戟，却有开山之重，任何以防御著称的功法在其面前皆显苍白。"
    },
    {
        id: "weapons_977",
        name: "九霄云动灵戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 33, mag_atk: 11, crit: 24, speed: 18, sharpness: 75 },
        value: 49200,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "采集九天之云金铸造，轻若无物却坚不可摧，戟身蕴含的风灵力能显著提升攻击者的攻速。"
    },
    {
        id: "weapons_978",
        name: "太虚幻影手戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 22, mag_atk: 22, crit: 24, speed: 18, sharpness: 75 },
        value: 49200,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "处于虚实之间的神兵。在肉眼观察中不断闪烁错位，令敌方根本无法判断其具体的钩击位置。"
    },
    {
        id: "weapons_979",
        name: "兵圣·破敌戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 53, mag_atk: 0, crit: 32, speed: 24, sharpness: 100 },
        value: 63050,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "相传为兵圣韩信曾持用的护身兵刃。不仅是杀敌之物，更是一种兵权与无上勇武的象征。"
    },
    {
        id: "weapons_980",
        name: "紫金透骨神戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 4, // 修正为 5
        rarity: 5,
        effects: { phy_atk: 39, mag_atk: 13, crit: 32, speed: 24, sharpness: 100 },
        value: 50080,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "紫金精母打造，戟尖具有无视防御的“破障”灵能。对于依靠法宝护体的对手是毁灭性的存在。"
    },
    {
        id: "weapons_981",
        name: "传世名器·龙象",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 26, mag_atk: 26, crit: 32, speed: 24, sharpness: 100 },
        value: 62600,
        req: { jing: 30, qi: 0, shen: 45 },
        desc: "拥有龙象之力的神兵。每一次挥砍都能引发周遭大地的法力共振，是 R5 级别的工艺巅峰。"
    }
];
const weapons_r5_batch2 = [
    // === 吴钩 (Agile 模组 | 系数: 0.75, 1.4, +0.8, 1.1 | Req 配比 5:0:5) ===
    // Total_Req 75 -> 精 38 / 气 0 / 神 37 (四舍五入)

    {
        id: "weapons_982",
        name: "上古遗珍·望舒钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 38, mag_atk: 0, crit: 14, speed: 8, sharpness: 55 },
        value: 34250,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "传闻为望舒女神遗留在凡间的月牙之刃，刃身通透如冰，挥舞间能冻结敌人的血气。"
    },
    {
        id: "weapons_983",
        name: "灵犀通幽曲刃",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 28, mag_atk: 10, crit: 14, speed: 8, sharpness: 55 },
        value: 34250,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "以千年通灵犀角磨制的钩身，能引导地脉阴火，对幽魂与灵体具有毁灭性的打击力。"
    },
    {
        id: "weapons_984",
        name: "太极玄清钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 19, mag_atk: 19, crit: 14, speed: 8, sharpness: 55 },
        value: 34250,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "道门至宝之一，弧度暗合太极阴阳之理。无论物理劈砍还是真元转化，皆随心所欲，了无痕迹。"
    },
    {
        id: "weapons_985",
        name: "贪狼绝影钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 47, mag_atk: 0, crit: 21, speed: 12, sharpness: 83 },
        value: 46900,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "由天外陨铁打造，钩背带有密集的锯齿，曾在上古战场中斩落无数神将的头颅。"
    },
    {
        id: "weapons_986",
        name: "天罚烈焰弯刃",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 35, mag_atk: 12, crit: 21, speed: 12, sharpness: 83 },
        value: 46900,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "浸泡在岩浆核心千年的奇兵，挥舞时伴随毁灭性的天火灵压，能瞬间将敌人的防御化为焦炭。"
    },
    {
        id: "weapons_987",
        name: "万剑归宗·影钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 23, mag_atk: 24, crit: 21, speed: 12, sharpness: 83 },
        value: 46900,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "能够分化出虚实残影的绝世钩刃，不仅物理切割力惊人，更能以虚影形态直接攻击灵魂。"
    },
    {
        id: "weapons_988",
        name: "兵圣令·斩将钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 56, mag_atk: 0, crit: 28, speed: 16, sharpness: 110 },
        value: 59500,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "R5级别巅峰，纯乌金打造。此钩一出，必见血而回，是物理刺杀与正面冲锋的究极利刃。"
    },
    {
        id: "weapons_989",
        name: "紫电青霜御灵钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 42, mag_atk: 14, crit: 28, speed: 16, sharpness: 110 },
        value: 59500,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "雷火淬炼的灵性神兵，钩尖带有寂灭紫电。对拥有高阶法宝护身的敌人具有极强的破灵效果。"
    },
    {
        id: "weapons_990",
        name: "传世孤品·月下独酌",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 28, mag_atk: 28, crit: 28, speed: 16, sharpness: 110 },
        value: 59500,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "名动万古的神兵，剑客李太白所留残影。能在方寸之间展现出极致的灵活性与致命伤。"
    },

    // === 奇门 (Agile 模组 | 系数: 0.60, 2.0, +1.5, 0.8 | Req 配比 3:0:7) ===
    // Total_Req 75 -> 精 23 / 气 0 / 神 52 (四舍五入)

    {
        id: "weapons_991",
        name: "太乙玄铁九节鞭",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 30, mag_atk: 0, crit: 20, speed: 15, sharpness: 40 },
        value: 36875,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "每一节都重逾百斤，却在神识驱动下灵活如蛇。砸击之下，任何凡铁盾牌皆如纸糊。"
    },
    {
        id: "weapons_992",
        name: "迷天暗香灵扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 23, mag_atk: 7, crit: 20, speed: 15, sharpness: 40 },
        value: 36875,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "扇面由千年灵狐之毛织就，挥动间暗香袭人，能令对手陷入幻觉，防不胜防。"
    },
    {
        id: "weapons_993",
        name: "天演无影算盘",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 15, mag_atk: 15, crit: 20, speed: 15, sharpness: 40 },
        value: 36875,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "算珠由星辰碎玉制成，能计算天机亦能收割性命。物理震荡与灵力波动达到了完美的均衡。"
    },
    {
        id: "weapons_994",
        name: "阎罗令·摄魂锁镰",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 38, mag_atk: 0, crit: 30, speed: 23, sharpness: 60 },
        value: 52275,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "阴间执法者的随身兵刃，索长千丈。一旦被其勾中，不仅肉身难脱，灵魂亦会被枷锁禁锢。"
    },
    {
        id: "weapons_995",
        name: "雷神震魂锤",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 28, mag_atk: 10, crit: 30, speed: 23, sharpness: 60 },
        value: 52275,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "蕴含雷劫之力的双锤，击中目标时引发的法术雷暴能直接瓦解对手的经脉运行。"
    },
    {
        id: "weapons_996",
        name: "判官笔·死生契阔",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 19, mag_atk: 19, crit: 30, speed: 23, sharpness: 60 },
        value: 52275,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "生死簿旁的神笔，点穴杀人只需一瞬。极高的灵导性使其发射的剑气具有绝对的穿透性。"
    },
    {
        id: "weapons_997",
        name: "万劫绝命飞爪",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 0, crit: 40, speed: 30, sharpness: 80 },
        value: 67000,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "R5级别奇门之巅。由极度压缩的黑金精铁制成，五爪张开可撕裂虚空，无视一切防御。"
    },
    {
        id: "weapons_998",
        name: "玄天星斗百变伞",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 34, mag_atk: 11, crit: 40, speed: 30, sharpness: 80 },
        value: 67000,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "内藏三千六百根蚀灵针。既是绝对防御的盾，也是瞬间爆发法术洪流的神兵。"
    },
    {
        id: "weapons_999",
        name: "传世名器·千机变",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 5,
        effects: { phy_atk: 23, mag_atk: 22, crit: 40, speed: 30, sharpness: 80 },
        value: 67000,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "千机阁历代阁主心血结晶。外形变幻莫测，法力流转浑然天成，是奇门遁甲之术的极致体现。"
    }
];
const weapons_r5_batch3 = [
    // === 剑 (Bal 模组 | 系数: 1.0, 1.1, 0.0, 1.0 | Req 配比 5:0:5) ===
    // Total_Req 75 -> 精 37.5 / 气 0 / 神 37.5 -> 取整 [37, 0, 38]

    {
        id: "weapons_1000",
        name: "天枢古剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 50, mag_atk: 0, crit: 11, speed: 0, sharpness: 50 },
        value: 34900,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "采北斗天枢星陨铁铸造，剑身厚重如山，挥舞间隐有星辰坠地之重，是古之剑圣的佩兵。"
    },
    {
        id: "weapons_1001",
        name: "龙泉淬灵宝剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 37, mag_atk: 13, crit: 11, speed: 0, sharpness: 50 },
        value: 34900,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "取龙泉深处地心乳淬火，剑脊隐现龙纹，每一次挥动都能带起澎湃的江海灵压。"
    },
    {
        id: "weapons_1002",
        name: "太虚真传长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 25, mag_atk: 25, crit: 11, speed: 0, sharpness: 50 },
        value: 34900,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "道门太虚观的镇派利器，材质极其匀称，能在瞬间将持有者的内气转化为纯粹的玄清剑气。"
    },
    {
        id: "weapons_1003",
        name: "纯钧断金剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 63, mag_atk: 0, crit: 17, speed: 0, sharpness: 75 },
        value: 47400,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "传世名剑，剑刃经过秘法开锋，虽厚重却利可切发，物理压制力在 R5 级别中名列前茅。"
    },
    {
        id: "weapons_1004",
        name: "紫电裂空神锋",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 47, mag_atk: 16, crit: 17, speed: 0, sharpness: 75 },
        value: 47400,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "揉入了雷击枣木精髓，剑气带有极强的麻痹效果。挥砍时雷鸣阵阵，专破护体罡气。"
    },
    {
        id: "weapons_1005",
        name: "万剑归宗·孤星",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 32, mag_atk: 31, crit: 17, speed: 0, sharpness: 75 },
        value: 47400,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "能够与使用者的神识产生共鸣的神兵，物理韧性与灵力响应达到了令人惊叹的平衡。"
    },
    {
        id: "weapons_1006",
        name: "轩辕·断魂长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 75, mag_atk: 0, crit: 22, speed: 0, sharpness: 100 },
        value: 58550,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "R5级别巅峰，纯乌金打造。此剑一出，方圆十丈生机断绝，是战争与权力的终极象征。"
    },
    {
        id: "weapons_1007",
        name: "昆仑冰魄剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 56, mag_atk: 19, crit: 22, speed: 0, sharpness: 100 },
        value: 58550,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "采万年冰川核心打造，剑气凛冽刺骨，不仅能冻结敌人的肢体，更能迟滞其内力流转。"
    },
    {
        id: "weapons_1008",
        name: "名剑·惊鸿一瞥",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 38, mag_atk: 37, crit: 22, speed: 0, sharpness: 100 },
        value: 58550,
        req: { jing: 37, qi: 0, shen: 38 },
        desc: "名动天下的传世孤品。此剑灵性已极，能主动捕捉空中的灵力破绽，一击即溃。"
    },

    // === 刀 (Bal 模组 | 系数: 1.15, 0.9, -0.5, 1.1 | Req 配比 7:0:3) ===
    // Total_Req 75 -> 精 52.5 / 气 0 / 神 22.5 -> 取整 [52, 0, 23]

    {
        id: "weapons_1009",
        name: "陷阵虎威重刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 58, mag_atk: 0, crit: 9, speed: -5, sharpness: 55 },
        value: 35825,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "由开国猛将曾持用的重型战刀，刀脊极厚，下砸之力犹如虎扑，物理威慑力极强。"
    },
    {
        id: "weapons_1010",
        name: "赤铜流火斩月刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 44, mag_atk: 14, crit: 9, speed: -5, sharpness: 55 },
        value: 35825,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "在精钢中揉入赤金矿，刀身呈现暗红色，劈砍时带起灼热的内气浪潮。"
    },
    {
        id: "weapons_1011",
        name: "归元刀宗制式宝刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 29, mag_atk: 29, crit: 9, speed: -5, sharpness: 55 },
        value: 35825,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "刀宗供奉之作。虽无华丽装饰，但材质极简纯粹，对真元与蛮力的兼容达到了化境。"
    },
    {
        id: "weapons_1012",
        name: "屠龙黑金重刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 72, mag_atk: 0, crit: 14, speed: -8, sharpness: 82 },
        value: 47300,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "传闻曾饮龙血的邪异大刀，通体漆黑如墨，能吸收并放大持有者的杀气。"
    },
    {
        id: "weapons_1013",
        name: "符纹淬灵蚀骨刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 54, mag_atk: 18, crit: 14, speed: -8, sharpness: 82 },
        value: 47300,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "刀面刻满了极具侵蚀力的阴风符文。每一击都能腐蚀敌人的护体灵光，法穿惊人。"
    },
    {
        id: "weapons_1014",
        name: "成名刀皇·断空",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 36, mag_atk: 36, crit: 14, speed: -8, sharpness: 82 },
        value: 47300,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "某代刀皇的成名武装。不仅锋利，其结构更能在劈砍时产生共振，无视大部分物理阻力。"
    },
    {
        id: "weapons_1015",
        name: "大将军·斩马巨刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 86, mag_atk: 0, crit: 18, speed: -10, sharpness: 110 },
        value: 58150,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "R5刀系物理之巅。单凭重量即可震碎五品以下的一切防御，是战场收割的终极重器。"
    },
    {
        id: "weapons_1016",
        name: "寒铁嵌灵裂魂刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 65, mag_atk: 21, crit: 18, speed: -10, sharpness: 110 },
        value: 58150,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "镶嵌了深海寒铁晶核。挥击时带起的沉重灵压能直接攻击对手的心神，令其无法还击。"
    },
    {
        id: "weapons_1017",
        name: "名坊·百战不屈",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 43, mag_atk: 43, crit: 18, speed: -10, sharpness: 110 },
        value: 58150,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "名坊流水线出的顶级成品，虽为制式但工艺已达巅峰，是万军丛中取将首级的利器。"
    }
];
const weapons_r5_batch4 = [
    // === 铍 (Bal 模组 | 系数: 1.20, 0.8, -0.8, 1.2 | Req 配比 6:0:4) ===
    // Total_Req 75 -> 精 45 / 气 0 / 神 30

    {
        id: "weapons_1018",
        name: "镇国玄铁铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 0, crit: 8, speed: -8, sharpness: 60 },
        value: 35400,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "古时镇国大将的仪仗兵刃，通体由深海玄铁铸成，铍头宽大如剑，兼具突刺与横斩的恐怖力量。"
    },
    {
        id: "weapons_1019",
        name: "青虹贯日铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 15, crit: 8, speed: -8, sharpness: 60 },
        value: 35400,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "铍刃流转着如长虹般的青色灵光。在战场上挥舞时，能引动方圆数丈的灵气暴乱，撕碎敌军防线。"
    },
    {
        id: "weapons_1020",
        name: "中庸道传长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 30, mag_atk: 30, crit: 8, speed: -8, sharpness: 60 },
        value: 35400,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "道门战将所持，讲求“刚柔并济”。铍杆弹性惊人且能完美传导神识，是兵家与法家结合的杰作。"
    },
    {
        id: "weapons_1021",
        name: "黑龙夺命铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 75, mag_atk: 0, crit: 12, speed: -12, sharpness: 90 },
        value: 46350,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "因铍头形似黑龙张口而得名，极其沉重，全力一刺足以贯穿重装铁骑的连环铠甲。"
    },
    {
        id: "weapons_1022",
        name: "符光淬火穿云铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 56, mag_atk: 19, crit: 12, speed: -12, sharpness: 90 },
        value: 46350,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "经过九天雷火淬炼，刃尖常年保持着暗红色高温，能瞬间融化目标表面的法力护盾。"
    },
    {
        id: "weapons_1023",
        name: "江湖名师·龙胆",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 38, mag_atk: 37, crit: 12, speed: -12, sharpness: 90 },
        value: 46350,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "某位成名已久的枪术大师晚年改制的长铍，结构之严密达到了 R5 的工艺极限，灵气响应极快。"
    },
    {
        id: "weapons_1024",
        name: "武圣·断河长铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 90, mag_atk: 0, crit: 16, speed: -16, sharpness: 120 },
        value: 57300,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "R5级别物理之巅。传说曾有一位猛将以此铍在战场上横扫，连河水都因其气势而断流。"
    },
    {
        id: "weapons_1025",
        name: "寒铁嵌灵彻地铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 68, mag_atk: 22, crit: 16, speed: -16, sharpness: 120 },
        value: 57300,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "铍头内嵌万年寒铁精母，每一次刺击都带起剧烈的冰晶炸裂，专门克制各种刚猛的护体硬功。"
    },
    {
        id: "weapons_1026",
        name: "名坊·万将之尊",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 45, crit: 16, speed: -16, sharpness: 120 },
        value: 57300,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "名家坊市的扛鼎神兵。不仅能承载海量的物理内劲，更能承载高阶修士的元神投影攻击。"
    },

    // === 矛 (Reach 模组 | 系数: 1.25, 0.8, -1.0, 1.2 | Req 配比 6:0:4) ===
    // Total_Req 75 -> 精 45 / 气 0 / 神 30

    {
        id: "weapons_1027",
        name: "丈八蛇矛·仿",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 63, mag_atk: 0, crit: 8, speed: -10, sharpness: 60 },
        value: 36300,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "参考上古神兵形制打造，矛头弯曲如蛇，一旦入体极难拔出，带有极强的物理穿刺伤害。"
    },
    {
        id: "weapons_1028",
        name: "青虹贯影灵矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 47, mag_atk: 16, crit: 8, speed: -10, sharpness: 60 },
        value: 36300,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "矛杆由千年铁桦木制成，通气性极佳。挥舞时能产生长达数尺的灵力矛头残影。"
    },
    {
        id: "weapons_1029",
        name: "太极玄清刺矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 31, mag_atk: 32, crit: 8, speed: -10, sharpness: 60 },
        value: 36300,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "道门真武堂的镇派法器，矛尖不仅锋利，更能在刺中敌方时瞬间爆发玄清真气，内伤难愈。"
    },
    {
        id: "weapons_1030",
        name: "黑钢陷阵大矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 78, mag_atk: 0, crit: 12, speed: -15, sharpness: 90 },
        value: 47025,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "军中杀器。纯黑钢铸造的矛身重达百斤，一旦发动冲锋，几乎没有任何屏障能挡其一刺。"
    },
    {
        id: "weapons_1031",
        name: "符纹淬灵破障矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 59, mag_atk: 19, crit: 12, speed: -15, sharpness: 90 },
        value: 47025,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "矛面布满了增强穿透力的流转符文。即便是高阶修士的随身灵盾，也会被其法术波动瞬间击穿。"
    },
    {
        id: "weapons_1032",
        name: "成名宗师·惊龙",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 39, mag_atk: 39, crit: 12, speed: -15, sharpness: 90 },
        value: 47025,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "曾随某位成名已久的枪圣纵横天下。矛灵已觉醒，能在攻击时产生阵阵龙鸣，震慑敌胆。"
    },
    {
        id: "weapons_1033",
        name: "霸王·神威矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 94, mag_atk: 0, crit: 16, speed: -20, sharpness: 120 },
        value: 58200,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "R5长兵物理之最。矛头由星辰碎玉与乌金融合而成，物理冲击力足以震碎同级的任何防具。"
    },
    {
        id: "weapons_1034",
        name: "紫金嵌纹碎魂矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 70, mag_atk: 24, crit: 16, speed: -20, sharpness: 120 },
        value: 58200,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "嵌入了珍贵的紫金灵髓。刺出的不仅仅是实体矛尖，还有一道能撕裂敌人元神的神识尖锋。"
    },
    {
        id: "weapons_1035",
        name: "名坊·独步天下",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 47, mag_atk: 47, crit: 16, speed: -20, sharpness: 120 },
        value: 58200,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "名家坊市的镇馆之宝。其平衡性、威力和灵敏度的结合达到了神话级别，乃传世之杰作。"
    }
];
const weapons_r5_batch5 = [
    // === 戈 (Reach 模组 | 系数: 1.30, 0.7, -1.2, 0.9 | Req 配比 7:0:3) ===
    // Total_Req 75 -> 精 52 / 气 0 / 神 23 (取整)

    {
        id: "weapons_1036",
        name: "大荒青铜古戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 65, mag_atk: 0, crit: 7, speed: -12, sharpness: 45 },
        value: 35100,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "出土自大荒古迹的神兵，戈身布满斑驳绿锈却锐利依旧，每一次横勾都带有远古的苍凉气劲。"
    },
    {
        id: "weapons_1037",
        name: "纹银流光夺魄戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 49, mag_atk: 16, crit: 7, speed: -12, sharpness: 45 },
        value: 35100,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "在精炼戈脊中嵌入了高纯度纹银灵脉，挥舞时流光溢彩，能通过钩击瞬间扰乱目标的法力运行。"
    },
    {
        id: "weapons_1038",
        name: "太虚宗师平意戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 32, mag_atk: 33, crit: 7, speed: -12, sharpness: 45 },
        value: 35100,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "道门宗师归隐前所铸，舍弃了繁琐攻击，专注于气息的平稳输出，法力兼容性在长兵中首屈一指。"
    },
    {
        id: "weapons_1039",
        name: "黑钢断空重戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 81, mag_atk: 0, crit: 11, speed: -18, sharpness: 68 },
        value: 45700,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "由地底黑钢精母打造，戈头极重。砸击时如崩山，钩扯时若裂地，是 R5 级别的物理重击代表。"
    },
    {
        id: "weapons_1040",
        name: "符纹淬灵赤焰戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 61, mag_atk: 20, crit: 11, speed: -18, sharpness: 68 },
        value: 45700,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "经过九幽炼狱火符淬炼，戈刃通体赤红。啄击时能瞬间引发小规模法力爆燃，专破高阶护甲。"
    },
    {
        id: "weapons_1041",
        name: "传世孤品·铁戟温侯戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 41, mag_atk: 40, crit: 11, speed: -18, sharpness: 68 },
        value: 45700,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "曾随某位乱世枭雄征战四方的名戈。其力感与灵动的结合已达化境，挥动间残影重重。"
    },
    {
        id: "weapons_1042",
        name: "武皇令·镇岳戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 98, mag_atk: 0, crit: 14, speed: -24, sharpness: 90 },
        value: 55800,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "R5级别戈类巅峰，材质极其致密，纯粹的物理破坏力。被此戈钩中者，纵是金刚不坏身亦要脱层皮。"
    },
    {
        id: "weapons_1043",
        name: "寒铁嵌纹裂天戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 73, mag_atk: 25, crit: 14, speed: -24, sharpness: 90 },
        value: 55800,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "戈面镶嵌了万年寒铁母，挥舞时产生的冷冽灵压足以撕开任何法力防护，法术穿透极高。"
    },
    {
        id: "weapons_1044",
        name: "名坊·独步寰宇",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 49, mag_atk: 49, crit: 14, speed: -24, sharpness: 90 },
        value: 55800,
        req: { jing: 52, qi: 0, shen: 23 },
        desc: "名家坊市的究极收藏，既是杀戮之兵也是通灵法宝。整体材质对真元极其亲和，名震诸界。"
    },

    // === 戟 (Reach 模组 | 系数: 1.40, 0.6, -1.5, 1.1 | Req 配比 6:0:4) ===
    // Total_Req 75 -> 精 45 / 气 0 / 神 30

    {
        id: "weapons_1045",
        name: "百炼方天成名戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 70, mag_atk: 0, crit: 6, speed: -15, sharpness: 55 },
        value: 36275,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "工艺极其精湛的方天戟，矛尖与月牙刃衔接浑然一体，是战场精锐将领的史诗武装。"
    },
    {
        id: "weapons_1046",
        name: "青虹绕月画戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 52, mag_atk: 18, crit: 6, speed: -15, sharpness: 55 },
        value: 36275,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "戟面如同明镜般清亮，能反射月华。在灵力的催动下，月牙刃会产生剧烈的切割波纹。"
    },
    {
        id: "weapons_1047",
        name: "归元宗师开山戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 35, mag_atk: 35, crit: 6, speed: -15, sharpness: 55 },
        value: 36275,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "追求极致平衡的宗师杰作。此戟在手，物理突刺与内力劈砍可瞬间切换，毫无滞涩。"
    },
    {
        id: "weapons_1048",
        name: "玄武镇海大戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 87, mag_atk: 0, crit: 10, speed: -23, sharpness: 83 },
        value: 47125,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "重逾百斤的沉钢大戟，具有不可思议的硬度。下劈时犹如巨浪排空，无坚不摧。"
    },
    {
        id: "weapons_1049",
        name: "符纹淬火惊雷戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 66, mag_atk: 21, crit: 10, speed: -23, sharpness: 83 },
        value: 47125,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "经过天雷阵法淬火，戟尖隐现电弧。在大规模战场上，其引发的灵压震荡能横扫周边兵卒。"
    },
    {
        id: "weapons_1050",
        name: "江湖神话·龙魂戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 44, mag_atk: 43, crit: 10, speed: -23, sharpness: 83 },
        value: 47125,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "相传戟中封印有幼龙精魄，在战斗中能感受到隐隐龙吟，其物理与灵力的爆发力极强。"
    },
    {
        id: "weapons_1051",
        name: "霸王令·陨星神戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 105, mag_atk: 0, crit: 12, speed: -30, sharpness: 110 },
        value: 56800,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "R5戟类物理巅峰。由坠星铁母精炼，虽然沉重缓慢，但每一击皆是绝对的毁灭。"
    },
    {
        id: "weapons_1052",
        name: "紫金嵌灵通天戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 79, mag_atk: 26, crit: 12, speed: -30, sharpness: 110 },
        value: 56800,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "嵌入了极品紫金灵髓，杆身通体灵力流转。刺击时伴随强大的神识冲击，直接碎裂对方灵魂防御。"
    },
    {
        id: "weapons_1053",
        name: "传世孤品·定乾坤",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 53, mag_atk: 52, crit: 12, speed: -30, sharpness: 110 },
        value: 56800,
        req: { jing: 45, qi: 0, shen: 30 },
        desc: "名家坊市百年来最伟大的作品，取名“定乾坤”。其神乎其技的平衡感让任何武者都能迅速上手，展现神迹。"
    }
];
const weapons_r5_batch6 = [
    // === 长铩 (Reach 模组 | 系数: 1.45, 0.5, -1.8, 1.0 | Req 配比 8:0:2) ===
    // Total_Req 75 -> 精 60 / 气 0 / 神 15

    {
        id: "weapons_1054",
        name: "百炼精钢夺命铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 73, mag_atk: 0, crit: 5, speed: -18, sharpness: 50 },
        value: 35800,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "由百炼精钢反复折叠锻打，刃部极长且厚，挥舞间能轻易斩断敌军的长矛杆，是名将突围的利器。"
    },
    {
        id: "weapons_1055",
        name: "青虹绕梁灵铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 55, mag_atk: 18, crit: 5, speed: -18, sharpness: 50 },
        value: 35800,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "在铩尖中融入了青虹石碎屑，攻击时会产生刺耳的灵力尖啸，能有效扰乱敌方阵型中的真气流动。"
    },
    {
        id: "weapons_1056",
        name: "中庸之道传长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 36, mag_atk: 36, crit: 5, speed: -18, sharpness: 50 },
        value: 35350,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "道门护法战将所持。虽长度惊人却重心极稳，讲求一击必杀，物理力量与神识引导达到了微妙的平衡。"
    },
    {
        id: "weapons_1057",
        name: "黑钢陷阵大长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 91, mag_atk: 0, crit: 8, speed: -27, sharpness: 75 },
        value: 45825,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "重型黑钢铸造，铩刃沉重如巨剑。在万军丛中横扫而出，方圆三丈之内人马俱碎。"
    },
    {
        id: "weapons_1058",
        name: "符纹淬火惊雷铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 68, mag_atk: 23, crit: 8, speed: -27, sharpness: 75 },
        value: 45825,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "刻满了增强破甲的雷霆符文。挥动时伴随阵阵闷雷声，法术穿透极强，专门克制厚重的法力甲胄。"
    },
    {
        id: "weapons_1059",
        name: "宗师名作·贯日",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 45, crit: 8, speed: -27, sharpness: 75 },
        value: 45375,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "某代枪铩宗师的成名神兵。铩身采用灵通木，能完美放大持有者的真元爆发，具有极高的灵性。"
    },
    {
        id: "weapons_1060",
        name: "武圣·断长空铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 109, mag_atk: 0, crit: 10, speed: -36, sharpness: 100 },
        value: 54950,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "R5长兵物理倍率之巅。由罕见的天外陨铁磨制，沉重到极致亦锋利到极致，是破阵杀敌的终极战器。"
    },
    {
        id: "weapons_1061",
        name: "寒铁嵌灵彻影铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 82, mag_atk: 27, crit: 10, speed: -36, sharpness: 100 },
        value: 54950,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "刃脊嵌入万年寒铁母。每一次劈砍都能激发出足以冻结灵魂的冷冽气劲，无视常规五行防御。"
    },
    {
        id: "weapons_1062",
        name: "名坊·百战归宗",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 5,
        effects: { phy_atk: 54, mag_atk: 54, crit: 10, speed: -36, sharpness: 100 },
        value: 54500,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "名家坊市的扛鼎长兵。此铩已臻化境，能随使用者的呼吸调整灵压输出，乃是传世名器中的极品。"
    },

    // === 钺 (Heavy 模组 | 系数: 1.60, 0.4, -2.2, 0.8 | Req 配比 9:0:1) ===
    // Total_Req 75 -> 精 68 / 气 0 / 神 7 (取整)

    {
        id: "weapons_1063",
        name: "开国功勋玄金钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 80, mag_atk: 0, crit: 4, speed: -22, sharpness: 40 },
        value: 36650,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "古皇朝赐予立国功臣的重器。钺面宽大厚重，一击之下足以将持盾者连人带盾砸成肉泥。"
    },
    {
        id: "weapons_1064",
        name: "赤铜淬影焚天钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 20, crit: 4, speed: -22, sharpness: 40 },
        value: 36650,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "掺杂了赤铜精母打造，钺身自带烈焰。在重击目标时能引发小范围火属性法术爆裂。"
    },
    {
        id: "weapons_1065",
        name: "归元太一镇守钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 40, mag_atk: 40, crit: 4, speed: -22, sharpness: 40 },
        value: 36650,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "道门力士镇守山门之兵。材质极度坚韧，能承受巨大的法力灌注而不崩坏，力感与灵压共济。"
    },
    {
        id: "weapons_1066",
        name: "巨灵黑钢破山钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 100, mag_atk: 0, crit: 6, speed: -33, sharpness: 60 },
        value: 45975,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "重如小山的钺头，纯黑钢精母铸就。纯粹为了破坏防御而生，是战场重甲步兵的噩梦。"
    },
    {
        id: "weapons_1067",
        name: "符光蚀魂斩妖钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 75, mag_atk: 25, crit: 6, speed: -33, sharpness: 60 },
        value: 45975,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "刻满了密集的“蚀魂”符阵。在劈中肉身的同时，其蕴含的法力能瞬间震荡敌人的神魂。"
    },
    {
        id: "weapons_1068",
        name: "成名宗师·刑天",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 50, mag_atk: 50, crit: 6, speed: -33, sharpness: 60 },
        value: 45975,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "某位重兵器宗师参照上古战神之意打造。钺身自带不屈意志，挥舞时的物理气浪极具穿透性。"
    },
    {
        id: "weapons_1069",
        name: "武皇令·寰宇绝杀钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 120, mag_atk: 0, crit: 8, speed: -44, sharpness: 80 },
        value: 55300,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "R5重型物理极限。单次攻击造成的破坏力堪比攻城器械，是真正意义上的碎颅杀器。"
    },
    {
        id: "weapons_1070",
        name: "紫金嵌灵透骨钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 90, mag_atk: 30, crit: 8, speed: -44, sharpness: 80 },
        value: 55300,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "钺刃边缘嵌有紫金灵髓。利用钺的巨大质量产生物理压制，再瞬间传导法术冲击，破阵之王。"
    },
    {
        id: "weapons_1071",
        name: "名坊·独步九天",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 60, crit: 8, speed: -44, sharpness: 80 },
        value: 55300,
        req: { jing: 68, qi: 0, shen: 7 },
        desc: "名家坊市的巅峰重器。其不仅拥有无与伦比的杀伤力，其法力传导效率在重型兵刃中也是神迹。"
    }
];
const weapons_r5_batch7 = [
    // === 斧 (Heavy 模组 | 系数: 1.65, 0.3, -2.5, 0.9 | Req 配比 8:0:2) ===
    // Total_Req 75 -> 精 60 / 气 0 / 神 15

    {
        id: "weapons_1072",
        name: "天崩精钢宣花斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 83, mag_atk: 0, crit: 3, speed: -25, sharpness: 45 },
        value: 36675,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "由万年精铁锻制的宣花大斧，斧面阔大如扇，挥舞时带起的风压足以让普通军卒窒息。"
    },
    {
        id: "weapons_1073",
        name: "赤金流火开山斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 62, mag_atk: 21, crit: 3, speed: -25, sharpness: 45 },
        value: 36675,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "在斧脊中注入了炽热的赤金矿液，劈砍时伴随着滚烫的真气爆发，乃是开国猛将的战阵利器。"
    },
    {
        id: "weapons_1074",
        name: "归元太一浑元斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 41, mag_atk: 42, crit: 3, speed: -25, sharpness: 45 },
        value: 36675,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "道门力士秘传的平衡大斧，杆身韧性极佳，能将持有者的浑厚真元无损传导至斧刃瞬间爆发。"
    },
    {
        id: "weapons_1075",
        name: "黑龙噬魂巨斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 103, mag_atk: 0, crit: 5, speed: -38, sharpness: 68 },
        value: 45700,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "黑钢精母打就的凶兵，斧头重逾千斤。曾在上古战场中劈碎过无数妖王遗骨，凶威盖世。"
    },
    {
        id: "weapons_1076",
        name: "符纹雷动震山斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 77, mag_atk: 26, crit: 5, speed: -38, sharpness: 68 },
        value: 45700,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "刻满了密集的九天雷鸣符文。劈砍目标时引发剧烈的法力爆震，能无视大部分凡铁护甲。"
    },
    {
        id: "weapons_1077",
        name: "传世孤品·巨灵",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 52, mag_atk: 51, crit: 5, speed: -38, sharpness: 68 },
        value: 45700,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "某代横练宗师的成名利器。物理打击感与灵压释放完美契合，是力道与玄法的巅峰结合。"
    },
    {
        id: "weapons_1078",
        name: "霸王令·陨星开路斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 124, mag_atk: 0, crit: 6, speed: -50, sharpness: 90 },
        value: 54450,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "R5级别斧系物理巅峰。天外陨铁打造，纯粹的重量与惯性带来的破坏力足以碎裂城门。"
    },
    {
        id: "weapons_1079",
        name: "寒铁嵌灵裂魂斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 93, mag_atk: 31, crit: 6, speed: -50, sharpness: 90 },
        value: 54450,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "斧刃中心嵌有极寒之晶。不仅物理劈砍力惊人，更能以冰冷灵压冻结敌人的经脉运转。"
    },
    {
        id: "weapons_1080",
        name: "名坊·独步蛮荒",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 62, mag_atk: 62, crit: 6, speed: -50, sharpness: 90 },
        value: 54450,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "名家坊市的扛鼎神斧。此斧具有奇特的灵性反馈，能在大规模战场中吸收杀意强化攻击。"
    },

    // === 椎 (Heavy 模组 | 系数: 1.85, 0.0, -3.5, 0.4 | Req 配比 10:0:0) ===
    // Total_Req 75 -> 精 75 / 气 0 / 神 0

    {
        id: "weapons_1081",
        name: "百炼精铁镇岳椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 93, mag_atk: 0, crit: 0, speed: -35, sharpness: 20 },
        value: 34975,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "由实心精铁胎反复淬炼而成的重椎。没有任何花哨，唯有重力带来的极致物理碾压。"
    },
    {
        id: "weapons_1082",
        name: "纹铜重木灵缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 69, mag_atk: 23, crit: 0, speed: -35, sharpness: 20 },
        value: 34525,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "千年沉檀木为芯，包覆厚重纹铜。砸击地面时能产生沉闷的内劲涟漪，干扰方圆真元。"
    },
    {
        id: "weapons_1083",
        name: "流云堂宗师练功缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 46, mag_atk: 46, crit: 0, speed: -35, sharpness: 20 },
        value: 34525,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "宗门特制的重力器械，对法力传导具有极高的宽容度。虽为椎类，其平衡感却出奇的好。"
    },
    {
        id: "weapons_1084",
        name: "乌金八角镇魂椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 116, mag_atk: 0, crit: 0, speed: -53, sharpness: 30 },
        value: 41775,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "八角攒尖结构，将陨铁重力汇聚于一点。即便是五品防具，在其全力一击下亦会粉碎。"
    },
    {
        id: "weapons_1085",
        name: "符纹淬灵雷鸣缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 87, mag_atk: 29, crit: 0, speed: -53, sharpness: 30 },
        value: 41775,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "经过高级雷震符文淬火，砸击时伴随剧烈的雷鸣声，法力波动的物理穿刺性极其恐怖。"
    },
    {
        id: "weapons_1086",
        name: "传世孤品·憾山",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 58, mag_atk: 58, crit: 0, speed: -53, sharpness: 30 },
        value: 41775,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "某位成名已久的力士宗师所遗。椎身布满了战斗的痕迹，是物理重压与灵力协同的传世典范。"
    },
    {
        id: "weapons_1087",
        name: "武皇令·破城巨椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 139, mag_atk: 0, crit: 0, speed: -70, sharpness: 40 },
        value: 48800,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "全系统物理攻击巅峰。纯粹的破坏欲望凝结而成的重器，是战场上最为原始且致命的杀机。"
    },
    {
        id: "weapons_1088",
        name: "寒铁嵌灵碎虚缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 104, mag_atk: 35, crit: 0, speed: -70, sharpness: 40 },
        value: 48800,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "椎头核心嵌入了极寒矿心。砸中目标时产生的物理压迫与灵力穿刺，足以击穿任何修士的真元保护。"
    },
    {
        id: "weapons_1089",
        name: "名坊·百战霸王",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 69, mag_atk: 70, crit: 0, speed: -70, sharpness: 40 },
        value: 48800,
        req: { jing: 75, qi: 0, shen: 0 },
        desc: "名家坊市的巅峰神缒。结构平衡达到了不可思议的地步，能将持有者的气力与法力完美汇聚喷薄。"
    }
];
const weapons_r5_batch8 = [
    // === 殳 (Heavy 模组 | 系数: 1.55, 0.5, -2.0, 0.5 | Req 配比 8:0:2) ===
    // Total_Req 75 -> 精 60 / 气 0 / 神 15

    {
        id: "weapons_1090",
        name: "百炼玄铁镇魔殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 78, mag_atk: 0, crit: 5, speed: -20, sharpness: 25 },
        value: 36350,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "由千年玄铁铸就的重型长殳，殳头六棱分明，即便是不动用真气的挥砸也足以让山石崩裂。"
    },
    {
        id: "weapons_1091",
        name: "青虹流光引灵殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 58, mag_atk: 19, crit: 5, speed: -20, sharpness: 25 },
        value: 35900,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "殳身缠绕着青虹石丝线，在大力打击时能产生强烈的法力震荡，专门针对敌方阵型的灵力护持。"
    },
    {
        id: "weapons_1092",
        name: "归元太一传世殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 39, mag_atk: 39, crit: 5, speed: -20, sharpness: 25 },
        value: 36350,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "道门护法宗师留下的传世之宝，材质极度平衡，物理重压与内力加持结合得浑然天成。"
    },
    {
        id: "weapons_1093",
        name: "黑钢陷阵大杀殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 97, mag_atk: 0, crit: 8, speed: -30, sharpness: 38 },
        value: 46000,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "军中杀将的专属重器，采用极沉的黑钢精母，打击时产生的恐怖动能足以震碎五品以下任何甲胄。"
    },
    {
        id: "weapons_1094",
        name: "符光淬火惊雷殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 73, mag_atk: 24, crit: 8, speed: -30, sharpness: 38 },
        value: 46000,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "殳头经过天雷符阵淬火，击中目标瞬间会爆发闷雷般的响动，从内部瓦解对手的防御真元。"
    },
    {
        id: "weapons_1095",
        name: "名门宗师·憾地",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 48, mag_atk: 49, crit: 8, speed: -30, sharpness: 38 },
        value: 46000,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "曾随成名宗师纵横一时的利器。其独特的杆身设计能大幅消除反震，让使用者能连续发动重击。"
    },
    {
        id: "weapons_1096",
        name: "武皇令·碎虚重殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 116, mag_atk: 0, crit: 10, speed: -40, sharpness: 50 },
        value: 54700,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "R5殳类物理之巅。殳头巨大且不规则，单凭纯粹的重量下砸便具有毁灭城防工事的威力。"
    },
    {
        id: "weapons_1097",
        name: "寒铁嵌灵透甲殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 87, mag_atk: 29, crit: 10, speed: -40, sharpness: 50 },
        value: 54700,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "嵌入了深海寒铁晶核，能在物理撞击的同时释放极度严寒。法术穿透效果在钝击武器中极其罕见。"
    },
    {
        id: "weapons_1098",
        name: "名坊·独步战疆",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 5,
        effects: { phy_atk: 58, mag_atk: 58, crit: 10, speed: -40, sharpness: 50 },
        value: 54700,
        req: { jing: 60, qi: 0, shen: 15 },
        desc: "名坊出品的顶级收藏品。整体结构达到了完美的应力分布，是暴力美学与炼器工艺的结合。"
    },

    // === 弩 (Range 模组 | 系数: 1.35, 1.0, -2.0, 0.0 | Req 配比 3:0:7) ===
    // Total_Req 75 -> 精 23 / 气 0 / 神 52

    {
        id: "weapons_1099",
        name: "百炼机括天弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 68, mag_atk: 0, crit: 10, speed: -20, sharpness: 0 },
        value: 35100,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "名匠以神机术打造的连发弩。弩臂由高强度合金叠合，射程极远，且箭矢带有剧烈的贯穿力。"
    },
    {
        id: "weapons_1100",
        name: "流光飞羽手弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 51, mag_atk: 17, crit: 10, speed: -20, sharpness: 0 },
        value: 35100,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "在弩机核心处镶嵌了引灵玉，发射时箭矢会附带一层流光，能有效追踪微弱的法力气息。"
    },
    {
        id: "weapons_1101",
        name: "归元太一神弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 34, mag_atk: 34, crit: 10, speed: -20, sharpness: 0 },
        value: 35100,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "道门神机堂的得意之作。弩箭在飞行中会根据射手的意念微调路径，法力传导在弩类中极其罕见。"
    },
    {
        id: "weapons_1102",
        name: "陷阵乌金重弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 84, mag_atk: 0, crit: 15, speed: -30, sharpness: 0 },
        value: 44550,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "军中斩将重弩。弩弦由极罕见的荒兽大筋绞合，一发弩箭射出，足以在千步外洞穿重盾。"
    },
    {
        id: "weapons_1103",
        name: "符纹淬灵破障弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 63, mag_atk: 21, crit: 15, speed: -30, sharpness: 0 },
        value: 44550,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "经过高级破法符文淬火。弩箭带有强烈的侵蚀效果，能通过持续的灵力振荡瓦解对方的护体罡气。"
    },
    {
        id: "weapons_1104",
        name: "神射宗师·穿云",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 42, mag_atk: 42, crit: 15, speed: -30, sharpness: 0 },
        value: 44550,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "曾由成名射神持用的法弩。其材质已觉醒了灵性，能自动弥补射手在拉弩时的真元波动。"
    },
    {
        id: "weapons_1105",
        name: "兵圣·神臂大弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 101, mag_atk: 0, crit: 20, speed: -40, sharpness: 0 },
        value: 54450,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "全系统单次发射威力之最。巨大的拉力需神识配合机械结构释放，是真正的单兵城防器械。"
    },
    {
        id: "weapons_1106",
        name: "紫金嵌灵绝影弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 76, mag_atk: 25, crit: 20, speed: -40, sharpness: 0 },
        value: 54450,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "弩身通体由紫金打造。弩箭在飞行过程中能彻底隐匿形迹，专门狙杀高阶法术防御者。"
    },
    {
        id: "weapons_1107",
        name: "名坊·独步天下",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 51, mag_atk: 50, crit: 20, speed: -40, sharpness: 0 },
        value: 54450,
        req: { jing: 23, qi: 0, shen: 52 },
        desc: "名坊出品的神兵。不仅物理威力惊人，更能将修士的神识增幅至极限，达到箭无虚发的神境。"
    }
];
const weapons_r5_batch9 = [
    // === 弓 (Range 模组 | 系数: 1.05, 1.5, -0.5, 0.0 | Req 配比 5:0:5) ===
    // Total_Req 75 -> 精 38 / 气 0 / 神 37 (取整)

    {
        id: "weapons_1108",
        name: "拓木胎龙筋战弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 53, mag_atk: 0, crit: 15, speed: -5, sharpness: 0 },
        value: 36225,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "由千年拓木与成年蛟龙大筋合制而成的强弓。拉开此弓需千斤神力，箭出如雷鸣，物理洞穿力极强。"
    },
    {
        id: "weapons_1109",
        name: "青虹贯日角弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 40, mag_atk: 13, crit: 15, speed: -5, sharpness: 0 },
        value: 36225,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "弓身呈现如半月般的青色光泽，射出的箭矢带有剧烈的法力波动，能通过震荡撕开灵力屏障。"
    },
    {
        id: "weapons_1110",
        name: "归元太一真武弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 26, mag_atk: 27, crit: 15, speed: -5, sharpness: 0 },
        value: 36225,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "道门圣物级长弓。其灵性已达通玄之境，能根据射手的本源属性自动调和法术箭矢，均衡无阻。"
    },
    {
        id: "weapons_1111",
        name: "堕天乌金大弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 66, mag_atk: 0, crit: 23, speed: -8, sharpness: 0 },
        value: 48600,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "全重乌金精母打造，极度的刚性带来了毁灭性的初速度。传说曾有箭术宗师持此弓射落空中妖皇。"
    },
    {
        id: "weapons_1112",
        name: "符光淬火啸天弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 49, mag_atk: 17, crit: 23, speed: -8, sharpness: 0 },
        value: 48600,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "经过九幽炼狱火符万次洗练，弓身布满熔岩裂纹。发射时带起剧烈的空气自燃，法术穿透极高。"
    },
    {
        id: "weapons_1113",
        name: "神射宗师·惊鸿",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 33, mag_atk: 33, crit: 23, speed: -8, sharpness: 0 },
        value: 48600,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "曾为某代箭神持有的名弓。弓灵已成，能捕捉目标在空间中的瞬间闪避位置，一击必杀。"
    },
    {
        id: "weapons_1114",
        name: "霸王·射日神弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 79, mag_atk: 0, crit: 30, speed: -10, sharpness: 0 },
        value: 60300,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "R5弓系物理巅峰。每一支离弦之箭都重逾泰山，即便被格挡，其产生的物理冲击也能击碎对方内脏。"
    },
    {
        id: "weapons_1115",
        name: "紫金嵌灵透骨弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 59, mag_atk: 20, crit: 30, speed: -10, sharpness: 0 },
        value: 60300,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "嵌入了极品紫金髓。射出的箭镞能在瞬间穿透法力流并引爆，对依赖防护罩的敌人是噩梦。"
    },
    {
        id: "weapons_1116",
        name: "名坊·独步长空",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 5,
        effects: { phy_atk: 39, mag_atk: 40, crit: 30, speed: -10, sharpness: 0 },
        value: 60300,
        req: { jing: 38, qi: 0, shen: 37 },
        desc: "名坊流水线中最完美的绝响。物理张力与法力引导达到了艺术般的和谐，是神射手的最高追求。"
    },

    // === 飞剑 (Relic 模组 | 系数: 1.00, 1.2, +1.2, 1.3 | Req 配比 1:6:3) ===
    // Total_Req 75 -> 精 7 / 气 45 / 神 23 (取整)

    {
        id: "weapons_1117",
        name: "百炼淬灵太阿剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 50, mag_atk: 0, mag_crit: 12, speed: 12, penetration: 65 },
        value: 39250,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "由上古名刃太阿的余料精铸而成，飞剑本身不仅具有恐怖的物理切割力，更带有无坚不摧的威道之气。"
    },
    {
        id: "weapons_1118",
        name: "青虹贯影灵剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 37, mag_atk: 13, mag_crit: 12, speed: 12, penetration: 65 },
        value: 39250,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "剑身呈现出极度纯粹的青色灵光。御剑时能分化出无数虚实难辨的剑影，干扰神识勘察。"
    },
    {
        id: "weapons_1119",
        name: "玉虚真传绝影剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 25, mag_atk: 25, mag_crit: 12, speed: 12, penetration: 65 },
        value: 39250,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "玉虚宫真传弟子的标志性兵刃。对真元的传导几乎达到了零损耗，剑气纵横，灵动异常。"
    },
    {
        id: "weapons_1120",
        name: "玄铁重华镇魔剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 63, mag_atk: 0, mag_crit: 18, speed: 18, penetration: 98 },
        value: 53500,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "在飞剑中极罕见地使用了实心玄铁。御剑撞击时力道堪比陨石坠落，足以正面硬撼重型盾阵。"
    },
    {
        id: "weapons_1121",
        name: "符纹淬灵赤霄剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 47, mag_atk: 16, mag_crit: 18, speed: 18, penetration: 98 },
        value: 53500,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "刻满了极高阶的聚火符纹。剑身离鞘即燃，能在虚空中划出焚毁灵气的裂痕，法穿极高。"
    },
    {
        id: "weapons_1122",
        name: "剑仙孤品·龙泉",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 31, mag_atk: 32, mag_crit: 18, speed: 18, penetration: 98 },
        value: 53500,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "传闻中某位白衣剑仙的佩剑。材质清亮如秋水，具有自动寻找真气节点的能力，是为神迹。"
    },
    {
        id: "weapons_1123",
        name: "圣祖·斩灵巨刃",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 75, mag_atk: 0, mag_crit: 24, speed: 24, penetration: 130 },
        value: 67250,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "R5飞剑物理之巅。剑身长达六尺，御使起来却轻若无物，一剑斩出，能将修士及其护身法宝一并切碎。"
    },
    {
        id: "weapons_1124",
        name: "寒铁嵌灵裂魂剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 56, mag_atk: 19, mag_crit: 24, speed: 24, penetration: 130 },
        value: 67250,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "剑芯由万年寒铁母打造。在御剑穿透目标的一瞬，极寒灵压会顺着伤口直接冻结敌人的神魂。"
    },
    {
        id: "weapons_1125",
        name: "名坊·独步青云",
        type: "weapon" , subType: "飞_剑",
        combatType: "未知", // 修正显示
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 37, mag_atk: 38, crit: 24, speed: 24, penetration: 130 },
        value: 67250,
        req: { jing: 7, qi: 45, shen: 23 },
        desc: "名家坊市百年来最引以为傲的飞剑。它代表了当世炼器术的极致，是修仙界公认的传世名器。"
    }
];
const weapons_r5_batch10 = [
    // === 法印 (Relic 模组 | 系数: 1.6, 0.5, -3.0, 1.1 | Req 配比 4:5:1) ===
    // Total_Req 75 -> 精 30 / 气 38 / 神 7 (取整)

    {
        id: "weapons_1126",
        name: "玄武镇海大印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 80, mag_atk: 0, mag_crit: 5, speed: -30, penetration: 55 },
        value: 36500,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "由实心玄铁精母铸造，重达万钧。印底刻有“海岳平定”纹路，砸击之下足以粉碎一切凡尘防御。"
    },
    {
        id: "weapons_1127",
        name: "五行流光乾坤印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 20, mag_crit: 5, speed: -30, penetration: 55 },
        value: 36500,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "印身流转着五彩斑斓的华光，能通过内部的灵石核心平衡五行。既是强力的攻击法宝，亦能作为稳固阵眼的基石。"
    },
    {
        id: "weapons_1128",
        name: "玉虚真传翻天印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 40, mag_atk: 40, mag_crit: 5, speed: -30, penetration: 55 },
        value: 36500,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "道门玉虚宫真传弟子的标志性法宝。虽为低阶版本，但其法力传导效率极高，砸击间带有淡淡的天威压制。"
    },
    {
        id: "weapons_1129",
        name: "黑钢陷阵督战印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 100, mag_atk: 0, mag_crit: 8, speed: -45, penetration: 82 },
        value: 46175,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "军中杀将的专属重器。纯黑钢精母打造，底部刻有毁灭性的物理破甲阵法，是战场上重装屏障的终结者。"
    },
    {
        id: "weapons_1130",
        name: "符光淬火烈阳大印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 75, mag_atk: 25, mag_crit: 8, speed: -45, penetration: 82 },
        value: 46175,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "经过九天雷火淬炼，印身微红发烫。激发时能爆发出剧烈的火焰灵压，专门灼烧目标的防御真元。"
    },
    {
        id: "weapons_1131",
        name: "成名宗师·覆地印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 50, mag_atk: 50, mag_crit: 8, speed: -45, penetration: 82 },
        value: 46175,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "曾由成名土系法修持用的成名作。其材质已半玉质化，物理撞击与法力波动达到了惊人的平衡。"
    },
    {
        id: "weapons_1132",
        name: "圣祖·开天镇岳印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 120, mag_atk: 0, mag_crit: 10, speed: -60, penetration: 110 },
        value: 55000,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "R5法印物理巅峰。传闻为古之圣皇镇压四方时所持，一击落下万山俱寂，物理破坏力无出其右。"
    },
    {
        id: "weapons_1133",
        name: "寒铁嵌灵蚀骨印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 90, mag_atk: 30, mag_crit: 10, speed: -60, penetration: 110 },
        value: 55000,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "印芯嵌入了万年寒铁精华。除了恐怖的砸击力外，产生的冰冻灵压能直接冻裂高阶修士的真身防御。"
    },
    {
        id: "weapons_1134",
        name: "名坊·四海平波",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 60, mag_crit: 10, speed: -60, penetration: 110 },
        value: 55000,
        req: { jing: 30, qi: 38, shen: 7 },
        desc: "名家坊市百年来最厚重的作品。其灵导率在重型法宝中堪称神迹，是名动一方的江湖重器。"
    },

    // === 宝葫芦 (Relic 模组 | 系数: 0.95, 1.0, 0.0, 1.4 | Req 配比 2:7:1) ===
    // Total_Req 75 -> 精 15 / 气 53 / 神 7 (取整)

    {
        id: "weapons_1135",
        name: "精铁护胎紫金葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 48, mag_atk: 0, mag_crit: 10, speed: 0, penetration: 70 },
        value: 34100,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "在万年灵木胎体外镶嵌了厚重的精铁。不仅能喷吐大量气劲，其外壳硬度也足以防御任何近身斩击。"
    },
    {
        id: "weapons_1136",
        name: "青虹流光吞灵葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 36, mag_atk: 12, mag_crit: 10, speed: 0, penetration: 70 },
        value: 34100,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "葫芦口萦绕着淡淡的青色。其内部自成乾坤，能将杂乱的空气转化为锐利的风刃喷发而出。"
    },
    {
        id: "weapons_1137",
        name: "流云真传药王葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 24, mag_atk: 24, mag_crit: 10, speed: 0, penetration: 70 },
        value: 34100,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "流云宗专门为下山医道弟子打造的名器。材质极其温润，在容纳真元与转化内劲上表现平稳之极。"
    },
    {
        id: "weapons_1138",
        name: "玄钢陷阵纳气葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 0, mag_crit: 15, speed: 0, penetration: 105 },
        value: 45750,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "军中精锐弩兵营督制的法宝。通体玄钢铸造，发射出的空气压缩炮具有显著的物理击退与破甲效果。"
    },
    {
        id: "weapons_1139",
        name: "符纹淬灵赤焰葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 15, mag_crit: 15, speed: 0, penetration: 105 },
        value: 45750,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "刻满了高阶熔岩咒文。喷出的法力洪流伴随着熔岩碎片，对依赖物理屏障的对手具有毁灭性打击。"
    },
    {
        id: "weapons_1140",
        name: "酒仙孤品·醉生梦死",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 30, mag_atk: 30, mag_crit: 15, speed: 0, penetration: 105 },
        value: 45750,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "传闻为上代酒剑仙留下的遗物。材质已完全化为翠玉，吐出的法力云雾能显著降低目标的血气回复速度。"
    },
    {
        id: "weapons_1141",
        name: "圣祖·乾坤一气葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 71, mag_atk: 0, mag_crit: 20, speed: 0, penetration: 140 },
        value: 56950,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "R5葫芦系之最。其喷吐之威犹如山崩，物理材质足以硬抗五品神兵而不留痕迹，乃是传世至宝。"
    },
    {
        id: "weapons_1142",
        name: "寒铁嵌灵彻地葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 53, mag_atk: 18, mag_crit: 20, speed: 0, penetration: 140 },
        value: 56950,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "嵌入了极地寒铁矿心。喷出的法力射线带有极强的灵感穿透效果，瞬间封锁目标的法力回路。"
    },
    {
        id: "weapons_1143",
        name: "名坊·独步灵霄",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 35, mag_atk: 36, mag_crit: 20, speed: 0, penetration: 140 },
        value: 56950,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "名家坊市的顶级神作。外观瑰丽且灵导性达到了极致，是修仙界公认的顶级战斗容器。"
    }
];
const weapons_r5_batch11 = [
    // === 阵盘 (Relic 模组 | 系数: 1.10, 1.4, -1.5, 1.9 | Req 配比 1:4:5) ===
    // Total_Req 75 -> 精 7 / 气 30 / 神 38 (取整)

    {
        id: "weapons_1144",
        name: "玄武镇岳阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 55, mag_atk: 0, mag_crit: 14, speed: -15, penetration: 95 },
        value: 38725,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "通体由深海玄铁铸造，盘身重若千钧。激发时不仅能稳固地脉，其物理震荡力亦足以崩裂寻常兵刃。"
    },
    {
        id: "weapons_1145",
        name: "青虹五行演算盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 41, mag_atk: 14, mag_crit: 14, speed: -15, penetration: 95 },
        value: 38725,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "盘面由青色流金勾勒出复杂的五行回路，能大幅度加速灵气的转化与喷发，是成名阵法师的看家法宝。"
    },
    {
        id: "weapons_1146",
        name: "玉虚真传星璇盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 28, mag_atk: 27, mag_crit: 14, speed: -15, penetration: 95 },
        value: 38725,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "道门玉虚宫嫡传弟子的标志性阵盘。材质极其剔透，能让阵法在虚实之间自由转换，平衡性极佳。"
    },
    {
        id: "weapons_1147",
        name: "黑钢陷阵屠灵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 69, mag_atk: 0, mag_crit: 21, speed: -23, penetration: 142 },
        value: 51875,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "军中先锋官督制的战争法具。纯黑钢精母打造，阵法开启时伴随恐怖的重力场，直接碾碎敌军。 "
    },
    {
        id: "weapons_1148",
        name: "符光淬火烈阳阵基",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 52, mag_atk: 17, mag_crit: 21, speed: -23, penetration: 142 },
        value: 51875,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "经过高级熔岩符文淬炼，盘面终年散发高温。激发的法力洪流带有极强的侵蚀性，无视常规五行防御。"
    },
    {
        id: "weapons_1149",
        name: "江湖名宿·乾坤定位盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 34, mag_atk: 35, mag_crit: 21, speed: -23, penetration: 142 },
        value: 51875,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "曾由成名阵法宗师持用，历经无数生死决战而不损。其对灵力的敏感度已达通灵之境。"
    },
    {
        id: "weapons_1150",
        name: "太古遗珍·鸿蒙阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 83, mag_atk: 0, mag_crit: 28, speed: -30, penetration: 190 },
        value: 65300,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "R5阵盘系之巅峰。传闻为鸿蒙初开时的碎石打制，每一处刻痕都蕴含天道，物理与灵力压制皆为神迹。"
    },
    {
        id: "weapons_1151",
        name: "寒铁嵌灵裂天盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 62, mag_atk: 21, mag_crit: 28, speed: -30, penetration: 190 },
        value: 65300,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "嵌入了万年寒铁精华。阵法启动时产生的绝对零度灵压，能轻易刺穿高阶修士的真身护罩。"
    },
    {
        id: "weapons_1152",
        name: "名坊·万阵归宗",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 41, mag_atk: 42, mag_crit: 28, speed: -30, penetration: 190 },
        value: 65300,
        req: { jing: 7, qi: 30, shen: 38 },
        desc: "名家坊市的扛鼎神作。其内部结构之精密，能将持有者的每一丝神识转化为毁天灭地的阵法威能。"
    },

    // === 灵镜 (Relic 模组 | 系数: 1.20, 1.8, -0.5, 0.9 | Req 配比 1:3:6) ===
    // Total_Req 75 -> 精 7 / 气 23 / 神 45 (取整)

    {
        id: "weapons_1153",
        name: "玄钢照世护心灵镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 60, mag_atk: 0, mag_crit: 18, speed: -5, penetration: 45 },
        value: 44325,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "采用纯玄钢精磨而成的镜面，硬度堪比盾牌。不仅能反射灵光攻击，近身挥击时物理撞击力惊人。"
    },
    {
        id: "weapons_1154",
        name: "青虹贯影照妖镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 15, mag_crit: 18, speed: -5, penetration: 45 },
        value: 44325,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "在镜缘处包覆了灵通青金。对隐匿形迹的妖邪具有天然的勘破效果，反射出的光束带有显著的法术撕裂力。"
    },
    {
        id: "weapons_1155",
        name: "流云真传通玄镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 30, mag_atk: 30, mag_crit: 18, speed: -5, penetration: 45 },
        value: 44325,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "流云宗专门为下山执事配发的法器。材质极其匀称，反射真元的效率在同级法宝中名列前茅。"
    },
    {
        id: "weapons_1156",
        name: "黑钢陷阵碎魂镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 75, mag_atk: 0, mag_crit: 27, speed: -8, penetration: 68 },
        value: 59650,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "军中杀将用于对付法修的重型灵镜。镜背嵌入了黑铁精母，每一次成功反射都会伴随剧烈的物理冲击。"
    },
    {
        id: "weapons_1157",
        name: "符光淬火烈阳灵镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 56, mag_atk: 19, mag_crit: 27, speed: -8, penetration: 68 },
        value: 59650,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "经过九天雷火万次洗练，镜面隐现红芒。反射的光束带有极致的灼烧效果，法术穿透极高。"
    },
    {
        id: "weapons_1158",
        name: "江湖神话·鉴心镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 38, mag_atk: 37, mag_crit: 27, speed: -8, penetration: 68 },
        value: 59650,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "传闻中某位成名散修的招牌法宝。镜灵已成，能根据敌人的内功属性自动调整反射波段，无往不利。"
    },
    {
        id: "weapons_1159",
        name: "太古遗珍·混沌灵鉴",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 90, mag_atk: 0, mag_crit: 36, speed: -10, penetration: 90 },
        value: 75150,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "R5灵镜系物理之巅。镜面采用天外晶核磨制，反射出的重力灵压足以让空气凝固，物理压制力冠绝全系。"
    },
    {
        id: "weapons_1160",
        name: "寒铁嵌灵彻地镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 68, mag_atk: 22, mag_crit: 36, speed: -10, penetration: 90 },
        value: 75150,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "嵌入了极地万载寒铁。反射出的法术带有极致的寒气，瞬间封锁目标的法力回路，法穿达到神迹级别。"
    },
    {
        id: "weapons_1161",
        name: "名坊·独步灵霄",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 45, mag_atk: 45, mag_crit: 36, speed: -10, penetration: 90 },
        value: 75150,
        req: { jing: 7, qi: 23, shen: 45 },
        desc: "名家坊市百年来最伟大的灵镜作品。不仅工艺极尽奢华，其实战性能更是足以让使用者在同阶对决中处于不败之地。"
    }
];
const weapons_r5_batch12 = [
    // === 长幡 (Relic 模组 | 系数: 1.30, 0.8, -1.2, 1.2 | Req 配比 2:7:1) ===
    // Total_Req 75 -> 精 15 / 气 53 / 神 7 (取整)

    {
        id: "weapons_1162",
        name: "玄铁柄镇魂旌旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 65, mag_atk: 0, mag_crit: 8, speed: -12, penetration: 60 },
        value: 36750,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "曾插在太古战场核心的军魂旗，杆身由重型玄铁铸造。挥动间带起的物理灵压能让周围空气瞬间凝固。"
    },
    {
        id: "weapons_1163",
        name: "青虹绕灵召星幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 49, mag_atk: 16, mag_crit: 8, speed: -12, penetration: 60 },
        value: 36750,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "幡布采用了天河灵蚕丝织就，呈现青虹异色。能在大范围战场内引动星辰灵力，对敌方产生持续的法力剥蚀。"
    },
    {
        id: "weapons_1164",
        name: "归元太一真传幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 32, mag_atk: 33, mag_crit: 8, speed: -12, penetration: 60 },
        value: 36750,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "道门正统传承神兵。材质极其通灵，能将持有者的中正内气毫无损耗地转化为大面积的防御或攻击灵场。"
    },
    {
        id: "weapons_1165",
        name: "黑钢陷阵督魔幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 81, mag_atk: 0, mag_crit: 11, speed: -18, penetration: 90 },
        value: 46800,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "军中杀将用于对抗高阶法修的重型长幡。黑钢杆头锐利如戟，近身格斗亦有毁天灭地的物理冲击力。"
    },
    {
        id: "weapons_1166",
        name: "符纹淬火蚀灵旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 61, mag_atk: 20, mag_crit: 11, speed: -18, penetration: 90 },
        value: 46800,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "幡面刻满了禁断法力的古老符文。挥舞时散发出的红芒能直接切断方圆十丈内的灵力流动，法穿惊人。"
    },
    {
        id: "weapons_1167",
        name: "江湖神话·通天幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 41, mag_atk: 40, mag_crit: 11, speed: -18, penetration: 90 },
        value: 46800,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "曾随某位成名法师纵横诸界的至宝。其灵感反馈速度极快，能瞬间响应持有者的各种神识变化。"
    },
    {
        id: "weapons_1168",
        name: "圣祖·斩灵大旗",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 98, mag_atk: 0, mag_crit: 14, speed: -24, penetration: 120 },
        value: 57300,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "R5长幡物理巅峰。通体采用星辰精铁压制，每一次横扫都伴随山崩海啸般的恐怖力量，名震万古。"
    },
    {
        id: "weapons_1169",
        name: "寒铁嵌灵彻地幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 73, mag_atk: 25, mag_crit: 14, speed: -24, penetration: 120 },
        value: 57300,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "幡柄顶端嵌有一颗万载寒铁精母。射出的法力涟漪带有极致的冻结效果，专破各种火行护体神通。"
    },
    {
        id: "weapons_1170",
        name: "名坊·独步灵霄",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 49, mag_atk: 49, mag_crit: 14, speed: -24, penetration: 120 },
        value: 57300,
        req: { jing: 15, qi: 53, shen: 7 },
        desc: "名家坊市的扛鼎神作。将原本笨重的长幡打造得灵动异常，物理与灵力的结合已臻化境。"
    },

    // === 玉佩 (Relic 模组 | 系数: 0.65, 2.2, +2.5, 0.8 | Req 配比 0:4:6) ===
    // Total_Req 75 -> 精 0 / 气 30 / 神 45

    {
        id: "weapons_1171",
        name: "百炼淬火铁胎玉佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 32, mag_atk: 0, mag_crit: 22, speed: 25, penetration: 40 },
        value: 41825,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "内嵌实心铁胎的重质玉佩。御物投掷时势沉力猛，在 R5 级别中拥有极其罕见的物理破坏力。"
    },
    {
        id: "weapons_1172",
        name: "青虹绕灵紫髓佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 24, mag_atk: 8, mag_crit: 22, speed: 25, penetration: 40 },
        value: 41825,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "以深山紫髓玉磨制，周身萦绕着青色电光。不仅能增幅身法，射出的灵气射线更带有麻痹效果。"
    },
    {
        id: "weapons_1173",
        name: "流云真传绝影玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 16, mag_atk: 16, mag_crit: 22, speed: 25, penetration: 40 },
        value: 41825,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "宗门真传弟子的随身利器。材质极轻且韧性极强，能完美平衡物理闪避与真气爆发。"
    },
    {
        id: "weapons_1174",
        name: "黑钢陷阵碎灵玉",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 41, mag_atk: 0, mag_crit: 33, speed: 35, penetration: 60 },
        value: 59025,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "军中特制暗杀利器，表面涂有黑钢粉末防止反光。近身爆发时的物理穿透力令任何内家高手胆寒。"
    },
    {
        id: "weapons_1175",
        name: "符纹淬灵赤阳佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 31, mag_atk: 10, mag_crit: 33, speed: 35, penetration: 60 },
        value: 59025,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "经过三昧真火符文淬炼，玉佩隐隐透红。暴击时能引发极强的法力灼烧效果，法穿性能极佳。"
    },
    {
        id: "weapons_1176",
        name: "江湖神话·龙凤佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 20, mag_atk: 21, mag_crit: 33, speed: 35, penetration: 60 },
        value: 59025,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "传闻中某对成名侠侣留下的神物。佩戴时能显著加速真元回流，物理灵敏度与法术爆发力平衡得天衣无缝。"
    },
    {
        id: "weapons_1177",
        name: "圣祖·通玄镇魂佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 49, mag_atk: 0, mag_crit: 44, speed: 50, penetration: 80 },
        value: 76900,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "R5玉佩系之巅。质地已完全化为流态光质，物理弹射速度快到肉眼难辨，是极其恐怖的单兵暗器。"
    },
    {
        id: "weapons_1178",
        name: "寒铁嵌灵彻影佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 37, mag_atk: 12, mag_crit: 44, speed: 50, penetration: 80 },
        value: 76900,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "嵌入了万载寒铁碎矿。激发时的射线能瞬间穿透目标的灵魂防御，对依赖法力护罩的修士具有压倒性优势。"
    },
    {
        id: "weapons_1179",
        name: "名坊·独步九天",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 5,
        effects: { phy_atk: 24, mag_atk: 25, mag_crit: 44, speed: 50, penetration: 80 },
        value: 76900,
        req: { jing: 0, qi: 30, shen: 45 },
        desc: "名家坊市的终极绝响。其灵性已达极致，能自动契合持有者的每一丝呼吸，法力瞬间爆发力冠绝全系。"
    }
];
const weapons_r6_batch1 = [
    // === 匕 (Agile) - 9条 ===
    {
        id: "weapons_1180",
        name: "枯竭灵脉刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 30, mag_atk: 0, crit: 30, speed: 24, sharpness: 72 },
        value: 59400,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "在灵气干涸的废土中，用废弃灵脉残渣打磨的刺刃，虽然物理攻击一般，但其极速频率足以让炼气修士保命。"
    },
    {
        id: "weapons_1181",
        name: "血祭废土匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 22, mag_atk: 8, crit: 30, speed: 24, sharpness: 72 },
        value: 59400,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "末日流浪者通过血祭仪式唤醒的短刃，刃尖带有诡异的血色，能破开同阶修士的微弱气盾。"
    },
    {
        id: "weapons_1182",
        name: "前朝秘宝·月芒",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 15, mag_atk: 15, crit: 30, speed: 24, sharpness: 72 },
        value: 59400,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "历代皇帝秘藏的孤品，通体呈象牙白，对真元传导效率极高，是炼气期神识高强者的首选。"
    },
    {
        id: "weapons_1183",
        name: "污染残魂之牙",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 38, mag_atk: 0, crit: 45, speed: 36, sharpness: 108 },
        value: 85320,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "在辐射绝域中变异妖兽的牙齿制成，带有极强的物理撕裂性，暴击瞬间能切断经脉。"
    },
    {
        id: "weapons_1184",
        name: "暗黑矿脉毒匕",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 28, mag_atk: 10, crit: 45, speed: 36, sharpness: 108 },
        value: 85320,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "废土深处剧毒矿脉淬炼而成，法术侵蚀力极佳，中者不仅肉体受创，法力亦会枯竭。"
    },
    {
        id: "weapons_1185",
        name: "皇朝绝响·惊鸿",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 19, mag_atk: 19, crit: 45, speed: 36, sharpness: 108 },
        value: 85320,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "曾由某朝刺客首领持有的名刃。极致的平衡设计使其在法术对抗中亦能保持稳定的频率。"
    },
    {
        id: "weapons_1186",
        name: "绝望深渊之刺",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 0, crit: 60, speed: 48, sharpness: 144 },
        value: 110700,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "R6物理匕首巅峰，由万丈深渊下的绝望铁母铸造，刺出瞬间能剥离敌方的护甲，物理暴击冠绝炼气。"
    },
    {
        id: "weapons_1187",
        name: "寂灭紫火短刃",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 34, mag_atk: 11, crit: 60, speed: 48, sharpness: 144 },
        value: 110700,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "末世降临时的劫火余烬淬炼，刃部自带寂灭紫火。对一切灵力护盾都有着毁灭性的穿透效果。"
    },
    {
        id: "weapons_1188",
        name: "御制神工·霜华",
        type: "weapon" , subType: "匕",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 22, mag_atk: 23, crit: 60, speed: 48, sharpness: 144 },
        value: 110700,
        req: { jing: 18, qi: 0, shen: 72 },
        desc: "皇室炼器坊耗费国运打造的孤品。材质已臻化境，能将修士微薄的炼气真元放大至神识震荡的程度。"
    },

    // === 手戟 (Agile) - 9条 ===
    // 系数: 0.7, 1.6, +1.2, 1.0 | 配比 4:0:6
    // Total_Req 90 -> 精 36 / 气 0 / 神 54

    {
        id: "weapons_1189",
        name: "废铁拼装戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 42, mag_atk: 0, crit: 19, speed: 14, sharpness: 60 },
        value: 50580,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "炼气期修士在废墟中找寻神庙残件拼装而成的武器，外表虽然破败，但其材料本身带有神性，物理钩锁极其稳固。"
    },
    {
        id: "weapons_1190",
        name: "污染灵砂戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 31, mag_atk: 11, crit: 19, speed: 14, sharpness: 60 },
        value: 50580,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "在满是辐射的灵砂坑中埋藏百年的短戟，不仅能锁住敌方兵刃，更能通过接触释放污染内力。"
    },
    {
        id: "weapons_1191",
        name: "前朝督造·镇魂",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 21, mag_atk: 21, crit: 19, speed: 14, sharpness: 60 },
        value: 50580,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "皇帝赐予贴身校尉的成名武具。重心调校极佳，无论是物理突刺还是真元灌注皆极其顺畅。"
    },
    {
        id: "weapons_1192",
        name: "蚀骨黑钢戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 52, mag_atk: 0, crit: 29, speed: 21, sharpness: 90 },
        value: 70470,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "以废土深层的黑钢打造，戟尖具有腐蚀骨骼的奇效，对付穿着重型板甲的敌方有着天然的优势。"
    },
    {
        id: "weapons_1193",
        name: "幽冥劫火双钩",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 39, mag_atk: 13, crit: 29, speed: 21, sharpness: 90 },
        value: 70470,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "吸收了末世战场万千怨气的双戟，勾击时会带起阵阵阴火，无视凡铁护甲的防御。"
    },
    {
        id: "weapons_1194",
        name: "宗师遗墨·断空",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 26, mag_atk: 26, crit: 29, speed: 21, sharpness: 90 },
        value: 70470,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "某位失踪炼气宗师留下的唯一武具。材质通灵，能将内力与物理碰撞转化为尖锐的破空声，震慑心神。"
    },
    {
        id: "weapons_1195",
        name: "末世战神之爪",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 63, mag_atk: 0, crit: 38, speed: 29, sharpness: 120 },
        value: 90090,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "R6手戟物理巅峰，由最坚硬的陨星碎片整体磨制，虽然牺牲了法术传导，但其近战爆发力几乎无敌。"
    },
    {
        id: "weapons_1196",
        name: "玄冥蚀灵短戟",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 47, mag_atk: 16, crit: 38, speed: 29, sharpness: 120 },
        value: 90090,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "镶嵌了废土结晶的高级法兵，每一次勾扯都能吸取对方的微薄法力，是炼气期内战的神兵。"
    },
    {
        id: "weapons_1197",
        name: "神工传世·定风波",
        type: "weapon" , subType: "手戟",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 32, mag_atk: 31, crit: 38, speed: 29, sharpness: 120 },
        value: 90090,
        req: { jing: 36, qi: 0, shen: 54 },
        desc: "名震天下的皇家秘藏。这对手戟在任何极端环境下都能保持绝对的物理平衡，是名副其实的传世孤品。"
    }
];
const weapons_r6_batch2 = [
    // === 吴钩 (Agile) - 9条 ===
    // 系数: 0.75, 1.4, +0.8, 1.1 | 配比 5:0:5
    // Total_Req 90 -> 精 45 / 气 0 / 神 45

    {
        id: "weapons_1198",
        name: "断裂灵脉残钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 0, crit: 17, speed: 10, sharpness: 66 },
        value: 49320,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "在灵气干枯后，从废弃的灵石矿脉中强行剥离出的曲刃。虽然表面粗糙，但每一次划击都带有沉重的物理撕裂感。"
    },
    {
        id: "weapons_1199",
        name: "废土血月曲刃",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 34, mag_atk: 11, crit: 17, speed: 10, sharpness: 66 },
        value: 49320,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "末日祭坛上的祭祀兵刃，刃面呈现病态的暗红。它能通过钩锁敌方经脉，将一丝血煞之气注入其真元之中。"
    },
    {
        id: "weapons_1200",
        name: "皇廷秘藏·冷月",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 22, mag_atk: 23, crit: 17, speed: 10, sharpness: 66 },
        value: 49320,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "曾由皇城影卫首领持有的名刀。曲度完美契合人体力学，即便是炼气修士持用，亦能感受到神识与刀锋的共鸣。"
    },
    {
        id: "weapons_1201",
        name: "腐蚀黑金钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 56, mag_atk: 0, crit: 25, speed: 14, sharpness: 99 },
        value: 66960,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "在充满毒瘴的黑金废墟中反复锻打而成。钩尖带有天然的破甲属性，能轻易撕裂炼气期修士的护身皮甲。"
    },
    {
        id: "weapons_1202",
        name: "寂灭紫火曲钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 42, mag_atk: 14, crit: 25, speed: 14, sharpness: 99 },
        value: 66960,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "融入了灭世劫火余烬的魔刃。钩身常年散发着紫色的法力波纹，专门针对各种依靠灵力的物理防御。"
    },
    {
        id: "weapons_1203",
        name: "历代传世·惊鸿",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 28, mag_atk: 28, crit: 25, speed: 14, sharpness: 99 },
        value: 66960,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "曾见证皇朝更迭的传世利刃。它的平衡性达到了物理法则的极限，每一次劈砍都能将法力损耗降至最低。"
    },
    {
        id: "weapons_1204",
        name: "末日崩裂天钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 68, mag_atk: 0, crit: 33, speed: 19, sharpness: 132 },
        value: 85410,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "R6物理巅峰。由坠落的域外星核残片打造，沉重而锐利。钩刃之下，纵是炼气后期强者的金刚符亦如纸糊。"
    },
    {
        id: "weapons_1205",
        name: "玄冥蚀骨利钩",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 51, mag_atk: 17, crit: 33, speed: 19, sharpness: 132 },
        value: 85410,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "镶嵌了深渊魂晶的禁忌兵器。不仅物理杀伤惊人，其附带的玄冥阴气能直接冻结目标的法力回路。"
    },
    {
        id: "weapons_1206",
        name: "御用至尊·屠龙",
        type: "weapon" , subType: "吴钩",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 34, mag_atk: 34, crit: 33, speed: 19, sharpness: 132 },
        value: 85410,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "皇权巅峰时期的最高杰作。通体采用万年灵纹金精炼，完美结合了物理霸气与法力神韵。"
    },

    // === 奇门 (Agile) - 9条 ===
    // 系数: 0.60, 2.0, +1.5, 0.8 | 配比 3:0:7
    // Total_Req 90 -> 精 27 / 气 0 / 神 63

    {
        id: "weapons_1207",
        name: "铁锈绞杀链",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 36, mag_atk: 0, crit: 24, speed: 18, sharpness: 48 },
        value: 53100,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "废土流浪者从巨型机械残骸中拆下的传动链条，经过粗犷改制而成。虽然满是铁锈，但每一次抽击都能产生碎骨巨力。"
    },
    {
        id: "weapons_1208",
        name: "污染灵力幡扇",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 27, mag_atk: 9, crit: 24, speed: 18, sharpness: 48 },
        value: 53100,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "破损的宗门旗帜与枯木拼凑的扇形兵器。挥动间能带起细微的辐射尘埃，在物理打击的同时侵蚀敌方心神。"
    },
    {
        id: "weapons_1209",
        name: "秘库遗珠·天演",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 18, mag_atk: 18, crit: 24, speed: 18, sharpness: 48 },
        value: 53100,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "前朝国师遗留的奇门法具。由十八颗通灵算珠串联，物理打击精准如计算，且法力传导丝滑无比。"
    },
    {
        id: "weapons_1210",
        name: "蚀魂黑钢锁镰",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 0, crit: 36, speed: 27, sharpness: 72 },
        value: 74790,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "以废墟深处的变异黑铁精铸。长链飞舞间犹如死神索命，其物理贯穿力足以在瞬间钩落目标的头盔。"
    },
    {
        id: "weapons_1211",
        name: "九幽阴火震魂铃",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 34, mag_atk: 11, crit: 36, speed: 27, sharpness: 72 },
        value: 74790,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "将阴火种入铃铛内部。打击时不仅产生剧烈的物理震荡，更会爆发刺骨的寒火，法术侵彻力极强。"
    },
    {
        id: "weapons_1212",
        name: "皇室圣诏·绝响",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 23, mag_atk: 22, crit: 36, speed: 27, sharpness: 72 },
        value: 74790,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "以神金卷轴打磨出的奇门锋刃。既有皇室的庄严，又有杀手的决绝，物理与法术的结合堪称一绝。"
    },
    {
        id: "weapons_1213",
        name: "末世万劫飞爪",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 54, mag_atk: 0, crit: 48, speed: 36, sharpness: 96 },
        value: 96480,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "R6奇门之巅。由星辰铁母打造的五爪，张合间能产生小范围的空间坍塌，物理暴击足以让任何炼气防御形同虚设。"
    },
    {
        id: "weapons_1214",
        name: "紫霄雷鸣灭魂杵",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 40, mag_atk: 14, crit: 48, speed: 36, sharpness: 96 },
        value: 96480,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "雷劫余波中淬炼出的降魔杵。每一次接触都会产生连锁雷击，对一切阴戾真气具有降维级别的打击力。"
    },
    {
        id: "weapons_1215",
        name: "神工至宝·万机匣",
        type: "weapon" , subType: "奇门",
        combatType: "轻盈",
        rarity: 6,
        effects: { phy_atk: 27, mag_atk: 27, crit: 48, speed: 36, sharpness: 96 },
        value: 96480,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "皇城秘库中最神秘的奇门瑰宝。它代表了人类炼器艺术在末日前的最高光时刻，各属性增幅均达到神话水准。"
    }
];
const weapons_r6_batch3 = [
    // === 剑 (Bal) - 9条 ===
    // 系数: 1.0, 1.1, 0.0, 1.0 | 配比 5:0:5
    // Total_Req 90 -> 精 45 / 气 0 / 神 45

    {
        id: "weapons_1216",
        name: "废土锈迹长剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 60, mag_atk: 0, crit: 13, speed: 0, sharpness: 60 },
        value: 50040,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "在灵气风暴中被遗弃百年的长剑，铁锈下仍透着凛冽寒芒。对于炼气修士而言，其稳重的剑身是荒原厮杀最可靠的伙伴。"
    },
    {
        id: "weapons_1217",
        name: "污染灵泉淬火剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 15, crit: 13, speed: 0, sharpness: 60 },
        value: 50040,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "以充满辐射的灵泉淬火而成，剑脊隐现诡异青光。每一次挥砍都能带起一丝法力波纹，干扰敌方脆弱的内息。"
    },
    {
        id: "weapons_1218",
        name: "前朝督造·秋水",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 30, mag_atk: 30, crit: 13, speed: 0, sharpness: 60 },
        value: 50040,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "皇室炼器师打造的制式巅峰，剑身清澈如水。它能完美平衡炼气期修士的物理劲道与微弱法力，导灵性极佳。"
    },
    {
        id: "weapons_1219",
        name: "蚀甲黑金神锋",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 75, mag_atk: 0, crit: 20, speed: 0, sharpness: 90 },
        value: 67500,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "采集废土深层黑金矿脉打造，剑刃极其厚实。这种材质天然克制各种金属护甲，物理破坏力震古烁今。"
    },
    {
        id: "weapons_1220",
        name: "九天雷劫劫余剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 56, mag_atk: 19, crit: 20, speed: 0, sharpness: 90 },
        value: 67500,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "在灭世雷劫中幸存的剑胎，残存着一丝劫雷之力。对一切阴属性灵力有着降维打击般的法穿效果。"
    },
    {
        id: "weapons_1221",
        name: "帝王随身·承影",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 38, mag_atk: 37, crit: 20, speed: 0, sharpness: 90 },
        value: 67500,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "历代皇帝随身收藏的孤品，只闻剑风不见剑身。其法力与物理的协同效率已达神话级别，是平衡之道的极致。"
    },
    {
        id: "weapons_1222",
        name: "末世斩神重剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 90, mag_atk: 0, crit: 26, speed: 0, sharpness: 120 },
        value: 83880,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "R6剑系物理巅峰，由崩坏的空间碎片磨制。不仅锋利，更带有一种法则级的重压，一剑下劈足以震碎神识。"
    },
    {
        id: "weapons_1223",
        name: "玄冥噬灵古剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 68, mag_atk: 22, crit: 26, speed: 0, sharpness: 120 },
        value: 83880,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "埋藏在极北冰土下的神话残片。其散发的玄冥寒气能瞬间剥夺敌方甲胄上的附灵效果，法穿无视一切抗性。"
    },
    {
        id: "weapons_1224",
        name: "护国至宝·天权",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 45, crit: 26, speed: 0, sharpness: 120 },
        value: 83880,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "作为国运载体的皇室孤品，剑身铭刻九洲山河。它代表了绝对的统治意志，物理与法术威力皆登峰造极。"
    },

    // === 刀 (Bal) - 9条 ===
    // 系数: 1.15, 0.9, -0.5, 1.1 | 配比 7:0:3
    // Total_Req 90 -> 精 63 / 气 0 / 神 27

    {
        id: "weapons_1225",
        name: "荒原拼凑断骨刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 69, mag_atk: 0, crit: 11, speed: -6, sharpness: 66 },
        value: 51480,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "在枯竭的灵兽墓穴中，用变异骸骨与废铁合铸的巨刀。虽然牺牲了速度，但沉重的物理劈砍是末世生存的本钱。"
    },
    {
        id: "weapons_1226",
        name: "腐朽灵纹直刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 52, mag_atk: 17, crit: 11, speed: -6, sharpness: 66 },
        value: 51480,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "原本华丽的灵刀在末世空气中腐朽，反生出一种诡异的毒素法力。劈砍时带起的内劲波动足以让对手四肢麻痹。"
    },
    {
        id: "weapons_1227",
        name: "皇城御卫·雁翎",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 35, mag_atk: 34, crit: 11, speed: -6, sharpness: 66 },
        value: 51480,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "皇城沦陷前最后一批精锐佩刀。钢材极佳，重心调校近乎完美，物理压制力与真元灌注十分平衡。"
    },
    {
        id: "weapons_1228",
        name: "灭绝乌金斩马刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 86, mag_atk: 0, crit: 16, speed: -9, sharpness: 99 },
        value: 67230,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "采集末日火山爆发喷出的乌金打造，其重量让寻常炼气修士难以挥动，但其物理破坏力足以斩断一切生机。"
    },
    {
        id: "weapons_1229",
        name: "幽冥邪火重刃",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 65, mag_atk: 21, crit: 16, speed: -9, sharpness: 99 },
        value: 67230,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "刀身囚禁了地底深处的幽冥邪火，每一次挥砍都伴随着刺骨的高温法力。这种法力专门针对敌人的经脉防御。"
    },
    {
        id: "weapons_1230",
        name: "宗师孤品·断潮",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 43, mag_atk: 43, crit: 16, speed: -9, sharpness: 99 },
        value: 67230,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "末日前夕刀法宗师的封山之作。不仅物理结构稳固，其法力响应速度甚至能追上炼气期修士的本能反应。"
    },
    {
        id: "weapons_1231",
        name: "万古寂灭龙鳞刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 103, mag_atk: 0, crit: 22, speed: -12, sharpness: 132 },
        value: 84060,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "R6刀系物理极限，传说刀背嵌有真龙残鳞。每一击劈砍都具有物理重力倍增的特效，足以碎裂神阶屏障。"
    },
    {
        id: "weapons_1232",
        name: "紫霄焚灵大刀",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 78, mag_atk: 25, crit: 22, speed: -12, sharpness: 132 },
        value: 84060,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "雷火淬炼百年的绝世神兵。刀气带有的紫电法力能瞬间剥离目标的修为加持，是炼气期无敌的杀器。"
    },
    {
        id: "weapons_1233",
        name: "历代孤品·鸣鸿",
        type: "weapon" , subType: "刀",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 52, mag_atk: 51, crit: 22, speed: -12, sharpness: 132 },
        value: 84060,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "皇朝至宝。刀身材质超越了时代的认知，具有某种自动追踪神识的灵性。物理与法力双巅峰，乃传世孤品。"
    }
];
const weapons_r6_batch4 = [
    // === 铍 (Bal) - 9条 ===
    // 系数: 1.20, 0.8, -0.8, 1.2 | 配比 6:0:4
    // Total_Req 90 -> 精 54 / 气 0 / 神 36

    {
        id: "weapons_1234",
        name: "锈斑玄铁铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 72, mag_atk: 0, crit: 10, speed: -10, sharpness: 72 },
        value: 51300,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "在灵气风暴中侵蚀严重的玄铁铍，外壳剥落后露出狰狞的锯齿。作为物理压制的利器，其铍头重力足以震碎同阶修士的筋骨。"
    },
    {
        id: "weapons_1235",
        name: "污染灵晶贯日铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 54, mag_atk: 18, crit: 10, speed: -10, sharpness: 72 },
        value: 51300,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "原本用于祭天的圣铍，在末日中被污染灵晶寄生。刺击时伴随诡异的绿芒，能通过法力震荡强制削弱敌方的气力。"
    },
    {
        id: "weapons_1236",
        name: "前朝督造·龙脊",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 36, mag_atk: 36, crit: 10, speed: -10, sharpness: 72 },
        value: 51300,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "皇城禁卫统领配发的长铍，杆身如龙脊般富有弹性。它能极佳地导引修士微薄的真元，在防御与进攻间达到艺术般的平衡。"
    },
    {
        id: "weapons_1237",
        name: "黑钢陷阵断头铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 90, mag_atk: 0, crit: 14, speed: -14, sharpness: 108 },
        value: 66420,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "由废土深层的变异黑钢精炼，铍刃长达二尺。这把纯粹的暴力兵器在阵地战中具有神话般的统治力，物理破坏力拉满。"
    },
    {
        id: "weapons_1238",
        name: "寂灭劫火穿云铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 68, mag_atk: 22, crit: 14, speed: -14, sharpness: 108 },
        value: 66420,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "浸泡过末世岩浆的凶兵。每一次横扫都能带起焚尽一切的劫火余威，法术穿透极高，专门克制金系防御功法。"
    },
    {
        id: "weapons_1239",
        name: "历代传世·不朽",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 45, crit: 14, speed: -14, sharpness: 108 },
        value: 66420,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "某代开国战神留下的唯一孤品。历经万载而不朽，其内部法则结构能自动补完炼气修士的招式漏洞，物法双修之冠。"
    },
    {
        id: "weapons_1240",
        name: "末世万劫碎星铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 108, mag_atk: 0, crit: 19, speed: -19, sharpness: 144 },
        value: 82350,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "R6铍系物理巅峰，由天外陨铁精母整体切削而成。重逾万斤，一刺之威足以在空间产生微小裂纹，无视一切凡俗防御。"
    },
    {
        id: "weapons_1241",
        name: "紫霄雷鸣蚀灵铍",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 81, mag_atk: 27, crit: 19, speed: -19, sharpness: 144 },
        value: 82350,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "雷火淬炼的灵性神兵。铍尖跳跃的紫电具有腐蚀神识的异能，一旦触碰敌方兵刃，法力冲击会瞬间瘫痪其灵压。"
    },
    {
        id: "weapons_1242",
        name: "御制孤品·八荒",
        type: "weapon" , subType: "铍",
        combatType: "均衡",
        rarity: 6,
        effects: { phy_atk: 54, mag_atk: 54, crit: 19, speed: -19, sharpness: 144 },
        value: 82350,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "皇朝末代皇帝为镇压八荒打造的终极铍。它承载了文明最后的尊严，无论物理强度还是法力增幅，皆已超越炼气极限。"
    },

    // === 矛 (Reach) - 9条 ===
    // 系数: 1.25, 0.8, -1.0, 1.2 | 配比 6:0:4
    // Total_Req 90 -> 精 54 / 气 0 / 神 36

    {
        id: "weapons_1243",
        name: "废墟残缺红缨矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 75, mag_atk: 0, crit: 10, speed: -12, sharpness: 72 },
        value: 52380,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "废墟中随处可见的红缨矛，但这把的尖端由不化骨磨制。对于炼气修士，它是最简易也最致命的物理突刺工具。"
    },
    {
        id: "weapons_1244",
        name: "灵气枯竭裂痕矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 56, mag_atk: 19, crit: 10, speed: -12, sharpness: 72 },
        value: 52380,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "曾是仙门弟子的配矛，在灵气枯竭后矛身布满裂纹。这些裂纹能在突刺时产生紊乱的法力流，强制撕裂敌方气盾。"
    },
    {
        id: "weapons_1245",
        name: "皇朝旧梦·贯虹",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 38, mag_atk: 37, crit: 10, speed: -12, sharpness: 72 },
        value: 52380,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "皇室典礼中御林军持用的长矛。材质极其纯粹，物理柔韧性与神识导向达到了和谐统一，是炼气精英的梦想兵刃。"
    },
    {
        id: "weapons_1246",
        name: "蚀甲重型穿山矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 94, mag_atk: 0, crit: 14, speed: -17, sharpness: 108 },
        value: 67770,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "重达两百斤的黑金长矛。矛尖采用了螺旋破甲设计，全力一刺之下，即便是末日机械的防御钢板也会被瞬间洞穿。"
    },
    {
        id: "weapons_1247",
        name: "幽冥死气灭绝矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 70, mag_atk: 24, crit: 14, speed: -17, sharpness: 108 },
        value: 67770,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "矛头缠绕着浓郁的幽冥死气。法术穿透极强，不仅能对肉身造成物理创伤，更能通过死气侵蚀目标的真元本源。"
    },
    {
        id: "weapons_1248",
        name: "神将遗珠·破晓",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 47, mag_atk: 47, crit: 14, speed: -17, sharpness: 108 },
        value: 67770,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "曾由某位末日守军名将持有的神矛。它在任何恶劣环境下都能引导出一缕纯净的法力。物理与法术威力各占胜场。"
    },
    {
        id: "weapons_1249",
        name: "万古寂灭神威矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 113, mag_atk: 0, crit: 19, speed: -24, sharpness: 144 },
        value: 83700,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "R6矛系物理之巅。矛尖由破碎的法则残片磨制，其物理穿刺力已触碰到某种神禁。一矛递出，有死无生。"
    },
    {
        id: "weapons_1250",
        name: "玄冥蚀灵透魂矛",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 84, mag_atk: 29, crit: 19, speed: -24, sharpness: 144 },
        value: 83700,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "嵌入了万载玄冥寒晶的神矛。刺入目标瞬间产生的极寒灵爆能冻裂五脏六腑，是专门猎杀高阶邪修的禁兵。"
    },
    {
        id: "weapons_1251",
        name: "皇权圣物·开天",
        type: "weapon" , subType: "矛",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 56, mag_atk: 57, crit: 19, speed: -24, sharpness: 144 },
        value: 83700,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "皇朝传承万年的镇国神矛。矛身蕴含万民意志，物理韧性与灵力亲和力皆为世间绝响，代表了文明的最高成就。"
    }
];
const weapons_r6_batch5 = [
    // === 戈 (Reach) - 9条 ===
    // 系数: 1.30, 0.7, -1.2, 0.9 | 配比 7:0:3
    // Total_Req 90 -> 精 63 / 气 0 / 神 27

    {
        id: "weapons_1252",
        name: "废土残缺青铜戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 78, mag_atk: 0, crit: 8, speed: -14, sharpness: 54 },
        value: 50220,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "从古代战场深坑中挖掘出的巨戈，虽然锈迹斑斑，但戈头依然沉重。其最原始的啄击力量足以击碎末日流浪者的铁制头盔。"
    },
    {
        id: "weapons_1253",
        name: "辐射晶簇钩魂戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 59, mag_atk: 19, crit: 8, speed: -14, sharpness: 54 },
        value: 50220,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "戈面寄生了深绿色的辐射晶簇，挥舞时伴随低沉的嗡鸣。每次钩击都会在物理创伤中注入紊乱的变异灵力。"
    },
    {
        id: "weapons_1254",
        name: "前朝督造·孤影",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 39, mag_atk: 39, crit: 8, speed: -14, sharpness: 54 },
        value: 50220,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "皇城沦陷前，工部大师为守城校尉打造的最后利器。极其轻便且法力导向稳定，即便炼气期也能运用自如。"
    },
    {
        id: "weapons_1255",
        name: "黑钢陷阵裂地戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 97, mag_atk: 0, crit: 12, speed: -22, sharpness: 81 },
        value: 64260,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "以废土深层的重型黑钢精铸。其物理结构专为针对重装步卒设计，戈刃钩扯瞬间爆发的蛮力足以扭曲钢板。"
    },
    {
        id: "weapons_1256",
        name: "寂灭紫火横啄戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 73, mag_atk: 24, crit: 12, speed: -22, sharpness: 81 },
        value: 64260,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "融入了末世劫火的禁忌之兵。刃口常年跳跃着紫色的法力火花，对一切真元护罩都有着无视物理体积的穿透效果。"
    },
    {
        id: "weapons_1257",
        name: "历代传世·断因果",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 49, mag_atk: 48, crit: 12, speed: -22, sharpness: 81 },
        value: 64260,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "某代国师曾持有的神戈。材质能够承载复杂的诅咒符文，物理打击伴随着神识剥离，是炼气期内战的噩梦。"
    },
    {
        id: "weapons_1258",
        name: "万古寂灭神灭戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 117, mag_atk: 0, crit: 17, speed: -29, sharpness: 108 },
        value: 80190,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "R6戈类物理巅峰。由坠落凡间的神殿立柱残片磨制，其硬度与重量已触及位面极限。戈锋之下，万物皆为尘土。"
    },
    {
        id: "weapons_1259",
        name: "玄冥蚀灵镇魂戈",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 88, mag_atk: 29, crit: 17, speed: -29, sharpness: 108 },
        value: 80190,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "嵌入了深渊冰核的神戈。刺骨的玄冥灵压在物理钩击中瞬间爆发，不仅能撕裂铠甲，更能瞬间冻结目标的内丹雏形。"
    },
    {
        id: "weapons_1260",
        name: "皇权圣物·江山",
        type: "weapon" , subType: "戈",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 59, mag_atk: 58, crit: 17, speed: -29, sharpness: 108 },
        value: 80190,
        req: { jing: 63, qi: 0, shen: 27 },
        desc: "皇朝覆灭前由皇帝亲自血祭的护国孤品。戈身铭刻九洲地脉。物理冲击中带有无上的威压感，乃无上孤品。"
    },

    // === 戟 (Reach) - 9条 ===
    // 系数: 1.40, 0.6, -1.5, 1.1 | 配比 6:0:4
    // Total_Req 90 -> 精 54 / 气 0 / 神 36

    {
        id: "weapons_1261",
        name: "废铁焊制方天戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 84, mag_atk: 0, crit: 7, speed: -18, sharpness: 66 },
        value: 52020,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "废墟流浪者用断掉的剑身与铲头强行焊接成的重戟。虽然外形怪异，但其多重的物理打击结构使其在近战中变幻莫测。"
    },
    {
        id: "weapons_1262",
        name: "污染残魂灵月戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 63, mag_atk: 21, crit: 7, speed: -18, sharpness: 66 },
        value: 52020,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "月牙刃上附着了末世战场不散的残魂。挥动间能产生如泣如诉的法力哀鸣，物理劈砍伴随神识创伤。"
    },
    {
        id: "weapons_1263",
        name: "前朝秘藏·画魂",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 42, mag_atk: 42, crit: 7, speed: -18, sharpness: 66 },
        value: 52020,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "皇帝赐予最后一位冠军侯的佩兵。材质均匀，对真元的容纳力极高，能让炼气修士施展出超越境界的戟法。"
    },
    {
        id: "weapons_1264",
        name: "黑钢陷阵破晓戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 105, mag_atk: 0, crit: 11, speed: -27, sharpness: 99 },
        value: 67230,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "重型黑钢精母打造，戟头重达百斤。这是纯粹的单兵拆解利器，一记下劈能轻易切开最坚硬的变异兽甲。"
    },
    {
        id: "weapons_1265",
        name: "紫霄雷动灭绝戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 79, mag_atk: 26, crit: 11, speed: -27, sharpness: 99 },
        value: 67230,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "刻满了古老雷霆符阵的戟身。月牙刃边缘跳跃着紫色的电弧，专门针对目标的经脉节点进行法术穿透打击。"
    },
    {
        id: "weapons_1266",
        name: "宗师神工·破虚",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 53, mag_atk: 52, crit: 11, speed: -27, sharpness: 99 },
        value: 67230,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "末日降临前最伟大的炼器宗师的封山作。戟身材质介于虚实之间，法力传导丝滑，物理硬度惊人。"
    },
    {
        id: "weapons_1267",
        name: "末世万劫斩神戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 126, mag_atk: 0, crit: 14, speed: -36, sharpness: 132 },
        value: 81360,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "R6戟类物理之巅。由被诅咒的域外神金打造，戟锋带有一种天然的物理撕裂领域。一戟出，万甲碎。"
    },
    {
        id: "weapons_1268",
        name: "玄冥蚀灵葬月戟",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 95, mag_atk: 31, crit: 14, speed: -36, sharpness: 132 },
        value: 81360,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "镶嵌了九枚破碎魂钻的顶级戟器。每一次挥斩都带起冰冷的法术漩涡，专门剥离对手的护身真气与神识。"
    },
    {
        id: "weapons_1269",
        name: "皇权圣物·不朽",
        type: "weapon" , subType: "戟",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 63, mag_atk: 63, crit: 14, speed: -36, sharpness: 132 },
        value: 81360,
        req: { jing: 54, qi: 0, shen: 36 },
        desc: "作为文明最后火种保存的皇室神戟。戟身蕴含了历代君王的霸道之气，物理威力与灵导性能皆达神话级孤品。"
    }
];
const weapons_r6_batch6 = [
    // === 长铩 (Reach) - 9条 ===
    // 系数: 1.45, 0.5, -1.8, 1.0 | 配比 8:0:2
    // Total_Req 90 -> 精 72 / 气 0 / 神 18

    {
        id: "weapons_1270",
        name: "废土脊骨长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 87, mag_atk: 0, crit: 6, speed: -22, sharpness: 60 },
        value: 51120,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "由废墟中埋藏千年的荒兽脊椎磨制，刃口呈参差的骨刺状。虽挥动沉重，但每一次突刺都能引发骨裂般的物理震荡。"
    },
    {
        id: "weapons_1271",
        name: "污染灵纹铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 65, mag_atk: 22, crit: 6, speed: -22, sharpness: 60 },
        value: 51120,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "原本刻有神圣灵纹的长铩，在末世中被污秽血气侵蚀。挥舞时带起暗红色的法力残影，能渗透进敌人的经脉。"
    },
    {
        id: "weapons_1272",
        name: "皇朝旧梦·破阵",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 44, mag_atk: 43, crit: 6, speed: -22, sharpness: 60 },
        value: 51120,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "末代禁卫军团使用的制式巅峰。铩刃宽大，完美兼顾了突刺力量与真气导灵感，是炼气期重甲修士的噩梦。"
    },
    {
        id: "weapons_1273",
        name: "黑钢陨落大长铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 109, mag_atk: 0, crit: 9, speed: -32, sharpness: 90 },
        value: 65340,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "采集坠落凡间的黑星碎块铸就。其物理质量极其惊人，横扫时产生的惯性足以震碎炼气后期修士的神识防御。"
    },
    {
        id: "weapons_1274",
        name: "寂灭紫雷绝影铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 82, mag_atk: 27, crit: 9, speed: -32, sharpness: 90 },
        value: 65340,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "铩尖封印了一缕末日雷劫。在高速刺击中会迸发紫色的毁灭雷光，无视物理装甲，强制产生法术穿透效果。"
    },
    {
        id: "weapons_1275",
        name: "宗师血祭·断魂",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 55, mag_atk: 54, crit: 9, speed: -32, sharpness: 90 },
        value: 65340,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "某位战将宗师在国破之时血祭而成的孤品。铩身自带不屈意志，能显著放大修士的每一丝内劲爆发。"
    },
    {
        id: "weapons_1276",
        name: "万古寂灭神铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 131, mag_atk: 0, crit: 12, speed: -43, sharpness: 120 },
        value: 79290,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "R6长铩物理之巅。采用空间裂隙边缘产出的绝望金打造。其物理切割力在炼气阶段属于法则级的存在。"
    },
    {
        id: "weapons_1277",
        name: "玄冥蚀灵葬天铩",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 98, mag_atk: 33, crit: 12, speed: -43, sharpness: 120 },
        value: 79290,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "镶嵌了九枚变异魂晶的神兵。每一次挥斩都带起冰冷的法术漩涡，能在大范围内剥夺敌人的灵气感应。"
    },
    {
        id: "weapons_1278",
        name: "历代孤品·诛邪",
        type: "weapon" , subType: "长铩",
        combatType: "长兵",
        rarity: 6,
        effects: { phy_atk: 66, mag_atk: 65, crit: 12, speed: -43, sharpness: 120 },
        value: 79290,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "皇朝至宝。通体由九天陨铁精炼，物理硬度与灵力亲和度皆达到神话级，乃是末世修仙者的终极武装。"
    },

    // === 钺 (Heavy) - 9条 ===
    // 系数: 1.60, 0.4, -2.2, 0.8 | Req 配比 9:0:1
    // Total_Req 90 -> 精 81 / 气 0 / 神 9

    {
        id: "weapons_1279",
        name: "荒原拼凑宣花钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 96, mag_atk: 0, crit: 5, speed: -26, sharpness: 48 },
        value: 53100,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "流浪者用厚重的矿井升降机钢板磨成的宣花大钺。全凭恐怖的物理重量碾碎敌人，是纯粹的暴力美学。"
    },
    {
        id: "weapons_1280",
        name: "污染重水淬灵钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 72, mag_atk: 24, crit: 5, speed: -26, sharpness: 48 },
        value: 53100,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "以充满死气的重水淬火，钺刃呈现暗紫色。下劈时能引发沉闷的重水灵爆，对内脏造成物理与法力双重挤压。"
    },
    {
        id: "weapons_1281",
        name: "皇城陷落·镇守",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 48, mag_atk: 48, crit: 5, speed: -26, sharpness: 48 },
        value: 53100,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "皇城正门守将的遗物。重达百斤却平衡极佳，能将持钺者的蛮力转化为稳定的法力震荡波。"
    },
    {
        id: "weapons_1282",
        name: "蚀甲乌金破山钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 120, mag_atk: 0, crit: 7, speed: -40, sharpness: 72 },
        value: 65880,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "由废土禁区挖掘出的乌金精母铸造。此钺一出，风云变色。其物理破甲系数甚至能斩断神阶护盾。"
    },
    {
        id: "weapons_1283",
        name: "九幽阴火焚魂钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 90, mag_atk: 30, crit: 7, speed: -40, sharpness: 72 },
        value: 65880,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "钺身囚禁了来自地底裂缝的九幽阴火。巨大的物理打击伴随着灼烧灵魂的冷火，法穿效果震古烁今。"
    },
    {
        id: "weapons_1284",
        name: "武勋传世·绝地",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 60, mag_atk: 60, crit: 7, speed: -40, sharpness: 72 },
        value: 65880,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "曾由开国大将持用的史诗神钺。钺面上铭刻着镇压大地的禁制，每一次挥动都能让周围灵力陷入死寂。"
    },
    {
        id: "weapons_1285",
        name: "万古寂灭霸王钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 144, mag_atk: 0, crit: 10, speed: -53, sharpness: 96 },
        value: 80010,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "R6钺类物理极限。单纯由压缩了一座小山质量的陨星核制成，下劈一击即代表了物理法则的降维打击。"
    },
    {
        id: "weapons_1286",
        name: "紫霄雷鸣灭绝钺",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 108, mag_atk: 36, crit: 10, speed: -53, sharpness: 96 },
        value: 80010,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "钺刃边缘流淌着劫雷。巨大的物理重量配合灭世级的雷电穿透，没有任何炼气屏障能抵挡其正面一击。"
    },
    {
        id: "weapons_1287",
        name: "历代孤品·盘古",
        type: "weapon" , subType: "钺",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 72, mag_atk: 72, crit: 10, speed: -53, sharpness: 96 },
        value: 80010,
        req: { jing: 81, qi: 0, shen: 9 },
        desc: "皇权巅峰时期的最高神兵。它代表了人类对抗天道的最后倔强，其灵导性与物理破坏力皆为造化绝响。"
    }
];
const weapons_r6_batch7 = [
    // === 斧 (Heavy) - 9条 ===
    // 系数: 1.65, 0.3, -2.5, 0.9 | 配比 8:0:2
    // Total_Req 90 -> 精 72 / 气 0 / 神 18

    {
        id: "weapons_1288",
        name: "废土裂痕宣花斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 99, mag_atk: 0, crit: 4, speed: -30, sharpness: 54 },
        value: 52920,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "从破碎的地脉裂缝中挖掘出的巨型斧胎，表面满是粗粝的纹路。虽然没有任何灵力波动，但其每一劈都能切断炼气修士的护体罡气。"
    },
    {
        id: "weapons_1289",
        name: "污染残魂噬魂斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 74, mag_atk: 25, crit: 4, speed: -30, sharpness: 54 },
        value: 52920,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "末日战场上吸收了万千战死者怨气的重斧。挥舞时伴随着凄厉的哀鸣，法术侵蚀力极强，能通过伤口剥离真元。"
    },
    {
        id: "weapons_1290",
        name: "皇廷秘藏·斩岳",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 50, mag_atk: 49, crit: 4, speed: -30, sharpness: 54 },
        value: 52920,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "皇帝赐予征西大将军的成人礼。采用深海寒铁母铸造，重心调校达到了重型武器的极致，物法双修者皆能运用自如。"
    },
    {
        id: "weapons_1291",
        name: "黑钢陨落碎星斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 124, mag_atk: 0, crit: 6, speed: -45, sharpness: 81 },
        value: 66150,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "由坠入废土的一整颗黑星内核锻造。这把斧头已经产生了微弱的引力场，劈砍瞬间产生的物理重压足以崩碎神阶盾牌。"
    },
    {
        id: "weapons_1292",
        name: "寂灭紫火焚天斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 93, mag_atk: 31, crit: 6, speed: -45, sharpness: 81 },
        value: 66150,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "融入了末世灭世之火的孤品。斧刃常年处于红炽状态，没有任何物理装甲能挡住其伴随法术穿透的高温切割。"
    },
    {
        id: "weapons_1293",
        name: "神工传世·乾坤",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 62, mag_atk: 62, crit: 6, speed: -45, sharpness: 81 },
        value: 66150,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "炼器宗师耗费毕生心血打造的阴阳重斧。斧柄为阳，斧刃为阴，物理冲击与法力湮灭共振，乃是炼气期能触碰的法则武器。"
    },
    {
        id: "weapons_1294",
        name: "万古寂灭劫末斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 148, mag_atk: 0, crit: 9, speed: -60, sharpness: 108 },
        value: 79920,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "R6斧类物理天花板。由世界崩毁时的废料凝练，斧刃带有一种终结的法则。一斧之下，纵是万年僵尸亦要化为齑粉。"
    },
    {
        id: "weapons_1295",
        name: "紫霄雷鸣灭魂斧",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 111, mag_atk: 37, crit: 9, speed: -60, sharpness: 108 },
        value: 79920,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "斧身缠绕着永不熄灭的九天紫雷。巨大的物理重量配合雷劫穿透，使其在战场上如同一道黑色的天灾，无人能挡。"
    },
    {
        id: "weapons_1296",
        name: "皇权圣物·盘古",
        type: "weapon" , subType: "斧",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 74, mag_atk: 74, crit: 9, speed: -60, sharpness: 108 },
        value: 79920,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "传说中开天辟地之斧的仿制品，历代帝王的镇国重器。它不仅是杀敌的利刃，更是统治秩序的象征，物法平衡已入神迹。"
    },

    // === 椎 (Heavy) - 9条 ===
    // 系数: 1.85, 0.0, -3.5, 0.4 | 配比 10:0:0
    // Total_Req 90 -> 精 90 / 气 0 / 神 0

    {
        id: "weapons_1297",
        name: "废土碎石铁椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 111, mag_atk: 0, crit: 0, speed: -42, sharpness: 24 },
        value: 50040,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "由废墟中最沉重的实心工业钢柱打磨而成的铁椎。没有任何法术加持，纯粹依靠炼气修士那一身蛮力碾碎对手。"
    },
    {
        id: "weapons_1298",
        name: "辐射铁锈镇魂缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 83, mag_atk: 28, crit: 0, speed: -42, sharpness: 24 },
        value: 50040,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "在满是辐射尘埃的铁冢中浸渍百年的重缒。击中敌方瞬间会产生物理震荡与辐射内劲，令其神魂不稳。"
    },
    {
        id: "weapons_1299",
        name: "前朝督造·撼山",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 56, mag_atk: 55, crit: 0, speed: -42, sharpness: 24 },
        value: 50040,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "皇帝卫队中力士配发的制式巅峰。即便在重兵器中，它的平衡感也极佳，物理压重与法力疏导完美对等。"
    },
    {
        id: "weapons_1300",
        name: "蚀甲重型乌金椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 139, mag_atk: 0, crit: 0, speed: -63, sharpness: 36 },
        value: 60210,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "由极高浓度的乌金精母压制而成，椎体呈暗金色。这是纯粹的物理防御终结者，一击下砸，万甲皆碎。"
    },
    {
        id: "weapons_1301",
        name: "九幽冥铁碎魂缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 104, mag_atk: 35, crit: 0, speed: -63, sharpness: 36 },
        value: 60210,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "采集九幽之下的冥铁铸造。除了恐怖的砸击力，其携带的阴死气息能直接腐蚀修士的真元，法穿效果显著。"
    },
    {
        id: "weapons_1302",
        name: "宗师血祭·万钧",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 70, mag_atk: 69, crit: 0, speed: -63, sharpness: 36 },
        value: 60210,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "某位末世力士宗师在陨落前血祭的孤品。椎体已产生灵性，能自动锁定目标，物理与法术威力极其均衡。"
    },
    {
        id: "weapons_1303",
        name: "万古寂灭黑星缒",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 167, mag_atk: 0, crit: 0, speed: -84, sharpness: 48 },
        value: 70380,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "R6全系统物理攻击上限，由一颗小型死星的残骸缩炼而成。其重量已让时空轻微扭曲，这一砸，便是地狱。"
    },
    {
        id: "weapons_1304",
        name: "紫霄焚灵灭世椎",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 125, mag_atk: 42, crit: 0, speed: -84, sharpness: 48 },
        value: 70380,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "椎头布满了劫雷形成的纹路。下砸瞬间引发的灵力爆破足以贯穿所有的防御法术，是炼气期真正的破阵重宝。"
    },
    {
        id: "weapons_1305",
        name: "历代孤品·镇国",
        type: "weapon" , subType: "椎",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 84, mag_atk: 83, crit: 0, speed: -84, sharpness: 48 },
        value: 70380,
        req: { jing: 90, qi: 0, shen: 0 },
        desc: "皇权统治万世的象征，这柄重椎曾镇压过无数叛乱。它拥有超越常理的法力转化效率，乃是当世唯一的镇国缒。"
    }
];
const weapons_r6_batch8 = [
    // === 殳 (Heavy) - 9条 ===
    // 系数: 1.55, 0.5, -2.0, 0.5 | 配比 8:0:2
    // Total_Req 90 -> 精 72 / 气 0 / 神 18

    {
        id: "weapons_1306",
        name: "荒原拼凑六棱殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 93, mag_atk: 0, crit: 6, speed: -24, sharpness: 30 },
        value: 52020,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "由废墟中的厚重输油管与六棱钢筋焊制。没有任何法力，但每一次挥砸带起的物理惯性足以让持盾的炼气修士手臂折断。"
    },
    {
        id: "weapons_1307",
        name: "辐射铁锈碎骨殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 70, mag_atk: 23, crit: 6, speed: -24, sharpness: 30 },
        value: 52020,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "殳头寄生了变异的赤红锈迹，能诱发敌人的血气衰败。这种混合了辐射与物理砸击的兵器，在末世中极具威慑力。"
    },
    {
        id: "weapons_1308",
        name: "前朝督造·止戈",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 47, mag_atk: 46, crit: 6, speed: -24, sharpness: 30 },
        value: 52020,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "皇城沦陷前最后一批礼兵器。虽然名为止戈，但其灵木杆身传导真元的效率极高，能让修士在重击中瞬间爆发出内劲。"
    },
    {
        id: "weapons_1309",
        name: "蚀甲重型黑钢殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 116, mag_atk: 0, crit: 10, speed: -36, sharpness: 45 },
        value: 66420,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "采用废土禁区产出的高密度黑钢，殳身重逾两百斤。这是纯粹的物理压制神兵，下砸之力足以震碎五品以下任何甲胄。"
    },
    {
        id: "weapons_1310",
        name: "寂灭紫火震魂殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 87, mag_atk: 29, crit: 10, speed: -36, sharpness: 45 },
        value: 66420,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "殳头封印了一团终焉紫火。在产生巨大物理碰撞的同时，法术火焰会顺着兵刃交接处强行灌入对方经脉。"
    },
    {
        id: "weapons_1311",
        name: "宗师孤品·定鼎",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 58, mag_atk: 58, crit: 10, speed: -36, sharpness: 45 },
        value: 66420,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "曾为镇压国运而铸造。此殳已生灵性，能自动弥补炼气修士气息不稳的缺陷，使其每一击都重若泰山。"
    },
    {
        id: "weapons_1312",
        name: "万古寂灭劫末殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 139, mag_atk: 0, crit: 12, speed: -48, sharpness: 60 },
        value: 78660,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "R6物理之巅，由神庙废墟下的星辰母金打造。挥舞间隐隐带起空间的物理裂隙，是毁灭防御的终极凶器。"
    },
    {
        id: "weapons_1313",
        name: "紫霄雷鸣灭魂殳",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 104, mag_atk: 35, crit: 12, speed: -48, sharpness: 60 },
        value: 78660,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "嵌入了劫雷灵髓的长殳。沉重的打击伴随着震碎神魂的雷鸣法穿，对依靠法宝护身的敌人具有降维打击之效。"
    },
    {
        id: "weapons_1314",
        name: "历代遗珍·天柱",
        type: "weapon" , subType: "殳",
        combatType: "重型",
        rarity: 6,
        effects: { phy_atk: 70, mag_atk: 69, crit: 12, speed: -48, sharpness: 60 },
        value: 78660,
        req: { jing: 72, qi: 0, shen: 18 },
        desc: "相传为古皇宫门前的通天柱碎片改制。材质已臻化境，能将修士的微薄真元转化为排山倒海的物理压迫感。"
    },

    // === 弩 (Range) - 9条 ===
    // 系数: 1.35, 1.0, -2.0, 0.0 | 配比 3:0:7
    // Total_Req 90 -> 精 27 / 气 0 / 神 63

    {
        id: "weapons_1315",
        name: "废土拼装连发弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 81, mag_atk: 0, crit: 12, speed: -24, sharpness: 0 },
        value: 50220,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "由报废的工业机床弹簧与钢梁组装。拉力极其恐怖，射出的弩箭能瞬间洞穿炼气期修士引以为傲的铁杉盾。"
    },
    {
        id: "weapons_1316",
        name: "污染核心导引弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 61, mag_atk: 20, crit: 12, speed: -24, sharpness: 0 },
        value: 50220,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "弩机核心使用了废弃的聚灵阵残件，射出的箭矢带有紊乱的法力流。这种法力能顺着伤口侵蚀目标的气海。"
    },
    {
        id: "weapons_1317",
        name: "皇城御制·神臂",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 41, mag_atk: 40, crit: 12, speed: -24, sharpness: 0 },
        value: 50220,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "皇都守备军的最高科技结晶。弩臂采用了极佳的灵性钢材，不仅物理精度高，更能增幅修士的本源真气。"
    },
    {
        id: "weapons_1318",
        name: "蚀甲陨星破城弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 101, mag_atk: 0, crit: 18, speed: -36, sharpness: 0 },
        value: 64260,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "采集坠落星辰的内核碎片打制箭镞，弩臂由重型黑金铸造。一箭之威足以击穿城墙，是末世阵地战的死神。"
    },
    {
        id: "weapons_1319",
        name: "寂灭余烬诛仙弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 76, mag_atk: 25, crit: 18, speed: -36, sharpness: 0 },
        value: 64260,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "弩机经过劫火余烬的淬炼，射出的箭矢带有一道暗红的法力射线。法术穿透极强，专门针对高阶护身宝珠。"
    },
    {
        id: "weapons_1320",
        name: "宗师遗墨·穿云",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 51, mag_atk: 50, crit: 18, speed: -36, sharpness: 0 },
        value: 64260,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "末日前夕神射宗师留下的禁忌弩具。它能自动捕捉千步外的神识波动，并将持有者的意志凝结为无形之矢。"
    },
    {
        id: "weapons_1321",
        name: "万古寂灭绝影弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 121, mag_atk: 0, crit: 24, speed: -48, sharpness: 0 },
        value: 78300,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "R6远射物理巅峰。采用空间坍塌后的结晶打造弩弦，箭矢离弦即遁入虚空，只留下物理防具碎裂的哀鸣。"
    },
    {
        id: "weapons_1322",
        name: "紫霄雷鸣透魂弩",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 91, mag_atk: 31, crit: 24, speed: -48, sharpness: 0 },
        value: 78840,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "镶嵌了劫雷核心的终极弩。每一箭都蕴含毁灭性的法穿灵压，能在瞬间将敌人的元神与肉体一同贯穿。"
    },
    {
        id: "weapons_1323",
        name: "历代孤品·天诛",
        type: "weapon" , subType: "弩",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 61, mag_atk: 60, crit: 24, speed: -48, sharpness: 0 },
        value: 78300,
        req: { jing: 27, qi: 0, shen: 63 },
        desc: "皇朝末代帝王的贴身禁弩，曾以此弩射杀过叛乱的元婴化身。其平衡感与攻击力皆为这个时代不可复现的绝响。"
    }
];
const weapons_r6_batch9 = [
    // === 弓 (Range) - 9条 ===
    // 系数: 1.05, 1.5, -0.5, 0.0 | 配比 5:0:5
    // Total_Req 90 -> 精 45 / 气 0 / 神 45

    {
        id: "weapons_1324",
        name: "荒原龙骨长弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 63, mag_atk: 0, crit: 18, speed: -6, sharpness: 0 },
        value: 51840,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "由废墟深处挖掘出的荒古巨兽脊骨制成。弓弦由变异蟒筋绞合，每一次拉满都伴随着骨骼的物理共鸣，物理冲击力惊人。"
    },
    {
        id: "weapons_1325",
        name: "污染流光角弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 47, mag_atk: 16, crit: 18, speed: -6, sharpness: 0 },
        value: 51840,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "原本用于祭祀的玉角弓，被废土灵压污染后散发着幽绿流光。射出的箭矢带有剧烈的法力腐蚀效果。"
    },
    {
        id: "weapons_1326",
        name: "前朝秘藏·落月",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 32, mag_atk: 31, crit: 18, speed: -6, sharpness: 0 },
        value: 51840,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "皇城秘库出土的绝世长弓。材质极其匀称，能将持弓者微弱的神识与物理拉力完美融合，是炼气期难得的均衡神物。"
    },
    {
        id: "weapons_1327",
        name: "蚀甲黑金复合弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 79, mag_atk: 0, crit: 27, speed: -9, sharpness: 0 },
        value: 69390,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "采用废土深层乌金打造的滑轮结构复合弓。这把工业残骸与炼器结合的产物，物理爆发力足以震碎同阶防御术法。"
    },
    {
        id: "weapons_1328",
        name: "寂灭劫火穿云弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 59, mag_atk: 20, crit: 27, speed: -9, sharpness: 0 },
        value: 69390,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "弓身缠绕着永不熄灭的寂灭劫火。发射的箭矢会自动捕捉目标的法力波动，并在命中瞬间引发法力大爆炸。"
    },
    {
        id: "weapons_1329",
        name: "神射遗珍·啸风",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 40, mag_atk: 39, crit: 27, speed: -9, sharpness: 0 },
        value: 69390,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "某位末世射神留下的随身弓。此弓已生灵性，能在大风沙的废土环境下自动校准物理弹道，法力传导极佳。"
    },
    {
        id: "weapons_1330",
        name: "万古寂灭坠星弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 94, mag_atk: 0, crit: 36, speed: -12, sharpness: 0 },
        value: 86400,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "R6弓系物理巅峰。由星核残骸整体磨制，沉重到极点。射出的重箭具有物理上的引力吸引，中箭者几乎必死。"
    },
    {
        id: "weapons_1331",
        name: "紫霄雷鸣透骨弓",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 71, mag_atk: 23, crit: 36, speed: -12, sharpness: 0 },
        value: 86400,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "镶嵌了劫雷石的神弓。每一支箭矢离弦即化为灭世紫电，能无视目标的物理体积，直接针对其丹田进行法术穿透。"
    },
    {
        id: "weapons_1332",
        name: "历代孤品·后羿",
        type: "weapon" , subType: "弓",
        combatType: "远射",
        rarity: 6,
        effects: { phy_atk: 47, mag_atk: 47, crit: 36, speed: -12, sharpness: 0 },
        value: 86400,
        req: { jing: 45, qi: 0, shen: 45 },
        desc: "皇朝至尊孤品。此弓代表了远程威慑的终极意志，其攻击中蕴含的一丝法则之力，让任何同阶修士都感到窒息。"
    },

    // === 飞剑 (Relic) - 9条 ===
    // 系数: 1.0, 1.2, +1.2, 1.3 | 配比 1:6:3
    // Total_Req 90 -> 精 9 / 气 54 / 神 27

    {
        id: "weapons_1333",
        name: "废土碎刃灵剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 60, mag_atk: 0, mag_crit: 14, speed: 14, penetration: 78 },
        value: 55980,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "从古代剑冢中挖掘出的残缺剑胚，虽已失灵性，但其材质依旧强横。御剑斩击时的物理冲击感远超凡铁。"
    },
    {
        id: "weapons_1334",
        name: "污染青虹飞剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 15, mag_crit: 14, speed: 14, penetration: 78 },
        value: 55980,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "原本清正的飞剑在灵压紊乱中化为青绿色。剑气中带有一种能够溶解灵力的粘性，法术侵彻力不容小觑。"
    },
    {
        id: "weapons_1335",
        name: "前朝督造·龙泉",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 30, mag_atk: 30, mag_crit: 14, speed: 14, penetration: 78 },
        value: 55980,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "皇室宗庙供奉的长剑。它是炼气修士能接触到的最稳定飞剑，物理结构与真元亲和度达到了神话级平衡。"
    },
    {
        id: "weapons_1336",
        name: "蚀骨乌金绝影剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 75, mag_atk: 0, mag_crit: 22, speed: 22, penetration: 117 },
        value: 77220,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "由废墟深处乌金母矿精炼。此剑极重，御使时如同拖拽着一座小山，一旦命中，物理压力足以摧枯拉朽。"
    },
    {
        id: "weapons_1337",
        name: "寂灭焚天法剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 56, mag_atk: 19, mag_crit: 22, speed: 22, penetration: 117 },
        value: 77220,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "刻满了古老焚神阵纹的剑身。御剑飞行时会留下空间燃烧的痕迹，法术穿透性专门针对修士的神识屏障。"
    },
    {
        id: "weapons_1338",
        name: "剑仙孤品·青干",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 38, mag_atk: 37, mag_crit: 22, speed: 22, penetration: 117 },
        value: 77220,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "旧时代剑修宗师的成名剑残片。虽已残损，但其中的剑意未灭，能自动补完炼气修士法力不足的缺陷。"
    },
    {
        id: "weapons_1339",
        name: "万古寂灭天劫剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 90, mag_atk: 0, mag_crit: 29, speed: 29, penetration: 156 },
        value: 97110,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "R6飞剑物理巅峰。由坠入凡间的法则碎片打磨。御剑斩击瞬间产生的物理撕裂力，足以让天地失色。"
    },
    {
        id: "weapons_1340",
        name: "紫霄噬魂灵剑",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 68, mag_atk: 22, mag_crit: 29, speed: 29, penetration: 156 },
        value: 97110,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "剑尖封印了末世劫雷之魂。具有神迹级的灵透穿透性，能强制剥离方圆百丈内敌对修士的法力掌控权。"
    },
    {
        id: "weapons_1341",
        name: "皇权圣物·太阿",
        type: "weapon" , subType: "飞剑",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 45, mag_atk: 45, mag_crit: 29, speed: 29, penetration: 156 },
        value: 97110,
        req: { jing: 9, qi: 54, shen: 27 },
        desc: "作为文明最后传承的镇国飞剑。此剑一出，万剑俯首，其灵性与物性皆已登峰造极，乃传世孤品。"
    }
];
const weapons_r6_batch10 = [
    // === 法印 (Relic) - 9条 ===
    // 系数: 1.6, 0.5, -3.0, 1.1 | 配比 4:5:1
    // Total_Req 90 -> 精 36 / 气 45 / 神 9

    {
        id: "weapons_1342",
        name: "废土碎石镇山印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 96, mag_atk: 0, mag_crit: 6, speed: -36, penetration: 66 },
        value: 52560,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "由崩塌的神山基石打磨而成的粗粝法印，沉重得近乎物理常识。即便不注法力，砸击间带起的惯性冲击也足以压扁炼气期的防御屏障。"
    },
    {
        id: "weapons_1343",
        name: "污染残光通灵印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 72, mag_atk: 24, mag_crit: 6, speed: -36, penetration: 66 },
        value: 52560,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "原本祥和的法印在末日灵爆中扭曲，周身萦绕着青紫色的残留灵光。除了物理重压，更能通过法力共振强制瓦解对方的经脉运行。"
    },
    {
        id: "weapons_1344",
        name: "前朝督造·受命印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 48, mag_atk: 48, mag_crit: 6, speed: -36, penetration: 66 },
        value: 52560,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "皇权象征的副印。虽然材质已有磨损，但对真元的兼容性依旧处于神话级水平。物理震慑与法术平抑达到了完美的平衡。"
    },
    {
        id: "weapons_1345",
        name: "蚀甲重型玄黄印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 120, mag_atk: 0, mag_crit: 10, speed: -54, penetration: 99 },
        value: 66960,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "采集地底万丈下的玄黄精铁铸造，每一寸都密度惊人。这把法印在砸中目标时会产生小范围的重力场，物理破甲效果极其残暴。"
    },
    {
        id: "weapons_1346",
        name: "寂灭紫火焚天印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 90, mag_atk: 30, mag_crit: 10, speed: -54, penetration: 99 },
        value: 66960,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "刻满了上古焚神符文。印底红炽如炭，激发的法力火柱带有毁灭性的法则侵蚀，专门剥离修士引以为傲的法术抗性。"
    },
    {
        id: "weapons_1347",
        name: "神工传世·定鼎印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 60, mag_atk: 60, mag_crit: 10, speed: -54, penetration: 99 },
        value: 66960,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "炼器宗师在末日降临前为守护最后一方净土而铸。印身稳如磐石，法力传导丝滑，能大幅增强炼气修士对真元的掌控精度。"
    },
    {
        id: "weapons_1348",
        name: "万古寂灭崩云印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 144, mag_atk: 0, mag_crit: 12, speed: -72, sharpness: 132 },
        value: 79200,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "R6法印物理巅峰。由坠落凡间的神殿地砖磨制，自带斩断因果的重击特效。一印落下，万法皆空，物理杀伤已触及法则壁垒。"
    },
    {
        id: "weapons_1349",
        name: "紫霄雷鸣透魂印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 108, mag_atk: 36, mag_crit: 12, speed: -72, sharpness: 132 },
        value: 79200,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "镶嵌了灭世劫雷核心。每一次砸击伴随着亿万雷弧，法术穿透性极佳，能在瞬间击碎高阶强者的神识外壳。"
    },
    {
        id: "weapons_1350",
        name: "皇权圣物·传国印",
        type: "weapon" , subType: "法印",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 72, mag_atk: 72, mag_crit: 12, speed: -72, sharpness: 132 },
        value: 79200,
        req: { jing: 36, qi: 45, shen: 9 },
        desc: "受命于天，既寿永昌。皇朝唯一的传国真印，其蕴含的气运已化为实质的物理保护与法力增幅，乃是末世唯一的至宝。"
    },

    // === 宝葫芦 (Relic) - 9条 ===
    // 系数: 0.95, 1.0, 0.0, 1.4 | 配比 2:7:1
    // Total_Req 90 -> 精 18 / 气 63 / 神 9

    {
        id: "weapons_1351",
        name: "荒原枯木纳气葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 57, mag_atk: 0, mag_crit: 12, speed: 0, penetration: 84 },
        value: 48780,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "在灵气干枯的荒原中存活的千年紫檀木结出的葫芦。虽然外皮干裂，但其质地如铁，喷出的压缩气旋具有极强的物理切割力。"
    },
    {
        id: "weapons_1352",
        name: "污染残灵吞魂葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 43, mag_atk: 14, mag_crit: 12, speed: 0, penetration: 84 },
        value: 48780,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "原本清雅的宝葫芦被废土怨气污染。每次开启都能吸入周围的游离灵力，并吐出带有腐蚀效果的青绿色毒烟。"
    },
    {
        id: "weapons_1353",
        name: "前朝秘藏·紫金",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 29, mag_atk: 28, mag_crit: 12, speed: 0, penetration: 84 },
        value: 48780,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "皇城秘库出土的紫金宝葫。对各类真元有着极高的兼容度，物理韧性极佳，是炼气期修士用来转化法力的首选法具。"
    },
    {
        id: "weapons_1354",
        name: "蚀甲重型纳元葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 71, mag_atk: 0, mag_crit: 18, speed: 0, penetration: 126 },
        value: 65340,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "由废墟深处的黑金打造，并以神兽血液浸泡。喷出的空气波带有一种物理重压感，能在大面积战斗中强制剥离目标的甲胄。"
    },
    {
        id: "weapons_1355",
        name: "寂灭劫火炼神葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 54, mag_atk: 18, mag_crit: 18, speed: 0, penetration: 126 },
        value: 65880,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "葫芦口常年跳跃着紫红色的劫火。它能将敌人的法力攻击吸入并转化为高温射线反弹，法术穿透性登峰造极。"
    },
    {
        id: "weapons_1356",
        name: "药仙遗墨·归一",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 36, mag_atk: 35, mag_crit: 18, speed: 0, penetration: 126 },
        value: 65340,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "曾由末世药圣持有的疗伤圣物。即使在灵气全无的环境下，也能通过物理振荡凝聚出一丝真元精华，物法协同之巅。"
    },
    {
        id: "weapons_1357",
        name: "万古寂灭乾坤葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 86, mag_atk: 0, mag_crit: 24, speed: 0, penetration: 168 },
        value: 82440,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "R6葫芦系物理极限。内部封印了一个坍缩的空间，喷出的一缕气劲即可摧毁千步外的山岳，物理破坏已入神迹。"
    },
    {
        id: "weapons_1358",
        name: "紫霄雷鸣灭魂葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 64, mag_atk: 22, mag_crit: 24, speed: 0, penetration: 168 },
        value: 82440,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "镶嵌了九枚雷劫晶簇。开启瞬间爆发出的紫电灵流能瞬间抹除目标的神识印记，法穿效果横扫炼气期。"
    },
    {
        id: "weapons_1359",
        name: "皇权圣物·江山葫",
        type: "weapon" , subType: "宝葫芦",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 43, mag_atk: 43, mag_crit: 24, speed: 0, penetration: 168 },
        value: 82440,
        req: { jing: 18, qi: 63, shen: 9 },
        desc: "相传葫内装有九洲地脉之气。此葫一出，即代表天命所归。其完美的属性配比代表了上古炼器文明的最高尊严。"
    }
];
const weapons_r6_batch11 = [
    // === 阵盘 (Relic) - 9条 ===
    // 系数: 1.1, 1.3, -1.0, 1.2 | 配比 2:6:2
    // Total_Req 90 -> 精 18 / 气 54 / 神 18

    {
        id: "weapons_1360",
        name: "废土残垣刻石盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 66, mag_atk: 0, mag_crit: 16, speed: -12, penetration: 72 },
        value: 54000,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "由崩毁神庙的基石磨制，盘面刻痕粗犷有力。虽灵力尽失，但开启时强行镇压周围重力，物理压制力极强。"
    },
    {
        id: "weapons_1361",
        name: "污染灵脉囚阵盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 50, mag_atk: 16, mag_crit: 16, speed: -12, penetration: 72 },
        value: 54000,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "盘身寄生了变异的紫晶。它能吸纳废土中的混乱灵力，转化为带有侵蚀效果的阵纹，法穿性能极佳。"
    },
    {
        id: "weapons_1362",
        name: "前朝督造·定风",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 33, mag_atk: 33, mag_crit: 16, speed: -12, penetration: 72 },
        value: 54000,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "皇城司祭祀风神所用的副盘。材质稳定，能将极其微弱的炼气真元转化为稳固的力场，物法防御均衡。"
    },
    {
        id: "weapons_1363",
        name: "蚀甲黑金镇地阵",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 83, mag_atk: 0, mag_crit: 23, speed: -18, penetration: 108 },
        value: 71280,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "采用黑金精母铸造，重达百斤。一旦落地，周围十丈内物理重力翻倍，强行撕裂敌方护甲，物理破坏性惊人。"
    },
    {
        id: "weapons_1364",
        name: "寂灭劫火绝影盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 62, mag_atk: 21, mag_crit: 23, speed: -18, penetration: 108 },
        value: 71280,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "刻满了终焉之火的阵符。阵法激发瞬间会产生灼烧空气的法力波浪，针对神识进行无法防御的物理穿透。"
    },
    {
        id: "weapons_1365",
        name: "大阵遗珍·玄枢",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 42, mag_atk: 41, mag_crit: 23, speed: -18, penetration: 108 },
        value: 71280,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "曾作为护国大阵核心的子盘。即便灵气枯竭，其内部的能量回路依然能引导出极其纯粹的物理与法术冲击。"
    },
    {
        id: "weapons_1366",
        name: "万古寂灭崩天阵",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 99, mag_atk: 0, mag_crit: 31, speed: -24, penetration: 144 },
        value: 89100,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "R6阵盘物理巅峰。由星辰残余法则凝炼而成，阵法开启即意味着空间的物理坍塌，万物皆被碾为齑粉。"
    },
    {
        id: "weapons_1367",
        name: "紫霄雷鸣蚀骨盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 74, mag_atk: 25, mag_crit: 31, speed: -24, penetration: 144 },
        value: 89100,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "嵌入了灭世劫雷的灵髓。阵法产生的紫电能够瞬间剥离敌人的修为加持，并产生毁灭性的法术穿透效果。"
    },
    {
        id: "weapons_1368",
        name: "皇权圣物·九州盘",
        type: "weapon" , subType: "阵盘",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 50, mag_atk: 49, mag_crit: 31, speed: -24, penetration: 144 },
        value: 89100,
        req: { jing: 18, qi: 54, shen: 18 },
        desc: "作为文明最后版图的缩影。此盘代表了绝对的统治秩序，其物法双修的性能代表了上古阵法学的最高造诣。"
    },

    // === 灵镜 (Relic) - 9条 ===
    // 系数: 0.9, 1.4, +0.5, 1.5 | 配比 1:7:2
    // Total_Req 90 -> 精 9 / 气 63 / 神 18

    {
        id: "weapons_1369",
        name: "废土残缺青铜镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 54, mag_atk: 0, mag_crit: 17, speed: 6, penetration: 90 },
        value: 54540,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "在沙暴中磨损的古镜，镜面斑驳。但在特定的角度下，它能反射出极其强烈的物理冲击波，震碎敌人的骨骼。"
    },
    {
        id: "weapons_1370",
        name: "污染流光邪瞳镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 41, mag_atk: 13, mag_crit: 17, speed: 6, penetration: 90 },
        value: 54540,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "被域外邪气侵染的灵镜。镜光中带有一种令人疯狂的法力波动，专门针对炼气修士不稳定的神识屏障。"
    },
    {
        id: "weapons_1371",
        name: "皇廷秘藏·映月",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 27, mag_atk: 27, mag_crit: 17, speed: 6, penetration: 90 },
        value: 54540,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "皇室后妃珍藏的通灵镜。镜身导灵性极佳，能将法力柔和地转化为物理推斥力，攻守转换极为迅速。"
    },
    {
        id: "weapons_1372",
        name: "蚀甲黑金反冲镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 68, mag_atk: 0, mag_crit: 25, speed: 9, penetration: 135 },
        value: 74250,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "由厚重的黑金磨制镜框。它能吸收并反弹敌人的物理打击，并将其转化为更强的动能穿透，物理爆发极高。"
    },
    {
        id: "weapons_1373",
        name: "寂灭劫火灼魂镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 51, mag_atk: 17, mag_crit: 25, speed: 9, penetration: 135 },
        value: 74250,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "镜内囚禁了一丝太阳熄灭前的余晖。射出的毁灭法光能瞬间贯穿所有的真元护盾，法穿效果横扫战场。"
    },
    {
        id: "weapons_1374",
        name: "宗师遗墨·虚实",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 34, mag_atk: 34, mag_crit: 25, speed: 9, penetration: 135 },
        value: 74250,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "炼器宗师关于虚实转化的实验之作。镜光能在物理重压与法术涟漪间自由切换，乃是战术博弈的极品。"
    },
    {
        id: "weapons_1375",
        name: "万古寂灭轮回镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 81, mag_atk: 0, mag_crit: 34, speed: 12, penetration: 180 },
        value: 94500,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "R6灵镜物理巅峰。由破碎的虚空晶石磨制，镜面映照之处，物理法则会发生逆转坍缩，是一件真正的毁灭者。"
    },
    {
        id: "weapons_1376",
        name: "紫霄雷鸣透心镜",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 61, mag_atk: 20, mag_crit: 34, speed: 12, penetration: 180 },
        value: 94500,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "镶嵌了劫雷本源的顶级镜器。激发的雷光束具有超越常理的法穿灵压，能在瞬息间洞穿百里外的强敌。"
    },
    {
        id: "weapons_1377",
        name: "历代孤品·昊天",
        type: "weapon" , subType: "灵镜",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 41, mag_atk: 40, mag_crit: 34, speed: 12, penetration: 180 },
        value: 94500,
        req: { jing: 9, qi: 63, shen: 18 },
        desc: "相传为上古神灵监察下界的昊天镜仿品。即便只有万分之一的威力，其完美的属性配比也足以傲视末世众生。"
    }
];
const weapons_r6_batch12 = [
    // === 长幡 (Relic) - 9条 ===
    // 系数: 1.15, 1.2, -1.5, 1.0 | 配比 1:5:4
    // Total_Req 90 -> 精 9 / 气 45 / 神 36

    {
        id: "weapons_1378",
        name: "废土白骨聚魂幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 69, mag_atk: 0, mag_crit: 14, speed: -18, penetration: 60 },
        value: 51120,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "由变异荒兽肋骨撑起的白布长幡。虽然简陋，但幡面自带一种物理上的阴冷重压，挥动间能产生如实质般的碎骨冲击。"
    },
    {
        id: "weapons_1379",
        name: "污染怨气锁灵幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 52, mag_atk: 17, mag_crit: 14, speed: -18, penetration: 60 },
        value: 51120,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "原本用于引魂的长幡，被废土中的滔天怨气侵蚀。释放出的灰雾不仅能遮蔽感知，更能通过法力腐蚀敌人的肉身防御。"
    },
    {
        id: "weapons_1380",
        name: "前朝督造·归魂",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 35, mag_atk: 34, mag_crit: 14, speed: -18, penetration: 60 },
        value: 51120,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "皇城司御用的引魂旌旗。幡杆采用极品雷击木，对真元的传导异常丝滑，是物理扫荡与法力镇压的平衡之作。"
    },
    {
        id: "weapons_1381",
        name: "蚀甲重型万魂幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 86, mag_atk: 0, mag_crit: 22, speed: -27, penetration: 90 },
        value: 68310,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "幡面织入了大量的黑金丝线，重逾千钧。这已不仅仅是法宝，更是一件重型奇门钝器，物理破甲系数极高。"
    },
    {
        id: "weapons_1382",
        name: "寂灭劫火焚邪幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 65, mag_atk: 21, mag_crit: 22, speed: -27, penetration: 90 },
        value: 68310,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "幡面上绘满了毁灭性的劫火符文。激发时如同一道火龙卷席卷战场，法术穿透效果专治各类玄冰防御。"
    },
    {
        id: "weapons_1383",
        name: "宗师遗墨·招摇",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 43, mag_atk: 43, mag_crit: 22, speed: -27, penetration: 90 },
        value: 68310,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "炼器大宗师关于灵魂秩序的最后思考。幡影能在虚实之间切换，物理与法术威力各占其半，极难防御。"
    },
    {
        id: "weapons_1384",
        name: "万古寂灭终焉幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 104, mag_atk: 0, mag_crit: 29, speed: -36, penetration: 120 },
        value: 84960,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "R6长幡物理巅峰。幡身采用了坍缩位面的碎布，挥动瞬间即是空间的物理撕裂，任何护甲在其面前皆为薄纸。"
    },
    {
        id: "weapons_1385",
        name: "紫霄雷鸣夺神幡",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 78, mag_atk: 26, mag_crit: 29, speed: -36, penetration: 120 },
        value: 84960,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "镶嵌了劫雷母金。每一次招展都伴随着震碎神魂的紫雷法穿，是猎杀高阶邪修与变异怪物的绝杀凶器。"
    },
    {
        id: "weapons_1386",
        name: "历代孤品·镇魂",
        type: "weapon" , subType: "长幡",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 52, mag_atk: 52, mag_crit: 29, speed: -36, penetration: 120 },
        value: 84960,
        req: { jing: 9, qi: 45, shen: 36 },
        desc: "皇朝覆灭前祭天的终极圣幡。它代表了人类意志对末日法则的最后抵抗，完美的数值平衡使其成为当世孤品。"
    },

    // === 玉佩 (Relic) - 9条 ===
    // 系数: 0.9, 1.3, +1.0, 1.4 | 配比 0:4:6
    // Total_Req 90 -> 精 0 / 气 36 / 神 54

    {
        id: "weapons_1387",
        name: "废土皲裂青玉佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 54, mag_atk: 0, mag_crit: 12, speed: 12, penetration: 84 },
        value: 50400,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "在灵气风暴中幸存的古玉残片。虽然满是裂纹，但仍能通过物理共振弹开近身的利刃，保护脆弱的修士。"
    },
    {
        id: "weapons_1388",
        name: "污染血丝沁魂佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 41, mag_atk: 13, mag_crit: 12, speed: 12, penetration: 84 },
        value: 50400,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "被血雨浸染的玉佩，内部满布妖异红丝。能将修士的物理反击转化为带有法力毒素的震荡波，穿透性极强。"
    },
    {
        id: "weapons_1389",
        name: "前朝督造·龙凤",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 27, mag_atk: 27, mag_crit: 12, speed: 12, penetration: 84 },
        value: 50400,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "皇室宗亲佩戴的龙凤玉玦。即便在末世，其内部的灵力结构依然稳定如初，能提供极佳的物法双重庇佑。"
    },
    {
        id: "weapons_1390",
        name: "蚀甲重型玄玉佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 68, mag_atk: 0, mag_crit: 18, speed: 18, penetration: 126 },
        value: 68580,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "由密度极大的玄黑墨玉打造。这把“防御”法宝在撞击敌人时能爆发出排山倒海般的物理穿透力，无视轻甲。"
    },
    {
        id: "weapons_1391",
        name: "寂灭紫火护心佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 51, mag_atk: 17, mag_crit: 18, speed: 18, penetration: 126 },
        value: 68580,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "玉佩中心封印了一颗恒星死亡时的火晶。法术反弹时自带高温灼烧，能直接烧穿对手的神识防御层。"
    },
    {
        id: "weapons_1392",
        name: "仙人遗宝·太虚",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 34, mag_atk: 34, mag_crit: 18, speed: 18, penetration: 126 },
        value: 68580,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "曾由某位飞升失败的修士持有。玉身通透，能将外界的物理重压与法力冲击瞬间消解，乃是平稳修行的极品。"
    },
    {
        id: "weapons_1393",
        name: "万古寂灭混沌佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 81, mag_atk: 0, mag_crit: 24, speed: 24, penetration: 168 },
        value: 86220,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "R6玉佩物理巅峰。由一块来自混沌初开的原始石英切削而成，其物理质量带有一种绝对防御的法则，反击时碎灭万物。"
    },
    {
        id: "weapons_1394",
        name: "紫霄雷鸣映神佩",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 61, mag_atk: 20, mag_crit: 24, speed: 24, penetration: 168 },
        value: 86220,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "镶嵌了万年雷髓的护身宝玉。一旦受损，会自动爆发出大面积的紫电法穿灵压，与敌人同归于尽。"
    },
    {
        id: "weapons_1395",
        name: "皇权圣物·苍璧",
        type: "weapon" , subType: "玉佩",
        combatType: "法宝",
        rarity: 6,
        effects: { phy_atk: 41, mag_atk: 40, mag_crit: 24, speed: 24, penetration: 168 },
        value: 86220,
        req: { jing: 0, qi: 36, shen: 54 },
        desc: "作为文明最后祭天的礼玉。其蕴含的“天命”护盾能在瞬息间让物理与法术威力翻倍，代表了皇朝不灭的执念。"
    }
];
const weapons = [
    {
        id: "weapons_000",
        name: "无名小剑",
        type: "weapon" , subType: "剑",
        combatType: "均衡",
        grade: 0,
        rarity: 1,
        value: 0,
        durability: 30,
        sharpness: 10,
        effects: { phy_atk: 10, mag_atk: 10 },
        entries: [
            { id: "lifesteal", val: 5 }, // 吸血 15%
            { id: "sharpness_plus", val: 5 }, // 锐利 +10
            {id: "double_strike", val: 5} // 连击 15%
        ],
        desc: "剑就是剑，哪有什么名字",
    },
    ...weapons_r1_batch1 ,
    ...weapons_r1_batch2,
    ...weapons_r1_batch3,
    ...weapons_r1_batch4,
    ...weapons_r1_batch5,
    ...weapons_r1_batch6,
    ...weapons_r1_batch7,
    ...weapons_r1_batch8,
    ...weapons_r1_batch9,
    ...weapons_r1_batch10,
    ...weapons_r1_batch11,
    ...weapons_r1_batch12,
    ...weapons_r1_batch13,
    ...weapons_r1_batch14,
    ...weapons_r1_batch15,
    ...weapons_r1_batch16,
    ...weapons_r1_batch17,
    ...weapons_r1_batch18,
    ...weapons_r1_batch19,
    ...weapons_r1_batch20,
    ...weapons_r1_batch21,
    ...weapons_r1_batch22,
    ...weapons_r1_batch23,
    ...weapons_r1_batch24,
    ...weapons_r2_batch1,
    ...weapons_r2_batch2,
    ...weapons_r2_batch3,
    ...weapons_r2_batch4,
    ...weapons_r2_batch5,
    ...weapons_r2_batch6,
    ...weapons_r2_batch7,
    ...weapons_r2_batch8,
    ...weapons_r2_batch9,
    ...weapons_r2_batch10,
    ...weapons_r2_batch11,
    ...weapons_r2_batch12,
    ...weapons_r2_batch13,
    ...weapons_r2_batch14,
    ...weapons_r2_batch15,
    ...weapons_r2_batch16,
    ...weapons_r2_batch17,
    ...weapons_r2_batch18,
    ...weapons_r2_batch19,
    ...weapons_r2_batch20,
    ...weapons_r2_batch21,
    ...weapons_r2_batch22,
    ...weapons_r2_batch23,
    ...weapons_r2_batch24,
    ...weapons_r3_batch1,
    ...weapons_r3_batch2,
    ...weapons_r3_batch3,
    ...weapons_r3_batch4,
    ...weapons_r3_batch5,
    ...weapons_r3_batch6,
    ...weapons_r3_batch7,
    ...weapons_r3_batch8,
    ...weapons_r3_batch9,
    ...weapons_r3_batch10,
    ...weapons_r3_batch11,
    ...weapons_r3_batch12,
    ...weapons_r3_batch13,
    ...weapons_r3_batch14,
    ...weapons_r3_batch15,
    ...weapons_r3_batch16,
    ...weapons_r3_batch17,
    ...weapons_r3_batch18,
    ...weapons_r3_batch19,
    ...weapons_r3_batch20,
    ...weapons_r3_batch21,
    ...weapons_r3_batch22,
    ...weapons_r3_batch23,
    ...weapons_r3_batch24,
    ...weapons_r4_batch1,
    ...weapons_r4_batch2,
    ...weapons_r4_batch3,
    ...weapons_r4_batch4,
    ...weapons_r4_batch5,
    ...weapons_r4_batch6,
    ...weapons_r4_batch7,
    ...weapons_r4_batch8,
    ...weapons_r4_batch9,
    ...weapons_r4_batch10,
    ...weapons_r4_batch11,
    ...weapons_r4_batch12,
    ...weapons_r5_batch1,
    ...weapons_r5_batch2,
    ...weapons_r5_batch3,
    ...weapons_r5_batch4,
    ...weapons_r5_batch5,
    ...weapons_r5_batch6,
    ...weapons_r5_batch7,
    ...weapons_r5_batch8,
    ...weapons_r5_batch9,
    ...weapons_r5_batch10,
    ...weapons_r5_batch11,
    ...weapons_r5_batch12,
    ...weapons_r6_batch1,
    ...weapons_r6_batch2,
    ...weapons_r6_batch3,
    ...weapons_r6_batch4,
    ...weapons_r6_batch5,
    ...weapons_r6_batch6,
    ...weapons_r6_batch7,
    ...weapons_r6_batch8,
    ...weapons_r6_batch9,
    ...weapons_r6_batch10,
    ...weapons_r6_batch11,
    ...weapons_r6_batch12
];


