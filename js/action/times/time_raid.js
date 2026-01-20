// js/action/times/time_raid.js
// 职责：处理危险度(Danger)变化及怪物主动来袭(Raid)逻辑

const TimeRaid = {
    /** 每日杀气消退逻辑 */
    updateStability: function() {
        if (!player) return;

        // 【新增】如果危机还没开启(0)，不处理危险度
        if (!player.startDanger || player.startDanger === 0) return;

        player.danger = player.danger || 0;
        player.need_kill = (player.need_kill || 0) + 20;

        // 如果玩家 5 天没杀怪，杀气归零 (危险度0更容易被袭击)
        if (player.need_kill >= 100) {
            player.danger = 0;
            player.need_kill = 0;
            if(window.LogManager) window.LogManager.add("<span style='color:green'>[环境] 缠绕在你周身的杀气消散了</span>");
        }
    },

    /** 怪物来袭判定 */
    checkRaid: function() {
        if (!player) return;

        // 初始化
        if (typeof player.startDanger === 'undefined') player.startDanger = 0;

        // 阶段 0: 太平盛世 (大事件未确认前) -> 跳过
        if (player.startDanger === 0) return;

        // 阶段 1: 危机初现 (大事件确认后的第二天) -> 必定触发剧情杀
        if (player.startDanger === 1) {
            this._triggerScriptedRaid();
            return;
        }

        // 阶段 2: 乱世求生 (首次袭击挺过去后) -> 正常随机袭击
        if (player.startDanger === 2) {
            const raidChance = 100 - (player.danger || 0);
            const finalChance = Math.min(80, raidChance); // 最高80%概率

            if (Math.random() * 100 < finalChance) {
                this._triggerRandomRaid();
            }
        }
    },
    /** * 【新增】强制检测重连
     * 用于 window.onload 或 TimeSystem 启动时调用
     */
    /** 强制检测重连 */
    forceReconnectRaid: function() {
        console.log("player.startDanger=", player.startDanger);
        if (!player || player.startDanger !== 1) return;

        // 【修正点】通过检查 DOM 元素的 display 属性来判断战斗窗口是否已打开
        const modal = document.getElementById('map_combat_modal');
        if (modal && modal.style.display === 'flex') {
            console.log("[TimeRaid] 战斗窗口已在运行中，跳过重连触发");
            return;
        }

        console.warn("[TimeRaid] 检测到挂起的剧情袭击，强行重回战斗...");
        this._triggerScriptedRaid();
    },

    /** 剧情来袭 */
    _triggerScriptedRaid: function() {
        // 计算波数
        const waves = Math.max(1, Math.floor(3 - (player.danger || 0) / 30));

        // 触发前存档，确保刷新后 startDanger 依然是 1
        if (window.saveGame) window.saveGame();

        if (window.testRaid) {
            window.testRaid("boss", waves, true, () => {
                console.log("[TimeRaid] 剧情袭击成功，状态推进");
                player.startDanger = 2; // 战斗彻底胜利后才推进到随机袭击阶段
                if (window.saveGame) window.saveGame();
            });
        }
    },

    /** 随机来袭 */
    _triggerRandomRaid: function() {
        const ranks = ["minion", "elite", "boss"];
        const r = Math.random();
        let target = "minion";
        if (r > 0.9) target = "boss";
        else if (r > 0.6) target = "elite";

        if (window.LogManager) window.LogManager.add(`[系统] 危险度过高，黑暗中有东西在窥视你...`);
        this._startRaidChain([target]);
    },

    /** 启动战斗链 (随机袭击用，简单递归) */
    _startRaidChain: function(ranks) {
        if (!ranks || ranks.length === 0) return;

        const currentRank = ranks.shift();
        const enemy = UtilsEnemy.createEnemyByRank ? UtilsEnemy.createEnemyByRank(currentRank) : null;
        if (!enemy) return;

        setTimeout(() => {
            if (window.UICombatModal) {
                UICombatModal.show(enemy, () => {
                    if (ranks.length > 0) {
                        if (window.LogManager) window.LogManager.add("击退了前锋，但后方还有强敌逼近！", "warning");
                        this._startRaidChain(ranks);
                    }
                }, { canEscape: false, isMultiWave: (ranks.length > 0) });
            }
        }, 800);
    }
};

