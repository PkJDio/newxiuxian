// js/modules/shops/game/game_qingyun_ui.js
// 青云赛 - 视图层 v6.9 (修复规则字体颜色)

const qingyunUIStyles = `
<style id="game-qingyun-ui-styles-v69">
    /* --- 基础容器 --- */
    .qy_container { width:100%; height:100%; background:#1b262c; display:flex; flex-direction:column; font-family:"KaiTi"; overflow:hidden; user-select: none; position:relative; }
    .qy_top { height:50px; background:rgba(0,0,0,0.6); border-bottom:1px solid #37474f; display:flex; justify-content:space-between; align-items:center; padding:0 20px; color:#b0bec5; z-index:20; font-size: 16px; }
    .qy_top b { color: #fff; margin: 0 4px; }
    .qy_top_right { display:flex; gap:10px; }
    .qy_icon_btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #ddd; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 18px; transition: all 0.2s; }
    .qy_icon_btn:hover { background: rgba(255,255,255,0.2); color: #fff; border-color: #fff; }
    .qy_icon_btn.danger:hover { background: #c62828; border-color: #ef5350; }
    
    .qy_stage { flex:1; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center; background: radial-gradient(circle at center, #263238 0%, #102027 100%); }

    /* 右侧统计侧边栏 */
    .qy_sidebar { position: absolute; right: 10px; top: 10px; bottom: 10px; width: 220px; background: rgba(0,0,0,0.5); border: 1px solid #455a64; border-radius: 8px; display: flex; flex-direction: column; z-index: 30; pointer-events: none; }
    .qy_sidebar_header { padding: 8px; font-size: 16px; font-weight: bold; color: #b0bec5; border-bottom: 1px dashed #546e7a; background: rgba(0,0,0,0.3); border-radius: 8px 8px 0 0; text-align:center; }
    .qy_stats_content { flex:1; overflow-y:auto; padding:10px; font-size: 13px; color: #cfd8dc; pointer-events: auto; scrollbar-width: thin; scrollbar-color: #546e7a rgba(0,0,0,0.1); }
    .qy_stats_content::-webkit-scrollbar { width: 6px; }
    .qy_stats_content::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    .qy_stats_content::-webkit-scrollbar-thumb { background: #546e7a; border-radius: 3px; }

    .qy_stats_table { width: 100%; border-collapse: collapse; }
    .qy_stats_table th { text-align:left; color:#90a4ae; border-bottom:1px solid #546e7a; padding-bottom:5px; }
    .qy_stats_table td { padding: 8px 0; border-bottom: 1px dashed rgba(255,255,255,0.1); vertical-align: top; }
    .qy_event_tag { display:inline-block; padding:2px 4px; border-radius:3px; font-size:10px; margin-top:2px; }
    .qy_event_win { background:rgba(239, 83, 80, 0.2); color:#ef5350; border:1px solid #ef5350; }
    .qy_event_lose { background:rgba(66, 165, 245, 0.2); color:#42a5f5; border:1px solid #42a5f5; }

    /* 左侧日志面板 */
    .qy_log_panel { position: absolute; left: 10px; top: 10px; bottom: 10px; width: 220px; background: rgba(0,0,0,0.5); border: 1px solid #455a64; border-radius: 8px; display: flex; flex-direction: column; z-index: 30; pointer-events: none; }
    .qy_log_header { padding: 8px; font-size: 16px; font-weight: bold; color: #b0bec5; border-bottom: 1px dashed #546e7a; background: rgba(0,0,0,0.3); border-radius: 8px 8px 0 0; }
    .qy_log_content { flex: 1; overflow-y: auto; padding: 8px; font-size: 14px; color: #cfd8dc; display: flex; flex-direction: column; gap: 4px; pointer-events: auto; }
    .qy_log_content::-webkit-scrollbar { width: 6px; }
    .qy_log_content::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
    .qy_log_content::-webkit-scrollbar-thumb { background: #546e7a; border-radius: 3px; }
    .qy_log_item { line-height: 1.4; text-shadow: 1px 1px 0 #000; animation: fadeIn 0.3s; }
    .qy_log_item .highlight { color: #ffca28; }
    @keyframes fadeIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }

    .qy_track_layer { position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index: 1; }
    .qy_track_rect { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); box-sizing: border-box; border-style: solid; border-radius: 20px; box-shadow: 0 0 15px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.5); }
    .qy_track_rect.outer { width: 652px; height: 452px; border-width: 52px; border-color: rgba(69, 90, 100, 0.4); }
    .qy_track_rect.mid { width: 492px; height: 332px; border-width: 52px; border-color: rgba(251, 192, 45, 0.15); }
    .qy_track_rect.inner { width: 332px; height: 212px; border-width: 52px; border-color: rgba(216, 67, 21, 0.15); }

    .qy_cell { position: absolute; width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; font-size: 12px; color: rgba(255,255,255,0.2); border-radius: 8px; z-index: 5; transition: all 0.2s; cursor: default; pointer-events: auto; }
    .qy_cell.outer { border-color: #546e7a; }
    .qy_cell.mid { border-color: #fbc02d; }
    .qy_cell.inner { border-color: #ff5722; }
    .qy_cell.finish { background: rgba(0, 230, 118, 0.3); border-color: #00e676; color: #fff; font-weight:bold; box-shadow: 0 0 10px #00e676; }
    .qy_cell.valid-target { background: rgba(100, 255, 100, 0.3) !important; border-color: #00e676 !important; cursor: pointer; animation: pulse 1s infinite; }
    @keyframes pulse { 0% {box-shadow: 0 0 0 0 rgba(0,230,118,0.4);} 70% {box-shadow: 0 0 0 10px rgba(0,230,118,0);} 100% {box-shadow: 0 0 0 0 rgba(0,230,118,0);} }

    .qy_strategy_token { position: absolute; width: 28px; height: 28px; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-size: 16px; font-weight: bold; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.8); z-index: 60; pointer-events: none; }
    .qy_strategy_token.yang { background: #d32f2f; border: 2px solid #ffcdd2; }
    .qy_strategy_token.yin { background: #1976d2; border: 2px solid #bbdefb; }

    .qy_card.strategy { border-color: #9c27b0; color: #e1bee7; background: #4a148c; width: 60px; }
    .qy_card.strategy:hover { background: #6a1b9a; }
    .qy_card.strategy.disabled { filter: grayscale(1); opacity: 0.3; pointer-events: none; }

    .qy_center_pool { position: absolute; width: 160px; height: 80px; left: 50%; top: 50%; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(62,39,35,0.95) 0%, rgba(27,27,27,0.95) 100%); border: 2px solid #ffd700; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 0 40px rgba(255, 215, 0, 0.3); z-index: 20; }
    .qy_pool_label { color: #ffecb3; font-size: 12px; margin-bottom: 4px; letter-spacing: 1px; }
    .qy_pool_val { color: #ffd700; font-size: 28px; font-weight: 900; text-shadow: 0 2px 4px #000; font-family: Arial, sans-serif; }

    .qy_pawn { position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 0 rgba(0,0,0,0.5); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 50; }
    .qy_pawn.red { background: linear-gradient(135deg, #ef5350, #b71c1c); }
    .qy_pawn.blue { background: linear-gradient(135deg, #42a5f5, #0d47a1); }
    .qy_pawn.green { background: linear-gradient(135deg, #66bb6a, #1b5e20); }
    .qy_pawn.yellow { background: linear-gradient(135deg, #ffee58, #f57f17); color: #3e2723; text-shadow:none; }
    .qy_pawn.white { background: linear-gradient(135deg, #eceff1, #546e7a); color: #37474f; text-shadow:none; }

    /* 底部栏 - relative */
    .qy_bottom { 
        height: 230px; background: #212121; border-top: 3px double #4e342e; 
        display: flex; box-shadow: 0 -5px 20px rgba(0,0,0,0.5); z-index:30; 
        position: relative; 
    }
    
    .qy_panel_l { flex: 1.4; padding: 12px; border-right: 1px solid #424242; display:flex; flex-direction:column; gap:10px; }
    .qy_row_label { font-size: 13px; color: #90a4ae; margin-bottom: 4px; font-weight:bold; }
    .qy_card_row { display: flex; gap: 8px; flex-wrap: wrap; }
    
    /* 55px x 66px */
    .qy_card { width: 55px; height: 66px; border-radius: 6px; border: 1px solid #546e7a; cursor: pointer; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 13px; background: #37474f; transition: transform 0.1s, border-color 0.1s; box-shadow: 0 3px 5px rgba(0,0,0,0.3); position:relative; }
    .qy_card:hover { transform: translateY(-4px); border-color: #fff; z-index: 10; background: #455a64; }
    .qy_card.red { border-bottom: 4px solid #ef5350; color: #ef5350; }
    .qy_card.blue { border-bottom: 4px solid #42a5f5; color: #42a5f5; }
    .qy_card.green { border-bottom: 4px solid #66bb6a; color: #66bb6a; }
    .qy_card.yellow { border-bottom: 4px solid #ffee58; color: #ffee58; }
    .qy_card.white { border-bottom: 4px solid #cfd8dc; color: #fff; }
    
    .qy_panel_m { flex: 1; padding: 12px; border-right: 1px solid #424242; text-align: center; display:flex; flex-direction:column; justify-content:center; }
    .qy_hand { display: flex; justify-content: center; gap: 6px; margin-top: 10px; }
    .qy_panel_r { width: 140px; padding: 12px; display: flex; flex-direction: column; gap: 12px; justify-content:center; }
    .qy_btn { flex: 1; border: none; border-radius: 6px; cursor: pointer; color: #fff; font-weight: bold; font-family:"KaiTi"; font-size:18px; box-shadow: 0 4px 0 rgba(0,0,0,0.3); transition: all 0.1s; max-height: 60px; }
    .qy_btn:active { transform: translateY(4px); box-shadow: none; }
    .qy_btn.bet { background: linear-gradient(to bottom, #1565c0, #0d47a1); }
    .qy_btn.skip { background: linear-gradient(to bottom, #616161, #424242); }
    .qy_btn:disabled { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; }
    
    /* AI 遮罩 */
    .qy_ai_mask {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 100;
        display: flex; justify-content: center; align-items: center;
        font-size: 32px; color: #ffd700; font-weight: bold;
        text-shadow: 0 0 10px #000; letter-spacing: 2px;
        backdrop-filter: blur(4px);
        pointer-events: auto;
    }
</style>
`;

