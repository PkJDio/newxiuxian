// 词条定义库
// type: 'buff' (正面) | 'debuff' (负面)
// trigger: 触发时机，用于战斗系统判断在代码的哪一行执行
// paramDesc: 用于UI显示的数值占位符描述

const ENTRY_DB = {
    // ==========================================
    // A. 攻击触发类 (On Hit) - 物理/法术区分
    // ==========================================
    "lifesteal": {
        name: "吸血", type: "buff", trigger: "onPhyHit",
        desc: "造成物理伤害时，回复伤害值 {val}% 的生命"
    },
    "spellvamp": {
        name: "魔饮", type: "buff", trigger: "onMagHit",
        desc: "造成法术伤害时，回复伤害值 {val}% 的生命"
    },
    "double_strike": {
        name: "连击", type: "buff", trigger: "onPhyAttack",
        desc: "物理攻击时有 {val}% 概率立即追加一次普攻"
    },
    "crit_dmg_up": {
        name: "致命", type: "buff", trigger: "onCalcDamage",
        desc: "暴击伤害倍率提升 {val}%"
    },
    "execute": {
        name: "斩杀", type: "buff", trigger: "onCalcDamage",
        desc: "目标生命低于30%时，伤害提升 {val}%"
    },
    "sunder": {
        name: "破甲", type: "buff", trigger: "onCalcDef",
        desc: "攻击时无视目标 {val}% 的物理防御"
    },
    "penetrate": {
        name: "法穿", type: "buff", trigger: "onCalcDef",
        desc: "攻击时无视目标 {val}% 的法术防御"
    },
    "stun": {
        name: "重击", type: "buff", trigger: "onPhyHit",
        desc: "物理伤害有 {val}% 概率使目标晕眩1回合"
    },
    "freeze": {
        name: "冰封", type: "buff", trigger: "onMagHit",
        desc: "法术伤害有 {val}% 概率冻结目标（速度-50%）"
    },
    "burn": {
        name: "灼烧", type: "buff", trigger: "onMagHit",
        desc: "法术伤害有 {val}% 概率施加灼烧（每回合扣血）"
    },
    "splash": {
        name: "溅射", type: "buff", trigger: "onPhyHit",
        desc: "对目标周围敌人造成 {val}% 的扩散伤害" // 需多目标系统支持
    },
    "true_strike": {
        name: "追伤", type: "buff", trigger: "onPostDamage",
        desc: "攻击后额外造成 {val} 点真实伤害"
    },
    "mp_steal": {
        name: "噬灵", type: "buff", trigger: "onHit",
        desc: "攻击偷取目标 {val} 点灵力"
    },
    "combo_master": {
        name: "叠浪", type: "buff", trigger: "onHit",
        desc: "每次攻击使下一次伤害提升 {val}%，可叠加"
    },

    // ==========================================
    // B. 受击/防御类 (On Damaged)
    // ==========================================
    "thorns": {
        name: "荆棘", type: "buff", trigger: "onPhyDamaged",
        desc: "受到物理伤害时，反弹来源伤害的 {val}%"
    },
    "magic_shell": {
        name: "法盾", type: "buff", trigger: "onMagDamaged",
        desc: "受到的法术伤害减少 {val}%"
    },
    "iron_skin": {
        name: "钢筋", type: "buff", trigger: "onPhyDamaged",
        desc: "受到的物理伤害减少 {val}%"
    },
    "dodge_heal": {
        name: "幻身", type: "buff", trigger: "onDodge",
        desc: "成功闪避后，回复 {val} 点生命"
    },
    "revive": {
        name: "涅槃", type: "buff", trigger: "onDeath",
        desc: "受到致命伤时有 {val}% 概率保留1点血不死"
    },
    "counter": {
        name: "反击", type: "buff", trigger: "onDodge",
        desc: "闪避后立刻对敌人进行一次反击，造成 {val}% 伤害"
    },

    // ==========================================
    // C. 属性修正类 (Stat Mod - 战斗外/计算前生效)
    // ==========================================
    "sharpness_plus": {
        name: "锐利", type: "buff", trigger: "statMod",
        desc: "锋利度 +{val}"
    },
    "penetration_plus": {
        name: "灵透", type: "buff", trigger: "statMod",
        desc: "灵透度 +{val}"
    },
    "speed_up": {
        name: "神行", type: "buff", trigger: "statMod",
        desc: "速度 +{val}"
    },
    "hp_up_pct": {
        name: "长生", type: "buff", trigger: "statMod",
        desc: "生命上限提升 {val}%"
    },
    "atk_up_pct": {
        name: "巨力", type: "buff", trigger: "statMod",
        desc: "物理攻击力提升 {val}%"
    },
    "mag_up_pct": {
        name: "通神", type: "buff", trigger: "statMod",
        desc: "法术攻击力提升 {val}%"
    },
    "luck_up": {
        name: "鸿运", type: "buff", trigger: "statMod",
        desc: "气运 +{val}"
    },
    "first_strike": {
        name: "先制", type: "buff", trigger: "battleStart",
        desc: "战斗开始时，行动条增加 {val}%"
    },

    // ==========================================
    // D. 生活/特殊类 (Misc)
    // ==========================================
    "greedy": {
        name: "贪婪", type: "buff", trigger: "onLoot",
        desc: "战斗金钱获取增加 {val}%"
    },
    "scavenger": {
        name: "搜刮", type: "buff", trigger: "onLoot",
        desc: "物品掉落率增加 {val}%"
    },

    // ==========================================
    // E. 负面词条 (Debuff - 诅咒类)
    // ==========================================
    "dull": {
        name: "钝刃", type: "debuff", trigger: "statMod",
        desc: "锋利度降低 {val}"
    },
    "heavy": {
        name: "沉重", type: "debuff", trigger: "statMod",
        desc: "速度降低 {val}"
    },
    "frail": {
        name: "易碎", type: "debuff", trigger: "statMod",
        desc: "受到的所有伤害增加 {val}%"
    },
    "blood_thirst": {
        name: "反噬", type: "debuff", trigger: "onAttack",
        desc: "攻击时扣除自身 {val} 点生命"
    },
    "leaking": {
        name: "漏灵", type: "debuff", trigger: "turnStart",
        desc: "每回合流失 {val} 点灵力"
    },
    "blind": {
        name: "盲目", type: "debuff", trigger: "onCalcHit",
        desc: "命中率降低 {val}%"
    },
    "cursed_luck": {
        name: "厄运", type: "debuff", trigger: "statMod",
        desc: "气运降低 {val}"
    },
    "soft": {
        name: "绵软", type: "debuff", trigger: "onCalcDamage",
        desc: "造成的最终伤害降低 {val}%"
    },
    "reckless": {
        name: "鲁莽", type: "debuff", trigger: "mixed",
        desc: "攻击提升20%，但防御降低 {val}%"
    },
    "rust": {
        name: "锈蚀", type: "debuff", trigger: "onPostCombat",
        desc: "战斗结束时，耐久度额外消耗 {val} 点"
    }
};

// 挂载到全局
window.ENTRY_DB = ENTRY_DB;