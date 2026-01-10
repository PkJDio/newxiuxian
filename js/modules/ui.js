// js/modules/ui.js - 核心界面交互 (修复：Buff小数位与详情显示)
//console.log("加载 界面交互 (Fix Buff Display)")

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
/**
 * 修改：接收 buffId，确保能准确找到数据并显示描述
 */
function showLocalBuffTooltip(e, buffId) {
    if (!buffId) return;

    // 优先调用 utils_tip.js 挂载的全局函数
    // 注意：TooltipManager.showStatus 的参数顺序是 (buffId, e)
    if (window.showStatusTooltip) {
        window.showStatusTooltip(buffId, e);
    } else {
        // 兜底逻辑：如果全局函数失效，尝试直接访问管理对象
        if (window.TooltipManager && window.player.buffs[buffId]) {
            window.TooltipManager.showStatus(buffId, e);
        }
    }
}
/**
 * 渲染状态栏的所有加成项
 */
/**
 * 渲染状态栏的所有加成项
 * 支持显示装备、功法、临时Buff（包括濒死、疲惫等）、永久属性和轮回底蕴
 */
/**
 * 渲染状态栏的所有加成项
 * 修复：统一事件绑定参数顺序，确保 Tooltip 触发
 */
/**
 * 渲染状态栏的所有加成项
 * 修复：统一百分比显示逻辑，将 studyEff 的 0.35 转换为 35%
 */
function renderBuffs() {
    const containerId = 'buff_list';
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const entries = [];

    // --- 修改后的 addEntry 函数 ---
    const addEntry = (sourceName, attrKey, val, colorHex, itemId = null, customBuffData = null, buffId = null) => {
        if (!val || val === 0) return;

        // 1. 获取属性名称映射
        const attrName = (window.ATTR_MAPPING && window.ATTR_MAPPING[attrKey]) ? window.ATTR_MAPPING[attrKey] : attrKey;

        // 2. 【核心修改】数值格式化逻辑
        let valStr = "";
        if (attrKey === 'studyEff') {
            // 将 0.35 转换为 35%
            const pct = Math.round(parseFloat(val) * 100);
            valStr = (pct > 0 ? "+" : "") + pct + "%";
        } else {
            // 普通属性保持原样
            valStr = val > 0 ? `+${val}` : `${val}`;
        }

        entries.push({
            source: sourceName,
            attr: attrName,
            val: valStr,
            color: colorHex,
            itemId: itemId,
            buffData: customBuffData,
            buffId: buffId
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
                        if (typeof stats[key] === 'number') addEntry(item.name, key, stats[key], '#2196f3', itemId);
                    }
                }
            }
        });
    }

    // 2. 功法 (修正为 ['gongfa'])
    if (player.equipment && player.equipment['gongfa']) {
        const list = player.equipment['gongfa'];
        if (Array.isArray(list)) {
            list.forEach(skillId => {
                if (!skillId) return;
                const info = window.UtilsSkill ? UtilsSkill.getSkillInfo(skillId) : null;
                if (info && info.finalEffects) {
                    for (let key in info.finalEffects) {
                        if (typeof info.finalEffects[key] === 'number') addEntry(info.name, key, info.finalEffects[key], '#d4af37', skillId);
                    }
                }
            });
        }
    }

    // 3. 临时 Buff (包括研读丹药、濒死、疲惫等)
    if (player.buffs) {
        for (let id in player.buffs) {
            const b = player.buffs[id];
            if (b.days > 0) {
                let color = b.color || (b.isDebuff ? '#d32f2f' : '#4caf50');
                // 直接传递 b.attr 和 b.val，addEntry 内部会自动判断 studyEff 进行转换
                addEntry(b.name || "状态", b.attr, b.val, color, null, b, id);
            }
        }
    }

    // 4. 处理显示
    if (entries.length === 0) {
        container.innerHTML = '<div style="color:#ccc; font-size:12px; padding:5px;">暂无加成</div>';
        return;
    }

    entries.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = `font-size:13px; display:flex; align-items:center; padding:4px 0; border-bottom:1px dashed rgba(0,0,0,0.05); cursor:help; width:100%;`;
        row.innerHTML = `
            <span style="font-weight:bold; color:${item.color}; margin-right:6px; min-width:60px;">${item.source}</span>
            <span style="color:#666;">${item.attr}</span>
            <span style="font-weight:bold; color:${item.color}; margin-left: auto;">${item.val}</span>
        `;

        row.onmouseenter = (e) => {
            if (item.itemId) {
                const skillList = Array.isArray(player.skills) ? player.skills : [];
                const isSkill = skillList.find(s => s.id === item.itemId);
                if (isSkill && window.showSkillTooltip) {
                    window.showSkillTooltip(item.itemId, e);
                } else if (window.showItemTooltip) {
                    window.showItemTooltip(item.itemId, e);
                }
            } else if (item.buffData) {
                let bId = null;
                if (player.buffs) {
                    bId = Object.keys(player.buffs).find(key => player.buffs[key] === item.buffData);
                }
                if (bId) {
                    showLocalBuffTooltip(e, bId);
                }
            }
        };

        row.onmouseleave = () => { if (window.TooltipManager) window.TooltipManager.hide(); };
        row.onmousemove = (e) => { if (window.TooltipManager) window.TooltipManager._move(e); };

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