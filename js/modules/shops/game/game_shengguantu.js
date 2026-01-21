// js/modules/games/game_shengguantu.js
// 升官图 (The Promotion Duel) - v1.0
// 玩法：旋转长行坨(德/才/功/脏)，3轮定胜负

console.log("加载 升官图模块 v1.0");

// ================= 样式定义 =================
const shengguanStyles = `
<style id="game-shengguantu-styles">
    /* 复用部分樗蒲样式，但增加特有元素 */
    .sg_board {
        flex: 1; background: #3e2723; border: 6px double #8d6e63; border-radius: 12px;
        padding: 15px; display: flex; flex-direction: column; color: #fff8e1; position: relative;
        font-family: "KaiTi", serif; overflow: hidden;
    }
    
    /* 官阶阶梯 */
    .sg_ladder {
        flex: 1; display: flex; flex-direction: column-reverse; 
        justify-content: space-around; margin: 10px 0;
        background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px;
        position: relative;
    }
    .sg_step {
        height: 15%; display: flex; align-items: center; padding: 0 20px;
        border-bottom: 1px dashed rgba(255,255,255,0.1);
        position: relative; transition: all 0.3s;
    }
    .sg_step.active { background: rgba(255,215,0,0.1); }
    .sg_step_name { font-size: 18px; font-weight: bold; width: 80px; text-align: right; margin-right: 20px; }
    
    /* 棋子 */
    .sg_piece {
        width: 40px; height: 40px; border-radius: 50%; 
        display: flex; justify-content: center; align-items: center;
        font-size: 20px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.5);
        transition: top 0.5s ease-in-out, left 0.5s;
        position: absolute;
    }
    .sg_piece_p { background: #d84315; color: #fff; border: 2px solid #ffcc80; left: 120px; z-index: 10; }
    .sg_piece_e { background: #455a64; color: #fff; border: 2px solid #b0bec5; left: 180px; z-index: 5; }

    /* 长行坨 (陀螺) */
    .sg_spinner_area {
        height: 120px; display: flex; justify-content: center; align-items: center; gap: 40px;
    }
    .sg_spinner {
        width: 80px; height: 80px; 
        background-image: conic-gradient(#f44336 0% 25%, #2196f3 25% 50%, #4caf50 50% 75%, #607d8b 75% 100%);
        border-radius: 50%; border: 4px solid #fff;
        display: flex; justify-content: center; align-items: center;
        font-size: 32px; font-weight: bold; color: #fff; text-shadow: 0 2px 4px #000;
        position: relative; box-shadow: 0 10px 20px rgba(0,0,0,0.5);
    }
    .sg_spinner::after { content:''; position:absolute; width:10px; height:10px; background:#fff; border-radius:50%; }
    
    .spinning { animation: spin 0.1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* 结果字 */
    .sg_result_text { font-size: 40px; font-weight: bold; opacity: 0; transform: scale(0.5); transition: all 0.3s; }
    .sg_result_text.show { opacity: 1; transform: scale(1); }
    .res_de { color: #f44336; } /* 德 */
    .res_cai { color: #2196f3; } /* 才 */
    .res_gong { color: #4caf50; } /* 功 */
    .res_zang { color: #607d8b; } /* 脏 */

    /* 底部按钮 */
    .sg_controls { display: flex; justify-content: center; gap: 20px; margin-top: 10px; height: 60px; }
    .sg_btn {
        padding: 10px 30px; border-radius: 30px; border: none; font-size: 20px; cursor: pointer;
        font-family: "KaiTi"; color: #fff; box-shadow: 0 4px 0 rgba(0,0,0,0.3);
        transition: transform 0.1s;
    }
    .sg_btn_spin { background: linear-gradient(to bottom, #ff9800, #f57c00); }
    .sg_btn_cheat { background: linear-gradient(to bottom, #7e57c2, #512da8); font-size: 16px; }
    .sg_btn:active { transform: translateY(4px); box-shadow: none; }
    .sg_btn:disabled { filter: grayscale(1); cursor: not-allowed; }

</style>
`;

if (!document.getElementById('game-shengguantu-styles')) {
    document.head.insertAdjacentHTML('beforeend', shengguanStyles);
}

class ShengGuanTuGame {
    constructor(opponent, uiParent) {
        this.opponent = opponent;
        this.ui = uiParent;

        // 游戏状态
        this.state = 'idle'; // idle, spinning, finished
        this.round = 1;      // 当前轮次 (共3轮)
        this.maxRounds = 3;

        // 官阶 (0-5)
        this.pRank = 0;
        this.eRank = 0;

        // 临时结果
        this.pResult = null; // '德','才','功','脏'
        this.eResult = null;

        // 技能等级
        this.skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;

        // 官职名称映射
        this.RANK_NAMES = ["白丁", "秀才", "知县", "知府", "尚书", "太师"];
        this.RESULTS = {
            '德': { val: 2, color: 'res_de', text: '德 · 连升两级' },
            '才': { val: 1, color: 'res_cai', text: '才 · 晋升一级' },
            '功': { val: 0, color: 'res_gong', text: '功 · 原地留任' },
            '脏': { val: -1, color: 'res_zang', text: '脏 · 降级罚俸' }
        };

        this.init();
    }

