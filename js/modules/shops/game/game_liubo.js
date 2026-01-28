// js/modules/games/game_liubo.js
// 六博棋 - v5.1

console.log("加载 六博棋模块 v5.1 Refactored");

// ================= 六博专用样式 (保持不变) =================
const liuboStyles = `
<style id="game-liubo-styles">
    /* --- 整体布局 (Flex自适应) --- */
    .liubo-board {
        flex: 1; background: #3e2723; border: 6px double #8d6e63; border-radius: 12px;
        padding: 15px; display: flex; flex-direction: column; color: #fff8e1; position: relative;
        font-family: "KaiTi", serif; font-size: 20px; overflow: hidden; height: 100%; box-sizing: border-box;
    }
    
    /* --- 头部布局优化 (三栏布局实现绝对居中) --- */
    .liubo-header { 
        display: flex; justify-content: space-between; align-items: center; 
        border-bottom: 2px dashed #8d6e63; padding-bottom: 10px; margin-bottom: 10px; 
        flex-shrink: 0; position: relative;
    }
    .header-side { flex: 1; display: flex; align-items: center; }
    .header-left { justify-content: flex-start; }
    .header-right { justify-content: flex-end; gap: 15px; } 
    .header-center { 
        position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); 
        text-align: center; white-space: nowrap;
    }
    
    /* 状态与警觉值显示 */
    .enemy-status { font-size: 16px; color: #ffcc80; margin-left: 8px; border: 1px solid #8d6e63; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,0.3); vertical-align: middle; }
    
    /* --- 赌术悬浮窗样式 --- */
    .skill-info-wrap { position: relative; display: inline-block; cursor: help; }
    .skill-tag-btn { 
        background: #5d4037; border: 1px solid #8d6e63; color: #fff; 
        padding: 4px 12px; border-radius: 4px; font-size: 16px; font-weight: bold;
        display: flex; align-items: center; gap: 5px; transition: 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .skill-tag-btn:hover { background: #6d4c41; border-color: #d84315; transform: translateY(-1px); }
    
    .skill-dropdown {
        visibility: hidden; opacity: 0; position: absolute; top: 100%; right: 0; 
        width: 300px; background: rgba(40, 30, 20, 0.98); border: 2px solid #d84315;
        border-radius: 6px; padding: 12px; z-index: 200;
        transform: translateY(10px); transition: all 0.2s;
        box-shadow: 0 8px 20px rgba(0,0,0,0.6); pointer-events: none;
        text-align: left;
    }
    .skill-info-wrap:hover .skill-dropdown { visibility: visible; opacity: 1; transform: translateY(5px); pointer-events: auto; }
    
    .skill-list-title { border-bottom: 1px solid #8d6e63; padding-bottom: 5px; margin-bottom: 5px; color: #d84315; font-weight: bold; text-align: center; }
    .skill-list-item { font-size: 14px; padding: 4px 0; border-bottom: 1px dashed rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; }
    .skill-list-item.active { color: #a5d6a7; text-shadow: 0 0 1px #000; } 
    .skill-list-item.inactive { color: #757575; opacity: 0.7; }
    .skill-lv { font-weight: bold; margin-right: 8px; min-width: 40px; color: #ffcc80; }
    .skill-icon { font-size: 12px; }

    /* 中间区域：自适应高度 */
    .liubo-area { 
        flex: 1; display: flex; flex-direction: column; gap: 8px; 
        min-height: 0; justify-content: space-between; 
    }
    
    /* 棋子/状态条 */
    .unit-bar { display: flex; align-items: center; gap: 10px; padding: 5px 10px; background: rgba(0,0,0,0.2); border-radius: 8px; flex-shrink: 0; }
    .unit-icon { font-size: 28px; width: 40px; text-align: center; }
    .hp-track { flex: 1; height: 16px; background: #5d4037; border-radius: 8px; overflow: hidden; border: 1px solid #8d6e63; }
    .hp-fill { height: 100%; transition: width 0.3s; }
    .hp-fill.enemy { background: #e57373; }
    .hp-fill.player { background: #81c784; }
    
    /* 中央显示区：日志 + 筹码 */
    .center-display {
        flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;
        overflow: hidden; gap: 5px; min-height: 0;
    }

    /* 历史记录：高度自适应 */
    .game-log { 
        width: 100%; flex: 1; overflow-y: auto; background: rgba(0,0,0,0.4); 
        padding: 8px; font-size: 16px; color: #d7ccc8; border-radius: 6px; 
        font-family: monospace; line-height: 1.4; border: 1px solid #5d4037;
        box-sizing: border-box; 
    }
    .log-new { color: #fff; text-shadow: 0 0 3px #ffb74d; }

    /* 投箸区 */
    .stick-area { 
        display: flex; gap: 12px; justify-content: center; align-items: center; 
        height: 50px; flex-shrink: 0; 
    }
    .stick { width: 12px; height: 50px; border-radius: 4px; border: 2px solid #1a1a1a; transition: transform 0.2s, background 0.1s; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); }
    .stick.black { background: #212121; }
    .stick.white { background: #f5f5f5; }
    .stick.animating { animation: shake 0.1s infinite; }
    @keyframes shake { 0% { transform: translateY(0); } 50% { transform: translateY(-2px); } 100% { transform: translateY(2px); } }

    /* 底部操作容器 */
    .bottom-controls {
        flex-shrink: 0; margin-top: 8px; padding-top: 8px; 
        border-top: 1px dashed rgba(141, 110, 99, 0.3);
    }

    /* --- 按钮与 QTE --- */
    .action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
    .game-btn { 
        padding: 10px 5px; border: none; border-radius: 8px; cursor: pointer; font-family: "KaiTi"; 
        font-size: 20px; font-weight: bold; box-shadow: 0 4px 0 rgba(0,0,0,0.3); transition: 0.1s;
        text-shadow: 1px 1px 0 rgba(0,0,0,0.3); width: 100%; position: relative;
    }
    .game-btn:active { transform: translateY(3px); box-shadow: none; }
    
    .btn-atk { background: #d32f2f; color: #fff; border: 1px solid #b71c1c; }
    .btn-def { background: #1976d2; color: #fff; border: 1px solid #0d47a1; }
    .btn-move { background: #fbc02d; color: #3e2723; border: 1px solid #f9a825; }
    .btn-skill { background: #7b1fa2; color: #fff; border: 1px solid #4a148c; }
    .btn-chat { background: #81c784; color: #1b5e20; border: 1px solid #388e3c; }
    .btn-disabled { background: #757575; color: #bdbdbd; cursor: not-allowed; box-shadow: none; border: 1px solid #616161; }

    /* QTE 悬浮条 */
    .qte-container {
        position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
        width: 180px; height: 16px; background: #424242; border: 2px solid #fff;
        border-radius: 8px; overflow: hidden; display: none; z-index: 100;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
    }
    .btn-skill:hover .qte-container, .btn-skill.active .qte-container { display: block; }
    
    .qte-bar { width: 100%; height: 100%; position: relative; }
    .qte-zone-gray { position: absolute; height: 100%; width: 100%; background: #757575; }
    .qte-zone-orange { position: absolute; height: 100%; background: #ff9800; }
    .qte-zone-green { position: absolute; height: 100%; background: #4caf50; }
    .qte-cursor { position: absolute; top: -2px; width: 2px; height: 20px; background: #f44336; border: 1px solid #fff; z-index: 10; }

    /* 提示语 */
    .decision-hint {
        text-align: center; font-size: 18px; color: #ffcc80; margin-bottom: 8px; 
        font-weight: bold; letter-spacing: 1px; line-height: 1.2;
    }

    /* 认输按钮 */
    .btn-resign {
        display: block; margin: 8px auto 0; 
        background: #efebe9; color: #3e2723; 
        border: 2px solid #8d6e63; padding: 6px 25px; 
        font-size: 16px; font-weight: bold; cursor: pointer; 
        border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        font-family: "KaiTi";
    }
    .btn-resign:hover { background: #fff; color: #bf360c; border-color: #bf360c; }

    /* 规则相关 */
    .btn-rules { background: transparent; border: 1px solid #a1887f; color: #a1887f; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 16px; }
    .btn-rules:hover { background: #4e342e; color: #d7ccc8; }
    .rules-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 100; display: none; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: left; }
    .rules-overlay.active { display: flex; }
    .rules-box { background: #fff8e1; color: #3e2723; padding: 25px; border-radius: 8px; border: 4px double #5d4037; max-width: 90%; max-height: 90%; overflow-y: auto; font-size: 18px; line-height: 1.6; }

    /* 警觉条样式 */
    .liubo_suspicion_wrap {
        width: 100px; height: 8px; 
        background: #3e2723; border: 1px solid #5d4037;
        margin-left: 10px; border-radius: 4px; 
        overflow: hidden; position: relative;
        display: inline-block; vertical-align: middle;
    }
    .liubo_suspicion_fill { height: 100%; transition: width 0.3s; }
    .liubo_sus_low { background: #66bb6a; }
    .liubo_sus_med { background: #ffa726; }
    .liubo_sus_high { background: #ef5350; }
    .liubo_suspicion_text { font-size: 14px; color: #ccc; margin-left: 5px; vertical-align: middle; }
</style>
`;

