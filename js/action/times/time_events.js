// js/action/times/time_events.js
// 职责：业务逻辑分发器 (Debug版)

const TimeEvents = {
    onNewDay: function() {
        console.groupCollapsed("[TimeEvents] 每日结算");

        // 1. 任务结算
        if (window.BountyBoard) window.BountyBoard.checkAllTasksStatus();

        // 2. 历史线检查
        // 如果今天触发了大事件，startDanger 依然是 0 (直到玩家点确认)
        // 所以下面的 Raid 检查会直接 return，完美达成"等待确认"的效果
        console.log("-> 检查历史事件...");
        TimeHistory.checkMajor();
        TimeHistory.checkMinor();

        // 3. 怪物来袭
        // startDanger=0 -> 跳过
        // startDanger=1 -> 剧情杀
        // startDanger=2 -> 随机杀
        console.log("-> 检查怪物来袭...");
        TimeRaid.updateStability();
        TimeRaid.checkRaid();

        console.groupEnd();
    },

    onNewMonth: function() {
        console.log("[TimeEvents] 月度结算...");
        if (window.player) player.shopLogs = {};
    },

    onNewYear: function() {
        console.log("[TimeEvents] 年度结算...");
    },

    checkStatusDebuffs: function() {
        if (!player || !player.buffs) return;
        const p = player;
        const maxFatigue = p.derived.fatigueMax || 100;

        if (p.status.fatigue >= maxFatigue) {
            if (!p.buffs['debuff_fatigue']) {
                p.buffs['debuff_fatigue'] = { name: "疲惫", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true };
            }
        } else if (p.buffs['debuff_fatigue']) {
            delete p.buffs['debuff_fatigue'];
        }

        if (p.status.hunger <= 0) {
            if (!p.buffs['debuff_hunger']) {
                p.buffs['debuff_hunger'] = { name: "饥饿", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true };
            }
        } else if (p.buffs['debuff_hunger'] && p.status.hunger > 30) {
            delete p.buffs['debuff_hunger'];
        }
    },

    applyBuffReduction: function(reductionDays) {
        if (!player.buffs) return;
        let hasChange = false;
        for (let id in player.buffs) {
            let buff = player.buffs[id];
            if (buff.days > 9000) continue;
            buff.days -= reductionDays;
            if (buff.days <= 0) {
                delete player.buffs[id];
                hasChange = true;
            }
        }
        if (hasChange && window.recalcStats) window.recalcStats();
    },

    applyNaturalRecovery: function() {
        if (!player || !player.status) return;
        const maxMp = player.derived.mpMax || 100;
        player.status.mp = Math.min(maxMp, (player.status.mp || 0) + maxMp / 10);
    }
};