// js/modules/shops/game/game_qingyun_ai.js
// 青云赛 - AI 核心逻辑 v8.1 (引入默认敌意机制：非友即敌，平衡阴阳谋)

class QingyunAI {
    constructor() {
        this.TIER_CONFIG = {
            // 低级场
            1: { turnDepth: 2, simCount: 20, errorMargin: 0.2, betThreshold: 0.6 },
            // 中级场
            2: { turnDepth: 5, simCount: 50, errorMargin: 0.1, betThreshold: 0.8 },
            // 高级场
            3: { turnDepth: -1, simCount: 100, errorMargin: 0.0, betThreshold: 0.9 }
        };
    }

    decide(model, aiPlayer, tier) {
        const config = this.TIER_CONFIG[tier] || this.TIER_CONFIG[1];
        const isBroke = aiPlayer.chips <= 0;
        const earnings = aiPlayer.strategyEarnings || 0;

        console.groupCollapsed(`🤖 ${aiPlayer.name} (Lv.${tier}) | R${model.round} | 🎲剩${model.diceDeck.length} | 💰赚${earnings}`);

        // 1. 蒙特卡洛模拟
        const simResult = this._runTurnBasedSimulation(model, aiPlayer, config.turnDepth, config.simCount);
        const winProbs = simResult.winProbs;
        const hotspots = simResult.hotspots;

        // 找出领头羊
        let maxProb = -1;
        let leaderColor = null;
        for(let c in winProbs) {
            if(winProbs[c] > maxProb) { maxProb = winProbs[c]; leaderColor = c; }
        }

        console.log(`📊 [模拟预测] 领跑:${leaderColor}(${(maxProb*100).toFixed(0)}%)`,
            Object.entries(winProbs).map(([k,v]) => `${k}:${(v*100).toFixed(0)}%`).join(', ')
        );

        let actions = [];

        // ==========================================
        // A. 拿取下注卡
        // ==========================================
        for (let color of model.COLORS) {
            const deck = model.roundBetDeck[color];
            if (deck && deck.length > 0) {
                const cardVal = deck[0];
                const cost = isBroke ? 0 : 1;
                const pWin = winProbs[color];
                const pSecond = (1 - pWin) * 0.3;

                let baseEv = (pWin * cardVal) + (pSecond * 1) - cost;
                let finalScore = baseEv;
                let logTags = [];

                if (color === leaderColor && pWin > 0.3) { finalScore += 0.6; logTags.push("👑领跑"); }
                if (pWin > 0.8) { finalScore += 2.0; logTags.push("🔥稳赢"); }
                else if (pWin > 0.6) { finalScore += 1.0; logTags.push("👍优选"); }
                else if (pWin > 0.45) { finalScore += 0.4; logTags.push("👌潜力"); }

                // 护盘
                if (this._hasMyFinalBet(model, aiPlayer, 'winner', color)) {
                    finalScore += 1.5; logTags.push("🛡️本命");
                }

                console.log(`   🎫 选项 [${color} x${cardVal}]: 胜率${(pWin*100).toFixed(0)}% | 基础EV:${baseEv.toFixed(2)} | 加成:[${logTags.join(',')}] -> 得分:${finalScore.toFixed(2)}`);
                actions.push({ type: 'takeBet', color: color, score: finalScore, desc: `拿[${color} x${cardVal}]` });
            }
        }

        // ==========================================
        // B. 随机掷骰子
        // ==========================================
        if (model.diceDeck.length > 0) {
            const cost = isBroke ? 0 : 1;
            let rollScore = 2 - cost;

            const currentRankScore = this._calculateProjectedScore(model, aiPlayer, model.getRankList()[0].color);
            const futureRankScore = this._calculateProjectedScore(model, aiPlayer, simResult.mostLikelyWinner);
            const urgency = currentRankScore - futureRankScore;

            let logMsg = "";
            if (tier >= 2) {
                if (urgency > 0.5) { rollScore += urgency * 2.5; logMsg = `(⚡加速)`; }
                else if (urgency < -0.5) { rollScore -= 2.0; logMsg = `(🐢拖延)`; }
            } else {
                let simpleBias = 0;
                model.diceDeck.forEach(c => simpleBias += this._getColorInterest(aiPlayer, c));
                rollScore += (simpleBias / model.diceDeck.length) * 0.3;
                logMsg = `(🎲随缘)`;
            }
            console.log(`   🎲 选项 [随机骰子]: 保底1.0 ${logMsg} -> 得分:${rollScore.toFixed(2)}`);
            actions.push({ type: 'roll', score: rollScore, desc: `随机掷骰` });
        }

        // ==========================================
        // C. 放置计谋 (v8.1: 默认敌意 + 战术博弈)
        // ==========================================
        if (aiPlayer.hasStrategy && (isBroke || aiPlayer.chips >= 2)) {
            const rivalInfo = this._getRivalInfo(model, aiPlayer);
            const strat = this._findBestStrategy(model, aiPlayer, winProbs, isBroke ? 0 : 2, tier, hotspots, config.simCount, model.diceDeck.length, rivalInfo);

            if (strat) {
                console.log(`   💡 选项 [计谋]: ${strat.desc} -> 得分:${strat.score.toFixed(2)}`);
                if (strat.score > -0.5) {
                    actions.push(strat);
                }
            } else {
                console.log(`   💡 选项 [计谋]: 时机不佳或无价值`);
            }
        }

        // ==========================================
        // D. 最终押注
        // ==========================================
        if (aiPlayer.chips >= 5 || isBroke) {
            const maxProgress = Math.max(...model.pieces.map(p => this._getPieceProgress(p, model.LAYERS)));
            // 【修改点】 只有进度 > 60% 才开始考虑终注
            const progressLock = maxProgress < 0.6;

            if (progressLock) {
                console.log(`   🔒 [终注锁]: 进度${(maxProgress*100).toFixed(0)}% < 60%，跳过`);
            } else {
                model.COLORS.forEach(c => {
                    if (aiPlayer.finalCards.includes(c)) {
                        const wp = winProbs[c];

                        // 押注冠军
                        if (!this._hasBetType(model, aiPlayer, 'winner') && wp > config.betThreshold) {
                            // 避嫌逻辑
                            const isTakenByRival = model.finalBets.winner.some(b => b.color === c && b.playerId !== aiPlayer.id);
                            if (isTakenByRival) {
                                console.log(`   🚫 [避嫌]: ${c}已被抢注冠军，放弃跟投`);
                            } else {
                                const score = (40 * wp) - (isBroke?0:5);
                                console.log(`   🏆 选项 [押注${c}冠军]: 胜率${(wp*100).toFixed(0)}% -> 得分:${score.toFixed(2)}`);
                                actions.push({ type: 'finalBet', betType: 'winner', color: c, score: score, desc: `押注 [${c}] 冠军` });
                            }
                        }

                        // 押注倒数
                        const lp = 1.0 - wp - 0.1;
                        if (!this._hasBetType(model, aiPlayer, 'loser') && lp > config.betThreshold) {
                            const score = (40 * lp) - (isBroke?0:5);
                            console.log(`   💩 选项 [押注${c}倒数]: 败率${(lp*100).toFixed(0)}% -> 得分:${score.toFixed(2)}`);
                            actions.push({ type: 'finalBet', betType: 'loser', color: c, score: score, desc: `押注 [${c}] 倒数` });
                        }
                    }
                });
            }
        }

        // --- E. 跳过 ---
        const skipCost = isBroke ? 0 : 1;
        actions.push({ type: 'skip', score: -skipCost - 0.1, desc: '跳过' });

        if (config.errorMargin > 0) actions.forEach(a => a.score += (Math.random() - 0.5) * config.errorMargin);
        actions.sort((a, b) => b.score - a.score);
        const best = actions[0];

        console.log(`✅ [最终决策] ${best.desc} (分值:${best.score.toFixed(2)})`);
        console.groupEnd();

        return best;
    }

