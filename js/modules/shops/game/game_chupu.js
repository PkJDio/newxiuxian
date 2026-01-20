// js/modules/games/game_chupu.js
// 樗蒲 (五木之戏) - v3.0 (警戒系统 + 平滑成长 + 闲聊)

console.log("加载 樗蒲模块 v3.0");

// ================= 樗蒲专用样式 =================
const chupuStyles = `
<style id="game-chupu-styles">
    /* --- 主容器 --- */
    .chupu_board {
        flex: 1; 
        background: #211410; 
        border: 6px solid #4e342e; 
        border-radius: 12px;
        padding: 10px; 
        display: flex; 
        flex-direction: column; 
        color: #fff8e1; 
        position: relative;
        font-family: "KaiTi", serif; 
        overflow: hidden; 
        box-shadow: inset 0 0 80px rgba(0,0,0,0.9);
    }

    /* --- 1. 头部区域 --- */
    .chupu_header {
        display: flex; 
        justify-content: space-between; 
        align-items: flex-end;
        border-bottom: 2px dashed #6d4c41; 
        padding-bottom: 8px; 
        margin-bottom: 5px;
        flex-shrink: 0; 
        height: 60px;
        background: rgba(0,0,0,0.2); 
        border-radius: 8px 8px 0 0; 
        padding: 5px 20px;
        box-sizing: border-box;
    }
    
    .chupu_header_left, .chupu_header_right { 
        display: flex; 
        flex-direction: column; 
        justify-content: space-between; 
        height: 100%; 
    }
    .chupu_header_left { align-items: flex-start; }
    .chupu_header_right { align-items: flex-end; margin-bottom: 6px; }

    .chupu_header_row { 
        display: flex; 
        align-items: baseline; 
        line-height: 1; 
    }
    .chupu_header_row:first-child { margin-bottom: 6px; }

    /* 文字样式 */
    .chupu_text_label { font-size: 20px; color: #aaa; margin-right: 8px; }
    .chupu_text_name { font-size: 24px; font-weight: bold; color: #fff; }
    .chupu_text_money_label { font-size: 18px; color: #8d6e63; margin-right: 5px; }
    .chupu_text_money_val { font-size: 22px; color: #ffb74d; font-weight: bold; font-family: Arial, sans-serif; letter-spacing: 0.5px; }

    /* --- 2. 警戒条样式 --- */
    .chupu_suspicion_wrap {
        width: 100px; height: 8px; 
        background: #3e2723; border: 1px solid #5d4037;
        margin-left: 10px; border-radius: 4px; 
        overflow: hidden; position: relative;
        display: inline-block; vertical-align: middle;
    }
    .chupu_suspicion_fill { height: 100%; transition: width 0.3s; }
    .chupu_sus_low { background: #66bb6a; } /* 绿 */
    .chupu_sus_med { background: #ffa726; } /* 橙 */
    .chupu_sus_high { background: #ef5350; } /* 红 */
    .chupu_suspicion_text { font-size: 14px; color: #ccc; margin-left: 5px; }

    /* --- 3. 中间押注信息 --- */
    .chupu_bet_area {
        text-align: center; 
        margin-bottom: 10px; 
        position: relative; 
        z-index: 10;
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        margin-top: -5px;
    }
    .chupu_bet_title { font-size: 22px; color: #a1887f; font-weight: bold; letter-spacing: 2px; }
    .chupu_bet_val { font-size: 34px; color: #d84315; font-weight: bold; text-shadow: 0 2px 0 rgba(0,0,0,0.3); line-height: 1.1; }

    /* 规则按钮 (小) */
    .chupu_btn_rules_small { 
        font-size: 16px; background: none; border: 1px solid #8d6e63; 
        color: #aaa; border-radius: 4px; padding: 2px 6px; cursor: pointer; margin-left: 10px; 
    }
    .chupu_btn_rules_small:hover { border-color: #d84315; color: #d84315; }

    /* --- 4. 战场区域 (桌子) --- */
    .chupu_battle_field { 
        flex: 1; 
        display: flex; 
        flex-direction: row; 
        justify-content: space-between; 
        align-items: center; 
        padding: 0 5px; 
        gap: 15px; 
    }
    
    .chupu_bowl { 
        flex: 1; height: 280px; 
        position: relative; 
        border: 10px solid; 
        box-shadow: inset 0 10px 30px rgba(0,0,0,0.7), 0 10px 20px rgba(0,0,0,0.5); 
        display: flex; justify-content: center; align-items: center; gap: 12px; 
        border-radius: 30px; 
    }
    
    /* 水印 */
    .chupu_watermark { 
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        font-size: 120px; font-weight: bold; opacity: 0.15; pointer-events: none; user-select: none;
    }
    
    .chupu_bowl_enemy { background: radial-gradient(circle at center, #455a64 0%, #263238 80%); border-color: #37474f; }
    .chupu_bowl_enemy .chupu_watermark { color: #cfd8dc; }

    .chupu_bowl_player { background: radial-gradient(circle at center, #6d4c41 0%, #3e2723 80%); border-color: #5d4037; }
    .chupu_bowl_player .chupu_watermark { color: #ffcc80; }

    /* --- 5. 骰子样式 --- */
    .chupu_dice { 
        width: 36px; height: 72px; 
        border-radius: 14px; border: 2px solid #1a1a1a; 
        cursor: pointer; 
        display: flex; justify-content: center; align-items: center; 
        font-size: 24px; position: relative; z-index: 2; 
        transition: transform 0.2s; 
        box-shadow: 3px 5px 8px rgba(0,0,0,0.6); 
    }
    .chupu_dice_black { background: #212121; color: #fff; } 
    .chupu_dice_black::after { content: '🐮'; filter: grayscale(1); }
    
    .chupu_dice_white { background: #f5f5f5; color: #333; } 
    .chupu_dice_white::after { content: '🐦'; }
    
    .chupu_dice_spinning { animation: chupuSpin 0.2s infinite linear; pointer-events: none; }
    @keyframes chupuSpin { 0% { transform: rotateX(0); } 100% { transform: rotateX(360deg); } }
    
    .chupu_cheat_active .chupu_dice:hover { transform: scale(1.2); box-shadow: 0 0 15px #ffeb3b; border-color: #ffeb3b; z-index: 10; }

    /* --- 6. 状态区域 (中间下方) --- */
    .chupu_status_area { 
        position: absolute; bottom: 85px; left: 50%; transform: translateX(-50%); 
        text-align: center; width: 300px; z-index: 15; 
    }
    .chupu_status_text { 
        font-size: 22px; font-weight: bold; color: #ffcc80; 
        text-shadow: 0 2px 2px #000; margin-bottom: 5px; 
    }
    .chupu_timer_wrap { 
        width: 100%; height: 8px; background: #424242; 
        border-radius: 4px; overflow: hidden; border: 1px solid #aaa; 
    }
    .chupu_timer_fill { height: 100%; background: #ff9800; width: 100%; transition: width linear; }

    /* --- 7. 倍率表 (右下角) --- */
    .chupu_rates_panel { 
        position: absolute; right: 15px; bottom: 15px; 
        background: rgba(0,0,0,0.8); padding: 8px 12px; 
        border-radius: 6px; border: 1px solid #5d4037; z-index: 30; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .chupu_rate_row { 
        font-size: 14px; color: #ccc; 
        display: flex; justify-content: space-between; 
        gap: 15px; margin-bottom: 2px; 
    }

    /* --- 8. 底部控制栏 (修复对齐问题) --- */
    .chupu_controls { 
        margin-top: auto; 
        height: 70px; 
        display: flex; 
        justify-content: center; /* 居中对齐所有按钮 */
        align-items: center; 
        gap: 30px; /* 按钮之间的间距 */
        border-top: 1px dashed rgba(93, 64, 55, 0.5); 
        padding-top: 5px; 
    }

    /* 闲聊按钮 */
    .chupu_btn_chat {
        width: 60px; height: 60px; 
        border-radius: 50%;
        background: #fff; border: 2px solid #8d6e63; color: #5d4037;
        font-size: 14px; font-weight: bold; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        box-shadow: 0 3px 5px rgba(0,0,0,0.2); transition: 0.2s;
        flex-shrink: 0; /* 防止被挤压 */
    }
    .chupu_btn_chat:hover { background: #f5f5f5; transform: scale(1.05); }
    .chupu_btn_chat:active { transform: scale(0.95); }
    .chupu_btn_chat.disabled { filter: grayscale(1); opacity: 0.6; cursor: not-allowed; }

    /* 投掷按钮 (大按钮) */
    .chupu_btn_throw {
        background: linear-gradient(to bottom, #d84315, #bf360c); 
        color: #fff; font-size: 26px; 
        padding: 8px 50px; border-radius: 40px; 
        border: 3px solid #ffcc80; cursor: pointer; 
        box-shadow: 0 5px 0 #8d6e63; transition: 0.1s; 
        width: 280px; font-family: "KaiTi";
        flex-shrink: 0;
    }
    .chupu_btn_throw:active { transform: translateY(3px); box-shadow: 0 1px 0 #8d6e63; }
    .chupu_btn_throw:disabled { filter: grayscale(1); cursor: not-allowed; opacity: 0.8; }
    
    /* 占位符 (用于平衡布局，如果不需要可以去掉) */
    .chupu_spacer { width: 60px; height: 60px; }

    /* --- 其他组件 --- */
    /* 胜负标签 */
    .chupu_rank_badge { 
        position: absolute; bottom: 10px; right: 10px; 
        background: rgba(0,0,0,0.7); color: #fff; 
        padding: 4px 12px; border-radius: 4px; font-weight: bold; 
        border: 1px solid #aaa; font-size: 20px; z-index: 5; 
    }
    .chupu_rank_badge.win { color: #ffd700; border-color: #ffd700; box-shadow: 0 0 10px #ffd700; }

    /* 【修复点 1】技能悬浮窗样式：去掉 + 号，改为后代选择器 */
    .chupu_skill_btn { background: #5d4037; border: 1px solid #8d6e63; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 16px; display: flex; align-items: center; gap: 5px; cursor: help; margin-right: 10px; position: relative; }
    .chupu_skill_dropdown { visibility: hidden; opacity: 0; position: absolute; top: 100%; right: 0; width: 280px; background: rgba(40,30,20,0.98); border: 2px solid #d84315; border-radius: 6px; padding: 10px; z-index: 200; transform: translateY(10px); transition: all 0.2s; pointer-events: none; text-align: left; font-size: 14px; }
    /* 这里修复了选择器 */
    .chupu_skill_btn:hover .chupu_skill_dropdown { visibility: visible; opacity: 1; transform: translateY(5px); }
    .chupu_skill_title { border-bottom: 1px solid #8d6e63; padding-bottom: 5px; margin-bottom: 5px; color: #d84315; font-weight: bold; text-align: center; }

    /* 【修复点 2】规则弹窗样式 (加回) */
    .chupu_rules_overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100; display: none; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: left; }
    .chupu_rules_overlay.active { display: flex; }
    .chupu_rules_box { background: #fff8e1; color: #3e2723; padding: 25px; border-radius: 8px; border: 4px double #5d4037; max-width: 90%; max-height: 90%; overflow-y: auto; font-size: 18px; line-height: 1.6; position: relative; }
        
    /* --- 资金悬浮窗容器 --- */
    .money-tooltip-wrap {
        position: relative;
        cursor: help;
        display: inline-block;
    }

    /* --- 悬浮窗本体 (基础样式) --- */
    /* --- 悬浮窗本体 (基础样式) --- */
    .money-history-dropdown {
        visibility: hidden;
        opacity: 0;
        position: absolute;
        top: 100%;
        /* 【修改】宽度从 240px 改为 340px，防止大字体换行 */
        width: 340px; 
        background: rgba(30, 20, 10, 0.98);
        border: 1px solid #d84315;
        border-radius: 6px;
        padding: 10px;
        z-index: 300;
        transition: all 0.2s;
        pointer-events: none;
        text-align: left;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8);
    }

    /* 【新增】左侧定位 (用于对手)：左对齐，往右展开 */
    .money-history-dropdown.pos-left {
        left: 0;
        transform: translateY(15px);
    }

    /* 【新增】右侧定位 (用于玩家)：右对齐，往左展开 */
    .money-history-dropdown.pos-right {
        right: 0;
        left: auto; /* 覆盖默认 */
        transform: translateY(18px);
    }

    /* 鼠标移入显示 + 上浮动画 */
    .money-tooltip-wrap:hover .money-history-dropdown {
        visibility: visible;
        opacity: 1;
    }
    .money-tooltip-wrap:hover .money-history-dropdown.pos-left {
        transform: translateY(5px);
    }
    .money-tooltip-wrap:hover .money-history-dropdown.pos-right {
        transform: translateY(5px);
    }

    /* 悬浮窗标题 */
    .history-title {
        color: #ffcc80;
        /* 【修改】字体从 14px 改为 24px */
        font-size: 24px; 
        font-weight: bold;
        border-bottom: 1px solid #5d4037;
        padding-bottom: 8px; /* 稍微增加下边距 */
        margin-bottom: 8px;
        text-align: center;
    }
</style>
`;

