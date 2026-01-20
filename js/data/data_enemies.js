
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
    // ==========================================
    // 1. 基础野兽
    // ==========================================
    // ==========================================
    // 1. 基础野兽 (重构版)
    // ==========================================
    {
        id: "global_001", template: "minion", name: "流浪野狗", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "none", // 无甲
        stats: { hp: 30, phy_atk: 6, mag_atk: 0, phy_def: 1, mag_def: 0, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_001", rate: 0.4 },
            { id: "materials_002", rate: 0.3 },
        ],
        skills: [
            // 低伤高频 (20%)
            { id: "撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // 高伤低频 (10%)
            { id: "疯狗扑击", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "乱世中随处可见的野狗，双眼发红，为了护食非常凶狠。"
    },
    {
        id: "global_002", template: "minion", name: "疯狂老鼠", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "none", // 无甲
        stats: { hp: 20, phy_atk: 4, mag_atk: 0, phy_def: 0, mag_def: 0, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_028", rate: 0.1 }
        ],
        skills: [
            // 低伤高频 (20%)
            { id: "门牙啃噬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // 高伤低频 (10%)
            { id: "弱点偷袭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "体型硕大的老鼠，为了抢一口吃的，连人都敢咬。"
    },
    {
        id: "global_003", template: "minion", name: "草丛毒蛇", region: "all", spawnType: "grass", timeStart: 0,
        subType: "insect",
        defType: "leather", // 鳞片视为皮甲
        stats: { hp: 25, phy_atk: 15, mag_atk: 5, phy_def: 2, mag_def: 1, speed: 12, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "materials_029", rate: 0.2 },
            { id: "materials_005", rate: 0.4 },
            { id: "materials_010", rate: 0.4 }
        ],
        skills: [
            // 低伤高频 (20%) - 毒牙视为物理穿刺
            { id: "毒牙突袭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // 高伤低频 (10%) - 毒液喷射视为法术伤害
            { id: "毒液喷射", rate: 0.1, type: 1, damage: 1.5, damageType: "mag", dmgValType: 1 }
        ],
        desc: "潜伏在草丛深处，攻击带有剧毒，咬一口可能致命。"
    },
    {
        id: "global_004", template: "minion", name: "山林灰狼", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "leather", // 毛皮
        stats: { hp: 60, phy_atk: 14, mag_atk: 0, phy_def: 4, mag_def: 2, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_007", rate: 0.5 },
            { id: "materials_008", rate: 0.4 },
            { id: "foodMaterial_053", rate: 0.6 }
        ],
        skills: [
            // 低伤高频 (20%)
            { id: "利爪挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // 高伤低频 (10%)
            { id: "锁喉", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "成群结队出没的掠食者，听到狼嚎时最好赶紧爬树。"
    },
    {
        id: "global_005", template: "minion", name: "暴躁野猪", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 皮糙肉厚视为重甲
        stats: { hp: 80, phy_atk: 18, mag_atk: 0, phy_def: 10, mag_def: 3, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_030", rate: 0.5 },
            { id: "materials_004", rate: 0.4 },
        ],
        skills: [
            // 低伤高频 (20%)
            { id: "獠牙挑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // 高伤低频 (10%)
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
        subType: "human",
        defType: "cloth", // 布衣
        stats: { hp: 40, phy_atk: 5, mag_atk: 0, phy_def: 1, mag_def: 1, speed: 4 },
        money: [0, 5],
        drops: [
            { id: "weapons_003", rate: 0.2 },
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "乱抓", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "绝望撕咬", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 抱大腿降速
            // debuffValType: 1 (百分比), debuffValue: 0.3 (降低30%速度)
            { id: "死缠烂打", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "衣衫褴褛，面黄肌瘦，为了活下去已经不顾一切。"
    },
    {
        id: "global_007", template: "minion", name: "疯癫乞丐", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "cloth",
        stats: { hp: 50, phy_atk: 9, mag_atk: 5, phy_def: 2, mag_def: 4, speed: 6 },
        money: [0, 10],
        drops: [
            { id: "weapons_069", rate: 0.4 },
            { id: "book_cultivation_r1_00_full", rate: 0.01 },
            { id: "book_cultivation_r1_01_full", rate: 0.01 },
            { id: "book_cultivation_r1_02_full", rate: 0.01 },
            { id: "book_cultivation_r1_03_full", rate: 0.01 },
            { id: "book_cultivation_r1_04_full", rate: 0.01 },
            { id: "book_cultivation_r1_05_full", rate: 0.01 },
            { id: "book_cultivation_r1_06_full", rate: 0.01 },
            { id: "book_cultivation_r1_07_full", rate: 0.01 },
            { id: "book_cultivation_r1_08_full", rate: 0.01 },
            { id: "book_cultivation_r1_09_full", rate: 0.01 },
            { id: "book_cultivation_r1_10_full", rate: 0.01 },
            { id: "book_cultivation_r1_11_full", rate: 0.01 }
        ],
        skills: [
            // [Type 1] 低伤
            { id: "打狗棍法(乱)", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤
            { id: "发疯猛击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff - 疯言疯语干扰精神，降低法术防御
            // debuffValType: 1 (百分比), debuffValue: 0.2 (降低20%法防)
            { id: "疯言疯语", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "神智不清的乞丐，嘴里念叨着无人能懂的疯话。"
    },
    {
        id: "global_008", template: "minion", name: "拦路蟊贼", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "leather", // 简易皮甲
        stats: { hp: 70, phy_atk: 13, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 6 },
        money: [5, 20],
        drops: [
            { id: "weapons_013", rate: 0.3 },
        ],
        skills: [
            // [Type 1]
            { id: "袖里藏刀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1]
            { id: "背刺", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff - 撒石灰眯眼，降低物理攻击
            // debuffValType: 1 (百分比), debuffValue: 0.25 (降低25%物攻)
            { id: "撒石灰", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "手里拿着生锈的刀，专门在官道旁打劫过路客。"
    },
    {
        id: "global_009", template: "minion", name: "秦军逃兵", region: "all", spawnType: "road", timeStart: 1,
        subType: "human",
        defType: "light", // 军用轻甲
        stats: { hp: 90, phy_atk: 18, mag_atk: 0, phy_def: 10, mag_def: 3, speed: 5 },
        money: [10, 40],
        drops: [
            { id: "weapons_037", rate: 0.2 },
            { id: "weapons_220", rate: 0.1 },
            { id: "book_body_r1_14_full", rate: 0.01 },
        ],
        skills: [
            // [Type 1]
            { id: "军体拳", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1]
            { id: "致命突刺", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff - 擒拿手，大幅限制行动
            // debuffValType: 1 (百分比), debuffValue: 0.4 (降低40%速度)
            { id: "擒拿手", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "受不了繁重徭役逃出来的士兵，依然保留着军中的杀人技。"
    },
    {
        id: "global_010", template: "elite", name: "强盗头子", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "heavy", // 抢来的重甲
        stats: { hp: 160, phy_atk: 28, mag_atk: 5, phy_def: 15, mag_def: 5, speed: 7 },
        money: [50, 120],
        drops: [
            { id: "weapons_013", rate: 0.2 },
            { id: "head_017", rate: 0.2 },
            { id: "pills_001", rate: 0.3 }
        ],
        skills: [
            // [Type 1]
            { id: "重脚踢", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1]
            { id: "开山斧法", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff - 怒吼震慑，降低物理防御
            // debuffValType: 1 (百分比), debuffValue: 0.3 (降低30%物防)
            { id: "匪首怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】纠集了一帮亡命之徒，占据山头称大王。"
    },
// ==========================================
    // 3. 特殊人类与江湖客
    // ==========================================
    {
        id: "global_011", template: "minion", name: "采药竞争者", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 采药人身穿布衣方便攀爬
        stats: { hp: 60, phy_atk: 8, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 9 },
        money: [20, 50],
        drops: [
            { id: "herbs_001", rate: 0.3 },
            { id: "weapons_010", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 普通挥砍
            { id: "挥舞药锄", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 致命一击
            { id: "飞镰割喉", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "同行是冤家，为了争夺一株灵草可能会拔刀相向。"
    },
    {
        id: "global_012", template: "elite", name: "通缉大盗", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "light", // 轻甲，身手矫健
        stats: { hp: 180, phy_atk: 35, mag_atk: 10, phy_def: 15, mag_def: 8, speed: 10 },
        money: [100, 200],
        drops: [
            { id: "weapons_013", rate: 0.1 },
            { id: "pills_001", rate: 0.2 },
            { id: "book_body_r1_03_full", rate: 0.01 },
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速连击
            { id: "袖剑连刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 爆发伤害
            { id: "绝命背刺", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 撒石灰致盲，降低物理攻击
            // debuffValType: 1 (百分比), debuffValue: 0.25 (降低25%物攻)
            { id: "撒石灰", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】官府悬赏百金的要犯，杀人不眨眼，身手了得。"
    },
    // ==========================================
// 3. 特殊人类与江湖客 (续)
// ==========================================
    {
        id: "global_013", template: "elite", name: "赏金猎人", region: "all", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "leather", // 猎人皮甲，兼顾防御与灵活
        stats: { hp: 150, phy_atk: 32, mag_atk: 5, phy_def: 12, mag_def: 8, speed: 11 },
        money: [50, 100],
        drops: [
            { id: "weapons_040", rate: 0.1 },
            { id: "weapons_025", rate: 0.2 },
            { id: "head_012", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速连射
            { id: "精准连射", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 蓄力一击
            { id: "穿心箭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 断筋箭，大幅降低移动速度
            // debuffValType: 1 (百分比), 降低 30% 速度
            { id: "断筋箭", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】拿人钱财替人消灾，把你当成了行走的赏金。"
    },
    {
        id: "global_014", template: "elite", name: "蒙面杀手", region: "all", spawnType: "road", timeStart: 1,
        subType: "human",
        defType: "cloth", // 夜行衣，追求极致速度
        stats: { hp: 140, phy_atk: 45, mag_atk: 10, phy_def: 6, mag_def: 6, speed: 16, toxicity: 20 },
        money: [80, 150],
        drops: [
            { id: "weapons_039", rate: 0.2 },
            { id: "pills_053", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 毒刃
            { id: "毒刃挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 必杀技
            { id: "瞬狱影杀", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 致盲烟雾，干扰视线降低攻击
            // debuffValType: 1 (百分比), 降低 25% 物攻
            { id: "致盲烟雾", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "【精英】不知受何人指使的刺客，招招直奔要害。"
    },
    {
        id: "global_015", template: "boss", name: "义军首领", region: "all", spawnType: "road", timeStart: 2,
        subType: "human",
        defType: "plate", // 全身板甲
        stats: { hp: 972, phy_atk: 81, mag_atk: 8, phy_def: 28, mag_def: 16, speed: 15 },
        money: [150, 400],
        drops: [
            { id: "weapons_036", rate: 0.1 },
            { id: "weapons_038", rate: 0.1 },
            { id: "materials_038", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速挥砍
            { id: "凶猛挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 蓄力重击
            { id: "力劈华山", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 终结技
            { id: "崩山裂地斩", rate: 0.05, type: 1, damage: 2.2, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 震慑怒吼
            { id: "震慑怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 振臂高呼
            { id: "振臂高呼", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【头目】打着起义旗号的枭雄，手下聚集了数千人马。"
    },

// ==========================================
// 4. 环境与超自然
// ==========================================
    {
        id: "global_016", template: "minion", name: "食腐秃鹫", region: "all", spawnType: "desert", timeStart: 0,
        subType: "beast",
        defType: "none", // 飞禽羽毛，无护甲
        stats: { hp: 40, phy_atk: 18, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 14 },
        money: [0, 0],
        drops: [
            { id: "materials_031", rate: 0.5 },
            { id: "foodMaterial_050", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速啄击
            { id: "凶狠啄击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 借势俯冲
            { id: "高空俯冲", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "盘旋在战场上空，专门啄食死尸的眼睛。"
    },
    {
        id: "global_017", template: "minion", name: "河中水鬼", region: "all", spawnType: "river", timeStart: 0,
        subType: "undead",
        defType: "none", // 灵体/腐肉，无常规护甲
        stats: { hp: 70, phy_atk: 18, mag_atk: 12, phy_def: 5, mag_def: 8, speed: 8 },
        money: [0, 5],
        drops: [
            { id: "materials_032", rate: 0.1 },
            { id: "weapons_015", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 物理抓挠
            { id: "惨白鬼爪", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 怨气爆发，法术伤害
            { id: "怨气冲击", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "溺死之人的怨气所化，会把路过岸边的人拖入水中。"
    },
    {
        id: "global_018", template: "elite", name: "吊睛白额虎", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "leather", // 猛兽毛皮，坚韧但灵活
        stats: { hp: 250, phy_atk: 50, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_020", rate: 0.5 },
            { id: "materials_021", rate: 0.5 },
            { id: "materials_022", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速挥爪
            { id: "虎爪撕扯", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 致命锁喉
            { id: "锁喉咬杀", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 虎啸山林，震慑敌人降低防御
            // debuffValType: 1 (百分比), 降低 20% 物防, 持续 3 回合
            { id: "百兽之王", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】山中霸主，体型巨大，寻常刀剑难伤分毫。"
    },
    {
        id: "global_019", template: "elite", name: "狂暴黑熊", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 厚实脂肪与皮毛，防御极高
        stats: { hp: 300, phy_atk: 45, mag_atk: 0, phy_def: 30, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_023", rate: 0.6 },
            { id: "materials_034", rate: 0.5 },
            { id: "foodMaterial_006", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 沉重拍击
            { id: "熊掌拍击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 泰山压顶
            { id: "野蛮冲撞", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 咆哮降低敌人攻击欲望
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "震慑咆哮", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】力大无穷的黑熊，人立起来有一丈高。"
    },
    {
        id: "global_020", template: "minion", name: "游荡尸傀", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        defType: "heavy", // 僵尸之躯，刀枪不入
        stats: { hp: 120, phy_atk: 15, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 3 },
        money: [0, 0],
        drops: [
            { id: "materials_035", rate: 0.3 },
            { id: "foodMaterial_002", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "尸爪抓挠", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "饿虎扑食", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "死而不僵的尸体，受到阴气侵蚀重新站了起来，不知疼痛。"
    },
    {
        id: "global_021", template: "minion", name: "拦路响马", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "leather", // 强盗皮甲
        stats: { hp: 140, phy_atk: 18, mag_atk: 0, phy_def: 12, mag_def: 5, speed: 5 },
        money: [5, 15],
        drops: [
            { id: "materials_001", rate: 0.2 },
            { id: "weapons_151", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "锈刀挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "跳劈", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "埋伏在官道两旁的强盗，手持锈刀，只求财不害命...通常来说。"
    },
    {
        id: "global_022", template: "minion", name: "野狗", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "none", // 无甲
        stats: { hp: 80, phy_atk: 12, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_010", rate: 0.4 },
            { id: "foodMaterial_005", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "狂吠突袭", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "饥肠辘辘的野狗，成群结队，眼神中透着凶光。"
    },
    {
        id: "global_023", template: "minion", name: "溃逃士卒", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "heavy", // 破损的制式铠甲，防御尚可
        stats: { hp: 130, phy_atk: 16, mag_atk: 0, phy_def: 15, mag_def: 5, speed: 4 },
        money: [2, 8],
        drops: [
            { id: "materials_022", rate: 0.15 },
            { id: "foods_054", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "长矛突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "困兽犹斗", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "从前线逃下来的士兵，盔甲歪斜，为了活命会攻击任何人。"
    },
    {
        id: "global_024", template: "minion", name: "云游假道", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "cloth", // 道袍
        stats: { hp: 110, phy_atk: 8, mag_atk: 12, phy_def: 8, mag_def: 10, speed: 6 },
        money: [10, 25],
        drops: [
            { id: "materials_051", rate: 0.3 },
            { id: "pills_001", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 扔东西
            { id: "飞掷令箭", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 劣质法术/火药
            { id: "掌心雷(火药)", rate: 0.1, type: 1, damage: 1.5, damageType: "mag", dmgValType: 1 }
        ],
        desc: "打着除魔卫道旗号招摇撞骗的道士，实际上只会些三脚猫功夫。"
    },
    {
        id: "global_025", template: "minion", name: "大黑熊", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 厚皮防高
        stats: { hp: 280, phy_atk: 25, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 2 },
        money: [0, 0],
        drops: [
            { id: "materials_012", rate: 0.1 },
            { id: "materials_013", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "熊掌", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "体型硕大的黑熊，皮糙肉厚，一巴掌能拍断树干。"
    },
    {
        id: "global_026", template: "minion", name: "竹叶青", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "leather", // 蛇鳞
        stats: { hp: 60, phy_atk: 22, mag_atk: 5, phy_def: 2, mag_def: 2, speed: 12 , toxicity: 40},
        money: [0, 0],
        drops: [
            { id: "materials_033", rate: 0.4 },
            { id: "materials_034", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "毒牙", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "迅猛一咬", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "翠绿色的毒蛇，潜伏在草丛中，攻击速度极快且带有剧毒。"
    },
    {
        id: "global_027", template: "minion", name: "采花蜂", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "cloth", // 华而不实的衣服
        stats: { hp: 100, phy_atk: 14, mag_atk: 8, phy_def: 5, mag_def: 5, speed: 9 },
        money: [5, 10],
        drops: [
            { id: "materials_052", rate: 0.2 },
            { id: "weapons_251", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 暗器
            { id: "袖中飞针", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 兵器重击
            { id: "铁扇点穴", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "江湖上的淫贼，轻功不错，擅长使用迷烟和暗器。"
    },
    {
        id: "global_028", template: "minion", name: "狂暴野猪", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 极厚的猪皮
        stats: { hp: 160, phy_atk: 18, mag_atk: 0, phy_def: 15, mag_def: 2, speed: 4 },
        money: [0, 0],
        drops: [
            { id: "materials_011", rate: 0.4 },
            { id: "foodMaterial_001", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "獠牙拱击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "野蛮冲撞", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "双眼通红的野猪，似乎受到了某种刺激，横冲直撞。"
    },

    // === timeStart: 1 (Night Only) ===
    {
        id: "global_029", template: "minion", name: "孤魂野鬼", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        defType: "none", // 灵体无实体护甲
        stats: { hp: 90, phy_atk: 5, mag_atk: 15, phy_def: 5, mag_def: 15, speed: 7 },
        money: [0, 0],
        drops: [
            { id: "materials_036", rate: 0.3 },
            { id: "materials_037", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 阴气伤害
            { id: "鬼爪侵蚀", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 吸取生命
            { id: "吸取阳气", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "死后无人收敛的怨气所化，夜间飘荡在荒野，吸食生人阳气。"
    },
    {
        id: "global_030", template: "minion", name: "夜行刺客", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        defType: "light", // 夜行衣
        stats: { hp: 110, phy_atk: 25, mag_atk: 5, phy_def: 8, mag_def: 5, speed: 10 },
        money: [20, 50],
        drops: [
            { id: "weapons_253", rate: 0.08 },
            { id: "pills_071", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "匕首划击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "封喉一击", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 }
        ],
        desc: "身穿夜行衣的杀手，专挑夜晚赶路的人下手，动作干净利落。"
    },
    {
        id: "global_elite_001", template: "elite", name: "独眼响马王", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "heavy", // 抢来的精良重甲
        stats: { hp: 320, phy_atk: 50, mag_atk: 5, phy_def: 25, mag_def: 10, speed: 6 },
        money: [50, 120],
        drops: [
            { id: "weapons_350", rate: 0.1 },
            { id: "materials_045", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 重刀横扫
            { id: "重刀挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 招牌绝技
            { id: "开山斩", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 独眼透着凶光，降低敌人防御
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 3 回合
            { id: "凶光毕露", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】曾也是绿林好汉，如今却变得残暴不仁，独眼透着凶光。"
    },
    {
        id: "global_elite_002", template: "elite", name: "嗜血狼王", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "leather", // 坚韧的狼王皮毛
        stats: { hp: 280, phy_atk: 45, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_015", rate: 0.3 },
            { id: "materials_016", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "迅猛撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 锁喉
            { id: "喉管突袭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 恐惧嚎叫，降低敌人攻击欲望
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "恐惧嚎叫", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】统领狼群的首领，体型比普通野狗大两倍，獠牙滴着鲜血。"
    },
    {
        id: "global_elite_003", template: "elite", name: "破戒武僧", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "heavy", // 铁布衫/横练功夫
        stats: { hp: 380, phy_atk: 40, mag_atk: 10, phy_def: 45, mag_def: 20, speed: 5 },
        money: [20, 60],
        drops: [
            { id: "book_body_r1_11_full", rate: 0.15 },
            { id: "materials_053", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 铁砂掌
            { id: "铁砂掌", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 金刚腿
            { id: "碎石脚", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 煞气震慑，大幅降低行动速度
            // debuffValType: 1 (百分比), 降低 30% 速度, 持续 3 回合
            { id: "煞气震慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】因偷学禁术被逐出师门的武僧，一身横练功夫刀枪不入。"
    },

    {
        id: "global_elite_004", template: "elite", name: "五彩斑斓蛛", region: "all", spawnType: "forest", timeStart: 0,
        subType: "beast",
        defType: "leather", // 坚硬的几丁质甲壳
        stats: { hp: 220, phy_atk: 45, mag_atk: 10, phy_def: 10, mag_def: 5, speed: 10, toxicity: 30 },
        money: [0, 0],
        drops: [
            { id: "materials_055", rate: 0.2 },
            { id: "materials_054", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 毒牙
            { id: "剧毒螯牙", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 注入消化液
            { id: "蚀骨毒液", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 腐蚀毒雾，降低防御
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 3 回合
            { id: "腐蚀毒雾", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】色彩艳丽的巨型蜘蛛，越是美丽的东西越致命。"
    },

    // === 5. 鬼魂 (Type 2: 削弱玩家攻击) ===
    {
        id: "global_elite_005", template: "elite", name: "红衣厉鬼", region: "all", spawnType: "graveyard", timeStart: 1,
        subType: "undead",
        defType: "none", // 灵体无实体，免疫物理护甲概念，但法抗高
        stats: { hp: 200, phy_atk: 5, mag_atk: 50, phy_def: 5, mag_def: 25, speed: 9 },
        money: [0, 0],
        drops: [
            { id: "materials_056", rate: 0.1 },
            { id: "materials_057", rate: 0.15 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 阴风
            { id: "阴风阵阵", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 精神尖啸
            { id: "夺命尖啸", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 怨气缠身，降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 2 回合
            { id: "怨气缠身", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "【精英】身着嫁衣上吊而亡的女子，怨气冲天，每夜都在寻找负心人。"
    },

    // === 6. 隐居剑客 (Type 1: 高爆发) ===
    {
        id: "global_elite_006", template: "elite", name: "走火入魔的剑客", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "light", // 剑客轻装
        stats: { hp: 300, phy_atk: 60, mag_atk: 0, phy_def: 15, mag_def: 5, speed: 12 },
        money: [80, 200],
        drops: [
            { id: "book_body_r2_17_full", rate: 0.1 },
            { id: "materials_058", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 乱剑
            { id: "癫狂乱舞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 疯魔一击
            { id: "疯魔剑", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 剑气压制，降低速度
            // debuffValType: 1 (百分比), 降低 30% 速度, 持续 2 回合
            { id: "混乱剑意", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "【精英】追求剑道极致而心智迷失的剑客，见人就杀，剑招凌厉却杂乱。"
    },

    // === 7. 野猪王 (Type 1: 冲撞伤害) ===
    {
        id: "global_elite_007", template: "elite", name: "铁皮野猪王", region: "all", spawnType: "forest", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 泥浆与松脂混合的铁甲
        stats: { hp: 450, phy_atk: 35, mag_atk: 0, phy_def: 35, mag_def: 10, speed: 4 },
        money: [0, 0],
        drops: [
            { id: "materials_004", rate: 0.4 },
            { id: "foodMaterial_051", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 獠牙挑
            { id: "巨牙挑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 全力冲撞
            { id: "野蛮冲撞", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 泥浆飞溅，干扰视线降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "泥浆飞溅", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】在泥浆和松脂中打滚多年的野猪，皮肤硬得像铁甲一样。"
    },

    // === 8. 杀手头目 (Type 2: 降低玩家速度/命中) ===
    {
        id: "global_elite_008", template: "elite", name: "血手堂分舵主", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        defType: "light", // 杀手轻甲
        stats: { hp: 260, phy_atk: 55, mag_atk: 5, phy_def: 15, mag_def: 10, speed: 13 },
        money: [100, 300],
        drops: [
            { id: "materials_059", rate: 0.5 },
            { id: "weapons_351", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 毒镖
            { id: "毒镖连射", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 杀招
            { id: "血手印", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 断筋，大幅降低速度
            // debuffValType: 1 (百分比), 降低 30% 速度
            { id: "断筋", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】知名杀手组织的地区负责人，手段阴狠，从不正面硬拼。"
    },

    // === 9. 僵尸将军 (数值怪重构) ===
    {
        id: "global_elite_009", template: "elite", name: "古墓铜甲尸", region: "all", spawnType: "tomb", timeStart: 1,
        subType: "undead",
        defType: "plate", // 刀枪不入的铜甲
        stats: { hp: 500, phy_atk: 45, mag_atk: 0, phy_def: 50, mag_def: 5, speed: 2 },
        money: [0, 0],
        drops: [
            { id: "pills_101", rate: 0.1 },
            { id: "body_181", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 僵硬横扫
            { id: "铜臂横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 势大力沉
            { id: "铜臂千钧", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 尸毒攻心，降低玩家攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻
            { id: "尸毒攻心", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】生前或许是位将军，死后尸体不腐，化为铜甲尸，力大无穷。"
    },

    // === 10. 异兽 (Type 3: 自身速度Buff/狂暴) ===
    {
        id: "global_elite_010", template: "elite", name: "火眼金猿", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "leather", // 坚韧的皮毛
        stats: { hp: 300, phy_atk: 50, mag_atk: 10, phy_def: 20, mag_def: 10, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_060", rate: 0.2 },
            { id: "foods_300", rate: 0.15 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "灵猿抓", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "投掷巨石", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 火眼金睛看穿破绽，降低防御
            // debuffValType: 1 (百分比), 降低 25% 物防
            { id: "火眼威慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "【精英】通了灵智的猿猴，双目赤红，动作敏捷，极难捕捉。"
    },

    // === 1. 墨家机关术风格 (Type 1: 物理重击) ===
    {
        id: "global_elite_011", template: "elite", name: "失控机关铜人", region: "all", spawnType: "ruins", timeStart: 0,
        subType: "mechanism",
        defType: "plate", // 青铜机甲
        stats: { hp: 450, phy_atk: 45, mag_atk: 0, phy_def: 45, mag_def: 5, speed: 3 },
        money: [0, 0],
        drops: [
            { id: "materials_061", rate: 0.3 },
            { id: "materials_062", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "机械臂挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "核心过载撞击", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 轰鸣震颤，干扰行动/瞄准
            // debuffValType: 1 (百分比), 降低 20% 物攻
            { id: "轰鸣震颤", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】墨家制造的守城机关人，因年久失修内部机括错乱，见人便砸。"
    },

    // === 2. 殉葬文化/鬼神 (Type 2: 恐惧/降攻) ===
    {
        id: "global_elite_012", template: "elite", name: "殉葬鬼卒", region: "all", spawnType: "tomb", timeStart: 1,
        subType: "undead",
        defType: "heavy", // 陪葬的青铜甲，年代久远但依旧坚硬
        stats: { hp: 300, phy_atk: 35, mag_atk: 10, phy_def: 25, mag_def: 5, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "materials_063", rate: 0.2 },
            { id: "weapons_152", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 锈矛
            { id: "锈矛突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 怨气重击
            { id: "怨魂穿刺", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 冥府凝视，降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "冥府凝视", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】被迫为王侯殉葬的士兵，怨气锁在青铜面具之下，千年不散。"
    },

    // === 3. 门客/游侠文化 (Type 3: 爆发/加攻) ===
    {
        id: "global_elite_013", template: "elite", name: "嗜酒门客", region: "all", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "light", // 浪人装束
        stats: { hp: 280, phy_atk: 55, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 12 }, // 速度较快
        money: [50, 150],
        drops: [
            { id: "item_bamboo_slip", rate: 0.1 },
            { id: "item_fine_wine", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 醉斩
            { id: "醉步撩剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 绝杀
            { id: "逍遥一剑", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 3] Buff (10%) - 醉剑式，大幅提升攻击
            // buffValType: 1 (百分比), 提升 30% 物攻, 持续 3 回合
            { id: "醉剑式", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "【精英】曾是权贵座下的三千食客之一，如今主家失势，流落江湖，剑术依然辛辣。"
    },

    // === 4. 方仙道/炼丹 (Type 2: 中毒/持续伤害预设) ===
    {
        id: "global_elite_014", template: "elite", name: "癫狂方士", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 道袍
        stats: { hp: 240, phy_atk: 10, mag_atk: 45, phy_def: 5, mag_def: 20, speed: 9 },
        money: [40, 90],
        drops: [
            { id: "materials_064", rate: 0.4 },
            { id: "materials_065", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 投掷丹药
            { id: "滚烫丹药", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 炸炉
            { id: "丹火爆发", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 丹炉毒烟，腐蚀防御
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 4 回合
            { id: "丹炉毒烟", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 }
        ],
        desc: "【精英】在大山深处寻求长生不老药的术士，因试药而精神错乱，周身散发着药石毒气。"
    },

    // === 5. 兵制/重弩 (Type 1: 穿透伤害) ===
    {
        id: "global_elite_015", template: "elite", name: "强弩校尉", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "light", // 射手皮甲/秦甲
        stats: { hp: 260, phy_atk: 60, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 7 },
        money: [60, 120],
        drops: [
            { id: "weapons_254", rate: 0.2 },
            { id: "materials_066", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 连射
            { id: "三连发", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 狙击
            { id: "透甲重箭", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 碎甲矢，降低防御
            // debuffValType: 1 (百分比), 降低 20% 物防, 持续 3 回合
            { id: "碎甲矢", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】擅长使用大黄弩的军官，能在百步之外射穿重甲。"
    },

    // === 6. 外族/戎狄 (Type 3: 狂暴) ===
    {
        id: "global_elite_016", template: "elite", name: "犬戎勇士", region: "all", spawnType: "wasteland", timeStart: 0,
        subType: "human",
        defType: "leather", // 粗糙但坚韧的兽皮
        stats: { hp: 350, phy_atk: 45, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 8 },
        money: [10, 40],
        drops: [
            { id: "weapons_352", rate: 0.1 },
            { id: "weapons_016", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 骨棒挥击
            { id: "骨棒挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 蛮力重砸
            { id: "蛮力重砸", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 蛮荒怒吼，震慑敌人
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "蛮荒怒吼", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】来自西方蛮荒之地的异族战士，披发左衽，力大无穷。"
    },

    // === 7. 巫蛊/楚地风格 (Type 2: 虚弱) ===
    {
        id: "global_elite_017", template: "elite", name: "云梦巫祝", region: "all", spawnType: "swamp", timeStart: 1,
        subType: "human",
        defType: "cloth", // 祭祀法袍
        stats: { hp: 200, phy_atk: 10, mag_atk: 55, phy_def: 5, mag_def: 25, speed: 11 },
        money: [20, 50],
        drops: [
            { id: "materials_067", rate: 0.2 },
            { id: "herbs_071", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 毒虫
            { id: "毒虫噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 巫蛊咒
            { id: "巫蛊咒杀", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 摄魂咒，削弱攻击
            // debuffValType: 1 (百分比), 降低 25% 物攻, 持续 2 回合
            { id: "摄魂咒", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 }
        ],
        desc: "【精英】信奉鬼神的神秘祭司，擅长驱使毒虫和诅咒，令人防不胜防。"
    },

    // === 8. 铸剑文化 (Type 1: 锋利) ===
    {
        id: "global_elite_018", template: "elite", name: "剑池守剑奴", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "heavy", // 长期在火炉旁工作的厚重防护
        stats: { hp: 320, phy_atk: 60, mag_atk: 0, phy_def: 35, mag_def: 15, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_068", rate: 0.3 },
            { id: "weapons_353", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 铁钳
            { id: "铁钳挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 祭剑
            { id: "祭剑一击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 剑势压人，降低防御
            // debuffValType: 1 (百分比), 降低 20% 物防, 持续 3 回合
            { id: "剑势压人", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】世世代代守护铸剑池的哑奴，为了保护名剑胚胎可以牺牲性命。"
    },

    // === 9. 礼乐崩坏 (Type 2: 混乱/降速) ===
    {
        id: "global_elite_019", template: "elite", name: "失势贵族", region: "all", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "light", // 华丽但防御一般的贵族服饰
        stats: { hp: 250, phy_atk: 40, mag_atk: 10, phy_def: 15, mag_def: 10, speed: 9 },
        money: [100, 300],
        drops: [
            { id: "materials_069", rate: 0.4 },
            { id: "weapons_354", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 仪仗剑
            { id: "仪仗剑刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 恼羞成怒
            { id: "愤怒突刺", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 王霸之气，让人行动迟缓
            // debuffValType: 1 (百分比), 降低 30% 速度, 持续 3 回合
            { id: "王霸之气", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】旧时代的世卿世禄者，虽然家族没落，但仍摆着贵族的架子，极其傲慢。"
    },

    // === 10. 山海经风格 (0 Skills - 纯数值) ===
    {
        id: "global_elite_020", template: "elite", name: "巴蛇幼崽", region: "all", spawnType: "swamp", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 厚实的蛇鳞
        stats: { hp: 400, phy_atk: 50, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "materials_070", rate: 0.3 },
            { id: "foodMaterial_052", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 扫尾
            { id: "巨尾横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 吞噬
            { id: "吞噬撕咬", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 死亡缠绕，大幅降低速度
            // debuffValType: 1 (百分比), 降低 40% 速度, 持续 3 回合
            { id: "死亡缠绕", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】传说中能吞象的巨蛇后裔，虽然还未成年，但体型已如水桶般粗细。"
    },
    // === 1. 兵家杀神 (高攻高血) ===
    // === 1. 亡灵将军 (高攻/Debuff) ===
    {
        id: "global_boss_001", template: "boss", name: "百战人屠", region: "all", spawnType: "battlefield", timeStart: 0,
        subType: "undead", // 修正为亡灵，更符合“行尸走肉”且更肉
        defType: "plate", // 将军战甲
        stats: { hp: 756, phy_atk: 40, mag_atk: 4, phy_def: 17, mag_def: 10, speed: 12 },
        money: [200, 400],
        drops: [
            { id: "weapons_450", rate: 0.1 },
            { id: "book_body_r3_20_full", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 普攻加强
            { id: "横扫千军", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 强力战技
            { id: "血战八方", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 处决技
            { id: "人屠降世", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 削弱防御
            { id: "杀气震慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 提升攻击
            { id: "背水一战", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】曾坑杀二十万降卒的疯魔将军，如今已沦为只知杀戮的行尸走肉。"
    },

    // === 2. 墨家巨型机关 (高防) ===
    {
        id: "global_boss_002", template: "boss", name: "非攻·巨灵神", region: "all", spawnType: "ruins", timeStart: 0,
        subType: "mechanism", // 机关生物
        defType: "plate", // 墨家机关铜壁
        stats: { hp: 810, phy_atk: 32, mag_atk: 10, phy_def: 29, mag_def: 25, speed: 7 },
        money: [200, 400],
        drops: [
            { id: "materials_071", rate: 0.1 },
            { id: "materials_072", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 机械臂
            { id: "巨臂挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 压顶 (倍率较高，弥补面板攻击低)
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 攻城模式
            { id: "巨灵破城击", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 重力场
            { id: "机关重压", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 5 },

            // [Type 3] Buff (10%) - 铁壁模式 (防御极致化)
            { id: "墨守成规", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 5 }
        ],
        desc: "【BOSS】墨家先贤留下的战争兵器，原本用于守城，如今无人操控，自动攻击一切活物。"
    },

    // === 3. 山海经异兽 (Debuff/控制) ===
    {
        id: "global_boss_003", template: "boss", name: "独角夔牛", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 神兽皮毛
        stats: { hp: 648, phy_atk: 30, mag_atk: 50, phy_def: 12, mag_def: 17, speed: 15 },
        money: [200, 400],
        drops: [
            { id: "materials_073", rate: 0.1 },
            { id: "materials_074", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 雷光
            { id: "雷光弹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 召雷
            { id: "雷霆万钧", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 灭世雷
            { id: "苍雷灭世", rate: 0.05, type: 1, damage: 2.3, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 震魂吼
            { id: "震魂吼", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },

            // [Type 3] Buff (10%) - 风雷之势
            { id: "呼风唤雨", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】状如牛，苍身而无角，一足，出入水则必有风雨，其光如日月，其声如雷。"
    },

// === 4. 阴阳家方士 (毒/法术) ===
    {
        id: "global_boss_004", template: "boss", name: "长生丹魔", region: "all", spawnType: "cave", timeStart: 0,
        subType: "undead", // 半人半鬼，修正为亡灵以获得高血量
        defType: "cloth", // 沾满药渣的道袍
        stats: { hp: 756, phy_atk: 4, mag_atk: 41, phy_def: 11, mag_def: 18, speed: 12, toxicity: 50 },
        money: [200, 400],
        drops: [
            { id: "pills_102", rate: 0.2 },
            { id: "weapons_355", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 阴火
            { id: "阴火灼烧", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 丹火
            { id: "丹火焚心", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 炸炉
            { id: "鼎毁人亡", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 五石散毒
            { id: "五石散毒", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 5 },

            // [Type 3] Buff (10%) - 药力过载
            { id: "药力过载", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 3 }
        ],
        desc: "【BOSS】为了炼制不死药而用活人试毒的邪恶方士，自己也因药物反噬变得半人半鬼。"
    },

    // === 5. 顶级刺客 (高攻/高爆) ===
    {
        id: "global_boss_005", template: "boss", name: "鱼肠剑主", region: "all", spawnType: "city", timeStart: 1,
        subType: "human",
        defType: "light", // 贴身软甲
        stats: { hp: 756, phy_atk: 81, mag_atk: 12, phy_def: 11, mag_def: 11, speed: 15 }, // 极高攻速，身板极脆
        money: [200, 400],
        drops: [
            { id: "weapons_551", rate: 0.05 },
            { id: "book_body_r4_20_upper", rate: 0.1 },
            { id: "book_body_r4_20_middle", rate: 0.1 },
            { id: "book_body_r4_20_lower", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 瞬步
            { id: "如影随形", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 爆发
            { id: "图穷匕见", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 绝杀 (倍率极高，配合81面板秒人)
            { id: "鱼肠绝刺", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 杀气锁定
            { id: "杀气锁定", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },

            // [Type 3] Buff (10%) - 刺客之心
            { id: "勇绝之心", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "【BOSS】专诸之后的刺客宗师，继承了勇绝之剑，十步杀一人，千里不留行。"
    },

    // === 6. 鬼道/巫术 (Debuff) ===
    {
        id: "global_boss_006", template: "boss", name: "九凤鬼母", region: "all", spawnType: "swamp", timeStart: 1,
        subType: "undead",
        defType: "none", // 灵体
        stats: { hp: 1058, phy_atk: 5, mag_atk: 56, phy_def: 14, mag_def: 24, speed: 12 },
        money: [200, 400],
        drops: [
            { id: "materials_075", rate: 0.15 },
            { id: "materials_076", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 啄食
            { id: "九首连噬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 尖啸
            { id: "摄魂魔音", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 索命
            { id: "万魂索命", rate: 0.05, type: 1, damage: 2.4, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 鬼车夜哭
            { id: "鬼车夜哭", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 百鬼夜行
            { id: "百鬼夜行", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【BOSS】传说中的九头鸟化身，专门在夜间收割灵魂，叫声能让人神魂颠倒。"
    },

// === 7. 戎狄蛮王 (Buff/狂暴) ===
    {
        id: "global_boss_007", template: "boss", name: "北地狼主", region: "all", spawnType: "wasteland", timeStart: 0,
        subType: "beast", // 修正为野兽/蛮族，体现“怪力”
        defType: "heavy", // 兽面连环甲
        stats: { hp: 648, phy_atk: 49, mag_atk: 4, phy_def: 14, mag_def: 8, speed: 15 },
        money: [200, 400],
        drops: [
            { id: "body_182", rate: 0.1 },
            { id: "weapons_451", rate: 0.15 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 弯刀
            { id: "弯刀连斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 吞月
            { id: "贪狼吞月", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 旋风斩终结
            { id: "死亡旋风", rate: 0.05, type: 1, damage: 2.4, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 狼王咆哮
            { id: "狼王咆哮", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },

            // [Type 3] Buff (10%) - 嗜血狂化
            { id: "嗜血狂化", rate: 0.1, type: 3, buffValue: 0.35, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】统领北方草原的霸主，信奉弱肉强食，拥有生撕虎豹的怪力。"
    },

    // === 8. 剑道宗师 (Buff/Dmg) ===
    {
        id: "global_boss_008", template: "boss", name: "洗剑池主", region: "all", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "light", // 一袭白衣，几乎无防
        stats: { hp: 540, phy_atk: 58, mag_atk: 9, phy_def: 8, mag_def: 8, speed: 18 }, // 极快，高攻，脆皮
        money: [200, 400],
        drops: [
            { id: "weapons_552", rate: 0.05 },
            { id: "book_body_r5_20_upper", rate: 0.1 },
            { id: "book_body_r5_20_middle", rate: 0.1 },
            { id: "book_body_r5_20_lower", rate: 0.1 },
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 剑气
            { id: "流云剑气", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 万剑
            { id: "万剑归宗", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 绝杀 (2.6倍率配合58面板，伤害恐怖)
            { id: "池底寒芒", rate: 0.05, type: 1, damage: 2.6, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 剑意封穴
            { id: "剑意封穴", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },

            // [Type 3] Buff (10%) - 人剑合一
            { id: "人剑合一", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【BOSS】隐居在洗剑池畔的老人，据说曾指点过天下数位名将剑术，早已达到手中无剑的境界。"
    },

    // === 9. 旱魃 (AOE/Debuff) ===
    {
        id: "global_boss_009", template: "boss", name: "赤地旱魃", region: "all", spawnType: "desert", timeStart: 0,
        subType: "undead",
        defType: "plate", // 不化骨，刀枪不入
        stats: { hp: 756, phy_atk: 20, mag_atk: 45, phy_def: 25, mag_def: 14, speed: 10 },
        money: [200, 400],
        drops: [
            { id: "materials_077", rate: 0.2 },
            { id: "materials_078", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 热浪
            { id: "热浪侵袭", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 赤地
            { id: "赤地千里", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 焚天
            { id: "焚天尸火", rate: 0.05, type: 1, damage: 2.3, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 热浪销骨
            { id: "热浪销骨", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 旱魃之躯 (防上加防)
            { id: "旱魃之躯", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 5 }
        ],
        desc: "【BOSS】引起大旱的僵尸之祖，所过之处滴水不存，浑身散发着令人窒息的高温。"
    },

// === 10. 绿林总盟主 (综合) ===
    {
        id: "global_boss_010", template: "boss", name: "盗跖残魂", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        defType: "light", // 传奇轻甲
        stats: { hp: 756, phy_atk: 63, mag_atk: 6, phy_def: 22, mag_def: 13, speed: 18 }, // 特殊提速至18
        money: [200, 400],
        drops: [
            { id: "weapons_553", rate: 0.05 },
            { id: "weapons_554", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 偷袭
            { id: "探囊取物", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 双锋
            { id: "双锋错杀", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 绝杀
            { id: "神行绝杀", rate: 0.05, type: 1, damage: 2.4, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 卸甲手段
            { id: "卸甲手段", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 疾风幻影
            { id: "疾风幻影", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【BOSS】上古大盗的意志化身，从者九千，横行天下，诸侯若是惹了他也不得安宁。"
    },
    // === 1. 墨家机关系 ===
    // === 1. 墨家巨型机关 (高防) ===
    {
        id: "global_lord_mech_01", template: "lord", name: "暴走机关·非攻", region: "all", spawnType: "all", timeStart: 0,
        subType: "mechanism", // 修正为 mechanism
        defType: "plate", // 墨家机关，极高物防
        stats: { hp: 1620, phy_atk: 45, mag_atk: 45, phy_def: 43, mag_def: 37, speed: 7 }, // 血量1620，高防
        money: [200, 500],
        drops: [
            { id: "materials_079", rate: 0.1 },
            { id: "book_body_r5_21_upper", rate: 0.05 },
            { id: "book_body_r5_21_middle", rate: 0.05 },
            { id: "book_body_r5_21_lower", rate: 0.05 },
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 巨木撞击
            { id: "巨木撞击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 千机连弩
            { id: "千机连弩", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 攻城模式 (配合45攻 -> ~126伤)
            { id: "破城重锤", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 毁灭大招 (配合45攻 -> ~202伤，秒杀级)
            { id: "非攻·毁灭模式", rate: 0.025, type: 1, damage: 4.5, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 兼爱力场
            { id: "兼爱力场", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 高温蒸汽 (HP Burn)
            { id: "高温蒸汽", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 墨守成规
            { id: "墨守成规", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 机关自修 (HP Regen)
            { id: "机关自修", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】墨家制造的守城机关兽，因核心损坏而失去了敌我识别能力，在世间游荡。"
    },

// === 3. 纵横家/策士系 ===
    {
        id: "global_lord_strategist_01", template: "lord", name: "鬼谷游士", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "cloth", // 法袍
        stats: { hp: 1080, phy_atk: 6, mag_atk: 63, phy_def: 14, mag_def: 24, speed: 15 }, // 高攻低防，典型的玻璃大炮
        money: [200, 500],
        drops: [
            { id: "book_inner_r6_10_upper", rate: 0.05 },
            { id: "book_inner_r6_10_middle", rate: 0.05 },
            { id: "book_inner_r6_10_lower", rate: 0.05 },
            { id: "weapons_555", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 捭阖
            { id: "捭阖之术", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 纵横
            { id: "合纵连横", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 天谴 (63 * 2.8 ≈ 176 伤害)
            { id: "鬼谷神算·天谴", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 终局 (63 * 4.5 ≈ 283 伤害，秒杀技)
            { id: "天地为棋", rate: 0.025, type: 1, damage: 4.5, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 飞钳破溃
            { id: "飞钳破溃", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 心魔侵蚀 (HP DoT)
            { id: "心魔侵蚀", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 转丸
            { id: "转丸", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 吐纳养生 (HP Regen)
            { id: "吐纳养生", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】精通纵横之术的神秘策士，游走列国之间，一言可兴邦，一言可丧邦。"
    },

// === 4. 阴阳家/神话系 ===
    {
        id: "global_lord_yinyang_01", template: "lord", name: "东皇太一祭司", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "cloth", // 华丽法袍
        stats: { hp: 1080, phy_atk: 6, mag_atk: 63, phy_def: 14, mag_def: 24, speed: 15 },
        money: [400, 500],
        drops: [
            { id: "head_121", rate: 0.05 },
            { id: "book_inner_r6_11_upper", rate: 0.05 },
            { id: "book_inner_r6_11_middle", rate: 0.05 },
            { id: "book_inner_r6_11_lower", rate: 0.05 },
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 云中君
            { id: "云中君", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 东君
            { id: "东君降世", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 天罚
            { id: "天罚·陨星", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 混沌 (63 * 5.0 = 315伤，绝对秒杀机制)
            { id: "太一·混沌初开", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 大司命印
            { id: "大司命印", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 少司命·寿夭 (HP Burn)
            { id: "少司命·寿夭", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 吉日兮辰良
            { id: "吉日兮辰良", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },

            // [Type 3] 魂兮归来 (HP Regen)
            { id: "魂兮归来", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】信奉至高神东皇太一的狂热祭司，身穿华丽的法袍，脸上戴着黄金面具。"
    },

// === 5. 铸剑师/工匠系 ===
    {
        id: "global_lord_smith_01", template: "lord", name: "欧冶子残魂", region: "all", spawnType: "all", timeStart: 0,
        subType: "undead",
        defType: "plate", // 灵体化的玄铁甲
        stats: { hp: 1512, phy_atk: 50, mag_atk: 17, phy_def: 36, mag_def: 26, speed: 12 },
        money: [200, 500],
        drops: [
            { id: "materials_080", rate: 0.1 },
            { id: "materials_081", rate: 0.2 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 淬火
            { id: "淬火重击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 锻打
            { id: "锻打千锤", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 剑啸 (50 * 2.8 = 140伤)
            { id: "剑啸龙吟", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 血祭 (50 * 4.8 = 240伤，斩杀线)
            { id: "神兵出世·血祭", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 震荡打击
            { id: "震荡打击", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 熔炉烈焰 (HP Burn)
            { id: "熔炉烈焰", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 剑气护体
            { id: "剑气护体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 器魂重铸 (HP Regen)
            { id: "器魂重铸", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】铸剑大师死后执念不散，徘徊在寻找稀世矿石的道路上，将过路人视为试剑石。"
    },

// === 6. 游牧/蛮族系 ===
    {
        id: "global_lord_nomad_01", template: "lord", name: "林胡射雕手", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "leather", // 胡服骑装，轻便
        stats: { hp: 1080, phy_atk: 81, mag_atk: 12, phy_def: 12, mag_def: 12, speed: 25 }, // 极速，高攻，脆皮
        money: [200, 500],
        drops: [
            { id: "weapons_452", rate: 0.05 },
            { id: "materials_081", rate: 0.15 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 连珠箭
            { id: "连珠箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 贯日
            { id: "贯日长虹", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 射雕 (81 * 2.8 = 226伤)
            { id: "射雕神技", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 天狼 (81 * 4.5 = 364伤，光速秒杀)
            { id: "天狼噬日箭", rate: 0.025, type: 1, damage: 4.5, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 鸣镝警示
            { id: "鸣镝警示", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 毒箭创伤 (HP Burn)
            { id: "毒箭创伤", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 胡服骑射
            { id: "胡服骑射", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 草原狼性 (常规Buff，不涉及hp)
            { id: "草原狼性", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】来自北方森林的胡人神射手，箭术超群，据说曾一箭射下双雕。"
    },

// === 7. 刑徒/法家系 ===
    {
        id: "global_lord_convict_01", template: "lord", name: "骊山逃役刑徒", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "heavy", // 粗糙的皮肉和铁镣
        stats: { hp: 1080, phy_atk: 63, mag_atk: 6, phy_def: 33, mag_def: 14, speed: 10 }, // 高攻高防，低速低法抗
        money: [200, 500],
        drops: [
            { id: "weapons_453", rate: 0.1 },
            { id: "foods_123", rate: 0.3 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 铁镣
            { id: "铁镣重击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 暴乱
            { id: "暴乱狂击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 骊山怒 (63 * 2.8 = 176伤)
            { id: "骊山之怒", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 同归于尽 (63 * 4.8 = 302伤，恐怖斩杀)
            { id: "同归于尽", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 绝望怒吼
            { id: "绝望怒吼", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 重枷压制 (减速)
            { id: "重枷压制", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 困兽之斗
            { id: "困兽之斗", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },

            // [Type 3] 求生本能 (HP Regen)
            { id: "求生本能", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】从大型陵墓工地上逃出来的亡命之徒，手脚还带着铁镣，力大无穷且极其凶残。"
    },

// === 8. 巫蛊/南蛮系 ===
    {
        id: "global_lord_witch_01", template: "lord", name: "百越蛇母", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "cloth", // 祭祀服饰
        stats: { hp: 1080, phy_atk: 6, mag_atk: 63, phy_def: 14, mag_def: 24, speed: 15, toxicity: 60 }, // 高法伤，高毒性
        money: [200, 500],
        drops: [
            { id: "materials_082", rate: 0.2 },
            { id: "head_122", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 万蛇
            { id: "万蛇噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 金蚕
            { id: "金蚕蛊噬", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 降临
            { id: "巫神降临·毒域", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 图腾 (63 * 4.8 = 302伤，团灭技)
            { id: "古腾·万灵枯萎", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 神经毒雾
            { id: "神经毒雾", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 蛊毒攻心 (HP Burn)
            { id: "蛊毒攻心", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 巫祝狂热
            { id: "巫祝狂热", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },

            // [Type 3] 蜕皮重生 (HP Regen)
            { id: "蜕皮重生", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】南方百越之地的部落首领，善养毒蛇，常以生灵祭祀图腾。"
    },

// === 9. 山海异兽系 ===
    {
        id: "global_lord_beast_01", template: "lord", name: "蛊雕(幼兽)", region: "all", spawnType: "all", timeStart: 0,
        subType: "beast",
        defType: "leather", // 坚韧的异兽皮
        stats: { hp: 1296, phy_atk: 72, mag_atk: 14, phy_def: 19, mag_def: 22, speed: 18 }, // 高血高攻，皮毛防御一般
        money: [200, 500],
        drops: [
            { id: "materials_083", rate: 0.1 },
            { id: "materials_084", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 扑杀
            { id: "高空扑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 撕裂
            { id: "利爪撕裂", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 荒兽怒 (72 * 2.8 = 201伤)
            { id: "鹿吴山·荒兽之怒", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 捕食 (72 * 4.8 = 345伤，绝对秒杀)
            { id: "凶兽·吞天食地", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 婴儿啼哭
            { id: "婴儿啼哭", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 动脉出血 (HP Burn)
            { id: "动脉出血", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 食人本性
            { id: "食人本性", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },

            // [Type 3] 御风而行 (常规Buff)
            { id: "御风而行", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】似鸟非鸟，似豹非豹，叫声像婴儿啼哭的食人异兽，出自《山海经》。"
    },

// === 10. 名士/食客系 ===
    {
        id: "global_lord_guest_01", template: "lord", name: "信陵君门客(狂)", region: "all", spawnType: "all", timeStart: 0,
        subType: "human",
        defType: "light", // 浪人轻衣，追求极致速度
        stats: { hp: 1080, phy_atk: 82, mag_atk: 12, phy_def: 12, mag_def: 12, speed: 28 }, // 极高攻速，纸糊防御
        money: [200, 500],
        drops: [
            { id: "weapons_556", rate: 0.1 },
            { id: "item_pawn_ticket", rate: 0.2 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 长铗弹歌
            { id: "长铗弹歌", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 击筑
            { id: "击筑悲歌", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 死士 (82 * 2.8 = 230伤)
            { id: "士为知己死", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 三千客 (82 * 4.8 = 393伤，满血秒杀技)
            { id: "门客三千·剑阵", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 鸡鸣狗盗
            { id: "鸡鸣狗盗", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 剑气透体 (HP Burn)
            { id: "剑气透体", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 窃符救赵 (提速，让他更快)
            { id: "窃符救赵", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 醇酒消愁 (HP Regen)
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
        subType: "human",
        defType: "heavy", // 秦军制式铠甲
        stats: { hp: 100, phy_atk: 15, mag_atk: 0, phy_def: 10, mag_def: 3, speed: 5 },
        money: [10, 30],
        drops: [
            { id: "weapons_023", rate: 0.2 },
            { id: "weapons_024", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 制式长矛攻击
            { id: "长矛突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 蓄力重击
            { id: "破敌重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "驻守咸阳各门的士兵，盘查过往行人，神情严肃。"
    },
    {
        id: "rc11_002", template: "elite", name: "金吾卫巡逻队", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "heavy", // 京城禁卫，装备精良的重甲
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 20, mag_def: 5, speed: 7 },
        money: [30, 80],
        drops: [
            { id: "weapons_037", rate: 0.15 },
            { id: "book_body_r1_16_full", rate: 0.01 },
            { id: "book_body_r1_16_full", rate: 0.01 },
            { id: "book_body_r1_16_full", rate: 0.01 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 长戈攻击
            { id: "长戈穿刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 阵法合击
            { id: "合围绞杀", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 禁行喝止，大幅降低速度
            // debuffValType: 1 (百分比), 降低 30% 速度, 持续 3 回合
            { id: "禁行喝止", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】负责京城治安的精锐部队，披坚执锐，昼夜巡逻。"
    },
    {
        id: "rc11_003", template: "elite", name: "大秦锐士", region: "r_c_1_1", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "light", // 锐士追求杀伐效率，多穿札甲
        stats: { hp: 200, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 5, speed: 8 },
        money: [50, 100],
        drops: [
            { id: "weapons_038", rate: 0.1 },
            { id: "head_011", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 阔剑砍杀
            { id: "阔剑重劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 致命一击
            { id: "横扫六合", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 杀气震慑，降低敌人防御
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 2 回合
            { id: "杀气震慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "【精英】秦军中最精锐的战士，曾横扫六国，战功赫赫。"
    },

    // ==========================================
    // 2. 骊山与皇陵 (苦役与机关)
    // ==========================================
    {
        id: "rc11_004", template: "minion", name: "骊山刑徒", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 衣不蔽体，几乎无防御
        stats: { hp: 60, phy_atk: 12, mag_atk: 0, phy_def: 2, mag_def: 0, speed: 5 },
        money: [0, 5],
        drops: [
            { id: "weapons_020", rate: 0.3 },      // 矿镐
            { id: "weapons_010", rate: 0.3 },      // 锄头
            { id: "materials_036", rate: 0.1 }     // 麻绳
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 工具攻击
            { id: "挥舞矿镐", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 拼死一搏
            { id: "绝望重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "修筑皇陵的七十万刑徒之一，衣不蔽体，眼神麻木。"
    },
    {
        id: "rc11_005", template: "elite", name: "监工酷吏", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather", // 监工皮甲
        stats: { hp: 120, phy_atk: 25, mag_atk: 0, phy_def: 8, mag_def: 5, speed: 6 },
        money: [20, 60],
        drops: [
            { id: "weapons_027", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 抽打
            { id: "无情抽打", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 痛击
            { id: "透骨一击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 残酷鞭挞，皮开肉绽降低防御
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 3 回合
            { id: "残酷鞭挞", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】手持皮鞭，以折磨刑徒为乐，心狠手辣。"
    },
    {
        id: "rc11_006", template: "elite", name: "机关铜人(残)", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "mechanism", // 统一机关类怪物类型
        defType: "plate", // 青铜外壳，极硬
        stats: { hp: 250, phy_atk: 30, mag_atk: 0, phy_def: 45, mag_def: 10, speed: 3 },
        money: [0, 0],
        drops: [
            { id: "weapons_018", rate: 0.2 },
            { id: "materials_037", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 机械臂
            { id: "生锈铁臂", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 重锤
            { id: "千钧重锤", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 齿轮噪音，干扰心神降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "齿轮噪音", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】墨家或公输家制造的守陵机关，虽然破损但依然坚硬。"
    },
    {
        id: "rc11_007", template: "boss", name: "守陵尸将", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "undead",
        defType: "plate", // 古旧的将军山文甲
        stats: { hp: 756, phy_atk: 44, mag_atk: 12, phy_def: 26, mag_def: 14, speed: 10 },
        money: [100, 200],
        drops: [
            { id: "weapons_090", rate: 0.01 }, // 大秦定秦剑
            { id: "materials_038", rate: 0.2 }, // 将军枯骨
            { id: "pills_071", rate: 0.3 }      // 镇尸丹
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 普通横扫
            { id: "秦剑横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 幽冥剑气
            { id: "幽冥剑气", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 处决技 (斩首伤害极高)
            { id: "将军令·斩首", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 亡者咆哮
            { id: "亡者咆哮", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 不灭战魂
            { id: "不灭战魂", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】死在皇陵中的秦军将领，被阴气转化为不知疲倦的杀戮机器。"
    },

    // ==========================================
    // 3. 渭水与蓝田
    // ==========================================
    {
        id: "rc11_008", template: "minion", name: "渭河水鬼", region: "r_c_1_1", spawnType: "river", timeStart: 0,
        subType: "undead",
        defType: "none", // 浮肿的尸体，无护甲
        stats: { hp: 80, phy_atk: 18, mag_atk: 5, phy_def: 5, mag_def: 5, speed: 12 },
        money: [0, 10],
        drops: [
            { id: "materials_032", rate: 0.1 },
            { id: "weapons_015", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 拖拽
            { id: "水鬼拖拽", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 窒息
            { id: "窒息之拥", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "溺死在渭水中的怨魂，皮肤浮肿，会把路过岸边的人拖下水。"
    },
    {
        id: "rc11_009", template: "minion", name: "发疯的采玉人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 普通布衣
        stats: { hp: 70, phy_atk: 10, mag_atk: 0, phy_def: 3, mag_def: 0, speed: 7 },
        money: [10, 50],
        drops: [
            { id: "weapons_011", rate: 0.3 },
            { id: "materials_045", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 工具攻击
            { id: "胡乱凿击", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 癫狂爆发
            { id: "癫狂挥舞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在蓝田山中寻找美玉而迷失心智的可怜人。"
    },

    // ==========================================
    // 4. 暗流涌动
    // ==========================================
    {
        id: "rc11_010", template: "elite", name: "六国死士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "light", // 夜行衣或伪装，防御极低但便于潜伏
        stats: { hp: 140, phy_atk: 45, mag_atk: 5, phy_def: 5, mag_def: 5, speed: 18 }, // 极高的速度和攻击，身板极脆
        money: [50, 150],
        drops: [
            { id: "weapons_039", rate: 0.2 },
            { id: "pills_001", rate: 0.4 },
            { id: "book_cultivation_r1_19_full", rate: 0.03 },
            { id: "book_cultivation_r1_19_full", rate: 0.03 },
            { id: "book_cultivation_r1_19_full", rate: 0.03 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速出刀
            { id: "急速划击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 爆发背刺
            { id: "绝命背刺", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 致残打击，攻其要害降低防御
            // debuffValType: 1 (百分比), 降低 30% 物防, 持续 3 回合
            { id: "致残打击", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】潜伏在咸阳企图刺杀秦皇的刺客，怀着国破家亡的仇恨。"
    },
    {
        id: "rc11_011", template: "minion", name: "炼丹方士", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "cloth", // 宽松的道袍
        stats: { hp: 80, phy_atk: 5, mag_atk: 15, phy_def: 2, mag_def: 5, speed: 6 },
        money: [20, 100],
        drops: [
            { id: "pills_001", rate: 0.3 },
            { id: "materials_010", rate: 0.2 },
            { id: "book_cultivation_r2_02_full", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 滚烫丹药
            { id: "投掷火丹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 炸炉
            { id: "丹炉爆裂", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "声称能炼制长生不老药的术士，其实多半是骗子。"
    },
    {
        id: "rc11_012", template: "elite", name: "宫廷乐师(刺客)", region: "r_c_1_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "cloth", // 华丽的演出服
        stats: { hp: 130, phy_atk: 35, mag_atk: 10, phy_def: 5, mag_def: 10, speed: 15 },
        money: [40, 90],
        drops: [
            { id: "weapons_040", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 暗器
            { id: "袖箭偷袭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 藏剑
            { id: "筑中利刃", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 断肠之音，干扰心神降低攻击
            // debuffValType: 1 (百分比), 降低 25% 物攻, 持续 3 回合
            { id: "断肠之音", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】以击筑为掩护，乐器中藏着致命的武器，类似高渐离。"
    },

    // ==========================================
    // 5. 领主级 (Lord)
    // ==========================================
    {
        id: "rc11_lord_01", template: "lord", name: "始皇陵守灵人", region: "r_c_1_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "plate", // 历代相传的守陵玄甲
        stats: { hp: 1296, phy_atk: 50, mag_atk: 50, phy_def: 34, mag_def: 29, speed: 10 }, // 极高双抗，魔武双修
        money: [200, 500],
        drops: [
            { id: "weapons_090", rate: 0.05 },
            { id: "book_cultivation_r3_01_full", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 定秦剑 (物理)
            { id: "定秦一剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 皇陵剑气 (法术，防止单一堆防)
            { id: "皇陵剑气", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 横扫六合 (物理)
            { id: "横扫六合", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 祖龙 (法术大招，50 * 4.8 = 240伤)
            { id: "祖龙降世·镇杀", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 帝陵威压
            { id: "帝陵威压", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 封穴截脉 (减攻)
            { id: "封穴截脉", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 护陵罡气
            { id: "护陵罡气", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 先天功 (HP Regen)
            { id: "先天功", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】活了不知多少岁月的守陵人，掌握着秦皇扫六合的恐怖武学。"
    },

    {
        id: "rc11_lord_02", template: "lord", name: "堕落的蒙恬英灵", region: "r_c_1_1", spawnType: "road", timeStart: 1,
        subType: "undead",
        defType: "plate", // 幽冥将军甲
        stats: { hp: 2116, phy_atk: 75, mag_atk: 20, phy_def: 50, mag_def: 30, speed: 12 }, // TS1阶段的高维面板
        money: [100, 300],
        drops: [
            { id: "weapons_053", rate: 0.05 },
            { id: "head_012", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 蛇矛
            { id: "苍云刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 辟易
            { id: "万军辟易", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 守望者 (75 * 2.8 = 210伤)
            { id: "长城守望者", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 铁骑 (75 * 4.8 = 360伤，TS1阶段的斩杀线)
            { id: "大秦铁骑·冲锋", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 英灵怒号
            { id: "英灵怒号", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 怨气缠身 (HP Burn)
            { id: "怨气缠身", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 筑城
            { id: "筑城", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 军阵严整 (常规Buff)
            { id: "军阵严整", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】被奸臣害死的大将怨气不散，率领幽冥鬼军徘徊在长城脚下。"
    },

    {
        id: "rc11_lord_03", template: "lord", name: "楚霸王(分身)", region: "r_c_1_1", spawnType: "city", timeStart: 2,
        subType: "human",
        defType: "heavy", // 霸王甲
        stats: { hp: 1944, phy_atk: 147, mag_atk: 10, phy_def: 48, mag_def: 26, speed: 18 }, // TS2 物理天花板
        money: [100, 300],
        drops: [
            { id: "weapons_065", rate: 0.05 },
            { id: "materials_038", rate: 0.05 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 霸王戟
            { id: "霸王戟法", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 力拔山
            { id: "力拔山兮", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 盖世 (147 * 3.0 = 441伤)
            { id: "气盖世", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 乱舞 (147 * 5.0 = 735伤，核弹级伤害)
            { id: "鬼神乱舞", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 霸王威慑
            { id: "霸王威慑", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },

            // [Type 2] 四面楚歌 (减攻减速)
            { id: "四面楚歌", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 破釜沉舟 (60% 攻击提升，极其危险)
            { id: "破釜沉舟", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 },

            // [Type 3] 战意不熄 (HP Regen)
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
        defType: "light", // 游侠便装
        stats: { hp: 90, phy_atk: 20, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 12 },
        money: [10, 40],
        drops: [
            { id: "weapons_021", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 游侠剑
            { id: "轻剑快刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 意气一击
            { id: "任侠一击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "混迹于洛阳市井的少年剑客，轻生死，重然诺。"
    },
    {
        id: "rc21_002", template: "elite", name: "周室守藏史(亡魂)", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "undead",
        defType: "cloth", // 虚幻的官袍，物防极低
        stats: { hp: 150, phy_atk: 5, mag_atk: 25, phy_def: 0, mag_def: 20, speed: 8 },
        money: [0, 0],
        drops: [
            { id: "book_cultivation_r3_01_full", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 墨痕
            { id: "泼墨", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 诛心
            { id: "口诛笔伐", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 史笔如刀，降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
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
        defType: "heavy", // 魏国重甲
        stats: { hp: 200, phy_atk: 30, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "weapons_037", rate: 0.1 },
            { id: "book_body_r1_09_full", rate: 0.03 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 长戈
            { id: "长戈突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 盾击
            { id: "重盾猛击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 军阵威慑，降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "军阵威慑", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】战国时期最强步兵的英灵，即便死去依然身披重甲。"
    },
    {
        id: "rc21_004", template: "minion", name: "韩国弩手(残部)", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather", // 射手皮甲
        stats: { hp: 80, phy_atk: 35, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 9 },
        money: [5, 20],
        drops: [
            { id: "weapons_025", rate: 0.3 },
            { id: "weapons_060", rate: 0.01 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 放箭
            { id: "暗处冷箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 劲弩
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
        defType: "leather", // 耐磨的皮衣
        stats: { hp: 80, phy_atk: 12, mag_atk: 0, phy_def: 4, mag_def: 3, speed: 8 },
        money: [20, 80],
        drops: [
            { id: "weapons_020", rate: 0.4 },
            { id: "materials_019", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 工具攻击
            { id: "挥舞矿镐", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 致命一击
            { id: "洛阳铲重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "活跃在邙山一带的盗墓贼，擅长分金定穴。"
    },
    {
        id: "rc21_006", template: "elite", name: "黄河河伯娶亲队", region: "r_c_2_1", spawnType: "river", timeStart: 0,
        subType: "human",
        defType: "cloth", // 祭祀用的彩衣
        stats: { hp: 180, phy_atk: 20, mag_atk: 10, phy_def: 10, mag_def: 15, speed: 8 },
        money: [50, 200],
        drops: [
            { id: "head_004", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 仪仗攻击
            { id: "锣鼓喧天", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 沉河
            { id: "活人沉河", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 邪神祭祀，恐惧降防
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 3 回合
            { id: "邪神祭祀", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】崇拜邪神河伯的狂热信徒，敲锣打鼓要把活人扔进河里。"
    },
    {
        id: "rc21_007", template: "minion", name: "豪强恶奴", region: "r_c_2_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "cloth", // 粗布家丁服
        stats: { hp: 90, phy_atk: 15, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 6 },
        money: [10, 50],
        drops: [
            { id: "weapons_003", rate: 0.4 },
            { id: "book_body_r1_03_full", rate: 0.03 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 闷棍
            { id: "当头一棒", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 欺凌
            { id: "狗仗人势", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "中原富商豪强豢养的打手，仗势欺人。"
    },
    {
        id: "rc21_008", template: "boss", name: "鬼谷弃徒", region: "r_c_2_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 纵横家服饰
        stats: { hp: 540, phy_atk: 50, mag_atk: 36, phy_def: 10, mag_def: 14, speed: 15 },
        money: [100, 200],
        drops: [
            { id: "weapons_055", rate: 0.1 },
            { id: "book_cultivation_r3_05_full", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 纵剑
            { id: "纵剑挑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 百步飞剑
            { id: "百步飞剑", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 绝杀 (天地一指，法术爆发)
            { id: "天地一指", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 谋略压制
            { id: "谋略压制", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },

            // [Type 3] Buff (10%) - 横贯八方
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
        defType: "none", // 灵体/神念，免疫物理护甲概念
        stats: { hp: 1080, phy_atk: 6, mag_atk: 65, phy_def: 14, mag_def: 45, speed: 20 }, // 极高法抗，物理脆皮
        money: [100, 300],
        drops: [
            { id: "book_cultivation_r3_20_full", rate: 0.1 },
            { id: "pills_071", rate: 0.2 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 落子
            { id: "落子无悔", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 棋局
            { id: "天地棋局", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 归元 (65 * 2.8 = 182伤)
            { id: "万物归元", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 天道 (65 * 5.0 = 325伤，法系核弹)
            { id: "纵横天道", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 精神重压
            { id: "精神重压", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 思维迟滞 (减速)
            { id: "思维迟滞", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 运筹帷幄
            { id: "运筹帷幄", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },

            // [Type 3] 纵横捭阖
            { id: "纵横捭阖", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】纵横家的鼻祖，在此地留下的一道考验后人的神念。"
    },

    {
        id: "rc21_lord_02", template: "lord", name: "信陵君食客首领", region: "r_c_2_1", spawnType: "city", timeStart: 1,
        subType: "human",
        defType: "light", // 游侠劲装
        stats: { hp: 1512, phy_atk: 88, mag_atk: 20, phy_def: 28, mag_def: 28, speed: 18 }, // 高攻较脆，速度快
        money: [100, 300],
        drops: [
            { id: "weapons_055", rate: 0.05 },
            { id: "materials_039", rate: 0.2 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 义士剑
            { id: "义士剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 死士
            { id: "士为知己死", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 窃符 (88 * 2.8 = 246伤)
            { id: "窃符一击", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 合纵 (88 * 4.5 = 396伤，极高爆发)
            { id: "合纵攻秦", rate: 0.025, type: 1, damage: 4.5, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 大义压人
            { id: "大义压人", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 围魏救赵 (减速)
            { id: "围魏救赵", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 门客三千
            { id: "门客三千", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },

            // [Type 3] 杯酒言欢 (HP Regen)
            { id: "杯酒言欢", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】曾窃符救赵的义士首领，如今聚集在魏地试图恢复旧秩序。"
    },

    {
        id: "rc21_lord_03", template: "lord", name: "黄河巨龟", region: "r_c_2_1", spawnType: "river", timeStart: 2,
        subType: "beast",
        defType: "heavy", // 极其厚重的龟甲
        stats: { hp: 2332, phy_atk: 85, mag_atk: 75, phy_def: 72, mag_def: 35, speed: 5 }, // TS2最强之盾，极慢
        money: [100, 300],
        drops: [
            { id: "materials_019", rate: 1.0 },
            { id: "materials_039", rate: 0.5 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 激流 (法术)
            { id: "激流冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 骇浪 (法术)
            { id: "惊涛骇浪", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 压顶 (物理，利用85的物攻)
            { id: "泰山压顶", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 洛书阵 (法术大招，75 * 5.0 = 375伤，穿透物防坦克的杀招)
            { id: "洛书·河图大阵", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 翻江倒海 (减速)
            { id: "翻江倒海", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 深海窒息 (HP Burn)
            { id: "深海窒息", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 玄水护盾 (加物防)
            { id: "玄水护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 缩壳养神 (加法防，弥补弱点)
            { id: "缩壳养神", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
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
        subType: "human",
        defType: "leather", // 贩私盐多穿皮甲护身
        stats: { hp: 110, phy_atk: 15, mag_atk: 0, phy_def: 8, mag_def: 4, speed: 8 },
        money: [40, 100],
        drops: [
            { id: "weapons_034", rate: 0.15 },
            { id: "foodMaterial_008", rate: 0.8 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 长叉
            { id: "长叉突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 亡命
            { id: "亡命护盐", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "齐地多盐铁，贩卖私盐利润极高，他们为了护盐敢于拼命。"
    },
    {
        id: "re01_002", template: "minion", name: "临淄斗鸡", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "beast",
        defType: "none", // 无护甲
        stats: { hp: 50, phy_atk: 25, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 18 },
        money: [0, 0],
        drops: [
            { id: "materials_040", rate: 0.5 },
            { id: "foodMaterial_050", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 啄
            { id: "凶猛啄击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 飞抓
            { id: "凌空飞爪", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "齐国贵族好斗鸡，这些精心饲养的斗鸡凶猛异常，啄人极痛。"
    },
    {
        id: "re01_003", template: "elite", name: "墨家机关兽(暴走)", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        subType: "mechanism", // 统一为机关类型
        defType: "plate", // 木石铜铁构造，坚硬
        stats: { hp: 200, phy_atk: 25, mag_atk: 0, phy_def: 35, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "weapons_011", rate: 0.3 },
            { id: "weapons_055", rate: 0.05 },
            { id: "materials_041", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 碾压
            { id: "齿轮碾压", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 旋风
            { id: "刃轮旋风", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 机械轰鸣，震慑心神降低攻击
            // debuffValType: 1 (百分比), 降低 20% 物攻, 持续 3 回合
            { id: "机械轰鸣", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】墨家留下的木石机关，因年久失修而敌我不分。"
    },
    {
        id: "re01_004", template: "minion", name: "落魄方士", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "cloth", // 破旧道袍
        stats: { hp: 70, phy_atk: 5, mag_atk: 15, phy_def: 2, mag_def: 8, speed: 10 },
        money: [10, 50],
        drops: [
            { id: "pills_001", rate: 0.4 },
            { id: "book_cultivation_r1_01_full", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 投掷废丹
            { id: "投掷废丹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 炸炉
            { id: "丹炉炸裂", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "整日炼丹求仙，精神恍惚，会扔出失败的丹药炸人。"
    },

    // ==========================================
    // 2. 泰山与响马
    // ==========================================
    {
        id: "re01_005", template: "minion", name: "泰山响马", region: "r_e_0_1", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather", // 强盗通常穿皮甲
        stats: { hp: 120, phy_atk: 20, mag_atk: 0, phy_def: 10, mag_def: 5, speed: 10 },
        money: [20, 60],
        drops: [
            { id: "weapons_029", rate: 0.2 },
            { id: "head_002", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 板斧劈砍
            { id: "板斧劈砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 重劈
            { id: "开山重斧", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "盘踞在泰山险要之处的强盗，大碗喝酒大口吃肉。"
    },
    {
        id: "re01_006", template: "elite", name: "武馆教头", region: "r_e_0_1", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "light", // 练功服，轻便
        stats: { hp: 220, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 10 },
        money: [50, 150],
        drops: [
            { id: "weapons_050", rate: 0.1 },
            { id: "book_body_r1_09_full", rate: 0.03 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 棍扫
            { id: "三节棍扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 连招
            { id: "连环重击", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 接化发，四两拨千斤降低攻击
            // debuffValType: 1 (百分比), 降低 25% 物攻, 持续 3 回合
            { id: "接化发", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】齐地尚武，临淄城中武馆林立，教头功夫深不可测。"
    },
    {
        id: "re01_007", template: "boss", name: "大盗跖(伪)", region: "r_e_0_1", spawnType: "mountain", timeStart: 1,
        subType: "human",
        defType: "light", // 盗贼夜行衣
        stats: { hp: 756, phy_atk: 81, mag_atk: 12, phy_def: 11, mag_def: 11, speed: 20 }, // 极高攻速，极脆
        money: [100, 200],
        drops: [
            { id: "weapons_054", rate: 0.1 },
            { id: "weapons_062", rate: 0.01 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 随形
            { id: "如影随形", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 飞爪
            { id: "飞爪夺命", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 血滴子 (配合81攻，极度致命)
            { id: "血滴子·断头", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 石灰粉
            { id: "石灰粉", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 神行百变
            { id: "神行百变", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【头目】自称盗圣柳下跖传人的巨寇，轻功卓绝，来去无踪。"
    },

// ==========================================
// 3. 边境与东夷
// ==========================================
    {
        id: "re01_008", template: "minion", name: "东夷射手", region: "r_e_0_1", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "leather", // 部落皮甲
        stats: { hp: 80, phy_atk: 30, mag_atk: 0, phy_def: 3, mag_def: 5, speed: 12 },
        money: [5, 20],
        drops: [
            { id: "weapons_048", rate: 0.15 },
            { id: "book_body_r1_07_full", rate: 0.03 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 射击
            { id: "精准射击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 穿杨
            { id: "百步穿杨", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "生活在东部山林的古老部族，箭术精准。"
    },
    {
        id: "re01_009", template: "elite", name: "蓬莱引路人", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "human",
        defType: "cloth", // 飘逸的道袍，无物防
        stats: { hp: 150, phy_atk: 10, mag_atk: 25, phy_def: 10, mag_def: 20, speed: 15 },
        money: [50, 200],
        drops: [
            { id: "materials_019", rate: 0.3 },
            { id: "pills_041", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 幻术
            { id: "撒豆成兵", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 雷法
            { id: "掌心雷", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 仙境迷雾，迷惑心智降低攻击
            // debuffValType: 1 (百分比), 降低 25% 物攻, 持续 3 回合
            { id: "仙境迷雾", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】专门诱骗富人出海寻仙的骗子头目，熟悉海路。"
    },
    {
        id: "re01_010", template: "minion", name: "海边巨蟹", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "beast",
        defType: "plate", // 坚硬的外壳
        stats: { hp: 60, phy_atk: 20, mag_atk: 0, phy_def: 25, mag_def: 5, speed: 4 },
        money: [0, 0],
        drops: [
            { id: "foodMaterial_005", rate: 0.6 },
            { id: "materials_048", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 夹击
            { id: "巨螯夹击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 冲撞
            { id: "横行冲撞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "海边沙滩上的大螃蟹，横行霸道。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "re01_lord_01", template: "lord", name: "东海蛟龙", region: "r_e_0_1", spawnType: "ocean", timeStart: 0,
        subType: "beast",
        defType: "plate", // 坚硬的龙鳞
        stats: { hp: 1296, phy_atk: 30, mag_atk: 63, phy_def: 34, mag_def: 34, speed: 16 }, // 完美的魔龙面板：高血、高法伤、高双抗
        money: [100, 300],
        drops: [
            { id: "materials_044", rate: 0.5 },
            { id: "weapons_075", rate: 0.05 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 水柱
            { id: "水龙卷", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 龙息
            { id: "寒冰龙息", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 龙怒 (63 * 2.8 = 176伤)
            { id: "东海龙王怒", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 覆海 (63 * 4.8 = 302伤，团灭技)
            { id: "覆海大阵", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 龙威震慑
            { id: "龙威震慑", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 寒气入体 (HP Burn)
            { id: "寒气入体", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 呼风唤雨
            { id: "呼风唤雨", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 龙血沸腾 (HP Regen)
            { id: "龙血沸腾", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】深海中的恶蛟，传说是龙的远亲，能呼风唤雨。"
    },

    {
        id: "re01_lord_02", template: "lord", name: "孔门弃徒(狂)", region: "r_e_0_1", spawnType: "city", timeStart: 1,
        subType: "human",
        defType: "cloth", // 破烂的儒袍
        stats: { hp: 1620, phy_atk: 90, mag_atk: 10, phy_def: 30, mag_def: 40, speed: 14 }, // TS1 物理破坏力天花板
        money: [100, 300],
        drops: [
            { id: "weapons_050", rate: 0.05 },
            { id: "book_cultivation_r2_05_full", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 戒尺/棍
            { id: "当头棒喝", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 抡语
            { id: "以力服人", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 六艺 (90 * 2.8 = 252伤)
            { id: "射御双绝", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 仁 (90 * 4.8 = 432伤，核弹级物理伤害)
            { id: "杀身成仁", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 礼崩乐坏
            { id: "礼崩乐坏", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 强行教化 (减攻)
            { id: "强行教化", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 浩然正气
            { id: "浩然正气", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 吾日三省
            { id: "吾日三省", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】修习儒家六艺走火入魔的狂人，力大无穷，以力服人。"
    },

    {
        id: "re01_lord_03", template: "lord", name: "泰山石敢当(灵)", region: "r_e_0_1", spawnType: "mountain", timeStart: 2,
        subType: "elemental",
        defType: "plate", // 灵石之躯，极硬
        stats: { hp: 2592, phy_atk: 90, mag_atk: 45, phy_def: 86, mag_def: 65, speed: 4 }, // 物理免疫级的防御，血量之最
        money: [100, 300],
        drops: [
            { id: "materials_023", rate: 0.5 },
            { id: "materials_045", rate: 0.5 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 撞击
            { id: "巨石撞击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 压顶
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 地裂 (90 * 3.0 = 270伤)
            { id: "山崩地裂", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 封禅 (90 * 5.0 = 450伤，坦克也得碎)
            { id: "封禅大典·镇杀", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 镇压邪祟 (减攻)
            { id: "镇压邪祟", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 重力场 (减速)
            { id: "重力场", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 不动如山 (防御再+60%，基本等于物理免疫)
            { id: "不动如山", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 大地之力 (加魔防)
            { id: "大地之力", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】泰山灵石化成的精怪，坚不可摧，镇压一切邪祟。"
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
        subType: "human",
        defType: "leather", // 水靠，轻便防水
        stats: { hp: 70, phy_atk: 14, mag_atk: 0, phy_def: 4, mag_def: 2, speed: 9 },
        money: [10, 30],
        drops: [
            { id: "weapons_012", rate: 0.3 },
            { id: "foods_048", rate: 0.2 },
            { id: "book_body_r1_03_full", rate: 0.03 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 船桨
            { id: "船桨拍击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 拖拽
            { id: "水下拖拽", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "潜伏在芦苇荡里，靠打劫过往商船为生。"
    },
    {
        id: "rc12_002", template: "minion", name: "扬子鳄", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "beast",
        defType: "plate", // 鳄鱼皮如铁甲
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "materials_049", rate: 0.4 },
            { id: "materials_046", rate: 0.4 },
            { id: "foodMaterial_056", rate: 0.8 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 撕咬
            { id: "凶猛撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 翻滚
            { id: "死亡翻滚", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "云梦泽中的霸主，被称为猪婆龙，咬合力惊人。"
    },
    {
        id: "rc12_003", template: "elite", name: "沼泽巨蟒", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        subType: "beast",
        defType: "leather", // 坚韧蛇鳞
        stats: { hp: 250, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_005", rate: 0.5 },
            { id: "materials_010", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 突袭
            { id: "巨蟒突袭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 绞杀
            { id: "致命绞杀", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 死亡缠绕，勒紧猎物降低速度
            // debuffValType: 1 (百分比), 降低 30% 速度, 持续 3 回合
            { id: "死亡缠绕", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】能吞下一头牛的巨蟒，在泥沼中行动如飞。"
    },
    {
        id: "rc12_004", template: "minion", name: "楚地巫祝", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 祭祀服饰
        stats: { hp: 60, phy_atk: 5, mag_atk: 25, phy_def: 0, mag_def: 15, speed: 8, toxicity: 30 },
        money: [10, 40],
        drops: [
            { id: "foodMaterial_002", rate: 0.3 },
            { id: "materials_006", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 毒虫
            { id: "毒虫噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 巫毒
            { id: "巫毒咒怨", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "戴着狰狞面具，擅长使用毒虫和诅咒。"
    },
    {
        id: "rc12_005", template: "elite", name: "负隅顽抗的楚军", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "heavy", // 残破的重甲
        stats: { hp: 160, phy_atk: 32, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 7 },
        money: [20, 60],
        drops: [
            { id: "weapons_038", rate: 0.15 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 挥砍
            { id: "阔剑挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 拼命
            { id: "亡秦必楚", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 楚魂震慑，视死如归降低敌人攻击
            // debuffValType: 1 (百分比), 降低 25% 物攻, 持续 3 回合
            { id: "楚魂震慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】楚虽三户，亡秦必楚。不愿投降的楚军残部。"
    },
    {
        id: "rc12_006", template: "minion", name: "湘西赶尸人", region: "r_c_1_2", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "cloth", // 道袍/布衣
        stats: { hp: 80, phy_atk: 10, mag_atk: 25, phy_def: 5, mag_def: 15, speed: 5 },
        money: [30, 80],
        drops: [
            { id: "weapons_002", rate: 0.3 },
            { id: "pills_001", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 摇铃
            { id: "摄魂铃音", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 符咒
            { id: "尸气符爆", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "摇着铃铛，赶着尸体回乡安葬的神秘人，生人勿进。"
    },

// ==========================================
// 3. 传说与自然
// ==========================================
    {
        id: "rc12_007", template: "boss", name: "九头鸟(幼体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "light", // 羽毛
        stats: { hp: 648, phy_atk: 39, mag_atk: 53, phy_def: 8, mag_def: 16, speed: 18 },
        money: [100, 200],
        drops: [
            { id: "materials_040", rate: 0.8 },
            { id: "pills_053", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 夜鸣
            { id: "鬼车夜鸣", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 连啄 (物理伤害，利用39的物攻面板)
            { id: "九首连啄", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (5%) - 摄魂 (法术爆发，配合53面板，极度致命)
            { id: "摄魂夺魄", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 厄运降临
            { id: "厄运降临", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 妖风护体
            { id: "妖风护体", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 4 }
        ],
        desc: "【头目】楚地传说中的不祥之鸟，鬼车，叫声能摄人魂魄。"
    },
    {
        id: "rc12_008", template: "minion", name: "剧毒蟾蜍", region: "r_c_1_2", spawnType: "grass", timeStart: 0,
        subType: "beast",
        defType: "leather", // 湿滑的表皮
        stats: { hp: 40, phy_atk: 15, mag_atk: 20, phy_def: 10, mag_def: 10, speed: 4, toxicity: 30 },
        money: [0, 0],
        drops: [
            { id: "pills_053", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 舌头
            { id: "长舌鞭击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 毒液
            { id: "毒液喷射", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "浑身长满脓包，碰到就会中毒。"
    },
    {
        id: "rc12_009", template: "elite", name: "项氏家臣", region: "r_c_1_2", spawnType: "city", timeStart: 1,
        subType: "human",
        defType: "heavy", // 项氏一族精良铠甲
        stats: { hp: 200, phy_atk: 40, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 10 },
        money: [60, 150],
        drops: [
            { id: "weapons_044", rate: 0.15 },
            { id: "book_body_r1_09_full", rate: 0.45 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 基础枪法
            { id: "单手挑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 霸王枪意
            { id: "回马枪", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 霸王余威，大幅降低敌人防御
            // debuffValType: 1 (百分比), 降低 25% 物防, 持续 3 回合
            { id: "霸王余威", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】项羽家族的家臣，个个武艺高强，忠心耿耿。"
    },
    {
        id: "rc12_010", template: "minion", name: "神农架野人", region: "r_c_1_2", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "none", // 仅有红毛皮肉
        stats: { hp: 140, phy_atk: 30, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_024", rate: 0.05 },
            { id: "foodMaterial_006", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 疯狂撕咬
            { id: "野性乱抓", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 蛮力撞击
            { id: "咆哮冲撞", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "深山中直立行走的红毛野兽，力大无穷。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================

    {
        id: "rc12_lord_01", template: "lord", name: "云梦龙君", region: "r_c_1_2", spawnType: "river", timeStart: 0,
        subType: "beast",
        defType: "plate", // 龙鳞护甲
        stats: { hp: 1296, phy_atk: 32, mag_atk: 63, phy_def: 30, mag_def: 32, speed: 15 }, // 半龙之躯，高法伤高双抗
        money: [100, 300],
        drops: [
            { id: "materials_044", rate: 0.3 },
            { id: "materials_039", rate: 0.3 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%) - 水箭
            { id: "水箭突袭", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 泽国
            { id: "云梦泽国", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 覆舟
            { id: "狂澜覆舟", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 真龙 (63 * 4.5 = 283伤，法系爆发)
            { id: "真龙降世", rate: 0.025, type: 1, damage: 4.5, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 兴云吐雾 (减速)
            { id: "兴云吐雾", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 溺水诅咒 (HP Burn)
            { id: "溺水诅咒", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 真龙之躯 (加防)
            { id: "真龙之躯", rate: 0.06, type: 3, buffValue: 0.45, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 水灵治愈 (HP Regen)
            { id: "水灵治愈", rate: 0.02, type: 3, buffValue: 0.06, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】云梦泽中修行的千年白蛇，已化为半龙之躯。"
    },
    {
        id: "rc12_lord_02", template: "lord", name: "巫神代言人", region: "r_c_1_2", spawnType: "mountain", timeStart: 1,
        subType: "human",
        defType: "cloth", // 祭祀长袍
        stats: { hp: 1512, phy_atk: 9, mag_atk: 88, phy_def: 20, mag_def: 40, speed: 14 }, // TS1 法系巅峰，物防纸糊
        money: [100, 300],
        drops: [
            { id: "foodMaterial_002", rate: 0.5 },
            { id: "book_cultivation_r3_21_full", rate: 0.1 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "蛊虫噬骨", rate: 0.2, type: 1, damage: 1.3, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "摄魂咒", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%)
            { id: "九幽怨念", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 寂灭指 (88 * 5.5 = 484伤，即死级爆发)
            { id: "巫神寂灭指", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 衰弱诅咒 (减攻)
            { id: "衰弱诅咒", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 魂力流失 (减魔抗，配合大招必杀)
            { id: "魂力流失", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 巫神附体 (加法攻)
            { id: "巫神附体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },

            // [Type 3] 降神仪式 (加魔抗)
            { id: "降神仪式", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】楚地大巫，能沟通鬼神，施展恐怖的即死诅咒。"
    },
    {
        id: "rc12_lord_03", template: "lord", name: "九头神鸟(完全体)", region: "r_c_1_2", spawnType: "mountain", timeStart: 2,
        subType: "beast",
        defType: "light", // 神鸟羽衣
        stats: { hp: 2138, phy_atk: 138, mag_atk: 45, phy_def: 42, mag_def: 55, speed: 30 }, // 极速，高物攻，防御中等
        money: [100, 300],
        drops: [
            { id: "materials_047", rate: 0.5 },
            { id: "materials_020", rate: 0.5 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "风刃乱舞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "凌空扑击", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 九首 (138 * 3.0 = 414伤)
            { id: "九首齐鸣", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 神罚 (138 * 5.0 = 690伤，足以秒杀任何非坦克角色)
            { id: "灾厄神罚", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 灾厄风暴 (减防)
            { id: "灾厄风暴", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 不详血毒 (HP Burn)
            { id: "不详血毒", rate: 0.02, type: 2, debuffValue: 0.07, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 扶摇直上 (速度再+40%，可能会造成连动)
            { id: "扶摇直上", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 神鸟再生 (HP Regen)
            { id: "神鸟再生", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】展开羽翼遮天蔽日的上古凶兽，九个头颅能喷吐九种灾厄。"
    }

];

// --- Part F: 巴蜀之地 (r_c_0_2) [10条] ---
// 范围：成都、汉中、剑阁、江州
const enemies_r_c_0_2 = [
    // ==========================================
    // 1. 天府之国与险途
    // ==========================================

        {
            id: "rc02_001", template: "minion", name: "剑阁剪径贼", region: "r_c_0_2", spawnType: "road", timeStart: 0,
            subType: "human",
            defType: "leather",
            stats: { hp: 90, phy_atk: 18, mag_atk: 0, phy_def: 5, mag_def: 2, speed: 6 },
            money: [10, 40],
            drops: [
                { id: "weapons_029", rate: 0.2 },
                { id: "foods_001", rate: 0.2 }
            ],
            skills: [
                { id: "劫径重劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
                { id: "此山是我开", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
            ],
            desc: "盘踞在蜀道险要之处，利用地势打劫过往商旅。"
        },
        {
            id: "rc02_002", template: "minion", name: "井盐矿工(暴躁)", region: "r_c_0_2", spawnType: "village", timeStart: 0,
            subType: "human",
            defType: "cloth",
            stats: { hp: 100, phy_atk: 15, mag_atk: 0, phy_def: 8, mag_def: 2, speed: 5 },
            money: [20, 60],
            drops: [
                { id: "weapons_020", rate: 0.3 },
                { id: "foodMaterial_008", rate: 0.8 }
            ],
            skills: [
                { id: "矿镐挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
                { id: "愤怒开采", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
            ],
            desc: "在自贡一带开采井盐的工匠，因繁重劳役而变得极具攻击性。"
        },
        {
            id: "rc02_003", template: "elite", name: "食铁兽(熊猫)", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
            subType: "beast",
            defType: "leather",
            stats: { hp: 350, phy_atk: 40, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 4 },
            money: [0, 0],
            drops: [
                { id: "materials_024", rate: 0.2 },
                { id: "foodMaterial_002", rate: 0.5 }
            ],
            skills: [
                { id: "熊抱", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
                { id: "蚩尤坐骑之威", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
                { id: "咬碎铁锅", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
            ],
            desc: "【精英】外表憨态可掬，实则乃上古凶兽蚩尤坐骑，能轻易咬碎铁锅。"
        },
        {
            id: "rc02_004", template: "minion", name: "竹林花斑蛇", region: "r_c_0_2", spawnType: "grass", timeStart: 0,
            subType: "beast",
            defType: "none",
            stats: { hp: 40, phy_atk: 25, mag_atk: 0, phy_def: 1, mag_def: 5, speed: 12, toxicity: 40 },
            money: [0, 0],
            drops: [
                { id: "materials_010", rate: 0.3 },
                { id: "pills_097", rate: 0.1 }
            ],
            skills: [
                { id: "毒牙突袭", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
                { id: "迅猛撕咬", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
            ],
            desc: "隐藏在翠绿竹林中的毒蛇，保护色极好，令人防不胜防。"
        },
        {
            id: "rc02_005", template: "elite", name: "南蛮藤甲兵", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
            subType: "human",
            defType: "plate",
            stats: { hp: 180, phy_atk: 25, mag_atk: 0, phy_def: 45, mag_def: 5, speed: 6 },
            money: [5, 20],
            drops: [
                { id: "weapons_035", rate: 0.1 },
                { id: "head_012", rate: 0.1 },
                { id: "booksBody_r1_11", rate: 0.45 }
            ],
            skills: [
                { id: "藤牌冲撞", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
                { id: "蛮力横砍", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
                { id: "油污滑步", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
            ],
            desc: "【精英】身穿桐油浸泡过的藤甲，刀枪不入，唯一的弱点是火。"
        }
    ,
    {
        id: "rc02_006", template: "minion", name: "巴山夜猿", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "none",
        stats: { hp: 60, phy_atk: 12, mag_atk: 0, phy_def: 2, mag_def: 5, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_002", rate: 0.3 },
            { id: "foods_021", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "灵猿抓挠", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "落石投掷", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "巴东三峡巫峡长，猿鸣三声泪沾裳。成群结队骚扰路人。"
    },
    {
        id: "rc02_007", template: "minion", name: "古蜀遗民", region: "r_c_0_2", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "cloth",
        stats: { hp: 80, phy_atk: 15, mag_atk: 10, phy_def: 5, mag_def: 10, speed: 8 },
        money: [10, 50],
        drops: [
            { id: "weapons_023", rate: 0.2 },
            { id: "materials_019", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "青铜刺击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "太阳鸟祭礼", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "崇拜金沙太阳神鸟的古蜀国后裔，行踪神秘。"
    },
    {
        id: "rc02_008", template: "boss", name: "六牙白象", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 厚实的象皮与神力护持
        stats: { hp: 648, phy_atk: 44, mag_atk: 34, phy_def: 21, mag_def: 14, speed: 8 },
        money: [100, 200],
        drops: [
            { id: "materials_022", rate: 0.5 },
            { id: "materials_021", rate: 1.0 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "神象镇狱", rate: 0.2, type: 1, damage: 1.3, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "长鼻横扫", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            // [Type 1] 很高伤 (5%) - (配合34面板，2.8倍率伤害约95，极具威胁)
            { id: "万象森罗", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%, 3-5回合)
            { id: "灵兽威压", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            // [Type 3] Buff (10%, 3-5回合)
            { id: "神象金身", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】峨眉山中的灵兽，据说曾是普贤菩萨的坐骑（化身）。"
    },
    {
        id: "rc02_009", template: "elite", name: "青城剑客", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather",
        stats: { hp: 160, phy_atk: 35, mag_atk: 0, phy_def: 10, mag_def: 15, speed: 14 },
        money: [50, 150],
        drops: [
            { id: "weapons_035", rate: 0.2 },
            { id: "booksCultivation_r1_19", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "青城剑诀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "破空剑花", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 剑气封穴，降低敌人速度
            { id: "剑气封穴", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】隐居青城山的剑术高手，剑法轻灵飘逸。"
    },

        {
            id: "rc02_010", template: "minion", name: "入蜀流民", region: "r_c_0_2", spawnType: "road", timeStart: 1,
            subType: "human",
            defType: "none",
            stats: { hp: 50, phy_atk: 5, mag_atk: 0, phy_def: 0, mag_def: 0, speed: 4 },
            money: [0, 5],
            drops: [
                { id: "weapons_001", rate: 0.2 }
            ],
            skills: [
                { id: "乱棍挥舞", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
                { id: "绝望挣扎", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
            ],
            desc: "为了躲避中原战乱，翻越秦岭逃入巴蜀的难民。"
        },

        // ==========================================
        // 4. 领主级 (Lord)
        // ==========================================
    {
        id: "rc02_lord_01", template: "lord", name: "蚕丛王尸", region: "r_c_0_2", spawnType: "mountain", timeStart: 0,
        subType: "undead",
        defType: "heavy", // 青铜面具与僵化的躯体
        stats: { hp: 1512, phy_atk: 25, mag_atk: 63, phy_def: 38, mag_def: 42, speed: 8 }, // 极硬的双抗法坦，速度慢
        money: [100, 300],
        drops: [
            { id: "materials_019", rate: 0.3 },
            { id: "materials_021", rate: 0.3 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "尸毒云", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "青铜影袭", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 纵目 (63 * 2.8 = 176伤)
            { id: "纵目神光", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 寂灭劫 (63 * 4.8 = 302伤，法术斩杀)
            { id: "蚕丛寂灭劫", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 古蜀咒怨 (减攻)
            { id: "古蜀咒怨", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 尸毒攻心 (HP Burn)
            { id: "尸毒攻心", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 不灭金身 (大幅加魔抗)
            { id: "不灭金身", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },

            // [Type 3] 古蜀秘法 (HP Regen)
            { id: "古蜀秘法", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】古蜀国第一代王，纵目面具下是一双看透阴阳的眼睛。"
    },
    {
        id: "rc02_lord_02", template: "lord", name: "食铁兽之王", region: "r_c_0_2", spawnType: "mountain", timeStart: 1,
        subType: "beast",
        defType: "plate", // 厚实的油脂与神兽皮
        stats: { hp: 2268, phy_atk: 85, mag_atk: 10, phy_def: 55, mag_def: 20, speed: 9 }, // TS1 物理系的最强盾与矛，唯惧法术
        money: [100, 300],
        drops: [
            { id: "materials_024", rate: 1.0 },
            { id: "weapons_018", rate: 0.05 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "巨掌拍击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 冲撞 (85 * 3.0 = 255伤)
            { id: "铁甲冲撞", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 战神怒 (85 * 5.0 = 425伤，秒杀级物理爆发)
            { id: "兵主战神怒", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 重压减速
            { id: "重压减速", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 威慑怒吼 (减攻)
            { id: "威慑怒吼", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 金刚不坏 (防+50%，物理队噩梦)
            { id: "金刚不坏", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 狂暴嗜血 (攻+25%)
            { id: "狂暴嗜血", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】体型如象的巨型熊猫，一巴掌能拍碎城墙。"
    },
    {
        id: "rc02_lord_03", template: "lord", name: "唐门老祖(伪)", region: "r_c_0_2", spawnType: "city", timeStart: 2,
        subType: "human",
        defType: "light", // 丝绸劲装
        stats: { hp: 1944, phy_atk: 152, mag_atk: 20, phy_def: 24, mag_def: 35, speed: 28 }, // 攻速极致，防御纸糊
        money: [100, 300],
        drops: [
            { id: "weapons_062", rate: 0.1 },
            { id: "pills_053", rate: 0.5 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "含沙射影", rate: 0.2, type: 1, damage: 1.3, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "子母连环箭", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 暴雨梨花 (152 * 3.2 = 486伤)
            { id: "暴雨梨花针", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 终结 (152 * 5.5 = 836伤，游戏目前的单体伤害天花板)
            { id: "千机万变·终结", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 破甲钢针 (减防50%，让脆皮更脆)
            { id: "破甲钢针", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 见血封喉 (HP Burn)
            { id: "见血封喉", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 千机变 (大幅提速)
            { id: "千机变", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 神行影遁 (提速)
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
        subType: "beast",
        defType: "leather", // 坚韧的虎皮
        stats: { hp: 300, phy_atk: 50, mag_atk: 0, phy_def: 12, mag_def: 5, speed: 10 },
        money: [0, 0],
        drops: [
            { id: "materials_020", rate: 0.4 },
            { id: "materials_021", rate: 0.4 },
            { id: "materials_022", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "利爪撕裂", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "山林扑杀", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合)
            { id: "虎啸山林", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】体型巨大的吊睛白额虎，雪原上的绝对王者。"
    },
    {
        id: "rne_002", template: "elite", name: "黑瞎子(熊)", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 皮糙肉厚
        stats: { hp: 350, phy_atk: 45, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 6 },
        money: [0, 0],
        drops: [
            { id: "materials_011", rate: 0.5 },
            { id: "materials_012", rate: 0.4 },
            { id: "materials_023", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "野蛮冲撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "暴怒掌击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合)
            { id: "重压威慑", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 2 }
        ],
        desc: "【精英】皮糙肉厚，嗅觉灵敏，发起狂来能撞断大树。"
    },
    {
        id: "rne_003", template: "minion", name: "雪原狼群", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "beast",
        defType: "none",
        stats: { hp: 70, phy_atk: 18, mag_atk: 0, phy_def: 3, mag_def: 3, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_050", rate: 0.6 },
            { id: "materials_008", rate: 0.5 }
        ],
        skills: [
            { id: "围猎撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            { id: "冷血突袭", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
        ],
        desc: "毛色雪白，耐力极强，擅长围猎。"
    },
    {
        id: "rne_004", template: "minion", name: "采参客", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth",
        stats: { hp: 80, phy_atk: 12, mag_atk: 0, phy_def: 4, mag_def: 2, speed: 7 },
        money: [20, 100],
        drops: [
            { id: "herbs_030", rate: 0.3 },
            { id: "weapons_010", rate: 0.3 }
        ],
        skills: [
            { id: "铁锄挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "求生乱舞", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在深山老林中寻找人参的冒险者，背包里可能藏着宝贝。"
    },
    {
        id: "rne_005", template: "elite", name: "关外响马", region: "r_ne", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "light",
        stats: { hp: 130, phy_atk: 25, mag_atk: 0, phy_def: 6, mag_def: 4, speed: 14 },
        money: [30, 90],
        drops: [
            { id: "weapons_025", rate: 0.2 },
            { id: "mounts_003", rate: 0.05 },
            { id: "book_body_r1_06_full", rate: 0.45 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "回马箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "套马重摔", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合)
            { id: "飞沙走石", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】骑术精湛的强盗，来去如风，手段残忍。"
    },
    {
        id: "rne_006", template: "minion", name: "苦寒流放犯", region: "r_ne", spawnType: "road", timeStart: 0,
        subType: "human",
        defType: "none", // 衣不蔽体
        stats: { hp: 60, phy_atk: 8, mag_atk: 0, phy_def: 2, mag_def: 2, speed: 4 },
        money: [0, 5],
        drops: [
            { id: "weapons_008", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 绝望偷袭
            { id: "铁片划刺", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 濒死反扑
            { id: "临死反扑", rate: 0.1, type: 1, damage: 1.4, damageType: "phy", dmgValType: 1 }
        ],
        desc: "被发配到辽东苦寒之地的罪犯，为了生存不择手段。"
    },
    {
        id: "rne_007", template: "minion", name: "肃慎猎手", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "leather", // 简易皮甲
        stats: { hp: 90, phy_atk: 22, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 9 },
        money: [5, 20],
        drops: [
            { id: "weapons_048", rate: 0.1 },
            { id: "materials_003", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 石箭射击
            { id: "石砮射击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 精准狙击
            { id: "林海狙击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "使用楛矢石砮的古老部族猎人，擅长在林海雪原中追踪。"
    },
    {
        id: "rne_008", template: "minion", name: "扶余战士", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "human",
        defType: "leather", // 游牧皮甲
        stats: { hp: 110, phy_atk: 20, mag_atk: 0, phy_def: 10, mag_def: 5, speed: 8 },
        money: [10, 40],
        drops: [
            { id: "weapons_037", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 长戈突刺
            { id: "长戈刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 蓄力猛击
            { id: "扶余重击", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "来自松嫩平原的农耕与游牧混合部族，性格豪爽。"
    },
    {
        id: "rne_009", template: "elite", name: "鲜卑突骑", region: "r_ne", spawnType: "grass", timeStart: 0,
        subType: "human",
        defType: "heavy", // 精锐骑兵甲
        stats: { hp: 180, phy_atk: 30, mag_atk: 0, phy_def: 12, mag_def: 8, speed: 16 },
        money: [30, 100],
        drops: [
            { id: "weapons_049", rate: 0.1 },
            { id: "mounts_004", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 骑乘挥砍
            { id: "铁骑冲锋", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 斩马
            { id: "斩马重劈", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合) - 蹄声震雷，降低玩家物防
            { id: "震慑马蹄", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】鲜卑山的精锐骑兵，装备比普通匈奴更好。"
    },
    {
        id: "rne_010", template: "boss", name: "长白山雪怪", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 极厚的御寒皮毛
        stats: { hp: 648, phy_atk: 49, mag_atk: 14, phy_def: 22, mag_def: 11, speed: 9 },
        money: [100, 200],
        drops: [
            { id: "materials_023", rate: 0.5 },
            { id: "herbs_030", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 投掷
            { id: "巨石投掷", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 拍击
            { id: "雪怪重掌", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 1] 很高伤 (5%) - 极地狂暴 (配合49面板，伤害恐怖)
            { id: "圣山震怒", rate: 0.05, type: 1, damage: 2.5, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 降低速度
            { id: "雪崩怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            // [Type 3] Buff (10%) - 寒气护体
            { id: "寒冬气息", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】传说中守护圣山的白色巨兽，浑身长满白毛。"
    },

    // ==========================================
    // 4. 领主级 (Lord)
    // ==========================================
    {
        id: "rne_lord_01", template: "lord", name: "长白山龙脉守护", region: "r_ne", spawnType: "mountain", timeStart: 0,
        subType: "elemental",
        defType: "plate", // 万年玄冰，坚不可摧
        stats: { hp: 1296, phy_atk: 25, mag_atk: 63, phy_def: 38, mag_def: 42, speed: 8 }, // 极硬的法系坦克
        money: [100, 300],
        drops: [
            { id: "herbs_030", rate: 1.0 },
            { id: "materials_023", rate: 0.5 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%)
            { id: "寒冰射束", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "冰川穿刺", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 吐息 (63 * 3.0 = 189伤)
            { id: "寒冰吐息", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 绝对零度 (63 * 5.0 = 315伤，法术核弹)
            { id: "绝对零度", rate: 0.025, type: 1, damage: 5.0, damageType: "mag", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 极寒领域 (大幅减速)
            { id: "极寒领域", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 寒毒入髓 (HP Burn)
            { id: "寒毒入髓", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 冰晶护甲 (加物防)
            { id: "冰晶护甲", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 凛冬意志 (加魔抗)
            { id: "凛冬意志", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】由万年冰雪凝聚而成的元素生物，守护着龙脉禁地。"
    },
    {
        id: "rne_lord_02", template: "lord", name: "东胡战神", region: "r_ne", spawnType: "grass", timeStart: 1,
        subType: "human",
        defType: "heavy", // 巨兽皮毛与粗犷铁甲
        stats: { hp: 1890, phy_atk: 92, mag_atk: 10, phy_def: 46, mag_def: 25, speed: 14 }, // TS1 物理面板怪，极度危险
        money: [100, 300],
        drops: [
            { id: "weapons_049", rate: 0.1 },
            { id: "mounts_004", rate: 0.1 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%)
            { id: "重锤打击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "旋风斩", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 粉碎 (92 * 3.2 = 294伤)
            { id: "狼牙粉碎", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 开天辟地 (92 * 5.5 = 506伤，Buff后808伤)
            { id: "战神·开天辟地", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 震慑咆哮 (大幅减防)
            { id: "震慑咆哮", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 蛮荒威压 (减攻)
            { id: "蛮荒威压", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 战神之怒 (攻击+60%，极度危险信号)
            { id: "战神之怒", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 },

            // [Type 3] 祖灵庇佑 (HP Regen)
            { id: "祖灵庇佑", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】东胡部落传说中的勇士，手持千斤重的狼牙棒。"
    },
    {
        id: "rne_lord_03", template: "lord", name: "北冥巨鲲(幼)", region: "r_ne", spawnType: "ocean", timeStart: 2,
        subType: "beast",
        defType: "heavy", // 神兽厚皮，物理抗性极佳
        stats: { hp: 2800, phy_atk: 140, mag_atk: 90, phy_def: 62, mag_def: 50, speed: 6 }, // 游戏血量之最，物理核弹
        money: [100, 300],
        drops: [
            { id: "materials_044", rate: 0.5 },
            { id: "materials_039", rate: 0.5 }
        ],
        skills: [
            // === 4个伤害技能 ===
            // [Type 1] 低伤 (20%) - 巨浪 (法)
            { id: "巨浪冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 水击 (法)
            { id: "水击三千里", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 神压 (法, 90 * 3.5 = 315伤)
            { id: "北冥神压", rate: 0.05, type: 1, damage: 3.5, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 吞噬 (物理, 140 * 6.0 = 840伤，当前版本最高单次伤害)
            { id: "吞噬天地", rate: 0.025, type: 1, damage: 6.0, damageType: "phy", dmgValType: 1 },

            // === 2个Debuff技能 ===
            // [Type 2] 巨鲲引力 (大幅减速)
            { id: "巨鲲引力", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 深渊凝视 (减魔攻)
            { id: "深渊凝视", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 6 },

            // === 2个Buff技能 ===
            // [Type 3] 鲲鹏化境 (加物防)
            { id: "鲲鹏化境", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 海纳百川 (加魔防)
            { id: "海纳百川", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】北冥有鱼，其名为鲲。虽然是幼体，但已有吞天之志。"
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
        subType: "human",
        defType: "leather", // 游牧轻便皮甲
        stats: { hp: 110, phy_atk: 28, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 14 },
        money: [10, 50],
        drops: [
            { id: "weapons_048", rate: 0.2 },
            { id: "materials_015", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 快速连射
            { id: "连珠箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 射雕之技
            { id: "贯穿之矢", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "从小在马背上长大的神射手，箭无虚发。"
    },
    {
        id: "rn_002", template: "minion", name: "草原巨狼", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "beast",
        defType: "none",
        stats: { hp: 80, phy_atk: 18, mag_atk: 0, phy_def: 3, mag_def: 5, speed: 12 },
        money: [0, 0],
        drops: [
            { id: "materials_008", rate: 0.5 },
            { id: "materials_050", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 扑咬
            { id: "凶猛撕咬", rate: 0.2, type: 1, damage: 1.1, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 嗜血突袭
            { id: "残暴突袭", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "比中原狼体型更大，性格更凶残。"
    },
    {
        id: "rn_003", template: "elite", name: "匈奴百夫长", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human",
        defType: "heavy", // 匈奴札甲
        stats: { hp: 220, phy_atk: 35, mag_atk: 0, phy_def: 15, mag_def: 10, speed: 12 },
        money: [50, 150],
        drops: [
            { id: "weapons_049", rate: 0.1 },
            { id: "mounts_004", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 挥砍
            { id: "横扫千军", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 强力冲锋
            { id: "草原冲锋", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合) - 降低敌人防御
            { id: "破甲重击", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】统领百骑的勇士，身经百战。"
    },
    {
        id: "rn_004", template: "elite", name: "萨满巫师", region: "r_n", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 萨满法袍
        stats: { hp: 140, phy_atk: 5, mag_atk: 25, phy_def: 5, mag_def: 20, speed: 8 },
        money: [20, 80],
        drops: [
            { id: "pills_041", rate: 0.3 },
            { id: "materials_035", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 灵魂火
            { id: "神灵之火", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 闪电链
            { id: "长生天雷罚", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合) - 诅咒降低攻击
            { id: "长生天诅咒", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】沟通长生天的祭司，能用诡异的舞蹈诅咒敌人。"
    },
    {
        id: "rn_005", template: "boss", name: "白狼王(灵兽)", region: "r_n", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "leather", // 灵性皮毛
        stats: { hp: 648, phy_atk: 54, mag_atk: 34, phy_def: 11, mag_def: 14, speed: 18 },
        money: [100, 200],
        drops: [
            { id: "materials_020", rate: 0.5 },
            { id: "weapons_053", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 连击
            { id: "闪电撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 狂暴扑杀
            { id: "影狼突袭", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 1] 很高伤 (5%) - 灵术攻击 (混合伤害源)
            { id: "啸月天冲击", rate: 0.05, type: 1, damage: 2.5, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%) - 寒气减速
            { id: "极寒之咬", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            // [Type 3] Buff (10%) - 狼群头领
            { id: "狼群呼唤", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "【头目】草原上传说的白色狼神，速度快如闪电。"
    },
    {
        id: "rn_006", template: "minion", name: "北海牧羊人", region: "r_n", spawnType: "river", timeStart: 0,
        subType: "human",
        defType: "cloth", // 简陋的羊皮袄
        stats: { hp: 60, phy_atk: 10, mag_atk: 0, phy_def: 2, mag_def: 5, speed: 6 },
        money: [5, 20],
        drops: [
            { id: "weapons_002", rate: 0.3 },
            { id: "foodMaterial_053", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "竹竿挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "驱羊犬突", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "在极北苦寒之地放牧的流亡者，性格孤僻。"
    },

    // ==========================================
    // 2. 领主级 (Lord)
    // ==========================================
    {
        id: "rn_lord_01", template: "lord", name: "冒顿单于", region: "r_n", spawnType: "grass", timeStart: 0,
        subType: "human",
        defType: "heavy", // 金色札甲
        stats: { hp: 1296, phy_atk: 78, mag_atk: 15, phy_def: 36, mag_def: 25, speed: 18 }, // 高攻高防高机动的骁骑
        money: [100, 300],
        drops: [
            { id: "weapons_048", rate: 0.1 },
            { id: "mounts_005", rate: 0.1 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "骑射", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "鸣镝箭", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 破阵 (78 * 3.0 = 234伤)
            { id: "单于破阵斩", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 霸主 (78 * 5.0 = 390伤，斩杀线极高)
            { id: "冒顿·草原霸主", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 霸主威压 (减防)
            { id: "霸主威压", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 心胆俱裂 (减攻)
            { id: "心胆俱裂", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 万骑冲锋 (速度+40%，极快)
            { id: "万骑冲锋", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 铁血军魂 (HP Regen)
            { id: "铁血军魂", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】统一草原的匈奴霸主，鸣镝所指，万骑冲锋。"
    },
    {
        id: "rn_lord_02", template: "lord", name: "长生天大祭司", region: "r_n", spawnType: "mountain", timeStart: 1,
        subType: "human",
        defType: "cloth", // 华丽萨满袍
        stats: { hp: 1512, phy_atk: 10, mag_atk: 92, phy_def: 22, mag_def: 55, speed: 14 }, // TS1 最强法术爆发，物理脆皮
        money: [100, 300],
        drops: [
            { id: "pills_041", rate: 0.5 },
            { id: "book_cultivation_r3_01_full", rate: 0.1 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "雷引", rate: 0.2, type: 1, damage: 1.3, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "九天雷霆", rate: 0.1, type: 1, damage: 2.1, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 极光 (92 * 3.3 = 303伤)
            { id: "极光咒", rate: 0.05, type: 1, damage: 3.3, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 裁决 (92 * 5.5 = 506伤，法系核弹)
            { id: "长生天·灭世裁决", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 灵魂震慑 (减攻)
            { id: "灵魂震慑", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 长生天降罚 (HP Burn)
            { id: "长生天降罚", rate: 0.02, type: 2, debuffValue: 0.07, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 风暴护盾 (加魔抗)
            { id: "风暴护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },

            // [Type 3] 万物感应 (加法攻)
            { id: "万物感应", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】能召唤雷霆与风暴的萨满教教主，灵力无边。"
    },
    {
        id: "rn_lord_03", template: "lord", name: "瀚海沙虫王", region: "r_n", spawnType: "desert", timeStart: 2,
        subType: "beast",
        defType: "plate", // 硬化角质层
        stats: { hp: 2462, phy_atk: 128, mag_atk: 20, phy_def: 78, mag_def: 38, speed: 8 }, // 物理攻防一体，惧怕法术
        money: [100, 300],
        drops: [
            { id: "materials_048", rate: 0.8 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "重压", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "钻地突袭", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 吞噬 (128 * 2.8 = 358伤)
            { id: "吞噬", rate: 0.05, type: 1, damage: 2.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 地龙翻身 (128 * 4.8 = 614伤，重装坦克的杀手锏)
            { id: "瀚海地龙翻身", rate: 0.025, type: 1, damage: 4.8, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 沙尘暴 (大幅减速 60%)
            { id: "沙尘暴", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 致盲尘埃 (减攻 30%)
            { id: "致盲尘埃", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 硬化甲壳 (物防+60%，物理免疫时刻)
            { id: "硬化甲壳", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 沙海潜行 (提速)
            { id: "沙海潜行", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】潜伏在戈壁深处的远古生物，每一次翻身都会引发沙尘暴。"
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
        subType: "insect",
        defType: "plate", // 天然坚硬角质壳
        stats: { hp: 90, phy_atk: 25, mag_atk: 0, phy_def: 12, mag_def: 10, speed: 8, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "materials_048", rate: 0.5 },
            { id: "materials_018", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 螯钳
            { id: "毒螯剪切", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 尾刺
            { id: "巨蝎摆尾", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "隐藏在黄沙之下，尾针有剧毒，甲壳坚硬。"
    },
    {
        id: "rw_002", template: "minion", name: "马匪", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "human",
        defType: "leather",
        stats: { hp: 100, phy_atk: 20, mag_atk: 0, phy_def: 5, mag_def: 5, speed: 14 },
        money: [30, 80],
        drops: [
            { id: "weapons_043", rate: 0.15 },
            { id: "pills_002", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 劈砍
            { id: "大漠挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 冲刺
            { id: "纵马突袭", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "来去如风的沙盗，骑术精湛，手段残忍。"
    },
    {
        id: "rw_003", template: "elite", name: "楼兰古尸", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "undead",
        defType: "heavy", // 干燥如木石的躯体
        stats: { hp: 200, phy_atk: 30, mag_atk: 10, phy_def: 25, mag_def: 15, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "weapons_023", rate: 0.1 },
            { id: "materials_012", rate: 0.2 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "腐朽抓挠", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "诅咒之触", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合)
            { id: "千年尸毒", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】被黄沙掩埋千年的干尸，受诅咒而动，不惧刀剑。"
    },
    {
        id: "rw_004", template: "elite", name: "西域刀客", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "light",
        stats: { hp: 160, phy_atk: 40, mag_atk: 0, phy_def: 8, mag_def: 10, speed: 15 },
        money: [50, 150],
        drops: [
            { id: "weapons_043", rate: 0.2 },
            { id: "book_cultivation_r2_25_full", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "风沙旋斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "大漠孤烟", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合)
            { id: "刀意压制", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "【精英】流浪在丝绸之路上的独行侠，刀法极快。"
    },
    {
        id: "rw_005", template: "boss", name: "沙虫之母", region: "r_w", spawnType: "desert", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 极厚的几丁质甲壳
        stats: { hp: 648, phy_atk: 49, mag_atk: 24, phy_def: 25, mag_def: 11, speed: 7 },
        money: [100, 200],
        drops: [
            { id: "materials_018", rate: 0.5 },
            { id: "pills_053", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 钻地
            { id: "钻地突击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 吞噬 (物理爆发)
            { id: "吞噬", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 毒液 (法术大招，弥补法攻面板的不足)
            { id: "毒液洪流", rate: 0.05, type: 1, damage: 2.6, damageType: "mag", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 流沙陷阱
            { id: "流沙陷阱", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 母虫生命力
            { id: "母虫生命力", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】体型如小山的巨大沙虫，张开巨口能吞噬一切。"
    },

    // ==========================================
    // 2. 丝路传说
    // ==========================================
    {
        id: "rw_006", template: "minion", name: "苦行僧", region: "r_w", spawnType: "mountain", timeStart: 0,
        subType: "human",
        defType: "cloth", // 破旧的僧袍
        stats: { hp: 120, phy_atk: 15, mag_atk: 10, phy_def: 15, mag_def: 15, speed: 6 },
        money: [0, 10],
        drops: [
            { id: "weapons_051", rate: 0.2 },
            { id: "book_cultivation_r3_20_full", rate: 0.05 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 戒刀斩
            { id: "戒刀怒斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 佛门吼
            { id: "金刚狮子吼", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "从天竺东来的僧人，虽然慈悲，但也会金刚怒目。"
    },
    {
        id: "rw_007", template: "elite", name: "大宛卫士", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "heavy", // 精锐西域札甲
        stats: { hp: 150, phy_atk: 25, mag_atk: 0, phy_def: 20, mag_def: 10, speed: 10 },
        money: [40, 100],
        drops: [
            { id: "weapons_044", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 突刺
            { id: "枪阵突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 连贯刺击
            { id: "汗血军威", rate: 0.1, type: 1, damage: 1.7, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合) - 阵法压制降速
            { id: "铁壁封锁", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "【精英】守护汗血宝马的精锐士兵，装备精良。"
    },

    // ==========================================
    // 3. 领主级 (Lord)
    // ==========================================
    {
        id: "rw_lord_01", template: "lord", name: "楼兰女王(怨灵)", region: "r_w", spawnType: "city", timeStart: 0,
        subType: "undead",
        defType: "cloth", // 丝绸华服
        stats: { hp: 1404, phy_atk: 20, mag_atk: 64, phy_def: 24, mag_def: 48, speed: 16 }, // 高血高法伤女妖，物防低
        money: [100, 300],
        drops: [
            { id: "materials_039", rate: 0.3 },
            { id: "book_cultivation_r2_25_full", rate: 0.1 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "幽怨掌", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "绝望尖啸", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 葬歌 (64 * 3.1 = 198伤)
            { id: "大漠葬歌", rate: 0.05, type: 1, damage: 3.1, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 寂灭 (64 * 5.2 = 332伤，TS0阶段的必杀技)
            { id: "楼兰往事·寂灭", rate: 0.025, type: 1, damage: 5.2, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 倾国诅咒 (减攻)
            { id: "倾国诅咒", rate: 0.1, type: 2, debuffValue: 0.45, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },

            // [Type 2] 怨灵缠身 (HP Burn)
            { id: "怨灵缠身", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 魅影身法 (提速)
            { id: "魅影身法", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "speed", buffTimes: 4 },

            // [Type 3] 幻像丛生 (加法抗)
            { id: "幻像丛生", rate: 0.1, type: 3, buffValue: 0.2, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】国破家亡的楼兰女王，用倾国倾城的容貌掩盖致命的诅咒。"
    },
    {
        id: "rw_lord_02", template: "lord", name: "天山雪莲妖", region: "r_w", spawnType: "mountain", timeStart: 1,
        subType: "elemental",
        defType: "plate", // 极地冰壳
        stats: { hp: 2160, phy_atk: 10, mag_atk: 85, phy_def: 52, mag_def: 65, speed: 10 }, // 法抗天花板，自带回血的法坦
        money: [100, 300],
        drops: [
            { id: "herbs_025", rate: 1.0 },
            { id: "pills_071", rate: 0.2 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "花瓣刃", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "冰封万里", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 怒意 (85 * 2.8 = 238伤)
            { id: "凛冬之怒", rate: 0.05, type: 1, damage: 2.8, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 归虚 (85 * 4.8 = 408伤，高压法术伤害)
            { id: "万年雪华·归虚", rate: 0.025, type: 1, damage: 4.8, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 寒气侵蚀 (减速)
            { id: "寒气侵蚀", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 经络冰封 (减魔攻，克制法师)
            { id: "经络冰封", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 冰雪护阵 (物防+50%，变得更硬)
            { id: "冰雪护阵", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 万年药力 (HP Regen，持久战噩梦)
            { id: "万年药力", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】生长在天山之巅的万年雪莲修炼成精，浑身是宝。"
    },
    {
        id: "rw_lord_03", template: "lord", name: "火焰山牛魔", region: "r_w", spawnType: "mountain", timeStart: 2,
        subType: "beast",
        defType: "heavy", // 熔岩厚皮
        stats: { hp: 2520, phy_atk: 155, mag_atk: 30, phy_def: 76, mag_def: 28, speed: 8 }, // 物理破坏力之王，法抗极低
        money: [100, 300],
        drops: [
            { id: "weapons_029", rate: 0.1 },
            { id: "materials_023", rate: 0.3 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "牛角挑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "蛮牛冲撞", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 重劈 (155 * 3.2 = 496伤)
            { id: "烈焰重劈", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 天崩 (155 * 5.5 = 852伤，目前版本物理最高单发伤害)
            { id: "魔王咆哮·天崩", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 魔王威压 (减防)
            { id: "魔王威压", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 烈焰焚身 (HP Burn)
            { id: "烈焰焚身", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 火焰护盾 (物防+50%)
            { id: "火焰护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 熔岩血脉 (物攻+25%，一旦开启，平A都是秒杀)
            { id: "熔岩血脉", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】从火焰山中走出的火焰巨牛，所过之处寸草不生。"
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
        subType: "human",
        defType: "none", // 文身赤膊，无护甲
        stats: { hp: 90, phy_atk: 18, mag_atk: 0, phy_def: 2, mag_def: 5, speed: 12 },
        money: [5, 20],
        drops: [
            { id: "weapons_023", rate: 0.1 },
            { id: "materials_005", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 吹箭
            { id: "丛林吹箭", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 伏击
            { id: "断发突袭", rate: 0.1, type: 1, damage: 1.6, damageType: "phy", dmgValType: 1 }
        ],
        desc: "断发文身，善于在丛林中伏击。"
    },
    {
        id: "rs_002", template: "minion", name: "五彩瘴气蛛", region: "r_s", spawnType: "grass", timeStart: 0,
        subType: "insect",
        defType: "leather",
        stats: { hp: 50, phy_atk: 30, mag_atk: 10, phy_def: 5, mag_def: 10, speed: 10, toxicity: 40 },
        money: [0, 0],
        drops: [
            { id: "pills_053", rate: 0.3 },
            { id: "materials_006", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 蛛丝
            { id: "瘴气丝网", rate: 0.2, type: 1, damage: 1.1, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 剧毒注入
            { id: "致命螯刺", rate: 0.1, type: 1, damage: 1.5, damageType: "phy", dmgValType: 1 }
        ],
        desc: "生活在瘴气弥漫的丛林中，颜色越鲜艳毒性越强。"
    },
    {
        id: "rs_003", template: "elite", name: "南越战象", region: "r_s", spawnType: "mountain", timeStart: 0,
        subType: "beast",
        defType: "heavy", // 身披厚重木甲
        stats: { hp: 400, phy_atk: 45, mag_atk: 0, phy_def: 25, mag_def: 10, speed: 5 },
        money: [0, 0],
        drops: [
            { id: "materials_044", rate: 0.5 },
            { id: "materials_011", rate: 0.5 }
        ],
        skills: [
            // [Type 1] 低伤 (20%) - 鼻甩
            { id: "长鼻横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%) - 践踏
            { id: "战争践踏", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合) - 震地降防
            { id: "巨兽震慑", rate: 0.1, type: 2, debuffValue: 0.25, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】身披木甲的战象，冲锋起来地动山摇。"
    },
    {
        id: "rs_004", template: "elite", name: "蛊术师", region: "r_s", spawnType: "village", timeStart: 0,
        subType: "human",
        defType: "cloth",
        stats: { hp: 100, phy_atk: 5, mag_atk: 25, phy_def: 5, mag_def: 15, speed: 8, toxicity: 20 },
        money: [30, 80],
        drops: [
            { id: "foodMaterial_002", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "蛊虫噬肉", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "万蛊噬心", rate: 0.1, type: 1, damage: 1.7, damageType: "mag", dmgValType: 1 },
            // [Type 2] Debuff (10%, 2-3回合)
            { id: "百毒蛊", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "【精英】操控毒虫作为武器，令人防不胜防。"
    },
    {
        id: "rs_005", template: "minion", name: "采珠人(溺亡)", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "undead",
        defType: "none",
        stats: { hp: 70, phy_atk: 15, mag_atk: 5, phy_def: 5, mag_def: 10, speed: 8 },
        money: [10, 50],
        drops: [
            { id: "materials_039", rate: 0.2 },
            { id: "weapons_015", rate: 0.3 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "水草缠绕", rate: 0.2, type: 1, damage: 1.1, damageType: "mag", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "深海怨念", rate: 0.1, type: 1, damage: 1.6, damageType: "mag", dmgValType: 1 }
        ],
        desc: "为了采集海底珍珠而溺亡的怨魂。"
    },
    {
        id: "rs_006", template: "minion", name: "南海大鲨", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "beast",
        defType: "leather", // 粗糙坚韧的鲨鱼皮
        stats: { hp: 200, phy_atk: 40, mag_atk: 0, phy_def: 10, mag_def: 5, speed: 15 },
        money: [0, 0],
        drops: [
            { id: "materials_046", rate: 0.4 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "撕裂咬击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            // [Type 1] 高伤 (10%)
            { id: "血色狂暴", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "海中嗜血的猎手，闻到血腥味就会疯狂。"
    },
    {
        id: "rs_007", template: "boss", name: "深海巨妖", region: "r_se", spawnType: "ocean", timeStart: 0,
        subType: "beast",
        defType: "leather", // 韧性极强的海怪表皮
        stats: { hp: 648, phy_atk: 55, mag_atk: 10, phy_def: 17, mag_def: 11, speed: 9 },
        money: [100, 200],
        drops: [
            { id: "materials_039", rate: 1.0 },
            { id: "weapons_075", rate: 0.1 }
        ],
        skills: [
            // [Type 1] 低伤 (20%)
            { id: "触手抽击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "触手绞杀", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - (配合55面板，爆发极高)
            { id: "深海碾压", rate: 0.05, type: 1, damage: 2.6, damageType: "phy", dmgValType: 1 },

            // [Type 2] Debuff (10%) - 墨汁喷吐
            { id: "墨汁喷吐", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 3] Buff (10%) - 水中再生
            { id: "深海愈合", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "【头目】多条触手的海怪，能轻易掀翻楼船。"
    },

    // ==========================================
    // 3. 领主级 (Lord)
    // ==========================================
    {
        id: "rs_lord_01", template: "lord", name: "南越武王(赵佗)", region: "r_s", spawnType: "city", timeStart: 0,
        subType: "human",
        defType: "heavy", // 精锐秦制铁甲
        stats: { hp: 1404, phy_atk: 72, mag_atk: 15, phy_def: 40, mag_def: 24, speed: 14 }, // 高防高血的重装战士，老当益壮
        money: [100, 300],
        drops: [
            { id: "weapons_038", rate: 0.1 },
            { id: "book_body_r1_16_full", rate: 0.1 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "基础剑招", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "天子剑法", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 横扫 (72 * 3.2 = 230伤)
            { id: "横扫百越", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 灭寇 (72 * 5.5 = 396伤，TS0阶段的高压斩杀)
            { id: "武王灭寇斩", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 帝王霸气 (减防)
            { id: "帝王霸气", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 },

            // [Type 2] 天威难测 (减攻)
            { id: "天威难测", rate: 0.1, type: 2, debuffValue: 0.2, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 割据一方 (物防+50%，变为60防，物理系绝望)
            { id: "割据一方", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 老当益壮 (物攻+25%，配合大招可达500+伤害)
            { id: "老当益壮", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】割据岭南的秦朝将领，虽已年迈，但帝王霸气犹存。"
    },
    {
        id: "rs_lord_02", template: "lord", name: "万蛊之王", region: "r_s", spawnType: "mountain", timeStart: 1,
        subType: "insect",
        defType: "leather", // 坚硬的昆虫外壳
        stats: { hp: 1458, phy_atk: 30, mag_atk: 95, phy_def: 32, mag_def: 65, speed: 20, toxicity: 60 }, // TS1 极速法系秒杀怪，自带高毒性
        money: [100, 300],
        drops: [
            { id: "pills_053", rate: 1.0 },
            { id: "materials_010", rate: 0.5 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%)
            { id: "毒刺", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%)
            { id: "万蛊噬心", rate: 0.1, type: 1, damage: 2.1, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 爆发 (95 * 3.3 = 313伤)
            { id: "剧毒爆发", rate: 0.05, type: 1, damage: 3.3, damageType: "mag", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 终结咒 (95 * 5.8 = 551伤，TS1阶段最强单体法术，触之即死)
            { id: "蛊神终结咒", rate: 0.025, type: 1, damage: 5.8, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 剧毒新星 (大幅减速 50%)
            { id: "剧毒新星", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 蛊毒焚身 (HP Burn 强力毒伤)
            { id: "蛊毒焚身", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 蛊神护体 (法攻+50%，灭团信号)
            { id: "蛊神护体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },

            // [Type 3] 万蛊回生 (HP Regen)
            { id: "万蛊回生", rate: 0.02, type: 3, buffValue: 0.06, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】吞噬了无数毒虫后诞生的蛊王，剧毒无比，触之即死。"
    },
    {
        id: "rs_lord_03", template: "lord", name: "南海龙王(伪)", region: "r_se", spawnType: "ocean", timeStart: 2,
        subType: "beast",
        defType: "plate", // 巨型鲸皮与水甲
        stats: { hp: 2646, phy_atk: 100, mag_atk: 132, phy_def: 65, mag_def: 70, speed: 10 }, // 法系核弹巨兽，双抗极高
        money: [100, 300],
        drops: [
            { id: "materials_039", rate: 0.8 },
            { id: "weapons_075", rate: 0.1 }
        ],
        skills: [
            // --- 4个伤害技能 ---
            // [Type 1] 低伤 (20%) - 水柱 (法)
            { id: "水柱喷射", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },

            // [Type 1] 高伤 (10%) - 重压 (法)
            { id: "深海重压", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },

            // [Type 1] 很高伤 (5%) - 鲸吞 (物理, 100 * 3.5 = 350伤，混合输出防针对)
            { id: "鲸吞蚕食", rate: 0.05, type: 1, damage: 3.5, damageType: "phy", dmgValType: 1 },

            // [Type 1] 极高伤 (2.5%) - 狂澜 (法术, 132 * 6.0 = 792伤，法系毁灭打击)
            { id: "南海·灭世狂澜", rate: 0.025, type: 1, damage: 6.0, damageType: "mag", dmgValType: 1 },

            // --- 2个Debuff技能 ---
            // [Type 2] 惊涛骇浪 (减速)
            { id: "惊涛骇浪", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },

            // [Type 2] 寒冰水牢 (减物攻)
            { id: "寒冰水牢", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // --- 2个Buff技能 ---
            // [Type 3] 水幕天华 (物防+60%，变得更硬)
            { id: "水幕天华", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },

            // [Type 3] 洋流推进 (提速)
            { id: "洋流推进", rate: 0.1, type: 3, buffValue: 0.25, buffValType: 1, buffAttr: "speed", buffTimes: 6 }
        ],
        desc: "【领主】统御南海水族的一头巨型鲸鲵，自封为王。"
    }
];
const enemies_1=[
// 1. 灵噬硕鼠 (野兽/物理)
    // Calc: HP(90*1.4*1.2)=151, ATK(18*1.4*1.1*1.0)=27, DEF(4*1.4*0.9*1.0)=5, SPD(10*1.0)=10
    {
        id: "global_minion_1_01", template: "minion", name: "灵噬硕鼠", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        stats: { hp: 151, phy_atk: 27, mag_atk: 2, phy_def: 5, mag_def: 3, speed: 10 },
        money: [20, 50],
        drops: [
            { id: "materials_086", rate: 0.3 },
            { id: "materials_087", rate: 0.1 }
        ],
        skills: [
            { id: "撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "瘟疫飞扑", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "原本只是田间的老鼠，因吞食了灵气倒灌后疯长的谷物，体型暴增如犬。"
    },

    // 2. 爆体残尸 (亡灵/坦克)
    // Calc: HP(90*1.4*1.4)=176, ATK(18*1.4*0.9*0.6)=13, DEF(4*1.4*1.1*1.4)=8, SPD(10*0.8)=8
    {
        id: "global_minion_1_02", template: "minion", name: "爆体残尸", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        stats: { hp: 176, phy_atk: 13, mag_atk: 13, phy_def: 8, mag_def: 7, speed: 8 },
        money: [30, 60],
        drops: [
            { id: "materials_088", rate: 0.2 },
            { id: "materials_089", rate: 0.2 }
        ],
        skills: [
            { id: "无意识抓挠", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "碎骨重击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "承受不住倒灌的灵力而当场爆体身亡的士卒，残破的躯体在灵流的裹挟下行尸走肉般移动。"
    },

    // 3. 狂乱荆棘 (元素/均衡) -> 修正为元素(Elemental) + 均衡(Balance)
    // Calc: HP(90*1.4*0.9)=113, ATK(18*1.4*1.2*0.7)=21, DEF(4*1.4*1.5*0.8)=6, SPD(10*0.9)=9
    {
        id: "global_minion_1_03", template: "minion", name: "狂乱荆棘", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental",
        stats: { hp: 113, phy_atk: 21, mag_atk: 21, phy_def: 6, mag_def: 6, speed: 9 },
        money: [10, 30],
        drops: [
            { id: "materials_090", rate: 0.3 },
            { id: "materials_091", rate: 0.1 }
        ],
        skills: [
            { id: "荆刺抽打", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "死亡绞杀", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "受到狂暴灵力滋养的植物，在一夜之间长出了锯齿般的倒刺，会主动攻击靠近的活物。"
    },

    // 4. 红眼野狗 (野兽/狂暴)
    // Calc: HP(90*1.4*1.2)=151, ATK(18*1.4*1.1*1.3)=36, DEF(4*1.4*0.9*0.5)=2, SPD(10*1.0)=10
    {
        id: "global_minion_1_04", template: "minion", name: "红眼野狗", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        stats: { hp: 151, phy_atk: 36, mag_atk: 5, phy_def: 2, mag_def: 2, speed: 10 },
        money: [20, 50],
        drops: [
            { id: "materials_092", rate: 0.3 },
            { id: "materials_093", rate: 0.2 }
        ],
        skills: [
            { id: "狂犬撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "喉管锁定", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "徘徊在乱葬岗的野狗，因啃食了沾染天人五衰气息的尸体，变得凶残无比。"
    },

    // 5. 失智方士学徒 (人类/纯法)
    // Calc: HP(90*1.4*1.0)=126, ATK(18*1.4*1.0*1.0)=25, DEF(4*1.4*1.0*1.0)=5, SPD(10*1.0)=10
    {
        id: "global_minion_1_05", template: "minion", name: "失智方士学徒", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        stats: { hp: 126, phy_atk: 2, mag_atk: 25, phy_def: 3, mag_def: 5, speed: 10 },
        money: [50, 100],
        drops: [
            { id: "materials_094", rate: 0.3 },
            { id: "materials_095", rate: 0.2 }
        ],
        skills: [
            { id: "紊乱火球", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "灵力自爆", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "看着罗盘指针疯狂旋转而道心崩溃的小方士，口中喃喃自语，胡乱释放着不成型的法术。"
    },
    // 1. 禁军尸长 (亡灵/肉盾)
    // Calc: HP(90*1.4*2.5*1.4)=441, ATK(18*1.4*1.5*0.9*0.6)=20, DEF(4*1.4*2.5*1.1*1.4)=21, SPD((10+2)*0.8)=9
    {
        id: "global_elite_1_01", template: "elite", name: "禁军尸长", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        stats: { hp: 441, phy_atk: 20, mag_atk: 20, phy_def: 21, mag_def: 18, speed: 9 },
        money: [80, 150],
        drops: [
            { id: "weapons_040", rate: 0.2 },
            { id: "materials_096", rate: 0.1 }
        ],
        skills: [
            { id: "生锈铁剑", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "军道杀拳·残", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "尸气威慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "生前是守卫咸阳的百夫长，死后仍紧握着生锈的秦剑，只有杀戮的本能。"
    },

    // 2. 双头变异狼 (野兽/狂暴)
    // Calc: HP(90*1.4*2.5*1.2)=378, ATK(18*1.4*1.5*1.1*1.3)=53, DEF(4*1.4*2.5*0.9*0.5)=7, SPD((10+2)*1.0)=12
    {
        id: "global_elite_1_02", template: "elite", name: "双头变异狼", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        stats: { hp: 378, phy_atk: 53, mag_atk: 8, phy_def: 7, mag_def: 7, speed: 12 },
        money: [60, 120],
        drops: [
            { id: "materials_097", rate: 0.5 },
            { id: "materials_098", rate: 0.2 }
        ],
        skills: [
            { id: "交替撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "双喉锁杀", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "腥臭咆哮", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "灵气让它的颈部裂开，长出了第二颗扭曲的头颅，更加狡诈和残忍。"
    },

    // 3. 灵气乱流聚合体 (元素/纯法)
    // Calc: HP(90*1.4*2.5*0.9)=283, ATK(18*1.4*1.5*1.2*1.0)=45, DEF(4*1.4*2.5*1.5*1.0)=21, SPD((10+2)*0.9)=10
    {
        id: "global_elite_1_03", template: "elite", name: "灵气乱流聚合体", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental",
        stats: { hp: 283, phy_atk: 4, mag_atk: 45, phy_def: 12, mag_def: 21, speed: 10 },
        money: [100, 200],
        drops: [
            { id: "materials_099", rate: 0.3 },
            { id: "materials_100", rate: 0.1 }
        ],
        skills: [
            { id: "灵力火花", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "能量超载", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "磁场紊乱", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "一团不稳定的光球，由浑浊的倒灌灵力凝聚而成，对周围的一切进行无差别的能量轰击。"
    },

    // 4. 暴走木甲兽 (机关/肉盾)
    // Calc: HP(90*1.4*2.5*1.5)=472, ATK(18*1.4*1.5*1.2*0.6)=27, DEF(4*1.4*2.5*1.3*1.4)=25, SPD((10+2)*0.5)=6
    {
        id: "global_elite_1_04", template: "elite", name: "暴走木甲兽", region: "all", spawnType: "all", timeStart: 1,
        subType: "mechanism",
        stats: { hp: 472, phy_atk: 27, mag_atk: 27, phy_def: 25, mag_def: 21, speed: 6 },
        money: [150, 250],
        drops: [
            { id: "materials_101", rate: 0.5 },
            { id: "materials_102", rate: 0.3 }
        ],
        skills: [
            { id: "机械冲撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "过载锯齿", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "排气烟雾", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 3 }
        ],
        desc: "墨家遗留在世俗的耕作机关，核心灵石被狂暴灵气充能后彻底失控。"
    },

    // 5. 走火入魔的散修 (人类/纯法)
    // Calc: HP(90*1.4*2.5*1.0)=315, ATK(18*1.4*1.5*1.0*1.0)=37, DEF(4*1.4*2.5*1.0*1.0)=14, SPD((10+2)*1.0)=12
    {
        id: "global_elite_1_05", template: "elite", name: "走火入魔的散修", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        stats: { hp: 315, phy_atk: 3, mag_atk: 37, phy_def: 8, mag_def: 14, speed: 12 },
        money: [200, 300],
        drops: [
            { id: "book_cultivation_r1_00_full", rate: 0.1 },
        ],
        skills: [
            { id: "逆行经脉指", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "精血燃爆", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "癫狂笑声", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "贪婪吸纳浑浊灵气而导致经脉逆行的修道者，虽然神智不清，但法力却异常狂暴。"
    },
    // 1. 守陵尸将 (亡灵/肉盾) - 秦皇陵外围苏醒的守卫
    // Calc:
    // HP: 756 * 1.4(Race) * 1.4(Tend) = 1481
    // ATK: 63 * 0.9(Race) * 0.6(Tend) = 34 (Phy/Mag)
    // DEF: 22 * 1.1(Race) * 1.4(Tend) = 33 (Phy), MagDef略低
    // SPD: 15 * 0.8(Race) = 12
    {
        id: "global_boss_1_01", template: "boss", name: "守陵尸将", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        stats: { hp: 1481, phy_atk: 34, mag_atk: 20, phy_def: 33, mag_def: 28, speed: 12 },
        money: [300, 500],
        drops: [
            { id: "materials_103", rate: 0.1 },
            { id: "materials_104", rate: 0.5 },
            { id: "materials_105", rate: 0.3 }
        ],
        skills: [
            // [Boss规则] 1低 1高 1很高 1Debuff 1Buff
            { id: "横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "跳劈", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "亡灵旋风斩", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "尸气压制", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "亡者坚韧", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "虽然已经腐烂，但生前作为秦军锐士的战斗本能依然保留，誓死守护陵寝禁地。"
    },

    // 2. 变异食人花王 (元素/法师) - 吸收灵气狂暴化的植物
    // Calc:
    // HP: 756 * 0.9(Race) * 1.0(Tend) = 680
    // ATK: 63 * 1.2(Race) * 1.0(Tend) = 75 (Mag)
    // DEF: 22 * 1.5(Race) * 0.6(Tend) = 19 (Phy), MagDef高
    // SPD: 15 * 0.9(Race) = 13
    {
        id: "global_boss_1_02", template: "boss", name: "变异食人花王", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental",
        stats: { hp: 680, phy_atk: 10, mag_atk: 75, phy_def: 19, mag_def: 33, speed: 13 },
        money: [250, 450],
        drops: [
            { id: "materials_106", rate: 0.1 },
            { id: "materials_107", rate: 0.4 },
            { id: "materials_108", rate: 0.4 }
        ],
        skills: [
            { id: "酸液喷吐", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "根须穿刺", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "灵能消化液", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "麻痹花粉", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "光合再生", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 } // 回血
        ],
        desc: "原本是御花园中的观赏花卉，在灵气倒灌的那一刻吞噬了负责照料它的花匠，品尝到了血肉的滋味。"
    },

    // 3. 血煞狼王 (野兽/刺客) - 荒野中变异的狼群首领
    // Calc:
    // HP: 756 * 1.2(Race) * 1.0(Tend) = 907
    // ATK: 63 * 1.1(Race) * 1.3(Tend) = 90 (Phy)
    // DEF: 22 * 0.9(Race) * 0.5(Tend) = 9 (脆皮)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_1_03", template: "boss", name: "血煞狼王", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        stats: { hp: 907, phy_atk: 90, mag_atk: 15, phy_def: 9, mag_def: 9, speed: 15 },
        money: [200, 400],
        drops: [
            { id: "materials_109", rate: 0.1 },
            { id: "materials_110", rate: 0.5 },
            { id: "materials_111", rate: 0.4 }
        ],
        skills: [
            { id: "迅猛撕咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "血喉锁杀", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "月下狂袭", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "恐惧嚎叫", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "嗜血本能", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "沐浴了带有神魔怨念的灵雨，体型比普通老虎还要巨大，双眼透着诡异的血光。"
    },

    // 4. 癫狂炼丹师 (人类/均衡) - 嗑药过度的方士
    // Calc:
    // HP: 756 * 1.0(Race) * 1.0(Tend) = 756
    // ATK: 63 * 1.0(Race) * 0.7(Tend) = 44 (双修)
    // DEF: 22 * 1.0(Race) * 0.8(Tend) = 17
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_1_04", template: "boss", name: "癫狂炼丹师", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        stats: { hp: 756, phy_atk: 44, mag_atk: 44, phy_def: 17, mag_def: 17, speed: 15 },
        money: [400, 600],
        drops: [
            { id: "materials_112", rate: 0.1 },
            { id: "materials_113", rate: 0.4 },
            { id: "materials_114", rate: 0.3 }
        ],
        skills: [
            { id: "投掷毒丹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "掌心雷", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "丹炉爆炸", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 }, // 物理伤害
            { id: "药力紊乱", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 },
            { id: "透支潜能", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 }
        ],
        desc: "为了追求长生，不惜吞服了大量用变异材料炼制的丹药，虽然获得了力量，但也彻底疯了。"
    },

    // 5. 墨家攻城兽·破 (机关/物理) - 物理面板怪
    // Calc:
    // HP: 756 * 1.5(Race) * 1.0(Tend) = 1134
    // ATK: 63 * 1.2(Race) * 1.0(Tend) = 75 (Phy)
    // DEF: 22 * 1.3(Race) * 1.0(Tend) = 28
    // SPD: 15 * 0.5(Race) = 7 (极慢)
    {
        id: "global_boss_1_05", template: "boss", name: "墨家攻城兽·破", region: "all", spawnType: "all", timeStart: 1,
        subType: "mechanism",
        stats: { hp: 1134, phy_atk: 75, mag_atk: 10, phy_def: 28, mag_def: 15, speed: 7 },
        money: [350, 550],
        drops: [
            { id: "materials_115", rate: 0.1 },
            { id: "materials_116", rate: 0.5 },
            { id: "materials_117", rate: 0.3 }
        ],
        skills: [
            { id: "巨臂横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "攻城锤击", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "超载碾压", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "震荡波", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "铜墙铁壁", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "原本沉睡在秦军武库中的战争机器，因灵石核心吸纳了过量的暴躁灵气而自动启动，敌我不分。"
    },
    // 1. 秦陵守灵人 - 亡灵/肉盾 (Undead Tank)
    // Calc:
    // HP: 1512 * 1.4(Race) * 1.4(Tend) = 2963 (极厚)
    // ATK: 88 * 0.9(Race) * 0.6(Tend) = 47 (较低)
    // DEF: 33 * 1.1(Race) * 1.4(Tend) = 50 (极硬)
    // SPD: 15 * 0.8(Race) = 12
    {
        id: "global_lord_1_01", template: "lord", name: "秦陵守灵人", region: "all", spawnType: "all", timeStart: 1,
        subType: "undead",
        stats: { hp: 2963, phy_atk: 47, mag_atk: 20, phy_def: 50, mag_def: 40, speed: 12 },
        money: [200, 500],
        drops: [
            { id: "materials_118", rate: 0.1 },
            { id: "body_195", rate: 0.1 },
            { id: "materials_119", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "重剑横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "镇墓一击", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "大秦军阵·破", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "天子守陵斩", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 }, // 必杀

            // 2个Debuff
            { id: "皇陵威压", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "尸毒攻心", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // HP Burn 2%

            // 2个Buff
            { id: "不动如山", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "地脉护体", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // HP Regen 2%
        ],
        desc: "【领主】始皇陵最外层的守护者，本是活人殉葬，在灵气倒灌后化为不死的尸将，肉体坚硬如铁。"
    },

    // 2. 墨家巨灵神 - 机关/物理 (Mechanism Phy)
    // Calc:
    // HP: 1512 * 1.5(Race) * 1.0(Tend) = 2268
    // ATK: 88 * 1.2(Race) * 1.0(Tend) = 105 (高物攻)
    // DEF: 33 * 1.3(Race) * 1.0(Tend) = 42
    // SPD: 15 * 0.5(Race) = 7 (极慢)
    {
        id: "global_lord_1_02", template: "lord", name: "墨家巨灵神", region: "all", spawnType: "all", timeStart: 1,
        subType: "mechanism",
        stats: { hp: 2268, phy_atk: 105, mag_atk: 10, phy_def: 42, mag_def: 25, speed: 7 },
        money: [200, 500],
        drops: [
            { id: "materials_120", rate: 0.1 },
            { id: "materials_121", rate: 0.2 },
            { id: "materials_122", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "巨臂碾压", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "火箭飞拳", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "千斤坠", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "非攻·墨子悲歌", rate: 0.025, type: 1, damage: 6.0, damageType: "phy", dmgValType: 1 }, // 极高倍率

            // 2个Debuff
            { id: "震耳轰鸣", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 }, // 震碎法防
            { id: "重力场", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 }, // 持续减速

            // 2个Buff
            { id: "装甲强化", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "核心过载", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】墨家为了对抗暴秦而制造的终极兵器，却在完工之日失控，成为不知疲倦的杀戮机器。"
    },

    // 3. 炼丹大宗师 - 人类/法师 (Human Mag)
    // Calc:
    // HP: 1512 * 1.0(Race) * 1.0(Tend) = 1512
    // ATK: 88 * 1.0(Race) * 1.0(Tend) = 88 (纯法攻)
    // DEF: 33 * 1.0(Race) * 0.6(Tend) = 19 (脆皮)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_lord_1_03", template: "lord", name: "炼丹大宗师", region: "all", spawnType: "all", timeStart: 1,
        subType: "human",
        stats: { hp: 1512, phy_atk: 10, mag_atk: 88, phy_def: 19, mag_def: 45, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "pills_r6_008", rate: 0.05 },
            { id: "materials_123", rate: 0.1 },
            { id: "materials_124", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "三昧真火", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "五雷正法", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "丹火焚天", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "长生诀·逆炼", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 }, // 法术核弹

            // 2个Debuff
            { id: "神魂颠倒", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 },
            { id: "药毒入体", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // HP Burn 2%

            // 2个Buff
            { id: "灵气护盾", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "狂暴药力", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】曾是秦皇最信任的方士，在灵气复苏时妄图强行飞升，结果走火入魔，法力却因此暴涨。"
    },

    // 4. 吞天巴蛇 - 野兽/均衡 (Beast Balance)
    // Calc:
    // HP: 1512 * 1.2(Race) * 1.0(Tend) = 1814
    // ATK: 88 * 1.1(Race) * 0.7(Tend) = 67 (双修，偏低但均衡)
    // DEF: 33 * 0.9(Race) * 0.8(Tend) = 23 (略脆)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_lord_1_04", template: "lord", name: "吞天巴蛇", region: "all", spawnType: "all", timeStart: 1,
        subType: "beast",
        stats: { hp: 1814, phy_atk: 67, mag_atk: 67, phy_def: 23, mag_def: 23, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "materials_125", rate: 0.1 },
            { id: "materials_126", rate: 0.3 },
            { id: "weapons_965", rate: 0.1 }
        ],
        skills: [
            // 4个伤害 (混合)
            { id: "巨尾横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "毒雾喷吐", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "死亡缠绕", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "人心不足蛇吞象", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // 2个Debuff
            { id: "剧毒麻痹", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "消化酸液", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // HP Burn 2%

            // 2个Buff
            { id: "鳞片硬化", rate: 0.06, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "蜕皮重生", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // HP Regen 2%
        ],
        desc: "【领主】上古异兽巴蛇的后裔，在灵雨的滋润下血脉返祖，体型巨大，据说能吞下整座山头。"
    },

    // 5. 祖龙残魂 - 元素/法师 (Elemental Mag)
    // Calc:
    // HP: 1512 * 0.9(Race) * 1.0(Tend) = 1360 (稍脆)
    // ATK: 88 * 1.2(Race) * 1.0(Tend) = 105 (极高法攻)
    // DEF: 33 * 1.5(Race) * 0.6(Tend) = 29 (Phy), MagDef极高
    // SPD: 15 * 0.9(Race) = 13
    {
        id: "global_lord_1_05", template: "lord", name: "祖龙残魂", region: "all", spawnType: "all", timeStart: 1,
        subType: "elemental",
        stats: { hp: 1360, phy_atk: 20, mag_atk: 105, phy_def: 29, mag_def: 45, speed: 13 },
        money: [200, 500],
        drops: [
            { id: "传国玉玺(伪)", rate: 0.05 },
            { id: "龙魂晶石", rate: 0.2 },
            { id: "帝王之气", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "龙威震慑", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "黑龙吐息", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "大秦国运·崩", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "千古一帝·寂灭", rate: 0.025, type: 1, damage: 6.0, damageType: "mag", dmgValType: 1 }, // 6.0倍必杀

            // 2个Debuff
            { id: "帝王凝视", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "灵魂凋零", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 强力Burn

            // 2个Buff
            { id: "真龙护体", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "龙脉汲取", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】始皇帝死后，其不灭的执念与溃散的大秦国运结合，化作了这道徘徊在九州上空的黑色龙影。"
    }

];

const enemies_2=[
// 1. 血目魔兵 (亡灵/物理) - 被血阵侵蚀的秦军卫士
    // Calc: HP(162*1.4)=226, ATK(32*0.9)=28, DEF(7*1.1)=8, SPD(10*0.8)=8
    {
        id: "global_minion_2_01", template: "minion", name: "血目魔兵", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 226, phy_atk: 28, mag_atk: 5, phy_def: 8, mag_def: 6, speed: 8 },
        money: [40, 80],
        drops: [
            { id: "沾血的秦甲碎片", rate: 0.3 },
            { id: "断裂的长戈", rate: 0.1 }
        ],
        skills: [
            { id: "僵硬突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "嗜血斩击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "原本是守卫皇宫的卫士，被赵高的炼血阵抽干了神智，双目流血，见人就杀。"
    },

    // 2. 怨气宫女 (亡灵/法术) - 惨死在血祭中的宫女
    // Calc: HP(162*1.4)=226, ATK(32*0.9)=28, DEF(7*1.1)=8, SPD(10*0.8)=8
    // Tendency: Mag (法攻高，物防低)
    {
        id: "global_minion_2_02", template: "minion", name: "怨气宫女", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 226, phy_atk: 3, mag_atk: 28, phy_def: 5, mag_def: 8, speed: 8 },
        money: [40, 80],
        drops: [
            { id: "破碎的宫廷玉佩", rate: 0.2 },
            { id: "染血的丝绸", rate: 0.3 }
        ],
        skills: [
            { id: "怨念尖叫", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "鬼爪索命", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "在杜邮惨案中被无辜处死的宫女，死后怨气不散，化作厉鬼徘徊在废墟之上。"
    },

    // 3. 嗜血魔蝠 (昆虫/物理) - 吸收了血云气息的蝙蝠
    // 注：使用 insect 模板模拟飞行生物的高速脆皮特性
    // Calc: HP(162*0.7)=113, ATK(32*1.1)=35, DEF(7*0.8)=5, SPD(10*1.3)=13
    {
        id: "global_minion_2_03", template: "minion", name: "嗜血魔蝠", region: "all", spawnType: "all", timeStart: 2,
        subType: "insect", // 借用insect的高速低血模板
        stats: { hp: 113, phy_atk: 35, mag_atk: 5, phy_def: 5, mag_def: 4, speed: 13 },
        money: [30, 60],
        drops: [
            { id: "蝙蝠翼", rate: 0.3 },
            { id: "微量毒血", rate: 0.2 }
        ],
        skills: [
            { id: "超声音波", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "吸血獠牙", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "原本只是普通的蝙蝠，因长期沐浴在咸阳上空的血云中，体型变大，极度渴望鲜血。"
    },

    // 4. 食尸秃鹫 (野兽/物理) - 啃食乱葬岗尸体的猛禽
    // Calc: HP(162*1.2)=194, ATK(32*1.1)=35, DEF(7*0.9)=6, SPD(10*1.0)=10
    {
        id: "global_minion_2_04", template: "minion", name: "食尸秃鹫", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast",
        stats: { hp: 194, phy_atk: 35, mag_atk: 5, phy_def: 6, mag_def: 4, speed: 10 },
        money: [35, 70],
        drops: [
            { id: "秃鹫羽毛", rate: 0.3 },
            { id: "腐烂的肉块", rate: 0.2 }
        ],
        skills: [
            { id: "俯冲啄击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "撕裂腐肉", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "二世屠杀皇族与大臣后，尸体堆积如山，引来了无数秃鹫，它们吃多了含怨的血肉，也变得极具攻击性。"
    },

    // 5. 失败的炼尸学徒 (人类/法术) - 模仿赵高邪术的投机者
    // Calc: HP(162*1.0)=162, ATK(32*1.0)=32, DEF(7*1.0)=7, SPD(10*1.0)=10
    {
        id: "global_minion_2_05", template: "minion", name: "失败的炼尸学徒", region: "all", spawnType: "all", timeStart: 2,
        subType: "human",
        stats: { hp: 162, phy_atk: 5, mag_atk: 32, phy_def: 5, mag_def: 7, speed: 10 },
        money: [60, 120],
        drops: [
            { id: "低级尸油", rate: 0.3 },
            { id: "控尸铃(伪)", rate: 0.1 }
        ],
        skills: [
            { id: "尸毒掌", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "召唤尸虫", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "看到赵高得势，许多心术不正之徒试图修炼尸道，结果往往因为控制不住尸气而把自己练得人不人鬼不鬼。"
    },
    // 1. 血甲斩首官 (亡灵/肉盾) - 负责行刑的秦军军官，被怨气反噬
    // Calc: HP(405*1.4)=567, ATK(48*0.9*0.6)=26, DEF(18*1.1*1.4)=27, SPD(12*0.8)=9
    {
        id: "global_elite_2_01", template: "elite", name: "血甲斩首官", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 567, phy_atk: 26, mag_atk: 5, phy_def: 27, mag_def: 23, speed: 9 },
        money: [120, 200],
        drops: [
            { id: "行刑者的鬼头刀", rate: 0.1 },
            { id: "沾血的腰牌", rate: 0.5 }
        ],
        skills: [
            { id: "沉重斩击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "处决断头", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "血腥威慑", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "生前在杜邮亲手斩杀了无数皇族子弟，死后被怨魂缠绕，盔甲上流淌着永不干涸的鲜血。"
    },

    // 2. 堕落的司天监 (人类/法师) - 主持血祭仪式的方士
    // Calc: HP(405*1.0)=405, ATK(48*1.0*1.0)=48, DEF(18*1.0*1.0)=18, SPD(12*1.0)=12
    // Tendency: Mag (P.Def 0.6 -> 10)
    {
        id: "global_elite_2_02", template: "elite", name: "堕落的司天监", region: "all", spawnType: "all", timeStart: 2,
        subType: "human",
        stats: { hp: 405, phy_atk: 5, mag_atk: 48, phy_def: 10, mag_def: 18, speed: 12 },
        money: [150, 250],
        drops: [
            { id: "血祭阵图(残)", rate: 0.2 },
            { id: "污秽的灵石", rate: 0.3 }
        ],
        skills: [
            { id: "血煞咒", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "冤魂引爆", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "神智侵蚀", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "为了讨好秦二世而布置‘绝户炼血阵’的官员，最终自己也被阵法反噬，沦为血魔的傀儡。"
    },

    // 3. 御苑变异猛虎 (野兽/刺客) - 皇家园林中的猛兽
    // Calc: HP(405*1.2)=486, ATK(48*1.1*1.3)=68, DEF(18*0.9*0.5)=8, SPD(12*1.0)=12
    {
        id: "global_elite_2_03", template: "elite", name: "御苑变异猛虎", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast",
        stats: { hp: 486, phy_atk: 68, mag_atk: 10, phy_def: 8, mag_def: 8, speed: 12 },
        money: [100, 180],
        drops: [
            { id: "斑斓虎皮", rate: 0.4 },
            { id: "虎骨", rate: 0.3 }
        ],
        skills: [
            { id: "扑杀", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "锁喉撕咬", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "虎啸山林", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "秦二世圈养在皇家御苑中的猛虎，吞食了大量被处死的宫人尸体后，皮毛变成了暗红色。"
    },

    // 4. 青铜血俑 (机关/肉盾) - 被血祭唤醒的陪葬品
    // Calc: HP(405*1.5)=607, ATK(48*1.2*0.6)=34, DEF(18*1.3*1.4)=32, SPD(12*0.5)=6
    {
        id: "global_elite_2_04", template: "elite", name: "青铜血俑", region: "all", spawnType: "all", timeStart: 2,
        subType: "mechanism",
        stats: { hp: 607, phy_atk: 34, mag_atk: 5, phy_def: 32, mag_def: 28, speed: 6 },
        money: [180, 280],
        drops: [
            { id: "青铜核心", rate: 0.2 },
            { id: "凝固的血块", rate: 0.3 }
        ],
        skills: [
            { id: "铜臂挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "千钧重踏", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "血气弥漫", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "原本是死物，被咸阳城冲天的血气强行灌注了灵性，青铜外壳下流淌着像血管一样的红光。"
    },

    // 5. 厉鬼夫人 (亡灵/法师) - 怨念极深的皇族女眷
    // Calc: HP(405*1.4)=567, ATK(48*0.9*1.0)=43, DEF(18*1.1*1.0)=20, SPD(12*0.8)=9
    // Tendency: Mag (P.Def 0.6 -> 12)
    {
        id: "global_elite_2_05", template: "elite", name: "厉鬼夫人", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 567, phy_atk: 5, mag_atk: 43, phy_def: 12, mag_def: 20, speed: 9 },
        money: [150, 250],
        drops: [
            { id: "染血的金钗", rate: 0.1 },
            { id: "怨灵之尘", rate: 0.4 }
        ],
        skills: [
            { id: "阴风爪", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "夺魄尖啸", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "诅咒凝视", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "hp", debuffTimes: 3 } // 尝试削减HP上限或直接Debuff
        ],
        desc: "生前是地位显赫的皇族夫人，死得极其凄惨，如今在宫墙外游荡，寻找替死鬼。"
    },
    // 1. 杜邮行刑官 (亡灵/肉盾) - 杜邮惨案的执行者
    // Calc:
    // HP: 972 * 1.4(Race) * 1.4(Tend) = 1905 (极高血量)
    // ATK: 81 * 0.9(Race) * 0.6(Tend) = 44 (攻击较低)
    // DEF: 29 * 1.1(Race) * 1.4(Tend) = 45 (极高物防)
    // SPD: 15 * 0.8(Race) = 12
    {
        id: "global_boss_2_01", template: "boss", name: "杜邮行刑官", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 1905, phy_atk: 44, mag_atk: 20, phy_def: 45, mag_def: 38, speed: 12 },
        money: [400, 600],
        drops: [
            { id: "行刑者的巨斧", rate: 0.1 },
            { id: "染血的重甲片", rate: 0.5 },
            { id: "怨魂结晶", rate: 0.3 }
        ],
        skills: [
            { id: "横劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "断头台", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "血腥处决", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "死亡凝视", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "血肉硬化", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "在杜邮亲手肢解了数位皇子的刽子手，死后与受害者的怨念融为一体，变成了一具不知疲倦的杀人机器。"
    },

    // 2. 炼血妖道 (人类/法师) - 赵高的爪牙
    // Calc:
    // HP: 972 * 1.0(Race) * 1.0(Tend) = 972
    // ATK: 81 * 1.0(Race) * 1.0(Tend) = 81 (纯法攻)
    // DEF: 29 * 1.0(Race) * 0.6(Tend) = 17 (脆皮)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_2_02", template: "boss", name: "炼血妖道", region: "all", spawnType: "all", timeStart: 2,
        subType: "human",
        stats: { hp: 972, phy_atk: 10, mag_atk: 81, phy_def: 17, mag_def: 29, speed: 15 },
        money: [500, 700],
        drops: [
            { id: "人血馒头", rate: 0.4 },
            { id: "妖道法剑", rate: 0.1 },
            { id: "邪恶阵图", rate: 0.2 }
        ],
        skills: [
            { id: "血箭", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "化血大法", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "血海滔天", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "血液沸腾", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 3 }, // DoT
            { id: "借命术", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 } // 回血
        ],
        desc: "投靠赵高的方士，协助布置了覆盖咸阳的‘绝户炼血阵’，以生灵精血修炼邪术。"
    },

    // 3. 泣血公主 (亡灵/法师) - 皇室怨灵的集合体
    // Calc:
    // HP: 972 * 1.4(Race) * 1.0(Tend) = 1360
    // ATK: 81 * 0.9(Race) * 1.0(Tend) = 73 (法攻较高)
    // DEF: 29 * 1.1(Race) * 1.0(Tend) = 32 (双抗均衡)
    // SPD: 15 * 0.8(Race) = 12
    {
        id: "global_boss_2_03", template: "boss", name: "泣血公主", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 1360, phy_atk: 10, mag_atk: 73, phy_def: 20, mag_def: 32, speed: 12 },
        money: [450, 650],
        drops: [
            { id: "染血的玉簪", rate: 0.2 },
            { id: "皇室丝绸", rate: 0.3 },
            { id: "怨灵之泪", rate: 0.1 }
        ],
        skills: [
            { id: "悲鸣", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "九幽阴风", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "绝户诅咒", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "皇室威仪·堕", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 },
            { id: "怨念护盾", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 }
        ],
        desc: "始皇最宠爱的女儿，被胡亥处死后肢解。她滔天的怨恨凝聚不散，化作了凄厉的红衣厉鬼。"
    },

    // 4. 尸肉巨兽 (野兽/肉盾) - 吞食尸体变异的看门犬
    // Calc:
    // HP: 972 * 1.2(Race) * 1.4(Tend) = 1633
    // ATK: 81 * 1.1(Race) * 0.6(Tend) = 53
    // DEF: 29 * 0.9(Race) * 1.4(Tend) = 36
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_2_04", template: "boss", name: "尸肉巨兽", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast",
        stats: { hp: 1633, phy_atk: 53, mag_atk: 10, phy_def: 36, mag_def: 26, speed: 15 },
        money: [350, 550],
        drops: [
            { id: "巨大的犬牙", rate: 0.2 },
            { id: "变异兽皮", rate: 0.4 },
            { id: "腐烂的内丹", rate: 0.1 }
        ],
        skills: [
            { id: "野蛮冲撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "暴食撕咬", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "尸山压顶", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "腐臭气体", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 3 },
            { id: "快速愈合", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 }
        ],
        desc: "原本是负责看守刑场的恶犬，因为吞食了太多含有灵气和怨念的尸块，体型膨胀成了肉山怪物。"
    },

    // 5. 处刑机关人 (机关/物理) - 墨家机关被血气污染
    // Calc:
    // HP: 972 * 1.5(Race) * 1.0(Tend) = 1458
    // ATK: 81 * 1.2(Race) * 1.0(Tend) = 97 (高物攻)
    // DEF: 29 * 1.3(Race) * 1.0(Tend) = 38
    // SPD: 15 * 0.5(Race) = 7
    {
        id: "global_boss_2_05", template: "boss", name: "处刑机关人", region: "all", spawnType: "all", timeStart: 2,
        subType: "mechanism",
        stats: { hp: 1458, phy_atk: 97, mag_atk: 5, phy_def: 38, mag_def: 25, speed: 7 },
        money: [400, 600],
        drops: [
            { id: "机关齿轮", rate: 0.4 },
            { id: "青铜处刑刃", rate: 0.1 },
            { id: "血色灵石", rate: 0.2 }
        ],
        skills: [
            { id: "旋刃斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "死亡穿刺", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "绞肉风暴", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "锯齿创伤", rate: 0.1, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 3 }, // 流血
            { id: "超频运作", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 3 }
        ],
        desc: "原本用于修建陵墓的工程机关，被血祭阵法强行篡改了核心指令，双臂被改装成了巨大的处刑刀刃。"
    },
    // 1. 始皇长子·扶苏(怨魂) - 亡灵/法师 (Undead Mag)
    // 设定：本应继位的仁君，被赐死后冤魂不散，在灵气复苏中化为顶级鬼王。
    // Calc:
    // HP: 1944 * 1.4(Race) * 1.0(Tend) = 2721 (高血亡灵)
    // ATK: 113 * 0.9(Race) * 1.0(Tend) = 101 (纯法攻)
    // DEF: 43 * 1.1(Race) * 0.6(Tend) = 28 (物防低)
    // SPD: 15 * 0.8(Race) = 12
    {
        id: "global_lord_2_01", template: "lord", name: "始皇长子·扶苏", region: "all", spawnType: "all", timeStart: 2,
        subType: "undead",
        stats: { hp: 2721, phy_atk: 10, mag_atk: 101, phy_def: 28, mag_def: 47, speed: 12 },
        money: [200, 500],
        drops: [
            { id: "仁君的断剑", rate: 0.1 },
            { id: "怨恨灵珠", rate: 0.5 },
            { id: "皇子玉佩", rate: 0.3 }
        ],
        skills: [
            // 4个伤害
            { id: "仁道崩塌", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "阴魂索命", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "上郡悲歌", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "皇天后土·皆杀", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 }, // 必杀

            // 2个Debuff
            { id: "帝王怨气", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 }, // 大幅降攻
            { id: "七窍流血", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 2% HP Burn

            // 2个Buff
            { id: "鬼王之躯", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "亡灵意志", rate: 0.02, type: 3, buffValue: 0.04, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // 2% HP Regen
        ],
        desc: "【领主】曾是帝国未来的希望，死于矫诏。如今他满怀对胡亥与赵高的恨意归来，要让整个咸阳为他陪葬。"
    },

    // 2. 绝户阵眼·血魔赵高(分身) - 人类/法师 (Human Mag)
    // 设定：赵高利用绝户炼血阵凝聚的法相分身，操控着京师的血气。
    // Calc:
    // HP: 1944 * 1.0 * 1.0 = 1944
    // ATK: 113 * 1.0 * 1.0 = 113 (极高法伤)
    // DEF: 43 * 1.0 * 0.6 = 25 (极脆)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_2_02", template: "lord", name: "血魔赵高(分身)", region: "all", spawnType: "all", timeStart: 2,
        subType: "human",
        stats: { hp: 1944, phy_atk: 10, mag_atk: 113, phy_def: 25, mag_def: 43, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "指鹿为马图", rate: 0.1 },
            { id: "中车府令印", rate: 0.2 },
            { id: "血魔精华", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "血手印", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "指鹿为马", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 }, // 精神攻击
            { id: "绝户煞气", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "沙丘之谋·篡国", rate: 0.025, type: 1, damage: 5.8, damageType: "mag", dmgValType: 1 }, // 极高单体爆发

            // 2个Debuff
            { id: "权倾朝野", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 }, // 剥夺法抗
            { id: "血祭反噬", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 强力流血

            // 2个Buff
            { id: "血影遁", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "窃国气运", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】大秦帝国的掘墓人，通过‘绝户炼血阵’窃取了无数皇族精血，其实力已半只脚踏入魔道。"
    },

    // 3. 镇国神兽·血麒麟 - 野兽/刺客 (Beast Assassin)
    // 设定：大秦祥瑞被血气污染，堕落为杀戮魔兽。
    // Calc:
    // HP: 1944 * 1.2 * 1.0 = 2332
    // ATK: 113 * 1.1 * 1.3 = 161 (TimeStart2 阶段的物理天花板)
    // DEF: 43 * 0.9 * 0.5 = 19 (玻璃大炮)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_2_03", template: "lord", name: "镇国神兽·血麒麟", region: "all", spawnType: "all", timeStart: 2,
        subType: "beast",
        stats: { hp: 2332, phy_atk: 161, mag_atk: 20, phy_def: 19, mag_def: 19, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "血麒麟之角", rate: 0.1 },
            { id: "血色鳞片", rate: 0.4 },
            { id: "祥瑞(堕)内丹", rate: 0.2 }
        ],
        skills: [
            // 4个伤害
            { id: "血蹄践踏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "魔角突刺", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "瑞兽之怒", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "天罚·血雷降世", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },

            // 2个Debuff
            { id: "凶威", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 }, // 破甲
            { id: "厄运缠身", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },

            // 2个Buff
            { id: "疾风迅雷", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 },
            { id: "嗜血狂暴", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】原本是守卫咸阳宫的祥瑞石像，在血祭之夜活了过来，全身鳞片赤红如血，所过之处灾厄丛生。"
    },

    // 4. 刑徒领袖·章邯(魔化) - 人类/坦克 (Human Tank)
    // 设定：章邯为了镇压起义，不得不借助魔道力量强化刑徒军，自身也开始魔化。
    // Calc:
    // HP: 1944 * 1.0 * 1.0 = 1944
    // ATK: 113 * 1.0 * 0.6 = 67 (攻击一般)
    // DEF: 43 * 1.0 * 1.4 = 60 (物防极高)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_2_04", template: "lord", name: "魔化上将军·章邯", region: "all", spawnType: "all", timeStart: 2,
        subType: "human",
        stats: { hp: 1944, phy_atk: 67, mag_atk: 40, phy_def: 60, mag_def: 51, speed: 15 },
        money: [200, 500],
        drops: [
            { id: "少府将军令", rate: 0.1 },
            { id: "魔化秦甲", rate: 0.3 },
            { id: "刑徒镣铐", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "刑徒剑法", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "镇压乱党", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "骊山崩塌", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "最后的名将·死守", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // 2个Debuff
            { id: "军威压制", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "绝望囚笼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // 2个Buff
            { id: "不动如山", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "绝境逢生", rate: 0.02, type: 3, buffValue: 0.06, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // 回血
        ],
        desc: "【领主】大秦最后的名将，为了挽救危局，不惜修炼禁术，将七十万骊山刑徒炼制成了半人半魔的军队。"
    },

    // 5. 十二金人·杀戮令(残) - 机关/坦克 (Mechanism Tank)
    // 设定：收天下之兵铸造的金人，被激活了杀戮指令。
    // Calc:
    // HP: 1944 * 1.5 * 1.0 = 2916 (血牛)
    // ATK: 113 * 1.2 * 0.6 = 81
    // DEF: 43 * 1.3 * 1.4 = 78 (物理铁板)
    // SPD: 15 * 0.5 = 7 (极慢)
    {
        id: "global_lord_2_05", template: "lord", name: "十二金人·杀戮令", region: "all", spawnType: "all", timeStart: 2,
        subType: "mechanism",
        stats: { hp: 2916, phy_atk: 81, mag_atk: 10, phy_def: 78, mag_def: 67, speed: 7 },
        money: [200, 500],
        drops: [
            { id: "金人核心碎片", rate: 0.1 },
            { id: "未知的合金", rate: 0.5 },
            { id: "巨型兵器残骸", rate: 0.3 }
        ],
        skills: [
            // 4个伤害
            { id: "巨足践踏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "兵戈横扫", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "金属风暴", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "天下一统·镇杀", rate: 0.025, type: 1, damage: 5.5, damageType: "phy", dmgValType: 1 },

            // 2个Debuff
            { id: "震地波", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 }, // 强力减速
            { id: "重金属中毒", rate: 0.02, type: 2, debuffValue: 0.05, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 毒伤

            // 2个Buff
            { id: "金石之躯", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }, // 极致物防
            { id: "自我修复", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // 回血
        ],
        desc: "【领主】始皇帝收天下兵锋铸造的十二座巨型金人之一，因灵气复苏而启动，执行着‘毁灭一切活物’的错误指令。"
    }
];

const enemies_3=[
// 1. 揭竿义军 (人类/物理) - 沐浴灵雨后力大无穷的农夫
    // Calc: HP(198*1.0)=198, ATK(40*1.0)=40, DEF(9*1.0)=9, SPD(10*1.0)=10
    {
        id: "global_minion_3_01", template: "minion", name: "揭竿义军", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 198, phy_atk: 40, mag_atk: 5, phy_def: 9, mag_def: 6, speed: 10 },
        money: [50, 100],
        drops: [
            { id: "折断的木棍", rate: 0.3 },
            { id: "破旧的粗布衣", rate: 0.2 }
        ],
        skills: [
            { id: "斩木为兵", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "草莽怒吼", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "大泽乡起义的先锋，沐浴了含有灵气的暴雨后，原本瘦弱的身体爆发出了撕裂虎豹的力量。"
    },

    // 2. 泥沼毒蟾 (野兽/肉盾) - 大泽乡沼泽中的变异生物
    // Calc: HP(198*1.2)=237, ATK(40*1.1*0.6)=26, DEF(9*0.9*1.4)=11, SPD(10*1.0)=10
    {
        id: "global_minion_3_02", template: "minion", name: "泥沼毒蟾", region: "all", spawnType: "all", timeStart: 3,
        subType: "beast",
        stats: { hp: 237, phy_atk: 26, mag_atk: 10, phy_def: 11, mag_def: 8, speed: 10 },
        money: [40, 80],
        drops: [
            { id: "蟾蜍毒液", rate: 0.3 },
            { id: "湿滑的皮", rate: 0.2 }
        ],
        skills: [
            { id: "毒舌鞭挞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "腐蚀粘液", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "潜伏在泥泞中的巨大蟾蜍，背上的毒瘤因为吸收了灵雨而散发着奇异的紫光。"
    },

    // 3. 灵雨水精 (元素/法师) - 雨水与灵气结合的产物
    // Calc: HP(198*0.9)=178, ATK(40*1.2)=48, DEF(9*1.5*0.6)=8, SPD(10*0.9)=9
    // Tendency: Mag
    {
        id: "global_minion_3_03", template: "minion", name: "灵雨水精", region: "all", spawnType: "all", timeStart: 3,
        subType: "elemental",
        stats: { hp: 178, phy_atk: 5, mag_atk: 48, phy_def: 8, mag_def: 12, speed: 9 },
        money: [60, 120],
        drops: [
            { id: "纯净水元", rate: 0.3 },
            { id: "灵雨露珠", rate: 0.2 }
        ],
        skills: [
            { id: "水弹冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "窒息包裹", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "那场奇异暴雨落地后并未渗入泥土，而是聚集成形，产生了朦胧的自我意识。"
    },

    // 4. 龙化草寇 (人类/狂暴) - 强行吸收气运导致半兽化的强盗
    // Calc: HP(198*1.0)=198, ATK(40*1.0*1.3)=52, DEF(9*1.0*0.5)=4, SPD(10*1.0)=10
    {
        id: "global_minion_3_04", template: "minion", name: "龙化草寇", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 198, phy_atk: 52, mag_atk: 5, phy_def: 4, mag_def: 4, speed: 10 },
        money: [70, 140],
        drops: [
            { id: "长满鳞片的手臂", rate: 0.1 },
            { id: "抢来的碎银", rate: 0.4 }
        ],
        skills: [
            { id: "碎石拳", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "伪龙爪击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "贪婪的强盗试图强行吞噬天地间游离的龙气，虽然力量暴增，但半边身体已经长出了丑陋的蜥蜴鳞片。"
    },

    // 5. 泽地吸血蚊 (昆虫/刺客) - 巨大化的吸血昆虫
    // Calc: HP(198*0.7)=138, ATK(40*1.1*1.3)=57, DEF(9*0.8*0.5)=3, SPD(10*1.3)=13
    {
        id: "global_minion_3_05", template: "minion", name: "泽地吸血蚊", region: "all", spawnType: "all", timeStart: 3,
        subType: "insect",
        stats: { hp: 138, phy_atk: 57, mag_atk: 5, phy_def: 3, mag_def: 3, speed: 13 },
        money: [30, 60],
        drops: [
            { id: "巨大的口器", rate: 0.3 },
            { id: "透明翅膀", rate: 0.2 }
        ],
        skills: [
            { id: "极速叮咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "麻痹毒素", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "大泽乡特有的蚊虫，受灵气滋养后体型如雀鸟，成群结队地袭击落单的生灵。"
    },
    // 1. 赤眉义军统领 (人类/物理) - 获得奇遇的起义军小头目
    // Calc: HP(495*1.0)=495, ATK(59*1.0)=59, DEF(22*1.0)=22, SPD(12*1.0)=12
    {
        id: "global_elite_3_01", template: "elite", name: "赤眉义军统领", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 495, phy_atk: 59, mag_atk: 10, phy_def: 22, mag_def: 18, speed: 12 },
        money: [150, 300],
        drops: [
            { id: "统领的斩马刀", rate: 0.1 },
            { id: "起义军令牌", rate: 0.5 }
        ],
        skills: [
            { id: "力劈华山", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "王侯将相宁有种乎", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "草莽杀气", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 }
        ],
        desc: "大泽乡起义中的猛将，在暴雨中顿悟了杀伐之道，赤眉怒目，誓要推翻暴秦。"
    },

    // 2. 覆海大蛟(幼体) (野兽/均衡) - 沼泽中开始化龙的巨蛇
    // Calc: HP(495*1.2)=594, ATK(59*1.1*0.7)=45, DEF(22*0.9*0.8)=16, SPD(12*1.0)=12
    {
        id: "global_elite_3_02", template: "elite", name: "覆海大蛟(幼体)", region: "all", spawnType: "all", timeStart: 3,
        subType: "beast",
        stats: { hp: 594, phy_atk: 45, mag_atk: 45, phy_def: 16, mag_def: 16, speed: 12 },
        money: [200, 350],
        drops: [
            { id: "未成形的龙角", rate: 0.1 },
            { id: "蛟蛇之鳞", rate: 0.4 }
        ],
        skills: [
            { id: "水流冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "蛟龙摆尾", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "水泽泥泞", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "原本是湖中的大蛇，受‘大泽龙蛇’气运感召，头顶已生出肉瘤，即将化蛟。"
    },

    // 3. 唤雨灵童 (人类/法师) - 天生灵体的孩童
    // Calc: HP(495*1.0)=495, ATK(59*1.0*1.0)=59, DEF(22*1.0*0.6)=13, SPD(12*1.0)=12
    // Tendency: Mag
    {
        id: "global_elite_3_03", template: "elite", name: "唤雨灵童", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 495, phy_atk: 5, mag_atk: 59, phy_def: 13, mag_def: 22, speed: 12 },
        money: [180, 280],
        drops: [
            { id: "灵雨护符", rate: 0.2 },
            { id: "纯净的灵石", rate: 0.2 }
        ],
        skills: [
            { id: "唤雨术", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "天降甘霖·杀", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "泥足深陷", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "出生时恰逢天降灵雨，天生拥有操控水流的能力，虽是孩童心性，但破坏力惊人。"
    },

    // 4. 泥塑金刚 (元素/肉盾) - 破庙中活过来的神像
    // Calc: HP(495*0.9)=445, ATK(59*1.2*0.6)=42, DEF(22*1.5*1.4)=46, SPD(12*0.9)=10
    {
        id: "global_elite_3_04", template: "elite", name: "泥塑金刚", region: "all", spawnType: "all", timeStart: 3,
        subType: "elemental",
        stats: { hp: 445, phy_atk: 42, mag_atk: 10, phy_def: 46, mag_def: 35, speed: 10 },
        money: [160, 260],
        drops: [
            { id: "神像碎片", rate: 0.4 },
            { id: "坚硬的泥土核心", rate: 0.2 }
        ],
        skills: [
            { id: "重拳轰击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "金刚怒目", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "石化皮肤", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 2 } // 震慑减攻
        ],
        desc: "乡间野庙里的泥塑神像，因承受了过多的百姓香火与祈愿，在灵气复苏后拥有了生命。"
    },

    // 5. 鬼面斥候 (人类/刺客) - 速度极快的起义军斥候
    // Calc: HP(495*1.0)=495, ATK(59*1.0*1.3)=76, DEF(22*1.0*0.5)=11, SPD(12*1.0)=12
    // 注：刺客倾向物攻极高，物防极低
    {
        id: "global_elite_3_05", template: "elite", name: "鬼面斥候", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 495, phy_atk: 76, mag_atk: 5, phy_def: 11, mag_def: 11, speed: 12 },
        money: [140, 240],
        drops: [
            { id: "淬毒匕首", rate: 0.1 },
            { id: "夜行衣碎片", rate: 0.3 }
        ],
        skills: [
            { id: "背刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "割喉", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "致盲毒粉", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "脸上戴着恶鬼面具的义军斥候，擅长在雨夜中收割秦军哨兵的头颅。"
    },
    // 1. 张楚先锋大将 (人类/物理) - 获得“王侯无种”气运加持的农民起义领袖
    // Calc:
    // HP: 1188 * 1.0(Race) * 1.0(Tend) = 1188
    // ATK: 99 * 1.0(Race) * 1.0(Tend) = 99 (纯物攻)
    // DEF: 35 * 1.0(Race) * 1.0(Tend) = 35
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_3_01", template: "boss", name: "张楚先锋大将", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 1188, phy_atk: 99, mag_atk: 10, phy_def: 35, mag_def: 21, speed: 15 },
        money: [500, 800],
        drops: [
            { id: "起义军帅印", rate: 0.1 },
            { id: "精钢长矛", rate: 0.1 },
            { id: "劫掠的金银", rate: 0.5 }
        ],
        skills: [
            { id: "怒斩秦吏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "横扫千军", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "王侯宁有种乎", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "草莽霸气", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "士气高涨", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "大泽乡起义的先锋官，虽然出身草莽，但在天地大运的加持下，拥有了力撼正规军的恐怖实力。"
    },

    // 2. 泥沼九头蛇(伪) (野兽/均衡) - 沼泽中因灵雨而畸变的多头蛇
    // Calc:
    // HP: 1188 * 1.2(Race) * 1.0(Tend) = 1425
    // ATK: 99 * 1.1(Race) * 0.7(Tend) = 76 (双修)
    // DEF: 35 * 0.9(Race) * 0.8(Tend) = 25 (略脆)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_3_02", template: "boss", name: "泥沼九头蛇(伪)", region: "all", spawnType: "all", timeStart: 3,
        subType: "beast",
        stats: { hp: 1425, phy_atk: 76, mag_atk: 76, phy_def: 25, mag_def: 25, speed: 15 },
        money: [450, 700],
        drops: [
            { id: "多头蛇胆", rate: 0.2 },
            { id: "剧毒沼泥", rate: 0.4 },
            { id: "未成形的龙珠", rate: 0.05 }
        ],
        skills: [
            { id: "多重噬咬", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "毒液喷射", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "九头狂乱", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "神经毒素", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "沼泽再生", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 5 } // 回血
        ],
        desc: "因为吞噬了太多同类而发生畸变的水蛇，九个头颅各自有着不同的思维，极其疯狂。"
    },

    // 3. 唤雨龙王祭司 (人类/法师) - 操控灵雨的邪教头目
    // Calc:
    // HP: 1188 * 1.0(Race) * 1.0(Tend) = 1188
    // ATK: 99 * 1.0(Race) * 1.0(Tend) = 99 (纯法攻)
    // DEF: 35 * 1.0(Race) * 0.6(Tend) = 21 (脆皮)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_3_03", template: "boss", name: "唤雨龙王祭司", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 1188, phy_atk: 10, mag_atk: 99, phy_def: 21, mag_def: 35, speed: 15 },
        money: [600, 900],
        drops: [
            { id: "祭司法袍", rate: 0.1 },
            { id: "唤雨令旗", rate: 0.1 },
            { id: "灵雨精华", rate: 0.3 }
        ],
        skills: [
            { id: "水龙波", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "暴雨梨花", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "天河倒灌", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "水牢禁锢", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "水幕护盾", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 }
        ],
        desc: "利用天降灵雨的机会装神弄鬼，聚集了一批信徒，通过血祭试图召唤传说中的龙王。"
    },

    // 4. 变异开山莽牛 (野兽/坦克) - 力量变异的耕牛
    // Calc:
    // HP: 1188 * 1.2(Race) * 1.0(Tend) = 1425
    // ATK: 99 * 1.1(Race) * 0.6(Tend) = 65 (偏低)
    // DEF: 35 * 0.9(Race) * 1.4(Tend) = 44 (物防高)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_3_04", template: "boss", name: "变异开山莽牛", region: "all", spawnType: "all", timeStart: 3,
        subType: "beast",
        stats: { hp: 1425, phy_atk: 65, mag_atk: 10, phy_def: 44, mag_def: 37, speed: 15 },
        money: [400, 600],
        drops: [
            { id: "巨大的牛角", rate: 0.1 },
            { id: "坚韧牛皮", rate: 0.3 },
            { id: "牛黄", rate: 0.2 }
        ],
        skills: [
            { id: "顶撞", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "野蛮践踏", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "开山裂地", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "震慑咆哮", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 },
            { id: "硬化皮肤", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "原本是农家的耕牛，灵气复苏后体型暴涨至房屋大小，皮糙肉厚，发起狂来能撞塌城墙。"
    },

    // 5. 斩蛇碑灵 (元素/物理) - 凝聚了赤帝斩蛇传说的灵体
    // Calc:
    // HP: 1188 * 0.9(Race) * 1.0(Tend) = 1069
    // ATK: 99 * 1.2(Race) * 1.0(Tend) = 118 (极高物攻)
    // DEF: 35 * 1.5(Race) * 1.0(Tend) = 52 (极高物防)
    // SPD: 15 * 0.9(Race) = 13
    {
        id: "global_boss_3_05", template: "boss", name: "斩蛇碑灵", region: "all", spawnType: "all", timeStart: 3,
        subType: "elemental",
        stats: { hp: 1069, phy_atk: 118, mag_atk: 10, phy_def: 52, mag_def: 31, speed: 13 },
        money: [500, 800],
        drops: [
            { id: "石碑拓片", rate: 0.3 },
            { id: "赤帝剑气(残)", rate: 0.1 },
            { id: "灵性石材", rate: 0.4 }
        ],
        skills: [
            { id: "石剑挥击", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "镇压妖邪", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "赤帝斩蛇势", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "威压重力", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "石碑护体", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "刘邦斩白蛇起义后立下的石碑，受赤帝气运冲刷而通灵，化作手持石剑的岩石巨人。"
    },
    // 1. 张楚王·陈胜(龙化) - 人类/双修 (Human Balance)
    // 设定：喊出“王侯将相宁有种乎”的起义首领，被逆乱气运强行灌顶，长出了龙鳞，半人半龙。
    // Calc:
    // HP: 2376 * 1.0(Race) * 1.0(Tend) = 2376
    // ATK: 139 * 1.0(Race) * 0.7(Tend) = 97 (物法双修)
    // DEF: 53 * 1.0(Race) * 0.8(Tend) = 42
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_lord_3_01", template: "lord", name: "张楚王·陈胜(龙化)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 2376, phy_atk: 97, mag_atk: 97, phy_def: 42, mag_def: 42, speed: 15 },
        money: [2000, 4000],
        drops: [
            { id: "张楚王印", rate: 0.1 },
            { id: "逆鳞碎片", rate: 0.3 },
            { id: "草莽龙气", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "鸿鹄之志", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "揭竿而起", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "逆乱龙爪", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "王侯宁有种乎·龙吟", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 }, // 必杀

            // 2个Debuff
            { id: "气运压制", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 },
            { id: "龙血沸腾", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 强力Burn

            // 2个Buff
            { id: "真龙护体(伪)", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "天命加身", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】大泽乡起义的领袖，凡人之躯强行承载了天地间游离的‘逆乱之道’，虽化为龙形，却神智癫狂。"
    },

    // 2. 假王·吴广(地祗) - 人类/肉盾 (Human Tank)
    // 设定：吴广借大地之力自封为王，肉身如大地般厚重。
    // Calc:
    // HP: 2376 * 1.0 * 1.0 = 2376
    // ATK: 139 * 1.0 * 0.6 = 83 (较低)
    // DEF: 53 * 1.0 * 1.4 = 74 (极高物防)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_3_02", template: "lord", name: "假王·吴广(地祗)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 2376, phy_atk: 83, mag_atk: 20, phy_def: 74, mag_def: 63, speed: 15 },
        money: [1800, 3500],
        drops: [
            { id: "假王令牌", rate: 0.1 },
            { id: "地脉息壤", rate: 0.2 },
            { id: "厚重的石甲", rate: 0.3 }
        ],
        skills: [
            // 4个伤害
            { id: "地裂斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "泥沼吞噬", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "大地暴动·葬", rate: 0.025, type: 1, damage: 5.0, damageType: "phy", dmgValType: 1 },

            // 2个Debuff
            { id: "重力泥潭", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 }, // 强力减速
            { id: "石化凝视", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 6 },

            // 2个Buff
            { id: "大地之盾", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "地脉滋养", rate: 0.02, type: 3, buffValue: 0.08, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // 强力回血
        ],
        desc: "【领主】吴广在泥泞中悟道，与脚下的大地地脉相连，只要站在大地上，他便几乎不可战胜。"
    },

    // 3. 大泽毒蛟皇 - 龙族/双修 (Dragon Balance)
    // 设定：大泽乡沼泽原本的霸主，借着灵雨彻底化蛟，体型遮天蔽日。
    // Calc:
    // HP: 2376 * 1.5(Race) * 1.0(Tend) = 3564 (超高血量)
    // ATK: 139 * 1.2(Race) * 0.7(Tend) = 116 (高双攻)
    // DEF: 53 * 1.2(Race) * 0.8(Tend) = 50 (不俗防御)
    // SPD: 15 * 1.1(Race) = 16 (高速)
    {
        id: "global_lord_3_03", template: "lord", name: "大泽毒蛟皇", region: "all", spawnType: "all", timeStart: 3,
        subType: "dragon",
        stats: { hp: 3564, phy_atk: 116, mag_atk: 116, phy_def: 50, mag_def: 50, speed: 16 },
        money: [2500, 5000],
        drops: [
            { id: "完整的蛟龙角", rate: 0.05 },
            { id: "蛟皇毒囊", rate: 0.2 },
            { id: "避水珠", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "剧毒水炮", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "蛟龙撕咬", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "翻江倒海", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "万毒噬界", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },

            // 2个Debuff
            { id: "剧毒领域", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 },
            { id: "腐骨之毒", rate: 0.02, type: 2, debuffValue: 0.10, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 极强毒伤10%

            // 2个Buff
            { id: "水幕天华", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "蛟龙变", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】大泽深处的古蛇，沐浴灵雨后化为蛟龙，吐出的毒息能让方圆百里的水域化为死地。"
    },

    // 4. 帝国上将·王离(修罗) - 人类/物理 (Human Phy)
    // 设定：为了镇压妖魔化的起义军，王离开启了王家祖传的“修罗杀道”，化身战争机器。
    // Calc:
    // HP: 2376 * 1.0 * 1.0 = 2376
    // ATK: 139 * 1.0 * 1.0 = 139 (极高物攻)
    // DEF: 53 * 1.0 * 1.0 = 53
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_3_04", template: "lord", name: "帝国上将·王离(修罗)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 2376, phy_atk: 139, mag_atk: 20, phy_def: 53, mag_def: 31, speed: 15 },
        money: [2200, 4500],
        drops: [
            { id: "王家兵书", rate: 0.1 },
            { id: "上将军印", rate: 0.2 },
            { id: "修罗煞气", rate: 0.4 }
        ],
        skills: [
            // 4个伤害
            { id: "百战穿甲", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "长城守望", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "修罗百斩", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "兵家·灭世杀阵", rate: 0.025, type: 1, damage: 5.8, damageType: "phy", dmgValType: 1 },

            // 2个Debuff
            { id: "杀意震慑", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 }, // 削弱敌方攻击
            { id: "战栗凝视", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "speed", debuffTimes: 6 },

            // 2个Buff
            { id: "修罗金身", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "愈战愈勇", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 6 }
        ],
        desc: "【领主】王翦之孙，大秦帝国的最后屏障。为了对抗非人的起义军，他主动接纳了战场的煞气，堕入修罗道。"
    },

    // 5. 赤帝子·刘邦(觉醒) - 人类/法师 (Human Mag)
    // 设定：芒砀山斩蛇后觉醒了赤帝血脉，言出法随。
    // Calc:
    // HP: 2376 * 1.0 * 1.0 = 2376
    // ATK: 139 * 1.0 * 1.0 = 139 (极高法攻)
    // DEF: 53 * 1.0 * 0.6 = 31 (脆皮)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_3_05", template: "lord", name: "赤帝子·刘邦(觉醒)", region: "all", spawnType: "all", timeStart: 3,
        subType: "human",
        stats: { hp: 2376, phy_atk: 20, mag_atk: 139, phy_def: 31, mag_def: 53, speed: 15 },
        money: [2500, 5000],
        drops: [
            { id: "赤霄剑(伪)", rate: 0.05 },
            { id: "天子气运", rate: 0.3 },
            { id: "汉玉", rate: 0.2 }
        ],
        skills: [
            // 4个伤害
            { id: "赤帝火", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "大风歌", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "斩蛇剑气", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "天命·炎汉龙腾", rate: 0.025, type: 1, damage: 6.0, damageType: "mag", dmgValType: 1 }, // 6倍必杀

            // 2个Debuff
            { id: "君威", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 }, // 削弱魔抗
            { id: "天罚", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 强力天罚

            // 2个Buff
            { id: "真龙天子", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "气运加持", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 6 }
        ],
        desc: "【领主】斩白蛇起义的沛公，赤帝血脉彻底觉醒，举手投足间皆有煌煌天威，凡兵难伤。"
    }

];
const enemies_4= [
// 1. 碎阵秦卒 (亡灵/物理) - 阵法破碎后被反噬而死的秦军精锐
    // Calc: HP(234*1.4)=327, ATK(47*0.9)=42, DEF(10*1.1)=11, SPD(10*0.8)=8
    {
        id: "global_minion_4_01", template: "minion", name: "碎阵秦卒", region: "all", spawnType: "all", timeStart: 4,
        subType: "undead",
        stats: { hp: 327, phy_atk: 42, mag_atk: 5, phy_def: 11, mag_def: 8, speed: 8 },
        money: [60, 120],
        drops: [
            { id: "破碎的长城砖", rate: 0.3 },
            { id: "秦军黑甲残片", rate: 0.2 }
        ],
        skills: [
            { id: "长戈突刺", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "阵亡一击", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "曾组成‘十二金人锁魂阵’的精锐士兵，阵法被霸王吼碎时，他们的灵魂也一同碎裂，只剩下杀戮的躯壳。"
    },

    // 2. 狂热楚军 (人类/狂暴) - 受到霸王战意感染陷入狂暴的士兵
    // Calc: HP(234*1.0)=234, ATK(47*1.0*1.3)=61, DEF(10*1.0*0.5)=5, SPD(10*1.0)=10
    // Tendency: Assassin/Berserker (高攻纸防)
    {
        id: "global_minion_4_02", template: "minion", name: "狂热楚军", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 234, phy_atk: 61, mag_atk: 5, phy_def: 5, mag_def: 5, speed: 10 },
        money: [70, 140],
        drops: [
            { id: "破釜沉舟的碎片", rate: 0.3 },
            { id: "楚军头巾", rate: 0.2 }
        ],
        skills: [
            { id: "舍身斩", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "霸王战吼·仿", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "目睹了项羽的神威后，这名士兵彻底陷入了狂热，早已置生死于度外，只想随霸王冲锋。"
    },

    // 3. 漳水河怪 (野兽/肉盾) - 漳水断流后爬上岸的河底巨兽
    // Calc: HP(234*1.2)=280, ATK(47*1.1*0.6)=31, DEF(10*0.9*1.4)=13, SPD(10*1.0)=10
    {
        id: "global_minion_4_03", template: "minion", name: "漳水河怪", region: "all", spawnType: "all", timeStart: 4,
        subType: "beast",
        stats: { hp: 280, phy_atk: 31, mag_atk: 10, phy_def: 13, mag_def: 10, speed: 10 },
        money: [50, 100],
        drops: [
            { id: "河底淤泥", rate: 0.3 },
            { id: "坚硬的甲壳", rate: 0.2 }
        ],
        skills: [
            { id: "淤泥喷射", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "断流重压", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "巨鹿之战震断了漳水，这只在河底沉睡了百年的怪物被迫爬上岸，愤怒地攻击一切活物。"
    },

    // 4. 战场煞灵 (元素/法师) - 浓烈到实质化的杀气
    // Calc: HP(234*0.9)=210, ATK(47*1.2)=56, DEF(10*1.5*0.6)=9, SPD(10*0.9)=9
    // Tendency: Mag
    {
        id: "global_minion_4_04", template: "minion", name: "战场煞灵", region: "all", spawnType: "all", timeStart: 4,
        subType: "elemental",
        stats: { hp: 210, phy_atk: 5, mag_atk: 56, phy_def: 9, mag_def: 14, speed: 9 },
        money: [80, 160],
        drops: [
            { id: "煞气结晶", rate: 0.3 },
            { id: "残破的战旗", rate: 0.1 }
        ],
        skills: [
            { id: "煞气冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "惊惧嚎叫", rate: 0.1, type: 1, damage: 1.8, damageType: "mag", dmgValType: 1 }
        ],
        desc: "几十万大军厮杀产生的杀气与怨念，在灵气的催化下凝聚成了红色的虚影。"
    },

    // 5. 崩坏机关鸟 (机关/物理) - 坠落的秦军空中单位
    // Calc: HP(234*1.5)=351, ATK(47*1.2)=56, DEF(10*1.3)=13, SPD(10*0.5)=5
    // Tendency: Tank (Though base stats look balanced, Mechanism is slow/tanky)
    {
        id: "global_minion_4_05", template: "minion", name: "崩坏机关鸟", region: "all", spawnType: "all", timeStart: 4,
        subType: "mechanism",
        stats: { hp: 351, phy_atk: 56, mag_atk: 5, phy_def: 13, mag_def: 10, speed: 5 },
        money: [100, 200],
        drops: [
            { id: "机关木翼", rate: 0.3 },
            { id: "失控的灵石", rate: 0.1 }
        ],
        skills: [
            { id: "失控俯冲", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "自毁爆炸", rate: 0.1, type: 1, damage: 1.8, damageType: "phy", dmgValType: 1 }
        ],
        desc: "原本翱翔于天际的墨家机关鸟，被霸王的气劲震断了翅膀，在地面上胡乱扑腾，见人就啄。"
    },
    // 1. 碎甲秦将 (亡灵/肉盾) - 被霸王气势震碎心脉的秦军将领
    // Calc:
    // HP: 585 * 1.4(Race) = 819
    // ATK: 70 * 0.9(Race) * 0.6(Tend) = 37
    // DEF: 26 * 1.1(Race) * 1.4(Tend) = 40
    // SPD: 12 * 0.8 = 9
    {
        id: "global_elite_4_01", template: "elite", name: "碎甲秦将", region: "all", spawnType: "all", timeStart: 4,
        subType: "undead",
        stats: { hp: 819, phy_atk: 37, mag_atk: 10, phy_def: 40, mag_def: 30, speed: 9 },
        money: [200, 400],
        drops: [
            { id: "碎裂的黑金盔", rate: 0.1 },
            { id: "秦将佩剑", rate: 0.2 },
            { id: "军功爵印", rate: 0.5 }
        ],
        skills: [
            { id: "残剑挥砍", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "亡灵盾击", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "死战不退", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "生前是百战百胜的秦军都尉，在巨鹿之战中被霸王一声怒吼震碎了心脉与铠甲，死后仍屹立不倒。"
    },

    // 2. 破釜死士 (人类/狂暴) - 陷入疯狂杀戮状态的楚军
    // Calc:
    // HP: 585 * 1.0(Race) = 585
    // ATK: 70 * 1.0(Race) * 1.3(Tend) = 91 (高攻)
    // DEF: 26 * 1.0(Race) * 0.5(Tend) = 13 (脆皮)
    // SPD: 12 * 1.0 = 12
    {
        id: "global_elite_4_02", template: "elite", name: "破釜死士", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 585, phy_atk: 91, mag_atk: 5, phy_def: 13, mag_def: 13, speed: 12 },
        money: [180, 360],
        drops: [
            { id: "无畏头巾", rate: 0.3 },
            { id: "楚国烈酒", rate: 0.2 },
            { id: "卷刃的长刀", rate: 0.1 }
        ],
        skills: [
            { id: "以命换命", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "绝境爆发", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "杀意波动", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 2 }
        ],
        desc: "砸碎了锅釜，凿沉了舟船，这名楚军已没有任何退路，他的眼中只有杀戮，直到流尽最后一滴血。"
    },

    // 3. 虚空裂隙灵 (元素/法师) - 天崩地裂后从裂缝中钻出的怪物
    // Calc:
    // HP: 585 * 0.9(Race) = 526
    // ATK: 70 * 1.2(Race) * 1.0(Tend) = 84 (高法攻)
    // DEF: 26 * 1.5(Race) * 0.6(Tend) = 23
    // SPD: 12 * 0.9 = 10
    {
        id: "global_elite_4_03", template: "elite", name: "虚空裂隙灵", region: "all", spawnType: "all", timeStart: 4,
        subType: "elemental",
        stats: { hp: 526, phy_atk: 5, mag_atk: 84, phy_def: 23, mag_def: 39, speed: 10 },
        money: [250, 450],
        drops: [
            { id: "空间碎片", rate: 0.2 },
            { id: "虚空之尘", rate: 0.3 }
        ],
        skills: [
            { id: "虚空飞弹", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "裂隙崩塌", rate: 0.1, type: 1, damage: 1.9, damageType: "mag", dmgValType: 1 },
            { id: "重力紊乱", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 }
        ],
        desc: "巨鹿之战打得天崩地裂，苍穹上裂开的缝隙中逸散出的异界能量，凝聚成了这种不可名状的实体。"
    },

    // 4. 嗜血战马 (野兽/物理) - 战场上变异的坐骑
    // Calc:
    // HP: 585 * 1.2(Race) = 702
    // ATK: 70 * 1.1(Race) * 1.0(Tend) = 77
    // DEF: 26 * 0.9(Race) * 1.0(Tend) = 23
    // SPD: 12 * 1.0 = 12
    {
        id: "global_elite_4_04", template: "elite", name: "嗜血战马", region: "all", spawnType: "all", timeStart: 4,
        subType: "beast",
        stats: { hp: 702, phy_atk: 77, mag_atk: 10, phy_def: 23, mag_def: 15, speed: 12 },
        money: [150, 300],
        drops: [
            { id: "坚硬的马蹄", rate: 0.3 },
            { id: "战马缰绳", rate: 0.2 }
        ],
        skills: [
            { id: "战争践踏", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "狂奔突袭", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "嘶鸣", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 }
        ],
        desc: "主人战死后，这匹战马在血泊中发了狂，吞食了大量的血肉，变得比虎豹还要凶猛。"
    },

    // 5. 金人断臂 (机关/肉盾) - 十二金人被打碎的残躯
    // Calc:
    // HP: 585 * 1.5(Race) = 877
    // ATK: 70 * 1.2(Race) * 0.6(Tend) = 50
    // DEF: 26 * 1.3(Race) * 1.4(Tend) = 47
    // SPD: 12 * 0.5 = 6
    {
        id: "global_elite_4_05", template: "elite", name: "金人断臂", region: "all", spawnType: "all", timeStart: 4,
        subType: "mechanism",
        stats: { hp: 877, phy_atk: 50, mag_atk: 10, phy_def: 47, mag_def: 40, speed: 6 },
        money: [300, 500],
        drops: [
            { id: "未知的金属块", rate: 0.5 },
            { id: "动力核心(残)", rate: 0.1 }
        ],
        skills: [
            { id: "残臂横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "手指重压", rate: 0.1, type: 1, damage: 1.9, damageType: "phy", dmgValType: 1 },
            { id: "金属共振", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 }
        ],
        desc: "十二金人锁魂阵被破后，一只断裂的巨大金属手臂，依靠残留的灵力仍在战场上盲目地攻击。"
    },
    // 1. 长城军团督军 (亡灵/肉盾) - 巨鹿之战中死战不退的秦军指挥官
    // Calc:
    // HP: 1404 * 1.4(Race) * 1.4(Tend) = 2751 (血量极高)
    // ATK: 117 * 0.9(Race) * 0.6(Tend) = 63 (攻击一般)
    // DEF: 42 * 1.1(Race) * 1.4(Tend) = 65 (极硬)
    // SPD: 15 * 0.8(Race) = 12
    {
        id: "global_boss_4_01", template: "boss", name: "长城军团督军", region: "all", spawnType: "all", timeStart: 4,
        subType: "undead",
        stats: { hp: 2751, phy_atk: 63, mag_atk: 20, phy_def: 65, mag_def: 50, speed: 12 },
        money: [600, 1000],
        drops: [
            { id: "督军黑金铠", rate: 0.1 },
            { id: "秦军虎符(碎)", rate: 0.2 },
            { id: "死战意志", rate: 0.3 }
        ],
        skills: [
            { id: "长戈横扫", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "盾牌猛击", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "军魂冲锋", rate: 0.05, type: 1, damage: 3.0, damageType: "phy", dmgValType: 1 },
            { id: "破胆怒吼", rate: 0.1, type: 2, debuffValue: 0.3, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 3 },
            { id: "不动如山", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "即使肉体已经死亡，他的灵魂依然死守着秦军的战旗，任何试图通过的敌人都将面对他铜墙铁壁般的防御。"
    },

    // 2. 楚军陷阵先锋 (人类/狂暴) - 受到霸王战意感染的狂战士
    // Calc:
    // HP: 1404 * 1.0(Race) * 1.0(Tend) = 1404
    // ATK: 117 * 1.0(Race) * 1.3(Tend) = 152 (极高物攻)
    // DEF: 42 * 1.0(Race) * 0.5(Tend) = 21 (极脆)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_4_02", template: "boss", name: "楚军陷阵先锋", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 1404, phy_atk: 152, mag_atk: 10, phy_def: 21, mag_def: 21, speed: 15 },
        money: [500, 900],
        drops: [
            { id: "嗜血长戟", rate: 0.1 },
            { id: "狂暴药酒", rate: 0.4 },
            { id: "楚军战袍", rate: 0.2 }
        ],
        skills: [
            { id: "力劈", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "回旋斩", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "霸王卸甲·仿", rate: 0.05, type: 1, damage: 3.5, damageType: "phy", dmgValType: 1 }, // 高伤
            { id: "杀意凝视", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 3 },
            { id: "燃烧生命", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 }
        ],
        desc: "他是冲在最前面的敢死队，在项羽破釜沉舟的号召下，彻底放弃了防御，只为在死前砍下敌人的头颅。"
    },

    // 3. 断流河神 (元素/法师) - 漳水断流后产生的怨灵集合体
    // Calc:
    // HP: 1404 * 0.9(Race) * 1.0(Tend) = 1263
    // ATK: 117 * 1.2(Race) * 1.0(Tend) = 140 (高法攻)
    // DEF: 42 * 1.5(Race) * 0.6(Tend) = 38 (MagDef高)
    // SPD: 15 * 0.9(Race) = 13
    {
        id: "global_boss_4_03", template: "boss", name: "断流河神", region: "all", spawnType: "all", timeStart: 4,
        subType: "elemental",
        stats: { hp: 1263, phy_atk: 10, mag_atk: 140, phy_def: 38, mag_def: 63, speed: 13 },
        money: [700, 1200],
        drops: [
            { id: "河神印玺(裂)", rate: 0.1 },
            { id: "淤泥精华", rate: 0.3 },
            { id: "怨恨水珠", rate: 0.5 }
        ],
        skills: [
            { id: "浊流冲击", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "窒息水牢", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "漳水之怒·崩", rate: 0.05, type: 1, damage: 3.0, damageType: "mag", dmgValType: 1 },
            { id: "泥泞迟缓", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 3 },
            { id: "水体再生", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 4 } // 回血
        ],
        desc: "巨鹿之战的惨烈厮杀震断了漳水水脉，河神在无尽的怨气与血水中堕落，誓要淹没两军。"
    },

    // 4. 破损的金人核心 (机关/肉盾) - 十二金人残骸中的动力源
    // Calc:
    // HP: 1404 * 1.5(Race) * 1.4(Tend) = 2948 (血牛)
    // ATK: 117 * 1.2(Race) * 0.6(Tend) = 84
    // DEF: 42 * 1.3(Race) * 1.4(Tend) = 76 (铁板)
    // SPD: 15 * 0.5(Race) = 7
    {
        id: "global_boss_4_04", template: "boss", name: "破损的金人核心", region: "all", spawnType: "all", timeStart: 4,
        subType: "mechanism",
        stats: { hp: 2948, phy_atk: 84, mag_atk: 20, phy_def: 76, mag_def: 60, speed: 7 },
        money: [800, 1500],
        drops: [
            { id: "金人动力炉", rate: 0.1 },
            { id: "天外陨铁", rate: 0.3 },
            { id: "精密的齿轮组", rate: 0.5 }
        ],
        skills: [
            { id: "能量泄露", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 }, // 魔法伤害
            { id: "机械臂重砸", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "核心自毁程序", rate: 0.05, type: 1, damage: 3.5, damageType: "mag", dmgValType: 1 }, // 高伤自爆
            { id: "辐射干扰", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 },
            { id: "紧急护盾", rate: 0.1, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 }
        ],
        desc: "一尊被打碎的十二金人残骸，其内部的动力核心仍在运转，不断释放着危险的能量波动。"
    },

    // 5. 阵法反噬者 (人类/法师) - 操控锁魂阵失败的术士
    // Calc:
    // HP: 1404 * 1.0(Race) * 1.0(Tend) = 1404
    // ATK: 117 * 1.0(Race) * 1.0(Tend) = 117 (高法攻)
    // DEF: 42 * 1.0(Race) * 0.6(Tend) = 25 (脆皮)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_boss_4_05", template: "boss", name: "阵法反噬者", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 1404, phy_atk: 10, mag_atk: 117, phy_def: 25, mag_def: 42, speed: 15 },
        money: [600, 1100],
        drops: [
            { id: "破碎的阵盘", rate: 0.1 },
            { id: "反噬的灵血", rate: 0.3 },
            { id: "阵法书残卷", rate: 0.2 }
        ],
        skills: [
            { id: "灵力逆流", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "锁魂链", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "阵毁人亡", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "神识错乱", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 3 },
            { id: "献祭增幅", rate: 0.1, type: 3, buffValue: 0.4, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 }
        ],
        desc: "负责维持‘十二金人锁魂阵’的秦国大方士，在阵法被暴力破除的瞬间，承受了数倍的灵力反噬，变成了疯魔。"
    },
    // 1. 西楚霸王·项羽(鬼神之姿) - 人类/狂暴 (Human Assassin/Berserker)
    // 设定：巨鹿之战中，项羽以凡人之躯证道，其实力已超越凡俗，宛如鬼神降世。
    // Calc:
    // HP: 2808 * 1.0(Race) * 1.0(Tend) = 2808
    // ATK: 164 * 1.0(Race) * 1.3(Tend) = 213 (全游戏目前的物理攻击天花板)
    // DEF: 62 * 1.0(Race) * 0.5(Tend) = 31 (防御较低，全靠攻)
    // SPD: 15 * 1.0(Race) = 15
    {
        id: "global_lord_4_01", template: "lord", name: "西楚霸王·项羽(鬼神)", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 2808, phy_atk: 213, mag_atk: 20, phy_def: 31, mag_def: 31, speed: 15 },
        money: [3000, 6000],
        drops: [
            { id: "霸王戟残片", rate: 0.05 },
            { id: "乌骓马魂", rate: 0.1 },
            { id: "鬼神之气", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "力拔山兮", rate: 0.2, type: 1, damage: 1.2, damageType: "phy", dmgValType: 1 },
            { id: "横扫千军", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "霸王卸甲", rate: 0.05, type: 1, damage: 3.5, damageType: "phy", dmgValType: 1 }, // 极高伤
            { id: "鬼神·天崩地裂", rate: 0.025, type: 1, damage: 6.0, damageType: "phy", dmgValType: 1 }, // 6倍必杀，触之即死

            // 2个Debuff
            { id: "霸气震慑", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "phy_def", debuffTimes: 4 }, // 碎甲
            { id: "肝胆俱裂", rate: 0.02, type: 2, debuffValue: 0.08, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 强力HP Burn

            // 2个Buff
            { id: "气盖世", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "phy_atk", buffTimes: 4 },
            { id: "越战越勇", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // 击杀回血(模拟)
        ],
        desc: "【领主】“羽之神勇，千古无二。” 在巨鹿战场上，他一人一戟震碎了秦军的十二金人阵，凡人不可直视其锋芒。"
    },

    // 2. 始皇金人·终焉 (机关/肉盾) - 机关/坦克 (Mechanism Tank)
    // 设定：十二金人中最强的一尊，被项羽击碎后核心暴走，化为毁灭一切的堡垒。
    // Calc:
    // HP: 2808 * 1.5(Race) * 1.0(Tend) = 4212 (血量突破天际)
    // ATK: 164 * 1.2(Race) * 0.6(Tend) = 118
    // DEF: 62 * 1.3(Race) * 1.4(Tend) = 113 (物理免疫级防御)
    // SPD: 15 * 0.5(Race) = 7
    {
        id: "global_lord_4_02", template: "lord", name: "始皇金人·终焉", region: "all", spawnType: "all", timeStart: 4,
        subType: "mechanism",
        stats: { hp: 4212, phy_atk: 118, mag_atk: 20, phy_def: 113, mag_def: 90, speed: 7 },
        money: [2500, 5000],
        drops: [
            { id: "终焉核心", rate: 0.05 },
            { id: "记忆金属装甲", rate: 0.3 },
            { id: "万兵之精", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "歼灭光束", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "泰山压顶", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "地壳粉碎", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 },
            { id: "最终指令·世界重置", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },

            // 2个Debuff
            { id: "重力塌缩", rate: 0.1, type: 2, debuffValue: 0.6, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 }, // 极强减速
            { id: "辐射污染", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 毒伤

            // 2个Buff
            { id: "绝对防御力场", rate: 0.06, type: 3, buffValue: 0.6, buffValType: 1, buffAttr: "phy_def", buffTimes: 4 },
            { id: "纳米修复", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 } // 回血
        ],
        desc: "【领主】始皇帝举国之力铸造的最终兵器，在巨鹿之战中核心受损，现在它唯一的目的就是将视线内的所有生命体清除。"
    },

    // 3. 亚父·范增(谋圣) - 人类/法师 (Human Mag)
    // 设定：以天地为棋盘的大术士，精通阴阳纵横之术。
    // Calc:
    // HP: 2808 * 1.0 * 1.0 = 2808
    // ATK: 164 * 1.0 * 1.0 = 164 (高法攻)
    // DEF: 62 * 1.0 * 0.6 = 37 (脆皮)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_4_03", template: "lord", name: "亚父·范增(谋圣)", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 2808, phy_atk: 20, mag_atk: 164, phy_def: 37, mag_def: 62, speed: 15 },
        money: [2800, 5500],
        drops: [
            { id: "锦囊妙计", rate: 0.1 },
            { id: "鸿门宴请柬", rate: 0.1 },
            { id: "天机盘", rate: 0.2 }
        ],
        skills: [
            // 4个伤害
            { id: "棋子·落", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "阴阳逆乱", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "十面埋伏", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "天机·星落", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },

            // 2个Debuff
            { id: "离间计", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "mag_def", debuffTimes: 4 }, // 降抗
            { id: "忧愤成疾", rate: 0.02, type: 2, debuffValue: 0.06, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 扣血

            // 2个Buff
            { id: "运筹帷幄", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "speed", buffTimes: 4 }, // 提速
            { id: "奇门遁甲", rate: 0.1, type: 3, buffValue: 0.3, buffValType: 1, buffAttr: "mag_def", buffTimes: 6 }
        ],
        desc: "【领主】项羽的亚父，眼光毒辣，算无遗策。他以天地灵气为棋子，每一个技能都是针对敌人弱点的致命布局。"
    },

    // 4. 大秦国运·死兆龙 - 龙族/双修 (Dragon Balance)
    // 设定：秦朝灭亡前夕，国运金龙被怨气和煞气污染，化为黑色的死兆龙。
    // Calc:
    // HP: 2808 * 1.5(Race) * 1.0(Tend) = 4212
    // ATK: 164 * 1.2(Race) * 0.7(Tend) = 138 (双修)
    // DEF: 62 * 1.2(Race) * 0.8(Tend) = 60
    // SPD: 15 * 1.1(Race) = 16
    {
        id: "global_lord_4_04", template: "lord", name: "大秦国运·死兆龙", region: "all", spawnType: "all", timeStart: 4,
        subType: "dragon",
        stats: { hp: 4212, phy_atk: 138, mag_atk: 138, phy_def: 60, mag_def: 60, speed: 16 },
        money: [3000, 6000],
        drops: [
            { id: "破碎的传国玉玺", rate: 0.05 },
            { id: "死兆龙鳞", rate: 0.3 },
            { id: "帝国余晖", rate: 0.5 }
        ],
        skills: [
            // 4个伤害
            { id: "厄运吐息", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "龙爪撕裂", rate: 0.1, type: 1, damage: 2.0, damageType: "phy", dmgValType: 1 },
            { id: "国破家亡", rate: 0.05, type: 1, damage: 3.2, damageType: "mag", dmgValType: 1 },
            { id: "二世而亡·天谴", rate: 0.025, type: 1, damage: 5.5, damageType: "mag", dmgValType: 1 },

            // 2个Debuff
            { id: "气数已尽", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "phy_atk", debuffTimes: 4 }, // 降攻
            { id: "衰败诅咒", rate: 0.02, type: 2, debuffValue: 0.10, debuffValType: 1, debuffAttr: "hp", debuffTimes: 6 }, // 10% 强力扣血

            // 2个Buff
            { id: "回光返照", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_atk", buffTimes: 4 },
            { id: "百足之虫", rate: 0.1, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】曾经辉煌的大秦金龙，如今鳞片剥落，流淌着黑色的脓血。它是帝国崩塌的具象化，充满了绝望与毁灭的气息。"
    },

    // 5. 魔相·李斯(法家刑徒) - 人类/法师 (Human Mag/Tank)
    // 设定：制定了严苛秦法的李斯，在沙丘之变后被腰斩，死后化为掌控刑罚的魔神。
    // Calc:
    // HP: 2808 * 1.0 * 1.0 = 2808
    // ATK: 164 * 1.0 * 0.8 = 131 (偏高法攻)
    // DEF: 62 * 1.0 * 1.2 = 74 (法师中的坦克)
    // SPD: 15 * 1.0 = 15
    {
        id: "global_lord_4_05", template: "lord", name: "魔相·李斯", region: "all", spawnType: "all", timeStart: 4,
        subType: "human",
        stats: { hp: 2808, phy_atk: 20, mag_atk: 131, phy_def: 74, mag_def: 60, speed: 15 },
        money: [2600, 5200],
        drops: [
            { id: "法家律令", rate: 0.1 },
            { id: "谏逐客书(残)", rate: 0.2 },
            { id: "刑徒锁链", rate: 0.3 }
        ],
        skills: [
            // 4个伤害
            { id: "墨刑", rate: 0.2, type: 1, damage: 1.2, damageType: "mag", dmgValType: 1 },
            { id: "具五刑", rate: 0.1, type: 1, damage: 2.0, damageType: "mag", dmgValType: 1 },
            { id: "腰斩弃市", rate: 0.05, type: 1, damage: 3.2, damageType: "phy", dmgValType: 1 }, // 物理伤害
            { id: "严刑峻法·灭", rate: 0.025, type: 1, damage: 5.8, damageType: "mag", dmgValType: 1 },

            // 2个Debuff
            { id: "连坐法", rate: 0.1, type: 2, debuffValue: 0.5, debuffValType: 1, debuffAttr: "speed", debuffTimes: 4 }, // 降速
            { id: "焚书坑儒", rate: 0.1, type: 2, debuffValue: 0.4, debuffValType: 1, debuffAttr: "mag_atk", debuffTimes: 6 }, // 封印魔攻

            // 2个Buff
            { id: "法不容情", rate: 0.06, type: 3, buffValue: 0.5, buffValType: 1, buffAttr: "mag_def", buffTimes: 4 },
            { id: "权谋护盾", rate: 0.02, type: 3, buffValue: 0.05, buffValType: 1, buffAttr: "hp", buffTimes: 6 }
        ],
        desc: "【领主】大秦帝国的丞相，法家思想的集大成者。死后他将自己与严苛的秦律融为一体，要审判这乱世中的一切不法之徒。"
    }
];
// ================= 3. 数据合并与初始化 =================

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