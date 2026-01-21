// js/modules/games/game_qingyun_model.js
// 青云赛 - 数据模型 v3.7 (新增随机AI名字库)

class QingyunModel {
    constructor() {
        this.LAYERS = [
            { id: 0, name: 'outer', steps: 18 },
            { id: 1, name: 'mid', steps: 17 },
            { id: 2, name: 'inner', steps: 16 }
        ];
        this.COLORS = ['red', 'blue', 'green', 'yellow', 'white'];

        // 【新增】AI 名字库 (按难度等级分类)
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
        this.roundBetDeck = {};
        this.diceDeck = [];
        this.finalBets = {
            winner: [],
            loser: []
        };
        this.gameHistory = [];
        this.strategyMap = {};
        this.config = null;
    }

    initGame(tier, playerMoney) {
        const config = {
            1: { entry: 5000, chipRate: 50, aiLv: 4, name: "低级场" },
            2: { entry: 30000, chipRate: 250, aiLv: 5, name: "中级场" },
            3: { entry: 50000, chipRate: 500, aiLv: 6, name: "高级场" }
        }[tier];

        if (!config) return { success: false, msg: "场次错误" };
        if (playerMoney < config.entry) return { success: false, msg: `资金不足，需要 ${config.entry} 文` };

        this.config = config;
        this.jackpot = config.entry * 4;

        // 【修改点】随机抽取 AI 名字
        const pool = this.AI_NAMES[config.aiLv] || this.AI_NAMES[4];
        const selectedNames = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

        const createPlayer = (id, name, isHuman) => ({
            id, name, isHuman,
            chips: 50,
            chipVal: config.chipRate,
            finalCards: [...this.COLORS],
            roundCards: [],
            hasStrategy: true
        });

        this.players = [
            createPlayer('player', '你', true),
            createPlayer('ai_1', selectedNames[0], false),
            createPlayer('ai_2', selectedNames[1], false),
            createPlayer('ai_3', selectedNames[2], false)
        ];

        this.turnIndex = Math.floor(Math.random() * 4);
        this.roundStarter = this.turnIndex;

        this.pieces = this.COLORS.map(c => ({
            color: c, layer: 0, index: Math.floor(Math.random() * 3), stackPos: 0
        }));
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
        this.COLORS.forEach(c => this.roundBetDeck[c] = [5, 3, 2, 2]);
        this.diceDeck = [...this.COLORS];
        this.players.forEach(p => p.roundCards = []);
        this.strategyMap = {};
        this.players.forEach(p => p.hasStrategy = true);
    }

    checkStrategyValid(layer, index) {
        const hasPiece = this.pieces.some(p => p.layer === layer && p.index === index);
        if (hasPiece) return false;
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
        if (!piece) return { finished: false };

        const result = this._executeSingleMove(piece, type, steps);

        if (!result.finished && (type === 'move' || type === 'promote' || type === 'demote')) {
            const key = `${piece.layer}_${piece.index}`;
            const trap = this.strategyMap[key];

            if (trap) {
                const owner = this.players.find(p => p.id === trap.ownerId);
                if (owner) owner.chips += 1;
                return this._executeSingleMove(piece, 'move', trap.type, true, trap.ownerId);
            }
        }
        return result;
    }

    _executeSingleMove(piece, type, steps, isTriggered = false, trapOwnerId = null) {
        const stack = this.pieces.filter(p =>
            p.layer === piece.layer &&
            p.index === piece.index &&
            p.stackPos >= piece.stackPos
        );

        let tLayer = piece.layer;
        let tIndex = piece.index;
        let isWin = false;

        if (type === 'promote') { tLayer++; if (tLayer > 2) isWin = true; }
        else if (type === 'demote') { tLayer = Math.max(0, tLayer - 1); }
        else if (type === 'move') { tIndex += steps; }

        if (!isWin && tLayer <= 2) {
            if (tIndex < 0) tIndex = 0;
            if (tIndex >= this.LAYERS[tLayer].steps) isWin = true;
        }

        if (isWin) {
            this.state = 'finished';
            return {
                finished: true,
                winnerStack: stack,
                triggerInfo: isTriggered ? { type: steps, ownerId: trapOwnerId } : null
            };
        }

        const destPieces = this.pieces.filter(p => p.layer === tLayer && p.index === tIndex);
        let baseHeight = destPieces.length;

        stack.sort((a,b) => a.stackPos - b.stackPos);
        stack.forEach((p, i) => {
            p.layer = tLayer;
            p.index = tIndex;
            p.stackPos = baseHeight + i;
        });

        return {
            finished: false,
            triggerInfo: isTriggered ? { type: steps, ownerId: trapOwnerId } : null
        };
    }

    _recalculateStackHeights() {
        const map = {};
        this.pieces.forEach(p => {
            const k = `${p.layer}_${p.index}`;
            if(!map[k]) map[k] = [];
            map[k].push(p);
        });
        for(let k in map) {
            map[k].sort((a,b) => a.stackPos - b.stackPos);
            map[k].forEach((p, i) => p.stackPos = i);
        }
    }

    getRankList() {
        return [...this.pieces].sort((a, b) => {
            const lenA = this.LAYERS[a.layer].steps;
            const lenB = this.LAYERS[b.layer].steps;
            const ratioA = a.index / lenA;
            const ratioB = b.index / lenB;
            if (Math.abs(ratioA - ratioB) > 0.0001) {
                return ratioB - ratioA;
            }
            if (a.layer !== b.layer) return b.layer - a.layer;
            return b.stackPos - a.stackPos;
        });
    }

    recordHistory(events = []) {
        const p = this.players[0];
        this.gameHistory.push({
            round: this.round,
            chips: p.chips,
            events: events
        });
    }
}
window.QingyunModel = QingyunModel;