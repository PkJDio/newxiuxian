// js/action/time.js
// 时间系统总控 v10.0
// 职责：处理物理时间累加、日历进位、状态基础消耗、调用事件调度器

const TIME_CONFIG = {
    HUNGER_PER_HOUR: 2,
    FATIGUE_PER_HOUR: 1
};

const TimeSystem = {
    monthMap: ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"],

    toChineseNum: function(num) {
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千', '万'];
        if (num === 0) return digits[0];
        let str = '', i = 0, n = Math.floor(num);
        while (n > 0) {
            let d = n % 10;
            if (d !== 0) str = digits[d] + units[i] + str;
            else if (str.length > 0 && str[0] !== digits[0]) str = digits[0] + str;
            n = Math.floor(n / 10); i++;
        }
        if (str.startsWith('一十')) str = str.substring(1);
        return str;
    },

    getTimeString: function() {
        if (!player || !player.time) return "加载中...";
        const t = player.time;
        const pad = (n) => n.toString().padStart(2, '0');
        const yearChar = this.toChineseNum(Number(t.year) || 1);
        return `秦始皇${yearChar}年 ${pad(t.month)}月 ${pad(t.day)}日 ${pad(t.hour)}:${pad(t.minute)}`;
    },

    /**
     * 推进游戏时间
     * @param {number} hours 流逝的小时数
     */
    passTime: function(hours, extraHungerCost = 0, extraFatigueCost = 0) {
        if (!player) return;
        // 初始化时间结构
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0, minute: 0, useHour: 0 };
        if (typeof player.timeStart === 'undefined') player.timeStart = 0;

        let t = player.time;
        const hoursToAdd = Number(hours) || 0;

        // 1. 处理状态消耗 (饥饿/疲惫)
        player.status.hunger = Math.max(0, (player.status.hunger || 0) - (hoursToAdd * TIME_CONFIG.HUNGER_PER_HOUR + extraHungerCost));
        player.status.fatigue = Math.min(200, (player.status.fatigue || 0) + (hoursToAdd * TIME_CONFIG.FATIGUE_PER_HOUR + extraFatigueCost));

        // 调度器：检查是否需要添加饥饿/疲惫Debuff
        TimeEvents.checkStatusDebuffs();

        // 2. 物理时间进位演算
        t.accMins = (t.accMins || 0) + hoursToAdd * 60;
        const minsToApply = Math.floor(t.accMins);

        if (minsToApply >= 1) {
            t.accMins -= minsToApply;
            t.minute += minsToApply;

            while (t.minute >= 60) {
                t.minute -= 60;
                t.hour += 1;
            }
            while (t.hour >= 24) {
                t.hour -= 24;
                t.day += 1;
                // 【核心调度】触发新的一天
                TimeEvents.onNewDay();
            }
            while (t.day > 30) {
                t.day -= 30;
                t.month += 1;
                // 【核心调度】触发新的一月
                TimeEvents.onNewMonth();
            }
            while (t.month > 12) {
                t.month = 1;
                t.year += 1;
                player.age = (player.age || 16) + 1;
                // 【核心调度】触发新的一年
                TimeEvents.onNewYear();
            }
        }

        // 3. 处理周期性逻辑 (每 2.4 小时结算一次 Buff 和 回复)
        t.useHour = (t.useHour || 0) + hoursToAdd;
        if (t.useHour >= 2.4) {
            const count = Math.floor(t.useHour / 2.4);
            t.useHour -= count * 2.4;
            // 调度器：执行自然恢复
            TimeEvents.applyNaturalRecovery();
            // 调度器：执行 Buff 剩余天数扣减
            TimeEvents.applyBuffReduction(count * 0.1);
        }

        if (window.updateUI) window.updateUI();
    }
};

window.TimeSystem = TimeSystem;