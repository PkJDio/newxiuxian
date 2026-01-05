// js/modules/map_camera.js
// 控制器 v4.0：调用 getLocationChain
console.log("加载 主界面地图控制");

const MapCamera = {
    // ... (保留 init, _initPlayerPos, _resize, _loop, _bindEvents, _onClick, _openShopModal, moveTo 等方法不变)
    canvas: null,
    ctx: null,
    x: 0, y: 0, scale: 1.0, width: 0, height: 0,

    init: function() {
        this.canvas = document.getElementById('big_map_canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this._initPlayerPos();
        this._bindEvents();
        this._resize();
        window.addEventListener('resize', () => this._resize());
        this._loop();
    },

    _initPlayerPos: function() {
        if (!player) return;
        if (player.x === undefined || player.y === undefined) {
            player.x = 1350; player.y = 1350;
            if (typeof WORLD_TOWNS !== 'undefined' && player.location) {
                const town = WORLD_TOWNS.find(t => t.id === player.location);
                if (town) {
                    player.x = Math.floor(town.x + town.w / 2);
                    player.y = Math.floor(town.y + town.h / 2);
                }
            }
        }
        this.x = player.x;
        this.y = player.y;
        this._checkRegion(this.x, this.y);
    },

    _resize: function() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    },

    _loop: function() {
        requestAnimationFrame(() => this._loop());
        if (!player) return;
        this.x = player.x;
        this.y = player.y;
        if (window.MapAtlas) MapAtlas.render(this.ctx, this);
        const coordEl = document.getElementById('overlay_coord');
        if (coordEl) coordEl.innerText = `(${player.x}, ${player.y})`;
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

        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let i = WORLD_TOWNS.length - 1; i >= 0; i--) {
                const town = WORLD_TOWNS[i];
                const townScreenX = (town.x - this.x) * ts + centerX;
                const townScreenY = (town.y - this.y) * ts + centerY;
                const townScreenW = town.w * ts;
                const townScreenH = town.h * ts;

                if (clickX < townScreenX || clickX > townScreenX + townScreenW ||
                    clickY < townScreenY || clickY > townScreenY + townScreenH) continue;

                const layout = MapAtlas.getShopLayout(town, ts);
                for (let item of layout) {
                    const absX = townScreenX + item.x;
                    const absY = townScreenY + item.y;
                    if (clickX >= absX && clickX <= absX + item.w &&
                        clickY >= absY && clickY <= absY + item.h) {
                        this._openShopModal(town, item.name);
                        return;
                    }
                }
            }
        }

        const worldX = this.x + (clickX - centerX) / ts;
        const worldY = this.y + (clickY - centerY) / ts;
        this.moveTo(Math.floor(worldX), Math.floor(worldY));
    },

    _openShopModal: function(town, shopName) {
        if (window.showGeneralModal) {
            window.showGeneralModal(
                `${town.name} - ${shopName}`,
                `<div style="padding:30px; text-align:center;">
                    <div style="font-size:40px; margin-bottom:10px;">🏠</div>
                    <p>欢迎光临 ${shopName}！</p>
                    <p style="color:#999; font-size:12px; margin-top:10px;">(店铺功能正在装修中...)</p>
                </div>`
            );
        }
    },

    moveTo: function(tx, ty) {
        const MAP_SIZE = (typeof window.MAP_SIZE !== 'undefined') ? window.MAP_SIZE : 2700;
        if (tx < 0 || tx > MAP_SIZE || ty < 0 || ty > MAP_SIZE) {
            if(window.showToast) window.showToast("前方是无尽虚空，无法通行。");
            return;
        }
        if (tx === player.x && ty === player.y) return;

        const dist = Math.abs(player.x - tx) + Math.abs(player.y - ty);
        const speed = (player.derived && player.derived.speed) ? player.derived.speed : 10;
        const costHours = (dist / speed);
        const costHunger = Math.floor(costHours * 0.5);
        const costFatigue = Math.floor(costHours * 1);

        if (window.TimeSystem) TimeSystem.passTime(costHours, costHunger, costFatigue);

        player.x = tx;
        player.y = ty;
        this._checkRegion(tx, ty);

        if(window.showToast) window.showToast(`跋涉 ${dist} 里，耗时 ${(costHours/2).toFixed(1)} 时辰`);
        if(window.saveGame) window.saveGame();
    },

    // 【核心修改】调用 getLocationChain
    _checkRegion: function(x, y) {
        const el = document.getElementById('overlay_terrain_info');
        if (!el) return;

        let chain = "未知领域";
        if (window.getLocationChain) {
            chain = window.getLocationChain(x, y);
        }

        el.innerHTML = `当前: <span class="text_gold">${chain}</span>`;
    }
};

window.MapCamera = MapCamera;

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => MapCamera.init(), 500);
});
window.initMap = function() { MapCamera.init(); };