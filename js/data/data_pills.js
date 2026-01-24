// 丹药
//console.log("加载 丹药");
// js/data/data_pills.js (R1级别 - 第一批)

const pills_r1_batch_1 = [
    // === Reply: HP 回复 (3条) ===
    {
        id: "pills_r1_001", name: "止血散",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 50,
        effects: { hp: 50 },
        formula: { primary: "herbs_001", requirements: { heal: 20, stabilizer: 5 } },
        desc: "入门级伤药，能快速处理细小伤口。"
    },
    {
        id: "herbs_r1_002", name: "生肌膏",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 75,
        effects: { hp: 75 },
        formula: { primary: "herbs_001", requirements: { heal: 30, stabilizer: 8 } },
        desc: "药性较散剂更持久，有助于血肉再生。"
    },
    {
        id: "pills_r1_003", name: "凝血丹",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 100,
        effects: { hp: 100 },
        formula: { primary: "herbs_001", requirements: { heal: 40, stabilizer: 10 } },
        desc: "R1顶尖伤药，内服可稳固气血，止住内出血。"
    },

    // === Reply: MP 回复 (3条) ===
    {
        id: "pills_r1_004", name: "甘草汤",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 50,
        effects: { mp: 50 },
        formula: { primary: "herbs_002", requirements: { qi: 20, stabilizer: 5 } },
        desc: "清淡的药汤，能滋润干涸的经脉。"
    },
    {
        id: "pills_r1_005", name: "回气散",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 75,
        effects: { mp: 75 },
        formula: { primary: "herbs_002", requirements: { qi: 30, stabilizer: 8 } },
        desc: "针对法力枯竭设计的药散，回复速度较快。"
    },
    {
        id: "pills_r1_006", name: "纳灵丸",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 100,
        effects: { mp: 100 },
        formula: { primary: "herbs_002", requirements: { qi: 40, stabilizer: 10 } },
        desc: "在凡品丹药中拥有极佳的引灵效果。"
    },

    // === Reply: HP & MP 复合 (3条) ===
    // 复合药需要主药+副方向的药性
    {
        id: "pills_r1_007", name: "调理散",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60,
        effects: { hp: 30, mp: 30 },
        formula: { primary: "herbs_001", requirements: { heal: 15, qi: 15, stabilizer: 10 } },
        desc: "兼顾肉身与气息的调理，药力温和。"
    },
    {
        id: "pills_r1_008", name: "双效丸",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 90,
        effects: { hp: 45, mp: 45 },
        formula: { primary: "herbs_001", requirements: { heal: 25, qi: 25, stabilizer: 12 } },
        desc: "平衡了两种药性的凡品丹药。"
    },
    {
        id: "pills_r1_009", name: "两仪丹",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 1, value: 120,
        effects: { hp: 60, mp: 60 },
        formula: { primary: "herbs_001", requirements: { heal: 35, qi: 35, stabilizer: 15 } },
        desc: "R1级别的平衡巅峰，气血双补。"
    },

    // === Buff: ATK 攻击 (第1条) ===
    {
        id: "pills_r1_010", name: "薄力散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 15,
        effects: { buff: { attr: 'atk', val: 1, days: 1 } },
        formula: { primary: "herbs_003", requirements: { atk: 20, stabilizer: 5 } },
        desc: "入门级力量增幅，效果极其有限。"
    }
];
const pills_r1_batch_2 = [
    // === Buff: ATK 攻击 (补完后2条) ===
    {
        id: "pills_r1_011", name: "蛮牛丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 75,
        effects: { buff: { attr: 'atk', val: 3, days: 2 } },
        formula: { primary: "herbs_003", requirements: { atk: 30, stabilizer: 8 } },
        desc: "仿效蛮牛之力，服用后双臂力气大增。"
    },
    {
        id: "pills_r1_012", name: "赤阳丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 225,
        effects: { buff: { attr: 'atk', val: 5, days: 3 } },
        formula: { primary: "herbs_003", requirements: { atk: 45, stabilizer: 12 } },
        desc: "R1攻击丹药之首，药性炽热，如烈阳焚身。"
    },

    // === Buff: DEF 防御 (3条) ===
    {
        id: "pills_r1_013", name: "铁皮散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 15,
        effects: { buff: { attr: 'def', val: 1, days: 1 } },
        formula: { primary: "herbs_004", requirements: { def: 20, stabilizer: 5 } },
        desc: "最基础的护身散剂，能稍微加固皮肤韧性。"
    },
    {
        id: "pills_r1_014", name: "石肤丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 90,
        effects: { buff: { attr: 'def', val: 3, days: 2 } },
        formula: { primary: "herbs_004", requirements: { def: 30, stabilizer: 8 } },
        desc: "服用后皮肤如粗石般坚硬，普通钝器难伤。"
    },
    {
        id: "pills_r1_015", name: "坚韧丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 225,
        effects: { buff: { attr: 'def', val: 5, days: 3 } },
        formula: { primary: "herbs_004", requirements: { def: 45, stabilizer: 12 } },
        desc: "R1防御巅峰，药力入骨，极大地提升肉身抗性。"
    },

    // === Buff: Speed 速度 (3条) ===
    {
        id: "pills_r1_016", name: "轻灵散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 15,
        effects: { buff: { attr: 'speed', val: 1, days: 1 } },
        formula: { primary: "herbs_005", requirements: { speed: 20, stabilizer: 5 } },
        desc: "消除身体沉重感，入门级身法药剂。"
    },
    {
        id: "pills_r1_017", name: "燕行丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 75,
        effects: { buff: { attr: 'speed', val: 3, days: 2 } },
        formula: { primary: "herbs_005", requirements: { speed: 30, stabilizer: 8 } },
        desc: "身轻如燕，短时间内能显著提升移动速度。"
    },
    {
        id: "pills_r1_018", name: "神行丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 225,
        effects: { buff: { attr: 'speed', val: 5, days: 3 } },
        formula: { primary: "herbs_005", requirements: { speed: 45, stabilizer: 12 } },
        desc: "双腿生风，在凡级修士中堪称神速。"
    },

    // === Buff: Jing 体质 (前2条) ===
    {
        id: "pills_r1_019", name: "壮根散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 40,
        effects: { buff: { attr: 'jing', val: 1, days: 2 } },
        formula: { primary: "herbs_006", requirements: { jing: 20, stabilizer: 6 } },
        desc: "微弱提升血肉根基，使躯体更耐劳累。"
    },
    {
        id: "pills_r1_020", name: "强体丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 120,
        effects: { buff: { attr: 'jing', val: 3, days: 2 } },
        formula: { primary: "herbs_006", requirements: { jing: 30, stabilizer: 10 } },
        desc: "通过药力洗涤血肉，显著增强体质强度。"
    }
];
const pills_r1_batch_3 = [
    // === Buff: Jing 体质 (补完后1条) ===
    {
        id: "pills_r1_021", name: "培元丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 300,
        effects: { buff: { attr: 'jing', val: 5, days: 3 } },
        formula: { primary: "herbs_006", requirements: { jing: 45, stabilizer: 15 } },
        desc: "R1体质巅峰之药，固本培元，使肉身根基稳如磐石。"
    },

    // === Buff: Qi 能量上限 (3条) ===
    {
        id: "pills_r1_022", name: "聚气散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 40,
        effects: { buff: { attr: 'qi', val: 1, days: 2 } },
        formula: { primary: "herbs_007", requirements: { qiMax: 20, stabilizer: 6 } },
        desc: "引导外界法力在丹田汇聚，略微扩充法力容量。"
    },
    {
        id: "pills_r1_023", name: "汇能丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 120,
        effects: { buff: { attr: 'qi', val: 3, days: 2 } },
        formula: { primary: "herbs_007", requirements: { qiMax: 30, stabilizer: 10 } },
        desc: "显著增强气海活跃度，使修士能承载更多真气。"
    },
    {
        id: "pills_r1_024", name: "蕴灵丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 300,
        effects: { buff: { attr: 'qi', val: 5, days: 3 } },
        formula: { primary: "herbs_007", requirements: { qiMax: 45, stabilizer: 15 } },
        desc: "R1能量增幅极品，丹田内仿佛有灵雾氤氲。"
    },

    // === Buff: Shen 悟性 (3条) ===
    {
        id: "pills_r1_025", name: "安神丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 20,
        effects: { buff: { attr: 'shen', val: 1, days: 1 } },
        formula: { primary: "herbs_008", requirements: { shen: 20, stabilizer: 8 } },
        desc: "平复烦躁心绪，使脑海恢复基础的清明。"
    },
    {
        id: "pills_r1_026", name: "清明丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 120,
        effects: { buff: { attr: 'shen', val: 3, days: 2 } },
        formula: { primary: "herbs_008", requirements: { shen: 30, stabilizer: 12 } },
        desc: "灵台如被泉水洗涤，参悟功法时偶有灵光现。"
    },
    {
        id: "pills_r1_027", name: "悟道散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 300,
        effects: { buff: { attr: 'shen', val: 5, days: 3 } },
        formula: { primary: "herbs_008", requirements: { shen: 45, stabilizer: 18 } },
        desc: "R1悟性神药，暂时切断红尘干扰，极其利于突破瓶颈。"
    },

    // === Study: StudyEff 研读效率 (3条) ===
    // 研读药通常使用 Shen (悟性) 属性作为核心
    {
        id: "pills_r1_028", name: "清心茶饼",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 100,
        effects: { buff: { attr: 'studyEff', val: 0.1, days: 2 } },
        formula: { primary: "herbs_008", requirements: { shen: 25, stabilizer: 5 } },
        desc: "淡淡的茶香有助于集中注意力。研读效率+10%。"
    },
    {
        id: "pills_r1_029", name: "醒脑含片",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 180,
        effects: { buff: { attr: 'studyEff', val: 0.12, days: 3 } },
        formula: { primary: "herbs_008", requirements: { shen: 35, stabilizer: 10 } },
        desc: "清凉通窍，能让人在书案前坐得更久。研读效率+12%。"
    },
    {
        id: "pills_r1_030", name: "檀木熏香",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 1, value: 225,
        effects: { buff: { attr: 'studyEff', val: 0.15, days: 3 } },
        formula: { primary: "herbs_008", requirements: { shen: 45, stabilizer: 15 } },
        desc: "名贵檀木制成，极大缩短翻阅典籍的时间。研读效率+15%。"
    }
];

