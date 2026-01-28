// js/modules/games/game_shengguantu.js
// 升官图 (Complex Version) - v2.0
// 特性：可拖拽大地图、SVG连线、文武分科、浮动UI

console.log("加载 升官图模块 v2.0 (复杂版)");

// ================= 样式定义 =================
const shengguanStyles = `
<style id="game-shengguantu-styles">
    /* 基础容器 */
    .sg_layout {
        position: relative; width: 100%; height: 100%; 
        background: #2d1e1b; overflow: hidden; 
        font-family: "KaiTi", serif; user-select: none;
    }

    /* --- 可拖拽地图区域 --- */
    .sg_map_viewport {
        width: 100%; height: 100%; 
        cursor: grab; overflow: hidden; position: relative;
        background-color: #e0d0b0;
        background-image: 
            linear-gradient(rgba(93, 64, 55, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(93, 64, 55, 0.1) 1px, transparent 1px);
        background-size: 40px 40px;
    }
    .sg_map_viewport:active { cursor: grabbing; }
    
    .sg_map_content {
        position: absolute; top: 0; left: 0;
        /* 地图实际尺寸，足够大以容纳官职图 */
        width: 1200px; height: 1000px; 
        transform-origin: 0 0;
        transition: transform 0.1s linear; /* 拖拽时的平滑度 */
    }

    /* 连线层 (SVG) */
    .sg_lines_svg {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;
    }
    .sg_line { stroke: #a1887f; stroke-width: 2; fill: none; stroke-dasharray: 5,5; opacity: 0.6; }

    /* 官职节点 */
    .sg_node {
        position: absolute; width: 80px; height: 80px; 
        background: #fff8e1; border: 2px solid #5d4037; border-radius: 8px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 2; box-shadow: 2px 4px 8px rgba(0,0,0,0.2);
        font-size: 16px; color: #3e2723; font-weight: bold;
        transition: transform 0.3s, box-shadow 0.3s;
    }
    .sg_node.start { border-color: #2e7d32; background: #e8f5e9; border-radius: 50%; }
    .sg_node.high { border-color: #ffd700; background: #fffde7; box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
    .sg_node_rank { font-size: 12px; color: #8d6e63; font-weight: normal; margin-top: 2px; }
    
    /* 棋子 */
    .sg_piece {
        position: absolute; width: 32px; height: 32px; border-radius: 50%;
        display: flex; justify-content: center; align-items: center;
        font-size: 14px; font-weight: bold; color: #fff;
        border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        z-index: 10; transition: top 0.5s ease-in-out, left 0.5s ease-in-out;
    }
    .sg_piece.p { background: #d84315; transform: translate(-10px, -10px); } /* 玩家偏移 */
    .sg_piece.e { background: #455a64; transform: translate(10px, 10px); }   /* 对手偏移 */

    /* --- 浮动 UI 层 --- */
    .sg_hud_top {
        position: absolute; top: 10px; left: 10px; right: 10px;
        background: rgba(45, 30, 27, 0.9); border: 2px solid #8d6e63; border-radius: 8px;
        padding: 8px 15px; z-index: 100;
        display: flex; justify-content: space-between; align-items: center;
        color: #fff8e1; box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .sg_hud_info { display: flex; gap: 20px; align-items: center; }
    .sg_hud_vs { font-size: 18px; font-weight: bold; color: #ffcc80; }
    
    .sg_hud_bottom {
        position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
        z-index: 100; display: flex; gap: 20px; align-items: flex-end;
    }

    /* 陀螺控制 */
    .sg_spinner_btn {
        width: 100px; height: 100px; border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #ffcc80, #ef6c00);
        border: 4px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        cursor: pointer; display: flex; justify-content: center; align-items: center;
        font-size: 36px; font-weight: bold; color: #fff; text-shadow: 0 2px 2px #bf360c;
        transition: transform 0.1s; position: relative;
    }
    .sg_spinner_btn:active { transform: translateX(-50%) scale(0.95); }
    .sg_spinner_btn.disabled { filter: grayscale(1); cursor: not-allowed; }
    
    .sg_cheat_btn {
        width: 60px; height: 60px; border-radius: 50%;
        background: #5e35b1; border: 2px solid #b39ddb;
        color: #fff; font-size: 14px; font-weight: bold;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    }
    .sg_cheat_btn:hover { transform: scale(1.1); }
    .sg_cheat_btn.disabled { opacity: 0.5; cursor: not-allowed; }

    /* 结果展示浮层 */
    .sg_toast {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8); color: #fff; padding: 20px 40px; border-radius: 12px;
        font-size: 32px; font-weight: bold; pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 200;
        border: 2px solid #ffcc80; text-align: center;
    }
    .sg_toast.show { opacity: 1; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes popIn { from { transform: translate(-50%, -50%) scale(0.5); } to { transform: translate(-50%, -50%) scale(1); } }

    /* 旋转动画 */
    .spinning_anim { animation: spin 0.1s linear infinite; }
    @keyframes spin { 100% { transform: translateX(-50%) rotate(360deg); } } /* 注意保持 translateX */

</style>
`;

