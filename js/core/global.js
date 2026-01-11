// js/core/global.js
// 全局核心：数据库, 属性计算, 常用常量
// 【调试版】recalcStats: 加入详细日志追踪属性来源

/* ================= 1. 游戏数据库 (GAME_DB) ================= */
// ... (GAME_DB 和 initGameDB 部分保持不变，此处省略以节省空间) ...
const GAME_DB = {
    items: [], enemies: [], levels: ["凡人", "炼气", "筑基", "金丹", "元婴", "化神", "渡劫", "大乘", "飞升"], maps: [], equipments: [], eatables: [], herbs: []
};
function initGameDB() {
    const itemSources = [
        typeof materials !== "undefined" ? materials : [], typeof foodMaterial !== "undefined" ? foodMaterial : [], typeof foods !== "undefined" ? foods : [], typeof fishes !== "undefined" ? fishes : [],
        typeof weapons !== "undefined" ? weapons : [], typeof head !== "undefined" ? head : [], typeof body !== "undefined" ? body : [], typeof feet !== "undefined" ? feet : [],
        typeof books !== "undefined" ? books : [], typeof pills !== "undefined" ? pills : [], typeof herbs !== "undefined" ? herbs : [], typeof mounts !== "undefined" ? mounts : [], typeof fishingRods !== "undefined" ? fishingRods : [],
    ];
    GAME_DB.items = []; itemSources.forEach(arr => GAME_DB.items = GAME_DB.items.concat(arr));
    const equipItemSources = [ typeof weapons !== "undefined" ? weapons : [], typeof head !== "undefined" ? head : [], typeof body !== "undefined" ? body : [], typeof feet !== "undefined" ? feet : [], typeof fishingRods !== "undefined" ? fishingRods : [] ];
    GAME_DB.equipments = []; equipItemSources.forEach(arr => GAME_DB.equipments = GAME_DB.equipments.concat(arr));
    const eatItemSources = [ typeof foodMaterial !== "undefined" ? foodMaterial : [], typeof foods !== "undefined" ? foods : [], typeof fishes !== "undefined" ? fishes : [] ];
    GAME_DB.eatables = []; eatItemSources.forEach(arr => GAME_DB.eatables = GAME_DB.eatables.concat(arr));
    const herbItemSources = [ typeof herbs !== "undefined" ? herbs : [], typeof pills !== "undefined" ? pills : [] ];
    GAME_DB.herbs = []; herbItemSources.forEach(arr => GAME_DB.herbs = GAME_DB.herbs.concat(arr));
    if (typeof enemies !== 'undefined') GAME_DB.enemies = enemies;
    if (typeof SUB_REGIONS !== 'undefined') GAME_DB.maps = SUB_REGIONS;
}

/* ================= 2. 核心属性计算系统 ================= */

/**
 * 重新计算玩家所有属性 (Derived Stats)
 * 逻辑：基础 -> 转世 -> 装备 -> 转化(精气神变攻防) -> Buff(百分比加成) -> 状态惩罚
 */
