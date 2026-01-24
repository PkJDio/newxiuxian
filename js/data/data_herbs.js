// 草药
//console.log("加载 草药");
const herbs_primary_r1 = [
    // 1. HP(恢复)类 - 对应丹药：止血散
    {
        id: "herbs_001", name: "止血草", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 8,
        isPrimary: true,
        effects: { hp: 8 },
        properties: { heal: 25 },
        desc: "叶片边缘有微小锯齿，揉碎后有股清香，是疗伤药最基础的主材。"
    },
    // 2. MP(法力)类 - 对应丹药：甘草片、凝露饮
    {
        id: "herbs_002", name: "清心芽", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 6,
        isPrimary: true,
        effects: { mp: 6 },
        properties: { qi: 25 },
        desc: "生长在溪边阴凉处的嫩芽，能牵引微弱的五行法力。"
    },
    // 3. ATK(攻击)类 - 对应丹药：大力丸
    {
        id: "herbs_003", name: "赤阳果", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 5,
        isPrimary: true,
        effects: { hp: 2 }, // 强化类草药直接食用效果极低
        properties: { atk: 25 },
        desc: "通体微红的小果实，蕴含着一丝燥热之力，可激发血气。"
    },
    // 4. DEF(防御)类 - 对应丹药：铁皮散
    {
        id: "herbs_004", name: "坚韧皮", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 5,
        isPrimary: true,
        effects: { hp: 3 },
        properties: { def: 25 },
        desc: "某种木本植物的坚硬外壳，研磨成粉后是炼制硬功丹药的基石。"
    },
    // 5. Speed(速度)类 - 对应丹药：神行粉
    {
        id: "herbs_005", name: "速生叶", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 4,
        isPrimary: true,
        effects: { mp: 2 },
        properties: { speed: 25 },
        desc: "质地极轻，在风中摇摆频率极快，常用于制作轻身类散剂。"
    },
    // 6. Jing(体质)类 - 对应丹药：接骨丸
    {
        id: "herbs_006", name: "壮根薯", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 10,
        isPrimary: true,
        effects: { hp: 10 },
        properties: { jing: 25 },
        desc: "埋于地下的肥厚根茎，虽然外表丑陋，却能提供充沛的体力支撑。"
    },
    // 7. Qi(能量)类 - 对应丹药：聚气丹
    {
        id: "herbs_007", name: "纳灵花", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 7,
        isPrimary: true,
        effects: { mp: 7 },
        properties: { qiMax: 25 },
        desc: "花瓣呈半透明状，能像吸铁石一样吸引周围飘散的游离法力。"
    },
    // 8. Shen(悟性)类 - 对应丹药：安神丸
    {
        id: "herbs_008", name: "宁神苔", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 6,
        isPrimary: true,
        effects: { mp: 6 },
        properties: { shen: 25 },
        desc: "触感冰凉的青苔，具有极佳的静心功效，是心智丹药的定方之药。"
    }
];
const herbs_primary_r2 = [
    // 1. HP(恢复)类 - 对应丹药：生肌散、地榆炭
    {
        id: "herbs_009", name: "血竭花", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 18,
        isPrimary: true,
        effects: { hp: 18 },
        properties: { heal: 50 },
        desc: "花瓣深红如鲜血凝固，蕴含旺盛的生机，是精品疗伤药的核心。"
    },
    // 2. MP(法力)类 - 对应丹药：玉竹饮、麦冬颗粒
    {
        id: "herbs_010", name: "玉玲珑", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 16,
        isPrimary: true,
        effects: { mp: 16 },
        properties: { qi: 50 },
        desc: "生长在法力汇聚之地的晶莹草药，能有效平复真气波动。"
    },
    // 3. ATK(攻击)类 - 对应丹药：龙葵丹、剑气散
    {
        id: "herbs_011", name: "虎啸草", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 12,
        isPrimary: true,
        effects: { hp: 5 },
        properties: { atk: 50 },
        desc: "叶片形状酷似虎爪，蕴含暴戾的兵革之气，可大幅增强丹药的杀伤力。"
    },
    // 4. DEF(防御)类 - 对应丹药：铁皮散(强化)、龟甲丹
    {
        id: "herbs_012", name: "玄武木", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 15,
        isPrimary: true,
        effects: { hp: 8 },
        properties: { def: 50 },
        desc: "质地坚如钢铁的奇异木材，虽然极难研磨，却是炼体丹药的上选。"
    },
    // 5. Speed(速度)类 - 对应丹药：云雀丹
    {
        id: "herbs_013", name: "飞星蔓", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 10,
        isPrimary: true,
        effects: { mp: 5 },
        properties: { speed: 50 },
        desc: "生于峭壁风口，极细的藤蔓随风摆动时快如残影，赋予丹药迅捷之效。"
    },
    // 6. Jing(体质)类 - 对应丹药：百年首乌丹
    {
        id: "herbs_014", name: "赤精芝", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 20,
        isPrimary: true,
        effects: { hp: 20 },
        properties: { jing: 50 },
        desc: "色泽如赤火的灵芝，吸纳大地精元而成，对稳固根基有极大裨益。"
    },
    // 7. Qi(能量)类 - 对应丹药：星光散
    {
        id: "herbs_015", name: "聚灵果", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 14,
        isPrimary: true,
        effects: { mp: 14 },
        properties: { qiMax: 50 },
        desc: "果实内部中空且蕴含高浓度法力，炼制后可有效拓宽修士经脉。"
    },
    // 8. Shen(悟性)类 - 对应丹药：忘忧丹、慧心丸
    {
        id: "herbs_016", name: "慧心果", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 12,
        isPrimary: true,
        effects: { mp: 8 },
        properties: { shen: 50 },
        desc: "传闻食之可开智慧，是炼制悟道类丹药不可缺少的精品引子。"
    }
];
const herbs_primary_r3 = [
    // 1. HP(恢复)类 - 对应丹药：生肌玉红膏、参王丹(基础)
    {
        id: "herbs_017", name: "千年灵参", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 30,
        isPrimary: true,
        effects: { hp: 30 },
        properties: { heal: 110 },
        desc: "已初具人形的灵参，蕴含极强的土木生机，是高级疗伤药的不二之选。"
    },
    // 2. MP(法力)类 - 对应丹药：高级灵液、滋养丹田类
    {
        id: "herbs_018", name: "幻灵蓝草", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 28,
        isPrimary: true,
        effects: { mp: 28 },
        properties: { qi: 110 },
        desc: "叶片散发着淡淡的幽蓝光芒，能极大加速体内法力的汇聚与转化。"
    },
    // 3. ATK(攻击)类 - 对应丹药：剑气散、雷元丹
    {
        id: "herbs_019", name: "雷击木芽", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 22,
        isPrimary: true,
        effects: { hp: 10 },
        properties: { atk: 110 },
        desc: "生于万年雷击木焦黑躯壳中的新芽，蕴含狂暴的雷霆杀伐之意。"
    },
    // 4. DEF(防御)类 - 对应丹药：岩心丸、石化药剂
    {
        id: "herbs_020", name: "地脉岩精", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 25,
        isPrimary: true,
        effects: { hp: 15 },
        properties: { def: 110 },
        desc: "在大地深处受地脉挤压而生的精华，服之可使皮肉坚韧如金石。"
    },
    // 5. Speed(速度)类 - 对应丹药：幻影丹、极速水(增强)
    {
        id: "herbs_021", name: "风行果", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 20,
        isPrimary: true,
        effects: { mp: 10 },
        properties: { speed: 110 },
        desc: "果实内部充满了流动的清风，炼制出的丹药能让修士步履如飞，难寻踪迹。"
    },
    // 6. Jing(体质)类 - 对应丹药：大力牛魔丸、龙血散
    {
        id: "herbs_022", name: "麒麟血竭", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 35,
        isPrimary: true,
        effects: { hp: 35 },
        properties: { jing: 110 },
        desc: "传说被异兽鲜血浸染过的干结树脂，拥有重塑筋骨、增强体质的奇效。"
    },
    // 7. Qi(能量)类 - 对应丹药：蕴灵丹、地脉丹
    {
        id: "herbs_023", name: "紫罗灵芝", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 26,
        isPrimary: true,
        effects: { mp: 26 },
        properties: { qiMax: 110 },
        desc: "通体紫红，能扩充气海容量，让修士体内的法力储备更上一层楼。"
    },
    // 8. Shen(悟性)类 - 对应丹药：紫烟丹、灵犀露
    {
        id: "herbs_024", name: "悟道茶青", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 24,
        isPrimary: true,
        effects: { mp: 24 },
        properties: { shen: 110 },
        desc: "采取自悟道古茶树顶端的嫩尖，虽无修为，却能让人陷入短暂的清明感悟中。"
    }
];
const herbs_primary_r4 = [
    // 1. HP(恢复)类 - 对应丹药：极品生机丹、复体灵膏
    {
        id: "herbs_025", name: "九叶血参", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 55,
        isPrimary: true,
        effects: { hp: 55 },
        properties: { heal: 220 },
        desc: "参身如红玉，生有九叶，每一片叶子都蕴含着极其浓郁的生机，能重塑受损严重的肉身。"
    },
    // 2. MP(法力)类 - 对应丹药：化灵丹、归元灵液
    {
        id: "herbs_026", name: "幻心灵根", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 52,
        isPrimary: true,
        effects: { mp: 52 },
        properties: { qi: 220 },
        desc: "生于法力浓郁的幻境之中，根茎半透明且闪烁紫芒，是炼制高阶法力回复药的最佳主材。"
    },
    // 3. ATK(攻击)类 - 对应丹药：烈阳丹、破军散
    {
        id: "herbs_027", name: "焚天果", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 45,
        isPrimary: true,
        effects: { hp: 10, mp: 35 },
        properties: { atk: 220 },
        desc: "果实内部仿佛包裹着一团地火，服下后血气激荡，能瞬间爆发出极强的破坏性力量。"
    },
    // 4. DEF(防御)类 - 对应丹药：玄冰丹、不动如山丸
    {
        id: "herbs_028", name: "地藏岩髓", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 50,
        isPrimary: true,
        effects: { hp: 50 },
        properties: { def: 220 },
        desc: "地脉深处经过万年挤压形成的玉髓，具有极高的土系亲和力，能让肉身如磐石般坚硬。"
    },
    // 5. Speed(速度)类 - 对应丹药：踏云丹、瞬步散
    {
        id: "herbs_029", name: "追风幻露", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 48,
        isPrimary: true,
        effects: { mp: 48 },
        properties: { speed: 220 },
        desc: "清晨在极速生长的风铃草上采集的晶莹露珠，蕴含风之法则，炼制后能极大地提升身法。"
    },
    // 6. Jing(体质)类 - 对应丹药：精元丹、龙髓丹
    { id: "herbs_030", name: "龙象玉骨草", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 60,
        isPrimary: true,
        effects: { hp: 60 },
        properties: { jing: 220 },
        desc: "传闻其汁液如象乳，经络如龙筋，服用后能从根本上强壮修士的体质极限。"
    },
    // 7. Qi(能量)类 - 对应丹药：蕴灵丹、开气海丹
    {
        id: "herbs_031", name: "太一汇灵芝", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 55,
        isPrimary: true,
        effects: { mp: 55 },
        properties: { qiMax: 220 },
        desc: "紫色的巨型灵芝，拥有极强的吞噬和转化法力的能力，是扩充丹田法力上限的稀有良药。"
    },
    // 8. Shen(悟性)类 - 对应丹药：大衍神丹、通窍散
    {
        id: "herbs_032", name: "明镜圣心花", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 50,
        isPrimary: true,
        effects: { mp: 50 },
        properties: { shen: 220 },
        desc: "花开如明镜，能映射出修士内心杂念并将其净化，使神识进入极其敏锐的状态。"
    }
];
const herbs_primary_r5 = [
    // 1. HP(恢复)类 - 对应丹药：九转还魂丹(残)、涅槃散
    {
        id: "herbs_033", name: "不死凤凰草", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 75,
        isPrimary: true,
        effects: { hp: 75 },
        properties: { heal: 480 },
        desc: "传闻生于凤巢边缘，其叶如火，蕴含不灭之意，是炼制生死肉骨神药的核心。"
    },
    // 2. MP(法力)类 - 对应丹药：太虚归元丹、天仙玉露
    {
        id: "herbs_034", name: "太虚幻灵花", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 70,
        isPrimary: true,
        effects: { mp: 70 },
        properties: { qi: 480 },
        desc: "绽放于时空缝隙间的奇花，花瓣呈半透明状，能瞬间引动方圆万里的法力汇聚。"
    },
    // 3. ATK(攻击)类 - 对应丹药：天崩地裂散、弑神丸
    {
        id: "herbs_035", name: "寂灭焚天草", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 65,
        isPrimary: true,
        effects: { hp: 15, mp: 50 },
        properties: { atk: 480 },
        desc: "通体漆黑，缭绕着毁灭性的炽热气息，服之可获得短时间内毁灭万物的破坏力。"
    },
    // 4. DEF(防御)类 - 对应丹药：混沌玄黄丸、不灭金身丹
    {
        id: "herbs_036", name: "天道玄黄根", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 72,
        isPrimary: true,
        effects: { hp: 72 },
        properties: { def: 480 },
        desc: "沾染了开天辟地时玄黄母气的老根，沉重如山，赋予丹药不磨不灭的防御特性。"
    },
    // 5. Speed(速度)类 - 对应丹药：虚空挪移散、极光瞬影水
    {
        id: "herbs_037", name: "鲲鹏扶摇羽", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 68,
        isPrimary: true,
        effects: { mp: 68 },
        properties: { speed: 480 },
        desc: "神兽鲲鹏遗落在人间的羽翼所化的仙草，蕴含空间真意，服之可瞬息万里。"
    },
    // 6. Jing(体质)类 - 对应丹药：永恒不朽丹、万寿无疆丸
    {
        id: "herbs_038", name: "长生造化参", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 80,
        isPrimary: true,
        effects: { hp: 80 },
        properties: { jing: 480 },
        desc: "经历了无数雷劫而不倒的绝世灵参，内部自成造化，能彻底洗髓伐骨，重塑仙体。"
    },
    // 7. Qi(能量)类 - 对应丹药：开天造化丹、鸿蒙聚能散
    {
        id: "herbs_039", name: "鸿蒙本源果", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 75,
        isPrimary: true,
        effects: { mp: 75 },
        properties: { qiMax: 480 },
        desc: "蕴含混沌初开时的本源气息，能强行扩充修士的丹田界限，法力如海，取之不尽。"
    },
    // 8. Shen(悟性)类 - 对应丹药：大道感悟丹、一眼万年散
    {
        id: "herbs_040", name: "菩提悟道心", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 70,
        isPrimary: true,
        effects: { mp: 70 },
        properties: { shen: 480 },
        desc: "菩提古树万年方结的一颗道心，服之可进入天人合一之境，参透世间一切道法规律。"
    }
];
const herbs_primary_r6 = [
    // 1. HP(恢复)类 - 对应丹药：完整九转还魂丹、不灭真身
    {
        id: "herbs_041", name: "鸿蒙不死根", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 100,
        isPrimary: true,
        effects: { hp: 100 },
        properties: { heal: 950 },
        desc: "产自天地未开时的鸿蒙深处，其根须所化的汁液能让凋零的星辰重焕生机。"
    },
    // 2. MP(法力)类 - 对应丹药：诸天归元液、至尊化灵丹
    {
        id: "herbs_042", name: "诸天虚空华", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 95,
        isPrimary: true,
        effects: { mp: 95 },
        properties: { qi: 950 },
        desc: "扎根于无尽虚空之中，每一片花瓣都对应一个位面的法力本源，能瞬间充盈仙元。"
    },
    // 3. ATK(攻击)类 - 对应丹药：弑神崩天散、寂灭道丸
    {
        id: "herbs_043", name: "寂灭道刃果", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 85,
        isPrimary: true,
        effects: { hp: 25, mp: 60 },
        properties: { atk: 950 },
        desc: "果实形状如同一柄缩小的道兵，缭绕着毁灭法则，服之可获得撕裂乾坤的恐怖破坏力。"
    },
    // 4. DEF(防御)类 - 对应丹药：万劫玄黄丹、天道不灭金身
    {
        id: "herbs_044", name: "万劫玄黄髓", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 92,
        isPrimary: true,
        effects: { hp: 92 },
        properties: { def: 950 },
        desc: "大地母气经过万次量劫凝练而成的精髓，赋予丹药不被世间万物所伤的至高防御。"
    },
    // 5. Speed(速度)类 - 对应丹药：鲲鹏逍遥散、时空挪移丹
    {
        id: "herbs_045", name: "天道挪移草", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 88,
        isPrimary: true,
        effects: { mp: 88 },
        properties: { speed: 950 },
        desc: "受天道意志加持，其叶片边缘流转着时空法则，让服药者能超脱距离的限制。"
    },
    // 6. Jing(体质)类 - 对应丹药：永恒大道不朽丹
    {
        id: "herbs_046", name: "太初祖龙芝", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 100,
        isPrimary: true,
        effects: { hp: 100 },
        properties: { jing: 950 },
        desc: "传说由太初祖龙的真血浇灌而成的灵芝，能够让修士的躯壳直接跨越凡俗，成就圣体。"
    },
    // 7. Qi(能量)类 - 对应丹药：开天辟地造化丹
    {
        id: "herbs_047", name: "混沌无极实", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 96,
        isPrimary: true,
        effects: { mp: 96 },
        properties: { qiMax: 950 },
        desc: "蕴含混沌之力的种子，服之可在体内强行开辟出如同无极星空般浩瀚的法力气海。"
    },
    // 8. Shen(悟性)类 - 对应丹药：一眼万年感悟丹、大道本源丹
    {
        id: "herbs_048", name: "三生悟道果", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 90,
        isPrimary: true,
        effects: { mp: 90 },
        properties: { shen: 950 },
        desc: "果实上显现着前世、今生、来世的幻象，服之可在一瞬间看透大道本源，领悟禁忌秘法。"
    }
];

