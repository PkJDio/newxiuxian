/**
 * js/modules/ui_bounty.js
 * 玩家已接悬赏界面 (快捷键 T) - DOM性能优化版 v2.0
 */

window.UIBounty = {
    // 标记样式是否已注入
    _isStyleInjected: false,

    // 【优化1】CSS单例注入：全生命周期只执行一次，避免重复解析和重排
    _injectStyles: function() {
        if (this._isStyleInjected) return;

        const cssContent = `
            .bounty_list_container { display: flex; flex-direction: column; gap: 20px; padding: 10px; font-family: "KaiTi", "楷体", serif; min-height: 100%; }
            .bounty_item { position: relative; border: 2px solid #d4c4a8; border-radius: 8px; padding: 25px; background-color: #fffdf5; box-shadow: 0 4px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; }
            .bounty_header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 2px dashed #e0d0b0; padding-bottom: 12px; position: relative; z-index: 1; }
            .bounty_title { font-size: 28px; font-weight: bold; color: #5d4037; }
            .bounty_diff { font-size: 24px; color: #ffa000; letter-spacing: 5px; }
            
            /* 城镇位置显示 */
            .bounty_location { font-size: 18px; color: #795548; margin-bottom: 15px; font-weight: bold; display:flex; align-items:center; gap:5px; }
            .bounty_location_icon { font-size: 20px; }

            .bounty_body { margin-bottom: 20px; position: relative; z-index: 1; }
            .bounty_desc { font-size: 22px; line-height: 1.6; color: #444; margin-bottom: 10px; width: 100%; }
            
            .bounty_progress_container { margin-top: 15px; background: rgba(0,0,0,0.03); padding: 10px 15px; border-radius: 6px; font-size: 20px; border-left: 4px solid #8d6e63; }
            .bounty_progress_row { font-weight: bold; color: #d84315; }
            .progress_done { color: #2e7d32; }

            .bounty_footer { display: flex; justify-content: space-between; align-items: center; font-size: 20px; color: #666; background: rgba(0,0,0,0.02); padding: 10px; border-radius: 6px; margin-top: 10px; position: relative; z-index: 2; }
            .bounty_reward { font-weight: bold; color: #b8860b; font-size: 22px; }

            /* 印章样式 */
            .bounty_stamp { position: absolute; top: 50%; right: 30%; transform: translateY(-50%) rotate(-20deg); width: 140px; height: 140px; display: flex; justify-content: center; align-items: center; border: 6px solid; border-radius: 12px; font-size: 36px; font-weight: 900; z-index: 5; pointer-events: none; opacity: 0.8; mix-blend-mode: multiply; box-shadow: inset 0 0 20px rgba(0,0,0,0.1); }
            .bounty_stamp::after { content: ''; position: absolute; top: 6px; left: 6px; right: 6px; bottom: 6px; border: 2px solid inherit; border-radius: 4px; }
            
            .stamp_active { color: #1b5e20; border-color: #1b5e20; background: transparent; }
            .stamp_completed { color: #b71c1c; border-color: #b71c1c; background: transparent; }
            .stamp_abandoned { color: #616161; border-color: #616161; background: transparent; transform: translateY(-50%) rotate(10deg); }
            .stamp_finished { color: #5d4037; border-color: #5d4037; background: transparent; transform: translateY(-50%) rotate(-5deg); opacity: 0.6; }

            .btn_abandon { font-size: 20px; padding: 6px 18px; background-color: #fff; border: 2px solid #ef5350; color: #ef5350; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s; position: relative; z-index: 10; }
            .btn_abandon:hover { background-color: #ef5350; color: white; }

            .bounty_item.style-gray { background-color: #f2f2f2; }
            .bounty_item.style-gray .bounty_title { text-decoration: line-through; opacity: 0.5; }
            .bounty_item.style-gray .bounty_desc, .bounty_item.style-gray .bounty_reward, .bounty_item.style-gray .bounty_location { opacity: 0.5; }
            .bounty_item.style-gray .bounty_diff { filter: grayscale(100%); opacity: 0.3; }

            .empty_tip { font-size: 24px; text-align: center; padding: 60px; color: #888; border: 2px dashed #ccc; border-radius: 10px; margin: 20px; }
        `;

        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-bounty';
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);

        this._isStyleInjected = true;
        // console.log("悬赏UI样式已注入 (单例)");
    },

    // 打开界面
    open: function() {
        // 1. 优先注入样式
        this._injectStyles();

        const contentHtml = this.renderContent();

        if (window.showGeneralModal) {
            window.showGeneralModal(
                '已接悬赏',
                contentHtml,
                null,
                "modal_my_bounty",
                "70vw",
                "80vh"
            );
            // --- 修复部分：添加延时触发 ---
            if (window.UITutorial && window.UITutorial.checkBuilding) {
                const player = window.player;
                // 只有当有任务时才触发引导
                if (player && player.bounty && player.bounty.activeTasks && player.bounty.activeTasks.length > 0) {
                    // 延时 300-500ms 确保 Modal 渲染完毕
                    setTimeout(() => {
                        window.UITutorial.checkBuilding('bounty_list');
                    }, 400);
                }
            }
        } else {
            console.error("未找到 Modal 组件 (utils_modal.js)");
        }


    },

    // 辅助：获取任务对应的处理模块
    _getTaskModule: function(type) {
        if (window.BountyBoard && window.BountyBoard.taskModules && window.BountyBoard.taskModules[type]) {
            return window.BountyBoard.taskModules[type];
        }
        if (type === 1) return window.TaskExterminate;
        if (type === 2) return window.TaskDelivery;
        if (type === 3) return window.TaskCollect;
        return null;
    },

    // 辅助：根据ID查找城镇名称
    _getTownName: function(townId) {
        if (!townId) return "未知地点";

        // 1. 尝试从全局 WorldData 查找
        if (window.WORLD_TOWNS) {
            // 数组情况
            if (Array.isArray(window.WORLD_TOWNS)) {
                const t = window.WORLD_TOWNS.find(x => x.id === townId);
                if (t) return t.name;
            }
            // 对象情况 { townId: data }
            else if (window.WORLD_TOWNS[townId]) {
                return window.WORLD_TOWNS[townId].name;
            }
            // 区域对象情况 { region1: [towns...], ... }
            else {
                for (let key in window.WORLD_TOWNS) {
                    if (Array.isArray(window.WORLD_TOWNS[key])) {
                        const t = window.WORLD_TOWNS[key].find(x => x.id === townId);
                        if (t) return t.name;
                    }
                }
            }
        }

        // 2. 尝试从 GAME_DB 查找
        if (window.GAME_DB && window.GAME_DB.map) {
            const t = window.GAME_DB.map.find(x => x.id === townId);
            if (t) return t.name;
        }

        return townId;
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

        const callbackName = `_cb_abandon_${Date.now()}`;

        // 绑定临时回调
        window[callbackName] = () => {
            task.status = 'abandoned';
            if (typeof window.saveGame === 'function') window.saveGame();
            else if (typeof window.saveData === 'function') window.saveData();

            window.closeModal();
            setTimeout(() => {
                window.UIBounty.open();
            }, 100);

            // 执行完毕后立即清理
            delete window[callbackName];
        };

        const footerHtml = `
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <button class="ink_btn_normal" onclick="window.closeModal()" style="font-size:18px; padding:6px 15px;">再想想</button>
                <button class="ink_btn_danger" onclick="window['${callbackName}']()" style="font-size:18px; padding:6px 15px;">💔 确定</button>
            </div>
        `;

        window.showGeneralModal(confirmTitle, confirmContent, footerHtml, "modal_confirm_small", "380px", "auto");
    },

    // 生成内容 HTML (不再包含 <style>)
    renderContent: function() {
        const player = window.State && window.State.player ? window.State.player : window.player;



        if (!player || !player.bounty || !player.bounty.activeTasks || player.bounty.activeTasks.length === 0) {
            return `
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

            // 状态判断
            if (task.status === 'failed') {
                stampText = '失败'; stampClass = 'stamp_abandoned'; itemStyleClass = 'style-gray'; showAbandonBtn = false;
            } else if (task.status === 'completed') {
                stampText = '可交付'; stampClass = 'stamp_completed'; showAbandonBtn = false;
            } else if (task.status === 'abandoned') {
                stampText = '已放弃'; stampClass = 'stamp_abandoned'; itemStyleClass = 'style-gray'; showAbandonBtn = false;
            } else if (task.status === 'finished') {
                stampText = '已完成'; stampClass = 'stamp_finished'; itemStyleClass = 'style-gray'; showAbandonBtn = false;
            }

            const d = task.deadline;
            const deadlineStr = `${d.year}年${d.month}月${d.day}日`;
            const townName = this._getTownName(task.townId);

            // 进度显示
            let progressHtml = '';
            const module = this._getTaskModule(task.type);

            if (module && typeof module.getProgressHtml === 'function' && task.status !== 'abandoned') {
                const moduleHtml = module.getProgressHtml(task);
                if (moduleHtml) progressHtml = `<div id="bounty_progress_container" class="bounty_progress_container">${moduleHtml}</div>`;
            }

            // 通用进度兜底
            if (!progressHtml && task.status !== 'abandoned' && task.status !== 'failed') {
                const current = task.currentCount || 0;
                const total = task.targetCount;
                if (total && total > 0) {
                    const isDone = current >= total;
                    const colorClass = isDone ? 'progress_done' : '';
                    progressHtml = `
                    <div  class="bounty_progress_container">
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
                
                <div class="bounty_location">
                    <span class="bounty_location_icon">📍</span>
                    <span>所属城镇：${townName}</span>
                </div>

                <div class="bounty_body">
                    <p class="bounty_desc">${task.desc}</p>
                    ${progressHtml}
                </div>

                <div class="bounty_footer">
                    <div>
                        <span class="bounty_reward">💰 ${task.rewardMoney}</span>
                        <span style="margin:0 15px; color:#ccc;">|</span>
                        <span id="bounty_deadline" class="bounty_deadline">截止: ${deadlineStr}</span>
                    </div>
                    
                    <div style="z-index: 10;">
                        ${abandonBtnHtml}
                    </div>
                </div>
            </div>`;
        });

        return '<div id="bounty_list_container" class="bounty_list_container">' + listHtml + '</div>';
    }
};