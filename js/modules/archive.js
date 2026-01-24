// js/modules/archive.js
// 存档管理系统：支持深层合并 + 版本控制 (修复版：直接注入Player)
//console.log("加载 存档系统 (Version Injected)");

const ArchiveSystem = {
    // 默认存档键名
    DEFAULT_KEY: "xiuxian_save_data_v1",

    // 【配置】当前游戏版本号 (格式 X.Y)
    // X (大版本): 变动时会清空存档
    // Y (小版本): 变动时兼容旧存档
    CURRENT_VERSION: "6.0",

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
            // 2. 注入/更新时间戳
            window.player.update_time = Date.now();

            const dataStr = JSON.stringify(window.player);
            localStorage.setItem(this.getKey(), dataStr);
            //console.log("[Archive] 游戏已保存 (v" + this.CURRENT_VERSION + ")");
// 4. (可选) 这里可以触发 CloudArchive.executeSave(true) 来实现即时静默云备份
            if (window.CloudArchive) CloudArchive.executeSave(true);
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
// ============================================================
            // 【核心修改】数据迁移：将旧属性迁移到新属性
            // ============================================================
            this._migrateAttributes();
            //console.log("读取存档成功", window.player);

            UtilsItem.checkBagData();
            initZhaoshiSystem();


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
     * 【新增】属性迁移逻辑
     * 规则：旧版 atk -> phy_atk, 旧版 def -> phy_def, 法系归 0
     */
    _migrateAttributes: function() {
        const p = window.player;
        if (!p || !p.attr) return;

        // 1. 迁移基础属性 (attr) - 针对吃丹药涨的永久属性
        // 如果 atk 有值，且 phy_atk 为空或0，说明是旧档
        if (p.attr.atk > 0 && (!p.attr.phy_atk || p.attr.phy_atk === 0)) {
            console.log("[Archive] 迁移旧版攻击 -> 物理攻击");
            p.attr.phy_atk = p.attr.atk; // 全部转为物攻
            p.attr.mag_atk = 0;          // 法攻归零
        }

        if (p.attr.def > 0 && (!p.attr.phy_def || p.attr.phy_def === 0)) {
            console.log("[Archive] 迁移旧版防御 -> 物理防御");
            p.attr.phy_def = p.attr.def; // 全部转为物防
            p.attr.mag_def = 0;          // 法防归零
        }

        // 2. 迁移额外属性 (exAttr) - 针对装备/Buff缓存
        // 虽然 recalcStats 会重算这个，但为了 UI 不闪烁，先迁移一下
        if (p.exAttr) {
            if (p.exAttr.atk && !p.exAttr.phy_atk) p.exAttr.phy_atk = p.exAttr.atk;
            if (p.exAttr.def && !p.exAttr.phy_def) p.exAttr.phy_def = p.exAttr.def;
            // 法系不继承，保持为 0
        }

        // 3. 清理旧字段 (可选，如果不清理可以留着做纪念/兼容显示)
        // p.attr.atk = 0;
        // p.attr.def = 0;
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
function initZhaoshiSystem() {
    // 1. 确保 player 对象存在
    if (!window.player) return;

    // 2. 初始化 招式槽位数量
    if (typeof player.zhaoshi_nums === 'undefined') {
        player.zhaoshi_nums = 3;
    }

    // 3. 【修正】初始化 已学会的招式列表 (改为对象结构以支持 Key-Value)
    if (!player.zhaoshi_list || Array.isArray(player.zhaoshi_list)) {
        player.zhaoshi_list = {};
    }

    // 4. 初始化 当前装备的招式
    if (!Array.isArray(player.zhaoshi_equipped)) {
        player.zhaoshi_equipped = [null, null, null];
    }

    // =========== 【新增逻辑】调用领悟检查 ===========
    if (window.UtilsSkill && typeof window.UtilsSkill.checkSkillComprehension === 'function') {
        const isUpdated = window.UtilsSkill.checkSkillComprehension();

        // 如果有新领悟的招式，立即执行存档
        if (isUpdated && window.saveGame) {
            window.saveGame();
            console.log("[存档] 发现新领悟招式，已自动更新存档。");
        }
    }
}
// 暴露全局接口，覆盖旧的方法
window.saveGame = function() { ArchiveSystem.saveGame(); };
window.loadGame = function() { return ArchiveSystem.loadGame(); };