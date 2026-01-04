// js/modules/ui_bag.js - 背包界面 (适配装备要求显示)

const UIBag = {
    // 状态管理
    selectionMode: false,
    selectedIndices: new Set(),

    open: function() {
        this.selectionMode = false;
        this.selectedIndices.clear();
        this.showModal();
    },

    showModal: function() {
        const title = "修仙行囊";
        const contentHtml = `
            <div class="bag_container">
                <div id="bag_equipment_row" class="bag_equipment_row"></div>
                <div id="bag_toolbar_container" class="bag_toolbar"></div>
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
        // 弹窗大小控制 (85vw宽, 80vh高)
        if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_bag", 85, 80);
        this.refresh();
    },

    renderToolbar: function() {
        const container = document.getElementById('bag_toolbar_container');
        if (!container) return;

        let html = '';
        if (this.selectionMode) {
            const count = this.selectedIndices.size;
            html = `
            <div class="bag_text_info">
               <span style="color:#a94442; margin-right:5px;">●</span> 
               已选: ${count}
            </div>
            <button class="bag_btn_action" onclick="UIBag.exitSelectionMode()">取消</button>
            <button class="bag_btn_danger" onclick="UIBag.confirmBatchDiscard()">确认丢弃</button>
          `;
        } else {
            html = `
            <button class="bag_btn_action" onclick="UtilsItem.sortInventory()">整理</button>
            <button class="bag_btn_action" onclick="UIBag.enterSelectionMode()">批量丢弃</button>
          `;
        }
        container.innerHTML = html;
    },

    enterSelectionMode: function() {
        this.selectionMode = true;
        this.selectedIndices.clear();
        this.refresh();
        const detail = document.getElementById('bag_detail_panel');
        if(detail) detail.innerHTML = '<div style="color:#a94442; text-align:center; margin-top:50px; font-weight:bold; font-family:Kaiti;">请点击左侧物品勾选<br>再次点击取消勾选</div>';
    },

    exitSelectionMode: function() {
        this.selectionMode = false;
        this.selectedIndices.clear();
        this.refresh();
        const detail = document.getElementById('bag_detail_panel');
        if(detail) detail.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">点击物品查看详情</div>';
    },

    toggleItemSelection: function(index) {
        if (this.selectedIndices.has(index)) {
            this.selectedIndices.delete(index);
        } else {
            this.selectedIndices.add(index);
        }
        this.refresh();
    },

    confirmBatchDiscard: function() {
        if (this.selectedIndices.size === 0) {
            if(window.showToast) window.showToast("未选择任何物品");
            return;
        }
        const count = this.selectedIndices.size;
        const title = "批量丢弃";
        const content = `
        <div style="text-align:center; padding:20px 10px;">
            <div style="font-size:18px; margin-bottom:10px; font-family:Kaiti;">
                确定要丢弃这 <span style="color:#a94442; font-weight:bold; font-size:22px;">${count}</span> 件物品吗？
            </div>
            <div style="font-size:14px; color:#888;">( 丢弃后将无法找回，请三思 )</div>
        </div>
      `;
        const footer = `
        <button class="bag_btn_action" onclick="UIBag.open()">取消</button>
        <button class="bag_btn_danger" onclick="UIBag._doBatchDiscard()">确认丢弃</button>
      `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, content, footer);
        }
    },

    _doBatchDiscard: function() {
        if (window.UtilsModal) window.UtilsModal.closeModal();
        UtilsItem.discardMultipleItems(this.selectedIndices);
        this.selectionMode = false;
        this.selectedIndices.clear();
        this.open();
    },

    refresh: function() {
        this.renderEquipmentRow();
        this.renderToolbar();

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

            if (this.selectionMode && this.selectedIndices.has(index)) {
                div.classList.add('selected');
            }

            div.innerHTML = `
                <div class="bag_grid_icon">${icon}</div>
                <div class="bag_grid_name" style="color:${rarityColor};">${item.name}</div>
                ${slot.count > 1 ? `<div class="bag_item_count">x${slot.count}</div>` : ''}
                <div class="bag_check_mark">✓</div>
            `;

            if (this.selectionMode) {
                div.onclick = () => UIBag.toggleItemSelection(index);
            } else {
                div.onclick = () => UIBag.renderDetail(item, { type: 'bag', index: index });
            }

            container.appendChild(div);
        });
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

    /**
     * 【核心修改】渲染详情面板
     * 增加了【装备要求】(Requirements) 的解析与显示
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

        // 3. 核心属性解析
        const effects = item.effects || item.stats || item.param;
        if (effects) {
            for (let key in effects) {
                const val = effects[key];
                if (!val && val !== 0) continue;

                if (typeof val === 'object') {
                    if (val.attr && val.val) {
                        const name = mapping[val.attr] || val.attr;
                        const sign = val.val > 0 ? "+" : "";
                        const days = val.days ? `(${val.days}天)` : '';
                        statsRows.push(`<div>🧪 临时${name}: <span style="color:#2196f3">${sign}${val.val}</span> ${days}</div>`);
                    }
                    continue;
                }

                const name = mapping[key] || key;
                if (key === 'toxicity') {
                    statsRows.push(`<div>☠️ 丹毒: <span style="color:#9c27b0">+${val}</span></div>`);
                } else if (key === 'hp' || key === 'mp') {
                    const isPositive = val > 0;
                    const color = isPositive ? '#4caf50' : '#f44336';
                    const action = isPositive ? "恢复" : "减少";
                    const sign = isPositive ? "+" : "";
                    statsRows.push(`<div style="color:${color}">❤ ${action}${name}: ${sign}${val}</div>`);
                } else if (key === 'hunger') {
                    statsRows.push(`<div>🍖 ${name}: <span style="color:#4caf50">+${val}</span></div>`);
                } else if (key === 'max_skill_level') {
                    const limitName = UtilsItem.getSkillLimitName(val);
                    statsRows.push(`<div>📈 ${name}: <span style="color:#ff9800">${limitName}</span></div>`);
                } else {
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

        // 4. Buffs 数组兼容
        if (item.buffs && Array.isArray(item.buffs)) {
            item.buffs.forEach(buff => {
                const name = mapping[buff.attr] || buff.attr;
                const sign = buff.val > 0 ? "+" : "";
                const dur = buff.duration ? `(${buff.duration}天)` : '';
                statsRows.push(`<div>🧪 ${name}: <span style="color:#2196f3">${sign}${buff.val}</span> ${dur}</div>`);
            });
        }

        const statsHtml = statsRows.length > 0
            ? `<div class="bag_detail_stats" style="margin-top:10px; padding-bottom:10px; border-bottom:1px dashed #eee;">${statsRows.join('')}</div>`
            : '';

        // === 【修正】装备要求显示 ===
        let reqHtml = '';
        if (item.req) {
            let reqList = [];
            // 【核心修正】获取最终属性
            const currentStats = player.derived || player.attr || {};

            for (let key in item.req) {
                const reqVal = item.req[key];
                const myVal = currentStats[key] || 0; // 获取当前实际值
                const isMet = myVal >= reqVal;
                const attrName = mapping[key] || key;

                // 样式：满足显示绿色对勾，不满足显示红色叉叉和当前值
                const color = isMet ? '#4caf50' : '#f44336';
                const icon = isMet ? '✅' : '🚫';
                const text = isMet ? `已达标 (${reqVal})` : `需 ${reqVal} (当前 ${myVal})`;

                reqList.push(
                    `<div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; margin-bottom:4px; color:${isMet ? '#666' : '#d9534f'};">
                    <span>${attrName}要求</span>
                    <span>${text} ${icon}</span>
                </div>`
                );
            }

            if (reqList.length > 0) {
                reqHtml = `<div class="bag_detail_req" style="margin:10px 0; padding:8px; background:#fffbfb; border:1px dashed #e0e0e0; border-radius:4px;">
                <div style="font-weight:bold; color:#555; margin-bottom:5px; font-size:14px;">▼ 穿戴条件</div>
                ${reqList.join('')}
            </div>`;
            }
        }

        const descText = item.desc || "此物平平无奇。";
        const descHtml = `<div class="bag_detail_desc" style="margin-top:10px; color:#666; line-height:1.5;">${descText}</div>`;

        let priceHtml = '';
        const price = (item.value !== undefined) ? item.value : item.price;
        if (price !== undefined) {
            priceHtml = `<div style="margin-top:15px; text-align:right; color:#d4af37; font-weight:bold;">💰 价值: ${price}</div>`;
        }

        // === 按钮生成 ===
        let btnsHtml = `<div class="bag_detail_actions">`;
        if (context.type === 'bag') {
            const idx = context.index;
            if (['weapon','head','body','feet','mount','fishing_rod','tool'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleEquipAction(${idx}, '${item.type}')">装备</button>`;
            }
            if (['food','pill','book','foodMaterial','herb'].includes(item.type)) {
                const btnName = item.type === 'book' ? '研读' : '使用';
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem(${idx})">${btnName}</button>`;
            }
            btnsHtml += `<button class="bag_btn_danger" onclick="UtilsItem.discardItem(${idx})">丢弃</button>`;
        }
        else if (context.type === 'equip') {
            const slotKey = context.key;
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleUnequipAction('${slotKey}')">卸下</button>`;
            btnsHtml += `<button class="bag_btn_danger" onclick="UIBag.discardEquippedItem('${slotKey}')">丢弃</button>`;
        }
        btnsHtml += `</div>`;

        container.innerHTML = `
            <div class="bag_detail_header" style="color:${rarityInfo.color};">
                <span>${(typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon)} ${item.name}</span>
                <span class="ink_tag" style="font-size:14px;">${rarityInfo.name}</span>
            </div>
            <div class="bag_detail_type">${typeName} ${context.type === 'equip' ? '(已装备)' : ''}</div>
            
            ${statsHtml}
            ${reqHtml}  ${descHtml}
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
        const itemId = player.equipment[slotKey];
        if (!itemId) return;
        const item = GAME_DB.items.find(i => i.id === itemId);

        UtilsItem.unequipItem(slotKey);

        const newIndex = player.inventory.findIndex(slot => slot.id === itemId);
        if (newIndex !== -1 && item) {
            this.renderDetail(item, { type: 'bag', index: newIndex });
        } else {
            const container = document.getElementById('bag_detail_panel');
            if(container) container.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">已卸下装备</div>';
        }
    },

    discardEquippedItem: function(slotKey) {
        const title = "丢弃装备";
        const content = `
        <div style="text-align:center; padding:20px 10px;">
            <div style="font-size:18px; margin-bottom:10px; font-family:Kaiti;">
                确定要直接丢弃身上的这件装备吗？
            </div>
            <div style="font-size:14px; color:#a94442;">( 丢弃后将无法找回 )</div>
        </div>
    `;
        const footer = `
      <button class="bag_btn_action" onclick="UIBag.open()">取消</button>
      <button class="bag_btn_danger" onclick="UIBag._doDiscardEquip('${slotKey}')">确认丢弃</button>
    `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, content, footer);
        }
    },

    _doDiscardEquip: function(slotKey) {
        if (window.UtilsModal) window.UtilsModal.closeModal();

        player.equipment[slotKey] = null;
        if(window.recalcStats) window.recalcStats();
        if(window.updateUI) window.updateUI();

        this.open();
    }
};

window.refreshBagUI = () => UIBag.refresh();
function openBag() { UIBag.open(); }