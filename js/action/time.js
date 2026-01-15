// js/action/time.js
// 时间系统总控 v10.3 (Debug版)

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
        if (!window.player || !window.player.time) {
            window.player = window.player || {};
            window.player.time = { year: 1, month: 1, day: 1, hour: 0, minute: 0 };
        }
        const t = window.player.time;
        const pad = (n) => {
            const val = (n === undefined || n === null) ? 1 : n;
            return val.toString().padStart(2, '0');
        };
        if (t.month === undefined) t.month = 1;
        if (t.day === undefined) t.day = 1;
        if (t.hour === undefined) t.hour = 0;
        if (t.minute === undefined) t.minute = 0;

        const yearChar = this.toChineseNum(Number(t.year) || 1);
        return `秦始皇${yearChar}年 ${pad(t.month)}月 ${pad(t.day)}日 ${pad(t.hour)}:${pad(t.minute)}`;
    },

    setTime: function(year, month, day, hour, minute) {
        if (!window.player || !window.player.time) return;
        const t = window.player.time;
        if (year !== undefined) t.year = Number(year);
        if (month !== undefined) t.month = Number(month);
        if (day !== undefined) t.day = Number(day);
        if (hour !== undefined) t.hour = Number(hour);
        if (minute !== undefined) t.minute = Number(minute);
        console.log(`%c[TimeSystem] 时间已强制调整为: ${this.getTimeString()}`, "color: orange; font-weight: bold;");
        if (window.updateUI) window.updateUI();
    },

    passTime: function(hours, extraHungerCost = 0, extraFatigueCost = 0) {
        if (!player) return;
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0, minute: 0, useHour: 0 };

        let t = player.time;
        const hoursToAdd = Number(hours) || 0;

        // 状态消耗
        player.status.hunger = Math.max(0, (player.status.hunger || 0) - (hoursToAdd * TIME_CONFIG.HUNGER_PER_HOUR + extraHungerCost));
        player.status.fatigue = Math.min(200, (player.status.fatigue || 0) + (hoursToAdd * TIME_CONFIG.FATIGUE_PER_HOUR + extraFatigueCost));
        TimeEvents.checkStatusDebuffs();

        // 物理时间进位
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

                // 核心修复逻辑：先处理跨月/跨年，再触发新的一天
                if (t.day > 30) {
                    console.log(`%c[TimeSystem] 📅 月份进位触发: 从 ${t.month}月${t.day}日 -> ${t.month+1}月1日`, "color: #9c27b0");
                    t.day = 1;
                    t.month += 1;

                    if (t.month > 12) {
                        console.log(`%c[TimeSystem] 🎆 年份进位触发: ${t.year} -> ${t.year+1}`, "color: #e91e63");
                        t.month = 1;
                        t.year += 1;
                        player.age = (player.age || 16) + 1;
                        TimeEvents.onNewYear();
                    }
                    TimeEvents.onNewMonth();
                }

                // 打印当前确切日期，用于调试
                console.log(`%c[TimeSystem] 🌞 新的一天开始: ${t.year}年${t.month}月${t.day}日`, "color: #2196f3");
                TimeEvents.onNewDay();
            }
        }

        t.useHour = (t.useHour || 0) + hoursToAdd;
        if (t.useHour >= 2.4) {
            const count = Math.floor(t.useHour / 2.4);
            t.useHour -= count * 2.4;
            TimeEvents.applyNaturalRecovery();
            TimeEvents.applyBuffReduction(count * 0.1);
        }

        if (window.updateUI) window.updateUI();
    }
};

window.TimeSystem = TimeSystem;