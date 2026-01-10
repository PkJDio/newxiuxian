// js/modules/ui_study.js
window.UIStudy = {
    getCurrentTarget: function() {
        return window.player.currentStudyTarget || null;
    },

    open: function(autoBookId = null) {
        if (autoBookId) {
            window.player.currentStudyTarget = autoBookId;
        }

        const bookId = this.getCurrentTarget();
        let contentHtml = "";

        if (!bookId) {
            // 状态 A: 未选择书籍
            contentHtml = `
                <div style="padding:40px 20px; text-align:center; font-family:Kaiti;">
                    <div style="font-size:50px; margin-bottom:20px;">📜</div>
                    <p style="font-size:20px; color:#5d4037; margin-bottom:30px;">书案空空如也，尚未选定研读之物。</p>
                    <button class="ink_btn" style="width:100%; height:45px;" onclick="window.UIStudy.openBookSelector()">选择研读功法</button>
                </div>
            `;
        } else {
            // 状态 B: 已有目标书籍
            const book = window.GAME_DB.items.find(i => i.id === bookId);
            const progress = (window.player.studyProgress && window.player.studyProgress[bookId]) || 0;
            const max = book.studyCost || 100;
            const pct = Math.min(100, Math.floor((progress / max) * 100));

            // --- 【计算收益详情】 ---
            const attr = window.player.derived || window.player.attributes;
            const rarity = book.rarity || 1;
            let relatedAttrValue = (book.subType === 'body') ? (attr.shen || 0) : Math.floor(((attr.qi || 0) + (attr.shen || 0)) / 2);

            // 1. 计算理论基础收益（无任何加成/减益）
            const baseGain = (10 + relatedAttrValue) / (1 + rarity * 0.1);
            const theoreticalMax = Math.ceil(baseGain);

            // 2. 【核心修改】计算丹药加成详情 (studyEff)
            let extraEffPct = 0;
            if (window.player && window.player.buffs) {
                for (let bId in window.player.buffs) {
                    let b = window.player.buffs[bId];
                    if (b.attr === 'studyEff') extraEffPct += parseFloat(b.val);
                }
            }
            const buffBonusHtml = extraEffPct > 0
                ? `<div style="display: flex; justify-content: space-between; align-items: center; color: #673ab7; font-weight: bold;">
                    <span>丹药加成：</span>
                    <span>+${Math.round(extraEffPct * 100)}%效率</span>
                   </div>`
                : "";

            // 3. 判定减益项
            const hasFatigue = window.player.buffs && window.player.buffs['debuff_fatigue'];
            const hasHunger = window.player.buffs && window.player.buffs['debuff_hunger'];

            // 4. 计算实际最终收益 (调用 UtilStudy.calcGain，该函数内部应已包含 studyEff 和状态减益)
            const actualGain = window.UtilStudy ? Math.ceil(window.UtilStudy.calcGain(book)) : 0;
            const gainColor = (hasFatigue || hasHunger) ? "#d32f2f" : "#2e7d32";

            // 构造减益详情文字
            let debuffDetail = "";
            if (hasFatigue) debuffDetail += `<span style="color:#d32f2f; margin-left:8px;">疲惫-50%</span>`;
            if (hasHunger) debuffDetail += `<span style="color:#d32f2f; margin-left:8px;">饥饿-50%</span>`;

            contentHtml = `
                <div style="padding:20px; font-family:Kaiti; text-align:center;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                        <h2 style="color:#5d4037; margin:0;">📖 青灯研读</h2>
                        <span style="color:#2196f3; cursor:pointer; text-decoration:underline; font-size:14px;" onclick="window.UIStudy.openBookSelector()">[更换书籍]</span>
                    </div>
                    
                    <div style="margin:10px 0 20px 0; border:2px solid #d4c4a8; padding:15px; background:#fffdf5; border-radius:8px;">
                        <div style="font-size:24px; font-weight:bold; margin-bottom:10px; color:#3e2723;">《${book.name}》</div>
                        <div style="color:#666; font-size:16px; line-height:1.4;">${book.desc || "深奥晦涩的古籍，需静心参悟。"}</div>
                    </div>
                    
                    <div style="margin-bottom:20px; background:#f5f5f5; padding:15px; border-radius:8px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:18px;">
                            <span>研读进度</span>
                            <span style="color:#795548; font-weight:bold;">${progress} / ${max} (${pct}%)</span>
                        </div>
                        <div style="width:100%; height:18px; background:#e0e0e0; border-radius:8px; overflow:hidden; border:1px solid #ccc;">
                            <div style="width:${pct}%; height:100%; background:linear-gradient(to right, #8d6e63, #5d4037); transition:width 0.4s ease;"></div>
                        </div>

                        <div style="margin-top:12px; font-size:16px; text-align:left; color:#5d4037; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 4px; line-height: 1.6;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span>预期基础进度：<span style="color:#2e7d32; font-weight:bold;">+${theoreticalMax}</span></span>
                                <div style="font-size:16px; font-weight:bold;">${debuffDetail}</div>
                            </div>
                            
                            ${buffBonusHtml}

                            <div style="border-top: 1px dashed #ccc; margin-top: 8px; padding-top: 6px; display: flex; justify-content: space-between;">
                                <span>本次实际收益：</span>
                                <span style="color:${gainColor}; font-weight:bold; font-size:18px;">+${actualGain}</span>
                            </div>
                        </div>
                    </div>

                    <div style="color:#a94442; font-size:16px; margin-bottom:20px; background:#fff3f3; padding:8px; border-radius:4px;">
                        消耗：${window.UtilStudy.COST_HOUR}小时 & ${window.UtilStudy.FATIGUE_GAIN+2}点疲劳值
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
        const inventory = window.player.inventory || [];
        const booksInInv = inventory.filter(slot => {
            const item = window.GAME_DB.items.find(i => i.id === slot.id);
            return item && item.type === 'book';
        });

        if (booksInInv.length === 0) {
            if (window.showToast) window.showToast("行囊中没有可研读的功法");
            return;
        }

        let listHtml = `<div style="max-height:400px; overflow-y:auto; padding:10px;">`;
        booksInInv.forEach(slot => {
            const item = window.GAME_DB.items.find(i => i.id === slot.id);
            const progress = (window.player.studyProgress && window.player.studyProgress[item.id]) || 0;
            const max = item.studyCost || 100;
            const pct = Math.floor((progress / max) * 100);

            listHtml += `
                <div class="study_select_item" 
                     onclick="window.UIStudy.selectBook('${item.id}')"
                     style="display:flex; justify-content:space-between; align-items:center; padding:12px; margin-bottom:10px; border:1px solid #d4c4a8; background:#fff; border-radius:6px; cursor:pointer;">
                    <div>
                        <div style="font-weight:bold; font-size:16px; color:#3e2723;">《${item.name}》</div>
                        <div style="font-size:14px; color:#999;">当前进度: ${pct}%</div>
                    </div>
                    <div style="color:#795548; font-size:16px;">点击选择 ></div>
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

        if (window.closeModal) {
            window.closeModal();
        }
        this.open();
    },

    doAction: function(bookId) {
        if (window.UtilStudy && window.UtilStudy.performStudy) {
            const isFinished = window.UtilStudy.performStudy(bookId);
            if (isFinished) {
                window.player.currentStudyTarget = null;
                if (window.closeModal) window.closeModal();
            } else {
                this.open();
            }
        }
    }
};