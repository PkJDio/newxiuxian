// js/modules/combat/combat_action.js
// 职责：执行具体的战斗行为与状态结算

const CombatAction = {
    /** 玩家施放技能 */
    useSkill: function(ctx, bookId, skillIdx) {
        if (!ctx._canAct()) return;
        if (ctx.skillCDs[bookId] > 0) {
            if(window.showToast) window.showToast("技能冷却中！");
            return;
        }

        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book || !book.action) return;

        const action = book.action;
        if (ctx.currentPMp < action.mpCost) {
            if(window.showToast) window.showToast("内力不足！");
            return;
        }

        ctx.currentPMp -= action.mpCost;
        ctx.skillCDs[bookId] = (action.cd || 0) + 1;
        ctx._refreshSkillCDUI();

        const pStats = CombatCalc.getDynamicStats(ctx, 'player');
        const eStats = CombatCalc.getDynamicStats(ctx, 'enemy');
        const attacker = { ...pStats, skillMult: action.dmgMult || 1.0, skillName: action.name };

        ctx._log(`> 你施展了 <b style="color:#ffb74d;">${action.name}</b>！`);
        ctx.currentEHp -= CombatCalc.calcDamage(ctx, attacker, eStats, true, "技能");
        ctx._updateUIStats();
    },

    /** 玩家使用消耗品 */
    useConsumable: function(ctx, slotIndex) {
        if (!ctx._canAct()) return;
        if (ctx.itemCDs[slotIndex] > 0) return;

        const sid = ctx.player.consumables[slotIndex];
        if (!sid) return;
        const itemData = ctx.player.inventory.find(i => i.sid === sid);
        if (!itemData) return;

        UtilsItem.useItem(sid, 1);
        if (window.MapCamera && MapCamera.updateSidebar) MapCamera.updateSidebar();

        if ((itemData.subType || itemData.subtype || "").toLowerCase() === 'poison') {
            this._applyPoisonToEnemy(ctx, itemData);
        } else {
            this._applyItemEffects(ctx, itemData);
        }

        ctx.itemCDs[slotIndex] = 4;
        ctx._refreshItemCDUI();
        ctx._syncPlayerStatus();
        if (window.saveGame) window.saveGame();
        ctx._updateUIStats();
        ctx._updateToxUI();
    },

    /** 敌人行为决策 AI */
    enemyAction: function(ctx, eStats, pStats) {
        let actionDone = false;
        if (ctx.enemy.skills && ctx.enemy.skills.length > 0) {
            for (let skill of ctx.enemy.skills) {
                let canCast = true;
                if (skill.type === 2 && ctx.buffs.player[skill.debuffAttr]) canCast = false;
                if (skill.type === 3 && ctx.buffs.enemy[skill.buffAttr]) canCast = false;
                if (!canCast || Math.random() > skill.rate) continue;

                if (skill.type === 1) {
                    ctx._log(`${ctx.enemy.name} 施展了 <b style="color:#d32f2f;">${skill.id}</b>！`);
                    let atk = { ...eStats, skillFlat: (skill.damage || 0), skillName: skill.id };
                    ctx.currentPHp -= CombatCalc.calcDamage(ctx, atk, pStats, false, "技能");
                } else if (skill.type === 2) {
                    ctx._log(`${ctx.enemy.name} 施展了 <b style="color:#f57f17;">${skill.id}</b>！`);
                    this.applyBuff(ctx, 'player', skill.debuffAttr, -skill.debuffValue, skill.debuffTimes, 'debuff', skill.id);
                } else if (skill.type === 3) {
                    ctx._log(`${ctx.enemy.name} 施展了 <b style="color:#388e3c;">${skill.id}</b>！`);
                    this.applyBuff(ctx, 'enemy', skill.buffAttr, skill.buffValue, skill.buffTimes, 'buff', skill.id);
                }
                actionDone = true; break;
            }
        }
        if (!actionDone) ctx.currentPHp -= CombatCalc.performAttack(ctx, ctx.enemy.name, eStats, pStats, false);
    },

    /** 应用 Buff/Debuff */
    applyBuff: function(ctx, targetKey, attr, val, turns, type, name) {
        ctx.buffs[targetKey][attr] = { val, turns, type, name, isNew: true };
        const attrMap = { 'atk': '攻击', 'def': '防御', 'speed': '速度', 'hp': '生命', 'mp': '内力' };
        const targetName = targetKey === 'player' ? '你' : ctx.enemy.name;
        if (attr === 'hp' || attr === 'mp') {
            const desc = (val < 0) ? `每回合损失 ${Math.abs(val)} ${attrMap[attr]}` : `每回合恢复 ${val} ${attrMap[attr]}`;
            ctx._log(`> ${targetName} 受到 <b style="color:${type==='debuff'?'#f57f17':'#388e3c'}">[${name}]</b>: ${desc} (${turns}回合)`);
        } else {
            ctx._log(`> ${targetName} 受到 <b style="color:${type==='debuff'?'#f57f17':'#388e3c'}">[${name}]</b>: ${attrMap[attr]} ${val>0?'+':''}${val} (${turns}回合)`);
        }
        ctx._updateUIStats();
    },

    /** 回合结束处理 Buff 扣减与持续伤害 */
    processBuffs: function(ctx) {
        ['player', 'enemy'].forEach(target => {
            const buffList = ctx.buffs[target];
            const targetName = target === 'player' ? '你' : ctx.enemy.name;
            for (let attr in buffList) {
                const b = buffList[attr];
                if (attr === 'hp') {
                    const max = target === 'player' ? ctx.player.derived.hpMax : ctx.enemy.maxHp;
                    const oldHp = target === 'player' ? ctx.currentPHp : ctx.currentEHp;
                    const newHp = Math.max(0, Math.min(max, oldHp + b.val));
                    if (target === 'player') ctx.currentPHp = newHp; else ctx.currentEHp = newHp;
                    ctx._log(`> ${targetName} 因 [${b.name}] ${b.val>0?'恢复':'流失'} ${Math.abs(b.val)} 生命`);
                } else if (attr === 'mp' && target === 'player') {
                    ctx.currentPMp = Math.max(0, Math.min(ctx.player.derived.mpMax, ctx.currentPMp + b.val));
                    ctx._log(`> ${targetName} 因 [${b.name}] ${b.val>0?'恢复':'流失'} ${Math.abs(b.val)} 内力`);
                }
                if (attr === 'hp' || attr === 'mp') b.turns--; else if (b.isNew) b.isNew = false; else b.turns--;
                if (b.turns <= 0) { ctx._log(`<span style="color:#888;">> ${targetName} 的 [${b.name}] 消失了。</span>`); delete buffList[attr]; }
            }
        });
    },

    /** 结算敌方中毒状态 */
    processPoisonOnEnemy: function(ctx) {
        if (ctx.enemy.toxicity > 0 && (ctx.enemy.toxicity >= 100 || ctx.enemy.hasDeepPoison)) {
            ctx.enemy.hasDeepPoison = true;
            const dmg = Math.floor((ctx.enemy.maxHp || 100) * 0.05);
            ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg);
            ctx._log(`> [敌] 毒发攻心，受 <span style="color:#9c27b0;">${dmg}</span> 伤害`);
            ctx.enemy.toxicity = Math.max(0, ctx.enemy.toxicity - 20);
            if (ctx.enemy.toxicity <= 0) ctx.enemy.hasDeepPoison = false;
            return ctx.currentEHp <= 0;
        }
        return false;
    },

    /** 结算玩家中毒状态 */
    processPoisonOnPlayer: function(ctx) {
        if (ctx.player.toxicity > 0 && (ctx.player.toxicity >= 100 || ctx.player.hasDeepPoison)) {
            ctx.player.hasDeepPoison = true;
            const dmg = Math.floor(ctx.player.derived.hpMax * 0.05);
            ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);
            ctx._log(`> [你] 毒发攻心，受 <span style="color:#9c27b0;">${dmg}</span> 伤害`);
            ctx.player.toxicity = Math.max(0, ctx.player.toxicity - 20);
            if (ctx.player.toxicity <= 0) ctx.player.hasDeepPoison = false;
            return ctx.currentPHp <= 0;
        }
        return false;
    },

    _applyItemEffects: function(ctx, item) {
        const eff = item.effects || {};
        if (eff.hp) {
            const heal = Math.max(0, Math.min(Number(eff.hp), ctx.player.derived.hpMax - ctx.currentPHp));
            ctx.currentPHp += heal;
            ctx._log(`> 使用 [${item.name}]: 恢复 <span style="color:green;">${heal}</span> HP`);
        }
        if (eff.mp) {
            const heal = Math.max(0, Math.min(Number(eff.mp), ctx.player.derived.mpMax - ctx.currentPMp));
            ctx.currentPMp += heal;
            ctx._log(`> 使用 [${item.name}]: 恢复 <span style="color:#2196f3;">${heal}</span> MP`);
        }
        if (eff.toxicity < 0) {
            ctx.player.toxicity = Math.max(0, ctx.player.toxicity + Number(eff.toxicity));
            ctx._log(`> 使用 [${item.name}]: 解毒 <span style="color:green;">${Math.abs(eff.toxicity)}</span>`);
        }
    },

    _applyPoisonToEnemy: function(ctx, item) {
        const eff = item.effects || {};
        if (eff.hp < 0) { ctx.currentEHp = Math.max(0, ctx.currentEHp - Math.abs(eff.hp)); }
        if (eff.toxicity > 0) { ctx.enemy.toxicity = Math.min(100, (ctx.enemy.toxicity||0) + Number(eff.toxicity)); }
        ctx._log(`> 投掷 [${item.name}]: 造成毒伤并加深毒性。`);
    }
};