// js/modules/ui_skill.js
// 技艺系统 (整合外功、内功、生活技艺) - v2.1 (DOM与CSS分离优化版)

const UISkill = {
    currentTab: 'body',

    // 标记样式是否已注入
    _isStyleInjected: false,

    // 映射表：Tab名称 -> 装备数据Key | 槽位数量Key
    configMap: {
        'body': {
            equipKey: 'gongfa',      // 统一存储在 player.equipment.gongfa
            limitKey: 'gongfa_nums'  // 统一读取 player.gongfa_nums 作为上限
        },
        'cultivation': {
            equipKey: 'gongfa',
            limitKey: 'gongfa_nums'
        },
        'life': {
            equipKey: null,
            limitKey: null
        }
    },

    // 【优化1】CSS 单例注入
    _injectStyles: function() {
        if (this._isStyleInjected) return;

        const cssContent = `
            /* 容器布局 */
            .skill_container { display:flex; width:100%; height:100%; gap:15px; font-family:"KaiTi", "楷体", serif; }
            .skill_library { flex:2; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff; }
            .skill_slots_panel { flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px; min-width: 280px; }
            
            /* 标签页 */
            .skill_tabs { display:flex; border-bottom:1px solid #eee; background:#f9f9f9; }
            .skill_tab_btn { flex:1; padding:10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:16px; transition: all 0.2s; }
            .skill_tab_btn.active { color:#333; border-bottom:2px solid #a94442; background:#fff; font-weight:bold; }
            .skill_tab_btn:hover { background: #f0f0f0; }

            /* 列表区域 */
            #skill_list_content { flex:1; overflow-y:auto; padding:10px; display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px; align-content:start; }
            
            /* 技能卡片 */
            .skill_card { border:1px solid #eee; background:#fff; padding:10px; border-radius:4px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
            .skill_card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            
            .skill_card.mastered { border:2px solid #ffc107; background:#fffdf5; }
            .skill_card.equipped { border:1px solid #a94442; background:#fff5f5; }
            
            /* 技能图标与文字 */
            .skill_icon { font-size:24px; }
            .skill_info { flex:1; }
            .skill_name { font-weight:bold; color:#333; }
            .skill_level { font-size:14px; color:#666; }
            
            /* 印章水印 */
            .skill_stamp {
                position: absolute; top: -5px; right: -5px;
                width: 60px; height: 60px; line-height: 54px;
                border: 4px solid rgba(217, 83, 79, 0.4);
                border-radius: 50%;
                color: rgba(217, 83, 79, 0.3);
                text-align: center; font-size: 36px; font-weight: 900;
                transform: rotate(15deg); pointer-events: none; z-index: 0;
                font-family: 'Kaiti', serif;
            }
            
            /* 右侧面板 */
            .slots_header { font-size:18px; font-weight:bold; text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px; }
            .slots_container { flex:1; display:flex; flex-direction:column; gap:10px; }
            .slot_info_row { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; }
            
            /* 装备槽位 */
            .skill_slot_box { position: relative; padding: 10px; border-radius: 4px; display: flex; align-items: center; gap: 10px; min-height: 60px; }
            .skill_slot_box.filled { border: 1px solid #a94442; background: #fffbfb; }
            .skill_slot_empty { width:100%; text-align:center; color:#ccc; border: 1px dashed #ccc; padding: 15px 0; border-radius: 4px; }
            
            /* 槽位内的印章 (略微不同) */
            .slot_stamp {
                position: absolute; bottom: 0px; right: 40px;
                width: 54px; height: 54px; line-height: 48px;
                border: 3px solid rgba(217, 83, 79, 0.3);
                border-radius: 50%;
                color: rgba(217, 83, 79, 0.2);
                text-align: center; font-size: 30px; font-weight: 900;
                transform: rotate(-15deg); pointer-events: none; z-index: 0;
                font-family: 'Kaiti', serif;
            }

            /* 标签Tag */
            .tag_body { background:#e3f2fd; color:#1565c0; padding:1px 4px; border-radius:3px; font-size:10px; margin-right:5px; }
            .tag_cult { background:#fce4ec; color:#c2185b; padding:1px 4px; border-radius:3px; font-size:10px; margin-right:5px; }
            
            /* 通用文本 */
            .text-empty { width:100%; text-align:center; color:#999; margin-top:50px; }
            .text-equipped { font-size:12px; color:#a94442; font-weight:bold; margin-right:5px; }
            .text-mastered { color:#d4af37; font-size:12px; margin-left:5px; }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-skill';
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
        // 纯净的 HTML 结构，无内联样式
        const contentHtml = `
            <div class="skill_container">
                <div class="skill_library">
                    <div class="skill_tabs">
                        <button id="tab_body" class="skill_tab_btn active" onclick="UISkill.switchTab('body')">外功</button>
                        <button id="tab_cultivation" class="skill_tab_btn" onclick="UISkill.switchTab('cultivation')">内功</button>
                        <button id="tab_life" class="skill_tab_btn" onclick="UISkill.switchTab('life')">生活技艺</button>
                    </div>
                    <div id="skill_list_content"></div>
                </div>

                <div class="skill_slots_panel">
                    <div class="slots_header">当前状态</div>
                    <div id="slots_dynamic_container" class="slots_container"></div>
                </div>
            </div>
        `;

        if (window.showGeneralModal) {
            window.showGeneralModal(title, contentHtml, null, "modal_skill", 90, 85);
        } else if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, contentHtml, null, "modal_skill", 90, 85);
        } else {
            console.error(">>> [错误] 弹窗模块未加载");
            return;
        }

        this.refresh();
    },

    switchTab: function(tabName) {
        this.currentTab = tabName;

        // 使用 class 切换状态，而非操作 style
        document.querySelectorAll('.skill_tab_btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`tab_${tabName}`);
        if(activeBtn) activeBtn.classList.add('active');

        this.renderList();
        this.renderRightPanel();
    },

    refresh: function() {
        setTimeout(() => {
            this.switchTab(this.currentTab);
        }, 0);
    },

    renderList: function() {
        const container = document.getElementById('skill_list_content');
        if (!container) return;
        container.innerHTML = '';

        if (this.currentTab === 'life') {
            if (!player.lifeSkills || Object.keys(player.lifeSkills).length === 0) {
                container.innerHTML = `<div class="text-empty">暂未领悟任何生活技艺</div>`;
                return;
            }
            for (let key in player.lifeSkills) {
                const skill = player.lifeSkills[key];
                const card = document.createElement('div');
                card.className = 'skill_card';
                card.style.cursor = 'default'; // 生活技能不可点击装备
                card.innerHTML = `
                    <div class="skill_icon">🎨</div>
                    <div class="skill_info">
                        <div class="skill_name" style="color:#2e7d32;">${skill.name}</div>
                        <div style="font-size:16px; color:#666;">熟练度: <span style="color:#d4af37; font-weight:bold;">${skill.exp}</span></div>
                        <div style="font-size:14px; color:#999; margin-top:2px;">${skill.desc || '暂无描述'}</div>
                    </div>
                `;
                container.appendChild(card);
            }
            return;
        }

        if (!player.skills) return;
        const learnedIds = Object.keys(player.skills);
        const list = [];
        learnedIds.forEach(id => {
            const item = books.find(i => i.id === id);
            if (!item) return;
            if (item.subType === this.currentTab) {
                list.push(item);
            }
        });

        list.sort((a, b) => {
            const rA = a.rarity || 1;
            const rB = b.rarity || 1;
            if (rA !== rB) return rB - rA;
            const expA = player.skills[a.id] ? player.skills[a.id].exp : 0;
            const expB = player.skills[b.id] ? player.skills[b.id].exp : 0;
            return expB - expA;
        });

        if (list.length === 0) {
            container.innerHTML = `<div class="text-empty">暂无此类功法<br><span style="font-size:12px">去天道或者研读获取吧</span></div>`;
            return;
        }

        list.forEach(item => {
            const skillData = player.skills[item.id];
            const isEquipped = this.isEquipped(item.id);
            const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(item.id) : { levelName: '未知' };
            const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
            const isMastered = skillData && skillData.mastered;

            const hasAction = item.action && Object.keys(item.action).length > 0;
            const stampHtml = hasAction ? `<div class="skill_stamp">主</div>` : '';

            const card = document.createElement('div');
            // 根据状态添加不同的 class
            let classes = ['skill_card'];
            if (isMastered) classes.push('mastered');
            else if (isEquipped) classes.push('equipped');
            card.className = classes.join(' ');

            card.onmouseenter = (e) => showSkillTooltip(e, item.id);
            card.onmouseleave = () => hideTooltip();
            card.onmousemove = (e) => moveTooltip(e);
            card.onclick = () => this.handleEquipToggle(item.id, item.subType);

            card.innerHTML = `
                <div class="skill_icon">${item.icon || '📘'}</div>
                <div class="skill_info">
                    <div class="skill_name" style="color:${rarityColor};">
                        ${item.name} 
                        ${isMastered ? '<span class="text-mastered">(参悟)</span>' : ''}
                    </div>
                    <div class="skill_level">${info.levelName}</div>
                </div>
                ${isEquipped ? '<div class="text-equipped">已装备</div>' : ''}
                ${stampHtml} 
            `;
            container.appendChild(card);
        });
    },

    renderRightPanel: function() {
        const container = document.getElementById('slots_dynamic_container');
        if (!container) return;
        container.innerHTML = '';

        if (this.currentTab === 'life') {
            container.innerHTML = `
                <div style="padding:20px; text-align:center; color:#666; font-size:14px; background:#f0f0f0; border-radius:4px;">
                    <p style="margin-bottom:10px; font-weight:bold;">🍃 道法自然</p>
                    <p>生活技艺无需装备，<br>在日常行动中即可自动生效。</p>
                    <p style="margin-top:15px; color:#2e7d32;">熟练度越高，效果越好。</p>
                    <p style="margin-top:5px; color:#e91e63; font-size:12px;">(轮回可完全继承)</p>
                </div>
            `;
            return;
        }

        const header = document.createElement('div');
        header.className = 'slot_info_row';
        header.innerHTML = `<span style="font-weight:bold; color:#666;">已装备功法</span><span style="font-size:12px; color:#999;" id="limit_info_gongfa"></span>`;
        container.appendChild(header);

        const slotsDiv = document.createElement('div');
        slotsDiv.id = "slots_gongfa";
        slotsDiv.style.cssText = "display:flex; flex-direction:column; gap:10px;";
        container.appendChild(slotsDiv);

        this._renderSlotGroup('body', 'slots_gongfa', 'limit_info_gongfa');
    },

    _renderSlotGroup: function(tabType, containerId, infoId) {
        const container = document.getElementById(containerId);
        const limitInfo = document.getElementById(infoId);

        if (!container) return;
        container.innerHTML = '';

        const config = this.configMap[tabType];
        if (!config || !config.equipKey) return;

        const equipKey = config.equipKey;
        const limitKey = config.limitKey;

        if (!player.equipment) player.equipment = {};
        if (!player.equipment[equipKey]) player.equipment[equipKey] = [];

        const realList = player.equipment[equipKey];
        const maxSlots = (player[limitKey] !== undefined) ? player[limitKey] : 3;

        if (limitInfo) {
            limitInfo.innerText = `(${realList.filter(x=>x).length} / ${maxSlots})`;
        }

        for (let i = 0; i < maxSlots; i++) {
            const skillId = realList[i] || null;
            const div = document.createElement('div');

            if (skillId) {
                const item = books.find(id => id.id === skillId);
                if (item) {
                    div.className = "skill_slot_box filled"; // 使用 class
                    const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

                    const tagClass = item.subType === 'body' ? 'tag_body' : 'tag_cult';
                    const tagName = item.subType === 'body' ? '外' : '内';
                    const tagHtml = `<span class="${tagClass}">${tagName}</span>`;

                    const hasAction = item.action && Object.keys(item.action).length > 0;
                    const stampHtml = hasAction ? `<div class="slot_stamp">主</div>` : '';

                    div.innerHTML = `
                        <div style="font-size:24px;">${item.icon || '📘'}</div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:bold; color:${rarityColor}; white-space:nowrap; font-size:16px; display:flex; align-items:center;">
                                ${tagHtml}${item.name}
                            </div>
                        </div>
                        ${stampHtml}
                        <button class="ink_btn_small btn_danger" onclick="event.stopPropagation(); UISkill.unequip('${equipKey}', ${i})">卸</button>
                    `;
                    div.onmouseenter = (e) => showSkillTooltip(e, skillId);
                    div.onmouseleave = () => hideTooltip();
                } else {
                    div.className = "skill_slot_box";
                    div.innerHTML = `<div style="color:red;">[ 数据错误 ]</div>`;
                    if (i < realList.length) player.equipment[equipKey][i] = null;
                }
            } else {
                div.className = "skill_slot_box";
                div.innerHTML = `<div class="skill_slot_empty">未装备</div>`;
            }
            container.appendChild(div);
        }
    },

    isEquipped: function(skillId) {
        if (!player.equipment || !player.equipment.gongfa) return false;
        return player.equipment.gongfa.includes(skillId);
    },

    handleEquipToggle: function(skillId, subType) {
        if (subType === 'life') return;
        const config = this.configMap[subType] || this.configMap['body'];
        const equipKey = config.equipKey;

        if (this.isEquipped(skillId)) {
            const list = player.equipment[equipKey];
            const idx = list.indexOf(skillId);
            if (idx !== -1) this.unequip(equipKey, idx);
        } else {
            this.equip(subType, skillId);
        }
    },

    equip: function(subType, skillId) {
        const config = this.configMap[subType] || this.configMap['body'];
        const equipKey = config.equipKey;
        const limitKey = config.limitKey;

        if (!player.equipment[equipKey]) player.equipment[equipKey] = [];

        const list = player.equipment[equipKey];
        const maxSlots = (player[limitKey] !== undefined) ? player[limitKey] : 3;

        let emptyIdx = list.indexOf(null);
        if (emptyIdx === -1 && list.length < maxSlots) {
            emptyIdx = list.length;
            list.push(null);
        }

        if (emptyIdx === -1 || emptyIdx >= maxSlots) {
            if(window.showToast) window.showToast("功法槽位已满，请先卸下或提升境界增加槽位");
            return;
        }

        list[emptyIdx] = skillId;
        if(window.showToast) window.showToast("功法已运功");

        this._refreshData();
    },

    unequip: function(equipKey, index) {
        if (player.equipment[equipKey] && player.equipment[equipKey][index]) {
            player.equipment[equipKey][index] = null;
            this._refreshData();
        }
    },

    // 辅助：统一刷新数据和界面
    _refreshData: function() {
        if(window.recalcStats) window.recalcStats();
        this.refresh();
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
    }
};

window.UISkill = UISkill;