if (!document.getElementById('game-chupu-styles')) {
    document.head.insertAdjacentHTML('beforeend', chupuStyles);
}

class ChupuGame {
    constructor(opponent, uiParent, lastRoundData = null) {
        this.opponent = opponent; // 包含 .suspicion, .chatCount
        this.ui = uiParent;
        // 【核心修改】如果有旧数据，就用旧的；否则全0
        if (lastRoundData) {
            this.playerDices = lastRoundData.playerDices || [0, 0, 0, 0, 0];
            this.enemyDices = lastRoundData.enemyDices || [0, 0, 0, 0, 0];
            // 标记：处于“保留上一局结果”的状态
            this.keepLastResult = true;
        } else {
            this.playerDices = [0, 0, 0, 0, 0];
            this.enemyDices = [0, 0, 0, 0, 0];
            this.keepLastResult = false;
        }

        // this.playerDices = [0, 0, 0, 0, 0];
        // this.enemyDices = [0, 0, 0, 0, 0];

        this.state = 'idle';
        this.showRules = false;
        this.lastWinAmount = 0;

        this.skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;

        // 【修改】使用新的平滑成长配置
        this.config = this._getConfig(this.skillLevel);

        this.cheatTimer = null;
        this.remainingFlips = 0;

        // 【新增】AI 反制状态记录
        this.aiCounterTarget = null; // 'player' 或 'enemy'
        this.aiCounterIndex = -1;    // 骰子索引

        // 【修改】增加 desc 描述字段 (5黑/5白等)，用于日志显示
        this.RANKS = {
            'LU':   { name: '卢', score: 4, multi: 10, check: (b)=>b===5, desc: "5黑" },
            'XIAO': { name: '枭', score: 3, multi: 8,  check: (b)=>b===0, desc: "5白" },
            'ZHI':  { name: '雉', score: 2, multi: 5,  check: (b)=>b===4, desc: "4黑" },
            'DU':   { name: '犊', score: 1, multi: 3,  check: (b)=>b===1, desc: "4白" },
            'SAI':  { name: '塞', score: 0, multi: 1,  check: (b)=>b===2||b===3, desc: "杂色" }
        };
    }

