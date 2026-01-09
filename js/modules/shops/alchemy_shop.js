// js/modules/shops/alchemy_shop.js
// 丹房功能模块 v1.0
//console.log("加载 丹房模块");

const AlchemyShop = {
    currentStock: [],
    currentTown: null,
    modalBody: null,

    // ================= 入口函数 =================
    enter: function(town) {
        this.currentTown = town;
        this._generateStock(town);
        this.renderMainMenu();
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
            <div class="inn-layout" style="display:flex; flex-direction:column; height:100%; padding: 10px;">
                <div class="inn-greeting" style="flex:0 0 auto; border-bottom:2px dashed #5d4037; margin-bottom:20px; padding:15px; font-family:'Kaiti'; font-size:30px; color:#3e2723; background:rgba(255,255,255,0.5); border-radius:8px;">
                    <p style="margin:5px 0;">丹师：仙道漫漫，唯丹药可夺天地之造化。</p>
                    <p style="margin:5px 0;">你是要进几丸成品仙丹，还是寻些年份老到的灵草？</p>
                    <p style="margin:5px 0;">是药三分毒，客官服用前还需掂量一二。</p>
                </div>

                <div class="inn-actions" style="flex:1; display:flex; justify-content:center; align-items:center; gap: 30px;">
                    <button class="ink_btn" onclick="AlchemyShop.uiBuy()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        💊 购买
                    </button>
                    <button class="ink_btn" onclick="AlchemyShop.uiSell()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        💰 出售
                    </button>
                </div>

                <div class="inn-footer" style="text-align:right; margin-top:20px; font-size: 18px; font-weight:bold; color:#d84315;">
                    当前盘缠: ${player.money} 文
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`${townName} - 丹房`, html);
    },

    // ================= 库存生成 (丹药 pill + 灵草 material/herbs) =================
    _generateStock: function(town) {
        if (!window.getSeededRandom || !player) return;

        const monthIndex = player.time.month;
        const shopKey = `alchemy_${town.id}_${monthIndex}`;

        let config = { minType: 5, maxType: 8, minTotal: 10, maxTotal: 16, maxRarity: 3 };
        if (town.level === 'city') config = { minType: 10, maxType: 15, minTotal: 20, maxTotal: 30, maxRarity: 6 };
        else if (town.level === 'town') config = { minType: 8, maxType: 10, minTotal: 10, maxTotal: 20, maxRarity: 5 };

        const allItems = Object.values(pills || {});
        const validItems = allItems.filter(item => {
            // 【要求】只卖丹药或药材类材料
            const isPill = item.type === 'pill';
            const isHerb = item.type === 'material' && item.subType === 'herbs';
            if (!isPill && !isHerb) return false;

            const r = item.rarity || 1;
            return r <= config.maxRarity;
        });

        if (validItems.length === 0) { this.currentStock = []; return; }

        const randForType = window.getSeededRandom(shopKey, "typeCount");
        let targetTypeCount = Math.min(Math.floor(randForType * (config.maxType - config.minType + 1)) + config.minType, validItems.length);

        const randForTotal = window.getSeededRandom(shopKey, "totalQty");
        let targetTotalQty = Math.max(Math.floor(randForTotal * (config.maxTotal - config.minTotal + 1)) + config.minTotal, targetTypeCount);

        const rarityWeights = { 1: 100, 2: 60, 3: 30, 4: 10, 5: 2, 6: 0.5 };

        const scoredItems = validItems.map(item => {
            const r = item.rarity || 1;
            const weight = rarityWeights[r] || 10;
            const randVal = window.getSeededRandom(shopKey, item.id, "rank");
            const score = Math.pow(randVal > 0 ? randVal : 0.0001, 1 / (weight > 0 ? weight : 1));
            return { item: item, score: score, maxQty: 0 };
        });

        scoredItems.sort((a, b) => b.score - a.score);
        const selectedItems = scoredItems.slice(0, targetTypeCount);
        selectedItems.forEach(entry => { entry.maxQty = 1; targetTotalQty--; });

        for (let i = 0; i < targetTotalQty; i++) {
            const distRand = window.getSeededRandom(shopKey, "dist", i);
            selectedItems[Math.floor(distRand * selectedItems.length)].maxQty++;
        }

        this.currentStock = selectedItems.map(entry => {
            const item = entry.item;
            const initialQty = entry.maxQty;
            const boughtQty = (player.shopLogs?.[shopKey]?.[item.id]) || 0;
            return {
                id: item.id, item: item, price: item.price || item.value || 10,
                qty: Math.max(0, initialQty - boughtQty), maxQty: initialQty, shopKey: shopKey
            };
        });

        this.currentStock.sort((a, b) => (b.item.rarity || 1) - (a.item.rarity || 1));
    },

    // ================= 购买界面 =================
    uiBuy: function() {
        if (!this.currentStock || this.currentStock.length === 0) {
            window.showToast("丹师：炉子炸了，这月没丹药了！");
            return;
        }


        const levelNames = (window.SKILL_CONFIG && SKILL_CONFIG.levelNames) ? SKILL_CONFIG.levelNames : ["未入门", "入门", "进阶", "大成"];

        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            const color = (window.RARITY_CONFIG?.[item.rarity]?.color) || '#333';

            const tags = [];
            if (item.effects) {
                Object.entries(item.effects).forEach(([key, val]) => {
                    if (key === 'buff' && typeof val === 'object') {
                        const bAttrs = String(val.attr).split('_'), bVals = String(val.val).split('_');
                        bAttrs.forEach((aK, bI) => {
                            const l = ATTR_MAPPING[aK] || aK;
                            const cV = bVals[bI] !== undefined ? bVals[bI] : bVals[0];
                            const valStr = parseInt(cV) > 0 ? '+' : '';

                            // 【修改点】将 <small> 替换为 <span style="opacity:0.8;">
                            tags.push(`
        <span style="display:inline-block; background:#f3e5f5; color:#7b1fa2; border:1px solid #e1bee7; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px; margin-bottom:2px;">
            ${l}${valStr}${cV}<span style="opacity:0.8;">(${val.days}天)</span>
        </span>
    `);
                        });
                    }
                    // 【要求】毒素含量显示
                    else if (key === 'toxicity') {
                        tags.push(`<span style="display:inline-block; background:#fce4ec; color:#c2185b; border:1px solid #f8bbd0; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px; margin-bottom:2px;">毒素含量:${val}</span>`);
                    }
                    // 【要求】境界上限转换显示
                    else if (key === 'max_skill_level') {
                        tags.push(`<span style="display:inline-block; background:#fff3e0; color:#ef6c00; border:1px solid #ffe0b2; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px; margin-bottom:2px;">境界上限:${levelNames[val] || "未知"}</span>`);
                    }
                    else if (typeof val === 'number' && val !== 0) {
                        const l = ATTR_MAPPING[key] || key;
                        tags.push(`<span style="display:inline-block; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px; margin-bottom:2px;">${l}${val > 0 ? '+' : ''}${val}</span>`);
                    }
                });
            }

            const btnBase = "border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.2); font-size:18px; padding: 8px 18px; color: #fff; border: 1px solid;";
            let btnStyle = `${btnBase} background: linear-gradient(to bottom, #81c784, #4caf50); border-color: #2e7d32; cursor: pointer;`;
            if (isSoldOut) btnStyle = `${btnBase} background: #bdbdbd; border-color: #9e9e9e; color: #616161; cursor: not-allowed;`;
            else if (!canAfford) btnStyle = `${btnBase} background: #e0e0e0; border-color: #bdbdbd; color: #9e9e9e; cursor: not-allowed;`;

            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index%2===0?'#fafafa':'#fff'};">
                    <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                        <div style="color:${color}; font-weight:bold; font-size: 21px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">
                            ${item.name}
                        </div>
                        <div>${tags.join('')}</div>
                        <div style="font-size:15px; color:#888; font-style: italic;">${item.desc || '丹房出品'}</div>
                    </div>
                    <div style="width:120px; text-align:right; margin-right: 20px; flex-shrink:0;">
                        <div style="color:#d84315; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                        <div style="font-size:16px; color:${isSoldOut ? 'red' : '#999'};">库存: ${entry.qty}</div>
                    </div>
                    <div style="width:90px; text-align:right; flex-shrink:0;">
                        <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="AlchemyShop.handleBuy(${index})"`}>${isSoldOut ? '售罄' : (canAfford ? '购买' : '缺钱')}</button>
                    </div>
                </div>
            `;
        }).join('');

        const isModalVisible = this.modalBody && document.body.contains(this.modalBody);
        if (isModalVisible) {
            const listEl = this.modalBody.querySelector('#pill-buy-list'), moneyEl = this.modalBody.querySelector('#pill-buy-money');
            if (listEl && moneyEl) {
                const scrollTop = listEl.scrollTop;
                listEl.innerHTML = listHtml;
                moneyEl.innerText = `💰 ${player.money}`;
                requestAnimationFrame(() => { listEl.scrollTop = scrollTop; });
                return;
            }
        }

        const html = `
            <div id="pill-buy-container" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold;">💊 丹房内柜</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="pill-buy-money" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                        <button class="ink_btn" onclick="AlchemyShop.renderMainMenu()" style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">返回</button>
                    </div>
                </div>
                <div id="pill-buy-list" style="flex:1; overflow-y:auto; padding:0; background: #fff;">${listHtml}</div>
            </div>
        `;
        this._updateContent(html);
    },

    handleBuy: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0 || player.money < entry.price) return;
        player.money -= entry.price; entry.qty--;
        if (window.UtilsAdd?.addItem) window.UtilsAdd.addItem(entry.id, 1);
        if (entry.shopKey) {
            if (!player.shopLogs) player.shopLogs = {};
            if (!player.shopLogs[entry.shopKey]) player.shopLogs[entry.shopKey] = {};
            player.shopLogs[entry.shopKey][entry.id] = (player.shopLogs[entry.shopKey][entry.id] || 0) + 1;
        }
        if(window.showToast) window.showToast(`购入 ${entry.item.name}`);
        this.uiBuy(); if(window.updateUI) window.updateUI(); window.saveGame();
    },

    // ================= 出售界面 (灵草 0.8 / 其他 0.5) =================
    uiSell: function() {
        const inventory = player.inventory || [];
        const sellableItems = [];

        inventory.forEach((slot, index) => {
            if (!slot) return;
            const itemId = slot.id || slot;
            let itemData = window.GAME_DB.items.find(i => i.id === itemId) || window.GAME_DB.items?.[itemId];

            if (itemData && itemData.value) {
                // 【要求】灵草类 0.8，其他 0.5
                const isHerb = itemData.type === 'material' && itemData.subType === 'herbs';
                const sellPrice = Math.floor(itemData.value * (isHerb ? 0.8 : 0.5));
                sellableItems.push({ index: index, id: itemId, data: itemData, count: slot.count || 1, sellPrice: sellPrice });
            }
        });

        let listHtml = sellableItems.length === 0 ? `<div style="padding:40px; text-align:center; color:#999; font-size: 18px;">包袱里暂无丹师看得上的材料。</div>` : sellableItems.map(entry => {
            const item = entry.data, color = (window.RARITY_CONFIG?.[item.rarity]?.color) || '#333';
            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:#fff;">
                    <div style="flex:1; text-align:left; padding-right: 15px;">
                        <span style="color:${color}; font-weight:bold; font-size: 21px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;">${item.name}</span>
                        <div style="font-size:14px; color:#999;">${item.desc || ''}</div>
                    </div>
                    <div style="width:110px; text-align:right; margin-right: 15px;"><div style="color:#388e3c; font-weight:bold; font-size: 20px;">+${entry.sellPrice} 文</div></div>
                    <div style="width:160px; text-align:right; flex-shrink:0; display:flex; justify-content:flex-end; gap: 10px;">
                        <button style="border-radius:4px; cursor:pointer; font-size:16px; padding:6px 15px; color:#fff; border:1px solid; background:linear-gradient(to bottom, #ffb74d, #f57c00); border-color:#e65100;" onclick="AlchemyShop.handleSell(${entry.index}, ${entry.sellPrice})">卖出</button>
                    </div>
                </div>
            `;
        }).join('');

        const isModalVisible = this.modalBody && document.body.contains(this.modalBody);
        if (isModalVisible) {
            const listEl = this.modalBody.querySelector('#pill-sell-list'), moneyEl = this.modalBody.querySelector('#pill-money-count');
            if (listEl && moneyEl) { listEl.innerHTML = listHtml; moneyEl.innerText = `💰 ${player.money}`; return; }
        }

        const html = `
            <div id="pill-sell-container" style="height: 100%; display:flex; flex-direction:column; background:#fff;">
                <div style="flex:0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold;">💰 回收药材 (特价)</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="pill-money-count" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                        <button class="ink_btn" onclick="AlchemyShop.renderMainMenu()" style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">返回</button>
                    </div>
                </div>
                <div id="pill-sell-list" style="flex:1; overflow-y:auto; padding:0;">${listHtml}</div>
            </div>
        `;
        this._updateContent(html);
    },

    handleSell: function(inventoryIndex, price) {
        if (!player.inventory?.[inventoryIndex]) return;
        const slot = player.inventory[inventoryIndex]; player.money += price;
        if (slot.count && slot.count > 1) slot.count--; else player.inventory.splice(inventoryIndex, 1);
        if(window.showToast) window.showToast(`交易达成，得 ${price} 文`);
        if(window.updateUI) window.updateUI(); if(window.saveGame) window.saveGame(); this.uiSell();
    }
};

if (window.ShopSystem) ShopSystem.register("丹房", AlchemyShop);
window.AlchemyShop = AlchemyShop;