class QingyunUI {
    constructor(container) {
        this.container = container;
        this.mapCoords = [];
        this._injectStyles();
        this.onCellClick = null;
    }

    _injectStyles() {
        if (!document.getElementById('game-qingyun-ui-styles-v69')) {
            const old = document.getElementById('game-qingyun-ui-styles-v68') || document.getElementById('game-qingyun-ui-styles');
            if (old) old.remove();
            document.head.insertAdjacentHTML('beforeend', qingyunUIStyles);
        }
    }

    init(model) {
        this.container.innerHTML = `
            <div class="qy_container">
                <div class="qy_top">
                    <div>第 <b id="qy_round">1</b> 轮 | 行动: <b id="qy_turn_player" style="color:#4fc3f7">...</b> <span id="qy_action_order" style="font-size:14px; color:#b0bec5; margin-left:8px;"></span></div>
                    <div class="qy_top_right">
                        <button class="qy_icon_btn" title="规则说明" id="btn_show_rules">❓</button>
                        <button class="qy_icon_btn danger" title="退出游戏" id="btn_exit_game">🏃</button>
                    </div>
                </div>
                
                <div class="qy_stage" id="qy_stage">
                    <div class="qy_log_panel">
                        <div class="qy_log_header">📜 赛况实录</div>
                        <div class="qy_log_content" id="qy_game_log">
                            <div class="qy_log_item">环境加载完毕...</div>
                        </div>
                    </div>

                    <div class="qy_sidebar">
                        <div class="qy_sidebar_header">📊 你的战绩</div>
                        <div class="qy_stats_content" id="qy_stats_chart"></div>
                    </div>

                    <div class="qy_track_layer">
                        <div class="qy_track_rect outer"></div>
                        <div class="qy_track_rect mid"></div>
                        <div class="qy_track_rect inner"></div>
                    </div>

                    <div id="qy_map_layer" class="qy_track_layer" style="z-index:5;"></div>
                    
                    <div class="qy_center_pool">
                        <div class="qy_pool_label">🏆 固定奖池</div>
                        <div class="qy_pool_val" id="qy_jackpot">0</div>
                    </div>
                    
                    <div id="qy_piece_layer" class="qy_track_layer" style="z-index:10; pointer-events:none;"></div>
                </div>

                <div class="qy_bottom" id="qy_bottom_panel">
                </div>
            </div>
        `;

        setTimeout(() => {
            const exitBtn = document.getElementById('btn_exit_game');
            if(exitBtn) exitBtn.onclick = () => {
                if (window.UtilsModal && window.UtilsModal.showQingyunDecision) {
                    UtilsModal.showQingyunDecision("强行离场", "确定要现在退出吗？筹码将按比例折算。", "确定", "取消",
                        () => GambleShop.selectGame('qingyun'), null
                    );
                } else {
                    if(confirm("确定要强行离场吗？")) GambleShop.selectGame('qingyun');
                }
            };

            const ruleBtn = document.getElementById('btn_show_rules');
            if(ruleBtn) ruleBtn.onclick = () => this.showRulesModal();

            this._generateMap(model);
        }, 100);
    }

