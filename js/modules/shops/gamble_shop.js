// js/modules/shops/gamble_shop.js
// 赌坊大厅模块 v3.4 (角色池扩充 + UI细节调整)

console.log("加载 赌坊大厅模块 v3.4");

// ================= 大厅样式 =================
const shopStyles = `
<style id="gamble-shop-styles">
    .gamble-layout { display:flex; flex-direction:column; height:100%; padding:15px; font-family:"KaiTi", serif; font-size: 18px; color: #3e2723; }
    
    /* 欢迎语区域 */
    .gamble-greeting {
        flex: 0 0 auto; margin-bottom: 20px; padding: 15px; border-radius: 8px;
        background: rgba(255,255,255,0.6); border: 2px dashed #5d4037;
        font-family: 'KaiTi'; color: #3e2723; line-height: 1.4;
        text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .greeting-god { border: 3px double #ffd700; background: #fffde7; color: #bf360c; }
    .greeting-rich { border-color: #d84315; background: #fff3e0; }
    .greeting-poor { border-color: #9e9e9e; color: #616161; background: #f5f5f5; font-style: italic; }
    .greeting-tragic { border-color: #c62828; background: #ffebee; color: #b71c1c; font-weight: bold; }

    /* 游戏卡片 */
    .game-card {
        border: 3px solid #5d4037; border-radius: 12px; background: #fff8e1;
        width: 260px; cursor: pointer; transition: transform 0.2s; overflow: hidden;
        box-shadow: 0 6px 12px rgba(0,0,0,0.2); position: relative;
    }
    .game-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); border-color: #d84315; }
    .game-card .img-box { height: 150px; background: #d7ccc8; display:flex; align-items:center; justify-content:center; font-size:80px; }
    /* 【修改点 1】标题居中 (显式加上 text-align: center) */
    .game-card .title { font-size: 28px; font-weight: bold; color: #3e2723; padding: 15px; border-bottom: 2px dashed #bcaaa4; text-align: center; }
    
    /* 【修改点 2】说明文字居中 (原为 text-align: left) */
    .game-card .desc { font-size: 16px; color: #6d4c41; padding: 15px; line-height: 1.6; text-align: center; }
    /* 战绩展示区 */
    /* 【修改点 1】字体大小调整为 26px */
    .stats-panel {
        margin-top: 20px; padding: 10px; border-radius: 8px;
        text-align: center; background: rgba(255,255,255,0.4);
        border: 1px solid #bcaaa4; font-size: 26px; color: #5d4037; font-weight: bold;
    }

    /* 赌客列表项 */
    .gambler-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 15px; margin-bottom: 10px; background: #fff;
        border: 1px solid #d7ccc8; border-radius: 8px; transition: 0.2s;
    }
    .gambler-row:hover { border-color: #8d6e63; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    
    .gambler-row.depleted {
        background: #eeeeee; border-color: #e0e0e0; opacity: 0.8; 
    }
    .gambler-row.depleted .g-name { color: #999; }
    .gambler-row.depleted .g-avatar { filter: grayscale(1); opacity: 0.6; }
    
    .g-avatar { width: 60px; height: 60px; border-radius: 50%; background: #eee; display:flex; align-items:center; justify-content:center; font-size:32px; border: 2px solid #ccc; margin-right: 15px; }
    .g-info { flex: 1; }
    .g-name { font-size: 20px; font-weight: bold; color: #3e2723; }
    .g-money { font-size: 14px; color: #666; margin-top: 4px; }
    
    /* 下注区域 */
    .g-action { width: 300px; display: flex; flex-direction: column; gap: 5px; }
    .bet-grid { display: flex; gap: 5px; }
    .bet-btn {
        flex: 1; padding: 8px 0; border: 1px solid #8d6e63; background: #fdfbf7;
        color: #5d4037; cursor: pointer; border-radius: 4px; font-size: 14px; font-weight: bold;
        transition: 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center;
        line-height: 1.2;
    }
    .bet-btn:hover { background: #efebe9; color: #3e2723; border-color: #5d4037; }
    .bet-btn.high { border-color: #d84315; color: #d84315; }
    .bet-btn.high:hover { background: #fbe9e7; }
    
    .bet-btn.disabled { 
        background: #e0e0e0; color: #999; border-color: #ccc; 
        cursor: not-allowed; pointer-events: none; box-shadow: none;
    }
</style>
`;

if (!document.getElementById('gamble-shop-styles')) {
    document.head.insertAdjacentHTML('beforeend', shopStyles);
}

