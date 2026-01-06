// js/modules/combat.js
// 战斗系统 v3.4 (UI优化：智能奖励显示，无奖励不弹框)
console.log("加载 战斗系统 (Smart Reward)");

const Combat = {
    enemy: null,
    player: null,
    logs: [],
    maxTurns: 50,
    onWinCallback: null,
    logContainerId: null,

    // 运行时状态
    isStopped: false,
    timer: null,

    /**
     * 开始战斗
     */
    start: function(enemyObj, onWin, containerId = null) {
        console.log(">>> [Combat] 开始战斗:", enemyObj.name);
        if (!window.player) return;

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

        this._log(`<div class="turn-divider" style="margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center;">--- 第 ${currentTurn} 回合 ---</div>`);

        const playerFirst = (p.speed || 10) >= (e.speed || 10);
        let isWin = false;
        let isDead = false;

        if (playerFirst) {
            currentEHp -= this._performAttack("你", p, e);
            if (currentEHp <= 0) isWin = true;
            else {
                currentPHp -= this._performAttack(e.name, e, p);
                if (currentPHp <= 0) isDead = true;
            }
        } else {
            currentPHp -= this._performAttack(e.name, e, p);
            if (currentPHp <= 0) isDead = true;
            else {
                currentEHp -= this._performAttack("你", p, e);
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

    _updateUIStats: function(pHp, eHp) {
        const elPHp = document.getElementById('combat_p_hp');
        const elEHp = document.getElementById('combat_e_hp');

        if (elPHp) {
            elPHp.innerText = pHp;
            if (pHp < (window.player.derived.hpMax * 0.3)) elPHp.style.color = 'red';
        }
        if (elEHp) {
            elEHp.innerText = eHp;
        }
        if (window.player && window.player.status) {
            window.player.status.hp = pHp;
        }
    },

    _performAttack: function(attackerName, attackerStats, defenderStats) {
        let atk = attackerStats.atk || 1;
        let def = defenderStats.def || 0;
        let dmg = Math.max(1, atk - def);

        const isCrit = Math.random() < 0.05;
        if (isCrit) dmg = Math.floor(dmg * 1.5);

        const variance = 0.9 + Math.random() * 0.2;
        dmg = Math.floor(dmg * variance);

        const color = (attackerName === "你") ? "#d32f2f" : "#1976d2";
        this._log(`${attackerName} 造成 <span style="color:${color}; font-weight:bold;">${dmg}</span> 点伤害${isCrit ? "(暴击!)" : ""}`);
        return dmg;
    },

    // 【核心修改】胜利结算逻辑 (智能显示)
    _handleVictory: function() {
        this._log(`<div style="color:green; font-weight:bold; margin-top:10px; font-size:16px;">🏆 战斗胜利！</div>`);

        // 1. 计算金钱 (可能为0)
        const money = this._randomInt(this.enemy.money[0], this.enemy.money[1]);

        if (money > 0) {
            if (window.UtilsAdd) {
                UtilsAdd.addMoney(money);
            } else {
                if (!this.player.money) this.player.money = 0;
                this.player.money += money;
            }
        }

        // 2. 计算掉落
        const drops = this._calculateDrops(this.enemy.drops);

        // 3. 构建奖励 HTML
        let rewardHtml = "";

        // 只有当 有钱 OR 有物品 时，才显示绿色奖励框
        if (money > 0 || drops.length > 0) {
            rewardHtml += `<div style="background:#e8f5e9; border:1px solid #c8e6c9; padding:10px; margin-top:10px; border-radius:4px;">`;

            // A. 显示金钱
            if (money > 0) {
                rewardHtml += `<p>获得钱财: <span style="color:#f57f17; font-weight:bold;">+${money}</span></p>`;
            }

            // B. 显示物品
            if (drops.length > 0) {
                // 如果上面已经有钱了，稍微加点间距
                const titleStyle = (money > 0) ? "margin-top:5px; font-weight:bold;" : "font-weight:bold;";

                rewardHtml += `<div style="${titleStyle}">战利品:</div><div style="display:flex; flex-wrap:wrap; gap:5px;">`;

                drops.forEach(drop => {
                    const itemId = drop.id;

                    if (window.UtilsAdd) {
                        UtilsAdd.addItem(itemId, 1, false);
                    }

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
            // 如果啥都没有，日志里补一句
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