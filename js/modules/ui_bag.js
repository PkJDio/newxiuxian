// js/ui_bag.js - 背包与物品界面逻辑 (宽屏重构版)

const UIBag = {
  /**
   * 打开行囊 (入口函数)
   */
  open: function() {
    this.showModal();
  },

  /**
   * 显示行囊弹窗
   */
  showModal: function() {
    const title = "修仙行囊";

    const contentHtml = `
            <div class="bag_container">
                <div class="bag_equipment_row">
                    ${this._renderEquipSlot('weapon', '兵器')}
                    ${this._renderEquipSlot('head', '头盔')}
                    ${this._renderEquipSlot('body', '衣服')}
                    ${this._renderEquipSlot('feet', '鞋子')}
                    ${this._renderEquipSlot('mount', '坐骑')}
                    ${this._renderEquipSlot('fishing_rod', '钓具')}
                </div>

                <div class="bag_main_area">
                    <div class="bag_grid_scroll">
                        <div id="bag_grid_content" class="bag_grid_content"></div>
                    </div>

                    <div id="bag_detail_panel" class="bag_detail_panel">
                        <div style="color:#999; text-align:center; margin-top:50px;">点击物品查看详情</div>
                    </div>
                </div>
            </div>
        `;

    // [核心修改] 传入第四个参数 "modal_bag"，对应 CSS 中的 .modal_bag { width: 75vw }
    if (window.showGeneralModal) {
      window.showGeneralModal(title, contentHtml, null, "modal_bag");
    }

    this.refresh();
  },

  /**
   * 辅助：生成装备格子 HTML (使用新类名 bag_xxx)
   */
  _renderEquipSlot: function(slotKey, label) {
    const equipId = (player.equipment && player.equipment[slotKey]) ? player.equipment[slotKey] : null;

    let icon = getItemIcon({ type: slotKey });
    let activeClass = "";
    let tooltipTitle = label;

    if (equipId) {
      const item = GAME_DB.items.find(i => i.id === equipId);
      if (item) {
        icon = getItemIcon(item);
        activeClass = "equipped";
        tooltipTitle = `${item.name} (点击卸下)`;
      }
    }

    return `
            <div class="bag_equip_wrapper">
                <span class="bag_equip_label">${label}</span>
                <div class="bag_equip_box ${activeClass}"
                     onclick="UtilsItem.unequipItem('${slotKey}')"
                     title="${tooltipTitle}">
                    ${icon}
                </div>
            </div>
        `;
  },

  /**
   * 刷新背包 UI (网格部分)
   */
  refresh: function() {
    const container = document.getElementById('bag_grid_content');
    if (!container) return;

    container.innerHTML = '';

    player.inventory.forEach((slot, index) => {
      const item = GAME_DB.items.find(i => i.id === slot.id);
      if (!item) return;

      const icon = getItemIcon(item);
      const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

      const div = document.createElement('div');
      // [修改] 使用新类名
      div.className = 'bag_grid_item';

      div.innerHTML = `
                <div class="bag_grid_icon">${icon}</div>
                <div class="bag_grid_name" style="color:${rarityColor};">
                    ${item.name}
                </div>
                ${slot.count > 1 ? `<div class="bag_item_count">x${slot.count}</div>` : ''}
            `;

      div.onclick = () => UIBag.renderDetail(item, slot, index);
      container.appendChild(div);
    });
  },

  /**
   * 渲染右侧详情面板
   */
  renderDetail: function(item, slot, index) {
    // [修改] ID 变更为 bag_detail_panel
    const container = document.getElementById('bag_detail_panel');
    if (!container) return;

    const typeName = TYPE_MAPPING[item.type] || "未知物品";
    const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
    const rarityName = (RARITY_CONFIG[item.rarity] || {}).name || '凡品';

    let statsHtml = `<div class="bag_detail_stats">`;
    statsHtml += `<div>💰 价值: ${item.price || 0}</div>`;

    if (item.type === 'book') {
      const status = UtilsItem.getBookStatus(item.id);
      statsHtml += `<div>状态: <span style="color:${status.color}">${status.text}</span></div>`;

      if (item.effects) {
        statsHtml += `<div class="bag_detail_line"></div>`;
        if (item.effects.max_skill_level) {
          const limitName = UtilsItem.getSkillLimitName(item.effects.max_skill_level);
          statsHtml += `<div>📈 境界上限: <span style="color:#d9534f">${limitName}</span></div>`;
        }
        for (let key in item.effects) {
          if(key === 'max_skill_level' || key === 'map') continue;
          statsHtml += `<div>✨ ${key}: +${item.effects[key]}</div>`;
        }
      }
    }

    if (['weapon','head','body','feet','tool','mount','fishing_rod'].includes(item.type)) {
      if (item.stats) {
        statsHtml += `<div class="bag_detail_line"></div>`;
        for (let k in item.stats) {
          statsHtml += `<div>⚔️ ${k}: ${item.stats[k]}</div>`;
        }
      }
    }

    if (item.type === 'pill') {
      statsHtml += `<div class="bag_detail_line"></div>`;
      statsHtml += `<div>🧪 功效: ${item.desc || '未知效果'}</div>`;
      if (item.buff_duration) {
        statsHtml += `<div>⏳ 持续: ${item.buff_duration} 天</div>`;
      }
    }
    statsHtml += `</div>`;

    let btnsHtml = `<div class="bag_detail_actions">`;
    if (['weapon','head','body','feet','mount','fishing_rod'].includes(item.type) || (item.type==='tool')) {
      btnsHtml += `<button class="ink_btn" onclick="UtilsItem.equipItem(${index})">装备</button>`;
    }
    if (['food','pill','book','foodMaterial'].includes(item.type)) {
      const btnName = item.type === 'book' ? '研读' : '使用';
      btnsHtml += `<button class="ink_btn" onclick="UtilsItem.useItem(${index})">${btnName}</button>`;
    }
    btnsHtml += `<button class="ink_btn_normal" onclick="UtilsItem.discardItem(${index})">丢弃</button>`;
    btnsHtml += `</div>`;

    container.innerHTML = `
            <div class="bag_detail_header" style="color:${rarityColor};">
                <span>${getItemIcon(item)} ${item.name}</span>
                <span class="ink_tag" style="font-size:14px;">${rarityName}</span>
            </div>
            <div class="bag_detail_type">${typeName}</div>
            <div class="bag_detail_desc">${item.desc || "平平无奇的物品。"}</div>
            ${statsHtml}
            ${btnsHtml}
        `;
  }
};

window.refreshBagUI = UIBag.refresh;
function openBag() {
  UIBag.open();
}