if (!document.getElementById('game-shengguantu-styles')) {
    document.head.insertAdjacentHTML('beforeend', shengguanStyles);
}

class ShengGuanTuGame {
    constructor(opponent, uiParent) {
        this.opponent = opponent;
        this.ui = uiParent;

        // 游戏配置
        this.maxRounds = 8; // 8轮定胜负
        this.round = 1;
        this.state = 'idle'; // idle, spinning, moving
        this.skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;

        // 玩家位置 (节点ID)
        this.pNode = 0; // 0 = 白丁
        this.eNode = 0;

        // 地图数据定义 (简化版复杂地图)
        // 结构: id, name, rank(分数), x, y, moves: {德, 才, 功, 脏}
        this.mapData = [
            /* 0: 起点 */
            { id: 0, name: "白丁", rank: 0, x: 100, y: 800, moves: { '德': 3, '才': 1, '功': 0, '脏': 0 } },
            /* 1: 文路初阶 */
            { id: 1, name: "童生", rank: 1, x: 250, y: 800, moves: { '德': 3, '才': 2, '功': 1, '脏': 0 } },
            /* 2: 文路中阶 */
            { id: 2, name: "秀才", rank: 2, x: 400, y: 800, moves: { '德': 4, '才': 3, '功': 1, '脏': 1 } },
            /* 3: 举人 (分岔点) */
            { id: 3, name: "举人", rank: 3, x: 550, y: 700, moves: { '德': 6, '才': 4, '功': 2, '脏': 1 } },
            /* 4: 县丞 (地方官) */
            { id: 4, name: "县丞", rank: 4, x: 700, y: 800, moves: { '德': 7, '才': 5, '功': 3, '脏': 2 } },
            /* 5: 知县 (七品) */
            { id: 5, name: "知县", rank: 5, x: 850, y: 750, moves: { '德': 8, '才': 6, '功': 4, '脏': 3 } },
            /* 6: 翰林 (京官快车道) */
            { id: 6, name: "翰林", rank: 6, x: 550, y: 550, moves: { '德': 9, '才': 7, '功': 3, '脏': 2 } },
            /* 7: 知府 (四品) */
            { id: 7, name: "知府", rank: 7, x: 850, y: 600, moves: { '德': 10, '才': 8, '功': 5, '脏': 4 } },
            /* 8: 巡抚 (二品) */
            { id: 8, name: "巡抚", rank: 8, x: 1000, y: 500, moves: { '德': 11, '才': 9, '功': 7, '脏': 5 } },
            /* 9: 侍郎 (三品) */
            { id: 9, name: "侍郎", rank: 8, x: 700, y: 450, moves: { '德': 11, '才': 10, '功': 7, '脏': 6 } },
            /* 10: 尚书 (二品) */
            { id: 10, name: "尚书", rank: 9, x: 850, y: 350, moves: { '德': 12, '才': 11, '功': 9, '脏': 7 } },
            /* 11: 大学士 (一品) */
            { id: 11, name: "大学士", rank: 10, x: 600, y: 300, moves: { '德': 13, '才': 12, '功': 10, '脏': 9 } },
            /* 12: 太保 */
            { id: 12, name: "太保", rank: 11, x: 400, y: 250, moves: { '德': 14, '才': 13, '功': 11, '脏': 10 } },
            /* 13: 太傅 */
            { id: 13, name: "太傅", rank: 12, x: 250, y: 200, moves: { '德': 14, '才': 13, '功': 12, '脏': 11 } },
            /* 14: 太师 (极品) - 终点 */
            { id: 14, name: "太师", rank: 15, x: 100, y: 150, moves: { '德': 14, '才': 14, '功': 14, '脏': 13 } },
        ];

        // 拖拽相关
        this.dragState = { isDown: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 };

        this.init();
    }

