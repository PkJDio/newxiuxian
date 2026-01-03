// js/ui_bag.js - 背包与物品界面逻辑 (适配丹药嵌套BUFF与丹毒)

const UIBag = {
  open: function() { this.showModal(); },

  showModal: function() {
    const title = "修仙行囊";
    const contentHtml = `
            <div class="bag_container">
                <div id="bag_equipment_row" class="bag_equipment_row"></div>
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
    if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_bag");
    this.refresh();
  },

  renderEquipmentRow: function() {
    const container = document.getElementById('bag_equipment_row');
    if (!container) return;
    const slots = [
      {key: 'weapon', name: '兵器', defaultIcon: '⚔️'},
      {key: 'head', name: '头盔', defaultIcon: '🧢'},
      {key: 'body', name: '衣服', defaultIcon: '👕'},
      {key: 'feet', name: '鞋子', defaultIcon: '👞'},
      {key: 'mount', name: '坐骑', defaultIcon: '🐎'},
      {key: 'fishing_rod', name: '钓具', defaultIcon: '🎣'}
    ];
    let html = '';
    slots.forEach(slot => { html += this._renderEquipSlot(slot.key, slot.name, slot.defaultIcon); });
    container.innerHTML = html;
  },

  _renderEquipSlot: function(slotKey, label, defaultIcon) {
    const equipId = (player.equipment && player.equipment[slotKey]) ? player.equipment[slotKey] : null;
    let icon = defaultIcon || '📦';
    let activeClass = "";
    let tooltipTitle = label + " (空)";
    let onClickAction = "";

    if (equipId) {
      const item = GAME_DB.items.find(i => i.id === equipId);
      if (item) {
        icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || icon;
        activeClass = "equipped";
        tooltipTitle = `${item.name} (点击查看)`;
        onClickAction = `UIBag.showEquippedDetail('${slotKey}')`;
      }
    }
    const clickAttr = onClickAction ? `onclick="${onClickAction}"` : "";
    return `
            <div class="bag_equip_wrapper">
                <span class="bag_equip_label">${label}</span>
                <div class="bag_equip_box ${activeClass}" ${clickAttr} title="${tooltipTitle}">
                    <span class="bag_equip_icon">${icon}</span>
                </div>
            </div>
        `;
  },

  showEquippedDetail: function(slotKey) {
    const itemId = player.equipment[slotKey];
    if (!itemId) return;
    const item = GAME_DB.items.find(i => i.id === itemId);
    if (!item) return;
    this.renderDetail(item, { type: 'equip', key: slotKey });
  },

  refresh: function() {
    UIBag.renderEquipmentRow();
    const container = document.getElementById('bag_grid_content');
    if (!container) return;
    container.innerHTML = '';

    player.inventory.forEach((slot, index) => {
      const item = GAME_DB.items.find(i => i.id === slot.id);
      if (!item) return;
      const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
      const rarityColor = (RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#333';

      const div = document.createElement('div');
      div.className = 'bag_grid_item';
      div.innerHTML = `
                <div class="bag_grid_icon">${icon}</div>
                <div class="bag_grid_name" style="color:${rarityColor};">${item.name}</div>
                ${slot.count > 1 ? `<div class="bag_item_count">x${slot.count}</div>` : ''}
            `;
      div.onclick = () => UIBag.renderDetail(item, { type: 'bag', index: index });
      container.appendChild(div);
    });
  },

  /**
   * 【核心修改】渲染详情面板
   * 支持识别 nested object (如 buff) 和 flat number (如 toxicity)
   */
  renderDetail: function(item, context) {
    const container = document.getElementById('bag_detail_panel');
    if (!container) return;

    const globalTypeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
    const typeName = globalTypeMap[item.type] || item.type || "物品";
    const rarityInfo = (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG[item.rarity] : null) || {color:'#333', name:'普通'};
    const mapping = window.ATTR_MAPPING || {};

    let statsRows = [];

    // 1. 耐久度
    if (item.durability !== undefined) {
      statsRows.push(`<div style="color:#795548;">🛡 耐久: ${item.durability}</div>`);
    }

    // 2. 书籍状态
    if (item.type === 'book') {
      const status = UtilsItem.getBookStatus(item.id);
      statsRows.push(`<div>📚 状态: <span style="color:${status.color}">${status.text}</span></div>`);
    }

    // 3. 核心属性解析 (兼容 stats/effects/param)
    const effects = item.effects || item.stats || item.param;

    if (effects) {
      for (let key in effects) {
        const val = effects[key];
        if (!val && val !== 0) continue;

        // === 情况A：值是对象 (嵌套属性，例如 buff: {attr:'atk', val:2}) ===
        if (typeof val === 'object') {
          // 如果是 Buff 对象 (有 attr 和 val)
          if (val.attr && val.val) {
            const name = mapping[val.attr] || val.attr;
            const sign = val.val > 0 ? "+" : "";
            const days = val.days ? `(${val.days}天)` : '';
            // 蓝色显示临时属性
            statsRows.push(`<div>🧪 临时${name}: <span style="color:#2196f3">${sign}${val.val}</span> ${days}</div>`);
          }
          continue; // 处理完对象后跳过后续逻辑
        }

        // === 情况B：值是数字 (常规属性) ===
        const name = mapping[key] || key;

        // 特殊属性处理：丹毒 (toxicity)
        if (key === 'toxicity') {
          statsRows.push(`<div>☠️ 丹毒: <span style="color:#9c27b0">+${val}</span></div>`);
          continue;
        }

        // 恢复类 (HP, MP)
        if (key === 'hp' || key === 'mp') {
          const isPositive = val > 0;
          const color = isPositive ? '#4caf50' : '#f44336';
          const action = isPositive ? "恢复" : "减少";
          const sign = isPositive ? "+" : "";
          statsRows.push(`<div style="color:${color}">❤ ${action}${name}: ${sign}${val}</div>`);
        }
        // 饱食度
        else if (key === 'hunger') {
          statsRows.push(`<div>🍖 ${name}: <span style="color:#4caf50">+${val}</span></div>`);
        }
        // 境界/修行上限
        else if (key === 'max_skill_level') {
          const limitName = UtilsItem.getSkillLimitName(val);
          statsRows.push(`<div>📈 ${name}: <span style="color:#ff9800">${limitName}</span></div>`);
        }
        // 战斗/基础属性
        else {
          let icon = '✨';
          if(['atk','critRate','critDmg'].includes(key)) icon = '⚔️';
          if(['def','hpMax','dodge'].includes(key)) icon = '🛡';
          if(['speed'].includes(key)) icon = '👟';

          const sign = val > 0 ? "+" : "";
          const color = val > 0 ? '#4caf50' : '#f44336';
          statsRows.push(`<div>${icon} ${name}: <span style="color:${color}">${sign}${val}</span></div>`);
        }
      }
    }

    // 4. 旧版 Buffs 数组兼容 (以防万一还有物品用 item.buffs)
    if (item.buffs && Array.isArray(item.buffs)) {
      item.buffs.forEach(buff => {
        const name = mapping[buff.attr] || buff.attr;
        const sign = buff.val > 0 ? "+" : "";
        const dur = buff.duration ? `(${buff.duration}天)` : '';
        statsRows.push(`<div>🧪 ${name}: <span style="color:#2196f3">${sign}${buff.val}</span> ${dur}</div>`);
      });
    }

    // 组装属性 HTML
    const statsHtml = statsRows.length > 0
      ? `<div class="bag_detail_stats" style="margin-top:10px; padding-bottom:10px; border-bottom:1px dashed #eee;">${statsRows.join('')}</div>`
      : '';

    // === 详情与价格 ===
    const descText = item.desc || "此物平平无奇。";
    const descHtml = `<div class="bag_detail_desc" style="margin-top:10px; color:#666; line-height:1.5;">${descText}</div>`;

    let priceHtml = '';
    const price = (item.value !== undefined) ? item.value : item.price;
    if (price !== undefined) {
      priceHtml = `<div style="margin-top:15px; text-align:right; color:#d4af37; font-weight:bold;">💰 价值: ${price}</div>`;
    }

    // === 按钮 ===
    let btnsHtml = `<div class="bag_detail_actions">`;
    if (context.type === 'bag') {
      const idx = context.index;
      if (['weapon','head','body','feet','mount','fishing_rod','tool'].includes(item.type)) {
        btnsHtml += `<button class="ink_btn" onclick="UIBag.handleEquipAction(${idx}, '${item.type}')">装备</button>`;
      }
      if (['food','pill','book','foodMaterial','herb'].includes(item.type)) {
        const btnName = item.type === 'book' ? '研读' : '使用';
        btnsHtml += `<button class="ink_btn" onclick="UtilsItem.useItem(${idx})">${btnName}</button>`;
      }
      btnsHtml += `<button class="ink_btn_normal" onclick="UtilsItem.discardItem(${idx})">丢弃</button>`;
    }
    else if (context.type === 'equip') {
      const slotKey = context.key;
      btnsHtml += `<button class="ink_btn" onclick="UIBag.handleUnequipAction('${slotKey}')">卸下</button>`;
      btnsHtml += `<button class="ink_btn_normal" onclick="UIBag.discardEquippedItem('${slotKey}')">丢弃</button>`;
    }
    btnsHtml += `</div>`;

    container.innerHTML = `
            <div class="bag_detail_header" style="color:${rarityInfo.color};">
                <span>${(typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon)} ${item.name}</span>
                <span class="ink_tag" style="font-size:14px;">${rarityInfo.name}</span>
            </div>
            <div class="bag_detail_type">${typeName} ${context.type === 'equip' ? '(已装备)' : ''}</div>

            ${statsHtml}
            ${descHtml}
            ${priceHtml}

            ${btnsHtml}
        `;
  },

  handleEquipAction: function(inventoryIndex, itemType) {
    const slotKey = UtilsItem.getEquipSlot(itemType);
    UtilsItem.equipItem(inventoryIndex);
    this.showEquippedDetail(slotKey);
  },

  handleUnequipAction: function(slotKey) {
    UtilsItem.unequipItem(slotKey);
    const container = document.getElementById('bag_detail_panel');
    if(container) container.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">已卸下装备</div>';
  },

  discardEquippedItem: function(slotKey) {
    if(!confirm("确定要直接丢弃身上的这件装备吗？(不可恢复)")) return;
    player.equipment[slotKey] = null;
    if(window.recalcStats) window.recalcStats();
    if(window.refreshBagUI) window.refreshBagUI();
    if(window.updateUI) window.updateUI();
    const container = document.getElementById('bag_detail_panel');
    if(container) container.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">装备已丢弃</div>';
  }
};

window.refreshBagUI = () => UIBag.refresh();
function openBag() { UIBag.open(); }
