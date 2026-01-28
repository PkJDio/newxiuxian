// js/core/utils_npc.js
// NPC 系统管理器：负责刷新、交互和特殊商店

const UtilsNPC = {

    /**
     * 【初始化】在游戏启动或读档后调用
     * 确保所有 NPC 都有位置和数据
     */
    initNPCs: function() {
        if (!window.DATA_NPC || !window.player) return;

        console.log("👴 [UtilsNPC] 正在初始化 NPC...");

        for (let npcId in window.DATA_NPC) {
            const npc = window.DATA_NPC[npcId];

            // 如果 NPC 还没有位置（说明是刚启动游戏），或者强制刷新
            if (!npc.location || !npc.stock) {
                // 调用配置里的刷新逻辑
                if (npc.behavior && npc.behavior.onWeekChange) {
                    npc.behavior.onWeekChange(npc, window.player);
                }
            }
        }
    },

    /**
     * 【周常刷新】在时间系统检测到进入新的一周时调用
     */
    refreshAll: function() {
        if (!window.DATA_NPC || !window.player) return;

        console.log("📅 [UtilsNPC] 周数变更，刷新所有 NPC 位置与库存...");

        for (let npcId in window.DATA_NPC) {
            const npc = window.DATA_NPC[npcId];
            if (npc.behavior && npc.behavior.onWeekChange) {
                npc.behavior.onWeekChange(npc, window.player);
            }
        }

        // 刷新后可能需要更新地图显示
        if (window.MapCamera) window.MapCamera.requestRender();
    },

    /**
     * 【打开商店】处理 NPC 的特殊商店 (支持 灵石/金钱 双模式)
     */
    openShop: function(npc) {
        if (!npc.stock || npc.stock.length === 0) {
            if(window.showToast) window.showToast("老朽身上现在空空如也...");
            return;
        }

        const currencyType = npc.behavior.shopCurrency || "money";
        let playerAssetHtml = "";

        // 1. 头部资产显示
        if (currencyType === "spirit_stone") {
            playerAssetHtml = window.UtilsSpiritPrice.formatHoldingsFull();
        } else {
            playerAssetHtml = `持有: <span style="color:#d84315; font-weight:bold;">${window.player.money}</span> 文`;
        }

        // 2. 生成商品列表
        let listHtml = npc.stock.map((entry, index) => {
            const item = entry.item;
            // console.log("item=",item);
            let priceHtml = "";
            let canAfford = false;

            if (currencyType === "spirit_stone") {
                const holdings = window.UtilsSpiritPrice.getPlayerHoldings();
                canAfford = holdings.totalValue >= entry.price;
                priceHtml = window.UtilsSpiritPrice.format(entry.price);
                console.log("entry.price：{}，priceHtml：{}",entry.price,priceHtml)
            } else {
                canAfford = window.player.money >= entry.price;
                priceHtml = `<span style="color:#d84315">${entry.price} 文</span>`;
            }

            // 检查是否已拥有
            let isOwned = false;
            if (entry.type === 'zhaoshi') {
                if (window.player.zhaoshi_list && window.player.zhaoshi_list[item.id]) {
                    isOwned = true;
                }
            }

            const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';

            let btnState = "";
            let btnText = "";

            if (isOwned) {
                btnState = `disabled style="background:#ccc; cursor:not-allowed;"`;
                btnText = "已学会";
            } else if (canAfford) {
                btnState = `onclick="UtilsNPC.buyItem('${npc.id}', ${index})"`;
                btnText = "购买";
            } else {
                btnState = `disabled style="background:#ccc; cursor:not-allowed;"`;
                btnText = "不足";
            }

            // 【关键修改】使用 showShopZhaoShi
            let tooltipAttr = "";
            if (entry.type === 'zhaoshi') {
                // 指向新方法
                tooltipAttr = `onmouseenter="if(window.showShopZhaoShi) window.showShopZhaoShi(event, '${item.id}')" onmouseleave="if(window.hideTooltip) window.hideTooltip()"`;
            } else {
                tooltipAttr = `onmouseenter="if(window.showShopItemTooltip) window.showShopItemTooltip(event, '${item.id}')" onmouseleave="if(window.hideTooltip) window.hideTooltip()"`;
            }

            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #eee;">
                    <div style="flex:1;" ${tooltipAttr}>
                        <div style="font-weight:bold; font-size:16px; color:${color}; cursor:help;">${item.name}</div>
                        <div style="font-size:12px; color:#666;">${item.desc ? item.desc.substring(0, 20)+"..." : "无描述"}</div>
                    </div>
                    <div style="text-align:right; min-width:100px;">
                        <div style="font-weight:bold;">${priceHtml}</div>
                    </div>
                    <div style="margin-left:15px;">
                        <button class="ink_btn_small" ${btnState}>${btnText}</button>
                    </div>
                </div>
            `;
        }).join('');

        // 3. 布局渲染
        const content = `
            <div style="display:flex; flex-direction:column; height:500px; padding:10px;">
                <div style="background:#f9f9f9; padding:10px; border-radius:4px; margin-bottom:10px; border:1px solid #e0e0e0; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                    <span style="font-weight:bold; color:#333; font-size:16px;">${npc.name}的宝物</span>
                    <span style="font-size:13px; background:#fff; padding:4px 8px; border-radius:15px; border:1px solid #ddd;">${playerAssetHtml}</span>
                </div>
                <div style="flex:1; overflow-y:auto; border:1px solid #eee; border-radius:4px; background:#fff;">
                    ${listHtml}
                </div>
            </div>
        `;

        if (window.UtilsModal) {
            window.UtilsModal.showInteractiveModal(
                `交易`,
                content,
                null,
                "modal_npc_shop"
            );
        }
    },

    /**
     * 【购买物品】逻辑
     */
    buyItem: function(npcId, itemIndex) {
        const npc = window.DATA_NPC[npcId];
        if (!npc) return;
        const entry = npc.stock[itemIndex];
        if (!entry) return;

        const currencyType = npc.behavior.shopCurrency || "money";

        // 0. 特殊检查：如果是招式，且已拥有，直接拦截 (防止重复扣款)
        if (entry.type === 'zhaoshi') {
            if (!window.player.zhaoshi_list) window.player.zhaoshi_list = {};
            if (window.player.zhaoshi_list[entry.item.id]) {
                if(window.showToast) window.showToast("你已经学会此招式，无需重复购买。");
                return;
            }
        }

        // 1. 扣费逻辑
        if (currencyType === "spirit_stone") {
            const success = window.UtilsSpiritPrice.smartDeduct(entry.price);
            if (!success) {
                if(window.showToast) window.showToast("灵石不足！");
                return;
            }
        } else {
            if (window.player.money < entry.price) {
                if(window.showToast) window.showToast("银两不足！");
                return;
            }
            window.UtilsMoney.removeMoney(entry.price);
        }

        // 2. 发货逻辑
        if (entry.type === 'zhaoshi') {
            // 【核心逻辑】直接将对象存入 zhaoshi_list 字典
            // 使用 JSON 序列化进行深拷贝，防止引用污染
            window.player.zhaoshi_list[entry.item.id] = JSON.parse(JSON.stringify(entry.item));

            if(window.showToast) window.showToast(`习得招式【${entry.item.name}】！`);
        } else {
            // 普通物品走通用添加流程
            if (window.UtilsAdd) window.UtilsAdd.addItem(entry.id, 1);
        }

        // 3. 移除库存 (防止买空NPC)
        npc.stock.splice(itemIndex, 1);

        // 4. 刷新界面
        this.openShop(npc);
        if(window.saveGame) window.saveGame();
        if(window.updateUI) window.updateUI();
    },

    // 辅助：统计背包内某物品数量
    _countItem: function(itemId) {
        if (!window.player || !window.player.inventory) return 0;
        // 如果是特殊货币 spirit_stone，可能要涵盖 spirit_stone_1, spirit_stone_2...
        // 这里天机老人只收下品灵石(spirit_stone_1)，简化处理
        if (itemId === "spirit_stone") itemId = "spirit_stone_1";

        const item = window.player.inventory.find(i => i.id === itemId);
        return item ? (item.count || 0) : 0;
    }
};

window.UtilsNPC = UtilsNPC;