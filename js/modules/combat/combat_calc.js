// js/modules/combat/combat_calc.js
// 职责：数值逻辑演算

const CombatCalc = {
    /** 执行一次完整的攻击行为计算 */
    performAttack: function(ctx, attackerName, atkStats, defStats, isPlayerAttacking) {
        return this.calcDamage(ctx, atkStats, defStats, isPlayerAttacking, "普攻", attackerName);
    },

    /** 核心伤害公式 */
    calcDamage: function(ctx, atkStats, defStats, isPlayerAttacking, type="普攻", attackerName=null) {
        const name = attackerName || (isPlayerAttacking ? "你" : ctx.enemy.name);
        const baseAtk = atkStats.atk || 1;
        let finalAtkVal = baseAtk;

        if (atkStats.skillMult) finalAtkVal = Math.floor(finalAtkVal * atkStats.skillMult);
        if (atkStats.skillFlat) finalAtkVal = finalAtkVal + atkStats.skillFlat;

        let defVal = defStats.def || 0;
        const spdAtk = atkStats.speed || 10;
        const spdDef = defStats.speed || 10;

        // --- 闪避判定 ---
        let rawDodgeRate = 0.05 + (spdDef - spdAtk) / 150;
        rawDodgeRate = Math.max(0, Math.min(0.60, rawDodgeRate));
        const accModifier = (atkStats.accuracy || 0) / 100;
        let finalDodgeRate = Math.max(0, rawDodgeRate - accModifier);

        if (Math.random() < finalDodgeRate) {
            const tip = `
                <div class="combat-tooltip-content">
                    <div class="tip-row"><span>基础闪避率</span><span>${(rawDodgeRate*100).toFixed(1)}%</span></div>
                    ${atkStats.accuracy > 0 ? `<div class="tip-row" style="color:#ff5252;"><span>敌方命中率</span><span>-${atkStats.accuracy}%</span></div>` : ''}
                    <div class="tip-divider"></div>
                    <div class="tip-row" style="color:#4caf50;"><span>最终闪避率</span><span>${(finalDodgeRate*100).toFixed(1)}%</span></div>
                </div>`;
            const span = `<span class="combat-tooltip-trigger" style="color:#aaa; cursor:help; border-bottom:1px dotted #ccc; position:relative;">✨闪避${tip}</span>`;
            ctx._log(`${name} 的${type}被 ${span} 了！`);
            return 0;
        }

        // --- 破甲与锐利度计算 ---
        const pen = atkStats.basePen || 0;
        const originDef = defVal;
        if (pen > 0) defVal = Math.max(0, defVal - pen);
        const retentionMultiplier = 100 / (100 + (atkStats.sharpness || 0));
        defVal = defVal * retentionMultiplier;

        // --- 减伤公式 ---
        const ARMOR_CONST = 100;
        const reductionMultiplier = ARMOR_CONST / (ARMOR_CONST + defVal);
        let rawDamage = finalAtkVal * reductionMultiplier;

        // --- 暴击判定 ---
        let critRate = isPlayerAttacking ? (0 + (atkStats.shen || 0) * 0.005) : 0.05;
        if (!isPlayerAttacking) {
            const r = ctx.enemy.template;
            if (r === "lord") critRate = 0.20; else if (r === "boss") critRate = 0.15; else if (r === "elite") critRate = 0.10;
        }
        const isCrit = Math.random() < critRate;
        if (isCrit) rawDamage *= 1.5;

        // 浮动与最终输出
        const variance = 0.95 + Math.random() * 0.1;
        let finalDamage = Math.floor(rawDamage * variance);
        finalDamage = Math.max(1, finalDamage);

        // 构建 Tooltip 文本 (为了保持原有样式，代码较长)
        const tooltipHtml = this._buildDamageTooltip(atkStats, defStats, finalAtkVal, baseAtk, originDef, defVal, pen, critRate, isCrit, finalDamage);

        const color = isPlayerAttacking ? "#d32f2f" : "#1976d2";
        const dmgSpan = `<span class="combat-tooltip-trigger" style="color:${color}; font-weight:bold; cursor:help; border-bottom:1px dotted ${color}; position:relative;">${finalDamage}${tooltipHtml}</span>`;

        ctx._log(`${name} ${type}造成 ${dmgSpan} 点伤害${isCrit ? " <b style='color:#ff9800'>[暴击!]</b>" : ""}`);

        // 处理敌方普攻带毒
        if (!isPlayerAttacking && type === "普攻" && atkStats.toxAtk > 0) {
            window.player.toxicity = Math.min(100, (window.player.toxicity || 0) + Number(atkStats.toxAtk));
            ctx._log(`> ⚠️ ${name} 的攻击附带剧毒！中毒 <span style="color:#9c27b0">+${atkStats.toxAtk}</span>`);
        }

        return finalDamage;
    },

    /** 获取包含 Buff 修正后的实时属性 */
    getDynamicStats: function(ctx, targetKey) {
        let base = {};
        if (targetKey === 'player') {
            const d = ctx.player.derived || ctx.player.attributes;
            base = { ...d, mp: ctx.currentPMp };
        } else {
            const s = ctx.enemy.stats || {};
            base = {
                atk: s.atk !== undefined ? s.atk : (ctx.enemy.atk || 0),
                def: s.def !== undefined ? s.def : (ctx.enemy.def || 0),
                speed: s.speed !== undefined ? s.speed : (ctx.enemy.speed || 0),
                accuracy: ctx.enemy.accuracy,
                basePen: ctx.enemy.basePen,
                toxAtk: ctx.enemy.toxAtk
            };
        }

        const myBuffs = ctx.buffs[targetKey];
        for (let attr in myBuffs) {
            if (base[attr] !== undefined && attr !== 'hp' && attr !== 'mp') base[attr] += myBuffs[attr].val;
        }
        base.atk = Math.max(0, base.atk); base.def = Math.max(0, base.def); base.speed = Math.max(0, base.speed);
        return base;
    },

    /** 构造伤害 Tooltip 的内部辅助 */
    _buildDamageTooltip: function(atkStats, defStats, finalAtkVal, baseAtk, originDef, defVal, pen, critRate, isCrit, finalDamage) {
        const sharpPct = Math.floor((1 - (100 / (100 + (atkStats.sharpness || 0)))) * 100);
        const reductionPct = Math.floor((1 - (100 / (100 + defVal))) * 100);

        return `
            <div class="combat-tooltip-content">
                <div class="tip-row"><span>🗡️ 最终攻击</span> <span>${Math.floor(finalAtkVal)}</span></div>
                ${atkStats.skillMult ? `<div class="tip-row tip-dim"><span>└ 基础</span> <span>${baseAtk} x ${atkStats.skillMult}</span></div>` : ''}
                <div class="tip-divider"></div>
                <div class="tip-row"><span>🛡️ 原始防御</span> <span>${originDef}</span></div>
                ${atkStats.sharpness > 0 ? `
                    <div class="tip-row" style="color:#ffb74d;"><span>✨ 锐利度</span> <span>${atkStats.sharpness} <span class="tip-dim">(-${sharpPct}%)</span></span></div>
                    <div class="tip-row tip-dim"><span>└ 有效防御</span> <span>${defVal.toFixed(1)} <span style="color:#ff5252;">(-${reductionPct}%)</span></span></div>
                ` : `<div class="tip-row"><span>└ 减伤率</span> <span class="tip-dim">-${reductionPct}%</span></div>`}
                ${pen > 0 ? `<div class="tip-row" style="color:#ff5252;"><span>⚡ 穿甲</span> <span>${pen}</span></div>` : ''}
                <div class="tip-divider"></div>
                <div class="tip-row"><span>🎯 暴击率</span> <span>${(critRate*100).toFixed(1)}%</span></div>
                ${isCrit ? `<div class="tip-row tip-crit"><span>💥 暴击伤害</span> <span>x1.5</span></div>` : ''}
                <div class="tip-divider"></div>
                <div class="tip-row tip-total"><span>最终伤害</span> <span>${finalDamage}</span></div>
            </div>`;
    }
};