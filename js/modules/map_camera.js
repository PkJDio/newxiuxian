// js/modules/map_camera.js
// 主界面地图交互模块 v34.0 (重构：逻辑抽离)
console.log("加载 主界面地图控制 (Refactored Core)");

const MapCamera = {
    canvas: null,
    ctx: null,

    x: 1330,
    y: 1350,
    scale: 1.5,
    width: 0,
    height: 0,
    animationId: null,

    init: function() {
        this.canvas = document.getElementById('big_map_canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

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

        window.addEventListener('resize', () => this._resize());
        this._loop();
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
    },

    _resize: function() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
    },

    _loop: function() {
        if (window.player) {
            this.x = player.coord.x;
            this.y = player.coord.y;
        }
        if (window.MapAtlas) {
            MapAtlas.render(this.ctx, this, window.GlobalEnemies);
        }
        const coordEl = document.getElementById('overlay_coord');
        if (coordEl) coordEl.innerText = `(${Math.floor(this.x)}, ${Math.floor(this.y)})`;
        this.animationId = requestAnimationFrame(() => this._loop());
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
        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let i = WORLD_TOWNS.length - 1; i >= 0; i--) {
                const town = WORLD_TOWNS[i];
                const tx = (town.x - this.x) * ts + centerX;
                const ty = (town.y - this.y) * ts + centerY;
                const tw = town.w * ts;
                const th = town.h * ts;

                if (clickX >= tx && clickX <= tx + tw && clickY >= ty && clickY <= ty + th) {
                    const shops = MapAtlas.getShopLayout(town, ts);
                    for (let shop of shops) {
                        const sx = tx + shop.x;
                        const sy = ty + shop.y;
                        if (clickX >= sx && clickX <= sx + shop.w &&
                            clickY >= sy && clickY <= sy + shop.h) {
                            this._enterShop(town, shop.name);
                            hitShop = true;
                            break;
                        }
                    }
                }
                if (hitShop) break;
            }
        }

        // 2. 检查敌人点击 (调用 MapEnemyManager)
        if (!hitShop && window.MapEnemyManager && window.UICombatModal) {
            const clickedEnemy = MapEnemyManager.checkClick(
                clickX, clickY,
                this.x, this.y,
                MapAtlas.tileSize, this.scale,
                this.width, this.height
            );

            if (clickedEnemy) {
                // 调用 UI 模块显示战斗弹窗
                UICombatModal.show(clickedEnemy);
                return;
            }
        }

        // 3. 移动逻辑
        if (!hitShop) {
            const worldX = this.x + (clickX - centerX) / ts;
            const worldY = this.y + (clickY - centerY) / ts;
            this.moveTo(Math.floor(worldX), Math.floor(worldY));
        }
    },

    moveTo: function(tx, ty) {
        const MAX = 2700;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));
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

        // 调用管理器更新敌人
        if (window.MapEnemyManager) MapEnemyManager.update(this.x, this.y);

        if (window.GatherSystem) GatherSystem.updateButtonState();
        if(window.saveGame) window.saveGame();
    },

    // 辅助方法：为了兼容 Combat.js 可能会调用 MapCamera.updateSidebar
    // 我们做一个代理，指向新的 UI 模块
    updateSidebar: function() {
        if (window.UICombatModal) UICombatModal.updateSidebar();
    },

    // 供外部调用刷新地图渲染
    renderMap: function() {
        if (this.ctx && window.MapAtlas) {
            MapAtlas.render(this.ctx, this, window.GlobalEnemies);
        }
    },

    _enterShop: function(town, shopName) { if (window.showGeneralModal) window.showGeneralModal(`${town.name} - ${shopName}`, `<div style="padding:40px; text-align:center;">🏠<p>欢迎光临 ${shopName}</p><button class="ink_btn" onclick="closeModal()">离开</button></div>`); },
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