// js/modules/ui_combat_modal.js
// 战斗弹窗UI管理器 v4.5 (修复NextWave连战逻辑 + 适配新属性面板)

const UICombatModal = {
    _isStyleInjected: false,

    _injectStyles: function() {
        if (this._isStyleInjected) return;

        const cssContent = `
            .combat-wrapper { display: flex; flex-direction: column; height: 100%; min-height: 550px; font-family: "Kaiti", serif; font-size: 20px; color: #333; position:relative; }
            .combat-header { display: flex; justify-content: space-between; align-items: stretch; padding: 10px; background: linear-gradient(to bottom, #fdfbf7, #f5f5f5); border-bottom: 3px double #8d6e63; flex-shrink: 0; gap: 10px; }
            
            .fighter-card { flex: 1; display: flex; align-items: stretch; gap: 10px; min-width: 0; }
            .fighter-card.enemy { flex-direction: row; }
            .fighter-card.player { flex-direction: row; }

            /* 身份信息区域 */
            .fighter-identity { 
                flex: 0 0 200px;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                text-align: center; background: rgba(0,0,0,0.02); border-radius: 8px; padding: 5px; border: 1px solid rgba(0,0,0,0.05);
            }
            .fighter-icon { font-size: 48px; line-height: 1; filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.2)); margin-bottom: 5px; }
            .fighter-name { font-size: 18px; font-weight: bold; line-height: 1.2; word-break: break-all; }
            .fighter-rank { font-size: 12px; font-weight: bold; padding: 1px 4px; border-radius: 4px; margin-top: 4px; display:inline-block;}

            /* 数值面板区域 */
            .fighter-main { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
            
            .vs-divider { font-size: 32px; font-weight: 900; color: #a94442; align-self: center; width: 40px; text-align: center; font-style: italic; text-shadow: 1px 1px 0 #fff, 2px 2px 0 rgba(0,0,0,0.1); }

            .stats-panel { background: #fff; padding: 6px; border-radius: 6px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            
            /* 条形图 */
            .bar-row { display: flex; align-items: center; gap: 5px; height: 16px; margin-bottom: 3px; }
            .bar-icon { width: 16px; text-align: center; font-size: 14px; font-weight: bold; line-height: 1; }
            .bar-bg { flex: 1; height: 100%; background: #eee; border: 1px solid #ccc; border-radius: 3px; overflow: hidden; position: relative; }
            .bar-text { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; text-shadow: 1px 1px 1px rgba(0,0,0,0.8); z-index: 2; line-height: 1; font-weight: bold; font-family: Arial, sans-serif; letter-spacing: 0.5px; }
            
            .hp-fill { height: 100%; width: 100%; background: linear-gradient(90deg, #ef5350, #c62828); transition: width 0.2s ease-out; }
            .mp-fill { height: 100%; width: 100%; background: linear-gradient(90deg, #42a5f5, #1565c0); transition: width 0.2s ease-out; }
            .tox-row { height: 6px; margin-top: 0; margin-bottom: 2px; }
            .tox-fill { background: #ab47bc; height: 100%; width: 0%; transition: width 0.3s; }
            
            .ap-row { margin-top: 2px; height: 6px; display: flex; align-items: center; gap: 5px; }
            .ap-bg { flex: 1; height: 100%; background: #555; border-radius: 3px; overflow: hidden; position: relative; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5); }
            .ap-fill { height: 100%; width: 0%; 
             background: #ef6c00;
             box-shadow: 0 0 8px #e65100; transition: width 0.05s linear; will-change: width; } 
            .ap-icon { font-size: 10px; color: #795548; font-weight: bold; width: 16px; text-align: center; }

            /* 属性数值区 */
            .attr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-top: 5px; }
            .attr-box { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 3px; font-size: 12px; text-align: center; padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; display: flex; align-items: center; justify-content: center; }
            .attr-label { color: #433e3e; font-size: 15px; margin-right: 4px; transform: scale(0.95); }
            .attr-val { font-weight: bold; color: #333; font-family: Arial, sans-serif; }
            .attr-extra { color: #aaa; font-size: 14px; margin-left: 3px; transform: scale(0.9); }

            /* 日志与侧边栏 */
            .combat-body { flex: 1; display: flex; overflow: hidden; border-top: 1px solid #d4a76a; }
            
            #combat_log_container_embed { 
                flex: 1; 
                background: #fffbf0; 
                padding: 15px 20px; 
                overflow-y: auto; 
                border-right: 2px solid #e0d0b0; 
                will-change: scroll-position; 
                scrollbar-width: thin;
                scrollbar-color: #d7ccc8 #fffbf0;
            }
            
            #combat_log_container_embed > div {
                font-family: 'Courier New', monospace; 
                font-size: 16px; 
                line-height: 1.6; 
                color: #333;
                border-bottom: 1px dashed rgba(161, 136, 127, 0.3);
                padding: 6px 0;
                margin-bottom: 2px;
                position: relative;
            }

            #combat_log_container_embed > div:last-child { border-bottom: none; }

            .turn-divider {
                text-align: center; color: #8d6e63; font-weight: bold;
                background: rgba(141, 110, 99, 0.1); border-radius: 4px;
                padding: 4px 0 !important; border-bottom: none !important; margin: 10px 0 !important;
            }

            .combat-sidebar-split { width: 180px; background: #f8f1e0; display: flex; box-shadow: -4px 0 10px rgba(0,0,0,0.05); z-index: 10; }
            .sidebar-col { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 5px; }
            .sidebar-title { font-size: 16px; font-weight: bold; color: #5d4037; border-bottom: 2px solid #a1887f; width: 100%; text-align: center; margin-bottom: 5px; padding-bottom: 2px; }
            .sidebar-items-container { display: flex; flex-direction: column; gap: 6px; width: 100%; align-items: center; overflow-y: auto; }
            
            .c-slot-wrapper { width: 70px; height: 80px; background: #fff; border: 1px solid #d7ccc8; border-radius: 4px; padding: 2px; display: flex; flex-direction: column; position: relative; cursor: help; }
            .c-slot-box { flex: 1; background: #fafafa; border: 1px dashed #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
            .c-icon { font-size: 24px; }
            .c-name { font-size: 10px; white-space: nowrap; overflow: hidden; width: 100%; text-align: center; margin-top: 2px; }
            .c-btn { width: 100%; font-size: 12px; padding: 1px 0; margin-top: 2px; border: 1px solid #ccc; background: #f5f5f5; cursor: pointer; }
            .c-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            
            /* CD 遮罩分离 */
            /* ====== 【新增】彻底分离的样式 ====== */
            
            /* 1. 丹药样式 (Danyao) */
            .danyao_slot_wrapper { width: 70px; height: 80px; background: #fff; border: 1px solid #d7ccc8; border-radius: 4px; padding: 2px; display: flex; flex-direction: column; position: relative; cursor: help; }
            .danyao_btn { width: 100%; font-size: 12px; padding: 1px 0; margin-top: 2px; border: 1px solid #ccc; background: #f5f5f5; cursor: pointer; }
            .danyao_btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .danyao_cd_overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; color:#333; z-index:5; }

            /* 2. 功法样式 (Gongfa) */
            .gongfa_slot_wrapper { width: 70px; height: 80px; background: #fff; border: 1px solid #a1887f; border-radius: 4px; padding: 2px; display: flex; flex-direction: column; position: relative; cursor: help; }
            .gongfa_btn { width: 100%; font-size: 12px; padding: 1px 0; margin-top: 2px; border: 1px solid #a1887f; background: #efebe9; color:#5d4037; cursor: pointer; }
            .gongfa_btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .gongfa_cd_overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:bold; color:#333; z-index:5; }

            /* 通用内部盒子 */
            .c-slot-box { flex: 1; background: #fafafa; border: 1px dashed #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
            .c-icon { font-size: 24px; }
            .c-name { font-size: 10px; white-space: nowrap; overflow: hidden; width: 100%; text-align: center; margin-top: 2px; }
            
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-combat-modal';
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);
        this._isStyleInjected = true;
    },

    _patchEnemyData: function(enemy) {
        enemy.basePen = enemy.basePen || 0;
        enemy.toxAtk = enemy.toxAtk || 0;
        if (!enemy.stats) enemy.stats = {};
        if (enemy.phy_atk === undefined) enemy.phy_atk = enemy.atk;
        if (enemy.mag_atk === undefined) enemy.mag_atk = enemy.atk;
        if (enemy.phy_def === undefined) enemy.phy_def = enemy.def;
        if (enemy.mag_def === undefined) enemy.mag_def = enemy.def;
    },

    /**
     * 计算实际行动时间 (秒)
     * 公式: 5秒 / (1 + 速度 * 0.006)
     */
    /**
     * 【修复】计算实际行动时间 (秒)
     * 现在直接从 CombatCore 读取配置，保证数值同步
     */
    _calcActionTime: function(speed) {
        // 读取配置，如果读取不到则使用默认保底值 (应对未加载的情况)
        const config = (window.CombatCore && window.CombatCore.CONFIG) ? window.CombatCore.CONFIG : { BASE_TIME: 3.0, SPD_FACTOR: 0.01 };

        const baseTime = config.BASE_TIME;
        const factor = config.SPD_FACTOR;

        const multiplier = 1 + (speed * factor);
        const safeMult = Math.max(0.1, multiplier);
        const time = baseTime / safeMult;
        return time.toFixed(1);
    },

    show: function(enemy, externalOnWin = null, options = { canEscape: true, isMultiWave: false }) {
        if (!window.Combat || !window.UtilsModal) return;
        this._injectStyles();
        this._patchEnemyData(enemy);
        if (window.recalcStats) window.recalcStats();

        const p = window.player;
        const pDerived = p.derived || {};

        const eMaxHp = (enemy.stats && enemy.stats.maxHp !== undefined) ? enemy.stats.maxHp : (enemy.maxHp || enemy.hp || 100);
        const eHpPct = Math.max(0, Math.min(100, (enemy.hp / eMaxHp) * 100));
        const eToxPct = Math.min(100, enemy.toxicity || 0);
        const eStats = enemy.stats || {};
        const eSpd = eStats.speed || enemy.speed || 0;
        const eActTime = this._calcActionTime(eSpd);

        const pHpPct = Math.max(0, Math.min(100, (pDerived.hp / pDerived.hpMax) * 100));
        const pMpPct = Math.max(0, Math.min(100, ((pDerived.mp || 0) / (pDerived.mpMax || 100)) * 100));
        const pToxPct = Math.min(100, p.toxicity || 0);
        const pSpd = pDerived.speed || 0;
        const pActTime = this._calcActionTime(pSpd);

        const rankMap = { "minion": "普通", "elite": "【精英】", "boss": "【头目】", "lord": "【领主】" };
        const displayRank = rankMap[enemy.template || "minion"] || "普通";

        const contentHtml = `
        <div class="combat-wrapper">
            <div class="combat-header">
                
                <div class="fighter-card enemy">
                    <div class="fighter-main">
                        <div class="stats-panel">
                            <div class="bar-row">
                                <div class="bar-icon" style="color:#d32f2f">❤</div>
                                <div class="bar-bg">
                                    <div id="combat_e_hp_bar" class="hp-fill" style="width:${eHpPct}%"></div>
                                    <div class="bar-text"><span id="combat_e_hp">${Math.floor(enemy.hp)}</span>/${Math.floor(eMaxHp)}</div>
                                </div>
                            </div>
                            <div class="bar-row tox-row">
                                <div class="bar-icon" style="font-size:10px; color:#ab47bc">☠</div>
                                <div class="bar-bg" style="background:#f3e5f5; border:none;">
                                    <div id="combat_e_tox_bar" class="tox-fill" style="width:${eToxPct}%"></div>
                                    <div class="bar-text" style="justify-content:flex-end; padding-right:2px; color:#ab47bc;">
                                        <span id="combat_e_tox_val">${Math.floor(enemy.toxicity||0)}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ap-row">
                                <div class="ap-icon">⚡</div>
                                <div class="ap-bg">
                                    <div id="combat_e_ap_bar" class="ap-fill"></div>
                                </div>
                            </div>
                            <div class="attr-grid">
                                <div class="attr-box" id="e_attr_phy_atk"><span class="attr-label">物攻</span><span class="attr-val">${eStats.phy_atk||enemy.atk}</span></div>
                                <div class="attr-box" id="e_attr_mag_atk"><span class="attr-label">法攻</span><span class="attr-val">${eStats.mag_atk||enemy.atk}</span></div>
                                <div class="attr-box" id="e_attr_phy_def"><span class="attr-label">物防</span><span class="attr-val">${eStats.phy_def||enemy.def}</span></div>
                                <div class="attr-box" id="e_attr_mag_def"><span class="attr-label">法防</span><span class="attr-val">${eStats.mag_def||enemy.def}</span></div>
                                <div class="attr-box" id="e_attr_spd" style="grid-column: span 2;">
                                    <span class="attr-label">速度</span>
                                    <span class="attr-val">${eSpd}</span>
                                    <span class="attr-extra">(${eActTime}秒)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="fighter-identity">
                        <div class="fighter-icon">${enemy.visual?.icon || '👹'}</div>
                        <div class="fighter-name" style="color:${enemy.visual?.color || '#d32f2f'}">${enemy.name}</div>
                        <span class="fighter-rank" style="border:1px solid ${enemy.visual?.color}; color:${enemy.visual?.color}">${displayRank}</span>
                    </div>
                </div>

                <div class="vs-divider">VS</div>

                <div class="fighter-card player">
                    <div class="fighter-identity">
                        <div class="fighter-icon">🧘</div>
                        <div class="fighter-name" style="color:#1976d2">${p.name || '少侠'}</div>
                        <span class="fighter-rank" style="border:1px solid #1976d2; color:#1976d2">修仙者</span>
                    </div>

                    <div class="fighter-main">
                        <div class="stats-panel">
                            <div class="bar-row">
                                <div class="bar-icon" style="color:#d32f2f">❤</div>
                                <div class="bar-bg">
                                    <div id="combat_p_hp_bar" class="hp-fill" style="width:${pHpPct}%"></div>
                                    <div class="bar-text"><span id="combat_p_hp">${Math.floor(pDerived.hp)}</span>/${Math.floor(pDerived.hpMax)}</div>
                                </div>
                            </div>
                            <div class="bar-row">
                                <div class="bar-icon" style="color:#1976d2">💧</div>
                                <div class="bar-bg">
                                    <div id="combat_p_mp_bar" class="mp-fill" style="width:${pMpPct}%"></div>
                                    <div class="bar-text"><span id="combat_p_mp">${Math.floor(pDerived.mp)}</span>/${Math.floor(pDerived.mpMax)}</div>
                                </div>
                            </div>
                            <div class="bar-row tox-row">
                                <div class="bar-icon" style="font-size:10px; color:#ab47bc">☠</div>
                                <div class="bar-bg" style="background:#f3e5f5; border:none;">
                                    <div id="combat_p_tox_bar" class="tox-fill" style="width:${pToxPct}%"></div>
                                    <div class="bar-text" style="justify-content:flex-end; padding-right:2px; color:#ab47bc;">
                                        <span id="combat_p_tox_val">${Math.floor(p.toxicity||0)}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="ap-row">
                                <div class="ap-icon">⚡</div>
                                <div class="ap-bg">
                                    <div id="combat_p_ap_bar" class="ap-fill"></div>
                                </div>
                            </div>
                            
                            <div class="attr-grid">
                                <div class="attr-box" id="p_attr_atk"><span class="attr-label">物攻</span><span class="attr-val">${pDerived.phy_atk||pDerived.atk}</span></div>
                                <div class="attr-box" id="p_attr_mag_atk"><span class="attr-label">法攻</span><span class="attr-val">${pDerived.mag_atk||pDerived.atk}</span></div>
                                <div class="attr-box" id="p_attr_def"><span class="attr-label">物防</span><span class="attr-val">${pDerived.phy_def||pDerived.def}</span></div>
                                <div class="attr-box" id="p_attr_mag_def"><span class="attr-label">法防</span><span class="attr-val">${pDerived.mag_def||pDerived.def}</span></div>
                                <div class="attr-box" id="p_attr_crit"><span class="attr-label">物暴</span><span class="attr-val">${pDerived.crit||0}%</span></div>
                                <div class="attr-box" id="p_attr_mag_crit"><span class="attr-label">法暴</span><span class="attr-val">${pDerived.mag_crit||0}%</span></div>
                                <div class="attr-box" id="p_attr_sharp"><span class="attr-label">锋利</span><span class="attr-val">${pDerived.sharpness||0}</span></div>
                                <div class="attr-box" id="p_attr_pen"><span class="attr-label">灵透</span><span class="attr-val">${pDerived.penetration||0}</span></div>
                                <div class="attr-box" id="p_attr_spd" style="grid-column: span 2;">
                                    <span class="attr-label">速度</span>
                                    <span class="attr-val">${pSpd}</span>
                                    <span class="attr-extra">(${pActTime}秒)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="combat-body">
                <div id="combat_log_container_embed">
                    <div id="combat_desc_initial" style="text-align:center; padding-top: 60px;">
                        <div style="font-size:24px; color:#5d4037; font-weight:bold; margin-bottom: 20px;">“${enemy.desc || '强敌当前，准备迎战！'}”</div>
                        <div style="font-size:16px; color:#999;">(点击“拔剑迎敌”开始战斗)</div>
                    </div>
                    <div id="combat_logs_realtime"></div>
                </div>
                
                <div class="combat-sidebar-split">
                    <div class="sidebar-col">
                        <div class="sidebar-title">丹药</div>
                        <div id="sidebar_consumables" class="sidebar-items-container"></div>
                    </div>
                    <div style="width:1px; background:#d7ccc8; margin:5px 0;"></div>
                    <div class="sidebar-col">
                        <div class="sidebar-title">功法</div>
                        <div id="sidebar_skills" class="sidebar-items-container"></div>
                    </div>
                </div>
            </div>
        </div>`;

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
                    <div style="display:flex; align-items:center; gap:5px; background:#f5f5f5; padding:2px 5px; border-radius:4px; border:1px solid #ddd;">
                        <button class="ink_btn_small" style="width:24px; padding:0;" onclick="window['${spdCB}'](-500)">+</button>
                        <span id="combat_speed_display" style="font-size:12px; min-width:30px; text-align:center;">1.0x</span>
                        <button class="ink_btn_small" style="width:24px; padding:0;" onclick="window['${spdCB}'](500)">-</button>
                    </div>
                    <button id="combat_btn_pause" class="ink_btn_normal" style="flex:1; font-size:16px;" onclick="window['${pauseCB}']()">⏸ 暂停</button>
                    ${options.canEscape ? `<button class="ink_btn_normal" style="flex:1; border-color:#d32f2f; color:#d32f2f; font-size:16px;" onclick="window['${stopCB}']()">🏃 撤退</button>` : ''}
                `;
            }

            Combat.start(enemy, () => {
                if (window.BountyBoard) window.BountyBoard.onEnemyKilled(enemy.id);
                if (window.GlobalEnemies) window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);
                if (window.MapCamera) window.MapCamera.renderMap();
                if (externalOnWin) externalOnWin();

                if (!options.isMultiWave && footerDiv) {
                    footerDiv.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px; font-size:18px;" onclick="window.closeModal()">🏆 战斗结束</button>`;
                }
                cleanCallbacks();
            }, 'combat_logs_realtime', options);
        };

        const footerHtml = `
            <div id="map_combat_footer" style="display:flex; gap:10px; width:100%;">
                ${options.canEscape ? `<button class="ink_btn_normal" style="flex:1;" onclick="window.closeModal()">🏃 稍后再战</button>` : ''}
                <button class="ink_btn_danger" style="flex:1; font-weight:bold;" onclick="window['${startCB}']()">⚔️ 拔剑迎敌</button>
            </div>`;

        const modalTitle = options.canEscape ? "遭遇强敌" : `🛑 殊死一搏 - ${enemy.name}`;

        UtilsModal.showInteractiveModal(
            modalTitle,
            contentHtml,
            footerHtml,
            "combat_modal",
            90,
            null,
            {
                allowOutsideClick: false,
                onClose: () => cleanCallbacks()
            }
        );

        this.updateSidebar();
    },

    /** 更新侧边栏 (丹药与功法完全分离) */
    updateSidebar: function() {
        // 1. 丹药栏 (Danyao)
        const consContainer = document.getElementById('sidebar_consumables');
        if (consContainer) {
            let html = '';
            const consumables = window.player.consumables || [null, null, null];
            consumables.forEach((sid, idx) => {
                const item = sid ? window.player.inventory.find(i => i.sid === sid) : null;
                const inner = item
                    ? `<div class="c-icon">💊</div><div class="c-name">${item.name}</div>`
                    : `<div style="color:#ccc; font-size:12px;">空</div>`;

                let tooltipAttr = "";
                if (sid) {
                    tooltipAttr = `onmouseenter="if(window.TooltipManager)TooltipManager.showItem(event, '${sid}')" onmouseleave="if(window.TooltipManager)TooltipManager.hide()" onmousemove="if(window.TooltipManager)TooltipManager._move(event)"`;
                }

                const onclick = `if(window.TooltipManager)window.TooltipManager.hide();Combat.useConsumable('${idx}')`;
                const disabled = !item ? 'disabled' : '';

                // 【核心】使用 danyao_... 类名
                html += `
                <div class="danyao_slot_wrapper" ${tooltipAttr}>
                    <div class="c-slot-box">${inner}</div>
                    <button id="combat_btn_use_${idx}" class="danyao_btn" ${disabled} onclick="${onclick}">使用</button>
                    <div id="combat_cd_overlay_${idx}" class="danyao_cd_overlay" style="display:none;"></div>
                </div>`;
            });
            consContainer.innerHTML = html;
        }

        // 2. 功法栏 (Gongfa)
        const skillContainer = document.getElementById('sidebar_skills');
        if (skillContainer) {
            let html = '';
            const activeSkills = [];
            if (window.player.equipment && window.player.equipment.gongfa) {
                window.player.equipment.gongfa.forEach(id => {
                    const book = window.GAME_DB.items.find(i => i.id === id);
                    if (book && book.action) activeSkills.push({ id, data: book });
                });
            }

            if (activeSkills.length === 0) {
                html = `<div style="color:#999; font-size:12px; margin-top:10px;">(无主动功法)</div>`;
            } else {
                activeSkills.forEach((entry, idx) => {
                    const tooltipAttr = `onmouseenter="if(window.TooltipManager)TooltipManager.showSkill(event, '${entry.id}')" onmouseleave="if(window.TooltipManager)TooltipManager.hide()" onmousemove="if(window.TooltipManager)TooltipManager._move(event)"`;
                    const onclick = `if(window.TooltipManager)window.TooltipManager.hide();Combat.useSkill('${entry.id}', '${idx}')`;

                    // 【核心】使用 gongfa_... 类名
                    html += `
                    <div class="gongfa_slot_wrapper" ${tooltipAttr}>
                        <div class="c-slot-box" style="border-color:#a1887f;">
                            <div class="c-icon">${entry.data.icon || '📘'}</div>
                            <div class="c-name">${entry.data.action.name.substring(0,4)}</div>
                        </div>
                        <button id="combat_btn_skill_${entry.id}" class="gongfa_btn" onclick="${onclick}">释放</button>
                        <div id="combat_skill_cd_overlay_${entry.id}" class="gongfa_cd_overlay" style="display:none;"></div>
                    </div>`;
                });
            }
            skillContainer.innerHTML = html;
        }
    },

    /**
     * 【修复】连战逻辑
     * 适配新的UI结构 (phy_atk, mag_atk 等)
     */
    nextWave: function(enemy, nextOnWin = null, options = { canEscape: false, isMultiWave: false }) {
        let modalEl = document.getElementById('combat_modal');
        if (!modalEl) {
            const wrapper = document.querySelector('.combat-wrapper');
            if (wrapper) modalEl = wrapper.closest('.ink-modal') || wrapper.parentElement;
        }

        if (!modalEl) {
            this.show(enemy, nextOnWin, options);
            return;
        }

        this._patchEnemyData(enemy);

        const eMaxHp = (enemy.stats && enemy.stats.maxHp !== undefined) ? enemy.stats.maxHp : (enemy.maxHp || enemy.hp || 100);
        const rankMap = { "minion": "普通", "elite": "【精英】", "boss": "【头目】", "lord": "【领主】" };
        const displayRank = rankMap[enemy.template || "minion"] || "普通";

        try {
            const titleEl = modalEl.querySelector('.ink-modal-title') || document.querySelector('.modal-header h3');
            if (titleEl) {
                titleEl.innerText = options.canEscape ? "遭遇强敌" : `🛑 殊死一搏 - ${enemy.name}`;
            }
        } catch(e) {}

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

        // 【核心修复】更新拆分后的属性面板
        const eStats = enemy.stats || {};
        const updateAttr = (id, val) => {
            const el = document.getElementById(id);
            if(el) {
                const valEl = el.querySelector('.attr-val');
                if(valEl) valEl.innerText = val;
                const buffEl = el.querySelector('.attr-buff-val');
                if(buffEl) buffEl.remove();
            }
        };

        updateAttr('e_attr_phy_atk', eStats.phy_atk || enemy.atk);
        updateAttr('e_attr_mag_atk', eStats.mag_atk || enemy.atk);
        updateAttr('e_attr_phy_def', eStats.phy_def || enemy.def);
        updateAttr('e_attr_mag_def', eStats.mag_def || enemy.def);

        // 更新速度和时间
        const spd = eStats.speed || enemy.speed;
        updateAttr('e_attr_spd', spd);
        // 重新计算并更新时间
        const timeEl = document.getElementById('e_attr_spd').querySelector('.attr-extra');
        if (timeEl) {
            const actTime = this._calcActionTime(spd);
            timeEl.innerText = `(${actTime}秒)`;
        }

        const logContainer = document.getElementById('combat_logs_realtime');
        if (logContainer) logContainer.innerHTML = '';

        const descEl = document.getElementById('combat_desc_initial');
        if(descEl) {
            descEl.style.display = 'block';
            const titleEl = descEl.querySelector('div:first-child');
            if(titleEl) titleEl.innerText = `“${enemy.desc || '又一波敌人逼近……'}”`;
        }

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
    }
};

window.UICombatModal = UICombatModal;