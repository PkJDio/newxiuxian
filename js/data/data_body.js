/*
 * =========================================================================================
 * GAME DATA DESIGN: CLOTHES / BODY ARMOR FORMULAS
 * =========================================================================================
 * * 【1. 属性价值换算 Price per Point】(R = 稀有度 1-6)
 * -----------------------------------------------------------------------------------------
 * 1点 防御 (phy_def + mag_def) = 45 * R
 * 1点 速度 (speed)             = 45 * R
 * 1点 生命 (hp_max)            = 9 * R
 * 1点 攻击 (phy_atk + mag_atk) = 45 * R
 * 1点 属性 (jing / qi / shen)  = 90 * R
 * 1点 暴击 (crit)              = 180 * R
 * * 【2. 基准数值区间 Base Stats (R = 稀有度)】
 * -----------------------------------------------------------------------------------------
 * 防御基准 (phy_def + mag_def) : [R*R + 5, 10*R + 20]
 * 速度基准 (speed)             : [R, 2*R]
 * 生命基准 (hp_max)            : [R*40, R*65]
 * 攻击基准 (phy_atk + mag_atk) : [R*3, R*6]
 * 暴击/属性基准 (crit / attr)   : [R*1, R*2]
 * * 【3. 护甲类型修正系数 Type Modifiers】
 * -----------------------------------------------------------------------------------------
 * 类型  | 防御系数 | HP系数 | 速度系数 | 额外属性加成
 * -----------------------------------------------------------------------------------------
 * 板甲  | 1.8x     | 1.5x   | -2.0x    | phy_atk + 0.5x 基准攻击
 * 重甲  | 1.3x     | 1.25x  | -1.0x    | phy_atk + 0.25x 基准攻击
 * 轻甲  | 1.0x     | 1.0x   |  0x      | (标准均衡型)
 * 皮甲  | 0.75x    | 0.75x  |  0.25x   | phy_atk + 1.0x 基准攻击, 1.0x 基准暴击
 * 布甲  | 0.5x     | 0.5x   |  0.5x    | mag_atk + 1.0x 基准攻击, qi+shen + 1.0x 基准属性
 * -----------------------------------------------------------------------------------------
 * * 【4. 字段说明 Fields Reference】
 * -----------------------------------------------------------------------------------------
 * phy_def: 物理防御, mag_def: 法术防御
 * phy_atk: 物理攻击, mag_atk: 法术攻击
 * speed: 速度, hp_max: 生命值上限
 * crit: 物理暴击率 mag_crit: 法术暴击率, jing/qi/shen: 精/气/神
 * =========================================================================================
 */
