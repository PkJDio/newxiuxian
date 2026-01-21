// js/modules/shops/game/game_qingyun_ctrl.js
// 青云赛 - 控制器 v3.7 (详细日志 & 效果描述)

class QingyunGame {
    constructor(opponent, uiParent) {
        this.uiParent = uiParent;
        this.model = new QingyunModel();
        this.view = null;
        this.DICE_FACES = [
            { name: '德', type: 'move', steps: 3 }, { name: '才', type: 'move', steps: 2 },
            { name: '功', type: 'move', steps: 1 }, { name: '脏', type: 'stay', steps: 0 },
            { name: '升', type: 'promote', steps: 0 }, { name: '降', type: 'demote', steps: 0 }
        ];
        if (window.QingyunAI) this.aiEngine = new QingyunAI();
        this.isStrategyMode = false;

        // 暂存本轮玩家的特殊操作事件，用于endRound写入历史
        this.currentRoundEvents = [];
    }

    setupGame(tier, container) {
        this.currentTierLv = { 1: 4, 2: 5, 3: 6 }[tier] || 4;
        const res = this.model.initGame(tier, window.player.money);
        if (!res.success) {
            UtilsModal.showQingyunNotice("无法入局", res.msg);
            return;
        }
        let targetBody = container || this.uiParent.modalBody || document.getElementById('modal_body');
        if (!targetBody) return;
        targetBody.innerHTML = '';
        this.view = new QingyunUI(targetBody);
        this.view.init(this.model);
        this._bindEvents();
        this.updateView();
    }

    _bindEvents() {
        this.view.container.addEventListener('click', (e) => {
            if (e.target.closest('#btn_qy_start')) { this.handleStartGame(); return; }
            if (this.model.state !== 'playing') return;

            const currP = this.model.players[this.model.turnIndex];
            if (!currP || currP.id !== 'player') return;

            if (e.target.closest('#btn_strategy_card')) { this.toggleStrategyMode(); return; }
            if (this.isStrategyMode && !e.target.classList.contains('qy_cell')) { this.toggleStrategyMode(false); }

            const card = e.target.closest('.qy_card');
            if (card && !card.classList.contains('strategy')) {
                const action = card.dataset.action;
                const color = card.dataset.color;
                if (action === 'takeBet') this.handleTakeBet(color);
                if (action === 'roll') this.handleRoll(color);
            }
            if (e.target.closest('#btn_skip')) this.handleSkip();
            if (e.target.closest('#btn_final_bet')) this.handleFinalBetOpen();
        });

        this.view.onCellClick = (layer, index) => {
            if (this.isStrategyMode) this.handlePlaceStrategy(layer, index);
        };
    }

    handleStartGame() {
        const config = this.model.config;
        if (window.player.money < config.entry) {
            UtilsModal.showQingyunToast("资金不足！");
            return;
        }
        window.player.money -= config.entry;

        // 纯展示，不再操作 jackpot 账号
        // if(window.UtilsGamble) UtilsGamble.updateMoney(...)

        this.model.startGame();
        this.view.addLog(`🏁 比赛开始！固定奖池 ${this.model.jackpot} 文。`, true);
        UtilsModal.showQingyunToast("比赛开始！");
        this.view._generateMap(this.model);
        this.updateView();
        this.gameLoop();
    }

    toggleStrategyMode(forceState) {
        const p = this.model.players[0];
        if (forceState === false) {
            this.isStrategyMode = false;
            this.view.highlightValidCells(this.model, false);
            return;
        }
        if (!p.hasStrategy) { UtilsModal.showQingyunToast("计谋卡已用尽"); return; }
        if (p.chips < 1) { UtilsModal.showQingyunToast("筹码不足(需1)"); return; }

        this.isStrategyMode = (forceState !== undefined) ? forceState : !this.isStrategyMode;
        if (this.isStrategyMode) {
            this.view.addLog("请点击地图上空闲的格子放置计谋...", true);
            UtilsModal.showQingyunToast("请点击地图格子放置");
            this.view.highlightValidCells(this.model, true);
        } else {
            this.view.highlightValidCells(this.model, false);
        }
    }