    // 【修改点】规则弹窗字体颜色优化
    showRulesModal() {
        const rulesHtml = `
            <div style="text-align:left; font-size:16px; line-height:1.6; color:#3c3f41; padding:10px;">
                <ul style="list-style-type: disc; padding-left: 20px; margin:0;">
                    <li style="margin-bottom:8px;"><b>基本玩法</b>：四人竞速，棋子从外圈(18格) -> 中圈(17格) -> 内圈(16格) -> 终点。最先到达终点者获胜。</li>
                    <li style="margin-bottom:8px;"><b>回合行动</b>：每轮轮流行动，可选择 <span style="color:#ef5350">【拿牌下注】</span> 或 <span style="color:#42a5f5">【掷骰移动】</span>。
                        <br><small style="color:#546e7a">下注卡用于每轮结束结算筹码；掷骰移动对应颜色的棋子。</small>
                    </li>
                    <li style="margin-bottom:8px;"><b>特殊点数</b>：
                        <br>🎲 <b>升</b>：直接晋升到下一圈层。
                        <br>🎲 <b>降</b>：跌回上一圈层。
                        <br>🎲 <b>脏</b>：原地不动。
                    </li>
                    <li style="margin-bottom:8px;"><b>计谋系统</b>：消耗手牌中的计谋卡（需1筹码），在空地放置陷阱。
                        <br><span style="color:#ef5350">🔥 阳谋</span>：踩中者前进1步。
                        <br><span style="color:#42a5f5">💧 阴谋</span>：踩中者后退1步。
                    </li>
                    <li style="margin-bottom:8px;"><b>最终押注</b>：消耗5筹码和对应的【最终卡】，押注某颜色的棋子夺得 <b>冠军</b> 或 <b>倒数第一</b>。
                        <br><small style="color:#f57f17">注意：已使用的颜色不可再次押注！</small>
                    </li>
                    <li><b>奖池规则</b>：奖池金额固定。比赛结束后，根据排名和押注结果瓜分奖金。</li>
                </ul>
            </div>
        `;
        window.showGeneralModal("📜 青云赛规则", rulesHtml, null, "", 50);
    }

