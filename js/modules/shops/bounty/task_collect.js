// js/modules/bounty/task_collect.js
const TaskCollect = {
    type: 3,
    name: "收集",

    generate: function(town, seed, difficulty, index) {
        // 1. 随机抽取非任务物品
        const allItems = Object.values(window.GAME_DB.items || {}).filter(i => i.type !== 'quest');
        if (allItems.length === 0) return null;

        const itemRand = window.getSeededRandom(seed, "item");
        const targetItem = allItems[Math.floor(itemRand * allItems.length)];
        const r = targetItem.rarity || 1;

        // 2. 数量计算：基础 + 难度 + 稀有度修正
        // 难度越高，要的数量越多
        let count = Math.floor(window.getSeededRandom(seed, "count") * 3) + difficulty;
        if (count < 1) count = 1;

        // 3. 奖励计算 (价值 * 3倍溢价 * 数量)
        const reward = (targetItem.value || 10) * 3 * count;

        return {
            type: this.type,
            targetItemId: targetItem.id,
            targetItemName: targetItem.name,
            targetItemRarity: r,
            reqCount: count,
            daysLimit: 10, // 收集任务通常给较长时间
            title: `【求购】急需${targetItem.name}`,
            desc: `城中大户急需 <span style="color:${(window.RARITY_CONFIG && window.RARITY_CONFIG[r]) ? window.RARITY_CONFIG[r].color : '#333'}">${targetItem.name}</span> x${count}。`,
            rewardMoney: reward
        };
    },

    checkCompletion: function(task) {
        const has = window.UtilsItem ? window.UtilsItem.getItemCount(task.targetItemId) : 0;
        return has >= task.reqCount;
    },

    // 结算时扣除物品
    onSubmit: function(task) {
        if (window.UtilsItem && window.UtilsItem.removeItem) {
            window.UtilsItem.removeItem(task.targetItemId, task.reqCount);
        }
    },

    getProgressHtml: function(task) {
        const has = window.UtilsItem ? window.UtilsItem.getItemCount(task.targetItemId) : 0;
        const isEnough = has >= task.reqCount;
        return `<p>持有数量: <span style="font-weight:bold; color:${isEnough ? 'green' : 'red'}">${has} / ${task.reqCount}</span></p>`;
    }
};
window.TaskCollect = TaskCollect;