const pills_r2_batch_1 = [
    // === Reply: HP 回复 (3条) ===
    {
        id: "pills_r2_001", name: "地榆散",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 150,
        effects: { hp: 150 },
        formula: { primary: "herbs_009", requirements: { heal: 40, stabilizer: 15 } },
        desc: "以血竭花为主材炼制的精品药散，止血极快。"
    },
    {
        id: "pills_r2_002", name: "生肌散",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 175,
        effects: { hp: 175 },
        formula: { primary: "herbs_009", requirements: { heal: 60, stabilizer: 20 } },
        desc: "药力渗透血肉，能加速较大伤口的愈合与再生。"
    },
    {
        id: "pills_r2_003", name: "三七复元丹",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 200,
        effects: { hp: 200 },
        formula: { primary: "herbs_009", requirements: { heal: 80, stabilizer: 25 } },
        desc: "R2顶级伤药，不仅能生肌，更能修补受损的微弱经络。"
    },

    // === Reply: MP 回复 (3条) ===
    {
        id: "pills_r2_004", name: "玉竹饮",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 150,
        effects: { mp: 150 },
        formula: { primary: "herbs_010", requirements: { qi: 40, stabilizer: 15 } },
        desc: "口感清甜，入腹后能感觉到一丝丝法力回流至丹田。"
    },
    {
        id: "pills_r2_005", name: "麦冬含露",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 175,
        effects: { mp: 175 },
        formula: { primary: "herbs_010", requirements: { qi: 60, stabilizer: 20 } },
        desc: "提取了灵草中的露珠精华，对消耗过大的修士极有帮助。"
    },
    {
        id: "pills_r2_006", name: "滋养丹田丸",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 200,
        effects: { mp: 200 },
        formula: { primary: "herbs_010", requirements: { qi: 80, stabilizer: 25 } },
        desc: "精品回气丹药，能稳固丹田，提升法力的回复速率。"
    },

    // === Reply: HP & MP 复合 (3条) ===
    {
        id: "pills_r2_007", name: "红景天膏",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 160,
        effects: { hp: 80, mp: 80 },
        formula: { primary: "herbs_009", requirements: { heal: 30, qi: 30, stabilizer: 20 } },
        desc: "抗劳耐乏，均衡补益气血与真元，不再仅仅是表面治愈。"
    },
    {
        id: "pills_r2_008", name: "当归养血丸",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 220,
        effects: { hp: 110, mp: 110 },
        formula: { primary: "herbs_009", requirements: { heal: 45, qi: 45, stabilizer: 25 } },
        desc: "活血养髓，兼顾肉身治愈与法力运行的精品平衡丹药。"
    },
    {
        id: "pills_r2_009", name: "六味地黄丸",canDo: true   , subType: "reply", type: "pill", grade: 0, rarity: 2, value: 280,
        effects: { hp: 140, mp: 140 },
        formula: { primary: "herbs_009", requirements: { heal: 60, qi: 60, stabilizer: 30 } },
        desc: "R2复合类神药，滋阴补肾，是修士调理长期亏损的最佳选择。"
    },

    // === Buff: ATK 攻击 (第1条) ===
    {
        id: "pills_r2_010", name: "龙葵丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 75,
        effects: { buff: { attr: 'atk', val: 5, days: 1 } },
        formula: { primary: "herbs_011", requirements: { atk: 40, stabilizer: 15 } },
        desc: "通过烈性药材刺激经络，短时间内爆发出更强的攻击性。"
    }
];
const pills_r2_batch_2 = [
    // === Buff: ATK 攻击 (补完后2条) ===
    {
        id: "pills_r2_011", name: "剑气散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360,
        effects: { buff: { attr: 'atk', val: 8, days: 3 } },
        formula: { primary: "herbs_011", requirements: { atk: 60, stabilizer: 20 } },
        desc: "服用后举手投足带有锐气，能将真气转化为锋利的劲力。"
    },
    {
        id: "pills_r2_012", name: "狂暴丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 720,
        effects: { buff: { attr: 'atk', val: 12, days: 4 } },
        formula: { primary: "herbs_011", requirements: { atk: 85, stabilizer: 30 } },
        desc: "R2攻击极致之丹，药力狂野，使身体时刻处于临战状态。"
    },

    // === Buff: DEF 防御 (3条) ===
    {
        id: "pills_r2_013", name: "龟甲丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 150,
        effects: { buff: { attr: 'def', val: 5, days: 2 } },
        formula: { primary: "herbs_012", requirements: { def: 40, stabilizer: 15 } },
        desc: "模拟灵龟之息，在身体表层形成一层稳固的真气护层。"
    },
    {
        id: "pills_r2_014", name: "岩心丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360,
        effects: { buff: { attr: 'def', val: 8, days: 3 } },
        formula: { primary: "herbs_012", requirements: { def: 60, stabilizer: 20 } },
        desc: "提取地脉岩石精华炼制，防御力提升显著，且不易被击退。"
    },
    {
        id: "pills_r2_015", name: "玄武固本丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 900,
        effects: { buff: { attr: 'def', val: 12, days: 5 } },
        formula: { primary: "herbs_012", requirements: { def: 85, stabilizer: 30 } },
        desc: "R2防御巅峰，服用后不仅肉身坚韧，更能免疫部分凡间毒素。"
    },

    // === Buff: Speed 速度 (3条) ===
    {
        id: "pills_r2_016", name: "云雀丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 150,
        effects: { buff: { attr: 'speed', val: 5, days: 2 } },
        formula: { primary: "herbs_013", requirements: { speed: 40, stabilizer: 15 } },
        desc: "如云雀般轻盈，极大优化了修士在复杂地形的移动。"
    },
    {
        id: "pills_r2_017", name: "极速水",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360,
        effects: { buff: { attr: 'speed', val: 8, days: 3 } },
        formula: { primary: "herbs_013", requirements: { speed: 60, stabilizer: 20 } },
        desc: "液态丹药，服用后瞬间起效，让身体仿佛失去了重量。"
    },
    {
        id: "pills_r2_018", name: "追风赶月丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 720,
        effects: { buff: { attr: 'speed', val: 12, days: 4 } },
        formula: { primary: "herbs_013", requirements: { speed: 85, stabilizer: 30 } },
        desc: "R2速度巅峰，长距离奔袭的最佳伴侣，移动时带起残影。"
    },

    // === Buff: Jing 体质 (前2条) ===
    {
        id: "pills_r2_019", name: "接骨丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 400,
        effects: { buff: { attr: 'jing', val: 5, days: 4 } },
        formula: { primary: "herbs_014", requirements: { jing: 40, stabilizer: 20 } },
        desc: "强健骨骼，使修士在受到重击时能维持身体结构不崩溃。"
    },
    {
        id: "pills_r2_020", name: "大力牛魔丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 800,
        effects: { buff: { attr: 'jing', val: 8, days: 5 } },
        formula: { primary: "herbs_014", requirements: { jing: 60, stabilizer: 25 } },
        desc: "名字粗俗但药力惊人，能全面提升血肉的承载上限。"
    }
];
const pills_r2_batch_3 = [
    // === Buff: Jing 体质 (补完后1条) ===
    {
        id: "pills_r2_021", name: "百年首乌丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 1680,
        effects: { buff: { attr: 'jing', val: 12, days: 7 } },
        formula: { primary: "herbs_014", requirements: { jing: 85, stabilizer: 35 } },
        desc: "以百年首乌为主材，服用后须发皆黑，血气旺盛如潮。临时体质+12(7天)。"
    },

    // === Buff: Qi 能量上限 (3条) ===
    {
        id: "pills_r2_022", name: "星光散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 400,
        effects: { buff: { attr: 'qi', val: 5, days: 4 } },
        formula: { primary: "herbs_015", requirements: { qiMax: 40, stabilizer: 20 } },
        desc: "药粉中有点点星光，能暂时拓宽气海。临时能量+5(4天)。"
    },
    {
        id: "pills_r2_023", name: "地脉丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 800,
        effects: { buff: { attr: 'qi', val: 8, days: 5 } },
        formula: { primary: "herbs_015", requirements: { qiMax: 60, stabilizer: 25 } },
        desc: "采集地脉法力浓缩而成，厚德载物，气海大增。临时能量+8(5天)。"
    },
    {
        id: "pills_r2_024", name: "浩瀚丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 1680,
        effects: { buff: { attr: 'qi', val: 12, days: 7 } },
        formula: { primary: "herbs_015", requirements: { qiMax: 85, stabilizer: 35 } },
        desc: "R2能量增幅之最，丹田如海纳百川。临时能量+12(7天)。"
    },

    // === Buff: Shen 悟性 (3条) ===
    {
        id: "pills_r2_025", name: "忘忧丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 300,
        effects: { buff: { attr: 'shen', val: 5, days: 3 } },
        formula: { primary: "herbs_016", requirements: { shen: 40, stabilizer: 25 } },
        desc: "忘却凡尘忧扰，心无杂念，神识清明。临时悟性+5(3天)。"
    },
    {
        id: "pills_r2_026", name: "慧心丸",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 640,
        effects: { buff: { attr: 'shen', val: 8, days: 4 } },
        formula: { primary: "herbs_016", requirements: { shen: 60, stabilizer: 30 } },
        desc: "开慧启智，对天地玄机的感知更加敏锐。临时悟性+8(4天)。"
    },
    {
        id: "pills_r2_027", name: "灵犀丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 1200,
        effects: { buff: { attr: 'shen', val: 12, days: 5 } },
        formula: { primary: "herbs_016", requirements: { shen: 85, stabilizer: 40 } },
        desc: "心有灵犀一点通，专为攻克功法瓶颈设计。临时悟性+12(5天)。"
    },

    // === Study: StudyEff 研读效率 (3条) ===
    {
        id: "pills_r2_028", name: "明目丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 400,
        effects: { buff: { attr: 'studyEff', val: 0.2, days: 4 } },
        formula: { primary: "herbs_016", requirements: { shen: 45, stabilizer: 20 } },
        desc: "萃取精品灵草精华，视力与思维双重提升。研读效率+20%(4天)。"
    },
    {
        id: "pills_r2_029", name: "青灯散",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 550,
        effects: { buff: { attr: 'studyEff', val: 0.22, days: 5 } },
        formula: { primary: "herbs_016", requirements: { shen: 65, stabilizer: 25 } },
        desc: "蕴含一丝苦修真意，使人沉浸书中不知寒暑。研读效率+22%(5天)。"
    },
    {
        id: "pills_r2_030", name: "通窍丹",canDo: true   , subType: "buff", type: "pill", grade: 0, rarity: 2, value: 875,
        effects: { buff: { attr: 'studyEff', val: 0.25, days: 7 } },
        formula: { primary: "herbs_016", requirements: { shen: 85, stabilizer: 35 } },
        desc: "R2研读巅峰，思维运转极快，典籍过目不忘。研读效率+25%(7天)。"
    }
];