    _executePlaceStrategy(layer, index, type) {
        const p = this.model.players[0];
        p.chips -= 1;
        this.model.placeStrategy('player', layer, index, type);
        const typeName = type === 1 ? "阳谋" : "阴谋";
        this.view.addLog(`${p.name} 在 [${layer}-${index}] 放置了 ${typeName}`, true);
        UtilsModal.showQingyunToast(`已放置 ${typeName}`);
        this.toggleStrategyMode(false);
        this.view._generateMap(this.model);
        this.updateView();
        this.nextTurn();
    }

    handlePlaceStrategy(layer, index) {
        if (!this.model.checkStrategyValid(layer, index)) {
            UtilsModal.showQingyunToast("该位置无法放置");
            return;
        }
        UtilsModal.showQingyunDecision(
            "计谋选择",
            "请选择在此处放置的计谋类型：<br><span style='color:#ef5350'>阳谋：踩中者前进1步</span><br><span style='color:#42a5f5'>阴谋：踩中者后退1步</span>",
            "🔥 阳谋",
            "💧 阴谋",
            () => { this._executePlaceStrategy(layer, index, 1); },
            () => { this._executePlaceStrategy(layer, index, -1); }
        );
    }

    handleTakeBet(color) {
        const p = this.model.players[this.model.turnIndex];
        if(p.chips < 1) { UtilsModal.showQingyunToast("筹码不足"); return; }
        const stack = this.model.roundBetDeck[color];
        if(!stack || stack.length === 0) return;
        const val = stack[0];
        UtilsModal.showQingyunDecision(
            "确认下注",
            `确定要花费 1 筹码拿取一张 <b style="color:${this.view._getColorHex(color)}">${this._getColorName(color)} x${val}</b> 吗？`,
            "✅ 确定", "❌ 取消",
            () => {
                p.chips -= 1;
                const cardVal = stack.shift();
                p.roundCards.push({color, val: cardVal});
                this.view.addLog(`${p.name} 拿取 [${this._getColorName(color)}] (x${cardVal})`, true);
                this.nextTurn();
            }, () => { }
        );
    }

    handleRoll(color) {
        const p = this.model.players[this.model.turnIndex];
        if(p.chips < 1) { UtilsModal.showQingyunToast("筹码不足"); return; }
        UtilsModal.showQingyunDecision(
            "确认行动",
            `确定要花费 1 筹码掷骰移动 <b style="color:${this.view._getColorHex(color)}">${this._getColorName(color)}</b> 棋子吗？`,
            "🎲 掷骰", "❌ 取消",
            () => { this._executeRoll(p, color); }, () => { }
        );
    }

    _executeRoll(p, color) {
        p.chips -= 1;
        this.model.diceDeck = this.model.diceDeck.filter(c => c !== color);

        const faceIdx = Math.floor(Math.random() * this.DICE_FACES.length);
        const result = this.DICE_FACES[faceIdx];
        const { name: face, type, steps } = result;

        // 【修改点】根据骰子结果生成具体的行动描述
        let effectStr = "";
        if (type === 'move') effectStr = `前进 ${steps} 格`;
        else if (type === 'promote') effectStr = `直接晋升`;
        else if (type === 'demote') effectStr = `不幸跌落`;
        else if (type === 'stay') effectStr = `原地不动`;

        const logStr = `${p.name} 掷出 ${this._getColorName(color)}：【${face}】${effectStr}`;
        this.view.addLog(logStr, p.id==='player');
        if (p.id === 'player') UtilsModal.showQingyunToast(logStr);

        const res = this.model.movePieceLogic(color, type, steps);

        if (res.triggerInfo && res.triggerInfo.ownerId) {
            setTimeout(() => {
                const owner = this.model.players.find(pl => pl.id === res.triggerInfo.ownerId);
                const ownerName = owner ? owner.name : "未知";
                const effectStr = res.triggerInfo.type > 0 ? '前进 1 步' : '后退 1 步';
                const trapName = res.triggerInfo.type > 0 ? '阳谋' : '阴谋';
                const triggerMsg = `⚡ ${this._getColorName(color)} 踩中了 ${ownerName} 的${trapName}！${effectStr}！`;
                this.view.addLog(triggerMsg, true);
                UtilsModal.showQingyunToast(triggerMsg);
                this.updateView();
            }, 500);
        }

        this.updateView();
        if (res.finished) {
            setTimeout(() => this.endGame(res.winnerStack), 1500);
        } else {
            this.nextTurn();
        }
    }

