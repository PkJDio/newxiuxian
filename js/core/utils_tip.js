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
    /* ================= 2. 普通物品详情 (支持拆分属性与装备需求) ================= */
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

                    // 直接使用全局定义的 ATTR_MAPPING
                    let label = ATTR_MAPPING[k] || k;
                    let c = '#fff';

                    // 根据 key 设置特定图标与颜色
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

                    // 通用处理：正数加+号且变绿(除非已有特定c值)，负数标红
                    let finalColor = val < 0 ? '#f44336' : c;
                    statsHtml += `<div class="tt_row">
                    <span style="color:#ccc;">${label}</span>
                    <span style="color:${finalColor}; font-weight:bold;">${val > 0 ? '+' : ''}${val}</span>
                </div>`;
                }
                // 处理 Buff (保持原逻辑)
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

        // --- 2. 装备需求显示 ---
        const equipTypes = ['weapon', 'head', 'body', 'feet', 'fishing_rod'];
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

        // 支持你新增的 value 字段价格显示
        if (item.price || item.value) {
            let val = item.value || item.price;
            html += `<div class="tt_row" style="margin-top:5px; border-top:1px solid #333; padding-top:5px;">
            <span>参考价值</span>
            <span style="color:gold">💰 ${val.toLocaleString()} 灵石</span>
        </div>`;
        }

        this.el.className = 'ink_tooltip';
        this.el.style.width = '320px';
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
    },
    /* ================= 5. 战斗详细悬浮窗 (新增) ================= */
    /**
     * 显示战斗数值的详细计算过程
     * @param {Event} e 鼠标事件
     * @param {String} encodedData 经过 encodeURIComponent(JSON.stringify(data)) 处理的数据
     */
    showCombatDetail: function(e, encodedData) {
        this._init();
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        let data = {};
        try {
            data = JSON.parse(decodeURIComponent(encodedData));
        } catch (err) {
            console.error("Tooltip parse error", err);
            return;
        }

        let html = '';

        // --- 1.1 & 1.2 伤害计算 (玩家/敌人) ---
        if (data.type === 'damage') {
            const isPlayer = data.source === 'player';
            const isPhy = data.dmgType === 'phy';
            // 标题颜色：玩家攻击用红色，敌人攻击用橙色
            const color = isPlayer ? '#d32f2f' : '#f57f17';

            const title = isPlayer
                ? (isPhy ? "玩家造成物理伤害" : "玩家造成法术伤害")
                : (isPhy ? "敌人造成物理伤害" : "敌人造成法术伤害");

            html += `<div class="tt_header" style="color:${color}; border-bottom:1px solid #555; padding-bottom:4px; margin-bottom:4px;">${title}</div>`;

            // 1. 伤害类型
            html += `<div class="tt_row"><span>伤害类型</span> <span style="color:#fff">${isPhy ? '物理' : '法术'}</span></div>`;
// 【修正】2. 造成的初始伤害 (新增)
            html += `<div class="tt_row"><span>造成的初始伤害</span> <span>${Math.floor(data.finalAtkVal)}</span></div>`;
            // 2. 防御力 (目标)
            const defLabel = isPlayer ? (isPhy ? "敌人物理防御力" : "敌人法术防御力") : (isPhy ? "玩家物理防御力" : "玩家法术防御力");
            html += `<div class="tt_row"><span>${defLabel}</span> <span>${Math.floor(data.originDef)}</span></div>`;

            // 3. 穿透/锋利度 (攻击者)
            if (data.penVal > 0) {
                let penLabel = "";
                if (isPlayer) penLabel = isPhy ? "玩家武器锋利度" : "玩家武器灵透度";
                else penLabel = isPhy ? "敌人护甲穿透" : "敌人法术穿透"; // 对应 basePen

                // 玩家百分比穿透 或 敌人basePen百分比
                const penText = (data.penPct > 0) ? `${data.penVal} (+${data.penPct}%)` : `${data.penVal}`;

                html += `<div class="tt_row" style="color:#ffb74d;"><span>${penLabel}</span> <span>${penText}</span></div>`;
            } else if (data.penPct > 0) {
                // 纯百分比穿透情况
                html += `<div class="tt_row" style="color:#ffb74d;"><span>穿透比例</span> <span>${data.penPct}%</span></div>`;
            }

            // 4. 防御衰减 (计算结果)
            if (data.defReductPct > 0) {
                const label = isPlayer ? (isPhy ? "敌人物防衰减" : "敌人法防衰减") : (isPhy ? "玩家物防衰减" : "玩家法防衰减");
                html += `<div class="tt_row" style="color:#ffb74d;"><span>${label}</span> <span>${data.defReductPct}%</span></div>`;
            }

            // 5. 实际防御 & 减伤
            const targetName = isPlayer ? "敌人" : "玩家";
            const defType = isPhy ? "物理" : "法术";
            html += `<div class="tt_row"><span>${targetName}实际${defType}防御</span> <span>${data.effectiveDef}</span></div>`;
            html += `<div class="tt_row"><span>${targetName}实际${defType}减伤</span> <span style="color:#ef5350;">${data.mitigationPct}%</span></div>`;

            html += `<div class="tt_sep"></div>`;

            // 6. 减伤后伤害
            const attackerName = isPlayer ? "玩家" : "敌人";
            html += `<div class="tt_row"><span>${attackerName}减伤后伤害</span> <span>${data.dmgAfterMitigation}</span></div>`;

            // 7. 暴击
            const critLabel = isPhy ? "物理暴击率" : "法术暴击率"; // 敌人统称暴击率crit
            html += `<div class="tt_row"><span>${data.source === 'enemy' ? '敌人暴击率' : critLabel}</span> <span>${data.critRate}%</span></div>`;

            if (data.isCrit) {
                html += `<div class="tt_row" style="color:#ffeb3b; font-weight:bold;"><span>暴击增加伤害</span> <span>x${data.critDmg || 1.5}</span></div>`;
            }

            // 8. 浮动
            html += `<div class="tt_row"><span>伤害浮动</span> <span style="color:#aaa;">${data.variance}</span></div>`;

            // 9. 最终
            html += `<div class="tt_row" style="margin-top:4px; font-size:15px; color:${color}; font-weight:bold; border-top:1px solid #444; padding-top:2px;">
                <span>${attackerName}实际造成${defType}伤害</span> <span>${data.finalDamage}</span>
            </div>`;
        }

        // --- 1.3 & 1.4 闪避判定 ---
        else if (data.type === 'evasion') {
            const isPlayer = data.source === 'player'; // 这里的 source 指谁在尝试闪避
            const title = isPlayer ? "玩家闪避判定" : "敌人闪避判定";

            html += `<div class="tt_header">${title}</div>`;
            html += `<div class="tt_row"><span>${isPlayer?'玩家':'敌人'}基础闪避率</span> <span>${data.base}%</span></div>`;

            if (data.acc > 0) {
                html += `<div class="tt_row" style="color:#ff5252;"><span>${isPlayer?'敌人':'玩家'}命中度</span> <span>-${data.acc}%</span></div>`;
            }

            html += `<div class="tt_sep"></div>`;
            html += `<div class="tt_row" style="color:#4caf50; font-weight:bold;"><span>${isPlayer?'玩家':'敌人'}最终闪避率</span> <span>${data.final}%</span></div>`;
        }

        // --- 1.5 玩家技能 ---
        else if (data.type === 'player_skill') {
            html += `<div class="tt_header" style="color:#2196f3;">${data.name}</div>`;
            html += `<div class="tt_row"><span>伤害类型</span> <span>${data.dmgType === 'phy' ? '物理' : '法术'}</span></div>`;

            const panelName = data.dmgType === 'phy' ? '物理攻击' : '法术攻击';
            html += `<div class="tt_row"><span>${panelName}面板</span> <span>${data.panelVal}</span></div>`;

            // 功法伤害数值 (固定/百分比)
            let dmgStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}% × ${panelName}`;
            html += `<div class="tt_row"><span>功法伤害数值</span> <span style="color:#ffb74d;">${dmgStr}</span></div>`;

            html += `<div class="tt_row"><span>消耗灵力</span> <span style="color:#42a5f5;">${data.cost}</span></div>`;
            html += `<div class="tt_row"><span>冷却时间</span> <span>${data.cd} 回合</span></div>`;
        }

        // --- 1.6 敌人技能 (Type 1, 2, 3) ---
        else if (data.type === 'enemy_skill') {
            // 1:伤害(红), 2:Debuff(橙), 3:Buff(绿)
            const color = data.subType === 1 ? '#d32f2f' : (data.subType === 2 ? '#f57f17' : '#388e3c');
            html += `<div class="tt_header" style="color:${color};">${data.name}</div>`;

            if (data.subType === 1) { // 伤害技能
                const panelName = data.dmgType === 'phy' ? '物理攻击' : '法术攻击';
                html += `<div class="tt_row"><span>伤害类型</span> <span>${data.dmgType==='phy'?'物理':'法术'}</span></div>`;
                html += `<div class="tt_row"><span>${panelName}面板</span> <span>${data.panelVal}</span></div>`;
                let dmgStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}% × ${panelName}`;
                html += `<div class="tt_row"><span>功法伤害数值</span> <span>${dmgStr}</span></div>`;
            }
            else if (data.subType === 2) { // Debuff
                html += `<div class="tt_row"><span>类型</span> <span>减益(Debuff)</span></div>`;
                html += `<div class="tt_row"><span>减益字段</span> <span>${data.effect}</span></div>`;
                let valStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}%`;
                html += `<div class="tt_row"><span>数值</span> <span>${valStr}</span></div>`;
                html += `<div class="tt_row"><span>持续时间</span> <span>${data.duration} 回合</span></div>`;
            }
            else { // Buff
                html += `<div class="tt_row"><span>类型</span> <span>增益(Buff)</span></div>`;
                html += `<div class="tt_row"><span>增益字段</span> <span>${data.effect}</span></div>`;
                let valStr = data.fixedDmg > 0 ? `${data.fixedDmg}` : `${data.ratio}%`;
                html += `<div class="tt_row"><span>数值</span> <span>${valStr}</span></div>`;
                html += `<div class="tt_row"><span>持续时间</span> <span>${data.duration} 回合</span></div>`;
            }
            html += `<div class="tt_row" style="color:#aaa; font-size:12px;"><span>触发概率</span> <span>${data.prob}%</span></div>`;
        }

        // --- 1.7 词条效果 (吸血/荆棘) ---
        else if (data.type === 'entry') {
            html += `<div class="tt_header" style="color:#ab47bc;">${data.name}</div>`;
            if (data.name === '吸血' || data.name === '魔饮') {
                html += `<div class="tt_row"><span>造成的实际物理伤害</span> <span>${data.baseVal}</span></div>`;
                html += `<div class="tt_row"><span>吸血百分比</span> <span>${data.ratio}%</span></div>`;
                html += `<div class="tt_sep"></div>`;
                html += `<div class="tt_row" style="color:#4caf50; font-weight:bold;"><span>回复数值</span> <span>+${data.finalVal}</span></div>`;
            } else if (data.name === '荆棘') {
                html += `<div class="tt_row"><span>受到的实际物理伤害</span> <span>${data.baseVal}</span></div>`;
                html += `<div class="tt_row"><span>反伤百分比</span> <span>${data.ratio}%</span></div>`;
                html += `<div class="tt_sep"></div>`;
                html += `<div class="tt_row" style="color:#d32f2f; font-weight:bold;"><span>反伤数值</span> <span>${data.finalVal}</span></div>`;
            }
        }

        this.el.className = 'ink_tooltip';
        // 宽度稍微加宽以容纳详细信息
        this.el.style.width = '280px';
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
// 【新增】暴露商店物品悬浮窗接口
window.showShopItemTooltip = TooltipManager.showShopItem.bind(TooltipManager);
// 全局监听
document.addEventListener('mousemove', (e) => {
    TooltipManager._move(e);
}, { passive: true });