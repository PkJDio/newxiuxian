/**
 * js/action/util_eat.js
 * 进食快捷动作逻辑
 */

function doEat() {
    const p = window.player;
    if (!p || !p.inventory) return;

    // 1. 筛选背包中类型为 food 或 foodMaterial 的物品条目
    const foodSlots = p.inventory.filter(slot => {
        // 先从数据库获取物品基本信息以核对类型
        const itemData = GAME_DB.items.find(i => i.id === slot.id);
        if (!itemData) return false;

        return (itemData.type === 'food' || itemData.type === 'foodMaterial') && slot.count > 0;
    });

    if (foodSlots.length === 0) {
        if (window.showToast) window.showToast("行囊中没有可入口的食物");
        return;
    }

    // 2. 从 GAME_DB.eatables (或 items) 进一步筛选效果中 hunger > 0 的食物
    // 注意：根据您的描述，数据可能在 GAME_DB.eatables 中，如果不存在则退而求其次找 items
    const edibleList = [];

    foodSlots.forEach(slot => {
        // 优先查找 eatables 库
        let dbItem = null;
        if (window.GAME_DB.eatables) {
            dbItem = window.GAME_DB.eatables.find(i => i.id === slot.id);
        }

        // 如果 eatables 没找到，尝试在基础 items 库找
        if (!dbItem) {
            dbItem = window.GAME_DB.items.find(i => i.id === slot.id);
        }

        if (dbItem && dbItem.effects && dbItem.effects.hunger > 0) {
            edibleList.push(dbItem.id);
        }
    });

    if (edibleList.length === 0) {
        if (window.showToast) window.showToast("这些东西并不能填饱肚子");
        return;
    }

    // 3. 随机选择一个 ID
    const randomIndex = Math.floor(Math.random() * edibleList.length);
    const targetId = edibleList[randomIndex];

    // 4. 调用 UtilsItem 进行消耗
    if (window.UtilsItem && window.UtilsItem.useItemById) {
        window.UtilsItem.useItemById(targetId);
    } else {
        console.error("UtilsItem.useItemById 未定义");
    }
}

// 绑定到全局
window.doEat = doEat;