    _runTurnBasedSimulation(realModel, aiPlayer, maxTurns, iterations) {
        const winCounts = {};
        realModel.COLORS.forEach(c => winCounts[c] = 0);
        const hotspots = {};
        if (realModel.diceDeck.length === 0) {
            const ranks = realModel.getRankList();
            const probs = {};
            realModel.COLORS.forEach(c => probs[c] = (c === ranks[0].color ? 1.0 : 0.0));
            return { winProbs: probs, mostLikelyWinner: ranks[0].color, hotspots: {} };
        }
        for (let i = 0; i < iterations; i++) {
            const simState = this._cloneState(realModel);
            let turnsToSimulate = (maxTurns === -1) ? 999 : maxTurns;
            while (turnsToSimulate > 0 && simState.deck.length > 0) {
                if (Math.random() < 0.6) {
                    const randIndex = Math.floor(Math.random() * simState.deck.length);
                    const color = simState.deck.splice(randIndex, 1)[0];
                    this._simulateMove(simState, color, hotspots);
                }
                turnsToSimulate--;
            }
            const winner = this._getSimWinner(simState);
            winCounts[winner]++;
        }
        const winProbs = {};
        let mostLikelyWinner = null;
        let maxCount = -1;
        realModel.COLORS.forEach(c => {
            const count = winCounts[c];
            winProbs[c] = count / iterations;
            if (count > maxCount) { maxCount = count; mostLikelyWinner = c; }
        });
        return { winProbs, mostLikelyWinner, hotspots };
    }

