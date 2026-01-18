// data_entry.js (Revised)

const ENTRY_DB = {
    // --- 攻击触发 (On Hit/Attack) ---
    "lifesteal": { name: "嗜血", type: "buff", trigger: "onPostDamage", desc: "汲取物理伤害 {val}% 的气血", color: "#e57373" },
    "spellvamp": { name: "吞灵", type: "buff", trigger: "onPostDamage", desc: "汲取法术伤害 {val}% 的气血", color: "#ba68c8" },
    "double_strike": { name: "连环", type: "buff", trigger: "onPhyAttack", desc: "普攻有 {val}% 概率连击", color: "#ff9800" },
    "crit_dmg_up": { name: "暴戾", type: "buff", trigger: "onCalcCrit", desc: "暴击伤害 +{val}%", color: "#ff5252" },
    "execute": { name: "绝杀", type: "buff", trigger: "onCalcDamage", desc: "敌血<30%时伤害 +{val}%", color: "#d32f2f" },
    "sunder": { name: "穿金", type: "buff", trigger: "onCalcDef", desc: "无视目标 {val}% 物防", color: "#ff7043" },
    "penetrate": { name: "破法", type: "buff", trigger: "onCalcDef", desc: "无视目标 {val}% 法防", color: "#29b6f6" },
    "stun": { name: "震慑", type: "buff", trigger: "onPhyHit", desc: "物伤 {val}% 概率晕眩", color: "#8d6e63" },
    "freeze": { name: "寒霜", type: "buff", trigger: "onMagHit", desc: "法伤 {val}% 概率迟缓", color: "#4dd0e1" },
    "burn": { name: "红莲", type: "buff", trigger: "onMagHit", desc: "法伤 {val}% 概率灼烧", color: "#ff5722" },
    "true_strike": { name: "剑意", type: "buff", trigger: "onPostDamage", desc: "追加 {val} 点真实伤害", color: "#f06292" },
    "mp_steal": { name: "夺元", type: "buff", trigger: "onHit", desc: "偷取 {val} 点灵力", color: "#7e57c2" },
    "combo_master": { name: "叠浪", type: "buff", trigger: "onTurnStart", desc: "每回合伤害 +{val}%", color: "#42a5f5" },

    // --- 防御触发 (On Damaged/Dodge) ---
    "thorns": { name: "反震", type: "buff", trigger: "onPhyDamaged", desc: "反弹 {val}% 物理伤害", color: "#66bb6a" },
    "magic_shell": { name: "御魔", type: "buff", trigger: "onMagDamaged", desc: "法伤减免 {val}%", color: "#26a69a" },
    "iron_skin": { name: "金身", type: "buff", trigger: "onPhyDamaged", desc: "物伤减免 {val}%", color: "#78909c" },
    "dodge_heal": { name: "凌波", type: "buff", trigger: "onDodge", desc: "闪避回血 {val} 点", color: "#9ccc65" },
    "revive": { name: "涅槃", type: "buff", trigger: "onDeath", desc: "濒死 {val}% 概率免死", color: "#ffa726" },
    "counter": { name: "格挡", type: "buff", trigger: "onDodge", desc: "闪避后反击 {val}% 伤害", color: "#ef5350" },

    // --- 属性修正 (Stat Mod) ---
    "sharpness_plus": { name: "锋锐", type: "buff", trigger: "statMod", desc: "锋利 +{val}", color: "#b0bec5" },
    "penetration_plus": { name: "通透", type: "buff", trigger: "statMod", desc: "灵透 +{val}", color: "#81d4fa" },
    "speed_up": { name: "神行", type: "buff", trigger: "statMod", desc: "速度 +{val}", color: "#4fc3f7" },
    "hp_up_pct": { name: "长生", type: "buff", trigger: "statMod", desc: "生命 +{val}%", color: "#d4e157" },
    "atk_up_pct": { name: "神力", type: "buff", trigger: "statMod", desc: "物攻 +{val}%", color: "#ff7043" },
    "mag_up_pct": { name: "元神", type: "buff", trigger: "statMod", desc: "法攻 +{val}%", color: "#ab47bc" },
    "luck_up": { name: "天眷", type: "buff", trigger: "statMod", desc: "气运 +{val}", color: "#ffca28" },
    "first_strike": { name: "先机", type: "buff", trigger: "battleStart", desc: "初始行动条 +{val}%", color: "#ffee58" },

    // --- 负面 (Debuff) ---
    "frail": { name: "破绽", type: "debuff", trigger: "onTakeDamage", desc: "承伤增加 {val}%", color: "#a1887f" },
    "blood_thirst": { name: "血祭", type: "debuff", trigger: "onAttack", desc: "攻击自损 {val} 血", color: "#b71c1c" },
    "leaking": { name: "散功", type: "debuff", trigger: "turnStart", desc: "回合流失 {val} 灵", color: "#4a148c" },
    "blind": { name: "迷障", type: "debuff", trigger: "onCalcHit", desc: "命中 -{val}%", color: "#424242" },
};