// js/modules/games/game_qingyun_ctrl.js
// 青云赛 - 控制器 (Controller)
// 职责：游戏循环、事件绑定、AI调度

class QingyunGame {
    constructor(opponent, uiParent) {
        this.uiParent = uiParent; // GambleShop 引用
        this.model = new QingyunModel();
        this.view = null; // 初始化时创建
    }

    // 入口：GambleShop调用
    setupGame(tier) {
        // 1. 初始化模型
        const res = this.model.initGame(tier, window.player.money);
        if (!res.success) {
            if(window.showToast) window.showToast(res.msg);
            return;
        }

        // 扣钱
        window.player.money -= res.cost;
        if(window.UtilsGamble) {
            // 记录入场费
            UtilsGamble.updateMoney(this.uiParent.currentTown.id, 'qingyun', 'jackpot', 0, res.cost, 0);
        }

        // 2. 初始化视图
        // 传递 modal_body 作为容器
        const modal = document.getElementById('modal_gamble').querySelector('.modal_body');
        this.view = new QingyunUI(modal);
        this.view.init(this.model);

        // 3. 绑定事件
        this._bindEvents();

        // 4. 开始渲染
        this.updateView();

        // 5. 启动循环
        this.gameLoop();
    }

    _bindEvents() {
        // 代理点击事件 (处理动态生成的卡牌)
        this.view.container.addEventListener('click', (e) => {
            // 只有玩家回合才能点击
            if (this.model.players[this.model.turnIndex].id !== 'player') return;

            const card = e.target.closest('.qy_card');
            if (card) {
                const action = card.dataset.action;
                const color = card.dataset.color;
                if (action === 'takeBet') this.handleTakeBet(color);
                if (action === 'roll') this.handleRoll(color);
            }

            if (e.target.id === 'btn_skip') this.handleSkip();
            if (e.target.id === 'btn_final_bet') this.handleFinalBetOpen();
        });
    }

    updateView() {
        this.view.render(this.model);
    }

    // --- 游戏循环 ---
    gameLoop() {
        if (this.model.state !== 'playing') return;

        // 检查是否所有骰子用完 -> 结算回合
        if (this.model.diceDeck.length === 0) {
            setTimeout(() => this.endRound(), 1000);
            return;
        }

        const currP = this.model.players[this.model.turnIndex];
        if (!currP.isHuman) {
            // AI 延迟行动
            setTimeout(() => this.aiAction(currP), 800);
        }
        // 如果是人类，等待点击事件触发 handleXXX
    }

    nextTurn() {
        this.model.turnIndex = (this.model.turnIndex + 1) % 4;
        this.updateView();
        this.gameLoop();
    }

    // --- 玩家动作逻辑 ---

    handleTakeBet(color) {
        const p = this.model.players[this.model.turnIndex];
        if (p.chips < 1) return alert("筹码不足");

        const stack = this.model.roundBetDeck[color];
        if (!stack || stack.length === 0) return;

        p.chips -= 1;
        this.model.jackpot += 1; // 简化：假设筹码价值已折算

        const val = stack.shift();
        p.roundCards.push({ color, val });

        this.nextTurn();
    }

    handleRoll(color) {
        const p = this.model.players[this.model.turnIndex];
        if (p.chips < 1) return alert("筹码不足");

        p.chips -= 1;
        this.model.jackpot += 1;

        // 移除骰子
        this.model.diceDeck = this.model.diceDeck.filter(c => c !== color);

        // 投掷逻辑
        const r = Math.random();
        let steps = 0, type = 'move', face = '';

        if (r < 0.3) { face='德'; steps=3; }
        else if (r < 0.6) { face='才'; steps=2; }
        else if (r < 0.8) { face='功'; steps=1; }
        else if (r < 0.9) { face='脏'; steps=0; type='stay'; }
        else if (r < 0.95) { face='升'; type='promote'; }
        else { face='降'; type='demote'; }

        if(window.showToast) window.showToast(`${p.name} 掷出了 ${face} !`);

        // 执行移动
        const result = this.model.movePieceLogic(color, type, steps);
        this.updateView();

        if (result.finished) {
            setTimeout(() => this.endGame(result.winnerStack), 1000);
        } else {
            this.nextTurn();
        }
    }

    handleSkip() {
        this.nextTurn();
    }

    handleFinalBetOpen() {
        // 简单处理：弹窗输入
        const color = prompt("输入颜色 (red/blue/green/yellow/white):");
        if (!this.model.COLORS.includes(color)) return;
        const p = this.model.players[0];
        if (!p.finalCards.includes(color)) return alert("没有该颜色手牌");
        if (p.chips < 5) return alert("筹码不足(需5)");

        p.chips -= 5;
        this.model.jackpot += 5;
        p.finalCards = p.finalCards.filter(c => c !== color);

        // 默认押赢
        this.model.finalBets.winner.push({ playerId: 'player', color });
        this.nextTurn();
    }

    // --- AI ---
    aiAction(ai) {
        // 简单AI：有骰子掷骰子
        if (this.model.diceDeck.length > 0 && ai.chips > 0) {
            const c = this.model.diceDeck[Math.floor(Math.random()*this.model.diceDeck.length)];
            this.handleRoll(c); // 复用逻辑，注意 this 指向
        } else {
            this.handleSkip();
        }
    }

    // --- 结算 ---
    endRound() {
        // 结算本轮下注卡 (略微简化逻辑)
        const rankList = this.model.getRankList();

        this.model.players.forEach(p => {
            p.roundCards.forEach(card => {
                // 如果 card.color 是第一名
                if (rankList[0].color === card.color) p.chips += card.val;
                // 第二名
                else if (rankList[1].color === card.color) p.chips += 1;
            });
            p.roundCards = [];
        });

        // 重置
        this.model._resetRoundDeck();
        this.model.round++;
        this.updateView();
        this.gameLoop();
    }

    endGame(winnerStack) {
        const winnerColor = winnerStack[winnerStack.length-1].color; // 最上面是冠军

        // 计算玩家奖金
        let winAmount = 0;

        // 1. 最终下注检查
        this.model.finalBets.winner.forEach(bet => {
            if (bet.playerId === 'player' && bet.color === winnerColor) {
                winAmount += 50; // 假设固定奖金
            }
        });

        // 2. 瓜分奖池 (按筹码比例)
        const totalChips = this.model.players.reduce((a,b)=>a+b.chips, 0);
        const myRatio = this.model.players[0].chips / totalChips;
        const poolWin = Math.floor(this.model.jackpot * myRatio);

        const totalWin = winAmount + poolWin;

        // 结算给玩家
        window.player.money += totalWin;
        if(window.UtilsGamble) {
            UtilsGamble.updateMoney(this.uiParent.currentTown.id, 'qingyun', 'player', totalWin, 0, 2);
        }

        this.uiParent.renderResultView({
            isWin: totalWin > 0,
            title: "比赛结束",
            msg: `冠军: ${winnerColor} | 你的分红: ${poolWin}`,
            moneyChange: totalWin,
            nextBet: 0,
            onExit: () => this.uiParent.selectGame('qingyun'),
            onRetry: null
        });
    }
}

window.QingyunGame = QingyunGame;