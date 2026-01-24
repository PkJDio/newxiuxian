/**
 * js/modules/ui_cook.js
 * 烹饪 UI 模块 - 完整版 (图鉴 + 一键放入 + 灵感提示优化)
 */
let UICook = {
    selectedMaterials: [],
    currentCookType: "Boiling",
    _boundKeyHandler: null,

    open: function() {
        if (!player.cooking_info) player.cooking_info = [];
        this.showModal();

        // --- 绑定键盘事件 (E键触发一键放入) ---
        if (!this._boundKeyHandler) {
            this._boundKeyHandler = (e) => {
                if ((e.key === 'e' || e.key === 'E')) {
                    const btn = document.getElementById('ink_btn_onekey');
                    if (btn && !btn.disabled && btn.style.display !== 'none') {
                        this.onOneKeyAdd();
                    }
                }
            };
            document.addEventListener('keydown', this._boundKeyHandler);
        }
    },

    showModal: function() {
        const cookTypes = [
            { id: "Boiling", name: "水煮" },
            { id: "Sauteing", name: "煎炒" },
            { id: "Roasting", name: "火烤" },
            { id: "Frying", name: "油炸" }
        ];

        // --- 获取新版数据 ---
        let level = 0, exp = 0, realmName = "未入门", maxExp = 100;
        if (window.UtilsLifeSkills) {
            const skill = UtilsLifeSkills.getSkillData('cooking');
            level = skill.level;
            exp = skill.exp;
            maxExp = UtilsLifeSkills.getNextLevelExp(level);
            const realmNames = ["初窥门径", "略有小成", "融会贯通", "登峰造极", "返璞归真"];
            const idx = Math.min(Math.floor(level / 3), realmNames.length - 1);
            realmName = realmNames[idx];
        }
        const expStr = (level >= 10) ? "已臻化境" : `${exp} / ${maxExp}`;

        // --- Tab 按钮 ---
        const tabsHtml = cookTypes.map(t => `
            <button id="btn_method_${t.id}" class="ink_tab ${t.id === this.currentCookType ? 'active' : ''}" 
                    onclick="UICook.switchMethod('${t.id}', this)">
                ${t.name}
            </button>
        `).join('') + `
            <button id="ink_btn_onekey" class="ink_tab" style="margin-left:12px; border-style:dashed; opacity:0.5; cursor:not-allowed;" disabled onclick="UICook.onOneKeyAdd()">
                一键放入(E)
            </button>
        `;

        const contentHtml = `
            <div class="ink_cook_root">
                <div class="ink_cook_header" style="display:flex; justify-content:space-between; align-items:center; padding:12px 25px; background:rgba(0,0,0,0.03); border-bottom:1px solid #ddd;">
                    <div>
                        <span style="color:#5d4037;">境界：<b style="color:#d84315;">Lv.${level} ${realmName}</b></span>
                        <span style="color:#5d4037; margin-left:15px;">技艺熟练：<b style="color:#d84315;">${expStr}</b></span>
                    </div>
                    <button class="ink_btn_gallery" onclick="UICook.showRecipeGallery()">📖 料理图鉴</button>
                </div>

                <div class="ink_cook_upper">
                    <div class="ink_preview_section">
                        <div class="ink_sub_title">▷ 预估所得</div>
                        <div id="ink_result_card" class="ink_result_frame">
                            <span class="ink_hint_text">投料入鼎，定火候</span>
                        </div>
                        <div class="ink_method_tabs">
                            ${tabsHtml}
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
            UtilsModal.showInteractiveModal("灶前参悟", contentHtml, null, "modal_cook", 68, 95);
        }
        this._applyInkStyles();
        this.fullRefresh();
    },

    showRecipeGallery: function() {
        if (typeof foods === 'undefined') {
            if(window.showToast) window.showToast("图鉴数据未加载");
            return;
        }

        const list = foods.filter(f => f.obtain === "craft");
        const qualityColors = ["#9e9e9e", "#388e3c", "#1976d2", "#7b1fa2", "#e65100", "#d32f2f"];

        const gridHtml = list.map(f => {
            const isUnlocked = player.cooking_info && player.cooking_info.includes(f.id);
            const icon = isUnlocked ? (f.icon || '🍲') : '<span style="font-size:32px; font-weight:bold;">?</span>';
            const name = isUnlocked ? f.name : '???';

            let nameColor = "#999";
            let bgStyle = "background:#f5f5f5; color:#aaa;";
            let cursor = "cursor:default;";

            if (isUnlocked) {
                const q = f.quality || 0;
                nameColor = qualityColors[q] || qualityColors[0];
                bgStyle = "background:#fff;";
                cursor = "cursor:pointer;";
            }

            const events = isUnlocked
                ? `onmouseover="if(window.showRecipeTooltip) window.showRecipeTooltip(event, '${f.id}')" onmouseout="if(window.hideTooltip) window.hideTooltip()"`
                : '';

            return `
                <div class="ink_gallery_card" style="${bgStyle} ${cursor}" ${events}>
                    <div class="ink_gallery_icon" style="${isUnlocked?'':'opacity:0.5;'}">${icon}</div>
                    <div class="ink_gallery_name" style="color:${nameColor};">${name}</div>
                </div>
            `;
        }).join('');

        const content = `
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; padding:10px; max-height:60vh; overflow-y:auto;">
                ${gridHtml}
            </div>
        `;

        if (window.UtilsModal) {
            UtilsModal.showInteractiveModal("料理图鉴", content, null, "modal_gallery", 60, 70);
        }
    },

    switchMethod: function(type, btn) {
        this.currentCookType = type;
        document.querySelectorAll('.ink_tab').forEach(b => b.classList.remove('active'));
        if (!btn) btn = document.getElementById('btn_method_' + type);
        if (btn) btn.classList.add('active');
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
        this.updateHeaderInfo();
    },

    onOneKeyAdd: function() {
        const hint = window.UtilCook.getRecipeHint(this.selectedMaterials);
        if (!hint) return;
        const neededIds = hint.recipe[0];
        const newSelection = [];
        for (let id of neededIds) {
            const item = player.inventory.find(i => i.id === id && i.count > 0);
            if (item) {
                newSelection.push(item);
            } else {
                if(window.showToast) window.showToast("材料不足，无法一键放入");
                return;
            }
        }
        this.selectedMaterials = newSelection;
        if (this.currentCookType !== hint.cookType) {
            this.switchMethod(hint.cookType);
        } else {
            this.fullRefresh();
        }
    },

    updateHeaderInfo: function() {
        const header = document.querySelector('.ink_cook_header');
        if (!header || !window.UtilsLifeSkills) return;

        const skill = UtilsLifeSkills.getSkillData('cooking');
        const maxExp = UtilsLifeSkills.getNextLevelExp(skill.level);
        const realmNames = ["初窥门径", "略有小成", "融会贯通", "登峰造极", "返璞归真"];
        const idx = Math.min(Math.floor(skill.level / 3), realmNames.length - 1);
        const realmName = realmNames[idx];
        const expStr = (skill.level >= 10) ? "已臻化境" : `${skill.exp} / ${maxExp}`;

        const bTags = header.querySelectorAll('b');
        if (bTags.length >= 2) {
            bTags[0].innerText = `Lv.${skill.level} ${realmName}`;
            bTags[1].innerText = expStr;
        } else {
            header.innerHTML = `
                <div>
                    <span style="color:#5d4037;">境界：<b style="color:#d84315;">Lv.${skill.level} ${realmName}</b></span>
                    <span style="color:#5d4037; margin-left:15px;">技艺熟练：<b style="color:#d84315;">${expStr}</b></span>
                </div>
                <button class="ink_btn_gallery" onclick="UICook.showRecipeGallery()">📖 料理图鉴</button>
            `;
        }
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
                    <div class="ink_mat_icon">${item.icon || '🌾'}</div>
                    <div class="ink_mat_name">${item.name}</div>
                    <div class="ink_mat_stock">存:${item.count}</div>
                </div>
            `;
        }).join('');
        if (window.twemoji) {
            window.twemoji.parse(grid);
        }
    },

    renderPotList: function() {
        const pot = document.getElementById('ink_pot_inventory');
        if (!pot) return;
        document.getElementById('ink_pot_num').innerText = this.selectedMaterials.length;
        pot.innerHTML = this.selectedMaterials.map(m => `
            <div class="ink_pot_wrapper">
                <div class="ink_pot_circle" onclick="UICook.handleToggle('${m.sid}')">
                    ${m.icon || '🌾'}
                    <div class="ink_pot_del">×</div>
                </div>
                <div class="ink_pot_text">${m.name}</div>
            </div>
        `).join('');
        if (window.twemoji) {
            window.twemoji.parse(pot);
        }
    },

    // --- 【关键修改】更新预览逻辑：增加“背包有货”样式 ---
    updateResultPreview: function() {
        const frame = document.getElementById('ink_result_card');
        if (!frame) return;

        const res = window.UtilCook.getMatchResult(this.selectedMaterials, this.currentCookType);
        const hintRecipe = window.UtilCook.getRecipeHint(this.selectedMaterials);

        this.checkAndToggleOneKeyBtn(hintRecipe);

        // --- 左侧 HTML ---
        let leftHtml = "";
        const unknownBoxStyle = `width:80px;height:80px;border:2px dashed #ccc;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff;color:#ccc;font-size:40px;margin-right:15px;`;
        const knownBoxStyle = `width:80px;height:80px;border:1px solid #d7ccc8;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff;font-size:42px;margin-right:15px;box-shadow:0 2px 5px rgba(0,0,0,0.05);`;

        if (!res) {
            leftHtml = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#aaa;font-style:italic;font-size:20px;">请投料入鼎</div>`;
        } else if (!res.isRecipe) {
            leftHtml = `
                <div style="flex:1;display:flex;align-items:center;padding-left:15px;">
                    <div style="${unknownBoxStyle}">?</div>
                    <div>
                        <div style="font-weight:bold;color:#666;font-size:22px;margin-bottom:6px;">${res.name}</div>
                        <div style="font-size:16px;color:#999;">尚未收录此配方</div>
                    </div>
                </div>`;
        } else {
            const hasLearned = player.cooking_info.includes(res.id);
            const iconHtml = hasLearned ? `<div style="${knownBoxStyle}">${res.icon || '🍲'}</div>` : `<div style="${unknownBoxStyle}">?</div>`;
            const nameHtml = hasLearned ? res.name : '未知料理';
            const descHtml = hasLearned ? '<span style="color:#4caf50;">✔ 已领悟</span>' : '<span style="color:#ff9800;">? 似曾相识</span>';

            leftHtml = `
                <div style="flex:1;display:flex;align-items:center;padding-left:15px;cursor:pointer;" 
                     onmouseover="${hasLearned ? `UICook.showDetail('${res.id}', event)` : ''}" 
                     onmouseleave="if(window.hideTooltip) window.hideTooltip()">
                    ${iconHtml}
                    <div>
                        <div style="font-weight:bold;color:#333;font-size:24px;margin-bottom:6px;">${nameHtml}</div>
                        <div style="font-size:16px;">${descHtml}</div>
                    </div>
                </div>`;
        }

        // --- 右侧 HTML (灵感) ---
        let rightHtml = "";
        if (hintRecipe && window.GAME_DB) {
            const recIds = hintRecipe.recipe[0];
            const materialsHtml = recIds.map(id => {
                const it = window.GAME_DB.items.find(i => i.id === id);
                const name = it ? it.name : '未知';
                const icon = it ? (it.icon || '🌾') : '🌾';

                // 状态检查
                const isSelected = this.selectedMaterials.some(m => m.id === id);
                // 检查背包是否有货 (id匹配且数量大于0)
                const hasStock = player.inventory.some(i => i.id === id && i.count > 0);

                let borderColor, bgColor, borderStyle, opacity, textColor;

                if (isSelected) {
                    // 已选中（绿色）
                    borderColor = '#8bc34a';
                    bgColor = '#f1f8e9';
                    borderStyle = 'solid';
                    opacity = 1;
                    textColor = '#33691e';
                } else if (hasStock) {
                    // 背包有货未选（淡蓝虚线）
                    borderColor = '#2d2d2d'; // 亮蓝边框
                    bgColor = '#fafafa';     // 淡蓝背景
                    borderStyle = 'solid';  // 虚线
                    opacity = 1;
                    textColor = '#2f2e2e';   // 深蓝文字
                } else {
                    // 无货（灰色）
                    borderColor = '#e0e0e0';
                    bgColor = '#fafafa';
                    borderStyle = 'solid';
                    opacity = 0.6;
                    textColor = '#999';
                }

                const cardStyle = `display:flex;flex-direction:column;align-items:center;justify-content:center;width:60px;height:72px;border:1px ${borderStyle} ${borderColor};background:${bgColor};border-radius:6px;margin-right:6px;opacity:${opacity};`;

                return `
                    <div style="${cardStyle}" title="${name} (${hasStock ? '有库存' : '未持有'})">
                        <div style="font-size:32px;margin-bottom:4px;">${icon}</div>
                        <div style="font-size:14px;color:${textColor};width:100%;text-align:center;overflow:hidden;white-space:nowrap;font-weight:bold;">${name}</div>
                    </div>
                `;
            }).join('<div style="color:#ccc;margin:0 4px;font-size:24px;">+</div>');

            const methodMap = { "Boiling": "水煮", "Sauteing": "煎炒", "Roasting": "火烤", "Frying": "油炸" };
            const methodStr = methodMap[hintRecipe.cookType] || hintRecipe.cookType;
            const isMethodCorrect = (this.currentCookType === hintRecipe.cookType);
            const methodStyle = `padding:4px 10px;border-radius:6px;font-size:16px;background:${isMethodCorrect?'#ffccbc':'#eee'};color:${isMethodCorrect?'#d84315':'#999'};border:1px solid ${isMethodCorrect?'#ffab91':'#ddd'};margin-left:8px;font-weight:bold;`;

            rightHtml = `
                <div class="ink_preview_right" style="flex:2;border-left:1px dashed #ccc;padding-left:15px;margin-left:10px;display:flex;flex-direction:column;justify-content:center;">
                    <div style="font-size:16px;color:#aaa;margin-bottom:8px;display:flex;justify-content:space-between;font-weight:bold;">
                        <span>💡 灵感推演</span>
                    </div>
                    <div style="display:flex;align-items:center;flex-wrap:wrap;">
                        ${materialsHtml}
                        <div style="${methodStyle}">[${methodStr}]</div>
                    </div>
                </div>
            `;
        } else {
            rightHtml = `
                <div class="ink_preview_right" style="flex:1.4;border-left:1px dashed #ccc;padding-left:15px;margin-left:10px;display:flex;align-items:center;justify-content:center;color:#ccc;font-size:20px;">
                    毫无头绪...
                </div>
            `;
        }
        frame.innerHTML = `<div style="display:flex;width:100%;height:100%;padding:5px;">${leftHtml}${rightHtml}</div>`;

        if (window.twemoji) {
            window.twemoji.parse(frame);
        }
    },

    checkAndToggleOneKeyBtn: function(hint) {
        const btn = document.getElementById('ink_btn_onekey');
        if (!btn) return;

        let canAdd = false;
        if (hint && hint.recipe && hint.recipe[0]) {
            const requiredIds = hint.recipe[0];
            const hasAll = requiredIds.every(reqId =>
                player.inventory.some(i => i.id === reqId && i.count > 0)
            );
            if (hasAll) canAdd = true;
        }

        if (canAdd) {
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.borderColor = "#d84315";
            btn.style.color = "#d84315";
            btn.style.cursor = "pointer";
        } else {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.style.borderColor = "#ccc";
            btn.style.color = "#999";
            btn.style.cursor = "not-allowed";
        }
    },

    onListOut: function(e) { if (typeof hideTooltip === 'function') hideTooltip(); },

    onCookClick: function() {
        const result = window.UtilCook.executeCook(this.selectedMaterials, this.currentCookType);
        if (result && result.success) {
            if (window.hideTooltip) window.hideTooltip();
            const food = result.food;
            const count = result.count;
            window.UtilsItem.addItem(food.id, count);
            if (!player.cooking_info.includes(food.id)) player.cooking_info.push(food.id);
            saveGame();
            if (window.showToast) window.showToast(`「${food.name}」x${count} 已出锅`);
            this.selectedMaterials = this.selectedMaterials.filter(m => {
                const inv = player.inventory.find(slot => slot.sid === m.sid);
                return inv && inv.count > 0;
            });
            this.fullRefresh();
        }
    },

    showDetail: function(id, e) {
        const item = foods.find(f => f.id === id);
        if (item && window.TooltipManager) window.TooltipManager.showShopItem(e, item.id);
    },

    _applyInkStyles: function() {
        if (document.getElementById('ink_pure_style')) return;
        const style = document.createElement('style');
        style.id = 'ink_pure_style';
        style.innerHTML = `
            .ink_cook_root { display: flex; flex-direction: column; height: 100%; font-family: "KaiTi", serif; }
            .ink_cook_header { font-size: 22px; line-height: 1.5; } 
            .ink_cook_upper { flex: 0 0 auto; display: flex; border-bottom: 1px dashed #ccc; padding: 12px; gap: 12px; background: #fffdfb; }
            .ink_preview_section { flex: 2; border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px; background: #fff; display: flex; flex-direction: column; }
            .ink_sub_title { font-size: 22px; color: #5d4037; margin-bottom: 10px; font-weight: bold; border-left: 4px solid #d84315; padding-left: 8px; line-height: 1; }
            .ink_result_frame { flex: 1; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; min-height: 90px; margin-bottom: 10px; border: 1px dashed #ddd; }
            .ink_hint_text { color: #bbb; letter-spacing: 2px; font-size: 20px; }
            .ink_method_tabs { display: flex; gap: 8px; justify-content: center; }
            .ink_tab { padding: 6px 16px; border: 1px solid #ccc; background: #fff; border-radius: 20px; cursor: pointer; color: #666; font-size: 18px; transition: all 0.2s; font-family: "KaiTi"; font-weight: bold; }
            .ink_tab.active { background: #5d4037; color: #fff; border-color: #5d4037; transform: scale(1.05); }
            .ink_pot_section { flex: 1; display: flex; flex-direction: column; }
            .ink_pot_list { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; align-content: center; justify-content: center; padding: 5px 0; }
            .ink_pot_wrapper { width: 60px; display: flex; flex-direction: column; align-items: center; }
            .ink_pot_circle { width: 42px; height: 42px; border-radius: 50%; border: 1px solid #d7ccc8; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background: #fff; font-size: 22px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .ink_pot_del { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; background: #e57373; color: #fff; font-size: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; display: none; }
            .ink_pot_circle:hover .ink_pot_del { display: flex; }
            .ink_pot_text { font-size: 16px; color: #555; margin-top: 2px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 100%; text-align: center; font-weight: bold; }
            .ink_btn_execute { margin-top: auto; background: #d84315; color: #fff; border: none; padding: 10px; border-radius: 6px; font-size: 22px; cursor: pointer; font-family: "KaiTi"; font-weight: bold; box-shadow: 0 2px 4px rgba(216, 67, 21, 0.3); transition: all 0.2s; }
            .ink_btn_execute:hover { background: #bf360c; transform: translateY(-1px); }
            .ink_cook_lower { flex: 1; display: flex; flex-direction: column; padding: 12px; background: #fdfbf7; overflow: hidden; }
            .ink_scroll_area { flex: 1; overflow-y: auto; padding-right: 5px; }
            .ink_grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
            .ink_grid_item { aspect-ratio: 1; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: all 0.1s; }
            .ink_grid_item:hover { border-color: #8d6e63; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .ink_grid_item.selected { border: 3px solid #5d4037; background: #fffefe; }
            .ink_corner_mark { position: absolute; top: 0; right: 0; width: 0; height: 0; border-top: 24px solid #5d4037; border-left: 24px solid transparent; border-top-right-radius: 6px; }
            .ink_corner_mark::after { content: "✓"; position: absolute; top: -22px; right: 2px; color: #fff; font-size: 14px; font-weight: bold; }
            .ink_mat_icon { font-size: 36px; margin-bottom: 2px; }
            .ink_mat_name { font-size: 20px; color: #333; width: 95%; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: bold; line-height: 1.2; }
            .ink_mat_stock { font-size: 16px; color: #888; margin-top: 2px; font-weight: bold; }
            .ink_res_item { display: flex; align-items: center; gap: 10px; width: 100%; }
            .ink_res_ico { font-size: 36px; }
            .ink_res_info { flex: 1; text-align: left; }
            .ink_res_name { font-size: 20px; font-weight: bold; color: #333; }
            .ink_res_desc { font-size: 16px; color: #888; }
            .ink_res_item.unknown .ink_res_ico { opacity: 0.5; }
            /* --- 图鉴专用样式 --- */
            .ink_btn_gallery { padding: 5px 12px; border: 1px solid #8d6e63; background: #fff; color: #5d4037; border-radius: 4px; cursor: pointer; font-weight: bold; font-family: "KaiTi"; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .ink_btn_gallery:hover { background: #efebe9; color: #3e2723; }
            .ink_gallery_card { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #d7ccc8; border-radius: 8px; padding: 10px; transition: all 0.2s; min-height: 100px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            .ink_gallery_card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.08); }
            .ink_gallery_icon { font-size: 40px; margin-bottom: 5px; }
            .ink_gallery_name { font-size: 16px; font-weight: bold; width: 100%; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        `;
        document.head.appendChild(style);
    }
};

window.UICook = UICook;