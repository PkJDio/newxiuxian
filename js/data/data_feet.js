/*
 * =========================================================================================
 * 游戏数据设计 v2：鞋子 / 足部装备计算公式 (修订版)
 * =========================================================================================
 *
 * 【1. 装备类型体系】
 * -----------------------------------------------------------------------------------------
 * 类型    | 防御系数 | 速度系数 | 生命系数 | 攻击系数      | 特色说明
 * -----------------------------------------------------------------------------------------
 * 板甲    | 1.8x     | -2.0x    | 1.0x     | 物攻 1.0x     | 极高防御，高生命，移动极慢
 * 重甲    | 1.3x     | -1.0x    | 0.5x     | 物攻 0.5x     | 防御优秀，生命中等，移动较慢
 * 轻甲    | 1.0x     |  1.0x    | --       | --            | 标准均衡型配置
 * 皮甲    | 0.75x    |  1.25x   | --       | 物攻 0.5x     | 移动迅速，附带暴击加成
 * 布甲    | 0.5x     |  1.5x    | --       | 法攻 0.5x     | 极速移动，附带属性加成 (气/神)
 * -----------------------------------------------------------------------------------------
 *
 * 【2. 基础数值范围】 (R = 稀有度 1 到 6)
 * -----------------------------------------------------------------------------------------
 * 防御基准 (phy_def + mag_def) : [R * R,  10 * R]
 * 速度基准 (speed)             : [R * R,  10 * R]
 * 生命基准 (hp_max)            : [R * 25, R * 50]
 * 攻击基准 (phy_atk + mag_atk) : [R * 2,  R * 5 ]
 * 暴击基准 (crit)              : [R * 1,  R * 2 ]
 * 属性基准 (jing / qi / shen)  : [R * 1,  R * 2 ]
 *
 * *注：“防御/攻击基准”会根据护甲类型在物理(phy)与法术(mag)属性间分配。
 *
 * 【3. 价格计算公式】
 * -----------------------------------------------------------------------------------------
 * 每点属性价值 (金币)：
 * - 1点 防御 (phy_def + mag_def) = 15 * R * 3  = 45 * R
 * - 1点 速度 (speed)             = 15 * R * 3  = 45 * R
 * - 1点 生命 (hp_max)            =  3 * R * 3  =  9 * R
 * - 1点 攻击 (phy_atk + mag_atk) = 15 * R * 3  = 45 * R
 * - 1点 属性 (jing / qi / shen)  = 15 * R * 6  = 90 * R
 * - 1点 暴击 (crit)              = 15 * R * 12 = 180 * R
 *
 * 最终价值 = (防御总和 * 防御单价) + (速度 * 速度单价) + (生命 * 生命单价) + ...
 * *注：负数的速度值会降低装备的总价格。
 * =========================================================================================
 */
