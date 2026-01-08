// js/modules/ui_combat_modal.js
// 战斗弹窗UI管理器 v1.6 (修复：悬浮框背景色丢失问题)
console.log("加载 战斗弹窗UI模块 (UICombatModal v1.6)");

const UICombatModal = {
    // 修复旧数据: 映射 stats.toxicity -> instance.toxAtk
    _patchEnemyData: function(enemy) {
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
            }
        }
    },

    show: function(enemy) {
        if (!window.Combat || !window.UtilsModal) return;

        this._patchEnemyData(enemy);

        if (window.recalcStats) window.recalcStats();

        const pDerived = window.player.derived || {};
        const pName = window.player.name || "少侠";
        const currentPTox = window.player.toxicity || 0;

        const pStats = {
            hp: pDerived.hp,
            maxHp: pDerived.hpMax,
            atk: pDerived.atk,
            def: pDerived.def,
            speed: pDerived.speed,
            toxicity: currentPTox
        };

        const eName = enemy.name || "未知敌人";
        const currentETox = enemy.toxicity || 0;

        const eStats = {
            hp: enemy.hp,
            maxHp: enemy.maxHp || enemy.hp,
            atk: enemy.atk || "0",
            def: enemy.def || "0",
            speed: enemy.speed || "0"
        };

        const eDesc = enemy.desc || "这家伙看起来不怀好意...";
        const eIcon = (enemy.visual && enemy.visual.icon) ? enemy.visual.icon : "💀";
        const eColor = (enemy.visual && enemy.visual.color) ? enemy.visual.color : "#333";

        const rankMap = { "minion": "普通", "elite": "【精英】", "boss": "【头目】", "lord": "【领主】" };
        const rankKey = enemy.template || "minion";
        const displayRank = rankMap[rankKey] || enemy.levelType || "普通";

        const eHpPct = Math.max(0, Math.min(100, (eStats.hp / eStats.maxHp) * 100));
        const pHpPct = Math.max(0, Math.min(100, (pStats.hp / pStats.maxHp) * 100));

        const pToxPct = Math.min(100, currentPTox);
        const eToxPct = Math.min(100, currentETox);

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
                            <div class="attr-row">
                                <span class="attr-item"><span class="attr-icon">⚔</span><span class="attr-text">攻击</span>${eStats.atk}</span>
                                <span class="attr-item"><span class="attr-icon">🛡</span><span class="attr-text">防御</span>${eStats.def}</span>
                                <span class="attr-item"><span class="attr-icon">🦶</span><span class="attr-text">速度</span>${eStats.speed}</span>
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
                            <div class="attr-row">
                                <span class="attr-item"><span class="attr-icon">⚔</span><span class="attr-text">攻击</span>${pStats.atk}</span>
                                <span class="attr-item"><span class="attr-icon">🛡</span><span class="attr-text">防御</span>${pStats.def}</span>
                                <span class="attr-item"><span class="attr-icon">🦶</span><span class="attr-text">速度</span>${pStats.speed}</span>
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

                    <div id="combat_sidebar_content" class="combat-sidebar">
                        </div>
                </div>
            </div>
            
            <style>
                .combat-wrapper { display: flex; flex-direction: column; height: 100%; min-height: 500px; font-family: "Kaiti", serif; font-size: 20px; color: #333; }
                .combat-header { display: flex; justify-content: space-between; align-items: stretch; padding: 5px 10px; background: #fdfbf7; border-bottom: 3px double #8d6e63; flex-shrink: 0; gap: 5px; }
                .fighter-card { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .fighter-top { display: flex; align-items: center; gap: 8px; }
                .fighter-icon { font-size: 40px; animation: float 3s infinite; }
                .fighter-info { display: flex; flex-direction: column; justify-content: center; }
                .fighter-name { font-size: 22px; font-weight: bold; line-height: 1.1; }
                .fighter-rank { font-size: 16px; font-weight: bold; padding: 1px 5px; border-radius: 4px; }
                .player-rank { background: #1976d2; color: #fff; }
                .vs-divider { font-size: 32px; font-weight: bold; color: #a94442; align-self: center; width: 40px; text-align: center; }
                .stats-panel { background: rgba(0,0,0,0.03); padding: 6px 8px; border-radius: 8px; border: 1px solid #e0e0e0; }
                .bar-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
                .hp-bar-container { flex: 1; display: flex; align-items: center; gap: 5px; }
                .bar-label { font-size: 20px; color: #d32f2f; font-weight: bold; }
                .hp-bar-bg { flex: 1; height: 22px; background: #ddd; border: 2px solid #bbb; border-radius: 11px; overflow: hidden; position: relative; }
                .hp-bar-fill { height: 100%; width: 100%; background: linear-gradient(45deg, #e53935 25%, #ef5350 25%, #ef5350 50%, #e53935 50%, #e53935 75%, #ef5350 75%, #ef5350); background-size: 40px 40px; animation: liquid-move 2s linear infinite; transition: width 0.4s ease-out; }
                .hp-text { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; color: #fff; text-shadow: 1px 1px 2px #000; z-index: 2; }
                .tox-bar-container { width: 120px; display: flex; align-items: center; gap: 4px; }
                .tox-label { font-size: 18px; color: #9c27b0; font-weight: bold; }
                .tox-bar-bg { flex: 1; height: 12px; background: #eee; border: 1px solid #ccc; border-radius: 6px; overflow: hidden; }
                .tox-bar-fill { height: 100%; background: #9c27b0; width: 0%; transition: width 0.3s; }
                .tox-val { font-size: 14px; color: #666; width: 35px; text-align: right; }
                .attr-row { display: flex; justify-content: space-around; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif; }
                .attr-item { display: flex; align-items: center; gap: 2px; }
                .attr-text { font-size: 16px; color: #555; margin-right: 2px; font-weight: normal; font-family: "Kaiti"; }
                .combat-body { flex: 1; display: flex; overflow: hidden; border-top: 1px solid #d4a76a; }
                #combat_log_container_embed { flex: 1; background: #fffbf0; padding: 20px; overflow-y: auto; border-right: 2px solid #e0d0b0; }
                #combat_logs_realtime { font-family: 'Courier New', monospace; font-size: 18px; line-height: 1.6; color: #333; }
                .combat-sidebar { width: 120px; background: #f8f1e0; padding: 8px; display: flex; flex-direction: column; gap: 10px; align-items: center; box-shadow: -4px 0 10px rgba(0,0,0,0.05); z-index: 10; }
                .sidebar-title { font-size: 20px; font-weight: bold; color: #5d4037; border-bottom: 2px solid #a1887f; width: 100%; text-align: center; padding-bottom: 4px; margin-bottom: 4px; }
                
                /* 消耗品栏样式 */
                .c-slot-wrapper { 
                    width: 80px; height: 90px; 
                    background: #fff; border: 2px solid #d7ccc8; border-radius: 6px; padding: 4px; 
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
                    font-size: 30px; line-height: 1; 
                    transform: translateY(-2px);
                }
                .c-name-label {
                    font-size: 12px; color: #333; font-weight: bold; text-align: center;
                    margin-top: 2px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    width: 100%;
                }
                .c-count { position: absolute; top: 1px; right: 1px; background: rgba(0,0,0,0.7); color: #fff; font-size: 9px; padding: 0 3px; border-radius: 2px; }
                .c-slot-empty { font-size: 14px; color: #ccc; }
                .c-use-btn { width: 100%; font-size: 12px; padding: 2px 0; margin-top: 2px; }
                .c-use-btn:disabled { background: #e0e0e0; color: #aaa; border-color: #ccc; cursor: not-allowed; }
                .c-cd-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.75); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #333; z-index: 5; cursor: not-allowed; }
                
                /* Tooltip 样式 - 侧边栏物品 */
                .c-item-tooltip {
                    display: none; position: absolute; right: 100%; top: 0; 
                    width: 200px; background: rgba(0,0,0,0.9) !important; color: #fff; 
                    padding: 10px; border-radius: 4px; font-size: 20px; z-index: 2100;
                    margin-right: 8px; text-align: left; line-height: 1.4;
                    border: 1px solid #444;
                }
                .c-item-tooltip::after {
                    content: ""; position: absolute; left: 100%; top: 20px; 
                    border-width: 5px; border-style: solid; border-color: transparent transparent transparent rgba(0,0,0,0.9);
                }
                .c-slot-wrapper:hover .c-item-tooltip { display: block; }
                .c-slot-wrapper:last-child .c-item-tooltip { top: auto; bottom: 0; }
                .c-slot-wrapper:last-child .c-item-tooltip::after { top: auto; bottom: 20px; }

              /* --- Combat Log Tooltip (数字悬浮窗) 样式修复 --- */
                /* --- 修复悬浮框位置：改为右侧显示，避免上下被遮挡 --- */
/* --- 修复悬浮框：右侧显示 + 顶部对齐 + 修复背景不全 --- */
/* --- 悬浮框修复：高度完全自适应内容 --- */
.combat-tooltip-content {
    visibility: hidden; 
    opacity: 0; 
    position: absolute; 
    
    /* 定位：显示在触发文字的右侧 */
    left: 100%; 
    top: -10px;        /* 顶部稍微上提，与文字对齐 */
    margin-left: 12px; /* 左右间距 */
    bottom: auto;      /* 禁用 bottom，防止被拉伸 */
    transform: none;   /* 禁用垂直居中，让其向下自然生长 */
    
    /* 尺寸核心：让高度包裹内容 */
    box-sizing: border-box !important;
    width: 210px !important;
    height: fit-content !important; /* 【关键】高度紧贴内容 */
    min-height: 0 !important;       /* 清除最小高度限制 */
    
    /* 布局改为 block，比 flex 更适合文本流 */
    display: block !important;
    
    /* 外观 */
    background-color: rgba(0, 0, 0, 0.95) !important;
    color: #fff !important;
    padding: 8px 10px !important;
    border-radius: 5px;
    border: 1px solid #666;
    z-index: 999999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    
    pointer-events: none; 
    text-align: left; 
    line-height: 1.5 !important;
    white-space: normal !important;
}

/* 箭头样式（无需修改，保持指向左侧） */
.combat-tooltip-content::after {
    content: ""; 
    position: absolute; 
    top: 15px; 
    right: 100%; 
    left: auto;
    margin-top: 0; 
    border-width: 6px; 
    border-style: solid; 
    border-color: transparent rgba(0, 0, 0, 0.95) transparent transparent; 
}

/* 额外修复：确保内部的每一行都有间距 */
.combat-tooltip-content .tip-row {
    margin-bottom: 3px;
}
.combat-tooltip-content .tip-row:last-child {
    margin-bottom: 0;
}
.combat-tooltip-content .tip-divider {
    margin: 6px 0;
    border-top: 1px solid #555;
}
                
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
                footerDiv.innerHTML = `
                    <button id="combat_btn_pause" class="ink_btn_normal" style="width:48%; height:40px; font-size:18px;" onclick="window['${pauseCallbackName}']()">
                        ⏸ 暂停
                    </button>
                    <button class="ink_btn_normal" style="width:48%; height:40px; border-color:#d32f2f; color:#d32f2f; font-size:18px;" onclick="window['${escapeCallbackName}']()">
                        🏃 拼死逃跑
                    </button>
                `;
            }

            Combat.start(enemy, () => {
                if (window.GlobalEnemies) {
                    window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);
                }
                if (window.MapCamera && window.MapCamera.renderMap) {
                    window.MapCamera.renderMap();
                } else if(window.MapCamera && window.MapCamera.ctx && window.MapAtlas) {
                    MapAtlas.render(window.MapCamera.ctx, window.MapCamera, window.GlobalEnemies);
                }

                if (footerDiv) footerDiv.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px; font-size:18px;" onclick="window.closeModal()">🏆 凯旋而归</button>`;
            }, 'combat_logs_realtime', 'combat_e_tox_bar', 'combat_e_tox_val', 'combat_p_tox_bar', 'combat_p_tox_val');
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
        const container = document.getElementById('combat_sidebar_content');
        if (!container) return;

        let html = '';
        const consumables = (window.player && window.player.consumables) ? window.player.consumables : [null, null, null];

        consumables.forEach((itemId, idx) => {
            let inner = '';
            let btnClassAdd = 'empty-slot-btn';
            let tooltipHtml = '';
            let onclick = '';

            if (itemId) {
                const db = window.GAME_DB || { items: [] };
                const item = db.items ? db.items.find(i => i &&  i.id === itemId) : null;

                if (item) {
                    let icon = item.icon || '💊';
                    if (window.getItemIcon) icon = getItemIcon(item);
                    else if (typeof getItemIcon === 'function') icon = getItemIcon(item);

                    tooltipHtml = this._generateItemTooltip(item);

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
                <div class="c-slot-wrapper">
                    <div class="c-slot-box">${inner}</div>
                    ${tooltipHtml}
                    <button id="combat_btn_use_${idx}" class="ink_btn_small c-use-btn ${btnClassAdd}" disabled onclick="${onclick}">使用</button>
                    <div id="combat_cd_overlay_${idx}" class="c-cd-overlay" style="display:none;"></div>
                </div>
            `;
        });

        container.innerHTML = `<div class="sidebar-title">锦囊</div>${html}`;
    },

    _getItemCount: function(itemId) {
        if (!player || !player.inventory) return 0;
        const slot = player.inventory.find(i => i &&  i.id === itemId);
        return slot ? slot.count : 0;
    },

    _generateItemTooltip: function(item) {
        if (!item) return '';
        let statsHtml = '';
        if (item.effects) {
            for (let k in item.effects) {
                let val = item.effects[k];
                let label = k;
                let color = '#fff';
                let sign = val > 0 ? '+' : '';

                if (k === 'hp') { label = '生命'; color = val > 0 ? '#4caf50' : '#f44336'; }
                else if (k === 'mp') { label = '内力'; color = '#2196f3'; }
                else if (k === 'toxicity') {
                    if (val > 0) { label = '☠️ 丹毒'; color = '#9c27b0'; }
                    else { label = '🌿 解毒'; color = '#4caf50'; sign = ''; }
                } else { color = val > 0 ? '#4caf50' : '#f44336'; }

                statsHtml += `<div>${label}: <span style="color:${color}">${sign}${val}</span></div>`;
            }
        }
        if (item.desc) statsHtml += `<div style="margin-top:5px; color:#aaa; font-style:italic; font-size:18px;">${item.desc}</div>`;

        return `
            <div class="c-item-tooltip">
                <div style="font-weight:bold; color:#fff; border-bottom:1px solid #555; padding-bottom:2px; margin-bottom:4px;">${item.name}</div>
                ${statsHtml}
            </div>
        `;
    }
};

window.UICombatModal = UICombatModal;