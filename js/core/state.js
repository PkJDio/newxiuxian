// 存档管理：player对象, globalMeta, save/load
console.log("加载 存档管理")

/* ================= 状态与存档管理 ================= */

// 全局玩家对象
var player = null;

// 保存游戏到本地
function saveGame() {
  if (!player) return;
  try {
    // 记录保存时间
    player.lastSaveTime = new Date().getTime();
    localStorage.setItem('xiuxian_save_v3', JSON.stringify(player));
    console.log("[State] 游戏已保存");
    // 如果有提示框功能，可以弹个提示
    if(window.showToast) window.showToast("存档已保存");
  } catch (e) {
    console.error("保存失败:", e);
    alert("存档空间不足，保存失败！");
  }
}

// 从本地读取游戏
function loadGame() {
  const data = localStorage.getItem('xiuxian_save_v3');
  if (data) {
    try {
      player = JSON.parse(data);
      console.log("[State] 读取存档成功:", player.name);
      return true;
    } catch (e) {
      console.error("存档损坏:", e);
      return false;
    }
  }
  return false;
}

// 开启新游戏 (点击“开启一世轮回”时调用)
function startNewGame() {
  console.log("[State] 初始化新角色...");

  // 1. 深拷贝模板 (依赖 data_config.js 中的 PLAYER_TEMPLATE)
  if (typeof PLAYER_TEMPLATE === 'undefined') {
    alert("错误：配置文件丢失 (PLAYER_TEMPLATE)");
    return false;
  }

  player = JSON.parse(JSON.stringify(PLAYER_TEMPLATE));

  // 2. 生成随机属性 (暂时简写)
  player.name = "道友" + Math.floor(Math.random() * 10000);
  player.worldSeed = Math.floor(Math.random() * 99999999);

  // 3. 初始保存
  saveGame();
  return true;
}

// 删除存档 (可选功能)
function deleteSave() {
  localStorage.removeItem('xiuxian_save_v3');
  location.reload();
}
