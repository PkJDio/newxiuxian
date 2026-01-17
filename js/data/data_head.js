/*
 * =========================================================================================
 * 游戏数据设计：头盔 / 头部装备计算公式 (HEAD / HELMET FORMULAS)
 * =========================================================================================
 * * 【1. 属性价值换算 Price per Point】(R = 稀有度 1-6)
 * -----------------------------------------------------------------------------------------
 * 1点 防御 (phy_def + mag_def) = 45 * R
 * 1点 速度 (speed)             = 45 * R
 * 1点 生命 (hp_max)            = 9 * R
 * 1点 攻击 (phy_atk + mag_atk) = 45 * R
 * 1点 属性 (jing / qi / shen)  = 90 * R
 * 1点 暴击 (crit)              = 180 * R
 *
 * * 【2. 基准数值区间 Base Stats (R = 稀有度)】
 * -----------------------------------------------------------------------------------------
 * 防御基准 (phy_def + mag_def) : [R*R + 2, 8*R + 10]
 * 速度基准 (speed)             : [R, R + 2]
 * 生命基准 (hp_max)            : [R*20, R*35]
 * 攻击基准 (phy_atk + mag_atk) : [R*2, R*4]
 * 暴击/属性基准 (crit / attr)   : [R*1, R*2]
 *
 * * 【3. 护甲类型修正系数 Type Modifiers】
 * -----------------------------------------------------------------------------------------
 * 类型  | 防御系数 | HP系数 | 速度系数 | 额外属性加成
 * -----------------------------------------------------------------------------------------
 * 板甲  | 1.5x     | 1.2x   | -1.0x    | phy_atk + 0.3x 基准攻击
 * 重甲  | 1.25x    | 1.1x   | -0.5x    | phy_atk + 0.2x 基准攻击
 * 轻甲  | 1.0x     | 1.0x   |  0x      | (标准型)
 * 皮甲  | 0.75x    | 0.8x   |  0.25x   | phy_atk + 0.5x 基准攻击, 1.0x 基准暴击
 * 布甲  | 0.5x     | 0.6x   |  0.5x    | mag_atk + 0.5x 基准攻击, qi+shen + 1.0x 基准属性
 * -----------------------------------------------------------------------------------------
 * * 【4. 字段说明 Reference】
 * -----------------------------------------------------------------------------------------
 * phy_def: 物理防御, mag_def: 法术防御, phy_atk/mag_atk: 物理/法术攻击
 * speed: 速度, hp_max: 生命, crit: 暴击, jing/qi/shen: 精/气/神
 * =========================================================================================
 */
