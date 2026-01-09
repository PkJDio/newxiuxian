// js/modules/bounty/task_exterminate.js
const TaskExterminate = {
    type: 1,
    name: "剿灭",

    // 生成任务数据
    generate: function(town, seed, difficulty, index) {
        // 1. 筛选怪物 (这里简单示例，实际可结合 map_enemy_manager)
        const allEnemies = Object.values(window.GAME_DB.enemies || {});
        if (allEnemies.length === 0) return null;

        const enemyRand = window.getSeededRandom(seed, "enemy");
        const targetEnemy = allEnemies[Math.floor(enemyRand * allEnemies.length)];

        // 2. 根据怪物阶级和任务难度计算数量
        let count = 1;
        if (targetEnemy.rank === 'minion') count = 5 + difficulty * 2;
        else if (targetEnemy.rank === 'elite') count = 2 + Math.floor(difficulty / 2);
        else if (targetEnemy.rank === 'boss') count = 1;

        // 3. 计算奖励 (血量 * 5 * 数量 * 难度系数)
        const reward = Math.floor((targetEnemy.hpMax || 100) * 5 * count * (1 + difficulty * 0.1));

        return {
            type: this.type,
            targetId: targetEnemy.id,
            targetName: targetEnemy.name,
            reqCount: count,
            curCount: 0,
            title: `【剿灭】肃清${targetEnemy.name}`,
            desc: `城外${targetEnemy.name}作祟，袭扰商旅。请道友前往剿灭 <span style="color:#d32f2f">${count}</span> 只。`,
            rewardMoney: reward,
            deadlineStr: "本月结束前"
        };
    },

    // 检查完成情况
    checkCompletion: function(task) {
        return task.curCount >= task.reqCount;
    },

    // 获取进度显示的 HTML
    getProgressHtml: function(task) {
        const isDone = task.curCount >= task.reqCount;
        return `<p>击杀进度: <span style="font-weight:bold; color:${isDone ? 'green' : 'red'}">${task.curCount} / ${task.reqCount}</span></p>`;
    },

    // 钩子：处理怪物死亡
    onEnemyKilled: function(task, enemyId) {
        if (task.targetId === enemyId && task.curCount < task.reqCount) {
            task.curCount++;
            if (window.showToast) window.showToast(`悬赏进度: ${task.targetName} (${task.curCount}/${task.reqCount})`);

            // 额外掉落逻辑
            if (task.curCount <= task.reqCount) {
                if (Math.random() < 0.2 && window.UtilsAdd) {
                    // 示例：掉落小钱袋或低级材料
                    window.showToast("悬赏目标掉落了额外的战利品！");
                    // window.UtilsAdd.addItem("material_stone", 1);
                }
            }
            return true; // 返回 true 表示数据有更新，需要保存
        }
        return false;
    }
};
window.TaskExterminate = TaskExterminate;