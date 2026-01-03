// js/core/utils_item.js

console.log("加载 物品工具类");

const UtilsItem = {
  /**
   * 获取书籍的研读状态文本
   */
  getBookStatus: function(itemId) {
    if (player.skills && player.skills[itemId]) {
      return { text: "已学会", color: "#4caf50", isLearned: true };
    }
    const progress = (player.bookProgress && player.bookProgress[itemId]) || 0;
    if (progress > 0) {
      return { text: `研读中: ${progress}`, color: "#2196f3", isReading: true };
    }
    return { text: "未读", color: "#999", isUnread: true };
  },

  /**
   * 【修改】获取功法上限描述
   * 现在根据 data_config.js 里的 SKILL_CONFIG.levelNames 来获取
   */
  getSkillLimitName: function(level) {
    // 确保 SKILL_CONFIG 存在
    if (window.SKILL_CONFIG && window.SKILL_CONFIG.levelNames) {
      // 防止数组越界，如果找不到则显示 Lv.X
      return window.SKILL_CONFIG.levelNames[level] || `Lv.${level}`;
    }
    return `Lv.${level}`;
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
      case 'tool': return 'weapon'; // 工具通常装备在主手
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

    let consumed = true;

    // 书籍特殊处理
    if (item.type === 'book') {
      consumed = false;
      if (window.showToast) window.showToast(`请在主界面选择 [研读] 来阅读 ${item.name}`);
    }
    // 其他可消耗品（食物、丹药、材料等，只要配置了 param 或 buffs 都可以尝试使用）
    else if (['food', 'pill', 'foodMaterial', 'herb'].includes(item.type)) {
      if (window.showToast) window.showToast(`使用了 ${item.name}`);
      // 这里应该有具体的使用效果逻辑 (applyEffect)
    } else {
      if (window.showToast) window.showToast("该物品无法直接使用");
      consumed = false;
    }

    if (consumed) {
      itemSlot.count--;
      if (itemSlot.count <= 0) {
        player.inventory.splice(inventoryIndex, 1);
      }

      if (window.recalcStats) window.recalcStats();
      this._refreshAllUI();
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

    if (!player.equipment) player.equipment = {};

    const oldEquipId = player.equipment[slot];
    if (oldEquipId) {
      UtilsAdd.addItem(oldEquipId, 1);
    }

    player.equipment[slot] = item.id;

    itemSlot.count--;
    if (itemSlot.count <= 0) {
      player.inventory.splice(inventoryIndex, 1);
    }

    if (window.showToast) window.showToast(`装备了 ${item.name}`);

    if (window.recalcStats) {
      window.recalcStats();
    }
    this._refreshAllUI();
  },

  /**
   * 卸下装备
   */
  unequipItem: function(slotKey) {
    if (!player.equipment || !player.equipment[slotKey]) return;

    const itemId = player.equipment[slotKey];
    UtilsAdd.addItem(itemId, 1);
    player.equipment[slotKey] = null;

    // 注释掉弹窗
    // if (window.showToast) window.showToast(`卸下了装备`);

    if (window.recalcStats) {
      window.recalcStats();
    }
    this._refreshAllUI();
  },

  /**
   * 丢弃物品
   */
  discardItem: function(inventoryIndex) {
    if (!confirm("确定要丢弃该物品吗？")) return;
    player.inventory.splice(inventoryIndex, 1);
    this._refreshAllUI();
  },

  _refreshAllUI: function() {
    if (window.refreshBagUI) window.refreshBagUI();
    if (window.updateUI) window.updateUI();
  }
};

window.UtilsItem = UtilsItem;
