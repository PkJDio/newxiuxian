// js/modules/map_camera.js
// 主界面地图交互模块 v34.4 (修复慢速无法显示的问题)

const MapCamera = {
    canvas: null,
    ctx: null,

    // MapCamera 对象的属性
    x: 2550,
    y: 2550,
    scale: 1.5,
    width: 0,
    height: 0,

    // 动画控制
    animationId: null,
    isDirty: true,
    lastRenderTime: 0,

    // 【新增】移动模式配置 (0:慢速, 1:中速, 2:快速)
    moveModes: {
        0: { name: "🚶 慢速移动", speed: 5,  hunger: 1, fatigue: 0.5, color: "#8bc34a" },  // 慢速: 消耗减半
        1: { name: "🏃 中速移动", speed: 10, hunger: 2, fatigue: 1.0, color: "#2196f3" },  // 中速: 标准
        2: { name: "🐎 快速移动", speed: 20, hunger: 4, fatigue: 2.0, color: "#ff9800" }   // 快速: 消耗加倍
    },

    init: function() {
        this.canvas = document.getElementById('big_map_canvas');
        if (!this.canvas) return;

        // 优化：关闭 alpha 通道以提升 Canvas 性能
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        if (window.MapAtlas && window.MapAtlas.init) window.MapAtlas.init();

        this._initPlayerPos();

        // 【核心】初始化左下角移动控制按钮
        this._initMoveControl();

        if (window.player && !window.player.defeatedEnemies) {
            window.player.defeatedEnemies = {};
        }

        // 调用管理器更新敌人
        if (window.MapEnemyManager) MapEnemyManager.update(this.x, this.y);

        this._bindEvents();
        this._resize();

        if (window.player) this._updateTerrainBuffs(player.coord.x, player.coord.y);
        if (window.GatherSystem) GatherSystem.updateButtonState();

        window.addEventListener('resize', () => {
            this._resize();
            this.requestRender();
        });

        // 启动渲染循环
        this._loop();
    },

    requestRender: function() {
        this.isDirty = true;
    },
    // 【新增】强制相机瞬间对齐玩家坐标（用于传送）
    snapToPlayer: function() {
        if (!window.player) return;
        // 直接同步坐标，不等待 _loop 检测
        this.x = player.coord.x;
        this.y = player.coord.y;

        // 标记需要渲染
        this.isDirty = true;

        // 立即调用一次渲染逻辑 (绕过 requestAnimationFrame 的等待)
        // 注意：这里手动调用 MapAtlas.render 确保数据层面的绘制指令立即发出
        if (window.MapAtlas && this.ctx) {
            MapAtlas.render(this.ctx, this, window.GlobalEnemies);
        }
    },

    // 【新增】初始化移动速度控制按钮
    _initMoveControl: function() {
        if (!window.player) return;

        // 1. 读取存档或初始化默认值 (1: 中速)
        // 注意：这里必须用 undefined 判断，否则 0 会被误判
        if (player.moveSpeedMode === undefined) player.moveSpeedMode = 1;

        // 2. 创建或获取按钮容器
        let btn = document.getElementById('btn_move_speed');
        if (!btn) {
            btn = document.createElement('div');
            btn.id = 'btn_move_speed';

            // 设置样式：悬浮在左下角 (红色框位置)
            btn.style.cssText = `
                position: absolute;
                bottom: 15px;
                left: 15px;
                z-index: 100;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
                font-family: "Kaiti", "KaiTi", serif;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
                user-select: none;
                transition: all 0.1s;
                text-align: center;
                min-width: 90px;
            `;

            btn.onmousedown = () => { btn.style.transform = 'scale(0.95)'; };
            btn.onmouseup = () => { btn.style.transform = 'scale(1)'; };
            btn.onclick = () => { this._toggleSpeedMode(); };

            // 插入到 canvas 的父容器中
            if (this.canvas.parentElement) {
                // 确保父容器是定位基准，否则 bottom:15px 会跑到页面最底部
                const computedStyle = window.getComputedStyle(this.canvas.parentElement);
                if (computedStyle.position === 'static') {
                    this.canvas.parentElement.style.position = 'relative';
                }
                this.canvas.parentElement.appendChild(btn);
            }
        }

        this._updateSpeedBtnUI();
    },

    // 【新增】切换速度模式 (0->1->2->0)
    _toggleSpeedMode: function() {
        if (!window.player) return;

        // 循环切换
        const current = (player.moveSpeedMode !== undefined) ? player.moveSpeedMode : 1;
        player.moveSpeedMode = (current + 1) % 3;

        this._updateSpeedBtnUI();
        if (window.saveGame) window.saveGame();
    },

    // 【核心修复】更新按钮显示 (修复了 0 被判定为 false 导致跳回中速的 Bug)
    _updateSpeedBtnUI: function() {
        const btn = document.getElementById('btn_move_speed');
        if (!btn || !window.player) return;

        // 使用 !== undefined 严格判断，确保 0 (慢速) 能被正确读取
        const modeIdx = (player.moveSpeedMode !== undefined) ? player.moveSpeedMode : 1;
        const config = this.moveModes[modeIdx] || this.moveModes[1];

        btn.innerHTML = config.name;
        btn.style.color = config.color;
        btn.style.borderColor = config.color;

        // 动态提示
        btn.title = `移动消耗：饱食度 ${config.hunger}/时，疲劳 ${config.fatigue}/时`;
    },

    _initPlayerPos: function() {
        if (!window.player) return;
        if (player.coord.x === undefined) {
            player.coord.x = 1330;
            player.coord.y = 1350;
            if (typeof WORLD_TOWNS !== 'undefined') {
                const t = WORLD_TOWNS.find(x => x.name === "咸阳");
                if (t) {
                    player.coord.x = Math.floor(t.x + t.w/2);
                    player.coord.y = Math.floor(t.y + t.h/2);
                }
            }
        }
        this.x = Math.floor(player.coord.x);
        this.y = Math.floor(player.coord.y);
        this._checkRegion(this.x, this.y);
        this.requestRender();
    },

    _resize: function() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        if (container) {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (this.canvas.width !== w || this.canvas.height !== h) {
                this.canvas.width = w;
                this.canvas.height = h;
                this.width = w;
                this.height = h;
                this.requestRender();
            }
        }
    },

    _loop: function(timestamp) {
        this.animationId = requestAnimationFrame((t) => this._loop(t));

        if (this.isDirty || (timestamp - this.lastRenderTime > 1000)) {

            if (window.player) {
                if (this.x !== player.coord.x || this.y !== player.coord.y) {
                    this.x = player.coord.x;
                    this.y = player.coord.y;
                }
            }

            if (window.MapAtlas) {
                MapAtlas.render(this.ctx, this, window.GlobalEnemies);
            }

            const coordEl = document.getElementById('overlay_coord');
            if (coordEl) coordEl.innerText = `(${Math.floor(this.x)}, ${Math.floor(this.y)})`;

            this.isDirty = false;
            this.lastRenderTime = timestamp;

            this._checkMonsterTutorial();
        }
    },

    _bindEvents: function() {
        this.canvas.addEventListener('mousedown', (e) => this._onClick(e));
    },

    _onClick: function(e) {
        if (!player || !window.MapAtlas) return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const ts = MapAtlas.tileSize * this.scale;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        let hitShop = false;

        // 1. 检查城镇/商店点击
        if (typeof WORLD_TOWNS !== 'undefined' && window.TownShops) {
            for (let i = WORLD_TOWNS.length - 1; i >= 0; i--) {
                const town = WORLD_TOWNS[i];
                const tx = (town.x - this.x) * ts + centerX;
                const ty = (town.y - this.y) * ts + centerY;
                const tw = town.w * ts;
                const th = town.h * ts;

                if (clickX >= tx && clickX <= tx + tw && clickY >= ty && clickY <= ty + th) {
                    const handled = TownShops.handleClick(clickX, clickY, town, this, ts, centerX, centerY);
                    if (handled) {
                        hitShop = true;
                        break;
                    }
                }
            }
        }

        if (hitShop) return;

        // 2. 检查敌人点击
        if (window.MapEnemyManager && window.UICombatModal) {
            const clickedEnemy = MapEnemyManager.checkClick(
                clickX, clickY,
                this.x, this.y,
                MapAtlas.tileSize, this.scale,
                this.width, this.height
            );

            if (clickedEnemy) {
                UICombatModal.show(clickedEnemy);
                return;
            }
        }

        // 3. 移动逻辑
        const worldX = this.x + (clickX - centerX) / ts;
        const worldY = this.y + (clickY - centerY) / ts;
        this.moveTo(Math.floor(worldX), Math.floor(worldY));
    },

    // 【核心修改】移动逻辑：根据当前模式计算时间与消耗
    moveTo: function(tx, ty) {
        const MAX = 5100;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));

        if (tx === player.coord.x && ty === player.coord.y) return;

        const dist = Math.abs(player.coord.x - tx) + Math.abs(player.coord.y - ty);
        if (player.buffs && player.buffs['t_water']) this._addSwimmingExp(dist);

        // 1. 获取当前移动模式 (严格判断)
        const modeIdx = (player.moveSpeedMode !== undefined) ? player.moveSpeedMode : 1;
        const modeConfig = this.moveModes[modeIdx] || this.moveModes[1];

        // 2. 计算消耗时间 (距离 / 模式速度)
        const currentSpeed = modeConfig.speed;
        const costHours = dist / currentSpeed;

        // 3. 调用 TimeSystem，传入自定义消耗速率
        if (window.TimeSystem) {
            TimeSystem.passTime(costHours, 0, 0, {
                hunger: modeConfig.hunger,
                fatigue: modeConfig.fatigue
            });
        }

        // 更新坐标
        player.coord.x = tx;
        player.coord.y = ty;

        this._updateRegionInfo(tx, ty);
        this._updatePlayerLocation(tx, ty);
        this._checkRegion(tx, ty);
        this._updateTerrainBuffs(tx, ty);

        if (window.MapEnemyManager) MapEnemyManager.update(this.x, this.y);

        if (window.GatherSystem) GatherSystem.updateButtonState();
        if(window.saveGame) window.saveGame();

        this.requestRender();
    },

    _updateRegionInfo: function(x, y) {
        if (typeof REGION_LAYOUT === 'undefined') return;
        const region = REGION_LAYOUT.find(r =>
            x >= r.x[0] && x < r.x[1] &&
            y >= r.y[0] && y < r.y[1]
        );
        if (region) {
            player.coord.region = region.id;
        } else {
            player.coord.region = "unknown";
        }
    },

    _updatePlayerLocation: function(x, y) {
        if (!window.player) return;
        let locId = "";
        if (typeof WORLD_TOWNS !== 'undefined') {
            const town = WORLD_TOWNS.find(t =>
                x >= t.x && x < t.x + t.w &&
                y >= t.y && y < t.y + t.h
            );
            if (town) locId = town.id;
        }
        if (player.location !== locId) {
            player.location = locId;
            if (window.updateMarketButtonState) window.updateMarketButtonState();
        }
    },

    updateSidebar: function() {
        if (window.UICombatModal) UICombatModal.updateSidebar();
    },

    renderMap: function() {
        this._checkMonsterTutorial();
        this.requestRender();
    },

    _checkMonsterTutorial: function() {
        if (localStorage.getItem('xiuxian_tut_monster_ignore') === 'true') return;
        const now = Date.now();
        if (now - (this._lastTutorialCheck || 0) < 1000) return;
        this._lastTutorialCheck = now;

        if (!window.MapEnemyManager || !MapEnemyManager.enemies) return;

        const ts = (window.MapAtlas ? MapAtlas.tileSize : 32);
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const margin = 60;

        for (let key in MapEnemyManager.enemies) {
            const enemy = MapEnemyManager.enemies[key];
            if (enemy.isDead) continue;

            const screenX = (enemy.x - this.x) * ts * this.scale + centerX;
            const screenY = (enemy.y - this.y) * ts * this.scale + centerY;

            if (screenX > margin && screenX < this.width - margin &&
                screenY > margin && screenY < this.height - margin) {

                console.log(">>> [MapCamera] 发现怪物，触发新手引导！");
                const iconSize = ts * this.scale;
                const canvasRect = this.canvas.getBoundingClientRect();

                const virtualRect = {
                    left: canvasRect.left + screenX - iconSize/2,
                    top: canvasRect.top + screenY - iconSize/2,
                    width: iconSize,
                    height: iconSize
                };

                if (window.UITutorial) {
                    UITutorial.start(false, 'monster', virtualRect);
                }
                return;
            }
        }
    },
    _updateTerrainBuffs: function(x, y) {
        if (!player.buffs) player.buffs = {};
        const terrainKeys = ['t_town', 't_road', 't_grass', 't_mountain', 't_water', 't_desert'];
        let hasChange = false;
        terrainKeys.forEach(key => { if (player.buffs[key]) { delete player.buffs[key]; hasChange = true; } });
        if (hasChange && window.recalcStats) window.recalcStats();
    },

    _addSwimmingExp: function(amount) {
        if (!amount) return;
        if (!player.lifeSkills) player.lifeSkills = {};
        if (!player.lifeSkills.swimming) player.lifeSkills.swimming = { exp: 0 };
        player.lifeSkills.swimming.exp += Math.floor(amount);
    },

    _checkRegion: function(x, y) {
        const el = document.getElementById('overlay_terrain_info');
        if (!el) return;
        let chain = "未知领域";
        if (window.getLocationChain) chain = window.getLocationChain(x, y);
        el.innerHTML = `当前: <span class="text_gold">${chain}</span>`;
    }
};

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => MapCamera.init(), 500); });
window.initMap = function() { MapCamera.init(); };
window.MapCamera = MapCamera;