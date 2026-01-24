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

    /** 敌人行为决策 AI (修改：生成唯一BuffID) */
    enemyAction: function(ctx, eStats, pStats) {
        let actionDone = false;

        if (ctx.enemy.skills && ctx.enemy.skills.length > 0) {
            for (let i = 0; i < ctx.enemy.skills.length; i++) {
                let skill = ctx.enemy.skills[i];
                // 简单的AI判定
                if (Math.random() > skill.rate) continue;

                const skillHtml = this._buildSkillLogHtml(skill, eStats);

                // 【核心修改】生成唯一 Buff ID (防止不同技能互相覆盖，也防止和玩家技能冲突)
                // 格式: enemy_{技能索引}_{技能ID}
                const uniqueSkillId = `enemy_sk_${i}_${skill.id}`;

                if (skill.type === 1) {
                    // --- 伤害技能 (保持不变) ---
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
                    // --- Debuff (修改：传入唯一ID) ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    this.applyBuff(ctx, 'player', skill.debuffAttr, -skill.debuffValue, skill.debuffTimes, 'debuff', skill.id, skill.debuffValType, uniqueSkillId);

                } else if (skill.type === 3) {
                    // --- Buff (修改：传入唯一ID) ---
                    ctx._log(`${ctx.enemy.name} 施展了 ${skillHtml}！`);
                    this.applyBuff(ctx, 'enemy', skill.buffAttr, skill.buffValue, skill.buffTimes, 'buff', skill.id, skill.buffValType, uniqueSkillId);
                }

                actionDone = true;
                break;
            }
        }

        // --- 核心修改部分 ---
        if (!actionDone) {
            // 智能普攻：判断 物理攻击 vs 法术攻击，取高者
            const phyAtk = eStats.phy_atk || 0;
            const magAtk = eStats.mag_atk || 0;

            // 标记伤害类型：如果法攻更高，就用法术普攻
            eStats.damageType = (magAtk > phyAtk) ? 'mag' : 'phy';

            // 构造日志描述 (可选：让玩家知道敌人用了法术普攻)
            const atkDesc = (eStats.damageType === 'mag') ? "法术普攻" : "普攻";
            // 可以在 performAttack 内部根据 damageType 自动处理，这里直接调用即可

            const dmg = CombatCalc.performAttack(ctx, ctx.enemy.name, eStats, pStats, false);
            ctx.currentPHp = Math.max(0, ctx.currentPHp - dmg);
        }
    },

    /** 应用 Buff/Debuff (修改：全属性数组化支持共存) */
    applyBuff: function(ctx, targetKey, attr, val, turns, type, name, valType = 0, buffId = null, metaData = null) {
        // 确保 buffs 容器存在 (且完全独立于存档)
        if (!ctx.buffs[targetKey]) ctx.buffs[targetKey] = {};

        const targetName = targetKey === 'player' ? '你' : ctx.enemy.name;
        const uniqueId = buffId || name; // 如果没传ID，用名字兜底(玩家技能通常用名字或ID)

        // 1. 初始化该属性的 Buff 数组
        if (!Array.isArray(ctx.buffs[targetKey][attr])) {
            ctx.buffs[targetKey][attr] = [];
        }

        const list = ctx.buffs[targetKey][attr];
        // 2. 查找是否已有同源 Buff (ID相同)
        const existing = list.find(b => b.buffId === uniqueId);

        if (existing) {
            // --- 刷新现有 Buff ---
            existing.turns = turns;
            existing.val = val;
            existing.valType = valType;
            if (metaData) existing.metaData = metaData; // 更新快照

            ctx._log(`> ${targetName} 的 [${name}] 持续时间刷新了。`);
        } else {
            // --- 新增 Buff (推入数组，实现共存) ---
            list.push({
                val, turns, type, name, valType,
                buffId: uniqueId,
                isNew: true,
                metaData: metaData
            });

            // 构造日志显示
            let displayVal = Math.abs(val);
            if (valType === 1) displayVal = (Math.abs(val) * 100).toFixed(0) + "%";

            // 如果有 metaData (DoT)，加 Tooltip
            if (metaData) {
                const encoded = encodeURIComponent(JSON.stringify(metaData));
                displayVal = `<span class="combat-tooltip-trigger" 
                    style="cursor:help; border-bottom:1px dotted; font-weight:bold;"
                    onmouseenter="window.showCombatTooltip(event, '${encoded}')" 
                    onmouseleave="window.hideTooltip()" 
                    onmousemove="window.moveTooltip(event)">${displayVal}</span>`;
            }

            const actionDesc = val < 0 ? "降低" : "提升";
            // 特殊处理 HP/MP 的描述
            let finalDesc = actionDesc;
            if (attr === 'hp') finalDesc = val < 0 ? "损失" : "恢复";
            if (attr === 'mp') finalDesc = val < 0 ? "流失" : "恢复";

            const attrName = (typeof ATTR_MAPPING !== 'undefined') ? (ATTR_MAPPING[attr] || attr) : attr;
            const color = type === 'debuff' ? '#f57f17' : '#388e3c';

            ctx._log(`> ${targetName} 受到 <b style="color:${color}">[${name}]</b> 影响: 每回合${finalDesc} ${displayVal} ${attrName} (${turns}回合)`);
        }

        ctx._updateUIStats();
    },

    /** 回合结束处理 Buff (修改：统一处理数组) */
    processBuffs: function(ctx, target) {
        const buffMap = ctx.buffs[target];
        const targetName = target === 'player' ? '你' : ctx.enemy.name;

        // 遍历所有属性 (hp, mp, speed, atk...)
        for (let attr in buffMap) {
            const list = buffMap[attr];
            if (!Array.isArray(list)) continue; // 防御性检查

            // 倒序遍历以便安全删除
            for (let i = list.length - 1; i >= 0; i--) {
                const b = list[i];

                // --- 1. 处理每回合生效的属性 (HP/MP) ---
                if (attr === 'hp' || attr === 'mp') {
                    const max = (attr === 'hp')
                        ? (target === 'player' ? ctx.player.derived.hpMax : ctx.enemy.maxHp)
                        : (target === 'player' ? ctx.player.derived.mpMax : 100);

                    const currProp = (attr === 'hp')
                        ? (target === 'player' ? 'currentPHp' : 'currentEHp')
                        : (target === 'player' ? 'currentPMp' : null);

                    if (currProp) {
                        const change = b.valType === 1 ? Math.floor(max * b.val) : b.val;
                        const oldVal = ctx[currProp];
                        ctx[currProp] = Math.max(0, Math.min(max, oldVal + change));

                        // 日志与Tooltip逻辑
                        const absChange = Math.abs(change);
                        let valHtml = absChange;
                        if (b.metaData) {
                            const encoded = encodeURIComponent(JSON.stringify(b.metaData));
                            valHtml = `<span class="combat-tooltip-trigger" style="cursor:help; border-bottom:1px dotted;" onmouseenter="window.showCombatTooltip(event, '${encoded}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">${absChange}</span>`;
                        }
                        const actionStr = change > 0 ? "恢复" : "流失";
                        const color = change > 0 ? "#4caf50" : "#e53935";
                        if (change !== 0) {
                            ctx._log(`> ${targetName} 因 [${b.name}] ${actionStr} <span style="color:${color}">${valHtml}</span> ${(attr==='hp'?'生命':'灵力')}`);
                        }
                    }
                }

                // --- 2. 扣除回合数 ---
                // 对于属性 Buff (如 +speed)，虽然不每回合跳数字，但要扣回合
                if (b.isNew) {
                    b.isNew = false; // 跳过当回合的扣除
                } else {
                    b.turns--;
                    if (b.turns <= 0) {
                        ctx._log(`<span style="color:#888; font-size:12px;">> ${targetName} 的 [${b.name}] 效果结束。</span>`);
                        list.splice(i, 1); // 移除过期的
                    }
                }
            }

            // 如果该属性下没有 Buff 了，可以清理掉 key (可选)
            if (list.length === 0) delete buffMap[attr];
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