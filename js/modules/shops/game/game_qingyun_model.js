// js/modules/games/game_qingyun_model.js
// 青云赛 - 数据模型 v4.9 (增加计谋盈利统计 strategyEarnings)

class QingyunModel {
    constructor() {
        this.LAYERS = [
            { id: 0, name: 'outer', steps: 18 },
            { id: 1, name: 'mid', steps: 17 },
            { id: 2, name: 'inner', steps: 16 }
        ];
        this.COLORS = ['red', 'blue', 'green', 'yellow', 'white'];

        this.AI_NAMES = {
            4: ['赵阿大', '钱掌柜', '孙屠户', '李秀才', '周货郎', '吴账房', '郑捕头', '王铁匠', '冯酒保', '陈脚夫'],
            5: ['玉面郎君', '铁面判官', '追风侠', '夺命书生', '赛孟尝', '智多星', '入云龙', '没羽箭', '小李广', '混江龙'],
            6: ['千手鬼', '神算子', '笑面佛', '摘星手', '鬼手王', '天机老人', '逍遥散人', '龙王', '财神', '不败战神']
        };

        this.reset();
    }

    reset() {
        this.state = 'setup';
        this.jackpot = 0;
        this.round = 1;
        this.turnIndex = 0;
        this.roundStarter = 0;
        this.players = [];
        this.pieces = [];
        this.factories = [];
        this.roundBetDeck = {};
        this.diceDeck = [];
        this.finalBets = { winner: [], loser: [] };
        this.gameHistory = [];
        this.currentRoundEvents = [];
        this.strategyMap = {};
        this.roundStrategyEarnings = {};
        this.config = null;
    }

    initGame(tier, playerMoney) {
        const config = {
            1: {id: 1, entry: 5000, chipRate: 50, aiLv: 4, name: "低级场" },
            2: {id: 2, entry: 30000, chipRate: 250, aiLv: 5, name: "中级场" },
            3: {id: 3, entry: 50000, chipRate: 500, aiLv: 6, name: "高级场" }
        }[tier];

        if (!config) return { success: false, msg: "场次错误" };
        if (playerMoney < config.entry) return { success: false, msg: `资金不足，需要 ${config.entry} 文` };

        this.config = config;
        this.jackpot = config.entry * 4;

        const pool = this.AI_NAMES[config.aiLv] || this.AI_NAMES[4];
        const selectedNames = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

        // 【修改点】初始化 strategyEarnings 为 0
        this.players = [
            { id: 'player', name: '你', isHuman: true, chips: 50, chipVal: config.chipRate, finalCards: [...this.COLORS], roundCards: [], hasStrategy: true, strategyEarnings: 0 },
            { id: 'ai_1', name: selectedNames[0], isHuman: false, chips: 50, chipVal: config.chipRate, finalCards: [...this.COLORS], roundCards: [], hasStrategy: true, strategyEarnings: 0 },
            { id: 'ai_2', name: selectedNames[1], isHuman: false, chips: 50, chipVal: config.chipRate, finalCards: [...this.COLORS], roundCards: [], hasStrategy: true, strategyEarnings: 0 },
            { id: 'ai_3', name: selectedNames[2], isHuman: false, chips: 50, chipVal: config.chipRate, finalCards: [...this.COLORS], roundCards: [], hasStrategy: true, strategyEarnings: 0 }
        ];

        this.turnIndex = Math.floor(Math.random() * 4);
        this.roundStarter = this.turnIndex;

        this.pieces = this.COLORS.map(c => ({
            color: c, layer: 0, index: Math.floor(Math.random() * 3), stackPos: 0, isFinished: false
        }));

        if (tier >= 2) {
            this.factories = [
                { name: '西厂', color: 'west_factory', layer: 0, index: 17 },
                { name: '东厂', color: 'east_factory', layer: 2, index: 15 }
            ];
        }

        this._recalculateStackHeights();
        this.state = 'ready';
        this.recordHistory([], "开局");

        return { success: true, cost: config.entry };
    }

    startGame() {
        if (this.state !== 'ready') return;
        this._resetRoundDeck();
        this.state = 'playing';
    }

    _resetRoundDeck() {
        this.roundBetDeck = {};
        this.COLORS.forEach(c => this.roundBetDeck[c] = [6, 4, 3, 3]);
        this.diceDeck = [...this.COLORS];
        this.drawnDiceRecords = [];
        this.players.forEach(p => p.roundCards = []);
        this.strategyMap = {};
        this.players.forEach(p => p.hasStrategy = true);

        this.roundStrategyEarnings = {};
        this.players.forEach(p => this.roundStrategyEarnings[p.id] = 0);
    }

    checkStrategyValid(layer, index) {
        const hasPiece = this.pieces.some(p => p.layer === layer && p.index === index);
        if (hasPiece) return false;

        const hasFactory = this.factories.some(f => f.layer === layer && f.index === index);
        if (hasFactory) return false;

        if (this.strategyMap[`${layer}_${index}`]) return false;

        const prevKey = `${layer}_${index - 1}`;
        const nextKey = `${layer}_${index + 1}`;
        if (this.strategyMap[prevKey] || this.strategyMap[nextKey]) return false;

        return true;
    }

