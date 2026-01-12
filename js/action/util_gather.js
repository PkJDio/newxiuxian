// js/action/util_gather.js
// 寻幽采集系统 v2.3：修复次数刷新与初始化问题

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

        // 2. 正常资源生成
        let rand = 0.5;
        if (typeof RandomSystem !== 'undefined') {
            const key = { x: gridX, y: gridY };
            rand = RandomSystem.getByMonth(key);
        } else {
            // console.warn("RandomSystem 未定义，使用默认随机");
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
        if (!window.player || !window.player.coord) return "0_0_m0";
        const gx = Math.floor(player.coord.x / GATHER_CONFIG.GRID_SIZE);
        const gy = Math.floor(player.coord.y / GATHER_CONFIG.GRID_SIZE);
        const totalDays = (player.time.year * 360 + player.time.month * 30 + player.time.day) || 0;
        const month = Math.floor(totalDays / 30);
        return `${gx}_${gy}_m${month}`;
    },

    // 获取剩余次数
    getRemaining: function() {
        if (!window.player || !window.player.coord) return 0;

        const gx = Math.floor(player.coord.x / GATHER_CONFIG.GRID_SIZE);
        const gy = Math.floor(player.coord.y / GATHER_CONFIG.GRID_SIZE);

        // 1. 获取上限
        const max = this.getResourceCount(gx, gy);
        if (max <= 0) return 0;

        // 2. 获取已用次数
        const key = this.getCurrentKey();
        if (!player.gatherRecords) {
            player.gatherRecords = {};
        }
        const used = player.gatherRecords[key] || 0;

        // 3. 计算剩余
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

        // 5. 【关键修复】强制刷新UI
        // 更新按钮上的次数显示
        this.updateButtonState();
        // 更新左侧属性栏(疲劳、饱食度等)
        if(window.updateUI) window.updateUI();

        // 6. 保存
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

        let lootMap = {};
        let junkCount = 0;

        // 3. 模拟掉落
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

        // 4. 批量添加与日志
        // 4. 【优化】批量添加与日志分级
        let toastParts = []; // 简略提示 (纯文本)
        let logParts = [];   // 详细日志 (带HTML)

        for (const itemId in lootMap) {
            const loot = lootMap[itemId];
            if (window.UtilsAdd && window.UtilsAdd.addItem) {
                // 静默添加，不弹窗
                window.UtilsAdd.addItem(itemId, loot.count, false);
            }
            // 构建简略提示
            toastParts.push(`${loot.name} x${loot.count}`);
            // 构建详细日志
            logParts.push(`<span class="text_item quality_${loot.rarity}">${loot.name}</span> x${loot.count}`);
        }

        if (junkCount > 0) {
            toastParts.push(`杂物 x${junkCount}`);
            logParts.push(`杂物 x${junkCount}`);
        }

        if (toastParts.length > 0) {
            // 简陋的 Toast 提示
            if(window.showToast) window.showToast(`获得：${toastParts.join('，')}`);

            // 详细的 Log 记录
            if (window.LogManager) {
                const timeCost = GATHER_CONFIG.COST.HOURS;
                LogManager.add(`你于山林间搜寻许久，耗去 ${timeCost} 个时辰，寻幽偶得：${logParts.join('，')}。`);
            }
        } else {
            if(window.showToast) window.showToast("一无所获。");
            if (window.LogManager) LogManager.add(`你耗去 ${GATHER_CONFIG.COST.HOURS} 个时辰搜寻四周，却一无所获。`);
        }
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
        if (!player.lifeSkills) player.lifeSkills = {};
        if (!player.lifeSkills.gathering) player.lifeSkills.gathering = { exp: 0 };
        const skill = player.lifeSkills.gathering; // 修正属性名
        skill.exp += 1;
        const check = (val, name) => {
            if (skill.exp === val) window.showToast(`[寻幽] 技艺提升至【${name}】！`);
        };
        check(100, "入门"); check(500, "进阶"); check(2000, "大成");
    },

    // 更新按钮 UI (核心修复部分)
    updateButtonState: function() {
        // 使用更精确的选择器，或者直接给按钮加 ID 更好，这里兼容原有写法
        // 查找所有按钮，找到 onclick 包含 doGather 的那个
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

        // 构建 HTML
        let countHtml = "";
        let isAvailable = true;

        if (count > 0) {
            countHtml = `<span class="gather_count_val" style="display:block; font-size:12px; color:#022f02;">剩余${count}</span>`;
            isAvailable = true;
        } else {
            countHtml = `<span class="gather_count_empty" style="display:block; font-size:12px; color:#460808;">无资源</span>`;
            isAvailable = false;
        }

        // 保持按钮原有结构，只更新内部文字
        btn.innerHTML = `🌿 寻幽 ${countHtml}`;

        if (!isAvailable) {
            btn.classList.add('ink_disabled');
            btn.style.pointerEvents = 'none'; // 禁用点击
            btn.style.opacity = '0.6';
        } else {
            btn.classList.remove('ink_disabled');
            btn.style.pointerEvents = 'auto'; // 恢复点击
            btn.style.opacity = '1';
        }
    }
};

// 绑定全局
window.doGather = function() { GatherSystem.execute(); };
window.GatherSystem = GatherSystem;
window.GatherResourceManager = GatherResourceManager;

// 【修复步骤 4】监听页面加载，确保初始化时按钮状态正确
document.addEventListener("DOMContentLoaded", () => {
    // 延迟一点时间，确保存档数据(player)已加载完毕
    setTimeout(() => {
        if (window.GatherSystem) {
            GatherSystem.updateButtonState();
        }
    }, 500);
});