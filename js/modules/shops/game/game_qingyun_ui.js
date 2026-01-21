// js/modules/games/game_qingyun_ui.js
// 青云赛 - 视图层 (View)
// 职责：DOM渲染、坐标映射(回字形计算)、动画效果

const qingyunUIStyles = `
<style id="game-qingyun-ui-styles">
    /* 基础布局 */
    .qy_container { width:100%; height:100%; background:#1b262c; display:flex; flex-direction:column; font-family:"KaiTi"; overflow:hidden; }
    
    /* 顶部 */
    .qy_top { height:60px; background:rgba(0,0,0,0.5); border-bottom:1px solid #37474f; display:flex; justify-content:space-between; align-items:center; padding:0 20px; color:#cfd8dc; z-index:10; }
    
    /* 核心棋盘 (自适应缩放) */
    .qy_stage { flex:1; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center; background: radial-gradient(#263238 20%, #102027 100%); }
    .qy_map_layer { position:absolute; width:100%; height:100%; }
    
    /* 赛道格子 */
    .qy_cell { 
        position: absolute; width: 40px; height: 40px; 
        border: 1px solid rgba(255,255,255,0.15); 
        display: flex; justify-content: center; align-items: center;
        font-size: 10px; color: rgba(255,255,255,0.3); border-radius: 4px;
    }
    .qy_cell.outer { border-color: #546e7a; background: rgba(84, 110, 122, 0.1); }
    .qy_cell.mid { border-color: #fdd835; background: rgba(253, 216, 53, 0.05); }
    .qy_cell.inner { border-color: #ff5722; background: rgba(255, 87, 34, 0.05); }
    .qy_cell.finish { border-color: #00e676; background: rgba(0, 230, 118, 0.1); box-shadow: 0 0 10px rgba(0,230,118,0.2); }

    /* 中央奖池 */
    .qy_center_pool {
        position: absolute; width: 140px; height: 80px;
        left: 50%; top: 50%; transform: translate(-50%, -50%);
        border: 2px solid #ffd700; background: rgba(255, 215, 0, 0.1);
        border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
    }
    .qy_pool_label { color: #ffecb3; font-size: 14px; margin-bottom: 5px; }
    .qy_pool_val { color: #ffd700; font-size: 24px; font-weight: bold; text-shadow: 0 0 5px #ff6f00; font-family: Arial; }

    /* 棋子 */
    .qy_pawn {
        position: absolute; width: 28px; height: 28px; border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.8); box-shadow: 2px 4px 5px rgba(0,0,0,0.5);
        display: flex; justify-content: center; align-items: center;
        font-size: 12px; font-weight: bold; color: #fff;
        transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        z-index: 10;
    }
    .qy_pawn.red { background: #d32f2f; }
    .qy_pawn.blue { background: #1976d2; }
    .qy_pawn.green { background: #388e3c; }
    .qy_pawn.yellow { background: #fbc02d; color: #3e2723; }
    .qy_pawn.white { background: #b0bec5; color: #3e2723; }

    /* 底部面板 */
    .qy_bottom { height: 240px; background: #212121; border-top: 2px solid #4e342e; display: flex; }
    
    /* 左侧：卡池 */
    .qy_panel_l { flex: 1; padding: 10px; border-right: 1px solid #424242; display:flex; flex-direction:column; gap:10px; }
    .qy_row_label { font-size: 12px; color: #90a4ae; margin-bottom: 4px; }
    .qy_card_row { display: flex; gap: 6px; }
    
    .qy_card {
        width: 36px; height: 48px; border-radius: 4px; border: 1px solid #666; cursor: pointer;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        font-size: 12px; background: #37474f; transition: transform 0.1s;
    }
    .qy_card:hover { transform: translateY(-3px); border-color: #fff; }
    .qy_card.red { border-color: #e57373; color: #e57373; }
    .qy_card.blue { border-color: #64b5f6; color: #64b5f6; }
    .qy_card.green { border-color: #81c784; color: #81c784; }
    .qy_card.yellow { border-color: #fff176; color: #fff176; }
    .qy_card.white { border-color: #e0e0e0; color: #fff; }
    
    /* 中间：手牌 */
    .qy_panel_m { flex: 1; padding: 10px; border-right: 1px solid #424242; text-align: center; }
    .qy_hand { display: flex; justify-content: center; gap: 5px; margin-top: 10px; }
    
    /* 右侧：操作 */
    .qy_panel_r { width: 120px; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
    .qy_btn { flex: 1; border: none; border-radius: 6px; cursor: pointer; color: #fff; font-weight: bold; font-family:"KaiTi"; font-size:16px; }
    .qy_btn.bet { background: #1565c0; }
    .qy_btn.skip { background: #616161; }
    .qy_btn:disabled { opacity: 0.5; cursor: not-allowed; }

</style>
`;

