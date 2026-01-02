// 界面交互：背包、技能面板、更新DOM
console.log("加载 界面交互")
/* ================= 界面交互逻辑 ================= */

/**
 * 切换到游戏场景
 * 隐藏菜单DIV，显示游戏DIV
 */
function enterGameScene() {
  const menu = document.getElementById('scene_menu');
  const game = document.getElementById('scene_game');

  if (menu && game) {
    menu.classList.remove('active');
    game.classList.add('active');

    // 进入后立即刷新一次界面
    updateUI();

    // 打印欢迎日志
    if(window.LogManager) {
      window.LogManager.clear();
      window.LogManager.add(`轮回开启，你出生于【${player.location}】...`);
      window.LogManager.add("大道三千，祝道友早证混元。");
    }
  }
}

/**
 * 刷新主界面 UI (左侧状态栏)
 * 将 player 数据映射到 HTML 元素
 */
function updateUI() {
  if (!player) return;

  // 辅助函数：安全设置文本
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  // 1. 角色名片
  setTxt('profile_name', player.name);
  setTxt('profile_age', player.age + "岁");
  setTxt('profile_generation', `第 ${player.generation || 1} 世`); // 兼容旧档

  // 2. 核心属性
  setTxt('val_jing', player.attr.jing);
  setTxt('val_qi', player.attr.qi);
  setTxt('val_shen', player.attr.shen);
  setTxt('val_money', player.money);

  // 3. 状态条 (数值/上限)
  // 这是一个简单的计算，实际应该用 derived 属性
  const hpMax = player.derived ? player.derived.hpMax : 100;
  const mpMax = player.derived ? player.derived.mpMax : 50;

  setTxt('val_hp', `${Math.floor(player.status.hp)}/${hpMax}`);
  setTxt('val_mp', `${Math.floor(player.status.mp)}/${mpMax}`);
  setTxt('val_hunger', `${Math.floor(player.status.hunger)}/100`);

  // 4. 战斗属性
  setTxt('val_atk', player.derived.atk || 0);
  setTxt('val_def', player.derived.def || 0);
  setTxt('val_speed', player.derived.speed || 0);
}

/* --- 弹窗逻辑 --- */

/**
 * 显示更新日志
 */
function showChangelogModal() {
  const title = "更新日志";
  const content = `
        <div style="padding:10px;">
            <h3>v3.0 重构版</h3>
            <ul>
                <li>[架构] 代码全面模块化，数据与逻辑分离。</li>
                <li>[画面] 全新水墨风格 UI，动态山水背景。</li>
                <li>[地图] 2700里超大无缝地图底层实装。</li>
                <li>[系统] 引入时间、疲劳、天气系统。</li>
            </ul>
            <br>
            <p style="color:#666">更多内容持续开发中...</p>
        </div>
    `;
  // 调用 utils.js 里的弹窗管理器
  if(window.showGeneralModal) window.showGeneralModal(title, content);
}

/**
 * 显示万物图鉴
 */
/**
 * 显示万物图鉴
 */
function showGalleryModal() {
  const title = "万物图鉴";

  // 使用 flex 布局让图标整齐排列
  let html = `<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding: 10px;">`;

  if (!GAME_DB.items || GAME_DB.items.length === 0) {
    html += `<div style="padding:20px; color:#888;">暂无收录物品数据...<br>(请在 data 文件夹下添加数据)</div>`;
  } else {
    GAME_DB.items.forEach(item => {
      const color = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

      // 【修改点】
      // 1. 卡片尺寸从 90px 改为 120px，以容纳大字体
      // 2. 名字字体改为 18px
      // 3. 类型字体改为 16px
      html += `
                <div class="ink_card"
                     style="width:120px; height:120px; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:help; transition:transform 0.2s;"
                     onmouseenter="showItemTooltip(event, '${item.id}', null, 'gallery')"
                     onmouseleave="hideTooltip()"
                     onmousemove="moveTooltip(event)">

                    <div style="font-weight:bold; color:${color}; font-size:18px; text-align:center; margin-bottom:6px;">
                        ${item.name}
                    </div>

                    <div style="color:#999; font-size:16px;">
                        ${TYPE_MAPPING[item.type] || '未知'}
                    </div>
                </div>
            `;
    });
  }
  html += `</div>`;

  if(window.showGeneralModal) window.showGeneralModal(title, html);
}
