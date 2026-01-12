// js/core/utils_add.js
// 资源获取工具类：统一处理物品、金钱、技能的获取与提示
// [Update] 适配 UtilsItem v5.1+，传递完整物品数据对象

const UtilsAdd = {

    /**
     * 添加物品 (核心通用方法)
     * @param {String} itemId 物品ID
     * @param {Number} count 数量
     * @param {Boolean} showToast 是否显示提示 (默认显示)
     * @returns {Boolean} 是否添加成功 (依赖 UtilsItem 返回值)
     */
    addItem: function(itemId, count = 1, showToast = true) {
        // 1. 数据校验
        const db = window.GAME_DB || (typeof GAME_DB !== 'undefined' ? GAME_DB : null);
        if (!db || !db.items) {
            console.error("[UtilsAdd] 错误：物品数据库 (GAME_DB) 未找到！");
            return false;
        }

        // 从数据库获取完整物品数据对象
        const item = db.items.find(i => i.id === itemId);
        if (!item) {
            console.error(`[UtilsAdd] 错误：未找到ID为 ${itemId} 的物品数据！`);
            return false;
        }

        if (typeof player === 'undefined') {
            console.error("[UtilsAdd] 错误：player 对象未定义！");
            return false;
        }

        // 2. 执行添加逻辑
        let success = false;

        // 优先使用 UtilsItem (如果存在)
        if (window.UtilsItem && typeof window.UtilsItem.addItem === 'function') {
            // 【核心修改】这里直接传入查找到的完整 item 对象，而不是 itemId 字符串
            // UtilsItem 会基于这个对象的属性生成 SID 并处理堆叠
            success = window.UtilsItem.addItem(item, count);

            // 注意：如果 UtilsItem.addItem 没有返回值(undefined)，success 为 undefined
            // 这会导致下面的通用 Toast/Save 逻辑跳过，这是预期的，因为 UtilsItem 内部已经处理了 UI 反馈和保存
        } else {
            // 兜底逻辑：直接操作 inventory 数组 (仅存 ID)
            if (!player.inventory) player.inventory = [];

            const existingSlot = player.inventory.find(slot => slot.id === itemId);
            if (existingSlot) {
                existingSlot.count += count;
            } else {
                player.inventory.push({ id: itemId, count: count });
            }
            success = true;

            // 刷新背包UI
            if(window.refreshBagUI) {
                window.refreshBagUI();
            }
        }

        // 3. 处理反馈 & 保存 (仅当 UtilsItem 未接管或显式返回 true 时执行)
        if (success) {
            // A. 更新相关UI
            if(window.updateUI) window.updateUI();

            // B. 弹出提示
            if (showToast) {
                let color = '#333';
                const rarityConfig = window.RARITY_CONFIG || (typeof RARITY_CONFIG !== 'undefined' ? RARITY_CONFIG : null);
                if (rarityConfig && item.rarity && rarityConfig[item.rarity]) {
                    color = rarityConfig[item.rarity].color;
                }
                const msg = `获得：<span style="color:${color}">${item.name}</span> x${count}`;
                if(window.showToast) window.showToast(msg);
            }

            // C. 自动保存
            this._triggerAutoSave();

        } else if (success === false) {
            // 只有显式返回 false 才提示失败，undefined (void) 视为由 UtilsItem 处理完毕
            console.warn("[UtilsAdd] 添加物品失败");
            if (showToast && window.showToast) window.showToast("背包已满，无法获取物品！");
        }

        return success;
    },

    /**
     * 添加金钱
     */
    addMoney: function(amount) {
        if (typeof player === 'undefined') return;

        player.money = (player.money || 0) + amount;

        if(window.updateUI) window.updateUI();

        if(window.showToast) {
            const unit = ""; // 可根据游戏设定修改单位
            const op = amount >= 0 ? "+" : "";
            if(amount != 0){
                window.showToast(`钱财 ${unit} ${op}${amount} `);
            }
        }

        // 自动保存
        this._triggerAutoSave();
    },

    /**
     * 添加技能/功法
     */
    addSkill: function(skillId) {
        if (typeof player === 'undefined') return;

        if (!player.skills) player.skills = {};

        if (player.skills[skillId]) {
            if(window.showToast) window.showToast("你已经学会了该技能，无需重复学习。");
            return;
        }

        const db = window.GAME_DB || {};
        // 尝试从 books 或 skills 查找名称
        let skillName = skillId;
        if(db.items) {
            const book = db.items.find(i => i.id === skillId || (i.effects && i.effects.skillId === skillId));
            if(book) skillName = book.name;
        }

        player.skills[skillId] = {
            level: 0,
            exp: 0,
            mastered: false
        };

        if(window.updateUI) window.updateUI();
        if(window.showToast) window.showToast(`领悟了新功法：<span style="color:#2b58a6">${skillName}</span>`);

        // 自动保存
        this._triggerAutoSave();
    },

    /**
     * 内部方法：触发自动保存
     */
    _triggerAutoSave: function() {
        // 尝试方案1: State.save()
        if (typeof State !== 'undefined' && typeof State.save === 'function') {
            State.save();
            return;
        }

        // 尝试方案2: saveGame()
        if (typeof saveGame === 'function') {
            saveGame();
            return;
        }

        // 尝试方案3: 简单的 localStorage 直接写入
        if (typeof player !== 'undefined' && typeof SAVE_KEY !== 'undefined') {
            try {
                localStorage.setItem(SAVE_KEY, JSON.stringify(player));
            } catch (e) {
                console.error("[UtilsAdd] 保存失败:", e);
            }
        }
    }
};

// 挂载到全局
window.UtilsAdd = UtilsAdd;