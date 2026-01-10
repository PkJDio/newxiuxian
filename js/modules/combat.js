// js/modules/combat.js
// 战斗系统 v7.6 (DOM性能优化版：缓存引用 + 日志回收)

const Combat = {
    enemy: null,
    player: null,
    logs: [],
    maxTurns: 50,
    onWinCallback: null,

    // 状态控制
    isStopped: false,
    isPaused: false,
    isEnded: false,
    timer: null,

    // 冷却与回合
    itemCDs: [0, 0, 0],
    skillCDs: {},
    currentTurn: 1,
    turnSpeed: 1000,

    // 实时数据
    currentPHp: 0,
    currentPMp: 0,
    currentEHp: 0,

    // Buff系统
    buffs: {
        player: {},
        enemy: {}
    },

    // 【优化】UI 引用缓存池
    uiRefs: {},

    _patchEnemyData: function(enemy) {
        if (enemy.basePen === undefined) {
            const tmplKey = enemy.template || "minion";
            if (typeof ENEMY_TEMPLATES !== 'undefined' && ENEMY_TEMPLATES[tmplKey]) {
                enemy.basePen = ENEMY_TEMPLATES[tmplKey].basePen;
            }
        }
        if (enemy.toxAtk === undefined) {
            const db = window.enemies || (window.GAME_DB ? window.GAME_DB.enemies : []);
            if (db && db.length > 0) {
                const template = db.find(e => e.id === enemy.id);
                if (template) {
                    if (template.stats && template.stats.toxicity) enemy.toxAtk = template.stats.toxicity;
                    if (template.basePen !== undefined) enemy.basePen = template.basePen;
                }
            }
        }
        if (enemy.basePen === undefined) enemy.basePen = 0;
        if (enemy.toxAtk === undefined) enemy.toxAtk = 0;
        if (!enemy.stats) enemy.stats = {};
        if (enemy.atk !== undefined && enemy.stats.atk === undefined) enemy.stats.atk = enemy.atk;
        if (enemy.def !== undefined && enemy.stats.def === undefined) enemy.stats.def = enemy.def;
        if (enemy.speed !== undefined && enemy.stats.speed === undefined) enemy.stats.speed = enemy.speed;
    },

    // 【优化】初始化 DOM 缓存
    _initUICache: function(logId) {
        this.uiRefs = {
            logContainer: document.getElementById(logId),

            // 玩家状态
            pHp: document.getElementById('combat_p_hp'),
            pHpBar: document.getElementById('combat_p_hp_bar'),
            pMp: document.getElementById('combat_p_mp'),
            pMpBar: document.getElementById('combat_p_mp_bar'),
            pToxBar: document.getElementById('combat_p_tox_bar'),
            pToxVal: document.getElementById('combat_p_tox_val'),

            // 敌人状态
            eHp: document.getElementById('combat_e_hp'),
            eHpBar: document.getElementById('combat_e_hp_bar'),
            eToxBar: document.getElementById('combat_e_tox_bar'),
            eToxVal: document.getElementById('combat_e_tox_val'),

            // 属性栏 (用于 Buff 更新)
            pAttr: {
                atk: document.getElementById('p_attr_atk'),
                def: document.getElementById('p_attr_def'),
                spd: document.getElementById('p_attr_spd')
            },
            eAttr: {
                atk: document.getElementById('e_attr_atk'),
                def: document.getElementById('e_attr_def'),
                spd: document.getElementById('e_attr_spd')
            }
        };
    },

    start: function(enemyObj, onWin, logId) {
        if (!window.player) return;

        this._injectStyles();

        // 【优化】先初始化缓存
        this._initUICache(logId);

        this.enemy = JSON.parse(JSON.stringify(enemyObj));
        this._patchEnemyData(this.enemy);

        this.player = window.player;
        if (this.player.toxicity === undefined) this.player.toxicity = 0;
        if (this.player.toxicity < 100) this.player.hasDeepPoison = false;

        this.logs = [];
        this.onWinCallback = onWin;
        this.logContainerId = logId; // 保留 ID 以备不时之需

        this.isStopped = false;
        this.isPaused = false;
        this.isEnded = false;
        this.itemCDs = [0, 0, 0];
        this.skillCDs = {};
        this.buffs = { player: {}, enemy: {} };
        this.turnSpeed = 1000;

        const p = this.player.derived || this.player.attributes;
        this.currentPHp = p.hp !== undefined ? p.hp : (p.maxHp || 100);
        this.currentPMp = p.mp !== undefined ? p.mp : (p.maxMp || 100);

        const eStatHp = (this.enemy.stats && this.enemy.stats.hp !== undefined) ? this.enemy.stats.hp : 0;
        this.currentEHp = eStatHp || this.enemy.hp || 100;

        this.enemy.maxHp = this.currentEHp;
        if (this.enemy.stats) this.enemy.stats.hp = this.currentEHp;

        this.currentTurn = 1;

        this._refreshItemCDUI();
        this._refreshSkillCDUI();
        this._updateToxUI();
        this._updateUIStats();

        this.timer = setTimeout(() => {
            this._runCombatLoopAsync();
        }, 500);
    },

    stop: function() {
        this.isStopped = true;
        this.isEnded = true;
        if (this.timer) clearTimeout(this.timer);
        this._log(`<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">🏃 你看准时机，脚底抹油溜之大吉！</div>`);
        this._syncPlayerStatus();
        if (window.saveGame) window.saveGame();
        this._renderEnd("逃跑");
        const footer = document.getElementById('map_combat_footer');
        if (footer) footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">关闭</button>`;
        this.clearCache();
    },

    togglePause: function() {
        if (this.isStopped || this.isEnded) return;
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('combat_btn_pause');
        if (btn) {
            btn.innerHTML = this.isPaused ? "▶ 继续战斗" : "⏸ 暂停";
            btn.style.color = this.isPaused ? "#388e3c" : "#333";
        }
        if (!this.isPaused) {
            this._log(`<div style="color:#888; font-size:12px; text-align:center;">--- 战斗继续 ---</div>`);
            this._runCombatLoopAsync();
        } else {
            if (this.timer) clearTimeout(this.timer);
            this._log(`<div style="color:#d32f2f; font-weight:bold; font-size:12px; text-align:center;">--- 战斗已暂停 ---</div>`);
        }
    },

    changeSpeed: function(delta) {
        let newSpeed = this.turnSpeed + delta;
        if (newSpeed < 500) newSpeed = 500;
        if (newSpeed > 3000) newSpeed = 3000;
        this.turnSpeed = newSpeed;
        const spdEl = document.getElementById('combat_speed_display');
        if(spdEl) spdEl.innerText = (1000 / this.turnSpeed).toFixed(1) + "x";
    },

    useConsumable: function(slotIndex) {
        if (!this._canAct()) return;
        if (this.itemCDs[slotIndex] > 0) return;

        const itemId = this.player.consumables[slotIndex];
        if (!itemId) return;
        const invSlot = this.player.inventory.find(i => i.id === itemId);
        if (!invSlot || invSlot.count <= 0) return;

        const itemData = window.GAME_DB.items.find(i => i.id === itemId);
        if (!itemData) return;

        invSlot.count--;
        if (invSlot.count <= 0) {
            this.player.inventory = this.player.inventory.filter(slot => slot.count > 0);
            this.player.consumables[slotIndex] = null;
            if (window.MapCamera && MapCamera.updateSidebar) MapCamera.updateSidebar();
        } else {
            const countEl = document.getElementById(`combat_item_count_${slotIndex}`);
            if(countEl) countEl.innerText = `x${invSlot.count}`;
        }

        const subType = (itemData.subType || itemData.subtype || "").toLowerCase();
        if (subType === 'poison') {
            this._applyPoisonToEnemy(itemData);
        } else {
            this._applyItemEffects(itemData, this.player);
        }

        this.itemCDs[slotIndex] = 4;
        this._refreshItemCDUI();
        this._syncPlayerStatus();
        if (window.saveGame) window.saveGame();
        this._updateUIStats();
        this._updateToxUI();
    },

    useSkill: function(bookId, skillIdx) {
        if (!this._canAct()) return;
        if (this.skillCDs[bookId] > 0) return;

        const book = window.GAME_DB.items.find(i => i.id === bookId);
        if (!book || !book.action) return;

        const action = book.action;
        if (this.currentPMp < action.mpCost) {
            if(window.showToast) window.showToast("内力不足！");
            return;
        }

        this.currentPMp -= action.mpCost;
        this.skillCDs[bookId] = action.cd + 1;
        this._refreshSkillCDUI();

        const pStats = this._getDynamicStats('player');
        const eStats = this._getDynamicStats('enemy');

        const skillAttacker = {
            ...pStats,
            skillMult: action.dmgMult || 1.0,
            skillName: action.name
        };

        this._log(`> 你施展了 <b style="color:#ffb74d;">${action.name}</b>！`);
        const dmg = this._calcAndApplyDamage(skillAttacker, eStats, true, "技能");
        this.currentEHp -= dmg;

        this._updateUIStats();
    },

    _canAct: function() {
        if (this.isStopped || this.isEnded) {
            if(window.showToast) window.showToast("战斗已结束");
            return false;
        }
        if (this.isPaused) {
            if(window.showToast) window.showToast("暂停中");
            return false;
        }
        return true;
    },

    _runCombatLoopAsync: function() {
        if (this.isStopped || this.isPaused) return;

        let pStats = this._getDynamicStats('player');
        let eStats = this._getDynamicStats('enemy');

        if (this.currentTurn === 1) this._log(`遭遇了 ${this.enemy.name} (HP: ${this.currentEHp})！`);

        if (this.currentTurn > this.maxTurns) {
            this._log("双方精疲力尽，各自罢兵...");
            this._handleEnd("平局");
            return;
        }

        this._log(`<div class="turn-divider">--- 第 ${this.currentTurn} 回合 ---</div>`);

        for(let i=0; i<3; i++) if (this.itemCDs[i] > 0) this.itemCDs[i]--;
        for(let k in this.skillCDs) if (this.skillCDs[k] > 0) this.skillCDs[k]--;
        this._refreshItemCDUI();
        this._refreshSkillCDUI();

        const playerFirst = pStats.speed >= eStats.speed;
        let isWin = false; let isDead = false;

        if (playerFirst) {
            this.currentEHp -= this._performAttack("你", pStats, eStats, true);
            if (this.currentEHp <= 0) isWin = true;
            else {
                this._enemyAction(eStats, pStats);
                if (this.currentPHp <= 0) isDead = true;
            }
        } else {
            this._enemyAction(eStats, pStats);
            if (this.currentPHp <= 0) isDead = true;
            else {
                this.currentEHp -= this._performAttack("你", pStats, eStats, true);
                if (this.currentEHp <= 0) isWin = true;
            }
        }

        this.currentPHp = Math.max(0, this.currentPHp);
        this.currentEHp = Math.max(0, this.currentEHp);

        if (!isWin && !isDead) {
            isWin = this._processPoisonOnEnemy();
            isDead = this._processPoisonOnPlayer();
        }

        this._processBuffs();

        this.enemy.hp = this.currentEHp;
        this._syncPlayerStatus();
        this._updateUIStats();
        this._updateToxUI();

        if (isWin) { this._handleVictory(); return; }
        if (isDead) { this._handleDefeat(); return; }

        this.currentTurn++;
        if (!this.isPaused) {
            this.timer = setTimeout(() => {
                this._runCombatLoopAsync();
            }, this.turnSpeed);
        }
    },

    _enemyAction: function(eStats, pStats) {
        let actionDone = false;
        if (!this.enemy.skills || this.enemy.skills.length === 0) {
        } else {
            console.group("[Enemy Skill Check]");
            for (let skill of this.enemy.skills) {
                let canCast = true;
                if (skill.type === 2 && this.buffs.player[skill.debuffAttr]) canCast = false;
                else if (skill.type === 3 && this.buffs.enemy[skill.buffAttr]) canCast = false;

                if (!canCast) continue;

                if (Math.random() > skill.rate) continue;

                if (skill.type === 1) {
                    this._log(`${this.enemy.name} 施展了 <b style="color:#d32f2f;">${skill.id}</b>！`);
                    let skillAtk = { ...eStats, skillFlat: (skill.damage || 0), skillName: skill.id };
                    const dmg = this._calcAndApplyDamage(skillAtk, pStats, false, "技能");
                    this.currentPHp -= dmg;
                    actionDone = true;
                    break;
                }
                else if (skill.type === 2) {
                    this._log(`${this.enemy.name} 施展了 <b style="color:#f57f17;">${skill.id}</b>！`);
                    this._applyBuff('player', skill.debuffAttr, -skill.debuffValue, skill.debuffTimes, 'debuff', skill.id);
                    actionDone = true;
                    break;
                }
                else if (skill.type === 3) {
                    this._log(`${this.enemy.name} 施展了 <b style="color:#388e3c;">${skill.id}</b>！`);
                    this._applyBuff('enemy', skill.buffAttr, skill.buffValue, skill.buffTimes, 'buff', skill.id);
                    actionDone = true;
                    break;
                }
            }
            console.groupEnd();
        }

        if (!actionDone) {
            this.currentPHp -= this._performAttack(this.enemy.name, eStats, pStats, false);
        }
    },

    _performAttack: function(attackerName, atkStats, defStats, isPlayerAttacking) {
        return this._calcAndApplyDamage(atkStats, defStats, isPlayerAttacking, "普攻", attackerName);
    },

    _calcAndApplyDamage: function(atkStats, defStats, isPlayerAttacking, type="普攻", attackerName=null) {
        const name = attackerName || (isPlayerAttacking ? "你" : this.enemy.name);

        console.group(`[Damage Calc] ${name} (${type})`);
        console.log("Attacker Stats:", atkStats);
        console.log("Defender Stats:", defStats);

        const baseAtk = atkStats.atk || 1;
        let finalAtkVal = baseAtk;

        if (atkStats.skillMult) finalAtkVal = Math.floor(finalAtkVal * atkStats.skillMult);
        if (atkStats.skillFlat) finalAtkVal = finalAtkVal + atkStats.skillFlat;

        console.log(`> Base Atk: ${baseAtk}, Final Atk: ${finalAtkVal}`);

        let defVal = defStats.def || 0;
        const spdAtk = atkStats.speed || 10;
        const spdDef = defStats.speed || 10;

        let dodgeRate = 0.05 + (spdDef - spdAtk) / 150;
        dodgeRate = Math.max(0, Math.min(0.60, dodgeRate));

        if (Math.random() < dodgeRate) {
            const dodgePct = (dodgeRate * 100).toFixed(1);
            const tip = `<div class="combat-tooltip-content"><div class="tip-row"><span>闪避率</span><span>${dodgePct}%</span></div></div>`;
            const span = `<span class="combat-tooltip-trigger" style="color:#aaa; cursor:help; border-bottom:1px dotted #ccc; position:relative;">✨闪避${tip}</span>`;
            this._log(`${name} 的${type}被 ${span} 了！`);
            console.groupEnd();
            return 0;
        }

        const sharpness = atkStats.sharpness || 0;
        const pen = atkStats.basePen || 0;
        const originDef = defVal;
        if (pen > 0) {
            defVal = Math.max(0, defVal - pen);
            console.log(`> Pen: ${pen}, Def reduced from ${originDef} to ${defVal}`);
        }

        const retentionMultiplier = 100 / (100 + sharpness);
        defVal = defVal * retentionMultiplier;

        const ARMOR_CONST = 100;
        const reductionMultiplier = ARMOR_CONST / (ARMOR_CONST + defVal);
        let rawDamage = finalAtkVal * reductionMultiplier;
        const reductionPercent = Math.floor((1 - reductionMultiplier) * 100);

        console.log(`> Dmg Reduct: ${(reductionPercent)}% (Mult: ${reductionMultiplier.toFixed(3)})`);
        console.log(`> Raw Damage: ${rawDamage.toFixed(2)}`);

        let critRate = 0;
        if (isPlayerAttacking) {
            const shen = atkStats.shen || 0;
            critRate = 0 + (shen * 0.005);
        } else {
            const rank = this.enemy.template || "minion";
            if (rank === "lord") critRate = 0.20;
            else if (rank === "boss") critRate = 0.15;
            else if (rank === "elite") critRate = 0.10;
            else critRate = 0.05;
        }

        const isCrit = Math.random() < critRate;
        if (isCrit) rawDamage = rawDamage * 1.5;

        const variance = 0.95 + Math.random() * 0.1;
        let finalDamage = Math.floor(rawDamage * variance);
        finalDamage = Math.max(1, finalDamage);

        console.groupEnd();

        const sharpEffectPct = Math.floor((1 - (100 / (100 + (atkStats.sharpness || 0)))) * 100);
        const penHtml = pen > 0 ? `<div class="tip-row" style="color:#ff5252;"><span>⚡ 穿甲</span> <span>${pen}</span></div>` : '';
        const critPct = (critRate * 100).toFixed(1);

        const tooltipHtml = `
            <div class="combat-tooltip-content">
                <div class="tip-row"><span>🗡️ 最终攻击</span> <span>${Math.floor(finalAtkVal)}</span></div>
                ${atkStats.skillMult ? `<div class="tip-row tip-dim"><span>└ 基础</span> <span>${baseAtk} x ${atkStats.skillMult}</span></div>` : ''}
                <div class="tip-divider"></div>
                <div class="tip-row"><span>🛡️ 原始防御</span> <span>${originDef}</span></div>
                ${atkStats.sharpness > 0 ? `
                    <div class="tip-row" style="color:#ffb74d;"><span>✨ 锐利度</span> <span>${atkStats.sharpness} <span class="tip-dim">(-${sharpEffectPct}%)</span></span></div>
                    <div class="tip-row tip-dim"><span>└ 有效防御</span> <span>${defVal.toFixed(1)} <span style="color:#ff5252;">(-${reductionPercent}%)</span></span></div>
                ` : `<div class="tip-row"><span>└ 减伤率</span> <span class="tip-dim">-${reductionPercent}%</span></div>`}
                ${penHtml}
                <div class="tip-divider"></div>
                <div class="tip-row"><span>🎯 暴击率</span> <span>${critPct}%</span></div>
                ${isCrit ? `<div class="tip-row tip-crit"><span>💥 暴击伤害</span> <span>x1.5</span></div>` : ''}
                <div class="tip-divider"></div>
                <div class="tip-row tip-total"><span>最终伤害</span> <span>${finalDamage}</span></div>
            </div>`;

        const color = isPlayerAttacking ? "#d32f2f" : "#1976d2";
        const critText = isCrit ? " <b style='color:#ff9800'>[暴击!]</b>" : "";
        const dmgSpan = `<span class="combat-tooltip-trigger" style="color:${color}; font-weight:bold; cursor:help; border-bottom:1px dotted ${color}; position:relative;">${finalDamage}${tooltipHtml}</span>`;

        this._log(`${name} ${type}造成 ${dmgSpan} 点伤害${critText}`);

        if (!isPlayerAttacking && type === "普攻") {
            const tox = atkStats.toxAtk;
            if (tox && Number(tox) > 0) {
                let addTox = Number(tox);
                let newTox = Math.min(100, (window.player.toxicity || 0) + addTox);
                window.player.toxicity = newTox;
                this._log(`> ⚠️ ${name} 的攻击附带剧毒！中毒 <span style="color:#9c27b0">+${addTox}</span>`);
            }
        }

        return finalDamage;
    },

    _getDynamicStats: function(targetKey) {
        let base = {};
        if (targetKey === 'player') {
            const d = this.player.derived || this.player.attributes;
            base = { ...d, mp: this.currentPMp };
        } else {
            const s = this.enemy.stats || {};
            const root = this.enemy;
            base = {
                ...s,
                atk: (s.atk !== undefined ? s.atk : (root.atk || 0)),
                def: (s.def !== undefined ? s.def : (root.def || 0)),
                speed: (s.speed !== undefined ? s.speed : (root.speed || 0)),
                hp: this.currentEHp,
                toxAtk: this.enemy.toxAtk,
                basePen: this.enemy.basePen
            };
        }

        const myBuffs = this.buffs[targetKey];
        for (let attr in myBuffs) {
            if (base[attr] !== undefined) base[attr] += myBuffs[attr].val;
        }

        if (base.atk < 0) base.atk = 0;
        if (base.def < 0) base.def = 0;
        if (base.speed < 0) base.speed = 0;

        return base;
    },

    _applyBuff: function(targetKey, attr, val, turns, type, name) {
        const color = type === 'debuff' ? '#f57f17' : '#388e3c';
        const sign = val > 0 ? '+' : '';
        this.buffs[targetKey][attr] = { val, turns, type, name };

        const targetName = targetKey === 'player' ? '你' : this.enemy.name;
        const attrMap = { 'atk': '攻击', 'def': '防御', 'speed': '速度', 'hp': '生命', 'mp': '内力' };
        const attrName = attrMap[attr] || attr;

        this._log(`> ${targetName} 受到 <b style="color:${color}">[${name}]</b> 影响: ${attrName} ${sign}${val} (${turns}回合)`);
        this._updateUIStats();
    },

    _processBuffs: function() {
        ['player', 'enemy'].forEach(target => {
            for (let attr in this.buffs[target]) {
                const b = this.buffs[target][attr];
                b.turns--;
                if (b.turns <= 0) {
                    const targetName = target === 'player' ? '你' : this.enemy.name;
                    this._log(`<span style="color:#888;">> ${targetName} 的 [${b.name}] 效果消失了。</span>`);
                    delete this.buffs[target][attr];
                }
            }
        });
    },

    _applyItemEffects: function(item, target) {
        const effects = item.effects || {};
        let logParts = [];
        if (effects.hp) {
            const val = Number(effects.hp);
            let realHeal = 0;
            if (val > 0) { realHeal = Math.min(val, target.derived.hpMax - this.currentPHp); if (realHeal < 0) realHeal = 0; } else { realHeal = val; }
            this.currentPHp = Math.max(0, Math.min(target.derived.hpMax, this.currentPHp + realHeal));
            if (realHeal > 0) logParts.push(`恢复 <span style="color:green;">${realHeal}</span> HP`);
        }
        if (effects.mp) {
            const val = Number(effects.mp);
            let real = Math.min(val, target.derived.mpMax - this.currentPMp);
            this.currentPMp = Math.max(0, Math.min(target.derived.mpMax, this.currentPMp + real));
            logParts.push(`恢复 <span style="color:#2196f3;">${real}</span> MP`);
        }
        if (effects.toxicity) {
            const val = Number(effects.toxicity);
            if (val < 0) {
                this.player.toxicity = Math.max(0, this.player.toxicity + val);
                logParts.push(`解毒 <span style="color:green;">${Math.abs(val)}</span>`);
            }
        }
        if (logParts.length > 0) this._log(`> 使用 <b style="color:#333;">${item.name}</b>：${logParts.join("，")}。`);
    },

    _applyPoisonToEnemy: function(item) {
        const effects = item.effects || {};
        let logParts = [];
        if (effects.hp < 0) {
            const dmg = Math.abs(Number(effects.hp));
            this.currentEHp = Math.max(0, this.currentEHp - dmg);
            logParts.push(`毒伤 <span style="color:purple;">${dmg}</span>`);
        }
        if (effects.toxicity > 0) {
            const tox = Number(effects.toxicity);
            this.enemy.toxicity = Math.min(100, (this.enemy.toxicity||0) + tox);
            logParts.push(`敌中毒 <span style="color:#9c27b0;">+${tox}</span>`);
        }
        this._log(`> 投掷 <b style="color:#333;">${item.name}</b>：${logParts.join("，")}。`);
    },

    _processPoisonOnEnemy: function() {
        if (this.enemy.toxicity > 0 && (this.enemy.toxicity >= 100 || this.enemy.hasDeepPoison)) {
            this.enemy.hasDeepPoison = true;
            const dmg = Math.floor((this.enemy.maxHp || 100) * 0.05);
            this.currentEHp = Math.max(0, this.currentEHp - dmg);
            this._log(`> [敌] 毒发攻心，受 <span style="color:#9c27b0;">${dmg}</span> 伤害`);
            this.enemy.toxicity -= 20;
            if (this.enemy.toxicity <= 0) { this.enemy.toxicity = 0; this.enemy.hasDeepPoison = false; }
            if (this.currentEHp <= 0) return true;
        }
        return false;
    },

    _processPoisonOnPlayer: function() {
        if (this.player.toxicity > 0 && (this.player.toxicity >= 100 || this.player.hasDeepPoison)) {
            this.player.hasDeepPoison = true;
            const dmg = Math.floor(this.player.derived.hpMax * 0.05);
            this.currentPHp = Math.max(0, this.currentPHp - dmg);
            this._log(`> [你] 毒发攻心，受 <span style="color:#9c27b0;">${dmg}</span> 伤害`);
            this.player.toxicity -= 20;
            if (this.player.toxicity <= 0) { this.player.toxicity = 0; this.player.hasDeepPoison = false; }
            if (this.currentPHp <= 0) return true;
        }
        return false;
    },

    _refreshItemCDUI: function() { for(let i=0; i<3; i++) { const cd = this.itemCDs[i]; const overlay = document.getElementById(`combat_cd_overlay_${i}`); const btn = document.getElementById(`combat_btn_use_${i}`); if (overlay && btn) { if (cd > 0) { overlay.style.display = "flex"; overlay.innerText = cd; btn.disabled = true; } else { overlay.style.display = "none"; if (!btn.classList.contains('empty-slot-btn')) { btn.disabled = false; } } } } },

    _refreshSkillCDUI: function() {
        if(!this.player.equipment || !this.player.equipment.gongfa) return;
        this.player.equipment.gongfa.forEach((id, idx) => {
            if (!id) return;
            const cd = this.skillCDs[id] || 0;
            const overlay = document.getElementById(`combat_skill_cd_overlay_${idx}`);
            const btn = document.getElementById(`combat_btn_skill_${idx}`);
            if (overlay && btn) {
                if (cd > 0) { overlay.style.display = "flex"; overlay.innerText = cd; btn.disabled = true; }
                else { overlay.style.display = "none"; btn.disabled = false; }
            }
        });
    },

    // 【优化】使用缓存更新UI
    _updateUIStats: function() {
        const ui = this.uiRefs;
        if (!ui.pHp) return; // 缓存未初始化

        const pMaxHp = this.player.derived.hpMax;
        const pMaxMp = this.player.derived.mpMax || 100;

        ui.pHp.innerText = Math.floor(this.currentPHp);
        ui.pHpBar.style.width = `${Math.min(100, (this.currentPHp/pMaxHp)*100)}%`;

        ui.pMp.innerText = Math.floor(this.currentPMp);
        ui.pMpBar.style.width = `${Math.min(100, (this.currentPMp/pMaxMp)*100)}%`;

        ui.eHp.innerText = Math.floor(this.currentEHp);
        ui.eHpBar.style.width = `${Math.min(100, (this.currentEHp/this.enemy.maxHp)*100)}%`;

        this._updateAttrStyle('player', this.buffs.player);
        this._updateAttrStyle('enemy', this.buffs.enemy);
    },

    // 【优化】优化属性更新
    _updateAttrStyle: function(target, buffs) {
        const prefix = target === 'player' ? 'p' : 'e';
        const uiMap = target === 'player' ? this.uiRefs.pAttr : this.uiRefs.eAttr;
        const attrMap = { 'atk': '攻击', 'def': '防御', 'spd': '速度' };

        // key在 buffs 中是 atk, def, speed
        // suffix 是 atk, def, spd
        const keys = ['atk', 'def', 'spd'];

        keys.forEach(suffix => {
            const buffKey = suffix === 'spd' ? 'speed' : suffix;
            const el = uiMap[suffix]; // 使用缓存

            if (el) {
                const oldBuffVal = el.querySelector('.attr-buff-val');
                if (oldBuffVal) oldBuffVal.remove();
                el.classList.remove('attr-debuff', 'attr-buff');

                const buff = buffs[buffKey];
                if (buff) {
                    const isDebuff = buff.type === 'debuff';
                    const color = isDebuff ? '#d32f2f' : '#388e3c';
                    const sign = buff.val > 0 ? '+' : '';
                    const attrName = attrMap[suffix];
                    const buffHtml = `<span class="attr-buff-val" style="color:${color}; margin-left:5px;margin-top: -5px"> - ${sign} ${Math.abs(buff.val)} ${attrName}</span>`;
                    el.insertAdjacentHTML('beforeend', buffHtml);
                }
            }
        });
    },

    // 【优化】使用缓存更新毒性
    _updateToxUI: function() {
        const ui = this.uiRefs;
        if (ui.eToxBar && this.enemy) {
            ui.eToxBar.style.width = `${this.enemy.toxicity}%`;
            ui.eToxVal.innerText = `${this.enemy.toxicity}`;
        }
        if (ui.pToxBar && window.player) {
            ui.pToxBar.style.width = `${window.player.toxicity}%`;
            ui.pToxVal.innerText = `${window.player.toxicity}`;
        }
    },

    _syncPlayerStatus: function() {
        if(this.player.status) {
            this.player.status.hp = this.currentPHp;
            this.player.status.mp = this.currentPMp;
        }
    },

    _handleVictory: function() {
        this.isEnded = true;
        this._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`);
        const money = this._randomInt(this.enemy.money[0], this.enemy.money[1]);
        if (money > 0) {
            if (window.UtilsAdd) UtilsAdd.addMoney(money);
            else this.player.money = (this.player.money || 0) + money;
        }

        const drops = this._calculateDrops(this.enemy.drops);
        const bountyDrops = this._checkBountyDrops();
        bountyDrops.forEach(item => drops.push({ id: item.id, isBounty: true }));

        let rewardHtml = "";
        if (money > 0 || drops.length > 0) {
            rewardHtml += `<div style="background:#e8f5e9; border:1px solid #c8e6c9; padding:10px; margin-top:10px; border-radius:4px;">`;
            if (money > 0) rewardHtml += `<p>获得钱财: <span style="color:#f57f17; font-weight:bold;">+${money}</span></p>`;

            if (drops.length > 0) {
                rewardHtml += `<div style="font-weight:bold; margin-top:5px;">战利品:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`;
                drops.forEach(drop => {
                    if (window.UtilsAdd) UtilsAdd.addItem(drop.id, 1, false);
                    let name = drop.id;
                    let styleExtra = "";
                    let itemData = null;
                    if (window.GAME_DB && window.GAME_DB.items) {
                        if (Array.isArray(window.GAME_DB.items)) itemData = window.GAME_DB.items.find(i=>i.id===drop.id);
                        else itemData = window.GAME_DB.items[drop.id];
                    }
                    if (itemData) {
                        name = itemData.name;
                        if (drop.isBounty) {
                            styleExtra = "border-color:#ff9800; background:#fff3e0; color:#e65100;";
                            name = "✨ " + name;
                        }
                    }
                    rewardHtml += `<span style="background:#fff; border:1px solid #ccc; padding:2px 6px; font-size:12px; border-radius:3px; ${styleExtra}">${name}</span>`;
                });
                rewardHtml += `</div>`;
            }
            rewardHtml += `</div>`;
        } else {
            this._log(`<span style="color:#888;">(一无所获)</span>`);
        }
        if (window.UtilsEnemy) UtilsEnemy.markDefeated(this.enemy.x, this.enemy.y);

        this._syncPlayerStatus();
        if (this.onWinCallback) this.onWinCallback();
        if (window.saveGame) window.saveGame();
        this._renderEnd("胜利", rewardHtml);
    },

    _handleDefeat: function() {
        this.isEnded = true;
        this._log(`<div style="color:red; font-weight:bold; margin-top:10px;">💀 战斗失败...</div>`);
        if (window.player && window.player.status) {
            window.player.status.hp = 1;
            window.player.status.mp = 0;
        }
        if (window.UtilsFail && window.UtilsFail.onCombatDefeat) {
            window.UtilsFail.onCombatDefeat(this.enemy);
        }
        this._renderEnd("失败");
        const footer = document.getElementById('map_combat_footer');
        if (footer) footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">黯然离去</button>`;
        this.clearCache();
    },

    _checkBountyDrops: function() {
        if (!window.player || !window.player.bounty || !window.player.bounty.activeTasks) return [];
        const drops = [];
        const enemyId = this.enemy.id;
        const enemyRank = this.enemy.template || 'minion';
        window.player.bounty.activeTasks.forEach(task => {
            if (task.type === 1 && task.status === 'active' && task.targets) {
                const target = task.targets.find(t => t.id === enemyId);
                if (target && target.curCount < target.reqCount) {
                    if (Math.random() < 0.3) {
                        const dropItem = this._rollBountyEquip(enemyRank);
                        if (dropItem) drops.push(dropItem);
                    }
                }
            }
        });
        return drops;
    },

    _rollBountyEquip: function(rank) {
        if (!window.GAME_DB) return null;
        let rarityWeights = {};
        if (rank === 'minion') rarityWeights = { 1: 100 };
        else if (rank === 'elite') rarityWeights = { 1: 60, 2: 40 };
        else if (rank === 'boss') rarityWeights = { 1: 80, 2: 40, 3: 20, 4: 5, 5: 1 };
        else if (rank === 'lord') rarityWeights = { 3: 40, 4: 20, 5: 5, 6: 1 };
        else rarityWeights = { 1: 100 };
        let totalWeight = 0;
        for (let r in rarityWeights) totalWeight += rarityWeights[r];
        let randomVal = Math.random() * totalWeight;
        let selectedRarity = 1;
        for (let r in rarityWeights) { randomVal -= rarityWeights[r]; if (randomVal <= 0) { selectedRarity = parseInt(r); break; } }
        const validTypes = ['weapon', 'head', 'body', 'feet'];
        let pool = [];
        const allItems = Array.isArray(window.GAME_DB.equipments) ? window.GAME_DB.equipments : Object.values(window.GAME_DB.equipments || {});
        pool = allItems.filter(i => validTypes.includes(i.type) && i.rarity === selectedRarity);
        if (pool.length === 0 && window.weapons) {
            const dbs = [window.weapons, window.head, window.body, window.feet];
            dbs.forEach(db => { if (db) pool = pool.concat(Object.values(db).filter(i => i.rarity === selectedRarity)); });
        }
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    _handleEnd: function(type) {
        this.isEnded = true;
        this._syncPlayerStatus();
        if (window.saveGame) window.saveGame();
        this._renderEnd(type);
    },

    _injectStyles: function() {
        // 使用新ID避免旧样式干扰
        if (document.getElementById('combat-styles-v7-7')) return;

        const css = `
            .turn-divider { margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center; } 
            
            /* 触发器容器 */
            .combat-tooltip-trigger { 
                display: inline-block; 
                position: relative; /* 关键：作为定位基准 */
                cursor: help;
            } 
            
            /* 悬浮窗主体 (改为右侧显示) */
            .combat-tooltip-content { 
                visibility: hidden; 
                opacity: 0; 
                
                /* 定位核心修改 */
                position: absolute; 
                left: 100%;          /* 在父元素右侧 */
                top: 50%;            /* 垂直居中 */
                transform: translateY(-50%); /* 修正垂直偏移 */
                margin-left: 10px;   /* 与触发器保持距离 */
                
                width: 220px; 
                background: rgba(0, 0, 0, 0.9); 
                color: #fff; 
                padding: 8px 12px; 
                border-radius: 6px; 
                font-size: 13px; 
                font-family: monospace; 
                font-weight: normal; 
                z-index: 99999;      /* 确保极高层级，不被遮挡 */
                box-shadow: 2px 2px 10px rgba(0,0,0,0.4); 
                transition: opacity 0.2s; 
                pointer-events: none; 
                text-align: left; 
                line-height: 1.5;
                white-space: normal; /* 允许换行 */
            } 
            
            /* 小箭头 (指向左侧) */
            .combat-tooltip-content::after { 
                content: ""; 
                position: absolute; 
                top: 50%; 
                right: 100%;         /* 在悬浮窗左侧 */
                margin-top: -6px;    /* 垂直居中修正 */
                border-width: 6px; 
                border-style: solid; 
                /* 箭头颜色指向右边 (黑色) */
                border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent; 
            } 
            
            /* 悬停显示 */
            .combat-tooltip-trigger:hover .combat-tooltip-content { 
                visibility: visible; 
                opacity: 1; 
            } 
            
            /* 内部排版样式 (保持不变) */
            .tip-row { display: flex; justify-content: space-between; margin-bottom: 2px; } 
            .tip-dim { color: #aaa; font-size: 12px; } 
            .tip-crit { color: #ffeb3b; font-weight: bold; } 
            .tip-divider { border-top: 1px solid #555; margin: 5px 0; } 
            .tip-total { font-size: 15px; color: #4caf50; font-weight: bold; margin-top: 2px; }
        `;

        const style = document.createElement('style');
        style.id = 'combat-styles-v7-7';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    },

    _calculateDrops: function(dropTable) {
        if (!dropTable || !Array.isArray(dropTable)) return [];
        const result = [];
        dropTable.forEach(entry => { if (Math.random() <= entry.rate) result.push({ id: entry.id }); });
        return result;
    },

    // 【优化】使用缓存 + 日志裁剪 + scrollIntoView
    _log: function(msg) {
        // 使用缓存的容器，如果没有初始化则回退到 getElementById
        const container = this.uiRefs.logContainer || document.getElementById(this.logContainerId);

        if (container) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px'; // 保持原有样式
            line.innerHTML = msg;
            container.appendChild(line);

            // 节点修剪：保持 DOM 轻量，只保留最后 60 行
            if (container.children.length > 60) {
                container.removeChild(container.firstChild);
            }

            // 保持使用 scrollIntoView，确保最可靠的滚动体验
            setTimeout(() => {
                line.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 0);
        } else {
            this.logs.push(msg);
        }
    },

    _renderEnd: function(resultType, extraHtml = "") {
        const container = this.uiRefs.logContainer || document.getElementById(this.logContainerId);

        if (container && extraHtml) {
            const div = document.createElement('div');
            div.innerHTML = extraHtml;
            container.appendChild(div);
            setTimeout(() => {
                div.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 0);
        } else {
            // Fallback for when modal isn't open
            // const logHtml = this.logs.map(l => `<div>${l}</div>`).join('');
            // this._updateModal(`战斗结束 - ${resultType}`, `<div style="max-height:300px; overflow-y:auto;">${logHtml}</div>${extraHtml}`, true);
        }
    },
// 【新增】清理缓存，断开引用，释放内存
    clearCache: function() {
        this.uiRefs = {}; // 清空对象，切断对 DOM 的引用
        this.logContainerId = null;
        // console.log(">>> [Combat] 缓存已清理");
    },
    _randomInt: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    _updateModal: function(title, content, showClose = false) { if (window.showGeneralModal) { let footer = showClose ? `<button class="ink_btn" onclick="closeModal()">关闭</button>` : null; window.showGeneralModal(title, content, footer); } }
};

window.Combat = Combat;