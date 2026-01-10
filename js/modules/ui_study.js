// js/modules/ui_study.js
// 研读系统 UI - v2.1 (修复BUFF实时显示与通用性)

window.UIStudy = {
    _isStyleInjected: false,

    _injectStyles: function() {
        if (this._isStyleInjected) return;
        const cssContent = `
            .study_container { padding: 20px; font-family: "KaiTi", "楷体", serif; text-align: center; }
            .study_header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
            .study_header h2 { color: #5d4037; margin: 0; }
            .study_change_btn { color: #2196f3; cursor: pointer; text-decoration: underline; font-size: 14px; }
            
            .book_card { margin: 10px 0 20px 0; border: 2px solid #d4c4a8; padding: 15px; background: #fffdf5; border-radius: 8px; }
            .book_title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #3e2723; }
            .book_desc { color: #666; font-size: 16px; line-height: 1.4; }
            
            .progress_box { margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .progress_info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 18px; }
            .progress_val { color: #795548; font-weight: bold; }
            .progress_bar_bg { width: 100%; height: 18px; background: #e0e0e0; border-radius: 8px; overflow: hidden; border: 1px solid #ccc; }
            .progress_bar_fill { height: 100%; background: linear-gradient(to right, #8d6e63, #5d4037); transition: width 0.4s ease; }
            
            .gain_detail_box { margin-top: 12px; font-size: 16px; text-align: left; color: #5d4037; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 4px; line-height: 1.6; }
            .gain_row { display: flex; justify-content: space-between; align-items: center; }
            .gain_base { color: #2e7d32; font-weight: bold; }
            .gain_buff { color: #673ab7; font-weight: bold; }
            
            /* 新增：通用 Debuff 样式 */
            .gain_debuff_tag { color: #d32f2f; margin-left: 8px; font-size: 14px; background: rgba(211, 47, 47, 0.1); padding: 1px 4px; border-radius: 3px; }
            
            .gain_final_row { border-top: 1px dashed #ccc; margin-top: 8px; padding-top: 6px; display: flex; justify-content: space-between; }
            .gain_final_val { font-weight: bold; font-size: 18px; }
            
            .cost_tip { color: #a94442; font-size: 16px; margin-bottom: 20px; background: #fff3f3; padding: 8px; border-radius: 4px; }
            
            .empty_state { padding: 40px 20px; text-align: center; font-family: "KaiTi"; }
            .empty_icon { font-size: 50px; margin-bottom: 20px; }
            .empty_text { font-size: 20px; color: #5d4037; margin-bottom: 30px; }
            
            .selector_list { max-height: 400px; overflow-y: auto; padding: 10px; }
            .selector_item { display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 10px; border: 1px solid #d4c4a8; background: #fff; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
            .selector_item:hover { background: #fffbf0; }
            .selector_title { font-weight: bold; font-size: 16px; color: #3e2723; }
            .selector_sub { font-size: 14px; color: #999; }
            .selector_arrow { color: #795548; font-size: 16px; }
        `;
        const styleEl = document.createElement('style');
        styleEl.id = 'style-ui-study';
        styleEl.textContent = cssContent;
        document.head.appendChild(styleEl);
        this._isStyleInjected = true;
    },

    getCurrentTarget: function() {
        return window.player.currentStudyTarget || null;
    },

    open: function(autoBookId = null) {
        this._injectStyles();

        if (autoBookId) {
            window.player.currentStudyTarget = autoBookId;
        }

        const bookId = this.getCurrentTarget();
        let contentHtml = "";

        if (!bookId) {
            contentHtml = `
                <div class="empty_state">
                    <div class="empty_icon">📜</div>
                    <p class="empty_text">书案空空如也，尚未选定研读之物。</p>
                    <button class="ink_btn" style="width:100%; height:45px;" onclick="window.UIStudy.openBookSelector()">选择研读功法</button>
                </div>
            `;
        } else {
            const book = window.GAME_DB.items.find(i => i.id === bookId);
            const progress = (window.player.studyProgress && window.player.studyProgress[bookId]) || 0;
            const max = book.studyCost || 100;
            const pct = Math.min(100, Math.floor((progress / max) * 100));

            const attr = window.player.derived || window.player.attributes;
            const rarity = book.rarity || 1;
            let relatedAttrValue = (book.subType === 'body') ? (attr.shen || 0) : Math.floor(((attr.qi || 0) + (attr.shen || 0)) / 2);

            // 1. 基础收益
            const baseGain = (10 + relatedAttrValue) / (1 + rarity * 0.1);
            const theoreticalMax = Math.ceil(baseGain);

            // 2. 实时遍历 Buff (通用化处理)
            let extraEffPct = 0;
            let debuffHtml = ""; // 用于拼接所有减益标签

            const buffs = window.player.buffs || [];
            const buffList = Array.isArray(buffs) ? buffs : Object.values(buffs);

            buffList.forEach(b => {
                if (!b) return;

                // 增益：效率提升
                if (b.attr === 'studyEff') {
                    extraEffPct += parseFloat(b.val);
                }

                // 减益：特定 Debuff (兼容 ID 或 Name 检测)
                // 这里把逻辑放宽，只要是名字里带“疲”或“饿”的，或者 ID 匹配的，都显示出来
                const isFatigue = b.id === 'debuff_fatigue' || b.id === 'fatigue' || (b.name && b.name.includes('疲'));
                const isHunger = b.id === 'debuff_hunger' || b.id === 'hunger' || (b.name && b.name.includes('饿'));

                if (isFatigue) {
                    debuffHtml += `<span class="gain_debuff_tag">疲惫-50%</span>`;
                } else if (isHunger) {
                    debuffHtml += `<span class="gain_debuff_tag">饥饿-50%</span>`;
                }
            });

            const buffBonusHtml = extraEffPct > 0
                ? `<div class="gain_row gain_buff">
                    <span>丹药加成：</span>
                    <span>+${Math.round(extraEffPct * 100)}%效率</span>
                   </div>`
                : "";

            // 3. 实际收益计算
            const actualGain = window.UtilStudy ? Math.ceil(window.UtilStudy.calcGain(book)) : 0;

            // 颜色判断：只要实际收益低于理论最大值，就变红，否则变绿
            const isReduced = actualGain < theoreticalMax;
            const gainColor = isReduced ? "#d32f2f" : "#2e7d32";

            contentHtml = `
                <div class="study_container">
                    <div class="study_header">
                        <h2>📖 青灯研读</h2>
                        <span class="study_change_btn" onclick="window.UIStudy.openBookSelector()">[更换书籍]</span>
                    </div>
                    
                    <div class="book_card">
                        <div class="book_title">《${book.name}》</div>
                        <div class="book_desc">${book.desc || "深奥晦涩的古籍，需静心参悟。"}</div>
                    </div>
                    
                    <div class="progress_box">
                        <div class="progress_info">
                            <span>研读进度</span>
                            <span class="progress_val">${progress} / ${max} (${pct}%)</span>
                        </div>
                        <div class="progress_bar_bg">
                            <div class="progress_bar_fill" style="width:${pct}%"></div>
                        </div>

                        <div class="gain_detail_box">
                            <div class="gain_row">
                                <span>预期基础进度：<span class="gain_base">+${theoreticalMax}</span></span>
                                <div>${debuffHtml}</div>
                            </div>
                            
                            ${buffBonusHtml}

                            <div class="gain_final_row">
                                <span>本次实际收益：</span>
                                <span class="gain_final_val" style="color:${gainColor}">+${actualGain}</span>
                            </div>
                        </div>
                    </div>

                    <div class="cost_tip">
                        消耗：${window.UtilStudy ? window.UtilStudy.COST_HOUR : 4}小时 & ${window.UtilStudy ? window.UtilStudy.FATIGUE_GAIN + 2 : 5}点疲劳值
                    </div>

                    <button class="ink_btn" style="width:100%; height:45px; font-size:18px;" onclick="window.UIStudy.doAction('${bookId}')">
                        开始参悟
                    </button>
                </div>
            `;
        }

        if (window.showGeneralModal) {
            window.showGeneralModal("研读功法", contentHtml, null, "modal_study_action", 45, 70);
        }
    },

    openBookSelector: function() {
        this._injectStyles();
        const inventory = window.player.inventory || [];
        const booksInInv = inventory.filter(slot => {
            const item = window.GAME_DB.items.find(i => i.id === slot.id);
            return item && item.type === 'book';
        });

        if (booksInInv.length === 0) {
            if (window.showToast) window.showToast("行囊中没有可研读的功法");
            return;
        }

        let listHtml = `<div class="selector_list">`;
        booksInInv.forEach(slot => {
            const item = window.GAME_DB.items.find(i => i.id === slot.id);
            const progress = (window.player.studyProgress && window.player.studyProgress[item.id]) || 0;
            const max = item.studyCost || 100;
            const pct = Math.floor((progress / max) * 100);

            listHtml += `
                <div class="selector_item" onclick="window.UIStudy.selectBook('${item.id}')">
                    <div>
                        <div class="selector_title">《${item.name}》</div>
                        <div class="selector_sub">当前进度: ${pct}%</div>
                    </div>
                    <div class="selector_arrow">点击选择 ></div>
                </div>
            `;
        });
        listHtml += `</div>`;

        if (window.showGeneralModal) {
            window.showGeneralModal("选择功法", listHtml, null, "modal_book_selector", 40, 60);
        }
    },

    selectBook: function(bookId) {
        window.player.currentStudyTarget = bookId;
        if (window.showToast) window.showToast("已更换研读目标");
        if (window.closeModal) window.closeModal();
        setTimeout(() => { this.open(); }, 50);
    },

    doAction: function(bookId) {
        if (window.UtilStudy && window.UtilStudy.performStudy) {
            // 执行研读（内部会扣除时间、增加疲劳、增加Buff等）
            const isFinished = window.UtilStudy.performStudy(bookId);

            if (isFinished) {
                window.player.currentStudyTarget = null;
                if (window.closeModal) window.closeModal();
            } else {
                // 关键：研读一次后，状态可能变了（比如多了疲劳BUFF），必须重新 open 来刷新界面显示
                // 为了视觉上的“刷新感”，可以加一点点延迟
                setTimeout(() => {
                    this.open();
                }, 50);
            }
        } else {
            console.error("未找到 UtilStudy 模块");
        }
    }
};