    _cloneState(model) {
        return {
            pieces: model.pieces.map(p => ({...p})),
            deck: [...model.diceDeck],
            layers: model.LAYERS
        };
    }

    _simulateMove(state, color, hotspots) {
        const p = state.pieces.find(pc => pc.color === color);
        if (!p || p.isFinished) return;
        const movingGroup = state.pieces.filter(other =>
            !other.isFinished && other.layer === p.layer && other.index === p.index && other.stackPos >= p.stackPos
        );
        movingGroup.sort((a, b) => a.stackPos - b.stackPos);
        const roll = Math.random();
        if (roll < 0.5) {
            const steps = Math.floor(Math.random() * 3) + 1;
            this._applyStep(state, movingGroup, steps);
        } else if (roll < 0.85) {
            if (p.layer < 2) {
                const r = p.index / state.layers[p.layer].steps;
                const newLayer = p.layer + 1;
                const newIndex = Math.floor(r * state.layers[newLayer].steps);
                this._moveGroupTo(state, movingGroup, newLayer, newIndex);
            }
        }
        if (hotspots) {
            const leader = movingGroup[0];
            if (!leader.isFinished) {
                const key = `${leader.layer}_${leader.index}`;
                hotspots[key] = (hotspots[key] || 0) + 1;
            }
        }
    }

    _applyStep(state, group, steps) {
        const leader = group[0];
        let layer = leader.layer;
        let index = leader.index;
        for (let i = 0; i < steps; i++) {
            index++;
            const maxIdx = state.layers[layer].steps - 1;
            if (index > maxIdx) {
                if (layer === 2) { group.forEach(p => p.isFinished = true); return; }
                layer++;
                index = state.layers[layer].steps - 1;
            }
        }
        this._moveGroupTo(state, group, layer, index);
    }

    _moveGroupTo(state, group, layer, index) {
        let baseStack = -1;
        state.pieces.forEach(p => {
            if (!p.isFinished && p.layer === layer && p.index === index && !group.includes(p)) {
                if (p.stackPos > baseStack) baseStack = p.stackPos;
            }
        });
        group.forEach((p, i) => {
            p.layer = layer;
            p.index = index;
            p.stackPos = baseStack + 1 + i;
        });
    }

    _getPieceProgress(p, layers) {
        if (p.isFinished) return 1.1;
        const offsets = [3, 2, 1];
        const layerSteps = layers[p.layer].steps;
        const offset = offsets[p.layer];
        return (p.index + 1) / (layerSteps + offset);
    }

    _getSimWinner(state) {
        let bestP = state.pieces[0];
        for (let i = 1; i < state.pieces.length; i++) {
            const p = state.pieces[i];
            if (p.isFinished && !bestP.isFinished) { bestP = p; continue; }
            if (!p.isFinished && bestP.isFinished) continue;
            const scoreP = this._getPieceProgress(p, state.layers);
            const scoreBest = this._getPieceProgress(bestP, state.layers);
            if (scoreP > scoreBest + 0.00001) bestP = p;
            else if (Math.abs(scoreP - scoreBest) <= 0.00001) {
                if ((p.stackPos||0) > (bestP.stackPos||0)) bestP = p;
            }
        }
        return bestP.color;
    }

    _calculateProjectedScore(model, ai, winnerColor) {
        let s = 0;
        ai.roundCards.forEach(c => { if (c.color === winnerColor) s += c.val; });
        return s;
    }

    _getColorInterest(ai, color) {
        let s = 0;
        ai.roundCards.forEach(c => { if(c.color===color) s += 0.5; });
        if(!ai.finalCards.includes(color)) s += 1;
        return s;
    }

    _hasBetType(model, ai, type) { return model.finalBets[type].some(b => b.playerId === ai.id); }

    _hasMyFinalBet(model, ai, type, color) {
        return model.finalBets[type].some(b => b.playerId === ai.id && b.color === color);
    }

    _getRivalInfo(model, ai) {
        const rivalWin = [];
        const rivalLose = [];
        model.finalBets.winner.forEach(b => { if (b.playerId !== ai.id) rivalWin.push(b.color); });
        model.finalBets.loser.forEach(b => { if (b.playerId !== ai.id) rivalLose.push(b.color); });
        return { rivalWin, rivalLose };
    }

