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

    console.groupCollapsed("[UI] 开始渲染 Buff");

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
        console.log("检测到 player.buffs 数据:", player.buffs);

        // 兼容数组或对象
        if (Array.isArray(player.buffs)) {
            player.buffs.forEach((b, index) => {
                console.log(`检查 Buff [数组索引 ${index}]:`, b);
                if (b.days > 0 && b.val !== 0) {
                    let name = b.name || "临时状态"; // 优先读取 buff 对象里的 name
                    addEntry(name, b.attr, b.val, '#4caf50');
                    console.log(`=> 已添加显示: ${name} ${b.attr} ${b.val}`);
                } else {
                    console.log(`=> 跳过: days=${b.days}, val=${b.val}`);
                }
            });
        } else {
            // 对象结构 { "item_id": { attr, val, days } }
            for(let id in player.buffs) {
                const b = player.buffs[id];
                console.log(`检查 Buff [Key ${id}]:`, b);

                if(b.days > 0 && b.val !== 0) {
                    let name = "状态";
                    // 尝试从 ID 反查物品名
                    const item = GAME_DB.items.find(i => i.id === id);
                    if(item) name = item.name;

                    addEntry(name, b.attr, b.val, '#4caf50', id);
                    console.log(`=> 已添加显示: ${name} ${b.attr} ${b.val}`);
                } else {
                    console.log(`=> 跳过: days=${b.days}, val=${b.val}`);
                }
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

    console.log("最终生成的列表项:", entries);
    console.groupEnd();

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