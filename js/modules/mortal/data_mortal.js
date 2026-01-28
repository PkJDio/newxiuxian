// js/data/data_mortal.js

window.DATA_MORTAL = {
    // 境界定义
    RANKS: {
        0: { name: "凡人", maxExp: 500, desc: "肉体凡胎，未入道途，需打熬筋骨以证大道。" },
        1: { name: "开窍境", maxExp: 1200, desc: "初识气感，穴窍微张，精气始生。" },
        2: { name: "拓脉境", maxExp: 4800, desc: "经脉扩张，气血如龙，内力奔涌。" },
        3: { name: "凝罡境", maxExp: 12000, desc: "内力外放，聚气成罡，刀枪不入。" },
        4: { name: "归一境", maxExp: 30000, desc: "精气神合，返璞归真，浑然天成。" },
        5: { name: "登峰境", maxExp: 80000, desc: "凡尘极致，登峰造极，以武入道。" }
    },

    RETREAT_COST: { 0: 500, 1: 1000, 2: 1500, 3: 2000, 4: 2500, 5: 3000 },
    KILL_EXP: { "minion": 1, "elite": 5, "boss": 20, "master": 50 },

    // 【核心配置】根据需求定制
    PATHS: {
        1: {
            suffix: "破军意",
            name_variants: ["初锋", "破军", "摧城", "碎星", "诛神"],
            desc: "以杀证道，攻伐无双。",
            attr_desc: "攻击力大幅提升",

            task_type: "damage_dealt",
            task_desc: "造成伤害",
            formula: (rank) => 800 * (1 + rank),

            // 额外要求：R3/4/5 击杀特定怪物
            extra: {
                3: { type: "kill_elite", target: 3, desc: "击败劲敌" },
                4: { type: "kill_boss", target: 1, desc: "击败豪强" },
                5: { type: "kill_boss", target: 3, desc: "击败豪强" }
            },
            reward: { attr: "atkPct", val: 0.20, isBuff: true }
        },
        2: {
            suffix: "磐石固",
            name_variants: ["铁肤", "磐石", "金钟", "龙鳞", "不灭"],
            desc: "不动如山，坚不可摧。",
            attr_desc: "防御力大幅提升",

            task_type: "damage_taken",
            task_desc: "承受伤害",
            formula: (rank) => 800 * (1 + rank),

            // 额外要求：R1-R5 服用防御丹药
            // params: { type: 'pill', attr: 'def', rarity: X }
            extra: {
                1: { type: "use_specific_item", target: 1, desc: "服用一品防御丹", params: {type:'pill', attr:'def', rarity:1} },
                2: { type: "use_specific_item", target: 1, desc: "服用二品防御丹", params: {type:'pill', attr:'def', rarity:2} },
                3: { type: "use_specific_item", target: 1, desc: "服用三品防御丹", params: {type:'pill', attr:'def', rarity:3} },
                4: { type: "use_specific_item", target: 1, desc: "服用四品防御丹", params: {type:'pill', attr:'def', rarity:4} },
                5: { type: "use_specific_item", target: 1, desc: "服用四品防御丹", params: {type:'pill', attr:'def', rarity:4} } // 需求为R5也用R4
            },
            reward: { attr: "defPct", val: 0.20, isBuff: true }
        },
        3: {
            suffix: "逐影踪",
            name_variants: ["疾行", "逐影", "踏风", "瞬息", "虚空"],
            desc: "身如鬼魅，瞬息千里。",
            attr_desc: "速度大幅提升",

            task_type: "move_distance",
            task_desc: "移动距离",
            formula: (rank) => 1000 * (1 + rank),

            // 速度限制公式 (用于逻辑判断)
            min_speed_formula: (rank) => 10 + 20 * rank,

            extra: {},
            reward: { attr: "spdPct", val: 0.20, isBuff: true }
        },
        4: {
            suffix: "载道躯",
            name_variants: ["纳川", "载道", "容海", "吞穹", "万法"],
            desc: "海纳百川，有容乃大。",
            attr_desc: "功法槽位 +1",

            task_type: "consume_hunger",
            task_desc: "消耗饱食",
            formula: (rank) => 1000 * (1 + rank),

            // 额外要求：食用 Rank+1 级的鱼 (params.rarity = rank + 1)
            extra: {
                0: { type: "use_specific_item", target: 1, desc: "食用一品灵鱼", params: {type:'fish', rarity:1} },
                1: { type: "use_specific_item", target: 1, desc: "食用二品灵鱼", params: {type:'fish', rarity:2} },
                2: { type: "use_specific_item", target: 1, desc: "食用三品灵鱼", params: {type:'fish', rarity:3} },
                3: { type: "use_specific_item", target: 1, desc: "食用四品灵鱼", params: {type:'fish', rarity:4} },
                4: { type: "use_specific_item", target: 1, desc: "食用五品灵鱼", params: {type:'fish', rarity:5} },
                5: { type: "use_specific_item", target: 1, desc: "食用六品灵鱼", params: {type:'fish', rarity:6} }
            },
            reward: { attr: "gongfa_nums", val: 1, isBuff: false }
        },
        5: {
            suffix: "明心智",
            name_variants: ["通幽", "明心", "见神", "知微", "全知"],
            desc: "通幽洞微，万法皆明。",
            attr_desc: "招式槽位 +1",

            task_type: "learn_skill",
            task_desc: "学会新功法/招式",
            formula: (rank) => 1 * (1 + rank),

            extra: {},
            reward: { attr: "zhaoshi_nums", val: 1, isBuff: false }
        },
        6: {
            suffix: "混元志",
            name_variants: ["调息", "混元", "太极", "无极", "归墟"],
            desc: "周流六虚，无极归一。",
            attr_desc: "全属性小幅提升",

            task_type: "kill_any",
            task_desc: "击败敌人",
            formula: (rank) => 5 * (1 + rank),

            // 金钱消耗公式 (用于点击完成时扣除)
            cost_money_formula: (rank) => 5000 + rank * 10000,

            extra: {},
            reward: { attr: "all2", val: 0.05, isBuff: true }
        }
    }
};

window.getMortalBreakthroughOptions = function(currentRank) {
    let options = [];
    let variantIndex = currentRank;

    for (let i = 1; i <= 6; i++) {
        let pathConfig = window.DATA_MORTAL.PATHS[i];
        let safeIndex = Math.min(variantIndex, pathConfig.name_variants.length - 1);
        let variantName = pathConfig.name_variants[safeIndex];

        let nextRankConfig = window.DATA_MORTAL.RANKS[currentRank];
        let rankPrefix = nextRankConfig ? nextRankConfig.name : "未知";
        let finalName = `${rankPrefix}·${variantName}`;

        options.push({
            id: i,
            name: finalName,
            desc: pathConfig.desc,
            attr_desc: pathConfig.attr_desc,
            pathId: i,
            reward: pathConfig.reward
        });
    }
    return options;
};