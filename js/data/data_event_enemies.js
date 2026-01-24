/**
 * ============================================================
 * [大事件专属] 法力复苏·沙丘剧变 (第一天) 袭击者数据
 * 背景：始皇驾崩于沙丘行宫，禁制消散，狂暴法力瞬间撕裂了凡人的理智。
 * 强度：高攻击、高速度、低防御（肉体崩溃边缘）。
 * ============================================================
 */
let EVENT_RAID_ENEMIES = {
    // --- 5个 Minion (普通级)：3个技能 ---
    minion: [
        // ==========================================
// 杂鱼级怪物 (Minion) 标准化技能格式重构
// ==========================================
        {
            id: "raid_frenzied_sentry",
            name: "狂躁的行宫岗哨",
            template: "minion",
            rank: "minion",
            subType: "human",
            defType: "light",
            stats: {
                hp: 90,
                phy_atk: 18, mag_atk: 2,
                phy_def: 4, mag_def: 2,
                speed: 11
            },
            money: [5, 10],
            drops: [
                { id: "materials_088", rate: 0.4 }, // 锈蚀铁片
                { id: "materials_089", rate: 0.5 }  // 污秽的布条
            ],
            skills: [
                // 高伤害 (10%)
                { id: "舍命一击", rate: 0.1, type: 1, damage: 2.2, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%)
                { id: "快速抽打", rate: 0.2, type: 1, damage: 0.8, damageType: "phy", dmgValType: 1 },
                // 常规 (50%)
                { id: "乱剑挥砍", rate: 0.5, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
                // 功能 (20%)
                { id: "凶光", rate: 0.2, type: 2, debuffAttr: "phy_atk", debuffValue: 0.1, debuffValType: 1, debuffTimes: 3 }
            ],
            desc: "守卫在行宫外的士兵，因法力入体导致血管暴裂，只剩下杀戮本能。"
        },
        {
            id: "raid_panicked_attendant",
            name: "失控的随行杂役",
            template: "minion",
            rank: "minion",
            subType: "human",
            defType: "cloth",
            stats: {
                hp: 80,
                phy_atk: 12, mag_atk: 6,
                phy_def: 2, mag_def: 5,
                speed: 12
            },
            money: [2, 8],
            drops: [
                { id: "materials_089", rate: 0.6 },
                { id: "materials_094", rate: 0.2 }
            ],
            skills: [
                // 高伤害 (10%)
                { id: "器皿重砸", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%)
                { id: "拍打", rate: 0.2, type: 1, damage: 0.7, damageType: "phy", dmgValType: 1 },
                // 常规 (50%)
                { id: "胡乱投掷", rate: 0.5, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
                // 功能 (20%)
                { id: "哀嚎", rate: 0.2, type: 2, debuffAttr: "speed", debuffValue: 3, debuffTimes: 2 }
            ],
            desc: "行宫内的侍从，被突如其来的剧变吓疯了，手中抓着沉重的青铜器皿疯狂乱砸。"
        },
        {
            id: "raid_bolting_steed",
            name: "惊厥的御用战马",
            template: "minion",
            rank: "minion",
            subType: "beast",
            defType: "leather",
            stats: {
                hp: 108,
                phy_atk: 20, mag_atk: 0,
                phy_def: 6, mag_def: 3,
                speed: 20
            },
            money: [0, 0],
            drops: [
                { id: "materials_086", rate: 0.4 },
                { id: "materials_093", rate: 0.4 }
            ],
            skills: [
                // 高伤害 (10%)
                { id: "绝命践踏", rate: 0.1, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%)
                { id: "轻踢", rate: 0.2, type: 1, damage: 0.9, damageType: "phy", dmgValType: 1 },
                // 常规 (50%)
                { id: "后蹄重踢", rate: 0.5, type: 1, damage: 1.3, damageType: "phy", dmgValType: 1 },
                // 功能 (20%)
                { id: "暴走", rate: 0.2, type: 3, buffAttr: "speed", buffValue: 10, buffTimes: 3 }
            ],
            desc: "原本温顺的御马受法力惊扰，挣脱了缰绳，在行宫走廊内横冲直撞。"
        },
        {
            id: "raid_exhausted_courier",
            name: "力竭的传令兵",
            template: "minion",
            rank: "minion",
            subType: "human",
            defType: "light",
            stats: {
                hp: 90,
                phy_atk: 20, mag_atk: 0,
                phy_def: 8, mag_def: 5,
                speed: 18
            },
            money: [10, 20],
            drops: [
                { id: "materials_089", rate: 0.4 },
                { id: "materials_092", rate: 0.3 }
            ],
            skills: [
                // 高伤害 (10%)
                { id: "绝命透甲", rate: 0.1, type: 1, damage: 2.2, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%)
                { id: "挥砍", rate: 0.2, type: 1, damage: 0.9, damageType: "phy", dmgValType: 1 },
                // 常规 (50%)
                { id: "短剑突刺", rate: 0.5, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
                // 功能 (20%)
                { id: "喘息", rate: 0.2, type: 3, buffAttr: "phy_def", buffValue: 5, buffTimes: 2 }
            ],
            desc: "身负重要密令的驿骑，在翻下马背的一刻被狂暴法力占据了身体。"
        },
        {
            id: "raid_wild_wolf",
            name: "嗅血的山林饿狼",
            template: "minion",
            rank: "minion",
            subType: "beast",
            defType: "leather",
            stats: {
                hp: 100,
                phy_atk: 22, mag_atk: 0,
                phy_def: 4, mag_def: 2,
                speed: 22
            },
            money: [0, 0],
            drops: [
                { id: "materials_086", rate: 0.5 },
                { id: "materials_092", rate: 0.4 }
            ],
            skills: [
                // 高伤害 (10%)
                { id: "疯狂撕碎", rate: 0.1, type: 1, damage: 2.3, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%)
                { id: "扑击", rate: 0.2, type: 1, damage: 0.9, damageType: "phy", dmgValType: 1 },
                // 常规 (50%)
                { id: "撕咬", rate: 0.5, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
                // 功能 (20%)
                { id: "嗜血", rate: 0.2, type: 3, buffAttr: "phy_atk", buffValue: 8, buffTimes: 3 }
            ],
            desc: "沙丘行宫附近的野狼，嗅到了宫殿内浓郁的生机与死亡交织的气息，变得异常亢奋。"
        }
    ],

    // --- 5个 Elite (精英级)：5个技能 ---
    elite: [
        // ==========================================
// 精英级怪物 (Elite) 标准化技能格式重构
// ==========================================
        {
            id: "raid_elite_lieutenant",
            name: "暴走的行宫校尉",
            template: "elite",
            rank: "elite",
            subType: "human",
            defType: "heavy",
            stats: {
                hp: 315,
                phy_atk: 38, mag_atk: 4,
                phy_def: 18, mag_def: 10,
                speed: 15
            },
            money: [50, 100],
            drops: [
                { id: "materials_096", rate: 0.3 },
                { id: "materials_117", rate: 0.2 }
            ],
            skills: [
                // 很高伤害 (10%) - 真气暴血 (物理百分比)
                { id: "真气暴血", rate: 0.1, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%) - 旋风重劈
                { id: "旋风重劈", rate: 0.2, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
                // 常规技能 (40%)
                { id: "破空斩", rate: 0.4, type: 1, damage: 1.3, damageType: "phy", dmgValType: 1 },
                // Debuff (10%) - 缴械
                { id: "缴械", rate: 0.1, type: 2, debuffAttr: "phy_atk", debuffValue: 0.15, debuffValType: 1, debuffTimes: 2 },
                // Buff (20%)
                { id: "校尉威压", rate: 0.2, type: 3, buffAttr: "phy_atk", buffValue: 12, buffTimes: 3 }
            ],
            desc: "原本负责寝殿安保的将领，此刻浑身肌肉扭曲，皮肤呈现出金属般的乌青。"
        },
        {
            id: "raid_elite_alchemist",
            name: "脱力的御前医方",
            template: "elite",
            rank: "elite",
            subType: "human",
            defType: "cloth",
            stats: {
                hp: 250,
                phy_atk: 5, mag_atk: 42,
                phy_def: 8, mag_def: 18,
                speed: 18
            },
            money: [80, 150],
            drops: [
                { id: "materials_113", rate: 0.4 },
                { id: "materials_114", rate: 0.2 }
            ],
            skills: [
                // 很高伤害 (10%) - 天地炉火 (法术百分比)
                { id: "天地炉火", rate: 0.1, type: 1, damage: 3.5, damageType: "mag", dmgValType: 1 },
                // 低伤害 (20%) - 废丹引爆
                { id: "废丹引爆", rate: 0.2, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
                // 常规技能 (40%)
                { id: "汞毒粉末", rate: 0.4, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
                // Debuff (10%) - 腐蚀药雾
                { id: "腐蚀药雾", rate: 0.1, type: 2, debuffAttr: "phy_def", debuffValue: 0.2, debuffValType: 1, debuffTimes: 3 },
                // Buff (20%)
                { id: "服药", rate: 0.2, type: 3, buffAttr: "speed", buffValue: 15, buffTimes: 3 }
            ],
            desc: "曾为始皇炼丹的方士，在法力倒灌时贪婪汲取，导致神智崩溃，周身散发着刺鼻的药石味。"
        },
        {
            id: "raid_elite_guard_captain",
            name: "震颤的行宫禁卫长",
            template: "elite",
            rank: "elite",
            subType: "human",
            defType: "plate",
            stats: {
                hp: 380,
                phy_atk: 25, mag_atk: 15,
                phy_def: 25, mag_def: 15,
                speed: 12
            },
            money: [60, 120],
            drops: [
                { id: "materials_096", rate: 0.4 },
                { id: "materials_117", rate: 0.3 }
            ],
            skills: [
                // 很高伤害 (10%) - 禁卫绝杀
                { id: "禁卫绝杀", rate: 0.1, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%) - 盾击
                { id: "盾击", rate: 0.2, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 },
                // 常规技能 (40%)
                { id: "突刺", rate: 0.4, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
                // Debuff (10%) - 锁足
                { id: "锁足", rate: 0.1, type: 2, debuffAttr: "speed", debuffValue: 8, debuffTimes: 3 },
                // Buff (20%)
                { id: "铁壁之志", rate: 0.2, type: 3, buffAttr: "phy_def", buffValue: 15, buffTimes: 4 }
            ],
            desc: "大秦最精锐的卫兵，即便在癫狂中依然保持着死守行宫的战斗姿势。"
        },
        {
            id: "raid_elite_official",
            name: "癫狂的执笔史官",
            template: "elite",
            rank: "elite",
            subType: "human",
            defType: "cloth",
            stats: {
                hp: 260,
                phy_atk: 10, mag_atk: 38,
                phy_def: 10, mag_def: 20,
                speed: 14
            },
            money: [100, 200],
            drops: [
                { id: "materials_112", rate: 0.2 },
                { id: "materials_099", rate: 0.4 }
            ],
            skills: [
                // 很高伤害 (10%) - 笔墨诛心
                { id: "笔墨诛心", rate: 0.1, type: 1, damage: 3.3, damageType: "mag", dmgValType: 1 },
                // 低伤害 (20%) - 简牍重击
                { id: "简牍重击", rate: 0.2, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
                // 常规技能 (40%)
                { id: "飞毫如箭", rate: 0.4, type: 1, damage: 1.3, damageType: "mag", dmgValType: 1 },
                // Debuff (10%) - 律令·禁
                { id: "律令·禁", rate: 0.1, type: 2, debuffAttr: "speed", debuffValue: 12, debuffTimes: 3 },
                // Buff (20%)
                { id: "文气护体", rate: 0.2, type: 3, buffAttr: "mag_def", buffValue: 10, buffTimes: 5 }
            ],
            desc: "正在记录陛下遗诏的史官，受惊后将手中的青铜笔当成了致命的杀器。"
        },
        {
            id: "raid_elite_shadow_guard",
            name: "错乱的影中死士",
            template: "elite",
            rank: "elite",
            subType: "human",
            defType: "light",
            stats: {
                hp: 240,
                phy_atk: 48, mag_atk: 12,
                phy_def: 8, mag_def: 8,
                speed: 25
            },
            money: [40, 90],
            drops: [
                { id: "materials_059", rate: 0.2 },
                { id: "materials_082", rate: 0.1 }
            ],
            skills: [
                // 很高伤害 (10%) - 瞬狱杀
                { id: "瞬狱杀", rate: 0.1, type: 1, damage: 3.8, damageType: "phy", dmgValType: 1 },
                // 低伤害 (20%) - 背刺
                { id: "背刺", rate: 0.2, type: 1, damage: 2.2, damageType: "phy", dmgValType: 1 },
                // 常规技能 (40%)
                { id: "影袭", rate: 0.4, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 },
                // Debuff (10%) - 烟幕
                { id: "烟幕", rate: 0.1, type: 2, debuffAttr: "phy_atk", debuffValue: 0.2, debuffValType: 1, debuffTimes: 2 },
                // Buff (20%)
                { id: "暗涌", rate: 0.2, type: 3, buffAttr: "speed", buffValue: 20, buffTimes: 3 }
            ],
            desc: "潜伏在行宫暗影处的保镖，法力倒灌让他们与阴影的融合失去了控制。"
        }
    ],

    // --- 3个 Boss (首领级)：8个技能 ---
    boss: [
        // ==========================================
// 头目级怪物 (Boss) 标准技能格式重构
// ==========================================
        {
            id: "raid_boss_chamberlain",
            name: "癫狂的沙丘内侍长",
            template: "boss",
            rank: "boss",
            subType: "human",
            defType: "cloth",
            // 倾向性: mag (纯法术)
            stats: {
                hp: 756,
                phy_atk: 6, mag_atk: 63,
                phy_def: 13, mag_def: 22,
                speed: 15,
                atk: 63, def: 22
            },
            money: [300, 400],
            drops: [
                { id: "materials_127", rate: 0.05 },
                { id: "materials_129", rate: 0.5 }
            ],
            skills: [
                { id: "法力坍缩", rate: 0.05, type: 1, damage: 3.5, damageType: "mag", dmgValType: 1 },
                { id: "行宫绝响", rate: 0.1, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },
                { id: "内劲掌掴", rate: 0.2, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
                { id: "拂尘乱舞", rate: 0.45, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
                { id: "内侍威仪", rate: 0.1, type: 3, buffAttr: "speed", buffValue: 15, buffTimes: 4 },
                { id: "绝望目光", rate: 0.1, type: 2, debuffAttr: "mag_def", debuffValue: 0.2, debuffValType: 1, debuffTimes: 4 }
            ],
            desc: "【头目】沙丘行宫的总管，最先目睹陛下驾崩的人。他在极度的恐惧中吞噬了陛下逸散的第一缕龙气。"
        },
        {
            id: "raid_boss_general",
            name: "脱控的行宫镇守将",
            template: "boss",
            rank: "boss",
            subType: "human",
            defType: "plate",
            // 倾向性: tank (肉盾)
            stats: {
                hp: 756,
                phy_atk: 37, mag_atk: 37,
                phy_def: 30, mag_def: 26,
                speed: 15,
                atk: 37, def: 30
            },
            money: [300, 400],
            drops: [
                { id: "materials_118", rate: 0.1 },
                { id: "materials_103", rate: 0.3 }
            ],
            skills: [
                { id: "定秦绝剑", rate: 0.05, type: 1, damage: 4.0, damageType: "phy", dmgValType: 1 },
                { id: "山崩地裂", rate: 0.1, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
                { id: "横扫千军", rate: 0.2, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
                { id: "破阵一枪", rate: 0.45, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 },
                { id: "战阵杀气", rate: 0.1, type: 3, buffAttr: "phy_atk", buffValue: 0.25, buffValType: 1, buffTimes: 5 },
                { id: "沉重威压", rate: 0.1, type: 2, debuffAttr: "speed", debuffValue: 10, debuffTimes: 5 }
            ],
            desc: "【头目】驻扎沙丘的最高统帅，他的战甲已被狂暴的法力撑开，每一寸皮肤都充满了爆发性的毁灭力量。"
        },
        {
            id: "raid_boss_chief_fangshi",
            name: "神志错乱的随行首席",
            template: "boss",
            rank: "boss",
            subType: "human",
            defType: "cloth",
            // 倾向性: mag (纯法术)
            stats: {
                hp: 756,
                phy_atk: 6, mag_atk: 63,
                phy_def: 13, mag_def: 22,
                speed: 15,
                atk: 63, def: 22
            },
            money: [300, 400],
            drops: [
                { id: "materials_123", rate: 0.1 },
                { id: "materials_124", rate: 0.5 }
            ],
            skills: [
                { id: "长生幻灭", rate: 0.05, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },
                { id: "阴阳逆转", rate: 0.1, type: 1, damage: 3.5, damageType: "mag", dmgValType: 1 },
                { id: "五雷错位", rate: 0.2, type: 1, damage: 2.2, damageType: "mag", dmgValType: 1 },
                { id: "乱灵符", rate: 0.45, type: 1, damage: 1.5, damageType: "mag", dmgValType: 1 },
                { id: "入道疯魔", rate: 0.1, type: 3, buffAttr: "mag_atk", buffValue: 0.3, buffValType: 1, buffTimes: 3 },
                { id: "感官剥夺", rate: 0.1, type: 2, debuffAttr: "speed", debuffValue: 20, debuffTimes: 4 }
            ],
            desc: "【头目】始皇最信赖的首席方士，因在驾崩现场试图通过禁术挽回圣命，导致灵魂被天地之威瞬间冲垮。"
        }
    ]
};

function initRaidEnemyData() {
    const processedData = {};

    // 辅助函数：处理单个敌人的逻辑（和你提供的示例逻辑一致）
    const processOne = (e) => {
        const tmpl = ENEMY_TEMPLATES[e.template || "minion"];
        if (!tmpl) return e;

        // 深拷贝基础属性
        let finalStats = {...e.stats};

        // 应用模板倍率
        finalStats.hp = Math.floor(finalStats.hp * tmpl.multipliers.hp);
        finalStats.atk = finalStats.atk?Math.floor(finalStats.atk * tmpl.multipliers.atk):0;
        finalStats.phy_atk =  Math.floor(finalStats.phy_atk * tmpl.multipliers.atk);
        finalStats.mag_atk =  Math.floor(finalStats.mag_atk * tmpl.multipliers.atk);
        finalStats.phy_def = Math.floor(finalStats.phy_def * tmpl.multipliers.def);
        finalStats.mag_def = Math.floor(finalStats.mag_def * tmpl.multipliers.def);
        finalStats.def = finalStats.def?Math.floor(finalStats.def * tmpl.multipliers.def):0;
        finalStats.speed = Math.floor(finalStats.speed * tmpl.multipliers.speed);

        // 2. 【新增】处理技能伤害倍率
        let finalSkills = [];
        if (e.skills && Array.isArray(e.skills)) {
            finalSkills = e.skills.map(originalSkill => {
                // 浅拷贝技能对象，以免修改原始配置
                const skill = { ...originalSkill };

                // 如果是伤害技能 (type: 1)，应用攻击倍率
                if (skill.type === 1 && skill.damage && skill.dmgValType === 0) {
                    // damage * atk倍率
                    skill.damage = Math.floor(skill.damage * tmpl.multipliers.atk);
                }
                return skill;
            });
        }

        // 计算经验值和金钱倍率
        // (注意：这里使用应用了倍率后的属性来计算Exp，确保精英/Boss经验更高)
        const expBase = Math.floor(finalStats.hp / 2 + finalStats.atk * 2);
        const exp = Math.floor(expBase * tmpl.multipliers.exp);

        const money = [
            Math.floor(e.money[0] * tmpl.multipliers.money),
            Math.floor(e.money[1] * tmpl.multipliers.money)
        ];

        // 加上颜色标签
        const nameHtml = `<span style="color:${tmpl.color}">${e.name}</span>`;

        return {
            ...e,
            nameHtml : nameHtml, // 用于UI显示
            levelType: tmpl.name, // 显示为 [精英] 等
            stats    : finalStats,
            exp      : exp,
            money    : money,
            skills   : finalSkills, // <--- 使用修正后的技能列表
        };
    };

    // 遍历原始数据的每个分类 (minion, elite, boss)
    for (const rank in EVENT_RAID_ENEMIES) {
        if (Array.isArray(EVENT_RAID_ENEMIES[rank])) {
            // 对每个数组进行 map 处理
            processedData[rank] = EVENT_RAID_ENEMIES[rank].map(processOne);
        }
    }

    return processedData;
}

// ==========================================
// 4. 执行初始化并挂载到全局
// ==========================================
window.EVENT_RAID_ENEMIES = initRaidEnemyData();

console.log("RAID数据初始化完成:", window.EVENT_RAID_ENEMIES);

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
// window.testRaid = function(rank = 'minion', waves = 1,isDeath = true) {
//     console.log(`%c[Raid Test] 启动模拟：级别=${rank}, 波次=${waves}`, "color: #1e88e5; font-weight: bold;");
//
//     if (!window.EVENT_RAID_ENEMIES) {
//         console.error("错误: 未找到 EVENT_RAID_ENEMIES 配置。");
//         return;
//     }
//     if (isDeath && window.player) {
//         if (!window.player.buffs) window.player.buffs = {};
//
//         // 定义濒死BUFF
//         const NEAR_DEATH_ID = 'buff_near_death';
//         if (window.addBuff) {
//             window.addBuff(NEAR_DEATH_ID, {
//                 name: "濒死",
//                 attr: "状态",
//                 val: "重伤",
//                 days: 7,
//                 source: "战斗失败",
//                 isDebuff: true,
//                 desc: "你刚从鬼门关回来，身体极度虚弱。若在此期间再次重伤，恐有性命之忧。"
//             });
//         }
//
//         if(window.showToast) window.showToast("⚠️ 遭遇强敌，陷入【濒死】状态！战败即死！");
//         console.log("已添加濒死BUFF:", window.player.buffs[NEAR_DEATH_ID]);
//
//         // 刷新一下UI，确保BUFF栏显示
//         if(window.updateUI) window.updateUI();
//     }
//
//     const startWave = (currentWave, totalWaves, currentRank) => {
//         // 1. 获取敌人数据
//         const pool = window.EVENT_RAID_ENEMIES[currentRank];
//         console.log(`当前波数: ${currentWave}/${totalWaves}, 当前等级: ${currentRank}`)
//         console.log(`敌人池: ${pool}`,pool)
//         if (!pool || pool.length === 0) {
//             console.error(`错误: 级别 [${currentRank}] 的敌人池为空`);
//             return;
//         }
//
//         const template = pool[Math.floor(Math.random() * pool.length)];
//         console.log(`当前敌人: ${template}`,template)
//         const enemyInstance = UtilsEnemy._buildEnemyInstance(template, 400, 300);
//
//         console.log(`%c[波次 ${currentWave}/${totalWaves}] 敌人: ${enemyInstance.name}`, "color: #43a047;",enemyInstance);
//
//         const isLastWave = currentWave >= totalWaves;
//
//         // 2. 配置参数
//         const finalOptions = {
//             canEscape: false,
//             // 关键：告诉底层这是多波次战斗，胜利后不要显示默认的“关闭”按钮
//             // 我们会在回调里自己画“下一波”按钮
//             isMultiWave: !isLastWave,
//             allowOutsideClick: false,
//             allowEsc: false,
//             // =========== 【新增】 ===========
//             // 标记为“死斗”模式：战败即兵解
//             isDeathBattle: true
//         };
//
//         // 3. 定义通用的胜利回调逻辑
//         const onWinCallback = () => {
//             // 如果不是最后一波，显示“下一波”按钮
//             if (!isLastWave) {
//
//                 console.log(`%c[波次 ${currentWave}] 胜利！等待玩家手动开启下一波...`, "color: #fb8c00;");
//
//                 // 计算下一波难度
//                 let nextRank = currentRank;
//                 // 简单的阶梯逻辑：
//                 // 打赢第1波 -> 下一波是 Elite
//                 if (currentWave === 1) nextRank = 'elite';
//                 // 打赢第2波 -> 下一波是 Boss (这样第3波就是Boss了)
//                 if (currentWave === 2) nextRank = 'boss';
//                 // 如果有第4波 -> 下一波是 Lord
//                 if (currentWave >= 3) nextRank = 'lord';
//                 console.log(`%c[波次 ${currentWave}] 下一波难度：${nextRank}`, "color: #4caf50;");
//                 // --- 【核心修改】 ---
//                 // 1. 获取底部按钮区域
//                 const footer = document.getElementById('map_combat_footer');
//                 if (footer) {
//                     // 2. 生成唯一的按钮ID，防止冲突
//                     const nextBtnId = 'btn_next_wave_' + Date.now();
//
//                     // 3. 渲染“迎战下一波”按钮
//                     footer.innerHTML = `
//                         <div style="width:100%; text-align:center; color:#f57f17; font-weight:bold; margin-bottom:5px; font-size:16px;">
//                             ⚠️ 敌军援军已至，请整顿备战！
//                         </div>
//                         <button id="${nextBtnId}" class="ink_btn_danger" style="width:100%; height:45px; font-size:20px; font-weight:bold; box-shadow: 0 0 10px rgba(211, 47, 47, 0.4);">
//                             ⚔️ 迎战下一波
//                         </button>
//                     `;
//
//                     // 4. 绑定点击事件：点击后立即开始下一波
//                     document.getElementById(nextBtnId).onclick = function() {
//                         // 播放一个简单的点击反馈（可选）
//                         this.innerText = "正在加载...";
//                         this.disabled = true;
//
//                         // 启动下一波
//                         startWave(currentWave + 1, totalWaves, nextRank);
//                     };
//                 }
//
//             } else {
//                 // 如果是最后一波，显示最终胜利信息
//                 console.log("%c[测试结束] 最终胜利！所有波次已清除。", "color: #fdd835; font-weight: bold;");
//                 if(window.showToast) window.showToast("🎉 守城成功！");
//
//                 // 因为 finalOptions.isMultiWave 为 false，底层 CombatCore 会自动渲染“凯旋而归”按钮，
//                 // 所以这里不需要我们要手动操作 footer
//             }
//         };
//
//         // 4. 调用显示/刷新方法
//         if (window.UICombatModal) {
//             if (currentWave === 1) {
//                 UICombatModal.show(enemyInstance, onWinCallback, finalOptions);
//             } else {
//                 UICombatModal.nextWave(enemyInstance, onWinCallback, finalOptions);
//             }
//         } else {
//             console.error("错误: 未找到 UICombatModal 模块。");
//         }
//     };
//
//     // 启动第一波
//     const initialRank = waves > 1 ? 'minion' : rank;
//     startWave(1, waves, initialRank);
// };
console.log("%c怪物来袭测试工具已载入！", "color: #8e24aa; font-weight: bold;");
console.log("输入 testRaid('minion') 测试普通怪");
console.log("输入 testRaid('elite') 测试精英怪");
console.log("输入 testRaid('boss') 测试BOSS");
console.log("输入 testRaid('minion', 3) 测试三连战(符合阶段1剧情)");