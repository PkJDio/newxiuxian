// 存档管理：player对象, globalMeta, save/load
console.log("加载 存档管理")

/* ================= 状态与存档管理 ================= */

// 全局玩家对象
var player = null;

/**
 * 保存游戏
 */
function saveGame() {
  if (!player) return;
  try {
    const dataStr = JSON.stringify(player);
    localStorage.setItem(SAVE_KEY, dataStr);

    // 注意：这里会添加一条日志
    if (window.LogManager) {
      window.LogManager.add("<span class='text_green'>存档成功！道心已固。</span>");
    } else {
      if(window.showToast) window.showToast("存档成功");
    }
    console.log("游戏已保存");
  } catch (e) {
    console.error("存档失败", e);
    alert("存档失败，空间不足或权限受限");
  }
}

/**
 * 读取游戏
 */
function loadGame() {
  try {
    const dataStr = localStorage.getItem(SAVE_KEY);
    if (!dataStr) return false;
    const data = JSON.parse(dataStr);
    if (!data || typeof data !== 'object') throw new Error("存档数据格式错误");

    window.player = data;
    console.log("读取存档成功");
    return true;
  } catch (e) {
    console.error("读取存档失败（坏档）:", e);
    localStorage.removeItem(SAVE_KEY);
    window.player = null;
    if (window.showWarningModal) {
      window.showWarningModal("天地大劫", "存档数据异常，需重置世界。", function() { window.location.reload(); });
    } else {
      alert("存档已损坏，系统将自动重置。");
      window.location.reload();
    }
    return false;
  }
}

/**
 * 兵解 (重置/转世)
 * 核心逻辑：继承技能 -> 保存新档 -> 清空日志 -> 返回主页
 */
function attemptDie() {
  // 定义兵解的具体执行逻辑 (点击弹窗"确定"后执行)
  const executeDie = function() {
    console.log("【Debug】=== 开始执行兵解逻辑 ===");

    // 1. 准备新身体
    let newPlayer;
    if (typeof PLAYER_TEMPLATE !== 'undefined') {
      newPlayer = JSON.parse(JSON.stringify(PLAYER_TEMPLATE));
    } else {
      console.error("【Debug】错误：找不到 PLAYER_TEMPLATE");
      newPlayer = { attr:{jing:10,qi:10,shen:10}, status:{hp:100,mp:100}, money:0, inventory:[], skills:{}, lifeSkills:{}, bonus_stats:{} };
    }

    const nextGen = (player.generation || 1) + 1;
    console.log("【Debug】新世数:", nextGen);

    // 2. === 核心继承逻辑 (保留功法加成) ===
    let legacyStats = player.bonus_stats || {};

    if (player.skills) {
      for (let skillId in player.skills) {
        const oldSkill = player.skills[skillId];
        const itemData = GAME_DB.items.find(i => i.id === skillId);

        if (!itemData) continue;

        let newSkillEntry = {
          level: 0,
          exp: 0,
          mastered: oldSkill.mastered || false
        };

        // 判定参悟
        const isMaxLevel = oldSkill.level >= 3 || oldSkill.exp >= 999;

        if (isMaxLevel && !oldSkill.mastered) {
          newSkillEntry.mastered = true;
          // 计算属性加成
          const rarity = itemData.rarity || 1;
          const difficulty = (SKILL_CONFIG.difficulty && SKILL_CONFIG.difficulty[rarity]) ? SKILL_CONFIG.difficulty[rarity] : 1.0;

          let bestAttr = null;
          let maxVal = -1;

          if (itemData.effects) {
            for (let key in itemData.effects) {
              if (key === 'max_skill_level' || key === 'map' || key === 'unlockRegion') continue;
              const val = itemData.effects[key];
              if (typeof val === 'number' && val > maxVal) {
                maxVal = val;
                bestAttr = key;
              }
            }
          }

          if (bestAttr) {
            if (!legacyStats[bestAttr]) legacyStats[bestAttr] = 0;
            legacyStats[bestAttr] += difficulty;
            console.log(`【Debug】参悟成功: ${itemData.name} -> ${bestAttr} +${difficulty}`);
          }
        }
        newPlayer.skills[skillId] = newSkillEntry;
      }
    }

    if (player.lifeSkills) {
      newPlayer.lifeSkills = JSON.parse(JSON.stringify(player.lifeSkills));
    }

    newPlayer.bonus_stats = legacyStats;
    newPlayer.generation = nextGen;
    newPlayer.name = "道友" + nextGen + "世";
    newPlayer.location = "t_xianyang";
    newPlayer.worldSeed = Math.floor(Math.random() * 1000000);
    console.log(newPlayer)
    // 3. 覆盖全局对象
    window.player = newPlayer;
    console.log("【Debug】全局 player 对象已更新");

    // 4. 保存新档 (这里会触发 LogManager.add("存档成功..."))
    saveGame();
    console.log("【Debug】新档已保存 (此时日志中应有'存档成功')");

    // 5. === 关键步骤：清空日志 ===
    // 我们在 saveGame 之后清空，确保把“存档成功”这条也删掉，保证干净
    if (window.LogManager) {
      console.log("【Debug】正在调用 LogManager.clear()...");
      window.LogManager.clear();
      console.log("【Debug】日志已清空");
    } else {
      console.error("【Debug】LogManager 未定义！");
    }

    // 6. 刷新界面数据 (虽然要回主页，但防止后台报错)
    if(window.recalcStats) window.recalcStats();
    if(window.updateUI) window.updateUI();

    // 7. 返回主页
    console.log("【Debug】正在返回主页...");
    backToMenu();

    // 8. 检查按钮状态 (确保主页按钮变成"继续道途")
    // 因为这是异步的，可能需要一点延迟，或者直接假设 backToMenu 切换了 DIV，
    // 而 main.js 里的 checkSaveFile() 需要被调用来更新按钮文字
    if (typeof checkSaveFile === 'function') {
      checkSaveFile();
      console.log("【Debug】主页按钮状态已更新");
    }

    if(window.showToast) window.showToast("兵解成功，轮回开启");
    console.log("【Debug】=== 兵解逻辑执行完毕 ===");
  };

  // 调用新的双选弹窗
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
      executeDie
    );
  } else {
    if(confirm("确定兵解？")) executeDie();
  }
}

/**
 * 返回主页
 */
function backToMenu() {
  const game = document.getElementById('scene_game');
  const menu = document.getElementById('scene_menu');
  if (game && menu) {
    game.classList.remove('active');
    menu.classList.add('active');
  }
}

// 暴露给全局
window.saveGame = saveGame;
window.loadGame = loadGame;
window.attemptDie = attemptDie;
window.backToMenu = backToMenu;
