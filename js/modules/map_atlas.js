// js/modules/map_atlas.js
// 主地图渲染模块 v19.1 (夜视增强优化版)
// 基于 v18.1 修改，增加了夜间敌人文字描边和发光效果
//console.log("加载 地图渲染模块 (Visual Enhanced - Night Vision)");

const MapAtlas = {
    tileSize: 20,
    spriteSheet: null,
    decoSprites: [],
    isInited: false,

    // ==========================================
    // 【修复】保留 colors 对象，防止外部文件(如 main.js) 调用报错
    // ==========================================
    colors: {
        bg: "#e0e0e0",
        gridSmall: "rgba(0, 0, 0, 0.04)", gridBig: "rgba(0, 0, 0, 0.08)",
        road: "#a1887f", river: "#81d4fa", mountainBg: "rgba(121, 85, 72, 0.4)",
        grass: "#aed581", desert: "#ffe082", ocean: "#29b6f6",
        townBg: "rgba(255, 248, 225, 0.9)", townBorder: "#5d4037",
        textMain: "#3e2723", textDim: "rgba(62, 39, 35, 0.2)"
    },

    // 昼夜主题配置 (已调整配色)
    // 昼夜主题配置 (v19.3 - 通透/柔和/空气感)
    // 昼夜主题配置 (v19.4 - 护眼配色)
    themes: {
        day: {
            // 白天调暗：使用柔和的中性灰/暖灰，不再刺眼
            bg: "#cfd8dc",  // 蓝灰调的浅灰 (Blue Grey 100) -> 视觉上更稳重
            // 或者用暖灰: "#d7ccc8"

            gridSmall: "rgba(0, 0, 0, 0.05)",
            gridBig: "rgba(0, 0, 0, 0.1)",

            // 地形颜色保持半透明，但为了适应深一点的背景，稍微加深一点点不透明度
            road: "rgba(121, 85, 72, 0.4)",         // 褐色路
            river: "rgba(33, 150, 243, 0.4)",       // 蓝色河
            mountainBg: "rgba(93, 64, 55, 0.2)",    // 深褐山
            grass: "rgba(104, 159, 56, 0.35)",      // 绿色草
            desert: "rgba(255, 179, 0, 0.3)",       // 橙黄沙
            ocean: "rgba(2, 119, 189, 0.4)",        // 深蓝海

            townBg: "rgba(255, 255, 255, 0.6)",
            townBorder: "rgba(69, 90, 100, 0.5)",
            textMain: "#37474f", textDim: "rgba(55, 71, 79, 0.3)"
        },
        night: {
            // 晚上保持之前的通透深蓝灰
            bg: "#37474f", // Blue Grey 800

            gridSmall: "rgba(255, 255, 255, 0.03)",
            gridBig: "rgba(255, 255, 255, 0.06)",

            // 夜间地形：通透感
            road: "rgba(180, 160, 150, 0.8)",
            river: "rgba(140, 158, 255, 0.2)",
            mountainBg: "rgba(0, 0, 0, 0.2)",
            grass: "rgba(129, 199, 132, 0.15)",
            desert: "rgba(255, 202, 40, 0.1)",
            ocean: "rgba(68, 138, 255, 0.2)",

            townBg: "rgba(236, 240, 241, 0.3)",
            townBorder: "rgba(176, 190, 197, 0.3)",
            textMain: "#eceff1", textDim: "rgba(176, 190, 197, 0.3)"
        }
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

        // 1. 判断时间
        let isNight = false;
        if (player.time) {
            const h = player.time.hour;
            isNight = (h >= 18 || h < 6);
        }

        // 2. 选取主题
        const theme = isNight ? (this.themes.night || this.themes.day) : this.themes.day;

        // 3. 绘制背景
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, camera.width, camera.height);

        const centerX = camera.width / 2;
        const centerY = camera.height / 2;
        const viewRect = {
            x: camera.x - (centerX / ts),
            y: camera.y - (centerY / ts),
            w: camera.width / ts,
            h: camera.height / ts
        };

        // 4. 地形
        if (typeof TERRAIN_ZONES !== 'undefined') {
            TERRAIN_ZONES.forEach(zone => {
                if (!this._checkOverlap(zone, viewRect)) return;
                this._drawTerrainZone(ctx, zone, camera, ts, centerX, centerY, viewRect, theme);
            });
        }

        // 5. 装饰
        if (this.isInited && this.spriteSheet) {
            if (isNight) {
                ctx.save();
                ctx.filter = "brightness(0.7) contrast(1.1)";
            }
            this._drawDecorations(ctx, camera, ts, centerX, centerY, viewRect);
            if (isNight) {
                ctx.restore();
            }
        }

        // 6. 网格
        this._drawGrid(ctx, camera, ts, theme);

        // 7. 城镇
        if (typeof WORLD_TOWNS !== 'undefined') {
            WORLD_TOWNS.forEach(town => {
                const townRect = { x: [town.x, town.x + town.w], y: [town.y, town.y + town.h] };
                if (!this._checkOverlap(townRect, viewRect)) return;
                // 注意：TownShops v3.1 已经不需要传 isNight 了
                this._drawTownWithShops(ctx, town, camera, ts, centerX, centerY, theme);
            });
        }

        // 8. 敌人
        if (enemies && Array.isArray(enemies)) {
            const sortedEnemies = [...enemies].sort((a, b) => {
                const zA = a.visual ? a.visual.zIndex : 0;
                const zB = b.visual ? b.visual.zIndex : 0;
                return zA - zB;
            });
            // 【修改】传入 isNight 参数，用于夜视渲染
            this._drawEnemies(ctx, sortedEnemies, camera, ts, centerX, centerY, viewRect, isNight);
        }

        // 9. 玩家
        this._drawPlayer(ctx, centerX, centerY, ts);
    },

    // 【修改】新增 isNight 参数，处理夜间渲染逻辑
    _drawEnemies: function(ctx, enemies, camera, ts, cx, cy, viewRect, isNight) {
        enemies.forEach(enemy => {
            if (enemy.x < viewRect.x || enemy.x > viewRect.x + viewRect.w ||
                enemy.y < viewRect.y || enemy.y > viewRect.y + viewRect.h) return;

            const sx = (enemy.x - camera.x) * ts + cx;
            const sy = (enemy.y - camera.y) * ts + cy;
            const v = enemy.visual || { icon: "💀", color: "#333", scale: 1.0, shadowBlur: 0, shadowColor: null, displayName: enemy.name };
            const size = ts * v.scale;

            // --- 1. 底座光环/阴影 ---
            ctx.beginPath();
            if (isNight) {
                // 【晚上】发光效果：解决黑色阴影在深色背景看不清的问题
                ctx.save();
                ctx.shadowBlur = 30; // 稍微发光
                ctx.shadowColor = v.color; // 用怪物自己的颜色作为光晕
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)"; // 核心微亮
                ctx.arc(sx, sy, size * 0.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                // 【白天】普通阴影
                if (v.shadowBlur > 0 && v.shadowColor) {
                    ctx.save(); ctx.shadowBlur = v.shadowBlur; ctx.shadowColor = v.shadowColor; ctx.fillStyle = v.shadowColor;
                    ctx.arc(sx, sy, size * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                } else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                    ctx.arc(sx, sy, size * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // --- 2. 图标 ---
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(v.icon, sx, sy);
            ctx.restore();

            // --- 3. 名字 (文字描边处理) ---
            ctx.save();
            const nameSize = Math.max(10, ts * 0.5 * v.scale);
            ctx.font = `bold ${nameSize}px Kaiti`;
            ctx.textAlign = "center";

            // 默认文字颜色
            ctx.fillStyle = v.color;

            if (isNight) {
                // 【晚上】强力白色描边，确保文字在深色背景上清晰可见
                ctx.strokeStyle = "rgba(230, 230, 230, 0.95)";
                ctx.lineWidth = 3;
                ctx.strokeText(v.displayName, sx, sy - size * 0.9);

                // 如果文字本身就是纯黑，晚上稍微提亮一点点
                if (v.color === '#212121' || v.color === '#000000' || v.color === '#333') {
                    ctx.fillStyle = "#222";
                }
            } else {
                // 【白天】如果文字是白色的，加黑色描边 (保持原有逻辑)
                if (v.color === '#fff' || v.color === '#ffffff') {
                    ctx.strokeStyle = "#000";
                    ctx.lineWidth = 2;
                    ctx.strokeText(v.displayName, sx, sy - size * 0.9);
                }
            }

            ctx.fillText(v.displayName, sx, sy - size * 0.9);
            ctx.restore();
        });
    },

    _drawTownWithShops: function(ctx, town, camera, ts, cx, cy, theme) {
        const sx = (town.x - camera.x) * ts + cx;
        const sy = (town.y - camera.y) * ts + cy;
        const sw = town.w * ts; const sh = town.h * ts;

        ctx.fillStyle = theme.townBg;
        ctx.fillRect(sx, sy, sw, sh);

        ctx.save();
        const borderColor = theme.townBorder;
        if (town.level === 'city') {
            const wallWidth = Math.max(6, 12 * camera.scale);
            ctx.lineWidth = wallWidth; ctx.strokeStyle = borderColor; ctx.strokeRect(sx, sy, sw, sh);
            ctx.lineWidth = wallWidth * 0.6; ctx.strokeStyle = "#8d6e63"; ctx.setLineDash([wallWidth * 1.5, wallWidth * 0.8]); ctx.strokeRect(sx, sy, sw, sh);
        } else if (town.level === 'town') {
            const wallWidth = Math.max(4, 8 * camera.scale);
            ctx.lineWidth = wallWidth; ctx.strokeStyle = borderColor; ctx.strokeRect(sx, sy, sw, sh);
            ctx.lineWidth = 1; ctx.strokeStyle = "#3e2723"; ctx.strokeRect(sx + wallWidth/2, sy + wallWidth/2, sw - wallWidth, sh - wallWidth);
        } else {
            const fenceWidth = Math.max(2, 4 * camera.scale);
            ctx.lineWidth = fenceWidth; ctx.strokeStyle = "#795548"; ctx.setLineDash([fenceWidth, fenceWidth * 1.5]); ctx.strokeRect(sx, sy, sw, sh);
        }
        ctx.restore();

        let fontSize = (sw * 0.8) / Math.max(1, town.name.length);
        fontSize = Math.min(fontSize, sh * 0.8); fontSize = Math.max(20, fontSize);
        ctx.save();
        ctx.fillStyle = theme.textDim || "rgba(62, 39, 35, 0.2)";
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(town.name, sx + sw/2, sy + sh/2); ctx.restore();

        if (typeof TownShops !== 'undefined') {
            // v3.1 已经精简参数
            TownShops.render(ctx, town, sx, sy, ts);
        }
    },

    _drawGrid: function(ctx, camera, ts, theme) {
        const startX = Math.floor(camera.x - (camera.width/2)/ts);
        const startY = Math.floor(camera.y - (camera.height/2)/ts);
        const endX = startX + (camera.width)/ts + 1; const endY = startY + (camera.height)/ts + 1;

        ctx.lineWidth = 1; ctx.strokeStyle = theme.gridSmall; ctx.beginPath();
        for (let x = Math.floor(startX); x <= endX; x++) { if (x % 10 === 0) continue; let sx = (x - camera.x) * ts + camera.width/2; ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height); }
        for (let y = Math.floor(startY); y <= endY; y++) { if (y % 10 === 0) continue; let sy = (y - camera.y) * ts + camera.height/2; ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy); }
        ctx.stroke();

        ctx.lineWidth = 1; ctx.strokeStyle = theme.gridBig; ctx.beginPath();
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
    },

    _getDeterministicRandom: function(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    },

    _drawDecorations: function(ctx, camera, ts, cx, cy, viewRect) {
        const startX = Math.floor(viewRect.x) - 1; const startY = Math.floor(viewRect.y) - 1;
        const endX = Math.ceil(viewRect.x + viewRect.w) + 1; const endY = Math.ceil(viewRect.y + viewRect.h) + 1;
        const seed = (player && player.worldSeed) ? player.worldSeed : 12345;
        const totalWeight = this.decoSprites.reduce((sum, item) => sum + item.weight, 0);
        const DENSITY = 0.10;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                if (this._isOccupied(x, y)) continue;
                const rand = this._getDeterministicRandom(x, y, seed);
                if (rand > DENSITY) continue;
                let targetWeight = (rand / DENSITY) * totalWeight;
                let sprite = null; let currentWeight = 0;
                for(let s of this.decoSprites) { currentWeight += s.weight; if (targetWeight <= currentWeight) { sprite = s; break; } }
                if (sprite) {
                    const screenX = (x - camera.x) * ts + cx; const screenY = (y - camera.y) * ts + cy;
                    const offsetX = (this._getDeterministicRandom(x, y, seed + 1) - 0.5) * ts * 0.5;
                    const offsetY = (this._getDeterministicRandom(x, y, seed + 2) - 0.5) * ts * 0.5;
                    const alpha = 0.5 + this._getDeterministicRandom(x, y, seed + 3) * 0.4;
                    ctx.save(); ctx.globalAlpha = alpha;
                    let drawScale = 1.5; let drawYOffset = 0.5; if (sprite.type === 'tree') { drawScale = 2.2; drawYOffset = 0.8; }
                    const drawSize = ts * drawScale;
                    ctx.drawImage(this.spriteSheet, sprite.x, sprite.y, sprite.w, sprite.h, screenX + offsetX - drawSize/4, screenY + offsetY - drawSize * drawYOffset, drawSize, drawSize);
                    ctx.restore();
                }
            }
        }
    },

    _drawTerrainZone: function(ctx, zone, camera, ts, cx, cy, viewRect, theme) {
        const sx = (zone.x[0] - camera.x) * ts + cx;
        const sy = (zone.y[0] - camera.y) * ts + cy;
        const sw = (zone.x[1] - zone.x[0]) * ts;
        const sh = (zone.y[1] - zone.y[0]) * ts;

        if (zone.type === 'road') ctx.fillStyle = theme.road;
        else if (zone.type === 'river') ctx.fillStyle = theme.river;
        else if (zone.type === 'mountain') ctx.fillStyle = theme.mountainBg;
        else if (zone.type === 'grass') ctx.fillStyle = theme.grass;
        else if (zone.type === 'desert') ctx.fillStyle = theme.desert;
        else if (zone.type === 'ocean') ctx.fillStyle = theme.ocean;
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
            if (theme === this.themes.night) ctx.fillStyle = "rgba(255,255,255,0.1)";

            ctx.font = `bold ${Math.max(40, 60 * camera.scale)}px Kaiti`;
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(zone.name, tx, ty); ctx.restore();
        }
    }
};

window.MapAtlas = MapAtlas;