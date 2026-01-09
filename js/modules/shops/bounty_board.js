// js/modules/shops/bounty_board.js
// 悬赏榜主控模块 v3.3 (任务交付后保留记录)
//console.log("加载 悬赏榜主控模块");

const BountyBoard = {
    currentTown: null,
    modalBody: null,
    selectedTaskIndex: -1,
    currentTasks: [],

    taskModules: {
        1: null, 2: null, 3: null
    },

    _initModules: function() {
        if (window.TaskExterminate) this.taskModules[1] = window.TaskExterminate;
        if (window.TaskDelivery)    this.taskModules[2] = window.TaskDelivery;
        if (window.TaskCollect)     this.taskModules[3] = window.TaskCollect;
    },

    _initData: function() {
        if (!player.bounty) {
            player.bounty = { prosperity: {}, activeTasks: [], finishedIds: [] };
        }
        if (!player.bounty.prosperity) player.bounty.prosperity = {};
        this._initModules();
    },

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

        // 【核心修改 A】：优先载入目标地是这里的活跃跑腿任务 (支持异地交付显示)
        if (player.bounty && player.bounty.activeTasks) {
            player.bounty.activeTasks.forEach(t => {
                // 如果是跑腿任务 且 目标地是当前城镇 且 状态是活跃
                if (t.type === 2 && t.targetTownId === town.id && t.status === 'active') {
                    this.currentTasks.push(t);
                }
            });
        }

        let attempts = 0;
        const MAX_ATTEMPTS = 20;

        // 根据剩余名额生成本地任务
        while (this.currentTasks.length < targetCount && attempts < MAX_ATTEMPTS) {
            const taskSeed = `${seedKey}_${attempts}`;
            const taskId = `${taskSeed}_id`;
            attempts++;

            // 检查该 ID 是否已在 activeTasks 中 (包含本地已揭榜的任务)
            const active = player.bounty.activeTasks.find(t => t.id === taskId);
            if (active) {
                // 只有当这个任务还没被上面的“异地载入”逻辑加进去时，才放入列表
                if (!this.currentTasks.find(exist => exist.id === active.id)) {
                    this.currentTasks.push(active);
                }
                continue;
            }

            // 检查历史记录，防止已彻底完成的任务复活
            if (player.bounty.finishedIds.includes(taskId)) continue;

            // --- 以下为生成新任务的原始逻辑 ---
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

                    // --- 【核心修复：统一月底截止逻辑】 ---
                    const time = window.player.time;
                    let deadlineYear = time.year;
                    let deadlineMonth = time.month;

                    // 默认期限为 7 天，如果任务自带 daysLimit (如收集任务给的 30) 则用自带的
                    let targetLimit = taskData.daysLimit || 7;

                    // 计算截止日：当前日期 + 期限，但最高不超过 30 号
                    let deadlineDay = Math.min(30, time.day + targetLimit);

                    // 直接赋值，不再进行月份进位 (确保不跨月)
                    taskData.deadline = {
                        year: deadlineYear,
                        month: deadlineMonth,
                        day: deadlineDay
                    };
                    // -------------------------------------

                    this.currentTasks.push(taskData);
                }
            }
        }
    },

    _checkTaskExpiration: function() {
        const curTimeVal = this._getDateValue(player.time);
        player.bounty.activeTasks.forEach(task => {
            if (task.status === 'active') {
                const deadlineVal = this._getDateValue(task.deadline);
                if (curTimeVal > deadlineVal) task.status = 'failed';
            }
        });
    },

    _getDateValue: function(t) { return t.year * 360 + t.month * 30 + t.day; },

    // ================= UI 渲染 =================
    renderUI: function() {
        const townName = this.currentTown.name;
        const prosperity = this.getProsperity(this.currentTown.id);

        const html = `
            <div class="bounty-container" style="display:flex; height:100%; background:#fcf8e3; font-family:'Kaiti';">
                <div class="bounty-list" style="width:40%; border-right:2px solid #5d4037; overflow-y:auto; background:#fff8e1; display:flex; flex-direction:column;">
                    <div style="padding:18px 15px; background:#5d4037; color:#fff; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; border-bottom:3px solid #3e2723;">
                        <span style="font-size:22px; font-weight:bold; letter-spacing:1px;">📜 ${townName}悬赏榜</span>
                        <span style="font-size:20px; font-weight:bold; color:#ffb74d; text-shadow:1px 1px 2px rgba(0,0,0,0.5);">繁荣度 ${prosperity}</span>
                    </div>
                    <div id="bounty-items-container" style="flex:1; overflow-y:auto; padding-top:5px;">
                        ${this._renderTaskList()}
                    </div>
                </div>
                <div class="bounty-detail" style="flex:1; padding:20px; display:flex; flex-direction:column;">
                    <div id="bounty-detail-content" style="flex:1;">
                        <div style="text-align:center; color:#999; margin-top:100px;">请点击左侧榜单查看详情</div>
                    </div>
                </div>
            </div>`;
        this.modalBody = window.showGeneralModal(`悬赏榜`, html, null, "modal_bounty", 85, 80);
    },

    _renderTaskList: function() {
        if (this.currentTasks.length === 0) return '<div style="padding:20px; text-align:center; color:#999;">本月暂无悬赏</div>';

        return this.currentTasks.map((task, idx) => {
            const isActive = player.bounty.activeTasks.find(t => t.id === task.id);
            let statusBadge = '<span style="color:#e65100; font-weight:bold;">[待揭榜]</span>';
            let rowClass = "";

            if (isActive) {
                if (isActive.status === 'failed') {
                    statusBadge = '<span style="color:gray;">[已失效]</span>';
                    rowClass = "item-gray"; // 变灰样式需CSS支持，或者直接内联style
                }
                else if (isActive.status === 'abandoned') {
                    statusBadge = '<span style="color:#9e9e9e;">[已放弃]</span>';
                    rowClass = "item-gray";
                }
                else if (isActive.status === 'finished') { // 【核心修改3】已完成状态
                    statusBadge = '<span style="color:#388e3c; font-weight:bold;">[已完成]</span>';
                    rowClass = "item-gray";
                }
                else if (isActive.status === 'completed') {
                    statusBadge = '<span style="color:#d32f2f; font-weight:bold;">[可交付]</span>';
                }
                else {
                    statusBadge = '<span style="color:#2e7d32; font-weight:bold;">[进行中]</span>';
                }
            }

            // 增加一点内联灰度样式
            const grayStyle = rowClass === 'item-gray' ? 'filter: grayscale(100%); opacity: 0.6;' : '';
            const bg = (this.selectedTaskIndex === idx) ? '#ffe0b2' : 'transparent';
            const stars = '⭐'.repeat(task.difficulty);

            return `
                <div class="bounty-item-row" onclick="BountyBoard.selectTask(${idx})" 
                     style="padding:15px; border-bottom:1px solid #e0e0e0; cursor:pointer; background:${bg}; transition:0.2s; ${grayStyle}">
                    <div style="font-weight:bold; font-size:18px; color:#3e2723; margin-bottom:6px;">${task.title}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:14px;">
                        <span style="color:#f57f17;">${stars}</span>
                        ${statusBadge}
                    </div>
                </div>`;
        }).join('');
    },

    selectTask: function(index) {
        this.selectedTaskIndex = index;
        const rows = document.querySelectorAll('.bounty-item-row');
        rows.forEach((r, i) => {
            // 保持选中高亮，同时保留灰度
            r.style.backgroundColor = (i === index ? '#ffe0b2' : 'transparent');
        });

        const task = this.currentTasks[index];
        const activeTask = player.bounty.activeTasks.find(t => t.id === task.id);
        const displayTask = activeTask || task;
        const module = this.taskModules[displayTask.type];
        const progressHtml = module ? module.getProgressHtml(displayTask) : '';

        let actionBtn = '';
        if (displayTask.status === 'failed') {
            actionBtn = `<button class="ink_btn disabled" style="background:#bdbdbd; cursor:not-allowed;">已 过 期</button>`;
        } else if (displayTask.status === 'abandoned') {
            actionBtn = `<button class="ink_btn disabled" style="background:#e0e0e0; color:#999; cursor:not-allowed;">已 放 弃</button>`;
        } else if (displayTask.status === 'finished') { // 【核心修改4】已完成状态
            actionBtn = `<button class="ink_btn disabled" style="background:#e0e0e0; color:#4caf50; border:1px solid #4caf50; cursor:not-allowed; font-weight:bold;">✨ 已 完 成</button>`;
        } else if (activeTask) {
            const canSubmit = module && module.checkCompletion(activeTask, this.currentTown);
            if (canSubmit) {
                actionBtn = `<button class="ink_btn" onclick="BountyBoard.submitTask('${displayTask.id}')" style="background:#d32f2f; color:#fff; font-size:18px; padding:10px 30px; box-shadow: 0 4px #b71c1c;">✅ 交付任务</button>`;
            } else {
                actionBtn = `<button class="ink_btn" onclick="BountyBoard.abandonTask('${displayTask.id}')" style="background:#ef5350; color:#fff; font-size:18px; padding:8px 30px; box-shadow: 0 4px #c62828;">💔 放弃任务</button>`;
            }
        } else {
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
                        <div style="margin-top:20px; font-size:20px; text-align:center;">${progressHtml}</div>
                    </div>
                    <div style="position:absolute; bottom:30px; left:0; width:100%; text-align:center;">${actionBtn}</div>
                </div>`;
        }
    },

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

    abandonTask: function(taskId) {
        const index = player.bounty.activeTasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = player.bounty.activeTasks[index];

        const confirmTitle = "⚠️ 放弃确认";
        const confirmContent = `
            <div style="font-size: 20px; line-height: 1.5; padding: 5px 10px;">
                <p>确定要放弃 <span style="color:#8b4513; font-weight:bold;">${task.title}</span> 吗？</p>
                <p style="margin-top:10px; color:#d9534f; font-size:18px; border-top: 1px dashed #eee; padding-top:10px;">
                    <small>放弃后将无法获得奖励。</small>
                </p>
            </div>`;

        const callbackName = `_bb_abandon_${Date.now()}`;
        window[callbackName] = () => {
            task.status = 'abandoned';
            if(window.showToast) window.showToast("已放弃悬赏任务。");
            if(window.saveGame) window.saveGame();
            window.closeModal();
            BountyBoard.renderUI();
            if (BountyBoard.selectedTaskIndex !== -1) BountyBoard.selectTask(BountyBoard.selectedTaskIndex);
            delete window[callbackName];
        };

        const footerHtml = `
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <button class="ink_btn_normal" onclick="window.closeModal()" style="font-size:18px; padding:6px 15px;">再想想</button>
                <button class="ink_btn_danger" onclick="window['${callbackName}']()" style="font-size:18px; padding:6px 15px;">💔 确定</button>
            </div>`;

        window.showGeneralModal(confirmTitle, confirmContent, footerHtml, "modal_confirm_small", "380px", "auto");
    },

    // 【核心修改5】提交任务逻辑重写
    submitTask: function(taskId) {
        const index = player.bounty.activeTasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = player.bounty.activeTasks[index];
        const module = this.taskModules[task.type];

        if (!module || !module.checkCompletion(task, this.currentTown)) {
            if(window.showToast) window.showToast("交付条件未达成！");
            return;
        }

        if (module.onSubmit) module.onSubmit(task);

        // 1. 发放奖励
        window.player.money += task.rewardMoney;

        // 2. 【核心修改】：双城繁荣度奖励 (跑腿任务同时给起点和终点加)
        if (task.type === 2) {
            this.addProsperity(task.originTownId || task.townId, task.difficulty); // 起点
            this.addProsperity(this.currentTown.id, task.difficulty); // 目的地
        } else {
            this.addProsperity(task.townId, task.difficulty);
        }

        task.status = 'finished';
        if (!player.bounty.finishedIds.includes(task.id)) {
            player.bounty.finishedIds.push(task.id);
        }

        if(window.showToast) window.showToast(`任务完成！获得赏金 ${task.rewardMoney} 文`);
        if(window.saveGame) window.saveGame();

        this.renderUI();
        if (this.selectedTaskIndex !== -1) this.selectTask(this.selectedTaskIndex);
    },

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
        if (!this.taskModules[1]) {
            //console.log("[BountyBoard] 检测到模块未初始化，正在自动加载...");
            this._initModules();
        }
        const module = this.taskModules[1];
        if (!module) return;

        let updated = false;
        player.bounty.activeTasks.forEach(task => {
            if (task.type === 1 && task.status === 'active') {
                if (module.onTaskEnemyKilled(task, enemyId)) updated = true;
            }
        });
        if (updated && window.saveGame) window.saveGame();
    }
};

if (window.ShopSystem) ShopSystem.register("悬赏榜", BountyBoard);
window.BountyBoard = BountyBoard;