    init() {
        // 先渲染基本 HTML 结构
        this.renderStructure();
        // 绑定拖拽事件
        this.bindDragEvents();
        // 绘制连线
        this.drawLines();
        // 初始化棋子位置
        this.updatePieces(false);
    }

    renderStructure() {
        // 生成节点 HTML
        const nodesHtml = this.mapData.map(n => {
            let cls = 'sg_node';
            if (n.id === 0) cls += ' start';
            if (n.id === 14) cls += ' high';
            return `<div class="${cls}" style="left:${n.x}px; top:${n.y}px;">
                <div>${n.name}</div>
                <div class="sg_node_rank">品阶:${n.rank}</div>
            </div>`;
        }).join('');

        const B = this.opponent.bet || 0;
        const eMoney = (this.opponent.currentMoney || 0).toLocaleString();

        const html = `
        <div class="sg_layout">
            <div class="sg_hud_top">
                <div class="sg_hud_info">
                    <button class="ink_btn_small" onclick="GambleShop.selectGame('shengguantu')">⬅ 退出</button>
                    <div style="font-weight:bold;">${this.opponent.name}</div>
                    <div style="font-size:14px; color:#aaa;">持有: ${eMoney}</div>
                    ${this._getSuspicionUI()}
                </div>
                <div class="sg_hud_vs">轮次: <span id="sg_round_val">${this.round}</span> / ${this.maxRounds}</div>
                <div class="sg_hud_info">
                    <div style="text-align:right;">
                        <div style="font-weight:bold;">你</div>
                        <div style="font-size:14px; color:#ffb74d;">押注: ${B}</div>
                    </div>
                </div>
            </div>

            <div class="sg_map_viewport" id="sg_viewport">
                <div class="sg_map_content" id="sg_content">
                    <svg class="sg_lines_svg" id="sg_lines"></svg>
                    ${nodesHtml}
                    <div class="sg_piece p" id="sg_piece_p">我</div>
                    <div class="sg_piece e" id="sg_piece_e">敌</div>
                </div>
            </div>

            <div class="sg_hud_bottom">
                <div class="sg_cheat_btn" onclick="GambleShop.currentGame.cheat()" title="暗度陈仓 (增加警戒)">
                    <span>✋</span><span>出千</span>
                </div>
                <div class="sg_spinner_btn" id="sg_spin_btn" onclick="GambleShop.currentGame.spin()">
                    <span id="sg_spin_text">转</span>
                </div>
                <div class="sg_cheat_btn disabled">
                    <span>💬</span><span>闲聊</span>
                </div>
            </div>

            <div class="sg_toast" id="sg_toast">德！连升两级！</div>
        </div>`;

        this.ui.updateContent(html);
    }

