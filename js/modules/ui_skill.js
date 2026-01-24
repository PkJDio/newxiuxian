// js/modules/ui_skill.js
// 技艺系统 v4.0 (极致性能优化版：CSS渲染加速 + DOM裁剪)

const UISkill = {
    currentTab: 'body',
    _isStyleInjected: false,

    configMap: {
        'body': { equipKey: 'gongfa', limitKey: 'gongfa_nums' },
        'cultivation': { equipKey: 'gongfa', limitKey: 'gongfa_nums' },
        'zhaoshi': { equipKey: 'zhaoshi_equipped', limitKey: 'zhaoshi_nums' },
        'life': { equipKey: null, limitKey: null }
    },

    // ================= CSS 样式优化 =================
    _injectStyles: function() {
        if (this._isStyleInjected) return;

        const cssContent = `
            .skill_container { display:flex; width:100%; height:100%; gap:15px; font-family:"KaiTi", serif; overflow:hidden; 
                contain: strict; /* 性能优化核心：限制重绘范围 */
            }
            .skill_library { flex:3; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff; min-width: 0; }
            .skill_slots_panel { flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px; min-width: 280px; max-width: 320px; }
            
            .skill_tabs { display:flex; border-bottom:1px solid #eee; background:#f9f9f9; flex-shrink: 0; }
            .skill_tab_btn { flex:1; padding:12px 10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:18px; transition: all 0.2s; }
            .skill_tab_btn.active { color:#333; border-bottom:3px solid #a94442; background:#fff; font-weight:bold; }

            #skill_list_content { 
                flex:1; overflow-y:auto; padding:15px; 
                display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); 
                grid-auto-rows: max-content; gap:12px; align-content:start;
                will-change: transform; /* 开启 GPU 加速滚动 */
            }

            .skill_card { 
                position:relative; min-height: 70px; display:flex; align-items:center; gap:12px; padding:12px; 
                border:1px solid #eee; background:#fff; border-radius:6px; cursor:pointer; 
                transition: transform 0.1s;
                content-visibility: auto; /* 核心优化：不在视图内的卡片不渲染绘制 */
                contain-intrinsic-size: 70px; /* 预估高度，防止滚动条抖动 */
            }
            .skill_card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #ccc; }
            .skill_card.equipped { border-color:#a94442 !important; background:#fff5f5 !important; }
            .skill_card.mastered { background:#fffdf5; border-color:#ffecb3; }

            /* 样式合并减少属性数量 */
            .art_full_base { border-width: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .art_part_base { border-style: dashed; border-width: 2px; background-color: #fcf9f2; }

            .skill_icon { font-size:28px; width: 40px; text-align:center; flex-shrink: 0; }
            .skill_info { flex:1; overflow:hidden; pointer-events: none; }
            .skill_name { font-weight:bold; color:#333; font-size: 17px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            
            .card_badge { position: absolute; top: 0; left: 0; background: #a94442; color: #fff; font-size: 12px; font-weight: bold; padding: 2px 8px; border-bottom-left-radius: 6px; z-index: 1; }
            .zs_badge { background: #2e7d32 !important; }
            .skill_stamp { position: absolute; bottom: -10px; right: -5px; color: #8b0000; opacity: 0.1; font-size: 40px; font-weight: bold; transform: rotate(-20deg); pointer-events: none; }

            /* 右侧槽位 */
            .slots_container { flex:1; display:flex; flex-direction:column; gap:12px; overflow-y: auto; }
            .skill_slot_box { position: relative; min-height: 70px; border-radius: 6px; display: flex; align-items: center; transition: all 0.2s; border: 1px solid #e0e0e0; }
            .skill_slot_box.filled { padding: 10px; gap: 10px; background: #fffbfb; }
            .skill_slot_box.empty { justify-content: center; border: 2px dashed #e0e0e0; background: #fafafa; color: #ccc; }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-skill-v4';
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);
        this._isStyleInjected = true;
    },

    open: function() {
        this._injectStyles();
        this.showModal();
    },

    showModal: function() {
        const title = "修仙技艺";
        const getTabClass = (tab) => this.currentTab === tab ? "skill_tab_btn active" : "skill_tab_btn";

        const contentHtml = `
            <div class="skill_container">
                <div class="skill_library">
                    <div class="skill_tabs">
                        <button id="tab_body" class="${getTabClass('body')}" onclick="UISkill.switchTab('body')">外功</button>
                        <button id="tab_cultivation" class="${getTabClass('cultivation')}" onclick="UISkill.switchTab('cultivation')">内功</button>
                        <button id="tab_zhaoshi" class="${getTabClass('zhaoshi')}" onclick="UISkill.switchTab('zhaoshi')">招式</button>
                        <button id="tab_life" class="${getTabClass('life')}" onclick="UISkill.switchTab('life')">生活技艺</button>
                    </div>
                    <div id="skill_list_content" 
                         onclick="UISkill.onListClick(event)" 
                         onmouseover="UISkill.onListHover(event)" 
                         onmouseout="UISkill.onListOut(event)"
                         onmousemove="UISkill.onListMove(event)">
                    </div>
                </div>
                <div class="skill_slots_panel">
                    <div class="slots_header" style="text-align:center; font-weight:bold; margin-bottom:15px; padding-bottom:10px; border-bottom:2px solid #eee;">当前运功</div>
                    <div id="slots_dynamic_container" class="slots_container"></div>
                </div>
            </div>`;

        if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_skill", 68, 80);
        this.refresh();
    },

    switchTab: function(tabName) {
        if (this.currentTab === tabName) return;
        this.currentTab = tabName;
        // 局部更新 Tab 状态
        document.querySelectorAll('.skill_tab_btn').forEach(btn => btn.classList.toggle('active', btn.id === `tab_${tabName}`));
        this.renderList();
        this.renderRightPanel();
    },

    refresh: function() {
        // 使用微任务确保 DOM 存在
        Promise.resolve().then(() => {
            if(document.getElementById('skill_list_content')) {
                this.renderList();
                this.renderRightPanel();
            }
        });
    },

    // ================= 列表渲染 (DOM 裁剪优化) =================
    renderList: function() {
        const container = document.getElementById('skill_list_content');
        if (!container) return;

        // 性能关键：清空容器
        container.innerHTML = '';
        let htmlBuffer = '';

        if (this.currentTab === 'zhaoshi') {
            const zhaoshiData = player.zhaoshi_list || {};
            const list = Object.values(zhaoshiData).sort((a, b) => (b.rarity || 1) - (a.rarity || 1));

            if (list.length === 0) {
                container.innerHTML = `<div class="text-empty">暂未领悟招式</div>`;
                return;
            }

            // 仅渲染前 100 个防止瞬间卡顿 (如果玩家真的有几百个招式)
            list.slice(0, 100).forEach(move => {
                const isEq = this.isEquipped(move.id);
                const rColor = (window.RARITY_CONFIG?.[move.rarity])?.color || '#333';
                htmlBuffer += `
                    <div class="skill_card art_part_base art_r${move.rarity || 1} ${isEq ? 'equipped' : ''}" data-id="${move.id}" data-type="zhaoshi">
                        <div class="skill_icon">⚔️</div>
                        <div class="skill_info">
                            <div class="skill_name" style="color:${rColor};">${move.name}</div>
                            <div style="font-size:13px; color:#888;">${move.subType}</div>
                        </div>
                        ${isEq ? '<div class="card_badge zs_badge">装备</div>' : ''}
                    </div>`;
            });
        }
        else if (this.currentTab === 'life') {
            const skillList = window.UtilsLifeSkills ? UtilsLifeSkills.getSkillListForUI() : [];
            skillList.forEach(item => {
                htmlBuffer += `
                <div class="skill_card" style="cursor:default; height:auto; padding:15px; flex-direction:column; align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="font-weight:bold; color:#2e7d32;">${item.name} (Lv.${item.level})</span>
                        <span style="font-size:12px; color:#d4af37;">${item.isMax ? '大圆满' : item.exp + '/' + item.maxExp}</span>
                    </div>
                    <div style="background:#eee; height:6px; border-radius:3px; overflow:hidden;">
                        <div style="background:#4caf50; width:${item.percent}%; height:100%;"></div>
                    </div>
                </div>`;
            });
        }
        else {
            // 功法渲染
            const list = Object.keys(player.skills || {}).reduce((acc, id) => {
                const item = books.find(i => i.id === id);
                if (item && item.subType === this.currentTab) acc.push(item);
                return acc;
            }, []).sort((a, b) => {
                const fullA = a.id.includes('_full') ? 1 : 0;
                const fullB = b.id.includes('_full') ? 1 : 0;
                return (fullB - fullA) || (b.rarity - a.rarity);
            });

            list.forEach(item => {
                const skillData = player.skills[item.id];
                const isEq = this.isEquipped(item.id);
                const info = UtilsSkill.getSkillInfo(item.id);
                const rColor = (RARITY_CONFIG[item.rarity || 1] || {}).color || '#333';

                let cls = `skill_card art_r${item.rarity} ${isEq ? 'equipped' : ''}`;
                if (skillData?.mastered) cls += ' mastered';
                cls += item.id.includes('_full') ? ' art_full_base' : ' art_part_base';

                htmlBuffer += `
                    <div class="${cls}" data-id="${item.id}" data-type="${item.subType}">
                        <div class="skill_icon">${item.icon || '📘'}</div>
                        <div class="skill_info">
                            <div class="skill_name" style="color:${rColor};">${item.name}</div>
                            <div style="font-size:13px; color:#666;">${info.levelName}</div>
                        </div>
                        ${isEq ? '<div class="card_badge">运功</div>' : ''}
                        ${item.action ? '<div class="skill_stamp">主</div>' : ''}
                    </div>`;
            });
        }

        container.innerHTML = htmlBuffer;
        if (window.twemoji) window.twemoji.parse(container);
    },

    // ================= 右侧面板渲染 =================
    renderRightPanel: function() {
        const container = document.getElementById('slots_dynamic_container');
        if (!container || this.currentTab === 'life') return;

        let html = '';
        // 功法槽位
        const gfMax = player.gongfa_nums || 3;
        const gfList = player.equipment?.gongfa || [];
        html += `<div style="font-size:13px; color:#999; margin-bottom:5px;">功法位 (${gfList.filter(x=>x).length}/${gfMax})</div>`;
        for(let i=0; i<gfMax; i++) html += this._renderSlotBox('gongfa', gfList[i], i);

        // 招式槽位
        const zsMax = player.zhaoshi_nums || 3;
        const zsList = player.zhaoshi_equipped || [];
        html += `<div style="font-size:13px; color:#999; margin-top:15px; margin-bottom:5px;">招式位 (${zsList.filter(x=>x).length}/${zsMax})</div>`;
        for(let i=0; i<zsMax; i++) html += this._renderSlotBox('zhaoshi_equipped', zsList[i], i);

        container.innerHTML = html;
    },

    _renderSlotBox: function(equipKey, id, index) {
        if (!id) return `<div class="skill_slot_box empty">未装备</div>`;
        const isZs = equipKey === 'zhaoshi_equipped';
        const item = isZs ? (player.zhaoshi_list?.[id]) : books.find(b => b.id === id);
        if (!item) return `<div class="skill_slot_box empty">丢失</div>`;

        const rColor = (window.RARITY_CONFIG?.[item.rarity])?.color || '#333';
        const hoverAttr = isZs ? `onmouseenter="window.showZhaoshiTooltip(event, '${id}')"` : `onmouseenter="showSkillTooltip(event, '${id}')"`;

        return `
            <div class="skill_slot_box filled art_part_base art_r${item.rarity}" 
                 style="border-color:${rColor}33" ${hoverAttr} onmouseleave="hideTooltip()">
                <div class="skill_icon" style="font-size:22px;">${item.icon || (isZs ? '📙️' : '📘')}</div>
                <div class="skill_info">
                    <div style="font-weight:bold; color:${rColor}; font-size:14px; display:flex; align-items:center;">
                        <span style="font-size:10px; border:1px solid ${rColor}55; padding:0 3px; border-radius:2px; margin-right:4px;">${isZs?'式':'功'}</span>${item.name}
                    </div>
                </div>
                <div class="btn_unequip" style="position:absolute; right:5px; padding:2px 6px; font-size:12px; border:1px solid #ddd; background:#fff; cursor:pointer;" 
                     onclick="event.stopPropagation(); UISkill.unequip('${equipKey}', ${index})">卸</div>
            </div>`;
    },

    // ================= 逻辑处理 =================
    isEquipped: function(id) {
        return (player.equipment?.gongfa?.includes(id)) || (player.zhaoshi_equipped?.includes(id));
    },

    onListClick: function(e) {
        const card = e.target.closest('.skill_card');
        if (card && card.dataset.id) this.handleEquipToggle(card.dataset.id, card.dataset.type);
    },

    onListHover: function(e) {
        const card = e.target.closest('.skill_card');
        if (card && card.dataset.id) {
            if (card.dataset.type === 'zhaoshi') {
                if(window.showZhaoshiTooltip) window.showZhaoshiTooltip(e, card.dataset.id);
            } else if (card.dataset.type !== 'life') {
                if(window.showSkillTooltip) showSkillTooltip(e, card.dataset.id);
            }
        }
    },

    onListOut: function() { hideTooltip(); },
    onListMove: function(e) { moveTooltip(e); },

    handleEquipToggle: function(id, type) {
        const isZs = type === 'zhaoshi';
        const key = isZs ? 'zhaoshi_equipped' : 'gongfa';
        if (this.isEquipped(id)) {
            const list = isZs ? player.zhaoshi_equipped : player.equipment.gongfa;
            this.unequip(key, list.indexOf(id));
        } else {
            this.equip(type, id);
        }
    },

    equip: function(type, id) {
        const isZs = type === 'zhaoshi';
        if (!player.equipment) player.equipment = {};
        if (isZs && !player.zhaoshi_equipped) player.zhaoshi_equipped = [];
        if (!isZs && !player.equipment.gongfa) player.equipment.gongfa = [];

        const list = isZs ? player.zhaoshi_equipped : player.equipment.gongfa;
        const max = isZs ? player.zhaoshi_nums : player.gongfa_nums;

        let emptyIdx = list.indexOf(null);
        if (emptyIdx === -1 && list.length < max) {
            emptyIdx = list.length;
            list.push(id);
        } else if (emptyIdx !== -1) {
            list[emptyIdx] = id;
        } else {
            window.showToast?.("槽位已满");
            return;
        }
        this._refreshData();
    },

    unequip: function(key, idx) {
        const list = (key === 'gongfa') ? player.equipment?.gongfa : player.zhaoshi_equipped;
        if (list && list[idx]) {
            list[idx] = null;
            this._refreshData();
        }
    },

    _refreshData: function() {
        if(window.recalcStats) window.recalcStats();
        this.refresh();
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
    }
};

window.UISkill = UISkill;