if (!document.getElementById('game-liubo-styles')) {
    document.head.insertAdjacentHTML('beforeend', liuboStyles);
}

// ================= 六博游戏类 =================
class LiuboGame {
    constructor(opponent, uiParent) {
        this.opponent = opponent;
        this.ui = uiParent; // GambleShop 实例
        this.logs = [];

        // 实例ID与定时器管理 (用于 QTE)
        this.instanceId = "game_" + Date.now() + "_" + Math.random();
        this.qteTimer = null;

        // 游戏基础状态
        this.turn = 1;
        this.playerHP = 100;
        this.enemyHP = 100;
        this.playerPos = 0;
        this.enemyPos = 0;
        this.isPlayerTurn = true;
        this.gameOver = false;
        this.showRules = false;

        // 投箸逻辑
        this.lastRoll = null;
        this.rollResult = 0;
        this.isAnimating = false;

        // 技能等级
        this.skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;

        // 【核心修改】从 opponent 对象恢复警觉状态
        this.alertness = this.opponent.suspicion || 0;

        // 计算剩余闲聊次数
        const maxChat = this._getChatLimit();
        const usedChat = this.opponent.chatCount || 0;
        this.chatCount = Math.max(0, maxChat - usedChat);

        // QTE 状态
        this.qteRunning = false;
        this.qtePos = 0;
        this.qteDir = 1;
        this.qteSpeed = this._getQTESpeed();

        // QTE 区域配置
        if (this.skillLevel >= 10) { this.greenPct = 30; this.orangePct = 40; }
        else if (this.skillLevel >= 7) { this.greenPct = 10; this.orangePct = 40; }
        else if (this.skillLevel >= 4) { this.greenPct = 10; this.orangePct = 30; }
        else { this.greenPct = 10; this.orangePct = 20; }

        this.qteZones = this._generateQTEZones();
        this.hasCheated = false;
    }

