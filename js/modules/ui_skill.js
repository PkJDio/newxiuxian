// js/modules/ui_skill.js
// 技艺系统 v5.0 (Template Refactor: 结构分离 + 极致性能)

const UISkill = {
    currentTab: 'body',
    _isStyleInjected: false,

    configMap: {
        'body': { equipKey: 'gongfa', limitKey: 'gongfa_nums' },
        'cultivation': { equipKey: 'gongfa', limitKey: 'gongfa_nums' },
        'zhaoshi': { equipKey: 'zhaoshi_equipped', limitKey: 'zhaoshi_nums' },
        'life': { equipKey: null, limitKey: null }
    },

    // --- 1. 模板与样式初始化 ---
    _initTemplates: function() {
        if (this._isStyleInjected) return;

        // 1.1 CSS 样式 (保持原有优化)
        const cssContent = `
            .skill_container { display:flex; width:100%; height:100%; gap:15px; font-family:"KaiTi", serif; overflow:hidden; contain: strict; }
            .skill_library { flex:3; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff; min-width: 0; }
            .skill_slots_panel { flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px; min-width: 280px; max-width: 320px; }
            
            .skill_tabs { display:flex; border-bottom:1px solid #eee; background:#f9f9f9; flex-shrink: 0; }
            .skill_tab_btn { flex:1; padding:12px 10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:18px; transition: all 0.2s; }
            .skill_tab_btn.active { color:#333; border-bottom:3px solid #a94442; background:#fff; font-weight:bold; }

            #skill_list_content { 
                flex:1; overflow-y:auto; padding:15px; 
                display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); 
                grid-auto-rows: max-content; gap:12px; align-content:start;
                will-change: transform;
            }

            .skill_card { 
                position:relative; min-height: 70px; display:flex; align-items:center; gap:12px; padding:12px; 
                border:1px solid #eee; background:#fff; border-radius:6px; cursor:pointer; 
                transition: transform 0.1s;
                content-visibility: auto; contain-intrinsic-size: 70px;
            }
            .skill_card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #ccc; }
            .skill_card.equipped { border-color:#a94442 !important; background:#fff5f5 !important; }
            .skill_card.mastered { background:#fffdf5; border-color:#ffecb3; }

            .art_full_base { border-width: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .art_part_base { border-style: dashed; border-width: 2px; background-color: #fcf9f2; }

            .skill_icon { font-size:28px; width: 40px; text-align:center; flex-shrink: 0; }
            .skill_info { flex:1; overflow:hidden; pointer-events: none; }
            .skill_name { font-weight:bold; color:#333; font-size: 17px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .skill_sub { font-size:13px; color:#666; }
            
            .card_badge { position: absolute; top: 0; left: 0; background: #a94442; color: #fff; font-size: 12px; font-weight: bold; padding: 2px 8px; border-bottom-left-radius: 6px; z-index: 1; }
            .zs_badge { background: #2e7d32 !important; }
            .skill_stamp { position: absolute; bottom: -10px; right: -5px; color: #8b0000; opacity: 0.1; font-size: 40px; font-weight: bold; transform: rotate(-20deg); pointer-events: none; }

            /* 右侧槽位 */
            .slots_container { flex:1; display:flex; flex-direction:column; gap:12px; overflow-y: auto; }
            .skill_slot_box { position: relative; min-height: 70px; border-radius: 6px; display: flex; align-items: center; transition: all 0.2s; border: 1px solid #e0e0e0; }
            .skill_slot_box.filled { padding: 10px; gap: 10px; background: #fffbfb; }
            .skill_slot_box.empty { justify-content: center; border: 2px dashed #e0e0e0; background: #fafafa; color: #ccc; }
            .btn_unequip { position:absolute; right:5px; padding:2px 6px; font-size:12px; border:1px solid #ddd; background:#fff; cursor:pointer; }
            
            /* 生活技能进度条 */
            .life_skill_bar_bg { background:#eee; height:6px; border-radius:3px; overflow:hidden; width:100%; margin-top:5px; }
            .life_skill_bar_fill { background:#4caf50; height:100%; width:0%; transition: width 0.3s; }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-skill-v5';
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);

        // 1.2 HTML 模板注入
        const templates = `
            <template id="tpl_skill_layout">
                <div class="skill_container">
                    <div class="skill_library">
                        <div class="skill_tabs">
                            <button id="tab_body" class="skill_tab_btn active" onclick="UISkill.switchTab('body')">外功</button>
                            <button id="tab_cultivation" class="skill_tab_btn" onclick="UISkill.switchTab('cultivation')">内功</button>
                            <button id="tab_zhaoshi" class="skill_tab_btn" onclick="UISkill.switchTab('zhaoshi')">招式</button>
                            <button id="tab_life" class="skill_tab_btn" onclick="UISkill.switchTab('life')">生活技艺</button>
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
                </div>
            </template>

            <template id="tpl_skill_card">
                <div class="skill_card">
                    <div class="skill_icon"></div>
                    <div class="skill_info">
                        <div class="skill_name"></div>
                        <div class="skill_sub"></div>
                    </div>
                    <div class="card_badge" style="display:none"></div>
                    <div class="skill_stamp" style="display:none">主</div>
                </div>
            </template>

            <template id="tpl_life_skill_card">
                <div class="skill_card" style="cursor:default; height:auto; padding:15px; flex-direction:column; align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span class="life_name" style="font-weight:bold; color:#2e7d32;"></span>
                        <span class="life_exp" style="font-size:12px; color:#d4af37;"></span>
                    </div>
                    <div class="life_skill_bar_bg">
                        <div class="life_skill_bar_fill"></div>
                    </div>
                </div>
            </template>

            <template id="tpl_skill_slot">
                <div class="skill_slot_box">
                    <div class="slot_empty_text" style="display:none"></div>
                    
                    <div class="slot_content_wrapper" style="display:none; width:100%; display:flex; align-items:center; gap:10px;">
                        <div class="skill_icon" style="font-size:22px;"></div>
                        <div class="skill_info">
                            <div class="slot_info_row" style="font-weight:bold; font-size:14px; display:flex; align-items:center;">
                                <span class="slot_tag" style="font-size:10px; border:1px solid; padding:0 3px; border-radius:2px; margin-right:4px;"></span>
                                <span class="slot_name"></span>
                            </div>
                        </div>
                        <div class="btn_unequip">卸</div>
                    </div>
                </div>
            </template>
        `;

        if (!document.getElementById('tpl_skill_layout')) {
            document.body.insertAdjacentHTML('beforeend', templates);
        }

        this._isStyleInjected = true;
    },

    // --- 2. 核心方法 ---
    open: function() {
        this._initTemplates();
        this.currentTab = 'body'; // 默认重置为外功，或可去掉此行记忆上次选项
        this.showModal();
    },

    showModal: function() {
        const title = "修仙技艺";

        // 从模板生成 HTML 字符串
        const tpl = document.getElementById('tpl_skill_layout');
        const clone = tpl.content.cloneNode(true);

        // 设置初始 Tab 高亮
        const tabs = clone.querySelectorAll('.skill_tab_btn');
        tabs.forEach(btn => {
            if (btn.id === `tab_${this.currentTab}`) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        const tempDiv = document.createElement('div');
        tempDiv.appendChild(clone);
        const contentHtml = tempDiv.innerHTML;

        if (window.showGeneralModal) window.showGeneralModal(title, contentHtml, null, "modal_skill", 68, 80);

        this.refresh();
    },

    switchTab: function(tabName) {
        if (this.currentTab === tabName) return;
        this.currentTab = tabName;

        // 局部更新 Tab 样式
        document.querySelectorAll('.skill_tab_btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `tab_${tabName}`);
        });

        this.renderList();
        this.renderRightPanel();
    },

    refresh: function() {
        // 使用微任务确保 DOM 已经渲染完毕
        Promise.resolve().then(() => {
            if(document.getElementById('skill_list_content')) {
                this.renderList();
                this.renderRightPanel();
            }
        });
    },

    // --- 3. 列表渲染 (Template + DocumentFragment) ---
    renderList: function() {
        const container = document.getElementById('skill_list_content');
        if (!container) return;

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        if (this.currentTab === 'zhaoshi') {
            this._renderZhaoshi(fragment);
        } else if (this.currentTab === 'life') {
            this._renderLifeSkills(fragment);
        } else {
            this._renderKungfu(fragment);
        }

        if (fragment.children.length === 0) {
            container.innerHTML = `<div class="text-empty" style="padding:20px; color:#999; text-align:center;">暂无此类技艺</div>`;
        } else {
            container.appendChild(fragment);
            if (window.twemoji) window.twemoji.parse(container);
        }
    },

    _renderZhaoshi: function(fragment) {
        const zhaoshiData = player.zhaoshi_list || {};
        const list = Object.values(zhaoshiData).sort((a, b) => (b.rarity || 1) - (a.rarity || 1));

        const tpl = document.getElementById('tpl_skill_card');

        // 限制渲染数量优化性能
        list.slice(0, 100).forEach(move => {
            const clone = tpl.content.cloneNode(true);
            const card = clone.querySelector('.skill_card');

            // 数据准备
            const isEq = this.isEquipped(move.id);
            const rColor = (window.RARITY_CONFIG?.[move.rarity])?.color || '#333';

            // 填充内容
            card.classList.add('art_part_base', `art_r${move.rarity || 1}`);
            if (isEq) card.classList.add('equipped');
            card.dataset.id = move.id;
            card.dataset.type = 'zhaoshi';

            clone.querySelector('.skill_icon').textContent = '⚔️';
            const nameEl = clone.querySelector('.skill_name');
            nameEl.textContent = move.name;
            nameEl.style.color = rColor;

            clone.querySelector('.skill_sub').textContent = move.subType || '招式';

            if (isEq) {
                const badge = clone.querySelector('.card_badge');
                badge.textContent = '装备';
                badge.classList.add('zs_badge');
                badge.style.display = 'block';
            }

            fragment.appendChild(clone);
        });
    },

    _renderLifeSkills: function(fragment) {
        const skillList = window.UtilsLifeSkills ? UtilsLifeSkills.getSkillListForUI() : [];
        const tpl = document.getElementById('tpl_life_skill_card');

        skillList.forEach(item => {
            const clone = tpl.content.cloneNode(true);

            clone.querySelector('.life_name').textContent = `${item.name} (Lv.${item.level})`;
            clone.querySelector('.life_exp').textContent = item.isMax ? '大圆满' : `${item.exp}/${item.maxExp}`;
            clone.querySelector('.life_skill_bar_fill').style.width = `${item.percent}%`;

            fragment.appendChild(clone);
        });
    },

    _renderKungfu: function(fragment) {
        const list = Object.keys(player.skills || {}).reduce((acc, id) => {
            const item = books.find(i => i.id === id);
            if (item && item.subType === this.currentTab) acc.push(item);
            return acc;
        }, []).sort((a, b) => {
            const fullA = a.id.includes('_full') ? 1 : 0;
            const fullB = b.id.includes('_full') ? 1 : 0;
            return (fullB - fullA) || (b.rarity - a.rarity);
        });

        const tpl = document.getElementById('tpl_skill_card');

        list.forEach(item => {
            const skillData = player.skills[item.id];
            const isEq = this.isEquipped(item.id);
            const info = UtilsSkill.getSkillInfo(item.id);
            const rColor = (RARITY_CONFIG[item.rarity || 1] || {}).color || '#333';

            const clone = tpl.content.cloneNode(true);
            const card = clone.querySelector('.skill_card');

            // 样式类
            card.classList.add(`art_r${item.rarity}`);
            if (isEq) card.classList.add('equipped');
            if (skillData?.mastered) card.classList.add('mastered');
            card.classList.add(item.id.includes('_full') ? 'art_full_base' : 'art_part_base');

            card.dataset.id = item.id;
            card.dataset.type = item.subType;

            // 内容
            clone.querySelector('.skill_icon').textContent = item.icon || '📘';
            const nameEl = clone.querySelector('.skill_name');
            nameEl.textContent = item.name;
            nameEl.style.color = rColor;

            clone.querySelector('.skill_sub').textContent = info.levelName;

            if (isEq) {
                const badge = clone.querySelector('.card_badge');
                badge.textContent = '运功';
                badge.style.display = 'block';
            }
            if (item.action) {
                clone.querySelector('.skill_stamp').style.display = 'block';
            }

            fragment.appendChild(clone);
        });
    },

    // --- 4. 右侧面板渲染 (Template Refactor) ---
    renderRightPanel: function() {
        const container = document.getElementById('slots_dynamic_container');
        if (!container || this.currentTab === 'life') {
            if (container) container.innerHTML = ''; // Clear if switching to life
            return;
        }

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        // 功法槽位渲染
        const gfMax = player.gongfa_nums || 3;
        const gfList = player.equipment?.gongfa || [];
        this._appendSlotHeader(fragment, `功法位 (${gfList.filter(x=>x).length}/${gfMax})`);

        for(let i=0; i<gfMax; i++) {
            this._appendSlotBox(fragment, 'gongfa', gfList[i], i);
        }

        // 招式槽位渲染
        const zsMax = player.zhaoshi_nums || 3;
        const zsList = player.zhaoshi_equipped || [];
        this._appendSlotHeader(fragment, `招式位 (${zsList.filter(x=>x).length}/${zsMax})`, true);

        for(let i=0; i<zsMax; i++) {
            this._appendSlotBox(fragment, 'zhaoshi_equipped', zsList[i], i);
        }

        container.appendChild(fragment);
        if (window.twemoji) window.parseEmoji(container);
    },

    _appendSlotHeader: function(fragment, text, isMarginTop) {
        const div = document.createElement('div');
        div.style.cssText = `font-size:13px; color:#999; margin-bottom:5px; ${isMarginTop ? 'margin-top:15px;' : ''}`;
        div.textContent = text;
        fragment.appendChild(div);
    },

    _appendSlotBox: function(fragment, equipKey, id, index) {
        const tpl = document.getElementById('tpl_skill_slot');
        const clone = tpl.content.cloneNode(true);
        const box = clone.querySelector('.skill_slot_box');

        if (!id) {
            // 空槽位
            box.classList.add('empty');
            const emptyText = clone.querySelector('.slot_empty_text');
            emptyText.textContent = '未装备';
            emptyText.style.display = 'block';
        } else {
            // 已填充
            const isZs = equipKey === 'zhaoshi_equipped';
            const item = isZs ? (player.zhaoshi_list?.[id]) : books.find(b => b.id === id);

            if (!item) {
                box.classList.add('empty');
                const emptyText = clone.querySelector('.slot_empty_text');
                emptyText.textContent = '数据错误';
                emptyText.style.display = 'block';
            } else {
                box.classList.add('filled', 'art_part_base', `art_r${item.rarity}`);
                const rColor = (window.RARITY_CONFIG?.[item.rarity])?.color || '#333';
                box.style.borderColor = rColor + '33';

                // 显示内容容器
                const contentWrapper = clone.querySelector('.slot_content_wrapper');
                contentWrapper.style.display = 'flex'; // Template 里是 none

                // 填充数据
                clone.querySelector('.skill_icon').textContent = item.icon || (isZs ? '📙️' : '📘');

                const nameEl = clone.querySelector('.slot_name');
                nameEl.textContent = item.name;
                nameEl.style.color = rColor;

                const tagEl = clone.querySelector('.slot_tag');
                tagEl.textContent = isZs ? '式' : '功';
                tagEl.style.borderColor = rColor + '55';

                // 绑定事件
                const btnUnequip = clone.querySelector('.btn_unequip');
                btnUnequip.onclick = (e) => {
                    e.stopPropagation();
                    UISkill.unequip(equipKey, index);
                };

                // Tooltip
                box.onmouseenter = (e) => {
                    if (isZs) {
                        if (window.showZhaoshiTooltip) window.showZhaoshiTooltip(e, id);
                    } else {
                        if (window.showSkillTooltip) showSkillTooltip(e, id);
                    }
                };
                box.onmouseleave = () => window.hideTooltip();
            }
        }
        fragment.appendChild(clone);
    },

    // --- 5. 逻辑处理 ---
    isEquipped: function(id) {
        return (player.equipment?.gongfa?.includes(id)) || (player.zhaoshi_equipped?.includes(id));
    },

    onListClick: function(e) {
        const card = e.target.closest('.skill_card');
        if (card && card.dataset.id && card.dataset.type !== 'life') {
            this.handleEquipToggle(card.dataset.id, card.dataset.type);
        }
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
            if(window.showToast) window.showToast("槽位已满");
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