function recalcStats() {
    if (!player) return;

    // 【调试】开启分组，方便折叠查看
    console.groupCollapsed("📊 [属性计算] 详细追踪 log");

    // 1. 初始化 derived (最终属性)
    player.derived = {
        jing: 0, qi: 0, shen: 0,
        atk: 0, def: 0, speed: 0,
        hpMax: 0, mpMax: 0,
        hungerMax: 200,   // 基础值：200
        fatigueMax: 100,  // 基础值：100
        space: 200,
    };
    console.log("1. 初始化基础值:", JSON.parse(JSON.stringify(player.derived)));

    // 初始化统计详情
    player.statBreakdown = {};

    // --- 内部辅助函数：累加属性并记录来源 ---
    const add = (key, val, source, extra = null) => {
        if (val === 0) return;
        if (player.derived[key] === undefined) player.derived[key] = 0;

        // 【调试】打印每一条加成
        console.log(`➕ [${key}] +${val} \t来源: ${source} \t(当前: ${player.derived[key] + val})`);

        player.derived[key] += val;

        if (!player.statBreakdown[key]) player.statBreakdown[key] = [];
        let entry = { label: source, val: val };
        if (extra) Object.assign(entry, extra);
        player.statBreakdown[key].push(entry);
    };

    // ================= A. 基础数值层 =================
    console.log("--- A. 基础属性 ---");
    for (let k in player.attr) {
        add(k, player.attr[k], "基础属性");
    }

    if (player.exAttr) {
        for (let k in player.exAttr) {
            add(k, player.exAttr[k], "永久加成");
        }
    }

    // ================= B. 装备层 (扁平数值) =================
    console.log("--- B. 装备加成 ---");
    if (player.equipment) {
        const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'fishing_rod'];
        slots.forEach(slot => {
            const itemId = player.equipment[slot];
            if (itemId) {
                const item = GAME_DB.items.find(i => i.id === itemId);
                if (item) {
                    if (slot === 'weapon') {
                        const wpSharp = item.sharpness || (item.effects && item.effects.sharpness) || 0;
                        player.derived.sharpness = wpSharp;
                    }
                    if (item.effects) {
                        for (let k in item.effects) {
                            add(k, item.effects[k], `装备-[${item.name}]`);
                        }
                    }
                }
            }
        });

        // 功法被动
        ['gongfa'].forEach(type => {
            const list = player.equipment[type];
            if (Array.isArray(list)) {
                list.forEach(skillId => {
                    if (!skillId) return;
                    if (window.UtilsSkill) {
                        const skillInfo = UtilsSkill.getSkillInfo(skillId);
                        if (skillInfo && skillInfo.finalEffects) {
                            for (let k in skillInfo.finalEffects) {
                                add(k, skillInfo.finalEffects[k], `功法-[${skillInfo.name}]`);
                            }
                        }
                    } else {
                        const item = books.find(i => i && i.id === skillId);
                        if (item && item.effects) {
                            for (let k in item.effects) {
                                if(typeof item.effects[k] === 'number') add(k, item.effects[k], item.name);
                            }
                        }
                    }
                });
            }
        });
    }

    // ================= C. 转化层 (精气神 -> 二级属性) =================
    console.log("--- C. 属性转化 ---");
    const totalJing = player.derived.jing || 0;
    const totalQi   = player.derived.qi || 0;
    const totalShen = player.derived.shen || 0;

    console.log(`ℹ️ 当前面板三维: 精[${totalJing}] 气[${totalQi}] 神[${totalShen}]`);

    add('hpMax', totalJing * 10, "转化(精x10)");
    add('def',   Math.floor(totalJing * 0.5), "转化(精x0.5)");
    add('mpMax', totalQi * 5, "转化(气x5)");
    add('atk',   totalShen * 1, "转化(神x1)");
    add('speed', Math.floor(totalShen * 0.2), "转化(神x0.2)");

    // 生存上限动态转化
    add('hungerMax', totalJing * 5, "转化(精x5)");
    add('fatigueMax', totalJing * 2, "转化(精x2)");
    add('fatigueMax', totalShen * 1, "转化(神x1)");


    // ================= D. 状态层 (Buff 加成) =================
    console.log("--- D. Buff/Debuff ---");
    console.log("1. 状态层:", player.buffs)
    if (player.buffs) {
        for (let buffId in player.buffs) {
            const buff = player.buffs[buffId];
            if (!buff || (buff.days !== undefined && buff.days <= 0)) continue;

            let buffName = buff.name || "状态";

            if (buff.effects) {
                if (buff.effects.atkPct) {
                    const val = Math.floor(player.derived.atk * buff.effects.atkPct);
                    add('atk', val, `${buffName}(${buff.effects.atkPct*100}%)`);
                }
                if (buff.effects.defPct) {
                    const val = Math.floor(player.derived.def * buff.effects.defPct);
                    add('def', val, `${buffName}(${buff.effects.defPct*100}%)`);
                }
                if (buff.effects.spdPct) {
                    const val = Math.floor(player.derived.speed * buff.effects.spdPct);
                    add('speed', val, `${buffName}(${buff.effects.spdPct*100}%)`);
                }

                for (let key in buff.effects) {
                    if (key.endsWith('Pct')) continue;
                    if (typeof buff.effects[key] === 'number') {
                        add(key, buff.effects[key], buffName);
                    }
                }
            }
            else if (buff.attr && typeof buff.val === 'number') {
                add(buff.attr, buff.val, buffName, { days: buff.days });
            }
        }
    }

    // ================= E. 状态惩罚 (疲劳/饥饿) =================
    let efficiency = 1.0;
    const hasFatigue = player.buffs && player.buffs['debuff_fatigue'];
    const hasHunger = player.buffs && player.buffs['debuff_hunger'];

    if (hasFatigue) efficiency *= 0.5;
    if (hasHunger) efficiency *= 0.5;

    if (efficiency < 1.0) {
        console.log(`⚠️ 触发虚弱状态，当前效率: ${efficiency * 100}%`);
        const lossRatio = 1.0 - efficiency;
        const currentAtk = player.derived.atk || 0;
        const currentDef = player.derived.def || 0;
        const currentSpeed = player.derived.speed || 0;

        const lostAtk = Math.floor(currentAtk * lossRatio);
        const lostDef = Math.floor(currentDef * lossRatio);
        const lostSpeed = Math.floor(currentSpeed * lossRatio);

        if (lostAtk > 0) add('atk', -lostAtk, "身体状态(虚弱)");
        if (lostDef > 0) add('def', -lostDef, "身体状态(虚弱)");
        if (lostSpeed > 0) add('speed', -lostSpeed, "身体状态(虚弱)");
    }

    // ================= F. 收尾 =================

    // 状态修正 (Clamp)
    if (player.status.hp > player.derived.hpMax) player.status.hp = player.derived.hpMax;
    if (player.status.mp > player.derived.mpMax) player.status.mp = player.derived.mpMax;

    if (player.status.hunger > player.derived.hungerMax) player.status.hunger = player.derived.hungerMax;
    if (player.status.fatigue > player.derived.fatigueMax) player.status.fatigue = player.derived.fatigueMax;
    if (player.status.fatigue < 0) player.status.fatigue = 0;

    if (player.derived.speed < 1) player.derived.speed = 1;
    if (player.derived.atk < 1) player.derived.atk = 1;

    player.derived.hp = player.status.hp;
    player.derived.mp = player.status.mp;
    player.derived.hunger = player.status.hunger;
    player.derived.fatigue = player.status.fatigue;

    console.log("✅ 计算结束，最终面板:", JSON.parse(JSON.stringify(player.derived)));
    console.groupEnd(); // 结束分组
}

// 暴露给全局
window.initGameDB = initGameDB;
window.recalcStats = recalcStats;
window.GAME_DB = GAME_DB;