// js/modules/shops/game/game_qingyun_ctrl.js
// 青云赛 - 控制器 v4.5 (完善计谋触发日志)

class QingyunGame {
    constructor(opponent, uiParent) {
        this.uiParent = uiParent;
        this.model = new QingyunModel();
        this.view = null;
        this.DICE_FACES = [{name:'德',type:'move',steps:3},{name:'才',type:'move',steps:2},{name:'功',type:'move',steps:1},{name:'脏',type:'stay',steps:0},{name:'升',type:'promote',steps:0},{name:'降',type:'demote',steps:0}];
        if (window.QingyunAI) this.aiEngine = new QingyunAI();
        this.isStrategyMode = false;
        this.isDestroyed = false;
        this.timers = [];
    }

    _safeTimeout(fn, delay) {
        if (this.isDestroyed) return;
        const id = setTimeout(() => {
            if (!this.isDestroyed) fn();
        }, delay);
        this.timers.push(id);
        return id;
    }

    stop() {
        this.isDestroyed = true;
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
        console.log("[Qingyun] Game instance stopped.");
    }

    updateView() {
        if (this.isDestroyed) return;
        this.view.render(this.model);
    }

    setupGame(tier, container) {
        if (this.isDestroyed) return;
        this.currentTierLv = { 1: 4, 2: 5, 3: 6 }[tier] || 4;
        const res = this.model.initGame(tier, window.player.money);
        if (!res.success) { UtilsModal.showQingyunNotice("无法入局", res.msg); return; }
        let targetBody = container || this.uiParent.modalBody || document.getElementById('modal_body');
        if (!targetBody) return; targetBody.innerHTML = '';
        this.view = new QingyunUI(targetBody);
        this.view.init(this.model);
        this._bindEvents();
        this.updateView();
    }

    _bindEvents() {
        this.view.container.addEventListener('click', (e) => {
            if (this.isDestroyed) return;
            if (e.target.closest('#btn_qy_start')) { this.handleStartGame(); return; }
            if (this.model.state !== 'playing') return;
            const currP = this.model.players[this.model.turnIndex];
            if (!currP || currP.id !== 'player') return;

            if (e.target.closest('#btn_strategy_card')) { this.toggleStrategyMode(); return; }
            if (this.isStrategyMode && !e.target.classList.contains('qy_cell')) { this.toggleStrategyMode(false); }

            const card = e.target.closest('.qy_card');
            if (card && !card.classList.contains('strategy')) {
                const action = card.dataset.action; const color = card.dataset.color;
                if (action === 'takeBet') this.handleTakeBet(color);
                // 【修改点】 监听新的随机掷骰动作
                if (action === 'rollRandom') this.handleRollRandom();
            }
            if (e.target.closest('#btn_skip')) this.handleSkip();
            if (e.target.closest('#btn_final_bet')) this.handleFinalBetOpen();
        });
        this.view.onCellClick = (l, i) => { if (!this.isDestroyed && this.isStrategyMode) this.handlePlaceStrategy(l, i); };
    }

    handleStartGame() {
        const config = this.model.config;
        if (window.player.money < config.entry) { UtilsModal.showQingyunToast("资金不足！"); return; }
        window.player.money -= config.entry;
        this.model.startGame();
        this.view.addLog(`🏁 比赛开始！固定奖池 ${this.model.jackpot} 文。`, true);
        UtilsModal.showQingyunToast("比赛开始！");
        this.view._generateMap(this.model);
        this.updateView();
        this.gameLoop();
    }
// 【修改点】策略模式开启判断：需 2 筹码
    // 【修改点】 开启策略模式：检查费用
    toggleStrategyMode(f){
        if(this.isDestroyed)return;
        const p=this.model.players[0];
        if(f===false){
            this.isStrategyMode=false;
            this.view.highlightValidCells(this.model,false);
            return;
        }
        if(!p.hasStrategy){
            UtilsModal.showQingyunToast("计谋卡已用尽");
            return;
        }
        // 破产保护：<=0 时允许
        if(p.chips > 0 && p.chips < 2){
            UtilsModal.showQingyunToast("筹码不足(需2)");
            return;
        }
        this.isStrategyMode=(f!==undefined)?f:!this.isStrategyMode;
        if(this.isStrategyMode){
            this.view.addLog("请点击地图上空闲的格子放置计谋...",true);
            UtilsModal.showQingyunToast("请点击地图格子放置");
            this.view.highlightValidCells(this.model,true);
        }else{
            this.view.highlightValidCells(this.model,false);
        }
    }

