// js/action/util_gather.js
// 寻幽采集系统 v3.1：独立装备掉落与概率重构

// ================= 配置区域 =================
const GATHER_CONFIG = {
    GRID_SIZE: 10,  // 资源区块大小
    COST: {
        HOURS: 4,
        HUNGER: 10,
        FATIGUE: 10
    }
};

// ================= 资源管理器 (保持不变) =================
const GatherResourceManager = {
    // 获取指定网格的资源上限
    getResourceCount: function(gridX, gridY) {
        const worldX = gridX * GATHER_CONFIG.GRID_SIZE;
        const worldY = gridY * GATHER_CONFIG.GRID_SIZE;

        // 1. 城镇避让
        if (typeof WORLD_TOWNS !== 'undefined') {
            for (let t of WORLD_TOWNS) {
                const noOverlap = (
                    worldX >= t.x + t.w ||
                    worldX + GATHER_CONFIG.GRID_SIZE <= t.x ||
                    worldY >= t.y + t.h ||
                    worldY + GATHER_CONFIG.GRID_SIZE <= t.y
                );
                if (!noOverlap) return 0;
            }
        }

        // 2. 资源生成
        let rand = 0.5;
        if (typeof RandomSystem !== 'undefined') {
            const key = { x: gridX, y: gridY };
            rand = RandomSystem.getByMonth(key);
        } else {
            rand = Math.random();
        }
        const timeStart = (window.player && window.player.timeStart) || 0;
        // 3. 计算数量
        let count = 0;
        if (rand > 0.7) {
            count = timeStart + Math.floor(rand * 4); // 3-5
        } else {
            count = Math.floor(rand * 4);     // 0-2
        }
        return count;
    },

    getCurrentKey: function() {
        if (!window.player || !window.player.coord) return "0_0_m0";
        const gx = Math.floor(player.coord.x / GATHER_CONFIG.GRID_SIZE);
        const gy = Math.floor(player.coord.y / GATHER_CONFIG.GRID_SIZE);
        const totalDays = (player.time.year * 360 + player.time.month * 30 + player.time.day) || 0;
        const month = Math.floor(totalDays / 30);
        return `${gx}_${gy}_m${month}`;
    },

    getRemaining: function() {
        if (!window.player || !window.player.coord) return 0;
        const gx = Math.floor(player.coord.x / GATHER_CONFIG.GRID_SIZE);
        const gy = Math.floor(player.coord.y / GATHER_CONFIG.GRID_SIZE);

        const max = this.getResourceCount(gx, gy);
        if (max <= 0) return 0;

        const key = this.getCurrentKey();
        if (!player.gatherRecords) player.gatherRecords = {};
        const used = player.gatherRecords[key] || 0;

        return Math.max(0, max - used);
    },

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

        // 2. 计算掉落 (包含材料和装备的独立逻辑)
        this._calculateLoot();

        // 3. 消耗时间与状态
        if (window.TimeSystem) {
            TimeSystem.passTime(GATHER_CONFIG.COST.HOURS, GATHER_CONFIG.COST.HUNGER, GATHER_CONFIG.COST.FATIGUE);
        }

        // 4. 【修改点1】增加熟练度：固定 +1 (无论成败)
        if (window.UtilsLifeSkills) {
            UtilsLifeSkills.addExp('gathering', 1);
        }

        // 5. 刷新UI
        this.updateButtonState();
        if(window.updateUI) window.updateUI();

        // 6. 保存
        if(window.saveGame) window.saveGame();
    },

    // 核心掉落逻辑
    _calculateLoot: function() {
        // 获取等级
        let level = 0;
        if (window.UtilsLifeSkills) {
            level = UtilsLifeSkills.getLevel('gathering');
        }

        let lootMap = {}; // 存储掉落物 {id: {name, rarity, count}}
        let junkCount = 0;

        // ==========================================
        // 逻辑 A: 寻找材料/食物 (基础掉落)
        // ==========================================
        let materialDropCount = 0;
        let itemPools = [];
        let matRarityWeights = { r1:0, r2:0, r3:0, r4:0 };

        // 等级阶段配置 (材料部分)
        if (level <= 2) {
            materialDropCount = 1 + Math.floor(Math.random() * 2);
            itemPools = ['materials', 'foodMaterial'];
            matRarityWeights = { r1: 80, r2: 20, r3: 0, r4: 0 };
        } else if (level <= 5) {
            materialDropCount = 2 + Math.floor(Math.random() * 3);
            itemPools = ['materials', 'materials', 'foodMaterial', 'foodMaterial', 'foods'];
            matRarityWeights = { r1: 60, r2: 30, r3: 10, r4: 0 };
        } else if (level <= 7) {
            materialDropCount = 3 + Math.floor(Math.random() * 3);
            itemPools = ['materials', 'foodMaterial', 'foods'];
            matRarityWeights = { r1: 50, r2: 30, r3: 20, r4: 0 };
        } else {
            // 8级以上
            materialDropCount = 4 + Math.floor(Math.random() * 3);
            itemPools = ['materials', 'foodMaterial', 'foods'];
            matRarityWeights = { r1: 40, r2: 40, r3: 20, r4: 0 };
        }

        // 执行材料掉落
        for (let i = 0; i < materialDropCount; i++) {
            const type = itemPools[Math.floor(Math.random() * itemPools.length)];
            const rRand = Math.random() * 100;
            let rarity = 1, acc = 0;
            if (rRand < (acc += matRarityWeights.r1)) rarity = 1;
            else if (rRand < (acc += matRarityWeights.r2)) rarity = 2;
            else if (rRand < (acc += matRarityWeights.r3)) rarity = 3;
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

        // ==========================================
        // 逻辑 B: 寻找装备 (独立判定)
        // ==========================================
        // 【修改点2】只有 8 9 10 级可以找到装备
        // 【修改点3】概率 = (等级 - 7) * 0.01
        let equipFound = null;

        if (level >= 8) {
            const equipChance = (level - 7) * 0.01; // Lv8=1%, Lv9=2%, Lv10=3%

            if (Math.random() < equipChance) {
                // 【修改点2】权重 100:50:30:15
                // 总权重 = 195
                const wR1 = 100, wR2 = 50, wR3 = 30, wR4 = 15;
                const totalW = wR1 + wR2 + wR3 + wR4;
                const rRand = Math.random() * totalW;

                let eRarity = 1;
                let acc = 0;

                if (rRand < (acc += wR1)) eRarity = 1;
                else if (rRand < (acc += wR2)) eRarity = 2;
                else if (rRand < (acc += wR3)) eRarity = 3;
                else eRarity = 4;

                // 【修改点3】从库中获取装备
                // 假设 GAME_DB.items 包含所有物品，通过 type 筛选装备
                const equipTypes = ['weapon', 'head', 'body', 'feet', 'mount', 'fishing_rod'];

                // 如果有专门的 GAME_DB.equipments 就用那个，这里为了稳健，在 items 里筛选
                // 注意：如果您的项目确实有 GAME_DB.equipments，请将下面这行改为：
                // const sourceDB = GAME_DB.equipments || GAME_DB.items;
                const sourceDB = GAME_DB.equipments || GAME_DB.items;

                const validEquips = sourceDB.filter(it =>
                    equipTypes.includes(it.type) && it.rarity === eRarity
                );

                if (validEquips.length > 0) {
                    const item = validEquips[Math.floor(Math.random() * validEquips.length)];
                    equipFound = { name: item.name, rarity: item.rarity, id: item.id, count: 1 };
                }
            }
        }

        // ==========================================
        // 结算与日志合并
        // ==========================================
        let toastParts = [];
        let logParts = [];

        // 1. 处理材料入包
        for (const itemId in lootMap) {
            const loot = lootMap[itemId];
            if (window.UtilsAdd && window.UtilsAdd.addItem) {
                window.UtilsAdd.addItem(itemId, loot.count, false);
            }
            toastParts.push(`${loot.name} x${loot.count}`);
            logParts.push(`<span class="text_item quality_${loot.rarity}">${loot.name}</span> x${loot.count}`);
        }

        // 2. 处理装备入包
        if (equipFound) {
            if (window.UtilsAdd && window.UtilsAdd.addItem) {
                window.UtilsAdd.addItem(equipFound.id, 1, false);
            }
            toastParts.push(`${equipFound.name} x1`);
            logParts.push(`【机缘】<span class="text_item quality_${equipFound.rarity}">${equipFound.name}</span> x1`);
        }

        // 3. 显示结果
        if (toastParts.length > 0) {
            if(window.showToast) window.showToast(`获得：${toastParts.join('，')}`);
            if (window.LogManager) {
                const timeCost = GATHER_CONFIG.COST.HOURS;
                LogManager.add(`你于山林间搜寻许久，耗去 ${timeCost} 个时辰，寻幽偶得：${logParts.join('，')}。`);
            }
        } else {
            // 什么都没找到 (装备和材料都没随到，虽然材料没随到的概率很低)
            if(window.showToast) window.showToast("一无所获。");
            if (window.LogManager) LogManager.add(`你耗去 ${GATHER_CONFIG.COST.HOURS} 个时辰搜寻四周，却一无所获。`);
        }
    },

    updateButtonState: function() {
        const btns = document.querySelectorAll('button');
        let btn = null;
        for (let b of btns) {
            if (b.getAttribute('onclick') && b.getAttribute('onclick').includes('doGather')) {
                btn = b;
                break;
            }
        }

        if (!btn) return;

        const count = GatherResourceManager.getRemaining();
        let countHtml = "";
        let isAvailable = true;

        if (count > 0) {
            countHtml = `<span class="gather_count_val" style="display:block; font-size:12px; color:#022f02;">剩余${count}</span>`;
            isAvailable = true;
        } else {
            countHtml = `<span class="gather_count_empty" style="display:block; font-size:12px; color:#460808;">无资源</span>`;
            isAvailable = false;
        }

        btn.innerHTML = `🌿 寻幽 ${countHtml}`;

        if (!isAvailable) {
            btn.classList.add('ink_disabled');
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.6';
        } else {
            btn.classList.remove('ink_disabled');
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
        }
    }
};

window.doGather = function() { GatherSystem.execute(); };
window.GatherSystem = GatherSystem;
window.GatherResourceManager = GatherResourceManager;

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (window.GatherSystem) {
            GatherSystem.updateButtonState();
        }
    }, 500);
});