    addLog(text, isHighlight=false) {
        const logBox = document.getElementById('qy_game_log');
        if(!logBox) return;
        const item = document.createElement('div');
        item.className = 'qy_log_item';
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        item.innerHTML = `<span style="color:#78909c; font-size:12px; margin-right:5px;">[${timeStr}]</span> ${isHighlight ? `<span class="highlight">${text}</span>` : text}`;
        logBox.appendChild(item);
        logBox.scrollTop = logBox.scrollHeight;
    }

    _generateMap(model) {
        const stage = document.getElementById('qy_stage');
        const mapLayer = document.getElementById('qy_map_layer');
        if (!stage || !mapLayer) return;

        const cx = stage.clientWidth / 2;
        const cy = stage.clientHeight / 2;

        if (this.mapCoords.length === 0) {
            this._calcCoords(cx, cy, model);
        }

        mapLayer.innerHTML = '';

        model.LAYERS.forEach((layer, i) => {
            const coords = this.mapCoords[i];
            coords.forEach((pos, idx) => {
                const cell = document.createElement('div');
                cell.className = `qy_cell ${layer.name}`;
                if (idx === layer.steps - 1) cell.classList.add('finish');

                cell.style.left = (pos.x - 22) + 'px';
                cell.style.top = (pos.y - 22) + 'px';
                cell.innerText = idx;

                cell.dataset.layer = i;
                cell.dataset.index = idx;

                cell.onclick = () => {
                    if (this.onCellClick) this.onCellClick(i, idx);
                };

                const key = `${i}_${idx}`;
                const trap = model.strategyMap[key];
                if (trap) {
                    const token = document.createElement('div');
                    token.className = `qy_strategy_token ${trap.type === 1 ? 'yang' : 'yin'}`;
                    token.innerText = trap.type === 1 ? '阳' : '阴';
                    token.style.left = (pos.x - 14) + 'px';
                    token.style.top = (pos.y - 40) + 'px';
                    mapLayer.appendChild(token);
                }
                mapLayer.appendChild(cell);
            });
        });
    }

