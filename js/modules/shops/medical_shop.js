// js/modules/shops/medical_shop.js
// 医馆功能模块 v1.3 (修复版：高级治疗移除疲惫Buff)
// console.log("加载 医馆模块");

const MedicalShop = {
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

        // 标准按钮风格
        const btnStyle = "font-size: 24px; padding: 20px 40px; border-width: 3px; box-shadow: 0 4px 8px rgba(0,0,0,0.3);";

        const html = `
            <div class="inn-layout" style="display:flex; flex-direction:column; height:100%; padding: 10px;">
                <div class="inn-greeting" style="flex:0 0 auto; border-bottom:2px dashed #5d4037; margin-bottom:20px; padding:15px; font-family:'Kaiti'; font-size:30px; color:#3e2723; background:rgba(255,255,255,0.5); border-radius:8px;">
                    <p style="margin:5px 0;">郎中：医者仁心，悬壶济世。</p>
                    <p style="margin:5px 0;">客官是来寻些滋补良药，还是身染沉疴需老夫施针？</p>
                    <p style="margin:5px 0; font-size:20px; color:#d84315;">（本店概不售卖毒虫毒草，请自重）</p>
                </div>

                <div class="inn-actions" style="flex:1; display:flex; justify-content:center; align-items:center; gap: 40px;">
                    <button class="ink_btn" onclick="MedicalShop.uiBuy()" style="${btnStyle}">
                        🌿 购药
                    </button>
                    <button class="ink_btn" onclick="MedicalShop.uiHeal()" style="${btnStyle}">
                        ❤️ 疗伤
                    </button>
                </div>

                <div class="inn-footer" style="text-align:right; margin-top:20px; font-size: 18px; font-weight:bold; color:#d84315;">
                    当前盘缠: ${player.money} 文
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`${townName} - 医馆`, html);
    },

    // ================= 库存生成 =================
    _generateStock: function(town) {
        if (!window.getSeededRandom || !player) return;

        const monthIndex = player.time.month;
        const shopKey = `medical_${town.id}_${monthIndex}`;

        // 医馆配置
        let config = { minType: 4, maxType: 8, minTotal: 10, maxTotal: 20, maxRarity: 3 };
        if (town.level === 'city') config = { minType: 8, maxType: 12, minTotal: 20, maxTotal: 30, maxRarity: 5 };

        let allItems = [];
        if (typeof pills !== 'undefined') allItems = Object.values(pills);
        else if (window.GAME_DB && window.GAME_DB.items) allItems = window.GAME_DB.items;

        const validItems = allItems.filter(item => {
            if (item.type !== 'pill') return false;
            if (item.subType === 'poison') return false;
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
            window.showToast("郎中：采药的徒弟还没回来，暂无药材。");
            return;
        }

        const levelNames = (window.SKILL_CONFIG && SKILL_CONFIG.levelNames) ? SKILL_CONFIG.levelNames : ["未入门", "入门", "进阶", "大成"];

        const attrMap = window.ATTR_MAPPING || {};
        const getAttrName = (key) => {
            if (key === 'studyEff') return '研读效率';
            return attrMap[key] || key;
        };

        let listHtml = this.currentStock.map((entry, index) => {
            const item = entry.item;
            const isSoldOut = entry.qty <= 0;
            const canAfford = player.money >= entry.price;
            const color = (window.RARITY_CONFIG?.[item.rarity]?.color) || '#333';

            const tags = [];
            if (item.effects) {
                Object.entries(item.effects).forEach(([key, val]) => {
                    if (key === 'buff' && typeof val === 'object') {
                        const bAttrs = String(val.attr).split('_');
                        const bVals = String(val.val).split('_');

                        bAttrs.forEach((aK, bI) => {
                            const l = getAttrName(aK);
                            let cV = bVals[bI] !== undefined ? bVals[bI] : bVals[0];

                            let displayVal = cV;
                            let sign = parseInt(cV) > 0 ? '+' : '';

                            if (aK === 'studyEff') {
                                const num = parseFloat(cV);
                                sign = num > 0 ? '+' : '';
                                displayVal = Math.round(num * 100) + '%';
                            }

                            tags.push(`
                                <span style="display:inline-block; background:#f3e5f5; color:#7b1fa2; border:1px solid #e1bee7; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px;">
                                    ${l}${sign}${displayVal}<span style="opacity:0.8;">(${val.days}天)</span>
                                </span>
                            `);
                        });
                    }
                    else if (key === 'studyEff') {
                        const sign = val > 0 ? '+' : '';
                        const percentVal = Math.round(val * 100) + '%';
                        tags.push(`<span style="display:inline-block; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px;">研读效率${sign}${percentVal}</span>`);
                    }
                    else if (key === 'max_skill_level') {
                        tags.push(`<span style="display:inline-block; background:#fff3e0; color:#ef6c00; border:1px solid #ffe0b2; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px;">境界:${levelNames[val] || val}</span>`);
                    }
                    else if (typeof val === 'number' && val !== 0) {
                        const l = getAttrName(key);
                        tags.push(`<span style="display:inline-block; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; padding:2px 6px; border-radius:4px; font-size:14px; margin-right:5px;">${l}${val > 0 ? '+' : ''}${val}</span>`);
                    }
                });
            }

            const btnBase = "border-radius: 4px; box-shadow: 0 2px 2px rgba(0,0,0,0.2); font-size:18px; padding: 8px 18px; color: #fff; border: 1px solid;";
            let btnStyle = `${btnBase} background: linear-gradient(to bottom, #81c784, #4caf50); border-color: #2e7d32; cursor: pointer;`;
            if (isSoldOut || !canAfford) btnStyle = `${btnBase} background: #bdbdbd; border-color: #9e9e9e; color: #616161; cursor: not-allowed;`;

            return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:${index%2===0?'#fafafa':'#fff'};">
                    <div style="flex:1; text-align:left; padding-right: 15px; display:flex; flex-direction:column; gap:6px;">
                        <div style="color:${color}; font-weight:bold; font-size: 21px;">${item.name}</div>
                        <div>${tags.join('')}</div>
                        <div style="font-size:15px; color:#888;">${item.desc || '医馆良药'}</div>
                    </div>
                    <div style="width:120px; text-align:right; margin-right: 20px; flex-shrink:0;">
                        <div style="color:#d84315; font-weight:bold; font-size: 20px;">${entry.price} 文</div>
                        <div style="font-size:16px; color:${isSoldOut ? 'red' : '#999'};">库存: ${entry.qty}</div>
                    </div>
                    <div style="width:90px; text-align:right; flex-shrink:0;">
                        <button style="${btnStyle}" ${isSoldOut || !canAfford ? '' : `onclick="MedicalShop.handleBuy(${index})"`}>${isSoldOut ? '售罄' : (canAfford ? '购买' : '缺钱')}</button>
                    </div>
                </div>
            `;
        }).join('');

        const isModalVisible = this.modalBody && document.body.contains(this.modalBody);
        if (isModalVisible) {
            const listEl = this.modalBody.querySelector('#med-buy-list'), moneyEl = this.modalBody.querySelector('#med-money-count');
            if (listEl && moneyEl) {
                const scrollTop = listEl.scrollTop;
                listEl.innerHTML = listHtml;
                moneyEl.innerText = `💰 ${player.money}`;
                requestAnimationFrame(() => { listEl.scrollTop = scrollTop; });
                return;
            }
        }

        const html = `
            <div id="med-buy-container" style="height: 100%; box-sizing: border-box; display:flex; flex-direction:column; background:#fff; border-radius:8px; overflow:hidden;">
                <div style="flex: 0 0 auto; padding:18px; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items: center; background: #f5f5f5;">
                    <span style="font-size: 24px; font-weight: bold;">🌿 医馆药柜</span>
                    <div style="display:flex; align-items:center; gap: 20px;">
                        <span id="med-money-count" style="color:#d84315; font-weight:bold; font-size: 24px;">💰 ${player.money}</span>
                        <button class="ink_btn" onclick="MedicalShop.renderMainMenu()" style="font-size: 18px; padding: 6px 20px; border:1px solid #8d6e63; background:#fff8e1; color:#5d4037; border-radius:4px; cursor:pointer;">返回</button>
                    </div>
                </div>
                <div id="med-buy-list" style="flex:1; overflow-y:auto; padding:0; background: #fff;">${listHtml}</div>
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

    // ================= 疗伤界面 =================
    uiHeal: function() {
        const buffDesc = `
            <span style="color:#ffd700; font-weight:bold;">【潜力迸发】</span><br>
            <span style="color:#bbb;">----------------</span><br>
            精气神属性 +20%<br>
            <span style="color:#81c784;">持续时间: 5天</span>
        `;

        const html = `
            <div style="padding:20px; text-align:center; height:100%; box-sizing:border-box; overflow-y:auto;">
                <h3 style="margin-bottom:30px; font-family:'Kaiti'; font-size: 32px; color:#3e2723;">请选择诊疗方案</h3>
                
                <div style="display:flex; justify-content:center; gap:30px; align-items:stretch;">
                    
                    <div class="choice-card" onclick="MedicalShop.confirmHeal('basic')" 
                         style="border:2px solid #bdbdbd; padding:20px; border-radius:12px; cursor:pointer; width:220px; background:#fafafa; box-shadow: 0 3px 6px rgba(0,0,0,0.1); display:flex; flex-direction:column;">
                        <div style="font-weight:bold; font-size:24px; color:#616161; margin-bottom:10px;">外敷包扎</div>
                        <div style="color:#d84315; font-size: 22px; margin-bottom:15px; font-weight:bold;">500 文</div>
                        <div style="font-size:16px; color:#555; line-height: 1.6; text-align:left; flex:1;">
                            <ul style="padding-left:20px; margin:0;">
                                <li>回复 50% 生命</li>
                                <li>回复 50% 法力</li>
                                <li>清空 体内毒素</li>
                                <li style="color:#ef5350;">移除 [濒死] 状态</li>
                            </ul>
                        </div>
                    </div>

                    <div class="choice-card" onclick="MedicalShop.confirmHeal('advanced')" 
                         style="border:2px solid #1e88e5; padding:20px; border-radius:12px; cursor:pointer; width:220px; background:#e3f2fd; box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2); display:flex; flex-direction:column;">
                        <div style="font-weight:bold; font-size:24px; color:#1565c0; margin-bottom:10px;">汤药调理</div>
                        <div style="color:#d84315; font-size: 22px; margin-bottom:15px; font-weight:bold;">1000 文</div>
                        <div style="font-size:16px; color:#555; line-height: 1.6; text-align:left; flex:1;">
                            <ul style="padding-left:20px; margin:0;">
                                <li style="font-weight:bold; color:#1e88e5;">回复 100% 生命</li>
                                <li style="font-weight:bold; color:#1e88e5;">回复 100% 法力</li>
                                <li>清空 身体疲劳</li>
                                <li>清空 体内毒素</li>
                                <li style="color:#ef5350;">移除 [濒死] 状态</li>
                            </ul>
                        </div>
                    </div>

                    <div class="choice-card" onclick="MedicalShop.confirmHeal('premium')" 
                         style="border:2px solid #d4af37; padding:20px; border-radius:12px; cursor:pointer; width:220px; background:#fff8e1; box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3); position:relative; overflow:hidden; display:flex; flex-direction:column;">
                        <div style="position:absolute; top:0; right:0; background:#d4af37; color:#fff; font-size:12px; padding:2px 8px; border-bottom-left-radius:8px;">推荐</div>
                        <div style="font-weight:bold; font-size:24px; color:#f57f17; margin-bottom:10px;">金针渡穴</div>
                        <div style="color:#d84315; font-size: 22px; margin-bottom:15px; font-weight:bold;">2000 文</div>
                        <div style="font-size:16px; color:#555; line-height: 1.6; text-align:left; flex:1;">
                            <ul style="padding-left:20px; margin:0;">
                                <li style="font-weight:bold; color:#f57f17;">包含 [汤药调理]</li>
                                <li style="font-weight:bold; color:#f57f17;">所有效果</li>
                                <li style="margin-top:5px;">
                                    <div class="inn-tooltip">
                                        <span style="color:#ff6f00; font-weight:bold; border-bottom:1px dashed;">✨ BUFF:潜力迸发</span>
                                        <span class="inn-tooltip-text">${buffDesc}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                <div style="margin-top:50px;">
                    <button class="ink_btn" onclick="MedicalShop.renderMainMenu()" style="font-size: 24px; padding: 15px 45px;">返回</button>
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    // ================= 确认弹窗 =================
    confirmHeal: function(type) {
        let cost = 0;
        let name = "";
        switch(type) {
            case 'premium': cost = 2000; name = "金针渡穴"; break;
            case 'advanced': cost = 1000; name = "汤药调理"; break;
            case 'basic': cost = 500; name = "外敷包扎"; break;
        }

        if (player.money < cost) {
            if(window.showToast) window.showToast("郎中：既无诊金，恕难施治。");
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'med-confirm-modal';
        overlay.className = 'inn-confirm-overlay';

        overlay.innerHTML = `
            <div class="inn-confirm-box">
                <div style="font-family:'Kaiti'; font-size:28px; font-weight:bold; margin-bottom:20px; color:#3e2723; border-bottom: 1px solid #d7ccc8; padding-bottom:10px;">
                    诊疗确认
                </div>
                <div style="font-size:20px; color:#5d4037; line-height:1.6; margin-bottom:30px;">
                    客官欲选<span style="color:#d84315; font-weight:bold;">【${name}】</span>疗程？<br>
                    需支付诊金 <span style="font-size:24px; font-weight:bold; color:#d84315;">${cost}</span> 文。
                </div>
                <div style="display:flex; justify-content:space-around;">
                    <button onclick="document.body.removeChild(document.getElementById('med-confirm-modal'))" 
                        style="padding:10px 30px; font-size:18px; cursor:pointer; background:#eee; border:1px solid #999; border-radius:4px; color:#666;">
                        再忍忍
                    </button>
                    <button onclick="MedicalShop.executeHeal('${type}')" 
                        style="padding:10px 30px; font-size:18px; cursor:pointer; background:#d84315; border:1px solid #bf360c; border-radius:4px; color:#fff; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                        医治
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    // ================= 执行治疗逻辑 =================
    executeHeal: function(type) {
        const overlay = document.getElementById('med-confirm-modal');
        if (overlay) document.body.removeChild(overlay);

        let cost = 0;
        if (type === 'premium') cost = 2000;
        else if (type === 'advanced') cost = 1000;
        else if (type === 'basic') cost = 500;

        if (player.money < cost) return;
        player.money -= cost;

        // 移除濒死
        if (player.buffs) {
            delete player.buffs['near_death'];
            delete player.buffs['buff_near_death'];
        }

        if (type === 'basic') {
            player.status.hp = Math.min(player.derived.hpMax, player.status.hp + player.derived.hpMax * 0.5);
            player.status.mp = Math.min(player.derived.mpMax, player.status.mp + player.derived.mpMax * 0.5);
            player.status.toxicity = 0;
            if(window.showToast) window.showToast("经过包扎，伤势已无大碍。");
        }
        else if (type === 'advanced' || type === 'premium') {
            player.status.hp = player.derived.hpMax;
            player.status.mp = player.derived.mpMax;
            player.status.toxicity = 0;
            player.status.fatigue = 0;

            // 【核心修改】清空疲劳值时，同时移除疲惫BUFF
            if (player.buffs) {
                delete player.buffs['fatigue'];
                delete player.buffs['debuff_fatigue'];
            }

            if (type === 'premium') {
                const buffData = {
                    name: "潜力迸发", attr: "精气神", val: "+20%", days: 5, source: "医馆", isDebuff: false,
                    desc: "经名医金针渡穴，激发了身体潜能。精气神提升20%。",
                    effects: { jingPct: 0.20, qiPct: 0.20, shenPct: 0.20 }
                };
                if (window.addBuff) window.addBuff('buff_potential_burst', buffData);
                else {
                    if (!player.buffs) player.buffs = {};
                    player.buffs['buff_potential_burst'] = buffData;
                }
                if(window.showToast) window.showToast("金针入穴，只觉体内真气澎湃，隐疾全消！");
            } else {
                if(window.showToast) window.showToast("服下汤药，顿觉神清气爽，沉疴尽去。");
            }
        }

        if(window.updateUI) window.updateUI();
        if(window.renderBuffs) window.renderBuffs();
        if(window.saveGame) window.saveGame();
        this.renderMainMenu();
    }
};

if (window.ShopSystem) {
    ShopSystem.register("医馆", MedicalShop);
}
window.MedicalShop = MedicalShop;