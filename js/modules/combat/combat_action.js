// js/modules/combat/combat_action.js
// 职责：执行具体的战斗行为与状态结算
// 适配：V3.4 怪物技能数值类型区分 (固定/百分比)

const CombatAction = {
    /** 玩家施放技能 */
    useSkill: function(ctx, bookId, skillIdx) { /* 保持原代码 */
        if (!ctx._canAct()) return;
        if (ctx.skillCDs[bookId] > 0) {
            if(window.showToast) window.showToast(`技能冷却中 (${ctx.skillCDs[bookId]})`);
            return;
        }
        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book || !book.action) return;
        const action = book.action;
        if (ctx.currentPMp < action.mpCost) {
            if(window.showToast) window.showToast("灵力不足！");
            return;
        }
        ctx.currentPMp -= action.mpCost;
        ctx.skillCDs[bookId] = (action.cd || 0) + 1;
        ctx._refreshSkillCDUI();
        const pStats = CombatCalc.getDynamicStats(ctx, 'player');
        const eStats = CombatCalc.getDynamicStats(ctx, 'enemy');
        const attacker = { ...pStats, skillMult: action.dmgMult || 1.0, skillName: action.name };

        const dmgType = action.damageType || 'phy';
        const panelVal = dmgType === 'phy' ? pStats.phy_atk : pStats.mag_atk;
        const tooltipData = {
            type: 'player_skill', name: action.name, dmgType: dmgType, panelVal: panelVal,
            fixedDmg: action.flatDmg || 0, ratio: ((action.dmgMult || 1) * 100).toFixed(0),
            cost: action.mpCost, cd: action.cd || 0
        };
        const encoded = encodeURIComponent(JSON.stringify(tooltipData));
        const skillSpan = `<span class="combat-tooltip-trigger" style="color:#ffb74d; font-weight:bold; cursor:help; border-bottom:1px dotted #ffb74d;" onmouseenter="window.showCombatTooltip(event, '${encoded}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">${action.name}</span>`;
        ctx._log(`> 你施展了 ${skillSpan}！`);
        const dmg = CombatCalc.calcDamage(ctx, attacker, eStats, true, "技能");
        ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg);
        ctx._updateUIStats();
        if (ctx.currentEHp <= 0) CombatCore.handleVictory(ctx);
    },

    /** 玩家使用消耗品 */
    useConsumable: function(ctx, slotIndex) {
        if (!ctx._canAct()) return;
        if (ctx.itemCDs[slotIndex] > 0) {
            if(window.showToast) window.showToast(`物品冷却中 (${ctx.itemCDs[slotIndex]})`);
            return;
        }

        const sid = ctx.player.consumables[slotIndex];
        if (!sid) return;
        const itemData = ctx.player.inventory.find(i => i.sid === sid);
        if (!itemData) return;

        UtilsItem.useItem(sid, 1);
        if (window.MapCamera && MapCamera.updateSidebar) MapCamera.updateSidebar();
        ctx._refreshSkillCDUI(); // 重新把刚被 innerHTML 刷掉的遮罩画回来

        if ((itemData.subType || itemData.subtype || "").toLowerCase() === 'poison') {
            this._applyPoisonToEnemy(ctx, itemData);
        } else {
            this._applyItemEffects(ctx, itemData);
        }

        const rarity = itemData.rarity || 1;
        ctx.itemCDs[slotIndex] = rarity + 2;

        ctx._refreshItemCDUI();
        ctx._syncPlayerStatus();
        if (window.saveGame) window.saveGame();
        ctx._updateUIStats();
        ctx._updateToxUI();

        if (ctx.currentEHp <= 0) {
            CombatCore.handleVictory(ctx);
        }
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

                // 准备技能日志 HTML
                const skillHtml = this._buildSkillLogHtml(skill, eStats);

                if (skill.type === 1) {
                    // --- 伤害技能 (Type 1) ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);

                    const dmgType = skill.damageType || 'mag'; // 默认法术
                    const valType = skill.dmgValType !== undefined ? skill.dmgValType : 0; // 默认固定(0)

                    // 构造攻击属性对象
                    let atkStats = {
                        ...eStats,
                        skillName: skill.id,
                        damageType: dmgType
                    };

                    // 【核心修改】伤害计算逻辑区分
                    if (valType === 1) {
                        // === 百分比模式 (1) ===
                        // 逻辑：面板 * 系数
                        // 确保面板数据存在 (回退逻辑)
                        if (dmgType === 'phy') {
                            atkStats.phy_atk = eStats.phy_atk !== undefined ? eStats.phy_atk : (eStats.atk || 0);
                        } else {
                            atkStats.mag_atk = eStats.mag_atk !== undefined ? eStats.mag_atk : (eStats.atk || 0);
                        }

                        atkStats.skillMult = skill.damage || 0; // 系数
                        atkStats.skillFlat = 0;
                    } else {
                        // === 固定数值模式 (0) ===
                        // 逻辑：直接造成 skill.damage 点伤害 (忽略面板)
                        // 我们通过直接覆写 phy_atk/mag_atk 来实现固定值效果
                        if (dmgType === 'phy') {
                            atkStats.phy_atk = skill.damage || 0;
                        } else {
                            atkStats.mag_atk = skill.damage || 0;
                        }
                        atkStats.skillMult = 1.0;
                        atkStats.skillFlat = 0;
                    }

                    const dmg = CombatCalc.calcDamage(ctx, atkStats, pStats, false, "技能");
                    ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);

                } else if (skill.type === 2) {
                    // --- Debuff (Type 2) ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    this.applyBuff(ctx, 'player', skill.debuffAttr, -skill.debuffValue, skill.debuffTimes, 'debuff', skill.id,skill.debuffValType);

                } else if (skill.type === 3) {
                    // --- Buff (Type 3) ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    this.applyBuff(ctx, 'enemy', skill.buffAttr, skill.buffValue, skill.buffTimes, 'buff', skill.id,skill.buffValType);
                }

                actionDone = true;
                break;
            }
        }

        // 普攻兜底
        if (!actionDone) {
            const dmg = CombatCalc.performAttack(ctx, ctx.enemy.name, eStats, pStats, false);
            ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);
        }
    },

    /** 构造敌人技能日志 HTML (含悬浮窗数据) */
    _buildSkillLogHtml: function(skill, eStats) {
        console.log(`skill`, skill)
        let color = "#333";
        if (skill.type === 1) color = "#d32f2f";
        else if (skill.type === 2) color = "#f57f17";
        else if (skill.type === 3) color = "#388e3c";

        // 构造 Tooltip 数据
        let tooltipData = {
            type: 'enemy_skill',
            subType: skill.type,
            name: skill.id,
            prob: (skill.rate * 100).toFixed(0)
        };

        if (skill.type === 1) {
            // --- 伤害型 (Type 1) ---
            const dmgType = skill.damageType || 'mag';
            const valType = skill.dmgValType !== undefined ? skill.dmgValType : 0;

            tooltipData.dmgType = dmgType;
            tooltipData.valType = valType;

            if (valType === 1) {
                // === 百分比模式 ===
                // 需要显示面板数值，应用回退逻辑
                let panelVal = 0;
                if (dmgType === 'phy') {
                    panelVal = eStats.phy_atk !== undefined ? eStats.phy_atk : (eStats.atk || 0);
                } else {
                    panelVal = eStats.mag_atk !== undefined ? eStats.mag_atk : (eStats.atk || 0);
                }

                tooltipData.panelVal = panelVal;
                // skill.damage 是系数 (如 1.5)
                tooltipData.ratio = (skill.damage * 100).toFixed(0);
                console.log(`tooltipData`, tooltipData)
            } else {
                // === 固定数值模式 ===
                // 不需要面板数值，直接显示固定伤害
                tooltipData.fixedDmg = skill.damage || 0;
            }

        } else if (skill.type === 2) {
            // Debuff
            tooltipData.effect = skill.debuffAttr;
            tooltipData.fixedDmg = skill.debuffValue;
            tooltipData.duration = skill.debuffTimes;
        } else if (skill.type === 3) {
            // Buff
            tooltipData.effect = skill.buffAttr;
            tooltipData.fixedDmg = skill.buffValue;
            tooltipData.duration = skill.buffTimes;
        }

        const encoded = encodeURIComponent(JSON.stringify(tooltipData));

        return `<span class="combat-tooltip-trigger" 
            style="color:${color}; font-weight:bold; cursor:help; border-bottom:1px dotted ${color};"
            onmouseenter="window.showCombatTooltip(event, '${encoded}')" 
            onmouseleave="window.hideTooltip()" 
            onmousemove="window.moveTooltip(event)">
            ${skill.id}
        </span>`;
    },


    /** 应用 Buff/Debuff
     * @param {number} valType - 0: 固定值, 1: 百分比 (例如 0.2 表示 20%)
     */
    applyBuff: function(ctx, targetKey, attr, val, turns, type, name, valType = 0) {
        if (!ctx.buffs[targetKey]) ctx.buffs[targetKey] = {};

        // 存储时记录 valType，以便后续 UI 渲染或逻辑计算使用
        ctx.buffs[targetKey][attr] = { val, turns, type, name, valType, isNew: true };

        const targetName = targetKey === 'player' ? '你' : ctx.enemy.name;

        // 格式化数值显示
        let valStr = "";
        if (valType === 1) {
            // 百分比显示：0.2 -> 20%
            valStr = (val > 0 ? "+" : "") + (val * 100).toFixed(0) + "%";
        } else {
            // 固定值显示：20 -> +20
            valStr = (val > 0 ? "+" : "") + val;
        }

        let desc = "";
        if (attr === 'hp' || attr === 'mp') {
            // 针对持续恢复/扣除的特殊描述
            const displayVal = valType === 1 ? (Math.abs(val) * 100).toFixed(0) + "%" : Math.abs(val);
            desc = (val < 0) ? `每回合损失 ${displayVal} ${ATTR_MAPPING[attr]}` : `每回合恢复 ${displayVal} ${ATTR_MAPPING[attr]}`;
        } else {
            desc = `${ATTR_MAPPING[attr]} ${valStr}`;
        }

        ctx._log(`> ${targetName} 受到 <b style="color:${type==='debuff'?'#f57f17':'#388e3c'}">[${name}]</b> 影响: ${desc} (${turns}次)`);
        ctx._updateUIStats();
    },

    /** 回合结束处理 Buff */
    processBuffs: function(ctx, target) {
        const buffList = ctx.buffs[target];
        const targetName = target === 'player' ? '你' : ctx.enemy.name;

        for (let attr in buffList) {
            const b = buffList[attr];

            if (attr === 'hp') {
                const max = target === 'player' ? ctx.player.derived.hpMax : ctx.enemy.maxHp;
                const curr = target === 'player' ? ctx.currentPHp : ctx.currentEHp;

                // 【修复】计算变动值 (如果是百分比，则基于最大生命计算)
                const change = b.valType === 1 ? Math.floor(max * b.val) : b.val;

                const newHp = Math.max(0, Math.min(max, curr + change));
                if (target === 'player') ctx.currentPHp = newHp; else ctx.currentEHp = newHp;

                const logVal = b.valType === 1 ? `${(Math.abs(b.val)*100).toFixed(0)}% (${Math.abs(change)})` : Math.abs(change);
                ctx._log(`> ${targetName} 因 [${b.name}] ${b.val>0?'恢复':'流失'} ${logVal} 生命`);
            }else if (attr === 'mp' && target === 'player') {
                const max =  ctx.player.derived.mpMax ;
                const curr = ctx.currentPMp ;
                const change= b.valType === 1 ? Math.floor(max * b.val) : b.val;

                ctx.currentPMp = Math.max(0, Math.min(max, curr + change));
                ctx._log(`> ${targetName} 因 [${b.name}] ${b.val>0?'恢复':'流失'} ${Math.abs(b.val)} 灵力`);
            }

            if (attr === 'hp' || attr === 'mp') b.turns--;
            else if (b.isNew) b.isNew = false;
            else b.turns--;

            if (b.turns <= 0) {
                ctx._log(`<span style="color:#888;">> ${targetName} 的 [${b.name}] 效果结束。</span>`);
                delete buffList[attr];
            }
        }
    },

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

    processPoisonOnPlayer: function(ctx) {
        if (ctx.player.status.toxicity > 0 && (ctx.player.status.toxicity >= 100 || ctx.player.hasDeepPoison)) {
            ctx.player.hasDeepPoison = true;
            const dmg = Math.floor(ctx.player.derived.hpMax * 0.05);
            ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);
            ctx._log(`> [你] 毒发攻心，受 <span style="color:#9c27b0;">${dmg}</span> 伤害`);
            ctx.player.status.toxicity = Math.max(0, ctx.player.status.toxicity - 20);
            if (ctx.player.status.toxicity <= 0) ctx.player.hasDeepPoison = false;
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
            ctx.player.status.toxicity = Math.max(0, ctx.player.status.toxicity + Number(eff.toxicity));
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

window.CombatAction = CombatAction;