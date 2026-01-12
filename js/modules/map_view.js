// js/modules/map_view.js
// 小地图功能 - 适配 5100x5100

// 【核心修改1】显式定义地图尺寸，防止外部未定义


const MapView = {
    canvas: null,
    ctx: null,
    tooltip: null,
    sidebar: null,
    // animationId: null, // 移除无限循环动画 ID

    layout: { size: 0, offX: 0, offY: 0 },

    // 摄像机默认居中 (2550, 2550)
    camera: { x: (MAP_SIZE/2), y: (MAP_SIZE/2), level: "world" },

    isDragging: false,
    dragStartX: 0, dragStartY: 0,
    lastMouseX: 0, lastMouseY: 0,
    isDirty: false, // 标记是否需要重绘

    // 配置：新增了 grass, desert, ocean 颜色
    config: {
        colors: {
            bg: "#f4f4f4",
            gridWorld: "rgba(169, 68, 66, 0.6)",
            gridNation: "rgba(0, 0, 0, 0.15)",

            road: "#a1887f",
            river: "#81d4fa",
            mountainBg: "rgba(121, 85, 72, 0.3)",
            mountainBorder: "#5d4037",

            grass: "#aed581",   // 草原绿
            desert: "#ffe082",  // 沙漠黄
            ocean: "#29b6f6",   // 海洋蓝

            // 城镇基础色
            cityBg: "#e3f2fd",    // 城市：淡蓝
            townBg: "#fff3e0",    // 城镇：淡橙
            villageBg: "#f1f8e9", // 村落：淡绿

            cityBorder: "#1565c0",
            townBorder: "#e65100",
            villageBorder: "#33691e"
        }
    },

    open: function() {
        if (!window.UtilsModal) return;
        UtilsModal.showMapModal(() => { this.init(); });
    },

    init: function() {
        const container = document.getElementById('full_map_container');
        this.canvas = document.getElementById('full_map_canvas');
        this.tooltip = document.getElementById('map_view_tooltip');
        this.sidebar = document.getElementById('map_sidebar');

        if (!this.canvas || !container) return;

        this.ctx = this.canvas.getContext('2d', { alpha: false }); // 优化：关闭透明通道

        if (window.player && player.x) {
            this.camera.x = player.x;
            this.camera.y = player.y;
        } else {
            this.camera.x = (MAP_SIZE/2);
            this.camera.y = (MAP_SIZE/2);
        }

        this.camera.level = "world";

        this._bindEvents();
        this._resize();
        this._resizeHandler = () => this._resize();
        window.addEventListener('resize', this._resizeHandler);

        // 初始化时强制渲染一次
        this._render();
        this._updateUI();
    },

    _requestRender: function() {
        if (!this.isDirty) {
            this.isDirty = true;
            requestAnimationFrame(() => {
                this._render();
                this.isDirty = false;
            });
        }
    },

    _resize: function() {
        const container = document.getElementById('full_map_container');
        if (!container || !this.canvas) return;

        const w = container.clientWidth;
        const h = container.clientHeight;

        // 只有尺寸真正改变时才设置 width/height，避免闪烁和重置 context
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }

        const margin = 20;
        const size = Math.min(w, h) - (margin * 2);

        this.layout.size = size;
        this.layout.offX = (w - size) / 2;
        this.layout.offY = (h - size) / 2;

        this._requestRender(); // 触发重绘
    },

    // 【核心修改2】修正缩放比例计算
    // world 模式：整个 canvas 显示完整的 MAP_SIZE (5100)
    // nation 模式：放大显示，例如显示 1/3 的区域 (1700)
    _getScale: function() {
        if (this.camera.level === 'world') return this.layout.size / MAP_SIZE;
        else return this.layout.size / (MAP_SIZE/3);
    },

    _screenToWorld: function(sx, sy) {
        const mapX = sx - this.layout.offX;
        const mapY = sy - this.layout.offY;
        const scale = this._getScale();
        const centerX = this.layout.size / 2;
        const centerY = this.layout.size / 2;
        const worldX = this.camera.x + (mapX - centerX) / scale;
        const worldY = this.camera.y + (mapY - centerY) / scale;
        return { x: worldX, y: worldY };
    },

    _bindEvents: function() {
        this.canvas.onmousedown = (e) => {
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;

            if (this.camera.level === 'world') return;

            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            if (mx < this.layout.offX || mx > this.layout.offX + this.layout.size ||
                my < this.layout.offY || my > this.layout.offY + this.layout.size) return;

            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        };

        window.onmouseup = (e) => {
            // 如果正在拖拽中结束，需要重置鼠标样式
            if (this.isDragging && this.canvas) {
                this.canvas.style.cursor = 'default';
            }
            this.isDragging = false;

            // 点击判定
            const dist = Math.sqrt(Math.pow(e.clientX - this.dragStartX, 2) + Math.pow(e.clientY - this.dragStartY, 2));
            if (dist < 5) this._handleMapClick(e);
        };

        this.canvas.onmousemove = (e) => {
            this._handleHover(e);

            if (this.isDragging && this.camera.level === 'nation') {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                const scale = this._getScale();
                this.camera.x -= dx / scale;
                this.camera.y -= dy / scale;
                this._clampCamera();
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this._updateMouseCoord(e);

                this._requestRender(); // 拖拽时触发重绘
            }
        };

        this.canvas.onwheel = (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                if (this.camera.level !== 'world') {
                    this.camera.level = 'world';
                    this.camera.x = (MAP_SIZE/2);
                    this.camera.y = (MAP_SIZE/2);
                    this._updateUI();
                    this._requestRender(); // 缩放后重绘
                }
            } else {
                if (this.camera.level !== 'nation') {
                    this.camera.level = 'nation';
                    const rect = this.canvas.getBoundingClientRect();
                    const mx = e.clientX - rect.left;
                    const my = e.clientY - rect.top;
                    if (mx >= this.layout.offX && mx <= this.layout.offX + this.layout.size &&
                        my >= this.layout.offY && my <= this.layout.offY + this.layout.size) {
                        const worldScale = this.layout.size / MAP_SIZE; // 这里之前是 / (MAP_SIZE/3)，但在 world 模式下鼠标指向是基于 worldScale 的
                        // 但实际上如果当前是 world 模式，scale 就是 worldScale。
                        // 如果要放大到 nation 模式，我们需要以鼠标位置为中心放大

                        // 修正：从 world 模式进入 nation 模式的定位逻辑
                        const wp = this._screenToWorld(mx, my);
                        this.camera.x = Math.max(0, Math.min(MAP_SIZE, wp.x));
                        this.camera.y = Math.max(0, Math.min(MAP_SIZE, wp.y));
                        this._clampCamera();
                    }
                    this._updateUI();
                    this._requestRender(); // 缩放后重绘
                }
            }
        };
    },

    _handleMapClick: function(e) {
        if (!this.sidebar) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (mx < this.layout.offX || mx > this.layout.offX + this.layout.size ||
            my < this.layout.offY || my > this.layout.offY + this.layout.size) return;
        const worldPos = this._screenToWorld(mx, my);
        const info = this._hitTest(worldPos.x, worldPos.y);
        this._renderSidebar(info);
    },

    _renderSidebar: function(info) {
        if (!info) {
            this.sidebar.innerHTML = `
                <div class="map_empty_state">
                    <div class="map_empty_icon">🗺️</div>
                    <p>点击地点<br>查看详情</p>
                </div>`;
            return;
        }

        const typeLabels = {
            'city': '主城', 'town': '重镇', 'village': '村落',
            'mountain': '名山', 'river': '水系', 'road': '官道',
            'grass': '草原', 'desert': '荒漠', 'ocean': '海域'
        };
        const typeName = typeLabels[info.type] || '地理';
        const desc = info.desc || "暂无详细记载。";

        let contentHtml = `
            <div class="map_sidebar_header">
                <div class="map_sidebar_title">${info.name}</div>
                <div class="map_sidebar_type">${typeName}</div>
            </div>
            <div class="map_sidebar_content">
                <p style="margin-bottom: 30px;">${desc}</p>
                <div style="padding-top:20px; border-top:2px dashed #eee; color:#666;">
                    <p style="font-size: 0.9em; font-weight:bold;">地理范围：</p>
                    <p style="font-size: 0.8em; font-family:monospace;">X: ${info.xRange[0]} - ${info.xRange[1]}</p>
                    <p style="font-size: 0.8em; font-family:monospace;">Y: ${info.yRange[0]} - ${info.yRange[1]}</p>
                </div>
            </div>
        `;
        this.sidebar.innerHTML = contentHtml;
    },

    _hitTest: function(x, y) {
        if (typeof WORLD_TOWNS !== 'undefined') {
            const town = WORLD_TOWNS.find(t => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h);
            if (town) return {
                type: town.level, name: town.name, desc: town.desc,
                xRange: [town.x, town.x+town.w], yRange: [town.y, town.y+town.h]
            };
        }
        if (typeof TERRAIN_ZONES !== 'undefined') {
            for (let i = TERRAIN_ZONES.length - 1; i >= 0; i--) {
                const z = TERRAIN_ZONES[i];
                if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) {
                    return { type: z.type, name: z.name, desc: z.desc, xRange: z.x, yRange: z.y };
                }
            }
        }
        return null;
    },

    _render: function() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // 使用整型坐标清理，防止抗锯齿导致的模糊
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = "#e0e0e0";
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.beginPath();
        ctx.rect(this.layout.offX, this.layout.offY, this.layout.size, this.layout.size);
        ctx.clip();

        ctx.fillStyle = this.config.colors.bg;
        ctx.fillRect(this.layout.offX, this.layout.offY, this.layout.size, this.layout.size);

        const scale = this._getScale();
        ctx.translate(this.layout.offX + this.layout.size/2, this.layout.offY + this.layout.size/2);
        ctx.scale(scale, scale);
        ctx.translate(-this.camera.x, -this.camera.y);

        this._drawGrids(ctx);
        this._drawRegionNames(ctx);
        this._drawTerrain(ctx);
        this._drawTowns(ctx);
        this._drawPlayer(ctx);

        // 【核心修改3】绘制世界边界 (5100x5100)
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2 / scale;
        ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);

        ctx.restore();

        // 外框
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.layout.offX, this.layout.offY, this.layout.size, this.layout.size);
    },

    _drawGrids: function(ctx) {
        const c = this.config.colors;
        const scale = this._getScale();

        ctx.beginPath();
        ctx.strokeStyle = c.gridWorld;
        ctx.lineWidth = 2 / scale;
        // 【核心修改4】绘制区域网格 (间隔 MAP_SIZE/3 = 1700)
        for (let i = 0; i <= MAP_SIZE; i += (MAP_SIZE/3)) {
            ctx.moveTo(i, 0); ctx.lineTo(i, MAP_SIZE);
            ctx.moveTo(0, i); ctx.lineTo(MAP_SIZE, i);
        }
        ctx.stroke();

        if (this.camera.level === 'nation') {
            ctx.beginPath();
            ctx.strokeStyle = c.gridNation;
            ctx.lineWidth = 1 / scale;
            // 【核心修改5】绘制详细网格 (间隔约 566)
            const detailStep = MAP_SIZE / 9; // 5100 / 9 ≈ 566.6
            for (let i = 0; i <= MAP_SIZE; i += detailStep) {
                // 跳过与大网格重叠的线
                if (Math.abs(i % (MAP_SIZE/3)) < 1) continue;
                ctx.moveTo(i, 0); ctx.lineTo(i, MAP_SIZE);
                ctx.moveTo(0, i); ctx.lineTo(MAP_SIZE, i);
            }
            ctx.stroke();
        }
    },

    _drawRegionNames: function(ctx) {
        if (typeof REGION_LAYOUT === 'undefined') return;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (this.camera.level === 'world') {
            ctx.font = `bold 120px Kaiti`;
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            REGION_LAYOUT.forEach(r => {
                const cx = (r.x[0] + r.x[1]) / 2;
                const cy = (r.y[0] + r.y[1]) / 2;
                ctx.fillText(r.name, cx, cy);
            });
        } else {
            ctx.font = `bold 60px Kaiti`;
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            if (typeof SUB_REGIONS !== 'undefined') {
                REGION_LAYOUT.forEach((r, idx) => {
                    for(let gx=0; gx<3; gx++) {
                        for(let gy=0; gy<3; gy++) {
                            const key = `${r.id}_${gx}_${gy}`;
                            if(SUB_REGIONS[key]) {
                                // 修正子区域中心点计算
                                const subW = (MAP_SIZE/9);
                                const cx = r.x[0] + gx*subW + subW/2;
                                const cy = r.y[0] + gy*subW + subW/2;
                                ctx.fillText(SUB_REGIONS[key].name, cx, cy);
                            }
                        }
                    }
                });
            }
        }
    },

    _drawTerrain: function(ctx) {
        if (typeof TERRAIN_ZONES === 'undefined') return;
        const c = this.config.colors;
        const scale = this._getScale();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        TERRAIN_ZONES.forEach(z => {
            const w = z.x[1] - z.x[0];
            const h = z.y[1] - z.y[0];

            switch(z.type) {
                case 'road':
                    ctx.fillStyle = c.road;
                    ctx.fillRect(z.x[0], z.y[0], w, h);
                    break;
                case 'river':
                    ctx.fillStyle = c.river;
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(z.x[0], z.y[0], w, h);
                    ctx.globalAlpha = 1.0;
                    break;
                case 'mountain':
                    ctx.fillStyle = c.mountainBg;
                    ctx.fillRect(z.x[0], z.y[0], w, h);
                    ctx.strokeStyle = c.mountainBorder;
                    ctx.lineWidth = 2 / scale;
                    ctx.setLineDash([10/scale, 10/scale]);
                    ctx.strokeRect(z.x[0], z.y[0], w, h);
                    ctx.setLineDash([]);
                    if (this.camera.level === 'nation') {
                        ctx.fillStyle = c.mountainBorder;
                        ctx.font = `bold 24px Kaiti`;
                        ctx.fillText(z.name, z.x[0] + w/2, z.y[0] + h/2);
                    }
                    break;
                case 'grass':
                    ctx.fillStyle = c.grass;
                    ctx.fillRect(z.x[0], z.y[0], w, h);
                    if (this.camera.level === 'nation') {
                        ctx.fillStyle = "rgba(0,0,0,0.3)";
                        ctx.font = `bold 20px Kaiti`;
                        ctx.fillText(z.name, z.x[0] + w/2, z.y[0] + h/2);
                    }
                    break;
                case 'desert':
                    ctx.fillStyle = c.desert;
                    ctx.fillRect(z.x[0], z.y[0], w, h);
                    break;
                case 'ocean':
                    ctx.fillStyle = c.ocean;
                    ctx.fillRect(z.x[0], z.y[0], w, h);
                    if (this.camera.level === 'world') {
                        ctx.fillStyle = "rgba(255,255,255,0.3)";
                        ctx.font = `bold 60px Kaiti`;
                        ctx.fillText(z.name, z.x[0] + w/2, z.y[0] + h/2);
                    }
                    break;
            }
        });
    },

    _drawTowns: function(ctx) {
        if (typeof WORLD_TOWNS === 'undefined') return;
        const c = this.config.colors;
        const scale = this._getScale();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        WORLD_TOWNS.forEach(t => {
            if (this.camera.level === 'world' && t.level !== 'city') return;

            let bg, border, shape = 'rect';
            if (t.level === 'city') {
                bg = c.cityBg; border = c.cityBorder; shape = 'rect_large';
            } else if (t.level === 'town') {
                bg = c.townBg; border = c.townBorder; shape = 'rect_mid';
            } else {
                bg = c.villageBg; border = c.villageBorder; shape = 'circle';
            }

            ctx.fillStyle = bg;
            ctx.strokeStyle = border;
            ctx.lineWidth = 2 / scale;

            if (shape === 'circle') {
                ctx.beginPath();
                ctx.arc(t.x + t.w/2, t.y + t.h/2, t.w/2, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(t.x, t.y, t.w, t.h);
                if (t.level === 'city') {
                    ctx.lineWidth = 4 / scale;
                    ctx.strokeRect(t.x, t.y, t.w, t.h);
                    ctx.lineWidth = 1 / scale;
                    ctx.strokeRect(t.x + 2/scale, t.y + 2/scale, t.w - 4/scale, t.h - 4/scale);
                } else {
                    ctx.strokeRect(t.x, t.y, t.w, t.h);
                }
            }

            ctx.fillStyle = "#000";
            const fontSize = this.camera.level === 'world' ? 40 : (t.level === 'village' ? 16 : 24);
            ctx.font = `bold ${fontSize}px Kaiti`;
            ctx.fillText(t.name, t.x + t.w/2, t.y + t.h/2);
        });
    },

    _drawPlayer: function(ctx) {
        if (!window.player) return;
        const scale = this._getScale();
        ctx.beginPath();
        const radius = this.camera.level === 'world' ? 15 : 8;
        ctx.arc(player.x, player.y, radius, 0, Math.PI*2);
        ctx.fillStyle = "#d50000"; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2 / scale; ctx.stroke();
    },

    // 【核心修改6】修正摄像机边界限制，允许移动到 5100
    _clampCamera: function() {
        const viewSizeWorld = this.layout.size / this._getScale();
        const halfView = viewSizeWorld / 2;

        // 允许摄像机移动到地图边缘，但不能让视野超出地图太远
        // 简单策略：限制中心点在 [0, MAP_SIZE] 内
        this.camera.x = Math.max(0, Math.min(MAP_SIZE, this.camera.x));
        this.camera.y = Math.max(0, Math.min(MAP_SIZE, this.camera.y));
    },

    _updateUI: function() {
        const el = document.getElementById('map_level_indicator');
        if (el) {
            if (this.camera.level === 'world') {
                el.innerText = "世界级 (全览)";
                el.style.background = "#e65100";
            } else {
                el.innerText = "国家级 (局部)"; // 移除硬编码数字
                el.style.background = "#2e7d32";
            }
        }
    },

    _handleHover: function(e) {
        this._updateMouseCoord(e);
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (mx < this.layout.offX || mx > this.layout.offX + this.layout.size ||
            my < this.layout.offY || my > this.layout.offY + this.layout.size) {
            this.tooltip.style.display = 'none';
            return;
        }
        const worldPos = this._screenToWorld(mx, my);
        const hit = this._hitTest(worldPos.x, worldPos.y);
        if (hit) {
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = (mx + 15) + 'px';
            this.tooltip.style.top = (my + 15) + 'px';
            this.tooltip.innerHTML = `<div class="map_tooltip_title">${hit.name}</div>`;
        } else {
            this.tooltip.style.display = 'none';
        }
    },

    _updateMouseCoord: function(e) {
        const el = document.getElementById('map_mouse_coord');
        if (!el) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (mx < this.layout.offX || mx > this.layout.offX + this.layout.size ||
            my < this.layout.offY || my > this.layout.offY + this.layout.size) {
            el.innerText = "(--, --)";
            return;
        }
        const wp = this._screenToWorld(mx, my);
        const dx = Math.floor(Math.max(0, Math.min(MAP_SIZE, wp.x)));
        const dy = Math.floor(Math.max(0, Math.min(MAP_SIZE, wp.y)));
        el.innerText = `(${dx}, ${dy})`;
    },

    stopLoop: function() {
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        if(this.canvas) {
            this.canvas.onmousedown = null;
            this.canvas.onmousemove = null;
            this.canvas.onwheel = null;
        }
        window.onmouseup = null;
    }
};

window.MapView = MapView;