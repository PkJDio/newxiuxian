// js/core/global.js
// 全局核心：数据库, 属性计算, 常用常量
// 【更新】recalcStats 支持记录 Buff 持续时间
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
    if (typeof REGION_BOUNDS !== 'undefined') GAME_DB.maps = REGION_BOUNDS; // 注意这里是直接赋值

    console.log(`[Core] 数据库初始化完成，加载物品 ${GAME_DB.items.length} 个。`);
}


/* ================= 2. 核心属性计算系统 ================= */

/**
 * 重新计算玩家所有属性 (Derived Stats)
 * 逻辑：基础 -> 转世 -> 装备 -> 功法 -> Buff -> 转化 -> 【惩罚扣减】 -> 收尾
 */
function recalcStats() {
    if (!player) return;

    // 1. 初始化 derived (最终属性) 和 breakdown (数值构成详情)
    player.derived = {
        jing: 0, qi: 0, shen: 0,
        atk: 0, def: 0, speed: 0,
        hpMax: 0, mpMax: 0, hungerMax: 100,
        space: 200,
        fatigueMax: 100, // 疲劳上限
    };

    // 初始化统计详情
    player.statBreakdown = {};

    // --- 内部辅助函数：累加属性并记录来源 ---
    // 支持传入负数（用于扣减属性）
    const add = (key, val, source, extra = null) => {
        if (val === 0) return; // 0不处理，但允许负数

        // 确保 derived 中有这个字段
        if (player.derived[key] === undefined) player.derived[key] = 0;

        // 累加数值 (如果是负数，这里自然就是减法)
        player.derived[key] += val;

        // 记录详情
        if (!player.statBreakdown[key]) player.statBreakdown[key] = [];

        let entry = { label: source, val: val };
        if (extra) Object.assign(entry, extra);
        player.statBreakdown[key].push(entry);
    };

    // ================= A. 基础层 =================
    // 2. 基础属性
    for (let k in player.attr) {
        add(k, player.attr[k], "基础属性");
    }

    // 3. 转世/参悟加成
    if (player.bonus_stats) {
        for (let k in player.bonus_stats) {
            add(k, player.bonus_stats[k], "转世参悟");
        }
    }

    // ================= B. 装备层 =================
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

    // ================= C. 状态层 (加成类) =================
    // 6. 临时 Buff (增加属性的Buff)
    if (player.buffs) {
        for (let buffId in player.buffs) {
            const buff = player.buffs[buffId];
            if (buff.days > 0 && buff.attr && buff.val && typeof buff.val === 'number') { // 确保 val 是数字
                let buffName = buff.name || "状态";
                if (buffName === "状态") {
                    const srcItem = GAME_DB.items.find(i => i.id === buffId);
                    if (srcItem) buffName = srcItem.name;
                }
                add(buff.attr, buff.val, buffName, { days: buff.days });
            }
        }
    }

    if (player.exAttr) {
        for (let k in player.exAttr) {
            add(k, player.exAttr[k], "永久加成");
        }
    }

    // ================= D. 转化层 (精气神 -> 二级属性) =================
    // 7. 属性转化规则
    const totalJing = player.derived.jing || 0;
    const totalQi   = player.derived.qi || 0;
    const totalShen = player.derived.shen || 0;

    add('hpMax', totalJing * 10, "精 转化 ");
    add('def',   Math.floor(totalJing * 0.5), "精 转化");
    add('mpMax', totalQi * 5, "气 转化");
    add('atk',   totalShen * 1, "神 转化");
    add('speed', Math.floor(totalShen * 0.2), "神 转化");


    // ================= E. 状态惩罚 (疲劳/饥饿) 【新增部分】 =================
    // 在计算完所有增加项后，最后进行乘法惩罚
    // 我们通过计算出“损失值”，以负数的形式 add 进去
    // 这样 UI 上就会显示： 攻击力 100 ...  身体状态 -50 = 最终 50

    let efficiency = 1.0;

    // 检查是否有 Debuff (根据我们在 time.js 里定义的 ID)
    const hasFatigue = player.buffs && player.buffs['debuff_fatigue'];
    const hasHunger = player.buffs && player.buffs['debuff_hunger'];

    // 叠加乘法效率
    if (hasFatigue) efficiency *= 0.5;
    if (hasHunger) efficiency *= 0.5;

    // 如果效率小于 100%，则计算并应用扣除
    if (efficiency < 1.0) {
        // 计算损失比例 (例如 efficiency 0.25, lossRatio 就是 0.75)
        const lossRatio = 1.0 - efficiency;

        // 获取当前已累计的属性值
        const currentAtk = player.derived.atk || 0;
        const currentDef = player.derived.def || 0;
        const currentSpeed = player.derived.speed || 0;

        // 计算损失的具体数值 (向下取整)
        // 使用负数传入 add 函数
        const lostAtk = Math.floor(currentAtk * lossRatio);
        const lostDef = Math.floor(currentDef * lossRatio);
        const lostSpeed = Math.floor(currentSpeed * lossRatio);

        // 如果数值大于0，则添加一条负数记录
        // 来源显示为 "身体状态" 或 "虚弱"
        if (lostAtk > 0) add('atk', -lostAtk, "身体状态(虚弱)");
        if (lostDef > 0) add('def', -lostDef, "身体状态(虚弱)");
        if (lostSpeed > 0) add('speed', -lostSpeed, "身体状态(虚弱)");
    }

    // ================= F. 收尾 =================

    // 8. 状态修正 (Clamp)
    // 确保当前值不超过上限
    if (player.status.hp > player.derived.hpMax) player.status.hp = player.derived.hpMax;
    if (player.status.mp > player.derived.mpMax) player.status.mp = player.derived.mpMax;
    if (player.status.hunger > player.derived.hungerMax) player.status.hunger = player.derived.hungerMax;

    // 疲劳值逻辑：不锁最大值(允许溢出触发Debuff)，但不能小于0
    if (player.status.fatigue > player.derived.fatigueMax) player.status.fatigue = player.derived.fatigueMax;
    if (player.status.fatigue < 0) player.status.fatigue = 0;

    // 兜底：防止速度被扣成0导致无法移动
    if (player.derived.speed < 1) player.derived.speed = 1;
    if (player.derived.atk < 1) player.derived.atk = 1;
}

// 暴露给全局
window.initGameDB = initGameDB;
window.recalcStats = recalcStats;
window.GAME_DB = GAME_DB;