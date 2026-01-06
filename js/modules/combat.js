// js/modules/combat.js
// 战斗系统 v4.0 (UI增强：详细伤害计算公式悬浮框 Tooltip)
console.log("加载 战斗系统 (Damage Tooltip)");

const Combat = {
    enemy: null,
    player: null,
    logs: [],
    maxTurns: 50,
    onWinCallback: null,
    logContainerId: null,

    isStopped: false,
    timer: null,

    /**
     * 开始战斗
     */
    start: function(enemyObj, onWin, containerId = null) {
        console.log(">>> [Combat] 开始战斗:", enemyObj.name);
        if (!window.player) return;

        // 1. 注入样式 (确保 Tooltip CSS 存在)
        this._injectStyles();

        this.enemy = JSON.parse(JSON.stringify(enemyObj));
        this.player = window.player;
        this.logs = [];
        this.onWinCallback = onWin;
        this.logContainerId = containerId;
        this.isStopped = false;

        if (!this.logContainerId) {
            this._showCombatModal("⚔️ 战斗开始", "正在初始化...");
        }

        this.timer = setTimeout(() => {
            this._runCombatLoopAsync();
        }, 500);
    },

    stop: function() {
        console.log(">>> [Combat] 玩家请求逃跑");
        this.isStopped = true;
        if (this.timer) clearTimeout(this.timer);

        this._log(`<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">🏃 你看准时机，脚底抹油溜之大吉！</div>`);
        this._log(`(战斗已中止，状态已保存)`);

        if (window.saveGame) window.saveGame();

        this._renderEnd("逃跑");

        const footer = document.getElementById('map_combat_footer');
        if (footer) {
            footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">关闭</button>`;
        }
    },

    _runCombatLoopAsync: function(currentTurn = 1, currentPHp = null, currentEHp = null) {
        if (this.isStopped) return;

        let p = this.player.derived || this.player.attributes || { hp: 100, atk: 10, def: 0, speed: 10 };
        let e = this.enemy;

        if (currentPHp === null) currentPHp = p.hp;
        if (currentEHp === null) currentEHp = e.hp;

        if (currentTurn === 1) {
            this._log(`遭遇了 ${e.name} (HP: ${currentEHp})！`);
        }

        if (currentTurn > this.maxTurns) {
            this._log("双方精疲力尽，各自罢兵...");
            if (window.saveGame) window.saveGame();
            this._renderEnd("平局");
            return;
        }

        this._log(`<div class="turn-divider">--- 第 ${currentTurn} 回合 ---</div>`);

        const playerFirst = (p.speed || 10) >= (e.speed || 10);
        let isWin = false;
        let isDead = false;

        if (playerFirst) {
            currentEHp -= this._performAttack("你", p, e, true);
            if (currentEHp <= 0) isWin = true;
            else {
                currentPHp -= this._performAttack(e.name, e, p, false);
                if (currentPHp <= 0) isDead = true;
            }
        } else {
            currentPHp -= this._performAttack(e.name, e, p, false);
            if (currentPHp <= 0) isDead = true;
            else {
                currentEHp -= this._performAttack("你", p, e, true);
                if (currentEHp <= 0) isWin = true;
            }
        }

        this._updateUIStats(Math.max(0, currentPHp), Math.max(0, currentEHp));

        if (isWin) {
            this._handleVictory();
            return;
        }
        if (isDead) {
            this._handleDefeat(currentPHp);
            return;
        }

        this.timer = setTimeout(() => {
            this._runCombatLoopAsync(currentTurn + 1, currentPHp, currentEHp);
        }, 800);
    },

    // 【核心修改】执行攻击计算 + 生成 Tooltip
    _performAttack: function(attackerName, atkStats, defStats, isPlayerAttacking) {
        const atkVal = atkStats.atk || 1;
        const defVal = defStats.def || 0;
        const spdAtk = atkStats.speed || 10;
        const spdDef = defStats.speed || 10;

        // 1. 闪避判定
        let dodgeRate = 0.05 + (spdDef - spdAtk) / 100;
        dodgeRate = Math.max(0, Math.min(0.60, dodgeRate));

        if (Math.random() < dodgeRate) {
            const color = isPlayerAttacking ? "#aaa" : "#aaa";
            this._log(`${attackerName} 发起攻击，但是被 <span style="color:${color}; font-weight:bold;">✨闪避</span> 了！`);
            return 0;
        }

        // 2. 伤害公式 (记录过程变量)
        const ARMOR_CONST = 100;
        const reductionMultiplier = ARMOR_CONST / (ARMOR_CONST + defVal);
        let rawDamage = atkVal * reductionMultiplier;

        // 计算减伤百分比 (用于显示)
        const reductionPercent = Math.floor((1 - reductionMultiplier) * 100);

        // 3. 暴击判定
        let critRate = 0;
        if (isPlayerAttacking) {
            const shen = atkStats.shen || 0;
            critRate = 0 + (shen * 0.01);
            if (atkStats.critRateBonus) critRate += atkStats.critRateBonus;
        } else {
            const rank = atkStats.template || "minion";
            switch (rank) {
                case "lord":  critRate = 0.20; break;
                case "boss":  critRate = 0.15; break;
                case "elite": critRate = 0.10; break;
                default:      critRate = 0.05; break;
            }
        }

        const isCrit = Math.random() < critRate;
        if (isCrit) {
            rawDamage = rawDamage * 1.5;
        }

        // 4. 浮动
        const variance = 0.95 + Math.random() * 0.1;
        let finalDamage = Math.floor(rawDamage * variance);
        finalDamage = Math.max(1, finalDamage);

        // 5. 构建 Tooltip HTML
        // 使用 CSS Grid 或 Flex 布局让信息对齐
        const tooltipHtml = `
            <div class="combat-tooltip-content">
                <div class="tip-row"><span>🗡️ 攻击力</span> <span>${atkVal}</span></div>
                <div class="tip-row"><span>🛡️ 防御力</span> <span>${defVal} <span class="tip-dim">(-${reductionPercent}%)</span></span></div>
                ${isCrit ? `<div class="tip-row tip-crit"><span>💥 暴击</span> <span>x1.5</span></div>` : ''}
                <div class="tip-row"><span>🎲 浮动</span> <span>${(variance*100).toFixed(0)}%</span></div>
                <div class="tip-divider"></div>
                <div class="tip-row tip-total"><span>最终伤害</span> <span>${finalDamage}</span></div>
            </div>
        `;

        // 6. 日志输出
        const color = isPlayerAttacking ? "#d32f2f" : "#1976d2";
        const critText = isCrit ? " <b style='color:#ff9800'>[暴击!]</b>" : "";

        // 包裹 tooltip 结构
        const dmgSpan = `<span class="combat-tooltip-trigger" style="color:${color}; font-weight:bold; cursor:help; border-bottom:1px dotted ${color}; position:relative;">
            ${finalDamage}
            ${tooltipHtml}
        </span>`;

        this._log(`${attackerName} 造成 ${dmgSpan} 点伤害${critText}`);

        return finalDamage;
    },

    // 【新增】注入 CSS 样式
    _injectStyles: function() {
        if (document.getElementById('combat-styles-v4')) return;

        const css = `
            /* 战斗日志基础样式 */
            .turn-divider { margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center; }
            
            /* Tooltip 触发器 */
            .combat-tooltip-trigger { display: inline-block; }
            
            /* Tooltip 内容框 (默认隐藏) */
            .combat-tooltip-content {
                visibility: hidden;
                opacity: 0;
                position: absolute;
                bottom: 110%; /* 显示在上方 */
                left: 50%;
                transform: translateX(-50%);
                width: 180px;
                background: rgba(0, 0, 0, 0.85);
                color: #fff;
                padding: 10px;
                border-radius: 6px;
                font-size: 12px;
                font-family: monospace;
                font-weight: normal; /* 覆盖外部的bold */
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: opacity 0.2s, bottom 0.2s;
                pointer-events: none; /* 防止遮挡鼠标 */
                text-align: left;
                line-height: 1.6;
            }

            /* 小三角 */
            .combat-tooltip-content::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -6px;
                border-width: 6px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
            }

            /* 鼠标悬停显示 */
            .combat-tooltip-trigger:hover .combat-tooltip-content {
                visibility: visible;
                opacity: 1;
                bottom: 125%; /* 稍微上浮 */
            }

            /* 内部布局 */
            .tip-row { display: flex; justify-content: space-between; }
            .tip-dim { color: #aaa; font-size: 0.9em; }
            .tip-crit { color: #ffeb3b; font-weight: bold; }
            .tip-divider { border-top: 1px solid #555; margin: 5px 0; }
            .tip-total { font-size: 14px; color: #4caf50; font-weight: bold; }
        `;

        const style = document.createElement('style');
        style.id = 'combat-styles-v4';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    },

    _updateUIStats: function(pHp, eHp) {
        const elPHp = document.getElementById('combat_p_hp');
        const elEHp = document.getElementById('combat_e_hp');

        if (elPHp) {
            elPHp.innerText = Math.floor(pHp);
            if (pHp < (window.player.derived.hpMax * 0.3)) elPHp.style.color = 'red';
        }
        if (elEHp) {
            elEHp.innerText = Math.floor(eHp);
        }
        if (window.player && window.player.status) {
            window.player.status.hp = pHp;
        }
    },

    _handleVictory: function() {
        this._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`);

        const money = this._randomInt(this.enemy.money[0], this.enemy.money[1]);
        if (money > 0) {
            if (window.UtilsAdd) UtilsAdd.addMoney(money);
            else { if (!this.player.money) this.player.money = 0; this.player.money += money; }
        }

        const drops = this._calculateDrops(this.enemy.drops);
        let rewardHtml = "";

        if (money > 0 || drops.length > 0) {
            rewardHtml += `<div style="background:#e8f5e9; border:1px solid #c8e6c9; padding:10px; margin-top:10px; border-radius:4px;">`;
            if (money > 0) {
                rewardHtml += `<p>获得钱财: <span style="color:#f57f17; font-weight:bold;">+${money}</span></p>`;
            }
            if (drops.length > 0) {
                const titleStyle = (money > 0) ? "margin-top:5px; font-weight:bold;" : "font-weight:bold;";
                rewardHtml += `<div style="${titleStyle}">战利品:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`;
                drops.forEach(drop => {
                    const itemId = drop.id;
                    if (window.UtilsAdd) UtilsAdd.addItem(itemId, 1, false);
                    let itemName = itemId;
                    if (window.GAME_DB && window.GAME_DB.items) {
                        const itemData = window.GAME_DB.items.find(i => i.id === itemId);
                        if (itemData) itemName = itemData.name;
                    }
                    rewardHtml += `<span style="display:inline-block; background:#fff; border:1px solid #ccc; padding:2px 6px; margin:2px; font-size:12px; border-radius:3px; color:#333;">${itemName} x1</span>`;
                });
                rewardHtml += `</div>`;
            }
            rewardHtml += `</div>`;
        } else {
            this._log(`<div style="color:#888; font-size:12px;">(本次战斗一无所获)</div>`);
        }

        if (window.UtilsEnemy) UtilsEnemy.markDefeated(this.enemy.x, this.enemy.y);
        if (this.onWinCallback) this.onWinCallback();
        if (window.saveGame) window.saveGame();

        this._renderEnd("胜利", rewardHtml);
    },

    _handleDefeat: function(finalHp) {
        this._log(`<div style="color:red; font-weight:bold; margin-top:10px;">💀 战斗失败...</div>`);
        this._log("你重伤昏迷，被路人救回了最近的城镇。");

        if (window.player && window.player.status) {
            window.player.status.hp = 1;
        }
        if (window.saveGame) window.saveGame();

        this._renderEnd("失败");

        const footer = document.getElementById('map_combat_footer');
        if (footer) {
            footer.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px;" onclick="window.closeModal()">黯然离去</button>`;
        }
    },

    _calculateDrops: function(dropTable) {
        if (!dropTable || !Array.isArray(dropTable)) return [];
        const result = [];
        dropTable.forEach(entry => {
            if (Math.random() <= entry.rate) result.push({ id: entry.id });
        });
        return result;
    },

    _log: function(msg) {
        if (this.logContainerId) {
            const el = document.getElementById(this.logContainerId);
            if (el) {
                const line = document.createElement('div');
                line.style.marginBottom = '4px';
                line.innerHTML = msg;
                el.appendChild(line);

                el.scrollTop = el.scrollHeight;
                if (el.parentElement) {
                    el.parentElement.scrollTop = el.parentElement.scrollHeight;
                }
                setTimeout(() => {
                    line.scrollIntoView({ behavior: "smooth", block: "end" });
                }, 10);
            }
        } else {
            this.logs.push(msg);
        }
    },

    _renderEnd: function(resultType, extraHtml = "") {
        if (this.logContainerId) {
            const el = document.getElementById(this.logContainerId);
            if (el && extraHtml) {
                const div = document.createElement('div');
                div.innerHTML = extraHtml;
                el.appendChild(div);

                el.scrollTop = el.scrollHeight;
                if (el.parentElement) {
                    el.parentElement.scrollTop = el.parentElement.scrollHeight;
                }
                setTimeout(() => {
                    div.scrollIntoView({ behavior: "smooth", block: "end" });
                }, 10);
            }
        } else {
            const logHtml = this.logs.map(l => `<div>${l}</div>`).join('');
            this._updateModal(`战斗结束 - ${resultType}`, `<div style="max-height:300px; overflow-y:auto;">${logHtml}</div>${extraHtml}`, true);
        }
    },

    _randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    _showCombatModal: function(title, content) {
        if (window.showGeneralModal) window.showGeneralModal(title, content);
    },

    _updateModal: function(title, content, showClose = false) {
        if (window.showGeneralModal) {
            let footer = showClose ? `<button class="ink_btn" onclick="closeModal()">关闭</button>` : null;
            window.showGeneralModal(title, content, footer);
        }
    }
};

window.Combat = Combat;