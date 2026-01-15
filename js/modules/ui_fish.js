// js/modules/ui_fish.js
// 垂钓界面 UI v9.0 (适配水草封锁)

const UIFish = {
    modalBody: null,
    isAnimating: false,

    open: function() {
        this._injectStyles();
        if (window.UtilFish) window.UtilFish.init();

        this._renderContent();

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            this.modalBody = window.UtilsModal.showInteractiveModal("寒江独钓", this.lastContentHtml, null, "modal_fishing_grid", 90, 95);
        }

        this._syncGridWithState();
        this._updateStatsUI();
    },

    _renderContent: function() {
        const info = window.UtilFish ? window.UtilFish.getInfo() : { levelName:"?", remainingFish:0, attempts:0, maxAttempts:0 };

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
                            <span class="stat_label">
                                消耗 
                                <span id="ui_fish_cur_stats" style="color:#e65100; font-weight:normal; font-size:12px; display:block;">(加载中...)</span>
                            </span>
                            <span class="stat_val">10饱食 / 5疲劳</span>
                        </div>

                        

                        <div class="fish_stat_item" id="ui_fish_attempts">
                            <span class="stat_label">剩余次数</span>
                            <span class="stat_val" style="color:#e65100;">${info.attempts} / ${info.maxAttempts}</span>
                        </div>
                    </div>

                    <div class="fish_action_row">
                        <div class="fish_rules" style="flex:1; text-align:left;">
                            <p>※ 点击水面下竿，数字代表周围鱼数。</p>
                            <p>※ 每次点击消耗 <b>1小时</b>。</p>
                            <p>※ <b>${info.maxAttempts}次</b>机会耗尽后，池塘将自动刷新。</p>
                        </div>
                        <div class="fish_btns">
                            <button class="ink_btn_small" onclick="UIFish.onClickFeed()">🍱 进食</button>
                            <button class="ink_btn_small" onclick="UIFish.onClickRest()">🍵 休憩</button>
                            <button class="ink_btn_small btn_refresh" onclick="UIFish.onClickRefresh()">🔄 手动刷新</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
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

        const result = window.UtilFish.tryFlip(index);

        if (result.error) {
            if(window.showToast) window.showToast(`❌ ${result.msg}`);
            return;
        }

        el.classList.add('flipped');

        const backEl = el.querySelector('.fish_cell_back');
        const nameEl = el.querySelector('.loot_name');

        if (result.success && result.loot) {
            const rarity = result.loot.rarity || 1;
            backEl.className = `fish_cell_back bg_rarity_${rarity}`;
            nameEl.innerHTML = result.loot.name;
            nameEl.className = `loot_name val_rarity_${rarity}`;
        } else {
            backEl.className = "fish_cell_back bg_empty";
            this._renderHint(nameEl, result.nearCount, result.showHint);
        }

        // 同步全场状态（主要是为了更新周围格子的提示）
        this._syncGridWithState();

        if (result.success && result.loot) {
            if(window.showToast) window.showToast(`🎣 钓到了 [${result.loot.name}]！`);
        }

        if(window.updateUI) window.updateUI();

        if (result.isPondEmpty) {
            this.isAnimating = true;
            if(window.showToast) window.showToast("🎣 次数已尽，鱼群即将散去...");

            setTimeout(() => {
                this.resetGridAnimation(true);
                if (window.UtilFish) window.UtilFish.refreshPond();

                setTimeout(() => {
                    this._syncGridWithState();
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
        cells.forEach((cell, idx) => {
            setTimeout(() => {
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