    placeStrategy(playerId, layer, index, type) {
        if (!this.checkStrategyValid(layer, index)) return false;
        this.strategyMap[`${layer}_${index}`] = { ownerId: playerId, type: type };
        const p = this.players.find(pl => pl.id === playerId);
        if(p) p.hasStrategy = false;
        return true;
    }

    movePieceLogic(color, type, steps) {
        const piece = this.pieces.find(p => p.color === color);
        if (!piece || piece.isFinished) return { finished: false, path: [] };

        const result = this._executeSingleMove(piece, type, steps);

        if (!result.finished && (type === 'move' || type === 'promote' || type === 'demote')) {
            const key = `${piece.layer}_${piece.index}`;
            const trap = this.strategyMap[key];

            if (trap) {
                const owner = this.players.find(p => p.id === trap.ownerId);
                if (owner) {
                    owner.chips += 4;
                    // 【修改点】累加总盈利
                    owner.strategyEarnings = (owner.strategyEarnings || 0) + 4;

                    this.roundStrategyEarnings[owner.id] = (this.roundStrategyEarnings[owner.id] || 0) + 4;
                    this.currentRoundEvents.push(`计谋收益(+4)`);
                }
                const trapRes = this._executeSingleMove(piece, 'move', trap.type, true, trap.ownerId);
                result.path = result.path.concat(trapRes.path);
                result.finished = trapRes.finished;
                result.winnerStack = trapRes.winnerStack;
                result.triggerInfo = { type: trap.type, ownerId: trap.ownerId };
            }
        }
        return result;
    }

    _executeSingleMove(piece, type, steps, isTriggered = false, trapOwnerId = null) {
        const movingPieces = this.pieces.filter(p => p.layer === piece.layer && p.index === piece.index && p.stackPos >= piece.stackPos);
        const movingFactories = this.factories.filter(f => f.layer === piece.layer && f.index === piece.index && f.stackPos > piece.stackPos);
        const movingStack = [...movingPieces, ...movingFactories];
        movingStack.sort((a,b) => a.stackPos - b.stackPos);

        let tLayer = piece.layer; let tIndex = piece.index; let isWin = false; const path = [];

        if (type === 'promote') {
            if (tLayer < 2) {
                const ratio = tIndex / this.LAYERS[tLayer].steps;
                tLayer++;
                tIndex = Math.floor(ratio * this.LAYERS[tLayer].steps);
                path.push({ layer: tLayer, index: tIndex });
            }
        } else if (type === 'demote') {
            if (tLayer > 0) {
                const ratio = tIndex / this.LAYERS[tLayer].steps;
                tLayer--;
                tIndex = Math.floor(ratio * this.LAYERS[tLayer].steps);
                path.push({ layer: tLayer, index: tIndex });
            }
        } else if (type === 'move') {
            const direction = steps > 0 ? 1 : -1;
            let movesLeft = Math.abs(steps);
            let tempIndex = tIndex;
            let tempLayer = tLayer;

            while (movesLeft > 0) {
                if (direction > 0) {
                    tempIndex++;
                    const currentMax = this.LAYERS[tempLayer].steps - 1;
                    if (tempIndex > currentMax) {
                        if (tempLayer === 0) { tempLayer = 1; tempIndex = this.LAYERS[1].steps - 1; }
                        else if (tempLayer === 1) { tempLayer = 2; tempIndex = this.LAYERS[2].steps - 1; }
                        else if (tempLayer === 2) { isWin = true; path.push({ layer: 2, index: 'finish' }); break; }
                    }
                } else {
                    tempIndex--;
                    if (tempIndex < 0) tempIndex = 0;
                }
                path.push({ layer: tempLayer, index: tempIndex });
                movesLeft--;
            }
            tLayer = tempLayer;
            tIndex = tempIndex;
        }

        if (isWin) {
            this.state = 'finished';
            movingPieces.forEach(p => p.isFinished = true);
            return { finished: true, winnerStack: movingPieces, triggerInfo: isTriggered ? { type: steps, ownerId: trapOwnerId } : null, path: path };
        }

        const staticAtDest = [...this.pieces, ...this.factories].filter(p => p.layer === tLayer && p.index === tIndex && !movingStack.includes(p));
        const baseHeight = staticAtDest.length;

        movingStack.forEach((p, i) => {
            p.layer = tLayer;
            p.index = tIndex;
            p.stackPos = baseHeight + i;
        });

        return { finished: false, triggerInfo: isTriggered ? { type: steps, ownerId: trapOwnerId } : null, path: path };
    }

    _recalculateStackHeights() {
        const map = {};
        [...this.pieces, ...this.factories].forEach(p => { const k = `${p.layer}_${p.index}`; if(!map[k]) map[k] = []; map[k].push(p); });
        for(let k in map) { map[k].sort((a,b) => (a.stackPos || 0) - (b.stackPos || 0)); map[k].forEach((p, i) => p.stackPos = i); }
    }

