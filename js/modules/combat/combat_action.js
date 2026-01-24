const CombatAction = {
    /** 玩家施放技能 (适配新版招式数据 & DoT快照) */
    useSkill: function(ctx, skillId) {
        if (!ctx._canAct()) return;

        // 1. 获取技能数据 (兼容存档中成长的技能 或 全局原始数据)
        let skill = null;
        if (ctx.player && ctx.player.zhaoshi_list && ctx.player.zhaoshi_list[skillId]) {
            skill = ctx.player.zhaoshi_list[skillId];
        } else if (window.all_zhaoshi) {
            skill = window.all_zhaoshi.find(s => s.id === skillId);
        }

        if (!skill) {
            console.warn("未找到招式数据:", skillId);
            return;
        }

        // 2. 冷却与消耗检查
        if (ctx.skillCDs[skillId] > 0) {
            if(window.showToast) window.showToast(`招式回气中 (${ctx.skillCDs[skillId]})`);
            return;
        }
        if (ctx.currentPMp < skill.mpCost) {
            if(window.showToast) window.showToast("内力不足！");
            return;
        }

        // 3. 执行消耗与CD
        ctx.currentPMp -= skill.mpCost;
        ctx.skillCDs[skillId] = (skill.cd || 0) + 1;
        ctx._refreshSkillCDUI();

        // 4. 准备属性映射 (中文 -> 英文)
        const TYPE_MAP = { "物理": "phy", "法术": "mag" };
        const ATTR_MAP = {
            "速度": "speed", "物理防御": "phy_def", "法术防御": "mag_def",
            "物理攻击": "phy_atk", "法术攻击": "mag_atk", "攻击": "atk", "防御": "def", "生命": "hp"
        };

        const pStats = CombatCalc.getDynamicStats(ctx, 'player');
        const eStats = CombatCalc.getDynamicStats(ctx, 'enemy');
        const dmgTypeEn = TYPE_MAP[skill.damageType] || 'phy';
        const baseAtk = (dmgTypeEn === 'phy') ? pStats.phy_atk : pStats.mag_atk;

        // 构造技能本身的悬浮窗 (显示技能基础信息)
        const skillTooltip = {
            type: 'player_skill', name: skill.name, dmgType: dmgTypeEn,
            panelVal: baseAtk, val: skill.dmgVal, formulaType: skill.formulaType,
            subType: skill.subType, cost: skill.mpCost, cd: skill.cd, duration: skill.duration
        };
        const skillEncoded = encodeURIComponent(JSON.stringify(skillTooltip));

        ctx._log(`> 你施展了 <span class="combat-tooltip-trigger" style="color:#ffb74d; font-weight:bold; cursor:help; border-bottom:1px dotted #ffb74d;" 
            onmouseenter="window.showCombatTooltip(event, '${skillEncoded}')" 
            onmouseleave="window.hideTooltip()" 
            onmousemove="window.moveTooltip(event)">${skill.name}</span>！`);

        const subType = skill.subType;

        // ========================
        // 核心分支逻辑
        // ========================

        if (subType === "瞬发伤害") {
            const attacker = { ...pStats, skillName: skill.name, damageType: dmgTypeEn };
            if (skill.formulaType === "百分比") {
                attacker.skillMult = skill.dmgVal; attacker.skillFlat = 0;
            } else {
                attacker.skillMult = 0; attacker.skillFlat = skill.dmgVal;
            }
            const dmg = CombatCalc.calcDamage(ctx, attacker, eStats, true, "技能");
            ctx.currentEHp = Math.max(0, ctx.currentEHp - dmg);

        } else if (subType === "周期性伤害") {
            // --- Type B: DoT (关键修改) ---
            // 1. 构造攻击数据
            const attacker = { ...pStats, skillName: skill.name, damageType: dmgTypeEn };
            if (skill.formulaType === "百分比") {
                attacker.skillMult = skill.dmgVal; attacker.skillFlat = 0;
            } else {
                attacker.skillMult = 0; attacker.skillFlat = skill.dmgVal;
            }

            // 2. 【核心】调用 calcDamage 静默模式，获取 快照伤害 和 计算详情
            // isSilent=true 返回 { damage: 143, data: {...} }
            const calcRes = CombatCalc.calcDamage(ctx, attacker, eStats, true, "周期性伤害", "你", true);

            const tickDmg = calcRes.damage; // 扣除防御后的实际每跳伤害
            const metaData = calcRes.data;  // 悬浮窗需要的计算详情数据

            // 3. 施加 Debuff，并传入 metaData
            // 这里的 valType 强制为 0 (固定值)，因为我们已经把百分比转成了具体的数值
            this.applyBuff(ctx, 'enemy', 'hp', -tickDmg, skill.duration, 'debuff', skill.name, 0, skill.id, metaData);

        } else if (subType === "治疗技能") {
            let healAmount = 0;
            if (skill.formulaType === "百分比") healAmount = Math.floor(baseAtk * skill.dmgVal);
            else healAmount = skill.dmgVal;

            ctx.currentPHp = Math.min(ctx.player.derived.hpMax, ctx.currentPHp + healAmount);
            ctx._log(`> 你的伤势恢复了 <span style="color:#4caf50; font-weight:bold;">+${healAmount}</span> 点。`);

        } else if (subType === "增益技能" || subType === "减益技能") {
            const attrEn = ATTR_MAP[skill.targetAttribute] || 'atk';
            const valType = skill.formulaType === "百分比" ? 1 : 0;
            const targetKey = subType === "增益技能" ? 'player' : 'enemy';
            const type = subType === "增益技能" ? 'buff' : 'debuff';
            const val = subType === "减益技能" ? -skill.dmgVal : skill.dmgVal;

            this.applyBuff(ctx, targetKey, attrEn, val, skill.duration, type, skill.name, valType, skill.id);
        }

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
        ctx._refreshSkillCDUI();

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
        ctx._updateToxUI(); // 确保更新毒性UI

        if (ctx.currentEHp <= 0) {
            CombatCore.handleVictory(ctx);
        }
    },

    /** 敌人行为决策 AI */
    enemyAction: function(ctx, eStats, pStats) {
        let actionDone = false;

        if (ctx.enemy.skills && ctx.enemy.skills.length > 0) {
            for (let skill of ctx.enemy.skills) {
                // 简单的AI判定: 只有当buff层数不够时才放buff (可选逻辑，这里简化处理)
                let canCast = true;
                if (!canCast || Math.random() > skill.rate) continue;

                const skillHtml = this._buildSkillLogHtml(skill, eStats);

                if (skill.type === 1) {
                    // --- 伤害技能 ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    const dmgType = skill.damageType || 'mag';
                    const valType = skill.dmgValType !== undefined ? skill.dmgValType : 0;
                    let atkStats = { ...eStats, skillName: skill.id, damageType: dmgType };

                    if (valType === 1) {
                        if (dmgType === 'phy') atkStats.phy_atk = eStats.phy_atk !== undefined ? eStats.phy_atk : (eStats.atk || 0);
                        else atkStats.mag_atk = eStats.mag_atk !== undefined ? eStats.mag_atk : (eStats.atk || 0);
                        atkStats.skillMult = skill.damage || 0;
                        atkStats.skillFlat = 0;
                    } else {
                        atkStats.skillMult = 0;
                        atkStats.skillFlat = skill.damage || 0;
                    }

                    const dmg = CombatCalc.calcDamage(ctx, atkStats, pStats, false, "技能");
                    ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);

                } else if (skill.type === 2) {
                    // --- Debuff ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    // 传入 skill.id 作为 buffId
                    this.applyBuff(ctx, 'player', skill.debuffAttr, -skill.debuffValue, skill.debuffTimes, 'debuff', skill.id, skill.debuffValType, skill.id);

                } else if (skill.type === 3) {
                    // --- Buff ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    // 传入 skill.id 作为 buffId
                    this.applyBuff(ctx, 'enemy', skill.buffAttr, skill.buffValue, skill.buffTimes, 'buff', skill.id, skill.buffValType, skill.id);
                }

                actionDone = true;
                break;
            }
        }

        if (!actionDone) {
            const dmg = CombatCalc.performAttack(ctx, ctx.enemy.name, eStats, pStats, false);
            ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);
        }
    },

    /** 应用 Buff/Debuff (修改：接收并存储 metaData)
     * @param {Object} metaData - (新增) 伤害计算快照数据
     */
    applyBuff: function(ctx, targetKey, attr, val, turns, type, name, valType = 0, buffId = null, metaData = null) {
        if (!ctx.buffs[targetKey]) ctx.buffs[targetKey] = {};

        const targetName = targetKey === 'player' ? '你' : ctx.enemy.name;
        const uniqueId = buffId || name;

        // --- 处理 HP/MP (使用数组存储以支持多重DoT) ---
        if (attr === 'hp' || attr === 'mp') {
            if (!Array.isArray(ctx.buffs[targetKey][attr])) {
                ctx.buffs[targetKey][attr] = [];
            }

            const list = ctx.buffs[targetKey][attr];
            const existing = list.find(b => b.buffId === uniqueId);

            if (existing) {
                // 刷新持续时间
                existing.turns = turns;
                existing.val = val;
                existing.valType = valType;
                // 更新快照数据 (如果这次攻击更强，覆盖旧的)
                if (metaData) existing.metaData = metaData;

                ctx._log(`> ${targetName} 的 [${name}] 持续时间刷新了。`);
            } else {
                // 新增 Buff，存入 metaData
                list.push({ val, turns, type, name, valType, buffId: uniqueId, isNew: true, metaData: metaData });

                // 构造初始显示的数值 HTML
                let displayVal = Math.abs(val);
                if (valType === 1) displayVal = (Math.abs(val) * 100).toFixed(0) + "%";

                // 【新增】如果存在 metaData，给初始日志的数值加上悬浮窗
                if (metaData) {
                    const encoded = encodeURIComponent(JSON.stringify(metaData));
                    displayVal = `<span class="combat-tooltip-trigger" 
                        style="cursor:help; border-bottom:1px dotted; font-weight:bold;"
                        onmouseenter="window.showCombatTooltip(event, '${encoded}')" 
                        onmouseleave="window.hideTooltip()" 
                        onmousemove="window.moveTooltip(event)">${displayVal}</span>`;
                }

                const actionDesc = val < 0 ? "损失" : "恢复";
                const attrName = (typeof ATTR_MAPPING !== 'undefined') ? (ATTR_MAPPING[attr] || attr) : attr;

                ctx._log(`> ${targetName} 受到 <b style="color:${type==='debuff'?'#f57f17':'#388e3c'}">[${name}]</b> 影响: 每回合${actionDesc} ${displayVal} ${attrName} (${turns}回合)`);
            }

        } else {
            // --- 普通属性 (覆盖式) ---
            ctx.buffs[targetKey][attr] = { val, turns, type, name, valType, buffId: uniqueId, isNew: true };

            let valStr = "";
            if (valType === 1) valStr = (val > 0 ? "+" : "") + (val * 100).toFixed(0) + "%";
            else valStr = (val > 0 ? "+" : "") + val;

            const attrName = (typeof ATTR_MAPPING !== 'undefined') ? (ATTR_MAPPING[attr] || attr) : attr;
            ctx._log(`> ${targetName} 受到 <b style="color:${type==='debuff'?'#f57f17':'#388e3c'}">[${name}]</b> 影响: ${attrName} ${valStr} (${turns}回合)`);
        }

        ctx._updateUIStats();
    },

    /** 回合结束处理 Buff (修改：读取 metaData 并渲染悬浮窗) */
    processBuffs: function(ctx, target) {
        const buffMap = ctx.buffs[target];
        const targetName = target === 'player' ? '你' : ctx.enemy.name;

        for (let attr in buffMap) {

            // --- 处理 HP/MP (数组) ---
            if (attr === 'hp' || attr === 'mp') {
                const list = buffMap[attr];
                if (!Array.isArray(list)) continue;

                // 倒序遍历以便删除
                for (let i = list.length - 1; i >= 0; i--) {
                    const b = list[i];

                    const max = (attr === 'hp')
                        ? (target === 'player' ? ctx.player.derived.hpMax : ctx.enemy.maxHp)
                        : (target === 'player' ? ctx.player.derived.mpMax : 100);

                    const currProp = (attr === 'hp')
                        ? (target === 'player' ? 'currentPHp' : 'currentEHp')
                        : (target === 'player' ? 'currentPMp' : null);

                    if (!currProp) continue;

                    // 计算数值
                    const change = b.valType === 1 ? Math.floor(max * b.val) : b.val;
                    const oldVal = ctx[currProp];
                    ctx[currProp] = Math.max(0, Math.min(max, oldVal + change));

                    // --- 【核心修改】构造日志数值 HTML ---
                    const absChange = Math.abs(change);
                    let valHtml = absChange;

                    // 如果 Buff 对象里存有 metaData，则生成悬浮窗
                    if (b.metaData) {
                        const encoded = encodeURIComponent(JSON.stringify(b.metaData));
                        valHtml = `<span class="combat-tooltip-trigger" 
                            style="cursor:help; border-bottom:1px dotted;"
                            onmouseenter="window.showCombatTooltip(event, '${encoded}')" 
                            onmouseleave="window.hideTooltip()" 
                            onmousemove="window.moveTooltip(event)">
                            ${absChange}
                        </span>`;
                    }

                    const actionStr = change > 0 ? "恢复" : "流失";
                    const color = change > 0 ? "#4caf50" : "#e53935"; // 绿/红
                    const attrName = (typeof ATTR_MAPPING !== 'undefined') ? (ATTR_MAPPING[attr] || attr) : attr;

                    // 只有当数值不为0时才打印日志 (防止刷屏)
                    if (change !== 0) {
                        ctx._log(`> ${targetName} 因 [${b.name}] ${actionStr} <span style="color:${color}">${valHtml}</span> ${attrName}`);
                    }

                    // 扣除回合
                    b.turns--;
                    if (b.turns <= 0) {
                        ctx._log(`<span style="color:#888; font-size:12px;">> ${targetName} 的 [${b.name}] 效果结束。</span>`);
                        list.splice(i, 1);
                    }
                }

                if (list.length === 0) delete buffMap[attr];

            } else {
                // --- 处理普通属性 (对象) ---
                const b = buffMap[attr];
                if (b.isNew) {
                    b.isNew = false;
                } else {
                    b.turns--;
                }

                if (b.turns <= 0) {
                    ctx._log(`<span style="color:#888; font-size:12px;">> ${targetName} 的 [${b.name}] 效果结束。</span>`);
                    delete buffMap[attr];
                }
            }
        }
    },

    /** 构造敌人技能日志 HTML (保持原样，仅辅助显示) */
    _buildSkillLogHtml: function(skill, eStats) {
        let color = "#333";
        if (skill.type === 1) color = "#d32f2f";
        else if (skill.type === 2) color = "#f57f17";
        else if (skill.type === 3) color = "#388e3c";

        let tooltipData = {
            type: 'enemy_skill',
            subType: skill.type,
            name: skill.id,
            prob: (skill.rate * 100).toFixed(0)
        };

        if (skill.type === 1) {
            const dmgType = skill.damageType || 'mag';
            const valType = skill.dmgValType !== undefined ? skill.dmgValType : 0;
            tooltipData.dmgType = dmgType;
            tooltipData.valType = valType;

            if (valType === 1) {
                let panelVal = 0;
                if (dmgType === 'phy') panelVal = eStats.phy_atk !== undefined ? eStats.phy_atk : (eStats.atk || 0);
                else panelVal = eStats.mag_atk !== undefined ? eStats.mag_atk : (eStats.atk || 0);
                tooltipData.panelVal = panelVal;
                tooltipData.ratio = (skill.damage * 100).toFixed(0);
            } else {
                tooltipData.fixedDmg = skill.damage || 0;
            }
        } else if (skill.type === 2) {
            tooltipData.effect = skill.debuffAttr;
            tooltipData.fixedDmg = skill.debuffValue;
            tooltipData.duration = skill.debuffTimes;
        } else if (skill.type === 3) {
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

    // ... (其他消耗品逻辑 _applyItemEffects, _applyPoisonToEnemy 等保持不变) ...
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
    }
};

window.CombatAction = CombatAction;