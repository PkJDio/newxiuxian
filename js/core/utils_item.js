// js/core/utils_item.js
// 物品核心逻辑工具箱 (修复物品使用效果：恢复/永久属性/Buff)
//console.log("加载 物品工具类");

const UtilsItem = {
    // 获取书籍状态
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

    // 获取技能等级名称
    getSkillLimitName: function(level) {
        if (window.SKILL_CONFIG && window.SKILL_CONFIG.levelNames) {
            return window.SKILL_CONFIG.levelNames[level] || `Lv.${level}`;
        }
        return `Lv.${level}`;
    },

    // 物品类型 -> 装备槽位
    getEquipSlot: function(itemType) {
        switch (itemType) {
            case 'weapon': return 'weapon';
            case 'head': return 'head';
            case 'body': return 'body';
            case 'feet': return 'feet';
            case 'mount': return 'mount';
            case 'fishing_rod': return 'fishing_rod';
            case 'tool': return 'weapon'; // 工具暂用武器槽
            default: return null;
        }
    },

    /* ================= 动作逻辑 ================= */

    /**
     * 使用物品 (吃丹药/食物)
     * 【核心修复】实现恢复、永久加成、临时Buff
     */
    /**
     * 使用物品 (吃丹药/食物)
     * 【核心修改】支持 studyEff 研读效率 Buff 及多属性复合 Buff
     */
    useItem: function(inventoryIndex) {
        const itemSlot = player.inventory[inventoryIndex];
        if (!itemSlot) return;

        const item = GAME_DB.items.find(i => i.id === itemSlot.id);
        if (!item) return;

        // 1. 类型检查
        if (item.type === 'book') {
            if (window.showToast) window.showToast(`请在主界面选择 [研读] 来阅读 ${item.name}`);
            return;
        }

        if (!['food', 'pill', 'foodMaterial', 'herb'].includes(item.type)) {
            if (window.showToast) window.showToast("该物品无法直接使用");
            return;
        }

        // 2. 应用效果
        let applied = false;
        let msg = `使用了 ${item.name}`;

        if (item.effects) {
            const eff = item.effects;

            // A. 基础恢复 (HP/MP/饱食度)
            if (eff.hp) {
                player.status.hp = Math.min(player.derived.hpMax, player.status.hp + eff.hp);
                applied = true;
            }
            if (eff.mp) {
                player.status.mp = Math.min(player.derived.mpMax, player.status.mp + eff.mp);
                applied = true;
            }
            if (eff.hunger) {
                player.status.hunger = Math.min(player.derived.hungerMax, player.status.hunger + eff.hunger);
                applied = true;
            }

            // B. 丹毒 (Toxicity)
            if (eff.toxicity) {
                if(player.status.toxicity === undefined) player.status.toxicity = 0;
                player.status.toxicity += eff.toxicity;
                if(player.status.toxicity < 0) player.status.toxicity = 0;
                applied = true;
            }

            // C. 永久属性加成 (exAttr)
            const permAttrs = ['jing', 'qi', 'shen', 'atk', 'def', 'speed', 'hpMax', 'mpMax'];
            permAttrs.forEach(key => {
                if (eff[key]) {
                    if (!player.exAttr) player.exAttr = {};
                    if (!player.exAttr[key]) player.exAttr[key] = 0;
                    player.exAttr[key] += eff[key];
                    applied = true;
                }
            });

            // D. 临时 Buff (buff) - 【核心逻辑修复】
            if (eff.buff) {
                const b = eff.buff;
                if (b.attr && b.val && b.days) {
                    if (!player.buffs) player.buffs = {};

                    // 1. 准备基础数据结构
                    // 这里存储原始的 attr 和 val 字符串，供后续解析（如 studyEff）
                    const newBuff = {
                        name: item.name,
                        days: b.days,
                        attr: b.attr,
                        val: b.val,
                        isDebuff: false,
                        desc: item.desc || ""
                    };

                    // 2. 存储/覆盖 BUFF
                    // 使用 item.id 作为唯一 Key 确保同类丹药刷新时间
                    player.buffs[item.id] = newBuff;

                    applied = true;
                }
            }
        }

        // 3. 消耗物品
        if (applied || item.type === 'food') {
            itemSlot.count--;
            if (itemSlot.count <= 0) {
                player.inventory.splice(inventoryIndex, 1);
            }

            if (window.showToast) window.showToast(msg);

            // 4. 刷新状态
            if (window.recalcStats) window.recalcStats();
            this._refreshAllUI();

            // 5. 自动保存
            if (window.saveGame) window.saveGame();
        } else {
            if (window.showToast) window.showToast("使用了，但似乎没什么效果");
        }
    },

    /**
     * 装备物品
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

        // 2. 检查属性要求 (使用 derived)
        if (item.req) {
            const currentStats = player.derived || player.attr || {};
            for (let key in item.req) {
                const reqVal = item.req[key];
                const myVal = currentStats[key] || 0;

                if (myVal < reqVal) {
                    const attrName = (typeof ATTR_MAPPING !== 'undefined' ? ATTR_MAPPING[key] : key);
                    if(window.showToast) window.showToast(`修为不足：${attrName}需达到 ${reqVal}`);
                    return;
                }
            }
        }

        // 3. 执行装备逻辑
        if (!player.equipment) player.equipment = {};
        const oldEquipId = player.equipment[slot];

        // 卸下旧的 (自动回包)
        if (oldEquipId) {
            if (window.UtilsAdd) window.UtilsAdd.addItem(oldEquipId, 1);
        }

        player.equipment[slot] = item.id;

        // 扣除新的
        itemSlot.count--;
        if (itemSlot.count <= 0) {
            player.inventory.splice(inventoryIndex, 1);
        }

        if (window.showToast) window.showToast(`装备了 ${item.name}`);
        if (window.recalcStats) window.recalcStats();

        this._refreshAllUI();

        // 存档
        if (window.saveGame) window.saveGame();
    },

    /**
     * 卸下物品
     */
    unequipItem: function(slotKey) {
        if (!player.equipment || !player.equipment[slotKey]) return;
        const itemId = player.equipment[slotKey];

        if (window.UtilsAdd) window.UtilsAdd.addItem(itemId, 1);
        player.equipment[slotKey] = null;

        if (window.recalcStats) window.recalcStats();
        this._refreshAllUI();

        if (window.saveGame) window.saveGame();
    },

    discardItem: function(inventoryIndex) {
        if (!confirm("确定要丢弃该物品吗？")) return;
        player.inventory.splice(inventoryIndex, 1);
        this._refreshAllUI();
        if (window.saveGame) window.saveGame();
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
        if (window.saveGame) window.saveGame();
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
            if (window.saveGame) window.saveGame();
        }
    },

    _refreshAllUI: function() {
        if (window.refreshBagUI) window.refreshBagUI();
        if (window.updateUI) window.updateUI();
    }
};

window.UtilsItem = UtilsItem;