    init() {
        this.render();
    }

    // --- 核心逻辑：旋转 ---
    spin() {
        if (this.state !== 'idle') return;

        // 开局前警戒值检查 (遵循新规范)
        if (this.opponent.suspicion >= 100) {
            this.triggerBlacklist();
            return;
        }

        this.state = 'spinning';
        this.render();

        // 播放音效或动画延迟
        setTimeout(() => {
            this._resolveRound();
        }, 1500); // 1.5秒动画
    }

    // --- 核心逻辑：结算本轮 ---
    _resolveRound() {
        // 生成随机结果
        this.pResult = this._roll();
        this.eResult = this._roll();

        // 动画停止，进入“作弊窗口期”或者直接结算
        // 这里简化：直接结算，作弊在 spin 前或 spin 中触发
        // 但为了更好的交互，我们可以在 spin 时允许点击“出千”按钮来改命
        // 由于是 turn-based，我们在点击 Spin 时如果不点 cheat，就是纯随机

        // 更新官阶
        this._applyMove('player', this.pResult);
        this._applyMove('enemy', this.eResult);

        this.state = 'round_end';
        this.render();

        setTimeout(() => {
            if (this.round < this.maxRounds) {
                this.round++;
                this.state = 'idle';
                this.pResult = null;
                this.eResult = null;
                this.render();
            } else {
                this.finishGame();
            }
        }, 2000);
    }

    _roll() {
        const r = Math.random();
        if (r < 0.15) return '德'; // 15%
        if (r < 0.55) return '才'; // 40%
        if (r < 0.85) return '功'; // 30%
        return '脏';               // 15%
    }

    _applyMove(target, type) {
        const move = this.RESULTS[type].val;
        if (target === 'player') {
            this.pRank += move;
            if (this.pRank < 0) this.pRank = 0;
            if (this.pRank > 5) this.pRank = 5;
        } else {
            this.eRank += move;
            if (this.eRank < 0) this.eRank = 0;
            if (this.eRank > 5) this.eRank = 5;
        }
    }

    // --- 出千逻辑 ---
    cheat() {
        if (this.state !== 'spinning') return; // 只有旋转时可出千

        // 1. 立即增加警戒值
        const noise = Math.max(10, 50 - this.skillLevel * 5);
        this.opponent.suspicion += noise;

        // 【核心规范】立即检查 100 拉黑
        if (this.opponent.suspicion >= 100) {
            this.opponent.suspicion = 100;
            this.triggerBlacklist();
            return;
        }

        // 2. 改命逻辑
        // 强制将玩家下一次结果改为“德”或“才”
        const successRate = 0.3 + (this.skillLevel * 0.05);
        if (Math.random() < successRate) {
            this.pResult = '德'; // 预设结果，_resolveRound 会覆盖，所以这里需要特殊处理
            // 实际上应该挂载一个 flag，让 _resolveRound 读取
            this._cheatFlag = true;
            if(window.showToast) window.showToast("暗箱操作成功！(必定出德)", "success");
        } else {
            if(window.showToast) window.showToast("手慢了！没能改变结果...", "error");
        }

        // 强制刷新显示警戒条
        this.render();
    }

    // 修改 _resolveRound 以支持出千 flag
    _resolveRound() {
        // 再次检查拉黑 (防止动画期间被拉黑)
        if (this.opponent.suspicion >= 100) return;

        // 玩家结果
        if (this._cheatFlag) {
            this.pResult = '德';
            this._cheatFlag = false;
        } else {
            this.pResult = this._roll();
        }

        this.eResult = this._roll();

        this._applyMove('player', this.pResult);
        this._applyMove('enemy', this.eResult);

        this.state = 'round_end';
        this.render();

        setTimeout(() => {
            if (this.opponent.suspicion >= 100) return; // 二次防抖

            if (this.round < this.maxRounds) {
                this.round++;
                this.state = 'idle';
                this.pResult = null;
                this.eResult = null;
                this.render();
            } else {
                this.finishGame();
            }
        }, 2000);
    }

