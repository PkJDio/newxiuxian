
// ==========================================
// 使用示例 (调试用)
// ==========================================
// 1. 生成一个初期物理小怪 (timeStart: 0)
// console.log(EnemyCalc.getStats("minion", 0, "human", "phy"));
// => { hp: 90, phy_atk: 18, mag_atk: 1, phy_def: 4, mag_def: 2 ... }

// 2. 生成一个后期法术领主 (timeStart: 2)
// console.log(EnemyCalc.getStats("lord", 2, "undead", "mag"));
// => HP 会基于 90 * 1.8(时间) * 12(阶级) * 1.4(种族) ≈ 2721

// 辅助函数：应用模板属性
// (游戏初始化时需调用此逻辑处理 rawEnemies)
// ================= 2. 敌人列表 (Enemies) =================
// ================= 2. 敌人数据构建 =================

// --- Part A: 全区域通用 (Global) [20条] ---
const enemies_all = [

    {
        id: "global_001", template: "minion", name: "流浪野狗", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "none",
        atkType: "Agile", // 逻辑：低伤高频技能组合，速度适中，典型的敏捷物理单位
        stats: { hp: 130, phy_atk: 6, mag_atk: 0, phy_def: 1, mag_def: 0, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_001", rate: 0.4 },
            { id: "materials_002", rate: 0.3 },
        ],
        skills: [
            { id: "撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "疯狗扑击", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "乱世中随处可见的野狗，双眼发红，为了护食非常凶狠。"
    },
    {
        id: "global_002", template: "minion", name: "疯狂老鼠", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "none",
        atkType: "Agile", // 逻辑：极高速度(15)，小体积单位，符合低伤高频定位
        stats: { hp: 120, phy_atk: 4, mag_atk: 0, phy_def: 0, mag_def: 0, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_028", rate: 0.1 }
        ],
        skills: [
            { id: "门牙啃噬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "弱点偷袭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "体型硕大的老鼠，为了抢一口吃的，连人都敢咬。"
    },
    {
        id: "global_003", template: "minion", name: "草丛毒蛇", region: "all", spawnType: "grass", timeStart: 0,
        subType: "insect",
        defType: "leather",
        atkType: "Relic", // 逻辑：自带法术伤害(mag_atk: 5)且技能包含法术加成，符合“专克凡铁”定位
        stats: { hp: 125, phy_atk: 15, mag_atk: 5, phy_def: 2, mag_def: 1, speed: 12, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "materials_005", rate: 0.4 },
            { id: "materials_006", rate: 0.4 }
        ],
        skills: [
            { id: "毒牙突袭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "毒液喷射", rate: 0.1, type: 1, damage: 1.5, damageType: "mag", dmgValType: 1 }
        ],
        desc: "潜伏在草丛深处，攻击带有剧毒，咬一口可能致命。"
    },
    {
        id: "global_004", template: "minion", name: "山林灰狼", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "leather",
        atkType: "Balanced", // 逻辑：数值较平均，防御速度均衡，适合作为标准物理怪
        stats: { hp: 160, phy_atk: 14, mag_atk: 0, phy_def: 4, mag_def: 2, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_007", rate: 0.5 },
            { id: "materials_008", rate: 0.4 }
        ],
        skills: [
            { id: "利爪挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "锁喉", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "成群结队出没的掠食者，听到狼嚎时最好赶紧爬树。"
    },
    {
        id: "global_005", template: "minion", name: "暴躁野猪", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy",
        atkType: "Heavy", // 逻辑：牺牲速度(8)，高物理攻击与高防御，技能“蛮力冲撞”追求破甲感
        stats: { hp: 180, phy_atk: 18, mag_atk: 0, phy_def: 10, mag_def: 3, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_030", rate: 0.5 },
            { id: "materials_004", rate: 0.4 },
        ],
        skills: [
            { id: "獠牙挑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "蛮力冲撞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "皮糙肉厚，发起疯来连老虎都要避让三分。"
    },

    // ==========================================
    // 2. 乱世流民与强盗
    // ==========================================
    // ==========================================
    // 2. 乱世流民与强盗 (数值小数化重构版)
    // ==========================================
    {
        id: "global_006", template: "minion", name: "饥饿流民", region: "all", spawnType: "road", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Agile", // 乱抓、死缠烂打，典型低伤高频敏捷逻辑
        stats: { hp: 140, phy_atk: 5, mag_atk: 0, phy_def: 1, mag_def: 1, speed: 4 },
        money: [0, 5],
        drops: [{ id: "weapons_003", rate: 0.2 }],
        skills: [
            { id: "乱抓", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "绝望撕咬", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 },
            { id: "死缠烂打", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "衣衫褴褛，面黄肌瘦，为了活下去已经不顾一切。"
    },
    {
        id: "global_007", template: "minion", name: "疯癫乞丐", region: "all", spawnType: "road", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 携带大量修行书，且有mag_atk和干扰精神技能
        stats: { hp: 150, phy_atk: 9, mag_atk: 5, phy_def: 2, mag_def: 4, speed: 6 },
        money: [0, 10],
        drops: [
            { id: "weapons_069", rate: 0.4 },
            { id: "book_cultivation_r1_00_full", rate: 0.01 }, // ...后续省略
        ],
        skills: [
            { id: "打狗棍法(乱)", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "发疯猛击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "疯言疯语", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "神智不清的乞丐，嘴里念叨着无人能懂的疯话。"
    },
    {
        id: "global_008", template: "minion", name: "拦路蟊贼", region: "all", spawnType: "road", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Balanced", // 基础人类怪，各属性中规中矩
        stats: { hp: 170, phy_atk: 13, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 6 },
        money: [5, 20],
        drops: [{ id: "weapons_013", rate: 0.3 }],
        skills: [
            { id: "袖里藏刀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "背刺", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 },
            { id: "撒石灰", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "手里拿着生锈的刀，专门在官道旁打劫过路客。"
    },
    {
        id: "global_009", template: "minion", name: "秦军逃兵", region: "all", spawnType: "road", timeStart: 1,
        subType: "human", defType: "light",
        atkType: "Heavy", // 军旅背景，高防且有“致命突刺”，适合作为物理压制者
        stats: { hp: 190, phy_atk: 18, mag_atk: 0, phy_def: 10, mag_def: 3, speed: 5 },
        money: [10, 40],
        drops: [{ id: "weapons_037", rate: 0.2 }, { id: "weapons_220", rate: 0.1 }],
        skills: [
            { id: "军体拳", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "致命突刺", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "擒拿手", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "受不了繁重徭役逃出来的士兵，依然保留着军中的杀人技。"
    },
    {
        id: "global_010", template: "elite", name: "强盗头子", region: "all", spawnType: "road", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 武器为开山斧，且为重甲精英，主打破甲逻辑
        stats: { hp: 160, phy_atk: 28, mag_atk: 5, phy_def: 15, mag_def: 5, speed: 7 },
        money: [50, 120],
        drops: [{ id: "weapons_013", rate: 0.2 }, { id: "head_017", rate: 0.2 }],
        skills: [
            { id: "重脚踢", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "开山斧法", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "匪首怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】纠集了一帮亡命之徒，占据山头称大王。"
    },
    {
        id: "global_011", template: "minion", name: "采药竞争者", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Balanced", // 虽然速度稍快，但整体属性分布平滑
        stats: { hp: 160, phy_atk: 8, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 9 },
        money: [20, 50],
        drops: [{ id: "herbs_001", rate: 0.3 }, { id: "weapons_010", rate: 0.2 }],
        skills: [
            { id: "挥舞药锄", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "飞镰割喉", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "同行是冤家，为了争夺一株灵草可能会拔刀相向。"
    },
    {
        id: "global_012", template: "elite", name: "通缉大盗", region: "all", spawnType: "road", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile", // 袖剑连刺，典型的高速度(10)物理暴击定位
        stats: { hp: 180, phy_atk: 35, mag_atk: 10, phy_def: 15, mag_def: 8, speed: 10 },
        money: [100, 200],
        drops: [{ id: "weapons_013", rate: 0.1 }, { id: "book_body_r1_03_full", rate: 0.01 }],
        skills: [
            { id: "袖剑连刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "绝命背刺", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "撒石灰", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】官府悬赏百金的要犯，杀人不眨眼，身手了得。"
    },
    {
        id: "global_013", template: "elite", name: "赏金猎人", region: "all", spawnType: "road", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Range", // 使用精准连射、穿心箭，完全符合远射模组
        stats: { hp: 150, phy_atk: 32, mag_atk: 5, phy_def: 12, mag_def: 8, speed: 11 },
        money: [50, 100],
        drops: [{ id: "weapons_040", rate: 0.1 }, { id: "weapons_025", rate: 0.2 }],
        skills: [
            { id: "精准连射", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "穿心箭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "断筋箭", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】拿人钱财替人消灾，把你当成了行走的赏金。"
    },
    {
        id: "global_014", template: "elite", name: "蒙面杀手", region: "all", spawnType: "road", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Agile", // 速度极高(16)，瞬狱影杀，追求极致爆发
        stats: { hp: 140, phy_atk: 45, mag_atk: 10, phy_def: 6, mag_def: 6, speed: 16, toxicity: 20 },
        money: [80, 150],
        drops: [{ id: "weapons_039", rate: 0.2 }],
        skills: [
            { id: "毒刃挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "瞬狱影杀", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "致盲烟雾", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "【精英】不知受何人指使的刺客，招招直奔要害。"
    },
    {
        id: "global_015", template: "boss", name: "义军首领", region: "all", spawnType: "road", timeStart: 2,
        subType: "human", defType: "plate",
        atkType: "Heavy", // 力劈华山、崩山裂地，重甲Boss的终极破甲攻击
        stats: { hp: 972, phy_atk: 81, mag_atk: 8, phy_def: 28, mag_def: 16, speed: 15 },
        money: [150, 400],
        drops: [{ id: "weapons_036", rate: 0.1 }, { id: "materials_038", rate: 0.5 }],
        skills: [
            { id: "凶猛挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "力劈华山", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "崩山裂地斩", rate: 0.05, type: 1, damage: 2.2, damageType: "phy", dmgValType: 1 },
            { id: "震慑怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "振臂高呼", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【头目】打着起义旗号的枭雄，手下聚集了数千人马。"
    },

// ==========================================
// 4. 环境与超自然
// ==========================================
    {
        id: "global_016", template: "minion", name: "食腐秃鹫", region: "all", spawnType: "desert", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：14点高速度，快速啄击，符合低伤高频敏捷定位
        stats: { hp: 140, phy_atk: 18, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 14 },
        money: [0, 0],
        drops: [{ id: "materials_031", rate: 0.5 }, { id: "foodMaterial_050", rate: 0.2 }],
        skills: [
            { id: "凶狠啄击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "高空俯冲", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "盘旋在战场上空，专门啄食死尸的眼睛。"
    },
    {
        id: "global_017", template: "minion", name: "河中水鬼", region: "all", spawnType: "river", timeStart: 0,
        subType: "undead", defType: "none",
        atkType: "Relic", // 逻辑：法术伤害(mag_atk: 12)且属于灵体，专克物理防御
        stats: { hp: 170, phy_atk: 18, mag_atk: 12, phy_def: 5, mag_def: 8, speed: 8 },
        money: [0, 5],
        drops: [{ id: "materials_032", rate: 0.1 }, { id: "weapons_015", rate: 0.2 }],
        skills: [
            { id: "惨白鬼爪", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "怨气冲击", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "溺死之人的怨气所化，会把路过岸边的人拖入水中。"
    },
    {
        id: "global_018", template: "elite", name: "吊睛白额虎", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Balanced", // 逻辑：全能型精英，高物攻高速度，数值分配非常均衡
        stats: { hp: 250, phy_atk: 50, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 12 },
        money: [0, 0],
        drops: [{ id: "materials_020", rate: 0.5 }, { id: "materials_021", rate: 0.5 }, { id: "materials_022", rate: 0.5 }],
        skills: [
            { id: "虎爪撕扯", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "锁喉咬杀", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "百兽之王", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】山中霸主，体型巨大，寻常刀剑难伤分毫。"
    },
    {
        id: "global_019", template: "elite", name: "狂暴黑熊", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：低速(6)高血，泰山压顶，追求力量碾压
        stats: { hp: 300, phy_atk: 45, mag_atk: 0, phy_def: 30, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [{ id: "materials_023", rate: 0.6 }, { id: "materials_034", rate: 0.5 }],
        skills: [
            { id: "熊掌拍击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "野蛮冲撞", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "震慑咆哮", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】力大无穷的黑熊，人立起来有一丈高。"
    },
    {
        id: "global_020", template: "minion", name: "游荡尸傀", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead", defType: "heavy",
        atkType: "Heavy", // 逻辑：极低速度(3)，牺牲频率追求破甲
        stats: { hp: 120, phy_atk: 15, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 3 },
        money: [0, 0],
        drops: [{ id: "materials_035", rate: 0.3 }],
        skills: [
            { id: "尸爪抓挠", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "饿虎扑食", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "死而不僵的尸体，受到阴气侵蚀重新站了起来，不知疼痛。"
    },
    {
        id: "global_021", template: "minion", name: "拦路响马", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Balanced", // 逻辑：普通强盗，各属性标准平滑
        stats: { hp: 140, phy_atk: 18, mag_atk: 0, phy_def: 12, mag_def: 5, speed: 5 },
        money: [5, 15],
        drops: [{ id: "materials_001", rate: 0.2 }, { id: "weapons_151", rate: 0.05 }],
        skills: [
            { id: "锈刀挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "跳劈", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "埋伏在官道两旁的强盗，手持锈刀，只求财不害命...通常来说。"
    },
    {
        id: "global_022", template: "minion", name: "野狗", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：低防御高机动，群体攻击，符合敏捷逻辑
        stats: { hp: 180, phy_atk: 12, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 8 },
        money: [0, 0],
        drops: [{ id: "materials_010", rate: 0.4 }],
        skills: [
            { id: "撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "狂吠突袭", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "饥肠辘辘的野狗，成群结队，眼神中透着凶光。"
    },
    {
        id: "global_023", template: "minion", name: "溃逃士卒", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：使用长矛突刺，提供物理压制且自带防御感
        stats: { hp: 130, phy_atk: 16, mag_atk: 0, phy_def: 15, mag_def: 5, speed: 4 },
        money: [2, 8],
        drops: [{ id: "materials_022", rate: 0.15 }],
        skills: [
            { id: "长矛突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "困兽犹斗", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "从前线逃下来的士兵，盔甲歪斜，为了活命会攻击任何人。"
    },
    {
        id: "global_024", template: "minion", name: "云游假道", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：混杂法术伤害(掌心雷)，符合法宝模组定位
        stats: { hp: 110, phy_atk: 8, mag_atk: 12, phy_def: 8, mag_def: 10, speed: 6 },
        money: [10, 25],
        drops: [{ id: "materials_051", rate: 0.3 }],
        skills: [
            { id: "飞掷令箭", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "掌心雷(火药)", rate: 0.1, type: 1, damage: 1.5, damageType: "mag", dmgValType: 1 }
        ],
        desc: "打着除魔卫道旗号招摇撞骗的道士，实际上只会些三脚猫功夫。"
    },
    {
        id: "global_025", template: "minion", name: "大黑熊", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：极低速(2)，高血高防，典型的物理碾压
        stats: { hp: 280, phy_atk: 25, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 2 },
        money: [0, 0],
        drops: [{ id: "materials_012", rate: 0.1 }, { id: "materials_013", rate: 0.5 }],
        skills: [
            { id: "熊掌", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "体型硕大的黑熊，皮糙肉厚，一巴掌能拍断树干。"
    },
    {
        id: "global_026", template: "minion", name: "竹叶青", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：高速(12)，高面板伤害，符合物理暴击风格
        stats: { hp: 160, phy_atk: 22, mag_atk: 5, phy_def: 2, mag_def: 2, speed: 12, toxicity: 40 },
        money: [0, 0],
        drops: [{ id: "materials_010", rate: 0.4 }, { id: "materials_029", rate: 0.3 }],
        skills: [
            { id: "毒牙", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "迅猛一咬", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "翠绿色的毒蛇，潜伏在草丛中，攻击速度极快且带有剧毒。"
    },
    {
        id: "global_027", template: "minion", name: "采花蜂", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Agile", // 逻辑：9点速度，使用飞针和轻功，符合轻盈设定
        stats: { hp: 100, phy_atk: 14, mag_atk: 8, phy_def: 5, mag_def: 5, speed: 9 },
        money: [5, 10],
        drops: [{ id: "materials_052", rate: 0.2 }, { id: "weapons_251", rate: 0.05 }],
        skills: [
            { id: "袖中飞针", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "铁扇点穴", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "江湖上的淫贼，轻功不错，擅长使用迷烟和暗器。"
    },
    {
        id: "global_028", template: "minion", name: "狂暴野猪", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：厚皮低速，野蛮冲撞，专克轻装玩家
        stats: { hp: 160, phy_atk: 18, mag_atk: 0, phy_def: 15, mag_def: 2, speed: 4 },
        money: [0, 0],
        drops: [{ id: "materials_011", rate: 0.4 }, { id: "foodMaterial_001", rate: 0.5 }],
        skills: [
            { id: "獠牙拱击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "野蛮冲撞", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "双眼通红的野猪，似乎受到了某种刺激，横冲直撞。"
    },
    {
        id: "global_029", template: "minion", name: "孤魂野鬼", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead", defType: "none",
        atkType: "Relic", // 逻辑：纯法术输出，吸取阳气，无视物理防具
        stats: { hp: 190, phy_atk: 5, mag_atk: 15, phy_def: 5, mag_def: 15, speed: 7 },
        money: [0, 0],
        drops: [{ id: "materials_036", rate: 0.3 }, { id: "materials_037", rate: 0.1 }],
        skills: [
            { id: "鬼爪侵蚀", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "吸取阳气", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "死后无人收敛的怨气所化，夜间飘荡在荒野，吸食生人阳气。"
    },
    {
        id: "global_030", template: "minion", name: "夜行刺客", region: "all", spawnType: "all", timeStart: 1,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：夜间出没，封喉一击，追求爆发
        stats: { hp: 110, phy_atk: 25, mag_atk: 5, phy_def: 8, mag_def: 5, speed: 10 },
        money: [20, 50],
        drops: [{ id: "weapons_253", rate: 0.08 }],
        skills: [
            { id: "匕首划击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "封喉一击", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 }
        ],
        desc: "身穿夜行衣的杀手，专挑夜晚赶路的人下手，动作干净利落。"
    },
    {
        id: "global_elite_001", template: "elite", name: "独眼响马王", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：精英重甲，开山斩，重刀横扫，破甲能力极强
        stats: { hp: 320, phy_atk: 50, mag_atk: 5, phy_def: 25, mag_def: 10, speed: 6 },
        money: [50, 120],
        drops: [{ id: "weapons_350", rate: 0.1 }, { id: "materials_045", rate: 0.2 }],
        skills: [
            { id: "重刀挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "开山斩", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "凶光毕露", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】曾也是绿林好汉，如今却变得残暴不仁，独眼透着凶光。"
    },
    {
        id: "global_elite_002", template: "elite", name: "嗜血狼王", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：12点高速度，锁喉突袭，靠速度和频率撕裂目标
        stats: { hp: 280, phy_atk: 45, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 12 },
        money: [0, 0],
        drops: [{ id: "materials_015", rate: 0.3 }, { id: "materials_016", rate: 0.1 }],
        skills: [
            { id: "迅猛撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "喉管突袭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "恐惧嚎叫", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】统领狼群的首领，体型比普通野狗大两倍，獠牙滴着鲜血。"
    },
    {
        id: "global_elite_003", template: "elite", name: "破戒武僧", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：横练功夫，碎石脚，极高的物防和破甲感
        stats: { hp: 380, phy_atk: 40, mag_atk: 10, phy_def: 45, mag_def: 20, speed: 5 },
        money: [20, 60],
        drops: [{ id: "book_body_r1_11_full", rate: 0.15 }, { id: "materials_053", rate: 0.2 }],
        skills: [
            { id: "铁砂掌", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "碎石脚", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "煞气震慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】因偷学禁术被逐出师门的武僧，一身横练功夫刀枪不入。"
    },

    {
        id: "global_elite_004", template: "elite", name: "五彩斑斓蛛", region: "all", spawnType: "forest", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：10点速度，毒牙快速攻击，虽带魔伤但主属性为高频物理
        stats: { hp: 220, phy_atk: 45, mag_atk: 10, phy_def: 10, mag_def: 5, speed: 10, toxicity: 30 },
        money: [0, 0],
        drops: [{ id: "materials_055", rate: 0.2 }, { id: "materials_054", rate: 0.2 }],
        skills: [
            { id: "剧毒螯牙", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "蚀骨毒液", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            { id: "腐蚀毒雾", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】色彩艳丽的巨型蜘蛛，越是美丽的东西越致命。"
    },
    {
        id: "global_elite_005", template: "elite", name: "红衣厉鬼", region: "all", spawnType: "graveyard", timeStart: 1,
        subType: "undead", defType: "none",
        atkType: "Relic", // 逻辑：极高魔攻(50)，纯灵体攻击，无视传统物理防具
        stats: { hp: 200, phy_atk: 5, mag_atk: 50, phy_def: 5, mag_def: 25, speed: 9 },
        money: [0, 0],
        drops: [{ id: "materials_056", rate: 0.1 }, { id: "materials_057", rate: 0.15 }],
        skills: [
            { id: "阴风阵阵", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "夺命尖啸", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "怨气缠身", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "【精英】身着嫁衣上吊而亡的女子，怨气冲天，每夜都在寻找负心人。"
    },
    {
        id: "global_elite_006", template: "elite", name: "走火入魔的剑客", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：12点速度，高物攻(60)，乱舞类技能，符合高频暴击定位
        stats: { hp: 300, phy_atk: 60, mag_atk: 0, phy_def: 15, mag_def: 5, speed: 12 },
        money: [80, 200],
        drops: [{ id: "book_body_r2_17_full", rate: 0.1 }, { id: "materials_058", rate: 0.3 }],
        skills: [
            { id: "癫狂乱舞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "疯魔剑", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "混乱剑意", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "【精英】追求剑道极致而心智迷失的剑客，见人就杀，剑招凌厉却杂乱。"
    },
    {
        id: "global_elite_007", template: "elite", name: "铁皮野猪王", region: "all", spawnType: "forest", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：4点低速，35点高防，依靠蛮力冲撞破甲
        stats: { hp: 450, phy_atk: 35, mag_atk: 0, phy_def: 35, mag_def: 10, speed: 4 },
        money: [0, 0],
        drops: [{ id: "materials_004", rate: 0.4 }, { id: "foodMaterial_051", rate: 0.3 }],
        skills: [
            { id: "巨牙挑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "野蛮冲撞", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "泥浆飞溅", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】在泥浆和松脂中打滚多年的野猪，皮肤硬得像铁甲一样。"
    },
    {
        id: "global_elite_008", template: "elite", name: "血手堂分舵主", region: "all", spawnType: "all", timeStart: 1,
        subType: "human", defType: "light",
        atkType: "Range", // 逻辑：技能包含毒镖连射，符合远射/暗器打击定位
        stats: { hp: 260, phy_atk: 55, mag_atk: 5, phy_def: 15, mag_def: 10, speed: 13 },
        money: [100, 300],
        drops: [{ id: "materials_059", rate: 0.5 }, { id: "weapons_351", rate: 0.2 }],
        skills: [
            { id: "毒镖连射", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "血手印", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "断筋", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】知名杀手组织的地区负责人，手段阴狠，从不正面硬拼。"
    },
    {
        id: "global_elite_009", template: "elite", name: "古墓铜甲尸", region: "all", spawnType: "tomb", timeStart: 1,
        subType: "undead", defType: "plate",
        atkType: "Heavy", // 逻辑：2点极低速度，50点高物理防御，势大力沉的攻击
        stats: { hp: 500, phy_atk: 45, mag_atk: 0, phy_def: 50, mag_def: 5, speed: 2 },
        money: [0, 0],
        drops: [{ id: "body_181", rate: 0.05 }],
        skills: [
            { id: "铜臂横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "铜臂千钧", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "尸毒攻心", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】生前或许是位将军，死后尸体不腐，化为铜甲尸，力大无穷。"
    },
    {
        id: "global_elite_010", template: "elite", name: "火眼金猿", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：动作敏捷，投掷与抓取并重，符合敏捷爆发逻辑
        stats: { hp: 300, phy_atk: 50, mag_atk: 10, phy_def: 20, mag_def: 10, speed: 10 },
        money: [0, 0],
        drops: [{ id: "materials_060", rate: 0.2 }, { id: "foods_300", rate: 0.15 }],
        skills: [
            { id: "灵猿抓", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "投掷巨石", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "火眼威慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "【精英】通了灵智的猿猴，双目赤红，动作敏捷，极难捕捉。"
    },
    {
        id: "global_elite_011", template: "elite", name: "失控机关铜人", region: "all", spawnType: "ruins", timeStart: 0,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：纯金属躯体，低速高力，完全符合重型模组
        stats: { hp: 450, phy_atk: 45, mag_atk: 0, phy_def: 45, mag_def: 5, speed: 3 },
        money: [0, 0],
        drops: [{ id: "materials_061", rate: 0.3 }, { id: "materials_062", rate: 0.05 }],
        skills: [
            { id: "机械臂挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "核心过载撞击", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "轰鸣震颤", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】墨家制造的守城机关人，因年久失修内部机括错乱，见人便砸。"
    },
    {
        id: "global_elite_012", template: "elite", name: "殉葬鬼卒", region: "all", spawnType: "tomb", timeStart: 1,
        subType: "undead", defType: "heavy",
        atkType: "Reach", // 逻辑：使用长矛突刺，强调阵地物理压制感
        stats: { hp: 300, phy_atk: 35, mag_atk: 10, phy_def: 25, mag_def: 5, speed: 8 },
        money: [0, 0],
        drops: [{ id: "materials_063", rate: 0.2 }, { id: "weapons_152", rate: 0.1 }],
        skills: [
            { id: "锈矛突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "怨魂穿刺", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            { id: "冥府凝视", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】被迫为王侯殉葬的士兵，怨气锁在青铜面具之下，千年不散。"
    },
    {
        id: "global_elite_013", template: "elite", name: "嗜酒门客", region: "all", spawnType: "city", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile",
        stats: { hp: 280, phy_atk: 55, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 12 },
        money: [50, 150],
        drops: [{ id: "item_bamboo_slip", rate: 0.1 }, { id: "item_fine_wine", rate: 0.3 }],
        skills: [
            { id: "醉步撩剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "逍遥一剑", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "醉剑式", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "【精英】曾是权贵座下的三千食客之一，如今主家失势，流落江湖，剑术依然辛辣。"
    },
    {
        id: "global_elite_014", template: "elite", name: "癫狂方士", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：纯法术输出，丹火爆发，符合法宝专克凡铁逻辑
        stats: { hp: 240, phy_atk: 10, mag_atk: 45, phy_def: 5, mag_def: 20, speed: 9 },
        money: [40, 90],
        drops: [{ id: "materials_064", rate: 0.4 }, { id: "materials_065", rate: 0.05 }],
        skills: [
            { id: "滚烫丹药", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "丹火爆发", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            { id: "丹炉毒烟", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 }
        ],
        desc: "【精英】在大山深处寻求长生不老药的术士，因试药而精神错乱，周身散发着药石毒气。"
    },
    {
        id: "global_elite_015", template: "elite", name: "强弩校尉", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Range", // 逻辑：职业弩手，透甲重箭，纯粹的远射打击
        stats: { hp: 260, phy_atk: 60, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 7 },
        money: [60, 120],
        drops: [{ id: "weapons_254", rate: 0.2 }, { id: "materials_066", rate: 0.5 }],
        skills: [
            { id: "三连发", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "透甲重箭", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "碎甲矢", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】擅长使用大黄弩的军官，能在百步之外射穿重甲。"
    },
    {
        id: "global_elite_016", template: "elite", name: "犬戎勇士", region: "all", spawnType: "wasteland", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Heavy", // 逻辑：骨棒重砸，蛮力攻击，适合重型模组
        stats: { hp: 350, phy_atk: 45, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 8 },
        money: [10, 40],
        drops: [{ id: "weapons_352", rate: 0.1 }, { id: "weapons_016", rate: 0.2 }],
        skills: [
            { id: "骨棒挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "蛮力重砸", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "蛮荒怒吼", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】来自西方蛮荒之地的异族战士，披发左衽，力大无穷。"
    },

    // === 7. 巫蛊/楚地风格 (Type 2: 虚弱) ===
    {
        id: "global_elite_017", template: "elite", name: "云梦巫祝", region: "all", spawnType: "swamp", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：高魔攻(55)，使用毒虫与咒杀，纯粹的法系压制
        stats: { hp: 200, phy_atk: 10, mag_atk: 55, phy_def: 5, mag_def: 25, speed: 11 },
        money: [20, 50],
        drops: [{ id: "materials_067", rate: 0.2 }, { id: "herbs_071", rate: 0.3 }],
        skills: [
            { id: "毒虫噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "巫蛊咒杀", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            { id: "摄魂咒", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "【精英】信奉鬼神的神秘祭司，擅长驱使毒虫和诅咒，令人防不防。"
    },
    {
        id: "global_elite_018", template: "elite", name: "剑池守剑奴", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：厚重防御，铁钳重击，典型的重型模组
        stats: { hp: 320, phy_atk: 60, mag_atk: 0, phy_def: 35, mag_def: 15, speed: 6 },
        money: [0, 0],
        drops: [{ id: "materials_068", rate: 0.3 }, { id: "weapons_353", rate: 0.1 }],
        skills: [
            { id: "铁钳挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "祭剑一击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "剑势压人", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】世世代代守护铸剑池的哑奴，为了保护名剑胚胎可以牺牲性命。"
    },
    {
        id: "global_elite_019", template: "elite", name: "失势贵族", region: "all", spawnType: "city", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Balanced", // 逻辑：属性平庸但依靠Debuff，适合均衡模组
        stats: { hp: 250, phy_atk: 40, mag_atk: 10, phy_def: 15, mag_def: 10, speed: 9 },
        money: [100, 300],
        drops: [{ id: "materials_069", rate: 0.4 }, { id: "weapons_354", rate: 0.1 }],
        skills: [
            { id: "仪仗剑刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "愤怒突刺", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "王霸之气", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】旧时代的世卿世禄者，虽然家族没落，但仍摆着贵族的架子，极其傲慢。"
    },
    {
        id: "global_elite_020", template: "elite", name: "巴蛇幼崽", region: "all", spawnType: "swamp", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：低速高血，扫尾与吞噬，符合力量型重型模组
        stats: { hp: 400, phy_atk: 50, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 5 },
        money: [0, 0],
        drops: [{ id: "materials_070", rate: 0.3 }, { id: "foodMaterial_052", rate: 0.5 }],
        skills: [
            { id: "巨尾横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "吞噬撕咬", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "死亡缠绕", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】传说中能吞象的巨蛇后裔，虽然还未成年，但体型已如水桶般粗细。"
    },
    {
        id: "global_boss_001", template: "boss", name: "百战人屠", region: "all", spawnType: "battlefield", timeStart: 0,
        subType: "undead", defType: "plate",
        atkType: "Reach", // 逻辑：战场名将，横扫千军，长兵器带来的物理压制最为契合
        stats: { hp: 756, phy_atk: 40, mag_atk: 4, phy_def: 17, mag_def: 10, speed: 12 },
        money: [200, 400],
        drops: [{ id: "weapons_450", rate: 0.1 }, { id: "book_body_r3_20_full", rate: 0.05 }],
        skills: [
            { id: "横扫千军", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "血战八方", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "人屠降世", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
            { id: "杀气震慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "背水一战", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】曾坑杀二十万降卒的疯魔将军，如今已沦为只知杀戮的行尸走肉。"
    },
    {
        id: "global_boss_002", template: "boss", name: "非攻·巨灵神", region: "all", spawnType: "ruins", timeStart: 0,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：墨家巨型机甲，极端极致的物理防御与破城重击
        stats: { hp: 810, phy_atk: 32, mag_atk: 10, phy_def: 29, mag_def: 25, speed: 7 },
        money: [200, 400],
        drops: [{ id: "materials_071", rate: 0.1 }, { id: "materials_072", rate: 0.3 }],
        skills: [
            { id: "巨臂挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "巨灵破城击", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
            { id: "机关重压", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 5 },
            { id: "墨守成规", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 5 }
        ],
        desc: "【BOSS】墨家先贤留下的战争兵器，原本用于守城，如今无人操控，自动攻击一切活物。"
    },
    {
        id: "global_boss_003", template: "boss", name: "独角夔牛", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Relic", // 逻辑：神话异兽，苍雷灭世，纯粹的雷电法术打击，无视凡铁防具
        stats: { hp: 648, phy_atk: 30, mag_atk: 50, phy_def: 12, mag_def: 17, speed: 15 },
        money: [200, 400],
        drops: [{ id: "materials_073", rate: 0.1 }, { id: "materials_074", rate: 0.05 }],
        skills: [
            { id: "雷光弹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "雷霆万钧", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            { id: "苍雷灭世", rate: 0.05, type: 1, damage: 2.3, damageType: "mag", dmgValType: 1 },
            { id: "震魂吼", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "呼风唤雨", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】状如牛，苍身而无角，一足，出入水则必有风雨，其光如日月，其声如雷。"
    },
    {
        id: "global_boss_004", template: "boss", name: "长生丹魔", region: "all", spawnType: "cave", timeStart: 0,
        subType: "undead", defType: "cloth",
        atkType: "Relic", // 逻辑：阴火与毒素，通过法术机制造成伤害，契合法宝模组
        stats: { hp: 756, phy_atk: 4, mag_atk: 41, phy_def: 11, mag_def: 18, speed: 12, toxicity: 50 },
        money: [200, 400],
        drops: [{ id: "weapons_355", rate: 0.1 }],
        skills: [
            { id: "阴火灼烧", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "丹火焚心", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "鼎毁人亡", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },
            { id: "五石散毒", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 5 },
            { id: "药力过载", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 3 }
        ],
        desc: "【BOSS】为了炼制不死药而用活人试毒的邪恶方士，自己也因药物反噬变得半人半鬼。"
    },
    {
        id: "global_boss_005", template: "boss", name: "鱼肠剑主", region: "all", spawnType: "city", timeStart: 1,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：刺客之王，81点极高攻击，15点极高速度，追求瞬杀和暴击
        stats: { hp: 756, phy_atk: 81, mag_atk: 12, phy_def: 11, mag_def: 11, speed: 15 },
        money: [200, 400],
        drops: [{ id: "weapons_551", rate: 0.05 }, { id: "book_body_r4_20_upper", rate: 0.1 }],
        skills: [
            { id: "如影随形", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "图穷匕见", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "鱼肠绝刺", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "杀气锁定", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "勇绝之心", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "【BOSS】专诸之后的刺客宗师，继承了勇绝之剑，十步杀一人，千里不留行。"
    },
    {
        id: "global_boss_006", template: "boss", name: "九凤鬼母", region: "all", spawnType: "swamp", timeStart: 1,
        subType: "undead", defType: "none",
        atkType: "Relic", // 逻辑：灵体单位，万魂索命，属于顶级的法系模组
        stats: { hp: 1058, phy_atk: 5, mag_atk: 56, phy_def: 14, mag_def: 24, speed: 12 },
        money: [200, 400],
        drops: [{ id: "materials_075", rate: 0.15 }, { id: "materials_076", rate: 0.1 }],
        skills: [
            { id: "九首连噬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "摄魂魔音", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "万魂索命", rate: 0.05, type: 1, damage: 2.4, damageType: "mag", dmgValType: 1 },
            { id: "鬼车夜哭", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "百鬼夜行", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【BOSS】传说中的九头鸟化身，专门在夜间收割灵魂，叫声能让人神魂颠倒。"
    },
    {
        id: "global_boss_007", template: "boss", name: "北地狼主", region: "all", spawnType: "wasteland", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：蛮荒霸主，死亡旋风，拥有生撕虎豹的怪力，主打破甲
        stats: { hp: 648, phy_atk: 49, mag_atk: 4, phy_def: 14, mag_def: 8, speed: 15 },
        money: [200, 400],
        drops: [{ id: "body_182", rate: 0.1 }, { id: "weapons_451", rate: 0.15 }],
        skills: [
            { id: "弯刀连斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "贪狼吞月", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "死亡旋风", rate: 0.05, type: 1, damage: 2.4, damageType: "phy", dmgValType: 1 },
            { id: "狼王咆哮", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "嗜血狂化", rate: 0.1, type: 3, buffValue: 0.35, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】统领北方草原的霸主，信奉弱肉强食，拥有生撕虎豹的怪力。"
    },
    {
        id: "global_boss_008", template: "boss", name: "洗剑池主", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：18点全场最高速度，流云剑气，极致的身法与物理爆发
        stats: { hp: 540, phy_atk: 58, mag_atk: 9, phy_def: 8, mag_def: 8, speed: 18 },
        money: [200, 400],
        drops: [{ id: "weapons_552", rate: 0.05 }, { id: "book_body_r5_20_upper", rate: 0.1 }],
        skills: [
            { id: "流云剑气", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "万剑归宗", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "池底寒芒", rate: 0.05, type: 1, damage: 2.6, damageType: "phy", dmgValType: 1 },
            { id: "剑意封穴", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "人剑合一", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】隐居在洗剑池畔的老人，据说曾指点过天下数位名将剑术，早已达到手中无剑的境界。"
    },

    // === 9. 旱魃 (AOE/Debuff) ===
    {
        id: "global_boss_009", template: "boss", name: "赤地旱魃", region: "all", spawnType: "desert", timeStart: 0,
        subType: "undead", defType: "plate",
        atkType: "Relic", // 逻辑：僵尸之祖，焚天尸火与热浪侵袭，法术压制与灼烧机制
        stats: { hp: 756, phy_atk: 20, mag_atk: 45, phy_def: 25, mag_def: 14, speed: 10 },
        money: [200, 400],
        drops: [{ id: "materials_077", rate: 0.2 }, { id: "materials_078", rate: 0.1 }],
        skills: [
            { id: "热浪侵袭", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "赤地千里", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "焚天尸火", rate: 0.05, type: 1, damage: 2.3, damageType: "mag", dmgValType: 1 },
            { id: "热浪销骨", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "旱魃之躯", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 5 }
        ],
        desc: "【BOSS】引起大旱的僵尸之祖，所过之处滴水不存，浑身散发着令人窒息的高温。"
    },
    {
        id: "global_boss_010", template: "boss", name: "盗跖残魂", region: "all", spawnType: "all", timeStart: 1,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：18点高机动，双锋错杀，追求极致的物理频率与身法
        stats: { hp: 756, phy_atk: 63, mag_atk: 6, phy_def: 22, mag_def: 13, speed: 18 },
        money: [200, 400],
        drops: [{ id: "weapons_553", rate: 0.05 }, { id: "weapons_554", rate: 0.05 }],
        skills: [
            { id: "探囊取物", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "双锋错杀", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "神行绝杀", rate: 0.05, type: 1, damage: 2.4, damageType: "phy", dmgValType: 1 },
            { id: "卸甲手段", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "疾风幻影", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【BOSS】上古大盗的意志化身，从者九千，横行天下，诸侯若是惹了他也不得安宁。"
    },
    {
        id: "global_lord_mech_01", template: "lord", name: "暴走机关·非攻", region: "all", spawnType: "all", timeStart: 0,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：领主级机甲，破城重锤配合4.5倍大招，无视护甲的重型打击
        stats: { hp: 1620, phy_atk: 45, mag_atk: 45, phy_def: 43, mag_def: 37, speed: 7 },
        money: [200, 500],
        drops: [{ id: "materials_079", rate: 0.1 }, { id: "book_body_r5_21_upper", rate: 0.05 }],
        skills: [
            { id: "巨木撞击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "千机连弩", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "破城重锤", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "非攻·毁灭模式", rate: 0.025, type: 1, damage: 4.5, damageType: "phy", dmgValType: 1 },
            { id: "兼爱力场", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "高温蒸汽", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "墨守成规", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "机关自修", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】墨家制造的守城机关兽，因核心损坏而失去了敌我识别能力。"
    },
    {
        id: "global_lord_strategist_01", template: "lord", name: "鬼谷游士", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：纵横之术，天地为棋，纯法术属性配合降维打击逻辑
        stats: { hp: 1080, phy_atk: 6, mag_atk: 63, phy_def: 14, mag_def: 24, speed: 15 },
        money: [200, 500],
        drops: [{ id: "book_inner_r6_10_upper", rate: 0.05 }, { id: "weapons_555", rate: 0.1 }],
        skills: [
            { id: "捭阖之术", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "合纵连横", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "鬼谷神算·天谴", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "天地为棋", rate: 0.025, type: 1, damage: 4.5, damageType: "mag", dmgValType: 1 },
            { id: "飞钳破溃", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "心魔侵蚀", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "转丸", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "吐纳养生", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】精通纵横之术的神秘策士，游走列国之间。"
    },
    {
        id: "global_lord_yinyang_01", template: "lord", name: "东皇太一祭司", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：至高神祭司，混沌初开大招，法系输出的最高位单位
        stats: { hp: 1080, phy_atk: 6, mag_atk: 63, phy_def: 14, mag_def: 24, speed: 15 },
        money: [400, 500],
        drops: [{ id: "head_121", rate: 0.05 }, { id: "book_inner_r6_11_upper", rate: 0.05 }],
        skills: [
            { id: "云中君", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "东君降世", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "天罚·陨星", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "太一·混沌初开", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },
            { id: "大司命印", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "少司命·寿夭", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "吉日兮辰良", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "魂兮归来", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】信奉至高神东皇太一的狂热祭司。"
    },
    {
        id: "global_lord_smith_01", template: "lord", name: "欧冶子残魂", region: "all", spawnType: "all", timeStart: 0,
        subType: "undead", defType: "plate",
        atkType: "Heavy", // 逻辑：铸剑祖师，锻打千锤与血祭，高防御配合玄铁重力打击
        stats: { hp: 1512, phy_atk: 50, mag_atk: 17, phy_def: 36, mag_def: 26, speed: 12 },
        money: [200, 500],
        drops: [{ id: "materials_080", rate: 0.1 }, { id: "materials_081", rate: 0.2 }],
        skills: [
            { id: "淬火重击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "锻打千锤", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "剑啸龙吟", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "神兵出世·血祭", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "震荡打击", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "熔炉烈焰", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "剑气护体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "器魂重铸", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", debuffTimes: 6 }
        ],
        desc: "【领主】铸剑大师死后执念不散。"
    },
    {
        id: "global_lord_nomad_01", template: "lord", name: "林胡射雕手", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Range", // 逻辑：25点极致速度，射雕神技，远程秒杀逻辑的代表
        stats: { hp: 1080, phy_atk: 81, mag_atk: 12, phy_def: 12, mag_def: 12, speed: 25 },
        money: [200, 500],
        drops: [{ id: "weapons_452", rate: 0.05 }, { id: "materials_081", rate: 0.15 }],
        skills: [
            { id: "连珠箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "贯日长虹", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "射雕神技", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "天狼噬日箭", rate: 0.025, type: 1, damage: 4.5, damageType: "phy", dmgValType: 1 },
            { id: "鸣镝警示", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "毒箭创伤", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "胡服骑射", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "草原狼性", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】来自北方森林的胡人神射手。"
    },
    {
        id: "global_lord_convict_01", template: "lord", name: "骊山逃役刑徒", region: "all", spawnType: "all", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：同归于尽式的大招，铁镣重击，极致的近战破甲
        stats: { hp: 1080, phy_atk: 63, mag_atk: 6, phy_def: 33, mag_def: 14, speed: 10 },
        money: [200, 500],
        drops: [{ id: "weapons_453", rate: 0.1 }, { id: "foods_123", rate: 0.3 }],
        skills: [
            { id: "铁镣重击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "暴乱狂击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "骊山之怒", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "同归于尽", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "绝望怒吼", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "重枷压制", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "困兽之斗", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },
            { id: "求生本能", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】从大型陵墓工地上逃出来的亡命之徒。"
    },

// === 8. 巫蛊/南蛮系 ===
    {
        id: "global_lord_witch_01", template: "lord", name: "百越蛇母", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "cloth",
        atkType: "Relic", // 逻辑：高法伤(63)，巫蛊咒杀，专克凡铁
        stats: { hp: 1080, phy_atk: 6, mag_atk: 63, phy_def: 14, mag_def: 24, speed: 15, toxicity: 60 },
        money: [200, 500],
        drops: [
            { id: "materials_082", rate: 0.2 },
            { id: "head_122", rate: 0.1 }
        ],
        skills: [
            { id: "万蛇噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "金蚕蛊噬", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "巫神降临·毒域", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "古腾·万灵枯萎", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },
            { id: "神经毒雾", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "蛊毒攻心", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "巫祝狂热", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "蜕皮重生", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】南方百越之地的部落首领，善养毒蛇，常以生灵祭祀图腾。"
    },
    {
        id: "global_lord_beast_01", template: "lord", name: "蛊雕(幼兽)", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "leather",
        atkType: "Agile", // 逻辑：18点高速度，利爪撕裂与高频扑杀，符合轻盈定位
        stats: { hp: 1296, phy_atk: 72, mag_atk: 14, phy_def: 19, mag_def: 22, speed: 18 },
        money: [200, 500],
        drops: [
            { id: "materials_083", rate: 0.1 },
            { id: "materials_084", rate: 0.1 }
        ],
        skills: [
            { id: "高空扑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "利爪撕裂", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "鹿吴山·荒兽之怒", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "凶兽·吞天食地", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "婴儿啼哭", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "动脉出血", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "食人本性", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },
            { id: "御风而行", rate: 0.1, type: 3, buffValue: 0.2, debuffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】似鸟非鸟，似豹非豹，叫声像婴儿啼哭的食人异兽，出自《山海经》。"
    },
    {
        id: "global_lord_guest_01", template: "lord", name: "信陵君门客(狂)", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "light",
        atkType: "Agile", // 逻辑：28点极致攻速，爆发式物理连击，符合轻盈逻辑
        stats: { hp: 1080, phy_atk: 82, mag_atk: 12, phy_def: 12, mag_def: 12, speed: 28 },
        money: [200, 500],
        drops: [
            { id: "weapons_556", rate: 0.1 },
            { id: "item_pawn_ticket", rate: 0.2 }
        ],
        skills: [
            { id: "长铗弹歌", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "击筑悲歌", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "士为知己死", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "门客三千·剑阵", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "鸡鸣狗盗", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "剑气透体", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "窃符救赵", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "醇酒消愁", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】曾是四大公子门下的食客，如今落魄江湖，但一身本事犹在，性格却变得古怪癫狂。"
    }
];

// --- Part B: 关中地区 (r_c_1_1) [12条] ---
// 范围：咸阳、雍城、蓝田、骊山、秦始皇陵
const enemies_r_c_1_1 = [
    // ==========================================
    // 1. 帝都守备力量
    // ==========================================
    {
        id: "rc11_001", template: "minion", name: "秦军城门卫", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：持长矛突刺，标准的阵地压制
        stats: { hp: 100, phy_atk: 15, mag_atk: 0, phy_def: 10, mag_def: 3, speed: 5 },
        money: [10, 30],
        drops: [{ id: "weapons_023", rate: 0.2 }, { id: "weapons_024", rate: 0.1 }],
        skills: [
            { id: "长矛突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "破敌重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "驻守咸阳各门的士兵，盘查过往行人，神情严肃。"
    },
    {
        id: "rc11_002", template: "elite", name: "金吾卫巡逻队", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：长戈攻击属于典型的长兵器，自带合围防御感
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 7 },
        money: [30, 80],
        drops: [{ id: "weapons_037", rate: 0.15 }, { id: "book_body_r1_16_full", rate: 0.01 }],
        skills: [
            { id: "长戈穿刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "合围绞杀", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "禁行喝止", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】负责京城治安的精锐部队，披坚执锐，昼夜巡逻。"
    },
    {
        id: "rc11_003", template: "elite", name: "大秦锐士", region: "r_c_1_1", spawnType: "road", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Heavy", // 逻辑：阔剑重劈，追求高破甲和毁灭性的一击，横扫六合
        stats: { hp: 200, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 5, speed: 8 },
        money: [50, 100],
        drops: [{ id: "weapons_038", rate: 0.1 }, { id: "head_011", rate: 0.1 }],
        skills: [
            { id: "阔剑重劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "横扫六合", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "杀气震慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "【精英】秦军中最精锐的战士，曾横扫六国，战功赫赫。"
    },

    // ==========================================
    // 2. 骊山与皇陵 (苦役与机关)
    // ==========================================
    {
        id: "rc11_004", template: "minion", name: "骊山刑徒", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Agile", // 逻辑：虽然伤害低，但属于工具乱舞的低伤高频逻辑
        stats: { hp: 160, phy_atk: 12, mag_atk: 0, phy_def: 2, mag_def: 0, speed: 5 },
        money: [0, 5],
        drops: [{ id: "weapons_020", rate: 0.3 }, { id: "weapons_010", rate: 0.3 }],
        skills: [
            { id: "挥舞矿镐", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "绝望重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "修筑皇陵的七十万刑徒之一，衣不蔽体，眼神麻木。"
    },
    {
        id: "rc11_005", template: "elite", name: "监工酷吏", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Heavy", // 逻辑：皮鞭抽打自带降防（破甲）效果，透骨一击
        stats: { hp: 120, phy_atk: 25, mag_atk: 0, phy_def: 8, mag_def: 5, speed: 6 },
        money: [20, 60],
        drops: [{ id: "weapons_027", rate: 0.2 }],
        skills: [
            { id: "无情抽打", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "透骨一击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "残酷鞭挞", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】手持皮鞭，以折磨刑徒为乐，心狠手辣。"
    },
    {
        id: "rc11_006", template: "elite", name: "机关铜人(残)", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：极低速度(3)，牺牲攻击频率追求千钧重锤（破甲）
        stats: { hp: 250, phy_atk: 30, mag_atk: 0, phy_def: 45, mag_def: 10, speed: 3 },
        money: [0, 0],
        drops: [{ id: "weapons_018", rate: 0.2 }, { id: "materials_037", rate: 0.1 }],
        skills: [
            { id: "生锈铁臂", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "千钧重锤", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "齿轮噪音", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】墨家或公输家制造的守陵机关，虽然破损但依然坚硬。"
    },
    {
        id: "rc11_007", template: "boss", name: "守陵尸将", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "undead", defType: "plate",
        atkType: "Reach", // 逻辑：持秦剑大范围横扫，兼具防御与压制，自带大将气场
        stats: { hp: 756, phy_atk: 44, mag_atk: 12, phy_def: 26, mag_def: 14, speed: 10 },
        money: [100, 200],
        drops: [{ id: "weapons_090", rate: 0.01 }, { id: "materials_038", rate: 0.2 }],
        skills: [
            { id: "秦剑横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "幽冥剑气", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "将军令·斩首", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
            { id: "亡者咆哮", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "不灭战魂", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】死在皇陵中的秦军将领，被阴气转化为杀戮机器。"
    },

    // ==========================================
    // 3. 渭水与蓝田
    // ==========================================
    {
        id: "rc11_008", template: "minion", name: "渭河水鬼", region: "r_c_1_1", spawnType: "river", timeStart: 0,
        subType: "undead", defType: "none",
        atkType: "Relic", // 逻辑：灵体类攻击，窒息之拥无视物理防具逻辑
        stats: { hp: 180, phy_atk: 18, mag_atk: 5, phy_def: 5, mag_def: 5, speed: 12 },
        money: [0, 10],
        drops: [{ id: "materials_032", rate: 0.1 }, { id: "weapons_015", rate: 0.2 }],
        skills: [
            { id: "水鬼拖拽", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "窒息之拥", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "溺死在渭水中的怨魂，皮肤浮肿，会把路过岸边的人拖下水。"
    },
    {
        id: "rc11_009", template: "minion", name: "发疯的采玉人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Balanced", // 逻辑：普通人的乱舞，属性平均，没有突出倾向
        stats: { hp: 170, phy_atk: 10, mag_atk: 0, phy_def: 3, mag_def: 0, speed: 7 },
        money: [10, 50],
        drops: [{ id: "weapons_011", rate: 0.3 }, { id: "materials_045", rate: 0.2 }],
        skills: [
            { id: "胡乱凿击", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "癫狂挥舞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在蓝田山中寻找美玉而迷失心智的可怜人。"
    },

    // ==========================================
    // 4. 暗流涌动
    // ==========================================
    {
        id: "rc11_010", template: "elite", name: "六国死士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：极高速度(18)，急速划击，典型低伤高频敏捷刺客
        stats: { hp: 140, phy_atk: 45, mag_atk: 5, phy_def: 5, mag_def: 5, speed: 18 },
        money: [50, 150],
        drops: [{ id: "weapons_039", rate: 0.2 }, { id: "book_cultivation_r1_19_full", rate: 0.03 }],
        skills: [
            { id: "急速划击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "绝命背刺", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "致残打击", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】潜伏在咸阳企图刺杀秦皇的刺客，怀着国破家亡的仇恨。"
    },
    {
        id: "rc11_011", template: "minion", name: "炼丹方士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：法术伤害倾向，火丹与爆裂，专克凡铁护甲
        stats: { hp: 180, phy_atk: 5, mag_atk: 15, phy_def: 2, mag_def: 5, speed: 6 },
        money: [20, 100],
        drops: [{ id: "materials_010", rate: 0.2 }, { id: "book_cultivation_r2_02_full", rate: 0.05 }],
        skills: [
            { id: "投掷火丹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "丹炉爆裂", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "声称能炼制长生不老药的术士，其实多半是骗子。"
    },
    {
        id: "rc11_012", template: "elite", name: "宫廷乐师(刺客)", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Agile", // 逻辑：暗器与藏剑连击，追求高频率和高爆发身法
        stats: { hp: 130, phy_atk: 35, mag_atk: 10, phy_def: 5, mag_def: 10, speed: 15 },
        money: [40, 90],
        drops: [{ id: "weapons_040", rate: 0.2 }],
        skills: [
            { id: "袖箭偷袭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "筑中利刃", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "断肠之音", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】以击筑为掩护，乐器中藏着致命的武器，类似高渐离。"
    },

    // ==========================================
    // 5. 领主级 (Lord)
    // ==========================================
    {
        id: "rc11_lord_01", template: "lord", name: "始皇陵守灵人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "plate",
        atkType: "Reach", // 逻辑：掌握定秦剑法，横扫六合，战场统治级压制
        stats: { hp: 1296, phy_atk: 50, mag_atk: 50, phy_def: 34, mag_def: 29, speed: 10 },
        money: [200, 500],
        drops: [{ id: "weapons_090", rate: 0.05 }, { id: "book_cultivation_r3_01_full", rate: 0.1 }],
        skills: [
            { id: "定秦一剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "皇陵剑气", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "横扫六合", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "祖龙降世·镇杀", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },
            { id: "帝陵威压", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "封穴截脉", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "护陵罡气", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "先天功", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】活了不知多少岁月的守陵人，掌握着秦皇扫六合的恐怖武学。"
    },
    {
        id: "rc11_lord_02", template: "lord", name: "堕落的蒙恬英灵", region: "r_c_1_1", spawnType: "road", timeStart: 1,
        subType: "undead", defType: "plate",
        atkType: "Reach", // 逻辑：持长矛蛇矛，统帅铁骑冲锋，大范围压制力
        stats: { hp: 2116, phy_atk: 75, mag_atk: 20, phy_def: 50, mag_def: 30, speed: 12 },
        money: [100, 300],
        drops: [{ id: "weapons_053", rate: 0.05 }, { id: "head_012", rate: 0.1 }],
        skills: [
            { id: "苍云刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "万军辟易", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "长城守望者", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "大秦铁骑·冲锋", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "英灵怒号", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "怨气缠身", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "筑城", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "军阵严整", rate: 0.1, type: 3, buffValue: 0.2, debuffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】被奸臣害死的大将怨气不散，率领幽冥鬼军徘徊在长城脚下。"
    },
    {
        id: "rc11_lord_03", template: "lord", name: "楚霸王(分身)", region: "r_c_1_1", spawnType: "city", timeStart: 2,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：物理天花板(147)，力拔山气盖世，核弹级破甲伤害
        stats: { hp: 1944, phy_atk: 147, mag_atk: 10, phy_def: 48, mag_def: 26, speed: 18 },
        money: [100, 300],
        drops: [{ id: "weapons_065", rate: 0.05 }, { id: "materials_038", rate: 0.05 }],
        skills: [
            { id: "霸王戟法", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "力拔山兮", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "气盖世", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "鬼神乱舞", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "霸王威慑", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "四面楚歌", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "破釜沉舟", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 },
            { id: "战意不熄", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】力拔山兮气盖世，即使只是霸王留下的一道战意分身，也足以横扫千军。"
    }
];

// --- Part C: 中原地区 (r_c_2_1) [8条] ---
// 范围：洛阳、三晋、邯郸、黄河中下游
const enemies_r_c_2_1 = [
    // ==========================================
    // 1. 洛阳与周室
    // ==========================================
    {
        id: "rc21_001", template: "minion", name: "洛阳游侠", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "light",
        atkType: "Agile", // 逻辑：速度12，轻剑快刺，典型的高频物理暴击风格
        stats: { hp: 190, phy_atk: 20, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 12 },
        money: [10, 40],
        drops: [{ id: "weapons_021", rate: 0.3 }],
        skills: [
            { id: "轻剑快刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "任侠一击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "混迹于洛阳市井的少年剑客，轻生死，重然诺。"
    },
    {
        id: "rc21_002", template: "elite", name: "周室守藏史(亡魂)", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "undead",
        defType: "cloth",
        atkType: "Relic", // 逻辑：灵体法术伤害(mag_atk: 25)，专克凡铁护甲
        stats: { hp: 150, phy_atk: 5, mag_atk: 25, phy_def: 0, mag_def: 20, speed: 8 },
        money: [0, 0],
        drops: [{ id: "book_cultivation_r3_01_full", rate: 0.05 }],
        skills: [
            { id: "泼墨", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "口诛笔伐", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            { id: "史笔如刀", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】周朝覆灭后不愿离去的史官亡魂，守护着残缺的典籍。"
    },

    // ==========================================
    // 2. 三晋旧地
    // ==========================================
    {
        id: "rc21_003", template: "elite", name: "魏武卒英灵", region: "r_c_2_1", spawnType: "road", timeStart: 0,
        subType: "undead",
        defType: "heavy",
        atkType: "Reach", // 逻辑：持长戈突刺，防御型步兵军阵压制
        stats: { hp: 200, phy_atk: 30, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [{ id: "weapons_037", rate: 0.1 }, { id: "book_body_r1_09_full", rate: 0.03 }],
        skills: [
            { id: "长戈突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "重盾猛击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "军阵威慑", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】战国时期最强步兵的英灵，即便死去依然身披重甲。"
    },
    {
        id: "rc21_004", template: "minion", name: "韩国弩手(残部)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather",
        atkType: "Range", // 逻辑：韩国强弩闻名天下，纯粹的远程打击
        stats: { hp: 180, phy_atk: 35, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 9 },
        money: [5, 20],
        drops: [{ id: "weapons_025", rate: 0.3 }, { id: "weapons_060", rate: 0.01 }],
        skills: [
            { id: "暗处冷箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "劲弩穿透", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "天下强弓劲弩皆出韩，躲在暗处放冷箭的残兵。"
    },

    // ==========================================
    // 3. 黄河与商业
    // ==========================================
    {
        id: "rc21_005", template: "minion", name: "陵墓盗贼", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather",
        atkType: "Balanced", // 逻辑：属性均衡，利用洛阳铲重击，战斗逻辑平滑
        stats: { hp: 180, phy_atk: 12, mag_atk: 0, phy_def: 4, mag_def: 3, speed: 8 },
        money: [20, 80],
        drops: [{ id: "weapons_020", rate: 0.4 }, { id: "materials_019", rate: 0.1 }],
        skills: [
            { id: "挥舞矿镐", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "洛阳铲重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "活跃在邙山一带的盗墓贼，擅长分金定穴。"
    },
    {
        id: "rc21_006", template: "elite", name: "黄河河伯娶亲队", region: "r_c_2_1", spawnType: "river", timeStart: 0,
        subType: "human",
        defType: "cloth",
        atkType: "Relic", // 逻辑：邪神信徒，含有法术伤害(mag_atk: 10)，属于超自然降防风格
        stats: { hp: 180, phy_atk: 20, mag_atk: 10, phy_def: 10, mag_def: 15, speed: 8 },
        money: [50, 200],
        drops: [{ id: "head_004", rate: 0.2 }],
        skills: [
            { id: "锣鼓喧天", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "活人沉河", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "邪神祭祀", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】崇拜邪神河伯的狂热信徒，敲锣打鼓要把活人扔进河里。"
    },
    {
        id: "rc21_007", template: "minion", name: "豪强恶奴", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "cloth",
        atkType: "Agile", // 逻辑：闷棍打法，属性低但动作相对较快，典型市井打手
        stats: { hp: 190, phy_atk: 15, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 6 },
        money: [10, 50],
        drops: [{ id: "weapons_003", rate: 0.4 }, { id: "book_body_r1_03_full", rate: 0.03 }],
        skills: [
            { id: "当头一棒", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "狗仗人势", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "中原富商豪强豢养的打手，仗势欺人。"
    },
    {
        id: "rc21_008", template: "boss", name: "鬼谷弃徒", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth",
        atkType: "Agile", // 逻辑：纵剑挑杀、百步飞剑，追求极致的单体爆发与速度
        stats: { hp: 540, phy_atk: 50, mag_atk: 36, phy_def: 10, mag_def: 14, speed: 15 },
        money: [100, 200],
        drops: [{ id: "weapons_055", rate: 0.1 }, { id: "book_cultivation_r3_05_full", rate: 0.1 }],
        skills: [
            { id: "纵剑挑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "百步飞剑", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "天地一指", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },
            { id: "谋略压制", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "横贯八方", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "【头目】云梦山上下来的纵横家弃徒，精通剑术与权谋。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "rc21_lord_01", template: "lord", name: "鬼谷子(幻影)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "spirit",
        defType: "none",
        atkType: "Relic", // 逻辑：极高法伤(65)与法抗(45)，纵横天道，纯粹的法系降维打击
        stats: { hp: 1080, phy_atk: 6, mag_atk: 65, phy_def: 14, mag_def: 45, speed: 20 },
        money: [100, 300],
        drops: [{ id: "book_cultivation_r3_20_full", rate: 0.1 }],
        skills: [
            { id: "落子无悔", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "天地棋局", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "万物归元", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "纵横天道", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },
            { id: "精神重压", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "思维迟滞", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "运筹帷幄", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "纵横捭阖", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】纵横家的鼻祖，在此地留下的一道考验后人的神念。"
    },
    {
        id: "rc21_lord_02", template: "lord", name: "信陵君食客首领", region: "r_c_2_1", spawnType: "city", timeStart: 1,
        subType: "human",
        defType: "light",
        atkType: "Agile", // 逻辑：88点极高物理攻击，18点速度，窃符一击追求单体秒杀
        stats: { hp: 1512, phy_atk: 88, mag_atk: 20, phy_def: 28, mag_def: 28, speed: 18 },
        money: [100, 300],
        drops: [{ id: "weapons_055", rate: 0.05 }, { id: "materials_039", rate: 0.2 }],
        skills: [
            { id: "义士剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "士为知己死", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "窃符一击", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "合纵攻秦", rate: 0.025, type: 1, damage: 4.5, damageType: "phy", dmgValType: 1 },
            { id: "大义压人", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "围魏救赵", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "门客三千", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },
            { id: "杯酒言欢", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】曾窃符救赵的义士首领，如今聚集在魏地试图恢复旧秩序。"
    },
    {
        id: "rc21_lord_03", template: "lord", name: "黄河巨龟", region: "r_c_2_1", spawnType: "river", timeStart: 2,
        subType: "beast",
        defType: "heavy",
        atkType: "Heavy", // 逻辑：72点恐怖物防，河图大阵(5.0倍率)穿透杀招，标准的重型BOSS
        stats: { hp: 2332, phy_atk: 85, mag_atk: 75, phy_def: 72, mag_def: 35, speed: 5 },
        money: [100, 300],
        drops: [{ id: "materials_019", rate: 1.0 }, { id: "materials_039", rate: 0.5 }],
        skills: [
            { id: "激流冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "惊涛骇浪", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "洛书·河图大阵", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },
            { id: "翻江倒海", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "深海窒息", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "玄水护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "缩壳养神", rate: 0.1, type: 3, buffValue: 0.2, debuffValType: 1, debuffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】背负洛书的神龟后裔，体型如小岛，兴风作浪。"
    }
];

// --- Part D: 齐鲁大地 (r_e_0_1) [10条] ---
// 范围：临淄、曲阜、泰山、东海之滨
const enemies_r_e_0_1 = [
    // ==========================================
    // 1. 商业与百家
    // ==========================================
    {
        id: "re01_001", template: "minion", name: "私盐贩子", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Reach", // 逻辑：使用长叉突刺，具有一定的距离压制力
        stats: { hp: 110, phy_atk: 15, mag_atk: 0, phy_def: 8, mag_def: 4, speed: 8 },
        money: [40, 100],
        drops: [{ id: "weapons_034", rate: 0.15 }, { id: "foodMaterial_008", rate: 0.8 }],
        skills: [
            { id: "长叉突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "亡命护盐", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "齐地多盐铁，贩卖私盐利润极高，他们为了护盐敢于拼命。"
    },
    {
        id: "re01_002", template: "minion", name: "临淄斗鸡", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：速度18极快，高频啄击和飞爪，典型敏捷怪
        stats: { hp: 150, phy_atk: 25, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 18 },
        money: [0, 0],
        drops: [{ id: "materials_040", rate: 0.5 }, { id: "foodMaterial_050", rate: 0.5 }],
        skills: [
            { id: "凶猛啄击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "凌空飞爪", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "齐国贵族好斗鸡，这些精心饲养的斗鸡凶猛异常，啄人极痛。"
    },
    {
        id: "re01_003", template: "elite", name: "墨家机关兽(暴走)", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：齿轮碾压，刃轮旋风，强调力量与物理压制
        stats: { hp: 200, phy_atk: 25, mag_atk: 0, phy_def: 35, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [{ id: "weapons_011", rate: 0.3 }, { id: "materials_041", rate: 0.2 }],
        skills: [
            { id: "齿轮碾压", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "刃轮旋风", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "机械轰鸣", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】墨家留下的木石机关，因年久失修而敌我不分。"
    },
    {
        id: "re01_004", template: "minion", name: "落魄方士", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：法术属性攻击，炸炉属于魔法伤害，专克重装
        stats: { hp: 170, phy_atk: 5, mag_atk: 15, phy_def: 2, mag_def: 8, speed: 10 },
        money: [10, 50],
        drops: [{ id: "book_cultivation_r1_01_full", rate: 0.05 }],
        skills: [
            { id: "投掷废丹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "丹炉炸裂", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "整日炼丹求仙，精神恍惚，会扔出失败的丹药炸人。"
    },

    // ==========================================
    // 2. 泰山与响马
    // ==========================================
    {
        id: "re01_005", template: "minion", name: "泰山响马", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Heavy", // 逻辑：持开山重斧，追求强力劈砍与破甲效果
        stats: { hp: 120, phy_atk: 20, mag_atk: 0, phy_def: 10, mag_def: 5, speed: 10 },
        money: [20, 60],
        drops: [{ id: "weapons_029", rate: 0.2 }, { id: "head_002", rate: 0.2 }],
        skills: [
            { id: "板斧劈砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "开山重斧", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "盘踞在泰山险要之处的强盗，大碗喝酒大口吃肉。"
    },
    {
        id: "re01_006", template: "elite", name: "武馆教头", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Balanced", // 逻辑：功夫深不可测，棍法圆滑，属于稳扎稳打型
        stats: { hp: 220, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 10 },
        money: [50, 150],
        drops: [{ id: "weapons_050", rate: 0.1 }, { id: "book_body_r1_09_full", rate: 0.03 }],
        skills: [
            { id: "三节棍扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "连环重击", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "接化发", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】齐地尚武，临淄城中武馆林立，教头功夫深不可测。"
    },
    {
        id: "re01_007", template: "boss", name: "大盗跖(伪)", region: "r_e_0_1", spawnType: "mountain", timeStart: 1,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：20点高速，飞爪与血滴子，极致的物理爆发与身法
        stats: { hp: 756, phy_atk: 81, mag_atk: 12, phy_def: 11, mag_def: 11, speed: 20 },
        money: [100, 200],
        drops: [{ id: "weapons_054", rate: 0.1 }, { id: "weapons_062", rate: 0.01 }],
        skills: [
            { id: "如影随形", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "飞爪夺命", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "血滴子·断头", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
            { id: "石灰粉", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "神行百变", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【头目】自称盗圣柳下跖传人的巨寇，轻功卓绝，来去无踪。"
    },

    // ==========================================
    // 3. 边境与东夷
    // ==========================================
    {
        id: "re01_008", template: "minion", name: "东夷射手", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Range", // 逻辑：东夷长弓射击，纯粹的远程物理压制
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 3, mag_def: 5, speed: 12 },
        money: [5, 20],
        drops: [{ id: "weapons_048", rate: 0.15 }, { id: "book_body_r1_07_full", rate: 0.03 }],
        skills: [
            { id: "精准射击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "百步穿杨", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "生活在东部山林的古老部族，箭术精准。"
    },
    {
        id: "re01_009", template: "elite", name: "蓬莱引路人", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：撒豆成兵，掌心雷法，属于法术降维打击
        stats: { hp: 150, phy_atk: 10, mag_atk: 25, phy_def: 10, mag_def: 20, speed: 15 },
        money: [50, 200],
        drops: [{ id: "materials_019", rate: 0.3 }],
        skills: [
            { id: "撒豆成兵", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "掌心雷", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "仙境迷雾", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】专门诱骗富人出海寻仙的骗子头目。"
    },
    {
        id: "re01_010", template: "minion", name: "海边巨蟹", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "beast", defType: "plate",
        atkType: "Heavy", // 逻辑：巨螯夹击，牺牲频率追求强力的物理防御和重击
        stats: { hp: 160, phy_atk: 20, mag_atk: 0, phy_def: 25, mag_def: 5, speed: 4 },
        money: [0, 0],
        drops: [{ id: "foodMaterial_005", rate: 0.6 }, { id: "materials_048", rate: 0.2 }],
        skills: [
            { id: "巨螯夹击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "横行冲撞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "海边沙滩上的大螃蟹，横行霸道。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "re01_lord_01", template: "lord", name: "东海蛟龙", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "beast", defType: "plate",
        atkType: "Relic", // 逻辑：蛟龙覆海，龙息攻击，典型的顶级法系输出，无视凡铁
        stats: { hp: 1296, phy_atk: 30, mag_atk: 63, phy_def: 34, mag_def: 34, speed: 16 },
        money: [100, 300],
        drops: [{ id: "materials_044", rate: 0.5 }, { id: "weapons_075", rate: 0.05 }],
        skills: [
            { id: "水龙卷", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "寒冰龙息", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "东海龙王怒", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "覆海大阵", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },
            { id: "龙威震慑", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "寒气入体", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "呼风唤雨", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "龙血沸腾", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】深海中的恶蛟，传说是龙的远亲。"
    },
    {
        id: "re01_lord_02", template: "lord", name: "孔门弃徒(狂)", region: "r_e_0_1", spawnType: "city", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Heavy", // 逻辑：90点恐怖物理攻击，以力服人，极致的力量碾压
        stats: { hp: 1620, phy_atk: 90, mag_atk: 10, phy_def: 30, mag_def: 40, speed: 14 },
        money: [100, 300],
        drops: [{ id: "weapons_050", rate: 0.05 }, { id: "book_cultivation_r2_05_full", rate: 0.1 }],
        skills: [
            { id: "当头棒喝", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "以力服人", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "射御双绝", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "杀身成仁", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "礼崩乐坏", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "强行教化", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "浩然正气", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "吾日三省", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】修习儒家六艺走火入魔的狂人。"
    },
    {
        id: "re01_lord_03", template: "lord", name: "泰山石敢当(灵)", region: "r_e_0_1", spawnType: "mountain", timeStart: 2,
        subType: "elemental", defType: "plate",
        atkType: "Heavy", // 逻辑：血量防御之最，5.0倍率镇杀大招，不动如山
        stats: { hp: 2592, phy_atk: 90, mag_atk: 45, phy_def: 86, mag_def: 65, speed: 4 },
        money: [100, 300],
        drops: [{ id: "materials_023", rate: 0.5 }, { id: "materials_045", rate: 0.5 }],
        skills: [
            { id: "巨石撞击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "山崩地裂", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "封禅大典·镇杀", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "镇压邪祟", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "重力场", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "不动如山", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "大地之力", rate: 0.1, type: 3, buffValue: 0.2, debuffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】泰山文化成的精怪，镇压一切邪祟。"
    }
];

// --- Part E: 荆楚大地 (r_c_1_2) [10条] ---
// 范围：郢都、寿春、云梦泽、长江
const enemies_r_c_1_2 = [
    // ==========================================
    // 1. 云梦大泽
    // ==========================================
    {
        id: "rc12_001", template: "minion", name: "云梦水匪", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Balanced", // 逻辑：属性平均，使用船桨等杂项兵器，战斗风格稳健
        stats: { hp: 170, phy_atk: 14, mag_atk: 0, phy_def: 4, mag_def: 2, speed: 9 },
        money: [10, 30],
        drops: [{ id: "weapons_012", rate: 0.3 }, { id: "foods_048", rate: 0.2 }],
        skills: [
            { id: "船桨拍击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "水下拖拽", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "潜伏在芦苇荡里，靠打劫过往商船为生。"
    },
    {
        id: "rc12_002", template: "minion", name: "扬子鳄", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "beast", defType: "plate",
        atkType: "Heavy", // 逻辑：5点低速，死亡翻滚追求极致咬合力（破甲），典型的重型攻击
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 5 },
        money: [0, 0],
        drops: [{ id: "materials_049", rate: 0.4 }, { id: "foodMaterial_056", rate: 0.8 }],
        skills: [
            { id: "凶猛撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "死亡翻滚", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "云梦泽中的霸主，被称为猪婆龙，咬合力惊人。"
    },
    {
        id: "rc12_003", template: "elite", name: "沼泽巨蟒", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Reach", // 逻辑：利用体型优势进行绞杀，具有中距离压制与限制机动力的特性
        stats: { hp: 250, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 10 },
        money: [0, 0],
        drops: [{ id: "materials_005", rate: 0.5 }, { id: "materials_010", rate: 0.5 }],
        skills: [
            { id: "巨蟒突袭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "致命绞杀", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "死亡缠绕", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】能吞下一头牛的巨蟒，在泥沼中行动如飞。"
    },
    {
        id: "rc12_004", template: "minion", name: "楚地巫祝", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：高法伤(25)，巫毒咒怨，无视物理防具的灵魂打击
        stats: { hp: 160, phy_atk: 5, mag_atk: 25, phy_def: 0, mag_def: 15, speed: 8, toxicity: 30 },
        money: [10, 40],
        drops: [{ id: "foodMaterial_002", rate: 0.3 }, { id: "materials_006", rate: 0.3 }],
        skills: [
            { id: "毒虫噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "巫毒咒怨", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "戴着狰狞面具，擅长使用毒虫和诅咒。"
    },
    {
        id: "rc12_005", template: "elite", name: "负隅顽抗的楚军", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：亡秦必楚的死战意志，阔剑重劈配合降防降攻
        stats: { hp: 160, phy_atk: 32, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 7 },
        money: [20, 60],
        drops: [{ id: "weapons_038", rate: 0.15 }],
        skills: [
            { id: "阔剑挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "亡秦必楚", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "楚魂震慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】楚虽三户，亡秦必楚。不愿投降的楚军残部。"
    },
    {
        id: "rc12_006", template: "minion", name: "湘西赶尸人", region: "r_c_1_2", spawnType: "road", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：摄魂铃音与尸气符爆，属于典型的非物理法系压制
        stats: { hp: 180, phy_atk: 10, mag_atk: 25, phy_def: 5, mag_def: 15, speed: 5 },
        money: [30, 80],
        drops: [{ id: "weapons_002", rate: 0.3 }],
        skills: [
            { id: "摄魂铃音", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "尸气符爆", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "摇着铃铛，赶着尸体回乡安葬的神秘人，生人勿进。"
    },
    {
        id: "rc12_007", template: "boss", name: "九头鸟(幼体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "light",
        atkType: "Agile", // 逻辑：18点高机动，九首连啄追求高频低伤，典型的敏捷系BOSS
        stats: { hp: 648, phy_atk: 39, mag_atk: 53, phy_def: 8, mag_def: 16, speed: 18 },
        money: [100, 200],
        drops: [{ id: "materials_040", rate: 0.8 }],
        skills: [
            { id: "鬼车夜鸣", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "九首连啄", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "摄魂夺魄", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },
            { id: "厄运降临", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "妖风护体", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【头目】楚地传说中的不祥之鸟，鬼车，叫声能摄人魂魄。"
    },
    {
        id: "rc12_008", template: "minion", name: "剧毒蟾蜍", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Relic", // 逻辑：毒液喷射(mag)，无视防具的中毒逻辑
        money: [100, 200],
        stats: { hp: 140, phy_atk: 15, mag_atk: 20, phy_def: 10, mag_def: 10, speed: 4, toxicity: 30 },
        drops: [],
        skills: [
            { id: "长舌鞭击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "毒液喷射", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "浑身长满脓包，碰到就会中毒。"
    },
    {
        id: "rc12_009", template: "elite", name: "项氏家臣", region: "r_c_1_2", spawnType: "city", timeStart: 1,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：项氏枪法（单手挑、回马枪），典型的长兵器压制风格
        stats: { hp: 200, phy_atk: 40, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 10 },
        money: [60, 150],
        drops: [{ id: "weapons_044", rate: 0.15 }, { id: "book_body_r1_09_full", rate: 0.45 }],
        skills: [
            { id: "单手挑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "回马枪", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "霸王余威", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】项羽家族的家臣，个个武艺高强，忠心耿耿。"
    },
    {
        id: "rc12_010", template: "minion", name: "神农架野人", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Balanced", // 逻辑：野性乱抓与冲撞，属性平均且无复杂相克
        stats: { hp: 140, phy_atk: 30, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 12 },
        money: [0, 0],
        drops: [{ id: "materials_024", rate: 0.05 }, { id: "foodMaterial_006", rate: 0.5 }],
        skills: [
            { id: "野性乱抓", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "咆哮冲撞", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "深山中直立行走的红毛野兽，力大无穷。"
    },
    {
        id: "rc12_lord_01", template: "lord", name: "云梦龙君", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "beast", defType: "plate",
        atkType: "Relic", // 逻辑：泽国覆舟，法伤(63)极高，属于顶级的法宝相克单位
        stats: { hp: 1296, phy_atk: 32, mag_atk: 63, phy_def: 30, mag_def: 32, speed: 15 },
        money: [100, 300],
        drops: [{ id: "materials_044", rate: 0.3 }, { id: "materials_039", rate: 0.3 }],
        skills: [
            { id: "水箭突袭", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "云梦泽国", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "狂澜覆舟", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "真龙降世", rate: 0.025, type: 1, damage: 4.5, damageType: "mag", dmgValType: 1 },
            { id: "兴云吐雾", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "溺水诅咒", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "真龙之躯", rate: 0.06, type: 3, buffValue: 0.45, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "水灵治愈", rate: 0.02, type: 3, buffValue: 0.06, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】云梦泽中修行的千年白蛇，已化为半龙之躯。"
    },
    {
        id: "rc12_lord_02", template: "lord", name: "巫神代言人", region: "r_c_1_2", spawnType: "mountain", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：法术巅峰(88)，寂灭指必杀，绝对的法系领主
        stats: { hp: 1512, phy_atk: 9, mag_atk: 88, phy_def: 20, mag_def: 40, speed: 14 },
        money: [100, 300],
        drops: [{ id: "foodMaterial_002", rate: 0.5 }, { id: "book_cultivation_r3_21_full", rate: 0.1 }],
        skills: [
            { id: "蛊虫噬骨", rate: 0.2, type: 1, damage: 1.3, damageType: "mag", dmgValType: 1 },
            { id: "摄魂咒", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "九幽怨念", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "巫神寂灭指", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "衰弱诅咒", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "魂力流失", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 6 },
            { id: "巫神附体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "降神仪式", rate: 0.1, type: 3, buffValue: 0.25, debuffValType: 1, debuffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】楚地大巫，能沟通鬼神，施展恐怖的即死诅咒。"
    },
    {
        id: "rc12_lord_03", template: "lord", name: "九头神鸟(完全体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 2,
        subType: "beast", defType: "light",
        atkType: "Agile", // 逻辑：30点极致速度，风刃乱舞连击，物理暴击巅峰单位
        stats: { hp: 2138, phy_atk: 138, mag_atk: 45, phy_def: 42, mag_def: 55, speed: 30 },
        money: [100, 300],
        drops: [{ id: "materials_047", rate: 0.5 }, { id: "materials_020", rate: 0.5 }],
        skills: [
            { id: "风刃乱舞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "凌空扑击", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "九首齐鸣", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "灾厄神罚", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "灾厄风暴", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "不详血毒", rate: 0.02, type: 2, debuffValue: 0.07, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "扶摇直上", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "神鸟再生", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】展开羽翼遮天蔽日的上古凶兽，九个头颅能喷吐九种灾厄。"
    }

];

// --- Part F: 巴蜀之地 (r_c_0_2) [10条] ---
// 范围：成都、汉中、剑阁、江州
const enemies_r_c_0_2 = [

    {
        id: "rc02_001", template: "minion", name: "剑阁剪径贼", region: "r_c_0_2", spawnType: "road", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Heavy", // 逻辑：利用地势进行重劈攻击，追求破甲伤害
        stats: { hp: 190, phy_atk: 18, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 6 },
        money: [10, 40],
        drops: [{ id: "weapons_029", rate: 0.2 }, { id: "foods_001", rate: 0.2 }],
        skills: [
            { id: "劫径重劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "此山是我开", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "盘踞在蜀道险要之处，利用地势打劫过往商旅。"
    },
    {
        id: "rc02_002", template: "minion", name: "井盐矿工(暴躁)", region: "r_c_0_2", spawnType: "village", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Balanced", // 逻辑：属性平均，矿镐攻击风格稳健，无明显相克倾向
        stats: { hp: 100, phy_atk: 15, mag_atk: 0, phy_def: 8, mag_def: 2, speed: 5 },
        money: [20, 60],
        drops: [{ id: "weapons_020", rate: 0.3 }, { id: "foodMaterial_008", rate: 0.8 }],
        skills: [
            { id: "矿镐挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "愤怒开采", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在自贡一带开采井盐的工匠，因繁重劳役而变得极具攻击性。"
    },
    {
        id: "rc02_003", template: "elite", name: "食铁兽(熊猫)", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Heavy", // 逻辑：咬碎铁锅的咬合力，高血量重力物理打击
        stats: { hp: 350, phy_atk: 40, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 4 },
        money: [0, 0],
        drops: [{ id: "materials_024", rate: 0.2 }, { id: "foodMaterial_002", rate: 0.5 }],
        skills: [
            { id: "熊抱", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "蚩尤坐骑之威", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "咬碎铁锅", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】外表憨态可掬，实则乃上古凶兽蚩尤坐骑，能轻易咬碎铁锅。"
    },
    {
        id: "rc02_004", template: "minion", name: "竹林花斑蛇", region: "r_c_0_2", spawnType: "grass", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：高机动(12)，毒牙突袭，典型的敏捷系生物
        stats: { hp: 140, phy_atk: 25, mag_atk: 0, phy_def: 1, mag_def: 5, speed: 12, toxicity: 40 },
        money: [0, 0],
        drops: [{ id: "materials_010", rate: 0.3 }],
        skills: [
            { id: "毒牙突袭", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "迅猛撕咬", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
        ],
        desc: "隐藏在翠绿竹林中的毒蛇，保护色极好，令人防不胜防。"
    },
    {
        id: "rc02_005", template: "elite", name: "南蛮藤甲兵", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "plate",
        atkType: "Heavy", // 逻辑：极高物防(45)，蛮力横砍，标准的重型防御反击单位
        stats: { hp: 180, phy_atk: 25, mag_atk: 0, phy_def: 45, mag_def: 5, speed: 6 },
        money: [5, 20],
        drops: [{ id: "weapons_035", rate: 0.1 }, { id: "booksBody_r1_11", rate: 0.45 }],
        skills: [
            { id: "藤牌冲撞", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "蛮力横砍", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "油污滑步", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "【精英】身穿桐油浸泡过的藤甲，刀枪不入，唯一的弱点是火。"
    },
    {
        id: "rc02_006", template: "minion", name: "巴山夜猿", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：高机动(15)，投掷与抓挠，典型高频干扰型敏捷怪
        stats: { hp: 160, phy_atk: 12, mag_atk: 0, phy_def: 2, mag_def: 5, speed: 15 },
        money: [0, 0],
        drops: [{ id: "materials_002", rate: 0.3 }, { id: "foods_021", rate: 0.4 }],
        skills: [
            { id: "灵猿抓挠", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "落石投掷", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "巴东三峡巫峡长，猿鸣三声泪沾裳。成群结队骚扰路人。"
    },
    {
        id: "rc02_007", template: "minion", name: "古蜀遗民", region: "r_c_0_2", spawnType: "city", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：崇拜神鸟，带有法术祭礼伤害，专克物理铁甲
        stats: { hp: 180, phy_atk: 15, mag_atk: 10, phy_def: 5, mag_def: 10, speed: 8 },
        money: [10, 50],
        drops: [{ id: "weapons_023", rate: 0.2 }, { id: "materials_019", rate: 0.1 }],
        skills: [
            { id: "青铜刺击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "太阳鸟祭礼", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "崇拜金沙太阳神鸟的古蜀国后裔，行踪神秘。"
    },
    {
        id: "rc02_008", template: "boss", name: "六牙白象", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：神象镇狱，泰山压顶，力量与厚皮的终极体现
        stats: { hp: 648, phy_atk: 44, mag_atk: 34, phy_def: 21, mag_def: 14, speed: 8 },
        money: [100, 200],
        drops: [{ id: "materials_022", rate: 0.5 }, { id: "materials_021", rate: 1.0 }],
        skills: [
            { id: "神象镇狱", rate: 0.2, type: 1, damage: 1.3, damageType: "phy", dmgValType: 1 },
            { id: "长鼻横扫", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "万象森罗", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "灵兽威压", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "神象金身", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】峨眉山中的灵兽，据说曾是普贤菩萨的坐骑（化身）。"
    },
    {
        id: "rc02_009", template: "elite", name: "青城剑客", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Agile", // 逻辑：14点高机动，轻灵飘逸的剑诀，追求连击与爆发
        stats: { hp: 160, phy_atk: 35, mag_atk: 0, phy_def: 10, mag_def: 15, speed: 14 },
        money: [50, 150],
        drops: [{ id: "weapons_035", rate: 0.2 }, { id: "booksCultivation_r1_19", rate: 0.1 }],
        skills: [
            { id: "青城剑诀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "破空剑花", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "剑气封穴", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】隐居青城山的剑术高手，剑法轻灵飘逸。"
    },
    {
        id: "rc02_010", template: "minion", name: "入蜀流民", region: "r_c_0_2", spawnType: "road", timeStart: 1,
        subType: "human", defType: "none",
        atkType: "Balanced", // 逻辑：绝望挣扎的乱棍，无明显属性倾向
        stats: { hp: 150, phy_atk: 5, mag_atk: 0, phy_def: 0, mag_def: 0, speed: 4 },
        money: [0, 5],
        drops: [{ id: "weapons_001", rate: 0.2 }],
        skills: [
            { id: "乱棍挥舞", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "绝望挣扎", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
        ],
        desc: "为了躲避中原战乱，翻越秦岭逃入巴蜀的难民。"
    },
    {
        id: "rc02_lord_01", template: "lord", name: "蚕丛王尸", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "undead", defType: "heavy",
        atkType: "Relic", // 逻辑：古蜀王尸，法术斩杀(蚕丛寂灭劫)，顶级灵异单位
        stats: { hp: 1512, phy_atk: 25, mag_atk: 63, phy_def: 38, mag_def: 42, speed: 8 },
        money: [100, 300],
        drops: [{ id: "materials_019", rate: 0.3 }, { id: "materials_021", rate: 0.3 }],
        skills: [
            { id: "尸毒云", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "青铜影袭", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "纵目神光", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "蚕丛寂灭劫", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },
            { id: "古蜀咒怨", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "尸毒攻心", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "不灭金身", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "古蜀秘法", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】古蜀国第一代王，纵目面具下是一双看透阴阳的眼睛。"
    },
    {
        id: "rc02_lord_02", template: "lord", name: "食铁兽之王", region: "r_c_0_2", spawnType: "mountain", timeStart: 1,
        subType: "beast", defType: "plate",
        atkType: "Heavy", // 逻辑：兵主战神怒，泰山压顶，极致的物理盾与破甲重击
        stats: { hp: 2268, phy_atk: 85, mag_atk: 10, phy_def: 55, mag_def: 20, speed: 9 },
        money: [100, 300],
        drops: [{ id: "materials_024", rate: 1.0 }, { id: "weapons_018", rate: 0.05 }],
        skills: [
            { id: "巨掌拍击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "铁甲冲撞", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "兵主战神怒", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "重压减速", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "威慑怒吼", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "金刚不坏", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "狂暴嗜血", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】体型如象的巨型熊猫，一巴掌能拍碎城墙。"
    },
    {
        id: "rc02_lord_03", template: "lord", name: "唐门老祖(伪)", region: "r_c_0_2", spawnType: "city", timeStart: 2,
        subType: "human", defType: "light",
        atkType: "Range", // 逻辑：千机万变，含沙射影，顶级暗器远程压制
        stats: { hp: 1944, phy_atk: 152, mag_atk: 20, phy_def: 24, mag_def: 35, speed: 28 },
        money: [100, 300],
        drops: [{ id: "weapons_062", rate: 0.1 }],
        skills: [
            { id: "含沙射影", rate: 0.2, type: 1, damage: 1.3, damageType: "phy", dmgValType: 1 },
            { id: "子母连环箭", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "暴雨梨花针", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "千机万变·终结", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "破甲钢针", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "见血封喉", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "千机变", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "神行影遁", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】巴蜀暗器名家的开创者，全身藏有千种暗器，令人防不胜防。"
    }

];

// --- Part G: 辽东与东胡 (r_ne) [10条] ---
// 范围：襄平、扶余、长白山、黑水
const enemies_r_ne = [
    // ==========================================
    // 1. 白山黑水猛兽
    // ==========================================
    {
        id: "rne_001", template: "elite", name: "东北虎", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：猫科动物的敏捷扑杀，利爪连击，符合高频敏捷逻辑
        stats: { hp: 300, phy_atk: 50, mag_atk: 0, phy_def: 12, mag_def: 5, speed: 10 },
        money: [0, 0],
        drops: [{ id: "materials_020", rate: 0.4 }, { id: "materials_021", rate: 0.4 }, { id: "materials_022", rate: 0.4 }],
        skills: [
            { id: "利爪撕裂", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "山林扑杀", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "虎啸山林", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】体型巨大的吊睛白额虎，雪原上的绝对王者。"
    },
    {
        id: "rne_002", template: "elite", name: "黑瞎子(熊)", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：皮糙肉厚，野蛮冲撞，典型的力量型重型打击
        stats: { hp: 350, phy_atk: 45, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [{ id: "materials_011", rate: 0.5 }, { id: "materials_012", rate: 0.4 }, { id: "materials_023", rate: 0.1 }],
        skills: [
            { id: "野蛮冲撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "暴怒掌击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "重压威慑", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "【精英】皮糙肉厚，嗅觉灵敏，发起狂来能撞断大树。"
    },
    {
        id: "rne_003", template: "minion", name: "雪原狼群", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：雪狼围猎，冷血突袭，利用速度和频率造成伤害
        stats: { hp: 170, phy_atk: 18, mag_atk: 0, phy_def: 3, mag_def: 3, speed: 12 },
        money: [0, 0],
        drops: [{ id: "materials_050", rate: 0.6 }, { id: "materials_008", rate: 0.5 }],
        skills: [
            { id: "围猎撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "冷血突袭", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
        ],
        desc: "毛色雪白，耐力极强，擅长围猎。"
    },
    {
        id: "rne_004", template: "minion", name: "采参客", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Balanced", // 逻辑：属性均衡，使用铁锄挥击，无明显克制逻辑
        stats: { hp: 180, phy_atk: 12, mag_atk: 0, phy_def: 4, mag_def: 2, speed: 7 },
        money: [20, 100],
        drops: [{ id: "herbs_030", rate: 0.3 }, { id: "weapons_010", rate: 0.3 }],
        skills: [
            { id: "铁锄挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "求生乱舞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在深山老林中寻找人参的冒险者。"
    },
    {
        id: "rne_005", template: "elite", name: "关外响马", region: "r_ne", spawnType: "road", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：骑术精湛，来去如风，通过回马箭和机动力压制
        stats: { hp: 130, phy_atk: 25, mag_atk: 0, phy_def: 6, mag_def: 4, speed: 14 },
        money: [30, 90],
        drops: [{ id: "weapons_025", rate: 0.2 }, { id: "mounts_003", rate: 0.05 }],
        skills: [
            { id: "回马箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "套马重摔", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            { id: "飞沙走石", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】骑术精湛的强盗，来去如风。"
    },
    {
        id: "rne_006", template: "minion", name: "苦寒流放犯", region: "r_ne", spawnType: "road", timeStart: 0,
        subType: "human", defType: "none",
        atkType: "Agile", // 逻辑：绝望偷袭，临死反扑，属于低伤高频的生存反抗
        stats: { hp: 160, phy_atk: 8, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 4 },
        money: [0, 5],
        drops: [{ id: "weapons_008", rate: 0.3 }],
        skills: [
            { id: "铁片划刺", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "临死反扑", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
        ],
        desc: "被发配到辽东苦寒之地的罪犯。"
    },
    {
        id: "rne_007", template: "minion", name: "肃慎猎手", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Range", // 逻辑：石砮射击，林海狙击，典型的远程物理单位
        stats: { hp: 190, phy_atk: 22, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 9 },
        money: [5, 20],
        drops: [{ id: "weapons_048", rate: 0.1 }, { id: "materials_003", rate: 0.3 }],
        skills: [
            { id: "石砮射击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "林海狙击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "使用楛矢石砮的古老部族猎人。"
    },
    {
        id: "rne_008", template: "minion", name: "扶余战士", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Reach", // 逻辑：长戈突刺，利用武器长度进行战阵压制
        stats: { hp: 110, phy_atk: 20, mag_atk: 0, phy_def: 10, mag_def: 5, speed: 8 },
        money: [10, 40],
        drops: [{ id: "weapons_037", rate: 0.1 }],
        skills: [
            { id: "长戈刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "扶余重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "来自松嫩平原的农耕与游牧混合部族。"
    },
    {
        id: "rne_009", template: "elite", name: "鲜卑突骑", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：精锐骑兵甲，斩马重劈，利用坐骑冲力进行破甲打击
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 12, mag_def: 8, speed: 16 },
        money: [30, 100],
        drops: [{ id: "weapons_049", rate: 0.1 }, { id: "mounts_004", rate: 0.05 }],
        skills: [
            { id: "铁骑冲锋", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "斩马重劈", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "震慑马蹄", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】鲜卑山的精锐骑兵。"
    },
    {
        id: "rne_010", template: "boss", name: "长白山雪怪", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：巨石投掷与雪怪重掌，典型的超重型物理BOSS
        stats: { hp: 648, phy_atk: 49, mag_atk: 14, phy_def: 22, mag_def: 11, speed: 9 },
        money: [100, 200],
        drops: [{ id: "materials_023", rate: 0.5 }, { id: "herbs_030", rate: 0.5 }],
        skills: [
            { id: "巨石投掷", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "雪怪重掌", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "圣山震怒", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
            { id: "雪崩怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "寒冬气息", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】传说中守护圣山的白色巨兽。"
    },
    {
        id: "rne_lord_01", template: "lord", name: "长白山龙脉守护", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "elemental", defType: "plate",
        atkType: "Relic", // 逻辑：万年玄冰法术射束，绝对零度，专克重装单位的法系领主
        stats: { hp: 1296, phy_atk: 25, mag_atk: 63, phy_def: 38, mag_def: 42, speed: 8 },
        money: [100, 300],
        drops: [{ id: "herbs_030", rate: 1.0 }, { id: "materials_023", rate: 0.5 }],
        skills: [
            { id: "寒冰射束", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "冰川穿刺", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "寒冰吐息", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "绝对零度", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },
            { id: "极寒领域", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "寒毒入髓", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "冰晶护甲", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "凛冬意志", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】由万年冰雪凝聚而成的元素生物。"
    },
    {
        id: "rne_lord_02", template: "lord", name: "东胡战神", region: "r_ne", spawnType: "grass", timeStart: 1,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：狼牙粉碎，开天辟地，纯粹的力量巅峰与单次破甲爆发
        stats: { hp: 1890, phy_atk: 92, mag_atk: 10, phy_def: 46, mag_def: 25, speed: 14 },
        money: [100, 300],
        drops: [{ id: "weapons_049", rate: 0.1 }, { id: "mounts_004", rate: 0.1 }],
        skills: [
            { id: "重锤打击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "旋风斩", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "狼牙粉碎", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "战神·开天辟地", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "震慑咆哮", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "蛮荒威压", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "战神之怒", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 },
            { id: "祖灵庇佑", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】东胡部落传说中的勇士，手持千斤重的狼牙棒。"
    },
    {
        id: "rne_lord_03", template: "lord", name: "北冥巨鲲(幼)", region: "r_ne", spawnType: "ocean", timeStart: 2,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：吞噬天地(6.0倍率)的核弹物理爆发，体量带来的重型压制
        stats: { hp: 2800, phy_atk: 140, mag_atk: 90, phy_def: 62, mag_def: 50, speed: 6 },
        money: [100, 300],
        drops: [{ id: "materials_044", rate: 0.5 }, { id: "materials_039", rate: 0.5 }],
        skills: [
            { id: "巨浪冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "水击三千里", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "北冥神压", rate: 0.05, type: 1, damage: 3.5, damageType: "mag", dmgValType: 1 },
            { id: "吞噬天地", rate: 0.025, type: 1, damage: 6.0, damageType: "phy", dmgValType: 1 },
            { id: "巨鲲引力", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "深渊凝视", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 6 },
            { id: "鲲鹏化境", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "海纳百川", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】北冥有鱼，其名为鲲。"
    }
];

// --- Part H: 漠北草原 (r_n) [6条] ---
// 范围：龙城、狼居胥、瀚海
const enemies_r_n = [
    // ==========================================
    // 1. 北方草原势力
    // ==========================================
    {
        id: "rn_001", template: "minion", name: "匈奴射雕手", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Range", // 逻辑：神射手，使用连珠箭与贯穿之矢，标准的远程物理打击
        stats: { hp: 110, phy_atk: 28, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 14 },
        money: [10, 50],
        drops: [{ id: "weapons_048", rate: 0.2 }, { id: "materials_015", rate: 0.3 }],
        skills: [
            { id: "连珠箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "贯穿之矢", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "从小在马背上长大的神射手，箭无虚发。"
    },
    {
        id: "rn_002", template: "minion", name: "草原巨狼", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：高速度(12)，扑咬与突袭，符合低伤高频敏捷逻辑
        stats: { hp: 180, phy_atk: 18, mag_atk: 0, phy_def: 3, mag_def: 5, speed: 12 },
        money: [0, 0],
        drops: [{ id: "materials_008", rate: 0.5 }, { id: "materials_050", rate: 0.5 }],
        skills: [
            { id: "凶猛撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "残暴突袭", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "比中原狼体型更大，性格更凶残。"
    },
    {
        id: "rn_003", template: "elite", name: "匈奴百夫长", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：草原冲锋配合重劈，追求高额单次伤害与破甲感
        stats: { hp: 220, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 12 },
        money: [50, 150],
        drops: [{ id: "weapons_049", rate: 0.1 }, { id: "mounts_004", rate: 0.05 }],
        skills: [
            { id: "横扫千军", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "草原冲锋", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "破甲重击", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】统领百骑的勇士，身经百战。"
    },
    {
        id: "rn_004", template: "elite", name: "萨满巫师", region: "r_n", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：法术属性(mag)，通过雷罚与诅咒造成非物理伤害，专克凡铁
        stats: { hp: 140, phy_atk: 5, mag_atk: 25, phy_def: 5, mag_def: 20, speed: 8 },
        money: [20, 80],
        drops: [{ id: "materials_035", rate: 0.4 }],
        skills: [
            { id: "神灵之火", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "长生天雷罚", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "长生天诅咒", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】沟通长生天的祭司。"
    },
    {
        id: "rn_005", template: "boss", name: "白狼王(灵兽)", region: "r_n", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：18点高速度，闪电连击与突袭，物理暴击巅峰代表
        stats: { hp: 648, phy_atk: 54, mag_atk: 34, phy_def: 11, mag_def: 14, speed: 18 },
        money: [100, 200],
        drops: [{ id: "materials_020", rate: 0.5 }, { id: "weapons_053", rate: 0.05 }],
        skills: [
            { id: "闪电撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "影狼突袭", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "啸月天冲击", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },
            { id: "极寒之咬", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "狼群呼唤", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【头目】草原上传说的白色狼神，速度快如闪电。"
    },
    {
        id: "rn_006", template: "minion", name: "北海牧羊人", region: "r_n", spawnType: "river", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Balanced",
        stats: { hp: 160, phy_atk: 10, mag_atk: 0, phy_def: 2, mag_def: 5, speed: 6 },
        money: [5, 20],
        drops: [{ id: "weapons_002", rate: 0.3 }, { id: "foodMaterial_053", rate: 0.5 }],
        skills: [
            { id: "竹竿挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "驱羊犬突", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在极北苦寒之地放牧的流亡者。"
    },

    // ==========================================
    // 2. 领主级 (Lord)
    // ==========================================
    {
        id: "rn_lord_01", template: "lord", name: "冒顿单于", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Range", // 逻辑：鸣镝之箭引导万骑冲锋，顶级远程指挥与射击模组
        stats: { hp: 1296, phy_atk: 78, mag_atk: 15, phy_def: 36, mag_def: 25, speed: 18 },
        money: [100, 300],
        drops: [{ id: "weapons_048", rate: 0.1 }, { id: "mounts_005", rate: 0.1 }],
        skills: [
            { id: "骑射", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "鸣镝箭", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "单于破阵斩", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "冒顿·草原霸主", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "霸主威压", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "心胆俱裂", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "万骑冲锋", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "铁血军魂", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】统一草原的匈奴霸主，鸣镝所指，万骑冲锋。"
    },
    {
        id: "rn_lord_02", template: "lord", name: "长生天大祭司", region: "r_n", spawnType: "mountain", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：九天雷霆与灭世裁决，极致法术爆发，专克厚甲
        stats: { hp: 1512, phy_atk: 10, mag_atk: 92, phy_def: 22, mag_def: 55, speed: 14 },
        money: [100, 300],
        drops: [{ id: "book_cultivation_r3_01_full", rate: 0.1 }],
        skills: [
            { id: "雷引", rate: 0.2, type: 1, damage: 1.3, damageType: "mag", dmgValType: 1 },
            { id: "九天雷霆", rate: 0.1, type: 1, damage: 2.1, damageType: "mag", dmgValType: 1 },
            { id: "极光咒", rate: 0.05, type: 1, damage: 3.3, damageType: "mag", dmgValType: 1 },
            { id: "长生天·灭世裁决", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "灵魂震慑", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "长生天降罚", rate: 0.02, type: 2, debuffValue: 0.07, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "风暴护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "万物感应", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】能召唤雷霆与风暴的萨满教教主，法力无边。"
    },
    {
        id: "rn_lord_03", template: "lord", name: "瀚海沙虫王", region: "r_n", spawnType: "desert", timeStart: 2,
        subType: "beast", defType: "plate",
        atkType: "Heavy", // 逻辑：地龙翻身配合4.8倍率单体打击，碾压级物理破甲单位
        stats: { hp: 2462, phy_atk: 128, mag_atk: 20, phy_def: 78, mag_def: 38, speed: 8 },
        money: [100, 300],
        drops: [{ id: "materials_048", rate: 0.8 }],
        skills: [
            { id: "重压", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "钻地突袭", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "吞噬", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },
            { id: "瀚海地龙翻身", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },
            { id: "沙尘暴", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "致盲尘埃", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "硬化甲壳", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "沙海潜行", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】潜伏在戈壁深处的远古生物。"
    }
];

// --- Part I: 西域大漠 (r_w) [7条] ---
// 范围：河西走廊、塔里木、楼兰、天山
const enemies_r_w = [
    // ==========================================
    // 1. 大漠风情与危机
    // ==========================================
    {
        id: "rw_001", template: "minion", name: "沙暴巨蝎", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "insect", defType: "plate",
        atkType: "Agile", // 逻辑：高频毒螯剪切与摆尾，虽然防御高，但攻击逻辑符合低伤高频敏捷类
        stats: { hp: 190, phy_atk: 25, mag_atk: 0, phy_def: 12, mag_def: 10, speed: 8, toxicity: 40 },
        money: [0, 0],
        drops: [{ id: "materials_048", rate: 0.5 }, { id: "materials_018", rate: 0.4 }],
        skills: [
            { id: "毒螯剪切", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "巨蝎摆尾", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "隐藏在黄沙之下，尾针有剧毒，甲壳坚硬。"
    },
    {
        id: "rw_002", template: "minion", name: "马匪", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "human", defType: "leather",
        atkType: "Agile", // 逻辑：14点高速度，纵马突袭，典型的沙漠骑袭逻辑
        stats: { hp: 100, phy_atk: 20, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 14 },
        money: [30, 80],
        drops: [{ id: "weapons_043", rate: 0.15 }],
        skills: [
            { id: "大漠挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "纵马突袭", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "来去如风的沙盗，骑术精湛，手段残忍。"
    },
    {
        id: "rw_003", template: "elite", name: "楼兰古尸", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "undead", defType: "heavy",
        atkType: "Heavy", // 逻辑：木石躯体，低速(5)重击，配合千年尸毒破甲
        stats: { hp: 200, phy_atk: 30, mag_atk: 10, phy_def: 25, mag_def: 15, speed: 5 },
        money: [0, 0],
        drops: [{ id: "weapons_023", rate: 0.1 }, { id: "materials_012", rate: 0.2 }],
        skills: [
            { id: "腐朽抓挠", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "诅咒之触", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "千年尸毒", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】被黄沙掩埋千年的干尸，受诅咒而动，不惧刀剑。"
    },
    {
        id: "rw_004", template: "elite", name: "西域刀客", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "human", defType: "light",
        atkType: "Agile", // 逻辑：速度15，风沙旋斩，追求快速的身法与刀意压制
        stats: { hp: 160, phy_atk: 40, mag_atk: 0, phy_def: 8, mag_def: 10, speed: 15 },
        money: [50, 150],
        drops: [{ id: "weapons_043", rate: 0.2 }, { id: "book_cultivation_r2_25_full", rate: 0.1 }],
        skills: [
            { id: "风沙旋斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "大漠孤烟", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "刀意压制", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】流浪在丝绸之路上的独行侠，刀法极快。"
    },
    {
        id: "rw_005", template: "boss", name: "沙虫之母", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：吞噬重击，配合高防御与重型身躯造成的压制
        stats: { hp: 648, phy_atk: 49, mag_atk: 24, phy_def: 25, mag_def: 11, speed: 7 },
        money: [100, 200],
        drops: [{ id: "materials_018", rate: 0.5 }],
        skills: [
            { id: "钻地突击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "吞噬", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "毒液洪流", rate: 0.05, type: 1, damage: 2.6, damageType: "mag", dmgValType: 1 },
            { id: "流沙陷阱", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "母虫生命力", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】体型如小山的巨大沙虫，张开巨口能吞噬一切。"
    },
    {
        id: "rw_006", template: "minion", name: "苦行僧", region: "r_w", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Balanced", // 逻辑：戒刀斩与狮子吼，各项能力均衡
        stats: { hp: 120, phy_atk: 15, mag_atk: 10, phy_def: 15, mag_def: 15, speed: 6 },
        money: [0, 10],
        drops: [{ id: "weapons_051", rate: 0.2 }, { id: "book_cultivation_r3_20_full", rate: 0.05 }],
        skills: [
            { id: "戒刀怒斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "金刚狮子吼", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "从天竺东来的僧人，虽然慈悲，但也会金刚怒目。"
    },
    {
        id: "rw_007", template: "elite", name: "大宛卫士", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：枪阵突刺，依靠长兵器距离进行防御压制
        stats: { hp: 150, phy_atk: 25, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 10 },
        money: [40, 100],
        drops: [{ id: "weapons_044", rate: 0.1 }],
        skills: [
            { id: "枪阵突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "汗血军威", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            { id: "铁壁封锁", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】守护汗血宝马的精锐士兵，装备精良。"
    },
    {
        id: "rw_lord_01", template: "lord", name: "楼兰女王(怨灵)", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "undead", defType: "cloth",
        atkType: "Relic", // 逻辑：高法伤(64)，大漠葬歌与寂灭指，顶级的法术压制领主
        stats: { hp: 1404, phy_atk: 20, mag_atk: 64, phy_def: 24, mag_def: 48, speed: 16 },
        money: [100, 300],
        drops: [{ id: "materials_039", rate: 0.3 }, { id: "book_cultivation_r2_25_full", rate: 0.1 }],
        skills: [
            { id: "幽怨掌", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "绝望尖啸", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "大漠葬歌", rate: 0.05, type: 1, damage: 3.1, damageType: "mag", dmgValType: 1 },
            { id: "楼兰往事·寂灭", rate: 0.025, type: 1, damage: 5.2, damageType: "mag", dmgValType: 1 },
            { id: "倾国诅咒", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "怨灵缠身", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "魅影身法", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "幻像丛生", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】国破家亡的楼兰女王。"
    },
    {
        id: "rw_lord_02", template: "lord", name: "天山雪莲妖", region: "r_w", spawnType: "mountain", timeStart: 1,
        subType: "elemental", defType: "plate",
        atkType: "Relic", // 逻辑：顶级法坦，归虚大招，专克物理铁甲，自带持续回血
        stats: { hp: 2160, phy_atk: 10, mag_atk: 85, phy_def: 52, mag_def: 65, speed: 10 },
        money: [100, 300],
        drops: [{ id: "herbs_025", rate: 1.0 }],
        skills: [
            { id: "花瓣刃", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "冰封万里", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },
            { id: "凛冬之怒", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },
            { id: "万年雪华·归虚", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },
            { id: "寒气侵蚀", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "经络冰封", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 6 },
            { id: "冰雪护阵", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "万年药力", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】生长在天山之巅的万年雪莲修炼成精。"
    },
    {
        id: "rw_lord_03", template: "lord", name: "火焰山牛魔", region: "r_w", spawnType: "mountain", timeStart: 2,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：155物理破坏力全场最高，天崩大招配合熔岩血脉，核弹级破甲输出
        stats: { hp: 2520, phy_atk: 155, mag_atk: 30, phy_def: 76, mag_def: 28, speed: 8 },
        money: [100, 300],
        drops: [{ id: "weapons_029", rate: 0.1 }, { id: "materials_023", rate: 0.3 }],
        skills: [
            { id: "牛角挑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "蛮牛冲撞", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "烈焰重劈", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "魔王咆哮·天崩", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "魔王威压", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "烈焰焚身", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "火焰护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "熔岩血脉", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】从火焰山中走出的火焰巨牛。"
    }
];

// --- Part J: 岭南与南海 (r_s / r_se) [7条] ---
// 范围：百越、苍梧、南海、交趾
const enemies_r_s = [
    // ==========================================
    // 1. 岭南丛林 (r_s)
    // ==========================================
    {
        id: "rs_001", template: "minion", name: "越人战士", region: "r_s", spawnType: "mountain", timeStart: 0,
        subType: "human", defType: "none",
        atkType: "Agile", // 逻辑：丛林伏击、断发突袭，典型的低伤高频敏捷逻辑
        stats: { hp: 190, phy_atk: 18, mag_atk: 0, phy_def: 2, mag_def: 5, speed: 12 },
        money: [5, 20],
        drops: [{ id: "weapons_023", rate: 0.1 }, { id: "materials_005", rate: 0.3 }],
        skills: [
            { id: "丛林吹箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "断发突袭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "断发文身，善于在丛林中伏击。"
    },
    {
        id: "rs_002", template: "minion", name: "五彩瘴气蛛", region: "r_s", spawnType: "grass", timeStart: 0,
        subType: "insect", defType: "leather",
        atkType: "Relic", // 逻辑：利用法术属性(mag)造成瘴气伤害，专克物理铁甲
        stats: { hp: 150, phy_atk: 30, mag_atk: 10, phy_def: 5, mag_def: 10, speed: 10, toxicity: 40 },
        money: [0, 0],
        drops: [{ id: "materials_006", rate: 0.3 }],
        skills: [
            { id: "瘴气丝网", rate: 0.2, type: 1, damage: 1.1, damageType: "mag", dmgValType: 1 },
            { id: "致命螯刺", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "生活在瘴气弥漫的丛林中，颜色越鲜艳毒性越强。"
    },
    {
        id: "rs_003", template: "elite", name: "南越战象", region: "r_s", spawnType: "mountain", timeStart: 0,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：5点低速，战争践踏配合震地降防，典型的重型压制单位
        stats: { hp: 400, phy_atk: 45, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 5 },
        money: [0, 0],
        drops: [{ id: "materials_044", rate: 0.5 }, { id: "materials_011", rate: 0.5 }],
        skills: [
            { id: "长鼻横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "战争践踏", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "巨兽震慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】身披木甲的战象，冲锋起来地动山摇。"
    },
    {
        id: "rs_004", template: "elite", name: "蛊术师", region: "r_s", spawnType: "village", timeStart: 0,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：万蛊噬心，全法术(mag)输出，无视物理防具逻辑
        stats: { hp: 100, phy_atk: 5, mag_atk: 25, phy_def: 5, mag_def: 15, speed: 8, toxicity: 20 },
        money: [30, 80],
        drops: [{ id: "foodMaterial_002", rate: 0.4 }],
        skills: [
            { id: "蛊虫噬肉", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "万蛊噬心", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            { id: "百毒蛊", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】操控毒虫作为武器，令人防不胜防。"
    },
    {
        id: "rs_005", template: "minion", name: "采珠人(溺亡)", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "undead", defType: "none",
        atkType: "Relic", // 逻辑：亡灵生物，深海怨念，法系属性攻击
        stats: { hp: 170, phy_atk: 15, mag_atk: 5, phy_def: 5, mag_def: 10, speed: 8 },
        money: [10, 50],
        drops: [{ id: "materials_039", rate: 0.2 }, { id: "weapons_015", rate: 0.3 }],
        skills: [
            { id: "水草缠绕", rate: 0.2, type: 1, damage: 1.1, damageType: "mag", dmgValType: 1 },
            { id: "深海怨念", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "为了采集海底珍珠而溺亡的怨魂。"
    },
    {
        id: "rs_006", template: "minion", name: "南海大鲨", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：15点高速度，血色狂暴配合撕裂咬击，极致物理暴击风格
        stats: { hp: 200, phy_atk: 40, mag_atk: 0, phy_def: 10, mag_def: 5, speed: 15 },
        money: [0, 0],
        drops: [{ id: "materials_046", rate: 0.4 }],
        skills: [
            { id: "撕裂咬击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "血色狂暴", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "海中嗜血的猎手，闻到血腥味就会疯狂。"
    },
    {
        id: "rs_007", template: "boss", name: "深海巨妖", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "beast", defType: "leather",
        atkType: "Reach", // 逻辑：利用多条触手进行中距离绞杀与碾压，具备长兵器般的压制感
        stats: { hp: 648, phy_atk: 55, mag_atk: 10, phy_def: 17, mag_def: 11, speed: 9 },
        money: [100, 200],
        drops: [{ id: "materials_039", rate: 1.0 }, { id: "weapons_075", rate: 0.1 }],
        skills: [
            { id: "触手抽击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "触手绞杀", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            { id: "深海碾压", rate: 0.05, type: 1, damage: 2.6, damageType: "phy", dmgValType: 1 },
            { id: "墨汁喷吐", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "深海愈合", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】多条触手的海怪，能轻易掀翻楼船。"
    },
    {
        id: "rs_lord_01", template: "lord", name: "南越武王(赵佗)", region: "r_s", spawnType: "city", timeStart: 0,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：精通兵法剑招，横扫百越，具备领主级的战阵物理压制
        stats: { hp: 1404, phy_atk: 72, mag_atk: 15, phy_def: 40, mag_def: 24, speed: 14 },
        money: [100, 300],
        drops: [{ id: "weapons_038", rate: 0.1 }, { id: "book_body_r1_16_full", rate: 0.1 }],
        skills: [
            { id: "基础剑招", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "天子剑法", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "横扫百越", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "武王灭寇斩", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "帝王霸气", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "天威难测", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "割据一方", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "老当益壮", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】割据岭南的秦朝将领，虽已年迈，但帝王霸气犹存。"
    },
    {
        id: "rs_lord_02", template: "lord", name: "万蛊之王", region: "r_s", spawnType: "mountain", timeStart: 1,
        subType: "insect", defType: "leather",
        atkType: "Relic", // 逻辑：蛊神终结咒(5.8倍率)极致法术爆发，专克厚甲的灵异领主
        stats: { hp: 1458, phy_atk: 30, mag_atk: 95, phy_def: 32, mag_def: 65, speed: 20, toxicity: 60 },
        money: [100, 300],
        drops: [{ id: "materials_010", rate: 0.5 }],
        skills: [
            { id: "毒刺", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "万蛊噬心", rate: 0.1, type: 1, damage: 2.1, damageType: "mag", dmgValType: 1 },
            { id: "剧毒爆发", rate: 0.05, type: 1, damage: 3.3, damageType: "mag", dmgValType: 1 },
            { id: "蛊神终结咒", rate: 0.025, type: 1, damage: 5.8, damageType: "mag", dmgValType: 1 },
            { id: "剧毒新星", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "蛊毒焚身", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "蛊神护体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "万蛊回生", rate: 0.02, type: 3, buffValue: 0.06, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】吞噬了无数毒虫后诞生的蛊王，剧毒无比，触之即死。"
    },
    {
        id: "rs_lord_03", template: "lord", name: "南海龙王(伪)", region: "r_se", spawnType: "ocean", timeStart: 2,
        subType: "beast", defType: "plate",
        atkType: "Heavy", // 逻辑：海中巨兽，利用惊人的体重进行鲸吞与灭世狂澜，重型压制逻辑
        stats: { hp: 2646, phy_atk: 100, mag_atk: 132, phy_def: 65, mag_def: 70, speed: 10 },
        money: [100, 300],
        drops: [{ id: "materials_039", rate: 0.8 }, { id: "weapons_075", rate: 0.1 }],
        skills: [
            { id: "水柱喷射", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "深海重压", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "鲸吞蚕食", rate: 0.05, type: 1, damage: 3.5, damageType: "phy", dmgValType: 1 },
            { id: "南海·灭世狂澜", rate: 0.025, type: 1, damage: 6.0, damageType: "mag", dmgValType: 1 },
            { id: "惊涛骇浪", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "寒冰水牢", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "水幕天华", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "洋流推进", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】统御南海水族的一头巨型鲸鲵，自封为王。"
    }
];
const enemies_1=[
// ==========================================
    // 1. 全球普通单位 (Global Minions)
    // ==========================================
    {
        id: "global_minion_1_01", template: "minion", name: "灵噬硕鼠", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：体型如犬但保留老鼠的敏捷，瘟疫飞扑追求高频物理输出
        stats: { hp: 151, phy_atk: 27, mag_atk: 2, phy_def: 5, mag_def: 3, speed: 10 },
        money: [20, 50],
        drops: [{ id: "materials_086", rate: 0.3 }, { id: "materials_087", rate: 0.1 }],
        skills: [
            { id: "撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "瘟疫飞扑", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "原本只是田间的老鼠，因吞食了灵气倒灌后疯长的谷物，体型暴增如犬。"
    },
    {
        id: "global_minion_1_02", template: "minion", name: "爆体残尸", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead", defType: "heavy",
        atkType: "Heavy", // 逻辑：碎骨重击，牺牲速度(8)换取破甲感的坦克型怪
        stats: { hp: 176, phy_atk: 13, mag_atk: 13, phy_def: 8, mag_def: 7, speed: 8 },
        money: [30, 60],
        drops: [{ id: "materials_088", rate: 0.2 }, { id: "materials_089", rate: 0.2 }],
        skills: [
            { id: "无意识抓挠", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "碎骨重击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "承受不住倒灌的法力而当场爆体身亡的士卒，残破的躯体在灵流的裹挟下移动。"
    },
    {
        id: "global_minion_1_03", template: "minion", name: "狂乱荆棘", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental", defType: "leather",
        atkType: "Balanced", // 逻辑：属性均衡分布(21/21/6/6)，典型的万金油模板
        stats: { hp: 113, phy_atk: 21, mag_atk: 21, phy_def: 6, mag_def: 6, speed: 9 },
        money: [10, 30],
        drops: [{ id: "materials_090", rate: 0.3 }, { id: "materials_091", rate: 0.1 }],
        skills: [
            { id: "荆刺抽打", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "死亡绞杀", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "受到狂暴法力滋养的植物，长出了锯齿般的倒刺，会主动攻击靠近的活物。"
    },
    {
        id: "global_minion_1_04", template: "minion", name: "红眼野狗", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：狂化后攻击(36)极高防御(2)极低，追求极致的换血和物理暴击
        stats: { hp: 151, phy_atk: 36, mag_atk: 5, phy_def: 2, mag_def: 2, speed: 10 },
        money: [20, 50],
        drops: [{ id: "materials_092", rate: 0.3 }, { id: "materials_093", rate: 0.2 }],
        skills: [
            { id: "狂犬撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "喉管锁定", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "徘徊在乱葬岗的野狗，因啃食了沾染天人五衰气息的尸体，变得凶残无比。"
    },
    {
        id: "global_minion_1_05", template: "minion", name: "失智方士学徒", region: "all", spawnType: "all", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：纯法术输出(mag_atk: 25)，法力自爆，专克凡铁护甲
        stats: { hp: 126, phy_atk: 2, mag_atk: 25, phy_def: 3, mag_def: 5, speed: 10 },
        money: [50, 100],
        drops: [{ id: "materials_094", rate: 0.3 }, { id: "materials_095", rate: 0.2 }],
        skills: [
            { id: "紊乱火球", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "法力自爆", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "看着罗盘指针疯狂旋转而道心崩溃的小方士，胡乱释放着不成型的法术。"
    },

    // ==========================================
    // 2. 全球精英单位 (Global Elites)
    // ==========================================
    {
        id: "global_elite_1_01", template: "elite", name: "禁军尸长", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead", defType: "heavy",
        atkType: "Heavy", // 逻辑：肉盾单位，军道杀拳，追求稳健的重型压制
        stats: { hp: 441, phy_atk: 20, mag_atk: 20, phy_def: 21, mag_def: 18, speed: 9 },
        money: [80, 150],
        drops: [{ id: "weapons_040", rate: 0.2 }, { id: "materials_096", rate: 0.1 }],
        skills: [
            { id: "生锈铁剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "军道杀拳·残", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "尸气威慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "生前是守卫咸阳的百夫长，死后仍紧握着生锈的秦剑。"
    },
    {
        id: "global_elite_1_02", template: "elite", name: "双头变异狼", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：53点极高物攻，配合12点速度，双喉锁杀追求高频物理斩杀
        stats: { hp: 378, phy_atk: 53, mag_atk: 8, phy_def: 7, mag_def: 7, speed: 12 },
        money: [60, 120],
        drops: [{ id: "materials_097", rate: 0.5 }, { id: "materials_098", rate: 0.2 }],
        skills: [
            { id: "交替撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "双喉锁杀", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "腥臭咆哮", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "灵气让它的颈部裂开，长出了第二颗扭曲的头颅，更加狡诈和残忍。"
    },
    {
        id: "global_elite_1_03", template: "elite", name: "灵气乱流聚合体", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental", defType: "cloth",
        atkType: "Relic", // 逻辑：法力火花、能量超载，纯粹的魔法能量轰击
        stats: { hp: 283, phy_atk: 4, mag_atk: 45, phy_def: 12, mag_def: 21, speed: 10 },
        money: [100, 200],
        drops: [{ id: "materials_099", rate: 0.3 }, { id: "materials_100", rate: 0.1 }],
        skills: [
            { id: "法力火花", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "能量超载", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "磁场紊乱", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "由浑浊的倒灌法力凝聚而成，对周围的一切进行无差别的能量轰击。"
    },
    {
        id: "global_elite_1_04", template: "elite", name: "暴走木甲兽", region: "all", spawnType: "all", timeStart: 1,
        subType: "mechanism", defType: "heavy",
        atkType: "Heavy", // 逻辑：6点低速，核心过载锯齿，典型的重型机械破甲逻辑
        stats: { hp: 472, phy_atk: 27, mag_atk: 27, phy_def: 25, mag_def: 21, speed: 6 },
        money: [150, 250],
        drops: [{ id: "materials_101", rate: 0.5 }, { id: "materials_102", rate: 0.3 }],
        skills: [
            { id: "机械冲撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "过载锯齿", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "排气烟雾", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 3 }
        ],
        desc: "墨家遗留在世俗的耕作机关，核心被狂暴灵气充能后彻底失控。"
    },
    {
        id: "global_elite_1_05", template: "elite", name: "走火入魔的散修", region: "all", spawnType: "all", timeStart: 1,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：逆行经脉、精血燃爆，危险的法术爆发单位
        stats: { hp: 315, phy_atk: 3, mag_atk: 37, phy_def: 8, mag_def: 14, speed: 12 },
        money: [200, 300],
        drops: [{ id: "book_cultivation_r1_00_full", rate: 0.1 }],
        skills: [
            { id: "逆行经脉指", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "精血燃爆", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "癫狂笑声", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "贪婪吸纳浑浊灵气而导致经脉逆行的修道者，法力异常狂暴。"
    },
    {
        id: "global_boss_1_01", template: "boss", name: "守陵尸将", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        atkType: "Reach", // 逻辑：生前为精锐锐士，擅长长兵器横扫，具备极佳的阵地物理压制力
        stats: { hp: 1481, phy_atk: 34, mag_atk: 20, phy_def: 33, mag_def: 28, speed: 12 },
        money: [300, 500],
        drops: [{ id: "materials_103", rate: 0.1 }, { id: "materials_104", rate: 0.5 }, { id: "materials_105", rate: 0.3 }],
        skills: [
            { id: "横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "跳劈", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "亡灵旋风斩", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "尸气压制", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "亡者坚韧", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "秦皇陵外围苏醒的守卫，保留了强大的战斗本能。"
    },
    {
        id: "global_boss_1_02", template: "boss", name: "变异食人花王", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental",
        atkType: "Relic", // 逻辑：法术压制型(mag_atk: 75)，酸液与根须攻击无视凡铁防具
        stats: { hp: 680, phy_atk: 10, mag_atk: 75, phy_def: 19, mag_def: 33, speed: 13 },
        money: [250, 450],
        drops: [{ id: "materials_106", rate: 0.1 }, { id: "materials_107", rate: 0.4 }, { id: "materials_108", rate: 0.4 }],
        skills: [
            { id: "酸液喷吐", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "根须穿刺", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "灵能消化液", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "麻痹花粉", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "光合再生", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 }
        ],
        desc: "原本是御花园中的观赏花卉，变异后品尝到了血肉的滋味。"
    },
    {
        id: "global_boss_1_03", template: "boss", name: "血煞狼王", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        atkType: "Agile", // 逻辑：高物攻(90)、极低防、极速，典型的低伤高频/物理爆发定位
        stats: { hp: 907, phy_atk: 90, mag_atk: 15, phy_def: 9, mag_def: 9, speed: 15 },
        money: [200, 400],
        drops: [{ id: "materials_109", rate: 0.1 }, { id: "materials_110", rate: 0.5 }, { id: "materials_111", rate: 0.4 }],
        skills: [
            { id: "迅猛撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "血喉锁杀", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "月下狂袭", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "恐惧嚎叫", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "嗜血本能", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "沐浴了带有神魔怨念的灵雨，体型巨大且双眼透着血光。"
    },
    {
        id: "global_boss_1_04", template: "boss", name: "癫狂炼丹师", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        atkType: "Balanced", // 逻辑：物法双修(44/44)，各项属性极其平均，稳定的混合输出
        stats: { hp: 756, phy_atk: 44, mag_atk: 44, phy_def: 17, mag_def: 17, speed: 15 },
        money: [400, 600],
        drops: [{ id: "materials_112", rate: 0.1 }, { id: "materials_113", rate: 0.4 }, { id: "materials_114", rate: 0.3 }],
        skills: [
            { id: "投掷毒丹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "掌心雷", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "丹炉爆炸", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "药力紊乱", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 },
            { id: "透支潜能", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 }
        ],
        desc: "吞服大量变异丹药后力量暴增但也彻底发疯的方士。"
    },
    {
        id: "global_boss_1_05", template: "boss", name: "墨家攻城兽·破", region: "all", spawnType: "all", timeStart: 1,
        subType: "mechanism",
        atkType: "Heavy", // 逻辑：攻城锤击，超载碾压，牺牲速度追求极致破甲效果
        stats: { hp: 1134, phy_atk: 75, mag_atk: 10, phy_def: 28, mag_def: 15, speed: 7 },
        money: [350, 550],
        drops: [{ id: "materials_115", rate: 0.1 }, { id: "materials_116", rate: 0.5 }, { id: "materials_117", rate: 0.3 }],
        skills: [
            { id: "巨臂横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "攻城锤击", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "超载碾压", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "震荡波", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "铜墙铁壁", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "沉睡武库中的战争机器，核心失控后自动启动。"
    },

    // ==========================================
    // 2. 全球领主级 (Global Lords)
    // ==========================================
    {
        id: "global_lord_1_01", template: "lord", name: "秦陵守灵人", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        atkType: "Reach", // 逻辑：重剑镇墓，天子守陵斩，具备顶级物理压制与军阵防御力
        stats: { hp: 2963, phy_atk: 47, mag_atk: 20, phy_def: 50, mag_def: 40, speed: 12 },
        money: [200, 500],
        drops: [{ id: "materials_118", rate: 0.1 }, { id: "body_195", rate: 0.1 }, { id: "materials_119", rate: 0.5 }],
        skills: [
            { id: "重剑横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "镇墓一击", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "大秦军阵·破", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "天子守陵斩", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "皇陵威压", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "尸毒攻心", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "不动如山", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "地脉护体", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】始皇陵最外层的守护者，肉体坚硬如铁。"
    },
    {
        id: "global_lord_1_02", template: "lord", name: "墨家巨灵神", region: "all", spawnType: "all", timeStart: 1,
        subType: "mechanism",
        atkType: "Heavy", // 逻辑：105高物攻配合6.0倍率墨子悲歌，极速破坏铁甲的重型兵器
        stats: { hp: 2268, phy_atk: 105, mag_atk: 10, phy_def: 42, mag_def: 25, speed: 7 },
        money: [200, 500],
        drops: [{ id: "materials_120", rate: 0.1 }, { id: "materials_121", rate: 0.2 }, { id: "materials_122", rate: 0.5 }],
        skills: [
            { id: "巨臂碾压", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "火箭飞拳", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "千斤坠", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "非攻·墨子悲歌", rate: 0.025, type: 1, damage: 6.0, damageType: "phy", dmgValType: 1 },
            { id: "震耳轰鸣", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 },
            { id: "重力场", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "装甲强化", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "核心过载", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】墨家制造的终极兵器，失控后成为不知疲倦的杀戮机器。"
    },
    {
        id: "global_lord_1_03", template: "lord", name: "炼丹大宗师", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        atkType: "Relic", // 逻辑：三昧真火与五雷正法，纯粹的法力穿透攻击
        stats: { hp: 1512, phy_atk: 10, mag_atk: 88, phy_def: 19, mag_def: 45, speed: 15 },
        money: [200, 500],
        drops: [{ id: "pills_r6_008", rate: 0.05 }, { id: "materials_123", rate: 0.1 }, { id: "materials_124", rate: 0.5 }],
        skills: [
            { id: "三昧真火", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "五雷正法", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "丹火焚天", rate: 0.1, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "长生诀·逆炼", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "神魂颠倒", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 },
            { id: "药毒入体", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "灵气护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "狂暴药力", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】走火入魔导致法力暴涨的前秦皇首席方士。"
    },
    {
        id: "global_lord_1_04", template: "lord", name: "吞天巴蛇", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        atkType: "Balanced", // 逻辑：物法双修均衡分布(67/67)，典型的全能控制与生存单位
        stats: { hp: 1814, phy_atk: 67, mag_atk: 67, phy_def: 23, mag_def: 23, speed: 15 },
        money: [200, 500],
        drops: [{ id: "materials_125", rate: 0.1 }, { id: "materials_126", rate: 0.3 }, { id: "weapons_965", rate: 0.1 }],
        skills: [
            { id: "巨尾横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "毒雾喷吐", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "死亡缠绕", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "人心不足蛇吞象", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "剧毒麻痹", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "消化酸液", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "鳞片硬化", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "蜕皮重生", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】上古异兽巴蛇后裔，在灵雨滋润下血脉返祖。"
    },
    {
        id: "global_lord_1_05", template: "lord", name: "祖龙残魂", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental",
        atkType: "Relic", // 逻辑：105极致法术伤害，千古一帝·寂灭大招，降维打击物理单位
        stats: { hp: 1360, phy_atk: 20, mag_atk: 105, phy_def: 29, mag_def: 45, speed: 13 },
        money: [200, 500],
        drops: [{ id: "传国玉玺(伪)", rate: 0.05 }, { id: "龙魂晶石", rate: 0.2 }, { id: "帝王之气", rate: 0.5 }],
        skills: [
            { id: "龙威震慑", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "黑龙吐息", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "大秦国运·崩", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "千古一帝·寂灭", rate: 0.025, type: 1, damage: 6.0, damageType: "mag", dmgValType: 1 },
            { id: "帝王凝视", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "灵魂凋零", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "真龙护体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "龙脉汲取", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】始皇帝死后执念与大秦国运结合，化作徘徊在九州上空的黑色龙影。"
    }

];

const enemies_2=[
// ==========================================
    // 1. 普通单位 (Minions) - 咸阳血祭背景
    // ==========================================
    {
        id: "global_minion_2_01", template: "minion", name: "血目魔兵", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "heavy",
        atkType: "Reach", // 逻辑：保留长戈突刺本能，僵硬但具备中距离压制力
        stats: { hp: 226, phy_atk: 28, mag_atk: 5, phy_def: 8, mag_def: 6, speed: 8 },
        money: [40, 80],
        drops: [{ id: "沾血的秦甲碎片", rate: 0.3 }, { id: "断裂的长戈", rate: 0.1 }],
        skills: [
            { id: "僵硬突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "嗜血斩击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "被炼血阵抽干了神智的卫士，双目流血，见人就杀。"
    },
    {
        id: "global_minion_2_02", template: "minion", name: "怨气宫女", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "cloth",
        atkType: "Relic", // 逻辑：法术输出(28)，怨念尖叫无视物理防具
        stats: { hp: 226, phy_atk: 3, mag_atk: 28, phy_def: 5, mag_def: 8, speed: 8 },
        money: [40, 80],
        drops: [{ id: "破碎的宫廷玉佩", rate: 0.2 }, { id: "染血的丝绸", rate: 0.3 }],
        skills: [
            { id: "怨念尖叫", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "鬼爪索命", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "惨死在血祭中的宫女，化作厉鬼徘徊在废墟之上。"
    },
    {
        id: "global_minion_2_03", template: "minion", name: "嗜血魔蝠", region: "all", spawnType: "all", timeStart: 2,
        subType: "insect", defType: "none",
        atkType: "Agile", // 逻辑：13点高机动，吸血獠牙追求高频低伤
        stats: { hp: 113, phy_atk: 35, mag_atk: 5, phy_def: 5, mag_def: 4, speed: 13 },
        money: [30, 60],
        drops: [{ id: "蝙蝠翼", rate: 0.3 }, { id: "微量毒血", rate: 0.2 }],
        skills: [
            { id: "超声音波", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "吸血獠牙", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "沐浴血云而体型变大的蝙蝠，极度渴望鲜血。"
    },
    {
        id: "global_minion_2_04", template: "minion", name: "食尸秃鹫", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast", defType: "none",
        atkType: "Agile", // 逻辑：飞行猛禽俯冲攻击，典型高频敏捷逻辑
        stats: { hp: 194, phy_atk: 35, mag_atk: 5, phy_def: 6, mag_def: 4, speed: 10 },
        money: [35, 70],
        drops: [{ id: "秃鹫羽毛", rate: 0.3 }, { id: "腐烂的肉块", rate: 0.2 }],
        skills: [
            { id: "俯冲啄击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "撕裂腐肉", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "吃多了含怨血肉的食尸猛禽，极具攻击性。"
    },
    {
        id: "global_minion_2_05", template: "minion", name: "失败的炼尸学徒", region: "all", spawnType: "all", timeStart: 2,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：纯法术属性(32)，尸毒与控尸，专克凡铁
        stats: { hp: 162, phy_atk: 5, mag_atk: 32, phy_def: 5, mag_def: 7, speed: 10 },
        money: [60, 120],
        drops: [{ id: "低级尸油", rate: 0.3 }, { id: "控尸铃(伪)", rate: 0.1 }],
        skills: [
            { id: "尸毒掌", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "召唤尸虫", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "修炼尸道走火入魔的人，人不人鬼不鬼。"
    },

    // ==========================================
    // 2. 精英单位 (Elites)
    // ==========================================
    {
        id: "global_elite_2_01", template: "elite", name: "血甲斩首官", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "heavy",
        atkType: "Heavy", // 逻辑：手持鬼头刀进行处决斩杀，典型的重型破甲逻辑
        stats: { hp: 567, phy_atk: 26, mag_atk: 5, phy_def: 27, mag_def: 23, speed: 9 },
        money: [120, 200],
        drops: [{ id: "行刑者的鬼头刀", rate: 0.1 }, { id: "沾血的腰牌", rate: 0.5 }],
        skills: [
            { id: "沉重斩击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "处决断头", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "血腥威慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "盔甲上流淌着永不干涸鲜血的行刑官，被怨气反噬。"
    },
    {
        id: "global_elite_2_02", template: "elite", name: "堕落的司天监", region: "all", spawnType: "all", timeStart: 2,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：法攻48，主持血祭，法术穿透能力极强
        stats: { hp: 405, phy_atk: 5, mag_atk: 48, phy_def: 10, mag_def: 18, speed: 12 },
        money: [150, 250],
        drops: [{ id: "血祭阵图(残)", rate: 0.2 }, { id: "污秽的 文", rate: 0.3 }],
        skills: [
            { id: "血煞咒", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "冤魂引爆", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "神智侵蚀", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "布置绝户炼血阵的官员，沦为血魔傀儡。"
    },
    {
        id: "global_elite_2_03", template: "elite", name: "御苑变异猛虎", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：68高攻，12速，锁喉撕咬追求高频物理斩杀
        stats: { hp: 486, phy_atk: 68, mag_atk: 10, phy_def: 8, mag_def: 8, speed: 12 },
        money: [100, 180],
        drops: [{ id: "斑斓虎皮", rate: 0.4 }, { id: "虎骨", rate: 0.3 }],
        skills: [
            { id: "扑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "锁喉撕咬", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "虎啸山林", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "吞食大量尸体后变异的御花园猛虎。"
    },
    {
        id: "global_elite_2_04", template: "elite", name: "青铜血俑", region: "all", spawnType: "all", timeStart: 2,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：千钧重踏，铜臂挥击，典型的机械式重型破甲单位
        stats: { hp: 607, phy_atk: 34, mag_atk: 5, phy_def: 32, mag_def: 28, speed: 6 },
        money: [180, 280],
        drops: [{ id: "青铜核心", rate: 0.2 }, { id: "凝固的血块", rate: 0.3 }],
        skills: [
            { id: "铜臂挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "千钧重踏", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "血气弥漫", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "被血气灌注灵性的青铜俑，外壳下红光流转。"
    },
    {
        id: "global_elite_2_05", template: "elite", name: "厉鬼夫人", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "cloth",
        atkType: "Relic", // 逻辑：法术爆发型，夺魄尖啸无视物理护甲
        stats: { hp: 567, phy_atk: 5, mag_atk: 43, phy_def: 12, mag_def: 20, speed: 9 },
        money: [150, 250],
        drops: [{ id: "染血的金钗", rate: 0.1 }, { id: "怨灵之尘", rate: 0.4 }],
        skills: [
            { id: "阴风爪", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "夺魄尖啸", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "诅咒凝视", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "hp", debuffTimes: 3 }
        ],
        desc: "游荡在宫墙外的皇族女眷怨灵。"
    },

    // ==========================================
    // 3. 领主与首领 (Boss & Lord)
    // ==========================================
    {
        id: "global_boss_2_01", template: "boss", name: "杜邮行刑官", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "heavy",
        atkType: "Heavy", // 逻辑：行刑巨斧，追求断头台般的破甲压制
        stats: { hp: 1905, phy_atk: 44, mag_atk: 20, phy_def: 45, mag_def: 38, speed: 12 },
        money: [400, 600],
        drops: [{ id: "行刑者的巨斧", rate: 0.1 }, { id: "怨魂结晶", rate: 0.3 }],
        skills: [
            { id: "横劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "断头台", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "血腥处决", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "死亡凝视", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "血肉硬化", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "死后与受害者怨念合一的刽子手，是不知疲倦的杀人机器。"
    },
    {
        id: "global_boss_2_02", template: "boss", name: "炼血妖道", region: "all", spawnType: "all", timeStart: 2,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：血海滔天，纯粹的魔法降维打击
        stats: { hp: 972, phy_atk: 10, mag_atk: 81, phy_def: 17, mag_def: 29, speed: 15 },
        money: [500, 700],
        drops: [{ id: "妖道法剑", rate: 0.1 }, { id: "邪恶阵图", rate: 0.2 }],
        skills: [
            { id: "血箭", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "化血大法", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "血海滔天", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "血液沸腾", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 3 },
            { id: "借命术", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 }
        ],
        desc: "赵高爪牙，以生灵精血修炼邪术的方士。"
    },
    {
        id: "global_boss_2_03", template: "boss", name: "泣血公主", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "light",
        atkType: "Relic", // 逻辑：法术爆发高(73)，绝户诅咒专克物理防御
        stats: { hp: 1360, phy_atk: 10, mag_atk: 73, phy_def: 20, mag_def: 32, speed: 12 },
        money: [450, 650],
        drops: [{ id: "皇室丝绸", rate: 0.3 }, { id: "怨灵之泪", rate: 0.1 }],
        skills: [
            { id: "悲鸣", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "九幽阴风", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "绝户诅咒", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "皇室威仪·堕", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 },
            { id: "怨念护盾", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 }
        ],
        desc: "始皇最宠爱的女儿，被肢解后化作凄厉的红衣厉鬼。"
    },
    {
        id: "global_boss_2_04", template: "boss", name: "尸肉巨兽", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast", defType: "heavy",
        atkType: "Heavy", // 逻辑：肉山怪物，物理冲击力与体重碾压，契合重型模组
        stats: { hp: 1633, phy_atk: 53, mag_atk: 10, phy_def: 36, mag_def: 26, speed: 15 },
        money: [350, 550],
        drops: [{ id: "巨大的犬牙", rate: 0.2 }, { id: "变异兽皮", rate: 0.4 }],
        skills: [
            { id: "野蛮冲撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "暴食撕咬", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "尸山压顶", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "腐臭气体", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 3 },
            { id: "快速愈合", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 }
        ],
        desc: "吞食了太多尸块膨胀而成的刑场恶犬。"
    },
    {
        id: "global_boss_2_05", template: "boss", name: "处刑机关人", region: "all", spawnType: "all", timeStart: 2,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：绞肉风暴，超频运作，追求极端物理破甲伤害
        stats: { hp: 1458, phy_atk: 97, mag_atk: 5, phy_def: 38, mag_def: 25, speed: 7 },
        money: [400, 600],
        drops: [{ id: "青铜处刑刃", rate: 0.1 }, { id: "血色 文", rate: 0.2 }],
        skills: [
            { id: "旋刃斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "死亡穿刺", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "绞肉风暴", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "锯齿创伤", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 3 },
            { id: "超频运作", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "双臂被改装成处刑刀刃的失控工程机关。"
    },
    {
        id: "global_lord_2_01", template: "lord", name: "始皇长子·扶苏", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead", defType: "heavy",
        atkType: "Relic", // 逻辑：顶级领主，全法术(101)核弹级输出，皇天后土·皆杀降维打击
        stats: { hp: 2721, phy_atk: 10, mag_atk: 101, phy_def: 28, mag_def: 47, speed: 12 },
        money: [200, 500],
        drops: [{ id: "仁君的断剑", rate: 0.1 }, { id: "怨恨灵珠", rate: 0.5 }],
        skills: [
            { id: "仁道崩塌", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "阴魂索命", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "上郡悲歌", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "皇天后土·皆杀", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "帝王怨气", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "七窍流血", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "鬼王之躯", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "亡灵意志", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】满怀恨意归来的鬼王，要让整个咸阳为他陪葬。"
    },

    // 2. 绝户阵眼·血魔赵高(分身) - 人类/法师
    {
        id: "global_lord_2_02", template: "lord", name: "血魔赵高(分身)", region: "all", spawnType: "all", timeStart: 2,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：极高法伤(113)，沙丘之谋爆发，纯粹的法力穿透与精神攻击
        stats: { hp: 1944, phy_atk: 10, mag_atk: 113, phy_def: 25, mag_def: 43, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "指鹿为马图", rate: 0.1 },
            { id: "中车府令印", rate: 0.2 },
            { id: "血魔精华", rate: 0.5 }
        ],
        skills: [
            { id: "血手印", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "指鹿为马", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "绝户煞气", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "沙丘之谋·篡国", rate: 0.025, type: 1, damage: 5.8, damageType: "mag", dmgValType: 1 },
            { id: "权倾朝野", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 },
            { id: "血祭反噬", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "血影遁", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "窃国气运", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】大秦帝国的掘墓人，其实力已半只脚踏入魔道。"
    },

    // 3. 镇国神兽·血麒麟 - 野兽/刺客
    {
        id: "global_lord_2_03", template: "lord", name: "镇国神兽·血麒麟", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast", defType: "leather",
        atkType: "Agile", // 逻辑：161极致物攻天花板，追求瑞兽之怒的高频必杀，典型爆发刺客
        stats: { hp: 2332, phy_atk: 161, mag_atk: 20, phy_def: 19, mag_def: 19, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "血麒麟之角", rate: 0.1 },
            { id: "血色鳞片", rate: 0.4 },
            { id: "祥瑞(堕)内丹", rate: 0.2 }
        ],
        skills: [
            { id: "血蹄践踏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "魔角突刺", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "瑞兽之怒", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "天罚·血雷降世", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "凶威", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "厄运缠身", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "疾风迅雷", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "嗜血狂暴", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】全身鳞片赤红如血，所过之处灾厄丛生。"
    },

    // 4. 刑徒领袖·章邯(魔化) - 人类/坦克
    {
        id: "global_lord_2_04", template: "lord", name: "魔化上将军·章邯", region: "all", spawnType: "all", timeStart: 2,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：刑徒剑法配合军威压制，虽然是坦克但具备顶级长兵器的物理封锁感
        stats: { hp: 1944, phy_atk: 67, mag_atk: 40, phy_def: 60, mag_def: 51, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "少府将军令", rate: 0.1 },
            { id: "魔化秦甲", rate: 0.3 },
            { id: "刑徒镣铐", rate: 0.5 }
        ],
        skills: [
            { id: "刑徒剑法", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "镇压乱党", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "骊山崩塌", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "最后的名将·死守", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },
            { id: "军威压制", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "绝望囚笼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },
            { id: "不动如山", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "绝境逢生", rate: 0.02, type: 3, buffValue: 0.06, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】大秦最后的名将，为了挽救危局不惜修炼禁术。"
    },

    // 5. 十二金人·杀戮令(残) - 机关/坦克
    {
        id: "global_lord_2_05", template: "lord", name: "十二金人·杀戮令", region: "all", spawnType: "all", timeStart: 2,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：极低速(7)，兵戈横扫与镇杀，纯粹的重型破甲碾压逻辑
        stats: { hp: 2916, phy_atk: 81, mag_atk: 10, phy_def: 78, mag_def: 67, speed: 7 },
        money: [200, 500],
        drops: [
            { id: "金人核心碎片", rate: 0.1 },
            { id: "未知的合金", rate: 0.5 },
            { id: "巨型兵器残骸", rate: 0.3 }
        ],
        skills: [
            { id: "巨足践踏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "兵戈横扫", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "金属风暴", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "天下一统·镇杀", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },
            { id: "震地波", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "重金属中毒", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "金石之躯", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "自我修复", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】始皇帝铸造的巨型金人之一，执行着毁灭活物的错误指令。"
    }
];

const enemies_3=[
// ==========================================
    // 1. 普通单位 (Minions) - 大泽乡与草莽崛起
    // ==========================================
    {
        id: "global_minion_3_01", template: "minion", name: "揭竿义军", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "none",
        atkType: "Balanced", // 逻辑：属性平均，使用木棍等基础兵器，作为该阶段的基础单位
        stats: { hp: 198, phy_atk: 40, mag_atk: 5, phy_def: 9, mag_def: 6, speed: 10 },
        money: [50, 100],
        drops: [{ id: "折断的木棍", rate: 0.3 }, { id: "破旧的粗布衣", rate: 0.2 }],
        skills: [
            { id: "斩木为兵", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "草莽怒吼", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "大泽乡起义的先锋，沐浴灵气后爆发出了撕裂虎豹的力量。"
    },
    {
        id: "global_minion_3_02", template: "minion", name: "泥沼毒蟾", region: "all", spawnType: "all", timeStart: 3,
        subType: "beast", defType: "leather",
        atkType: "Heavy", // 逻辑：利用重量级的毒舌鞭挞进行压制，属于慢速重型单位
        stats: { hp: 237, phy_atk: 26, mag_atk: 10, phy_def: 11, mag_def: 8, speed: 10 },
        money: [40, 80],
        drops: [{ id: "蟾蜍毒液", rate: 0.3 }, { id: "湿滑的皮", rate: 0.2 }],
        skills: [
            { id: "毒舌鞭挞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "腐蚀粘液", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "潜伏在泥泞中的巨大蟾蜍，散发着奇异的紫光。"
    },
    {
        id: "global_minion_3_03", template: "minion", name: "灵雨水精", region: "all", spawnType: "all", timeStart: 3,
        subType: "elemental", defType: "none",
        atkType: "Relic", // 逻辑：纯法术输出(48)，无视物理防御的元素生命
        stats: { hp: 178, phy_atk: 5, mag_atk: 48, phy_def: 8, mag_def: 12, speed: 9 },
        money: [60, 120],
        drops: [{ id: "纯净水元", rate: 0.3 }, { id: "灵雨露珠", rate: 0.2 }],
        skills: [
            { id: "水弹冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "窒息包裹", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "暴雨落地后聚集成形，产生了朦胧的自我意识。"
    },
    {
        id: "global_minion_3_04", template: "minion", name: "龙化草寇", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "leather",
        atkType: "Heavy", // 逻辑：龙气灌注后的碎石拳，追求极致的力量与破甲效果
        stats: { hp: 198, phy_atk: 52, mag_atk: 5, phy_def: 4, mag_def: 4, speed: 10 },
        money: [70, 140],
        drops: [{ id: "长满鳞片的手臂", rate: 0.1 }, { id: "抢来的碎银", rate: 0.4 }],
        skills: [
            { id: "碎石拳", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "伪龙爪击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "强行吸收气运导致半身鳞片化的强盗，力量暴增。"
    },
    {
        id: "global_minion_3_05", template: "minion", name: "泽地吸血蚊", region: "all", spawnType: "all", timeStart: 3,
        subType: "insect", defType: "none",
        atkType: "Agile", // 逻辑：13点高速度，极速叮咬，典型的高频低伤敏捷单位
        stats: { hp: 138, phy_atk: 57, mag_atk: 5, phy_def: 3, mag_def: 3, speed: 13 },
        money: [30, 60],
        drops: [{ id: "巨大的口器", rate: 0.3 }, { id: "透明翅膀", rate: 0.2 }],
        skills: [
            { id: "极速叮咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "麻痹毒素", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "体型如雀鸟的蚊虫，成群结队袭击生灵。"
    },

    // ==========================================
    // 2. 精英单位 (Elites)
    // ==========================================
    {
        id: "global_elite_3_01", template: "elite", name: "赤眉义军统领", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "leather",
        atkType: "Reach", // 逻辑：持长柄斩马刀，具有强大的阵地物理压制力和杀气
        stats: { hp: 495, phy_atk: 59, mag_atk: 10, phy_def: 22, mag_def: 18, speed: 12 },
        money: [150, 300],
        drops: [{ id: "统领的斩马刀", rate: 0.1 }, { id: "起义军令牌", rate: 0.5 }],
        skills: [
            { id: "力劈华山", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "王侯将相宁有种乎", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "草莽杀气", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "大泽乡起义中的猛将，在暴雨中顿悟了杀伐之道。"
    },
    {
        id: "global_elite_3_02", template: "elite", name: "覆海大蛟(幼体)", region: "all", spawnType: "all", timeStart: 3,
        subType: "beast", defType: "leather",
        atkType: "Balanced", // 逻辑：物法均衡(45/45)，蛟龙摆尾与水流冲击的混合输出
        stats: { hp: 594, phy_atk: 45, mag_atk: 45, phy_def: 16, mag_def: 16, speed: 12 },
        money: [200, 350],
        drops: [{ id: "未成形的龙角", rate: 0.1 }, { id: "蛟蛇之鳞", rate: 0.4 }],
        skills: [
            { id: "水流冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "蛟龙摆尾", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "水泽泥泞", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "即将化蛟的大蛇，头顶已生肉瘤。"
    },

    // ==========================================
    // 3. 领主与首领 (Boss & Lord)
    // ==========================================
    {
        id: "global_boss_3_01", template: "boss", name: "张楚先锋大将", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "heavy",
        atkType: "Reach", // 逻辑：持精钢长矛横扫千军，领主级的物理压制单位
        stats: { hp: 1188, phy_atk: 99, mag_atk: 10, phy_def: 35, mag_def: 21, speed: 15 },
        money: [500, 800],
        drops: [{ id: "起义军帅印", rate: 0.1 }, { id: "精钢长矛", rate: 0.1 }],
        skills: [
            { id: "怒斩秦吏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "横扫千军", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "王侯宁有种乎", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "草莽霸气", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "士气高涨", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "大泽乡起义的先锋官，承载天地逆乱大运。"
    },
    {
        id: "global_boss_3_05", template: "boss", name: "斩蛇碑灵", region: "all", spawnType: "all", timeStart: 3,
        subType: "elemental", defType: "plate",
        atkType: "Heavy", // 逻辑：岩石巨人，石剑挥击，具备碎裂城墙般的重型破甲能力
        stats: { hp: 1069, phy_atk: 118, mag_atk: 10, phy_def: 52, mag_def: 31, speed: 13 },
        money: [500, 800],
        drops: [{ id: "赤帝剑气(残)", rate: 0.1 }, { id: "灵性石材", rate: 0.4 }],
        skills: [
            { id: "石剑挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "镇压妖邪", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "赤帝斩蛇势", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "威压重力", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "石碑护体", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "受赤帝气运冲刷而通灵的石碑化身。"
    },
    {
        id: "global_lord_3_01", template: "lord", name: "张楚王·陈胜(龙化)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "heavy",
        atkType: "Relic", // 逻辑：半龙化身，逆乱龙吟与天命加身，降维打击凡人护甲
        stats: { hp: 2376, phy_atk: 97, mag_atk: 97, phy_def: 42, mag_def: 42, speed: 15 },
        money: [2000, 4000],
        drops: [{ id: "张楚王印", rate: 0.1 }, { id: "草莽龙气", rate: 0.5 }],
        skills: [
            { id: "鸿鹄之志", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "揭竿而起", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "逆乱龙爪", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "王侯宁有种乎·龙吟", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "气运压制", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "龙血沸腾", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "真龙护体(伪)", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "天命加身", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】起义领袖，强行承载‘逆乱之道’而半龙化，神智癫狂。"
    },
    {
        id: "global_lord_3_03", template: "lord", name: "大泽毒蛟皇", region: "all", spawnType: "all", timeStart: 3,
        subType: "dragon", defType: "plate",
        atkType: "Relic", // 逻辑：万毒噬界，剧毒领域，属于顶级的法术/毒素穿透压制
        stats: { hp: 3564, phy_atk: 116, mag_atk: 116, phy_def: 50, mag_def: 50, speed: 16 },
        money: [2500, 5000],
        drops: [{ id: "完整的蛟龙角", rate: 0.05 }, { id: "避水珠", rate: 0.5 }],
        skills: [
            { id: "剧毒水炮", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "蛟龙撕咬", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "翻江倒海", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "万毒噬界", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "剧毒领域", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "腐骨之毒", rate: 0.02, type: 2, debuffValue: 0.10, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "水幕天华", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "蛟龙变", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】大泽霸主，吐出的毒息能让百里水域化为死地。"
    },
    {
        id: "global_lord_3_04", template: "lord", name: "帝国上将·王离(修罗)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：兵家灭世杀阵，百战穿甲，堕入修罗道后的极致物理破甲
        stats: { hp: 2376, phy_atk: 139, mag_atk: 20, phy_def: 53, mag_def: 31, speed: 15 },
        money: [2200, 4500],
        drops: [{ id: "王家兵书", rate: 0.1 }, { id: "修罗煞气", rate: 0.4 }],
        skills: [
            { id: "百战穿甲", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "长城守望", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "修罗百斩", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "兵家·灭世杀阵", rate: 0.025, type: 1, damage: 5.8, damageType: "phy", dmgValType: 1 },
            { id: "杀意震慑", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "战栗凝视", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },
            { id: "修罗金身", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "愈战愈勇", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】王翦之孙，接纳战场煞气，化身修罗战争机器。"
    },
    {
        id: "global_lord_3_05", template: "lord", name: "赤帝子·刘邦(觉醒)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：斩蛇剑气，天命龙腾，赤帝血脉觉醒后的法术降维打击
        stats: { hp: 2376, phy_atk: 20, mag_atk: 139, phy_def: 31, mag_def: 53, speed: 15 },
        money: [2500, 5000],
        drops: [{ id: "赤霄剑(伪)", rate: 0.05 }, { id: "天子气运", rate: 0.3 }],
        skills: [
            { id: "赤帝火", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "大风歌", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "斩蛇剑气", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "天命·炎汉龙腾", rate: 0.025, type: 1, damage: 6.0, damageType: "mag", dmgValType: 1 },
            { id: "君威", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 },
            { id: "天罚", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "真龙天子", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "气运加持", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】赤帝血脉彻底觉醒，举手投足间皆有煌煌天威。"
    }

];
const enemies_4= [

    {
        id: "global_minion_4_01", template: "minion", name: "碎阵秦卒", region: "all", spawnType: "all", timeStart: 4,
        subType: "undead", defType: "heavy",
        atkType: "Reach", // 逻辑：秦军精锐黑甲卫，保留长戈突刺本能，具备阵地压制感
        stats: { hp: 327, phy_atk: 42, mag_atk: 5, phy_def: 11, mag_def: 8, speed: 8 },
        money: [60, 120],
        drops: [{ id: "破碎的长城砖", rate: 0.3 }, { id: "秦军黑甲残片", rate: 0.2 }],
        skills: [
            { id: "长戈突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "阵亡一击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "阵法被霸王吼碎后留下的杀戮躯壳。"
    },
    {
        id: "global_minion_4_02", template: "minion", name: "狂热楚军", region: "all", spawnType: "all", timeStart: 4,
        subType: "human", defType: "none",
        atkType: "Agile", // 逻辑：受到霸王战意感染，舍身换命，追求高频高爆发的物理输出
        stats: { hp: 234, phy_atk: 61, mag_atk: 5, phy_def: 5, mag_def: 5, speed: 10 },
        money: [70, 140],
        drops: [{ id: "破釜沉舟的碎片", rate: 0.3 }, { id: "楚军头巾", rate: 0.2 }],
        skills: [
            { id: "舍身斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "霸王战吼·仿", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "彻底陷入狂热，早已置生死于度外的楚军死士。"
    },
    {
        id: "global_minion_4_04", template: "minion", name: "战场煞灵", region: "all", spawnType: "all", timeStart: 4,
        subType: "elemental", defType: "none",
        atkType: "Relic", // 逻辑：杀气实质化，纯法术属性输出(56)，专克凡兵
        stats: { hp: 210, phy_atk: 5, mag_atk: 56, phy_def: 9, mag_def: 14, speed: 9 },
        money: [80, 160],
        drops: [{ id: "煞气结晶", rate: 0.3 }, { id: "残破的战旗", rate: 0.1 }],
        skills: [
            { id: "煞气冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "惊惧嚎叫", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "几十万大军厮杀产生的杀气凝聚而成的虚影。"
    },

    // ==========================================
    // 2. 精英单位 (Elites)
    // ==========================================
    {
        id: "global_elite_4_02", template: "elite", name: "破釜死士", region: "all", spawnType: "all", timeStart: 4,
        subType: "human", defType: "none",
        atkType: "Heavy", // 逻辑：以命换命的重劈，绝境爆发，追求单次毁灭性打击（ATK 91）
        stats: { hp: 585, phy_atk: 91, mag_atk: 5, phy_def: 13, mag_def: 13, speed: 12 },
        money: [180, 360],
        drops: [{ id: "无畏头巾", rate: 0.3 }, { id: "楚国烈酒", rate: 0.2 }],
        skills: [
            { id: "以命换命", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "绝境爆发", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "杀意波动", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "砸碎了锅釜，凿沉了舟船，没有任何退路的杀戮者。"
    },
    {
        id: "global_elite_4_05", template: "elite", name: "金人断臂", region: "all", spawnType: "all", timeStart: 4,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：极低速(6)，手指重压与残臂横扫，纯粹的重型物理压制
        stats: { hp: 877, phy_atk: 50, mag_atk: 10, phy_def: 47, mag_def: 40, speed: 6 },
        money: [300, 500],
        drops: [{ id: "未知的金属块", rate: 0.5 }, { id: "动力核心(残)", rate: 0.1 }],
        skills: [
            { id: "残臂横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "手指重压", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "金属共振", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "金人锁魂阵被破后的巨大残躯，仍盲目地攻击。"
    },

    // ==========================================
    // 3. 首领与至尊领主 (Boss & Lord)
    // ==========================================
    {
        id: "global_boss_4_01", template: "boss", name: "长城军团督军", region: "all", spawnType: "all", timeStart: 4,
        subType: "undead", defType: "plate",
        atkType: "Reach", // 逻辑：持长戈横扫，军魂冲锋，顶级阵地物理压制 Boss
        stats: { hp: 2751, phy_atk: 63, mag_atk: 20, phy_def: 65, mag_def: 50, speed: 12 },
        money: [600, 1000],
        drops: [{ id: "督军黑金铠", rate: 0.1 }, { id: "死战意志", rate: 0.3 }],
        skills: [
            { id: "长戈横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "盾牌猛击", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "军魂冲锋", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "破胆怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 },
            { id: "不动如山", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "灵魂死守战旗的指挥官，拥有铜墙铁壁般的防御。"
    },
    {
        id: "global_lord_4_01", template: "lord", name: "西楚霸王·项羽(鬼神)", region: "all", spawnType: "all", timeStart: 4,
        subType: "human", defType: "heavy",
        atkType: "Heavy", // 逻辑：213点物理攻击天花板，鬼神天崩地裂配合6.0倍率，绝对的重型破甲逻辑
        stats: { hp: 2808, phy_atk: 213, mag_atk: 20, phy_def: 31, mag_def: 31, speed: 15 },
        money: [3000, 6000],
        drops: [{ id: "霸王戟残片", rate: 0.05 }, { id: "鬼神之气", rate: 0.5 }],
        skills: [
            { id: "力拔山兮", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "横扫千军", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "霸王卸甲", rate: 0.05, type: 1, damage: 3.5, damageType: "phy", dmgValType: 1 },
            { id: "鬼神·天崩地裂", rate: 0.025, type: 1, damage: 6.0, damageType: "phy", dmgValType: 1 },
            { id: "霸气震慑", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },
            { id: "肝胆俱裂", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "气盖世", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },
            { id: "越战越勇", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】“羽之神勇，千古无二。” 凡人不可直视其锋芒。"
    },
    {
        id: "global_lord_4_02", template: "lord", name: "始皇金人·终焉", region: "all", spawnType: "all", timeStart: 4,
        subType: "mechanism", defType: "plate",
        atkType: "Heavy", // 逻辑：113物理抗性天花板，地壳粉碎，极低速高压的重型堡垒
        stats: { hp: 4212, phy_atk: 118, mag_atk: 20, phy_def: 113, mag_def: 90, speed: 7 },
        money: [2500, 5000],
        drops: [{ id: "终焉核心", rate: 0.05 }, { id: "万兵之精", rate: 0.5 }],
        skills: [
            { id: "歼灭光束", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "地壳粉碎", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "最终指令·世界重置", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "重力塌缩", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "辐射污染", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "绝对防御力场", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "纳米修复", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】始皇帝最终兵器，目的是清除视线内一切生命体。"
    },
    {
        id: "global_lord_4_03", template: "lord", name: "亚父·范增(谋圣)", region: "all", spawnType: "all", timeStart: 4,
        subType: "human", defType: "cloth",
        atkType: "Relic", // 逻辑：以天地为棋，天机星落，纯法术降维打击逻辑
        stats: { hp: 2808, phy_atk: 20, mag_atk: 164, phy_def: 37, mag_def: 62, speed: 15 },
        money: [2800, 5500],
        drops: [{ id: "锦囊妙计", rate: 0.1 }, { id: "天机盘", rate: 0.2 }],
        skills: [
            { id: "棋子·落", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "阴阳逆乱", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "十面埋伏", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "天机·星落", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "离间计", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 },
            { id: "忧愤成疾", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "运筹帷幄", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "奇门遁甲", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】以天地灵气为棋子，布局致命弱点的大术士。"
    },
    {
        id: "global_lord_4_04", template: "lord", name: "大秦国运·死兆龙", region: "all", spawnType: "all", timeStart: 4,
        subType: "dragon", defType: "plate",
        atkType: "Relic", // 逻辑：厄运吐息，二世而亡·天谴，帝国崩塌的具象化，顶级法系压制
        stats: { hp: 4212, phy_atk: 138, mag_atk: 138, phy_def: 60, mag_def: 60, speed: 16 },
        money: [3000, 6000],
        drops: [{ id: "死兆龙鳞", rate: 0.3 }, { id: "帝国余晖", rate: 0.5 }],
        skills: [
            { id: "厄运吐息", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "龙爪撕裂", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "国破家亡", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "二世而亡·天谴", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },
            { id: "气数已尽", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "衰败诅咒", rate: 0.02, type: 2, debuffValue: 0.10, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },
            { id: "回光返照", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "百足之虫", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】曾经辉煌的大秦金龙，帝国崩塌的具象化。"
    }
];

// 将所有区域数组合并为总数组
const rawEnemies = [
    ...enemies_all,
    ...enemies_r_c_1_1,
    ...enemies_r_c_2_1,
    ...enemies_r_e_0_1,
    ...enemies_r_c_1_2,
    ...enemies_r_c_0_2,
    ...enemies_r_ne,
    ...enemies_r_n,
    ...enemies_r_w,
    ...enemies_r_s,
    ...enemies_1,
    ...enemies_2,
    ...enemies_3,
    ...enemies_4
];

// 初始化函数：将模板属性应用到敌人数据上
function initEnemyData() {
    return rawEnemies.map(e => {
        const tmpl = ENEMY_TEMPLATES[e.template || "minion"];
        if (!tmpl) return e;

        // 深拷贝基础属性
        let finalStats = {...e.stats};
        // console.log(`${e.name} 原始stats`, finalStats);
        // 应用模板倍率
        finalStats.hp = Math.floor(finalStats.hp * tmpl.multipliers.hp);
        finalStats.atk = finalStats.atk?Math.floor(finalStats.atk * tmpl.multipliers.atk):0;
        finalStats.phy_atk=Math.floor(finalStats.phy_atk * tmpl.multipliers.atk);
        finalStats.mag_atk=Math.floor(finalStats.mag_atk * tmpl.multipliers.atk);
        finalStats.phy_def=Math.floor(finalStats.phy_def * tmpl.multipliers.def);
        finalStats.mag_def=Math.floor(finalStats.mag_def * tmpl.multipliers.def);
        finalStats.def =finalStats.def? Math.floor(finalStats.def * tmpl.multipliers.def):0;
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


        // console.log(`${e.name}`, e);
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

            money    : money,
            skills   : finalSkills, // <--- 使用修正后的技能列表
        };
    });
}

// 导出最终数据
const enemies = initEnemyData();
window.enemies = enemies; // 挂载到全局
console.log(enemies)

// 初始化目标数组
let enemies_all_drops = [];

// 确保 window.enemies 存在且是数组
if (window.enemies && Array.isArray(window.enemies)) {
    // 遍历所有怪物数据
    window.enemies.forEach(enemy => {
        // 检查怪物是否有 drops 字段
        if (enemy.drops && Array.isArray(enemy.drops)) {
            // 遍历当前怪物的每一个掉落项
            enemy.drops.forEach(drop => {
                // 将掉落物详情、怪物ID (eid) 和 怪物模板 (template) 组合成新对象
                enemies_all_drops.push({
                    ...drop,             // 复制原有的 id 和 rate
                    eid: enemy.id,       // 记录来源怪物的 ID
                    template: enemy.template, // 记录来源怪物的 阶级/模板
                    timeStart: enemy.timeStart
                });
            });
        }
    });
}
window.enemies_all_drops=enemies_all_drops;