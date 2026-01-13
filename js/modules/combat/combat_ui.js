// js/modules/combat/combat_ui.js
// 职责：所有与界面(DOM)相关的更新

const CombatUI = {
    /** 输出战斗日志 */
    log: function(ctx, msg) {
        const container = ctx.uiRefs.logContainer;
        if (!container) return;
        const line = document.createElement('div');
        line.style.marginBottom = '4px';
        line.innerHTML = msg;
        container.appendChild(line);
        if (container.children.length > 60) container.removeChild(container.firstChild);
        setTimeout(() => { line.scrollIntoView({ behavior: "smooth", block: "end" }); }, 0);
    },

    /** 更新实时血条、蓝条数值 */
    updateStats: function(ctx) {
        const ui = ctx.uiRefs; if (!ui.pHp) return;
        const pMaxHp = ctx.player.derived.hpMax; const pMaxMp = ctx.player.derived.mpMax || 100;
        ui.pHp.innerText = Math.floor(ctx.currentPHp);
        ui.pHpBar.style.width = `${Math.min(100, (ctx.currentPHp/pMaxHp)*100)}%`;
        ui.pMp.innerText = Math.floor(ctx.currentPMp);
        ui.pMpBar.style.width = `${Math.min(100, (ctx.currentPMp/pMaxMp)*100)}%`;
        ui.eHp.innerText = Math.floor(ctx.currentEHp);
        ui.eHpBar.style.width = `${Math.min(100, (ctx.currentEHp/ctx.enemy.maxHp)*100)}%`;

        this._updateAttrStyle(ctx, 'player', ctx.buffs.player);
        this._updateAttrStyle(ctx, 'enemy', ctx.buffs.enemy);
    },

    /** 刷新物品快捷栏 CD */
    refreshItemCD: function(ctx) {
        for(let i=0; i<3; i++) {
            const overlay = document.getElementById(`combat_cd_overlay_${i}`);
            const btn = document.getElementById(`combat_btn_use_${i}`);
            if (!overlay || !btn) continue;
            if (ctx.itemCDs[i] > 0) {
                overlay.style.display = "flex"; overlay.innerText = ctx.itemCDs[i]; btn.disabled = true;
            } else {
                overlay.style.display = "none"; if (!btn.classList.contains('empty-slot-btn')) btn.disabled = false;
            }
        }
    },

    /** 刷新功法技能 CD (通过 DOM 遍历精准匹配) */
    refreshSkillCD: function(ctx) {
        const containers = document.querySelectorAll('#sidebar_skills .c-slot-wrapper');
        containers.forEach((wrapper) => {
            const btn = wrapper.querySelector('button[id^="combat_btn_skill_"]');
            if (!btn) return;
            const match = btn.getAttribute('onclick').match(/'([^']+)'/);
            if (!match) return;
            const skillId = match[1]; const cd = ctx.skillCDs[skillId] || 0;
            const overlay = wrapper.querySelector('.c-cd-overlay');
            if (overlay) {
                if (cd > 0) {
                    overlay.style.cssText = "display: flex !important; align-items: center; justify-content: center; background: rgba(255,255,255,0.75); color: #333; font-weight: bold; font-size: 20px; position: absolute; top:0; left:0; width:100%; height:100%; z-index: 10;";
                    overlay.innerText = cd; btn.disabled = true;
                } else {
                    overlay.style.display = "none"; btn.disabled = false;
                }
            }
        });
    },

    /** 更新中毒进度条 */
    updateTox: function(ctx) {
        if (ctx.uiRefs.eToxBar) { ctx.uiRefs.eToxBar.style.width = `${ctx.enemy.toxicity}%`; ctx.uiRefs.eToxVal.innerText = `${ctx.enemy.toxicity}`; }
        if (ctx.uiRefs.pToxBar) { ctx.uiRefs.pToxBar.style.width = `${window.player.toxicity}%`; ctx.uiRefs.pToxVal.innerText = `${window.player.toxicity}`; }
    },

    /** 战斗结束渲染奖励或结论 */
    renderEnd: function(ctx, resultType, extraHtml = "") {
        const container = ctx.uiRefs.logContainer;
        if (container && extraHtml) {
            const div = document.createElement('div'); div.innerHTML = extraHtml; container.appendChild(div);
            setTimeout(() => { div.scrollIntoView({ behavior: "smooth", block: "end" }); }, 0);
        }
    },

    /** 更新 Buff 导致的属性变化显示 */
    _updateAttrStyle: function(ctx, target, buffs) {
        const uiMap = target === 'player' ? ctx.uiRefs.pAttr : ctx.uiRefs.eAttr;
        const attrMap = { 'atk': '攻击', 'def': '防御', 'spd': '速度' };
        ['atk', 'def', 'spd'].forEach(suffix => {
            const el = uiMap[suffix]; if (!el) return;
            const old = el.querySelector('.attr-buff-val'); if (old) old.remove();
            const buff = buffs[suffix === 'spd' ? 'speed' : suffix];
            if (buff) {
                const isDebuff = buff.type === 'debuff';
                const html = `<span class="attr-buff-val" style="color:${isDebuff?'#d32f2f':'#388e3c'}; margin-left:5px;"> ${isDebuff?"-":"+"} ${Math.abs(buff.val)} ${attrMap[suffix]}</span>`;
                el.insertAdjacentHTML('beforeend', html);
            }
        });
    }
};