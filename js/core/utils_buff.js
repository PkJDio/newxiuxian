// js/core/utils_buff.js
// Buff/Debuff 状态检测与定义 v2.1 (完善：补全系统Buff的描述信息)
console.log("加载 状态Buff系统");

// 这是一个新函数，专门用来根据数值 赋予/移除 Buff
function checkStatusDebuffs() {
    if (!player || !player.buffs) return;

    // --- 1. 疲劳 Debuff 逻辑 ---
    const maxFatigue = player.derived.fatigueMax || 100;
    const FATIGUE_BUFF_ID = "debuff_fatigue";

    if (player.status.fatigue >= maxFatigue) {
        if (!player.buffs[FATIGUE_BUFF_ID]) {
            player.buffs[FATIGUE_BUFF_ID] = {
                name: "疲惫",
                attr: "效率",
                val: "-50%",
                days: 9999,
                source: "状态",
                isDebuff: true,
                // 【新增】描述文本
                desc: "精神极度疲惫，此时进行任何行动的收益减半。请尽快休息（睡觉/打坐）。"
            };
            if(window.showToast) window.showToast("你感到精疲力竭，行动变得迟缓...");
        }
    } else {
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
                isDebuff: true,
                // 【新增】描述文本
                desc: "腹中空空，四肢无力，修炼和工作效率大幅降低。请尽快进食。"
            };
            if(window.showToast) window.showToast("你饿得头昏眼花，无力行动...");
        }
    } else {
        if (player.buffs[HUNGER_BUFF_ID]) {
            delete player.buffs[HUNGER_BUFF_ID];
            if(window.showToast) window.showToast("你吃饱了，力气恢复了。");
        }
    }

    // --- 3. 玩家剧毒逻辑 ---
    if (player.toxicity === undefined) player.toxicity = 0;

    const POISON_BUFF_ID = "debuff_poison_deep";

    if (player.toxicity >= 100) {
        if (!player.buffs[POISON_BUFF_ID]) {
            player.buffs[POISON_BUFF_ID] = {
                name: "剧毒",
                attr: "生命",
                val: "-5%/h",
                days: 999,
                source: "中毒",
                isDebuff: true,
                desc: "剧毒攻心，每时辰流失5%最大生命值。请尽快服用解毒丹药。"
            };
            if(window.showToast) window.showToast("剧毒攻心！你感觉五内如焚！", "red");
        }
    } else if (player.toxicity <= 0) {
        if (player.buffs[POISON_BUFF_ID]) {
            delete player.buffs[POISON_BUFF_ID];
            if(window.showToast) window.showToast("体内的剧毒已被清除。", "green");
        }
    }
}

// 处理时间流逝导致的中毒衰减和伤害
function processPoisonTimePass() {
    if (!player) return;
    if (player.toxicity === undefined) player.toxicity = 0;

    if (player.toxicity > 0) {
        // 1. 如果已深层中毒，扣血
        if (player.toxicity >= 100) {
            const dmg = Math.floor(player.derived.hpMax * 0.05);
            player.status.hp = Math.max(0, player.status.hp - dmg);
            console.log(`[Poison] 非战斗扣血: -${dmg}`);
        }

        // 2. 自然衰减 (每时辰 -20)
        player.toxicity = Math.max(0, player.toxicity - 20);

        // 3. 更新状态
        checkStatusDebuffs();
    }
}

window.checkStatusDebuffs = checkStatusDebuffs;
window.processPoisonTimePass = processPoisonTimePass;