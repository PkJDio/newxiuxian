// js/modules/map_atlas.js
// 主地图渲染模块 v13.0 (集成动态水墨装饰系统)
console.log("加载 地图渲染模块");

const MapAtlas = {
    tileSize: 20, // 逻辑格子大小

    // 【新增】装饰物相关属性
    spriteSheet: null, // 存放生成的画布
    decoSprites: [],   // 存放素材元数据
    isInited: false,   // 标记是否初始化过

    colors: {
        bg: "#f4f4f4",
        gridSmall: "rgba(0, 0, 0, 0.03)",
        gridBig: "rgba(0, 0, 0, 0.08)",
        road: "#a1887f", river: "#81d4fa", mountainBg: "rgba(121, 85, 72, 0.4)",
        grass: "#aed581", desert: "#ffe082", ocean: "#29b6f6",
        townBg: "rgba(255, 248, 225, 0.9)",
        townBorder: "#5d4037",
        houseRoof: "#5d4037", houseWall: "#efebe9", houseBorder: "#3e2723", houseText: "#3e2723"
    },

    shopConfig: {
        "city": ["铁匠铺", "客栈", "书屋", "演武馆"],
        "town": ["铁匠铺", "客栈", "书屋"],
        "village": ["客栈"]
    },

    // ================= 初始化 =================
    // 在 MapCamera.init() 里调用这个
    init: function() {
        if (this.isInited) return;

        console.log("[MapAtlas] 正在生成水墨素材...");

        // 1. 调用生成器，获取 Canvas 对象
        if (window.InkSpriteGenerator) {
            this.spriteSheet = InkSpriteGenerator.generateSpriteSheet();

            // 2. 定义元数据 (对应生成器里的 rows=4, cols=4, tileSize=64)
            // 逻辑 tileSize 是 20，但素材图是高清的 64，绘制时会自动缩放
            const TS = 64;
            this.decoSprites = [];

            // 第0行：苔藓/墨点 (适合到处撒)
            for(let c=0; c<4; c++) this.decoSprites.push({id: `moss_${c}`, x: c*TS, y: 0, w: TS, h: TS, weight: 60});
            // 第1行：草丛 (适合平原)
            for(let c=0; c<4; c++) this.decoSprites.push({id: `grass_${c}`, x: c*TS, y: TS, w: TS, h: TS, weight: 30});
            // 第2行：石头 (点缀)
            for(let c=0; c<4; c++) this.decoSprites.push({id: `rock_${c}`, x: c*TS, y: TS*2, w: TS, h: TS, weight: 5});
            // 第3行：花 (稀有)
            for(let c=0; c<4; c++) this.decoSprites.push({id: `flower_${c}`, x: c*TS, y: TS*3, w: TS, h: TS, weight: 5});

            this.isInited = true;
            console.log("[MapAtlas] 素材生成完毕");
        } else {
            console.error("未找到 InkSpriteGenerator，请检查 index.html 引用顺序");
        }
    },

    // ================= 辅助：确定性随机 =================
    // 输入坐标和种子，返回 0.0 - 1.0 之间的固定随机数
    _getDeterministicRandom: function(x, y, seed = 0) {
        // 使用简单的正弦噪声
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    },

    // ================= 主渲染循环 =================
    render: function(ctx, camera) {
        if (!camera || !player) return;
        const ts = this.tileSize * camera.scale;

        // 1. 填充背景底色
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

        // 2. 绘制地形区块 (大色块)
        if (typeof TERRAIN_ZONES !== 'undefined') {
            TERRAIN_ZONES.forEach(zone => {
                if (!this._checkOverlap(zone, viewRect)) return;
                this._drawTerrainZone(ctx, zone, camera, ts, centerX, centerY, viewRect);
            });
        }

        // 3. 【核心新增】绘制水墨装饰层 (在底色之上，城镇之下)
        // 只有当素材生成好了才画
        if (this.isInited && this.spriteSheet) {
            this._drawDecorations(ctx, camera, ts, centerX, centerY, viewRect);
        }

        // 4. 网格
        this._drawGrid(ctx, camera, ts);

        // 5. 城镇
        if (typeof WORLD_TOWNS !== 'undefined') {
            WORLD_TOWNS.forEach(town => {
                const townRect = { x: [town.x, town.x + town.w], y: [town.y, town.y + town.h] };
                if (!this._checkOverlap(townRect, viewRect)) return;
                this._drawTownWithShops(ctx, town, camera, ts, centerX, centerY);
            });
        }

        // 6. 玩家
        this._drawPlayer(ctx, centerX, centerY, ts);
    },

    // 【新增】装饰绘制逻辑
    _drawDecorations: function(ctx, camera, ts, cx, cy, viewRect) {
        // 计算视野覆盖的整数网格坐标范围
        const startX = Math.floor(viewRect.x) - 1; // 多画一圈防止边缘闪烁
        const startY = Math.floor(viewRect.y) - 1;
        const endX = Math.ceil(viewRect.x + viewRect.w) + 1;
        const endY = Math.ceil(viewRect.y + viewRect.h) + 1;

        // 获取世界种子 (如果有的话，没有就用固定值，保证每次刷新草都在同一个位置)
        const seed = (player && player.worldSeed) ? player.worldSeed : 12345;

        // 遍历视野内的每一个格子
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {

                // 1. 确定性随机：决定这个格子画什么
                const rand = this._getDeterministicRandom(x, y, seed);

                // 2. 留白逻辑：70% 的概率什么都不画，保持空旷感
                if (rand > 0.3) continue;

                // 3. 筛选逻辑 (简单映射到素材列表)
                // 把 0.0-0.3 映射到素材索引
                const index = Math.floor((rand / 0.3) * this.decoSprites.length);
                const sprite = this.decoSprites[index];

                if (sprite) {
                    // 计算屏幕位置
                    const screenX = (x - camera.x) * ts + cx;
                    const screenY = (y - camera.y) * ts + cy;

                    // 4. 随机微调 (让画面更自然)
                    // 偏移量
                    const offsetX = (this._getDeterministicRandom(x, y, seed + 1) - 0.5) * ts * 0.5;
                    const offsetY = (this._getDeterministicRandom(x, y, seed + 2) - 0.5) * ts * 0.5;
                    // 透明度 (0.5 - 0.9)
                    const alpha = 0.5 + this._getDeterministicRandom(x, y, seed + 3) * 0.4;

                    // 绘制
                    ctx.save();
                    ctx.globalAlpha = alpha;

                    // 注意：spriteSheet 里的图是 64x64，我们要画到地图上的格子大小 (ts)
                    // 稍微画大一点点 (ts * 1.2) 让草丛互相叠加一点，更自然
                    const drawSize = ts * 1.5;

                    ctx.drawImage(
                        this.spriteSheet,
                        sprite.x, sprite.y, sprite.w, sprite.h, // 源图坐标
                        screenX + offsetX - drawSize/4, screenY + offsetY - drawSize/2, // 目标位置 (稍微上移一点，让根部对准格子中心)
                        drawSize, drawSize
                    );
                    ctx.restore();
                }
            }
        }
    },

    // --- 以下是原有的辅助方法，保持不变 ---

    getShopLayout: function(town, ts) {
        const shops = this.shopConfig[town.level] || [];
        if (shops.length === 0) return [];
        const townW = town.w * ts;
        const townH = town.h * ts;
        let baseW = 240; let baseH = 120;
        if (townW < 600) { baseW = 120; baseH = 60; }
        const results = [];
        let seed = town.x + town.y * 1000;
        const random = () => { var x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
        shops.forEach((name, i) => {
            const slotsX = 2; const slotsY = 2;
            const slotW = townW / slotsX; const slotH = townH / slotsY;
            const sx = i % slotsX; const sy = Math.floor(i / slotsX) % slotsY;
            const offsetX = random() * (slotW - baseW - 20) + 10;
            const offsetY = random() * (slotH - baseH - 20) + 10;
            results.push({ name: name, x: sx * slotW + offsetX, y: sy * slotH + offsetY, w: baseW, h: baseH });
        });
        return results;
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

    _drawTownWithShops: function(ctx, town, camera, ts, cx, cy) {
        const c = this.colors;
        const sx = (town.x - camera.x) * ts + cx;
        const sy = (town.y - camera.y) * ts + cy;
        const sw = town.w * ts;
        const sh = town.h * ts;

        ctx.fillStyle = c.townBg;
        ctx.fillRect(sx, sy, sw, sh);

        ctx.save();
        if (town.level === 'city') {
            const wallWidth = Math.max(6, 12 * camera.scale);
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = "#3e2723";
            ctx.strokeRect(sx, sy, sw, sh);
            ctx.lineWidth = wallWidth * 0.6;
            ctx.strokeStyle = "#8d6e63";
            ctx.setLineDash([wallWidth * 1.5, wallWidth * 0.8]);
            ctx.strokeRect(sx, sy, sw, sh);
        } else if (town.level === 'town') {
            const wallWidth = Math.max(4, 8 * camera.scale);
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = "#5d4037";
            ctx.strokeRect(sx, sy, sw, sh);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#3e2723";
            ctx.strokeRect(sx + wallWidth/2, sy + wallWidth/2, sw - wallWidth, sh - wallWidth);
        } else {
            const fenceWidth = Math.max(2, 4 * camera.scale);
            ctx.lineWidth = fenceWidth;
            ctx.strokeStyle = "#795548";
            ctx.setLineDash([fenceWidth, fenceWidth * 1.5]);
            ctx.strokeRect(sx, sy, sw, sh);
        }
        ctx.restore();

        let fontSize = (sw * 0.8) / Math.max(1, town.name.length);
        fontSize = Math.min(fontSize, sh * 0.8);
        fontSize = Math.max(20, fontSize);

        ctx.save();
        ctx.fillStyle = "rgba(62, 39, 35, 0.2)";
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(town.name, sx + sw/2, sy + sh/2);
        ctx.restore();

        const shops = this.getShopLayout(town, ts);
        shops.forEach(shop => {
            const hx = sx + shop.x;
            const hy = sy + shop.y;
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(hx + 6, hy + 6, shop.w, shop.h);
            ctx.fillStyle = c.houseWall;
            ctx.fillRect(hx, hy, shop.w, shop.h);
            ctx.strokeStyle = c.houseBorder;
            ctx.lineWidth = 3;
            ctx.strokeRect(hx, hy, shop.w, shop.h);
            ctx.fillStyle = c.houseRoof;
            ctx.beginPath();
            const roofH = shop.h * 0.4;
            ctx.moveTo(hx - 6, hy);
            ctx.lineTo(hx + shop.w/2, hy - roofH);
            ctx.lineTo(hx + shop.w + 6, hy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = c.houseText;
            const shopFontSize = Math.max(16, shop.w * 0.15);
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