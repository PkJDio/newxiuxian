// js/modules/archive.js
// 存档管理系统：支持深层合并 + 版本控制 (修复版：直接注入Player)
//console.log("加载 存档系统 (Version Injected)");

const ArchiveSystem = {
    // 默认存档键名
    DEFAULT_KEY: "xiuxian_save_data_v1",

    // 【配置】当前游戏版本号 (格式 X.Y)
    // X (大版本): 变动时会清空存档
    // Y (小版本): 变动时兼容旧存档
    CURRENT_VERSION: "4.0",

    /**
     * 获取存档键
     */
    getKey: function() {
        return (typeof SAVE_KEY !== 'undefined') ? SAVE_KEY : this.DEFAULT_KEY;
    },

    /**
     * 保存游戏
     */
    saveGame: function() {
        if (!window.player) return;
        try {
            // 1. 数据清洗 (保持原有逻辑)
            if (window.player.defeatedEnemies && Array.isArray(window.player.defeatedEnemies)) {
                console.warn("[Archive] 检测到 defeatedEnemies 为数组，正在修正为对象...");
                window.player.defeatedEnemies = { ...window.player.defeatedEnemies };
            }

            // 【核心修改】直接将版本号写入 player 对象，而不是包一层
            window.player.version = this.CURRENT_VERSION;

            const dataStr = JSON.stringify(window.player);
            localStorage.setItem(this.getKey(), dataStr);
            //console.log("[Archive] 游戏已保存 (v" + this.CURRENT_VERSION + ")");

            // if(window.showToast) window.showToast("游戏已保存");
        } catch (e) {
            console.error("保存失败 (可能是空间不足):", e);
            if(window.showToast) window.showToast("保存失败，空间不足");
        }
    },

    /**
     * 读取游戏
     */
    loadGame: function() {
        try {
            const key = this.getKey();
            const dataStr = localStorage.getItem(key);
            if (!dataStr) {
                //console.log("[Archive] 未找到存档");
                return false;
            }

            // 解析存档 (这里直接就是 player 数据结构)
            const savedData = JSON.parse(dataStr);

            // 【核心修改】直接从对象中读取 version
            // 如果是旧档没有这个字段，默认为 "0.0"
            const saveVer = savedData.version || "0.0";

            // 检查大版本兼容性
            if (!this._checkVersion(saveVer)) {
                console.warn(`[Archive] 版本不兼容 (存档:v${saveVer} -> 当前:v${this.CURRENT_VERSION})`);
                alert(`游戏大版本更新 (v${this.CURRENT_VERSION})，旧存档已失效，请重新开始旅程。`);
                this.resetGame();
                return false; // 返回 false 让 main.js 重新初始化
            }

            // --- 以下是原有的合并逻辑 (保持不变) ---

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

            //console.log("读取存档成功", window.player);

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
     * 【新增】重置/清空存档
     */
    resetGame: function() {
        localStorage.removeItem(this.getKey());
        //console.log("[Archive] 存档已清除");
    },

    /**
     * 【新增】检查版本兼容性
     * 规则：大版本号 (X) 变动则不兼容
     */
    _checkVersion: function(saveVer) {
        const curParts = this.CURRENT_VERSION.split('.');
        const saveParts = (saveVer || "0.0").split('.');

        const curMajor = parseInt(curParts[0]) || 0;
        const saveMajor = parseInt(saveParts[0]) || 0;

        // 如果当前大版本号 > 存档大版本号，则不兼容 (例如 2.0 > 1.5)
        if (curMajor > saveMajor) {
            return false;
        }
        return true;
    },

    /**
     * 辅助：深度合并对象 (保持原样)
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
            if (isSourcePlainObj && isTargetPlainObj) {
                this._deepMerge(tVal, sVal);
            } else {
                // 否则直接覆盖
                if (sVal !== undefined) {
                    target[key] = sVal;
                }
            }
        }
    }
};

// 暴露全局接口，覆盖旧的方法
window.saveGame = function() { ArchiveSystem.saveGame(); };
window.loadGame = function() { return ArchiveSystem.loadGame(); };