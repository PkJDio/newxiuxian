// js/modules/town_shops.js
// 城镇店铺渲染与交互模块 v3.1 (精简版：直接读取全局时间)
console.log("加载 店铺渲染子模块 (精简版)");

const TownShops = {
    defaultConfig: {
        "city": ["铁匠铺", "客栈", "书屋", "演武馆", "丹房", "医馆"],
        "town": ["铁匠铺", "客栈", "书屋", "医馆"],
        "village": ["客栈"]
    },
    specialConfig: {},
    colors: {
        houseRoof: "#5d4037", houseWall: "#efebe9", houseBorder: "#3e2723", houseText: "#3e2723",
        nightMarketText: "#ffb74d", ghostMarketText: "#b39ddb"
    },

    defineShops: function(townName, shops) {
        this.specialConfig[townName] = shops;
    },

    // 获取所有潜在店铺（占坑位用）
    _getAllPotentialShops: function(town) {
        let base = this.specialConfig[town.name] || this.defaultConfig[town.level] || [];
        let allShops = base.map(name => ({ name: name, type: 'normal' }));

        if (town.level === 'city' || town.level === 'town') {
            allShops.push({ name: "夜市", type: 'night' });
        }

        if (town.name === "咸阳") {
            allShops.push({ name: "鬼市", type: 'seasonal', month: 7 });
        }
        return allShops;
    },

    /**
     * 计算布局
     * 【修改】不再需要传入 timeData，直接读全局 player
     */
    getLayout: function(town, ts) {
        const potentialShops = this._getAllPotentialShops(town);
        if (potentialShops.length === 0) return [];

        // 1. 获取全局时间
        const t = (window.player && window.player.time) ? window.player.time : { hour: 12, month: 1 };
        const hour = t.hour;
        const month = t.month;
        const isNight = (hour >= 18 || hour < 6);

        const townW = town.w * ts;
        // const townH = town.h * ts; // 暂时用不到
        let baseW = 240; let baseH = 120;
        if (townW < 600) { baseW = 120; baseH = 60; }

        const results = [];
        let seed = town.x + town.y * 1000;
        const random = () => { var x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

        potentialShops.forEach((shopConf, i) => {
            // 布局逻辑 (固定位置)
            const slotsX = 2;
            const slotW = townW / slotsX;
            const slotH = 150;
            const sx = i % slotsX;
            const sy = Math.floor(i / slotsX);
            const offsetX = random() * (slotW - baseW - 20) + 10;
            const offsetY = random() * (slotH - baseH - 20) + 10;

            // 可见性逻辑 (基于读取到的全局时间)
            let isVisible = false;
            if (shopConf.type === 'normal') {
                isVisible = true;
            } else if (shopConf.type === 'night') {
                isVisible = isNight;
            } else if (shopConf.type === 'seasonal') {
                isVisible = (month === shopConf.month) && isNight;
            }

            results.push({
                name: shopConf.name, type: shopConf.type, isVisible: isVisible,
                x: sx * slotW + offsetX, y: sy * slotH + offsetY, w: baseW, h: baseH
            });
        });
        return results;
    },

    // 渲染
    render: function(ctx, town, sx, sy, ts) {
        // 不需要传参了
        const shops = this.getLayout(town, ts);
        const c = this.colors;

        shops.forEach(shop => {
            if (!shop.isVisible) return; // 没到时间的不画

            const hx = sx + shop.x;
            const hy = sy + shop.y;

            ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(hx + 6, hy + 6, shop.w, shop.h);
            ctx.fillStyle = c.houseWall; ctx.fillRect(hx, hy, shop.w, shop.h);
            ctx.strokeStyle = c.houseBorder; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, shop.w, shop.h);

            ctx.fillStyle = c.houseRoof;
            if (shop.type === 'seasonal') ctx.fillStyle = "#4a148c";

            ctx.beginPath();
            const roofH = shop.h * 0.4;
            ctx.moveTo(hx - 6, hy); ctx.lineTo(hx + shop.w/2, hy - roofH); ctx.lineTo(hx + shop.w + 6, hy);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.fillStyle = c.houseText;
            if (shop.name === "夜市") ctx.fillStyle = c.nightMarketText;
            if (shop.name === "鬼市") ctx.fillStyle = c.ghostMarketText;

            const shopFontSize = Math.max(16, shop.w * 0.15);
            ctx.font = `bold ${shopFontSize}px Kaiti`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(shop.name, hx + shop.w/2, hy + shop.h/2 + 5);
        });
    },

    // 点击
    handleClick: function(mouseX, mouseY, town, camera, ts, centerX, centerY) {
        const townScreenX = (town.x - camera.x) * ts + centerX;
        const townScreenY = (town.y - camera.y) * ts + centerY;

        // 直接获取布局 (内部已处理时间可见性)
        const shops = this.getLayout(town, ts);

        for (let shop of shops) {
            if (!shop.isVisible) continue; // 看不见的店点不了

            const shopScreenX = townScreenX + shop.x;
            const shopScreenY = townScreenY + shop.y;

            if (mouseX >= shopScreenX && mouseX <= shopScreenX + shop.w &&
                mouseY >= shopScreenY && mouseY <= shopScreenY + shop.h) {

                if (window.ShopSystem) window.ShopSystem.enter(shop.name, town);
                return true;
            }
        }
        return false;
    }
};
window.TownShops = TownShops;