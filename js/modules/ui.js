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
 * 刷新主界面 UI
 * 核心逻辑：调用 recalcStats -> 更新 DOM -> 绑定 Tooltip
 */
function updateUI() {
  if (!player) return;

  // 1. 核心：每帧刷新前，先重新计算属性
  // 这样保证装备、Buff变动后立刻生效
  if (typeof recalcStats === 'function') {
    recalcStats();
  }

  // 辅助函数：安全设置文本 + 绑定悬浮窗
  const updateVal = (id, key, label) => {
    const el = document.getElementById(id);
    if (!el) return;

    // 获取计算后的数值 (如果没有则为0)
    const val = player.derived[key] || 0;

    // 更新文本
    el.innerText = Math.floor(val); // 取整显示

    // 绑定悬浮窗 (Tooltip)
    // 移入时显示详情，移出时隐藏
    el.onmouseenter = function(e) {
      if(window.showStatusTooltip) window.showStatusTooltip(e, key, label);
    };
    el.onmouseleave = function() {
      if(window.hideTooltip) window.hideTooltip();
    };
  };

  // 1. 角色名片
  const elName = document.getElementById('profile_name');
  if(elName) elName.innerText = player.name;

  const elAge = document.getElementById('profile_age');
  if(elAge) elAge.innerText = player.age + "岁";

  const elGen = document.getElementById('profile_generation');
  if(elGen) elGen.innerText = `第 ${player.generation || 1} 世`;

  // 2. 核心属性 (精气神)
  updateVal('val_jing', 'jing', '精(体质)');
  updateVal('val_qi',   'qi',   '气(能量)');
  updateVal('val_shen', 'shen', '神(悟性)');

  // 3. 战斗属性
  updateVal('val_atk',   'atk',   '攻击力');
  updateVal('val_def',   'def',   '防御力');
  updateVal('val_speed', 'speed', '速度');

  // 4. 状态条 (数值/上限)
  const setBar = (idVal, current, max, label) => {
    const el = document.getElementById(idVal);
    if(el) {
      el.innerText = `${Math.floor(current)}/${Math.floor(max)}`;
      // 绑定上限的悬浮窗
      el.onmouseenter = (e) => { if(window.showStatusTooltip) window.showStatusTooltip(e, label, '上限详情'); };
      el.onmouseleave = () => { if(window.hideTooltip) window.hideTooltip(); };
    }
  };

  setBar('val_hp', player.status.hp, player.derived.hpMax, 'hpMax');
  setBar('val_mp', player.status.mp, player.derived.mpMax, 'mpMax');
  setBar('val_hunger', player.status.hunger, player.derived.hungerMax, 'hungerMax');

  // 5. 财富
  const elMoney = document.getElementById('val_money');
  if(elMoney) elMoney.innerText = player.money;

  // 6. 刷新 Buff 列表
  updateBuffs();
}

/**
 * 渲染左侧“当前状态”栏的 Buff 列表
 * 读取 player.buffs 数组
 */
/**
 * 渲染左侧“当前状态”栏的 Buff 列表
 */
function updateBuffs() {
  const buffListEl = document.getElementById('left_buff_list');
  if (!buffListEl) return;

  buffListEl.innerHTML = '';

  if (!player.buffs || player.buffs.length === 0) {
    const emptyTip = document.createElement('div');
    emptyTip.style.color = '#999';
    emptyTip.style.fontSize = '12px';
    emptyTip.style.textAlign = 'center';
    emptyTip.style.padding = '5px';
    emptyTip.innerText = '暂无特殊状态';
    buffListEl.appendChild(emptyTip);
    return;
  }

  Object.values(player.buffs || {}).forEach(buff => {
    const div = document.createElement('div');
    div.className = 'buff_item';
    // 样式处理
    if (buff.type === 'bad' || buff.type === 'debuff') {
      div.classList.add('text_red');
    } else {
      div.classList.add('text_green');
    }

    // 显示文本：中毒 (hpMax -10)
    let effectText = "";
    if(buff.attr && buff.val) {
      const op = buff.val > 0 ? "+" : "";
      effectText = ` (${buff.attr} ${op}${buff.val})`;
    }

    div.innerText = `${buff.name}${effectText}`;
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
