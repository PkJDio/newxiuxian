// 赌博系统数据工具类 v1.0
// 负责管理 player.gambleHistory 数据结构

const UtilsGamble = {

    /**
     * 获取指定城镇、指定游戏的战绩数据
     * 如果不存在会自动初始化
     * @param {string} townId 城镇ID (如 "t_xianyang")
     * @param {string} gameType 游戏类型 (如 "liubo", "chupu")
     */
    getStats: function(townId, gameType) {
        if (!window.player) return null;
        if (!player.gambleHistory) player.gambleHistory = {};

        // 初始化城镇层级
        if (!player.gambleHistory[townId]) {
            player.gambleHistory[townId] = {};
        }

        // 初始化游戏层级
        if (!player.gambleHistory[townId][gameType]) {
            player.gambleHistory[townId][gameType] = {
                count: 0,           // 游玩总次数
                wins: 0,            // 胜场
                losses: 0,          // 负场
                totalWinMoney: 0,   // 累计赢得金额 (纯利润部分)
                totalLostMoney: 0,  // 累计输掉金额 (本金)
                maxWin: 0           // 单次最大赢取金额
            };
        }

        return player.gambleHistory[townId][gameType];
    },

    /**
     * 记录一局游戏结果
     * @param {string} townId 城镇ID
     * @param {string} gameType 游戏类型
     * @param {boolean} isWin 是否胜利
     * @param {number} amount 涉及金额 (如果是赢，则是赢取的纯利；如果是输，则是损失的本金)
     */
    recordGame: function(townId, gameType, isWin, amount) {
        const stats = this.getStats(townId, gameType);
        if (!stats) return;

        stats.count++;

        if (isWin) {
            stats.wins++;
            stats.totalWinMoney += amount;
            if (amount > stats.maxWin) {
                stats.maxWin = amount;
            }
        } else {
            stats.losses++;
            stats.totalLostMoney += amount;
        }

        // 自动保存
        if (window.saveGame) window.saveGame();
    },

    /**
     * 获取指定城镇的总净胜金额 (用于大厅战绩展示)
     * 计算公式：所有游戏的总赢 - 总输
     */
    getTownNetProfit: function(townId) {
        if (!window.player || !player.gambleHistory || !player.gambleHistory[townId]) return 0;

        const townData = player.gambleHistory[townId];
        let net = 0;

        for (let gameType in townData) {
            const s = townData[gameType];
            net += (s.totalWinMoney - s.totalLostMoney);
        }

        return net;
    },
    // ================= 【新增】每日敌人资金管理 =================

    /**
     * 获取某城镇、某等级敌人今日已输掉的金额
     */
    getDailyEnemyLoss: function(townId, level) {
        if (!window.player) return 0;
        const time = player.time;
        // 生成今日唯一Key: 城镇_等级_年_月_日
        const dateKey = `loss_${townId}_lv${level}_${time.year}_${time.month}_${time.day}`;

        if (!player.gambleHistory) player.gambleHistory = {};
        if (!player.gambleHistory.daily_loss) player.gambleHistory.daily_loss = {};

        // 简单的清理逻辑：如果发现年份或月份不对，可以清空旧数据(可选，这里暂不做复杂清理以防误删)

        return player.gambleHistory.daily_loss[dateKey] || 0;
    },

    /**
     * 记录敌人输钱
     */
    addDailyEnemyLoss: function(townId, level, amount) {
        const time = player.time;
        const dateKey = `loss_${townId}_lv${level}_${time.year}_${time.month}_${time.day}`;

        if (!player.gambleHistory) player.gambleHistory = {};
        if (!player.gambleHistory.daily_loss) player.gambleHistory.daily_loss = {};

        const current = player.gambleHistory.daily_loss[dateKey] || 0;
        player.gambleHistory.daily_loss[dateKey] = current + amount;

        if (window.saveGame) window.saveGame();
    },
    // ================= 【新增】黑名单管理 =================

    /**
     * 检查玩家是否在当前城镇被拉黑
     */
    isBlacklisted: function(townId) {
        if (!window.player || !player.gambleHistory || !player.gambleHistory.blacklist) return false;

        const entry = player.gambleHistory.blacklist[townId];
        if (!entry) return false;

        // 检查时间是否过期 (拉黑到下个月)
        // 逻辑：如果当前总月数 > 拉黑时的总月数，则解封
        const currentTime = player.time;
        const currentTotalMonths = currentTime.year * 12 + currentTime.month;

        if (currentTotalMonths > entry.expireMonth) {
            // 已过期，自动移除
            delete player.gambleHistory.blacklist[townId];
            return false;
        }

        return true;
    },

    /**
     * 将玩家拉黑 (持续到下个月)
     */
    addToBlacklist: function(townId) {
        if (!window.player) return;
        if (!player.gambleHistory) player.gambleHistory = {};
        if (!player.gambleHistory.blacklist) player.gambleHistory.blacklist = {};

        const time = player.time;
        const currentTotalMonths = time.year * 12 + time.month;

        // 记录过期时间为当前月 (下个月 > 当前月 即解封)
        player.gambleHistory.blacklist[townId] = {
            expireMonth: currentTotalMonths
        };

        if (window.saveGame) window.saveGame();
    },
    /**
     * 获取某城镇、某等级敌人本月从玩家手中赢走的钱
     */
    getMonthlyEnemyGain: function(townId, level) {
        if (!window.player) return 0;
        const time = player.time;
        // Key 仅包含 年_月，换月自动清零
        const dateKey = `gain_${townId}_lv${level}_${time.year}_${time.month}`;

        if (!player.gambleHistory) player.gambleHistory = {};
        if (!player.gambleHistory.monthly_gain) player.gambleHistory.monthly_gain = {};

        return player.gambleHistory.monthly_gain[dateKey] || 0;
    },

    /**
     * 记录敌人赢钱 (玩家输钱时调用)
     */
    addMonthlyEnemyGain: function(townId, level, amount) {
        const time = player.time;
        const dateKey = `gain_${townId}_lv${level}_${time.year}_${time.month}`;

        if (!player.gambleHistory) player.gambleHistory = {};
        if (!player.gambleHistory.monthly_gain) player.gambleHistory.monthly_gain = {};

        const current = player.gambleHistory.monthly_gain[dateKey] || 0;
        player.gambleHistory.monthly_gain[dateKey] = current + amount;

        if (window.saveGame) window.saveGame();
    }
};

// 挂载到全局
window.UtilsGamble = UtilsGamble;