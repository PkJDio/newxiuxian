// js/modules/shops/bounty/task_exterminate.js
// 悬赏榜 - 剿灭任务逻辑 v4.1 (Debug版：增加详细日志)
//console.log("加载 悬赏榜任务: 剿灭 (v4.1 Debug)");

const TaskExterminate = {
    type: 1,
    name: "剿灭",

    // ================= 1. 任务生成 =================
    generate: function(town, seed, difficulty, index) {
        console.group(`[TaskExterminate] 开始生成任务 (种子:${seed}, 难度:${difficulty}, 城镇:${town.name})`);

        const allEnemies = window.enemies || [];
        if (allEnemies.length === 0) {
            console.warn("❌ 全局 window.enemies 为空！");
            console.groupEnd();
            return null;
        }

        // --- A. 筛选怪物池 ---
        const currentYear = (window.player && player.time) ? player.time.year : 0;
        const timeStart= (window.player && player.timeStart) ? player.timeStart : 0;
        // 区域判定
        let regionPrefix = town.region || null;
        if (!regionPrefix && town.id) {
            const parts = town.id.split('_');
            // 例如 'map_zhongyuan_guanzhong_xianyang' -> 'map_zhongyuan_guanzhong_xianyang'
            // 只要前缀匹配即可，比如怪物的 region 是 'map_zhongyuan'
            // 这里我们取前4段作为前缀，或者根据你的数据结构调整
            if (parts.length >= 4) regionPrefix = parts.slice(0, 4).join('_');
            else regionPrefix = town.id; // 如果ID很短，就直接用ID
        }

        // console.log(`Step 1: 环境参数 -> 当前年份:${currentYear}, 城镇区域前缀:${regionPrefix}`);
        // console.log(`数量: `,allEnemies);
        let validEnemies = allEnemies.filter(e => {
            // 1. 年份检查
            if ((e.timeStart || 0) > timeStart) return false;

            // 2. 区域检查
            if (e.region === 'all') return true; // 通用怪

            // 检查怪物区域是否包含在城镇ID里，或者城镇ID包含怪物区域
            // 例如：城镇 'map_zy_gz_xianyang', 怪物 'map_zy' -> 匹配
            // 例如：城镇 'map_zy_gz_xianyang', 怪物 'map_zy_gz_xianyang' -> 匹配
            if (regionPrefix && e.region) {
                return regionPrefix.includes(e.region);
            }
            return false;
        });
        // console.log(`Step 2: 初步筛选结果 (年份+区域匹配) -> 数量:`,validEnemies);
        // console.log(`Step 2: 初步筛选结果 (年份+区域匹配) -> 数量: ${validEnemies.length}`);
        if (validEnemies.length === 0) {
            // console.log("⚠️ 警告: 没有匹配区域的怪物，尝试降级为仅搜索 'region: all' 的通用怪...");
            validEnemies = allEnemies.filter(e => e.region === 'all');
            // console.log(`Step 2 (Retry): 通用怪数量 -> ${validEnemies.length}`);
        }

        if (validEnemies.length === 0) {
            // console.error("❌ 失败: 当前区域及通用池中没有可用怪物！");
            // console.log("调试建议: 请检查 enemies 数据中怪物的 region 字段是否与 town.id 匹配，或者是否定义了 region:'all' 的怪物。");
            // console.groupEnd();
            return null;
        }

        // --- B. 根据难度配置目标 ---
        let targetConfigs = [];
        if (difficulty === 1) targetConfigs = [{ rank: 'minion', countMin: 1, countMax: 3 }];
        else if (difficulty === 2) targetConfigs = [{ rank: 'minion', countMin: 1, countMax: 3 }, { rank: 'minion', countMin: 1, countMax: 3 }];
        else if (difficulty === 3) targetConfigs = [{ rank: 'elite', countMin: 1, countMax: 3 }];
        else if (difficulty === 4) targetConfigs = [{ rank: 'boss', countMin: 1, countMax: 1 }];
        else if (difficulty === 5) targetConfigs = [{ rank: 'lord', countMin: 1, countMax: 1 }];

        // console.log(`Step 3: 难度配置 (Diff ${difficulty}) ->`, targetConfigs);

        const targets = [];
        let usedEnemyIds = new Set();
        let totalReward = 0;
        // console.log("validEnemies",validEnemies)
        for (let i = 0; i < targetConfigs.length; i++) {
            const cfg = targetConfigs[i];

            // 在筛选出的 validEnemies 中寻找符合 rank (minion/elite/boss) 的怪
            let pool = validEnemies.filter(e => e.template === cfg.rank && !usedEnemyIds.has(e.id));

            // console.log(`Step 4-Loop[${i}]: 寻找 Rank=${cfg.rank} 的怪物... 可用池大小: ${pool.length}`);

            // 如果没找到未使用的，尝试复用已使用的（防止怪太少导致生成失败）
            if (pool.length === 0) {
                // console.log("  -> 池为空，尝试允许复用怪物...");
                pool = validEnemies.filter(e => e.template === cfg.rank);
                // console.log(`  -> 复用后池大小: ${pool.length}`);
            }

            if (pool.length === 0) {
                // console.warn(`  ❌ 失败: 在 validEnemies 中找不到 template=${cfg.rank} 的怪物！此目标项跳过。`);
                continue;
            }
            // console.log(`  -> 池大小: ${pool.length}`,pool);
            const rand = window.getSeededRandom(`${seed}_t${i}`, "enemy_select");
            const enemy = pool[Math.floor(rand * pool.length)];
            usedEnemyIds.add(enemy.id);

            const countRand = window.getSeededRandom(`${seed}_t${i}`, "count");
            const count = Math.floor(countRand * (cfg.countMax - cfg.countMin + 1)) + cfg.countMin;

            // 赏金计算
            let multiplier = 5;
            if (cfg.rank === 'elite') multiplier = 3;
            if (cfg.rank === 'boss' || cfg.rank === 'lord') multiplier = 1;

            const hp = enemy.stats ? enemy.stats.hp : (enemy.hp || 100);
            const reward = Math.floor(hp * count * multiplier);
            totalReward += reward;

            //console.log(`  ✅ 选中怪物: ${enemy.name} (${enemy.id}), 数量: ${count}, 赏金: ${reward}`);

            const rankColor = this._getRankColor(cfg.rank);
            targets.push({
                id: enemy.id,
                name: enemy.name,
                template: enemy.template,
                reqCount: count,
                curCount: 0,
                descStr: `<span style="color:${rankColor}; font-weight:bold;">${enemy.name}</span> x${count}`
            });
        }

        if (targets.length === 0) {
            console.error("❌ 失败: 所有目标项均无法生成 (可能是 validEnemies 里完全没有符合该难度的怪物 rank)。");
            console.groupEnd();
            return null;
        }

        console.log("✅ 任务生成成功！", targets);
        // console.groupEnd();

        const titleStr = targets.map(t => t.name).join("、");
        const descStr = targets.map(t => t.descStr).join("，");
        const prefix = (difficulty >= 4) ? "【讨伐】" : "【剿灭】";

        return {
            type: this.type,
            title: `${prefix}${titleStr}`,
            desc: `据报，周边有${descStr}出没，请前往剿灭。<br>完成可得赏金，任务期间击杀目标有概率获得 <span style="color:#ff9800">额外装备</span>。`,
            targets: targets,
            rewardMoney: totalReward,
            deadline: {
                year: player.time.year,
                month: player.time.month,
                day: 30
            },
            deadlineStr: "本月结束前"
        };
    },

    _getRankColor: function(rank) {
        if (rank === 'elite') return '#1976d2';
        if (rank === 'boss') return '#9c27b0';
        if (rank === 'lord') return '#d32f2f';
        return '#3e2723';
    },

    // ================= 2. 状态检查 =================
    checkCompletion: function(task) {
        if (!task || !task.targets) return false;
        return task.targets.every(t => t.curCount >= t.reqCount);
    },

    getProgressHtml: function(task) {
        // 【新增判定】如果不是跑腿任务(type 2)，则直接返回原有的进度逻辑或空，不执行距离计算
        if (task.type !== 2) {
            // 这里可以根据需要返回默认逻辑，或者如果是 Exterminate 任务，由它自己的模块处理
            return "";
        }

        const curTownId = (window.BountyBoard && BountyBoard.currentTown) ? BountyBoard.currentTown.id : null;
        // 获取玩家当前实时坐标
        const playerPos = window.player && window.player.position ? window.player.position : { x: 0, y: 0 };

        let statusColor = "#999";
        let locHint = "前往目标城镇途中";

        // 获取目标城镇数据以提取坐标
        const townData = window.WORLD_TOWNS || (window.GAME_DB ? window.GAME_DB.world : null) || {};
        const targetTown = townData[task.targetTownId] || Object.values(townData).find(t => t.id === task.targetTownId);

        if (curTownId === task.targetTownId) {
            // 已到达目标城镇
            statusColor = "#2e7d32";
            locHint = "已送达目的地，可交付任务";
        } else if (curTownId === task.originTownId) {
            // 还在起点城镇
            statusColor = "#e65100";
            locHint = "正在起点等待出发";
        } else if (targetTown) {
            // 【核心逻辑】离开起点但在途中，计算玩家与目标的实时距离
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
    },

    // ================= 3. 战斗钩子 =================
    onTaskEnemyKilled: function(task, enemyId) {
        let updated = false;
        if (task && task.targets) {
            // 使用 find 找到第一个符合条件且未满的目标，而不是 forEach 遍历所有
            const target = task.targets.find(t => t.id === enemyId && t.curCount < t.reqCount);
            if (target) {
                target.curCount++;
                updated = true;
                if (window.showToast) {
                    window.showToast(`悬赏进度: ${target.name} (${target.curCount}/${target.reqCount})`);
                }
            }
        }
        return updated;
    }
};

window.TaskExterminate = TaskExterminate;