const pills_r3_batch_1 = [
    // === Reply: HP 回复 (3条) ===
    {
        id: "pills_r3_001", name: "参王散",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 250,
        effects: { hp: 250 },
        formula: { primary: "herbs_017", requirements: { heal: 100, stabilizer: 35 } },
        desc: "以千年灵参为引，针对重伤修士开发的灵级药散。"
    },
    {
        id: "pills_r3_002", name: "活络灵膏",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 275,
        effects: { hp: 275 },
        formula: { primary: "herbs_017", requirements: { heal: 140, stabilizer: 45 } },
        desc: "药力不仅能止血，更能深入经络缝隙，修复暗伤。"
    },
    {
        id: "pills_r3_003", name: "生肌玉红丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 300,
        effects: { hp: 300 },
        formula: { primary: "herbs_017", requirements: { heal: 180, stabilizer: 55 } },
        desc: "R3顶级伤药，即便断肢亦有概率重续生机，不留疤痕。"
    },

    // === Reply: MP 回复 (3条) ===
    {
        id: "pills_r3_004", name: "聚灵液",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 250,
        effects: { mp: 250 },
        formula: { primary: "herbs_018", requirements: { qi: 100, stabilizer: 35 } },
        desc: "法力极度浓缩的液体，服用后瞬间填补丹田空虚。"
    },
    {
        id: "pills_r3_005", name: "清心归元散",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 275,
        effects: { mp: 275 },
        formula: { primary: "herbs_018", requirements: { qi: 140, stabilizer: 45 } },
        desc: "平复狂暴的真气流动，使其有序归入气海。"
    },
    {
        id: "pills_r3_006", name: "太玄化灵丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 300,
        effects: { mp: 300 },
        formula: { primary: "herbs_018", requirements: { qi: 180, stabilizer: 55 } },
        desc: "珍品级回气丹，其蕴含的法力纯度极高，无损根基。"
    },

    // === Reply: HP & MP 复合 (3条) ===
    {
        id: "pills_r3_007", name: "两仪参王丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 300,
        effects: { hp: 150, mp: 150 },
        formula: { primary: "herbs_017", requirements: { heal: 80, qi: 80, stabilizer: 50 } },
        desc: "平衡气血与真元，适合在战斗间隙快速调整状态。"
    },
    {
        id: "pills_r3_008", name: "赤血雪莲丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 400,
        effects: { hp: 200, mp: 200 },
        formula: { primary: "herbs_017", requirements: { heal: 110, qi: 110, stabilizer: 65 } },
        desc: "极寒与极热的完美融合，同步重塑体魄与灵核。"
    },
    {
        id: "pills_r3_009", name: "回春归命丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 3, value: 500,
        effects: { hp: 250, mp: 250 },
        formula: { primary: "herbs_017", requirements: { heal: 150, qi: 150, stabilizer: 80 } },
        desc: "R3复合之巅，枯木逢春之效，气血法力共振再生。"
    },

    // === Buff: ATK 攻击 (第1条) ===
    {
        id: "pills_r3_010", name: "雷元散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 360,
        effects: { buff: { attr: 'atk', val: 8, days: 3 } },
        formula: { primary: "herbs_019", requirements: { atk: 100, stabilizer: 40 } },
        desc: "雷击木提炼，爆发力极强。临时攻击+8(3天)。"
    }
];
const pills_r3_batch_2 = [
    // === Buff: ATK 攻击 (补完后2条) ===
    {
        id: "pills_r3_011", name: "天雷破军散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 900,
        effects: { buff: { attr: 'atk', val: 12, days: 5 } },
        formula: { primary: "herbs_019", requirements: { atk: 140, stabilizer: 50 } },
        desc: "融合了雷霆余威，每一击都隐带麻痹与破甲效果。临时攻击+12(5天)。"
    },
    {
        id: "pills_r3_012", name: "弑神散(凡)",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1575,
        effects: { buff: { attr: 'atk', val: 15, days: 7 } },
        formula: { primary: "herbs_019", requirements: { atk: 180, stabilizer: 65 } },
        desc: "R3攻击巅峰，虽名为凡，却已触及灵级杀伐之力的极致。临时攻击+15(7天)。"
    },

    // === Buff: DEF 防御 (3条) ===
    {
        id: "pills_r3_013", name: "岩心护体丸",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 360,
        effects: { buff: { attr: 'def', val: 8, days: 3 } },
        formula: { primary: "herbs_020", requirements: { def: 100, stabilizer: 40 } },
        desc: "地脉岩精淬炼，使皮肉如坚岩般密不透风。临时防御+8(3天)。"
    },
    {
        id: "pills_r3_014", name: "金石固甲丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 900,
        effects: { buff: { attr: 'def', val: 12, days: 5 } },
        formula: { primary: "herbs_020", requirements: { def: 140, stabilizer: 50 } },
        desc: "药力入骨，使骨骼与皮肤呈现出金属般的色泽。临时防御+12(5天)。"
    },
    {
        id: "pills_r3_015", name: "不动如山丸",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1575,
        effects: { buff: { attr: 'def', val: 15, days: 7 } },
        formula: { primary: "herbs_020", requirements: { def: 180, stabilizer: 65 } },
        desc: "R3防御巅峰，服用后稳如山岳，极难被破防。临时防御+15(7天)。"
    },

    // === Buff: Speed 速度 (3条) ===
    {
        id: "pills_r3_016", name: "风行瞬步散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 360,
        effects: { buff: { attr: 'speed', val: 8, days: 3 } },
        formula: { primary: "herbs_021", requirements: { speed: 100, stabilizer: 40 } },
        desc: "提升空气亲和度，减少移动阻力。临时速度+8(3天)。"
    },
    {
        id: "pills_r3_017", name: "幻影遁形丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 720,
        effects: { buff: { attr: 'speed', val: 12, days: 4 } },
        formula: { primary: "herbs_021", requirements: { speed: 140, stabilizer: 50 } },
        desc: "移动时带起数道残影，令人难以捉摸。临时速度+12(4天)。"
    },
    {
        id: "pills_r3_018", name: "极速风雷丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1125,
        effects: { buff: { attr: 'speed', val: 15, days: 5 } },
        formula: { primary: "herbs_021", requirements: { speed: 180, stabilizer: 60 } },
        desc: "R3速度巅峰，动若惊雷，势如疾风。临时速度+15(5天)。"
    },

    // === Buff: Jing 体质 (前2条) ===
    {
        id: "pills_r3_019", name: "麒麟强身散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 640,
        effects: { buff: { attr: 'jing', val: 8, days: 4 } },
        formula: { primary: "herbs_022", requirements: { jing: 100, stabilizer: 45 } },
        desc: "以麒麟血竭为媒，极大增强肉身负荷上限。临时体质+8(4天)。"
    },
    {
        id: "pills_r3_020", name: "龙血炼体丸",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1200,
        effects: { buff: { attr: 'jing', val: 12, days: 5 } },
        formula: { primary: "herbs_022", requirements: { jing: 140, stabilizer: 60 } },
        desc: "模仿龙族强悍血气，全方位重塑筋骨。临时体质+12(5天)。"
    }
];
const pills_r3_batch_3 = [
    // === Buff: Jing 体质 (补完后1条) ===
    {
        id: "pills_r3_021", name: "万寿无疆丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1500,
        effects: { buff: { attr: 'jing', val: 15, days: 7 } },
        formula: { primary: "herbs_022", requirements: { jing: 180, stabilizer: 75 } },
        desc: "R3体质之极，传闻服之可增寿元，气血滔天。临时体质+15(7天)。"
    },

    // === Buff: Qi 能量上限 (3条) ===
    {
        id: "pills_r3_022", name: "蕴灵聚能散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 640,
        effects: { buff: { attr: 'qi', val: 8, days: 4 } },
        formula: { primary: "herbs_023", requirements: { qiMax: 100, stabilizer: 45 } },
        desc: "紫罗灵芝提炼，使气海在短时间内获得扩张。临时能量+8(4天)。"
    },
    {
        id: "pills_r3_023", name: "地脉归元丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1200,
        effects: { buff: { attr: 'qi', val: 12, days: 5 } },
        formula: { primary: "herbs_023", requirements: { qiMax: 140, stabilizer: 60 } },
        desc: "沟通地脉法力，极大提升修士的真气储备上限。临时能量+12(5天)。"
    },
    {
        id: "pills_r3_024", name: "天河灌顶丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 2100,
        effects: { buff: { attr: 'qi', val: 15, days: 7 } },
        formula: { primary: "herbs_023", requirements: { qiMax: 180, stabilizer: 75 } },
        desc: "R3能量巅峰，气海如天河倒灌，法力澎湃。临时能量+15(7天)。"
    },

    // === Buff: Shen 悟性 (3条) ===
    {
        id: "herbs_r3_025", name: "紫烟安神丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 480,
        effects: { buff: { attr: 'shen', val: 8, days: 3 } },
        formula: { primary: "herbs_024", requirements: { shen: 100, stabilizer: 50 } },
        desc: "神识散发紫色烟霞，敏锐捕捉天地间的一丝感悟。临时悟性+8(3天)。"
    },
    {
        id: "herbs_r3_026", name: "通灵悟心丸",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 960,
        effects: { buff: { attr: 'shen', val: 12, days: 4 } },
        formula: { primary: "herbs_024", requirements: { shen: 140, stabilizer: 65 } },
        desc: "与自然沟通，使人陷入深度入定状态。临时悟性+12(4天)。"
    },
    {
        id: "herbs_r3_027", name: "灵犀入道丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1500,
        effects: { buff: { attr: 'shen', val: 15, days: 5 } },
        formula: { primary: "herbs_024", requirements: { shen: 180, stabilizer: 80 } },
        desc: "R3悟性巅峰，如圣人点化，思维运转至极限。临时悟性+15(5天)。"
    },

    // === Study: StudyEff 研读效率 (3条) ===
    {
        id: "pills_r3_028", name: "灵犀露",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 875,
        effects: { buff: { attr: 'studyEff', val: 0.35, days: 5 } },
        formula: { primary: "herbs_024", requirements: { shen: 120, stabilizer: 45 } },
        desc: "心有灵犀一点通，专破晦涩难解之语。研读效率+35%(5天)。"
    },
    {
        id: "pills_r3_029", name: "悟神散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1330,
        effects: { buff: { attr: 'studyEff', val: 0.38, days: 7 } },
        formula: { primary: "herbs_024", requirements: { shen: 160, stabilizer: 60 } },
        desc: "药力直达识海，极大缩短参悟中阶功法的时间。研读效率+38%(7天)。"
    },
    {
        id: "pills_r3_030", name: "青玄感悟丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 3, value: 2000,
        effects: { buff: { attr: 'studyEff', val: 0.4, days: 10 } },
        formula: { primary: "herbs_024", requirements: { shen: 190, stabilizer: 80 } },
        desc: "R3研读巅峰，仿佛在时间长河中静止参悟。研读效率+40%(10天)。"
    }
];

