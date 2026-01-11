// 【启动层】初始化, 游戏主循环, 事件绑定
//console.log("加载 游戏初始化")

/* ================= 游戏主入口 ================= */

window.onload = function() {
  //console.log("[Main] 资源加载完毕，启动游戏...");

  if (typeof initGameDB === 'function') initGameDB();
  if (window.LogManager) window.LogManager.init();
  loadGame();
  checkSaveFile();
  bindMainMenuEvents();
};

/**
 * 检查存档并更新界面
 */
function checkSaveFile() {
  // 使用全局 SAVE_KEY
  const hasSave = localStorage.getItem(SAVE_KEY); //
  const startBtn = document.getElementById('menu_btn_start');

  if (startBtn) {
    if (hasSave) {
      startBtn.innerText = "继续道途";
      startBtn.dataset.action = "continue";
    } else {
      startBtn.innerText = "开启一世轮回";
      startBtn.dataset.action = "new";
    }
  }
}

/**
 * 绑定菜单按钮事件
 */
function bindMainMenuEvents() {
  const btnStart = document.getElementById('menu_btn_start');
  if (btnStart) {
    btnStart.onclick = function() {
      const action = this.dataset.action;

      if (action === "continue") {
        if (loadGame()) {
          enterGameScene();
          if(window.showToast) window.showToast("欢迎回来，道友。");
        } else {
          // 使用全局 SAVE_KEY
          if (!localStorage.getItem(SAVE_KEY)) { //
            checkSaveFile();
            if(window.showToast) window.showToast("存档丢失，请重新开始");
          }
        }
      } else {
        // 使用全局 SAVE_KEY
        if (localStorage.getItem(SAVE_KEY)) { //
          if (!confirm("检测到旧存档，开启新轮回将覆盖旧存档，是否继续？")) {
            return;
          }
        }

        if (startNewGame()) {
          enterGameScene();
          if(window.showToast) window.showToast("新一世轮回开启...");
        }
      }
    };
  }

  // --- 万物图鉴 按钮 ---
  const btnGallery = document.getElementById('menu_btn_gallery');
  if (btnGallery) {
    btnGallery.onclick = function() {
      if (typeof showGalleryModal === 'function') {
        showGalleryModal();
      } else {
        alert("图鉴模块尚未加载");
      }
    };
  }

  // --- 更新日志 按钮 ---
  const btnChangelog = document.getElementById('menu_btn_changelog');
  if (btnChangelog) {
    btnChangelog.onclick = function() {
      if (typeof showChangelogModal === 'function') {
        showChangelogModal();
      }
    };
  }
}

/**
 * 初始化新游戏数据
 * (修正版：动态读取地图信息)
 */
function startNewGame() {
  //console.log("正在构建新角色...");

  if (typeof PLAYER_TEMPLATE === 'undefined') {
    console.error("配置丢失：找不到 PLAYER_TEMPLATE");
    alert("游戏配置缺失，无法初始化。");
    return false;
  }

  // 1. 深拷贝模板
  const newPlayer = JSON.parse(JSON.stringify(PLAYER_TEMPLATE));

  // 2. 覆盖动态属性
  newPlayer.name = "无名道友";
  newPlayer.generation = 1;
  newPlayer.money = 100;
  newPlayer.worldSeed = Math.floor(Math.random() * 1000000);

  // 设定初始位置
  newPlayer.location = "t_xianyang"; // 默认咸阳

  // 3. 赋值给全局变量
  window.player = newPlayer;

  // 4. 立即保存
  saveGame();

  // 5. 立即刷新 UI
  if(window.updateUI) window.updateUI();

  // === 【动态日志逻辑】 ===
  if (window.LogManager) {
    window.LogManager.clear();

    // 1. 获取位置信息
    let locName = "未知之地";
    let locDesc = "一片混沌...";

    // 从 data_world.js 的 WORLD_TOWNS 数组中查找当前位置对象
    if (typeof WORLD_TOWNS !== 'undefined') {
      const startTown = WORLD_TOWNS.find(t => t.id === newPlayer.location);
      if (startTown) {
        locName = startTown.name;
        // 优先使用 flavor (风味描述)，如果没有则使用 desc
        locDesc = startTown.flavor || startTown.desc || "此地人杰地灵。";
      }
    }

    // 2. 动态生成欢迎语
    window.LogManager.add(`<span style="color:#b8860b; font-weight:bold;">轮回开启</span> 你出生于【${locName}】，${locDesc}`);
    window.LogManager.add("大道三千，祝道友早证混元。");
  }

    // 【新增】调用引导检查
    // 使用 setTimeout 稍微延迟一点，确保界面DOM已经渲染完毕
    setTimeout(function() {
        if (window.UITutorial) {
            window.UITutorial.checkAutoStart();
        }
    }, 500);

  return true;
}



// js/main.js - 添加在文件最末尾

// js/main.js 在文件最末尾添加

// 确保在页面加载后执行
window.addEventListener('load', function() {
    //console.log("========================================");
    //console.log(">>> [MAIN] 页面加载完成 (Window Loaded)");

    // 1. 检查 UISkill 是否存在
    if (window.UISkill) {
        //console.log(">>> [MAIN] 检测到 window.UISkill 存在 ✅");
    } else {
        console.error(">>> [MAIN] ❌ window.UISkill 不存在！请检查 index.html 是否引入了 ui_skill.js");
    }

    // 2. 尝试获取按钮
    const btnId = 'btn_open_gongfa';
    const btn = document.getElementById(btnId);

    if (btn) {
        //console.log(`>>> [MAIN] 找到按钮 ID: ${btnId} ✅`);

        // 3. 强制移除旧事件 (如果担心重复) 并绑定新事件
        btn.onclick = function() {
            //console.log(`>>> [CLICK] 你点击了功法按钮!`);

            if (window.UISkill) {
                //console.log(">>> [CLICK] 调用 UISkill.open()...");
                UISkill.open();
            } else {
                alert("错误：UISkill 模块未加载，请查看控制台报错");
            }
        };
        //console.log(`>>> [MAIN] 按钮 ${btnId} 点击事件绑定成功 ✅`);
    } else {
        console.error(`>>> [MAIN] ❌ 找不到按钮 ID: ${btnId}！请检查 HTML 中按钮的 id 属性是否写错了`);
    }
    //console.log("========================================");
});