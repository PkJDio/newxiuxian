// js/action/time.js
// console.log("加载 时间系统 (含大秦历史线版)");
// 确保 DataTimeline 已经加载，如果没有加载则定义空对象防止报错
const TimelineData = window.DataTimeline || { Major: [], Minor: [] };

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
        let str = '';
        let i = 0;
        let n = Math.floor(num);
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
        if (!player || !player.time) return "加载中...";
        const t = player.time;
        const pad = (n) => {
            const num = parseInt(n);
            return isNaN(num) ? "00" : num.toString().padStart(2, '0');
        };

        const yearChar = this.toChineseNum(Number(t.year) || 1);
        const hh = pad(t.hour);
        const mm = pad(t.minute);

        return `秦始皇${yearChar}年 ${pad(t.month)}月 ${pad(t.day)}日 ${hh}:${mm}`;
    },

    /**
     * 时间流逝核心
     */
    passTime: function(hours, extraHungerCost = 0, extraFatigueCost = 0) {
        if (!player) return;
        if (!player.time) player.time = { year: 37, month: 1, day: 1, hour: 0, minute: 0, useHour: 0 };

        // 初始化 timeStart (如果存档里没有)
        if (typeof player.timeStart === 'undefined') {
            player.timeStart = 0;
        }

        let t = player.time;
        const hoursToAdd = Number(hours) || 0;
        const totalMinsToAdd = hoursToAdd * 60;

        // 1. 状态消耗
        const totalHungerCost = (hoursToAdd * TIME_CONFIG.HUNGER_PER_HOUR) + extraHungerCost;
        const totalFatigueInc = (hoursToAdd * TIME_CONFIG.FATIGUE_PER_HOUR) + extraFatigueCost;
        player.status.hunger = Math.max(0, (Number(player.status.hunger) || 0) - totalHungerCost);
        player.status.fatigue = Math.min(200, (Number(player.status.fatigue) || 0) + totalFatigueInc);
        this._checkStatusDebuffs();

        // 2. 游戏日历时间累加
        t.accMins = (Number(t.accMins) || 0) + totalMinsToAdd;
        const gameMinsToApply = Math.floor(t.accMins);

        if (gameMinsToApply >= 1) {
            t.accMins -= gameMinsToApply;
            t.minute = (Number(t.minute) || 0) + gameMinsToApply;

            while (t.minute >= 60) {
                t.minute -= 60;
                t.hour = (Number(t.hour) || 0) + 1;
            }
            while (t.hour >= 24) {
                t.hour -= 24;
                t.day = (Number(t.day) || 1) + 1;
                // 每天过完时，执行新的一天逻辑（含历史事件检查）
                this._onNewDay();
            }
            while (t.day > 30) {
                t.day -= 30;
                t.month = (Number(t.month) || 1) + 1;
                player.shopLogs = {};
            }
            while (t.month > 12) {
                t.month = 1;
                t.year = (Number(t.year) || 1) + 1;
                player.age = (Number(player.age) || 16) + 1;
            }
        }

        // 3. 【核心修复】BUFF 持续时间累计逻辑
        // 初始化或获取累计小时字段
        t.useHour = (Number(t.useHour) || 0) + hoursToAdd;

        // 设置触发阈值：0.1天 = 2.4小时
        const THRESHOLD = 2.4;

        if (t.useHour >= THRESHOLD) {
            // 计算本次应该扣除多少个 0.1天
            const count = Math.floor(t.useHour / THRESHOLD);
            const totalReduction = count * 0.1; // 扣除的总天数

            // 扣除已使用的累计时间
            t.useHour -= (count * THRESHOLD);

            if (window.player && window.player.status && window.player.derived) {
                // 1. 获取最大法力值 (防呆处理，由 derived.mpMax 提供)
                const maxMp = player.derived.mpMax || 100;

                // 2. 计算回复量 (1/10)
                const recoverAmount = maxMp / 10;

                // 3. 执行回复 (当前mp + 回复量，但不超过 maxMp)
                // 注意：确保 player.status.mp 存在，不存在则初始化为 0
                let currentMp = player.status.mp || 0;
                player.status.mp = Math.min(maxMp, currentMp + recoverAmount);

                // (可选) 如果你希望显示日志，可以加一句
                if(window.LogManager) window.LogManager.add(`[周天运转] 法力自动回复了 ${Math.floor(recoverAmount)} 点。`);
            }

            // 执行 BUFF 扣减
            this._applyBuffReduction(totalReduction);
        }

        if (window.updateUI) window.updateUI();
    },

    /**
     * 执行具体的 BUFF 天数扣减
     */
    _applyBuffReduction: function(reductionDays) {
        if (!player.buffs) return;
        let hasChange = false;

        for (let id in player.buffs) {
            let buff = player.buffs[id];

            // 跳过永久 BUFF（如饥饿、疲惫判定产生的）
            if (buff.days > 9000) continue;

            if (buff.days > 0) {
                buff.days -= reductionDays;

                // 修正浮点数精度问题，保留一位小数
                buff.days = Math.round(buff.days * 10) / 10;

                if (buff.days <= 0) {
                    buff.days = 0;
                    if(window.showToast) window.showToast(`[${buff.name || '状态'}] 已消散`);
                    delete player.buffs[id];
                    hasChange = true;
                }
            }
        }

        if (hasChange && window.recalcStats) window.recalcStats();
    },

    _checkStatusDebuffs: function() {
        if (!player || !player.buffs) return;
        const maxFatigue = player.derived.fatigueMax || 100;

        if (player.status.fatigue >= maxFatigue) {
            if (!player.buffs['debuff_fatigue']) {
                player.buffs['debuff_fatigue'] = { name: "疲惫", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true };
                if(window.showToast) window.showToast("体力透支...");
            }
        } else if (player.buffs['debuff_fatigue']) {
            delete player.buffs['debuff_fatigue'];
        }

        if (player.status.hunger <= 0) {
            if (!player.buffs['debuff_hunger']) {
                player.buffs['debuff_hunger'] = { name: "饥饿", attr: "全属性", val: "减半", color: "#d32f2f", days: 9999, isDebuff: true };
                if(window.showToast) window.showToast("腹中空空...");
            }
        } else if (player.buffs['debuff_hunger']) {
            delete player.buffs['debuff_hunger'];
        }
    },

    _onNewDay: function() {
        // 1. 刷新悬赏
        if (window.BountyBoard && typeof window.BountyBoard.checkAllTasksStatus === 'function') {
            window.BountyBoard.checkAllTasksStatus();
        }

        // 2. 检查历史大事件 (Major Events)
        this._checkMajorEvents();

        // 3. 检查小事件/传闻 (Minor Events)
        this._checkMinorEvents();
    },
    /**
     * 检查并触发【历史大事件】
     */
    _checkMajorEvents: function() {
        if (!player || !player.time || !TimelineData.Major) return;

        let currentStage = player.timeStart || 0;
        const t = player.time;

        for (let event of TimelineData.Major) {
            if (event.stage > currentStage) {
                // 判断条件：年份超过，或者年份相同且月份日期均达到
                // 为了严谨，这里精确到日
                if (t.year > event.year ||
                    (t.year === event.year && t.month > event.month) ||
                    (t.year === event.year && t.month === event.month && t.day >= event.day)) {

                    // 触发大事件
                    player.timeStart = event.stage;

                    // 弹窗
                    if (window.UtilsModal && window.UtilsModal.showEventModal) {
                        window.UtilsModal.showEventModal(event.title, event.desc);
                    } else if (window.showToast) {
                        window.showToast(`历史推进：${event.title}`);
                    }

                    // 日志
                    if (window.LogManager) {
                        window.LogManager.add(`【历史洪流】${event.title}：${event.desc}`, "important");
                    }

                    break; // 一次只触发一个大阶段
                }
            }
        }
    },

    /**
     * 检查并触发【历史小传闻】
     */
    _checkMinorEvents: function() {
        if (!player || !player.time || !TimelineData.Minor) return;

        const t = player.time;
        // 使用一个简单的 Key 来标记今天是否已经触发过事件，防止重复 (可选，如果passTime保证每天只调一次onNewDay则不需要)
        // 这里直接比对日期

        // 查找今天发生的事件列表
        const todayEvents = TimelineData.Minor.filter(e =>
            e.year === t.year && e.month === t.month && e.day === t.day
        );

        if (todayEvents.length > 0) {
            todayEvents.forEach(event => {
                // 构造前缀
                let prefix = "【传闻】";
                if (event.type === 'court') prefix = "【朝廷】";
                if (event.type === 'nature') prefix = "【天象】";
                if (event.type === 'world') prefix = "【天下】";

                // 1. 发送 Toast 提示 (轻量级)
                if (window.showToast) {
                    window.showToast(`${prefix} ${event.text}`);
                }

                // 2. 写入日志 (持久化查看)
                    if (window.LogManager) {
                    // 使用稍微特殊的颜色或样式
                    window.LogManager.add(`${prefix} ${event.text}`, "normal");
                }

                console.log(`[Minor Timeline] ${event.year}-${event.month}-${event.day}: ${event.text}`);
            });
        }
    }
};

window.TimeSystem = TimeSystem;