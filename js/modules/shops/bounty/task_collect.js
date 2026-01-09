// js/modules/bounty/task_collect.js
// 悬赏榜 - 收集/需求任务逻辑 v1.0

const TaskCollect = {
    type: 3,
    name: "收集",

    // ================= 1. 任务生成 =================
    generate: function(town, seed, difficulty, index) {
        if (!window.enemies_all_drops || window.enemies_all_drops.length === 0) {
            console.warn("[TaskCollect] window.enemies_all_drops 未定义或为空");
            return null;
        }
        const timeStart= (window.player && player.timeStart) ? player.timeStart : 0;
        // --- A. 根据难度确定抽取规则 ---
        let config = { template: 'minion', pickCount: 1, qtyMin: 1, qtyMax: 5 };

        if (difficulty === 1) {
            config = { template: 'minion', pickCount: 1, qtyMin: 1, qtyMax: 5 };
        } else if (difficulty === 2) {
            config = { template: 'minion', pickCount: 2, qtyMin: 1, qtyMax: 4 };
        } else if (difficulty === 3) {
            config = { template: 'elite', pickCount: 1, qtyMin: 1, qtyMax: 2 };
        } else if (difficulty === 4) {
            config = { template: 'boss', pickCount: 1, qtyMin: 1, qtyMax: 5 };
        } else if (difficulty === 5) {
            config = { template: 'lord', pickCount: 1, qtyMin: 1, qtyMax: 5 };
        }

        // --- B. 筛选池子 ---
        const pool = window.enemies_all_drops.filter(d => d.template === config.template && d.timeStart <= timeStart);
        if (pool.length === 0) return null;

        // --- C. 随机抽取物品 ---
        const targets = [];
        let baseValueSum = 0;

        for (let i = 0; i < config.pickCount; i++) {
            const itemSeed = `${seed}_item_${i}`;
            const rand = window.getSeededRandom(itemSeed, "collect_select");
            const dropEntry = pool[Math.floor(rand * pool.length)];

            // 获取物品详细信息（主要是价格）
            const itemData = window.GAME_DB.items.find(it => it.id === dropEntry.id);
            if (!itemData) continue;

            const qtyRand = window.getSeededRandom(itemSeed, "collect_qty");
            const reqCount = Math.floor(qtyRand * (config.qtyMax - config.qtyMin + 1)) + config.qtyMin;

            const price = itemData.value || itemData.price || 10;
            baseValueSum += (price * reqCount);

            targets.push({
                id: itemData.id,
                name: itemData.name,
                reqCount: reqCount,
                icon: (typeof getItemIcon === 'function' ? getItemIcon(itemData) : itemData.icon) || '📦'
            });
        }

        if (targets.length === 0) return null;

        // --- D. 计算奖励金额 (按需求公式) ---
        let reward = 0;
        if (difficulty === 1) reward = baseValueSum * 3 * 1;
        else if (difficulty === 2) reward = baseValueSum * 3 * 2;
        else if (difficulty === 3) reward = baseValueSum * 2.5 * 3;
        else if (difficulty === 4 || difficulty === 5) {
            // 公式：物品价格 × 数量 × 3 × 数量 (注意这里取第一个目标的数量作为系数)
            reward = baseValueSum * 2 * targets[0].reqCount;
        }

        const title = targets.length > 1 ? `【需求】${targets[0].name}等物品` : `【需求】${targets[0].name}`;
        const descItems = targets.map(t => `<b style="color:#2196f3">${t.name}</b> x${t.reqCount}`).join("、");

        return {
            type: this.type,
            townId: town.id, // 记录发源地
            title: title,
            desc: `周边急需一批物资：${descItems}。<br>请务必在月底前集齐并带回 <span style="color:#5d4037">${town.name}</span>。`,
            targets: targets,
            rewardMoney: Math.floor(reward),
            daysLimit: 30 // 由 BountyBoard 的月底截断逻辑接管
        };
    },

    // ================= 2. 状态检查 =================
    // 检查完成情况
    checkCompletion: function(task, currentTown) {
        if (!currentTown || currentTown.id !== task.townId) return false;

        // 检查背包里的物品是否足够
        const inv = player.inventory || [];
        return task.targets.every(target => {
            const slot = inv.find(s => s.id === target.id);
            return slot && slot.count >= target.reqCount;
        });
    },

    // ================= 3. 交付结算 =================
    onSubmit: function(task) {
        // 扣除背包里的物品
        if (task.targets && window.player.inventory) {
            task.targets.forEach(target => {
                const invIdx = player.inventory.findIndex(s => s.id === target.id);
                if (invIdx !== -1) {
                    player.inventory[invIdx].count -= target.reqCount;
                    // 如果数量归零，则移除格子
                    if (player.inventory[invIdx].count <= 0) {
                        player.inventory.splice(invIdx, 1);
                    }
                }
            });
        }
        if (window.showToast) window.showToast("已交付所需物资，赏金已入账。");
    },

    // 进度显示 (显示在悬赏T或榜单详情)
    getProgressHtml: function(task) {
        if (!task || !task.targets) return "";
        const inv = player.inventory || [];

        const progressRows = task.targets.map(t => {
            const slot = inv.find(s => s.id === t.id);
            const curCount = slot ? slot.count : 0;
            const isDone = curCount >= t.reqCount;
            const color = isDone ? '#2e7d32' : '#d32f2f';

            return `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:16px;">
                    <span>${t.name}</span>
                    <span style="color:${color}; font-weight:bold;">${curCount} / ${t.reqCount}</span>
                </div>`;
        }).join("");

        return `
            <div style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px; text-align:left;">
                <p style="color:#795548; font-weight:bold; margin-bottom:8px;">📦 物资收集进度：</p>
                ${progressRows}
            </div>`;
    }
};

window.TaskCollect = TaskCollect;