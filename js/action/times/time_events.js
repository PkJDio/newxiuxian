// js/action/times/time_events.js
// 职责：业务逻辑分发器。连接时间系统与具体玩法（历史、怪物、任务等）

const TimeEvents = {
    /** 每天触发一次 (24:00) */
    onNewDay: function() {
        // 1. 任务系统结算
        if (window.BountyBoard) window.BountyBoard.checkAllTasksStatus();

        // 2. 历史线检查
        TimeHistory.checkMajor(); // 检查大事件 (如沙丘惊变)
        TimeHistory.checkMinor(); // 检查每日传闻

        // 3. 危险度与怪物主动来袭
        TimeRaid.updateStability(); // 每日杀气消退
        TimeRaid.checkRaid();      // 判定怪物是否来袭
    },

    /** 每月触发一次 (30日结束) */
    onNewMonth: function() {
        console.log("[TimeEvents] 进入新的一月，重置商店库存/日志...");
        if (window.player) player.shopLogs = {};

        // --- 预留位：您可以在此处插入每月逻辑 (如月度灵力波动、坊市刷新等) ---
    },

    /** 每年触发一次 (12月结束) */
    onNewYear: function() {
        console.log("[TimeEvents] 爆竹声中一岁除，进入新的一年...");

        // --- 预留位：您可以在此处插入每年逻辑 (如年龄晋升事件、宗门大比等) ---
    },

    /** 状态异常(饥饿/疲惫)检查 */
    checkStatusDebuffs: function() {
        if (!player || !player.buffs) return;
        const p = player;
        const maxFatigue = p.derived.fatigueMax || 100;

        // 疲惫判定
        if (p.status.fatigue >= maxFatigue) {
            if (!p.buffs['debuff_fatigue']) {
                p.buffs['debuff_fatigue'] = { name: "疲惫", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true };
                if(window.showToast) window.showToast("体力透支，举步维艰...");
            }
        } else if (p.buffs['debuff_fatigue']) {
            delete p.buffs['debuff_fatigue'];
        }

        // 饥饿判定
        if (p.status.hunger <= 0) {
            if (!p.buffs['debuff_hunger']) {
                p.buffs['debuff_hunger'] = { name: "饥饿", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true };
                if(window.showToast) window.showToast("腹中空空，饥肠辘辘...");
            }
        } else if (p.buffs['debuff_hunger'] && p.status.hunger > 30) {
            delete p.buffs['debuff_hunger'];
            if(window.showToast) window.showToast("饥饿感消散了...");
        }
    },

    /** 执行 BUFF 持续时间扣减 */
    applyBuffReduction: function(reductionDays) {
        if (!player.buffs) return;
        let hasChange = false;

        for (let id in player.buffs) {
            let buff = player.buffs[id];
            if (buff.days > 9000) continue; // 跳过永久Buff

            buff.days -= reductionDays;
            buff.days = Math.round(buff.days * 10) / 10; // 防止精度问题

            if (buff.days <= 0) {
                if(window.showToast) window.showToast(`状态 [${buff.name}] 已消散`);
                delete player.buffs[id];
                hasChange = true;
            }
        }
        if (hasChange && window.recalcStats) window.recalcStats();
    },

    /** 每 2.4 小时自动回蓝逻辑 */
    applyNaturalRecovery: function() {
        if (!player || !player.status) return;
        const maxMp = player.derived.mpMax || 100;
        player.status.mp = Math.min(maxMp, (player.status.mp || 0) + maxMp / 10);
    }
};