const pills_r4_batch_1 = [
    // === Reply: HP 回复 (3条) ===
    {
        id: "pills_r4_001", name: "流霞复体散",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 450,
        effects: { hp: 450 },
        formula: { primary: "herbs_025", requirements: { heal: 200, stabilizer: 80 } },
        desc: "极品复体药散，能瞬间封锁伤口并引导血气再生。"
    },
    {
        id: "pills_r4_002", name: "九叶生机膏",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 525,
        effects: { hp: 525 },
        formula: { primary: "herbs_025", requirements: { heal: 300, stabilizer: 100 } },
        desc: "提取九叶血参精华，针对致命伤势有极强的吊命效果。"
    },
    {
        id: "pills_r4_003", name: "生肌玉红露",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 600,
        effects: { hp: 600 },
        formula: { primary: "herbs_025", requirements: { heal: 400, stabilizer: 120 } },
        desc: "R4回复之巅，不仅修复肉身，更能滋养受损的生命本源。"
    },

    // === Reply: MP 回复 (3条) ===
    {
        id: "pills_r4_004", name: "幻心化灵水",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 450,
        effects: { mp: 450 },
        formula: { primary: "herbs_026", requirements: { qi: 200, stabilizer: 80 } },
        desc: "针对高阶法术消耗设计，药力如灵泉喷涌。"
    },
    {
        id: "pills_r4_005", name: "归元法力丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 525,
        effects: { mp: 525 },
        formula: { primary: "herbs_026", requirements: { qi: 300, stabilizer: 100 } },
        desc: "极大增强丹田对外界法力的亲和力，迅速回补真元。"
    },
    {
        id: "pills_r4_006", name: "太虚归元丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 600,
        effects: { mp: 600 },
        formula: { primary: "herbs_026", requirements: { qi: 400, stabilizer: 120 } },
        desc: "极品回气丹药，服用后法力如江河入海，无穷无尽。"
    },

    // === Reply: HP & MP 复合 (3条) ===
    {
        id: "pills_r4_007", name: "赤血化灵膏",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 500,
        effects: { hp: 250, mp: 250 },
        formula: { primary: "herbs_025", requirements: { heal: 180, qi: 180, stabilizer: 100 } },
        desc: "均衡修复身体与灵核，是高强度战斗后的最佳调理品。"
    },
    {
        id: "pills_r4_008", name: "龙纹归命丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 700,
        effects: { hp: 350, mp: 350 },
        formula: { primary: "herbs_025", requirements: { heal: 250, qi: 250, stabilizer: 130 } },
        desc: "灵级复合名方，龙纹之力能同步激发生命与真气的潜能。"
    },
    {
        id: "pills_r4_009", name: "混元造化丹",canDo: true   , subType: "reply", type: "pill", grade: 1, rarity: 4, value: 1000,
        effects: { hp: 500, mp: 500 },
        formula: { primary: "herbs_025", requirements: { heal: 350, qi: 350, stabilizer: 160 } },
        desc: "R4复合巅峰，再造混元之基，大幅度提升生存能力。"
    },

    // === Buff: ATK 攻击 (第1条) ===
    {
        id: "pills_r4_010", name: "焚天散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 540,
        effects: { buff: { attr: 'atk', val: 12, days: 3 } },
        formula: { primary: "herbs_027", requirements: { atk: 200, stabilizer: 90 } },
        desc: "蕴含地火气息，让每一击都带有毁灭性的爆发。临时攻击+12(3天)。"
    }
];
const pills_r4_batch_2 = [
    // === Buff: ATK 攻击 (补完后2条) ===
    {
        id: "pills_r4_011", name: "屠戮战灵丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1350,
        effects: { buff: { attr: 'atk', val: 18, days: 5 } },
        formula: { primary: "herbs_027", requirements: { atk: 300, stabilizer: 110 } },
        desc: "丹成时隐有金戈铁马之声，服用后战意滔天。临时攻击+18(5天)。"
    },
    {
        id: "pills_r4_012", name: "灭世劫雷丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2625,
        effects: { buff: { attr: 'atk', val: 25, days: 7 } },
        formula: { primary: "herbs_027", requirements: { atk: 420, stabilizer: 140 } },
        desc: "R4攻击之巅，药力中蕴含狂暴的雷霆法则。临时攻击+25(7天)。"
    },

    // === Buff: DEF 防御 (3条) ===
    {
        id: "pills_r4_013", name: "玄铁护身散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 540,
        effects: { buff: { attr: 'def', val: 12, days: 3 } },
        formula: { primary: "herbs_028", requirements: { def: 200, stabilizer: 90 } },
        desc: "使体表覆盖一层如玄铁般凝重的真气铠甲。临时防御+12(3天)。"
    },
    {
        id: "pills_r4_014", name: "金刚不坏丸",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1350,
        effects: { buff: { attr: 'def', val: 18, days: 5 } },
        formula: { primary: "herbs_028", requirements: { def: 300, stabilizer: 110 } },
        desc: "极品防御丹药，传闻服之可短时间内无视凡铁切割。临时防御+18(5天)。"
    },
    {
        id: "pills_r4_015", name: "厚德载物丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2625,
        effects: { buff: { attr: 'def', val: 25, days: 7 } },
        formula: { primary: "herbs_028", requirements: { def: 420, stabilizer: 140 } },
        desc: "R4防御之巅，引厚土之力入体，稳如山岳。临时防御+25(7天)。"
    },

    // === Buff: Speed 速度 (3条) ===
    {
        id: "pills_r4_016", name: "追影散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 540,
        effects: { buff: { attr: 'speed', val: 12, days: 3 } },
        formula: { primary: "herbs_029", requirements: { speed: 200, stabilizer: 90 } },
        desc: "极大增强腿部经脉的真气传导，快如鬼魅。临时速度+12(3天)。"
    },
    {
        id: "pills_r4_017", name: "流光遁影丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1080,
        effects: { buff: { attr: 'speed', val: 18, days: 4 } },
        formula: { primary: "herbs_029", requirements: { speed: 300, stabilizer: 110 } },
        desc: "移动时仿佛身化流光，视肉眼捕捉为无物。临时速度+18(4天)。"
    },
    {
        id: "pills_r4_018", name: "鲲鹏扶摇丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1875,
        effects: { buff: { attr: 'speed', val: 25, days: 5 } },
        formula: { primary: "herbs_029", requirements: { speed: 420, stabilizer: 130 } },
        desc: "R4速度巅峰，大鹏一日同风起，扶摇直上九万里。临时速度+25(5天)。"
    },

    // === Buff: Jing 体质 (前2条) ===
    {
        id: "pills_r4_019", name: "不灭金身散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1200,
        effects: { buff: { attr: 'jing', val: 12, days: 5 } },
        formula: { primary: "herbs_030", requirements: { jing: 220, stabilizer: 100 } },
        desc: "极大增强肉身的气血上限，呈现不灭之象。临时体质+12(5天)。"
    },
    {
        id: "pills_r4_020", name: "荒古巨兽丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2520,
        effects: { buff: { attr: 'jing', val: 18, days: 7 } },
        formula: { primary: "herbs_030", requirements: { jing: 320, stabilizer: 130 } },
        desc: "通过极其狂暴的药力扩充血管，获得巨兽般的生命力。临时体质+18(7天)。"
    }
];
const pills_r4_batch_3 = [
    // === Buff: Jing 体质 (补完后1条) ===
    {
        id: "pills_r4_021", name: "玄黄不灭丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 5000,
        effects: { buff: { attr: 'jing', val: 25, days: 10 } },
        formula: { primary: "herbs_030", requirements: { jing: 420, stabilizer: 160 } },
        desc: "R4体质巅峰，引玄黄之气洗髓，肉身近乎不朽。临时体质+25(10天)。"
    },

    // === Buff: Qi 能量上限 (3条) ===
    {
        id: "pills_r4_022", name: "天枢聚能散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1200,
        effects: { buff: { attr: 'qi', val: 12, days: 5 } },
        formula: { primary: "herbs_031", requirements: { qiMax: 220, stabilizer: 100 } },
        desc: "感应北斗天枢，强行拓宽丹田容量。临时能量+12(5天)。"
    },
    {
        id: "pills_r4_023", name: "气冲斗牛丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2520,
        effects: { buff: { attr: 'qi', val: 18, days: 7 } },
        formula: { primary: "herbs_031", requirements: { qiMax: 320, stabilizer: 130 } },
        desc: "真气浩荡冲盈，甚至在体外形成肉眼可见的异象。临时能量+18(7天)。"
    },
    {
        id: "pills_r4_024", name: "乾坤无极丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 5000,
        effects: { buff: { attr: 'qi', val: 25, days: 10 } },
        formula: { primary: "herbs_031", requirements: { qiMax: 420, stabilizer: 160 } },
        desc: "R4能量巅峰，丹田自成乾坤，真气无穷无尽。临时能量+25(10天)。"
    },

    // === Buff: Shen 悟性 (3条) ===
    {
        id: "pills_r4_025", name: "冰心凝神散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1200,
        effects: { buff: { attr: 'shen', val: 12, days: 5 } },
        formula: { primary: "herbs_032", requirements: { shen: 220, stabilizer: 110 } },
        desc: "心如冰鉴，不染尘埃，神识敏锐度极度提升。临时悟性+12(5天)。"
    },
    {
        id: "pills_r4_026", name: "神游太虚丸",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2520,
        effects: { buff: { attr: 'shen', val: 18, days: 7 } },
        formula: { primary: "herbs_032", requirements: { shen: 320, stabilizer: 140 } },
        desc: "神识仿佛脱离肉身，游历于法则之间。临时悟性+18(7天)。"
    },
    {
        id: "pills_r4_027", name: "太上感应丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 5000,
        effects: { buff: { attr: 'shen', val: 25, days: 10 } },
        formula: { primary: "herbs_032", requirements: { shen: 420, stabilizer: 170 } },
        desc: "R4悟性巅峰，如太上忘情，绝对理智下的悟道状态。临时悟性+25(10天)。"
    },

    // === Study: StudyEff 研读效率 (3条) ===
    {
        id: "pills_r4_028", name: "慧眼丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1575,
        effects: { buff: { attr: 'studyEff', val: 0.45, days: 7 } },
        formula: { primary: "herbs_032", requirements: { shen: 240, stabilizer: 100 } },
        desc: "看穿文字背后的真意，让晦涩的典籍变得浅显。研读效率+45%(7天)。"
    },
    {
        id: "pills_r4_029", name: "演道散",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2400,
        effects: { buff: { attr: 'studyEff', val: 0.48, days: 10 } },
        formula: { primary: "herbs_032", requirements: { shen: 340, stabilizer: 130 } },
        desc: "在大脑中模拟推演功法路径，效率惊人。研读效率+48%(10天)。"
    },
    {
        id: "pills_r4_030", name: "天演无缝丹",canDo: true   , subType: "buff", type: "pill", grade: 1, rarity: 4, value: 3500,
        effects: { buff: { attr: 'studyEff', val: 0.5, days: 14 } },
        formula: { primary: "herbs_032", requirements: { shen: 440, stabilizer: 160 } },
        desc: "R4研读巅峰，参悟速度提升一倍，且可持续两周。研读效率+50%(14天)。"
    }
];