// Batch 1: Rarity 1 - Plate (板甲)
// IDs: feet_001 - feet_009
const feet_r1_batch1 = [
    // --- [Low Tier] R1 板甲 (总防: 4 | HP: 25 | 速: -4 | 攻: 2) ---
    {
        id: "feet_001",
        name: "锈迹铁板履", // 物理偏向：强调“铁板”、“锈”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 25,
        effects: { phy_def: 3, mag_def: 1, speed: -4, hp_max: 25, phy_atk: 2 },
        desc: "【板甲】表面布满红锈的铁片鞋，走起路来嘎吱作响，仅仅能护住脚趾。"
    },
    {
        id: "feet_002",
        name: "旧铁修补靴", // 均衡：强调“修补”、“旧”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 25,
        effects: { phy_def: 2, mag_def: 2, speed: -4, hp_max: 25, phy_atk: 2 },
        desc: "【板甲】拼凑起来的生锈铁鞋，稍微打磨了一下，勉强维持着平衡。"
    },
    {
        id: "feet_003",
        name: "黑岩废矿靴", // 法术偏向：强调“黑岩”、“矿”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 25,
        effects: { phy_def: 1, mag_def: 3, speed: -4, hp_max: 25, phy_atk: 2 },
        desc: "【板甲】虽然生锈严重，但混入了一些不知名的黑铁矿渣，对法术稍有抗性。"
    },

    // --- [Mid Tier] R1 板甲 (总防: 11 | HP: 38 | 速: -12 | 攻: 4) ---
    {
        id: "feet_004",
        name: "粗锻厚铁靴", // 物理偏向：强调“粗锻”、“厚”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 477,
        durability: 35,
        effects: { phy_def: 8, mag_def: 3, speed: -12, hp_max: 38, phy_atk: 4 },
        desc: "【板甲】乡间铁匠练手打制的生铁靴，厚度不均，但胜在用料实在。"
    },
    {
        id: "feet_005",
        name: "回炉生铁履", // 均衡：强调“回炉”、“生铁”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 477,
        durability: 35,
        effects: { phy_def: 6, mag_def: 5, speed: -12, hp_max: 38, phy_atk: 4 },
        desc: "【板甲】将废旧农具回炉重铸的靴子，内衬了一层发霉的旧棉布，稍微舒适了一些。"
    },
    {
        id: "feet_006",
        name: "浸油乌铁靴", // 法术偏向：强调“浸油”、“乌铁”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 477,
        durability: 35,
        effects: { phy_def: 3, mag_def: 8, speed: -12, hp_max: 38, phy_atk: 4 },
        desc: "【板甲】在生铁中随意掺杂了些许朱砂和黑油，看起来脏兮兮的，却能辟邪。"
    },

    // --- [High Tier] R1 板甲 (总防: 16 | HP: 50 | 速: -18 | 攻: 5) ---
    {
        id: "feet_007",
        name: "沉泥死士靴", // 物理偏向：强调“沉泥”、“死士”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 585,
        durability: 45,
        effects: { phy_def: 12, mag_def: 4, speed: -18, hp_max: 50, phy_atk: 5 },
        desc: "【板甲】沾满干涸泥浆的厚重铁靴，笨重无比，像是从战场死人堆里扒出来的。"
    },
    {
        id: "feet_008",
        name: "百纳钢屑靴", // 均衡：强调“百纳”、“钢屑”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 585,
        durability: 45,
        effects: { phy_def: 8, mag_def: 8, speed: -18, hp_max: 50, phy_atk: 5 },
        desc: "【板甲】极其厚实的旧铁靴，不知道经历了多少岁月，坚硬如石。"
    },
    {
        id: "feet_009",
        name: "蚀刻废铁履", // 法术偏向：强调“蚀刻”、“废铁”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 1,
        value: 585,
        durability: 45,
        effects: { phy_def: 4, mag_def: 12, speed: -18, hp_max: 50, phy_atk: 5 },
        desc: "【板甲】鞋底似乎镶嵌过什么 文，但早已脱落，只留下几个抗魔的孔洞。"
    }
];
// Batch 2: Rarity 1 - Heavy (重甲)
// IDs: feet_010 - feet_018
const feet_r1_batch2 = [
    // --- [Low Tier] R1 重甲 (总防: ~3 | HP: 13 | 速: -2 | 攻: 1) ---
    {
        id: "feet_010",
        name: "裂皮镶铁靴", // 物理偏向：强调“镶铁”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 198,
        durability: 25,
        effects: { phy_def: 2, mag_def: 1, speed: -2, hp_max: 13, phy_atk: 1 },
        desc: "【重甲】原本是官发的皮靴，后跟处钉了一块生锈铁片防磨，皮面早已开裂。"
    },
    {
        id: "feet_011",
        name: "磨损役卒靴", // 均衡：强调“役卒”（普通杂兵）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 243, // (4 def * 45) + (-2 spd * 45) + (13 hp * 9) + (1 atk * 45) = 180 - 90 + 117 + 45 = 252. Adjusting slightly for rounding or base. Python logic: 2+2=4 def.
        durability: 25,
        effects: { phy_def: 2, mag_def: 2, speed: -2, hp_max: 13, phy_atk: 1 },
        desc: "【重甲】不知道被转手了多少次的役卒鞋，鞋底磨损严重，但勉强还能跑。"
    },
    {
        id: "feet_012",
        name: "受潮符纸靴", // 法术偏向：强调“符纸”（法抗）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 198,
        durability: 25,
        effects: { phy_def: 1, mag_def: 2, speed: -2, hp_max: 13, phy_atk: 1 },
        desc: "【重甲】乡野神汉穿过的靴子，夹层里塞的辟邪符纸早已受潮发霉。"
    },

    // --- [Mid Tier] R1 重甲 (总防: ~8 | HP: 19 | 速: -6 | 攻: 2) ---
    {
        id: "feet_013",
        name: "缺钉硬皮靴", // 物理偏向：强调“硬皮”、“钉”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 351,
        durability: 35,
        effects: { phy_def: 6, mag_def: 2, speed: -6, hp_max: 19, phy_atk: 2 },
        desc: "【重甲】曾经镶满铜钉的硬皮战靴，如今铜钉掉了一多半，防御力大打折扣。"
    },
    {
        id: "feet_014",
        name: "补丁行军靴", // 均衡：强调“行军”、“补丁”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 351,
        durability: 35,
        effects: { phy_def: 4, mag_def: 4, speed: -6, hp_max: 19, phy_atk: 2 },
        desc: "【重甲】打满了各色补丁的行军靴，虽然丑陋，但厚实的布层提供了可靠的防护。"
    },
    {
        id: "feet_015",
        name: "烟熏防虫靴", // 法术偏向：强调“烟熏”（防瘴/法）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 351,
        durability: 35,
        effects: { phy_def: 2, mag_def: 6, speed: -6, hp_max: 19, phy_atk: 2 },
        desc: "【重甲】南方山民用草药烟熏过的旧靴子，散发着怪味，却能防些毒虫瘴气。"
    },

    // --- [High Tier] R1 重甲 (总防: ~12 | HP: 25 | 速: -9 | 攻: 3) ---
    {
        id: "feet_016",
        name: "钝铁护胫靴", // 物理偏向：强调“铁护胫”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 450,
        durability: 45,
        effects: { phy_def: 9, mag_def: 3, speed: -9, hp_max: 25, phy_atk: 3 },
        desc: "【重甲】绑着两块厚钝铁板的靴子，边缘粗糙割手，那是被兵器反复劈砍的痕迹。"
    },
    {
        id: "feet_017",
        name: "厚底杂木靴", // 均衡：强调“厚底”、“杂木”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 450,
        durability: 45,
        effects: { phy_def: 6, mag_def: 6, speed: -9, hp_max: 25, phy_atk: 3 },
        desc: "【重甲】用沉重的杂木拼接鞋底，走起路来咚咚作响，胜在稳固。"
    },
    {
        id: "feet_018",
        name: "碎玉镶嵌靴", // 法术偏向：强调“碎玉”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 1,
        value: 450,
        durability: 45,
        effects: { phy_def: 3, mag_def: 9, speed: -9, hp_max: 25, phy_atk: 3 },
        desc: "【重甲】鞋面上镶嵌着几颗灰扑扑的碎玉石，虽然成色极差，毕竟聊胜于无。"
    }
];
// Batch 3: Rarity 1 - Light (轻甲)
// IDs: feet_019 - feet_027
const feet_r1_batch3 = [
    // --- [Low Tier] R1 轻甲 (总防: ~2 | 速: 2 | 售价: 180) ---
    {
        id: "feet_019",
        name: "粗制生皮靴", // 物理偏向：强调“生皮”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 180,
        durability: 20,
        effects: { phy_def: 2, mag_def: 0, speed: 2 },
        desc: "【轻甲】用未经鞣制的生皮随意缝合的鞋子，又硬又磨脚，勉强能跑起来。"
    },
    {
        id: "feet_020",
        name: "脱色猎人靴", // 均衡：强调“猎人”（通用）
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 180,
        durability: 20,
        effects: { phy_def: 1, mag_def: 1, speed: 2 },
        desc: "【轻甲】一双褪色严重的皮靴，原本可能是某个老猎人的心爱之物。"
    },
    {
        id: "feet_021",
        name: "异兽皮残履", // 法术偏向：强调“异兽”（魔力）
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 180,
        durability: 20,
        effects: { phy_def: 0, mag_def: 2, speed: 2 },
        desc: "【轻甲】用不知名的小兽皮制成，皮质虽烂，却隐约透着一股怪异的气息。"
    },

    // --- [Mid Tier] R1 轻甲 (总防: ~6 | 速: 6 | 售价: 540) ---
    {
        id: "feet_022",
        name: "风干硬皮靴", // 物理偏向：强调“硬皮”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 540,
        durability: 30,
        effects: { phy_def: 5, mag_def: 1, speed: 6 },
        desc: "【轻甲】彻底风干的老牛皮靴，质地坚硬如木，对脚踝保护不错。"
    },
    {
        id: "feet_023",
        name: "磨损游侠靴", // 均衡：强调“游侠”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 540,
        durability: 30,
        effects: { phy_def: 3, mag_def: 3, speed: 6 },
        desc: "【轻甲】鞋底几乎磨平了，皮面也满是划痕，见证了穿戴者走过的漫长弯路。"
    },
    {
        id: "feet_024",
        name: "刻纹旧皮靴", // 法术偏向：强调“刻纹”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 540,
        durability: 30,
        effects: { phy_def: 1, mag_def: 5, speed: 6 },
        desc: "【轻甲】鞋帮上刻着模糊不清的纹路，似乎是某种祈福仪式留下的痕迹。"
    },

    // --- [High Tier] R1 轻甲 (总防: ~9 | 速: 9 | 售价: 810) ---
    {
        id: "feet_025",
        name: "蛮牛皮战靴", // 物理偏向：强调“蛮牛”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 810,
        durability: 40,
        effects: { phy_def: 7, mag_def: 2, speed: 9 },
        desc: "【轻甲】用整块蛮牛皮制作，虽然做工粗糙，但皮质本身的韧性极佳。"
    },
    {
        id: "feet_026",
        name: "补丁斥候靴", // 均衡：强调“斥候”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 810,
        durability: 40,
        effects: { phy_def: 5, mag_def: 4, speed: 9 },
        desc: "【轻甲】为了轻便剔除了所有装饰，虽然打着补丁，但依然轻快利落。"
    },
    {
        id: "feet_027",
        name: "褪色灵皮履", // 法术偏向：强调“灵皮”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 1,
        value: 810,
        durability: 40,
        effects: { phy_def: 2, mag_def: 7, speed: 9 },
        desc: "【轻甲】原本可能染着鲜艳的祭祀颜色，如今只剩下斑驳的法力残留。"
    }
];
// Batch 4: Rarity 1 - Leather (皮甲)
// IDs: feet_028 - feet_036
const feet_r1_batch4 = [
    // --- [Low Tier] R1 皮甲 (总防: ~2 | 速: 3 | 攻: 1 | 暴: 1 | 售价: ~450) ---
    {
        id: "feet_028",
        name: "破烂鼠皮鞋", // 物理偏向：强调“鼠皮”（低级皮料）
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 450,
        durability: 15,
        effects: { phy_def: 2, mag_def: 0, speed: 3, phy_atk: 1, crit: 1 },
        desc: "【皮甲】用好几张老鼠皮勉强缝合的鞋子，毛发脱落，散发着难闻的气味。"
    },
    {
        id: "feet_029",
        name: "拼凑碎皮靴", // 均衡：强调“拼凑”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 450,
        durability: 15,
        effects: { phy_def: 1, mag_def: 1, speed: 3, phy_atk: 1, crit: 1 },
        desc: "【皮甲】用制皮剩下的边角料拼凑而成，颜色深浅不一，针脚歪歪扭扭。"
    },
    {
        id: "feet_030",
        name: "发霉兽皮履", // 法术偏向：强调“发霉”（状态差但有微弱生物质感）
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 450,
        durability: 15,
        effects: { phy_def: 0, mag_def: 2, speed: 3, phy_atk: 1, crit: 1 },
        desc: "【皮甲】放在地窖里太久而发霉的皮鞋，虽然长了绿毛，但依稀能辨认出原本的形制。"
    },

    // --- [Mid Tier] R1 皮甲 (总防: ~5 | 速: 8 | 攻: 2 | 暴: 1 | 售价: ~855) ---
    {
        id: "feet_031",
        name: "粗缝狼皮靴", // 物理偏向：强调“狼皮”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 855,
        durability: 25,
        effects: { phy_def: 4, mag_def: 1, speed: 8, phy_atk: 2, crit: 1 },
        desc: "【皮甲】猎户自家缝制的狼皮靴，保留了部分硬毛，粗狂耐用。"
    },
    {
        id: "feet_032",
        name: "猎户旧皮靴", // 均衡：强调“旧”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 855,
        durability: 25,
        effects: { phy_def: 3, mag_def: 2, speed: 8, phy_atk: 2, crit: 1 },
        desc: "【皮甲】被穿得油光锃亮的旧皮靴，虽然鞋底磨薄了，但极其合脚。"
    },
    {
        id: "feet_033",
        name: "浸血祭祀履", // 法术偏向：强调“浸血”、“祭祀”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 855,
        durability: 25,
        effects: { phy_def: 1, mag_def: 4, speed: 8, phy_atk: 2, crit: 1 },
        desc: "【皮甲】似乎是在某种乡野祭祀中穿过的皮履，浸染过牲畜的血，有些阴森。"
    },

    // --- [High Tier] R1 皮甲 (总防: ~7 | 速: 11 | 攻: 3 | 暴: 2 | 售价: ~1305) ---
    {
        id: "feet_034",
        name: "硬化野猪靴", // 物理偏向：强调“硬化”、“野猪”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1305,
        durability: 35,
        effects: { phy_def: 5, mag_def: 2, speed: 11, phy_atk: 3, crit: 2 },
        desc: "【皮甲】用老野猪背皮经火烤硬化制成，防御力在皮甲中算是不错的。"
    },
    {
        id: "feet_035",
        name: "巡林客旧靴", // 均衡：强调“巡林客”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1305,
        durability: 35,
        effects: { phy_def: 4, mag_def: 3, speed: 11, phy_atk: 3, crit: 2 },
        desc: "【皮甲】某个落魄巡林客变卖的装备，虽然陈旧，但依然能让人在林间健步如飞。"
    },
    {
        id: "feet_036",
        name: "刻符灵皮靴", // 法术偏向：强调“刻符”
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 1,
        value: 1305,
        durability: 35,
        effects: { phy_def: 2, mag_def: 5, speed: 11, phy_atk: 3, crit: 2 },
        desc: "【皮甲】皮面上刻着粗糙的符文，虽然大部分已经模糊，但仍流转着微弱的气息。"
    }
];
// Batch 5: Rarity 1 - Cloth (布甲)
// IDs: feet_037 - feet_045
const feet_r1_batch5 = [
    // --- [Low Tier] R1 布甲 (总防: 1 | 速: 3 | 法攻: 1 | 气/神: 1 | 售价: 315) ---
    {
        id: "feet_037",
        name: "粗麻绑腿鞋", // 物理偏向：强调“绑腿”（稍稳固）
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 10,
        effects: { phy_def: 1, mag_def: 0, speed: 3, mag_atk: 1, qi: 1 },
        desc: "【布甲】农夫下地穿的粗麻鞋，绑腿缠得很紧，虽然防不住刀剑，但跑得快。"
    },
    {
        id: "feet_038",
        name: "破洞草编履", // 均衡：强调“草编”
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 10,
        effects: { phy_def: 0, mag_def: 1, speed: 3, mag_atk: 1, shen: 1 },
        desc: "【布甲】鞋底都磨穿了的草鞋，透风凉快，穿在脚上轻若无物。"
    },
    {
        id: "feet_039",
        name: "发黄旧布鞋", // 法术偏向：强调“旧布”（陈年老物）
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 315,
        durability: 10,
        effects: { phy_def: 0, mag_def: 1, speed: 3, mag_atk: 1, qi: 1 },
        desc: "【布甲】一双泛黄的白布鞋，曾在香火缭绕的庙里供奉过，沾了点灵气。"
    },

    // --- [Mid Tier] R1 布甲 (总防: 3 | 速: 9 | 法攻: 2 | 气/神: 1 | 售价: 720) ---
    {
        id: "feet_040",
        name: "纳底葛布鞋", // 物理偏向：强调“纳底”（厚底）
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 720,
        durability: 15,
        effects: { phy_def: 2, mag_def: 1, speed: 9, mag_atk: 2, qi: 1 },
        desc: "【布甲】鞋底纳了千层棉线，结实耐穿，是穷书生赶考的首选。"
    },
    {
        id: "feet_041",
        name: "行脚僧旧履", // 均衡：强调“行脚僧”
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 720,
        durability: 15,
        effects: { phy_def: 1, mag_def: 2, speed: 9, mag_atk: 2, shen: 1 },
        desc: "【布甲】云游僧人留下的旧鞋，沾染了路途的风霜，依然步履轻盈。"
    },
    {
        id: "feet_042",
        name: "褪色祭文履", // 法术偏向：强调“祭文”
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 720,
        durability: 15,
        effects: { phy_def: 0, mag_def: 3, speed: 9, mag_atk: 2, qi: 1 },
        desc: "【布甲】鞋面上用朱砂写过祭文，虽然褪色严重，但还能引动微弱气机。"
    },

    // --- [High Tier] R1 布甲 (总防: 5 | 速: 14 | 法攻: 3 | 气/神: 2 | 售价: 1170) ---
    {
        id: "feet_043",
        name: "硬衬快行靴", // 物理偏向：强调“硬衬”
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 1170,
        durability: 20,
        effects: { phy_def: 4, mag_def: 1, speed: 14, mag_atk: 3, qi: 2 },
        desc: "【布甲】内里衬了硬布的快靴，驿卒专用，跑死马也没事。"
    },
    {
        id: "feet_044",
        name: "云纹旧锦履", // 均衡：强调“云纹”、“锦”（破落富贵）
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 1170,
        durability: 20,
        effects: { phy_def: 2, mag_def: 3, speed: 14, mag_atk: 3, qi: 1, shen: 1 },
        desc: "【布甲】虽然锦面已经抽丝起球，但云纹依旧飘逸，似有流风回雪之意。"
    },
    {
        id: "feet_045",
        name: "凝神软布鞋", // 法术偏向：强调“凝神”
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 1,
        value: 1170,
        durability: 20,
        effects: { phy_def: 1, mag_def: 4, speed: 14, mag_atk: 3, shen: 2 },
        desc: "【布甲】材质极其柔软，穿上后心神宁静，仿佛外界的喧嚣都远去了。"
    }
];
// Batch 6: Rarity 2 - Plate (板甲)
// IDs: feet_046 - feet_054
const feet_r2_batch1 = [
    // --- [Low Tier] R2 板甲 (总防: 9 | HP: 55 | 速: -10 | 攻: 4 | 售价: 1260) ---
    {
        id: "feet_046",
        name: "旧式黑铁靴", // 物理偏向：强调“黑铁”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 35,
        effects: { phy_def: 7, mag_def: 2, speed: -10, hp_max: 55, phy_atk: 4 },
        desc: "【板甲】几十年前流行的款式，黑铁打造，虽然笨重且样式过时，但防御力尚可。"
    },
    {
        id: "feet_047",
        name: "翻新军铁靴", // 均衡：强调“翻新”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 35,
        effects: { phy_def: 5, mag_def: 4, speed: -10, hp_max: 55, phy_atk: 4 },
        desc: "【板甲】退役的军用铁靴，经过简单的除锈和打磨，看起来还能再用个几年。"
    },
    {
        id: "feet_048",
        name: "青石镇压履", // 法术偏向：强调“青石”（石材通常带微弱抗性）
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 35,
        effects: { phy_def: 2, mag_def: 7, speed: -10, hp_max: 55, phy_atk: 4 },
        desc: "【板甲】鞋底镶嵌了沉重的青石板，原本是用来练下盘功夫的，意外地能隔绝地气。"
    },

    // --- [Mid Tier] R2 板甲 (总防: 22 | HP: 75 | 速: -24 | 攻: 7 | 售价: 1800) ---
    {
        id: "feet_049",
        name: "厚重熟铁靴", // 物理偏向：强调“熟铁”、“厚重”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1800,
        durability: 45,
        effects: { phy_def: 17, mag_def: 5, speed: -24, hp_max: 75, phy_atk: 7 },
        desc: "【板甲】通体由熟铁浇筑，没有多余的装饰，给人一种踏实但沉闷的感觉。"
    },
    {
        id: "feet_050",
        name: "二手卫戍靴", // 均衡：强调“卫戍”（正规军低配）
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1800,
        durability: 45,
        effects: { phy_def: 11, mag_def: 11, speed: -24, hp_max: 75, phy_atk: 7 },
        desc: "【板甲】城门卫兵淘汰下来的装备，虽然内衬有些磨损，但铁甲依然坚固。"
    },
    {
        id: "feet_051",
        name: "蒙尘铜钉履", // 法术偏向：强调“铜钉”（铜比铁导魔好一点）
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 1800,
        durability: 45,
        effects: { phy_def: 6, mag_def: 16, speed: -24, hp_max: 75, phy_atk: 7 },
        desc: "【板甲】布满灰尘的铁履，密密麻麻的铜钉早已失去光泽，依稀能看出当年的精细。"
    },

    // --- [High Tier] R2 板甲 (总防: 34 | HP: 95 | 速: -38 | 攻: 9 | 售价: 2160) ---
    {
        id: "feet_052",
        name: "坚固钢板靴", // 物理偏向：强调“钢板”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 55,
        effects: { phy_def: 26, mag_def: 8, speed: -38, hp_max: 95, phy_atk: 9 },
        desc: "【板甲】使用了劣质钢材锻造，虽然杂质较多，但硬度远超普通生铁，极其抗揍。"
    },
    {
        id: "feet_053",
        name: "百炼废铁靴", // 均衡：强调“百炼”（工艺好但材料废）
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 55,
        effects: { phy_def: 17, mag_def: 17, speed: -38, hp_max: 95, phy_atk: 9 },
        desc: "【板甲】铁匠尝试百炼法时的失败品，虽然最后成了废铁，但密度惊人，重得离谱。"
    },
    {
        id: "feet_054",
        name: "磨损符文履", // 法术偏向：强调“符文”
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 55,
        effects: { phy_def: 9, mag_def: 25, speed: -38, hp_max: 95, phy_atk: 9 },
        desc: "【板甲】鞋面的符文被磨掉了一半，导致法力流动断断续续，时灵时不灵。"
    }
];
// Batch 7: Rarity 2 - Heavy (重甲)
// IDs: feet_055 - feet_063
const feet_r2_batch2 = [
    // --- [Low Tier] R2 重甲 (总防: 7 | HP: 15 | 速: -5 | 攻: 2 | 售价: 630) ---
    {
        id: "feet_055",
        name: "旧铁掌重靴", // 物理偏向：强调“铁掌”（硬底）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 630,
        durability: 30,
        effects: { phy_def: 5, mag_def: 2, speed: -5, hp_max: 15, phy_atk: 2 },
        desc: "【重甲】一双被踩得变形的旧军靴，前任主人加装了铁掌，虽然难看但很耐磨。"
    },
    {
        id: "feet_056",
        name: "磨损步兵靴", // 均衡：强调“步兵”（基础制式）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 630,
        durability: 30,
        effects: { phy_def: 4, mag_def: 3, speed: -5, hp_max: 15, phy_atk: 2 },
        desc: "【重甲】鞋面的皮子磨损严重，露出了里面的金属内衬，依然能提供基本的防护。"
    },
    {
        id: "feet_057",
        name: "污浊青铜靴", // 法术偏向：强调“青铜”（轻微导魔）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 630,
        durability: 30,
        effects: { phy_def: 2, mag_def: 5, speed: -5, hp_max: 15, phy_atk: 2 },
        desc: "【重甲】表面覆盖着厚厚铜锈的靴子，擦拭后能看到模糊的铭文，似乎有些来头。"
    },

    // --- [Mid Tier] R2 重甲 (总防: 16 | HP: 30 | 速: -12 | 攻: 4 | 售价: 1260) ---
    {
        id: "feet_058",
        name: "翻新镶钉靴", // 物理偏向：强调“翻新”、“镶钉”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 40,
        effects: { phy_def: 12, mag_def: 4, speed: -12, hp_max: 30, phy_atk: 4 },
        desc: "【重甲】原本缺损的铆钉被重新补齐了，虽然新旧不一，但防御力恢复了不少。"
    },
    {
        id: "feet_059",
        name: "老式行伍靴", // 均衡：强调“老式”（过时但可靠）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 40,
        effects: { phy_def: 8, mag_def: 8, speed: -12, hp_max: 30, phy_atk: 4 },
        desc: "【重甲】几十年前的老款式，皮革厚实，鞋底宽大，除了重点没别的毛病。"
    },
    {
        id: "feet_060",
        name: "蒙尘辟邪靴", // 法术偏向：强调“辟邪”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 40,
        effects: { phy_def: 4, mag_def: 12, speed: -12, hp_max: 30, phy_atk: 4 },
        desc: "【重甲】在库房角落吃灰多年的靴子，内衬用朱砂染过，据说能防些不干净的东西。"
    },

    // --- [High Tier] R2 重甲 (总防: 24 | HP: 45 | 速: -18 | 攻: 5 | 售价: 1800) ---
    {
        id: "feet_061",
        name: "缺口精铁靴", // 物理偏向：强调“精铁”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1800,
        durability: 50,
        effects: { phy_def: 18, mag_def: 6, speed: -18, hp_max: 45, phy_atk: 5 },
        desc: "【重甲】曾是精良的精铁战靴，经历恶战后护板上留下了几个吓人的缺口。"
    },
    {
        id: "feet_062",
        name: "二手校尉靴", // 均衡：强调“校尉”（低阶军官）
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1800,
        durability: 50,
        effects: { phy_def: 12, mag_def: 12, speed: -18, hp_max: 45, phy_atk: 5 },
        desc: "【重甲】从战场上回收的校尉级装备，虽然有修补痕迹，但用料远超普通士兵。"
    },
    {
        id: "feet_063",
        name: "暗淡灵纹靴", // 法术偏向：强调“暗淡灵纹”
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 2,
        value: 1800,
        durability: 50,
        effects: { phy_def: 6, mag_def: 18, speed: -18, hp_max: 45, phy_atk: 5 },
        desc: "【重甲】靴筒上的灵纹已经失去了光泽，变得暗淡无光，但仍残留着些许法力波动。"
    }
];
// Batch 8: Rarity 2 - Light (轻甲)
// IDs: feet_064 - feet_072
const feet_r2_batch3 = [
    // --- [Low Tier] R2 轻甲 (总防: 6 | 速: 6 | 售价: 1080) ---
    {
        id: "feet_064",
        name: "皲裂老皮靴", // 物理偏向：强调“老皮”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 1080,
        durability: 25,
        effects: { phy_def: 5, mag_def: 1, speed: 6 },
        desc: "【轻甲】因长期缺乏保养而表面皲裂的皮靴，虽然卖相不佳，但皮革依然硬实。"
    },
    {
        id: "feet_065",
        name: "受潮游骑靴", // 均衡：强调“游骑”（制式轻便型）
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 1080,
        durability: 25,
        effects: { phy_def: 3, mag_def: 3, speed: 6 },
        desc: "【轻甲】仓库中受潮的旧靴子，皮革有些发软，胜在穿脱方便，不影响活动。"
    },
    {
        id: "feet_066",
        name: "褪色灵鹿靴", // 法术偏向：强调“灵鹿”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 1080,
        durability: 25,
        effects: { phy_def: 1, mag_def: 5, speed: 6 },
        desc: "【轻甲】用灵鹿皮制作的软靴，颜色早已褪尽，但皮质中仍残留着些许轻盈的灵性。"
    },

    // --- [Mid Tier] R2 轻甲 (总防: 12 | 速: 12 | 售价: 2160) ---
    {
        id: "feet_067",
        name: "风干硬革靴", // 物理偏向：强调“硬革”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 35,
        effects: { phy_def: 9, mag_def: 3, speed: 12 },
        desc: "【轻甲】经过特殊风干处理的厚皮靴，质地介于皮革与甲片之间，防御力相当可靠。"
    },
    {
        id: "feet_068",
        name: "旧缝走马靴", // 均衡：强调“走马”（快行用）
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 35,
        effects: { phy_def: 6, mag_def: 6, speed: 12 },
        desc: "【轻甲】鞋底加厚的走马靴，针脚虽然补过，但整体结构依然稳固，适合长距离奔袭。"
    },
    {
        id: "feet_069",
        name: "浆洗灰鹤履", // 法术偏向：强调“灰鹤”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 2160,
        durability: 35,
        effects: { phy_def: 3, mag_def: 9, speed: 12 },
        desc: "【轻甲】多次洗涤导致发灰的鹤羽靴，羽丝虽然有些凌乱，但其避法的特性还在。"
    },

    // --- [High Tier] R2 轻甲 (总防: 18 | 速: 18 | 售价: 3240) ---
    {
        id: "feet_070",
        name: "磨损青兕靴", // 物理偏向：强调“青兕”（坚韧皮料）
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 3240,
        durability: 45,
        effects: { phy_def: 14, mag_def: 4, speed: 18 },
        desc: "【轻甲】用青兕皮制成的高级皮靴，虽然侧面有明显的磨损痕迹，但寻常流矢难穿。"
    },
    {
        id: "feet_071",
        name: "二手疾风靴", // 均衡：强调“疾风”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 3240,
        durability: 45,
        effects: { phy_def: 9, mag_def: 9, speed: 18 },
        desc: "【轻甲】从当铺淘来的旧式疾风靴，虽然法力流失了不少，但其轻便程度依然惊人。"
    },
    {
        id: "feet_072",
        name: "残破织锦靴", // 法术偏向：强调“织锦”
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 2,
        value: 3240,
        durability: 45,
        effects: { phy_def: 4, mag_def: 14, speed: 18 },
        desc: "【轻甲】曾是豪门弟子的配靴，织锦面料已有破损，但内衬的法力隔层保存完好。"
    }
];
// Batch 9: Rarity 2 - Leather (皮甲)
// IDs: feet_073 - feet_081
const feet_r2_batch4 = [
    // --- [Low Tier] R2 皮甲 (总防: 3 | 速: 5 | 攻: 2 | 暴: 2 | 售价: 1620) ---
    {
        id: "feet_073",
        name: "褪色狼皮靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 1620,
        durability: 20,
        effects: { phy_def: 2, mag_def: 1, speed: 5, phy_atk: 2, crit: 2 },
        desc: "【皮甲】原本深青色的狼皮已经褪成了土灰色，皮质有些发硬，好在还能包裹住脚踝。"
    },
    {
        id: "feet_074",
        name: "皲裂鹿皮履", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 1620,
        durability: 20,
        effects: { phy_def: 1, mag_def: 2, speed: 5, phy_atk: 2, crit: 2 },
        desc: "【皮甲】轻便的鹿皮鞋，侧面由于干燥出现了不少细小的皲裂纹，需得小心避水。"
    },
    {
        id: "feet_075",
        name: "陈旧蛇皮鞋", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 1620,
        durability: 20,
        effects: { phy_def: 1, mag_def: 2, speed: 5, phy_atk: 2, crit: 2 },
        desc: "【皮甲】用某种大蛇的腹皮制成，鳞片早已不再光滑，甚至有些翘起，散发着一股陈腐的味道。"
    },

    // --- [Mid Tier] R2 皮甲 (总防: 9 | 速: 15 | 攻: 4 | 暴: 3 | 售价: 3600) ---
    {
        id: "feet_076",
        name: "陈年野猪靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3600,
        durability: 30,
        effects: { phy_def: 7, mag_def: 2, speed: 15, phy_atk: 4, crit: 3 },
        desc: "【皮甲】老野猪皮经过多年穿戴，已经极其贴合脚型，虽有些油腻污渍，却非常坚韧。"
    },
    {
        id: "feet_077",
        name: "浆洗走山靴", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3600,
        durability: 30,
        effects: { phy_def: 5, mag_def: 4, speed: 15, phy_atk: 4, crit: 3 },
        desc: "【皮甲】多次浆洗使得这双山地靴的皮革变得略显薄脆，但在复杂地形中依然能提供稳定的抓地力。"
    },
    {
        id: "feet_078",
        name: "暗淡灵纹皮履", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 3600,
        durability: 30,
        effects: { phy_def: 2, mag_def: 7, speed: 15, phy_atk: 4, crit: 3 },
        desc: "【皮甲】曾经流转着灵光的手工皮履，如今法力几近干涸，只剩下若有若无的纹路在鞋面上。"
    },

    // --- [High Tier] R2 皮甲 (总防: 15 | 速: 25 | 攻: 5 | 暴: 4 | 售价: 5490) ---
    {
        id: "feet_079",
        name: "剥蚀青牛靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 5490,
        durability: 40,
        effects: { phy_def: 11, mag_def: 4, speed: 25, phy_atk: 5, crit: 4 },
        desc: "【皮甲】用罕见的青牛皮制成，表面因长期摩擦而变得斑驳不平，但其防劈砍的本色仍在。"
    },
    {
        id: "feet_080",
        name: "翻新猎隼靴", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 5490,
        durability: 40,
        effects: { phy_def: 8, mag_def: 7, speed: 25, phy_atk: 5, crit: 4 },
        desc: "【皮甲】经过高手匠人翻新的轻便皮靴，鞋尖处补强了皮革，跑动时极具爆发力。"
    },
    {
        id: "feet_081",
        name: "斑驳幻皮靴", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 2,
        value: 5490,
        durability: 40,
        effects: { phy_def: 4, mag_def: 11, speed: 25, phy_atk: 5, crit: 4 },
        desc: "【皮甲】使用能随光线变色的幻兽皮制作，因年代久远，颜色变换已不再流畅，显得斑斑点点。"
    }
];
// Batch 10: Rarity 2 - Cloth (布甲)
// IDs: feet_082 - feet_090
const feet_r2_batch5 = [
    // --- [Low Tier] R2 布甲 (总防: 2 | 速: 6 | 法攻: 2 | 属性: 2 | 售价: 1260) ---
    {
        id: "feet_082",
        name: "粗纳厚麻鞋", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 15,
        effects: { phy_def: 2, mag_def: 0, speed: 6, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】鞋底用粗麻绳纳得极厚，虽然样式老旧且有些硌脚，但比普通草鞋耐磨得多。"
    },
    {
        id: "feet_083",
        name: "二手云纹履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 15,
        effects: { phy_def: 1, mag_def: 1, speed: 6, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】从旧货摊淘来的云纹鞋，绸面已有不少抽丝，好在内衬依然完整，步履轻盈。"
    },
    {
        id: "feet_084",
        name: "浆洗旧禅鞋", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 1260,
        durability: 15,
        effects: { phy_def: 0, mag_def: 2, speed: 6, mag_atk: 2, qi: 1, shen: 1 },
        desc: "【布甲】洗得发白的僧鞋，鞋帮处还有缝补的痕迹，因常年经受香火熏陶，带有一丝清净之意。"
    },

    // --- [Mid Tier] R2 布甲 (总防: 6 | 速: 18 | 法攻: 4 | 属性: 3 | 售价: 3060) ---
    {
        id: "feet_085",
        name: "补丁快行布履", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3060,
        durability: 25,
        effects: { phy_def: 5, mag_def: 1, speed: 18, mag_atk: 4, qi: 2, shen: 1 },
        desc: "【布甲】由于长期快步疾行，鞋头打了几层厚厚的补丁，虽然难看，却大大增加了耐冲击性。"
    },
    {
        id: "feet_086",
        name: "退役驿卒鞋", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3060,
        durability: 25,
        effects: { phy_def: 3, mag_def: 3, speed: 18, mag_atk: 4, qi: 1, shen: 2 },
        desc: "【布甲】官家驿站淘汰下来的旧鞋，专为长途奔波设计，虽然皮革部分已经酥脆，但整体仍很实用。"
    },
    {
        id: "feet_087",
        name: "磨损云纹锦履", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 3060,
        durability: 25,
        effects: { phy_def: 1, mag_def: 5, speed: 18, mag_atk: 4, qi: 1, shen: 2 },
        desc: "【布甲】锦面上的纹路因反复摩擦而变得模糊，原本镶嵌的细碎 文也已脱落，仅余微弱灵气。"
    },

    // --- [High Tier] R2 布甲 (总防: 10 | 速: 30 | 法攻: 5 | 属性: 4 | 售价: 4770) ---
    {
        id: "feet_088",
        name: "精纳走方鞋", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 4770,
        durability: 35,
        effects: { phy_def: 8, mag_def: 2, speed: 30, mag_atk: 5, qi: 2, shen: 2 },
        desc: "【布甲】走方郎中常穿的厚底布鞋，纳线极密，足以应对碎石山路，是老旧装备里的精品。"
    },
    {
        id: "feet_089",
        name: "旧锦御风履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 4770,
        durability: 35,
        effects: { phy_def: 5, mag_def: 5, speed: 30, mag_atk: 5, qi: 2, shen: 2 },
        desc: "【布甲】早年制作的御风履，因存放不当导致色泽暗淡，但内嵌的轻量化结构依然能助人疾行。"
    },
    {
        id: "feet_090",
        name: "翻新道人履", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 2,
        value: 4770,
        durability: 35,
        effects: { phy_def: 2, mag_def: 8, speed: 30, mag_atk: 5, qi: 2, shen: 2 },
        desc: "【布甲】经过重新纳底的道家法履，鞋面虽然破旧，但换上了全新的灵布衬底，气息悠长。"
    }
];
// Batch 11: Rarity 3 - Plate (板甲)
// IDs: feet_091 - feet_099
// 风格：正规军制式、军士配发、品质良好
const feet_r3_batch1 = [
    // --- [Low Tier] R3 板甲 (总防: 18 | HP: 85 | 速: -20 | 攻: 7 | 售价: 2970) ---
    {
        id: "feet_091",
        name: "制式生铁板靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 2970,
        durability: 65,
        effects: { phy_def: 14, mag_def: 4, speed: -20, hp_max: 85, phy_atk: 7 },
        req: { jing: 12 },
        desc: "【板甲】兵工坊大规模生产的制式重靴，虽然造型简单，但厚实的铁甲片提供了极佳的防御。"
    },
    {
        id: "feet_092",
        name: "坚固步卒板靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 2970,
        durability: 65,
        effects: { phy_def: 9, mag_def: 9, speed: -20, hp_max: 85, phy_atk: 7 },
        req: { jing: 12 },
        desc: "【板甲】配发给资深步卒的防御靴，鞋面经过加固处理，能有效抵御正面阵地战的冲击。"
    },
    {
        id: "feet_093",
        name: "披甲行阵靴", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 2970,
        durability: 65,
        effects: { phy_def: 4, mag_def: 14, speed: -20, hp_max: 85, phy_atk: 7 },
        req: { jing: 12 },
        desc: "【板甲】为了应对战场上的流弹与流火，在铁靴内衬里缝入了防震的皮革，对法术伤害有一定的缓冲作用。"
    },

    // --- [Mid Tier] R3 板甲 (总防: 36 | HP: 115 | 速: -40 | 攻: 11 | 售价: 4050) ---
    {
        id: "feet_094",
        name: "精工护胫铁靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4050,
        durability: 85,
        effects: { phy_def: 27, mag_def: 9, speed: -40, hp_max: 115, phy_atk: 11 },
        req: { jing: 15 },
        desc: "【板甲】由熟练铁匠打造的护胫靴，铁片交叠紧密，虽然沉重，但能完美护住脚踝与小腿。"
    },
    {
        id: "feet_095",
        name: "军用厚板战靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4050,
        durability: 85,
        effects: { phy_def: 18, mag_def: 18, speed: -40, hp_max: 115, phy_atk: 11 },
        req: { jing: 15 },
        desc: "【板甲】标准的重装军士配备，用料扎实，不仅防劈砍，也能抵挡战场上复杂的元素冲击。"
    },
    {
        id: "feet_096",
        name: "叠片合板靴", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4050,
        durability: 85,
        effects: { phy_def: 9, mag_def: 27, speed: -40, hp_max: 115, phy_atk: 11 },
        req: { jing: 15 },
        desc: "【板甲】采用多层异种金属交叠打造，对地脉波动和法术传导有极强的阻断能力。"
    },

    // --- [High Tier] R3 板甲 (总防: 50 | HP: 145 | 速: -56 | 攻: 14 | 售价: 4995) ---
    {
        id: "feet_097",
        name: "军士长厚钢靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4995,
        durability: 105,
        effects: { phy_def: 38, mag_def: 12, speed: -56, hp_max: 145, phy_atk: 14 },
        req: { jing: 18 },
        desc: "【板甲】军士长级别的定制钢靴，整块钢板冲压而成，防御极高，一脚踏出能碎裂石砖。"
    },
    {
        id: "feet_098",
        name: "巡营坚韧重靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4995,
        durability: 105,
        effects: { phy_def: 25, mag_def: 25, speed: -56, hp_max: 145, phy_atk: 14 },
        req: { jing: 18 },
        desc: "【板甲】为了应对漫长的巡营，鞋底做了特殊的防滑与平衡处理，在保证绝对防御的同时提高了稳定性。"
    },
    {
        id: "feet_099",
        name: "内衬精铁板履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 3,
        value: 4995,
        durability: 105,
        effects: { phy_def: 12, mag_def: 38, speed: -56, hp_max: 145, phy_atk: 14 },
        req: { jing: 18 },
        desc: "【板甲】在精铁板层之下缝入了浸泡过药水的厚毯，对大范围的法术轰炸有显著的削弱作用。"
    }
];
// Batch 12: Rarity 3 - Heavy (重甲)
// IDs: feet_100 - feet_108
// 风格：正式军士装备、稳重耐用
const feet_r3_batch2 = [
    // --- [Low Tier] R3 重甲 (总防: 13 | HP: 40 | 速: -10 | 攻: 4 | 售价: 2025) ---
    {
        id: "feet_100",
        name: "步卒镶钉靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 2025,
        durability: 55,
        effects: { phy_def: 10, mag_def: 3, speed: -10, hp_max: 40, phy_atk: 4 },
        req: { jing: 10 },
        desc: "【重甲】步兵营通用的战斗靴，鞋面上钉有密集的圆头钢钉，防磨且耐冲击。"
    },
    {
        id: "feet_101",
        name: "制式重皮靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 2025,
        durability: 55,
        effects: { phy_def: 7, mag_def: 6, speed: -10, hp_max: 40, phy_atk: 4 },
        req: { jing: 10 },
        desc: "【重甲】由多层硬熟皮叠压制成的军靴，内衬薄铁板，是军中常见的防御装备。"
    },
    {
        id: "feet_102",
        name: "军用护胫靴", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 2025,
        durability: 55,
        effects: { phy_def: 3, mag_def: 10, speed: -10, hp_max: 40, phy_atk: 4 },
        req: { jing: 10 },
        desc: "【重甲】针对战场流火设计的护胫靴，皮革经过特殊硝制，对灼烧类法术有较好的防护。"
    },

    // --- [Mid Tier] R3 重甲 (总防: 26 | HP: 58 | 速: -20 | 攻: 6 | 售价: 3186) ---
    {
        id: "feet_103",
        name: "加固精铁靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 3186,
        durability: 75,
        effects: { phy_def: 20, mag_def: 6, speed: -20, hp_max: 58, phy_atk: 6 },
        req: { jing: 13 },
        desc: "【重甲】在关键部位额外焊接了精铁片的重靴，能有效防御下盘的横扫攻击。"
    },
    {
        id: "feet_104",
        name: "熟铁鳞甲靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 3186,
        durability: 75,
        effects: { phy_def: 13, mag_def: 13, speed: -20, hp_max: 58, phy_atk: 6 },
        req: { jing: 13 },
        desc: "【重甲】仿照鱼鳞结构打造的金属靴，兼顾了灵活性与防御力，是资深军士的常用装备。"
    },
    {
        id: "feet_105",
        name: "阵列步兵靴", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 3186,
        durability: 75,
        effects: { phy_def: 6, mag_def: 20, speed: -20, hp_max: 58, phy_atk: 6 },
        req: { jing: 13 },
        desc: "【重甲】阵列作战时配发的防御靴，由于加入了阻法材质，能大幅降低地面震荡法术的伤害。"
    },

    // --- [High Tier] R3 重甲 (总防: 39 | HP: 75 | 速: -30 | 攻: 8 | 售价: 4320) ---
    {
        id: "feet_106",
        name: "军士长甲靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 4320,
        durability: 95,
        effects: { phy_def: 29, mag_def: 10, speed: -30, hp_max: 75, phy_atk: 8 },
        req: { jing: 16 },
        desc: "【重甲】配发给基层统领的厚重战靴，整体由优质熟铁打造，护盾面积极大。"
    },
    {
        id: "feet_107",
        name: "战阵耐磨靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 4320,
        durability: 95,
        effects: { phy_def: 20, mag_def: 19, speed: -30, hp_max: 75, phy_atk: 8 },
        req: { jing: 16 },
        desc: "【重甲】专为持久战设计的耐磨重靴，在多次修补中加固了铁底，极其结实。"
    },
    {
        id: "feet_108",
        name: "精练护足靴", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 3,
        value: 4320,
        durability: 95,
        effects: { phy_def: 10, mag_def: 29, speed: -30, hp_max: 75, phy_atk: 8 },
        req: { jing: 16 },
        desc: "【重甲】经过精炼脱渣处理的金属靴，对元素的排斥性极强，是冲锋陷阵时的可靠保障。"
    }
];
// Batch 13: Rarity 3 - Light (轻甲)
// IDs: feet_109 - feet_117
// 风格：正式军用、结构稳固、整洁耐用
const feet_r3_batch3 = [
    // --- [Low Tier] R3 轻甲 (总防: 10 | 速: 10 | 售价: 2700) ---
    {
        id: "feet_109",
        name: "制式熟皮靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 2700,
        durability: 45,
        effects: { phy_def: 8, mag_def: 2, speed: 10 },
        req: { shen: 8 },
        desc: "【轻甲】兵工坊批量鞣制的熟皮靴，皮质坚韧且厚度均匀，是普通轻步兵的标准配备。"
    },
    {
        id: "feet_110",
        name: "军用巡哨靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 2700,
        durability: 45,
        effects: { phy_def: 5, mag_def: 5, speed: 10 },
        req: { shen: 8 },
        desc: "【轻甲】专为营地巡哨设计的轻便靴，鞋底软硬适中，能够适应多种地面的长时间行走。"
    },
    {
        id: "feet_111",
        name: "执勤防水履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 2700,
        durability: 45,
        effects: { phy_def: 2, mag_def: 8, speed: 10 },
        req: { shen: 8 },
        desc: "【轻甲】皮革经过桐油反复浸泡，不仅能防泥水，还能隔绝战场上细微的法术余波。"
    },

    // --- [Mid Tier] R3 轻甲 (总防: 20 | 速: 20 | 售价: 5400) ---
    {
        id: "feet_112",
        name: "精缝野猪靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 5400,
        durability: 60,
        effects: { phy_def: 15, mag_def: 5, speed: 20 },
        req: { shen: 12 },
        desc: "【轻甲】采用厚实的野猪背皮精工缝制，关键部位加固了缝线，比普通皮靴更抗劈砍。"
    },
    {
        id: "feet_113",
        name: "资深斥候靴", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 5400,
        durability: 60,
        effects: { phy_def: 10, mag_def: 10, speed: 20 },
        req: { shen: 12 },
        desc: "【轻甲】配发给资深斥候的进阶装备，在追求速度的同时，也兼顾了在复杂环境下的防御能力。"
    },
    {
        id: "feet_114",
        name: "浸药防腐靴", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 5400,
        durability: 60,
        effects: { phy_def: 5, mag_def: 15, speed: 20 },
        req: { shen: 12 },
        desc: "【轻甲】制作过程中加入了多种抗魔药粉，虽然颜色略显灰暗，但在对抗元素攻击时表现出色。"
    },

    // --- [High Tier] R3 轻甲 (总防: 30 | 速: 30 | 售价: 8100) ---
    {
        id: "feet_115",
        name: "营伍校阅战靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 8100,
        durability: 75,
        effects: { phy_def: 22, mag_def: 8, speed: 30 },
        req: { shen: 15 },
        desc: "【轻甲】大营校阅时配发给优秀军士的战靴，用料上乘，防护能力达到了轻甲的极致。"
    },
    {
        id: "feet_116",
        name: "精锐疾行靴", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 8100,
        durability: 75,
        effects: { phy_def: 15, mag_def: 15, speed: 30 },
        req: { shen: 15 },
        desc: "【轻甲】专供精锐快步兵使用的皮靴，极其合脚，能让人在长途奔袭后依然保持战力。"
    },
    {
        id: "feet_117",
        name: "护阵灵皮靴", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 3,
        value: 8100,
        durability: 75,
        effects: { phy_def: 8, mag_def: 22, speed: 30 },
        req: { shen: 15 },
        desc: "【轻甲】选用了带有一丝灵气的兽皮制成，不仅穿着舒适，更能让士兵在阵法加持下行动更灵活。"
    }
];
// Batch 14: Rarity 3 - 皮甲 (Leather)
// IDs: feet_118 - feet_126
// 风格：正式军用、结构扎实、适合战斗
const feet_r3_batch4 = [
    // --- [Low Tier] R3 皮甲 (总防: 8 | 速: 13 | 攻: 4 | 暴: 3 | 售价: 4995) ---
    {
        id: "feet_118",
        name: "制式狼皮战靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 4995,
        durability: 45,
        effects: { phy_def: 6, mag_def: 2, speed: 13, phy_atk: 4, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】精选成年狼皮制成的战斗靴，皮质经过多次捶打变得坚韧，是精锐轻步兵的常见装备。"
    },
    {
        id: "feet_119",
        name: "军用熟皮硬靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 4995,
        durability: 45,
        effects: { phy_def: 4, mag_def: 4, speed: 13, phy_atk: 4, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】标准的军用制式硬皮靴，做工规整，鞋底加厚处理，能应对各种复杂的战场环境。"
    },
    {
        id: "feet_120",
        name: "执勤软革快履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 4995,
        durability: 45,
        effects: { phy_def: 2, mag_def: 6, speed: 13, phy_atk: 4, crit: 3 },
        req: { shen: 10 },
        desc: "【皮甲】由柔软的熟革缝制而成，活动极为灵便，内层涂有抗魔油脂，适合在营地执勤时穿着。"
    },

    // --- [Mid Tier] R3 皮甲 (总防: 15 | 速: 25 | 攻: 6 | 暴: 4 | 售价: 8370) ---
    {
        id: "feet_121",
        name: "巡哨硬皮护靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 8370,
        durability: 60,
        effects: { phy_def: 11, mag_def: 4, speed: 25, phy_atk: 6, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】资深巡哨使用的护靴，在脚踝处加固了硬质皮革，能有效抵御林间灌木的划伤和物理劈砍。"
    },
    {
        id: "feet_122",
        name: "营伍厚革战靴", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 8370,
        durability: 60,
        effects: { phy_def: 8, mag_def: 7, speed: 25, phy_atk: 6, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】配发给基层伍长的厚皮靴，工艺比普通步卒靴更精细，兼顾了防御与灵敏度。"
    },
    {
        id: "feet_123",
        name: "戍边轻革步履", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 8370,
        durability: 60,
        effects: { phy_def: 4, mag_def: 11, speed: 25, phy_atk: 6, crit: 4 },
        req: { shen: 14 },
        desc: "【皮甲】边防军团使用的轻皮靴，皮质中掺入了少许御魔丝线，能够缓解地脉震荡法术的伤害。"
    },

    // --- [High Tier] R3 皮甲 (总防: 23 | 速: 38 | 攻: 8 | 暴: 6 | 售价: 12555) ---
    {
        id: "feet_124",
        name: "先锋犀皮重靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 12555,
        durability: 75,
        effects: { phy_def: 17, mag_def: 6, speed: 38, phy_atk: 8, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】采用罕见的犀牛皮精制而成，坚韧度极高，是突击先锋在乱军中穿梭的利器。"
    },
    {
        id: "feet_125",
        name: "精锐战皮短靴", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 12555,
        durability: 75,
        effects: { phy_def: 12, mag_def: 11, speed: 38, phy_atk: 8, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】供精锐突击队使用的皮靴，极其贴合脚型，每一寸缝线都经过加固，品质卓越。"
    },
    {
        id: "feet_126",
        name: "军吏扣带皮靴", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 3,
        value: 12555,
        durability: 75,
        effects: { phy_def: 6, mag_def: 17, speed: 38, phy_atk: 8, crit: 6 },
        req: { shen: 18 },
        desc: "【皮甲】基层军吏常用的扣带式皮靴，在保证作战需求的同时，皮革纹路中镶嵌了微弱的法感晶片。"
    }
];
// Batch 15: Rarity 3 - 布甲 (Cloth)
// IDs: feet_127 - feet_135
// 风格：正式军用、品质良好、轻便耐用
const feet_r3_batch5 = [
    // --- [Low Tier] R3 布甲 (总防: 5 | 速: 14 | 法攻: 3 | 属性: 3 | 售价: 3780) ---
    {
        id: "feet_127",
        name: "制式青麻履", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 3780,
        durability: 30,
        effects: { phy_def: 4, mag_def: 1, speed: 14, mag_atk: 3, qi: 2, shen: 1 },
        req: { shen: 10 },
        desc: "【布甲】军中广泛配发的青麻鞋，编织紧密且在脚踝处有加固绑带，适合长时间行走。"
    },
    {
        id: "feet_128",
        name: "营伍纳底鞋", // 均衡 (0.5:0.5)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 3780,
        durability: 30,
        effects: { phy_def: 2, mag_def: 3, speed: 14, mag_atk: 3, qi: 1, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】标准的营伍纳底布鞋，鞋底由多层棉布叠纳而成，静音效果良好且有一定的减震作用。"
    },
    {
        id: "feet_129",
        name: "执勤轻纹履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 3780,
        durability: 30,
        effects: { phy_def: 1, mag_def: 4, speed: 14, mag_atk: 3, qi: 1, shen: 2 },
        req: { shen: 10 },
        desc: "【布甲】轻便的执勤用履，布面上绣有简单的避法纹路，能减少战场上微弱灵气的干扰。"
    },

    // --- [Mid Tier] R3 布甲 (总防: 10 | 速: 30 | 法攻: 5 | 属性: 5 | 售价: 7425) ---
    {
        id: "feet_130",
        name: "巡查加厚布靴", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 7425,
        durability: 45,
        effects: { phy_def: 8, mag_def: 2, speed: 30, mag_atk: 5, qi: 3, shen: 2 },
        req: { shen: 14 },
        desc: "【布甲】巡查官配备的加厚布靴，鞋头和后跟部使用了硬帆布补强，比普通布鞋更耐撞击。"
    },
    {
        id: "feet_131",
        name: "军官行营履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 7425,
        durability: 45,
        effects: { phy_def: 5, mag_def: 5, speed: 30, mag_atk: 5, qi: 2, shen: 3 },
        req: { shen: 14 },
        desc: "【布甲】低阶军官在行营中穿着的便履，用料考究且极其合脚，能让人在忙碌中保持充沛神采。"
    },
    {
        id: "feet_132",
        name: "护法净衣鞋", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 7425,
        durability: 45,
        effects: { phy_def: 2, mag_def: 8, speed: 30, mag_atk: 5, qi: 2, shen: 3 },
        req: { shen: 14 },
        desc: "【布甲】随军法师学徒穿戴的净衣鞋，布料经过灵泉浸泡，对法术侵蚀有一定的抵抗能力。"
    },

    // --- [High Tier] R3 布甲 (总防: 15 | 速: 45 | 法攻: 7 | 属性: 6 | 售价: 10665) ---
    {
        id: "feet_133",
        name: "钢丝混编布靴", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 10665,
        durability: 60,
        effects: { phy_def: 11, mag_def: 4, speed: 45, mag_atk: 7, qi: 3, shen: 3 },
        req: { shen: 18 },
        desc: "【布甲】在棉线中混入了极细的钢丝编织而成，兼顾了布甲的轻盈与金属的坚韧，工艺不凡。"
    },
    {
        id: "feet_134",
        name: "精纳双层快履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 10665,
        durability: 60,
        effects: { phy_def: 8, mag_def: 7, speed: 45, mag_atk: 7, qi: 3, shen: 3 },
        req: { shen: 18 },
        desc: "【布甲】双层布料精纳而成的快履，内部填充了减震绒毛，是军中顶级斥候的长途奔袭利器。"
    },
    {
        id: "feet_135",
        name: "灵丝浸染法履", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 3,
        value: 10665,
        durability: 60,
        effects: { phy_def: 4, mag_def: 11, speed: 45, mag_atk: 7, qi: 3, shen: 3 },
        req: { shen: 18 },
        desc: "【布甲】布料中掺入了微量灵性蚕丝，极大地提高了法术亲和性与防护力，是不可多得的良品。"
    }
];
// Batch 16: Rarity 4 - 板甲 (Plate)
// IDs: feet_136 - feet_144
// 风格：优良品质、将领配发、防御巅峰
const feet_r4_batch1 = [
    // --- [Low Tier] R4 板甲 (总防: 36 | HP: 120 | 速: -40 | 攻: 10 | 售价: 5400) ---
    {
        id: "feet_136",
        name: "精钢虎卫靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 5400,
        durability: 120,
        effects: { phy_def: 27, mag_def: 9, speed: -40, hp_max: 120, phy_atk: 10 },
        req: { jing: 22 },
        desc: "【板甲】采用精选百炼钢打造，由于应用了特殊的虎卫工艺，防御极高，常为宫廷禁卫所选。"
    },
    {
        id: "feet_137",
        name: "明光重凯靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 5400,
        durability: 120,
        effects: { phy_def: 18, mag_def: 18, speed: -40, hp_max: 120, phy_atk: 10 },
        req: { jing: 22 },
        desc: "【板甲】靴面如镜，能反射刺眼的阳光。其结构极其稳固，在抵御各种冲击时表现极佳。"
    },
    {
        id: "feet_138",
        name: "沉金抗御履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 5400,
        durability: 120,
        effects: { phy_def: 9, mag_def: 27, speed: -40, hp_max: 120, phy_atk: 10 },
        req: { jing: 22 },
        desc: "【板甲】在钢铁中掺入了昂贵的沉金材质，使得整双靴子不仅坚硬，更对邪祟之气有天然的隔绝效果。"
    },

    // --- [Mid Tier] R4 板甲 (总防: 54 | HP: 160 | 速: -60 | 攻: 15 | 售价: 7380) ---
    {
        id: "feet_139",
        name: "麒麟吞口重靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7380,
        durability: 150,
        effects: { phy_def: 41, mag_def: 13, speed: -60, hp_max: 160, phy_atk: 15 },
        req: { jing: 28 },
        desc: "【板甲】靴侧铸有威严的麒麟吞口，象征其穿戴者的高贵地位与不凡战力，防御力令人惊叹。"
    },
    {
        id: "feet_140",
        name: "玄钢御风甲靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7380,
        durability: 150,
        effects: { phy_def: 27, mag_def: 27, speed: -60, hp_max: 160, phy_atk: 15 },
        req: { jing: 28 },
        desc: "【板甲】采用深海玄钢合铸而成，虽然重量极其惊人，但其内部的结构设计使得受力异常均匀。"
    },
    {
        id: "feet_141",
        name: "紫微镇魔重履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 7380,
        durability: 150,
        effects: { phy_def: 13, mag_def: 41, speed: -60, hp_max: 160, phy_atk: 15 },
        req: { jing: 28 },
        desc: "【板甲】靴帮刻有紫微星纹，不仅工艺复杂，更对各类元素轰炸有惊人的吸收与转化能力。"
    },

    // --- [High Tier] R4 板甲 (总防: 72 | HP: 200 | 速: -80 | 攻: 20 | 售价: 9360) ---
    {
        id: "feet_142",
        name: "镇岳不动战靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 9360,
        durability: 180,
        effects: { phy_def: 54, mag_def: 18, speed: -80, hp_max: 200, phy_atk: 20 },
        req: { jing: 35 },
        desc: "【板甲】名为镇岳，寓意立足处即如高山般不可撼动。即便面对巨兽冲撞，亦能稳如泰山。"
    },
    {
        id: "feet_143",
        name: "重钧万象甲靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 9360,
        durability: 180,
        effects: { phy_def: 36, mag_def: 36, speed: -80, hp_max: 200, phy_atk: 20 },
        req: { jing: 35 },
        desc: "【板甲】这双战靴体现了冶炼工艺的巅峰，能应对各种极端的战斗环境，是上等板甲中的极品。"
    },
    {
        id: "feet_144",
        name: "承天御魔铁履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 4,
        value: 9360,
        durability: 180,
        effects: { phy_def: 18, mag_def: 54, speed: -80, hp_max: 200, phy_atk: 20 },
        req: { jing: 35 },
        desc: "【板甲】采用传说中的承天矿打造，专门针对大型法术阵地的冲锋设计，是魔法师的噩梦。"
    }
];
// Batch 17: Rarity 4 - 重甲 (Heavy)
// IDs: feet_145 - feet_153
// 风格：优良品质、精锐军需、稳重干练
const feet_r4_batch2 = [
    // --- [Low Tier] R4 重甲 (总防: 21 | HP: 50 | 速: -16 | 攻: 4 | 售价: 3420) ---
    {
        id: "feet_145",
        name: "镔铁校尉靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 3420,
        durability: 100,
        effects: { phy_def: 16, mag_def: 5, speed: -16, hp_max: 50, phy_atk: 4 },
        req: { jing: 18 },
        desc: "【重甲】镔铁打造的校尉级军靴，质地纯净，防护面广，能轻松抵御普通士卒的刀剑劈砍。"
    },
    {
        id: "feet_146",
        name: "铁胎行军靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 3420,
        durability: 100,
        effects: { phy_def: 11, mag_def: 10, speed: -16, hp_max: 50, phy_atk: 4 },
        req: { jing: 18 },
        desc: "【重甲】鞋底内嵌铁胎，兼顾了防护力与支撑性，即使在碎石遍布的复杂战场也能如履平地。"
    },
    {
        id: "feet_147",
        name: "淬灵硬皮靴", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 3420,
        durability: 100,
        effects: { phy_def: 5, mag_def: 16, speed: -16, hp_max: 50, phy_atk: 4 },
        req: { jing: 18 },
        desc: "【重甲】选用成年犀皮经灵泉淬火硬化，对法术轰击有着极强的吸能效果，是应对奇门术法的良品。"
    },

    // --- [Mid Tier] R4 重甲 (总防: 36 | HP: 75 | 速: -28 | 攻: 7 | 售价: 5400) ---
    {
        id: "feet_148",
        name: "虎贲重皮靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 5400,
        durability: 130,
        effects: { phy_def: 27, mag_def: 9, speed: -28, hp_max: 75, phy_atk: 7 },
        req: { jing: 22 },
        desc: "【重甲】虎贲禁卫的配靴，皮革厚实如甲，靴筒处镶嵌有精钢护片，防御力在重甲中出类拔萃。"
    },
    {
        id: "feet_149",
        name: "玄武鳞纹靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 5400,
        durability: 130,
        effects: { phy_def: 18, mag_def: 18, speed: -28, hp_max: 75, phy_atk: 7 },
        req: { jing: 22 },
        desc: "【重甲】靴面刻有玄武鳞纹，寓意绝对的防御。其结构考究，无论是物理对抗还是法力抵御都非常平衡。"
    },
    {
        id: "feet_150",
        name: "辟邪千斤靴", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 5400,
        durability: 130,
        effects: { phy_def: 9, mag_def: 27, speed: -28, hp_max: 75, phy_atk: 7 },
        req: { jing: 22 },
        desc: "【重甲】在靴底混入了避魔金粉，极度沉稳，能有效镇压脚底涌出的各种阴毒法术。"
    },

    // --- [High Tier] R4 重甲 (总防: 52 | HP: 100 | 速: -40 | 攻: 10 | 售价: 7560) ---
    {
        id: "feet_151",
        name: "破阵斩马靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 7560,
        durability: 160,
        effects: { phy_def: 39, mag_def: 13, speed: -40, hp_max: 100, phy_atk: 10 },
        req: { jing: 26 },
        desc: "【重甲】先锋死士冲击敌阵时的不二之选，极其厚重的金属护具能直接弹开敌人的斩马长刀。"
    },
    {
        id: "feet_152",
        name: "骁骑镇远靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 7560,
        durability: 160,
        effects: { phy_def: 26, mag_def: 26, speed: -40, hp_max: 100, phy_atk: 10 },
        req: { jing: 26 },
        desc: "【重甲】边陲重将统领的配备，采用复合金属交叠打造，坚韧异常，象征着镇守远方的铁血意志。"
    },
    {
        id: "feet_153",
        name: "伏魔乌金靴", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 4,
        value: 7560,
        durability: 160,
        effects: { phy_def: 13, mag_def: 39, speed: -40, hp_max: 100, phy_atk: 10 },
        req: { jing: 26 },
        desc: "【重甲】以稀有的乌金矿石混合御魔丝线缝制而成，对针对灵魂与精力的邪术有显著的削弱效果。"
    }
];
// Batch 18: Rarity 4 - 轻甲 (Light)
// IDs: feet_154 - feet_162
// 风格：优良品质、轻盈干练、名门风范
const feet_r4_batch3 = [
    // --- [Low Tier] R4 轻甲 (总防: 16 | 速: 16 | 售价: 5760) ---
    {
        id: "feet_154",
        name: "穿云软皮靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 5760,
        durability: 80,
        effects: { phy_def: 12, mag_def: 4, speed: 16 },
        req: { shen: 15 },
        desc: "【轻甲】选用成年山豹腹皮制成，皮质如丝绸般顺滑却极难割破，是追求极致速度武者的上选。"
    },
    {
        id: "feet_155",
        name: "游龙戏水履", // 均衡 (0.5:0.5)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 5760,
        durability: 80,
        effects: { phy_def: 8, mag_def: 8, speed: 16 },
        req: { shen: 15 },
        desc: "【轻甲】鞋面绣有游龙纹饰，采用防水的鲛皮缝制，无论是在雨林还是滩涂都能行走自如。"
    },
    {
        id: "feet_156",
        name: "流光避火靴", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 5760,
        durability: 80,
        effects: { phy_def: 4, mag_def: 12, speed: 16 },
        req: { shen: 15 },
        desc: "【轻甲】皮革经过特殊矿物浸染，能在黑暗中散发微光，对火系法术有天然的削弱作用。"
    },

    // --- [Mid Tier] R4 轻甲 (总防: 30 | 速: 30 | 售价: 10800) ---
    {
        id: "feet_157",
        name: "精钢扣犀皮靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 10800,
        durability: 110,
        effects: { phy_def: 23, mag_def: 7, speed: 30 },
        req: { shen: 22 },
        desc: "【轻甲】在坚韧的犀皮中嵌入了微小的精钢锁扣，极大地增强了抗穿刺能力，工艺极为复杂。"
    },
    {
        id: "feet_158",
        name: "八方巡夜靴", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 10800,
        durability: 110,
        effects: { phy_def: 15, mag_def: 15, speed: 30 },
        req: { shen: 22 },
        desc: "【轻甲】专为名门大派的护法弟子设计的巡夜靴，重心经过精密调校，能适应各种极端的身法变换。"
    },
    {
        id: "feet_159",
        name: "青虹映月履", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 10800,
        durability: 110,
        effects: { phy_def: 7, mag_def: 23, speed: 30 },
        req: { shen: 22 },
        desc: "【轻甲】采用罕见的冷月蚕丝与兽皮混编，不仅轻若无物，更能有效折射射向足部的法力流。"
    },

    // --- [High Tier] R4 轻甲 (总防: 40 | 速: 40 | 售价: 14400) ---
    {
        id: "feet_160",
        name: "御卫龙爪战靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 14400,
        durability: 140,
        effects: { phy_def: 30, mag_def: 10, speed: 40 },
        req: { shen: 30 },
        desc: "【轻甲】仿造龙爪结构设计的精锐轻靴，极强的抓地力让穿戴者在墙面亦能短暂飞驰，防护性极佳。"
    },
    {
        id: "feet_161",
        name: "踏浪无痕靴", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 14400,
        durability: 140,
        effects: { phy_def: 20, mag_def: 20, speed: 40 },
        req: { shen: 30 },
        desc: "【轻甲】江湖中久负盛名的神行装备，鞋底内嵌弹性机关，踏水无痕，是上等轻甲中的巅峰之作。"
    },
    {
        id: "feet_162",
        name: "紫云辟法履", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 4,
        value: 14400,
        durability: 140,
        effects: { phy_def: 10, mag_def: 30, speed: 40 },
        req: { shen: 30 },
        desc: "【轻甲】通体呈紫云色，由多种抗魔材料复合而成，穿戴者在法阵之中亦能穿行自如，极度稀有。"
    }
];
// Batch 19: Rarity 4 - 皮甲 (Leather)
// IDs: feet_163 - feet_171
// 风格：优良品质、材质考究、身法加成
const feet_r4_batch4 = [
    // --- [Low Tier] R4 皮甲 (总防: 12 | 速: 20 | 攻: 8 | 暴: 4 | 售价: 7920) ---
    {
        id: "feet_163",
        name: "乌鬃战马靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 7920,
        durability: 90,
        effects: { phy_def: 9, mag_def: 3, speed: 20, phy_atk: 8, crit: 4 },
        req: { shen: 18 },
        desc: "【皮甲】选用北地黑马皮鞣制，皮革厚实且极具韧性，鞋跟处的加固设计使其在突刺时更具爆发力。"
    },
    {
        id: "feet_164",
        name: "惊雷疾行靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 7920,
        durability: 90,
        effects: { phy_def: 6, mag_def: 6, speed: 20, phy_atk: 8, crit: 4 },
        req: { shen: 18 },
        desc: "【皮甲】鞋底嵌入了特殊的导震层，奔跑时落地如惊雷般扎实，是军中骁骑营的精选装备。"
    },
    {
        id: "feet_165",
        name: "灵犀避法靴", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 7920,
        durability: 90,
        effects: { phy_def: 3, mag_def: 9, speed: 20, phy_atk: 8, crit: 4 },
        req: { shen: 18 },
        desc: "【皮甲】采用深山犀牛皮制作，表面涂有抗魔油墨，能让穿戴者在混乱的法术流中保持敏捷。"
    },

    // --- [Mid Tier] R4 皮甲 (总防: 30 | 速: 50 | 攻: 20 | 暴: 8 | 售价: 19800) ---
    {
        id: "feet_166",
        name: "影豹潜行战靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19800,
        durability: 120,
        effects: { phy_def: 23, mag_def: 7, speed: 50, phy_atk: 20, crit: 8 },
        req: { shen: 25 },
        desc: "【皮甲】名家打造的影豹皮靴，落地消音且弹性惊人，极大地辅助了穿着者的身法与致命打击。"
    },
    {
        id: "feet_167",
        name: "骁勇硬革靴", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19800,
        durability: 120,
        effects: { phy_def: 15, mag_def: 15, speed: 50, phy_atk: 20, crit: 8 },
        req: { shen: 25 },
        desc: "【皮甲】上等牛革经百次捶打成型，坚韧度足以弹开寻常弩箭，是战场上军官们的可靠伙伴。"
    },
    {
        id: "feet_168",
        name: "织墨御魔履", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 19800,
        durability: 120,
        effects: { phy_def: 7, mag_def: 23, speed: 50, phy_atk: 20, crit: 8 },
        req: { shen: 25 },
        desc: "【皮甲】皮革中混编了珍贵的御魔蚕丝，整体呈墨黑色，不仅外观庄重，对抗法术冲击的效果极佳。"
    },

    // --- [High Tier] R4 皮甲 (总防: 48 | 速: 80 | 攻: 32 | 暴: 12 | 售价: 31680) ---
    {
        id: "feet_169",
        name: "龙纹犀甲重靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 31680,
        durability: 150,
        effects: { phy_def: 36, mag_def: 12, speed: 80, phy_atk: 32, crit: 12 },
        req: { shen: 32 },
        desc: "【皮甲】以成年铁皮犀牛脊皮制成，辅以龙纹金属加固，其防御力直追重甲，却丝毫不显笨重。"
    },
    {
        id: "feet_170",
        name: "追风游龙靴", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 31680,
        durability: 150,
        effects: { phy_def: 24, mag_def: 24, speed: 80, phy_atk: 32, crit: 12 },
        req: { shen: 32 },
        desc: "【皮甲】江湖中传颂的上等身法皮靴，由数位名匠联手打造，结构完美，能让步伐快如游龙。"
    },
    {
        id: "feet_171",
        name: "星河幻影皮履", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 4,
        value: 31680,
        durability: 150,
        effects: { phy_def: 12, mag_def: 36, speed: 80, phy_atk: 32, crit: 12 },
        req: { shen: 32 },
        desc: "【皮甲】表层皮革如星河般流转，具有轻微的空间折射特性，能误导敌人的感知并大幅抵御法术。"
    }
];
// Batch 20: Rarity 4 - 布甲 (Cloth)
// IDs: feet_172 - feet_180
// 风格：优良品质、轻盈灵动、法系精选
const feet_r4_batch5 = [
    // --- [Low Tier] R4 布甲 (总防: 8 | 速: 24 | 法攻: 8 | 属性: 8 | 售价: 8640) ---
    {
        id: "feet_172",
        name: "天蓝纹锦履", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 8640,
        durability: 60,
        effects: { phy_def: 6, mag_def: 2, speed: 24, mag_atk: 8, qi: 4, shen: 4 },
        req: { shen: 18 },
        desc: "【布甲】采用上等纹锦织就，色泽如晴空般明净。由于应用了多重纳底工艺，即便在石路疾行也极其稳健。"
    },
    {
        id: "feet_173",
        name: "云丝御风鞋", // 均衡 (0.5:0.5)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 8640,
        durability: 60,
        effects: { phy_def: 4, mag_def: 4, speed: 24, mag_atk: 8, qi: 4, shen: 4 },
        req: { shen: 18 },
        desc: "【布甲】鞋身轻薄如云，内嵌微型引风法阵，穿戴者每踏出一步皆有清风拂足，轻盈异常。"
    },
    {
        id: "feet_174",
        name: "净心灵曦屦", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 8640,
        durability: 60,
        effects: { phy_def: 2, mag_def: 6, speed: 24, mag_atk: 8, qi: 4, shen: 4 },
        req: { shen: 18 },
        desc: "【布甲】由静心草纤维混编而成，能助穿戴者排除杂念，其丝滑的布料对外界法术冲击有天然的卸力效果。"
    },

    // --- [Mid Tier] R4 布甲 (总防: 20 | 速: 60 | 法攻: 20 | 属性: 15 | 售价: 21600) ---
    {
        id: "feet_175",
        name: "千层金丝战屦", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 21600,
        durability: 90,
        effects: { phy_def: 15, mag_def: 5, speed: 60, mag_atk: 20, qi: 8, shen: 7 },
        req: { shen: 25 },
        desc: "【布甲】在棉布中巧妙地混入了极细的柔性金丝，极大地提升了布鞋的耐磨与防御性能，是法武双修者的爱物。"
    },
    {
        id: "feet_176",
        name: "流云逐浪锦履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 21600,
        durability: 90,
        effects: { phy_def: 10, mag_def: 10, speed: 60, mag_atk: 20, qi: 7, shen: 8 },
        req: { shen: 25 },
        desc: "【布甲】采用名贵的流云锦缝制，触感温润。其特殊的波浪状缝合结构，能让穿戴者在高速移动时依然保持呼吸平稳。"
    },
    {
        id: "feet_177",
        name: "月华清辉法履", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 21600,
        durability: 90,
        effects: { phy_def: 5, mag_def: 15, speed: 60, mag_atk: 20, qi: 7, shen: 8 },
        req: { shen: 25 },
        desc: "【布甲】采集月华之精染色的天蚕丝制成，夜晚会散发出淡淡的清辉，对元素伤害有极强的中和能力。"
    },

    // --- [High Tier] R4 布甲 (总防: 30 | 速: 90 | 法攻: 30 | 属性: 20 | 售价: 32400) ---
    {
        id: "feet_178",
        name: "天蚕金线玄履", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 32400,
        durability: 120,
        effects: { phy_def: 23, mag_def: 7, speed: 90, mag_atk: 30, qi: 10, shen: 10 },
        req: { shen: 32 },
        desc: "【布甲】布甲中的上等极品。采用千年天蚕丝与玄金细线交织，防御力惊人且丝毫不损其轻机动的特性。"
    },
    {
        id: "feet_179",
        name: "扶摇踏风圣屦", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 32400,
        durability: 120,
        effects: { phy_def: 15, mag_def: 15, speed: 90, mag_atk: 30, qi: 10, shen: 10 },
        req: { shen: 32 },
        desc: "【布甲】寓意“扶摇直上九万里”。其结构经过阵法大师的加持，能大幅缩减身法变幻时的阻力，品质卓绝。"
    },
    {
        id: "feet_180",
        name: "离尘无垢锦鞋", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 4,
        value: 32400,
        durability: 120,
        effects: { phy_def: 8, mag_def: 22, speed: 90, mag_atk: 30, qi: 10, shen: 10 },
        req: { shen: 32 },
        desc: "【布甲】不染尘埃，不坠凡俗。特殊的织法让这双锦鞋几乎完全免疫低阶法术，是追求法力纯净者的梦幻装备。"
    }
];
// Batch 21: Rarity 5 - 板甲 (Plate)
// IDs: feet_181 - feet_189
// 风格：传世珍品、神工鬼斧、统帅之威
const feet_r5_batch1 = [
    // --- [Low Tier] R5 板甲 (总防: 45 | HP: 125 | 速: -50 | 攻: 10 | 售价: 6750) ---
    {
        id: "feet_181",
        name: "碎岩震地重靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 6750,
        durability: 200,
        effects: { phy_def: 34, mag_def: 11, speed: -50, hp_max: 125, phy_atk: 10 },
        req: { jing: 30 },
        desc: "【板甲】采用地底深处的震山铁打制，靴底沉重无比，踏足时能令方圆数尺岩石碎裂。"
    },
    {
        id: "feet_182",
        name: "磐石负重金靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 6750,
        durability: 200,
        effects: { phy_def: 22, mag_def: 23, speed: -50, hp_max: 125, phy_atk: 10 },
        req: { jing: 30 },
        desc: "【板甲】黄金丝线与冷铁交织的工艺，不仅外表华美，其结构如磐石般稳固，水火难侵。"
    },
    {
        id: "feet_183",
        name: "陨星厚土板履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 6750,
        durability: 200,
        effects: { phy_def: 11, mag_def: 34, speed: -50, hp_max: 125, phy_atk: 10 },
        req: { jing: 30 },
        desc: "【板甲】取自域外陨星之核，天生带有对灵气的极强亲和与排斥，能抵御极强的法术冲击。"
    },

    // --- [Mid Tier] R5 板甲 (总防: 67 | HP: 187 | 速: -74 | 攻: 17 | 售价: 10665) ---
    {
        id: "feet_184",
        name: "撼岳囚龙重靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 10665,
        durability: 250,
        effects: { phy_def: 50, mag_def: 17, speed: -74, hp_max: 187, phy_atk: 17 },
        req: { jing: 38 },
        desc: "【板甲】相传曾用于镇压恶龙，靴身重逾千斤，穿戴者立于大地之上便如生根，万夫莫开。"
    },
    {
        id: "feet_185",
        name: "乾坤定鼎板靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 10665,
        durability: 250,
        effects: { phy_def: 34, mag_def: 33, speed: -74, hp_max: 187, phy_atk: 17 },
        req: { jing: 38 },
        desc: "【板甲】定鼎河山的传世之作，其平衡之道达到了板甲的巅峰，能应对战场上任何极端的攻势。"
    },
    {
        id: "feet_186",
        name: "紫极玄阴重履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 10665,
        durability: 250,
        effects: { phy_def: 17, mag_def: 50, speed: -74, hp_max: 187, phy_atk: 17 },
        req: { jing: 38 },
        desc: "【板甲】采集玄阴之气淬火，呈现深紫色。能够吸收周遭法力，化作自身的护体气墙。"
    },

    // --- [High Tier] R5 板甲 (总防: 90 | HP: 250 | 速: -100 | 攻: 25 | 售价: 14625) ---
    {
        id: "feet_187",
        name: "诸神叹息战靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 14625,
        durability: 300,
        effects: { phy_def: 68, mag_def: 22, speed: -100, hp_max: 250, phy_atk: 25 },
        req: { jing: 45 },
        desc: "【板甲】极具神性的重型甲具，哪怕是众神也对其坚不可摧的防御感到无奈与叹息。"
    },
    {
        id: "feet_188",
        name: "万钧不动圣靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 14625,
        durability: 300,
        effects: { phy_def: 45, mag_def: 45, speed: -100, hp_max: 250, phy_atk: 25 },
        req: { jing: 45 },
        desc: "【板甲】圣阶工艺的终极形态，即便不动如山，亦能在举手投足间展现出万钧之力的威慑。"
    },
    {
        id: "feet_189",
        name: "混沌辟魔重履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 5,
        value: 14625,
        durability: 300,
        effects: { phy_def: 22, mag_def: 68, speed: -100, hp_max: 250, phy_atk: 25 },
        req: { jing: 45 },
        desc: "【板甲】在混沌初开的矿脉中诞生的奇甲，无视世间大部分元素的侵蚀，乃法术的终极克星。"
    }
];
// Batch 22: Rarity 5 - 重甲 (Heavy)
// IDs: feet_190 - feet_198
// 风格：传世品质、统帅骁将、神工重装
const feet_r5_batch2 = [
    // --- [Low Tier] R5 重甲 (总防: 33 | HP: 63 | 速: -25 | 攻: 5 | 售价: 5760) ---
    {
        id: "feet_190",
        name: "骁卫金错靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 5760,
        durability: 180,
        effects: { phy_def: 25, mag_def: 8, speed: -25, hp_max: 63, phy_atk: 5 },
        req: { jing: 25 },
        desc: "【重甲】大将军亲卫骁骑所穿，靴面以金错工艺装饰，既显尊贵又拥有极强的物理抗性。"
    },
    {
        id: "feet_191",
        name: "连环锁云靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 5760,
        durability: 180,
        effects: { phy_def: 16, mag_def: 17, speed: -25, hp_max: 63, phy_atk: 5 },
        req: { jing: 25 },
        desc: "【重甲】由无数细小的金属锁环扣合而成，结构精密，能有效化解物理穿刺与法术震荡。"
    },
    {
        id: "feet_192",
        name: "避法乌金履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 5760,
        durability: 180,
        effects: { phy_def: 8, mag_def: 25, speed: -25, hp_max: 63, phy_atk: 5 },
        req: { jing: 25 },
        desc: "【重甲】采用罕见的乌金打造，其材质天生对法力具有排斥性，是对抗法术轰炸的重装利器。"
    },

    // --- [Mid Tier] R5 重甲 (总防: 48 | HP: 94 | 速: -37 | 攻: 9 | 售价: 8730) ---
    {
        id: "feet_193",
        name: "破虏沉沙战靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 8730,
        durability: 230,
        effects: { phy_def: 36, mag_def: 12, speed: -37, hp_max: 94, phy_atk: 9 },
        req: { jing: 32 },
        desc: "【重甲】一代名将破虏杀敌时所穿，靴身浸透了无数战火气息，防御之强令敌军胆寒。"
    },
    {
        id: "feet_194",
        name: "镇军盘龙靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 8730,
        durability: 230,
        effects: { phy_def: 24, mag_def: 24, speed: -37, hp_max: 94, phy_atk: 9 },
        req: { jing: 32 },
        desc: "【重甲】镇守边疆的统帅之靴，盘龙纹饰栩栩如生，其坚韧程度足以无视大部分战场伤害。"
    },
    {
        id: "feet_195",
        name: "玄冥御火重履", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 8730,
        durability: 230,
        effects: { phy_def: 12, mag_def: 36, speed: -37, hp_max: 94, phy_atk: 9 },
        req: { jing: 32 },
        desc: "【重甲】取北地玄冥冰铁打造，通体透着寒意，对烈焰法术有极强的压制效果。"
    },

    // --- [High Tier] R5 重甲 (总防: 65 | HP: 125 | 速: -50 | 攻: 13 | 售价: 11925) ---
    {
        id: "feet_196",
        name: "霸王摧城靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 11925,
        durability: 280,
        effects: { phy_def: 49, mag_def: 16, speed: -50, hp_max: 125, phy_atk: 13 },
        req: { jing: 40 },
        desc: "【重甲】拥有霸者气息的重型战靴，每一寸护甲都经过神工锻打，是攻城拔寨时的终极防护。"
    },
    {
        id: "feet_197",
        name: "混元罡气重靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 11925,
        durability: 280,
        effects: { phy_def: 33, mag_def: 32, speed: -50, hp_max: 125, phy_atk: 13 },
        req: { jing: 40 },
        desc: "【重甲】相传融合了天地混元之气，能自行抵消周遭的暴乱能量，防御能力深不可测。"
    },
    {
        id: "feet_198",
        name: "虚空裂纹铁履", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 5,
        value: 11925,
        durability: 280,
        effects: { phy_def: 16, mag_def: 49, speed: -50, hp_max: 125, phy_atk: 13 },
        req: { jing: 40 },
        desc: "【重甲】靴面布满了细微的虚空裂纹，能将射向足部的法力流吸入虚无，堪称法系克星。"
    }
];
// Batch 23: Rarity 5 - 轻甲 (Light)
// IDs: feet_199 - feet_207
// 风格：传世珍品、神行绝影、名匠巅峰
const feet_r5_batch3 = [
    // --- [Low Tier] R5 轻甲 (总防: 25 | 速: 25 | 售价: 11250) ---
    {
        id: "feet_199",
        name: "九霄云外靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 11250,
        durability: 180,
        effects: { phy_def: 19, mag_def: 6, speed: 25 },
        req: { shen: 25 },
        desc: "【轻甲】采用极北高空的寒风中浸染的灵皮制成，不仅防御坚韧，更赋予穿戴者如坠九霄的轻盈感。"
    },
    {
        id: "feet_200",
        name: "御风神行履", // 均衡 (0.5:0.5)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 11250,
        durability: 180,
        effects: { phy_def: 13, mag_def: 12, speed: 25 },
        req: { shen: 25 },
        desc: "【轻甲】传世名匠呕心沥血之作，鞋底封印了微型御风阵法，能让步履在任何地形都如履平地。"
    },
    {
        id: "feet_201",
        name: "青鸾映波靴", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 11250,
        durability: 180,
        effects: { phy_def: 6, mag_def: 19, speed: 25 },
        req: { shen: 25 },
        desc: "【轻甲】以青鸾落羽混编蚕丝织就，靴面流转着淡淡青光，能有效排斥四周的暴戾法力。"
    },

    // --- [Mid Tier] R5 轻甲 (总防: 38 | 速: 38 | 售价: 17100) ---
    {
        id: "feet_202",
        name: "绝影追魂靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 17100,
        durability: 240,
        effects: { phy_def: 29, mag_def: 9, speed: 38 },
        req: { shen: 35 },
        desc: "【轻甲】极影刺客的传承之物。皮革中融合了异兽胫骨粉末，在保持极高防御的同时，爆发力惊人。"
    },
    {
        id: "feet_203",
        name: "八荒游龙履", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 17100,
        durability: 240,
        effects: { phy_def: 19, mag_def: 19, speed: 38 },
        req: { shen: 35 },
        desc: "【轻甲】采用深海潜龙之皮，结合神工级的制革工艺，赋予了穿戴者傲视八荒的灵动与稳固。"
    },
    {
        id: "feet_204",
        name: "紫气东来靴", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 17100,
        durability: 240,
        effects: { phy_def: 9, mag_def: 29, speed: 38 },
        req: { shen: 35 },
        desc: "【轻甲】通体紫金流光，相传乃隐世高人吸取朝阳紫气淬炼而成，能让穿戴者在法术乱局中游刃有余。"
    },

    // --- [High Tier] R5 轻甲 (总防: 50 | 速: 50 | 售价: 22500) ---
    {
        id: "feet_205",
        name: "万劫不磨战靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 22500,
        durability: 300,
        effects: { phy_def: 38, mag_def: 12, speed: 50 },
        req: { shen: 45 },
        desc: "【轻甲】传闻能经历万劫而不毁的神物。采用上古巨犀之皮，其物理防护能力已达到了轻型甲具的终极极限。"
    },
    {
        id: "feet_206",
        name: "虚空踏步圣履", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 22500,
        durability: 300,
        effects: { phy_def: 25, mag_def: 25, speed: 50 },
        req: { shen: 45 },
        desc: "【轻甲】此履已近乎道。穿戴者奔行时仿佛踏在虚空之上，每一步都蕴含着天地法则，迅捷不可捉摸。"
    },
    {
        id: "feet_207",
        name: "三清御魔靴", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 5,
        value: 22500,
        durability: 300,
        effects: { phy_def: 12, mag_def: 38, speed: 50 },
        req: { shen: 45 },
        desc: "【轻甲】内蕴三清之意。由顶级御魔丝绸与天蚕皮合制，是应对上古咒术与大型法阵干扰的唯一神选。"
    }
];
// Batch 24: Rarity 5 - 皮甲 (Leather)
// IDs: feet_208 - feet_216
// 风格：传世珍品、野性神力、身法巅峰
const feet_r5_batch4 = [
    // --- [Low Tier] R5 皮甲 (总防: 19 | 速: 31 | 攻: 13 | 暴: 8 | 售价: 13500) ---
    {
        id: "feet_208",
        name: "贪狼噬日战靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 13500,
        durability: 160,
        effects: { phy_def: 14, mag_def: 5, speed: 31, phy_atk: 13, crit: 8 },
        req: { shen: 28 },
        desc: "【皮甲】取贪狼之皮制成，暗红色的皮革隐约透着凶戾之气，能极大提升穿戴者的爆发力。"
    },
    {
        id: "feet_209",
        name: "绝影奔雷履", // 均衡 (0.5:0.5)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 13500,
        durability: 160,
        effects: { phy_def: 10, mag_def: 9, speed: 31, phy_atk: 13, crit: 8 },
        req: { shen: 28 },
        desc: "【皮甲】传世名匠以特殊手段处理过的硬革，步履间隐有雷鸣，兼顾了防护与神行之速。"
    },
    {
        id: "feet_210",
        name: "幻瞳避火皮靴", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 13500,
        durability: 160,
        effects: { phy_def: 5, mag_def: 14, speed: 31, phy_atk: 13, crit: 8 },
        req: { shen: 28 },
        desc: "【皮甲】采集深渊幻兽之眼周边的柔皮打造，天生具备折射元素光束的能力，玄妙异常。"
    },

    // --- [Mid Tier] R5 皮甲 (总防: 41 | HP: 0 | 速: 69 | 攻: 28 | 暴: 11 | 售价: 29700) ---
    {
        id: "feet_211",
        name: "麒麟逆鳞短靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 29700,
        durability: 220,
        effects: { phy_def: 31, mag_def: 10, speed: 69, phy_atk: 28, crit: 11 },
        req: { shen: 38 },
        desc: "【皮甲】传说中以麒麟颈下的逆鳞柔皮合制而成，触感如钢，防御力足以在万军丛中横行。"
    },
    {
        id: "feet_212",
        name: "混元乾坤皮履", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 29700,
        durability: 220,
        effects: { phy_def: 21, mag_def: 20, speed: 69, phy_atk: 28, crit: 11 },
        req: { shen: 38 },
        desc: "【皮甲】此履结构蕴含阴阳调和之道，无论是身法的转换还是抗性的均衡都达到了神工水准。"
    },
    {
        id: "feet_213",
        name: "九幽冥火皮靴", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 29700,
        durability: 220,
        effects: { phy_def: 10, mag_def: 31, speed: 69, phy_atk: 28, crit: 11 },
        req: { shen: 38 },
        desc: "【皮甲】在极阴之地揉制的皮甲，靴筒处流转着幽冥冷火，对法术伤害有着惊人的吸收上限。"
    },

    // --- [High Tier] R5 皮甲 (总防: 68 | 速: 113 | 攻: 45 | 暴: 15 | 售价: 48600) ---
    {
        id: "feet_214",
        name: "裂空龙裔战靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 48600,
        durability: 280,
        effects: { phy_def: 51, mag_def: 17, speed: 113, phy_atk: 45, crit: 15 },
        req: { shen: 48 },
        desc: "【皮甲】选用亚龙脊部的硬革精制，踢击时蕴含裂空之威，是近身搏杀者的终极神器。"
    },
    {
        id: "feet_215",
        name: "踏月逐影神履", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 48600,
        durability: 280,
        effects: { phy_def: 34, mag_def: 34, speed: 113, phy_atk: 45, crit: 15 },
        req: { shen: 48 },
        desc: "【皮甲】此履如月中幻影，穿戴者奔行时轨迹莫测，其材质坚韧且灵动，乃传世皮甲之最。"
    },
    {
        id: "feet_216",
        name: "万象森罗护靴", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 5,
        value: 48600,
        durability: 280,
        effects: { phy_def: 17, mag_def: 51, speed: 113, phy_atk: 45, crit: 15 },
        req: { shen: 48 },
        desc: "【皮甲】皮革表面刻满了森罗万象之阵，能将一切侵袭的法术分解为最原始的气息，神妙不可方物。"
    }
];
// Batch 25: Rarity 5 - 布甲 (Cloth)
// IDs: feet_217 - feet_225
// 风格：传世珍品、仙风道骨、法系巅峰
const feet_r5_batch5 = [
    // --- [Low Tier] R5 布甲 (总防: 11 | 速: 34 | 法攻: 11 | 属性: 11 | 售价: 14850) ---
    {
        id: "feet_217",
        name: "流霞织金屦", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 14850,
        durability: 100,
        effects: { phy_def: 8, mag_def: 3, speed: 34, mag_atk: 11, qi: 6, shen: 5 },
        req: { shen: 30 },
        desc: "【布甲】采集傍晚最后一抹流霞织入布中，辅以金丝加固鞋底，不仅身轻如燕，且步履间隐有云气保护。"
    },
    {
        id: "feet_218",
        name: "九天霓裳履", // 均衡 (0.5:0.5)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 14850,
        durability: 100,
        effects: { phy_def: 5, mag_def: 6, speed: 34, mag_atk: 11, qi: 5, shen: 6 },
        req: { shen: 30 },
        desc: "【布甲】传说是仙子误落凡尘的霓裳所化，轻盈得近乎虚幻，穿戴者行动时如在云端漫步。"
    },
    {
        id: "feet_219",
        name: "太虚化灵鞋", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 14850,
        durability: 100,
        effects: { phy_def: 3, mag_def: 8, speed: 34, mag_atk: 11, qi: 5, shen: 6 },
        req: { shen: 30 },
        desc: "【布甲】鞋身完全由高纯度的灵气纤维织就，能与穿戴者的神识共鸣，极大提升对天地元气的掌控。"
    },

    // --- [Mid Tier] R5 布甲 (总防: 28 | 速: 84 | 法攻: 28 | 属性: 21 | 售价: 37125) ---
    {
        id: "feet_220",
        name: "万年古棉战屦", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 37125,
        durability: 150,
        effects: { phy_def: 21, mag_def: 7, speed: 84, mag_atk: 28, qi: 11, shen: 10 },
        req: { shen: 42 },
        desc: "【布甲】采用生长万年的古棉精制，其韧性竟不下于金石，在保证绝对轻便的同时，拥有惊人的抗冲击力。"
    },
    {
        id: "feet_221",
        name: "离垢无瑕锦履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 37125,
        durability: 150,
        effects: { phy_def: 14, mag_def: 14, speed: 84, mag_atk: 28, qi: 10, shen: 11 },
        req: { shen: 42 },
        desc: "【布甲】不染尘埃，不沾污秽。此履自带净心领域，能让穿戴者在混乱的法术狂潮中依然保持灵台清明。"
    },
    {
        id: "feet_222",
        name: "紫极御天圣屦", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 37125,
        durability: 150,
        effects: { phy_def: 7, mag_def: 21, speed: 84, mag_atk: 28, qi: 10, shen: 11 },
        req: { shen: 42 },
        desc: "【布甲】通体紫气缭绕，乃神工级匠师采集东来紫气与天蚕丝融合而成，对一切阴邪法术有极强的压制力。"
    },

    // --- [High Tier] R5 布甲 (总防: 45 | 速: 135 | 法攻: 45 | 属性: 30 | 售价: 59400) ---
    {
        id: "feet_223",
        name: "混沌初开法履", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 59400,
        durability: 200,
        effects: { phy_def: 34, mag_def: 11, speed: 135, mag_atk: 45, qi: 15, shen: 15 },
        req: { shen: 55 },
        desc: "【布甲】相传此履所用材质源于混沌初开时的灵根，防御力不仅远超同类，更蕴含着生生不息的身法真意。"
    },
    {
        id: "feet_224",
        name: "大罗天御风屦", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 59400,
        durability: 200,
        effects: { phy_def: 23, mag_def: 22, speed: 135, mag_atk: 45, qi: 15, shen: 15 },
        req: { shen: 55 },
        desc: "【布甲】大罗天界的顶级神物。穿戴者奔行时已无形无相，彻底摆脱了大地引力的束缚，极度珍稀。"
    },
    {
        id: "feet_225",
        name: "归墟寂灭锦鞋", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 5,
        value: 59400,
        durability: 200,
        effects: { phy_def: 11, mag_def: 34, speed: 135, mag_atk: 45, qi: 15, shen: 15 },
        req: { shen: 55 },
        desc: "【布甲】鞋面绣有归墟深渊的符文，能将一切攻向足部的法力攻击吸入寂灭虚无，乃布甲之终极神器。"
    }
];
// Batch 26: Rarity 6 - 神话板甲 (Mythic Plate)
// IDs: feet_226 - feet_234
// 风格：诸神遗产、末日修仙、帝王藏品
const feet_r6_batch1 = [
    // --- [Low Tier] R6 板甲 (总防: 72 | HP: 170 | 速: -80 | 攻: 15 | 售价: 11070) ---
    {
        id: "feet_226",
        name: "冥狱铁壁靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 11070,
        durability: 500,
        effects: { phy_def: 54, mag_def: 18, speed: -80, hp_max: 170, phy_atk: 15 },
        req: { jing: 45 },
        desc: "【板甲】采冥界玄铁合铸，靴身时刻散发着森然死气。立于原位时，仿佛能引动冥狱铁壁降世，无可撼动。"
    },
    {
        id: "feet_227",
        name: "玄天镇魔重靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 11070,
        durability: 500,
        effects: { phy_def: 36, mag_def: 36, speed: -80, hp_max: 170, phy_atk: 15 },
        req: { jing: 45 },
        desc: "【板甲】上古天庭镇压域外天魔的圣物，结构中流转着玄天正气，对一切邪法与蛮力皆有极强的镇压之效。"
    },
    {
        id: "feet_228",
        name: "寂灭道影履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 11070,
        durability: 500,
        effects: { phy_def: 18, mag_def: 54, speed: -80, hp_max: 170, phy_atk: 15 },
        req: { jing: 45 },
        desc: "【板甲】末法时代寂灭宗的至宝，看似沉重如山，实则是由凝固的法则残影构成，能令任何攻来的术法归于虚无。"
    },

    // --- [Mid Tier] R6 板甲 (总防: 90 | HP: 230 | 速: -100 | 攻: 22 | 售价: 15660) ---
    {
        id: "feet_229",
        name: "帝玺龙纹板靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 15660,
        durability: 700,
        effects: { phy_def: 68, mag_def: 22, speed: -100, hp_max: 230, phy_atk: 22 },
        req: { jing: 55 },
        desc: "【板甲】帝国始皇帝的随身甲具，靴面雕刻五爪金龙。此靴蕴含人族气运，一脚踏下可令山河倒流，众生伏首。"
    },
    {
        id: "feet_230",
        name: "混沌开天板靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 15660,
        durability: 700,
        effects: { phy_def: 45, mag_def: 45, speed: -100, hp_max: 230, phy_atk: 22 },
        req: { jing: 55 },
        desc: "【板甲】混沌初开时的原矿打造，不属于现世任何已知的金属，其平衡与防御能力已达到了因果律的极致。"
    },
    {
        id: "feet_231",
        name: "黄泉不归履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 15660,
        durability: 700,
        effects: { phy_def: 22, mag_def: 68, speed: -100, hp_max: 230, phy_atk: 22 },
        req: { jing: 55 },
        desc: "【板甲】采集黄泉最深处的忘川石铸成，沉重且冰冷。穿戴者能行走于阴阳两界边缘，令万千术法无法捕捉其真身。"
    },

    // --- [High Tier] R6 板甲 (总防: 108 | HP: 300 | 速: -120 | 攻: 30 | 售价: 21060) ---
    {
        id: "feet_232",
        name: "葬神灭世板靴", // 物理偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 21060,
        durability: 999,
        effects: { phy_def: 81, mag_def: 27, speed: -120, hp_max: 300, phy_atk: 30 },
        req: { jing: 65 },
        desc: "【板甲】曾葬掉过一个时代的毁灭之靴。其厚重的钢甲之下，跳动着末日劫火的余温，足以踏碎世间一切防御。"
    },
    {
        id: "feet_233",
        name: "万劫不坏甲靴", // 均衡
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 21060,
        durability: 999,
        effects: { phy_def: 54, mag_def: 54, speed: -120, hp_max: 300, phy_atk: 30 },
        req: { jing: 65 },
        desc: "【板甲】历经无数纪元劫难而不毁的神装，其坚韧程度已无法用凡间的计量衡量。立于其上，便意味着绝对的生还。"
    },
    {
        id: "feet_234",
        name: "太始虚空重履", // 法术偏向
        type: "feet" , defType: "plate",
        grade: 0,
        rarity: 6,
        value: 21060,
        durability: 999,
        effects: { phy_def: 27, mag_def: 81, speed: -120, hp_max: 300, phy_atk: 30 },
        req: { jing: 65 },
        desc: "【板甲】由太始年间的虚空裂隙碎片打制。不仅能防御法术，更能将袭来的攻击直接放逐到无尽虚空之中。"
    }
];
// Batch 27: Rarity 6 - 神话重甲 (Mythic Heavy)
// IDs: feet_235 - feet_243
// 风格：末世骁将、掌教佩靴、毁灭与镇压
const feet_r6_batch2 = [
    // --- [Low Tier] R6 重甲 (总防: 47 | HP: 85 | 速: -36 | 攻: 6 | 售价: 7560) ---
    {
        id: "feet_235",
        name: "戮神铁甲靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 7560,
        durability: 450,
        effects: { phy_def: 35, mag_def: 12, speed: -36, hp_max: 85, phy_atk: 6 },
        req: { jing: 40 },
        desc: "【重甲】曾有邪神血溅其上，靴身的铁甲吸收了神之恨意，变得坚不可摧且杀气腾腾。"
    },
    {
        id: "feet_236",
        name: "九幽炼狱重靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 7560,
        durability: 450,
        effects: { phy_def: 24, mag_def: 23, speed: -36, hp_max: 85, phy_atk: 6 },
        req: { jing: 40 },
        desc: "【重甲】九幽深处万年熔岩淬炼出的神兵，不仅防御平衡，更能在踏步间震慑敌人的神魂。"
    },
    {
        id: "feet_237",
        name: "荒古祭天履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 7560,
        durability: 450,
        effects: { phy_def: 12, mag_def: 35, speed: -36, hp_max: 85, phy_atk: 6 },
        req: { jing: 40 },
        desc: "【重甲】荒古时代祭天仪式上武祝所穿，其上铭刻的古老图腾能让世间术法在靴前自动消散。"
    },

    // --- [Mid Tier] R6 重甲 (总防: 78 | HP: 115 | 速: -60 | 攻: 15 | 售价: 13500) ---
    {
        id: "feet_238",
        name: "真武降魔战靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 13500,
        durability: 600,
        effects: { phy_def: 59, mag_def: 19, speed: -60, hp_max: 115, phy_atk: 15 },
        req: { jing: 55 },
        desc: "【重甲】北方真武大帝道统传承之物，靴帮重甲呈现龟蛇之纹，是一切外魔蛮力的克星。"
    },
    {
        id: "feet_239",
        name: "末法掌教重靴", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 13500,
        durability: 600,
        effects: { phy_def: 39, mag_def: 39, speed: -60, hp_max: 115, phy_atk: 15 },
        req: { jing: 55 },
        desc: "【重甲】末法时代宗门掌教的临战圣物，以地脉核心炼制，厚重沉稳，护持着宗门的最后余晖。"
    },
    {
        id: "feet_240",
        name: "混元吞天履", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 13500,
        durability: 600,
        effects: { phy_def: 20, mag_def: 58, speed: -60, hp_max: 115, phy_atk: 15 },
        req: { jing: 55 },
        desc: "【重甲】拥有吞噬乾坤之意的玄铁重履，能将袭来的毁灭术法吞入混沌，化作自身的防御气罩。"
    },

    // --- [High Tier] R6 重甲 (总防: 104 | HP: 150 | 速: -80 | 攻: 24 | 售价: 20160) ---
    {
        id: "feet_241",
        name: "天策龙魂圣靴", // 物理偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 20160,
        durability: 800,
        effects: { phy_def: 78, mag_def: 26, speed: -80, hp_max: 150, phy_atk: 24 },
        req: { jing: 65 },
        desc: "【重甲】天策神将征讨四方时所穿，内嵌真龙精魂，每一甲片都蕴含龙鳞之威，坚不可摧。"
    },
    {
        id: "feet_242",
        name: "永恒寂灭铁履", // 均衡
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 20160,
        durability: 800,
        effects: { phy_def: 52, mag_def: 52, speed: -80, hp_max: 150, phy_atk: 24 },
        req: { jing: 65 },
        desc: "【重甲】于永恒废墟中挖掘出的史前甲具，其材质已超越了修仙者的认知，防御力近乎永恒。"
    },
    {
        id: "feet_243",
        name: "诸神黄昏重靴", // 法术偏向
        type: "feet" , defType: "heavy",
        grade: 0,
        rarity: 6,
        value: 20160,
        durability: 800,
        effects: { phy_def: 26, mag_def: 78, speed: -80, hp_max: 150, phy_atk: 24 },
        req: { jing: 65 },
        desc: "【重甲】见证了众神陨落的黄昏之靴，靴底踩着旧神的残躯，任何法术在其面前都显得苍白无力。"
    }
];
// Batch 28: Rarity 6 - 神话轻甲 (Mythic Light)
// IDs: feet_244 - feet_252
// 风格：绝世神兵、末日修仙、身法巅峰
const feet_r6_batch3 = [
    // --- [Low Tier] R6 轻甲 (总防: 40 | 速: 40 | 售价: 21600) ---
    {
        id: "feet_244",
        name: "劫灰渡空靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 21600,
        durability: 400,
        effects: { phy_def: 30, mag_def: 10, speed: 40 },
        req: { shen: 40 },
        desc: "【轻甲】传闻由末世劫火之后的余烬锻造，履面虽显暗淡，却能助穿戴者踏空而行，无视一切地理隔阂。"
    },
    {
        id: "feet_245",
        name: "溯时流光履", // 均衡 (0.5:0.5)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 21600,
        durability: 400,
        effects: { phy_def: 20, mag_def: 20, speed: 40 },
        req: { shen: 40 },
        desc: "【轻甲】帝王秘库中收藏的时间残片所化。行走时带起层层残影，仿佛能逆转刹那光阴，平衡性登峰造极。"
    },
    {
        id: "feet_246",
        name: "虚溟幻化屦", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 21600,
        durability: 400,
        effects: { phy_def: 10, mag_def: 30, speed: 40 },
        req: { shen: 40 },
        desc: "【轻甲】以虚溟之界的极光丝线编织而成，其形质在实体与灵体间不断切换，能让绝大部分法术无功而返。"
    },

    // --- [Mid Tier] R6 轻甲 (总防: 50 | 速: 50 | 售价: 27000) ---
    {
        id: "feet_247",
        name: "绝云破晓战靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 27000,
        durability: 550,
        effects: { phy_def: 38, mag_def: 12, speed: 50 },
        req: { shen: 55 },
        desc: "【轻甲】当世仅存的宗师在雷鸣巅峰闭关九载所成。靴尖一抹亮色如破晓之光，防御极坚，势如惊鸿。"
    },
    {
        id: "feet_248",
        name: "太苍浮光履", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 27000,
        durability: 550,
        effects: { phy_def: 25, mag_def: 25, speed: 50 },
        req: { shen: 55 },
        desc: "【轻甲】太苍宗开山祖师的遗物。履身仿佛承载了远古大地的浮光，无论在何种法则混乱的战场，皆能维持绝对的中庸与稳定。"
    },
    {
        id: "feet_249",
        name: "灵渊折射步靴", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 27000,
        durability: 550,
        effects: { phy_def: 12, mag_def: 38, speed: 50 },
        req: { shen: 55 },
        desc: "【轻甲】采集灵界深渊底层的晶皮缝制，表面具有完美的法力折射层，乃是应对禁咒级法术的唯一生机。"
    },

    // --- [High Tier] R6 轻甲 (总防: 60 | 速: 60 | 售价: 32400) ---
    {
        id: "feet_250",
        name: "谪仙登天靴", // 物理偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 32400,
        durability: 800,
        effects: { phy_def: 45, mag_def: 15, speed: 60 },
        req: { shen: 70 },
        desc: "【轻甲】此靴乃谪仙人重返天界前留下的唯一信物。其物理防御已臻至“万法不入肉身”的至高境界，轻盈而霸道。"
    },
    {
        id: "feet_251",
        name: "万古神行圣履", // 均衡
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 32400,
        durability: 800,
        effects: { phy_def: 30, mag_def: 30, speed: 60 },
        req: { shen: 70 },
        desc: "【轻甲】贯穿了万古修仙史的神话之履。其结构已与天地脉动同调，穿戴者每一步都踏在生死的平衡点上，神行无阻。"
    },
    {
        id: "feet_252",
        name: "帝御诸界快履", // 法术偏向
        type: "feet" , defType: "light",
        grade: 0,
        rarity: 6,
        value: 32400,
        durability: 800,
        effects: { phy_def: 15, mag_def: 45, speed: 60 },
        req: { shen: 70 },
        desc: "【轻甲】帝国至高统治者巡视诸界的仪仗。靴面丝绸皆由真龙须混编，能完全无视低等界面的法则压制与法术干扰。"
    }
];
// Batch 29: Rarity 6 - 神话皮甲 (Mythic Leather)
// IDs: feet_253 - feet_261
// 风格：杀伐因果、末法孤影、掌门神兵
const feet_r6_batch4 = [
    // --- [Low Tier] R6 皮甲 (总防: 27 | 速: 45 | 攻: 6 | 暴: 6 | 售价: 27540) ---
    {
        id: "feet_253",
        name: "煞纹杀伐靴", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 27540,
        durability: 350,
        effects: { phy_def: 20, mag_def: 7, speed: 45, phy_atk: 6, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】皮面上流转着暗红色的杀伐煞纹，每一缕纹路都曾饱饮大能之血。其质地坚韧，能轻易卸去万斤巨力。"
    },
    {
        id: "feet_254",
        name: "劫灰孤影步", // 均衡 (0.5:0.5)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 27540,
        durability: 350,
        effects: { phy_def: 14, mag_def: 13, speed: 45, phy_atk: 6, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】行走于天地大劫的灰烬之中，不留痕迹。此履以灭绝异兽的残皮制成，在防守与速度间达到了诡异的平衡。"
    },
    {
        id: "feet_255",
        name: "离魂影革履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 27540,
        durability: 350,
        effects: { phy_def: 7, mag_def: 20, speed: 45, phy_atk: 6, crit: 6 },
        req: { shen: 45 },
        desc: "【皮甲】材质轻薄如魂影，由于长期浸泡在黄泉灵液中，对一切针对神魂的法术攻击有着天然的规避效果。"
    },

    // --- [Mid Tier] R6 皮甲 (总防: 36 | 速: 60 | 攻: 10 | 暴: 9 | 售价: 38340) ---
    {
        id: "feet_256",
        name: "业火因果靴", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 38340,
        durability: 480,
        effects: { phy_def: 27, mag_def: 9, speed: 60, phy_atk: 10, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】缠绕着红莲业火的绝世皮靴。踏步间因果相随，任何攻击者都会受到来自宿命的强力反震。"
    },
    {
        id: "feet_257",
        name: "寂灭孤星履", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 38340,
        durability: 480,
        effects: { phy_def: 18, mag_def: 18, speed: 60, phy_atk: 10, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】于星辰寂灭的刹那凝成的皮质圣具。它承载了孤星的寂寥，穿戴者行动时如流星滑落，无迹可寻。"
    },
    {
        id: "feet_258",
        name: "幽冥摄魂步", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 38340,
        durability: 480,
        effects: { phy_def: 9, mag_def: 27, speed: 60, phy_atk: 10, crit: 9 },
        req: { shen: 58 },
        desc: "【皮甲】采集九幽深处的魔蛟腹皮制成，不仅能无视地府罡风，更能将周遭法力波动转化为自身的护体罡气。"
    },

    // --- [High Tier] R6 皮甲 (总防: 45 | 速: 75 | 攻: 15 | 暴: 12 | 售价: 49410) ---
    {
        id: "feet_259",
        name: "屠灵断因神履", // 物理偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 49410,
        durability: 600,
        effects: { phy_def: 34, mag_def: 11, speed: 75, phy_atk: 15, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】末代战神屠杀百万英灵后的封神之作。此靴能够斩断攻击者的因果连线，从根本上令对手的物理打击落空。"
    },
    {
        id: "feet_260",
        name: "帝道末法孤影", // 均衡
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 49410,
        durability: 600,
        effects: { phy_def: 23, mag_def: 22, speed: 75, phy_atk: 15, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】末法时代唯一登上帝位的至尊之履。它见证了仙路的断绝，穿戴者在末日孤影中依然维持着帝王的尊严与全能。"
    },
    {
        id: "feet_261",
        name: "诸神寂灭因果", // 法术偏向
        type: "feet" , defType: "leather",
        grade: 0,
        rarity: 6,
        value: 49410,
        durability: 600,
        effects: { phy_def: 11, mag_def: 34, speed: 75, phy_atk: 15, crit: 12 },
        req: { shen: 72 },
        desc: "【皮甲】上古诸神集体陨落时留下的禁忌皮履。它无视世间一切术法规则，哪怕是法则级的审判，在它面前也将烟消云散。"
    }
];
// Batch 30: Rarity 6 - 神话布甲 (Mythic Cloth)
// IDs: feet_262 - feet_270
// 风格：诸神遗产、末世禁忌、宗师神行
const feet_r6_batch5 = [
    // --- [Low Tier] R6 布甲 (总防: 18 | 速: 54 | 法攻: 6 | 属性: 6 | 售价: 24300) ---
    {
        id: "feet_262",
        name: "帝玺残光履", // 物理偏向 (0.75:0.25)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 24300,
        durability: 300,
        effects: { phy_def: 14, mag_def: 4, speed: 54, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】帝国末年秘库所藏，丝线中封存了破碎的帝气。行走时步履生辉，能抵御乱世中沉重的物理压制。"
    },
    {
        id: "feet_263",
        name: "禁宫幽影靴", // 均衡 (0.5:0.5)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 24300,
        durability: 300,
        effects: { phy_def: 9, mag_def: 9, speed: 54, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】如同徘徊在虚实边缘的幽影。此履能让穿戴者在毁灭的宫殿中悄然穿行，身法与防御达到了极致的平衡。"
    },
    {
        id: "feet_264",
        name: "龙嗣御风履", // 法术偏向 (0.25:0.75)
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 24300,
        durability: 300,
        effects: { phy_def: 4, mag_def: 14, speed: 54, mag_atk: 6, qi: 3, shen: 3 },
        req: { shen: 60 },
        desc: "【布甲】传说是为帝王后裔特制的御风具，浸染了龙脉灵液。轻盈如烟，能轻易拨开笼罩在足底的因果术法。"
    },

    // --- [Mid Tier] R6 布甲 (总防: 24 | 速: 72 | 法攻: 10 | 属性: 9 | 售价: 33480) ---
    {
        id: "feet_265",
        name: "太真无常圣履", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 33480,
        durability: 500,
        effects: { phy_def: 18, mag_def: 6, speed: 72, mag_atk: 10, qi: 5, shen: 4 },
        req: { shen: 75 },
        desc: "【布甲】太真宗掌门嫡传。取无常之意织就，步履所过之处万物凋零。其特殊的织法能正面抗衡兵戈之气。"
    },
    {
        id: "feet_266",
        name: "掌教诛仙步", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 33480,
        durability: 500,
        effects: { phy_def: 12, mag_def: 12, speed: 72, mag_atk: 10, qi: 4, shen: 5 },
        req: { shen: 75 },
        desc: "【布甲】杀伐与出尘的共存之物。传闻掌教穿戴此靴时曾一步跨越仙凡，将一切规则紊乱的攻击拒之门外。"
    },
    {
        id: "feet_267",
        name: "寂灭因果锦屦", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 33480,
        durability: 500,
        effects: { phy_def: 6, mag_def: 18, speed: 72, mag_atk: 10, qi: 4, shen: 5 },
        req: { shen: 75 },
        desc: "【布甲】末世寂灭教的最后神迹。锦面刻满了崩坏的因果符文，能将一切攻来的元素法术强行拖入寂灭。"
    },

    // --- [High Tier] R6 布甲 (总防: 30 | 速: 90 | 法攻: 15 | 属性: 12 | 售价: 42930) ---
    {
        id: "feet_268",
        name: "混沌起源神屦", // 物理偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 42930,
        durability: 999,
        effects: { phy_def: 22, mag_def: 8, speed: 90, mag_atk: 15, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诞生于混沌初开时的原始织物。它无视空间的重量，其防御力在末法时代已近乎神迹，坚固如道。"
    },
    {
        id: "feet_269",
        name: "万古天途圣履", // 均衡
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 42930,
        durability: 999,
        effects: { phy_def: 15, mag_def: 15, speed: 90, mag_atk: 15, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】贯穿万古仙途的最终之靴。穿戴者即为道之残影，足尖不落地，身形不沾尘，在生与死的边缘行走自如。"
    },
    {
        id: "feet_270",
        name: "归墟终焉绝影", // 法术偏向
        type: "feet" , defType: "cloth",
        grade: 0,
        rarity: 6,
        value: 42930,
        durability: 999,
        effects: { phy_def: 8, mag_def: 22, speed: 90, mag_atk: 15, qi: 6, shen: 6 },
        req: { shen: 90 },
        desc: "【布甲】诸天归于虚无，因果尽皆终焉。此履乃布甲之终点，穿戴者步履所至，漫天法术皆化为虚无幻影。"
    }
];

const feet = [
    ...feet_r1_batch1,
    ...feet_r1_batch2 ,
    ...feet_r1_batch3,
    ...feet_r1_batch4,
    ...feet_r1_batch5,
    ...feet_r2_batch1,
    ...feet_r2_batch2,
    ...feet_r2_batch3,
    ...feet_r2_batch4,
    ...feet_r2_batch5,
    ...feet_r3_batch1,
    ...feet_r3_batch2,
    ...feet_r3_batch3,
    ...feet_r3_batch4,
    ...feet_r3_batch5,
    ...feet_r4_batch1,
    ...feet_r4_batch2,
    ...feet_r4_batch3,
    ...feet_r4_batch4,
    ...feet_r4_batch5,
    ...feet_r5_batch1,
    ...feet_r5_batch2,
    ...feet_r5_batch3,
    ...feet_r5_batch4,
    ...feet_r5_batch5,
    ...feet_r6_batch1,
    ...feet_r6_batch2,
    ...feet_r6_batch3,
    ...feet_r6_batch4,
    ...feet_r6_batch5
];
