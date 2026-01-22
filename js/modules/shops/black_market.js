// js/modules/shops/black_market.js
// 黑市功能模块 v2.9 (UI风格重构：适配客栈亮色风格)

const BlackMarket = {
    currentStock: [],
    currentTown: null,
    modalBody: null,

    // 入口：由 ShopSystem 调用
    enter: function(town) {
        this.currentTown = town;
        this._generateStock(town);
        this.uiBuy(); // 直接打开购买页面
        // 触发集市引导
        if (window.UITutorial) UITutorial.checkBuilding('market');
    },

    _generateStock: function(town) {
        if (!window.getSeededRandom || !player) return;

        const monthIndex = player.time.month;
        //加上day
        const  dayIndex = player.time.day;
        const shopKey = `blackShop_${town.id}_${monthIndex}_${dayIndex}`;

        // 种类10-30，总数10-50，最高稀有度6
        let config = { minType: 10, maxType: 30, minTotal: 10, maxTotal: 50, maxRarity: 6 };

        // 获取所有物品
        const allItems = Object.values(window.GAME_DB.items || {});
        const validItems = allItems.filter(item => {
            const r = item.rarity || 1;
            //如果type是book的话，name里不能包含_full
            if (item.type === 'book' && item.id.includes('_full')) return false;

            //type不可以是material,foodMaterial,food,fish,herb,tool,mount
            if (item.type === 'material' || item.type === 'foodMaterial' || item.type === 'food' || item.type === 'fish' || item.type === 'herb' || item.type === 'tool' || item.type === 'mount') return false;

            return r <= config.maxRarity;

        });

        if (validItems.length === 0) { this.currentStock = []; return; }

        // 确定种类数量
        const randForType = window.getSeededRandom(shopKey, "typeCount");
        let targetTypeCount = Math.floor(randForType * (config.maxType - config.minType + 1)) + config.minType;
        targetTypeCount = Math.min(targetTypeCount, validItems.length);

        // 确定总商品数量
        const randForTotal = window.getSeededRandom(shopKey, "totalQty");
        let targetTotalQty = Math.floor(randForTotal * (config.maxTotal - config.minTotal + 1)) + config.minTotal;
        targetTotalQty = Math.max(targetTotalQty, targetTypeCount);

        // 稀有度配比
        const rarityWeights = { 1: 1000, 2: 2000, 3: 3000, 4: 500, 5: 10, 6: 0 };

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
                price: Math.floor((item.price || item.value || 10) * 2), // 黑市物价稍贵
                qty: Math.max(0, initialQty - boughtQty),
                maxQty: initialQty, shopKey: shopKey
            };
        });

        this.currentStock.sort((a, b) => (b.item.rarity || 1) - (a.item.rarity || 1));
    },

    // ================= 购买界面 (亮色风格修复版) =================
    uiBuy: function() {
        if (!this.currentStock || this.currentStock.length === 0) {
            window.showToast("货郎：今晚没捞到什么好宝贝，客官请回吧。");
            return;
        }


        const levelNames = (window.SKILL_CONFIG && SKILL_CONFIG.levelNames)
            ? SKILL_CONFIG.levelNames
            : ["未入门", "入门", "进阶", "大成"];

        // 1. 生成列表 HTML
        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            // 获取稀有度颜色，如果没有配置则给一个默认深色
            const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';

            let effectTags = '';
            if (item.effects) {
                const tags = [];
                Object.entries(item.effects).forEach(([key, val]) => {
                    if (key === 'buff' && typeof val === 'object') {
                        const buffAttrs = String(val.attr).split('_');
                        const buffVals = String(val.val).split('_');
                        const days = val.days || 0;
                        buffAttrs.forEach((attrKey, bIdx) => {
                            const label = ATTR_MAPPING[attrKey] || attrKey;
                            const currentVal = buffVals[bIdx] !== undefined ? buffVals[bIdx] : buffVals[0];
                            const valStr = parseInt(currentVal) > 0 ? `+${currentVal}` : currentVal;
                            tags.push(`<span style="display:inline-block; background:#f3e5f5; color:#7b1fa2; border:1px solid #e1bee7; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">${label}${valStr}<span style="opacity:1; font-size:15px;">(${days}天)</span></span>`);
                        });
                    }
                    else if (key === 'toxicity') {
                        tags.push(`<span style="display:inline-block; background:#fce4ec; color:#c2185b; border:1px solid #f8bbd0; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">毒素含量:${val}</span>`);
                    }
                    else if (key === 'max_skill_level') {
                        const levelStr = levelNames[val] || "未知";
                        tags.push(`<span style="display:inline-block; background:#fff3e0; color:#ef6c00; border:1px solid #ffe0b2; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">境界上限:${levelStr}</span>`);
                    }
                    else if (typeof val === 'number' && val !== 0) {
                        const label = ATTR_MAPPING[key] || key;
                        const valStr = val > 0 ? `+${val}` : val;
                        tags.push(`<span style="display:inline-block; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">${label}${valStr}</span>`);
                    }
                });
                effectTags = tags.join('');
            }

            // 获取物品类型中文名称

            const typeName = TYPE_MAPPING[item.type] || "物品";

            let btnText = "购买";
            const btnBase = "border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.2); font-size:18px; padding: 8px 18px; color: #fff; border: 1px solid;";
            let btnStyle = `${btnBase} background: linear-gradient(to bottom, #81c784, #4caf50); border-color: #2e7d32; cursor: pointer; text-shadow: 0 1px 1px rgba(0,0,0,0.3);`;

            if (isSoldOut) {
                btnText = "售罄";
                btnStyle = `${btnBase} background: #bdbdbd; border-color: #9e9e9e; color: #616161; cursor: not-allowed;`;
            } else if (!canAfford) {
                btnText = "缺钱";
                btnStyle = `${btnBase} background: #e0e0e0; border-color: #bdbdbd; color: #9e9e9e; cursor: not-allowed;`;
            }

            // 【风格修改】使用亮色背景 (斑马纹 #fafafa / #fff)
            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index % 2 === 0 ? '#fafafa' : '#fff'}; transition: background 0.2s;" 
                /* 【新增】鼠标移入显示详情 */
         onmouseenter="window.showShopItemTooltip(event, '${item.id}')"
         /* 【新增】鼠标移出隐藏 */
         onmouseleave="window.hideTooltip()"
                >
                    <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                        <div style="color:${color}; font-weight:bold; font-size: 21px;">
                            <span style="font-size:18px; color:#555; font-weight:normal; margin-right:2px;">【${typeName}】</span>${item.name}
                        </div>
                        <div>${effectTags}</div>
                        <div style="font-size:17px; color:#888; font-style: italic;">${item.desc || '珍稀秘宝'}</div>
                    </div>
                    <div style="width:120px; text-align:right; margin-right: 20px; flex-shrink:0;">
                        <div style="color:#d84315; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                        <div style="font-size:16px; color:${isSoldOut ? 'red' : '#999'};">库存: ${entry.qty}</div>
                    </div>
                    <div style="width:90px; text-align:right; flex-shrink:0;">
                        <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="BlackMarket.handleBuy(${index})"`}>${btnText}</button>
                    </div>
                </div>
            `;
        }).join('');

        // 2. 检查并执行局部刷新
        const isModalVisible = this.modalBody &&
            document.body.contains(this.modalBody) &&
            !this.modalBody.closest('.modal_overlay')?.classList.contains('hidden');

        if (isModalVisible) {
            const listContainer = this.modalBody.querySelector('#black-buy-list');
            const moneyEl = this.modalBody.querySelector('#black-buy-money');
            if (listContainer && moneyEl) {
                const scrollTop = listContainer.scrollTop;
                listContainer.innerHTML = listHtml;
                moneyEl.innerText = `💰 ${player.money}`;
                requestAnimationFrame(() => { listContainer.scrollTop = scrollTop; });
                return;
            }
        }

        // 3. 全量刷新渲染 (亮色风格容器)
        const html = `
            <div id="black-buy-root" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold; color: #333;">🌙 秘密黑市</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="black-buy-money" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                    </div>
                </div>
                <div id="black-buy-list" style="flex:1; overflow-y:auto; padding:0;">
                    ${listHtml}
                </div>
            </div>
        `;

        // 调用全局弹窗并记录新的引用
        this.modalBody = window.showGeneralModal(`黑市 - ${this.currentTown.name}`, html,null,"black_market_modal",68,85);
    },

    handleBuy: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0) return;

        if (window.player.money >= entry.price) {
            window.player.money -= entry.price;
            entry.qty--;

            // 更新日志
            const shopKey = entry.shopKey;
            if (!window.player.shopLogs) window.player.shopLogs = {};
            if (!window.player.shopLogs[shopKey]) window.player.shopLogs[shopKey] = {};
            window.player.shopLogs[shopKey][entry.id] = (window.player.shopLogs[shopKey][entry.id] || 0) + 1;

            // 添加物品到背包
            if (window.UtilsAdd && window.UtilsAdd.addItem) {
                window.UtilsAdd.addItem(entry.id, 1);
            }

            if (window.showToast) window.showToast(`成功购入 ${entry.item.name}`);

            // 刷新界面
            this.uiBuy();
            if (window.updateUI) window.updateUI();
            if (window.saveGame) window.saveGame();
        } else {
            if (window.showToast) window.showToast("金钱不足！");
        }
    }
};

// 注册到系统
if (window.ShopSystem) {
    ShopSystem.register("黑市", BlackMarket);
}

window.BlackMarket = BlackMarket;