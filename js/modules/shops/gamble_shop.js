// js/modules/shops/gamble_shop.js
// 赌坊大厅模块 v6.1 (增加游戏实例销毁逻辑)

console.log("加载 赌坊大厅模块 v6.0 Refactored");

// ================= 大厅样式 (保持不变，略微增加青云赛样式) =================
const shopStyles = `
<style id="gamble-shop-styles">
    .gamble-layout { display:flex; flex-direction:column; height:100%; padding:15px; font-family:"KaiTi", serif; font-size: 18px; color: #3e2723; }
    .gamble-greeting { flex: 0 0 auto; margin-bottom: 20px; padding: 15px; border-radius: 8px; background: rgba(255,255,255,0.6); border: 2px dashed #5d4037; font-family: 'KaiTi'; color: #3e2723; line-height: 1.4; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .greeting-god { border: 3px double #ffd700; background: #fffde7; color: #bf360c; }
    .greeting-rich { border-color: #d84315; background: #fff3e0; }
    .greeting-poor { border-color: #9e9e9e; color: #616161; background: #f5f5f5; font-style: italic; }
    .greeting-tragic { border-color: #c62828; background: #ffebee; color: #b71c1c; font-weight: bold; }
    
    .game-card { border: 3px solid #5d4037; border-radius: 12px; background: #fff8e1; width: 220px; cursor: pointer; transition: transform 0.2s; overflow: hidden; box-shadow: 0 6px 12px rgba(0,0,0,0.2); position: relative; margin: 10px; }
    .game-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); border-color: #d84315; }
    .game-card .img-box { height: 120px; background: #d7ccc8; display:flex; align-items:center; justify-content:center; font-size:60px; }
    .game-card .title { font-size: 24px; font-weight: bold; color: #3e2723; padding: 10px; border-bottom: 2px dashed #bcaaa4; text-align: center; }
    .game-card .desc { font-size: 14px; color: #6d4c41; padding: 10px; line-height: 1.4; text-align: center; height: 60px; }
    
    .stats-panel { margin-top: 20px; padding: 10px; border-radius: 8px; text-align: center; background: rgba(255,255,255,0.4); border: 1px solid #bcaaa4; font-size: 26px; color: #5d4037; font-weight: bold; }
    
    .gambler-row { display: flex; align-items: center; justify-content: space-between; padding: 15px; margin-bottom: 10px; background: #fff; border: 1px solid #d7ccc8; border-radius: 8px; transition: 0.2s; }
    .gambler-row:hover { border-color: #8d6e63; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .gambler-row.depleted { background: #eeeeee; border-color: #e0e0e0; opacity: 0.8; }
    .gambler-row.depleted .g-name { color: #999; }
    .gambler-row.depleted .g-avatar { filter: grayscale(1); opacity: 0.6; }
    .g-avatar { width: 60px; height: 60px; border-radius: 50%; background: #eee; display:flex; align-items:center; justify-content:center; font-size:32px; border: 2px solid #ccc; margin-right: 15px; }
    .g-info { flex: 1; }
    .g-name { font-size: 20px; font-weight: bold; color: #3e2723; margin-bottom: 4px; }
    .g-title { font-size: 12px; background: #f0f0f0; color: #666; padding: 2px 6px; border-radius: 4px; margin-left: 5px; vertical-align: text-bottom; font-weight: normal; }
    .g-money { font-size: 14px; color: #666; display: flex; align-items: center; }
    .g-loss-tag { color: #d84315; font-size: 13px; margin-left: 8px; background: rgba(216, 67, 21, 0.08); padding: 1px 4px; border-radius: 3px; }
    .g-action { width: 320px; display: flex; flex-direction: column; gap: 5px; }
    .bet-grid { display: flex; gap: 8px; }
    .bet-btn { flex: 1; padding: 6px 0; border: 1px solid #8d6e63; background: #fdfbf7; color: #5d4037; cursor: pointer; border-radius: 6px; font-weight: bold; transition: 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.2; }
    .bet-btn:hover { background: #efebe9; color: #3e2723; border-color: #5d4037; transform: translateY(-1px); }
    .bet-btn.high { border-color: #d84315; color: #d84315; background: #fffbe6; }
    .bet-btn.high:hover { background: #fff3e0; }
    .bet-btn.disabled { background: #f5f5f5; color: #bbb; border-color: #ddd; cursor: not-allowed; pointer-events: none; box-shadow: none; transform: none; }

    /* 青云赛场次选择卡片 */
    .qy-tier-card {
        flex: 1; border: 2px solid #546e7a; border-radius: 10px; background: #eceff1;
        padding: 20px; text-align: center; cursor: pointer; transition: 0.2s;
        display: flex; flex-direction: column; align-items: center; gap: 10px;
        min-width: 200px;
    }
    .qy-tier-card:hover { transform: scale(1.05); border-color: #0288d1; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    .qy-tier-card.locked { filter: grayscale(1); opacity: 0.7; cursor: not-allowed; pointer-events: none; }
    
    .qy-title { font-size: 24px; font-weight: bold; color: #37474f; }
    .qy-cost { font-size: 18px; color: #d84315; font-weight: bold; }
    .qy-desc { font-size: 14px; color: #78909c; }
    
</style>
`;

