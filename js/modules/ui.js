// js/modules/ui.js - 核心界面交互 (性能优化版)
// 优化内容：
// 1. renderBuffs 改用 HTML 字符串拼接，消除高频 DOM 创建
// 2. 使用事件委托处理 Tooltip，消除闭包内存泄漏
// 3. 修复 Buff 小数位显示问题
// 4. 修复 studyEff 百分比显示
// 5. 【修复】确保 HTML 字符串中包含 data-tooltip 属性

//console.log("加载 界面交互 (Performance Optimized)")

/* ================= 界面交互逻辑 ================= */

function enterGameScene() {
    const menu = document.getElementById('scene_menu');
    const game = document.getElementById('scene_game');

    if (menu && game) {
        menu.classList.remove('active');
        game.classList.add('active');
        updateUI();

        // 确保 Buff 列表容器已初始化事件委托
        initBuffListEvents();
    }

    if (window.initMap) window.initMap();
}

function updateUI() {
    if (!player) return;

    // 1. 数据源清洗
    if (player.buffs) {
        for (let id in player.buffs) {
            let b = player.buffs[id];
            if (typeof b.days === 'number') {
                b.days = parseFloat(b.days.toFixed(1));
            }
        }
    }

    // 2. 重新计算属性
    if (typeof recalcStats === 'function') {
        recalcStats();
    }

    // --- 内部更新工具 ---
    const updateVal = (id, key, label) => {
        const el = document.getElementById(id);
        if (!el) return;
        const val = player.derived[key] || 0;
        el.innerText = Math.floor(val);
        el.onmouseenter = (e) => { if(window.showStatusTooltip) window.showStatusTooltip(e, key, label); };
        el.onmouseleave = () => { if(window.hideTooltip) window.hideTooltip(); };
    };

    const updatePct = (id, key, label) => {
        const el = document.getElementById(id);
        if (!el) return;
        const val = player.derived[key] || 0;
        el.innerText = Math.floor(val) + '%';
    };

    // --- 3. 更新 角色名片 ---
    if(document.getElementById('profile_name')) document.getElementById('profile_name').innerText = player.name;
    if(document.getElementById('profile_age')) document.getElementById('profile_age').innerText = player.age + "岁";
    if(document.getElementById('profile_generation')) document.getElementById('profile_generation').innerText = `第 ${player.generation || 1} 世`;
    const elDate = document.getElementById('profile_date');
    if (elDate && window.TimeSystem) {
        elDate.innerText = TimeSystem.getTimeString();
    }

    // --- 4. 更新 基础属性 (精气神 & 钱) ---
    updateVal('val_jing', 'jing', '精(体质)');
    updateVal('val_qi',   'qi',   '气(能量)');
    updateVal('val_shen', 'shen', '神(悟性)');
    // ----------------------------------------------------
    // 1. 找到更新金钱的代码 (通常在函数前部)
    // ----------------------------------------------------
    if (document.getElementById('ui_money')) {
        document.getElementById('ui_money').innerText = `💰钱财 ${player.money || 0}`;
    }

    // ----------------------------------------------------
    // 【新增】灵气值显示逻辑
    // ----------------------------------------------------
    const spiritEl = document.getElementById('ui_spirit');
    if (spiritEl) {
        // 1. 检查背包里是否有 ID 为 "spiritItem_001" 的灵气袋
        // 使用 try-catch 或可选链防止 player.inventory 未定义报错
        const hasSpiritBag = player.inventory && player.inventory.some(item => item.id === 'spiritItem_001');

        if (hasSpiritBag) {
            // 有灵气袋：显示灵气值
            spiritEl.style.display = 'inline';
            // 确保 player.spiritEnergy 存在，没有就显示 0
            spiritEl.innerText = `🌌灵气 ${player.spiritEnergy || 0}`;
        } else {
            // 没有灵气袋：隐藏
            spiritEl.style.display = 'none';
        }
    }
    // ----------------------------------------------------
    // --- 5. 【核心修改】更新 战斗综述 (折叠栏头部 - 显示总和) ---
    // 计算总攻击 (物理 + 法术)
    const totalAtk = (player.derived.phy_atk || 0) + (player.derived.mag_atk || 0);
    // 计算总防御 (物理 + 法术)
    const totalDef = (player.derived.phy_def || 0) + (player.derived.mag_def || 0);

    // 手动更新 DOM，而不是用 updateVal
    const elSumAtk = document.getElementById('val_atk');
    if (elSumAtk) elSumAtk.innerText = Math.floor(totalAtk);

    const elSumDef = document.getElementById('val_def');
    if (elSumDef) elSumDef.innerText = Math.floor(totalDef);

    // 速度保持原样 (recalcStats 会保证它不为负)
    updateVal('val_speed', 'speed',   '速度');

    // --- 6. 更新 战斗详情 (折叠栏内部 - 详细拆分) ---
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
        const el = document.getElementById(idVal);
        if(el) {
            el.innerText = `${Math.floor(current)}/${Math.floor(max)}`;
            el.onmouseenter = (e) => { if(window.showStatusTooltip) window.showStatusTooltip(e, label, '上限详情'); };
            el.onmouseleave = () => { if(window.hideTooltip) window.hideTooltip(); };
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
    twemoji.parse(document.body);
}

/**
 * 【优化】初始化 Buff 列表的事件委托
 * 只需调用一次，无需在每次 renderBuffs 时重复绑定
 */
function initBuffListEvents() {
    const container = document.getElementById('buff_list');
    if (!container || container.dataset.hasDelegatedEvent) return;

    container.dataset.hasDelegatedEvent = "true";

    // 绑定移入事件 (Tooltip)
    container.addEventListener('mouseover', (e) => {
        // 使用 closest 查找最近的带有 data-tooltip-type 的父元素（也就是我们生成的 div.buff_row）
        const target = e.target.closest('[data-tooltip-type]');
        if (!target) return;

        const type = target.dataset.tooltipType;
        const id = target.dataset.tooltipId;

        //console.log(`Tooltip Hover: type=${type}, id=${id}`); // 调试用

        if (type === 'item') {
            if (window.showItemTooltip) window.showItemTooltip(e, id);
        } else if (type === 'skill') {
            // 注意：showSkillTooltip 参数通常是 (e, id) 或者 (id, e)，根据你的 utils_tip.js 这里的调用方式
            // 如果 utils_tip.js 是 showSkill: function(e, skillId)，则此处正确
            // 如果是 showSkill: function(skillId, e)，则需要交换
            // 为了保险，大多数 tooltip 库第一个参数是 event
            if (window.showSkillTooltip) window.showSkillTooltip(e, id);
        } else if (type === 'buff') {
            // 处理本地 buff (如疲惫、受伤)
            // 调用下面定义的 helper 函数
            showLocalBuffTooltip(e, id);
        }
    });

    // 绑定移出和移动事件
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
        // 这里的参数顺序很重要，utils_tip.js 通常定义为 (id, e) 或 (e, id)
        // 根据通常习惯，showStatusTooltip(e, id, label) 或者 showStatusTooltip(id, e)
        // 假设 utils_tip.js 的签名是 showStatus(arg1, arg2)，支持 (id, e)
        window.showStatusTooltip(buffId, e);
    } else if (window.TooltipManager && window.player.buffs[buffId]) {
        window.TooltipManager.showStatus(buffId, e);
    }
}