    // 【修改点】消耗 2 筹码
    // 【修改点】 执行放置计谋：扣费
    _executePlaceStrategy(l,i,t){
        const p=this.model.players[0];
        if(p.chips > 0) p.chips-=2; // 扣费逻辑

        this.model.placeStrategy('player',l,i,t);
        const n=t===1?"阳谋":"阴谋";
        this.view.addLog(`${p.name} 在 [${l}-${i+1}] 放置了 ${n} (消耗${p.chips>0?2:0}筹码)`,true);
        UtilsModal.showQingyunToast(`已放置 ${n}`);
        this.toggleStrategyMode(false);
        this.view._generateMap(this.model);
        this.updateView();
        this.nextTurn();
    }

    handlePlaceStrategy(l,i){if(!this.model.checkStrategyValid(l,i)){UtilsModal.showQingyunToast("该位置无法放置");return;}UtilsModal.showQingyunDecision("计谋选择","请选择在此处放置的计谋类型：<br><span style='color:#ef5350'>阳谋：踩中者前进1步</span><br><span style='color:#42a5f5'>阴谋：踩中者后退1步</span>","🔥 阳谋","💧 阴谋",()=>{this._executePlaceStrategy(l,i,1);},()=>{this._executePlaceStrategy(l,i,-1);});}
    // 【修改点】 拿取下注卡：扣费
    handleTakeBet(c){
        const p=this.model.players[this.model.turnIndex];
        if(p.chips > 0 && p.chips<1){ UtilsModal.showQingyunToast("筹码不足"); return; }

        const s=this.model.roundBetDeck[c];
        if(!s||s.length===0)return;

        const costMsg = p.chips > 0 ? "花费 1 筹码" : "免费";

        UtilsModal.showQingyunDecision("确认下注",`确定要${costMsg}拿取一张 <b style="color:${this.view._getColorHex(c)}">${this._getColorName(c)} x${s[0]}</b> 吗？`,"✅ 确定","❌ 取消",()=>{
            if(p.chips > 0) p.chips-=1;
            const v=s.shift();
            p.roundCards.push({color:c,val:v});
            this.view.addLog(`${p.name} 拿取 [${this._getColorName(c)}] (x${v})`,true);
            this.nextTurn();
        },()=>{});
    }

    handleRoll(c){const p=this.model.players[this.model.turnIndex];if(p.chips<1){UtilsModal.showQingyunToast("筹码不足");return;}UtilsModal.showQingyunDecision("确认行动",`确定要花费 1 筹码掷骰移动 <b style="color:${this.view._getColorHex(c)}">${this._getColorName(c)}</b> 棋子吗？`,"🎲 掷骰","❌ 取消",()=>{this._executeRoll(p,c);},()=>{});}
// 【修改点】 随机掷骰：增加0筹码判断逻辑
    handleRollRandom(){
        const p = this.model.players[this.model.turnIndex];
        // 如果筹码 > 0 且 < 1，才提示不足；如果 <=0，视为破产保护，允许行动
        if(p.chips > 0 && p.chips < 1){
            UtilsModal.showQingyunToast("筹码不足");
            return;
        }
        if(this.model.diceDeck.length === 0) return;

        const costMsg = p.chips > 0 ? "花费 1 筹码" : "免费(已破产)";

        UtilsModal.showQingyunDecision(
            "随机掷骰",
            `确定要${costMsg}抽取一张骰子卡并行动吗？<br><span style="color:#90a4ae; font-size:12px;">(从剩余 ${this.model.diceDeck.length} 张中随机抽取)</span>`,
            "🎲 抽取并掷骰",
            "❌ 取消",
            ()=>{
                const randomIndex = Math.floor(Math.random() * this.model.diceDeck.length);
                const randomColor = this.model.diceDeck[randomIndex];
                this._executeRoll(p, randomColor);
            },
            ()=>{}
        );
    }

