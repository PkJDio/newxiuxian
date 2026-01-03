// js/utils_debug.js
// 调试与作弊工具模块 (逻辑层简化版)

const UtilsDebug = {
  /**
   * 打开“天道”控制台 (调试弹窗)
   */
  openTiandaoPanel: function() {
    // 检查全局映射表
    const types = window.TYPE_MAPPING || (typeof TYPE_MAPPING !== 'undefined' ? TYPE_MAPPING : null);

    if (!types) {
      if(window.showToast) window.showToast("错误：未找到 TYPE_MAPPING 定义");
      return;
    }

    const options = [];

    // 1. 遍历 TYPE_MAPPING 生成物品按钮
    for (const [typeKey, typeName] of Object.entries(types)) {
      options.push({
        text: `✨ 赐予：随机${typeName} (1个)`,
        autoClose: false, // 方便连续点击
        onClick: () => {
          this._cheatAddRandomItem(typeKey);
        }
      });
    }

    // 2. 特殊功能按钮
    options.push({
      text: "💰 赐予：一万 文",
      style: "ink_btn_danger",
      autoClose: false,
      onClick: () => {
        // 调用新的通用工具
        if(window.UtilsAdd) {
          window.UtilsAdd.addMoney(10000);
        }
      }
    });

    // 3. 显示弹窗
    if (window.showSelectionModal) {
      window.showSelectionModal("天道 · 万物生成", options, () => {
        if(window.closeModal) window.closeModal();
      });
    } else {
      console.error("showSelectionModal 未定义");
    }
  },

  /**
   * 内部逻辑：随机选取一个物品ID，然后调用 UtilsAdd 添加
   */
  _cheatAddRandomItem: function(type) {
    // 1. 获取物品库
    const db = window.GAME_DB || (typeof GAME_DB !== 'undefined' ? GAME_DB : null);
    if (!db || !db.items) {
      if(window.showToast) window.showToast("数据库未加载");
      return;
    }

    // 2. 筛选
    const candidates = db.items.filter(item => item.type === type);
    if (candidates.length === 0) {
      if(window.showToast) window.showToast(`暂无 [${type}] 类型的数据`);
      return;
    }

    // 3. 随机
    const randomItem = candidates[Math.floor(Math.random() * candidates.length)];

    // 4. 【核心】调用通用添加模块
    if (window.UtilsAdd) {
      // 参数：ID, 数量, 是否显示Toast(默认true)
      window.UtilsAdd.addItem(randomItem.id, 1);
    } else {
      console.error("UtilsAdd 未加载");
    }
  }
};

// 挂载到全局
window.openTiandao = function() {
  UtilsDebug.openTiandaoPanel();
};

console.log("utils_debug.js 加载完毕 (已接入 UtilsAdd)");
