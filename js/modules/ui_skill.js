// js/modules/ui_skill.js
// 修复：装备/卸下后强制存档 (解决刷新丢失问题)
console.log(">>> [UI_SKILL] 开始加载 ui_skill.js");

const UISkill = {
    currentTab: 'body',

    configMap: {
        'body': {
            equipKey: 'gongfa_ext',
            limitKey: 'gongfa_ext'
        },
        'cultivation': {
            equipKey: 'gongfa_int',
            limitKey: 'gongfa_int'
        }
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

                <div class="skill_slots_panel" style="flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px; min-width: 280px;">
                    <div style="font-size:18px; font-weight:bold; text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px;">当前运功</div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-weight:bold; color:#666;">外功槽位</span>
                        <span style="font-size:12px; color:#999;" id="limit_info_body"></span>
                    </div>
                    <div id="slots_body" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;"></div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span style="font-weight:bold; color:#666;">内功槽位</span>
                        <span style="font-size:12px; color:#999;" id="limit_info_cultivation"></span>
                    </div>
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

        // 排序
        list.sort((a, b) => {
            const rA = a.rarity || 1;
            const rB = b.rarity || 1;
            if (rA !== rB) return rB - rA;
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
        const limitInfo = document.getElementById(`limit_info_${tabName}`);

        if (!container) return;
        container.innerHTML = '';

        const config = this.configMap[tabName];
        if (!config) return;

        const equipKey = config.equipKey;
        const limitKey = config.limitKey;

        const realList = player.equipment[equipKey] || [];
        const maxSlots = (player[limitKey] !== undefined) ? player[limitKey] : 1;

        if (limitInfo) {
            limitInfo.innerText = `(${realList.filter(x=>x).length} / ${maxSlots})`;
        }

        for (let i = 0; i < maxSlots; i++) {
            const skillId = realList[i] || null;

            const div = document.createElement('div');
            div.className = "skill_slot_box";

            if (skillId) {
                const item = GAME_DB.items.find(id => id.id === skillId);
                if (item) {
                    const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
                    div.style.border = "1px solid #a94442";
                    div.style.background = "#fffbfb";
                    div.innerHTML = `
                        <div style="font-size:24px;">${item.icon || '📘'}</div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:bold; color:${rarityColor}; white-space:nowrap; font-size:16px;">${item.name}</div>
                        </div>
                        <button class="ink_btn_small btn_danger" onclick="event.stopPropagation(); UISkill.unequip('${equipKey}', ${i})">卸</button>
                    `;
                    div.onmouseenter = (e) => showSkillTooltip(e, skillId);
                    div.onmouseleave = () => hideTooltip();
                } else {
                    div.innerHTML = `<div style="color:red;">[ 数据错误 ]</div>`;
                    if (i < realList.length) player.equipment[equipKey][i] = null;
                }
            } else {
                div.innerHTML = `<div class="skill_slot_empty">未装备</div>`;
            }
            container.appendChild(div);
        }
    },

    isEquipped: function(skillId) {
        if (!player.equipment) return false;
        const ext = player.equipment.gongfa_ext || [];
        const int = player.equipment.gongfa_int || [];
        return ext.includes(skillId) || int.includes(skillId);
    },

    handleEquipToggle: function(skillId, subType) {
        const config = this.configMap[subType];
        if (!config) return;
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
        const config = this.configMap[subType];
        if (!config) return;

        const equipKey = config.equipKey;
        const limitKey = config.limitKey;

        if (!player.equipment[equipKey]) {
            player.equipment[equipKey] = [];
        }
        const list = player.equipment[equipKey];
        const maxSlots = (player[limitKey] !== undefined) ? player[limitKey] : 1;

        let emptyIdx = list.indexOf(null);
        if (emptyIdx === -1 && list.length < maxSlots) {
            emptyIdx = list.length;
            list.push(null);
        }

        if (emptyIdx === -1 || emptyIdx >= maxSlots) {
            if(window.showToast) window.showToast("该类功法槽位已满，请先卸下或提升境界增加槽位");
            return;
        }

        // 1. 修改数据
        list[emptyIdx] = skillId;
        if(window.showToast) window.showToast("功法已运功");

        // 2. 重算属性
        if(window.recalcStats) window.recalcStats();

        // 3. 刷新UI
        this.refresh();
        if(window.updateUI) window.updateUI();

        // 4. 【核心修复】立即存档
        if(window.saveGame) {
            window.saveGame();
            console.log(">>> [UISkill] 装备变动，已自动存档");
        }
    },

    unequip: function(equipKey, index) {
        if (player.equipment[equipKey][index]) {
            // 1. 修改数据
            player.equipment[equipKey][index] = null;

            // 2. 重算属性
            if(window.recalcStats) window.recalcStats();

            // 3. 刷新UI
            this.refresh();
            if(window.updateUI) window.updateUI();

            // 4. 【核心修复】立即存档
            if(window.saveGame) {
                window.saveGame();
                console.log(">>> [UISkill] 装备变动，已自动存档");
            }
        }
    }
};

window.UISkill = UISkill;