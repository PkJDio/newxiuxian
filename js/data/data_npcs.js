// NPC数据：特殊NPC, 随机库, 姓氏名字
//console.log("加载 NPC数据")

/* ================= 0. 核心辅助函数 (新增) ================= */
// 必须先定义这些工具，下面的生成逻辑才能调用

/**
 * 获取基于种子的随机数 (0~1)
 * 包装 utils.js 里的 window.getSeededRandom
 */
function getWorldGenRandom(key) {
  if (window.getSeededRandom) {
    // 使用 "npc" 作为命名空间，避免与其他系统冲突
    return window.getSeededRandom("npc_gen", key);
  }
  // 如果工具箱未加载的兜底方案
  return Math.random();
}

/**
 * 从数组中随机选取一项 (基于种子)
 */
function getFixedRandomItem(arr, key) {
  if (!arr || arr.length === 0) return null;
  const r = getWorldGenRandom(key);
  return arr[Math.floor(r * arr.length)];
}

/* ================= 1. 特殊历史人物 (Unique NPCs) ================= */
/* 秦始皇37年背景：始皇东巡途中，蒙恬驻守北疆，扶苏监军，赵高李斯随行 */
const specialNpcs = [
  {
    id: "npc_unique_001",
    name: "秦始皇",
    originId: "t_xianyang",
    desc: "大秦始皇帝，正在进行最后一次东巡。",
    avatar: "👑",
    level: 99,
    hasShop: false,
    shopTypes: [],
    isDead: false,
    favorability: 0,
    speed: 30, // 龙辇速度
    // 模拟东巡路线：咸阳 -> 湖北 -> 湖南 -> 浙江 -> 江苏 -> 山东 -> 河北 -> 咸阳
    path: ["t_xianyang", "t_wuguan", "t_yunmeng", "t_kuaiji", "t_langya", "t_zhoushan", "t_langya", "t_julu", "t_xianyang"],
    isLoop: true,
    runtime: { x: 450, y: 450, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_002",
    name: "李斯",
    originId: "t_xianyang",
    desc: "大秦丞相，随侍御驾。",
    avatar: "📜",
    level: 85,
    hasShop: true,
    shopTypes: ["book"],
    isDead: false,
    favorability: 0,
    speed: 30,
    path: ["t_xianyang", "t_wuguan", "t_yunmeng", "t_kuaiji", "t_langya", "t_zhoushan", "t_langya", "t_julu", "t_xianyang"],
    isLoop: true,
    runtime: { x: 450, y: 450, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_003",
    name: "蒙恬",
    originId: "t_jiuyuan",
    desc: "中华第一勇士，镇守北疆，修筑长城。",
    avatar: "🛡️",
    level: 95,
    hasShop: true,
    shopTypes: ["weapon", "armor"],
    isDead: false,
    favorability: 0,
    speed: 40,
    path: ["t_jiuyuan", "t_yunzhong", "t_yanmen", "t_shuozhou", "t_jiuyuan"], // 北疆巡逻
    isLoop: true,
    runtime: { x: 450, y: 750, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_004",
    name: "扶苏",
    originId: "t_jiuyuan",
    desc: "公子扶苏，刚毅勇武，监军上郡。",
    avatar: "🤴",
    level: 80,
    hasShop: false,
    shopTypes: [],
    isDead: false,
    favorability: 0,
    speed: 25,
    path: ["t_jiuyuan", "t_shuozhou", "t_jiuyuan"],
    isLoop: true,
    runtime: { x: 450, y: 750, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_005",
    name: "赵高",
    originId: "t_xianyang",
    desc: "中车府令，掌管罗网，阴鸷狠毒。",
    avatar: "😈",
    level: 70,
    hasShop: true,
    shopTypes: ["material"], // 卖毒药材料
    isDead: false,
    favorability: 0,
    speed: 30,
    path: ["t_xianyang", "t_wuguan", "t_yunmeng", "t_kuaiji", "t_langya", "t_zhoushan", "t_langya", "t_julu", "t_xianyang"],
    isLoop: true,
    runtime: { x: 450, y: 450, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_006",
    name: "徐福",
    originId: "t_langya",
    desc: "奉命出海寻仙，满载童男童女。",
    avatar: "🔮",
    level: 60,
    hasShop: true,
    shopTypes: ["pill", "material"],
    isDead: false,
    favorability: 0,
    speed: 20,
    path: ["t_langya", "t_penglai_v", "t_zhoushan", "t_penglai", "t_langya"],
    isLoop: true,
    runtime: { x: 850, y: 380, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_007",
    name: "项羽",
    originId: "t_kuaiji",
    desc: "籍长八尺余，力能扛鼎，寓居吴中。",
    avatar: "🐅",
    level: 92,
    hasShop: false,
    shopTypes: [],
    isDead: false,
    favorability: 0,
    speed: 35,
    path: ["t_kuaiji", "t_wu", "t_yuhang", "t_kuaiji"],
    isLoop: true,
    runtime: { x: 750, y: 150, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_008",
    name: "刘邦",
    originId: "t_dingtao",
    desc: "此时还是沛县泗水亭长，游手好闲。",
    avatar: "🐉",
    level: 55,
    hasShop: false,
    shopTypes: [],
    isDead: false,
    favorability: 0,
    speed: 20,
    path: ["t_dingtao", "t_puyang", "t_dingtao"],
    isLoop: true,
    runtime: { x: 650, y: 450, targetIndex: 1, state: "moving" }
  },
  {
    id: "npc_unique_009",
    name: "冒顿单于",
    originId: "t_longcheng",
    desc: "匈奴新主，鸣镝弑父，野心勃勃。",
    avatar: "🐺",
    level: 90,
    hasShop: false,
    shopTypes: [],
    isDead: false,
    favorability: 0,
    speed: 45,
    path: ["t_longcheng", "t_zuoxian", "t_youxian", "t_mobei", "t_longcheng"],
    isLoop: true,
    runtime: { x: 150, y: 750, targetIndex: 1, state: "moving" }
  }
];

/* ================= 2. 自动生成逻辑 (Auto Generation) ================= */

// 定义临水城镇ID列表 (用于生成鱼贩)
const waterTownIds = new Set([
  't_langya', 't_jimo', 't_salt', 't_fish_east', 't_penglai_v', 't_sanghai', // 齐鲁海滨
  't_jiangzhou', 't_dujiang', 't_fuling', 't_wushan', // 巴蜀江河
  't_jiangling', 't_chibi', 't_xiangyin', 't_dongting', 't_yiling', 't_yunmeng', // 荆楚云梦泽/长江
  't_kuaiji', 't_wu', 't_yuzhang', 't_penglai', 't_yuhang', 't_nanhai', 't_zhoushan', // 东南沿海
  't_yalu', 't_jiezhi' // 辽东水域
]);

// 姓氏库 (秦汉常见姓)
const surnames = ["赵", "李", "王", "蒙", "章", "白", "司马", "公孙", "赢", "熊", "田", "项", "屈", "景", "昭"];
// 名字库
const givenNames = ["通", "劫", "平", "信", "广", "何", "成", "咎", "婴", "布", "离", "昧", "且", "喜"];

// 辅助函数：生成NPC数据
function generateLocalNpcs() {
  const generatedNpcs = [];

  // 确保地图数据已加载
  if (typeof WORLD_TOWNS === 'undefined') {
    console.error("NPC生成失败：WORLD_TOWNS 未定义");
    return [];
  }

  // 遍历所有地图节点
  WORLD_TOWNS.forEach(town => {
    const { id, name, level, x, y } = town;

    // 1. 生成官员
    if (id !== 't_xianyang') {
      // === 使用新的稳定随机函数 ===
      // 传入唯一的 Key，确保这个城的官员永远是这个人
      const surname = getFixedRandomItem(surnames, id + "_gov_surname");
      const givenName = getFixedRandomItem(givenNames, id + "_gov_name");

      let officialTitle = "";
      let officialLevel = 0;
      let officialAvatar = "";
      let officialDesc = "";
      let shopTypes = [];

      if (level === 'city') {
        officialTitle = `郡守·${surname}${givenName}`;
        officialLevel = 70;
        officialAvatar = "👺";
        officialDesc = `掌管${name}的最高行政长官，威严庄重。`;
        shopTypes = ["book"];
      } else if (level === 'town') {
        officialTitle = `县令·${surname}${givenName}`;
        officialLevel = 45;
        officialAvatar = "🎓";
        officialDesc = `负责${name}治安与税收的父母官。`;
        shopTypes = ["book", "material"];
      } else {
        officialTitle = `里正·${surname}${givenName}`;
        officialLevel = 25;
        officialAvatar = "👴";
        officialDesc = `${name}德高望重的长者，负责调解邻里纠纷。`;
        shopTypes = ["food", "material"];
      }

      generatedNpcs.push({
        id: `npc_gov_${id}`,
        name: officialTitle,
        originId: id,
        desc: officialDesc,
        avatar: officialAvatar,
        level: officialLevel,
        hasShop: shopTypes.length > 0,
        shopTypes: shopTypes,
        isDead: false,
        favorability: 0,
        speed: 10,
        path: [id, id],
        isLoop: true,
        runtime: { x: x, y: y, targetIndex: 0, state: "moving" }
      });
    }

    // 2. 生成鱼贩 (不需要随机名，保持不变)
    if (waterTownIds.has(id)) {
      generatedNpcs.push({
        id: `npc_fish_${id}`,
        name: `${name}鱼贩`,
        originId: id,
        desc: `在${name}水边讨生活的渔夫，浑身鱼腥味。`,
        avatar: "🎣",
        level: 20,
        hasShop: true,
        shopTypes: ["food", "fishing_rod"],
        isDead: false,
        favorability: 0,
        speed: 15,
        path: [id, id],
        isLoop: true,
        runtime: { x: x, y: y, targetIndex: 0, state: "moving" }
      });
    }

    // 3. 生成游商/路人
    // === 使用新的稳定随机函数获取概率 ===
    const wanderChance = getWorldGenRandom(id + "_wander_chance");

    if (wanderChance > 0.6) {
      const wanderTypes = [
        { n: "游方郎中", a: "💊", s: ["pill"], d: "悬壶济世，铃医四方。" },
        { n: "行脚商", a: "📦", s: ["material", "food"], d: "挑着担子，走南闯北。" },
        { n: "秦军更卒", a: "⚔️", s: [], d: "服役的士兵，正在换防途中。" }
      ];

      // === 随机选择类型 ===
      const type = getFixedRandomItem(wanderTypes, id + "_wander_type");

      generatedNpcs.push({
        id: `npc_wander_${id}`,
        name: type.n,
        originId: id,
        desc: type.d,
        avatar: type.a,
        level: 30,
        hasShop: type.s.length > 0,
        shopTypes: type.s,
        isDead: false,
        favorability: 0,
        speed: 20,
        path: [id, 't_xianyang', id],
        isLoop: true,
        runtime: { x: x, y: y, targetIndex: 0, state: "moving" }
      });
    }
  });

  return generatedNpcs;
}

// 合并所有 NPC
const npc = [
  ...specialNpcs,
  ...generateLocalNpcs()
];

// 如果你需要在控制台查看生成了多少个NPC，可以取消注释下面这行
//console.log(`Total NPCs generated: ${npc.length}`);
