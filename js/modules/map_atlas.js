// js/modules/map_atlas.js
// 地图渲染 v6.0：分级显示、矩形山脉、区域名称
console.log("加载 地图渲染模块");

const MapAtlas = {
    tileSize: 20,

    colors: {
        bg: "#f4f4f4",
        gridRegion: "rgba(211, 47, 47, 0.5)", // 900x900 深红
        gridSub: "rgba(0, 0, 0, 0.2)",       // 300x300 浅黑
        gridSmall: "rgba(0, 0, 0, 0.05)",

        road: "#a1887f",
        river: "#81d4fa",
        mountainBg: "rgba(121, 85, 72, 0.3)", // 山脉背景
        mountainBorder: "#5d4037",            // 山脉边框

        townBg: "#fffdf5",
        townLine: "#333",
        bridge: "#5d4037",

        textRegion: "rgba(0, 0, 0, 0.15)",    // 大区文字颜色
        textSub: "rgba(0, 0, 0, 0.3)"         // 小区文字颜色
    },

    // 主界面普通渲染 (暂不改动，保持原样或调用 Nation 模式)
    render: function(ctx, camera) {
        // 主界面默认使用 Detail 模式 (类似 Nation 但更细)
        const cam = { ...camera, level: 'nation' };
        this._renderCommon(ctx, cam);
    },

    // 战略地图渲染入口
    renderStrategic: function(ctx, camera) {
        this._renderCommon(ctx, camera);
    },

    _renderCommon: function(ctx, camera) {
        if (!camera || !player) return;
        const ts = this.tileSize * camera.scale;
        const level = camera.level || 'nation'; // world | nation

        // 1. 背景
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, camera.width, camera.height);

        // 绘制地图边界 (0,0) -> (2700, 2700)
        this._drawMapBorder(ctx, camera, ts);

        const centerX = camera.width / 2;
        const centerY = camera.height / 2;
        const viewRect = {
            x: camera.x - (centerX / ts),
            y: camera.y - (centerY / ts),
            w: camera.width / ts,
            h: camera.height / ts
        };

        // 2. 区域名字 (最底层)
        if (level === 'world') {
            this._drawRegionNames(ctx, camera, ts, 'region');
        } else {
            this._drawRegionNames(ctx, camera, ts, 'sub');
        }

        // 3. 地形 (山/水/路/桥)
        if (typeof TERRAIN_ZONES !== 'undefined') {
            TERRAIN_ZONES.forEach(zone => {
                if (!this._checkOverlap(zone, viewRect)) return;

                if (zone.type === 'road') {
                    this._drawRect(ctx, zone, this.colors.road, camera, ts);
                } else if (zone.type === 'river') {
                    this._drawRiver(ctx, zone, camera, ts);
                } else if (zone.type === 'mountain') {
                    // 【改动】使用矩形框绘制山脉
                    this._drawMountainRect(ctx, zone, camera, ts);
                } else if (zone.type === 'bridge') {
                    this._drawRect(ctx, zone, this.colors.bridge, camera, ts);
                }
            });
        }

        // 4. 网格
        this._drawGrids(ctx, camera, ts, viewRect, level);

        // 5. 城镇
        if (typeof WORLD_TOWNS !== 'undefined') {
            WORLD_TOWNS.forEach(town => {
                // World 级别只显示 City
                if (level === 'world' && town.level !== 'city') return;

                const townRect = { x: [town.x, town.x + town.w], y: [town.y, town.y + town.h] };
                if (!this._checkOverlap(townRect, viewRect)) return;

                this._drawTownSimple(ctx, town, camera, ts);
            });
        }

        // 6. 玩家
        this._drawPlayer(ctx, centerX, centerY, ts);
    },

    // === 绘图组件 ===

    _drawMapBorder: function(ctx, camera, ts) {
        const x = 0, y = 0, w = 2700, h = 2700;
        const sx = (x - camera.x) * ts + camera.width / 2;
        const sy = (y - camera.y) * ts + camera.height / 2;

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, w * ts, h * ts);
    },

    _drawGrids: function(ctx, camera, ts, view, level) {
        const startX = Math.floor(view.x);
        const startY = Math.floor(view.y);
        const endX = startX + Math.ceil(view.w) + 1;
        const endY = startY + Math.ceil(view.h) + 1;

        // 绘制 900 网格 (始终显示)
        ctx.beginPath();
        ctx.strokeStyle = this.colors.gridRegion;
        ctx.lineWidth = 2;
        for (let x = 0; x <= 2700; x += 900) {
            const sx = (x - camera.x) * ts + camera.width / 2;
            ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height);
        }
        for (let y = 0; y <= 2700; y += 900) {
            const sy = (y - camera.y) * ts + camera.height / 2;
            ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy);
        }
        ctx.stroke();

        // 绘制 300 网格 (仅 National 级别)
        if (level === 'nation') {
            ctx.beginPath();
            ctx.strokeStyle = this.colors.gridSub;
            ctx.lineWidth = 1;
            // 简单遍历视野内的线
            const step = 300;
            const sx300 = Math.floor(startX / step) * step;
            const sy300 = Math.floor(startY / step) * step;

            for (let x = sx300; x <= endX; x += step) {
                if (x % 900 === 0) continue; // 避开900的线
                const sx = (x - camera.x) * ts + camera.width / 2;
                ctx.moveTo(sx, 0); ctx.lineTo(sx, camera.height);
            }
            for (let y = sy300; y <= endY; y += step) {
                if (y % 900 === 0) continue;
                const sy = (y - camera.y) * ts + camera.height / 2;
                ctx.moveTo(0, sy); ctx.lineTo(camera.width, sy);
            }
            ctx.stroke();
        }
    },

    _drawMountainRect: function(ctx, zone, camera, ts) {
        const x = zone.x[0]; const y = zone.y[0];
        const w = zone.x[1] - zone.x[0]; const h = zone.y[1] - zone.y[0];
        const sx = (x - camera.x) * ts + camera.width / 2;
        const sy = (y - camera.y) * ts + camera.height / 2;

        // 矩形背景
        ctx.fillStyle = this.colors.mountainBg;
        ctx.fillRect(sx, sy, w * ts, h * ts);

        // 矩形边框
        ctx.strokeStyle = this.colors.mountainBorder;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // 虚线边框更有地图感
        ctx.strokeRect(sx, sy, w * ts, h * ts);
        ctx.setLineDash([]);

        // 中心文字
        ctx.fillStyle = this.colors.mountainBorder;
        const fontSize = Math.max(12, 16 * camera.scale);
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(zone.name, sx + w*ts/2, sy + h*ts/2);
    },

    _drawTownSimple: function(ctx, town, camera, ts) {
        const sx = (town.x - camera.x) * ts + camera.width / 2;
        const sy = (town.y - camera.y) * ts + camera.height / 2;
        const sw = town.w * ts;
        const sh = town.h * ts;

        ctx.fillStyle = this.colors.townBg;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.strokeStyle = this.colors.townLine;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);

        ctx.fillStyle = "#000";
        // 字体随缩放变化，但有上下限
        const fontSize = Math.max(10, Math.min(24, 14 * camera.scale));
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(town.name, sx + sw/2, sy + sh/2);
    },

    _drawRegionNames: function(ctx, camera, ts, type) {
        const fontSize = Math.max(20, 100 * camera.scale);
        ctx.font = `bold ${fontSize}px Kaiti`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (type === 'region') {
            // 900x900 大区名
            ctx.fillStyle = this.colors.textRegion;
            if (typeof REGION_LAYOUT !== 'undefined') {
                REGION_LAYOUT.forEach(r => {
                    const cx = (r.x[0] + r.x[1]) / 2;
                    const cy = (r.y[0] + r.y[1]) / 2;
                    const sx = (cx - camera.x) * ts + camera.width / 2;
                    const sy = (cy - camera.y) * ts + camera.height / 2;
                    ctx.fillText(r.name, sx, sy);
                });
            }
        } else {
            // 300x300 小区名
            ctx.fillStyle = this.colors.textSub;
            // 简单遍历 0-2, 0-2
            if (typeof SUB_REGION_NAMES !== 'undefined') {
                for (let key in SUB_REGION_NAMES) {
                    // key format: "r_c_0_1"
                    // 解析 key 获取大概坐标
                    // 这是一个简化的反向查找，或者直接遍历网格
                    // 为了准确，这里建议直接遍历网格坐标，反查名字
                    // ... (此处为简化实现，直接循环网格)
                }

                // 遍历所有 300x300 格子
                for (let gx = 0; gx < 9; gx++) {
                    for (let gy = 0; gy < 9; gy++) {
                        // 确定所属大区
                        const rx = Math.floor(gx / 3);
                        const ry = Math.floor(gy / 3);
                        // 大区ID映射 (对应 REGION_LAYOUT 的索引顺序)
                        // sw(0,0), s(1,0), se(2,0)... 需要根据 REGION_LAYOUT 的坐标匹配
                        // REGION_LAYOUT 里 x=[0,900] 是 rx=0
                        let regionId = "";
                        const rObj = REGION_LAYOUT.find(r => r.x[0]/900 === rx && r.y[0]/900 === ry);
                        if (rObj) regionId = rObj.id;

                        const subKey = `${regionId}_${gx%3}_${gy%3}`;
                        const name = SUB_REGION_NAMES[subKey];

                        if (name) {
                            const cx = (gx * 300) + 150;
                            const cy = (gy * 300) + 150;
                            const sx = (cx - camera.x) * ts + camera.width / 2;
                            const sy = (cy - camera.y) * ts + camera.height / 2;
                            ctx.fillText(name, sx, sy);
                        }
                    }
                }
            }
        }
    },

    _drawRect: function(ctx, zone, color, camera, ts) {
        const x = zone.x[0]; const y = zone.y[0];
        const w = zone.x[1] - zone.x[0]; const h = zone.y[1] - zone.y[0];
        const sx = (x - camera.x) * ts + camera.width / 2;
        const sy = (y - camera.y) * ts + camera.height / 2;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, w * ts + 1, h * ts + 1);
    },

    _drawRiver: function(ctx, zone, camera, ts) {
        const x = zone.x[0]; const y = zone.y[0];
        const w = zone.x[1] - zone.x[0]; const h = zone.y[1] - zone.y[0];
        const sx = (x - camera.x) * ts + camera.width / 2;
        const sy = (y - camera.y) * ts + camera.height / 2;
        ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = this.colors.river;
        ctx.fillRect(sx, sy, w * ts, h * ts);
        ctx.restore();
    },

    _checkOverlap: function(zone, view) {
        return !(zone.x[1] < view.x || zone.x[0] > view.x + view.w ||
            zone.y[1] < view.y || zone.y[0] > view.y + view.h);
    },

    _drawPlayer: function(ctx, cx, cy, ts) {
        ctx.beginPath(); ctx.arc(cx, cy, ts * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "#d50000"; // 红色点更显眼
        ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    }
};

window.MapAtlas = MapAtlas;