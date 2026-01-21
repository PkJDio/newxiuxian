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

        let html = `<div class="tt_header" style="color:${color}">${item.name}</div>`;
        html += `<div class="tt_sub">${typeName || '未知'} · ${item.rarity}品</div>`;

        // --- 1. 属性效果显示 (只要不为0都显示) ---
        let statsHtml = '';
        if (item.effects) {
            const effects = item.effects;
            for (let k in effects) {
                let val = effects[k];
                if (typeof val === 'number' && val !== 0) {
                    if (k === 'max_skill_level') continue;

                    let label = ATTR_MAPPING[k] || k;
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
                    else if (k === 'mp' || k === 'mp_max') { label = '🌀 灵力值'; c = '#29b6f6'; }
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
                        const label = ATTR_MAPPING[attrKey] || attrKey;
                        const currentVal = bVals[idx] !== undefined ? bVals[idx] : bVals[0];
                        const dVal = parseInt(currentVal) > 0 ? `+${currentVal}` : currentVal;
                        statsHtml += `<div class="tt_row"><span style="color:#ba68c8;">💫 临时${label}</span><span style="color:#ba68c8; font-weight:bold;">${dVal}</span></div>`;
                    });
                }
            }
        }
        if (statsHtml) html += `<div style="margin:8px 0; padding-bottom:8px; border-bottom:1px dashed #444;">${statsHtml}</div>`;

        // --- 1.5. 【新增】装备词条显示 (仅对装备有效) ---
        // 确保 ENTRY_DB 已加载
        const equipTypes = ['weapon', 'head', 'body', 'feet', 'fishing_rod'];
        if (equipTypes.includes(item.type) && item.entries && item.entries.length > 0 && window.ENTRY_DB) {
            let entriesHtml = '';
            item.entries.forEach(entry => {
                const def = window.ENTRY_DB[entry.id];
                if (!def) return; // 数据库中找不到则跳过

                let valStr = "";
                // 如果词条有数值（如吸血15%），且描述里有 {0} 占位符，可以替换
                // 这里简单处理：如果有 val，就显示在名字后面
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
                const label = ATTR_MAPPING[rK] || rK;
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
            if (act.mpCost) costStr = `消耗 <span style="color:#2196f3;">${act.mpCost}</span> 灵力`;
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

    /* ================= 5. 战斗详细悬浮窗 (保持不变) ================= */
    showCombatDetail: function(e, encodedData) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        let data = {};
        try { data = JSON.parse(decodeURIComponent(encodedData)); } catch (err) { return; }

        let html = '';
        const sep = '<div style="border-top:1px dashed #555; margin:4px 0;"></div>';

        // --- 1.1 & 1.2 伤害计算 ---
        if (data.type === 'damage') {
            const isPlayer = data.source === 'player';
            const isPhy = data.dmgType === 'phy';
            const color = isPlayer ? '#d32f2f' : '#f57f17';

            const title = isPlayer
                ? (isPhy ? "玩家造成物理伤害" : "玩家造成法术伤害")
                : (isPhy ? "敌人造成物理伤害" : "敌人造成法术伤害");

            html += `<div class="tt_header" style="color:${color}; border-bottom:1px solid #555; padding-bottom:4px; margin-bottom:4px;">${title}</div>`;
            html += `<div class="tt_row"><span>伤害类型</span> <span style="color:#fff">${isPhy ? '物理' : '法术'}</span></div>`;
            html += `<div class="tt_row"><span>造成的初始伤害</span> <span>${Math.floor(data.finalAtkVal)}</span></div>`;

            const defLabel = isPlayer ? (isPhy ? "敌人物理防御力" : "敌人法术防御力") : (isPhy ? "玩家物理防御力" : "玩家法术防御力");
            html += `<div class="tt_row"><span>${defLabel}</span> <span>${Math.floor(data.originDef)}</span></div>`;

            if (isPlayer) {
                if (isPhy && data.atkStats.sharpness > 0) html += `<div class="tt_row" style="color:#ffb74d;"><span>玩家武器锋利度</span> <span>${data.atkStats.sharpness}</span></div>`;
                if (!isPhy && data.atkStats.penetration > 0) html += `<div class="tt_row" style="color:#ffb74d;"><span>玩家武器灵透度</span> <span>${data.atkStats.penetration}</span></div>`;
                if (data.penPct > 0) html += `<div class="tt_row" style="color:#ffb74d;"><span>${isPhy?'物理':'法术'}穿透%</span> <span>${data.penPct}%</span></div>`;
            } else {
                if (data.atkStats.basePen > 0) {
                    let penLabel = isPhy ? "敌人护甲穿透" : "敌人法术穿透";
                    html += `<div class="tt_row" style="color:#ffb74d;"><span>${penLabel}</span> <span>${data.atkStats.basePen}</span></div>`;
                }
            }

            if (data.defReductPct > 0) {
                const targetStr = isPlayer ? "敌人" : "玩家";
                const typeStr = isPhy ? "物理" : "法术";
                html += `<div class="tt_row" style="color:#ffb74d;"><span>${targetStr}${typeStr}防御衰减度%</span> <span>${data.defReductPct}%</span></div>`;
            }

            const targetName = isPlayer ? "敌人" : "玩家";
            const defTypeStr = isPhy ? "物理" : "法术";
            html += `<div class="tt_row"><span>${targetName}实际${defTypeStr}防御力</span> <span>${Math.floor(data.effectiveDef)}</span></div>`;
            html += `<div class="tt_row"><span>${targetName}实际${defTypeStr}防御减伤%</span> <span style="color:#ef5350;">${data.mitigationPct}%</span></div>`;

            html += sep;

            const attackerName = isPlayer ? "玩家" : "敌人";
            html += `<div class="tt_row"><span>${attackerName}减伤后造成${defTypeStr}伤害</span> <span>${data.dmgAfterMitigation}</span></div>`;

            const critLabel = isPlayer ? (isPhy ? "物理暴击率" : "法术暴击率") : "敌人暴击率";
            html += `<div class="tt_row"><span>${critLabel}</span> <span>${(data.critRate * 100).toFixed(1)}%</span></div>`;

            if (data.isCrit) html += `<div class="tt_row" style="color:#ffeb3b; font-weight:bold;"><span>暴击增加伤害</span> <span>x${data.critDmg || 1.5}</span></div>`;


            html += `<div class="tt_row"><span>伤害浮动</span> <span style="color:#aaa;">${data.variance}</span></div>`;

            html += sep;
            html += `<div class="tt_row" style="font-size:16px; font-weight:bold; color:${color};"><span>${attackerName}实际造成${defTypeStr}伤害</span> <span>${data.finalDamage}</span></div>`;
        }

        // --- 1.3 & 1.4 闪避判定 ---
        else if (data.type === 'evasion') {
            const isPlayer = data.source === 'player';
            const title = isPlayer ? "玩家的闪避" : "敌人的闪避";
            html += `<div class="tt_header">${title}</div>`;
            html += `<div class="tt_row"><span>${isPlayer?'玩家':'敌人'}的基础闪避率</span> <span>${data.firstDR}%</span></div>`;
            if (data.acc > 0) html += `<div class="tt_row" style="color:#ff5252;"><span>${isPlayer?'敌人':'玩家'}命中度%</span> <span>-${data.acc}%</span></div>`;
            html += sep;
            html += `<div class="tt_row" style="color:#4caf50; font-weight:bold;"><span>${isPlayer?'玩家':'敌人'}的最终闪避率</span> <span>${data.final}%</span></div>`;
        }

        // --- 1.5 玩家技能 ---
        else if (data.type === 'player_skill') {
            html += `<div class="tt_header" style="color:#2196f3;">${data.name}</div>`;
            const typeStr = data.dmgType === 'phy' ? '物理' : '法术';
            html += `<div class="tt_row"><span>伤害类型</span> <span>${typeStr}</span></div>`;
            html += `<div class="tt_row"><span>${typeStr}攻击面板</span> <span>${data.panelVal}</span></div>`;

            let dmgStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}% × ${typeStr}攻击`;

            html += `<div class="tt_row"><span>功法伤害数值</span> <span style="color:#ffb74d;">${dmgStr}</span></div>`;
            html += `<div class="tt_row"><span>消耗灵力</span> <span style="color:#42a5f5;">${data.cost}</span></div>`;
            html += `<div class="tt_row"><span>冷却时间</span> <span>${data.cd} 回合</span></div>`;
        }

        // --- 1.6 敌人技能 ---
        else if (data.type === 'enemy_skill') {
            const color = data.subType === 1 ? '#d32f2f' : (data.subType === 2 ? '#f57f17' : '#388e3c');
            html += `<div class="tt_header" style="color:${color};">${data.name}</div>`;

            if (data.subType === 1) {
                const typeStr = data.dmgType === 'phy' ? '物理' : '法术';
                html += `<div class="tt_row"><span>伤害类型</span> <span>${typeStr}</span></div>`;
                if (data.valType === 1) {
                    html += `<div class="tt_row"><span>${typeStr}攻击面板</span> <span>${data.panelVal}</span></div>`;
                    let dmgStr = `${data.ratio}% × ${typeStr}攻击`;

                    html += `<div class="tt_row"><span>功法伤害数值</span> <span style="color:#ffb74d;">${dmgStr}</span></div>`;
                } else {
                    html += `<div class="tt_row"><span>功法伤害数值</span> <span style="color:#ffb74d;">${data.fixedDmg}</span></div>`;
                }
                //计算实际伤害数值
                const realVal=Math.floor(data.panelVal*data.ratio*0.01);
                html += `<div class="tt_row"><span>功法伤害输出数值</span> <span style="color:#ffb74d;">${realVal}</span></div>`;
            } else if (data.subType === 2) {
                html += `<div class="tt_row"><span>类型</span> <span>减益(Debuff)</span></div>`;
                html += `<div class="tt_row"><span>减益字段</span> <span>${ATTR_MAPPING[data.effect]}</span></div>`;
                let valStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}%`;
                html += `<div class="tt_row"><span>数值</span> <span>${valStr}</span></div>`;
                html += `<div class="tt_row"><span>持续时间</span> <span>${data.duration} 回合</span></div>`;
            } else {
                html += `<div class="tt_row"><span>类型</span> <span>增益(Buff)</span></div>`;
                html += `<div class="tt_row"><span>增益字段</span> <span>${ATTR_MAPPING[data.effect]}</span></div>`;
                let valStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}%`;
                html += `<div class="tt_row"><span>数值</span> <span>${valStr}</span></div>`;
                html += `<div class="tt_row"><span>持续时间</span> <span>${data.duration} 回合</span></div>`;
            }
            html += `<div class="tt_row" style="color:#aaa; font-size:12px;"><span>触发概率</span> <span>${data.prob}%</span></div>`;
        }

        // --- 1.7 词条效果 ---
        else if (data.type === 'entry') {
            html += `<div class="tt_header" style="color:#ab47bc;">${data.name}</div>`;
            if (data.name === '吸血' || data.name === '魔饮') {
                html += `<div class="tt_row"><span>造成的实际物理伤害</span> <span>${data.baseVal}</span></div>`;
                html += `<div class="tt_row"><span>吸血百分比</span> <span>${data.ratio}%</span></div>`;
                html += sep;
                html += `<div class="tt_row" style="color:#4caf50; font-weight:bold;"><span>回复数值</span> <span>+${data.finalVal}</span></div>`;
            } else if (data.name === '荆棘') {
                html += `<div class="tt_row"><span>受到的实际物理伤害</span> <span>${data.baseVal}</span></div>`;
                html += `<div class="tt_row"><span>反伤百分比</span> <span>${data.ratio}%</span></div>`;
                html += sep;
                html += `<div class="tt_row" style="color:#d32f2f; font-weight:bold;"><span>反伤数值</span> <span>${data.finalVal}</span></div>`;
            }
        }

        this.el.className = 'ink_tooltip';
        this.el.style.width = '280px';
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
                const icon = mat ? (mat.icon || '📦') : '📦';

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
            if (item.effects.spirit) effectStr.push(`灵力 +${item.effects.spirit}`);
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
    }
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
document.addEventListener('mousemove', (e) => {
    TooltipManager._move(e);
}, { passive: true });