    // 【新增】同步状态到持久化对象
    _syncOpponentState() {
        this.opponent.suspicion = this.alertness;
        // 计算已聊次数 = 上限 - 剩余
        const maxChat = this._getChatLimit();
        this.opponent.chatCount = maxChat - this.chatCount;

        if (window.saveGame) window.saveGame();
    }

    _getChatLimit() {
        if (this.skillLevel >= 8) return 7;
        if (this.skillLevel >= 5) return 5;
        return 3;
    }

    _getQTESpeed() {
        let duration = 250;
        if (this.skillLevel >= 9) duration = 1000;
        else if (this.skillLevel >= 6) duration = 750;
        else if (this.skillLevel >= 3) duration = 500;
        return 100 / (duration / 16.6);
    }

    _generateQTEZones() {
        const orangeW = this.orangePct;
        const greenW = this.greenPct;
        const orangeStart = Math.floor(Math.random() * (100 - orangeW));
        const orangeEnd = orangeStart + orangeW;
        const greenStart = orangeStart + Math.floor((orangeW - greenW) / 2);
        const greenEnd = greenStart + greenW;
        return { orangeStart, orangeEnd, greenStart, greenEnd };
    }

    init() {
        this.addLog(`与【${this.opponent.name}】(Lv.${this.opponent.level}) 的对局开始了。`);
        this.addLog(`当前赌注：${this.opponent.bet}文 (已扣除)`);

        if (this.skillLevel >= 5) {
            this.playerPos = 2;
            this.addLog("【赌术】你观察入微，抢占了先机 (位置+2)。");
        }

        this.render();
        this._startQTELoop();
    }

    _startQTELoop() {
        if (this.qteTimer) clearInterval(this.qteTimer);
        this.qteTimer = setInterval(() => {
            const cursor = document.getElementById('qte_cursor_el');
            // 校验 ID 防止控制旧的弹窗
            if (!cursor || cursor.dataset.inst !== this.instanceId) {
                clearInterval(this.qteTimer);
                this.qteTimer = null;
                return;
            }
            if (this.gameOver) return;

            if (this.isPlayerTurn && this.lastRoll === null && !this.isAnimating) {
                this.qtePos += (this.qteSpeed * this.qteDir);
                if (this.qtePos >= 100) {
                    this.qtePos = 100;
                    this.qteDir = -1;
                    this.qteZones = this._generateQTEZones();
                    this._updateQTEZonesDOM();
                }
                if (this.qtePos <= 0) {
                    this.qtePos = 0;
                    this.qteDir = 1;
                }
                cursor.style.left = `${this.qtePos}%`;
            }
        }, 16);
    }

    _updateQTEZonesDOM() {
        const orangeEl = document.getElementById('qte_zone_orange');
        const greenEl = document.getElementById('qte_zone_green');
        if (orangeEl && greenEl) {
            const z = this.qteZones;
            orangeEl.style.left = `${z.orangeStart}%`;
            greenEl.style.left = `${z.greenStart}%`;
        }
    }

    _passTime() {
        if (window.TimeSystem && window.TimeSystem.passTime) {
            window.TimeSystem.passTime(0.5);
        }
    }

    _getEnemyStatusText() {
        if (this.alertness < 30) {
            const diff = this.enemyHP - this.playerHP;
            if (diff > 40) return "欣喜若狂";
            if (diff > 10) return "欢呼雀跃";
            if (diff >= -10) return "面色平静";
            if (diff > -40) return "脸色难看";
            return "面如死灰";
        } else if (this.alertness < 60) return "眼神狐疑";
        else if (this.alertness < 90) return "目光锐利";
        else return "即将暴走";
    }