    // 【修改】核心成长配置 (严格对应 v3.5 修正版数值)
    _getConfig(lv) {
        // 默认 Lv0 基础属性 (0.5s, 10%, 1枚)
        let cfg = { time: 0.5, chance: 0.10, flips: 1 };

        if (lv >= 1) { cfg.time = 0.75; cfg.chance = 0.15; }
        if (lv >= 2) { cfg.chance = 0.20; }
        if (lv >= 3) { cfg.time = 1.0; cfg.chance = 0.25; }
        if (lv >= 4) { cfg.time = 1.4; cfg.chance = 0.30; }
        // Lv5 只有闲聊次数增加，不涉及时间概率
        if (lv >= 6) { cfg.time = 1.6; cfg.chance = 0.35; }
        if (lv >= 7) { cfg.time = 1.8; cfg.chance = 0.40; } // 修正点
        if (lv >= 8) { cfg.time = 2.0; cfg.chance = 0.45; cfg.flips = 2; }
        if (lv >= 9) { cfg.time = 2.5; cfg.chance = 0.50; }
        if (lv >= 10) { cfg.time = 4.0; cfg.chance = 0.80; cfg.flips = 3; }

        return cfg;
    }
// 【修改】获取最大闲聊次数
    _getChatLimit() {
        return (this.skillLevel >= 5) ? 5 : 3;
    }
    // 【修改】生成技能列表 (更新 v3.5 描述文案)
    _generateSkillHtml() {
        const skills = [
            { lv: 1, text: "初窥门径 (解锁资金查看)" },
            { lv: 2, text: "察言观色 (解锁警觉显示)" },
            { lv: 3, text: "手疾眼快 (操作1s, 25%成功)" },
            { lv: 4, text: "渐入佳境 (操作1.4s, 30%成功)" },
            { lv: 5, text: "谈笑风生 (闲聊次数: 5)" },
            { lv: 6, text: "游刃有余 (操作1.6s, 35%成功)" },
            { lv: 7, text: "炉火纯青 (操作1.8s, 40%成功)" },
            { lv: 8, text: "左右互搏 (操作2s, 45%成功, 可翻2枚)" },
            { lv: 9, text: "心如止水 (操作2.5s, 50%成功)" },
            { lv: 10, text: "天人合一 (窗口4s, 80%成功, 可翻3枚)" }
        ];

        let html = '<div class="chupu_skill_title">赌术成长表</div>';
        skills.forEach(s => {
            const isActive = this.skillLevel >= s.lv;
            const color = isActive ? '#a5d6a7' : '#757575';
            const icon = isActive ? '✅' : '🔒';
            const opacity = isActive ? '1' : '0.7';
            const shadow = isActive ? 'text-shadow: 0 0 1px #000;' : '';

            html += `
                <div style="font-size:14px; padding:4px 0; border-bottom:1px dashed rgba(255,255,255,0.1); display:flex; justify-content:space-between; color:${color}; opacity:${opacity}; ${shadow}">
                    <div><span style="font-weight:bold; color:#ffcc80; margin-right:8px;">Lv.${s.lv}</span> ${s.text}</div>
                    <span style="font-size:12px;">${icon}</span>
                </div>
            `;
        });
        return html;
    }
    init() { this.render(); }

