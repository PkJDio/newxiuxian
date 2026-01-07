// js/modules/ui.js - 核心界面交互 (修复：Buff小数位与详情显示)
console.log("加载 界面交互 (Fix Buff Display)")

/* ================= 界面交互逻辑 ================= */

function enterGameScene() {
    const menu = document.getElementById('scene_menu');
    const game = document.getElementById('scene_game');

    if (menu && game) {
        menu.classList.remove('active');
        game.classList.add('active');
        updateUI();
    }

    if (window.initMap) window.initMap();
}

function updateUI() {
    if (!player) return;

    // 【修复1】数据源清洗：强制将 Buff 的剩余天数保留1位小数
    // 这能解决首页属性悬浮框里显示 "剩余 0.6546415477 天" 的问题
    if (player.buffs) {
        for (let id in player.buffs) {
            let b = player.buffs[id];
            if (typeof b.days === 'number') {
                // 使用 parseFloat 避免变成字符串影响计算，保留1位小数
                b.days = parseFloat(b.days.toFixed(1));
            }
        }
    }

    if (typeof recalcStats === 'function') {
        recalcStats();
    }

    const updateVal = (id, key, label) => {
        const el = document.getElementById(id);
        if (!el) return;
        const val = player.derived[key] || 0;
        el.innerText = Math.floor(val);
        el.onmouseenter = (e) => { if(window.showStatusTooltip) window.showStatusTooltip(e, key, label); };
        el.onmouseleave = () => { if(window.hideTooltip) window.hideTooltip(); };
    };

    if(document.getElementById('profile_name')) document.getElementById('profile_name').innerText = player.name;
    if(document.getElementById('profile_age')) document.getElementById('profile_age').innerText = player.age + "岁";
    if(document.getElementById('profile_generation')) document.getElementById('profile_generation').innerText = `第 ${player.generation || 1} 世`;

    updateVal('val_jing', 'jing', '精(体质)');
    updateVal('val_qi',   'qi',   '气(能量)');
    updateVal('val_shen', 'shen', '神(悟性)');
    updateVal('val_atk',   'atk',   '攻击力');
    updateVal('val_def',   'def',   '防御力');
    updateVal('val_speed', 'speed', '速度');

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

    const elDate = document.getElementById('profile_date');
    if (elDate && window.TimeSystem) {
        elDate.innerText = TimeSystem.getTimeString();
    }

    if(document.getElementById('val_money')) document.getElementById('val_money').innerText = player.money;

    renderBuffs();
}

/**
 * 【新增】自定义 Buff 悬浮窗显示函数
 * 用于显示系统自带的 Buff（如疲劳、剧毒），因为它们没有物品 ID
 */
function showLocalBuffTooltip(e, buffData) {
    if (!window.UtilsTip || !window.UtilsTip.showTooltip) return;

    // 构建提示内容
    const color = buffData.isDebuff ? "#ff5252" : "#69f0ae";
    let html = `<div style="padding:4px;">`;
    html += `<div style="font-weight:bold; color:${color}; font-size:14px; margin-bottom:4px;">${buffData.name}</div>`;
    html += `<div style="font-size:12px; color:#ccc;">剩余时间: <span style="color:#fff">${buffData.days}</span> 天</div>`;
    html += `<div style="margin-top:4px; font-size:12px;">影响: <span style="color:${color}">${buffData.attr} ${buffData.val}</span></div>`;

    if (buffData.desc) {
        html += `<div style="margin-top:6px; font-size:12px; color:#aaa; font-style:italic; border-top:1px dashed #555; padding-top:4px;">${buffData.desc}</div>`;
    }
    html += `</div>`;

    // 调用通用的显示函数 (假设 UtilsTip.showTooltip 接受 HTML 内容)
    // 如果 UtilsTip 没有暴露，我们尝试直接调用全局挂载的
    if (window.showSimpleTooltip) {
        window.showSimpleTooltip(e, html);
    } else if (window.showTooltipContent) { // 兼容旧版
        window.showTooltipContent(e, html);
    } else {
        // 兜底：直接构建一个临时的
        const tooltip = document.getElementById('tooltip') || document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.innerHTML = html;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
        if(!document.getElementById('tooltip')) document.body.appendChild(tooltip);
    }
}

/**
 * 渲染状态栏的所有加成项
 */
