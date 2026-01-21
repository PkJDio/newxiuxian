// js/modules/games/game_qingyun_ai.js
// 青云赛 - AI 决策核心 (AI Brain) v2.0 - 均等概率版
// 核心算法：蒙特卡洛模拟 (Monte Carlo Simulation)

class QingyunAI {
    constructor() {
        // 骰子六面配置 (默认每一面概率相等，为 1/6)
        this.DICE_FACES = [
            { name: '德', type: 'move', steps: 3 },
            { name: '才', type: 'move', steps: 2 },
            { name: '功', type: 'move', steps: 1 },
            { name: '脏', type: 'stay', steps: 0 },
            { name: '升', type: 'promote', steps: 0 },
            { name: '降', type: 'demote', steps: 0 }
        ];

        // 模拟次数 (保持 500 次以获得较好的准确度)
        this.SIMULATION_COUNT = 500;
    }

    /**
     * AI 决策入口
     */
    decide(model, aiPlayer, config) {
        // 1. 根据智商调整模拟次数
        const simCount = config.canPredictDice ? this.SIMULATION_COUNT : 50;

        // 2. 运行蒙特卡洛模拟
        const winProbs = this.runMonteCarlo(model, simCount);

        // 3. 评估行动
        const actions = [];

        // --- A: 拿本轮下注卡 ---
        for (let color in model.roundBetDeck) {
            const stack = model.roundBetDeck[color];
            if (stack.length > 0) {
                const cardVal = stack[0];
                // 简单估值：胜率 * 卡值 - 成本
                const ev = (winProbs[color].win * cardVal + winProbs[color].second * 1) * 10 - 10;
                actions.push({ type: 'takeBet', color: color, score: ev });
            }
        }

        // --- B: 掷骰子 ---
        if (model.diceDeck.length > 0) {
            const myInterests = this._calculateInterests(aiPlayer, model);

            model.diceDeck.forEach(diceColor => {
                const impactScore = this._evaluateRollImpact(diceColor, model, myInterests);

                // 基础分 15 + 策略分 + AI偏好
                let rollScore = 15 + impactScore;
                if (config.rollBias) rollScore += config.rollBias;

                actions.push({ type: 'roll', color: diceColor, score: rollScore });
            });
        }

        // --- C: 最终下注 ---
        if (aiPlayer.chips >= 10) {
            for (let color of model.COLORS) {
                if (aiPlayer.finalCards.includes(color)) {
                    const prob = winProbs[color].win;
                    const isLateGame = model.pieces.some(p => p.layer === 2); // 进内圈算后期
                    if (isLateGame && prob > config.betThreshold) {
                        const ev = (40 * prob * 10) - 50;
                        actions.push({ type: 'finalBet', color: color, score: ev });
                    }
                }
            }
        }

        // 4. 排序与选择
        actions.sort((a, b) => b.score - a.score);

        if (actions.length === 0 || aiPlayer.chips <= 0) {
            return { type: 'skip', score: 0 };
        }

        // 犯错机制
        if (Math.random() < config.errorRate && actions.length > 1) {
            const idx = Math.floor(Math.random() * Math.min(3, actions.length));
            return actions[idx];
        }

        return actions[0];
    }

    // ==========================================
    // 蒙特卡洛模拟引擎 (均等概率版)
    // ==========================================

    runMonteCarlo(realModel, iterations) {
        const stats = {};
        realModel.COLORS.forEach(c => stats[c] = { win: 0, second: 0 });

        const baseState = {
            pieces: JSON.parse(JSON.stringify(realModel.pieces)),
            diceDeck: [...realModel.diceDeck],
            layers: realModel.LAYERS
        };

        for (let i = 0; i < iterations; i++) {
            this._simulateOneGame(baseState, stats);
        }

        const results = {};
        realModel.COLORS.forEach(c => {
            results[c] = {
                win: stats[c].win / iterations,
                second: stats[c].second / iterations
            };
        });
        return results;
    }

    _simulateOneGame(baseState, stats) {
        let pieces = JSON.parse(JSON.stringify(baseState.pieces));
        let deck = [...baseState.diceDeck];

        let winner = null;
        let loopGuard = 0;

        while (!winner && loopGuard < 100) {
            loopGuard++;

            // 1. 补充骰子堆 (模拟未来回合)
            if (deck.length === 0) {
                deck = ['red', 'blue', 'green', 'yellow', 'white'];
            }

            // 2. 随机抽一个骰子颜色
            const rndIdx = Math.floor(Math.random() * deck.length);
            const color = deck.splice(rndIdx, 1)[0];

            // 3. 随机掷骰子结果 (【修改点】使用均等概率)
            // 直接从 6 个面中随机选一个
            const faceIdx = Math.floor(Math.random() * this.DICE_FACES.length);
            const result = this.DICE_FACES[faceIdx];

            // 4. 执行极速移动逻辑
            winner = this._fastMoveLogic(pieces, color, result.type, result.steps, baseState.layers);
        }

        if (winner) {
            stats[winner.color].win++;
            const rank = this._fastGetRank(pieces);
            if (rank[1]) stats[rank[1].color].second++;
        }
    }

    // 极速移动逻辑 (保持不变，处理堆叠)
    _fastMoveLogic(pieces, color, type, steps, layers) {
        const piece = pieces.find(p => p.color === color);
        const stack = pieces.filter(p =>
            p.layer === piece.layer &&
            p.index === piece.index &&
            p.stackPos >= piece.stackPos
        );

        let tLayer = piece.layer;
        let tIndex = piece.index;
        let finished = false;

        if (type === 'promote') {
            tLayer++;
            if (tLayer > 2) finished = true;
        } else if (type === 'demote') {
            tLayer = Math.max(0, tLayer - 1);
        } else if (type === 'move') {
            tIndex += steps;
        }

        if (!finished && tLayer <= 2) {
            if (tIndex >= layers[tLayer].steps) finished = true;
        }

        if (finished) {
            stack.sort((a,b) => a.stackPos - b.stackPos);
            return stack[stack.length - 1];
        }

        const destPieces = pieces.filter(p => p.layer === tLayer && p.index === tIndex);
        let baseHeight = destPieces.length;

        stack.sort((a,b) => a.stackPos - b.stackPos);
        stack.forEach((p, i) => {
            p.layer = tLayer;
            p.index = tIndex;
            p.stackPos = baseHeight + i;
        });

        return null;
    }

    _fastGetRank(pieces) {
        return [...pieces].sort((a, b) => {
            if (a.layer !== b.layer) return b.layer - a.layer;
            if (a.index !== b.index) return b.index - a.index;
            return b.stackPos - a.stackPos;
        });
    }

    // 辅助计算
    _calculateInterests(aiPlayer, model) {
        const interests = {};
        model.COLORS.forEach(c => interests[c] = 0);
        aiPlayer.roundCards.forEach(c => interests[c.color] += c.val);
        aiPlayer.finalCards.forEach(c => interests[c] += 2);
        return interests;
    }

    _evaluateRollImpact(diceColor, model, interests) {
        const piece = model.pieces.find(p => p.color === diceColor);
        if (!piece) return 0;

        const stack = model.pieces.filter(p =>
            p.layer === piece.layer &&
            p.index === piece.index &&
            p.stackPos >= piece.stackPos
        );

        let score = 0;
        stack.forEach(p => {
            if (interests[p.color] > 0) {
                // 均等概率下，期望步数是 (3+2+1+0+0+0)/6 = 1.0，但还有升降层
                // 这里简单给个权重即可
                score += interests[p.color] * 2;
            }
        });
        return score;
    }
}

window.QingyunAI = QingyunAI;