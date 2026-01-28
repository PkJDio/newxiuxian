// js/modules/ui_train.js
// 修炼界面 UI v1.7 (增加客栈休息快捷入口)

const UITrain = {
    selectedSkillId: null,
    modalBody: null,
    shouldScroll: false, // 新增：控制是否需要滚动定位

    // 入口
    open: function() {
        this.shouldScroll = true; // 标记：打开时允许自动滚动
        this.autoSelectSkill();
        this.renderModal();
    },

    // 自动选中逻辑 (优化版)
    autoSelectSkill: function() {
        // 1. 优先读取上次记录 (如果存在且玩家确实拥有该技能)
        if (player.lastTrainId && player.skills && player.skills[player.lastTrainId]) {
            this.selectedSkillId = player.lastTrainId;
            return;
        }

        // 2. 如果没有记录，才走默认逻辑
        if (this.selectedSkillId) return;
        if (!player.skills) return;

        const skillIds = Object.keys(player.skills);
        // 优先找未满级 (mastered = false)
        for (let id of skillIds) {
            const skill = player.skills[id];
            if (!skill.mastered) {
                this.selectedSkillId = id;
                return;
            }
        }
        // 如果都满级了，或者没技能，默认选第一个
        if (skillIds.length > 0) this.selectedSkillId = skillIds[0];
    },

    renderModal: function() {
        // 布局容器
        const contentHtml = `
            <div class="train_layout">
                <div class="train_sidebar" id="train_skill_list"></div>
                <div class="train_main" id="train_dashboard"></div>
            </div>
        `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            // 将尺寸设为较大值，以适应放大的字体
            this.modalBody = window.UtilsModal.showInteractiveModal("修炼功法", contentHtml, null, "modal_train", 60, 70);
        }

        this._injectStyles();
        this.refresh();
    },

    refresh: function() {
        if (!document.getElementById('train_skill_list')) return;
        this.renderLeftList();
        this.renderRightPanel();
    },

    // 渲染左侧列表
    renderLeftList: function() {
        const container = document.getElementById('train_skill_list');
        container.innerHTML = "";

        if (!player.skills || Object.keys(player.skills).length === 0) {
            container.innerHTML = `<div class="empty_tip">暂无功法<br>请先研读习得</div>`;
            return;
        }

        // 筛选：只显示外功(body)和内功(cultivation)，排除生活技能
        const list = Object.keys(player.skills).map(id => {
            const item = GAME_DB.items.find(i => i.id === id);
            return { id: id, item: item, data: player.skills[id] };
        }).filter(x => x.item && (x.item.subType === 'body' || x.item.subType === 'cultivation'));

        // 排序：未满级优先 > 稀有度高优先 > 名字排序
        list.sort((a, b) => {
            const rarityDiff = (b.item.rarity || 1) - (a.item.rarity || 1);
            if (rarityDiff !== 0) {
                return rarityDiff;
            }
            const nameA = a.item.name || "";
            const nameB = b.item.name || "";
            return nameA.localeCompare(nameB, 'zh-CN');
        });

        list.forEach(entry => {
            const isActive = entry.id === this.selectedSkillId;
            const isMastered = entry.data.mastered;
            const info = window.UtilsSkill.getSkillInfo(entry.id);

            const el = document.createElement('div');
            el.className = `train_skill_item ${isActive ? 'active' : ''}`;
            el.dataset.id = entry.id;

            // 点击选择
            el.onclick = () => {
                this.selectedSkillId = entry.id;
                player.lastTrainId = entry.id;
                this.shouldScroll = false;
                this.refresh();
            };

            // 添加鼠标悬浮事件
            el.onmouseenter = (e) => {
                if (window.showSkillTooltip) window.showSkillTooltip(e, entry.id);
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
                <div class="ts_icon">${entry.item.icon || '📘'}</div>
                <div class="ts_info">
                    <div class="ts_name" style="color:${rarityConfig.color}">${entry.item.name}</div>
                    <div class="ts_sub">
                        <span class="ts_tag">${typeText}</span> 
                        <span class="ts_lv">${isMastered ? '已大成' : info.levelName}</span>
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

    // 渲染右侧详情
    renderRightPanel: function() {
        const container = document.getElementById('train_dashboard');
        container.innerHTML = "";

        if (!this.selectedSkillId) {
            container.innerHTML = `<div class="empty_tip">请选择要修炼的功法</div>`;
            return;
        }

        const skillId = this.selectedSkillId;
        const item = GAME_DB.items.find(i => i.id === skillId);

        // 获取实时数据
        const info = window.UtilsSkill.getSkillInfo(skillId);

        // 【数据获取】预测收益
        let predict = { gain: 0, efficiency: 1.0, breakdown: [], baseGain: 0, formulaDesc: "" };
        if (window.UtilTrain && window.UtilTrain.predictGain) {
            predict = window.UtilTrain.predictGain(skillId);
        }

        // 【数值安全】效率计算
        let effValue = predict.efficiency || 1.0;
        const effPercent = Math.round(effValue * 100);

        // 1. 标题头
        const rarityConfig = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : { color: '#333', name: '普通' };
        const headerHtml = `
            <div class="td_header">
                <div class="td_title" style="color:${rarityConfig.color}">${item.name} <span style="font-size:16px; color:#666; font-weight:normal;">(${rarityConfig.name})</span></div>
                <div class="td_desc">${item.desc || '暂无描述'}</div>
            </div>
        `;

        // 2. 进度条区域
        const currentCap = info.nextExp !== -1 ? info.nextExp : info.exp;
        const pct = currentCap > 0 ? Math.min(100, (info.exp / currentCap) * 100).toFixed(1) : 0;
        const gainPct = (info.nextExp !== -1 && currentCap > 0) ? Math.min(100, (predict.gain / currentCap) * 100).toFixed(1) : 0;

        const progressHtml = `
            <div class="td_progress_box">
                <div class="td_level_row">
                    <span>当前境界: <b style="color:#d84315; font-size:20px;">${info.levelName}</b></span>
                    <span>${Math.floor(info.exp)} / ${info.nextExp === -1 ? 'MAX' : Math.floor(info.nextExp)}</span>
                </div>
                <div class="td_bar_bg">
                    <div class="td_bar_fill" style="width:${pct}%"></div>
                    <div class="td_bar_gain" style="left:${pct}%; width:${gainPct}%"></div>
                </div>
                ${info.isCapped ? '<div class="td_cap_tip">⚠️ 已达进阶瓶颈，请寻找后续篇章或参悟</div>' : ''}
                ${info.mastered ? '<div class="td_cap_tip" style="color:#4caf50;">✨ 功法已臻大成，无需继续修炼</div>' : ''}
            </div>
        `;

        // 3. 效率详情
        let breakdownHtml = (predict.breakdown || []).map(b => {
            return `<div class="eff_row"><span>${b.label}</span><span style="color:${b.color || '#666'}">${b.val}</span></div>`;
        }).join('');

        const effHtml = `
            <div class="td_stats_grid">
                <div class="td_stat_card">
                    <div class="stat_label">单次修炼收益</div>
                    <div class="stat_val">+${predict.gain || 0} <span style="font-size:16px;color:#999">熟练度</span></div>
                    <div class="stat_sub">公式: [ ${predict.formulaDesc || '基础+加成'} ]</div>
                </div>
                <div class="td_stat_card">
                    <div class="stat_label">效率详情</div>
                    <div class="stat_list">${breakdownHtml}</div>
                    <div class="stat_total">当前效率: <b style="color:#2196f3">${effPercent}%</b></div>
                </div>
            </div>
        `;

        // 4. 按钮逻辑
        const canTrain = !info.isCapped && !info.mastered;

        let btnText = "🧘 开始修炼";
        let btnClass = "train_big_btn";

        if (info.mastered) {
            btnText = "✅ 已臻大成";
            btnClass += " disabled";
        } else if (info.isCapped) {
            btnText = "🚫 进阶瓶颈";
            btnClass += " disabled";
        }

        // ============================================
        // 【新增】客栈休息按钮逻辑
        // ============================================
        let isInTown = false;
        if (window.UtilsPlayer && window.UtilsPlayer.isInTown) {
            isInTown = window.UtilsPlayer.isInTown();
        } else if (typeof window.currentTown !== 'undefined' && window.currentTown !== null) {
            isInTown = true;
        }

        let restBtnHtml = '';
        if (isInTown) {
            // 复用 train_big_btn 的样式，但修改背景色为绿色系，与其他按钮区分
            restBtnHtml = `
                <button class="train_big_btn" 
                    style="background:linear-gradient(to bottom, #81c784, #388e3c); margin-left: 15px; min-width:180px;"
                    onclick="window.UtilStudy.quickRest()"
                    title="花100文，回复200饱食，清空疲劳">
                    🛏️ 客栈小憩
                </button>
            `;
        }
        // ============================================

        const btnHtml = `
            <div class="td_actions">
                <button class="${btnClass}" 
                    ${canTrain ? `onclick="window.UtilTrain.train('${skillId}')"` : ''}
                    ${!canTrain ? 'disabled' : ''}>
                    ${btnText}
                </button>
                ${restBtnHtml}
                <div class="train_cost_tip">
                    ${canTrain ? '消耗: 4时辰 / -20饱食度 / +20疲劳' : '当前状态无法修炼'}
                </div>
            </div>
        `;

        container.innerHTML = headerHtml + progressHtml + effHtml + btnHtml;
    },

    // 内联样式注入
    _injectStyles: function() {
        if (document.getElementById('style-ui-train')) return;
        const css = `
            .train_layout { display:flex; height:100%; gap:20px; font-family:"KaiTi"; overflow:hidden; }
            
            .train_sidebar { flex:1; border:1px solid #ddd; background:#fff; border-radius:6px; overflow-y:auto; display:flex; flex-direction:column; max-width:260px; }
            .train_skill_item { padding:12px; border-bottom:1px solid #eee; cursor:pointer; display:flex; gap:10px; align-items:center; transition:0.2s; }
            .train_skill_item:hover { background:#fafafa; }
            .train_skill_item.active { background:#e3f2fd; border-left:4px solid #2196f3; }
            
            .ts_icon { font-size:26px; width:34px; text-align:center; }
            .ts_info { flex:1; overflow:hidden; }
            .ts_name { font-weight:bold; font-size:18px; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .ts_sub { font-size:14px; color:#666; display:flex; justify-content:space-between; }
            .ts_tag { background:#eee; padding:1px 4px; border-radius:3px; }

            .train_main { flex:2; display:flex; flex-direction:column; gap:15px; padding:10px; overflow-y:auto; }
            
            .td_header { text-align:center; border-bottom:1px dashed #ccc; padding-bottom:10px; }
            .td_title { font-size:28px; font-weight:bold; margin-bottom:5px; }
            .td_desc { font-size:16px; color:#666; }

            .td_progress_box { background:#fafafa; padding:20px; border-radius:8px; border:1px solid #e0e0e0; box-shadow:inset 0 0 5px rgba(0,0,0,0.05); }
            .td_level_row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:18px; font-weight:bold; color:#444; }
            
            .td_bar_bg { height:18px; background:#e0e0e0; border-radius:8px; overflow:hidden; position:relative; box-shadow:inset 0 1px 3px rgba(0,0,0,0.2); }
            .td_bar_fill { height:100%; background:linear-gradient(90deg, #4caf50, #8bc34a); transition:width 0.3s; }
            .td_bar_gain { position:absolute; top:0; height:100%; background:rgba(255, 235, 59, 0.6); box-shadow: 0 0 5px #ffeb3b; }
            .td_cap_tip { margin-top:10px; color:#ff9800; font-size:16px; text-align:center; font-weight:bold; }

            .td_stats_grid { display:grid; grid-template-columns: 1fr 1fr; gap:15px; }
            .td_stat_card { border:1px solid #ddd; border-radius:6px; padding:15px; background:#fff; display:flex; flex-direction:column; justify-content:center; }
            .stat_label { font-size:16px; color:#888; margin-bottom:5px; text-align:center; }
            .stat_val { font-size:30px; font-weight:bold; color:#2196f3; text-align:center; }
            .stat_sub { font-size:14px; color:#999; margin-top:5px; text-align:center; }
            .stat_list { font-size:15px; color:#555; }
            .eff_row { display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px dashed #eee; }
            .stat_total { margin-top:8px; text-align:right; font-size:16px; }

            .td_actions { text-align:center; margin-top:20px; }
            .train_big_btn { 
                font-size:26px; padding:15px 80px; border-radius:40px; border:none; 
                background:linear-gradient(to bottom, #5d4037, #3e2723); 
                color:#fff; cursor:pointer; box-shadow:0 4px 10px rgba(93, 64, 55, 0.4); 
                transition:0.2s; font-family:"KaiTi"; font-weight:bold; letter-spacing:2px;
            }
            .train_big_btn:hover { transform:translateY(-2px); box-shadow:0 6px 15px rgba(93, 64, 55, 0.5); }
            .train_big_btn:active { transform:translateY(1px); }
            .train_big_btn.disabled { background:#bdbdbd; cursor:not-allowed; box-shadow:none; color:#eee; }
            .train_cost_tip { margin-top:12px; color:#888; font-size:16px; }

            .empty_tip { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:22px; text-align:center; }
        `;
        const style = document.createElement('style');
        style.id = 'style-ui-train';
        style.textContent = css;
        document.head.appendChild(style);
    }
};

window.UITrain = UITrain;