    // 【修改点】 执行掷骰：扣费逻辑 & 记录历史
    async _executeRoll(p, c) {
        if (this.isDestroyed) return;

        // 扣费逻辑：只有筹码大于0时才扣除
        if (p.chips > 0) p.chips -= 1;

        // 移除卡牌
        const idx = this.model.diceDeck.indexOf(c);
        if (idx > -1) {
            this.model.diceDeck.splice(idx, 1);
        }

        const fi = Math.floor(Math.random() * this.DICE_FACES.length);
        const r = this.DICE_FACES[fi];
        const { name: face, type, steps } = r;

        // 【新增】 记录开卡结果
        this.model.drawnDiceRecords.push({ color: c, result: face });

        let es = "";
        if (type === 'move') es = `前进 ${steps} 格`;
        else if (type === 'promote') es = `直接晋升`;
        else if (type === 'demote') es = `不幸跌落`;
        else if (type === 'stay') es = `原地不动`;

        const log = `${p.name} 抽中 ${this._getColorName(c)} 并掷出：【${face}】${es}`;
        this.view.addLog(log, p.id === 'player');

        if (p.id === 'player') UtilsModal.showQingyunToast(`抽中 ${this._getColorName(c)}: ${face}`);

        const res = this.model.movePieceLogic(c, type, steps);
        if (res.path && res.path.length > 0) {
            await this.view.animatePieceMove(c, res.path);
        }
        if (this.isDestroyed) return;
        if (res.triggerInfo && res.triggerInfo.ownerId) {
            const o = this.model.players.find(pl => pl.id === res.triggerInfo.ownerId);
            const on = o ? o.name : "未知";
            const eff = res.triggerInfo.type > 0 ? '前进 1 步' : '后退 1 步';
            const tn = res.triggerInfo.type > 0 ? '阳谋' : '阴谋';
            const tm = `⚡ ${this._getColorName(c)} 踩中了 ${on} 的${tn}！${eff}，${on} 获得 4 筹码。`;
            this.view.addLog(tm, true);
            UtilsModal.showQingyunToast(`${on} 获得 4 筹码`);
        }
        this.updateView();
        if (res.finished) {
            this._safeTimeout(() => this.endGame(res.winnerStack), 1000);
        } else {
            this.nextTurn();
        }
    }

    handleFinalBetOpen() {
        const p=this.model.players[0];
        if(p.chips > 0 && p.chips<5){ UtilsModal.showQingyunToast("筹码不足(需5)"); return; }
        const hw = this.model.finalBets.winner.some(b => b.playerId === 'player');
        const hl = this.model.finalBets.loser.some(b => b.playerId === 'player');
        if (hw && hl) {
            UtilsModal.showQingyunToast("你已经完成了所有最终押注！");
            return;
        }
        const b1 = hw ? "🚫 已押冠军" : "👑 押注 冠军";
        const b2 = hl ? "🚫 已押倒数" : "💩 押注 倒数第一";
        UtilsModal.showQingyunDecision("最终押注类型", "请选择...<br><b>每种限一次，颜色不可复用！</b>", b1, b2, () => {
            if (hw) UtilsModal.showQingyunToast("已押注冠军！"); else this._openColorSelectForFinalBet('winner');
        }, () => {
            if (hl) UtilsModal.showQingyunToast("已押注倒数！"); else this._openColorSelectForFinalBet('loser');
        });
    }


    _openColorSelectForFinalBet(t){
        const p=this.model.players[0];
        UtilsModal.showQingyunColorSelect((c)=>{
            if(!this.model.COLORS.includes(c))return;
            if(!p.finalCards.includes(c)){UtilsModal.showQingyunToast("该颜色的【最终卡】已耗尽！");return;}

            if(p.chips > 0) p.chips-=5; // 扣费

            p.finalCards=p.finalCards.filter(x=>x!==c);
            this.model.finalBets[t].push({playerId:'player',color:c,round:this.model.round});
            const ts=t==='winner'?"冠军":"倒数第一";
            const ls=`${p.name} 最终押注 [${this._getColorName(c)}] 为 ${ts}`;
            this.view.addLog(ls,true);
            UtilsModal.showQingyunToast(`已押注 ${this._getColorName(c)} ${ts}`);
            this.model.currentRoundEvents.push(`${ts}:${this._getColorName(c)}`);
            this.updateView();
            this.nextTurn();
        });
    }

