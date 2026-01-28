// js/core/utils_attribute.js
// 属性管理工具类：统一处理属性的增减、限制及相关任务触发

const UtilsAttribute = {

    /**
     * 增加饱食度
     * @param {number} val 增加的数值
     */
    addHunger: function(val) {
        if (!window.player || !window.player.status) return;

        // 确保属性存在
        if (typeof player.status.hunger === 'undefined') player.status.hunger = 0;

        // 获取上限 (优先读 derived，没有则默认 100)
        const max = (player.derived && player.derived.hungerMax) ? player.derived.hungerMax : 100;

        player.status.hunger += val;
        if (player.status.hunger > max) player.status.hunger = max;

        // 刷新UI
        if (window.recalcStats) window.recalcStats();
    },

    /**
     * 消耗饱食度 (核心方法)
     * @param {number} val 消耗的数值
     * @returns {boolean} 总是返回 true
     */
    consumeHunger: function(val) {
        if (!window.player || !window.player.status) return false;

        if (typeof player.status.hunger === 'undefined') player.status.hunger = 0;

        // 1. 执行扣除 (最低为0)
        player.status.hunger = Math.max(0, player.status.hunger - val);

        // 2. 【核心修改】调用通用任务接口更新进度
        // 这将自动匹配 mainType 或 extra.type 为 'consume_hunger' 的任务
        if (window.UtilsMortalTask && window.UtilsMortalTask.updateProgress) {
            window.UtilsMortalTask.updateProgress('consume_hunger', val);
        }

        // 3. 刷新UI
        if (window.recalcStats) window.recalcStats();

        return true;
    }
};

// 挂载到全局
window.UtilsAttribute = UtilsAttribute;