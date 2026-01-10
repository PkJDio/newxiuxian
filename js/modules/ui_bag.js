// js/modules/ui_bag.js - 背包界面 (性能优化版)
// 优化内容：
// 1. Grid 渲染改用 HTML 字符串拼接
// 2. 引入事件委托处理背包格子点击
// 3. 详情页渲染优化

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
        if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_bag", 85, 80);

        // 绑定背包格子的事件委托
        this._bindGridEvents();

        this.refresh();
    },

    // 【新增】事件委托：处理背包格子的点击
    _bindGridEvents: function() {
        // 使用 setTimeout 确保 DOM 已插入文档
        setTimeout(() => {
            const container = document.getElementById('bag_grid_content');
            if (!container) return;

            // 移除旧的监听器（如果有）并绑定新的
            container.onclick = (e) => {
                const itemEl = e.target.closest('.bag_grid_item');
                if (!itemEl) return;

                const index = parseInt(itemEl.dataset.index);
                if (isNaN(index)) return;

                if (this.selectionMode) {
                    this.toggleItemSelection(index);
                } else {
                    this.renderDetailFromBag(index);
                }
            };
        }, 0);
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
        // 局部刷新：只更新选中状态样式，不重绘整个 Grid（如果需要极致优化可以这样做，但这里为了简单先 refresh）
        this.refresh();
    },

    confirmBatchDiscard: function() {
        if (this.selectedIndices.size === 0) {
            if(window.showToast) window.showToast("未选择任何物品");
            return;
        }
        const count = this.selectedIndices.size;
        const title = "批量处理";
        const content = `
        <div style="text-align:center; padding:10px 5px;">
            <div style="font-size:18px; margin-bottom:8px; font-family:Kaiti; color:#333;">
                确定要丢弃选中的 <b style="color:#d32f2f;">${count}</b> 件物品吗？
            </div>
            <div style="font-size:13px; color:#999;">( 此操作不可撤销，请谨慎操作 )</div>
        </div>
    `;

        const footer = `
        <button class="bag_btn_action" style="margin-right:10px;" onclick="window.closeModal()">取消</button>
        <button class="bag_btn_danger" onclick="UIBag._doBatchDiscard()">确认丢弃</button>
    `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, content, footer, "modal_batch_confirm", 40, 30);
        }
    },

    _doBatchDiscard: function() {
        window.closeModal();
        if (window.UtilsItem && UtilsItem.discardMultipleItems) {
            UtilsItem.discardMultipleItems(this.selectedIndices);
        }
        this.selectionMode = false;
        this.selectedIndices.clear();
        if (window.showToast) window.showToast("已成功处理物品");
        this.refresh();
    },

    refresh: function() {
        const p = window.player;
        if (!p) return;

        this.renderToolbar();

        const equipRow = document.getElementById('bag_equipment_row');
        if (equipRow) {
            const slots = [
                { key: 'weapon', label: '兵器', defaultIcon: '⚔️' },
                { key: 'head',   label: '头部', defaultIcon: '🧢' },
                { key: 'body',   label: '身体', defaultIcon: '👕' },
                { key: 'feet',   label: '足部', defaultIcon: '👢' },
                { key: 'mount',  label: '坐骑', defaultIcon: '🐎' },
                { key: 'fishing_rod', label: '钓具', defaultIcon: '🎣' }
            ];

            let html = slots.map(slot => {
                const itemId = p.equipment[slot.key];
                const item = itemId ? GAME_DB.items.find(i => i.id === itemId) : null;

                let icon = slot.defaultIcon;
                let activeClass = '';
                let borderColor = '#ccc';

                if (item) {
                    icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || icon;
                    const qualityColor = (item && window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#ddd';
                    borderColor = qualityColor;
                    activeClass = 'active';
                }

                const name = item ? item.name : slot.label;
                const clickAction = item ? `UIBag.showEquippedDetail('${slot.key}')` : '';

                return `
                <div class="bag_equip_wrapper" onclick="${clickAction}">
                    <div class="bag_equip_slot ${activeClass}" style="border-color:${borderColor}">
                        <div class="bag_equip_icon">${icon}</div>
                    </div>
                    <div class="bag_equip_label" style="color:${item ? borderColor : '#999'}">${name}</div>
                </div>
            `;
            }).join('');

            html += `<div class="bag_equip_spacer"></div>`;

            if (!p.consumables) p.consumables = [null, null, null];

            p.consumables.forEach((itemId, idx) => {
                const item = itemId ? GAME_DB.items.find(i => i.id === itemId) : null;
                let icon = '';
                let activeClass = '';
                let name = `快捷${idx + 1}`;
                let clickAction = '';

                if (item) {
                    icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '💊';
                    activeClass = 'has_item';
                    name = item.name;
                    clickAction = `UIBag.showConsumableDetail(${idx})`;
                } else {
                    icon = '<span style="opacity:0.2; font-size:24px;">💊</span>';
                }

                html += `
                    <div class="bag_equip_wrapper" onclick="${clickAction}">
                        <div class="bag_equip_slot slot_consumable ${activeClass}">
                            <div class="bag_equip_icon">${icon}</div>
                        </div>
                        <div class="bag_equip_label">${name}</div>
                    </div>
                `;
            });

            equipRow.innerHTML = html;
        }

        this.renderGrid();
    },

    // 【核心优化】使用字符串拼接生成 Grid，并移除行内 onclick
    renderGrid: function() {
        const container = document.getElementById('bag_grid_content');
        if (!container) return;

        if (!player.inventory || player.inventory.length === 0) {
            container.innerHTML = `
                <div style="
                    grid-column: 1 / -1; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 200px; 
                    color: #999; 
                    font-size: 18px; 
                    font-family: Kaiti;
                    letter-spacing: 2px;
                ">
                    <span style="white-space: nowrap;">🍃 行囊空空如也</span>
                </div>`;
            return;
        }

        // 使用 map 生成 HTML 数组并 join
        const html = player.inventory.map((slot, index) => {
            const item = GAME_DB.items.find(i => i.id === slot.id);
            if (!item) return '';

            const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
            const rarityColor = (window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#333';
            const isSelected = this.selectedIndices.has(index) ? 'selected' : '';
            const isConsumableEquipped = player.consumables && player.consumables.includes(item.id);
            const markHtml = isConsumableEquipped ? `<div style="position:absolute;top:2px;left:2px;font-size:10px;background:#4caf50;color:#fff;padding:1px 3px;border-radius:2px;">配</div>` : '';

            // 注意：移除了 onclick="UIBag.toggleItemSelection(${index})"，改为 data-index
            return `
                <div class="bag_grid_item ${isSelected}" data-index="${index}" style="border-color:${rarityColor}">
                    ${this.selectionMode ? '<div class="bag_check_mark">✔</div>' : ''}
                    <div class="bag_grid_icon">${icon}</div>
                    <div class="bag_grid_name" style="color:${rarityColor}">${item.name}</div>
                    <div class="bag_item_count">${slot.count}</div>
                    ${markHtml}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    },

    renderDetailFromBag: function(index) {
        const slot = player.inventory[index];
        if(!slot) return;
        const item = GAME_DB.items.find(i => i.id === slot.id);
        if(item) {
            this.renderDetail(item, { type: 'bag', index: index });
        }
    },

    // 显示装备详情
    showEquippedDetail: function(slotKey) {
        const itemId = player.equipment[slotKey];
        if (!itemId) return;
        const item = GAME_DB.items.find(i => i.id === itemId);
        if (!item) return;
        this.renderDetail(item, { type: 'equip', key: slotKey });
    },

    showConsumableDetail: function(index) {
        const itemId = player.consumables[index];
        if (!itemId) return;
        const item = GAME_DB.items.find(i => i.id === itemId);
        if (!item) return;
        this.renderDetail(item, { type: 'consumable', index: index });
    },

    // 统一渲染详情页
    renderDetail: function(item, context) {
        const container = document.getElementById('bag_detail_panel');
        if (!container) return;

        const globalTypeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
        const typeName = globalTypeMap[item.type] || item.type || "物品";
        const rarityInfo = (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG[item.rarity] : null) || {color:'#333', name:'普通'};
        const mapping = window.ATTR_MAPPING || {};
        const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';

        let typeSuffix = '';
        if (context.type === 'equip') typeSuffix = '(已装备)';
        if (context.type === 'consumable') typeSuffix = '(已携带)';

        let statsRows = [];

        // 1. 耐久度
        if (item.durability !== undefined) {
            statsRows.push(`<div style="color:#795548;">🛡 耐久: ${item.durability}</div>`);
        }

        // 2. 锐利度
        const sharpness = item.sharpness || (item.effects && item.effects.sharpness);
        if (sharpness !== undefined) {
            const sharpEffectPct = Math.floor((1 - (100 / (100 + sharpness))) * 100);
            statsRows.push(`
            <div style="color:#ff9800; display:flex; align-items:center; gap:5px;">
                <span>✨ 锐利: ${sharpness}</span>
                <span style="font-size:14px; color:#ffb74d;">(护甲穿透 +${sharpEffectPct}%)</span>
            </div>`);
        }

        // 3. 功法进度
        if (item.type === 'book') {
            if (!player.studyProgress) player.studyProgress = {};
            const curVal = player.studyProgress[item.id] || 0;
            const maxVal = item.studyCost || 100;
            const skillList = Array.isArray(player.skills) ? player.skills : [];
            const isLearned = skillList.find(s => s.id === item.id);
            let statusText = "未领悟", statusColor = "#999";

            if (isLearned) { statusText = "已领悟"; statusColor = "#2e7d32"; }
            else if (curVal > 0) {
                const pct = Math.floor((curVal / maxVal) * 100);
                statusText = `研读中 (${pct}%)`; statusColor = "#f57f17";
            }

            statsRows.push(`
            <div style="border-top:1px dashed #ddd; margin-top:10px; padding-top:10px;">
                <div>📚 状态: <span style="color:${statusColor}">${statusText}</span></div>
                <div style="font-size:14px; color:#666; margin-top:4px;">
                    累计研读: <span style="color:#795548">${curVal}</span> / <span style="color:#333">${maxVal}</span>
                </div>
            </div>`);
        }

        // 4. 属性效果
        const effects = item.effects || item.stats || item.param;
        if (effects) {
            for (let key in effects) {
                const val = effects[key];
                if (!val && val !== 0 || key === 'sharpness') continue;

                if (typeof val === 'object') {
                    if (val.attr && val.val) {
                        const buffAttrs = String(val.attr).split('_');
                        const buffVals = String(val.val).split('_');
                        const days = val.days ? `(${val.days}天)` : '';

                        buffAttrs.forEach((attrKey, bIdx) => {
                            const name = mapping[attrKey] || attrKey;
                            let currentVal = buffVals[bIdx] !== undefined ? buffVals[bIdx] : buffVals[0];
                            let displayVal = "";
                            const sign = parseFloat(currentVal) > 0 ? "+" : "";

                            if (attrKey === 'studyEff') {
                                const pct = Math.round(parseFloat(currentVal) * 100);
                                displayVal = `${sign}${pct}%`;
                            } else {
                                displayVal = `${sign}${currentVal}`;
                            }
                            statsRows.push(`<div>🧪 临时${name}: <span style="color:#2196f3">${displayVal}</span> ${days}</div>`);
                        });
                    }
                    continue;
                }

                const name = mapping[key] || key;
                if (key === 'toxicity') {
                    statsRows.push(val > 0 ? `<div>☠️ 丹毒: <span style="color:#9c27b0">+${val}</span></div>` : `<div>🌿 解毒: <span style="color:#4caf50">${val}</span></div>`);
                } else if (key === 'hp' || key === 'mp') {
                    const color = val > 0 ? '#4caf50' : '#f44336';
                    const action = val > 0 ? "恢复" : "减少";
                    const sign = val > 0 ? "+" : "";
                    statsRows.push(`<div style="color:${color}">❤ ${action}${name}: ${sign}${val}</div>`);
                } else if (key === 'hunger') {
                    statsRows.push(`<div>🍖 ${name}: <span style="color:#4caf50">+${val}</span></div>`);
                } else if (key === 'max_skill_level') {
                    const limitName = (typeof UtilsItem !== 'undefined' && UtilsItem.getSkillLimitName) ? UtilsItem.getSkillLimitName(val) : val;
                    statsRows.push(`<div>📈 ${name}: <span style="color:#ff9800">${limitName}</span></div>`);
                } else {
                    let p_icon = '✨';
                    if(['atk','critRate','critDmg'].includes(key)) p_icon = '⚔️';
                    if(['def','hpMax','dodge'].includes(key)) p_icon = '🛡';
                    if(['speed'].includes(key)) p_icon = '👟';
                    const sign = val > 0 ? "+" : "";
                    const color = val > 0 ? '#4caf50' : '#f44336';
                    statsRows.push(`<div>${p_icon} ${name}: <span style="color:${color}">${sign}${val}</span></div>`);
                }
            }
        }

        // 5. 固有Buff
        if (item.buffs && Array.isArray(item.buffs)) {
            item.buffs.forEach(buff => {
                const name = mapping[buff.attr] || buff.attr;
                const sign = buff.val > 0 ? "+" : "";
                const dur = buff.duration ? `(${buff.duration}天)` : '';
                statsRows.push(`<div>🧪 ${name}: <span style="color:#2196f3">${sign}${buff.val}</span> ${dur}</div>`);
            });
        }

        const statsHtml = statsRows.length > 0 ? `<div class="bag_detail_stats" style="margin-top:10px; padding-bottom:10px; border-bottom:1px dashed #eee;">${statsRows.join('')}</div>` : '';

        // 6. 穿戴条件
        let reqHtml = '';
        if (item.req) {
            let reqList = [];
            const currentStats = player.derived || player.attr || {};
            for (let key in item.req) {
                const reqVal = item.req[key];
                const myVal = currentStats[key] || 0;
                const isMet = myVal >= reqVal;
                const attrName = mapping[key] || key;
                const statusIcon = isMet ? '✅' : '🚫';
                reqList.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; margin-bottom:4px; color:${isMet ? '#666' : '#d9534f'};"><span>${attrName}要求</span><span>${isMet ? `已达标 (${reqVal})` : `需 ${reqVal} (当前 ${myVal})`} ${statusIcon}</span></div>`);
            }
            if (reqList.length > 0) {
                reqHtml = `<div class="bag_detail_req" style="margin:10px 0; padding:8px; background:#fffbfb; border:1px dashed #e0e0e0; border-radius:4px;"><div style="font-weight:bold; color:#555; margin-bottom:5px; font-size:14px;">▼ 穿戴条件</div>${reqList.join('')}</div>`;
            }
        }

        const descText = item.desc || "此物平平无奇。";
        const descHtml = `<div class="bag_detail_desc" style="margin-top:10px; color:#666; line-height:1.5;">${descText}</div>`;

        let priceHtml = '';
        const price = (item.value !== undefined) ? item.value : item.price;
        if (price !== undefined) {
            priceHtml = `<div style="margin-top:15px; text-align:right; color:#d4af37; font-weight:bold;">💰 价值: ${price}</div>`;
        }

        // 7. 按钮生成
        let btnsHtml = `<div class="bag_detail_actions">`;

        if (context.type === 'bag') {
            const idx = context.index;
            if (['weapon','head','body','feet','mount','fishing_rod','tool'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleEquipAction(${idx}, '${item.type}')">装备</button>`;
            } else if (item.type === 'pill') {
                const carriedIndex = window.player.consumables ? window.player.consumables.indexOf(item.id) : -1;
                if (carriedIndex !== -1) btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable(${carriedIndex})">解除携带</button>`;
                else btnsHtml += `<button class="bag_btn_action" onclick="UIBag.equipConsumable('${item.id}')">随身携带</button>`;
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem(${idx})">服用</button>`;
            } else if (item.type === 'book') {
                btnsHtml += `<button class="bag_btn_action" onclick="window.UIStudy.open('${item.id}')">研读</button>`;
            } else if (['food','foodMaterial','herb'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem(${idx})">使用</button>`;
            }
            btnsHtml += `<button class="bag_btn_danger" onclick="UtilsItem.discardItem(${idx})">丢弃</button>`;
        }
        else if (context.type === 'equip') {
            const slotKey = context.key;
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleUnequipAction('${slotKey}')">卸下</button>`;
            btnsHtml += `<button class="bag_btn_danger" onclick="UIBag.discardEquippedItem('${slotKey}')">丢弃</button>`;
        }
        else if (context.type === 'consumable') {
            const slotIdx = context.index;
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable(${slotIdx})">解除携带</button>`;
            const bagIdx = player.inventory.findIndex(s => s.id === item.id);
            if (bagIdx !== -1) {
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem(${bagIdx})">服用</button>`;
            }
        }

        btnsHtml += `</div>`;

        container.innerHTML = `
        <div class="bag_detail_header" style="color:${rarityInfo.color};">
            <span>${icon} ${item.name}</span>
            <span class="ink_tag" style="font-size:14px;">${rarityInfo.name}</span>
        </div>
        <div class="bag_detail_type">${typeName} ${typeSuffix}</div>
        ${statsHtml}
        ${reqHtml}  ${descHtml}
        ${priceHtml}
        ${btnsHtml}
    `;
    },

    equipConsumable: function(itemId) {
        const p = window.player;
        if (!p.consumables) p.consumables = [null, null, null];
        const emptyIdx = p.consumables.indexOf(null);
        if (emptyIdx === -1) { if(window.showToast) window.showToast("随身位已满"); return; }
        p.consumables[emptyIdx] = itemId;
        if(window.showToast) window.showToast("已放入随身快捷栏");
        if(window.saveGame) window.saveGame();
        this.refresh();
        const slotIdx = p.inventory.findIndex(s => s.id === itemId);
        if(slotIdx !== -1) {
            const item = GAME_DB.items.find(i => i.id === itemId);
            this.renderDetail(item, { type: 'bag', index: slotIdx });
        }
    },

    unequipConsumable: function(slotIndex) {
        const p = window.player;
        if (!p.consumables || !p.consumables[slotIndex]) return;
        const itemId = p.consumables[slotIndex];
        p.consumables[slotIndex] = null;
        if(window.showToast) window.showToast("已取消携带");
        if(window.saveGame) window.saveGame();
        this.refresh();
        const bagIdx = p.inventory.findIndex(s => s.id === itemId);
        if(bagIdx !== -1) {
            const item = GAME_DB.items.find(i => i.id === itemId);
            this.renderDetail(item, { type: 'bag', index: bagIdx });
        } else {
            const container = document.getElementById('bag_detail_panel');
            if(container) container.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">已从快捷栏移除</div>';
        }
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
        const content = `<div style="text-align:center; padding:20px 10px;"><div style="font-size:18px; margin-bottom:10px; font-family:Kaiti;">确定要直接丢弃身上的这件装备吗？</div><div style="font-size:14px; color:#a94442;">( 丢弃后将无法找回 )</div></div>`;
        const footer = `<button class="bag_btn_action" style="margin-right:10px;" onclick="window.closeModal()">取消</button><button class="bag_btn_danger" onclick="UIBag._doDiscardEquip('${slotKey}')">确认丢弃</button>`;
        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) window.UtilsModal.showInteractiveModal(title, content, footer, "modal_equip_discard", 40, 30);
    },

    _doDiscardEquip: function(slotKey) {
        window.closeModal();
        player.equipment[slotKey] = null;
        if(window.recalcStats) window.recalcStats();
        if(window.updateUI) window.updateUI();
        if (window.showToast) window.showToast("装备已移除并丢弃");
        this.refresh();
    },

    // 供外部调用
    lockStudyTarget: function(bookId) {
        const item = window.GAME_DB.items.find(i => i.id === bookId);
        window.player.currentStudyTarget = bookId;
        if (window.showToast) window.showToast(`已将《${item.name}》设为当前研读目标，请回主界面执行操作。`);
        window.closeModal();
    }
};

window.refreshBagUI = () => UIBag.refresh();
function openBag() { UIBag.open(); }