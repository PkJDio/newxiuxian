/**
 * ============================================================
 * [大事件专属] 灵气复苏·沙丘剧变 (第一天) 袭击者数据
 * 背景：始皇驾崩于沙丘行宫，禁制消散，狂暴灵气瞬间撕裂了凡人的理智。
 * 强度：高攻击、高速度、低防御（肉体崩溃边缘）。
 * ============================================================
 */
let EVENT_RAID_ENEMIES = {
    // --- 5个 Minion (普通级)：3个技能 ---
    minion: [
        {
            id: "raid_frenzied_sentry", name: "狂躁的行宫岗哨", template: "minion", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 45, atk: 18, def: 2, speed: 15 }, money: [5, 10],
            skills: [
                { id: "乱剑挥砍", type: 1, damage: 10, rate: 0.5 },
                { id: "垂死挣扎", type: 1, damage: 25, rate: 0.15 },
                { id: "凶光", type: 2, debuffAttr: "atk", debuffValue: 5, debuffTimes: 3, rate: 0.2 }
            ],
            desc: "守卫在行宫外的士兵，因灵气入体导致血管暴裂，只剩下杀戮本能。"
        },
        {
            id: "raid_panicked_attendant", name: "失控的随行杂役", template: "minion", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 40, atk: 16, def: 1, speed: 12 }, money: [2, 8],
            skills: [
                { id: "胡乱投掷", type: 1, damage: 8, rate: 0.5 },
                { id: "拼命冲撞", type: 1, damage: 22, rate: 0.15 },
                { id: "哀嚎", type: 2, debuffAttr: "speed", debuffValue: 3, debuffTimes: 2, rate: 0.2 }
            ],
            desc: "行宫内的侍从，被突如其来的剧变吓疯了，手中抓着沉重的青铜器皿疯狂乱砸。"
        },
        {
            id: "raid_bolting_steed", name: "惊厥的御用战马", template: "minion", region: "all", timeStart: 1,
            subType: "beast", stats: { hp: 60, atk: 14, def: 5, speed: 20 }, money: [0, 0],
            skills: [
                { id: "后蹄重踢", type: 1, damage: 12, rate: 0.4 },
                { id: "疯狂践踏", type: 1, damage: 30, rate: 0.1 },
                { id: "暴走", type: 3, buffAttr: "speed", buffValue: 10, buffTimes: 3, rate: 0.2 }
            ],
            desc: "原本温顺的御马受灵气惊扰，挣脱了缰绳，在行宫走廊内横冲直撞。"
        },
        {
            id: "raid_exhausted_courier", name: "力竭的传令兵", template: "minion", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 50, atk: 20, def: 2, speed: 18 }, money: [10, 20],
            skills: [
                { id: "短剑突刺", type: 1, damage: 10, rate: 0.5 },
                { id: "死战之志", type: 1, damage: 28, rate: 0.15 },
                { id: "喘息", type: 3, buffAttr: "def", buffValue: 5, buffTimes: 2, rate: 0.2 }
            ],
            desc: "身负重要密令的驿骑，在翻下马背的一刻被狂暴灵气占据了身体。"
        },
        {
            id: "raid_wild_wolf", name: "嗅血的山林饿狼", template: "minion", region: "all", timeStart: 1,
            subType: "beast", stats: { hp: 35, atk: 22, def: 1, speed: 22 }, money: [0, 0],
            skills: [
                { id: "撕咬", type: 1, damage: 11, rate: 0.5 },
                { id: "锁喉", type: 1, damage: 32, rate: 0.1 },
                { id: "嗜血", type: 3, buffAttr: "atk", buffValue: 8, buffTimes: 3, rate: 0.2 }
            ],
            desc: "沙丘行宫附近的野狼，嗅到了宫殿内浓郁的生机与死亡交织的气息，变得异常亢奋。"
        }
    ],

    // --- 5个 Elite (精英级)：5个技能 ---
    elite: [
        {
            id: "raid_elite_lieutenant", name: "暴走的行宫校尉", template: "elite", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 180, atk: 45, def: 12, speed: 25 }, money: [50, 100],
            skills: [
                { id: "破空斩", type: 1, damage: 20, rate: 0.5 },
                { id: "旋风重劈", type: 1, damage: 55, rate: 0.2 },
                { id: "真气暴血", type: 1, damage: 110, rate: 0.05 },
                { id: "校尉威压", type: 3, buffAttr: "atk", buffValue: 12, buffTimes: 3, rate: 0.2 },
                { id: "缴械", type: 2, debuffAttr: "atk", debuffValue: 10, debuffTimes: 2, rate: 0.2 }
            ],
            desc: "【精英】原本负责寝殿安保的将领，此刻浑身肌肉扭曲，皮肤呈现出金属般的乌青。"
        },
        {
            id: "raid_elite_alchemist", name: "脱力的御前医方", template: "elite", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 140, atk: 52, def: 6, speed: 30 }, money: [80, 150],
            skills: [
                { id: "汞毒粉末", type: 1, damage: 15, rate: 0.5 },
                { id: "废丹引爆", type: 1, damage: 60, rate: 0.2 },
                { id: "天地炉火", type: 1, damage: 120, rate: 0.05 },
                { id: "服药", type: 3, buffAttr: "speed", buffValue: 15, buffTimes: 3, rate: 0.2 },
                { id: "腐蚀药雾", type: 2, debuffAttr: "def", debuffValue: 10, debuffTimes: 3, rate: 0.2 }
            ],
            desc: "【精英】曾为始皇炼丹的方士，在灵气倒灌时贪婪汲取，导致神智崩溃，周身散发着刺鼻的药石味。"
        },
        {
            id: "raid_elite_guard_captain", name: "震颤的行宫禁卫长", template: "elite", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 220, atk: 42, def: 20, speed: 18 }, money: [60, 120],
            skills: [
                { id: "突刺", type: 1, damage: 18, rate: 0.5 },
                { id: "盾击", type: 1, damage: 45, rate: 0.2 },
                { id: "禁卫绝杀", type: 1, damage: 105, rate: 0.05 },
                { id: "铁壁之志", type: 3, buffAttr: "def", buffValue: 15, buffTimes: 4, rate: 0.2 },
                { id: "锁足", type: 2, debuffAttr: "speed", debuffValue: 8, debuffTimes: 3, rate: 0.2 }
            ],
            desc: "【精英】大秦最精锐的卫兵，即便在癫狂中依然保持着死守行宫的战斗姿势。"
        },
        {
            id: "raid_elite_court_official", name: "癫狂的执笔史官", template: "elite", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 150, atk: 48, def: 8, speed: 22 }, money: [100, 200],
            skills: [
                { id: "飞毫如箭", type: 1, damage: 16, rate: 0.5 },
                { id: "简牍重击", type: 1, damage: 50, rate: 0.2 },
                { id: "笔墨诛心", type: 1, damage: 115, rate: 0.05 },
                { id: "文气护体", type: 3, buffAttr: "def", buffValue: 10, buffTimes: 5, rate: 0.2 },
                { id: "律令·禁", type: 2, debuffAttr: "speed", debuffValue: 12, debuffTimes: 4, rate: 0.2 }
            ],
            desc: "【精英】正在记录陛下遗诏的史官，受惊后将手中的青铜笔当成了致命的杀器。"
        },
        {
            id: "raid_elite_shadow_guard", name: "错乱的影中死士", template: "elite", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 130, atk: 60, def: 4, speed: 45 }, money: [40, 90],
            skills: [
                { id: "影袭", type: 1, damage: 22, rate: 0.5 },
                { id: "背刺", type: 1, damage: 65, rate: 0.2 },
                { id: "瞬狱杀", type: 1, damage: 130, rate: 0.05 },
                { id: "暗涌", type: 3, buffAttr: "speed", buffValue: 20, buffTimes: 3, rate: 0.2 },
                { id: "烟幕", type: 2, debuffAttr: "atk", debuffValue: 15, debuffTimes: 2, rate: 0.2 }
            ],
            desc: "【精英】潜伏在行宫暗影处的保镖，灵气倒灌让他们与阴影的融合失去了控制。"
        }
    ],

    // --- 3个 Boss (首领级)：8个技能 ---
    boss: [
        {
            id: "raid_boss_chamberlain", name: "癫狂的沙丘内侍长", template: "boss", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 850, atk: 88, def: 20, speed: 38 }, money: [500, 1000],
            skills: [
                { id: "拂尘乱舞", type: 1, damage: 25, rate: 0.4 },           // 1. 低
                { id: "内劲掌掴", type: 1, damage: 85, rate: 0.2 },           // 2. 高
                { id: "行宫绝响", type: 1, damage: 180, rate: 0.1 },          // 3. 很高
                { id: "灵气坍缩", type: 1, damage: 350, rate: 0.02 },         // 4. 极高
                { id: "内侍威仪", type: 3, buffAttr: "speed", buffValue: 15, buffTimes: 4, rate: 0.2 }, // 5. 增益
                { id: "残命吞噬", type: 3, buffAttr: "hp", buffValue: 170, buffTimes: 1, rate: 0.1 },   // 6. 回复 (1/5)
                { id: "尖锐嘶叫", type: 2, debuffAttr: "atk", debuffValue: 15, debuffTimes: 5, rate: 0.2 }, // 7. 减益1
                { id: "绝望目光", type: 2, debuffAttr: "def", debuffValue: 12, debuffTimes: 4, rate: 0.2 }  // 8. 减益2
            ],
            desc: "【头目】沙丘行宫的总管，最先目睹陛下驾崩的人。他在极度的恐惧中吞噬了陛下逸散的第一缕龙气。"
        },
        {
            id: "raid_boss_general", name: "脱控的行宫镇守将", template: "boss", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 1200, atk: 75, def: 45, speed: 22 }, money: [600, 1200],
            skills: [
                { id: "破阵一枪", type: 1, damage: 30, rate: 0.4 },
                { id: "横扫千军", type: 1, damage: 95, rate: 0.2 },
                { id: "山崩地裂", type: 1, damage: 210, rate: 0.1 },
                { id: "定秦绝剑", type: 1, damage: 420, rate: 0.02 },
                { id: "战阵杀气", type: 3, buffAttr: "atk", buffValue: 20, buffTimes: 5, rate: 0.2 },
                { id: "老兵不屈", type: 3, buffAttr: "hp", buffValue: 240, buffTimes: 1, rate: 0.1 },
                { id: "沉重威压", type: 2, debuffAttr: "speed", debuffValue: 10, debuffTimes: 5, rate: 0.2 },
                { id: "甲片震荡", type: 2, debuffAttr: "def", debuffValue: 20, debuffTimes: 3, rate: 0.2 }
            ],
            desc: "【头目】驻扎沙丘的最高统帅，他的战甲已被狂暴的灵气撑开，每一寸皮肤都充满了爆发性的毁灭力量。"
        },
        {
            id: "raid_boss_chief_fangshi", name: "神志错乱的随行首席", template: "boss", region: "all", timeStart: 1,
            subType: "human", stats: { hp: 750, atk: 105, def: 10, speed: 55 }, money: [800, 1500],
            skills: [
                { id: "乱灵符", type: 1, damage: 35, rate: 0.4 },
                { id: "五雷错位", type: 1, damage: 100, rate: 0.2 },
                { id: "阴阳逆转", type: 1, damage: 240, rate: 0.1 },
                { id: "长生幻灭", type: 1, damage: 480, rate: 0.02 },
                { id: "入道疯魔", type: 3, buffAttr: "atk", buffValue: 30, buffTimes: 3, rate: 0.2 },
                { id: "丹髓共鸣", type: 3, buffAttr: "hp", buffValue: 150, buffTimes: 1, rate: 0.1 },
                { id: "感官剥夺", type: 2, debuffAttr: "speed", debuffValue: 20, debuffTimes: 4, rate: 0.2 },
                { id: "神识压制", type: 2, debuffAttr: "atk", debuffValue: 20, debuffTimes: 5, rate: 0.2 }
            ],
            desc: "【头目】始皇最信赖的首席方士，因在驾崩现场试图通过禁术挽回圣命，导致灵魂被天地之威瞬间冲垮。"
        }
    ]
};

