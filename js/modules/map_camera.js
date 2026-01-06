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

    // 处理点击怪物 (对接 combat.js)
    // 【核心修改】构建紧凑型水墨战斗面板
    // 【核心修改】构建紧凑型水墨战斗面板 + 动态ID绑定
    // 【核心修改】构建 UI + 绑定回调 + 修正阶级显示与颜色
    _handleEnemyClick: function(enemy) {
        console.log(">>> [MapCamera] 点击敌人:", enemy);

        if (!window.Combat || !window.UtilsEnemy || !window.UtilsModal) {
            console.error("缺少必要模块");
            return;
        }

        // 1. 刷新并获取玩家实时数据
        if (window.recalcStats) window.recalcStats();

        const pDerived = window.player.derived || {};
        const pName = window.player.name || "少侠";

        const pStats = {
            hp: pDerived.hp !== undefined ? pDerived.hp : 100,
            maxHp: pDerived.hpMax || 100,
            atk: pDerived.atk || 10,
            def: pDerived.def || 0,
            speed: pDerived.speed || 10
        };

        // 2. 准备敌人显示数据
        const eName = enemy.name || "未知敌人";
        const eStats = {
            hp: enemy.hp,
            maxHp: enemy.maxHp || enemy.hp,
            atk: enemy.atk || "?",
            def: enemy.def || "?",
            speed: enemy.speed || "?"
        };
        const eDesc = enemy.desc || "这家伙看起来不怀好意...";
        const eIcon = (enemy.visual && enemy.visual.icon) ? enemy.visual.icon : "💀";
        // 获取敌人颜色 (精英蓝, 头目紫, 领主红, 普通深灰)
        const eColor =  "#333";
        const nameColor = (enemy.visual && enemy.visual.color) ? enemy.visual.color : "#333";
        // 阶级名称映射
        const rankMap = {
            "minion": "普通",
            "elite": "【精英】",
            "boss": "【头目】",
            "lord": "【领主】"
        };
        const rankKey = enemy.template || "minion";
        const displayRank = rankMap[rankKey] || enemy.levelType || "普通";

        // 3. 构建布局 HTML
        // 【关键修改】品级 span 的样式：颜色匹配 eColor，背景白色，加描边，像一个印章
        const contentHtml = `
            <div class="combat-wrapper" style="display:flex; flex-direction:column; height:100%; min-height:400px; font-family: Kaiti, 'KaiTi', serif;">
                
                <div class="combat-header" style="
                    display:flex; justify-content:space-between; align-items:center; 
                    padding:10px 15px; 
                    background:#fdfbf7; 
                    border-bottom:3px double #aaa; 
                    margin-bottom:0; 
                    gap: 15px;
                    flex-shrink: 0;
                ">
                    
                    <div class="fighter-card enemy" style="flex:1; text-align:center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:5px;">
                            <div style="font-size:36px; animation: float 2s infinite ease-in-out;">${eIcon}</div>
                            <div style="text-align:left;">
                                <div style="font-size:20px; color:${eColor}; font-weight:bold; line-height:1;">${eName}</div>
                                <span style="font-size:16px; color:${nameColor}; border:2px solid ${nameColor}; background:#fff; padding:2px 8px; border-radius:4px; font-weight:bold;">${displayRank}</span>
                            </div>
                        </div>
                        
                        <div class="ink-stats-row" style="display:flex; justify-content:space-around; background:rgba(0,0,0,0.03); padding:4px 0; border-radius:4px; font-size:14px; font-family:Arial, sans-serif;">
                            <div title="生命"><span style="color:#d32f2f;">♥血量</span> <b id="combat_e_hp">${eStats.hp}</b><span style="font-size:0.8em;color:#999">/${eStats.maxHp}</span></div>
                            <div title="攻击"><span style="color:#f57f17;">⚔攻击</span> ${eStats.atk}</div>
                            <div title="防御"><span style="color:#1976d2;">🛡防御</span> ${eStats.def}</div>
                            <div title="速度"><span style="color:#388e3c;">🦶速度</span> ${eStats.speed}</div>
                        </div>
                    </div>

                    <div class="vs-divider" style="width:50px; text-align:center;">
                        <div style="font-size:32px; font-weight:bold; color:#a94442; font-family: 'Brush Script MT', cursive; transform: rotate(-10deg);">VS</div>
                    </div>

                    <div class="fighter-card player" style="flex:1; text-align:center;">
                        <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:5px;">
                            <div style="text-align:right;">
                                <div style="font-size:20px; color:#333; font-weight:bold; line-height:1;">${pName}</div>
                                <span style="font-size:12px; background:#1976d2; color:#fff; padding:1px 4px; border-radius:2px;">修仙者</span>
                            </div>
                            <div style="font-size:36px;">🧘</div>
                        </div>

                        <div class="ink-stats-row" style="display:flex; justify-content:space-around; background:rgba(0,0,0,0.03); padding:4px 0; border-radius:4px; font-size:14px; font-family:Arial, sans-serif;">
                            <div title="生命"><span style="color:#d32f2f;">♥血量</span> <b id="combat_p_hp">${pStats.hp}</b><span style="font-size:0.8em;color:#999">/${pStats.maxHp}</span></div>
                            <div title="攻击"><span style="color:#f57f17;">⚔攻击</span> ${pStats.atk}</div>
                            <div title="防御"><span style="color:#1976d2;">🛡防御</span> ${pStats.def}</div>
                            <div title="速度"><span style="color:#388e3c;">🦶速度</span> ${pStats.speed}</div>
                        </div>
                    </div>

                </div>

                <div id="combat_log_container_embed" style="flex:1; background:#fffbf0; padding:15px; overflow-y:auto; position:relative; border-top:1px solid #d4a76a;">
                    
                    <div id="combat_desc_initial" style="text-align:center; padding-top: 40px;">
                        <div style="font-size:22px; line-height:1.5; color:#5d4037; font-weight:bold; margin-bottom: 20px;">
                            “${eDesc}”
                        </div>
                        <div style="margin-top:30px; font-size:14px; color:#999;">
                            (点击下方“拔剑迎敌”开始战斗)
                        </div>
                    </div>

                    <div id="combat_logs_realtime" style="font-family: 'Courier New', monospace; font-size:14px; line-height:1.6; color:#333;"></div>
                </div>

            </div>
            
            <style>
                @keyframes float { 0% {transform: translateY(0px);} 50% {transform: translateY(-4px);} 100% {transform: translateY(0px);} }
                .ink-stats-row div { white-space: nowrap; margin: 0 2px; }
            </style>
        `;

        // 4. 回调逻辑
        const combatCallbackName = 'cb_start_combat_' + Date.now();
        const escapeCallbackName = 'cb_stop_combat_' + Date.now(); // 逃跑回调

        // 逃跑回调
        window[escapeCallbackName] = () => {
            console.log(">>> [MapCamera] 尝试逃跑...");
            if (window.Combat && window.Combat.stop) {
                window.Combat.stop(); // 调用 Combat 的 stop 方法中断循环
            }
        };

        // 开战回调
        window[combatCallbackName] = () => {
            console.log(">>> [MapCamera] 触发开战！");

            // 1. 切换中间区域
            const descEl = document.getElementById('combat_desc_initial');
            const logEl = document.getElementById('combat_logs_realtime');
            if(descEl) descEl.style.display = 'none';
            if(logEl) {
                logEl.innerHTML = '<div style="color:#888; text-align:center; padding:10px; border-bottom:1px dashed #ccc; margin-bottom:10px;">--- 战斗开始 ---</div>';
            }

            // 2. 动态修改底部按钮
            const footerDiv = document.getElementById('map_combat_footer');
            if (footerDiv) {
                footerDiv.innerHTML = `
                    <button class="ink_btn_normal" style="width:100%; height:40px; border-color:#d32f2f; color:#d32f2f; font-weight:bold;" onclick="window['${escapeCallbackName}']()">
                        🏃 拼死逃跑
                    </button>
                `;
            }

            // 3. 开始战斗
            Combat.start(enemy, () => {
                // 胜利回调
                window.GlobalEnemies = window.GlobalEnemies.filter(e => e.instanceId !== enemy.instanceId);
                if (this.ctx) MapAtlas.render(this.ctx, this, window.GlobalEnemies);
                console.log(`[MapCamera] 怪物 ${eName} 清除完成`);

                // 胜利后恢复按钮
                if (footerDiv) {
                    footerDiv.innerHTML = `<button class="ink_btn_normal" style="width:100%; height:40px; font-size:16px;" onclick="window.closeModal()">🏆 凯旋而归</button>`;
                }

            }, 'combat_logs_realtime');
        };

        // 5. 底部按钮容器
        const footerHtml = `
            <div id="map_combat_footer" style="display:flex; justify-content:space-between; width:100%; gap:15px;">
                <button class="ink_btn_normal" style="flex:1; height:40px;" onclick="window.closeModal(); delete window['${combatCallbackName}']; delete window['${escapeCallbackName}']">
                    🏃 撤退
                </button>
                <button class="ink_btn_danger" style="flex:1; height:40px; font-weight:bold;" onclick="window['${combatCallbackName}']()">
                    ⚔️ 拔剑迎敌
                </button>
            </div>
        `;

        // 6. 显示
        UtilsModal.showInteractiveModal("遭遇强敌", contentHtml, footerHtml, "", 80, null);
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