    handleFinalBetOpen() {
        const p = this.model.players[0];
        if (p.chips < 5) { UtilsModal.showQingyunToast("筹码不足(需5)"); return; }

        UtilsModal.showQingyunDecision(
            "最终押注类型",
            "请选择你要押注的方向 (消耗5筹码):<br>越早押注，猜中后奖励越高！<br><span style='color:#ef5350'>注意：已用过的颜色不可再押！</span>",
            "👑 押注 冠军",
            "💩 押注 倒数第一",
            () => { this._openColorSelectForFinalBet('winner'); },
            () => { this._openColorSelectForFinalBet('loser'); }
        );
    }

    _openColorSelectForFinalBet(betType) {
        const p = this.model.players[0];
        UtilsModal.showQingyunColorSelect((color) => {
            if (!this.model.COLORS.includes(color)) return;
            if (!p.finalCards.includes(color)) {
                UtilsModal.showQingyunToast("该颜色的【最终卡】已耗尽！");
                return;
            }

            p.chips -= 5;
            p.finalCards = p.finalCards.filter(c => c !== color);

            this.model.finalBets[betType].push({
                playerId: 'player', color, round: this.model.round
            });

            const typeStr = betType === 'winner' ? "冠军" : "倒数第一";
            const logStr = `${p.name} 最终押注 [${this._getColorName(color)}] 为 ${typeStr}`;

            this.view.addLog(logStr, true);
            UtilsModal.showQingyunToast(`已押注 ${this._getColorName(color)} ${typeStr}`);
            this.currentRoundEvents.push(`${typeStr}:${this._getColorName(color)}`);
            this.nextTurn();
        });
    }

    handleSkip() {
        UtilsModal.showQingyunDecision(
            "确认跳过", "确定要跳过本回合吗？", "确定", "取消",
            () => {
                const p = this.model.players[this.model.turnIndex];
                this.view.addLog(`${p.name} 选择跳过`, false);
                this.nextTurn();
            }, null
        );
    }

    aiAction(ai) {
        if (this.model.diceDeck.length > 0 && ai.chips > 0) {
            const decision = this.aiEngine.decide(this.model, ai, { canPredictDice: false, rollBias: 0, betThreshold: 0.6, errorRate: 0.1 });
            if (decision.type === 'takeBet') {
                ai.chips -= 1;
                const stack = this.model.roundBetDeck[decision.color];
                const val = stack.shift();
                ai.roundCards.push({color: decision.color, val});
                this.view.addLog(`${ai.name} 拿取 [${this._getColorName(decision.color)}] (x${val})`);
                this.nextTurn();
            } else if (decision.type === 'roll') {
                this._executeRoll(ai, decision.color);
            } else if (decision.type === 'finalBet') {
                const betType = Math.random() > 0.5 ? 'winner' : 'loser';
                ai.chips -= 5;
                ai.finalCards = ai.finalCards.filter(c => c !== decision.color);
                this.model.finalBets[betType].push({ playerId: ai.id, color: decision.color, round: this.model.round });
                const typeStr = betType === 'winner' ? "冠军" : "倒数";
                this.view.addLog(`${ai.name} 最终押注 [${this._getColorName(decision.color)}] 为 ${typeStr}`);
                this.nextTurn();
            } else {
                this.view.addLog(`${ai.name} 跳过`);
                this.nextTurn();
            }
        } else {
            this.view.addLog(`${ai.name} 无牌可打，跳过`);
            this.nextTurn();
        }
    }

