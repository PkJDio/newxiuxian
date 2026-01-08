// js/modules/ui_skill.js
// 技艺系统 (整合外功、内功、生活技艺) - v2.0 统一槽位版
console.log(">>> [UI_SKILL] 开始加载 ui_skill.js");

const UISkill = {
    currentTab: 'body',

    // 映射表：Tab名称 -> 装备数据Key | 槽位数量Key
    // 【修改点1】将 body 和 cultivation 的配置统一，指向同一个装备列表和限制字段
    configMap: {
        'body': {
            equipKey: 'gongfa',      // 统一存储在 player.equipment.gongfa
            limitKey: 'gongfa_nums'  // 统一读取 player.gongfa_nums 作为上限
        },
        'cultivation': {
            equipKey: 'gongfa',      // 同上
            limitKey: 'gongfa_nums'  // 同上
        },
        'life': {
            equipKey: null,
            limitKey: null
        }
    },

    open: function() {
        console.log(">>> [UI_SKILL] Open");
        this.showModal();
    },

    showModal: function() {
        const title = "修仙技艺";
        const contentHtml = `
            <div class="skill_container" style="display:flex; width:100%; height:100%; gap:15px; font-family:Kaiti;">
                <div class="skill_library" style="flex:2; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff;">
                    <div class="skill_tabs" style="display:flex; border-bottom:1px solid #eee; background:#f9f9f9;">
                        <button id="tab_body" class="skill_tab_btn active" onclick="UISkill.switchTab('body')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; font-weight:bold; font-size:16px;">外功</button>
                        <button id="tab_cultivation" class="skill_tab_btn" onclick="UISkill.switchTab('cultivation')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:16px;">内功</button>
                        <button id="tab_life" class="skill_tab_btn" onclick="UISkill.switchTab('life')" style="flex:1; padding:10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:16px;">生活技艺</button>
                    </div>
                    <div id="skill_list_content" style="flex:1; overflow-y:auto; padding:10px; display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px; align-content:start;"></div>
                </div>

                <div class="skill_slots_panel" style="flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px; min-width: 280px;">
                    <div style="font-size:18px; font-weight:bold; text-align:center; margin-bottom:20px; border-bottom:2px solid #333; padding-bottom:10px;">当前状态</div>
                    
                    <div id="slots_dynamic_container" style="flex:1; display:flex; flex-direction:column; gap:10px;"></div>
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
            btn.style.fontWeight = 'normal';
        });
        const activeBtn = document.getElementById(`tab_${tabName}`);
        if(activeBtn) {
            activeBtn.style.color = '#333';
            activeBtn.style.borderBottom = '2px solid #a94442';
            activeBtn.style.backgroundColor = '#fff';
            activeBtn.style.fontWeight = 'bold';
        }
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
                container.innerHTML = `<div style="width:100%; text-align:center; color:#999; margin-top:50px;">暂未领悟任何生活技艺</div>`;
                return;
            }
            for (let key in player.lifeSkills) {
                const skill = player.lifeSkills[key];
                const card = document.createElement('div');
                card.style.cssText = `border:1px solid #eee; background:#fff; padding:10px; border-radius:4px; display:flex; align-items:center; gap:10px; cursor:default; position:relative;`;
                card.innerHTML = `
                    <div style="font-size:26px;">🎨</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold; color:#2e7d32;">${skill.name}</div>
                        <div style="font-size:16px; color:#666;">熟练度: <span style="color:#d4af37; font-weight:bold;">${skill.exp}</span></div>
                        <div style="font-size:16px; color:#999; margin-top:2px;">${skill.desc || '暂无描述'}</div>
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
            // 列表依然只显示当前标签页类型的功法（外功显示外功，内功显示内功），方便查找
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

            // --- 新增：检查是否有主动技能 (action) ---
            const hasAction = item.action && Object.keys(item.action).length > 0;
            // 盖章样式：红色圆圈，稍微倾斜，半透明，位于卡片右上角或图标旁
            const stampHtml = hasAction ? `
                <div style="
                    position: absolute;
                    top: -5px;          /* 微调位置，让大印章稍微出界一点更有张力 */
                    right: -5px;
                    width: 60px;        /* 20 * 3 */
                    height: 60px;       /* 20 * 3 */
                    line-height: 54px;  /* 垂直居中微调 */
                    border: 4px solid rgba(217, 83, 79, 0.4); /* 边框加粗，透明度降低一点以免遮挡文字 */
                    border-radius: 50%;
                    color: rgba(217, 83, 79, 0.3); /* 字体颜色也淡一点，做成水印背景的感觉 */
                    text-align: center;
                    font-size: 36px;    /* 12 * 3 */
                    font-weight: 900;   /* 特粗 */
                    transform: rotate(15deg);
                    pointer-events: none;
                    z-index: 0;         /* 放在底层作为背景水印 */
                    font-family: 'Kaiti', 'STKaiti', serif; /* 用楷体更有印章感 */
                ">主</div>
            ` : '';
            // ---------------------------------------

            const card = document.createElement('div');
            card.style.cssText = `border:${borderStyle}; background:${bgStyle}; padding:10px; border-radius:4px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden;`; // 增加 overflow:hidden 防止盖章溢出

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
                    <div style="font-size:14px; color:#666;">${info.levelName}</div>
                </div>
                ${isEquipped ? '<div style="font-size:12px; color:#a94442; font-weight:bold; margin-right:5px;">已装备</div>' : ''}
                ${stampHtml} `;
            container.appendChild(card);
        });
    },

    // 【修改点2】渲染右侧面板：不再区分内/外功槽位，统一渲染
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

        // 统一功法槽位标题
        const header = document.createElement('div');
        header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;";
        header.innerHTML = `<span style="font-weight:bold; color:#666;">已装备功法</span><span style="font-size:12px; color:#999;" id="limit_info_gongfa"></span>`;
        container.appendChild(header);

        // 统一功法槽位容器
        const slotsDiv = document.createElement('div');
        slotsDiv.id = "slots_gongfa"; // 统一ID
        slotsDiv.style.cssText = "display:flex; flex-direction:column; gap:10px;";
        container.appendChild(slotsDiv);

        // 渲染统一的槽位
        // 由于 configMap 中 'body' 和 'cultivation' 现在配置一样，用谁都可以，这里用 'body' 作为代表
        this._renderSlotGroup('body', 'slots_gongfa', 'limit_info_gongfa');
    },

    // 【修改点3】通用槽位渲染函数
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
            div.className = "skill_slot_box";
            // 确保相对定位，以便放置绝对定位的盖章
            div.style.position = "relative";

            if (skillId) {
                const item = books.find(id => id.id === skillId);
                if (item) {
                    const rarityColor = (RARITY_CONFIG[item.rarity] || {}).color || '#333';

                    const tag = item.subType === 'body' ? '<span style="background:#e3f2fd; color:#1565c0; padding:1px 4px; border-radius:3px; font-size:10px; margin-right:5px;">外</span>' : '<span style="background:#fce4ec; color:#c2185b; padding:1px 4px; border-radius:3px; font-size:10px; margin-right:5px;">内</span>';

                    // --- 新增：槽位也显示主动技盖章 ---
                    const hasAction = item.action && Object.keys(item.action).length > 0;
                    const stampHtml = hasAction ? `
                        <div style="
                            position: absolute;
                            bottom: 0px;       /* 沉底 */
                            right: 40px;       /* 放在卸下按钮左侧 */
                            width: 54px;       /* 18 * 3 */
                            height: 54px;      /* 18 * 3 */
                            line-height: 48px;
                            border: 3px solid rgba(217, 83, 79, 0.3);
                            border-radius: 50%;
                            color: rgba(217, 83, 79, 0.2); /* 很淡的水印感 */
                            text-align: center;
                            font-size: 30px;   /* 10 * 3 */
                            font-weight: 900;
                            transform: rotate(-15deg);
                            pointer-events: none;
                            z-index: 0;
                            font-family: 'Kaiti', 'STKaiti', serif;
                        ">主</div>
                    ` : '';
                    // --------------------------------

                    div.style.border = "1px solid #a94442";
                    div.style.background = "#fffbfb";
                    div.innerHTML = `
                        <div style="font-size:24px;">${item.icon || '📘'}</div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:bold; color:${rarityColor}; white-space:nowrap; font-size:16px; display:flex; align-items:center;">
                                ${tag}${item.name}
                            </div>
                        </div>
                        ${stampHtml}
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

    // 【修改点4】判断是否装备：只检查统一列表
    isEquipped: function(skillId) {
        if (!player.equipment || !player.equipment.gongfa) return false;
        return player.equipment.gongfa.includes(skillId);
    },

    handleEquipToggle: function(skillId, subType) {
        if (subType === 'life') return;

        // 由于现在配置统一了，直接读取映射即可
        const config = this.configMap[subType] || this.configMap['body'];
        const equipKey = config.equipKey; // 'gongfa'

        if (this.isEquipped(skillId)) {
            const list = player.equipment[equipKey];
            const idx = list.indexOf(skillId);
            if (idx !== -1) this.unequip(equipKey, idx);
        } else {
            this.equip(subType, skillId);
        }
    },

    // 【修改点5】装备逻辑：统一列表，不分类型
    equip: function(subType, skillId) {
        // subType 此时主要用来获取配置，但现在配置都指向同一个地方
        const config = this.configMap[subType] || this.configMap['body'];
        const equipKey = config.equipKey;
        const limitKey = config.limitKey;

        if (!player.equipment[equipKey]) {
            player.equipment[equipKey] = [];
        }
        const list = player.equipment[equipKey];
        // 默认3槽位
        const maxSlots = (player[limitKey] !== undefined) ? player[limitKey] : 3;

        // 找空位
        let emptyIdx = list.indexOf(null);
        // 如果列表长度小于上限，且没有null空位，则追加
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

        if(window.recalcStats) window.recalcStats();
        this.refresh();
        if(window.updateUI) window.updateUI();
        if(window.saveGame) {
            window.saveGame();
            console.log(">>> [UISkill] 装备变动，已自动存档");
        }
    },

    unequip: function(equipKey, index) {
        if (player.equipment[equipKey] && player.equipment[equipKey][index]) {
            // 使用 null 占位，或者直接 splice 删除都可以，这里用 null 保持索引稳定
            player.equipment[equipKey][index] = null;

            // 可选：清理数组末尾的 null，保持数组紧凑
            // while(player.equipment[equipKey].length > 0 && player.equipment[equipKey][player.equipment[equipKey].length-1] === null) {
            //    player.equipment[equipKey].pop();
            // }

            if(window.recalcStats) window.recalcStats();
            this.refresh();
            if(window.updateUI) window.updateUI();
            if(window.saveGame) {
                window.saveGame();
                console.log(">>> [UISkill] 装备变动，已自动存档");
            }
        }
    }
};

window.UISkill = UISkill;