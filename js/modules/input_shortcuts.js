/**
 * input_shortcuts.js
 * 全局快捷键管理 - 优化版
 * 功能：支持按键开关(Toggle)及窗口互斥(Exclusive)，且战斗中禁用ESC
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
        'j': 'JOURNAL','J': 'JOURNAL',
        'x': 'MORTAL', 'X': 'MORTAL', // <--- 新增这行，绑定 X 键
        'Escape': 'CLOSE'
    };

    /**
     * UI 管理器配置
     */
    const UI_MANAGERS = {
        'MAP': {
            getObj: () => window.MapView,
            open: (ui) => ui.open(),
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        },
        'BAG': {
            getObj: () => window.UIBag || { open: window.openBag },
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
        'JOURNAL': {
            getObj: () => window.UIJournal,
            open: (ui) => ui && ui.open(),
            close: (ui) => (ui && typeof ui.close === 'function') ? ui.close() : tryGlobalClose()
        },
        // =========== 新增 Mortal 配置 ===========
        'MORTAL': {
            getObj: () => window.UI_Mortal, // 获取全局对象
            open: (ui) => ui && ui.open(),  // 安全调用 open
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

        // 阻止默认行为（可选，视需求而定）
        // event.preventDefault();

        handleAction(action);
    });

    function handleAction(action) {
        // 1. 处理 ESC 关闭所有
        if (action === 'CLOSE') {
            // =========== 【核心修改在这里】 ===========
            // 检测 DOM 中是否存在战斗界面的特有类名
            // 如果存在 .combat-wrapper，说明战斗正在进行，直接 return，不执行关闭
            if (document.querySelector('.combat-wrapper')) {
                // console.log("战斗中，ESC已被禁用");
                return;
            }
            // =======================================

            closeCurrentPanel();
            return;
        }

        // 2. 检查该 Action 是否有定义的 UI 管理器
        const manager = UI_MANAGERS[action];
        if (!manager) return;

        // 3. 核心逻辑：开关与互斥
        if (currentOpenPanel === action) {
            // A. 如果当前按下的键就是正在打开的窗口 -> 关闭它 (Toggle Off)
            closeCurrentPanel();
        } else {
            // B. 如果按下的键是新窗口
            // 如果之前有别的开着，先关掉旧的 (Exclusive)
            if (currentOpenPanel) {
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

        currentOpenPanel = null;
    }

    window.resetShortcutState = function() {
        currentOpenPanel = null;
    };

})();


(function() {
    // 获取按钮元素
    const debugBtn = document.getElementById('btn_debug');

    if (debugBtn) {
        // 获取当前 URL 字符串
        const currentUrl = window.location.href;

        // 逻辑判断：如果包含 'newgame'，则隐藏按钮
        if (currentUrl.includes('newgame')) {
            debugBtn.style.display = 'none';
            // console.log("[系统] 当前处于新游戏流程，调试按钮已隐藏");
        } else {
            debugBtn.style.display = 'inline-block'; // 或者保持样式默认
        }
    }
})();