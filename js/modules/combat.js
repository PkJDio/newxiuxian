// js/modules/combat.js
// 战斗系统 v6.6 (修复：毒性读取深度调试 + 数据同步增强)
console.log("加载 战斗系统 (Deep Debug Mode)");

const Combat = {
    enemy: null,
    player: null,
    logs: [],
    maxTurns: 50,
    onWinCallback: null,

    // UI 元素 ID
    logContainerId: null,
    eToxBarId: null, eToxValId: null,
    pToxBarId: null, pToxValId: null,

    isStopped: false,
    isPaused: false,
    timer: null,
    itemCDs: [0, 0, 0],

    // 战斗实时状态
    currentPHp: 0,
    currentEHp: 0,
    currentTurn: 1,

    /**
     * 开始战斗
     */
    start: function(enemyObj, onWin, logId, eToxBarId, eToxValId, pToxBarId, pToxValId) {
        console.log(">>> [Combat] 启动战斗初始化...");
        console.log(">>> [Combat] 传入敌人原始数据:", enemyObj);

        if (!window.player) return;

        this._injectStyles();

        // 深度拷贝敌人对象
        this.enemy = JSON.parse(JSON.stringify(enemyObj));

        // 【关键修复】确保 stats 存在时，顶层的 toxicity 也同步进去
        // 因为 _runCombatLoopAsync 会优先读取 this.enemy.stats
        if (this.enemy.toxicity > 0) {
            if (!this.enemy.stats) this.enemy.stats = {};
            // 如果 stats 里没有毒性，把外层的毒性塞进去
            if (!this.enemy.stats.toxicity) {
                console.log(`>>> [Combat] 将外层毒性 ${this.enemy.toxicity} 同步至 stats`);
                this.enemy.stats.toxicity = this.enemy.toxicity;
            }
        }

        // 状态初始化：toxicity 状态归零 (这是当前已中毒深度，不是攻击属性)
        this.enemy.toxicity = 0;

        this.player = window.player;
        if (this.player.toxicity === undefined) this.player.toxicity = 0;
        if (this.player.toxicity < 100) this.player.hasDeepPoison = false;

        this.logs = [];
        this.onWinCallback = onWin;

        this.logContainerId = logId;
        this.eToxBarId = eToxBarId;
        this.eToxValId = eToxValId;
        this.pToxBarId = pToxBarId;
        this.pToxValId = pToxValId;

        this.isStopped = false;
        this.isPaused = false;
        this.itemCDs = [0, 0, 0];

        // 初始化数值
        const p = this.player.derived || this.player.attributes;
        this.currentPHp = p.hp !== undefined ? p.hp : (p.maxHp || 100);

        // 敌人血量
        this.currentEHp = this.enemy.hp;
        if (this.enemy.stats && this.enemy.stats.hp) {
            this.currentEHp = this.enemy.stats.hp;
            this.enemy.hp = this.enemy.stats.hp;
            this.enemy.maxHp = this.enemy.stats.hp;
        }

        this.currentTurn = 1;

        // 刷新UI
        this._refreshItemCDUI();
        this._updateToxUI();
        this._updateUIStats(this.currentPHp, this.currentEHp);

        this.timer = setTimeout(() => {
            this._runCombatLoopAsync();
        }, 500);
    },

    stop: function() {
        console.log(">>> [Combat] 玩家请求逃跑");
        this.isStopped = true;
        if (this.timer) clearTimeout(this.timer);
        this._log(`<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">🏃 你看准时机，脚底抹油溜之大吉！</div>`);

        if (this.player && this.player.status) {
            this.player.status.hp = this.currentPHp;
        }

        if (window.saveGame) window.saveGame();
        this._renderEnd("逃跑");

        const footer = document.getElementById('map_combat_footer');
        if (footer) footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">关闭</button>`;
    },

    togglePause: function() {
        if (this.isStopped) return;

        this.isPaused = !this.isPaused;

        const btn = document.getElementById('combat_btn_pause');
        if (btn) {
            if (this.isPaused) {
                btn.innerHTML = "▶ 继续战斗";
                btn.style.color = "#388e3c";
                btn.style.borderColor = "#388e3c";
            } else {
                btn.innerHTML = "⏸ 暂停";
                btn.style.color = "#333";
                btn.style.borderColor = "#ccc";
            }
        }

        if (!this.isPaused) {
            this._log(`<div style="color:#888; font-size:14px; text-align:center; margin:5px 0;">--- 战斗继续 ---</div>`);
            this._runCombatLoopAsync();
        } else {
            if (this.timer) clearTimeout(this.timer);
            this._log(`<div style="color:#d32f2f; font-weight:bold; font-size:14px; text-align:center; margin:5px 0;">--- 战斗已暂停 ---</div>`);
        }
    },

    useConsumable: function(slotIndex) {
        if (this.isStopped) return;
        if (this.isPaused) {
            if(window.showToast) window.showToast("暂停中无法使用物品");
            return;
        }
        if (this.itemCDs[slotIndex] > 0) return;

        const itemId = this.player.consumables[slotIndex];
        if (!itemId) return;

        const invSlot = this.player.inventory.find(i => i.id === itemId);
        if (!invSlot || invSlot.count <= 0) {
            this._log(`<span style="color:#888;">(物品已用尽)</span>`);
            if (!invSlot) {
                this.player.consumables[slotIndex] = null;
                if (window.MapCamera && MapCamera.updateSidebar) MapCamera.updateSidebar();
            }
            return;
        }

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

        if (this.player.consumables[slotIndex] || invSlot.count <= 0) {
            this.itemCDs[slotIndex] = 4;
            this._refreshItemCDUI();
        }

        if(this.player.status) this.player.status.hp = this.currentPHp;
        if (window.saveGame) window.saveGame();

        this._updateUIStats(this.currentPHp, this.currentEHp);
        this._updateToxUI();
    },

    _applyItemEffects: function(item, target) {
        const effects = item.effects || {};
        let logParts = [];
        if (effects.hp) {
            const val = Number(effects.hp);
            const oldHp = (target === this.player) ? this.currentPHp : (target.status ? target.status.hp : target.hp);
            const maxHp = target.derived ? target.derived.hpMax : (target.maxHp || 100);
            let realHeal = 0;
            if (val > 0) { realHeal = Math.min(val, maxHp - oldHp); if (realHeal < 0) realHeal = 0; } else { realHeal = val; }

            let newHp = oldHp + realHeal;
            if (newHp > maxHp) newHp = maxHp;
            if (newHp < 0) newHp = 0;

            if (target === this.player) this.currentPHp = newHp;
            if (target.status) target.status.hp = newHp; else target.hp = newHp;

            if (realHeal > 0) logParts.push(`恢复了 <span style="color:green;">${realHeal}</span> 点生命`);
            else if (realHeal < 0) logParts.push(`损失了 <span style="color:red;">${Math.abs(realHeal)}</span> 点生命`);
        }
        if (effects.toxicity) {
            const val = Number(effects.toxicity);
            if (val < 0) {
                const reduce = Math.abs(val);
                const oldTox = target.toxicity || 0;
                target.toxicity = Math.max(0, oldTox - reduce);
                const realReduce = oldTox - target.toxicity;
                if (realReduce > 0) logParts.push(`消除了 <span style="color:#4caf50;">${realReduce}</span> 点中毒值`);
                if (target.toxicity <= 0) {
                    target.hasDeepPoison = false;
                    if (target === this.player && window.checkStatusDebuffs) window.checkStatusDebuffs();
                }
            }
        }
        if (item.buffs && Array.isArray(item.buffs)) {
            item.buffs.forEach(buff => {
                const buffName = buff.name || buff.attr || "增益";
                logParts.push(`获得了 <span style="color:orange;">[${buffName}]</span> 状态`);
            });
        }
        if (logParts.length > 0) this._log(`> 你使用了 <b style="color:#333;">${item.name}</b>：${logParts.join("，")}。`);
        else this._log(`> 你使用了 <b style="color:#333;">${item.name}</b>。`);
    },

    _applyPoisonToEnemy: function(item) {
        const effects = item.effects || {};
        let logParts = [];
        if (effects.hp && effects.hp < 0) {
            const dmg = Math.abs(Number(effects.hp));
            this.currentEHp = Math.max(0, this.currentEHp - dmg);
            this.enemy.hp = this.currentEHp;
            logParts.push(`对敌人造成 <span style="color:purple;">${dmg}</span> 点毒素伤害`);
        }
        if (effects.toxicity) {
            const tox = Number(effects.toxicity);
            if (tox > 0) {
                const oldTox = this.enemy.toxicity || 0;
                this.enemy.toxicity = Math.min(100, oldTox + tox);
                logParts.push(`敌人中毒值增加 <span style="color:#9c27b0;">${tox}</span>`);
                if (this.enemy.toxicity >= 100) {
                    if (!this.enemy.hasDeepPoison) {
                        this.enemy.hasDeepPoison = true;
                        setTimeout(() => { this._log(`<div style="color:#9c27b0; font-weight:bold; margin-top:4px;">⚠️ 毒气攻心！敌人已深层中毒！</div>`); }, 100);
                    }
                }
            }
        }
        if (logParts.length > 0) this._log(`> 你向敌人投掷了 <b style="color:#333;">${item.name}</b>：${logParts.join("，")}。`);
        else this._log(`> 你使用了 <b style="color:#333;">${item.name}</b>，但似乎被抵抗了。`);
    },

    _runCombatLoopAsync: function() {
        if (this.isStopped) return;
        if (this.isPaused) return;

        let p = this.player.derived || this.player.attributes;
        // 确保使用正确的数据源（stats优先，其次是enemy本身）
        let e = this.enemy.stats ? this.enemy.stats : this.enemy;

        if (this.currentTurn === 1) this._log(`遭遇了 ${this.enemy.name} (HP: ${this.currentEHp})！`);

        if (this.currentTurn > this.maxTurns) {
            this._log("双方精疲力尽，各自罢兵...");
            if(this.player.status) this.player.status.hp = this.currentPHp;
            if (window.saveGame) window.saveGame();
            this._renderEnd("平局");
            return;
        }

        this._log(`<div class="turn-divider">--- 第 ${this.currentTurn} 回合 ---</div>`);

        for(let i=0; i<3; i++) {
            if (this.itemCDs[i] > 0) this.itemCDs[i]--;
        }
        this._refreshItemCDUI();

        const playerFirst = (p.speed || 10) >= (e.speed || 10);
        let isWin = false; let isDead = false;

        if (playerFirst) {
            this.currentEHp -= this._performAttack("你", p, e, true);
            if (this.currentEHp <= 0) isWin = true;
            else {
                // 敌人反击
                this.currentPHp -= this._performAttack(this.enemy.name, e, p, false);
                if (this.currentPHp <= 0) isDead = true;
            }
        } else {
            this.currentPHp -= this._performAttack(this.enemy.name, e, p, false);
            if (this.currentPHp <= 0) isDead = true;
            else {
                this.currentEHp -= this._performAttack("你", p, e, true);
                if (this.currentEHp <= 0) isWin = true;
            }
        }

        this.currentPHp = Math.max(0, this.currentPHp);
        this.currentEHp = Math.max(0, this.currentEHp);

        // 回合末结算：中毒
        if (!isWin && !isDead) {
            // 结算敌人中毒 (this.enemy.toxicity)
            if (this.enemy.toxicity > 0) {
                if (this.enemy.toxicity >= 100 || this.enemy.hasDeepPoison) {
                    this.enemy.hasDeepPoison = true;
                    const dmg = Math.floor((this.enemy.maxHp || 100) * 0.05);
                    this.currentEHp = Math.max(0, this.currentEHp - dmg);
                    this._log(`> [敌人中毒] 毒发攻心，受到 <span style="color:#9c27b0;">${dmg}</span> 点伤害`);
                    if (this.currentEHp <= 0) isWin = true;

                    this.enemy.toxicity -= 20;
                    if (this.enemy.toxicity <= 0) {
                        this.enemy.toxicity = 0;
                        this.enemy.hasDeepPoison = false;
                        this._log(`<span style="color:green;">> 敌人体内的剧毒已被清除。</span>`);
                    }
                }
            }
            // 结算玩家中毒 (window.player.toxicity)
            // 使用 window.player 确保状态一致
            if (window.player.toxicity > 0) {
                const pMaxHp = p.hpMax || 100;
                if (window.player.toxicity >= 100 || window.player.hasDeepPoison) {
                    window.player.hasDeepPoison = true;
                    const dmg = Math.floor(pMaxHp * 0.05);
                    this.currentPHp = Math.max(0, this.currentPHp - dmg);
                    this._log(`> [自身中毒] 毒发攻心，受到 <span style="color:#9c27b0;">${dmg}</span> 点伤害`);
                    if (this.currentPHp <= 0) isDead = true;

                    window.player.toxicity -= 20;
                    if (window.player.toxicity <= 0) {
                        window.player.toxicity = 0;
                        window.player.hasDeepPoison = false;
                        if (window.checkStatusDebuffs) window.checkStatusDebuffs();
                    }
                }
            }
        }

        // 同步回 enemy.hp
        this.enemy.hp = this.currentEHp;
        if(window.player.status) window.player.status.hp = this.currentPHp;

        this._updateUIStats(this.currentPHp, this.currentEHp);
        this._updateToxUI();

        if (isWin) { this._handleVictory(); return; }
        if (isDead) { this._handleDefeat(this.currentPHp); return; }

        this.currentTurn++;
        if (!this.isPaused) {
            this.timer = setTimeout(() => {
                this._runCombatLoopAsync();
            }, 800);
        }
    },

    _refreshItemCDUI: function() { for(let i=0; i<3; i++) { const cd = this.itemCDs[i]; const overlay = document.getElementById(`combat_cd_overlay_${i}`); const btn = document.getElementById(`combat_btn_use_${i}`); if (overlay && btn) { if (cd > 0) { overlay.style.display = "flex"; overlay.innerText = cd; btn.disabled = true; } else { overlay.style.display = "none"; if (!btn.classList.contains('empty-slot-btn')) { btn.disabled = false; } } } } },

    // 【UI更新】确保ID对应正确，并添加日志
    _updateToxUI: function() {
        // 更新敌人 (Left)
        if (this.eToxBarId && this.enemy) {
            const bar = document.getElementById(this.eToxBarId);
            const val = document.getElementById(this.eToxValId);
            const tox = this.enemy.toxicity || 0;
            // console.log(`[Combat UI] Enemy Tox ID: ${this.eToxBarId}, Val: ${tox}`); // 调试用
            if(bar) bar.style.width = `${tox}%`;
            if(val) val.innerText = `${tox}`;
        }
        // 更新玩家 (Right) - 使用 window.player 确保状态最新
        if (this.pToxBarId && window.player) {
            const bar = document.getElementById(this.pToxBarId);
            const val = document.getElementById(this.pToxValId);
            const tox = window.player.toxicity || 0;
            console.log(`[Combat UI] Player Tox Update: ${tox}`); // 调试日志
            if(bar) bar.style.width = `${tox}%`;
            if(val) val.innerText = `${tox}`;
        }
    },

    _updateUIStats: function(pHp, eHp) { const elPHp = document.getElementById('combat_p_hp'); const elEHp = document.getElementById('combat_e_hp'); const barP = document.getElementById('combat_p_hp_bar'); const barE = document.getElementById('combat_e_hp_bar'); if (elPHp) { elPHp.innerText = Math.floor(pHp); if (pHp < (window.player.derived.hpMax * 0.3)) elPHp.style.color = 'red'; } if (elEHp) { elEHp.innerText = Math.floor(eHp); } if (barP && window.player.derived) { const pct = Math.max(0, Math.min(100, (pHp / window.player.derived.hpMax) * 100)); barP.style.width = `${pct}%`; } if (barE && this.enemy) { const max = this.enemy.maxHp || 100; const pct = Math.max(0, Math.min(100, (eHp / max) * 100)); barE.style.width = `${pct}%`; } },

    // 【核心修改】_performAttack: 强力调试日志
    _performAttack: function(attackerName, atkStats, defStats, isPlayerAttacking) {
        const atkVal = atkStats.atk || 1;
        const defVal = defStats.def || 0;
        const spdAtk = atkStats.speed || 10;
        const spdDef = defStats.speed || 10;

        let dodgeRate = 0.05 + (spdDef - spdAtk) / 100;
        dodgeRate = Math.max(0, Math.min(0.60, dodgeRate));

        if (Math.random() < dodgeRate) {
            const color = isPlayerAttacking ? "#aaa" : "#aaa";
            this._log(`${attackerName} 发起攻击，但是被 <span style="color:${color}; font-weight:bold;">✨闪避</span> 了！`);
            return 0;
        }

        const ARMOR_CONST = 100;
        const reductionMultiplier = ARMOR_CONST / (ARMOR_CONST + defVal);
        let rawDamage = atkVal * reductionMultiplier;
        const reductionPercent = Math.floor((1 - reductionMultiplier) * 100);

        let critRate = 0;
        if (isPlayerAttacking) {
            const shen = atkStats.shen || 0;
            critRate = 0 + (shen * 0.01);
            if (atkStats.critRateBonus) critRate += atkStats.critRateBonus;
        } else {
            const rank = atkStats.template || "minion";
            switch (rank) { case "lord": critRate = 0.20; break; case "boss": critRate = 0.15; break; case "elite": critRate = 0.10; break; default: critRate = 0.05; break; }
        }

        const isCrit = Math.random() < critRate;
        if (isCrit) rawDamage = rawDamage * 1.5;

        const variance = 0.95 + Math.random() * 0.1;
        let finalDamage = Math.floor(rawDamage * variance);
        finalDamage = Math.max(1, finalDamage);

        const tooltipHtml = `<div class="combat-tooltip-content"><div class="tip-row"><span>🗡️ 攻击力</span> <span>${atkVal}</span></div><div class="tip-row"><span>🛡️ 防御力</span> <span>${defVal} <span class="tip-dim">(-${reductionPercent}%)</span></span></div>${isCrit ? `<div class="tip-row tip-crit"><span>💥 暴击</span> <span>x1.5</span></div>` : ''}<div class="tip-row"><span>🎲 浮动</span> <span>${(variance*100).toFixed(0)}%</span></div><div class="tip-divider"></div><div class="tip-row tip-total"><span>最终伤害</span> <span>${finalDamage}</span></div></div>`;
        const color = isPlayerAttacking ? "#d32f2f" : "#1976d2";
        const critText = isCrit ? " <b style='color:#ff9800'>[暴击!]</b>" : "";
        const dmgSpan = `<span class="combat-tooltip-trigger" style="color:${color}; font-weight:bold; cursor:help; border-bottom:1px dotted ${color}; position:relative;">${finalDamage}${tooltipHtml}</span>`;
        this._log(`${attackerName} 造成 ${dmgSpan} 点伤害${critText}`);

        // 3. 【核心修改】怪物攻击附带中毒逻辑 (带详细分组日志)
        if (!isPlayerAttacking) {
            console.group("☠️ 毒性攻击判定详情");

            // 尝试直接获取 toxicity
            let tox = atkStats.toxicity;
            console.log(`[Combat] 攻击者: ${attackerName}`);
            console.log(`[Combat] 攻击者属性对象:`, atkStats);
            console.log(`[Combat] 读取到的 toxicity:`, tox);

            if (tox && Number(tox) > 0) {
                let addTox = Number(tox);
                // 强制操作全局对象，防止引用丢失
                let currentTox = window.player.toxicity || 0;
                let newTox = Math.min(100, currentTox + addTox);

                console.log(`[Combat] ✅ 判定生效! 玩家中毒: ${currentTox} -> ${newTox}`);
                window.player.toxicity = newTox;

                this._log(`> ⚠️ ${attackerName} 的攻击附带剧毒！你累积了 <span style="color:#9c27b0">${addTox}</span> 点中毒值。`);

                // 立即更新 UI (这里会调用 _updateToxUI)
                this._updateToxUI();
            } else {
                console.log("[Combat] ❌ 未触发中毒 (毒性无效或为0)");
            }
            console.groupEnd();
        }

        return finalDamage;
    },

    _injectStyles: function() { if (document.getElementById('combat-styles-v4')) return; const css = ` .turn-divider { margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center; } .combat-tooltip-trigger { display: inline-block; } .combat-tooltip-content { visibility: hidden; opacity: 0; position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%); width: 180px; background: rgba(0, 0, 0, 0.85); color: #fff; padding: 10px; border-radius: 6px; font-size: 12px; font-family: monospace; font-weight: normal; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: opacity 0.2s, bottom 0.2s; pointer-events: none; text-align: left; line-height: 1.6; } .combat-tooltip-content::after { content: ""; position: absolute; top: 100%; left: 50%; margin-left: -6px; border-width: 6px; border-style: solid; border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent; } .combat-tooltip-trigger:hover .combat-tooltip-content { visibility: visible; opacity: 1; bottom: 125%; } .tip-row { display: flex; justify-content: space-between; } .tip-dim { color: #aaa; font-size: 0.9em; } .tip-crit { color: #ffeb3b; font-weight: bold; } .tip-divider { border-top: 1px solid #555; margin: 5px 0; } .tip-total { font-size: 14px; color: #4caf50; font-weight: bold; } `; const style = document.createElement('style'); style.id = 'combat-styles-v4'; style.type = 'text/css'; style.appendChild(document.createTextNode(css)); document.head.appendChild(style); },
    _handleVictory: function() { this._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`); const money = this._randomInt(this.enemy.money[0], this.enemy.money[1]); if (money > 0) { if (window.UtilsAdd) UtilsAdd.addMoney(money); else { if (!this.player.money) this.player.money = 0; this.player.money += money; } } const drops = this._calculateDrops(this.enemy.drops); let rewardHtml = ""; if (money > 0 || drops.length > 0) { rewardHtml += `<div style="background:#e8f5e9; border:1px solid #c8e6c9; padding:10px; margin-top:10px; border-radius:4px;">`; if (money > 0) rewardHtml += `<p>获得钱财: <span style="color:#f57f17; font-weight:bold;">+${money}</span></p>`; if (drops.length > 0) { const titleStyle = (money > 0) ? "margin-top:5px; font-weight:bold;" : "font-weight:bold;"; rewardHtml += `<div style="${titleStyle}">战利品:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`; drops.forEach(drop => { const itemId = drop.id; if (window.UtilsAdd) UtilsAdd.addItem(itemId, 1, false); let itemName = itemId; if (window.GAME_DB && window.GAME_DB.items) { const itemData = window.GAME_DB.items.find(i => i.id === itemId); if (itemData) itemName = itemData.name; } rewardHtml += `<span style="display:inline-block; background:#fff; border:1px solid #ccc; padding:2px 6px; margin:2px; font-size:12px; border-radius:3px; color:#333;">${itemName} x1</span>`; }); rewardHtml += `</div>`; } rewardHtml += `</div>`; } else { this._log(`<div style="color:#888; font-size:12px;">(本次战斗一无所获)</div>`); } if (window.UtilsEnemy) UtilsEnemy.markDefeated(this.enemy.x, this.enemy.y); if (this.onWinCallback) this.onWinCallback(); if (window.saveGame) window.saveGame(); this._renderEnd("胜利", rewardHtml); },
    _handleDefeat: function(finalHp) { this._log(`<div style="color:red; font-weight:bold; margin-top:10px;">💀 战斗失败...</div>`); this._log("你重伤昏迷，被路人救回了最近的城镇。"); if (window.player && window.player.status) window.player.status.hp = 1; if (window.saveGame) window.saveGame(); this._renderEnd("失败"); const footer = document.getElementById('map_combat_footer'); if (footer) footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">黯然离去</button>`; },
    _calculateDrops: function(dropTable) { if (!dropTable || !Array.isArray(dropTable)) return []; const result = []; dropTable.forEach(entry => { if (Math.random() <= entry.rate) result.push({ id: entry.id }); }); return result; },
    _log: function(msg) { if (this.logContainerId) { const el = document.getElementById(this.logContainerId); if (el) { const line = document.createElement('div'); line.style.marginBottom = '4px'; line.innerHTML = msg; el.appendChild(line); el.scrollTop = el.scrollHeight; if (el.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight; setTimeout(() => { line.scrollIntoView({ behavior: "smooth", block: "end" }); }, 10); } } else { this.logs.push(msg); } },
    _renderEnd: function(resultType, extraHtml = "") { if (this.logContainerId) { const el = document.getElementById(this.logContainerId); if (el && extraHtml) { const div = document.createElement('div'); div.innerHTML = extraHtml; el.appendChild(div); el.scrollTop = el.scrollHeight; if (el.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight; setTimeout(() => { div.scrollIntoView({ behavior: "smooth", block: "end" }); }, 10); } } else { const logHtml = this.logs.map(l => `<div>${l}</div>`).join(''); this._updateModal(`战斗结束 - ${resultType}`, `<div style="max-height:300px; overflow-y:auto;">${logHtml}</div>${extraHtml}`, true); } },
    _randomInt: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    _showCombatModal: function(title, content) { if (window.showGeneralModal) window.showGeneralModal(title, content); },
    _updateModal: function(title, content, showClose = false) { if (window.showGeneralModal) { let footer = showClose ? `<button class="ink_btn" onclick="closeModal()">关闭</button>` : null; window.showGeneralModal(title, content, footer); } }
};

window.Combat = Combat;