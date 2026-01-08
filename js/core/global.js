// js/core/global.js
// 全局核心：数据库, 属性计算, 常用常量
// 【修复】recalcStats: 调整计算顺序，支持百分比Buff，解决神光焕发不生效问题
console.log("加载 全局核心");

/* ================= 1. 游戏数据库 (GAME_DB) ================= */
const GAME_DB = {
    items: [],
    enemies: [],
    levels: ["凡人", "炼气", "筑基", "金丹", "元婴", "化神", "渡劫", "大乘", "飞升"],
    maps: []
};

/**
 * 初始化数据库：将分散的数据合并到 GAME_DB
 * 在 main.js 的 window.onload 中调用
 */
function initGameDB() {
    // 检查各数据文件是否存在，存在则合并
    const itemSources = [
        typeof materials !== "undefined" ? materials : [],
        typeof foodMaterial !== "undefined" ? foodMaterial : [],
        typeof foods !== "undefined" ? foods : [],
        typeof weapons !== "undefined" ? weapons : [],
        typeof head !== "undefined" ? head : [],
        typeof body !== "undefined" ? body : [],
        typeof feet !== "undefined" ? feet : [],
        typeof booksBody !== "undefined" ? booksBody : [],
        typeof booksKnowledge !== "undefined" ? booksKnowledge : [],
        typeof booksCultivation !== "undefined" ? booksCultivation : [],
        typeof pills !== "undefined" ? pills : [],
        typeof herbs !== "undefined" ? herbs : [],
        typeof tools !== "undefined" ? tools : [],
        typeof mounts !== "undefined" ? mounts : [],
        typeof fishingRods !== "undefined" ? fishingRods : [],
    ];

    GAME_DB.items = [];
    itemSources.forEach((arr) => {
        GAME_DB.items = GAME_DB.items.concat(arr);
    });

    // 收集敌人数据
    if (typeof enemies !== 'undefined') GAME_DB.enemies = enemies;

    // 收集地图数据
    if (typeof SUB_REGIONS !== 'undefined') GAME_DB.maps = SUB_REGIONS;

    console.log(`[Core] 数据库初始化完成，加载物品 ${GAME_DB.items.length} 个。`);
}


/* ================= 2. 核心属性计算系统 ================= */

/**
 * 重新计算玩家所有属性 (Derived Stats)
 * 逻辑：基础 -> 转世 -> 装备 -> 转化(精气神变攻防) -> Buff(百分比加成) -> 状态惩罚
 */