    // 【修改】闲聊功能 (增加时间消耗)
    chat() {
        if (this.state !== 'idle' && this.state !== 'waiting_next') return;

        const limit = this._getChatLimit();
        if (this.opponent.chatCount >= limit) {
            if(window.showToast) window.showToast("对方有些不耐烦了，改日再聊吧。");
            return;
        }

        // 增加时间消耗 (0.2小时)
        if (window.TimeSystem && window.TimeSystem.passTime) {
            TimeSystem.passTime(0.2);
        }

        this.opponent.chatCount++;
        const drop = Math.floor(Math.random() * 11) + 15;
        this.opponent.suspicion -= drop;
        if (this.opponent.suspicion < 0) this.opponent.suspicion = 0;

        this.ui.updateOpponentState(this.opponent.level, this.opponent.suspicion, this.opponent.chatCount);
        if(window.showToast) window.showToast(`闲聊片刻(耗时0.2h)，对方戒心降低了 ${drop} 点`);
        this.render();
    }

    prepareNextRound(lastWinAmount) {
        this.state = 'waiting_next';
        this.lastWinAmount = lastWinAmount;
        this.render();
    }

    // 【修改】投掷功能 (增加时间消耗)
    // 【修改】投掷功能
    throwDice() {
        if (this.state !== 'idle' && this.state !== 'waiting_next') return;

        // 【核心修改】一旦开始投掷，就不再保留上一局结果
        this.keepLastResult = false;

        if (this.opponent.suspicion >= 100) {
            this.triggerBlacklist();
            return;
        }

        if (window.TimeSystem && window.TimeSystem.passTime) {
            TimeSystem.passTime(0.5);
        }

        this.state = 'spinning';
        this.render();

        setTimeout(() => {
            this.playerDices = this._rollRandom();
            this.enemyDices = this._rollAI(this.opponent.level);
            if (this.config.time > 0) this.startCheatPhase();
            else this.settle();
        }, 1000);
    }



