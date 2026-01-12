/**
 * js/action/util_eat.js
 * 进食快捷动作逻辑 (适配 SID 驱动)
 */

function doEat() {
    const p = window.player;
    if (!p || !p.inventory) return;

    // 1. 遍历背包，筛选出 hunger > 0 的食物的 SID
    const edibleSids = [];

    p.inventory.forEach(slot => {
        // 确保数据有效
        if (!slot.sid) return;

        // 获取用于判断的属性数据 (优先用 slot 自身，若缺失则查库兜底)
        let checkData = slot;
        if (!checkData.type || !checkData.effects) {
            let dbItem = null;
            if (window.GAME_DB) {
                // 优先查找 eatables (如果您的数据结构里有这个)
                if (window.GAME_DB.eatables) {
                    dbItem = window.GAME_DB.eatables.find(i => i.id === slot.id);
                }
                // 否则查找 items
                if (!dbItem && window.GAME_DB.items) {
                    dbItem = window.GAME_DB.items.find(i => i.id === slot.id);
                }
            }
            if (dbItem) checkData = dbItem; // 借用 DB 数据进行判断
        }

        // 判定条件：
        // 1. 类型为 food 或 foodMaterial
        // 2. 效果中包含 hunger 且大于 0
        const isFood = (checkData.type === 'food' || checkData.type === 'foodMaterial');
        const canRecoverHunger = (checkData.effects && checkData.effects.hunger > 0);

        if (isFood && canRecoverHunger) {
            edibleSids.push(slot.sid);
        }
    });

    // 2. 检查是否有可吃的东西
    if (edibleSids.length === 0) {
        if (window.showToast) window.showToast("行囊中没有可填饱肚子的食物");
        return;
    }

    // 3. 随机选择一个 SID
    const randomIndex = Math.floor(Math.random() * edibleSids.length);
    const targetSid = edibleSids[randomIndex];

    // 4. 调用 UtilsItem 进行消耗 (传入 SID)
    if (window.UtilsItem && window.UtilsItem.useItem) {
        // 使用 1 个
        window.UtilsItem.useItem(targetSid, 1);
    } else {
        console.error("UtilsItem.useItem 未定义");
    }
}

// 绑定到全局
window.doEat = doEat;