function recalcStats() {
    if (!player) return;

    // 1. 初始化 derived (最终属性)
    player.derived = {
        jing: 0, qi: 0, shen: 0,
        atk: 0, def: 0, speed: 0,
        hpMax: 0, mpMax: 0, hungerMax: 100,
        space: 200,
        fatigueMax: 100,
    };

    // 初始化统计详情
    player.statBreakdown = {};

    // --- 内部辅助函数：累加属性并记录来源 ---
    const add = (key, val, source, extra = null) => {
        if (val === 0) return;

        // 确保 derived 中有这个字段，没有则初始化
        if (player.derived[key] === undefined) player.derived[key] = 0;

        // 累加数值
        player.derived[key] += val;

        // 记录详情
        if (!player.statBreakdown[key]) player.statBreakdown[key] = [];
        let entry = { label: source, val: val };
        if (extra) Object.assign(entry, extra);
        player.statBreakdown[key].push(entry);
    };

    // ================= A. 基础数值层 =================
    // 2. 基础属性 (精/气/神)
    for (let k in player.attr) {
        add(k, player.attr[k], "基础属性");
    }

    // 3. 转世/参悟加成
    if (player.bonus_stats) {
        for (let k in player.bonus_stats) {
            add(k, player.bonus_stats[k], "转世参悟");
        }
    }

    // 永久加成
    if (player.exAttr) {
        for (let k in player.exAttr) {
            add(k, player.exAttr[k], "永久加成");
        }
    }

    // ================= B. 装备层 (扁平数值) =================
    // 4. 装备加成
    if (player.equipment) {
        const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'fishing_rod'];
        slots.forEach(slot => {
            const itemId = player.equipment[slot];
            if (itemId) {
                const item = GAME_DB.items.find(i => i.id === itemId);
                if (item && item.effects) {
                    for (let k in item.effects) {
                        add(k, item.effects[k], item.name);
                    }
                }
            }
        });

        // 5. 装备中的功法
        ['gongfa_ext', 'gongfa_int'].forEach(type => {
            const list = player.equipment[type];
            if (Array.isArray(list)) {
                list.forEach(skillId => {
                    if (!skillId) return;
                    if (window.UtilsSkill) {
                        const skillInfo = UtilsSkill.getSkillInfo(skillId);
                        if (skillInfo && skillInfo.finalEffects) {
                            for (let k in skillInfo.finalEffects) {
                                add(k, skillInfo.finalEffects[k], skillInfo.name);
                            }
                        }
                    } else {
                        // 兼容纯物品库模式
                        const item = GAME_DB.items.find(i => i.id === skillId);
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
    // 【重要】先进行转化，算出基础的HP/攻击/防御，这样后面的百分比Buff才有基数可以乘
    const totalJing = player.derived.jing || 0;
    const totalQi   = player.derived.qi || 0;
    const totalShen = player.derived.shen || 0;

    add('hpMax', totalJing * 10, "精 转化");
    add('def',   Math.floor(totalJing * 0.5), "精 转化");
    add('mpMax', totalQi * 5, "气 转化");
    add('atk',   totalShen * 1, "神 转化");
    add('speed', Math.floor(totalShen * 0.2), "神 转化");


    // ================= D. 状态层 (Buff 加成) =================
    // 【重要】移到转化层之后，并支持百分比
    if (player.buffs) {
        for (let buffId in player.buffs) {
            const buff = player.buffs[buffId];
            if (!buff || (buff.days !== undefined && buff.days <= 0)) continue; // 跳过过期

            let buffName = buff.name || "状态";

            // 1. 优先处理 effects 对象 (处理百分比加成)
            // 在 inn.js 中，神光焕发定义了 effects: { atkPct: 0.20 ... }
            if (buff.effects) {
                // 攻击百分比
                if (buff.effects.atkPct) {
                    const bonus = Math.floor(player.derived.atk * buff.effects.atkPct);
                    add('atk', bonus, buffName);
                }
                // 防御百分比
                if (buff.effects.defPct) {
                    const bonus = Math.floor(player.derived.def * buff.effects.defPct);
                    add('def', bonus, buffName);
                }
                // 速度百分比
                if (buff.effects.spdPct) {
                    const bonus = Math.floor(player.derived.speed * buff.effects.spdPct);
                    add('speed', bonus, buffName);
                }

                // 处理 effects 里的其他扁平数值 (如 atk: 10)
                for (let key in buff.effects) {
                    if (key.endsWith('Pct')) continue; // 跳过百分比字段
                    if (typeof buff.effects[key] === 'number') {
                        add(key, buff.effects[key], buffName);
                    }
                }
            }
            // 2. 兼容旧逻辑：简单的数值加成 (val 是数字)
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

    // 8. 状态修正 (Clamp)
    if (player.status.hp > player.derived.hpMax) player.status.hp = player.derived.hpMax;
    if (player.status.mp > player.derived.mpMax) player.status.mp = player.derived.mpMax;
    if (player.status.hunger > player.derived.hungerMax) player.status.hunger = player.derived.hungerMax;

    if (player.status.fatigue > player.derived.fatigueMax) player.status.fatigue = player.derived.fatigueMax;
    if (player.status.fatigue < 0) player.status.fatigue = 0;

    if (player.derived.speed < 1) player.derived.speed = 1;
    if (player.derived.atk < 1) player.derived.atk = 1;

    // 同步实时状态
    player.derived.hp = player.status.hp;
    player.derived.mp = player.status.mp;
    player.derived.hunger = player.status.hunger;
    player.derived.fatigue = player.status.fatigue;
}

// 暴露给全局
window.initGameDB = initGameDB;
window.recalcStats = recalcStats;
window.GAME_DB = GAME_DB;