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
  const hpMax = player.derived ? player.derived.hpMax : 100;
  const mpMax = player.derived ? player.derived.mpMax : 50;

  setTxt('val_hp', `${Math.floor(player.status.hp)}/${hpMax}`);
  setTxt('val_mp', `${Math.floor(player.status.mp)}/${mpMax}`);
  setTxt('val_hunger', `${Math.floor(player.status.hunger)}/100`);

  // 4. 战斗属性
  setTxt('val_atk', player.derived.atk || 0);
  setTxt('val_def', player.derived.def || 0);
  setTxt('val_speed', player.derived.speed || 0);

  // 5. 刷新 Buff 状态栏 (新增)
  updateBuffs();
}

/**
 * 渲染左侧“当前状态”栏的 Buff 列表
 * 读取 player.buffs 数组
 */
function updateBuffs() {
  const buffListEl = document.getElementById('left_buff_list');
  if (!buffListEl) return;

  // 清空现有列表
  buffListEl.innerHTML = '';

  // 检查是否有 buffs 数据
  // 假设 player.buffs 是一个对象数组: [{name:"中毒", desc:"每回合扣血", type:"bad"}, ...]
  if (!player.buffs || player.buffs.length === 0) {
    // 如果没有状态，可以留空或者显示提示
    const emptyTip = document.createElement('div');
    emptyTip.style.color = '#999';
    emptyTip.style.fontSize = '12px';
    emptyTip.style.textAlign = 'center';
    emptyTip.style.padding = '5px';
    emptyTip.innerText = '暂无特殊状态';
    buffListEl.appendChild(emptyTip);
    return;
  }

  // 遍历并生成 Buff 条目
  player.buffs.forEach(buff => {
    const div = document.createElement('div');
    div.className = 'buff_item';

    // 根据类型设置颜色 (需要在 CSS 定义 .text_red, .text_green 等)
    if (buff.type === 'bad' || buff.type === 'debuff') {
      div.classList.add('text_red');
    } else {
      div.classList.add('text_green');
    }

    // 构造显示文本，例如：精力充沛 (速度+2)
    // 假设 buff 对象有 name 和 desc 字段
    const descText = buff.desc ? ` (${buff.desc})` : '';
    div.innerText = `${buff.name}${descText}`;

    // 可选：添加鼠标悬停提示 (如果需要更详细的解释)
    div.title = buff.tips || buff.desc || buff.name;

    buffListEl.appendChild(div);
  });
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
  if (window.showGeneralModal) window.showGeneralModal(title, content);
}

/**
 * 显示万物图鉴
 */
function showGalleryModal() {
  const title = "万物图鉴";

  let html = `<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding: 10px;">`;

  if (!GAME_DB.items || GAME_DB.items.length === 0) {
    html += `<div style="padding:20px; color:#888;">暂无收录物品数据...<br>(请在 data 文件夹下添加数据)</div>`;
  } else {
    GAME_DB.items.forEach(item => {
      const color = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

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

  if (window.showGeneralModal) window.showGeneralModal(title, html);
}
