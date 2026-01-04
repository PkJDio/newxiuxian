// js/core/utils_item.js

console.log("加载 物品工具类");

const UtilsItem = {
    getBookStatus: function(itemId) {
        if (player.skills && player.skills[itemId]) {
            return { text: "已学会", color: "#4caf50", isLearned: true };
        }
        const progress = (player.bookProgress && player.bookProgress[itemId]) || 0;
        if (progress > 0) {
            return { text: `研读中: ${progress}`, color: "#2196f3", isReading: true };
        }
        return { text: "未读", color: "#999", isUnread: true };
    },

    getSkillLimitName: function(level) {
        if (window.SKILL_CONFIG && window.SKILL_CONFIG.levelNames) {
            return window.SKILL_CONFIG.levelNames[level] || `Lv.${level}`;
        }
        return `Lv.${level}`;
    },

    getEquipSlot: function(itemType) {
        switch (itemType) {
            case 'weapon': return 'weapon';
            case 'head': return 'head';
            case 'body': return 'body';
            case 'feet': return 'feet';
            case 'mount': return 'mount';
            case 'fishing_rod': return 'fishing_rod';
            case 'tool': return 'weapon';
            default: return null;
        }
    },

    /* ================= 动作逻辑 ================= */

    useItem: function(inventoryIndex) {
        const itemSlot = player.inventory[inventoryIndex];
        if (!itemSlot) return;
        const item = GAME_DB.items.find(i => i.id === itemSlot.id);
        if (!item) return;
        console.log(`使用物品: ${item.name}`);
        let consumed = true;
        if (item.type === 'book') {
            consumed = false;
            if (window.showToast) window.showToast(`请在主界面选择 [研读] 来阅读 ${item.name}`);
        } else if (['food', 'pill', 'foodMaterial', 'herb'].includes(item.type)) {
            if (window.showToast) window.showToast(`使用了 ${item.name}`);
        } else {
            if (window.showToast) window.showToast("该物品无法直接使用");
            consumed = false;
        }
        if (consumed) {
            itemSlot.count--;
            if (itemSlot.count <= 0) {
                player.inventory.splice(inventoryIndex, 1);
            }
            if (window.recalcStats) window.recalcStats();
            this._refreshAllUI();
        }
    },

    /**
     * 装备物品
     * 【新增】装备要求检查
     */
    /**
     * 装备物品
     * 【修正】装备要求检查 (使用 player.derived 最终属性)
     */
    equipItem: function(inventoryIndex) {
        const itemSlot = player.inventory[inventoryIndex];
        const item = GAME_DB.items.find(i => i.id === itemSlot.id);
        if (!item) return;

        // 1. 检查装备槽位
        const slot = this.getEquipSlot(item.type);
        if (!slot) {
            if (window.showToast) window.showToast("此物品无法装备");
            return;
        }

        // 2. 【核心修正】检查属性要求
        if (item.req) {
            // 使用最终计算后的属性 (derived)，而非基础属性 (attr)
            // 如果 derived 还没计算过，兜底用 attr
            const currentStats = player.derived || player.attr || {};

            for (let key in item.req) {
                const reqVal = item.req[key];
                const myVal = currentStats[key] || 0;

                if (myVal < reqVal) {
                    // 获取中文属性名
                    const attrName = (typeof ATTR_MAPPING !== 'undefined' ? ATTR_MAPPING[key] : key);
                    if(window.showToast) window.showToast(`修为不足：${attrName}需达到 ${reqVal}`);
                    return; // 属性不足，中止装备
                }
            }
        }

        // 3. 执行装备逻辑
        if (!player.equipment) player.equipment = {};
        const oldEquipId = player.equipment[slot];
        if (oldEquipId) {
            UtilsAdd.addItem(oldEquipId, 1);
        }
        player.equipment[slot] = item.id;
        itemSlot.count--;
        if (itemSlot.count <= 0) {
            player.inventory.splice(inventoryIndex, 1);
        }
        if (window.showToast) window.showToast(`装备了 ${item.name}`);
        if (window.recalcStats) window.recalcStats();
        this._refreshAllUI();
    },

    unequipItem: function(slotKey) {
        if (!player.equipment || !player.equipment[slotKey]) return;
        const itemId = player.equipment[slotKey];
        UtilsAdd.addItem(itemId, 1);
        player.equipment[slotKey] = null;
        if (window.recalcStats) window.recalcStats();
        this._refreshAllUI();
    },

    discardItem: function(inventoryIndex) {
        if (!confirm("确定要丢弃该物品吗？")) return;
        player.inventory.splice(inventoryIndex, 1);
        this._refreshAllUI();
    },

    /* ================= 批量操作逻辑 ================= */

    sortInventory: function() {
        if (!player.inventory || player.inventory.length === 0) {
            if(window.showToast) window.showToast("行囊空空如也");
            return;
        }
        const typeOrder = {
            'weapon': 10, 'head': 11, 'body': 12, 'feet': 13, 'mount': 14, 'fishing_rod': 15, 'tool': 16,
            'pill': 20, 'food': 21, 'book': 22, 'herb': 23,
            'material': 30, 'foodMaterial': 31
        };
        player.inventory.sort((a, b) => {
            const itemA = GAME_DB.items.find(i => i.id === a.id);
            const itemB = GAME_DB.items.find(i => i.id === b.id);
            if (!itemA || !itemB) return 0;
            const tA = typeOrder[itemA.type] || 99;
            const tB = typeOrder[itemB.type] || 99;
            if (tA !== tB) return tA - tB;
            if (itemA.rarity !== itemB.rarity) return itemB.rarity - itemA.rarity;
            const pA = itemA.value || itemA.price || 0;
            const pB = itemB.value || itemB.price || 0;
            if (pA !== pB) return pB - pA;
            return itemA.id.localeCompare(itemB.id);
        });
        if(window.showToast) window.showToast("行囊已整备完毕");
        this._refreshAllUI();
    },

    discardMultipleItems: function(indices) {
        if (!player.inventory) return;
        const indexSet = new Set(indices);
        if (indexSet.size === 0) return;
        const initialCount = player.inventory.length;
        player.inventory = player.inventory.filter((_, index) => !indexSet.has(index));
        const deletedCount = initialCount - player.inventory.length;
        if (deletedCount > 0) {
            if(window.showToast) window.showToast(`已批量丢弃 ${deletedCount} 样物品`);
            this._refreshAllUI();
        }
    },

    _refreshAllUI: function() {
        if (window.refreshBagUI) window.refreshBagUI();
        if (window.updateUI) window.updateUI();
    }
};

window.UtilsItem = UtilsItem;