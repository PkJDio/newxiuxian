// js/action/util_gather.js
// 寻幽采集系统 v2.2：修复按钮选择器失效BUG
//console.log("加载 寻幽系统");

// ================= 配置区域 =================
const GATHER_CONFIG = {
    GRID_SIZE: 10,  // 资源区块大小 10x10
    COST: {
        HOURS: 4,
        HUNGER: 10,
        FATIGUE: 10
    }
};

// ================= 资源管理器 =================
const GatherResourceManager = {

    // 获取指定网格的资源上限
    getResourceCount: function(gridX, gridY) {

        // 1. 城镇/村落避让检查
        const worldX = gridX * GATHER_CONFIG.GRID_SIZE;
        const worldY = gridY * GATHER_CONFIG.GRID_SIZE;

        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let t of WORLD_TOWNS) {
                // 矩形碰撞检测
                const noOverlap = (
                    worldX >= t.x + t.w ||
                    worldX + GATHER_CONFIG.GRID_SIZE <= t.x ||
                    worldY >= t.y + t.h ||
                    worldY + GATHER_CONFIG.GRID_SIZE <= t.y
                );
                if (!noOverlap) {

                    return 0; // 在城镇内，资源为0
                }
            }
        }

        // 2. 正常资源生成 (使用你的 RandomSystem)
        // 确保 RandomSystem 存在，否则给默认值
        let rand = 0.5;
        if (typeof RandomSystem !== 'undefined') {
            // 构造 Key，确保 RandomSystem 能正确解析
            const key = { x: gridX, y: gridY };
            // 注意：这里假设 RandomSystem.getByMonth 内部处理了种子和月份逻辑
            rand = RandomSystem.getByMonth(key);

        } else {
            console.warn("RandomSystem 未定义，使用默认随机");
            rand = Math.random();
        }

        // 3. 敌人判定 (模拟)
        let hasEnemy = false;
        if (rand > 0.7) hasEnemy = true;

        // 4. 计算数量
        let count = 0;
        if (!hasEnemy) {
            count = Math.floor(rand * 4); // 0-3
        } else {
            count = 3 + Math.floor(rand * 3); // 3-5
        }

        return count;
    },

    // 获取当前 Key
    getCurrentKey: function() {
        const gx = Math.floor(player.coord.x / GATHER_CONFIG.GRID_SIZE);
        const gy = Math.floor(player.coord.y / GATHER_CONFIG.GRID_SIZE);
        const totalDays = (player.time.year * 360 + player.time.month * 30 + player.time.day) || 0;
        const month = Math.floor(totalDays / 30);
        return `${gx}_${gy}_m${month}`;
    },

    // 获取剩余次数
    getRemaining: function() {
        const gx = Math.floor(player.coord.x / GATHER_CONFIG.GRID_SIZE);
        const gy = Math.floor(player.coord.y / GATHER_CONFIG.GRID_SIZE);

        // 1. 获取上限
        const max = this.getResourceCount(gx, gy);
        if (max <= 0) return 0; // 如果本来就是不毛之地，直接返回0

        // 2. 准备数据
        const key = this.getCurrentKey();

        // 【修复步骤 1】先确保 player.gatherRecords 存在，防止报错
        if (!player.gatherRecords) {
            player.gatherRecords = {};
        }

        // 【修复步骤 2】获取已用次数，如果没有记录，默认为 0
        const used = player.gatherRecords[key] || 0;

        // 【修复步骤 3】删除了之前的 `if (!player.gatherRecords[key]) return 0;`
        // 现在的逻辑是：最大值 - 已用值
        return Math.max(0, max - used);
    },

    // 消耗次数
    consume: function() {
        const key = this.getCurrentKey();
        if (!player.gatherRecords) player.gatherRecords = {};
        if (!player.gatherRecords[key]) player.gatherRecords[key] = 0;
        player.gatherRecords[key]++;
    }
};

