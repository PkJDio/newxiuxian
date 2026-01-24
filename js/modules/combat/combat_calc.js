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
                toxicity: ctx.player.status.toxicity || 0
            };
        } else {
            const e = ctx.enemy;
            // console.log('怪物', e);
            const s = e.stats || {};
            // console.log('怪物stats', s);
            base = {
                hp: ctx.currentEHp, hpMax: e.maxHp || e.hp,
                speed: s.speed!==undefined?s.speed:(e.speed||10),
                atk: s.atk!==undefined?s.atk:(e.atk||10),
                def: s.def!==undefined?s.def:(e.def||0),
                phy_atk: s.phy_atk||s.atk||e.atk||10, mag_atk: s.mag_atk||s.atk||e.atk||10,
                phy_def: s.phy_def||s.def||e.def||0, mag_def: s.mag_def||s.def||e.def||0,
                crit: s.crit !== undefined ? s.crit : (e.crit || 0), // 优先读取 stats.crit，其次 enemy.crit
                mag_crit: s.mag_crit !== undefined ? s.mag_crit : (e.crit || 0), // 如果没有特指法术暴击，通常默认用 crit

                basePen: e.basePen||0, toxAtk: e.toxAtk||0, accuracy: e.accuracy||0,
                toxicity: e.toxicity||0
            };
            // console.log('怪物base', base);
        }

        // 2. 应用 Buff 修正
        // 2. 【核心修复】区分固定值与百分比 Buff
        const myBuffs = ctx.buffs[targetKey];
        if (myBuffs) {
            for (let attr in myBuffs) {
                if (attr === 'hp' || attr === 'mp') continue;
                const b = myBuffs[attr];

                // 计算具体增量
                const calcBonus = (originVal) => {
                    return b.valType === 1 ? (originVal * b.val) : b.val;
                };

                if (base[attr] !== undefined) base[attr] += calcBonus(base[attr]);

                // 联动处理 (如果加的是总攻击 'atk'，则物攻法攻同步加成)
                if (attr === 'atk') {
                    base.phy_atk += calcBonus(base.phy_atk);
                    base.mag_atk += calcBonus(base.mag_atk);
                }
                if (attr === 'def') {
                    base.phy_def += calcBonus(base.phy_def);
                    base.mag_def += calcBonus(base.mag_def);
                }
            }
        }

        // 3. 应用词条修正 (Stat Mods)
        this._applyStatMods(ctx, targetKey, base);

        // 4. 保底处理
        // base.speed = Math.max(1, base.speed);
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

    /** 核心伤害公式 (修改版：支持静默计算与数据返回)
     * @param {boolean} isSilent - 如果为 true，则不打印日志，只返回计算结果
     */
    calcDamage: function(ctx, atkStats, defStats, isPlayerAttacking, type="普攻", attackerName=null, isSilent=false) {
        const name = attackerName || (isPlayerAttacking ? "你" : ctx.enemy.name);
        const attackerKey = isPlayerAttacking ? 'player' : 'enemy';
        const defenderKey = isPlayerAttacking ? 'enemy' : 'player';

        // 1. 确定类型
        let dmgType = 'phy';
        if (type === "技能" || type.includes("周期")) dmgType = atkStats.damageType || 'phy';

        // 2. 提取面板
        let panelAtk = (dmgType === 'phy') ? atkStats.phy_atk : atkStats.mag_atk;
        let panelDef = (dmgType === 'phy') ? defStats.phy_def : defStats.mag_def;

        let penValue = (dmgType === 'phy') ? (atkStats.sharpness || 0) : (atkStats.penetration || 0);
        if (atkStats.basePen) penValue += atkStats.basePen;

        // 3. 计算面板攻击力
        let finalAtkVal = panelAtk;
        // 【修复】检查是否未定义，而不是直接检查真假。
        // 因为固定伤害时 skillMult 为 0，if(0) 会被跳过，导致基础攻击力未被清零。
        if (atkStats.skillMult !== undefined) {
            finalAtkVal = Math.floor(finalAtkVal * atkStats.skillMult);
        }

        if (atkStats.skillFlat) {
            finalAtkVal = finalAtkVal + atkStats.skillFlat;
        }

        // 4. 闪避判定 (DoT 通常不可闪避，或者由外部控制，这里如果是静默计算DoT，通常假设必中)
        if (!isSilent) {
            const spdAtk = atkStats.speed;
            const spdDef = defStats.speed;
            let accMod = (atkStats.accuracy || 0);
            let rawDodgeRate = Math.max(0, 0.05 + (spdDef - spdAtk) / 200 - (accMod/100));
            let finalDodgeRate = Math.min(0.5, rawDodgeRate);

            if (Math.random() < finalDodgeRate) {
                this._triggerOnDodge(ctx, defenderKey);
                const dodgeData = { type: 'evasion', source: isPlayerAttacking ? 'enemy' : 'player', final: (finalDodgeRate * 100).toFixed(1) };
                this._logDodge(ctx, name, type, dodgeData);
                return 0;
            }
        }

        // 5. 防御穿透计算 (同原逻辑)
        const originDef = panelDef;
        let effectiveDef = panelDef;
        let ignoreDefPct = 0;

        if (isPlayerAttacking) {
            const ignoreDefFactor = 100 / (100 + penValue);
            ignoreDefPct = Math.floor((1 - ignoreDefFactor) * 100);
            effectiveDef = panelDef * ignoreDefFactor;
        } else {
            effectiveDef = panelDef - penValue;
            ignoreDefPct = originDef > 0 ? Math.floor((Math.min(originDef, penValue) / originDef) * 100) : (penValue > 0 ? 100 : 0);
        }

        // 额外穿透词条
        let extraDefModPct = 0;
        if (dmgType === 'phy') {
            const sunder = this._findEntry(ctx, attackerKey, 'sunder');
            if (sunder) extraDefModPct += sunder.val;
        } else {
            const pen = this._findEntry(ctx, attackerKey, 'penetrate');
            if (pen) extraDefModPct += pen.val;
        }
        if (extraDefModPct > 0) effectiveDef = effectiveDef * (1 - extraDefModPct / 100);
        effectiveDef = Math.max(0, Math.floor(effectiveDef));

        // 6. 减伤公式
        const ARMOR_CONST = 100;
        const mitigation = ARMOR_CONST / (ARMOR_CONST + effectiveDef);
        const mitigationPct = ((1 - mitigation) * 100).toFixed(1);

        let rawDamage = finalAtkVal * mitigation;

        // 7. 词条修正 (斩杀/虚弱等)
        const execute = this._findEntry(ctx, attackerKey, 'execute');
        if (execute && (defStats.hp / defStats.hpMax) < 0.3) rawDamage *= (1 + execute.val / 100);
        const soft = this._findEntry(ctx, attackerKey, 'soft');
        if (soft) rawDamage *= (1 - soft.val / 100);

        // 8. 暴击 (DoT通常不暴击，除非特殊设计，这里暂时保留逻辑)
        let critRate = (dmgType === 'phy') ? atkStats.crit : atkStats.mag_crit;
        critRate = critRate * 0.01;
        if (isPlayerAttacking) critRate += (atkStats.shen || 0) * 0.05;
        critRate = Math.min(1.0, critRate);

        let isCrit = false;
        let critDmgMult = 1.5;

        // 只有非静默或者是瞬发伤害才判定暴击，DoT一般取期望值或不暴击
        // 这里设定：静默模式(DoT预计算)默认不暴击，以保持数值稳定
        if (!isSilent && Math.random() < critRate) {
            const critUp = this._findEntry(ctx, attackerKey, 'crit_dmg_up');
            if (critUp) critDmgMult += (critUp.val / 100);
            isCrit = true;
            rawDamage *= critDmgMult;
        }

        // 9. 浮动
        const variance = 0.95 + Math.random() * 0.1;
        let finalDamage = Math.floor(rawDamage * variance);
        finalDamage = Math.max(1, finalDamage);

        // 10. 构造 Tooltip 数据
        const tooltipData = {
            type: 'damage',
            source: isPlayerAttacking ? 'player' : 'enemy',
            dmgType: dmgType,
            originDef: originDef,
            effectiveDef: effectiveDef,
            mitigationPct: mitigationPct,
            penVal: penValue,
            penPct: ignoreDefPct,
            extraPenPct: extraDefModPct,
            finalAtkVal: finalAtkVal,
            dmgAfterMitigation: Math.floor(rawDamage / (isCrit ? critDmgMult : 1) / variance), // 还原折后基数
            critRate: critRate,
            isCrit: isCrit,
            critDmg: critDmgMult,
            variance: (variance * 100).toFixed(0) + '%',
            finalDamage: finalDamage,
            atkStats: atkStats // 传递原始攻击数据方便调试
        };

        // 11. 如果不是静默模式，打印日志并触发特效
        if (!isSilent) {
            this._logDamage(ctx, name, type, isPlayerAttacking, finalDamage, isCrit, tooltipData);
            this._handlePostAttack(ctx, attackerKey, defenderKey, finalDamage, dmgType, isCrit);

            if (!isPlayerAttacking && type === "普攻" && atkStats.toxAtk > 0) {
                window.player.status.toxicity = Math.min(100, (window.player.status.toxicity || 0) + Number(atkStats.toxAtk));
                CombatUI.updateTox(ctx);
                CombatUI.log(ctx, `> ⚠️ ${name} 附带剧毒！中毒 +${atkStats.toxAtk}`);
            }
            return finalDamage;
        } else {
            // 静默模式：返回对象包含数值和数据
            return { damage: finalDamage, data: tooltipData };
        }
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