// js/action/utils_gamble.js
// 赌博系统核心工具类 v4.1 - 适配青云赛 & 存档结构自愈版

const UtilsGamble = {
    // ================= 1. 基础配置 =================
    NPC_POOLS: {
        1: [{name:"村口二傻",title:"初出茅庐",avatar:"🥴"},{name:"隔壁阿福",title:"初出茅庐",avatar:"👶"},{name:"醉酒汉",title:"神志不清",avatar:"🍶"},{name:"偷懒农夫",title:"消遣时光",avatar:"👨‍🌾"},{name:"流浪汉",title:"碰碰运气",avatar:"🧟"}],
        2: [{name:"落魄书生",title:"略懂皮毛",avatar:"📜"},{name:"卖菜大婶",title:"斤斤计较",avatar:"👩‍🌾"},{name:"杀猪屠夫",title:"胆大心细",avatar:"🐷"},{name:"算命瞎子",title:"掐指一算",avatar:"🕶️"},{name:"游方郎中",title:"江湖骗子",avatar:"💊"}],
        3: [{name:"秦军百夫长",title:"杀伐果断",avatar:"⚔️"},{name:"镖局趟子手",title:"走南闯北",avatar:"🐎"},{name:"衙门捕快",title:"目光如炬",avatar:"🕵️"},{name:"巡城校尉",title:"威风凛凛",avatar:"🛡️"},{name:"退伍老兵",title:"身经百战",avatar:"👴"}],
        4: [{name:"市井老手",title:"精于算计",avatar:"🧮"},{name:"当铺掌柜",title:"眼光独到",avatar:"👓"},{name:"青楼老板",title:"阅人无数",avatar:"👘"},{name:"丝绸商人",title:"圆滑世故",avatar:"🧊"},{name:"赌场看场",title:"熟知套路",avatar:"💪"}],
        5: [{name:"富贾沈万",title:"腰缠万贯",avatar:"💰"},{name:"钱庄老板",title:"财大气粗",avatar:"🏦"},{name:"盐商巨头",title:"富甲一方",avatar:"🧂"},{name:"珠宝大亨",title:"挥金如土",avatar:"💎"},{name:"退休御厨",title:"尝遍百味",avatar:"👨‍🍳"}],
        6: [{name:"六博国手",title:"当世棋圣",avatar:"👑"},{name:"隐世棋痴",title:"不败神话",avatar:"🧙‍♂️"},{name:"宫廷博待",title:"大内高手",avatar:"🏯"},{name:"天机老人",title:"算尽天机",avatar:"☯️"},{name:"鬼手张三",title:"千术通神",avatar:"👻"}]
    },

    // 初始携带金额范围
    BASE_MONEY_CONFIG: {
        1: [500, 1000],
        2: [1000, 2500],
        3: [4000, 8000],
        4: [10000, 20000],
        5: [30000, 60000],
        6: [100000, 250000]
    },

    // 抽样权重池
    POOL_DISTRIBUTION: [
        { level: 1, count: 6 },
        { level: 2, count: 5 },
        { level: 3, count: 4 },
        { level: 4, count: 3 },
        { level: 5, count: 2 },
        { level: 6, count: 1 }
    ],

    // 城镇配置: [总人数, 最高稀有度]
    TOWN_CONFIG: {
        'city': { count: 10, maxLv: 6 },
        'town': { count: 6, maxLv: 5 },
        'village': { count: 4, maxLv: 4 }
    },

    // ================= 2. 存档检查与生成 (核心修复) =================

    /**
     * 核心入口：检查并初始化当月当城存档
     * 具备“自愈”能力：如果发现缺了某个游戏的数据（例如旧档没有青云赛），会自动补全
     */
    checkAndInitGambleData: function(townId, townType = 'village') {
        if (!window.player.gambleStates) window.player.gambleStates = {};
        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;

        // 1. 初始化月份结构
        if (!window.player.gambleStates[monthKey]) {
            window.player.gambleStates[monthKey] = {};
            this._cleanupOldArchives(monthKey); // 清理旧存档
        }

        const config = this.TOWN_CONFIG[townType] || this.TOWN_CONFIG['village'];

        // 2. 检查城镇数据是否存在
        if (!window.player.gambleStates[monthKey][townId]) {
            // --- 情况A：完全没有该城数据，全新生成 ---
            console.log(`[Gamble] 初始化城镇存档: ${townId} (${monthKey})`);
            const lastMultiplier = this._getLastMonthMultiplier(townId);
            const rosterData = this._generateMonthlyRoster(townId, monthKey, config, lastMultiplier);

            window.player.gambleStates[monthKey][townId] = {
                allMoney: rosterData.totalAll,
                haveMoney: rosterData.totalAll,
                totalWinMoney: 0,
                liubo: { npc: rosterData.list.liubo },
                chupu: { npc: rosterData.list.chupu },
                shengguantu: { npc: rosterData.list.shengguantu },
                qingyun: { npc: rosterData.list.qingyun } // 新增
            };
            if(window.saveGame) window.saveGame();
        } else {
            // --- 情况B：有数据，但要检查是否缺失子项 (自愈逻辑) ---
            const townData = window.player.gambleStates[monthKey][townId];
            const requiredGames = ['liubo', 'chupu', 'shengguantu', 'qingyun'];
            let hasChanges = false;
            let tempRoster = null; // 懒加载，只有发现缺项时才生成

            requiredGames.forEach(game => {
                // 如果缺了这个游戏的 key，或者 key 存在但没 npc 列表
                if (!townData[game] || !townData[game].npc) {
                    console.log(`[Gamble] 检测到旧存档缺失游戏 [${game}]，正在自动补全...`);

                    // 生成临时数据 (为了保持随机数种子一致性，我们重新跑一次生成算法)
                    if (!tempRoster) {
                        const lastMultiplier = this._getLastMonthMultiplier(townId);
                        tempRoster = this._generateMonthlyRoster(townId, monthKey, config, lastMultiplier);
                    }

                    // 补全该游戏的数据
                    townData[game] = { npc: tempRoster.list[game] };

                    // 将新生成的 NPC 资金注入城镇总资金池，保持逻辑闭环
                    const newMoney = tempRoster.list[game].reduce((sum, npc) => sum + npc.maxMoney, 0);
                    townData.allMoney += newMoney;
                    townData.haveMoney += newMoney;

                    hasChanges = true;
                }
            });

            if (hasChanges && window.saveGame) window.saveGame();
        }

        return window.player.gambleStates[monthKey][townId];
    },

    // 获取上月资金比例系数
    _getLastMonthMultiplier: function(townId) {
        const time = window.player.time;
        let lastYear = time.year;
        let lastMonth = time.month - 1;
        if (lastMonth <= 0) { lastMonth = 12; lastYear -= 1; }
        const lastKey = `${lastYear}_${lastMonth}`;

        const lastData = window.player.gambleStates[lastKey] ? window.player.gambleStates[lastKey][townId] : null;
        if (!lastData || lastData.allMoney <= 0) return 1.0;

        // 系数 = 上月haveMoney / 上月allMoney
        return Math.max(0, lastData.haveMoney / lastData.allMoney);
    },

    // 清理非最近3个月的存档
    _cleanupOldArchives: function(currentKey) {
        const keys = Object.keys(window.player.gambleStates);
        if (keys.length <= 3) return;

        // 按年月排序
        keys.sort((a, b) => {
            const [y1, m1] = a.split('_').map(Number);
            const [y2, m2] = b.split('_').map(Number);
            return (y1 * 12 + m1) - (y2 * 12 + m2);
        });

        // 只保留最后3个
        const toDelete = keys.slice(0, keys.length - 3);
        toDelete.forEach(k => delete window.player.gambleStates[k]);
    },

    // 生成随机赌徒列表 (修改：加入 qingyun)
    _generateMonthlyRoster: function(townId, monthKey, config, multiplier) {
        const seed = `${townId}_${monthKey}_${window.player.worldSeed}`;
        let totalAll = 0;
        // 增加 qingyun 数组
        let result = { list: { liubo: [], chupu: [], shengguantu: [], qingyun: [] }, totalAll: 0 };

        // 构建符合最高稀有度限制的池子
        let pool = [];
        this.POOL_DISTRIBUTION.forEach(d => {
            if (d.level <= config.maxLv) {
                for (let i = 0; i < d.count; i++) pool.push(d.level);
            }
        });

        // 抽取对应数量并生成 NPC
        // 【注意】这里必须包含 qingyun，否则上面的自愈逻辑拿不到数据
        ['liubo', 'chupu', 'shengguantu', 'qingyun'].forEach(game => {
            let tempPool = [...pool]; // 每个游戏独立池子，互不抢占
            for (let i = 0; i < config.count; i++) {
                if (tempPool.length === 0) break;
                // 伪随机抽取
                const randIdx = Math.floor(this._seededRandom(seed + game + i) * tempPool.length);
                const level = tempPool.splice(randIdx, 1)[0];

                const npc = this._createNPC(level, i, seed + game + i, multiplier);
                result.list[game].push(npc);
                totalAll += npc.maxMoney;
            }
        });

        result.totalAll = totalAll;
        return result;
    },

    _createNPC: function(level, index, seed, multiplier) {
        const configs = this.NPC_POOLS[level];
        const config = configs[Math.floor(this._seededRandom(seed) * configs.length)];
        const range = this.BASE_MONEY_CONFIG[level];
        const baseMoney = Math.floor(range[0] + this._seededRandom(seed + 'm') * (range[1] - range[0]));
        const finalMoney = Math.floor(baseMoney * multiplier);

        return {
            id: `npc_${level}_${index}_${Date.now()}_${Math.floor(this._seededRandom(seed)*1000)}`,
            level: level,
            name: config.name,
            title: config.title,
            avatar: config.avatar,
            maxMoney: finalMoney,
            currentMoney: finalMoney,
            suspicion: 0,
            chatCount: 0,
            accumulatedWin: 0
        };
    },

    _seededRandom: function(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash |= 0;
        }
        const x = Math.sin(hash) * 10000;
        return x - Math.floor(x);
    },

    // ================= 3. 数据获取 =================

    /**
     * 获取城镇本月玩家累计输赢 (正赢负输)
     */
    getTownTotalWin: function(townId) {
        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;
        const townData = window.player.gambleStates[monthKey] ? window.player.gambleStates[monthKey][townId] : null;
        return townData ? (townData.totalWinMoney || 0) : 0;
    },

    /**
     * 获取城镇某个游戏的 NPC 列表
     * 这里也会触发 checkAndInitGambleData，确保数据安全
     */
    getGamblers: function(townId, gameName) {
        this.checkAndInitGambleData(townId);

        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;
        const townData = window.player.gambleStates[monthKey] ? window.player.gambleStates[monthKey][townId] : null;

        return (townData && townData[gameName]) ? townData[gameName].npc : [];
    },

    // ================= 4. 资金变动 =================

    /**
     * 修改赌徒及城镇资金 (同步记录历史总累计)
     */
    updateMoney: function(townId, gameName, gamblerId, money, betAmount, type) {
        console.log(`更新 ${gameName} 赌徒 ${gamblerId} 资金: ${money} (${betAmount}), 类型: ${type}`);
        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;

        // 确保数据已初始化
        const townData = this.checkAndInitGambleData(townId);
        if (!townData) return;

        // 特殊处理：青云赛的 gamblerId 可能是 'jackpot' 或 'player'
        if (gameName === 'qingyun') {
            if (gamblerId === 'jackpot') {
                // 如果是入场费，直接计入城镇账本
                townData.haveMoney += betAmount;
                // 青云赛的入场费不算作玩家输赢，直到最后结算
            } else if (gamblerId === 'player' && type === 2) {
                // 玩家赢钱 (结算时)
                townData.haveMoney -= money;
                townData.totalWinMoney += money;
                if (!window.player.gambleHistory) window.player.gambleHistory = {};
                if (!window.player.gambleHistory[townId]) window.player.gambleHistory[townId] = { totalWin: 0 };
                window.player.gambleHistory[townId].totalWin += money;
            }
            if(window.saveGame) window.saveGame();
            return;
        }

        // 传统游戏逻辑 (找 NPC)
        const npcList = townData[gameName] ? townData[gameName].npc : null;
        if (!npcList) return;

        const npc = npcList.find(n => n.id === gamblerId);
        if (!npc) return;

        // 初始化永久累计统计结构
        if (!window.player.gambleHistory) window.player.gambleHistory = {};
        if (!window.player.gambleHistory[townId]) window.player.gambleHistory[townId] = { totalWin: 0 };

        let townChange = 0;
        let winChange = 0;

        switch (type) {
            case 0: // 0. 收取赌注 (开局)
                npc.currentMoney += betAmount;
                npc.accumulatedWin += betAmount;
                townChange = betAmount;
                winChange = -betAmount;
                break;
            case 1: // 1. 赌徒赢 (结算：玩家输掉)
                npc.currentMoney += money;
                npc.accumulatedWin += money;
                townChange = money;
                winChange = -money;
                break;
            case 2: // 2. 赌徒输 (结算：玩家赢钱)
                npc.currentMoney -= (money + betAmount);
                npc.accumulatedWin -= betAmount;
                townChange = -(money + betAmount);
                winChange = money;
                break;
            case 3: // 3. 平局回滚 (结算：退还赌注)
                npc.currentMoney -= betAmount;
                npc.accumulatedWin -= betAmount;
                townChange = -betAmount;
                winChange = betAmount;
                break;
        }

        // 1. 更新当月局部账本
        townData.haveMoney += townChange;
        townData.totalWinMoney += winChange;

        // 2. 更新该城镇的历史总累计账本
        window.player.gambleHistory[townId].totalWin += winChange;

        if(window.saveGame) window.saveGame();
    },

    /**
     * 获取该城镇的历史总累计输赢金额
     */
    getTownHistoryTotalWin: function(townId) {
        if (window.player.gambleHistory && window.player.gambleHistory[townId]) {
            return window.player.gambleHistory[townId].totalWin || 0;
        }
        return 0;
    },

    // ================= 5. 黑名单管理 (本月) =================

    addTownBlacklist: function(townId) {
        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;
        const townData = this.checkAndInitGambleData(townId);

        if (townData) {
            townData.isBlacklisted = true;
            console.log(`[Gamble] 玩家已被该城镇赌坊拉黑: ${townId} (${monthKey})`);
            if(window.saveGame) window.saveGame();
        }
    },

    checkIsBlacklisted: function(townId) {
        if (!window.player.gambleStates) return false;
        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;

        if (window.player.gambleStates[monthKey] &&
            window.player.gambleStates[monthKey][townId]) {
            return !!window.player.gambleStates[monthKey][townId].isBlacklisted;
        }
        return false;
    },

    getGamblerById: function(townId, gameName, gamblerId) {
        // 先调用 checkAndInitGambleData 确保数据存在
        this.checkAndInitGambleData(townId);

        const time = window.player.time;
        const monthKey = `${time.year}_${time.month}`;

        if (window.player.gambleStates &&
            window.player.gambleStates[monthKey] &&
            window.player.gambleStates[monthKey][townId] &&
            window.player.gambleStates[monthKey][townId][gameName]) {

            const npcList = window.player.gambleStates[monthKey][townId][gameName].npc;
            return npcList.find(n => n.id === gamblerId) || null;
        }
        return null;
    },
};

window.UtilsGamble = UtilsGamble;