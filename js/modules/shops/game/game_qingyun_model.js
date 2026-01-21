// js/modules/games/game_qingyun_model.js
// 青云赛 - 数据模型层 (Model)
// 职责：管理游戏状态、数值计算、堆叠逻辑、胜负判定

class QingyunModel {
    constructor() {
        // 赛道配置：层级与步数
        this.LAYERS = [
            { id: 0, name: 'outer', steps: 18 }, // 外朝
            { id: 1, name: 'mid', steps: 17 },   // 中朝
            { id: 2, name: 'inner', steps: 16 }  // 内廷
        ];
        this.COLORS = ['red', 'blue', 'green', 'yellow', 'white'];

        this.reset();
    }

    reset() {
        this.state = 'setup'; // setup, playing, finished
        this.jackpot = 0;
        this.round = 1;
        this.turnIndex = 0;

        // 玩家数据
        this.players = [];

        // 棋子数据 { color, layer, index, stackPos }
        this.pieces = [];

        // 卡池
        this.roundBetDeck = {};
        this.diceDeck = [];

        // 最终押注
        this.finalBets = { winner: [], loser: [] };
    }

    initGame(tier, playerMoney) {
        const config = {
            1: { entry: 5000, chipVal: 50, aiLv: 4 },
            2: { entry: 30000, chipVal: 250, aiLv: 5 },
            3: { entry: 50000, chipVal: 500, aiLv: 6 }
        }[tier];

        if (playerMoney < config.entry) return { success: false, msg: "资金不足" };

        // 1. 资金入池
        this.jackpot += config.entry * 4; // 1玩家+3AI

        // 2. 初始化角色
        this.players = [
            { id: 'player', name: '你', isHuman: true, chips: 50, chipVal: config.chipVal, finalCards: [...this.COLORS], roundCards: [] },
            { id: 'ai_1', name: '千手鬼', isHuman: false, chips: 50, chipVal: config.chipVal, finalCards: [...this.COLORS], roundCards: [] },
            { id: 'ai_2', name: '神算子', isHuman: false, chips: 50, chipVal: config.chipVal, finalCards: [...this.COLORS], roundCards: [] },
            { id: 'ai_3', name: '笑面佛', isHuman: false, chips: 50, chipVal: config.chipVal, finalCards: [...this.COLORS], roundCards: [] }
        ];

        // 3. 初始化棋子 (随机叠在外圈起点附近)
        this.pieces = this.COLORS.map(c => ({
            color: c,
            layer: 0,
            index: Math.floor(Math.random() * 3), // 0-2格
            stackPos: 0
        }));
        this._recalculateStackHeights();

        // 4. 洗牌
        this._resetRoundDeck();

        this.state = 'playing';
        return { success: true, cost: config.entry };
    }

    _resetRoundDeck() {
        this.roundBetDeck = {};
        this.COLORS.forEach(c => {
            this.roundBetDeck[c] = [5, 3, 2, 2];
        });
        this.diceDeck = [...this.COLORS];
        this.players.forEach(p => p.roundCards = []);
    }

    // 核心逻辑：移动与携带
    movePieceLogic(color, type, steps) {
        const piece = this.pieces.find(p => p.color === color);
        if (!piece) return;

        // 1. 找到所有被携带的棋子 (同层、同格、stackPos >= 当前棋子)
        const stack = this.pieces.filter(p =>
            p.layer === piece.layer &&
            p.index === piece.index &&
            p.stackPos >= piece.stackPos
        );

        // 2. 计算目标位置
        let tLayer = piece.layer;
        let tIndex = piece.index;
        let isWin = false;

        if (type === 'promote') { // 升
            tLayer++;
            // 保持进度比例或直接平移？规则是平移index
            if (tLayer > 2) isWin = true;
        } else if (type === 'demote') { // 降
            tLayer--;
            if (tLayer < 0) tLayer = 0; // 碰壁
        } else if (type === 'stay') {
            // 原地不动
        } else { // 正常移动
            tIndex += steps;
        }

        // 检查每一层的终点
        if (!isWin && tLayer <= 2) {
            if (tIndex >= this.LAYERS[tLayer].steps) {
                isWin = true;
            }
        }

        // 3. 执行移动更新
        if (isWin) {
            this.state = 'finished';
            return { finished: true, winnerStack: stack };
        }

        // 找到目标格子上现有的棋子数量 (作为新stack的基底)
        const destPieces = this.pieces.filter(p => p.layer === tLayer && p.index === tIndex);
        let baseHeight = destPieces.length;

        // 保持相对顺序搬运过去
        stack.sort((a,b) => a.stackPos - b.stackPos);
        stack.forEach((p, i) => {
            p.layer = tLayer;
            p.index = tIndex;
            p.stackPos = baseHeight + i;
        });

        // 离开的格子需要重新整理 stackPos (虽然逻辑上不需要，但为了数据整洁)
        this._recalculateStackHeights();

        return { finished: false };
    }

    _recalculateStackHeights() {
        const map = {};
        this.pieces.forEach(p => {
            const key = `${p.layer}_${p.index}`;
            if(!map[key]) map[key] = [];
            map[key].push(p);
        });
        for(let k in map) {
            map[k].sort((a,b) => a.stackPos - b.stackPos); // 应该按之前的顺序排序，这里简化
            map[k].forEach((p, i) => p.stackPos = i);
        }
    }

    // 获取当前排名 (用于结算)
    getRankList() {
        return [...this.pieces].sort((a, b) => {
            if (a.layer !== b.layer) return b.layer - a.layer; // 内圈 > 外圈
            if (a.index !== b.index) return b.index - a.index; // 走的远 > 走的近
            return b.stackPos - a.stackPos; // 叠的高 > 叠的低
        });
    }
}

window.QingyunModel = QingyunModel;