    // 【修改点】 跳过回合：增加扣费逻辑
    handleSkip(){
        const p = this.model.players[this.model.turnIndex];
        const cost = p.chips > 0 ? 1 : 0;
        const msg = cost > 0 ? "确定要花费 1 筹码跳过回合吗？" : "确定要跳过回合吗？(已破产免费)";

        UtilsModal.showQingyunDecision("确认跳过", msg, "确定", "取消", ()=>{
            if(p.chips > 0) p.chips -= 1;
            this.view.addLog(`${p.name} 选择跳过 (花费${cost}筹码)`, false);
            this.nextTurn();
        },null);
    }
    async aiAction(ai) {
        if (this.isDestroyed) return;

        // 1. 获取当前场次等级 (用于调整AI智商)
        const tier = this.model.config ? this.model.config.id : 1;

        // 2. 调用 AI 引擎获取决策
        // d 的结构: { type, score, desc, ...以及特定操作的参数 }
        const d = this.aiEngine.decide(this.model, ai, tier);

        // 定义一个扣费辅助函数：只有筹码 > 0 时才扣费
        const tryDeduct = (amount) => {
            if (ai.chips > 0) ai.chips -= amount;
        };

        // 3. 根据决策类型执行逻辑
        if (d.type === 'takeBet') {
            // --- 拿取下注卡 ---
            tryDeduct(1);

            const deck = this.model.roundBetDeck[d.color];
            if (deck && deck.length > 0) {
                const val = deck.shift();
                ai.roundCards.push({ color: d.color, val: val });
                this.view.addLog(`${ai.name} 拿取 [${this._getColorName(d.color)}] (x${val})`);
            }
            this.nextTurn();
        }
        else if (d.type === 'roll') {
            // --- 随机掷骰子 ---
            // 注意：_executeRoll 方法内部已经包含了"扣费"和"破产判断"逻辑，所以这里不需要调用 tryDeduct

            if (this.model.diceDeck.length > 0) {
                // AI 决定掷骰子，但颜色必须由系统随机抽取
                const randomIndex = Math.floor(Math.random() * this.model.diceDeck.length);
                const randomColor = this.model.diceDeck[randomIndex];

                // 稍微延迟一下，让玩家看清 AI 的决定
                await this._executeRoll(ai, randomColor);
            } else {
                // 理论上骰子空了会结束回合，防止卡死
                this.nextTurn();
            }
        }
        else if (d.type === 'strategy') {
            // --- 放置计谋 ---
            tryDeduct(2);

            // AI 决策中包含了 layer, index, stratType
            const res = this.model.placeStrategy(ai.id, d.layer, d.index, d.stratType);

            if (res) {
                const typeName = d.stratType === 1 ? "阳谋" : "阴谋";
                const locName = `[${['外','中','内'][d.layer]}-${d.index+1}]`;

                // 根据类型显示不同语气的日志，增加沉浸感
                if (d.stratType === 1) {
                    this.view.addLog(`${ai.name} 在 ${locName} 布下 ${typeName}，意图推波助澜！`, true);
                } else {
                    this.view.addLog(`${ai.name} 在 ${locName} 布下 ${typeName}，意图拦截！`, true);
                }

                // 刷新地图以显示计谋Token
                this.view._generateMap(this.model);
            }
            this.updateView();
            this.nextTurn();
        }
        else if (d.type === 'finalBet') {
            // --- 最终押注 ---
            tryDeduct(5);

            // 从 AI 手牌中移除这张颜色的最终卡
            ai.finalCards = ai.finalCards.filter(c => c !== d.color);

            // 记录押注
            this.model.finalBets[d.betType].push({
                playerId: ai.id,
                color: d.color,
                round: this.model.round
            });

            const typeStr = d.betType === 'winner' ? "冠军" : "倒数第一";
            this.view.addLog(`${ai.name} 最终押注 [${this._getColorName(d.color)}] 为 ${typeStr}`, true);

            this.updateView();
            this.nextTurn();
        }
        else {
            // --- 跳过 (Skip) ---
            tryDeduct(1);
            this.view.addLog(`${ai.name} 选择跳过回合`);
            this.nextTurn();
        }
    }

