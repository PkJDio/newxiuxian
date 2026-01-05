// js/modules/map_camera.js
// 主界面地图交互模块 v10.1 (优化游泳境界判断逻辑)
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

        // 初始化素材 (如果有)
        if (window.MapAtlas && window.MapAtlas.init) {
            window.MapAtlas.init();
        }

        this._initPlayerPos();
        this._bindEvents();
        this._resize();

        // 游戏加载时，立即计算一次当前脚下的地形BUFF
        if (window.player) {
            this._updateTerrainBuffs(player.x, player.y);
        }

        window.addEventListener('resize', () => this._resize());
        this._loop();
    },

    _initPlayerPos: function() {
        if (!window.player) return;
        if (player.x === undefined) {
            player.x = 1330;
            player.y = 1350;
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

        // 2. 没点中店铺，走过去
        if (!hitShop) {
            const worldX = this.x + (clickX - centerX) / ts;
            const worldY = this.y + (clickY - centerY) / ts;
            this.moveTo(Math.floor(worldX), Math.floor(worldY));
        }
    },

    _enterShop: function(town, shopName) {
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

    // ==========================================
    // 移动逻辑：地形BUFF与游泳熟练度
    // ==========================================
    moveTo: function(tx, ty) {
        const MAX = 2700;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));

        if (tx === player.x && ty === player.y) return;

        // 1. 计算距离
        const dist = Math.abs(player.x - tx) + Math.abs(player.y - ty);

        // 2. 游泳熟练度逻辑
        // 如果当前脚下有"水行"buff，说明是从水里开始移动的，加熟练度
        if (player.buffs && player.buffs['t_water']) {
            this._addSwimmingExp(dist);
        }

        // 3. 计算速度
        let currentSpeed = player.derived.speed || 10;
        if (currentSpeed < 1) currentSpeed = 1;

        // 检查疲劳/饥饿状态用于提示
        let isTired = false;
        if (player.buffs && (player.buffs['debuff_fatigue'] || player.buffs['debuff_hunger'])) {
            isTired = true;
        }

        // 4. 计算耗时
        const costHours = dist / currentSpeed;

        // 5. 时间流逝
        if (window.TimeSystem) {
            TimeSystem.passTime(costHours);
        }

        // 6. 执行移动
        player.x = tx;
        player.y = ty;
        this._checkRegion(tx, ty);

        // 7. 移动到达后，立即更新脚下的地形BUFF
        this._updateTerrainBuffs(tx, ty);

        // 提示信息
        let toastMsg = `行进 ${Math.floor(dist)} 里`;
        if (isTired) toastMsg += ` (身体不适)`;
        if(window.showToast && dist > 5) window.showToast(toastMsg);

        if(window.saveGame) window.saveGame();
    },

    // 更新地形状态 Buff
    _updateTerrainBuffs: function(x, y) {
        if (!player.buffs) player.buffs = {};

        // 1. 先清除所有旧的地形 BUFF
        const terrainKeys = ['t_town', 't_road', 't_grass', 't_mountain', 't_water', 't_desert'];
        let hasChange = false;
        terrainKeys.forEach(key => {
            if (player.buffs[key]) {
                delete player.buffs[key];
                hasChange = true;
            }
        });

        let buff = null;

        // 2. 判断城镇 (优先级最高)
        if (typeof WORLD_TOWNS !== 'undefined') {
            const t = WORLD_TOWNS.find(town => x >= town.x && x < town.x + town.w && y >= town.y && y < town.y + town.h);
            if (t) {
                let v = 5; let n = "村落";
                if (t.level === 'city') { v = 15; n = "城池"; }
                else if (t.level === 'town') { v = 10; n = "市镇"; }
                buff = { id: 't_town', name: `地形-${n}`, attr: 'speed', val: v, days: 9999, isTerrain: true, color: '#2196f3' };
            }
        }

        // 3. 判断地形区域
        if (!buff && typeof TERRAIN_ZONES !== 'undefined') {
            const hits = TERRAIN_ZONES.filter(z => x >= z.x[0] && x < z.x[1] && y >= z.y[0] && y < z.y[1]);
            const hasType = (t) => hits.find(z => z.type === t);

            if (hasType('road')) {
                buff = { id: 't_road', name: '地形-驰道', attr: 'speed', val: 10, days: 9999, isTerrain: true, color: '#2196f3' };

            } else if (hasType('river') || hasType('ocean')) {
                // 【核心修改】水里：根据熟练度(Exp)判断境界
                if (!player.lifeSkills) player.lifeSkills = {};
                if (!player.lifeSkills.swimming) player.lifeSkills.swimming = { exp: 0 };

                const exp = player.lifeSkills.swimming.exp || 0;
                let spd = -10;
                let txt = "未入门";
                let color = '#d32f2f'; // 默认红色(减益)

                // 境界判断阈值
                if (exp >= window.SKILL_CONFIG.levels[3]) {
                    spd = 10; txt = "大成"; color = '#4caf50'; // 绿色(增益)
                } else if (exp >= window.SKILL_CONFIG.levels[2]) {
                    spd = 5; txt = "进阶"; color = '#4caf50';
                } else if (exp >= window.SKILL_CONFIG.levels[1]) {
                    spd = -5; txt = "入门"; color = '#ff9800'; // 橙色(减益减少)
                }

                buff = { id: 't_water', name: `水行-${txt}`, attr: 'speed', val: spd, days: 9999, isTerrain: true, color: color };

            } else if (hasType('mountain') ) {
                buff = { id: 't_mountain', name: '地形-山路', attr: 'speed', val: -10, days: 9999, isTerrain: true, color: '#d32f2f' };

            } else if (hasType('desert')) {
                buff = { id: 't_desert', name: '地形-沙漠', attr: 'speed', val: -10, days: 9999, isTerrain: true, color: '#ad996d' };

            } else if (hasType('grass')) {
                buff = { id: 't_grass', name: '地形-荒草', attr: 'speed', val: -3, days: 9999, isTerrain: true, color: '#ff9800' };
            }
        }

        // 4. 应用新 BUFF
        if (buff) {
            player.buffs[buff.id] = buff;
            hasChange = true;
        }

        // 5. 刷新属性
        if (hasChange && window.recalcStats) window.recalcStats();
    },

    // 【核心修改】增加游泳熟练度 (累计制)
    _addSwimmingExp: function(amount) {
        if (!amount) return;
        if (!player.lifeSkills) player.lifeSkills = {};
        if (!player.lifeSkills.swimming) player.lifeSkills.swimming = { exp: 0 };

        const skill = player.lifeSkills.swimming;
        const oldExp = skill.exp || 0;

        // 增加经验 (不扣除，只累积)
        skill.exp = oldExp + Math.floor(amount);
        const currentExp = skill.exp;

        // 检查是否刚刚突破境界 (用于弹出提示)
        const checkLevelUp = (threshold, name) => {
            if (oldExp < threshold && currentExp >= threshold) {
                if (window.showToast) window.showToast(`[游泳] 境界提升至【${name}】！水行速度提升。`);
                // 境界提升后，立即刷新一下 Buff 状态
                this._updateTerrainBuffs(player.x, player.y);
            }
        };

        checkLevelUp(100, "入门");
        checkLevelUp(500, "进阶");
        checkLevelUp(2000, "大成");
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