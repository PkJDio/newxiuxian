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

    /* --- 计谋令牌基础样式 --- */
.qy_strategy_token { 
    position: absolute; width: 28px; height: 28px; border-radius: 4px; 
    display: flex; justify-content: center; align-items: center; 
    font-size: 16px; font-weight: 900; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.8); z-index: 60; 
    pointer-events: none; border: 2px solid rgba(255,255,255,0.5);
}

/* 阳谋/阴谋的文字颜色区别 */
.qy_strategy_token.yang { color: #b71c1c; text-shadow: 0 0 2px #fff; } /* 深红色文字 */
.qy_strategy_token.yin { color: #0d47a1; text-shadow: 0 0 2px #fff; }  /* 深蓝色文字 */

/* 归属底色区分 (分子/所有者占比逻辑相关) */
.qy_strategy_token.owner_player { background: #ffca28; border-color: #ff8f00; box-shadow: 0 0 10px #ffca28; } /* 玩家：金色 */
.qy_strategy_token.owner_ai1 { background: #29b6f6; border-color: #0288d1; } /* AI 1: 天蓝色 */
.qy_strategy_token.owner_ai2 { background: #66bb6a; border-color: #388e3c; } /* AI 2: 翠绿色 */
.qy_strategy_token.owner_ai3 { background: #ec407a; border-color: #c2185b; } /* AI 3: 玫红色 */

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
    
    /* 【新增】厂卫样式 */
    .qy_pawn.west_factory { background: linear-gradient(135deg, #212121, #424242); border: 2px solid #ffd700; color: #ffd700; box-shadow: 0 0 10px #ffd700; }
    .qy_pawn.east_factory { background: linear-gradient(135deg, #4a148c, #7b1fa2); border: 2px solid #e1bee7; color: #fff; box-shadow: 0 0 10px #e1bee7; }
    
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
                    
                    <div id="qy_piece_layer" class="qy_track_layer" style="z-index:50; pointer-events:none;"></div>
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
            <div style="text-align:left; font-size:15px; line-height:1.5; color:#3c3f41; padding:10px; font-family:'KaiTi'; height: 500px; overflow-y: auto;">
                <ul style="list-style-type: none; padding-left: 5px; margin:0;">
                    
                    <li style="margin-bottom:12px;">
                        <div style="font-size:18px; font-weight:bold; color:#3e2723; border-bottom:1px solid #d7ccc8; margin-bottom:6px;">一、入场与机制</div>
                        ● <b>分级</b>：低级(>5k) / 中级(>3w) / 高级(>5w)。<br>
                        ● <b>初始</b>：扣除入场费入池。每人发 <b style="color:#d84315">50筹码</b> (汇率随场次提升)。<br>
                        ● <b>流程</b>：每轮轮流先手。当 <b style="color:#2e7d32">5张骰子卡</b> 被拿完时，一轮结束结算。
                    </li>
                    
                    <li style="margin-bottom:12px;">
                        <div style="font-size:18px; font-weight:bold; color:#3e2723; border-bottom:1px solid #d7ccc8; margin-bottom:6px;">二、回合行动</div>
                        <span style="color:#757575; font-size:12px;">(每次行动消耗筹码注入奖池，跳过也会消耗1筹码)</span><br>
                        
                        1. <span style="color:#ef5350; font-weight:bold;">【拿牌下注】</span> <span style="font-size:12px; border:1px solid #ef5350; padding:0 2px; border-radius:3px;">耗1筹</span><br>
                           拿取一张下注卡(x6 / x4 / x3)。结算时第一名得倍数奖励。<br>
                        
                        2. <span style="color:#42a5f5; font-weight:bold;">【掷骰移动】</span> <span style="font-size:12px; border:1px solid #42a5f5; padding:0 2px; border-radius:3px;">耗1筹</span><br>
                           拿取骰子卡并移动对应颜色棋子。<br>
                           🎲 <b>德(3)/才(2)/功(1)</b>：前进对应步数。<br>
                           🎲 <b>脏</b>：原地不动。<br>
                           🎲 <b>升</b>：晋升里道 (外→中→内)。<span style="color:#d84315">注意：内道投出升=原地不动。</span><br>
                           🎲 <b>降</b>：跌落外道 (内→中→外)。外道投出降=原地不动。<br>
                           <span style="color:#5d4037; font-size:12px;">* 晋升路线：外18 → 中17 → 内16 → 终点。</span><br>
                        
                        3. <span style="color:#9c27b0; font-weight:bold;">【放置计谋】</span> <span style="font-size:12px; border:1px solid #9c27b0; padding:0 2px; border-radius:3px;">耗2筹</span><br>
                           在空地放置陷阱 (不可放厂卫脚下，不可相邻)。<br>
                           &nbsp;&nbsp;🔥 <b>阳谋</b>：踩中者 <b>继续向前</b> 1步。<br>
                           &nbsp;&nbsp;💧 <b>阴谋</b>：踩中者 <b>被迫后退</b> 1步。<br>
                           &nbsp;&nbsp;💰 <b>收益</b>：任何单位踩中，放置者得 <b style="color:#d84315">4筹码</b>。<br>
                        
                        4. <span style="color:#f57f17; font-weight:bold;">【最终押注】</span> <span style="font-size:12px; border:1px solid #f57f17; padding:0 2px; border-radius:3px;">耗5筹</span><br>
                           押注 <b>冠军</b> 或 <b>倒数第一</b>。每种限1次，颜色不可复用。
                    </li>

                    <li style="margin-bottom:12px;">
                        <div style="font-size:18px; font-weight:bold; color:#3e2723; border-bottom:1px solid #d7ccc8; margin-bottom:6px;">三、每轮结算</div>
                        ● <b>排名规则</b>：<br>
                        &nbsp;&nbsp;1. 优先看进度 (位置/赛道总长)。<br>
                        &nbsp;&nbsp;2. 同位置看堆叠：<b style="color:#d84315">上面的 > 下面的</b>。<br>
                        ● <b>奖励分配</b>：<br>
                        &nbsp;&nbsp; - <b>下注卡</b>：颜色第一名得面值筹码，第二名得1筹码。<br>
                        &nbsp;&nbsp; - <b>骰子卡</b>：手中每张得 <b style="color:#2e7d32">2筹码</b>。
                    </li>

                    <li style="margin-bottom:12px;">
                        <div style="font-size:18px; font-weight:bold; color:#3e2723; border-bottom:1px solid #d7ccc8; margin-bottom:6px;">四、中高级场专属：厂卫</div>
                        ● <b style="color:#7b1fa2">东厂</b>(内16) 与 <b style="color:#212121">西厂</b>(外18) 加入战局。<br>
                        ● <b>反向巡逻</b>：它们从终点往起点(数字小)的方向移动。<br>
                        ● <b>携带机制</b>：移动时会 <b>带走压在它们身上</b> 的所有棋子。<br>
                        ● <b>特殊规则</b>：<br>
                        &nbsp;&nbsp; - 只有厂卫能穿越起点(1)回到上一层终点。<br>
                        &nbsp;&nbsp; - 普通棋子若被带回起点(1)，会被“甩下”留在该层，不会跟随跨层。<br>
                        &nbsp;&nbsp; - 厂卫踩中阳谋=继续变小(顺行)，踩中阴谋=变大(逆行)。
                    </li>

                    <li style="margin-bottom:5px;">
                        <div style="font-size:18px; font-weight:bold; color:#3e2723; border-bottom:1px solid #d7ccc8; margin-bottom:6px;">五、终局清算</div>
                        1. <b>最终押注奖</b>：前4名猜对者分别得 <b style="color:#d84315">40 / 25 / 5 / 0</b> 筹码。<br>
                        2. <b>瓜分奖池</b>：按 <b style="color:#f57f17">最终持有筹码比例</b> 瓜分奖池现金。
                    </li>
                </ul>
            </div>
        `;
        // 适当增加了高度以容纳更多规则
        window.showGeneralModal("📜 青云赛详细规则", rulesHtml, null, "", 60);
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
                cell.innerText = idx + 1;

                cell.dataset.layer = i;
                cell.dataset.index = idx;

                cell.onclick = () => {
                    if (this.onCellClick) this.onCellClick(i, idx);
                };

                const key = `${i}_${idx}`;
                const trap = model.strategyMap[key];

                // 【修改点】动态生成带有归属和类型标记的令牌
                if (trap) {
                    const token = document.createElement('div');

                    // 将 ownerId (如 'player', 'ai_1') 转换为类名 (如 'owner_player', 'owner_ai1')
                    const ownerSuffix = trap.ownerId.replace('_', '');
                    const typeClass = trap.type === 1 ? 'yang' : 'yin';

                    token.className = `qy_strategy_token owner_${ownerSuffix} ${typeClass}`;
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

        // --- 棋子渲染逻辑 (含获胜居中 & 厂卫) ---
        const pieceLayer = document.getElementById('qy_piece_layer');
        const stage = document.getElementById('qy_stage');

        if(pieceLayer && stage && this.mapCoords.length > 0) {
            pieceLayer.innerHTML = '';

            const centerX = stage.clientWidth / 2;
            const centerY = stage.clientHeight / 2;

            const piecesByLoc = {};

            // 1. 普通棋子
            model.pieces.forEach(p => {
                const key = p.isFinished ? 'finished' : `${p.layer}_${p.index}`;
                if (!piecesByLoc[key]) piecesByLoc[key] = [];
                piecesByLoc[key].push(p);
            });

            // 2. 【新增】厂卫 (视为特殊的棋子，参与同位置堆叠)
            if (model.factories && model.factories.length > 0) {
                model.factories.forEach(f => {
                    const key = `${f.layer}_${f.index}`;
                    if (!piecesByLoc[key]) piecesByLoc[key] = [];
                    // 【修复点】这里必须要把 f.layer 和 f.index 也传进去，否则下面计算坐标时会读不到
                    piecesByLoc[key].unshift({
                        color: f.color,
                        isFactory: true,
                        name: f.name,
                        layer: f.layer,
                        index: f.index
                    });
                });
            }

            // 遍历每个位置的堆叠列表
            for (let key in piecesByLoc) {
                const stack = piecesByLoc[key];

                // 【核心修改】只按 stackPos 排序，移除 "isFactory 沉底" 逻辑
                stack.sort((a, b) => (a.stackPos || 0) - (b.stackPos || 0));

                // 排序后进行渲染，保证 visually correct
                stack.forEach((p, visualIndex) => {
                    let left, top;

                    if (p.isFinished) {
                        left = centerX;
                        top = centerY;
                    } else {
                        const layerIdx = p.isFactory ? p.layer : p.layer;
                        const idx = p.isFactory ? p.index : p.index;

                        const coords = this.mapCoords[layerIdx];
                        if (!coords) return;

                        const safeIndex = Math.min(idx, coords.length - 1);
                        const pos = coords[safeIndex];
                        left = pos.x;
                        top = pos.y;
                    }

                    const el = document.createElement('div');
                    el.className = `qy_pawn ${p.color}`;
                    if (p.isFinished) el.classList.add('finished');

                    // visualIndex 现在对应排序后的位置：0在底，N在上
                    const offsetY = visualIndex * 14;

                    el.style.left = (left - 16) + 'px';
                    el.style.top = (top - 16 - offsetY) + 'px';
                    // zIndex 也随 visualIndex 增加，保证点击和遮挡关系正确
                    el.style.zIndex = p.isFinished ? 200 + visualIndex : 100 + visualIndex;

                    if (p.isFactory) {
                        el.innerText = p.name.charAt(0);
                        el.style.borderRadius = "4px";
                    } else {
                        el.innerText = this._getColorName(p.color).charAt(0);
                    }

                    // 标记ID
                    el.dataset.uid = p.isFactory ? p.color : p.color;

                    pieceLayer.appendChild(el);
                });
            }
        }

        this._renderStatsChart(model);

        const bottomPanel = document.getElementById('qy_bottom_panel');
        if (!bottomPanel) return;

        // ... (剩余的底部栏渲染代码保持不变) ...
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
                        🎟️ 筹码: <span id="qy_my_chips">0</span>
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
                aiMask.innerHTML = `🤖 ${model.players[model.turnIndex].name} 行动中...`;
                bottomPanel.appendChild(aiMask);
            } else {
                aiMask.innerHTML = `🤖 ${model.players[model.turnIndex].name} 行动中...`;
            }
        } else {
            if (aiMask) aiMask.remove();
        }

        this._renderCardPool('qy_pool_bets', model.roundBetDeck, 'bet');
        this._renderCardPool('qy_pool_dice', model, 'dice');

        const handDiv = document.getElementById('qy_my_hand');
        if(handDiv) {
            let html = '';
            model.players[0].finalCards.forEach(c => {
                html += `<div class="qy_card ${c}"><span style="margin-top:15px; font-weight:bold;">${this._getColorName(c)}</span></div>`;
            });
            const hasStrat = model.players[0].hasStrategy;
            html += `<div class="qy_card strategy ${!hasStrat ? 'disabled' : ''}" id="btn_strategy_card"><div style="font-size:20px;">📜</div><div style="font-size:12px;">计谋</div></div>`;
            handDiv.innerHTML = html;
        }

        const btnFinal = document.getElementById('btn_final_bet');
        const btnSkip = document.getElementById('btn_skip');
        if(btnFinal) btnFinal.disabled = !isMyTurn;
        if(btnSkip) btnSkip.disabled = !isMyTurn;
    }

    // 【修改点】接收 finalReportHtml 参数
    setEndGameState(finalReportHtml) {
        const bottomPanel = document.getElementById('qy_bottom_panel');
        if (!bottomPanel) return;

        // 移除 AI 遮罩 (如果有)
        const mask = bottomPanel.querySelector('.qy_ai_mask');
        if(mask) mask.remove();

        // 禁用所有交互元素
        const buttons = bottomPanel.querySelectorAll('button, .qy_card');
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.filter = 'grayscale(1)';
            btn.style.opacity = '0.5';
        });

        // 在右下角插入“最终战报”和“返回大厅”按钮
        const rightPanel = bottomPanel.querySelector('.qy_panel_r');
        if (rightPanel) {
            // 使用 flex column 布局，添加两个按钮
            rightPanel.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px; height:100%; justify-content:center;">
                    <button class="qy_btn" id="btn_review_report" style="flex:1; font-size:16px; background:linear-gradient(to bottom, #7b1fa2, #4a148c); border:1px solid #8e24aa; pointer-events:auto; filter:none; opacity:1; box-shadow:0 2px 5px rgba(0,0,0,0.5);">
                        📜 最终战报
                    </button>
                    <button class="qy_btn bet" onclick="GambleShop.selectGame('qingyun')" style="flex:1; font-size:16px; background:linear-gradient(to bottom, #d84315, #bf360c); pointer-events:auto; filter:none; opacity:1; box-shadow:0 2px 5px rgba(0,0,0,0.5);">
                        🚪 返回大厅
                    </button>
                </div>
            `;

            // 绑定回顾按钮事件
            setTimeout(() => {
                const btnReview = document.getElementById('btn_review_report');
                if(btnReview) {
                    btnReview.onclick = () => {
                        if(window.UtilsModal && window.UtilsModal.showQingyunNotice) {
                            UtilsModal.showQingyunNotice("🏁 最终战报 (回顾) 🏁", finalReportHtml, () => {});
                        }
                    };
                }
            }, 0);
        }
    }

    // 【修改点3】支持厂卫的动画查找
    async animatePieceMove(color, path) {
        // color 参数可能是 'red' 也可能是 'west_factory'
        const pieceEl = document.querySelector(`.qy_pawn.${color}`);
        if (!pieceEl) return;

        pieceEl.classList.add('animating');

        for (let step of path) {
            let targetX, targetY;

            if (step.index === 'finish') {
                const stage = document.getElementById('qy_stage');
                targetX = stage.clientWidth / 2;
                targetY = stage.clientHeight / 2;
            } else {
                const coords = this.mapCoords[step.layer];
                if (!coords || !coords[step.index]) continue;
                targetX = coords[step.index].x;
                targetY = coords[step.index].y;
            }

            const currentTop = parseInt(pieceEl.style.top);
            const currentLeft = parseInt(pieceEl.style.left);

            pieceEl.style.left = (targetX - 16) + 'px';
            pieceEl.style.top = (targetY - 16) + 'px';
            pieceEl.style.zIndex = 300;

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        pieceEl.classList.remove('animating');
    }

    // 【修改点】战绩统计 (支持实时显示)
    _renderStatsChart(model) {
        const chartDiv = document.getElementById('qy_stats_chart');
        if (!chartDiv || !model.gameHistory) return;

        let html = `<table class="qy_stats_table">
            <thead><tr><th width="20%">轮</th><th width="30%">盈亏</th><th>特殊操作</th></tr></thead>
            <tbody>`;

        // 1. 如果有本轮待处理事件，优先显示在第一行
        if (model.currentRoundEvents && model.currentRoundEvents.length > 0) {
            let eventsHtml = '';
            model.currentRoundEvents.forEach(ev => {
                let className = 'qy_event_win';
                if (ev.indexOf('倒数') !== -1) className = 'qy_event_lose';
                eventsHtml += `<div class="qy_event_tag ${className}">${ev}</div> `;
            });
            html += `
                <tr style="background:rgba(255,255,255,0.05);">
                    <td style="color:#4fc3f7;">本轮</td>
                    <td style="color:#90a4ae;">...</td>
                    <td>${eventsHtml}</td>
                </tr>
            `;
        }

        // 2. 历史记录 (倒序)
        const history = model.gameHistory;
        for (let i = history.length - 1; i >= 1; i--) {
            const curr = history[i];
            const prev = history[i-1];
            const diff = curr.chips - prev.chips;
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

            html += `<tr><td>${curr.round}</td><td style="color:${color}; font-weight:bold;">${diffStr}</td><td>${eventsHtml}</td></tr>`;
        }

        html += `</tbody></table>`;
        chartDiv.innerHTML = html;
    }

    _renderCardPool(id, data, type) {
        const div = document.getElementById(id);
        if(!div) return;

        let html = '';
        if (type === 'bet') {
            // data 是 roundBetDeck
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
            // 【修改点】 骰子区渲染
            // 此时 data 实际上是 model (因为在 render 里改了传参)
            const model = data;
            const deck = model.diceDeck || [];
            const history = model.drawnDiceRecords || [];

            // 容器样式调整，让它们横向排列
            div.style.justifyContent = 'flex-start';

            if (deck.length === 0 && history.length === 0) {
                html = '<div style="color:#666; padding:10px;">本轮结束</div>';
            } else {
                // 1. 渲染随机按钮 (如果还有牌)
                if (deck.length > 0) {
                    const count = deck.length;
                    let shadow = '';
                    const visualStack = Math.min(count, 5);
                    for(let i=1; i<visualStack; i++) {
                        shadow += `${i*2}px ${i*2}px 0 #1b262c, ${i*2+1}px ${i*2+1}px 0 #546e7a`;
                        if(i < visualStack-1) shadow += ', ';
                    }
                    const style = shadow ? `box-shadow: ${shadow}; margin-right: ${visualStack*2}px; margin-bottom: ${visualStack*2}px;` : '';

                    html += `
                    <div class="qy_card white" style="${style}; background: linear-gradient(135deg, #455a64, #263238); border-color:#90a4ae; min-width:55px;" data-action="rollRandom">
                        <div style="font-size:24px;">❓</div>
                        <div style="font-size:13px; color:#cfd8dc;">随机掷骰</div>
                        <div style="position:absolute; top:-5px; right:-5px; background:#fbc02d; color:#000; border-radius:50%; width:18px; height:18px; font-size:10px; display:flex; justify-content:center; align-items:center; font-weight:bold;">${count}</div>
                    </div>`;
                }

                // 2. 渲染已抽出的历史记录 (渲染在右侧)
                if (history.length > 0) {
                    // 加一个分隔或者直接接在后面
                    history.forEach(rec => {
                        html += `
                        <div class="qy_card ${rec.color}" style="opacity:0.9; cursor:default; transform:none; border-style:dashed; background:rgba(0,0,0,0.2);">
                            <div style="font-size:18px; font-weight:bold;">${rec.result}</div>
                            <div style="font-size:12px; margin-top:2px;">${this._getColorName(rec.color)}</div>
                        </div>`;
                    });
                }
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

    _getColorName(c) { return { red:'赤', blue:'青', green:'翠', yellow:'金', white:'白', west_factory:'西', east_factory:'东' }[c] || c; }
    _getColorHex(c) { return { red:'#ef5350', blue:'#42a5f5', green:'#66bb6a', yellow:'#ffee58', white:'#eceff1' }[c] || '#fff'; }
}
window.QingyunUI = QingyunUI;