    gameLoop() {
        if (this.model.state !== 'playing') return;
        if (this.model.diceDeck.length === 0) {
            setTimeout(() => this.endRound(), 1000);
            return;
        }
        const currP = this.model.players[this.model.turnIndex];
        if (!currP.isHuman) {
            setTimeout(() => this.aiAction(currP), 3000);
        }
    }

    endRound() {
        const rankList = this.model.getRankList();

        this.model.recordHistory(this.currentRoundEvents);
        this.currentRoundEvents = [];

        let rankHtml = `<div style="background:#37474f; border-radius:4px; padding:5px; margin-bottom:10px;">
            <div style="display:flex; border-bottom:1px solid #546e7a; padding:4px; color:#b0bec5; font-size:14px;">
                <span style="flex:1">排名</span><span style="flex:1">棋子</span><span style="flex:2">位置(完成度)</span>
            </div>`;
        rankList.slice(0, 5).forEach((p, i) => {
            const total = this.model.LAYERS[p.layer].steps;
            const ratio = Math.floor((p.index / total) * 100);
            const loc = `${['外','中','内'][p.layer]}-${p.index} (${ratio}%)`;
            rankHtml += `<div style="display:flex; padding:4px; color:#fff; font-size:16px;">
                <span style="flex:1; color:${i===0?'#ffd700':'#fff'}">No.${i+1}</span>
                <span style="flex:1; font-weight:bold; color:${this.view._getColorHex(p.color)}">${this._getColorName(p.color)}</span>
                <span style="flex:2">${loc}</span>
            </div>`;
        });
        rankHtml += `</div>`;

        let betHtml = `<div style="font-size:14px; text-align:left; color:#cfd8dc;">本轮下注情况：</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:5px;">`;
        const summaryLog = [];
        this.model.players.forEach(p => {
            let gain = 0;
            const cardInfo = [];
            p.roundCards.forEach(card => {
                if (rankList[0].color === card.color) gain += card.val;
                else if (rankList[1].color === card.color) gain += 1;
                cardInfo.push(`${this._getColorName(card.color)}${card.val}`);
            });
            p.chips += gain;
            const gainClass = gain > 0 ? "color:#ffca28" : "color:#90a4ae";
            betHtml += `<div style="background:rgba(0,0,0,0.2); padding:5px; border-radius:4px;">
                <div style="font-weight:bold;">${p.name} <span style="${gainClass}; float:right">+${gain}筹</span></div>
                <div style="font-size:12px; color:#90a4ae;">押: ${cardInfo.length ? cardInfo.join(',') : '无'}</div>
            </div>`;
            if(gain > 0) summaryLog.push(`${p.name} 获利 ${gain} 筹码`);
            p.roundCards = [];
        });
        betHtml += `</div>`;

        this.view.addLog(`=== 第 ${this.model.round} 轮结算 ===`, true);
        this.view.addLog(`第一名: ${this._getColorName(rankList[0].color)}, 第二名: ${this._getColorName(rankList[1].color)}`);
        if(summaryLog.length) summaryLog.forEach(s => this.view.addLog(s));

        this.updateView();

        UtilsModal.showQingyunNotice(
            `第 ${this.model.round} 轮结算`,
            rankHtml + betHtml,
            () => {
                this.model._resetRoundDeck();
                this.model.round++;
                this.model.roundStarter = (this.model.roundStarter + 1) % 4;
                this.model.turnIndex = this.model.roundStarter;

                this.view._generateMap(this.model);
                this.updateView();
                this.gameLoop();
            }
        );
    }

