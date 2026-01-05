// 这是一个新函数，专门用来根据数值 赋予/移除 Buff
function checkStatusDebuffs() {
    if (!player || !player.buffs) return;

    // --- 1. 疲劳 Debuff 逻辑 ---
    const maxFatigue = player.derived.fatigueMax || 100;
    // 定义 Buff 的 Key，方便查找和删除
    const FATIGUE_BUFF_ID = "debuff_fatigue";

    if (player.status.fatigue >= maxFatigue) {
        // 如果没有这个Buff，就加上
        if (!player.buffs[FATIGUE_BUFF_ID]) {
            player.buffs[FATIGUE_BUFF_ID] = {
                name: "疲惫",      // 显示名称
                attr: "效率",      // 影响属性显示
                val: "-50%",       // 影响数值显示 (字符串适配你的UI)
                days: 9999,        // 持续时间无限，直到条件解除
                source: "状态",    // 来源
                isDebuff: true     // 标记，方便逻辑判断
            };
            if(window.showToast) window.showToast("你感到精疲力竭，行动变得迟缓...");
        }
    } else {
        // 如果数值恢复正常，且身上有这个Buff，就移除
        if (player.buffs[FATIGUE_BUFF_ID]) {
            delete player.buffs[FATIGUE_BUFF_ID];
            if(window.showToast) window.showToast("你的精神恢复了一些。");
        }
    }

    // --- 2. 饥饿 Debuff 逻辑 ---
    const HUNGER_BUFF_ID = "debuff_hunger";

    if (player.status.hunger <= 0) {
        if (!player.buffs[HUNGER_BUFF_ID]) {
            player.buffs[HUNGER_BUFF_ID] = {
                name: "饥饿",
                attr: "效率",
                val: "-50%",
                days: 9999,
                source: "状态",
                isDebuff: true
            };
            if(window.showToast) window.showToast("你饿得头昏眼花，没力气了...");
        }
    } else {
        if (player.buffs[HUNGER_BUFF_ID]) {
            delete player.buffs[HUNGER_BUFF_ID];
            if(window.showToast) window.showToast("饱腹感让你重新充满了力量。");
        }
    }
}

// 把这个函数暴露给全局，方便 time.js 调用
window.checkStatusDebuffs = checkStatusDebuffs;