    // ================= 玩家动作 =================

    playerCheat() {
        this._passTime();
        const pos = this.qtePos;
        const z = this.qteZones;
        let roll = 0;
        let logMsg = "";
        let alertAdd = 0;

        if (pos >= z.greenStart && pos <= z.greenEnd) {
            const minBonus = Math.floor(this.skillLevel / 3) || 1;
            const maxBonus = Math.floor(this.skillLevel / 2) || 1;
            const bonus = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
            let baseRoll = this.calculateRoll();
            roll = Math.min(6, baseRoll + bonus);
            logMsg = `【完美出千】手法如神！点数+${bonus}，对方毫无察觉。`;
            alertAdd = 0;
        } else if (pos >= z.orangeStart && pos <= z.orangeEnd) {
            let baseRoll = this.calculateRoll();
            roll = Math.min(6, baseRoll + 1);
            logMsg = `【出千】袖里藏刀，点数+1。`;
            const reduction = Math.floor(this.skillLevel / 2);
            let val = (this.opponent.level - reduction) * 10;
            alertAdd = Math.max(0, val);
        } else {
            roll = this.calculateRoll();
            logMsg = `【出千失误】手法拙劣，险些穿帮！`;
            let val = 180 - (this.skillLevel * 20);
            alertAdd = Math.max(20, val);
        }

        this.addLog(logMsg);
        this._addAlertness(alertAdd);

        if (!this.gameOver) {
            this.lastRoll = roll;
            this.rollResult = roll;
            this.isAnimating = true;
            this.render(true);

            setTimeout(() => {
                this.isAnimating = false;
                let rollName = roll === 0 ? "枭 (0)" : (roll === 6 ? "卢 (6)" : `散 (${roll})`);
                this.addLog(`最终掷出：<b style="color:purple">${rollName}</b>`);
                this.qteZones = this._generateQTEZones();
                this.render(true);
            }, 600);
        }
    }

    playerChat() {
        if (this.chatCount <= 0) return;
        this._passTime();

        this.chatCount--;

        const chance = this.skillLevel * 0.1;
        if (Math.random() < chance) {
            const p = window.player;
            const jing = (p.attributes && p.attributes.jing) || 10;
            const shen = (p.attributes && p.attributes.shen) || 10;
            const reduce = Math.floor((jing + shen) / 2);
            this.alertness = Math.max(0, this.alertness - reduce);
            this.addLog(`【闲聊】你谈笑风生，对方放松了警惕 (警觉-${reduce})。`);
        } else {
            this.addLog(`【闲聊】对方对你的话题不感兴趣。`);
        }

        // 【修改点】同步状态到对手引用，并调用 UtilsGamble.updateMoney 同步城镇账本（Type 1，金额为0，仅用于状态存盘）
        this._syncOpponentState();
        if (window.UtilsGamble) {
            UtilsGamble.updateMoney(this.ui.currentTown.id, 'liubo', this.opponent.id, 0, 0, 1);
        }
        this.render(true);
    }

    _addAlertness(val) {
        if (val <= 0) return;
        this.alertness += val;

        // 【关键】同步回对象
        this._syncOpponentState();

        if (this.alertness >= 100) {
            this.alertness = 100;
            this.triggerBlacklist();
        }
    }

    // 【核心修改】触发拉黑 (对接新架构)
    triggerBlacklist() {
        this.gameOver = true;
        this.addLog(`<b style="color:red">【被发现了！】对方识破了你的千术！</b>`);

        // 【修改点】改为调用新的 addTownBlacklist
        if (window.UtilsGamble) {
            UtilsGamble.addTownBlacklist(this.ui.currentTown.id);
        }

        const msg = "出千被抓！<br>你被赌坊打手扔了出去！<br><span style='font-size:18px; color:#b71c1c; font-weight:bold;'>（已被拉黑，下月前无法进入）</span>";

        // 延迟调用结算界面
        setTimeout(() => {
            this.ui.renderResultView({
                isWin: false,
                title: "🚫 出 千 被 抓 🚫",
                msg: msg,
                moneyChange: 0,
                opponent: this.opponent,
                onExit: () => {
                    if (window.GambleShop) GambleShop.renderMainMenu();
                    if (window.updateUI) window.updateUI();
                },
                onRetry: null // 无法重试
            });
        }, 1000);
    }

    calculateRoll() {
        let blackCount = 0;
        for (let i = 0; i < 6; i++) { if (Math.random() > 0.5) blackCount++; }
        return blackCount;
    }

    playerRoll() {
        if (!this.isPlayerTurn || this.gameOver || this.isAnimating) return;
        this._passTime();
        this.isAnimating = true;
        this.render(true);

        setTimeout(() => {
            this.isAnimating = false;
            const roll = this.calculateRoll();
            this.lastRoll = roll;
            this.rollResult = roll;
            let rollName = roll === 0 ? "枭 (0)" : (roll === 6 ? "卢 (6)" : `散 (${roll})`);
            this.addLog(`你掷出了：<b style="color:#ffa726">${rollName}</b>`);
            this.render(true);
        }, 800);
    }

