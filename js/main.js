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

    setTimeout(() => {
        CloudArchive.initSync();
        console.log("[CloudArchive] Cloud Archive Sync Initialized.");
    }, 500);
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

            // ==========================================
            // 【核心修改】检查是否是新的一世，如果是，补发弹窗
            // ==========================================
            if (window.player.isNewLife) {
                // 1. 触发开局剧情
                if (typeof triggerOpeningEvent === 'function') {
                    triggerOpeningEvent();
                }



                // 2. 移除标记（防止刷新页面后再次弹窗）
                window.player.isNewLife = false;

                // 3. 再次保存（去掉标记后的状态）
                saveGame();
            }

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
    newPlayer.danger = 0;      // 危险度 (0-100)
    newPlayer.need_kill = 0;   // 稳定期计数器 (0-100)
    newPlayer.timeStart = 0;   // 确保初始阶段为0
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
    // window.LogManager.add("大道三千，祝道友早证混元。");
  }
// ==========================================
    // 【新增】在这里调用开局剧情事件
    // ==========================================
    triggerOpeningEvent();
    // 【新增】调用引导检查
    // 使用 setTimeout 稍微延迟一点，确保界面DOM已经渲染完毕
    setTimeout(function() {
        if (window.UITutorial) {
            window.UITutorial.checkAutoStart();
        }
    }, 500);

  return true;
}

/**
 * 游戏开局唯一事件：初入仙途
 * 仅在游戏初始化时调用，独立于 _onNewDay
 */
function triggerOpeningEvent() {
    // 1. 定义丰满的文本内容
    const title = "【初入仙途】";

    // 这里的文本保留换行符，以便在Modal中分段显示
    const content =
        "始皇帝三十七年，正月初一。\n\n" +
        "凛冬未散，寒鸦枯树。此时天下初定，四海归一，然朝堂江湖皆传，祖龙亦惧天命，遣徐福率三千童男童女东渡瀛洲，只为求那虚无缥缈的长生不死药。\n\n" +
        "吾生于微末，本是一介凡夫，然每念及此，心中块垒难平——帝王将相所求者，凡夫俗子难道便不配求？若这世间真有长生法，为何不能是我？若这天道有门，为何我不能叩？\n\n" +
        "今日，吾决意散尽家财，负剑辞家。不为荣华，不问归期，只愿以此肉体凡胎，入世走一遭，去寻那长生大道！";

    // 2. 记录到日志 (LogManager)
    // 为了日志整洁，可以把多重换行替换成空格，或者直接原样输出，看你日志UI的支持程度
    if (typeof LogManager !== 'undefined') {
        LogManager.add(`[${title}] ${content.replace(/\n\n/g, " ")}`);
    }

    // 3. 调用之前写好的 ModalManager
    // 假设 showEventModal 的签名是 (title, description, options)
    if (typeof ModalManager !== 'undefined') {
        ModalManager.showEventModal(
            title,   // 标题
            content, // 描述文本
            [        // 选项数组
                {
                    text: "踏上征程",
                    style: "confirm", // 这是一个确认类的操作，可以用高亮样式
                    action: () => {
                        console.log("【系统】玩家确认背景故事，游戏正式交互开始。");
                        // 这里可以触发一些初始化后的逻辑，比如：
                        // 1. 播放一个音效
                        // 2. 引导高亮某个按钮
                        // 3. 仅仅是关闭弹窗（ModalManager通常点击后会自动关闭，除非你有特殊设置）
                    }
                }
            ]
        );
    } else {
        console.error("ModalManager 未定义，无法显示开局剧情！");
    }
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

    setTimeout(() => {
        CloudArchive.initSync();
    }, 500);
});