    _calcCoords(cx, cy, model) {
        this.mapCoords = [];
        const configs = [{ w: 600, h: 400 }, { w: 440, h: 280 }, { w: 280, h: 160 }];

        model.LAYERS.forEach((layer, i) => {
            const cfg = configs[i];
            const perimeter = 2 * (cfg.w + cfg.h);
            const stepLen = perimeter / layer.steps;
            const p1 = { x: -cfg.w/2, y: cfg.h/2 };
            const p2 = { x: cfg.w/2, y: cfg.h/2 };
            const p3 = { x: cfg.w/2, y: -cfg.h/2 };
            const p4 = { x: -cfg.w/2, y: -cfg.h/2 };
            const arr = [];

            for (let s=0; s<layer.steps; s++) {
                let dist = s * stepLen;
                let pos = {x:0, y:0};
                if (dist < cfg.w) { pos.x = p1.x + dist; pos.y = p1.y; }
                else if (dist < cfg.w + cfg.h) { pos.x = p2.x; pos.y = p2.y - (dist - cfg.w); }
                else if (dist < 2*cfg.w + cfg.h) { pos.x = p3.x - (dist - (cfg.w + cfg.h)); pos.y = p3.y; }
                else { pos.x = p4.x; pos.y = p4.y + (dist - (2*cfg.w + cfg.h)); }
                arr.push({x: cx + pos.x, y: cy + pos.y});
            }
            this.mapCoords.push(arr);
        });
    }