    _rollRandom() {
        let arr = [];
        for(let i=0; i<5; i++) arr.push(Math.random() > 0.5 ? 1 : 0);
        return arr;
    }

    _rollAI(level) {
        // AI 策略：高等级有概率直接天胡
        if (level >= 6 && Math.random() < 0.2) return [0, 0, 0, 0, 0];
        let dices = this._rollRandom();
        // Lv 3+ 懂得重掷杂色
        if (level >= 3) {
            const rank = this._getRank(dices);
            if (rank.score === 0 && Math.random() < (level * 0.1)) {
                dices = this._rollRandom();
            }
        }
        return dices;
    }

    startCheatPhase() {
        this.state = 'cheating';
        this.remainingFlips = this.config.flips;
        this.render();

        setTimeout(() => {
            const bar = document.getElementById('chupu_timer_bar');
            if(bar) {
                bar.style.transition = `width ${this.config.time}s linear`;
                bar.style.width = '0%';
            }
        }, 50);

        this.cheatTimer = setTimeout(() => {
            if (this.state === 'cheating') { this.settle(); }
        }, this.config.time * 1000);
    }

    // 【修改】翻面产生声响值
    // 【修改】翻面产生声响值 + AI反制逻辑
    // 【修改】翻面产生声响值 + 判定拉黑
    tryFlip(target, index) {
        if (this.state !== 'cheating' || this.remainingFlips <= 0) return;

        // AI 反制检查
        if (this.aiCounterTarget) return;

        const roll = Math.random();
        const arr = (target === 'player') ? this.playerDices : this.enemyDices;

        if (roll < this.config.chance) {
            arr[index] = 1 - arr[index];
            this.remainingFlips--;

            // 计算声响
            const noise = Math.max(0, Math.floor((100 - this.skillLevel * 10 + this.opponent.level * 10) / 2));
            this.opponent.suspicion += noise;

            // 更新状态
            this.ui.updateOpponentState(this.opponent.level, this.opponent.suspicion, this.opponent.chatCount);

            // 【核心修改】检查是否达到 100
            if (this.opponent.suspicion >= 100) {
                this.opponent.suspicion = 100;
                this.render(); // 刷新一下界面显示满条
                this.triggerBlacklist(); // 触发拉黑流程
                return; // 终止后续逻辑
            }

            // ... (原本的 AI 反制逻辑保持不变) ...
            const aiChance = this.opponent.level * 0.08;
            if (Math.random() < aiChance) {
                if(window.showToast) window.showToast(`改命成功(警戒+${noise})，但对方眼神一凛...`, "warning");
                this.render();
                setTimeout(() => { this._triggerAiCounterFlip(target, index); }, 600);
            } else {
                if(window.showToast) window.showToast(`改命成功！(警戒+${noise})`, "success");
                this.render();
            }

        } else {
            this.remainingFlips--;
            if(window.showToast) window.showToast("手抖了！", "error");
            this.render();
        }
    }
    // ================= 【新增】触发拉黑惩罚 =================
    triggerBlacklist() {
        this.state = 'finished'; // 锁定游戏状态

        // 1. 调用工具类加入黑名单
        if (window.UtilsGamble) {
            UtilsGamble.addToBlacklist(this.ui.currentTown.id);
        }

        // 2. 构造惩罚弹窗 (强制退出)
        const msg = "出千被抓！<br>你被赌坊打手扔了出去！<br><span style='font-size:18px; color:#b71c1c; font-weight:bold;'>（已被拉黑，下月前无法进入）</span>";

        // 优先使用通用结算模态框 (如果有)
        if (window.showGambleResultModal) {
            window.showGambleResultModal(false, this.opponent.bet, () => {
                // 第5个参数 true 代表 forceExit (强制回大厅)
                this.ui.finishGame('chupu', false, this.opponent.bet, 0, true);
            }, msg, "🚫 出 千 被 抓 🚫");
        } else {
            // 兜底弹窗
            window.showGeneralModal("被抓现行", `
                <div style="text-align:center; padding:20px;">
                    <div style="font-size:60px;">😡</div>
                    <div style="font-size:24px; font-weight:bold; color:#b71c1c; margin:10px 0;">出千被抓！</div>
                    <div style="font-size:18px; color:#5d4037; margin-bottom:20px;">${msg}</div>
                    <div>
                        <button class="ink_btn" onclick="GambleShop.finishGame('chupu', false, ${this.opponent.bet}, 0, true)">
                            自认倒霉
                        </button>
                    </div>
                </div>
            `);
        }
    }

