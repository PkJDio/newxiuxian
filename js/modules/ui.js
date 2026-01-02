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
 * 刷新主界面 UI (核心渲染函数)
 */
function updateUI() {
  if (!player) return;

  // 辅助函数：安全设置文本
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  };

  // --- 1. 角色名片 ---
  setTxt('profile_name', player.name);
  setTxt('profile_age', player.age + "岁");
  setTxt('profile_generation', `第 ${player.generation || 1} 世`);

  // --- 【新增】日期与时辰计算 ---
  // 假设 player.dayCount 是总天数，player.timeHours 是当前小时(0-23)
  // 年份计算：初始秦始皇三十七年(前210年) + (总天数 / 365)
  const startYear = 37;
  const currentYear = startYear + Math.floor(player.dayCount / 360); // 简单按360天一年
  const month = Math.floor((player.dayCount % 360) / 30) + 1;
  const day = (player.dayCount % 30) + 1;

  // 时辰计算
  // (小时+1)/2 取整，就是时辰索引。比如 23点和0点都是 (24/2)=12%12=0 (子时)
  const hour = player.timeHours || 0;
  const shichenIndex = Math.floor((hour + 1) % 24 / 2) % 12;
  const shichenName = (typeof SHICHEN_NAMES !== 'undefined') ? SHICHEN_NAMES[shichenIndex] : '子';

  const dateStr = `秦始皇${currentYear}年 ${month}月 ${day}日 · ${shichenName}时`;
  setTxt('profile_date', dateStr);


  // --- 2. 核心属性 (左右对齐已经在CSS里实现了) ---
  setTxt('val_jing', player.attr.jing);
  setTxt('val_qi', player.attr.qi);
  setTxt('val_shen', player.attr.shen);
  setTxt('val_money', player.money);

  // --- 3. 状态条 ---
  const hpMax = player.derived ? player.derived.hpMax : 100;
  const mpMax = player.derived ? player.derived.mpMax : 50;

  // 为了美观，可以显示 "当前/上限"
  setTxt('val_hp', `${Math.floor(player.status.hp)} / ${hpMax}`);
  setTxt('val_mp', `${Math.floor(player.status.mp)} / ${mpMax}`);
  setTxt('val_hunger', `${Math.floor(player.status.hunger)} / 100`);

  // --- 4. 战斗属性 ---
  setTxt('val_atk', player.derived.atk || 0);
  setTxt('val_def', player.derived.def || 0);
  setTxt('val_speed', player.derived.speed || 0);

  // --- 5. 刷新Buff列表 (如果有的话) ---
  // 这里预留一个刷新 Buff DOM 的逻辑位置
  // updateBuffList();
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
