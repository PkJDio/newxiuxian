// 存档管理：player对象, globalMeta, save/load
console.log("加载 存档管理")

/* ================= 状态与存档管理 ================= */

// 全局玩家对象
var player = null;

// 游戏状态管理：存档、读档、重置


/**
 * 保存游戏
 */
function saveGame() {
  if (!player) return;

  try {
    // 直接使用全局的 SAVE_KEY
    const dataStr = JSON.stringify(player);
    localStorage.setItem(SAVE_KEY, dataStr); //

    if (window.LogManager) {
      window.LogManager.add("<span class='text_green'>存档成功！道心已固。</span>");
    } else {
      if(window.showToast) window.showToast("存档成功");
    }
    console.log("游戏已保存");
  } catch (e) {
    console.error("存档失败", e);
    alert("存档失败，空间不足或权限受限");
  }
}

/**
 * 读取游戏
 */
function loadGame() {
  try {
    // 直接使用全局的 SAVE_KEY
    const dataStr = localStorage.getItem(SAVE_KEY); //

    if (!dataStr) return false;

    const data = JSON.parse(dataStr);

    if (!data || typeof data !== 'object') {
      throw new Error("存档数据格式错误");
    }

    window.player = data;
    console.log("读取存档成功");
    return true;

  } catch (e) {
    console.error("读取存档失败（坏档）:", e);

    // 直接使用全局的 SAVE_KEY
    localStorage.removeItem(SAVE_KEY); //
    window.player = null;

    if (window.showWarningModal) {
      window.showWarningModal(
        "天地大劫 (存档损坏)",
        `
            <div style="text-align:center">
                <p class="text_red" style="font-weight:bold; font-size:18px;">检测到存档数据异常</p>
                <p style="color:#666; margin-top:10px;">可能是由于天道法则变动导致旧数据不兼容。</p>
                <br>
                <p>为了重塑世界，必须<b>清除旧档并重置</b>。</p>
            </div>
            `,
        function() {
          window.location.reload();
        }
      );
    } else {
      alert("存档已损坏，系统将自动重置。");
      window.location.reload();
    }

    return false;
  }
}


/**
 * 兵解 (重置/转世)
 * 保留部分属性（如转世次数），重置其他属性
 */
function attemptDie() {
  // 1. 确认弹窗
  const confirmed = confirm("道友确定要兵解转世吗？\n兵解后将保留【世数】，重置修为与肉身。");

  if (confirmed) {
    // 2. 继承数据
    const currentGen = (player.generation || 1) + 1;

    // 3. 重置 player 数据
    // 手动重置核心字段
    player.name = "道友" + currentGen + "世";
    player.generation = currentGen;
    player.age = 16;
    player.status.hp = 100;
    player.status.mp = 50;
    player.status.hunger = 100;
    player.attr.jing = 10;
    player.attr.qi = 10;
    player.attr.shen = 10;
    player.money = 0;
    player.location = "t_newbie_village"; // 确保这里是有效的 ID

    // 清空 Buff
    player.buffs = [];

    // 4. 保存新状态 (覆盖旧档)
    saveGame();

    // 5. 刷新界面并提示
    // 兵解不需要重载页面，直接刷新UI即可
    if(window.updateUI) window.updateUI();
    if(window.enterGameScene) window.enterGameScene();

    if (window.LogManager) {
      window.LogManager.clear();
      window.LogManager.add(`兵解成功！你开启了第 ${currentGen} 世轮回。`);
    }
  }
}

/**
 * 返回主页
 */
function backToMenu() {
  // 可选：切回主页时自动保存
  // saveGame();

  const game = document.getElementById('scene_game');
  const menu = document.getElementById('scene_menu');

  if (game && menu) {
    game.classList.remove('active');
    menu.classList.add('active');
  }
}

// 将函数暴露给全局 window
window.saveGame = saveGame;
window.loadGame = loadGame;
window.attemptDie = attemptDie;
window.backToMenu = backToMenu;