    // 【新增】AI 反制动画与逻辑
    _triggerAiCounterFlip(target, index) {
        // 1. 标记正在被 AI 操作的骰子
        this.aiCounterTarget = target;
        this.aiCounterIndex = index;

        if(window.showToast) window.showToast("对手眼疾手快，将棋子拨回了原样！", 2000);

        // 2. 渲染界面 (此时骰子会开始旋转并变红，见 render 修改)
        this.render();

        // 3. 动画结束后数值回滚
        setTimeout(() => {
            const arr = (target === 'player') ? this.playerDices : this.enemyDices;
            arr[index] = 1 - arr[index]; // 翻回来 (0->1 或 1->0)

            // 清除标记
            this.aiCounterTarget = null;
            this.aiCounterIndex = -1;

            this.render(); // 渲染最终结果
        }, 500); // 动画持续 0.5 秒
    }

    settle() {
        this.state = 'finished';
        if (this.cheatTimer) clearTimeout(this.cheatTimer);

        const pInfo = this._getRank(this.playerDices);
        const eInfo = this._getRank(this.enemyDices);

        let isWin = false;
        let isDraw = false;

        if (pInfo.score > eInfo.score) isWin = true;
        else if (pInfo.score < eInfo.score) isWin = false;
        else {
            if (pInfo.score > 0) isDraw = true;
            else {
                if (pInfo.blackCount > eInfo.blackCount) isWin = true;
                else if (pInfo.blackCount < eInfo.blackCount) isWin = false;
                else isDraw = true;
            }
        }

        // ================= 【核心修改】保存详细信息供日志使用 =================
        // 必须保存 lastMultiplier，否则大厅的日志不知道是几倍
        if (isDraw) {
            this.lastRankName = "平局";
            this.lastMultiplier = 1;
        } else if (isWin) {
            // 保存格式：卢(5黑)
            this.lastRankName = `${pInfo.name}(${pInfo.desc})`;
            this.lastMultiplier = pInfo.multi;
        } else {
            this.lastRankName = `${eInfo.name}(${eInfo.desc})`;
            this.lastMultiplier = eInfo.multi;
        }
        // ===================================================================

        this.render();

        setTimeout(() => {
            const bet = this.opponent.bet;
            let finalPayout = 0;
            let realProfit = 0;

            if (isDraw) {
                finalPayout = bet;
                if(window.showToast) window.showToast("势均力敌，退还本金");
            }
            else if (isWin) {
                const multiplier = pInfo.multi;
                const theoryWin = bet * multiplier;
                const maxWin = this.opponent.maxMoney;
                realProfit = Math.min(theoryWin, maxWin);
                finalPayout = bet + realProfit;

                if (window.UtilsLifeSkills) {
                    let exp = Math.floor(realProfit / 100);
                    if(exp < 1) exp = 1;
                    UtilsLifeSkills.addExp('gambling', exp);
                }
            }
            else {
                const multiplier = eInfo.multi;
                const theoryLoss = bet * multiplier;
                const extraLossNeeded = theoryLoss - bet;
                const playerMoney = window.player.money;
                const actualExtraLoss = Math.min(extraLossNeeded, playerMoney);

                finalPayout = -actualExtraLoss;
                realProfit = -(bet + actualExtraLoss);
                if (window.UtilsLifeSkills) UtilsLifeSkills.addExp('gambling', 1);
            }
// ================= 【核心修改】立即刷新对手金额 =================
            // 逻辑：对手的钱 = 原有的钱 - 玩家赚的钱 (如果是负数则是玩家亏的，减负数等于加钱)
            // 注意：realProfit 是玩家视角的净利润。
            // 玩家赢 100 (realProfit=100) -> 对手减少 100
            // 玩家输 100 (realProfit=-100) -> 对手增加 100
            if (!isDraw) {
                this.opponent.maxMoney -= realProfit;
                // 防止显示负数 (虽然理论上逻辑保证了 maxWin，但防一手)
                if (this.opponent.maxMoney < 0) this.opponent.maxMoney = 0;

                // 立即重新渲染背景，让玩家透过弹窗缝隙或关闭弹窗瞬间看到最新金额
                this.render();
            }
            // ==========================================================
            if (this.ui && this.ui.showGameResult) {
                // 这里传入的 finalPayout 就是要给玩家加/减的钱
                // 如果是输了，finalPayout 是负数（例如 -400）
                this.ui.showGameResult('chupu', isWin && !isDraw, bet, finalPayout, realProfit);
            } else {
                this.ui.finishGame('chupu', isWin && !isDraw, bet, finalPayout);
            }

        }, 1500);
    }