    getRankList() {
        return [...this.pieces].sort((a, b) => {
            if (a.isFinished && !b.isFinished) return -1;
            if (!a.isFinished && b.isFinished) return 1;
            if (a.isFinished && b.isFinished) return 0;

            const offsets = [3, 2, 1];
            const scoreA = (a.index + 1) / (this.LAYERS[a.layer].steps + offsets[a.layer]);
            const scoreB = (b.index + 1) / (this.LAYERS[b.layer].steps + offsets[b.layer]);

            if (Math.abs(scoreA - scoreB) > 0.0001) {
                return scoreB - scoreA;
            }
            return (b.stackPos || 0) - (a.stackPos || 0);
        });
    }

    recordHistory(events = []) {
        const p = this.players[0];
        this.gameHistory.push({ round: this.round, chips: p.chips, events: events });
    }

    moveFactories() {
        if (!this.factories || this.factories.length === 0) return [];

        const logs = [];
        const FACTORY_DICE = [
            {n:'德', t:'move', v:3}, {n:'才', t:'move', v:2}, {n:'功', t:'move', v:1},
            {n:'脏', t:'stay', v:0}, {n:'升', t:'promote', v:0}, {n:'降', t:'demote', v:0}
        ];

        this.factories.forEach(f => {
            const faceIdx = Math.floor(Math.random() * FACTORY_DICE.length);
            const res = FACTORY_DICE[faceIdx];
            const type = res.t;
            const steps = res.v;

            const path = [];
            let carriedPieces = this.pieces.filter(p => !p.isFinished && p.layer === f.layer && p.index === f.index && p.stackPos > f.stackPos);
            const carriedColors = carriedPieces.map(p => p.color);

            console.log(`[QY Debug] ${f.name} (L:${f.layer}, I:${f.index}) 掷出 ${res.n} (${type})`);

            if (type === 'promote') {
                if (f.layer < 2) {
                    const ratio = f.index / this.LAYERS[f.layer].steps;
                    f.layer++;
                    f.index = Math.floor(ratio * this.LAYERS[f.layer].steps);
                    path.push({ layer: f.layer, index: f.index });
                    carriedPieces.forEach(p => { p.layer = f.layer; p.index = f.index; });
                }
            } else if (type === 'demote') {
                if (f.layer > 0) {
                    const ratio = f.index / this.LAYERS[f.layer].steps;
                    f.layer--;
                    f.index = Math.floor(ratio * this.LAYERS[f.layer].steps);
                    path.push({ layer: f.layer, index: f.index });
                    carriedPieces.forEach(p => { p.layer = f.layer; p.index = f.index; });
                }
            } else if (type === 'move') {
                let remaining = steps;
                while (remaining > 0) {
                    f.index--;
                    if (f.index < 0) {
                        if (carriedPieces.length > 0) {
                            carriedPieces.forEach(p => { p.layer = f.layer; p.index = 0; });
                            carriedPieces = [];
                        }
                        if (f.layer === 2) f.layer = 1; else if (f.layer === 1) f.layer = 0; else if (f.layer === 0) f.layer = 2;
                        f.index = this.LAYERS[f.layer].steps - 1;
                    } else {
                        carriedPieces.forEach(p => { p.layer = f.layer; p.index = f.index; });
                    }
                    path.push({ layer: f.layer, index: f.index });
                    remaining--;
                }
            }

            const key = `${f.layer}_${f.index}`;
            const trap = this.strategyMap[key];
            let trapInfo = null;

            if (trap) {
                const owner = this.players.find(p => p.id === trap.ownerId);
                if (owner) {
                    owner.chips += 4;
                    // 【修改点】累加总盈利
                    owner.strategyEarnings = (owner.strategyEarnings || 0) + 4;

                    this.roundStrategyEarnings[owner.id] = (this.roundStrategyEarnings[owner.id] || 0) + 4;
                    this.currentRoundEvents.push(`计谋收益(+4)`);
                }

                const trapStep = (trap.type === 1) ? -1 : 1;
                const trapName = trap.type === 1 ? '阳谋' : '阴谋';
                const effectText = trap.type === 1 ? '继续向前' : '被迫后退';

                f.index += trapStep;
                let currentCarried = carriedPieces.filter(p => p.layer === f.layer && p.index === f.index - trapStep);

                if (f.index < 0) f.index = 0;
                else if (f.index >= this.LAYERS[f.layer].steps) f.index = this.LAYERS[f.layer].steps - 1;

                currentCarried.forEach(p => { p.layer = f.layer; p.index = f.index; });
                path.push({ layer: f.layer, index: f.index });

                trapInfo = { name: trapName, effect: effectText, owner: owner ? owner.name : '未知' };
            }

            logs.push({ name: f.name, rollName: res.n, type: type, steps: steps, path: path, carried: carriedColors, trap: trapInfo });
        });

        this._recalculateStackHeights();
        return logs;
    }
}
window.QingyunModel = QingyunModel;