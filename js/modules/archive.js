// js/modules/archive.js
// 存档管理系统：支持深层合并，防止旧档缺字段
console.log("加载 存档系统");

const ArchiveSystem = {
    // 默认存档键名（如果 global.js 没定义则用这个兜底）
    DEFAULT_KEY: "xiuxian_save_data",

    /**
     * 获取存档键
     */
    getKey: function() {
        return (typeof SAVE_KEY !== 'undefined') ? SAVE_KEY : this.DEFAULT_KEY;
    },

    /**
     * 保存游戏
     */
    /**
     * 保存游戏
     */
    saveGame: function() {
        if (!window.player) return;
        try {
            // ============================================================
            // 【核心修复】保存前的数据清洗
            // 场景：如果 player.defeatedEnemies 被初始化为 [] (数组)，
            // 但我们往上面挂了 "kill_..." 这种字符串属性，
            // JSON.stringify 会直接忽略这些属性，导致存档丢失。
            // 解决：强制把它转换成纯对象 {}
            // ============================================================
            if (window.player.defeatedEnemies && Array.isArray(window.player.defeatedEnemies)) {
                console.warn("[Archive] 检测到 defeatedEnemies 为数组，正在修正为对象以防止数据丢失...");
                // 利用展开运算符 {...arr} 可以把数组上的所有属性（包括非数字Key）都复制到一个新对象上
                window.player.defeatedEnemies = { ...window.player.defeatedEnemies };
            }

            const dataStr = JSON.stringify(window.player);
            localStorage.setItem(this.getKey(), dataStr);
            console.log("[Archive] 游戏已保存");
        } catch (e) {
            console.error("保存失败 (可能是空间不足):", e);
        }
    },

    /**
     * 读取游戏 (核心逻辑)
     */
    loadGame: function() {
        try {
            const key = this.getKey();
            const dataStr = localStorage.getItem(key);
            if (!dataStr) {
                console.log("[Archive] 未找到存档");
                return false;
            }

            const savedData = JSON.parse(dataStr);

            // 【核心】如果有模板，进行深层合并
            if (window.PLAYER_TEMPLATE) {
                // 1. 先根据模板创建一个全新的满血满状态对象
                window.player = JSON.parse(JSON.stringify(window.PLAYER_TEMPLATE));

                // 2. 将存档里的旧数据覆盖进去
                this._deepMerge(window.player, savedData);
            } else {
                console.warn("未找到 PLAYER_TEMPLATE，直接读取存档，可能导致字段缺失");
                window.player = savedData;
            }

            // 补丁：确保 defeatedEnemies 是对象而不是 null/undefined
            if (!window.player.defeatedEnemies) {
                window.player.defeatedEnemies = {};
            }

            console.log("读取存档成功", window.player);

            // 3. 恢复后的刷新
            if (window.recalcStats) window.recalcStats();
            if (window.updateUI) window.updateUI();

            return true;
        } catch (e) {
            console.error("读取存档出错:", e);
            return false;
        }
    },

    /**
     * 辅助：深度合并对象 (增强版)
     * 修复 BUG：如果模板是数组 [] 但存档是对象 {}，必须强制覆盖，否则 JSON.stringify 会丢失数据
     */
    _deepMerge: function(target, source) {
        for (const key in source) {
            const sVal = source[key];
            const tVal = target[key];

            // 检查源数据是否为“纯对象”（非null，非数组）
            const isSourcePlainObj = sVal && typeof sVal === 'object' && !Array.isArray(sVal);
            // 检查目标数据是否为“纯对象”
            const isTargetPlainObj = tVal && typeof tVal === 'object' && !Array.isArray(tVal);

            // 只有当“源”和“目标”都是纯对象时，才递归合并
            // 这样如果模板手误写成了 defeatedEnemies: []，会被存档里的 {} 覆盖，从而修复保存问题
            if (isSourcePlainObj && isTargetPlainObj) {
                this._deepMerge(tVal, sVal);
            } else {
                // 否则直接覆盖
                target[key] = sVal;
            }
        }
    }
};

// 暴露全局接口，覆盖旧的方法
window.saveGame = function() { ArchiveSystem.saveGame(); };
window.loadGame = function() { return ArchiveSystem.loadGame(); };