/**
 * map_view.js
 * 负责地图的渲染、UI更新以及调试信息的输出
 */

const MapView = {
    container: null,

    // 缓存当前的地图数据和玩家位置，用于重绘
    currentMapData: null,
    currentPlayerPos: null,

    /**
     * 初始化地图视图
     * @param {string} containerId - 地图容器的DOM ID
     */
    init: function(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`[MapError] 找不到地图容器: ${containerId}`);
            return;
        }
        console.log(`[MapSystem] 地图视图初始化完成，容器ID: ${containerId}`);
    },

    /**
     * 核心渲染方法
     * @param {Object} mapData - 地图数据对象 (包含 grid, width, height, enemies 等)
     * @param {Object} playerPos - 玩家位置 {x, y}
     */
    render: function(mapData, playerPos) {
        console.group("==== 开始渲染地图 ===="); // 开始折叠日志
        console.log("接收到的地图数据:", mapData);
        console.log("接收到的玩家位置:", playerPos);

        if (!this.container) return;

        this.currentMapData = mapData;
        this.currentPlayerPos = playerPos;
        this.container.innerHTML = ''; // 清空旧地图

        // 1. 安全检查：如果地图数据为空
        if (!mapData || !mapData.width || !mapData.height) {
            console.error("[MapError] 地图数据无效!", mapData);
            this.container.innerHTML = '<div class="error-msg">地图数据缺失</div>';
            console.groupEnd();
            return;
        }

        // 2. 设置容器样式的网格布局 (CSS Grid)
        // 动态计算 CSS grid-template-columns，确保格子排列正确
        this.container.style.display = 'grid';
        this.container.style.gridTemplateColumns = `repeat(${mapData.width}, 1fr)`;
        this.container.style.gap = '2px'; // 格子间距

        // 3. 敌人数据检查与兜底生成
        // 如果数据里没有 enemies 数组，或者数组为空，我们强制生成一些用于测试
        if (!mapData.enemies || !Array.isArray(mapData.enemies) || mapData.enemies.length === 0) {
            console.warn("[MapWarning] 当前地图没有敌人数据，正在生成测试敌人...");
            // 注意：这里修改的是传入的 mapData 对象引用
            mapData.enemies = this.generateTestEnemies(mapData.width, mapData.height, playerPos);
        }

        console.log(`[MapSystem] 当前地图敌人总数: ${mapData.enemies.length}`);
        console.table(mapData.enemies); // 以表格形式打印敌人列表

        // 4. 遍历网格进行绘制
        for (let y = 0; y < mapData.height; y++) {
            for (let x = 0; x < mapData.width; x++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'map-cell';
                cellDiv.dataset.x = x;
                cellDiv.dataset.y = y;

                // --- 逻辑判断优先级 ---

                // A. 判断是否是玩家
                const isPlayer = (x === playerPos.x && y === playerPos.y);

                // B. 判断是否是敌人
                // find 查找当前坐标是否有敌人
                const enemy = mapData.enemies.find(e => e.x === x && e.y === y);

                // C. 获取地形/地点名称
                // 假设 mapData.grid 是一个二维数组或一维数组，这里兼容处理
                let locationName = "荒野";
                if (mapData.grid && mapData.grid[y] && mapData.grid[y][x]) {
                    locationName = mapData.grid[y][x].name || mapData.grid[y][x];
                }

                // --- 渲染内容 ---

                if (isPlayer) {
                    cellDiv.classList.add('map-cell-player');
                    cellDiv.innerHTML = '<span class="icon">🧘</span><span class="name">你</span>';
                    // console.log(`[Render] 绘制玩家 @ (${x}, ${y})`);
                }
                else if (enemy) {
                    cellDiv.classList.add('map-cell-enemy');
                    // 根据敌人类型显示不同图标 (这里简化处理)
                    const enemyIcon = enemy.type === 'boss' ? '👹' : '💀';
                    cellDiv.innerHTML = `<span class="icon">${enemyIcon}</span><span class="name">${enemy.name}</span>`;
                    console.log(`[Render] 绘制敌人 [${enemy.name}] @ (${x}, ${y})`);
                }
                else {
                    // 普通地形
                    cellDiv.classList.add('map-cell-ground');
                    // 如果是特殊地点（如城市），加特殊样式
                    if (locationName !== "荒野" && locationName !== "山林") {
                        cellDiv.classList.add('map-cell-city');
                    }
                    cellDiv.innerHTML = `<span class="name">${locationName}</span>`;
                }

                // 添加点击事件（用于移动或交互）
                cellDiv.onclick = () => {
                    console.log(`[Click] 点击了格子: ${x}, ${y}, 地点: ${locationName}`);
                    if (window.Game && window.Game.handleMapClick) {
                        window.Game.handleMapClick(x, y);
                    }
                };

                this.container.appendChild(cellDiv);
            }
        }
        console.groupEnd(); // 结束日志折叠
    },

    /**
     * 辅助方法：生成测试敌人
     * 当地图数据里没有敌人时调用，防止空荡荡的
     */
    generateTestEnemies: function(width, height, playerPos) {
        const testEnemies = [];
        const count = 3; // 生成3个敌人

        for (let i = 0; i < count; i++) {
            // 简单的随机坐标
            let ex = Math.floor(Math.random() * width);
            let ey = Math.floor(Math.random() * height);

            // 防止生成在玩家头上
            while (ex === playerPos.x && ey === playerPos.y) {
                ex = Math.floor(Math.random() * width);
                ey = Math.floor(Math.random() * height);
            }

            testEnemies.push({
                id: `test_enemy_${i}`,
                name: i === 0 ? "秦岭匪徒" : "野狼",
                x: ex,
                y: ey,
                hp: 100,
                type: 'normal'
            });
        }
        console.log("[MapSystem] 已生成测试敌人数据:", testEnemies);
        return testEnemies;
    },

    /**
     * 更新视图（当玩家移动时调用此方法即可，不必完全重置）
     */
    update: function() {
        if (this.currentMapData && this.currentPlayerPos) {
            this.render(this.currentMapData, this.currentPlayerPos);
        }
    }
};

// 导出 (如果使用了模块系统，否则直接挂载到 window)
if (typeof window !== 'undefined') {
    window.MapView = MapView;
}