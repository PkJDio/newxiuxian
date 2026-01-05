// js/modules/map_camera.js
// 主界面地图交互模块 v9.0 (适配散落店铺的点击判定)
console.log("加载 主界面地图控制");

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

        this._initPlayerPos();
        this._bindEvents();
        this._resize();

        window.addEventListener('resize', () => this._resize());
        this._loop();
    },

    _initPlayerPos: function() {
        if (!window.player) return;
        if (player.x === undefined) {
            player.x = 1330;
            player.y = 1350;
            // 尝试定位到咸阳
            if (typeof WORLD_TOWNS !== 'undefined') {
                const t = WORLD_TOWNS.find(x => x.name === "咸阳");
                if (t) { player.x = Math.floor(t.x + t.w/2); player.y = Math.floor(t.y + t.h/2); }
            }
        }
        this.x = player.x;
        this.y = player.y;
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
            this.x = player.x;
            this.y = player.y;
        }
        if (window.MapAtlas) {
            MapAtlas.render(this.ctx, this);
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

        // 1. 城镇店铺检测
        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let i = WORLD_TOWNS.length - 1; i >= 0; i--) {
                const town = WORLD_TOWNS[i];
                const tx = (town.x - this.x) * ts + centerX;
                const ty = (town.y - this.y) * ts + centerY;
                const tw = town.w * ts;
                const th = town.h * ts;

                // 粗略判断是否在城镇范围内
                if (clickX >= tx && clickX <= tx + tw && clickY >= ty && clickY <= ty + th) {

                    // 获取散落布局
                    const shops = MapAtlas.getShopLayout(town, ts);
                    for (let shop of shops) {
                        const sx = tx + shop.x;
                        const sy = ty + shop.y;

                        // 精确判定建筑点击 (注意：shop.w, shop.h 已经是渲染尺寸，不需要乘 scale)
                        if (clickX >= sx && clickX <= sx + shop.w &&
                            clickY >= sy && clickY <= sy + shop.h) { // 考虑到屋顶，点击区域可以适当大一点

                            this._enterShop(town, shop.name);
                            hitShop = true;
                            break;
                        }
                    }
                }
                if (hitShop) break;
            }
        }

        // 2. 没点中店铺，走过去
        if (!hitShop) {
            const worldX = this.x + (clickX - centerX) / ts;
            const worldY = this.y + (clickY - centerY) / ts;
            this.moveTo(Math.floor(worldX), Math.floor(worldY));
        }
    },

    _enterShop: function(town, shopName) {
        // 先把人移过去 (可选)
        // player.x = ...

        if (window.showGeneralModal) {
            window.showGeneralModal(
                `${town.name} - ${shopName}`,
                `<div style="padding:40px; text-align:center;">
                    <div style="font-size:60px; margin-bottom:20px;">🏠</div>
                    <p style="font-size:24px; font-family:Kaiti; margin-bottom:20px;">欢迎光临 <span style="color:#d32f2f;">${shopName}</span></p>
                    <div class="ink_modal_btn_group">
                        <button class="ink_btn" onclick="closeModal()">进入</button>
                        <button class="ink_btn_normal" onclick="closeModal()">离开</button>
                    </div>
                </div>`,
                null
            );
        }
    },

    moveTo: function(tx, ty) {
        const MAX = 2700;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));

        if (tx === player.x && ty === player.y) return;

        const dist = Math.abs(player.x - tx) + Math.abs(player.y - ty);
        const speed = 20;
        const costHours = dist / speed;

        if (window.TimeSystem) TimeSystem.passTime(costHours);

        player.x = tx;
        player.y = ty;

        this._checkRegion(tx, ty);

        if(window.showToast && dist > 5) window.showToast(`行进 ${Math.floor(dist)} 里`);
        if(window.saveGame) window.saveGame();
    },

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