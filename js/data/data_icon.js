// js/data/data_icon.js
console.log("加载 图标配置");

const ITEM_ICONS = {
  // 默认类型图标
  default: "📦",

  // 物品类型映射
  material: "📦",      // 材料
  foodMaterial: "🥬",  // 食材
  food: "🍱",          // 料理
  weapon: "⚔️",         // 兵器
  head: "🧢",          // 头盔
  body: "🥋",          // 衣服
  feet: "👢",          // 鞋子
  book: "📘",          // 书籍
  pill: "💊",          // 丹药
  herb: "🌿",          // 草药
  tool: "🪓",          // 工具
  mount: "🐎",         // 坐骑
  fishing_rod: "🎣",   // 钓具

  // 特殊属性图标
  money: "💰",
  attack: "⚔️",
  defense: "🛡️",
  speed: "🦶",
  hp: "❤️",
  mp: "💧"
};

/**
 * 获取物品图标
 * @param {Object} item 物品数据对象
 */
function getItemIcon(item) {
  if (!item) return ITEM_ICONS.default;
  // 如果物品数据里单独配了 icon 字段，优先用那个
  if (item.icon) return item.icon;
  // 否则根据类型返回
  return ITEM_ICONS[item.type] || ITEM_ICONS.default;
}

// 导出到全局
window.ITEM_ICONS = ITEM_ICONS;
window.getItemIcon = getItemIcon;
