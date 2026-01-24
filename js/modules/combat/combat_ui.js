// js/modules/combat/combat_ui.js
// 职责：战斗界面的实时更新、日志输出、动画效果
// 修复：适配属性拆分后的 Buff 显示 + 动态刷新行动时间文字 + 【新增】Buff图标渲染

const CombatUI = {
    // ... log 函数保持不变 ...
    log: function(ctx, msg) {
        const container = ctx.uiRefs.logContainer;
        if (!container) return;
        const line = document.createElement('div');
        line.innerHTML = msg;
        container.appendChild(line);
        if (container.children.length > 60) {
            container.removeChild(container.firstChild);
        }
        setTimeout(() => {
            line.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 0);
    },

    /** 更新 UI 上的数值 (血量、蓝量、属性、Buff) */
    updateStats: function(ctx) {
        const ui = ctx.uiRefs;
        if (!ui.pHp) return;

        // 1. 更新血蓝条 (保持不变)
        const pMaxHp = ctx.player.derived.hpMax;
        const pMaxMp = ctx.player.derived.mpMax || 100;
        ui.pHp.innerText = Math.floor(ctx.currentPHp);
        ui.pHpBar.style.width = `${Math.min(100, (ctx.currentPHp / pMaxHp) * 100)}%`;
        ui.pMp.innerText = Math.floor(ctx.currentPMp);
        ui.pMpBar.style.width = `${Math.min(100, (ctx.currentPMp / pMaxMp) * 100)}%`;
        ui.eHp.innerText = Math.floor(ctx.currentEHp);
        ui.eHpBar.style.width = `${Math.min(100, (ctx.currentEHp / ctx.enemy.maxHp) * 100)}%`;

        // 2. 更新属性红绿字 (保持不变)
        this._updateAttrStyle(ctx, 'player', ctx.buffs.player);
        this._updateAttrStyle(ctx, 'enemy', ctx.buffs.enemy);

        // 3. 动态更新“速度时间”文字 (保持不变)
        this._updateActionTimeText(ctx, 'player');
        this._updateActionTimeText(ctx, 'enemy');

        // 4. 【新增】更新 Buff 可视化小方块
        this._updateBuffIcons(ctx);
    },

    // ... updateGauges, refreshItemCD, refreshSkillCD, updateTox, renderEnd 保持不变 ...
    updateGauges: function(ctx, pPct, ePct) {
        const ui = ctx.uiRefs;
        if (ui.pApBar) ui.pApBar.style.width = `${pPct}%`;
        if (ui.eApBar) ui.eApBar.style.width = `${ePct}%`;
    },
    refreshItemCD: function(ctx) {
        for(let i=0; i<3; i++) {
            const btn = document.getElementById(`danyao_combat_btn_use_${i}`);
            const overlay = document.getElementById(`danyao_combat_cd_overlay_${i}`);
            if (!overlay || !btn) continue;
            if (ctx.itemCDs[i] > 0) {
                overlay.style.display = "flex";
                overlay.innerText = ctx.itemCDs[i];
                btn.disabled = true;
            } else {
                overlay.style.display = "none";
                if (!btn.disabled && btn.innerHTML.includes('空')) {} else { btn.disabled = false; }
            }
        }
    },
    refreshSkillCD: function(ctx) {
        const containers = document.querySelectorAll('#sidebar_skills .gongfa_slot_wrapper');
        containers.forEach((wrapper) => {
            const btn = wrapper.querySelector('button[id^="combat_btn_skill_"]');
            if (!btn) return;
            const match = btn.getAttribute('onclick').match(/'([^']+)'/);
            if (!match) return;
            const skillId = match[1];
            const cd = ctx.skillCDs[skillId] || 0;
            const overlay = wrapper.querySelector('.gongfa_cd_overlay');
            if (overlay) {
                if (cd > 0) {
                    overlay.style.display = "flex";
                    overlay.innerText = cd;
                    btn.disabled = true;
                } else {
                    overlay.style.display = "none";
                    btn.disabled = false;
                }
            }
        });
    },
    updateTox: function(ctx) {
        if (ctx.uiRefs.eToxBar) {
            ctx.uiRefs.eToxBar.style.width = `${ctx.enemy.toxicity}%`;
            ctx.uiRefs.eToxVal.innerText = `${ctx.enemy.toxicity}`;
        }
        if (ctx.uiRefs.pToxBar) {
            ctx.uiRefs.pToxBar.style.width = `${window.player.status.toxicity}%`;
            ctx.uiRefs.pToxVal.innerText = `${window.player.status.toxicity}`;
        }
    },
    renderEnd: function(ctx, resultType, extraHtml = "") {
        const container = ctx.uiRefs.logContainer;
        if (container && extraHtml) {
            const div = document.createElement('div');
            div.innerHTML = extraHtml;
            container.appendChild(div);
            setTimeout(() => { div.scrollIntoView({ behavior: "smooth", block: "end" }); }, 0);
        }
    },

    // ================= 内部辅助方法 =================

    /** 【新增】渲染 Buff 列表图标 */
    _updateBuffIcons: function(ctx) {
        // 渲染玩家 Buffs
        this._renderBuffList(ctx.buffs.player, 'combat_p_buffs');
        // 渲染敌人 Buffs
        this._renderBuffList(ctx.buffs.enemy, 'combat_e_buffs');
    },

    /** 具体的渲染逻辑 */
    _renderBuffList: function(buffMap, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';

        // 遍历所有属性 (hp, mp, atk, def...)
        for (let attr in buffMap) {
            const entry = buffMap[attr];

            if (Array.isArray(entry)) {
                // 1. 数组类型 (DoT/HoT, 多重效果)
                entry.forEach(buff => {
                    html += this._createBuffTagHtml(buff, attr);
                });
            } else if (entry && entry.turns > 0) {
                // 2. 对象类型 (普通属性加成)
                html += this._createBuffTagHtml(entry, attr);
            }
        }

        container.innerHTML = html;
    },

    /** 生成单个 Buff 标签 HTML */
    _createBuffTagHtml: function(buff, attr) {
        const typeClass = buff.type === 'debuff' ? 'debuff' : 'buff';

        // 构造悬浮窗数据
        const tooltipData = {
            name: buff.name,
            type: buff.type,
            attr: attr,
            val: buff.val,
            valType: buff.valType,
            turns: buff.turns,
            isNew: buff.isNew
        };
        const encoded = encodeURIComponent(JSON.stringify(tooltipData));

        return `
            <div class="buff-tag ${typeClass}" 
                 onmouseenter="window.showBuffTooltip(event, '${encoded}')" 
                 onmouseleave="window.hideTooltip()"
                 onmousemove="window.moveTooltip(event)">
                ${buff.name} (${buff.turns})
            </div>
        `;
    },

    // ... _updateAttrStyle, _updateActionTimeText 保持不变 ...
    /** 核心修改：更新属性面板上的红绿字 (支持数组汇总) */
    _updateAttrStyle: function(ctx, target, buffs) {
        const prefix = target === 'player' ? 'p_attr_' : 'e_attr_';

        // 1. 清理旧的加成显示
        const allBoxes = document.querySelectorAll(`[id^="${prefix}"]`);
        allBoxes.forEach(box => {
            const buffSpan = box.querySelector('.attr-buff-val');
            if (buffSpan) buffSpan.remove();
        });

        if (!buffs) return;

        // 映射关系：Buff属性 -> UI元素ID后缀列表
        const map = {
            'atk': ['phy_atk', 'mag_atk'],
            'def': ['phy_def', 'mag_def'],
            'phy_atk': ['phy_atk'], 'mag_atk': ['mag_atk'],
            'phy_def': ['phy_def'], 'mag_def': ['mag_def'],
            'speed': ['spd'], 'spd': ['spd']
        };

        for (let attr in buffs) {
            const list = buffs[attr];
            // 必须是数组且非空
            if (!Array.isArray(list) || list.length === 0) continue;
            // 跳过 HP/MP (它们显示在 Buff 图标栏，不显示在属性面板旁)
            if (attr === 'hp' || attr === 'mp') continue;

            const targetSuffixes = map[attr];
            if (targetSuffixes) {
                // 汇总该属性的所有 Buff 值
                let totalFlat = 0;
                let totalPct = 0;

                list.forEach(b => {
                    if (b.valType === 1) totalPct += b.val;
                    else totalFlat += b.val;
                });

                // 构造显示字符串
                // 策略：如果有百分比，显示百分比；如果有固定值，追加固定值。
                // 例如: "+10%", "+50", "+50 +10%"
                let displayHtml = "";
                let color = '#388e3c'; // 默认绿

                // 简单的颜色判断：只要有减益，或者总值降低，就变红
                if (totalFlat < 0 || totalPct < 0) color = '#d32f2f';

                if (totalFlat !== 0) {
                    const sign = totalFlat > 0 ? "+" : "";
                    displayHtml += `${sign}${totalFlat} `;
                }
                if (totalPct !== 0) {
                    const sign = totalPct > 0 ? "+" : "";
                    displayHtml += `${sign}${(totalPct * 100).toFixed(0)}%`;
                }

                if (displayHtml === "") continue;

                targetSuffixes.forEach(suffix => {
                    const elId = prefix + suffix;
                    const el = document.getElementById(elId);
                    if (el) {
                        const html = `<span class="attr-buff-val" style="color:${color}; margin-left:4px; font-size:12px; font-weight:bold;">${displayHtml}</span>`;
                        el.insertAdjacentHTML('beforeend', html);
                    }
                });
            }
        }
    },

    _updateActionTimeText: function(ctx, target) {
        const stats = CombatCalc.getDynamicStats(ctx, target);
        const speed = stats.speed;
        const config = (window.CombatCore && window.CombatCore.CONFIG) ? window.CombatCore.CONFIG : { BASE_TIME: 3.0, SPD_FACTOR: 0.01 };
        const factor = config.SPD_FACTOR;
        const baseTime = config.BASE_TIME;
        const multiplier = 1 + (speed * factor);
        const safeMult = Math.max(0.1, multiplier);
        const actTime = (baseTime / safeMult).toFixed(1);
        const prefix = target === 'player' ? 'p_attr_' : 'e_attr_';
        const box = document.getElementById(prefix + 'spd');
        if (box) {
            const extra = box.querySelector('.attr-extra');
            if (extra) {
                extra.innerText = `(${actTime}秒)`;
                if (multiplier < 1.0) extra.style.color = '#d32f2f';
                else if (multiplier > 1.0) extra.style.color = '#388e3c';
                else extra.style.color = '#aaa';
            }
        }
    }
};

window.CombatUI = CombatUI;