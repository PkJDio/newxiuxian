// 全局核心：数据库, 属性计算, 常用常量
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
 * 逻辑：基础 -> 转世 -> 装备 -> 功法 -> Buff -> 转化
 */
function recalcStats() {
  if (!player) return;

  // 1. 初始化 derived (最终属性) 和 breakdown (数值构成详情)
  // 必须清零，否则会重复累加
  player.derived = {
    jing: 0, qi: 0, shen: 0,
    atk: 0, def: 0, speed: 0,
    hpMax: 0, mpMax: 0, hungerMax: 100,
    space: 20 // 基础背包空间
  };

  // 初始化统计详情 (用于悬浮窗显示：攻击由什么构成)
  player.statBreakdown = {};

  // --- 内部辅助函数：累加属性并记录来源 ---
  // key: 属性名 (如 'atk'), val: 数值, source: 来源名称 (如 '铁剑')
  const add = (key, val, source) => {
    if (!val || val === 0) return;

    // 确保 derived 中有这个字段
    if (player.derived[key] === undefined) player.derived[key] = 0;

    // 累加数值
    player.derived[key] += val;

    // 记录详情 (用于 Tooltip)
    if (!player.statBreakdown[key]) player.statBreakdown[key] = [];
    player.statBreakdown[key].push({ label: source, val: val });
  };

  // ================= A. 基础层 =================

  // 2. 基础属性 (player.attr)
  // 包含了：初始随机值 + 吃丹药/食物永久增加的值
  for (let k in player.attr) {
    add(k, player.attr[k], "基础属性");
  }

  // 3. 转世/参悟加成 (player.bonus_stats)
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

    // 5. 装备中的功法 (外功/内功)
    // 这里的 gongfa_ext 是数组，存储 itemID
    ['gongfa_ext', 'gongfa_int'].forEach(type => {
      const list = player.equipment[type];
      if (Array.isArray(list)) {
        list.forEach(skillId => {
          const skillItem = GAME_DB.items.find(i => i.id === skillId);
          // 如果需要根据等级计算加成，可以在这里读取 player.skills[skillId].level
          // 目前暂按书本基础数值计算
          if (skillItem && skillItem.effects) {
            for (let k in skillItem.effects) {
              // 过滤掉非属性字段
              if(k === 'max_skill_level' || k === 'map' || k === 'unlockRegion') continue;
              add(k, skillItem.effects[k], skillItem.name);
            }
          }
        });
      }
    });
  }

  // ================= C. 状态层 =================

  // 6. 临时 Buff (Buffs)
  // 假设 buff 结构: { name: "中毒", attr: "hpMax", val: -10 }
  if (player.buffs && Array.isArray(player.buffs)) {
    player.buffs.forEach(buff => {
      if (buff.attr && buff.val) {
        add(buff.attr, buff.val, buff.name);
      }
    });
  }

  // ================= D. 转化层 (精气神 -> 二级属性) =================

  // 7. 属性转化规则 (Xianxia 设定)
  // 获取当前已计算出的精气神总值
  const totalJing = player.derived.jing || 0;
  const totalQi   = player.derived.qi || 0;
  const totalShen = player.derived.shen || 0;

  // 转化公式：
  // 1 精 = 10 HP上限 + 0.5 防御
  add('hpMax', totalJing * 10, "精 转化 ");
  add('def',   Math.floor(totalJing * 0.5), "精 转化");

  // 1 气 = 5 MP上限
  add('mpMax', totalQi * 5, "气 转化");

  // 1 神 = 1 攻击 + 0.2 速度
  add('atk',   totalShen * 1, "神 转化");
  add('speed', Math.floor(totalShen * 0.2), "神 转化");

  // ================= E. 收尾 =================

  // 8. 状态修正 (防止当前血量超过新上限)
  if (player.status.hp > player.derived.hpMax) player.status.hp = player.derived.hpMax;
  if (player.status.mp > player.derived.mpMax) player.status.mp = player.derived.mpMax;
  // 饥饿度上限通常固定，但也可以被功法加成
  if (player.status.hunger > player.derived.hungerMax) player.status.hunger = player.derived.hungerMax;
}

// 暴露给全局
window.initGameDB = initGameDB;
window.recalcStats = recalcStats;
window.GAME_DB = GAME_DB;
