// js/action/times/time_raid.js
// 职责：处理危险度(Danger)变化及怪物主动来袭(Raid)逻辑

const TimeRaid = {
    /** 每日杀气消退逻辑 */
    updateStability: function() {
        if (!player) return;
        player.danger = player.danger || 0;
        player.need_kill = (player.need_kill || 0) + 20;

        // 如果玩家 5 天没杀怪，杀气归零
        if (player.need_kill >= 100) {
            player.danger = 0;
            player.need_kill = 0;
            if(window.LogManager) window.LogManager.add("<span style='color:green'>[环境] 缠绕在你周身的杀气消散了，你感到一阵莫名的轻松。</span>");
        }
    },

    /** 怪物来袭判定 */
    checkRaid: function() {
        if (!player || player.timeStart < 1) return; // 只有在祖龙崩逝(Stage1)后才会发生来袭

        // 1. 检查第一个大事件触发后的“剧情杀”
        if (player.timeStart === 1 && !player.flags?.scripted_raid_done) {
            if (!player.flags) player.flags = {};
            this._triggerScriptedRaid();
            player.flags.scripted_raid_done = true;
            return;
        }

        // 2. 每日随机来袭 (概率：100 - 危险度)
        // 危险度越高，说明你杀怪多，怪反而不敢随便骚扰；危险度低，怪会主动找上门。
        const raidChance = 100 - (player.danger || 0);
        if (Math.random() * 100 < raidChance) {
            this._triggerRandomRaid();
        }
    },

    /** 剧情来袭 (多波次) */
    _triggerScriptedRaid: function() {
        // 波数 = 3 - 危险度/30
        const waves = Math.max(1, Math.floor(3 - (player.danger || 0) / 30));
        const waveConfigs = [["boss"], ["elite", "boss"], ["minion", "elite", "boss"]];

        if (window.LogManager) window.LogManager.add(`<span style='color:red; font-weight:bold;'>[警报] 随着灵气倒灌，野外的怪物变得狂暴，它们嗅着人味冲过来了！</span>`);

        this._startRaidChain(waveConfigs[waves - 1] || ["boss"]);
    },

    /** 随机来袭 */
    _triggerRandomRaid: function() {
        const ranks = ["minion", "elite", "boss"];
        const target = ranks[Math.floor(Math.random() * ranks.length)];

        if (window.LogManager) window.LogManager.add(`[系统] 一阵令人不安的低吼从林中传来...`);
        this._startRaidChain([target]);
    },

    /** 启动战斗链 (无法逃跑) */
    _startRaidChain: function(ranks) {
        if (!ranks || ranks.length === 0) return;

        const currentRank = ranks.shift();
        const enemy = UtilsEnemy.createEnemyByRank ? UtilsEnemy.createEnemyByRank(currentRank) : null;
        if (!enemy) return;

        // 战斗弹窗
        setTimeout(() => {
            if (window.UICombatModal) {
                UICombatModal.show(enemy, () => {
                    // 胜利后的回调：如果有下一波，递归启动
                    if (ranks.length > 0) {
                        if (window.LogManager) window.LogManager.add("战斗还未结束，后方又有强敌逼近！");
                        this._startRaidChain(ranks);
                    }
                }, {
                    canEscape: false, // 强制战斗
                    isMultiWave: (ranks.length > 0) // 是否还有下一波
                });
            }
        }, 1000);
    }
};