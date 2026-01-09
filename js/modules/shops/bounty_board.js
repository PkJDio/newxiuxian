// js/modules/shops/bounty_board.js
// 悬赏榜主控模块 v3.2 (移除进行中按钮占位 & 统一放弃确认窗)
console.log("加载 悬赏榜主控模块");

const BountyBoard = {
    currentTown: null,
    modalBody: null,
    selectedTaskIndex: -1,
    currentTasks: [],

    // 注册子模块的映射
    taskModules: {
        1: null, // TaskExterminate (剿灭)
        2: null, // TaskDelivery (跑腿)
        3: null  // TaskCollect (收集)
    },

    _initModules: function() {
        if (window.TaskExterminate) this.taskModules[1] = window.TaskExterminate;
        if (window.TaskDelivery)    this.taskModules[2] = window.TaskDelivery;
        if (window.TaskCollect)     this.taskModules[3] = window.TaskCollect;
    },

    _initData: function() {
        if (!player.bounty) {
            player.bounty = {
                prosperity: {},   // 繁荣度 { townId: number }
                activeTasks: [],  // 已接取的任务列表
                finishedIds: []   // 本月已完成的任务ID
            };
        }
        if (!player.bounty.prosperity) player.bounty.prosperity = {};
        this._initModules();
    },

    // ================= 入口函数 =================
    enter: function(town) {
        this._initData();
        this.currentTown = town;

        if (player.bounty.prosperity[town.id] === undefined) {
            player.bounty.prosperity[town.id] = 0;
            if(window.saveGame) window.saveGame();
        }

        this._checkTaskExpiration();

        this.selectedTaskIndex = -1;
        this._generateMonthlyTasks(town);
        this.renderUI();
    },

    // ================= 核心：生成本月任务 =================
    _generateMonthlyTasks: function(town) {
        if (!window.getSeededRandom || !player) return;
        const time = player.time;
        const seedKey = `bounty_${town.id}_${time.year}_${time.month}`;

        let baseCount = 3;
        if (town.level === 'city') baseCount = 5;
        else if (town.level === 'town') baseCount = 4;

        const pros = this.getProsperity(town.id);
        let bonus = 0;
        if (pros >= 500) bonus = 3;
        else if (pros >= 300) bonus = 2;
        else if (pros >= 100) bonus = 1;

        const targetCount = baseCount + bonus;
        this.currentTasks = [];

        // 使用 while 循环尝试生成，确保数量补足 (参考之前的修复)
        let attempts = 0;
        let successCount = 0;
        const MAX_ATTEMPTS = 20;

        while (successCount < targetCount && attempts < MAX_ATTEMPTS) {
            const taskSeed = `${seedKey}_${attempts}`;
            const taskId = `${taskSeed}_id`;
            attempts++;

            if (player.bounty.finishedIds.includes(taskId)) continue;

            const active = player.bounty.activeTasks.find(t => t.id === taskId);
            if (active) {
                this.currentTasks.push(active);
                successCount++;
                continue;
            }

            const typeRand = window.getSeededRandom(taskSeed, "type");
            let type = 1;
            if (typeRand > 0.4) type = 2;
            if (typeRand > 0.7) type = 3;

            const module = this.taskModules[type];
            if (module) {
                const diffRand = window.getSeededRandom(taskSeed, "diff");
                let difficulty = Math.floor(diffRand * 5) + 1;
                const taskData = module.generate(town, taskSeed, difficulty, attempts);

                if (taskData) {
                    taskData.id = taskId;
                    taskData.townId = town.id;
                    taskData.difficulty = difficulty;
                    taskData.status = 'open';

                    let deadlineYear = time.year;
                    let deadlineMonth = time.month;
                    let deadlineDay = 30;

                    if (taskData.daysLimit) {
                        let totalDays = time.day + taskData.daysLimit;
                        if (totalDays > 30) {
                            deadlineMonth++;
                            deadlineDay = totalDays - 30;
                            if (deadlineMonth > 12) {
                                deadlineMonth = 1;
                                deadlineYear++;
                            }
                        } else {
                            deadlineDay = totalDays;
                        }
                    }

                    taskData.deadline = {
                        year: deadlineYear,
                        month: deadlineMonth,
                        day: deadlineDay
                    };

                    this.currentTasks.push(taskData);
                    successCount++;
                }
            }
        }
    },

    _checkTaskExpiration: function() {
        const curTimeVal = this._getDateValue(player.time);
        player.bounty.activeTasks.forEach(task => {
            if (task.status === 'active') {
                const deadlineVal = this._getDateValue(task.deadline);
                if (curTimeVal > deadlineVal) {
                    task.status = 'failed';
                }
            }
        });
    },

    _getDateValue: function(t) {
        return t.year * 360 + t.month * 30 + t.day;
    },

    // ================= UI 渲染 =================
    renderUI: function() {
        const townName = this.currentTown.name;
        const prosperity = this.getProsperity(this.currentTown.id);

        const html = `
            <div class="bounty-container" style="display:flex; height:100%; background:#fcf8e3; font-family:'Kaiti';">
                <div class="bounty-list" style="width:40%; border-right:2px solid #5d4037; overflow-y:auto; background:#fff8e1; display:flex; flex-direction:column;">
                    
                    <div style="padding:18px 15px; background:#5d4037; color:#fff; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; border-bottom:3px solid #3e2723;">
                        <span style="font-size:22px; font-weight:bold; letter-spacing:1px;">📜 ${townName}悬赏榜</span>
                        <span style="font-size:20px; font-weight:bold; color:#ffb74d; text-shadow:1px 1px 2px rgba(0,0,0,0.5);">
                            繁荣度 ${prosperity}
                        </span>
                    </div>

                    <div id="bounty-items-container" style="flex:1; overflow-y:auto; padding-top:5px;">
                        ${this._renderTaskList()}
                    </div>
                </div>

                <div class="bounty-detail" style="flex:1; padding:20px; display:flex; flex-direction:column;">
                    <div id="bounty-detail-content" style="flex:1;">
                        <div style="text-align:center; color:#999; margin-top:100px;">
                            请点击左侧榜单查看详情
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`悬赏榜`, html, null, "modal_bounty", 85, 80);
    },

    _renderTaskList: function() {
        if (this.currentTasks.length === 0) return '<div style="padding:20px; text-align:center; color:#999;">本月暂无悬赏</div>';

        return this.currentTasks.map((task, idx) => {
            const isActive = player.bounty.activeTasks.find(t => t.id === task.id);
            let statusBadge = '<span style="color:#e65100; font-weight:bold;">[待揭榜]</span>';

            if (isActive) {
                if (isActive.status === 'failed') statusBadge = '<span style="color:gray;">[已失效]</span>';
                else if (isActive.status === 'abandoned') statusBadge = '<span style="color:#9e9e9e;">[已放弃]</span>';
                else if (isActive.status === 'completed') statusBadge = '<span style="color:#d32f2f; font-weight:bold;">[可交付]</span>';
                else statusBadge = '<span style="color:#2e7d32; font-weight:bold;">[进行中]</span>';
            }

            const bg = (this.selectedTaskIndex === idx) ? '#ffe0b2' : 'transparent';
            const stars = '⭐'.repeat(task.difficulty);

            return `
                <div class="bounty-item-row" onclick="BountyBoard.selectTask(${idx})" 
                     style="padding:15px; border-bottom:1px solid #e0e0e0; cursor:pointer; background:${bg}; transition:0.2s;">
                    <div style="font-weight:bold; font-size:18px; color:#3e2723; margin-bottom:6px;">${task.title}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px;">
                        <span style="color:#f57f17;">${stars}</span>
                        ${statusBadge}
                    </div>
                </div>
            `;
        }).join('');
    },

    // 选中任务，渲染右侧
    selectTask: function(index) {
        this.selectedTaskIndex = index;
        const rows = document.querySelectorAll('.bounty-item-row');
        rows.forEach((r, i) => r.style.background = (i === index ? '#ffe0b2' : 'transparent'));

        const task = this.currentTasks[index];
        const activeTask = player.bounty.activeTasks.find(t => t.id === task.id);
        const displayTask = activeTask || task;

        const module = this.taskModules[displayTask.type];
        const progressHtml = module ? module.getProgressHtml(displayTask) : '';

        // 生成底部按钮
        let actionBtn = '';

        if (displayTask.status === 'failed') {
            actionBtn = `<button class="ink_btn disabled" style="background:#bdbdbd; cursor:not-allowed;">已 过 期</button>`;
        } else if (displayTask.status === 'abandoned') {
            actionBtn = `<button class="ink_btn disabled" style="background:#e0e0e0; color:#999; cursor:not-allowed;">已 放 弃</button>`;
        } else if (activeTask) {
            // 已接取 (进行中 或 可交付)
            const canSubmit = module && module.checkCompletion(activeTask, this.currentTown);
            if (canSubmit) {
                // 可交付
                actionBtn = `<button class="ink_btn" onclick="BountyBoard.submitTask('${displayTask.id}')" style="background:#d32f2f; color:#fff; font-size:18px; padding:10px 30px; box-shadow: 0 4px #b71c1c;">✅ 交付任务</button>`;
            } else {
                // 【核心修改1】：进行中状态 - 只显示放弃按钮，移除 "任务进行中..." 占位符
                actionBtn = `
                    <button class="ink_btn" onclick="BountyBoard.abandonTask('${displayTask.id}')" style="background:#ef5350; color:#fff; font-size:18px; padding:8px 30px; box-shadow: 0 4px #c62828;">💔 放弃任务</button>
                `;
            }
        } else {
            // 未接取
            actionBtn = `<button class="ink_btn" onclick="BountyBoard.acceptTask(${index})" style="background:#ff9800; color:#fff; font-size:18px; padding:10px 30px; box-shadow: 0 4px #f57c00;">📜 揭榜接取</button>`;
        }

        const d = displayTask.deadline;
        const deadlineStr = `${d.year}年${d.month}月${d.day}日`;
        let rewardHtml = `<span style="color:#f57f17; font-weight:bold; font-size:18px;">💰 ${displayTask.rewardMoney} 文</span>`;

        const container = document.getElementById('bounty-detail-content');
        if (container) {
            container.innerHTML = `
                <div style="border:4px double #5d4037; padding:30px; margin:10px; background:rgba(255,255,255,0.9); height:90%; position:relative; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    <div style="font-size:28px; font-weight:bold; text-align:center; margin-bottom:20px; color:#bf360c; border-bottom:2px solid #ddd; padding-bottom:15px;">
                        ${displayTask.title}
                    </div>
                    
                    <div style="font-size:18px; line-height:1.8; color:#3e2723;">
                        <div style="margin-bottom:20px; min-height:80px;">${displayTask.desc}</div>
                        
                        <div style="background:#fff3e0; padding:15px; border-radius:8px; margin-bottom:20px;">
                            <div style="margin-bottom:8px;">难度级别: ${'⭐'.repeat(displayTask.difficulty)}</div>
                            <div style="margin-bottom:8px;">任务赏金: ${rewardHtml}</div>
                            <div style="margin-bottom:8px;">截止时间: <span style="color:#d32f2f; font-weight:bold;">${deadlineStr}</span></div>
                        </div>

                        <div style="margin-top:20px; font-size:20px; text-align:center;">
                            ${progressHtml}
                        </div>
                    </div>

                    <div style="position:absolute; bottom:30px; left:0; width:100%; text-align:center;">
                        ${actionBtn}
                    </div>
                </div>
            `;
        }
    },

    // ================= 交互逻辑 =================
    acceptTask: function(index) {
        const task = JSON.parse(JSON.stringify(this.currentTasks[index]));
        task.status = 'active';

        const module = this.taskModules[task.type];
        if (module && module.onAccept) module.onAccept(task);

        player.bounty.activeTasks.push(task);
        if(window.showToast) window.showToast("已揭榜！请留意截止时间。");
        if(window.saveGame) window.saveGame();

        this.renderUI();
        this.selectTask(index);
    },

    // 【核心修改2】：重写放弃任务逻辑，使用统一的小尺寸弹窗
    abandonTask: function(taskId) {
        // 查找任务
        const index = player.bounty.activeTasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = player.bounty.activeTasks[index];

        // 构建弹窗内容 (与 ui_bounty.js 保持一致)
        const confirmTitle = "⚠️ 放弃确认";
        const confirmContent = `
            <div style="font-size: 20px; line-height: 1.5; padding: 5px 10px;">
                <p>确定要放弃 <span style="color:#8b4513; font-weight:bold;">${task.title}</span> 吗？</p>
                <p style="margin-top:10px; color:#d9534f; font-size:18px; border-top: 1px dashed #eee; padding-top:10px;">
                    <small>放弃后将无法获得奖励。</small>
                </p>
            </div>
        `;

        // 临时回调函数
        const callbackName = `_bb_abandon_${Date.now()}`;
        window[callbackName] = () => {
            // 执行放弃
            task.status = 'abandoned';
            if(window.showToast) window.showToast("已放弃悬赏任务。");
            if(window.saveGame) window.saveGame();

            // 关闭确认小窗
            window.closeModal();

            // 刷新悬赏榜大窗内容 (因为确认窗关闭后，BountyBoard 成为顶层，再次调用 showGeneralModal 会更新它)
            BountyBoard.renderUI();

            // 重新选中当前任务，以更新右侧按钮状态
            if (BountyBoard.selectedTaskIndex !== -1) {
                BountyBoard.selectTask(BountyBoard.selectedTaskIndex);
            }

            delete window[callbackName];
        };

        const footerHtml = `
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <button class="ink_btn_normal" onclick="window.closeModal()" style="font-size:18px; padding:6px 15px;">再想想</button>
                <button class="ink_btn_danger" onclick="window['${callbackName}']()" style="font-size:18px; padding:6px 15px;">💔 确定</button>
            </div>
        `;

        // 调用通用小弹窗 (380px 宽)
        window.showGeneralModal(
            confirmTitle,
            confirmContent,
            footerHtml,
            "modal_confirm_small",
            "380px",
            "auto"
        );
    },

    submitTask: function(taskId) {
        const index = player.bounty.activeTasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = player.bounty.activeTasks[index];
        const module = this.taskModules[task.type];

        if (!module || !module.checkCompletion(task, this.currentTown)) {
            if(window.showToast) window.showToast("条件未达成！");
            return;
        }

        if (module.onSubmit) module.onSubmit(task);

        if (window.player) window.player.money += task.rewardMoney;
        this.addProsperity(task.townId, task.difficulty);

        player.bounty.activeTasks.splice(index, 1);
        player.bounty.finishedIds.push(task.id);

        if(window.showToast) window.showToast(`任务完成！获得赏金 ${task.rewardMoney} 文`);
        if(window.saveGame) window.saveGame();

        this.enter(this.currentTown);
    },

    // ================= 辅助/钩子 =================
    getProsperity: function(townId) {
        return (player.bounty.prosperity && player.bounty.prosperity[townId]) || 0;
    },

    addProsperity: function(townId, val) {
        if (!player.bounty.prosperity) player.bounty.prosperity = {};
        const oldVal = player.bounty.prosperity[townId] || 0;
        player.bounty.prosperity[townId] = oldVal + val;
    },

    onEnemyKilled: function(enemyId) {
        if (!player.bounty || !player.bounty.activeTasks) return;
        const module = this.taskModules[1]; // 剿灭
        if (!module) return;

        let updated = false;
        player.bounty.activeTasks.forEach(task => {
            if (task.type === 1 && task.status === 'active') {
                if (module.onEnemyKilled(task, enemyId)) updated = true;
            }
        });
        if (updated && window.saveGame) window.saveGame();
    }
};

if (window.ShopSystem) ShopSystem.register("悬赏榜", BountyBoard);
window.BountyBoard = BountyBoard;