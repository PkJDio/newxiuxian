// js/action/time.js
// 时间流逝与显示系统
console.log("加载 时间系统");

const TimeSystem = {
    // 时辰映射
    timeMap: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],

    // 月份映射
    monthMap: ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"],

    // 日期映射
    dayMap: [
        "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
        "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
        "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
    ],

    // 数字转中文 (用于年份显示，如 37 -> 三十七)
    toChineseNum: function(num) {
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千', '万'];
        if (num === 0) return digits[0];
        let str = '';
        let i = 0;
        let n = num;
        while (n > 0) {
            let d = n % 10;
            if (d !== 0) {
                str = digits[d] + units[i] + str;
            } else if (str.length > 0 && str[0] !== digits[0]) {
                str = digits[0] + str;
            }
            n = Math.floor(n / 10);
            i++;
        }
        // 修正 "一十三" 为 "十三"
        if (str.startsWith('一十')) {
            str = str.substring(1);
        }
        return str;
    },

    // 获取格式化时间字符串
    getTimeString: function() {
        if (!player || !player.time) return "混沌未开";

        const t = player.time;

        // 【修改】年份显示为 秦始皇xx年
        const yearChar = this.toChineseNum(t.year);
        const yearStr = `秦始皇${yearChar}年`;

        const mIdx = (t.month - 1) % 12;
        const dIdx = (t.day - 1) % 30;

        const monthStr = this.monthMap[mIdx] || `${t.month}月`;
        const dayStr = this.dayMap[dIdx] || `${t.day}日`;

        const hourIdx = Math.floor((t.hour + 1) / 2) % 12;
        const timeStr = this.timeMap[hourIdx] + "时";

        return `${yearStr} ${monthStr} ${dayStr} ${timeStr}`;
    },

    /**
     * 核心：时间流逝
     */
    passTime: function(hours, hungerCost, fatigueCost) {
        if (!player) return;
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0 };

        // 1. 状态变更
        if (hungerCost > 0) {
            player.status.hunger -= hungerCost;
            if (player.status.hunger < 0) player.status.hunger = 0;
        }

        if (fatigueCost > 0) {
            if (player.status.fatigue === undefined) player.status.fatigue = 0;
            player.status.fatigue += fatigueCost;
            // 上限检查在 updateUI / recalcStats
        }

        // 2. 时间增加
        let t = player.time;
        t.hour += hours;

        // 进位逻辑
        while (t.hour >= 24) {
            t.hour -= 24;
            t.day += 1;
            this._onNewDay();
        }
        while (t.day > 30) {
            t.day -= 30;
            t.month += 1;
        }
        while (t.month > 12) {
            t.month -= 12;
            t.year += 1;
            player.age += 1; // 增加岁数
        }

        // 3. Buff 倒计时
        const daysPassed = hours / 24;
        this._checkBuffs(daysPassed);

        // 4. 刷新全局 UI
        if (window.updateUI) window.updateUI();
    },

    _onNewDay: function() {
        // 每日逻辑
    },

    _checkBuffs: function(passedDays) {
        if (!player.buffs) return;
        let hasChange = false;

        for (let id in player.buffs) {
            let buff = player.buffs[id];
            if (buff.days > 0) {
                buff.days -= passedDays;
                if (buff.days <= 0) {
                    buff.days = 0;
                    if(window.showToast) window.showToast(`[${buff.name||'状态'}] 已消散`);
                    hasChange = true;
                }
            }
        }

        if (hasChange && window.recalcStats) window.recalcStats();
    }
};

window.TimeSystem = TimeSystem;