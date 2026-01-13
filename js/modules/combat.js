// js/modules/combat.js
// 战斗系统 v9.0 (模块化总控版)
// 职责：统一接口，调度子模块，保持原有 API 兼容

const Combat = {
    // === 基础数据寄存 ===
    enemy: null,
    player: null,
    logs: [],
    maxTurns: 50,
    onWinCallback: null,
    options: {}, // 存储战斗配置，如 canEscape

    // === 状态控制 ===
    isStopped: false,
    isPaused: false,
    isEnded: false,
    timer: null,

    // === 冷却与回合 ===
    itemCDs: [0, 0, 0],
    skillCDs: {},
    currentTurn: 1,
    turnSpeed: 1000,

    // === 实时数值 ===
    currentPHp: 0,
    currentPMp: 0,
    currentEHp: 0,

    // === 状态系统 ===
    buffs: { player: {}, enemy: {} },
    uiRefs: {}, // UI 引用池

    // ================= 外部调用接口 =================

    /** 启动战斗 */
    start: function(enemyObj, onWin, logId, options = {}) {
        this.options = options;
        CombatInit.start(this, enemyObj, onWin, logId);
    },

    /** 停止战斗 (逃跑) */
    stop: function() {
        CombatCore.stop(this);
    },

    /** 暂停/继续 */
    togglePause: function() {
        CombatCore.togglePause(this);
    },

    /** 修改战斗速度 */
    changeSpeed: function(delta) {
        CombatCore.changeSpeed(this, delta);
    },

    /** 使用消耗品 */
    useConsumable: function(slotIndex) {
        CombatAction.useConsumable(this, slotIndex);
    },

    /** 使用技能 */
    useSkill: function(bookId, skillIdx) {
        CombatAction.useSkill(this, bookId, skillIdx);
    },

    // ================= 内部快捷代理 =================
    // 方便子模块间通过 Combat 对象直接调用常用的 UI 或 状态方法
    _log: function(msg) { CombatUI.log(this, msg); },
    _updateUIStats: function() { CombatUI.updateStats(this); },
    _refreshSkillCDUI: function() { CombatUI.refreshSkillCD(this); },
    _refreshItemCDUI: function() { CombatUI.refreshItemCD(this); },
    _updateToxUI: function() { CombatUI.updateTox(this); },
    _syncPlayerStatus: function() { CombatCore.syncStatus(this); },
    _canAct: function() { return CombatCore.canAct(this); },
    _runCombatLoopAsync: function() { CombatCore.runLoop(this); },
    _randomInt: function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    clearCache: function() { this.uiRefs = {}; this.logContainerId = null; }
};

window.Combat = Combat;