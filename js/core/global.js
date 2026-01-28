// js/core/global.js
// 全局核心：数据库, 属性计算, 常用常量
// 【调试增强版】recalcStats: 包含详细的分组日志追踪

/* ================= 1. 游戏数据库 (GAME_DB) ================= */
const GAME_DB = {
    items: [], enemies: [], all_enemies: [], levels: ["凡人", "炼气", "筑基", "金丹", "元婴", "化神", "渡劫", "大乘", "飞升"], maps: [], equipments: [], eatables: [], herbs: []
};

function initGameDB() {
    console.groupCollapsed("📦 [系统] 初始化游戏数据库 (initGameDB)");

    const checkSource = (name, val) => {
        const count = typeof val !== "undefined" ? val.length : 0;
        console.log(`   > 加载资源 [${name}]: ${count} 个条目`);
        return typeof val !== "undefined" ? val : [];
    };

    const itemSources = [
        checkSource('materials', typeof materials !== "undefined" ? materials : undefined),
        checkSource('foodMaterial', typeof foodMaterial !== "undefined" ? foodMaterial : undefined),
        checkSource('foods', typeof foods !== "undefined" ? foods : undefined),
        checkSource('fishes', typeof fishes !== "undefined" ? fishes : undefined),
        checkSource('weapons', typeof weapons !== "undefined" ? weapons : undefined),
        checkSource('head', typeof head !== "undefined" ? head : undefined),
        checkSource('body', typeof body !== "undefined" ? body : undefined),
        checkSource('feet', typeof feet !== "undefined" ? feet : undefined),
        checkSource('books', typeof books !== "undefined" ? books : undefined),
        checkSource('pills', typeof pills !== "undefined" ? pills : undefined),
        checkSource('herbs', typeof herbs !== "undefined" ? herbs : undefined),
        checkSource('mounts', typeof mounts !== "undefined" ? mounts : undefined),
        checkSource('fishingRods', typeof fishingRods !== "undefined" ? fishingRods : undefined),
        checkSource('spiritItems', typeof spiritItems !== "undefined" ? spiritItems : undefined)
    ];

    GAME_DB.items = [];
    itemSources.forEach(arr => GAME_DB.items = GAME_DB.items.concat(arr));
    console.log(`✅ Items 总数: ${GAME_DB.items.length}`);

    const equipItemSources = [
        typeof weapons !== "undefined" ? weapons : [],
        typeof head !== "undefined" ? head : [],
        typeof body !== "undefined" ? body : [],
        typeof feet !== "undefined" ? feet : [],
        typeof fishingRods !== "undefined" ? fishingRods : []
    ];
    GAME_DB.equipments = [];
    equipItemSources.forEach(arr => GAME_DB.equipments = GAME_DB.equipments.concat(arr));
    console.log(`✅ Equipments 总数: ${GAME_DB.equipments.length}`);

    const eatItemSources = [ typeof foodMaterial !== "undefined" ? foodMaterial : [], typeof foods !== "undefined" ? foods : [], typeof fishes !== "undefined" ? fishes : [] ];
    GAME_DB.eatables = [];
    eatItemSources.forEach(arr => GAME_DB.eatables = GAME_DB.eatables.concat(arr));

    const herbItemSources = [ typeof herbs !== "undefined" ? herbs : [], typeof pills !== "undefined" ? pills : [] ];
    GAME_DB.herbs = [];
    herbItemSources.forEach(arr => GAME_DB.herbs = GAME_DB.herbs.concat(arr));

    if (typeof enemies !== 'undefined') GAME_DB.enemies = enemies;
    const allEnemies = [ typeof enemies !== "undefined" ? enemies : [], typeof EVENT_RAID_ENEMIES !== "undefined" ? EVENT_RAID_ENEMIES : [] ];
    GAME_DB.all_enemies = []; allEnemies.forEach(arr => GAME_DB.all_enemies = GAME_DB.all_enemies.concat(arr));
    console.log(`✅ Enemies 总数: ${GAME_DB.all_enemies.length}`);

    if (typeof SUB_REGIONS !== 'undefined') GAME_DB.maps = SUB_REGIONS;

    console.groupEnd();
}

/* ================= 2. 核心属性计算系统 ================= */

/**
 * 重新计算玩家所有属性 (Derived Stats)
 * 逻辑：基础 -> 转世 -> 装备 -> 转化(精气神变攻防) -> Buff(百分比加成) -> 状态惩罚
 */
