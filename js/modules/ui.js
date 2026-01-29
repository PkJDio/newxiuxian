// js/modules/ui.js - 核心界面交互 (DOM Cache + RAF 优化版)

// 简单的 DOM 缓存池，避免高频 getElementById
const _domCache = {};
function getEl(id) {
    if (!_domCache[id]) {
        _domCache[id] = document.getElementById(id);
    }
    return _domCache[id];
}

/* ================= 界面交互逻辑 ================= */

function enterGameScene() {
    const menu = getEl('scene_menu');
    const game = getEl('scene_game');

    if (menu && game) {
        menu.classList.remove('active');
        game.classList.add('active');
        updateUI();

        // 确保 Buff 列表容器已初始化事件委托
        initBuffListEvents();
    }

    if (window.initMap) window.initMap();

    // 【新增】点击后播放音乐
    if (window.UtilsAudio) {
        window.UtilsAudio.playBgm();
    }
}

// 使用 requestAnimationFrame 防抖，防止同一帧多次调用
let _pendingUpdate = false;

function updateUI() {
    if (_pendingUpdate) return;
    _pendingUpdate = true;

    requestAnimationFrame(() => {
        _doUpdateUI();
        _pendingUpdate = false;
    });
}

function _doUpdateUI() {
    if (!player) return;

    // 1. 数据源清洗 (保持原有逻辑)
    if (player.buffs) {
        for (let id in player.buffs) {
            let b = player.buffs[id];
            if (typeof b.days === 'number') {
                b.days = parseFloat(b.days.toFixed(1));
            }
        }
    }

    // 2. 重新计算属性 (保持原有逻辑)
    if (typeof recalcStats === 'function') {
        recalcStats();
    }

    // --- 内部更新工具 (使用缓存) ---
    const updateVal = (id, key, label) => {
        const el = getEl(id);
        if (!el) return;
        const val = player.derived[key] || 0;
        // 只有数值变化时才更新 DOM，进一步减少重绘
        const newVal = Math.floor(val).toString();
        if (el._lastVal !== newVal) {
            el.innerText = newVal;
            el._lastVal = newVal;
        }
        // 绑定事件只需一次，检查标记
        if (!el._hasTooltipEvent) {
            el.onmouseenter = (e) => { if(window.showStatusTooltip) window.showStatusTooltip(e, key, label); };
            el.onmouseleave = () => { if(window.hideTooltip) window.hideTooltip(); };
            el._hasTooltipEvent = true;
        }
    };

    const updatePct = (id, key, label) => {
        const el = getEl(id);
        if (!el) return;
        const val = player.derived[key] || 0;
        const newVal = Math.floor(val) + '%';
        if (el._lastVal !== newVal) {
            el.innerText = newVal;
            el._lastVal = newVal;
        }
    };

    // --- 3. 更新 角色名片 ---
    const elName = getEl('profile_name'); if(elName) elName.innerText = player.name;
    const elAge = getEl('profile_age'); if(elAge) elAge.innerText = player.age + "岁";
    const elGen = getEl('profile_generation'); if(elGen) elGen.innerText = `第 ${player.generation || 1} 世`;

    const elDate = getEl('profile_date');
    if (elDate && window.TimeSystem) {
        elDate.innerText = TimeSystem.getTimeString();
    }

    // --- 4. 更新 基础属性 ---
    updateVal('val_jing', 'jing', '精(体质)');
    updateVal('val_qi',   'qi',   '气(能量)');
    updateVal('val_shen', 'shen', '神(悟性)');

    const elMoney = getEl('ui_money');
    if (elMoney) elMoney.innerText = `💰钱财 ${player.money || 0}`;

    // 灵气值
    const spiritEl = getEl('ui_spirit');
    if (spiritEl) {
        const hasSpiritBag = player.inventory && player.inventory.some(item => item.id === 'spiritItem_001');
        if (hasSpiritBag) {
            spiritEl.style.display = 'inline';
            spiritEl.innerText = `🌌灵气 ${player.spiritEnergy || 0}`;
        } else {
            spiritEl.style.display = 'none';
        }
    }

    // --- 5. 更新 战斗综述 ---
    const totalAtk = (player.derived.phy_atk || 0) + (player.derived.mag_atk || 0);
    const totalDef = (player.derived.phy_def || 0) + (player.derived.mag_def || 0);

    const elSumAtk = getEl('val_atk');
    if (elSumAtk) elSumAtk.innerText = Math.floor(totalAtk);

    const elSumDef = getEl('val_def');
    if (elSumDef) elSumDef.innerText = Math.floor(totalDef);

    updateVal('val_speed', 'speed', '速度');

    // --- 6. 更新 战斗详情 ---
    updateVal('val_phy_atk', 'phy_atk', '物理攻击');
    updateVal('val_mag_atk', 'mag_atk', '法术攻击');
    updateVal('val_phy_def', 'phy_def', '物理防御');
    updateVal('val_mag_def', 'mag_def', '法术防御');

    updatePct('val_crit',     'crit',     '物理暴击率');
    updatePct('val_mag_crit', 'mag_crit', '法术暴击率');

    updateVal('val_sharpness',   'sharpness',   '锋利度');
    updateVal('val_penetration', 'penetration', '灵透度');

    // --- 7. 更新 生存状态条 ---
    const setBar = (idVal, current, max, label) => {
        const el = getEl(idVal);
        if(el) {
            const newVal = `${Math.floor(current)}/${Math.floor(max)}`;
            if (el._lastVal !== newVal) {
                el.innerText = newVal;
                el._lastVal = newVal;
            }
            if (!el._hasTooltipEvent) {
                el.onmouseenter = (e) => { if(window.showStatusTooltip) window.showStatusTooltip(e, label, '上限详情'); };
                el.onmouseleave = () => { if(window.hideTooltip) window.hideTooltip(); };
                el._hasTooltipEvent = true;
            }
        }
    };
    setBar('val_hp', player.status.hp, player.derived.hpMax, 'hpMax');
    setBar('val_mp', player.status.mp, player.derived.mpMax, 'mpMax');
    setBar('val_hunger', player.status.hunger, player.derived.hungerMax, 'hungerMax');

    const fatigue = player.status.fatigue || 0;
    const maxFatigue = player.derived.fatigueMax || 100;
    setBar('val_fatigue', fatigue, maxFatigue, 'fatigueMax');

    // --- 8. 其他组件渲染 ---
    renderBuffs();
    updateMarketButtonState();
    if(window.twemoji) twemoji.parse(document.body);
}

