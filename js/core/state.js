// js/core/state.js
// 核心状态管理：定义玩家模板、兵解逻辑
console.log("加载 状态管理");

// ==========================================
// 1. 定义玩家标准模板 (Schema)
// 所有新字段必须在这里定义，读档时才能自动补全
// ==========================================
window.PLAYER_TEMPLATE = {
    name: "无名道友",
    generation: 1,
    age: 16,
    money: 0,
    worldSeed: 0, // 世界随机种子
    location: "t_xianyang", // 默认出生地

    // 时间系统
    time: { year: 37, month: 1, day: 1, hour: 0 },

    // 基础属性 (先天)
    attr: { jing: 10, qi: 10, shen: 10 },

    // 当前状态 (动态变化)
    status: {
        hp: 100,
        mp: 50,
        hunger: 100,
        fatigue: 0  // 【新增】确保模板里有这个字段！
    },

    // 衍生属性 (计算得出，这里只需占位)
    derived: {
        hpMax: 100, mpMax: 50,
        hungerMax: 100, fatigueMax: 100,
        atk: 0, def: 0, speed: 10
    },

    // 容器与集合
    inventory: [], // 背包
    equipment: {   // 装备槽
        weapon: null, head: null, body: null, feet: null,
        mount: null, tool: null, fishing_rod: null,
        gongfa_ext: [], gongfa_int: []
    },
    skills: {},     // 已学技能
    lifeSkills: {}, // 生活技能
    buffs: {},      // Buff状态
    bonus_stats: {}, // 轮回属性加成
    exAttr: {}      // 永久属性加成
};

// 全局玩家对象初始化
var player = null;


// ==========================================
// 2. 兵解 (轮回) 逻辑
// ==========================================
function attemptDie() {
    // 定义具体的执行逻辑
    const executeDie = function() {
        console.log("【Debug】=== 执行兵解 ===");

        // 1. 基于模板创建新身体
        let newPlayer = JSON.parse(JSON.stringify(window.PLAYER_TEMPLATE));

        // 2. 计算继承数据
        const nextGen = (player.generation || 1) + 1;
        let legacyStats = player.bonus_stats || {};

        // 功法继承逻辑 (保留大成属性)
        if (player.skills) {
            for (let skillId in player.skills) {
                const oldSkill = player.skills[skillId];
                // 只有大成(mastered)的功法才提供属性加成
                if (oldSkill.mastered) {
                    const itemData = GAME_DB.items.find(i => i.id === skillId);
                    if (itemData) {
                        // 简单处理：稀有度越高加成越多
                        const bonusVal = (itemData.rarity || 1) * 1;
                        // 假设加成到 'shen' (或者根据功法类型判断)
                        if(!legacyStats.shen) legacyStats.shen = 0;
                        legacyStats.shen += bonusVal;
                    }
                }
            }
        }

        // 3. 应用新属性
        newPlayer.bonus_stats = legacyStats;
        newPlayer.generation = nextGen;
        newPlayer.name = "道友" + nextGen + "世";
        newPlayer.worldSeed = Math.floor(Math.random() * 1000000);

        // 4. 覆盖全局
        window.player = newPlayer;

        // 5. 保存并刷新
        if(window.saveGame) window.saveGame();

        // 清理日志
        if (window.LogManager) window.LogManager.clear();

        // 刷新UI
        if(window.recalcStats) window.recalcStats();
        if(window.updateUI) window.updateUI();

        // 回主页
        backToMenu();
        if (typeof checkSaveFile === 'function') checkSaveFile();
        if(window.showToast) window.showToast("兵解成功，开启第 " + nextGen + " 世");
    };

    // 【UI 恢复】调用 ModalManager 的 showConfirmModal
    // 优先检查 window.showConfirmModal，如果不存在则使用原生 confirm 兜底
    if (window.showConfirmModal) {
        window.showConfirmModal(
            "兵解轮回",
            `
            <div style="text-align:center; padding:10px;">
                <p class="text_red" style="font-weight:bold; font-size:18px; margin-bottom:15px;">警告：肉身将毁，修为尽失！</p>
                <p style="color:#444; margin-bottom:5px;">你将保留所有<b style="color:#2b58a6">已学会的功法</b>（需重新修炼）。</p>
                <p style="color:#444; margin-bottom:5px;">已<b style="color:#ceae04">大成</b>的功法将化为永久属性加成。</p>
                <br>
                <p style="font-weight:bold;">道友道心已决，确定要开启来世吗？</p>
            </div>
            `,
            executeDie // 点击"确定"后执行的回调
        );
    } else {
        // 兜底：防止 util_modal.js 没加载时报错
        if(confirm("确定要兵解轮回吗？(保留大成功法加成，重置其他进度)")) {
            executeDie();
        }
    }
}

function backToMenu() {
    const game = document.getElementById('scene_game');
    const menu = document.getElementById('scene_menu');
    if (game && menu) {
        game.classList.remove('active');
        menu.classList.add('active');
    }
}

// 暴露接口
window.attemptDie = attemptDie;
window.backToMenu = backToMenu;
// 注意：saveGame 和 loadGame 现在由 archive.js 提供