// js/core/state.js
// 核心状态管理 v3.2 (修复弹窗冲突与轮回逻辑)

var player = null;

window.performDirectRebirth = function() {
    console.log(">>> [State] performDirectRebirth 被调用");

    // 【关键修复】立即关闭当前的确认/死亡弹窗
    // 这能防止旧弹窗遮挡新弹窗，也能避免ID冲突
    if (window.closeModal) window.closeModal();

    if (!window.player) {
        console.error(">>> [State] Error: window.player 不存在!");
        return;
    }

    // --- 核心重置逻辑 (闭包) ---
    // --- 核心重置逻辑 (闭包) ---
    const proceedWithRebirth = () => {
        console.log(">>> [State] 开始执行 proceedWithRebirth (重塑真身)...");

        // 1. 技能修补
        if (window.player.skills && window.UtilsSkill) {
            for (let skillId in window.player.skills) {
                let skillData = window.player.skills[skillId];
                let info = UtilsSkill.getSkillInfo(skillId);
                if (info && info.isCapped && !skillData.mastered) {
                    skillData.mastered = true;
                }
            }
        }

        // 2. 提取保留物品 (此时 window.player 还是旧角色)
        console.log(">>> [State] 正在提取 samsaraItem=1 的物品...");
        // 深拷贝一份出来，防止后面引用断裂
        const legacyItems = JSON.parse(JSON.stringify(
            (window.player.inventory || []).filter(item => item.samsaraItem === 1)
        ));
        console.log(`>>> [State] 提取到 ${legacyItems.length} 件轮回物品`);

        // 3. 准备新数据
        let template = window.PLAYER_TEMPLATE || {
            name: "新角色", generation: 1, money: 0,
            attributes: { hp: 100, mp: 0, atk: 10, def: 0, speed: 10 },
            inventory: []
        };
        let newPlayer = JSON.parse(JSON.stringify(template));
        const nextGen = (window.player.generation || 1) + 1;

        // 继承属性
        newPlayer.studyProgress = window.player.studyProgress ? JSON.parse(JSON.stringify(window.player.studyProgress)) : {};
        newPlayer.skills = window.player.skills ? JSON.parse(JSON.stringify(window.player.skills)) : {};
        newPlayer.fishHistory = window.player.fishHistory ? JSON.parse(JSON.stringify(window.player.fishHistory)) : {};
        newPlayer.lifeSkills = window.player.lifeSkills ? JSON.parse(JSON.stringify(window.player.lifeSkills)) : {};

        newPlayer.danger = 0;
        newPlayer.need_kill = 0;
        newPlayer.timeStart = 0;
        newPlayer.generation = nextGen;
        newPlayer.name = "道友" + nextGen + "世";
        newPlayer.worldSeed = Math.floor(Math.random() * 1000000);
        newPlayer.isNewLife = true;

        // ============================================================
        // 4. 覆盖全局数据 (关键！)
        // ============================================================
        // 先把 player 换成新的，这样 UtilsAdd.addItem 才会加到新背包里
        window.player = newPlayer;
        console.log(">>> [State] 玩家数据已重置:", window.player.name);

        // ============================================================
        // 5. 放入保留物品 (使用 UtilsItem.addItem)
        // ============================================================
        if (window.UtilsItem && legacyItems.length > 0) {
            legacyItems.forEach(item => {

                // 直接调用 addItem
                // 因为 item 里面有了 isSamsara:true，_generateDeterministicSid 会生成完全不同的 SID
                // 这样就自动和普通物品分开了
                // 传入 item 对象，addItem 会处理深拷贝
                window.UtilsItem.addItem(item, item.count || 1);
            });
        }

        // 发放初始物品
        setStartItem();

        if(window.saveGame) window.saveGame();
        if (window.LogManager) window.LogManager.clear();

        // 6. UI 刷新
        if(window.recalcStats) window.recalcStats();
        if(window.updateUI) window.updateUI();

        // 再次确保关闭所有弹窗
        if (window.closeModal) window.closeModal();

        if (typeof backToMenu === 'function') backToMenu();
        if(window.showToast) window.showToast("开启第 " + nextGen + " 世");

        console.log(">>> [State] 准备刷新页面...");
        setTimeout(() => location.reload(), 500);
    };
    setTimeout(() => {
        // 7. 触发事件
        // --- 逻辑分支 ---

        // 1. 检查条件
        const timeStart = window.player.timeStart || 0;
        const canCarryItem = timeStart > 0;
        console.log(`>>> [State] 检查轮回条件: timeStart=${timeStart}, canCarry=${canCarryItem}`);

        // 2. 强制卸下装备
        if (canCarryItem && window.UtilsItem && window.player.equipment) {
            console.log(">>> [State] 正在强制卸下装备...");
            const slots = ['weapon', 'head', 'body', 'feet', 'mount', 'accessory', 'fishing_rod'];
            slots.forEach(slot => {
                if (window.player.equipment[slot]) {
                    window.UtilsItem.unequipItem(slot);
                }
            });
        }

        // 3. 筛选可选物品
        let equipableItems = [];
        if (canCarryItem && window.player.inventory) {
            equipableItems = window.player.inventory.filter(i => {
                return ['weapon', 'head', 'body', 'feet', 'mount', 'accessory', 'fishing_rod'].includes(i.type);
            });
            console.log(`>>> [State] 背包中筛选出 ${equipableItems.length} 件可选装备`);
        }

        // 4. 弹出选择 (前提：UtilsModal存在且有物品)
        if (equipableItems.length > 0) {
            if (window.UtilsModal && window.UtilsModal.showSamsaraSelectionModal) {
                console.log(">>> [State] 呼叫 showSamsaraSelectionModal");

                // 这里不需要 return，因为 showSamsaraSelectionModal 会打开新弹窗
                // 而 proceedWithRebirth 是在回调里执行的
                window.UtilsModal.showSamsaraSelectionModal(equipableItems, (selectedItem) => {
                    console.log(">>> [State] 玩家选择了物品回调:", selectedItem);
                    if (selectedItem) {
                        selectedItem.samsaraItem = 1;
                    }
                    proceedWithRebirth();
                });
                return; // 暂停后续逻辑，等待用户交互
            }
        }

        // 5. 直接执行 (无装备或不满足条件)
        console.log(">>> [State] 无可选装备或不满足条件，直接轮回");
        proceedWithRebirth();
    }, 500);

};

function setStartItem() {
    if (!window.UtilsAdd) return;
    UtilsAdd.addItem("weapons_000", 1);
    UtilsAdd.addItem("body_001", 1);
    UtilsAdd.addItem("head_001", 1);
    UtilsAdd.addItem("feet_002", 1);
    UtilsAdd.addMoney(100);
    UtilsAdd.addItem("foods_005", 2);
    UtilsAdd.addItem("foods_053", 1);
    UtilsAdd.addItem("book_cultivation_r1_00_full", 1);
    UtilsAdd.addSkill("book_body_r1_00_full");
};

window.executeDie = window.performDirectRebirth;

function attemptDie() {
    if (window.showConfirmModal) {
        window.showConfirmModal(
            "兵解轮回",
            `
            <div style="text-align:center; padding:10px;">
                <p class="text_red" style="font-weight:bold; font-size:18px; margin-bottom:15px;">警告：肉身将毁，修为尽失！</p>
                <p style="color:#444; margin-bottom:5px;">你将保留所有<b style=\"color:#2b58a6\">已学会的功法</b>（需重新修炼）。</p>
                <br>
                <p style="font-weight:bold;">道友道心已决，确定要开启来世吗？</p>
            </div>
            `,
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