    _getRank(dices) {
        const blackCount = dices.reduce((a,b)=>a+(b===0?1:0), 0);
        for (let key in this.RANKS) {
            if (this.RANKS[key].check(blackCount)) {
                return { ...this.RANKS[key], blackCount };
            }
        }
        return { name:'?', score:-1 };
    }

    toggleRules() {
        this.showRules = !this.showRules;
        this.render();
    }


    // 【修改】渲染 - 警戒值 UI (Lv.2 解锁)
    _getSuspicionUI() {
        // Lv 2 以下完全隐藏察觉度
        if (this.skillLevel < 2) {
            return `<div style="font-size:14px; color:#777; margin-left:10px;">(状态未知)</div>`;
        }

        const s = this.opponent.suspicion || 0;
        let barClass = "chupu_sus_low";
        if (s > 80) barClass = "chupu_sus_high";
        else if (s > 50) barClass = "chupu_sus_med";

        return `
            <div style="display:flex; align-items:center;">
                <div class="chupu_suspicion_wrap">
                    <div class="chupu_suspicion_fill ${barClass}" style="width:${s}%"></div>
                </div>
                <div class="chupu_suspicion_text">${s}/100</div>
            </div>
            <div style="font-size:12px; color:#aaa; margin-left:5px;">(警戒)</div>
        `;
    }

