// js/data/data_npc.js
// NPC 数据定义与行为逻辑

window.DATA_NPC = {
    // =========================================================================
    // 1. 天机老人 (云游商人/奇遇NPC)
    // =========================================================================
    "npc_tianji": {
        id: "npc_tianji",
        name: "天机老人",
        title: "云游散仙",
        avatar: "🧙", // 暂时用Emoji代替图标
        desc: "一位行踪飘忽不定的老者，据说通晓过去未来，手中奇珍异宝无数。",
        color: "#d84315", // 名字颜色

        // --- 核心行为配置 ---
        behavior: {
            hasShop: true,
            shopCurrency: "spirit_stone", // 特殊货币标识
            shopCurrencyName: "下品灵石", // 显示名字

            onWeekChange: function(npcData, player) {
                // 1. 获取时间种子 (防SL)
                const t = player.time;
                const weekIndex = Math.floor(t.day / 7);

                // 2. 随机位置 (确定性随机)
                if (typeof WORLD_TOWNS !== 'undefined' && WORLD_TOWNS.length > 0) {
                    const townIdx = window.RandomSystem.getInt(0, WORLD_TOWNS.length - 1, "tianji_loc", t.year, t.month, weekIndex,player.worldSeed);
                    // let town = WORLD_TOWNS[townIdx];
                    // 这里为了方便测试先固定一个，正式上线请把下面这行改成上面那行
                    let town = WORLD_TOWNS[townIdx];
                    npcData.location = town.id;


                    // 50% 概率发布江湖传闻
                    const rumorRoll = window.RandomSystem.get("tianji_rumor", t.year, t.month, weekIndex,player.worldSeed);
                    if (rumorRoll < 0.5) {
                        if (window.LogManager && window.LogManager.add) {
                            const msg = `<span style="color:#ff9800;">【江湖传闻】</span> 据路边行商透露，神龙见首不见尾的天机老人近日曾在 <span style="color:#2196f3; font-weight:bold;">${town.name}</span> 现身，不知又有何异宝现世。`;
                            window.LogManager.add(msg);
                        }
                    }
                }

                // 3. 刷新商店库存 (去重算法)
                npcData.stock = [];
                if (typeof window.all_zhaoshi !== 'undefined') {
                    // (1) 先筛选符合条件的池子 (R1 - R5)
                    // 使用 [...array] 创建副本，防止修改原始数据
                    let pool = window.all_zhaoshi.filter(z => z.rarity >= 1 && z.rarity <= 5);

                    if (pool.length > 0) {
                        // (2) 【核心修改】使用 Fisher-Yates 洗牌算法打乱数组
                        // 这样取前10个就绝对不会重复
                        for (let i = pool.length - 1; i > 0; i--) {
                            // 使用确定性随机生成索引 j (0 到 i)
                            // 注意：把 'i' 加入种子参数，确保每一步交换都是确定且混乱的
                            const randomVal = window.RandomSystem.get("tianji_shuffle", t.year, t.month, weekIndex, i);
                            const j = Math.floor(randomVal * (i + 1));

                            // 交换元素
                            [pool[i], pool[j]] = [pool[j], pool[i]];
                        }

                        // (3) 截取前 10 个 (如果池子不够10个，就全取)
                        const selectedMoves = pool.slice(0, 10);

                        // (4) 生成商品数据
                        selectedMoves.forEach(move => {
                            // 优先读取招式自带价格
                            let finalPrice = move.price;
                            if (!finalPrice) {
                                const priceMap = { 1: 1, 2: 5, 3: 20, 4: 100, 5: 500 };
                                finalPrice = priceMap[move.rarity] || 999;
                            }

                            npcData.stock.push({
                                id: move.id,
                                type: 'zhaoshi',
                                item: move,
                                price: finalPrice,
                                currency: 'spirit_stone_1',
                                count: 1
                            });
                        });
                    }
                }
            },

            // 交互逻辑 (点击NPC时触发)
            interact: function(npcData, player) {
                // 检查本周是否已经领取过奖励
                // 我们需要一个地方存玩家和NPC的交互状态，建议存 player.npc_records[npcId]
                if (!player.npc_records) player.npc_records = {};
                if (!player.npc_records[npcData.id]) player.npc_records[npcData.id] = {};

                const record = player.npc_records[npcData.id];
                const currentWeek = `${player.time.year}_${player.time.month}_${player.time.day / 7 | 0}`; // 简易周标识

                let dialogHtml = "";
                let actions = [];

                // --- 商店入口 ---
                actions.push({
                    text: "🛒 查看宝物 (灵石交易)",
                    onClick: () => {
                        // 这里需要调用一个通用的NPC商店打开方法，稍后在 ShopSystem 或 UtilsNPC 中实现
                        if(window.UtilsNPC) window.UtilsNPC.openShop(npcData);
                        else console.warn("UtilsNPC 未定义");
                    }
                });

                // --- 每周奖励判定 ---
                if (record.lastRewardWeek !== currentWeek) {
                    actions.push({
                        text: "🎁 请教修仙机缘 (每周一次)",
                        style: "background:#fff3e0; border-color:#ff9800; color:#e65100; font-weight:bold;",
                        onClick: () => {
                            // 执行奖励逻辑
                            this._giveWeeklyReward(npcData, player, record, currentWeek);
                            // 关闭对话框或刷新
                            window.UtilsModal.closeTopModal();
                        }
                    });
                    dialogHtml = "老夫观你骨骼惊奇，这有一番机缘，不知你接不接得住？";
                } else {
                    dialogHtml = "天机不可泄露，本周的缘分已尽，且去吧。";
                }

                actions.push({ text: "👋 告辞", onClick: () => window.UtilsModal.closeTopModal() });

                // 呼出对话框
                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(
                        `${npcData.avatar} ${npcData.name}`,
                        actions,
                        `<div style="padding:10px; font-size:16px; color:#cec9c9;">${dialogHtml}</div>`
                    );
                }
            },

            // (内部) 发放奖励具体逻辑
            _giveWeeklyReward: function(npcData, player, record, weekKey) {
                // 1. 计算精气神总和
                const jing = player.derived.jing || 0;
                const qi = player.derived.qi || 0;
                const shen = player.derived.shen || 0;
                const totalStats = jing + qi + shen;

                // 2. 确定奖励池范围
                let minR = 1, maxR = 1;
                if (totalStats <= 100) { minR = 1; maxR = 3; }
                else if (totalStats <= 200) { minR = 2; maxR = 4; }
                else { minR = 3; maxR = 5; }

                // 3. 从 GAME_DB 中筛选书籍
                if (!window.GAME_DB || !window.GAME_DB.items) return;

                const bookPool = window.GAME_DB.items.filter(i =>
                    i.type === 'book' &&
                    i.rarity >= minR &&
                    i.rarity <= maxR
                );

                if (bookPool.length > 0) {
                    const rewardBook = bookPool[Math.floor(Math.random() * bookPool.length)];

                    // 发放物品
                    if (window.UtilsAdd) window.UtilsAdd.addItem(rewardBook.id, 1);

                    // 记录状态
                    record.lastRewardWeek = weekKey;
                    if(window.saveGame) window.saveGame();

                    // 提示
                    if(window.showToast) window.showToast(`天机老人赠予你一本【${rewardBook.name}】(R${rewardBook.rarity})`);
                    if(window.LogManager) window.LogManager.add(`[奇遇] 偶遇天机老人，获赠 <span style="color:${window.RARITY_CONFIG[rewardBook.rarity].color}">[${rewardBook.name}]</span>`);
                } else {
                    if(window.showToast) window.showToast("天机老人摸了摸口袋，发现没带适合你的书...");
                }
            }
        }
    },

    // =========================================================================
    // 2. 鱼市商人 (高价收购鱼获/出售昂贵钓具)
    // =========================================================================
    "npc_fish_merchant": {
        id: "npc_fish_merchant",
        name: "鱼市商人",
        title: "大富豪",
        avatar: "👲",
        desc: "身着锦衣玉带，手指上戴满了宝石戒指。他专门在各地高价收购珍稀鱼获，也顺带兜售些顶级钓具。",
        color: "#00acc1",

        behavior: {
            hasShop: true,
            shopCurrency: "money",

            // --- 每周刷新逻辑 ---
            onWeekChange: function(npcData, player) {
                const t = player.time;
                const weekIndex = Math.floor(t.day / 7);
                const taskKey = `${t.year}_${t.month}_${weekIndex}`;

                // 1. 随机位置
                if (typeof WORLD_TOWNS !== 'undefined' && WORLD_TOWNS.length > 0) {
                    const townIdx = window.RandomSystem.getInt(0, WORLD_TOWNS.length - 1, "fish_loc", t.year, t.month, weekIndex,player.worldSeed);
                    let town = WORLD_TOWNS[townIdx];

                    npcData.location = town.id;
                    console.log(`[NPC] 鱼市商人已刷新至: ${town.name}`);

                    // =========================================================
                    // 【在这里添加日志公告】
                    // =========================================================
                    if (window.LogManager && window.LogManager.add) {
                        // 您可以自定义颜色和文案
                        const msg = `<span style="color:#00acc1;">【鱼市消息】</span> 听闻富甲一方的鱼市商人近日已抵达 <span style="color:#2196f3; font-weight:bold;">${town.name}</span>，正在高价收购珍稀鱼获！`;
                        window.LogManager.add(msg);
                    }
                }

                // 2. 刷新商店 (直接读取 fishingRods)
                npcData.stock = [];
                // 【修改点】直接使用 fishingRods，不加 window
                if (typeof fishingRods !== 'undefined') {
                    const rods = fishingRods.filter(i => i.type === 'fishing_rod');
                    rods.forEach(rod => {
                        npcData.stock.push({
                            id: rod.id,
                            type: 'item',
                            item: rod,
                            price: (rod.value || 100) * 5, // 5倍溢价
                            count: 1
                        });
                    });
                }

                // 3. 收购清单逻辑 (读档优先)
                if (!player.npc_fish_merchant_task) player.npc_fish_merchant_task = {};

                if (player.npc_fish_merchant_task[taskKey]) {
                    npcData.acquisitionList = player.npc_fish_merchant_task[taskKey];
                } else {
                    let newList = [];
                    if (typeof window.fishes !== 'undefined' && window.fishes.length > 0) {
                        let pool = [...window.fishes];
                        for (let i = 0; i < 3; i++) {
                            if (pool.length === 0) break;
                            const r = window.RandomSystem.getInt(0, pool.length - 1, "fish_acq", t.year, t.month, weekIndex, i,player.worldSeed);
                            const fish = pool[r];
                            pool.splice(r, 1);

                            const count = window.RandomSystem.getInt(3, 5, "fish_count", t.year, t.month, weekIndex, i,player.worldSeed);

                            // 价格倍率
                            const basePrice = fish.value || 10;
                            let multiplier = 2;
                            if (basePrice <= 30) multiplier = 100;
                            else if (basePrice <= 50) multiplier = 50;
                            else if (basePrice <= 100) multiplier = 25;
                            else if (basePrice <= 200) multiplier = 12;
                            else if (basePrice <= 500) multiplier = 6;

                            newList.push({
                                id: fish.id, name: fish.name, icon: fish.icon || "🐟",
                                rarity: fish.rarity || 1, desc: fish.desc,
                                reqCount: count, currentCount: 0,
                                price: basePrice * multiplier, done: false
                            });
                        }
                    }
                    player.npc_fish_merchant_task[taskKey] = newList;
                    npcData.acquisitionList = newList;
                }
            },

            // --- 交互逻辑 ---
            interact: function(npcData, player) {
                if (!npcData.acquisitionList) this.onWeekChange(npcData, player);

                let actions = [];
                actions.push({
                    text: "🎣 选购钓具 (高价)",
                    onClick: () => {
                        if(window.UtilsNPC) {
                            window.UtilsNPC.openShop(npcData);
                            // 【核心修改】手动修正弹窗高度
                            // 因为我们不能改 utils_modal.js，所以在这里“打补丁”
                            setTimeout(() => {
                                const modals = document.querySelectorAll('.ink_modal_box');
                                if (modals.length > 0) {
                                    const topModal = modals[modals.length - 1];
                                    topModal.style.height = 'auto';      // 强制自动高度
                                    topModal.style.maxHeight = '85vh';   // 设置最大高度防止溢出
                                    topModal.style.width = '68vw';
                                }
                            }, 50); // 稍微延迟一点点，确保弹窗已经渲染出来
                        }
                    }
                });

                const tasks = npcData.acquisitionList || [];
                let totalNeeded = 0;
                tasks.forEach(t => { if(!t.done) totalNeeded += (t.reqCount - t.currentCount); });
                const taskBtnText = totalNeeded > 0 ? `💰 出售指定鱼获 (缺${totalNeeded}条)` : `💰 出售指定鱼获 (本周已收讫)`;

                actions.push({
                    text: taskBtnText,
                    style: totalNeeded > 0 ? "background:#e0f7fa; color:#006064; font-weight:bold;" : "",
                    onClick: () => this._openAcquisitionMenu(npcData, player)
                });

                actions.push({ text: "👋 暂且告退", onClick: () => window.UtilsModal.closeTopModal() });

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(
                        `${npcData.avatar} ${npcData.name}`, actions,
                        `<div style="padding:10px; color:#888;">本周他在寻找特定的珍稀鱼类，愿意出天价收购。</div>`
                    );
                }
            },

            _openAcquisitionMenu: function(npcData, player) {
                const tasks = npcData.acquisitionList || [];
                let options = [];
                let tips = tasks.length === 0 ? "本周暂无需求。" : "老夫本周急需以下鱼鲜，价格包你满意！";

                tasks.forEach(task => {
                    const bagItem = player.inventory.find(i => i.id === task.id);
                    const playerHas = bagItem ? bagItem.count : 0;
                    const needed = task.reqCount - task.currentCount;

                    if (task.done) {
                        options.push({ text: `<s>${task.icon} ${task.name} (已收齐)</s>`, style: "background:#eee; color:#aaa; cursor:default;", onClick: ()=>{} });
                    } else {
                        const btnText = `<div style="display:flex; justify-content:space-between;"><span>${task.icon} <b>${task.name}</b> <span style="color:#ffb74d">💰${task.price}</span></span><span style="font-size:12px; color:${playerHas>0?'#00796b':'#d32f2f'}">缺${needed} / 持${playerHas}</span></div>`;
                        options.push({
                            text: btnText,
                            style: playerHas > 0 ? "border:1px solid #00acc1; background:#e0f7fa;" : "",
                            autoClose: false,
                            onClick: () => {
                                if (playerHas <= 0) { if(window.showToast) window.showToast("你身上没有这条鱼。"); return; }
                                this._sellFish(npcData, player, task, bagItem);
                                this._openAcquisitionMenu(npcData, player);
                            }
                        });
                    }
                });
                options.push({ text: "🔙 返回", onClick: () => this.interact(npcData, player) });

                window.UtilsModal.showSelectionModal(`收购清单`, options, tips);

                // 【核心修改】同样给收购菜单也加上高度修正
                setTimeout(() => {
                    const modals = document.querySelectorAll('.ink_modal_box');
                    if (modals.length > 0) {
                        const topModal = modals[modals.length - 1];
                        topModal.style.height = 'auto';
                        topModal.style.maxHeight = '85vh';

                    }
                }, 50);
            },

            _sellFish: function(npcData, player, task, bagItem) {
                const needed = task.reqCount - task.currentCount;
                const tradeCount = Math.min(bagItem.count, needed);
                if (tradeCount <= 0) return;

                if (window.UtilsItem) window.UtilsItem.removeItem(bagItem.sid, tradeCount);
                if (window.UtilsMoney) window.UtilsMoney.addMoney(tradeCount * task.price, `出售 ${task.name}`);

                task.currentCount += tradeCount;
                if (task.currentCount >= task.reqCount) task.done = true;
                if(window.saveGame) window.saveGame();
                if(window.showToast) window.showToast(`出售 ${tradeCount} 条 ${task.name}`);
            }
        }
    },


    // =========================================================================
    // 3. 疯乞丐 (遗忘功法 / 碎片抽奖) - v2.1 修复弹窗与高度
    // =========================================================================
    "npc_crazy_beggar": {
        id: "npc_crazy_beggar",
        name: "疯乞丐",
        title: "神神叨叨",
        avatar: "🤪",
        desc: "衣衫褴褛，蓬头垢面，嘴里总念叨着“忘啦！全忘啦！”，却偶尔露出一丝精芒。",
        color: "#9c27b0",

        behavior: {
            // 难度系数配置 (对应 R1 - R6)
            diffConfig: [0, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0],

            // --- 每周刷新逻辑 ---
            onWeekChange: function(npcData, player) {
                const t = player.time;
                const weekIndex = Math.floor(t.day / 7);

                if (typeof WORLD_TOWNS !== 'undefined' && WORLD_TOWNS.length > 0) {
                    const townIdx = window.RandomSystem.getInt(0, WORLD_TOWNS.length - 1, "beggar_loc", t.year, t.month, weekIndex,player.worldSeed);
                    let town = WORLD_TOWNS[townIdx];

                    npcData.location = town.id;
                    console.log(`[NPC] 疯乞丐已刷新至: ${town.name}`);

                    if (window.LogManager && window.LogManager.add) {
                        const roll = window.RandomSystem.get("beggar_rumor", t.year, t.month, weekIndex,player.worldSeed);
                        if (roll < 0.5) {
                            window.LogManager.add(`<span style="color:#9c27b0;">【市井怪谈】</span> 有人看到疯乞丐在 <span style="color:#2196f3; font-weight:bold;">${town.name}</span> 街头大笑，说要送人一场大造化。`);
                        }
                    }
                }
            },

            // --- 交互逻辑 ---
            interact: function(npcData, player) {
                if (typeof player.forgotten_fragments === 'undefined') {
                    player.forgotten_fragments = 0;
                }

                const fragCount = player.forgotten_fragments;
                let dialogText = `
                    <span style="color:${npcData.color}; font-weight:bold;">${npcData.name}：</span><br>
                    嘿嘿嘿...忘了好，忘了没烦恼！<br>
                    把你那些乱七八糟的功夫都忘了吧，给我，我给你好东西！<br>
                    <br>
                    <span style="font-size:13px; color:#b2afaf;">(当前持有遗忘碎片: <b style="color:#e91e63; font-size:15px;">${fragCount}</b>)</span>
                `;

                let actions = [];

                actions.push({
                    text: "🤯 遗忘功法 (回收碎片)",
                    onClick: () => {
                        this._openForgetMenu(npcData, player);
                    }
                });

                const canDraw = fragCount >= 5;
                actions.push({
                    text: canDraw ? "🎲 领悟疯魔功法 (消耗5碎片)" : "🎲 领悟疯魔功法 (碎片不足)",
                    style: canDraw ? "background:#f3e5f5; color:#4a148c; font-weight:bold;" : "color:#999; cursor:not-allowed;",
                    onClick: () => {
                        if (!canDraw) {
                            if(window.showToast) window.showToast("碎片不足，需要 5 个遗忘碎片！");
                            return;
                        }
                        this._drawSkill(npcData, player);
                    }
                });

                actions.push({ text: "👋 离这疯子远点", onClick: () => window.UtilsModal.closeTopModal() });

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(
                        `${npcData.avatar} ${npcData.name}`,
                        actions,
                        dialogText
                    );
                }
            },

            // --- (内部) 计算碎片数量 ---
            _calcFragments: function(rarity, currentExp) {
                const diff = this.diffConfig[rarity] || 1.0;

                // 阶梯判断
                if (currentExp > 999 * diff) return rarity * 3;
                if (currentExp > 400 * diff) return rarity * 2;
                if (currentExp > 100 * diff) return rarity * 1;

                return 1; // 保底
            },

            // --- (内部) 遗忘菜单 ---
            _openForgetMenu: function(npcData, player) {
                if (!player.skills || Object.keys(player.skills).length === 0) {
                    if(window.showToast) window.showToast("你脑空空如也，没什么可忘的。");
                    return;
                }

                let options = [];

                for (let skillId in player.skills) {
                    const skillData = player.skills[skillId];
                    const currentExp = skillData.exp || 0;

                    let itemCfg = null;
                    if (window.all_zhaoshi) itemCfg = window.all_zhaoshi.find(z => z.id === skillId);
                    if (!itemCfg && window.GAME_DB && window.GAME_DB.items) {
                        itemCfg = window.GAME_DB.items.find(i => i.id === skillId);
                    }

                    if (itemCfg) {
                        if (itemCfg.id === 'attack') continue;

                        const rarity = itemCfg.rarity || 1;
                        const gain = this._calcFragments(rarity, currentExp);

                        const btnText = `
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <span style="font-weight:bold;">${itemCfg.name}</span> 
                                    <span style="font-size:12px; color:${window.RARITY_CONFIG ? window.RARITY_CONFIG[rarity].color : '#ccc7c7'}">R${rarity}</span>
                                    <br><span style="font-size:12px; color:#b7b6b6;">当前熟练: ${currentExp}</span>
                                </div>
                                <div style="text-align:right;">
                                    <span style="color:#e91e63; font-weight:bold; font-size:14px;">+${gain} 碎片</span>
                                </div>
                            </div>
                        `;

                        options.push({
                            text: btnText,
                            onClick: () => {
                                // 改用自定义的小型确认弹窗
                                this._askConfirmForget(npcData, player, skillId, itemCfg, gain);
                            }
                        });
                    }
                }

                options.push({ text: "🔙 返回", onClick: () => this.interact(npcData, player) });

                // 【样式注入】高度改成 80vh
                const styleFix = `<style>
                    .modal_overlay:last-of-type .ink_modal_box {
                        height: auto !important;
                        max-height: 80vh !important; /* 修改为80 */
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .modal_overlay:last-of-type .modal_body {
                        overflow-y: auto !important;
                        flex: 1 !important;
                        min-height: 0 !important;
                    }
                </style>`;

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(`选择要遗忘的功法 ${styleFix}`, options, "旧的不去，新的不来。");
                }
            },

            // --- (新增) 独立的确认弹窗 ---
            _askConfirmForget: function(npcData, player, skillId, itemCfg, gain) {
                const html = `
                    <div style="text-align:center; padding:5px;">
                        <div style="font-size:19px; font-weight:bold; margin-bottom:8px; color:#ded9d9;">
                            ${itemCfg.name}
                        </div>
                        <div style="font-size:16px; color:#e0dede; line-height:1.5;">
                            确定要彻底遗忘吗？<br>
                            遗忘后 <span style="color:#d32f2f;">熟练度清零</span>，<br>
                            背包内的秘籍将被 <span style="color:#d32f2f;">销毁</span>。<br>
                            <br>
                            预计获得：<span style="color:#e91e63; font-weight:bold; font-size:15px;">${gain}</span> 遗忘碎片
                        </div>
                    </div>
                `;

                const options = [
                    {
                        text: "✅ 确定遗忘",
                        style: "background:#ffebee; border:1px solid #ef9a9a; color:#c62828;", // 红色警示风格
                        onClick: () => {
                            this._executeForget(npcData, player, skillId, itemCfg, gain);
                        }
                    },
                    {
                        text: "🔙 我再想想",
                        onClick: () => {
                            // 点击取消，返回上一级菜单
                            this._openForgetMenu(npcData, player);
                        }
                    }
                ];

                // 使用 showSelectionModal 作为通用小弹窗，样式更紧凑
                window.UtilsModal.showSelectionModal("遗忘确认", options, html);
            },

            // --- (内部) 执行遗忘 ---
            _executeForget: function(npcData, player, skillId, itemCfg, gainCount) {
                // 1. 删除技能
                if (player.skills[skillId]) {
                    delete player.skills[skillId];
                }

                // 2. 增加碎片
                if (!player.forgotten_fragments) player.forgotten_fragments = 0;
                player.forgotten_fragments += gainCount;

                // 3. 连带删除背包里的同名书本
                let removedBooks = 0;
                if (window.UtilsItem && player.inventory) {
                    const itemsToRemove = player.inventory.filter(i => i.id === skillId && i.type === 'book');
                    itemsToRemove.forEach(item => {
                        window.UtilsItem.removeItem(item.sid, item.count);
                        removedBooks += item.count;
                    });
                }

                // 4. 保存与提示
                if(window.saveGame) window.saveGame();

                let msg = `遗忘成功！获得 ${gainCount} 个遗忘碎片。`;
                if(window.showToast) window.showToast(`遗忘成功 +${gainCount}碎片`);

                // 操作完成后，重新打开列表，方便继续遗忘
                this._openForgetMenu(npcData, player);
            },

            // --- (内部) 抽取功法book ---
            _drawSkill: function(npcData, player) {
                // 1. 扣除消耗
                player.forgotten_fragments -= 5;

                // 2. 权重计算
                const weights = { 1: 1000, 2: 800, 3: 400, 4: 100, 5: 5, 6: 1 };
                const totalWeight = 2306;
                let roll = Math.floor(Math.random() * totalWeight);

                let targetRarity = 1;
                for (let r = 1; r <= 6; r++) {
                    if (roll < weights[r]) {
                        targetRarity = r;
                        break;
                    }
                    roll -= weights[r];
                }

                // 3. 抽取
                if (!books) return;
                const pool = books.filter(z => z.rarity === targetRarity);

                if (pool.length === 0) {
                    player.forgotten_fragments += 5;
                    if(window.showToast) window.showToast("虚空之中空无一物... (该稀有度无功法)");
                    return;
                }

                const drawnSkill = pool[Math.floor(Math.random() * pool.length)];

                // 4. 查重
                const alreadyHas = !!player.skills[drawnSkill.id];

                if (alreadyHas) {
                    // --- 重复逻辑 ---
                    player.forgotten_fragments += 3;

                    if(window.LogManager) window.LogManager.add(`<span style="color:#9e9e9e;">[疯乞丐]</span> 抽到了重复的 <span style="color:${window.RARITY_CONFIG[targetRarity].color}">[${drawnSkill.name}]</span>，返还3碎片。`);

                    if(window.UtilsModal) {
                        // 结果弹窗
                        window.UtilsModal.showSelectionModal(
                            "运气不佳",
                            [{ text: "确定", onClick: () => this.interact(npcData, player) }],
                            `<div style="text-align:center;">
                                <div style="font-size:40px; margin-bottom:10px;">💩</div>
                                你抽到了 <b style="color:${window.RARITY_CONFIG[targetRarity].color}">${drawnSkill.name}</b> (R${targetRarity})<br>
                                <span style="color:#d32f2f; font-weight:bold;">但这招你已经会了！</span><br>
                                <br>
                                疯乞丐把碎片捡起来还了你几块。<br>
                                <span style="color:#e91e63;">获得：3 遗忘碎片</span>
                            </div>`
                        );
                    }
                } else {
                    // --- 成功逻辑 ---
                    if (window.UtilsSkill && window.UtilsSkill.learnSkill) {
                        window.UtilsSkill.learnSkill(drawnSkill.id, 0, true);
                    } else {
                        player.skills[drawnSkill.id] = { level: 0, exp: 0, mastered: false };
                    }

                    if(window.LogManager) window.LogManager.add(`<span style="color:#9c27b0;">[疯乞丐]</span> 领悟了失传绝学 <span style="color:${window.RARITY_CONFIG[targetRarity].color}">[${drawnSkill.name}]</span>！`);

                    if(window.UtilsModal) {
                        window.UtilsModal.showSelectionModal(
                            "领悟成功！",
                            [{ text: "确定", onClick: () => this.interact(npcData, player) }],
                            `<div style="text-align:center;">
                                <div style="font-size:40px; margin-bottom:10px;">✨</div>
                                恭喜！你学会了新功法：<br>
                                <b style="font-size:20px; color:${window.RARITY_CONFIG[targetRarity].color}">${drawnSkill.name}</b> (R${targetRarity})<br>
                                <br>
                                <div style="font-size:14px; color:#b7b4b4;">${drawnSkill.desc || "深奥无比..."}</div>
                            </div>`
                        );
                    }
                }

                if(window.saveGame) window.saveGame();
            }
        }
    },
    // =========================================================================
    // 4. 金算盘 (钱庄老板：固定咸阳 / 投资常驻 / 兑换需解锁)
    // =========================================================================
    "npc_jin_suanpan": {
        id: "npc_jin_suanpan",
        name: "金算盘",
        title: "钱庄老板",
        avatar: "🧮",
        desc: "富可敌国的钱庄老板，常驻咸阳，手里总是拨弄着一个纯金打造的算盘。据说他能把死钱变成活钱，也能让人一夜倾家荡产。",
        color: "#ffca28",

        behavior: {
            // --- 每周刷新逻辑 ---
            onWeekChange: function(npcData, player) {
                const t = player.time;
                const weekIndex = Math.floor(t.day / 7);
                const currentMonthKey = `${t.year}_${t.month}`;

                // 初始化记录
                if (!player.npc_records) player.npc_records = {};
                if (!player.npc_records[npcData.id]) player.npc_records[npcData.id] = {};
                const record = player.npc_records[npcData.id];

                // 1. 【修改点1】位置固定在咸阳
                // 只有当NPC位置未初始化，或者月份变动时(用于触发传闻)，才执行一次逻辑
                if (record.lastLocMonth !== currentMonthKey || !npcData.location) {
                    npcData.location = "t_xianyang"; // 强制固定ID
                    record.lastLocMonth = currentMonthKey;

                    console.log(`[NPC] 金算盘常驻于: 咸阳`);

                    // 播报 (每月初播报一次，增加存在感)
                    if (window.LogManager && window.LogManager.add) {
                        const rumorRoll = window.RandomSystem.get("jin_rumor", t.year, t.month);
                        if (rumorRoll < 0.3) {
                            window.LogManager.add(`<span style="color:#ffca28;">【商海消息】</span> 咸阳城的金算盘放出话来，本月钱庄生意兴隆，欢迎各路豪杰前来投资！`);
                        }
                    }
                }

                // 2. 汇率刷新 (每周变动)
                npcData.currentRate = window.RandomSystem.getInt(850, 1350, "jin_rate", t.year, t.month, weekIndex);
            },

            // --- 交互入口 ---
            interact: function(npcData, player) {
                // 状态锁检查 (防连点)
                if (npcData._isSettling) return;

                // 1. 初始化金融数据结构
                if (!player.npc_jin_finance) player.npc_jin_finance = { records: {} };
                if (!player.npc_jin_finance.records) player.npc_jin_finance.records = {};

                // 2. 优先处理旧账结算 (自动结算上月投资)
                const currentKey = `${player.time.year}_${player.time.month}`;
                const records = player.npc_jin_finance.records;
                let pendingKey = null;

                for (let key in records) {
                    if (key !== currentKey) {
                        pendingKey = key; // 找到一个旧账
                        break;
                    }
                }

                if (pendingKey) {
                    // 上锁，进入结算流程
                    npcData._isSettling = true;
                    this._processAutoSettlement(npcData, player, pendingKey, records[pendingKey]);
                } else {
                    // 无旧账，进入主菜单
                    this._showMainMenu(npcData, player);
                }
            },

            // --- (内部) 自动结算流程 ---
            _processAutoSettlement: function(npcData, player, oldKey, investAmount) {
                // 纯随机 (-200% ~ 200%)
                const roi = Math.floor(Math.random() * 401) - 200;

                // 计算返还金额
                let finalReturn = 0;
                if (roi >= 0) {
                    finalReturn = Math.floor(investAmount * (1 + roi / 100));
                } else {
                    if (roi <= -100) finalReturn = 0; // 血本无归
                    else finalReturn = Math.floor(investAmount * (1 + roi / 100));
                }

                // 更新数据
                delete player.npc_jin_finance.records[oldKey];

                if (finalReturn > 0) {
                    if (window.UtilsMoney) window.UtilsMoney.addMoney(finalReturn, "投资结算");
                }

                if (window.saveGame) window.saveGame();

                // 弹窗通知
                let msgHtml = `<div style="text-align:center; padding:10px;">`;
                msgHtml += `<div style="font-size:16px; font-weight:bold; margin-bottom:10px;">📅 上期投资结算 (${oldKey.replace('_','年')+'月'})</div>`;
                msgHtml += `投入本金：<b>${investAmount}</b> 文<br>`;

                if (roi >= 0) {
                    msgHtml += `收益率：<b style="color:#d32f2f;">+${roi}%</b> 📈<br>`;
                    msgHtml += `最终获得：<b style="color:#d32f2f; font-size:18px;">${finalReturn}</b> 文`;
                } else {
                    msgHtml += `收益率：<b style="color:#388e3c;">${roi}%</b> 📉<br>`;
                    if (finalReturn > 0) {
                        msgHtml += `最终拿回：<b>${finalReturn}</b> 文`;
                    } else {
                        msgHtml += `<span style="color:#388e3c; font-weight:bold;">血本无归！</span> 💸`;
                    }
                }
                msgHtml += `</div>`;

                if (window.UtilsModal) {
                    window.UtilsModal.closeTopModal();
                    window.UtilsModal.showSelectionModal(
                        "投资结算",
                        [{
                            text: "收下银两",
                            style: "background:#fff8e1; border-color:#ffca28; color:#f57f17; font-weight:bold;",
                            onClick: () => {
                                // 解锁，跳转主菜单
                                npcData._isSettling = false;
                                this._showMainMenu(npcData, player);
                            }
                        }],
                        msgHtml
                    );
                }
            },

            // --- (内部) 主菜单 ---
            _showMainMenu: function(npcData, player) {
                npcData._isSettling = false;

                if (!npcData.currentRate) this.onWeekChange(npcData, player);
                const rate = npcData.currentRate;

                let dialogText = `
                    <span style="color:${npcData.color}; font-weight:bold;">${npcData.name}：</span><br>
                    时间就是金钱，朋友！<br>
                    本周灵石汇率：<b style="color:#e91e63;">1 下品灵石 = ${rate} 文</b><br>
                    <span style="font-size:12px; color:#666;">(汇率每周波动，投资每月结算)</span>
                `;

                let actions = [];

                // 【修改点2】判断兑换功能是否解锁
                const isSecondRun = (player.timeStart && player.timeStart >= 1);
                const stoneIds = ["spirit_stone_1", "spirit_stone_2", "spirit_stone_3", "spirit_stone_4"];
                const hasStones = player.inventory && player.inventory.some(i => stoneIds.includes(i.id));

                const canExchange = isSecondRun || hasStones;

                if (canExchange) {
                    actions.push({
                        text: "💱 货币兑换 (灵石 <-> 银两)",
                        onClick: () => this._openExchangeMenu(npcData, player, rate)
                    });
                } else {
                    actions.push({
                        text: "💱 货币兑换 (未解锁)",
                        style: "color:#999; cursor:not-allowed; background:#eee; border-color:#ddd;",
                        onClick: () => {
                            if(window.showToast) window.showToast("需要身上持有灵石，或二周目开启。");
                        }
                    });
                }

                // 投资功能 (始终开放)
                actions.push({
                    text: "📈 风险投资 (每月一次)",
                    style: "background:#fff8e1; border-color:#ffca28; color:#f57f17; font-weight:bold;",
                    onClick: () => this._openInvestMenu(npcData, player)
                });

                actions.push({ text: "👋 告辞", onClick: () => window.UtilsModal.closeTopModal() });

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(`${npcData.avatar} ${npcData.name}`, actions, dialogText);
                }
            },

            // --- (内部) 兑换菜单 ---
            _openExchangeMenu: function(npcData, player, rate) {
                const myMoney = player.money || 0;
                const stoneItem = player.inventory.find(i => i.id === "spirit_stone_1");
                const myStones = stoneItem ? stoneItem.count : 0;

                const html = `
                    <div style="text-align:center; padding:10px;">
                        <div style="font-size:18px; font-weight:bold; margin-bottom:10px; color:#009688;">当前汇率: ${rate}</div>
                        <div style="display:flex; justify-content:space-around; margin-bottom:15px; font-size:14px;">
                            <div>💰 银两: <b>${myMoney}</b></div>
                            <div>💎 灵石: <b>${myStones}</b></div>
                        </div>
                    </div>
                `;

                let actions = [];
                const maxBuy = Math.floor(myMoney / rate);
                const maxSell = myStones;

                // 买入
                if (maxBuy > 0) {
                    actions.push({
                        text: `💎 买入灵石 (最大 ${maxBuy})`,
                        onClick: () => {
                            this._askAmount("买入", maxBuy, rate, (amount) => {
                                const cost = amount * rate;
                                if(window.UtilsMoney && window.UtilsMoney.removeMoney(cost, "购买灵石")) {
                                    if(window.UtilsAdd) window.UtilsAdd.addItem("spirit_stone_1", amount);
                                    if(window.showToast) window.showToast(`购得 ${amount}灵石`);
                                    this._openExchangeMenu(npcData, player, rate);
                                }
                            });
                        }
                    });
                } else {
                    actions.push({ text: "💎 买入灵石 (钱不够)", style: "color:#999; cursor:not-allowed;", onClick: ()=>{} });
                }

                // 卖出
                if (maxSell > 0) {
                    actions.push({
                        text: `💰 卖出灵石 (最大 ${maxSell})`,
                        onClick: () => {
                            this._askAmount("卖出", maxSell, rate, (amount) => {
                                if(window.UtilsItem && window.UtilsItem.removeItem(stoneItem.sid, amount)) {
                                    const gain = amount * rate;
                                    if(window.UtilsMoney) window.UtilsMoney.addMoney(gain, "出售灵石");
                                    if(window.showToast) window.showToast(`获得 ${gain}文`);
                                    this._openExchangeMenu(npcData, player, rate);
                                }
                            });
                        }
                    });
                } else {
                    actions.push({ text: "💰 卖出灵石 (没货)", style: "color:#999; cursor:not-allowed;", onClick: ()=>{} });
                }

                actions.push({ text: "🔙 返回", onClick: () => this._showMainMenu(npcData, player) });

                const styleFix = `<style>.modal_overlay:last-of-type .ink_modal_box { height: auto !important; max-height: 80vh !important; }</style>`;
                if(window.UtilsModal) window.UtilsModal.showSelectionModal(`货币兑换 ${styleFix}`, actions, html);
            },

            // --- (内部) 投资菜单 ---
            _openInvestMenu: function(npcData, player) {
                const currentKey = `${player.time.year}_${player.time.month}`;
                const records = player.npc_jin_finance.records;

                // 检查本月是否已投
                if (records[currentKey]) {
                    const amt = records[currentKey];
                    let html = `
                        <div style="text-align:center; padding:20px;">
                            <div style="font-size:40px; margin-bottom:10px;">⏳</div>
                            本月您已投资 <b>${amt}</b> 文。<br>
                            资金正在商海中运作...<br>
                            <br>
                            <span style="color:#009688;">请下个月再来查看收益！</span>
                        </div>
                    `;
                    if(window.UtilsModal) {
                        window.UtilsModal.showSelectionModal(
                            "投资进行中",
                            [{ text: "🔙 返回", onClick: () => this._showMainMenu(npcData, player) }],
                            html
                        );
                    }
                    return;
                }

                // 未投
                const myMoney = player.money || 0;
                let html = `
                    <div style="padding:10px; color:#d7d3d3;">
                        本月商机无限，客官打算入股吗？<br>
                        <span style="color:#d32f2f; font-size:12px;">(风险提示：收益 -200% ~ 200%。亏损超100%将血本无归！)</span><br>
                        当前持有: <b>${myMoney}</b> 文
                    </div>
                `;

                let actions = [];
                const investOpts = [1000, 5000, 10000, 50000, 100000];

                investOpts.forEach(amt => {
                    if (myMoney >= amt) {
                        actions.push({
                            text: `投资 ${amt} 文`,
                            onClick: () => this._executeInvest(npcData, player, amt, currentKey)
                        });
                    }
                });

                if (myMoney > 0) {
                    actions.push({
                        text: `🔥 全仓杀入 (${myMoney}文)`,
                        style: "border-color:#d32f2f; color:#d32f2f; font-weight:bold;",
                        onClick: () => this._executeInvest(npcData, player, myMoney, currentKey)
                    });
                } else {
                    html += "<br><b style='color:red'>你没钱了...</b>";
                }

                actions.push({ text: "🔙 返回", onClick: () => this._showMainMenu(npcData, player) });

                const styleFix = `<style>.modal_overlay:last-of-type .ink_modal_box { height: auto !important; max-height: 80vh !important; }</style>`;
                if(window.UtilsModal) window.UtilsModal.showSelectionModal(`风险投资 ${styleFix}`, actions, html);
            },

            // --- (内部) 执行投资 ---
            _executeInvest: function(npcData, player, amount, currentKey) {
                if(window.UtilsMoney) {
                    if(window.UtilsMoney.removeMoney(amount, "风险投资")) {
                        player.npc_jin_finance.records[currentKey] = amount;
                        if(window.saveGame) window.saveGame();
                        if(window.showToast) window.showToast(`成功投资 ${amount}文`);
                        this._openInvestMenu(npcData, player);
                    }
                }
            },

            _askAmount: function(action, max, rate, callback) {
                let options = [];
                if (max >= 1) options.push({ text: `${action} 1 个`, onClick: () => callback(1) });
                if (max >= 10) options.push({ text: `${action} 10 个`, onClick: () => callback(10) });
                if (max >= 100) options.push({ text: `${action} 100 个`, onClick: () => callback(100) });
                options.push({ text: `${action} 全部 (${max}个)`, style: "font-weight:bold; color:#009688;", onClick: () => callback(max) });
                options.push({ text: "取消", onClick: () => {} });

                window.UtilsModal.showSelectionModal(`${action}数量`, options, `最大可${action}: <b>${max}</b> 个<br>单价: ${rate}`);
            }
        }
    },
    // =========================================================================
    // 5. 鬼手铁匠 (装备强化 / 分解 - v1.6 炫酷特效/+8专属弹窗/滚动条支持)
    // =========================================================================
    "npc_guishou": {
        id: "npc_guishou",
        name: "鬼手铁匠",
        title: "神匠",
        avatar: "🔨",
        desc: "一位拥有麒麟臂的传奇铁匠，常驻铁匠堡。据说由于锻造技艺过于逆天，被天道夺去了一只眼睛。",
        color: "#ff5722",

        behavior: {
            // --- 强化配置表 (Table C) ---
            reinforceConfig: [
                { level: 1,  rate: 1.00, mult: 1.2,  priceX: 0.05, matB: 1,  risk: "none" },
                { level: 2,  rate: 1.00, mult: 2.4,  priceX: 0.10, matB: 1,  risk: "none" },
                { level: 3,  rate: 1.00, mult: 3.6,  priceX: 0.15, matB: 2,  risk: "none" },
                { level: 4,  rate: 0.95, mult: 4.8,  priceX: 0.20, matB: 2,  risk: "none" },
                { level: 5,  rate: 0.80, mult: 6.0,  priceX: 0.30, matB: 3,  risk: "keep" },
                { level: 6,  rate: 0.70, mult: 7.2,  priceX: 0.40, matB: 4,  risk: "drop1" },
                { level: 7,  rate: 0.60, mult: 8.4,  priceX: 0.50, matB: 5,  risk: "drop1" },
                { level: 8,  rate: 0.50, mult: 9.6,  priceX: 0.75, matB: 8,  risk: "drop3" },
                { level: 9,  rate: 0.40, mult: 10.8, priceX: 1.00, matB: 10, risk: "drop3" },
                { level: 10, rate: 0.30, mult: 12.0, priceX: 1.50, matB: 15, risk: "drop3" },
                { level: 11, rate: 0.25, mult: 20.0, priceX: 2.50, matB: 25, risk: "break" },
                { level: 12, rate: 0.15, mult: 28.0, priceX: 4.00, matB: 40, risk: "break" },
                { level: 13, rate: 0.10, mult: 43.0, priceX: 6.00, matB: 60, risk: "break" },
                { level: 14, rate: 0.05, mult: 65.0, priceX: 10.0, matB: 80, risk: "break" }
            ],

            // --- 每次刷新逻辑 ---
            onWeekChange: function(npcData, player) {
                const t = player.time;

                // 固定位置：铁匠堡 (t_v_35)
                if (!npcData.location || npcData.location !== "t_v_35") {
                    npcData.location = "t_v_35";
                    console.log(`[NPC] 鬼手铁匠已固定至: 铁匠堡`);

                    if (window.LogManager && window.LogManager.add) {

                            window.LogManager.add(`<span style="color:#ff5722;">【神匠现世】</span> 铁匠堡炉火冲天，鬼手铁匠正在开炉炼器，此乃强化神兵的绝佳机会！`);

                    }
                }
            },

            // --- 交互主入口 ---
            interact: function(npcData, player) {
                if (typeof player.spirit_essence === 'undefined') player.spirit_essence = 0;

                const essence = player.spirit_essence;

                let dialogText = `
                    <span style="color:#ffab40; font-weight:bold; font-size:20px;">${npcData.name}：</span><br>
                    <span style="font-size:18px; color:#ffffff; line-height:1.6;">
                        想要变强吗？把你的破铜烂铁给我，或者...把你的神兵交给我。<br>
                        (当前灵粹: <b style="color:#00e5ff; font-size:22px;">${essence}</b>)
                    </span>
                `;

                let actions = [];

                actions.push({
                    text: "🔥 装备强化 (提升属性)",
                    style: "background:#ffecb3; border-color:#ffca28; color:#e65100; font-weight:bold; font-size:18px;",
                    onClick: () => this._openReinforceMenu(npcData, player)
                });

                actions.push({
                    text: "♻️ 装备分解 (获取灵粹)",
                    style: "font-size:18px;",
                    onClick: () => this._openDisassembleMenu(npcData, player)
                });

                actions.push({
                    text: "🔮 词条洗练 (未开放)",
                    style: "color:#9e9e9e; cursor:not-allowed; border-color:#616161; background:#424242; font-size:18px;",
                    onClick: () => { if(window.showToast) window.showToast("鬼手铁匠正在闭关研究此术，暂未开放。"); }
                });

                actions.push({ text: "👋 告辞", style: "font-size:18px;", onClick: () => window.UtilsModal.closeTopModal() });

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(
                        `${npcData.avatar} ${npcData.name}`,
                        actions,
                        dialogText
                    );
                }
            },

            // =============================================================
            // 功能 1: 装备分解 (增加滚动条样式)
            // =============================================================
            _openDisassembleMenu: function(npcData, player) {
                const validTypes = ['weapon', 'head', 'body', 'feet', 'material'];
                let inventory = player.inventory || [];
                let items = inventory.filter(i => validTypes.includes(i.type));

                if (items.length === 0) {
                    if(window.showToast) window.showToast("背包里没有可分解的装备或材料。");
                    return;
                }

                let options = [];
                const yieldTable = { 1:1, 2:3, 3:9, 4:25, 5:60, 6:150 };

                items.forEach(item => {
                    const rarity = item.rarity || 1;
                    const baseYield = yieldTable[rarity] || 1;
                    const isMaterial = (item.type === 'material');
                    const count = item.count || 1;

                    let typeName = "";
                    switch(item.type) {
                        case 'weapon': typeName="武器"; break;
                        case 'head': typeName="头部"; break;
                        case 'body': typeName="衣服"; break;
                        case 'feet': typeName="鞋子"; break;
                        case 'material': typeName="材料"; break;
                    }

                    const color = window.RARITY_CONFIG ? window.RARITY_CONFIG[rarity].color : '#eee';

                    const btnHtml = `
                        <div style="display:flex; justify-content:space-between; align-items:center; min-height:40px;">
                            <div>
                                <span style="color:${color}; font-weight:bold; font-size:18px;">${item.name}</span> 
                                <span style="font-size:18px; color:#bdbdbd;">(${typeName} x${count})</span>
                                ${isMaterial ? `<br><span style="font-size:18px; color:#ff5252; font-weight:bold;">⚠ 成功率: 50%</span>` : ''}
                            </div>
                            <div style="text-align:right;">
                                <span style="color:#00e5ff; font-weight:bold; font-size:18px;">+${baseYield}/个 灵粹</span>
                            </div>
                        </div>
                    `;

                    options.push({
                        text: btnHtml,
                        onClick: () => {
                            this._askConfirmDisassemble(npcData, player, item, count, isMaterial, color);
                        }
                    });
                });

                options.push({ text: "🔙 返回", style: "font-size:18px;", onClick: () => this.interact(npcData, player) });

                // 【关键修复】强制设置 modal_body 可滚动，并限制高度
                const styleFix = `<style>
                    .modal_overlay:last-of-type .ink_modal_box { height: auto !important; max-height: 85vh !important; display: flex !important; flex-direction: column !important; }
                    .modal_overlay:last-of-type .modal_body { overflow-y: auto !important; flex: 1 !important; min-height: 0 !important; }
                </style>`;

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(`装备分解 ${styleFix}`, options, "将无用的装备化为灵粹。装备必定成功，材料亦可分解但有风险。");
                }
            },

            // 分解确认弹窗
            _askConfirmDisassemble: function(npcData, player, item, count, isMaterial, color) {
                const html = `
                    <div style="text-align:center; padding:15px; color:#ffffff;">
                        <div style="font-size:22px; font-weight:bold; margin-bottom:15px; color:#ffffff;">分解确认</div>
                        <div style="margin-bottom:20px; font-size:18px; line-height:1.6; color:#eeeeee;">
                            确定要分解 <span style="color:${color}; font-weight:bold;">${item.name}</span> (x${count}) 吗？<br>
                            <span style="font-size:18px; color:#bdbdbd;">分解后物品将永久消失。</span>
                            ${isMaterial ? '<br><br><span style="color:#ff5252; font-weight:bold; font-size:19px;">⚠ 注意：材料分解仅有 50% 成功率！</span>' : ''}
                        </div>
                    </div>
                `;

                const actions = [
                    {
                        text: "♻️ 确认分解",
                        style: "background:#e8f5e9; border:1px solid #a5d6a7; color:#2e7d32; font-weight:bold; font-size:18px;",
                        onClick: () => this._executeDisassemble(npcData, player, item)
                    },
                    {
                        text: "🔙 取消",
                        style: "font-size:18px;",
                        onClick: () => this._openDisassembleMenu(npcData, player)
                    }
                ];

                window.UtilsModal.showSelectionModal("操作确认", actions, html);
            },

            _executeDisassemble: function(npcData, player, item) {
                const exists = player.inventory.find(i => i.sid === item.sid);
                if (!exists) {
                    if(window.showToast) window.showToast("物品已不存在！");
                    this._openDisassembleMenu(npcData, player);
                    return;
                }

                const count = item.count;
                const rarity = item.rarity || 1;
                const yieldTable = { 1:1, 2:3, 3:9, 4:25, 5:60, 6:150 };
                const baseYield = yieldTable[rarity] || 1;
                const isMaterial = (item.type === 'material');

                let totalEssence = 0;
                let failCount = 0;

                for (let i = 0; i < count; i++) {
                    if (isMaterial) {
                        if (Math.random() < 0.5) {
                            totalEssence += baseYield;
                        } else {
                            failCount++;
                        }
                    } else {
                        totalEssence += baseYield;
                    }
                }

                if (window.UtilsItem) window.UtilsItem.removeItem(item.sid, count);

                if (!player.spirit_essence) player.spirit_essence = 0;
                player.spirit_essence += totalEssence;

                if (window.saveGame) window.saveGame();

                let msg = `分解完成！获得 <b style="color:#00e5ff; font-size:20px;">${totalEssence}</b> 灵粹。`;
                if (failCount > 0) {
                    msg += `<br><span style="color:#bdbdbd; font-size:18px;">(其中 ${failCount} 个材料分解失败化为粉尘)</span>`;
                }

                if (window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(
                        "分解结果",
                        [{ text: "确定", style: "font-size:18px;", onClick: () => this._openDisassembleMenu(npcData, player) }],
                        `<div style="text-align:center; padding:15px; color:#ffffff; font-size:18px;">${msg}</div>`
                    );
                }
            },

            // =============================================================
            // 功能 2: 装备强化 (增加滚动条样式)
            // =============================================================
            _openReinforceMenu: function(npcData, player) {
                const validTypes = ['weapon', 'head', 'body', 'feet'];
                let inventory = player.inventory || [];
                let items = inventory.filter(i => validTypes.includes(i.type));

                if (items.length === 0) {
                    if(window.showToast) window.showToast("背包里没有可强化的装备。");
                    return;
                }

                let options = [];
                const essence = player.spirit_essence || 0;

                items.forEach(item => {
                    const currentLv = item.level || 0;
                    if (currentLv >= 14) return;

                    const nextLv = currentLv + 1;
                    const cfg = this.reinforceConfig[nextLv - 1];
                    if (!cfg) return;

                    const coinCost = Math.floor((item.value || 100) * cfg.priceX);
                    const matCost = (cfg.matB || 1) * (item.rarity || 1);

                    const color = window.RARITY_CONFIG ? window.RARITY_CONFIG[item.rarity].color : '#eee';
                    const canAfford = (player.money >= coinCost && essence >= matCost);

                    const isWeapon = (item.type === 'weapon');
                    const scale = isWeapon ? 0.8 : 0.35;
                    const bonus = Math.floor((item.rarity||1) * scale * cfg.mult);

                    const btnHtml = `
                        <div style="display:flex; justify-content:space-between; align-items:center; min-height:45px;">
                            <div>
                                <span style="color:${color}; font-weight:bold; font-size:18px;">${item.name}</span> 
                                <span style="color:#ffd740; font-weight:bold; font-size:18px;">+${currentLv}</span>
                                <br>
                                <span style="font-size:18px; color:#bdbdbd;">
                                    下级: +${nextLv} <span style="font-size:16px;">(成功率 ${Math.floor(cfg.rate*100)}%)</span>
                                </span>
                            </div>
                            <div style="text-align:right; font-size:18px; line-height:1.4;">
                                <div style="${player.money >= coinCost ? 'color:#69f0ae' : 'color:#ff5252'}">💰 ${coinCost}</div>
                                <div style="${essence >= matCost ? 'color:#00e5ff' : 'color:#ff5252'}">💠 ${matCost}</div>
                            </div>
                        </div>
                    `;

                    options.push({
                        text: btnHtml,
                        onClick: () => {
                            if (!canAfford) {
                                this._showInsufficientResourcesModal(npcData, player, coinCost, matCost);
                                return;
                            }
                            this._confirmReinforce(npcData, player, item, cfg, coinCost, matCost, bonus);
                        }
                    });
                });

                options.push({ text: "🔙 返回", style: "font-size:18px;", onClick: () => this.interact(npcData, player) });

                // 标题栏：高对比度
                const titleStr = `装备强化 <span style="font-size:18px; color:#eeeeee; font-weight:normal; margin-left:10px;">(灵粹: <b style="color:#00e5ff; font-size:20px;">${essence}</b>)</span>`;

                // 【关键修复】强制设置 modal_body 可滚动，并限制高度
                const styleFix = `<style>
                    .modal_overlay:last-of-type .ink_modal_box { height: auto !important; max-height: 85vh !important; display: flex !important; flex-direction: column !important; }
                    .modal_overlay:last-of-type .modal_body { overflow-y: auto !important; flex: 1 !important; min-height: 0 !important; }
                </style>`;

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(`${titleStr} ${styleFix}`, options, "强化有风险，投入需谨慎。<br>失败可能导致降级甚至碎裂！");
                }
            },

            // 资源不足提示窗 (黑底适配)
            _showInsufficientResourcesModal: function(npcData, player, neededCoin, neededMat) {
                const myMoney = player.money || 0;
                const myEssence = player.spirit_essence || 0;

                const html = `
                    <div style="text-align:center; padding:20px; color:#ffffff;">
                        <div style="margin-bottom:20px; font-size:22px; font-weight:bold; color:#ff5252;">强化所需资源不足</div>
                        <div style="display:flex; justify-content:space-around; text-align:left; background:rgba(255,255,255,0.1); padding:15px; border-radius:8px; border:1px solid #555;">
                            <div>
                                <div style="font-size:18px; color:#eee;">所需银两: ${neededCoin}</div>
                                <div style="font-size:18px; color:${myMoney>=neededCoin ? '#69f0ae' : '#ff5252'}">当前: ${myMoney}</div>
                            </div>
                            <div>
                                <div style="font-size:18px; color:#eee;">所需灵粹: ${neededMat}</div>
                                <div style="font-size:18px; color:${myEssence>=neededMat ? '#00e5ff' : '#ff5252'}">当前: ${myEssence}</div>
                            </div>
                        </div>
                        <div style="margin-top:15px; font-size:18px; color:#bdbdbd;">(可通过分解多余装备获取灵粹)</div>
                    </div>
                `;

                const actions = [{
                    text: "我知道了",
                    style: "font-size:18px;",
                    onClick: () => {
                        this._openReinforceMenu(npcData, player);
                    }
                }];

                window.UtilsModal.showSelectionModal("提示", actions, html);
            },

            // 强化确认弹窗 (黑底适配)
            _confirmReinforce: function(npcData, player, item, cfg, coinCost, matCost, bonus) {
                let riskText = "";
                if (cfg.risk === "none") riskText = "失败无惩罚";
                else if (cfg.risk === "keep") riskText = "失败保持原级";
                else if (cfg.risk === "drop1") riskText = "<span style='color:#ffab40; font-weight:bold;'>失败降 1 级</span>";
                else if (cfg.risk === "drop3") riskText = "<span style='color:#ff5252; font-weight:bold;'>失败降 3 级</span>";
                else if (cfg.risk === "break") riskText = "<span style='color:#ff1744; font-weight:bold; font-size:20px;'>⚠ 失败装备碎裂 (消失)</span>";

                const html = `
                    <div style="text-align:center; padding:15px; color:#ffffff;">
                        <div style="font-size:22px; margin-bottom:15px; color:#ffffff; font-weight:bold;">
                            ${item.name} <span style="color:#ffd740;">+${item.level||0}</span> ➡ <span style="color:#ffd740;">+${cfg.level}</span>
                        </div>
                        <div style="margin-bottom:20px; font-size:18px; line-height:1.8; color:#eeeeee;">
                            预计提升: <span style="color:#69f0ae; font-weight:bold;">攻击/防御 +${bonus}</span><br>
                            成功率: <span style="color:#40c4ff; font-weight:bold;">${Math.floor(cfg.rate*100)}%</span><br>
                            风险: ${riskText}
                        </div>
                        <div style="border-top:1px solid #555; padding-top:15px; font-size:18px; color:#e0e0e0;">
                            消耗: <span style="color:#ffd740;">💰 ${coinCost}</span> &nbsp;&nbsp; <span style="color:#00e5ff;">💠 ${matCost}</span>
                        </div>
                    </div>
                `;

                if(window.UtilsModal) {
                    window.UtilsModal.showSelectionModal(
                        "强化确认",
                        [
                            {
                                text: "🔨 开始强化",
                                style: "background:#e8f5e9; color:#2e7d32; font-weight:bold; font-size:18px;",
                                onClick: () => this._executeReinforce(npcData, player, item, cfg, coinCost, matCost)
                            },
                            {
                                text: "🔙 取消",
                                style: "font-size:18px;",
                                onClick: () => this._openReinforceMenu(npcData, player)
                            }
                        ],
                        html
                    );
                }
            },

            _executeReinforce: function(npcData, player, item, cfg, coinCost, matCost) {
                // 1. 基础检查
                const inventoryIndex = player.inventory.findIndex(i => i.sid === item.sid);
                if (inventoryIndex === -1) {
                    if(window.showToast) window.showToast("物品不存在！");
                    this._openReinforceMenu(npcData, player);
                    return;
                }

                if (player.money < coinCost || player.spirit_essence < matCost) {
                    this._showInsufficientResourcesModal(npcData, player, coinCost, matCost);
                    return;
                }

                // 2. 扣除资源
                if (window.UtilsMoney) window.UtilsMoney.removeMoney(coinCost, "装备强化");
                player.spirit_essence -= matCost;

                // 3. 【核心逻辑】分离堆叠：先移除 1 个原物品
                const removeSuccess = window.UtilsItem.removeItem(item.sid, 1);
                if (!removeSuccess) {
                    console.error("扣除装备失败");
                    return;
                }

                // 4. 创建副本数据 (Deep Copy)
                let newItemData = JSON.parse(JSON.stringify(item));
                newItemData.count = 1;
                delete newItemData.sid; // 删除旧SID，让 addItem 根据新属性生成新SID

                const roll = Math.random();
                const isSuccess = roll < cfg.rate;

                if (isSuccess) {
                    // --- 成功 ---
                    if (!newItemData.level) newItemData.level = 0;
                    newItemData.level += 1;

                    this._updateItemStats(newItemData, newItemData.level);
                    window.UtilsItem.addItem(newItemData, 1);

                    const lv = newItemData.level;

                    // 【核心修改点】判断是否使用新弹窗
                    if (lv >= 8) {
                        // >= +8 使用炫酷弹窗
                        if (window.showReinforceSuccessModal) {
                            window.showReinforceSuccessModal(lv, newItemData.name, () => {
                                // 点击确认后刷新列表
                                this._openReinforceMenu(npcData, player);
                            });
                        }

                        // 记录传说日志
                        const colors = {8:"#00bcd4", 9:"#66bb6a", 10:"#ab47bc", 11:"#ffd700", 12:"#ff5252", 13:"#2196f3", 14:"#ff00ff"};
                        const color = colors[lv] || "#ffd700";
                        if(window.LogManager) window.LogManager.add(`<span style="color:${color}; font-weight:bold;">[传说] ${newItemData.name} 强化至 +${lv}！天地为之变色！</span>`);

                        // 阻断刷新，等待弹窗确认
                        return;

                    } else {
                        // < +8 使用普通 Toast 和日志
                        let successLog = "";
                        let logColor = "#a5d6a7";

                        if (lv <= 4) {
                            successLog = `[强化成功] 你的 ${newItemData.name} 闪耀着光芒，等级提升至 +${lv}！`;
                        } else { // 5-7
                            successLog = `[强化成功] 精光四射！${newItemData.name} 发出一阵嗡鸣，灵性大增，等级提升至 +${lv}！`;
                            logColor = "#00e5ff";
                        }

                        if(window.showToast) window.showToast(`强化成功！${newItemData.name} +${lv}`);
                        if(window.LogManager) window.LogManager.add(`<span style="color:${logColor}; font-weight:bold;">${successLog}</span>`);
                    }

                } else {
                    // --- 失败 ---
                    const risk = cfg.risk;
                    let msg = "强化失败...";
                    let failColor = "#d32f2f";

                    if (risk === "break") {
                        // 碎裂：不执行 addItem，物品直接消失 (前面已经 removeItem 了)
                        msg = "强化失败，装备承受不住灵力，<b style='color:#d32f2f'>碎裂了！</b>";
                    } else {
                        // 未碎裂：处理降级或保持
                        if (risk === "drop3") {
                            newItemData.level = Math.max(0, (newItemData.level||0) - 3);
                            this._updateItemStats(newItemData, newItemData.level);
                            msg = "强化失败，灵力反噬，<b style='color:#f57f17'>连降 3 级！</b>";
                            failColor = "#f57f17";
                        } else if (risk === "drop1") {
                            newItemData.level = Math.max(0, (newItemData.level||0) - 1);
                            this._updateItemStats(newItemData, newItemData.level);
                            msg = "强化失败，<b style='color:#f57f17'>等级下降了。</b>";
                            failColor = "#f57f17";
                        } else {
                            msg = "强化失败，好在装备无损。";
                            failColor = "#bdbdbd";
                        }

                        // 加回背包
                        window.UtilsItem.addItem(newItemData, 1);
                    }

                    if(window.showToast) window.showToast(msg.replace(/<[^>]+>/g, ""));
                    if(window.LogManager) window.LogManager.add(`<span style="color:${failColor};">[强化失败]</span> ${msg}`);
                }

                if(window.saveGame) window.saveGame();

                // 无论结果如何，重新打开菜单以刷新列表状态 (除非触发了 +8 弹窗)
                this._openReinforceMenu(npcData, player);
            },

            // 内部：更新物品属性
            _updateItemStats: function(item, level) {
                if (level <= 0) {
                    delete item.exPhyAtk;
                    delete item.exMagAtk;
                    delete item.exPhyDef;
                    delete item.exMagDef;
                    return;
                }

                const cfg = this.reinforceConfig[level - 1];
                if (!cfg) return;

                const isWeapon = (item.type === 'weapon');
                const rarity = item.rarity || 1;
                const scale = isWeapon ? 0.8 : 0.35;

                const bonus = Math.floor(rarity * scale * cfg.mult);

                if (isWeapon) {
                    item.exPhyAtk = bonus;
                    item.exMagAtk = bonus;
                } else {
                    item.exPhyDef = bonus;
                    item.exMagDef = bonus;
                }
            }
        }
    }
};