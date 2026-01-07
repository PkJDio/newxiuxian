// js/modules/shop_system.js
// 店铺功能管理器
console.log("加载 店铺功能系统");

const ShopSystem = {
    // 注册表：存储 店铺名 -> 处理函数 的映射
    registry: {},

    /**
     * 注册一个店铺的功能
     * @param {String} shopName 店铺名称，如 "铁匠铺"
     * @param {Object} handler 处理对象，必须包含 enter 方法
     */
    register: function(shopName, handler) {
        this.registry[shopName] = handler;
        console.log(`[ShopSystem] 已注册店铺功能: ${shopName}`);
    },

    /**
     * 尝试进入店铺
     * @param {String} shopName 店铺名称
     * @param {Object} town 当前所在的城镇对象 (方便后续逻辑判断)
     */
    enter: function(shopName, town) {
        const handler = this.registry[shopName];
        if (handler && typeof handler.enter === 'function') {
            console.log(`正在进入 ${town.name} 的 ${shopName}...`);
            // 执行具体的店铺逻辑
            handler.enter(town);
        } else {
            console.warn(`[ShopSystem] 未找到 "${shopName}" 的功能实现，或者该店铺暂未开放。`);
            // 这里可以加一个通用的提示，比如 "店主不在家"
            alert(`${shopName} 暂时还未开张 (未绑定功能)`);
        }
    }
};

window.ShopSystem = ShopSystem;