    // --- 强制拉黑 (遵循新规范) ---
    triggerBlacklist() {
        this.state = 'finished';
        const townId = this.ui.currentTown.id;

        if (window.UtilsGamble && UtilsGamble.addToBlacklist) {
            UtilsGamble.addToBlacklist(townId);
        }

        const msg = `
            <div style="color:#b71c1c; text-align:center; padding:10px;">
                <p style="font-size:26px; font-weight:bold; margin-bottom:10px;">🚫 革 职 查 办 🚫</p>
                <p style="font-size:20px;">吏部铁面无私，查出你履历造假！</p>
                <div style="margin:15px 0; border:2px dashed #d32f2f; padding:10px; background:rgba(211,47,47,0.1); border-radius:8px;">
                    你被剥夺了所有功名，并被乱棍打出赌坊。<br>
                    <b style="color:#ffeb3b;">（本月内无法再次进入）</b>
                </div>
            </div>
        `;

        this.ui.renderResultView({
            isWin: false,
            title: "革 职 查 办",
            msg: msg,
            moneyChange: 0,
            opponent: this.opponent,
            onExit: () => {
                if (window.closeModal) window.closeModal();
                if (window.updateUI) window.updateUI();
            },
            onRetry: null
        });

        if(window.saveGame) window.saveGame();
    }

    // --- 游戏结算 (遵循新规范) ---
    finishGame() {
        this.state = 'finished';

        const isWin = this.pRank > this.eRank;
        const isDraw = this.pRank === this.eRank;

        // 资金逻辑
        const B = Number(this.opponent.bet) || 0;
        const townId = this.ui.currentTown.id;
        // 获取最新的 NPC 数据
        const latestNpc = window.UtilsGamble.getGamblerById(townId, 'chupu', this.opponent.id) || this.opponent; // 这里假设共用 chupu 的数据池或者新建 shengguantu 数据池?
        // 修正：赌坊大厅应该会传入正确的 opponent 引用，直接用即可
        const npcCurrentBank = Number(this.opponent.currentMoney ?? this.opponent.money ?? 0);

        // 官职差决定倍率 (额外奖励)
        // 赢1级 x1, 赢2级 x1.5, 赢3级以上 x2
        let multi = 1.0;
        if (isWin) {
            const diff = this.pRank - this.eRank;
            if (diff >= 3) multi = 2.0;
            else if (diff >= 2) multi = 1.5;
        }

        let realProfit = 0;
        let resultMoneyChange = 0;
        let title = "", msg = "";
        let nextBet = B;

        if (isDraw) {
            // 平局回滚 (Type 3)
            window.player.money += B;
            if (window.UtilsGamble) {
                // 注意：这里 gameName 传 'shengguantu' (需确保数据结构支持，或复用 chupu)
                // 暂时复用 'shengguantu'，需确保 UtilsGamble 不会报错
                UtilsGamble.updateMoney(townId, 'shengguantu', this.opponent.id, 0, B, 3);
            }
            resultMoneyChange = 0;
            title = "🤝 同 朝 为 官 🤝";
            msg = `官阶相当 (${this.RANK_NAMES[this.pRank]})，平局退款`;
            nextBet = B;
        } else if (isWin) {
            // 获胜
            let theoryProfit = Math.floor(B * multi);
            realProfit = Math.min(theoryProfit, npcCurrentBank);
            resultMoneyChange = realProfit;

            window.player.money += (B + realProfit);

            if (window.UtilsGamble) {
                UtilsGamble.updateMoney(townId, 'shengguantu', this.opponent.id, realProfit, 0, 2);
            }

            title = "✨ 连 升 三 级 ✨";
            msg = `官居 ${this.RANK_NAMES[this.pRank]}，力压 ${this.RANK_NAMES[this.eRank]} (倍率 x${multi})`;
            nextBet = Math.min(B, Number(this.opponent.currentMoney)||0);
        } else {
            // 失败
            resultMoneyChange = -B;
            if (window.UtilsGamble) {
                UtilsGamble.updateMoney(townId, 'shengguantu', this.opponent.id, 0, 0, 1);
            }
            title = "💀 告 老 还 乡 💀";
            msg = `官场失意，止步 ${this.RANK_NAMES[this.pRank]}`;
            nextBet = Math.min(B, window.player.money);
        }

        if(window.saveGame) window.saveGame();

        let canRetry = nextBet > 0;
        if (isWin && (Number(this.opponent.currentMoney) <= 0)) canRetry = false;
        if (!isWin && window.player.money <= 0) canRetry = false;

        this.ui.renderResultView({
            isWin: isWin,
            isDraw: isDraw,
            title: title,
            msg: msg,
            moneyChange: resultMoneyChange,
            opponent: this.opponent,
            nextBet: nextBet,
            playerMoney: window.player.money,
            opponentMoney: this.opponent.currentMoney,
            onExit: () => this.ui.selectGame('shengguantu'),
            onRetry: canRetry ? (nextBetAmount) => {
                // 重置状态
                this.opponent.bet = nextBetAmount;
                // 扣费逻辑在 startNewRoundAfterWaiting 或者是这里?
                // 参照 Chupu，Retry 只是设状态，UI 点击后触发 startNewRound
                // 这里我们简化：Retry Callback 直接重开

                // 模拟 Chupu 的 waiting_new 逻辑
                this.ui.renderResultView(null); // 关闭弹窗
                this.startNewRound(nextBetAmount);
            } : null
        });
    }