    // 主渲染方法
    // ================= 【修改】主渲染方法 (增加次数显示) =================
    render() {
        const pRank = this._getRank(this.playerDices);
        const eRank = this._getRank(this.enemyDices);
        // 【核心修改】在这里加上 || this.state === 'waiting_next'
        // 【核心修改】增加判断：如果是 idle 状态且 keepLastResult 为 true，也要显示结果标签
        const showRank = this.state === 'finished' ||
            this.state === 'cheating' ||
            this.state === 'waiting_next' ||
            (this.state === 'idle' && this.keepLastResult);

        const genDiceHtml = (arr, target) => {
            return arr.map((val, i) => {
                const color = val === 0 ? 'chupu_dice_black' : 'chupu_dice_white';

                // 判断是否正在被 AI 反制 (视觉特效)
                const isAiCountering = (this.aiCounterTarget === target && this.aiCounterIndex === i);
                const spin = (this.state === 'spinning' || isAiCountering) ? 'chupu_dice_spinning' : '';
                const extraStyle = isAiCountering ? 'border-color:#b71c1c; box-shadow:0 0 15px #b71c1c; transform:scale(1.1);' : '';

                const click = (this.state === 'cheating') ? `onclick="GambleShop.currentGame.tryFlip('${target}', ${i})"` : '';
                return `<div class="chupu_dice ${color} ${spin}" style="${extraStyle}" ${click}></div>`;
            }).join('');
        };

        // 状态文本逻辑：显示剩余翻动次数
        let statusHtml = "";
        const maxFlips = this.config.flips; // 当前等级的最大次数

        if (this.state === 'idle') {
            statusHtml = `请投箸 <div style="font-size:16px; color:#aaa; margin-top:4px; font-weight:normal;">(本局可翻: ${maxFlips})</div>`;
        } else if (this.state === 'spinning') {
            statusHtml = "博弈中...";
        } else if (this.state === 'cheating') {
            const count = this.remainingFlips;
            const countColor = count > 0 ? '#66bb6a' : '#ef5350';
            statusHtml = `妙手时刻！<div style="font-size:18px; color:${countColor}; margin-top:4px;">剩余次数: ${count} / ${maxFlips}</div>`;
        } else if (this.state === 'finished') {
            statusHtml = "结算中";
        } else if (this.state === 'waiting_next') {
            statusHtml = `赢取 ${this.lastWinAmount} 文<div style="font-size:16px; color:#aaa; margin-top:4px; font-weight:normal;">(下局可翻: ${maxFlips})</div>`;
        }

        // 资金显示
        const pMoney = window.player.money.toLocaleString();
        const showEM = this.skillLevel >= 1;
        const eMoney = showEM ? this.opponent.maxMoney.toLocaleString() : "???";

        // 闲聊按钮状态
        const maxChat = this._getChatLimit();
        const currentChat = this.opponent.chatCount || 0;
        const chatCount = Math.max(0, maxChat - currentChat);
        const chatDisabled = (this.state !== 'idle' && this.state !== 'waiting_next') || chatCount <= 0;
        const chatStyle = chatDisabled ? 'disabled' : '';

        // 【新增】生成资金历史 HTML
        // 注意：这里依赖 GambleShop 中的 helper 方法，请确保上一轮的 gamble_shop.js 修改已生效
        const pHistoryHtml = GambleShop._generateMoneyHistoryHtml ? GambleShop._generateMoneyHistoryHtml('player') : '';
        const eHistoryHtml = GambleShop._generateMoneyHistoryHtml ? GambleShop._generateMoneyHistoryHtml('opponent') : '';

        const html = `
            <div class="gamble-layout" style="background:#1a1210; color:#fff; overflow:hidden;">
                <div class="chupu_board ${this.state === 'cheating' ? 'chupu_cheat_active' : ''}">
                    
                    <div class="chupu_header">
                        <div class="chupu_header_left">
                            <div class="chupu_header_row">
                                <span class="chupu_text_label">对手</span>
                                <span class="chupu_text_name">${this.opponent.name}</span>
                                ${this._getSuspicionUI()}
                            </div>
                            <div class="chupu_header_row">
                                <span class="chupu_text_money_label">持有:</span>
                                
                                <div class="money-tooltip-wrap">
                                    <span class="chupu_text_money_val" style="color:${showEM?'#ffb74d':'#777'}">${eMoney}</span>
                                    <div class="money-history-dropdown pos-left">
                                        <div class="history-title">最近资金变动</div>
                                        ${eHistoryHtml}
                                    </div>
                                </div>

                            </div>
                        </div>
                        
                        <div class="chupu_header_right">
                            <div class="chupu_header_row">
                                <div class="chupu_skill_btn">
                                    Lv.${this.skillLevel}
                                    <div class="chupu_skill_dropdown">${this._generateSkillHtml()}</div>
                                </div>
                                <span class="chupu_text_name">你</span>
                            </div>
                            <div class="chupu_header_row">
                                <span class="chupu_text_money_label">持有:</span>
                                
                                <div class="money-tooltip-wrap">
                                    <span class="chupu_text_money_val">${pMoney}</span>
                                    <div class="money-history-dropdown pos-right">
                                        <div class="history-title">最近资金变动</div>
                                        ${pHistoryHtml}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="chupu_bet_area">
                        <div class="chupu_bet_title">本局押注</div>
                        <div style="display:flex; align-items:center;">
                            <div class="chupu_bet_val">${this.opponent.bet}</div>
                            <button class="chupu_btn_rules_small" onclick="GambleShop.currentGame.toggleRules()">规则</button>
                        </div>
                    </div>

                    <div class="chupu_battle_field">
                        <div class="chupu_bowl chupu_bowl_enemy">
                            <div class="chupu_watermark">对手</div>
                            ${genDiceHtml(this.enemyDices, 'enemy')}
                            ${showRank ? `<div class="chupu_rank_badge">${eRank.name}</div>` : ''}
                        </div>
                        <div class="chupu_bowl chupu_bowl_player">
                            <div class="chupu_watermark">我方</div>
                            ${genDiceHtml(this.playerDices, 'player')}
                            ${showRank ? `<div class="chupu_rank_badge win">${pRank.name}</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="chupu_status_area">
                        <div class="chupu_status_text">${statusHtml}</div>
                        <div class="chupu_timer_wrap" style="display:${this.state==='cheating'?'block':'none'}">
                            <div class="chupu_timer_fill" id="chupu_timer_bar"></div>
                        </div>
                    </div>

                    <div class="chupu_rates_panel">
                        <div class="chupu_rate_row"><span>卢 (5黑)</span><span>x10</span></div>
                        <div class="chupu_rate_row"><span>枭 (5白)</span><span>x8</span></div>
                        <div class="chupu_rate_row"><span>雉 (4黑)</span><span>x5</span></div>
                        <div class="chupu_rate_row"><span>犊 (4白)</span><span>x3</span></div>
                        <div class="chupu_rate_row" style="color:#777"><span>塞 (杂色)</span><span>x1</span></div>
                    </div>

                    <div class="chupu_controls">
                        <div class="chupu_btn_chat ${chatStyle}" onclick="GambleShop.currentGame.chat()" title="降低警戒值 (剩余${chatCount}次)">
                            <div>💬</div>
                            <div style="font-size:12px;">闲聊 (${chatCount})</div>
                        </div>

                        <button class="chupu_btn_throw"     
                            ${(this.state !== 'idle' && this.state !== 'waiting_next') ? 'disabled' : ''} 
                            onclick="GambleShop.currentGame.throwDice()">
                            🎲 呼卢喝雉
                        </button>
                        
                        <div class="chupu_spacer"></div>
                    </div>
                </div>
                <button class="btn-resign" onclick="GambleShop.selectGame('chupu')" style="margin-top:5px; padding:5px;">⬅ 退出</button>
            </div>
        `;
        this.ui._updateContent(html);
    }
}
window.ChupuGame = ChupuGame;