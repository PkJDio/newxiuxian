// js/modules/bounty/task_delivery.js
const TaskDelivery = {
    type: 2,
    name: "跑腿",

    generate: function(town, seed, difficulty, index) {
        // 1. 随机找一个目标城镇
        const allTowns = Object.values(window.GAME_DB.world || []).filter(t => t.id !== town.id && (t.type === 'city' || t.type === 'town' || t.type === 'village'));
        if (allTowns.length === 0) return null;

        const destRand = window.getSeededRandom(seed, "dest");
        const targetTown = allTowns[Math.floor(destRand * allTowns.length)];

        // 2. 计算距离与限时
        const dx = targetTown.x - town.x;
        const dy = targetTown.y - town.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 动态限时：距离越远时间越长，最少2天
        let daysLimit = Math.ceil(dist / 400) + 1;
        if (daysLimit < 2) daysLimit = 2;

        // 3. 奖励计算 (距离 * 系数 + 难度补贴)
        const reward = Math.floor(dist * 0.5 + daysLimit * 100 * difficulty);

        return {
            type: this.type,
            targetTownId: targetTown.id,
            targetTownName: targetTown.name,
            daysLimit: daysLimit,
            title: `【急送】送往${targetTown.name}`,
            desc: `有一批急件需要送往 <span style="color:#2196f3">${targetTown.name}</span>。需在 <span style="color:#d84315">${daysLimit}天</span> 内送达。`,
            rewardMoney: reward,
            hasPackage: false // 接取后变为 true
        };
    },

    // 接取时的特殊处理
    onAccept: function(task) {
        task.hasPackage = true;
        if(window.showToast) window.showToast("你接过沉甸甸的包裹，背在身上。");
    },

    // 检查完成情况
    checkCompletion: function(task, currentTown) {
        // 必须身处目标城镇
        return currentTown && currentTown.id === task.targetTownId;
    },

    // 结算时的特殊处理 (如移除包裹)
    onSubmit: function(task) {
        task.hasPackage = false;
        // 额外奖励：跑腿常有额外小费或土特产
        if (Math.random() < 0.5 && window.UtilsAdd) {
            window.showToast("雇主额外赠送了一些土特产。");
            // window.UtilsAdd.addItem("food_1", 1);
        }
    },

    getProgressHtml: function(task) {
        return `<p>目标地点: <span style="color:#2196f3">${task.targetTownName}</span></p>`;
    }
};
window.TaskDelivery = TaskDelivery;