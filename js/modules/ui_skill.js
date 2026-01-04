// js/modules/ui_skill.js
console.log(">>> [UI_SKILL] 开始加载 ui_skill.js"); // 【调试日志 1】

const UISkill = {
    currentTab: 'gongfa_ext',

    open: function() {
        console.log(">>> [UI_SKILL] Open 方法被调用!"); // 【调试日志 2】
        this.showModal();
    },

    showModal: function() {
        console.log(">>> [UI_SKILL] 准备显示弹窗..."); // 【调试日志 3】
        const title = "修仙功法";
        // ... (中间的 HTML 代码保持不变，太长了这里省略) ...
        const contentHtml = `
            <div class="skill_container" style="display:flex; width:100%; height:100%; gap:15px; font-family:Kaiti;">
                <div class="skill_library" style="flex:2; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff;">
                    <div class="skill_tabs" style="display:flex; border-bottom:1px solid #eee; background:#f9f9f9;">
                        <button id="tab_gongfa_ext" class="skill_tab_btn active" onclick="UISkill.switchTab('gongfa_ext')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; font-weight:bold; font-size:16px;">外功</button>
                        <button id="tab_gongfa_int" class="skill_tab_btn" onclick="UISkill.switchTab('gongfa_int')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:16px;">内功</button>
                    </div>
                    <div id="skill_list_content" style="flex:1; overflow-y:auto; padding:10px; display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px; align-content:start;"></div>
                </div>
                <div class="skill_slots_panel" style="flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px;">
                    <div style="font-size:18px; font-weight:bold; text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px;">当前运功</div>
                    <div style="margin-bottom:10px; font-weight:bold; color:#666;">外功槽位</div>
                    <div id="slots_gongfa_ext" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;"></div>
                    <div style="margin-bottom:10px; font-weight:bold; color:#666;">内功槽位</div>
                    <div id="slots_gongfa_int" style="display:flex; flex-direction:column; gap:10px;"></div>
                </div>
            </div>
        `;

        // 尝试调用弹窗
        if (window.showGeneralModal) {
            window.showGeneralModal(title, contentHtml, null, "modal_skill", 90, 85);
        } else if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, contentHtml, null, "modal_skill", 90, 85);
        } else {
            console.error(">>> [错误] 弹窗模块(UtilsModal)未加载！");
            alert("弹窗模块未加载，无法显示界面");
            return;
        }
        this.refresh();
    },

    // ... (中间的 switchTab, renderList 等方法保持不变) ...
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
        this.switchTab(this.currentTab);
        this.renderSlots();
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
            if (item.type === this.currentTab) {
                list.push(item);
            }
        });
        if (list.length === 0) {
            container.innerHTML = `<div style="width:100%; text-align:center; color:#999; margin-top:50px;">暂无此类功法</div>`;
            return;
        }
        list.forEach(item => {
            const isEquipped = this.isEquipped(item.id);
            const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(item.id) : { levelName: '未知' };
            const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
            const card = document.createElement('div');
            card.style.cssText = `border:1px solid ${isEquipped ? '#a94442' : '#eee'}; background:${isEquipped ? '#fff5f5' : '#fff'}; padding:10px; border-radius:4px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 0.2s; position:relative;`;
            card.onmouseenter = (e) => showSkillTooltip(e, item.id);
            card.onmouseleave = () => hideTooltip();
            card.onmousemove = (e) => moveTooltip(e);
            card.onclick = () => this.handleEquipToggle(item.id);
            card.innerHTML = `
                <div style="font-size:24px;">${item.icon || '📘'}</div>
                <div style="flex:1;">
                    <div style="font-weight:bold; color:${rarityColor};">${item.name}</div>
                    <div style="font-size:12px; color:#666;">${info.levelName}</div>
                </div>
                ${isEquipped ? '<div style="font-size:12px; color:#a94442; font-weight:bold;">已装备</div>' : ''}
            `;
            container.appendChild(card);
        });
    },

    renderSlots: function() {
        this._renderSlotGroup('gongfa_ext');
        this._renderSlotGroup('gongfa_int');
    },

    _renderSlotGroup: function(type) {
        const container = document.getElementById(`slots_${type}`);
        if (!container) return;
        container.innerHTML = '';
        let equipList = player.equipment[type];
        if (!equipList) {
            equipList = [null, null, null];
            player.equipment[type] = equipList;
        }
        equipList.forEach((skillId, index) => {
            const div = document.createElement('div');
            div.style.cssText = `border:1px dashed #ccc; padding:8px; border-radius:4px; display:flex; align-items:center; gap:10px; height:50px; background:#fff;`;
            if (skillId) {
                const item = GAME_DB.items.find(i => i.id === skillId);
                const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
                div.style.border = "1px solid #a94442";
                div.style.background = "#fffbfb";
                div.innerHTML = `
                    <div style="font-size:20px;">${item.icon || '📘'}</div>
                    <div style="flex:1; overflow:hidden;">
                        <div style="font-weight:bold; color:${rarityColor}; white-space:nowrap;">${item.name}</div>
                    </div>
                    <button class="ink_btn_small btn_danger" onclick="event.stopPropagation(); UISkill.unequip('${type}', ${index})">卸</button>
                `;
                div.onmouseenter = (e) => showSkillTooltip(e, skillId);
                div.onmouseleave = () => hideTooltip();
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

    handleEquipToggle: function(skillId) {
        const item = GAME_DB.items.find(i => i.id === skillId);
        if (!item) return;
        const type = item.type;
        if (this.isEquipped(skillId)) {
            const list = player.equipment[type];
            const idx = list.indexOf(skillId);
            if (idx !== -1) this.unequip(type, idx);
        } else {
            this.equip(type, skillId);
        }
    },

    equip: function(type, skillId) {
        const list = player.equipment[type];
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

    unequip: function(type, index) {
        player.equipment[type][index] = null;
        window.recalcStats();
        this.refresh();
    }
};

window.UISkill = UISkill;
console.log(">>> [UI_SKILL] UISkill 对象已挂载到 window"); // 【调试日志 4】