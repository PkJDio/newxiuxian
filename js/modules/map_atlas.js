// js/modules/map_atlas.js
// 主地图渲染模块 v16.1 (支持差异化敌人渲染)
console.log("加载 地图渲染模块 (Visual Enhanced)");

const MapAtlas = {
    tileSize: 20,
    spriteSheet: null,
    decoSprites: [],
    isInited: false,

    colors: {
        bg: "#f4f4f4",
        gridSmall: "rgba(0, 0, 0, 0.03)", gridBig: "rgba(0, 0, 0, 0.08)",
        road: "#a1887f", river: "#81d4fa", mountainBg: "rgba(121, 85, 72, 0.4)",
        grass: "#aed581", desert: "#ffe082", ocean: "#29b6f6",
        townBg: "rgba(255, 248, 225, 0.9)", townBorder: "#5d4037",
        houseRoof: "#5d4037", houseWall: "#efebe9", houseBorder: "#3e2723", houseText: "#3e2723"
    },

    shopConfig: {
        "city": ["铁匠铺", "客栈", "书屋", "演武馆","丹房","医馆"],
        "town": ["铁匠铺", "客栈", "书屋","医馆"],
        "village": ["客栈"]
    },

    init: function() {
        if (this.isInited) return;
        if (window.InkSpriteGenerator) {
            this.spriteSheet = InkSpriteGenerator.generateSpriteSheet();
            const TS = 64;
            this.decoSprites = [];
            for(let c=0; c<4; c++) this.decoSprites.push({id: `moss_${c}`, x: c*TS, y: 0, w: TS, h: TS, weight: 10, type:'moss'});
            for(let c=0; c<4; c++) this.decoSprites.push({id: `grass_${c}`, x: c*TS, y: TS, w: TS, h: TS, weight: 30, type:'grass'});
            for(let c=0; c<4; c++) this.decoSprites.push({id: `rock_${c}`, x: c*TS, y: TS*2, w: TS, h: TS, weight: 10, type:'rock'});
            for(let c=0; c<4; c++) this.decoSprites.push({id: `flower_${c}`, x: c*TS, y: TS*3, w: TS, h: TS, weight: 30, type:'flower'});
            for(let c=0; c<4; c++) this.decoSprites.push({id: `tree_${c}`, x: c*TS, y: TS*4, w: TS, h: TS, weight: 35, type:'tree'});
            this.isInited = true;
        }
    },

    _getDeterministicRandom: function(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    },

    _isOccupied: function(x, y) {
        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let t of WORLD_TOWNS) {
                if (x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h) return true;
            }
        }
        if (typeof TERRAIN_ZONES !== 'undefined') {
            for (let z of TERRAIN_ZONES) {
                if (['road', 'river', 'mountain', 'ocean','grass'].includes(z.type)) {
                    if (x >= z.x[0] && x < z.x[1] && y >= z.y[0] && y < z.y[1]) return true;
                }
            }
        }
        return false;
    },

    render: function(ctx, camera, enemies) {
        if (!camera || !player) return;
        const ts = this.tileSize * camera.scale;

        // 背景
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

        // 地形
        if (typeof TERRAIN_ZONES !== 'undefined') {
            TERRAIN_ZONES.forEach(zone => {
                if (!this._checkOverlap(zone, viewRect)) return;
                this._drawTerrainZone(ctx, zone, camera, ts, centerX, centerY, viewRect);
            });
        }

        // 装饰
        if (this.isInited && this.spriteSheet) {
            this._drawDecorations(ctx, camera, ts, centerX, centerY, viewRect);
        }

        // 网格
        this._drawGrid(ctx, camera, ts);

        // 城镇
        if (typeof WORLD_TOWNS !== 'undefined') {
            WORLD_TOWNS.forEach(town => {
                const townRect = { x: [town.x, town.x + town.w], y: [town.y, town.y + town.h] };
                if (!this._checkOverlap(townRect, viewRect)) return;
                this._drawTownWithShops(ctx, town, camera, ts, centerX, centerY);
            });
        }

        // 绘制敌人 (优化版)
        if (enemies && Array.isArray(enemies)) {
            // 先按层级排序 (Boss在上面)
            const sortedEnemies = [...enemies].sort((a, b) => {
                const zA = a.visual ? a.visual.zIndex : 0;
                const zB = b.visual ? b.visual.zIndex : 0;
                return zA - zB;
            });
            this._drawEnemies(ctx, sortedEnemies, camera, ts, centerX, centerY, viewRect);
        }

        // 玩家
        this._drawPlayer(ctx, centerX, centerY, ts);
    },

    // 【核心修改】绘制敌人
    _drawEnemies: function(ctx, enemies, camera, ts, cx, cy, viewRect) {
        enemies.forEach(enemy => {
            if (enemy.x < viewRect.x || enemy.x > viewRect.x + viewRect.w ||
                enemy.y < viewRect.y || enemy.y > viewRect.y + viewRect.h) {
                return;
            }

            const sx = (enemy.x - camera.x) * ts + cx;
            const sy = (enemy.y - camera.y) * ts + cy;

            // 获取视觉属性 (兼容旧数据)
            const v = enemy.visual || {
                icon: "💀", color: "#333", scale: 1.0,
                shadowBlur: 0, shadowColor: null, displayName: enemy.name
            };

            const size = ts * v.scale;

            // 1. 绘制光环 (如果有)
            if (v.shadowBlur > 0 && v.shadowColor) {
                ctx.save();
                ctx.shadowBlur = v.shadowBlur;
                ctx.shadowColor = v.shadowColor;
                ctx.fillStyle = v.shadowColor;
                ctx.beginPath();
                // 呼吸效果：根据时间戳微调大小
                const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
                ctx.arc(sx, sy, size * 0.8 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                // 普通底座
                ctx.beginPath();
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.arc(sx, sy, size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // 2. 绘制图标
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(v.icon, sx, sy);
            ctx.restore();

            // 3. 绘制名字
            ctx.save();
            // 字体大小随等级变化
            const nameSize = Math.max(10, ts * 0.5 * v.scale);
            ctx.font = `bold ${nameSize}px Kaiti`;
            ctx.textAlign = "center";

            // 名字颜色
            ctx.fillStyle = v.color;

            // 如果是杂鱼且颜色是白色/浅色，加个黑色描边防止看不清
            if (v.color === '#fff' || v.color === '#ffffff') {
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                ctx.strokeText(v.displayName, sx, sy - size * 0.9);
            }

            ctx.fillText(v.displayName, sx, sy - size * 0.9);
            ctx.restore();
        });
    },

    // --- 其他辅助方法 ---
    _drawDecorations: function(ctx, camera, ts, cx, cy, viewRect) {
        // ... 保持原有逻辑不变 (代码太长省略，请保留原文件内容)
        // 如果需要，我可以完整提供，但这里只修改了 _drawEnemies
        // 为了确保代码完整性，这里简单复述一下装饰物逻辑
        const startX = Math.floor(viewRect.x) - 1;
        const startY = Math.floor(viewRect.y) - 1;
        const endX = Math.ceil(viewRect.x + viewRect.w) + 1;
        const endY = Math.ceil(viewRect.y + viewRect.h) + 1;
        const seed = (player && player.worldSeed) ? player.worldSeed : 12345;
        const totalWeight = this.decoSprites.reduce((sum, item) => sum + item.weight, 0);
        const DENSITY = 0.10;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                if (this._isOccupied(x, y)) continue;
                const rand = this._getDeterministicRandom(x, y, seed);
                if (rand > DENSITY) continue;
                let targetWeight = (rand / DENSITY) * totalWeight;
                let sprite = null;
                let currentWeight = 0;
                for(let s of this.decoSprites) {
                    currentWeight += s.weight;
                    if (targetWeight <= currentWeight) { sprite = s; break; }
                }
                if (sprite) {
                    const screenX = (x - camera.x) * ts + cx;
                    const screenY = (y - camera.y) * ts + cy;
                    const offsetX = (this._getDeterministicRandom(x, y, seed + 1) - 0.5) * ts * 0.5;
                    const offsetY = (this._getDeterministicRandom(x, y, seed + 2) - 0.5) * ts * 0.5;
                    const alpha = 0.5 + this._getDeterministicRandom(x, y, seed + 3) * 0.4;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    let drawScale = 1.5; let drawYOffset = 0.5;
                    if (sprite.type === 'tree') { drawScale = 2.2; drawYOffset = 0.8; }
                    const drawSize = ts * drawScale;
                    ctx.drawImage(this.spriteSheet, sprite.x, sprite.y, sprite.w, sprite.h, screenX + offsetX - drawSize/4, screenY + offsetY - drawSize * drawYOffset, drawSize, drawSize);
                    ctx.restore();
                }
            }
        }
    },

    getShopLayout: function(town, ts) {
        const shops = this.shopConfig[town.level] || [];
        if (shops.length === 0) return [];
        const townW = town.w * ts; const townH = town.h * ts;
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
        ctx.globalAlpha = 0.6; ctx.fillRect(sx, sy, sw, sh); ctx.globalAlpha = 1.0;
        const intersectX = Math.max(zone.x[0], viewRect.x);
        const intersectY = Math.max(zone.y[0], viewRect.y);
        const intersectW = Math.min(zone.x[1], viewRect.x + viewRect.w) - intersectX;
        const intersectH = Math.min(zone.y[1], viewRect.y + viewRect.h) - intersectY;
        if (intersectW > 5 && intersectH > 5) {
            const tx = (intersectX + intersectW/2 - camera.x) * ts + cx;
            const ty = (intersectY + intersectH/2 - camera.y) * ts + cy;
            ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.font = `bold ${Math.max(40, 60 * camera.scale)}px Kaiti`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(zone.name, tx, ty); ctx.restore();
        }
    },

    _drawTownWithShops: function(ctx, town, camera, ts, cx, cy) {
        const c = this.colors;
        const sx = (town.x - camera.x) * ts + cx;
        const sy = (town.y - camera.y) * ts + cy;
        const sw = town.w * ts; const sh = town.h * ts;
        ctx.fillStyle = c.townBg; ctx.fillRect(sx, sy, sw, sh);
        ctx.save();
        if (town.level === 'city') {
            const wallWidth = Math.max(6, 12 * camera.scale);
            ctx.lineWidth = wallWidth; ctx.strokeStyle = "#3e2723"; ctx.strokeRect(sx, sy, sw, sh);
            ctx.lineWidth = wallWidth * 0.6; ctx.strokeStyle = "#8d6e63"; ctx.setLineDash([wallWidth * 1.5, wallWidth * 0.8]); ctx.strokeRect(sx, sy, sw, sh);
        } else if (town.level === 'town') {
            const wallWidth = Math.max(4, 8 * camera.scale);
            ctx.lineWidth = wallWidth; ctx.strokeStyle = "#5d4037"; ctx.strokeRect(sx, sy, sw, sh);
            ctx.lineWidth = 1; ctx.strokeStyle = "#3e2723"; ctx.strokeRect(sx + wallWidth/2, sy + wallWidth/2, sw - wallWidth, sh - wallWidth);
        } else {
            const fenceWidth = Math.max(2, 4 * camera.scale);
            ctx.lineWidth = fenceWidth; ctx.strokeStyle = "#795548"; ctx.setLineDash([fenceWidth, fenceWidth * 1.5]); ctx.strokeRect(sx, sy, sw, sh);
        }
        ctx.restore();
        let fontSize = (sw * 0.8) / Math.max(1, town.name.length);
        fontSize = Math.min(fontSize, sh * 0.8); fontSize = Math.max(20, fontSize);
        ctx.save(); ctx.fillStyle = "rgba(62, 39, 35, 0.2)"; ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(town.name, sx + sw/2, sy + sh/2); ctx.restore();
        const shops = this.getShopLayout(town, ts);
        shops.forEach(shop => {
            const hx = sx + shop.x; const hy = sy + shop.y;
            ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(hx + 6, hy + 6, shop.w, shop.h);
            ctx.fillStyle = c.houseWall; ctx.fillRect(hx, hy, shop.w, shop.h);
            ctx.strokeStyle = c.houseBorder; ctx.lineWidth = 3; ctx.strokeRect(hx, hy, shop.w, shop.h);
            ctx.fillStyle = c.houseRoof; ctx.beginPath();
            const roofH = shop.h * 0.4; ctx.moveTo(hx - 6, hy); ctx.lineTo(hx + shop.w/2, hy - roofH); ctx.lineTo(hx + shop.w + 6, hy);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = c.houseText; const shopFontSize = Math.max(16, shop.w * 0.15);
            ctx.font = `bold ${shopFontSize}px Kaiti`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(shop.name, hx + shop.w/2, hy + shop.h/2 + 5);
        });
    },

    _drawGrid: function(ctx, camera, ts) {
        const startX = Math.floor(camera.x - (camera.width/2)/ts);
        const startY = Math.floor(camera.y - (camera.height/2)/ts);
        const endX = startX + (camera.width)/ts + 1; const endY = startY + (camera.height)/ts + 1;
        ctx.lineWidth = 1; ctx.strokeStyle = this.colors.gridSmall; ctx.beginPath();
        for (let x = Math.floor(startX); x <= endX; x++) { if (x % 10 === 0) continue; let sx = (x - camera.x) * ts + camera.width/2; ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height); }
        for (let y = Math.floor(startY); y <= endY; y++) { if (y % 10 === 0) continue; let sy = (y - camera.y) * ts + camera.height/2; ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy); }
        ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = this.colors.gridBig; ctx.beginPath();
        for (let x = Math.floor(startX/10)*10; x <= endX; x+=10) { let sx = (x - camera.x) * ts + camera.width/2; ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height); }
        for (let y = Math.floor(startY/10)*10; y <= endY; y+=10) { let sy = (y - camera.y) * ts + camera.height/2; ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy); }
        ctx.stroke();
    },

    _drawPlayer: function(ctx, cx, cy, ts) {
        ctx.beginPath(); ctx.arc(cx, cy, ts * 0.4, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, ts * 0.25, 0, Math.PI * 2); ctx.fillStyle = "#d32f2f"; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    },

    _checkOverlap: function(zone, view) {
        return !(zone.x[1] < view.x || zone.x[0] > view.x + view.w || zone.y[1] < view.y || zone.y[0] > view.y + view.h);
    }
};

window.MapAtlas = MapAtlas;