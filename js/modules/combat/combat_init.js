// js/modules/combat/combat_init.js
// 职责：战斗准备、数据补丁、样式注入、词条收集
// 修复：初始化 Core 数据 (Gauges) 和 词条数据 (Entries)

const CombatInit = {
    start: function(ctx, enemyObj, onWin, logId) {
        if (!window.player) return;

        this._injectStyles();
        this._initUICache(ctx, logId);

        // 1. 克隆敌人数据并打补丁
        ctx.enemy = JSON.parse(JSON.stringify(enemyObj));
        this._patchEnemyData(ctx.enemy);

        ctx.player = window.player;
        if (ctx.player.status.toxicity === undefined) ctx.player.status.toxicity = 0;

        // 2. 初始化基础状态
        ctx.logs = [];
        ctx.onWinCallback = onWin;
        ctx.logContainerId = logId;
        ctx.isStopped = false;
        ctx.isPaused = false;
        ctx.isEnded = false;

        // 冷却与Buff
        ctx.itemCDs = [0, 0, 0];
        ctx.skillCDs = {};
        ctx.buffs = { player: {}, enemy: {} };

        // 3. 【核心修复】初始化词条系统 (直接读取装备对象上的 entries)
        ctx.entries = {
            player: this._collectPlayerEntries(),
            enemy: ctx.enemy.entries || []
        };

        // 同步数值
        const p = ctx.player.derived || ctx.player.attributes;
        ctx.currentPHp = p.hp !== undefined ? p.hp : (p.maxHp || 100);
        ctx.currentPMp = p.mp !== undefined ? p.mp : (p.maxMp || 100);

        const eStats = ctx.enemy.stats || {};
        ctx.currentEHp = eStats.hp !== undefined ? eStats.hp : (ctx.enemy.hp || 100);
        ctx.enemy.maxHp = ctx.currentEHp;

        ctx.currentTurn = 1;

        // 4. UI 初始渲染
        if (ctx._refreshItemCDUI) ctx._refreshItemCDUI();
        if (ctx._refreshSkillCDUI) ctx._refreshSkillCDUI();
        if (ctx._updateToxUI) ctx._updateToxUI();
        if (ctx._updateUIStats) ctx._updateUIStats();

        // 5. 初始化战斗核心数据
        if (window.CombatCore && CombatCore.init) {
            CombatCore.init(ctx);
        }

        // 6. 启动循环
        ctx.timer = setTimeout(() => {
            if (window.CombatCore && CombatCore.startLoop) {
                CombatCore.startLoop(ctx);
            }
        }, 500);
    },

    /** 【新增】收集玩家所有装备的词条 */
    /** * 【修改】收集玩家所有装备的词条
     * 逻辑：直接读取 equipment 中对象的 entries 字段
     */
    _collectPlayerEntries: function() {
        const p = window.player;
        if (!p || !p.equipment) return [];

        let allEntries = [];

        // 遍历所有装备槽 (weapon: Object, gongfa: Array, etc.)
        Object.values(p.equipment).forEach(item => {
            if (!item) return;

            // 情况1: item 是直接的物品对象 (如 weapon: { id:..., entries:[...] })
            // 必须排除数组，因为 Array 也有 entries 方法(迭代器)，但不是我们要的属性
            if (!Array.isArray(item) && item.entries && Array.isArray(item.entries)) {
                allEntries = allEntries.concat(item.entries);
            }

            // 情况2: item 是数组 (如 gongfa: [obj1, obj2])
            // 如果未来功法也实例化为对象存在数组里，这里可以支持
            if (Array.isArray(item)) {
                item.forEach(subItem => {
                    if (subItem && typeof subItem === 'object' && subItem.entries && Array.isArray(subItem.entries)) {
                        allEntries = allEntries.concat(subItem.entries);
                    }
                });
            }
        });

        return allEntries;
    },

    /** 敌人数据补丁 */
    _patchEnemyData: function(enemy) {
        // 1. 获取模板数据
        const tmplKey = enemy.template || "minion";
        const templateData = (typeof ENEMY_TEMPLATES !== 'undefined') ? ENEMY_TEMPLATES[tmplKey] : null;

        // 2. 准备自身数值 (优先取外层，没有则取stats层，防止undefined)
        // 注意：这里我们假设传入的 enemy 是原始数据的拷贝，尚未被修改过
        const selfBasePen = (enemy.basePen !== undefined) ? enemy.basePen : (enemy.stats && enemy.stats.basePen !== undefined ? enemy.stats.basePen : 0);
        const selfAcc = (enemy.accuracy !== undefined) ? enemy.accuracy : (enemy.stats && enemy.stats.accuracy !== undefined ? enemy.stats.accuracy : 0);
        const selfCrit = (enemy.crit !== undefined) ? enemy.crit : (enemy.stats && enemy.stats.crit !== undefined ? enemy.stats.crit : 0);

        // 3. 准备模板数值
        const tmplBasePen = templateData ? (templateData.basePen || 0) : 0;
        const tmplAcc = templateData ? (templateData.accuracy || 0) : 0;
        const tmplCrit = templateData ? (templateData.crit || 0) : 0;

        // 4. 执行叠加 (自身 + 模板)
        enemy.basePen = selfBasePen + tmplBasePen;
        enemy.accuracy = selfAcc + tmplAcc;
        // 暴击率防止浮点数精度问题，保留4位小数
        enemy.crit = parseFloat((selfCrit + tmplCrit).toFixed(4));

        // 5. 确保 stats 对象存在并同步基础属性
        if (!enemy.stats) enemy.stats = {};

        if (enemy.atk !== undefined && enemy.stats.atk === undefined) enemy.stats.atk = enemy.atk;
        if (enemy.def !== undefined && enemy.stats.def === undefined) enemy.stats.def = enemy.def;
        if (enemy.speed !== undefined && enemy.stats.speed === undefined) enemy.stats.speed = enemy.speed;
        if (enemy.phy_atk !== undefined && enemy.stats.phy_atk === undefined) enemy.stats.phy_atk = enemy.phy_atk;
        if (enemy.mag_atk !== undefined && enemy.stats.mag_atk === undefined) enemy.stats.mag_atk = enemy.mag_atk;
        if (enemy.phy_def !== undefined && enemy.stats.phy_def === undefined) enemy.stats.phy_def = enemy.phy_def;
        if (enemy.mag_def !== undefined && enemy.stats.mag_def === undefined) enemy.stats.mag_def = enemy.mag_def;

        // 6. 将计算后的最终属性同步到 stats (覆盖)
        // 这样 CombatCalc 无论读 enemy.basePen 还是 enemy.stats.basePen 都是对的
        enemy.stats.basePen = enemy.basePen;
        enemy.stats.accuracy = enemy.accuracy;
        enemy.stats.crit = enemy.crit;

        // 7. 毒性攻击初始化
        enemy.toxAtk = enemy.toxAtk || 0;
    },

    /** 缓存 UI */
    _initUICache: function(ctx, logId) {
        ctx.uiRefs = {
            logContainer: document.getElementById(logId),
            pHp: document.getElementById('combat_p_hp'),
            pHpBar: document.getElementById('combat_p_hp_bar'),
            pMp: document.getElementById('combat_p_mp'),
            pMpBar: document.getElementById('combat_p_mp_bar'),
            pToxBar: document.getElementById('combat_p_tox_bar'),
            pToxVal: document.getElementById('combat_p_tox_val'),
            pApBar: document.getElementById('combat_p_ap_bar'), // 行动条

            eHp: document.getElementById('combat_e_hp'),
            eHpBar: document.getElementById('combat_e_hp_bar'),
            eToxBar: document.getElementById('combat_e_tox_bar'),
            eToxVal: document.getElementById('combat_e_tox_val'),
            eApBar: document.getElementById('combat_e_ap_bar'), // 行动条

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

    /** 注入样式 (Tooltips等) */
    _injectStyles: function() {
        if (document.getElementById('combat-styles-v7-7')) return;
        const css = `
            .turn-divider { margin:8px 0; border-top:1px dashed #ccc; color:#888; font-size:12px; text-align:center; } 
            .combat-tooltip-trigger { display: inline-block; position: relative; cursor: help; } 
            /* 注意：现在主要使用全局 TooltipManager，这里的 CSS 仅作备用或用于简单的内部提示 */
        `;
        const style = document.createElement('style');
        style.id = 'combat-styles-v7-7';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
};