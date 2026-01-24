// js/modules/shops/inn.js
// 客栈功能模块 v2.9 (适配UtilsItem的SID移除逻辑)
//console.log("加载 客栈模块");

// 注入样式 (保持原样)
const innStyles = `
<style id="inn-custom-styles">
    /* 悬浮提示触发器 */
    .inn-tooltip { position: relative; cursor: help; border-bottom: 1px dashed #ff6f00; display: inline-block; }
    /* 悬浮提示内容框 */
    .inn-tooltip .inn-tooltip-text {
        visibility: hidden; width: 240px; background-color: rgba(62, 39, 35, 0.95);
        color: #fff; text-align: left; border-radius: 6px; padding: 12px;
        position: absolute; z-index: 9999; bottom: 125%; left: 50%;
        margin-left: -120px; opacity: 0; transition: opacity 0.3s;
        box-shadow: 0 4px 8px rgba(0,0,0,0.5); border: 1px solid #d7ccc8;
        font-size: 14px; line-height: 1.5; font-family: "Microsoft YaHei", sans-serif;
        pointer-events: none;
    }
    .inn-tooltip .inn-tooltip-text::after {
        content: ""; position: absolute; top: 100%; left: 50%; margin-left: -5px;
        border-width: 5px; border-style: solid; border-color: rgba(62, 39, 35, 0.95) transparent transparent transparent;
    }
    .inn-tooltip:hover .inn-tooltip-text { visibility: visible; opacity: 1; }
    /* 确认弹窗遮罩 */
    .inn-confirm-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.6); z-index: 20000;
        display: flex; justify-content: center; align-items: center; animation: fadeIn 0.2s ease-out;
    }
    /* 确认弹窗本体 */
    .inn-confirm-box {
        background-color: #fdfbf7;
        background-image: linear-gradient(#fdfbf7 2px, transparent 2px), linear-gradient(90deg, #fdfbf7 2px, transparent 2px), linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px);
        background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
        border: 4px double #5d4037; border-radius: 8px; padding: 25px; width: 380px;
        text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); position: relative;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
`;

if (!document.getElementById('inn-custom-styles')) {
    document.head.insertAdjacentHTML('beforeend', innStyles);
}

