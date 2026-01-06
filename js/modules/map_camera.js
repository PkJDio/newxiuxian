// js/modules/map_camera.js
// 主界面地图交互模块 v16.0 (网格扫描 + 确定性刷怪)
console.log("加载 主界面地图控制 (Grid Scan版)");

const MapCamera = {
    canvas: null,
    ctx: null,

    x: 1330,
    y: 1350,
    scale: 1.5,
    width: 0,
    height: 0,
    animationId: null,

    // 配置
    spawnConfig: {
        despawnDist: 60,      // 超过60格距离清理
        scanRadius: 4,        // 扫描玩家周围几格范围内的网格 (4*10 = 40范围)
    },

    init: function() {
        this.canvas = document.getElementById('big_map_canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        if (window.MapAtlas && window.MapAtlas.init) window.MapAtlas.init();

        this._initPlayerPos();

        // 确保击杀记录结构
        if (window.player && !window.player.defeatedEnemies) {
            window.player.defeatedEnemies = {};
        }

        // 立即刷怪
        this._updateEnemies();

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
        // 强制取整
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

        // 1. 城镇店铺检测
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

        // 2. 敌人点击检测
        if (!hitShop && window.GlobalEnemies) {
            for(let i = 0; i < window.GlobalEnemies.length; i++) {
                const enemy = window.GlobalEnemies[i];
                const ex = (enemy.x - this.x) * ts + centerX;
                const ey = (enemy.y - this.y) * ts + centerY;

                if (Math.abs(clickX - ex) < 25 && Math.abs(clickY - ey) < 25) {
                    this._handleEnemyClick(enemy);
                    return;
                }
            }
        }

        // 3. 移动
        if (!hitShop) {
            const worldX = this.x + (clickX - centerX) / ts;
            const worldY = this.y + (clickY - centerY) / ts;
            this.moveTo(Math.floor(worldX), Math.floor(worldY));
        }
    },

    _handleEnemyClick: function(enemy) {
        if (!window.UtilsEnemy) {
            console.error("缺少 UtilsEnemy 模块");
            return;
        }

        const cleanName = enemy.name || "未知敌人";
        if (confirm(`遭遇【${cleanName}】(HP:${enemy.hp})，是否将其斩杀？\n(斩杀后本月此处不再刷新)`)) {
            // 使用 enemy 对象里自带的 gx, gy 进行精确击杀记录
            UtilsEnemy.markDefeated(enemy.x, enemy.y);

            // 移除
            window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);

            if(window.showToast) window.showToast(`已斩杀 ${cleanName}！`);
            if(window.saveGame) window.saveGame();
        }
    },

    moveTo: function(tx, ty) {
        const MAX = 2700;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));

        if (tx === player.coord.x && ty === player.coord.y) return;

        const dist = Math.abs(player.coord.x - tx) + Math.abs(player.coord.y - ty);

        if (player.buffs && player.buffs['t_water']) {
            this._addSwimmingExp(dist);
        }

        let currentSpeed = player.derived.speed || 10;
        if (currentSpeed < 1) currentSpeed = 1;

        const costHours = dist / currentSpeed;

        if (window.TimeSystem) {
            TimeSystem.passTime(costHours);
        }

        player.coord.x = tx;
        player.coord.y = ty;
        this._checkRegion(tx, ty);

        this._updateTerrainBuffs(tx, ty);

        // 【核心】移动后调用刷怪
        this._updateEnemies();

        if (window.GatherSystem) GatherSystem.updateButtonState();

        if(window.saveGame) window.saveGame();
    },

    /**
     * 【核心修改】刷怪逻辑
     */
    _updateEnemies: function() {
        if (!window.GlobalEnemies) window.GlobalEnemies = [];
        if (!window.UtilsEnemy) return;

        const px = this.x;
        const py = this.y;
        const cfg = this.spawnConfig;

        // 1. 【新增】清理过期(非当前月份)的怪物
        // 这样当月份变化时，旧怪会被立刻清除，空出位置给新怪
        if (window.player && window.player.time) {
            const currentTag = `${window.player.time.year}_${window.player.time.month}`;
            const prefix = `mob_${currentTag}_`;

            window.GlobalEnemies = window.GlobalEnemies.filter(e => {
                // 如果是生成的野怪(ID以mob_开头)，必须匹配当前年月
                if (e.instanceId && e.instanceId.startsWith("mob_")) {
                    return e.instanceId.startsWith(prefix);
                }
                return true; // 其他(如剧情怪)保留
            });
        }

        // 2. 清理过远的怪
        window.GlobalEnemies = window.GlobalEnemies.filter(e => {
            const dist = Math.abs(e.x - px) + Math.abs(e.y - py);
            return dist < cfg.despawnDist;
        });

        // 3. 扫描并生成
        const pGx = Math.floor(px / 10);
        const pGy = Math.floor(py / 10);
        const r = cfg.scanRadius;

        for (let gx = pGx - r; gx <= pGx + r; gx++) {
            for (let gy = pGy - r; gy <= pGy + r; gy++) {
                // 距离优化
                if (Math.abs(gx - pGx) + Math.abs(gy - pGy) > r * 1.5) continue;

                // 检查该网格是否已有怪 (gx, gy是网格坐标)
                const alreadyExists = window.GlobalEnemies.some(e => e.gx === gx && e.gy === gy);
                if (alreadyExists) continue;

                // 尝试生成
                const newEnemy = UtilsEnemy.createRandomEnemy(gx * 10, gy * 10);
                if (newEnemy) {
                    window.GlobalEnemies.push(newEnemy);
                }
            }
        }
    },

    // --- 辅助方法保持不变 ---
    _enterShop: function(town, shopName) {
        if (window.showGeneralModal) {
            window.showGeneralModal(`${town.name} - ${shopName}`, `<div style="padding:40px; text-align:center;">🏠<p>欢迎光临 ${shopName}</p><button class="ink_btn" onclick="closeModal()">离开</button></div>`);
        }
    },

    _updateTerrainBuffs: function(x, y) {
        if (!player.buffs) player.buffs = {};
        const terrainKeys = ['t_town', 't_road', 't_grass', 't_mountain', 't_water', 't_desert'];
        let hasChange = false;
        terrainKeys.forEach(key => { if (player.buffs[key]) { delete player.buffs[key]; hasChange = true; } });
        // (省略 terrain 判断代码，保持原样)
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

window.MapCamera = MapCamera;

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => MapCamera.init(), 500);
});
window.initMap = function() { MapCamera.init(); };