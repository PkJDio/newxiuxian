// js/modules/ui_fish.js
// 垂钓界面 UI v9.0 (适配水草封锁)

const UIFish = {
    modalBody: null,
    isAnimating: false,

    open: function() {
        this._injectStyles();
        // 【核心修改】：每次打开 UI 时，强制重新初始化鱼池数据
        // 这样可以确保玩家“关闭再打开”后，看到的是一个全新的池子
        if (window.UtilFish) {
            window.UtilFish.init();      // 确保基础状态正确
            window.UtilFish.refreshPond(); // 强制刷新格子、次数和清除 Buff
        }

        this._renderContent();

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            this.modalBody = window.UtilsModal.showInteractiveModal("寒江独钓", this.lastContentHtml, null, "modal_fishing_grid", 68, 80);
        }

        this._syncGridWithState();
        this._updateStatsUI();
    },

    _renderContent: function() {
        const info = window.UtilFish ? window.UtilFish.getInfo() : { levelName:"?", remainingFish:0, attempts:0, maxAttempts:0, rodBonus:0 };

        this.lastContentHtml = `
    <div class="fish_layout">
        <div class="fish_grid_board" id="fish_grid_board">
            ${this._generateGridHtml()}
        </div>

        <div class="fish_info_panel">
            <div class="fish_stats_row">
                <div class="fish_stat_item">
                    <span class="stat_label">垂钓境界</span>
                    <span class="stat_val">${info.levelName}</span>
                </div>
                <div class="fish_stat_item">
                    <span class="stat_label">钓具加成</span>
                    <span class="stat_val" style="color:#2b58a6;">+${info.rodBonus || 0}%</span>
                </div>
                <div class="fish_stat_item" style="flex:1.5;">
                    <span class="stat_label">消耗 <span id="ui_fish_cur_stats">...</span></span>
                    <span class="stat_val">10饱食 / 5疲劳</span>
                </div>
                <div class="fish_stat_item" id="ui_fish_attempts">
                    <span class="stat_label">剩余次数</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="stat_val" style="color:#e65100;">${info.attempts} / ${info.maxAttempts}</span>
                    </div>
                </div>
                <div class="fish_stat_item">
                    <span class="stat_label">查看鱼池图鉴</span>
                    <button class="ink_btn_mini" onclick="UIFish.showPondGallery()">🐟</button>
                </div>
            </div>

            <div class="fish_action_row">
                <div class="fish_rules" style="flex:1; text-align:left;">
                    <p>※ 点击水面下竿，数字代表周围鱼数。</p>
                    <p>※ 消耗尽后池塘自动刷新，刷新后奇遇消失。</p>
                </div>
                <div class="fish_btns">
                    <button class="ink_btn_small" style="background:#5d4037;" onclick="UIFish.showFoodInventory()">🎒 背包</button>
                    <button class="ink_btn_small" onclick="UIFish.onClickRest()">🍵 休憩</button>
                    <button class="ink_btn_small btn_refresh" onclick="UIFish.onClickRefresh()">🔄 刷新</button>
                </div>
            </div>
        </div>
    </div>
    `;
    },
    /**
     * 【新增】显示专门用于垂钓进食的背包窗口
     */
    showFoodInventory: function() {
        const p = window.player;
        if (!p || !p.inventory) return;

        // 1. 筛选 food 和 fish
        let foodList = p.inventory.filter(slot => {
            if (!slot) return false;
            return slot.type === 'food' || slot.type === 'fish';
        });

        // 2. 排序逻辑：类型(food优先) -> 稀有度(高优先) -> 饱食度(大优先)
        foodList.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'food' ? -1 : 1;
            if (a.rarity !== b.rarity) return b.rarity - a.rarity;
            const hungerA = (a.effects && a.effects.hunger) || 0;
            const hungerB = (b.effects && b.effects.hunger) || 0;
            return hungerB - hungerA;
        });

        // 3. 构建 HTML
        let listHtml = `<div class="fish_food_inv">`;
        if (foodList.length === 0) {
            listHtml += `<div style="text-align:center; padding:20px; color:#888;">包里没吃的了...</div>`;
        } else {
            foodList.forEach(item => {
                const hunger = (item.effects && item.effects.hunger) || 0;
                const rarityColor = window.RARITY_CONFIG[item.rarity]?.color || "#333";
                listHtml += `
                <div class="food_inv_row" onmouseenter="window.showItemTooltip(event, '${item.sid}')" onmouseleave="window.hideTooltip()">
                    <div class="food_inv_info">
                        <span style="color:${rarityColor}; font-weight:bold;">${item.name}</span>
                        <span style="font-size:16px; color:#666; margin-left:8px;">饱食 + ${hunger}   剩余数量： ${item.count}</span>
                    </div>
                    <button class="ink_btn_mini" style="background:#4caf50; color:#fff; border:none;" onclick="UIFish.handleEatFood('${item.sid}')">食用</button>
                </div>
            `;
            });
        }
        listHtml += `</div>`;

        // 4. 弹出竖长窗口 (25vw x 60vh)
        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal("随身干粮", listHtml, null, "modal_fish_food", 25, 60);
        }
    },

    /**
     * 【新增】处理进食
     */
    handleEatFood: function(sid) {
        if (window.UtilsItem && window.UtilsItem.useItem) {
            window.UtilsItem.useItem(sid, 1);
            // 刷新显示和属性
            this._updateStatsUI();
            this.showFoodInventory(); // 刷新当前列表
        }
    },
    /**
     * 【新增】显示当前鱼池图鉴弹窗
     */
    showPondGallery: function() {
        const lootPool = window.UtilFish.getPondLootPool();
        const history = (window.player && player.fishHistory) ? player.fishHistory : {};

        const p = window.player;

        let region=REGION_LAYOUT.find(r => r.id == p.coord.region);
        const seasonNames = ["春", "夏", "秋", "冬"];
        const curSeason = seasonNames[window.UtilFish.getCurrentSeason()];

        let listHtml = `
            <div style="padding:10px; color:#5d4037; font-family:'KaiTi'; border-bottom:1px dashed #d7ccc8; margin-bottom:10px;">
                📍 当前水域：${region.name} | 🗓️ 当前时节：${curSeason}季
            </div>
            <div class="fish_gallery_grid">
        `;

        lootPool.forEach(fish => {
            const record = history[fish.id];
            const hasCaught = record && record.nums > 0;
            const rarityClass = `gallery_rarity_${fish.rarity}`;

            listHtml += `
                <div class="fish_gallery_item ${hasCaught ? rarityClass : 'gallery_unknown'}" 
                     /* 即使没钓到，也可以鼠标悬浮看一眼大概描述(可选)，或者保持神秘 */
                     onmouseenter="${hasCaught ? `window.showShopItemTooltip(event, '${fish.id}')` : ''}"
                     onmouseleave="window.hideTooltip()">
                    <div class="fish_name">${hasCaught ? fish.name : '？？？'}</div>
                    <div class="fish_count">${hasCaught ? `累计钓获: ${record.nums} 次` : '<span style="color:#999">尚未捕获</span>'}</div>
                    <div class="fish_rarity_tag">${window.RARITY_CONFIG[fish.rarity].name}</div>
                </div>
            `;
        });

        listHtml += `</div>`;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(
                "本域鱼典",
                listHtml,
                null,
                "modal_fish_gallery",
                60, // 稍微加宽一点以适应更多条目
                70
            );
        }
    },
    _updateStatsUI: function() {
        const p = window.player;
        if (!p) return;

        const curSat = (p.status && p.status.hunger) || 0;
        const maxSat = (p.derived && p.derived.hungerMax) ? p.derived.hungerMax : 100;
        const curFat = (p.status && p.status.fatigue) || 0;
        const maxFat = (p.derived && p.derived.fatigueMax) ? p.derived.fatigueMax : 100;

        const el = document.getElementById('ui_fish_cur_stats');
        if (el) {
            el.innerText = `(饱食:${Math.floor(curSat)}/${Math.floor(maxSat)} 疲劳:${Math.floor(curFat)}/${Math.floor(maxFat)})`;
            if (curSat < 10 || curFat + 5 > maxFat) {
                el.style.color = "#d32f2f";
            } else {
                el.style.color = "#555";
            }
        }
        this._updateDynamicGameInfo();
    },

    _updateDynamicGameInfo: function() {
        if (!window.UtilFish) return;
        const info = window.UtilFish.getInfo();
        const elAttempts = document.querySelector('#ui_fish_attempts .stat_val');
        if (elAttempts) elAttempts.innerHTML = `${info.attempts} / ${info.maxAttempts}`;
        // const elFishCount = document.getElementById('ui_fish_count_val');
        // if (elFishCount) elFishCount.innerText = `${info.remainingFish} 条`;
    },

    _generateGridHtml: function() {
        let html = '';
        const total = window.UtilFish ? window.UtilFish.getTotalCells() : 96;
        for (let i = 0; i < total; i++) {
            html += `
                <div class="fish_cell_wrapper" onclick="UIFish.handleCellClick(this, ${i})">
                    <div class="fish_cell_inner">
                        <div class="fish_cell_front"><div class="water_pattern">≈</div></div>
                        <div class="fish_cell_back"><span class="loot_name"></span></div>
                    </div>
                </div>
            `;
        }
        return html;
    },

    _syncGridWithState: function() {
        if (!window.UtilFish || !window.UtilFish.gridState) return;
        const state = window.UtilFish.gridState;
        const cells = document.querySelectorAll('.fish_cell_wrapper');

        cells.forEach((el, idx) => {
            const cellData = state[idx];
            // 【关键修改】重置所有鼠标事件，防止旧数据残留
            el.onmouseenter = null;
            el.onmouseleave = null;

            // 重置状态
            el.classList.remove('flipped', 'blocked');
            const frontEl = el.querySelector('.fish_cell_front');
            const backEl = el.querySelector('.fish_cell_back');
            const nameEl = el.querySelector('.loot_name');

            // 恢复水纹默认
            frontEl.innerHTML = '<div class="water_pattern">≈</div>';
            frontEl.className = 'fish_cell_front';

            // 【新增】处理封锁状态
            if (cellData.isBlocked) {
                el.classList.add('blocked'); // 标记为封锁，不可点击
                // 直接修改正面显示，不进行翻转
                frontEl.className = 'fish_cell_front fish_cell_blocked';
                frontEl.innerHTML = '<span style="font-size:14px; color:#aed581; line-height:1.4;">水草丛生<br>无法钓鱼</span>';
                return; // 跳过后续处理
            }

            // 处理已翻开状态
            if (cellData.isFlipped) {
                el.classList.add('flipped');
                if (cellData.hasFish && cellData.loot) {
                    const rarity = cellData.loot.rarity || 1;
                    backEl.className = `fish_cell_back bg_rarity_${rarity}`;
                    nameEl.innerHTML = cellData.loot.name;
                    nameEl.className = `loot_name val_rarity_${rarity}`;

                    // 【关键修改】：如果已经翻开且有鱼，绑定 Tip 悬浮窗
                    // 查库模式：使用 loot.id 查原始数据显示
                    el.onmouseenter = (e) => window.showShopItemTooltip(e, cellData.loot.id);
                    el.onmouseleave = () => window.hideTooltip();
                } else {
                    backEl.className = "fish_cell_back bg_empty";
                    this._renderHint(nameEl, cellData.nearCount, cellData.hintRevealed);
                }
            }
        });

        this._updateStatsUI();
    },

    handleCellClick: function(el, index) {
        if (this.isAnimating) return;
        if (el.classList.contains('flipped')) return;
        if (el.classList.contains('blocked')) {
            if(window.showToast) window.showToast("❌ 此处杂草丛生，无法下竿");
            return;
        }

        // 1. 调用逻辑层翻牌
        const result = window.UtilFish.tryFlip(index);

        if (result.error) {
            if(window.showToast) window.showToast(`❌ ${result.msg}`);
            return;
        }

        // 2. 立即同步全场状态
        // 【重要】：UtilFish.tryFlip 内部如果触发了“水神庇护”，已经把该格子的 hasFish 改为 true 并补全了 loot 数据。
        // 这里直接调用同步方法，UI 会自动根据更新后的 cellData 渲染出鱼的名字和稀有度颜色，不再显示“未中鱼”。
        this._syncGridWithState();

        // 3. 此时格子已经被 _syncGridWithState 翻转并渲染完毕，我们只需处理反馈和后续事件

        // 如果中了鱼（无论是天然的还是 Buff 强制生成的），给出提示
        if (result.success && result.loot) {
            if(window.showToast) window.showToast(`🎣 钓到了 [${result.loot.name}]！`);
        }

        // 4. 处理随机事件弹窗 (放在最后，延迟显示，避免遮挡刚钓到的鱼)
        if (result.triggeredEvent && window.showFortuneModal) {
            setTimeout(() => {
                window.showFortuneModal(result.triggeredEvent);
            }, 500);
        }

        if(window.updateUI) window.updateUI();

        // 5. 次数耗尽的刷新逻辑
        if (result.isPondEmpty) {
            this.isAnimating = true;
            if(window.showToast) window.showToast("🎣 次数已尽，鱼群即将散去...");

            setTimeout(() => {
                this.resetGridAnimation(true);
                if (window.UtilFish) window.UtilFish.refreshPond();

                setTimeout(() => {
                    this._syncGridWithState();
                    this._updateStatsUI(); // 记得更新下方的次数 UI
                    this.isAnimating = false;
                    if(window.showToast) window.showToast("池塘已自动刷新！");
                }, 1000);
            }, 2000);
        }
    },

    _renderHint: function(targetEl, count, isRevealed) {
        if (isRevealed) {
            if (window.UtilFish && window.UtilFish.CONFIG.USE_TEXT_HINTS) {
                const texts = window.UtilFish.CONFIG.HINT_TEXTS;
                const text = texts[count] || "深不可测";
                targetEl.innerHTML = `<span style="font-size:14px; line-height:1.4; display:block; padding:2px;">${text}</span>`;
            } else {
                const numClass = `text_num_${count}`;
                targetEl.innerHTML = `未中<br><span class="${numClass}" style="font-size:16px">周围:${count}</span>`;
            }
        } else {
            targetEl.innerHTML = `未中<br><span style="font-size:12px; color:#ccc;">一片迷茫</span>`;
        }
        targetEl.className = "loot_name text_gray";
    },

    // 【修改】点击刷新池塘 (移除确认弹窗，直接刷新)
    onClickRefresh: function() {
        // 防止动画播放时重复点击
        if (this.isAnimating) return;

        // 1. 播放翻回动画 (true 表示静默模式，不显示"鱼群散去"的提示)
        this.resetGridAnimation(true);

        // 2. 延迟执行逻辑刷新 (等待翻牌动画遮盖)
        setTimeout(() => {
            // 重置数据
            if (window.UtilFish) window.UtilFish.refreshPond();

            // 同步 UI
            this._syncGridWithState();

            // 提示
            if (window.showToast) window.showToast("池塘已手动刷新！");
        }, 600);
    },

    onClickFeed: function() {
        if (window.doEat) {
            window.doEat();
            setTimeout(() => this._updateStatsUI(), 200);
        }
    },

    onClickRest: function() {
        if (window.doRest) {
            window.doRest();
            setTimeout(() => this._updateStatsUI(), 200);
        }
    },

    resetGridAnimation: function(silent = false) {
        const cells = document.querySelectorAll('.fish_cell_wrapper');

        // 【新增】动画开始即隐藏 Tip
        if (window.hideTooltip) window.hideTooltip();

        cells.forEach((cell, idx) => {
            setTimeout(() => {

                // 【新增】动画过程中移除监听，防止鼠标划过正在翻转的格子弹出错误 Tip
                cell.onmouseenter = null;
                cell.onmouseleave = null;

                cell.classList.remove('flipped');
            }, idx * 5);
        });

        if (!silent) {
            setTimeout(() => {
                this.isAnimating = false;
            }, cells.length * 5 + 300);
        }
    },

    _injectStyles: function() {
        if (document.getElementById('style-ui-fish-grid')) return;

        const css = `
        /* 【新增】图鉴相关样式 */
            .ink_btn_mini { 
                background: #fdfbf7; border: 1px solid #8d6e63; border-radius: 4px; 
                cursor: pointer; padding: 2px 6px; font-size: 14px; transition: 0.2s;
            }
            .ink_btn_mini:hover { background: #efebe9; transform: scale(1.1); }

            .fish_gallery_grid { 
                display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 15px; 
            }
            .fish_gallery_item {
                border: 2px solid #ddd; border-radius: 6px; padding: 10px; position: relative;
                background: #fff; display: flex; flex-direction: column; gap: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .fish_gallery_item.gallery_unknown { background: #f5f5f5; border-color: #eee; border-style: dashed; }
            .fish_gallery_item .fish_name { font-weight: bold; font-size: 18px; font-family: "KaiTi"; }
            .fish_gallery_item .fish_count { font-size: 14px; color: #666; }
            .fish_gallery_item .fish_rarity_tag { 
                position: absolute; right: 5px; top: 5px; font-size: 12px; 
                opacity: 0.7; padding: 2px 4px; border-radius: 3px; background: rgba(0,0,0,0.05);
            }

            /* 不同稀有度的边框颜色 */
            .gallery_rarity_1 { border-color: #818181; }
            .gallery_rarity_2 { border-color: #258625; }
            .gallery_rarity_3 { border-color: #2b58a6; }
            .gallery_rarity_4 { border-color: #a61a73; }
            .gallery_rarity_5 { border-color: #ceae04; }
            .gallery_rarity_6 { border-color: #c23601; }
            
        
            .modal_fishing_grid .modal_body { padding: 0 !important; background: #fdfbf7; overflow: hidden; display: flex; flex-direction: column; }
            .fish_layout { display: flex; flex-direction: column; height: 100%; width: 100%; }
            
            .fish_grid_board { 
                flex: 4; 
                background: #eef6f6; 
                display: grid; 
                grid-template-columns: repeat(12, 1fr); 
                grid-template-rows: repeat(8, 1fr); 
                gap: 4px; 
                padding: 10px; 
                box-sizing: border-box; 
                perspective: 1000px; 
            }
            
            .fish_cell_wrapper { position: relative; width: 100%; height: 100%; cursor: pointer; transform-style: preserve-3d; transition: transform 0.5s; }
            .fish_cell_wrapper.flipped { transform: rotateY(180deg); }
            /* 封锁格不可翻转 */
            .fish_cell_wrapper.blocked { cursor: not-allowed; }

            .fish_cell_inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; }
            .fish_cell_front, .fish_cell_back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 2px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-family: "KaiTi", serif; border: 1px solid #aec6cf; }
            
            .fish_cell_front { background: linear-gradient(135deg, #def, #bce); color: #5d8aa8; font-size: 20px; }
            .fish_cell_wrapper:hover .fish_cell_front { background: linear-gradient(135deg, #cde, #abd); }
            
            /* 【新增】水草封锁样式 */
            .fish_cell_blocked { 
                background: linear-gradient(135deg, #33691e, #558b2f) !important; 
                border-color: #2e7d32 !important;
                box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
            }

            .water_pattern { opacity: 0.5; }
            
            .fish_cell_back { background: #fff; transform: rotateY(180deg); border-color: #d7ccc8; flex-direction: column; padding: 1px; text-align: center; overflow:hidden; }
            .loot_name { font-weight: bold; font-size: 16px; line-height: 1.2; word-break: break-all; }
            
            .text_num_0 { color: #ccc; } .text_num_1 { color: #3498db; font-weight:bold; } .text_num_2 { color: #2ecc71; font-weight:bold; } .text_num_3 { color: #e74c3c; font-weight:bold; } .text_num_4 { color: #9b59b6; font-weight:bold; } .text_num_5 { color: #d35400; font-weight:bold; } .text_num_6 { color: #c0392b; font-weight:bold; }
            .bg_empty { background-color: #f5f5f5; color: #999; }
            .bg_rarity_1 { background-color: #fff; } .bg_rarity_2 { background-color: #f0f9eb; border-color:#c2e7b0; } .bg_rarity_3 { background-color: #ecf5ff; border-color:#b3d8ff; } .bg_rarity_4 { background-color: #fdf6ec; border-color:#f3d19e; } .bg_rarity_5 { background-color: #fff7e6; border-color:#ffc107; } .bg_rarity_6 { background-color: #ffebee; border-color:#ff5252; }
            .text_gray { color: #999; font-size: 16px; } .val_rarity_1 { color: #333; } .val_rarity_2 { color: #2e7d32; } .val_rarity_3 { color: #1565c0; } .val_rarity_4 { color: #6a1b9a; } .val_rarity_5 { color: #ef6c00; } .val_rarity_6 { color: #c62828; }

            .fish_info_panel { flex: 1; background: #fdfbf7; border-top: 3px double #8d6e63; padding: 10px 20px; display: flex; flex-direction: column; justify-content: center; }
            .fish_stats_row { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #ccc; padding-bottom: 5px; gap: 10px; }
            .fish_stat_item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
            
            .stat_label { font-size: 16px; color: #888; text-align: center; }
            .stat_val { font-size: 20px; font-weight: bold; color: #333; font-family: "KaiTi"; text-align: center; }
            .stat_detail { font-size: 16px; color: #888; font-weight: normal; margin-left: 5px; }

            .fish_action_row { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
            .fish_btns { display: flex; gap: 8px; }
            .ink_btn_small { background: #8d6e63; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: "KaiTi"; font-size: 18px; transition: 0.2s; white-space: nowrap; }
            .ink_btn_small:hover { background: #6d4c41; }
            .btn_refresh { background: #34495e; } .btn_refresh:hover { background: #2c3e50; }
            .fish_rules { font-size: 16px; color: #666; line-height: 1.5; font-family: "KaiTi"; }
            .fish_rules p { margin: 2px 0; }
                
                
                
            @keyframes floatWater { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        `;
        const style = document.createElement('style');
        style.id = 'style-ui-fish-grid';
        style.textContent = css;
        document.head.appendChild(style);
    }
};

window.UIFish = UIFish;