    endGame(winnerStack) {
        const rankList = this.model.getRankList();
        const winnerColor = rankList[0].color;
        const loserColor = rankList[rankList.length - 1].color;
        const totalChipsAll = this.model.players.reduce((sum, p) => sum + p.chips, 0);
        const REWARDS = [40, 25, 5, 0];

        const calcBetReward = (betList, targetColor, playerId) => {
            const correctBets = betList.filter(b => b.color === targetColor);
            const index = correctBets.findIndex(b => b.playerId === playerId);
            if (index !== -1) return REWARDS[Math.min(index, REWARDS.length - 1)];
            return 0;
        };

        const results = this.model.players.map(p => {
            const winBetReward = calcBetReward(this.model.finalBets.winner, winnerColor, p.id);
            const loseBetReward = calcBetReward(this.model.finalBets.loser, loserColor, p.id);
            const totalBetChips = winBetReward + loseBetReward;
            const poolShareMoney = totalChipsAll > 0 ? Math.floor(this.model.jackpot * (p.chips / totalChipsAll)) : 0;
            const finalBetMoney = totalBetChips * p.chipVal;
            const totalCash = finalBetMoney + poolShareMoney;
            return { name: p.name, chips: p.chips, winBetReward, loseBetReward, poolShare: poolShareMoney, totalCash };
        });

        const playerRes = results[0];
        window.player.money += playerRes.totalCash;
        if(window.UtilsGamble) UtilsGamble.updateMoney(this.uiParent.currentTown.id, 'qingyun', 'player', playerRes.totalCash, 0, 2);

        let html = `
            <div style="font-size:32px; color:${this.view._getColorHex(winnerColor)}; font-weight:bold; margin-bottom:5px;">
                👑 冠军：${this._getColorName(winnerColor)}
            </div>
            <div style="font-size:20px; color:#90a4ae; margin-bottom:15px;">
                💩 倒数：${this._getColorName(loserColor)}
            </div>
            <div style="background:#263238; border:1px solid #546e7a; border-radius:8px; padding:10px;">
                <table style="width:100%; border-collapse:collapse; color:#fff;">
                    <tr style="border-bottom:1px solid #546e7a; color:#90a4ae; font-size:14px;">
                        <th style="padding:5px;">选手</th><th>冠军奖</th><th>倒数奖</th><th>奖池分红</th><th>总入账(文)</th>
                    </tr>
                    ${results.map((r, i) => `
                        <tr style="border-bottom:1px dashed rgba(255,255,255,0.1); background:${i===0?'rgba(255,215,0,0.1)':''}">
                            <td style="padding:6px; font-weight:bold;">${r.name}</td>
                            <td style="color:#ef5350;">+${r.winBetReward}</td>
                            <td style="color:#42a5f5;">+${r.loseBetReward}</td>
                            <td style="color:#ffd700;">+${r.poolShare}</td>
                            <td style="color:#ffd700; font-weight:bold;">${r.totalCash.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;

        this.view.addLog(`🏁 比赛结束！`, true);
        this.view.addLog(`你获得了 ${playerRes.totalCash} 文`);

        UtilsModal.showQingyunNotice("🏁 最终战报 🏁", html, () => {
            UtilsModal.showQingyunToast("请点击右上角退出按钮离场");
            const bottomPanel = document.getElementById('qy_bottom_panel');
            if(bottomPanel) {
                bottomPanel.innerHTML = `
                    <div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.8);">
                        <button onclick="GambleShop.selectGame('qingyun')" class="qy_btn bet" style="width:200px; height:60px;">返回大厅</button>
                    </div>
                `;
            }
        });
    }

    _getColorName(c) { return this.view._getColorName(c); }
    nextTurn() { this.model.turnIndex = (this.model.turnIndex + 1) % 4; this.updateView(); this.gameLoop(); }
    updateView() { this.view.render(this.model); }
}
window.QingyunGame = QingyunGame;