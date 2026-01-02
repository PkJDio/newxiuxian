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
  // 定义兵解的具体执行逻辑
  const executeDie = function() {
    // 1. 计算下一世的世数
    const nextGen = (player && player.generation ? player.generation : 1) + 1;

    // 2. 使用模板构建新身体 (关键修复：防止缺失 lifeSkills 等新字段)
    let newPlayer;
    if (typeof PLAYER_TEMPLATE !== 'undefined') {
      // 深拷贝模板
      newPlayer = JSON.parse(JSON.stringify(PLAYER_TEMPLATE));
    } else {
      // 兜底：如果模板也没加载，就只能手写一个简易版
      console.error("兵解严重错误：找不到 PLAYER_TEMPLATE");
      newPlayer = { attr:{jing:10,qi:10,shen:10}, status:{hp:100,mp:100,hunger:100}, money:0, inventory:[] };
    }

    // 3. 继承关键数据
    newPlayer.generation = nextGen;
    newPlayer.name = "道友" + nextGen + "世"; // 自动改名
    newPlayer.location = "t_xianyang";        // 确保出生在咸阳
    newPlayer.worldSeed = Math.floor(Math.random() * 1000000); // 刷新世界随机数

    // 4. 覆盖全局对象
    window.player = newPlayer;

    // 5. 保存新档
    saveGame();

    // 6. 刷新界面
    if(window.updateUI) window.updateUI();

    // 7. 写入日志
    if (window.LogManager) {
      window.LogManager.clear();
      window.LogManager.add(`<span style="color:#d9534f; font-weight:bold; font-size:16px;">兵解轮回</span>`);
      window.LogManager.add(`你开启了第 <span style="color:#b8860b; font-weight:bold;">${nextGen}</span> 世轮回。`);
      window.LogManager.add("前尘往事如烟散，今朝再踏长生路。");
    }

    // 提示
    if(window.showToast) window.showToast("兵解成功，轮回开启");
  };

  // 调用警告弹窗
  if (window.showWarningModal) {
    window.showWarningModal(
      "兵解轮回",
      `
      <div style="text-align:center; padding:10px;">
         <p class="text_red" style="font-weight:bold; font-size:18px; margin-bottom:15px;">警告：肉身将毁，修为尽失！</p>
         <p style="color:#444; margin-bottom:5px;">此举将<b style="color:#d9534f">彻底重置</b>你的角色状态。</p>
         <p style="color:#666; font-size:13px;">仅保留【转世次数】与【世界设定】。</p>
         <br>
         <p style="font-weight:bold;">道友道心已决，确定要开启来世吗？</p>
      </div>
      `,
      executeDie // 传入回调函数
    );
  } else {
    // 兼容代码：如果 UI 模块没加载
    if(confirm("道友确定要兵解转世吗？")) {
      executeDie();
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
