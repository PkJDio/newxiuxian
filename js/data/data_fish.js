//给我seasons: [0, 1, 2, 3]，region: "all" 的鱼，rarity： 1 的鱼10条，名字不要和已有的重复
const fishes = [{id: "fishes_base_01", name: "草鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 30, hp: 2}, desc: "最常见的淡水鱼。", value: 12,},
    {id: "fishes_base_02", name: "鲫鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 24, hp: 3}, desc: "肉质鲜嫩，适合煲汤。", value: 11,},
    {id: "fishes_base_03", name: "鲤鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 36, hp: 2}, desc: "据说跃过龙门能化龙。", value: 24,},
    {id: "fishes_base_04", name: "泥鳅", type: "fish", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 15, hp: 5}, desc: "滑不留手，滋补。", value: 10,},
    {
        id: "fishes_base_05", name: "黑鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 45, hp: 5}, desc: "凶猛的肉食性鱼类。", value: 22,
    },
    {
        id: "fishes_comm_01",
        name: "青鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 45, hp: 5},
        desc: "体型较大，色泽青黑，喜食螺蛳。",
        value: 20
    },
    {
        id: "fishes_comm_02",
        name: "鲢鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 36},
        desc: "性急躁，善跳跃，肉质细嫩。",
        value: 12
    },
    {
        id: "fishes_comm_03",
        name: "鲮鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 30, hp: 2},
        desc: "常见的食用鱼，常被制成罐头。",
        value: 12
    },
    {
        id: "fishes_comm_04",
        name: "黄颡鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 30, hp: 5},
        desc: "通体黄色，背鳍有刺，俗称嘎鱼。",
        value: 15
    },
    {
        id: "fishes_comm_05",
        name: "赤眼鳟",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 36, hp: 3},
        desc: "眼部上缘有一块红斑，貌似草鱼。",
        value: 15
    },
    {
        id: "fishes_comm_06",
        name: "船钉鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 24},
        desc: "体长如船钉，生活在江河底层。",
        value: 8
    },
    {
        id: "fishes_comm_07",
        name: "光唇鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 27, hp: 1},
        desc: "喜栖息于石砾底质的河溪中。",
        value: 10
    },
    {
        id: "fishes_comm_08",
        name: "宽鳍鱲",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 24, mp: 2},
        desc: "体色鲜艳，常见于山涧溪流。",
        value: 10
    },
    {
        id: "fishes_comm_09",
        name: "刺鳅",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 30, hp: 2},
        desc: "背上有刺，形似泥鳅但非泥鳅。",
        value: 12
    },
    {
        id: "fishes_comm_10",
        name: "鲻鱼",
        type: "fish",
        rarity: 1,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 36},
        desc: "广盐性鱼类，咸淡水皆可见。",
        value: 12
    },
    {
        id: "fishes_rare_01",
        name: "翘嘴鲌",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 54, hp: 5},
        desc: "下唇肥厚突出，性情凶猛，肉质白嫩。",
        value: 23
    },
    {
        id: "fishes_rare_02",
        name: "胭脂鱼",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 45, mp: 5},
        desc: "体侧有胭脂红色的纵条纹，姿态优美。",
        value: 20
    },
    {
        id: "fishes_rare_03",
        name: "墨头鱼",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 60},
        desc: "头方嘴阔，常吸附于岩石上刮食苔藓。",
        value: 22
    },
    {
        id: "fishes_rare_04",
        name: "花骨鱼",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 36, hp: 8},
        desc: "体侧有许多黑色斑点，似花骨朵般点缀。",
        value: 20
    },
    {
        id: "fishes_rare_05",
        name: "长吻鮠",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 75},
        desc: "吻部极长，肉质肥美，无细刺。",
        value: 25
    },
    {
        id: "fishes_rare_06",
        name: "金线鲃",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 30, mp: 8},
        desc: "常栖息于暗河溶洞中，体侧有金色线条。",
        value: 18
    },
    {
        id: "fishes_rare_07",
        name: "岩原鲤",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 66, hp: 2},
        desc: "背部隆起，色泽紫黑，生长在激流岩石间。",
        value: 24
    },
    {
        id: "fishes_rare_08",
        name: "铜鱼",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 45},
        desc: "体色如铜，鳞片紧密，力大无穷。",
        value: 18
    },
    {
        id: "fishes_rare_09",
        name: "圆口铜鱼",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 54, hp: 4},
        desc: "口呈圆弧形，肉质丰腴，不可多得。",
        value: 22
    },
    {
        id: "fishes_rare_10",
        name: "白甲鱼",
        type: "fish",
        rarity: 2,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 42},
        desc: "鳞片洁白如甲，游动如飞。",
        value: 16
    },
    {
        id: "fishes_epic_01",
        name: "七彩神仙",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 60, mp: 10},
        desc: "体色绚丽如彩虹，被誉为水中仙子。",
        value: 40
    },
    {
        id: "fishes_epic_02",
        name: "玉面孔雀",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 54, hp: 15},
        desc: "尾鳍如孔雀开屏，面如白玉，姿态优雅。",
        value: 43
    },
    {
        id: "fishes_epic_03",
        name: "金鳞红尾",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 75, },
        desc: "鳞片金黄，尾鳍鲜红，是富贵的象征。",
        value: 45
    },
    {
        id: "fishes_epic_04",
        name: "紫衣侯",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 60, mp: 15},
        desc: "通体紫气缭绕，极具王者之风。",
        value: 50
    },
    {
        id: "fishes_epic_05",
        name: "月光鱼",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 45, mp: 20},
        desc: "夜间会发出淡淡的荧光，如水中皓月。",
        value: 45
    },
    {
        id: "fishes_epic_06",
        name: "碧波仙子",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 54, speed: 1},
        desc: "身形飘逸，游动时如仙子凌波微步。",
        value: 48
    },
    {
        id: "fishes_epic_07",
        name: "墨龙睛",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 66, hp: 10},
        desc: "漆黑如墨，眼珠突出如龙睛，十分神骏。",
        value: 42
    },
    {
        id: "fishes_epic_08",
        name: "赤焰鲷",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 90, atk: 1},
        desc: "色红如火，性情刚烈，肉质极鲜。",
        value: 55
    },
    {
        id: "fishes_epic_09",
        name: "云纹斑鳢",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 75, hp: 12},
        desc: "体侧有云朵状的斑纹，不仅好看还很美味。",
        value: 47
    },
    {
        id: "fishes_epic_10",
        name: "银梭",
        type: "fish",
        rarity: 3,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 60, speed: 1},
        desc: "形如织布银梭，快如闪电。",
        value: 50
    },
    {
        id: "fishes_legend_01",
        name: "松江鲈",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 90, hp: 20, buff: {attr: 'speed', val: 5, days: 5}},
        desc: "名扬天下的四鳃鲈鱼，肉质洁白似雪。",
        value: 250 // (30+20)*3 + (5*4*5) = 150 + 100 = 250
    },
    {
        id: "fishes_legend_02",
        name: "黄唇鱼",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 120, hp: 50},
        desc: "千金难求的鱼中贵族，鱼鳔价值连城。",
        value: 270 // (40+50)*3 = 270
    },
    {
        id: "fishes_legend_03",
        name: "长江刀鱼",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 75, buff: {attr: 'qi', val: 3, days: 7}},
        desc: "形如利刃，银光闪闪，鲜美无双。",
        value: 159 // (25)*3 + (3*4*7) = 75 + 84 = 159
    },
    {
        id: "fishes_legend_04",
        name: "虹鳟",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 105, hp: 10, mp: 10},
        desc: "体侧有一条红色的彩带，肉色红润。",
        value: 165 // (35+10+10)*3 = 165
    },
    {
        id: "fishes_legend_05",
        name: "巨骨舌鱼",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 180, buff: {attr: 'atk', val: 4, days: 5}},
        desc: "水中巨怪，力大无穷，鳞片坚硬如铁。",
        value: 260 // (60)*3 + (4*4*5) = 180 + 80 = 260
    },
    {
        id: "fishes_legend_06",
        name: "抗浪鱼",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 90, speed: 2},
        desc: "喜好逆流而上，体型细长，味道鲜美。",
        value: 105 // (30+5)*3 = 105
    },
    {
        id: "fishes_legend_07",
        name: "龙须鱼",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 60, mp: 30, buff: {attr: 'shen', val: 3, days: 5}},
        desc: "触须极长，据说拥有微弱的龙族血统。",
        value: 210 // (20+30)*3 + (3*4*5) = 150 + 60 = 210
    },
    {
        id: "fishes_legend_08",
        name: "锦绣龙虾",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 120, def: 1},
        desc: "色彩斑斓，身披重甲，虾中之王。",
        value: 135 // (40+5)*3 = 135
    },
    {
        id: "fishes_legend_09",
        name: "帝王蟹",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 150, buff: {attr: 'def', val: 5, days: 5}},
        desc: "深海霸主，蟹腿肉质饱满，极其诱人。",
        value: 250 // (50)*3 + (5*4*5) = 150 + 100 = 250
    },
    {
        id: "fishes_legend_10",
        name: "象拔蚌",
        type: "fish",
        rarity: 4,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 90, hp: 30},
        desc: "虽然外形奇特，但口感脆嫩，大补。",
        value: 180 // (30+30)*3 = 180
    },
    {
        id: "fishes_mythic_01",
        name: "金鳞龙鲤",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 180, hp: 100, mp: 50, buff: {attr: 'qi', val: 5, days: 7}},
        desc: "全身金鳞闪耀，传说拥有真龙血脉，食之可增气运。",
        value: 980 // (60+100+50)*4 + (5*5*7) = 840 + 175 = 1015 (估值) -> 调整为设定值
    },
    {
        id: "fishes_mythic_02",
        name: "太古苍龙",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 240, hp: 150, atk: 2}, // 无 Buff
        desc: "深海中的活化石，体型庞大如苍龙，力量无穷。",
        value: 920 // (80+150)*4 = 920
    },
    {
        id: "fishes_mythic_03",
        name: "九彩琉璃鱼",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 120, mp: 200, buff: {attr: 'shen', val: 6, days: 5}},
        desc: "通体晶莹剔透，散发九色光芒，能极大地滋养神识。",
        value: 1110 // (40+200)*4 + (6*5*5) = 960 + 150 = 1110
    },
    {
        id: "fishes_mythic_04",
        name: "幽冥鬼鱼",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 150, hp: 80, speed: 2}, // 无 Buff
        desc: "生于极阴之地，游动无声无息，如幽灵般诡异。",
        value: 520 // (50+80)*4 = 520 (注：speed未计入基础公式，仅作参考或单独计算) -> 修正为 HP+Hunger 基础
    },
    {
        id: "fishes_mythic_05",
        name: "吞天鲸(幼)",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 600, hp: 300, buff: {attr: 'def', val: 8, days: 3}},
        desc: "传说中能吞噬天地的巨兽幼体，肉质蕴含惊人能量。",
        value: 2120 // (200+300)*4 + (8*5*3) = 2000 + 120 = 2120
    },
    {
        id: "fishes_mythic_06",
        name: "寒冰玄龟",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 210, hp: 120, def: 2}, // 无 Buff
        desc: "背甲坚硬如玄铁，散发寒气，是炼体的大补之物。",
        value: 760 // (70+120)*4 = 760
    },
    {
        id: "fishes_mythic_07",
        name: "烈阳赤鳐",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 180, mp: 80, buff: {attr: 'atk', val: 5, days: 7}},
        desc: "体内仿佛燃烧着烈火，触之烫手，食之可强筋壮骨。",
        value: 735 // (60+80)*4 + (5*5*7) = 560 + 175 = 735
    },
    {
        id: "fishes_mythic_08",
        name: "星河银梭",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 90, speed: 2}, // 无 Buff
        desc: "身上斑点如星河灿烂，速度快到肉眼难以捕捉。",
        value: 120 // (30)*4 = 120 (特殊类，主要价值在稀有度和特殊效果)
    },
    {
        id: "fishes_mythic_09",
        name: "万寿灵龟",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 150, hp: 500, buff: {attr: 'hpMax', val: 10, days: 10}}, // 特殊Buff
        desc: "传说活了万年的灵龟，食其肉可延年益寿。",
        value: 2700 // (50+500)*4 + (10*5*10) = 2200 + 500 = 2700
    },
    {
        id: "fishes_mythic_10",
        name: "深渊魔章",
        type: "fish",
        rarity: 5,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 270, mp: 90, atk: 2}, // 无 Buff
        desc: "来自深渊的恐怖生物，触手带有魔性，味道却极其鲜美。",
        value: 720 // (90+90)*4 = 720
    },
    {
        id: "fishes_god_01",
        name: "北冥神鲲(幼)",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 1500, hp: 1000, mp: 1000, buff: {attr: 'hpMax', val: 10, days: 30}}, // 有 Buff
        desc: "不知其几千里也，虽是幼体，吞下亦可气吞山河，重塑肉身。",
        value: 14300 // (500+1000+1000)*5 + (10*6*30) = 12500 + 1800 = 14300
    },
    {
        id: "fishes_god_02",
        name: "太虚宙光鱼",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 300, hp: 500, mp: 500, speed: 4}, // 无 Buff
        desc: "游弋于时间长河中的生灵，甚至能让人产生时光倒流的错觉。",
        value: 5500 // (100+500+500)*5 = 5500
    },
    {
        id: "fishes_god_03",
        name: "阴阳玄灵鱼",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 600, hp: 800, mp: 800, buff: {attr: 'shen', val: 10, days: 10}}, // 有 Buff
        desc: "一黑一白双生游动，蕴含大道阴阳之理，食之可悟道。",
        value: 9600 // (200+800+800)*5 + (10*6*10) = 9000 + 600 = 9600
    },
    {
        id: "fishes_god_04",
        name: "混沌祖龙鲤",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 900, hp: 2000, buff: {attr: 'atk', val: 10, days: 7}}, // 有 Buff
        desc: "万龙之祖的血脉显化，一口咬下，仿佛能听见太古龙吟。",
        value: 11920 // (300+2000)*5 + (10*6*7) = 11500 + 420 = 11920
    },
    {
        id: "fishes_god_05",
        name: "灭世魔鲨",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 1500, hp: 500, atk: 4}, // 无 Buff
        desc: "生于归墟深渊，以毁灭为食，肉质中充满了暴虐的力量。",
        value: 5000 // (500+500)*5 = 5000
    },
    {
        id: "fishes_god_06",
        name: "涅槃凤羽",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 300, hp: 2000, buff: {attr: 'hp', val: 10, days: 15}}, // 有 Buff (HP回复/上限)
        desc: "真凤陨落海中化作的鱼，通体缭绕不灭之火，食之可浴火重生。",
        value: 11400 // (100+2000)*5 + (10*6*15) = 10500 + 900 = 11400
    },
    {
        id: "fishes_god_07",
        name: "星核重水鱼",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 3000, def: 4}, // 无 Buff
        desc: "吞噬星辰核心而生，小小一条重达万钧，口感如同嚼铁。",
        value: 5000 // (1000)*5 = 5000
    },
    {
        id: "fishes_god_08",
        name: "玄黄母气鱼",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 300, hp: 500, mp: 500, buff: {attr: 'qi', val: 10, days: 20}}, // 有 Buff
        desc: "天地初开时的玄黄之气所化，万物之母，拥有造化之功。",
        value: 6700 // (100+500+500)*5 + (10*6*20) = 5500 + 1200 = 6700
    },
    {
        id: "fishes_god_09",
        name: "虚空梦魇",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 150, mp: 1500}, // 无 Buff
        desc: "存在于现实与虚幻的夹缝中，不可名状，食之精神会受到极大冲击。",
        value: 7750 // (50+1500)*5 = 7750
    },
    {
        id: "fishes_god_10",
        name: "天道金鳞",
        type: "fish",
        rarity: 6,
        obtain: "fish",
        seasons: [0, 1, 2, 3],
        region: "all",
        effects: {hunger: 600, money: 10000}, // 无 Buff
        desc: "天道气运的实体化，与其说是生物，不如说是纯粹的“好运”。",
        value: 1000 // (200)*5 = 1000 (注：money不计入value公式，主要价值在于直接获得金钱)
    },

    /* === B. 季节性通用 (每季5种) 20种 === */
    /* 春 (0) */
    {id: "fishes_spr_01", name: "鲥鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 60, hp: 10}, desc: "长江三鲜之一，惜其多刺。", value: 33,},
    {id: "fishes_spr_02", name: "桃花鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 30}, desc: "桃花流水鳜鱼肥。", value: 12,},
    {id: "fishes_spr_03", name: "春鲤", type: "fish", rarity: 1, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 36}, desc: "春水生发时的鲤鱼。", value: 12,},
    {id: "fishes_spr_04", name: "细鳞鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 45, hp: 5}, desc: "鳞片细小，肉质细腻。", value: 20,},
    {id: "fishes_spr_05", name: "大头鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 75}, desc: "头真的很大。", value: 25,}, /* 夏 (1) */
    {id: "fishes_sum_01", name: "白鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 45}, desc: "浪里白条，游速极快。", value: 15,},
    {id: "fishes_sum_02", name: "黄鳝", type: "fish", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 30, hp: 5}, desc: "夏季补血良品。", value: 15,},
    {id: "fishes_sum_03", name: "鲶鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 60}, desc: "嘴大贪吃，生长在淤泥中。", value: 20,},
    {id: "fishes_sum_04", name: "鳊鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 36}, desc: "身扁肉厚。", value: 12,},
    {id: "fishes_sum_05", name: "罗非鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 45}, desc: "生命力顽强。", value: 15,}, /* 秋 (2) */
    {id: "fishes_aut_01", name: "鲈鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 54}, desc: "秋风起，鲈鱼美。", value: 18,},
    {id: "fishes_aut_02", name: "大闸蟹", type: "fish", rarity: 3, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 45, hp: 5}, desc: "虽然是蟹，但也算水产。", value: 20,},
    {id: "fishes_aut_03", name: "秋刀鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 36}, desc: "身形修长如刀。", value: 12,},
    {id: "fishes_aut_04", name: "鲑鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 75, hp: 5}, desc: "逆流而上产卵，油脂丰富。", value: 30,},
    {id: "fishes_aut_05", name: "武昌鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 54}, desc: "才饮长沙水，又食武昌鱼。", value: 18,}, /* 冬 (3) */
    {id: "fishes_win_01", name: "冬鲤", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 60, hp: 5}, desc: "积蓄了脂肪过冬，最为肥美。", value: 25,},
    {id: "fishes_win_02", name: "雪鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 45, hp: 20}, desc: "通体洁白，能解热毒。", value: 35,},
    {id: "fishes_win_03", name: "寒鲷", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 45}, desc: "皮厚肉紧。", value: 15,},
    {id: "fishes_win_04", name: "冰鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 45, hp: 10}, desc: "身体透明，也是一种异宝。", value: 25,},
    {id: "fishes_win_05", name: "冬眠鳖", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 45, hp: 30}, desc: "大补元气。", value: 45,},

    /* === C. 地区特有 (9地区 x 5种 = 45种) === */
    /* 关中: 渭河鲤(春), 泾河龙鲜(夏), 秦川鳖(秋), 冰泉鱼(冬), 太白鳞(全) */
    {id: "fishes_gz_01", name: "渭河金鲤", type: "fish", rarity: 3, obtain: "fish", seasons: [0], region: "r_c", effects: {hunger: 75}, desc: "【关中春】背如黄金。", value: 25,},
    {id: "fishes_gz_02", name: "泾河龙鲜", type: "fish", rarity: 4, obtain: "fish", seasons: [1], region: "r_c", effects: {hunger: 90, buff: {attr: 'qi', val: 4, days: 7}}, desc: "【关中夏】传说沾染龙气。", value: 120,},
    {id: "fishes_gz_03", name: "秦川老鳖", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "r_c", effects: {hunger: 60, hp: 40}, desc: "【关中秋】背甲如石。", value: 60,},
    {id: "fishes_gz_04", name: "冰泉银鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [3], region: "r_c", effects: {hunger: 30, mp: 20}, desc: "【关中冬】出于终南山冰泉。", value: 30,},
    {id: "fishes_gz_05", name: "太白鳞", type: "fish", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_c", effects: {hunger: 90}, desc: "【关中】太白山特产。", value: 30,},

    /* 齐鲁: 渤海对虾(春), 胶东鲍(夏), 梭子蟹(秋), 海参(冬), 黄河刀鱼(全) */
    {id: "fishes_ql_01", name: "渤海对虾", type: "fish", rarity: 2, obtain: "fish", seasons: [0], region: "r_e", effects: {hunger: 45, hp: 5}, desc: "【齐鲁春】个头极大。", value: 20,},
    {id: "fishes_ql_02", name: "胶东鲍", type: "fish", rarity: 4, obtain: "fish", seasons: [1], region: "r_e", effects: {hunger: 60, buff: {attr: 'jing', val: 4, days: 7}}, desc: "【齐鲁夏】海中珍品。", value: 80,},
    {id: "fishes_ql_03", name: "莱州蟹", type: "fish", rarity: 3, obtain: "fish", seasons: [2], region: "r_e", effects: {hunger: 60}, desc: "【齐鲁秋】膏满黄肥。", value: 20,},
    {id: "fishes_ql_04", name: "极品海参", type: "fish", rarity: 4, obtain: "fish", seasons: [3], region: "r_e", effects: {hunger: 75, buff: {attr: 'jing', val: 5, days: 7}}, desc: "【齐鲁冬】滋补养身。", value: 100,},
    {id: "fishes_ql_05", name: "黄河刀鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_e", effects: {hunger: 75}, desc: "【齐鲁】洄游至此，鲜美无比。", value: 25,},

    /* 巴蜀: 雅鱼(春), 江团(夏), 娃娃鱼(秋), 细甲鱼(冬), 岷江红(全) */
    {id: "fishes_bs_01", name: "雅鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [0], region: "r_se", effects: {hunger: 60}, desc: "【巴蜀春】头顶有剑骨。", value: 40,},
    {id: "fishes_bs_02", name: "江团", type: "fish", rarity: 3, obtain: "fish", seasons: [1], region: "r_se", effects: {hunger: 90, hp: 10}, desc: "【巴蜀夏】肥美无刺。", value: 40,},
    {id: "fishes_bs_03", name: "岩鲤", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "r_se", effects: {hunger: 75}, desc: "【巴蜀秋】藏于岩石激流。", value: 25,},
    {id: "fishes_bs_04", name: "细甲鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "r_se", effects: {hunger: 45}, desc: "【巴蜀冬】鳞片细密。", value: 15,},
    {id: "fishes_bs_05", name: "岷江红", type: "fish", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_se", effects: {hunger: 60, hp: 20}, desc: "【巴蜀】通体赤红，法力盎然。", value: 40,},

    /* 荆楚: 银鱼(春), 武昌鱼(夏), 大闸蟹(秋), 青背(冬), 中华鲟(全) */
    {id: "fishes_jc_01", name: "云梦银鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [0], region: "r_se", effects: {hunger: 30, mp: 10}, desc: "【荆楚春】如玉簪。", value: 20,},
    {id: "fishes_jc_02", name: "才鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [1], region: "r_se", effects: {hunger: 60, hp: 20}, desc: "【荆楚夏】生肌补血。", value: 40,},
    {id: "fishes_jc_03", name: "洞庭蟹", type: "fish", rarity: 3, obtain: "fish", seasons: [2], region: "r_se", effects: {hunger: 60}, desc: "【荆楚秋】不输阳澄湖。", value: 20,},
    {id: "fishes_jc_04", name: "青背", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "r_se", effects: {hunger: 75}, desc: "【荆楚冬】肉质紧实。", value: 25,},
    {id: "fishes_jc_05", name: "中华鲟(幼)", type: "fish", rarity: 4, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_se", effects: {hunger: 90, buff: {attr: 'def', val: 4, days: 7}}, desc: "【荆楚】水中活化石，极其珍贵。", value: 120,},

    /* 东海: 黄鱼(春), 带鱼(夏), 梭鱼(秋), 鳗鱼(冬), 鲛人泪(全-素材) -> 换成 蓝鳍金枪(全) */
    {id: "fishes_dh_01", name: "大黄鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [0], region: "r_e", effects: {hunger: 75, money: 50}, desc: "【东海春】浑身金黄，价值连城。", value: 75,},
    {id: "fishes_dh_02", name: "银带鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [1], region: "r_e", effects: {hunger: 60}, desc: "【东海夏】如银剑在水。", value: 20,},
    {id: "fishes_dh_03", name: "梭子鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "r_e", effects: {hunger: 54}, desc: "【东海秋】游速极快。", value: 18,},
    {id: "fishes_dh_04", name: "海鳗", type: "fish", rarity: 3, obtain: "fish", seasons: [3], region: "r_e", effects: {hunger: 60, hp: 30}, desc: "【东海冬】滋补气血。", value: 50,},
    {id: "fishes_dh_05", name: "蓝鳍金枪", type: "fish", rarity: 5, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_e", effects: {hunger: 150, hp: 100}, desc: "【东海】深海之王，极难捕获。", value: 150,},

    /* 辽东: 鳇鱼(春), 哲罗鲑(夏), 狗鱼(秋), 查干湖鱼(冬), 细鳞鲑(全) */
    {id: "fishes_ld_01", name: "达氏鳇", type: "fish", rarity: 4, obtain: "fish", seasons: [0], region: "r_ne", effects: {hunger: 150, hp: 30}, desc: "【辽东春】淡水鱼王，体型巨大。", value: 80,},
    {id: "fishes_ld_02", name: "哲罗鲑", type: "fish", rarity: 3, obtain: "fish", seasons: [1], region: "r_ne", effects: {hunger: 90}, desc: "【辽东夏】水中猛虎。", value: 30,},
    {id: "fishes_ld_03", name: "黑斑狗鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "r_ne", effects: {hunger: 60}, desc: "【辽东秋】生性贪婪。", value: 20,},
    {id: "fishes_ld_04", name: "冬捕胖头", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "r_ne", effects: {hunger: 120}, desc: "【辽东冬】查干湖冬捕特产。", value: 40,},
    {id: "fishes_ld_05", name: "细鳞鲑", type: "fish", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_ne", effects: {hunger: 60, hp: 20, mp: 5}, desc: "【辽东】冷水珍品。", value: 45,},

    /* 匈奴: 贝加尔白鲑(春), 茴鱼(夏), 狗鱼(秋), 江鳕(冬), 哲罗鲑(全) */
    {id: "fishes_xn_01", name: "北海白鲑", type: "fish", rarity: 3, obtain: "fish", seasons: [0], region: "r_nw", effects: {hunger: 60, mp: 10}, desc: "【匈奴春】产自北海(贝加尔湖)。", value: 30,},
    {id: "fishes_xn_02", name: "黑龙江茴鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [1], region: "r_nw", effects: {hunger: 45}, desc: "【匈奴夏】背鳍如旗。", value: 15,},
    {id: "fishes_xn_03", name: "草原狗鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "r_nw", effects: {hunger: 60}, desc: "【匈奴秋】草原河流中的猎手。", value: 2,},
    {id: "fishes_xn_04", name: "江鳕", type: "fish", rarity: 3, obtain: "fish", seasons: [3], region: "r_nw", effects: {hunger: 60, hp: 30}, desc: "【匈奴冬】只有肝脏最美味。", value: 50,},
    {id: "fishes_xn_05", name: "巨型哲罗", type: "fish", rarity: 4, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_nw", effects: {hunger: 180}, desc: "【匈奴】传说能吞食牛羊。", value: 60,},

    /* 陇西: 湟鱼(春), 黄河鲤(夏), 祁连雪鲤(秋), 裸鲤(冬), 大鲵(全) */
    {id: "fishes_lx_01", name: "青海湟鱼", type: "fish", rarity: 3, obtain: "fish", seasons: [0], region: "r_sw", effects: {hunger: 45, buff: {attr: 'shen', val: 3, days: 7}}, desc: "【陇西春】生长期极慢，蕴含法力。", value: 45,},
    {id: "fishes_lx_02", name: "黄河铜鲤", type: "fish", rarity: 2, obtain: "fish", seasons: [1], region: "r_sw", effects: {hunger: 60}, desc: "【陇西夏】鳞片如铜。", value: 20,},
    {id: "fishes_lx_03", name: "祁连雪鲤", type: "fish", rarity: 3, obtain: "fish", seasons: [2], region: "r_sw", effects: {hunger: 60, hp: 20, mp: 5}, desc: "【陇西秋】冰雪融水所养。", value: 45,},
    {id: "fishes_lx_04", name: "高原裸鲤", type: "fish", rarity: 2, obtain: "fish", seasons: [3], region: "r_sw", effects: {hunger: 30, hp: 5}, desc: "【陇西冬】无鳞之鱼。", value: 15,},
    {id: "fishes_lx_05", name: "野生大鲵", type: "fish", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_sw", effects: {hunger: 75, hp: 50}, desc: "【陇西】叫声如婴儿。", value: 75,},

    /* 北地: 梭鲈(春), 雅罗鱼(夏), 狗鱼(秋), 鲟鱼(冬), 冷水虾(全) */
    {id: "fishes_bd_01", name: "梭鲈", type: "fish", rarity: 2, obtain: "fish", seasons: [0], region: "r_n", effects: {hunger: 54}, desc: "【北地春】凶猛捕食者。", value: 18,},
    {id: "fishes_bd_02", name: "雅罗鱼", type: "fish", rarity: 1, obtain: "fish", seasons: [1], region: "r_n", effects: {hunger: 30}, desc: "【北地夏】常见的群游鱼。", value: 10,},
    {id: "fishes_bd_03", name: "北地狗鱼", type: "fish", rarity: 2, obtain: "fish", seasons: [2], region: "r_n", effects: {hunger: 60}, desc: "【北地秋】十分贪食。", value: 20,},
    {id: "fishes_bd_04", name: "史氏鲟", type: "fish", rarity: 4, obtain: "fish", seasons: [3], region: "r_n", effects: {hunger: 90, buff: {attr: 'atk', val: 5, days: 7}}, desc: "【北地冬】身披骨板。", value: 120,},
    {id: "fishes_bd_05", name: "冷水甜虾", type: "fish", rarity: 2, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_n", effects: {hunger: 15, hp: 5}, desc: "【北地】甘甜可口。", value: 10,}];


window.fishes=fishes;