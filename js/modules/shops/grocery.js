/**
 * js/modules/shops/grocery.js
 * 杂货店功能模块 v1.3
 * 更新日志：
 * 1. 适配 UtilsItem 的 SID 移除逻辑
 * 2. 独立实现出售功能，修复引用客栈逻辑导致的刷新失效问题
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
        this.modalBody = window.showGeneralModal(`${townName} - 杂货店`, html, null, "grocery_modal", 68, 85);
    },

    _generateStock: function(town) {
        if (!window.GAME_DB || !player) return;

        // 保持原有的时间种子逻辑
        const timeKey = `${player.time.month}_${player.time.day}`;
        const shopKey = `groceryShop_${town.id}_${timeKey}`;

        let config = { minType: 5, maxType: 10, maxRarity: 4 };
        if (town.level === 'city') config = { minType: 8, maxType: 15, maxRarity: 6 };

        const allItems = Object.values(window.GAME_DB.items || {});

        // 原有的筛选逻辑
        const flavorings = allItems.filter(i => i.subType === 'flavoring' && (i.rarity || 1) <= config.maxRarity);
        const rods = allItems.filter(i => i.type === 'fishing_rod' && (i.rarity || 1) <= config.maxRarity);

        // ============================================================
        // 【新增】筛选 R1-R2 的外功功法 (type=book, subType=body)
        // ============================================================
        const basicBooks = allItems.filter(i =>
            i.type === 'book' &&
            i.subType === 'body' &&
            (i.rarity === 1 || i.rarity === 2)
        );

        let selectedItems = [];

        // 1. 处理鱼竿 (保持不变)
        if (rods.length > 0) {
            const rodIndex = Math.round(window.getSeededRandom(shopKey, "rodSelect") * (rods.length - 1));
            const rod = rods[rodIndex];
            if (rod) {
                selectedItems.push({
                    item: rod,
                    price: Math.round((rod.price || rod.value || 100) * 2),
                    qty: 1,
                    isRod: true
                });
            }
        }

        // ============================================================
        // 【新增】随机抽取 1-2 本基础功法
        // ============================================================
        if (basicBooks.length > 0) {
            // 决定上架几本 (1本 或 2本)
            const bookCount = 1 + Math.round(window.getSeededRandom(shopKey, "bookCount"));

            // 打乱顺序 (基于种子)
            const scoredBooks = basicBooks.map(item => {
                return { item: item, score: window.getSeededRandom(shopKey, item.id, "bookRank") };
            });
            scoredBooks.sort((a, b) => b.score - a.score);

            // 选取前 N 本
            const chosenBooks = scoredBooks.slice(0, bookCount).map(entry => {
                const item = entry.item;
                return {
                    item: item,
                    // 功法价格倍率，这里设为价值的 1.5 倍，你可以根据需要调整
                    price: Math.round((item.price || item.value || 100) * 1.5),
                    qty: 1, // 功法通常一本就够，或者你可以设为 3-5 本
                    isRod: false
                };
            });

            selectedItems = [...selectedItems, ...chosenBooks];
        }

        // 2. 处理调料/食材 (保持不变)
        const targetFlavorCount = config.minType + Math.round(window.getSeededRandom(shopKey, "typeCount") * (config.maxType - config.minType));

        const scoredFlavorings = flavorings.map(item => {
            return { item: item, score: window.getSeededRandom(shopKey, item.id, "rank") };
        });
        scoredFlavorings.sort((a, b) => b.score - a.score);

        const chosenFlavorings = scoredFlavorings.slice(0, targetFlavorCount).map(entry => {
            const item = entry.item;
            const initialQty = 35 + Math.round(window.getSeededRandom(shopKey, item.id, "qty") * 10);
            return {
                item: item,
                price: Math.round((item.price || item.value || 10) * 5),
                qty: initialQty,
                isRod: false
            };
        });

        selectedItems = [...selectedItems, ...chosenFlavorings];

        // 3. 生成最终库存对象 (保持不变)
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

            let effectTags = '';
            if (item.type === 'fishing_rod' && item.effects && item.effects.catchRate) {
                effectTags = `<span style="display:inline-block; background:#e3f2fd; color:#1565c0; border:1px solid #bbdefb; padding:2px 6px; border-radius:4px; font-size:15px;">🎣 钓鱼概率 +${item.effects.catchRate}%</span>`;
            }

            let btnText = "购买";
            const btnBase = "border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.2); font-size:18px; padding: 8px 18px; color: #fff; border: 1px solid;";
            let btnStyle = `${btnBase} background: linear-gradient(to bottom, #81c784, #4caf50); border-color: #2e7d32; cursor: pointer;`;

            // 【新增】批量按钮
            let bulkBtnHtml = '';
            if (!isSoldOut && canAfford) {
                const maxCanBuy = Math.floor(player.money / entry.price);
                const buyNum = Math.min(entry.qty, maxCanBuy);
                if (buyNum > 1) {
                    const bulkStyle = `${btnBase} background: linear-gradient(to bottom, #4fc3f7, #0288d1); border-color: #01579b; cursor: pointer; margin-right:5px;`;
                    bulkBtnHtml = `<button style="${bulkStyle}" onclick="GroceryShop.handleBuyBulk(${index})">全买</button>`;
                }
            }

            if (isSoldOut) {
                btnText = "售罄";
                btnStyle = `${btnBase} background: #bdbdbd; border-color: #9e9e9e; color: #616161; cursor: not-allowed;`;
            } else if (!canAfford) {
                btnText = "缺钱";
                btnStyle = `${btnBase} background: #e0e0e0; border-color: #bdbdbd; color: #9e9e9e; cursor: not-allowed;`;
            }

            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index % 2 === 0 ? '#fafafa' : '#fff'};"
                
                /* 【新增】鼠标移入显示详情 */
         onmouseenter="window.showShopItemTooltip(event, '${item.id}')"
         /* 【新增】鼠标移出隐藏 */
         onmouseleave="window.hideTooltip()">
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
                    <div style="width:160px; text-align:right;"> ${bulkBtnHtml}
                        <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="GroceryShop.handleBuy(${index})"`}>${btnText}</button>
                    </div>
                </div>
            `;
        }).join('');

        // 【修改】使用 this.modalBody 查找容器
        if (!this.modalBody) return;

        const container = this.modalBody.querySelector('#grocery-buy-list');
        const moneyEl = this.modalBody.querySelector('#grocery-buy-money');

        if (container && moneyEl) {
            const scrollTop = container.scrollTop;
            container.innerHTML = listHtml;
            moneyEl.innerText = `💰 ${player.money}`;
            requestAnimationFrame(() => { container.scrollTop = scrollTop; });
        } else {
            const html = `
                <div style="height: 100%; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                    <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                        <span style="font-size: 24px; font-weight: bold;">📦 杂货小铺</span>
                        <div style="display:flex; align-items:center; gap: 20px;">
                            <span id="grocery-buy-money" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                            <button class="ink_btn" onclick="GroceryShop.renderMainMenu()" style="font-size: 16px; padding: 5px 15px;">返回</button>
                        </div>
                    </div>
                    <div id="grocery-buy-list" style="flex:1; overflow-y:auto;">
                        ${listHtml}
                    </div>
                </div>
            `;
            this._updateContent(html);
        }
    },

    handleBuy: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0 || player.money < entry.price) return;

        UtilsMoney.removeMoney(entry.price);
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
    handleBuyBulk: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0) return;

        const maxCanBuy = Math.floor(player.money / entry.price);
        const buyQty = Math.min(entry.qty, maxCanBuy);

        if (buyQty <= 0) { window.showToast("银子不够！"); return; }

        UtilsMoney.removeMoney(buyQty * entry.price);
        entry.qty -= buyQty;

        if (window.UtilsAdd && window.UtilsAdd.addItem) window.UtilsAdd.addItem(entry.id, buyQty);
        else {
            if (!player.inventory[entry.id]) player.inventory[entry.id] = 0;
            player.inventory[entry.id] += buyQty;
        }

        if (entry.shopKey) {
            if (!player.shopLogs) player.shopLogs = {};
            if (!player.shopLogs[entry.shopKey]) player.shopLogs[entry.shopKey] = {};
            player.shopLogs[entry.shopKey][entry.id] = (player.shopLogs[entry.shopKey][entry.id] || 0) + buyQty;
        }

        if(window.showToast) window.showToast(`进货成功，获得 ${buyQty} 个 ${entry.item.name}`);
        this.uiBuy();
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
    },

    // ================= 出售界面 (独立实现 + SID适配) =================
    uiSell: function() {
        const inventory = player.inventory || [];
        const sellableItems = [];

        // 筛选可出售物品 (有 value 且有 sid)
        inventory.forEach((slot) => {
            if (!slot) return;
            // 确保有 sid 才能操作
            if (slot.value && slot.sid) {
                sellableItems.push(slot);
            }
        });

        let listHtml = "";
        if (sellableItems.length === 0) {
            listHtml = `<div style="padding:40px; text-align:center; color:#999; font-size: 18px;">你的包袱里空空如也，没什么可卖的。</div>`;
        } else {
            const btnBase = "display:inline-block; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 2px rgba(0,0,0,0.2); text-shadow: 0 1px 1px rgba(0,0,0,0.3); font-size: 16px; padding: 6px 15px; color: #fff; border: 1px solid; white-space: nowrap;";
            const sellBtnStyle = `${btnBase} background: linear-gradient(to bottom, #ffb74d, #f57c00); border-color: #e65100;`;

            listHtml = sellableItems.map(item => {
                const sellPrice = Math.round(item.value * 0.5);
                const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';
                const count = item.count || 1;

                let bulkBtnHtml = '';
                if (count > 1) {
                    const bulkBtnStyle = `${btnBase} background: linear-gradient(to bottom, #4fc3f7, #0288d1); border-color: #01579b;`;
                    // 【关键】传入 SID
                    bulkBtnHtml = `<button style="${bulkBtnStyle}" onclick="GroceryShop.handleSellBulk('${item.sid}', ${sellPrice})">全卖</button>`;
                }

                return `
                    <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:#fff; transition: background 0.2s;"
                    /* 【新增】出售界面使用的是背包实例，传入 SID */
         onmouseenter="window.showItemTooltip(event, '${item.sid}')"
         onmouseleave="window.hideTooltip()"
                    >
                        <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                            <span style="color:${color}; font-weight:bold; font-size: 21px;">${item.name}</span>
                            <div style="font-size:17px; color:#666; margin-top:4px;">
                                ${count > 1 ? `数量: ${count}` : ''} 
                                <span style="margin-left:5px; color:#999;">(原价:${item.value})</span>
                            </div>
                        </div>
                        <div style="width:110px; text-align:right; margin-right: 15px; flex-shrink:0;">
                            <div style="color:#388e3c; font-weight:bold; font-size: 20px;">+${sellPrice} 文</div>
                        </div>
                        <div style="width:160px; text-align:right; flex-shrink:0; display:flex; justify-content:flex-end; gap: 10px; align-items: center;">
                            ${bulkBtnHtml}
                            <button style="${sellBtnStyle}" onclick="GroceryShop.handleSell('${item.sid}', ${sellPrice})">卖出</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 使用 this.modalBody 查找更新
        if (!this.modalBody) return;

        const container = this.modalBody.querySelector('#grocery-sell-list');
        const moneyEl = this.modalBody.querySelector('#grocery-sell-money');

        if (container && moneyEl) {
            const scrollTop = container.scrollTop;
            container.innerHTML = listHtml;
            moneyEl.innerText = `💰 ${player.money}`;
            requestAnimationFrame(() => { container.scrollTop = scrollTop; });
        } else {
            const html = `
                <div style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                    <div style="flex:0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                        <span style="font-size: 24px; font-weight: bold;">💰 典卖物品 (半价)</span>
                        <div style="display:flex; align-items:center; gap: 20px;">
                            <span id="grocery-sell-money" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                            <button class="ink_btn" onclick="GroceryShop.renderMainMenu()" 
                                    style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">
                                返回
                            </button>
                        </div>
                    </div>
                    <div id="grocery-sell-list" style="flex:1; overflow-y:auto; padding:0; background: #fff;">
                        ${listHtml}
                    </div>
                </div>
            `;
            this._updateContent(html);
        }
    },

    // 【新增】处理单件出售 (SID)
    handleSell: function(sid, price) {
        const item = player.inventory.find(i => i.sid === sid);
        if (!item) {
            if(window.showToast) window.showToast("物品不存在或已售出");
            this.uiSell();
            return;
        }

        UtilsMoney.addMoney(price);

        // 调用 UtilsItem 移除 1 个
        if (window.UtilsItem) {
            window.UtilsItem.removeItem(sid, 1);
        }

        if(window.showToast) window.showToast(`出售成功，获得 ${price} 文`);

        // 刷新界面
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
        this.uiSell();
    },

    // 【新增】处理批量出售 (SID)
    handleSellBulk: function(sid, unitPrice) {
        const item = player.inventory.find(i => i.sid === sid);
        if (!item) return;

        const count = item.count || 1;
        const totalPrice = unitPrice * count;
        UtilsMoney.addMoney(totalPrice);

        // 调用 UtilsItem 移除整个堆叠
        if (window.UtilsItem) {
            window.UtilsItem.discardMultipleItems([sid]);
        }

        if(window.showToast) window.showToast(`批量出售 ${count} 个，获得 ${totalPrice} 文`);

        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
        this.uiSell();
    }
};
if (window.ShopSystem) {
    ShopSystem.register("杂货店", GroceryShop);
}
window.GroceryShop = GroceryShop;