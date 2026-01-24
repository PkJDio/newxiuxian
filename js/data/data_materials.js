// 基础材料
//console.log("加载 基础材料")
const materials = [
    {id: "materials_001", name: "狗皮", type: "material", grade: 0, rarity: 1, value: 5, desc: "普通的狗皮，可以做成帽子。"},
    {id: "materials_002", name: "狗牙", type: "material", grade: 0, rarity: 1, value: 2, desc: "并不锋利，稍微打磨可做挂饰。"},
    {id: "materials_003", name: "野猪皮", type: "material", grade: 0, rarity: 1, value: 10, desc: "厚实粗糙，制作皮甲的基础材料。"},
    {id: "materials_004", name: "野猪獠牙", type: "material", grade: 0, rarity: 1, value: 15, desc: "弯曲锋利，可做匕首柄或装饰。"},
    {id: "materials_005", name: "蛇皮", type: "material", grade: 0, rarity: 1, value: 12, desc: "表面有鳞片，凉爽透气。"},
    {id: "materials_006", name: "毒蛇牙", type: "material", grade: 0, rarity: 1, value: 8, desc: "中空，依然残留着一丝毒液。"},
    {id: "materials_007", name: "灰狼皮", type: "material", grade: 0, rarity: 1, value: 15, desc: "保暖性不错的皮毛。"},
    {id: "materials_008", name: "狼牙", type: "material", grade: 0, rarity: 1, value: 10, desc: "尖锐，常被做成护身符。"},
    {id: "materials_009", name: "飞禽羽毛", type: "material", grade: 0, rarity: 1, value: 2, desc: "普通的羽毛。"},
    {id: "materials_010", name: "蛇胆", type: "material", grade: 0, rarity: 2, value: 30, effects: {hp: 10, toxicity: -5, shen: 1}, desc: "清热解毒，明目良药。"},
    {id: "materials_011", name: "黑熊皮", type: "material", grade: 0, rarity: 2, value: 50, desc: "厚重保暖，极佳的御寒材料。"},
    {id: "materials_012", name: "熊爪", type: "material", grade: 0, rarity: 2, value: 40, desc: "坚硬如铁，力量的象征。"},
    {id: "materials_013", name: "鳄鱼皮", type: "material", grade: 0, rarity: 2, value: 45, desc: "极其坚韧，刀剑难伤。"},
    {id: "materials_014", name: "鳄鱼牙", type: "material", grade: 0, rarity: 2, value: 20, desc: "密集且锋利。"},
    {id: "materials_015", name: "鹰羽", type: "material", grade: 0, rarity: 2, value: 25, desc: "制作上等箭矢的箭羽。"},
    {id: "materials_016", name: "鹰爪", type: "material", grade: 0, rarity: 2, value: 30, desc: "如钩般锋利，抓握力极强。"},
    {id: "materials_017", name: "蝎壳", type: "material", grade: 0, rarity: 2, value: 20, desc: "坚硬的甲壳。"},
    {id: "materials_018", name: "毒蝎尾针", type: "material", grade: 0, rarity: 2, value: 35, desc: "剧毒汇聚之处。"},
    {id: "materials_019", name: "龟甲", type: "material", grade: 0, rarity: 2, value: 60, desc: "可以用来占卜，也可以做盾牌。"},
    {id: "materials_020", name: "斑斓虎皮", type: "material", grade: 0, rarity: 3, value: 150, desc: "百兽之王的皮，挂在家里辟邪镇宅。"},
    {id: "materials_021", name: "虎骨", type: "material", grade: 0, rarity: 3, value: 100, desc: "极其珍贵的药材，强筋健骨。"},
    {id: "materials_022", name: "猛虎獠牙", type: "material", grade: 0, rarity: 3, value: 80, desc: "最顶级的猛兽獠牙。"},
    {id: "materials_023", name: "金胆", type: "material", grade: 0, rarity: 3, value: 120, desc: "铜皮铁骨的熊偶尔才能产出的金胆，解毒圣品。"},
    {id: "materials_024", name: "食铁兽毛皮", type: "material", grade: 0, rarity: 3, value: 200, desc: "黑白相间，极其罕见且柔软。"},
    {id: "materials_025", name: "巨猿獠牙", type: "material", grade: 0, rarity: 3, value: 60, desc: "比人类手指还长的獠牙。"},
    {id: "materials_026", name: "鲛人泪(珍珠)", type: "material", grade: 0, rarity: 3, value: 300, desc: "大如龙眼的珍珠，光彩夺目。"},
    {id: "materials_027", name: "野兽犬牙", type: "material", grade: 0, rarity: 1, value: 5, desc: "普通的野兽牙齿，虽然有些磨损，但依然尖锐。"},
    {id: "materials_028", name: "老鼠尾巴", type: "material", grade: 0, rarity: 1, value: 2, desc: "细长且令人不适，也许药剂师会需要。"},
    {id: "materials_029", name: "毒液囊", type: "material", grade: 0, rarity: 2, value: 25, desc: "充满毒液的器官，处理时务必小心。"},
    {id: "materials_030", name: "坚硬鬃毛", type: "material", grade: 0, rarity: 1, value: 10, desc: "硬如钢针的鬃毛，可以用来制作刷子或粗线。"},
    {id: "materials_031", name: "破布条", type: "material", grade: 0, rarity: 1, value: 1, desc: "肮脏破旧的布料，勉强能用来擦拭兵器。"},
    {id: "materials_032", name: "白骨", type: "material", grade: 0, rarity: 1, value: 5, desc: "不知名生物的骨头，已经风化发白。"},
    {id: "materials_033", name: "虎牙", type: "material", grade: 0, rarity: 2, value: 40, desc: "猛虎的牙齿，不仅锋利还能辟邪。"},
    {id: "materials_034", name: "硬骨", type: "material", grade: 0, rarity: 1, value: 15, desc: "质地非常坚硬的骨头，适合打磨成骨器。"},
    {id: "materials_035", name: "僵尸牙", type: "material", grade: 0, rarity: 2, value: 20, desc: "沾染了尸毒的牙齿，散发着令人作呕的恶臭。"},
    {id: "materials_036", name: "麻绳", type: "material", grade: 0, rarity: 1, value: 5, desc: "普通的麻绳，用途广泛，随处可见。"},
    {id: "materials_037", name: "废铁块", type: "material", grade: 0, rarity: 1, value: 10, desc: "锈迹斑斑的铁块，回炉重造后还能使用。"},
    {id: "materials_038", name: "将军枯骨", type: "material", grade: 0, rarity: 3, value: 100, desc: "战死沙场的将军遗骨，隐约透着一股不灭的杀伐之气。"},
    {id: "materials_039", name: "精金矿石", type: "material", grade: 0, rarity: 4, value: 300, desc: "蕴含金精的稀有矿石，极其坚硬，是打造神兵的上好材料。"},
    {id: "materials_040", name: "鲜艳羽毛", type: "material", grade: 0, rarity: 1, value: 10, desc: "颜色艳丽的羽毛，适合做装饰或箭羽。"},
    {id: "materials_041", name: "废弃齿轮", type: "material", grade: 0, rarity: 2, value: 35, desc: "墨家机关兽留下的精密零件，工艺精湛。"},
    {id: "materials_042", name: "飞爪", type: "material", grade: 0, rarity: 2, value: 45, desc: "损坏的投掷兵器部件，带有倒钩。"},
    {id: "materials_043", name: "生锈铁片", type: "material", grade: 0, rarity: 1, value: 5, desc: "边缘锋利但锈蚀严重的金属片。"},
    {id: "materials_044", name: "龙鳞", type: "material", grade: 0, rarity: 4, value: 500, desc: "传说中龙的鳞片，坚不可摧，流转着神秘的光泽。"},
    {id: "materials_045", name: "石精", type: "material", grade: 0, rarity: 3, value: 120, desc: "吸取日月精华而生灵智的石头核心。"},
    {id: "materials_046", name: "尖锐兽牙", type: "material", grade: 0, rarity: 1, value: 8, desc: "比普通牙齿更尖锐，有一定的穿透力。"},
    {id: "materials_047", name: "凤凰羽", type: "material", grade: 0, rarity: 5, value: 800, desc: "神鸟凤凰的羽毛，即使脱落也依然燃烧着微弱的火焰。"},
    {id: "materials_048", name: "坚硬蟹壳", type: "material", grade: 0, rarity: 2, value: 25, desc: "如同盾牌般坚硬的甲壳，敲击时有金石之声。"},
    {id: "materials_049", name: "鳄鱼皮", type: "material", grade: 0, rarity: 2, value: 45, desc: "表面布满凸起的厚皮，极其坚韧。"},
    {id: "materials_050", name: "破损狼皮", type: "material", grade: 0, rarity: 1, value: 10, desc: "剥取手法不佳导致的破损皮毛，价值大打折扣。"},
    {id: "materials_051", name: "符纸", type: "material", grade: 0, rarity: 1, value: 8, desc: "道家画符专用的黄表纸，质地坚韧，朱砂易透。"},
    {id: "materials_052", name: "劣质香囊", type: "material", grade: 0, rarity: 1, value: 5, desc: "做工粗糙的布囊，里面的香料已经走味，只剩下淡淡的霉味。"},
    {
        id: "materials_053",
        name: "断裂的佛珠",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 3,
        desc: "散落的木质念珠，表面已被盘得光滑圆润，可惜穿绳已断，隐约还能感受到一丝禅意。"
    },
    {
        id: "materials_054",
        name: "剧毒毒囊",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 75,
        desc: "储存着猛烈毒素的器官，仅仅是靠近就能闻到一股甜腻的死亡气息，处理需极度小心。"
    },
    {
        id: "materials_055",
        name: "坚韧蛛丝",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 45,
        desc: "异种蜘蛛吐出的丝线，纤细却极具韧性，普通刀剑难以割断，是制作软甲的上好材料。"
    },
    {
        id: "materials_056",
        name: "怨灵结晶",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 130,
        desc: "凝聚了亡者怨念的暗紫色晶体，握在手中会感到刺骨的寒冷，隐约能听到低语声。"
    },
    {
        id: "materials_057",
        name: "破旧铜镜",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 15,
        desc: "一面锈迹斑斑的铜镜，镜面已经模糊不清，只能照出扭曲的人影，背面刻着磨损的纹饰。"
    },
    {
        id: "materials_058",
        name: "断剑",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 12,
        desc: "一把折断的剑刃，断口处参差不齐，虽然已经无法作为武器使用，但回炉重造或许能提取出不错的钢材。"
    },
    {
        id: "materials_059",
        name: "杀手令",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 150,
        desc: "一块沉甸甸的玄铁腰牌，正面刻着猩红的“杀”字，是顶尖刺客组织的信物，见牌如见阎王。"
    },
    {
        id: "materials_060",
        name: "灵猴毛",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 35,
        desc: "金光闪闪的猴毛，比普通兽皮更加轻盈细软，是制作增加身法类护具的上佳材料。"
    },
    {
        id: "materials_061",
        name: "青铜齿轮",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 55,
        desc: "铸造精良的青铜齿轮，齿牙咬合紧密，是制作或修复机关械具的关键部件。"
    },
    {
        id: "materials_062",
        name: "墨家核心",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 450,
        desc: "墨家机关术的巅峰结晶，由无数微小的精密部件咬合而成，核心处隐约闪烁着幽蓝光芒，至今仍在输出动力。"
    },
    {
        id: "materials_063",
        name: "陪葬玉片",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 120,
        desc: "从古墓中带出的玉片，玉质温润但沁入了些许暗红色的血丝，据说能镇压尸气，但也带着不祥。"
    },
    {
        id: "materials_064",
        name: "朱砂",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 45,
        desc: "色泽鲜红的矿石粉末，蕴含微弱的阳气，是道士画符和方士炼丹必不可少的基础材料。"
    },
    {
        id: "materials_065",
        name: "丹书残卷",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 160,
        desc: "不知哪个朝代遗留下来的炼丹笔记残页，虽然字迹模糊，但隐约记载着失传的丹方。"
    },
    // 材料
    {
        id: "materials_066",
        name: "重型弩箭",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 25,
        desc: "箭杆粗大，配以三棱青铜箭镞，专为强弩设计，巨大的动能足以穿透皮甲。"
    },
    {
        id: "materials_067",
        name: "巫蛊偶人",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 180,
        desc: "用稻草和破布扎成的诡异小人，身上扎着几根生锈的钢针，隐约散发着不祥的气息，是施展厌胜之术的媒介。"
    },
    {
        id: "materials_068",
        name: "陨铁矿",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 320,
        desc: "天外飞来的黑色矿石，沉重无比，表面带有燃烧后的熔壳，极其坚硬，凡火难熔。"
    },
    {
        id: "materials_069",
        name: "龙纹玉佩",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 380,
        desc: "雕刻精美的羊脂白玉，双龙戏珠纹路栩栩如生，通常是王公贵族的随身饰物，有些当铺即使收了也不敢公开售卖。"
    },
    {
        id: "materials_070",
        name: "巴蛇鳞",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 420,
        desc: "传说中能吞食大象的巨蛇留下的鳞片，每一片都硕大如盾，呈暗青色，极其坚硬且带有腥燥之气。"
    },
    {
        id: "materials_071",
        name: "机关之心",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 190,
        desc: "从精锐机关兽体内拆解出的动力源，由齿轮和发条精密咬合而成，捧在手心时还能感觉到微弱的震动。"
    },
    {
        id: "materials_072",
        name: "玄铁",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 360,
        desc: "通体漆黑的奇特金属，密度极大，指甲盖大小的一块便重达数斤，是铸造重兵器的极品材料。"
    },
    {
        id: "materials_073",
        name: "雷兽皮",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 175,
        desc: "生长在雷泽深处的异兽毛皮，表面呈蓝紫色，抚摸时会有轻微的电弧跳动，指尖传来阵阵酥麻感。"
    },
    {
        id: "materials_074",
        name: "夔牛鼓图纸",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 650,
        desc: "一张古老的羊皮卷，详细记载了传说中“声闻五百里”的战鼓制作工艺，核心材料似乎指向某种单足巨兽。"
    },
    {
        id: "materials_075",
        name: "鬼车羽",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 390,
        desc: "传说中九头怪鸟落下的羽毛，通体赤红仿佛浸透了鲜血，夜深人静时，羽毛周围似乎能听到车辆行驶的怪声。"
    },
    {
        id: "materials_076",
        name: "摄魂珠",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 460,
        desc: "一颗散发着幽幽绿光的珠子，内部似有灰雾流转，盯着看久了会觉得头晕目眩，仿佛魂魄都要被吸进去。"
    },
    {
        id: "materials_077",
        name: "火精",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 480,
        desc: "地脉岩浆中孕育出的晶体，触手滚烫，即便离开火源也会不断向外散发红光，是锻造火属性神兵的绝佳引子。"
    },
    {
        id: "materials_078",
        name: "焚玉",
        type: "material",
        grade: 0,
        rarity: 5,
        value: 1250,
        desc: "传闻中凤凰栖息过的梧桐木化玉而生，内部仿佛有流动的岩浆在燃烧。普通容器根本无法盛放，需用特制的寒铁匣保存。"
    },
    {
        id: "materials_079",
        name: "机关木料",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 95,
        desc: "经过特制桐油反复浸泡并阴干的硬木，质地坚韧且不易变形，表面留有精准的刻线，是制作小型机关或机械零件的常用基材。"
    },
    {
        id: "materials_080",
        name: "玄铁",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 360,
        desc: "【史诗】产自极地深处的稀有金属，通体漆黑，密度极高。虽然难以熔炼，但一旦成型，便会拥有惊人的硬度与重量。"
    },
    {
        id: "materials_081",
        name: "断剑残片",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 85,
        desc: "一枚折断的剑尖，尽管锈迹斑斑，但断面处仍透出丝丝寒气，似乎在诉说着它曾经的锋芒与落败。"
    },
    {
        id: "materials_082",
        name: "剧毒蛇液",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 160,
        desc: "从成年毒虺腺体中提取的浓缩毒液，呈幽绿色，散发着淡淡的腥甜味。只需极少量便能使成年壮丁瞬间麻痹，是制作见血封喉奇毒的主料。"
    },
    {
        id: "materials_083",
        name: "异兽角",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 220,
        desc: "【稀有】从成年异兽头部取下的坚硬骨角，质地如岩石般沉重，顶端带有自然形成的螺旋纹路，隐约能感应到残留的妖力。"
    },
    {
        id: "materials_084",
        name: "璞玉",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 450,
        desc: "【史诗】尚未经过雕琢的天然玉髓，外表被一层厚厚的石皮包裹，但在裂缝处透出的幽光显示其内部蕴含着极纯净的法力。"
    },
    {
        id: "materials_085",
        name: "典当票据",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 15,
        desc: "一张字迹模糊的当票，上面盖着‘落归当铺’的红印。虽然票面价值不高，但似乎关联着某件被寄存的旧物，或许能找当铺老板换回点什么。"
    },
    {
        id: "materials_086",
        name: "破碎的兽皮",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 12, // 接近下限，因为是“破碎的”
        desc: "被暴力撕碎的野兽皮毛，由于破损严重，几乎没有什么利用价值，或许只能用来擦鞋。"
    },
    {
        id: "materials_087",
        name: "变异鼠牙",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 18, // 略高于基础皮毛
        desc: "比普通老鼠牙齿略大一圈，呈令人不适的枯黄色，虽然带着病菌，但质地尚算坚硬。"
    },
    {
        id: "materials_088",
        name: "锈蚀铁片",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 15,
        desc: "一片布满暗红色铁锈的金属残片，边缘虽然已经钝化，但在某些场合或许能充当临时刮刀。"
    },
    {
        id: "materials_089",
        name: "污秽的布条",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 11,
        desc: "散发着难闻气味的碎布，上面沾满了不明粘液与尘土，恐怕只有最落魄的乞丐才会多看它一眼。"
    },
    {
        id: "materials_090",
        name: "坚硬的木刺",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 22,
        desc: "从某种坚韧植物或破碎木兵器上掉落的尖刺，虽然粗糙，但足够扎手，常被用来制作简易的陷阱。"
    },
    {
        id: "materials_091",
        name: "无名草药",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 28,
        desc: "路边随处可见的青绿色小草，虽然叫不出名字，但揉碎后敷在伤口上似乎有一点止血的效果。"
    },
    {
        id: "materials_092",
        name: "锋利的犬齿",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 32,
        desc: "从野兽口中脱落的犬齿，尖端尚未经过太多磨损，依然保持着一定的穿透力，是制作简易箭头的素材。"
    },
    {
        id: "materials_093",
        name: "兽骨",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 20,
        desc: "最常见的野兽骨骼，质地坚硬且沉重，虽然没有什么灵性，但却是打磨粗糙骨器的基础材料。"
    },
    {
        id: "materials_094",
        name: "破碎的符纸",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 13,
        desc: "撕裂且受潮的黄纸，上面的咒文已经模糊不清，几乎丧失了引动灵气的作用。"
    },
    {
        id: "materials_095",
        name: "劣质朱砂",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 18,
        desc: "掺杂了大量红土的朱砂粉末，色泽暗淡，虽然还能勉强用于画符，但极易导致失败。"
    },
    {
        id: "materials_096",
        name: "军功爵牌",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 125,
        desc: "大秦军中精锐佩戴的铜制爵牌，正面刻有持有者的军衔，是战功的象征。即便持有者已逝，其上凝聚的铁血之气依然若隐若现。"
    },
    {
        id: "materials_097",
        name: "完整的狼皮",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 145,
        desc: "剥取手法极其老道，整张皮毛完整无缺，毛色油光发亮且厚实，是制作高级防寒皮甲的上等主料。"
    },
    {
        id: "materials_098",
        name: "变异狼牙",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 90,
        desc: "由于变异而生长得异常粗壮的犬牙，根部还带着一丝干涸的血迹，质地坚硬如石，是强化兵器锋利度的好材料。"
    },
    {
        id: "materials_099",
        name: " 文碎片",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 65,
        desc: "蕴含微弱灵气的矿石碎片，是修仙界最基础的能源，常用于驱动低级法阵或作为简易机关的动力源。"
    },
    {
        id: "materials_100",
        name: "浑浊的灵气结晶",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 135,
        desc: "自然界中灵气凝结的产物，因含有较多杂质而显得灰暗，虽不如纯净 文珍贵，但也是炼器时极佳的辅助材料。"
    },
    {
        id: "materials_101",
        name: "精铁齿轮",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 95,
        desc: "经过百般锤炼的精铁打磨而成的齿轮，咬合极其精准，能够承受高强度的机械运转而不易磨损。"
    },
    {
        id: "materials_102",
        name: "机关木料",
        type: "material",
        grade: 0,
        rarity: 2,
        value: 82,
        desc: "选取生长百年的铁杉木，经特制桐油长期浸泡而成，既保留了木材的韧性，又拥有了接近金属的硬度。"
    },
    {
        id: "materials_103",
        name: "古旧的将军印",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 310,
        desc: "一枚在古战场深处出土的青铜印章，尽管已被岁月侵蚀得斑驳不堪，但其内部依然凝聚着一股令人胆寒的统帅威压，非寻常士卒所能直视。"
    },
    {
        id: "materials_104",
        name: "青铜甲片",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 185,
        desc: "从强大机关兽或古代将领铠甲上剥离的护甲残片，由于曾受法力滋养，其质地远非凡铁可比，即便是利刃也难在上面留下划痕。"
    },
    {
        id: "materials_105",
        name: "尸毒样本",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 245,
        desc: "从千年僵尸体内提取的浓缩毒素，呈现出诡异的暗紫色并带有粘稠感。极具腐蚀性，仅需一滴便能让周围的草木瞬间枯萎。"
    },
    {
        id: "materials_106",
        name: "巨大的食人花蕊",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 345,
        desc: "从巨型食人花母体中心采出的花蕊，依然在微微蠕动并散发出诱人的异香，这种香气能麻痹猎物的神经，是制作顶级迷药的核心材料。"
    },
    {
        id: "materials_107",
        name: "酸性毒囊",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 180,
        desc: "食人花体内储存强酸的器官，外皮极具弹性且耐腐蚀。内部液体可以瞬间溶解生铁，在炼金术中常被用于萃取稀有金属。"
    },
    {
        id: "materials_108",
        name: "变异藤蔓",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 155,
        desc: "受妖气侵蚀而产生变异的粗壮藤蔓，其纤维交织如钢缆般坚韧，即便被斩断也会在短时间内保持活性，是制作束缚类法具的最佳选择。"
    },
    {
        id: "materials_109",
        name: "狼王内丹",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 352,
        desc: "啸月狼王毕生修为所化的结晶，通体浑圆并散发出淡淡的血色月光，蕴含着狂暴的妖力，是炼制增进修为丹药的极品主料。"
    },
    {
        id: "materials_110",
        name: "血煞狼皮",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 165,
        desc: "浸染了无数生灵鲜血的狼王皮毛，质地比玄铁还要坚韧，表面隐约流转着一层血色煞气，寻常野兽见之便会瑟瑟发抖。"
    },
    {
        id: "materials_111",
        name: "锋利狼爪",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 128,
        desc: "狼王最为致命的武器，指爪如钢钩般锋利，且附带着撕裂伤口的特殊性质，是打造刺杀类兵器的绝佳素材。"
    },
    {
        id: "materials_112",
        name: "未知的丹方",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 340,
        desc: "一张泛黄且边缘碳化的古老纸页，上面记载着某种失传丹药的炼制心得。虽然由于岁月侵蚀使得部分字迹模糊，但其核心的药理逻辑依然极具研究价值。"
    },
    {
        id: "materials_113",
        name: "爆裂丹",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 155,
        desc: "炼制过程中因火候失控意外产生的变异丹药，内部蕴含着极其不稳定的狂暴火元素。虽然无法服用，但若作为投掷物引爆，其破坏力足以令精英级对手胆寒。"
    },
    {
        id: "materials_114",
        name: "朱砂笔",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 225,
        desc: "笔杆由灵木削制，笔尖则采用了某种高阶妖兽的颈部鬃毛。笔尖隐约透着暗红色光芒，能极大地增强使用者与天地灵气间的感应，是绘制高阶符咒的必备之物。"
    },
    {
        id: "materials_115",
        name: "墨家机关核心",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 355,
        desc: "墨家机关术的极致结晶，核心内部结构精密到了令人发指的程度，即便本体已经损毁，其内部的动力源依然在平稳地输出能量，是制作高阶机关造物的绝对核心。"
    },
    {
        id: "materials_116",
        name: "精炼玄铁",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 120,
        desc: "经过千锤百炼剔除杂质后的玄铁，密度极高且具有出色的法力传导性，是打造重型兵器或强化防具结构的首选素材。"
    },
    {
        id: "materials_117",
        name: "重型装甲片",
        type: "material",
        grade: 0,
        rarity: 3,
        value: 210,
        desc: "剥离自巨型机关兽表层的厚重防护片，表面布满了吸收冲击的特殊纹路，寻常刀剑砍在其上只能留下浅浅的白痕，极大地提升了防具的抗击打能力。"
    },
    {
        id: "materials_118",
        name: "始皇佩剑碎片",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 580,
        desc: "传说中千古一帝佩剑的残片，剑身虽断，但其上附着的皇者霸气历经千年未散。哪怕只是握在手中，也能感受到一股令万物臣服的肃杀之感，是重铸神兵的绝世材料。"
    },
    {
        id: "materials_119",
        name: "定魂珠",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 460,
        desc: "通体晶莹剔透，内部有烟云流转的异宝。据说此珠能镇压生魂、平复心魔，在突破境界或遭遇阴毒咒术时，能护住识海一点清明不灭，极其罕见。"
    },
    {
        id: "materials_120",
        name: "巨灵神动力核心",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 620,
        desc: "巨灵神机关造物的力量源泉，其内部的法力压缩到了极其恐怖的程度。即便是在离线状态下，核心散发的高温也足以让周围的空气扭曲，是制造跨时代战争兵器的终极能源。"
    },
    {
        id: "materials_121",
        name: "墨家机关臂",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 495,
        desc: "由数百个精密零件嵌套而成的机械手臂，完美模拟了人类手臂的灵活性。内部刻满了复杂的法力循环阵法，不仅力大无穷，还能精准地执行极其细微的指令。"
    },
    {
        id: "materials_122",
        name: "精炼玄铁锭",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 285,
        desc: "在天外玄铁的基础上，运用墨家秘传的熔炼法反复精炼而成的锭块。其硬度与法力传导性达到了完美的平衡，是打造领主级武器装备的通用高阶基材。"
    },
    {
        id: "materials_123",
        name: "宗师级丹炉",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 610,
        desc: "由深海寒铁与地脉火铜合铸而成的炼丹重器，炉身刻有聚灵阵法，能极大程度地稳定火候并剔除药渣。即便是普通的草药，在其中炼制也能发挥出远超常态的药性。"
    },
    {
        id: "materials_124",
        name: "极品朱砂",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 240,
        desc: "产自极阳之地的极品矿石精粹，色泽鲜红如血且带有微微的温热感。其蕴含的阳气极为纯净，是绘制镇魂、辟邪类高阶符咒的绝佳媒介。"
    },
    {
        id: "materials_125",
        name: "巴蛇之胆",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 625,
        desc: "传说中能吞食大象的巨蛇留下的苦胆，蕴含着极其浓缩的生机与剧烈毒性。它是炼制顶级解毒圣药或见血封喉奇毒的稀世主材，处理时需极其谨慎。"
    },
    {
        id: "materials_126",
        name: "坚韧的蛇皮",
        type: "material",
        grade: 0,
        rarity: 4,
        value: 320,
        desc: "剥自成年巴蛇的巨型皮壳，质地坚韧且极具弹性，表面覆盖着一层细密如钢的鳞片。这种材料对锐器的切割有极强的防护效果，是制作高阶软甲或软鞭的绝佳选择。"
    },
];