    // 玩家决策 (进军/杀枭/固守)
    playerAction(actionType) {
        const roll = this.rollResult;
        let msg = "";
        this._passTime();

        if (actionType === 'move') {
            let baseGain = roll === 0 ? 6 : (roll === 6 ? 6 : roll);
            let bonusGain = 0;
            const maxBonus = Math.floor(this.skillLevel * 0.5);
            if (maxBonus > 0 && Math.random() < 0.5) {
                bonusGain = Math.floor(Math.random() * (maxBonus + 1));
            }
            let totalGain = baseGain + bonusGain;
            this.playerPos = Math.min(12, this.playerPos + totalGain);

            msg = `你指挥散棋推进，优势+${baseGain}`;
            if (bonusGain > 0) msg += ` (赌术加成+${bonusGain})`;
            msg += `，当前优势 ${this.playerPos}。`;

        } else if (actionType === 'atk') {
            if (this.playerPos <= 0 && roll !== 6 && roll !== 0) {
                if(window.showToast) window.showToast("位置劣势，难以进攻！");
                return;
            }
            let baseDmg = roll === 0 ? 25 : (roll === 6 ? 30 : roll * 3);
            let damage = baseDmg + (this.playerPos * 2);
            if (Math.random() < (this.skillLevel * 0.02)) {
                damage = Math.floor(damage * 1.5);
                msg += "【神之一手】";
            }
            this.enemyHP -= damage;
            this.playerPos = Math.max(0, this.playerPos - 3);
            msg += `你抓住破绽，直取敌方枭棋！造成 ${damage} 点伤害。`;

        } else if (actionType === 'def') {
            let heal = roll === 0 ? 15 : (roll === 6 ? 20 : roll * 2);
            this.playerHP = Math.min(100, this.playerHP + heal);
            msg = `你回撤散棋，巩固防线，局势稍缓 (回血 ${heal})。`;
        }

        this.addLog(msg);
        this.checkWin();

        if (!this.gameOver) {
            this.isPlayerTurn = false;
            this.render();
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    enemyTurn() {
        if (this.gameOver) return;
        const aiLevel = this.opponent.level || 1;
        let roll = this.calculateRoll();

        if (aiLevel >= 5 && roll < 3 && Math.random() < 0.25) roll += 3;
        if (aiLevel === 6 && Math.random() < 0.2) roll = (Math.random() > 0.5) ? 0 : 6;

        let rollName = roll === 0 ? "枭" : (roll === 6 ? "卢" : roll);
        this.addLog(`对手掷出了：${rollName}`);

        let action = 'move';
        if (this.enemyHP < 30) action = 'def';
        else if (roll === 0 || roll === 6) action = 'atk';
        else action = 'move';

        if (aiLevel >= 3) {
            if (this.enemyPos >= 8) action = 'atk';
            if (this.playerHP < 40) action = 'atk';
        }
        if (aiLevel >= 5) {
            let baseDmg = roll===0?25:(roll===6?30:roll*3);
            if ((baseDmg + this.enemyPos*2) >= this.playerHP) action = 'atk';
        }

        if (action === 'move') {
            let gain = roll === 0 ? 6 : (roll === 6 ? 6 : roll);
            this.enemyPos = Math.min(12, this.enemyPos + gain);
            this.addLog("对手步步紧逼，积攒了棋盘优势。");
        } else if (action === 'atk') {
            let baseDmg = roll === 0 ? 25 : (roll === 6 ? 30 : roll * 3);
            let dmg = baseDmg + (this.enemyPos * 2);
            this.playerHP -= dmg;
            this.enemyPos = Math.max(0, this.enemyPos - 3);
            this.addLog(`对手攻势如潮，你的枭棋受到重创！(伤害 ${dmg})`);
        } else if (action === 'def') {
            let heal = roll === 0 ? 15 : (roll === 6 ? 20 : roll * 2);
            this.enemyHP = Math.min(100, this.enemyHP + heal);
            this.addLog("对手采取守势，稳住了阵脚。");
        }

        this.checkWin();
        if (!this.gameOver) {
            this.isPlayerTurn = true;
            this.turn++;
            this.lastRoll = null;
            this.hasCheated = false;
            this.render();
            // 【重要】唤醒 QTE
            this._startQTELoop();
        }
    }

    checkWin() {
        if (this.enemyHP <= 0) {
            this.enemyHP = 0;
            this.gameOver = true;
            this.endGame(true);
        } else if (this.playerHP <= 0) {
            this.playerHP = 0;
            this.gameOver = true;
            this.endGame(false);
        }
    }

    // game_liubo.js 中的 endGame 方法修改
    endGame(isWin) {
        this.render();
        setTimeout(() => {
            const B = this.opponent.bet;
            let realProfit = 0;
            let nextBet = 0;

            const townId = this.ui.currentTown.id;
            const latestOpponent = window.UtilsGamble.getGamblerById(townId, 'liubo', this.opponent.id);
            const targetOpponent = latestOpponent || this.opponent;

            if (isWin) {
                // 逻辑 3.2: 获胜，玩家获得 B*2 (本金+利润)
                realProfit = Math.min(B, targetOpponent.currentMoney);
                UtilsMoney.addMoney(B + realProfit);

                if (window.UtilsGamble) {
                    UtilsGamble.updateMoney(townId, 'liubo', targetOpponent.id, realProfit, B, 2);
                }
                // 逻辑 3.2: 乘胜追击 E = min(B, 赌徒剩余钱)
                nextBet = Math.min(B, targetOpponent.currentMoney);
            } else {
                // 逻辑 3.4: 失败，玩家 D = C (本金已在开局扣除)
                if (window.UtilsGamble) {
                    UtilsGamble.updateMoney(townId, 'liubo', targetOpponent.id, 0, B, 1);
                }
                // 逻辑 3.4: 再来一局 E = min(B, 玩家剩余钱)
                nextBet = Math.min(B, window.player.money);
            }

            if(window.saveGame) window.saveGame();
            this.render();

            // 构造传递给 GambleShop 的数据
            this.ui.renderResultView({
                isWin: isWin,
                title: isWin ? "✨ 大 获 全 胜 ✨" : "💀 棋 差 一 着 💀",
                msg: isWin ? "运筹帷幄，击溃敌军" : "枭棋被斩，满盘皆输",
                moneyChange: isWin ? realProfit : -B,
                opponent: targetOpponent,
                // 【核心】将计算好的下一局押注和逻辑标志传上去
                nextBet: nextBet,
                playerMoney: window.player.money,
                opponentMoney: targetOpponent.currentMoney,
                onExit: () => this.ui.selectGame('liubo'),
                onRetry: (nextBetAmount) => {
                    // 逻辑 4: 进入待机状态
                    this.state = 'waiting_new';
                    this.nextBetAmount = nextBetAmount;
                    this.render();
                }
            });
        }, 800);
    }

    // 【新增】对应逻辑 4：残影界面点击“点击开始新一局”后的正式启动逻辑
    startNewRoundAfterWaiting() {
        const B = this.nextBetAmount; // 获取预设的 E 金额

        // 检查玩家现金 (逻辑 3.4/3.1)
        if (window.player.money < B) {
            if(window.showToast) window.showToast("本金不足，无法开始！");
            return;
        }

        // 1. 正式扣费与记账 (逻辑 3.1)
        UtilsMoney.removeMoney(B);
        this.opponent.bet = B; // 更新本局实际押注金额

        // 调用 v4.0 工具类 Type 0 (收取赌注)
        if (window.UtilsGamble) {
            UtilsGamble.updateMoney(this.ui.currentTown.id, 'liubo', this.opponent.id, 0, B, 0);
        }

        // 2. 记录 UI 流水日志
        this.ui.addMoneyLog('player', '本局押注', -B);
        this.ui.addMoneyLog('opponent', '本局对赌', -B);

        // 3. 完全初始化对局状态 (重置血条、棋盘等)
        this.state = 'playing';
        this.turn = 1;
        this.playerHP = 100;
        this.enemyHP = 100;
        this.playerPos = (this.skillLevel >= 5) ? 2 : 0;
        this.enemyPos = 0;
        this.isPlayerTurn = true;
        this.gameOver = false;
        this.lastRoll = null;
        this.rollResult = 0;
        this.logs = [`-- 新的对局开始 (押注 ${B} 文) --`];
        this.hasCheated = false;

        if(window.saveGame) window.saveGame();
        if(window.updateUI) window.updateUI();

        // 4. 进入正式游戏流程
        this.init();
    }

    addLog(msg) {
        this.logs.push(msg);
        if (this.logs.length > 50) this.logs.shift();
    }

    toggleRules() {
        this.showRules = !this.showRules;
        this.render(true);
    }

    _getSuspicionUI() {
        if (this.skillLevel < 2) {
            let text = "毫无防备"; let color = "#66bb6a"; const s = this.alertness;
            if (s > 80) { text = "死死盯着"; color = "#ef5350"; }
            else if (s > 50) { text = "神色紧张"; color = "#ffa726"; }
            else if (s > 20) { text = "略有疑虑"; color = "#ffee58"; }
            return `<div style="font-size:14px; color:${color}; margin-left:10px; display:inline-block;">(状态: ${text})</div>`;
        }
        const s = this.alertness;
        let barClass = "liubo_sus_low";
        if (s > 80) barClass = "liubo_sus_high"; else if (s > 50) barClass = "liubo_sus_med";
        return `<div style="display:inline-flex; align-items:center; vertical-align:middle;"><div class="liubo_suspicion_wrap"><div class="liubo_suspicion_fill ${barClass}" style="width:${s}%"></div></div><div class="liubo_suspicion_text">${s}/100</div></div>`;
    }

    _generateSkillHtml() {
        const skills = [
            { lv: 1, text: "洞察资金 (显示对手筹码)" }, { lv: 2, text: "察言观色 (显示警觉值)" },
            { lv: 3, text: "眼疾手快 (QTE速度: 快速)" }, { lv: 4, text: "手法娴熟 (橙色区域: 30%)" },
            { lv: 5, text: "谈笑风生 (闲聊次数: 5)" }, { lv: 6, text: "从容不迫 (QTE速度: 中速)" },
            { lv: 7, text: "千术精湛 (橙色区域: 40%)" }, { lv: 8, text: "言语如簧 (闲聊次数: 7)" },
            { lv: 9, text: "心如止水 (QTE速度: 慢速)" }, { lv: 10, text: "天人合一 (绿色区域: 30%)" }
        ];
        let html = '<div class="skill-list-title">赌术效果预览</div>';
        skills.forEach(s => {
            const isActive = this.skillLevel >= s.lv;
            const cls = isActive ? 'active' : 'inactive';
            const icon = isActive ? '✅' : '🔒';
            html += `<div class="skill-list-item ${cls}"><div><span class="skill-lv">Lv.${s.lv}</span> ${s.text}</div><span class="skill-icon">${icon}</span></div>`;
        });
        return html;
    }

    // 【核心】渲染方法：使用 updateContent
    render(showActions = false) {
        // --- 1. 筹策(筷子)显示逻辑 ---
        let sticksHtml = '';
        if (this.isAnimating) {
            for(let i=0;i<6;i++) { const r=Math.random()>0.5; sticksHtml+=`<div class="stick ${r?'black':'white'} animating"></div>`; }
        } else if (this.lastRoll!==null) {
            for(let i=0;i<6;i++) { const b=i<this.lastRoll; sticksHtml+=`<div class="stick ${b?'black':'white'}"></div>`; }
        } else {
            const d=this.rollResult||0; for(let i=0;i<6;i++) { const b=i<d; sticksHtml+=`<div class="stick ${b?'black':'white'}"></div>`; }
        }

        // --- 2. 日志与状态文本 ---
        const logsHtml = this.logs.map((l, i) => `<div class="${i===this.logs.length-1?'log-new':''}">${l}</div>`).join('');
        const statusText = this._getEnemyStatusText();
        const suspicionHtml = this._getSuspicionUI();

        // --- 3. 操作区逻辑 (核心修改点) ---
        let actionArea = '';

        // 逻辑 4：处理“点击再来/乘胜追击”后的残影待机状态
        if (this.state === 'waiting_new') {
            actionArea = `
                <div style="text-align:center; padding:15px; background:rgba(0,0,0,0.2); border-radius:10px; border:1px dashed #ffcc80;">
                    <div style="color:#ffcc80; font-size:20px; margin-bottom:10px; font-weight:bold;">
                        准备以 <span style="color:#fff; font-size:24px;">${this.nextBetAmount}</span> 文开始新局
                    </div>
                    <button class="btn-roll" style="width:280px; height:50px;" onclick="GambleShop.currentGame.startNewRoundAfterWaiting()">
                        点击开始新一局
                    </button>
                </div>`;
        }
        // 正常对局：对手回合
        else if (!this.isPlayerTurn && !this.gameOver) {
            actionArea = `<div style="text-align:center; padding:30px; color:#ddd; font-size: 20px; letter-spacing:2px;">对手思考中...</div>`;
        }
        // 正常对局：玩家阶段 1 (待投箸)
        else if (this.lastRoll === null && !this.isAnimating && !this.gameOver) {
            const z = this.qteZones;
            const qteHtml = `
                <div class="qte-container">
                    <div class="qte-bar">
                        <div class="qte-zone-gray" style="width:100%; left:0;"></div>
                        <div class="qte-zone-orange" id="qte_zone_orange" style="left:${z.orangeStart}%; width:${this.orangePct}%"></div>
                        <div class="qte-zone-green" id="qte_zone_green" style="left:${z.greenStart}%; width:${this.greenPct}%"></div>
                        <div class="qte-cursor" id="qte_cursor_el" data-inst="${this.instanceId}" style="left:${this.qtePos}%"></div>
                    </div>
                </div>`;
            const canCheat = !this.hasCheated && this.isPlayerTurn;
            const cheatClass = canCheat ? 'btn-skill' : 'btn-disabled';
            const canChat = this.chatCount > 0 && this.isPlayerTurn;
            const chatClass = canChat ? 'btn-chat' : 'btn-disabled';

            actionArea = `
                <div style="display:flex; gap:20px; justify-content:center; margin:10px 0;">
                    <button class="game-btn btn-move" onclick="GambleShop.currentGame.playerRoll()" style="width:160px;">🎲 投 箸</button>
                    <button class="game-btn ${cheatClass}" style="width:140px; position:relative;" onclick="GambleShop.currentGame.playerCheat()">🖐️ 出 千${canCheat ? qteHtml : ''}</button>
                    <button class="game-btn ${chatClass}" style="width:140px;" onclick="GambleShop.currentGame.playerChat()">💬 闲聊 (${this.chatCount})</button>
                </div>`;
        }
        // 正常对局：投掷动画中
        else if (this.isAnimating) {
            actionArea = `<div style="text-align:center; padding:20px; color:#ffa726; font-size: 24px; font-weight:bold; animation: pulse 0.8s infinite;">🎲 投掷中...</div>`;
        }
        // 正常对局：玩家阶段 2 (决策)
        else if (!this.gameOver) {
            const roll = this.rollResult;
            const rn = roll===0?"枭 (0)":(roll===6?"卢 (6)":`散 (${roll})`);
            const gain = roll===0?6:(roll===6?6:roll);

            let baseDmg = roll === 0 ? 25 : (roll === 6 ? 30 : roll * 3);
            let totalDmg = baseDmg + (this.playerPos * 2);
            let atkSubText = (this.playerPos > 0 || roll === 0 || roll === 6) ? `预计 -${totalDmg}` : "需优势";

            actionArea = `
                <div class="decision-hint">投箸出了 <span style="color:#fff;">${rn}</span>，用这 <span style="color:#fff;">${gain}</span> 点优势做什么？</div>
                <div class="action-grid">
                    <button class="game-btn btn-move" onclick="GambleShop.currentGame.playerAction('move')">🏁 进 军<br><span style="font-size:14px; opacity:0.8">优势 +${gain}</span></button>
                    <button class="game-btn btn-atk" onclick="GambleShop.currentGame.playerAction('atk')">⚔️ 杀 枭<br><span style="font-size:14px; opacity:0.8">${atkSubText}</span></button>
                    <button class="game-btn btn-def" onclick="GambleShop.currentGame.playerAction('def')">🛡️ 固 守<br><span style="font-size:14px; opacity:0.8">回血</span></button>
                </div>`;
        }

        // --- 4. 整体界面组装 ---
        const html = `
            <div class="gamble-layout" style="background:#2d2d2d; color:#fff; overflow:hidden;">
                <div class="liubo-board">
                    <div class="liubo-header">
                        <div class="header-side header-left">
                            <div style="font-size:14px; color:#aaa; margin-right:5px;">对手</div>
                            <div style="font-weight:bold; font-size:22px; display:flex; align-items:center;">
                                ${this.opponent.name} <span class="enemy-status">${statusText}</span> ${suspicionHtml}
                            </div>
                        </div>
                        <div class="header-center">
                            <div style="font-size:26px; font-weight:bold; color:#a1887f;">第 ${this.turn} 回合</div>
                            <button class="btn-rules" onclick="GambleShop.currentGame.toggleRules()">📜 查看规则</button>
                        </div>
                        <div class="header-side header-right">
                            <div class="skill-info-wrap">
                                <div class="skill-tag-btn">🎲 赌术 Lv.${this.skillLevel}</div>
                                <div class="skill-dropdown">${this._generateSkillHtml()}</div>
                            </div>
                            <div style="text-align:right"><div style="font-size:14px; color:#aaa;">我方</div><div style="font-weight:bold; font-size:22px;">你</div></div>
                        </div>
                    </div>

                    <div class="liubo-area">
                        <div class="unit-bar">
                            <div class="unit-icon">🦉</div>
                            <div class="hp-track"><div class="hp-fill enemy" style="width: ${this.enemyHP}%"></div></div>
                            <div style="width:50px; text-align:right;">${this.enemyHP}</div>
                        </div>
                        <div style="font-size:16px; color:#e57373; text-align:right; margin-top:-5px;">棋盘优势: ${"♙".repeat(this.enemyPos)} (${this.enemyPos})</div>
                        
                        <div class="center-display">
                            <div class="game-log" id="liubo_game_log">${logsHtml}</div>
                            <div class="stick-area">${sticksHtml}</div>
                        </div>

                        <div style="font-size:16px; color:#81c784; margin-bottom:-5px;">棋盘优势: ${"♟️".repeat(this.playerPos)} (${this.playerPos})</div>
                        <div class="unit-bar">
                            <div class="unit-icon">🦅</div>
                            <div class="hp-track"><div class="hp-fill player" style="width: ${this.playerHP}%"></div></div>
                            <div style="width:50px; text-align:right;">${this.playerHP}</div>
                        </div>
                    </div>

                    <div class="bottom-controls">${actionArea}</div>
                </div>
                <button class="btn-resign" onclick="GambleShop.selectGame('liubo')">🏳️ 认输离场</button>
            </div>
        `;

        this.ui.updateContent(html);
        setTimeout(() => { const el = document.getElementById('liubo_game_log'); if(el) el.scrollTop = el.scrollHeight; }, 100);
    }
}
window.LiuboGame = LiuboGame;