/**
 * 重新计算玩家所有属性 (Derived Stats)
 * 逻辑：基础 -> 转世 -> 装备 -> 转化(精气神变攻防) -> Buff(百分比加成) -> 状态惩罚
 */
function recalcStats() {
    if (!player) {
        return;
    }


    // 1. 初始化 derived (最终属性)
    player.derived = {
        jing: 0, qi: 0, shen: 0,
        atk: 0, def: 0, speed: 0,
        hpMax: 0, mpMax: 0,
        phy_atk: 0, mag_atk: 0,
        phy_def: 0, mag_def: 0,
        crit: 0, mag_crit: 0,
        sharpness: 0, penetration: 0,
        hungerMax: 200,
        fatigueMax: 100,
        space: 50,
    };

    // 初始化统计详情
    player.statBreakdown = {};

    // --- 内部辅助函数：累加属性并记录来源 ---
    const add = (key, val, source, extra = null) => {
        if (val === undefined || val === null || val === 0) return;
        if (player.derived[key] === undefined) player.derived[key] = 0;

        const oldVal = player.derived[key];
        player.derived[key] += val;

        // 详细日志：打印每一笔加成

        if (!player.statBreakdown[key]) player.statBreakdown[key] = [];
        let entry = { label: source, val: val };
        if (extra) Object.assign(entry, extra);
        player.statBreakdown[key].push(entry);
    };

    // ================= A. 基础数值层 (精气神) =================
    for (let k in player.attr) {
        add(k, player.attr[k], "基础属性");
    }
    if (player.exAttr) {
        for (let k in player.exAttr) {
            add(k, player.exAttr[k], "永久加成");
        }
    }

    // ================= B. 装备层 (包含强化属性) =================
    if (player.equipment) {
        const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'fishing_rod'];

        slots.forEach(slot => {
            const item = player.equipment[slot];
            if (item) {

                // 1. 基础属性 (Effects)
                if (item.effects) {
                    for (let k in item.effects) {
                        let val = item.effects[k];
                        let targetKey = k;
                        // 映射修正
                        if (k === 'hp_max' || k === 'max_hp') targetKey = 'hpMax';
                        if (k === 'mp_max' || k === 'max_mp') targetKey = 'mpMax';

                        if (typeof val === 'number' && val !== 0) {
                            add(targetKey, val, `装备-[${item.name}]`);
                        }
                    }
                }

                // 2. 特殊固定属性 (如锐气)
                if (item.sharpness) add('sharpness', item.sharpness, `装备-[${item.name}]`);

                // 3. 【新增】强化属性 (Reinforcement Stats)
                // 武器强化：物理/法术攻击
                if (item.exPhyAtk) {
                    add('phy_atk', item.exPhyAtk, `强化-[${item.name} +${item.level||0}]`);
                    add('atk', item.exPhyAtk, `强化-[${item.name} +${item.level||0}]`); // 同步增加面板总攻击
                }
                if (item.exMagAtk) {
                    add('mag_atk', item.exMagAtk, `强化-[${item.name} +${item.level||0}]`);
                }

                // 防具强化：物理/法术防御
                if (item.exPhyDef) {
                    add('phy_def', item.exPhyDef, `强化-[${item.name} +${item.level||0}]`);
                    add('def', item.exPhyDef, `强化-[${item.name} +${item.level||0}]`); // 同步增加面板总防御
                }
                if (item.exMagDef) {
                    add('mag_def', item.exMagDef, `强化-[${item.name} +${item.level||0}]`);
                }

            }
        });

        // 功法被动
        const skillList = player.equipment['gongfa'];
        if (Array.isArray(skillList) && skillList.length > 0) {
            skillList.forEach(skillId => {
                if (!skillId) return;
                let effects = null;
                let sourceName = "功法";

                if (typeof UtilsSkill !== 'undefined') {
                    const skillInfo = UtilsSkill.getSkillInfo(skillId);
                    if (skillInfo) {
                        effects = skillInfo.finalEffects;
                        sourceName = skillInfo.name;
                    }
                }
                if (!effects) {
                    const item = typeof books !== 'undefined' ? books.find(i => i && i.id === skillId) : null;
                    if (item) {
                        effects = item.effects;
                        sourceName = item.name;
                    }
                }

                if (effects) {
                    for (let k in effects) {
                        let val = effects[k];
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
        let hasMastery = false;
        for (let skillId in player.skills) {
            const skill = player.skills[skillId];
            if (skill.mastered && skill.attr && skill.value) {
                let attrKey = skill.attr;
                if(attrKey === 'hp') attrKey = 'hpMax';
                if (!masteryBonuses[attrKey]) masteryBonuses[attrKey] = 0;
                masteryBonuses[attrKey] += skill.value;
                hasMastery = true;
            }
        }
        if(hasMastery) {
            for (let attr in masteryBonuses) {
                add(attr, masteryBonuses[attr], "参悟加成");
            }
        }
    }

    // ================= C. 转化层 (精气神 -> 二级属性) =================
    const totalJing = player.derived.jing || 0;
    const totalQi   = player.derived.qi || 0;
    const totalShen = player.derived.shen || 0;

    // 1. 生命上限: 精 * 10
    add('hpMax', totalJing * 10, `转化(精${totalJing}x10)`);

    // 2. 法力上限: 气 * 5
    add('mpMax', totalQi * 5, `转化(气${totalQi}x5)`);

    // 3. 基础防御拆分
    const basePhyDef = Math.floor(totalJing * 0.5);
    add('phy_def', basePhyDef, `转化(精${totalJing}x0.5)`);
    add('def', basePhyDef, "转化(精x0.5)");

    // 法术防御
    const baseMagDef = Math.floor(totalQi * 0.5);
    add('mag_def', baseMagDef, `转化(气${totalQi}x0.5)`);

    // 4. 基础攻击拆分
    const baseAtk = totalShen * 1;
    add('atk', baseAtk, `转化(神${totalShen}x1)`);
    add('phy_atk', baseAtk, `转化(神${totalShen}x1)`);
    add('mag_atk', baseAtk, `转化(神${totalShen}x1)`);

    // 法术攻击额外加成
    const qiMagAtk = totalQi * 1;
    if (qiMagAtk > 0) {
        add('mag_atk', qiMagAtk, `转化(气${totalQi}x1.0)`);
    }

    // 5. 速度
    add('speed', Math.floor(totalShen * 0.2), `转化(神${totalShen}x0.2)`);

    // 6. 背包与生存
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
                // 攻击百分比
                if (buff.effects.atkPct) {
                    const pct = buff.effects.atkPct;
                    const pVal = Math.floor(player.derived.phy_atk * pct);
                    const mVal = Math.floor(player.derived.mag_atk * pct);
                    add('phy_atk', pVal, `${buffName}(${Math.round(pct*100)}%)`);
                    add('mag_atk', mVal, `${buffName}(${Math.round(pct*100)}%)`);
                    add('atk', Math.floor(player.derived.atk * pct), `${buffName}`);
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

                // 固定数值
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
    let efficiency = 1.0;
    const hasFatigue = player.buffs && player.buffs['debuff_fatigue'];
    const hasHunger = player.buffs && player.buffs['debuff_hunger'];

    if (hasFatigue) { efficiency *= 0.5; }
    if (hasHunger) { efficiency *= 0.5; }

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

    // 同步 status 到 derived 方便 UI 读取当前值
    player.derived.hp = player.status.hp;
    player.derived.mp = player.status.mp;
    player.derived.hunger = player.status.hunger;
    player.derived.fatigue = player.status.fatigue;

    // 在此处刷新境界 UI
    if (typeof updateProfileLevelUI === 'function') {
        updateProfileLevelUI();
    }

}

/**
 * 更新主界面左上角的境界与进度显示
 */
function updateProfileLevelUI() {
    const el = document.getElementById('profile_level');
    if (!el || !window.player || !window.DATA_MORTAL) return;

    const rank = player.mortal_rank || 0;
    const ranksConfig = window.DATA_MORTAL.RANKS;
    const currentConfig = ranksConfig[rank] || { name: "未知", maxExp: 100 };

    let displayStr = "";

    // 1. 如果处于瓶颈状态，显示 "(瓶颈)"
    if (player.is_bottleneck) {
        displayStr = `${currentConfig.name} <span style="color:#ff5252;">(瓶颈)</span>`;
    }
    // 2. 如果正在进行突破试炼，显示任务进度 (可选，或者保持显示经验满额)
    else if (player.mortal_task) {
        displayStr = `${currentConfig.name} (突破中)`;
    }
    // 3. 正常模式显示 经验/上限
    else {
        const curExp = Math.floor(player.mortal_exp || 0);
        const maxExp = currentConfig.maxExp;
        displayStr = `${currentConfig.name} (${curExp}/${maxExp})`;
    }

    el.innerHTML = displayStr;
}

// 暴露给全局
window.initGameDB = initGameDB;
window.recalcStats = recalcStats;
window.GAME_DB = GAME_DB;