const herbs_aux_r1_value = [
    // 1. 愈合加成 - 补充 heal 药性
    {
        id: "herbs_049", name: "野甘草", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 3,
        isPrimary: false,
        effects: { hp: 3 },
        properties: { heal: 8 },
        desc: "极常见的杂草，虽然药力微弱，但性质极温和，是炼制伤药的常用填充物。"
    },
    // 2. 行气加成 - 补充 qi 药性
    {
        id: "herbs_050", name: "小灵芝芽", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 5,
        isPrimary: false,
        effects: { mp: 5 },
        properties: { qi: 8 },
        desc: "刚冒头的灵芝幼芽，蕴含的法力虽不足以支撑成丹，但能有效补充行气药性。"
    },
    // 3. 锋锐加成 - 补充 atk 药性
    {
        id: "herbs_051", name: "刺草叶", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 2,
        isPrimary: false,
        effects: { hp: -1 }, // 辛辣刺喉，直接吃会扣极少量血
        properties: { atk: 8 },
        desc: "边缘有细锯齿的枯草，在炼制攻击类丹药时可提供基础的杀伐之意。"
    },
    // 4. 厚实加成 - 补充 def 药性
    {
        id: "herbs_052", name: "干硬根", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 4,
        isPrimary: false,
        effects: { hp: 4 },
        properties: { def: 8 },
        desc: "不知名的老根，质地如干木，能为防御类丹药提供微量基石药性。"
    },
    // 5. 迅捷加成 - 补充 speed 药性
    {
        id: "herbs_053", name: "燕子草", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 2,
        isPrimary: false,
        effects: { mp: 2 },
        properties: { speed: 8 },
        desc: "叶片细长如燕尾，常在风中剧烈摇摆，用于提升丹药的灵动感。"
    },
    // 6. 提神加成 - 补充 shen 药性
    {
        id: "herbs_054", name: "微苦花", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 3,
        isPrimary: false,
        effects: { mp: 3 },
        properties: { shen: 8 },
        desc: "散发着淡淡苦味的野花，可略微清明神识，适配心智类丹药。"
    }
];
const herbs_aux_r1_stable = [
    // 7. 基础稳定 - 核心提供 stabilizer
    {
        id: "herbs_055", name: "平性木屑", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 2,
        isPrimary: false,
        effects: { hp: 2 },
        properties: { stabilizer: 10 },
        desc: "干燥且没有任何药性的木屑，虽然不能提升药效，但能极好地稳定炉内火候。"
    },
    // 8. 舒缓中和 - 兼顾稳定与微量愈合
    {
        id: "herbs_056", name: "柔和绒花", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 5,
        isPrimary: false,
        effects: { hp: 5 },
        properties: { stabilizer: 6, heal: 4 },
        desc: "触感如棉花的白色小花，能缓冲狂暴的药性冲突。"
    },
    // 9. 降温中和 - 兼顾稳定与微量行气
    {
        id: "herbs_057", name: "清凉薄荷", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 4,
        isPrimary: false,
        effects: { hp: 1, mp: 3 },
        properties: { stabilizer: 6, qi: 4 },
        desc: "清凉通透的叶片，在炼制真气类丹药时能起到极佳的降温稳定作用。"
    },
    // 10. 固体稳定 - 增加药液粘稠度
    {
        id: "herbs_058", name: "粘粘草", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 3,
        isPrimary: false,
        effects: { hp: 3 },
        properties: { stabilizer: 8 },
        desc: "汁液粘稠的杂草，有助于将散乱的药粉凝结成丹。"
    },
    // 11. 灵性稳定 - 对应高法力配方
    {
        id: "herbs_059", name: "引灵皮", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 4,
        isPrimary: false,
        effects: { mp: 4 },
        properties: { stabilizer: 5, qiMax: 5 },
        desc: "某种灵木的内皮，能引导法力均匀分布，防止药性局部过载。"
    },
    // 12. 纯净中和 - 减少杂质
    {
        id: "herbs_060", name: "净水浮萍", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 3,
        isPrimary: false,
        effects: { hp: 3 },
        properties: { stabilizer: 7, shen: 3 },
        desc: "生长在清澈泉水中的浮萍，具有一定的净化能力，使成丹更纯净。"
    }
];
const herbs_aux_r1_guide = [
    // 13. 基础药引 - 通用催化
    {
        id: "herbs_061", name: "引药灵皮", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 3,
        isPrimary: false,
        effects: { hp: 3 },
        properties: { catalyst: 10 },
        desc: "某种灵木的干皮，能引导混杂的药力流向丹核，基础药引。"
    },
    // 14. 气血引导 - 增强 heal 吸收
    {
        id: "herbs_062", name: "红丝线", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 5,
        isPrimary: false,
        effects: { hp: 5 },
        properties: { catalyst: 5, heal: 5 },
        desc: "细如发丝的红色小草，能像引线一样将愈合药力导入血液。"
    },
    // 15. 法力引导 - 增强 qi 吸收
    {
        id: "herbs_063", name: "导灵须", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 4,
        isPrimary: false,
        effects: { mp: 4 },
        properties: { catalyst: 5, qi: 5 },
        desc: "水生植物的须根，擅长捕捉水中的法力，辅助真气丹药的药效转化。"
    },
    // 16. 强力引导 - 针对 Buff 类药性
    {
        id: "herbs_064", name: "穿山藤", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 4,
        isPrimary: false,
        effects: { hp: 2, mp: 2 },
        properties: { catalyst: 8 },
        desc: "生命力极强的藤蔓，炼入丹中可使药力具有穿透性，直达筋骨。"
    },
    // 17. 纯化引导 - 提升成丹品质
    {
        id: "herbs_065", name: "露水花", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 3,
        isPrimary: false,
        effects: { mp: 3 },
        properties: { catalyst: 6, stabilizer: 4 },
        desc: "早晨采集的带露花朵，能洗练药材中的凡尘杂质。"
    },
    // 18. 极速药引 - 针对速度/瞬时类
    {
        id: "herbs_066", name: "惊风羽", type: "material", subType: "herbs", grade: 0, rarity: 1, value: 2,
        isPrimary: false,
        effects: { mp: 2 },
        properties: { catalyst: 7, speed: 3 },
        desc: "受惊时会迅速收缩的叶片，能加快药力在体内的爆发速度。"
    }
];
const herbs_aux_r2_value = [
    // 1. 愈合加成 - 补充 heal 药性
    {
        id: "herbs_067", name: "生肌草", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 18,
        isPrimary: false,
        effects: { hp: 18 },
        properties: { heal: 22 },
        desc: "叶片肥厚且多汁，汁液粘稠，能显著增强伤口的愈合速度。"
    },
    // 2. 行气加成 - 补充 qi 药性
    {
        id: "herbs_068", name: "汇灵花", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 16,
        isPrimary: false,
        effects: { mp: 16 },
        properties: { qi: 22 },
        desc: "绽放在法力稀薄处的小花，天生擅长吸纳游离法力并压缩。"
    },
    // 3. 锋锐加成 - 补充 atk 药性
    {
        id: "herbs_069", name: "铁线蕨", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 12,
        isPrimary: false,
        effects: { hp: -3 }, // 药性较烈，直接食用微损血气
        properties: { atk: 22 },
        desc: "叶梗坚硬如铁丝，炼入丹中可赋予药力一种锐利的穿透感。"
    },
    // 4. 厚实加成 - 补充 def 药性
    {
        id: "herbs_070", name: "地衣老皮", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 15,
        isPrimary: false,
        effects: { hp: 15 },
        properties: { def: 22 },
        desc: "附着在古树背阴面的厚实苔藓皮，性质沉稳，有助于固化肉身防御。"
    },
    // 5. 迅捷加成 - 补充 speed 药性
    {
        id: "herbs_071", name: "捕风影", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 14,
        isPrimary: false,
        effects: { mp: 14 },
        properties: { speed: 22 },
        desc: "这种植物的种子带有薄膜，能随风远扬，是轻身类配方的优质辅材。"
    },
    // 6. 提神加成 - 补充 shen 药性
    {
        id: "herbs_072", name: "苦胆草", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 15,
        isPrimary: false,
        effects: { mp: 15 },
        properties: { shen: 22 },
        desc: "极度苦涩的草药，虽然难以下咽，但对刺激神识清醒有奇效。"
    }
];
const herbs_aux_r2_stable = [
    // 7. 精品稳定 - 核心提供更高的 stabilizer
    {
        id: "herbs_073", name: "沉香木片", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 12,
        isPrimary: false,
        effects: { hp: 12 },
        properties: { stabilizer: 25 },
        desc: "带有淡淡幽香的木片，能镇定炉内翻涌的法力，是炼制精品丹药的常用稳定剂。"
    },
    // 8. 属性中和 - 兼顾稳定与真气调和
    {
        id: "herbs_074", name: "润脉须", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 14,
        isPrimary: false,
        effects: { mp: 14 },
        properties: { stabilizer: 18, qi: 12 },
        desc: "如同经络般细长的须根，能中和狂暴的行气药性，防止真气冲击丹壁。"
    },
    // 9. 寒冰稳定 - 针对烈性药材（如虎啸草、赤阳果）
    {
        id: "herbs_075", name: "寒潭浮萍", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 15,
        isPrimary: false,
        effects: { hp: 10, mp: 5 },
        properties: { stabilizer: 20 },
        desc: "生长在极寒深潭表面的浮萍，其冰冷的药性能有效抑制燥热药材的暴动。"
    },
    // 10. 强效粘合 - 提升成丹率
    {
        id: "herbs_076", name: "地灵胶", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 13,
        isPrimary: false,
        effects: { hp: 13 },
        properties: { stabilizer: 22 },
        desc: "从土系灵草根部提取的胶状物质，粘性极强，能将多种冲突的药力强行凝聚。"
    },
    // 11. 灵识中和 - 针对悟性/神识丹药
    {
        id: "herbs_077", name: "月光苔", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 12,
        isPrimary: false,
        effects: { mp: 12 },
        properties: { stabilizer: 15, shen: 15 },
        desc: "只在月光下生长的青苔，性质极其清冷柔和，能辅助稳定神识类药性。"
    },
    // 12. 温润调和 - 普适性极高
    {
        id: "herbs_078", name: "暖心草", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 16,
        isPrimary: false,
        effects: { hp: 16 },
        properties: { stabilizer: 20, heal: 10 },
        desc: "性质温和如阳光的草药，能兼容绝大多数药性，是精品配方中的万能辅料。"
    }
];
const herbs_aux_r2_guide = [
    // 13. 精品药引 - 通用催化，效果显著提升
    {
        id: "herbs_079", name: "萃灵皮", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 15,
        isPrimary: false,
        effects: { hp: 15 },
        properties: { catalyst: 25 },
        desc: "经过法力淬炼的树皮，能极大地引导药效向丹核凝聚，是精品药引。"
    },
    // 14. 强效血引 - 针对 heal 药性大幅增强转化
    {
        id: "herbs_080", name: "赤络须", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 18,
        isPrimary: false,
        effects: { hp: 18 },
        properties: { catalyst: 15, heal: 15 },
        desc: "如同细小血管般的红色根须，炼入丹中能让愈合类药力完美融入经脉。"
    },
    // 15. 强效灵引 - 针对 qi 药性大幅增强转化
    {
        id: "herbs_081", name: "引灵蔓", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 16,
        isPrimary: false,
        effects: { mp: 16 },
        properties: { catalyst: 15, qi: 15 },
        desc: "在灵泉边生长的长蔓，擅长牵引周围的真气流向，辅助真气丹药的药效转化。"
    },
    // 16. 透骨导向 - 针对 Atk/Def 等肉身强化
    {
        id: "herbs_082", name: "透石钻", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 12,
        isPrimary: false,
        effects: { hp: 12 },
        properties: { catalyst: 20, def: 10 },
        desc: "根部极其锋利能穿透岩石的草药，能引导防御类药力直达骨髓，增强韧性。"
    },
    // 17. 识海引导 - 针对悟性/神识类丹药
    {
        id: "herbs_083", name: "冥想果", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 14,
        isPrimary: false,
        effects: { mp: 14 },
        properties: { catalyst: 15, shen: 15 },
        desc: "形状类似大脑的干果，能引导清明药力上行至识海，加速悟道感悟。"
    },
    // 18. 迅捷药引 - 针对速度/流动感
    {
        id: "herbs_084", name: "惊雷花蕊", type: "material", subType: "herbs", grade: 0, rarity: 2, value: 15,
        isPrimary: false,
        effects: { mp: 15 },
        properties: { catalyst: 20, speed: 12 },
        desc: "绽放时带有微弱雷声的花蕊，能让药力的爆发力再上一个台阶，提升身法。"
    }
];
const herbs_aux_r3_value = [
    // 1. 愈合加成 - 补充 heal 药性
    {
        id: "herbs_085", name: "续断筋", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 28,
        isPrimary: false,
        effects: { hp: 28 },
        properties: { heal: 42 },
        desc: "形如断裂的筋骨相互缠绕，蕴含强力修复因子，是珍品疗伤药的黄金配角。"
    },
    // 2. 行气加成 - 补充 qi 药性
    {
        id: "herbs_086", name: "聚灵蕊", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 26,
        isPrimary: false,
        effects: { mp: 26 },
        properties: { qi: 40 },
        desc: "只有在法力极度浓郁之地才会结出的花蕊，能大幅度提升丹药的法力浓度。"
    },
    // 3. 锋锐加成 - 补充 atk 药性
    {
        id: "herbs_087", name: "剑意草", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 20,
        isPrimary: false,
        effects: { hp: -5 }, // 带有剑气，食用微伤血肉
        properties: { atk: 45 },
        desc: "叶片笔直如剑，生长在古战场遗址，能为攻击类丹药注入凌厉的杀伐之气。"
    },
    // 4. 厚实加成 - 补充 def 药性
    {
        id: "herbs_088", name: "玄铁苔", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 25,
        isPrimary: false,
        effects: { hp: 25 },
        properties: { def: 42 },
        desc: "生长在铁矿脉上的青黑色苔藓，质地沉重且坚韧，有助于强化修士的皮肉防御。"
    },
    // 5. 迅捷加成 - 补充 speed 药性
    {
        id: "herbs_089", name: "流光叶", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 22,
        isPrimary: false,
        effects: { mp: 22 },
        properties: { speed: 40 },
        desc: "叶片表面覆盖着一层流动的荧光，炼制出的药液能加快真气在经络中的运转速度。"
    },
    // 6. 提神加成 - 补充 shen 药性
    {
        id: "herbs_090", name: "醒神木屑", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 24,
        isPrimary: false,
        effects: { mp: 24 },
        properties: { shen: 40 },
        desc: "取自数百年树龄的醒神木，其粉末能穿透识海迷雾，是炼制高阶悟道丹的极佳配药。"
    }
];
const herbs_aux_r3_stable = [
    // 7. 灵级稳定 - 提供核心的高额稳定性
    {
        id: "herbs_091", name: "百年檀心木", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 25,
        isPrimary: false,
        effects: { hp: 15, mp: 10 },
        properties: { stabilizer: 45 },
        desc: "产自深山灵木的中心，木质沉稳且带有清神异香，能极大地平复灵级丹药的躁动。"
    },
    // 8. 狂暴压制 - 专门针对高 atk/def 药性的副作用
    {
        id: "herbs_092", name: "压风草", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 22,
        isPrimary: false,
        effects: { hp: 22 },
        properties: { stabilizer: 35, heal: 15 },
        desc: "叶片沉重如铅，能像秤砣一样压制住炉内乱窜的血气，保护丹壁不受冲击。"
    },
    // 9. 寒玉髓中和 - 极强降温，针对火属性或烈性药
    {
        id: "herbs_093", name: "冰心藕", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 28,
        isPrimary: false,
        effects: { mp: 28 },
        properties: { stabilizer: 38 },
        desc: "生长在万年冰湖下的白藕，质地如玉，其冰冷的灵性是压制烈焰类药草的圣品。"
    },
    // 10. 法力锁固 - 防止药性在炼制中流失
    {
        id: "herbs_094", name: "固灵苔", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 24,
        isPrimary: false,
        effects: { mp: 24 },
        properties: { stabilizer: 40, qiMax: 10 },
        desc: "一种能产生微型磁场的青苔，能将散溢的法力药性强行束缚在丹胎之内。"
    },
    // 11. 神识固化 - 针对高级神识类丹药
    {
        id: "herbs_095", name: "幻神香屑", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 26,
        isPrimary: false,
        effects: { mp: 26 },
        properties: { stabilizer: 35, shen: 20 },
        desc: "采集多种灵花提炼的香粉，能引导散乱的神识药性归位，成丹更圆润。"
    },
    // 12. 万用灵合 - R3配方的万金油
    {
        id: "herbs_096", name: "七宝合欢枝", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 30,
        isPrimary: false,
        effects: { hp: 15, mp: 15 },
        properties: { stabilizer: 42, catalyst: 10 },
        desc: "天生具有融合不同属性药性能力的奇特树枝，能显著提升复杂配方的成丹率。"
    }
];
const herbs_aux_r3_guide = [
    // 13. 灵级药引 - 极大幅度提升通用药性转化率
    {
        id: "herbs_097", name: "天灵淬液", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 25,
        isPrimary: false,
        effects: { mp: 25 },
        properties: { catalyst: 45 },
        desc: "在法力极度浓郁之地凝结的液体，能将普通草药的药性强行提升至灵级水平。"
    },
    // 14. 归元引导 - 针对 heal/mp 复合回复类丹药的药力归仓
    {
        id: "herbs_098", name: "九脉通", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 30,
        isPrimary: false,
        effects: { hp: 15, mp: 15 },
        properties: { catalyst: 35, heal: 20, qi: 20 },
        desc: "形如人体九大经脉交汇的奇异块茎，能引导药力瞬间贯通全身经络。"
    },
    // 15. 煞气引导 - 针对 Atk 杀伐类属性的极限诱导
    {
        id: "herbs_099", name: "杀生引", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 15,
        isPrimary: false,
        effects: { hp: -5, mp: 20 },
        properties: { catalyst: 40, atk: 25 },
        desc: "生于兵戈之地的暗红色小草，能诱发出草药中潜藏的最狂暴破坏力。"
    },
    // 16. 金石导向 - 针对 Def 强体类属性的深度固化
    {
        id: "herbs_100", name: "钻山锥", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 22,
        isPrimary: false,
        effects: { hp: 22 },
        properties: { catalyst: 38, def: 25 },
        desc: "根部如钻头般坚硬的灵草，能引导防御类药性深入骨髓，铸就金石之躯。"
    },
    // 17. 慧根诱导 - 针对悟性/参悟类丹药的识海穿透
    {
        id: "herbs_101", name: "通灵白芷", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 24,
        isPrimary: false,
        effects: { mp: 24 },
        properties: { catalyst: 35, shen: 30 },
        desc: "通体洁白无瑕，散发着让人灵光一闪的幽香，是炼制高阶悟道药的顶级引导剂。"
    },
    // 18. 极速诱导 - 针对 Speed/瞬时爆发类药性
    {
        id: "herbs_102", name: "追风箭草", type: "material", subType: "herbs", grade: 1, rarity: 3, value: 20,
        isPrimary: false,
        effects: { mp: 20 },
        properties: { catalyst: 40, speed: 25 },
        desc: "叶片在空气中划过会有轻微破空声，能引导药力在服用者体内化作疾风之势。"
    }
];
const herbs_aux_r4_value = [
    // 1. 愈合加成 - 补充 heal 药性
    {
        id: "herbs_097", name: "流霞红脂", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 58,
        isPrimary: false,
        effects: { hp: 58 },
        properties: { heal: 85 },
        desc: "如晚霞般灿烂的植物油脂，蕴含惊人的肉身修复力，是灵级伤药的极品辅料。"
    },
    // 2. 行气加成 - 补充 qi 药性
    {
        id: "herbs_098", name: "天青雷实", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 54,
        isPrimary: false,
        effects: { mp: 54 },
        properties: { qi: 82 },
        desc: "雷雨天后在灵木高处凝结的果实，能极大地纯化并补充丹药的真气含量。"
    },
    // 3. 锋锐加成 - 补充 atk 药性
    {
        id: "herbs_099", name: "金刚砂叶", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 45,
        isPrimary: false,
        effects: { hp: -8 }, // 药性极烈，带有切割感
        properties: { atk: 88 },
        desc: "叶片表面覆盖着天然的金刚砂晶体，能为丹药注入摧枯拉朽般的攻击药性。"
    },
    // 4. 厚实加成 - 补充 def 药性
    {
        id: "herbs_100", name: "地脉金精苔", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 50,
        isPrimary: false,
        effects: { hp: 50 },
        properties: { def: 85 },
        desc: "生长在金脉核心的苔藓，吸收了厚重的金属气息，能将丹药的护体药力推向极致。"
    },
    // 5. 迅捷加成 - 补充 speed 药性
    {
        id: "herbs_101", name: "无影风铃", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 48,
        isPrimary: false,
        effects: { mp: 48 },
        properties: { speed: 82 },
        desc: "花朵透明无色，随风摆动时会产生轻微的空间波动，是提升身法药性的绝佳辅材。"
    },
    // 6. 提神加成 - 补充 shen 药性
    {
        id: "herbs_102", name: "九窍通神粉", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 52,
        isPrimary: false,
        effects: { mp: 52 },
        properties: { shen: 88 },
        desc: "由九种灵草花粉混合而成，能瞬间贯通识海迷雾，是炼制极品悟道丹的核心配药。"
    }
];
const herbs_aux_r4_stable = [
    // 7. 灵级极品稳定 - 核心提供极高的稳定性
    {
        id: "herbs_103", name: "千年降真香", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 50,
        isPrimary: false,
        effects: { hp: 30, mp: 20 },
        properties: { stabilizer: 95 },
        desc: "极品灵木的精华，燃之烟气凝而不散，能镇压灵级主药产生的剧烈震荡。"
    },
    // 8. 属性压制稳定 - 专门针对狂暴药性
    {
        id: "herbs_104", name: "镇岳 文粉", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 55,
        isPrimary: false,
        effects: { hp: 55 },
        properties: { stabilizer: 85, def: 20 },
        desc: "吸收了山岳沉重之意的石粉，能像重锤一样稳固药力，使其不至于外溢炸炉。"
    },
    // 9. 绝对降温稳定 - 针对火属性或极端暴戾药材
    {
        id: "herbs_105", name: "万年冰髓芽", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 48,
        isPrimary: false,
        effects: { mp: 48 },
        properties: { stabilizer: 80 },
        desc: "在万年冰川下艰难生出的嫩芽，极寒的属性是中和如焚天果等烈性药材的最佳方案。"
    },
    // 10. 法力流转稳定 - 针对高法力上限配方
    {
        id: "herbs_106", name: "玉露导灵浆", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 52,
        isPrimary: false,
        effects: { mp: 52 },
        properties: { stabilizer: 88, qiMax: 25 },
        desc: "质地如凝脂的液体，能将狂暴的法力梳理通顺，使炼制的丹药药力更平和。"
    },
    // 11. 识海中和稳定 - 针对极品悟性丹药
    {
        id: "herbs_107", name: "静心空青", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 46,
        isPrimary: false,
        effects: { mp: 46 },
        properties: { stabilizer: 82, shen: 30 },
        desc: "极其罕见的透明岩髓，能屏蔽外界干扰，使神识类药性在丹炉中完美融合。"
    },
    // 12. 极品万用粘合剂 - 对应复杂的多材料配方
    {
        id: "herbs_108", name: "玄天合和膏", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 60,
        isPrimary: false,
        effects: { hp: 30, mp: 30 },
        properties: { stabilizer: 90, catalyst: 20 },
        desc: "经过九次熬炼的灵膏，具有极强的包容性，能将数种属性冲突的药材强行融合。"
    }
];
const herbs_aux_r4_guide = [
    // 13. 灵级极品药引 - 通用型催化，大幅提升主药转化率
    {
        id: "herbs_109", name: "天灵淬元皮", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 50,
        isPrimary: false,
        effects: { hp: 20, mp: 30 },
        properties: { catalyst: 95 },
        desc: "取自生长在法力充裕之地千年的灵木外皮，是炼制极品丹药的万能药引。"
    },
    // 14. 涅槃生机引 - 针对 heal 药性，实现“枯木逢春”般的转化
    {
        id: "herbs_110", name: "回天红丝蕊", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 58,
        isPrimary: false,
        effects: { hp: 58 },
        properties: { catalyst: 75, heal: 30 },
        desc: "如同跳动的心脏血管般的红色花蕊，能将一切愈合药力瞬间导入受损根基。"
    },
    // 15. 太虚聚灵引 - 针对 qi 药性，极致提升法力恢复速度
    {
        id: "herbs_111", name: "虚空捕灵蔓", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 52,
        isPrimary: false,
        effects: { mp: 52 },
        properties: { catalyst: 75, qi: 30 },
        desc: "长在空间裂缝边缘的藤蔓，能强行抓取四周法力注入丹中，大幅增强回灵效果。"
    },
    // 16. 伐毛洗髓引 - 针对 ATK/DEF 强化属性的深度引导
    {
        id: "herbs_112", name: "穿山透骨锥", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 45,
        isPrimary: false,
        effects: { hp: 15, mp: 30 },
        properties: { catalyst: 85, atk: 15 },
        desc: "一种质地极硬的锥状草药，能引导强化类药力穿透修士的肉身屏障，直达深层。"
    },
    // 17. 灵台通明引 - 针对神识/悟性类丹药
    {
        id: "herbs_113", name: "九幻神游实", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 50,
        isPrimary: false,
        effects: { mp: 50 },
        properties: { catalyst: 80, shen: 30 },
        desc: "果实内部自成幻境，能引导悟性药力避开杂念干扰，直接作用于识海深处。"
    },
    // 18. 风雷极速引 - 针对速度与爆发类药性
    {
        id: "herbs_114", name: "逐日金乌羽", type: "material", subType: "herbs", grade: 1, rarity: 4, value: 48,
        isPrimary: false,
        effects: { mp: 48 },
        properties: { catalyst: 88, speed: 25 },
        desc: "外形酷似羽毛的金色叶片，能让丹药产生的速度增益更具爆发力，步履逐日。"
    }
];
const herbs_aux_r5_value = [
    // 1. 愈合加成 - 补充 heal 药性
    {
        id: "herbs_115", name: "天枢再生髓", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 78,
        isPrimary: false,
        effects: { hp: 78 },
        properties: { heal: 165 },
        desc: "凝聚了星辰生机的晶莹胶质，能让断裂的经脉在瞬息间完成初步重塑。"
    },
    // 2. 行气加成 - 补充 qi 药性
    {
        id: "herbs_116", name: "五色聚灵芝", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 72,
        isPrimary: false,
        effects: { mp: 72 },
        properties: { qi: 160 },
        desc: "芝伞呈现五彩光晕，天生具有强行提纯天地法力的能力，是仙级灵药的极佳配角。"
    },
    // 3. 锋锐加成 - 补充 atk 药性
    {
        id: "herbs_117", name: "破天锋芒尖", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 65,
        isPrimary: false,
        effects: { hp: -15, mp: 50 }, // 攻击性极强，反噬血气
        properties: { atk: 175 },
        desc: "生于万载剑气坑中的怪异植物，尖端极其锋利，可赋予丹药破开万法之势。"
    },
    // 4. 厚实加成 - 补充 def 药性
    {
        id: "herbs_118", name: "不灭金身叶", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 75,
        isPrimary: false,
        effects: { hp: 75 },
        properties: { def: 170 },
        desc: "叶片质感如纯金打造，沉重无比，炼制出的丹药能让肉身防御产生质变。"
    },
    // 5. 迅捷加成 - 补充 speed 药性
    {
        id: "herbs_119", name: "幻影流光根", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 70,
        isPrimary: false,
        effects: { mp: 70 },
        properties: { speed: 162 },
        desc: "根茎在地下游走不定，极难捕捉，能为丹药注入一种超脱肉身束缚的流动感。"
    },
    // 6. 提神加成 - 补充 shen 药性
    {
        id: "herbs_120", name: "太上清心籽", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 68,
        isPrimary: false,
        effects: { mp: 68 },
        properties: { shen: 170 },
        desc: "一种近乎透明的种子，服之可令神魂如洗，瞬间洞察诸多原本晦涩的大道规则。"
    }
];
const herbs_aux_r5_stable = [
    // 7. 仙级核心稳定 - 镇压法则碰撞
    {
        id: "herbs_121", name: "万年沉魂木", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 70,
        isPrimary: false,
        effects: { hp: 40, mp: 30 },
        properties: { stabilizer: 200 },
        desc: "沉睡于极阴之地的万年古木心，其厚重的药性能强行定住丹炉内的虚空，使法则趋于平稳。"
    },
    // 8. 狂暴能量中和 - 专门针对高阶 ATK/JING 药性
    {
        id: "herbs_122", name: "混元定息草", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 75,
        isPrimary: false,
        effects: { hp: 75 },
        properties: { stabilizer: 170, heal: 50 },
        desc: "叶片呈灰蒙色，能吸纳并转化炉内过剩的狂暴血气，防止丹药因药力过剩而崩解。"
    },
    // 9. 绝对领域冰封 - 针对极高热量或暴烈仙草
    {
        id: "herbs_123", name: "九幽冰蚕丝", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 68,
        isPrimary: false,
        effects: { mp: 68 },
        properties: { stabilizer: 180 },
        desc: "虽名为丝，实为一种极寒植物的纤维，能瞬间冷却任何暴乱的仙火药性。"
    },
    // 10. 法力界限稳定 - 针对开天、造化类大容量丹药
    {
        id: "herbs_124", name: "天河引路砂", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 72,
        isPrimary: false,
        effects: { mp: 72 },
        properties: { stabilizer: 175, qiMax: 60 },
        desc: "闪烁着星光的砂质草药，能引导浩瀚法力按特定轨迹流转，防止灵压炸炉。"
    },
    // 11. 神识领域压制 - 针对顶级悟性/神识丹药
    {
        id: "herbs_125", name: "六根清净藕", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 66,
        isPrimary: false,
        effects: { mp: 66 },
        properties: { stabilizer: 165, shen: 60 },
        desc: "生于仙池中的异草，服之或炼之皆能让人进入绝对的冷静，是炼制悟道仙丹的定神物。"
    },
    // 12. 仙级万能融合剂 - 融合多重仙级药性
    {
        id: "herbs_126", name: "两仪造化胶", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 80,
        isPrimary: false,
        effects: { hp: 40, mp: 40 },
        properties: { stabilizer: 190, catalyst: 50 },
        desc: "呈现阴阳两色的粘稠胶液，能调和天地间对立的药性，是尝试复杂禁忌配方的核心保障。"
    }
];
const herbs_aux_r5_guide = [
    // 13. 仙级极品药引 - 极致催化，将药力压榨至极限
    {
        id: "herbs_127", name: "九色圣芝涎", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 70,
        isPrimary: false,
        effects: { hp: 35, mp: 35 },
        properties: { catalyst: 195 },
        desc: "圣芝根部渗出的七彩液滴，能瞬间激活沉睡的药灵，使成丹药效倍增。"
    },
    // 14. 涅槃导向引 - 针对顶级 heal 药性，实现“破后而立”
    {
        id: "herbs_128", name: "凤血引魂丝", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 78,
        isPrimary: false,
        effects: { hp: 78 },
        properties: { catalyst: 160, heal: 80 },
        desc: "赤红如焰的细长纤维，能引导生机药力渗入灵魂深处，炼制起死回生丹必备。"
    },
    // 15. 混元归灵引 - 针对顶级 qi 药性，极大提升仙元纯度
    {
        id: "herbs_129", name: "天脉捕灵钩", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 72,
        isPrimary: false,
        effects: { mp: 72 },
        properties: { catalyst: 160, qi: 80 },
        desc: "生长在天脉交汇处的怪异弯钩，擅长钩织散乱的法力法则，使其归于丹元。"
    },
    // 16. 圣体拓宽引 - 针对 ATK/DEF/JING 等肉身法则的深度引导
    {
        id: "herbs_130", name: "金刚透甲钻", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 65,
        isPrimary: false,
        effects: { hp: 30, mp: 35 },
        properties: { catalyst: 175, jing: 60 },
        desc: "坚硬程度堪比仙金的植物根部，能强行打通肉身与药力间的隔阂。"
    },
    // 17. 慧眼通明引 - 针对顶级神识/悟性类仙丹
    {
        id: "herbs_131", name: "七心琉璃盏", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 68,
        isPrimary: false,
        effects: { mp: 68 },
        properties: { catalyst: 170, shen: 70 },
        desc: "状如灯盏的透明奇花，能引导神识类药力在修士脑中构建虚幻道境，加速感悟。"
    },
    // 18. 时空疾影引 - 针对顶级速度/挪移药性
    {
        id: "herbs_132", name: "扶摇九天引", type: "material", subType: "herbs", grade: 2, rarity: 5, value: 70,
        isPrimary: false,
        effects: { mp: 70 },
        properties: { catalyst: 180, speed: 70 },
        desc: "随风化作流光的轻盈草种，能赋予药力突破虚空限制的引导性。"
    }
];
const herbs_aux_r6 = [
    // --- 第一类：数值加成类 (133-138) ---
    {
        id: "herbs_133", name: "太初生机源", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 100,
        isPrimary: false, effects: { hp: 100 }, properties: { heal: 420 },
        desc: "世界树凋零后留下的本源核心，每一滴汁液都能让枯萎的生命重燃。"
    },
    {
        id: "herbs_134", name: "天道灵韵芯", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 95,
        isPrimary: false, effects: { mp: 95 }, properties: { qi: 400 },
        desc: "在大道交汇处孕育的晶体，能为丹药注入源源不断的诸天法力。"
    },
    {
        id: "herbs_135", name: "灭世劫雷灰", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 85,
        isPrimary: false, effects: { hp: -20, mp: 65 }, properties: { atk: 450 },
        desc: "毁灭之雷留下的残渣，炼入丹中可使药力附带天劫般的破坏力。"
    },
    {
        id: "herbs_136", name: "混沌息壤土", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 90,
        isPrimary: false, effects: { hp: 90 }, properties: { def: 420 },
        desc: "万土之母，重若星辰，能赋予肉身绝对无法撼动的厚重防御。"
    },
    {
        id: "herbs_137", name: "宙光流影须", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 88,
        isPrimary: false, effects: { mp: 88 }, properties: { speed: 400 },
        desc: "游走于时间长河边缘的植物须根，使药效的爆发超脱空间限制。"
    },
    {
        id: "herbs_138", name: "万古悟道心", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 92,
        isPrimary: false, effects: { mp: 92 }, properties: { shen: 450 },
        desc: "菩提古树的树心残片，不仅提供神性，还能让人在一瞬间感悟万年。"
    },

    // --- 第二类：中和稳定类 (139-144) ---
    {
        id: "herbs_139", name: "定海神针木", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 95,
        isPrimary: false, effects: { hp: 50, mp: 45 }, properties: { stabilizer: 450 },
        desc: "能定住诸天汪洋的奇木，是镇压神话级丹药药性暴动的唯一圣物。"
    },
    {
        id: "herbs_140", name: "造化阴阳平衡草", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 90,
        isPrimary: false, effects: { hp: 90 }, properties: { stabilizer: 400, heal: 100 },
        desc: "叶分阴阳，自行调节炉内属性平衡，极大降低神话配方的难度。"
    },
    {
        id: "herbs_141", name: "绝对零度冰晶", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 85,
        isPrimary: false, effects: { mp: 85 }, properties: { stabilizer: 380 },
        desc: "连时间都能冻结的寒冰，足以瞬间驯服哪怕是最暴戾的火系仙草。"
    },
    {
        id: "herbs_142", name: "无量功德露", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 100,
        isPrimary: false, effects: { hp: 50, mp: 50 }, properties: { stabilizer: 420, catalyst: 100 },
        desc: "凝聚天道功德的露珠，能化解一切冲突，使丹成之时天降祥瑞。"
    },
    {
        id: "herbs_143", name: "虚空稳态石", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 80,
        isPrimary: false, effects: { mp: 80 }, properties: { stabilizer: 410 },
        desc: "维持虚空稳定的奇石，防止炼制神级丹药时因能量过强撕裂空间。"
    },
    {
        id: "herbs_144", name: "归墟净化泉", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 88,
        isPrimary: false, effects: { hp: 88 }, properties: { stabilizer: 390 },
        desc: "万水归处，能洗去药材中哪怕是一丁点法则不纯的瑕疵。"
    },

    // --- 第三类：药效引导类 (145-150) ---
    {
        id: "herbs_145", name: "至尊天命引", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 100,
        isPrimary: false, effects: { hp: 50, mp: 50 }, properties: { catalyst: 450 },
        desc: "承载天命意志的药引，强制将所有药理属性完美融合并转化为神效。"
    },
    {
        id: "herbs_146", name: "轮回塑命丝", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 98,
        isPrimary: false, effects: { hp: 98 }, properties: { catalyst: 380, heal: 200 },
        desc: "传说中能沟通轮回的丝线，将生机引导至灵魂最深处。"
    },
    {
        id: "herbs_147", name: "诸天牵引蔓", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 92,
        isPrimary: false, effects: { mp: 92 }, properties: { catalyst: 380, qi: 200 },
        desc: "伸入诸天万界的藤蔓，能够跨位面牵引仙元法力入丹。"
    },
    {
        id: "herbs_148", name: "圣道穿透刺", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 85,
        isPrimary: false, effects: { hp: 40, mp: 45 }, properties: { catalyst: 410, atk: 150 },
        desc: "带有圣人威压的尖刺，能无视任何防御障碍，引导药力直透本源。"
    },
    {
        id: "herbs_149", name: "大道通明芯", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 90,
        isPrimary: false, effects: { mp: 90 }, properties: { catalyst: 400, shen: 150 },
        desc: "能映照诸天大道的灯芯，引导悟性药力让修士进入“永恒一瞬”的感悟。"
    },
    {
        id: "herbs_150", name: "扶摇九幽种", type: "material", subType: "herbs", grade: 2, rarity: 6, value: 88,
        isPrimary: false, effects: { mp: 88 }, properties: { catalyst: 420, speed: 150 },
        desc: "一旦种下瞬息长成，其引导的速度药力能让修士遁速比肩星火。"
    }
];
 const herbs = [
     ...herbs_primary_r1,
     ...herbs_primary_r2,
     ...herbs_primary_r3,
      ...herbs_primary_r4,
      ...herbs_primary_r5,
      ...herbs_primary_r6,
     ...herbs_aux_r1_value ,
      ...herbs_aux_r2_value,
      ...herbs_aux_r3_value,
      ...herbs_aux_r4_value,
     ...herbs_aux_r5_value,
     ...herbs_aux_r1_stable,
     ...herbs_aux_r2_stable,
      ...herbs_aux_r3_stable,
      ...herbs_aux_r4_stable,
     ...herbs_aux_r5_stable,
     ...herbs_aux_r1_guide,
      ...herbs_aux_r2_guide,
      ...herbs_aux_r3_guide,
      ...herbs_aux_r4_guide,
      ...herbs_aux_r5_guide,
     ...herbs_aux_r6
    ];