// ================= 【修改点 2】角色池扩展 =================
const GAMBLER_POOLS = {
    1: [ // Lv.1 初出茅庐
        { name: "村口二傻", title: "初出茅庐", avatar: "🥴" },
        { name: "隔壁阿福", title: "初出茅庐", avatar: "👶" },
        { name: "醉酒汉", title: "神志不清", avatar: "🍶" },
        { name: "偷懒农夫", title: "消遣时光", avatar: "👨‍🌾" },
        { name: "流浪汉", title: "碰碰运气", avatar: "🧟" }
    ],
    2: [ // Lv.2 略懂皮毛
        { name: "落魄书生", title: "略懂皮毛", avatar: "📜" },
        { name: "卖菜大婶", title: "斤斤计较", avatar: "👩‍🌾" },
        { name: "杀猪屠夫", title: "胆大心细", avatar: "🐷" },
        { name: "算命瞎子", title: "掐指一算", avatar: "🕶️" },
        { name: "游方郎中", title: "江湖骗子", avatar: "💊" }
    ],
    3: [ // Lv.3 杀伐果断
        { name: "秦军百夫长", title: "杀伐果断", avatar: "⚔️" },
        { name: "镖局趟子手", title: "走南闯北", avatar: "🐎" },
        { name: "衙门捕快", title: "目光如炬", avatar: "🕵️" },
        { name: "巡城校尉", title: "威风凛凛", avatar: "🛡️" },
        { name: "退伍老兵", title: "身经百战", avatar: "👴" }
    ],
    4: [ // Lv.4 精于算计
        { name: "市井老手", title: "精于算计", avatar: "🧮" },
        { name: "当铺掌柜", title: "眼光独到", avatar: "👓" },
        { name: "青楼老板", title: "阅人无数", avatar: "👘" },
        { name: "丝绸商人", title: "圆滑世故", avatar: "🧊" },
        { name: "赌场看场", title: "熟知套路", avatar: "💪" }
    ],
    5: [ // Lv.5 腰缠万贯
        { name: "富贾沈万", title: "腰缠万贯", avatar: "💰" },
        { name: "钱庄老板", title: "财大气粗", avatar: "🏦" },
        { name: "盐商巨头", title: "富甲一方", avatar: "🧂" },
        { name: "珠宝大亨", title: "挥金如土", avatar: "💎" },
        { name: "退休御厨", title: "尝遍百味", avatar: "👨‍🍳" }
    ],
    6: [ // Lv.6 当世棋圣
        { name: "六博国手", title: "当世棋圣", avatar: "👑" },
        { name: "隐世棋痴", title: "不败神话", avatar: "🧙‍♂️" },
        { name: "宫廷博待", title: "大内高手", avatar: "🏯" },
        { name: "天机老人", title: "算尽天机", avatar: "☯️" },
        { name: "鬼手张三", title: "千术通神", avatar: "👻" }
    ]
};

const GambleShop = {
    currentTown: null,
    modalBody: null,
    currentGame: null,

    // 生成确定性随机数
    _getHash: function(level, salt = "") {
        if (!window.player || !this.currentTown) return 0;
        const time = window.player.time;
        const week = Math.floor(time.day / 7);
        // 【修改后】去掉 week，仅使用 年_月
        const seedStr = `${this.currentTown.id}_${time.year}_${time.month}_${level}_${window.player.worldSeed}_${salt}`;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) / 2147483648; // 0.0 - 1.0
    },

    // 获取每日初始资金
    getDailyMoney: function(level) {
        const rand = this._getHash(level, "money");
        const base = (level * level) * 500 * ((window.player.timeStart || 0) + 1);
        const fluctuation = 0.8 + (rand * 0.4);
        return Math.floor(base * fluctuation);
    },

    // 【新增】根据种子获取当天的对手信息
    getGamblerInfo: function(level) {
        const pool = GAMBLER_POOLS[level] || GAMBLER_POOLS[1];
        const rand = this._getHash(level, "name");
        const index = Math.floor(rand * pool.length);

        // 必须返回一个新的对象，因为 bet 会动态计算
        const char = pool[index];
        return {
            level: level,
            name: char.name,
            title: char.title,
            avatar: char.avatar
        };
    },

    getMaxLevel: function() {
        if (!this.currentTown) return 1;
        const type = this.currentTown.level || 'village';
        if (type === 'city') return 6;
        if (type === 'town') return 5;
        return 6;
    },
