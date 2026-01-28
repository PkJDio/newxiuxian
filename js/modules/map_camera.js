// js/modules/map_camera.js
// 主界面地图交互模块 v36.0 (修复NPC瞬移，实现平滑移动)

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
    lastTickTime: 0, // 上一帧的时间戳，用于计算 deltaTime

    // 移动模式配置 (0:慢速, 1:中速, 2:快速)
    moveModes: {
        0: { name: "🚶 慢速移动", speed: 5,  hunger: 1, fatigue: 0.5, color: "#8bc34a" },
        1: { name: "🏃 中速移动", speed: 10, hunger: 2, fatigue: 1.0, color: "#2196f3" },
        2: { name: "🐎 快速移动", speed: 20, hunger: 4, fatigue: 2.0, color: "#ff9800" }
    },

    init: function() {
        this.canvas = document.getElementById('big_map_canvas');
        if (!this.canvas) return;

        // 优化：关闭 alpha 通道以提升 Canvas 性能
        this.ctx = this.canvas.getContext('2d', { alpha: false });

        if (window.MapAtlas && window.MapAtlas.init) window.MapAtlas.init();

        this._initPlayerPos();
        this._initMoveControl();

        if (window.player && !window.player.defeatedEnemies) {
            window.player.defeatedEnemies = {};
        }

        if (window.MapEnemyManager) MapEnemyManager.update(this.x, this.y);

        this._bindEvents();

        this._ensureNPCsInitialized();

        this._resize();

        if (window.player) this._updateTerrainBuffs(player.coord.x, player.coord.y);
        if (window.GatherSystem) GatherSystem.updateButtonState();

        window.addEventListener('resize', () => {
            this._resize();
            this.requestRender();
        });

        // 启动渲染循环
        this.lastTickTime = performance.now();
        this._loop(this.lastTickTime);
    },
    // 【新增】确保 NPC 已初始化位置
    _ensureNPCsInitialized: function() {
        if (!window.DATA_NPC || !window.player) return;

        console.log("[MapCamera] 检查 NPC 初始化状态...");
        for (let npcId in window.DATA_NPC) {
            const npc = window.DATA_NPC[npcId];

            // 如果 NPC 没有位置信息，说明是刚加载/刷新页面，需要手动触发一次刷新
            if (!npc.location) {
                console.log(`[MapCamera] NPC [${npc.name}] 未初始化位置，执行首次刷新...`);
                if (npc.behavior && typeof npc.behavior.onWeekChange === 'function') {
                    // 传入当前玩家对象，让 NPC 计算位置和库存
                    npc.behavior.onWeekChange(npc, window.player);

                    // 强制给一个初始 worldX/Y，防止第一次绘制时瞬移
                    if (window.WORLD_TOWNS) {
                        const town = window.WORLD_TOWNS.find(t => t.id === npc.location);
                        if (town) {
                            npc.worldX = town.x + town.w / 2;
                            npc.worldY = town.y + town.h / 2;
                            npc.targetX = npc.worldX;
                            npc.targetY = npc.worldY;
                        }
                    }
                }
            }
        }
        this.isDirty = true;
    },

    requestRender: function() {
        this.isDirty = true;
    },

    snapToPlayer: function() {
        if (!window.player) return;
        this.x = player.coord.x;
        this.y = player.coord.y;
        this.isDirty = true;
        if (window.MapAtlas && this.ctx) {
            MapAtlas.render(this.ctx, this, window.GlobalEnemies);
        }
    },

    // --- 核心循环 ---
    _loop: function(timestamp) {
        this.animationId = requestAnimationFrame((t) => this._loop(t));

        // 计算两帧之间的时间差 (秒)
        const dt = (timestamp - this.lastTickTime) / 1000;
        this.lastTickTime = timestamp;

        // 1. 【核心】NPC 逻辑循环
        // 包含两部分：AI决策(低频) 和 平滑移动(高频)
        this._updateNPCLoop(timestamp, dt);

        // 2. 渲染判定
        if (this.isDirty || (timestamp - this.lastRenderTime > 1000)) {

            if (window.player) {
                if (this.x !== player.coord.x || this.y !== player.coord.y) {
                    this.x = player.coord.x;
                    this.y = player.coord.y;
                }
            }

            // 绘制地图底层
            if (window.MapAtlas) {
                MapAtlas.render(this.ctx, this, window.GlobalEnemies);
            }

            // 绘制 NPC (使用平滑插值后的坐标)
            this._drawNPCs();

            // 绘制凡尘任务悬浮窗
            this._drawMortalTask();

            // 更新左下角坐标显示
            const coordEl = document.getElementById('overlay_coord');
            if (coordEl) coordEl.innerText = `(${Math.floor(this.x)}, ${Math.floor(this.y)})`;

            this.isDirty = false;
            this.lastRenderTime = timestamp;

            this._checkMonsterTutorial();
        }
    },

    // =========================================================================
    // 【核心重构】NPC 逻辑总入口
    // =========================================================================
    _updateNPCLoop: function(timestamp, dt) {
        // 如果有弹窗打开，NPC 暂停思考和移动 (定格)
        if (window.UtilsModal && window.UtilsModal._modalStack.length > 0) return;

        // 1. 处理 AI 决策 (每隔几秒决定一个新的目标点)
        this._processNPCDecision(timestamp);

        // 2. 处理平滑移动 (每一帧都让 current 向 target 靠近)
        this._processNPCMovement(dt);
    },

    // A. 决策逻辑：决定“去哪里”
    _processNPCDecision: function(timestamp) {
        if (!window.DATA_NPC || !window.WORLD_TOWNS) return;

        for (let npcId in window.DATA_NPC) {
            const npc = window.DATA_NPC[npcId];
            if (!npc.location) continue;

            const town = window.WORLD_TOWNS.find(t => t.id === npc.location);
            if (!town) continue;

            // 初始化：如果NPC还没坐标，先给个初始位置
            if (typeof npc.worldX === 'undefined') {
                const padding = 10;
                npc.worldX = town.x + padding + Math.random() * (town.w - padding * 2);
                npc.worldY = town.y + padding + Math.random() * (town.h - padding * 2);

                // 初始化目标点等于当前点 (静止)
                npc.targetX = npc.worldX;
                npc.targetY = npc.worldY;
                npc._lastDecisionTime = timestamp;
                this.isDirty = true;
                continue;
            }

            // AI 计时器 check
            if (!npc._lastDecisionTime) npc._lastDecisionTime = timestamp;

            // 设定间隔：3秒 + 随机波动 (防止所有NPC同时起步)
            const interval = 3000 + (npc._randomOffset || 0);

            if (timestamp - npc._lastDecisionTime > interval) {
                // --- 做出决策 ---

                // 1. 随机决定移动距离 (比如 1个单位 = 32px，或者小一点 20-50px)
                // 您之前的需求是 "移动1距离"，假设大概是 30-60 像素
                const moveDist = 30 + Math.random() * 30;
                const angle = Math.random() * Math.PI * 2; // 随机角度

                let destX = npc.worldX + Math.cos(angle) * moveDist;
                let destY = npc.worldY + Math.sin(angle) * moveDist;

                // 2. 边界限制 (不能走出城镇)
                const padding = 10;
                const minX = town.x + padding;
                const maxX = town.x + town.w - padding;
                const minY = town.y + padding;
                const maxY = town.y + town.h - padding;

                // 如果目标点出界了，就直接把目标点设为边界 (或者撞墙停下)
                if (destX < minX) destX = minX;
                if (destX > maxX) destX = maxX;
                if (destY < minY) destY = minY;
                if (destY > maxY) destY = maxY;

                // 3. 设定目标
                npc.targetX = destX;
                npc.targetY = destY;

                // 重置计时器
                npc._lastDecisionTime = timestamp;
                npc._randomOffset = Math.random() * 1000; // 下次思考时间随机波动
            }
        }
    },

    // B. 运动逻辑：负责“走过去”
    _processNPCMovement: function(dt) {
        if (!window.DATA_NPC) return;

        // 设定 NPC 移动速度 (像素/秒)
        // 20px/s 比较像散步，慢悠悠的
        const NPC_SPEED = 1;

        for (let npcId in window.DATA_NPC) {
            const npc = window.DATA_NPC[npcId];

            // 如果没有目标，或者已经到达目标，跳过
            if (typeof npc.targetX === 'undefined') continue;

            // 计算当前点到目标点的距离
            const dx = npc.targetX - npc.worldX;
            const dy = npc.targetY - npc.worldY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // 如果距离非常小，就直接视为到达
            if (dist < 1) {
                npc.worldX = npc.targetX;
                npc.worldY = npc.targetY;
                continue;
            }

            // 这一帧应该移动的距离 (速度 * 时间)
            const moveStep = NPC_SPEED * dt;

            if (moveStep >= dist) {
                // 一步就能走到，直接到位
                npc.worldX = npc.targetX;
                npc.worldY = npc.targetY;
            } else {
                // 走一步
                const ratio = moveStep / dist;
                npc.worldX += dx * ratio;
                npc.worldY += dy * ratio;
            }

            // 只要有 NPC 在动，就需要重绘地图
            this.isDirty = true;
        }
    },

    // =========================================================================
    // 绘制 NPC
    // =========================================================================
    _drawNPCs: function() {
        if (!window.DATA_NPC || !window.WORLD_TOWNS) return;

        const ctx = this.ctx;
        const tileSize = (window.MapAtlas ? MapAtlas.tileSize : 32);
        const ts = tileSize * this.scale;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // 【新增】检查是否暂停 (有弹窗时视为暂停)
        const isPaused = window.UtilsModal && window.UtilsModal._modalStack.length > 0;

        for (let npcId in window.DATA_NPC) {
            const npc = window.DATA_NPC[npcId];
            if (!npc.location) continue;

            const town = window.WORLD_TOWNS.find(t => t.id === npc.location);
            if (!town) continue;

            // 获取动态坐标
            let worldX = npc.worldX;
            let worldY = npc.worldY;
            if (typeof worldX === 'undefined') {
                worldX = town.x + town.w / 2;
                worldY = town.y + town.h / 2;
            }

            // 转换为屏幕坐标
            const screenX = (worldX - this.x) * ts + centerX;
            const screenY = (worldY - this.y) * ts + centerY;

            // 视锥剔除
            if (screenX < -50 || screenX > this.width + 50 || screenY < -50 || screenY > this.height + 50) continue;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 【修改点】上下浮动动画控制
            // 如果暂停了，floatOffset 设为 0 (静止)，否则继续计算正弦波
            let floatOffset = 0;
            if (!isPaused) {
                floatOffset = Math.sin(Date.now() / 500) * 3;
            }

            // 1. 头像
            ctx.font = `${32 * this.scale}px Arial`;
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 5;
            ctx.fillText(npc.avatar || "👤", screenX, screenY + floatOffset);

            // 2. 名字背景
            ctx.shadowBlur = 0;
            const name = npc.name;
            ctx.font = `bold ${14 * this.scale}px "KaiTi", sans-serif`;
            const textW = ctx.measureText(name).width;
            const padding = 6 * this.scale;
            const bgH = 20 * this.scale;
            const nameY = screenY + (25 * this.scale) + floatOffset;

            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(screenX - textW/2 - padding/2, nameY - bgH/2, textW + padding, bgH, 4);
            else ctx.rect(screenX - textW/2 - padding/2, nameY - bgH/2, textW + padding, bgH);
            ctx.fill();

            // 3. 名字文字
            ctx.fillStyle = npc.color || "#fff";
            ctx.fillText(name, screenX, nameY);

            ctx.restore();
        }
    },

    // --- 点击事件 (重要) ---
    _bindEvents: function() {
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this._onClick(e));
        }
    },

    _onClick: function(e) {
        if (!player || !window.MapAtlas) return;

        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const ts = MapAtlas.tileSize * this.scale;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // 1. 检查 NPC 点击
        if (window.DATA_NPC && window.WORLD_TOWNS) {
            for (let npcId in window.DATA_NPC) {
                const npc = window.DATA_NPC[npcId];
                if (!npc.location) continue;

                // 使用动态坐标进行点击判定
                let wx = npc.worldX;
                let wy = npc.worldY;
                // 兼容兜底
                if (typeof wx === 'undefined') {
                    const town = window.WORLD_TOWNS.find(t => t.id === npc.location);
                    if (town) { wx = town.x + town.w/2; wy = town.y + town.h/2; }
                    else continue;
                }

                const screenX = (wx - this.x) * ts + centerX;
                const screenY = (wy - this.y) * ts + centerY;

                const hitDist = 40 * this.scale;

                if (Math.abs(clickX - screenX) < hitDist && Math.abs(clickY - screenY) < hitDist) {
                    // 点击后，让 NPC 立即停止移动 (设目标为当前位置)
                    npc.targetX = npc.worldX;
                    npc.targetY = npc.worldY;

                    if (npc.behavior && npc.behavior.interact) {
                        npc.behavior.interact(npc, player);
                    } else {
                        if(window.showToast) window.showToast(`${npc.name} 似乎不想理你。`);
                    }
                    return;
                }
            }
        }

        // 2. 检查城镇点击
        let hitShop = false;
        if (typeof WORLD_TOWNS !== 'undefined' && window.TownShops) {
            for (let i = WORLD_TOWNS.length - 1; i >= 0; i--) {
                const town = WORLD_TOWNS[i];
                const tx = (town.x - this.x) * ts + centerX;
                const ty = (town.y - this.y) * ts + centerY;
                const tw = town.w * ts;
                const th = town.h * ts;

                if (clickX >= tx && clickX <= tx + tw && clickY >= ty && clickY <= ty + th) {
                    const handled = TownShops.handleClick(clickX, clickY, town, this, ts, centerX, centerY);
                    if (handled) { hitShop = true; break; }
                }
            }
        }
        if (hitShop) return;

        // 3. 检查敌人点击
        if (window.MapEnemyManager && window.UICombatModal) {
            const clickedEnemy = MapEnemyManager.checkClick(
                clickX, clickY, this.x, this.y, MapAtlas.tileSize, this.scale, this.width, this.height
            );
            if (clickedEnemy) {
                UICombatModal.show(clickedEnemy);
                return;
            }
        }

        // 4. 玩家移动
        const worldX = this.x + (clickX - centerX) / ts;
        const worldY = this.y + (clickY - centerY) / ts;
        this.moveTo(Math.floor(worldX), Math.floor(worldY));
    },

    // --- 其他模块 (UI, 移动控制等) ---
    _initMoveControl: function() {
        if (!window.player) return;
        if (player.moveSpeedMode === undefined) player.moveSpeedMode = 1;

        let btn = document.getElementById('btn_move_speed');
        if (!btn) {
            btn = document.createElement('div');
            btn.id = 'btn_move_speed';
            btn.style.cssText = `position: absolute; bottom: 15px; left: 15px; z-index: 100; background: rgba(255, 255, 255, 0.95); border: 1px solid #ccc; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-family: "Kaiti", "KaiTi", serif; font-weight: bold; font-size: 18px; box-shadow: 2px 2px 5px rgba(0,0,0,0.3); user-select: none; transition: all 0.1s; text-align: center; min-width: 90px;`;
            btn.onmousedown = () => { btn.style.transform = 'scale(0.95)'; };
            btn.onmouseup = () => { btn.style.transform = 'scale(1)'; };
            btn.onclick = () => { this._toggleSpeedMode(); };
            if (this.canvas.parentElement) {
                const computedStyle = window.getComputedStyle(this.canvas.parentElement);
                if (computedStyle.position === 'static') this.canvas.parentElement.style.position = 'relative';
                this.canvas.parentElement.appendChild(btn);
            }
        }
        this._updateSpeedBtnUI();
    },

    _toggleSpeedMode: function() {
        if (!window.player) return;
        const current = (player.moveSpeedMode !== undefined) ? player.moveSpeedMode : 1;
        player.moveSpeedMode = (current + 1) % 3;
        this._updateSpeedBtnUI();
        if (window.saveGame) window.saveGame();
    },

    _updateSpeedBtnUI: function() {
        const btn = document.getElementById('btn_move_speed');
        if (!btn || !window.player) return;
        const modeIdx = (player.moveSpeedMode !== undefined) ? player.moveSpeedMode : 1;
        const config = this.moveModes[modeIdx] || this.moveModes[1];
        btn.innerHTML = config.name;
        btn.style.color = config.color;
        btn.style.borderColor = config.color;
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

    moveTo: function(tx, ty) {
        const MAX = 5100;
        tx = Math.max(0, Math.min(MAX, tx));
        ty = Math.max(0, Math.min(MAX, ty));

        if (tx === player.coord.x && ty === player.coord.y) return;
        const dist = Math.abs(player.coord.x - tx) + Math.abs(player.coord.y - ty);

        if (player.buffs && player.buffs['t_water']) this._addSwimmingExp(dist);

        const modeIdx = (player.moveSpeedMode !== undefined) ? player.moveSpeedMode : 1;
        const modeConfig = this.moveModes[modeIdx] || this.moveModes[1];
        const currentSpeed = modeConfig.speed;
        const costHours = dist / currentSpeed;

        if (window.TimeSystem) {
            TimeSystem.passTime(costHours, 0, 0, {
                hunger: modeConfig.hunger,
                fatigue: modeConfig.fatigue
            });
        }

        player.coord.x = tx;
        player.coord.y = ty;

        if (window.UtilsMortalTask) {
            let realSpeed = 10;
            if (player.derived && player.derived.speed) realSpeed = player.derived.speed;
            window.UtilsMortalTask.updateProgress('move_distance', dist, { speed: realSpeed });
        }

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
        const region = REGION_LAYOUT.find(r => x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]);
        if (region) { player.coord.region = region.id; } else { player.coord.region = "unknown"; }
    },

    _updatePlayerLocation: function(x, y) {
        if (!window.player) return;
        let locId = "";
        if (typeof WORLD_TOWNS !== 'undefined') {
            const town = WORLD_TOWNS.find(t => x >= t.x && x < t.x + t.w && y >= t.y && y < t.y + t.h);
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

            if (screenX > margin && screenX < this.width - margin && screenY > margin && screenY < this.height - margin) {
                const iconSize = ts * this.scale;
                const canvasRect = this.canvas.getBoundingClientRect();
                const virtualRect = {
                    left: canvasRect.left + screenX - iconSize/2,
                    top: canvasRect.top + screenY - iconSize/2,
                    width: iconSize,
                    height: iconSize
                };
                if (window.UITutorial) { UITutorial.start(false, 'monster', virtualRect); }
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
    },

    // --- 凡尘任务悬浮窗 ---
    _drawMortalTask: function() {
        if (!window.player || !player.mortal_task || player.mortal_task.state !== 'active') return;

        const task = player.mortal_task;
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.save();
        ctx.font = "bold 16px 'KaiTi', 'SimKai', sans-serif";
        const titleStr = `⚔️ 【${task.name}】突破中`;
        const titleW = ctx.measureText(titleStr).width;

        ctx.font = "14px 'KaiTi', 'SimKai', sans-serif";
        const mainStr = `${task.mainDesc}: ${Math.floor(task.mainCurrent)}/${task.mainTarget}`;
        const mainTextW = ctx.measureText(mainStr).width;

        let extraStr = "";
        let extraTextW = 0;
        if (task.extra) {
            extraStr = `${task.extra.desc}: ${task.extra.current}/${task.extra.target}`;
            extraTextW = ctx.measureText(extraStr).width;
        }

        const barW = 60;
        const gap = 15;
        const padding = 12;
        const contentMaxW = Math.max(mainTextW, extraTextW) + gap + barW;
        let boxW = Math.max(titleW, contentMaxW) + padding * 2;
        boxW = Math.max(240, boxW);

        const boxH = task.extra ? 75 : 55;
        const margin = 10;
        const x = this.canvas.width - boxW - margin;
        const y = 60;

        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.strokeStyle = "#8d6e63";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, boxW, boxH, 6);
        } else {
            ctx.rect(x, y, boxW, boxH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.font = "bold 16px 'KaiTi', 'SimKai', sans-serif";
        ctx.fillStyle = "#ffb74d";
        ctx.fillText(titleStr, x + padding, y + 8);
        ctx.font = "14px 'KaiTi', 'SimKai', sans-serif";
        ctx.fillStyle = "#fff";
        ctx.fillText(mainStr, x + padding, y + 30);

        const barX = x + boxW - padding - barW;
        const mainPct = Math.min(100, Math.floor((task.mainCurrent / task.mainTarget) * 100));
        ctx.fillStyle = "#555";
        ctx.fillRect(barX, y + 34, barW, 6);
        ctx.fillStyle = mainPct >= 100 ? "#66bb6a" : "#42a5f5";
        ctx.fillRect(barX, y + 34, barW * (mainPct/100), 6);

        if (task.extra) {
            const exPct = Math.min(100, Math.floor((task.extra.current / task.extra.target) * 100));
            ctx.fillStyle = "#e0e0e0";
            ctx.fillText(extraStr, x + padding, y + 50);
            ctx.fillStyle = "#555";
            ctx.fillRect(barX, y + 54, barW, 6);
            ctx.fillStyle = exPct >= 100 ? "#66bb6a" : "#ab47bc";
            ctx.fillRect(barX, y + 54, barW * (exPct/100), 6);
        }
        ctx.restore();
    }
};

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => MapCamera.init(), 500); });
window.initMap = function() { MapCamera.init(); };
window.MapCamera = MapCamera;