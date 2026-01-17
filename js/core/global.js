// js/core/global.js
// 全局核心：数据库, 属性计算, 常用常量
// 【调试版】recalcStats: 加入详细日志追踪属性来源

/* ================= 1. 游戏数据库 (GAME_DB) ================= */
// ... (GAME_DB 和 initGameDB 部分保持不变，此处省略以节省空间) ...
const GAME_DB = {
    items: [], enemies: [],all_enemies:[], levels: ["凡人", "炼气", "筑基", "金丹", "元婴", "化神", "渡劫", "大乘", "飞升"], maps: [], equipments: [], eatables: [], herbs: []
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
    const allEnemies = [ typeof enemies !== "undefined" ? enemies : [], typeof EVENT_RAID_ENEMIES !== "undefined" ? EVENT_RAID_ENEMIES : [] ];
    GAME_DB.all_enemies = [];allEnemies.forEach(arr => GAME_DB.all_enemies = GAME_DB.all_enemies.concat(arr));
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

    // 1. 初始化 derived (最终属性) - 包含所有拆分后的新字段
    player.derived = {
        // 基础三维
        jing: 0, qi: 0, shen: 0,

        // 核心战斗属性 (旧)
        atk: 0, def: 0, speed: 0,
        hpMax: 0, mpMax: 0,

        // 【新增】拆分属性
        phy_atk: 0, mag_atk: 0,       // 物理/法术攻击
        phy_def: 0, mag_def: 0,       // 物理/法术防御
        crit: 0, mag_crit: 0,         // 物理/法术暴击
        sharpness: 0, penetration: 0, // 锋利度/法透度

        // 生存与生活
        hungerMax: 200,   // 基础值：200
        fatigueMax: 100,  // 基础值：100
        space: 50,
    };

    // 初始化统计详情 (用于UI显示来源)
    player.statBreakdown = {};

    // --- 内部辅助函数：累加属性并记录来源 ---
    const add = (key, val, source, extra = null) => {
        if (val === undefined || val === null || val === 0) return; // 过滤无效值
        if (player.derived[key] === undefined) player.derived[key] = 0;

        player.derived[key] += val;

        if (!player.statBreakdown[key]) player.statBreakdown[key] = [];
        let entry = { label: source, val: val };
        if (extra) Object.assign(entry, extra);
        player.statBreakdown[key].push(entry);
    };

    // ================= A. 基础数值层 (精气神) =================
    console.log("--- A. 基础属性 ---");
    // 基础属性通常只有 jing, qi, shen
    for (let k in player.attr) {
        add(k, player.attr[k], "基础属性");
    }

    // 永久加成 (丹药等)
    if (player.exAttr) {
        for (let k in player.exAttr) {
            add(k, player.exAttr[k], "永久加成");
        }
    }

    // ================= B. 装备层 (核心修改：全属性累加) =================
    console.log("--- B. 装备加成 ---");
    if (player.equipment) {
        // 定义装备槽位
        const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'fishing_rod'];

        // 定义需要统计的所有属性字段
        const targetStats = [
            'phy_atk', 'mag_atk',
            'phy_def', 'mag_def',
            'crit', 'mag_crit',
            'speed',
            'sharpness', 'penetration',
            'hpMax', 'mpMax', // 装备直接加的血量/蓝量上限
            'jing', 'qi', 'shen' // 装备加的基础三维
        ];

        slots.forEach(slot => {
            const item = player.equipment[slot];
            if (item) {
                // 1. 处理直接属性 (如 item.sharpness) - 兼容旧数据
                if (item.sharpness) add('sharpness', item.sharpness, `装备-[${item.name}]`);

                // 2. 处理 effects 中的属性
                if (item.effects) {
                    // 遍历 effects，只处理我们关心的属性
                    for (let k in item.effects) {
                        let val = item.effects[k];

                        // 特殊映射：装备里的 hp_max 映射到 hpMax
                        let targetKey = k;
                        if (k === 'hp_max' || k === 'max_hp') targetKey = 'hpMax';
                        if (k === 'mp_max' || k === 'max_mp') targetKey = 'mpMax';

                        // 只有是数字且不为0才累加
                        if (typeof val === 'number' && val !== 0) {
                            add(targetKey, val, `装备-[${item.name}]`);
                        }
                    }
                }
            }
        });

        // 功法被动 (gongfa)
        // 保持你原有的逻辑，只是增加了对新属性的兼容
        const skillList = player.equipment['gongfa'];
        if (Array.isArray(skillList)) {
            skillList.forEach(skillId => {
                if (!skillId) return;
                // 尝试从 UtilsSkill 获取，或者直接从 books 获取
                let effects = null;
                let sourceName = "功法";

                if (window.UtilsSkill) {
                    const skillInfo = UtilsSkill.getSkillInfo(skillId);
                    if (skillInfo) {
                        effects = skillInfo.finalEffects;
                        sourceName = skillInfo.name;
                    }
                }
                if (!effects) { // 降级处理
                    const item = window.books ? books.find(i => i && i.id === skillId) : null;
                    if (item) {
                        effects = item.effects;
                        sourceName = item.name;
                    }
                }

                if (effects) {
                    for (let k in effects) {
                        let val = effects[k];
                        // 映射处理
                        let targetKey = k;
                        if (k === 'hp_max') targetKey = 'hpMax';

                        if (typeof val === 'number' && val !== 0) {
                            add(targetKey, val, `功法-[${sourceName}]`);
                        }
                    }
                }
            });
        }
    }

    // ================= B.2 参悟/轮回加成层 =================
    if (player.skills) {
        const masteryBonuses = {};
        for (let skillId in player.skills) {
            const skill = player.skills[skillId];
            if (skill.mastered && skill.attr && skill.value) {
                // 映射处理：参悟里的 hp 可能是指 hpMax
                let attrKey = skill.attr;
                if(attrKey === 'hp') attrKey = 'hpMax';

                if (!masteryBonuses[attrKey]) masteryBonuses[attrKey] = 0;
                masteryBonuses[attrKey] += skill.value;
            }
        }
        for (let attr in masteryBonuses) {
            add(attr, masteryBonuses[attr], "参悟加成");
        }
    }

    // ================= C. 转化层 (精气神 -> 二级属性) =================

    const totalJing = player.derived.jing || 0;
    const totalQi   = player.derived.qi || 0;
    const totalShen = player.derived.shen || 0;

    // 1. 生命上限: 精 * 10
    add('hpMax', totalJing * 10, "转化(精x10)");

    // 2. 灵力上限: 气 * 5
    add('mpMax', totalQi * 5, "转化(气x5)");

    // 3. 基础防御拆分
    // 物理防御：精 * 0.5 (肉体强度)
    const basePhyDef = Math.floor(totalJing * 0.5);
    add('phy_def', basePhyDef, "转化(精x0.5)");
    add('def', basePhyDef, "转化(精x0.5)"); // 兼容旧 def

    // 【修改】法术防御：气 * 0.5 (灵气护体)
    const baseMagDef = Math.floor(totalQi * 0.5);
    add('mag_def', baseMagDef, "转化(气x0.5)");

    // 4. 基础攻击拆分
    // 通用攻击基础：神 * 1 (神识引导)
    const baseAtk = totalShen * 1;
    add('atk', baseAtk, "转化(神x1)");
    add('phy_atk', baseAtk, "转化(神x1)");
    add('mag_atk', baseAtk, "转化(神x1)");

    // 【修改】法术攻击额外加成：气 * 1.0 (灵力总量加持)
    // 之前是0.2，现在改为1.0以匹配大后期数值体验
    const qiMagAtk = totalQi * 1;
    if (qiMagAtk > 0) {
        add('mag_atk', qiMagAtk, "转化(气x1.0)");
    }

    // 5. 速度: 神 * 0.2
    add('speed', Math.floor(totalShen * 0.2), "转化(神x0.2)");

    // 6. 背包与生存上限
    add('space', totalJing * 1, "转化(精x1)");
    add('hungerMax', totalJing * 5, "转化(精x5)");
    add('fatigueMax', totalJing * 2, "转化(精x2)");


    // ================= D. 状态层 (Buff 加成) =================
    if (player.buffs) {
        for (let buffId in player.buffs) {
            const buff = player.buffs[buffId];
            if (!buff || (buff.days !== undefined && buff.days <= 0)) continue;

            let buffName = buff.name || "状态";

            // 百分比加成处理
            if (buff.effects) {
                // 攻击百分比 - 同时影响 phy_atk 和 mag_atk
                if (buff.effects.atkPct) {
                    const pct = buff.effects.atkPct;
                    const pVal = Math.floor(player.derived.phy_atk * pct);
                    const mVal = Math.floor(player.derived.mag_atk * pct);
                    add('phy_atk', pVal, `${buffName}(${Math.round(pct*100)}%)`);
                    add('mag_atk', mVal, `${buffName}(${Math.round(pct*100)}%)`);
                    add('atk', Math.floor(player.derived.atk * pct), `${buffName}`); // 兼容旧逻辑
                }
                // 防御百分比
                if (buff.effects.defPct) {
                    const pct = buff.effects.defPct;
                    const pVal = Math.floor(player.derived.phy_def * pct);
                    const mVal = Math.floor(player.derived.mag_def * pct);
                    add('phy_def', pVal, `${buffName}(${Math.round(pct*100)}%)`);
                    add('mag_def', mVal, `${buffName}(${Math.round(pct*100)}%)`);
                    add('def', Math.floor(player.derived.def * pct), `${buffName}`);
                }
                // 速度百分比
                if (buff.effects.spdPct) {
                    const val = Math.floor(player.derived.speed * buff.effects.spdPct);
                    add('speed', val, `${buffName}(${Math.round(buff.effects.spdPct*100)}%)`);
                }

                // 固定数值处理
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

    // ================= D.2 状态自动维护 =================
    if (player.status && player.status.hunger > 30) {
        if (player.buffs && player.buffs['debuff_hunger']) {
            delete player.buffs['debuff_hunger'];
        }
    }

    // ================= E. 状态惩罚 (疲劳/饥饿) =================
    // 这里的惩罚需要同时作用于 拆分后的属性
    let efficiency = 1.0;
    const hasFatigue = player.buffs && player.buffs['debuff_fatigue'];
    const hasHunger = player.buffs && player.buffs['debuff_hunger'];

    if (hasFatigue) efficiency *= 0.5;
    if (hasHunger) efficiency *= 0.5;

    if (efficiency < 1.0) {
        const lossRatio = 1.0 - efficiency;
        const keysToNerf = ['atk', 'def', 'speed', 'phy_atk', 'mag_atk', 'phy_def', 'mag_def'];

        keysToNerf.forEach(key => {
            const currentVal = player.derived[key] || 0;
            const lostVal = Math.floor(currentVal * lossRatio);
            if (lostVal > 0) {
                add(key, -lostVal, "身体状态(虚弱)");
            }
        });
    }

    // ================= F. 收尾与保底 =================
    // 确保血量不超过上限
    if (player.status.hp > player.derived.hpMax) player.status.hp = player.derived.hpMax;
    if (player.status.mp > player.derived.mpMax) player.status.mp = player.derived.mpMax;

    if (player.status.hunger > player.derived.hungerMax) player.status.hunger = player.derived.hungerMax;
    if (player.status.fatigue > player.derived.fatigueMax) player.status.fatigue = player.derived.fatigueMax;
    if (player.status.fatigue < 0) player.status.fatigue = 0;

    // 属性保底 1
    // if (player.derived.speed < 1) player.derived.speed = 1;
    // if (player.derived.atk < 1) player.derived.atk = 1;
    // if (player.derived.phy_atk < 1) player.derived.phy_atk = 1;
    // if (player.derived.mag_atk < 1) player.derived.mag_atk = 1;

    // 同步 status 到 derived 方便 UI 读取当前值
    player.derived.hp = player.status.hp;
    player.derived.mp = player.status.mp;
    player.derived.hunger = player.status.hunger;
    player.derived.fatigue = player.status.fatigue;

    console.groupEnd();
}

// 暴露给全局
window.initGameDB = initGameDB;
window.recalcStats = recalcStats;
window.GAME_DB = GAME_DB;