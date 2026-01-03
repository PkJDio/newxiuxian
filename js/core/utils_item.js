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

    /* ================= 批量操作逻辑 (新增) ================= */

    /**
     * 整理背包
     * 排序规则：类型 > 品质(稀有度) > 价值 > ID
     */
    sortInventory: function() {
        if (!player.inventory || player.inventory.length === 0) {
            if(window.showToast) window.showToast("行囊空空如也");
            return;
        }

        // 类型权重表 (数字越小排越前)
        const typeOrder = {
            'weapon': 10, 'head': 11, 'body': 12, 'feet': 13, 'mount': 14, 'fishing_rod': 15, 'tool': 16, // 装备
            'pill': 20, 'food': 21, 'book': 22, 'herb': 23, // 消耗品
            'material': 30, 'foodMaterial': 31 // 材料
        };

        player.inventory.sort((a, b) => {
            const itemA = GAME_DB.items.find(i => i.id === a.id);
            const itemB = GAME_DB.items.find(i => i.id === b.id);

            if (!itemA || !itemB) return 0;

            // 1. 类型排序
            const tA = typeOrder[itemA.type] || 99;
            const tB = typeOrder[itemB.type] || 99;
            if (tA !== tB) return tA - tB;

            // 2. 稀有度排序 (从高到低)
            if (itemA.rarity !== itemB.rarity) return itemB.rarity - itemA.rarity;

            // 3. 价值排序 (从高到低)
            const pA = itemA.value || itemA.price || 0;
            const pB = itemB.value || itemB.price || 0;
            if (pA !== pB) return pB - pA;

            // 4. ID 排序
            return itemA.id.localeCompare(itemB.id);
        });

        if(window.showToast) window.showToast("行囊已整备完毕");
        this._refreshAllUI();
    },

    /**
     * 批量丢弃指定稀有度及以下的物品
     * @param {Number} maxRarity 最大稀有度 (包含)，例如 1 代表只丢弃凡品
     */
    discardByRarity: function(maxRarity) {
        if (!player.inventory) return;

        let initialCount = player.inventory.length;

        // 过滤掉符合条件的物品
        // filter 返回的是“保留”的物品，所以条件要反着写
        player.inventory = player.inventory.filter(slot => {
            const item = GAME_DB.items.find(i => i.id === slot.id);
            if (!item) return false; // 坏数据直接丢弃

            // 如果物品稀有度 <= 指定标准，且不是贵重物品(价值>0未必贵重，这里主要看品级)，则丢弃
            // 这里简单粗暴一点：只要品级低就丢
            if (item.rarity <= maxRarity) {
                return false; // 丢弃
            }
            return true; // 保留
        });

        let discardedCount = initialCount - player.inventory.length;

        if (discardedCount > 0) {
            if(window.showToast) window.showToast(`已清理 ${discardedCount} 件低品杂物`);
            this._refreshAllUI();
        } else {
            if(window.showToast) window.showToast("没有符合条件的杂物");
        }
    },
    /**
     * 【新增】根据索引列表批量丢弃物品
     * @param {Set|Array} indices 要丢弃的背包索引列表
     */
    discardMultipleItems: function(indices) {
        if (!player.inventory) return;

        // 转换为 Set 方便查找
        const indexSet = new Set(indices);
        if (indexSet.size === 0) return;

        const initialCount = player.inventory.length;

        // 过滤掉在 indexSet 中的物品 (保留不在其中的)
        // 注意：filter 的 index 参数是当前遍历的索引
        player.inventory = player.inventory.filter((_, index) => !indexSet.has(index));

        const deletedCount = initialCount - player.inventory.length;

        if (deletedCount > 0) {
            if(window.showToast) window.showToast(`已批量丢弃 ${deletedCount} 样物品`);
            this._refreshAllUI();
        }
    },

  _refreshAllUI: function() {
    if (window.refreshBagUI) window.refreshBagUI();
    if (window.updateUI) window.updateUI();
  }
};

window.UtilsItem = UtilsItem;
