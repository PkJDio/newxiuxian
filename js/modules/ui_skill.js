// js/modules/ui_skill.js
// 技艺系统 v3.5 (DOM性能优化版：事件委托 + 字符串拼接渲染)

const UISkill = {
    currentTab: 'body',
    _isStyleInjected: false,
    _boundEvents: false, // 标记是否已绑定全局事件

    configMap: {
        'body': { equipKey: 'gongfa', limitKey: 'gongfa_nums' },
        'cultivation': { equipKey: 'gongfa', limitKey: 'gongfa_nums' },
        'life': { equipKey: null, limitKey: null }
    },

    // ================= CSS 样式注入 =================
    _injectStyles: function() {
        if (this._isStyleInjected) return;

        const cssContent = `
            /* --- 容器布局 --- */
            .skill_container { display:flex; width:100%; height:100%; gap:15px; font-family:"KaiTi", "楷体", serif; overflow:hidden; contain: strict; }
            .skill_library { flex:3; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fff; min-width: 0; contain: content; }
            .skill_slots_panel { flex:1; display:flex; flex-direction:column; border:1px solid #ddd; border-radius:4px; background:#fcfcfc; padding:15px; min-width: 280px; max-width: 320px; contain: content; }
            
            /* --- 标签页 --- */
            .skill_tabs { display:flex; border-bottom:1px solid #eee; background:#f9f9f9; flex-shrink: 0; }
            .skill_tab_btn { flex:1; padding:12px 10px; border:none; background:transparent; cursor:pointer; color:#888; font-size:18px; transition: all 0.2s; font-family:"KaiTi"; }
            .skill_tab_btn.active { color:#333; border-bottom:3px solid #a94442; background:#fff; font-weight:bold; }
            .skill_tab_btn:hover { background: #f0f0f0; }

            /* --- 列表区域 (开启硬件加速) --- */
            #skill_list_content { 
                flex:1; overflow-y:auto; padding:15px; 
                display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); 
                grid-auto-rows: max-content; gap:12px; align-content:start; 
                will-change: scroll-position;
            }
            #skill_list_content::-webkit-scrollbar { width: 6px; }
            #skill_list_content::-webkit-scrollbar-track { background: #f1f1f1; }
            #skill_list_content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

            /* --- 卡片通用样式 --- */
            .skill_card { 
                position:relative; min-height: 70px; 
                display:flex; align-items:center; gap:12px; padding:12px; 
                border:1px solid #eee; background:#fff; border-radius:6px; 
                cursor:pointer; transition:transform 0.1s; overflow:hidden; 
                /* 减少重绘 */
                content-visibility: auto; 
                contain-intrinsic-size: 70px;
            }
            .skill_card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #ccc; }
            
            /* 状态修饰 */
            .skill_card.mastered { background:#fffdf5; border-color:#ffecb3; }
            .skill_card.equipped:not(.art_full_base):not(.art_part_base) { border-color:#a94442; background:#fff5f5; }

            /* 完整功法样式 */
            .art_full_base { border-width: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .art_full_base::before {
                content: ""; position: absolute; top:0; left:0; right:0; bottom:0;
                border-radius: 6px; padding: 2px; pointer-events: none;
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.6;
            }
            .art_full_base::after { content: "◈"; position: absolute; right: -10px; bottom: -20px; font-size: 80px; font-family: serif; pointer-events: none; opacity: 0.05; z-index: 0; }

            /* 残卷功法样式 */
            .art_part_base {
                border-style: dashed; border-width: 2px; background-color: #fcf9f2;
                clip-path: polygon(0% 0%, 85% 0%, 90% 5%, 88% 8%, 92% 12%, 100% 15%, 100% 100%, 0% 100%);
            }
            .art_part_base::before { content: ""; position: absolute; top:0; left:0; right:0; bottom:0; background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"); opacity: 0.4; pointer-events: none; z-index: 0; }
            .art_part_base::after { content: "残"; position: absolute; right: 10px; bottom: -10px; font-size: 60px; font-family: "KaiTi", serif; pointer-events: none; opacity: 0.06; z-index: 0; transform: rotate(-10deg); }

            /* 稀有度配色 (R1-R6) */
            .art_r1 { border-color: #546e7a; } .art_full_base.art_r1 { background: linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%); } .art_full_base.art_r1 .skill_name { color: #37474f !important; } .art_part_base.art_r1 .skill_name { color: #546e7a !important; opacity: 0.8; }
            .art_r2 { border-color: #2e7d32; } .art_full_base.art_r2 { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); } .art_full_base.art_r2 .skill_name { color: #1b5e20 !important; } .art_part_base.art_r2 .skill_name { color: #2e7d32 !important; opacity: 0.8; }
            .art_r3 { border-color: #1565c0; } .art_full_base.art_r3 { background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); } .art_full_base.art_r3 .skill_name { color: #0d47a1 !important; } .art_part_base.art_r3 .skill_name { color: #1565c0 !important; opacity: 0.8; }
            .art_r4 { border-color: #6a1b9a; } .art_full_base.art_r4 { background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); } .art_full_base.art_r4 .skill_name { color: #4a148c !important; } .art_part_base.art_r4 .skill_name { color: #6a1b9a !important; opacity: 0.8; }
            .art_r5 { border-color: #3e2723; } .art_full_base.art_r5 { background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%); } .art_full_base.art_r5 .skill_name { color: #bf360c !important; text-shadow: 0 0 1px rgba(191, 54, 12, 0.2); } .art_part_base.art_r5 .skill_name { color: #d84315 !important; opacity: 0.9; }
            .art_r6 { border-color: #b71c1c; } .art_full_base.art_r6 { background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); } .art_full_base.art_r6 .skill_name { color: #b71c1c !important; text-shadow: 0 0 2px rgba(183, 28, 28, 0.2); } .art_part_base.art_r6 .skill_name { color: #c62828 !important; opacity: 0.9; }

            /* 流光特效 */
            .art_r1.art_full_base::before { background: linear-gradient(45deg, transparent, #90a4ae, transparent); }
            .art_r2.art_full_base::before { background: linear-gradient(45deg, transparent, #66bb6a, transparent); }
            .art_r3.art_full_base::before { background: linear-gradient(45deg, transparent, #42a5f5, transparent); }
            .art_r4.art_full_base::before { background: linear-gradient(45deg, transparent, #ab47bc, transparent); }
            .art_r5.art_full_base::before { background: linear-gradient(45deg, transparent, #ffb300, transparent); }
            .art_r6.art_full_base::before { background: linear-gradient(45deg, transparent, #e53935, transparent); }

            .skill_icon { font-size:28px; width: 40px; text-align:center; z-index: 1; }
            .skill_info { flex:1; overflow:hidden; position: relative; z-index: 2; pointer-events: none; } /* 减少事件冒泡 */
            .skill_name { font-weight:bold; color:#333; font-size: 17px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .skill_level { font-size:14px; color:#666; }

            .card_badge { position: absolute; top: 0; left: 0; background: #a94442; color: #fff; font-size: 12px; font-weight: bold; padding: 2px 8px; border-bottom-left-radius: 6px; z-index: 10; box-shadow: -1px 1px 2px rgba(0,0,0,0.2); pointer-events: none; }
            .skill_stamp { position: absolute; bottom: -13px; right: -5%; width: 60px; height: 60px; line-height: 54px; border: 3px solid #8b0000; color: #8b0000; opacity: 0.8; border-radius: 50%; text-align: center; font-size: 34px; font-weight: 900; transform: rotate(-25deg); pointer-events: none; z-index: 0; }

            /* 右侧面板 */
            .slots_header { font-size:18px; font-weight:bold; text-align:center; margin-bottom:15px; border-bottom:2px solid #ddd; padding-bottom:10px; color:#555; }
            .slots_container { flex:1; display:flex; flex-direction:column; gap:12px; overflow-y: auto; }
            .slot_info_row { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; font-size: 14px; color:#666; }

            .skill_slot_box { position: relative; min-height: 75px; border-radius: 6px; display: flex; align-items: center; box-sizing: border-box; transition: all 0.2s; overflow: hidden; content-visibility: auto; }
            .skill_slot_box.filled { padding: 12px; gap: 12px; border: 1px solid #a94442; background: #fffbfb; justify-content: flex-start; }
            .skill_slot_box.empty { justify-content: center; border: 2px dashed #e0e0e0; background: #fafafa; color: #ccc; font-size: 16px; font-weight: bold; letter-spacing: 2px; }
            .skill_slot_box.empty:hover { border-color: #bbb; background: #f5f5f5; color: #999; }

            .btn_unequip { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; border: 1px solid #dcdcdc; background: #fff; color: #999; font-size: 14px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 5; font-family: "KaiTi"; }
            .btn_unequip:hover { background: #ffebee; border-color: #ef5350; color: #c62828; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            
            .art_full_base .btn_unequip, .art_part_base .btn_unequip { border-color: rgba(0,0,0,0.1); background: rgba(255,255,255,0.6); }
            .art_full_base .btn_unequip:hover, .art_part_base .btn_unequip:hover { background: #fff; border-color: #c62828; }

            .tag_body { background:#e3f2fd; color:#1565c0; padding:2px 5px; border-radius:3px; font-size:12px; margin-right:5px; }
            .tag_cult { background:#fce4ec; color:#c2185b; padding:2px 5px; border-radius:3px; font-size:12px; margin-right:5px; }
            .text-empty { grid-column: 1 / -1; display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 200px; text-align: center; color: #999; font-size: 18px; }
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
        // --- 修改部分开始 ---
        // 检查并触发技艺界面引导
        if (window.UITutorial && window.UITutorial.checkBuilding) {
            // 复用 checkBuilding 逻辑，传入 'skill' 标识
            window.UITutorial.checkBuilding('skill');
        }
    },

    showModal: function() {
        const title = "修仙技艺";

        // --- 修改点：根据当前 tab 动态计算 class ---
        const getTabClass = (tab) => this.currentTab === tab ? "skill_tab_btn active" : "skill_tab_btn";

        const contentHtml = `
        <div class="skill_container">
            <div class="skill_library">
                <div class="skill_tabs">
                    <button id="tab_body" class="${getTabClass('body')}" onclick="UISkill.switchTab('body')">外功</button>
                    <button id="tab_cultivation" class="${getTabClass('cultivation')}" onclick="UISkill.switchTab('cultivation')">内功</button>
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
                <div class="slots_header">当前运功</div>
                <div id="slots_dynamic_container" class="slots_container"></div>
            </div>
        </div>
    `;

        if (window.showGeneralModal) {
            window.showGeneralModal(title, contentHtml, null, "modal_skill", 68, 80);
        } else if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, contentHtml, null, "modal_skill", 75, 80);
        }

        this.refresh();
    },

    switchTab: function(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.skill_tab_btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`tab_${tabName}`);
        if(activeBtn) activeBtn.classList.add('active');

        this.renderList();
        this.renderRightPanel();
    },

    refresh: function() {
        // 使用 requestAnimationFrame 避免在同一帧内做太多事
        requestAnimationFrame(() => {
            if(document.getElementById('skill_list_content')) {
                this.renderList();
                this.renderRightPanel();
            }
        });
    },

    // ================= 列表渲染 (HTML String 优化版) =================
    renderList: function() {
        const container = document.getElementById('skill_list_content');
        if (!container) return;

        // 1. 处理生活技艺
        // 1. 处理生活技艺
        if (this.currentTab === 'life') {
            // 使用工具类获取标准化数据
            const skillList = window.UtilsLifeSkills ? UtilsLifeSkills.getSkillListForUI() : [];

            if (skillList.length === 0) {
                container.innerHTML = `<div class="text-empty">暂未领悟任何生活技艺</div>`;
                return;
            }

            let html = '';
            skillList.forEach(item => {
                const expText = item.isMax ? "已臻化境" : `${item.exp} / ${item.maxExp}`;

                // 构建带进度条的卡片 HTML
                html += `
                <div class="skill_card" style="cursor:default; display:flex; flex-direction:column; align-items:stretch; padding:12px; height:auto; min-height:90px;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="skill_icon" style="font-size:24px;">🎨</div>
                            <div>
                                <div class="skill_name" style="color:#2e7d32; font-size:18px;">${item.name}</div>
                                <div style="font-size:12px; color:#888;">Lv.${item.level} <span style="color:#aaa;">(${item.realm})</span></div>
                            </div>
                        </div>
                        <div style="font-size:14px; font-weight:bold; color:#d4af37;">${expText}</div>
                    </div>

                    <div style="font-size:13px; color:#666; margin-bottom:8px; line-height:1.4;">${item.desc}</div>

                    <div style="background:#e0e0e0; height:8px; border-radius:4px; overflow:hidden; width:100%;">
                        <div style="background:linear-gradient(90deg, #4caf50, #8bc34a); width:${item.percent}%; height:100%; transition:width 0.3s;"></div>
                    </div>
                </div>`;
            });
            container.innerHTML = html;
            return;
        }

        // 2. 处理战斗功法
        if (!player.skills) return;
        const learnedIds = Object.keys(player.skills);

        // 预筛选和排序
        const list = learnedIds.reduce((acc, id) => {
            const item = books.find(i => i.id === id);
            if (item && item.subType === this.currentTab) acc.push(item);
            return acc;
        }, []).sort((a, b) => {
            const isFullA = a.id.includes('_full') ? 1 : 0;
            const isFullB = b.id.includes('_full') ? 1 : 0;
            if (isFullA !== isFullB) return isFullB - isFullA;
            const rA = a.rarity || 1;
            const rB = b.rarity || 1;
            if (rA !== rB) return rB - rA;
            const expA = player.skills[a.id] ? player.skills[a.id].exp : 0;
            const expB = player.skills[b.id] ? player.skills[b.id].exp : 0;
            return expB - expA;
        });

        if (list.length === 0) {
            container.innerHTML = `<div class="text-empty">暂无此类功法<br><span style="font-size:14px; color:#bbb; margin-top:8px;">去天道或者研读获取吧</span></div>`;
            return;
        }

        // 3. 构建 HTML 字符串 (比 document.createElement 快 2-3 倍)
        let htmlBuffer = '';
        const len = list.length;
        // 如果数量极大，可以限制渲染数量 (例如只渲染前 60 个，配合滚动加载，目前暂全渲染)

        for (let i = 0; i < len; i++) {
            const item = list[i];
            const skillData = player.skills[item.id];
            const isEquipped = this.isEquipped(item.id);
            // 简单获取等级，避免重复调用 UtilsSkill (如果可能)
            const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(item.id) : { levelName: '未知' };
            const rarity = item.rarity || 1;
            const rarityColor = (RARITY_CONFIG[rarity] || {}).color || '#333';
            const isMastered = skillData && skillData.mastered;

            const isFullArts = item.id.includes('_full');
            const isPartArts = !isFullArts && (item.id.includes('_upper') || item.id.includes('_middle') || item.id.includes('_lower'));
            const hasAction = item.action && Object.keys(item.action).length > 0;

            let cls = 'skill_card';
            if (isMastered) cls += ' mastered';
            else if (isEquipped) cls += ' equipped';
            if (isFullArts) cls += ` art_full_base art_r${rarity}`;
            else if (isPartArts) cls += ` art_part_base art_r${rarity}`;

            // 使用 data-id 存储 ID，用于事件委托
            htmlBuffer += `
                <div class="${cls}" data-id="${item.id}" data-type="${item.subType}">
                    <div class="skill_icon">${item.icon || '📘'}</div>
                    <div class="skill_info">
                        <div class="skill_name" style="color:${rarityColor};">
                            ${item.name} 
                            ${isMastered ? '<span style="color:#d4af37; font-size:12px; margin-left:4px;">(参悟)</span>' : ''}
                        </div>
                        <div class="skill_level">${info.levelName}</div>
                    </div>
                    ${isEquipped ? '<div class="card_badge">运功</div>' : ''}
                    ${hasAction ? '<div class="skill_stamp">主</div>' : ''}
                </div>`;
        }

        container.innerHTML = htmlBuffer;
    },

    // ================= 事件委托处理 (性能核心) =================
    // 只有当鼠标真正交互时才计算逻辑，避免了给几百个元素绑定事件的开销
    onListClick: function(e) {
        const card = e.target.closest('.skill_card');
        if (card && card.dataset.id) {
            this.handleEquipToggle(card.dataset.id, card.dataset.type);
        }
    },

    onListHover: function(e) {
        const card = e.target.closest('.skill_card');
        if (card && card.dataset.id) {
            showSkillTooltip(e, card.dataset.id); // 假设全局有这个函数
        }
    },

    onListOut: function(e) {
        hideTooltip(); // 假设全局有这个函数
    },

    onListMove: function(e) {
        moveTooltip(e); // 假设全局有这个函数
    },

    // ================= 右侧面板渲染 (同理优化) =================
    renderRightPanel: function() {
        const container = document.getElementById('slots_dynamic_container');
        if (!container) return;

        if (this.currentTab === 'life') {
            container.innerHTML = `
                <div style="padding:20px; text-align:center; color:#666; font-size:16px; background:#f0f0f0; border-radius:6px; line-height: 1.6;">
                    <p style="margin-bottom:15px; font-weight:bold; font-size: 18px;">🍃 道法自然</p>
                    <p>生活技艺无需装备，<br>在日常行动中即可自动生效。</p>
                </div>`;
            return;
        }

        const config = this.configMap[this.currentTab];
        if (!config || !config.equipKey) return;

        const equipKey = config.equipKey;
        const limitKey = config.limitKey;

        // 确保数据结构
        if (!player.equipment) player.equipment = {};
        if (!player.equipment[equipKey]) player.equipment[equipKey] = [];
        const realList = player.equipment[equipKey];
        const maxSlots = (player[limitKey] !== undefined) ? player[limitKey] : 3;

        let html = `
            <div class="slot_info_row">
                <span style="font-weight:bold;">已装备功法</span>
                <span>(${realList.filter(x=>x).length} / ${maxSlots})</span>
            </div>
            <div id="slots_gongfa" class="slots_container">`;

        for (let i = 0; i < maxSlots; i++) {
            const skillId = realList[i];
            if (skillId) {
                const item = books.find(id => id.id === skillId);
                if (item) {
                    const isFullArts = item.id.includes('_full');
                    const isPartArts = !isFullArts && (item.id.includes('_upper') || item.id.includes('_middle') || item.id.includes('_lower'));
                    const rarity = item.rarity || 1;

                    let boxClass = "skill_slot_box filled";
                    if (isFullArts) boxClass += ` art_full_base art_r${rarity}`;
                    else if (isPartArts) boxClass += ` art_part_base art_r${rarity}`;

                    const rarityColor = (RARITY_CONFIG[rarity] || {}).color || '#333';
                    const tagClass = item.subType === 'body' ? 'tag_body' : 'tag_cult';
                    const tagName = item.subType === 'body' ? '外' : '内';

                    // 内联事件：因为只有几个槽位，内联绑定影响不大，且方便传参
                    html += `
                        <div class="${boxClass}" 
                             onmouseenter="showSkillTooltip(event, '${skillId}')" 
                             onmouseleave="hideTooltip()">
                            <div style="font-size:28px;">${item.icon || '📘'}</div>
                            <div style="flex:1; overflow:hidden;">
                                <div style="font-weight:bold; color:${rarityColor}; white-space:nowrap; font-size:16px; display:flex; align-items:center;">
                                    <span class="${tagClass}">${tagName}</span>${item.name}
                                </div>
                            </div>
                            <div class="btn_unequip" onclick="event.stopPropagation(); UISkill.unequip('${equipKey}', ${i})" title="卸下">卸</div>
                        </div>`;
                } else {
                    html += `<div class="skill_slot_box empty"><span style="color:red; font-size:14px;">[ 错误 ]</span></div>`;
                }
            } else {
                html += `<div class="skill_slot_box empty">未装备</div>`;
            }
        }
        html += `</div>`;
        container.innerHTML = html;
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

    _refreshData: function() {
        if(window.recalcStats) window.recalcStats();
        this.refresh();
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
    }
};

window.UISkill = UISkill;