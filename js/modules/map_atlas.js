// js/modules/map_atlas.js
// 主地图渲染模块 v12.0 (修复城墙样式、保留大店铺、1x1网格)
console.log("加载 地图渲染模块");

const MapAtlas = {
    tileSize: 20,

    colors: {
        bg: "#f4f4f4",
        gridSmall: "rgba(0, 0, 0, 0.03)",
        gridBig: "rgba(0, 0, 0, 0.08)",

        road: "#a1887f", river: "#81d4fa", mountainBg: "rgba(121, 85, 72, 0.4)",
        grass: "#aed581", desert: "#ffe082", ocean: "#29b6f6",
        mountainBorder: "#5d4037",

        // 城镇背景
        townBg: "rgba(255, 248, 225, 0.9)",
        townBorder: "#5d4037",

        // 建筑颜色
        houseRoof: "#5d4037",
        houseWall: "#efebe9",
        houseBorder: "#3e2723",
        houseText: "#3e2723"
    },

    shopConfig: {
        "city": ["铁匠铺", "客栈", "书屋", "演武馆"],
        "town": ["铁匠铺", "客栈", "书屋"],
        "village": ["客栈"]
    },

    // 布局计算 (店铺尺寸翻倍)
    getShopLayout: function(town, ts) {
        const shops = this.shopConfig[town.level] || [];
        if (shops.length === 0) return [];

        const townW = town.w * ts;
        const townH = town.h * ts;

        // 店铺基础尺寸 (大号)
        let baseW = 240;
        let baseH = 120;

        // 自适应缩小
        if (townW < 600) { baseW = 120; baseH = 60; }

        const results = [];
        let seed = town.x + town.y * 1000;
        const random = () => {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        shops.forEach((name, i) => {
            const slotsX = 2;
            const slotsY = 2;
            const slotW = townW / slotsX;
            const slotH = townH / slotsY;

            const sx = i % slotsX;
            const sy = Math.floor(i / slotsX) % slotsY;

            const offsetX = random() * (slotW - baseW - 20) + 10;
            const offsetY = random() * (slotH - baseH - 20) + 10;

            results.push({
                name: name,
                x: sx * slotW + offsetX,
                y: sy * slotH + offsetY,
                w: baseW,
                h: baseH
            });
        });
        return results;
    },

    render: function(ctx, camera) {
        if (!camera || !player) return;
        const ts = this.tileSize * camera.scale;

        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, camera.width, camera.height);

        const centerX = camera.width / 2;
        const centerY = camera.height / 2;

        const viewRect = {
            x: camera.x - (centerX / ts),
            y: camera.y - (centerY / ts),
            w: camera.width / ts,
            h: camera.height / ts
        };

        // 1. 地形
        if (typeof TERRAIN_ZONES !== 'undefined') {
            TERRAIN_ZONES.forEach(zone => {
                if (!this._checkOverlap(zone, viewRect)) return;
                this._drawTerrainZone(ctx, zone, camera, ts, centerX, centerY, viewRect);
            });
        }

        // 2. 网格 (1x1 & 10x10)
        this._drawGrid(ctx, camera, ts);

        // 3. 城镇 (带城墙)
        if (typeof WORLD_TOWNS !== 'undefined') {
            WORLD_TOWNS.forEach(town => {
                const townRect = { x: [town.x, town.x + town.w], y: [town.y, town.y + town.h] };
                if (!this._checkOverlap(townRect, viewRect)) return;
                this._drawTownWithShops(ctx, town, camera, ts, centerX, centerY);
            });
        }

        // 4. 玩家
        this._drawPlayer(ctx, centerX, centerY, ts);
    },

    _drawTerrainZone: function(ctx, zone, camera, ts, cx, cy, viewRect) {
        const c = this.colors;
        const sx = (zone.x[0] - camera.x) * ts + cx;
        const sy = (zone.y[0] - camera.y) * ts + cy;
        const sw = (zone.x[1] - zone.x[0]) * ts;
        const sh = (zone.y[1] - zone.y[0]) * ts;

        if (zone.type === 'road') ctx.fillStyle = c.road;
        else if (zone.type === 'river') ctx.fillStyle = c.river;
        else if (zone.type === 'mountain') ctx.fillStyle = c.mountainBg;
        else if (zone.type === 'grass') ctx.fillStyle = c.grass;
        else if (zone.type === 'desert') ctx.fillStyle = c.desert;
        else if (zone.type === 'ocean') ctx.fillStyle = c.ocean;
        else return;

        ctx.globalAlpha = 0.6;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.globalAlpha = 1.0;

        // 地形大字
        const intersectX = Math.max(zone.x[0], viewRect.x);
        const intersectY = Math.max(zone.y[0], viewRect.y);
        const intersectW = Math.min(zone.x[1], viewRect.x + viewRect.w) - intersectX;
        const intersectH = Math.min(zone.y[1], viewRect.y + viewRect.h) - intersectY;

        if (intersectW > 5 && intersectH > 5) {
            const tx = (intersectX + intersectW/2 - camera.x) * ts + cx;
            const ty = (intersectY + intersectH/2 - camera.y) * ts + cy;
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.font = `bold ${Math.max(40, 60 * camera.scale)}px Kaiti`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(zone.name, tx, ty);
            ctx.restore();
        }
    },

    // 【核心修复】城镇绘制：恢复城墙、土墙、篱笆样式
    _drawTownWithShops: function(ctx, town, camera, ts, cx, cy) {
        const c = this.colors;
        const sx = (town.x - camera.x) * ts + cx;
        const sy = (town.y - camera.y) * ts + cy;
        const sw = town.w * ts;
        const sh = town.h * ts;

        // 1. 城镇地基
        ctx.fillStyle = c.townBg;
        ctx.fillRect(sx, sy, sw, sh);

        // 2. 绘制特色边框 (城墙/土墙/篱笆)
        ctx.save();
        if (town.level === 'city') {
            // === 主城：厚重双层城墙 + 垛口 ===
            const wallWidth = Math.max(6, 12 * camera.scale); // 加厚

            // 外层深色基座
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = "#3e2723"; // 深褐
            ctx.strokeRect(sx, sy, sw, sh);

            // 内层亮色装饰 (模拟砖石立体感)
            ctx.lineWidth = wallWidth * 0.6;
            ctx.strokeStyle = "#8d6e63"; // 浅褐
            // 虚线模拟垛口
            ctx.setLineDash([wallWidth * 1.5, wallWidth * 0.8]);
            ctx.strokeRect(sx, sy, sw, sh);

        } else if (town.level === 'town') {
            // === 重镇：坚固土墙 ===
            const wallWidth = Math.max(4, 8 * camera.scale);

            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = "#5d4037"; // 土色
            ctx.strokeRect(sx, sy, sw, sh);

            // 内细线装饰
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#3e2723";
            ctx.strokeRect(sx + wallWidth/2, sy + wallWidth/2, sw - wallWidth, sh - wallWidth);

        } else {
            // === 村落：木篱笆 ===
            const fenceWidth = Math.max(2, 4 * camera.scale);

            ctx.lineWidth = fenceWidth;
            ctx.strokeStyle = "#795548"; // 木色
            // 稀疏虚线模拟木桩
            ctx.setLineDash([fenceWidth, fenceWidth * 1.5]);
            ctx.strokeRect(sx, sy, sw, sh);
        }
        ctx.restore();

        // 3. 城镇大字 (固定中心)
        let fontSize = sw * 0.3;
        fontSize = Math.max(24, Math.min(120, fontSize));

        ctx.save();
        ctx.fillStyle = "rgba(62, 39, 35, 0.2)";
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(town.name, sx + sw/2, sy + sh/2);
        ctx.restore();

        // 4. 绘制店铺 (使用大尺寸)
        const shops = this.getShopLayout(town, ts);
        shops.forEach(shop => {
            const hx = sx + shop.x;
            const hy = sy + shop.y;

            // 阴影
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(hx + 6, hy + 6, shop.w, shop.h);

            // 墙体
            ctx.fillStyle = c.houseWall;
            ctx.fillRect(hx, hy, shop.w, shop.h);
            ctx.strokeStyle = c.houseBorder;
            ctx.lineWidth = 3;
            ctx.strokeRect(hx, hy, shop.w, shop.h);

            // 屋顶
            ctx.fillStyle = c.houseRoof;
            ctx.beginPath();
            const roofH = shop.h * 0.4;
            ctx.moveTo(hx - 6, hy);
            ctx.lineTo(hx + shop.w/2, hy - roofH);
            ctx.lineTo(hx + shop.w + 6, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // 店名
            ctx.fillStyle = c.houseText;
            const shopFontSize = Math.max(16, shop.w * 0.15); // 字号适配
            ctx.font = `bold ${shopFontSize}px Kaiti`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(shop.name, hx + shop.w/2, hy + shop.h/2 + 5);
        });
    },

    _drawGrid: function(ctx, camera, ts) {
        const startX = Math.floor(camera.x - (camera.width/2)/ts);
        const startY = Math.floor(camera.y - (camera.height/2)/ts);
        const endX = startX + (camera.width)/ts + 1;
        const endY = startY + (camera.height)/ts + 1;

        // 细网格 (1x1)
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.colors.gridSmall;
        ctx.beginPath();
        for (let x = Math.floor(startX); x <= endX; x++) {
            if (x % 10 === 0) continue;
            let sx = (x - camera.x) * ts + camera.width/2;
            ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height);
        }
        for (let y = Math.floor(startY); y <= endY; y++) {
            if (y % 10 === 0) continue;
            let sy = (y - camera.y) * ts + camera.height/2;
            ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy);
        }
        ctx.stroke();

        // 粗网格 (10x10)
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.colors.gridBig;
        ctx.beginPath();
        for (let x = Math.floor(startX/10)*10; x <= endX; x+=10) {
            let sx = (x - camera.x) * ts + camera.width/2;
            ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height);
        }
        for (let y = Math.floor(startY/10)*10; y <= endY; y+=10) {
            let sy = (y - camera.y) * ts + camera.height/2;
            ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy);
        }
        ctx.stroke();
    },

    _drawPlayer: function(ctx, cx, cy, ts) {
        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = "#d32f2f";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    _checkOverlap: function(zone, view) {
        return !(zone.x[1] < view.x || zone.x[0] > view.x + view.w ||
            zone.y[1] < view.y || zone.y[0] > view.y + view.h);
    }
};

window.MapAtlas = MapAtlas;