/**
 * js/modules/ui_cook.js
 * 烹饪 UI 模块 - 纯净水墨交互版
 */
const UICook = {
    selectedMaterials: [], // 当前选中的物品对象(含sid)
    currentCookType: "Boiling",

    open: function() {
        if (!player.cooking_info) player.cooking_info = [];
        this.showModal();
    },

    showModal: function() {
        const cookTypes = [
            { id: "Boiling", name: "水煮" },
            { id: "Sauteing", name: "煎炒" },
            { id: "Roasting", name: "火烤" },
            { id: "Frying", name: "油炸" }
        ];

        const contentHtml = `
            <div class="ink_cook_root">
                <div class="ink_cook_upper">
                    <div class="ink_preview_section">
                        <div class="ink_sub_title">▷ 预估所得</div>
                        <div id="ink_result_card" class="ink_result_frame">
                            <span class="ink_hint_text">投料入鼎，定火候</span>
                        </div>
                        <div class="ink_method_tabs">
                            ${cookTypes.map(t => `
                                <button class="ink_tab ${t.id === this.currentCookType ? 'active' : ''}" 
                                        onclick="UICook.switchMethod('${t.id}', this)">
                                    ${t.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="ink_pot_section">
                        <div class="ink_sub_title">▷ 鼎内余存 (<span id="ink_pot_num">0</span>/5)</div>
                        <div id="ink_pot_inventory" class="ink_pot_list"></div>
                        <button class="ink_btn_execute" onclick="UICook.onCookClick()">起 锅</button>
                    </div>
                </div>

                <div class="ink_cook_lower">
                    <div class="ink_sub_title">▷ 备选食材</div>
                    <div class="ink_scroll_area">
                        <div id="ink_mat_grid" class="ink_grid"></div>
                    </div>
                </div>
            </div>
        `;

        if (window.UtilsModal) {
            UtilsModal.showInteractiveModal("灶前参悟", contentHtml, null, "modal_cook", 800, 800);
        }
        this._applyInkStyles();
        this.fullRefresh();
    },

    switchMethod: function(type, btn) {
        this.currentCookType = type;
        document.querySelectorAll('.ink_tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateResultPreview();
    },

    handleToggle: function(sid) {
        const idx = this.selectedMaterials.findIndex(m => m.sid === sid);
        if (idx > -1) {
            this.selectedMaterials.splice(idx, 1);
        } else {
            if (this.selectedMaterials.length >= 5) return;
            const item = player.inventory.find(i => i.sid === sid);
            if (item) this.selectedMaterials.push(item);
        }
        this.fullRefresh();
    },

    fullRefresh: function() {
        this.renderMaterialGrid();
        this.renderPotList();
        this.updateResultPreview();
    },

    renderMaterialGrid: function() {
        const grid = document.getElementById('ink_mat_grid');
        if (!grid) return;
        const list = player.inventory.filter(item =>
            item.type === 'foodMaterial' || item.subType === 'fooding' || item.subType === 'flavoring'
        );
        grid.innerHTML = list.map(item => {
            const isSelected = this.selectedMaterials.some(m => m.sid === item.sid);
            return `
                <div class="ink_grid_item ${isSelected ? 'selected' : ''}" onclick="UICook.handleToggle('${item.sid}')">
                    ${isSelected ? '<div class="ink_corner_mark"></div>' : ''}
                    <div class="ink_mat_icon">${item.icon || '📦'}</div>
                    <div class="ink_mat_name">${item.name}</div>
                    <div class="ink_mat_stock">存:${item.count}</div>
                </div>
            `;
        }).join('');
    },

    renderPotList: function() {
        const pot = document.getElementById('ink_pot_inventory');
        document.getElementById('ink_pot_num').innerText = this.selectedMaterials.length;
        pot.innerHTML = this.selectedMaterials.map(m => `
            <div class="ink_pot_wrapper">
                <div class="ink_pot_circle" onclick="UICook.handleToggle('${m.sid}')">
                    ${m.icon || '🍙'}
                    <div class="ink_pot_del">×</div>
                </div>
                <div class="ink_pot_text">${m.name}</div>
            </div>
        `).join('');
    },

    updateResultPreview: function() {
        const frame = document.getElementById('ink_result_card');
        const res = window.UtilCook.getMatchResult(this.selectedMaterials, this.currentCookType);

        if (!res) {
            frame.innerHTML = `<span class="ink_hint_text">投料入鼎，定火候</span>`;
            return;
        }

        if (!res.isRecipe) {
            frame.innerHTML = `
                <div class="ink_res_item">
                    <span class="ink_res_ico">🥣</span>
                    <div class="ink_res_info">
                        <div class="ink_res_name">${res.name}</div>
                        <div class="ink_res_desc">乱炖而成的粗食</div>
                    </div>
                </div>
            `;
        } else {
            const hasLearned = player.cooking_info.includes(res.id);
            if (hasLearned) {
                frame.innerHTML = `
                    <div class="ink_res_item" onmouseover="UICook.showDetail('${res.id}', event)">
                        <span class="ink_res_ico">🍖</span>
                        <div class="ink_res_info">
                            <div class="ink_res_name">${res.name}</div>
                            <div class="ink_res_desc">已参透此中滋味</div>
                        </div>
                    </div>
                `;
            } else {
                frame.innerHTML = `
                    <div class="ink_res_item unknown">
                        <span class="ink_res_ico">？</span>
                        <div class="ink_res_info">
                            <div class="ink_res_name">未知料理</div>
                            <div class="ink_res_desc">尚未尝试过此配方</div>
                        </div>
                    </div>
                `;
            }
        }
    },

    onCookClick: function() {
        const result = window.UtilCook.executeCook(this.selectedMaterials, this.currentCookType);
        if (result && result.success) {
            const food = result.food;
            this.selectedMaterials.forEach(m => window.UtilsItem.removeItem(m.sid, 1));
            window.UtilsItem.addItem(food.id, 1);
            if (!player.cooking_info.includes(food.id)) player.cooking_info.push(food.id);
            if (window.showToast) window.showToast(`「${food.name}」已出锅`);

            // 关键逻辑：用完的材料从鼎内移除
            this.selectedMaterials = this.selectedMaterials.filter(m => {
                const inv = player.inventory.find(slot => slot.sid === m.sid);
                return inv && inv.count > 0;
            });

            // 联动刷新：重新计算网格、鼎内列表和最重要的预览
            this.fullRefresh();
        }
    },

    showDetail: function(id, e) {
        const item = foods.find(f => f.id === id);
        if (item && window.UtilsTip) window.UtilsTip.show(item, e);
    },

    _applyInkStyles: function() {
        if (document.getElementById('ink_pure_style')) return;
        const style = document.createElement('style');
        style.id = 'ink_pure_style';

        document.head.appendChild(style);
    }
};

window.UICook = UICook;