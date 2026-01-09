/**
 * input_shortcuts.js
 * 全局快捷键管理 - 优化版
 * 功能：支持按键开关(Toggle)及窗口互斥(Exclusive)
 */

(function() {

    // 记录当前打开的面板 Action (例如 'MAP', 'BAG')，如果没有则为 null
    let currentOpenPanel = null;

    // 键盘按键映射
    const KEY_MAP = {
        'm': 'MAP',    'M': 'MAP',
        'i': 'BAG',    'I': 'BAG',
        'k': 'SKILL',  'K': 'SKILL',
        't': 'BOUNTY', 'T': 'BOUNTY',
        'j': 'JOURNAL','J': 'JOURNAL', // 假设 J 是日志或任务，仅作示例
        'Escape': 'CLOSE'
    };

    /**
     * UI 管理器配置
     * 定义每种 Action 对应的 UI 对象、打开方法和关闭方法
     */
    const UI_MANAGERS = {
        'MAP': {
            // 获取 UI 对象
            getObj: () => window.MapView,
            // 打开逻辑
            open: (ui) => ui.open(),
            // 关闭逻辑 (如果组件有 close 方法用 close，否则尝试全局 closeModal)
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        },
        'BAG': {
            getObj: () => window.UIBag || { open: window.openBag }, // 兼容旧代码逻辑
            open: (ui) => ui.open(),
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        },
        'SKILL': {
            getObj: () => window.UISkill,
            open: (ui) => ui.open(),
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        },
        'BOUNTY': {
            getObj: () => window.UIBounty,
            open: (ui) => ui.open(),
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        },
        // 如果你有 J 键对应的 UI，可以在这里添加
        'JOURNAL': {
            getObj: () => window.UIJournal,
            open: (ui) => ui && ui.open(),
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        }
    };

    // 辅助：尝试调用全局关闭方法
    function tryGlobalClose() {
        if (typeof window.closeModal === 'function') {
            window.closeModal();
        }
    }

    document.addEventListener('keydown', function(event) {
        // 输入框内不触发
        if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            return;
        }

        const key = event.key;
        const action = KEY_MAP[key];

        if (!action) return;

        handleAction(action);
    });

    function handleAction(action) {
        // 1. 处理 ESC 关闭所有
        if (action === 'CLOSE') {
            closeCurrentPanel();
            return;
        }

        // 2. 检查该 Action 是否有定义的 UI 管理器
        const manager = UI_MANAGERS[action];
        if (!manager) return;

        // 3. 核心逻辑：开关与互斥
        if (currentOpenPanel === action) {
            // A. 如果当前按下的键就是正在打开的窗口 -> 关闭它 (Toggle Off)
            console.log(`[快捷键] 关闭当前窗口: ${action}`);
            closeCurrentPanel();
        } else {
            // B. 如果按下的键是新窗口

            // 如果之前有别的开着，先关掉旧的 (Exclusive)
            if (currentOpenPanel) {
                console.log(`[快捷键] 切换窗口: 关闭 ${currentOpenPanel}, 打开 ${action}`);
                closeCurrentPanel();
            }

            // 打开新的
            openPanel(action, manager);
        }
    }

    /**
     * 打开指定面板
     */
    function openPanel(action, manager) {
        const uiObj = manager.getObj();
        if (uiObj) {
            manager.open(uiObj);
            currentOpenPanel = action; // 更新状态：当前谁开着
        } else {
            console.warn(`[快捷键] 无法找到 UI 对象: ${action}`);
        }
    }

    /**
     * 关闭当前记录的面板
     */
    function closeCurrentPanel() {
        if (!currentOpenPanel) {
            // 即使没有记录，ESC 也尝试关闭一次模态框（防错机制）
            tryGlobalClose();
            return;
        }

        const action = currentOpenPanel;
        const manager = UI_MANAGERS[action];

        if (manager) {
            const uiObj = manager.getObj();
            manager.close(uiObj);
        } else {
            tryGlobalClose();
        }

        // 重置状态
        currentOpenPanel = null;
    }

    // 暴露一个方法供外部使用（比如点击由鼠标上的 X 关闭按钮时，同步状态）
    window.resetShortcutState = function() {
        currentOpenPanel = null;
    };

})();

console.log("System: 快捷键模块加载完毕 (支持互斥与开关)");