const InnShop = {
    currentStock: [],
    currentTown: null,
    modalBody: null,

    // ================= 入口函数 =================
    enter: function(town) {
        this.currentTown = town;
        this._generateStock(town);
        this.renderMainMenu();
        if (window.UITutorial) UITutorial.checkBuilding('inn');
    },

    // ================= 辅助：更新内容 =================
    _updateContent: function(html) {
        if (this.modalBody) {
            this.modalBody.innerHTML = html;
        } else {
            console.warn("InnShop: 弹窗引用丢失，重新打开");
            this.renderMainMenu();
        }
    },

    // ================= 主界面渲染 =================
    renderMainMenu: function() {
        if (!window.showGeneralModal) return;

        const townName = this.currentTown.name;
        const html = `
            <div id="inn_panel_main" class="inn-layout" style="display:flex; flex-direction:column; height:100%; padding: 10px;">
                <div class="inn-greeting" style="flex:0 0 auto; border-bottom:2px dashed #5d4037; margin-bottom:20px; padding:15px; font-family:'Kaiti'; font-size:30px; color:#3e2723; background:rgba(255,255,255,0.5); border-radius:8px;">
                    <p style="margin:5px 0;">店小二：哎哟，客官您里面请！</p>
                    <p style="margin:5px 0;">咱们这儿可是【${townName}】最好的歇脚地儿。</p>
                    <p style="margin:5px 0;">您是打尖儿呢，还是住店？</p>
                </div>

                <div class="inn-actions" style="flex:1; display:flex; justify-content:center; align-items:center; gap: 30px;">
                    <button class="ink_btn" onclick="InnShop.uiStay()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        🛌 住宿
                    </button>
                    <button class="ink_btn" onclick="InnShop.uiBuy()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        🍶 购买
                    </button>
                    <button class="ink_btn" onclick="InnShop.uiSell()" 
                            style="font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                        💰 出售
                    </button>
                </div>

                <div class="inn-footer" style="text-align:right; margin-top:20px; font-size: 18px; font-weight:bold; color:#d84315;">
                    当前盘缠: ${player.money} 文
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`${townName} - 客栈`, html, null, "inn_modal", 68, 85);
    },

    // ================= 功能1：住宿 =================
    uiStay: function() {
        const buffDesc = `
            <span style="color:#ffd54f; font-weight:bold;">【神光焕发】</span><br>
            <span style="color:#bbb;">----------------</span><br>
            攻击力 +20%<br>
            防御力 +20%<br>
            身法速度 +20%<br>
            <span style="color:#81c784;">持续时间: 3天</span>
        `;

        const html = `
            <div style="padding:20px; text-align:center;">
                <h3 style="margin-bottom:40px; font-family:'Kaiti'; font-size: 32px;">请选择客房等级</h3>
                
                <div style="display:flex; gap:50px; justify-content:center;">
                    <div class="choice-card" onclick="InnShop.confirmStay('normal')" 
                         style="border:2px solid #8d6e63; padding:26px; border-radius:12px; cursor:pointer; width:260px; background:rgba(255,255,255,0.6); box-shadow: 0 3px 6px rgba(0,0,0,0.15); transition: transform 0.2s;">
                        <div style="font-weight:bold; font-size:26px; margin-bottom:15px;">普通客房</div>
                        <div style="color:#d84315; margin:20px 0; font-size: 24px;">100 文</div>
                        <div style="font-size:18px; color:#555; line-height: 1.6;">恢复200饱食<br>清空疲劳/中毒</div>
                    </div>

                    <div class="choice-card" onclick="InnShop.confirmStay('premium')" 
                         style="border:2px solid #d84315; padding:26px; border-radius:12px; cursor:pointer; width:260px; background:rgba(255,248,225,0.9); box-shadow: 0 5px 10px rgba(216, 67, 21, 0.25); transition: transform 0.2s;">
                        <div style="font-weight:bold; font-size:26px; color:#d84315; margin-bottom:15px;">🍱 上等客房</div>
                        <div style="color:#d84315; margin:20px 0; font-size: 24px;">500 文</div>
                        <div style="font-size:18px; color:#555; line-height: 1.6;">
                            普通房效果 + <br>
                            <div class="inn-tooltip">
                                <div style="font-size:18px; color:#555; line-height: 1.6;">恢复全部饱食<br>清空疲劳/中毒</div>
                                <span style="color:#ff6f00; font-weight:bold;">BUFF:神光焕发(3天)</span>
                                <span class="inn-tooltip-text">${buffDesc}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:60px;">
                    <button class="ink_btn" onclick="InnShop.renderMainMenu()" style="font-size: 24px; padding: 15px 45px;">返回</button>
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    // ================= 确认弹窗逻辑 =================
    confirmStay: function(type) {
        const cost = (type === 'premium') ? 500 : 100;
        const roomName = (type === 'premium') ? '上等客房' : '普通客房';

        if (player.money < cost) {
            if(window.showToast) window.showToast("掌柜：客官，您的银子好像不够啊...");
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'inn-confirm-modal';
        overlay.className = 'inn-confirm-overlay';

        overlay.innerHTML = `
            <div class="inn-confirm-box">
                <div style="font-family:'Kaiti'; font-size:28px; font-weight:bold; margin-bottom:20px; color:#3e2723; border-bottom: 1px solid #d7ccc8; padding-bottom:10px;">
                    入住确认
                </div>
                <div style="font-size:20px; color:#5d4037; line-height:1.6; margin-bottom:30px;">
                    客官，您欲入住<span style="color:#d84315; font-weight:bold;">【${roomName}】</span>？<br>
                    需支付房资 <span style="font-size:24px; font-weight:bold; color:#d84315;">${cost}</span> 文。
                </div>
                <div style="display:flex; justify-content:space-around;">
                    <button onclick="InnShop.closeConfirm()" 
                        style="padding:10px 30px; font-size:18px; cursor:pointer; background:#eee; border:1px solid #999; border-radius:4px; color:#666;">
                        再想想
                    </button>
                    <button onclick="InnShop.executeStay('${type}')" 
                        style="padding:10px 30px; font-size:18px; cursor:pointer; background:#d84315; border:1px solid #bf360c; border-radius:4px; color:#fff; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                        成交
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    closeConfirm: function() {
        const overlay = document.getElementById('inn-confirm-modal');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    },

    // ================= 住宿执行逻辑 (最新调整版) =================
    executeStay: function(type) {
        this.closeConfirm();

        // 1. 价格判定：上等 500，普通 100
        const cost = (type === 'premium') ? 500 : 100;
        if (player.money < cost) {
            if(window.showToast) window.showToast("囊中羞涩，连个床位都定不起...");
            return;
        }

        // 2. 时间计算：睡到清晨 6 点
        const currentHour = player.time.hour;
        let hoursToSleep = 0;
        if (currentHour < 6) {
            hoursToSleep = 6 - currentHour;
        } else {
            hoursToSleep = (24 - currentHour) + 6;
        }

        // 3. 执行扣费
        player.money -= cost;


        //  调用时间系统
        if (window.TimeSystem && window.TimeSystem.passTime) {
            window.TimeSystem.passTime(hoursToSleep);
        }

        // 4. 状态恢复核心逻辑
        player.status.fatigue = 0;  // 无论哪种房间，疲劳都清零
        if (player.status.toxicity) player.status.toxicity = 0; // 清除丹毒/中毒

        if (type === 'premium') {
            // --- 上等客房待遇 ---
            player.status.hunger = player.derived.hungerMax; // 饱食度回满
            player.status.hp = player.derived.hpMax;         // 状态回满
            player.status.mp = player.derived.mpMax;

            // 添加 3 天的高级 Buff
            const buffData = {
                name: "神光焕发", attr: "全属性", val: "+20%", days: 3, source: "上等客房",
                desc: "在天字号房美美睡了一觉，只觉神清气爽，法力充沛。",
                effects: { atkPct: 0.20, defPct: 0.20, spdPct: 0.20 }
            };
            if (window.addBuff) window.addBuff('buff_inn_rest', buffData);
        } else {
            // --- 普通客房待遇 ---
            player.status.hunger = Math.min(player.derived.hungerMax, player.status.hunger + 200); // 回复200点，不超过上限
            // 普通客房仅回复少量生命/法力（可选，这里设置为回满或按比例，通常普通房间也能睡饱）
            player.status.hp = player.derived.hpMax;
        }



        // 6. UI 刷新与提示文字修改
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();

        const toastMsg = (type === 'premium')
            ? `支付 ${cost} 文入住天字号房，这一觉神清气爽，已是清晨。`
            : `支付 ${cost} 文入住普通客房，填了填肚子，睡到清晨起身。`;

        if(window.showToast) window.showToast(toastMsg);

        setTimeout(() => {
            // 住宿后自动存档
            if (window.saveGame) window.saveGame();

            // 触发清晨对话
            showDialogue("店小二", "（咚咚咚——）客官！天色破晓，寅时已过，该起程啦！后厨刚熬好了热腾腾的米粥，您快下楼趁热用点，莫要误了今日的行程！", "left", () => {
                // 对话结束后的可选操作，例如刷新UI
                if (window.updateUI) window.updateUI();
            }, true);
        }, 600); // 建议延迟时间略长于时间流逝动画

        // 返回主菜单
        this.renderMainMenu();
    },

    // ================= 库存生成 =================
    _generateStock: function(town) {
        if (!window.getSeededRandom || !player) return;

        // 【修改】加入 day
        const timeKey = `${player.time.month}_${player.time.day}`;
        const shopKey = `shop_${town.id}_inn_${timeKey}`;

        let config = { minType: 5, maxType: 8, minTotal: 10, maxTotal: 16, maxRarity: 3 };
        if (town.level === 'city') config = { minType: 10, maxType: 15, minTotal: 50, maxTotal: 75, maxRarity: 6 };
        else if (town.level === 'town') config = { minType: 8, maxType: 10, minTotal: 10, maxTotal: 20, maxRarity: 5 };

        const allItems = Object.values(foods || {});
        const validItems = allItems.filter(item => {
            if (item.type !== 'food') return false;
            const r = item.rarity || 1;
            return r <= config.maxRarity;
        });

        if (validItems.length === 0) { this.currentStock = []; return; }

        const randForType = window.getSeededRandom(shopKey, "typeCount");
        let targetTypeCount = Math.round(randForType * (config.maxType - config.minType + 1)) + config.minType;
        targetTypeCount = Math.min(targetTypeCount, validItems.length);

        const randForTotal = window.getSeededRandom(shopKey, "totalQty");
        let targetTotalQty = Math.round(randForTotal * (config.maxTotal - config.minTotal + 1)) + config.minTotal;
        targetTotalQty = Math.max(targetTotalQty, targetTypeCount);

        const rarityWeights = { 1: 1000, 2: 600, 3: 300, 4: 100, 5: 0, 6: 0 };

        const scoredItems = validItems.map(item => {
            const r = item.rarity || 1;
            const weight = rarityWeights[r] || 0;
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
            const index = Math.round(distRand * selectedItems.length);
            const safeIndex = Math.min(index, selectedItems.length - 1);
            selectedItems[safeIndex].maxQty++;
        }

        const stock = selectedItems.map(entry => {
            const item = entry.item;
            const initialQty = entry.maxQty;
            if (!player.shopLogs) player.shopLogs = {};
            if (!player.shopLogs[shopKey]) player.shopLogs[shopKey] = {};
            const boughtQty = player.shopLogs[shopKey][item.id] || 0;
            const finalQty = Math.max(0, initialQty - boughtQty);

            return {
                id: item.id, item: item, price: item.price || item.value || 10,
                qty: finalQty, maxQty: initialQty, shopKey: shopKey
            };
        });

        stock.sort((a, b) => (b.item.rarity || 1) - (a.item.rarity || 1));
        this.currentStock = stock;
    },

    // ================= 购买界面 =================
    uiBuy: function() {
        if (!this.currentStock || this.currentStock.length === 0) {
            window.showToast("掌柜：本月货物尚未运到，请稍后再来！");
            return;
        }

        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';

            let effectTags = '';
            if (item.effects) {
                const ATTR_MAPPING = { hunger: "饱食", hp: "生命", mp: "法力", atk: "攻击", def: "防御", speed: "速度", jing: "精", qi: "气", shen: "神" };
                const tags = [];

                Object.entries(item.effects).forEach(([key, val]) => {
                    if (key === 'buff' && typeof val === 'object') {
                        const buffAttrs = String(val.attr).split('_');
                        const buffVals = String(val.val).split('_');
                        const days = val.days || 0;

                        buffAttrs.forEach((attrKey, index) => {
                            const label = ATTR_MAPPING[attrKey] || attrKey;
                            const currentVal = buffVals[index] !== undefined ? buffVals[index] : buffVals[0];
                            const valStr = parseInt(currentVal) > 0 ? `+${currentVal}` : currentVal;

                            tags.push(`
                    <span style="display:inline-block; background:#f3e5f5; color:#7b1fa2; border:1px solid #e1bee7; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">
                        ${label}${valStr}<span style="font-size:15px; opacity:1;">(${days}天)</span>
                    </span>
                `);
                        });
                    }
                    else if (typeof val === 'number' && val !== 0) {
                        const label = ATTR_MAPPING[key] || key;
                        const valStr = val > 0 ? `+${val}` : val;
                        tags.push(`
                <span style="display:inline-block; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">
                    ${label}${valStr}
                </span>
            `);
                    }
                });

                effectTags = tags.join('');
            }

            let btnText = "购买";
            let onclick = `InnShop.handleBuy(${index})`;
            const btnBase = "border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.2); font-size:18px; padding: 8px 18px; color: #fff; border: 1px solid;";
            let btnStyle = `${btnBase} background: linear-gradient(to bottom, #81c784, #4caf50); border-color: #2e7d32; cursor: pointer; text-shadow: 0 1px 1px rgba(0,0,0,0.3);`;

            // 【新增】批量按钮
            let bulkBtnHtml = '';
            if (!isSoldOut && canAfford) {
                const maxCanBuy = Math.floor(player.money / entry.price);
                const buyNum = Math.min(entry.qty, maxCanBuy);
                if (buyNum > 1) {
                    const bulkStyle = `${btnBase} background: linear-gradient(to bottom, #4fc3f7, #0288d1); border-color: #01579b; cursor: pointer; margin-right:5px;`;
                    bulkBtnHtml = `<button style="${bulkStyle}" onclick="InnShop.handleBuyBulk(${index})">全买</button>`;
                }
            }

            if (isSoldOut) {
                btnText = "售罄";
                btnStyle = `${btnBase} background: #bdbdbd; border-color: #9e9e9e; color: #616161; cursor: not-allowed;`;
                onclick = "";
            } else if (!canAfford) {
                btnText = "缺钱";
                btnStyle = `${btnBase} background: #e0e0e0; border-color: #bdbdbd; color: #9e9e9e; cursor: not-allowed;`;
                onclick = "";
            }

            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index%2===0?'#fafafa':'#fff'}; transition: background 0.2s;"
                /* 【新增】鼠标移入显示详情 */
         onmouseenter="window.showShopItemTooltip(event, '${item.id}')"
         /* 【新增】鼠标移出隐藏 */
         onmouseleave="window.hideTooltip()"
                >
                    <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                        <div style="color:${color}; font-weight:bold; font-size: 21px;">${item.name}</div>
                        <div>${effectTags}</div>
                        <div style="font-size:17px; color:#888; font-style: italic;">${item.desc || '美味佳肴'}</div>
                    </div>
                   <div style="width:120px; text-align:right; margin-right: 20px; flex-shrink:0;">
                        <div style="color:#d84315; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                        <div style="font-size:16px; color:${isSoldOut ? 'red' : '#999'};">库存: ${entry.qty}</div>
                    </div>
                    <div style="width:160px; text-align:right; flex-shrink:0;">
                        ${bulkBtnHtml}
                        <button style="${btnStyle}" onclick="${onclick}">${btnText}</button>
                    </div>
                </div>
            `;
        }).join('');

        if (!this.modalBody) return;

        const container = this.modalBody.querySelector('#inn-buy-container');
        const listEl = this.modalBody.querySelector('#inn-buy-list');
        const moneyEl = this.modalBody.querySelector('#inn-buy-money');

        if (container && listEl && moneyEl) {
            const scrollTop = listEl.scrollTop;
            listEl.innerHTML = listHtml;
            moneyEl.innerText = `💰 ${player.money}`;
            requestAnimationFrame(() => { listEl.scrollTop = scrollTop; });
        } else {
            const html = `
                <div id="inn-buy-container" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                    <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                        <span style="font-size: 24px; font-weight: bold;">🍱 客栈小铺</span>
                        <div style="display:flex; align-items:center; gap: 20px;">
                            <span id="inn-buy-money" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                            <button class="ink_btn" onclick="InnShop.renderMainMenu()" 
                                    style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">
                                返回
                            </button>
                        </div>
                    </div>
                    <div id="inn-buy-list" style="flex:1; overflow-y:auto; padding:0; background: #fff;">
                        ${listHtml}
                    </div>
                </div>
            `;
            this._updateContent(html);
        }
        window.updateUI();
        window.saveGame();
    },

    handleBuy: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0) return;

        if (player.money >= entry.price) {
            player.money -= entry.price;
            entry.qty--;

            if (window.UtilsAdd && window.UtilsAdd.addItem) {
                window.UtilsAdd.addItem(entry.id, 1);
            } else {
                if (!player.inventory[entry.id]) player.inventory[entry.id] = 0;
                player.inventory[entry.id]++;
            }

            const shopKey = entry.shopKey;
            if (shopKey) {
                if (!player.shopLogs) player.shopLogs = {};
                if (!player.shopLogs[shopKey]) player.shopLogs[shopKey] = {};
                if (!player.shopLogs[shopKey][entry.id]) player.shopLogs[shopKey][entry.id] = 0;
                player.shopLogs[shopKey][entry.id]++;
            }

            if(window.showToast) window.showToast(`购买了 ${entry.item.name}`);
            this.uiBuy();
            if(window.updateUI) window.updateUI();
        } else {
            window.showToast("银两不足！");
        }

        window.saveGame();
    },
    handleBuyBulk: function(index) {
        const entry = this.currentStock[index];
        if (!entry || entry.qty <= 0) return;

        const maxCanBuy = Math.floor(player.money / entry.price);
        const buyQty = Math.min(entry.qty, maxCanBuy);

        if (buyQty <= 0) { window.showToast("银两不足！"); return; }

        player.money -= (buyQty * entry.price);
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

        if(window.showToast) window.showToast(`买了 ${buyQty} 份 ${entry.item.name}`);
        this.uiBuy();
        if(window.updateUI) window.updateUI();
        window.saveGame();
    },

    // ================= 出售界面 (适配 SID) =================
    uiSell: function() {
        const inventory = player.inventory || [];
        const sellableItems = [];

        inventory.forEach((slot, index) => {
            if (!slot) return;
            const itemId = slot.id || slot;
            const count = slot.count || 1;
            let itemData = slot;

            // 【核心修改】确保获取 sid，并放入列表数据中
            if (itemData && itemData.value && itemData.sid) {
                sellableItems.push({ sid: itemData.sid, id: itemId, data: itemData, count: count });
            }
        });

        let listHtml = "";
        if (sellableItems.length === 0) {
            listHtml = `<div style="padding:40px; text-align:center; color:#999; font-size: 18px;">你的包袱里空空如也，没什么可卖的。</div>`;
        } else {
            const ATTR_MAPPING = { hunger: "饱食", hp: "生命", mp: "法力", hp_max: "生命上限", atk: "攻击", def: "防御", speed: "速度", jing: "精", qi: "气", shen: "神", toxicity: "毒性", catchRate: "钓鱼" };
            const makeTag = (label, val, isBuff = false) => {
                let valStr = val > 0 ? `+${val}` : `${val}`;
                let style = isBuff ? "background:#e3f2fd; color:#1565c0; border:1px solid #bbdefb;" : "background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9;";
                if ((label === "毒性" && val > 0) || (['生命', '饱食', '攻击', '防御', '速度'].includes(label) && val < 0)) {
                    style = "background:#ffebee; color:#c62828; border:1px solid #ffcdd2;";
                }
                return `<span style="display:inline-block; ${style} padding:2px 6px; border-radius:4px; font-size:15px; margin-right:5px; margin-bottom:2px;">${label}${valStr}${isBuff ? '天' : ''}</span>`;
            };

            listHtml = sellableItems.map(entry => {
                const item = entry.data;
                const sellPrice = Math.round(item.value * 0.5);
                const color = (window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity]) ? window.RARITY_CONFIG[item.rarity].color : '#333';
                let effectTags = '';
                if (item.effects) {
                    Object.entries(item.effects).forEach(([key, val]) => {
                        if (key === 'buff') return;
                        if (ATTR_MAPPING[key]) effectTags += makeTag(ATTR_MAPPING[key], val);
                    });
                    if (item.effects.buff) {
                        const b = item.effects.buff;
                        const label = ATTR_MAPPING[b.attr] || b.attr;
                        effectTags += makeTag(label, b.val, true).replace('</span>', `(${b.days}天)</span>`);
                    }
                }

                const btnBase = "display:inline-block; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 2px rgba(0,0,0,0.2); text-shadow: 0 1px 1px rgba(0,0,0,0.3); font-size: 16px; padding: 6px 15px; color: #fff; border: 1px solid; white-space: nowrap;";
                const sellBtnStyle = `${btnBase} background: linear-gradient(to bottom, #ffb74d, #f57c00); border-color: #e65100;`;
                let bulkBtnHtml = '';
                if (entry.count > 1) {
                    const bulkBtnStyle = `${btnBase} background: linear-gradient(to bottom, #4fc3f7, #0288d1); border-color: #01579b;`;
                    // 【核心修改】传入 sid
                    bulkBtnHtml = `<button style="${bulkBtnStyle}" onclick="InnShop.handleSellBulk('${entry.sid}', ${sellPrice})">全卖</button>`;
                }

                // 【核心修改】传入 sid
                return `
                    <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:#fff; transition: background 0.2s;"
                    /* 【新增】出售界面使用的是背包实例，传入 SID */
         onmouseenter="window.showItemTooltip(event, '${entry.sid}')"
         onmouseleave="window.hideTooltip()"
                    >
                        <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                            <span style="color:${color}; font-weight:bold; font-size: 21px;">${item.name}</span>
                            <div>${effectTags}</div>
                            <div style="font-size:17px; color:#666; margin-top:4px;">
                                ${entry.count > 1 ? `数量: ${entry.count}` : ''} 
                                <span style="margin-left:5px; color:#999;">(原价:${item.value})</span>
                            </div>
                        </div>
                        <div style="width:110px; text-align:right; margin-right: 15px; flex-shrink:0;">
                            <div style="color:#388e3c; font-weight:bold; font-size: 20px;">+${sellPrice} 文</div>
                        </div>
                        <div style="width:160px; text-align:right; flex-shrink:0; display:flex; justify-content:flex-end; gap: 10px; align-items: center;">
                            ${bulkBtnHtml}
                            <button style="${sellBtnStyle}" onclick="InnShop.handleSell('${entry.sid}', ${sellPrice})">卖出</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (!this.modalBody) return;

        const container = this.modalBody.querySelector('#inn-sell-container');
        const listEl = this.modalBody.querySelector('#inn-sell-list');
        const moneyEl = this.modalBody.querySelector('#inn-money-count');

        if (container && listEl && moneyEl) {
            const scrollTop = listEl.scrollTop;
            listEl.innerHTML = listHtml;
            moneyEl.innerText = `💰 ${player.money}`;
            requestAnimationFrame(() => { listEl.scrollTop = scrollTop; });
        } else {
            const html = `
                <div id="inn-sell-container" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                    <div style="flex:0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                        <span style="font-size: 24px; font-weight: bold;">💰 收购物品 (半价)</span>
                        <div style="display:flex; align-items:center; gap: 20px;">
                            <span id="inn-money-count" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                            <button class="ink_btn" onclick="InnShop.renderMainMenu()" 
                                    style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">
                                返回
                            </button>
                        </div>
                    </div>
                    <div id="inn-sell-list" style="flex:1; overflow-y:auto; padding:0; background: #fff;">
                        ${listHtml}
                    </div>
                </div>
            `;
            this._updateContent(html);
        }
    },

    // 【核心修改】单件出售 (SID)
    handleSell: function(sid, price) {
        // 安全检查
        const item = player.inventory.find(i => i.sid === sid);
        if (!item) {
            if(window.showToast) window.showToast("物品不存在或已售出");
            this.uiSell();
            return;
        }

        player.money += price;
        // 调用 UtilsItem 移除 1 个
        if (window.UtilsItem) {
            window.UtilsItem.removeItem(sid, 1);
        }

        if(window.showToast) window.showToast(`出售成功，获得 ${price} 文`);

        // 刷新
        if(window.updateUI) window.updateUI();
        if(window.saveGame) window.saveGame();
        this.uiSell();
    },

    // 【核心修改】批量出售 (SID)
    handleSellBulk: function(sid, unitPrice) {
        const item = player.inventory.find(i => i.sid === sid);
        if (!item) return;

        const count = item.count || 1;
        const totalPrice = unitPrice * count;
        player.money += totalPrice;

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
    ShopSystem.register("客栈", InnShop);
}

window.InnShop = InnShop;