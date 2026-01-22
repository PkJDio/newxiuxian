// js/modules/ui_study.js
// 研读界面 UI v3.7 (增加客栈休息快捷入口)

const UIStudy = {
    selectedBookId: null,
    modalBody: null,
    shouldScroll: false,

    open: function() {
        this.shouldScroll = true;
        this.autoSelectBook();
        this.renderModal();
    },

    autoSelectBook: function() {
        if (player.lastStudyId && this._isBookAvailable(player.lastStudyId)) {
            this.selectedBookId = player.lastStudyId;
            return;
        }
        if (this.selectedBookId && this._isBookAvailable(this.selectedBookId)) {
            return;
        }
        const list = this._getReadableBooks();
        if (list.length > 0) {
            list.sort((a, b) => (b.item.rarity || 1) - (a.item.rarity || 1));
            this.selectedBookId = list[0].id;
        } else {
            this.selectedBookId = null;
        }
    },

    _isBookAvailable: function(bookId) {
        const book = GAME_DB.items.find(i => i.id === bookId);
        if (!book) return false;
        const hasInBag = player.inventory.some(slot => slot.id === bookId);
        if (!hasInBag) return false;
        const progress = (player.studyProgress && player.studyProgress[bookId]) || 0;
        const max = book.studyCost || 100;
        return progress < max;
    },

    _getReadableBooks: function() {
        if (!player.inventory) return [];
        const bookIds = player.inventory
            .filter(slot => {
                const item = GAME_DB.items.find(i => i.id === slot.id);
                return item && item.type === 'book';
            })
            .map(slot => slot.id);

        const uniqueIds = [...new Set(bookIds)];

        return uniqueIds.map(id => {
            const item = GAME_DB.items.find(i => i.id === id);
            return { id: id, item: item };
        }).filter(entry => {
            const progress = (player.studyProgress && player.studyProgress[entry.id]) || 0;
            const max = entry.item.studyCost || 100;
            return progress < max;
        });
    },

    renderModal: function() {
        const contentHtml = `
            <div class="study_layout">
                <div class="study_sidebar" id="study_book_list"></div>
                <div class="study_main" id="study_dashboard"></div>
            </div>
        `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            this.modalBody = window.UtilsModal.showInteractiveModal("青灯研读", contentHtml, null, "modal_study", 70, 70);
        }

        this._injectStyles();
        this.refresh();
    },

    refresh: function() {
        if (!document.getElementById('study_book_list')) return;
        this.renderLeftList();
        this.renderRightPanel();
    },

    renderLeftList: function() {
        const container = document.getElementById('study_book_list');
        container.innerHTML = "";

        const list = this._getReadableBooks();

        if (list.length === 0) {
            container.innerHTML = `<div class="empty_tip">行囊空空<br>暂无未读功法</div>`;
            return;
        }

        list.sort((a, b) => (b.item.rarity || 1) - (a.item.rarity || 1));

        list.forEach(entry => {
            const isActive = entry.id === this.selectedBookId;
            const progress = (player.studyProgress && player.studyProgress[entry.id]) || 0;
            const max = entry.item.studyCost || 100;
            const pct = Math.floor((progress / max) * 100);

            const el = document.createElement('div');
            el.className = `study_item ${isActive ? 'active' : ''}`;

            el.onclick = () => {
                this.selectedBookId = entry.id;
                player.lastStudyId = entry.id;
                saveGame();
                this.shouldScroll = false;
                this.refresh();
            };

            el.onmouseenter = (e) => {
                if(window.showSkillTooltip) window.showSkillTooltip(e, entry.id);
            };
            el.onmouseleave = () => {
                if (window.hideTooltip) window.hideTooltip();
            };
            el.onmousemove = (e) => {
                if (window.moveTooltip) window.moveTooltip(e);
            };

            const rarityConfig = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[entry.item.rarity] : { color: '#333' };
            const typeText = entry.item.subType === 'body' ? '外功' : '内功';

            el.innerHTML = `
                <div class="si_icon">📜</div>
                <div class="si_info">
                    <div class="si_name" style="color:${rarityConfig.color}">${entry.item.name}</div>
                    <div class="si_sub">
                        <span class="si_tag">${typeText}</span> 
                        <span class="si_pct">进度 ${pct}%</span>
                    </div>
                </div>
            `;
            container.appendChild(el);

            if (isActive && this.shouldScroll) {
                setTimeout(() => {
                    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }, 100);
                this.shouldScroll = false;
            }
        });
    },

    renderRightPanel: function() {
        const container = document.getElementById('study_dashboard');
        container.innerHTML = "";

        if (!this.selectedBookId) {
            container.innerHTML = `<div class="empty_tip">请选择要研读的典籍</div>`;
            return;
        }

        const bookId = this.selectedBookId;
        const item = player.inventory.find(i => i.id === bookId);

        const predict = window.UtilStudy.calcGain(item);
        const progress = (player.studyProgress && player.studyProgress[bookId]) || 0;
        const max = item.studyCost || 100;

        let effValue = predict.efficiency;
        if (isNaN(effValue) || effValue === undefined) effValue = 1.0;
        const effPercent = Math.round(effValue * 100);

        const rarityConfig = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : { color: '#333', name: '普通' };
        const headerHtml = `
            <div class="sd_header">
                <div class="sd_title" style="color:${rarityConfig.color}">${item.name} <span style="font-size:16px; color:#666; font-weight:normal;">(${rarityConfig.name})</span></div>
                <div class="sd_desc">${item.desc || '深奥晦涩的古籍，需静心参悟。'}</div>
            </div>
        `;

        const pct = Math.min(100, (progress / max) * 100).toFixed(1);
        const gainPct = Math.min(100, (predict.gain / max) * 100).toFixed(1);

        const progressHtml = `
            <div class="sd_progress_box">
                <div class="sd_level_row">
                    <span>研读进度</span>
                    <span>${Math.floor(progress)} / ${max}</span>
                </div>
                <div class="sd_bar_bg">
                    <div class="sd_bar_fill" style="width:${pct}%"></div>
                    <div class="sd_bar_gain" style="left:${pct}%; width:${gainPct}%"></div>
                </div>
                <div class="sd_tip">研读完成后即可习得此功法</div>
            </div>
        `;

        let breakdownHtml = "";
        if (predict.breakdown) {
            breakdownHtml = predict.breakdown.map(b => {
                const color = b.color || '#666';
                return `<div class="eff_row"><span>${b.label}</span><span style="color:${color}">${b.val}</span></div>`;
            }).join('');
        }

        const effHtml = `
            <div class="sd_stats_grid">
                <div class="sd_stat_card">
                    <div class="stat_label">单次研读进度</div>
                    <div class="stat_val">+${predict.gain}</div>
                    <div class="stat_sub">公式: [ ${predict.formulaDesc || '基础+属性加成'} ]</div>
                </div>
                <div class="sd_stat_card">
                    <div class="stat_label">效率详情</div>
                    <div class="stat_list">${breakdownHtml}</div>
                    <div class="stat_total">当前效率: <b style="color:#2e7d32">${effPercent}%</b></div>
                </div>
            </div>
        `;

        // 【修改点】使用 UtilsPlayer 判断是否在城镇中
        let isInTown = false;
        if (window.UtilsPlayer) {
            isInTown = window.UtilsPlayer.isInTown();
        } else {
            // 降级兼容：如果在 utils_player 加载前就调用了
            isInTown = (typeof window.currentTown !== 'undefined' && window.currentTown !== null);
        }

        let restBtnHtml = '';
        if (isInTown) {
            restBtnHtml = `
                <button class="study_big_btn" 
                    style="background:linear-gradient(to bottom, #81c784, #388e3c); margin-left: 15px; padding: 15px 40px; min-width:180px;"
                    onclick="window.UtilStudy.quickRest()"
                    title="花100文，回复200饱食，清空疲劳">
                    🛏️ 客栈小憩
                </button>
            `;
        }

        const btnHtml = `
            <div class="sd_actions">
                <button class="study_big_btn" 
                    onclick="window.UtilStudy.performStudy('${bookId}')">
                    🕯️ 秉烛夜读
                </button>
                ${restBtnHtml}
                <div class="study_cost_tip">
                    消耗: 2时辰 / -10饱食度 / +10疲劳
                </div>
            </div>
        `;

        container.innerHTML = headerHtml + progressHtml + effHtml + btnHtml;
    },

    _injectStyles: function() {
        if (document.getElementById('style-ui-study')) return;
        const css = `
            .study_layout { display:flex; height:100%; gap:20px; font-family:"KaiTi"; overflow:hidden; }
            
            .study_sidebar { flex:1; border:1px solid #ddd; background:#fff; border-radius:6px; overflow-y:auto; display:flex; flex-direction:column; max-width:260px; }
            .study_item { padding:12px; border-bottom:1px solid #eee; cursor:pointer; display:flex; gap:10px; align-items:center; transition:0.2s; }
            .study_item:hover { background:#fafafa; }
            .study_item.active { background:#e8f5e9; border-left:4px solid #4caf50; }
            
            .si_icon { font-size:26px; width:34px; text-align:center; }
            .si_info { flex:1; overflow:hidden; }
            .si_name { font-weight:bold; font-size:18px; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .si_sub { font-size:14px; color:#666; display:flex; justify-content:space-between; }
            .si_tag { background:#eee; padding:1px 4px; border-radius:3px; }

            .study_main { flex:2; display:flex; flex-direction:column; gap:15px; padding:10px; overflow-y:auto; }
            
            .sd_header { text-align:center; border-bottom:1px dashed #ccc; padding-bottom:10px; }
            .sd_title { font-size:28px; font-weight:bold; margin-bottom:5px; }
            .sd_desc { font-size:16px; color:#666; }

            .sd_progress_box { background:#fffdf5; padding:20px; border-radius:8px; border:1px solid #d4c4a8; box-shadow:inset 0 0 5px rgba(0,0,0,0.05); }
            .sd_level_row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:18px; font-weight:bold; color:#5d4037; }
            
            .sd_bar_bg { height:18px; background:#e0e0e0; border-radius:8px; overflow:hidden; position:relative; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2); }
            .sd_bar_fill { height:100%; background:linear-gradient(90deg, #795548, #5d4037); transition:width 0.3s; }
            .sd_bar_gain { position:absolute; top:0; height:100%; background:rgba(141, 110, 99, 0.5); box-shadow: 0 0 5px #a1887f; }
            .sd_tip { margin-top:10px; color:#8d6e63; font-size:15px; text-align:center; }

            .sd_stats_grid { display:grid; grid-template-columns: 1fr 1fr; gap:15px; }
            .sd_stat_card { border:1px solid #ddd; border-radius:6px; padding:15px; background:#fff; display:flex; flex-direction:column; justify-content:center; }
            .stat_label { font-size:16px; color:#888; margin-bottom:5px; text-align:center; }
            .stat_val { font-size:30px; font-weight:bold; color:#5d4037; text-align:center; }
            .stat_sub { font-size:14px; color:#999; margin-top:5px; text-align:center; }
            .stat_list { font-size:15px; color:#555; }
            .eff_row { display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px dashed #eee; }
            .stat_total { margin-top:8px; text-align:right; font-size:16px; }

            .sd_actions { text-align:center; margin-top:20px; }
            .study_big_btn { 
                font-size:26px; padding:15px 80px; border-radius:40px; border:none; 
                background:linear-gradient(to bottom, #6d4c41, #4e342e); 
                color:#fff; cursor:pointer; box-shadow:0 4px 10px rgba(93, 64, 55, 0.4); 
                transition:0.2s; font-family:"KaiTi"; font-weight:bold; letter-spacing:2px;
            }
            .study_big_btn:hover { transform:translateY(-2px); box-shadow:0 6px 15px rgba(93, 64, 55, 0.5); }
            .study_big_btn:active { transform:translateY(1px); }
            .study_cost_tip { margin-top:12px; color:#888; font-size:16px; }

            .empty_tip { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:22px; text-align:center; }
        `;
        const style = document.createElement('style');
        style.id = 'style-ui-study';
        style.textContent = css;
        document.head.appendChild(style);
    }
};

window.UIStudy = UIStudy;