// Batch 1: Rarity 1 - Head (Plate / 板甲)
// IDs: head_001 - head_009
const head_r1_batch1 = [
    // --- [Low Tier] R1 板甲 (总防: 5 | HP: 24 | 速: -1 | 物攻: 1 | 售价: 441) ---
    {
        id: "head_001",
        name: "生锈铁桶盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 441,
        durability: 35,
        effects: { phy_def: 4, mag_def: 1, speed: -1, hp_max: 24, phy_atk: 1 },

        desc: "【板甲】看起来真的只是个生了锈的铁桶，开了两个眼洞。虽然简陋，但至少能护住脑袋。"
    },
    {
        id: "head_002",
        name: "凹陷板金帽", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 441,
        durability: 35,
        effects: { phy_def: 3, mag_def: 2, speed: -1, hp_max: 24, phy_atk: 1 },

        desc: "【板甲】不知道从哪具残骸上扒下来的金属帽，侧面有严重的凹陷，戴着有点歪。"
    },
    {
        id: "head_003",
        name: "废铁衬护额", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 441,
        durability: 35,
        effects: { phy_def: 1, mag_def: 4, speed: -1, hp_max: 24, phy_atk: 1 },

        desc: "【板甲】由几块废弃铁片钉在粗布条上制成的护额，铁片上还残留着微弱的杂乱灵气。"
    },

    // --- [Mid Tier] R1 板甲 (总防: 16 | HP: 33 | 速: -2 | 物攻: 1 | 售价: 972) ---
    {
        id: "head_004",
        name: "粗制熟铁兜鍪", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 972,
        durability: 50,
        effects: { phy_def: 11, mag_def: 5, speed: -2, hp_max: 33, phy_atk: 1 },

        desc: "【板甲】乡间铁匠随手敲出的铁头盔，没有任何内衬，每次跑动都会发出金属碰撞声。"
    },
    {
        id: "head_005",
        name: "民兵旧板盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 972,
        durability: 50,
        effects: { phy_def: 8, mag_def: 8, speed: -2, hp_max: 33, phy_atk: 1 },

        desc: "【板甲】原本是民兵团的制式装备，因年代久远早已被淘汰，甲面上满是岁月的斑点。"
    },
    {
        id: "head_006",
        name: "沾泥护门盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 972,
        durability: 50,
        effects: { phy_def: 4, mag_def: 12, speed: -2, hp_max: 33, phy_atk: 1 },

        desc: "【板甲】用来顶门的破烂盔头，由于沾染了特殊的封门泥，对灵气的阻断效果出奇的好。"
    },

    // --- [High Tier] R1 板甲 (总防: 27 | HP: 42 | 速: -3 | 物攻: 1 | 售价: 1503) ---
    {
        id: "head_007",
        name: "劣质钢板护头", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 1503,
        durability: 65,
        effects: { phy_def: 20, mag_def: 7, speed: -3, hp_max: 42, phy_atk: 1 },

        desc: "【板甲】虽然钢质不纯且有气泡，但由于厚度惊人，普通木棍敲上去几乎纹丝不动。"
    },
    {
        id: "head_008",
        name: "碎裂虎纹盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 1503,
        durability: 65,
        effects: { phy_def: 14, mag_def: 13, speed: -3, hp_max: 42, phy_atk: 1 },

        desc: "【板甲】额头处有一道明显的裂痕，曾经应该是某位队长的旧盔，如今只能在旧货摊找到。"
    },
    {
        id: "head_009",
        name: "残缺面具铠", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 1503,
        durability: 65,
        effects: { phy_def: 7, mag_def: 20, speed: -3, hp_max: 42, phy_atk: 1 },

        desc: "【板甲】只剩下半张脸的铁制面具，原本刻有御法符文，现在只剩下模糊的线条。"
    }
];
// Batch 2: Rarity 1 - Head (Heavy / 重甲)
// IDs: head_010 - head_018
// 风格：古代破烂风 - 勉强成型的厚皮与旧金属
const head_r1_batch2 = [
    // --- [Low Tier / 低数值] (总防: 4 | HP: 22 | 速: -1 | 物攻: 0 | 售价: 333) ---
    {
        id: "head_010",
        name: "裂纹厚皮帽", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 333,
        durability: 35,
        effects: { phy_def: 3, mag_def: 1, speed: -1, hp_max: 22, phy_atk: 0 },

        desc: "【重甲】由多层开裂的厚牛皮缝制，边缘参差不齐，只能勉强起到缓冲作用。"
    },
    {
        id: "head_011",
        name: "粗线补丁盔", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 333,
        durability: 35,
        effects: { phy_def: 2, mag_def: 2, speed: -1, hp_max: 22, phy_atk: 0 },

        desc: "【重甲】到处是粗麻线缝补的痕迹，皮革内衬里塞了一些烂棉花，戴起来很闷。"
    },
    {
        id: "head_012",
        name: "旧皮衬铁扣帽", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 333,
        durability: 35,
        effects: { phy_def: 1, mag_def: 3, speed: -1, hp_max: 22, phy_atk: 0 },

        desc: "【重甲】用旧皮质护具改制的帽子，为了稳固加了几个铁扣。皮质陈旧，竟有一丝隔绝灵力的效果。"
    },

    // --- [Mid Tier / 中数值] (总防: 13 | HP: 30 | 速: -1 | 物攻: 1 | 售价: 855) ---
    {
        id: "head_013",
        name: "生锈重革盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 855,
        durability: 45,
        effects: { phy_def: 9, mag_def: 4, speed: -1, hp_max: 30, phy_atk: 1 },

        desc: "【重甲】厚重的硬皮革上镶嵌了几片生锈的铁皮。虽然卖相不好，但结构还算稳固。"
    },
    {
        id: "head_014",
        name: "铆钉加固皮帽", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 855,
        durability: 45,
        effects: { phy_def: 7, mag_def: 6, speed: -1, hp_max: 30, phy_atk: 1 },

        desc: "【重甲】采用了密集的工业铆钉对皮革进行加固。这种粗犷的手段有效地提升了头盔的抗震能力。"
    },
    {
        id: "head_015",
        name: "褪色硬皮战笠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 855,
        durability: 45,
        effects: { phy_def: 3, mag_def: 10, speed: -1, hp_max: 30, phy_atk: 1 },

        desc: "【重甲】颜色早已褪尽的斗笠状硬皮盔，表面涂了一层不知名的暗色油脂，能滑开部分低阶术法。"
    },

    // --- [High Tier / 高数值] (总防: 23 | HP: 39 | 速: -2 | 物攻: 1 | 售价: 1341) ---
    {
        id: "head_016",
        name: "劣质熟铁皮盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 1341,
        durability: 60,
        effects: { phy_def: 16, mag_def: 7, speed: -2, hp_max: 39, phy_atk: 1 },

        desc: "【重甲】在厚实的牛皮外包裹了一层劣质熟铁。虽然大大增加了重量，但物理防御力在同类中相当出众。"
    },
    {
        id: "head_017",
        name: "校尉弃置皮帽", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 1341,
        durability: 60,
        effects: { phy_def: 12, mag_def: 11, speed: -2, hp_max: 39, phy_atk: 1 },

        desc: "【重甲】曾经是基层军官佩戴的皮盔，因破损被弃置。虽然经过修补，但依然保留了原本精良的防御结构。"
    },
    {
        id: "head_018",
        name: "荒野拾遗重头盔", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 1341,
        durability: 60,
        effects: { phy_def: 6, mag_def: 17, speed: -2, hp_max: 39, phy_atk: 1 },

        desc: "【重甲】从战场废墟中捡回的重型护具，混杂了皮革、骨片与金属。由于长期受灵气侵蚀，产生了一定的御法性。"
    }
];
// Batch 3: Rarity 1 - Head (Light / 轻甲)
// IDs: head_019 - head_027
// 风格：古代破烂风 - 糟朽的皮帽、褪色的头巾
const head_r1_batch3 = [
    // --- [Low Tier / 低数值] (总防: 3 | HP: 20 | 速: 0 | 售价: 315) ---
    {
        id: "head_019",
        name: "糟朽皮质护额", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 25,
        effects: { phy_def: 2, mag_def: 1, speed: 0, hp_max: 20 },

        desc: "【轻甲】用不知名的小兽皮制成的护额，边缘由于糟朽而不断掉屑，勉强能挡点风。"
    },
    {
        id: "head_020",
        name: "褪色猎人帽", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 25,
        effects: { phy_def: 2, mag_def: 1, speed: 0, hp_max: 20 }, // 3点总防分配

        desc: "【轻甲】颜色褪得几乎看不出的旧皮帽，是猎人长期野外生活的遗留物。"
    },
    {
        id: "head_021",
        name: "发霉软皮风帽", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 25,
        effects: { phy_def: 1, mag_def: 2, speed: 0, hp_max: 20 },

        desc: "【轻甲】在地窖深处存放太久导致有些发霉，这种潮湿的质地意外能吸收一些灵气震荡。"
    },

    // --- [Mid Tier / 中数值] (总防: 11 | HP: 28 | 速: 0 | 售价: 747) ---
    {
        id: "head_022",
        name: "粗缝硬革皮帽", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 747,
        durability: 35,
        effects: { phy_def: 8, mag_def: 3, speed: 0, hp_max: 28 },

        desc: "【轻甲】用粗麻线将几块硬皮缝合在一起，虽然针脚粗糙，但护住脑门不成问题。"
    },
    {
        id: "head_023",
        name: "旧哨兵轻皮盔", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 747,
        durability: 35,
        effects: { phy_def: 6, mag_def: 5, speed: 0, hp_max: 28 },

        desc: "【轻甲】原本配发给哨兵的制式皮帽，虽然皮面由于长期日晒而开裂，但底子还在。"
    },
    {
        id: "head_024",
        name: "纹路模糊皮冠", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 747,
        durability: 35,
        effects: { phy_def: 3, mag_def: 8, speed: 0, hp_max: 28 },

        desc: "【轻甲】皮冠表面隐约可见一些刻痕，原本应是某种法术符文，如今只能作为装饰。"
    },

    // --- [High Tier / 高数值] (总防: 18 | HP: 35 | 速: 0 | 售价: 1125) ---
    {
        id: "head_025",
        name: "精选韧皮面具", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1125,
        durability: 45,
        effects: { phy_def: 13, mag_def: 5, speed: 0, hp_max: 35 },

        desc: "【轻甲】采用韧性极佳的熟牛皮制成的面具，能覆盖大部分面部，是底层游侠的常备护具。"
    },
    {
        id: "head_026",
        name: "军伍旧缝护心冠", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1125,
        durability: 45,
        effects: { phy_def: 9, mag_def: 9, speed: 0, hp_max: 35 },

        desc: "【轻甲】军中退役的轻质护发冠，内衬中额外缝了一层厚布，在R1等级中属于比较均衡的防护。"
    },
    {
        id: "head_027",
        name: "蒙尘灵鹿皮帽", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1125,
        durability: 45,
        effects: { phy_def: 5, mag_def: 13, speed: 0, hp_max: 35 },

        desc: "【轻甲】灵鹿皮制成的帽子，虽已布满灰尘且灵性全失，但其材质本身对术法的亲和力仍优于普通皮料。"
    }
];
// Batch 4: Rarity 1 - Head (Leather / 皮甲)
// IDs: head_028 - head_036
// 风格：古代破烂风 - 拼接的碎皮、未经硝制的生皮、干瘪的兽皮帽
const head_r1_batch4 = [
    // --- [Low Tier / 低数值] (总防: 2 | HP: 16 | 速: 0 | 物攻: 1 | 暴击: 1 | 售价: 459) ---
    {
        id: "head_028",
        name: "杂碎皮拼接面具", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 459,
        durability: 30,
        effects: { phy_def: 2, mag_def: 0, speed: 0, hp_max: 16, phy_atk: 1, crit: 1 },

        desc: "【皮甲】用各种动物的碎皮缝成的面具，线头外露且有一股土腥味，勉强遮住脸部。"
    },
    {
        id: "head_029",
        name: "破旧皮质发箍", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 459,
        durability: 30,
        effects: { phy_def: 1, mag_def: 1, speed: 0, hp_max: 16, phy_atk: 1, crit: 1 },

        desc: "【皮甲】原本可能是条皮带，被粗糙地改成了护额。皮质已经干裂，只能提供微乎其微的保护。"
    },
    {
        id: "head_030",
        name: "干瘪鼠皮帽", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 459,
        durability: 30,
        effects: { phy_def: 0, mag_def: 2, speed: 0, hp_max: 16, phy_atk: 1, crit: 1 },

        desc: "【皮甲】由几张干瘪的硕鼠皮拼凑而成，看起来十分猥琐。但也因其异兽属性，对灵力波动有细微抗性。"
    },

    // --- [Mid Tier / 中数值] (总防: 8 | HP: 22 | 速: 1 | 物攻: 2 | 暴击: 1 | 售价: 873) ---
    {
        id: "head_031",
        name: "粗缝熟皮护额", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 873,
        durability: 40,
        effects: { phy_def: 6, mag_def: 2, speed: 1, hp_max: 22, phy_atk: 2, crit: 1 },

        desc: "【皮甲】用粗麻线加固过的熟牛皮护额，虽然样子呆板，但已经可以有效地防御流弹与碎石。"
    },
    {
        id: "head_032",
        name: "缝补野猪皮笠", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 873,
        durability: 40,
        effects: { phy_def: 4, mag_def: 4, speed: 1, hp_max: 22, phy_atk: 2, crit: 1 },

        desc: "【皮甲】野猪皮制成的简易大檐帽，经过多次缝补，质地变得十分硬实，防护面较广。"
    },
    {
        id: "head_033",
        name: "陈旧蛇皮短帽", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 873,
        durability: 40,
        effects: { phy_def: 2, mag_def: 6, speed: 1, hp_max: 22, phy_atk: 2, crit: 1 },

        desc: "【皮甲】这顶蛇皮帽子的鳞片大都已脱落，显出斑驳的灰色。它在导引灵气流转方面比普通皮帽更出色。"
    },

    // --- [High Tier / 高数值] (总防: 14 | HP: 28 | 速: 1 | 物攻: 2 | 暴击: 2 | 售价: 1377) ---
    {
        id: "head_034",
        name: "硬化厚革兜鍪", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1377,
        durability: 50,
        effects: { phy_def: 11, mag_def: 3, speed: 1, hp_max: 28, phy_atk: 2, crit: 2 },

        desc: "【皮甲】虽然没有金属构件，但这款重型硬化皮盔通过多层叠加，提供了极佳的抗劈砍性能。"
    },
    {
        id: "head_035",
        name: "老旧游侠皮兜", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1377,
        durability: 50,
        effects: { phy_def: 7, mag_def: 7, speed: 1, hp_max: 28, phy_atk: 2, crit: 2 },
        desc: "【皮甲】曾在荒野中流浪多年的游侠留下的兜帽，皮质在风雨中磨砺得异常柔韧，平衡感绝佳。"
    },
    {
        id: "head_036",
        name: "残破巫医皮面", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1377,
        durability: 50,
        effects: { phy_def: 3, mag_def: 11, speed: 1, hp_max: 28, phy_atk: 2, crit: 2 },
        desc: "【皮甲】这是一个边缘缺失的祭祀面具，皮面刻满了扭曲的字符。它能干扰周遭的法力分布，提供不俗的魔防。"
    }
];
// Batch 5: Rarity 1 - Head (Cloth / 布甲)
// IDs: head_037 - head_045
// 风格：古代破烂风 - 泛黄的方巾、漏风的道帽、粗麻抹额
const head_r1_batch5 = [
    // --- [Low Tier / 低数值] (总防: 2 | HP: 12 | 速: 1 | 法攻: 1 | 属性: 1 | 售价: 315) ---
    {
        id: "head_037",
        name: "泛黄粗麻方巾", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 15,
        effects: { phy_def: 2, mag_def: 0, speed: 1, hp_max: 12, mag_atk: 1, qi: 1 },
        desc: "【布甲】洗得发黄的麻布方巾，原本是农户用来扎发的，布料粗糙且多有破损。"
    },
    {
        id: "head_038",
        name: "漏风旧道帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 15,
        effects: { phy_def: 1, mag_def: 1, speed: 1, hp_max: 12, mag_atk: 1, shen: 1 },
        desc: "【布甲】不知道哪家破败道观流出来的道帽，顶端已经漏了个大洞，勉强能束住乱发。"
    },
    {
        id: "body_039",
        name: "陈旧灰布抹额", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 15,
        effects: { phy_def: 0, mag_def: 2, speed: 1, hp_max: 12, mag_atk: 1, qi: 1 },
        desc: "【布甲】一条灰扑扑的窄布条，由于长期沾染香火气息，对法术波动有极微弱的感应。"
    },

    // --- [Mid Tier / 中数值] (总防: 5 | HP: 17 | 速: 1 | 法攻: 2 | 属性: 1 | 售价: 558) ---
    {
        id: "head_040",
        name: "浆洗棉质便帽", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 558,
        durability: 20,
        effects: { phy_def: 4, mag_def: 1, speed: 1, hp_max: 17, mag_atk: 2, qi: 1 },
        desc: "【布甲】虽然经过反复浆洗，但棉布纤维已经变得生硬，提供了一些基本的碰撞防护。"
    },
    {
        id: "head_041",
        name: "百结衲衣帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 558,
        durability: 20,
        effects: { phy_def: 2, mag_def: 3, speed: 1, hp_max: 17, mag_atk: 2, shen: 1 },
        desc: "【布甲】东拼西凑缝出来的帽子，线头凌乱，但在头部关键部位做了加厚处理。"
    },
    {
        id: "head_042",
        name: "草药浸染头巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 558,
        durability: 20,
        effects: { phy_def: 1, mag_def: 4, speed: 1, hp_max: 17, mag_atk: 2, qi: 1 },
        desc: "【布甲】散发着苦涩药味的头巾，能让人保持清醒，并有效阻挡一些林间的微弱瘴气。"
    },

    // --- [High Tier / 高数值] (总防: 9 | HP: 21 | 速: 2 | 法攻: 2 | 属性: 2 | 售价: 918) ---
    {
        id: "head_043",
        name: "粗编御风巾", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 918,
        durability: 25,
        effects: { phy_def: 7, mag_def: 2, speed: 2, hp_max: 21, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】为了在疾行时不被风吹乱头发而设计的头巾，编织结构紧密，质感较硬。"
    },
    {
        id: "head_044",
        name: "旧锦缎护法冠", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 918,
        durability: 25,
        effects: { phy_def: 4, mag_def: 5, speed: 2, hp_max: 21, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】落魄家门流出的锦缎冠，虽然布料磨损，但由于使用了双层结构，防护非常稳健。"
    },
    {
        id: "head_045",
        name: "残破灵丝头罩", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 918,
        durability: 25,
        effects: { phy_def: 2, mag_def: 7, speed: 2, hp_max: 21, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】灵丝早已断裂大半的法师帽，虽然失去了原有的法效，但御法底子依然远超凡布。"
    }
];
// Batch 6: Rarity 2 - Head (Plate / 板甲)
// IDs: head_046 - head_054
// 风格：勉强可用，有点老旧 - 退役的旧军盔、翻新的工坊货
const head_r2_batch1 = [
    // --- [Low Tier / 低数值] (总防: 9 | HP: 48 | 速: -2 | 物攻: 1 | 售价: 1611) ---
    {
        id: "head_046",
        name: "旧式黑铁面甲", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1611,
        durability: 50,
        effects: { phy_def: 6, mag_def: 3, speed: -2, hp_max: 48, phy_atk: 1 },
        desc: "【板甲】款式老旧的黑铁面甲，虽然外层有些磕碰痕迹，但整体锻造工艺依然能护住面部。"
    },
    {
        id: "head_047",
        name: "翻新卫戍兜鍪", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1611,
        durability: 50,
        effects: { phy_def: 5, mag_def: 4, speed: -2, hp_max: 48, phy_atk: 1 },
        desc: "【板甲】从军需库清出来的翻新货，重新更换了连接处的皮带，虽然有些笨重，但很稳固。"
    },
    {
        id: "head_048",
        name: "过时青石衬盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1611,
        durability: 50,
        effects: { phy_def: 2, mag_def: 7, speed: -2, hp_max: 48, phy_atk: 1 },
        desc: "【板甲】在内里镶嵌了特殊的青石薄片，由于工艺已经过时，对灵气的引导效果较为生硬。"
    },

    // --- [Mid Tier / 中数值] (总防: 24 | HP: 66 | 速: -3 | 物攻: 2 | 售价: 3258) ---
    {
        id: "head_049",
        name: "熟铁叠片盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 3258,
        durability: 65,
        effects: { phy_def: 18, mag_def: 6, speed: -3, hp_max: 66, phy_atk: 2 },
        desc: "【板甲】采用熟铁片层叠制成的头盔，虽然由于老化导致转动不灵，但防护面积覆盖到了颈部。"
    },
    {
        id: "head_050",
        name: "粗工钢制面罩", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 3258,
        durability: 65,
        effects: { phy_def: 12, mag_def: 12, speed: -3, hp_max: 66, phy_atk: 2 },
        desc: "【板甲】小作坊出品的钢面罩，由于钢质不纯，呈现出一种暗沉的色泽，防御力尚可。"
    },
    {
        id: "head_051",
        name: "受潮刻符板盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 3258,
        durability: 65,
        effects: { phy_def: 6, mag_def: 18, speed: -3, hp_max: 66, phy_atk: 2 },
        desc: "【板甲】长期存放在潮湿地库的符文盔，铁锈侵蚀了部分纹路，但残存的御法之力依然有效。"
    },

    // --- [High Tier / 高数值] (总防: 39 | HP: 84 | 速: -4 | 物攻: 2 | 售价: 4860) ---
    {
        id: "head_052",
        name: "重铸步卒钢盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 4860,
        durability: 80,
        effects: { phy_def: 29, mag_def: 10, speed: -4, hp_max: 84, phy_atk: 2 },
        desc: "【板甲】将多件破损钢盔熔炼重铸的产物，省去了所有花哨的装饰，只为了极致的物理硬度。"
    },
    {
        id: "head_053",
        name: "无名校尉残盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 4860,
        durability: 80,
        effects: { phy_def: 20, mag_def: 19, speed: -4, hp_max: 84, phy_atk: 2 },
        desc: "【板甲】剥落了铭牌的校尉级甲胄头部，虽然表面暗淡，但使用了较好的铁胚，防护全面。"
    },
    {
        id: "head_054",
        name: "废弃镶金护面", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 4860,
        durability: 80,
        effects: { phy_def: 10, mag_def: 29, speed: -4, hp_max: 84, phy_atk: 2 },
        desc: "【板甲】曾经镶嵌过金箔的护面，金饰已被剥去，但残留的金属孔道仍能偏转部分法力余波。"
    }
];
// Batch 7: Rarity 2 - Head (Heavy / 重甲)
// IDs: head_055 - head_063
// 风格：勉强可用，有点老旧 - 磨损的皮革、受潮的内衬、退役的步兵护具
const head_r2_batch2 = [
    // --- [Low Tier / 低数值] (总防: 8 | HP: 44 | 速: -1 | 物攻: 1 | 售价: 1512) ---
    {
        id: "head_055",
        name: "旧铁掌重革帽", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1512,
        durability: 45,
        effects: { phy_def: 6, mag_def: 2, speed: -1, hp_max: 44, phy_atk: 1 },
        desc: "【重甲】在厚实的旧皮革上加装了铁质护掌片，虽然款式过时且有些压身，但防御相当稳健。"
    },
    {
        id: "head_056",
        name: "磨损步兵重皮盔", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1512,
        durability: 45,
        effects: { phy_def: 4, mag_def: 4, speed: -1, hp_max: 44, phy_atk: 1 },
        desc: "【重甲】正规军步兵营淘汰下来的二手工装头盔，皮革由于保养不当而发硬，但金属卡扣依然牢固。"
    },
    {
        id: "head_057",
        name: "污浊青铜护面帽", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1512,
        durability: 45,
        effects: { phy_def: 2, mag_def: 6, speed: -1, hp_max: 44, phy_atk: 1 },
        desc: "【重甲】表面覆盖着一层灰绿色的铜锈，这是一件勉强还能使用的古旧青铜护具，对灵力流动有阻滞感。"
    },

    // --- [Mid Tier / 中数值] (总防: 20 | HP: 61 | 速: -2 | 物攻: 1 | 售价: 2808) ---
    {
        id: "head_058",
        name: "翻新镶钉重皮帽", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 2808,
        durability: 55,
        effects: { phy_def: 15, mag_def: 5, speed: -2, hp_max: 61, phy_atk: 1 },
        desc: "【重甲】经过工坊简单翻新的重型皮帽，松动的钢钉已被重新铆接，整体透着一股粗犷的金属味。"
    },
    {
        id: "head_059",
        name: "老式行伍皮甲面", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 2808,
        durability: 55,
        effects: { phy_def: 10, mag_def: 10, speed: -2, hp_max: 61, phy_atk: 1 },
        desc: "【重甲】老军士退役时带回的皮面具，由于多次修补显得厚薄不一，但在实战中表现非常均衡。"
    },
    {
        id: "head_060",
        name: "蒙尘辟邪重皮帽", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 2808,
        durability: 55,
        effects: { phy_def: 5, mag_def: 15, speed: -2, hp_max: 61, phy_atk: 1 },
        desc: "【重甲】在皮革内里缝入了辟邪药渣的皮帽，虽然已经存放了很久且落满灰尘，法术防御力依然卓越。"
    },

    // --- [High Tier / 高数值] (总防: 33 | HP: 77 | 速: -2 | 物攻: 2 | 售价: 4356) ---
    {
        id: "head_061",
        name: "缺口精铁重皮盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 4356,
        durability: 70,
        effects: { phy_def: 25, mag_def: 8, speed: -2, hp_max: 77, phy_atk: 2 },
        desc: "【重甲】曾是精铁打造的上好护头，由于侧面缺口被用粗皮补上，虽显得笨重，但防护效果极佳。"
    },
    {
        id: "head_062",
        name: "二手伍长重战笠", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 4356,
        durability: 70,
        effects: { phy_def: 17, mag_def: 16, speed: -2, hp_max: 77, phy_atk: 2 },
        desc: "【重甲】战场收缴回来的二手伍长笠，边缘伤痕累累，但每一道伤疤都证明了这件装备的可靠。"
    },
    {
        id: "head_063",
        name: "暗淡灵纹重护额", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 4356,
        durability: 70,
        effects: { phy_def: 8, mag_def: 25, speed: -2, hp_max: 77, phy_atk: 2 },
        desc: "【重甲】护额上的灵纹已经由于年久而变得暗淡，但重型材质本身对法术冲击的吸收力依然很强。"
    }
];
// Batch 8: Rarity 2 - Head (Light / 轻甲)
// IDs: head_064 - head_072
// 风格：勉强可用，有点老旧 - 褪色的皮革、有汗渍的内衬、翻新的探子帽
const head_r2_batch3 = [
    // --- [Low Tier / 低数值] (总防: 6 | HP: 40 | 速: 0 | 售价: 1260) ---
    {
        id: "head_064",
        name: "褪色熟皮护额", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 40,
        effects: { phy_def: 5, mag_def: 1, speed: 0, hp_max: 40 },
        desc: "【轻甲】经过多次浆洗而颜色黯淡的熟皮护额。虽然皮质有些缩水，但护住额头绰绰有余。"
    },
    {
        id: "head_065",
        name: "磨损巡哨短帽", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 40,
        effects: { phy_def: 3, mag_def: 3, speed: 0, hp_max: 40 },
        desc: "【轻甲】原本是斥候营的配发服饰，由于长期在林间穿行，布面和皮扣都有明显的磨损痕迹。"
    },
    {
        id: "head_066",
        name: "暗淡异兽皮巾", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 40,
        effects: { phy_def: 1, mag_def: 5, speed: 0, hp_max: 40 },
        desc: "【轻甲】这种小兽皮曾因灵力而光鲜，如今已变得灰扑扑的。好在基本的法术阻隔能力还在。"
    },

    // --- [Mid Tier / 中数值] (总防: 16 | HP: 55 | 速: 0 | 售价: 2430) ---
    {
        id: "head_067",
        name: "老旧硬革面具", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 2430,
        durability: 50,
        effects: { phy_def: 12, mag_def: 4, speed: 0, hp_max: 55 },
        desc: "【轻甲】采用硬皮层叠而成的面具，虽然边缘有些皲裂，但扎实的厚度能抵挡利刃的划刺。"
    },
    {
        id: "head_068",
        name: "二手走马皮帽", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 2430,
        durability: 50,
        effects: { phy_def: 8, mag_def: 8, speed: 0, hp_max: 55 },
        desc: "【轻甲】这种走马皮帽由于耐穿，在旧货摊上很受欢迎。虽然皮面斑驳，但依然紧凑可靠。"
    },
    {
        id: "head_069",
        name: "陈旧刻纹皮冠", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 2430,
        durability: 50,
        effects: { phy_def: 4, mag_def: 12, speed: 0, hp_max: 55 },
        desc: "【轻甲】皮冠表面刻着的法阵纹路由于缺乏保养而模糊不清，即便如此，它在阻断法力上依然有效。"
    },

    // --- [High Tier / 高数值] (总防: 26 | HP: 70 | 速: 0 | 售价: 3600) ---
    {
        id: "head_070",
        name: "沉水老牛皮兜", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 3600,
        durability: 60,
        effects: { phy_def: 20, mag_def: 6, speed: 0, hp_max: 70 },
        desc: "【轻甲】用陈年老牛皮在水中反复浸润阴干而成的皮兜，质感厚重且富有韧性，防御力相当可观。"
    },
    {
        id: "head_071",
        name: "翻新游侠面甲", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 3600,
        durability: 60,
        effects: { phy_def: 13, mag_def: 13, speed: 0, hp_max: 70 },
        desc: "【轻甲】老练游侠穿过的旧甲，经过简单的加固和上油。虽然满是划痕，但保护性能非常全面。"
    },
    {
        id: "head_072",
        name: "蒙尘灵纹皮冠", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 3600,
        durability: 60,
        effects: { phy_def: 6, mag_def: 20, speed: 0, hp_max: 70 },
        desc: "【轻甲】蒙尘已久的灵皮冠。虽然原有的光泽已不再，但针对五行术法的吸纳效果依然属于上品。"
    }
];
// Batch 9: Rarity 2 - Head (Leather / 皮甲)
// IDs: head_073 - head_081
// 风格：勉强可用，有点老旧 - 褪色的狼皮、开裂的鹿皮、二手的猎人装备
const head_r2_batch4 = [
    // --- [Low Tier / 低数值] (总防: 5 | HP: 32 | 速: 1 | 物攻: 2 | 暴击: 2 | 售价: 2016) ---
    {
        id: "head_073",
        name: "褪色狼皮护额", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 2016,
        durability: 35,
        effects: { phy_def: 4, mag_def: 1, speed: 1, hp_max: 32, phy_atk: 2, crit: 2 },
        desc: "【皮甲】原本深青色的狼皮已经褪成了土灰色，皮质有些发硬，好在还能勉强护住额角。"
    },
    {
        id: "head_074",
        name: "开裂鹿皮便帽", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 2016,
        durability: 35,
        effects: { phy_def: 3, mag_def: 2, speed: 1, hp_max: 32, phy_atk: 2, crit: 2 },
        desc: "【皮甲】轻便的鹿皮短帽，侧面由于干燥出现了不少细小的皲裂纹，穿着时需得小心避水。"
    },
    {
        id: "head_075",
        name: "二手蛇皮面具", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 2016,
        durability: 35,
        effects: { phy_def: 1, mag_def: 4, speed: 1, hp_max: 32, phy_atk: 2, crit: 2 },
        desc: "【皮甲】前任主人留下的蛇皮护面，鳞片由于磨损不再光滑，但其特有的韧性仍能化解部分灵力冲击。"
    },

    // --- [Mid Tier / 中数值] (总防: 12 | HP: 44 | 速: 1 | 物攻: 3 | 暴击: 3 | 售价: 3312) ---
    {
        id: "head_076",
        name: "翻新硬革面罩", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3312,
        durability: 45,
        effects: { phy_def: 9, mag_def: 3, speed: 1, hp_max: 44, phy_atk: 3, crit: 3 },
        desc: "【皮甲】经过工坊简单翻新的硬革护面，加厚了连接处的缝线，虽然样式笨拙，但实战防御力不错。"
    },
    {
        id: "head_077",
        name: "浆洗走山皮帽", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3312,
        durability: 45,
        effects: { phy_def: 6, mag_def: 6, speed: 1, hp_max: 44, phy_atk: 3, crit: 3 },
        desc: "【皮甲】多次浆洗使得这件皮帽略显薄脆，但在山地穿行中依然能提供稳定的灵敏度与基本的防护。"
    },
    {
        id: "head_078",
        name: "陈旧野猪皮笠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3312,
        durability: 45,
        effects: { phy_def: 3, mag_def: 9, speed: 1, hp_max: 44, phy_atk: 3, crit: 3 },
        desc: "【皮甲】这种老野猪皮笠因皮质厚实且带有微量兽魂气息，常被用来制作对抗低阶法术的简易防具。"
    },

    // --- [High Tier / 高数值] (总防: 20 | HP: 56 | 速: 1 | 物攻: 4 | 暴击: 4 | 售价: 4698) ---
    {
        id: "head_079",
        name: "剥蚀青牛皮盔", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 4698,
        durability: 60,
        effects: { phy_def: 15, mag_def: 5, speed: 1, hp_max: 56, phy_atk: 4, crit: 4 },
        desc: "【皮甲】用坚韧的青牛皮制成，表面因长期摩擦而变得斑驳不平，但其防劈砍的本色依然属于皮甲中的上品。"
    },
    {
        id: "head_080",
        name: "资深巡林客旧帽", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 4698,
        durability: 60,
        effects: { phy_def: 10, mag_def: 10, speed: 1, hp_max: 56, phy_atk: 4, crit: 4 },
        desc: "【皮甲】老练的巡林客变卖的旧帽子，虽然额头处有修补痕迹，但每一寸皮革都经过了实战的检验。"
    },
    {
        id: "head_081",
        name: "斑驳幻兽皮冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 4698,
        durability: 60,
        effects: { phy_def: 5, mag_def: 15, speed: 1, hp_max: 56, phy_atk: 4, crit: 4 },
        desc: "【皮甲】因年代久远，幻兽皮的光泽已不再流转。即便如此，它对元素法力的亲和性依然极佳。"
    }
];
// Batch 10: Rarity 2 - Head (Cloth / 布甲)
// IDs: head_082 - head_090
// 风格：勉强可用，有点老旧 - 泛黄的物料、补丁明显的帽饰、二手的修行法帽
const head_r2_batch5 = [
    // --- [Low Tier / 低数值] (总防: 3 | HP: 24 | 速: 1 | 法攻: 2 | 属性: 2 | 售价: 1332) ---
    {
        id: "head_082",
        name: "泛黄粗麻头巾", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 1332,
        durability: 25,
        effects: { phy_def: 2, mag_def: 1, speed: 1, hp_max: 24, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】虽然布料由于受潮而泛黄，但由于是加厚编制，依然能抵挡一些轻微的刮蹭。"
    },
    {
        id: "head_083",
        name: "陈旧纳底布帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 1332,
        durability: 25,
        effects: { phy_def: 1, mag_def: 2, speed: 1, hp_max: 24, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】鞋底纳底工艺应用到了布帽上，虽然佩戴有些生硬，但在防御法术和物理撞击上相当平衡。"
    },
    {
        id: "head_084",
        name: "浆洗旧式法冠", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 1332,
        durability: 25,
        effects: { phy_def: 1, mag_def: 2, speed: 1, hp_max: 24, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】洗得有些发白的法冠，虽然其上原本的阵法已经磨损严重，但对灵力的亲和度依然尚可。"
    },

    // --- [Mid Tier / 中数值] (总防: 8 | HP: 33 | 速: 1 | 法攻: 3 | 属性: 3 | 售价: 2214) ---
    {
        id: "head_085",
        name: "补丁驿卒快帽", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 2214,
        durability: 35,
        effects: { phy_def: 6, mag_def: 2, speed: 1, hp_max: 33, mag_atk: 3, qi: 1, shen: 2 },
        desc: "【布甲】官家驿卒淘汰的快帽，在额头和耳侧加了皮革补丁，在保证移动速度的同时加强了抗性。"
    },
    {
        id: "head_086",
        name: "二手云纹短巾", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 2214,
        durability: 35,
        effects: { phy_def: 4, mag_def: 4, speed: 1, hp_max: 33, mag_atk: 3, qi: 2, shen: 1 },
        desc: "【布甲】从旧衣铺买来的云纹短巾，绸面虽然有些抽丝，但内衬依然完好，适合常年在外的人士。"
    },
    {
        id: "head_087",
        name: "褪色祭祀布帽", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 2214,
        durability: 35,
        effects: { phy_def: 2, mag_def: 6, speed: 1, hp_max: 33, mag_atk: 3, qi: 1, shen: 2 },
        desc: "【布甲】曾经在某些小型祭祀中使用的布帽，由于色彩褪去而显得陈旧，但表面附着的灵力残余依旧有效。"
    },

    // --- [High Tier / 高数值] (总防: 13 | HP: 42 | 速: 2 | 法攻: 4 | 属性: 4 | 售价: 3186) ---
    {
        id: "head_088",
        name: "老旧精纳战巾", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3186,
        durability: 45,
        effects: { phy_def: 10, mag_def: 3, speed: 2, hp_max: 42, mag_atk: 4, qi: 2, shen: 2 },
        desc: "【布甲】虽已是旧物，但针脚极其细密，是布质头饰中难得的精品，能提供稳健的防护。"
    },
    {
        id: "head_089",
        name: "翻新道家法帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3186,
        durability: 45,
        effects: { phy_def: 6, mag_def: 7, speed: 2, hp_max: 42, mag_atk: 4, qi: 2, shen: 2 },
        desc: "【布甲】道观中传出的旧法帽，经过简单的修缮翻新，保留了清净神效，是法系修行者的实惠之选。"
    },
    {
        id: "head_090",
        name: "灰扑扑灵纹巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3186,
        durability: 45,
        effects: { phy_def: 3, mag_def: 10, speed: 2, hp_max: 42, mag_atk: 4, qi: 2, shen: 2 },
        desc: "【布甲】因存放不当而落满灰尘的灵纹巾。即便不再鲜亮，但其内部编织的灵丝结构依然能化解法术波动。"
    }
];

// Batch 11: Rarity 3 - Head (Plate / 板甲)
// IDs: head_091 - head_099
// 风格：正规军制式、整洁耐用 - 兵工厂锻造、标准步卒配备
const head_r3_batch1 = [
    // --- [Low Tier / 低数值] (总防: 17 | HP: 72 | 速: -3 | 物攻: 2 | 售价: 4509) ---
    {
        id: "head_091",
        name: "军用制式铁盔", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4509,
        durability: 80,
        effects: { phy_def: 12, mag_def: 5, speed: -3, hp_max: 72, phy_atk: 2 },
        req: { jing: 12 },
        desc: "【板甲】由兵部监制的标准步卒铁盔，采用生铁整体冲压，虽然沉重，但结构稳固，是前线士兵的标配。"
    },
    {
        id: "head_092",
        name: "精选步卒兜鍪", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4509,
        durability: 80,
        effects: { phy_def: 9, mag_def: 8, speed: -3, hp_max: 72, phy_atk: 2 },
        req: { jing: 12 },
        desc: "【板甲】配发给资深士卒的防御头盔，金属表面经过打磨，能有效弹开斜向而来的箭矢。"
    },
    {
        id: "head_093",
        name: "行阵护面铁帽", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4509,
        durability: 80,
        effects: { phy_def: 5, mag_def: 12, speed: -3, hp_max: 72, phy_atk: 2 },
        req: { jing: 12 },
        desc: "【板甲】针对攻城阵列设计的护面铁帽，内衬中加入了少许阻魔细沙，防御法术余波效果不俗。"
    },

    // --- [Mid Tier / 中数值] (总防: 34 | HP: 99 | 速: -4 | 物攻: 3 | 售价: 6993) ---
    {
        id: "head_094",
        name: "加厚锻铁护面", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 6993,
        durability: 100,
        effects: { phy_def: 24, mag_def: 10, speed: -4, hp_max: 99, phy_atk: 3 },
        req: { jing: 18 },
        desc: "【板甲】在面部和天灵处额外增加了锻铁厚度，极大地提升了面对重型打击时的生还率。"
    },
    {
        id: "head_095",
        name: "武馆护身板冠", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 6993,
        durability: 100,
        effects: { phy_def: 17, mag_def: 17, speed: -4, hp_max: 99, phy_atk: 3 },
        req: { jing: 18 },
        desc: "【板甲】名门武馆为核心弟子定做的金属头冠，用料讲究，在抵御同门劲力切磋时表现卓越。"
    },
    {
        id: "head_096",
        name: "叠片阻法铁盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 6993,
        durability: 100,
        effects: { phy_def: 9, mag_def: 25, speed: -4, hp_max: 99, phy_atk: 3 },
        req: { jing: 18 },
        desc: "【板甲】采用多层异种金属片交叠打造的铁盔，能有效传导并分散法术造成的震荡力。"
    },

    // --- [High Tier / 高数值] (总防: 51 | HP: 126 | 速: -5 | 物攻: 4 | 售价: 9153) ---
    {
        id: "head_097",
        name: "精炼重装兜鍪", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 9153,
        durability: 120,
        effects: { phy_def: 36, mag_def: 15, speed: -5, hp_max: 126, phy_atk: 4 },
        req: { jing: 24 },
        desc: "【板甲】重装步兵团的高阶配备，全身覆盖厚重的精炼钢，是战场上名副其实的移动铁壁。"
    },
    {
        id: "head_098",
        name: "坚韧巡营板盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 9153,
        durability: 120,
        effects: { phy_def: 26, mag_def: 25, speed: -5, hp_max: 126, phy_atk: 4 },
        req: { jing: 24 },
        desc: "【板甲】为了应对漫长的边界巡守，该盔做了特殊的重心处理，在保证防御的同时减轻了颈部负担。"
    },
    {
        id: "head_099",
        name: "护阵精铁面罩", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 9153,
        durability: 120,
        effects: { phy_def: 15, mag_def: 36, speed: -5, hp_max: 126, phy_atk: 4 },
        req: { jing: 24 },
        desc: "【板甲】在厚重的铁甲层中加入了绝缘材料，是守卫法术设施的士卒标准配备，抗魔性极佳。"
    }
];
// Batch 12: Rarity 3 - Head (Heavy / 重甲)
// IDs: head_100 - head_108
// 风格：正规军制式、整洁耐用 - 步兵营精锐装备、防锈清漆、结构严密
const head_r3_batch2 = [
    // --- [Low Tier / 低数值] (总防: 14 | HP: 66 | 速: -2 | 物攻: 1 | 售价: 3807) ---
    {
        id: "head_100",
        name: "伍卒镶钉皮盔", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 3807,
        durability: 75,
        effects: { phy_def: 11, mag_def: 3, speed: -2, hp_max: 66, phy_atk: 1 },
        req: { jing: 10 },
        desc: "【重甲】步兵营常用的战斗皮盔，在额头和耳侧镶嵌了密集的圆头钢钉，防磨且耐冲击。"
    },
    {
        id: "head_101",
        name: "制式熟皮重帽", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 3807,
        durability: 75,
        effects: { phy_def: 7, mag_def: 7, speed: -2, hp_max: 66, phy_atk: 1 },
        req: { jing: 10 },
        desc: "【重甲】由多层优质熟牛皮叠压而成的军用重帽，内衬中夹有薄铁片，是军中可靠的防御配备。"
    },
    {
        id: "head_102",
        name: "御火浸药重笠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 3807,
        durability: 75,
        effects: { phy_def: 3, mag_def: 11, speed: -2, hp_max: 66, phy_atk: 1 },
        req: { jing: 10 },
        desc: "【重甲】针对战场流火设计的重型皮笠，皮革经过药剂硝制，对灼烧类法术有显著的防护效果。"
    },

    // --- [Mid Tier / 中数值] (总防: 28 | HP: 91 | 速: -2 | 物攻: 2 | 售价: 6507) ---
    {
        id: "head_103",
        name: "精铁鳞纹兜鍪", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 6507,
        durability: 90,
        effects: { phy_def: 21, mag_def: 7, speed: -2, hp_max: 91, phy_atk: 2 },
        req: { jing: 15 },
        desc: "【重甲】在天灵盖部位额外加厚了精铁鳞片，能有效防御战场上致命的流矢和重型钝器敲击。"
    },
    {
        id: "head_104",
        name: "阵列熟铁面甲", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 6507,
        durability: 90,
        effects: { phy_def: 14, mag_def: 14, speed: -2, hp_max: 91, phy_atk: 2 },
        req: { jing: 15 },
        desc: "【重甲】仿照鱼鳞结构打造的重型面甲，兼顾了基本的视野角度与强悍的正面防御力。"
    },
    {
        id: "head_105",
        name: "隔法重革护面", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 6507,
        durability: 90,
        effects: { phy_def: 7, mag_def: 21, speed: -2, hp_max: 91, phy_atk: 2 },
        req: { jing: 15 },
        desc: "【重甲】阵列作战时配发的重型防御头饰，由于采用了吸法皮革，能大幅降低法术震荡的余波伤害。"
    },

    // --- [High Tier / 高数值] (总防: 43 | HP: 116 | 速: -3 | 物攻: 2 | 售价: 9207) ---
    {
        id: "head_106",
        name: "精炼伍长钢盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 9207,
        durability: 110,
        effects: { phy_def: 32, mag_def: 11, speed: -3, hp_max: 116, phy_atk: 2 },
        req: { jing: 20 },
        desc: "【重甲】配发给基层军官的厚重护头，整体由精铁打制，不仅防护面积广，且质地极为坚韧。"
    },
    {
        id: "head_107",
        name: "战阵耐磨重皮冠", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 9207,
        durability: 110,
        effects: { phy_def: 22, mag_def: 21, speed: -3, hp_max: 116, phy_atk: 2 },
        req: { jing: 20 },
        desc: "【重甲】专为持久战设计的耐磨重冠，多处连接位使用了钢丝缝合，极其耐用且不易松脱。"
    },
    {
        id: "head_108",
        name: "精练御魔铁面", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 9207,
        durability: 110,
        effects: { phy_def: 11, mag_def: 32, speed: -3, hp_max: 116, phy_atk: 2 },
        req: { jing: 20 },
        desc: "【重甲】经过精炼除渣处理的重型面具，对元素的排斥性极强，是应对术法流攻击的可靠屏障。"
    }
];
// Batch 13: Rarity 3 - Head (Light / 轻甲)
// IDs: head_109 - head_117
// 风格：正规军制式、整洁耐用 - 斥候营标准件、游侠大众款、品质均衡
const head_r3_batch3 = [
    // --- [Low Tier / 低数值] (总防: 11 | HP: 60 | 速: 0 | 售价: 3105) ---
    {
        id: "head_109",
        name: "制式熟皮面具", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 3105,
        durability: 60,
        effects: { phy_def: 8, mag_def: 3, speed: 0, hp_max: 60 },
        req: { shen: 10 },
        desc: "【轻甲】兵工坊大批量生产的熟皮面具，皮质坚韧且厚度均匀，是普通轻步兵的标准配备。"
    },
    {
        id: "head_110",
        name: "军用巡哨皮帽", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 3105,
        durability: 60,
        effects: { phy_def: 6, mag_def: 5, speed: 0, hp_max: 60 },
        req: { shen: 10 },
        desc: "【轻甲】专为营地巡哨设计的轻便护头，贴合感良好，能够适应长时间的执勤任务。"
    },
    {
        id: "head_111",
        name: "执勤防水皮笠", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 3105,
        durability: 60,
        effects: { phy_def: 3, mag_def: 8, speed: 0, hp_max: 60 },
        req: { shen: 10 },
        desc: "【轻甲】皮革经过桐油反复浸泡，不仅能防雨水，内衬中还缝入了少量草药层以隔绝法术干扰。"
    },

    // --- [Mid Tier / 中数值] (总防: 23 | HP: 83 | 速: 0 | 售价: 5346) ---
    {
        id: "head_112",
        name: "精缝野猪皮兜", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 5346,
        durability: 80,
        effects: { phy_def: 17, mag_def: 6, speed: 0, hp_max: 83 },
        req: { shen: 15 },
        desc: "【轻甲】采用厚实的野猪脊皮精工缝制，比普通皮帽更抗劈砍，是资深轻骑兵的常见选择。"
    },
    {
        id: "head_113",
        name: "资深斥候面甲", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 5346,
        durability: 80,
        effects: { phy_def: 12, mag_def: 11, speed: 0, hp_max: 83 },
        req: { shen: 15 },
        desc: "【轻甲】配发给资深斥候的进阶装备，在追求视野宽广的同时，也通过多层皮革加强了对太阳穴的防护。"
    },
    {
        id: "head_114",
        name: "浸药防腐皮冠", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 5346,
        durability: 80,
        effects: { phy_def: 6, mag_def: 17, speed: 0, hp_max: 83 },
        req: { shen: 15 },
        desc: "【轻甲】制作过程中加入了抗魔药粉，皮革呈现深褐色，能有效吸收战阵中大范围的法术波震。"
    },

    // --- [High Tier / 高数值] (总防: 34 | HP: 105 | 速: 0 | 售价: 7425) ---
    {
        id: "head_115",
        name: "营伍校阅皮盔", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 7425,
        durability: 100,
        effects: { phy_def: 26, mag_def: 8, speed: 0, hp_max: 105 },
        req: { shen: 20 },
        desc: "【轻甲】大营校阅时配发给优秀军士的头盔，用料上乘，皮质纹理清晰且极其坚韧。"
    },
    {
        id: "head_116",
        name: "精锐快步兵面罩", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 7425,
        durability: 100,
        effects: { phy_def: 17, mag_def: 17, speed: 0, hp_max: 105 },
        req: { shen: 20 },
        desc: "【轻甲】专供精锐快步兵使用的皮面罩，剪裁极其合身，是军工品质下的优良产物，防护全面。"
    },
    {
        id: "head_117",
        name: "护阵灵皮头带", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 7425,
        durability: 100,
        effects: { phy_def: 8, mag_def: 26, speed: 0, hp_max: 105 },
        req: { shen: 20 },
        desc: "【轻甲】选用了带有微弱灵气的兽皮制成，不仅佩戴舒适，更能帮助士兵在法阵加持下保持灵台清明。"
    }
];
// Batch 14: Rarity 3 - Head (Leather / 皮甲)
// IDs: head_118 - head_126
// 风格：正规军制式、整洁耐用 - 精锐斥候护具、伍长皮盔、优质揉制皮革
const head_r3_batch4 = [
    // --- [Low Tier / 低数值] (总防: 8 | HP: 48 | 速: 1 | 物攻: 3 | 暴击: 3 | 售价: 4536) ---
    {
        id: "head_118",
        name: "精选狼皮面具", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 4536,
        durability: 65,
        effects: { phy_def: 6, mag_def: 2, speed: 1, hp_max: 48, phy_atk: 3, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】采用成年的精选狼皮制成，面具贴合度极高，并在双颊处做了加固，是精锐轻步兵的标志。"
    },
    {
        id: "head_119",
        name: "军用熟皮护额", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 4536,
        durability: 65,
        effects: { phy_def: 4, mag_def: 4, speed: 1, hp_max: 48, phy_atk: 3, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】标准的军用制式硬皮护额。皮革经过多次捶打，质地紧密，能有效平衡物理与法术的轻微冲击。"
    },
    {
        id: "head_120",
        name: "巡哨软革风帽", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 4536,
        durability: 65,
        effects: { phy_def: 2, mag_def: 6, speed: 1, hp_max: 48, phy_atk: 3, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】由柔软的熟革缝制，佩戴灵便且能覆盖颈部。皮革内层涂有抗魔油脂，适合在复杂灵力环境下执勤。"
    },

    // --- [Mid Tier / 中数值] (总防: 16 | HP: 65 | 速: 1 | 物攻: 4 | 暴击: 4 | 售价: 6750) ---
    {
        id: "head_121",
        name: "加固犀皮皮盔", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 6750,
        durability: 85,
        effects: { phy_def: 12, mag_def: 4, speed: 1, hp_max: 65, phy_atk: 4, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】采用厚实的犀牛皮精制，并在额头处增加了硬皮护板，能正面抵御大多数常规箭矢的直射。"
    },
    {
        id: "head_122",
        name: "营伍精缝面罩", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 6750,
        durability: 85,
        effects: { phy_def: 8, mag_def: 8, speed: 1, hp_max: 65, phy_atk: 4, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】配发给资深伍长的精缝面罩。其特殊的透气孔设计不影响视野，且防御性能非常均衡。"
    },
    {
        id: "head_123",
        name: "浸药御魔皮冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 6750,
        durability: 85,
        effects: { phy_def: 4, mag_def: 12, speed: 1, hp_max: 65, phy_atk: 4, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】皮革中混入了抗魔药草的纤维，触感微凉，对战场上的大规模法术轰炸有显著的削弱效果。"
    },

    // --- [High Tier / 高数值] (总防: 25 | HP: 84 | 速: 1 | 物攻: 6 | 暴击: 6 | 售价: 9828) ---
    {
        id: "head_124",
        name: "先锋铁扣皮盔", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 9828,
        durability: 110,
        effects: { phy_def: 18, mag_def: 7, speed: 1, hp_max: 84, phy_atk: 6, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】采用重型犀皮并辅以精钢卡扣连接。在不影响头颈灵活性的前提下，提供了极强的抗击打能力。"
    },
    {
        id: "head_125",
        name: "精锐突击面具", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 9828,
        durability: 110,
        effects: { phy_def: 13, mag_def: 12, speed: 1, hp_max: 84, phy_atk: 6, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】专供突击队使用的皮面具，剪裁严丝合缝，每一处缝线都经过加固，是皮制头饰中的上等良品。"
    },
    {
        id: "head_126",
        name: "军吏扣带战笠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 9828,
        durability: 110,
        effects: { phy_def: 7, mag_def: 18, speed: 1, hp_max: 84, phy_atk: 6, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】基层军吏常用的扣带式皮笠，不仅能有效遮挡视线干扰，且皮革夹层中加入了阻法内衬。"
    }
];
// Batch 15: Rarity 3 - Head (Cloth / 布甲)
// IDs: head_127 - head_135
// 风格：正规军制式、整洁耐用 - 随军文书帽、门派外门法冠、官家快行头巾
const head_r3_batch5 = [
    // --- [Low Tier / 低数值] (总防: 6 | HP: 36 | 速: 2 | 法攻: 3 | 属性: 3 | 售价: 3267) ---
    {
        id: "head_127",
        name: "制式青麻法巾", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 3267,
        durability: 45,
        effects: { phy_def: 4, mag_def: 2, speed: 2, hp_max: 36, mag_atk: 3, qi: 1, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】军中随军文书配发的青麻长巾，面料经过防蛀处理，佩戴时清爽利落，有助于凝神施法。"
    },
    {
        id: "head_128",
        name: "营伍棉纺便帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 3267,
        durability: 45,
        effects: { phy_def: 3, mag_def: 3, speed: 2, hp_max: 36, mag_atk: 3, qi: 2, shen: 1 },
        req: { shen: 10 },
        desc: "【布甲】标准的营伍棉纺服饰，不仅佩戴舒适，且内衬加了一层薄绒以缓冲头部受到的冲击。"
    },
    {
        id: "head_129",
        name: "执勤净水发带", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 3267,
        durability: 45,
        effects: { phy_def: 1, mag_def: 5, speed: 2, hp_max: 36, mag_atk: 3, qi: 1, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】基层法阵看守人员穿戴的简易发带，布料带有微弱的斥水性，能阻挡轻微的灵力侵蚀。"
    },

    // --- [Mid Tier / 中数值] (总防: 11 | HP: 49 | 速: 2 | 法攻: 5 | 属性: 4 | 售价: 4833) ---
    {
        id: "head_130",
        name: "精编御寒布冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 4833,
        durability: 60,
        effects: { phy_def: 8, mag_def: 3, speed: 2, hp_max: 49, mag_atk: 5, qi: 2, shen: 2 },
        req: { shen: 15 },
        desc: "【布甲】北方守军通用的加厚布冠，在布料中混纺了韧性较高的麻丝，不仅保暖且对钝击有一定防护。"
    },
    {
        id: "head_131",
        name: "门派外门法帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 4833,
        durability: 60,
        effects: { phy_def: 5, mag_def: 6, speed: 2, hp_max: 49, mag_atk: 5, qi: 2, shen: 2 },
        req: { shen: 15 },
        desc: "【布甲】名门大派外门弟子的统一冠饰，做工扎实，在多次浆洗后依然能保持挺拔的法冠外型。"
    },
    {
        id: "head_132",
        name: "洗练云纹方巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 4833,
        durability: 60,
        effects: { phy_def: 3, mag_def: 8, speed: 2, hp_max: 49, mag_atk: 5, qi: 2, shen: 2 },
        req: { shen: 15 },
        desc: "【布甲】这种方巾在边缘绣有简单的避法纹路，虽然品质大众化，但法术防护力非常可靠。"
    },

    // --- [High Tier / 高数值] (总防: 17 | HP: 63 | 速: 3 | 法攻: 6 | 属性: 6 | 售价: 6831) ---
    {
        id: "head_133",
        name: "精选官家快行冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 6831,
        durability: 80,
        effects: { phy_def: 13, mag_def: 4, speed: 3, hp_max: 63, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 20 },
        desc: "【布甲】专为官方信使或高阶斥候定制的头冠，采用了特殊的经纬织法，在保证轻便的同时具有极佳韧性。"
    },
    {
        id: "head_134",
        name: "上品棉麻御风帽", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 6831,
        durability: 80,
        effects: { phy_def: 8, mag_def: 9, speed: 3, hp_max: 63, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 20 },
        desc: "【布甲】市面上广受欢迎的上等布帽，结构轻盈且防御全面，是江湖人士游走四方的首选法饰。"
    },
    {
        id: "head_135",
        name: "浸灵御法法冠", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 6831,
        durability: 80,
        effects: { phy_def: 4, mag_def: 13, speed: 3, hp_max: 63, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 20 },
        desc: "【布甲】布料在稀释后的灵液中浸泡七日而成，虽是大众化法具，但在面对元素攻击时依然游刃有余。"
    }
];
// Batch 16: Rarity 4 - Head (Plate / 板甲)
// IDs: head_136 - head_144
// 风格：优良装备、上等品质 - 军中校尉盔、精钢锻造、工艺精湛
const head_r4_batch1 = [
    // --- [Low Tier / 低数值] (总防: 27 | HP: 96 | 速: -4 | 物攻: 2 | 售价: 7956) ---
    {
        id: "head_136",
        name: "精钢虎卫盔", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7956,
        durability: 120,
        effects: { phy_def: 18, mag_def: 9, speed: -4, hp_max: 96, phy_atk: 2 },
        req: { jing: 22 },
        desc: "【板甲】采用百炼精钢打造，甲面浮雕有下山虎纹。这是军中领队级武官的制式重盔，防御极高。"
    },
    {
        id: "head_137",
        name: "校尉明光兜鍪", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7956,
        durability: 120,
        effects: { phy_def: 13, mag_def: 14, speed: -4, hp_max: 96, phy_atk: 2 },
        req: { jing: 22 },
        desc: "【板甲】护心镜被打磨得如明镜一般，其优良的几何结构能弹开正面而来的箭矢，防护周全。"
    },
    {
        id: "head_138",
        name: "冷锻御法板盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7956,
        durability: 120,
        effects: { phy_def: 9, mag_def: 18, speed: -4, hp_max: 96, phy_atk: 2 },
        req: { jing: 22 },
        desc: "【板甲】通过冷锻工艺大幅提升了金属密度，并内嵌了少量阻灵材质，对元素冲击有极强的韧性。"
    },

    // --- [Mid Tier / 中数值] (总防: 45 | HP: 132 | 速: -5 | 物攻: 3 | 售价: 12492) ---
    {
        id: "head_139",
        name: "玄铁镇远兜鍪", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 12492,
        durability: 160,
        effects: { phy_def: 31, mag_def: 14, speed: -5, hp_max: 132, phy_atk: 3 },
        req: { jing: 30 },
        desc: "【板甲】采用沉重的玄铁混合精钢铸造，甲片厚实，盔顶红缨随风飘扬，非军中猛将不能负重。"
    },
    {
        id: "head_140",
        name: "重装校阅钢盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 12492,
        durability: 160,
        effects: { phy_def: 22, mag_def: 23, speed: -5, hp_max: 132, phy_atk: 3 },
        req: { jing: 30 },
        desc: "【板甲】用于王城亲卫的精良装备，不仅在防护性能上无懈可击，整体设计也尽显大将风范。"
    },
    {
        id: "head_141",
        name: "陨铁辟邪兜鍪", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 12492,
        durability: 160,
        effects: { phy_def: 14, mag_def: 31, speed: -5, hp_max: 132, phy_atk: 3 },
        req: { jing: 30 },
        desc: "【板甲】传说加入了天外陨铁碎片的板盔，呈现出一种暗紫色，对各类奇门咒术有惊人的吸收力。"
    },

    // --- [High Tier / 高数值] (总防: 63 | HP: 168 | 速: -6 | 物攻: 4 | 售价: 17028) ---
    {
        id: "head_142",
        name: "虎威将军钢甲盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 17028,
        durability: 200,
        effects: { phy_def: 44, mag_def: 19, speed: -6, hp_max: 168, phy_atk: 4 },
        req: { jing: 38 },
        desc: "【板甲】上等将军盔。每一寸都经过数万次捶打，犹如一道移动的铁壁，无惧任何物理重击。"
    },
    {
        id: "head_143",
        name: "麒麟吞口战盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 17028,
        durability: 200,
        effects: { phy_def: 31, mag_def: 32, speed: -6, hp_max: 168, phy_atk: 4 },
        req: { jing: 38 },
        desc: "【板甲】武林名宿钟爱的极品护具，护耳处铸有麒麟吞口，工艺巅峰，防护性能傲视群雄。"
    },
    {
        id: "head_144",
        name: "紫金抗魔重盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 17028,
        durability: 200,
        effects: { phy_def: 19, mag_def: 44, speed: -6, hp_max: 168, phy_atk: 4 },
        req: { jing: 38 },
        desc: "【板甲】在精钢表面镀有一层紫金膜，能有效折射高强度的术法流，是应对法术阵地的终极头部装备。"
    }
];
// Batch 17: Rarity 4 - Head (Heavy / 重甲)
// IDs: head_145 - head_153
// 风格：上等品质、精锐护具 - 资深士官配备、名甲翻新、加厚防御
const head_r4_batch2 = [
    // --- [Low Tier / 低数值] (总防: 22 | HP: 88 | 速: -2 | 物攻: 1 | 售价: 6516) ---
    {
        id: "head_145",
        name: "精揉铁胎皮盔", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 6516,
        durability: 110,
        effects: { phy_def: 16, mag_def: 6, speed: -2, hp_max: 88, phy_atk: 1 },
        req: { jing: 20 },
        desc: "【重甲】在厚实的犀皮内部嵌入了精钢骨架，这种“铁胎”结构让它在轻量化的同时具备了重盔的强度。"
    },
    {
        id: "head_146",
        name: "百战老兵重面", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 6516,
        durability: 110,
        effects: { phy_def: 11, mag_def: 11, speed: -2, hp_max: 88, phy_atk: 1 },
        req: { jing: 20 },
        desc: "【重甲】资深老兵使用的重型面具，皮革表面布满了战斗痕迹，但其紧凑的防护层依然能够抵御多方位的冲击。"
    },
    {
        id: "head_147",
        name: "浸银御法皮笠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 6516,
        durability: 110,
        effects: { phy_def: 6, mag_def: 16, speed: -2, hp_max: 88, phy_atk: 1 },
        req: { jing: 20 },
        desc: "【重甲】皮革中交织了细碎的银丝，呈现出独特的灰白色，对寒冰和闪电类法术有着极佳的偏转效果。"
    },

    // --- [Mid Tier / 中数值] (总防: 37 | HP: 121 | 速: -2 | 物攻: 2 | 售价: 10692) ---
    {
        id: "head_148",
        name: "镇岳护面重盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 10692,
        durability: 150,
        effects: { phy_def: 28, mag_def: 9, speed: -2, hp_max: 121, phy_atk: 2 },
        req: { jing: 28 },
        desc: "【重甲】盔沿低垂，极大地增强了对颈部和面部的物理保护，是防守反击战术中不可或缺的优秀护具。"
    },
    {
        id: "head_149",
        name: "虎斑重革兜鍪", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 10692,
        durability: 150,
        effects: { phy_def: 18, mag_def: 19, speed: -2, hp_max: 121, phy_atk: 2 },
        req: { jing: 28 },
        desc: "【重甲】采用罕见的异兽皮革层层叠压而成，韧性惊人，在抵挡物理劈砍与吸收术法震荡之间取得了完美平衡。"
    },
    {
        id: "head_150",
        name: "沉香御魔重冠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 4,
        value: 10692,
        durability: 150,
        effects: { phy_def: 9, mag_def: 28, speed: -2, hp_max: 121, phy_atk: 2 },
        req: { jing: 28 },
        desc: "【重甲】皮革在沉香木液中浸泡多年，佩戴者能时刻保持神智清明，有效削弱大范围幻术和元素咒语的影响。"
    },

    // --- [High Tier / 高数值] (总防: 52 | HP: 154 | 速: -3 | 物攻: 3 | 售价: 15300) ---
    {
        id: "head_151",
        name: "龙鳞纹精钢重盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 15300,
        durability: 190,
        effects: { phy_def: 39, mag_def: 13, speed: -3, hp_max: 154, phy_atk: 3 },
        req: { jing: 36 },
        desc: "【重甲】由大师级工匠打造，甲片如龙鳞般细密排列，具备极强的物理偏转力，是力量型武士的至宝。"
    },
    {
        id: "head_152",
        name: "统领级铁心重冠", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 15300,
        durability: 190,
        effects: { phy_def: 26, mag_def: 26, speed: -3, hp_max: 154, phy_atk: 3 },
        req: { jing: 36 },
        desc: "【重甲】统领级别的特供护头，其金属核心经过千锤百炼，不仅结构极其稳固，且能全方位保护佩戴者免受致命伤。"
    },
    {
        id: "head_153",
        name: "避雷犀皮重面甲", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 15300,
        durability: 190,
        effects: { phy_def: 13, mag_def: 39, speed: -3, hp_max: 154, phy_atk: 3 },
        req: { jing: 36 },
        desc: "【重甲】采用特殊的导魔皮革制成，能将法术冲击平滑地引导至全身分散，对雷霆等爆发性法术防御极佳。"
    }
];
// Batch 18: Rarity 4 - Head (Light / 轻甲)
// IDs: head_154 - head_162
// 风格：优良装备、上等品质 - 精锐斥候标配、名门弟子护具、轻便且坚固
const head_r4_batch3 = [
    // --- [Low Tier / 低数值] (总防: 18 | HP: 80 | 速: 0 | 售价: 6120) ---
    {
        id: "head_154",
        name: "牙将精缝皮面具", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 6120,
        durability: 90,
        effects: { phy_def: 14, mag_def: 4, speed: 0, hp_max: 80 },
        req: { shen: 15 },
        desc: "【轻甲】专为牙将级军官定制的熟皮面具，皮质经过反复捶打，不仅轻便且具备极佳的正面抗性。"
    },
    {
        id: "head_155",
        name: "军官巡营轻护面", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 6120,
        durability: 90,
        effects: { phy_def: 9, mag_def: 9, speed: 0, hp_max: 80 },
        req: { shen: 15 },
        desc: "【轻甲】在军中巡营时穿着的优良护具，采用复合皮革缝制，能够完美平衡钝击与内劲的伤害。"
    },
    {
        id: "head_156",
        name: "碧波卸法护额", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 6120,
        durability: 90,
        effects: { phy_def: 4, mag_def: 14, speed: 0, hp_max: 80 },
        req: { shen: 15 },
        desc: "【轻甲】名门子弟常用的护体额带，布料中混纺了深海鲛皮丝，对各种咒术冲击有惊人的偏转效果。"
    },

    // --- [Mid Tier / 中数值] (总防: 30 | HP: 110 | 速: 0 | 售价: 9360) ---
    {
        id: "head_157",
        name: "偏将护身轻兜", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 9360,
        durability: 120,
        effects: { phy_def: 23, mag_def: 7, speed: 0, hp_max: 110 },
        req: { shen: 22 },
        desc: "【轻甲】偏将级军官的贴身皮兜，在保证视野开阔的前提下，加厚了太阳穴部位的防护，工艺上乘。"
    },
    {
        id: "head_158",
        name: "名门锦绣护发冠", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 9360,
        durability: 120,
        effects: { phy_def: 15, mag_def: 15, speed: 0, hp_max: 110 },
        req: { shen: 22 },
        desc: "【轻甲】出自京都名匠之手的战冠，刺绣精美且内嵌坚韧的犀皮，是武林名宿出席重要场合的首选。"
    },
    {
        id: "head_159",
        name: "翠屏避火皮面", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 9360,
        durability: 120,
        effects: { phy_def: 7, mag_def: 23, speed: 0, hp_max: 110 },
        req: { shen: 22 },
        desc: "【轻甲】通体翠绿的上等护具，浸泡过特殊的避火药液，能让穿戴者在混乱的火法战场中维持清醒。"
    },

    // --- [High Tier / 高数值] (总防: 42 | HP: 140 | 速: 0 | 售价: 12600) ---
    {
        id: "head_160",
        name: "禁卫龙爪皮盔", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 12600,
        durability: 150,
        effects: { phy_def: 32, mag_def: 10, speed: 0, hp_max: 140 },
        req: { shen: 30 },
        desc: "【轻甲】效仿龙爪受力结构设计的上等皮盔，防护力在同类中几无敌手，是禁卫军领队的标志性装备。"
    },
    {
        id: "head_161",
        name: "惊鸿轻质战冠", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 12600,
        durability: 150,
        effects: { phy_def: 21, mag_def: 21, speed: 0, hp_max: 140 },
        req: { shen: 30 },
        desc: "【轻甲】质地如水般丝滑却韧性惊人的极品头饰，全面的防护性能能让武者在激战中保持头脑冷静。"
    },
    {
        id: "head_162",
        name: "琉璃净法面罩", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 12600,
        durability: 150,
        effects: { phy_def: 10, mag_def: 32, speed: 0, hp_max: 140 },
        req: { shen: 30 },
        desc: "【轻甲】采用琉璃矿粉与灵丝织就的圣洁护面，其法术防御力极其恐怖，能无视大部分中阶术法。"
    }
];
// Batch 19: Rarity 4 - Head (Leather / 皮甲)
// IDs: head_163 - head_171
// 风格：上等品质 - 影豹皮、蛟革、精锐密探配备、工艺严密
const head_r4_batch4 = [
    // --- [Low Tier / 低数值] (总防: 14 | HP: 64 | 速: 1 | 物攻: 4 | 暴击: 5 | 售价: 8856) ---
    {
        id: "head_163",
        name: "乌鬃战马面具", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 8856,
        durability: 90,
        effects: { phy_def: 10, mag_def: 4, speed: 1, hp_max: 64, phy_atk: 4, crit: 5 },
        req: { shen: 18 },
        desc: "【皮甲】选用北地黑马皮鞣制，皮革厚实且极具韧性，是军中校尉常用的优良马战护具。"
    },
    {
        id: "head_164",
        name: "精选犀革护头", // 均衡防御 (0.5:0.5)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 8856,
        durability: 90,
        effects: { phy_def: 7, mag_def: 7, speed: 1, hp_max: 64, phy_atk: 4, crit: 5 },
        req: { shen: 18 },
        desc: "【皮甲】标准的军中牙将级装备，皮面经过多次捶打变得极其紧致，能够有效抵消钝器冲击。"
    },
    {
        id: "head_165",
        name: "灵犀御魔法帽", // 法术防御偏向 (0.3:0.7)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 8856,
        durability: 90,
        effects: { phy_def: 4, mag_def: 10, speed: 1, hp_max: 64, phy_atk: 4, crit: 5 },
        req: { shen: 18 },
        desc: "【皮甲】在犀牛皮中浸入了特殊的抗魔法油脂，帽身隐现光泽，是名门弟子应对法术流的利器。"
    },

    // --- [Mid Tier / 中数值] (总防: 23 | HP: 88 | 速: 1 | 物攻: 6 | 暴击: 8 | 售价: 14112) ---
    {
        id: "head_166",
        name: "影豹潜行面具", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 14112,
        durability: 120,
        effects: { phy_def: 16, mag_def: 7, speed: 1, hp_max: 88, phy_atk: 6, crit: 8 },
        req: { shen: 25 },
        desc: "【皮甲】名家打造的影豹皮面具，贴合面部且透气性极佳，极大提升了穿戴者的狩猎本能。"
    },
    {
        id: "head_167",
        name: "骁勇厚革面甲", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 14112,
        durability: 120,
        effects: { phy_def: 12, mag_def: 11, speed: 1, hp_max: 88, phy_atk: 6, crit: 8 },
        req: { shen: 25 },
        desc: "【皮甲】上等牛革经百次捶打成型，坚韧度足以弹开寻常弩箭，是战场上军中统领的可靠伙伴。"
    },
    {
        id: "head_168",
        name: "织墨避法皮冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 14112,
        durability: 120,
        effects: { phy_def: 7, mag_def: 16, speed: 1, hp_max: 88, phy_atk: 6, crit: 8 },
        req: { shen: 25 },
        desc: "【皮甲】皮革中混编了珍贵的御魔蚕丝，整体呈墨黑色，对抗法术冲击的效果极佳。"
    },

    // --- [High Tier / 高数值] (总防: 32 | HP: 112 | 速: 1 | 物攻: 8 | 暴击: 10 | 售价: 19872) ---
    {
        id: "head_169",
        name: "虎贲犀甲盔", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19872,
        durability: 150,
        effects: { phy_def: 22, mag_def: 10, speed: 1, hp_max: 112, phy_atk: 8, crit: 10 },
        req: { shen: 32 },
        desc: "【皮甲】以成年铁皮犀牛脊皮制成，其硬度直追金属，却丝毫不显笨重，是精锐先锋的首选。"
    },
    {
        id: "head_170",
        name: "追风游龙护额", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19872,
        durability: 150,
        effects: { phy_def: 16, mag_def: 16, speed: 1, hp_max: 112, phy_atk: 8, crit: 10 },
        req: { shen: 32 },
        desc: "【皮甲】江湖中传颂的上等身法护具，结构完美，能让穿戴者在战斗中保持极其敏锐的观察力。"
    },
    {
        id: "head_171",
        name: "幻影星辰皮冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19872,
        durability: 150,
        effects: { phy_def: 10, mag_def: 22, speed: 1, hp_max: 112, phy_atk: 8, crit: 10 },
        req: { shen: 32 },
        desc: "【皮甲】皮面具有轻微的灵力折射特性，能误导敌人的感知，是应对禁术轰炸的绝佳头部防具。"
    }
];
// Batch 20: Rarity 4 - Head (Cloth / 布甲)
// IDs: head_172 - head_180
// 风格：上等品质 - 随军高阶法师、名门文官、云锦天蚕丝织物
const head_r4_batch5 = [
    // --- [Low Tier / 低数值] (总防: 9 | HP: 48 | 速: 2 | 法攻: 4 | 属性: 5 | 售价: 6300) ---
    {
        id: "head_172",
        name: "天蓝纹锦法帽", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 6300,
        durability: 80,
        effects: { phy_def: 7, mag_def: 2, speed: 2, hp_max: 48, mag_atk: 4, qi: 3, shen: 2 },
        req: { shen: 18 },
        desc: "【布甲】采用上等纹锦织就，色泽如晴空般明净。内里应用了多重纳底工艺，即便在激战中也能稳固戴在头上。"
    },
    {
        id: "head_173",
        name: "云丝御风巾", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 6300,
        durability: 80,
        effects: { phy_def: 4, mag_def: 5, speed: 2, hp_max: 48, mag_atk: 4, qi: 2, shen: 3 },
        req: { shen: 18 },
        desc: "【布甲】巾身轻薄如云，内嵌微型引风法阵。穿戴者行动间皆有清风拂面，有助于保持神识清明。"
    },
    {
        id: "head_174",
        name: "净心灵曦抹额", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 6300,
        durability: 80,
        effects: { phy_def: 2, mag_def: 7, speed: 2, hp_max: 48, mag_atk: 4, qi: 2, shen: 3 },
        req: { shen: 18 },
        desc: "【布甲】由静心草纤维混编而成，能助穿戴者排除杂念。丝滑的布料对外界灵力冲击有天然的卸力效果。"
    },

    // --- [Mid Tier / 中数值] (总防: 15 | HP: 66 | 速: 2 | 法攻: 6 | 属性: 7 | 售价: 9936) ---
    {
        id: "head_175",
        name: "金丝精纳战冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 9936,
        durability: 110,
        effects: { phy_def: 11, mag_def: 4, speed: 2, hp_max: 66, mag_atk: 6, qi: 3, shen: 4 },
        req: { shen: 25 },
        desc: "【布甲】在棉布中混入了极细的柔性金丝，极大地提升了防御性能，是法武双修的将领钟爱之物。"
    },
    {
        id: "head_176",
        name: "流云逐浪锦冠", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 9936,
        durability: 110,
        effects: { phy_def: 7, mag_def: 8, speed: 2, hp_max: 66, mag_atk: 6, qi: 4, shen: 3 },
        req: { shen: 25 },
        desc: "【布甲】采用名贵的流云锦缝制，触感温润。其特殊的波浪状缝合结构，能化解大部分针对脑部的暗劲。"
    },
    {
        id: "head_177",
        name: "月华清辉法巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 9936,
        durability: 110,
        effects: { phy_def: 4, mag_def: 11, speed: 2, hp_max: 66, mag_atk: 6, qi: 3, shen: 4 },
        req: { shen: 25 },
        desc: "【布甲】采集月华之精染色的天蚕丝制成，夜晚会散发出淡淡的清辉，对元素伤害有极强的中和能力。"
    },

    // --- [High Tier / 高数值] (总防: 21 | HP: 84 | 速: 3 | 法攻: 8 | 属性: 10 | 售价: 14256) ---
    {
        id: "head_178",
        name: "天蚕金线法冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 14256,
        durability: 140,
        effects: { phy_def: 16, mag_def: 5, speed: 3, hp_max: 84, mag_atk: 8, qi: 5, shen: 5 },
        req: { shen: 32 },
        desc: "【布甲】布质头饰中的极品。采用千年天蚕丝与玄金细线交织，防御力惊人且丝毫不损佩戴者的灵活性。"
    },
    {
        id: "head_179",
        name: "扶摇踏风圣带", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 14256,
        durability: 140,
        effects: { phy_def: 10, mag_def: 11, speed: 3, hp_max: 84, mag_atk: 8, qi: 5, shen: 5 },
        req: { shen: 32 },
        desc: "【布甲】寓意“扶摇直上”。其结构经过阵法加持，能大幅缩减施法时的精神阻力，品质卓绝。"
    },
    {
        id: "head_180",
        name: "离尘无垢法帽", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 14256,
        durability: 140,
        effects: { phy_def: 5, mag_def: 16, speed: 3, hp_max: 84, mag_atk: 8, qi: 5, shen: 5 },
        req: { shen: 32 },
        desc: "【布甲】不染尘埃。特殊的织法让这件法帽几乎完全免疫低阶法术干扰，是追求灵力纯净修行者的首选。"
    }
];
// Batch 21: Rarity 5 - Head (Plate / 板甲)
// IDs: head_181 - head_189
// 风格：传世珍品、神工鬼斧 - 护国大将军、铁血统帅、横练宗师之选
const head_r5_batch1 = [
    // --- [Low Tier / 低数值] (总防: 40 | HP: 120 | 速: -5 | 物攻: 3 | 售价: 15120) ---
    {
        id: "head_181",
        name: "碎岩震地兜鍪", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 15120,
        durability: 200,
        effects: { phy_def: 28, mag_def: 12, speed: -5, hp_max: 120, phy_atk: 3 },
        req: { jing: 30 },
        desc: "【板甲】采用地底深处的震山铁打制，沉重无比。统帅站定时，如同一座生根于地脉的钢铁堡垒，稳如泰山。"
    },
    {
        id: "head_182",
        name: "磐石负重金盔", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 15120,
        durability: 200,
        effects: { phy_def: 20, mag_def: 20, speed: -5, hp_max: 120, phy_atk: 3 },
        req: { jing: 30 },
        desc: "【板甲】黄金丝线与冷铁交织出的传世神工，外观华美夺目。其结构如磐石般稳固，水火不侵，万箭难穿。"
    },
    {
        id: "head_183",
        name: "陨星厚土板盔", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 15120,
        durability: 200,
        effects: { phy_def: 12, mag_def: 28, speed: -5, hp_max: 120, phy_atk: 3 },
        req: { jing: 30 },
        desc: "【板甲】取自域外陨星之核打造，天生带有对灵气的排斥力。即便面对禁咒轰炸，亦能保全统帅周全。"
    },

    // --- [Mid Tier / 中数值] (总防: 57 | HP: 165 | 速: -6 | 物攻: 4 | 售价: 21150) ---
    {
        id: "head_184",
        name: "撼岳囚龙重盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 21150,
        durability: 250,
        effects: { phy_def: 40, mag_def: 17, speed: -6, hp_max: 165, phy_atk: 4 },
        req: { jing: 40 },
        desc: "【板甲】相传曾用于镇压恶龙。此盔不仅具备极致的硬度，咬合结构更能化解一切蛮力冲撞。"
    },
    {
        id: "head_185",
        name: "乾坤定鼎兜鍪", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 21150,
        durability: 250,
        effects: { phy_def: 28, mag_def: 29, speed: -6, hp_max: 165, phy_atk: 4 },
        req: { jing: 40 },
        desc: "【板甲】名匠定鼎河山的传世之作。盔面平整如镜，能应对战场上任何极端的物理打击与能量侵蚀。"
    },
    {
        id: "head_186",
        name: "紫极玄阴铁面", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 21150,
        durability: 250,
        effects: { phy_def: 17, mag_def: 40, speed: -6, hp_max: 165, phy_atk: 4 },
        req: { jing: 40 },
        desc: "【板甲】采集极寒之地的玄阴之气淬火，呈现深紫色。能够吸收周遭暴乱的灵力，化作护体罡气。"
    },

    // --- [High Tier / 高数值] (总防: 75 | HP: 210 | 速: -7 | 物攻: 6 | 售价: 27720) ---
    {
        id: "head_187",
        name: "镇岳不动皇龙盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 27720,
        durability: 300,
        effects: { phy_def: 52, mag_def: 23, speed: -7, hp_max: 210, phy_atk: 6 },
        req: { jing: 50 },
        desc: "【板甲】板盔之中的无冕之王。龙纹浮雕透着皇者霸气，可令神鬼叹息，穿戴者即为战场禁区。"
    },
    {
        id: "head_188",
        name: "万钧重力神工兜", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 27720,
        durability: 300,
        effects: { phy_def: 37, mag_def: 38, speed: -7, hp_max: 210, phy_atk: 6 },
        req: { jing: 50 },
        desc: "【板甲】神工级冶炼技术的巅峰，每一寸受力都经过精密调校，是跨越纪元的重型防御神器。"
    },
    {
        id: "head_189",
        name: "混沌辟魔神钢面", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 27720,
        durability: 300,
        effects: { phy_def: 23, mag_def: 52, speed: -7, hp_max: 210, phy_atk: 6 },
        req: { jing: 50 },
        desc: "【板甲】在混沌灵矿中诞生的重型面甲，彻底隔绝五行流转。法师的攻击在此盔面前犹如儿戏。"
    }
];
// Batch 22: Rarity 5 - Head (Heavy / 重甲)
// IDs: head_190 - head_198
// 风格：传世珍品、神工鬼斧 - 隐世宗师护具、上古异兽革、武圣亲传
const head_r5_batch2 = [
    // --- [Low Tier / 低数值] (总防: 34 | HP: 110 | 速: -2 | 物攻: 2 | 售价: 12240) ---
    {
        id: "head_190",
        name: "蛟鳞玄钢重胄", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 12240,
        durability: 180,
        effects: { phy_def: 25, mag_def: 9, speed: -2, hp_max: 110, phy_atk: 2 },
        req: { jing: 28 },
        desc: "【重甲】以深海黑蛟的颈皮包裹玄钢骨架，柔韧中透着极致的坚硬，寻常刀剑斩击仅能留下一道白痕。"
    },
    {
        id: "head_191",
        name: "百战武圣铁面", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 12240,
        durability: 180,
        effects: { phy_def: 17, mag_def: 17, speed: -2, hp_max: 110, phy_atk: 2 },
        req: { jing: 28 },
        desc: "【重甲】传闻为古之武圣征战时所佩，面甲线条刚毅，不仅能提供全方位保护，更能给敌人带来无形的威压。"
    },
    {
        id: "head_192",
        name: "天极辟法皮冠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 12240,
        durability: 180,
        effects: { phy_def: 9, mag_def: 25, speed: -2, hp_max: 110, phy_atk: 2 },
        req: { jing: 28 },
        desc: "【重甲】皮革中交织了大量破魔银丝，这种古老的编织工艺已近失传，对各类属性咒术具有极强的抗性。"
    },

    // --- [Mid Tier / 中数值] (总防: 48 | HP: 151 | 速: -3 | 物攻: 3 | 售价: 17820) ---
    {
        id: "head_193",
        name: "撼地龙象兜鍪", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 17820,
        durability: 240,
        effects: { phy_def: 36, mag_def: 12, speed: -3, hp_max: 151, phy_atk: 3 },
        req: { jing: 38 },
        desc: "【重甲】采用荒原龙象的厚革叠压而成，每一层都经过秘药浸泡。佩戴者犹如巨兽附体，抗打击力极其惊人。"
    },
    {
        id: "head_194",
        name: "太极玄清护头", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 17820,
        durability: 240,
        effects: { phy_def: 24, mag_def: 24, speed: -3, hp_max: 151, phy_atk: 3 },
        req: { jing: 38 },
        desc: "【重甲】将玄铁与奇门遁甲之术结合打造。护具内部自成循环，能将受到的伤害均匀分散至全身，毫无死角。"
    },
    {
        id: "head_195",
        name: "离火焚天重冠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 17820,
        durability: 240,
        effects: { phy_def: 12, mag_def: 36, speed: -3, hp_max: 151, phy_atk: 3 },
        req: { jing: 38 },
        desc: "【重甲】由耐高温的异兽皮混合火铜精炼。不仅能防御物理冲击，更对火焰与雷霆法术有着近乎免疫的抵抗力。"
    },

    // --- [High Tier / 高数值] (总防: 62 | HP: 192 | 速: -3 | 物攻: 4 | 售价: 23580) ---
    {
        id: "head_196",
        name: "至尊饕餮镇岳盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 23580,
        durability: 300,
        effects: { phy_def: 47, mag_def: 15, speed: -3, hp_max: 192, phy_atk: 4 },
        req: { jing: 48 },
        desc: "【重甲】神工级杰作。盔顶嵌有饕餮吞口，寓意吞噬一切攻击。其物理防御上限已达到重型护具的巅峰。"
    },
    {
        id: "head_197",
        name: "不灭金身重面具", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 23580,
        durability: 300,
        effects: { phy_def: 31, mag_def: 31, speed: -3, hp_max: 192, phy_atk: 4 },
        req: { jing: 48 },
        desc: "【重甲】传闻中横练宗师遗留的护具。面具内刻有稳固神魂的真言，穿戴者在战场上如同不灭金身，无可撼动。"
    },
    {
        id: "head_198",
        name: "九幽冥府辟邪冕", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 23580,
        durability: 300,
        effects: { phy_def: 15, mag_def: 47, speed: -3, hp_max: 192, phy_atk: 4 },
        req: { jing: 48 },
        desc: "【重甲】色泽幽暗，仿佛能吸收所有光线。其材质能完全阻隔天地灵力的波动，是所有法系职业的克星。"
    }
];
// Batch 23: Rarity 5 - Head (Light / 轻甲)
// IDs: head_199 - head_207
// 风格：传世珍品、神工鬼斧 - 绝世刺客、轻功大师、皇室禁卫终极防具
const head_r5_batch3 = [
    // --- [Low Tier / 低数值] (总防: 27 | HP: 100 | 速: 0 | 售价: 10575) ---
    {
        id: "head_199",
        name: "九霄御风轻冠", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 10575,
        durability: 180,
        effects: { phy_def: 20, mag_def: 7, speed: 0, hp_max: 100 },
        req: { shen: 25 },
        desc: "【轻甲】采用极北高空的灵禽羽丝制成，不仅防御坚韧，更赋予穿戴者如坠九霄的轻盈感，是传世级的护头。"
    },
    {
        id: "head_200",
        name: "绝影流光面具", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 10575,
        durability: 180,
        effects: { phy_def: 13, mag_def: 14, speed: 0, hp_max: 100 },
        req: { shen: 25 },
        desc: "【轻甲】传世名匠呕心沥血之作。面具流转着微光，结构极其紧凑，能完美化解来自四面八方的致命劲力。"
    },
    {
        id: "head_201",
        name: "青鸾月华锦带", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 10575,
        durability: 180,
        effects: { phy_def: 7, mag_def: 20, speed: 0, hp_max: 100 },
        req: { shen: 25 },
        desc: "【轻甲】以青鸾落羽混编蚕丝织就，在月光下熠熠生辉。其神工级的隔魔工艺能让绝大多数术法消散于无形。"
    },

    // --- [Mid Tier / 中数值] (总防: 38 | HP: 137 | 速: 0 | 售价: 14715) ---
    {
        id: "head_202",
        name: "苍龙破云兜帽", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 14715,
        durability: 240,
        effects: { phy_def: 28, mag_def: 10, speed: 0, hp_max: 137 },
        req: { shen: 35 },
        desc: "【轻甲】融合了异兽龙鳞粉末的传世甲胄头部。其硬度足以抵挡神兵利器的正面劈砍，威名赫赫。"
    },
    {
        id: "head_203",
        name: "万里神行圣发带", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 14715,
        durability: 240,
        effects: { phy_def: 19, mag_def: 19, speed: 0, hp_max: 137 },
        req: { shen: 35 },
        desc: "【轻甲】圣阶工艺打造的锦绣发带，防护性能无懈可击，穿戴者在混战中灵动自如，如鬼魅般不可捉摸。"
    },
    {
        id: "head_204",
        name: "瑶光避尘护面", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 14715,
        durability: 240,
        effects: { phy_def: 10, mag_def: 28, speed: 0, hp_max: 137 },
        req: { shen: 35 },
        desc: "【轻甲】取瑶光星垂之灵气浸染，不沾尘埃。其神工鬼斧的灵力脉络能轻易弹开高强度的元气轰击。"
    },

    // --- [High Tier / 高数值] (总防: 50 | HP: 175 | 速: 0 | 售价: 19125) ---
    {
        id: "head_205",
        name: "天外玄天轻面甲", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 19125,
        durability: 300,
        effects: { phy_def: 37, mag_def: 13, speed: 0, hp_max: 175 },
        req: { shen: 45 },
        desc: "【轻甲】此甲已近乎神迹。采用上古巨犀皮结合玄金打造，其物理防护能力已达到了轻型头饰的极致。"
    },
    {
        id: "head_206",
        name: "八荒游龙圣战冠", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 19125,
        durability: 300,
        effects: { phy_def: 25, mag_def: 25, speed: 0, hp_max: 175 },
        req: { shen: 45 },
        desc: "【轻甲】傲视八荒的传奇锦冠。无论是材料还是结构都达到了修仙界的巅峰，提供极其恐怖的防护。"
    },
    {
        id: "head_207",
        name: "紫微御魔大圣冕", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 19125,
        durability: 300,
        effects: { phy_def: 13, mag_def: 37, speed: 0, hp_max: 175 },
        req: { shen: 45 },
        desc: "【轻甲】内蕴紫微之意。由顶级御魔丝绸与天蚕皮合制而成，能够将任何禁咒级的法术冲击化解于无形。"
    }
];
// Batch 24: Rarity 5 - Head (Leather / 皮甲)
// IDs: head_208 - head_216
// 风格：传世珍品、神工鬼斧 - 逆鳞贪狼皮、裂空潜行、神捕/影卫之选
const head_r5_batch4 = [
    // --- [Low Tier / 低数值] (总防: 20 | HP: 80 | 速: 1 | 物攻: 5 | 暴击: 5 | 售价: 13725) ---
    {
        id: "head_208",
        name: "贪狼噬日皮铠面", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 13725,
        durability: 160,
        effects: { phy_def: 15, mag_def: 5, speed: 1, hp_max: 80, phy_atk: 5, crit: 5 },
        req: { shen: 28 },
        desc: "【皮甲】取塞外贪狼之颈皮制成，暗红色的皮革隐约透着凶戾之气。能极大提升穿戴者的杀伐之感。"
    },
    {
        id: "head_209",
        name: "绝影奔雷战面", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 13725,
        durability: 160,
        effects: { phy_def: 10, mag_def: 10, speed: 1, hp_max: 80, phy_atk: 5, crit: 5 },
        req: { shen: 28 },
        desc: "【皮甲】传世名匠以特殊手段揉制，皮面在光照下如雷鸣闪现。其轻盈度与防护力的平衡已近神迹。"
    },
    {
        id: "head_210",
        name: "幻瞳避火皮冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 13725,
        durability: 160,
        effects: { phy_def: 5, mag_def: 15, speed: 1, hp_max: 80, phy_atk: 5, crit: 5 },
        req: { shen: 28 },
        desc: "【皮甲】采集深渊幻兽之眼周边的柔皮打造，天生具备折射元素光束的神力，令施法者无从瞄准。"
    },

    // --- [Mid Tier / 中数值] (总防: 28 | HP: 110 | 速: 1 | 物攻: 7 | 暴击: 7 | 售价: 19170) ---
    {
        id: "head_211",
        name: "麒麟逆鳞战面", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 19170,
        durability: 220,
        effects: { phy_def: 21, mag_def: 7, speed: 1, hp_max: 110, phy_atk: 7, crit: 7 },
        req: { shen: 38 },
        desc: "【皮甲】以神兽麒麟颈下的逆鳞柔皮合制，触感如钢。它是无数影卫梦寐以求的护头神器。"
    },
    {
        id: "head_212",
        name: "混元乾坤皮冠", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 19170,
        durability: 220,
        effects: { phy_def: 14, mag_def: 14, speed: 1, hp_max: 110, phy_atk: 7, crit: 7 },
        req: { shen: 38 },
        desc: "【皮甲】皮革经过万年灵乳浸润，材质中蕴含阴阳调和之道，佩戴者可感知周遭一切细微的杀机。"
    },
    {
        id: "head_213",
        name: "九幽冥火皮袄帽", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 19170,
        durability: 220,
        effects: { phy_def: 7, mag_def: 21, speed: 1, hp_max: 110, phy_atk: 7, crit: 7 },
        req: { shen: 38 },
        desc: "【皮甲】在极阴之地揉制的珍稀皮甲，表面流转着幽冥冷火，能将攻击而来的灵气分解为虚无。"
    },

    // --- [High Tier / 高数值] (总防: 37 | HP: 140 | 速: 1 | 物攻: 10 | 暴击: 10 | 售价: 25425) ---
    {
        id: "head_214",
        name: "裂空龙裔战面甲", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 25425,
        durability: 280,
        effects: { phy_def: 28, mag_def: 9, speed: 1, hp_max: 140, phy_atk: 10, crit: 10 },
        req: { shen: 48 },
        desc: "【皮甲】选用亚龙脊部的硬革精制，防御力不仅惊人，更能引动一丝真龙威压，震慑心魂。"
    },
    {
        id: "head_215",
        name: "踏月逐影神发带", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 25425,
        durability: 280,
        effects: { phy_def: 18, mag_def: 19, speed: 1, hp_max: 140, phy_atk: 10, crit: 10 },
        req: { shen: 48 },
        desc: "【皮甲】如月中幻影，由传世名师联手打造。能让穿戴者在高速移动中依然保持精准的致命打击。"
    },
    {
        id: "head_216",
        name: "万象森罗护心冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 25425,
        durability: 280,
        effects: { phy_def: 9, mag_def: 28, speed: 1, hp_max: 140, phy_atk: 10, crit: 10 },
        req: { shen: 48 },
        desc: "【皮甲】冠面上刻满了森罗万象之阵。能自动偏转绝大部分针对泥丸宫的法术冲击，防御力近乎玄学。"
    }
];

// Batch 25: Rarity 5 - Head (Cloth / 布甲)
// IDs: head_217 - head_225
// 风格：传世珍品、神工鬼斧 - 流霞织金、九天蚕丝、太虚离垢、宗师法冠
const head_r5_batch5 = [
    // --- [Low Tier / 低数值] (总防: 13 | HP: 60 | 速: 2 | 法攻: 5 | 属性: 5 | 售价: 10575) ---
    {
        id: "head_217",
        name: "流霞织金圣冠", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 10575,
        durability: 100,
        effects: { phy_def: 10, mag_def: 3, speed: 2, hp_max: 60, mag_atk: 5, qi: 3, shen: 2 },
        req: { shen: 30 },
        desc: "【布甲】采集傍晚最后一抹流霞织入布中。此冠不仅身轻如燕，且能卸去针对脑部的沉重物理冲击。"
    },
    {
        id: "head_218",
        name: "九天霓裳仙发带", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 10575,
        durability: 100,
        effects: { phy_def: 6, mag_def: 7, speed: 2, hp_max: 60, mag_atk: 5, qi: 2, shen: 3 },
        req: { shen: 30 },
        desc: "【布甲】传说是仙子误落凡尘的霓裳残片所化。发带轻盈得近乎虚幻，能让施法者在危急时刻维持神识稳定。"
    },
    {
        id: "head_219",
        name: "太虚化灵圣巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 10575,
        durability: 100,
        effects: { phy_def: 3, mag_def: 10, speed: 2, hp_max: 60, mag_atk: 5, qi: 2, shen: 3 },
        req: { shen: 30 },
        desc: "【布甲】由高纯度的灵气纤维织就。由于具备神工级的辟魔法阵，佩戴此巾几乎能无视低阶法术的干扰。"
    },

    // --- [Mid Tier / 中数值] (总防: 19 | HP: 82 | 速: 3 | 法攻: 7 | 属性: 8 | 售价: 16155) ---
    {
        id: "head_220",
        name: "万年古棉护法冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 16155,
        durability: 150,
        effects: { phy_def: 14, mag_def: 5, speed: 3, hp_max: 82, mag_atk: 7, qi: 4, shen: 4 },
        req: { shen: 42 },
        desc: "【布甲】采用生长万年的古棉精制。其韧性竟不下于精铁，能够极好地保护泥丸宫免受物理震荡。"
    },
    {
        id: "head_221",
        name: "离垢无瑕圣锦冠", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 16155,
        durability: 150,
        effects: { phy_def: 9, mag_def: 10, speed: 3, hp_max: 82, mag_atk: 7, qi: 4, shen: 4 },
        req: { shen: 42 },
        desc: "【布甲】不染尘埃。此冠自带神工级的净心领域，能让穿戴者在混乱的战场中依然保持灵台清明。"
    },
    {
        id: "head_222",
        name: "紫极御天神发箍", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 16155,
        durability: 150,
        effects: { phy_def: 5, mag_def: 14, speed: 3, hp_max: 82, mag_atk: 7, qi: 4, shen: 4 },
        req: { shen: 42 },
        desc: "【布甲】通体紫气缭绕，乃名师采集东来紫气融合。能自动偏转高强度的术法攻击，防护神妙。"
    },

    // --- [High Tier / 高数值] (总防: 25 | HP: 105 | 速: 3 | 法攻: 10 | 属性: 10 | 售价: 22185) ---
    {
        id: "head_223",
        name: "混沌起源神冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 22185,
        durability: 200,
        effects: { phy_def: 19, mag_def: 6, speed: 3, hp_max: 105, mag_atk: 10, qi: 5, shen: 5 },
        req: { shen: 55 },
        desc: "【布甲】冠身材质源于混沌初开时的灵根。防御力不仅远超同类，更蕴含着生生不息的身法加持。"
    },
    {
        id: "head_224",
        name: "大罗天御风法冕", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 22185,
        durability: 200,
        effects: { phy_def: 12, mag_def: 13, speed: 3, hp_max: 105, mag_atk: 10, qi: 5, shen: 5 },
        req: { shen: 55 },
        desc: "【布甲】大罗天界的顶级遗产。其神工级的结构能完美平摊任何强度的冲击，令佩戴者神识不倒。"
    },
    {
        id: "head_225",
        name: "归墟寂灭法巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 22185,
        durability: 200,
        effects: { phy_def: 6, mag_def: 19, speed: 3, hp_max: 105, mag_atk: 10, qi: 5, shen: 5 },
        req: { shen: 55 },
        desc: "【布甲】巾面绣有归墟符文。能将一切针对头部的灵力攻击吸入虚无，乃布甲之终极神器。"
    }
];
// Batch 26: Rarity 6 - Head (Plate / 板甲)
// IDs: head_226 - head_234
// 风格：诸神遗产、末日修仙 - 冥狱铁壁、万劫不坏、葬神毁灭
const head_r6_batch1 = [
    // --- [Low Tier / 低数值] (总防: 57 | HP: 144 | 速: -6 | 物攻: 4 | 售价: 23436) ---
    {
        id: "head_226",
        name: "冥狱铁壁面甲", // 物理防御偏向 (0.7:0.3)
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 23436,
        durability: 500,
        effects: { phy_def: 40, mag_def: 17, speed: -6, hp_max: 144, phy_atk: 4 },
        req: { jing: 45 },
        desc: "【板甲】采冥界玄铁合铸，面甲时刻散发着森然死气。佩戴后如同一座生根于冥府的铁壁，万力难开。"
    },
    {
        id: "head_227",
        name: "玄天镇魔兜鍪", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 23436,
        durability: 500,
        effects: { phy_def: 28, mag_def: 29, speed: -6, hp_max: 144, phy_atk: 4 },
        req: { jing: 45 },
        desc: "【板甲】上古天庭镇压域外天魔的圣物，结构中流转着玄天正气，对一切邪法与蛮力皆有极强的镇压之效。"
    },
    {
        id: "head_228",
        name: "寂灭道影面铠", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 23436,
        durability: 500,
        effects: { phy_def: 17, mag_def: 40, speed: -6, hp_max: 144, phy_atk: 4 },
        req: { jing: 45 },
        desc: "【板甲】末法时代寂灭宗的至宝，由凝固的法则残影构成，能令任何攻向脑部的术法归于虚无。"
    },

    // --- [Mid Tier / 中数值] (总防: 72 | HP: 198 | 速: -7 | 物攻: 5 | 售价: 30456) ---
    {
        id: "head_229",
        name: "不朽圣皇钢盔", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 30456,
        durability: 750,
        effects: { phy_def: 50, mag_def: 22, speed: -7, hp_max: 198, phy_atk: 5 },
        req: { jing: 55 },
        desc: "【板甲】不朽皇朝末代大帝的亲征盔。其钢层中融入了真龙骨粉，物理防御力已非凡俗兵刃可破。"
    },
    {
        id: "head_230",
        name: "因果截断重兜", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 30456,
        durability: 750,
        effects: { phy_def: 36, mag_def: 36, speed: -7, hp_max: 198, phy_atk: 5 },
        req: { jing: 55 },
        desc: "【板甲】此盔结构暗合因果循环。任何针对头部的打击都会被其巧妙的力场分散，是全方位防御的神话之作。"
    },
    {
        id: "head_231",
        name: "诸神黄昏之容", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 30456,
        durability: 750,
        effects: { phy_def: 22, mag_def: 50, speed: -7, hp_max: 198, phy_atk: 5 },
        req: { jing: 55 },
        desc: "【板甲】见证了众神陨落的金属面具。面具表面流转着劫火余温，能焚尽一切试图侵入识海的法力。"
    },

    // --- [High Tier / 高数值] (总防: 87 | HP: 252 | 速: -8 | 物攻: 7 | 售价: 36828) ---
    {
        id: "head_232",
        name: "葬神灭世重兜", // 物理防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 36828,
        durability: 999,
        effects: { phy_def: 61, mag_def: 26, speed: -8, hp_max: 252, phy_atk: 7 },
        req: { jing: 65 },
        desc: "【板甲】曾埋葬过神灵的毁灭之盔。其厚重的钢甲之下，跳动着末世的意志，是重型防御的终极顶点。"
    },
    {
        id: "head_233",
        name: "万劫不坏神冕", // 均衡防御
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 36828,
        durability: 999,
        effects: { phy_def: 43, mag_def: 44, speed: -8, hp_max: 252, phy_atk: 7 },
        req: { jing: 65 },
        desc: "【板甲】历经万次纪元劫难而不毁。其坚韧程度已无法用常理解析，佩戴者即意味着获得了绝对的生还权。"
    },
    {
        id: "head_234",
        name: "太始虚空神面", // 法术防御偏向
        type: "head",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 36828,
        durability: 999,
        effects: { phy_def: 26, mag_def: 61, speed: -8, hp_max: 252, phy_atk: 7 },
        req: { jing: 65 },
        desc: "【板甲】由太始年间的虚空碎片打制。不仅能防御法术，更能将袭来的恶意攻击直接放逐到无尽虚空之中。"
    }
];
// Batch 27: Rarity 6 - Head (Heavy / 重甲)
// IDs: head_235 - head_243
// 风格：诸神遗产、末日修仙 - 真武降魔、天策龙魂、混元无极
const head_r6_batch2 = [
    // --- [Low Tier / 低数值] (总防: 48 | HP: 132 | 速: -3 | 物攻: 2 | 售价: 19116) ---
    {
        id: "head_235",
        name: "真武降魔神胄", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 19116,
        durability: 450,
        effects: { phy_def: 36, mag_def: 12, speed: -3, hp_max: 132, phy_atk: 2 },
        req: { jing: 40 },
        desc: "【重甲】北方真武大帝道统传承之物，胄身刻有蛇龟合体之纹。凡间铁锤击之如中棉絮，神威内敛。"
    },
    {
        id: "head_236",
        name: "太极玄功重盔", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 19116,
        durability: 450,
        effects: { phy_def: 24, mag_def: 24, speed: -3, hp_max: 132, phy_atk: 2 },
        req: { jing: 40 },
        desc: "【重甲】以黑白二色奇金属合铸，隐现太极流转之势。能将头部的冲击力完美导引至地脉，防御力臻至化境。"
    },
    {
        id: "head_237",
        name: "避法乌金神冠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 19116,
        durability: 450,
        effects: { phy_def: 12, mag_def: 36, speed: -3, hp_max: 132, phy_atk: 2 },
        req: { jing: 40 },
        desc: "【重甲】以极寒乌金打造，其材质天生排斥五行法力。即便是在末日法潮中，亦能守住佩戴者的一丝清明。"
    },

    // --- [Mid Tier / 中数值] (总防: 60 | HP: 182 | 速: -3 | 物攻: 3 | 售价: 25110) ---
    {
        id: "head_238",
        name: "天策龙魂圣胄", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 25110,
        durability: 650,
        effects: { phy_def: 45, mag_def: 15, speed: -3, hp_max: 182, phy_atk: 3 },
        req: { jing: 52 },
        desc: "【重甲】天策府开国神将遗留的战盔，内嵌一缕真龙残魂。咆哮般的物理撞击在其面前也只能化作龙鸣微声。"
    },
    {
        id: "head_139",
        name: "八荒镇守重面", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 25110,
        durability: 650,
        effects: { phy_def: 30, mag_def: 30, speed: -3, hp_max: 182, phy_atk: 3 },
        req: { jing: 52 },
        desc: "【重甲】曾镇守八荒边界数千载的重型面甲，伤痕累累却从未破碎。每一次受力都证明了其神话级的结构稳定性。"
    },
    {
        id: "head_240",
        name: "玄冥御火神盔", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 25110,
        durability: 650,
        effects: { phy_def: 15, mag_def: 45, speed: -3, hp_max: 182, phy_atk: 3 },
        req: { jing: 52 },
        desc: "【重甲】取极北玄冥冰铁打造，通体透着足以冻结法力的寒意。它能将所有侵袭头部的火焰与光能悉数冻结。"
    },

    // --- [High Tier / 高数值] (总防: 73 | HP: 231 | 速: -4 | 物攻: 5 | 售价: 31806) ---
    {
        id: "head_241",
        name: "霸王摧城金圣盔", // 物理防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 31806,
        durability: 900,
        effects: { phy_def: 55, mag_def: 18, speed: -4, hp_max: 231, phy_atk: 5 },
        req: { jing: 65 },
        desc: "【重甲】拥有绝对霸者气场的神话护具。每一寸精金护板都经过了灭世级锻打，防御力足以无视诸神兵刃。"
    },
    {
        id: "head_242",
        name: "混元无极战神面", // 均衡防御
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 31806,
        durability: 900,
        effects: { phy_def: 36, mag_def: 37, speed: -4, hp_max: 231, phy_atk: 5 },
        req: { jing: 65 },
        desc: "【重甲】融合了混沌开辟时的混元之气，甲身能自动抵消周遭的灵力波动，其全面的防护性能已臻神话之巅。"
    },
    {
        id: "head_243",
        name: "虚空裂纹乌铁神冠", // 法术防御偏向
        type: "head",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 31806,
        durability: 900,
        effects: { phy_def: 18, mag_def: 55, speed: -4, hp_max: 231, phy_atk: 5 },
        req: { jing: 65 },
        desc: "【重甲】冠面布满了极其细微的自然裂纹，能将一切攻来的恶意术法吸入虚无裂缝。法师引以为傲的攻击在此冠面前犹如儿戏。"
    }
];
// Batch 28: Rarity 6 - Head (Light / 轻甲)
// IDs: head_244 - head_252
// 风格：诸神遗产、末日修仙 - 谪仙、劫灰、万古、诸神意识
const head_r6_batch3 = [
    // --- [Low Tier / 低数值] (总防: 38 | HP: 120 | 速: 0 | 售价: 16740) ---
    {
        id: "head_244",
        name: "劫灰渡空神额带", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 16740,
        durability: 400,
        effects: { phy_def: 28, mag_def: 10, speed: 0, hp_max: 120 },
        req: { shen: 40 },
        desc: "【轻甲】由末世劫火之后的余烬编织而成，额带虽显暗淡，却能让佩戴者神识高度集中，如踏空而行般轻盈。"
    },
    {
        id: "head_245",
        name: "溯时流光面具", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 16740,
        durability: 400,
        effects: { phy_def: 19, mag_def: 19, speed: 0, hp_max: 120 },
        req: { shen: 40 },
        desc: "【轻甲】时间残片织就的神圣护面，表面流光不断倒流。它能将头部的受击瞬间“回溯”至未受损的状态。"
    },
    {
        id: "head_246",
        name: "虚溟幻化圣冠", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 16740,
        durability: 400,
        effects: { phy_def: 10, mag_def: 28, speed: 0, hp_max: 120 },
        req: { shen: 40 },
        desc: "【轻甲】以虚溟之界的极光丝线编织。冠身在实体与虚幻间不断切换，令针对脑部的咒法攻击如穿透空气般落空。"
    },

    // --- [Mid Tier / 中数值] (总防: 48 | HP: 165 | 速: 0 | 售价: 21870) ---
    {
        id: "head_247",
        name: "绝云破晓圣战冠", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 21870,
        durability: 600,
        effects: { phy_def: 36, mag_def: 12, speed: 0, hp_max: 165 },
        req: { shen: 55 },
        desc: "【轻甲】取破晓之光与万年天蚕丝合制，锦面坚韧如钢。它承载着破云而出的意志，物理防御力无坚不摧。"
    },
    {
        id: "head_248",
        name: "太苍浮光神发带", // 均衡防御
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 21870,
        durability: 600,
        effects: { phy_def: 24, mag_def: 24, speed: 0, hp_max: 165 },
        req: { shen: 55 },
        desc: "【轻甲】太苍宗祖师遗留的护神发带。流转着远古大地的温润浮光，无论在何种法则混乱的战场，皆能维持识海稳定。"
    },
    {
        id: "head_249",
        name: "灵渊折射圣护面", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 21870,
        durability: 600,
        effects: { phy_def: 12, mag_def: 36, speed: 0, hp_max: 165 },
        req: { shen: 55 },
        desc: "【轻甲】采用灵界深渊底层的晶皮制成。其表面具有完美的灵力折射层，能让禁咒级的术法在佩戴者面前偏转消失。"
    },

    // --- [High Tier / 高数值] (总防: 58 | HP: 210 | 速: 0 | 售价: 27000) ---
    {
        id: "head_250",
        name: "万古神行天冠", // 均衡防御 (High)
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 27000,
        durability: 999,
        effects: { phy_def: 29, mag_def: 29, speed: 0, hp_max: 210 },
        req: { shen: 70 },
        desc: "【轻甲】贯穿了万古仙史的神话天冠。其结构已与天地脉动同调，穿戴者在死斗中依然能保持绝对的从容与优雅。"
    },
    {
        id: "head_251",
        name: "帝御诸界大圣冕", // 法术防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 27000,
        durability: 999,
        effects: { phy_def: 15, mag_def: 43, speed: 0, hp_max: 210 },
        req: { shen: 70 },
        desc: "【轻甲】帝国统治者巡视诸界的至尊冕。完全无视低等界面的法则压制，法术抗性旷古烁今，邪祟不侵。"
    },
    {
        id: "head_252",
        name: "谪仙登天战面", // 物理防御偏向
        type: "head",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 27000,
        durability: 999,
        effects: { phy_def: 43, mag_def: 15, speed: 0, hp_max: 210 },
        req: { shen: 70 },
        desc: "【轻甲】谪仙人重返天界前留下的神物。其物理防御已臻至“神识不灭，肉身不坏”的至高境界，防御之能，无可揣测。"
    }
];
// Batch 29: Rarity 6 - Head (Leather / 皮甲)
// IDs: head_253 - head_261
// 风格：诸神遗产、末日修仙 - 业火红莲、因果杀伐、饕餮吞魔、诸神意志
const head_r6_batch4 = [
    // --- [Low Tier / 低数值] (总防: 28 | HP: 96 | 速: 2 | 物攻: 6 | 暴击: 6 | 售价: 21168) ---
    {
        id: "head_253",
        name: "煞纹杀伐战面", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 21168,
        durability: 350,
        effects: { phy_def: 21, mag_def: 7, speed: 2, hp_max: 96, phy_atk: 6, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】面甲上流转着暗红色的煞纹，那是上古战神杀伐因果凝聚的实相。佩戴后不仅能护住心脉，更能激发无尽斗志。"
    },
    {
        id: "head_254",
        name: "劫灰孤影神面", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 21168,
        durability: 350,
        effects: { phy_def: 14, mag_def: 14, speed: 2, hp_max: 96, phy_atk: 6, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】行走于天地大劫的灰烬之中。此面具以灭绝异兽的残皮制成，在物理冲击与法力余波间达到了诡异的平衡。"
    },
    {
        id: "head_255",
        name: "离魂影革神冠", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 21168,
        durability: 350,
        effects: { phy_def: 7, mag_def: 21, speed: 2, hp_max: 96, phy_atk: 6, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】材质轻薄如魂影，由于长期浸泡在黄泉灵液中，对一切针对脑部神魂的法术攻击有着天然的规避效果。"
    },

    // --- [Mid Tier / 中数值] (总防: 36 | HP: 132 | 速: 2 | 物攻: 9 | 暴击: 9 | 售价: 31050) ---
    {
        id: "head_256",
        name: "业火红莲因果冠", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 31050,
        durability: 480,
        effects: { phy_def: 27, mag_def: 9, speed: 2, hp_max: 132, phy_atk: 9, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】缠绕着红莲业火的绝世皮冠。踏步间因果相随，任何攻击者试图直击头部，都会受到来自宿命的强力反震。"
    },
    {
        id: "head_257",
        name: "寂灭孤星圣面甲", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 31050,
        durability: 480,
        effects: { phy_def: 18, mag_def: 18, speed: 2, hp_max: 132, phy_atk: 9, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】于星辰寂灭的刹那凝成的皮质圣具。它承载了孤星的寂寥，防御性能无懈可击，令佩戴者神识高度冷静。"
    },
    {
        id: "head_258",
        name: "幽冥摄魂圣面罩", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 31050,
        durability: 480,
        effects: { phy_def: 9, mag_def: 27, speed: 2, hp_max: 132, phy_atk: 9, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】采集九幽深处的魔蛟颈皮制成。面具不仅能无视地府罡风，更能将周遭法力波动转化为自身的护体灵力。"
    },

    // --- [High Tier / 高数值] (总防: 44 | HP: 168 | 速: 2 | 物攻: 12 | 暴击: 12 | 售价: 40932) ---
    {
        id: "head_259",
        name: "屠灵断因神冠", // 物理防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 40932,
        durability: 600,
        effects: { phy_def: 33, mag_def: 11, speed: 2, hp_max: 168, phy_atk: 12, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】末代战神屠杀英灵后的封神之作。此冠能够斩断对手的攻击意志，从根本上令针对头部的打击落空。"
    },
    {
        id: "head_260",
        name: "帝道末法孤影面", // 均衡防御
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 40932,
        durability: 600,
        effects: { phy_def: 22, mag_def: 22, speed: 2, hp_max: 168, phy_atk: 12, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】末法时代唯一的至尊面具。它见证了仙路的断绝，穿戴者在末日孤影中依然能维持神灵般的防御力。"
    },
    {
        id: "head_261",
        name: "诸神寂灭因果面具", // 法术防御偏向
        type: "head",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 40932,
        durability: 600,
        effects: { phy_def: 11, mag_def: 33, speed: 2, hp_max: 168, phy_atk: 12, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】上古诸神集体陨落时留下的禁忌面面具。它无视世间一切术法规则，法术防御力已达此界神话极致。"
    }
];
// Batch 30: Rarity 6 - Head (Cloth / 布甲)
// IDs: head_262 - head_270
// 风格：诸神遗产、末日修仙 - 帝玺残光、大罗天御、归墟寂灭
const head_r6_batch5 = [
    // --- [Low Tier / 低数值] (总防: 19 | HP: 72 | 速: 3 | 法攻: 6 | 属性: 6 | 售价: 13932) ---
    {
        id: "head_262",
        name: "帝玺残光圣巾", // 物理防御偏向 (0.75:0.25)
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 13932,
        durability: 300,
        effects: { phy_def: 14, mag_def: 5, speed: 3, hp_max: 72, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】丝线中封存了崩毁帝玺的最后残光。佩戴后如帝王巡世，能以残存的国运抵御任何沉重的物理压制。"
    },
    {
        id: "head_263",
        name: "禁宫幽影圣冕", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 13932,
        durability: 300,
        effects: { phy_def: 10, mag_def: 9, speed: 3, hp_max: 72, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】如同徘徊在虚实边缘的法冕。此冠能让佩戴者的神识在毁灭的道则中悄然穿行，身法与防御达到了极致平衡。"
    },
    {
        id: "head_264",
        name: "九天龙嗣御风冠", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 13932,
        durability: 300,
        effects: { phy_def: 5, mag_def: 14, speed: 3, hp_max: 72, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】传说是为九天龙嗣特制的御风具。布料轻盈如烟，能轻易拨开笼罩在泥丸宫周身的因果术法。"
    },

    // --- [Mid Tier / 中数值] (总防: 25 | HP: 99 | 速: 4 | 法攻: 9 | 属性: 9 | 售价: 20547) ---
    {
        id: "head_265",
        name: "太真无常神冠", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 20547,
        durability: 500,
        effects: { phy_def: 19, mag_def: 6, speed: 4, hp_max: 99, mag_atk: 9, qi: 4, shen: 5 },
        req: { shen: 75 },
        desc: "【布甲】取天地无常之意织就的神袍配套冠饰。其特殊的经纬排布能正面抗衡末世兵戈之气，神识不灭。"
    },
    {
        id: "head_266",
        name: "掌教诛仙圣发箍", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 20547,
        durability: 500,
        effects: { phy_def: 13, mag_def: 12, speed: 4, hp_max: 99, mag_atk: 9, qi: 5, shen: 4 },
        req: { shen: 75 },
        desc: "【布甲】杀伐与出尘共存的神物。发箍中蕴含着截断仙凡的剑意，能将针对头脑的规则级打击拒之门外。"
    },
    {
        id: "head_267",
        name: "寂灭因果神锦巾", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 20547,
        durability: 500,
        effects: { phy_def: 6, mag_def: 19, speed: 4, hp_max: 99, mag_atk: 9, qi: 4, shen: 5 },
        req: { shen: 75 },
        desc: "【布甲】锦面刻满了崩坏的因果符文。能将一切针对脑部的恶念法术强行拖入寂灭，使对手的咒法落空。"
    },

    // --- [High Tier / 高数值] (总防: 29 | HP: 126 | 速: 4 | 法攻: 12 | 属性: 12 | 售价: 26892) ---
    {
        id: "head_268",
        name: "混沌起源神皇冕", // 物理防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 26892,
        durability: 999,
        effects: { phy_def: 22, mag_def: 7, speed: 4, hp_max: 126, mag_atk: 12, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诞生于混沌初开时的原始神冕。它无视空间的重量，防御力在末法时代已近乎神迹，坚固如道。"
    },
    {
        id: "head_269",
        name: "大岁天御圣发冠", // 均衡防御
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 26892,
        durability: 999,
        effects: { phy_def: 15, mag_def: 14, speed: 4, hp_max: 126, mag_atk: 12, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诸天神话之顶点的遗留。其精密的纤维结构能完美平摊任何强度的精神冲击，令佩戴者神台永驻。"
    },
    {
        id: "head_270",
        name: "归墟寂灭绝影冠", // 法术防御偏向
        type: "head",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 26892,
        durability: 999,
        effects: { phy_def: 7, mag_def: 22, speed: 4, hp_max: 126, mag_atk: 12, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诸天归于虚无，因果尽皆终焉。穿戴此冠，漫天法术皆化为虚无幻影，乃是布质护具之终点。"
    }
];

const head = [
    ...head_r1_batch1,
    ...head_r2_batch1,
    ...head_r3_batch1,
    ...head_r4_batch1,
    ...head_r5_batch1,
    ...head_r6_batch1,
    ...head_r1_batch2,
    ...head_r2_batch2,
    ...head_r3_batch2,
    ...head_r4_batch2,
    ...head_r5_batch2,
    ...head_r6_batch2,
    ...head_r1_batch3,
    ...head_r2_batch3,
    ...head_r3_batch3,
    ...head_r4_batch3,
    ...head_r5_batch3,
    ...head_r6_batch3,
    ...head_r1_batch4,
    ...head_r2_batch4,
    ...head_r3_batch4,
    ...head_r4_batch4,
    ...head_r5_batch4,
    ...head_r6_batch4,
    ...head_r1_batch5,
    ...head_r2_batch5,
    ...head_r3_batch5,
    ...head_r4_batch5,
    ...head_r5_batch5,
    ...head_r6_batch5,
];
