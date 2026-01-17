// js/modules/ui_bag.js - 背包界面 (性能优化版)
// 优化内容：
// 1. Grid 渲染改用 HTML 字符串拼接
// 2. 引入事件委托处理背包格子点击
// 3. 详情页渲染优化

const UIBag = {
    // 状态管理
    selectionMode: false,
    selectedIndices: new Set(),
    selectedIndex: -1, // 【新增】记录当前点中的物品索引

    open: function() {
        this.selectionMode = false;
        this.selectedIndices.clear();
        this.selectedIndex = -1; // 【新增】打开时重置选中状态
        this.showModal();
        // --- 修改部分开始 ---
        // 检查并触发背包引导
        if (window.UITutorial && window.UITutorial.checkBuilding) {
            // 这里复用 checkBuilding 逻辑，传入 'bag' 标识
            window.UITutorial.checkBuilding('bag');
        }
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
        if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_bag", 68, 80);

        // 绑定背包格子的事件委托
        this._bindGridEvents();

        this.refresh();
    },

    // 【新增】事件委托：处理背包格子的点击
    // 【新增】事件委托：处理背包格子的点击
    _bindGridEvents: function() {
        setTimeout(() => {
            const container = document.getElementById('bag_grid_content');
            if (!container) return;

            container.onclick = (e) => {
                const itemEl = e.target.closest('.bag_grid_item');
                if (!itemEl) return;

                const index = parseInt(itemEl.dataset.index);
                if (isNaN(index)) return;

                if (this.selectionMode) {
                    this.toggleItemSelection(index);
                } else {
                    // 【新增】处理选中高亮逻辑
                    this.selectedIndex = index; // 记录当前索引

                    // 移除其他格子的 active_item 样式
                    const allItems = container.querySelectorAll('.bag_grid_item');
                    allItems.forEach(el => el.classList.remove('active_item'));

                    // 给当前点击的格子添加 active_item 样式
                    itemEl.classList.add('active_item');

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
            <button class="bag_btn_action" style="color:#181815; border-color:#111111;" onclick="UIBag.showAttrHelp()">❓️属性详解</button>
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
        // 获取当前格子的物品数据
        const item = player.inventory[index];
        if (!item || !item.sid) return;

        const sid = item.sid;
        if (this.selectedIndices.has(sid)) {
            this.selectedIndices.delete(sid);
        } else {
            this.selectedIndices.add(sid);
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
            // 此时 this.selectedIndices 里面存的全是 sid 了
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
                const item = p.equipment[slot.key];


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

            p.consumables.forEach((sid, idx) => {
                const item = sid ? p.inventory.find(i => i.sid === sid) : null;

                if(item === null || item === undefined){
                    p.consumables[idx]=null;
                }
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
            const item = player.inventory.find(i => i.id === slot.id);
            if (!item) return '';

            const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
            const rarityColor = (window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#333';
            const sid = slot.sid;
            const isSelected = this.selectedIndices.has(sid) ? 'selected' : '';

            // 【新增】判断是否是当前查看的详情项
            const isActive = (!this.selectionMode && index === this.selectedIndex) ? 'active_item' : '';

            const isConsumableEquipped = player.consumables && player.consumables.includes(item.id);
            const markHtml = isConsumableEquipped ? `<div style="position:absolute;top:2px;left:2px;font-size:10px;background:#4caf50;color:#fff;padding:1px 3px;border-radius:2px;">配</div>` : '';

            // 【修改】在 class 中加入 ${isActive}
            return `
                <div class="bag_grid_item ${isSelected} ${isActive}" data-index="${index}" style="border-color:${rarityColor}">
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
        const item = player.inventory[index];

        if(item) {
            this.renderDetail(item, { type: 'bag', index: index });
        }
    },

    // 显示装备详情
    showEquippedDetail: function(slotKey) {
        const item = player.equipment[slotKey];

        this.renderDetail(item, { type: 'equip', key: slotKey });
    },

    showConsumableDetail: function(index) {
        const sid = player.consumables[index];
        const item=player.inventory.find(i => i.sid === sid)
        this.renderDetail(item, { type: 'consumable', index: index });
    },


    // 统一渲染详情页 (V3.1 - 大字体/深色字/左侧百分比)
    // 统一渲染详情页 (V3.2 - 加入 combatType 显示)
    renderDetail: function(item, context) {
        if (!item) return;
        const container = document.getElementById('bag_detail_panel');
        if (!container) return;

        // --- 1. 基础配置与名称处理 ---
        const globalTypeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};

        // 类型显示逻辑：优先 subType
        let displayType = item.subType || globalTypeMap[item.type] || item.type || "物品";

        // 【新增】战斗风格显示逻辑
        let combatTypeHtml = '';
        if (item.combatType) {
            // 使用暗金色 (#b8860b) 高亮显示，字号保持 16px
            combatTypeHtml = ` <span style="color:#b8860b; font-weight:bold; margin-left:4px;">[${item.combatType}]</span>`;
        }

        const rarityInfo = (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG[item.rarity] : null) || {color:'#333', name:'普通'};
        const mapping = window.ATTR_MAPPING || {};
        const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';

        let typeSuffix = '';
        if (context.type === 'equip') typeSuffix = '<span style="font-size:16px; margin-left:5px;">(已装备)</span>';
        if (context.type === 'consumable') typeSuffix = '<span style="font-size:16px; margin-left:5px;">(已携带)</span>';

        // --- 2. 属性渲染准备 ---
        let statsRows = [];

        // 耐久度
        if (item.durability !== undefined) {
            statsRows.push(`<div style="color:#795548; font-size:16px; margin-bottom:2px;">🛡 耐久: ${item.durability}</div>`);
        }

        // 属性排序优先级
        const attrPriority = [
            'phy_atk', 'mag_atk',
            'sharpness', 'penetration',
            'crit', 'mag_crit', 'critRate',
            'speed',
            'phy_def', 'mag_def', 'def',
            'hp', 'mp', 'hpMax', 'mpMax'
        ];

        const effects = item.effects || item.stats || item.param;

        if (effects) {
            // 筛选非0且非排除的key
            let keys = Object.keys(effects).filter(k => {
                let v = effects[k];
                return v !== 0 && k !== 'max_skill_level';
            });

            // 排序
            keys.sort((a, b) => {
                let idxA = attrPriority.indexOf(a);
                let idxB = attrPriority.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });

            // 遍历渲染
            keys.forEach(key => {
                const val = effects[key];

                // A. 特殊 Buff 对象
                if (typeof val === 'object' && val.attr && val.val) {
                    const buffAttrs = String(val.attr).split('_');
                    const buffVals = String(val.val).split('_');
                    const days = val.days ? `(${val.days}天)` : '';
                    buffAttrs.forEach((attrKey, bIdx) => {
                        const name = mapping[attrKey] || attrKey;
                        let currentVal = buffVals[bIdx] !== undefined ? buffVals[bIdx] : buffVals[0];
                        const sign = parseFloat(currentVal) > 0 ? "+" : "";
                        statsRows.push(`<div style="font-size:16px; line-height:1.2; color:#2196f3; margin-bottom:1px;">🧪 临时${name}: ${sign}${currentVal} ${days}</div>`);
                    });
                    return;
                }

                // B. 数值属性
                if (typeof val === 'number') {
                    let name = mapping[key] || key;
                    const sign = val > 0 ? "+" : "";
                    const color = val > 0 ? '#4caf50' : '#f44336';

                    let p_icon = '✨';
                    if(['phy_atk', 'mag_atk', 'atk'].includes(key)) p_icon = '⚔️';
                    if(['phy_def', 'mag_def', 'def', 'plate', 'heavy', 'light', 'leather', 'cloth'].includes(key)) p_icon = '🛡️';
                    if(['crit', 'mag_crit', 'critRate'].includes(key)) p_icon = '🎯';
                    if(['speed'].includes(key)) p_icon = '🏃';
                    if(['penetration'].includes(key)) p_icon = '🔱';
                    if(['sharpness'].includes(key)) p_icon = '🔪';
                    if(['hpMax', 'hp_max', 'max_hp', 'hp'].includes(key)) p_icon = '❤️';
                    if(['mpMax', 'mp_max', 'mp'].includes(key)) p_icon = '🌀';
                    if(['luck'].includes(key)) p_icon = '🍀';
                    if(['toxicity'].includes(key)) p_icon = '☠️';

                    // 穿透百分比显示在左侧名字里
                    if (key === 'sharpness' || key === 'penetration') {
                        const pct = Math.floor((1 - (100 / (100 + val))) * 100);
                        name += ` <span style="font-size:14px; color:#888;">(穿透${pct}%)</span>`;
                    }

                    statsRows.push(`
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.3; margin-bottom:1px;">
                            <span style="color:#4d4343;">${p_icon} ${name}</span>
                            <span style="color:${color}; font-weight:bold;">${sign}${val}</span>
                        </div>
                    `);
                }
            });
        }

        // --- 4. 功法书籍逻辑 ---
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
            <div style="border-top:1px dashed #444; margin-top:6px; padding-top:6px;">
                <div style="font-size:16px;">📚 状态: <span style="color:${statusColor}">${statusText}</span></div>
                <div style="font-size:16px; color:#4d4343; margin-top:1px;">
                    累计进度: <span style="color:#4d4343">${curVal}</span> / <span style="color:#666">${maxVal}</span>
                </div>
            </div>`);
        }

        // 组合属性HTML
        const statsHtml = statsRows.length > 0 ?
            `<div class="bag_detail_stats" style="margin-top:8px; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:4px; border:1px solid #444;">${statsRows.join('')}</div>` : '';

        // --- 5. 装备要求 ---
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

                reqList.push(`
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.2; margin-bottom:1px; color:${isMet ? '#4d4343' : '#d9534f'};">
                        <span>${attrName}要求</span>
                        <span>${isMet ? `已达标` : `${myVal}/${reqVal}`} ${statusIcon}</span>
                    </div>`);
            }
            if (reqList.length > 0) {
                reqHtml = `<div class="bag_detail_req" style="margin:8px 0; padding:6px 8px; background:rgba(0,0,0,0.1); border:1px dashed #555; border-radius:4px;">
                    <div style="font-weight:bold; color:#777; margin-bottom:3px; font-size:16px;">▼ 穿戴条件</div>
                    ${reqList.join('')}
                </div>`;
            }
        }

        // --- 6. 描述 ---
        const descText = item.desc || "此物平平无奇。";
        const descHtml = `<div class="bag_detail_desc" style="margin-top:8px; color:#4d4343; font-size:16px; line-height:1.4; border-top:1px solid #444; padding-top:8px;">${descText}</div>`;

        // --- 7. 价格 ---
        let priceHtml = '';
        const price = (item.value !== undefined) ? item.value : item.price;
        if (price !== undefined) {
            priceHtml = `<div style="margin-top:10px; text-align:right; color:#d4af37; font-weight:bold; font-size:16px;">💰 价值: ${price.toLocaleString()}</div>`;
        }

        // --- 8. 按钮 ---
        let btnsHtml = `<div class="bag_detail_actions" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">`;
        const sid = item.sid;
        if (context.type === 'bag') {
            if (['weapon','head','body','feet','mount','fishing_rod','tool'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleEquipAction('${sid}', '${item.type}')">装备</button>`;
            } else if (item.type === 'pill') {
                const carriedIndex = window.player.consumables ? window.player.consumables.indexOf(item.sid) : -1;
                if (carriedIndex !== -1) btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable(${carriedIndex})">解除</button>`;
                else btnsHtml += `<button class="bag_btn_action" onclick="UIBag.equipConsumable('${sid}')">携带</button>`;
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem('${sid}')">服用</button>`;
            } else if (item.type === 'book') {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.lockStudyTarget('${item.id}')">设为研读</button>`;
            } else if (['food','foodMaterial','herb','fish'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem('${sid}')">使用</button>`;
            }
            btnsHtml += `<button class="bag_btn_danger" onclick="UtilsItem.removeItem('${sid}')">丢弃</button>`;
        } else if (context.type === 'equip') {
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleUnequipAction('${context.key}')">卸下</button>`;
        } else if (context.type === 'consumable') {
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable('${context.index}')">解除</button>`;
        }
        btnsHtml += `</div>`;

        // --- 9. 最终渲染 ---
        container.innerHTML = `
            <div class="bag_detail_header" style="color:${rarityInfo.color}; border-bottom:2px solid ${rarityInfo.color}33; padding-bottom:4px; margin-bottom:4px;">
                <span style="font-size:20px; font-weight:bold;">${icon} ${item.name}</span>
                <span class="ink_tag" style="background:${rarityInfo.color}; color:#fff; font-size:12px; padding:1px 5px; border-radius:3px; float:right; margin-top:4px;">${rarityInfo.name}</span>
            </div>
            <div class="bag_detail_type" style="color:#666; font-size:16px; margin-bottom:4px;">${displayType}${combatTypeHtml} ${typeSuffix}</div>
            ${statsHtml}
            ${reqHtml}  
            ${descHtml}
            ${priceHtml}
            ${btnsHtml}
        `;
    },

    equipConsumable: function(sid) {
        const p = window.player;
        if (!p.consumables) p.consumables = [null, null, null];
        const emptyIdx = p.consumables.indexOf(null);
        if (emptyIdx === -1) { if(window.showToast) window.showToast("随身位已满"); return; }
        p.consumables[emptyIdx] = sid;
        if(window.showToast) window.showToast("已放入随身快捷栏");
        if(window.saveGame) window.saveGame();
        this.refresh();
        const slotIdx = p.inventory.findIndex(s => s.sid === sid);
        if(slotIdx !== -1) {
            const item = p.inventory.find(s => s.sid === sid);
            this.renderDetail(item, { type: 'bag', index: slotIdx });
        }
    },

    unequipConsumable: function(slotIndex) {
        const p = window.player;
        if (!p.consumables || !p.consumables[slotIndex]) return;
        const sid = p.consumables[slotIndex];
        p.consumables[slotIndex] = null;
        if(window.showToast) window.showToast("已取消携带");
        if(window.saveGame) window.saveGame();
        this.refresh();
        const bagIdx = p.inventory.findIndex(s => s.id === sid);
        if(bagIdx !== -1) {
            const item = p.inventory.find(i => i.id === sid);
            this.renderDetail(item, { type: 'bag', index: bagIdx });
        } else {
            const container = document.getElementById('bag_detail_panel');
            if(container) container.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">已从快捷栏移除</div>';
        }
    },

    handleEquipAction: function(sid, itemType) {
        const slotKey = UtilsItem.getEquipSlot(itemType);
        UtilsItem.equipItem(sid);
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
        const content = `<div style="text-align:center; padding:20px 10px;"><div style="font-size:18px; margin-bottom:10px; font-family:Kaiti;">确定要直接丢弃身上的这件装备吗？</div><div style="font-size:16px; color:#a94442;">( 丢弃后将无法找回 )</div></div>`;
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
// --- 属性详解弹窗逻辑 ---

    // --- 属性详解弹窗逻辑 (V2.0 - 清晰大屏版) ---
    showAttrHelp: function() {
        // 1. 数据定义：整合了子类说明 (subs)
        const armorHeaders = ['板甲', '重甲', '轻甲', '皮甲', '布甲', '无甲'];
        const combatData = [
            {
                name: '轻盈 Agile',
                subs: '匕、手戟、吴钩、奇门',
                desc: '定位：物理暴击，低伤高频',
                vals: [0.6, 0.8, 1.0, 1.1, 1.3, 1.5]
            },
            {
                name: '均衡 Bal',
                subs: '剑、刀、铍',
                desc: '定位：属性平均，稳定输出',
                vals: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3]
            },
            {
                name: '长兵 Reach',
                subs: '矛、戈、戟、长铩',
                desc: '定位：物理压制，自带防御',
                vals: [0.9, 1.0, 1.1, 1.1, 1.0, 1.2]
            },
            {
                name: '重型 Heavy',
                subs: '钺、斧、椎、殳',
                desc: '定位：牺牲速度，追求破甲',
                vals: [1.3, 1.2, 1.1, 0.9, 0.7, 1.1]
            },
            {
                name: '远射 Range',
                subs: '弩、弓',
                desc: '定位：远程打击，面板压制',
                vals: [0.7, 0.8, 1.0, 1.2, 1.4, 1.5]
            },
            {
                name: '法宝 Relic',
                subs: '飞剑、法印、宝葫芦、阵盘、灵镜、长幡、玉佩',
                desc: '定位：灵力穿透，专克凡铁',
                vals: [1.1, 1.0, 0.9, 0.8, 0.6, 1.2]
            }
        ];

        const weaponStats = [
            { cat: '轻盈', items: [
                    {n:'匕', atk:0.5, crit:2.5, spd:'+2.0', pen:1.2, req:'精2 神8'},
                    {n:'手戟', atk:0.7, crit:1.6, spd:'+1.2', pen:1.0, req:'精4 神6'},
                    {n:'吴钩', atk:0.75, crit:1.4, spd:'+0.8', pen:1.1, req:'精5 神5'},
                    {n:'奇门', atk:0.6, crit:2.0, spd:'+1.5', pen:0.8, req:'精3 神7'}
                ]},
            { cat: '均衡', items: [
                    {n:'剑', atk:1.0, crit:1.1, spd:'0.0', pen:1.0, req:'精5 神5'},
                    {n:'刀', atk:1.15, crit:0.9, spd:'-0.5', pen:1.1, req:'精7 神3'},
                    {n:'铍', atk:1.2, crit:0.8, spd:'-0.8', pen:1.2, req:'精6 神4'}
                ]},
            { cat: '长兵', items: [
                    {n:'矛', atk:1.25, crit:0.8, spd:'-1.0', pen:1.2, req:'精6 神4'},
                    {n:'戈', atk:1.30, crit:0.7, spd:'-1.2', pen:0.9, req:'精7 神3'},
                    {n:'戟', atk:1.40, crit:0.6, spd:'-1.5', pen:1.1, req:'精6 神4'},
                    {n:'长铩', atk:1.45, crit:0.5, spd:'-1.8', pen:1.0, req:'精8 神2'}
                ]},
            { cat: '重型', items: [
                    {n:'钺', atk:1.60, crit:0.4, spd:'-2.2', pen:0.8, req:'精9 神1'},
                    {n:'斧', atk:1.65, crit:0.3, spd:'-2.5', pen:0.9, req:'精8 神2'},
                    {n:'椎', atk:1.85, crit:0.0, spd:'-3.5', pen:0.4, req:'精10'},
                    {n:'殳', atk:1.55, crit:0.5, spd:'-2.0', pen:0.5, req:'精8 神2'}
                ]},
            { cat: '远射', items: [
                    {n:'弩', atk:1.35, crit:1.0, spd:'-2.0', pen:0, req:'精3 神7'},
                    {n:'弓', atk:1.05, crit:1.5, spd:'-0.5', pen:0, req:'精5 神5'}
                ]},
            { cat: '法宝', items: [
                    {n:'飞剑', atk:1.0, crit:1.2, spd:'+1.2', pen:1.3, req:'精1 气6 神3'},
                    {n:'法印', atk:1.6, crit:0.5, spd:'-3.0', pen:1.1, req:'精4 气5 神1'},
                    {n:'宝葫芦', atk:0.95, crit:1.0, spd:'0.0', pen:1.4, req:'精2 气7 神1'},
                    {n:'阵盘', atk:1.1, crit:1.4, spd:'-1.5', pen:1.9, req:'精1 气4 神5'},
                    {n:'灵镜', atk:1.2, crit:1.8, spd:'-0.5', pen:0.9, req:'精1 气3 神6'},
                    {n:'长幡', atk:1.3, crit:0.8, spd:'-1.2', pen:1.2, req:'精2 气7 神1'},
                    {n:'玉佩', atk:0.65, crit:2.2, spd:'+2.5', pen:0.8, req:'气4 神6'}
                ]}
        ];

        // 2. 样式定义 (大字体/高对比/简洁)
        // 斑马纹背景色
        const bgEven = 'rgba(255,255,255,0.03)';
        const bgOdd = 'rgba(0,0,0,0.2)';
        // 边框色
        const borderC = '#555';

        const css = {
            table: `width:100%; border-collapse:collapse; font-size:18px; color:#ddd; line-height:1.6;`,
            th: `padding:15px 10px; border-bottom:2px solid ${borderC}; background:#333; color:#fff; font-weight:bold; text-align:center; font-size:20px;`,
            td: `padding:12px 10px; border-bottom:1px solid ${borderC}; text-align:center;`,
            tdLeft: `padding:12px 15px; border-bottom:1px solid ${borderC}; text-align:left; vertical-align:middle;`,
            subText: `display:block; font-size:16px; color:#999; margin-top:4px; font-weight:normal;`, // 子类字体
            high: `color:#81c784; font-weight:bold; font-size:20px;`, // 优势 (浅绿)
            low:  `color:#e57373; font-weight:bold; font-size:20px;`, // 劣势 (浅红)
            mid:  `color:#aaa; font-size:18px;`  // 普通 (灰)
        };

        // 3. 构建 Tab 1 HTML (战斗克制)
        let tab1Html = `
            <table style="${css.table}">
                <thead>
                    <tr>
                        <th style="${css.th} width:25%;">模组类型</th>
                        ${armorHeaders.map(h => `<th style="${css.th}">${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${combatData.map((row, idx) => {
            const bg = idx % 2 === 0 ? bgEven : bgOdd;
            return `
                        <tr style="background:${bg}">
                            <td style="${css.tdLeft}">
                                <div style="color:#ffa726; font-weight:bold; font-size:20px;">${row.name}</div>
                                <div style="${css.subText}">包含：${row.subs}</div>
                                <div style="${css.subText} color:#666;">${row.desc}</div>
                            </td>
                            ${row.vals.map(v => {
                let style = css.mid;
                if (v > 1.0) style = css.high;
                if (v < 1.0) style = css.low;
                return `<td style="${css.td} ${style}">${v}</td>`;
            }).join('')}
                        </tr>`;
        }).join('')}
                </tbody>
            </table>
            <div style="margin-top:15px; font-size:16px; color:#888; text-align:right;">* 数值代表实际伤害倍率 (1.0 为标准伤害，数值越大效果越好)</div>
        `;

        // 4. 构建 Tab 2 HTML (兵器特性)
        let tab2Html = `
            <table style="${css.table}">
                <thead>
                    <tr>
                        <th style="${css.th}">大类</th>
                        <th style="${css.th}">子类</th>
                        <th style="${css.th}">攻击系数</th>
                        <th style="${css.th}">暴击系数</th>
                        <th style="${css.th}">速度补正</th>
                        <th style="${css.th}">穿透系数</th>
                      
                    </tr>
                </thead>
                <tbody>
                    ${weaponStats.map((cat, cIdx) => {
            return cat.items.map((item, idx) => {
                // 给大类合并单元格，并加深背景色
                const bg = cIdx % 2 === 0 ? bgEven : bgOdd;
                let catCell = '';
                if (idx === 0) {
                    catCell = `<td rowspan="${cat.items.length}" style="${css.td} background:rgba(0,0,0,0.4); font-weight:bold; color:#ffa726; font-size:22px; writing-mode:vertical-lr; letter-spacing:5px;">${cat.cat}</td>`;
                }

                // 速度颜色处理
                let spdColor = css.mid;
                if (parseFloat(item.spd) > 0) spdColor = css.high;
                if (parseFloat(item.spd) < 0) spdColor = css.low;

                return `
                            <tr style="background:${bg}">
                                ${catCell}
                                <td style="${css.td} color:#fff; font-weight:bold;">${item.n}</td>
                                <td style="${css.td}">${item.atk}</td>
                                <td style="${css.td}">${item.crit}</td>
                                <td style="${css.td} ${spdColor}">${item.spd}</td>
                                <td style="${css.td}">${item.pen}</td>
                             
                            </tr>
                            `;
            }).join('');
        }).join('')}
                </tbody>
            </table>
        `;

        // 5. 弹窗整体结构 (Tabs)
        const content = `
            <div class="bag_help_container" style="height:100%; display:flex; flex-direction:column; background:#1a1a1a;">
                <div style="display:flex; border-bottom:2px solid #444; margin-bottom:0;">
                    <div id="tab_btn_1" onclick="UIBag._switchHelpTab(1)" style="flex:1; text-align:center; padding:15px; cursor:pointer; background:#333; color:#fff; font-weight:bold; font-size:20px; transition:0.2s;">⚔️ 战斗克制系数</div>
                    <div id="tab_btn_2" onclick="UIBag._switchHelpTab(2)" style="flex:1; text-align:center; padding:15px; cursor:pointer; background:#111; color:#888; font-size:20px; transition:0.2s;">📊 兵器特性详解</div>
                </div>
                <div style="flex:1; overflow-y:auto; padding:20px;">
                    <div id="tab_content_1" style="display:block;">${tab1Html}</div>
                    <div id="tab_content_2" style="display:none;">${tab2Html}</div>
                </div>
            </div>
        `;

        // 6. 调用弹窗 (宽70, 高70)
        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal("天道法则 · 器物篇", content, null, "modal_attr_help", 70, 70);
        }
    },

    // 切换标签页 (配套样式修改)
    _switchHelpTab: function(tabId) {
        const btn1 = document.getElementById('tab_btn_1');
        const btn2 = document.getElementById('tab_btn_2');
        const content1 = document.getElementById('tab_content_1');
        const content2 = document.getElementById('tab_content_2');

        const activeStyle = "background:#333; color:#fff; font-weight:bold;";
        const inactiveStyle = "background:#111; color:#888; font-weight:normal;";

        if (tabId === 1) {
            btn1.style.cssText += activeStyle;
            btn2.style.cssText += inactiveStyle;
            content1.style.display = 'block';
            content2.style.display = 'none';
        } else {
            btn1.style.cssText += inactiveStyle;
            btn2.style.cssText += activeStyle;
            content1.style.display = 'none';
            content2.style.display = 'block';
        }
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