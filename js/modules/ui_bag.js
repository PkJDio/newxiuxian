// js/modules/ui_bag.js - 背包界面 (v2.3: 消耗品交互优化 - 详情页操作)

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
        const title = "批量处理";
        const content = `
        <div style="text-align:center; padding:10px 5px;">
            <div style="font-size:18px; margin-bottom:8px; font-family:Kaiti; color:#333;">
                确定要丢弃选中的 <b style="color:#d32f2f;">${count}</b> 件物品吗？
            </div>
            <div style="font-size:13px; color:#999;">( 此操作不可撤销，请谨慎操作 )</div>
        </div>
    `;

        // 取消按钮直接调用全局的 window.closeModal()
        const footer = `
        <button class="bag_btn_action" style="margin-right:10px;" onclick="window.closeModal()">取消</button>
        <button class="bag_btn_danger" onclick="UIBag._doBatchDiscard()">确认丢弃</button>
    `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            // 传入 40 (vw) 和 30 (vh) 确保弹窗是小巧的
            window.UtilsModal.showInteractiveModal(title, content, footer, "modal_batch_confirm", 40, 30);
        }
    },

    _doBatchDiscard: function() {
        // 1. 关闭确认小窗
        window.closeModal();

        // 2. 执行逻辑
        if (window.UtilsItem && UtilsItem.discardMultipleItems) {
            UtilsItem.discardMultipleItems(this.selectedIndices);
        }

        // 3. 重置状态
        this.selectionMode = false;
        this.selectedIndices.clear();

        if (window.showToast) window.showToast("已成功处理物品");

        // 4. 原地刷新 UI（保持“修仙行囊”大窗口不动）
        this.refresh();
    },

    refresh: function() {
        const p = window.player;
        if (!p) return;

        this.renderToolbar();

        const equipRow = document.getElementById('bag_equipment_row');
        if (equipRow) {
            // A. 常规装备
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
                let activeClass = ''; // 默认为空，触发 CSS 的 grayscale
                let borderColor = '#ccc';

                if (item) {
                    // 有装备：替换图标并激活彩色类名
                    icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || icon;
                    const qualityColor = (item && window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#ddd';
                    borderColor = qualityColor;
                    activeClass = 'active'; // 激活彩色
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

            // B. 插入间隔
            html += `<div class="bag_equip_spacer"></div>`;

            // C. 渲染 3 个消耗品栏
            if (!p.consumables) p.consumables = [null, null, null];

            p.consumables.forEach((itemId, idx) => {
                const item = itemId ? GAME_DB.items.find(i => i.id === itemId) : null;

                let icon = '';
                let activeClass = '';
                let name = `快捷${idx + 1}`;
                let clickAction = ''; // 默认为空，点击无反应

                if (item) {
                    icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '💊';
                    activeClass = 'has_item';
                    name = item.name;
                    // 【关键修改】点击不再直接卸下，而是查看详情
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

    renderGrid: function() {
        const container = document.getElementById('bag_grid_content');
        if (!container) return;

        let html = '';
        if (!player.inventory || player.inventory.length === 0) {
            // 【优化点】：增加 span 包装并使用强力的居中样式，防止被 Grid 布局压缩
            html = `
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
        } else {
            player.inventory.forEach((slot, index) => {
                const item = GAME_DB.items.find(i => i.id === slot.id);
                if (!item) return;

                const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
                const rarityColor = (window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#333';
                const isSelected = this.selectedIndices.has(index) ? 'selected' : '';

                // 检查是否已装备为消耗品
                const isConsumableEquipped = player.consumables && player.consumables.includes(item.id);
                const markHtml = isConsumableEquipped ? `<div style="position:absolute;top:2px;left:2px;font-size:10px;background:#4caf50;color:#fff;padding:1px 3px;border-radius:2px;">配</div>` : '';

                if (this.selectionMode) {
                    html += `
                    <div class="bag_grid_item ${isSelected}" onclick="UIBag.toggleItemSelection(${index})" style="border-color:${rarityColor}">
                        <div class="bag_check_mark">✔</div>
                        <div class="bag_grid_icon">${icon}</div>
                        <div class="bag_grid_name" style="color:${rarityColor}">${item.name}</div>
                        <div class="bag_item_count">${slot.count}</div>
                        ${markHtml}
                    </div>
                    `;
                } else {
                    html += `
                    <div class="bag_grid_item" onclick="UIBag.renderDetailFromBag(${index})" style="border-color:${rarityColor}">
                        <div class="bag_grid_icon">${icon}</div>
                        <div class="bag_grid_name" style="color:${rarityColor}">${item.name}</div>
                        <div class="bag_item_count">${slot.count}</div>
                        ${markHtml}
                    </div>
                    `;
                }
            });
        }
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

    // 【新增】显示消耗品详情
    showConsumableDetail: function(index) {
        const itemId = player.consumables[index];
        if (!itemId) return;
        const item = GAME_DB.items.find(i => i.id === itemId);
        if (!item) return;
        // 传入上下文：类型为 consumable，索引为快捷栏索引
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

        // 详情页类型标记后缀
        let typeSuffix = '';
        if (context.type === 'equip') typeSuffix = '(已装备)';
        if (context.type === 'consumable') typeSuffix = '(已携带)';

        let statsRows = [];
        if (item.durability !== undefined) {
            statsRows.push(`<div style="color:#795548;">🛡 耐久: ${item.durability}</div>`);
        }
        // --- 在此处插入锐利度显示逻辑 ---
        const sharpness = item.sharpness || (item.effects && item.effects.sharpness);
        if (sharpness !== undefined) {
            // 计算百分比效果，方便玩家直观理解（对应你战斗系统中的抑制系数）
            const sharpEffectPct = Math.floor((1 - (100 / (100 + sharpness))) * 100);
            statsRows.push(`
        <div style="color:#ff9800; display:flex; align-items:center; gap:5px;">
            <span>✨ 锐利: ${sharpness}</span>
            <span style="font-size:14px; color:#ffb74d;">(护甲穿透 +${sharpEffectPct}%)</span>
        </div>
    `);
        }
        if (item.type === 'book') {
            const status = UtilsItem.getBookStatus(item.id);
            statsRows.push(`<div>📚 状态: <span style="color:${status.color}">${status.text}</span></div>`);
        }

        const effects = item.effects || item.stats || item.param;
        if (effects) {
            for (let key in effects) {
                const val = effects[key];
                if (!val && val !== 0) continue;
                // 在 renderDetail 的 effects 遍历中修改对象处理部分
                if (typeof val === 'object') {
                    if (val.attr && val.val) {
                        const buffAttrs = String(val.attr).split('_');
                        const buffVals = String(val.val).split('_');
                        const days = val.days ? `(${val.days}天)` : '';

                        buffAttrs.forEach((attrKey, bIdx) => {
                            const name = mapping[attrKey] || attrKey;
                            const currentVal = buffVals[bIdx] !== undefined ? buffVals[bIdx] : buffVals[0];
                            const sign = parseInt(currentVal) > 0 ? "+" : "";
                            statsRows.push(`<div>🧪 临时${name}: <span style="color:#2196f3">${sign}${currentVal}</span> ${days}</div>`);
                        });
                    }
                    continue;
                }
                const name = mapping[key] || key;
                // 【修改开始】针对 toxicity 的特殊显示逻辑
                if (key === 'toxicity') {
                    if (val > 0) {
                        // 正数：丹毒 (增加中毒值)
                        statsRows.push(`<div>☠️ 丹毒: <span style="color:#9c27b0">+${val}</span></div>`);
                    } else {
                        // 负数：解毒 (减少中毒值)
                        // 用户要求显示 "解毒 -30" (或者你想要 "解毒 30"？通常显示数值变化保留符号比较清晰，这里按你要求的 "-30")
                        statsRows.push(`<div>🌿 解毒: <span style="color:#4caf50">${val}</span></div>`);
                    }
                }
                else if (key === 'hp' || key === 'mp') {
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

        let reqHtml = '';
        if (item.req) {
            let reqList = [];
            const currentStats = player.derived || player.attr || {};
            for (let key in item.req) {
                const reqVal = item.req[key];
                const myVal = currentStats[key] || 0;
                const isMet = myVal >= reqVal;
                const attrName = mapping[key] || key;
                const color = isMet ? '#4caf50' : '#f44336';
                const icon = isMet ? '✅' : '🚫';
                const text = isMet ? `已达标 (${reqVal})` : `需 ${reqVal} (当前 ${myVal})`;
                reqList.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:14px; margin-bottom:4px; color:${isMet ? '#666' : '#d9534f'};"><span>${attrName}要求</span><span>${text} ${icon}</span></div>`);
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

        // === 按钮生成 ===
        let btnsHtml = `<div class="bag_detail_actions">`;

        // 1. 在背包中查看
        if (context.type === 'bag') {
            const idx = context.index;
            if (['weapon','head','body','feet','mount','fishing_rod','tool'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleEquipAction(${idx}, '${item.type}')">装备</button>`;
            }

            // 在 renderDetail 函数内部，找到 pill 类型判断的位置并替换为：
            else if (item.type === 'pill') {
                // 检查是否在快捷栏中，并获取其索引
                const carriedIndex = window.player.consumables ? window.player.consumables.indexOf(item.id) : -1;

                if (carriedIndex !== -1) {
                    // 如果已携带，直接显示“解除携带”按钮，并传入快捷栏索引
                    btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable(${carriedIndex})">解除携带</button>`;
                } else {
                    // 如果未携带，显示“随身携带”按钮
                    btnsHtml += `<button class="bag_btn_action" onclick="UIBag.equipConsumable('${item.id}')">随身携带</button>`;
                }
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem(${idx})">服用</button>`;
            }

            else if (['food','book','foodMaterial','herb'].includes(item.type)) {
                const btnName = item.type === 'book' ? '研读' : '使用';
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem(${idx})">${btnName}</button>`;
            }
            btnsHtml += `<button class="bag_btn_danger" onclick="UtilsItem.discardItem(${idx})">丢弃</button>`;
        }

        // 2. 在装备栏中查看
        else if (context.type === 'equip') {
            const slotKey = context.key;
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleUnequipAction('${slotKey}')">卸下</button>`;
            btnsHtml += `<button class="bag_btn_danger" onclick="UIBag.discardEquippedItem('${slotKey}')">丢弃</button>`;
        }

        // 3. 【新增】在消耗品栏中查看
        else if (context.type === 'consumable') {
            const slotIdx = context.index;
            // 解除携带
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable(${slotIdx})">解除携带</button>`;

            // 尝试添加“服用”按钮 (需找到背包索引)
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

    // === 功能函数 ===

    equipConsumable: function(itemId) {
        const p = window.player;
        if (!p.consumables) p.consumables = [null, null, null];

        const emptyIdx = p.consumables.indexOf(null);
        if (emptyIdx === -1) {
            if(window.showToast) window.showToast("随身位已满，请先取下其他丹药");
            return;
        }

        p.consumables[emptyIdx] = itemId;

        if(window.showToast) window.showToast("已放入随身快捷栏");
        if(window.saveGame) window.saveGame();

        this.refresh();

        // 重新渲染详情页
        const slotIdx = p.inventory.findIndex(s => s.id === itemId);
        if(slotIdx !== -1) {
            const item = GAME_DB.items.find(i => i.id === itemId);
            // 这里重新调用 renderDetail，上下文仍保持为 'bag' 视角
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

        // 刷新详情页视角
        const bagIdx = p.inventory.findIndex(s => s.id === itemId);
        if(bagIdx !== -1) {
            const item = GAME_DB.items.find(i => i.id === itemId);
            // 变回背包视角
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
        const content = `
        <div style="text-align:center; padding:20px 10px;">
            <div style="font-size:18px; margin-bottom:10px; font-family:Kaiti;">
                确定要直接丢弃身上的这件装备吗？
            </div>
            <div style="font-size:14px; color:#a94442;">( 丢弃后将无法找回 )</div>
        </div>
    `;
        const footer = `
        <button class="bag_btn_action" style="margin-right:10px;" onclick="window.closeModal()">取消</button>
        <button class="bag_btn_danger" onclick="UIBag._doDiscardEquip('${slotKey}')">确认丢弃</button>
    `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, content, footer, "modal_equip_discard", 40, 30);
        }
    },

    _doDiscardEquip: function(slotKey) {
        window.closeModal(); // 关闭确认小窗

        player.equipment[slotKey] = null;

        if(window.recalcStats) window.recalcStats();
        if(window.updateUI) window.updateUI();

        if (window.showToast) window.showToast("装备已移除并丢弃");

        // 原地刷新行囊顶部的装备格
        this.refresh();
    }
};

window.refreshBagUI = () => UIBag.refresh();
function openBag() { UIBag.open(); }