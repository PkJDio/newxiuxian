// js/core/utils_item.js
// 物品核心逻辑工具箱 v5.2 (Deterministic SID / Log Optimized)
console.log("加载 物品工具箱 (Log Optimized v5.2)");

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
    // 2. 使用物品 (基于 SID)
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

        // 应用效果
        const consumed = this._applyItemEffect(itemSlot);

        // 消耗逻辑
        if (consumed) {
            this.removeItem(sid, amount);

            // 【日志优化部分】
            if (window.LogManager && window.LogManager.add) {
                const rarityColors = { 1: "#2D2B2BFF", 2: "#2ecc71", 3: "#3498db", 4: "#9b59b6", 5: "#f1c40f", 6: "#e74c3c" };
                const color = rarityColors[itemSlot.rarity] || "#2d2b2b";

                let verb = "使用了";
                switch (itemSlot.type) {
                    case 'food':
                    case 'foodMaterial':
                    case 'fish': // 【新增】在这里添加 fish 类型
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
                player.money+=eff.money;
                msg += `获得了 ${eff.money} 文 `;
                applied = true;
            }


            // A. 基础恢复
            if (eff.hp) {
                player.derived.hp = Math.min(player.derived.hpMax, player.derived.hp + eff.hp);
                if( eff.hp>0){
                    msg += `生命回复${eff.hp} `;
                }else if( eff.hp<0){
                    msg += `生命减少${Math.abs(eff.hp)} `;
                }

                applied = true;
            }
            if (eff.mp) {
                player.derived.mp = Math.min(player.derived.mpMax, (player.derived.mp||0) + eff.mp);
                if(eff.mp>0){
                    msg += `灵力回复${eff.mp} `;
                }else{
                    msg += `灵力减少-${Math.abs(eff.mp)} `;
                }
                applied = true;
            }
            if (eff.hunger) {
                if (!player.status) player.status = {};

                // 获取饱食度上限，如果 derived 中不存在则默认为 100
                const maxHunger = (player.derived && player.derived.hungerMax) ? player.derived.hungerMax : 100;

                // 使用动态上限进行截断
                player.status.hunger = Math.min(maxHunger, (player.status.hunger || 0) + eff.hunger);

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
            permAttrs.forEach(key => {
                if (eff[key]) {
                    if (!player.exAttr) player.exAttr = {};
                    if (!player.exAttr[key]) player.exAttr[key] = 0;
                    player.exAttr[key] += eff[key];
                    attrChanged = true;
                    applied = true;
                }
            });
            if (attrChanged) msg += "属性提升 ";

            // D. Buff
            // D. 临时 Buff (buff)
            // D. 临时 Buff (buff)
            // 【核心修改】支持复合属性分割与分别添加
            if (eff.buff) {
                const b = eff.buff;
                if (b.attr && b.val && b.days) {
                    if (!player.buffs) player.buffs = {};

                    // 1. 将 attr 和 val 转为字符串并用 '_' 分割
                    const attrs = String(b.attr).split('_');
                    const vals = String(b.val).split('_');
                    const days = b.days; // 天数共享

                    // 2. 遍历所有属性并添加
                    attrs.forEach((subAttr, index) => {
                        // 防止 val 数量少于 attr 数量，缺省取第一个
                        const subVal = vals[index] !== undefined ? vals[index] : vals[0];

                        // 3. 生成唯一 Key
                        // 如果是单属性，使用 item.id (兼容旧逻辑)
                        // 如果是多属性，使用 item.id + "_" + subAttr (防止Key冲突)
                        const buffKey = attrs.length > 1 ? `${item.id}_${subAttr}` : item.id;

                        const newBuff = {
                            name: item.name,
                            days: days,
                            attr: subAttr,
                            val: Number(subVal), // 确保转为数字
                            isDebuff: false,
                            desc: item.desc || ""
                        };

                        player.buffs[buffKey] = newBuff;
                    });

                    applied = true;
                }
            }
        }

        if (applied) {
            if (msg && window.showToast) window.showToast(msg);
            return true;
        }

        // 【修改】允许 food 和 fish 类型即便没有 effects 也能被消耗并提示味道不错
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
        // 1. 通过 SID 查找背包
        const inventoryIndex = player.inventory.findIndex(slot => slot.sid === sid);

        if (inventoryIndex === -1) {
            if (window.showToast) window.showToast("背包中未找到该装备");
            return;
        }

        const itemSlot = player.inventory[inventoryIndex];

        // 2. 检查槽位
        const slot = this.getEquipSlot(itemSlot.type);
        if (!slot) {
            if (window.showToast) window.showToast("此物品无法装备");
            return;
        }

        // 3. 检查属性要求
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

        // 4. 执行装备
        if (!player.equipment) player.equipment = {};

        // 卸下旧装备 (回包)
        const oldEquip = player.equipment[slot];
        if (oldEquip) {
            // 旧装备直接 addItem，系统会重新计算它的 SID 并尝试堆叠
            this.addItem(oldEquip, 1);
        }

        // 装备新物品 (深拷贝)
        player.equipment[slot] = JSON.parse(JSON.stringify(itemSlot));

        // 5. 从背包移除 1 个
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

        const item = player.equipment[slotKey]; // 完整对象

        // 回包 (addItem 会处理 SID 和堆叠)
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
     * @param {Array<string>} sids - SID 数组 [sid1, sid2, ...]
     */
    discardMultipleItems: function(sids) {
        console.log("批量丢弃: ", sids)
        if (!player.inventory || !sids || sids.length === 0) return;

        let deletedCount = 0;
        const sidSet = new Set(sids);

        // 遍历背包移除
        // 使用 filter 方式一次性移除更高效
        const initialLen = player.inventory.length;
        player.inventory = player.inventory.filter(item => {
            if (sidSet.has(item.sid)) {
                // 如果在删除列表中，直接移除 (视为全部丢弃)
                // 如果需要支持部分丢弃，逻辑会更复杂，目前批量丢弃通常是全丢
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

    // 兼容旧接口
    useItemById: function(itemId) {
        // 尝试在背包中找一个匹配ID的物品SID来使用
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

            // 属性相同的物品 SID 相同，自然排在一起
            return (a.sid || "").localeCompare(b.sid || "");
        });

        if (window.showToast) window.showToast("背包已整理");
        this._refreshAllUI();
        if (window.saveGame) window.saveGame();
    },
    // ============================================================
    // 【新增】背包数据校对 (存档加载后调用)
    // ============================================================
    checkBagData: function() {
        if (!player.inventory || player.inventory.length === 0) return;

        // console.log("[UtilsItem] 开始校对背包数据...");
        let needFix = false;
        let needSave=false;

        // 检查是否有数据需要修复 (没有 sid 或者 sid 格式不对)
        for (let item of player.inventory) {
            if (!item.sid || !item.sid.startsWith('sid_')) {
                needFix = true;
                break;
            }
            //总物品库里根据id获取物品，如果获取不到的话，则移除该物品
            const itemData = GAME_DB.items.find(i => i.id === item.id);
            if (!itemData || itemData===undefined || itemData===null) {
                needSave=true;
                continue;
            }else {
                if (itemData.type === 'fish' && item.type !== 'fish') {
                    needUpdateFish=true;
                }
            }


            //检查鱼的问题，把鱼的数据从type=food改成type=fish
        }

        if (needSave) {
            // 1. 深拷贝备份旧数据，防止引用问题
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
            // console.log("[UtilsItem] 发现旧格式数据，正在重组背包...");
            // 1. 深拷贝备份旧数据，防止引用问题
            const oldItems = JSON.parse(JSON.stringify(player.inventory));

            // 2. 清空当前背包，准备重新填充
            player.inventory = [];

            // 3. 重新添加
            oldItems.forEach(item => {
                const count = item.count || 1;
                if (item.id) {
                    // 【核心修改】这里只传入 item.id (字符串)
                    // addItem 内部检测到字符串后，会自动从 GAME_DB 获取最新的完整物品数据
                    // 然后自动生成 Deterministic SID 并执行堆叠逻辑
                    this.addItem(item.id, count);
                }
            });

            // console.log("[UtilsItem] 背包数据重组完成。");

            // 4. 修复完成后立即保存并刷新
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