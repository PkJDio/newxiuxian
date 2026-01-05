// js/modules/archive.js
// 存档管理系统：支持深层合并，防止旧档缺字段
console.log("加载 存档系统");

const ArchiveSystem = {


    /**
     * 保存游戏
     */
    saveGame: function() {
        if (!window.player) return;
        try {
            const dataStr = JSON.stringify(window.player);
            localStorage.setItem(SAVE_KEY, dataStr);
            console.log("游戏已自动保存");
        } catch (e) {
            console.error("保存失败 (可能是空间不足):", e);
        }
    },

    /**
     * 读取游戏 (核心逻辑)
     */
    loadGame: function() {
        try {
            const dataStr = localStorage.getItem(SAVE_KEY);
            if (!dataStr) return false;

            const savedData = JSON.parse(dataStr);

            // 【核心】如果有模板，进行深层合并
            if (window.PLAYER_TEMPLATE) {
                // 1. 先根据模板创建一个全新的满血满状态对象
                // 这样能确保新版本增加的字段（比如 fatigue）都有默认值
                window.player = JSON.parse(JSON.stringify(window.PLAYER_TEMPLATE));

                // 2. 将存档里的旧数据覆盖进去
                this._deepMerge(window.player, savedData);
            } else {
                // 如果没有模板（不建议），直接读取
                console.warn("未找到 PLAYER_TEMPLATE，直接读取存档，可能导致字段缺失");
                window.player = savedData;
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
     * 辅助：深度合并对象
     * 作用：把 source(旧档) 的值覆盖到 target(新模板) 上。
     * 如果 source 里没有的字段，保留 target 里的默认值。
     */
    _deepMerge: function(target, source) {
        for (const key in source) {
            // 如果是对象（且不是数组），递归合并
            if (source[key] instanceof Object && key in target && !(source[key] instanceof Array)) {
                this._deepMerge(target[key], source[key]);
            } else {
                // 否则直接覆盖
                target[key] = source[key];
            }
        }
    }
};

// 暴露全局接口，覆盖旧的方法
window.saveGame = function() { ArchiveSystem.saveGame(); };
window.loadGame = function() { return ArchiveSystem.loadGame(); };
