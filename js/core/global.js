// 数据汇总：负责把上面零散的数据合并成 GAME_DB
console.log("加载 数据汇总");

/* 全局数据汇总 */
const GAME_DB = {
  items: [],
  enemies: [],
  levels: [
    "凡人",
    "炼气",
    "筑基",
    "金丹",
    "元婴",
    "化神",
    "渡劫",
    "大乘",
    "飞升",
  ],
  maps:[],
};

/**
 * 初始化数据库：将分散的数据合并到 GAME_DB
 * 在 window.onload 中调用
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

  itemSources.forEach((arr) => {
    GAME_DB.items = GAME_DB.items.concat(arr);
  });


// 2. 收集敌人数据
  if (typeof enemies !== 'undefined') GAME_DB.enemies = enemies;

  // 3. 收集地图数据
  if (typeof REGION_BOUNDS !== 'undefined') GAME_DB.maps.regions = REGION_BOUNDS;


  console.log(`[Core] 数据库初始化完成，加载物品 ${GAME_DB.items.length} 个。`);
}
