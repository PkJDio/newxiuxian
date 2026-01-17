// js/modules/combat/combat_ui.js
// 职责：界面渲染、行动条动画、输入锁定控制
// 状态：调试模式 (Debug Mode)

const CombatUI = {
    /** 输出战斗日志 */
    log: function(ctx, msg) {
        const container = ctx.uiRefs.logContainer;
        if (!container) {
            console.warn("[CombatUI] Log container missing!");
            return;
        }
        const line = document.createElement('div');
        line.style.marginBottom = '4px';
        line.innerHTML = msg;
        container.appendChild(line);
        if (container.children.length > 60) container.removeChild(container.firstChild);
        setTimeout(() => { line.scrollIntoView({ behavior: "smooth", block: "end" }); }, 0);
    },

    /** 更新行动条 (Action Bar) */
    updateGauges: function(ctx, pPct, ePct) {
        const ui = ctx.uiRefs;

        // 增加判空，防止报错
        if (ui.pApBar) {
            ui.pApBar.style.width = `${pPct}%`;
            if (pPct >= 100) ui.pApBar.style.filter = "brightness(1.5)";
            else ui.pApBar.style.filter = "none";
        } else {
            // console.warn("[CombatUI] Player AP Bar element missing"); // 过于频繁，暂注释
        }

        if (ui.eApBar) {
            ui.eApBar.style.width = `${ePct}%`;
            if (ePct >= 100) ui.eApBar.style.filter = "brightness(1.5)";
            else ui.eApBar.style.filter = "none";
        }
    },

    /** 控制输入锁定 */
    toggleInput: function(enable) {
        console.log(`[CombatUI] Toggle Input: ${enable ? 'UNLOCK' : 'LOCK'}`);

        const itemBtns = document.querySelectorAll('#sidebar_consumables .c-btn');
        itemBtns.forEach(btn => {
            if (btn.classList.contains('empty-slot-btn')) return;
            btn.disabled = !enable;
            btn.style.opacity = enable ? '1' : '0.6';
        });

        const skillBtns = document.querySelectorAll('#sidebar_skills .c-btn');
        skillBtns.forEach(btn => {
            btn.disabled = !enable;
            btn.style.opacity = enable ? '1' : '0.6';
            btn.style.cursor = enable ? 'pointer' : 'not-allowed';
        });

        const pCard = document.querySelector('.fighter-card.player');
        if (pCard) {
            pCard.style.boxShadow = enable ? "0 0 15px rgba(255, 215, 0, 0.4)" : "none";
        }
    },

    /** 更新实时血条、蓝条数值 */
    updateStats: function(ctx) {
        // console.log("[CombatUI] Updating Stats..."); // 日志太多可注释
        const ui = ctx.uiRefs;

        // 玩家部分
        if (ui.pHp && ui.pHpBar) {
            const pMaxHp = ctx.player.derived.hpMax || 100;
            ui.pHp.innerText = Math.floor(ctx.currentPHp);
            ui.pHpBar.style.width = `${Math.min(100, Math.max(0, (ctx.currentPHp / pMaxHp) * 100))}%`;
        }

        if (ui.pMp && ui.pMpBar) {
            const pMaxMp = ctx.player.derived.mpMax || 100;
            ui.pMp.innerText = Math.floor(ctx.currentPMp);
            ui.pMpBar.style.width = `${Math.min(100, Math.max(0, (ctx.currentPMp / pMaxMp) * 100))}%`;
        }

        // 敌人部分
        if (ui.eHp && ui.eHpBar) {
            const eMaxHp = ctx.enemy.maxHp || 100;
            ui.eHp.innerText = Math.floor(ctx.currentEHp);
            ui.eHpBar.style.width = `${Math.min(100, Math.max(0, (ctx.currentEHp / eMaxHp) * 100))}%`;
        }

        this._updateAttrStyle(ctx, 'player', ctx.buffs.player);
        this._updateAttrStyle(ctx, 'enemy', ctx.buffs.enemy);
    },

    /** 更新中毒进度条 (这是你报错的地方，已修复) */
    updateTox: function(ctx) {
        // 安全获取数值，防止 undefined
        const eTox = ctx.enemy.toxicity || 0;
        const pTox = (ctx.player && ctx.player.toxicity) ? ctx.player.toxicity : 0;

        console.log(`[CombatUI] Updating Tox. Enemy: ${eTox}, Player: ${pTox}`);

        // 判空后再操作 DOM
        if (ctx.uiRefs.eToxBar && ctx.uiRefs.eToxVal) {
            ctx.uiRefs.eToxBar.style.width = `${Math.min(100, eTox)}%`;
            ctx.uiRefs.eToxVal.innerText = `${eTox}`;
        } else {
            console.warn("[CombatUI] Enemy Tox UI elements not found!");
        }

        if (ctx.uiRefs.pToxBar && ctx.uiRefs.pToxVal) {
            ctx.uiRefs.pToxBar.style.width = `${Math.min(100, pTox)}%`;
            ctx.uiRefs.pToxVal.innerText = `${pTox}`;
        } else {
            console.warn("[CombatUI] Player Tox UI elements not found!");
        }
    },

    /** 刷新物品快捷栏 CD (适配 danyao_cd_overlay) */
    refreshItemCD: function(ctx) {
        for(let i=0; i<3; i++) {
            const btn = document.getElementById(`combat_btn_use_${i}`);
            // 通过ID直接查找，或者通过类名
            const overlay = document.getElementById(`combat_cd_overlay_${i}`);

            if (!overlay || !btn) continue;

            if (ctx.itemCDs[i] > 0) {
                overlay.style.display = "flex";
                overlay.innerText = ctx.itemCDs[i];
                btn.disabled = true;
            } else {
                overlay.style.display = "none";
                if (!btn.classList.contains('empty-slot-btn')) btn.disabled = false;
            }
        }
    },

    /** 刷新功法技能 CD (适配 gongfa_cd_overlay) */
    refreshSkillCD: function(ctx) {
        const containers = document.querySelectorAll('#sidebar_skills .gongfa_slot_wrapper');
        containers.forEach((wrapper) => {
            const btn = wrapper.querySelector('button[id^="combat_btn_skill_"]');
            if (!btn) return;

            const match = btn.getAttribute('onclick').match(/'([^']+)'/);
            if (!match) return;
            const skillId = match[1];
            const cd = ctx.skillCDs[skillId] || 0;

            // 【核心修复】查找 gongfa_cd_overlay
            const overlay = wrapper.querySelector('.gongfa_cd_overlay');

            if (overlay) {
                if (cd > 0) {
                    overlay.style.cssText = "display: flex !important; align-items: center; justify-content: center; background: rgba(255,255,255,0.75); color: #333; font-weight: bold; font-size: 20px; position: absolute; top:0; left:0; width:100%; height:100%; z-index: 10;";
                    overlay.innerText = cd;
                    btn.disabled = true;
                } else {
                    overlay.style.display = "none";
                    btn.disabled = false;
                }
            }
        });
    },

    /** 战斗结束渲染 */
    renderEnd: function(ctx, resultType, extraHtml = "") {
        console.log(`[CombatUI] Render End: ${resultType}`);
        const container = ctx.uiRefs.logContainer;
        if (container && extraHtml) {
            const div = document.createElement('div');
            div.innerHTML = extraHtml;
            container.appendChild(div);
            setTimeout(() => { div.scrollIntoView({ behavior: "smooth", block: "end" }); }, 0);
        }
        this.updateGauges(ctx, 0, 0);
        this.toggleInput(false);
    },

    /** 更新 Buff 显示 */
    _updateAttrStyle: function(ctx, target, buffs) {
        const uiMap = target === 'player' ? ctx.uiRefs.pAttr : ctx.uiRefs.eAttr;
        if (!uiMap) return; // 安全检查

        const attrMap = { 'atk': '攻击', 'def': '防御', 'speed': '速度' };

        ['atk', 'def', 'spd'].forEach(suffix => {
            const el = uiMap[suffix];
            if (!el) return;

            const old = el.querySelector('.attr-buff-val');
            if (old) old.remove();

            const key = suffix === 'spd' ? 'speed' : suffix;
            const buff = buffs[key];

            if (buff) {
                const isDebuff = buff.type === 'debuff';
                const color = isDebuff ? '#d32f2f' : '#388e3c';
                const sign = isDebuff ? "-" : "+";
                const html = `<span class="attr-buff-val" style="color:${color}; margin-left:4px; font-size:12px;"> ${sign}${Math.abs(buff.val)}</span>`;
                el.insertAdjacentHTML('beforeend', html);
            }
        });
    }
};

window.CombatUI = CombatUI;