    gameLoop(){
        if(this.isDestroyed) return;
        if(this.model.state!=='playing')return;
        if(this.model.diceDeck.length===0){
            this._safeTimeout(()=>this.endRound(),1000);
            return;
        }
        const cp=this.model.players[this.model.turnIndex];
        if(!cp.isHuman){
            this._safeTimeout(()=>this.aiAction(cp),2000);
        }
    }

    async endRound() {
        if (this.isDestroyed) return;
        const factoryLogs = this.model.moveFactories();
        if (factoryLogs.length > 0) {
            this.view.addLog(`=== ⚔️ 厂卫巡查 ===`, true);
            for (const log of factoryLogs) {
                if (this.isDestroyed) return;
                let carriedStr = "";
                if (log.carried && log.carried.length > 0) {
                    const names = log.carried.map(c => `[${this._getColorName(c)}]`).join('');
                    carriedStr = `，带走了 ${names}`;
                }
                const actionStr = log.steps > 0 ? `掷出【${log.rollName}】往回移动 ${log.steps} 步` : `掷出【${log.rollName}】，按兵不动`;
                let finalLog = `${log.name} ${actionStr}${carriedStr}`;
                if (log.trap) {
                    finalLog += `。踩中 ${log.trap.owner} 的计谋，${log.trap.owner} +2 筹码。`;
                    UtilsModal.showQingyunToast(`${log.name} 踩中计谋，${log.trap.owner} +2 筹码`);
                }
                this.view.addLog(finalLog);
                if (log.path && log.path.length > 0) {
                    const colorId = log.name === '西厂' ? 'west_factory' : 'east_factory';
                    await this.view.animatePieceMove(colorId, log.path);
                }
            }
            this.updateView();
        }

        const rankList = this.model.getRankList();
        let rankHtml = `<div style="background:#37474f; border-radius:4px; padding:5px; margin-bottom:10px;"><div style="display:flex; border-bottom:1px solid #546e7a; padding:4px; color:#b0bec5; font-size:14px;"><span style="flex:1">排名</span><span style="flex:1">棋子</span><span style="flex:2">位置</span></div>`;
        rankList.slice(0, 5).forEach((p, i) => { const loc = `${['外','中','内'][p.layer]}-${p.index+1}`; rankHtml += `<div style="display:flex; padding:4px; color:#fff; font-size:16px;"><span style="flex:1; color:${i===0?'#ffd700':'#fff'}">No.${i+1}</span><span style="flex:1; font-weight:bold; color:${this.view._getColorHex(p.color)}">${this._getColorName(p.color)}</span><span style="flex:2">${loc}</span></div>`; }); rankHtml += `</div>`;
        let betHtml = `<div style="font-size:14px; text-align:left; color:#cfd8dc;">本轮下注情况：</div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:5px;">`;
        const summaryLog = [];
        this.model.players.forEach(p => {
            let gain = 0; const cardInfo = [];
            p.roundCards.forEach(card => { if (rankList[0].color === card.color) gain += card.val; else if (rankList[1].color === card.color) gain += 1; cardInfo.push(`${this._getColorName(card.color)}${card.val}`); });
            p.chips += gain;
            const stratGain = this.model.roundStrategyEarnings[p.id] || 0;
            const stratInfo = stratGain > 0 ? ` <span style="color:#dce775; font-size:11px;">(计谋+${stratGain})</span>` : '';
            const gc = gain > 0 ? "color:#ffca28" : "color:#90a4ae";
            betHtml += `<div style="background:rgba(0,0,0,0.2); padding:5px; border-radius:4px;"><div style="font-weight:bold;">${p.name} <span style="${gc}; float:right">+${gain}筹</span></div><div style="font-size:12px; color:#90a4ae;">押: ${cardInfo.length?cardInfo.join(','):'无'}${stratInfo}</div></div>`;
            if(gain>0) summaryLog.push(`${p.name} 获利 ${gain} 筹码`);
            p.roundCards = [];
        });
        betHtml += `</div>`;
        this.model.recordHistory(this.model.currentRoundEvents);
        this.model.currentRoundEvents = [];
        this.view.addLog(`=== 第 ${this.model.round} 轮结算 ===`, true);
        this.view.addLog(`第一名: ${this._getColorName(rankList[0].color)}, 第二名: ${this._getColorName(rankList[1].color)}`);
        summaryLog.forEach(s => this.view.addLog(s));
        this.updateView();
        UtilsModal.showQingyunNotice(`第 ${this.model.round} 轮结算`, rankHtml + betHtml, () => { if (this.isDestroyed) return; this.model._resetRoundDeck(); this.model.round++; this.model.roundStarter = (this.model.roundStarter + 1) % 4; this.model.turnIndex = this.model.roundStarter; this.view._generateMap(this.model); this.updateView(); this.gameLoop(); });
    }

