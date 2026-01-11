/**
 * js/action/util_rest.js
 * 休憩系统 v2.0：跳转至次日清晨 + 伤势食补修复 + 疲劳归零
 */

function doRest() {
    const p = window.player;
    // 基础安全性检查
    if (!p || !p.time || !p.status) return;

    // --- 1. 时间流逝计算 ---
    const currentHour = p.time.hour || 0;

    // 计算逻辑：目标是最近的清晨 06:00
    let hoursToPass = 24 - currentHour + 6;
    if (hoursToPass > 24) hoursToPass -= 24;

    // 如果恰好是 06:00 点击，则休息一整天
    if (hoursToPass === 0) hoursToPass = 24;

    // 执行全局时间流逝逻辑
    // passTime 内部通常会处理：饱食度自然扣除、天数增加、随机事件触发等
    if (window.TimeSystem && typeof window.TimeSystem.passTime === 'function') {
        window.TimeSystem.passTime(hoursToPass);
    } else if (window.UtilTime && window.UtilTime.advanceTime) {
        window.UtilTime.advanceTime(hoursToPass);
    }

    // --- 2. 核心状态清理 ---
    const status = p.status;
    const derived = p.derived || {};
    const hpMax = derived.hpMax || 100;

    // A. 疲劳值归零
    status.fatigue = 0;
    player.derived.fatigue=0;

    // B. 清除“疲惫”BUFF (支持按ID或按名称过滤)
    if (status.buffs && Array.isArray(status.buffs)) {
        status.buffs = status.buffs.filter(b => b.name !== "疲惫" && b.id !== "debuff_tired" && b.id !== "疲惫");
    }

    // --- 3. 伤势食补逻辑 (消耗饱食度回血) ---
    // 只有在受伤且有饱食度时触发
    if (status.hp < hpMax && status.hunger > 0) {
        const missingHP = hpMax - status.hp;
        const hungerNeeded = missingHP * 2; // 1点血换2点饱食度

        // 取“缺少的HP*2”与“当前饱食度”中的最小值
        const actualHungerCost = Math.min(hungerNeeded, status.hunger);
        const actualHeal = actualHungerCost / 2;

        // 执行变更
        status.hunger -= actualHungerCost;
        status.hp += actualHeal;

        // 浮点数安全与溢出处理
        status.hp = Math.round(status.hp);
        if (status.hp > hpMax) status.hp = hpMax;

        if (window.showToast && actualHeal > 0) {
            window.showToast(`休憩醒来，消耗${Math.floor(actualHungerCost)}点饱食度，伤势恢复了${Math.floor(actualHeal)}点。`);
        }
    } else if (status.hp >= hpMax) {
        if (window.showToast) window.showToast("这一觉睡得很香，精神焕发！");
    }

    // --- 4. 刷新界面 UI ---
    if (window.updateUI) {
        window.recalcStats();
        window.TimeSystem.passTime(0.01)
        window.updateUI();

    }
}

// 暴露接口
window.doRest = doRest;