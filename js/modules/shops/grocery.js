/**
 * js/modules/shops/grocery.js
 * 杂货店功能模块 v1.2
 * 1. 仅限城/镇进入
 * 2. 仅售调味料(flavoring)与钓具(fishing_rod)
 * 3. 钓具每期仅限1种，且数量为1
 * 4. 钓具显示钓鱼概率加成
 */

let GroceryShop = {
    currentStock: [],
    currentTown: null,
    modalBody: null,

    enter: function(town) {
        if (town.level !== 'city' && town.level !== 'town') {
            if (window.showToast) window.showToast("这小村子连个像样的杂货铺都没有...");
            return;
        }
        this.currentTown = town;
        this._generateStock(town);
        this.renderMainMenu();
    },

    _updateContent: function(html) {
        if (this.modalBody) {
            this.modalBody.innerHTML = html;
        } else {
            this.renderMainMenu();
        }
    },

    renderMainMenu: function() {
        if (!window.showGeneralModal) return;
        const townName = this.currentTown.name;
        const html = `
            <div id="grocery_panel_main" class="inn-layout" style="display:flex; flex-direction:column; height:100%; padding: 10px;">
                <div class="inn-greeting" style="flex:0 0 auto; border-bottom:2px dashed #5d4037; margin-bottom:20px; padding:15px; font-family:'Kaiti'; font-size:28px; color:#3e2723; background:rgba(255,255,255,0.5); border-radius:8px;">
                    <p style="margin:5px 0;">伙计：客官您随便看！</p>
                    <p style="margin:5px 0;">咱这儿柴米油盐、鱼竿钩线，那是应有尽有。</p>
                </div>

                <div class="inn-actions" style="flex:1; display:flex; justify-content:center; align-items:center; gap: 30px;">
                    <button class="ink_btn" onclick="GroceryShop.uiBuy()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px;">
                        🛒 挑选
                    </button>
                    <button class="ink_btn" onclick="GroceryShop.uiSell()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px;">
                        💰 典卖
                    </button>
                </div>

                <div class="inn-footer" style="text-align:right; margin-top:20px; font-size: 18px; font-weight:bold; color:#d84315;">
                    当前盘缠: ${player.money} 文
                </div>
            </div>
        `;
        this.modalBody = window.showGeneralModal(`${townName} - 杂货店`, html);
    },

    _generateStock: function(town) {
        if (!window.GAME_DB || !player) return;

        const monthIndex = player.time.month;
        const shopKey = `groceryShop_${town.id}_${monthIndex}`;

        let config = { minType: 5, maxType: 10, maxRarity: 4 };
        if (town.level === 'city') config = { minType: 8, maxType: 15, maxRarity: 6 };

        const allItems = Object.values(window.GAME_DB.items || {});

        // 分别筛选调味料和钓竿
        const flavorings = allItems.filter(i => i.subType === 'flavoring' && (i.rarity || 1) <= config.maxRarity);
        const rods = allItems.filter(i => i.type === 'fishing_rod' && (i.rarity || 1) <= config.maxRarity);

        let selectedItems = [];

        // 1. 处理钓竿：从符合条件的钓竿中随机选1个，数量固定为1
        if (rods.length > 0) {
            const rodIndex = Math.floor(window.getSeededRandom(shopKey, "rodSelect") * rods.length);
            const rod = rods[rodIndex];
            selectedItems.push({
                item: rod,
                price: Math.floor((rod.price || rod.value || 100) * 2),
                qty: 1,
                isRod: true
            });
        }

        // 2. 处理调味料：填充剩余种类
        const targetFlavorCount = config.minType + Math.floor(window.getSeededRandom(shopKey, "typeCount") * (config.maxType - config.minType));

        const scoredFlavorings = flavorings.map(item => {
            return { item: item, score: window.getSeededRandom(shopKey, item.id, "rank") };
        });
        scoredFlavorings.sort((a, b) => b.score - a.score);

        const chosenFlavorings = scoredFlavorings.slice(0, targetFlavorCount).map(entry => {
            const item = entry.item;
            const initialQty = 5 + Math.floor(window.getSeededRandom(shopKey, item.id, "qty") * 10);
            return {
                item: item,
                price: Math.floor((item.price || item.value || 10) * 5),
                qty: initialQty,
                isRod: false
            };
        });

        selectedItems = [...selectedItems, ...chosenFlavorings];

        // 3. 最终生成库存，处理已购买记录
        this.currentStock = selectedItems.map(entry => {
            const item = entry.item;
            if (!player.shopLogs) player.shopLogs = {};
            if (!player.shopLogs[shopKey]) player.shopLogs[shopKey] = {};
            const boughtQty = player.shopLogs[shopKey][item.id] || 0;

            return {
                id: item.id,
                item: item,
                price: entry.price,
                qty: Math.max(0, entry.qty - boughtQty),
                maxQty: entry.qty,
                shopKey: shopKey
            };
        });
    },

    uiBuy: function() {
        if (!this.currentStock || this.currentStock.length === 0) {
            window.showToast("掌柜：货物还在路上，改日再来！");
            return;
        }

        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';

            // 属性标签处理
            let effectTags = '';
            if (item.type === 'fishing_rod' && item.effects && item.effects.catchRate) {
                // 如果是钓竿，特别显示钓鱼概率
                effectTags = `<span style="display:inline-block; background:#e3f2fd; color:#1565c0; border:1px solid #bbdefb; padding:2px 6px; border-radius:4px; font-size:15px;">🎣 钓鱼概率 +${item.effects.catchRate}%</span>`;
            }

            let btnText = "购买";
            const btnBase = "border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.2); font-size:18px; padding: 8px 18px; color: #fff; border: 1px solid;";
            let btnStyle = `${btnBase} background: linear-gradient(to bottom, #81c784, #4caf50); border-color: #2e7d32; cursor: pointer;`;

            if (isSoldOut) {
                btnText = "售罄";
                btnStyle = `${btnBase} background: #bdbdbd; border-color: #9e9e9e; color: #616161; cursor: not-allowed;`;
            } else if (!canAfford) {
                btnText = "缺钱";
                btnStyle = `${btnBase} background: #e0e0e0; border-color: #bdbdbd; color: #9e9e9e; cursor: not-allowed;`;
            }

            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index % 2 === 0 ? '#fafafa' : '#fff'};">
                    <div style="flex:1; text-align:left; padding-right: 15px;">
                        <div style="color:${color}; font-weight:bold; font-size: 21px; display:flex; align-items:center; gap:10px;">
                            ${item.name}
                            ${effectTags}
                        </div>
                        <div style="font-size:15px; color:#888; margin-top:5px;">${item.desc || '生活必备'}</div>
                    </div>
                    <div style="width:120px; text-align:right; margin-right: 20px;">
                        <div style="color:#d84315; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                        <div style="font-size:14px; color:${isSoldOut ? 'red' : '#999'};">库存: ${entry.qty}</div>
                    </div>
                    <div style="width:90px; text-align:right;">
                        <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="GroceryShop.handleBuy(${index})"`}>${btnText}</button>
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <div style="height: 100%; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold;">📦 杂货小铺</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                        <button class="ink_btn" onclick="GroceryShop.renderMainMenu()" style="font-size: 16px; padding: 5px 15px;">返回</button>
                    </div>
                </div>
                <div id="grocery-buy-list" style="flex:1; overflow-y:auto;">
                    ${listHtml}
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    handleBuy: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0 || player.money < entry.price) return;

        player.money -= entry.price;
        entry.qty--;

        const shopKey = entry.shopKey;
        if (!player.shopLogs) player.shopLogs = {};
        if (!player.shopLogs[shopKey]) player.shopLogs[shopKey] = {};
        player.shopLogs[shopKey][entry.id] = (player.shopLogs[shopKey][entry.id] || 0) + 1;

        if (window.UtilsAdd && window.UtilsAdd.addItem) {
            window.UtilsAdd.addItem(entry.id, 1);
        }

        if (window.showToast) window.showToast(`成功买入 ${entry.item.name}`);
        this.uiBuy();
        if (window.updateUI) window.updateUI();
        if (window.saveGame) window.saveGame();
    },

    uiSell: function() {
        if (window.InnShop && window.InnShop.uiSell) {
            window.InnShop.uiSell.call(this);
        }
    }
};

if (window.ShopSystem) {
    ShopSystem.register("杂货店", GroceryShop);
}

window.GroceryShop = GroceryShop;