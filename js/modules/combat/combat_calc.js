// js/modules/combat/combat_calc.js
// 职责：数值逻辑演算、属性动态获取、词条全量支持
// 升级：V5.0 引入战斗风格(Module)与护甲类型(Armor)的克制矩阵 & 部位打击系统

const CombatCalc = {

    /** * 战斗风格克制矩阵 (Attacker Module vs Defender Armor)
     * 行：攻击风格 (Agile, Balanced, Reach, Heavy, Ranged, Relic)
     * 列：护甲类型 (plate, heavy, light, leather, cloth, none)
     */
    STYLE_MATRIX: {
        //                板甲    重甲    轻甲    皮甲    布甲    无甲
        'Agile':    { plate:0.6, heavy:0.8, light:1.0, leather:1.1, cloth:1.3, none:1.5 }, // 轻盈
        'Balanced': { plate:0.8, heavy:0.9, light:1.0, leather:1.1, cloth:1.2, none:1.3 }, // 均衡
        'Reach':    { plate:0.9, heavy:1.0, light:1.1, leather:1.1, cloth:1.0, none:1.2 }, // 长兵
        'Heavy':    { plate:1.3, heavy:1.2, light:1.1, leather:0.9, cloth:0.7, none:1.1 }, // 重型
        'Ranged':   { plate:0.7, heavy:0.8, light:1.0, leather:1.2, cloth:1.4, none:1.5 }, // 远射
        'Relic':    { plate:1.1, heavy:1.0, light:0.9, leather:0.8, cloth:0.6, none:1.2 }  // 法宝
    },

    /** 护甲类型中文映射 (用于Tooltip) */
    ARMOR_NAME_MAP: {
        'plate': '板甲', 'heavy': '重甲', 'light': '轻甲',
        'leather': '皮甲', 'cloth': '布甲', 'none': '无甲'
    },

    /** 攻击模组中文映射 */
    MODULE_NAME_MAP: {
        'Agile': '轻盈', 'Balanced': '均衡', 'Reach': '长兵',
        'Heavy': '重型', 'Ranged': '远射', 'Relic': '法宝'
    },

    /** 获取实时属性 (保持不变) */
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
            const s = e.stats || {};
            base = {
                hp: ctx.currentEHp, hpMax: e.maxHp || e.hp,
                speed: s.speed!==undefined?s.speed:(e.speed||10),
                atk: s.atk!==undefined?s.atk:(e.atk||10),
                def: s.def!==undefined?s.def:(e.def||0),
                phy_atk: s.phy_atk||s.atk||e.atk||10, mag_atk: s.mag_atk||s.atk||e.atk||10,
                phy_def: s.phy_def||s.def||e.def||0, mag_def: s.mag_def||s.def||e.def||0,
                crit: s.crit !== undefined ? s.crit : (e.crit || 0),
                mag_crit: s.mag_crit !== undefined ? s.mag_crit : (e.crit || 0),
                basePen: e.basePen||0, toxAtk: e.toxAtk||0, accuracy: e.accuracy||0,
                toxicity: e.toxicity||0
            };
        }

        // 2. 应用 Buff 修正
        const myBuffs = ctx.buffs[targetKey];
        if (myBuffs) {
            const attrKeys = Object.keys(base).filter(k => k !== 'hp' && k !== 'mp' && k !== 'hpMax');
            if (!attrKeys.includes('atk')) attrKeys.push('atk');
            if (!attrKeys.includes('def')) attrKeys.push('def');

            attrKeys.forEach(attr => {
                const buffList = myBuffs[attr];
                if (!buffList || !Array.isArray(buffList)) return;

                let flatBonus = 0;
                let pctBonus = 0;

                buffList.forEach(b => {
                    if (b.valType === 1) pctBonus += b.val;
                    else flatBonus += b.val;
                });

                const applyLogic = (baseVal) => {
                    const pctValue = Math.floor(baseVal * pctBonus);
                    return baseVal + flatBonus + pctValue;
                };

                if (base[attr] !== undefined) base[attr] = applyLogic(base[attr]);

                if (attr === 'atk') {
                    base.phy_atk = applyLogic(base.phy_atk);
                    base.mag_atk = applyLogic(base.mag_atk);
                }
                if (attr === 'def') {
                    base.phy_def = applyLogic(base.phy_def);
                    base.mag_def = applyLogic(base.mag_def);
                }
            });
        }

        // 3. 应用词条修正
        this._applyStatMods(ctx, targetKey, base);

        // 4. 保底处理
        base.phy_atk = Math.max(1, base.phy_atk);
        base.mag_atk = Math.max(1, base.mag_atk);
        if (base.speed !== undefined) base.speed = Math.max(1, base.speed);

        return base;
    },

    /** 执行攻击 (保持不变，但日志会变更) */
    performAttack: function(ctx, attackerName, atkStats, defStats, isPlayerAttacking) {

        // 玩家法宝武器智能普攻判定
        if (isPlayerAttacking && ctx.player && ctx.player.equipment && ctx.player.equipment.weapon) {
            const weapon = ctx.player.equipment.weapon;
            if (weapon.subType) {
                const types = (typeof weaponTypes !== 'undefined') ? weaponTypes : (window.weaponTypes || []);
                const typeData = types.find(t => t.type === weapon.subType);
                if (typeData && typeData.module === 'Relic') {
                    const phy = atkStats.phy_atk || 0;
                    const mag = atkStats.mag_atk || 0;
                    if (mag > phy) {
                        atkStats.damageType = 'mag';
                    }
                }
            }
        }

        let totalDamage = this.calcDamage(ctx, atkStats, defStats, isPlayerAttacking, "普攻", attackerName);

        // 连击逻辑
        if (isPlayerAttacking && ctx.entries && ctx.entries.player) {
            const entries = ctx.entries.player;
            const doubleEntry = entries.find(e => e.id === 'double_strike');

            if (doubleEntry) {
                if (Math.random() * 100 < doubleEntry.val) {
                    setTimeout(() => {
                        CombatUI.log(ctx, `<span style="color:#ff9800; font-weight:bold;">⚡ [连击] 剑光一闪，残影追击！</span>`);
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

    /** 核心伤害公式 (修改：增加部位判定与风格克制) */
    calcDamage: function(ctx, atkStats, defStats, isPlayerAttacking, type="普攻", attackerName=null, isSilent=false) {
        const name = attackerName || (isPlayerAttacking ? "你" : ctx.enemy.name);
        const attackerKey = isPlayerAttacking ? 'player' : 'enemy';
        const defenderKey = isPlayerAttacking ? 'enemy' : 'player';

        // 1. 确定伤害类型
        let dmgType = atkStats.damageType || 'phy';
        if ((type === "技能" || type.includes("周期")) && !atkStats.damageType) {
            dmgType = 'phy';
        }

        // 2. 提取面板
        let panelAtk = (dmgType === 'phy') ? atkStats.phy_atk : atkStats.mag_atk;
        let panelDef = (dmgType === 'phy') ? defStats.phy_def : defStats.mag_def;

        let penValue = (dmgType === 'phy') ? (atkStats.sharpness || 0) : (atkStats.penetration || 0);
        if (atkStats.basePen) penValue += atkStats.basePen;

        // 3. 计算面板攻击力
        let finalAtkVal = panelAtk;
        if (atkStats.skillMult !== undefined) {
            finalAtkVal = Math.floor(finalAtkVal * atkStats.skillMult);
        }
        if (atkStats.skillFlat) {
            finalAtkVal = finalAtkVal + atkStats.skillFlat;
        }

        // 4. 闪避判定
        if (!isSilent) {
            const spdAtk = atkStats.speed;
            const spdDef = defStats.speed;
            let accMod = (atkStats.accuracy || 0);
            let rawDodgeRate = Math.max(0, 0.05 + (spdDef - spdAtk) / 200 - (accMod/100));
            let finalDodgeRate = Math.min(0.5, rawDodgeRate);

            if (Math.random() < finalDodgeRate) {
                this._triggerOnDodge(ctx, defenderKey);
                const dodgeData = { type: 'evasion', source: isPlayerAttacking ? 'enemy' : 'player', final: (finalDodgeRate * 100).toFixed(1), base: 5, acc: accMod };
                this._logDodge(ctx, name, type, dodgeData);
                return 0;
            }
        }

        // 5. 防御穿透计算
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

        // 7. 词条修正 (斩杀/虚弱)
        const execute = this._findEntry(ctx, attackerKey, 'execute');
        if (execute && (defStats.hp / defStats.hpMax) < 0.3) rawDamage *= (1 + execute.val / 100);
        const soft = this._findEntry(ctx, attackerKey, 'soft');
        if (soft) rawDamage *= (1 - soft.val / 100);

        // 8. 暴击
        let critRate = (dmgType === 'phy') ? atkStats.crit : atkStats.mag_crit;
        critRate = critRate * 0.01;
        if (isPlayerAttacking) critRate += (atkStats.shen || 0) * 0.05;
        critRate = Math.min(1.0, critRate);

        let isCrit = false;
        let critDmgMult = 1.5;

        if (!isSilent && Math.random() < critRate) {
            const critUp = this._findEntry(ctx, attackerKey, 'crit_dmg_up');
            if (critUp) critDmgMult += (critUp.val / 100);
            isCrit = true;
            rawDamage *= critDmgMult;
        }

        // ===============================================
        // 【核心新增】 9. 战斗风格与护甲克制 (Style Matrix)
        // ===============================================

        // A. 获取攻击模组 (Module)
        const atkModule = this._getAtkModule(ctx, isPlayerAttacking);

        // B. 获取受击部位与护甲类型 (Armor)
        const hitInfo = this._getDefTypeAndLoc(ctx, !isPlayerAttacking);
        const armorType = hitInfo.defType;
        const hitLocName = hitInfo.locName;

        // C. 查表获取系数
        let styleMult = 1.0;
        if (this.STYLE_MATRIX[atkModule] && this.STYLE_MATRIX[atkModule][armorType]) {
            styleMult = this.STYLE_MATRIX[atkModule][armorType];
        }

        // D. 应用系数
        rawDamage *= styleMult;

        // ===============================================

        // 10. 浮动
        const variance = 0.95 + Math.random() * 0.1;
        let finalDamage = Math.floor(rawDamage * variance);
        finalDamage = Math.max(1, finalDamage);

        // 11. 构造 Tooltip
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
            dmgAfterMitigation: Math.floor(rawDamage / styleMult / (isCrit ? critDmgMult : 1)),critRate: critRate,
            isCrit: isCrit,
            critDmg: critDmgMult,
            variance: (variance * 100).toFixed(0) + '%',

            // 新增字段用于显示
            atkModule: this.MODULE_NAME_MAP[atkModule] || atkModule,
            defArmor: this.ARMOR_NAME_MAP[armorType] || armorType,
            hitLoc: hitLocName,
            styleMult: styleMult.toFixed(1), // 显示如 "1.5"

            finalDamage: finalDamage
        };

        if (!isSilent) {
            // 传入 hitLocName 供日志使用
            this._logDamage(ctx, name, type, isPlayerAttacking, finalDamage, isCrit, tooltipData, hitLocName);
            this._handlePostAttack(ctx, attackerKey, defenderKey, finalDamage, dmgType, isCrit);

            if (!isPlayerAttacking && type === "普攻" && atkStats.toxAtk > 0) {
                window.player.status.toxicity = Math.min(100, (window.player.status.toxicity || 0) + Number(atkStats.toxAtk));
                CombatUI.updateTox(ctx);
                CombatUI.log(ctx, `> ⚠️ ${name} 附带剧毒！中毒 +${atkStats.toxAtk}`);
            }
            return finalDamage;
        } else {
            return { damage: finalDamage, data: tooltipData };
        }
    },

    // --- 【新增】辅助函数：获取攻击者的战斗模组 ---
    _getAtkModule: function(ctx, isPlayer) {
        if (isPlayer) {
            // 玩家：查武器
            const weapon = ctx.player.equipment ? ctx.player.equipment.weapon : null;
            if (weapon && weapon.subType) {
                const types = (typeof weaponTypes !== 'undefined') ? weaponTypes : (window.weaponTypes || []);
                const data = types.find(t => t.type === weapon.subType);
                if (data && data.module) return data.module;
            }
            return 'Balanced'; // 空手或未找到默认均衡
        } else {
            // 敌人：查 atkStats (例如 "Bal", "Agile")
            // 注意：你的JSON里写的是 "Bal"，但矩阵key是 "Balanced"，这里做个映射兼容
            const raw = ctx.enemy.atkStats || 'Balanced';
            const map = { 'Bal': 'Balanced', 'Agile': 'Agile', 'Reach': 'Reach', 'Heavy': 'Heavy', 'Range': 'Ranged', 'Relic': 'Relic' };
            return map[raw] || raw || 'Balanced';
        }
    },

    // --- 【新增】辅助函数：获取防御者的护甲类型与受击部位 ---
    _getDefTypeAndLoc: function(ctx, isPlayer) {
        if (isPlayer) {
            // 玩家：随机 roll 头部/身体/脚部
            const r = Math.random();
            let slot = 'body';
            let locName = '身体';

            if (r < 0.25) { slot = 'head'; locName = '头部'; }
            else if (r < 0.85) { slot = 'body'; locName = '身躯'; } // 60% 概率打身体
            else { slot = 'feet'; locName = '腿部'; }

            // 检查装备
            const equip = ctx.player.equipment || {};
            const item = equip[slot];

            // 如果没穿，defType 为 'none'
            const defType = (item && item.defType) ? item.defType : 'none';
            return { defType, locName };

        } else {
            // 敌人：直接读取 defType，部位显示为"要害"或"本体"
            const defType = ctx.enemy.defType || 'none';
            return { defType, locName: '要害' };
        }
    },

    // --- 词条处理核心 (保持不变) ---
    _applyStatMods: function(ctx, targetKey, base) {
        if (!ctx.entries || !ctx.entries[targetKey]) return;
        const entries = ctx.entries[targetKey];
        entries.forEach(entry => {
            if (entry.id === 'sharpness_plus') base.sharpness = (base.sharpness || 0) + entry.val;
            if (entry.id === 'penetration_plus') base.penetration = (base.penetration || 0) + entry.val;
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
        attEntries.forEach(entry => {
            if (entry.id === 'lifesteal' && dmgType === 'phy') this._heal(ctx, attackerKey, Math.floor(damage * entry.val / 100), "吸血", damage, entry.val);
            if (entry.id === 'spellvamp' && dmgType === 'mag') this._heal(ctx, attackerKey, Math.floor(damage * entry.val / 100), "魔饮", damage, entry.val);
        });
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
        const span = `<span class="combat-tooltip-trigger" style="color:#4caf50; cursor:help; border-bottom:1px dotted #4caf50;" onmouseenter="window.showCombatTooltip(event, '${tooltipData}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">[${reason}]</span>`;
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
        const span = `<span class="combat-tooltip-trigger" style="color:#d32f2f; cursor:help; border-bottom:1px dotted #d32f2f;" onmouseenter="window.showCombatTooltip(event, '${tooltipData}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">[${reason}]</span>`;
        CombatUI.log(ctx, `> ${span} 受到 ${amount} 伤害`);
        CombatUI.updateStats(ctx);
    },

    _logDodge: function(ctx, name, type, data) {
        const encoded = encodeURIComponent(JSON.stringify(data));
        const span = `<span class="combat-tooltip-trigger" style="color:#aaa; cursor:help; border-bottom:1px dotted #ccc;" onmouseenter="window.showCombatTooltip(event, '${encoded}')" onmouseleave="window.hideTooltip()" onmousemove="window.moveTooltip(event)">闪避</span>`;
        CombatUI.log(ctx, `${name} 的${type}被 ${span} 了！`);
    },

    // 修改日志输出，支持显示部位
    _logDamage: function(ctx, name, type, isPlayer, dmg, isCrit, data, hitLoc) {
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

        // 构造日志：XXX 普攻 [部位] 造成 XX 伤害
        // 只有在有明确部位时显示部位
        const locStr = (hitLoc && hitLoc !== '要害') ? ` <span style="color:#aaa;">[${hitLoc}]</span>` : "";

        CombatUI.log(ctx, `${name} ${type}${locStr} 造成 ${dmgSpan} 点伤害${critStr}`);
    }
};

window.CombatCalc = CombatCalc;