class QingyunUI {
    constructor(container) {
        this.container = container;
        this.mapCoords = []; // 缓存地图坐标
        this._injectStyles();
    }

    _injectStyles() {
        if (!document.getElementById('game-qingyun-ui-styles')) {
            document.head.insertAdjacentHTML('beforeend', qingyunUIStyles);
        }
    }

    init(model) {
        // 生成DOM结构
        this.container.innerHTML = `
            <div class="qy_container">
                <div class="qy_top">
                    <div>第 <span id="qy_round">1</span> 轮 | 行动: <span id="qy_turn_player">...</span></div>
                    <div style="color:#ef5350; font-weight:bold;">入场费已扣除</div>
                </div>
                
                <div class="qy_stage" id="qy_stage">
                    <div id="qy_map_layer" class="qy_map_layer"></div>
                    <div class="qy_center_pool">
                        <div class="qy_pool_label">🏆 本局大奖</div>
                        <div class="qy_pool_val" id="qy_jackpot">0</div>
                    </div>
                    <div id="qy_piece_layer" class="qy_map_layer" style="pointer-events:none;"></div>
                </div>

                <div class="qy_bottom">
                    <div class="qy_panel_l">
                        <div>
                            <div class="qy_row_label">每轮下注 (x5/x3/x2)</div>
                            <div class="qy_card_row" id="qy_pool_bets"></div>
                        </div>
                        <div>
                            <div class="qy_row_label">掷骰子 (推进比赛)</div>
                            <div class="qy_card_row" id="qy_pool_dice"></div>
                        </div>
                    </div>
                    <div class="qy_panel_m">
                        <div style="color:#ffca28; font-size:20px; font-weight:bold;">🪙 <span id="qy_my_chips">0</span></div>
                        <div style="font-size:12px; color:#aaa; margin-top:5px;">你的最终下注卡</div>
                        <div class="qy_hand" id="qy_my_hand"></div>
                    </div>
                    <div class="qy_panel_r">
                        <button class="qy_btn bet" id="btn_final_bet">最终押注</button>
                        <button class="qy_btn skip" id="btn_skip">跳过</button>
                    </div>
                </div>
            </div>
        `;

        // 计算并绘制地图
        this._generateMap(model);
    }

