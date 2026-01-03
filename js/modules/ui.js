// ui.js - 核心界面交互 (去除背包逻辑)
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
    el.innerText = Math.floor(val);

    // 绑定悬浮窗 (Tooltip)
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

  // 2. 核心属性
  updateVal('val_jing', 'jing', '精(体质)');
  updateVal('val_qi',   'qi',   '气(能量)');
  updateVal('val_shen', 'shen', '神(悟性)');

  // 3. 战斗属性
  updateVal('val_atk',   'atk',   '攻击力');
  updateVal('val_def',   'def',   '防御力');
  updateVal('val_speed', 'speed', '速度');

  // 4. 状态条
  const setBar = (idVal, current, max, label) => {
    const el = document.getElementById(idVal);
    if(el) {
      el.innerText = `${Math.floor(current)}/${Math.floor(max)}`;
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
    if (buff.type === 'bad' || buff.type === 'debuff') {
      div.classList.add('text_red');
    } else {
      div.classList.add('text_green');
    }

    let effectText = "";
    if(buff.attr && buff.val) {
      const op = buff.val > 0 ? "+" : "";
      effectText = ` (${buff.attr} ${op}${buff.val})`;
    }

    div.innerText = `${buff.name}${effectText}`;
    buffListEl.appendChild(div);
  });
}

/* --- 通用弹窗逻辑 (保留) --- */

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
        </div>
    `;
  if (window.showGeneralModal) window.showGeneralModal(title, content);
}


/**
 * 显示万物图鉴
 */
function showGalleryModal() {
    const title = "万物图鉴";

    // 使用新的容器类名 pictorial_container
    let html = `<div class="pictorial_container">`;

    if (!GAME_DB.items || GAME_DB.items.length === 0) {
        html += `<div class="pictorial_empty">暂无收录物品数据...</div>`;
    } else {
        GAME_DB.items.forEach(item => {
            // 获取颜色
            const color = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

            // 获取图标：优先使用 getItemIcon 函数，没有则用 item.icon，还没则用默认
            const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';

            // 获取类型名称
            const typeName = (typeof TYPE_MAPPING !== 'undefined' ? TYPE_MAPPING[item.type] : item.type) || '未知';

            // 生成卡片 HTML，使用 pictorial_ 开头的类
            html += `
            <div class="pictorial_card"
                 onmouseenter="showGalleryTooltip(event, '${item.id}', null, 'gallery')"
                 onmouseleave="hideTooltip()"
                 onmousemove="moveTooltip(event)">
                 
                <div class="pictorial_icon">${icon}</div>
                
                <div class="pictorial_name" style="color:${color};">
                    ${item.name}
                </div>
                
                <div class="pictorial_type">
                    ${typeName}
                </div>
            </div>
        `;
        });
    }
    html += `</div>`;

    // 第四个参数传入自定义类名(如果有的话)，这里主要依靠内部HTML的样式
    if (window.showGeneralModal) window.showGeneralModal(title, html, null, "modal_gallery_box");
}
