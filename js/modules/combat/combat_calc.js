// js/modules/combat/combat_calc.js
// 职责：数值逻辑演算、属性动态获取、词条全量支持 (V3.3 修复日志顺序)

const CombatCalc = {

    /** 获取实时属性 (包含 Buff 和 词条修正) */
    getDynamicStats: function(ctx, targetKey) {
        let base = {};

        // 1. 提取基础属性
        if (targetKey === 'player') {
            const d = ctx.player.derived || ctx.player.attributes || {};
            base = {
                hp: ctx.currentPHp, mp: ctx.currentPMp, hpMax: d.hpMax,
                speed: d.speed || 10, atk: d.atk || 10, def: d.def || 0,
                phy_atk: d.phy_atk || d.atk || 10, mag_atk: d.mag_atk || d.atk || 10,
                phy_def: d.phy_def || d.def || 0, mag_def: d.mag_def || d.def || 0,
                crit: d.crit || 0, mag_crit: d.mag_crit || 0,
                sharpness: d.sharpness || 0, penetration: d.penetration || 0,
                toxicity: ctx.player.toxicity || 0
            };
        } else {
            const e = ctx.enemy;
            const s = e.stats || {};
            base = {
                hp: ctx.currentEHp, hpMax: e.maxHp || e.hp,
                speed: s.speed!==undefined?s.speed:(e.speed||10),
                atk: s.atk!==undefined?s.atk:(e.atk||10),
                def: s.def!==undefined?s.def:(e.def||0),
                phy_atk: s.phy_atk||s.atk||e.atk||10, mag_atk: s.mag_atk||s.atk||e.atk||10,
                phy_def: s.phy_def||s.def||e.def||0, mag_def: s.mag_def||s.def||e.def||0,
                crit: s.crit||e.crit||0, mag_crit: s.mag_crit||e.mag_crit||0,
                basePen: e.basePen||0, toxAtk: e.toxAtk||0, accuracy: e.accuracy||0,
                toxicity: e.toxicity||0
            };
        }

        // 2. 应用 Buff 修正
        const myBuffs = ctx.buffs[targetKey];
        if (myBuffs) {
            for (let attr in myBuffs) {
                if (attr === 'hp' || attr === 'mp') continue;
                if (base[attr] !== undefined) base[attr] += myBuffs[attr].val;
                // 兼容性联动
                if (attr === 'atk') { base.phy_atk += myBuffs[attr].val; base.mag_atk += myBuffs[attr].val; }
                if (attr === 'def') { base.phy_def += myBuffs[attr].val; base.mag_def += myBuffs[attr].val; }
            }
        }

        // 3. 应用词条修正 (Stat Mods)
        this._applyStatMods(ctx, targetKey, base);

        // 4. 保底处理
        base.speed = Math.max(1, base.speed);
        base.phy_atk = Math.max(1, base.phy_atk);
        base.mag_atk = Math.max(1, base.mag_atk);

        return base;
    },

    /** 执行攻击 (处理连击逻辑) */
    performAttack: function(ctx, attackerName, atkStats, defStats, isPlayerAttacking) {
        // 1. 基础攻击
        let totalDamage = this.calcDamage(ctx, atkStats, defStats, isPlayerAttacking, "普攻", attackerName);

        // 2. 检查连击 (Double Strike)
        // 触发时机: onPhyAttack (仅限物理普攻)
        if (isPlayerAttacking && ctx.entries && ctx.entries.player) {
            const entries = ctx.entries.player;
            const doubleEntry = entries.find(e => e.id === 'double_strike');

            if (doubleEntry) {
                // 15% 概率
                if (Math.random() * 100 < doubleEntry.val) {
                    setTimeout(() => {
                        CombatUI.log(ctx, `<span style="color:#ff9800; font-weight:bold;">⚡ [连击] 剑光一闪，残影追击！</span>`);
                        // 连击不触发递归，直接调 calcDamage
                        const extraDmg = this.calcDamage(ctx, atkStats, defStats, isPlayerAttacking, "连击", attackerName);

                        if (isPlayerAttacking) ctx.currentEHp = Math.max(0, ctx.currentEHp - extraDmg);
                        else ctx.currentPHp = Math.max(0, ctx.currentPHp - extraDmg);

                        CombatUI.updateStats(ctx);
                    }, 250);
                }
            }
        }

        return totalDamage;
    },

    /** 核心伤害公式 */
    calcDamage: function(ctx, atkStats, defStats, isPlayerAttacking, type="普攻", attackerName=null) {
        const name = attackerName || (isPlayerAttacking ? "你" : ctx.enemy.name);
        const attackerKey = isPlayerAttacking ? 'player' : 'enemy';
        const defenderKey = isPlayerAttacking ? 'enemy' : 'player';

        // 1. 确定类型 (物理/法术)
        let dmgType = 'phy';
        if (type === "技能") dmgType = atkStats.damageType || 'phy';

        // 2. 提取面板
        let panelAtk = (dmgType === 'phy') ? atkStats.phy_atk : atkStats.mag_atk;
        let panelDef = (dmgType === 'phy') ? defStats.phy_def : defStats.mag_def;
        // 固定穿透值 (玩家锋利/灵透 或 敌人basePen)
        let penetration = (dmgType === 'phy') ? (atkStats.sharpness || 0) : (atkStats.penetration || 0);

        // 3. 计算面板伤害
        let finalAtkVal = panelAtk;
        if (atkStats.skillMult) finalAtkVal = Math.floor(finalAtkVal * atkStats.skillMult);
        if (atkStats.skillFlat) finalAtkVal = finalAtkVal + atkStats.skillFlat;

        // 4. 闪避判定
        const spdAtk = atkStats.speed;
        const spdDef = defStats.speed;
        let accMod = (atkStats.accuracy || 0);

        // 词条: Blind
        const blindEntry = this._findEntry(ctx, attackerKey, 'blind');
        if (blindEntry) accMod -= blindEntry.val;

        let rawDodgeRate = Math.max(0, 0.05 + (spdDef - spdAtk) / 200 - (accMod/100));
        let finalDodgeRate = Math.min(0.5, rawDodgeRate);

        if (Math.random() < finalDodgeRate) {
            this._triggerOnDodge(ctx, defenderKey);
            const dodgeData = {
                type: 'evasion',
                source: isPlayerAttacking ? 'enemy' : 'player',
                base: (rawDodgeRate * 100).toFixed(1),
                acc: accMod,
                final: (finalDodgeRate * 100).toFixed(1)
            };
            this._logDodge(ctx, name, type, dodgeData);
            return 0;
        }

        // 5. 防御穿透计算
        if (atkStats.basePen) penetration += atkStats.basePen;

        // 词条: Sunder / Penetrate (百分比穿透)
        let defModPct = 0;
        if (dmgType === 'phy') {
            const sunder = this._findEntry(ctx, attackerKey, 'sunder');
            if (sunder) defModPct += sunder.val;
        } else {
            const pen = this._findEntry(ctx, attackerKey, 'penetrate');
            if (pen) defModPct += pen.val;
        }

        const originDef = panelDef;
        let effectiveDef = Math.max(0, panelDef - penetration);
        if (defModPct > 0) effectiveDef = Math.floor(effectiveDef * (1 - defModPct/100));

        // 6. 减伤公式
        const ARMOR_CONST = 100;
        const mitigation = ARMOR_CONST / (ARMOR_CONST + effectiveDef);
        const mitigationPct = ((1 - mitigation) * 100).toFixed(1);

        let rawDamage = finalAtkVal * mitigation;

        // 7. 伤害增幅修正
        const execute = this._findEntry(ctx, attackerKey, 'execute');
        if (execute && (defStats.hp / defStats.hpMax) < 0.3) rawDamage *= (1 + execute.val / 100);

        const soft = this._findEntry(ctx, attackerKey, 'soft');
        if (soft) rawDamage *= (1 - soft.val / 100);

        // 8. 暴击判定
        let critRate = (dmgType === 'phy') ? atkStats.crit : atkStats.mag_crit;
        if (isPlayerAttacking) critRate += (atkStats.shen || 0) * 0.05;

        let critDmgMult = 1.5;
        const critUp = this._findEntry(ctx, attackerKey, 'crit_dmg_up');
        if (critUp) critDmgMult += (critUp.val / 100);

        const isCrit = Math.random() * 100 < critRate;
        if (isCrit) rawDamage *= critDmgMult;

        // 9. 最终浮动 & 受击减免
        const variance = 0.95 + Math.random() * 0.1;

        let dmgTakenMod = 1.0;
        if (dmgType === 'phy') {
            const iron = this._findEntry(ctx, defenderKey, 'iron_skin');
            if (iron) dmgTakenMod -= (iron.val / 100);
        } else {
            const shell = this._findEntry(ctx, defenderKey, 'magic_shell');
            if (shell) dmgTakenMod -= (shell.val / 100);
        }
        const frail = this._findEntry(ctx, defenderKey, 'frail');
        if (frail) dmgTakenMod += (frail.val / 100);

        let finalDamage = Math.floor(rawDamage * variance * Math.max(0.1, dmgTakenMod));
        finalDamage = Math.max(1, finalDamage);

        // 10. 构造 Tooltip
        const tooltipData = {
            type: 'damage',
            source: isPlayerAttacking ? 'player' : 'enemy',
            dmgType: dmgType,
            originDef: originDef,
            effectiveDef: effectiveDef,
            mitigationPct: mitigationPct,
            penVal: penetration,
            penPct: defModPct,
            defReductPct: defModPct,
            finalAtkVal: finalAtkVal,
            dmgAfterMitigation: Math.floor(rawDamage / (isCrit ? critDmgMult : 1) / variance),
            critRate: critRate.toFixed(1),
            isCrit: isCrit,
            critDmg: critDmgMult,
            variance: (variance * 100).toFixed(0) + '%',
            finalDamage: finalDamage,
            atkStats: atkStats
        };

        // 11. 【优先】输出伤害日志
        this._logDamage(ctx, name, type, isPlayerAttacking, finalDamage, isCrit, tooltipData);

        // 12. 【滞后】触发特效 (On Hit / On Damaged) —— 如吸血、反伤
        // 这样日志里就会先显示“造成伤害”，然后紧接着显示“吸血恢复”
        this._handlePostAttack(ctx, attackerKey, defenderKey, finalDamage, dmgType, isCrit);

        // 13. 毒
        if (!isPlayerAttacking && type === "普攻" && atkStats.toxAtk > 0) {
            window.player.toxicity = Math.min(100, (window.player.toxicity || 0) + Number(atkStats.toxAtk));
            CombatUI.updateTox(ctx);
            CombatUI.log(ctx, `> ⚠️ ${name} 附带剧毒！中毒 +${atkStats.toxAtk}`);
        }

        return finalDamage;
    },

    // --- 词条处理核心 ---

    _applyStatMods: function(ctx, targetKey, base) {
        if (!ctx.entries || !ctx.entries[targetKey]) return;

        const entries = ctx.entries[targetKey];
        entries.forEach(entry => {
            if (entry.id === 'sharpness_plus') {
                base.sharpness = (base.sharpness || 0) + entry.val;
            }
            if (entry.id === 'penetration_plus') {
                base.penetration = (base.penetration || 0) + entry.val;
            }
            if (entry.id === 'speed_up') base.speed += entry.val;
            if (entry.id === 'atk_up_pct') {
                base.phy_atk = Math.floor(base.phy_atk * (1 + entry.val/100));
                base.atk = Math.floor(base.atk * (1 + entry.val/100));
            }
        });
    },

    _handlePostAttack: function(ctx, attackerKey, defenderKey, damage, dmgType, isCrit) {
        if (!ctx.entries) return;
        const attEntries = ctx.entries[attackerKey] || [];
        const defEntries = ctx.entries[defenderKey] || [];

        // 1. 吸血 (lifesteal)
        attEntries.forEach(entry => {
            if (entry.id === 'lifesteal' && dmgType === 'phy') {
                this._heal(ctx, attackerKey, Math.floor(damage * entry.val / 100), "吸血", damage, entry.val);
            }
            if (entry.id === 'spellvamp' && dmgType === 'mag') {
                this._heal(ctx, attackerKey, Math.floor(damage * entry.val / 100), "魔饮", damage, entry.val);
            }
        });

        // 2. 荆棘 (thorns)
        defEntries.forEach(entry => {
            if (entry.id === 'thorns' && dmgType === 'phy') {
                const reflect = Math.floor(damage * entry.val / 100);
                if (reflect > 0) this._damage(ctx, attackerKey, reflect, "荆棘", damage, entry.val);
            }
        });
    },

    _triggerOnDodge: function(ctx, defenderKey) {
        if (!ctx.entries || !ctx.entries[defenderKey]) return;
        const entries = ctx.entries[defenderKey];
        entries.forEach(entry => {
            if (entry.id === 'dodge_heal') this._heal(ctx, defenderKey, entry.val, "幻身");
        });
    },

    _findEntry: function(ctx, targetKey, entryId) {
        if (!ctx.entries || !ctx.entries[targetKey]) return null;
        return ctx.entries[targetKey].find(e => e.id === entryId);
    },

    _heal: function(ctx, targetKey, amount, reason, baseVal, ratio) {
        if (amount <= 0) return;
        if (targetKey === 'player') ctx.currentPHp = Math.min(ctx.player.derived.hpMax, ctx.currentPHp + amount);
        else ctx.currentEHp = Math.min(ctx.enemy.maxHp, ctx.currentEHp + amount);

        let tooltipData = "";
        if (baseVal !== undefined) {
            const data = { type: 'entry', name: reason, baseVal: baseVal, ratio: ratio, finalVal: amount };
            tooltipData = encodeURIComponent(JSON.stringify(data));
        }

        const span = `<span class="combat-tooltip-trigger" style="color:#4caf50; cursor:help; border-bottom:1px dotted #4caf50;"
            onmouseenter="window.showCombatTooltip(event, '${tooltipData}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">
            [${reason}]</span>`;

        CombatUI.log(ctx, `> ${span} 恢复 ${amount} 生命`);
        CombatUI.updateStats(ctx);
    },

    _damage: function(ctx, targetKey, amount, reason, baseVal, ratio) {
        if (amount <= 0) return;
        if (targetKey === 'player') ctx.currentPHp = Math.max(0, ctx.currentPHp - amount);
        else ctx.currentEHp = Math.max(0, ctx.currentEHp - amount);

        let tooltipData = "";
        if (baseVal !== undefined) {
            const data = { type: 'entry', name: reason, baseVal: baseVal, ratio: ratio, finalVal: amount };
            tooltipData = encodeURIComponent(JSON.stringify(data));
        }

        const span = `<span class="combat-tooltip-trigger" style="color:#d32f2f; cursor:help; border-bottom:1px dotted #d32f2f;"
            onmouseenter="window.showCombatTooltip(event, '${tooltipData}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">
            [${reason}]</span>`;

        CombatUI.log(ctx, `> ${span} 受到 ${amount} 伤害`);
        CombatUI.updateStats(ctx);
    },

    _logDodge: function(ctx, name, type, data) {
        const encoded = encodeURIComponent(JSON.stringify(data));
        const span = `<span class="combat-tooltip-trigger" style="color:#aaa; cursor:help; border-bottom:1px dotted #ccc;"
            onmouseenter="window.showCombatTooltip(event, '${encoded}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">
            闪避</span>`;
        CombatUI.log(ctx, `${name} 的${type}被 ${span} 了！`);
    },

    _logDamage: function(ctx, name, type, isPlayer, dmg, isCrit, data) {
        const encoded = encodeURIComponent(JSON.stringify(data));
        const color = isPlayer ? "#d32f2f" : "#1976d2";
        const critStr = isCrit ? " <b style='color:#ff9800'>[暴击!]</b>" : "";

        const dmgSpan = `<span class="combat-tooltip-trigger" 
            style="color:${color}; font-weight:bold; cursor:help; border-bottom:1px dotted ${color};"
            onmouseenter="window.showCombatTooltip(event, '${encoded}')" 
            onmouseleave="window.hideTooltip()"
            onmousemove="window.moveTooltip(event)">
            ${dmg}
        </span>`;

        CombatUI.log(ctx, `${name} ${type}造成 ${dmgSpan} 点伤害${critStr}`);
    }
};

window.CombatCalc = CombatCalc;