if (!document.getElementById('gamble-shop-styles')) {
    document.head.insertAdjacentHTML('beforeend', shopStyles);
}

const GambleShop = {
    currentTown: null,
    modalBody: null,
    currentGame: null,
    currentGameType: null,

    playerSessionHistory: [],
    opponentSessionHistory: [],

    // ================= 核心：统一渲染接口 =================
    updateContent: function(html) {
        let shopModal = document.getElementById('modal_gamble');
        if (!shopModal || !document.body.contains(shopModal)) {
            console.log("[Gamble] 主窗口丢失，正在重建...");
            const title = (this.currentTown && this.currentTown.name) ? `${this.currentTown.name}赌坊` : "赌坊";
            this.modalBody = window.showGeneralModal(title, html, null, "modal_gamble", 68, 85);
            return;
        }
        if (!this.modalBody || !document.body.contains(this.modalBody)) {
            this.modalBody = shopModal.querySelector('.modal_body');
        }
        if (this.modalBody) {
            this.modalBody.innerHTML = html;
        }
    },

    // ================= 核心：统一结算界面渲染 =================
    renderResultView: function(data) {
        const { isWin, moneyChange, opponent, nextBet, playerMoney, opponentMoney } = data;
        const color = isWin ? "#d84315" : "#5d4037";
        const icon = isWin ? "🀄" : "💸";
        const profitStr = moneyChange > 0 ? `+${moneyChange}` : `${moneyChange}`;

        let btnExitText = isWin ? "潇洒离去" : "黯然离去";

        let btnRetryText = "再来一局";
        let canRetry = nextBet > 0 || (this.currentGameType === 'qingyun');

        // 逻辑 3.3 & 3.5: 破产判断
        if (this.currentGameType !== 'qingyun') { // 青云赛不判定对手破产，因为对手是虚拟AI
            if (isWin && opponentMoney <= 0) {
                btnExitText = "对手破产，心满意足离场";
                canRetry = false;
            }
        }

        if (!isWin && playerMoney <= 0) {
            btnExitText = "心死如灰，绝望离场";
            canRetry = false;
        }

        let buttonsHtml = `
            <div style="display:flex; gap:20px; justify-content:center; margin-top:20px;">
                <button class="ink_btn" style="background:#757575; border-color:#616161; min-width:120px;" id="btn_gamble_exit">${btnExitText}</button>
                ${canRetry ? `<button class="ink_btn" style="background:#d84315; border-color:#bf360c; min-width:140px;" id="btn_gamble_retry">${btnRetryText}</button>` : ''}
            </div>`;

        const html = `
            <div style="text-align:center; padding:40px 20px; font-family:'KaiTi'; height:100%; display:flex; flex-direction:column; justify-content:center;">
                <div style="font-size:80px; margin-bottom:20px;">${icon}</div>
                <div style="font-size:36px; font-weight:bold; color:${color}; margin-bottom:20px;">${data.title}</div>
                <div style="font-size:24px; color:#3e2723; line-height:1.6;">${data.msg}</div>
                <div style="font-size:48px; color:${moneyChange > 0 ? '#d84315' : '#757575'}; font-weight:bold; margin: 20px 0;">
                    ${profitStr} <span style="font-size:20px; color:#999;">文</span>
                </div>
                ${buttonsHtml}
            </div>
        `;

        this.updateContent(html);

        // 绑定事件
        setTimeout(() => {
            const btnExit = document.getElementById('btn_gamble_exit');
            const btnRetry = document.getElementById('btn_gamble_retry');

            if (btnExit) btnExit.onclick = () => data.onExit();
            if (btnRetry && canRetry) {
                btnRetry.onclick = () => {
                    // 调用回传的 onRetry
                    if (data.onRetry) data.onRetry(nextBet);
                };
            }
        }, 50);
    },

    // ================= 辅助工具 =================
    addMoneyLog: function(target, reason, amount) {
        const list = target === 'player' ? this.playerSessionHistory : this.opponentSessionHistory;
        if (!list) return;
        const sign = amount > 0 ? '+' : '';
        const color = amount > 0 ? '#ffb74d' : '#bdbdbd';
        list.unshift({ reason: reason, valStr: `<span style="color:${color}; font-weight:bold;">${sign}${amount}</span>` });
        if (list.length > 6) list.pop();
    },

    getMoneyHistoryHtml: function(target) {
        const list = target === 'player' ? this.playerSessionHistory : this.opponentSessionHistory;
        if (!list || list.length === 0) return '<div style="color:#777; text-align:center; font-size:12px;">暂无变动</div>';
        return list.map(log => `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding:4px 0; font-size:20px; line-height:1.4;">
                <span style="color:#d7ccc8;">${log.reason}</span>
                <span>${log.valStr}</span>
            </div>`).join('');
    },

    _clearMoneyHistory: function() {
        this.playerSessionHistory = [];
        this.opponentSessionHistory = [];
    },
    // 【v6.1 新增】清理当前游戏实例，杀死后台定时器
    _clearCurrentGame: function() {
        if (this.currentGame) {
            // 如果游戏实例有 stop 方法 (如 QingyunGame)，调用它
            if (typeof this.currentGame.stop === 'function') {
                this.currentGame.stop();
            }
            this.currentGame = null;
        }
    },

    // ================= 入口逻辑 =================
    enter: function(town) {
        // 进入赌坊时，必须先检查并初始化当月该城镇的赌徒存档
        if (window.UtilsGamble) {
            UtilsGamble.checkAndInitGambleData(town.id, town.level || 'village');
        }
        this.currentTown = town;
        this.renderMainMenu();
        if (window.UITutorial) UITutorial.checkBuilding('gamble');
    },

    renderMainMenu: function() {
        // 清理悬浮窗历史 (防止把上一局的流水带到大厅)
        // 【修改点】清理旧游戏
        this._clearCurrentGame();
        this._clearMoneyHistory();

        this.currentGame = null;
        this.currentGameType = null;

        const isBlacklisted = window.UtilsGamble ? UtilsGamble.checkIsBlacklisted(this.currentTown.id) : false;

        let netProfit = window.UtilsGamble ? UtilsGamble.getTownHistoryTotalWin(this.currentTown.id) : 0;
        const profitStr = Math.abs(netProfit).toLocaleString();

        let greetingHtml = "";
        let statsInfo = "";

        if (isBlacklisted) {
            greetingHtml = `<div class="gamble-greeting greeting-tragic">
                <div style="font-weight:bold; font-size:30px; margin-bottom:5px;">看场：(横眉冷对) 滚出去！</div>
                <div style="font-size:24px;">咱们这儿不欢迎手脚不干净的人！下个月再来吧！</div>
            </div>`;
            statsInfo = `<span style="color:#b71c1c; font-weight:bold;">已被列入黑名单</span>`;
        } else {
            if (netProfit >= 100000) {
                greetingHtml = `<div class="gamble-greeting greeting-god"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">老板：（跪地）赌神爷您来了！</div><div style="font-size:35px;">小的这就去给您清场，今日您想怎么玩都行！</div></div>`;
                statsInfo = `<span style="font-weight:900; color:#ffd700; text-shadow:1px 1px 0 #000; font-size:32px;">★ 赌神降临 (赢 ${profitStr}) ★</span>`;
            } else if (netProfit >= 0) {
                greetingHtml = `<div class="gamble-greeting"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">荷官：客官里面请！</div><div style="font-size:35px;">买定离手，搏一搏单车变摩托！今日想玩点什么？</div></div>`;
                statsInfo = `<span style="color:#5d4037; font-size:28px;">小有斩获 (赢 ${profitStr})</span>`;
            } else {
                greetingHtml = `<div class="gamble-greeting greeting-poor"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">伙计：客官，胜败乃兵家常事。</div><div style="font-size:35px;">今日不如转转运，说不定一把就回本了呢？</div></div>`;
                statsInfo = `<span style="color:#757575; font-size:28px;">稍有亏损 (输 ${profitStr})</span>`;
            }
        }

        const cardStyle = isBlacklisted ? 'filter: grayscale(1); pointer-events: none; opacity: 0.6;' : '';

        const html = `
            <div class="gamble-layout" style="align-items: center;">
                ${greetingHtml}
                <div style="display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
                    <div class="game-card" onclick="GambleShop.selectGame('liubo')" style="${cardStyle}">
                        <div class="img-box">♟️</div><div class="title">六 博</div>
                        <div class="desc">古之博戏，策略与运气的博弈。</div>
                    </div>
                    <div class="game-card" onclick="GambleShop.selectGame('chupu')" style="${cardStyle}">
                        <div class="img-box">🎲</div><div class="title">樗 蒲</div>
                        <div class="desc">五木定乾坤，手动改命的刺激玩法。</div>
                    </div>
                    
                    <div class="game-card" onclick="GambleShop.selectGame('qingyun')" style="${cardStyle}; border-color:#0288d1; background:#e1f5fe;">
                        <div class="img-box" style="background:#b3e5fc;">☁️</div><div class="title">青 云</div>
                        <div class="desc">多人竞速，策略堆叠，冲击大奖池。</div>
                    </div>
                </div>
                <div class="stats-panel" style="width: 80%; padding: 10px; margin-top: 20px;">
                    在此地战绩：${statsInfo}
                </div>
            </div>
        `;
        this.updateContent(html);
    },

    // ================= 游戏选择路由 =================
    selectGame: function(gameType) {
        // 【修改点】清理旧游戏 (虽然 renderMainMenu 已经清了，但安全起见)
        this._clearCurrentGame();

        this.currentGameType = gameType;
        this._clearMoneyHistory();

        // 路由：青云赛走场次选择，其他走选人界面
        if (gameType === 'qingyun') {
            this.renderQingyunSelection();
        } else {
            this.renderGamblerSelection(gameType);
        }
    },

    // ================= 青云赛：场次选择界面 =================
    renderQingyunSelection: function() {
        const pMoney = window.player.money;

        // 配置场次数据
        const tiers = [
            { id: 1, name: "低级场", entry: 5000, desc: "AI等级: 4 (50筹码/1)", color: "#81c784" },
            { id: 2, name: "中级场", entry: 30000, desc: "AI等级: 5 (250筹码/1)", color: "#4fc3f7" },
            { id: 3, name: "高级场", entry: 50000, desc: "AI等级: 6 (500筹码/1)", color: "#e57373" }
        ];

        let cardsHtml = tiers.map(t => {
            const locked = pMoney < t.entry;
            const lockClass = locked ? 'locked' : '';
            const lockText = locked ? '(资金不足)' : '';

            return `
            <div class="qy-tier-card ${lockClass}" style="border-top: 5px solid ${t.color};"
                onclick="GambleShop.launchQingyun(${t.id})">
                <div class="qy-title">${t.name}</div>
                <div class="qy-cost">入场: ${t.entry.toLocaleString()} ${lockText}</div>
                <div class="qy-desc">${t.desc}</div>
                <div style="font-size:40px; margin-top:10px;">🏆</div>
            </div>`;
        }).join('');

        const html = `
            <div class="gamble-layout">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ccc; padding-bottom:15px; margin-bottom:15px;">
                    <button class="ink_btn_small" onclick="GambleShop.renderMainMenu()" style="font-size:18px;">⬅ 返回大厅</button>
                    <div style="font-weight:bold; font-size:24px;">青云赛 - 选择场次</div>
                    <div style="font-size:24px; color:#d84315;">本金: ${pMoney.toLocaleString()}</div>
                </div>
                
                <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding: 20px;">
                    <div style="text-align:center; margin-bottom:30px; font-size:20px; color:#546e7a;">
                        多人同台竞技，策略博弈，赢取巨额奖池！
                    </div>
                    <div style="display:flex; gap:20px; justify-content:center; align-items:stretch;">
                        ${cardsHtml}
                    </div>
                </div>
            </div>
        `;
        this.updateContent(html);
    },

    // ================= 传统博戏：选人界面 =================
    renderGamblerSelection: function(gameType) {
        const gamblerList = window.UtilsGamble.getGamblers(this.currentTown.id, gameType);
        const skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;
        const playerMoney = window.player.money;

        let listHtml = "";

        gamblerList.forEach(gambler => {
            const currentMoney = gambler.currentMoney;
            const isDepleted = currentMoney <= 0;
            let accumulatedWin = gambler.accumulatedWin || 0;

            const bet10 = Math.floor(currentMoney * 0.1);
            const bet20 = Math.floor(currentMoney * 0.2);
            const bet100 = currentMoney;

            const buttonsConfig = [
                { label: "小玩", amount: bet10, css: "" },
                { label: "对赌", amount: bet20, css: "" },
                { label: "梭哈", amount: bet100, css: "high" }
            ];

            const rowClass = isDepleted ? "gambler-row depleted" : "gambler-row";

            const btnHtml = buttonsConfig.map(btn => {
                const canAfford = playerMoney >= btn.amount;
                const hasFund = btn.amount > 0;
                const isDisabled = !canAfford || !hasFund || isDepleted;
                const disabledClass = isDisabled ? 'disabled' : '';
                const moneyText = (skillLevel > 0) ? `${btn.amount}` : "???";

                return `
                <button class="bet-btn ${btn.css} ${disabledClass}" 
                    onclick="GambleShop.launchGame('${gameType}', '${gambler.id}', ${btn.amount})">
                    <span style="font-size:16px;">${btn.label}</span>
                    <span style="font-size:12px; opacity:0.8; margin-top:2px;">下注 ${moneyText}</span>
                </button>`;
            }).join('');

            const showMoney = skillLevel > 0;
            const moneyStr = isDepleted ? "已破产" : (showMoney ? `${currentMoney.toLocaleString()} 文` : "??? 文");

            let lossTag = "";
            if (skillLevel > 0 && accumulatedWin !== 0) {
                const color = accumulatedWin > 0 ? "#d84315" : "#2e7d32";
                const label = accumulatedWin > 0 ? "本月你在这已输" : "本月你在这已赢";
                lossTag = `<span class="g-loss-tag" style="color:${color}">（${label}：${Math.abs(accumulatedWin).toLocaleString()}）</span>`;
            }

            listHtml += `
                <div class="${rowClass}">
                    <div style="display:flex; align-items:center;">
                        <div class="g-avatar">${gambler.avatar}</div>
                        <div class="g-info">
                            <div class="g-name">
                                ${gambler.name} 
                                <span class="g-title">${gambler.title || ''} Lv.${gambler.level}</span>
                            </div>
                            <div class="g-money">
                                <span>持有: <b style="color:${isDepleted?'red':'#3e2723'}">${moneyStr}</b></span>
                                ${lossTag}
                            </div>
                        </div>
                    </div>
                    <div class="g-action"><div class="bet-grid">${btnHtml}</div></div>
                </div>`;
        });

        const html = `
            <div class="gamble-layout">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ccc; padding-bottom:15px; margin-bottom:15px;">
                    <button class="ink_btn_small" onclick="GambleShop.renderMainMenu()" style="font-size:18px;">⬅ 返回大厅</button>
                    <div style="font-weight:bold; font-size:24px;">选择对手 (${gameType === 'liubo' ? '六博' : '樗蒲'})</div>
                    <div style="font-size:24px; color:#d84315;">本金: ${window.player.money.toLocaleString()}</div>
                </div>
                <div style="flex:1; overflow-y:auto; padding:5px;">
                    <div style="text-align:center; color:#888; font-size:14px; margin-bottom:10px;">(本月驻场赌客，月末刷新)</div>
                    ${listHtml}
                </div>
            </div>
        `;
        this.updateContent(html);
    },

    // ================= 启动 青云赛 =================
    launchQingyun: function(tier) {
        if (!window.QingyunGame) {
            console.error("青云赛模块未加载");
            if(window.showToast) window.showToast("错误：青云赛模块未加载");
            return;
        }

        // 【修改点】确保旧游戏被清理
        this._clearCurrentGame();

        // 实例化游戏
        const dummyOpponent = { name: "青云赛庄家", id: "qy_host", bet: 0, currentMoney: 999999 };
        this.currentGame = new QingyunGame(dummyOpponent, this);

        // 调用初始化方法，并【传入当前的弹窗内容容器】
        // this.modalBody 是 GambleShop 在 updateContent 时缓存的 DOM 元素
        this.currentGame.setupGame(tier, this.modalBody);
    },

    // ================= 启动 传统游戏 =================
    launchGame: function(gameType, gamblerId, betAmount) {
        if (window.player.money < betAmount) {
            if(window.showToast) window.showToast("本金不足！");
            return;
        }

        // 【修改点】清理
        this._clearCurrentGame();

        const roster = window.UtilsGamble.getGamblers(this.currentTown.id, gameType);
        const opponent = roster.find(g => g.id === gamblerId);

        if (!opponent) return;

        if (opponent.suspicion >= 100) {
            if(window.showToast) window.showToast("对方正死死盯着你，此时无法入局！");
            return;
        }

        opponent.bet = betAmount;

        if (gameType === 'chupu') {
            if (window.ChupuGame) this.currentGame = new ChupuGame(opponent, this);
        } else if (gameType === 'liubo') {
            if (window.LiuboGame) this.currentGame = new LiuboGame(opponent, this);
        }

        if (this.currentGame) {
            UtilsMoney.removeMoney(betAmount);
            this.addMoneyLog('player', '本局押注', -betAmount);
            this.addMoneyLog('opponent', '本局对赌', -betAmount);

            if (window.UtilsGamble) {
                UtilsGamble.updateMoney(this.currentTown.id, gameType, opponent.id, 0, betAmount, 0);
            }

            if(window.saveGame) window.saveGame();
            if(window.updateUI) window.updateUI();

            this.currentGame.init();
        }
    }
};

// 注册商店
if (window.ShopSystem) ShopSystem.register("赌坊", GambleShop);
window.GambleShop = GambleShop;