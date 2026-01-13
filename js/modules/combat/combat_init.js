// js/modules/combat/combat_init.js
// 职责：战斗准备、数据补丁、样式注入

const CombatInit = {
    start: function(ctx, enemyObj, onWin, logId) {
        if (!window.player) return;

        this._injectStyles();
        this._initUICache(ctx, logId);

        // 克隆敌人数据并打补丁
        ctx.enemy = JSON.parse(JSON.stringify(enemyObj));
        this._patchEnemyData(ctx.enemy);

        ctx.player = window.player;
        if (ctx.player.toxicity === undefined) ctx.player.toxicity = 0;

        // 初始化状态
        ctx.logs = [];
        ctx.onWinCallback = onWin;
        ctx.logContainerId = logId;
        ctx.isStopped = false;
        ctx.isPaused = false;
        ctx.isEnded = false;
        ctx.itemCDs = [0, 0, 0];
        ctx.skillCDs = {};
        ctx.buffs = { player: {}, enemy: {} };
        ctx.turnSpeed = 1000;

        // 同步实时数值
        const p = ctx.player.derived || ctx.player.attributes;
        ctx.currentPHp = p.hp !== undefined ? p.hp : (p.maxHp || 100);
        ctx.currentPMp = p.mp !== undefined ? p.mp : (p.maxMp || 100);
        ctx.currentEHp = (ctx.enemy.stats && ctx.enemy.stats.hp !== undefined) ? ctx.enemy.stats.hp : (ctx.enemy.hp || 100);
        ctx.enemy.maxHp = ctx.currentEHp;

        ctx.currentTurn = 1;

        // 初始 UI 渲染
        ctx._refreshItemCDUI();
        ctx._refreshSkillCDUI();
        ctx._updateToxUI();
        ctx._updateUIStats();

        // 500ms 后进入战斗循环
        ctx.timer = setTimeout(() => ctx._runCombatLoopAsync(), 500);
    },

    /** 敌人属性补丁：兼容旧数据模版 */
    _patchEnemyData: function(enemy) {
        const tmplKey = enemy.template || "minion";
        const templateData = (typeof ENEMY_TEMPLATES !== 'undefined') ? ENEMY_TEMPLATES[tmplKey] : null;

        if (enemy.basePen === undefined && templateData) enemy.basePen = templateData.basePen;
        if (enemy.accuracy === undefined) enemy.accuracy = templateData ? (templateData.accuracy || 0) : 0;

        if (enemy.toxAtk === undefined) {
            const db = window.enemies || (window.GAME_DB ? window.GAME_DB.enemies : []);
            const template = db.find(e => e.id === enemy.id);
            if (template) {
                if (template.stats && template.stats.toxicity) enemy.toxAtk = template.stats.toxicity;
                if (template.basePen !== undefined) enemy.basePen = template.basePen;
                if (template.accuracy !== undefined) enemy.accuracy = template.accuracy;
            }
        }
        enemy.basePen = enemy.basePen || 0;
        enemy.toxAtk = enemy.toxAtk || 0;
        if (!enemy.stats) enemy.stats = {};
        if (enemy.atk !== undefined && enemy.stats.atk === undefined) enemy.stats.atk = enemy.atk;
        if (enemy.def !== undefined && enemy.stats.def === undefined) enemy.stats.def = enemy.def;
        if (enemy.speed !== undefined && enemy.stats.speed === undefined) enemy.stats.speed = enemy.speed;
    },

    /** 缓存 DOM 引用，避免战斗中重复获取 */
    _initUICache: function(ctx, logId) {
        ctx.uiRefs = {
            logContainer: document.getElementById(logId),
            pHp: document.getElementById('combat_p_hp'),
            pHpBar: document.getElementById('combat_p_hp_bar'),
            pMp: document.getElementById('combat_p_mp'),
            pMpBar: document.getElementById('combat_p_mp_bar'),
            pToxBar: document.getElementById('combat_p_tox_bar'),
            pToxVal: document.getElementById('combat_p_tox_val'),
            eHp: document.getElementById('combat_e_hp'),
            eHpBar: document.getElementById('combat_e_hp_bar'),
            eToxBar: document.getElementById('combat_e_tox_bar'),
            eToxVal: document.getElementById('combat_e_tox_val'),
            pAttr: {
                atk: document.getElementById('p_attr_atk'),
                def: document.getElementById('p_attr_def'),
                spd: document.getElementById('p_attr_spd')
            },
            eAttr: {
                atk: document.getElementById('e_attr_atk'),
                def: document.getElementById('e_attr_def'),
                spd: document.getElementById('e_attr_spd')
            }
        };
    },

    /** 注入战斗专用的 Tooltip 样式 */
    _injectStyles: function() {
        if (document.getElementById('combat-styles-v7-7')) return;
        const css = `
            .turn-divider { margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center; } 
            .combat-tooltip-trigger { display: inline-block; position: relative; cursor: help; } 
            .combat-tooltip-content { visibility: hidden; opacity: 0; position: absolute; left: 100%; top: 50%; transform: translateY(-50%); margin-left: 10px; width: 220px; background: rgba(0, 0, 0, 0.9); color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-family: monospace; font-weight: normal; z-index: 99999; box-shadow: 2px 2px 10px rgba(0,0,0,0.4); transition: opacity 0.2s; pointer-events: none; text-align: left; line-height: 1.5; white-space: normal; } 
            .combat-tooltip-content::after { content: ""; position: absolute; top: 50%; right: 100%; margin-top: -6px; border-width: 6px; border-style: solid; border-color: transparent rgba(0, 0, 0, 0.9) transparent transparent; } 
            .combat-tooltip-trigger:hover .combat-tooltip-content { visibility: visible; opacity: 1; } 
            .tip-row { display: flex; justify-content: space-between; margin-bottom: 2px; } 
            .tip-dim { color: #aaa; font-size: 12px; } 
            .tip-crit { color: #ffeb3b; font-weight: bold; } 
            .tip-divider { border-top: 1px solid #555; margin: 5px 0; } 
            .tip-total { font-size: 15px; color: #4caf50; font-weight: bold; margin-top: 2px; }
        `;
        const style = document.createElement('style');
        style.id = 'combat-styles-v7-7';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
};