    // --- 拖拽逻辑 ---
    bindDragEvents() {
        const viewport = document.getElementById('sg_viewport');
        const content = document.getElementById('sg_content');
        if (!viewport || !content) return;

        // 初始居中到起点 (左下角)
        // 视口高 ~500px, 起点在 y=800. 需要向上滚
        content.style.transform = `translate(-50px, -400px)`;
        // 记录当前 transform
        this.tx = -50;
        this.ty = -400;

        viewport.addEventListener('mousedown', (e) => {
            this.dragState.isDown = true;
            this.dragState.startX = e.pageX - this.tx;
            this.dragState.startY = e.pageY - this.ty;
            viewport.style.cursor = 'grabbing';
        });

        viewport.addEventListener('mouseleave', () => {
            this.dragState.isDown = false;
            viewport.style.cursor = 'grab';
        });

        viewport.addEventListener('mouseup', () => {
            this.dragState.isDown = false;
            viewport.style.cursor = 'grab';
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!this.dragState.isDown) return;
            e.preventDefault();
            const x = e.pageX - this.dragState.startX;
            const y = e.pageY - this.dragState.startY;

            // 简单边界限制 (防止拖出视界太远)
            this.tx = Math.min(200, Math.max(-1000, x));
            this.ty = Math.min(200, Math.max(-800, y));

            content.style.transform = `translate(${this.tx}px, ${this.ty}px)`;
        });
    }

    // --- 绘制连线 ---
    drawLines() {
        const svg = document.getElementById('sg_lines');
        if (!svg) return;

        let html = '';
        this.mapData.forEach(node => {
            // 遍历该节点的 moves，画出指向
            for (let type in node.moves) {
                const targetId = node.moves[type];
                if (targetId !== node.id) { // 不画原地
                    const targetNode = this.mapData.find(n => n.id === targetId);
                    if (targetNode) {
                        // 简单的直线，加上 center offset (40, 40)
                        const x1 = node.x + 40;
                        const y1 = node.y + 40;
                        const x2 = targetNode.x + 40;
                        const y2 = targetNode.y + 40;
                        // 颜色区分：德=红，才=蓝，脏=灰
                        let color = "#a1887f";
                        if (type === '德') color = "#ef5350";
                        if (type === '才') color = "#42a5f5";
                        if (type === '脏') color = "#78909c";

                        html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="sg_line" style="stroke:${color}" />`;
                        // 可以加个箭头marker，这里简化
                    }
                }
            }
        });
        svg.innerHTML = html;
    }

    // --- 游戏流程 ---
    spin() {
        if (this.state !== 'idle') return;

        // 检查警戒值
        if (this.opponent.suspicion >= 100) {
            this.triggerBlacklist();
            return;
        }

        this.state = 'spinning';
        const btn = document.getElementById('sg_spin_btn');
        const txt = document.getElementById('sg_spin_text');
        if(txt) txt.innerText = "";
        if(btn) btn.classList.add('spinning_anim');

        // 模拟旋转 1秒
        setTimeout(() => {
            if(btn) btn.classList.remove('spinning_anim');
            if(txt) txt.innerText = "定";
            this._resolveRound();
        }, 1000);
    }

    _resolveRound() {
        // 1. 结果判定
        // 如果有 cheatFlag，则强制结果
        let pRes = this._cheatFlag ? '德' : this._roll();
        let eRes = this._roll();
        this._cheatFlag = false; // 消耗掉出千标志

        // 2. 移动逻辑
        const pNodeObj = this.mapData.find(n => n.id === this.pNode);
        const eNodeObj = this.mapData.find(n => n.id === this.eNode);

        const pNextId = pNodeObj.moves[pRes];
        const eNextId = eNodeObj.moves[eRes];

        // 3. 执行移动
        this.pNode = pNextId;
        this.eNode = eNextId;
        this.updatePieces(true); // 开启 focus 自动跟随

        // 4. 显示 Toast
        const toast = document.getElementById('sg_toast');
        toast.innerHTML = `<span style="color:#ffcc80">你:${pRes}</span> <span style="color:#ccc">|</span> <span style="color:#fff">敌:${eRes}</span>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);

        // 5. 检查结束或下一轮
        setTimeout(() => {
            const txt = document.getElementById('sg_spin_text');
            if(txt) txt.innerText = "转";

            if (this.pNode === 14 || this.eNode === 14 || this.round >= this.maxRounds) {
                this.finishGame();
            } else {
                this.round++;
                document.getElementById('sg_round_val').innerText = this.round;
                this.state = 'idle';
            }
        }, 1500);
    }

    _roll() {
        const r = Math.random();
        if (r < 0.15) return '德';
        if (r < 0.50) return '才';
        if (r < 0.85) return '功';
        return '脏';
    }

    updatePieces(autoFocus = false) {
        const pObj = this.mapData.find(n => n.id === this.pNode);
        const eObj = this.mapData.find(n => n.id === this.eNode);

        const pEl = document.getElementById('sg_piece_p');
        const eEl = document.getElementById('sg_piece_e');

        if (pEl && pObj) {
            pEl.style.left = (pObj.x + 40 - 16) + 'px'; // +40是节点中心, -16是棋子半径
            pEl.style.top = (pObj.y + 40 - 16) + 'px';
        }
        if (eEl && eObj) {
            eEl.style.left = (eObj.x + 40 - 16) + 'px';
            eEl.style.top = (eObj.y + 40 - 16) + 'px';
        }

        // 自动聚焦到玩家棋子
        if (autoFocus && pObj) {
            const viewport = document.getElementById('sg_viewport');
            const content = document.getElementById('sg_content');
            if (viewport && content) {
                // 计算目标 translate 值，使 pObj 居中
                // 视口中心: w/2, h/2.
                const vw = viewport.clientWidth;
                const vh = viewport.clientHeight;

                let targetX = (vw / 2) - (pObj.x + 40);
                let targetY = (vh / 2) - (pObj.y + 40);

                // 边界限制
                targetX = Math.min(200, Math.max(-1000, targetX));
                targetY = Math.min(200, Math.max(-800, targetY));

                this.tx = targetX;
                this.ty = targetY;
                content.style.transform = `translate(${targetX}px, ${targetY}px)`;
            }
        }
    }

    // --- 出千 & 辅助 ---
    cheat() {
        if (this.state !== 'idle' && this.state !== 'spinning') return;

        const noise = Math.max(15, 60 - this.skillLevel * 5);
        this.opponent.suspicion += noise;
        this.ui.updateContent(document.getElementById('modal_gamble').querySelector('.modal_body').innerHTML); // 暴力刷新UI显示警戒条? 不，最好只刷新局部
        // 由于这里用 innerHTML 刷新会导致 DOM 重建，拖拽状态丢失，所以我们要手动更新警戒条 DOM
        this._updateSuspicionDOM();

        if (this.opponent.suspicion >= 100) {
            this.triggerBlacklist();
            return;
        }

        this._cheatFlag = true;
        if(window.showToast) window.showToast("已暗中施法，下次必定出【德】！", "success");
    }

    _updateSuspicionDOM() {
        // 寻找并更新 chupu_suspicion_fill (复用了类名)
        const bar = document.querySelector('.chupu_suspicion_fill');
        const txt = document.querySelector('.chupu_suspicion_text');
        if (bar && txt) {
            const s = this.opponent.suspicion;
            bar.style.width = s + '%';
            txt.innerText = s + '/100';
            if (s > 80) bar.className = 'chupu_suspicion_fill chupu_sus_high';
            else if (s > 50) bar.className = 'chupu_suspicion_fill chupu_sus_med';
        }
    }

    _getSuspicionUI() {
        const s = this.opponent.suspicion || 0;
        let barClass = "chupu_sus_low";
        if (s > 80) barClass = "chupu_sus_high";
        else if (s > 50) barClass = "chupu_sus_med";

        return `
            <div style="display:flex; align-items:center;">
                <div class="chupu_suspicion_wrap">
                    <div class="chupu_suspicion_fill ${barClass}" style="width:${s}%"></div>
                </div>
                <div class="chupu_suspicion_text" style="color:#fff;">${s}/100</div>
            </div>
        `;
    }

    // --- 结算系统 (复用之前的逻辑) ---
    triggerBlacklist() {
        this.state = 'finished';
        if (window.UtilsGamble) UtilsGamble.addTownBlacklist(this.ui.currentTown.id);

        this.ui.renderResultView({
            isWin: false,
            title: "革 职 查 办",
            msg: "吏部查出你履历造假，乱棍打出！<br><span style='color:red'>(本月拉黑)</span>",
            moneyChange: 0,
            opponent: this.opponent,
            onExit: () => { window.closeModal(); window.updateUI(); },
            onRetry: null
        });
        if(window.saveGame) window.saveGame();
    }

    finishGame() {
        this.state = 'finished';
        const pObj = this.mapData.find(n => n.id === this.pNode);
        const eObj = this.mapData.find(n => n.id === this.eNode);

        const isWin = pObj.rank > eObj.rank;
        const isDraw = pObj.rank === eObj.rank;

        // 官职差决定倍率
        let multi = 1.0;
        if (isWin) {
            const diff = pObj.rank - eObj.rank;
            if (diff >= 5) multi = 3.0; // 碾压
            else if (diff >= 3) multi = 2.0;
            else if (diff >= 1) multi = 1.5;
        }

        const B = Number(this.opponent.bet) || 0;
        const townId = this.ui.currentTown.id;
        const npcCurrentBank = Number(this.opponent.currentMoney ?? 0);

        let realProfit = 0;
        let resultMoneyChange = 0;
        let nextBet = B;
        let title="", msg="";

        if (isDraw) {
            UtilsMoney.addMoney(B);
            if (window.UtilsGamble) UtilsGamble.updateMoney(townId, 'shengguantu', this.opponent.id, 0, B, 3);
            title = "🤝 同 朝 为 官 🤝";
            msg = `官阶相当 (${pObj.name})，平局退款`;
        } else if (isWin) {
            let theoryProfit = Math.floor(B * multi);
            realProfit = Math.min(theoryProfit, npcCurrentBank);
            resultMoneyChange = realProfit;

            UtilsMoney.addMoney(B + realProfit)
            if (window.UtilsGamble) UtilsGamble.updateMoney(townId, 'shengguantu', this.opponent.id, realProfit, 0, 2);
            title = "✨ 平 步 青 云 ✨";
            msg = `官居【${pObj.name}】，力压【${eObj.name}】 (倍率 x${multi})`;
            nextBet = Math.min(B, Number(this.opponent.currentMoney)||0);
        } else {
            resultMoneyChange = -B;
            if (window.UtilsGamble) UtilsGamble.updateMoney(townId, 'shengguantu', this.opponent.id, 0, 0, 1);
            title = "💀 告 老 还 乡 💀";
            msg = `官场失意，止步【${pObj.name}】，不敌【${eObj.name}】`;
            nextBet = Math.min(B, window.player.money);
        }

        if(window.saveGame) window.saveGame();

        let canRetry = nextBet > 0;
        if (isWin && Number(this.opponent.currentMoney) <= 0) canRetry = false;
        if (!isWin && window.player.money <= 0) canRetry = false;

        this.ui.renderResultView({
            isWin, isDraw, title, msg, moneyChange: resultMoneyChange,
            opponent: this.opponent, nextBet,
            playerMoney: window.player.money, opponentMoney: this.opponent.currentMoney,
            onExit: () => this.ui.selectGame('shengguantu'),
            onRetry: canRetry ? (val) => {
                this.opponent.bet = val;
                this.startNewRound(val); // 直接重启
            } : null
        });
    }

    startNewRound(bet) {
        if (window.player.money < bet) return;

        UtilsMoney.removeMoney(bet)
        if (window.UtilsGamble) UtilsGamble.updateMoney(this.ui.currentTown.id, 'shengguantu', this.opponent.id, 0, bet, 0);
        this.ui.addMoneyLog('player', '本局押注', -bet);

        this.pNode = 0;
        this.eNode = 0;
        this.round = 1;
        this.state = 'idle';
        this.init();
    }
}

window.ShengGuanTuGame = ShengGuanTuGame;