// js/core/utils_tip.js
// 悬浮窗管理器 (最终完整版)
// 特性：GPU加速渲染 + 坐标自动修正 + 完整的功法/物品样式 + 装备词条显示
// console.log("加载 悬浮窗系统 (Final + Entries)");

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
    showShopItem: function(e, itemId) {
        let item = null;
        if (window.GAME_DB && window.GAME_DB.items) {
            item = window.GAME_DB.items.find(i => i.id === itemId);
        }
        if (!item) {
            console.warn(`[Tooltip] 无法找到物品数据: ${itemId}`);
            return;
        }
        this.showItem(e, null, item, 'normal');
    },

    /* ================= 2. 普通物品详情 (支持拆分属性与装备需求 + 词条显示) ================= */
    /* ================= 2. 普通物品详情 (支持拆分属性与装备需求 + 词条显示) ================= */
    showItem: function(e, sid, instance = null, mode = 'normal') {
        if (mode === 'gallery') { this.showGalleryItem(e, sid); return; }
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const item = instance || (window.player.inventory.find(i => i.sid === sid));
        if (!item) return;

        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : {};
        const color = rarityConf.color || '#ccc';
        const typeName = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING[item.type] : item.type;

        // 【修改点1】标题增加强化等级 (+X)
        let levelStr = "";
        if (item.level && item.level > 0) {
            levelStr = ` <span style="color:#ffd740; font-weight:bold; margin-left:4px;">+${item.level}</span>`;
        }

        let html = `<div class="tt_header" style="color:${color}">${item.name}${levelStr}</div>`;
        html += `<div class="tt_sub">${typeName || '未知'} · ${item.rarity}品</div>`;

        // --- 1. 属性效果显示 (只要不为0都显示) ---
        let statsHtml = '';
        if (item.effects) {
            const effects = item.effects;
            for (let k in effects) {
                let val = effects[k];
                if (typeof val === 'number' && val !== 0) {
                    if (k === 'max_skill_level') continue;

                    let label = (typeof ATTR_MAPPING !== 'undefined' ? ATTR_MAPPING[k] : k) || k;
                    let c = '#fff';

                    if (k === 'phy_atk') { label = '⚔️ 物理攻击'; c = '#ffa726'; }
                    else if (k === 'mag_atk') { label = '🔮 法术攻击'; c = '#42a5f5'; }
                    else if (k === 'phy_def') { label = '🛡️ 物理防御'; c = '#66bb6a'; }
                    else if (k === 'mag_def') { label = '✨ 法术防御'; c = '#26a69a'; }
                    else if (k === 'crit') { label = '🎯 物理暴击'; c = '#ff5252'; }
                    else if (k === 'mag_crit') { label = '🔥 法术暴击'; c = '#ff4081'; }
                    else if (k === 'sharpness') { label = '🔪 锋利度'; c = '#b0bec5'; }
                    else if (k === 'penetration') { label = '🔱 法术穿透'; c = '#81d4fa'; }
                    else if (k === 'speed') { label = '🏃 速度'; c = '#82b1ff'; }
                    else if (k === 'hp' || k === 'hp_max') { label = '❤️ 生命值'; c = '#ef5350'; }
                    else if (k === 'mp' || k === 'mp_max') { label = '🌀 法力值'; c = '#29b6f6'; }
                    else if (k === 'atk') { label = '⚔️ 攻击'; c = '#ff9800'; }
                    else if (k === 'def') { label = '🛡️ 防御'; c = '#8bc34a'; }
                    else if (k === 'toxicity') { label = '☠️ 丹毒'; c = '#9c27b0'; }
                    else if (k === 'luck') { label = '🍀 气运'; c = '#ffee58'; }

                    let finalColor = val < 0 ? '#f44336' : c;
                    statsHtml += `<div class="tt_row">
                    <span style="color:#ccc;">${label}</span>
                    <span style="color:${finalColor}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span>
                </div>`;
                }
                else if (k === 'buff' && typeof val === 'object') {
                    const bAttrs = String(val.attr).split('_');
                    const bVals = String(val.val).split('_');
                    bAttrs.forEach((attrKey, idx) => {
                        const label = (typeof ATTR_MAPPING !== 'undefined' ? ATTR_MAPPING[attrKey] : attrKey) || attrKey;
                        const currentVal = bVals[idx] !== undefined ? bVals[idx] : bVals[0];
                        const dVal = parseInt(currentVal) > 0 ? `+${currentVal}` : currentVal;
                        statsHtml += `<div class="tt_row"><span style="color:#ba68c8;">💫 临时${label}</span><span style="color:#ba68c8; font-weight:bold;">${dVal}</span></div>`;
                    });
                }
            }
        }

        // 【修改点2】追加强化属性 (Ex Stats)
        // 使用高亮色 #ffd740 (金) 以适应黑色背景
        if (item.level > 0) {
            const exColor = "#ffd740";

            // 武器强化
            if (item.exPhyAtk) statsHtml += `<div class="tt_row"><span style="color:#bbb;">🔨 强化攻击</span><span style="color:${exColor}; font-weight:bold;">+${item.exPhyAtk}</span></div>`;
            if (item.exMagAtk) statsHtml += `<div class="tt_row"><span style="color:#bbb;">⚡ 强化法攻</span><span style="color:${exColor}; font-weight:bold;">+${item.exMagAtk}</span></div>`;

            // 防具强化
            if (item.exPhyDef) statsHtml += `<div class="tt_row"><span style="color:#bbb;">🛡️ 强化防御</span><span style="color:${exColor}; font-weight:bold;">+${item.exPhyDef}</span></div>`;
            if (item.exMagDef) statsHtml += `<div class="tt_row"><span style="color:#bbb;">✨ 强化法防</span><span style="color:${exColor}; font-weight:bold;">+${item.exMagDef}</span></div>`;
        }

        if (statsHtml) html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;

        // --- 1.5. 装备词条显示 (仅对装备有效) ---
        const equipTypes = ['weapon', 'head', 'body', 'feet', 'fishing_rod'];
        if (equipTypes.includes(item.type) && item.entries && item.entries.length > 0 && window.ENTRY_DB) {
            let entriesHtml = '';
            item.entries.forEach(entry => {
                const def = window.ENTRY_DB[entry.id];
                if (!def) return;

                let valStr = "";
                if (entry.val !== undefined) {
                    valStr = `<span style="color:#ffeb3b; font-weight:bold; margin-left:4px;">${entry.val > 0 ? '+' : ''}${entry.val}${def.unit || ''}</span>`;
                }

                entriesHtml += `
                <div style="margin-bottom:4px;">
                    <div style="color:#b39ddb; font-weight:bold;">◆ ${def.name}${valStr}</div>
                    <div style="color:#9e9e9e; font-size:12px; margin-left:14px;">${def.desc || "暂无描述"}</div>
                </div>`;
            });

            if (entriesHtml) {
                html += `<div style="margin:8px 0; padding:6px; background:rgba(103, 58, 183, 0.15); border:1px solid rgba(103, 58, 183, 0.3); border-radius:4px;">
                    ${entriesHtml}
                </div>`;
            }
        }

        // --- 2. 装备需求显示 ---
        if (equipTypes.includes(item.type) && item.req) {
            let reqHtml = '<div style="margin:8px 0; font-size:14px; color:#aaa;">使用要求：</div>';
            const curStats = window.player.derived || window.player.attr || {};

            for (let rK in item.req) {
                const targetVal = item.req[rK];
                const myVal = curStats[rK] || 0;
                const isMet = myVal >= targetVal;
                const label = (typeof ATTR_MAPPING !== 'undefined' ? ATTR_MAPPING[rK] : rK) || rK;
                const dotColor = isMet ? '#4caf50' : '#f44336';
                reqHtml += `<div class="tt_row" style="padding-left:10px; font-size:15px;">
                <span><i style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${dotColor}; margin-right:6px;"></i>${label}</span>
                <span style="color:${isMet ? '#fff' : '#f44336'}">${myVal} / ${targetVal}</span>
            </div>`;
            }
            html += `<div style="margin-bottom:10px; background:rgba(0,0,0,0.2); padding:5px; border-radius:4px;">${reqHtml}</div>`;
        }

        // --- 3. 描述与其他信息 ---
        html += `<div class="tt_desc" style="font-size:16px; line-height:1.5; color:#bbb;">${item.desc || '暂无描述'}</div>`;

        if (item.type === 'book' && typeof player !== 'undefined') {
            const isLearned = (player.skills && player.skills[item.id]) || (player.learnedRecipes && player.learnedRecipes.includes(item.id));
            html += `<div class="tt_sep"></div><div class="tt_row"><span>修习状态</span><span class="${isLearned ? 'tt_pos' : 'tt_neu'}">${isLearned ? '已学会' : '未领悟'}</span></div>`;
        }

        if (item.price || item.value) {
            let val = item.value || item.price;
            html += `<div class="tt_row" style="margin-top:5px; border-top:1px solid #333; padding-top:5px;">
            <span>参考价值</span>
            <span style="color:gold">💰 ${val.toLocaleString()}  文</span>
        </div>`;
        }

        this.el.className = 'ink_tooltip';
        this.el.style.width = '320px';
        this.el.innerHTML = html;
        this._show();
    },

    /* ================= 3. 技能详情 (保持不变) ================= */
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

        if (item.action) {
            const act = item.action;
            let dmgStr = "";
            if (act.dmgMult) dmgStr = `造成 <span style="color:#ff5252; font-weight:bold;">${Math.round(act.dmgMult * 100)}%</span> 伤害`;
            let costStr = "";
            if (act.mpCost) costStr = `消耗 <span style="color:#2196f3;">${act.mpCost}</span> 法力`;
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

    /* ================= 4. 图鉴详情 (保持通用逻辑) ================= */
    showGalleryItem: function(e, sid) {
        this.showItem(e, sid, null, 'normal');
    },

    /* ================= 5. 战斗详细悬浮窗 (V5.0 增加战斗风格显示) ================= */
    showCombatDetail: function(e, encodedData) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        let data = {};
        try { data = JSON.parse(decodeURIComponent(encodedData)); } catch (err) { return; }

        let html = '';
        const sep = '<div style="border-top:1px dashed #555; margin:4px 0;"></div>';

        // --- A. 伤害计算详情 (Damage Calculation) ---
        if (data.type === 'damage') {
            const isPlayer = data.source === 'player';
            const isPhy = data.dmgType === 'phy';
            const color = isPlayer ? '#d32f2f' : '#f57f17';

            const title = isPlayer
                ? (isPhy ? "你造成的物理伤害" : "你造成的法术伤害")
                : (isPhy ? "敌人造成的物理伤害" : "敌人造成的法术伤害");

            html += `<div class="tt_header" style="color:${color}; border-bottom:1px solid #555; padding-bottom:4px; margin-bottom:4px;">${title}</div>`;

            // 1. 攻击端
            html += `<div class="tt_row"><span>初始面板伤害</span> <span>${Math.floor(data.finalAtkVal)}</span></div>`;

            // 穿透显示
            if (data.penVal > 0 || data.penPct > 0) {
                html += `<div class="tt_row" style="color:#ffb74d;"><span>护甲穿透</span> <span>${data.penVal} (${data.penPct}%)</span></div>`;
            }
            if (data.extraPenPct > 0) {
                html += `<div class="tt_row" style="color:#ffb74d;"><span>额外穿透(词条)</span> <span>${data.extraPenPct}%</span></div>`;
            }

            html += sep;

            // 2. 防御端
            const targetName = isPlayer ? "敌人" : "你";
            html += `<div class="tt_row"><span>${targetName}原始防御</span> <span>${Math.floor(data.originDef)}</span></div>`;
            html += `<div class="tt_row"><span>${targetName}有效防御</span> <span>${Math.floor(data.effectiveDef)}</span></div>`;
            html += `<div class="tt_row"><span>防御减伤率</span> <span style="color:#ef5350;">${data.mitigationPct}%</span></div>`;

            html += sep;

            // 3. 结果端
            html += `<div class="tt_row"><span>折后基础伤害</span> <span>${data.dmgAfterMitigation}</span></div>`;

            // 暴击
            if (data.isCrit) {
                html += `<div class="tt_row" style="color:#ffeb3b; font-weight:bold;"><span>暴击伤害 (Rate:${(data.critRate*100).toFixed(0)}%)</span> <span>x${data.critDmg}</span></div>`;
            } else {
                html += `<div class="tt_row" style="color:#aaa;"><span>未暴击 (率:${(data.critRate*100).toFixed(0)}%)</span> <span>-</span></div>`;
            }

            // --- 【核心新增】战斗风格克制显示 (Style Matrix) ---
            // 只有当存在 styleMult 且不为 1.0 时显示，或者你想一直显示也可以去掉 !== '1.0'
            if (data.styleMult) {
                const sm = parseFloat(data.styleMult);
                let sColor = '#aaa';
                let sIcon = '';

                // 1.1 -> 绿色 (增益), 0.8 -> 红色 (减益)
                if (sm > 1.0) { sColor = '#66bb6a'; sIcon = '▲'; }
                else if (sm < 1.0) { sColor = '#ef5350'; sIcon = '▼'; }
                else { sIcon = '='; }

                const atkStr = data.atkModule || '未知';
                const defStr = data.defArmor || '未知';

                html += `<div class="tt_row">
                    <span style="font-size:12px; color:#bbb;">风格克制 (${atkStr} vs ${defStr})</span>
                    <span style="color:${sColor}; font-weight:bold;">${sIcon} x${data.styleMult}</span>
                </div>`;
            }
            // ----------------------------------------------------

            html += `<div class="tt_row"><span>随机浮动</span> <span style="color:#aaa;">${data.variance}</span></div>`;

            html += `<div style="margin-top:5px; border-top:2px solid ${color}; padding-top:5px; font-weight:bold; font-size:16px; display:flex; justify-content:space-between;">
                <span>最终伤害</span>
                <span style="color:${color}">${data.finalDamage}</span>
            </div>`;
        }

        // --- B. 玩家技能详情 (Player Skill) ---
        else if (data.type === 'player_skill') {
            html += `<div class="tt_header" style="color:#2196f3;">${data.name}</div>`;
            html += `<div class="tt_sub" style="color:#aaa; font-size:12px; margin-bottom:5px;">${data.subType || '主动技能'}</div>`;

            const typeStr = data.dmgType === 'phy' ? '物理' : '法术';
            const color = data.dmgType === 'phy' ? '#ffa726' : '#42a5f5';

            html += `<div class="tt_row"><span>伤害类型</span> <span style="color:${color}">${typeStr}</span></div>`;
            html += `<div class="tt_row"><span>当前${typeStr}攻击</span> <span>${data.panelVal}</span></div>`;

            let dmgStr = "";
            let finalVal = 0;
            if (data.formulaType === '百分比') {
                finalVal = Math.floor(data.panelVal * data.val);
                dmgStr = `${(data.val * 100).toFixed(0)}% × 面板 ≈ <span style="color:#fff; font-weight:bold;">${finalVal}</span>`;
            } else {
                finalVal = data.val;
                dmgStr = `<span style="color:#fff; font-weight:bold;">${finalVal}</span> (固定值)`;
            }

            let label = "预估伤害";
            if (data.subType && data.subType.includes("治疗")) label = "预估治疗";
            else if (data.subType && data.subType.includes("增益")) label = "增益数值";
            else if (data.subType && data.subType.includes("减益")) label = "减益数值";

            html += `<div class="tt_row" style="margin-top:5px; background:rgba(255,255,255,0.1); padding:2px 4px; border-radius:3px;">
                <span>${label}</span> 
                <span style="color:#ffb74d;">${dmgStr}</span>
            </div>`;

            if (data.duration) {
                html += `<div class="tt_row"><span>持续时间</span> <span>${data.duration} 回合</span></div>`;
            }

            html += `<div class="tt_sep"></div>`;
            html += `<div class="tt_row"><span>消耗法力</span> <span style="color:#42a5f5;">${data.cost}</span></div>`;
            html += `<div class="tt_row"><span>冷却时间</span> <span>${data.cd} 回合</span></div>`;
        }

        // --- C. 其他 (保持不变) ---
        else if (data.type === 'evasion') {
            const isPlayer = data.source === 'player';
            html += `<div class="tt_header">闪避判定</div>`;
            html += `<div class="tt_row"><span>${isPlayer?'玩家':'敌人'}闪避率</span> <span>${data.final}%</span></div>`;
            html += `<div class="tt_row" style="color:#aaa; font-size:12px;">(基础 ${data.base}% - 命中 ${data.acc}%)</div>`;
        }
        else if (data.type === 'enemy_skill') {
            const color = data.subType === 1 ? '#d32f2f' : (data.subType === 2 ? '#f57f17' : '#388e3c');
            html += `<div class="tt_header" style="color:${color};">${data.name}</div>`;
            if (data.valType === 1) {
                html += `<div class="tt_row"><span>威力</span> <span>${data.ratio}% 面板</span></div>`;
            } else {
                html += `<div class="tt_row"><span>威力</span> <span>${data.fixedDmg} (固定)</span></div>`;
            }
            if (data.effect) html += `<div class="tt_row"><span>效果</span> <span>${ATTR_MAPPING[data.effect]||data.effect}</span></div>`;
        }
        else if (data.type === 'entry') {
            html += `<div class="tt_header" style="color:#ab47bc;">${data.name}</div>`;
            html += `<div class="tt_row"><span>触发数值</span> <span>${data.finalVal}</span></div>`;
        }

        this.el.className = 'ink_tooltip';
        this.el.style.width = '300px';
        this.el.innerHTML = html;
        this._show();
    },
    /* ================= 6. 单一词条详情 (新增) ================= */
    /**
     * 显示单个词条的详细解释
     * @param {Event} e 鼠标事件
     * @param {String} entryId 词条ID (如 'lifesteal')
     * @param {Number} val 词条数值 (如 15)
     */
    showEntry: function(e, entryId, val) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const def = window.ENTRY_DB ? window.ENTRY_DB[entryId] : null;
        if (!def) return;

        // 自动替换描述中的 {val} 占位符
        let desc = def.desc || "暂无描述";
        if (val !== undefined && val !== null) {
            // 支持 {val}% 和 {val} 两种情况的替换，这里简单全局替换
            desc = desc.replace(/\{val\}/g, `<span style="color:#fff; font-weight:bold;">${val}</span>`);
        }

        const html = `
            <div class="tt_header" style="color:#b39ddb; border-bottom:1px solid #555; padding-bottom:4px; margin-bottom:4px;">
                ${def.name} <span style="color:#ffeb3b; margin-left:5px;">${val > 0 ? '+' : ''}${val}${def.unit || ''}</span>
            </div>
            <div class="tt_desc" style="font-size:14px; color:#ccc; line-height:1.5;">${desc}</div>
        `;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '260px';
        this.el.innerHTML = html;
        this._show();
    },
    /* ================= 7. 【新增】料理配方详情 ================= */
    showRecipe: function(e, itemId) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        // 尝试查找物品 (先查数据库，再查foods全局变量)
        let item = null;
        if (window.GAME_DB && window.GAME_DB.items) {
            item = window.GAME_DB.items.find(i => i.id === itemId);
        }
        if (!item && typeof foods !== 'undefined') {
            item = foods.find(i => i.id === itemId);
        }
        if (!item) return;

        // 稀有度/品质颜色
        const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? (RARITY_CONFIG[item.rarity] || RARITY_CONFIG[item.quality]) : {};
        const color = rarityConf.color || '#fff';

        let html = `<div class="tt_header" style="color:${color}">${item.name}</div>`;
        html += `<div class="tt_sub">${item.type === 'food' ? '料理' : '物品'} · 配方详情</div>`;

        // 1. 配方展示
        if (item.recipe && item.recipe.length > 0) {
            const recipeIds = item.recipe[0]; // 默认取第一个配方
            let ingHtml = '';

            recipeIds.forEach(rid => {
                let mat = null;
                if (window.GAME_DB && window.GAME_DB.items) {
                    mat = window.GAME_DB.items.find(i => i.id === rid);
                }
                const name = mat ? mat.name : rid;
                const icon = mat ? (mat.icon || '🌾') : '🌾';

                // 食材颜色
                let matColor = '#aaa';
                if (mat && typeof RARITY_CONFIG !== 'undefined' && RARITY_CONFIG[mat.rarity]) {
                    matColor = RARITY_CONFIG[mat.rarity].color;
                }

                ingHtml += `
                    <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:4px; margin-bottom:4px;">
                        <span style="font-size:20px; margin-right:8px;">${icon}</span>
                        <span style="color:${matColor}; font-weight:bold;">${name}</span>
                    </div>
                `;
            });

            html += `
                <div style="margin:10px 0; border:1px dashed #555; padding:8px; border-radius:6px;">
                    <div style="color:#d4af37; font-size:14px; margin-bottom:6px; font-weight:bold;">🥘 所需食材</div>
                    ${ingHtml}
                </div>
            `;

            // 烹饪方式
            const methodMap = { "Boiling": "水煮", "Sauteing": "煎炒", "Roasting": "火烤", "Frying": "油炸" };
            if (item.cookType) {
                html += `<div class="tt_row"><span>🔥 烹饪方式</span> <span style="color:#ffccbc;">${methodMap[item.cookType] || item.cookType}</span></div>`;
            }
        } else {
            html += `<div class="tt_desc">暂无明确配方</div>`;
        }

        // 2. 基础效果
        if (item.effects) {
            let effectStr = [];
            if (item.effects.hunger) effectStr.push(`饱食度 +${item.effects.hunger}`);
            if (item.effects.spirit) effectStr.push(`法力 +${item.effects.spirit}`);
            if (effectStr.length > 0) {
                html += `<div style="margin-top:8px; padding-top:8px; border-top:1px solid #444; color:#9ccc65;">${effectStr.join('，')}</div>`;
            }
        }

        // 3. 描述
        html += `<div class="tt_desc" style="margin-top:8px; border-top:1px dashed #444; padding-top:8px;">${item.desc || '暂无描述'}</div>`;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '260px';
        this.el.innerHTML = html;
        this._show();
    },
    /**
     * 显示招式悬浮窗
     */
    /**
     * 显示招式悬浮窗 (修复版)
     */
    /**
     * 显示招式悬浮窗 (优化宽度与对比度版)
     */
    /**
     * 显示招式悬浮窗 (v3.8 强制宽度版)
     */
    showZhaoshi: function(e, skillId) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const move = (player.zhaoshi_list[skillId] || [])
        if (!move) return;

        const rarityColor = (window.RARITY_CONFIG && RARITY_CONFIG[move.rarity]) ? RARITY_CONFIG[move.rarity].color : '#333';
        const priceHtml = window.UtilsSpiritPrice ? UtilsSpiritPrice.format(move.price) : `${move.price} 灵气`;

        // 内部容器宽度设置为 320px
        const content = `
            <div style="width:320px; font-family:'KaiTi', serif; padding:5px; color:#fff;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #555; padding-bottom:8px; margin-bottom:10px;">
                    <span style="font-size:22px; font-weight:bold; color:${rarityColor}">${move.name}</span>
                    <span style="font-size:14px; color:#ccc; background:rgba(255,255,255,0.1); padding:2px 8px; border-radius:4px;">${move.subType}</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:16px;">
                    <span style="color:#bbb;">消耗: <span style="color:#42a5f5; font-weight:bold;">${move.mpCost} 真气</span></span>
                    <span style="color:#bbb;">冷却: <span style="color:#ffa726; font-weight:bold;">${move.cd} 回合</span></span>
                </div>

                <div style="margin-bottom:15px; line-height:1.6; color:#ddd; font-size:15px; background:rgba(255,255,255,0.05); padding:12px; border-radius:6px; border-left:4px solid ${rarityColor};">
                    ${move.desc}
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:14px; color:#aaa; border-top:1px dashed #444; padding-top:12px;">
                    <div>伤害类型: <span style="color:#eee">${move.damageType}</span></div>
                    <div>基础数值: <span style="color:#ff5252; font-weight:bold;">${move.formulaType === '百分比' ? (move.dmgVal * 100).toFixed(0) + '%' : move.dmgVal}</span></div>
                    ${move.duration ? `<div>持续时间: <span style="color:#eee">${move.duration}回合</span></div>` : ''}
                    ${move.targetAttribute ? `<div>作用属性: <span style="color:#66bb6a">${move.targetAttribute}</span></div>` : ''}
                </div>

                <div style="margin-top:15px; text-align:right; font-size:13px; color:#888;">
                    估值: ${priceHtml}
                </div>
            </div>
        `;

        this.el.className = 'ink_tooltip';

        // --- 修复核心：使用 setProperty 配合 important 确保宽度生效 ---
        this.el.style.setProperty('width', '350px', 'important');
        this.el.style.setProperty('max-width', '400px', 'important');
        console.log("content",content)
        this.el.innerHTML = content;
        this._show();
    },
    // -------------------------------------------------------
    // 【新增】商店招式悬浮窗 (深色背景优化版)
    // -------------------------------------------------------
    showShopZhaoShi: function(e, skillId) {
        if (!skillId) return;
        this._init();

        // 1. 从全局招式库查找
        let skill = null;
        if (window.all_zhaoshi) {
            skill = window.all_zhaoshi.find(s => s.id === skillId);
        }

        if (!skill) return;

        // 2. 渲染逻辑 (配色优化：适配黑色背景)
        const rarityColor = (window.RARITY_CONFIG && window.RARITY_CONFIG[skill.rarity]) ? window.RARITY_CONFIG[skill.rarity].color : '#e0e0e0';
        const typeName = skill.subType || "未知";

        let html = `
            <div style="padding:5px;">
                <div style="font-size:16px; font-weight:bold; color:${rarityColor}; margin-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:5px;">
                    ${skill.name} <span style="font-size:12px; color:#aaa; font-weight:normal; float:right;">R${skill.rarity}</span>
                </div>
                
                <div style="font-size:13px; color:#ccc; margin-bottom:8px; line-height:1.4;">${skill.desc || "暂无描述"}</div>
                
                <div style="background:rgba(255,255,255,0.08); padding:6px; border-radius:4px; margin-bottom:5px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
                        <span style="color:#999;">类型</span> <span style="color:#fff;">${typeName}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:3px;">
                        <span style="color:#999;">消耗</span> <span style="color:#64b5f6;">${skill.mpCost||0} 内力</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:12px;">
                        <span style="color:#999;">冷却</span> <span style="color:#ef5350;">${skill.cd||0} 回合</span>
                    </div>
                </div>
        `;

        // 伤害预览
        if (skill.dmgVal > 0) {
            const dmgType = skill.damageType === 'phy' ? '物理' : '法术';
            const formulaStr = skill.formulaType === '百分比' ? `${(skill.dmgVal*100).toFixed(0)}%` : `${skill.dmgVal}`;
            // 浅橙色
            html += `
                <div style="font-size:12px; color:#ffb74d; margin-top:5px; border-top:1px dashed rgba(255,255,255,0.2); padding-top:4px;">
                    ⚡ 效果: ${formulaStr} ${dmgType}伤害
                </div>
            `;
        }

        // 持续时间
        if (skill.duration) {
            html += `
                <div style="font-size:12px; color:#bbb; margin-top:2px;">
                    ⏳ 持续: ${skill.duration} 回合
                </div>
            `;
        }

        html += `</div>`;

        // 样式应用
        this.el.className = 'ink_tooltip';
        this.el.style.width = '240px';
        // 确保背景是深色 (如果CSS没写死的话，这里强制一下更稳)
        this.el.style.background = 'rgba(0, 0, 0, 0.9)';
        this.el.style.border = '1px solid #444';
        this.el.style.color = '#e0e0e0';

        this.el.innerHTML = html;
        this._show();
        this._move(e);
    },
    /* ================= 8. 【新增】战斗Buff详情悬浮窗 ================= */
    showBuffDetail: function(e, encodedData) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        let data = {};
        try { data = JSON.parse(decodeURIComponent(encodedData)); } catch (err) { return; }

        const isDebuff = data.type === 'debuff';
        const color = isDebuff ? '#ef5350' : '#66bb6a';
        const typeText = isDebuff ? '减益/伤害 (Debuff)' : '增益/治疗 (Buff)';

        let html = `<div class="tt_header" style="color:${color}; border-bottom:1px solid #555; padding-bottom:4px; margin-bottom:4px;">${data.name}</div>`;
        html += `<div class="tt_sub" style="color:#aaa; font-size:12px;">${typeText}</div>`;

        // 效果描述
        let valStr = "";
        const sign = data.val > 0 ? "+" : "";
        if (data.valType === 1) {
            valStr = `${sign}${(data.val * 100).toFixed(0)}%`;
        } else {
            valStr = `${sign}${data.val}`;
        }

        let effectDesc = "";
        const attrMap = (typeof ATTR_MAPPING !== 'undefined') ? ATTR_MAPPING : {};
        const attrName = attrMap[data.attr] || data.attr;

        if (data.attr === 'hp') {
            effectDesc = `每回合 ${data.val < 0 ? '流失' : '恢复'} <span style="color:#fff; font-weight:bold;">${Math.abs(data.val)}</span> 生命`;
        } else if (data.attr === 'mp') {
            effectDesc = `每回合 ${data.val < 0 ? '流失' : '恢复'} <span style="color:#fff; font-weight:bold;">${Math.abs(data.val)}</span> 法力`;
        } else {
            effectDesc = `${attrName} <span style="color:${color}; font-weight:bold;">${valStr}</span>`;
        }

        html += `<div class="tt_row" style="margin-top:8px;"><span>效果</span> <span>${effectDesc}</span></div>`;
        html += `<div class="tt_row"><span>剩余持续</span> <span style="color:#fff;">${data.turns} 回合</span></div>`;

        if (data.isNew) {
            html += `<div class="tt_row" style="color:#ffb74d; font-size:12px; margin-top:4px;">(本回合新施加)</div>`;
        }

        this.el.className = 'ink_tooltip';
        this.el.style.width = '240px';
        this.el.innerHTML = html;
        this._show();
    },
    /* ================= 9. 【新增】凡尘道途选项悬浮窗 ================= */
    showMortalPath: function(e, name, desc, rewardText, isSelected) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        const color = isSelected ? '#ffd700' : '#aaa';
        const stateText = isSelected ? '【已选道途】' : '【未选分支】';
        const bgStyle = isSelected ? 'background:rgba(255, 215, 0, 0.1); border:1px solid #ffd700;' : 'background:rgba(0,0,0,0.3); border:1px dashed #666;';

        let html = `
            <div class="tt_header" style="color:${color}; border-bottom:1px solid ${isSelected?'#ffd700':'#555'}; padding-bottom:4px; margin-bottom:8px;">
                ${name} <span style="font-size:12px; margin-left:8px; color:${isSelected?'#ffb74d':'#777'}">${stateText}</span>
            </div>
            
            <div style="font-size:14px; color:#ccc; margin-bottom:10px; line-height:1.5;">${desc}</div>
            
            <div style="padding:8px; border-radius:4px; ${bgStyle}">
                <div style="font-size:12px; color:#bbb; margin-bottom:4px;">道途奖励:</div>
                <div style="color:${isSelected?'#4caf50':'#888'}; font-weight:bold;">${rewardText}</div>
            </div>
        `;

        this.el.className = 'ink_tooltip';
        this.el.style.width = '280px';
        this.el.innerHTML = html;
        this._show();
    },
};

window.TooltipManager = TooltipManager;
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showGalleryTooltip = TooltipManager.showGalleryItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);
window.showCombatTooltip = TooltipManager.showCombatDetail.bind(TooltipManager);
window.showShopItemTooltip = TooltipManager.showShopItem.bind(TooltipManager);
// 【新增】暴露词条悬浮窗接口
window.showEntryTooltip = TooltipManager.showEntry.bind(TooltipManager);
// 【新增】料理配方悬浮窗
window.showRecipeTooltip = TooltipManager.showRecipe.bind(TooltipManager);

window.showMortalPathTooltip = TooltipManager.showMortalPath.bind(TooltipManager);

window.showZhaoshiTooltip = TooltipManager.showZhaoshi.bind(TooltipManager);
window.showBuffTooltip = TooltipManager.showBuffDetail.bind(TooltipManager);
window.showShopZhaoShi = TooltipManager.showShopZhaoShi.bind(TooltipManager);
document.addEventListener('mousemove', (e) => {
    TooltipManager._move(e);
}, { passive: true });