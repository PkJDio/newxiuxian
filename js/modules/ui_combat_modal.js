// js/modules/ui_combat_modal.js
// 战斗弹窗UI管理器 v2.2 (修复：属性读取、速度按钮位置)
console.log("加载 战斗弹窗UI模块 (UICombatModal v2.2)");

const UICombatModal = {
    // 修复旧数据: 映射 stats.toxicity -> instance.toxAtk
    // 【修改点1】增加 basePen 读取逻辑 (保持原样)
    _patchEnemyData: function(enemy) {
        // 尝试从 ENEMY_TEMPLATES 读取穿甲值
        if (enemy.basePen === undefined) {
            const tmplKey = enemy.template || "minion";
            if (typeof ENEMY_TEMPLATES !== 'undefined' && ENEMY_TEMPLATES[tmplKey]) {
                enemy.basePen = ENEMY_TEMPLATES[tmplKey].basePen;
            }
        }

        if (enemy.toxAtk === undefined) {
            const db = window.enemies || (window.GAME_DB ? window.GAME_DB.enemies : []);

            if (db && db.length > 0) {
                const template = db.find(e => e.id === enemy.id);
                if (template && template.stats && template.stats.toxicity) {
                    enemy.toxAtk = template.stats.toxicity;
                    if (enemy.toxicity === undefined) enemy.toxicity = 0;
                    if (!enemy.stats) enemy.stats = {};
                    enemy.stats.toxAtk = template.stats.toxicity;
                } else {
                    enemy.toxAtk = 0;
                    if (enemy.toxicity === undefined) enemy.toxicity = 0;
                }
                // 如果模板里有特定穿甲定义，也可以覆盖
                if (template && template.basePen !== undefined) {
                    enemy.basePen = template.basePen;
                }
            }
        }
        if (enemy.basePen === undefined) enemy.basePen = 0;
    },

    show: function(enemy) {
        if (!window.Combat || !window.UtilsModal) return;

        this._patchEnemyData(enemy);

        if (window.recalcStats) window.recalcStats();

        const pDerived = window.player.derived || {};
        const pName = window.player.name || "少侠";
        const currentPTox = window.player.toxicity || 0;

        // 玩家属性
        const pStats = {
            hp: pDerived.hp,
            maxHp: pDerived.hpMax,
            mp: pDerived.mp || 0,
            maxMp: pDerived.mpMax || 100, // 默认100防错
            atk: pDerived.atk,
            def: pDerived.def,
            speed: pDerived.speed,
            toxicity: currentPTox
        };

        const eName = enemy.name || "未知敌人";
        const currentETox = enemy.toxicity || 0;

        // 【修改点2】修复怪物属性读取逻辑
        // 优先读取 enemy.stats 中的属性，如果不存在则读取 enemy 根属性，最后默认为 0
        const eStats = {
            hp: (enemy.stats && enemy.stats.hp !== undefined) ? enemy.stats.hp : (enemy.hp || 0),
            maxHp: (enemy.stats && enemy.stats.maxHp !== undefined) ? enemy.stats.maxHp : (enemy.maxHp || enemy.hp || 0),
            atk: (enemy.stats && enemy.stats.atk !== undefined) ? enemy.stats.atk : (enemy.atk || 0),
            def: (enemy.stats && enemy.stats.def !== undefined) ? enemy.stats.def : (enemy.def || 0),
            speed: (enemy.stats && enemy.stats.speed !== undefined) ? enemy.stats.speed : (enemy.speed || 0)
        };

        const eDesc = enemy.desc || "这家伙看起来不怀好意...";
        const eIcon = (enemy.visual && enemy.visual.icon) ? enemy.visual.icon : "💀";
        const eColor = (enemy.visual && enemy.visual.color) ? enemy.visual.color : "#333";

        const rankMap = { "minion": "普通", "elite": "【精英】", "boss": "【头目】", "lord": "【领主】" };
        const rankKey = enemy.template || "minion";
        const displayRank = rankMap[rankKey] || enemy.levelType || "普通";

        const eHpPct = Math.max(0, Math.min(100, (eStats.hp / eStats.maxHp) * 100));
        const pHpPct = Math.max(0, Math.min(100, (pStats.hp / pStats.maxHp) * 100));
        const pMpPct = Math.max(0, Math.min(100, (pStats.mp / pStats.maxMp) * 100));

        const pToxPct = Math.min(100, currentPTox);
        const eToxPct = Math.min(100, currentETox);

        // 【修改点3】移除原顶部的 speed-control-panel
        const contentHtml = `
            <div class="combat-wrapper">
                <div class="combat-header">
                    <div class="fighter-card enemy">
                        <div class="fighter-top">
                            <div class="fighter-icon">${eIcon}</div>
                            <div class="fighter-info">
                                <div class="fighter-name" style="color:${eColor};">${eName}</div>
                                <span class="fighter-rank" style="border-color:${eColor}; color:${eColor};">${displayRank}</span>
                            </div>
                        </div>
                        <div class="stats-panel">
                            <div class="bar-row">
                                <div class="hp-bar-container">
                                    <div class="bar-label">❤</div>
                                    <div class="hp-bar-bg">
                                        <div id="combat_e_hp_bar" class="hp-bar-fill" style="width:${eHpPct}%"></div>
                                        <div class="hp-text"><b id="combat_e_hp">${eStats.hp}</b>/${eStats.maxHp}</div>
                                    </div>
                                </div>
                                <div class="tox-bar-container" title="中毒深度">
                                    <div class="tox-label">☠</div>
                                    <div class="tox-bar-bg">
                                        <div id="combat_e_tox_bar" class="tox-bar-fill" style="width:${eToxPct}%"></div>
                                    </div>
                                    <div id="combat_e_tox_val" class="tox-val">${currentETox}</div>
                                </div>
                            </div>
                            <div class="attr-row" id="enemy_attr_row">
                                <span class="attr-item" id="e_attr_atk"><span class="attr-icon">⚔</span><span class="attr-text">攻击</span><span class="attr-val">${eStats.atk}</span></span>
                                <span class="attr-item" id="e_attr_def"><span class="attr-icon">🛡</span><span class="attr-text">防御</span><span class="attr-val">${eStats.def}</span></span>
                                <span class="attr-item" id="e_attr_spd"><span class="attr-icon">🦶</span><span class="attr-text">速度</span><span class="attr-val">${eStats.speed}</span></span>
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
                                        <div class="hp-text"><b id="combat_p_hp">${pStats.hp}</b>/${pStats.maxHp}</div>
                                    </div>
                                </div>
                                <div class="tox-bar-container" title="自身中毒">
                                    <div class="tox-label">☠</div>
                                    <div class="tox-bar-bg">
                                        <div id="combat_p_tox_bar" class="tox-bar-fill" style="width:${pToxPct}%"></div>
                                    </div>
                                    <div id="combat_p_tox_val" class="tox-val">${currentPTox}</div>
                                </div>
                            </div>
                            <div class="bar-row mp-row">
                                <div class="hp-bar-container">
                                    <div class="bar-label" style="color:#1976d2;">⚡</div>
                                    <div class="hp-bar-bg" style="border-color:#90caf9;">
                                        <div id="combat_p_mp_bar" class="hp-bar-fill" style="width:${pMpPct}%; background:linear-gradient(45deg, #1976d2, #42a5f5); animation:none;"></div>
                                        <div class="hp-text"><b id="combat_p_mp">${Math.floor(pStats.mp)}</b>/${Math.floor(pStats.maxMp)}</div>
                                    </div>
                                </div>
                                <div style="width:120px;"></div> </div>

                            <div class="attr-row" id="player_attr_row">
                                <span class="attr-item" id="p_attr_atk"><span class="attr-icon">⚔</span><span class="attr-text">攻击</span><span class="attr-val">${pStats.atk}</span></span>
                                <span class="attr-item" id="p_attr_def"><span class="attr-icon">🛡</span><span class="attr-text">防御</span><span class="attr-val">${pStats.def}</span></span>
                                <span class="attr-item" id="p_attr_spd"><span class="attr-icon">🦶</span><span class="attr-text">速度</span><span class="attr-val">${pStats.speed}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="combat-body">
                    <div id="combat_log_container_embed">
                        <div id="combat_desc_initial" style="text-align:center; padding-top: 60px;">
                            <div style="font-size:28px; line-height:1.5; color:#5d4037; font-weight:bold; margin-bottom: 30px;">
                                “${eDesc}”
                            </div>
                            <div style="font-size:20px; color:#999;">
                                (点击下方“拔剑迎敌”开始战斗)
                            </div>
                        </div>
                        <div id="combat_logs_realtime"></div>
                    </div>

                    <div id="combat_sidebar_content" class="combat-sidebar-split">
                        <div class="sidebar-col">
                            <div class="sidebar-title">丹药</div>
                            <div id="sidebar_consumables" class="sidebar-items-container"></div>
                        </div>
                        <div class="sidebar-divider"></div>
                        <div class="sidebar-col">
                            <div class="sidebar-title">功法</div>
                            <div id="sidebar_skills" class="sidebar-items-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .combat-wrapper { display: flex; flex-direction: column; height: 100%; min-height: 550px; font-family: "Kaiti", serif; font-size: 20px; color: #333; position:relative; }
                /* 移除了 speed-control-panel 的绝对定位样式 */
                .combat-header { display: flex; justify-content: space-between; align-items: stretch; padding: 5px 10px; background: #fdfbf7; border-bottom: 3px double #8d6e63; flex-shrink: 0; gap: 5px; } /* 移除了 margin-top */
                .fighter-card { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .fighter-top { display: flex; align-items: center; gap: 8px; }
                .fighter-icon { font-size: 40px; animation: float 3s infinite; }
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
                .hp-bar-fill { height: 100%; width: 100%; background: linear-gradient(45deg, #e53935 25%, #ef5350 25%, #ef5350 50%, #e53935 50%, #e53935 75%, #ef5350 75%, #ef5350); background-size: 40px 40px; animation: liquid-move 2s linear infinite; transition: width 0.4s ease-out; }
                .hp-text { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 2px #000; z-index: 2; line-height:1; }
                .tox-bar-container { width: 100px; display: flex; align-items: center; gap: 4px; }
                .tox-label { font-size: 18px; color: #9c27b0; font-weight: bold; }
                .tox-bar-bg { flex: 1; height: 10px; background: #eee; border: 1px solid #ccc; border-radius: 5px; overflow: hidden; }
                .tox-bar-fill { height: 100%; background: #9c27b0; width: 0%; transition: width 0.3s; }
                .tox-val { font-size: 14px; color: #666; width: 30px; text-align: right; }
                
                .attr-row { display: flex; justify-content: space-around; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif; }
                .attr-item { display: flex; align-items: center; gap: 4px; padding: 2px 4px; border-radius: 4px; transition: background 0.2s; position: relative; cursor: help; }
                .attr-text { font-size: 16px; color: #555; margin-right: 2px; font-weight: normal; font-family: "Kaiti"; }
                /* 状态颜色样式 */
                .attr-debuff { color: #f57f17 !important; background: rgba(245, 127, 23, 0.1); border: 1px solid rgba(245, 127, 23, 0.3); }
                .attr-buff { color: #2e7d32 !important; background: rgba(46, 125, 50, 0.1); border: 1px solid rgba(46, 125, 50, 0.3); }

                .combat-body { flex: 1; display: flex; overflow: hidden; border-top: 1px solid #d4a76a; }
                #combat_log_container_embed { flex: 1; background: #fffbf0; padding: 20px; overflow-y: auto; border-right: 2px solid #e0d0b0; }
                #combat_logs_realtime { font-family: 'Courier New', monospace; font-size: 18px; line-height: 1.6; color: #333; }
                
                /* 侧边栏布局 */
                .combat-sidebar-split { width: 190px; background: #f8f1e0; display: flex; box-shadow: -4px 0 10px rgba(0,0,0,0.05); z-index: 10; }
                .sidebar-col { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 5px; }
                .sidebar-divider { width: 1px; background: #d7ccc8; margin: 5px 0; }
                .sidebar-title { font-size: 18px; font-weight: bold; color: #5d4037; border-bottom: 2px solid #a1887f; width: 100%; text-align: center; padding-bottom: 4px; margin-bottom: 8px; }
                .sidebar-items-container { display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: center; overflow-y: auto; }

                /* 消耗品/技能 槽位样式 */
                .c-slot-wrapper { 
                    width: 76px; height: 86px; 
                    background: #fff; border: 2px solid #d7ccc8; border-radius: 6px; padding: 3px; 
                    display: flex; flex-direction: column; justify-content: space-between; 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1); position: relative; 
                }
                .c-slot-box { 
                    flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; 
                    background: #fafafa; border: 1px dashed #ddd; border-radius: 2px; overflow: hidden; position: relative; 
                }
                .c-icon { 
                    display: flex; justify-content: center; align-items: center; 
                    width: 100%; height: 100%;
                    font-size: 26px; line-height: 1; 
                    transform: translateY(-2px);
                }
                .c-name-label {
                    font-size: 11px; color: #333; font-weight: bold; text-align: center;
                    margin-top: 1px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    width: 100%;
                }
                .c-count { position: absolute; top: 1px; right: 1px; background: rgba(0,0,0,0.7); color: #fff; font-size: 9px; padding: 0 3px; border-radius: 2px; }
                .c-slot-empty { font-size: 12px; color: #ccc; }
                .c-use-btn { width: 100%; font-size: 11px; padding: 2px 0; margin-top: 2px; }
                .c-use-btn:disabled { background: #e0e0e0; color: #aaa; border-color: #ccc; cursor: not-allowed; }
                .c-cd-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.75); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #333; z-index: 5; cursor: not-allowed; }
                
                /* Tooltip 样式 - 使用全局 TooltipManager 后已移除 c-item-tooltip 样式，防止冲突 */
                
                /* Log Tooltips (保持原有) */
                .combat-tooltip-content { visibility: hidden; opacity: 0; position: absolute; left: 100%; top: -10px; margin-left: 12px; bottom: auto; transform: none; box-sizing: border-box !important; width: 210px !important; height: fit-content !important; min-height: 0 !important; display: block !important; background-color: rgba(0, 0, 0, 0.95) !important; color: #fff !important; padding: 8px 10px !important; border-radius: 5px; border: 1px solid #666; z-index: 999999; box-shadow: 0 4px 15px rgba(0,0,0,0.6); pointer-events: none; text-align: left; line-height: 1.5 !important; white-space: normal !important; }
                .combat-tooltip-content::after { content: ""; position: absolute; top: 15px; right: 100%; border-width: 6px; border-style: solid; border-color: transparent rgba(0, 0, 0, 0.95) transparent transparent; }
                .combat-tooltip-content .tip-row { margin-bottom: 3px; }
                .combat-tooltip-content .tip-divider { margin: 6px 0; border-top: 1px solid #555; }
                
                @keyframes liquid-move { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
                @keyframes float { 0% {transform: translateY(0px);} 50% {transform: translateY(-6px);} 100% {transform: translateY(0px);} }
            </style>
        `;

        const combatCallbackName = 'cb_start_combat_' + Date.now();
        const escapeCallbackName = 'cb_stop_combat_' + Date.now();
        const pauseCallbackName = 'cb_pause_combat_' + Date.now();

        window[escapeCallbackName] = () => {
            if (window.Combat && window.Combat.stop) window.Combat.stop();
        };

        window[pauseCallbackName] = () => {
            if (window.Combat && window.Combat.togglePause) window.Combat.togglePause();
        };

        window[combatCallbackName] = () => {
            const descEl = document.getElementById('combat_desc_initial');
            const logEl = document.getElementById('combat_logs_realtime');
            if(descEl) descEl.style.display = 'none';
            if(logEl) logEl.innerHTML = '<div style="color:#888; text-align:center; padding:10px; border-bottom:1px dashed #ccc; margin-bottom:10px;">--- 战斗开始 ---</div>';

            const footerDiv = document.getElementById('map_combat_footer');
            if (footerDiv) {
                // 【修改点4】战斗开始后，在底部更新按钮，加入速度控制
                footerDiv.innerHTML = `
                    <div class="speed-control-footer" style="display:flex; align-items:center; gap:5px; margin-right:10px; background:#f5f5f5; padding:2px 5px; border-radius:4px; border:1px solid #ddd;">
                        <button class="ink_btn_small" style="width:24px; height:24px; padding:0; line-height:22px;" onclick="Combat.changeSpeed(-500)">⏫</button>
                        <span id="combat_speed_display" style="font-size:14px; min-width:35px; text-align:center;">1.0x</span>
                        <button class="ink_btn_small" style="width:24px; height:24px; padding:0; line-height:22px;" onclick="Combat.changeSpeed(500)">⏬</button>
                    </div>
                    <button id="combat_btn_pause" class="ink_btn_normal" style="flex:1; height:40px; font-size:18px;" onclick="window['${pauseCallbackName}']()">
                        ⏸ 暂停
                    </button>
                    <button class="ink_btn_normal" style="flex:1; height:40px; border-color:#d32f2f; color:#d32f2f; font-size:18px;" onclick="window['${escapeCallbackName}']()">
                        🏃 拼死逃跑
                    </button>
                `;

                // 初始化速度显示
                setTimeout(() => {
                    const spdEl = document.getElementById('combat_speed_display');
                    if(spdEl && window.Combat) spdEl.innerText = (1000 / Combat.turnSpeed).toFixed(1) + "x";
                }, 0);
            }

            Combat.start(enemy, () => {
                // 【核心修复】战斗胜利回调：通知悬赏榜检查击杀进度
                if (window.BountyBoard && window.BountyBoard.onEnemyKilled) {
                    // enemy.id 是当前击杀的怪物ID，例如 'enemy_wolf_id'
                    window.BountyBoard.onEnemyKilled(enemy.id);
                }

                if (window.GlobalEnemies) {
                    window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);
                }
                if (window.MapCamera && window.MapCamera.renderMap) {
                    window.MapCamera.renderMap();
                } else if(window.MapCamera && window.MapCamera.ctx && window.MapAtlas) {
                    MapAtlas.render(window.MapCamera.ctx, window.MapCamera, window.GlobalEnemies);
                }

                if (footerDiv) footerDiv.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px; font-size:18px;" onclick="window.closeModal()">🏆 凯旋而归</button>`;
            }, 'combat_logs_realtime');
        };

        const footerHtml = `
            <div id="map_combat_footer" style="display:flex; justify-content:space-between; width:100%; gap:15px;">
                <button class="ink_btn_normal" style="flex:1; height:40px; font-size:18px;" onclick="window.closeModal(); delete window['${combatCallbackName}']; delete window['${escapeCallbackName}']; delete window['${pauseCallbackName}']">🏃 撤退</button>
                <button class="ink_btn_danger" style="flex:1; height:40px; font-weight:bold; font-size:18px;" onclick="window['${combatCallbackName}']()">⚔️ 拔剑迎敌</button>
            </div>
        `;

        UtilsModal.showInteractiveModal("遭遇强敌", contentHtml, footerHtml, "", 90, null);

        this.updateSidebar();
    },

    updateSidebar: function() {
        // 更新丹药栏
        const consContainer = document.getElementById('sidebar_consumables');
        if (consContainer) {
            let html = '';
            const consumables = (window.player && window.player.consumables) ? window.player.consumables : [null, null, null];
            consumables.forEach((itemId, idx) => {
                let inner = '';
                let btnClassAdd = 'empty-slot-btn';
                let onclick = '';
                // 使用全局 TooltipManager
                let tooltipEvents = '';

                if (itemId) {
                    const db = window.GAME_DB || { items: [] };
                    const item = db.items ? db.items.find(i => i && i.id === itemId) : null;
                    if (item) {
                        let icon = item.icon || '💊';
                        if (window.getItemIcon) icon = getItemIcon(item);
                        // Tooltip 事件
                        tooltipEvents = `onmouseenter="TooltipManager.showItem(event, '${itemId}')" onmouseleave="TooltipManager.hide()" onmousemove="TooltipManager._move(event)"`;

                        inner = `
                            <div class="c-slot-item">
                                <div class="c-icon">${icon}</div>
                                <div class="c-count" id="combat_item_count_${idx}">x${this._getItemCount(itemId)}</div>
                            </div>
                            <div class="c-name-label">${item.name}</div>
                        `;
                        onclick = `Combat.useConsumable(${idx})`;
                        btnClassAdd = '';
                    }
                }
                if (!inner) inner = `<div class="c-slot-empty">空</div>`;

                html += `
                    <div class="c-slot-wrapper" ${tooltipEvents}>
                        <div class="c-slot-box">${inner}</div>
                        <button id="combat_btn_use_${idx}" class="ink_btn_small c-use-btn ${btnClassAdd}" disabled onclick="${onclick}">使用</button>
                        <div id="combat_cd_overlay_${idx}" class="c-cd-overlay" style="display:none;"></div>
                    </div>
                `;
            });
            consContainer.innerHTML = html;
        }

        // 更新功法栏 (主动技能)
        const skillContainer = document.getElementById('sidebar_skills');
        if (skillContainer) {
            let html = '';
            // 获取装备的主动功法
            const activeSkills = [];
            if (player.equipment && player.equipment.gongfa) {
                player.equipment.gongfa.forEach(id => {
                    if (!id) return;
                    const book = window.GAME_DB.items.find(i => i.id === id);
                    if (book && book.action) {
                        activeSkills.push({ id: id, data: book });
                    }
                });
            }

            if (activeSkills.length === 0) {
                html = `<div style="color:#aaa; font-size:12px; text-align:center; margin-top:20px;">无主动功法</div>`;
            } else {
                activeSkills.forEach((entry, idx) => {
                    const book = entry.data;
                    const action = book.action;
                    const icon = book.icon || '📘';
                    // Tooltip 事件
                    const tooltipEvents = `onmouseenter="TooltipManager.showSkill(event, '${entry.id}')" onmouseleave="TooltipManager.hide()" onmousemove="TooltipManager._move(event)"`;
                    const onclick = `Combat.useSkill('${entry.id}', ${idx})`;

                    html += `
                        <div class="c-slot-wrapper" ${tooltipEvents}>
                            <div class="c-slot-box" style="border-color:#5d4037;">
                                <div class="c-slot-item">
                                    <div class="c-icon">${icon}</div>
                                </div>
                                <div class="c-name-label" style="color:#5d4037;">${action.name.substring(0,4)}</div>
                            </div>
                            <button id="combat_btn_skill_${idx}" class="ink_btn_small c-use-btn" style="border-color:#5d4037; color:#5d4037;" disabled onclick="${onclick}">释放</button>
                            <div id="combat_skill_cd_overlay_${idx}" class="c-cd-overlay" style="display:none;"></div>
                        </div>
                    `;
                });
            }
            skillContainer.innerHTML = html;
        }
    },

    _getItemCount: function(itemId) {
        if (!player || !player.inventory) return 0;
        const slot = player.inventory.find(i => i &&  i.id === itemId);
        return slot ? slot.count : 0;
    },

    // 移除废弃的 _generateItemTooltip 和 _generateSkillTooltip 函数
};

window.UICombatModal = UICombatModal;