// js/modules/bounty/task_delivery.js
const TaskDelivery = {
    type: 2,
    name: "跑腿",

    generate: function(town, seed, difficulty, index) {
        // 1. 获取可用城镇
        const allTowns = Object.values(window.WORLD_TOWNS || {})
            .filter(t => t.id !== town.id && (t.level === 'city' || t.level === 'town' || t.level === 'village'));

        if (allTowns.length < 5) {
            console.warn("[TaskDelivery] 城镇数量不足，无法生成分级任务");
            return null;
        }

        // 2. 距离排序
        const townsWithDist = allTowns.map(t => {
            const dx = t.x - town.x;
            const dy = t.y - town.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return { ...t, _combatDist: dist };
        });
        townsWithDist.sort((a, b) => a._combatDist - b._combatDist);

        // 3. 5等分分级
        const chunkSize = Math.ceil(townsWithDist.length / 5);
        const distancePools = [];
        for (let i = 0; i < 5; i++) {
            distancePools.push(townsWithDist.slice(i * chunkSize, (i + 1) * chunkSize));
        }

        // 4. 根据难度选目标
        const targetPool = distancePools[difficulty - 1] || distancePools[0];
        if (!targetPool || targetPool.length === 0) return null;

        const destRand = window.getSeededRandom(seed, "dest");
        const targetTown = targetPool[Math.floor(destRand * targetPool.length)];
        const dist = targetTown._combatDist;

        // 5. 奖励与期限
        const reward = Math.floor(dist * 5);
        let daysLimit = 7;

        // 返回的对象必须包含所有主控模块需要的字段
        return {
            type: this.type,
            originTownId: town.id,        // 明确记录起点 ID
            targetTownId: targetTown.id,  // 明确记录终点 ID
            targetTownName: targetTown.name,
            daysLimit: daysLimit,
            rewardMoney: reward,
            title: `【急送】送往${targetTown.name}`,
            desc: `有一批急件需要送往 <span style="color:#2196f3">${targetTown.name}</span>。请务必在 <span style="color:#d84315">${daysLimit}天</span> 内送达。`,
            hasPackage: false
        };
    },

    onAccept: function(task) {
        task.hasPackage = true;
        if(window.showToast) window.showToast("你接过沉甸甸的包裹，背在身上。");
    },

    checkCompletion: function(task, currentTown) {
        if (!currentTown) return false;
        // 必须在目的地 且 不在起点
        return currentTown.id === task.targetTownId && currentTown.id !== task.originTownId;
    },

    onSubmit: function(task) {
        task.hasPackage = false;
        if (window.showToast) window.showToast("包裹已安全送达。");
    },

    getProgressHtml: function(task) {
        // 【核心修改】逻辑分流判定
        // 如果不是跑腿任务(type 2)，则不执行距离计算，返回 null 让 UIBounty 调用其他模块的进度
        if (task.type !== 2) {
            return null;
        }

        // --- 以下仅针对跑腿任务 (Type 2) 的距离显示逻辑 ---

        // 1. 获取当前城镇ID
        const curTownId = (window.BountyBoard && BountyBoard.currentTown) ? BountyBoard.currentTown.id : null;

        // 2. 获取玩家当前实时坐标
        const playerPos = window.player && window.player.position ? window.player.position : { x: 0, y: 0 };

        let statusColor = "#999";
        let locHint = "前往目标城镇途中";

        // 3. 获取目标城镇数据以提取原始坐标
        const townData = window.WORLD_TOWNS || (window.GAME_DB ? window.GAME_DB.world : null) || {};
        const targetTown = townData[task.targetTownId] || Object.values(townData).find(t => t.id === task.targetTownId);

        // 4. 状态判定
        if (curTownId === task.targetTownId) {
            // 已到达目标城镇
            statusColor = "#2e7d32";
            locHint = "已送达目的地，可交付任务";
        } else if (curTownId === task.originTownId) {
            // 还在起点城镇
            statusColor = "#e65100";
            locHint = "正在起点等待出发";
        } else if (targetTown) {
            // 离开起点但在途中，计算玩家位置与目标城镇坐标的实时距离
            const dx = targetTown.x - playerPos.x;
            const dy = targetTown.y - playerPos.y;
            const distance = Math.floor(Math.sqrt(dx * dx + dy * dy));

            statusColor = "#2196f3"; // 蓝色表示进行中
            locHint = `距离 <b style="color:#d32f2f;">${task.targetTownName}</b> 还有 <b style="color:#d32f2f;">${distance}</b> 距离`;
        }

        return `
            <div style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;">
                <p>目标地点: <b style="color:#2196f3">${task.targetTownName}</b></p>
                <p style="color:${statusColor}; font-size:16px;">状态: ${locHint}</p>
            </div>`;
    }
};
window.TaskDelivery = TaskDelivery;