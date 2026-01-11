// js/core/state.js
// 核心状态管理：定义玩家模板、兵解逻辑 v2.0 (修复注释BUG，重命名接口)

var player = null;

// ==========================================
// 2. 核心逻辑：直接执行兵解 (无弹窗，纯逻辑)
// ==========================================
// 供战斗系统直接调用，或由确认弹窗回调调用
window.performDirectRebirth = function() {
    console.log(">>> [State] 执行 performDirectRebirth (纯逻辑，无弹窗)");

    if (!window.player) return;

    // 1. 准备新数据
    let template = window.PLAYER_TEMPLATE || {
        name: "新角色", generation: 1, money: 0,
        attributes: { hp: 100, mp: 0, atk: 10, def: 0, speed: 10 },
        inventory: []
    };

    let newPlayer = JSON.parse(JSON.stringify(template));
    const nextGen = (window.player.generation || 1) + 1;

    // 继承逻辑
    newPlayer.studyProgress = window.player.studyProgress ? JSON.parse(JSON.stringify(window.player.studyProgress)) : {};
    newPlayer.currentStudyTarget = window.player.currentStudyTarget || null;


    newPlayer.generation = nextGen;
    newPlayer.name = "道友" + nextGen + "世";
    newPlayer.worldSeed = Math.floor(Math.random() * 1000000);

    // 2. 覆盖全局数据
    window.player = newPlayer;

    // 3. 保存与清理
    if(window.saveGame) window.saveGame();
    if (window.LogManager) window.LogManager.clear();

    // 4. 刷新界面
    if(window.recalcStats) window.recalcStats();
    if(window.updateUI) window.updateUI();

    // 5. 【关键修复】这里强制关闭所有弹窗，换行写，避免被注释掉
    if (window.closeModal) window.closeModal();

    // 6. 回主页
    if (typeof backToMenu === 'function') backToMenu();
    if (typeof checkSaveFile === 'function') checkSaveFile();

    if(window.showToast) window.showToast("兵解成功，开启第 " + nextGen + " 世");
};

// 为了兼容旧存档或习惯，保留 executeDie 别名，但指向新函数
window.executeDie = window.performDirectRebirth;

// ==========================================
// 3. 交互逻辑：用户手动点击兵解 (带确认弹窗)
// ==========================================
function attemptDie() {
    console.log(">>> [State] 用户点击兵解，弹出确认框");
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
            // 确认后，调用上面的纯逻辑函数
            window.performDirectRebirth
        );
    } else {
        if(confirm("确定要兵解轮回吗？")) {
            window.performDirectRebirth();
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

window.attemptDie = attemptDie;
window.backToMenu = backToMenu;