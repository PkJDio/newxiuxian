// js/modules/shops/blacksmith.js
// 铁匠铺功能模块 v1.1 (价格调整版)
//console.log("加载 铁匠铺模块");

const BlacksmithShop = {
    currentStock: [],
    currentTown: null,
    modalBody: null,

    // ================= 入口函数 =================
    enter: function(town) {
        this.currentTown = town;
        this._generateStock(town);
        this.renderMainMenu();
        // 【新增】触发铁匠铺引导
        if (window.UITutorial) UITutorial.checkBuilding('blacksmith');

    },

    // ================= 辅助：更新内容 =================
    _updateContent: function(html) {
        if (this.modalBody) {
            this.modalBody.innerHTML = html;
        } else {
            this.renderMainMenu();
        }
    },

    // ================= 主界面渲染 =================
    renderMainMenu: function() {
        if (!window.showGeneralModal) return;

        const townName = this.currentTown.name;
        const html = `
            <div id="blacksmith_panel_main" class="inn-layout" style="display:flex; flex-direction:column; height:100%; padding: 10px;">
                <div class="inn-greeting" style="flex:0 0 auto; border-bottom:2px dashed #5d4037; margin-bottom:20px; padding:15px; font-family:'Kaiti'; font-size:30px; color:#3e2723; background:rgba(255,255,255,0.5); border-radius:8px;">
                    <p style="margin:5px 0;">铁匠：嗬！这把年纪还能见到这么结实的后生。</p>
                    <p style="margin:5px 0;">想要趁手的兵刃还是护身的甲胄？</p>
                    <p style="margin:5px 0;">先说好，俺这里的货，概不赊账！</p>
                </div>

                <div class="inn-actions" style="flex:1; display:flex; justify-content:center; align-items:center; gap: 30px;">
                    <button class="ink_btn" onclick="BlacksmithShop.uiBuy()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        ⚒️ 购买
                    </button>
                    <button class="ink_btn" onclick="BlacksmithShop.uiSell()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        💰 出售
                    </button>
                </div>

                <div class="inn-footer" style="text-align:right; margin-top:20px; font-size: 18px; font-weight:bold; color:#d84315;">
                    当前盘缠: ${player.money} 文
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`${townName} - 铁匠铺`, html);
    },

    // ================= 库存生成 =================
    _generateStock: function(town) {
        if (!window.getSeededRandom || !player) return;

        const monthIndex = player.time.month;
        const shopKey = `blacksmith_${town.id}_${monthIndex}`;

        let config = { minType: 5, maxType: 8, minTotal: 10, maxTotal: 16, maxRarity: 3 };
        if (town.level === 'city') config = { minType: 10, maxType: 15, minTotal: 20, maxTotal: 30, maxRarity: 6 };
        else if (town.level === 'town') config = { minType: 8, maxType: 10, minTotal: 10, maxTotal: 20, maxRarity: 5 };

        const allItems = Object.values(window.GAME_DB.equipments || {});
        const validItems = allItems.filter(item => {
            const isEquip = ['weapon', 'head', 'body', 'feet'].includes(item.type);
            if (!isEquip) return false;
            const r = item.rarity || 1;
            return r <= config.maxRarity;
        });

        if (validItems.length === 0) { this.currentStock = []; return; }

        const randForType = window.getSeededRandom(shopKey, "typeCount");
        let targetTypeCount = Math.floor(randForType * (config.maxType - config.minType + 1)) + config.minType;
        targetTypeCount = Math.min(targetTypeCount, validItems.length);

        const randForTotal = window.getSeededRandom(shopKey, "totalQty");
        let targetTotalQty = Math.floor(randForTotal * (config.maxTotal - config.minTotal + 1)) + config.minTotal;
        targetTotalQty = Math.max(targetTotalQty, targetTypeCount);

        const rarityWeights = { 1: 100, 2: 60, 3: 30, 4: 10, 5: 2, 6: 0.5 };

        const scoredItems = validItems.map(item => {
            const r = item.rarity || 1;
            const weight = rarityWeights[r] || 10;
            const randVal = window.getSeededRandom(shopKey, item.id, "rank");
            const w = weight > 0 ? weight : 1;
            const rSafe = randVal > 0 ? randVal : 0.0001;
            const score = Math.pow(rSafe, 1 / w);
            return { item: item, score: score, maxQty: 0 };
        });

        scoredItems.sort((a, b) => b.score - a.score);
        const selectedItems = scoredItems.slice(0, targetTypeCount);

        selectedItems.forEach(entry => { entry.maxQty = 1; targetTotalQty--; });

        for (let i = 0; i < targetTotalQty; i++) {
            const distRand = window.getSeededRandom(shopKey, "dist", i);
            const index = Math.floor(distRand * selectedItems.length);
            selectedItems[Math.min(index, selectedItems.length - 1)].maxQty++;
        }

        this.currentStock = selectedItems.map(entry => {
            const item = entry.item;
            const initialQty = entry.maxQty;
            if (!player.shopLogs) player.shopLogs = {};
            if (!player.shopLogs[shopKey]) player.shopLogs[shopKey] = {};
            const boughtQty = player.shopLogs[shopKey][item.id] || 0;

            return {
                id: item.id, item: item,
                // 【修改点】买价 * 1.2
                price: Math.floor((item.price || item.value || 10) * 1.2),
                qty: Math.max(0, initialQty - boughtQty), maxQty: initialQty, shopKey: shopKey
            };
        });

        this.currentStock.sort((a, b) => (b.item.rarity || 1) - (a.item.rarity || 1));
    },

    // ================= 购买界面 =================
    uiBuy: function() {
        if (!this.currentStock || this.currentStock.length === 0) {
            window.showToast("铁匠：铁锭还没运来，先看看别的吧！");
            return;
        }



        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';

            const tags = [];
            if (item.effects) {
                Object.entries(item.effects).forEach(([key, val]) => {
                    const label = ATTR_MAPPING[key] || key;
                    const valStr = val > 0 ? `+${val}` : val;
                    tags.push(`<span style="display:inline-block; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">${label}${valStr}</span>`);
                });
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
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index%2===0?'#fafafa':'#fff'};">
                    <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                        <div style="color:${color}; font-weight:bold; font-size: 21px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">
                            ${item.name}
                        </div>
                        <div>${tags.join('')}</div>
                        <div style="font-size:15px; color:#888; font-style: italic;">${item.desc || '精铁打造'}</div>
                    </div>
                    <div style="width:120px; text-align:right; margin-right: 20px; flex-shrink:0;">
                        <div style="color:#d84315; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                        <div style="font-size:16px; color:${isSoldOut ? 'red' : '#999'};">库存: ${entry.qty}</div>
                    </div>
                    <div style="width:90px; text-align:right; flex-shrink:0;">
                        <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="BlacksmithShop.handleBuy(${index})"`}>${btnText}</button>
                    </div>
                </div>
            `;
        }).join('');

        const isModalVisible = this.modalBody && document.body.contains(this.modalBody);
        if (isModalVisible) {
            const listEl = this.modalBody.querySelector('#smith-buy-list');
            const moneyEl = this.modalBody.querySelector('#smith-buy-money');
            if (listEl && moneyEl) {
                const scrollTop = listEl.scrollTop;
                listEl.innerHTML = listHtml;
                moneyEl.innerText = `💰 ${player.money}`;
                requestAnimationFrame(() => { listEl.scrollTop = scrollTop; });
                return;
            }
        }

        const html = `
            <div id="smith-buy-container" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold;">⚒️ 兵甲铺子</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="smith-buy-money" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                        <button class="ink_btn" onclick="BlacksmithShop.renderMainMenu()" style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">返回</button>
                    </div>
                </div>
                <div id="smith-buy-list" style="flex:1; overflow-y:auto; padding:0; background: #fff;">
                    ${listHtml}
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    handleBuy: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0) return;
        if (player.money >= entry.price) {
            player.money -= entry.price;
            entry.qty--;
            if (window.UtilsAdd && window.UtilsAdd.addItem) window.UtilsAdd.addItem(entry.id, 1);
            const shopKey = entry.shopKey;
            if (shopKey) {
                if (!player.shopLogs) player.shopLogs = {};
                if (!player.shopLogs[shopKey]) player.shopLogs[shopKey] = {};
                player.shopLogs[shopKey][entry.id] = (player.shopLogs[shopKey][entry.id] || 0) + 1;
            }
            if(window.showToast) window.showToast(`购得 ${entry.item.name}`);
            this.uiBuy();
            if(window.updateUI) window.updateUI();
        } else {
            window.showToast("银子不够！");
        }
        window.saveGame();
    },

    // ================= 出售界面 =================
    uiSell: function() {
        const inventory = player.inventory || [];
        const sellableItems = [];

        inventory.forEach((slot, index) => {
            if (!slot) return;
            const itemId = slot.id || slot;
            const count = slot.count || 1;
            let itemData = window.GAME_DB.equipments.find(i => i.id === itemId) || window.GAME_DB.equipments?.[itemId];

            if (itemData && itemData.value) {
                // 【修改点】判断价格倍率
                const isSpecial = ['weapon', 'head', 'body', 'feet'].includes(itemData.type);
                // 武器类 0.6，其他 0.4
                const rate = isSpecial ? 0.6 : 0.4;
                const sellPrice = Math.floor(itemData.value * rate);
                sellableItems.push({ index: index, id: itemId, data: itemData, count: count, sellPrice: sellPrice });
            }
        });

        let listHtml = "";
        if (sellableItems.length === 0) {
            listHtml = `<div style="padding:40px; text-align:center; color:#999; font-size: 18px;">包袱里没啥打铁的材料或兵刃。</div>`;
        } else {
            listHtml = sellableItems.map(entry => {
                const item = entry.data;
                const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';
                const btnBase = "display:inline-block; border-radius: 4px; cursor: pointer; font-size: 16px; padding: 6px 15px; color: #fff; border: 1px solid;";

                return `
                    <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:#fff;">
                        <div style="flex:1; text-align:left; padding-right: 15px;">
                            <span style="color:${color}; font-weight:bold; font-size: 21px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">${item.name}</span>
                            <div style="font-size:14px; color:#999;">${item.desc || ''}</div>
                        </div>
                        <div style="width:110px; text-align:right; margin-right: 15px;">
                            <div style="color:#388e3c; font-weight:bold; font-size: 20px;">+${entry.sellPrice} 文</div>
                        </div>
                        <div style="width:160px; text-align:right; flex-shrink:0; display:flex; justify-content:flex-end; gap: 10px;">
                            <button style="${btnBase} background: linear-gradient(to bottom, #ffb74d, #f57c00); border-color: #e65100;" onclick="BlacksmithShop.handleSell(${entry.index}, ${entry.sellPrice})">卖出</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const isModalVisible = this.modalBody && document.body.contains(this.modalBody);
        if (isModalVisible) {
            const listEl = this.modalBody.querySelector('#smith-sell-list');
            const moneyEl = this.modalBody.querySelector('#smith-money-count');
            if (listEl && moneyEl) {
                listEl.innerHTML = listHtml;
                moneyEl.innerText = `💰 ${player.money}`;
                return;
            }
        }

        const html = `
            <div id="smith-sell-container" style="height: 100%; display:flex; flex-direction:column; background:#fff;">
                <div style="flex:0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold;">💰 回收兵甲 (高价)</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="smith-money-count" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                        <button class="ink_btn" onclick="BlacksmithShop.renderMainMenu()" style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">返回</button>
                    </div>
                </div>
                <div id="smith-sell-list" style="flex:1; overflow-y:auto; padding:0;">
                    ${listHtml}
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    handleSell: function(inventoryIndex, price) {
        if (!player.inventory || !player.inventory[inventoryIndex]) return;
        const slot = player.inventory[inventoryIndex];
        player.money += price;
        if (slot.count && slot.count > 1) slot.count--; else player.inventory.splice(inventoryIndex, 1);
        if(window.showToast) window.showToast(`铁匠收走了东西，付你 ${price} 文`);
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
        this.uiSell();
    }
};

if (window.ShopSystem) ShopSystem.register("铁匠铺", BlacksmithShop);
window.BlacksmithShop = BlacksmithShop;