// Batch 1: Rarity 1 - Body Armor (Plate / 板甲)
// IDs: body_001 - body_009
const body_r1_batch1 = [
    // --- [Low Tier] R1 板甲 (总防: 11 | HP: 60 | 速: -2 | 物攻: 2 | 售价: 1035) ---
    {
        id: "body_001",
        name: "锈迹铁板甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 1035,
        durability: 40,
        effects: { phy_def: 8, mag_def: 3, speed: -2, hp_max: 60, phy_atk: 2 },

        desc: "【板甲】由几块锈迹斑斑的生铁片粗暴铆接而成，不仅沉重，还会磨损内衬的衣物。"
    },
    {
        id: "body_002",
        name: "旧板修补铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 1035,
        durability: 40,
        effects: { phy_def: 6, mag_def: 5, speed: -2, hp_max: 60, phy_atk: 2 },

        desc: "【板甲】原本是某种甲胄的残片，被后来者用铁丝强行修补在一起，防御尚可但结构松散。"
    },
    {
        id: "body_003",
        name: "废矿衬铁衣", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 1035,
        durability: 40,
        effects: { phy_def: 3, mag_def: 8, speed: -2, hp_max: 60, phy_atk: 2 },

        desc: "【板甲】在厚布衣上缝制了许多废弃矿渣，虽然看起来杂乱无章，却对微弱的法术冲击有奇效。"
    },

    // --- [Mid Tier] R1 板甲 (总防: 32 | HP: 78 | 速: -3 | 物攻: 2 | 售价: 2097) ---
    {
        id: "body_004",
        name: "粗锻生铁甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 2097,
        durability: 55,
        effects: { phy_def: 24, mag_def: 8, speed: -3, hp_max: 78, phy_atk: 2 },

        desc: "【板甲】乡村铁匠为了模仿军甲而打制的生铁甲，厚度惊人，能抵御一般的棍棒劈砍。"
    },
    {
        id: "body_005",
        name: "积尘卫戍铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 2097,
        durability: 55,
        effects: { phy_def: 16, mag_def: 16, speed: -3, hp_max: 78, phy_atk: 2 },

        desc: "【板甲】在库房角落积满灰尘的旧卫戍甲，皮革带已变脆，但主体钢板依然能护住心口。"
    },
    {
        id: "body_006",
        name: "沁油黑铁衣", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 2097,
        durability: 55,
        effects: { phy_def: 8, mag_def: 24, speed: -3, hp_max: 78, phy_atk: 2 },

        desc: "【板甲】用浸过黑油的废旧铁片编织而成，不仅能防水，似乎还能折射部分细微的咒力。"
    },

    // --- [High Tier] R1 板甲 (总防: 54 | HP: 98 | 速: -4 | 物攻: 3 | 售价: 3267) ---
    {
        id: "body_007",
        name: "沉泥厚铁铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 3267,
        durability: 70,
        effects: { phy_def: 41, mag_def: 13, speed: -4, hp_max: 98, phy_atk: 3 },

        desc: "【板甲】沾满干涸沉泥的厚重铁铠，防御力极高，由于长期埋在地下，变得冰冷且死气沉沉。"
    },
    {
        id: "body_008",
        name: "百纳叠板甲", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 3267,
        durability: 70,
        effects: { phy_def: 27, mag_def: 27, speed: -4, hp_max: 98, phy_atk: 3 },

        desc: "【板甲】采用数百个大小不一的铁片层叠拼接而成的护甲，虽然做工凌乱，但其坚固程度令人意外。"
    },
    {
        id: "body_009",
        name: "蚀刻废钢铠", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 1,
        value: 3267,
        durability: 70,
        effects: { def: 13, mag_def: 41, speed: -4, hp_max: 98, phy_atk: 3 },

        desc: "【板甲】残损的废钢板上残留着模糊的蚀刻痕迹，或许曾是某种高级护具，依然残留着御法之力。"
    }
];
// Batch 2: Rarity 1 - Body Armor (Heavy / 重甲)
// IDs: body_010 - body_018
const body_r1_batch2 = [
    // --- [Low Tier] R1 重甲 (总防: 8 | HP: 50 | 速: -1 | 物攻: 1 | 售价: 810) ---
    {
        id: "body_010",
        name: "裂皮缀铁护胸", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 810,
        durability: 35,
        effects: { phy_def: 6, mag_def: 2, speed: -1, hp_max: 50, phy_atk: 1 },
        req: {},
        desc: "【重甲】在开裂的老皮甲上随意缀了几块碎铁，护住了心口要害，但也仅此而已。"
    },
    {
        id: "body_011",
        name: "粗皮杂甲衣", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 810,
        durability: 35,
        effects: { phy_def: 4, mag_def: 4, speed: -1, hp_max: 50, phy_atk: 1 },
        req: {},
        desc: "【重甲】用杂乱的皮革与碎金属片拼凑而成的背心，虽然卖相极差，但穿在身上还算扎实。"
    },
    {
        id: "body_012",
        name: "浸水重皮坎肩", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 810,
        durability: 35,
        effects: { phy_def: 2, mag_def: 6, speed: -1, hp_max: 50, phy_atk: 1 },
        req: {},
        desc: "【重甲】因受潮而发硬变黑的重型皮甲，散发着一股怪味，却意外地对某些阴邪气息有抵御作用。"
    },

    // --- [Mid Tier] R1 重甲 (总防: 23 | HP: 65 | 速: -2 | 物攻: 1 | 售价: 1575) ---
    {
        id: "body_013",
        name: "旧缝熟皮甲", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 1575,
        durability: 45,
        effects: { phy_def: 17, mag_def: 6, speed: -2, hp_max: 65, phy_atk: 1 },

        desc: "【重甲】原本是正规军的皮甲，因年久失修被淘汰。重新缝合后的熟皮依然坚韧，能挡住普通流弹。"
    },
    {
        id: "body_014",
        name: "补丁重革衣", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 1575,
        durability: 45,
        effects: { phy_def: 12, mag_def: 11, speed: -2, hp_max: 65, phy_atk: 1 },

        desc: "【重甲】打满了各色皮革补丁的重装护甲，每一处补丁都代表着一次死里逃生。"
    },
    {
        id: "body_015",
        name: "烟熏避毒皮甲", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 1575,
        durability: 45,
        effects: { phy_def: 6, mag_def: 17, speed: -2, hp_max: 65, phy_atk: 1 },

        desc: "【重甲】用陈年草药反复烟熏过的厚皮甲，颜色斑驳，能有效削弱林间瘴气与微弱咒法。"
    },

    // --- [High Tier] R1 重甲 (总防: 39 | HP: 81 | 速: -2 | 物攻: 2 | 售价: 2484) ---
    {
        id: "body_016",
        name: "泥斑厚革铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 2484,
        durability: 60,
        effects: { phy_def: 29, mag_def: 10, speed: -2, hp_max: 81, phy_atk: 2 },

        desc: "【重甲】干涸泥浆包裹下的厚重皮铠，坚硬如石。这种泥土与皮革的结合体防御力惊人。"
    },
    {
        id: "body_017",
        name: "废旧校尉皮甲", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 2484,
        durability: 60,
        effects: { phy_def: 20, mag_def: 19, speed: -2, hp_max: 81, phy_atk: 2 },

        desc: "【重甲】曾经是某位底层校尉的甲胄，虽已失去往日光泽且满是划痕，但用料确实不凡。"
    },
    {
        id: "body_018",
        name: "枯木镶皮甲", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 2484,
        durability: 60,
        effects: { phy_def: 10, mag_def: 29, speed: -2, hp_max: 81, phy_atk: 2 },

        desc: "【重甲】在厚皮间镶嵌了风干的古木片，整体显得有些笨拙，但对五行术法有奇特的隔绝效果。"
    }
];
// Batch 3: Rarity 1 - Body Armor (Light / 轻甲)
// IDs: body_019 - body_027
const body_r1_batch3 = [
    // --- [Low Tier] R1 轻甲 (总防: 6 | HP: 40 | 速: 0 | 售价: 630) ---
    {
        id: "body_019",
        name: "风干兔皮袄", // 物理防御偏向 (0.75:0.25)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 630,
        durability: 25,
        effects: { phy_def: 5, mag_def: 1, speed: 0, hp_max: 40 },

        desc: "【轻甲】几张风干的小兽皮拼成的小褂，虽然挡不住刀剑，但勉强能遮风挡雨。"
    },
    {
        id: "body_020",
        name: "脱色猎人甲", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 630,
        durability: 25,
        effects: { phy_def: 3, mag_def: 3, speed: 0, hp_max: 40 },

        desc: "【轻甲】颜色已经褪尽的皮质背心，内衬了几块烂棉花，穿起来还算轻便。"
    },
    {
        id: "body_021",
        name: "受潮软皮衬", // 法术防御偏向 (0.25:0.75)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 630,
        durability: 25,
        effects: { phy_def: 1, mag_def: 5, speed: 0, hp_max: 40 },

        desc: "【轻甲】长期存放在地窖中的软皮护甲，皮质由于发霉而变得有些粘稠，却意外能阻隔灵气。"
    },

    // --- [Mid Tier] R1 轻甲 (总防: 18 | HP: 52 | 速: 0 | 售价: 1278) ---
    {
        id: "body_022",
        name: "硬化老皮胸甲", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1278,
        durability: 35,
        effects: { phy_def: 14, mag_def: 4, speed: 0, hp_max: 52 },

        desc: "【轻甲】用火烤硬后的老牛皮护具，虽然边角有些开裂，但足以护住前胸。"
    },
    {
        id: "body_023",
        name: "旧缝游骑坎肩", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1278,
        durability: 35,
        effects: { phy_def: 9, mag_def: 9, speed: 0, hp_max: 52 },

        desc: "【轻甲】原本是游骑兵的内衬护甲，皮革虽已磨薄，但做工还算紧密。"
    },
    {
        id: "body_024",
        name: "刻痕灵鹿短甲", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1278,
        durability: 35,
        effects: { phy_def: 4, mag_def: 14, speed: 0, hp_max: 52 },

        desc: "【轻甲】甲面上刻有模糊的符文痕迹，采用灵鹿皮制成，即便破烂不堪仍有灵气残留。"
    },

    // --- [High Tier] R1 轻甲 (总防: 30 | HP: 65 | 速: 0 | 售价: 1935) ---
    {
        id: "body_025",
        name: "沉水厚皮铠", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1935,
        durability: 45,
        effects: { phy_def: 23, mag_def: 7, speed: 0, hp_max: 65 },

        desc: "【轻甲】长期浸泡在水中的厚兽皮制成的甲胄，虽然沉重，但坚韧度惊人。"
    },
    {
        id: "body_026",
        name: "补丁行伍护心甲", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1935,
        durability: 45,
        effects: { phy_def: 15, mag_def: 15, speed: 0, hp_max: 65 },

        desc: "【轻甲】用几块大块皮革补丁强行修缮的护心甲，虽是拼凑货，但在军中已是难得的防具。"
    },
    {
        id: "body_027",
        name: "斑驳古兽皮衣", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 1,
        value: 1935,
        durability: 45,
        effects: { phy_def: 7, mag_def: 23, speed: 0, hp_max: 65 },

        desc: "【轻甲】皮面上长满了怪异的斑点，是一件年代极其久远的古兽皮衣，对法术有着天然的迟滞感。"
    }
];
// Batch 4: Rarity 1 - Body Armor (Leather / 皮甲)
// IDs: body_028 - body_036
const body_r1_batch4 = [
    // --- [Low Tier] R1 皮甲 (总防: 4 | HP: 30 | 速: 0 | 攻: 3 | 暴: 1 | 售价: 936) ---
    {
        id: "body_028",
        name: "杂碎皮拼接甲", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 936,
        durability: 30,
        effects: { phy_def: 3, mag_def: 1, speed: 0, hp_max: 30, phy_atk: 3, crit: 1 },

        desc: "【皮甲】用各种动物的碎皮革缝补而成的坎肩，边缘参差不齐，穿在身上略显臃肿。"
    },
    {
        id: "body_029",
        name: "粗糙老革背心", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 936,
        durability: 30,
        effects: { phy_def: 2, mag_def: 2, speed: 0, hp_max: 30, phy_atk: 3, crit: 1 },

        desc: "【皮甲】一张完整的老皮简单对折裁剪出的背心，没有经过充分硝制，摸起来甚至有些刺手。"
    },
    {
        id: "body_030",
        name: "褪色蛇皮短衣", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 936,
        durability: 30,
        effects: { phy_def: 1, mag_def: 3, speed: 0, hp_max: 30, phy_atk: 3, crit: 1 },

        desc: "【皮甲】鳞片已经脱落大半的蛇皮短衣，虽然防不住刀箭，但对湿冷的邪气有一定隔绝。"
    },

    // --- [Mid Tier] R1 皮甲 (总防: 14 | HP: 39 | 速: 1 | 攻: 4 | 暴: 1 | 售价: 1530) ---
    {
        id: "body_031",
        name: "开裂硬化皮甲", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1530,
        durability: 40,
        effects: { phy_def: 10, mag_def: 4, speed: 1, hp_max: 39, phy_atk: 4, crit: 1 },

        desc: "【皮甲】表面布满细碎裂纹的硬化皮甲，虽然皮质发脆，但在近身格斗中尚能起到保护作用。"
    },
    {
        id: "body_032",
        name: "旧缝山猫皮甲", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1530,
        durability: 40,
        effects: { phy_def: 7, mag_def: 7, speed: 1, hp_max: 39, phy_atk: 4, crit: 1 },

        desc: "【皮甲】采用山猫皮缝制的轻便甲衣，虽然绒毛已经掉光，但极佳的柔韧性不阻碍任何动作。"
    },
    {
        id: "body_033",
        name: "斑驳灵皮坎肩", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1530,
        durability: 40,
        effects: { phy_def: 4, mag_def: 10, speed: 1, hp_max: 39, phy_atk: 4, crit: 1 },

        desc: "【皮甲】皮面上布满深色斑点的古旧坎肩，那是被法术灼烧后留下的痕迹，依然带有微弱抗性。"
    },

    // --- [High Tier] R1 皮甲 (总防: 23 | HP: 49 | 速: 1 | 攻: 6 | 暴: 2 | 售价: 2133) ---
    {
        id: "body_034",
        name: "蛮力犀革铠", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 2133,
        durability: 50,
        effects: { phy_def: 17, mag_def: 6, speed: 1, hp_max: 49, phy_atk: 6, crit: 2 },

        desc: "【皮甲】用极其厚实的犀牛皮拼凑出的甲胄，质地粗糙但异常坚韧，能给人提供勇武的信心。"
    },
    {
        id: "body_035",
        name: "老旧游侠皮装", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 2133,
        durability: 50,
        effects: { phy_def: 12, mag_def: 11, speed: 1, hp_max: 49, phy_atk: 6, crit: 2 },

        desc: "【皮甲】一套早已过时的游侠皮装，到处是修补的针脚，但穿上它仿佛能感受到前人的经验。"
    },
    {
        id: "body_036",
        name: "刻符干瘪皮衣", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 1,
        value: 2133,
        durability: 50,
        effects: { phy_def: 6, mag_def: 17, speed: 1, hp_max: 49, phy_atk: 6, crit: 2 },

        desc: "【皮甲】干瘪萎缩的皮革表面刻着杂乱的符文，虽然难看，却能在关键时刻偏转流弹。"
    }
];
// Batch 5: Rarity 1 - Body Armor (Cloth / 布甲)
// IDs: body_037 - body_045
const body_r1_batch5 = [
    // --- [Low Tier] R1 布甲 (总防: 3 | HP: 20 | 速: 1 | 攻: 3 | 属性: 1 | 售价: 585) ---
    {
        id: "body_037",
        name: "粗麻旧布袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 585,
        durability: 15,
        effects: { phy_def: 2, mag_def: 1, speed: 1, hp_max: 20, mag_atk: 3, qi: 1 },

        desc: "【布甲】庄稼汉穿烂了的粗麻袍子，虽然满是汗味和泥土，但至少能遮体。"
    },
    {
        id: "body_038",
        name: "纳补百结衣", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 585,
        durability: 15,
        effects: { phy_def: 1, mag_def: 2, speed: 1, hp_max: 20, mag_atk: 3, shen: 1 },

        desc: "【布甲】东拼西凑缝出来的百结衣，线头凌乱，穿在身上轻飘飘的。"
    },
    {
        id: "body_039",
        name: "褪色陈年褂", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 585,
        durability: 15,
        effects: { phy_def: 1, mag_def: 2, speed: 1, hp_max: 20, mag_atk: 3, qi: 1 },

        desc: "【布甲】挂在深山老林里多年的旧短褂，颜色早已褪尽，隐约有一股淡淡的檀香味。"
    },

    // --- [Mid Tier] R1 布甲 (总防: 9 | HP: 26 | 速: 1 | 攻: 4 | 属性: 1 | 售价: 954) ---
    {
        id: "body_040",
        name: "浆洗破洞衫", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 954,
        durability: 20,
        effects: { phy_def: 7, mag_def: 2, speed: 1, hp_max: 26, mag_atk: 4, qi: 1 },

        desc: "【布甲】虽然洗得干净，但咯肢窝和肘部都有明显的破洞。布料在反复浆洗后变得有些生硬。"
    },
    {
        id: "body_041",
        name: "行脚僧残袍", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 954,
        durability: 20,
        effects: { phy_def: 4, mag_def: 5, speed: 1, hp_max: 26, mag_atk: 4, shen: 1 },

        desc: "【布甲】不知哪位行脚僧留下的残破僧袍，布质虽然普通，但由于长期持诵，似乎带了点正气。"
    },
    {
        id: "body_042",
        name: "灰扑扑葛布袍", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 954,
        durability: 20,
        effects: { phy_def: 2, mag_def: 7, speed: 1, hp_max: 26, mag_atk: 4, qi: 1 },

        desc: "【布甲】山间常见的葛布织成的旧袍子，沾满了炉火的灰烬，能阻挡一部分法术波动。"
    },

    // --- [High Tier] R1 布甲 (总防: 15 | HP: 32 | 速: 1 | 攻: 6 | 属性: 2 | 售价: 1458) ---
    {
        id: "body_043",
        name: "发黄麻纹道袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 1458,
        durability: 25,
        effects: { phy_def: 11, mag_def: 4, speed: 1, hp_max: 32, mag_atk: 6, qi: 1, shen: 1 },

        desc: "【布甲】原本可能是白色的道袍，如今已泛黄严重，麻织的纹理中藏着些许干涸的朱砂印。"
    },
    {
        id: "body_044",
        name: "旧锦修补长衫", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 1458,
        durability: 25,
        effects: { phy_def: 7, mag_def: 8, speed: 1, hp_max: 32, mag_atk: 6, qi: 1, shen: 1 },

        desc: "【布甲】曾是富贵人家穿的锦绣衫，落魄后打了不少粗布补丁，虽然丑了点，但底子还在。"
    },
    {
        id: "body_045",
        name: "灵丝断裂法衣", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 1458,
        durability: 25,
        effects: { phy_def: 4, mag_def: 11, speed: 1, hp_max: 32, mag_atk: 6, qi: 1, shen: 1 },

        desc: "【布甲】内部的法力丝线多处断裂，无法再发挥法宝的威力，但这层破灵布依然比普通麻布更能抗咒。"
    }
];
// Batch 6: Rarity 2 - Body Armor (Plate / 板甲)
// IDs: body_046 - body_054
const body_r2_batch1 = [
    // --- [Low Tier] R2 板甲 (总防: 16 | HP: 120 | 速: -4 | 攻: 3 | 售价: 2520) ---
    {
        id: "body_046",
        name: "旧式黑铁胸甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 2520,
        durability: 50,
        effects: { phy_def: 12, mag_def: 4, speed: -4, hp_max: 120, phy_atk: 3 },

        desc: "【板甲】款式老旧的黑铁胸甲，虽然外层有些磕碰痕迹，但整体锻造工艺依然能护住躯干。"
    },
    {
        id: "body_047",
        name: "翻新卫戍板甲", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 2520,
        durability: 50,
        effects: { phy_def: 8, mag_def: 8, speed: -4, hp_max: 120, phy_atk: 3 },

        desc: "【板甲】从军需库清出来的备用翻新货，重新更换了连接处的皮革，虽然有些迟钝感，但很稳固。"
    },
    {
        id: "body_048",
        name: "过时青石重衣", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 2520,
        durability: 50,
        effects: { phy_def: 4, mag_def: 12, speed: -4, hp_max: 120, phy_atk: 3 },

        desc: "【板甲】鞋底镶嵌工艺平移到了护心镜上，采用了特殊的青石粉末混合铁汁浇筑，对灵气压制有一定作用。"
    },

    // --- [Mid Tier] R2 板甲 (总防: 43 | HP: 163 | 速: -6 | 攻: 4 | 售价: 6804) ---
    {
        id: "body_049",
        name: "熟铁叠鳞铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 6804,
        durability: 65,
        effects: { phy_def: 32, mag_def: 11, speed: -6, hp_max: 163, phy_atk: 4 },

        desc: "【板甲】采用熟铁片层叠制成的鳞甲，虽然甲片边缘由于老化不再锋利，但由于防御面广，防护极佳。"
    },
    {
        id: "body_050",
        name: "粗工钢制甲", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 6804,
        durability: 65,
        effects: { phy_def: 22, mag_def: 21, speed: -6, hp_max: 163, phy_atk: 4 },

        desc: "【板甲】小作坊出品的钢甲，由于炭火控制不稳导致钢质不纯，但也因此产生了奇异的攻守平衡感。"
    },
    {
        id: "body_051",
        name: "受潮符刻板甲", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 6804,
        durability: 65,
        effects: { phy_def: 11, mag_def: 32, speed: -6, hp_max: 163, phy_atk: 4 },

        desc: "【板甲】这是一套在潮湿库房存放了很久的符文甲，虽然符文已被铁锈侵蚀大半，但残存的隔膜依然有效。"
    },

    // --- [High Tier] R2 板甲 (总防: 72 | HP: 203 | 速: -8 | 攻: 6 | 售价: 10116) ---
    {
        id: "body_052",
        name: "重铸步卒钢铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 10116,
        durability: 80,
        effects: { phy_def: 54, mag_def: 18, speed: -8, hp_max: 203, phy_atk: 6 },

        desc: "【板甲】将多套破损的步卒铠甲熔炼重铸而成的产物，牺牲了所有的舒适度，只求那一身厚实的铁皮。"
    },
    {
        id: "body_053",
        name: "无名校尉残甲", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 10116,
        durability: 80,
        effects: { phy_def: 36, mag_def: 36, speed: -8, hp_max: 203, phy_atk: 6 },

        desc: "【板甲】剥落了铭牌的校尉级甲胄，甲面虽然暗淡无光，但由于使用了较好的铁胚，防御极其全面。"
    },
    {
        id: "body_054",
        name: "废弃镶金护甲", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 2,
        value: 10116,
        durability: 80,
        effects: { phy_def: 18, mag_def: 54, speed: -8, hp_max: 203, phy_atk: 6 },

        desc: "【板甲】曾经镶嵌过金箔的护甲，金饰已被刮走，但残留的工艺孔道仍能引导法力余波，起到卸力作用。"
    }
];
// Batch 7: Rarity 2 - Body Armor (Heavy / 重甲)
// IDs: body_055 - body_063
const body_r2_batch2 = [
    // --- [Low Tier] R2 重甲 (总防: 12 | HP: 100 | 速: -2 | 攻: 1 | 售价: 2880) ---
    {
        id: "body_055",
        name: "旧铁掌重革衣", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 2880,
        durability: 45,
        effects: { phy_def: 9, mag_def: 3, speed: -2, hp_max: 100, phy_atk: 1 },

        desc: "【重甲】在厚实的旧皮革上加装了铁质护掌片，虽然款式过时且有些压身，但防御相当稳健。"
    },
    {
        id: "body_056",
        name: "磨损步兵重甲", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 2880,
        durability: 45,
        effects: { phy_def: 6, mag_def: 6, speed: -2, hp_max: 100, phy_atk: 1 },

        desc: "【重甲】正规军步兵营淘汰下来的二手工装，皮革由于保养不当而发硬，但金属卡扣依然牢固。"
    },
    {
        id: "body_057",
        name: "污浊青铜护胸", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 2880,
        durability: 45,
        effects: { phy_def: 3, mag_def: 9, speed: -2, hp_max: 100, phy_atk: 1 },

        desc: "【重甲】表面覆盖着一层灰绿色的铜锈，这是一件勉强还能使用的古旧青铜器，对法力流动有阻滞感。"
    },

    // --- [Mid Tier] R2 重甲 (总防: 31 | HP: 131 | 速: -4 | 攻: 2 | 售价: 5121) ---
    {
        id: "body_058",
        name: "翻新镶钉重甲", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 5121,
        durability: 55,
        effects: { phy_def: 23, mag_def: 8, speed: -4, hp_max: 131, phy_atk: 2 },

        desc: "【重甲】经过工坊简单翻新的重型甲衣，松动的钢钉已被重新铆接，整体透着一股粗犷的金属味。"
    },
    {
        id: "body_059",
        name: "老式行伍皮铠", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 5121,
        durability: 55,
        effects: { phy_def: 16, mag_def: 15, speed: -4, hp_max: 131, phy_atk: 2 },

        desc: "【重甲】老军士退役时带回的皮铠，由于多次修补显得厚薄不一，但在实战中表现非常均衡。"
    },
    {
        id: "body_060",
        name: "蒙尘避邪重装", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 5121,
        durability: 55,
        effects: { phy_def: 8, mag_def: 23, speed: -4, hp_max: 131, phy_atk: 2 },

        desc: "【重甲】在皮革内里缝入了辟邪药渣的重装，虽然已经存放了很久且落满灰尘，法术防御力依然卓越。"
    },

    // --- [High Tier] R2 重甲 (总防: 52 | HP: 163 | 速: -6 | 攻: 3 | 售价: 7605) ---
    {
        id: "body_061",
        name: "缺口精铁重铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 7605,
        durability: 70,
        effects: { phy_def: 39, mag_def: 13, speed: -6, hp_max: 163, phy_atk: 3 },

        desc: "【重甲】曾是精铁打造的上好甲胄，腹部的巨大缺口被用粗铁板补上，沉重而坚实，勉强可堪大用。"
    },
    {
        id: "body_062",
        name: "二手伍长战甲", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 7605,
        durability: 70,
        effects: { phy_def: 26, mag_def: 26, speed: -6, hp_max: 163, phy_atk: 3 },

        desc: "【重甲】战场收缴回来的二手伍长甲，甲面伤痕累累，但每一道伤疤都证明了这件衣服的可靠。"
    },
    {
        id: "body_063",
        name: "暗淡灵纹重护", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 7605,
        durability: 70,
        effects: { phy_def: 13, mag_def: 39, speed: -6, hp_max: 163, phy_atk: 3 },

        desc: "【重甲】护胫和护肩上的灵纹已经由于年久而变得暗淡，但重型材质本身对法术冲击的吸收力依然很强。"
    }
];
// Batch 8: Rarity 2 - Body Armor (Light / 轻甲)
// IDs: body_064 - body_072
const body_r2_batch3 = [
    // --- [Low Tier] R2 轻甲 (总防: 9 | HP: 80 | 速: 0 | 售价: 2250) ---
    {
        id: "body_064",
        name: "褪色熟皮短甲", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 2250,
        durability: 40,
        effects: { phy_def: 7, mag_def: 2, speed: 0, hp_max: 80 },

        desc: "【轻甲】经过多次浆洗而颜色黯淡的熟皮短甲，虽然皮质有些缩水，但护住心脉绰绰有余。"
    },
    {
        id: "body_065",
        name: "磨损巡哨短衫", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 2250,
        durability: 40,
        effects: { phy_def: 5, mag_def: 4, speed: 0, hp_max: 80 },

        desc: "【轻甲】原本是斥候营的配发服饰，由于长期在林间穿行，布面和皮扣都有明显的磨损痕迹。"
    },
    {
        id: "body_066",
        name: "暗淡异兽皮衬", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 2250,
        durability: 40,
        effects: { phy_def: 2, mag_def: 7, speed: 0, hp_max: 80 },

        desc: "【轻甲】这种小兽皮曾因法力而光鲜，如今已变得灰扑扑的，好在基本的法术阻隔能力还在。"
    },

    // --- [Mid Tier] R2 轻甲 (总防: 24 | HP: 105 | 速: 0 | 售价: 4050) ---
    {
        id: "body_067",
        name: "老旧硬革护胸", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 4050,
        durability: 50,
        effects: { phy_def: 18, mag_def: 6, speed: 0, hp_max: 105 },

        desc: "【轻甲】采用硬皮层叠而成的护胸，虽然边缘有些皲裂，但扎实的厚度能抵挡利刃的划刺。"
    },
    {
        id: "body_068",
        name: "二手走马皮甲", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 4050,
        durability: 50,
        effects: { phy_def: 12, mag_def: 12, speed: 0, hp_max: 105 },

        desc: "【轻甲】这种走马皮甲由于合脚耐穿，在旧货摊上很受欢迎，虽然皮面斑驳，但依然紧凑。"
    },
    {
        id: "body_069",
        name: "陈旧刻纹皮袄", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 4050,
        durability: 50,
        effects: { phy_def: 6, mag_def: 18, speed: 0, hp_max: 105 },

        desc: "【轻甲】皮面上刻着的法阵纹路由于缺乏保养而模糊不清，即便如此，它在阻断法力上依然有效。"
    },

    // --- [High Tier] R2 轻甲 (总防: 40 | HP: 130 | 速: 0 | 售价: 5940) ---
    {
        id: "body_070",
        name: "沉水老牛皮铠", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 5940,
        durability: 60,
        effects: { phy_def: 30, mag_def: 10, speed: 0, hp_max: 130 },

        desc: "【轻甲】用陈年老牛皮在水中反复浸润阴干而成的皮铠，质感厚重且富有韧性，防御力相当可观。"
    },
    {
        id: "body_071",
        name: "翻新资深游侠服", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 5940,
        durability: 60,
        effects: { phy_def: 20, mag_def: 20, speed: 0, hp_max: 130 },

        desc: "【轻甲】资深武者穿过的旧甲，经过简单的加固和上油，虽然满是划痕，但保护性能非常全面。"
    },
    {
        id: "body_072",
        name: "蒙尘灵纹皮甲", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 2,
        value: 5940,
        durability: 60,
        effects: { phy_def: 10, mag_def: 30, speed: 0, hp_max: 130 },

        desc: "【轻甲】蒙尘已久的灵皮甲，虽然其原有的光泽已不再，但针对五行法术的吸纳效果依然属于上品。"
    }
];
// Batch 9: Rarity 2 - Body Armor (Leather / 皮甲)
// IDs: body_073 - body_081
const body_r2_batch4 = [
    // --- [Low Tier] R2 皮甲 (总防: 7 | HP: 60 | 速: 1 | 攻: 6 | 暴: 2 | 售价: 3060) ---
    {
        id: "body_073",
        name: "褪色狼皮背心", // 物理防御偏向 (0.75:0.25)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3060,
        durability: 35,
        effects: { phy_def: 5, mag_def: 2, speed: 1, hp_max: 60, phy_atk: 6, crit: 2 },

        desc: "【皮甲】原本深青色的狼皮已经褪成了土灰色，皮质有些发硬，好在还能勉强护住心窝。"
    },
    {
        id: "body_074",
        name: "开裂鹿皮短甲", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3060,
        durability: 35,
        effects: { phy_def: 4, mag_def: 3, speed: 1, hp_max: 60, phy_atk: 6, crit: 2 },

        desc: "【皮甲】轻便的鹿皮短甲，侧面由于干燥出现了不少细小的皲裂纹，穿着时需得小心避水。"
    },
    {
        id: "body_075",
        name: "二手蛇皮猎衣", // 法术防御偏向 (0.25:0.75)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3060,
        durability: 35,
        effects: { phy_def: 2, mag_def: 5, speed: 1, hp_max: 60, phy_atk: 6, crit: 2 },

        desc: "【皮甲】前任主人留下的蛇皮猎衣，鳞片由于磨损不再光滑，但其特有的韧性仍能化解部分法力冲击。"
    },

    // --- [Mid Tier] R2 皮甲 (总防: 18 | HP: 79 | 速: 1 | 攻: 9 | 暴: 3 | 售价: 5022) ---
    {
        id: "body_076",
        name: "翻新硬革护甲", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 5022,
        durability: 45,
        effects: { phy_def: 14, mag_def: 4, speed: 1, hp_max: 79, phy_atk: 9, crit: 3 },

        desc: "【皮甲】经过工坊简单翻新的硬革胸甲，加厚了连接处的缝线，虽然样式笨拙，但实战防御力不错。"
    },
    {
        id: "body_077",
        name: "浆洗走山皮装", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 5022,
        durability: 45,
        effects: { phy_def: 9, mag_def: 9, speed: 1, hp_max: 79, phy_atk: 9, crit: 3 },

        desc: "【皮甲】多次浆洗使得这件皮装略显薄脆，但在山地穿行中依然能提供稳定的灵敏度与基本的防护。"
    },
    {
        id: "body_078",
        name: "陈年野猪皮袄", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 5022,
        durability: 45,
        effects: { phy_def: 5, mag_def: 13, speed: 1, hp_max: 79, phy_atk: 9, crit: 3 },

        desc: "【皮甲】这种老野猪皮袄因皮质厚实且带有微量兽魂气息，常被用来制作对抗低阶法术的简易防具。"
    },

    // --- [High Tier] R2 皮甲 (总防: 30 | HP: 98 | 速: 1 | 攻: 12 | 暴: 4 | 售价: 7074) ---
    {
        id: "body_079",
        name: "剥蚀青牛皮铠", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 7074,
        durability: 60,
        effects: { phy_def: 23, mag_def: 7, speed: 1, hp_max: 98, phy_atk: 12, crit: 4 },

        desc: "【皮甲】用坚韧的青牛皮制成，表面因长期摩擦而变得斑驳不平，但其防劈砍的本色依然属于皮甲中的上品。"
    },
    {
        id: "body_080",
        name: "资深巡林客旧甲", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 7074,
        durability: 60,
        effects: { phy_def: 15, mag_def: 15, speed: 1, hp_max: 98, phy_atk: 12, crit: 4 },

        desc: "【皮甲】老练的巡林客变卖的旧装备，虽然护心处有修补痕迹，但每一寸皮革都经过了实战的检验。"
    },
    {
        id: "body_081",
        name: "斑驳幻兽皮衣", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 2,
        value: 7074,
        durability: 60,
        effects: { phy_def: 8, mag_def: 22, speed: 1, hp_max: 98, phy_atk: 12, crit: 4 },

        desc: "【皮甲】因年代久远，幻兽皮的光泽已不再流转，显得有些斑驳。即便如此，它对元素法力的亲和性依然极佳。"
    }
];
// Batch 10: Rarity 2 - Body Armor (Cloth / 布甲)
// IDs: body_082 - body_090
const body_r2_batch5 = [
    // --- [Low Tier] R2 布甲 (总防: 5 | HP: 40 | 速: 1 | 攻: 6 | 属性: 2 | 售价: 2160) ---
    {
        id: "body_082",
        name: "泛黄粗麻长衫", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 25,
        effects: { phy_def: 4, mag_def: 1, speed: 1, hp_max: 40, mag_atk: 6, qi: 1, shen: 1 },

        desc: "【布甲】虽然布料由于受潮而泛黄，但由于是加厚编制，依然能抵挡一些轻微的刮蹭。"
    },
    {
        id: "body_083",
        name: "陈旧纳底背心", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 25,
        effects: { phy_def: 2, mag_def: 3, speed: 1, hp_max: 40, mag_atk: 6, qi: 1, shen: 1 },

        desc: "【布甲】鞋底纳底工艺应用到了背心上，虽然穿着有些生硬，但在防御法术和物理撞击上相当平衡。"
    },
    {
        id: "body_084",
        name: "浆洗旧式法衣", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 25,
        effects: { phy_def: 1, mag_def: 4, speed: 1, hp_max: 40, mag_atk: 6, qi: 1, shen: 1 },

        desc: "【布甲】洗得有些发白的法衣，虽然其上原本的阵法已经磨损严重，但对法力的亲和度依然尚可。"
    },

    // --- [Mid Tier] R2 布甲 (总防: 12 | HP: 53 | 速: 2 | 攻: 9 | 属性: 3 | 售价: 3564) ---
    {
        id: "body_085",
        name: "补丁驿卒快衫", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3564,
        durability: 35,
        effects: { phy_def: 9, mag_def: 3, speed: 2, hp_max: 53, mag_atk: 9, qi: 1, shen: 2 },

        desc: "【布甲】官家驿卒淘汰的快衫，在肘部和前胸加了皮革补丁，在保证移动速度的同时加强了抗性。"
    },
    {
        id: "body_086",
        name: "二手云纹短袍", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3564,
        durability: 35,
        effects: { phy_def: 6, mag_def: 6, speed: 2, hp_max: 53, mag_atk: 9, qi: 2, shen: 1 },

        desc: "【布甲】从旧衣铺买来的云纹短袍，绸面虽然有些抽丝，但内衬依然完好，非常适合常年在外的人士。"
    },
    {
        id: "body_087",
        name: "褪色祭祀布甲", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3564,
        durability: 35,
        effects: { phy_def: 3, mag_def: 9, speed: 2, hp_max: 53, mag_atk: 9, qi: 1, shen: 2 },

        desc: "【布甲】曾经在某些小型祭祀中使用的布甲，由于色彩褪去而显得陈旧，但表面附着的法力残余依旧有效。"
    },

    // --- [High Tier] R2 布甲 (总防: 20 | HP: 65 | 速: 2 | 攻: 12 | 属性: 4 | 售价: 4950) ---
    {
        id: "body_088",
        name: "老旧精纳战袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 4950,
        durability: 45,
        effects: { phy_def: 15, mag_def: 5, speed: 2, hp_max: 65, mag_atk: 12, qi: 2, shen: 2 },

        desc: "【布甲】虽已是旧物，但针脚极其细密，是布甲中难得的精品，能为穿戴者提供稳健的身法和防护。"
    },
    {
        id: "body_089",
        name: "翻新道家法履服", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 4950,
        durability: 45,
        effects: { phy_def: 10, mag_def: 10, speed: 2, hp_max: 65, mag_atk: 12, qi: 2, shen: 2 },

        desc: "【布甲】道观中传出的旧法服，经过简单的修缮翻新，保留了清净神效，是法系修行者的实惠之选。"
    },
    {
        id: "body_090",
        name: "灰扑扑灵纹袍", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 4950,
        durability: 45,
        effects: { phy_def: 5, mag_def: 15, speed: 2, hp_max: 65, mag_atk: 12, qi: 2, shen: 2 },

        desc: "【布甲】因存放不当而落满灰尘的灵纹袍。即便不再鲜亮，但其内部编织的灵丝结构依然能化解重重法术。"
    }
];
// Batch 11: Rarity 3 - Body Armor (Plate / 板甲)
// IDs: body_091 - body_099
const body_r3_batch1 = [
    // --- [Low Tier] R3 板甲 (总防: 25 | HP: 180 | 速: -6 | 攻: 5 | 售价: 5805) ---
    {
        id: "body_091",
        name: "军用制式生铁甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 5805,
        durability: 80,
        effects: { phy_def: 18, mag_def: 7, speed: -6, hp_max: 180, phy_atk: 5 },
        req: { jing: 12 },
        desc: "【板甲】兵部统一监制的标准步卒甲，由整块生铁冲压而成，虽然样式古板，但防御力极其扎实。"
    },
    {
        id: "body_092",
        name: "精选步卒板铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 5805,
        durability: 80,
        effects: { phy_def: 13, mag_def: 12, speed: -6, hp_max: 180, phy_atk: 5 },
        req: { jing: 12 },
        desc: "【板甲】配发给资深步兵的防御铠甲，甲面打磨得十分平整，能有效卸去正面战场的冲击力。"
    },
    {
        id: "body_093",
        name: "披甲行阵衣", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 5805,
        durability: 80,
        effects: { phy_def: 6, mag_def: 19, speed: -6, hp_max: 180, phy_atk: 5 },
        req: { jing: 12 },
        desc: "【板甲】为了应对攻城战中的流火法术，在标准板甲内里缝入了隔热皮革，是一线登城队的标配。"
    },

    // --- [Mid Tier] R3 板甲 (总防: 45 | HP: 225 | 速: -9 | 攻: 7 | 售价: 8775) ---
    {
        id: "body_094",
        name: "护胫加固重铁甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 8775,
        durability: 100,
        effects: { phy_def: 32, mag_def: 13, speed: -9, hp_max: 225, phy_atk: 7 },
        req: { jing: 18 },
        desc: "【板甲】在胸腹部额外增加了一层熟铁护板，极大地提升了面对重型兵器时的生还率。"
    },
    {
        id: "body_095",
        name: "武馆护身板铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 8775,
        durability: 100,
        effects: { phy_def: 23, mag_def: 22, speed: -9, hp_max: 225, phy_atk: 7 },
        req: { jing: 18 },
        desc: "【板甲】名门武馆为核心弟子定做的护具，用料讲究，在抵御同门切磋的劲力时表现卓越。"
    },
    {
        id: "body_096",
        name: "叠片阻法铠", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 8775,
        durability: 100,
        effects: { phy_def: 11, mag_def: 34, speed: -9, hp_max: 225, phy_atk: 7 },
        req: { jing: 18 },
        desc: "【板甲】采用多层异种金属交叠打造的制式胸甲，能够有效传导并分散敌方术士造成的震荡。"
    },

    // --- [High Tier] R3 板甲 (总防: 90 | HP: 293 | 速: -12 | 攻: 9 | 售价: 16119) ---
    {
        id: "body_097",
        name: "精炼重装步卒铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 16119,
        durability: 120,
        effects: { phy_def: 63, mag_def: 27, speed: -12, hp_max: 293, phy_atk: 9 },
        req: { jing: 24 },
        desc: "【板甲】重装步兵团的高阶配备，全身覆盖厚重的精炼钢板，是战场上名副其实的移动铁壁。"
    },
    {
        id: "body_098",
        name: "巡营坚韧战铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 16119,
        durability: 120,
        effects: { phy_def: 45, mag_def: 45, speed: -12, hp_max: 293, phy_atk: 9 },
        req: { jing: 24 },
        desc: "【板甲】为了应对漫长的边界巡守，该甲做了特殊的重心处理，在提供极致防御的同时尽可能减少负担。"
    },
    {
        id: "body_099",
        name: "内衬精铁卫铠", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 3,
        value: 16119,
        durability: 120,
        effects: { phy_def: 27, mag_def: 63, speed: -12, hp_max: 293, phy_atk: 9 },
        req: { jing: 24 },
        desc: "【板甲】在厚重的铁甲层中加入了绝缘的药浸丝绸，是守卫重点法术设施的士兵标准配备。"
    }
];
// Batch 12: Rarity 3 - Body Armor (Heavy / 重甲)
// IDs: body_100 - body_108
const body_r3_batch2 = [
    // --- [Low Tier] R3 重甲 (总防: 18 | HP: 150 | 速: -3 | 攻: 2 | 售价: 4005) ---
    {
        id: "body_100",
        name: "步卒镶钉皮铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 4005,
        durability: 75,
        effects: { phy_def: 11, mag_def: 7, speed: -3, hp_max: 150, phy_atk: 2 },
        req: { jing: 10 },
        desc: "【重甲】步兵营常用的战斗皮铠，在关键部位镶嵌了密集的圆头钢钉，防磨且耐冲击。"
    },
    {
        id: "body_101",
        name: "制式熟皮重甲", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 4005,
        durability: 75,
        effects: { phy_def: 9, mag_def: 9, speed: -3, hp_max: 150, phy_atk: 2 },
        req: { jing: 10 },
        desc: "【重甲】由多层优质熟牛皮叠压而成的军用甲胄，内衬薄铁片，是军中常见的防御配备。"
    },
    {
        id: "body_102",
        name: "军用护心皮铠", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 4005,
        durability: 75,
        effects: { phy_def: 5, mag_def: 13, speed: -3, hp_max: 150, phy_atk: 2 },
        req: { jing: 10 },
        desc: "【重甲】针对战场流火设计的重型皮甲，皮革经过药剂硝制，对灼烧类法术有较好的防护效果。"
    },

    // --- [Mid Tier] R3 重甲 (总防: 33 | HP: 188 | 速: -5 | 攻: 3 | 售价: 6102) ---
    {
        id: "body_103",
        name: "加固精铁鳞甲", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 6102,
        durability: 90,
        effects: { phy_def: 20, mag_def: 13, speed: -5, hp_max: 188, phy_atk: 3 },
        req: { jing: 15 },
        desc: "【重甲】在胸腔部位额外加厚了精铁甲片，能有效防御战场上致命的攒射和横扫攻击。"
    },
    {
        id: "body_104",
        name: "阵列熟铁甲衣", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 6102,
        durability: 90,
        effects: { phy_def: 17, mag_def: 16, speed: -5, hp_max: 188, phy_atk: 3 },
        req: { jing: 15 },
        desc: "【重甲】仿照鱼鳞结构打造的步兵重甲，兼顾了基本的活动能力与强悍的正面防御力。"
    },
    {
        id: "body_105",
        name: "隔法重革铠", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 6102,
        durability: 90,
        effects: { phy_def: 8, mag_def: 25, speed: -5, hp_max: 188, phy_atk: 3 },
        req: { jing: 15 },
        desc: "【重甲】阵列作战时配发的重型防御甲，由于采用了吸法材质，能大幅降低法术震荡的余波伤害。"
    },

    // --- [High Tier] R3 重甲 (总防: 65 | HP: 244 | 速: -6 | 攻: 5 | 售价: 10854) ---
    {
        id: "body_106",
        name: "伍长精炼钢甲", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 10854,
        durability: 110,
        effects: { phy_def: 40, mag_def: 25, speed: -6, hp_max: 244, phy_atk: 5 },
        req: { jing: 20 },
        desc: "【重甲】配发给基层军官的厚重甲胄，整体由精铁打制，不仅防护面积大，且质地极为坚韧。"
    },
    {
        id: "body_107",
        name: "战阵耐磨皮铠", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 10854,
        durability: 110,
        effects: { phy_def: 33, mag_def: 32, speed: -6, hp_max: 244, phy_atk: 5 },
        req: { jing: 20 },
        desc: "【重甲】专为持久战设计的耐磨重甲，多处连接位使用了钢丝缝合，极其耐用，深受老兵喜爱。"
    },
    {
        id: "body_108",
        name: "精练御魔重护", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 10854,
        durability: 110,
        effects: { phy_def: 16, mag_def: 49, speed: -6, hp_max: 244, phy_atk: 5 },
        req: { jing: 20 },
        desc: "【重甲】经过精炼除渣处理的金属重甲，对元素的排斥性极强，是冲锋陷阵时法术流中的可靠保障。"
    }
];
// Batch 13: Rarity 3 - Body Armor (Light / 轻甲)
// IDs: body_109 - body_117
const body_r3_batch3 = [
    // --- [Low Tier] R3 轻甲 (总防: 14 | HP: 120 | 速: 0 | 售价: 5130) ---
    {
        id: "body_109",
        name: "制式熟皮胸甲", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 5130,
        durability: 60,
        effects: { phy_def: 10, mag_def: 4, speed: 0, hp_max: 120 },
        req: { shen: 10 },
        desc: "【轻甲】兵工坊大批量生产的熟皮胸甲，皮质坚韧且厚度均匀，是普通轻步兵的标准配备。"
    },
    {
        id: "body_110",
        name: "军用巡哨轻甲", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 5130,
        durability: 60,
        effects: { phy_def: 7, mag_def: 7, speed: 0, hp_max: 120 },
        req: { shen: 10 },
        desc: "【轻甲】专为营地巡哨设计的轻便护甲，贴合感良好，能够适应长时间的站岗或小规模机动。"
    },
    {
        id: "body_111",
        name: "执勤防水轻衫", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 5130,
        durability: 60,
        effects: { phy_def: 4, mag_def: 10, speed: 0, hp_max: 120 },
        req: { shen: 10 },
        desc: "【轻甲】皮革经过桐油反复浸泡，不仅能防雨水，由于内里填充了草药层，还能隔绝细微的法术干扰。"
    },

    // --- [Mid Tier] R3 轻甲 (总防: 32 | HP: 157 | 速: 0 | 售价: 8559) ---
    {
        id: "body_112",
        name: "精缝野猪皮甲", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 8559,
        durability: 80,
        effects: { phy_def: 22, mag_def: 10, speed: 0, hp_max: 157 },
        req: { shen: 15 },
        desc: "【轻甲】采用厚实的野猪脊皮精工缝制，关键部位加固了缝线，比普通皮甲更抗劈砍，是资深轻骑兵的选择。"
    },
    {
        id: "body_113",
        name: "资深斥候皮甲", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 8559,
        durability: 80,
        effects: { phy_def: 16, mag_def: 16, speed: 0, hp_max: 157 },
        req: { shen: 15 },
        desc: "【轻甲】配发给资深斥候的进阶装备，在追求轻便的同时，也通过多层皮革叠放加强了对心口的防护。"
    },
    {
        id: "body_114",
        name: "浸药防腐皮衫", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 8559,
        durability: 80,
        effects: { phy_def: 10, mag_def: 22, speed: 0, hp_max: 157 },
        req: { shen: 15 },
        desc: "【轻甲】制作过程中加入了多种抗魔药粉，皮革呈现一种深沉的灰褐色，能有效吸收大范围的法术余震。"
    },

    // --- [High Tier] R3 轻甲 (总防: 50 | HP: 195 | 速: 0 | 售价: 12015) ---
    {
        id: "body_115",
        name: "营伍校阅轻铠", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 12015,
        durability: 100,
        effects: { phy_def: 35, mag_def: 15, speed: 0, hp_max: 195 },
        req: { shen: 20 },
        desc: "【轻甲】大营校阅时配发给优秀军士的战甲，用料上乘，皮质纹理清晰且极其坚韧。"
    },
    {
        id: "body_116",
        name: "精锐快步兵甲", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 12015,
        durability: 100,
        effects: { phy_def: 25, mag_def: 25, speed: 0, hp_max: 195 },
        req: { shen: 20 },
        desc: "【轻甲】专供精锐快步兵使用的皮甲，剪裁极其合身，是军工品质下的优良产物，防御极其全面。"
    },
    {
        id: "body_117",
        name: "护阵灵皮战衣", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 3,
        value: 12015,
        durability: 100,
        effects: { phy_def: 15, mag_def: 35, speed: 0, hp_max: 195 },
        req: { shen: 20 },
        desc: "【轻甲】选用了带有微弱灵气的兽皮制成，不仅穿着舒适，更能让士兵在阵法加持下保持充沛的生命活力。"
    }
];
// Batch 14: Rarity 3 - Body Armor (Leather / 皮甲)
// IDs: body_118 - body_126
const body_r3_batch4 = [
    // --- [Low Tier] R3 皮甲 (总防: 10 | HP: 90 | 速: 1 | 攻: 9 | 暴: 3 | 售价: 6750) ---
    {
        id: "body_118",
        name: "制式狼皮战衣", // 物理防御偏向 (0.7:0.3)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 6750,
        durability: 65,
        effects: { phy_def: 7, mag_def: 3, speed: 1, hp_max: 90, phy_atk: 9, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】精选成年狼皮制成的制式战衣，皮质坚韧且经过防腐处理，是精锐轻步兵的标志性装备。"
    },
    {
        id: "body_119",
        name: "军用熟皮胸甲", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 6750,
        durability: 65,
        effects: { phy_def: 5, mag_def: 5, speed: 1, hp_max: 90, phy_atk: 9, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】标准的军用制式硬皮甲，做工规整，关键部位加厚，能有效平衡物理攻击与内劲冲击。"
    },
    {
        id: "body_120",
        name: "巡哨软革护甲", // 法术防御偏向 (0.3:0.7)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 6750,
        durability: 65,
        effects: { phy_def: 3, mag_def: 7, speed: 1, hp_max: 90, phy_atk: 9, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】由柔软的熟革缝制而成，活动极其灵便，内层涂有抗魔油脂，适合在复杂法力环境下巡哨。"
    },

    // --- [Mid Tier] R3 皮甲 (总防: 24 | HP: 118 | 速: 1 | 攻: 13 | 暴: 4 | 售价: 10476) ---
    {
        id: "body_121",
        name: "加固犀皮甲", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 10476,
        durability: 85,
        effects: { phy_def: 17, mag_def: 7, speed: 1, hp_max: 118, phy_atk: 13, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】采用厚实的犀牛皮精制，并在心口加装了硬皮护板，能正面抵御大多数常规兵刃的劈砍。"
    },
    {
        id: "body_122",
        name: "营伍精缝皮铠", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 10476,
        durability: 85,
        effects: { phy_def: 12, mag_def: 12, speed: 1, hp_max: 118, phy_atk: 13, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】配发给资深伍长的精缝皮甲，工艺比普通步卒甲更精细，在不影响爆发力的前提下提供了极佳保护。"
    },
    {
        id: "body_123",
        name: "浸药御魔皮衣", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 10476,
        durability: 85,
        effects: { phy_def: 7, mag_def: 17, speed: 1, hp_max: 118, phy_atk: 13, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】皮革中混入了抗魔药草的纤维，触感微凉，对战场上的大规模法术轰炸有显著的削弱效果。"
    },

    // --- [High Tier] R3 皮甲 (总防: 38 | HP: 146 | 速: 2 | 攻: 18 | 暴: 6 | 售价: 15012) ---
    {
        id: "body_124",
        name: "先锋铁扣皮铠", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 15012,
        durability: 110,
        effects: { phy_def: 27, mag_def: 11, speed: 2, hp_max: 146, phy_atk: 18, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】采用重型犀皮并辅以精钢卡扣连接，兼顾了防御深度与活动灵敏度，是先锋营冲击敌阵的利器。"
    },
    {
        id: "body_125",
        name: "精锐突击皮衣", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 15012,
        durability: 110,
        effects: { phy_def: 19, mag_def: 19, speed: 2, hp_max: 146, phy_atk: 18, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】专供精锐突击队使用的皮战衣，剪裁极其合身，每一寸缝线都经过加固，是皮甲中的上等良品。"
    },
    {
        id: "body_126",
        name: "军吏扣带战服", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 3,
        value: 15012,
        durability: 110,
        effects: { phy_def: 11, mag_def: 27, speed: 2, hp_max: 146, phy_atk: 18, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】基层军吏常用的扣带式皮甲，在保证作战需求的同时，皮革层间夹有阻法内衬，能大幅提升存活率。"
    }
];
// Batch 15: Rarity 3 - Body Armor (Cloth / 布甲)
// IDs: body_127 - body_135
const body_r3_batch5 = [
    // --- [Low Tier] R3 布甲 (总防: 7 | HP: 60 | 速: 2 | 攻: 9 | 属性: 4 | 售价: 5130) ---
    {
        id: "body_127",
        name: "制式青麻长袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 5130,
        durability: 45,
        effects: { phy_def: 5, mag_def: 2, speed: 2, hp_max: 60, mag_atk: 9, qi: 2, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】军中随军文书配发的青麻长袍，面料经过防蛀处理，针脚整齐，透气性极佳。"
    },
    {
        id: "body_128",
        name: "营伍棉纺便服", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 5130,
        durability: 45,
        effects: { phy_def: 3, mag_def: 4, speed: 2, hp_max: 60, mag_atk: 9, qi: 2, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】标准的营伍棉纺服饰，不仅穿着舒适，且在内衬加了一层薄绒以缓冲外力。"
    },
    {
        id: "body_129",
        name: "执勤净水法衣", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 5130,
        durability: 45,
        effects: { phy_def: 2, mag_def: 5, speed: 2, hp_max: 60, mag_atk: 9, qi: 2, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】基层法阵看守人员穿戴的简易法衣，布料带有微弱的斥水性，能阻挡轻微的法力侵蚀。"
    },

    // --- [Mid Tier] R3 布甲 (总防: 16 | HP: 79 | 速: 2 | 攻: 14 | 属性: 4 | 售价: 7533) ---
    {
        id: "body_130",
        name: "精编御寒布袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 7533,
        durability: 60,
        effects: { phy_def: 11, mag_def: 5, speed: 2, hp_max: 79, mag_atk: 14, qi: 2, shen: 2 },
        req: { shen: 15 },
        desc: "【布甲】北方守军通用的加厚布袍，在布料中混纺了韧性较高的麻丝，不仅保暖且耐磨损。"
    },
    {
        id: "body_131",
        name: "门派外门练功服", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 7533,
        durability: 60,
        effects: { phy_def: 8, mag_def: 8, speed: 2, hp_max: 79, mag_atk: 14, qi: 2, shen: 2 },
        req: { shen: 15 },
        desc: "【布甲】名门大派外门弟子的统一着装，做工扎实，在多次浆洗后依然能保持挺拔的版型。"
    },
    {
        id: "body_132",
        name: "洗练云纹衬衣", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 7533,
        durability: 60,
        effects: { phy_def: 5, mag_def: 11, speed: 2, hp_max: 79, mag_atk: 14, qi: 2, shen: 2 },
        req: { shen: 15 },
        desc: "【布甲】这种衬衣在袖口和领口绣有简单的避法纹路，虽然品质大众化，但法术防护力很可靠。"
    },

    // --- [High Tier] R3 布甲 (总防: 26 | HP: 98 | 速: 3 | 攻: 18 | 属性: 6 | 售价: 10611) ---
    {
        id: "body_133",
        name: "精选官家快行装", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 10611,
        durability: 80,
        effects: { phy_def: 18, mag_def: 8, speed: 3, hp_max: 98, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 20 },
        desc: "【布甲】专为官方信使或高阶斥候定制的布甲，采用了特殊的经纬织法，在受到冲击时有极佳的韧性。"
    },
    {
        id: "body_134",
        name: "上品棉麻御风袍", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 10611,
        durability: 80,
        effects: { phy_def: 13, mag_def: 13, speed: 3, hp_max: 98, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 20 },
        desc: "【布甲】市面上广受欢迎的上等布袍，结构轻盈且防御全面，是江湖人士游走四方的首选。"
    },
    {
        id: "body_135",
        name: "浸灵御法法衣", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 10611,
        durability: 80,
        effects: { phy_def: 8, mag_def: 18, speed: 3, hp_max: 98, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 20 },
        desc: "【布甲】布料在稀释后的灵液中浸泡七日而成，虽是大众化法衣，但在面对元素攻击时依然游刃有余。"
    }
];
// Batch 16: Rarity 4 - Body Armor (Plate / 板甲)
// IDs: body_136 - body_144
const body_r4_batch1 = [
    // --- [Low Tier] R4 板甲 (总防: 38 | HP: 240 | 速: -8 | 攻: 6 | 售价: 7380) ---
    {
        id: "body_136",
        name: "精钢虎卫胸甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7380,
        durability: 120,
        effects: { phy_def: 27, mag_def: 11, speed: -8, hp_max: 240, phy_atk: 6 },
        req: { jing: 22 },
        desc: "【板甲】采用百炼精钢打造，甲面浮雕有下山虎纹。这是军中领队级武官的制式重甲，防御极高。"
    },
    {
        id: "body_137",
        name: "校尉明光铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7380,
        durability: 120,
        effects: { phy_def: 19, mag_def: 19, speed: -8, hp_max: 240, phy_atk: 6 },
        req: { jing: 22 },
        desc: "【板甲】护心镜被打磨得如明镜一般。其优良的几何结构能弹开大部分正面而来的刀剑攒射。"
    },
    {
        id: "body_138",
        name: "冷锻御法重甲", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7380,
        durability: 120,
        effects: { phy_def: 11, mag_def: 27, speed: -8, hp_max: 240, phy_atk: 6 },
        req: { jing: 22 },
        desc: "【板甲】通过冷锻工艺大幅提升了金属密度，并内嵌了少量阻灵砂，对元素冲击有极强的韧性。"
    },

    // --- [Mid Tier] R4 板甲 (总防: 72 | HP: 300 | 速: -12 | 攻: 9 | 售价: 13680) ---
    {
        id: "body_139",
        name: "玄铁镇远铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 13680,
        durability: 160,
        effects: { phy_def: 50, mag_def: 22, speed: -12, hp_max: 300, phy_atk: 9 },
        req: { jing: 30 },
        desc: "【板甲】采用沉重的玄铁混合精钢铸造，甲片厚实，踏步间威压十足，非军中猛将不能负重。"
    },
    {
        id: "body_140",
        name: "重装校阅钢甲", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 13680,
        durability: 160,
        effects: { phy_def: 36, mag_def: 36, speed: -12, hp_max: 300, phy_atk: 9 },
        req: { jing: 30 },
        desc: "【板甲】用于王城亲卫的精良装备，不仅在防护性能上无懈可击，整体设计也尽显大将风范。"
    },
    {
        id: "body_141",
        name: "陨铁辟邪甲", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 13680,
        durability: 160,
        effects: { phy_def: 22, mag_def: 50, speed: -12, hp_max: 300, phy_atk: 9 },
        req: { jing: 30 },
        desc: "【板甲】传说加入了天外陨铁碎片的板甲，呈现出一种暗紫色，对各类奇门咒术有惊人的吸收力。"
    },

    // --- [High Tier] R4 板甲 (总防: 108 | HP: 390 | 速: -16 | 攻: 12 | 售价: 21060) ---
    {
        id: "body_142",
        name: "虎威将军铁壁甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 21060,
        durability: 200,
        effects: { phy_def: 76, mag_def: 32, speed: -16, hp_max: 390, phy_atk: 12 },
        req: { jing: 38 },
        desc: "【板甲】上等将军甲。每一片甲叶都经过数万次捶打，犹如一道移动的铁壁，无惧任何物理重击。"
    },
    {
        id: "body_143",
        name: "麒麟吞口重铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 21060,
        durability: 200,
        effects: { phy_def: 54, mag_def: 54, speed: -16, hp_max: 390, phy_atk: 12 },
        req: { jing: 38 },
        desc: "【板甲】武林上流人士钟爱的极品护具，双肩及腰部铸有麒麟吞口，工艺巅峰，防御力也同样傲视群雄。"
    },
    {
        id: "body_144",
        name: "紫金抗魔板铠", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 4,
        value: 21060,
        durability: 200,
        effects: { phy_def: 32, mag_def: 76, speed: -16, hp_max: 390, phy_atk: 12 },
        req: { jing: 38 },
        desc: "【板甲】在精钢表面镀有一层紫金膜，能有效折射高强度的术法流，是应对法师阵地的终极装备。"
    }
];
// Batch 17: Rarity 4 - Body Armor (Heavy / 重甲)
// IDs: body_145 - body_153
const body_r4_batch2 = [
    // --- [Low Tier] R4 重甲 (总防: 27 | HP: 200 | 速: -4 | 攻: 2 | 售价: 4860) ---
    {
        id: "body_145",
        name: "校尉镔铁重甲", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 4860,
        durability: 100,
        effects: { phy_def: 19, mag_def: 8, speed: -4, hp_max: 200, phy_atk: 2 },
        req: { jing: 18 },
        desc: "【重甲】由优质镔铁打造的将领级护甲，甲片厚实且排布紧密，能轻松抵御寻常步卒的攒射。"
    },
    {
        id: "body_146",
        name: "精锐鳞纹铁铠", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 4860,
        durability: 100,
        effects: { phy_def: 14, mag_def: 13, speed: -4, hp_max: 200, phy_atk: 2 },
        req: { jing: 18 },
        desc: "【重甲】采用了鱼鳞式叠甲工艺，在提供稳健防御的同时，通过灵活的甲片连接保证了腰部的活动力。"
    },
    {
        id: "body_147",
        name: "淬灵厚犀皮甲", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 4860,
        durability: 100,
        effects: { phy_def: 8, mag_def: 19, speed: -4, hp_max: 200, phy_atk: 2 },
        req: { jing: 18 },
        desc: "【重甲】选用深山老犀皮经多次药萃硝制，皮质硬如钢铁且对法术有极强的抗性，是校尉级的优良防具。"
    },

    // --- [Mid Tier] R4 重甲 (总防: 52 | HP: 250 | 速: -6 | 攻: 4 | 售价: 8640) ---
    {
        id: "body_148",
        name: "虎贲卫战铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 8640,
        durability: 140,
        effects: { phy_def: 36, mag_def: 16, speed: -6, hp_max: 250, phy_atk: 4 },
        req: { jing: 25 },
        desc: "【重甲】王城虎贲卫的制式甲胄，胸前镶嵌有加厚的熟铁护板，防御力在重甲中出类拔萃。"
    },
    {
        id: "body_149",
        name: "偏将锁子重甲", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 8640,
        durability: 140,
        effects: { phy_def: 26, mag_def: 26, speed: -6, hp_max: 250, phy_atk: 4 },
        req: { jing: 25 },
        desc: "【重甲】在厚皮甲外层又罩了一层精钢锁子网，无论是钝器打击还是利刃切割都能有效化解。"
    },
    {
        id: "body_150",
        name: "辟邪乌铁甲衣", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 8640,
        durability: 140,
        effects: { phy_def: 16, mag_def: 36, speed: -6, hp_max: 250, phy_atk: 4 },
        req: { jing: 25 },
        desc: "【重甲】以含有乌铁成分的复合材料打制，通体漆黑，对战场上的各种咒法攻击有显著的削弱效果。"
    },

    // --- [High Tier] R4 重甲 (总防: 78 | HP: 325 | 速: -8 | 攻: 6 | 售价: 13122) ---
    {
        id: "body_151",
        name: "破阵牙将铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 13122,
        durability: 180,
        effects: { phy_def: 55, mag_def: 23, speed: -8, hp_max: 325, phy_atk: 6 },
        req: { jing: 32 },
        desc: "【重甲】牙将级精良战铠，全身护板由冷锻工艺加强，是乱军之中冲锋破阵的可靠保障。"
    },
    {
        id: "body_152",
        name: "名门统领战袍", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 13122,
        durability: 180,
        effects: { phy_def: 39, mag_def: 39, speed: -8, hp_max: 325, phy_atk: 6 },
        req: { jing: 32 },
        desc: "【重甲】江湖名门为核心统领定做的复合重甲，选材极为苛刻，防御性能全面且稳定性极佳。"
    },
    {
        id: "body_153",
        name: "伏魔金丝皮铠", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 13122,
        durability: 180,
        effects: { phy_def: 23, mag_def: 55, speed: -8, hp_max: 325, phy_atk: 6 },
        req: { jing: 32 },
        desc: "【重甲】在厚实的妖兽皮中织入了辟魔法金丝，甲面隐现暗金流光，对高强度术法有极强的抵御力。"
    }
];
// Batch 18: Rarity 4 - Body Armor (Light / 轻甲)
// IDs: body_154 - body_162
const body_r4_batch3 = [
    // --- [Low Tier] R4 轻甲 (总防: 21 | HP: 160 | 速: 0 | 售价: 9540) ---
    {
        id: "body_154",
        name: "牙将熟皮胸甲", // 物理防御偏向 (0.75:0.25)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 9540,
        durability: 120,
        effects: { phy_def: 16, mag_def: 5, speed: 0, hp_max: 160 },
        req: { shen: 15 },
        desc: "【轻甲】专为牙将级军官定制的熟皮胸甲，皮革表面泛着健康的油脂光泽，防御性能极佳且轻便异常。"
    },
    {
        id: "body_155",
        name: "军官巡营轻甲", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 9540,
        durability: 120,
        effects: { phy_def: 11, mag_def: 10, speed: 0, hp_max: 160 },
        req: { shen: 15 },
        desc: "【轻甲】在军中巡营时穿着的优良防具，采用复合皮革缝制，能够完美平衡钝击与锐器的伤害。"
    },
    {
        id: "body_156",
        name: "碧波卸法衫", // 法术防御偏向 (0.25:0.75)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 9540,
        durability: 120,
        effects: { phy_def: 5, mag_def: 16, speed: 0, hp_max: 160 },
        req: { shen: 15 },
        desc: "【轻甲】名门子弟常用的护体衫，布料中混纺了深海鲛皮丝，对各种咒术流有惊人的偏转效果。"
    },

    // --- [Mid Tier] R4 轻甲 (总防: 40 | HP: 210 | 速: 0 | 售价: 14760) ---
    {
        id: "body_157",
        name: "偏将护身轻铠", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 14760,
        durability: 160,
        effects: { phy_def: 30, mag_def: 10, speed: 0, hp_max: 210 },
        req: { shen: 22 },
        desc: "【轻甲】偏将级军官的贴身甲胄，在保证机动性的前提下，加厚了护心部位的皮革，工艺上乘。"
    },
    {
        id: "body_158",
        name: "名门锦绣护心甲", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 14760,
        durability: 160,
        effects: { phy_def: 20, mag_def: 20, speed: 0, hp_max: 210 },
        req: { shen: 22 },
        desc: "【轻甲】出自京都名匠之手的战衣，刺绣精美且内嵌坚韧的犀皮，是武林名宿出席重要场合的首选。"
    },
    {
        id: "body_159",
        name: "翠屏避火战服", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 14760,
        durability: 160,
        effects: { phy_def: 10, mag_def: 30, speed: 0, hp_max: 210 },
        req: { shen: 22 },
        desc: "【轻甲】通体翠绿的上等战服，浸泡过特殊的避火药液，能让穿戴者在混乱的火法战场中维持生机。"
    },

    // --- [High Tier] R4 轻甲 (总防: 60 | HP: 260 | 速: 0 | 售价: 20160) ---
    {
        id: "body_160",
        name: "禁卫龙爪皮甲", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 20160,
        durability: 200,
        effects: { phy_def: 45, mag_def: 15, speed: 0, hp_max: 260 },
        req: { shen: 30 },
        desc: "【轻甲】效仿龙爪受力结构设计的上等皮甲，防御力在同类中几无敌手，是禁卫军领队的标志性铠甲。"
    },
    {
        id: "body_161",
        name: "踏浪惊鸿战衣", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 20160,
        durability: 200,
        effects: { phy_def: 30, mag_def: 30, speed: 0, hp_max: 260 },
        req: { shen: 30 },
        desc: "【轻甲】质地如水般丝滑却韧性惊人的极品战衣。其全面的防护性能能让武者在万军丛中如惊鸿掠影。"
    },
    {
        id: "body_162",
        name: "琉璃净法圣甲", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 4,
        value: 20160,
        durability: 200,
        effects: { phy_def: 15, mag_def: 45, speed: 0, hp_max: 260 },
        req: { shen: 30 },
        desc: "【轻甲】采用琉璃矿粉与灵丝织就的圣洁甲胄，其法术防御力极其恐怖，能让穿戴者在术法轰炸下安然无恙。"
    }
];
// Batch 19: Rarity 4 - Body Armor (Leather / 皮甲)
// IDs: body_163 - body_171
const body_r4_batch4 = [
    // --- [Low Tier] R4 皮甲 (总防: 16 | HP: 120 | 速: 1 | 攻: 12 | 暴: 4 | 售价: 12240) ---
    {
        id: "body_163",
        name: "乌鬃战马皮甲", // 物理防御偏向 (0.7:0.3)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 12240,
        durability: 100,
        effects: { phy_def: 11, mag_def: 5, speed: 1, hp_max: 120, phy_atk: 12, crit: 4 },
        req: { shen: 18 },
        desc: "【皮甲】选用北地黑马皮鞣制，皮革厚实且极具韧性，是军中校尉在马战中常用的优良护具。"
    },
    {
        id: "body_164",
        name: "精选犀革护身甲", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 12240,
        durability: 100,
        effects: { phy_def: 8, mag_def: 8, speed: 1, hp_max: 120, phy_atk: 12, crit: 4 },
        req: { shen: 18 },
        desc: "【皮甲】标准的军中牙将级装备，皮面经过多次捶打变得极为紧致，能够有效抵消钝器冲击。"
    },
    {
        id: "body_165",
        name: "灵犀御魔法甲", // 法术防御偏向 (0.3:0.7)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 12240,
        durability: 100,
        effects: { phy_def: 5, mag_def: 11, speed: 1, hp_max: 120, phy_atk: 12, crit: 4 },
        req: { shen: 18 },
        desc: "【皮甲】在犀牛皮中浸入了特殊的抗魔法油脂，甲面隐现光泽，是江湖名宿应对法术流的利器。"
    },

    // --- [Mid Tier] R4 皮甲 (总防: 30 | HP: 158 | 速: 1 | 攻: 18 | 暴: 6 | 售价: 19656) ---
    {
        id: "body_166",
        name: "影豹潜行战衣", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19656,
        durability: 130,
        effects: { phy_def: 21, mag_def: 9, speed: 1, hp_max: 158, phy_atk: 18, crit: 6 },
        req: { shen: 25 },
        desc: "【皮甲】名家打造的影豹皮甲，落地消音且弹性惊人，极大地辅助了穿着者的身法与致命打击。"
    },
    {
        id: "body_167",
        name: "骁勇厚革战铠", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19656,
        durability: 130,
        effects: { phy_def: 15, mag_def: 15, speed: 1, hp_max: 158, phy_atk: 18, crit: 6 },
        req: { shen: 25 },
        desc: "【皮甲】上等牛革经百次捶打成型，坚韧度足以弹开寻常弩箭，是战场上军中中层将领的可靠伙伴。"
    },
    {
        id: "body_168",
        name: "织墨避法战服", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19656,
        durability: 130,
        effects: { phy_def: 9, mag_def: 21, speed: 1, hp_max: 158, phy_atk: 18, crit: 6 },
        req: { shen: 25 },
        desc: "【皮甲】皮革中混编了珍贵的御魔蚕丝，整体呈墨黑色，不仅外观庄重，对抗法术冲击的效果极佳。"
    },

    // --- [High Tier] R4 皮甲 (总防: 45 | HP: 195 | 速: 2 | 攻: 24 | 暴: 8 | 售价: 27900) ---
    {
        id: "body_169",
        name: "虎贲犀甲胸铠", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 27900,
        durability: 160,
        effects: { phy_def: 32, mag_def: 13, speed: 2, hp_max: 195, phy_atk: 24, crit: 8 },
        req: { shen: 32 },
        desc: "【皮甲】以成年铁皮犀牛脊皮制成，其防御力直追重甲，却丝毫不显笨重，是军中骁卫的首选。"
    },
    {
        id: "body_170",
        name: "追风游龙战装", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 27900,
        durability: 160,
        effects: { phy_def: 23, mag_def: 22, speed: 2, hp_max: 195, phy_atk: 24, crit: 8 },
        req: { shen: 32 },
        desc: "【皮甲】江湖中传颂的上等身法皮甲，由数位名匠联手打造，结构完美，能让穿戴者在战斗中快如游龙。"
    },
    {
        id: "body_171",
        name: "幻影星辰皮甲", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 4,
        value: 27900,
        durability: 160,
        effects: { phy_def: 13, mag_def: 32, speed: 2, hp_max: 195, phy_atk: 24, crit: 8 },
        req: { shen: 32 },
        desc: "【皮甲】表层皮革具有轻微的空间折射特性，能误导敌人的感知并大幅抵御法术，是应对禁术的绝佳防具。"
    }
];
// Batch 20: Rarity 4 - Body Armor (Cloth / 布甲)
// IDs: body_172 - body_180
const body_r4_batch5 = [
    // --- [Low Tier] R4 布甲 (总防: 11 | HP: 80 | 速: 2 | 攻: 12 | 属性: 4 | 售价: 10080) ---
    {
        id: "body_172",
        name: "天蓝纹锦长袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 10080,
        durability: 60,
        effects: { phy_def: 8, mag_def: 3, speed: 2, hp_max: 80, mag_atk: 12, qi: 2, shen: 2 },
        req: { shen: 18 },
        desc: "【布甲】采用上等纹锦织就，色泽如晴空般明净。由于应用了多重纳底工艺，即便在战斗中也极其稳健。"
    },
    {
        id: "body_173",
        name: "云丝御风法装", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 10080,
        durability: 60,
        effects: { phy_def: 5, mag_def: 6, speed: 2, hp_max: 80, mag_atk: 12, qi: 2, shen: 2 },
        req: { shen: 18 },
        desc: "【布甲】衣身轻薄如云，内嵌微型引风法阵，穿戴者行动间皆有清风拂身，是法系统领的优良装备。"
    },
    {
        id: "body_174",
        name: "净心灵曦长衫", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 10080,
        durability: 60,
        effects: { phy_def: 3, mag_def: 8, speed: 2, hp_max: 80, mag_atk: 12, qi: 2, shen: 2 },
        req: { shen: 18 },
        desc: "【布甲】由静心草纤维混编而成，能助穿戴者排除杂念，丝滑的布料对外界法力冲击有天然的卸力效果。"
    },

    // --- [Mid Tier] R4 布甲 (总防: 23 | HP: 105 | 速: 3 | 攻: 18 | 属性: 6 | 售价: 15480) ---
    {
        id: "body_175",
        name: "金丝精纳战袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 15480,
        durability: 90,
        effects: { phy_def: 16, mag_def: 7, speed: 3, hp_max: 105, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 25 },
        desc: "【布甲】在棉布中混入了极细的柔性金丝，极大地提升了防御性能，是法武双修的将领钟爱之物。"
    },
    {
        id: "body_176",
        name: "流云逐浪锦衣", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 15480,
        durability: 90,
        effects: { phy_def: 11, mag_def: 12, speed: 3, hp_max: 105, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 25 },
        desc: "【布甲】采用名贵的流云锦缝制，触感温润。其特殊的波浪状缝合结构，能化解大部分方向袭来的暗劲。"
    },
    {
        id: "body_177",
        name: "月华清辉长服", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 15480,
        durability: 90,
        effects: { phy_def: 7, mag_def: 16, speed: 3, hp_max: 105, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 25 },
        desc: "【布甲】采集月华之精染色的天蚕丝制成，夜晚会散发出淡淡的清辉，对元素伤害有极强的中和能力。"
    },

    // --- [High Tier] R4 布甲 (总防: 30 | HP: 130 | 速: 4 | 攻: 24 | 属性: 8 | 售价: 20520) ---
    {
        id: "body_178",
        name: "天蚕金线法衣", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 20520,
        durability: 120,
        effects: { phy_def: 21, mag_def: 9, speed: 4, hp_max: 130, mag_atk: 24, qi: 4, shen: 4 },
        req: { shen: 32 },
        desc: "【布甲】布甲中的上等极品。采用千年天蚕丝与玄金细线交织，防御力惊人且丝毫不损其灵动机能。"
    },
    {
        id: "body_179",
        name: "扶摇踏风圣袍", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 20520,
        durability: 120,
        effects: { phy_def: 15, mag_def: 15, speed: 4, hp_max: 130, mag_atk: 24, qi: 4, shen: 4 },
        req: { shen: 32 },
        desc: "【布甲】寓意“扶摇直上”。其结构经过阵法大师的加持，能大幅缩减施法时的阻力，品质卓绝。"
    },
    {
        id: "body_180",
        name: "离尘无垢锦袍", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 20520,
        durability: 120,
        effects: { phy_def: 9, mag_def: 21, speed: 4, hp_max: 130, mag_atk: 24, qi: 4, shen: 4 },
        req: { shen: 32 },
        desc: "【布甲】不染尘埃。特殊的织法让这件锦袍几乎完全免疫低阶法术，是追求法力纯净的高阶修行者梦幻装备。"
    }
];
// Batch 21: Rarity 5 - Body Armor (Plate / 板甲)
// IDs: body_181 - body_189
const body_r5_batch1 = [
    // --- [Low Tier] R5 板甲 (总防: 54 | HP: 300 | 速: -10 | 攻: 8 | 售价: 10800) ---
    {
        id: "body_181",
        name: "碎岩震地重铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 10800,
        durability: 200,
        effects: { phy_def: 38, mag_def: 16, speed: -10, hp_max: 300, phy_atk: 8 },
        req: { jing: 30 },
        desc: "【板甲】采用地底深处的震山铁打制，甲身重逾千斤。统帅站定时，如同一座生根于地脉的钢铁堡垒。"
    },
    {
        id: "body_182",
        name: "磐石负重金铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 10800,
        durability: 200,
        effects: { phy_def: 27, mag_def: 27, speed: -10, hp_max: 300, phy_atk: 8 },
        req: { jing: 30 },
        desc: "【板甲】黄金丝线与冷铁交织出的传世神工，外观华美夺目。其结构如磐石般稳固，水火不侵，万箭难穿。"
    },
    {
        id: "body_183",
        name: "陨星厚土板甲", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 10800,
        durability: 200,
        effects: { phy_def: 16, mag_def: 38, speed: -10, hp_max: 300, phy_atk: 8 },
        req: { jing: 30 },
        desc: "【板甲】取自域外陨星之核打造，天生带有对灵气的排斥力。在应对大规模禁咒轰炸时，亦能保全统帅周全。"
    },

    // --- [Mid Tier] R5 板甲 (总防: 86 | HP: 391 | 速: -15 | 攻: 11 | 售价: 18243) ---
    {
        id: "body_184",
        name: "撼岳囚龙重铠", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 18243,
        durability: 250,
        effects: { phy_def: 60, mag_def: 26, speed: -15, hp_max: 391, phy_atk: 11 },
        req: { jing: 40 },
        desc: "【板甲】相传曾用于镇压恶龙。此甲不仅具备极致的硬度，甲叶间的咬合结构更能化解一切蛮力冲撞。"
    },
    {
        id: "body_185",
        name: "乾坤定鼎甲", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 18243,
        durability: 250,
        effects: { phy_def: 43, mag_def: 43, speed: -15, hp_max: 391, phy_atk: 11 },
        req: { jing: 40 },
        desc: "【板甲】名匠定鼎河山的传世之作。甲面平整如镜，能应对战场上任何极端的物理打击与能量侵蚀。"
    },
    {
        id: "body_186",
        name: "紫极玄阴重装", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 18243,
        durability: 250,
        effects: { phy_def: 26, mag_def: 60, speed: -15, hp_max: 391, phy_atk: 11 },
        req: { jing: 40 },
        desc: "【板甲】采集极寒之地的玄阴之气淬火，呈现深紫色。能够吸收周遭暴乱的法力，化作自身的护体罡气。"
    },

    // --- [High Tier] R5 板甲 (总防: 126 | HP: 488 | 速: -20 | 攻: 15 | 售价: 27945) ---
    {
        id: "body_187",
        name: "镇岳不动皇龙甲", // 物理防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 27945,
        durability: 300,
        effects: { phy_def: 88, mag_def: 38, speed: -20, hp_max: 488, phy_atk: 15 },
        req: { jing: 50 },
        desc: "【板甲】板甲之中的无冕之王。龙纹浮雕透着皇者霸气，护体铁壁可令神鬼叹息，穿戴者即为战场禁区。"
    },
    {
        id: "body_188",
        name: "万钧重力神工铠", // 均衡防御
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 27945,
        durability: 300,
        effects: { phy_def: 63, mag_def: 63, speed: -20, hp_max: 488, phy_atk: 15 },
        req: { jing: 50 },
        desc: "【板甲】神工级冶炼技术的巅峰，甲身每一寸受力都经过精密调校，是能够跨越纪元的重型防御神器。"
    },
    {
        id: "body_189",
        name: "混沌辟魔法甲", // 法术防御偏向
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 5,
        value: 27945,
        durability: 300,
        effects: { phy_def: 38, mag_def: 88, speed: -20, hp_max: 488, phy_atk: 15 },
        req: { jing: 50 },
        desc: "【板甲】在混沌灵矿中诞生的重型法甲，彻底隔绝了五行流转。法师引以为傲的攻击在此甲面前犹如儿戏。"
    }
];
// Batch 22: Rarity 5 - Body Armor (Heavy / 重甲)
// IDs: body_190 - body_198
const body_r5_batch2 = [
    // --- [Low Tier] R5 重甲 (总防: 39 | HP: 250 | 速: -5 | 攻: 4 | 售价: 19800) ---
    {
        id: "body_190",
        name: "骁卫金错重甲", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 19800,
        durability: 180,
        effects: { phy_def: 27, mag_def: 12, speed: -5, hp_max: 250, phy_atk: 4 },
        req: { jing: 25 },
        desc: "【重甲】大将军亲卫骁骑所穿，甲面以金错工艺勾勒出古老阵纹，质地坚韧，能抵御万箭攒射。"
    },
    {
        id: "body_191",
        name: "镔铁连环锁云甲", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 19800,
        durability: 180,
        effects: { phy_def: 20, mag_def: 19, speed: -5, hp_max: 250, phy_atk: 4 },
        req: { jing: 25 },
        desc: "【重甲】由无数精炼镔铁环扣合而成，结构极其精密，在卸去重型兵刃打击的同时，也能有效隔绝法术震荡。"
    },
    {
        id: "body_192",
        name: "避法乌金护身甲", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 19800,
        durability: 180,
        effects: { phy_def: 12, mag_def: 27, speed: -5, hp_max: 250, phy_atk: 4 },
        req: { jing: 25 },
        desc: "【重甲】以稀有乌金打造，这种材质天生对法力具有极强的排斥性，是宗门护法抵御外道术法的神兵。"
    },

    // --- [Mid Tier] R5 重甲 (总防: 65 | HP: 328 | 速: -7 | 攻: 6 | 售价: 29160) ---
    {
        id: "body_193",
        name: "破虏沉沙战铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 29160,
        durability: 230,
        effects: { phy_def: 46, mag_def: 19, speed: -7, hp_max: 328, phy_atk: 6 },
        req: { jing: 32 },
        desc: "【重甲】曾在黄沙战场中饱经磨砺的统帅铠甲，沉稳厚重，甲片内含地脉气息，立于大地便有万夫不当之勇。"
    },
    {
        id: "body_194",
        name: "虎贲镇远重铠", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 29160,
        durability: 230,
        effects: { phy_def: 33, mag_def: 32, speed: -7, hp_max: 328, phy_atk: 6 },
        req: { jing: 32 },
        desc: "【重甲】虎贲将领的标志性战具。采用多种稀有金属合铸，工艺极其复杂，防御能力在传世重甲中属于顶尖。"
    },
    {
        id: "body_195",
        name: "玄冥御火甲衣", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 29160,
        durability: 230,
        effects: { phy_def: 19, mag_def: 46, speed: -7, hp_max: 328, phy_atk: 6 },
        req: { jing: 32 },
        desc: "【重甲】取极北玄冥冰铁打造，通体透着足以冻结法力的寒意，是那些操纵烈焰的术士们最恐惧的屏障。"
    },

    // --- [High Tier] R5 重甲 (总防: 91 | HP: 406 | 速: -10 | 攻: 8 | 售价: 38295) ---
    {
        id: "body_196",
        name: "霸王摧城金铠", // 物理防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 38295,
        durability: 280,
        effects: { phy_def: 64, mag_def: 27, speed: -10, hp_max: 406, phy_atk: 8 },
        req: { jing: 40 },
        desc: "【重甲】拥有霸者气场的绝世铠甲。每一寸精金护板都经过神工级锻打，穿戴者在乱军之中如入无人之境。"
    },
    {
        id: "body_197",
        name: "混元罡气战铠", // 均衡防御
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 38295,
        durability: 280,
        effects: { phy_def: 46, mag_def: 45, speed: -10, hp_max: 406, phy_atk: 8 },
        req: { jing: 40 },
        desc: "【重甲】传闻融合了天地混元之气，甲身能自行抵消周遭的法力波动，其全面的防护性能已臻化境。"
    },
    {
        id: "body_198",
        name: "虚空裂纹乌铁甲", // 法术防御偏向
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 38295,
        durability: 280,
        effects: { phy_def: 27, mag_def: 64, speed: -10, hp_max: 406, phy_atk: 8 },
        req: { jing: 40 },
        desc: "【重甲】甲面布满了极其细微的自然裂纹，那是材料由于极高的法力亲和性而产生的异变，能将一切攻来的法术吸入虚无。"
    }
];
// Batch 23: Rarity 5 - Body Armor (Light / 轻甲)
// IDs: body_199 - body_207
const body_r5_batch3 = [
    // --- [Low Tier] R5 轻甲 (总防: 30 | HP: 200 | 速: 0 | 售价: 15750) ---
    {
        id: "body_199",
        name: "九霄御风轻铠", // 物理防御偏向 (0.75:0.25)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 15750,
        durability: 180,
        effects: { phy_def: 23, mag_def: 7, speed: 0, hp_max: 200 },
        req: { shen: 25 },
        desc: "【轻甲】采用极北高空的灵皮制成，不仅防御坚韧，更赋予穿戴者如坠九霄的轻盈感，是传世级的防具。"
    },
    {
        id: "body_200",
        name: "绝影流光战衣", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 15750,
        durability: 180,
        effects: { phy_def: 15, mag_def: 15, speed: 0, hp_max: 200 },
        req: { shen: 25 },
        desc: "【轻甲】传世名匠呕心沥血之作。衣身流转着微光，结构极其紧凑，能完美化解来自四面八方的劲力。"
    },
    {
        id: "body_201",
        name: "青鸾月华锦裳", // 法术防御偏向 (0.25:0.75)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 15750,
        durability: 180,
        effects: { phy_def: 7, mag_def: 23, speed: 0, hp_max: 200 },
        req: { shen: 25 },
        desc: "【轻甲】以青鸾落羽混编蚕丝织就，在月光下熠熠生辉。其神工级的隔魔工艺能让绝大多数术法消散于无形。"
    },

    // --- [Mid Tier] R5 轻甲 (总防: 50 | HP: 263 | 速: 0 | 售价: 23085) ---
    {
        id: "body_202",
        name: "苍龙破云轻铠", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 23085,
        durability: 240,
        effects: { phy_def: 38, mag_def: 12, speed: 0, hp_max: 263 },
        req: { shen: 35 },
        desc: "【轻甲】融合了异兽龙鳞粉末的传世甲胄。甲片坚硬无比，足以抵挡神兵利器的正面劈砍，威名赫赫。"
    },
    {
        id: "body_203",
        name: "万里神行圣锦衣", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 23085,
        durability: 240,
        effects: { phy_def: 25, mag_def: 25, speed: 0, hp_max: 263 },
        req: { shen: 35 },
        desc: "【轻甲】圣阶工艺打造的锦绣战衣，防御性能无懈可击，穿戴者行动时悄无声息，如鬼魅般不可捉摸。"
    },
    {
        id: "body_204",
        name: "瑶光避尘锦衫", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 23085,
        durability: 240,
        effects: { phy_def: 12, mag_def: 38, speed: 0, hp_max: 263 },
        req: { shen: 35 },
        desc: "【轻甲】取瑶光星垂之灵气浸染，衣衫不沾尘埃。其神工鬼斧的法力脉络能轻易弹开复杂的元气轰击。"
    },

    // --- [High Tier] R5 轻甲 (总防: 70 | HP: 325 | 速: 0 | 售价: 30375) ---
    {
        id: "body_205",
        name: "天外玄天轻战铠", // 物理防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 30375,
        durability: 300,
        effects: { phy_def: 53, mag_def: 17, speed: 0, hp_max: 325 },
        req: { shen: 45 },
        desc: "【轻甲】此甲已近乎神迹。采用上古巨犀皮结合玄金打造，其物理防护能力已达到了轻型甲具的终极极限。"
    },
    {
        id: "body_206",
        name: "八荒游龙圣战衣", // 均衡防御
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 30375,
        durability: 300,
        effects: { phy_def: 35, mag_def: 35, speed: 0, hp_max: 325 },
        req: { shen: 45 },
        desc: "【轻甲】傲视八荒的传奇锦衣。无论是材料还是结构都达到了修仙界的巅峰，提供极其恐怖的全方位防护。"
    },
    {
        id: "body_207",
        name: "紫微御魔大圣服", // 法术防御偏向
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 5,
        value: 30375,
        durability: 300,
        effects: { phy_def: 17, mag_def: 53, speed: 0, hp_max: 325 },
        req: { shen: 45 },
        desc: "【轻甲】内蕴紫微之意。由顶级御魔丝绸与天蚕皮合制而成，能够将任何禁咒级的法术冲击化解于无形。"
    }
];
// Batch 24: Rarity 5 - Body Armor (Leather / 皮甲)
// IDs: body_208 - body_216
const body_r5_batch4 = [
    // --- [Low Tier] R5 皮甲 (总防: 23 | HP: 150 | 速: 1 | 攻: 15 | 暴: 5 | 售价: 20025) ---
    {
        id: "body_208",
        name: "贪狼噬日皮铠", // 物理防御偏向 (0.4:0.6)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 20025,
        durability: 160,
        effects: { phy_def: 16, mag_def: 7, speed: 1, hp_max: 150, phy_atk: 15, crit: 5 },
        req: { shen: 28 },
        desc: "【皮甲】取塞外贪狼之皮制成，暗红色的皮革隐约透着凶戾之气。每一块护甲都经过神工揉制，能极大提升穿戴者的杀伐之威。"
    },
    {
        id: "body_209",
        name: "绝影奔雷战衣", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 20025,
        durability: 160,
        effects: { phy_def: 12, mag_def: 11, speed: 1, hp_max: 150, phy_atk: 15, crit: 5 },
        req: { shen: 28 },
        desc: "【皮甲】传世名匠以特殊手段处理过的硬革战衣，甲片咬合处隐有雷鸣之声。其坚韧度在皮甲中已属凤毛麟角。"
    },
    {
        id: "body_210",
        name: "幻瞳避火皮衣", // 法术防御偏向 (0.6:0.4)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 20025,
        durability: 160,
        effects: { phy_def: 7, mag_def: 16, speed: 1, hp_max: 150, phy_atk: 15, crit: 5 },
        req: { shen: 28 },
        desc: "【皮甲】采集深渊幻兽之眼周边的柔皮打造，甲面色彩斑斓，天生具备折射元素光束的神力，玄妙异常。"
    },

    // --- [Mid Tier] R5 皮甲 (总防: 38 | HP: 197 | 速: 2 | 攻: 23 | 暴: 8 | 售价: 30240) ---
    {
        id: "body_211",
        name: "麒麟逆鳞战铠", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 30240,
        durability: 220,
        effects: { phy_def: 27, mag_def: 11, speed: 2, hp_max: 197, phy_atk: 23, crit: 8 },
        req: { shen: 38 },
        desc: "【皮甲】以神兽麒麟颈下的逆鳞柔皮合制。此铠触感如钢，防御力足以在万军丛中横行无忌，是武林高手的终极护具。"
    },
    {
        id: "body_212",
        name: "混元乾坤皮甲", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 30240,
        durability: 220,
        effects: { phy_def: 19, mag_def: 19, speed: 2, hp_max: 197, phy_atk: 23, crit: 8 },
        req: { shen: 38 },
        desc: "【皮甲】此甲结构蕴含阴阳调和之道，皮革经过万年灵乳浸润。无论是抵御外力还是爆发内劲，都达到了神工水准。"
    },
    {
        id: "body_213",
        name: "九幽冥火皮袄", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 30240,
        durability: 220,
        effects: { phy_def: 11, mag_def: 27, speed: 2, hp_max: 197, phy_atk: 23, crit: 8 },
        req: { shen: 38 },
        desc: "【皮甲】在极阴之地揉制的珍稀皮甲，表面流转着幽冥冷火。它能将一切侵袭的法术分解为最原始的气息，神妙不可方物。"
    },

    // --- [High Tier] R5 皮甲 (总防: 53 | HP: 244 | 速: 3 | 攻: 30 | 暴: 10 | 售价: 39330) ---
    {
        id: "body_214",
        name: "裂空龙裔战甲", // 物理防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 39330,
        durability: 280,
        effects: { phy_def: 37, mag_def: 16, speed: 3, hp_max: 244, phy_atk: 30, crit: 10 },
        req: { shen: 48 },
        desc: "【皮甲】选用亚龙脊部的硬革精制。此甲不仅坚韧度惊人，更能引动一丝真龙威压，令对手的攻击在胆怯中偏离。"
    },
    {
        id: "body_215",
        name: "踏月逐影神衣", // 均衡防御
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 39330,
        durability: 280,
        effects: { phy_def: 27, mag_def: 26, speed: 3, hp_max: 244, phy_atk: 30, crit: 10 },
        req: { shen: 48 },
        desc: "【皮甲】此衣如月中幻影，由传世名师联手打造。其材质坚韧且极度贴合，能让穿戴者在战斗中如鬼魅般灵动且稳健。"
    },
    {
        id: "body_216",
        name: "万象森罗护心铠", // 法术防御偏向
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 5,
        value: 39330,
        durability: 280,
        effects: { phy_def: 16, mag_def: 37, speed: 3, hp_max: 244, phy_atk: 30, crit: 10 },
        req: { shen: 48 },
        desc: "【皮甲】皮面上刻满了森罗万象之阵。这件神工级皮甲能自动偏转绝大部分针对要害的法术冲击，防御力近乎玄学。"
    }
];
// Batch 25: Rarity 5 - Body Armor (Cloth / 布甲)
// IDs: body_217 - body_225
const body_r5_batch5 = [
    // --- [Low Tier] R5 布甲 (总防: 15 | HP: 100 | 速: 3 | 攻: 15 | 属性: 5 | 售价: 16200) ---
    {
        id: "body_217",
        name: "流霞织金圣袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 16200,
        durability: 100,
        effects: { phy_def: 11, mag_def: 4, speed: 3, hp_max: 100, mag_atk: 15, qi: 3, shen: 2 },
        req: { shen: 30 },
        desc: "【布甲】采集傍晚最后一抹流霞织入布中，辅以神工级金丝加固。不仅身轻如燕，且步履间隐有云气环绕，能卸去沉重的物理冲击。"
    },
    {
        id: "body_218",
        name: "九天霓裳仙履袍", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 16200,
        durability: 100,
        effects: { phy_def: 8, mag_def: 7, speed: 3, hp_max: 100, mag_atk: 15, qi: 2, shen: 3 },
        req: { shen: 30 },
        desc: "【布甲】传说是仙子误落凡尘的霓裳残片所化。轻盈得近乎虚幻，防御力虽非顶尖，但其灵动感能让施法者游刃有余。"
    },
    {
        id: "body_219",
        name: "太虚化灵圣衫", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 16200,
        durability: 100,
        effects: { phy_def: 4, mag_def: 11, speed: 3, hp_max: 100, mag_atk: 15, qi: 2, shen: 3 },
        req: { shen: 30 },
        desc: "【布甲】衫身由高纯度的灵气纤维织就，能与穿戴者的神识产生共鸣。由于具备神工级的辟魔法阵，能无视大部分低阶法术。"
    },

    // --- [Mid Tier] R5 布甲 (总防: 35 | HP: 131 | 速: 4 | 攻: 22 | 属性: 8 | 售价: 26235) ---
    {
        id: "body_220",
        name: "万年古棉护法袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 26235,
        durability: 150,
        effects: { phy_def: 25, mag_def: 10, speed: 4, hp_max: 131, mag_atk: 22, qi: 4, shen: 4 },
        req: { shen: 42 },
        desc: "【布甲】采用生长万年的古棉精制，其韧性竟不下于精金。在保证轻便的同时，拥有极其惊人的物理抗震能力。"
    },
    {
        id: "body_221",
        name: "离垢无瑕圣锦衣", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 26235,
        durability: 150,
        effects: { phy_def: 18, mag_def: 17, speed: 4, hp_max: 131, mag_atk: 22, qi: 4, shen: 4 },
        req: { shen: 42 },
        desc: "【布甲】不染尘埃。此衣自带神工级的净心领域，能让穿戴者在混乱的法术狂潮中依然保持灵台清明，防御稳固平衡。"
    },
    {
        id: "body_222",
        name: "紫极御天神裳", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 26235,
        durability: 150,
        effects: { phy_def: 10, mag_def: 25, speed: 4, hp_max: 131, mag_atk: 22, qi: 4, shen: 4 },
        req: { shen: 42 },
        desc: "【布甲】通体紫气缭绕，乃名师采集东来紫气与天蚕丝融合。甲面流转的法光能自动偏转高强度的术法攻击。"
    },

    // --- [High Tier] R5 布甲 (总防: 45 | HP: 163 | 速: 5 | 攻: 30 | 属性: 10 | 售价: 35100) ---
    {
        id: "body_223",
        name: "混沌起源神袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 35100,
        durability: 200,
        effects: { phy_def: 32, mag_def: 13, speed: 5, hp_max: 163, mag_atk: 30, qi: 5, shen: 5 },
        req: { shen: 55 },
        desc: "【布甲】传闻所用材质源于混沌初开时的灵根，防御力不仅远超同类，更蕴含着生生不息的身法加持，珍贵异常。"
    },
    {
        id: "body_224",
        name: "大罗天御风圣裳", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 35100,
        durability: 200,
        effects: { phy_def: 23, mag_def: 22, speed: 5, hp_max: 163, mag_atk: 30, qi: 5, shen: 5 },
        req: { shen: 55 },
        desc: "【布甲】大罗天界的顶级遗产。穿戴者行动时仿佛摆脱了大地引力，其神工级的结构能完美平摊任何强度的冲击。"
    },
    {
        id: "body_225",
        name: "归墟寂灭法袍", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 35100,
        durability: 200,
        effects: { phy_def: 13, mag_def: 32, speed: 5, hp_max: 163, mag_atk: 30, qi: 5, shen: 5 },
        req: { shen: 55 },
        desc: "【布甲】袍面绣有归墟深渊的符文，能将一切攻向身躯的法力攻击吸入寂灭虚无。作为布甲之终极神器，被世人所向往。"
    }
];
// Batch 26: Rarity 6 - Body Armor (Mythic / 神话)
// IDs: body_226 - body_235
const body_r6_batch1 = [
    // --- [Plate / 板甲] (防御 1.8x | HP 1.5x | 速度 -2.0x | 额外物攻 0.5x) ---
    {
        id: "body_226",
        name: "冥狱铁壁战铠", // 低数值段
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 38610,
        durability: 500,
        effects: { phy_def: 52, mag_def: 22, speed: -12, hp_max: 360, phy_atk: 9 },
        req: { jing: 45 },
        desc: "【板甲】采冥界玄铁合铸，甲身时刻散发着森然死气。立于原位时，仿佛能引动冥狱铁壁降世，无可撼动。"
    },
    {
        id: "body_227",
        name: "玄天镇魔重铠", // 中数值段
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 54162,
        durability: 700,
        effects: { phy_def: 77, mag_def: 33, speed: -18, hp_max: 473, phy_atk: 14 },
        req: { jing: 55 },
        desc: "【板甲】上古天庭镇压域外天魔的圣物，结构中流转着玄天正气，对一切邪法与蛮力皆有极强的镇压之效。"
    },
    {
        id: "body_228",
        name: "葬神灭世板甲", // 高数值段
        type: "body",
        defType: "plate",
        grade: 0,
        rarity: 6,
        value: 68850,
        durability: 999,
        effects: { phy_def: 101, mag_def: 43, speed: -24, hp_max: 585, phy_atk: 18 },
        req: { jing: 65 },
        desc: "【板甲】曾葬掉过一个时代的毁灭之甲。其厚重的钢甲之下，跳动着末日劫火的余温，足以踏碎世间一切防御。"
    },

    // --- [Heavy / 重甲] (防御 1.3x | HP 1.25x | 速度 -1.0x | 额外物攻 0.25x) ---
    {
        id: "body_229",
        name: "戮神荒古重铠", // 低数值段
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 29025,
        durability: 450,
        effects: { phy_def: 32, mag_def: 21, speed: -6, hp_max: 300, phy_atk: 5 },
        req: { jing: 40 },
        desc: "【重甲】曾有邪神血溅其上，甲身吸收了神之恨意，变得坚不可摧。它是末日修仙者争相抢夺的杀伐圣物。"
    },
    {
        id: "body_230",
        name: "真武降魔甲", // 中数值段
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 41148,
        durability: 600,
        effects: { phy_def: 47, mag_def: 31, speed: -9, hp_max: 394, phy_atk: 7 },
        req: { jing: 55 },
        desc: "【重甲】北方真武大帝道统传承之物，甲面呈现龟蛇之纹，是一切外魔蛮力的克星，唯有宗门天骄方可穿戴。"
    },
    {
        id: "body_231",
        name: "诸神黄昏重铠", // 高数值段
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 52434,
        durability: 800,
        effects: { phy_def: 62, mag_def: 42, speed: -12, hp_max: 488, phy_atk: 9 },
        req: { jing: 65 },
        desc: "【重甲】见证了众神陨落的黄昏之甲。甲片剥落自旧神的残躯，任何肉身攻击在其面前都显得苍白无力。"
    },

    // --- [Light / 轻甲] (防御 1.0x | HP 1.0x | 速度 0x) ---
    {
        id: "body_232",
        name: "劫灰渡空神衣", // 低数值段
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 24030,
        durability: 400,
        effects: { phy_def: 21, mag_def: 20, speed: 0, hp_max: 240 },
        req: { shen: 40 },
        desc: "【轻甲】由末世劫火之后的余烬锻造，衣面虽显暗淡，却能助穿戴者踏空而行，在破碎虚空中穿行自如。"
    },
    {
        id: "body_233",
        name: "太苍浮光锦衣", // 中数值段
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 33453,
        durability: 550,
        effects: { phy_def: 30, mag_def: 31, speed: 0, hp_max: 315 },
        req: { shen: 55 },
        desc: "【轻甲】太苍宗开山祖师的遗物。衣身承载了远古大地的浮光，无论在何种法则混乱的战场，皆能维持绝对的稳定。"
    },
    {
        id: "body_234",
        name: "谪仙登天战甲", // 高数值段
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 42660,
        durability: 800,
        effects: { phy_def: 40, mag_def: 40, speed: 0, hp_max: 390 },
        req: { shen: 70 },
        desc: "【轻甲】此甲乃谪仙人重返天界前留下的唯一信物。其物理防御已臻至“万法不入肉身”的至高境界，轻盈而霸道。"
    },

    // --- [Leather / 皮甲] (防御 0.75x | HP 0.75x | 速度 0.25x | 额外物攻 1.0x | 1.0x 暴击) ---
    {
        id: "body_235",
        name: "业火因果神甲", // 低数值段
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 29025,
        durability: 350,
        effects: { phy_def: 12, mag_def: 19, speed: 2, hp_max: 180, phy_atk: 18, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】缠绕着红莲业火的绝世皮甲。踏步间因果相随，任何攻击者都会受到来自宿命的强力反震，乃是杀伐因果的极致。"
    }
];
// Batch 27: Rarity 6 - Body Armor (Mythic / 神话)
// IDs: body_236 - body_244
const body_r6_batch2 = [
    // --- [Heavy / 重甲] (防御 1.3x | HP 1.25x | 速度 -1.0x | 额外物攻 0.25x) ---
    {
        id: "body_236",
        name: "龙象真如重铠", // 法术防御偏向 (Low)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 29970,
        durability: 500,
        effects: { phy_def: 13, mag_def: 40, speed: -6, hp_max: 300, phy_atk: 4 },
        req: { jing: 40 },
        desc: "【重甲】传说此甲重达万钧，甲片中封印了远古龙象的神魂。虽沉重如岳，但其御法之能如真如不动，万咒难伤。"
    },
    {
        id: "body_237",
        name: "不灭金身甲", // 物理防御偏向 (Low)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 29970,
        durability: 500,
        effects: { phy_def: 40, mag_def: 13, speed: -6, hp_max: 300, phy_atk: 4 },
        req: { jing: 40 },
        desc: "【重甲】武林至尊退隐前留下的传世甲胄。以极纯精金锻打，穿戴者犹如金身附体，肉身防御可抗天地劫数。"
    },
    {
        id: "body_238",
        name: "斩业浮屠铠", // 均衡防御 (Mid)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 41796,
        durability: 700,
        effects: { phy_def: 39, mag_def: 39, speed: -9, hp_max: 394, phy_atk: 7 },
        req: { jing: 55 },
        desc: "【重甲】佛门秘境流出的杀伐重宝，名为斩业，意在以杀止杀。其甲叶层叠如浮屠宝塔，攻守兼备。"
    },
    {
        id: "body_239",
        name: "帝影征天甲", // 法术防御偏向 (Mid)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 42066,
        durability: 700,
        effects: { phy_def: 20, mag_def: 59, speed: -9, hp_max: 394, phy_atk: 7 },
        req: { jing: 55 },
        desc: "【重甲】古代帝国征战虚空时，主帅所穿的禁忌甲胄。甲面上残留的帝王虚影能有效偏转世间一切因果术法的打击。"
    },
    {
        id: "body_240",
        name: "九天星斗甲", // 物理防御偏向 (Mid)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 42066,
        durability: 700,
        effects: { phy_def: 59, mag_def: 20, speed: -9, hp_max: 394, phy_atk: 7 },
        req: { jing: 55 },
        desc: "【重甲】引动九天星辰之火淬炼而成。甲片排布暗合星斗方位，能将周遭受到的物理重压引流至大地，坚韧非凡。"
    },
    {
        id: "body_241",
        name: "混元无极重铠", // 均衡防御 (High)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 53622,
        durability: 999,
        effects: { phy_def: 52, mag_def: 52, speed: -12, hp_max: 488, phy_atk: 9 },
        req: { jing: 65 },
        desc: "【重甲】宗门镇派神兵。采集混元初开时的先天玄铁打制，其厚重的甲层中蕴含无极之道，防御力已达此界极限。"
    },
    {
        id: "body_242",
        name: "荒古战魂甲", // 法术防御偏向 (High)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 53622,
        durability: 999,
        effects: { phy_def: 26, mag_def: 78, speed: -12, hp_max: 488, phy_atk: 9 },
        req: { jing: 65 },
        desc: "【重甲】从荒古战场遗迹中挖掘出的孤品。此甲残留着上古英魂的不甘意志，能自动吞噬袭来的法力波动，化为自身防御。"
    },
    {
        id: "body_243",
        name: "诸神寂灭护甲", // 物理防御偏向 (High)
        type: "body",
        defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 53622,
        durability: 999,
        effects: { phy_def: 78, mag_def: 26, speed: -12, hp_max: 488, phy_atk: 9 },
        req: { jing: 65 },
        desc: "【重甲】见证了诸神寂灭的禁忌甲具。其铁灰色的外表下流淌着不朽的防御法则，哪怕山崩地裂，亦能护住穿戴者一线生机。"
    },

    // --- [Light / 轻甲] (防御 1.0x | HP 1.0x | 速度 0x) ---
    {
        id: "body_244",
        name: "凌波逍遥圣衣", // 物理防御偏向 (Low)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 24030,
        durability: 400,
        effects: { phy_def: 31, mag_def: 10, speed: 0, hp_max: 240 },
        req: { shen: 40 },
        desc: "【轻甲】此衣轻薄如蝉翼，由谪仙人游历凡尘时留下的织物改制。行走间如踏浪凌波，逍遥自得，物理防御力却惊人地稳健。"
    }
];
// Batch 28 (Cont.): Rarity 6 - Body Armor (Mythic / 神话)
// IDs: body_245 - body_253
const body_r6_batch3 = [
    // --- [Light / 轻甲] (防御 1.0x | HP 1.0x | 速度 0x) ---
    {
        id: "body_245",
        name: "溯时流光神衣", // 均衡型 (Low)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 24030,
        durability: 400,
        effects: { phy_def: 21, mag_def: 20, speed: 0, hp_max: 240 },
        req: { shen: 40 },
        desc: "【轻甲】帝王秘库中收藏的时间残片织成的神衣。其表面流光不断倒流，能化解大部分物理冲击并护住心脉，平衡性达到神话境界。"
    },
    {
        id: "body_246",
        name: "虚溟幻化圣裳", // 法术偏向 (Low)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 24030,
        durability: 400,
        effects: { phy_def: 10, mag_def: 31, speed: 0, hp_max: 240 },
        req: { shen: 40 },
        desc: "【轻甲】以虚溟之界的极光丝线编织而成。裳身在实体与虚幻间不断切换，能让绝大部分咒法攻击穿透而过，灵动至极。"
    },
    {
        id: "body_247",
        name: "绝云破晓战锦", // 物理偏向 (Mid)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 33480,
        durability: 550,
        effects: { phy_def: 46, mag_def: 15, speed: 0, hp_max: 315 },
        req: { shen: 55 },
        desc: "【轻甲】当世孤师在雷鸣巅峰闭关九载，取破晓之光与天蚕丝合制。锦面坚韧如钢，是追求机动性的武者梦寐以求的顶级战具。"
    },
    {
        id: "body_248",
        name: "太苍浮光道袍", // 均衡型 (Mid)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 33480,
        durability: 550,
        effects: { phy_def: 31, mag_def: 30, speed: 0, hp_max: 315 },
        req: { shen: 55 },
        desc: "【轻甲】太苍宗开山祖师的遗物。袍身流转着远古大地的温润浮光。无论在法理崩坏的末世何处，皆能维持绝对的稳定与防御。"
    },
    {
        id: "body_249",
        name: "灵渊折射羽衣", // 法术偏向 (Mid)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 33480,
        durability: 550,
        effects: { phy_def: 15, mag_def: 46, speed: 0, hp_max: 315 },
        req: { shen: 55 },
        desc: "【轻甲】采集灵界深渊底层的晶皮混纺灵羽制成。其表面具有完美的法力折射层，能让禁咒级的术法在此羽衣面前失去准头。"
    },
    {
        id: "body_250",
        name: "万古神行圣战衣", // 均衡型 (High)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 42660,
        durability: 800,
        effects: { phy_def: 40, mag_def: 40, speed: 0, hp_max: 390 },
        req: { shen: 70 },
        desc: "【轻甲】贯穿了万古修仙史的神话之甲。其结构已与天地脉动同调，穿戴者在战斗中如神行于世，身法极其诡谲平稳。"
    },
    {
        id: "body_251",
        name: "帝御诸界圣袍", // 法术偏向 (High)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 42660,
        durability: 800,
        effects: { phy_def: 20, mag_def: 60, speed: 0, hp_max: 390 },
        req: { shen: 70 },
        desc: "【轻甲】帝国统治者巡视诸界的仪仗甲胄。袍面丝绸由真龙须混编，能完全无视低等界面的法则压制，法术抗性旷古烁今。"
    },
    {
        id: "body_252",
        name: "末法孤影战服", // 物理偏向 (High)
        type: "body",
        defType: "light",
        grade: 0,
        rarity: 6,
        value: 42660,
        durability: 800,
        effects: { phy_def: 60, mag_def: 20, speed: 0, hp_max: 390 },
        req: { shen: 70 },
        desc: "【轻甲】末法时代唯一登上帝位的至尊之服。即便面对诸神遗留的神兵重击，亦能以其无上韧性将其劲力化解于无形。"
    },

    // --- [Leather / 皮甲] (防御 0.75x | HP 0.75x | 速度 0.25x | 额外物攻 1.0x | 暴击 1.0x) ---
    {
        id: "body_253",
        name: "煞纹杀伐战甲", // 物理偏向 (Low)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 29970,
        durability: 350,
        effects: { phy_def: 23, mag_def: 8, speed: 2, hp_max: 180, phy_atk: 18, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】皮面上流转着暗红色的煞纹，那是杀伐因果凝聚的实相。此甲不仅防御极坚，更能激发穿戴者深层的暴戾杀意。"
    }
];
// Batch 29 (Cont.): Rarity 6 - Body Armor (Mythic / 神话)
// IDs: body_254 - body_262
const body_r6_batch4 = [
    // --- [Leather / 皮甲] (防御 0.75x | HP 0.75x | 速度 0.25x | 额外物攻 1.0x | 暴击 1.0x) ---
    {
        id: "body_254",
        name: "劫灰孤影神袍", // 均衡型 (Low)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 29700,
        durability: 350,
        effects: { phy_def: 15, mag_def: 15, speed: 2, hp_max: 180, phy_atk: 18, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】行走于天地大劫的灰烬之中，不留痕迹。此履以灭绝异兽的残皮制成，在防守与速度间达到了诡异的平衡。"
    },
    {
        id: "body_255",
        name: "离魂影革神衣", // 法术偏向 (Low)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 29970,
        durability: 350,
        effects: { phy_def: 8, mag_def: 23, speed: 2, hp_max: 180, phy_atk: 18, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】材质轻薄如魂影，由于长期浸泡在黄泉灵液中，对一切针对神魂的法术攻击有着天然的规避效果。"
    },
    {
        id: "body_256",
        name: "业火红莲因果铠", // 物理偏向 (Mid)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 42444,
        durability: 480,
        effects: { phy_def: 34, mag_def: 11, speed: 2, hp_max: 236, phy_atk: 27, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】缠绕着红莲业火的绝世皮甲。踏步间因果相随，任何攻击者都会受到来自宿命的强力反震，防御极其霸道。"
    },
    {
        id: "body_257",
        name: "寂灭孤星圣甲", // 均衡型 (Mid)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 42714,
        durability: 480,
        effects: { phy_def: 23, mag_def: 23, speed: 2, hp_max: 236, phy_atk: 27, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】于星辰寂灭的刹那凝成的皮质圣具。它承载了孤星的寂寥，穿戴者行动时如流星滑落，攻守平衡无懈可击。"
    },
    {
        id: "body_258",
        name: "幽冥摄魂圣护", // 法术偏向 (Mid)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 42444,
        durability: 480,
        effects: { phy_def: 11, mag_def: 34, speed: 2, hp_max: 236, phy_atk: 27, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】采集九幽深处的魔蛟腹皮制成。甲面不仅能无视地府罡风，更能将周遭法力波动转化为自身的护体灵气。"
    },
    {
        id: "body_259",
        name: "屠灵断因神护", // 物理偏向 (High)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 55458,
        durability: 600,
        effects: { phy_def: 45, mag_def: 15, speed: 3, hp_max: 292, phy_atk: 36, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】末代战神屠杀百万英灵后的封神之作。此甲能够斩断攻击者的因果连线，从根本上令对手的打击落空。"
    },
    {
        id: "body_260",
        name: "帝道末法孤影甲", // 均衡型 (High)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 55458,
        durability: 600,
        effects: { phy_def: 30, mag_def: 30, speed: 3, hp_max: 292, phy_atk: 36, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】末法时代唯一登上帝位的至尊之铠。它见证了仙路的断绝，穿戴者在末日孤影中依然维持着帝王的尊严。"
    },
    {
        id: "body_261",
        name: "诸神寂灭因果衣", // 法术偏向 (High)
        type: "body",
        defType: "leather",
        grade: 0,
        rarity: 6,
        value: 55458,
        durability: 600,
        effects: { phy_def: 15, mag_def: 45, speed: 3, hp_max: 292, phy_atk: 36, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】上古诸神集体陨落时留下的禁忌皮衣。它无视世间一切术法规则，哪怕是法则级的审判，在其面前也将消散。"
    },

    // --- [Cloth / 布甲] (防御 0.5x | HP 0.5x | 速度 0.5x | 额外法攻 1.0x | 额外属性 1.0x) ---
    {
        id: "body_262",
        name: "帝玺残光圣袍", // 物理偏向 (Low)
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 20790,
        durability: 300,
        effects: { phy_def: 15, mag_def: 5, speed: 3, hp_max: 120, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】帝国末年秘库所藏，丝线中封存了破碎的帝玺残光。行走间步履生辉，能抵御乱世中沉重的物理压制。"
    }
];
// Batch 30: Rarity 6 - Body Armor (Mythic Cloth / 神话布甲)
// IDs: body_263 - body_270
const body_r6_batch5 = [
    // --- [Low Tier] (总防: 20 | HP: 120 | 速: 3 | 攻: 18 | 属性: 6 | 售价: 20790) ---
    {
        id: "body_263",
        name: "禁宫幽影圣袍", // 均衡防御 (0.5:0.5)
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 20790,
        durability: 300,
        effects: { phy_def: 10, mag_def: 10, speed: 3, hp_max: 120, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】如同徘徊在虚实边缘的禁宫幽影。此袍能让穿戴者在毁灭的道则中悄然穿行，身法与防御达到了极致的平衡。"
    },
    {
        id: "body_264",
        name: "龙嗣御风圣褂", // 法术防御偏向 (0.25:0.75)
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 20790,
        durability: 300,
        effects: { phy_def: 5, mag_def: 15, speed: 3, hp_max: 120, mag_atk: 18, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】传说是为末代龙嗣特制的御风具。布料轻盈如烟，能轻易拨开笼罩在周身的因果术法。"
    },

    // --- [Mid Tier] (总防: 30 | HP: 158 | 速: 5 | 攻: 27 | 属性: 9 | 售价: 29025) ---
    {
        id: "body_265",
        name: "太真无常神裳", // 物理防御偏向 (0.75:0.25)
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 29025,
        durability: 500,
        effects: { phy_def: 23, mag_def: 7, speed: 5, hp_max: 158, mag_atk: 27, qi: 4, shen: 5 },
        req: { shen: 75 },
        desc: "【布甲】太真宗掌门之信物。取天地无常之意织就，袍服所过之处万物凋零。其特殊的织法能正面抗衡末世兵戈之气。"
    },
    {
        id: "body_266",
        name: "掌教诛仙圣服", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 29025,
        durability: 500,
        effects: { phy_def: 15, mag_def: 15, speed: 5, hp_max: 158, mag_atk: 27, qi: 5, shen: 4 },
        req: { shen: 75 },
        desc: "【布甲】杀伐与出尘的共存之物。传闻末代掌教穿戴此服时曾一步跨越仙凡，将一切规则紊乱的攻击拒之门外。"
    },
    {
        id: "body_267",
        name: "寂灭因果神锦屦", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 29025,
        durability: 500,
        effects: { phy_def: 7, mag_def: 23, speed: 5, hp_max: 158, mag_atk: 27, qi: 4, shen: 5 },
        req: { shen: 75 },
        desc: "【布甲】末世寂灭教的最后神迹。锦面刻满了崩坏的因果符文，能将一切攻向身躯的法力强行拖入寂灭。"
    },

    // --- [High Tier] (总防: 40 | HP: 195 | 速: 6 | 攻: 36 | 属性: 12 | 售价: 37800) ---
    {
        id: "body_268",
        name: "混沌起源帝圣袍", // 物理防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 37800,
        durability: 999,
        effects: { phy_def: 30, mag_def: 10, speed: 6, hp_max: 195, mag_atk: 36, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诞生于混沌初开时的原始织物。它无视空间的重量，其防御力在末法时代已近乎神迹，坚固如道。"
    },
    {
        id: "body_269",
        name: "万古天途圣道袍", // 均衡防御
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 37800,
        durability: 999,
        effects: { phy_def: 20, mag_def: 20, speed: 6, hp_max: 195, mag_atk: 36, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】贯穿万古仙途的最终之袍。穿戴者即为道之残影，足尖不落地，身形不沾尘，在生与死的边缘行走自如。"
    },
    {
        id: "body_270",
        name: "归墟终焉绝影袍", // 法术防御偏向
        type: "body",
        defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 37800,
        durability: 999,
        effects: { phy_def: 10, mag_def: 30, speed: 6, hp_max: 195, mag_atk: 36, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诸天归于虚无，因果尽皆终焉。此袍乃布甲之终点，穿戴者步履所至，漫天法术皆化为虚无幻影。"
    }
];


const body = [
    ...body_r1_batch1,
    ...body_r2_batch1,
    ...body_r3_batch1,
    ...body_r4_batch1,
    ...body_r5_batch1,
    ...body_r6_batch1,
    ...body_r1_batch2,
    ...body_r2_batch2,
    ...body_r3_batch2,
    ...body_r4_batch2,
    ...body_r5_batch2,
    ...body_r6_batch2,
    ...body_r1_batch3,
    ...body_r2_batch3,
    ...body_r3_batch3,
    ...body_r4_batch3,
    ...body_r5_batch3,
    ...body_r6_batch3,
    ...body_r1_batch4,
    ...body_r2_batch4,
    ...body_r3_batch4,
    ...body_r4_batch4,
    ...body_r5_batch4,
    ...body_r6_batch4,
    ...body_r1_batch5,
    ...body_r2_batch5,
    ...body_r3_batch5,
    ...body_r4_batch5,
    ...body_r5_batch5,
    ...body_r6_batch5,
];