/**
 * 初始化 Buff 列表的事件委托
 */
function initBuffListEvents() {
    const container = getEl('buff_list');
    if (!container || container.dataset.hasDelegatedEvent) return;

    container.dataset.hasDelegatedEvent = "true";

    container.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip-type]');
        if (!target) return;

        const type = target.dataset.tooltipType;
        const id = target.dataset.tooltipId;

        if (type === 'item') {
            if (window.showItemTooltip) window.showItemTooltip(e, id);
        } else if (type === 'skill') {
            if (window.showSkillTooltip) window.showSkillTooltip(e, id);
        } else if (type === 'buff') {
            showLocalBuffTooltip(e, id);
        }
    });

    container.addEventListener('mouseout', () => {
        if (window.TooltipManager) window.TooltipManager.hide();
    });
    container.addEventListener('mousemove', (e) => {
        if (window.TooltipManager) window.TooltipManager._move(e);
    });
}

function showLocalBuffTooltip(e, buffId) {
    if (!buffId) return;
    if (window.showStatusTooltip) {
        window.showStatusTooltip(buffId, e);
    } else if (window.TooltipManager && window.player.buffs[buffId]) {
        window.TooltipManager.showStatus(buffId, e);
    }
}

/**
 * 渲染状态栏的所有加成项
 */
