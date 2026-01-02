// js/core/utils_item.js
console.log("加载 物品工具类");

/* ================= 境界/等级 映射 ================= */
const SKILL_REALMS = {
  1: "入门",
  2: "熟练",
  3: "精通",
  4: "小成",
  5: "大成",
  6: "圆满",
  7: "化境",
  8: "返璞归真",
  9: "天道",
  10: "大道"
};

const UtilsItem = {
  /**
   * 获取书籍的研读状态文本
   */
  getBookStatus: function(itemId) {
    // 1. 检查是否已学会（在 player.skills 里）
    if (player.skills && player.skills[itemId]) {
      return { text: "已学会", color: "#4caf50", isLearned: true }; // 绿色
    }

    // 2. 检查研读进度 (在 player.bookProgress 里，假设结构为 { itemId: currentExp })
    // 这里我们需要知道书籍的总经验需求，假设在 itemData.requireExp
    const progress = (player.bookProgress && player.bookProgress[itemId]) || 0;

    if (progress > 0) {
      // 如果你有总经验数据，可以算百分比，这里暂时直接显示数值
      return { text: `研读中: ${progress}`, color: "#2196f3", isReading: true }; // 蓝色
    }

    return { text: "未读", color: "#999", isUnread: true }; // 灰色
  },

  /**
   * 获取功法上限描述 (例如：上限 入门)
   */
  getSkillLimitName: function(level) {
    return SKILL_REALMS[level] || `Lv.${level}`;
  },

  /**
   * 获取装备对应的插槽名称
   */
  getEquipSlot: function(itemType) {
    switch (itemType) {
      case 'weapon': return 'weapon';
      case 'head': return 'head';
      case 'body': return 'body';
      case 'feet': return 'feet';
      case 'mount': return 'mount';
      case 'fishing_rod': return 'fishing_rod';
      case 'tool': return 'weapon'; // 工具默认装备在主手（兵器栏），或者你可以加个 tool 栏
      default: return null;
    }
  },

  /* ================= 动作逻辑 ================= */

  /**
   * 使用物品
   */
  useItem: function(inventoryIndex) {
    const itemSlot = player.inventory[inventoryIndex];
    if (!itemSlot) return;

    const item = GAME_DB.items.find(i => i.id === itemSlot.id);
    if (!item) return;

    console.log(`使用物品: ${item.name}`);

    // --- 简单的效果处理示例 ---
    let consumed = true;

    if (item.type === 'food' || item.type === 'pill') {
      // 加属性逻辑... (参考之前的 doEat)
      if (window.showToast) window.showToast(`服用了 ${item.name}`);
      // 这里应该调用具体的属性增加函数
      // applyItemEffect(item);
    } else if (item.type === 'book') {
      // 书籍使用逻辑：增加研读进度 or 只有在研读按钮点击时才算？
      // 通常书籍是“研读”而不是“吃掉”，所以可能不消耗，或者消耗精力
      consumed = false;
      if (window.showToast) window.showToast(`请在主界面选择 [研读] 来阅读 ${item.name}`);
    } else {
      if (window.showToast) window.showToast("该物品无法直接使用");
      consumed = false;
    }

    // 扣除数量
    if (consumed) {
      itemSlot.count--;
      if (itemSlot.count <= 0) {
        player.inventory.splice(inventoryIndex, 1);
      }
      // 刷新UI
      if (window.refreshBagUI) window.refreshBagUI();
      if (window.updateUI) window.updateUI();
    }
  },

  /**
   * 装备物品
   */
  equipItem: function(inventoryIndex) {
    const itemSlot = player.inventory[inventoryIndex];
    const item = GAME_DB.items.find(i => i.id === itemSlot.id);
    if (!item) return;

    const slot = this.getEquipSlot(item.type);
    if (!slot) {
      if (window.showToast) window.showToast("此物品无法装备");
      return;
    }

    // 初始化装备栏
    if (!player.equipment) player.equipment = {};

    // 1. 取下旧装备 (如果有)
    const oldEquipId = player.equipment[slot];
    if (oldEquipId) {
      // 放回背包
      Utils.addToInventory(oldEquipId, 1);
    }

    // 2. 穿上新装备
    player.equipment[slot] = item.id;

    // 3. 从背包移除 1 个
    itemSlot.count--;
    if (itemSlot.count <= 0) {
      player.inventory.splice(inventoryIndex, 1);
    }

    if (window.showToast) window.showToast(`装备了 ${item.name}`);

    // 刷新
    if (window.refreshBagUI) window.refreshBagUI();
    if (window.updateUI) window.updateUI(); // 重新计算属性
  },

  /**
   * 卸下装备
   */
  unequipItem: function(slotKey) {
    if (!player.equipment || !player.equipment[slotKey]) return;

    const itemId = player.equipment[slotKey];

    // 放回背包
    Utils.addToInventory(itemId, 1);

    // 清空插槽
    player.equipment[slotKey] = null;

    if (window.showToast) window.showToast(`卸下了装备`);

    // 刷新
    if (window.refreshBagUI) window.refreshBagUI();
    if (window.updateUI) window.updateUI();
  },

  /**
   * 丢弃物品
   */
  discardItem: function(inventoryIndex) {
    if (!confirm("确定要丢弃该物品吗？")) return;
    player.inventory.splice(inventoryIndex, 1);
    if (window.refreshBagUI) window.refreshBagUI();
  }
};

window.UtilsItem = UtilsItem;
