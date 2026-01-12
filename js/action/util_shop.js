/**
 * 【新增】打开城镇集市列表
 */
function openTownMarket() {
    // 1. 检查玩家位置
    if (!window.player || !player.location) return;

    // 从 data_world.js 获取当前城镇数据
    // 假设 WORLD_TOWNS 是全局变量 (在 js/data/data_world.js 中定义)
    const townId = player.location;
    const town = window.WORLD_TOWNS ? WORLD_TOWNS.find(t => t.id === townId) : null;

    if (!town) {
        if(window.showToast) window.showToast("荒郊野岭，何来集市？");
        return;
    }

    // 2. 获取店铺列表 (复用 TownShops 逻辑)
    if (!window.TownShops) {
        console.error("TownShops 模块未加载");
        return;
    }

    // 获取该城镇所有可能的店铺配置
    const potentialShops = TownShops._getAllPotentialShops(town);

    // 3. 过滤可见性 (模拟 TownShops.getLayout 中的时间判断逻辑)
    const t = player.time || { hour: 12, month: 1 };
    const hour = t.hour;
    const month = t.month;
    const isNight = (hour >= 18 || hour < 6);

    const validOptions = [];

    potentialShops.forEach(shop => {
        let isVisible = false;
        // 逻辑复用自 js/modules/town_shops.js
        if (shop.type === 'normal') isVisible = true;
        else if (shop.type === 'night') isVisible = isNight;
        else if (shop.type === 'seasonal') isVisible = (month === shop.month) && isNight;

        if (isVisible) {
            validOptions.push({
                text: getShopIcon(shop.name) + " " + shop.name, // 添加个图标美化一下
                style: getShopStyle(shop.type), // 根据类型给按钮不同样式
                autoClose: false, // 【关键】不自动关闭，让商店弹窗覆盖在上面，关闭商店后显示此列表
                onClick: () => {
                    // 进入商店
                    if (window.ShopSystem) {
                        window.ShopSystem.enter(shop.name, town);
                    }
                }
            });
        }
    });

    if (validOptions.length === 0) {
        if(window.showToast) window.showToast("此时集市空无一人。");
        return;
    }

    // 4. 显示选择弹窗
    const title = `${town.name} - 集市`;
    if (window.showSelectionModal) {
        window.showSelectionModal(title, validOptions);
    }
}

// 辅助：给店铺名加图标 (可选)
function getShopIcon(name) {
    if (name.includes("客栈")) return "🛏️";
    if (name.includes("铁匠")) return "⚒️";
    if (name.includes("丹")) return "🔥";
    if (name.includes("医")) return "💊";
    if (name.includes("悬赏")) return "📜";
    if (name.includes("黑市")) return "🌑";
    if (name.includes("鬼市")) return "👻";
    return "🏠";
}

// 辅助：按钮样式
function getShopStyle(type) {
    if (type === 'night') return 'ink_btn_long btn_danger'; // 黑市用红色/深色按钮
    if (type === 'seasonal') return 'ink_btn_long btn_faded';
    return 'ink_btn_long'; // 默认样式
}

// 挂载到全局
window.openTownMarket = openTownMarket;