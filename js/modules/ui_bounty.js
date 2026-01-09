/**
 * js/modules/ui_bounty.js
 * 玩家已接悬赏界面 (快捷键 T)
 * 更新：
 * 1. 修复：恢复进度显示逻辑，正确调用子模块显示 "野狗 0/1" 等详细进度
 * 2. 保持：大窗口、印章、放弃功能、自动存档
 */

window.UIBounty = {
    // 打开界面
    open: function() {
        const contentHtml = this.renderContent();

        if (window.showGeneralModal) {
            // 大窗口模式
            window.showGeneralModal(
                '已接悬赏',
                contentHtml,
                null,
                "modal_my_bounty",
                "70vw",
                "80vh"
            );
        } else {
            console.error("未找到 Modal 组件 (utils_modal.js)");
        }
    },

    // 核心：处理放弃任务逻辑
    abandonTask: function(index) {
        const player = window.State && window.State.player ? window.State.player : window.player;
        if (!player || !player.bounty || !player.bounty.activeTasks) return;

        const task = player.bounty.activeTasks[index];
        if (!task) return;

        const confirmTitle = "⚠️ 放弃确认";
        const confirmContent = `
            <div style="font-size: 20px; line-height: 1.5; padding: 5px 10px;">
                <p>确定要放弃 <span style="color:#8b4513; font-weight:bold;">${task.title}</span> 吗？</p>
                <p style="margin-top:10px; color:#d9534f; font-size:18px; border-top: 1px dashed #eee; padding-top:10px;">
                    <small>放弃后将无法获得奖励。</small>
                </p>
            </div>
        `;

        const callbackName = `_temp_abandon_${Date.now()}`;
        window[callbackName] = () => {
            task.status = 'abandoned';
            console.log(`用户放弃了悬赏: ${task.title}`);

            // 自动存档
            if (typeof window.saveGame === 'function') {
                window.saveGame();
            } else if (typeof window.saveData === 'function') {
                window.saveData();
            }

            window.closeModal(); // 关闭确认小窗

            // 稍作延迟后重新打开主界面
            setTimeout(() => {
                window.UIBounty.open();
            }, 100);
            delete window[callbackName];
        };

        const footerHtml = `
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <button class="ink_btn_normal" onclick="window.closeModal()" style="font-size:18px; padding:6px 15px;">再想想</button>
                <button class="ink_btn_danger" onclick="window['${callbackName}']()" style="font-size:18px; padding:6px 15px;">💔 确定</button>
            </div>
        `;

        window.showGeneralModal(
            confirmTitle,
            confirmContent,
            footerHtml,
            "modal_confirm_small",
            "380px",
            "auto"
        );
    },

    // 生成内容 HTML
    renderContent: function() {
        const player = window.State && window.State.player ? window.State.player : window.player;

        const style = `
        <style>
            .bounty_list_container {
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 10px;
                font-family: "KaiTi", "楷体", serif;
                min-height: 100%;
            }

            .bounty_item {
                position: relative; 
                border: 2px solid #d4c4a8; 
                border-radius: 8px;
                padding: 25px;
                background-color: #fffdf5; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
            }

            .bounty_header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 2px dashed #e0d0b0;
                padding-bottom: 12px;
                position: relative;
                z-index: 1; 
            }
            .bounty_title {
                font-size: 28px; 
                font-weight: bold;
                color: #5d4037; 
            }
            .bounty_diff {
                font-size: 24px;
                color: #ffa000;
                letter-spacing: 5px;
            }

            .bounty_body {
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
            }
            .bounty_desc {
                font-size: 22px; 
                line-height: 1.6;
                color: #444;
                margin-bottom: 10px;
                width: 100%; 
            }
            
            /* 进度显示容器样式 */
            .bounty_progress_container {
                margin-top: 15px;
                background: rgba(0,0,0,0.03);
                padding: 10px 15px;
                border-radius: 6px;
                font-size: 20px;
                border-left: 4px solid #8d6e63;
            }
            /* 兼容通用进度 */
            .bounty_progress_row {
                font-weight: bold;
                color: #d84315; 
            }
            .progress_done {
                color: #2e7d32; 
            }

            .bounty_footer {
                display: flex;
                justify-content: space-between; 
                align-items: center;
                font-size: 20px;
                color: #666;
                background: rgba(0,0,0,0.02);
                padding: 10px;
                border-radius: 6px;
                margin-top: 10px;
                position: relative;
                z-index: 2; 
            }
            .bounty_reward {
                font-weight: bold;
                color: #b8860b;
                font-size: 22px;
            }

            /* --- 印章样式 --- */
            .bounty_stamp {
                position: absolute;
                top: 50%;
                right: 30%; 
                transform: translateY(-50%) rotate(-20deg); 
                width: 140px;
                height: 140px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 6px solid; 
                border-radius: 12px;
                font-size: 36px;
                font-weight: 900;
                z-index: 5; 
                pointer-events: none;
                opacity: 0.8; 
                mix-blend-mode: multiply;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.1); 
            }
            
            .bounty_stamp::after {
                content: '';
                position: absolute;
                top: 6px; left: 6px; right: 6px; bottom: 6px;
                border: 2px solid inherit; 
                border-radius: 4px;
            }

            .stamp_active { color: #1b5e20; border-color: #1b5e20; background: transparent; }
            .stamp_completed { color: #b71c1c; border-color: #b71c1c; background: transparent; }
            .stamp_abandoned { 
                color: #616161; border-color: #616161; background: transparent; 
                transform: translateY(-50%) rotate(10deg); 
            }

            .btn_abandon {
                font-size: 20px;
                padding: 6px 18px;
                background-color: #fff;
                border: 2px solid #ef5350;
                color: #ef5350;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.2s;
                position: relative; 
                z-index: 10; 
            }
            .btn_abandon:hover {
                background-color: #ef5350;
                color: white;
            }

            .bounty_item.style-gray { background-color: #f2f2f2; }
            .bounty_item.style-gray .bounty_title { text-decoration: line-through; opacity: 0.5; }
            .bounty_item.style-gray .bounty_desc, .bounty_item.style-gray .bounty_reward { opacity: 0.5; }
            .bounty_item.style-gray .bounty_diff { filter: grayscale(100%); opacity: 0.3; }

            .empty_tip { font-size: 24px; text-align: center; padding: 60px; color: #888; border: 2px dashed #ccc; border-radius: 10px; margin: 20px; }
        </style>
        `;

        if (!player || !player.bounty || !player.bounty.activeTasks || player.bounty.activeTasks.length === 0) {
            return style + `
                <div class="bounty_list_container">
                    <div class="empty_tip">
                        <p>📭 暂无任务</p>
                        <p style="font-size:20px; margin-top:20px; color:#aaa;">请前往【城镇告示牌】查看悬赏</p>
                    </div>
                </div>`;
        }

        const tasks = player.bounty.activeTasks;
        let listHtml = '';

        tasks.forEach((task, index) => {
            let stampText = '进行中';
            let stampClass = 'stamp_active';
            let itemStyleClass = '';
            let showAbandonBtn = true;

            if (task.status === 'failed') {
                stampText = '失败';
                stampClass = 'stamp_abandoned';
                itemStyleClass = 'style-gray';
                showAbandonBtn = false;
            } else if (task.status === 'completed') {
                stampText = '可交付';
                stampClass = 'stamp_completed';
                showAbandonBtn = false;
            } else if (task.status === 'abandoned') {
                stampText = '已放弃';
                stampClass = 'stamp_abandoned';
                itemStyleClass = 'style-gray';
                showAbandonBtn = false;
            }

            const d = task.deadline;
            const deadlineStr = `${d.year}年${d.month}月${d.day}日`;

            // --- 进度显示逻辑 ---
            let progressHtml = '';

            // 1. 优先尝试使用 BountyBoard 中注册的模块来生成进度 HTML (适配剿灭任务的多目标显示)
            if (task.status !== 'abandoned' && window.BountyBoard && window.BountyBoard.taskModules) {
                const module = window.BountyBoard.taskModules[task.type];
                if (module && typeof module.getProgressHtml === 'function') {
                    // 模块返回的 HTML (如 "野狗 0/1")
                    const moduleHtml = module.getProgressHtml(task);
                    if (moduleHtml) {
                        progressHtml = `<div class="bounty_progress_container">${moduleHtml}</div>`;
                    }
                }
            }

            // 2. 如果模块没返回内容，尝试使用通用的 currentCount/targetCount (适配收集/求购任务)
            if (!progressHtml && task.status !== 'abandoned' && task.status !== 'failed') {
                const current = task.currentCount || 0;
                const total = task.targetCount;
                if (total && total > 0) {
                    const isDone = current >= total;
                    const colorClass = isDone ? 'progress_done' : '';
                    progressHtml = `
                    <div class="bounty_progress_container">
                        <div class="bounty_progress_row ${colorClass}">
                            当前进度：${current} / ${total}
                        </div>
                    </div>`;
                }
            }

            const abandonBtnHtml = showAbandonBtn
                ? `<button class="btn_abandon" onclick="window.UIBounty.abandonTask(${index})">放弃任务</button>`
                : '';

            listHtml += `
            <div class="bounty_item ${itemStyleClass}">
                <div class="bounty_stamp ${stampClass}">
                    <span>${stampText}</span>
                </div>

                <div class="bounty_header">
                    <span class="bounty_title">${task.title}</span>
                    <span class="bounty_diff">${'⭐'.repeat(task.difficulty)}</span>
                </div>
                
                <div class="bounty_body">
                    <p class="bounty_desc">${task.desc}</p>
                    ${progressHtml}
                </div>

                <div class="bounty_footer">
                    <div>
                        <span class="bounty_reward">💰 ${task.rewardMoney}</span>
                        <span style="margin:0 15px; color:#ccc;">|</span>
                        <span class="bounty_deadline">截止: ${deadlineStr}</span>
                    </div>
                    
                    <div style="z-index: 10;">
                        ${abandonBtnHtml}
                    </div>
                </div>
            </div>
            `;
        });

        return style + '<div class="bounty_list_container">' + listHtml + '</div>';
    }
};