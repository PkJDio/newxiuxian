// js/core/utils_tip.js
// 悬浮窗管理器 (最终完整版)
// 特性：GPU加速渲染 + 坐标自动修正 + 完整的功法/物品样式
// console.log("加载 悬浮窗系统 (Final)");

const TooltipManager = {
    el: null,
    _visible: false,
    _rAF: null,
    _mouseX: 0,
    _mouseY: 0,
    _winW: window.innerWidth,
    _winH: window.innerHeight,
    _cacheW: 0,
    _cacheH: 0,

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
                document.body.appendChild(this.el);
            }

            // 【核心设置】强制重置坐标，启用GPU
            this.el.style.position = 'fixed';
            this.el.style.top = '0px';
            this.el.style.left = '0px';
            this.el.style.willChange = 'transform';
            this.el.style.pointerEvents = 'none';
            this.el.style.zIndex = '999999';
            this.el.style.backfaceVisibility = 'hidden'; // 抗锯齿

            window.addEventListener('resize', () => {
                this._winW = window.innerWidth;
                this._winH = window.innerHeight;
            }, { passive: true });
        }
    },

    // 使用 transform 更新位置 (高性能)
    _updatePosition: function() {
        if (!this._visible) return;

        const offset = 15;
        let x = this._mouseX + offset;
        let y = this._mouseY + offset;

        // 边界检测 (使用缓存尺寸)
        if (x + this._cacheW > this._winW) {
            x = this._mouseX - this._cacheW - offset;
        }
        if (y + this._cacheH > this._winH) {
            y = this._mouseY - this._cacheH - offset;
        }

        // 强制不超出左上角
        if (x < 0) x = 0;
        if (y < 0) y = 0;

        this.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        this._rAF = null;
    },

    _move: function(e) {
        if (this._visible) {
            this._mouseX = e.clientX;
            this._mouseY = e.clientY;
            if (!this._rAF) {
                this._rAF = requestAnimationFrame(this._updatePosition.bind(this));
            }
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
            this.el.style.transform = `translate3d(-5000px, -5000px, 0)`; // 移出屏幕
        }
    },

    _show: function() {
        this._init();
        this._visible = true;
        this.el.classList.remove('hidden');

        // 再次强制归零，防止逻辑干扰
        this.el.style.top = '0px';
        this.el.style.left = '0px';

        // 计算并缓存尺寸 (只在显示瞬间计算一次)
        const rect = this.el.getBoundingClientRect();
        this._cacheW = rect.width;
        this._cacheH = rect.height;

        this._updatePosition();
    },

    /* ================= 1. 状态栏详情 ================= */
    showStatus: function(arg1, arg2, arg3) {
        this._init();
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
            let displayVal = b.val;
            if (b.attr === 'studyEff') {
                const pct = Math.round(parseFloat(b.val) * 100);
                displayVal = (pct > 0 ? "+" : "") + pct + "%";
            }
            html = `
            <div class="tt_title" style="color:${color}; font-weight:bold;">${b.name}</div>
            <div class="tt_row"><span>剩余时间</span><span style="color:#fff;">${b.days} 天</span></div>
            <div class="tt_row"><span>当前影响</span><span style="color:${color};">${ATTR_MAPPING[b.attr] || b.attr} ${displayVal}</span></div>
            <div class="tt_desc" style="margin-top:8px; border-top:1px dashed #555; padding-top:4px; font-style:italic; color:#aaa;">${b.desc || "暂无描述"}</div>`;
        } else {
            const breakdown = window.player && window.player.statBreakdown ? window.player.statBreakdown[id] : [];
            html = `<div class="tt_title">${label || id}详情</div>`;
            if (breakdown && breakdown.length > 0) {
                breakdown.forEach(b => {
                    if (b.val === 0) return;
                    html += `<div class="tt_row"><span>${b.label}</span><span class="${b.val > 0 ? 'tt_pos' : 'tt_neg'}">${b.val > 0 ? '+' : ''}${b.val}</span></div>`;
                });
            } else {
                html += `<div class="tt_desc">暂无加成来源</div>`;
            }
        }

        this.el.className = 'ink_tooltip';
        this.el.innerHTML = html;
        this._show();
    },
    /* ================= 2.1 商店/图鉴物品详情 (查库版) ================= */
    /**
     * 显示商店物品详情 (无SID，直接查库)
     * @param {Event} e 鼠标事件
     * @param {String} itemId 物品模板ID
     */
    showShopItem: function(e, itemId) {
        // 1. 数据获取
        let item = null;
        if (window.GAME_DB && window.GAME_DB.items) {
            item = window.GAME_DB.items.find(i => i.id === itemId);
        }

        if (!item) {
            console.warn(`[Tooltip] 无法找到物品数据: ${itemId}`);
            return;
        }

        // 2. 复用 showItem 逻辑
        // 传入 null 作为 sid，传入 item 对象作为 instance
        this.showItem(e, null, item, 'normal');
    },
    /* ================= 2. 普通物品详情 (恢复完整版) ================= */
    showItem: function(e, sid, instance = null, mode = 'normal') {
        if (mode === 'gallery') { this.showGalleryItem(e, itemId); return; }
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const item = instance || ( window.player.inventory.find(i =>i.sid === sid) );
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

        let statsHtml = '';
        if (item.effects) {
            const effects = item.stats || item.effects || {};
            for (let k in effects) {
                let val = effects[k];
                // 恢复 Buff 显示
                if (k === 'buff' && typeof val === 'object') {
                    const buffAttrs = String(val.attr).split('_');
                    const buffVals = String(val.val).split('_');
                    let buffDetailsHtml = "";
                    buffAttrs.forEach((attrKey, index) => {
                        const attrLabel = ATTR_MAPPING[attrKey] || attrKey;
                        const currentVal = buffVals[index] !== undefined ? buffVals[index] : buffVals[0];
                        const displayVal = parseInt(currentVal) > 0 ? `+${currentVal}` : currentVal;
                        buffDetailsHtml += `<div class="tt_row"><span style="color:#ba68c8;">💫 临时${attrLabel}</span><span style="color:#ba68c8; font-weight:bold;">${displayVal}</span></div>`;
                    });

                    let durationText = `${val.days} 天`;
                    if (window.player && window.player.buffs && window.player.buffs[item.id]) {
                        const activeBuff = window.player.buffs[item.id];
                        if (activeBuff.days > 0) durationText = `<span style="color:#ffd700;">${typeof activeBuff.days === 'number' ? activeBuff.days.toFixed(1) : activeBuff.days} 天 (剩余)</span>`;
                    }
                    statsHtml += buffDetailsHtml;
                    statsHtml += `<div class="tt_row" style="padding-left:10px; font-size:12px; color:#aaa;">└ 持续时间: ${durationText}</div>`;
                    continue;
                }
                // 恢复基础属性显示
                if (typeof val === 'number' && val !== 0) {
                    if (k === 'max_skill_level') continue;
                    let label = ATTR_MAPPING[k] || k;
                    let c = '#fff';
                    if (k === 'hp') c = '#4caf50';
                    else if (k === 'mp') c = '#2196f3';
                    else if (k === 'atk') c = '#ff9800';
                    else if (k === 'toxicity') { label = '☠️ 丹毒'; c = '#9c27b0'; }
                    statsHtml += `<div class="tt_row"><span style="color:#ccc;">${label}</span><span style="color:${c}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span></div>`;
                }
            }
            if (statsHtml) html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;
        }

        this.el.className = 'ink_tooltip';
        this.el.innerHTML = html;
        this._show();
    },

    /* ================= 3. 技能详情 (恢复完整版+主动技能) ================= */
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

        // --- 样式定义 ---
        const styleHeader = `font-size:22px; font-weight:bold; color:${rarityConf.color}; word-break: break-all;`;
        const styleSub = `font-size:15px; color:#aaa; margin-top:4px;`;
        const styleBarLabel = `font-size:14px; color:#ccc;`;
        const styleBarNum = `font-size:14px; color:#eee;`;
        const styleStatRow = `font-size:16px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;`;
        const styleDesc = `font-size:16px; color:#bbb; line-height:1.6; margin-top:10px; padding-top:10px; border-top:1px dashed #444;`;
        const tagStyle = `display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 14px; font-weight: bold; white-space: nowrap; flex-shrink: 0;`;
        const levelTag = `<span style="${tagStyle} background:#d4af37; color:#000;">${info.levelName}</span>`;
        const limitTag = `<span style="${tagStyle} background:#444; color:#ccc;">上限: ${info.limitLevelName}</span>`;

        // 1. 标题头
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

        // 2. 进度条
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

        // 3. 基础属性加成
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

        // 4. 主动招式展示
        if (item.action) {
            const act = item.action;
            let dmgStr = "";
            if (act.dmgMult) dmgStr = `造成 <span style="color:#ff5252; font-weight:bold;">${Math.round(act.dmgMult * 100)}%</span> 伤害`;
            let costStr = "";
            if (act.mpCost) costStr = `消耗 <span style="color:#2196f3;">${act.mpCost}</span> 内力`;
            let cdStr = "";
            if (act.cd) cdStr = `冷却 <span style="color:#ff9800;">${act.cd}</span> 回合`;

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

        // 5. 参悟加成
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
        this.el.style.width = '320px'; // 稍微加宽一点适应内容
        this.el.innerHTML = html;
        this._show();
    },

    /* ================= 4. 图鉴详情 (保持通用逻辑) ================= */
    showGalleryItem: function(e, sid) {
        // 由于图鉴逻辑较长且与普通物品类似，直接复用 showItem 逻辑或保留你原有的复杂逻辑
        // 这里为了确保你的图鉴样式也恢复，我复用 showItem 的核心，但在顶部加个区分
        this.showItem(e, sid, null, 'normal');
    }
};

window.TooltipManager = TooltipManager;
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showGalleryTooltip = TooltipManager.showGalleryItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);
// 【新增】暴露商店物品悬浮窗接口
window.showShopItemTooltip = TooltipManager.showShopItem.bind(TooltipManager);
// 全局监听
document.addEventListener('mousemove', (e) => {
    TooltipManager._move(e);
}, { passive: true });