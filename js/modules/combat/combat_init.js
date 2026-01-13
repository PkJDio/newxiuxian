// js/modules/combat/combat_init.js
// 职责：处理战斗前的数据修正、UI缓存初始化、样式注入

const CombatInit = {
    start: function(ctx, enemyObj, onWin, logId) {
        if (!window.player) return;

        this._injectStyles();
        this._initUICache(ctx, logId);

        // 数据深度克隆与修正
        ctx.enemy = JSON.parse(JSON.stringify(enemyObj));
        this._patchEnemyData(ctx.enemy);

        ctx.player = window.player;
        if (ctx.player.toxicity === undefined) ctx.player.toxicity = 0;

        // 重置状态
        ctx.logs = [];
        ctx.onWinCallback = onWin;
        ctx.logContainerId = logId;
        ctx.isStopped = false;
        ctx.isPaused = false;
        ctx.isEnded = false;
        ctx.itemCDs = [0, 0, 0];
        ctx.skillCDs = {};
        ctx.buffs = { player: {}, enemy: {} };

        // 记录当前状态
        const p = ctx.player.derived || ctx.player.attributes;
        ctx.currentPHp = p.hp !== undefined ? p.hp : (p.maxHp || 100);
        ctx.currentPMp = p.mp !== undefined ? p.mp : (p.maxMp || 100);
        ctx.currentEHp = (ctx.enemy.stats && ctx.enemy.stats.hp) || ctx.enemy.hp || 100;
        ctx.enemy.maxHp = ctx.currentEHp;

        ctx.currentTurn = 1;

        // 初始刷新 UI
        ctx._refreshItemCDUI();
        ctx._refreshSkillCDUI();
        ctx._updateToxUI();
        ctx._updateUIStats();

        // 延迟启动循环
        ctx.timer = setTimeout(() => ctx._runCombatLoopAsync(), 500);
    },

    _patchEnemyData: function(enemy) {
        // ... (此处保留你原有的 _patchEnemyData 逻辑，不作修改)
        const tmplKey = enemy.template || "minion";
        const templateData = (typeof ENEMY_TEMPLATES !== 'undefined') ? ENEMY_TEMPLATES[tmplKey] : null;
        if (enemy.basePen === undefined && templateData) enemy.basePen = templateData.basePen;
        if (enemy.accuracy === undefined) enemy.accuracy = templateData ? (templateData.accuracy || 0) : 0;
        // ... 补齐原有逻辑 ...
        if (enemy.basePen === undefined) enemy.basePen = 0;
        if (enemy.toxAtk === undefined) enemy.toxAtk = 0;
        if (!enemy.stats) enemy.stats = {};
        if (enemy.atk !== undefined && enemy.stats.atk === undefined) enemy.stats.atk = enemy.atk;
        if (enemy.def !== undefined && enemy.stats.def === undefined) enemy.stats.def = enemy.def;
        if (enemy.speed !== undefined && enemy.stats.speed === undefined) enemy.stats.speed = enemy.speed;
    },

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

    _injectStyles: function() {
        // ... (此处保留你原有的 CSS 注入逻辑)
        if (document.getElementById('combat-styles-v7-7')) return;
        const css = `.turn-divider { margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center; } ... `;
        const style = document.createElement('style');
        style.id = 'combat-styles-v7-7';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
};