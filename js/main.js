// 【启动层】初始化, 游戏主循环, 事件绑定
console.log("加载 游戏初始化")

/* ================= 游戏主入口 ================= */

window.onload = function() {
  console.log("[Main] 资源加载完毕，启动游戏...");

  // 1. 初始化核心系统
  if (typeof initGameDB === 'function') initGameDB();
  if (window.LogManager) window.LogManager.init();

  // 2. 检查存档状态，更新按钮文字
  checkSaveFile();

  // 3. 绑定主菜单按钮事件
  bindMainMenuEvents();
};

/**
 * 检查存档并更新界面
 */
function checkSaveFile() {
  const hasSave = localStorage.getItem('xiuxian_save_v3');
  const startBtn = document.getElementById('menu_btn_start');

  if (startBtn) {
    if (hasSave) {
      startBtn.innerText = "继续道途";
      // 标记一下，点击时知道是读档
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
  // --- 开始/继续 按钮 ---
  const btnStart = document.getElementById('menu_btn_start');
  if (btnStart) {
    btnStart.onclick = function() {
      const action = this.dataset.action;

      if (action === "continue") {
        // 读档
        if (loadGame()) {
          enterGameScene();
          window.showToast("欢迎回来，道友。");
        } else {
          alert("存档读取失败，可能已损坏！");
        }
      } else {
        // 新游戏
        // 如果已有存档，提示确认
        if (localStorage.getItem('xiuxian_save_v3')) {
          if (!confirm("检测到旧存档，开启新轮回将覆盖旧存档，是否继续？")) {
            return;
          }
        }

        if (startNewGame()) {
          enterGameScene();
          window.showToast("新一世轮回开启...");
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
