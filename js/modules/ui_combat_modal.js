// js/modules/ui_combat_modal.js
// 战斗弹窗UI管理器 v3.1 (样式完全还原 + 模块化逻辑适配)

const UICombatModal = {
    // 内部标记：样式是否已注入
    _isStyleInjected: false,

    // 【还原样式】保留所有原本的动画与视觉细节
    _injectStyles: function() {
        if (this._isStyleInjected) return;

        const cssContent = `
            .combat-wrapper { display: flex; flex-direction: column; height: 100%; min-height: 550px; font-family: "Kaiti", serif; font-size: 20px; color: #333; position:relative; }
            .combat-header { display: flex; justify-content: space-between; align-items: stretch; padding: 5px 10px; background: #fdfbf7; border-bottom: 3px double #8d6e63; flex-shrink: 0; gap: 5px; }
            .fighter-card { flex: 1; display: flex; flex-direction: column; gap: 4px; }
            .fighter-top { display: flex; align-items: center; gap: 8px; }
            .fighter-icon { font-size: 40px; animation: combat-float 3s infinite; }
            .fighter-info { display: flex; flex-direction: column; justify-content: center; }
            .fighter-name { font-size: 22px; font-weight: bold; line-height: 1.1; }
            .fighter-rank { font-size: 16px; font-weight: bold; padding: 1px 5px; border-radius: 4px; }
            .player-rank { background: #1976d2; color: #fff; }
            .vs-divider { font-size: 32px; font-weight: bold; color: #a94442; align-self: center; width: 40px; text-align: center; }
            .stats-panel { background: rgba(0,0,0,0.03); padding: 6px 8px; border-radius: 8px; border: 1px solid #e0e0e0; }
            .bar-row { display: flex; gap: 8px; align-items: center; margin-bottom: 4px; }
            .mp-row { margin-bottom: 6px; }
            .hp-bar-container { flex: 1; display: flex; align-items: center; gap: 5px; }
            .bar-label { font-size: 20px; color: #d32f2f; font-weight: bold; width: 24px; text-align: center; }
            .hp-bar-bg { flex: 1; height: 18px; background: #ddd; border: 2px solid #bbb; border-radius: 9px; overflow: hidden; position: relative; }
            .hp-bar-fill { height: 100%; width: 100%; background: linear-gradient(45deg, #e53935 25%, #ef5350 25%, #ef5350 50%, #e53935 50%, #e53935 75%, #ef5350 75%, #ef5350); background-size: 40px 40px; animation: combat-liquid-move 2s linear infinite; transition: width 0.4s ease-out; }
            .hp-text { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 2px #000; z-index: 2; line-height:1; }
            .tox-bar-container { width: 100px; display: flex; align-items: center; gap: 4px; }
            .tox-label { font-size: 18px; color: #9c27b0; font-weight: bold; }
            .tox-bar-bg { flex: 1; height: 10px; background: #eee; border: 1px solid #ccc; border-radius: 5px; overflow: hidden; }
            .tox-bar-fill { height: 100%; background: #9c27b0; width: 0%; transition: width 0.3s; }
            .tox-val { font-size: 14px; color: #666; width: 30px; text-align: right; }
            
            .attr-row { display: flex; justify-content: space-around; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif; }
            .attr-item { display: flex; align-items: center; gap: 4px; padding: 2px 4px; border-radius: 4px; transition: background 0.2s; position: relative; cursor: help; }
            .attr-text { font-size: 16px; color: #555; margin-right: 2px; font-weight: normal; font-family: "Kaiti"; }
            .attr-debuff { color: #f57f17 !important; background: rgba(245, 127, 23, 0.1); border: 1px solid rgba(245, 127, 23, 0.3); }
            .attr-buff { color: #2e7d32 !important; background: rgba(46, 125, 50, 0.1); border: 1px solid rgba(46, 125, 50, 0.3); }

            .combat-body { flex: 1; display: flex; overflow: hidden; border-top: 1px solid #d4a76a; }
            #combat_log_container_embed { flex: 1; background: #fffbf0; padding: 20px; overflow-y: auto; border-right: 2px solid #e0d0b0; will-change: scroll-position; }
            #combat_logs_realtime { font-family: 'Courier New', monospace; font-size: 18px; line-height: 1.6; color: #333; }
            
            .combat-sidebar-split { width: 190px; background: #f8f1e0; display: flex; box-shadow: -4px 0 10px rgba(0,0,0,0.05); z-index: 10; }
            .sidebar-col { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 5px; }
            .sidebar-divider { width: 1px; background: #d7ccc8; margin: 5px 0; }
            .sidebar-title { font-size: 18px; font-weight: bold; color: #5d4037; border-bottom: 2px solid #a1887f; width: 100%; text-align: center; padding-bottom: 4px; margin-bottom: 8px; }
            .sidebar-items-container { display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: center; overflow-y: auto; }

            .c-slot-wrapper { width: 76px; height: 86px; background: #fff; border: 2px solid #d7ccc8; border-radius: 6px; padding: 3px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 5px rgba(0,0,0,0.1); position: relative; }
            .c-slot-box { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #fafafa; border: 1px dashed #ddd; border-radius: 2px; overflow: hidden; position: relative; }
            .c-icon { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; font-size: 26px; line-height: 1; transform: translateY(-2px); }
            .c-name-label { font-size: 11px; color: #333; font-weight: bold; text-align: center; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
            .c-count { position: absolute; top: 1px; right: 1px; background: rgba(0,0,0,0.7); color: #fff; font-size: 9px; padding: 0 3px; border-radius: 2px; }
            .c-slot-empty { font-size: 12px; color: #ccc; }
            .c-use-btn { width: 100%; font-size: 11px; padding: 2px 0; margin-top: 2px; }
            .c-cd-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.75); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #333; z-index: 5; cursor: not-allowed; }
            
            @keyframes combat-liquid-move { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
            @keyframes combat-float { 0% {transform: translateY(0px);} 50% {transform: translateY(-6px);} 100% {transform: translateY(0px);} }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-combat-modal';
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);
        this._isStyleInjected = true;
    },

    /**
     * 还原补丁逻辑
     */
    _patchEnemyData: function(enemy) {
        if (enemy.basePen === undefined) {
            const tmplKey = enemy.template || "minion";
            if (typeof ENEMY_TEMPLATES !== 'undefined' && ENEMY_TEMPLATES[tmplKey]) {
                enemy.basePen = ENEMY_TEMPLATES[tmplKey].basePen;
            }
        }
        if (enemy.toxAtk === undefined) {
            const db = window.all_enemies || (window.GAME_DB ? window.GAME_DB.all_enemies : []);
            if (db && db.length > 0) {
                const template = db.find(e => e.id === enemy.id);
                if (template && template.stats && template.stats.toxicity) {
                    enemy.toxAtk = template.stats.toxicity;
                    if (enemy.toxicity === undefined) enemy.toxicity = 0;
                    if (!enemy.stats) enemy.stats = {};
                    enemy.stats.toxAtk = template.stats.toxicity;
                }
            }
        }
        enemy.basePen = enemy.basePen || 0;
    },

    /**
     * 显示逻辑：适配波次与逃跑控制
     */
    show: function(enemy, externalOnWin = null, options = { canEscape: true, isMultiWave: false }) {
        if (!window.Combat || !window.UtilsModal) return;
        console.log("接收到的战斗配置:", options);

        this._injectStyles();
        this._patchEnemyData(enemy);

        if (window.recalcStats) window.recalcStats();

        const pDerived = window.player.derived || {};
        const pName = window.player.name || "少侠";
        const currentPTox = window.player.toxicity || 0;

        // 数值计算
        const eMaxHp = (enemy.stats && enemy.stats.maxHp !== undefined) ? enemy.stats.maxHp : (enemy.maxHp || enemy.hp || 100);
        const eHpPct = Math.max(0, Math.min(100, (enemy.hp / eMaxHp) * 100));
        const pHpPct = Math.max(0, Math.min(100, (pDerived.hp / pDerived.hpMax) * 100));
        const pMpPct = Math.max(0, Math.min(100, ((pDerived.mp || 0) / (pDerived.mpMax || 100)) * 100));

        const rankMap = { "minion": "普通", "elite": "【精英】", "boss": "【头目】", "lord": "【领主】" };
        const displayRank = rankMap[enemy.template || "minion"] || "普通";

        const contentHtml = `
        <div class="combat-wrapper">
            <div class="combat-header">
                <div class="fighter-card enemy">
                    <div class="fighter-top">
                        <div class="fighter-icon">${enemy.visual?.icon || '💀'}</div>
                        <div class="fighter-info">
                            <div class="fighter-name" style="color:${enemy.visual?.color || '#333'};">${enemy.name}</div>
                            <span class="fighter-rank" style="border-color:${enemy.visual?.color || '#333'}; color:${enemy.visual?.color || '#333'};">${displayRank}</span>
                        </div>
                    </div>
                    <div class="stats-panel">
                        <div class="bar-row">
                            <div class="hp-bar-container">
                                <div class="bar-label">❤</div>
                                <div class="hp-bar-bg">
                                    <div id="combat_e_hp_bar" class="hp-bar-fill" style="width:${eHpPct}%"></div>
                                    <div class="hp-text"><b id="combat_e_hp">${enemy.hp}</b>/${eMaxHp}</div>
                                </div>
                            </div>
                            <div class="tox-bar-container">
                                <div class="tox-label">☠</div>
                                <div class="tox-bar-bg"><div id="combat_e_tox_bar" class="tox-bar-fill" style="width:${enemy.toxicity || 0}%"></div></div>
                                <div id="combat_e_tox_val" class="tox-val">${enemy.toxicity || 0}</div>
                            </div>
                        </div>
                        <div class="attr-row">
                            <span class="attr-item" id="e_attr_atk"><span class="attr-text">攻击</span><span class="attr-val">${enemy.atk}</span></span>
                            <span class="attr-item" id="e_attr_def"><span class="attr-text">防御</span><span class="attr-val">${enemy.def}</span></span>
                            <span class="attr-item" id="e_attr_spd"><span class="attr-text">速度</span><span class="attr-val">${enemy.speed}</span></span>
                        </div>
                    </div>
                </div>

                <div class="vs-divider">VS</div>

                <div class="fighter-card player">
                    <div class="fighter-top" style="flex-direction:row-reverse;">
                        <div class="fighter-icon">🧘</div>
                        <div class="fighter-info" style="align-items:flex-end;">
                            <div class="fighter-name">${pName}</div>
                            <span class="fighter-rank player-rank">修仙者</span>
                        </div>
                    </div>
                    <div class="stats-panel">
                        <div class="bar-row">
                            <div class="hp-bar-container">
                                <div class="bar-label">❤</div>
                                <div class="hp-bar-bg">
                                    <div id="combat_p_hp_bar" class="hp-bar-fill" style="width:${pHpPct}%"></div>
                                    <div class="hp-text"><b id="combat_p_hp">${pDerived.hp}</b>/${pDerived.hpMax}</div>
                                </div>
                            </div>
                            <div class="tox-bar-container">
                                <div class="tox-label">☠</div>
                                <div class="tox-bar-bg"><div id="combat_p_tox_bar" class="tox-bar-fill" style="width:${currentPTox}%"></div></div>
                                <div id="combat_p_tox_val" class="tox-val">${currentPTox}</div>
                            </div>
                        </div>
                        <div class="bar-row mp-row">
                            <div class="hp-bar-container">
                                <div class="bar-label" style="color:#1976d2;">⚡</div>
                                <div class="hp-bar-bg" style="border-color:#90caf9;">
                                    <div id="combat_p_mp_bar" class="hp-bar-fill" style="width:${pMpPct}%; background:linear-gradient(45deg, #1976d2, #42a5f5); animation:none;"></div>
                                    <div class="hp-text"><b id="combat_p_mp">${Math.floor(pDerived.mp || 0)}</b>/${Math.floor(pDerived.mpMax || 100)}</div>
                                </div>
                            </div>
                            <div style="width:120px;"></div>
                        </div>
                        <div class="attr-row">
                            <span class="attr-item" id="p_attr_atk"><span class="attr-text">攻击</span><span class="attr-val">${pDerived.atk}</span></span>
                            <span class="attr-item" id="p_attr_def"><span class="attr-text">防御</span><span class="attr-val">${pDerived.def}</span></span>
                            <span class="attr-item" id="p_attr_spd"><span class="attr-text">速度</span><span class="attr-val">${pDerived.speed}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="combat-body">
                <div id="combat_log_container_embed">
                    <div id="combat_desc_initial" style="text-align:center; padding-top: 60px;">
                        <div style="font-size:28px; line-height:1.5; color:#5d4037; font-weight:bold; margin-bottom: 30px;">“${enemy.desc || '强敌来袭！'}”</div>
                        <div style="font-size:20px; color:#999;">(点击下方“拔剑迎敌”开始战斗)</div>
                    </div>
                    <div id="combat_logs_realtime"></div>
                </div>
                <div id="combat_sidebar_content" class="combat-sidebar-split">
                    <div class="sidebar-col"><div class="sidebar-title">丹药</div><div id="sidebar_consumables" class="sidebar-items-container"></div></div>
                    <div class="sidebar-divider"></div>
                    <div class="sidebar-col"><div class="sidebar-title">功法</div><div id="sidebar_skills" class="sidebar-items-container"></div></div>
                </div>
            </div>
        </div>
    `;

        const ts = Date.now();
        const startCB = 'cb_start_' + ts;
        const stopCB = 'cb_stop_' + ts;
        const pauseCB = 'cb_pause_' + ts;
        const spdCB = 'cb_spd_' + ts;

        window[stopCB] = () => { if(window.Combat) Combat.stop(); };
        window[pauseCB] = () => { if(window.Combat) Combat.togglePause(); };
        window[spdCB] = (delta) => { if(window.Combat) Combat.changeSpeed(delta); };

        const cleanCallbacks = () => {
            delete window[startCB]; delete window[stopCB]; delete window[pauseCB]; delete window[spdCB];
        };

        window[startCB] = () => {
            const descEl = document.getElementById('combat_desc_initial');
            if(descEl) descEl.style.display = 'none';
            const footerDiv = document.getElementById('map_combat_footer');
            if (footerDiv) {
                footerDiv.innerHTML = `
                <div class="speed-control-footer" style="display:flex; align-items:center; gap:5px; margin-right:10px; background:#f5f5f5; padding:2px 5px; border-radius:4px; border:1px solid #ddd;">
                    <button class="ink_btn_small" style="width:24px; height:24px; padding:0;" onclick="window['${spdCB}'](-500)">⏫</button>
                    <span id="combat_speed_display" style="font-size:14px; min-width:35px; text-align:center;">1.0x</span>
                    <button class="ink_btn_small" style="width:24px; height:24px; padding:0;" onclick="window['${spdCB}'](500)">⏬</button>
                </div>
                <button id="combat_btn_pause" class="ink_btn_normal" style="flex:1; height:40px; font-size:18px;" onclick="window['${pauseCB}']()">⏸ 暂停</button>
                ${options.canEscape ? `<button class="ink_btn_normal" style="flex:1; height:40px; border-color:#d32f2f; color:#d32f2f; font-size:18px;" onclick="window['${stopCB}']()">🏃 拼死逃跑</button>` : ''}
            `;
            }

            Combat.start(enemy, () => {
                if (window.BountyBoard) window.BountyBoard.onEnemyKilled(enemy.id);
                if (window.GlobalEnemies) window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);
                if (window.MapCamera && window.MapCamera.renderMap) window.MapCamera.renderMap();

                if (externalOnWin) externalOnWin();

                if (!options.isMultiWave && footerDiv) {
                    footerDiv.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px; font-size:18px;" onclick="window.closeModal()">🏆 凯旋而归</button>`;
                }
                cleanCallbacks();
            }, 'combat_logs_realtime', options);
        };

        const footerHtml = `
        <div id="map_combat_footer" style="display:flex; justify-content:space-between; width:100%; gap:15px;">
            ${options.canEscape ? `<button class="ink_btn_normal" style="flex:1; height:40px; font-size:18px;" onclick="window.closeModal()">🏃 撤退</button>` : ''}
            <button class="ink_btn_danger" style="flex:1; height:40px; font-weight:bold; font-size:18px;" onclick="window['${startCB}']()">⚔️ 拔剑迎敌</button>
        </div>
    `;

        /**
         * 【关键修复】
         * 之前调用 showInteractiveModal 的参数位置完全乱了。
         * 按照 v3.2 定义：(title, content, footer, extraClass, width, height, options)
         */
        const modalTitle = options.canEscape ? "遭遇强敌" : `🛑 殊死一搏 - ${enemy.name}`;

        UtilsModal.showInteractiveModal(
            modalTitle, // 使用动态标题
            contentHtml,
            footerHtml,
            "combat_modal",
            90,
            null,
            {
                allowOutsideClick: options.allowOutsideClick !== undefined ? options.allowOutsideClick : options.canEscape,
                allowEsc: options.allowEsc !== undefined ? options.allowEsc : options.canEscape,
                onClose: () => cleanCallbacks()
            }
        );

        this.updateSidebar();
    },

    updateSidebar: function() {
        const consContainer = document.getElementById('sidebar_consumables');
        if (consContainer) {
            let html = '';
            const consumables = (window.player && window.player.consumables) ? window.player.consumables : [null, null, null];
            consumables.forEach((sid, idx) => {
                let inner = '';
                let btnClass = 'empty-slot-btn';
                let onclick = '';
                let tooltip = '';

                if (sid) {
                    const item = window.player.inventory.find(i => i && i.sid === sid);
                    if (item) {
                        tooltip = `onmouseenter="TooltipManager.showItem(event, '${sid}')" onmouseleave="TooltipManager.hide()" onmousemove="TooltipManager._move(event)"`;
                        inner = `<div class="c-slot-item"><div class="c-icon">${item.icon || '💊'}</div><div class="c-count">x${item.count}</div></div><div class="c-name-label">${item.name}</div>`;

                        // =========== 【修复点 1】 ===========
                        // 在调用 Use 方法前，先强制调用 TooltipManager.hide()
                        // 这样即使 DOM 马上被销毁，悬浮窗也会先关掉
                        onclick = `if(window.TooltipManager)window.TooltipManager.hide();Combat.useConsumable('${idx}')`;
                        // ===================================

                        btnClass = '';
                    }
                }
                if (!inner) inner = `<div class="c-slot-empty">空</div>`;
                html += `<div class="c-slot-wrapper" ${tooltip}><div class="c-slot-box">${inner}</div><button id="combat_btn_use_${idx}" class="ink_btn_small c-use-btn ${btnClass}" disabled onclick="${onclick}">使用</button><div id="combat_cd_overlay_${idx}" class="c-cd-overlay" style="display:none;"></div></div>`;
            });
            consContainer.innerHTML = html;
        }

        const skillContainer = document.getElementById('sidebar_skills');
        if (skillContainer) {
            let html = '';
            const activeSkills = [];
            if (player.equipment && player.equipment.gongfa) {
                player.equipment.gongfa.forEach(id => {
                    const book = window.GAME_DB.items.find(i => i.id === id);
                    if (book && book.action) activeSkills.push({ id, data: book });
                });
            }
            if (activeSkills.length === 0) {
                html = `<div style="color:#aaa; font-size:12px; text-align:center; margin-top:20px;">无主动功法</div>`;
            } else {
                activeSkills.forEach((entry, idx) => {
                    // =========== 【修复点 2】 ===========
                    // 技能按钮同理，点击释放时强制关闭悬浮窗
                    const skillOnClick = `if(window.TooltipManager)window.TooltipManager.hide();Combat.useSkill('${entry.id}', '${idx}')`;
                    // ===================================
                    html += `
                        <div class="c-slot-wrapper" onmouseenter="TooltipManager.showSkill(event, '${entry.id}')" onmouseleave="TooltipManager.hide()" onmousemove="TooltipManager._move(event)">
                            <div class="c-slot-box" style="border-color:#5d4037;"><div class="c-slot-item"><div class="c-icon">${entry.data.icon || '📘'}</div></div><div class="c-name-label" style="color:#5d4037;">${entry.data.action.name.substring(0,4)}</div></div>
                            <button id="combat_btn_skill_${entry.id}" class="ink_btn_small c-use-btn" style="border-color:#5d4037; color:#5d4037;" disabled onclick="${skillOnClick}">释放</button>
                            <div id="combat_skill_cd_overlay_${entry.id}" class="c-cd-overlay" style="display:none;"></div>
                        </div>`;
                });
            }
            skillContainer.innerHTML = html;
        }
    },
    /**
     * 【新增】连战/多波次切换方法
     * 这里的逻辑是：不关闭窗口，直接更新界面上的敌人数据，然后重启战斗
     */
    /**
     * 【调试版】连战/多波次切换方法
     */
        /**
         * 【最终修复版】连战/多波次切换方法
         * 包含弹窗查找的保底逻辑
         */
        nextWave: function(enemy, nextOnWin = null, options = { canEscape: false, isMultiWave: false }) {
            // 1. 尝试锁定现有的战斗窗口
            let modalEl = document.getElementById('combat_modal');

            // 【保底逻辑】如果 ID 没找到，尝试通过内部类名查找
            // 这能防止 UtilsModal 修改 ID 导致找不到窗口
            if (!modalEl) {
                const wrapper = document.querySelector('.combat-wrapper');
                if (wrapper) {
                    // 通常 wrapper 的父级或爷级就是 modal 容器，只要确认 wrapper 存在就说明窗口还在
                    modalEl = wrapper.closest('.ink-modal') || wrapper.parentElement;
                }
            }

            // 2. 如果还是找不到，说明窗口真的关了，回退到创建新窗口
            if (!modalEl) {
                this.show(enemy, nextOnWin, options);
                return;
            }

            // --- 以下是正常的更新逻辑 ---

            this._patchEnemyData(enemy);

            const eMaxHp = (enemy.stats && enemy.stats.maxHp !== undefined) ? enemy.stats.maxHp : (enemy.maxHp || enemy.hp || 100);
            const rankMap = { "minion": "普通", "elite": "【精英】", "boss": "【头目】", "lord": "【领主】" };
            const displayRank = rankMap[enemy.template || "minion"] || "普通";

            // 更新标题 (如果有的话)
            try {
                const titleEl = modalEl.querySelector('.ink-modal-title') || document.querySelector('.modal-header h3');
                if (titleEl) {
                    titleEl.innerText = options.canEscape ? "遭遇强敌" : `🛑 殊死一搏 - ${enemy.name}`;
                }
            } catch(e) {}

            // 更新 UI 元素
            const enemyCard = document.querySelector('.fighter-card.enemy');
            if (enemyCard) {
                const iconEl = enemyCard.querySelector('.fighter-icon');
                if(iconEl) iconEl.innerHTML = enemy.visual?.icon || '💀';

                const nameEl = enemyCard.querySelector('.fighter-name');
                if(nameEl) {
                    nameEl.innerText = enemy.name;
                    nameEl.style.color = enemy.visual?.color || '#333';
                }

                const rankEl = enemyCard.querySelector('.fighter-rank');
                if(rankEl) {
                    rankEl.innerText = displayRank;
                    rankEl.style.borderColor = enemy.visual?.color || '#333';
                    rankEl.style.color = enemy.visual?.color || '#333';
                }
            }

            // 更新数值
            const eHpBar = document.getElementById('combat_e_hp_bar');
            const eHpText = document.getElementById('combat_e_hp');
            if (eHpBar) eHpBar.style.width = '100%';
            if (eHpText) {
                eHpText.innerText = enemy.hp;
                eHpText.nextSibling.nodeValue = '/' + eMaxHp;
            }

            const eToxBar = document.getElementById('combat_e_tox_bar');
            const eToxVal = document.getElementById('combat_e_tox_val');
            if (eToxBar) eToxBar.style.width = '0%';
            if (eToxVal) eToxVal.innerText = '0';

            const updateAttr = (id, val) => {
                const el = document.getElementById(id);
                if(el) {
                    const valEl = el.querySelector('.attr-val');
                    if(valEl) valEl.innerText = val;
                    const buffEl = el.querySelector('.attr-buff-val');
                    if(buffEl) buffEl.remove();
                }
            };
            updateAttr('e_attr_atk', enemy.atk || enemy.stats.atk);
            updateAttr('e_attr_def', enemy.def || enemy.stats.def);
            updateAttr('e_attr_spd', enemy.speed || enemy.stats.speed);

            // 重置日志
            const logContainer = document.getElementById('combat_logs_realtime');
            if (logContainer) logContainer.innerHTML = '';

            // 显示遮罩
            const descEl = document.getElementById('combat_desc_initial');
            if(descEl) {
                descEl.style.display = 'block';
                const titleEl = descEl.querySelector('div:first-child');
                if(titleEl) titleEl.innerText = `“${enemy.desc || '又一波敌人逼近……'}”`;
            }

            // 重新绑定按钮
            const ts = Date.now();
            const startCB = 'cb_start_wave_' + ts;
            const stopCB = 'cb_stop_wave_' + ts;

            window[stopCB] = () => { if(window.Combat) Combat.stop(); };
            window[startCB] = () => {
                if(descEl) descEl.style.display = 'none';

                const footerDiv = document.getElementById('map_combat_footer');
                if (footerDiv) {
                    const pauseCB = 'cb_pause_' + ts;
                    const spdCB = 'cb_spd_' + ts;
                    window[pauseCB] = () => { if(window.Combat) Combat.togglePause(); };
                    window[spdCB] = (delta) => { if(window.Combat) Combat.changeSpeed(delta); };

                    footerDiv.innerHTML = `
                <div class="speed-control-footer" style="display:flex; align-items:center; gap:5px; margin-right:10px; background:#f5f5f5; padding:2px 5px; border-radius:4px; border:1px solid #ddd;">
                    <button class="ink_btn_small" style="width:24px; height:24px; padding:0;" onclick="window['${spdCB}'](-500)">⏫</button>
                    <span id="combat_speed_display" style="font-size:14px; min-width:35px; text-align:center;">1.0x</span>
                    <button class="ink_btn_small" style="width:24px; height:24px; padding:0;" onclick="window['${spdCB}'](500)">⏬</button>
                </div>
                <button id="combat_btn_pause" class="ink_btn_normal" style="flex:1; height:40px; font-size:18px;" onclick="window['${pauseCB}']()">⏸ 暂停</button>
                ${options.canEscape ? `<button class="ink_btn_normal" style="flex:1; height:40px; border-color:#d32f2f; color:#d32f2f; font-size:18px;" onclick="window['${stopCB}']()">🏃 拼死逃跑</button>` : ''}
                `;
                }

                Combat.start(enemy, () => {
                    if (window.BountyBoard) window.BountyBoard.onEnemyKilled(enemy.id);
                    if (window.GlobalEnemies) window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);

                    if (nextOnWin) nextOnWin();

                    if (!options.isMultiWave && footerDiv) {
                        footerDiv.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px; font-size:18px;" onclick="window.closeModal()">🏆 凯旋而归</button>`;
                    }
                }, 'combat_logs_realtime', options);
            };

            const footerDiv = document.getElementById('map_combat_footer');
            if(footerDiv) {
                footerDiv.innerHTML = `
             <div style="width:100%; text-align:center; color:#d32f2f; font-weight:bold; margin-bottom:5px;">⚠️ 连战警告：下一波敌人已到达！</div>
             <div style="display:flex; justify-content:space-between; width:100%; gap:15px;">
                ${options.canEscape ? `<button class="ink_btn_normal" style="flex:1; height:40px; font-size:18px;" onclick="window['${stopCB}']()">🏃 撤退</button>` : ''}
                <button class="ink_btn_danger" style="flex:1; height:40px; font-weight:bold; font-size:18px;" onclick="window['${startCB}']()">⚔️ 开启下一波对战</button>
            </div>`;
            }

            this.updateSidebar();
        },
};

window.UICombatModal = UICombatModal;