// js/core/utils_tip.js
// 悬浮窗专用管理器 (Tooltip System) - 性能优化版
// 优化内容：引入 requestAnimationFrame 节流，缓存窗口尺寸，修复变量重复声明
//console.log("加载 悬浮窗系统 (性能优化版)");

const TooltipManager = {
    el: null,
    _visible: false, // 内部状态标记
    _rAF: null,      // 动画帧ID
    _mouseX: 0,      // 缓存鼠标X
    _mouseY: 0,      // 缓存鼠标Y
    _winW: window.innerWidth, // 缓存窗口宽
    _winH: window.innerHeight,// 缓存窗口高

    _regionMap: {
        "xiongnu": "匈奴漠北", "beidi": "北地边疆", "guanzhong": "关中秦地",
        "zhongyuan": "中原腹地", "jiangnan": "江南水乡", "bashu": "巴蜀险地",
        "liaodong": "辽东雪原", "xiyu": "西域大漠", "nanman": "南蛮丛林", "lingnan": "岭南山越"
    },



    _init: function() {
        if (!this.el) {
            this.el = document.getElementById('global_tooltip');
            if (!this.el) {
                this.el = document.createElement('div');
                this.el.id = 'global_tooltip';
                this.el.className = 'ink_tooltip hidden';
                // 【优化】告诉浏览器该元素位置会频繁变化，启用合成层
                this.el.style.willChange = 'top, left';
                // 【优化】确保层级够高且不捕捉鼠标事件，防止闪烁
                this.el.style.pointerEvents = 'none';
                this.el.style.zIndex = '999999';
                document.body.appendChild(this.el);
            }

            // 【优化】监听窗口大小改变，更新缓存
            window.addEventListener('resize', () => {
                this._winW = window.innerWidth;
                this._winH = window.innerHeight;
            }, { passive: true });
        }
    },

    // 【核心优化】使用 rAF 更新位置，而非直接操作
    _updatePosition: function() {
        if (!this._visible || !this.el) return;

        const x = this._mouseX + 15;
        const y = this._mouseY + 15;

        // 获取元素尺寸（这个操作有一定消耗，但 rAF 限制了频率）
        // 如果悬浮窗内容不动态变化，也可以考虑缓存 rect
        const rect = this.el.getBoundingClientRect();

        let left = x;
        let top = y;

        // 边界检测
        if (x + rect.width > this._winW) left = x - rect.width - 30;
        if (y + rect.height > this._winH) top = y - rect.height - 15;

        // 应用位置
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';

        this._rAF = null; // 重置帧ID
    },

    // 外部调用的移动接口，只记录坐标并请求帧
    _move: function(e) {
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        if (this._visible && !this._rAF) {
            this._rAF = requestAnimationFrame(this._updatePosition.bind(this));
        }
    },

    hide: function() {
        this._visible = false;
        if (this._rAF) {
            cancelAnimationFrame(this._rAF);
            this._rAF = null;
        }
        if (this.el) {
            this.el.classList.add('hidden');
            this.el.style.width = '';
        }
    },

    // 显示通用逻辑
    _show: function() {
        this._visible = true;
        if (this.el) {
            this.el.classList.remove('hidden');
            // 立即触发一次位置更新，防止刚显示时闪烁在左上角
            this._updatePosition();
        }
    },

    /* ================= 1. 状态栏属性详情 ================= */
    showStatus: function(arg1, arg2, arg3) {
        this._init();
        if (!this.el) return;

        let id, e, label;
        if (arg1 instanceof Event || (arg1 && arg1.pageX !== undefined)) {
            e = arg1; id = arg2; label = arg3;
        } else {
            id = arg1; e = arg2; label = null;
        }

        if (!id || !e) return;
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        let html = '';

        if (window.player && player.buffs && player.buffs[id]) {
            const b = player.buffs[id];
            const color = b.isDebuff ? "#ff4444" : "#44ff44";

            // --- 【核心修改：支持百分比显示】 ---
            let displayVal = b.val;
            if (b.attr === 'studyEff') {
                const pct = Math.round(parseFloat(b.val) * 100);
                displayVal = (pct > 0 ? "+" : "") + pct + "%";
            }
            // ------------------------------------

            html = `
            <div class="tt_title" style="color:${color}; font-weight:bold;">${b.name}</div>
            <div class="tt_row">
                <span>剩余时间</span>
                <span style="color:#fff;">${b.days} 天</span>
            </div>
            <div class="tt_row">
                <span>当前影响</span>
                <span style="color:${color};">${ATTR_MAPPING[b.attr] || b.attr} ${displayVal}</span>
            </div>
            <div class="tt_desc" style="margin-top:8px; border-top:1px dashed #555; padding-top:4px; font-style:italic; color:#aaa;">
                ${b.desc || "暂无描述"}
            </div>`;
        }
        // --- 原有逻辑：属性加成详情 (statBreakdown) ---
        else {
            const breakdown = window.player && window.player.statBreakdown ? window.player.statBreakdown[id] : [];
            html = `<div class="tt_title">${label || id}详情</div>`;
            let hasContent = false;

            if (breakdown && breakdown.length > 0) {
                breakdown.forEach(b => {
                    if (b.val === 0) return;
                    const valStr = b.val > 0 ? `+${b.val}` : `${b.val}`;
                    const colorClass = b.val > 0 ? 'tt_pos' : 'tt_neg';
                    let extraHtml = '';
                    if (b.days) {
                        extraHtml = `<span style="font-size:12px; color:#888; margin-left:4px;">(${b.days}天)</span>`;
                    }
                    html += `
                  <div class="tt_row">
                    <span>${b.label}</span>
                    <div>
                        <span class="${colorClass}">${valStr}</span>
                        ${extraHtml}
                    </div>
                  </div>`;
                    hasContent = true;
                });
            }

            if (!hasContent) {
                html += `<div class="tt_desc">暂无加成来源</div>`;
            }
        }

        this.el.className = 'ink_tooltip';
        this.el.innerHTML = html;
        this._show(); // 内部会调用 _updatePosition 处理边界检测
    },
    /* ================= 2. 普通物品 (背包/地图) ================= */
    showItem: function(e, itemId, instance = null, mode = 'normal') {
        if (mode === 'gallery') { this.showGalleryItem(e, itemId); return; }
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const item = instance || (typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i =>i.id === itemId) : null);
        if (!item) return;

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : {};
        const color = rarityConf.color || '#ccc';
        const typeName = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING[item.type] : item.type;

        let html = `<div class="tt_header" style="color:${color}">${item.name}</div>`;
        html += `<div class="tt_sub">${typeName || '未知'} · ${item.rarity}品</div>`;
        html += `<div class="tt_desc">${item.desc || '暂无描述'}</div>`;

        if (item.type === 'book' && typeof player !== 'undefined') {
            const isLearned = (player.skills && player.skills[item.id]) || (player.learnedRecipes && player.learnedRecipes.includes(item.id));
            html += `<div class="tt_sep"></div><div class="tt_row"><span>修习状态</span><span class="${isLearned ? 'tt_pos' : 'tt_neu'}">${isLearned ? '已研读' : '未研读'}</span></div>`;
        }
        if (item.price || item.value) {
            html += `<div class="tt_row"><span>参考价</span><span style="color:gold">${item.value || item.price} </span></div>`;
        }

        let statsHtml = ''; // 【修复】这里只声明一次，不要在if里重复声明
        if (item.effects) {
            const effects = item.stats || item.effects || {};

            for (let k in effects) {
                let val = effects[k];

                if (k === 'buff' && typeof val === 'object') {
                    const buffAttrs = String(val.attr).split('_');
                    const buffVals = String(val.val).split('_');
                    let buffDetailsHtml = "";
                    buffAttrs.forEach((attrKey, index) => {
                        const attrLabel = ATTR_MAPPING[attrKey] || attrKey;
                        const currentVal = buffVals[index] !== undefined ? buffVals[index] : buffVals[0];
                        const displayVal = parseInt(currentVal) > 0 ? `+${currentVal}` : currentVal;

                        buffDetailsHtml += `
                        <div class="tt_row">
                            <span style="color:#ba68c8;">💫 临时${attrLabel}</span>
                            <span style="color:#ba68c8; font-weight:bold;">${displayVal}</span>
                        </div>`;
                    });

                    let durationText = `${val.days} 天`;
                    if (window.player && window.player.buffs && window.player.buffs[item.id]) {
                        const activeBuff = window.player.buffs[item.id];
                        if (activeBuff.days > 0) {
                            const realDays = typeof activeBuff.days === 'number' ? activeBuff.days.toFixed(1) : activeBuff.days;
                            durationText = `<span style="color:#ffd700;">${realDays} 天 (剩余)</span>`;
                        }
                    }

                    statsHtml += buffDetailsHtml;
                    statsHtml += `
                    <div class="tt_row" style="padding-left:10px; font-size:12px; color:#aaa;">
                        └ 持续时间: ${durationText}
                    </div>`;
                    continue;
                }

                if (typeof val === 'number' && val !== 0) {
                    if (k === 'max_skill_level') continue;
                    let label = ATTR_MAPPING[k] || k;
                    let c = '#fff';
                    if (k === 'hp') c = '#4caf50';
                    else if (k === 'mp') c = '#2196f3';
                    else if (k === 'atk') c = '#ff9800';
                    else if (k === 'def') c = '#9e9e9e';
                    else if (k === 'toxicity') { label = '☠️ 丹毒'; c = '#9c27b0'; }

                    statsHtml += `<div class="tt_row"><span style="color:#ccc;">${label}</span><span style="color:${c}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span></div>`;
                }
            }

            if (statsHtml) {
                html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;
            }
        }
        this.el.className = 'ink_tooltip';
        this.el.innerHTML = html;
        this._show();
    },

    /* ================= 3. 技能详情 ================= */
    /* ================= 3. 技能详情 (修改版：展示主动技能) ================= */
    showSkill: function(e, skillId) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(skillId) : null;
        const item = GAME_DB.items.find(i =>i.id === skillId);
        if (!item || !info) return;

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : { color: '#ccc', name: '普通' };
        const typeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
        const typeName = typeMap[item.type] || "功法";
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};
        const isMastered = player.skills && player.skills[skillId] && player.skills[skillId].mastered;

        const styleHeader = `font-size:22px; font-weight:bold; color:${rarityConf.color}; word-break: break-all;`;
        const styleSub = `font-size:15px; color:#aaa; margin-top:4px;`;
        const styleBarLabel = `font-size:14px; color:#ccc;`;
        const styleBarNum = `font-size:14px; color:#eee;`;
        const styleStatRow = `font-size:16px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;`;
        const styleDesc = `font-size:16px; color:#bbb; line-height:1.6; margin-top:10px; padding-top:10px; border-top:1px dashed #444;`;
        const tagStyle = `display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 14px; font-weight: bold; white-space: nowrap; flex-shrink: 0;`;
        const levelTag = `<span style="${tagStyle} background:#d4af37; color:#000;">${info.levelName}</span>`;
        const limitTag = `<span style="${tagStyle} background:#444; color:#ccc;">上限: ${info.limitLevelName}</span>`;

        let html = `
        <div style="border-bottom:1px solid #555; padding-bottom:8px; margin-bottom:8px; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                <span style="${styleHeader}; flex:1;">${item.name}</span>
                <div>${levelTag}</div>
            </div>
            <div style="${styleSub}; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <span>${typeName} · ${rarityConf.name}</span>
                ${limitTag}
            </div>
        </div>`;

        let expText = "已满级";
        let progressPct = 100;
        if (info.nextExp !== -1) {
            expText = `${Math.floor(info.exp)} / ${Math.floor(info.nextExp)}`;
            progressPct = Math.min(100, (info.exp / info.nextExp) * 100);
        } else if (info.isCapped) {
            expText = "已达瓶颈";
        }

        html += `
        <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="${styleBarLabel}">熟练度</span>
                <span style="${styleBarNum}">${expText}</span>
            </div>
            <div style="width:100%; height:6px; background:#333; border-radius:3px; overflow:hidden;">
                <div style="width:${progressPct}%; height:100%; background:${info.isCapped ? '#ff9800' : '#4caf50'};"></div>
            </div>
        </div>`;

        // 基础属性加成
        if (info.baseEffects) {
            let statsHtml = "";
            for (let key in info.baseEffects) {
                if (key === 'max_skill_level') continue;
                const baseVal = info.baseEffects[key];
                const finalVal = info.finalEffects[key];
                if (typeof baseVal !== 'number') continue;
                if (baseVal === 0 && finalVal === 0) continue;

                const name = attrMap[key] || key;
                let valDisplay = `<span style="color:#fff;">${baseVal}</span><span style="color:#d4af37; margin-left:4px;">(${finalVal})</span>`;
                statsHtml += `<div style="${styleStatRow}"><span style="color:#ccc;">${name}</span><span>${valDisplay}</span></div>`;
            }
            if (statsHtml) {
                html += `<div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px;">${statsHtml}</div>`;
            }
        }

        // --- 新增：主动技能展示 ---
        if (item.action) {
            const act = item.action;
            // 构造简单的描述
            // 例如：造成 150% 伤害 (消耗: 20 MP, CD: 3回合)
            // 也可以更详细
            let dmgStr = "";
            if (act.dmgMult) dmgStr = `造成 <span style="color:#ff5252; font-weight:bold;">${Math.round(act.dmgMult * 100)}%</span> 伤害`;

            let costStr = "";
            if (act.mpCost) costStr = `消耗 <span style="color:#2196f3;">${act.mpCost}</span> 内力`;

            let cdStr = "";
            if (act.cd) cdStr = `冷却 <span style="color:#ff9800;">${act.cd}</span> 回合`;

            // 组合消耗与CD
            let metaInfo = [];
            if (costStr) metaInfo.push(costStr);
            if (cdStr) metaInfo.push(cdStr);

            html += `
            <div style="margin-top:10px; padding:8px; background:rgba(217, 83, 79, 0.1); border:1px solid rgba(217, 83, 79, 0.3); border-radius:4px;">
                <div style="color:#e57373; font-weight:bold; font-size:16px; margin-bottom:4px; display:flex; justify-content:space-between;">
                    <span>⚡ 主动招式：${act.name || '未命名'}</span>
                </div>
                ${dmgStr ? `<div style="color:#ddd; font-size:14px; margin-bottom:4px;">${dmgStr}</div>` : ''}
                ${metaInfo.length > 0 ? `<div style="color:#aaa; font-size:12px; margin-bottom:4px;">${metaInfo.join(' | ')}</div>` : ''}
                ${act.desc ? `<div style="color:#ccc; font-size:14px; line-height:1.4; border-top:1px dashed rgba(217,83,79,0.3); padding-top:4px; margin-top:4px;">${act.desc}</div>` : ''}
            </div>`;
        }
        // -------------------------

        if (isMastered && info.masteryBonus) {
            const mAttr = attrMap[info.masteryBonus.attr] || info.masteryBonus.attr;
            const mVal = info.masteryBonus.val;
            html += `
            <div style="margin-top:10px; padding:8px; background:rgba(255, 235, 59, 0.1); border:1px solid rgba(255, 235, 59, 0.3); border-radius:4px;">
                <div style="color:#ffeb3b; font-weight:bold; font-size:16px; margin-bottom:4px;">✨ 已参悟</div>
                <div style="color:#ddd; font-size:14px;">
                    轮回加成: <span style="color:#fff">${mAttr}</span> <span style="color:#ffeb3b">+${mVal}</span>
                </div>
            </div>`;
        }

        html += `<div style="${styleDesc}">${item.desc || "暂无描述"}</div>`;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '320px';
        this.el.innerHTML = html;
        this._show();
    },

    /* ================= 4. 万物图鉴 ================= */
    showGalleryItem: function(e, itemId) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const item = typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i =>i.id === itemId) : null;
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

        const rowStyle = `font-size:16px; margin-bottom:4px; line-height:1.6; display:flex; justify-content:space-between; align-items:center;`;
        const labelStyle = `color:#bbb;`;

        let html = `
      <div style="border-bottom:1px solid #555; padding-bottom:8px; margin-bottom:8px;">
         <div style="display:flex; justify-content:space-between; align-items:baseline;">
             <span style="color:${color}; font-weight:bold; font-size:18px;">${name}</span>
             <span style="font-size:14px; color:#888;">${rarityName}</span>
         </div>
         <div style="font-size:14px; color:#aaa; margin-top:4px;">${typeName}</div>
      </div>`;

        const effects = item.effects || item.stats || item.param;
        let statsHtml = "";

        if (item.studyCost) {
            statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">研读消耗</span><span style="color:#e91e63;">${item.studyCost} 精力</span></div>`;
        }

        if (effects) {
            for (let key in effects) {
                const val = effects[key];
                if (typeof val === 'number' && val === 0) continue;
                if (val === null || val === undefined) continue;

                if (key === 'buff' && typeof val === 'object') {
                    const buffAttrs = String(val.attr).split('_');
                    const buffVals = String(val.val).split('_');
                    buffAttrs.forEach((attrKey, index) => {
                        const attrName = attrMap[attrKey] || attrKey;
                        const currentVal = buffVals[index] !== undefined ? buffVals[index] : buffVals[0];
                        if (parseInt(currentVal) === 0) return;
                        const sign = parseInt(currentVal) > 0 ? "+" : "";
                        statsHtml += `
                    <div class="tt_row" style="${rowStyle}">
                        <span style="${labelStyle}">临时${attrName}</span>
                        <span style="color:#2196f3;">
                            ${sign}${currentVal} 
                            <span style="font-size:12px; color:#aaa;">(${val.days}天)</span>
                        </span>
                    </div>`;
                    });
                    continue;
                }

                if (key === 'toxicity') {
                    const sign = val > 0 ? "+" : "";
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">丹毒</span><span style="color:#9c27b0;">${sign}${val}</span></div>`;
                    continue;
                }
                if (key === 'map' && val === true) {
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">特殊效果</span><span style="color:#d4af37; font-weight:bold;">🌏 全图视野</span></div>`;
                    continue;
                }
                if (key === 'unlockRegion') {
                    const rName = this._regionMap[val] || val;
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">解锁区域</span><span style="color:#2196f3;">🗺️ ${rName}</span></div>`;
                    continue;
                }

                if (typeof val === 'object') continue;
                const name = attrMap[key] || key;

                if (key === 'hp' || key === 'mp') {
                    const c = val > 0 ? '#4caf50' : '#f44336';
                    const p = val > 0 ? "恢复" : "减少";
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">${p}${name}</span><span style="color:${c}">${val > 0 ? '+' : ''}${val}</span></div>`;
                } else if (key === 'hunger') {
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">${name}</span><span style="color:#4caf50">+${val}</span></div>`;
                } else if (key === 'max_skill_level') {
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">${name}</span><span style="color:#ff9800">Lv.${val}</span></div>`;
                } else {
                    const c = val > 0 ? '#eee' : '#f44336';
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">${name}</span><span style="color:${c}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span></div>`;
                }
            }
        }

        if (statsHtml) html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;
        html += `<div class="tt_desc" style="font-size:14px; line-height:1.5;">${desc}</div>`;
        if (price > 0) html += `<div class="tt_row" style="margin-top:10px; font-size:14px; display:flex; justify-content:space-between;"><span style="color:#bbb;">价值</span><span style="color:#d4af37; font-weight:bold;">💰  ${price} </span></div>`;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '240px';
        this.el.innerHTML = html;
        this._show();
    }
};

window.TooltipManager = TooltipManager;
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showGalleryTooltip = TooltipManager.showGalleryItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);

// 【优化】事件监听逻辑：
// 1. 全局监听 mousemove 更新坐标 (被动模式，性能更好)
// 2. 只有当 Tooltip 可见时，才请求动画帧更新 DOM
document.addEventListener('mousemove', (e) => {
    TooltipManager._move(e);
}, { passive: true });