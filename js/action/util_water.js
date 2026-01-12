// js/action/util_water.js
// 水源相关交互逻辑

/**
 * 动作：打水
 * 每次点击获得 10 份水
 */
function doFetchWater() {
    // 1. 定义水的物品数据结构
    const waterItem = {
        id: "foodMaterial_007",
        name: "水",
        type: "foodMaterial",
        subType: "fooding",
        grade: 0,
        rarity: 1,
        obtain: "wild",
        value: 0,
        effects: { hunger: 0, hp: 0 },
        desc: "制作汤品的基础材料。"
    };

    // 2. 调用物品工具箱添加物品
    // UtilsItem v5.1+ 支持直接传入对象，会自动计算 SID 并堆叠
    if (window.UtilsItem && window.UtilsItem.addItem) {
        // 添加 10 个
        window.UtilsItem.addItem(waterItem, 10);

        // 可选：添加一条特定的日志
        if (window.LogManager) {
            window.LogManager.add("你在井边打了一桶清冽的泉水。");
        }
    } else {
        console.error("UtilsItem 模块未加载");
    }
}

// 挂载到全局，供 HTML 按钮调用
window.doFetchWater = doFetchWater;