const pills_r5_batch_1 = [
    // === Reply: HP 回复 (3条) ===
    {
        id: "pills_r5_001", name: "凤凰涅槃散",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 650,
        effects: { hp: 650 },
        formula: { primary: "herbs_033", requirements: { heal: 450, stabilizer: 150 } },
        desc: "仙级药散，蕴含不灭凤凰气息，伤势瞬间愈合。"
    },
    {
        id: "pills_r5_002", name: "天枢回天膏",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 725,
        effects: { hp: 725 },
        formula: { primary: "herbs_033", requirements: { heal: 700, stabilizer: 180 } },
        desc: "引北斗天枢星光入药，生死肉骨，强夺天工。"
    },
    {
        id: "pills_r5_003", name: "九转还魂丹(残)",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 800,
        effects: { hp: 800 },
        formula: { primary: "herbs_033", requirements: { heal: 950, stabilizer: 220 } },
        desc: "【稀世】纵使神魂受损，亦能凭此丹逆转阴阳，重聚生机。"
    },

    // === Reply: MP 回复 (3条) ===
    {
        id: "pills_r5_004", name: "太虚归元露",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 650,
        effects: { mp: 650 },
        formula: { primary: "herbs_034", requirements: { qi: 450, stabilizer: 150 } },
        desc: "汲取虚空灵髓炼制，瞬间充盈枯竭的仙元。"
    },
    {
        id: "pills_r5_005", name: "天仙玉露丸",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 725,
        effects: { mp: 725 },
        formula: { primary: "herbs_034", requirements: { qi: 700, stabilizer: 180 } },
        desc: "传说中天仙饮用的玉露凝结而成，真气回复源源不断。"
    },
    {
        id: "pills_r5_006", name: "至尊归灵丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 800,
        effects: { mp: 800 },
        formula: { primary: "herbs_034", requirements: { qi: 950, stabilizer: 220 } },
        desc: "回气丹药的巅峰，甚至能短暂引动法效共鸣，降低施法消耗。"
    },

    // === Reply: HP & MP 复合 (3条) ===
    {
        id: "pills_r5_007", name: "阴阳造化散",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 700,
        effects: { hp: 350, mp: 350 },
        formula: { primary: "herbs_033", requirements: { heal: 400, qi: 400, stabilizer: 180 } },
        desc: "平衡阴阳，再造躯体与灵核的和谐状态。"
    },
    {
        id: "pills_r5_008", name: "混沌归一丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 900,
        effects: { hp: 450, mp: 450 },
        formula: { primary: "herbs_033", requirements: { heal: 600, qi: 600, stabilizer: 220 } },
        desc: "返璞归真，将损伤转化为纯净的能量重新吸收。"
    },
    {
        id: "pills_r5_009", name: "圣灵大还丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 5, value: 1100,
        effects: { hp: 550, mp: 550 },
        formula: { primary: "herbs_033", requirements: { heal: 850, qi: 850, stabilizer: 260 } },
        desc: "R5复合之巅，一颗即可让频死修士瞬间恢复战斗力。"
    },

    // === Buff: ATK 攻击 (第1条) ===
    {
        id: "pills_r5_010", name: "天崩地裂散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 675,
        effects: { buff: { attr: 'atk', val: 15, days: 3 } },
        formula: { primary: "herbs_035", requirements: { atk: 450, stabilizer: 160 } },
        desc: "服用后每一击皆有崩天裂地之威。临时攻击+15(3天)。"
    }
];
const pills_r5_batch_2 = [
    // === Buff: ATK 攻击 (补完后2条) ===
    {
        id: "pills_r5_011", name: "诛仙屠魔丸",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 2625,
        effects: { buff: { attr: 'atk', val: 25, days: 7 } },
        formula: { primary: "herbs_035", requirements: { atk: 700, stabilizer: 200 } },
        desc: "引煞气入药，使真气转化为极具破坏力的毁灭能量。临时攻击+25(7天)。"
    },
    {
        id: "pills_r5_012", name: "天道裁决丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 6000,
        effects: { buff: { attr: 'atk', val: 40, days: 10 } },
        formula: { primary: "herbs_035", requirements: { atk: 950, stabilizer: 250 } },
        desc: "R5攻击之巅，每一指划出皆如天道审判，不可阻挡。临时攻击+40(10天)。"
    },

    // === Buff: DEF 防御 (3条) ===
    {
        id: "pills_r5_013", name: "太甲玄龟丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 1125,
        effects: { buff: { attr: 'def', val: 15, days: 5 } },
        formula: { primary: "herbs_036", requirements: { def: 450, stabilizer: 160 } },
        desc: "模拟上古玄龟的神通，在体表形成一层法则龟甲。临时防御+15(5天)。"
    },
    {
        id: "pills_r5_014", name: "万法不侵丸",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 2625,
        effects: { buff: { attr: 'def', val: 25, days: 7 } },
        formula: { primary: "herbs_036", requirements: { def: 700, stabilizer: 200 } },
        desc: "仙级防御丹药，能大幅度削弱外界法术对肉身的冲击。临时防御+25(7天)。"
    },
    {
        id: "pills_r5_015", name: "混元金刚丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 6000,
        effects: { buff: { attr: 'def', val: 40, days: 10 } },
        formula: { primary: "herbs_036", requirements: { def: 950, stabilizer: 250 } },
        desc: "R5防御之巅，肉身自成混元，诸邪不近，万劫不磨。临时防御+40(10天)。"
    },

    // === Buff: Speed 速度 (3条) ===
    {
        id: "pills_r5_016", name: "缩地成寸散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 675,
        effects: { buff: { attr: 'speed', val: 15, days: 3 } },
        formula: { primary: "herbs_037", requirements: { speed: 450, stabilizer: 160 } },
        desc: "触碰空间法则边缘，使移动跨度大幅提升。临时速度+15(3天)。"
    },
    {
        id: "pills_r5_017", name: "逐日追光丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 1890,
        effects: { buff: { attr: 'speed', val: 25, days: 5 } },
        formula: { primary: "herbs_037", requirements: { speed: 700, stabilizer: 200 } },
        desc: "身化流光，速度之快甚至能产生跨越时间的错觉。临时速度+25(5天)。"
    },
    {
        id: "pills_r5_018", name: "纵横寰宇丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 4200,
        effects: { buff: { attr: 'speed', val: 40, days: 7 } },
        formula: { primary: "herbs_037", requirements: { speed: 950, stabilizer: 250 } },
        desc: "R5速度巅峰，一步踏出便是乾坤挪移。临时速度+40(7天)。"
    },

    // === Buff: Jing 体质 (前2条) ===
    {
        id: "pills_r5_019", name: "混沌洗髓散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 4000,
        effects: { buff: { attr: 'jing', val: 20, days: 10 } },
        formula: { primary: "herbs_038", requirements: { jing: 480, stabilizer: 180 } },
        desc: "用混沌之气洗练全身髓骨，使体质发生根本性跃迁。临时体质+20(10天)。"
    },
    {
        id: "pills_r5_020", name: "圣祖真血丸",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 9000,
        effects: { buff: { attr: 'jing', val: 30, days: 15 } },
        formula: { primary: "herbs_038", requirements: { jing: 750, stabilizer: 230 } },
        desc: "模拟远古圣祖的原始血气，生命力旺盛至极。临时体质+30(15天)。"
    }
];
const pills_r5_batch_3 = [
    // === Buff: Jing 体质 (补完后1条) ===
    {
        id: "pills_r5_021", name: "永恒不朽丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 20000,
        effects: { buff: { attr: 'jing', val: 50, days: 20 } },
        formula: { primary: "herbs_038", requirements: { jing: 950, stabilizer: 280 } },
        desc: "R5体质之巅，药力在体内自成造化，肉身不朽不灭。临时体质+50(20天)。"
    },

    // === Buff: Qi 能量上限 (3条) ===
    {
        id: "pills_r5_022", name: "鸿蒙聚能散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 4000,
        effects: { buff: { attr: 'qi', val: 20, days: 10 } },
        formula: { primary: "herbs_039", requirements: { qiMax: 480, stabilizer: 180 } },
        desc: "蕴含一丝鸿蒙气息，使丹田容量发生本质扩张。临时能量+20(10天)。"
    },
    {
        id: "pills_r5_023", name: "开天辟地丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 10500,
        effects: { buff: { attr: 'qi', val: 35, days: 15 } },
        formula: { primary: "herbs_039", requirements: { qiMax: 750, stabilizer: 230 } },
        desc: "药力如开天辟地，强行开辟出广袤的真气储备空间。临时能量+35(15天)。"
    },
    {
        id: "pills_r5_024", name: "诸天无极丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 20000,
        effects: { buff: { attr: 'qi', val: 50, days: 20 } },
        formula: { primary: "herbs_039", requirements: { qiMax: 950, stabilizer: 280 } },
        desc: "R5能量巅峰，气海连接诸天，真气取之不尽。临时能量+50(20天)。"
    },

    // === Buff: Shen 悟性 (3条) ===
    {
        id: "pills_r5_025", name: "菩提明心散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 2800,
        effects: { buff: { attr: 'shen', val: 20, days: 7 } },
        formula: { primary: "herbs_040", requirements: { shen: 480, stabilizer: 200 } },
        desc: "菩提子磨制的仙粉，使神魂进入绝对清明的寂静状态。临时悟性+20(7天)。"
    },
    {
        id: "pills_r5_026", name: "大道感悟丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 7000,
        effects: { buff: { attr: 'shen', val: 35, days: 10 } },
        formula: { primary: "herbs_040", requirements: { shen: 750, stabilizer: 250 } },
        desc: "强行将修士神识拉入法则长河中感悟大道。临时悟性+35(10天)。"
    },
    {
        id: "pills_r5_027", name: "天人合一丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 15000,
        effects: { buff: { attr: 'shen', val: 50, days: 15 } },
        formula: { primary: "herbs_040", requirements: { shen: 950, stabilizer: 300 } },
        desc: "R5悟性巅峰，在此状态下，世间一切法皆有迹可循。临时悟性+50(15天)。"
    },

    // === Study: StudyEff 研读效率 (3条) ===
    {
        id: "pills_r5_028", name: "灵犀入道液",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 2750,
        effects: { buff: { attr: 'studyEff', val: 0.55, days: 10 } },
        formula: { primary: "herbs_040", requirements: { shen: 550, stabilizer: 180 } },
        desc: "服之如神助，可瞬间看透天阶功法的核心逻辑。研读效率+55%(10天)。"
    },
    {
        id: "pills_r5_029", name: "一眼万年散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 4500,
        effects: { buff: { attr: 'studyEff', val: 0.6, days: 15 } },
        formula: { primary: "herbs_040", requirements: { shen: 800, stabilizer: 240 } },
        desc: "在脑中构建时间流速缓慢的道场进行推演。研读效率+60%(15天)。"
    },
    {
        id: "pills_r5_030", name: "太上大道丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 5, value: 9750,
        effects: { buff: { attr: 'studyEff', val: 0.65, days: 30 } },
        formula: { primary: "herbs_040", requirements: { shen: 1000, stabilizer: 320 } },
        desc: "R5研读之巅，可持续参悟一个月，甚至能自行补全残篇。研读效率+65%(30天)。"
    }
];

