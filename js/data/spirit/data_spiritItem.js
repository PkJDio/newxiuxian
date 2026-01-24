// js/data/data_spiritItem.js
// 灵物数据定义

const spiritItems = [
    // 1. 灵气袋 (容器/基础物品)
    {
        id: "spiritItem_001",
        name: "灵气袋",
        type: "spiritItem",
        rarity: 1,
        spiritValue: 10, // 物品本身的灵气价值（非使用效果）
        price: 1000,      // 商店售价建议值
        canUse: false,
        effects: { },
        desc: "使用些许灵气编织而成的灵气，有了它即可收纳灵气"
    },
    {
        id: "spirit_stone_0",
        name: "灵石碎片",
        type: "spiritItem",
        rarity: 1,
        spiritValue: 1,
        price: 10,
        canUse: true,
        effects: { spiritEnergy: 1 },
        desc: "传说中的宝物，近乎于灵气的实体结晶。其光芒璀璨夺目，即便在黑夜中也能照亮方圆百里，拥有一枚便足以引来腥风血雨。"
    },
    // 2. 下品灵石 (R1)
    {
        id: "spirit_stone_1",
        name: "下品灵石",
        type: "spiritItem",
        rarity: 1,
        spiritValue: 10,
        price: 100,
        canUse: true,
        effects: { spiritEnergy: 10 },
        desc: "开采自浅层灵脉的矿石，虽蕴含灵气但杂质颇多，是修仙界最基础的交易货币与修炼资源。"
    },

    // 3. 中品灵石 (R2)
    {
        id: "spirit_stone_2",
        name: "中品灵石",
        type: "spiritItem",
        rarity: 2,
        spiritValue: 100,
        price: 10000,
        canUse: true,
        effects: { spiritEnergy: 100 },
        desc: "色泽温润，灵气纯净度远超下品灵石。握在手中能感到丝丝暖流。"
    },

    // 4. 上品灵石 (R3)
    {
        id: "spirit_stone_3",
        name: "上品灵石",
        type: "spiritItem",
        rarity: 3,
        spiritValue: 1000,
        price: 100000,
        canUse: true,
        effects: { spiritEnergy: 1000 },
        desc: "晶莹剔透，灵气内敛而不散。此等灵石往往产自大型灵脉核心，蕴含庞大的法力，是布置高阶阵法的核心材料。"
    },

    // 5. 极品灵石 (R4)
    {
        id: "spirit_stone_4",
        name: "极品灵石",
        type: "spiritItem",
        rarity: 4,
        spiritValue: 10000,
        price: 100000,
        canUse: true,
        effects: { spiritEnergy: 10000 },
        desc: "传说中的宝物，近乎于灵气的实体结晶。其光芒璀璨夺目，即便在黑夜中也能照亮方圆百里，拥有一枚便足以引来腥风血雨。"
    }
];