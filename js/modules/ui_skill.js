// js/modules/ui_skill.js
console.log(">>> [UI_SKILL] 开始加载 ui_skill.js");

const UISkill = {
    currentTab: 'body',

    slotMapping: {
        'body': 'gongfa_ext',
        'cultivation': 'gongfa_int'
    },

    open: function() {
        console.log(">>> [UI_SKILL] Open");
        this.showModal();
    },

    showModal: function() {
        const title = "修仙功法";
        const contentHtml = `
            <div class="skill_container" style="display:flex; width:100%; height:100%; gap:15px; font-family:Kaiti;">
                <div class="skill_library" style="flex:2; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff;">
                    <div class="skill_tabs" style="display:flex; border-bottom:1px solid #eee; background:#f9f9f9;">
                        <button id="tab_body" class="skill_tab_btn active" onclick="UISkill.switchTab('body')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; font-weight:bold; font-size:16px;">外功 (主动)</button>
                        <button id="tab_cultivation" class="skill_tab_btn" onclick="UISkill.switchTab('cultivation')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:16px;">内功 (被动)</button>
                    </div>
                    <div id="skill_list_content" style="flex:1; overflow-y:auto; padding:10px; display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px; align-content:start;"></div>
                </div>

                <div class="skill_slots_panel" style="flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px;">
                    <div style="font-size:18px; font-weight:bold; text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px;">当前运功</div>
                    
                    <div style="margin-bottom:10px; font-weight:bold; color:#666;">外功槽位</div>
                    <div id="slots_body" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;"></div>
                    
                    <div style="margin-bottom:10px; font-weight:bold; color:#666;">内功槽位</div>
                    <div id="slots_cultivation" style="display:flex; flex-direction:column; gap:10px;"></div>
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
        document.querySelectorAll('.skill_tab_btn').forEach(btn => {
            btn.style.color = '#888';
            btn.style.borderBottom = 'none';
            btn.style.backgroundColor = 'transparent';
        });
        const activeBtn = document.getElementById(`tab_${tabName}`);
        if(activeBtn) {
            activeBtn.style.color = '#333';
            activeBtn.style.borderBottom = '2px solid #a94442';
            activeBtn.style.backgroundColor = '#fff';
        }
        this.renderList();
    },

    refresh: function() {
        setTimeout(() => {
            this.switchTab(this.currentTab);
            this.renderSlots();
        }, 0);
    },

    renderList: function() {
        const container = document.getElementById('skill_list_content');
        if (!container) return;
        container.innerHTML = '';

        if (!player.skills) return;
        const learnedIds = Object.keys(player.skills);

        const list = [];
        learnedIds.forEach(id => {
            const item = GAME_DB.items.find(i => i.id === id);
            if (!item) return;
            if (item.subType === this.currentTab) {
                list.push(item);
            }
        });

        // 【新增】列表排序逻辑
        list.sort((a, b) => {
            // 1. 稀有度降序 (rarity越大越好)
            const rA = a.rarity || 1;
            const rB = b.rarity || 1;
            if (rA !== rB) return rB - rA;

            // 2. 熟练度降序 (exp越多越好)
            const expA = player.skills[a.id] ? player.skills[a.id].exp : 0;
            const expB = player.skills[b.id] ? player.skills[b.id].exp : 0;
            return expB - expA;
        });

        if (list.length === 0) {
            container.innerHTML = `<div style="width:100%; text-align:center; color:#999; margin-top:50px;">暂无此类功法<br><span style="font-size:12px">去天道或者研读获取吧</span></div>`;
            return;
        }

        list.forEach(item => {
            const skillData = player.skills[item.id];
            const isEquipped = this.isEquipped(item.id);
            const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(item.id) : { levelName: '未知' };
            const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

            const isMastered = skillData && skillData.mastered;
            const borderStyle = isMastered ? '2px solid #ffc107' : (isEquipped ? '1px solid #a94442' : '1px solid #eee');
            const bgStyle = isMastered ? '#fffdf5' : (isEquipped ? '#fff5f5' : '#fff');

            const card = document.createElement('div');
            card.style.cssText = `border:${borderStyle}; background:${bgStyle}; padding:10px; border-radius:4px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 0.2s; position:relative;`;

            card.onmouseenter = (e) => showSkillTooltip(e, item.id);
            card.onmouseleave = () => hideTooltip();
            card.onmousemove = (e) => moveTooltip(e);

            card.onclick = () => this.handleEquipToggle(item.id, item.subType);

            card.innerHTML = `
                <div style="font-size:24px;">${item.icon || '📘'}</div>
                <div style="flex:1;">
                    <div style="font-weight:bold; color:${rarityColor};">
                        ${item.name} 
                        ${isMastered ? '<span style="color:#d4af37; font-size:12px; margin-left:5px;">(参悟)</span>' : ''}
                    </div>
                    <div style="font-size:12px; color:#666;">${info.levelName}</div>
                </div>
                ${isEquipped ? '<div style="font-size:12px; color:#a94442; font-weight:bold;">已装备</div>' : ''}
            `;
            container.appendChild(card);
        });
    },

    renderSlots: function() {
        this._renderSlotGroup('body');
        this._renderSlotGroup('cultivation');
    },

    _renderSlotGroup: function(tabName) {
        const container = document.getElementById(`slots_${tabName}`);
        if (!container) return;
        container.innerHTML = '';

        const equipKey = this.slotMapping[tabName];

        let equipList = player.equipment[equipKey];
        if (!equipList) {
            equipList = [null, null, null];
            player.equipment[equipKey] = equipList;
        }

        equipList.forEach((skillId, index) => {
            const div = document.createElement('div');
            div.style.cssText = `border:1px dashed #ccc; padding:8px; border-radius:4px; display:flex; align-items:center; gap:10px; height:50px; background:#fff;`;

            if (skillId) {
                const item = GAME_DB.items.find(i => i.id === skillId);
                if (item) {
                    const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
                    div.style.border = "1px solid #a94442";
                    div.style.background = "#fffbfb";
                    div.innerHTML = `
                        <div style="font-size:20px;">${item.icon || '📘'}</div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:bold; color:${rarityColor}; white-space:nowrap;">${item.name}</div>
                        </div>
                        <button class="ink_btn_small btn_danger" onclick="event.stopPropagation(); UISkill.unequip('${equipKey}', ${index})">卸</button>
                    `;
                    div.onmouseenter = (e) => showSkillTooltip(e, skillId);
                    div.onmouseleave = () => hideTooltip();
                } else {
                    div.innerHTML = `<div style="color:red;">[ 数据错误 ]</div>`;
                    player.equipment[equipKey][index] = null;
                }
            } else {
                div.innerHTML = `<div style="color:#ccc; margin-left:10px;">[ 空槽位 ]</div>`;
            }
            container.appendChild(div);
        });
    },

    isEquipped: function(skillId) {
        if (!player.equipment) return false;
        const ext = player.equipment.gongfa_ext || [];
        const int = player.equipment.gongfa_int || [];
        return ext.includes(skillId) || int.includes(skillId);
    },

    handleEquipToggle: function(skillId, subType) {
        const equipKey = this.slotMapping[subType];

        if (this.isEquipped(skillId)) {
            const list = player.equipment[equipKey];
            const idx = list.indexOf(skillId);
            if (idx !== -1) this.unequip(equipKey, idx);
        } else {
            this.equip(equipKey, skillId);
        }
    },

    equip: function(equipKey, skillId) {
        const list = player.equipment[equipKey];
        const emptyIdx = list.indexOf(null);
        if (emptyIdx === -1) {
            if(window.showToast) window.showToast("该类功法槽位已满，请先卸下");
            return;
        }
        list[emptyIdx] = skillId;
        if(window.showToast) window.showToast("功法已运功");
        window.recalcStats();
        this.refresh();
    },

    unequip: function(equipKey, index) {
        player.equipment[equipKey][index] = null;
        window.recalcStats();
        this.refresh();
    }
};

window.UISkill = UISkill;