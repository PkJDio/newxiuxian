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
        desc: "【精良】一枚折断的剑尖，尽管锈迹斑斑，但断面处仍透出丝丝寒气，似乎在诉说着它曾经的锋芒与落败。"
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
        desc: "【史诗】尚未经过雕琢的天然玉髓，外表被一层厚厚的石皮包裹，但在裂缝处透出的幽光显示其内部蕴含着极纯净的灵气。"
    },
    {
        id: "materials_085",
        name: "典当票据",
        type: "material",
        grade: 0,
        rarity: 1,
        value: 15,
        desc: "一张字迹模糊的当票，上面盖着‘落归当铺’的红印。虽然票面价值不高，但似乎关联着某件被寄存的旧物，或许能找当铺老板换回点什么。"
    }
];