    endGame(winnerStack) {
        const rankList = this.model.getRankList();
        const winnerColor = rankList[0].color;
        const loserColor = rankList[rankList.length - 1].color;

        const REWARDS = [40, 25, 5, 0];

        const finalResults = this.model.players.map(p => {
            const heldChips = p.chips;
            const winBetIndex = this.model.finalBets.winner.filter(b => b.color === winnerColor).findIndex(b => b.playerId === p.id);
            const loseBetIndex = this.model.finalBets.loser.filter(b => b.color === loserColor).findIndex(b => b.playerId === p.id);

            const winReward = winBetIndex !== -1 ? REWARDS[Math.min(winBetIndex, 3)] : 0;
            const loseReward = loseBetIndex !== -1 ? REWARDS[Math.min(loseBetIndex, 3)] : 0;

            const finalTotalChips = heldChips + winReward + loseReward;

            return {
                id: p.id,
                name: p.name,
                heldChips,
                winReward,
                loseReward,
                finalTotalChips
            };
        });

        const totalChipsInGame = finalResults.reduce((sum, r) => sum + r.finalTotalChips, 0);

        finalResults.forEach(r => {
            if (totalChipsInGame > 0) {
                r.poolShare = Math.floor(this.model.jackpot * (r.finalTotalChips / totalChipsInGame));
            } else {
                r.poolShare = 0;
            }
        });

        const playerRes = finalResults[0];
        window.player.money += playerRes.poolShare;
        if(window.UtilsGamble) UtilsGamble.updateMoney(this.uiParent.currentTown.id, 'qingyun', 'player', playerRes.poolShare, 0, 2);
        window.updateUI();

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
                        <th style="padding:5px;">选手</th>
                        <th>持有筹码</th>
                        <th>冠军奖</th>
                        <th>倒数奖</th>
                        <th>最终筹码</th>
                        <th>奖池分红(文)</th>
                    </tr>
                    ${finalResults.map((r, i) => `
                        <tr style="border-bottom:1px dashed rgba(255,255,255,0.1); background:${i===0?'rgba(255,215,0,0.1)':''}">
                            <td style="padding:6px; font-weight:bold;">${r.name}</td>
                            <td>${r.heldChips}</td>
                            <td style="color:#ef5350;">+${r.winReward}</td>
                            <td style="color:#42a5f5;">+${r.loseReward}</td>
                            <td style="font-weight:bold;">${r.finalTotalChips}</td>
                            <td style="color:#ffd700; font-weight:bold; font-size:16px;">${r.poolShare.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;

        this.view.addLog(`🏁 比赛结束！`, true);
        this.view.addLog(`你分得了 ${playerRes.poolShare} 文`);

        UtilsModal.showQingyunNotice("🏁 最终战报 🏁", html, () => {
            this.model.state = 'finished';
            // 【修改点】将 html 传给 UI，以便用于回顾
            this.view.setEndGameState(html);
            UtilsModal.showQingyunToast("游戏结束，可查看战报或离开");
        });
    }

    _getColorName(c) { return this.view._getColorName(c); }
    nextTurn() { this.model.turnIndex = (this.model.turnIndex + 1) % 4; this.updateView(); this.gameLoop(); }
    updateView() { this.view.render(this.model); }
}
window.QingyunGame = QingyunGame;