    startNewRound(bet) {
        if (window.player.money < bet) {
            if(window.showToast) window.showToast("本金不足！");
            this.ui.selectGame('shengguantu');
            return;
        }

        window.player.money -= bet;
        this.opponent.bet = bet;

        // 记账 Type 0
        if (window.UtilsGamble) {
            UtilsGamble.updateMoney(this.ui.currentTown.id, 'shengguantu', this.opponent.id, 0, bet, 0);
        }

        this.state = 'idle';
        this.round = 1;
        this.pRank = 0;
        this.eRank = 0;
        this.pResult = null;
        this.eResult = null;
        this.init();
    }

    render() {
        // 构建梯子 HTML
        let ladderHtml = '';
        for (let i = 5; i >= 0; i--) {
            const isP = this.pRank === i;
            const isE = this.eRank === i;
            ladderHtml += `
            <div class="sg_step ${isP||isE ? 'active' : ''}">
                <div class="sg_step_name">${this.RANK_NAMES[i]}</div>
                <div style="flex:1; position:relative; height:100%;">
                    ${isP ? `<div class="sg_piece sg_piece_p" style="top:50%; transform:translateY(-50%)">我</div>` : ''}
                    ${isE ? `<div class="sg_piece sg_piece_e" style="top:50%; transform:translateY(-50%)">敌</div>` : ''}
                </div>
            </div>`;
        }

        const spinClass = this.state === 'spinning' ? 'spinning' : '';
        const resHtml = (this.state === 'round_end' && this.pResult) ?
            `<div style="text-align:center; margin-top:10px;">
                <span class="sg_result_text show ${this.RESULTS[this.pResult].color}">我: ${this.RESULTS[this.pResult].text}</span><br>
                <span class="sg_result_text show ${this.RESULTS[this.eResult].color}">敌: ${this.RESULTS[this.eResult].text}</span>
             </div>` :
            `<div style="height:60px;"></div>`;

        const html = `
        <div class="gamble-layout" style="background:#2d1e1b; color:#fff;">
            <div class="chupu_header">
                <div class="chupu_header_left">
                    <div class="chupu_header_row">
                        <span class="chupu_text_label">对手</span>
                        <span class="chupu_text_name">${this.opponent.name}</span>
                    </div>
                    <div class="chupu_header_row">
                        <span class="chupu_text_money_label">身家</span>
                        <span class="chupu_text_money_val">${(this.opponent.currentMoney||0).toLocaleString()}</span>
                    </div>
                </div>
                <div class="chupu_header_right">
                    <div class="chupu_header_row">
                        <span class="chupu_text_label">警戒</span>
                        <div class="chupu_suspicion_wrap">
                            <div class="chupu_suspicion_fill ${this.opponent.suspicion>70?'chupu_sus_high':(this.opponent.suspicion>30?'chupu_sus_med':'chupu_sus_low')}" 
                                 style="width:${this.opponent.suspicion}%"></div>
                        </div>
                    </div>
                    <div class="chupu_header_row">
                         <span style="font-size:16px; color:#aaa;">当前轮次: ${this.round} / ${this.maxRounds}</span>
                    </div>
                </div>
            </div>

            <div class="sg_board">
                <div class="sg_ladder">
                    ${ladderHtml}
                </div>
                
                <div class="sg_spinner_area">
                    <div class="sg_spinner ${spinClass}">图</div>
                </div>
                
                ${resHtml}

                <div class="sg_controls">
                    <button class="sg_btn sg_btn_spin" 
                        onclick="GambleShop.currentGame.spin()" 
                        ${this.state !== 'idle' ? 'disabled' : ''}>
                        🌀 转动长行坨
                    </button>
                    
                    <button class="sg_btn sg_btn_cheat" 
                        onclick="GambleShop.currentGame.cheat()"
                        ${this.state !== 'spinning' ? 'disabled' : ''}>
                        ✋ 暗度陈仓
                    </button>
                </div>
            </div>
            
            <button class="btn-resign" onclick="GambleShop.selectGame('shengguantu')" style="margin-top:5px; padding:5px;">⬅ 退出</button>
        </div>
        `;

        this.ui.updateContent(html);
    }
}

window.ShengGuanTuGame = ShengGuanTuGame;