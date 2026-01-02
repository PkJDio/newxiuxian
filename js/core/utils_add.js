// js/utils_add.js
// 资源获取工具类：统一处理物品、金钱、技能的获取与提示

const UtilsAdd = {

  /**
   * 添加物品 (核心通用方法)
   * @param {String} itemId 物品ID
   * @param {Number} count 数量
   * @param {Boolean} showToast 是否显示提示 (默认显示)
   * @returns {Boolean} 是否添加成功
   */
  addItem: function(itemId, count = 1, showToast = true) {
    // 1. 数据校验
    const db = window.GAME_DB || (typeof GAME_DB !== 'undefined' ? GAME_DB : null);
    if (!db || !db.items) {
      console.error("[UtilsAdd] 物品数据库未找到");
      return false;
    }

    const item = db.items.find(i => i.id === itemId);
    if (!item) {
      console.error(`[UtilsAdd] 未找到ID为 ${itemId} 的物品`);
      return false;
    }

    if (typeof player === 'undefined') return false;

    // 2. 执行添加逻辑
    // 如果有 UtilsItem.addItem 则优先使用 (它可能包含背包容量检查等复杂逻辑)
    let success = false;
    if (window.UtilsItem && typeof window.UtilsItem.addItem === 'function') {
      success = window.UtilsItem.addItem(itemId, count);
    } else {
      // 兜底逻辑：直接推入数组
      if (!player.inventory) player.inventory = [];

      // 检查是否可堆叠 (简单假设都可堆叠，或者根据 inventory 查找)
      const existingSlot = player.inventory.find(slot => slot.id === itemId);
      if (existingSlot) {
        existingSlot.count += count;
      } else {
        player.inventory.push({ id: itemId, count: count });
      }
      success = true;

      // 刷新背包UI
      if(window.refreshBagUI) window.refreshBagUI();
    }

    // 3. 处理反馈 (UI更新与提示)
    if (success) {
      // 更新可能受影响的UI (比如负重)
      if(window.updateUI) window.updateUI();

      if (showToast) {
        // 获取稀有度颜色
        let color = '#333';
        const rarityConfig = window.RARITY_CONFIG || (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG : null);

        if (rarityConfig && item.rarity && rarityConfig[item.rarity]) {
          color = rarityConfig[item.rarity].color;
        }

        // 弹出提示
        const msg = `获得：<span style="color:${color}">${item.name}</span> x${count}`;
        if(window.showToast) window.showToast(msg);
      }
    } else {
      if (showToast && window.showToast) window.showToast("背包已满，无法获取物品！");
    }

    return success;
  },

  /**
   * 添加金钱 (灵石)
   * @param {Number} amount 数量
   */
  addMoney: function(amount) {
    if (typeof player === 'undefined') return;

    player.money = (player.money || 0) + amount;

    // 更新 UI
    if(window.updateUI) window.updateUI();

    // 提示
    if(window.showToast) {
      const unit = "灵石"; // 后续可改为配置
      const op = amount >= 0 ? "+" : "";
      window.showToast(`${unit} ${op}${amount}`);
    }
  },

  /**
   * 添加技能/功法
   * @param {String} skillId 技能ID
   */
  addSkill: function(skillId) {
    if (typeof player === 'undefined') return;

    // 1. 检查是否已学会
    if (!player.skills) player.skills = {};

    if (player.skills[skillId]) {
      if(window.showToast) window.showToast("你已经学会了该技能，无需重复学习。");
      return;
    }

    // 2. 查找技能数据 (假设在 GAME_DB.skills 里，目前可能还没这个数据，先做个防御性编程)
    const db = window.GAME_DB || {};
    const skillData = db.skills ? db.skills.find(s => s.id === skillId) : { name: "未知技能" };
    const skillName = skillData ? skillData.name : skillId;

    // 3. 添加技能
    player.skills[skillId] = {
      level: 0,
      exp: 0,
      mastered: false
    };

    // 4. 反馈
    if(window.updateUI) window.updateUI();
    if(window.showToast) window.showToast(`领悟了新功法：<span style="color:#2b58a6">${skillName}</span>`);
  }
};

// 挂载到全局
window.UtilsAdd = UtilsAdd;
