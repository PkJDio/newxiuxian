// js/modules/map_camera.js
// 主界面地图交互模块 v34.2 (性能优化：按需渲染)
//console.log("加载 主界面地图控制 (Performance Optimized)");

const MapCamera = {
    canvas: null,
    ctx: null,

    x: 1330,
    y: 1350,
    scale: 1.5,
    width: 0,
    height: 0,

    // 动画控制
    animationId: null,
    isDirty: true, // 标记是否需要重绘 (初始化为 true)
    lastRenderTime: 0,

    init: function() {
        this.canvas = document.getElementById('big_map_canvas');
        if (!this.canvas) return;

        // 优化：关闭 alpha 通道以提升 Canvas 性能（如果不需要透明背景）
        // 你的 MapAtlas 会绘制全屏背景色，所以这里可以关闭 alpha
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        if (window.MapAtlas && window.MapAtlas.init) window.MapAtlas.init();

        this._initPlayerPos();

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
            this.requestRender(); // 窗口变化时请求重绘
        });

        // 启动渲染循环
        this._loop();
    },

    /**
     * 请求执行一次渲染
     * 在移动、战斗结束、打开界面关闭后调用
     */
    requestRender: function() {
        this.isDirty = true;
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
            // 只有尺寸改变才重置 canvas 尺寸，避免清空画布
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

        // 只有当标记为 dirty 时才执行繁重的绘制
        // 或者每隔一定时间强制刷新一次（比如 1秒）以更新时间/光照变化
        // 这里添加一个简单的节流，防止某些情况下的高频刷新
        if (this.isDirty || (timestamp - this.lastRenderTime > 1000)) {

            if (window.player) {
                // 只有坐标变了才算真的变了，虽然 moveTo 已经设了 dirty，这里双重保险
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

    moveTo: function(tx, ty) {
        const MAX = 2700;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));

        // 即使坐标没变，如果时间流逝了（比如休息），可能光照会变，所以最好还是刷新
        // 但为了性能，完全没变就不处理
        if (tx === player.coord.x && ty === player.coord.y) return;

        const dist = Math.abs(player.coord.x - tx) + Math.abs(player.coord.y - ty);
        if (player.buffs && player.buffs['t_water']) this._addSwimmingExp(dist);

        let currentSpeed = player.derived.speed || 10;
        if (currentSpeed < 1) currentSpeed = 1;
        const costHours = dist / currentSpeed;

        if (window.TimeSystem) TimeSystem.passTime(costHours);

        player.coord.x = tx;
        player.coord.y = ty;

        this._checkRegion(tx, ty);
        this._updateTerrainBuffs(tx, ty);

        if (window.MapEnemyManager) MapEnemyManager.update(this.x, this.y);

        if (window.GatherSystem) GatherSystem.updateButtonState();
        if(window.saveGame) window.saveGame();

        this.requestRender(); // 核心：移动后请求重绘
    },

    updateSidebar: function() {
        if (window.UICombatModal) UICombatModal.updateSidebar();
    },

    // 供外部调用刷新地图渲染 (强制刷新)
    renderMap: function() {
        this.requestRender();
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