/**
 * 渲染状态栏的所有加成项 (优化版)
 */
function renderBuffs() {
    const containerId = 'buff_list';
    const container = document.getElementById(containerId);
    if (!container) return;

    // 确保事件委托已初始化 (防止直接刷新页面未经过 enterGameScene)
    initBuffListEvents();

    const entries = [];

    // 辅助函数：收集数据但不创建 DOM
    const collectEntry = (sourceName, attrKey, val, colorHex, type, id) => {
        if (!val || val === 0) return;
        const attrName = (window.ATTR_MAPPING && window.ATTR_MAPPING[attrKey]) ? window.ATTR_MAPPING[attrKey] : attrKey;

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
            type: type, // 'item', 'skill', 'buff'
            id: id
        });
    };

    // 1. 装备
    if (player.equipment) {
        ['weapon', 'head', 'body', 'feet', 'mount', 'tool', 'fishing_rod'].forEach(slot => {
            const itemId = player.equipment[slot];
            if (itemId) {
                const item = GAME_DB.items.find(i => i.id === itemId);
                if (item) {
                    const stats = item.stats || item.effects || {};
                    for (let key in stats) {
                        if (typeof stats[key] === 'number')
                            collectEntry(item.name, key, stats[key], RARITY_CONFIG[item.rarity].color, 'item', itemId);
                    }
                }
            }
        });
    }

    // 2. 功法
    if (player.equipment && player.equipment['gongfa'] && Array.isArray(player.equipment['gongfa'])) {
        player.equipment['gongfa'].forEach(skillId => {
            if (!skillId) return;
            const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(skillId) : null;
            if (info && info.finalEffects) {
                for (let key in info.finalEffects) {
                    if (typeof info.finalEffects[key] === 'number')
                        collectEntry(info.name, key, info.finalEffects[key], '#d4af37', 'skill', skillId);
                }
            }
        });
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

    // 生成 HTML
    if (entries.length === 0) {
        container.innerHTML = '<div style="color:#ccc; font-size:12px; padding:5px;">暂无加成</div>';
        return;
    }

    // 【核心修复】添加 data-tooltip-type 和 data-tooltip-id 属性
    container.innerHTML = entries.map(item => `
        <div class="buff_row" 
             data-tooltip-type="${item.type}" 
             data-tooltip-id="${item.id}"
             style="font-size:13px; display:flex; align-items:center; padding:4px 0; border-bottom:1px dashed rgba(0,0,0,0.05); cursor:help; width:100%; box-sizing: border-box;">
            <span style="font-weight:bold; color:${item.color}; margin-right:6px; min-width:60px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.source}</span>
            <span style="color:#666; white-space:nowrap;">${item.attr}</span>
            <span style="font-weight:bold; color:${item.color}; margin-left: auto;">${item.val}</span>
        </div>
    `).join('');
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
        GAME_DB.items.forEach(item => {
            const color = (RARITY_CONFIG[item.rarity] || {}).color || '#333';
            const icon = (typeof getItemIcon === 'function' ? getItemIcon(item) : item.icon) || '📦';
            const typeName = (typeof TYPE_MAPPING !== 'undefined' ? TYPE_MAPPING[item.type] : item.type) || '未知';
            html += `
            <div class="pictorial_card"
                 onmouseenter="showGalleryTooltip(event, '${item.id}', null, 'gallery')"
                 onmouseleave="hideTooltip()"
                 onmousemove="moveTooltip(event)">
                <div class="pictorial_icon">${icon}</div>
                <div class="pictorial_name" style="color:${color};">${item.name}</div>
                <div class="pictorial_type">${typeName}</div>
            </div>`;
        });
    }
    html += `</div>`;
    if (window.showGeneralModal) window.showGeneralModal(title, html, null, "modal_gallery_box");
}
// 【新增】独立的状态更新函数
function updateMarketButtonState() {
    const btn = document.getElementById('btn_action_market');
    if (!btn) return;

    let inTown = false;

    // 检查当前位置是否在 WORLD_TOWNS 列表中
    if (player.location && window.WORLD_TOWNS) {
        const locationId = player.location;
        // 只要是在列表里的，都算城镇/村落
        const town = WORLD_TOWNS.find(t => t.id === locationId);
        if (town) {
            inTown = true;
        }
    }

    if (inTown) {
        btn.disabled = false;
        btn.classList.remove('btn_disabled');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.classList.add('btn_disabled'); // 配合 CSS 变灰
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

// 别忘了把新函数挂载出去，或者直接写在 updateUI 里
window.updateMarketButtonState = updateMarketButtonState;
window.updateUI = updateUI;
window.renderBuffs = renderBuffs;
window.enterGameScene = enterGameScene;
window.showChangelogModal = showChangelogModal;
window.showGalleryModal = showGalleryModal;