    // ==========================================
    // 核心升级：_findBestStrategy (v8.1: 默认敌意 + 阴阳平衡)
    // ==========================================
    _findBestStrategy(model, ai, winProbs, cost, tier, hotspots, simCount, diceCount, rivalInfo) {
        const earnings = ai.strategyEarnings || 0;
        const isSweet = earnings > 0;
        const isAddicted = earnings > 12;

        let timeBonus = 0;
        if (diceCount === 5) timeBonus = 3.0;
        else if (diceCount === 4) timeBonus = 1.0;
        else if (diceCount === 3 && isAddicted && tier < 3) timeBonus = 0.5;
        else return null;

        const greedScore = isSweet && tier < 3 ? Math.min(earnings * 0.05, 2.0) : 0;

        let best = null;
        let maxS = -999;

        model.pieces.forEach(p => {
            if(p.isFinished) return;

            const stack = model.pieces.filter(other =>
                !other.isFinished && other.layer === p.layer && other.index === p.index && other.stackPos >= p.stackPos
            );

            let stackTacticalVal = 0;

            stack.forEach(sp => {
                const prob = winProbs[sp.color] || 0;
                let weight = 0;

                // A. 基础持仓
                let cardVal = 0;
                ai.roundCards.forEach(c => { if(c.color===sp.color) cardVal += c.val; });

                if (cardVal > 0) {
                    weight += 2.0; // 持有卡片 -> 友军
                } else {
                    // 【核心修改】没有卡片 -> 默认为敌人 (Default Hostility)
                    // 只有这样，AI 才会去害那些它没买的、但跑得很快的颜色
                    weight -= 2.0;
                }

                // B. 自身终注
                if (this._hasMyFinalBet(model, ai, 'winner', sp.color)) weight += 10.0;
                if (this._hasMyFinalBet(model, ai, 'loser', sp.color)) weight -= 10.0;

                // C. 对手终注
                if (rivalInfo.rivalWin.includes(sp.color)) weight -= 8.0;
                if (rivalInfo.rivalLose.includes(sp.color)) weight += 8.0;

                // 战术分 = 权重 * 胜率
                // 如果是没买的领头羊 (weight=-2, prob=0.8) -> 战术分 -1.6 -> 触发阴谋
                stackTacticalVal += (weight * prob);
            });

            // 3. 全维扫描
            const potentialMoves = [];
            for(let s=1; s<=3; s++) {
                let tLayer = p.layer;
                let tIndex = p.index + s;
                const maxIdx = model.LAYERS[tLayer].steps - 1;
                if (tIndex > maxIdx) {
                    if (tLayer < 2) { tLayer++; tIndex = model.LAYERS[tLayer].steps - 1; }
                    else continue;
                }
                potentialMoves.push({ l: tLayer, i: tIndex, type: 'move' });
            }
            if (p.layer < 2) {
                const r = p.index / model.LAYERS[p.layer].steps;
                const nextL = p.layer + 1;
                const nextI = Math.floor(r * model.LAYERS[nextL].steps);
                potentialMoves.push({ l: nextL, i: nextI, type: 'promote' });
            }
            if (p.layer > 0) {
                const r = p.index / model.LAYERS[p.layer].steps;
                const prevL = p.layer - 1;
                const prevI = Math.floor(r * model.LAYERS[prevL].steps);
                potentialMoves.push({ l: prevL, i: prevI, type: 'demote' });
            }

            // 4. 遍历并评分
            for (let move of potentialMoves) {
                const { l, i, type } = move;
                if (!model.checkStrategyValid(l, i)) continue;

                const key = `${l}_${i}`;
                const visitCount = hotspots[key] || 0;
                const prob = visitCount / simCount;
                const economicEv = prob * 4.0;

                // 阳谋：
                if (stackTacticalVal > 0) {
                    let yS = stackTacticalVal + economicEv + timeBonus + greedScore - cost;
                    if (yS > maxS) {
                        maxS = yS;
                        let descType = type === 'move' ? '' : (type==='promote' ? '[升]' : '[降]');
                        best = {
                            type:'strategy', layer:l, index:i, stratType:1,
                            score:yS,
                            desc:`阳谋${descType}(率:${(prob*100).toFixed(0)}% 赚:${economicEv.toFixed(2)} 战:${stackTacticalVal.toFixed(2)} 贪:${greedScore.toFixed(1)})`
                        };
                    }
                }
                // 阴谋：
                else if (tier >= 2 || timeBonus > 0 || greedScore > 0) {
                    // stackTacticalVal 为负数，取绝对值表示"我有多想害它"
                    let nS = Math.abs(stackTacticalVal) + economicEv + timeBonus + greedScore - cost;

                    if(model.factories && model.factories.some(f => f.layer===l && f.index===i-1)) nS += 3;

                    if (nS > maxS) {
                        maxS = nS;
                        let descType = type === 'move' ? '' : (type==='promote' ? '[升]' : '[降]');
                        best = {
                            type:'strategy', layer:l, index:i, stratType:-1,
                            score:nS,
                            desc:`阴谋${descType}(率:${(prob*100).toFixed(0)}% 赚:${economicEv.toFixed(2)} 战:${Math.abs(stackTacticalVal).toFixed(2)} 贪:${greedScore.toFixed(1)})`
                        };
                    }
                }
            }
        });
        return best;
    }
}
window.QingyunAI = QingyunAI;