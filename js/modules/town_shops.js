// js/modules/town_shops.js
// 城镇店铺渲染与交互模块 v3.2 (自适应散列布局版)
//console.log("加载 店铺渲染子模块 (自适应散列版)");

const TownShops = {
    defaultConfig: {
        "city": ["铁匠铺", "客栈",  "丹房", "医馆", "悬赏榜"],
        "town": ["铁匠铺", "客栈", "医馆", "悬赏榜"],
        "village": ["客栈", "悬赏榜"]
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

        // 【修改点】夜市 -> 黑市，且仅限 city
        if (town.level === 'city') {
            allShops.push({ name: "黑市", type: 'night' });
        }

        if (town.name === "咸阳") {
            allShops.push({ name: "鬼市", type: 'seasonal', month: 7 });
        }
        return allShops;
    },

    /**
     * 计算布局 (核心修改：自适应铺满全图)
     */
    getLayout: function(town, ts) {
        const potentialShops = this._getAllPotentialShops(town);
        const totalShops = potentialShops.length;
        if (totalShops === 0) return [];

        // 1. 获取全局时间
        const t = (window.player && window.player.time) ? window.player.time : { hour: 12, month: 1 };
        const hour = t.hour;
        const month = t.month;
        const isNight = (hour >= 18 || hour < 6);

        // 2. 城镇实际像素尺寸
        const townW = town.w * ts;
        const townH = town.h * ts;

        // 3. 确定店铺基础尺寸
        let baseW = 240;
        let baseH = 120;
        // 如果城镇太小，强制缩小店铺
        if (townW < 600) { baseW = 120; baseH = 60; }

        // 4. 【核心修改】动态计算网格列数 (Slots X)
        // 逻辑：每 350px 宽度容纳一列，最少2列，最多4列
        let slotsX = Math.floor(townW / 350);
        if (slotsX < 2) slotsX = 2;
        if (slotsX > 4) slotsX = 4;

        // 5. 【核心修改】根据总数算行数 (Slots Y)
        const slotsY = Math.ceil(totalShops / slotsX);

        // 6. 计算每个格子的宽高 (铺满整个城镇)
        const slotW = townW / slotsX;
        const slotH = townH / slotsY;

        const results = [];
        // 随机种子：保证布局固定，不随刷新跳变
        let seed = town.x + town.y * 1000;
        const random = () => { var x = Math.sin(seed++) * 10000; return x - Math.floor(x); };

        potentialShops.forEach((shopConf, i) => {
            // 计算行列索引
            const row = Math.floor(i / slotsX);
            const col = i % slotsX;

            // --- 智能居中逻辑 ---
            // 如果是最后一行，且最后一行没填满，计算偏移量让它们居中显示
            let extraOffsetX = 0;
            if (row === slotsY - 1) {
                const itemsInLastRow = totalShops % slotsX || slotsX; // 最后一行有几个
                if (itemsInLastRow < slotsX) {
                    // 剩余空间的宽度 / 2
                    const emptySlots = slotsX - itemsInLastRow;
                    extraOffsetX = (emptySlots * slotW) / 2;
                }
            }

            // 在格子内部随机偏移 (Margin 20px)
            // 确保偏移量不会让店铺跑出格子
            // Math.max(0, ...) 是防止 slotW 比 baseW 还小导致负数
            const maxRandomX = Math.max(0, slotW - baseW - 40);
            const maxRandomY = Math.max(0, slotH - baseH - 40);

            const randX = random() * maxRandomX + 20;
            const randY = random() * maxRandomY + 20;

            // 最终坐标
            const finalX = (col * slotW) + randX + extraOffsetX;
            const finalY = (row * slotH) + randY;

            // 可见性判断
            let isVisible = false;
            if (shopConf.type === 'normal') isVisible = true;
            else if (shopConf.type === 'night') isVisible = isNight;
            else if (shopConf.type === 'seasonal') isVisible = (month === shopConf.month) && isNight;

            results.push({
                name: shopConf.name,
                type: shopConf.type,
                isVisible: isVisible,
                x: finalX,
                y: finalY,
                w: baseW,
                h: baseH
            });
        });

        return results;
    },

    // 渲染
    render: function(ctx, town, sx, sy, ts) {
        const shops = this.getLayout(town, ts);
        const c = this.colors;

        shops.forEach(shop => {
            if (!shop.isVisible) return;

            const hx = sx + shop.x;
            const hy = sy + shop.y;

            // 越界保护：如果随机偏移导致超出城镇范围，就不画或者修正
            // 这里的简单做法是直接画，因为上面的计算逻辑理论上是安全的

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
        const shops = this.getLayout(town, ts);

        for (let shop of shops) {
            if (!shop.isVisible) continue;

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