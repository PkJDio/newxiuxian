// js/action/time.js
// 时间系统总控 v10.4 (适配多级移动消耗)

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
        return `秦始皇${yearChar}年 ${pad(t.month)}月${pad(t.day)}日 ${pad(t.hour)}:${pad(t.minute)}`;
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

    // 【核心修改】支持自定义消耗倍率
    // customRates: { hunger: 1, fatigue: 0.5 }
    passTime: function(hours, extraHungerCost = 0, extraFatigueCost = 0, customRates = null) {
        if (!player) return;
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0, minute: 0, useHour: 0 };

        let t = player.time;
        const hoursToAdd = Number(hours) || 0;

        // 1. 凡尘挂机经验结算 (新增)
        // 放在时间更新前或后都可以，这里放在最前面确保逻辑独立
        this._processMortalCultivation(hours);

        // 确定消耗速率 (优先使用自定义，否则使用默认配置)
        const hungerRate = (customRates && customRates.hunger !== undefined) ? customRates.hunger : TIME_CONFIG.HUNGER_PER_HOUR;
        const fatigueRate = (customRates && customRates.fatigue !== undefined) ? customRates.fatigue : TIME_CONFIG.FATIGUE_PER_HOUR;

        // 计算消耗
        const hungerLoss = hoursToAdd * hungerRate + extraHungerCost;
        const fatigueGain = hoursToAdd * fatigueRate + extraFatigueCost;

        UtilsAttribute.consumeHunger(hungerLoss);
        player.status.fatigue = Math.min(200, (player.status.fatigue || 0) + fatigueGain);


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



                // --- 【核心修改】每小时检查是否有未处理的袭击 ---
                if (player.startDanger === 1) {
                    this.forceTriggerRaid(); // 发现待处理袭击，终止时间流转，强制进入战斗
                    return;
                }
            }

            while (t.hour >= 24) {
                t.hour -= 24;

                // 1. 【新增】记录旧的周数 (用于检测跨周)
                // 假设每月30天，以7天为一周期 (0, 1, 2, 3, 4)
                const oldWeek = Math.floor(t.day / 7);

                t.day += 1;

                if (t.day > 30) {
                    console.log(`%c[TimeSystem] 📅 月份进位触发: 从 ${t.month}月${t.day}日 -> ${t.month+1}月1日`, "color: #9c27b0");
                    t.day = 1;
                    t.month += 1;

                    if (t.month > 12) {
                        console.log(`%c[TimeSystem] 🎆 年份进位触发: ${t.year} -> ${t.year+1}`, "color: #e91e63");
                        t.month = 1;
                        t.year += 1;
                        player.age = (player.age || 16) + 1;
                        if(TimeEvents.onNewYear) TimeEvents.onNewYear();
                    }
                    if(TimeEvents.onNewMonth) TimeEvents.onNewMonth();
                }

                // 2. 【新增】检测周数变化 (并在变化时刷新NPC)
                const newWeek = Math.floor(t.day / 7);
                if (newWeek !== oldWeek) {
                    console.log(`[TimeSystem] 周数变更 (${oldWeek} -> ${newWeek})，触发NPC刷新`);
                    if (window.UtilsNPC && window.UtilsNPC.refreshAll) {
                        window.UtilsNPC.refreshAll();
                        if (window.showToast) window.showToast("新的一周开始了，江湖风云变幻...");
                    }
                }

                console.log(`%c[TimeSystem] 🌞 新的一天开始: ${t.year}年${t.month}月${t.day}日`, "color: #2196f3");
                if(TimeEvents.onNewDay) TimeEvents.onNewDay();
            }
        }

        t.useHour = (t.useHour || 0) + hoursToAdd;
        if (t.useHour >= 2.4) {
            const count = Math.floor(t.useHour / 2.4);
            t.useHour -= count * 2.4;
            if(TimeEvents.applyNaturalRecovery) TimeEvents.applyNaturalRecovery();
            if(TimeEvents.applyBuffReduction) TimeEvents.applyBuffReduction(count * 0.1);
        }

        if (window.updateUI) window.updateUI();
    },
    /** 【新增辅助方法】用于从 TimeSystem 强行中断并进入战斗 */
    forceTriggerRaid: function() {
        console.log("%c[TimeSystem] 监测到待处理袭击，强制中断时间流转！", "color:red");
        if (TimeRaid) TimeRaid.forceReconnectRaid();
        if (window.updateUI) window.updateUI();
    },
    /**
     * 【新增】处理凡尘修行挂机经验
     * 算法：1 * 装备功法稀有度之和 * 小时
     */
    _processMortalCultivation: function(hours) {
        // 1. 基础检查：如果已经瓶颈，或者没有凡尘等级数据，则跳过
        if (typeof player.mortal_rank === 'undefined' || player.is_bottleneck) return;

        // 2. 获取装备的功法
        // 假设结构为 player.equipment.gongfa = {0: "id", 1: "id"} 或 Array
        const equipGongfa = (player.equipment && player.equipment.gongfa) ? player.equipment.gongfa : null;
        if (!equipGongfa) return;

        let raritySum = 0;

        // 3. 遍历计算稀有度之和
        // Object.values 兼容数组和以数字为key的对象
        Object.values(equipGongfa).forEach(skillId => {
            if (!skillId) return; // 空槽位跳过

            // 在玩家技能列表中查找详情
            if (books) {
                const book = books.find(book => book.id === skillId);
                // 累加稀有度 (如果数据缺失默认为1)
                raritySum += (book.rarity || 1);
            }
        });

        // 如果稀有度之和 <= 0，不加经验
        if (raritySum <= 0) return;

        // 4. 计算应得经验
        // 公式：1 * 稀有度之和 * 小时
        const expGain = 1 * raritySum * hours / 3;
        
        // 5. 增加经验并检测瓶颈
        if (window.DATA_MORTAL && window.DATA_MORTAL.RANKS) {
            const rank = player.mortal_rank || 0; // 默认为0(凡人)或当前等级
            const rankConfig = window.DATA_MORTAL.RANKS[rank];

            if (rankConfig) {
                // 增加经验
                player.mortal_exp = (player.mortal_exp || 0) + expGain;

                // 检查是否超过上限
                if (player.mortal_exp >= rankConfig.maxExp) {
                    player.mortal_exp = rankConfig.maxExp;
                    player.is_bottleneck = true;

                    if (window.showToast) {
                        window.showToast(`【凡尘修行】修为已至瓶颈，请寻找突破契机！`);
                    }
                } else {
                    // (可选) 调试日志
                    // console.log(`[凡尘挂机] 经过${hours}小时，稀有度和${raritySum}，获得经验${expGain}`);
                }
            }
        }
    },
};

window.TimeSystem = TimeSystem;