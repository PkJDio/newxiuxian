// js/modules/ui_bag.js
// 背包界面 (Refactored with HTML <template>)

const UIBag = {
    // --- 状态管理 ---
    selectionMode: false,
    selectedIndices: new Set(),
    selectedIndex: -1,      // 当前选中的背包格子索引
    activeEquipSlot: null,  // 当前选中的装备槽位 (如 'weapon')

    // --- 1. 模板初始化 (核心改动) ---
    _initTemplates: function() {
        // 防止重复注入
        if (document.getElementById('tpl_bag_layout')) return;

        const templates = `
            <template id="tpl_bag_layout">
                <div class="bag_container">
                    <div id="bag_equipment_row" class="bag_equipment_row"></div>
                    <div id="bag_toolbar_container" class="bag_toolbar"></div>
                    <div class="bag_main_area">
                        <div class="bag_grid_scroll">
                            <div id="bag_grid_content" class="bag_grid_content"></div>
                        </div>
                        <div id="bag_detail_panel" class="bag_detail_panel">
                            <div class="bag_empty_tip" style="color:#999; text-align:center; margin-top:50px;">点击物品查看详情</div>
                        </div>
                    </div>
                </div>
            </template>

            <template id="tpl_bag_equip_slot">
                <div class="bag_equip_wrapper">
                    <div class="bag_equip_slot">
                        <div class="bag_equip_icon"></div>
                    </div>
                    <div class="bag_equip_label"></div>
                </div>
            </template>

            <template id="tpl_bag_grid_item">
                <div class="bag_grid_item">
                    <div class="bag_check_mark" style="display:none;">✔</div>
                    <div class="bag_grid_icon"></div>
                    <div class="bag_grid_name"></div>
                    <div class="bag_item_count"></div>
                    <div class="bag_marks_container"></div> </div>
            </template>
            
            <template id="tpl_bag_detail">
                <div class="bag_detail_header" style="border-bottom:2px solid #333; padding-bottom:4px; margin-bottom:4px;">
                    <span class="detail_title" style="font-size:20px; font-weight:bold;"></span>
                    <span class="detail_tag ink_tag" style="color:#fff; font-size:12px; padding:1px 5px; border-radius:3px; float:right; margin-top:4px;"></span>
                </div>
                <div class="detail_type_row" style="color:#666; font-size:16px; margin-bottom:4px;"></div>
                
                <div class="detail_stats_container"></div> 
                
                <div class="detail_req_container"></div>   
                
                <div class="detail_desc" style="margin-top:8px; color:#4d4343; font-size:16px; line-height:1.4; border-top:1px solid #444; padding-top:8px;"></div>
                <div class="detail_price" style="margin-top:10px; text-align:right; color:#d4af37; font-weight:bold; font-size:16px;"></div>
                
                <div class="detail_actions" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;"></div>
            </template>
        `;
        document.body.insertAdjacentHTML('beforeend', templates);
    },

    // --- 2. 核心方法 ---
    open: function() {
        this._initTemplates(); // 确保模板存在
        this.selectionMode = false;
        this.selectedIndices.clear();
        this.selectedIndex = -1;
        this.activeEquipSlot = null; // 重置焦点
        this.showModal();

        // 引导检测
        if (window.UITutorial && window.UITutorial.checkBuilding) {
            window.UITutorial.checkBuilding('bag');
        }
    },

    showModal: function() {
        const title = "修仙行囊";

        // 从模板生成主 HTML
        const tpl = document.getElementById('tpl_bag_layout');
        const clone = tpl.content.cloneNode(true);
        // showGeneralModal 通常需要字符串，所以我们用一个临时 div 包裹获取 innerHTML
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(clone);
        const contentHtml = tempDiv.innerHTML;

        if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_bag", 68, 80);

        this._bindGridEvents();
        this.refresh();
    },

    // 事件委托：处理格子点击
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
                    // 切换焦点到背包格子
                    this.selectedIndex = index;
                    this.activeEquipSlot = null; // 清除装备槽选中状态
                    this.refresh(); // 刷新以更新高亮和详情
                }
            };
        }, 0);
    },

    // 全局刷新逻辑
    refresh: function() {
        const p = window.player;
        if (!p) return;

        this.renderToolbar();
        this.renderEquipRow();
        this.renderGrid();

        // 根据当前焦点状态，自动刷新详情页
        if (this.activeEquipSlot) {
            const item = p.equipment[this.activeEquipSlot];
            if (item) {
                this.renderDetail(item, { type: 'equip', key: this.activeEquipSlot });
            } else {
                this.activeEquipSlot = null;
                this._clearDetail();
            }
        }
        else if (this.selectedIndex !== -1) {
            const item = p.inventory[this.selectedIndex];
            if (item) {
                this.renderDetail(item, { type: 'bag', index: this.selectedIndex });
            } else {
                this.selectedIndex = -1;
                this._clearDetail();
            }
        }
    },

    _clearDetail: function() {
        const panel = document.getElementById('bag_detail_panel');
        if (panel) panel.innerHTML = '<div style="color:#999; text-align:center; margin-top:50px;">点击物品查看详情</div>';
    },

    // --- 3. 渲染顶部装备栏 (Template Refactor) ---
    renderEquipRow: function() {
        const equipRow = document.getElementById('bag_equipment_row');
        if (!equipRow) return;

        const p = window.player;
        const slots = [
            { key: 'weapon', label: '兵器', defaultIcon: '⚔️' },
            { key: 'head',   label: '头部', defaultIcon: '🧢' },
            { key: 'body',   label: '身体', defaultIcon: '👕' },
            { key: 'feet',   label: '足部', defaultIcon: '👢' },
            { key: 'mount',  label: '坐骑', defaultIcon: '🐎' },
            { key: 'fishing_rod', label: '钓具', defaultIcon: '🎣' }
        ];

        equipRow.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const tpl = document.getElementById('tpl_bag_equip_slot');

        // A. 渲染固定装备槽
        slots.forEach(slot => {
            const item = p.equipment[slot.key];
            const clone = tpl.content.cloneNode(true);

            const wrapper = clone.querySelector('.bag_equip_wrapper');
            const slotEl = clone.querySelector('.bag_equip_slot');
            const iconEl = clone.querySelector('.bag_equip_icon');
            const labelEl = clone.querySelector('.bag_equip_label');

            let icon = slot.defaultIcon;
            let borderColor = '#ccc';

            if (item) {
                icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || icon;
                const qualityColor = (window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#ddd';
                borderColor = qualityColor;
                slotEl.classList.add('active');
            }

            // 高亮判断
            if (this.activeEquipSlot === slot.key) {
                borderColor = '#ff9800';
                slotEl.classList.add('active_slot_highlight');
                slotEl.style.boxShadow = '0 0 8px rgba(255,152,0,0.5)';
                slotEl.style.borderWidth = '2px';
            }

            slotEl.style.borderColor = borderColor;
            iconEl.innerHTML = icon;

            labelEl.textContent = item ? item.name : slot.label;
            labelEl.style.color = item ? borderColor : '#999';

            // 绑定事件
            wrapper.onclick = () => UIBag.selectEquipSlot(slot.key);

            fragment.appendChild(clone);
        });

        // B. 渲染间隔符
        const spacer = document.createElement('div');
        spacer.className = 'bag_equip_spacer';
        fragment.appendChild(spacer);

        // C. 渲染快捷栏
        if (!p.consumables) p.consumables = [null, null, null];
        p.consumables.forEach((sid, idx) => {
            const item = sid ? p.inventory.find(i => i.sid === sid) : null;
            if(!item && sid) p.consumables[idx] = null; // 修正无效数据

            const clone = tpl.content.cloneNode(true);
            const wrapper = clone.querySelector('.bag_equip_wrapper');
            const slotEl = clone.querySelector('.bag_equip_slot');
            const iconEl = clone.querySelector('.bag_equip_icon');
            const labelEl = clone.querySelector('.bag_equip_label');

            slotEl.classList.add('slot_consumable');

            let iconStr = '<span style="opacity:0.2; font-size:24px;">💊</span>';
            if (item) {
                slotEl.classList.add('has_item');
                iconStr = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '💊';
            }

            iconEl.innerHTML = iconStr;
            labelEl.textContent = item ? item.name : `快捷${idx + 1}`;

            wrapper.onclick = () => UIBag.showConsumableDetail(idx);
            fragment.appendChild(clone);
        });

        equipRow.appendChild(fragment);
        if (window.twemoji) window.parseEmoji(equipRow);
    },

    selectEquipSlot: function(slotKey) {
        const item = window.player.equipment[slotKey];
        if (!item) return;
        this.activeEquipSlot = slotKey;
        this.selectedIndex = -1;
        this.refresh();
    },

    // --- 4. 渲染背包网格 (Template Refactor) ---
    renderGrid: function() {
        const container = document.getElementById('bag_grid_content');
        if (!container) return;

        if (!player.inventory || player.inventory.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#999;padding:50px;font-family:Kaiti;">🍃 行囊空空如也</div>`;
            return;
        }

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const tpl = document.getElementById('tpl_bag_grid_item');

        player.inventory.forEach((slot, index) => {
            const item = player.inventory.find(i => i.id === slot.id);
            if (!item) return;

            const clone = tpl.content.cloneNode(true);
            const itemDiv = clone.querySelector('.bag_grid_item');
            const checkMark = clone.querySelector('.bag_check_mark');
            const iconDiv = clone.querySelector('.bag_grid_icon');
            const nameDiv = clone.querySelector('.bag_grid_name');
            const countDiv = clone.querySelector('.bag_item_count');
            const marksContainer = clone.querySelector('.bag_marks_container');

            // 基础数据
            const rarityColor = (window.RARITY_CONFIG && RARITY_CONFIG[item.rarity]) ? RARITY_CONFIG[item.rarity].color : '#333';
            itemDiv.style.borderColor = rarityColor;
            itemDiv.dataset.index = index;

            // 选中状态判断
            const isSelected = this.selectedIndices.has(slot.sid);

            // 选中状态样式 (边框高亮等)
            if (isSelected) itemDiv.classList.add('selected');

            // 高亮状态 (详情页焦点)
            const isActive = (!this.selectionMode && index === this.selectedIndex && !this.activeEquipSlot);
            if (isActive) itemDiv.classList.add('active_item');

            // === 【修改点】勾选标记显示逻辑 ===
            // 原逻辑：if (this.selectionMode) checkMark.style.display = 'block';
            // 新逻辑：仅在 (开启批量模式 且 当前物品被选中) 时才显示勾
            if (this.selectionMode && isSelected) {
                checkMark.style.display = 'block';
            } else {
                checkMark.style.display = 'none';
            }
            // =================================

            // 图标与名字
            const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
            iconDiv.innerHTML = icon;
            nameDiv.textContent = item.name;
            nameDiv.style.color = rarityColor;
            countDiv.textContent = slot.count;

            // 额外标记 (配/轮回)
            let markHtml = '';
            const isConsumableEquipped = player.consumables && player.consumables.includes(item.id);
            if (isConsumableEquipped) {
                markHtml += `<div style="position:absolute;top:2px;left:2px;font-size:10px;background:#4caf50;color:#fff;padding:1px 3px;border-radius:2px;">配</div>`;
            }
            if (item.samsaraItem) {
                markHtml += `<div style="position:absolute;top:2px;left:2px;font-size:12px;color:#9c27b0;line-height:1;text-shadow:1px 1px 0 #fff;z-index:5;" title="轮回物品">☯️</div>`;
            }
            marksContainer.innerHTML = markHtml;

            fragment.appendChild(clone);
        });

        container.appendChild(fragment);
        if (window.twemoji) window.parseEmoji(container);
    },

    // --- 详情显示 Wrapper 方法 ---
    renderDetailFromBag: function(index) {
        const item = player.inventory[index];
        if(item) this.renderDetail(item, { type: 'bag', index: index });
    },

    showEquippedDetail: function(slotKey) {
        const item = player.equipment[slotKey];
        this.renderDetail(item, { type: 'equip', key: slotKey });
    },

    showConsumableDetail: function(index) {
        const sid = player.consumables[index];
        const item = player.inventory.find(i => i.sid === sid);
        this.renderDetail(item, { type: 'consumable', index: index });
    },


    // --- 5. 详情渲染核心 (Hybrid: Template结构 + String内容) ---
    renderDetail: function(item, context) {
        if (!item) return;
        const container = document.getElementById('bag_detail_panel');
        if (!container) return;

        // A. 准备 Template
        const tpl = document.getElementById('tpl_bag_detail');
        const clone = tpl.content.cloneNode(true);

        // B. 填充头部
        const rarityInfo = (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG[item.rarity] : null) || {color:'#333', name:'普通'};
        const headerDiv = clone.querySelector('.bag_detail_header');
        headerDiv.style.color = rarityInfo.color;
        headerDiv.style.borderColor = rarityInfo.color + '33';

        const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
        const samsaraMark = item.samsaraItem ? `<span style="color:#9c27b0; font-size:18px; margin-left:6px; vertical-align:middle; text-shadow:0 0 2px rgba(156,39,176,0.3);" title="轮回物品">☯️</span>` : '';

        // 【修改点1】标题增加强化等级显示 (+X)
        let levelStr = "";
        if (item.level && item.level > 0) {
            levelStr = ` <span style="color:#ffd740; font-weight:bold; text-shadow:1px 1px 0 #000; font-size:18px;">+${item.level}</span>`;
        }
        clone.querySelector('.detail_title').innerHTML = `${icon} ${item.name}${levelStr}${samsaraMark}`;

        const tagEl = clone.querySelector('.detail_tag');
        tagEl.style.background = rarityInfo.color;
        tagEl.textContent = rarityInfo.name;

        // C. 类型行
        const globalTypeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
        let displayType = item.type === "weapon" ? item.subType : (globalTypeMap[item.type] || item.subType || item.type || "物品");
        let combatTypeHtml = item.combatType ? ` <span style="color:#b8860b; font-weight:bold; margin-left:4px;">[${item.combatType}]</span>` : '';

        let typeSuffix = '';
        if (context.type === 'equip') typeSuffix = '<span style="font-size:16px; margin-left:5px;">(已装备)</span>';
        if (context.type === 'consumable') typeSuffix = '<span style="font-size:16px; margin-left:5px;">(已携带)</span>';

        clone.querySelector('.detail_type_row').innerHTML = `${displayType}${combatTypeHtml} ${typeSuffix}`;

        // D. 属性计算
        let statsRows = [];
        if (item.durability !== undefined) {
            statsRows.push(`<div style="color:#795548; font-size:16px; margin-bottom:2px;">🛡 耐久: ${item.durability}</div>`);
        }

        const effects = item.effects || item.stats || item.param;
        const mapping = window.ATTR_MAPPING || {};

        if (effects) {
            const attrPriority = ['phy_atk', 'mag_atk', 'sharpness', 'penetration', 'crit', 'mag_crit', 'critRate', 'speed', 'phy_def', 'mag_def', 'def', 'hp', 'mp', 'hpMax', 'mpMax'];
            let keys = Object.keys(effects).filter(k => effects[k] !== 0 && k !== 'max_skill_level');

            keys.sort((a, b) => {
                let idxA = attrPriority.indexOf(a);
                let idxB = attrPriority.indexOf(b);
                if (idxA === -1) idxA = 999; if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });

            keys.forEach(key => {
                const val = effects[key];

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

                if (typeof val === 'number') {
                    let name = mapping[key] || key;
                    const sign = val > 0 ? "+" : "";
                    const color = val > 0 ? '#4caf50' : '#f44336';

                    let p_icon = '✨';
                    if(key.includes('atk')) p_icon='⚔️';
                    else if(key.includes('def')) p_icon='🛡️';
                    else if(key.includes('hp')) p_icon='❤️';
                    else if(key.includes('mp')) p_icon='🌀';
                    else if(key.includes('speed')) p_icon='🏃';
                    else if(key.includes('crit')) p_icon='🎯';

                    if (key === 'sharpness' || key === 'penetration') {
                        const pct = Math.floor((1 - (100 / (100 + val))) * 100);
                        name += ` <span style="font-size:14px; color:#888;">(穿透${pct}%)</span>`;
                    }
                    statsRows.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.3; margin-bottom:1px;"><span style="color:#4d4343;">${p_icon} ${name}</span><span style="color:${color}; font-weight:bold;">${sign}${val}</span></div>`);
                }
            });
        }

        // 【修改点2】插入强化属性显示 (Ex Stats)
        if (item.level > 0) {
            const exColor = "#f9a825"; // 强化属性使用亮橙金色
            // 武器强化
            if (item.exPhyAtk) statsRows.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.3; margin-bottom:1px;"><span style="color:#795548;">🔨 强化攻击</span><span style="color:${exColor}; font-weight:bold;">+${item.exPhyAtk}</span></div>`);
            // 为了避免重复显示，如果法攻和物攻数值一样且都是武器，通常只显示一次或分开显示，这里分开显示最清晰
            if (item.exMagAtk) statsRows.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.3; margin-bottom:1px;"><span style="color:#795548;">⚡ 强化法攻</span><span style="color:${exColor}; font-weight:bold;">+${item.exMagAtk}</span></div>`);

            // 防具强化
            if (item.exPhyDef) statsRows.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.3; margin-bottom:1px;"><span style="color:#795548;">🛡 强化防御</span><span style="color:${exColor}; font-weight:bold;">+${item.exPhyDef}</span></div>`);
            if (item.exMagDef) statsRows.push(`<div style="display:flex; justify-content:space-between; align-items:center; font-size:16px; line-height:1.3; margin-bottom:1px;"><span style="color:#795548;">🔮 强化法防</span><span style="color:${exColor}; font-weight:bold;">+${item.exMagDef}</span></div>`);
        }

        // 词条显示逻辑
        let entriesHtml = '';
        if (['weapon','head','body','feet','fishing_rod'].includes(item.type) && item.entries && item.entries.length > 0 && window.ENTRY_DB) {
            let entryListHtml = '';
            item.entries.forEach(entry => {
                const def = window.ENTRY_DB[entry.id];
                if (!def) return;

                let valStr = "";
                if (entry.val !== undefined) {
                    valStr = ` <span style="font-weight:bold; margin-left:2px;">${entry.val > 0 ? '+' : ''}${entry.val}${def.unit || ''}</span>`;
                }

                const baseColor = def.color || '#b39ddb';
                const icon = def.icon || '◆';

                entryListHtml += `
                <div style="
                    display: flex;
                    align-items: center;
                    border: 1px solid ${baseColor}4d; 
                    background: ${baseColor}1a;      
                    border-radius: 4px; 
                    padding: 3px 8px; 
                    color: ${baseColor}; 
                    font-size: 13px; 
                    cursor: help; 
                    transition: all 0.2s;"
                    onmouseenter="window.showEntryTooltip(event, '${entry.id}', ${entry.val})"
                    onmouseleave="window.hideTooltip()"
                    onmousemove="window.moveTooltip(event)"
                    onmouseover="this.style.background='${baseColor}33'; this.style.borderColor='${baseColor}';"
                    onmouseout="this.style.background='${baseColor}1a'; this.style.borderColor='${baseColor}4d';"
                >
                    <span style="margin-right:4px; opacity:0.8;">${icon}</span>
                    <span>${def.name}</span>
                    ${valStr}
                </div>`;
            });

            if (entryListHtml) {
                entriesHtml = `
                <div class="bag_detail_entries" style="margin-top:8px; display:flex; flex-wrap:wrap; gap:6px;">
                    ${entryListHtml}
                </div>`;
            }
        }

        // 注入属性容器
        const statsContainer = clone.querySelector('.detail_stats_container');
        if (statsRows.length > 0 || entriesHtml) {
            statsContainer.style.cssText = "margin-top:8px; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:4px; border:1px solid #444;";
            statsContainer.innerHTML = statsRows.join('') + (entriesHtml ? (statsRows.length > 0 ? '<div style="margin:6px 0 6px 0; border-top:1px dashed #555;"></div>' : '') + entriesHtml : '');
        } else {
            statsContainer.style.display = 'none';
        }

        // E. 穿戴条件
        let reqList = [];
        if (item.req) {
            const currentStats = window.player.derived || window.player.attr || {};
            for (let key in item.req) {
                const reqVal = item.req[key];
                const myVal = currentStats[key] || 0;
                const isMet = myVal >= reqVal;
                const attrName = mapping[key] || key;
                const statusIcon = isMet ? '✅' : '🚫';
                reqList.push(`<div style="display:flex; justify-content:space-between; color:${isMet ? '#4d4343' : '#d9534f'}; font-size:15px;"><span>${attrName}</span><span>${myVal}/${reqVal} ${statusIcon}</span></div>`);
            }
        }

        const reqContainer = clone.querySelector('.detail_req_container');
        if (reqList.length > 0) {
            reqContainer.innerHTML = `<div style="font-weight:bold; color:#777; font-size:15px; margin-bottom:3px;">▼ 穿戴条件</div>${reqList.join('')}`;
            reqContainer.style.cssText = "margin:8px 0; padding:6px 8px; background:rgba(0,0,0,0.1); border:1px dashed #555; border-radius:4px;";
        } else {
            reqContainer.style.display = 'none';
        }

        // F. 描述与价格
        clone.querySelector('.detail_desc').innerHTML = item.desc || "此物平平无奇。";
        const price = (item.value !== undefined) ? item.value : item.price;
        if (price !== undefined) {
            clone.querySelector('.detail_price').innerHTML = `💰 价值: ${price.toLocaleString()}`;
        } else {
            clone.querySelector('.detail_price').style.display = 'none';
        }

        // G. 按钮组
        let btnsHtml = '';
        const sid = item.sid;

        if (context.type === 'bag') {
            if (['weapon','head','body','feet','mount','fishing_rod','tool'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleEquipAction('${sid}', '${item.type}')">装备</button>`;
            } else if (item.type === 'pill') {
                const carriedIndex = window.player.consumables ? window.player.consumables.indexOf(item.sid) : -1;
                if (carriedIndex !== -1) btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable(${carriedIndex})">解除</button>`;
                else btnsHtml += `<button class="bag_btn_action" onclick="UIBag.equipConsumable('${sid}')">携带</button>`;
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem('${sid}')">服用</button>`;
            } else if (['food','foodMaterial','herb','fish'].includes(item.type)) {
                btnsHtml += `<button class="bag_btn_action" onclick="UtilsItem.useItem('${sid}')">使用</button>`;
            } else if (item.type === 'book') {
                btnsHtml += `<button class="bag_btn_action" onclick="UIBag.lockStudyTarget('${item.id}')">设为研读</button>`;
            }
            btnsHtml += `<button class="bag_btn_danger" onclick="UtilsItem.removeItem('${sid}')">丢弃</button>`;
        }
        else if (context.type === 'equip') {
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.handleUnequipAction('${context.key}')">卸下</button>`;
        }
        else if (context.type === 'consumable') {
            btnsHtml += `<button class="bag_btn_action" onclick="UIBag.unequipConsumable('${context.index}')">解除</button>`;
        }

        clone.querySelector('.detail_actions').innerHTML = btnsHtml;

        // 渲染到主容器
        container.innerHTML = '';
        container.appendChild(clone);

        if (window.twemoji) {
            window.parseEmoji(container);
        }
    },

    // --- 装备操作 (自动切换焦点) ---
    handleEquipAction: function(sid, itemType) {
        const slotKey = UtilsItem.getEquipSlot(itemType);
        UtilsItem.equipItem(sid);

        // 焦点切换至装备栏
        this.activeEquipSlot = slotKey;
        this.selectedIndex = -1;
        this.refresh();

        if(window.showToast) window.showToast("已装备");
    },

    handleUnequipAction: function(slotKey) {
        const itemId = window.player.equipment[slotKey];
        if (!itemId) return;

        UtilsItem.unequipItem(slotKey);

        // 焦点尝试切回背包中该物品
        const bagIndex = window.player.inventory.findIndex(s => s.id === itemId);
        this.activeEquipSlot = null;
        if (bagIndex !== -1) this.selectedIndex = bagIndex;

        this.refresh();
        if(window.showToast) window.showToast("已卸下");
    },

    // --- 快捷栏操作 ---
    equipConsumable: function(sid) {
        const p = window.player;
        if (!p.consumables) p.consumables = [null,null,null];
        const idx = p.consumables.indexOf(null);
        if(idx === -1) { if(window.showToast) window.showToast("随身位已满"); return; }

        p.consumables[idx] = sid;
        if(window.saveGame) window.saveGame();
        this.refresh();

        if(window.showToast) window.showToast("已放入随身快捷栏");
        // 保持背包焦点，更新按钮状态
        if(this.selectedIndex !== -1) this.renderDetailFromBag(this.selectedIndex);
    },

    unequipConsumable: function(idx) {
        const p = window.player;
        if (!p.consumables) return;

        const sid = p.consumables[idx];
        p.consumables[idx] = null;
        if(window.saveGame) window.saveGame();
        this.refresh();

        if(window.showToast) window.showToast("已取消携带");
        // 如果是从背包详情点的解除，需要刷新详情页按钮
        if(this.selectedIndex !== -1) {
            const item = p.inventory[this.selectedIndex];
            if(item && item.sid === sid) this.renderDetailFromBag(this.selectedIndex);
        }
    },

    // --- 辅助功能 ---
    renderToolbar: function() {
        const container = document.getElementById('bag_toolbar_container');
        if (!container) return;

        let html = '';

        // 1. 获取容量数据
        const p = window.player;
        const currentCount = p.inventory ? p.inventory.length : 0;
        // 获取上限，优先读 derived.space，没有则默认 50
        const maxSpace = (p.derived && p.derived.space) ? p.derived.space : 50;

        // 2. 样式处理：满了变红，没满显示绿色或深色
        const countColor = currentCount >= maxSpace ? '#d32f2f' : '#333';

        // 3. 构建容量显示 HTML (使用 flex:1 占据左侧空间)
        const spaceInfoHtml = `
            <div style="flex:1; display:flex; align-items:center; font-family:'KaiTi'; font-size:16px; color:#5d4037;">
                <span style="font-weight:bold; margin-right:4px;">🎒 容量:</span>
                <span style="color:${countColor}; font-weight:bold;">${currentCount} / ${maxSpace}</span>
            </div>
        `;

        if (this.selectionMode) {
            const count = this.selectedIndices.size;
            // 批量模式：左侧显示已选数量
            html = `<div class="bag_text_info" style="flex:1; font-weight:bold; color:#a94442;">● 已选: ${count}</div>
                    <button class="bag_btn_action" onclick="UIBag.exitSelectionMode()">取消</button>
                    <button class="bag_btn_danger" onclick="UIBag.confirmBatchDiscard()">确认丢弃</button>`;
        } else {
            // 正常模式：左侧显示容量，右侧显示按钮
            html = spaceInfoHtml +
                `<button class="bag_btn_action" onclick="UtilsItem.sortInventory();UIBag.refresh()">整理</button>
                    <button class="bag_btn_action" onclick="UIBag.enterSelectionMode()">批量丢弃</button>
                    <button class="bag_btn_action" style="color:#181815; border-color:#111111;" onclick="UIBag.showAttrHelp()">❓️属性详解</button>`;
        }

        container.innerHTML = html;
    },

    enterSelectionMode: function() {
        this.selectionMode = true;
        this.selectedIndices.clear();
        this.refresh();
        const p = document.getElementById('bag_detail_panel');
        if(p) p.innerHTML = '<div style="color:#a94442; text-align:center; margin-top:50px; font-weight:bold;">请点击左侧物品勾选<br>再次点击取消勾选</div>';
    },

    exitSelectionMode: function() {
        this.selectionMode = false;
        this.selectedIndices.clear();
        this.refresh();
        this._clearDetail();
    },

    toggleItemSelection: function(index) {
        const item = window.player.inventory[index];
        if (!item) return;
        if (this.selectedIndices.has(item.sid)) this.selectedIndices.delete(item.sid);
        else this.selectedIndices.add(item.sid);
        this.refresh();
    },

    confirmBatchDiscard: function() {
        if (this.selectedIndices.size === 0) { if(window.showToast) window.showToast("未选择任何物品"); return; }
        const count = this.selectedIndices.size;
        if (window.UtilsModal) window.UtilsModal.showInteractiveModal("批量处理", `<div style="text-align:center; padding:10px;">确定要丢弃选中的 <b style="color:#d32f2f;">${count}</b> 件物品吗？</div>`, `<button class="bag_btn_action" onclick="window.closeModal()">取消</button><button class="bag_btn_danger" onclick="UIBag._doBatchDiscard()">确认</button>`, "modal_batch", 40, 30);
    },

    _doBatchDiscard: function() {
        window.closeModal();
        if (window.UtilsItem) UtilsItem.discardMultipleItems(this.selectedIndices);
        this.exitSelectionMode();
        if(window.showToast) window.showToast("已处理");
    },

    lockStudyTarget: function(id) {
        window.player.currentStudyTarget = id;
        if(window.showToast) window.showToast("已设为研读目标");
        window.closeModal();
    },

    showAttrHelp: function() {
        if(window.TooltipManager && TooltipManager.showAttrHelp) TooltipManager.showAttrHelp();
    },

    _switchHelpTab: function(tabId) {
        const btn1 = document.getElementById('tab_btn_1');
        const btn2 = document.getElementById('tab_btn_2');
        const content1 = document.getElementById('tab_content_1');
        const content2 = document.getElementById('tab_content_2');
        if(!btn1 || !content1) return;

        const activeStyle = "background:#333; color:#fff; font-weight:bold;";
        const inactiveStyle = "background:#111; color:#888; font-weight:normal;";

        if (tabId === 1) {
            btn1.style.cssText += activeStyle; btn2.style.cssText += inactiveStyle;
            content1.style.display = 'block'; content2.style.display = 'none';
        } else {
            btn1.style.cssText += inactiveStyle; btn2.style.cssText += activeStyle;
            content1.style.display = 'none'; content2.style.display = 'block';
        }
    }
};

// 挂载全局对象
window.UIBag = UIBag;
window.refreshBagUI = () => UIBag.refresh();
window.openBag = () => UIBag.open();