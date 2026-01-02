// 【启动层】初始化, 游戏主循环, 事件绑定
console.log("加载 游戏初始化")

/* ================= 游戏主入口 ================= */

window.onload = function() {
  console.log("[Main] 资源加载完毕，启动游戏...");

  if (typeof initGameDB === 'function') initGameDB();
  if (window.LogManager) window.LogManager.init();

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
 * (之前缺失的方法，现在补上)
 */
function startNewGame() {
  console.log("正在构建新角色...");

  // 初始化全新的 player 对象
  window.player = {
    name: "无名道友",
    generation: 1,
    age: 16,
    money: 100,

    // 初始位置：使用秦代咸阳作为新手村
    location: "t_xianyang",

    // 基础属性 (精气神)
    attr: {
      jing: 10,
      qi: 10,
      shen: 10
    },

    // 动态状态
    status: {
      hp: 100,
      mp: 50,
      hunger: 100
    },

    // 衍生属性 (updateUI 会计算具体数值，这里给个初始值防止报错)
    derived: {
      hpMax: 100,
      mpMax: 50,
      atk: 5,
      def: 1,
      speed: 10
    },

    // 系统数据
    inventory: [],    // 背包
    skills: {},       // 技能
    buffs: [],        // 状态
    learnedRecipes: [], // 配方

    // 世界记录
    dayCount: 1,
    worldSeed: Math.floor(Math.random() * 1000000)
  };

  // 立即保存，确保“继续游戏”按钮生效
  saveGame();

  // 立即刷新一次 UI
  if(window.updateUI) window.updateUI();

  return true;
}