// ==========================================
// 全局 Raid 测试函数 (已增强：支持胜利回调)
// ==========================================
window.testRaid = function(rank = 'minion', waves = 1, isDeath = true, onAllWin = null) {
    console.log(`%c[Raid Test] 启动模拟：级别=${rank}, 波次=${waves}, 死斗=${isDeath}`, "color: #1e88e5; font-weight: bold;");

    if (!window.EVENT_RAID_ENEMIES) {
        console.error("错误: 未找到 EVENT_RAID_ENEMIES 配置。");
        return;
    }

    const NEAR_DEATH_ID = 'buff_near_death';

    // 1. 战前准备：添加濒死 BUFF
    if (isDeath && window.player) {
        if (!window.player.buffs) window.player.buffs = {};
        if (window.addBuff) {
            window.addBuff(NEAR_DEATH_ID, {
                name: "濒死",
                attr: "状态",
                val: "重伤",
                days: 7,
                source: "战斗失败",
                isDebuff: true,
                desc: "你刚从鬼门关回来，身体极度虚弱。若在此期间再次重伤，恐有性命之忧。"
            });
        }
        if(window.showToast) window.showToast("⚠️ 遭遇强敌，陷入【濒死】状态！战败即死！");
        if(window.updateUI) window.updateUI();
    }

    const startWave = (currentWave, totalWaves, currentRank) => {
        // 2. 获取敌人
        const pool = window.EVENT_RAID_ENEMIES[currentRank];
        if (!pool || pool.length === 0) {
            console.error(`错误: 级别 [${currentRank}] 的敌人池为空`);
            return;
        }
        const template = pool[Math.floor(Math.random() * pool.length)];
        const enemyInstance = UtilsEnemy._buildEnemyInstance(template, 400, 300);
        console.log(`%c[波次 ${currentWave}/${totalWaves}] 敌人: ${enemyInstance.name}`, "color: #43a047;", enemyInstance);

        const isLastWave = currentWave >= totalWaves;

        // 3. 战斗配置
        const finalOptions = {
            canEscape: false,
            isMultiWave: !isLastWave, // 如果不是最后一波，显示“下一波”而不是关闭
            allowOutsideClick: false,
            allowEsc: false,
            isDeathBattle: isDeath
        };

        // 4. 胜利回调
        const onWinCallback = () => {
            if (!isLastWave) {
                // --- 中途胜利：准备下一波 ---
                console.log(`%c[波次 ${currentWave}] 胜利！`, "color: #fb8c00;");

                // 难度递增逻辑 (根据你的需求保留)
                let nextRank = currentRank;
                if (currentWave === 1) nextRank = 'elite';
                if (currentWave === 2) nextRank = 'boss';
                if (currentWave >= 3) nextRank = 'lord';

                // 手动渲染“迎战下一波”按钮
                const footer = document.getElementById('map_combat_footer');
                if (footer) {
                    const nextBtnId = 'btn_next_wave_' + Date.now();
                    footer.innerHTML = `
                        <div style="width:100%; text-align:center; color:#f57f17; font-weight:bold; margin-bottom:5px; font-size:16px;">
                            ⚠️ 敌军援军已至，请整顿备战！
                        </div>
                        <button id="${nextBtnId}" class="ink_btn_danger" style="width:100%; height:45px; font-size:20px; font-weight:bold; box-shadow: 0 0 10px rgba(211, 47, 47, 0.4);">
                            ⚔️ 迎战下一波
                        </button>
                    `;
                    document.getElementById(nextBtnId).onclick = function() {
                        this.innerText = "正在加载...";
                        this.disabled = true;
                        startWave(currentWave + 1, totalWaves, nextRank);
                    };
                }
            } else {
                // --- 最终胜利 ---
                console.log("%c[测试结束] 最终胜利！", "color: #fdd835; font-weight: bold;");
                if(window.showToast) window.showToast("🎉 守城成功！");

                // 移除濒死BUFF
                if (isDeath && window.player && window.player.buffs && window.player.buffs[NEAR_DEATH_ID]) {
                    delete window.player.buffs[NEAR_DEATH_ID];
                    if(window.updateUI) window.updateUI();
                }

                // 【核心修改】执行外部传入的胜利回调 (这里才会修改 startDanger)
                if (onAllWin && typeof onAllWin === 'function') {
                    onAllWin();
                }
            }
        };

        // 5. 显示战斗
        if (window.UICombatModal) {
            if (currentWave === 1) {
                UICombatModal.show(enemyInstance, onWinCallback, finalOptions);
            } else {
                UICombatModal.nextWave(enemyInstance, onWinCallback, finalOptions);
            }
        } else {
            console.error("错误: 未找到 UICombatModal 模块。");
        }
    };

    // 启动第一波
    const initialRank = waves > 1 ? 'minion' : rank;
    startWave(1, waves, initialRank);
};