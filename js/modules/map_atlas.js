// js/modules/map_atlas.js
// 主地图渲染模块 v19.2 (性能优化版)
// 优化内容：减少 Canvas 状态切换开销，优化循环内计算
//console.log("加载 地图渲染模块 (Performance Optimized)");

const MapAtlas = {
    tileSize: 20,
    spriteSheet: null,
    decoSprites: [],
    isInited: false,

    // 颜色配置
    colors: {
        bg: "#e0e0e0",
        gridSmall: "rgba(0, 0, 0, 0.04)", gridBig: "rgba(0, 0, 0, 0.08)",
        road: "#a1887f", river: "#81d4fa", mountainBg: "rgba(121, 85, 72, 0.4)",
        grass: "#aed581", desert: "#ffe082", ocean: "#29b6f6",
        townBg: "rgba(255, 248, 225, 0.9)", townBorder: "#5d4037",
        textMain: "#3e2723", textDim: "rgba(62, 39, 35, 0.2)"
    },

    // 昼夜主题配置 (保持原版配色)
    themes: {
        day: {
            bg: "#cfd8dc",
            gridSmall: "rgba(0, 0, 0, 0.05)", gridBig: "rgba(0, 0, 0, 0.1)",
            road: "rgba(121, 85, 72, 0.4)", river: "rgba(33, 150, 243, 0.4)",
            mountainBg: "rgba(93, 64, 55, 0.2)", grass: "rgba(104, 159, 56, 0.35)",
            desert: "rgba(255, 179, 0, 0.3)", ocean: "rgba(2, 119, 189, 0.4)",
            townBg: "rgba(255, 255, 255, 0.6)", townBorder: "rgba(69, 90, 100, 0.5)",
            textMain: "#37474f", textDim: "rgba(55, 71, 79, 0.3)"
        },
        night: {
            bg: "#37474f",
            gridSmall: "rgba(255, 255, 255, 0.03)", gridBig: "rgba(255, 255, 255, 0.06)",
            road: "rgba(180, 160, 150, 0.8)", river: "rgba(140, 158, 255, 0.2)",
            mountainBg: "rgba(0, 0, 0, 0.2)", grass: "rgba(129, 199, 132, 0.15)",
            desert: "rgba(255, 202, 40, 0.1)", ocean: "rgba(68, 138, 255, 0.2)",
            townBg: "rgba(236, 240, 241, 0.3)", townBorder: "rgba(176, 190, 197, 0.3)",
            textMain: "#eceff1", textDim: "rgba(176, 190, 197, 0.3)"
        }
    },

    init: function() {
        if (this.isInited) return;
        if (window.InkSpriteGenerator) {
            this.spriteSheet = InkSpriteGenerator.generateSpriteSheet();
            const TS = 64;
            this.decoSprites = [
                {id: 'moss',   count:4, y:0,    weight:10},
                {id: 'grass',  count:4, y:TS,   weight:30},
                {id: 'rock',   count:4, y:TS*2, weight:10},
                {id: 'flower', count:4, y:TS*3, weight:30},
                {id: 'tree',   count:4, y:TS*4, weight:35}
            ].flatMap(grp =>
                Array.from({length: grp.count}, (_, c) => ({
                    id: `${grp.id}_${c}`, x: c*TS, y: grp.y, w: TS, h: TS, weight: grp.weight, type: grp.id
                }))
            );
            this.isInited = true;
        }
    },

    _getDeterministicRandom: function(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    },

    _isOccupied: function(x, y) {
        // 缓存判断：使用简单的边界检查替代高开销的 find/some
        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let i = 0, l = WORLD_TOWNS.length; i < l; i++) {
                const t = WORLD_TOWNS[i];
                if (x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h) return true;
            }
        }
        if (typeof TERRAIN_ZONES !== 'undefined') {
            for (let i = 0, l = TERRAIN_ZONES.length; i < l; i++) {
                const z = TERRAIN_ZONES[i];
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

        // 1. 判断时间与主题
        let isNight = false;
        if (player.time) {
            const h = player.time.hour;
            isNight = (h >= 18 || h < 6);
        }
        const theme = isNight ? (this.themes.night || this.themes.day) : this.themes.day;

        // 2. 清空与背景
        // 使用 clearRect 清空画布可能比 fillRect 覆盖更快，但这里为了背景色，直接 fill
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, camera.width, camera.height);

        const centerX = camera.width / 2;
        const centerY = camera.height / 2;

        // 视口矩形 (世界坐标)
        const viewRect = {
            x: camera.x - (centerX / ts),
            y: camera.y - (centerY / ts),
            w: camera.width / ts,
            h: camera.height / ts
        };

        // 3. 统一设置文字基线，减少循环内设置
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 4. 地形渲染
        if (typeof TERRAIN_ZONES !== 'undefined') {
            // 优化：提前设置 globalAlpha，如果大部分不需要变
            ctx.globalAlpha = 0.6;
            for(let i = 0, l = TERRAIN_ZONES.length; i < l; i++) {
                const zone = TERRAIN_ZONES[i];
                if (this._checkOverlap(zone, viewRect)) {
                    this._drawTerrainZone(ctx, zone, camera, ts, centerX, centerY, viewRect, theme);
                }
            }
            ctx.globalAlpha = 1.0; // 恢复
        }

        // 5. 装饰物
        if (this.isInited && this.spriteSheet) {
            if (isNight) {
                ctx.save();
                ctx.filter = "brightness(0.7) contrast(1.1)";
            }
            this._drawDecorations(ctx, camera, ts, centerX, centerY, viewRect);
            if (isNight) ctx.restore();
        }

        // 6. 网格
        this._drawGrid(ctx, camera, ts, theme);

        // 7. 城镇
        if (typeof WORLD_TOWNS !== 'undefined') {
            for(let i = 0, l = WORLD_TOWNS.length; i < l; i++) {
                const town = WORLD_TOWNS[i];
                const townRect = { x: [town.x, town.x + town.w], y: [town.y, town.y + town.h] };
                if (this._checkOverlap(townRect, viewRect)) {
                    this._drawTownWithShops(ctx, town, camera, ts, centerX, centerY, theme);
                }
            }
        }

        // 8. 敌人 (排序与渲染)
        if (enemies && Array.isArray(enemies)) {
            // 浅拷贝后排序，避免影响原数组
            const sortedEnemies = enemies.slice().sort((a, b) => {
                const zA = a.visual ? a.visual.zIndex : 0;
                const zB = b.visual ? b.visual.zIndex : 0;
                return zA - zB;
            });
            this._drawEnemies(ctx, sortedEnemies, camera, ts, centerX, centerY, viewRect, isNight);
        }

        // 9. 玩家
        this._drawPlayer(ctx, centerX, centerY, ts);
    },

    _drawEnemies: function(ctx, enemies, camera, ts, cx, cy, viewRect, isNight) {
        // 优化：提取常量
        const viewMaxX = viewRect.x + viewRect.w;
        const viewMaxY = viewRect.y + viewRect.h;
        const PI2 = Math.PI * 2;

        for(let i = 0, l = enemies.length; i < l; i++) {
            const enemy = enemies[i];
            // 视锥剔除
            if (enemy.x < viewRect.x || enemy.x > viewMaxX ||
                enemy.y < viewRect.y || enemy.y > viewMaxY) continue;

            const sx = (enemy.x - camera.x) * ts + cx;
            const sy = (enemy.y - camera.y) * ts + cy;
            const v = enemy.visual || { icon: "💀", color: "#333", scale: 1.0, shadowBlur: 0, shadowColor: null, displayName: enemy.name };
            const size = ts * v.scale;

            // 1. 底座光环/阴影
            ctx.beginPath();
            if (isNight) {
                ctx.save();

                // 增加发光强度，让它在晚上更亮
                ctx.shadowBlur = 25;
                // 发光颜色使用怪物的配置颜色
                ctx.shadowColor = v.color;

                // =========== 【核心修改开始】 ===========
                // 如果怪物配置了特殊的阴影颜色（说明是精英/BOSS），就用那个颜色填充
                // 如果是普通怪（shadowBlur通常比较小），就用淡白色，稍微有点幽灵感
                if (v.shadowBlur > 5 && v.shadowColor) {
                    ctx.fillStyle = v.shadowColor; // 这里会使用配置的 rgba(..., ...) 颜色
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // 普通怪保持淡白
                }
                // =========== 【核心修改结束】 ===========

                ctx.arc(sx, sy, size * 0.8, 0, PI2);
                ctx.fill();
                ctx.restore();
            } else {
                if (v.shadowBlur > 0 && v.shadowColor) {
                    ctx.save();
                    ctx.shadowBlur = v.shadowBlur;
                    ctx.shadowColor = v.shadowColor;
                    ctx.fillStyle = v.shadowColor;
                    ctx.arc(sx, sy, size * 0.8, 0, PI2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                    ctx.beginPath();
                    ctx.arc(sx, sy, size * 0.4, 0, PI2);
                    ctx.fill();
                }
            }

            // 2. 图标 (减少 save/restore，直接设置属性后复原)
            // ctx.save(); // 移除不必要的 save
            const originalFont = ctx.font;
            const originalFill = ctx.fillStyle;

            ctx.font = `${size}px Arial`;
            // textAlign 已在 render 中统一设置为 center
            ctx.fillStyle = isNight ? "#fff" : "#000"; // 简单回退颜色，实际图标由 text 绘制
            ctx.fillText(v.icon, sx, sy);

            // 3. 名字
            const nameSize = Math.max(10, ts * 0.5 * v.scale);
            ctx.font = `bold ${nameSize}px Kaiti`;
            ctx.fillStyle = v.color;

            if (isNight) {
                ctx.strokeStyle = "rgba(230, 230, 230, 0.95)";
                ctx.lineWidth = 3;
                ctx.strokeText(v.displayName, sx, sy - size * 0.9);

                if (v.color === '#212121' || v.color === '#000000' || v.color === '#333') {
                    ctx.fillStyle = "#222";
                }
            } else if (v.color === '#fff' || v.color === '#ffffff') {
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                ctx.strokeText(v.displayName, sx, sy - size * 0.9);
            }

            ctx.fillText(v.displayName, sx, sy - size * 0.9);

            // 恢复上下文状态 (手动恢复比 restore 快)
            ctx.font = originalFont;
            ctx.fillStyle = originalFill;
            // ctx.restore();
        }
    },

    _drawTownWithShops: function(ctx, town, camera, ts, cx, cy, theme) {
        const sx = (town.x - camera.x) * ts + cx;
        const sy = (town.y - camera.y) * ts + cy;
        const sw = town.w * ts;
        const sh = town.h * ts;

        ctx.fillStyle = theme.townBg;
        ctx.fillRect(sx, sy, sw, sh);

        // 边框绘制 - 优化：减少 save/restore
        const borderColor = theme.townBorder;
        ctx.beginPath(); // 开始路径

        if (town.level === 'city') {
            const wallWidth = Math.max(6, 12 * camera.scale);
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(sx, sy, sw, sh);

            ctx.save(); // 虚线需要 save/restore
            ctx.lineWidth = wallWidth * 0.6;
            ctx.strokeStyle = "#8d6e63";
            ctx.setLineDash([wallWidth * 1.5, wallWidth * 0.8]);
            ctx.strokeRect(sx, sy, sw, sh);
            ctx.restore();
        } else if (town.level === 'town') {
            const wallWidth = Math.max(4, 8 * camera.scale);
            ctx.lineWidth = wallWidth;
            ctx.strokeStyle = borderColor;
            ctx.strokeRect(sx, sy, sw, sh);

            ctx.lineWidth = 1;
            ctx.strokeStyle = "#3e2723";
            ctx.strokeRect(sx + wallWidth/2, sy + wallWidth/2, sw - wallWidth, sh - wallWidth);
        } else {
            const fenceWidth = Math.max(2, 4 * camera.scale);
            ctx.save();
            ctx.lineWidth = fenceWidth;
            ctx.strokeStyle = "#795548";
            ctx.setLineDash([fenceWidth, fenceWidth * 1.5]);
            ctx.strokeRect(sx, sy, sw, sh);
            ctx.restore();
        }

        let fontSize = (sw * 0.8) / Math.max(1, town.name.length);
        fontSize = Math.min(fontSize, sh * 0.8);
        fontSize = Math.max(20, fontSize);

        ctx.fillStyle = theme.textDim || "rgba(62, 39, 35, 0.2)";
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.fillText(town.name, sx + sw/2, sy + sh/2);

        if (typeof TownShops !== 'undefined') {
            TownShops.render(ctx, town, sx, sy, ts);
        }
    },

    _drawGrid: function(ctx, camera, ts, theme) {
        const halfW = camera.width/2;
        const halfH = camera.height/2;
        const startX = Math.floor(camera.x - halfW/ts);
        const startY = Math.floor(camera.y - halfH/ts);
        const endX = startX + camera.width/ts + 1;
        const endY = startY + camera.height/ts + 1;

        // 小网格
        ctx.lineWidth = 1;
        ctx.strokeStyle = theme.gridSmall;
        ctx.beginPath();
        for (let x = Math.floor(startX); x <= endX; x++) {
            if (x % 10 === 0) continue;
            let sx = (x - camera.x) * ts + halfW;
            ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height);
        }
        for (let y = Math.floor(startY); y <= endY; y++) {
            if (y % 10 === 0) continue;
            let sy = (y - camera.y) * ts + halfH;
            ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy);
        }
        ctx.stroke();

        // 大网格
        ctx.lineWidth = 1;
        ctx.strokeStyle = theme.gridBig;
        ctx.beginPath();
        for (let x = Math.floor(startX/10)*10; x <= endX; x+=10) {
            let sx = (x - camera.x) * ts + halfW;
            ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height);
        }
        for (let y = Math.floor(startY/10)*10; y <= endY; y+=10) {
            let sy = (y - camera.y) * ts + halfH;
            ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy);
        }
        ctx.stroke();
    },

    _drawPlayer: function(ctx, cx, cy, ts) {
        const PI2 = Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.4, 0, PI2);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, ts * 0.25, 0, PI2);
        ctx.fillStyle = "#d32f2f";
        ctx.fill();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    _checkOverlap: function(zone, view) {
        return !(zone.x[1] < view.x || zone.x[0] > view.x + view.w || zone.y[1] < view.y || zone.y[0] > view.y + view.h);
    },

    _drawDecorations: function(ctx, camera, ts, cx, cy, viewRect) {
        const startX = Math.floor(viewRect.x) - 1;
        const startY = Math.floor(viewRect.y) - 1;
        const endX = Math.ceil(viewRect.x + viewRect.w) + 1;
        const endY = Math.ceil(viewRect.y + viewRect.h) + 1;
        const seed = (player && player.worldSeed) ? player.worldSeed : 12345;
        const totalWeight = 115; // sum of weights
        const DENSITY = 0.10;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                // 占用检查放到最前面
                if (this._isOccupied(x, y)) continue;

                const rand = this._getDeterministicRandom(x, y, seed);
                if (rand > DENSITY) continue;

                let targetWeight = (rand / DENSITY) * totalWeight;
                let sprite = null;
                let currentWeight = 0;

                // 优化查找：简单循环通常足够快
                for(let i=0; i<this.decoSprites.length; i++) {
                    const s = this.decoSprites[i];
                    currentWeight += s.weight;
                    if (targetWeight <= currentWeight) {
                        sprite = s;
                        break;
                    }
                }

                if (sprite) {
                    const screenX = (x - camera.x) * ts + cx;
                    const screenY = (y - camera.y) * ts + cy;

                    // 随机偏移
                    const offsetX = (this._getDeterministicRandom(x, y, seed + 1) - 0.5) * ts * 0.5;
                    const offsetY = (this._getDeterministicRandom(x, y, seed + 2) - 0.5) * ts * 0.5;
                    // alpha
                    const alpha = 0.5 + this._getDeterministicRandom(x, y, seed + 3) * 0.4;

                    ctx.globalAlpha = alpha; // 外部已 save，这里直接设

                    let drawScale = 1.5;
                    let drawYOffset = 0.5;
                    if (sprite.type === 'tree') {
                        drawScale = 2.2;
                        drawYOffset = 0.8;
                    }

                    const drawSize = ts * drawScale;
                    ctx.drawImage(this.spriteSheet, sprite.x, sprite.y, sprite.w, sprite.h,
                        screenX + offsetX - drawSize/4,
                        screenY + offsetY - drawSize * drawYOffset,
                        drawSize, drawSize);
                }
            }
        }
        // 恢复 alpha
        ctx.globalAlpha = 1.0;
    },

    _drawTerrainZone: function(ctx, zone, camera, ts, cx, cy, viewRect, theme) {
        const sx = (zone.x[0] - camera.x) * ts + cx;
        const sy = (zone.y[0] - camera.y) * ts + cy;
        const sw = (zone.x[1] - zone.x[0]) * ts;
        const sh = (zone.y[1] - zone.y[0]) * ts;

        let fillStyle = null;
        if (zone.type === 'road') fillStyle = theme.road;
        else if (zone.type === 'river') fillStyle = theme.river;
        else if (zone.type === 'mountain') fillStyle = theme.mountainBg;
        else if (zone.type === 'grass') fillStyle = theme.grass;
        else if (zone.type === 'desert') fillStyle = theme.desert;
        else if (zone.type === 'ocean') fillStyle = theme.ocean;

        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            // globalAlpha 在外层循环已统一设置
            ctx.fillRect(sx, sy, sw, sh);
        }

        // 绘制地名 (如果区域足够大)
        const intersectX = Math.max(zone.x[0], viewRect.x);
        const intersectY = Math.max(zone.y[0], viewRect.y);
        const intersectW = Math.min(zone.x[1], viewRect.x + viewRect.w) - intersectX;
        const intersectH = Math.min(zone.y[1], viewRect.y + viewRect.h) - intersectY;

        if (intersectW > 5 && intersectH > 5) {
            const tx = (intersectX + intersectW/2 - camera.x) * ts + cx;
            const ty = (intersectY + intersectH/2 - camera.y) * ts + cy;

            // 恢复 alpha 绘制文字
            const oldAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = "rgba(0,0,0,0.15)";
            // 这里没法简单判断 theme === night，只能根据颜色值估算，或者传参
            // 简单起见，统一用一种可见度较高的颜色
            if (theme.bg === "#37474f") ctx.fillStyle = "rgba(255,255,255,0.1)";

            ctx.font = `bold ${Math.max(40, 60 * camera.scale)}px Kaiti`;
            ctx.fillText(zone.name, tx, ty);

            ctx.globalAlpha = oldAlpha; // 恢复半透明给下一个地形
        }
    }
};

window.MapAtlas = MapAtlas;