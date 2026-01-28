// js/core/utils_item.js
// 物品核心逻辑工具箱 v5.3 (适配凡尘任务监听)
console.log("加载 物品工具箱 (Log Optimized v5.3)");

const UtilsItem = {
    // ============================================================
    // 内部私有方法：根据内容生成唯一的 32位 Hex SID
    // ============================================================
    _generateDeterministicSid: function(obj) {
        // 1. 递归排序所有 Key，同时排除掉 sid 等干扰字段
        function sortObject(item) {
            if (typeof item !== 'object' || item === null) return item;
            if (Array.isArray(item)) return item.map(sortObject);

            return Object.keys(item)
                .sort()
                .reduce((acc, key) => {
                    // 【核心修改】排除 sid 和 count 字段，确保只针对物品原始属性加密
                    if (key !== 'sid' && key !== 'count') {
                        acc[key] = sortObject(item[key]);
                    }
                    return acc;
                }, {});
        }

        // 得到一个不含 sid 且 key 排序一致的字符串
        const sortedStr = JSON.stringify(sortObject(obj));

        // 2. 快速哈希计算 (Times33 算法变体)
        let hash = 0;
        for (let i = 0; i < sortedStr.length; i++) {
            const char = sortedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }

        // 转为 16 进制字符串，并加上前缀
        return 'sid_' + (hash >>> 0).toString(16);
    },

    // ============================================================
    // 1. 添加物品 (核心逻辑：增加背包上限 space 检查)
    // ============================================================
    addItem: function(itemInput, amount = 1) {
        if (!window.player) return;
        if (!player.inventory) player.inventory = [];

        let newItemData = null;

        // 解析输入
        if (typeof itemInput === 'string') {
            if (window.GAME_DB && window.GAME_DB.items) {
                const tmpl = window.GAME_DB.items.find(i => i.id === itemInput);
                if (tmpl) {
                    newItemData = JSON.parse(JSON.stringify(tmpl));
                } else {
                    console.error(`[UtilsItem] 未找到物品ID: ${itemInput}`);
                    return;
                }
            }
        } else if (typeof itemInput === 'object') {
            newItemData = JSON.parse(JSON.stringify(itemInput));
        }

        if (!newItemData) return;

        // 计算确定性 SID
        const sid = this._generateDeterministicSid(newItemData);
        newItemData.sid = sid;

        // 检查背包中是否已有该 SID (用于判定是否需要新格子)
        const existingSlot = player.inventory.find(slot => slot.sid === sid);

        // 【新增核心：背包空间检查】
        // 只有在“需要开新格子”且“当前格子数 >= 上限”时，判定为满
        const currentSpace = player.derived && player.derived.space ? player.derived.space : 50; // 默认50
        if (!existingSlot && player.inventory.length >= currentSpace) {
            if (window.showToast) {
                window.showToast(`背包已满！${newItemData.name} x${amount} 已遗失。`, 3000);
            }
            if (window.LogManager && window.LogManager.add) {
                window.LogManager.add(`<span style="color:#e74c3c">由于背包空间不足，${newItemData.name} x${amount} 已遗失！</span>`);
            }
            return null;
        }

        // 执行添加逻辑
        if (existingSlot) {
            existingSlot.count = (existingSlot.count || 0) + amount;
        } else {
            newItemData.count = amount;
            player.inventory.push(newItemData);
        }

        if (window.showToast) window.showToast(`获得了 ${newItemData.name} x${amount}`);

        // 【新增：不足5格空间提醒】
        const remainingSpace = currentSpace - player.inventory.length;

        if (remainingSpace <= 3 && remainingSpace > 0) {
            if (window.showWarningModal) {
                window.showWarningModal("警告",`背包空间仅剩 ${remainingSpace} 格！背包格子满了之后，多余物品将直接无法获得`);
            }
        }

        this._refreshAllUI();
        if (window.saveGame) window.saveGame();

        return newItemData;
    },

    // ============================================================
    // 2. 使用物品 (基于 SID) - 【核心修改区域】
    // ============================================================
    useItem: function(sid, amount = 1) {
        if (!player.inventory) return;

        // 通过 SID 精确定位
        const slotIndex = player.inventory.findIndex(i => i.sid === sid);

        if (slotIndex === -1) {
            if (window.showToast) window.showToast("物品不存在或已消耗");
            return;
        }

        let itemSlot = player.inventory[slotIndex];

        // 检查类型 (书本)
        if (itemSlot.type === 'book') {
            if (window.showToast) window.showToast(`请在主界面选择 [研读] 来阅读 ${itemSlot.name}`);
            return;
        }

        // 检查类型 (装备)
        if (this.getEquipSlot(itemSlot.type)) {
            if (window.showToast) window.showToast("请点击 [装备] 按钮进行穿戴");
            return;
        }

        // 数量检查
        if (itemSlot.count < amount) {
            if (window.showToast) window.showToast("数量不足");
            return;
        }

        // 【新增】保存一份 item 数据副本用于任务检查
        // 因为后面调用 removeItem 后，inventory 里的引用可能会消失或 count 归零，导致任务无法获取准确信息
        const itemDataForTask = JSON.parse(JSON.stringify(itemSlot));

        // 应用效果
        const consumed = this._applyItemEffect(itemSlot);

        // 消耗逻辑
        if (consumed) {
            this.removeItem(sid, amount);

            // ============================================================
            // 【核心修改】物品使用任务触发 (防御丹/吃鱼)
            // ============================================================
            if (window.UtilsMortalTask) {
                // 传入物品数据供任务系统检查类型(type)和稀有度(rarity)和属性(effects.def)
                // 对应 data_mortal.js 中的 params 配置
                window.UtilsMortalTask.updateProgress('use_specific_item', amount, { item: itemDataForTask });
            }
            // ============================================================

            // 【日志优化部分】
            if (window.LogManager && window.LogManager.add) {
                const rarityColors = { 1: "#2D2B2BFF", 2: "#2ecc71", 3: "#3498db", 4: "#9b59b6", 5: "#f1c40f", 6: "#e74c3c" };
                const color = rarityColors[itemSlot.rarity] || "#2d2b2b";

                let verb = "使用了";
                switch (itemSlot.type) {
                    case 'food':
                    case 'foodMaterial':
                    case 'fish':
                        verb = "享用了";
                        break;
                    case 'pill':
                        verb = "炼化了";
                        break;
                    case 'herb':
                        verb = "吞服了";
                        break;
                    case 'wine':
                        verb = "畅饮了";
                        break;
                    default:
                        verb = "使用了";
                }

                window.LogManager.add(`你${verb} <span style="color:${color}">${itemSlot.name}</span>。`);
            }
        }
        saveGame();
    },

    // 内部方法：应用效果
    _applyItemEffect: function(item) {
        let applied = false;
        let msg = "";

        if (item.effects) {
            const eff = item.effects;
            //如果是得到钱
            if(eff.money){
                UtilsMoney.addMoney(eff.money)
                msg += `获得了 ${eff.money} 文 `;
                applied = true;
            }

            // A. 基础恢复
            if (eff.hp) {
                if (!player.status) player.status = {};
                const maxHp = (player.derived && player.derived.hpMax) ? player.derived.hpMax : 100;
                player.status.hp = Math.min(maxHp, (player.status.hp || 0) + eff.hp);

                if( eff.hp > 0){
                    msg += `生命回复${eff.hp} `;
                } else if( eff.hp < 0){
                    msg += `生命减少${Math.abs(eff.hp)} `;
                }
                applied = true;
            }

            if (eff.mp) {
                if (!player.status) player.status = {};
                const maxMp = (player.derived && player.derived.mpMax) ? player.derived.mpMax : 100;
                player.status.mp = Math.min(maxMp, (player.status.mp || 0) + eff.mp);

                if(eff.mp > 0){
                    msg += `法力回复${eff.mp} `;
                } else {
                    msg += `法力减少${Math.abs(eff.mp)} `;
                }
                applied = true;
            }
            if (eff.hunger) {
                if (!player.status) player.status = {};
                const maxHunger = (player.derived && player.derived.hungerMax) ? player.derived.hungerMax : 100;

                UtilsAttribute.addHunger(eff.hunger);
                if (eff.hunger > 0) {
                    msg += `饱食度增加 ${eff.hunger} 点 `;
                } else if (eff.hunger < 0) {
                    msg += `饱食度减少 ${Math.abs(eff.hunger)} 点 `;
                }
                applied = true;
            }

            // B. 丹毒
            if (eff.toxicity) {
                player.toxicity = Math.max(0, (player.toxicity || 0) + eff.toxicity);
                msg += (eff.toxicity > 0) ? `中毒+${eff.toxicity} ` : `解毒${Math.abs(eff.toxicity)} `;
                applied = true;
            }

            // C. 永久属性
            const permAttrs = ['jing', 'qi', 'shen', 'atk', 'def', 'speed', 'hpMax', 'mpMax'];
            let attrChanged = false;

            // 处理 atk -> phy_atk + mag_atk
            if (eff.atk) {
                if (!player.exAttr) player.exAttr = {};
                player.exAttr.phy_atk = (player.exAttr.phy_atk || 0) + eff.atk;
                player.exAttr.mag_atk = (player.exAttr.mag_atk || 0) + eff.atk;
                attrChanged = true;
            }
            // 处理 def -> phy_def + mag_def
            if (eff.def) {
                if (!player.exAttr) player.exAttr = {};
                player.exAttr.phy_def = (player.exAttr.phy_def || 0) + eff.def;
                player.exAttr.mag_def = (player.exAttr.mag_def || 0) + eff.def;
                attrChanged = true;
            }

            // 处理其余常规属性
            permAttrs.forEach(key => {
                if (key !== 'atk' && key !== 'def' && eff[key]) {
                    if (!player.exAttr) player.exAttr = {};
                    if (!player.exAttr[key]) player.exAttr[key] = 0;
                    player.exAttr[key] += eff[key];
                    attrChanged = true;
                    applied = true;
                }
            });
            if (attrChanged) msg += "属性提升 ";

            // D. 临时 Buff (buff)
            if (eff.buff) {
                const b = eff.buff;
                if (b.attr && b.val && b.days) {
                    if (!player.buffs) player.buffs = {};

                    const attrs = String(b.attr).split('_');
                    const vals = String(b.val).split('_');
                    const days = b.days;

                    attrs.forEach((subAttr, index) => {
                        const subVal = vals[index] !== undefined ? vals[index] : vals[0];

                        let realTargets = [];
                        if (subAttr === 'atk') {
                            realTargets = ['phy_atk', 'mag_atk'];
                        } else if (subAttr === 'def') {
                            realTargets = ['phy_def', 'mag_def'];
                        } else {
                            realTargets = [subAttr];
                        }

                        realTargets.forEach(realAttr => {
                            let buffKey;
                            if (attrs.length === 1 && realTargets.length === 1) {
                                buffKey = item.id;
                            } else {
                                buffKey = `${item.id}_${realAttr}`;
                            }

                            const newBuff = {
                                name: item.name,
                                days: days,
                                attr: realAttr,
                                val: Number(subVal),
                                isDebuff: false,
                                desc: item.desc || ""
                            };

                            player.buffs[buffKey] = newBuff;
                        });
                    });

                    applied = true;
                }
            }
        }

        if (applied) {
            if (msg && window.showToast) window.showToast(msg);
            return true;
        }

        // 允许 food 和 fish 类型即便没有 effects 也能被消耗
        if (item.type === 'food' || item.type === 'fish') {
            if (window.showToast) window.showToast("味道不错");
            return true;
        }

        if (window.showToast) window.showToast("该物品无法直接使用或状态已满");
        return false;
    },

    // ============================================================
    // 3. 装备相关 (基于 SID)
    // ============================================================

    /**
     * 装备物品
     * @param {string} sid 物品SID
     */
    equipItem: function(sid) {
        console.log("装备物品: " + sid)
        const inventoryIndex = player.inventory.findIndex(slot => slot.sid === sid);

        if (inventoryIndex === -1) {
            if (window.showToast) window.showToast("背包中未找到该装备");
            return;
        }

        const itemSlot = player.inventory[inventoryIndex];
        const slot = this.getEquipSlot(itemSlot.type);
        if (!slot) {
            if (window.showToast) window.showToast("此物品无法装备");
            return;
        }

        if (itemSlot.req) {
            const currentStats = player.derived || player.attr || {};
            for (let key in itemSlot.req) {
                const reqVal = itemSlot.req[key];
                const myVal = currentStats[key] || 0;
                if (myVal < reqVal) {
                    if(window.showToast) window.showToast(`修为不足：${key}需达到 ${reqVal}`);
                    return;
                }
            }
        }

        if (!player.equipment) player.equipment = {};

        const oldEquip = player.equipment[slot];
        if (oldEquip) {
            this.addItem(oldEquip, 1);
        }

        player.equipment[slot] = JSON.parse(JSON.stringify(itemSlot));
        this.removeItem(sid, 1);

        if (window.showToast) window.showToast(`装备了 ${itemSlot.name}`);
        this._refreshAllUI();
        if (window.saveGame) window.saveGame();
    },

    /**
     * 卸下物品
     * @param {string} slotKey 装备槽位 (如 'weapon')
     */
    unequipItem: function(slotKey) {
        if (!player.equipment || !player.equipment[slotKey]) return;

        const item = player.equipment[slotKey];
        this.addItem(item, 1);
        player.equipment[slotKey] = null;

        if (window.showToast) window.showToast("已卸下");
        this._refreshAllUI();
        if (window.saveGame) window.saveGame();
    },

    // ============================================================
    // 4. 移除/丢弃逻辑 (基于 SID)
    // ============================================================

    /**
     * 移除指定物品
     * @param {string} sid 物品SID
     * @param {number} amount 数量
     */
    removeItem: function(sid, amount = 1) {
        if (!player.inventory) return false;

        const index = player.inventory.findIndex(item => item.sid === sid);

        if (index !== -1) {
            const item = player.inventory[index];
            item.count -= amount;
            if (item.count <= 0) {
                player.inventory.splice(index, 1);
            }
            this._refreshAllUI();
            return true;
        }
        return false;
    },

    /**
     * 批量丢弃
     */
    discardMultipleItems: function(sids) {
        console.log("批量丢弃: ", sids)
        if (!player.inventory || !sids || sids.length === 0) return;

        let deletedCount = 0;
        const sidSet = new Set(sids);

        const initialLen = player.inventory.length;
        player.inventory = player.inventory.filter(item => {
            if (sidSet.has(item.sid)) {
                return false;
            }
            return true;
        });

        deletedCount = initialLen - player.inventory.length;

        if (deletedCount > 0) {
            if(window.showToast) window.showToast(`已丢弃 ${deletedCount} 样物品`);
            this._refreshAllUI();
            if (window.saveGame) window.saveGame();
        }
    },

    // ============================================================
    // 辅助函数
    // ============================================================

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
            case 'accessory': return 'accessory';
            case 'fishing_rod': return 'fishing_rod';
            case 'tool': return 'weapon';
            default: return null;
        }
    },

    useItemById: function(itemId) {
        if (player.inventory) {
            const item = player.inventory.find(i => i.id === itemId);
            if (item) {
                this.useItem(item.sid, 1);
            }
        }
    },

    sortInventory: function() {
        if (!player.inventory) return;
        const typeOrder = {
            "weapon": 1, "head": 2, "body": 3, "feet": 4, "accessory": 5, "mount": 6,
            "pill": 10, "food": 11, "herb": 12, "material": 20, "book": 30, "tool": 40
        };

        player.inventory.sort((a, b) => {
            const tA = typeOrder[a.type] || 99;
            const tB = typeOrder[b.type] || 99;
            if (tA !== tB) return tA - tB;

            const rA = a.rarity || 1;
            const rB = b.rarity || 1;
            if (rA !== rB) return rB - rA;

            if (a.id !== b.id) return a.id.localeCompare(b.id);
            return (a.sid || "").localeCompare(b.sid || "");
        });

        if (window.showToast) window.showToast("背包已整理");
        this._refreshAllUI();
        if (window.saveGame) window.saveGame();
    },

    // ============================================================
    // 【新增】背包数据校对
    // ============================================================
    checkBagData: function() {
        if (!player.inventory || player.inventory.length === 0) return;

        let needFix = false;
        let needSave=false;

        for (let item of player.inventory) {
            if (!item.sid || !item.sid.startsWith('sid_')) {
                needFix = true;
                break;
            }
            const itemData = GAME_DB.items.find(i => i.id === item.id);
            if (!itemData || itemData===undefined || itemData===null) {
                needSave=true;
                continue;
            }
        }

        if (needSave) {
            const oldItems = JSON.parse(JSON.stringify(player.inventory));
            player.inventory = [];
            oldItems.forEach(item => {
                const itemData = GAME_DB.items.find(i => i.id === item.id);
                if (itemData) {
                    const count = item.count || 1;
                    if (item.sid) {
                        this.addItem(item, count);
                    }else if (item.id) {
                        this.addItem(item.id, count);
                    }
                }
            });
            this._refreshAllUI();
            if (window.saveGame) window.saveGame();
        }

        if (needFix) {
            const oldItems = JSON.parse(JSON.stringify(player.inventory));
            player.inventory = [];
            oldItems.forEach(item => {
                const count = item.count || 1;
                if (item.id) {
                    this.addItem(item.id, count);
                }
            });
            this._refreshAllUI();
            if (window.saveGame) window.saveGame();
        } else {
            console.log("[UtilsItem] 背包数据格式正常。");
        }
    },
    _refreshAllUI: function() {
        if (window.recalcStats) window.recalcStats();
        if (window.refreshBagUI) window.refreshBagUI();
        if (window.updateUI) window.updateUI();
    }
};

window.UtilsItem = UtilsItem;
// 兼容旧接口
window.addItem = function(id, count) { UtilsItem.addItem(id, count); };