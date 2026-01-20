// data_entry.js (Revised & Expanded)

const ENTRY_DB = {
    // ==========================================
    // A. 攻击触发类 (On Hit/Attack) - 红色/杀伐系
    // ==========================================
    "lifesteal": {
        name: "嗜血", type: "buff", trigger: "onPostDamage",
        desc: "汲取物理伤害 {val}% 的气血", color: "#e57373", icon: "🩸"
    },
    "spellvamp": {
        name: "吞灵", type: "buff", trigger: "onPostDamage",
        desc: "汲取法术伤害 {val}% 的气血", color: "#ba68c8", icon: "🍷"
    },
    "double_strike": {
        name: "连环", type: "buff", trigger: "onPhyAttack",
        desc: "普攻有 {val}% 概率连击", color: "#ff9800", icon: "⚡"
    },
    "crit_dmg_up": {
        name: "暴戾", type: "buff", trigger: "onCalcCrit",
        desc: "暴击伤害 +{val}%", color: "#ff5252", icon: "💥"
    },
    "execute": {
        name: "绝杀", type: "buff", trigger: "onCalcDamage",
        desc: "敌血<30%时伤害 +{val}%", color: "#d32f2f", icon: "💀"
    },
    "sunder": {
        name: "穿金", type: "buff", trigger: "onCalcDef",
        desc: "无视目标 {val}% 物防", color: "#ff7043", icon: "🔨"
    },
    "penetrate": {
        name: "破法", type: "buff", trigger: "onCalcDef",
        desc: "无视目标 {val}% 法防", color: "#29b6f6", icon: "🔱"
    },
    "stun": {
        name: "震慑", type: "buff", trigger: "onPhyHit",
        desc: "物伤 {val}% 概率晕眩", color: "#8d6e63", icon: "💫"
    },
    "freeze": {
        name: "寒霜", type: "buff", trigger: "onMagHit",
        desc: "法伤 {val}% 概率迟缓", color: "#4dd0e1", icon: "❄️"
    },
    "burn": {
        name: "红莲", type: "buff", trigger: "onMagHit",
        desc: "法伤 {val}% 概率灼烧", color: "#ff5722", icon: "🔥"
    },
    "true_strike": {
        name: "剑意", type: "buff", trigger: "onPostDamage",
        desc: "追加 {val} 点真实伤害", color: "#f06292", icon: "🗡️"
    },
    "mp_steal": {
        name: "夺元", type: "buff", trigger: "onHit",
        desc: "偷取 {val} 点灵力", color: "#7e57c2", icon: "🌑"
    },
    "combo_master": {
        name: "叠浪", type: "buff", trigger: "onTurnStart",
        desc: "每回合伤害 +{val}%", color: "#42a5f5", icon: "🌊"
    },

    // ==========================================
    // B. 防御触发类 (On Damaged/Dodge) - 绿色/护体系
    // ==========================================
    "thorns": {
        name: "反震", type: "buff", trigger: "onPhyDamaged",
        desc: "反弹 {val}% 物理伤害", color: "#66bb6a", icon: "🌵"
    },
    "magic_shell": {
        name: "御魔", type: "buff", trigger: "onMagDamaged",
        desc: "法伤减免 {val}%", color: "#26a69a", icon: "🛡️"
    },
    "iron_skin": {
        name: "金身", type: "buff", trigger: "onPhyDamaged",
        desc: "物伤减免 {val}%", color: "#78909c", icon: "🧱"
    },
    "dodge_heal": {
        name: "凌波", type: "buff", trigger: "onDodge",
        desc: "闪避回血 {val} 点", color: "#9ccc65", icon: "🍃"
    },
    "revive": {
        name: "涅槃", type: "buff", trigger: "onDeath",
        desc: "濒死 {val}% 概率免死", color: "#ffa726", icon: "🐣"
    },
    "counter": {
        name: "格挡", type: "buff", trigger: "onDodge",
        desc: "闪避后反击 {val}% 伤害", color: "#ef5350", icon: "⚔️"
    },

    // ==========================================
    // C. 基础属性类 (Stat Mod) - 蓝色/根骨系
    // *注：如果是负面效果，数值传负数即可（如 锋锐 -10 就是 锈蚀）*
    // ==========================================
    "sharpness_plus": {
        name: "锋锐", type: "buff", trigger: "statMod",
        desc: "锋利 +{val}", color: "#b0bec5", icon: "🔪"
    },
    "penetration_plus": {
        name: "通透", type: "buff", trigger: "statMod",
        desc: "灵透 +{val}", color: "#81d4fa", icon: "✨"
    },
    "speed_up": {
        name: "神行", type: "buff", trigger: "statMod",
        desc: "速度 +{val}", color: "#4fc3f7", icon: "🌬️"
    },
    "hp_up_pct": {
        name: "长生", type: "buff", trigger: "statMod",
        desc: "生命 +{val}%", color: "#d4e157", icon: "🍑"
    },
    "atk_up_pct": {
        name: "神力", type: "buff", trigger: "statMod",
        desc: "物攻 +{val}%", color: "#ff7043", icon: "💪"
    },
    "mag_up_pct": {
        name: "元神", type: "buff", trigger: "statMod",
        desc: "法攻 +{val}%", color: "#ab47bc", icon: "🔮"
    },
    "luck_up": {
        name: "天眷", type: "buff", trigger: "statMod",
        desc: "气运 +{val}", color: "#ffca28", icon: "🍀"
    },
    "first_strike": {
        name: "先机", type: "buff", trigger: "battleStart",
        desc: "初始行动条 +{val}%", color: "#ffee58", icon: "⚡"
    },

    // ==========================================
    // D. 特殊机制负面 (Mechanic Debuff) - 暗色/心魔系
    // *注：无法简单用数值正负表示的机制*
    // ==========================================
    "frail": {
        name: "破绽", type: "debuff", trigger: "onTakeDamage",
        desc: "最终承伤增加 {val}%", color: "#a1887f", icon: "💔"
    },
    "blood_thirst": {
        name: "血祭", type: "debuff", trigger: "onAttack",
        desc: "攻击时自损 {val} 点气血", color: "#b71c1c", icon: "🩸"
    },
    "leaking": {
        name: "散功", type: "debuff", trigger: "turnStart",
        desc: "回合流失 {val} 点灵力", color: "#4a148c", icon: "💧"
    },
    "blind": {
        name: "迷障", type: "debuff", trigger: "onCalcHit",
        desc: "最终命中率 -{val}%", color: "#424242", icon: "👁️"
    },

    // ==========================================
    // E. 机缘/生活类 (Utility) - 金色/特殊系
    // *新增部分*
    // ==========================================
    "gold_rate_up": {
        name: "聚财", type: "buff", trigger: "onLoot",
        desc: "战斗灵石获取 +{val}%", color: "#ffd700", icon: "💰"
    },
    "drop_rate_up": {
        name: "机缘", type: "buff", trigger: "onLoot",
        desc: "物品掉落率 +{val}%", color: "#fff176", icon: "🎁"
    },
    "exp_rate_up": {
        name: "慧根", type: "buff", trigger: "onBattleEnd",
        desc: "修为/经验获取 +{val}%", color: "#81c784", icon: "🧠"
    },
    "gather_yield": {
        name: "丰饶", type: "buff", trigger: "onGather",
        desc: "采集收益增加 {val}%", color: "#aed581", icon: "🌾"
    },
    "fishing_luck": {
        name: "垂纶", type: "buff", trigger: "onFish",
        desc: "钓鱼成功率/品质 +{val}%", color: "#4fc3f7", icon: "🎣"
    },
    "alchemy_success": {
        name: "丹火", type: "buff", trigger: "onAlchemy",
        desc: "炼丹成功率 +{val}%", color: "#ff8a65", icon: "🔥"
    },
    "smithing_save": {
        name: "天工", type: "buff", trigger: "onSmith",
        desc: "锻造时 {val}% 概率不消耗材料", color: "#90a4ae", icon: "⚒️"
    }
};

// 挂载到全局
window.ENTRY_DB = ENTRY_DB;