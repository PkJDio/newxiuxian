// js/core/utils_add.js
// 资源获取工具类：统一处理物品、金钱、技能的获取与提示
// [Update] 增加了自动保存功能和调试日志

const UtilsAdd = {

  /**
   * 添加物品 (核心通用方法)
   * @param {String} itemId 物品ID
   * @param {Number} count 数量
   * @param {Boolean} showToast 是否显示提示 (默认显示)
   * @returns {Boolean} 是否添加成功
   */
  addItem: function(itemId, count = 1, showToast = true) {
    console.log(`[UtilsAdd] 尝试添加物品: ID=${itemId}, 数量=${count}`);

    // 1. 数据校验
    const db = window.GAME_DB || (typeof GAME_DB !== 'undefined' ? GAME_DB : null);
    if (!db || !db.items) {
      console.error("[UtilsAdd] 错误：物品数据库 (GAME_DB) 未找到！");
      return false;
    }

    const item = db.items.find(i => i.id === itemId);
    if (!item) {
      console.error(`[UtilsAdd] 错误：未找到ID为 ${itemId} 的物品数据！`);
      return false;
    }

    if (typeof player === 'undefined') {
      console.error("[UtilsAdd] 错误：player 对象未定义！");
      return false;
    }

    // 2. 执行添加逻辑
    let success = false;

    // 优先使用 UtilsItem (如果存在)
    if (window.UtilsItem && typeof window.UtilsItem.addItem === 'function') {
      success = window.UtilsItem.addItem(itemId, count);
      console.log("[UtilsAdd] 调用 UtilsItem.addItem 完成");
    } else {
      // 兜底逻辑：直接操作 inventory 数组
      if (!player.inventory) player.inventory = [];

      const existingSlot = player.inventory.find(slot => slot.id === itemId);
      if (existingSlot) {
        existingSlot.count += count;
        console.log(`[UtilsAdd] 物品堆叠增加，当前数量: ${existingSlot.count}`);
      } else {
        player.inventory.push({ id: itemId, count: count });
        console.log("[UtilsAdd] 新物品已推入背包数组");
      }
      success = true;

      // 刷新背包UI
      if(window.refreshBagUI) {
        window.refreshBagUI();
        console.log("[UtilsAdd] 背包UI已刷新");
      }
    }

    // 3. 处理反馈 & 保存
    if (success) {
      // A. 更新相关UI
      if(window.updateUI) window.updateUI();

      // B. 弹出提示
      if (showToast) {
        let color = '#333';
        const rarityConfig = window.RARITY_CONFIG || (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG : null);
        if (rarityConfig && item.rarity && rarityConfig[item.rarity]) {
          color = rarityConfig[item.rarity].color;
        }
        const msg = `获得：<span style="color:${color}">${item.name}</span> x${count}`;
        if(window.showToast) window.showToast(msg);
      }

      // C. 【关键】自动保存
      // 尝试调用 State.save() 或 saveGame()
      this._triggerAutoSave();

    } else {
      console.warn("[UtilsAdd] 添加物品失败 (可能是背包已满或其他原因)");
      if (showToast && window.showToast) window.showToast("背包已满，无法获取物品！");
    }

    return success;
  },

  /**
   * 添加金钱
   */
  addMoney: function(amount) {
    console.log(`[UtilsAdd] 尝试添加钱: ${amount}`);
    if (typeof player === 'undefined') return;

    player.money = (player.money || 0) + amount;

    if(window.updateUI) window.updateUI();

    if(window.showToast) {
      const unit = "";
      const op = amount >= 0 ? "+" : "";
      if(amount!=0){
          window.showToast(`钱财 ${unit} ${op}${amount} `);
      }

    }

    // 自动保存
    this._triggerAutoSave();
  },

  /**
   * 添加技能/功法
   */
  addSkill: function(skillId) {
    console.log(`[UtilsAdd] 尝试添加技能: ${skillId}`);
    if (typeof player === 'undefined') return;

    if (!player.skills) player.skills = {};

    if (player.skills[skillId]) {
      console.log("[UtilsAdd] 技能已存在，跳过");
      if(window.showToast) window.showToast("你已经学会了该技能，无需重复学习。");
      return;
    }

    const db = window.GAME_DB || {};
    // 尝试从 books 或 skills 查找名称
    let skillName = skillId;
    // 简单的查找逻辑，后续可完善
    if(db.items) {
      const book = db.items.find(i => i.id === skillId || (i.effects && i.effects.skillId === skillId));
      if(book) skillName = book.name;
    }

    player.skills[skillId] = {
      level: 0,
      exp: 0,
      mastered: false
    };
    console.log("[UtilsAdd] 技能已写入 player.skills");

    if(window.updateUI) window.updateUI();
    if(window.showToast) window.showToast(`领悟了新功法：<span style="color:#2b58a6">${skillName}</span>`);

    // 自动保存
    this._triggerAutoSave();
  },

  /**
   * 内部方法：触发自动保存
   */
  _triggerAutoSave: function() {
    console.log("[UtilsAdd] 准备执行自动保存...");

    // 尝试方案1: State.save() (推荐)
    if (typeof State !== 'undefined' && typeof State.save === 'function') {
      State.save();
      console.log("[UtilsAdd] 已调用 State.save() 保存游戏");
      return;
    }

    // 尝试方案2: saveGame() (全局函数)
    if (typeof saveGame === 'function') {
      saveGame();
      console.log("[UtilsAdd] 已调用 saveGame() 保存游戏");
      return;
    }

    // 尝试方案3: 简单的 localStorage 直接写入 (兜底)
    if (typeof player !== 'undefined' && typeof SAVE_KEY !== 'undefined') {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(player));
        console.log(`[UtilsAdd] 已直接写入 localStorage (Key: ${SAVE_KEY})`);
      } catch (e) {
        console.error("[UtilsAdd] 保存失败:", e);
      }
      return;
    }

    console.error("[UtilsAdd] 严重错误：未找到任何保存函数 (State.save 或 saveGame)，数据未持久化！");
  }
};

// 挂载到全局
window.UtilsAdd = UtilsAdd;