window.EVENT_RAID_ENEMIES = EVENT_RAID_ENEMIES;

/**
 * ============================================================
 * [测试工具] 怪物来袭模拟器
 * 使用方法：控制台输入 testRaid(rank, waves)
 * 示例：
 * testRaid('boss')          - 模拟单波次BOSS来袭
 * testRaid('minion', 3)    - 模拟三波次连续战斗（普通->精英->BOSS）
 * ============================================================
 */
/**
 * ============================================================
 * [测试工具] 怪物来袭模拟器 v3.2
 * 已同步：支持通过 options 锁定弹窗（禁止ESC和外部点击）
 * ============================================================
 */
/**
 * ============================================================
 * [测试工具] 怪物来袭模拟器 v3.2 (适配最新弹窗控制逻辑)
 * 使用方法：控制台输入 testRaid(rank, waves)
 * ============================================================
 */
/**
 * ============================================================
 * [测试工具] 怪物来袭模拟器 v3.2 (完美合并版)
 * ============================================================
 */
window.testRaid = function(rank = 'minion', waves = 1) {
    console.log(`%c[Raid Test] 启动模拟：级别=${rank}, 波次=${waves}`, "color: #1e88e5; font-weight: bold;");

    if (!window.EVENT_RAID_ENEMIES) {
        console.error("错误: 未找到 EVENT_RAID_ENEMIES 配置。");
        return;
    }

    const startWave = (currentWave, totalWaves, currentRank) => {
        const pool = window.EVENT_RAID_ENEMIES[currentRank];
        if (!pool || pool.length === 0) {
            console.error(`错误: 级别 [${currentRank}] 的敌人池为空`);
            return;
        }

        const template = pool[Math.floor(Math.random() * pool.length)];
        const enemyInstance = UtilsEnemy._buildEnemyInstance(template, 400, 300);

        console.log(`%c[波次 ${currentWave}/${totalWaves}] 敌人: ${enemyInstance.name}`, "color: #43a047;");

        const isLastWave = currentWave >= totalWaves;

        /**
         * 这里就是你问的“合并”：
         * 我们直接创建一个包含所有控制权的对象
         */
        const finalOptions = {
            // 1. 战斗逻辑 (UI内部使用)
            canEscape: false,        // 怪物来袭，不给逃跑按钮
            isMultiWave: !isLastWave, // 是否还有下一波

            // 2. 弹窗控制 (透传给 UtilsModal 使用)
            allowOutsideClick: false, // 禁用点击遮罩关闭
            allowEsc: false,          // 禁用 ESC 键关闭

            // 3. 回调
            onClose: () => {
                console.log(`%c[Raid] 波次 ${currentWave} 窗口资源已清理`, "color: #9e9e9e;");
            }
        };

        if (window.UICombatModal) {
            UICombatModal.show(enemyInstance, () => {
                // --- 胜利回调开始 ---
                if (!isLastWave) {
                    console.log(`%c[波次 ${currentWave}] 胜利！下一波准备中...`, "color: #fb8c00;");

                    // 自动计算下一波的难度级别
                    let nextRank = 'elite';
                    if (currentWave >= 2) nextRank = 'boss';

                    // 延迟 1 秒开启下一波
                    setTimeout(() => startWave(currentWave + 1, totalWaves, nextRank), 1000);
                } else {
                    console.log("%c[测试结束] 最终胜利！所有波次已清除。", "color: #fdd835; font-weight: bold;");
                    window.showToast("🎉 守城成功！");
                }
                // --- 胜利回调结束 ---
            }, finalOptions);
        } else {
            console.error("错误: 未找到 UICombatModal 模块。");
        }
    };

    // 第一波级别判定
    const initialRank = waves > 1 ? 'minion' : rank;
    startWave(1, waves, initialRank);
};
console.log("%c怪物来袭测试工具已载入！", "color: #8e24aa; font-weight: bold;");
console.log("输入 testRaid('minion') 测试普通怪");
console.log("输入 testRaid('elite') 测试精英怪");
console.log("输入 testRaid('boss') 测试BOSS");
console.log("输入 testRaid('minion', 3) 测试三连战(符合阶段1剧情)");