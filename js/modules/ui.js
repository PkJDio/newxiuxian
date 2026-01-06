// js/modules/ui.js - 核心界面交互 (带详细调试日志)
console.log("加载 界面交互")

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

    // 更新疲劳度 (新增)
    const fatigue = player.status.fatigue || 0;
    const maxFatigue = player.derived.fatigueMax || 100;
    setBar('val_fatigue', fatigue, maxFatigue, 'fatigueMax');

    // 【核心修改】更新时间显示
    const elDate = document.getElementById('profile_date');
    if (elDate && window.TimeSystem) {
        elDate.innerText = TimeSystem.getTimeString();
    }


    if(document.getElementById('val_money')) document.getElementById('val_money').innerText = player.money;

    renderBuffs();
}

/**
 * 渲染状态栏的所有加成项
 */
function renderBuffs() {
    const containerId = 'buff_list';
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`[UI] 未找到容器 #${containerId}，无法渲染 Buff 列表`);
        return;
    }

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

    const addEntry = (sourceName, attrKey, val, colorHex, itemId = null) => {
        if (!val || val === 0) return;
        const attrName = (window.ATTR_MAPPING && window.ATTR_MAPPING[attrKey]) ? window.ATTR_MAPPING[attrKey] : attrKey;
        const valStr = val > 0 ? `+${val}` : `${val}`;

        entries.push({
            source: sourceName,
            attr: attrName,
            val: valStr,
            color: colorHex,
            itemId: itemId
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

    // 3. 临时 Buff (详细调试)
    if (player.buffs) {
        // 兼容对象结构 { "buff_id": { attr, val, days, name... } }
        for (let id in player.buffs) {
            const b = player.buffs[id];

            // 过滤无效Buff
            if (b.days > 0 && b.val) {

                // 【核心修改】优先读取 buff 对象自带的 name，如果没有才显示 "状态"
                let name = b.name || "状态";

                // 如果名字是默认的"状态"，尝试通过ID反查物品名（兼容旧逻辑：吃丹药产生的buff）
                if (name === "状态") {
                    const item = GAME_DB.items.find(i => i.id === id);
                    if (item) name = item.name;
                }

                // 定义颜色：优先用 buff 自带颜色，否则根据正负值决定 (绿/红)
                // 疲劳/饥饿 Buff 在 time.js 里我们定义了 color: "#d32f2f"
                let color = b.color;
                if (!color) {
                    // 简单的自动颜色逻辑：字符串包含'-'或者是负数显示红色，否则绿色
                    const isNegative = typeof b.val === 'number' ? b.val < 0 : String(b.val).includes('-');
                    color = isNegative ? '#d32f2f' : '#4caf50';
                }

                // 渲染条目
                // 注意：这里把 id 传进去，方便鼠标悬浮看详情
                addEntry(name, b.attr, b.val, color, id);
            }
        }
    } else {
        console.log("player.buffs 为空或 undefined");
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
            <span style="font-weight:bold; color:#333; margin-left: auto;">${item.val}</span>
        `;

        if (item.itemId) {
            if (player.skills && player.skills[item.itemId]) {
                row.onmouseenter = (e) => showSkillTooltip(e, item.itemId);
            } else {
                row.onmouseenter = (e) => showItemTooltip(e, item.itemId);
            }
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