function renderBuffs() {
    const containerId = 'buff_list';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    // 强制样式
    container.style.display = 'block';
    container.style.marginTop = '10px';
    container.style.maxHeight = '250px';
    container.style.overflowY = 'auto';
    container.style.overflowX = 'hidden';
    container.style.paddingRight = '5px';
    container.style.borderTop = '1px solid rgba(0,0,0,0.1)';
    container.style.paddingTop = '5px';

    const entries = [];

    // 辅助函数：添加条目
    const addEntry = (sourceName, attrKey, val, colorHex, itemId = null, customBuffData = null) => {
        if (!val || val === 0) return;
        const attrName = (window.ATTR_MAPPING && window.ATTR_MAPPING[attrKey]) ? window.ATTR_MAPPING[attrKey] : attrKey;
        const valStr = val > 0 ? `+${val}` : `${val}`;

        entries.push({
            source: sourceName,
            attr: attrName,
            val: valStr,
            color: colorHex,
            itemId: itemId,
            buffData: customBuffData // 【新增】携带原始Buff数据
        });
    };

    // 1. 装备
    if (player.equipment) {
        const equipSlots = ['weapon', 'head', 'body', 'feet', 'mount', 'tool', 'fishing_rod'];
        equipSlots.forEach(slot => {
            const itemId = player.equipment[slot];
            if (itemId) {
                const item = GAME_DB.items.find(i => i.id === itemId);
                if (item) {
                    const stats = item.stats || item.effects || {};
                    for (let key in stats) {
                        if (typeof stats[key] === 'number') {
                            addEntry(item.name, key, stats[key], '#2196f3', itemId);
                        }
                    }
                }
            }
        });
    }

    // 2. 功法
    ['gongfa_ext', 'gongfa_int'].forEach(type => {
        const list = player.equipment[type];
        if (Array.isArray(list)) {
            list.forEach(skillId => {
                if (!skillId) return;
                if (window.UtilsSkill) {
                    const info = UtilsSkill.getSkillInfo(skillId);
                    if (info && info.finalEffects) {
                        for (let key in info.finalEffects) {
                            if (typeof info.finalEffects[key] === 'number') {
                                addEntry(info.name, key, info.finalEffects[key], '#d4af37', skillId);
                            }
                        }
                    }
                } else {
                    const item = GAME_DB.items.find(i => i.id === skillId);
                    if (item && item.effects) {
                        for (let key in item.effects) {
                            if (typeof item.effects[key] === 'number') {
                                addEntry(item.name, key, item.effects[key], '#d4af37', skillId);
                            }
                        }
                    }
                }
            });
        }
    });

    // 3. 临时 Buff (修复显示问题)
    if (player.buffs) {
        for (let id in player.buffs) {
            const b = player.buffs[id];
            if (b.days > 0 && b.val) {
                let name = b.name || "状态";
                let itemId = null;

                // 尝试关联物品
                const item = GAME_DB.items.find(i => i.id === id);
                if (item) {
                    name = item.name;
                    itemId = id;
                }

                let color = b.color;
                if (!color) {
                    const isNegative = typeof b.val === 'number' ? b.val < 0 : String(b.val).includes('-');
                    color = isNegative ? '#d32f2f' : '#4caf50';
                }

                // 传递整个 buff 对象，以便后续显示详情
                addEntry(name, b.attr, b.val, color, itemId, b);
            }
        }
    }

    // 4. 永久属性
    if (player.exAttr) {
        for (let key in player.exAttr) {
            addEntry("永久加成", key, player.exAttr[key], '#9c27b0');
        }
    }

    // 5. 轮回
    if (player.bonus_stats) {
        for (let key in player.bonus_stats) {
            addEntry("轮回底蕴", key, player.bonus_stats[key], '#e91e63');
        }
    }

    if (entries.length === 0) {
        container.innerHTML = '<div style="color:#ccc; font-size:12px; padding:5px;">暂无加成</div>';
        return;
    }

    entries.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = `
            font-size: 13px; 
            display: flex; 
            align-items: center; 
            padding: 4px 0; 
            border-bottom: 1px dashed rgba(0,0,0,0.05);
            cursor: default;
            width: 100%;
        `;

        row.innerHTML = `
            <span style="font-weight:bold; color:${item.color}; margin-right:6px; min-width:60px;">${item.source}</span>
            <span style="color:#666;">${item.attr}</span>
            <span style="font-weight:bold; color:${item.color}; margin-left: auto;">${item.val}</span>
        `;

        // 【核心修复】Tooltips 绑定逻辑
        if (item.itemId) {
            // 如果是物品/技能，显示对应的 Tooltip
            if (player.skills && player.skills[item.itemId]) {
                row.onmouseenter = (e) => showSkillTooltip(e, item.itemId);
            } else {
                row.onmouseenter = (e) => showItemTooltip(e, item.itemId);
            }
        } else if (item.buffData) {
            // 【新增】如果是纯状态Buff（无物品ID），显示自定义 Tooltip
            row.onmouseenter = (e) => showLocalBuffTooltip(e, item.buffData);
        }

        if (item.itemId || item.buffData) {
            row.onmouseleave = () => hideTooltip();
            row.onmousemove = (e) => moveTooltip(e);
            row.style.cursor = "help";
        }

        container.appendChild(row);
    });
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

window.updateUI = updateUI;
window.renderBuffs = renderBuffs;
window.enterGameScene = enterGameScene;
window.showChangelogModal = showChangelogModal;
window.showGalleryModal = showGalleryModal;