    // 核心：生成“回字形”坐标
    _generateMap(model) {
        const stage = document.getElementById('qy_stage');
        const mapLayer = document.getElementById('qy_map_layer');
        const cx = stage.clientWidth / 2;
        const cy = stage.clientHeight / 2;

        // 定义三层矩形的参数 (宽, 高)
        // 外圈最大，内圈最小
        const rects = [
            { w: 600, h: 400 }, // 外朝
            { w: 420, h: 280 }, // 中朝
            { w: 260, h: 160 }  // 内廷
        ];

        this.mapCoords = []; // 清空缓存

        model.LAYERS.forEach((layer, i) => {
            const rect = rects[i];
            const steps = layer.steps;
            const layerCoords = [];

            // 路径生成算法：从左下角开始，逆时针 (右 -> 上 -> 左 -> 下)
            // 简单处理：将矩形周长等分
            // 但为了整齐，我们手动分配每条边的格子数
            // 例如 外圈18格：长边5，短边4 => 5+4+5+4 = 18
            let sideH = Math.floor(steps / 4) + 1; // 长边格子数
            let sideV = Math.ceil(steps / 4);      // 短边格子数
            // 微调以匹配总数
            if ((sideH * 2 + sideV * 2) > steps) sideH--;

            // 起点：左下
            const startX = cx - rect.w / 2;
            const startY = cy + rect.h / 2;

            // 步进距离
            const stepX = rect.w / sideH;
            const stepY = rect.h / sideV;

            for (let s = 0; s < steps; s++) {
                let x, y;
                // 简单的矩形路径插值
                if (s < sideH) { // 下边 (向右)
                    x = startX + (s * stepX);
                    y = startY;
                } else if (s < sideH + sideV) { // 右边 (向上)
                    x = startX + (sideH * stepX);
                    y = startY - ((s - sideH) * stepY);
                } else if (s < sideH * 2 + sideV) { // 上边 (向左)
                    x = startX + (sideH * stepX) - ((s - (sideH + sideV)) * stepX);
                    y = startY - (sideV * stepY);
                } else { // 左边 (向下)
                    x = startX;
                    y = startY - (sideV * stepY) + ((s - (sideH * 2 + sideV)) * stepY);
                }

                layerCoords.push({x, y});

                // 绘制格子
                const cell = document.createElement('div');
                cell.className = `qy_cell ${layer.name}`;
                if (s === steps - 1) cell.classList.add('finish');
                cell.style.left = (x - 20) + 'px'; // -20 是为了居中 (格子宽40)
                cell.style.top = (y - 20) + 'px';
                cell.innerText = s;
                mapLayer.appendChild(cell);
            }
            this.mapCoords.push(layerCoords);
        });
    }

    // 渲染棋子与UI更新
    render(model) {
        // 更新文本信息
        document.getElementById('qy_round').innerText = model.round;
        document.getElementById('qy_jackpot').innerText = Math.floor(model.jackpot);
        const currP = model.players[model.turnIndex];
        document.getElementById('qy_turn_player').innerText = currP.name;
        document.getElementById('qy_my_chips').innerText = model.players[0].chips;

        // 渲染棋子
        const pieceLayer = document.getElementById('qy_piece_layer');
        pieceLayer.innerHTML = '';

        model.pieces.forEach(p => {
            const coords = this.mapCoords[p.layer];
            if (!coords) return;
            // 防止越界
            const safeIndex = Math.min(p.index, coords.length - 1);
            const pos = coords[safeIndex];

            const el = document.createElement('div');
            el.className = `qy_pawn ${p.color}`;
            // 堆叠偏移：stackPos 越高，y 越往上 (visually)
            const offsetY = p.stackPos * 10;

            el.style.left = (pos.x - 14) + 'px'; // 居中 28/2
            el.style.top = (pos.y - 14 - offsetY) + 'px';
            el.style.zIndex = 100 + p.stackPos;
            el.innerText = this._getColorName(p.color);
            pieceLayer.appendChild(el);
        });

        // 渲染下注池
        this._renderCardPool('qy_pool_bets', model.roundBetDeck, 'bet');
        this._renderCardPool('qy_pool_dice', model.diceDeck, 'dice');

        // 渲染手牌
        const handDiv = document.getElementById('qy_my_hand');
        handDiv.innerHTML = model.players[0].finalCards.map(c =>
            `<div class="qy_card ${c}">${this._getColorName(c)}</div>`
        ).join('');
    }

    _renderCardPool(id, data, type) {
        const div = document.getElementById(id);
        div.innerHTML = '';

        if (type === 'bet') {
            // data is object { red: [5,3], blue: [] }
            for (let color in data) {
                const arr = data[color];
                if (arr && arr.length > 0) {
                    div.innerHTML += `<div class="qy_card ${color}" data-action="takeBet" data-color="${color}">
                        <div>${this._getColorName(color)}</div><div>x${arr[0]}</div>
                    </div>`;
                }
            }
        } else {
            // dice deck is array ['red', 'blue']
            data.forEach(color => {
                div.innerHTML += `<div class="qy_card ${color}" data-action="roll" data-color="${color}">
                    <div>🎲</div><div>${this._getColorName(color)}</div>
                </div>`;
            });
        }
    }

    _getColorName(c) {
        const map = { red:'赤', blue:'青', green:'翠', yellow:'金', white:'白' };
        return map[c] || c;
    }
}

window.QingyunUI = QingyunUI;