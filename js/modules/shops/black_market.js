// js/modules/shops/inn.js
// 客栈功能模块 v2.8 (适配新版弹窗管理：DOM对象操作 + 局部刷新优化)
//console.log("加载 黑市模块");





const BlackMarket = {
    currentStock: [],
    currentTown: null,
    modalBody: null,

    // 入口：由 ShopSystem 调用
    enter: function(town) {
        this.currentTown = town;
        this._generateStock(town);
        this.uiBuy(); // 直接打开购买页面
    },

    _generateStock: function(town) {
        if (!window.getSeededRandom || !player) return;

        const monthIndex = player.time.month;
        // 【要求2】Key抬头叫 blackShop_
        const shopKey = `blackShop_${town.id}_${monthIndex}`;

        // 【要求3】种类10-30，总数10-50，最高稀有度6
        let config = { minType: 10, maxType: 30, minTotal: 10, maxTotal: 50, maxRarity: 6 };

        // 获取所有物品（不再过滤食物，而是所有物品）
        const allItems = Object.values(window.GAME_DB.items || {});
        const validItems = allItems.filter(item => {
            const r = item.rarity || 1;
            //如果type是book的话，name里不能包含_full
            if (item.type === 'book' && item.name.includes('_full')) return false;
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

        // 【要求3】稀有度配比
        const rarityWeights = { 1: 100, 2: 200, 3: 300, 4: 50, 5: 10, 6: 1 };

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



    // ================= 购买界面 =================
    // 渲染购买界面
    // ================= 购买界面 (修复版：解决重开失效问题) =================
    uiBuy: function() {
        if (!this.currentStock || this.currentStock.length === 0) {
            window.showToast("货郎：今晚没捞到什么好宝贝，客官请回吧。");
            return;
        }


        const levelNames = (window.SKILL_CONFIG && SKILL_CONFIG.levelNames)
            ? SKILL_CONFIG.levelNames
            : ["未入门", "入门", "进阶", "大成"];

        // 1. 生成列表 HTML (保持逻辑不变)
        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#eee';

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
            // 【新增】获取物品类型中文名称
            const typeMap = (window.TYPE_MAPPING) ? window.TYPE_MAPPING : {
                "weapon": "兵器", "head": "头部", "body": "身体", "feet": "足部",
                "mount": "坐骑", "pill": "丹药", "book": "秘籍", "food": "食物",
                "material": "材料", "tool": "工具", "fishing_rod": "钓具"
            };
            const typeName = typeMap[item.type] || "物品";

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
        <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #333; background:${index % 2 === 0 ? '#222' : '#1a1a1a'}; transition: background 0.2s;">
            <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                <div style="color:${color}; font-weight:bold; font-size: 21px; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 0 5px rgba(255,255,255,0.5);">
                    <span style="font-size:18px; color:#ddd; font-weight:normal; text-shadow:none; margin-right:2px;">【${typeName}】</span>${item.name}
                </div>
                <div>${effectTags}</div>
                <div style="font-size:15px; color:#aaa; font-style: italic;">${item.desc || '珍稀秘宝'}</div>
            </div>
            <div style="width:120px; text-align:right; margin-right: 20px; flex-shrink:0;">
                <div style="color:#ffd54f; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                <div style="font-size:16px; color:${isSoldOut ? '#f44336' : '#888'};">库存: ${entry.qty}</div>
            </div>
            <div style="width:90px; text-align:right; flex-shrink:0;">
                <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="BlackMarket.handleBuy(${index})"`}>${btnText}</button>
            </div>
        </div>
    `;
        }).join('');

        // 2. 【核心修复逻辑】
        // 检查当前 modalBody 是否在文档中，且是否真的可见（未被 hidden 类隐藏）
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
                return; // 成功局部刷新，拦截后面的初始化逻辑
            }
        }

        // 3. 全量刷新渲染 (如果上面没 return，说明需要重新打开窗口)
        const html = `
            <div id="black-buy-root" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#1a1a1a; color:#eee; font-family:Kaiti;">
                <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #444; display:flex; justify-content:space-between; align-items: center; background: #252525;">
                    <span style="font-size: 24px; font-weight: bold; color: #ffb74d;">🌙 秘密黑市</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="black-buy-money" style="color:#ffd54f; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                    </div>
                </div>
                <div id="black-buy-list" style="flex:1; overflow-y:auto; padding:0;">
                    ${listHtml}
                </div>
            </div>
        `;

        // 调用全局弹窗并记录新的引用
        this.modalBody = window.showGeneralModal(`黑市 - ${this.currentTown.name}`, html);
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