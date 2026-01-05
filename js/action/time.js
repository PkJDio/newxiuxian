// js/action/time.js
console.log("加载 时间系统");

// ================= 配置区域 =================
const TIME_CONFIG = {
    // 基础代谢：每经过1小时，消耗多少饱食度
    HUNGER_PER_HOUR: 2,
    // 基础代谢：每经过1小时，增加多少疲劳度
    FATIGUE_PER_HOUR: 1
};
// ===========================================

const TimeSystem = {
    // ... (原有的映射保持不变) ...
    timeMap: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
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
        let n = num;
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

    getTimeString: function() {
        if (!player || !player.time) return "混沌未开";
        const t = player.time;
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
    passTime: function(hours, extraHungerCost = 0, extraFatigueCost = 0) {
        if (!player) return;
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0 };

        // 确保状态字段存在
        if (player.status.fatigue === undefined) player.status.fatigue = 0;
        if (player.status.hunger === undefined) player.status.hunger = 100;

        // 1. 计算总消耗
        const totalHungerCost = (hours * TIME_CONFIG.HUNGER_PER_HOUR) + extraHungerCost;
        const totalFatigueInc = (hours * TIME_CONFIG.FATIGUE_PER_HOUR) + extraFatigueCost;

        // 2. 应用状态变更
        if (totalHungerCost > 0) {
            player.status.hunger -= totalHungerCost;
            if (player.status.hunger < 0) player.status.hunger = 0;
        }

        if (totalFatigueInc > 0) {
            player.status.fatigue += totalFatigueInc;
        }

        // 【新增步骤】立即检查是否触发 Debuff (疲惫/饥饿)
        this._checkStatusDebuffs();

        // 3. 时间增加逻辑
        let t = player.time;
        t.hour += hours;

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
            player.age += 1;
        }

        // 4. Buff 时间流逝 和 UI刷新
        const daysPassed = hours / 24;
        this._checkBuffs(daysPassed);

        if (window.updateUI) window.updateUI();

        // 【新增】自动保存
        if (window.saveGame) window.saveGame();
    },

    /**
     * 【新增】状态 Debuff 检查逻辑
     * 负责根据当前的 疲劳值/饱食度 自动添加或移除对应的 Buff
     */
    _checkStatusDebuffs: function() {
        if (!player) return;
        if (!player.buffs) player.buffs = {}; // 确保 buffs 对象存在

        // --- 1. 疲劳检测 ---
        const maxFatigue = player.derived.fatigueMax || 100;
        const FATIGUE_KEY = 'debuff_fatigue';

        if (player.status.fatigue >= maxFatigue) {
            // 如果还没加上这个Buff，就加上
            if (!player.buffs[FATIGUE_KEY]) {
                player.buffs[FATIGUE_KEY] = {
                    name: "疲惫",
                    attr: "全属性",
                    val: "减半",       // UI显示文字
                    color: "#d32f2f", // 红色警示
                    days: 9999,       // 持续直到状态恢复
                    isDebuff: true    // 标记
                };
                if(window.showToast) window.showToast("体力透支，行动变得迟缓...");
            }
        } else {
            // 如果数值正常了，但身上还有这个Buff，就移除
            if (player.buffs[FATIGUE_KEY]) {
                delete player.buffs[FATIGUE_KEY];
                if(window.showToast) window.showToast("体力稍微恢复了一些。");
            }
        }

        // --- 2. 饥饿检测 ---
        const HUNGER_KEY = 'debuff_hunger';

        if (player.status.hunger <= 0) {
            if (!player.buffs[HUNGER_KEY]) {
                player.buffs[HUNGER_KEY] = {
                    name: "饥饿",
                    attr: "全属性",
                    val: "减半",
                    color: "#d32f2f",
                    days: 9999,
                    isDebuff: true
                };
                if(window.showToast) window.showToast("腹中空空，手脚无力...");
            }
        } else {
            if (player.buffs[HUNGER_KEY]) {
                delete player.buffs[HUNGER_KEY];
                if(window.showToast) window.showToast("饱食感让你恢复了力气。");
            }
        }
    },

    _onNewDay: function() {
        // 每日逻辑
    },

    _checkBuffs: function(passedDays) {
        if (!player.buffs) return;
        let hasChange = false;

        // 遍历所有 Buff
        for (let id in player.buffs) {
            let buff = player.buffs[id];

            // 跳过那种永久持续的状态 (days > 9000 通常视为永久，或者你可以专门加个字段判断)
            if (buff.days > 9000) continue;

            if (buff.days > 0) {
                buff.days -= passedDays;
                if (buff.days <= 0) {
                    buff.days = 0;
                    if(window.showToast) window.showToast(`[${buff.name||'状态'}] 已消散`);
                    hasChange = true;
                    // 如果时间到了，删除该 key (避免垃圾数据堆积)
                    delete player.buffs[id];
                }
            }
        }
        if (hasChange && window.recalcStats) window.recalcStats();
    }
};

window.TimeSystem = TimeSystem;