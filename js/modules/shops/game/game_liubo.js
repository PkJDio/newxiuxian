// js/modules/games/game_liubo.js
// 六博棋 - 游戏核心逻辑 v4.2 (修复出千解锁逻辑)

console.log("加载 六博棋模块 v4.2");

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
    /* 右侧布局：靠右对齐，内部元素有间距 */
    .header-right { justify-content: flex-end; gap: 15px; } 
    /* 中间部分：绝对居中，不占 flex 空间，防止挤压 */
    .header-center { 
        position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); 
        text-align: center; white-space: nowrap;
    }
    
    /* 状态与警觉值显示 */
    .enemy-status { font-size: 16px; color: #ffcc80; margin-left: 8px; border: 1px solid #8d6e63; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,0.3); vertical-align: middle; }
    .alert-meter { font-size: 16px; color: #e57373; margin-left: 8px; font-weight: bold; display: inline-flex; align-items: center; vertical-align: middle; }
    .alert-icon { margin-right: 2px; font-size: 16px; }

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
    .skill-list-item.active { color: #a5d6a7; text-shadow: 0 0 1px #000; } /* 激活绿色 */
    .skill-list-item.inactive { color: #757575; opacity: 0.7; } /* 未激活灰色 */
    .skill-lv { font-weight: bold; margin-right: 8px; min-width: 40px; color: #ffcc80; }
    .skill-icon { font-size: 12px; }

    /* 中间区域：自适应高度 */
    .liubo-area { 
        flex: 1; display: flex; flex-direction: column; gap: 8px; 
        min-height: 0; /* 允许压缩 */
        justify-content: space-between; 
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

    /* 底部操作容器：固定在底部 */
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

       /* ================= 【新增】警觉条样式 (仿樗蒲) ================= */
    .liubo_suspicion_wrap {
        width: 100px; height: 8px; 
        background: #3e2723; border: 1px solid #5d4037;
        margin-left: 10px; border-radius: 4px; 
        overflow: hidden; position: relative;
        display: inline-block; vertical-align: middle;
    }
    .liubo_suspicion_fill { height: 100%; transition: width 0.3s; }
    .liubo_sus_low { background: #66bb6a; } /* 绿 */
    .liubo_sus_med { background: #ffa726; } /* 橙 */
    .liubo_sus_high { background: #ef5350; } /* 红 */
    .liubo_suspicion_text { font-size: 14px; color: #ccc; margin-left: 5px; vertical-align: middle; }

    /* 原有的状态文字样式微调 */
    .enemy-status { font-size: 14px; color: #ffcc80; margin-left: 5px; border: 1px solid #8d6e63; padding: 0 4px; border-radius: 4px; background: rgba(0,0,0,0.3); vertical-align: middle; }
</style>
`;

if (!document.getElementById('game-liubo-styles')) {
    document.head.insertAdjacentHTML('beforeend', liuboStyles);
}

// ================= 六博游戏类 =================
class LiuboGame {
    constructor(opponent, uiParent) {
        this.opponent = opponent;
        this.ui = uiParent;
        this.logs = [];
        // 【新增】实例唯一ID，用于区分不同局的定时器
        this.instanceId = "game_" + Date.now() + "_" + Math.random();
        // 【新增】定时器引用
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

        // 【系统】警觉与技能
        this.skillLevel = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('gambling') : 0;
        this.alertness = 0; // 0-100
        this.chatCount = this._getChatLimit();

        // 【系统】QTE 状态
        this.qteRunning = false;
        this.qtePos = 0;
        this.qteDir = 1; // 1右, -1左
        this.qteSpeed = this._getQTESpeed();

        // 【修正】QTE 区域占比计算 (严格匹配设计文档)
        // 默认(Lv0-3): 绿10, 橙20, 灰70
        // Lv4: 绿10, 橙30, 灰60
        // Lv7: 绿10, 橙40, 灰50
        // Lv10: 绿30, 橙40, 灰30
        if (this.skillLevel >= 10) {
            this.greenPct = 30;
            this.orangePct = 40;
        } else if (this.skillLevel >= 7) {
            this.greenPct = 10;
            this.orangePct = 40;
        } else if (this.skillLevel >= 4) {
            this.greenPct = 10;
            this.orangePct = 30;
        } else {
            this.greenPct = 10;
            this.orangePct = 20;
        }

        // 生成区域
        this.qteZones = this._generateQTEZones();

        this.hasCheated = false;
    }

    _getChatLimit() {
        if (this.skillLevel >= 8) return 7;
        if (this.skillLevel >= 5) return 5;
        return 3;
    }

    _getQTESpeed() {
        // 速度: 跑完100%所需时间(ms) -> 换算成每16ms增量
        // 目标时间: 0.25s (极快), 0.5s (快), 0.75s (中), 1s (慢)

        let duration = 250; // 默认 Lv0-2: 0.25秒跑完 (极难)

        if (this.skillLevel >= 9) {
            duration = 1000; // Lv9+: 1秒跑完 (最慢/最简单)
        } else if (this.skillLevel >= 6) {
            duration = 750;  // Lv6-8: 0.75秒跑完
        } else if (this.skillLevel >= 3) {
            duration = 500;  // Lv3-5: 0.5秒跑完
        }

        // 计算每一帧(约16.6ms)应该移动多少百分比
        // 公式：总距离100% / (总时间 / 单帧时间)
        return 100 / (duration / 16.6);
    }

    _generateQTEZones() {
        // 随机生成绿色区间在橙色区间内部
        const orangeW = this.orangePct;
        const greenW = this.greenPct;

        // 橙色起始点随机
        const orangeStart = Math.floor(Math.random() * (100 - orangeW));
        const orangeEnd = orangeStart + orangeW;

        // 绿色居中偏移
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
        this._startQTELoop(); // 启动循环监听
    }

    // --- QTE 动画循环 ---
    // --- QTE 动画循环 ---
    _startQTELoop() {
        if (this.qteTimer) clearInterval(this.qteTimer);

        this.qteTimer = setInterval(() => {
            const cursor = document.getElementById('qte_cursor_el');

            // 【核心】如果红线不存在，或者红线上的身份证和当前游戏不一致，说明这是旧定时器，必须停止
            if (!cursor || cursor.dataset.inst !== this.instanceId) {
                clearInterval(this.qteTimer);
                this.qteTimer = null;
                return;
            }

            if (this.gameOver) return;

            // 只有在玩家回合、未投掷、非动画状态下才移动
            if (this.isPlayerTurn && this.lastRoll === null && !this.isAnimating) {
                this.qtePos += (this.qteSpeed * this.qteDir);

                // 触右边：反弹并刷新区域
                if (this.qtePos >= 100) {
                    this.qtePos = 100;
                    this.qteDir = -1;

                    // 刷新区域并更新显示
                    this.qteZones = this._generateQTEZones();
                    this._updateQTEZonesDOM();
                }

                // 触左边：反弹
                if (this.qtePos <= 0) {
                    this.qtePos = 0;
                    this.qteDir = 1;
                }

                cursor.style.left = `${this.qtePos}%`;
            }
        }, 16);
    }
// 【新增】更新 QTE 区域的 DOM 显示 (不重新渲染整个界面)
    _updateQTEZonesDOM() {
        const orangeEl = document.getElementById('qte_zone_orange');
        const greenEl = document.getElementById('qte_zone_green');
        if (orangeEl && greenEl) {
            const z = this.qteZones;
            orangeEl.style.left = `${z.orangeStart}%`;
            // 如果宽度也会变（比如某些动态难度），也可以更新 width
            // orangeEl.style.width = `${this.orangePct}%`;

            greenEl.style.left = `${z.greenStart}%`;
            // greenEl.style.width = `${this.greenPct}%`;
        }
    }
    // --- 消耗时间 ---
    _passTime() {
        if (window.TimeSystem && window.TimeSystem.passTime) {
            window.TimeSystem.passTime(0.2);
        }
    }

    // --- 逻辑：获取状态描述 ---
    _getEnemyStatusText() {
        // 警觉 < 30 才显示心情
        if (this.alertness < 30) {
            const diff = this.enemyHP - this.playerHP;
            if (diff > 40) return "欣喜若狂";
            if (diff > 10) return "欢呼雀跃";
            if (diff >= -10) return "面色平静";
            if (diff > -40) return "脸色难看";
            return "面如死灰";
        } else if (this.alertness < 60) {
            return "眼神狐疑";
        } else if (this.alertness < 90) {
            return "目光锐利";
        } else {
            return "即将暴走";
        }
    }

    // --- 玩家动作：出千 (【核心修改】移除等级限制) ---
    playerCheat() {
        // 【修改点 1】移除 if (this.skillLevel < 4) return;
        this._passTime();

        const pos = this.qtePos;
        const z = this.qteZones;
        let roll = 0;
        let logMsg = "";
        let alertAdd = 0;

        if (pos >= z.greenStart && pos <= z.greenEnd) {
            // 完美出千
            const minBonus = Math.floor(this.skillLevel / 3) || 1;
            const maxBonus = Math.floor(this.skillLevel / 2) || 1;
            const bonus = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;

            let baseRoll = this.calculateRoll();
            roll = Math.min(6, baseRoll + bonus);

            logMsg = `【完美出千】手法如神！点数+${bonus}，对方毫无察觉。`;
            alertAdd = 0;
        }
        else if (pos >= z.orangeStart && pos <= z.orangeEnd) {
            // 普通出千
            let baseRoll = this.calculateRoll();
            roll = Math.min(6, baseRoll + 1);
            logMsg = `【出千】袖里藏刀，点数+1。`;

            // 警觉公式：(赌徒Lv - 赌术Lv/2) * 10
            const reduction = Math.floor(this.skillLevel / 2);
            let val = (this.opponent.level - reduction) * 10;
            alertAdd = Math.max(0, val);
        }
        else {
            // 失败
            roll = this.calculateRoll(); // 原样
            logMsg = `【出千失误】手法拙劣，险些穿帮！`;
            // 警觉公式：180 - 赌术Lv*20
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

                // 重置 QTE 区域
                this.qteZones = this._generateQTEZones();
                this.render(true);
            }, 600);
        }
    }

    // --- 玩家动作：闲聊 ---
    playerChat() {
        if (this.chatCount <= 0) return;
        this._passTime();
        this.chatCount--;

        // 成功率：赌术Lv * 10%
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
        this.render(true);
    }

    // --- 警觉增加与拉黑判定 ---
    _addAlertness(val) {
        if (val <= 0) return;
        this.alertness += val;
        if (this.alertness >= 100) {
            this.alertness = 100;
            this.triggerBlacklist();
        }
    }

    triggerBlacklist() {
        this.gameOver = true;
        this.addLog(`<b style="color:red">【被发现了！】对方识破了你的千术！</b>`);

        if (window.UtilsGamble) {
            UtilsGamble.addToBlacklist(this.ui.currentTown.id);
        }

        setTimeout(() => {
            if (window.showGambleResultModal) {
                const msg = "出千被抓！<br>你被赌坊打手扔了出去！<br><span style='font-size:18px; color:#b71c1c; font-weight:bold;'>（已被拉黑，下月前无法进入）</span>";

                // 参数：失败(false), 金额, 回调, 自定义消息, 自定义标题
                window.showGambleResultModal(false, this.opponent.bet, () => {
                    if (this.ui && this.ui.finishGame) {
                        // 【核心修改】传入第 5 个参数 true，表示强制回到大厅
                        this.ui.finishGame('liubo', false, this.opponent.bet, 0, true);
                    }
                }, msg, "🚫 出 千 被 抓 🚫");
            } else {
                // 兜底
                alert("【出千被抓】\n你被赌坊打手扔了出去！\n该城镇赌坊已将你拉黑，下个月前无法进入。");
                if (this.ui && this.ui.finishGame) {
                    this.ui.finishGame('liubo', false, this.opponent.bet, 0, true);
                }
            }
        }, 1000);
    }

    // --- 基础逻辑 (复用) ---
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

    playerAction(actionType) {
        const roll = this.rollResult;
        let damage = 0;
        let msg = "";
        this._passTime();

        if (actionType === 'move') {
            // 1. 基础增益
            let baseGain = roll === 0 ? 6 : (roll === 6 ? 6 : roll);

            // 2. 赌术加成 (波动逻辑)
            let bonusGain = 0;
            // 最大可能的加成值
            const maxBonus = Math.floor(this.skillLevel * 0.5);

            // 规则：50% 概率触发赌术生效
            if (maxBonus > 0 && Math.random() < 0.5) {
                // 生效后，在 [0, maxBonus] 之间随机取整数
                bonusGain = Math.floor(Math.random() * (maxBonus + 1));
            }

            // 3. 总增益
            let totalGain = baseGain + bonusGain;

            this.playerPos = Math.min(12, this.playerPos + totalGain);

            // 日志显示
            msg = `你指挥散棋推进，优势+${baseGain}`;

            // 只有当真正获得了额外点数时才显示提示，避免显示 "+0"
            if (bonusGain > 0) {
                msg += ` (赌术加成+${bonusGain})`;
            }

            msg += `，当前优势 ${this.playerPos}。`;

        } else if (actionType === 'atk') {
            // ... (后续攻击逻辑保持不变) ...
            if (this.playerPos <= 0 && roll !== 6 && roll !== 0) {
                if(window.showToast) window.showToast("位置劣势，难以进攻！");
                return;
            }
            let baseDmg = roll === 0 ? 25 : (roll === 6 ? 30 : roll * 3);
            damage = baseDmg + (this.playerPos * 2);

            if (Math.random() < (this.skillLevel * 0.02)) {
                damage = Math.floor(damage * 1.5);
                msg += "【神之一手】";
            }
            this.enemyHP -= damage;
            this.playerPos = Math.max(0, this.playerPos - 3);
            msg += `你抓住破绽，直取敌方枭棋！造成 ${damage} 点伤害。`;

        } else if (actionType === 'def') {
            // ... (后续防守逻辑保持不变) ...
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

        // AI 逻辑 (保持不变)
        if (aiLevel >= 5 && roll < 3 && Math.random() < 0.25) roll += 3;
        if (aiLevel === 6 && Math.random() < 0.2) roll = (Math.random() > 0.5) ? 0 : 6;

        let rollName = roll === 0 ? "枭" : (roll === 6 ? "卢" : roll);
        this.addLog(`对手掷出了：${rollName}`);

        let action = 'move';
        // 决策逻辑 (保持不变)
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

        // 行动执行 (保持不变)
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

            // 【核心修复】轮到玩家回合时，必须重新唤醒 QTE 定时器！
            // 因为在上个回合结束时，定时器已经因为界面元素消失而自动停止了。
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

    endGame(isWin) {
        this.render();
        setTimeout(() => {
            const bet = this.opponent.bet;
            let finalPayout = 0;
            let realProfit = 0;

            if (isWin) {
                // 六博规则：赢了获得双倍押注 (本金 + 同等利润)
                // 理论利润 = 押注额
                const theoryWin = bet;

                // 实际利润不能超过对手现在的钱
                const maxWin = this.opponent.maxMoney;
                realProfit = Math.min(theoryWin, maxWin);

                // 最终给玩家的钱 = 本金 + 实际利润
                finalPayout = bet + realProfit;
            } else {
                // 输了
                realProfit = -bet; // 净亏损
                finalPayout = 0;   // 没收本金
            }

            // ================= 【核心修改】立即刷新对手金额 =================
            if (isWin) {
                // 玩家赢 -> 对手扣钱
                this.opponent.maxMoney -= realProfit;
                if (this.opponent.maxMoney < 0) this.opponent.maxMoney = 0;
            } else {
                // 玩家输 -> 对手加钱 (赢走了玩家的本金)
                this.opponent.maxMoney += bet;
            }
            // 立即渲染一次，确保背景板金额更新
            this.render();
            // ==========================================================

            // 经验池机制 (保留您原有的逻辑，修正利润变量)
            if (window.UtilsLifeSkills && isWin) {
                if (!window.player.lifeSkills.gambling_pool) {
                    window.player.lifeSkills.gambling_pool = 0;
                }

                // 使用计算好的 realProfit
                window.player.lifeSkills.gambling_pool += realProfit;

                const levelFactor = Math.max(1, this.skillLevel) * 100;
                if (window.player.lifeSkills.gambling_pool >= levelFactor) {
                    const expGain = Math.floor(window.player.lifeSkills.gambling_pool / levelFactor);
                    window.player.lifeSkills.gambling_pool = window.player.lifeSkills.gambling_pool % levelFactor;
                    if (expGain > 0) {
                        UtilsLifeSkills.addExp('gambling', expGain);
                        // 可以加个Toast提示经验获得
                        // if(window.showToast) window.showToast(`棋艺精进，获得 ${expGain} 点赌术经验`);
                    }
                }
            }

            // 调用通用结算弹窗 (传入完整 5 个参数)
            if (this.ui && this.ui.showGameResult) {
                this.ui.showGameResult('liubo', isWin, bet, finalPayout, realProfit);
            } else {
                this.ui.finishGame('liubo', isWin, bet, finalPayout);
            }
        }, 500);
    }

    addLog(msg) {
        this.logs.push(msg);
        if (this.logs.length > 50) this.logs.shift();
    }

    toggleRules() {
        this.showRules = !this.showRules;
        this.render(true);
    }
    // ================= 【新增】获取警觉状态 UI =================
    _getSuspicionUI() {
        // Lv 2 以下隐藏具体数值
        if (this.skillLevel < 2) {
            let text = "毫无防备";
            let color = "#66bb6a";
            const s = this.alertness;

            if (s > 80) { text = "死死盯着"; color = "#ef5350"; }
            else if (s > 50) { text = "神色紧张"; color = "#ffa726"; }
            else if (s > 20) { text = "略有疑虑"; color = "#ffee58"; }

            return `<div style="font-size:14px; color:${color}; margin-left:10px; display:inline-block;">(状态: ${text})</div>`;
        }

        const s = this.alertness;
        let barClass = "liubo_sus_low";
        if (s > 80) barClass = "liubo_sus_high";
        else if (s > 50) barClass = "liubo_sus_med";

        return `
            <div style="display:inline-flex; align-items:center; vertical-align:middle;">
                <div class="liubo_suspicion_wrap">
                    <div class="liubo_suspicion_fill ${barClass}" style="width:${s}%"></div>
                </div>
                <div class="liubo_suspicion_text">${s}/100</div>
            </div>
        `;
    }
// 【新增】生成技能列表 HTML (用于悬浮窗)
    _generateSkillHtml() {
        const skills = [
            { lv: 1, text: "洞察资金 (显示对手筹码)" },
            { lv: 2, text: "察言观色 (显示警觉值)" },
            { lv: 3, text: "眼疾手快 (QTE速度: 快速)" },
            { lv: 4, text: "手法娴熟 (橙色区域: 30%)" },
            { lv: 5, text: "谈笑风生 (闲聊次数: 5)" },
            { lv: 6, text: "从容不迫 (QTE速度: 中速)" },
            { lv: 7, text: "千术精湛 (橙色区域: 40%)" },
            { lv: 8, text: "言语如簧 (闲聊次数: 7)" },
            { lv: 9, text: "心如止水 (QTE速度: 慢速)" },
            { lv: 10, text: "天人合一 (绿色区域: 30%)" }
        ];

        let html = '<div class="skill-list-title">赌术效果预览</div>';
        skills.forEach(s => {
            const isActive = this.skillLevel >= s.lv;
            const cls = isActive ? 'active' : 'inactive';
            const icon = isActive ? '✅' : '🔒';
            html += `
                <div class="skill-list-item ${cls}">
                    <div><span class="skill-lv">Lv.${s.lv}</span> ${s.text}</div>
                    <span class="skill-icon">${icon}</span>
                </div>
            `;
        });
        return html;
    }
    render(showActions = false) {
        // --- 绘制筹码 ---
        let sticksHtml = '';
        if (this.isAnimating) { for(let i=0;i<6;i++) { const r=Math.random()>0.5; sticksHtml+=`<div class="stick ${r?'black':'white'} animating"></div>`; } }
        else if (this.lastRoll!==null) { for(let i=0;i<6;i++) { const b=i<this.lastRoll; sticksHtml+=`<div class="stick ${b?'black':'white'}"></div>`; } }
        else { const d=this.rollResult||0; for(let i=0;i<6;i++) { const b=i<d; sticksHtml+=`<div class="stick ${b?'black':'white'}"></div>`; } }

        // --- 绘制日志 ---
        const logsHtml = this.logs.map((l, i) => `<div class="${i===this.logs.length-1?'log-new':''}">${l}</div>`).join('');

        // --- 头部信息 ---
        const statusText = this._getEnemyStatusText();

        // 调用新方法获取警觉条 HTML
        const suspicionHtml = this._getSuspicionUI();

        const showAlert = this.skillLevel >= 2;
        const alertHtml = showAlert ? `<span class="alert-meter"><span class="alert-icon">⚠️警觉度</span>${this.alertness}%</span>` : '';

        // --- 底部操作区 ---
        let actionArea = '';
        const z = this.qteZones;
        // 【核心修改】注意这里增加了 data-inst="${this.instanceId}"
        const qteHtml = `
            <div class="qte-container">
                <div class="qte-bar">
                    <div class="qte-zone-gray" style="width:100%; left:0;"></div>
                    <div class="qte-zone-orange" id="qte_zone_orange" style="left:${z.orangeStart}%; width:${this.orangePct}%"></div>
                    <div class="qte-zone-green" id="qte_zone_green" style="left:${z.greenStart}%; width:${this.greenPct}%"></div>
                    <div class="qte-cursor" id="qte_cursor_el" data-inst="${this.instanceId}" style="left:${this.qtePos}%"></div>
                </div>
            </div>
        `;
        const canCheat = !this.hasCheated && this.isPlayerTurn && !this.isAnimating;
        const cheatClass = canCheat ? 'btn-skill' : 'btn-disabled';
        const canChat = this.chatCount > 0 && this.isPlayerTurn && !this.isAnimating;
        const chatClass = canChat ? 'btn-chat' : 'btn-disabled';

        if (!this.isPlayerTurn) {
            actionArea = `<div style="text-align:center; padding:30px; color:#ddd; font-size: 20px;">对手思考中...</div>`;
        } else if (this.lastRoll === null && !this.isAnimating) {
            actionArea = `
                <div style="display:flex; gap:20px; justify-content:center; margin:10px 0;">
                    <button class="game-btn btn-move" onclick="GambleShop.currentGame.playerRoll()" style="width:160px;">🎲 投 箸</button>
                    <button class="game-btn ${cheatClass}" style="width:140px; position:relative;" onclick="GambleShop.currentGame.playerCheat()">🖐️ 出 千${canCheat ? qteHtml : ''}</button>
                    <button class="game-btn ${chatClass}" style="width:140px;" onclick="GambleShop.currentGame.playerChat()">💬 闲聊 (${this.chatCount})</button>
                </div>`;
        } else if (this.isAnimating) {
            actionArea = `<div style="text-align:center; padding:20px; color:#ffa726; font-size: 20px;">🎲 投掷中...</div>`;
        } else {
            const roll = this.rollResult;
            const p = roll===0?0:(roll===6?6:roll);
            const rn = roll===0?"枭 (0)":(roll===6?"卢 (6)":`散 (${roll})`);

            // ================= 【新增】计算预计伤害逻辑 =================
            // 1. 计算基础伤害 (参考 playerAction 中的逻辑)
            let baseDmg = roll === 0 ? 25 : (roll === 6 ? 30 : roll * 3);

            // 2. 加上位置优势加成
            let totalDmg = baseDmg + (this.playerPos * 2);

            // 3. 判断显示文本
            // 规则：如果 (位置优势 > 0) 或者 (掷出 0 或 6)，则允许攻击，显示伤害
            // 否则显示 "需优势"
            let atkSubText = "需优势";
            if (this.playerPos > 0 || roll === 0 || roll === 6) {
                atkSubText = `预计 -${totalDmg}`;
            }
            // ==========================================================

            actionArea = `
                <div class="decision-hint">投箸出了 <span style="color:#fff;">${rn}</span> 点，用 ${p} 点做什么？</div>
                <div class="action-grid">
                    <button class="game-btn btn-move" onclick="GambleShop.currentGame.playerAction('move')">🏁 进 军<br><span style="font-size:14px; opacity:0.8">优势 +${this.rollResult===0?6:this.rollResult}</span></button>
                    
                    <button class="game-btn btn-atk" onclick="GambleShop.currentGame.playerAction('atk')">⚔️ 杀 枭<br><span style="font-size:14px; opacity:0.8">${atkSubText}</span></button>
                    
                    <button class="game-btn btn-def" onclick="GambleShop.currentGame.playerAction('def')">🛡️ 固 守<br><span style="font-size:14px; opacity:0.8">回血</span></button>
                </div>`;
        }

        const html = `
            <div class="gamble-layout" style="background:#2d2d2d; color:#fff; overflow:hidden;">
                <div class="liubo-board">
                    
                    <div class="rules-overlay ${this.showRules ? 'active' : ''}" onclick="GambleShop.currentGame.toggleRules()">
                        <div class="rules-box" onclick="event.stopPropagation()">
                            <h3>📜 六博棋规则</h3>
                            <ul>
                                <li><b>胜负</b>：率先将对方枭棋(血量)归零者胜。</li>
                                <li><b>投箸</b>：掷出 0-6 点。0=枭(优势+6), 6=卢(优势+6), 1-5=散。</li>
                                <li><b>行动</b>：
                                    <ul>
                                        <li><b>进军</b>：增加棋盘优势(黑棋)。</li>
                                        <li><b>杀枭</b>：消耗棋盘优势扣除对方血量。</li>
                                        <li><b>固守</b>：回复自身血量。</li>
                                    </ul>
                                </li>
                                <li><b>出千</b>：QTE玩法，停在绿色区域完美作弊，橙色普通作弊。</li>
                                <li><b>警觉</b>：作弊会增加对方警觉，满100被拉黑。</li>
                            </ul>
                            <div style="text-align:center; margin-top:20px;">
                                <button class="ink_btn_small" onclick="GambleShop.currentGame.toggleRules()">关闭</button>
                            </div>
                        </div>
                    </div>

                    <div class="liubo-header">
                        <div class="header-side header-left">
                            <div style="font-size:14px; color:#aaa; margin-right:5px;">对手</div>
                            <div style="font-weight:bold; font-size:22px; display:flex; align-items:center;">
                                ${this.opponent.name} 
                                <span class="enemy-status">${statusText}</span>
                                ${suspicionHtml} </div>
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
                            <div style="text-align:right">
                                <div style="font-size:14px; color:#aaa;">我方</div>
                                <div style="font-weight:bold; font-size:22px;">你</div>
                            </div>
                        </div>
                    </div>

                    <div class="liubo-area">
                        <div class="unit-bar"><div class="unit-icon">🦉</div><div class="hp-track"><div class="hp-fill enemy" style="width: ${this.enemyHP}%"></div></div><div style="width:50px; text-align:right;">${this.enemyHP}</div></div>
                        <div style="font-size:16px; color:#e57373; text-align:right; margin-top:-5px;">棋盘优势: ${"♙".repeat(this.enemyPos)} (${this.enemyPos})</div>
                        <div class="center-display"><div class="game-log" id="liubo_game_log">${logsHtml}</div><div class="stick-area">${sticksHtml}</div></div>
                        <div style="font-size:16px; color:#81c784; margin-bottom:-5px;">棋盘优势: ${"♟️".repeat(this.playerPos)} (${this.playerPos})</div>
                        <div class="unit-bar"><div class="unit-icon">🦅</div><div class="hp-track"><div class="hp-fill player" style="width: ${this.playerHP}%"></div></div><div style="width:50px; text-align:right;">${this.playerHP}</div></div>
                    </div>

                    <div class="bottom-controls">${actionArea}</div>
                </div>
                <button class="btn-resign" onclick="GambleShop.selectGame('liubo')">🏳️ 认输离场</button>
            </div>
        `;

        this.ui._updateContent(html);
        setTimeout(() => { const el = document.getElementById('liubo_game_log'); if(el) el.scrollTop = el.scrollHeight; }, 300);
    }
}

window.LiuboGame = LiuboGame;