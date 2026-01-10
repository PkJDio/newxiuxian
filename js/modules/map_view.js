// js/modules/map_view.js
// 地图渲染模块 (性能优化版 - DOM复用)
//console.log("加载 地图渲染模块 (vOpt)");

const MapView = {
    container: null,
    // 缓存 DOM 节点池
    tilePool: [],
    // 缓存当前的视图尺寸，用于判断是否需要重建池
    cachedSize: 0,

    init: function() {
        this.container = document.getElementById('map_container');
        if (!this.container) return;

        // 【优化】事件委托：只在容器上绑定一次点击事件
        // 避免在每个格子上重复绑定导致内存泄漏
        this.container.removeEventListener('click', this._handleMapClick); // 防止重复绑定
        this.container.addEventListener('click', (e) => this._handleMapClick(e));

        // 初始渲染
        this.renderMap();
    },

    /**
     * 【优化】点击事件处理代理
     */
    _handleMapClick: function(e) {
        // 向上寻找最近的 .map_tile 元素
        const target = e.target.closest('.map_tile');
        if (!target) return;

        // 获取存储在 DOM 上的数据
        const enemyId = target.dataset.enemyId;
        const npcId = target.dataset.npcId;
        const gatherId = target.dataset.gatherId; // 采集物ID
        const gx = parseInt(target.dataset.gx);
        const gy = parseInt(target.dataset.gy);

        // 逻辑分发
        if (enemyId) {
            if (window.Combat) Combat.startBattle(enemyId);
        } else if (npcId) {
            // 这里处理 NPC 点击逻辑，根据你的需求补充
            //console.log("点击了NPC:", npcId);
        } else if (gatherId) {
            // 处理采集
            if (window.UtilsGather) UtilsGather.handleGatherClick(gx, gy, gatherId);
        } else {
            // 处理移动
            if (window.MapCamera) MapCamera.moveTo(gx, gy);
        }
    },

    renderMap: function() {
        if (!this.container) return;
        if (!window.player || !window.MapCamera) return;

        // 获取视野内的格子数据
        const visibleTiles = MapCamera.getVisibleTiles();
        if (!visibleTiles || visibleTiles.length === 0) return;

        const totalTiles = visibleTiles.length;

        // 1. 检查是否需要重新构建 DOM 池 (仅在初始化或视口大小剧烈变化时执行)
        if (this.tilePool.length !== totalTiles) {
            this._rebuildDomPool(totalTiles);
        }

        // 2. 差量更新：循环复用现有的 DOM 节点
        visibleTiles.forEach((tileData, index) => {
            const el = this.tilePool[index];
            this._updateTileElement(el, tileData);
        });
    },

    /**
     * 构建 DOM 池：一次性创建所有格子
     */
    _rebuildDomPool: function(count) {
        this.container.innerHTML = ''; // 清空容器
        this.tilePool = [];

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'map_tile'; // 基础类名

            // 可以预先插入内部结构（如果有的话），比如图标层、迷雾层
            // 目前你的逻辑主要是改 class 和 text，所以这里保持干净即可

            fragment.appendChild(el);
            this.tilePool.push(el);
        }

        this.container.appendChild(fragment);
        this.cachedSize = count;
        //console.log(`[MapView] DOM池已重建，节点数: ${count}`);
    },

    /**
     * 更新单个格子 DOM 属性
     * @param {HTMLElement} el 复用的 DOM 节点
     * @param {Object} tileData 格子数据
     */
    _updateTileElement: function(el, tileData) {
        const { x, y, terrain, activeEvents, isFog, isExplored } = tileData;

        // 1. 重置基础属性
        // 使用 className 整体替换比 classList.add/remove 更快
        let classStr = `map_tile tile_${terrain}`;
        let contentHtml = '';

        // 清理旧数据 dataset
        // 注意：直接赋值 dataset 属性比 delete 性能好
        el.dataset.gx = x;
        el.dataset.gy = y;
        el.dataset.enemyId = '';
        el.dataset.npcId = '';
        el.dataset.gatherId = '';

        // 2. 处理迷雾逻辑
        if (isFog) {
            classStr += ' tile_fog';
            if (isExplored) {
                classStr += ' tile_explored_fog'; // 探索过但不在视野内
                // 可以选择显示地形符号但不显示事件
                // contentHtml = '';
            } else {
                // 完全未探索
                contentHtml = '';
            }
        }

        // 3. 处理事件渲染 (只有在非迷雾，或者已探索迷雾下根据设计决定是否显示)
        // 假设：完全迷雾不显示任何东西，已探索迷雾只显示地形，视野内显示所有
        if (!isFog) {
            // 玩家位置
            if (x === player.x && y === player.y) {
                classStr += ' tile_player';
                contentHtml = '<span class="map_icon">🧙‍♂️</span>';
            }
            // 事件处理
            else if (activeEvents && activeEvents.length > 0) {
                // 优先级：敌人 > NPC > 采集物 > 地标
                const enemy = activeEvents.find(e => e.type === 'enemy');
                const npc = activeEvents.find(e => e.type === 'npc');
                const gather = activeEvents.find(e => e.type === 'gather'); // 假设采集物类型为 gather
                const location = activeEvents.find(e => e.type === 'location'); // 假设地标

                if (enemy) {
                    classStr += ' tile_enemy';
                    // 获取敌人配置以显示不同图标
                    const enemyConf = window.GAME_DB.enemies.find(e => e.id === enemy.id);
                    const icon = enemyConf ? (enemyConf.icon || '👿') : '👿';
                    contentHtml = `<span class="map_icon">${icon}</span>`;
                    el.dataset.enemyId = enemy.id;

                    // 只有当有敌人时，才绑定悬浮窗
                    // 优化：不再使用 onmouseenter，建议改为 CSS hover 或全局 tooltip 代理
                    // 这里为了兼容旧逻辑，保留简单的 title 或 data-tip
                    // el.setAttribute('data-tip', '敌人');
                }
                else if (npc) {
                    classStr += ' tile_npc';
                    contentHtml = '<span class="map_icon">👤</span>';
                    el.dataset.npcId = npc.id;
                }
                else if (gather) {
                    classStr += ' tile_gather';
                    // 假设 gather 对象里有 icon
                    const icon = gather.icon || '🌿';
                    contentHtml = `<span class="map_icon">${icon}</span>`;
                    el.dataset.gatherId = gather.id;
                }
                else if (location) {
                    classStr += ' tile_location';
                    contentHtml = '<span class="map_icon">🏯</span>'; // 举例
                }
            }
        }

        // 4. 应用变更
        // 只有当 className 真的改变时才赋值，避免不必要的重绘（浏览器通常有优化，但显式判断更稳）
        if (el.className !== classStr) {
            el.className = classStr;
        }

        // 只有当 HTML 内容改变时才赋值
        if (el.innerHTML !== contentHtml) {
            el.innerHTML = contentHtml;
        }

        // 悬浮提示处理 (Tooltip)
        // 建议使用全局 mousemove 监听，而不是在这里给每个格子加事件
        // 如果必须在这里加，确保 TooltipManager.showItem 是高性能的
        el.onmouseenter = (e) => {
            if (isFog) return;
            // 简单的内容提示
            if (activeEvents && activeEvents.length > 0) {
                const enemy = activeEvents.find(ev => ev.type === 'enemy');
                if(enemy && window.showItemTooltip) {
                    // 构造一个临时对象传给 tooltip，或者 tooltip 支持 ID 查找
                    // 这里假设 tooltip 支持传入 ID
                    // window.showItemTooltip(e, enemy.id);
                }
            }
        };
        el.onmouseleave = () => {
            if (window.hideTooltip) window.hideTooltip();
        };
    }
};

window.MapView = MapView;