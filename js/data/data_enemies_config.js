// ==========================================
// 怪物数值计算器 (Enemy Stat Calculator) - Ver 1.1
// 更新内容: 新增 [mechanism] 机关种族
// ==========================================
const EnemyCalc = {
    // ------------------------------------------
    // 1. 全局配置 (可随时微调)
    // ------------------------------------------
    CONFIG: {
        // [A] 基准值 (对应 timeStart:0 的 Minion)
        BASE: {
            HP: 90,     // 标准血量
            ATK: 18,    // 标准攻击 (将根据倾向分配给物/法)
            DEF: 4,     // 标准防御 (将根据倾向分配给物/法)
            SPD: 10     // 标准速度
        },

        // [B] 时间线成长 (timeStart)
        // 公式: 最终倍率 = 1 + (GROWTH_RATE * timeStart)
        // 示例: timeStart=2 时, 属性 = 基准 * (1 + 0.4*2) = 1.8倍
        GROWTH_RATE: 0.4,

        // [C] 阶级修正 (Template) - 控制 Boss/Lord 膨胀程度
        TIERS: {
            "minion": { hp: 1.0,  atk: 1.0,  def: 1.0,  spd: 0 },
            "elite":  { hp: 2.5,  atk: 1.5,  def: 2.5,  spd: 2 },
            "boss":   { hp: 6.0,  atk: 2.5,  def: 4.0,  spd: 5 },
            "lord":   { hp: 12.0, atk: 3.5,  def: 6.0,  spd: 5 }
        },

        // [D] 种族修正 (SubType) - 差异化风格
        RACES: {
            "human":     { hp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 }, // 标准
            "beast":     { hp: 1.2, atk: 1.1, def: 0.9, spd: 1.0 }, // 血厚攻高
            "undead":    { hp: 1.4, atk: 0.9, def: 1.1, spd: 0.8 }, // 死肉
            "insect":    { hp: 0.7, atk: 1.1, def: 0.8, spd: 1.3 }, // 脆皮快
            "elemental": { hp: 0.9, atk: 1.2, def: 1.5, spd: 0.9 }, // 高抗
            "dragon":    { hp: 1.5, atk: 1.2, def: 1.2, spd: 1.1 }, // 强力
            // 【新增】机关: 极肉、极硬、攻击沉重、极慢
            "mechanism": { hp: 1.5, atk: 1.2, def: 1.3, spd: 0.5 }
        },

        // [E] 攻防倾向 (Tendency) - 决定物理/法术分配比例 (核心)
        // 格式: { p_atk: 物攻系数, m_atk: 法攻系数, p_def: 物防系数, m_def: 法防系数 }
        TENDENCIES: {
            // 纯物理 (如: 强盗, 狼)
            "phy":       { p_atk: 1.0, m_atk: 0.1, p_def: 1.0, m_def: 0.6 },
            // 纯法术 (如: 巫师, 幽灵)
            "mag":       { p_atk: 0.1, m_atk: 1.0, p_def: 0.6, m_def: 1.0 },
            // 均衡/双修 (如: 龙, 高级修士)
            "balance":   { p_atk: 0.7, m_atk: 0.7, p_def: 0.8, m_def: 0.8 },
            // 肉盾 (如: 龟, 象, 机关)
            "tank":      { p_atk: 0.6, m_atk: 0.6, p_def: 1.4, m_def: 1.2 },
            // 狂暴/刺客 (如: 虎, 剑客)
            "assassin":  { p_atk: 1.3, m_atk: 0.2, p_def: 0.5, m_def: 0.5 }
        }
    },

    // ------------------------------------------
    // 2. 计算函数 (调用此函数生成 stats)
    // ------------------------------------------
    getStats: function(template, timeStart, subType, tendencyName) {
        const C = this.CONFIG;

        // 获取对应系数 (缺省值兜底)
        const tier = C.TIERS[template] || C.TIERS["minion"];
        const race = C.RACES[subType]  || C.RACES["human"];
        const tend = C.TENDENCIES[tendencyName] || C.TENDENCIES["balance"];

        // 计算时间膨胀倍率
        const timeMult = 1 + (C.GROWTH_RATE * (timeStart || 0));

        // 核心计算闭包
        const calc = (baseVal, tierMult, raceMult) => {
            return Math.floor(baseVal * timeMult * tierMult * raceMult);
        };

        // 1. 计算总属性池
        const totalHp  = calc(C.BASE.HP,  tier.hp,  race.hp);
        const totalAtk = calc(C.BASE.ATK, tier.atk, race.atk);
        const totalDef = calc(C.BASE.DEF, tier.def, race.def);

        // 速度公式: (基准 + 阶级加成) * 种族修正 (速度通常不随时间无限膨胀)
        const finalSpd = Math.floor((C.BASE.SPD + tier.spd) * race.spd);

        // 2. 根据倾向分配属性
        return {
            hp: totalHp,
            speed: finalSpd,

            // 攻击拆分
            phy_atk: Math.floor(totalAtk * tend.p_atk),
            mag_atk: Math.floor(totalAtk * tend.m_atk),
            // 兼容旧字段 (取最大值)
            atk: Math.floor(totalAtk * Math.max(tend.p_atk, tend.m_atk)),

            // 防御拆分
            phy_def: Math.floor(totalDef * tend.p_def),
            mag_def: Math.floor(totalDef * tend.m_def),
            // 兼容旧字段
            def: Math.floor(totalDef * Math.max(tend.p_def, tend.m_def))
        };
    }
};
const ENEMY_TEMPLATES = {
    "minion": {
        name       : "杂鱼",
        color      : "#212121",
        basePen    : 0,
        multipliers: {hp: 1.0, atk: 1.0, def: 1.0, speed: 1.0, exp: 1.0, money: 1.0},
        icon: "💀",
        crit: 0.05,
        accuracy: 0
    },
    "elite" : {
        name       : "精英",
        color      : "#1e5faf",
        basePen    : 15, // 精英微量穿甲
        multipliers: {hp: 3.5, atk: 1.3, def: 1.2, speed: 1.1, exp: 3.0, money: 2.5},
        icon: "💀",
        crit: 0.07,
        accuracy: 10
    },
    "boss"  : {
        name       : "头目",
        color      : "#56059f",
        basePen    : 35, // 头目具备穿甲能力
        multipliers: {hp: 7.0, atk: 1.5, def: 1.4, speed: 1.15, exp: 10.0, money: 10.0},
        icon: "☠️",
        crit: 0.1,
        accuracy: 20
    },
    "lord"  : {
        name       : "领主",
        color      : "#a60518",
        basePen    : 55, // 领主高穿甲，克制重甲
        multipliers: {hp: 14.0, atk: 1.8, def: 1.8, speed: 1.25, exp: 50.0, money: 50.0},
        icon: "👹",
        crit: 0.15,
        accuracy: 30
    }
};
window.ENEMY_TEMPLATES = ENEMY_TEMPLATES;
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