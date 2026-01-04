// js/core/utils_tip.js
// 悬浮窗专用管理器 (Tooltip System)
// 优化版：自动隐藏数值为 0 的属性，保留负数显示
console.log("加载 悬浮窗系统");

const TooltipManager = {
    el: null, // DOM 元素缓存

    // 地区映射表 (用于图鉴显示)
    _regionMap: {
        "xiongnu": "匈奴漠北",
        "beidi": "北地边疆",
        "guanzhong": "关中秦地",
        "zhongyuan": "中原腹地",
        "jiangnan": "江南水乡",
        "bashu": "巴蜀险地",
        "liaodong": "辽东雪原",
        "xiyu": "西域大漠",
        "nanman": "南蛮丛林",
        "lingnan": "岭南山越"
    },

    // 初始化获取 DOM
    _init: function() {
        if (!this.el) {
            this.el = document.getElementById('global_tooltip');
        }
    },

    // 移动逻辑 (带边界检测)
    _move: function(e) {
        if (!this.el) return;

        // 鼠标右下角偏移 15px
        const x = e.clientX + 15;
        const y = e.clientY + 15;

        // 获取尺寸信息
        const rect = this.el.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        let left = x;
        let top = y;

        // 防止溢出右边界
        if (x + rect.width > winW) {
            left = x - rect.width - 30; // 翻转到鼠标左侧
        }
        // 防止溢出下边界
        if (y + rect.height > winH) {
            top = y - rect.height - 15; // 翻转到鼠标上方
        }

        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
    },

    // 隐藏
    hide: function() {
        if (this.el) {
            this.el.classList.add('hidden');
            this.el.style.width = ''; // 重置宽度（防止图鉴的宽度影响其他）
        }
    },

    /* ================= 1. 状态栏属性详情 ================= */
    showStatus: function(e, key, label) {
        this._init();

        // 获取属性构成详情
        const breakdown = window.player && window.player.statBreakdown ? window.player.statBreakdown[key] : [];

        let html = `<div class="tt_title">${label}详情</div>`;
        let hasContent = false;

        if (breakdown && breakdown.length > 0) {
            breakdown.forEach(b => {
                // 【优化】如果数值是 0，不显示
                if (b.val === 0) return;

                const valStr = b.val > 0 ? `+${b.val}` : `${b.val}`;
                const colorClass = b.val > 0 ? 'tt_pos' : 'tt_neg';

                html += `
          <div class="tt_row">
            <span>${b.label}</span>
            <span class="${colorClass}">${valStr}</span>
          </div>`;
                hasContent = true;
            });
        }

        if (!hasContent) {
            html += `<div class="tt_desc">暂无加成来源</div>`;
        }

        this.el.className = 'ink_tooltip'; // 基础样式
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    },

    /* ================= 2. 普通物品 (背包/地图) ================= */
    showItem: function(e, itemId, instance = null, mode = 'normal') {
        // 如果指定了图鉴模式，转发给专用方法
        if (mode === 'gallery') {
            this.showGalleryItem(e, itemId);
            return;
        }

        this._init();
        const item = instance || (typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i => i.id === itemId) : null);
        if (!item) return;

        // 配置获取
        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : {};
        const color = rarityConf.color || '#ccc';
        const typeName = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING[item.type] : item.type;
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};

        // --- HTML 构建 ---
        let html = `<div class="tt_header" style="color:${color}">${item.name}</div>`;
        html += `<div class="tt_sub">${typeName || '未知'} · ${item.rarity}品</div>`;
        html += `<div class="tt_desc">${item.desc || '暂无描述'}</div>`;

        // 书籍修习状态
        if (item.type === 'book' && typeof player !== 'undefined') {
            const isLearned = (player.skills && player.skills[item.id]) ||
                (player.learnedRecipes && player.learnedRecipes.includes(item.id));
            html += `<div class="tt_sep"></div>`;
            html += `
        <div class="tt_row">
          <span>修习状态</span>
          <span class="${isLearned ? 'tt_pos' : 'tt_neu'}">${isLearned ? '已研读' : '未研读'}</span>
        </div>`;
        }

        // 价格
        if (item.price || item.value) {
            html += `
        <div class="tt_row">
          <span>参考价</span>
          <span style="color:gold">${item.value || item.price} </span>
        </div>`;
        }

        // 属性列表
        if (item.effects) {
            let hasEffects = false;
            let effectRows = "";

            for (let k in item.effects) {
                const val = item.effects[k];

                // 【优化】跳过数值为 0 的属性，但保留非数值（如true）或负数
                if (typeof val === 'number' && val === 0) continue;
                if (val === null || val === undefined) continue;

                const attrName = attrMap[k] || k;
                let displayVal = val > 0 ? `+${val}` : `${val}`;
                let colorClass = val > 0 ? 'tt_pos' : 'tt_neg';

                // 特殊处理
                if (k === 'map') { displayVal = "全图视野"; colorClass = "tt_pos"; }
                if (k === 'unlockRegion') { displayVal = this._regionMap[val] || val; colorClass = "tt_pos"; }

                effectRows += `
          <div class="tt_row">
            <span style="color:#aaa">${attrName}</span>
            <span class="${colorClass}">${displayVal}</span>
          </div>`;
                hasEffects = true;
            }

            if (hasEffects) {
                html += `<div class="tt_sep"></div>`;
                html += effectRows;
            }
        }

        this.el.className = 'ink_tooltip';
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    },

    /* ================= 3. 技能详情 ================= */
    /* ================= 3. 技能详情 (重构版) ================= */
    showSkill: function(e, skillId) {
        this._init();

        // 1. 获取计算后的详细信息
        const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(skillId) : null;
        const item = GAME_DB.items.find(i => i.id === skillId);

        if (!item || !info) return; // 数据错误

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : { color: '#ccc', name: '普通' };
        const typeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
        const typeName = typeMap[item.type] || "功法";
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};

        // 2. 构建头部
        let html = `
        <div class="tooltip_header" style="border-bottom:1px solid #555; padding-bottom:5px; margin-bottom:5px;">
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
                <span style="color:${rarityConf.color}; font-weight:bold; font-size:18px;">${item.name}</span>
                <span style="font-size:14px; color:#aaa;">${info.levelName}</span>
            </div>
            <div style="font-size:12px; color:#888; margin-top:2px;">
                ${typeName} · 上限: ${info.limitLevelName}
            </div>
        </div>
    `;

        // 3. 熟练度显示 (进度条风格)
        let expText = "已满级";
        let progressPct = 100;

        if (info.nextExp !== -1) {
            expText = `${Math.floor(info.exp)} / ${Math.floor(info.nextExp)}`;
            progressPct = Math.min(100, (info.exp / info.nextExp) * 100);
        } else if (info.isCapped) {
            expText = "已达瓶颈 (上限)";
        }

        html += `
        <div style="margin-bottom:8px; font-size:12px; color:#ccc;">
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                <span>熟练度</span>
                <span>${expText}</span>
            </div>
            <div style="width:100%; height:4px; background:#333; border-radius:2px;">
                <div style="width:${progressPct}%; height:100%; background:${info.isCapped ? '#ff9800' : '#4caf50'}; border-radius:2px;"></div>
            </div>
        </div>
    `;

        // 4. 属性显示 (基础 vs 实际)
        if (info.baseEffects) {
            let statsHtml = "";
            const rowStyle = `font-size:14px; margin-bottom:4px; display:flex; justify-content:space-between;`;

            for (let key in info.baseEffects) {
                const baseVal = info.baseEffects[key];
                const finalVal = info.finalEffects[key];

                // 跳过非数值
                if (typeof baseVal !== 'number') continue;

                const name = attrMap[key] || key;
                const bonus = info.bonusRate * 100; // e.g. 20

                // 如果有加成，显示黄色箭头
                let valDisplay = `<span style="color:#eee">${baseVal}</span>`;
                if (finalVal > baseVal) {
                    valDisplay = `<span style="color:#999; font-size:12px;">${baseVal}</span> ➜ <span style="color:#ffeb3b; font-weight:bold;">${finalVal}</span>`;
                }

                statsHtml += `
                <div style="${rowStyle}">
                    <span style="color:#bbb;">${name}</span>
                    <span>${valDisplay}</span>
                </div>
            `;
            }

            if (statsHtml) {
                html += `<div style="border-top:1px dashed #444; padding-top:5px; margin-bottom:8px;">${statsHtml}</div>`;
            }
        }

        // 5. 描述
        html += `<div class="tt_desc" style="font-size:13px;">${item.desc || "暂无描述"}</div>`;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '240px';
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    },

    /* ================= 4. 万物图鉴专用 (大字体、对齐、无图标) ================= */
    showGalleryItem: function(e, itemId) {
        this._init();

        // 1. 数据准备
        const item = typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i => i.id === itemId) : null;
        if (!item) return;

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : { color: '#ccc', name: '普通' };
        const typeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};

        const color = rarityConf.color;
        const rarityName = rarityConf.name || `${item.rarity}品`;
        const typeName = typeMap[item.type] || "物品";
        const name = item.name;
        const desc = item.desc || "暂无描述";
        const price = item.value || item.price || 0;

        // 2. 样式常量
        const rowStyle = `font-size:16px; margin-bottom:4px; line-height:1.6; display:flex; justify-content:space-between; align-items:center;`;
        const labelStyle = `color:#bbb;`; // 灰色标签

        // 3. 构建 HTML

        // [A] 头部
        let html = `
      <div style="border-bottom:1px solid #555; padding-bottom:8px; margin-bottom:8px;">
         <div style="display:flex; justify-content:space-between; align-items:baseline;">
             <span style="color:${color}; font-weight:bold; font-size:18px;">${name}</span>
             <span style="font-size:14px; color:#888;">${rarityName}</span>
         </div>
         <div style="font-size:14px; color:#aaa; margin-top:4px;">${typeName}</div>
      </div>
    `;

        // [B] 属性 (Stats / Effects / Param)
        const effects = item.effects || item.stats || item.param;
        let statsHtml = "";

        // 0. 书籍研读消耗
        if (item.studyCost) {
            statsHtml += `
        <div class="tt_row" style="${rowStyle}">
           <span style="${labelStyle}">研读消耗</span>
           <span style="color:#e91e63;">${item.studyCost} 精力</span>
        </div>`;
        }

        if (effects) {
            for (let key in effects) {
                const val = effects[key];

                // 【优化】跳过数值为 0 的属性，但保留非数值或负数
                if (typeof val === 'number' && val === 0) continue;
                if (val === null || val === undefined) continue;

                // 1. Buff 对象 (嵌套)
                if (key === 'buff' && typeof val === 'object') {
                    const attrName = attrMap[val.attr] || val.attr;
                    // Buff val 0 也不显示
                    if (val.val === 0) continue;

                    const sign = val.val > 0 ? "+" : "";
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">临时${attrName}</span>
               <span style="color:#2196f3;">${sign}${val.val} <span style="font-size:12px; color:#aaa;">(${val.days}天)</span></span>
            </div>`;
                    continue;
                }

                // 2. 丹毒 (通常 > 0 显示，如果真的有 -1 丹毒表示解毒，也显示)
                if (key === 'toxicity') {
                    const sign = val > 0 ? "+" : "";
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">丹毒</span>
               <span style="color:#9c27b0;">${sign}${val}</span>
            </div>`;
                    continue;
                }

                // 3. 地图特殊效果
                if (key === 'map' && val === true) {
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">特殊效果</span>
               <span style="color:#d4af37; font-weight:bold;">🌏 全图视野</span>
            </div>`;
                    continue;
                }
                if (key === 'unlockRegion') {
                    const rName = this._regionMap[val] || val;
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">解锁区域</span>
               <span style="color:#2196f3;">🗺️ ${rName}</span>
            </div>`;
                    continue;
                }

                // 4. 常规数值
                if (typeof val === 'object') continue;
                const name = attrMap[key] || key;

                if (key === 'hp' || key === 'mp') {
                    // 正数为恢复(绿)，负数为减少(红)
                    const c = val > 0 ? '#4caf50' : '#f44336';
                    const p = val > 0 ? "恢复" : "减少";
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">${p}${name}</span>
               <span style="color:${c}">${val > 0 ? '+' : ''}${val}</span>
            </div>`;
                } else if (key === 'hunger') {
                    // 饱食度通常为正
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">${name}</span>
               <span style="color:#4caf50">+${val}</span>
            </div>`;
                } else if (key === 'max_skill_level') {
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">${name}</span>
               <span style="color:#ff9800">Lv.${val}</span>
            </div>`;
                } else {
                    // 战斗属性
                    const c = val > 0 ? '#eee' : '#f44336'; // 正数白，负数红
                    statsHtml += `
            <div class="tt_row" style="${rowStyle}">
               <span style="${labelStyle}">${name}</span>
               <span style="color:${c}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span>
            </div>`;
                }
            }
        }

        if (statsHtml) {
            html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;
        }

        // [C] 描述
        html += `<div class="tt_desc" style="font-size:14px; line-height:1.5;">${desc}</div>`;

        // [D] 价格
        if (price > 0) {
            html += `
        <div class="tt_row" style="margin-top:10px; font-size:14px; display:flex; justify-content:space-between;">
           <span style="color:#bbb;">价值</span>
           <span style="color:#d4af37; font-weight:bold;">💰  ${price} </span>
        </div>`;
        }

        // 设置样式
        this.el.className = 'ink_tooltip';
        this.el.style.width = '240px';
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    }
};

// 暴露全局方法
window.TooltipManager = TooltipManager;
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showGalleryTooltip = TooltipManager.showGalleryItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);

// 全局监听移动
document.addEventListener('mousemove', (e) => {
    const tt = document.getElementById('global_tooltip');
    if (tt && !tt.classList.contains('hidden')) {
        TooltipManager._move(e);
    }
});