// ================= 资金变动记录工具 =================
    // 获取指定目标的历史记录数组
    _getMoneyHistory: function(target) {
        if (target === 'player') {
            if (!this.playerSessionHistory) this.playerSessionHistory = [];
            return this.playerSessionHistory;
        } else {
            // 对手的记录存在 Shop 对象里，切换对手时记得清空
            if (!this.opponentSessionHistory) this.opponentSessionHistory = [];
            return this.opponentSessionHistory;
        }
    },

    // 添加一条日志
    _addMoneyLog: function(target, reason, amount) {
        const list = this._getMoneyHistory(target);
        const sign = amount > 0 ? '+' : '';
        // 赢钱显示橙色，输钱显示灰色
        const color = amount > 0 ? '#ffb74d' : '#bdbdbd';

        // 插入到数组开头
        list.unshift({
            reason: reason,
            valStr: `<span style="color:${color}; font-weight:bold;">${sign}${amount}</span>`
        });

        // 只保留最近 6 条
        if (list.length > 6) list.pop();
    },

    // 清空记录 (比如回到大厅或者换人时调用)
    _clearMoneyHistory: function() {
        this.playerSessionHistory = [];
        this.opponentSessionHistory = [];
    },

    // 生成悬浮窗的 HTML 内容
    _generateMoneyHistoryHtml: function(target) {
        const list = this._getMoneyHistory(target);
        if (list.length === 0) return '<div style="color:#777; text-align:center; font-size:12px;">暂无变动</div>';

        return list.map(log => `
            <div style="display:flex; justify-content:space-between; border-bottom:1px dashed rgba(255,255,255,0.1); padding:4px 0; font-size:20px; line-height:1.4;">
                <span style="color:#d7ccc8;">${log.reason}</span>
                <span>${log.valStr}</span>
            </div>
        `).join('');
    },
    enter: function(town) {
        this.currentTown = town;
        this.renderMainMenu();
        if (window.UITutorial) UITutorial.checkBuilding('gamble');
    },

    _updateContent: function(html) {
        // 检查 modalBody 是否存在且确实连接在 DOM (页面) 上
        if (this.modalBody && document.body.contains(this.modalBody)) {
            this.modalBody.innerHTML = html;
        } else {
            // 如果原来的弹窗没了（比如全被关掉了），就重新创建一个
            console.log("[Gamble] Modal lost, recreating...");
            const title = (this.currentTown && this.currentTown.name) ? `${this.currentTown.name}赌坊` : "赌坊";
            // 重新调用通用弹窗方法，并重新赋值给 this.modalBody
            this.modalBody = window.showGeneralModal(title, html, null, "modal_gamble", 68, 85);
        }
    },

    renderMainMenu: function() {
        if (!window.showGeneralModal) return;

        // 【新增】检查黑名单
        const isBlacklisted = window.UtilsGamble ? UtilsGamble.isBlacklisted(this.currentTown.id) : false;

        let netProfit = 0;
        if (window.UtilsGamble) netProfit = UtilsGamble.getTownNetProfit(this.currentTown.id);

        let greetingHtml = "";
        let statsInfo = "";
        const profitStr = Math.abs(netProfit).toLocaleString();

        if (isBlacklisted) {
            // 黑名单欢迎语
            greetingHtml = `<div class="gamble-greeting greeting-tragic">
                <div style="font-weight:bold; font-size:30px; margin-bottom:5px;">看场：(横眉冷对) 滚出去！</div>
                <div style="font-size:24px;">咱们这儿不欢迎手脚不干净的人！下个月再来吧！</div>
            </div>`;
            statsInfo = `<span style="color:#b71c1c; font-weight:bold;">已被列入黑名单</span>`;
        } else {
            // 调整了战绩显示的字体大小，以匹配 26px 的父容器
            if (netProfit >= 100000) {
                greetingHtml = `<div class="gamble-greeting greeting-god"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">老板：（跪地）赌神爷您来了！</div><div style="font-size:35px;">小的这就去给您清场，今日您想怎么玩都行！</div></div>`;
                statsInfo = `<span style="font-weight:900; color:#ffd700; text-shadow:1px 1px 0 #000; font-size:32px;">★ 赌神降临 (赢 ${profitStr}) ★</span>`;
            } else if (netProfit >= 10000) {
                greetingHtml = `<div class="gamble-greeting greeting-rich"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">老板：哟，贵客稀客！</div><div style="font-size:35px;">您这手气最近可是旺得很呐，雅间给您留着呢。</div></div>`;
                statsInfo = `<span style="font-weight:bold; color:#d84315; font-size:30px;">手气亨通 (赢 ${profitStr})</span>`;
            } else if (netProfit >= 0) {
                greetingHtml = `<div class="gamble-greeting"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">荷官：客官里面请！</div><div style="font-size:35px;">买定离手，搏一搏单车变摩托！今日想玩点什么？</div></div>`;
                statsInfo = `<span style="color:#5d4037; font-size:28px;">小有斩获 (赢 ${profitStr})</span>`;
            } else if (netProfit > -50000) {
                greetingHtml = `<div class="gamble-greeting greeting-poor"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">伙计：客官，胜败乃兵家常事。</div><div style="font-size:35px;">今日不如转转运，说不定一把就回本了呢？</div></div>`;
                statsInfo = `<span style="color:#757575; font-size:28px;">稍有亏损 (输 ${profitStr})</span>`;
            } else {
                greetingHtml = `<div class="gamble-greeting greeting-tragic"><div style="font-weight:bold; font-size:40px; margin-bottom:5px;">老板：（斜眼）哟，这不是那谁吗？</div><div style="font-size:35px;">没钱别挡道，若是带了银子，倒是可以再让你输点。</div></div>`;
                statsInfo = `<span style="font-weight:900; color:#b71c1c; font-size:30px;">☠️ 倾家荡产 (输 ${profitStr}) ☠️</span>`;
            }
        }
        const townName = this.currentTown.name;
        // 如果黑名单，卡片变灰不可点
        const cardStyle = isBlacklisted ? 'filter: grayscale(1); pointer-events: none; opacity: 0.6;' : '';
        const clickAction = isBlacklisted ? '' : 'onclick="GambleShop.selectGame(\'liubo\')"';

        const html = `
            <div class="gamble-layout" style="align-items: center;">
                ${greetingHtml}

                <div style="display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
                    <div class="game-card" ${clickAction} style="${cardStyle}">
                        <div class="img-box">♟️</div>
                        <div class="title">六 博</div>
                        <div class="desc">
                            古之博戏，枭散相杀。<br>
                            投箸行棋，步步惊心。<br>
                            <span style="color:#d84315">策略与运气的博弈。</span>
                        </div>
                    </div>

                    <div class="game-card" ${clickAction ? `onclick="GambleShop.selectGame('chupu')"` : ''} style="${cardStyle}">
                        <div class="img-box">🎲</div>
                        <div class="title">樗 蒲</div>
                        <div class="desc">
                            五木定乾坤，卢雉决胜负。<br>
                            <span style="color:#d84315">手动改命的刺激玩法。</span>
                        </div>
                        </div>
                </div>

                <div class="stats-panel" style="width: 80%; padding: 10px; margin-top: 20px;">
                    在此地战绩：${statsInfo}
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`${this.currentTown.name}赌坊`, html, null, "modal_gamble", 68, 85);
    },

    // ================= 选人界面 =================
    selectGame: function(gameType) {
        this._clearMoneyHistory();

        const skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;
        const maxLevel = this.getMaxLevel();

        if (window.UtilsGamble && UtilsGamble.isBlacklisted(this.currentTown.id)) {
            if(window.showToast) window.showToast("你已被拉黑，无法入局！");
            this.renderMainMenu();
            return;
        }

        let listHtml = "";
        for (let i = 1; i <= maxLevel; i++) {
            const cfg = this.getGamblerInfo(i);

            // 1. 基础资金 (每月固定)
            const initialMoney = this.getDailyMoney(i);

            // 2. 敌人今日已输 (每日重置)
            const lostMoney = UtilsGamble.getDailyEnemyLoss(this.currentTown.id, i);

            // 3. 【新增】敌人本月赢走的钱 (每月累计)
            const gainedMoney = UtilsGamble.getMonthlyEnemyGain(this.currentTown.id, i);

            // 4. 计算当前资金：(基础 + 赢来的) - 今日输掉的
            const currentMoney = Math.max(0, (initialMoney + gainedMoney) - lostMoney);
            const isDepleted = currentMoney <= 0;

            const playerMoney = window.player.money;
            const basePool = Math.min(playerMoney, currentMoney);
            const bet10 = Math.floor(basePool * 0.1);
            const bet50 = Math.floor(basePool * 0.5);
            const bet100 = basePool;

            const showMoney = skillLevel >= 1;
            const moneyStr = isDepleted ? "已破产" : (showMoney ? `${currentMoney.toLocaleString()} 文` : "??? 文");
            const rowClass = isDepleted ? "gambler-row depleted" : "gambler-row";
            const getBtnState = (amount) => (isDepleted || amount <= 0) ? 'disabled' : '';
            const getBtnText = (label, val) => showMoney ? `${label}<br>${val}` : `${label}<br>???`;

            // 【UI优化】如果敌人身上有赢来的钱，显示一个额外标记 (比如：💰+500)
            let gainTag = "";
            if (showMoney && gainedMoney > 0) {
                gainTag = `<span style="font-size:12px; color:#d84315; margin-left:5px;">(含赢取 ${gainedMoney})</span>`;
            }

            listHtml += `
                <div class="${rowClass}">
                    <div style="display:flex; align-items:center;">
                        <div class="g-avatar">${cfg.avatar}</div>
                        <div class="g-info">
                            <div class="g-name">
                                ${cfg.name} <span style="font-size:14px; background:#f0f0f0; color:#666; padding:2px 5px; border-radius:4px;">Lv.${cfg.level} ${cfg.title}</span>
                            </div>
                            <div class="g-money">剩余：<b style="color:${isDepleted?'red':'#3e2723'}">${moneyStr}</b>${gainTag}</div>
                        </div>
                    </div>
                    
                    <div class="g-action">
                        <div style="font-size:14px; color:#888; text-align:center; margin-bottom:2px;">
                            ${isDepleted ? "已歇业" : (playerMoney <= 0 ? "你没钱了" : "选择筹码入局")}
                        </div>
                        <div class="bet-grid">
                            <button class="bet-btn ${getBtnState(bet10)}" onclick="GambleShop.startGame('${gameType}', ${i}, ${currentMoney}, ${bet10})">
                                ${getBtnText("小玩", bet10)}
                            </button>
                            <button class="bet-btn ${getBtnState(bet50)}" onclick="GambleShop.startGame('${gameType}', ${i}, ${currentMoney}, ${bet50})">
                                ${getBtnText("对博", bet50)}
                            </button>
                            <button class="bet-btn high ${getBtnState(bet100)}" onclick="GambleShop.startGame('${gameType}', ${i}, ${currentMoney}, ${bet100})">
                                ${getBtnText("梭哈", bet100)}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        const html = `
            <div class="gamble-layout">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ccc; padding-bottom:15px; margin-bottom:15px;">
                    <button class="ink_btn_small" onclick="GambleShop.renderMainMenu()" style="font-size:18px; padding:8px 20px;">⬅ 返回大厅</button>
                    <div style="font-weight:bold; font-size:24px;">选择对局 (当前赌术 Lv.${skillLevel})</div>
                    <div style="font-size:30px; color:#d84315;">我的本金: ${window.player.money.toLocaleString()}</div>
                </div>
                <div style="flex:1; overflow-y:auto; padding:5px;">
                    ${listHtml}
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    // ================= 【新增】赌徒状态持久化 =================
    // 获取指定赌徒的状态 (警戒值, 本月已闲聊次数)
    getOpponentState: function(level) {
        if (!window.player.gambleStates) window.player.gambleStates = {};

        const townId = this.currentTown.id;
        // 数据结构: player.gambleStates[townId][level]
        if (!window.player.gambleStates[townId]) window.player.gambleStates[townId] = {};

        let state = window.player.gambleStates[townId][level];

        // 初始化或月度重置 (检查月份变化)
        const currentMonth = `${player.time.year}-${player.time.month}`;

        if (!state) {
            state = { suspicion: 0, chatCount: 0, lastMonth: currentMonth };
            window.player.gambleStates[townId][level] = state;
        } else if (state.lastMonth !== currentMonth) {
            // 新的一月，重置闲聊次数，但保留警戒值(根据你的需求)
            state.chatCount = 0;
            state.lastMonth = 0;
            // 警戒值是否每月衰减？你的需求说"不会随着进出清0"，没说每月清。
            // 这里为了游戏性，每月可以让警戒值稍微降低一点点，或者完全不降。
            // 暂时按"不降"处理，完全靠闲聊消除。
        }

        return state;
    },

    // 更新赌徒状态
    updateOpponentState: function(level, suspicion, chatCount) {
        const state = this.getOpponentState(level);
        state.suspicion = Math.min(100, Math.max(0, suspicion)); // 限制 0-100
        state.chatCount = chatCount;
        if(window.saveGame) window.saveGame();
    },

    // ================= 修改 startGame =================
    // 修改 startGame 方法，将 opponentState 传入游戏
    startGame: function(gameType, level, enemyCurrentMoney, betAmount, lastRoundData = null) {
        if (enemyCurrentMoney <= 0) return;
        if (betAmount <= 0) { if(window.showToast) window.showToast("金额过小"); return; }
        if (window.player.money < betAmount) { if(window.showToast) window.showToast("本金不足"); return; }

        // 获取持久化状态
        const opState = this.getOpponentState(level);

        // 如果警戒值满了(100)，禁止开局 (或者开局直接抓)
        if (opState.suspicion >= 100) {
            if(window.showToast) window.showToast("对方正死死盯着你，此时无法入局！(请尝试闲聊)");
            return;
        }

        const cfg = this.getGamblerInfo(level);
        window.player.money -= betAmount;
        // 【新增】记录押注日志
        this._addMoneyLog('player', '本局押注', -betAmount);
        this._addMoneyLog('opponent', '本局对赌', -betAmount);
        if (window.UtilsGamble) {
            UtilsGamble.addMonthlyEnemyGain(this.currentTown.id, level, betAmount);
        }

        if(window.saveGame) window.saveGame();
        if(window.updateUI) window.updateUI();

        const opponent = {
            id: `level_${level}`,
            name: cfg.name,
            level: level,
            bet: betAmount,
            maxMoney: enemyCurrentMoney,
            // 传入状态
            suspicion: opState.suspicion,
            chatCount: opState.chatCount
        };

        if (gameType === 'liubo') {
            if (window.LiuboGame) {
                this.currentGame = new LiuboGame(opponent, this);
                this.currentGame.init();
            }
        }
        else if (gameType === 'chupu') {
            if (window.ChupuGame) {
                // 【核心修改】将 lastRoundData 传入构造函数
                this.currentGame = new ChupuGame(opponent, this, lastRoundData);
                this.currentGame.init();
            }
        }
    },

    // ================= 结算回调 =================
    // ================= 结算回调 (修复版) =================
        finishGame: function(gameType, isWin, betAmount, payout, forceExit = false) {
            console.log(">>> [Gamble] finishGame called", {gameType, isWin, betAmount, payout, forceExit});
            if (window.closeModal) window.closeModal();
            // 1. 【核心修改】精确关闭结算弹窗，而不影响主窗口
            const resultModal = document.getElementById('modal_gamble_result');
            if (resultModal) {
                // 尝试找到包裹它的遮罩层 (overlay)
                const overlay = resultModal.closest('.modal_overlay');
                if (overlay) {
                    overlay.remove(); // 移除遮罩层（连同里面的弹窗）
                } else {
                    resultModal.remove(); // 如果没有遮罩，直接移除弹窗
                }
            }
            // ❌ 删除这行：不要调用 window.closeModal()，因为它可能误关主窗口
            // if (window.closeModal) window.closeModal();

            // 2. 资金结算
            if (payout !== 0) {
                window.player.money += payout;
                if (window.player.money < 0) window.player.money = 0;
            }

            // 3. 统计逻辑
            const townId = this.currentTown.id;
            const profit = payout - betAmount;

            if (window.UtilsGamble) {
                UtilsGamble.recordGame(townId, gameType, isWin, Math.abs(profit));
                const level = this.currentGame ? this.currentGame.opponent.level : 1;

                if (isWin) {
                    const actualWin = profit;
                    UtilsGamble.addDailyEnemyLoss(townId, level, actualWin);
                    UtilsGamble.addMonthlyEnemyGain(townId, level, -betAmount);
                }
            }

            // 4. 保存
            if(window.saveGame) window.saveGame();
            if(window.updateUI) window.updateUI();

            // 5. 跳转逻辑
            // 给一点点延迟，让 DOM 移除操作完成，避免视觉闪烁
            setTimeout(() => {
                if (forceExit) {
                    // 如果是被踢出（作弊），回到大厅看老板骂人
                    this.renderMainMenu();
                } else {
                    // 正常离场 -> 回到【选人界面】(selectGame)
                    // 这样玩家可以换个人继续玩，或者点左上角返回
                    this.selectGame(gameType);
                }
            }, 50);
        },
        // ================= 结算弹窗 (修复按钮逻辑) =================
        showGameResult: function(gameType, isWin, betAmount, payout, calcProfit) {
            const opponent = this.currentGame.opponent;
            let finalPayout = payout;

            // 1. 计算净利润
            let profit = (calcProfit !== undefined) ? calcProfit : (payout - betAmount);

            // 获取牌型名称 (用于日志)
            let reasonSuffix = "";
            if (this.currentGame && this.currentGame.lastRankName) {
                reasonSuffix = `-${this.currentGame.lastRankName}`;
            }

            // 记录结算日志
            if (isWin) {
                this._addMoneyLog('player', `获胜${reasonSuffix}`, payout);
                this._addMoneyLog('opponent', '本局败北', -profit);
            } else if (profit === 0 && payout === betAmount) {
                this._addMoneyLog('player', '平局退款', payout);
                this._addMoneyLog('opponent', '平局退款', payout);
            } else {
                if (payout !== 0) {
                    this._addMoneyLog('player', `败北${reasonSuffix}`, payout);
                } else {
                    this._addMoneyLog('player', `败北${reasonSuffix}`, 0);
                }
                this._addMoneyLog('opponent', '本局获胜', betAmount);
            }

            // 2. 封顶与破产提示逻辑
            let subMsg = "";
            if (isWin) {
                if (profit >= opponent.maxMoney && opponent.maxMoney > 0) {
                    subMsg = `<div style="font-size:16px; color:#b71c1c; margin-top:5px;">(对手只有 ${opponent.maxMoney} 文，已掏空家底！)</div>`;
                }
            } else {
                if (profit === 0 && finalPayout === betAmount) {
                    // 平局
                } else {
                    if (Math.abs(profit) > betAmount) {
                        subMsg = `<div style="font-size:16px; color:#d84315; margin-top:5px;">(遭遇高倍暴击，追加扣除 ${Math.abs(profit) - betAmount} 文！)</div>`;
                    }
                    if (window.player.money <= 0) {
                        subMsg += `<div style="font-size:16px; color:#b71c1c; font-weight:bold;">(你已破产...)</div>`;
                    }
                }
            }

            // 3. 识别平局状态
            const isDraw = !isWin && (finalPayout === betAmount);

            // 4. 构建弹窗内容
            let title = "";
            let color = "";
            let icon = "";
            let msg = "";
            let amountColor = "";

            if (isWin) {
                title = "✨ 大 获 全 胜 ✨";
                color = "#d84315";
                icon = "🀄";
                amountColor = "#d84315";
                msg = `技高一筹，赢取筹码<br><span style="font-size:36px; color:${amountColor}; font-weight:bold;">+${profit}</span>${subMsg}`;
            } else if (isDraw) {
                title = "🤝 平 分 秋 色 🤝";
                color = "#795548";
                icon = "⚖️";
                msg = `势均力敌，退还本金<br><span style="font-size:36px; color:#5d4037; font-weight:bold;">±0</span>`;
            } else {
                title = "💀 棋 差 一 着 💀";
                color = "#5d4037";
                icon = "💸";
                amountColor = "#757575";
                msg = `技不如人，损失筹码<br><span style="font-size:36px; color:${amountColor}; font-weight:bold;">${profit}</span>${subMsg}`;
            }

            // 5. 【核心修复】按钮逻辑重写
            // 拆分为：赢了(Win) 和 没赢(Lose/Draw) 两大类

            let buttonsHtml = "";

            if (isWin) {
                // --- 赢了的情况 ---
                // 判断对手是否还有钱 (总身家 - 这一把输掉的 > 0)
                const enemyHasMoney = (opponent.maxMoney - profit) > 0;

                if (enemyHasMoney) {
                    // 赢了且对方还有钱 -> 显示“收钱离场”和“乘胜追击”
                    buttonsHtml = `
                    <div style="display:flex; gap:20px; justify-content:center; margin-top:20px;">
                        <button class="ink_btn" style="background:#757575; border-color:#616161; min-width:120px;" 
                            onclick="GambleShop.finishGame('${gameType}', true, ${betAmount}, ${finalPayout}, false)">
                            收钱离场
                        </button>
                        <button class="ink_btn" style="background:#d84315; border-color:#bf360c; min-width:140px;" 
                            onclick="GambleShop.quickNextRound('${gameType}', ${opponent.level}, ${betAmount}, ${finalPayout}, ${profit})">
                            乘胜追击
                        </button>
                    </div>
                `;
                } else {
                    // 赢光了对方 -> 只能离场 (文案优化)
                    buttonsHtml = `
                    <div style="text-align:center; margin-top:20px;">
                        <button class="ink_btn" style="background:#2e7d32; border-color:#1b5e20; padding: 10px 30px;" 
                            onclick="GambleShop.finishGame('${gameType}', true, ${betAmount}, ${finalPayout}, false)">
                            对手已破产，心满意足离场
                        </button>
                    </div>
                `;
                }
            } else {
                // --- 输了 或 平局 ---
                // 只要玩家还有钱付得起下一把的底注，就可以重来
                // (注意：平局时玩家的钱是在 quickRetry 里退回来的，所以此时显示余额可能看起来不够，但逻辑上是够的)
                // 这里判断 (余额 + 本局退款) >= 底注
                const playerCanContinue = (window.player.money + finalPayout) >= betAmount;

                if (playerCanContinue) {
                    const exitText = isDraw ? "和平离场" : "黯然离场";
                    buttonsHtml = `
                    <div style="display:flex; gap:20px; justify-content:center; margin-top:20px;">
                        <button class="ink_btn" style="background:#757575; border-color:#616161; min-width:120px;" 
                            onclick="GambleShop.finishGame('${gameType}', false, ${betAmount}, ${finalPayout}, false)">
                            ${exitText}
                        </button>
                        <button class="ink_btn" style="background:#2e7d32; border-color:#1b5e20; min-width:140px;" 
                            onclick="GambleShop.quickRetry('${gameType}', ${opponent.level}, ${betAmount}, ${finalPayout})">
                            不服再来
                        </button>
                    </div>
                `;
                } else {
                    // 玩家没钱了
                    buttonsHtml = `
                    <div style="text-align:center; margin-top:20px;">
                        <button class="ink_btn_small" onclick="GambleShop.finishGame('${gameType}', false, ${betAmount}, ${finalPayout}, false)">
                            囊中羞涩，黯然离场
                        </button>
                    </div>
                `;
                }
            }

            const html = `
            <div style="text-align:center; padding:20px; font-family:'KaiTi';">
                <div style="font-size:60px; margin-bottom:10px;">${icon}</div>
                <div style="font-size:28px; font-weight:bold; color:${color}; margin-bottom:15px;">${title}</div>
                <div style="font-size:20px; color:#3e2723; line-height:1.6;">${msg}</div>
                ${buttonsHtml}
            </div>
        `;

            window.showGeneralModal(null, html, null, "modal_gamble_result", 50, 50);
        },

    // ================= 快速重试逻辑 (修复平局吞钱bug) =================
    // 新增参数 lastPayout：上一局应该退还/奖励的金额 (平局时为 betAmount)
    quickRetry: function(gameType, level, betAmount, lastPayout = 0) {
        console.log(">>> [Gamble] quickRetry called. Last Payout:", lastPayout);
// 【核心新增】在销毁前，先保存上一局的骰子数据 (仅针对樗蒲)
        let lastRoundData = null;
        if (gameType === 'chupu' && this.currentGame) {
            lastRoundData = {
                playerDices: this.currentGame.playerDices ? [...this.currentGame.playerDices] : null,
                enemyDices: this.currentGame.enemyDices ? [...this.currentGame.enemyDices] : null
            };
        }
        // 1. 立即移除结算弹窗 (清理旧界面)
        const resultModal = document.getElementById('modal_gamble_result');
        if (resultModal) {
            const parent = resultModal.parentElement;
            if (parent && (parent.classList.contains('modal_overlay') || parent.className.includes('modal_overlay'))) {
                parent.remove();
            } else {
                resultModal.remove();
            }
        }
        if (window.closeModal) try { window.closeModal(); } catch(e) {}
        // 清理残留遮罩
        const overlays = document.querySelectorAll('.modal_overlay');
        if (overlays.length > 0) {
            const top = overlays[overlays.length - 1];
            if (top && !top.querySelector('#modal_gamble_result') && top.innerHTML.trim() === "") {
                top.remove();
            }
        }

        // 2. 【核心修复】先结算上一局的资金！
        // 如果是平局，lastPayout = betAmount，这里会把本金加回来
        // 这样下一局扣款时，玩家的总资金才是正确的
        if (lastPayout && lastPayout !== 0) {
            window.player.money += lastPayout;
            console.log(`[Gamble] 重试前结算: 退还/发放 ${lastPayout}`);
        }

        const townId = this.currentTown.id;

        // 3. 记录上一局战绩 (只记场次，不算赢)
        if (window.UtilsGamble) {
            UtilsGamble.recordGame(townId, gameType, false, betAmount);
        }

        // 保存状态
        if(window.saveGame) window.saveGame();
        if(window.updateUI) window.updateUI();

        // 4. 准备新一局数据
        const info = this.getGamblerInfo(level);
        const initial = this.getDailyMoney(level);
        const lost = UtilsGamble.getDailyEnemyLoss(townId, level);
        const gained = UtilsGamble.getMonthlyEnemyGain(townId, level);
        const currentMoney = Math.max(0, (initial + gained) - lost);

        // 【核心修改】将 lastRoundData 传给 startGame
        setTimeout(() => {
            this.startGame(gameType, level, currentMoney, betAmount, lastRoundData);
        }, 100);
    },
    // ================= 【修改】赢钱后快速开始下一局 =================
    quickNextRound: function(gameType, level, betAmount, payout, realProfit) {
        console.log(">>> [Gamble] quickNextRound: Player won, continuing...");

        // 1. 暴力关弹窗 (代码保持不变)
        const resultModal = document.getElementById('modal_gamble_result');
        if (resultModal) {
            const parent = resultModal.parentElement;
            if (parent && (parent.classList.contains('modal_overlay') || parent.className.includes('modal_overlay'))) {
                parent.remove();
            } else {
                resultModal.remove();
            }
        }
        if (window.closeModal) try { window.closeModal(); } catch(e) {}
        const overlays = document.querySelectorAll('.modal_overlay');
        if (overlays.length > 0) {
            const top = overlays[overlays.length - 1];
            if (top && !top.querySelector('#modal_gamble_result') && top.innerHTML.trim() === "") {
                top.remove();
            }
        }

        // 2. 结算上一局收益 (代码保持不变)
        window.player.money += payout;
        const townId = this.currentTown.id;
        if (window.UtilsGamble) {
            UtilsGamble.recordGame(townId, gameType, true, realProfit);
            UtilsGamble.addDailyEnemyLoss(townId, level, realProfit);
            UtilsGamble.addMonthlyEnemyGain(townId, level, -betAmount);
        }
        if(window.saveGame) window.saveGame();
        if(window.updateUI) window.updateUI();

        // 3. 计算敌人剩余资金
        const initial = this.getDailyMoney(level);
        const lost = UtilsGamble.getDailyEnemyLoss(townId, level);
        const gained = UtilsGamble.getMonthlyEnemyGain(townId, level);
        const currentMoney = Math.max(0, (initial + gained) - lost);

        // 4. 【核心修改】不重置游戏，而是通知游戏准备下一轮
        if (this.currentGame && typeof this.currentGame.prepareNextRound === 'function') {
            // 同步最新的对手资金
            this.currentGame.opponent.maxMoney = currentMoney;
            // 调用游戏内部方法：保持界面，显示赢取金额，准备点击
            this.currentGame.prepareNextRound(realProfit);
        } else {
            // 兜底（如果游戏不支持平滑过渡，还是走老逻辑）
            this.startGame(gameType, level, currentMoney, betAmount);
        }
    }
};

// 【修改点 3】注册商店
if (window.ShopSystem) {
    ShopSystem.register("赌坊", GambleShop);
}

window.GambleShop = GambleShop;