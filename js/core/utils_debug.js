// js/core/utils_debug.js
// 调试系统 (天道) - 适配新的功法数据结构
console.log("加载 调试系统");

const DebugSystem = {
    open: function() {
        const html = `
      <div style="display:flex; flex-direction:column; gap:15px; padding:10px;">
        
        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">💰 资源与属性</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="DebugSystem.addMoney(10000)">+1万 灵石</button>
                <button class="ink_btn_small" onclick="DebugSystem.fullState()">❤ 状态全满</button>
            </div>
        </div>

        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">📦 物品获取</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('weapon')">⚔️ 随机兵器</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('pill')">💊 随机丹药</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomItem('book')">📘 随机书籍</button>
                <button class="ink_btn_small btn_danger" onclick="DebugSystem.clearBag()">🗑️ 清空背包</button>
            </div>
        </div>

        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">🧘 功法修行</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="DebugSystem.addRandomGongfa('body')">💪 随机外功 (+熟练)</button>
                <button class="ink_btn_small" onclick="DebugSystem.addRandomGongfa('cultivation')">🧘 随机内功 (+熟练)</button>
            </div>
        </div>

        <div class="debug_group">
            <div class="debug_title" style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:4px;">⚙️ 系统测试</div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="ink_btn_small" onclick="window.location.reload()">🔄 重载游戏</button>
                <button class="ink_btn_small btn_danger" onclick="localStorage.clear(); window.location.reload();">❌ 删档重开</button>
            </div>
        </div>

      </div>
    `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal("天道 (调试模式)", html, null, "", 50, "auto");
        }
    },

    // === 基础功能 ===
    addMoney: function(val) {
        if (!player) return;
        player.money = (player.money || 0) + val;
        if (window.updateUI) window.updateUI();
        if (window.showToast) window.showToast(`获得 ${val} 灵石`);
    },

    fullState: function() {
        if (!player) return;
        player.status.hp = player.derived.hpMax;
        player.status.mp = player.derived.mpMax;
        player.status.hunger = player.derived.hungerMax;
        if (window.updateUI) window.updateUI();
        if (window.showToast) window.showToast("状态已回满");
    },

    // === 物品功能 ===
    addRandomItem: function(type) {
        if (!GAME_DB.items) return;
        const list = GAME_DB.items.filter(i => i.type === type);
        if (list.length === 0) {
            if(window.showToast) window.showToast("未找到此类物品数据");
            return;
        }
        const item = list[Math.floor(Math.random() * list.length)];
        if (window.UtilsAdd && window.UtilsAdd.addItem) {
            window.UtilsAdd.addItem(item.id, 1);
        }
    },

    clearBag: function() {
        if (confirm("确定要清空所有背包物品吗？")) {
            player.inventory = [];
            if (window.refreshBagUI) window.refreshBagUI();
            if (window.showToast) window.showToast("背包已清空");
        }
    },

    /**
     * 【核心修改】随机添加功法并增加熟练度
     * @param {string} subType 'body' (外功) 或 'cultivation' (内功)
     */
    addRandomGongfa: function(subType) {
        if (!window.UtilsSkill) {
            console.error("UtilsSkill 未加载");
            return;
        }

        // 1. 筛选逻辑更新：查找 type='book' 且 subType 符合要求的功法
        const candidates = GAME_DB.items.filter(i => i.type === 'book' && i.subType === subType);

        if (candidates.length === 0) {
            if(window.showToast) window.showToast(`数据库中没有 subType=[${subType}] 的功法`);
            return;
        }

        // 2. 随机选取一本
        const item = candidates[Math.floor(Math.random() * candidates.length)];

        // 3. 随机熟练度 (100 ~ 600)
        const expGain = Math.floor(Math.random() * 500) + 100;

        // 4. 调用核心工具类进行学习
        UtilsSkill.learnSkill(item.id, expGain);
    }
};

window.DebugSystem = DebugSystem;