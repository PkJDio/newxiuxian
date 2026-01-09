// js/modules/shops/bounty_board.js
// 悬赏榜主控模块 v2.0 (模块化重构版)
console.log("加载 悬赏榜主控模块");

const BountyBoard = {
    currentTown: null,
    modalBody: null,
    selectedTaskIndex: -1,
    currentTasks: [],

    // 注册子模块的映射
    taskModules: {
        1: null, // 将在 init 时绑定 TaskExterminate
        2: null, // TaskDelivery
        3: null  // TaskCollect
    },

    _initModules: function() {
        // 确保子模块已加载
        if (window.TaskExterminate) this.taskModules[1] = window.TaskExterminate;
        if (window.TaskDelivery)    this.taskModules[2] = window.TaskDelivery;
        if (window.TaskCollect)     this.taskModules[3] = window.TaskCollect;
    },

    _initData: function() {
        if (!player.bounty) {
            player.bounty = {
                stability: {},
                activeTasks: [],
                finishedIds: []
            };
        }
        this._initModules();
    },

    enter: function(town) {
        this._initData();
        this.currentTown = town;
        this.selectedTaskIndex = -1;
        this._generateMonthlyTasks(town);
        this.renderUI();
    },

    _generateMonthlyTasks: function(town) {
        if (!window.getSeededRandom || !player) return;
        const time = player.time;
        const seedKey = `bounty_${town.id}_${time.year}_${time.month}`;

        // 计算数量 (基础 + 安定度加成)
        let baseCount = town.level === 'city' ? 5 : (town.level === 'town' ? 4 : 3);
        const stability = this.getStability(town.id);
        if (stability >= 100) baseCount++;
        if (stability >= 300) baseCount++;
        if (stability >= 500) baseCount++;

        this.currentTasks = [];
        for (let i = 0; i < baseCount; i++) {
            const taskSeed = `${seedKey}_${i}`;
            // 随机类型 1-3
            const typeRand = window.getSeededRandom(taskSeed, "type");
            let type = 1;
            if (typeRand > 0.4) type = 2;
            if (typeRand > 0.7) type = 3;

            // 检查重复
            const taskId = `${taskSeed}_id`;
            if (player.bounty.finishedIds.includes(taskId)) continue;

            // 检查是否已接取 (如果已接取，直接使用存档里的数据，保持状态一致)
            const active = player.bounty.activeTasks.find(t => t.id === taskId);
            if (active) {
                this.currentTasks.push(active);
                continue;
            }

            // 委托子模块生成
            const module = this.taskModules[type];
            if (module) {
                const diffRand = window.getSeededRandom(taskSeed, "diff");
                const difficulty = Math.floor(diffRand * 5) + 1;

                const taskData = module.generate(town, taskSeed, difficulty, i);
                if (taskData) {
                    taskData.id = taskId;
                    taskData.townId = town.id;
                    taskData.difficulty = difficulty;
                    // 初始化通用截止时间
                    if (taskData.daysLimit) {
                        // 相对时间，接取时再转绝对时间
                    } else {
                        // 默认月底
                        taskData.deadlineStr = "本月结束前";
                    }
                    this.currentTasks.push(taskData);
                }
            }
        }
    },

    // ================= UI 渲染 (逻辑基本不变，只是调用改为模块方法) =================
    renderUI: function() {
        const townName = this.currentTown.name;
        const stability = this.getStability(this.currentTown.id);

        const html = `
            <div class="bounty-container" style="display:flex; height:100%; background:#fcf8e3; font-family:'Kaiti';">
                <div class="bounty-list" style="width:40%; border-right:2px solid #5d4037; overflow-y:auto; background:#fff8e1;">
                    <div style="padding:10px; background:#5d4037; color:#fff; text-align:center;">
                        <div style="font-size:20px;">📜 ${townName}悬赏榜</div>
                        <div style="font-size:14px; opacity:0.8;">此地安定: ${stability}</div>
                    </div>
                    <div id="bounty-items-container">${this._renderTaskList()}</div>
                </div>
                <div class="bounty-detail" style="flex:1; padding:20px; display:flex; flex-direction:column; background:#fffbf0;">
                    <div id="bounty-detail-content" style="flex:1;">
                        <div style="text-align:center; color:#999; margin-top:100px;">请点击左侧榜单查看详情</div>
                    </div>
                </div>
            </div>
        `;
        this.modalBody = window.showGeneralModal(`悬赏榜`, html, null, "modal_bounty", 80, 75);
    },

    _renderTaskList: function() {
        if (this.currentTasks.length === 0) return '<div style="padding:20px; text-align:center; color:#999;">本月暂无悬赏</div>';
        return this.currentTasks.map((task, idx) => {
            const isActive = player.bounty.activeTasks.find(t => t.id === task.id);
            const statusText = isActive ? '<span style="color:blue">[进行中]</span>' : '<span style="color:#d84315">[未接取]</span>';
            const bg = (this.selectedTaskIndex === idx) ? '#ffe0b2' : 'transparent';
            return `
                <div class="bounty-item-row" onclick="BountyBoard.selectTask(${idx})" 
                     style="padding:15px; border-bottom:1px dashed #bbb; cursor:pointer; background:${bg}; transition:0.2s;">
                    <div style="font-weight:bold; font-size:18px; color:#3e2723;">${task.title}</div>
                    <div style="display:flex; justify-content:space-between; margin-top:5px; font-size:14px;">
                        <span>难度: ${'⭐'.repeat(task.difficulty)}</span>
                        <span>${statusText}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    selectTask: function(index) {
        this.selectedTaskIndex = index;
        const rows = document.querySelectorAll('.bounty-item-row');
        rows.forEach((r, i) => r.style.background = (i === index ? '#ffe0b2' : 'transparent'));

        const task = this.currentTasks[index];
        const activeTask = player.bounty.activeTasks.find(t => t.id === task.id);
        const displayTask = activeTask || task;

        // 调用子模块获取进度显示
        const module = this.taskModules[displayTask.type];
        const progressHtml = module ? module.getProgressHtml(displayTask) : '';

        let actionBtn = '';
        if (activeTask) {
            const canSubmit = module && module.checkCompletion(activeTask, this.currentTown);
            if (canSubmit) {
                actionBtn = `<button class="ink_btn" onclick="BountyBoard.submitTask('${displayTask.id}')" style="background:#4caf50; color:#fff;">✅ 交付任务</button>`;
            } else {
                actionBtn = `<button class="ink_btn disabled">进行中...</button>`;
            }
        } else {
            actionBtn = `<button class="ink_btn" onclick="BountyBoard.acceptTask(${index})">📜 揭榜接取</button>`;
        }

        const deadlineText = this._getDeadlineText(displayTask);
        const container = document.getElementById('bounty-detail-content');
        container.innerHTML = `
            <div style="border:4px double #3e2723; padding:30px; margin:20px; background:rgba(255,255,255,0.8); height:100%; position:relative;">
                <div style="font-size:32px; font-weight:bold; text-align:center; margin-bottom:20px; color:#bf360c;">${displayTask.title}</div>
                <div style="font-size:18px; line-height:1.8; color:#3e2723;">
                    <p>${displayTask.desc}</p>
                    <hr style="border:1px dashed #8d6e63; margin:20px 0;">
                    <p>难度: ${'⭐'.repeat(displayTask.difficulty)}</p>
                    <p>赏金: <span style="color:#f57f17; font-weight:bold;">${displayTask.rewardMoney} 文</span></p>
                    ${progressHtml}
                    <p>截止: <span style="color:#d84315;">${deadlineText}</span></p>
                </div>
                <div style="position:absolute; bottom:30px; left:0; width:100%; text-align:center;">${actionBtn}</div>
            </div>
        `;
    },

    // ================= 交互逻辑 =================
    acceptTask: function(index) {
        const task = JSON.parse(JSON.stringify(this.currentTasks[index]));

        // 设置截止时间
        const curTime = player.time.totalDays || (player.time.year * 360 + player.time.month * 30 + player.time.day);
        if (task.daysLimit) task.deadline = curTime + task.daysLimit;
        else task.deadline = Math.ceil(curTime / 30) * 30; // 默认月底

        // 子模块接取回调
        const module = this.taskModules[task.type];
        if (module && module.onAccept) module.onAccept(task);

        player.bounty.activeTasks.push(task);
        if(window.showToast) window.showToast("已揭榜！");
        window.saveGame();
        this.selectTask(index);
        this.renderUI();
    },

    submitTask: function(taskId) {
        const index = player.bounty.activeTasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = player.bounty.activeTasks[index];
        const module = this.taskModules[task.type];

        if (!module || !module.checkCompletion(task, this.currentTown)) {
            window.showToast("条件未达成！");
            return;
        }

        // 子模块结算回调 (如扣物品)
        if (module.onSubmit) module.onSubmit(task);

        // 发奖与清理
        player.money += task.rewardMoney;
        this.addStability(task.townId, task.difficulty);
        player.bounty.activeTasks.splice(index, 1);
        player.bounty.finishedIds.push(task.id);

        if(window.showToast) window.showToast(`任务完成！获得赏金 ${task.rewardMoney} 文`);
        window.saveGame();
        this.enter(this.currentTown);
    },

    // ================= 辅助/钩子 =================
    getStability: function(townId) {
        return (player.bounty.stability && player.bounty.stability[townId]) || 0;
    },
    addStability: function(townId, val) {
        if (!player.bounty.stability) player.bounty.stability = {};
        player.bounty.stability[townId] = (player.bounty.stability[townId] || 0) + val;
    },
    _getDeadlineText: function(task) {
        if (task.deadlineStr) return task.deadlineStr;
        const curTime = player.time.totalDays || (player.time.year * 360 + player.time.month * 30 + player.time.day);
        const left = task.deadline - curTime;
        return left < 0 ? "已过期" : `剩余 ${left} 天`;
    },

    // 战斗监听钩子 (分发给剿灭模块)
    onEnemyKilled: function(enemyId) {
        if (!player.bounty || !player.bounty.activeTasks) return;
        const module = this.taskModules[1]; // 剿灭是 Type 1
        if (!module) return;

        let updated = false;
        player.bounty.activeTasks.forEach(task => {
            if (task.type === 1) {
                if (module.onEnemyKilled(task, enemyId)) updated = true;
            }
        });
        if (updated) window.saveGame();
    }
};

if (window.ShopSystem) ShopSystem.register("悬赏榜", BountyBoard);
window.BountyBoard = BountyBoard;