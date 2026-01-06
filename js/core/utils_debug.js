// js/core/utils_debug.js
// 调试系统 (天道) - 全功能修复版
console.log("加载 调试系统");

const DebugSystem = {
    open: function() {
        const html = `
      <div style="display:flex; flex-direction:column; gap:15px; padding:10px;">
        
        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">💰 资源与属性</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="DebugSystem.addMoney(10000)">+1万 灵石</button>
                <button class="ink_btn_small" onclick="DebugSystem.addMoney(100000)">+10万 灵石</button>
                <button class="ink_btn_small" onclick="DebugSystem.fullState()">❤ 状态全满</button>
            </div>
        </div>

        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">📦 物品获取</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" style="background:#673ab7; color:white;" onclick="DebugSystem.addAbsoluteRandomItem()">✨ 混沌随机 (全物品)</button>
                <hr style="width:100%; border:none; border-top:1px dashed #ddd; margin:5px 0;">
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('weapon')">⚔️ 随机兵器</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('pill')">💊 随机丹药</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('material')">🪵 随机素材</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('book')">📘 随机书籍</button>
                <button class="ink_btn_small btn_danger" onclick="DebugSystem.clearBag()">🗑️ 清空背包</button>
            </div>
        </div>

        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">🧘 功法修行</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="DebugSystem.addRandomGongfa('body')">💪 随机外功</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomGongfa('cultivation')">🧘 随机内功</button>
            </div>
        </div>

        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">🚨 危险操作 (慎点)</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="window.location.reload()">🔄 重载游戏</button>
                <button class="ink_btn_small" style="background:#ff4d4f; color:white; border:none;" onclick="DebugSystem.obliterateAllData()">💀 彻底抹除 (清空轮回)</button>
            </div>
        </div>

      </div>
    `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal("天道 (调试模式)", html, null, "", 60, "auto");
        }
    },

    // === 基础逻辑 ===
    addMoney: function(val) {
        if (!player) return;
        player.money = (player.money || 0) + val;
        if (window.updateUI) window.updateUI();
        if (window.showToast) window.showToast(`获得 ${val} 灵石`);
        if (window.saveGame) window.saveGame();
    },

    fullState: function() {
        if (!player) return;
        player.status.hp = player.derived.hpMax;
        player.status.mp = player.derived.mpMax;
        player.status.hunger = player.derived.hungerMax;
        if (window.updateUI) window.updateUI();
        if (window.showToast) window.showToast("状态已回满");
        if (window.saveGame) window.saveGame();
    },

    // === 物品逻辑 ===
    addAbsoluteRandomItem: function() {
        if (!GAME_DB.items || GAME_DB.items.length === 0) return;
        const item = GAME_DB.items[Math.floor(Math.random() * GAME_DB.items.length)];
        if (window.UtilsAdd && window.UtilsAdd.addItem) {
            window.UtilsAdd.addItem(item.id, 1, false);
            if(window.showToast) window.showToast(`天降机缘：获得 [${item.name}]`);
            if (window.saveGame) window.saveGame();
        }
    },

    addRandomItem: function(type) {
        if (!GAME_DB.items) return;
        const list = GAME_DB.items.filter(i => i.type === type);
        if (list.length === 0) return;
        const item = list[Math.floor(Math.random() * list.length)];
        if (window.UtilsAdd && window.UtilsAdd.addItem) {
            window.UtilsAdd.addItem(item.id, 1, false);
            if (window.saveGame) window.saveGame();
        }
    },

    clearBag: function() {
        if (confirm("确定要清空所有背包物品吗？")) {
            player.inventory = [];
            if (window.refreshBagUI) window.refreshBagUI();
            if (window.showToast) window.showToast("背包已清空");
            if (window.saveGame) window.saveGame();
        }
    },

    // === 核心：彻底删档逻辑 ===
    obliterateAllData: function() {
        // 二次确认，防止误触
        const msg = "【警告】此操作将永久删除：\n1. 当前角色进度\n2. 轮回保留属性/天赋\n3. 所有游戏设置\n\n此操作不可撤销！确定要“归于虚无”吗？";

        if (confirm(msg)) {
            // 1. 清空所有存储数据
            localStorage.clear();

            // 2. 给予反馈（虽然页面即将刷新）
            if (window.showToast) window.showToast("天道崩塌，万物归零...");

            // 3. 强制延迟刷新页面，确保用户看到提示
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    },

    // === 功法功能 ===
    addRandomGongfa: function(subType) {
        if (!window.UtilsSkill) return;
        const candidates = GAME_DB.items.filter(i => i.type === 'book' && i.subType === subType);
        if (candidates.length === 0) return;
        const item = candidates[Math.floor(Math.random() * candidates.length)];
        const expGain = Math.floor(Math.random() * 500) + 100;
        UtilsSkill.learnSkill(item.id, expGain);
    }
};

window.DebugSystem = DebugSystem;