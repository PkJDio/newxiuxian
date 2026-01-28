// js/core/utils_money.js
// 金钱核心逻辑工具箱 v1.0
// 职责：统一管理金钱的增减、统计、日志和UI刷新

const UtilsMoney = {

    /**
     * 获得金钱
     * @param {Number} amount 数量
     * @param {String} source 来源说明 (可选，用于日志)
     */
    addMoney: function(amount, source = "") {
        if (!window.player) return;
        if (amount <= 0) return;

        // 确保数值为整数
        const val = Math.floor(amount);

        // 1. 修改数值
        if (typeof player.money === 'undefined') player.money = 0;
        player.money += val;

        // 2. 统计数据 (Total Earned)
        if (!player.stats) player.stats = {};
        if (!player.stats.total_money_earned) player.stats.total_money_earned = 0;
        player.stats.total_money_earned += val;

        // 3. UI 提示
        if (window.showToast) {
            const tips = source ? `获得 ${val} 钱财 (${source})` : `获得 ${val} 钱财`;
            window.showToast(tips);
        }

        // 4. 游戏日志
        if (window.LogManager && window.LogManager.add) {
            window.LogManager.add(`<span style="color:#ffb74d">💰 获得 ${val} 钱财</span> ${source ? "("+source+")" : ""}`);
        }

        this._refreshUI();
        // 自动保存 (涉及资产变更建议保存，防止回档刷钱)
        if (window.saveGame) window.saveGame();
    },

    /**
     * 消耗金钱 (安全扣除)
     * @param {Number} amount 数量
     * @param {String} reason 消耗原因 (可选)
     * @returns {Boolean} 是否扣除成功 (余额不足返回 false)
     */
    removeMoney: function(amount, reason = "") {
        if (!window.player) return false;
        if (amount <= 0) return true; // 消耗0视为成功

        const val = Math.floor(amount);

        // 1. 检查余额
        if ((player.money || 0) < val) {
            if (window.showToast) window.showToast("钱财不足！");
            return false;
        }

        // 2. 执行扣除
        player.money -= val;

        // 3. 统计数据 (Total Spent)
        if (!player.stats) player.stats = {};
        if (!player.stats.total_money_spent) player.stats.total_money_spent = 0;
        player.stats.total_money_spent += val;

        // ============================================================
        // 【任务埋点】触发“累计消费”类型的凡尘任务 (如果有)
        // ============================================================
        if (window.UtilsMortalTask) {
            // 触发 'cost_money' 类型的任务进度更新
            window.UtilsMortalTask.updateProgress('cost_money', val);
        }
        // ============================================================

        // 4. 游戏日志
        if (window.LogManager && window.LogManager.add) {
            window.LogManager.add(`💸 消耗 <span style="color:#ffb74d">${val} 钱财</span> ${reason ? "("+reason+")" : ""}`);
        }

        this._refreshUI();
        if (window.saveGame) window.saveGame();
        return true;
    },

    /**
     * 检查金钱是否足够 (仅检查，不扣除)
     * @param {Number} amount 需要的数量
     * @returns {Boolean}
     */
    checkMoney: function(amount) {
        if (!window.player) return false;
        return (player.money || 0) >= amount;
    },

    /**
     * 内部方法：刷新所有相关 UI
     */
    _refreshUI: function() {
        // 刷新左侧属性面板 (通常包含金钱显示)
        if (window.recalcStats) window.recalcStats();

        // 刷新可能存在的商店界面
        if (window.TownShops && window.TownShops.refreshUI) {
            window.TownShops.refreshUI(); // 假设商店有刷新方法
        }

        // 通用 UI 刷新
        if (window.updateUI) window.updateUI();
    }
};

window.UtilsMoney = UtilsMoney;