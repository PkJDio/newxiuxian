// js/action/time.js
//console.log("加载 时间系统 (24小时制 - 修复版)");

// ================= 配置区域 =================
const TIME_CONFIG = {
    HUNGER_PER_HOUR: 2,
    FATIGUE_PER_HOUR: 1
};
// ===========================================

const TimeSystem = {
    monthMap: ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"],
    dayMap: [
        "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
        "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
        "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
    ],

    toChineseNum: function(num) {
        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千', '万'];
        if (num === 0) return digits[0];
        let str = '';
        let i = 0;
        let n = Math.floor(num); // 确保转中文的是整数
        while (n > 0) {
            let d = n % 10;
            if (d !== 0) str = digits[d] + units[i] + str;
            else if (str.length > 0 && str[0] !== digits[0]) str = digits[0] + str;
            n = Math.floor(n / 10);
            i++;
        }
        if (str.startsWith('一十')) str = str.substring(1);
        return str;
    },

    /**
     * 获取时间字符串 (已修改为：秦始皇三十七年 01月 15日 13:08 格式)
     */
    getTimeString: function() {
        if (!player || !player.time) return "混沌未开";
        const t = player.time;

        // 1. 年份保持中文显示
        const yearChar = this.toChineseNum(t.year);
        const yearStr = `秦始皇${yearChar}年`;

        // 2. 月份改为数字补零显示 (例如: 01月)
        const monthStr = t.month.toString().padStart(2, '0') + "月";

        // 3. 日期改为数字补零显示 (例如: 15日)
        const dayStr = t.day.toString().padStart(2, '0') + "日";

        // ---【时间处理逻辑保持不变】---
        let rawHour = t.hour || 0;
        let rawMin = t.minute || 0;

        if (rawHour % 1 !== 0) {
            let decimalPart = rawHour % 1;
            rawMin += decimalPart * 60;
            rawHour = Math.floor(rawHour);
        }

        let displayHour = Math.floor(rawHour);
        let displayMin = Math.floor(rawMin);

        while (displayMin >= 60) {
            displayMin -= 60;
            displayHour += 1;
        }
        displayHour = displayHour % 24;

        // 4. 格式化 HH:mm
        const hh = displayHour.toString().padStart(2, '0');
        const mm = displayMin.toString().padStart(2, '0');

        // 返回拼接后的字符串
        return `${yearStr} ${monthStr} ${dayStr} ${hh}:${mm}`;
    },

    /**
     * 时间流逝
     */
    passTime: function(hours, extraHungerCost = 0, extraFatigueCost = 0) {
        if (!player) return;
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0, minute: 0 };
        if (player.time.minute === undefined) player.time.minute = 0;

        if (player.status.fatigue === undefined) player.status.fatigue = 0;
        if (player.status.hunger === undefined) player.status.hunger = 100;

        // 1. 状态消耗
        const totalHungerCost = (hours * TIME_CONFIG.HUNGER_PER_HOUR) + extraHungerCost;
        const totalFatigueInc = (hours * TIME_CONFIG.FATIGUE_PER_HOUR) + extraFatigueCost;

        if (totalHungerCost > 0) {
            player.status.hunger -= totalHungerCost;
            if (player.status.hunger < 0) player.status.hunger = 0;
        }

        if (totalFatigueInc > 0) {
            player.status.fatigue += totalFatigueInc;
        }

        this._checkStatusDebuffs();

        // 2. 【修复核心】时间计算 - 强制整数化
        let t = player.time;

        // 1) 先清理旧数据：如果 t.hour 是小数，先修正
        if (t.hour % 1 !== 0) {
            let decimalPart = t.hour % 1;
            t.minute += decimalPart * 60;
            t.hour = Math.floor(t.hour);
        }

        // 2) 增加新时间
        const minutesToAdd = Math.floor(hours * 60);
        t.minute += minutesToAdd;

        // 3) 进位逻辑
        while (t.minute >= 60) {
            t.minute -= 60;
            t.hour += 1;
        }
        // 强制 hour 为整数 (双重保险)
        t.hour = Math.floor(t.hour);

        while (t.hour >= 24) {
            t.hour -= 24;
            t.day += 1;
            this._onNewDay();
        }
        while (t.day > 30) {
            t.day -= 30;
            t.month += 1;
            //跨月的时候清空player.shopLogs
            player.shopLogs = {};
        }
        while (t.month > 12) {
            t.month -= 12;
            t.year += 1;
            player.age += 1;
        }

        // Buff 和 UI
        // //console.log("时间流逝:", hours, "小时");


        this._checkBuffs(hours);

        if (window.updateUI) window.updateUI();
        // if (window.saveGame) window.saveGame();
    },

    // ... (_checkStatusDebuffs, _onNewDay, _checkBuffs 保持之前的代码不变，此处省略以节省篇幅，请保留原有的这些函数) ...

    _checkStatusDebuffs: function() {
        if (!player) return;
        if (!player.buffs) player.buffs = {};

        const maxFatigue = player.derived.fatigueMax || 100;
        const FATIGUE_KEY = 'debuff_fatigue';

        if (player.status.fatigue >= maxFatigue) {
            if (!player.buffs[FATIGUE_KEY]) {
                player.buffs[FATIGUE_KEY] = {
                    name: "疲惫", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true
                };
                if(window.showToast) window.showToast("体力透支，行动变得迟缓...");
            }
        } else {
            if (player.buffs[FATIGUE_KEY]) delete player.buffs[FATIGUE_KEY];
        }

        const HUNGER_KEY = 'debuff_hunger';
        if (player.status.hunger <= 0) {
            if (!player.buffs[HUNGER_KEY]) {
                player.buffs[HUNGER_KEY] = {
                    name: "饥饿", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true
                };
                if(window.showToast) window.showToast("腹中空空，手脚无力...");
            }
        } else {
            if (player.buffs[HUNGER_KEY]) delete player.buffs[HUNGER_KEY];
        }
    },

    _onNewDay: function() {},

    _checkBuffs: function(hours) {
        if (!player.buffs) return;
        let hasChange = false;
        for (let id in player.buffs) {
            let buff = player.buffs[id];
            if (buff.days > 9000) continue;
            if (buff.days > 0) {
                //console.log(`[${buff.name||'状态'}] 扣除前剩余 ${buff.days} 天`);
                //读取buff.useHour,不存在的话就当作0
                buff.useHour = buff.useHour || 0;
                buff.useHour += hours;
                //如果buff.useHour大于6，则buff.days减去0.25天，然后buff.useHour-6
                if(buff.useHour>6){
                    buff.days -= 0.25;
                    buff.useHour -= 6;
                }


                if (buff.days <= 0) {
                    buff.days = 0;
                    if(window.showToast) window.showToast(`[${buff.name||'状态'}] 已消散`);
                    hasChange = true;
                    delete player.buffs[id];
                }
            }
        }
        if (hasChange && window.recalcStats) window.recalcStats();
    }
};

window.TimeSystem = TimeSystem;