const pills_r6_batch_1 = [
    // === Reply: HP 回复 (3条) ===
    {
        id: "pills_r6_001", name: "鸿蒙再生散",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 850,
        effects: { hp: 850 },
        formula: { primary: "herbs_041", requirements: { heal: 900, stabilizer: 300 } },
        desc: "引动鸿蒙之气，只要神魂尚存，肉身便可瞬间重组。"
    },
    {
        id: "pills_r6_002", name: "诸天续命丸",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 928,
        effects: { hp: 925 },
        formula: { primary: "herbs_041", requirements: { heal: 1400, stabilizer: 400 } },
        desc: "强行向诸天万界借取生机，无视任何法则诅咒的强制治疗。"
    },
    {
        id: "pills_r6_003", name: "不灭真身丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 1000,
        effects: { hp: 1000 },
        formula: { primary: "herbs_041", requirements: { heal: 1800, stabilizer: 500 } },
        desc: "【神话】神道巅峰之药，服之即成不灭之体，伤势化作虚无。"
    },

    // === Reply: MP 回复 (3条) ===
    {
        id: "pills_r6_004", name: "虚空吞元液",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 850,
        effects: { mp: 850 },
        formula: { primary: "herbs_042", requirements: { qi: 900, stabilizer: 300 } },
        desc: "瞬间吞噬周围虚空的游离能量，将其强制转化为纯净仙元。"
    },
    {
        id: "pills_r6_005", name: "诸天归元饮",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 928,
        effects: { mp: 925 },
        formula: { primary: "herbs_042", requirements: { qi: 1400, stabilizer: 400 } },
        desc: "法力跨越位面归仓，不仅回补真气，更能扩充临时法力上限。"
    },
    {
        id: "pills_r6_006", name: "至尊化灵神丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 1000,
        effects: { mp: 1000 },
        formula: { primary: "herbs_042", requirements: { qi: 1800, stabilizer: 500 } },
        desc: "回气类的究极存在，法力充盈至溢出，形成护体灵域。"
    },

    // === Reply: HP & MP 复合 (3条) ===
    {
        id: "pills_r6_007", name: "混沌归本散",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 900,
        effects: { hp: 450, mp: 450 },
        formula: { primary: "herbs_041", requirements: { heal: 850, qi: 850, stabilizer: 350 } },
        desc: "万物归于混沌，将伤势与消耗同步抹除的奇药。"
    },
    {
        id: "pills_r6_008", name: "乾坤大还丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 1200,
        effects: { hp: 600, mp: 600 },
        formula: { primary: "herbs_041", requirements: { heal: 1200, qi: 1200, stabilizer: 450 } },
        desc: "逆转乾坤，在生死边缘强制拉回巅峰状态。"
    },
    {
        id: "pills_r6_009", name: "太初极意神丹",canDo: true   , subType: "reply", type: "pill", grade: 2, rarity: 6, value: 1600,
        effects: { hp: 800, mp: 800 },
        formula: { primary: "herbs_041", requirements: { heal: 1600, qi: 1600, stabilizer: 600 } },
        desc: "R6复合巅峰，服下此丹等同于获得第二次生命轮回。"
    },

    // === Buff: ATK 攻击 (第1条) ===
    {
        id: "pills_r6_010", name: "弑神崩天散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 900,
        effects: { buff: { attr: 'atk', val: 20, days: 3 } },
        formula: { primary: "herbs_043", requirements: { atk: 900, stabilizer: 300 } },
        desc: "蕴含弑神法则，每一击都能对神性护甲造成毁灭伤害。临时攻击+20(3天)。"
    }
];
const pills_r6_batch_2 = [
    // === Buff: ATK 攻击 (补完后2条) ===
    {
        id: "pills_r6_011", name: "寂灭道丸",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 2625,
        effects: { buff: { attr: 'atk', val: 35, days: 5 } },
        formula: { primary: "herbs_043", requirements: { atk: 1400, stabilizer: 450 } },
        desc: "引动寂灭法则，举手投足间皆能让万物重归虚无。临时攻击+35(5天)。"
    },
    {
        id: "pills_r6_012", name: "诸天陨落丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 6300,
        effects: { buff: { attr: 'atk', val: 60, days: 7 } },
        formula: { primary: "herbs_043", requirements: { atk: 1800, stabilizer: 600 } },
        desc: "R6攻击之巅，丹成之时诸神泣血。临时攻击+60(7天)。"
    },

    // === Buff: DEF 防御 (3条) ===
    {
        id: "pills_r6_013", name: "万劫玄黄丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 1500,
        effects: { buff: { attr: 'def', val: 20, days: 5 } },
        formula: { primary: "herbs_044", requirements: { def: 900, stabilizer: 350 } },
        desc: "玄黄母气护体，历万劫而不磨。临时防御+20(5天)。"
    },
    {
        id: "pills_r6_014", name: "因果不沾丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 3675,
        effects: { buff: { attr: 'def', val: 35, days: 7 } },
        formula: { primary: "herbs_044", requirements: { def: 1400, stabilizer: 500 } },
        desc: "神话级防御，强行切断受到的因果联系，使攻击无效化。临时防御+35(7天)。"
    },
    {
        id: "pills_r6_015", name: "天道不灭金身丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 9000,
        effects: { buff: { attr: 'def', val: 60, days: 10 } },
        formula: { primary: "herbs_044", requirements: { def: 1800, stabilizer: 650 } },
        desc: "R6防御之巅，肉身即是天道，恒古长存，永世不毁。临时防御+60(10天)。"
    },

    // === Buff: Speed 速度 (3条) ===
    {
        id: "pills_r6_016", name: "鲲鹏逍遥散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 900,
        effects: { buff: { attr: 'speed', val: 20, days: 3 } },
        formula: { primary: "herbs_045", requirements: { speed: 900, stabilizer: 350 } },
        desc: "鲲鹏展翅九万里，无视空间阻隔。临时速度+20(3天)。"
    },
    {
        id: "pills_r6_017", name: "时空挪移丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 2625,
        effects: { buff: { attr: 'speed', val: 35, days: 5 } },
        formula: { primary: "herbs_045", requirements: { speed: 1400, stabilizer: 500 } },
        desc: "踏步时引起时间长河的轻微涟漪，实现真正的瞬移。临时速度+35(5天)。"
    },
    {
        id: "pills_r6_018", name: "诸天无极步丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 6300,
        effects: { buff: { attr: 'speed', val: 60, days: 7 } },
        formula: { primary: "herbs_045", requirements: { speed: 1800, stabilizer: 650 } },
        desc: "R6速度巅峰，一念之间，诸天万界皆在足下。临时速度+60(7天)。"
    },

    // === Buff: Jing 体质 (前2条) ===
    {
        id: "pills_r6_019", name: "圣骨造化散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 9000,
        effects: { buff: { attr: 'jing', val: 30, days: 15 } },
        formula: { primary: "herbs_046", requirements: { jing: 950, stabilizer: 400 } },
        desc: "祖龙真血淬骨，将肉身强度强行拉升至神话层面。临时体质+30(15天)。"
    },
    {
        id: "pills_r6_020", name: "大道不朽神丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 22500,
        effects: { buff: { attr: 'jing', val: 45, days: 25 } },
        formula: { primary: "herbs_046", requirements: { jing: 1500, stabilizer: 550 } },
        desc: "与大道同庚，只要道不灭，肉身便永恒强健。临时体质+45(25天)。"
    }
];
const pills_r6_batch_3 = [
    // === Buff: Jing 体质 (补完最后1条) ===
    {
        id: "pills_r6_021", name: "太初龙凰不灭神丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 45000,
        effects: { buff: { attr: 'jing', val: 75, days: 30 } },
        formula: { primary: "herbs_046", requirements: { jing: 1900, stabilizer: 750 } },
        desc: "【神话】将龙族韧性与凤凰涅槃法则完美融合。临时体质+75(30天)。"
    },

    // === Buff: Qi 能量上限 (3条) ===
    {
        id: "pills_r6_022", name: "混沌无极散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 9000,
        effects: { buff: { attr: 'qi', val: 30, days: 15 } },
        formula: { primary: "herbs_047", requirements: { qiMax: 950, stabilizer: 400 } },
        desc: "引动混沌之始的虚空药效，使气海如深渊般幽暗深邃。临时能量+30(15天)。"
    },
    {
        id: "pills_r6_023", name: "万象造化归一丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 22500,
        effects: { buff: { attr: 'qi', val: 45, days: 25 } },
        formula: { primary: "herbs_047", requirements: { qiMax: 1500, stabilizer: 550 } },
        desc: "世间万象法力皆可在此丹引导下归于本源气海。临时能量+45(25天)。"
    },
    {
        id: "pills_r6_024", name: "太虚本源神丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 450000,
        effects: { buff: { attr: 'qi', val: 75, days: 30 } },
        formula: { primary: "herbs_047", requirements: { qiMax: 1900, stabilizer: 750 } },
        desc: "R6能量巅峰，使修士体内的真气储备等同于一界本源。临时能量+75(30天)。"
    },

    // === Buff: Shen 悟性 (3条) ===
    {
        id: "pills_r6_025", name: "一眼万年丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 6000,
        effects: { buff: { attr: 'shen', val: 30, days: 10 } },
        formula: { primary: "herbs_048", requirements: { shen: 950, stabilizer: 450 } },
        desc: "强制神识进入超频状态，瞬息间推演万年。临时悟性+30(10天)。"
    },
    {
        id: "pills_r6_026", name: "大道本源神丸",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 18000,
        effects: { buff: { attr: 'shen', val: 45, days: 20 } },
        formula: { primary: "herbs_048", requirements: { shen: 1500, stabilizer: 600 } },
        desc: "直视大道背影，世间法理从此再无秘密。临时悟性+45(20天)。"
    },
    {
        id: "pills_r6_027", name: "真理彼岸神丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 45000,
        effects: { buff: { attr: 'shen', val: 75, days: 30 } },
        formula: { primary: "herbs_048", requirements: { shen: 1900, stabilizer: 800 } },
        desc: "R6悟性巅峰，踏足真理彼岸，一语成谶。临时悟性+75(30天)。"
    },

    // === Study: StudyEff 研读效率 (3条) ===
    {
        id: "pills_r6_028", name: "天命通神液",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 5625,
        effects: { buff: { attr: 'studyEff', val: 0.75, days: 15 } },
        formula: { primary: "herbs_048", requirements: { shen: 1100, stabilizer: 450 } },
        desc: "顺应天命之悟，大幅度缩短一切禁忌典籍的研读时间。研读效率+75%(15天)。"
    },
    {
        id: "pills_r6_029", name: "法则共鸣散",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 8500,
        effects: { buff: { attr: 'studyEff', val: 0.85, days: 20 } },
        formula: { primary: "herbs_048", requirements: { shen: 1600, stabilizer: 650 } },
        desc: "使神魂与天地法则产生共鸣，参悟效率极其恐怖。研读效率+85%(20天)。"
    },
    {
        id: "pills_r6_030", name: "至高无上神道丹",canDo: true   , subType: "buff", type: "pill", grade: 2, rarity: 6, value: 2500,
        effects: { buff: { attr: 'studyEff', val: 1.0, days: 30 } },
        formula: { primary: "herbs_048", requirements: { shen: 2000, stabilizer: 900 } },
        desc: "R6研读之极，研读速度翻倍，且在参悟过程中绝无任何心魔。研读效率+100%(30天)。"
    }
];
 const pills = [
     ...pills_r1_batch_1,
     ...pills_r1_batch_2,
     ...pills_r1_batch_3,
     ...pills_r2_batch_1,
     ...pills_r2_batch_2,
     ...pills_r2_batch_3,
     ...pills_r3_batch_1,
     ...pills_r3_batch_2,
     ...pills_r3_batch_3,
     ...pills_r4_batch_1,
     ...pills_r4_batch_2,
     ...pills_r4_batch_3,
     ...pills_r5_batch_1,
     ...pills_r5_batch_2,
     ...pills_r5_batch_3,
     ...pills_r6_batch_1,
     ...pills_r6_batch_2,
     ...pills_r6_batch_3,
     {
         id: "pills_101",
         name: "尸丹",
         canDo: false,
         subType: "poison",
         type: "pill",
         grade: 1,
         rarity: 4,
         value: 1500,
         formula: { primary: "", requirements: {} },
         effects: { hp: -100, toxicity: 200 },
         desc: "由千年古尸体内凝结而成的内丹，集至阴至邪之气，蕴含恐怖的尸毒，触之即腐。"
     },
     {
         id: "pills_102",
         name: "失败的长生药",
         type: "pill",
         canDo: false,
         subType: "poison",
         grade: 0,
         rarity: 4,
         value: 444,
         formula: { primary: "", requirements: {} },
         effects: { hp: -500, hp_max: -5 },
         desc: "方士为求长生而炼制的丹药，色泽红艳如血，重如金石。虽然未能让人羽化登仙，但其猛烈的金石药性足以瞬间摧毁凡人的五脏六腑。"
     }
 ];

window.pills = pills;