function renderBuffs() {
    const container = getEl('buff_list');
    if (!container) return;

    initBuffListEvents();

    const entries = [];
    const ATTR_MAP = window.ATTR_MAPPING || {}; // 缓存引用

    const collectEntry = (sourceName, attrKey, val, colorHex, type, id) => {
        if (!val || val === 0) return;
        const attrName = ATTR_MAP[attrKey] || attrKey;

        let valStr = "";
        if (attrKey === 'studyEff') {
            const pct = Math.round(parseFloat(val) * 100);
            valStr = (pct > 0 ? "+" : "") + pct + "%";
        } else {
            valStr = val > 0 ? `+${val}` : `${val}`;
        }

        entries.push({
            source: sourceName,
            attr: attrName,
            val: valStr,
            color: colorHex,
            type: type,
            id: id
        });
    };

    // 1. 装备
    if (player.equipment) {
        const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'tool', 'fishing_rod'];
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const itemId = player.equipment[slot];
            if (itemId) {
                // 这里如果 GAME_DB 很大会慢，可以考虑用 Map 优化查找，但这里暂保持原样
                const item = GAME_DB.items.find(i => i.id === itemId);
                if (item) {
                    const stats = item.stats || item.effects || {};
                    for (let key in stats) {
                        if (typeof stats[key] === 'number')
                            collectEntry(item.name, key, stats[key], RARITY_CONFIG[item.rarity].color, 'item', itemId);
                    }
                }
            }
        }
    }

    // 2. 功法
    if (player.equipment && player.equipment['gongfa'] && Array.isArray(player.equipment['gongfa'])) {
        for (let i = 0; i < player.equipment['gongfa'].length; i++) {
            const skillId = player.equipment['gongfa'][i];
            if (!skillId) continue;
            const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(skillId) : null;
            if (info && info.finalEffects) {
                for (let key in info.finalEffects) {
                    if (typeof info.finalEffects[key] === 'number')
                        collectEntry(info.name, key, info.finalEffects[key], '#d4af37', 'skill', skillId);
                }
            }
        }
    }

    // 3. 临时 Buff
    if (player.buffs) {
        for (let id in player.buffs) {
            const b = player.buffs[id];
            if (b.days > 0) {
                let color = b.color || (b.isDebuff ? '#d32f2f' : '#4caf50');
                collectEntry(b.name || "状态", b.attr, b.val, color, 'buff', id);
            }
        }
    }

    if (entries.length === 0) {
        container.innerHTML = '<div style="color:#ccc; font-size:12px; padding:5px;">暂无加成</div>';
        return;
    }

    // 使用数组 join 一次性生成 HTML
    const htmlParts = new Array(entries.length);
    for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        htmlParts[i] = `
        <div class="buff_row" 
             data-tooltip-type="${item.type}" 
             data-tooltip-id="${item.id}"
             style="font-size:13px; display:flex; align-items:center; padding:4px 0; border-bottom:1px dashed rgba(0,0,0,0.05); cursor:help; width:100%; box-sizing: border-box;">
            <span style="font-weight:bold; color:${item.color}; margin-right:6px; min-width:60px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.source}</span>
            <span style="color:#666; white-space:nowrap;">${item.attr}</span>
            <span style="font-weight:bold; color:${item.color}; margin-left: auto;">${item.val}</span>
        </div>`;
    }
    container.innerHTML = htmlParts.join('');
}

function showChangelogModal() {
    const title = "更新日志";
    const content = `...`;
    if (window.showGeneralModal) window.showGeneralModal(title, content);
}

function showGalleryModal() {
    const title = "万物图鉴";
    let html = `<div class="pictorial_container">`;
    if (!GAME_DB.items || GAME_DB.items.length === 0) {
        html += `<div class="pictorial_empty">暂无收录物品数据...</div>`;
    } else {
        // 使用 map + join 优化循环拼接
        html += GAME_DB.items.map(item => {
            const color = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
            const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
            const typeName = (typeof TYPE_MAPPING !== 'undefined' ? TYPE_MAPPING[item.type] : item.type) || '未知';
            return `
            <div class="pictorial_card"
                 onmouseenter="showGalleryTooltip(event, '${item.id}', null, 'gallery')"
                 onmouseleave="hideTooltip()"
                 onmousemove="moveTooltip(event)">
                <div class="pictorial_icon">${icon}</div>
                <div class="pictorial_name" style="color:${color};">${item.name}</div>
                <div class="pictorial_type">${typeName}</div>
            </div>`;
        }).join('');
    }
    html += `</div>`;
    if (window.showGeneralModal) window.showGeneralModal(title, html, null, "modal_gallery_box");
}

function updateMarketButtonState() {
    const btn = getEl('btn_action_market');
    if (!btn) return;

    let inTown = false;
    if (player.location && window.WORLD_TOWNS) {
        const locationId = player.location;
        // 查找操作如果 towns 很多，可以考虑 Map 优化
        const town = WORLD_TOWNS.find(t => t.id === locationId);
        if (town) inTown = true;
    }

    if (inTown) {
        btn.disabled = false;
        btn.classList.remove('btn_disabled');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.classList.add('btn_disabled');
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}


window.parseEmoji = function(element) {
    if (window.twemoji) {
        window.twemoji.parse(element, {
            base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
        });
    }
};

// 挂载
window.updateMarketButtonState = updateMarketButtonState;
window.updateUI = updateUI;
window.renderBuffs = renderBuffs;
window.enterGameScene = enterGameScene;
window.showChangelogModal = showChangelogModal;
window.showGalleryModal = showGalleryModal;


