// js/core/utils_tip.js
// 悬浮窗专用管理器 (Tooltip System)
// 优化版：自动隐藏数值为 0 的属性，隐藏 max_skill_level 属性(头部已显示)
// 【新增】属性详情中显示 Buff 剩余时间
console.log("加载 悬浮窗系统");

const TooltipManager = {
    el: null,

    _regionMap: {
        "xiongnu": "匈奴漠北", "beidi": "北地边疆", "guanzhong": "关中秦地",
        "zhongyuan": "中原腹地", "jiangnan": "江南水乡", "bashu": "巴蜀险地",
        "liaodong": "辽东雪原", "xiyu": "西域大漠", "nanman": "南蛮丛林", "lingnan": "岭南山越"
    },


    // 属性名称映射
    _attrMap: {
        "atk": "攻击力", "def": "防御力", "speed": "速度",
        "hp": "生命", "hpMax": "生命上限","hp_max": "生命上限",
        "mp": "内力", "mpMax": "内力上限","mp_max": "内力上限",
        "jing": "精(体质)", "qi": "气(能量)", "shen": "神(悟性)",
        "toxicity": "丹毒"
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
        }
    },

    _move: function(e) {
        if (!this.el) return;
        const x = e.clientX + 15;
        const y = e.clientY + 15;
        const rect = this.el.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        let left = x;
        let top = y;
        if (x + rect.width > winW) left = x - rect.width - 30;
        if (y + rect.height > winH) top = y - rect.height - 15;
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
    },

    hide: function() {
        if (this.el) {
            this.el.classList.add('hidden');
            this.el.style.width = '';
        }
    },

    /* ================= 1. 状态栏属性详情 ================= */
    showStatus: function(e, key, label) {
        this._init();
        const breakdown = window.player && window.player.statBreakdown ? window.player.statBreakdown[key] : [];
        let html = `<div class="tt_title">${label}详情</div>`;
        let hasContent = false;

        if (breakdown && breakdown.length > 0) {
            breakdown.forEach(b => {
                // 【优化】如果数值是 0，不显示
                if (b.val === 0) return;

                const valStr = b.val > 0 ? `+${b.val}` : `${b.val}`;
                const colorClass = b.val > 0 ? 'tt_pos' : 'tt_neg';

                // 【新增】显示剩余天数
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

        this.el.className = 'ink_tooltip'; // 基础样式
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    },

    /* ================= 2. 普通物品 (背包/地图) ================= */
    showItem: function(e, itemId, instance = null, mode = 'normal') {
        if (mode === 'gallery') { this.showGalleryItem(e, itemId); return; }
        this._init();
        const item = instance || (typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i => i.id === itemId) : null);
        if (!item) return;

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : {};
        const color = rarityConf.color || '#ccc';
        const typeName = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING[item.type] : item.type;
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};

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
            let hasEffects = false;
            let effectRows = "";
            const effects = item.stats || item.effects || {};
            for (let k in effects) {
                let val = effects[k];
                // 【核心修改】处理嵌套的 buff 对象 (如 pills_042)
                if (k === 'buff' && typeof val === 'object') {
                    const buffAttr = this._attrMap[val.attr] || val.attr;
                    const buffVal = val.val > 0 ? `+${val.val}` : `${val.val}`;

                    // 默认显示配置表里的天数
                    let durationText = `${val.days} 天`;

                    // 【新增】检查玩家是否已激活该Buff，如果激活则显示实际剩余时间
                    if (window.player && window.player.buffs && window.player.buffs[itemId]) {
                        const activeBuff = window.player.buffs[itemId];
                        if (activeBuff.days > 0) {
                            // 保留1位小数
                            const realDays = typeof activeBuff.days === 'number' ? activeBuff.days.toFixed(1) : activeBuff.days;
                            durationText = `<span style="color:#ffd700;">${realDays} 天 (剩余)</span>`;
                        }
                    }

                    // 使用紫色显示临时Buff效果
                    statsHtml += `
                    <div class="tt_row">
                        <span style="color:#ba68c8;">💫 临时${buffAttr}</span>
                        <span style="color:#ba68c8; font-weight:bold;">${buffVal}</span>
                    </div>
                    <div class="tt_row" style="padding-left:10px; font-size:12px; color:#aaa;">
                        └ 持续时间: ${durationText}
                    </div>
                `;
                    continue; // 跳过常规处理
                }

                // 处理常规数值属性
                if (typeof val === 'number' && val !== 0) {
                    // 不显示 max_skill_level
                    if (k === 'max_skill_level') continue;

                    let label = this._attrMap[k] || k;
                    let c = '#fff';

                    if (k === 'hp') c = '#4caf50';
                    else if (k === 'mp') c = '#2196f3';
                    else if (k === 'atk') c = '#ff9800';
                    else if (k === 'def') c = '#9e9e9e';
                    else if (k === 'toxicity') {
                        label = '☠️ 丹毒'; c = '#9c27b0';
                    }

                    statsHtml += `<div class="tt_row"><span style="color:#ccc;">${label}</span><span style="color:${c}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span></div>`;
                }
            }
            if (statsHtml) {
                html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;
            }
        }
        this.el.className = 'ink_tooltip';
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    },

    /* ================= 3. 技能详情 (大字体、境界高亮、宽版适配) ================= */
    showSkill: function(e, skillId) {
        this._init();
        const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(skillId) : null;
        const item = GAME_DB.items.find(i => i.id === skillId);
        if (!item || !info) return;

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : { color: '#ccc', name: '普通' };
        const typeMap = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING : {};
        const typeName = typeMap[item.type] || "功法";
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};

        // 是否已参悟 (从 player.skills 读取)
        const isMastered = player.skills && player.skills[skillId] && player.skills[skillId].mastered;

        // 样式定义
        const styleHeader = `font-size:22px; font-weight:bold; color:${rarityConf.color}; word-break: break-all;`; // 允许换行
        const styleSub = `font-size:15px; color:#aaa; margin-top:4px;`;
        const styleBarLabel = `font-size:14px; color:#ccc;`;
        const styleBarNum = `font-size:14px; color:#eee;`;
        const styleStatRow = `font-size:16px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;`;
        const styleDesc = `font-size:16px; color:#bbb; line-height:1.6; margin-top:10px; padding-top:10px; border-top:1px dashed #444;`;

        // 境界标签样式 (flex布局，防止挤压)
        const tagStyle = `display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 14px; font-weight: bold; white-space: nowrap; flex-shrink: 0;`;
        const levelTag = `<span style="${tagStyle} background:#d4af37; color:#000;">${info.levelName}</span>`;
        const limitTag = `<span style="${tagStyle} background:#444; color:#ccc;">上限: ${info.limitLevelName}</span>`;

        // 2. 头部 (使用 Flex 布局优化长名字显示)
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
        </div>
        `;

        // 3. 熟练度
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
        </div>
        `;

        // 4. 属性显示
        if (info.baseEffects) {
            let statsHtml = "";
            console.group(`[Tooltip] 功法数值: ${item.name}`);

            for (let key in info.baseEffects) {
                if (key === 'max_skill_level') continue;

                const baseVal = info.baseEffects[key];
                const finalVal = info.finalEffects[key];

                if (typeof baseVal !== 'number') continue;

                // 【保留你原来的逻辑】数值为 0 则不显示
                if (baseVal === 0 && finalVal === 0) continue;

                console.log(`属性: ${key}, 基础: ${baseVal}, 实际: ${finalVal}`);

                const name = attrMap[key] || key;
                let valDisplay = `
                    <span style="color:#fff;">${baseVal}</span> 
                    <span style="color:#d4af37; margin-left:4px;">(${finalVal})</span>
                `;

                statsHtml += `
                <div style="${styleStatRow}">
                    <span style="color:#ccc;">${name}</span>
                    <span>${valDisplay}</span>
                </div>
                `;
            }
            console.groupEnd();

            if (statsHtml) {
                html += `<div style="background:rgba(255,255,255,0.05); padding:8px; border-radius:4px;">${statsHtml}</div>`;
            }
        }

        // 【新增】参悟加成显示
        if (isMastered && info.masteryBonus) {
            const mAttr = attrMap[info.masteryBonus.attr] || info.masteryBonus.attr;
            const mVal = info.masteryBonus.val;

            html += `
            <div style="margin-top:10px; padding:8px; background:rgba(255, 235, 59, 0.1); border:1px solid rgba(255, 235, 59, 0.3); border-radius:4px;">
                <div style="color:#ffeb3b; font-weight:bold; font-size:16px; margin-bottom:4px;">✨ 已参悟</div>
                <div style="color:#ddd; font-size:14px;">
                    轮回加成: <span style="color:#fff">${mAttr}</span> <span style="color:#ffeb3b">+${mVal}</span>
                </div>
            </div>
            `;
        }

        html += `<div style="${styleDesc}">${item.desc || "暂无描述"}</div>`;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '320px'; // 【修改】宽度增加到 320px
        this.el.innerHTML = html;
        this.el.classList.remove('hidden');
        this._move(e);
    },

    /* ================= 4. 万物图鉴 (保留) ================= */
    showGalleryItem: function(e, itemId) {
        this._init();
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
                    const attrName = attrMap[val.attr] || val.attr;
                    if (val.val === 0) continue;
                    const sign = val.val > 0 ? "+" : "";
                    statsHtml += `<div class="tt_row" style="${rowStyle}"><span style="${labelStyle}">临时${attrName}</span><span style="color:#2196f3;">${sign}${val.val} <span style="font-size:12px; color:#aaa;">(${val.days}天)</span></span></div>`;
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
        this.el.classList.remove('hidden');
        this._move(e);
    }
};

window.TooltipManager = TooltipManager;
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showGalleryTooltip = TooltipManager.showGalleryItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);

document.addEventListener('mousemove', (e) => {
    const tt = document.getElementById('global_tooltip');
    if (tt && !tt.classList.contains('hidden')) {
        TooltipManager._move(e);
    }
});