    render(model) {
        if (!model) return;

        const roundEl = document.getElementById('qy_round');
        if(roundEl) roundEl.innerText = model.round;

        const jackEl = document.getElementById('qy_jackpot');
        if(jackEl) jackEl.innerText = Math.floor(model.jackpot).toLocaleString();

        const currP = model.players[model.turnIndex];
        const nameEl = document.getElementById('qy_turn_player');
        if(nameEl) {
            nameEl.innerText = currP.name;
            nameEl.style.color = currP.id === 'player' ? '#ffd700' : '#4fc3f7';
        }

        const orderEl = document.getElementById('qy_action_order');
        if (orderEl) {
            const actionOrder = (model.turnIndex - model.roundStarter + 4) % 4 + 1;
            orderEl.innerText = `(行动顺序 ${actionOrder})`;
        }

        const chipEl = document.getElementById('qy_my_chips');
        if(chipEl) chipEl.innerText = model.players[0].chips;

        const pieceLayer = document.getElementById('qy_piece_layer');
        if(pieceLayer && this.mapCoords.length > 0) {
            pieceLayer.innerHTML = '';
            const piecesByLoc = {};
            model.pieces.forEach(p => {
                const key = `${p.layer}_${p.index}`;
                if (!piecesByLoc[key]) piecesByLoc[key] = [];
                piecesByLoc[key].push(p);
            });

            for (let key in piecesByLoc) {
                const stack = piecesByLoc[key];
                stack.forEach((p, visualIndex) => {
                    const coords = this.mapCoords[p.layer];
                    if (!coords) return;
                    const safeIndex = Math.min(p.index, coords.length - 1);
                    const pos = coords[safeIndex];

                    const el = document.createElement('div');
                    el.className = `qy_pawn ${p.color}`;
                    const offsetY = visualIndex * 14;

                    el.style.left = (pos.x - 16) + 'px';
                    el.style.top = (pos.y - 16 - offsetY) + 'px';
                    el.style.zIndex = 100 + visualIndex;
                    el.innerText = this._getColorName(p.color).charAt(0);
                    pieceLayer.appendChild(el);
                });
            }
        }

        this._renderStatsChart(model);

        const bottomPanel = document.getElementById('qy_bottom_panel');
        if (!bottomPanel) return;

        if (model.state === 'ready') {
            const config = model.config || {};
            if (!document.getElementById('btn_qy_start')) {
                bottomPanel.innerHTML = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(0,0,0,0.3);">
                        <div style="color:#b0bec5; font-size:18px; margin-bottom:15px; letter-spacing:1px;">
                            ${config.name || '比赛'} - 入场费: ${config.entry ? config.entry.toLocaleString() : 0} 文
                        </div>
                        <button id="btn_qy_start" class="qy_btn bet" style="width:240px; height:60px; font-size:22px; box-shadow:0 0 15px rgba(21, 101, 192, 0.5); display:flex; flex-direction:column; justify-content:center; align-items:center;">
                            <span>开始比赛</span>
                        </button>
                    </div>
                `;
            }
            return;
        }

        if (!document.getElementById('qy_pool_bets')) {
            bottomPanel.innerHTML = `
                <div class="qy_panel_l">
                    <div>
                        <div class="qy_row_label">🎟️ 每轮下注 (消耗1筹码)</div>
                        <div class="qy_card_row" id="qy_pool_bets"></div>
                    </div>
                    <div>
                        <div class="qy_row_label">🎲 掷骰移动 (消耗1筹码)</div>
                        <div class="qy_card_row" id="qy_pool_dice"></div>
                    </div>
                </div>
                <div class="qy_panel_m">
                    <div style="color:#ffca28; font-size:20px; font-weight:bold;">
                        🪙 筹码: <span id="qy_my_chips">0</span>
                    </div>
                    <div style="font-size:16px; color:#b0bec5; margin-top:15px;">📜 手牌 (终注/计谋)</div>
                    <div class="qy_hand" id="qy_my_hand"></div>
                </div>
                <div class="qy_panel_r">
                    <button class="qy_btn bet" id="btn_final_bet">🏆 最终押注<br><span style="font-size:12px; font-weight:normal">(需5筹码)</span></button>
                    <button class="qy_btn skip" id="btn_skip">⏩ 跳过回合</button>
                </div>
            `;
        }

        const isMyTurn = model.players[model.turnIndex].id === 'player';

        let aiMask = bottomPanel.querySelector('.qy_ai_mask');
        if (!isMyTurn) {
            if (!aiMask) {
                aiMask = document.createElement('div');
                aiMask.className = 'qy_ai_mask';
                aiMask.innerHTML = `🤖 ${currP.name} 行动中...`;
                bottomPanel.appendChild(aiMask);
            } else {
                aiMask.innerHTML = `🤖 ${currP.name} 行动中...`;
            }
        } else {
            if (aiMask) aiMask.remove();
        }

        this._renderCardPool('qy_pool_bets', model.roundBetDeck, 'bet');
        this._renderCardPool('qy_pool_dice', model.diceDeck, 'dice');

        const handDiv = document.getElementById('qy_my_hand');
        if(handDiv) {
            let html = '';
            model.players[0].finalCards.forEach(c => {
                html += `<div class="qy_card ${c}"><span style="margin-top:15px; font-weight:bold;">${this._getColorName(c)}</span></div>`;
            });
            const hasStrat = model.players[0].hasStrategy;
            html += `
                <div class="qy_card strategy ${!hasStrat ? 'disabled' : ''}" id="btn_strategy_card">
                    <div style="font-size:20px;">📜</div>
                    <div style="font-size:12px;">计谋</div>
                </div>`;
            handDiv.innerHTML = html;
        }

        const btnFinal = document.getElementById('btn_final_bet');
        const btnSkip = document.getElementById('btn_skip');
        if(btnFinal) btnFinal.disabled = !isMyTurn;
        if(btnSkip) btnSkip.disabled = !isMyTurn;
    }

    _renderStatsChart(model) {
        const chartDiv = document.getElementById('qy_stats_chart');
        if (!chartDiv || !model.gameHistory) return;

        let html = `<table class="qy_stats_table">
            <thead>
                <tr>
                    <th width="20%">轮</th>
                    <th width="30%">盈亏</th>
                    <th>特殊操作</th>
                </tr>
            </thead>
            <tbody>`;

        const history = model.gameHistory;

        for (let i = history.length - 1; i >= 0; i--) {
            const curr = history[i];

            let prevChips = 50;
            if (i > 0) {
                prevChips = history[i-1].chips;
            }

            const diff = curr.chips - prevChips;
            const sign = diff > 0 ? '+' : '';
            const color = diff > 0 ? '#ffca28' : (diff < 0 ? '#ef5350' : '#cfd8dc');
            const diffStr = diff === 0 ? '-' : `${sign}${diff}`;

            let eventsHtml = '';
            if (curr.events && curr.events.length > 0) {
                curr.events.forEach(ev => {
                    let className = 'qy_event_win';
                    if (ev.indexOf('倒数') !== -1) className = 'qy_event_lose';
                    eventsHtml += `<div class="qy_event_tag ${className}">${ev}</div> `;
                });
            } else {
                eventsHtml = '<span style="color:#546e7a">-</span>';
            }

            html += `
                <tr>
                    <td>${curr.round}</td>
                    <td style="color:${color}; font-weight:bold;">${diffStr}</td>
                    <td>${eventsHtml}</td>
                </tr>
            `;
        }

        html += `</tbody></table>`;
        chartDiv.innerHTML = html;
    }

    _renderCardPool(id, data, type) {
        const div = document.getElementById(id);
        if(!div) return;

        let html = '';
        if (type === 'bet') {
            let hasCards = false;
            for (let color in data) {
                const arr = data[color];
                if (arr && arr.length > 0) {
                    hasCards = true;
                    let shadow = '';
                    const count = Math.min(arr.length, 5);
                    for(let i=1; i<count; i++) {
                        shadow += `${i*2}px ${i*2}px 0 #1b262c, ${i*2+1}px ${i*2+1}px 0 #546e7a`;
                        if(i < count-1) shadow += ', ';
                    }
                    const style = shadow ? `box-shadow: ${shadow}; margin-right: ${count*2}px; margin-bottom: ${count*2}px;` : '';

                    html += `
                    <div class="qy_card ${color}" style="${style}" data-action="takeBet" data-color="${color}">
                        <div style="font-size:20px; margin-bottom:5px;">${this._getColorName(color)}</div>
                        <div style="font-weight:bold; font-size:16px;">x${arr[0]}</div>
                        <div style="position:absolute; top:-5px; right:-5px; background:#d32f2f; color:#fff; border-radius:50%; width:18px; height:18px; font-size:10px; display:flex; justify-content:center; align-items:center;">${arr.length}</div>
                    </div>`;
                }
            }
            if(!hasCards) html = '<div style="color:#666; padding:10px;">暂无下注卡</div>';
        } else {
            if (!data || data.length === 0) {
                html = '<div style="color:#666; padding:10px;">本轮结束</div>';
            } else {
                data.forEach(color => {
                    html += `
                    <div class="qy_card ${color}" data-action="roll" data-color="${color}">
                        <div style="font-size:24px;">🎲</div>
                        <div style="font-size:14px;">${this._getColorName(color)}</div>
                    </div>`;
                });
            }
        }
        div.innerHTML = html;
    }

    highlightValidCells(model, isValid) {
        const cells = document.querySelectorAll('.qy_cell');
        cells.forEach(el => {
            if (isValid) {
                const l = parseInt(el.dataset.layer);
                const i = parseInt(el.dataset.index);
                if (model.checkStrategyValid(l, i)) {
                    el.classList.add('valid-target');
                } else {
                    el.classList.remove('valid-target');
                }
            } else {
                el.classList.remove('valid-target');
            }
        });
    }

    _getColorName(c) {
        const map = { red:'赤', blue:'青', green:'翠', yellow:'金', white:'白' };
        return map[c] || c;
    }

    _getColorHex(c) {
        const map = { red:'#ef5350', blue:'#42a5f5', green:'#66bb6a', yellow:'#ffee58', white:'#eceff1' };
        return map[c] || '#fff';
    }
}
window.QingyunUI = QingyunUI;