// ================= 寻幽动作系统 =================
const GatherSystem = {

    execute: function() {
        const remaining = GatherResourceManager.getRemaining();
        if (remaining <= 0) {
            if(window.showToast) window.showToast("此地荒芜，或处于闹市，无法寻幽。");
            return;
        }

        // 1. 消耗次数
        GatherResourceManager.consume();

        // 2. 计算掉落
        this._calculateLoot();

        // 3. 消耗时间与状态
        if (window.TimeSystem) {
            TimeSystem.passTime(GATHER_CONFIG.COST.HOURS, GATHER_CONFIG.COST.HUNGER, GATHER_CONFIG.COST.FATIGUE);
        }

        // 4. 增加熟练度
        this._addExp();

        // 5. 刷新UI
        this.updateButtonState();
        if(window.saveGame) window.saveGame();
    },

    _calculateLoot: function() {
        if (!player.lifeSkills) player.lifeSkills = {};
        if (!player.lifeSkills.gathering) player.lifeSkills.gathering = { exp: 0 };
        const exp = player.lifeSkills.gathering.exp;

        // 1. 境界判断
        let stage = 0;
        if (exp >= 2000) stage = 3;
        else if (exp >= 500) stage = 2;
        else if (exp >= 100) stage = 1;

        let dropCount = 0;
        let itemPools = [];
        let rarityWeights = { r1:0, r2:0, r3:0, r4:0 };

        // 2. 掉落配置
        if (stage === 0) {
            dropCount = 1 + Math.floor(Math.random() * 2);
            itemPools = ['materials', 'foodMaterial'];
            rarityWeights = { r1: 80, r2: 20, r3: 0, r4: 0 };
        } else if (stage === 1) {
            dropCount = 2 + Math.floor(Math.random() * 3);
            itemPools = ['materials', 'materials', 'foodMaterial', 'foodMaterial', 'foods'];
            rarityWeights = { r1: 60, r2: 30, r3: 10, r4: 0 };
        } else if (stage === 2) {
            dropCount = 3 + Math.floor(Math.random() * 3);
            itemPools = ['materials', 'foodMaterial', 'foods'];
            rarityWeights = { r1: 50, r2: 30, r3: 20, r4: 0 };
        } else {
            dropCount = 4 + Math.floor(Math.random() * 3);
            itemPools = ['materials', 'foodMaterial', 'foods'];
            rarityWeights = { r1: 40, r2: 40, r3: 20, r4: 0 };
            if (Math.random() < 0.15) this._dropEquipment();
        }

        // lootMap 用于聚合物品：{ "itemId": { name: "止血草", rarity: 1, count: 5 } }
        let lootMap = {};
        let junkCount = 0;

        // 3. 模拟掉落过程（仅生成数据，不操作背包）
        for (let i = 0; i < dropCount; i++) {
            const type = itemPools[Math.floor(Math.random() * itemPools.length)];
            const rRand = Math.random() * 100;
            let rarity = 1, acc = 0;
            if (rRand < (acc += rarityWeights.r1)) rarity = 1;
            else if (rRand < (acc += rarityWeights.r2)) rarity = 2;
            else if (rRand < (acc += rarityWeights.r3)) rarity = 3;
            else rarity = 4;

            const validItems = GAME_DB.items.filter(it => {
                let matchType = false;
                if (type === 'materials') matchType = (it.type === 'material');
                else if (type === 'foodMaterial') matchType = (it.type === 'foodMaterial');
                else if (type === 'foods') matchType = (it.type === 'food');
                return matchType && it.rarity === rarity;
            });

            if (validItems.length > 0) {
                const item = validItems[Math.floor(Math.random() * validItems.length)];
                if (!lootMap[item.id]) {
                    lootMap[item.id] = { name: item.name, rarity: item.rarity, count: 1 };
                } else {
                    lootMap[item.id].count++;
                }
            } else {
                junkCount++;
            }
        }

        // 4. 【批量处理】一次性添加物品并构建日志文本
        let displayLogs = [];
        for (const itemId in lootMap) {
            const loot = lootMap[itemId];

            // 调用 addItem，直接传入统计好的总数
            if (window.UtilsAdd && window.UtilsAdd.addItem) {
                window.UtilsAdd.addItem(itemId, loot.count, false);
            }

            displayLogs.push(`<span class="text_item quality_${loot.rarity}">${loot.name}</span> x${loot.count}`);
        }

        if (junkCount > 0) displayLogs.push(`杂物 x${junkCount}`);

        // 5. 反馈 UI
        const logContent = displayLogs.length > 0 ? `寻幽偶得：${displayLogs.join('，')}。` : "一无所获。";
        if(window.showToast) window.showToast(logContent);
        if (window.LogManager) LogManager.add(logContent);
    },

    _dropEquipment: function() {
        const rRand = Math.random();
        let rarity = 1;
        if (rRand < 0.7) rarity = 1;
        else if (rRand < 0.95) rarity = 2;
        else rarity = 3;

        const equipTypes = ['武器', '防具', '饰品', '法宝'];
        const validEquips = GAME_DB.items.filter(it => equipTypes.includes(it.type) && it.rarity === rarity);

        if (validEquips.length > 0) {
            const item = validEquips[Math.floor(Math.random() * validEquips.length)];
            const count = 1 + Math.floor(Math.random() * 2);
            if (window.UtilsAdd) window.UtilsAdd.addItem(item.id, count);
            if (window.LogManager) {
                LogManager.add(`【机缘】你在隐秘处发现了 <span class="text_item quality_${item.rarity}">${item.name}</span> x${count}！`);
            }
        }
    },

    _addExp: function() {
        const skill = player.lifeSkills.gather;
        skill.exp += 1;
        const check = (val, name) => {
            if (skill.exp === val) window.showToast(`[寻幽] 技艺提升至【${name}】！`);
        };
        check(100, "入门"); check(500, "进阶"); check(2000, "大成");
    },

    // 更新按钮 UI
    updateButtonState: function() {
        // 【核心修改】
        // 1. 尝试寻找按钮
        const btn = document.querySelector('button[onclick="doGather()"]');
        if (!btn) {
            // 如果真的找不到了，说明页面可能重绘了，或者之前的 removeAttribute 导致的
            // console.warn("未找到寻幽按钮");
            return;
        }

        const count = GatherResourceManager.getRemaining();

        // 构建 HTML
        let countHtml = "";
        let isAvailable = true;

        if (count > 0) {
            countHtml = `<span class="gather_count_val">剩余${count}</span>`;
            isAvailable = true;
        } else {
            countHtml = `<span class="gather_count_empty">无资源</span>`;
            isAvailable = false;
        }

        btn.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; line-height:1.2;">
                <span>🌿 寻幽</span>
                ${countHtml}
            </div>
        `;

        // 【关键修复】
        // 不要移除 onclick 属性！否则下次 querySelector 就找不到这个按钮了。
        // 使用 CSS pointer-events 来禁止点击。
        if (!isAvailable) {
            btn.classList.add('ink_disabled');
            // 禁止鼠标事件，这样就点不动了，也不会触发 onclick
            btn.style.pointerEvents = 'none';
        } else {
            btn.classList.remove('ink_disabled');
            // 恢复鼠标事件
            btn.style.pointerEvents = 'auto';
        }
    }
};

window.doGather = function() { GatherSystem.execute(); };
window.GatherSystem = GatherSystem;
window.GatherResourceManager = GatherResourceManager;