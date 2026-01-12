// 成品食物
//console.log("加载 成品食物");

const foods = [
    {
        id: "foods_001", name: "清汤面", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 29 }, desc: "一碗简单的清汤面，加了盐提味。",
        recipe: [["foodMaterial_021", "foodMaterial_007", "foodMaterial_008"]]
        // 计算: R(1+1+1)*10 + H(3+0+0)*3 + Flavor(1)*5 = 30 + 9 + 5 = 44 (修正公式计算)
    },
    {
        id: "foods_002", name: "阳春面", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 52 }, desc: "汤清味鲜，葱油的香气是灵魂。",
        recipe: [["foodMaterial_021", "foodMaterial_007", "foodMaterial_059", "foodMaterial_020", "foodMaterial_072"]]
    },
    {
        id: "foods_003", name: "蛋炒饭", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 52 }, desc: "粒粒分明，充满了鸡蛋的焦香味。",
        recipe: [["foodMaterial_002", "foodMaterial_004", "foodMaterial_008", "foodMaterial_020"]]
    },
    {
        id: "foods_004", name: "红烧肉", type: "food", cookType: "Sauteing", grade: 1, rarity: 2, obtain: "craft",
        value: 48, effects: { hunger: 96 }, desc: "肥而不腻，软糯香甜。",
        recipe: [["foodMaterial_005", "foodMaterial_018", "foodMaterial_059", "foodMaterial_065", "foodMaterial_062"]]
    },
    {
        id: "foods_005", name: "烤鸡腿", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 35, effects: { hunger: 71 }, desc: "外焦里嫩，肉汁饱满。",
        recipe: [["foodMaterial_029", "foodMaterial_008", "foodMaterial_074", "foodMaterial_026"]]
    },
    {
        id: "foods_006", name: "炸薯条", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 20, effects: { hunger: 41 }, desc: "金黄酥脆的土豆条。",
        recipe: [["foodMaterial_042", "foodMaterial_008", "foodMaterial_069"]]
    },
    {
        id: "foods_007", name: "地三鲜", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 35, effects: { hunger: 70 }, desc: "土豆、茄子和青椒的完美融合。",
        recipe: [["foodMaterial_042", "foodMaterial_040", "foodMaterial_043", "foodMaterial_059", "foodMaterial_070"]]
    },
    {
        id: "foods_008", name: "酸辣土豆丝", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "爽脆开胃，酸辣适口。",
        recipe: [["foodMaterial_042", "foodMaterial_060", "foodMaterial_026", "foodMaterial_008"]]
    },
    {
        id: "foods_009", name: "排骨炖粉条", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 42, effects: { hunger: 85 }, desc: "粉条吸收了肉汤的精华。",
        recipe: [["foodMaterial_005", "foodMaterial_045", "foodMaterial_059", "foodMaterial_061", "foodMaterial_071"]]
    },
    {
        id: "foods_010", name: "麻婆豆腐", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 28, effects: { hunger: 56 }, desc: "麻、辣、鲜、烫、酥。",
        recipe: [["foodMaterial_027", "foodMaterial_068", "foodMaterial_064", "foodMaterial_026", "foodMaterial_070"]]
    },
    {
        id: "foods_011", name: "番茄炒蛋", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "国民级家常菜，酸甜适口。",
        recipe: [["foodMaterial_022", "foodMaterial_004", "foodMaterial_018", "foodMaterial_008"]]
    },
    {
        id: "foods_012", name: "紫菜蛋花汤", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 20, effects: { hunger: 41 }, desc: "清爽解腻，汤鲜味美。",
        recipe: [["foodMaterial_039", "foodMaterial_004", "foodMaterial_007", "foodMaterial_020", "foodMaterial_072"]]
    },
    {
        id: "foods_013", name: "孜然烤羊肉", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 38, effects: { hunger: 76 }, desc: "强烈的孜然香气压住了羊肉的膻味。",
        recipe: [["foodMaterial_048", "foodMaterial_074", "foodMaterial_026", "foodMaterial_008"]]
    },
    {
        id: "foods_014", name: "老鸭汤", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 38, effects: { hunger: 77 }, desc: "慢火熬煮，汤头浓郁鲜甜。",
        recipe: [["foodMaterial_049", "foodMaterial_007", "foodMaterial_071", "foodMaterial_062"]]
    },
    {
        id: "foods_015", name: "干煸豆角", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "豆角表皮微皱，咸鲜香辣。",
        recipe: [["foodMaterial_041", "foodMaterial_026", "foodMaterial_070", "foodMaterial_008"]]
    },
    {
        id: "foods_016", name: "炸鸡块", type: "food", cookType: "Frying", grade: 1, rarity: 2, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "金黄酥脆的表皮下是鲜嫩的鸡肉。",
        recipe: [["foodMaterial_029", "foodMaterial_001", "foodMaterial_008", "foodMaterial_073"]]
    },
    {
        id: "foods_017", name: "蜜汁烤翅", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 40, effects: { hunger: 81 }, desc: "蜂蜜的甜美与肉香完美结合。",
        recipe: [["foodMaterial_029", "foodMaterial_075", "foodMaterial_059", "foodMaterial_071"]]
    },
    {
        id: "foods_018", name: "清蒸鱼", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "极简的烹饪，保留了鱼肉最原始的鲜美。",
        recipe: [["foodMaterial_024", "foodMaterial_020", "foodMaterial_071", "foodMaterial_059"]]
    },
    {
        id: "foods_019", name: "皮蛋瘦肉粥", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "口感滑顺，营养丰富。",
        recipe: [["foodMaterial_002", "foodMaterial_030", "foodMaterial_005", "foodMaterial_007", "foodMaterial_020"]]
    },
    {
        id: "foods_020", name: "松仁玉米", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 52 }, desc: "色泽金黄，口感甜脆。",
        recipe: [["foodMaterial_011", "foodMaterial_018", "foodMaterial_008", "foodMaterial_070"]]
    },
    {
        id: "foods_021", name: "酱香饼", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "外焦里嫩，刷满了浓郁的特制酱料。",
        recipe: [["foodMaterial_001", "foodMaterial_025", "foodMaterial_020", "foodMaterial_034"]]
        // 计算: R(1+1+1+1)*10 + H(3+0+0+0)*3 + Flavor(3)*5 = 40 + 9 + 15 = 64 / 2 = 32 (修正此处计算误差，下同)
    },
    {
        id: "foods_022", name: "拔丝红薯", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 21, effects: { hunger: 43 }, desc: "金黄酥脆，糖浆能拉出长长的细丝。",
        recipe: [["foodMaterial_012", "foodMaterial_018", "foodMaterial_007"]]
        // R(1+1+1)*10 + H(2+0+0)*3 + Flavor(1)*5 = 30 + 6 + 5 = 41
    },
    {
        id: "foods_023", name: "杀猪菜", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 46, effects: { hunger: 93 }, desc: "酸菜与肥美鲜肉的豪迈结合。",
        recipe: [["foodMaterial_005", "foodMaterial_046", "foodMaterial_007", "foodMaterial_071", "foodMaterial_008"]]
        // R(2+1+1+1+1)*10 + H(2+1+0+0+0)*3 + Flavor(2)*5 = 60 + 9 + 10 = 79
    },
    {
        id: "foods_024", name: "烤蛇肉串", type: "food", cookType: "Roasting", grade: 1, rarity: 1, obtain: "craft",
        value: 40, effects: { hunger: 80 }, desc: "肉质极其细腻，撒上辣椒粉后异常鲜美。",
        recipe: [["foodMaterial_052", "foodMaterial_026", "foodMaterial_008", "foodMaterial_070"]]
        // R(1+1+1+1)*10 + H(10+0+0+0)*3 + Flavor(3)*5 = 40 + 30 + 15 = 85
    },
    {
        id: "foods_025", name: "蘑菇炖鸡", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 41, effects: { hunger: 83 }, desc: "山珍与家禽的完美邂逅，鲜掉眉毛。",
        recipe: [["foodMaterial_029", "foodMaterial_044", "foodMaterial_007", "foodMaterial_059", "foodMaterial_071"]]
        // R(2+1+1+1+1)*10 + H(2+1+0+0+0)*3 + Flavor(2)*5 = 60 + 9 + 10 = 79
    },
    {
        id: "foods_026", name: "油炸花生米", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 18, effects: { hunger: 37 }, desc: "下酒神菜，香脆无比。",
        recipe: [["foodMaterial_028", "foodMaterial_008"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(1)*5 = 20 + 6 + 5 = 31
    },
    {
        id: "foods_027", name: "酸辣萝卜丁", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 19, effects: { hunger: 38 }, desc: "简简单单的开胃小菜。",
        recipe: [["foodMaterial_038", "foodMaterial_060", "foodMaterial_026", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_028", name: "桂花糕", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 20, effects: { hunger: 41 }, desc: "口感软糯，带着淡淡的桂花清香。",
        recipe: [["foodMaterial_001", "foodMaterial_037", "foodMaterial_018"]]
        // R(1+1+1)*10 + H(3+0+0)*3 + Flavor(2)*5 = 30 + 9 + 10 = 49
    },
    {
        id: "foods_029", name: "红烧狼肉", type: "food", cookType: "Sauteing", grade: 2, rarity: 2, obtain: "craft",
        value: 54, effects: { hunger: 108 }, desc: "虽然狼肉口感微酸，但红烧能极大程度掩盖缺点。",
        recipe: [["foodMaterial_053", "foodMaterial_059", "foodMaterial_060", "foodMaterial_018", "foodMaterial_071"]]
        // R(1+1+1+1+1)*10 + H(15+0+0+0+0)*3 + Flavor(4)*5 = 50 + 45 + 20 = 115
    },
    {
        id: "foods_030", name: "炸鱼排", type: "food", cookType: "Frying", grade: 1, rarity: 1, obtain: "craft",
        value: 24, effects: { hunger: 49 }, desc: "将鲜鱼肉裹面油炸，酥脆鲜甜。",
        recipe: [["foodMaterial_024", "foodMaterial_001", "foodMaterial_008", "foodMaterial_073"]]
        // R(1+1+1+1)*10 + H(1+3+0+0)*3 + Flavor(2)*5 = 40 + 12 + 10 = 62
    },
    {
        id: "foods_031", name: "生煸鳄鱼肉", type: "food", cookType: "Sauteing", grade: 2, rarity: 2, obtain: "craft",
        value: 58, effects: { hunger: 115 }, desc: "口感介于鸡肉与鱼肉之间，极其紧实。",
        recipe: [["foodMaterial_056", "foodMaterial_071", "foodMaterial_020", "foodMaterial_067", "foodMaterial_062"]]
        // 计算: R(2+1+1+1+1)*10 + H(20+0+0+0+0)*3 + Flavor(4)*5 = 60 + 60 + 20 = 140 / 2 = 70 (按此公式重新核算)
    },
    {
        id: "foods_032", name: "孜然野猪排", type: "food", cookType: "Roasting", grade: 2, rarity: 2, obtain: "craft",
        value: 55, effects: { hunger: 110 }, desc: "野猪肉质粗犷，配上孜然简直绝配。",
        recipe: [["foodMaterial_051", "foodMaterial_074", "foodMaterial_026", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(20+0+0+0)*3 + Flavor(3)*5 = 40 + 60 + 15 = 115
    },
    {
        id: "foods_033", name: "爆炒虎肉片", type: "food", cookType: "Sauteing", grade: 3, rarity: 3, obtain: "craft",
        value: 80, effects: { hunger: 160 }, desc: "顶级食材的简单碰撞，食之气血翻涌。",
        recipe: [["foodMaterial_055", "foodMaterial_070", "foodMaterial_071", "foodMaterial_059", "foodMaterial_061"]]
        // R(3+1+1+1+1)*10 + H(25+0+0+0+0)*3 + Flavor(4)*5 = 70 + 75 + 20 = 165
    },
    {
        id: "foods_034", name: "蚝油生菜", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 19, effects: { hunger: 38 }, desc: "野菜鲜嫩，蚝油提鲜，清脆爽口。",
        recipe: [["foodMaterial_006", "foodMaterial_067", "foodMaterial_070"]]
        // R(1+1+1)*10 + H(1+0+0)*3 + Flavor(2)*5 = 30 + 3 + 10 = 43
    },
    {
        id: "foods_035", name: "五香炸麻雀", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 53 }, desc: "炸至酥脆，连骨头都能嚼着吃。",
        recipe: [["foodMaterial_014", "foodMaterial_073", "foodMaterial_008", "foodMaterial_062"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_036", name: "熊肉乱炖", type: "food", cookType: "Boiling", grade: 2, rarity: 2, obtain: "craft",
        value: 75, effects: { hunger: 150 }, desc: "大块熊肉与土豆同炖，油脂丰富，极度耐饿。",
        recipe: [["foodMaterial_054", "foodMaterial_042", "foodMaterial_007", "foodMaterial_065", "foodMaterial_008"]]
        // R(2+1+1+1+1)*10 + H(30+2+0+0+0)*3 + Flavor(2)*5 = 60 + 96 + 10 = 166
    },
    {
        id: "foods_037", name: "麻辣烫", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 36, effects: { hunger: 72 }, desc: "万物皆可煮，精髓全在汤底里。",
        recipe: [["foodMaterial_045", "foodMaterial_027", "foodMaterial_006", "foodMaterial_068", "foodMaterial_026"]]
        // R(1+1+1+1+1)*10 + H(3+2+1+1+0)*3 + Flavor(2)*5 = 50 + 21 + 10 = 81
    },
    {
        id: "foods_038", name: "糖醋里脊", type: "food", cookType: "Frying", grade: 1, rarity: 2, obtain: "craft",
        value: 30, effects: { hunger: 61 }, desc: "酸甜的外壳下包裹着鲜嫩的肉质。",
        recipe: [["foodMaterial_005", "foodMaterial_018", "foodMaterial_060", "foodMaterial_001"]]
        // R(2+1+1+1)*10 + H(2+0+0+3)*3 + Flavor(2)*5 = 50 + 15 + 10 = 75
    },
    {
        id: "foods_039", name: "回锅肉", type: "food", cookType: "Sauteing", grade: 1, rarity: 2, obtain: "craft",
        value: 40, effects: { hunger: 80 }, desc: "肥而不腻，豆瓣酱的香味入木三分。",
        recipe: [["foodMaterial_005", "foodMaterial_068", "foodMaterial_020", "foodMaterial_070"]]
        // R(2+1+1+1)*10 + H(2+1+0+0)*3 + Flavor(3)*5 = 50 + 9 + 15 = 74
    },
    {
        id: "foods_040", name: "蜂蜜烤鱼", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 38, effects: { hunger: 77 }, desc: "刷了蜂蜜的鲜鱼，外皮焦甜。",
        recipe: [["foodMaterial_024", "foodMaterial_075", "foodMaterial_008", "foodMaterial_071"]]
        // R(1+2+1+1)*10 + H(1+5+0+0)*3 + Flavor(3)*5 = 50 + 18 + 15 = 83
    },
    {
        id: "foods_041", name: "芝麻汤圆", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 29, effects: { hunger: 58 }, desc: "软糯的皮包着香甜的芝麻馅，象征团团圆圆。",
        recipe: [["foodMaterial_001", "foodMaterial_036", "foodMaterial_018", "foodMaterial_007"]]
        // R(1+1+1+1)*10 + H(3+2+0+0)*3 + Flavor(2)*5 = 40 + 15 + 10 = 65
    },
    {
        id: "foods_042", name: "清香粽子", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 53 }, desc: "淡淡的粽叶香沁入粘米之中，口感扎实。",
        recipe: [["foodMaterial_047", "foodMaterial_033", "foodMaterial_007", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(3+0+0+0)*3 + Flavor(1)*5 = 40 + 9 + 5 = 54
    },
    {
        id: "foods_043", name: "青团", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 22, effects: { hunger: 44 }, desc: "艾草的清香与面粉融合，是春天的味道。",
        recipe: [["foodMaterial_001", "foodMaterial_035", "foodMaterial_018"]]
        // R(1+1+1)*10 + H(3+0+0)*3 + Flavor(1)*5 = 30 + 9 + 5 = 44
    },
    {
        id: "foods_044", name: "红烧大虾", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 25, effects: { hunger: 51 }, desc: "虽然是生鱼片改制，但红烧后依然鲜甜。",
        recipe: [["foodMaterial_057", "foodMaterial_059", "foodMaterial_018", "foodMaterial_071"]]
        // R(1+1+1+1)*10 + H(8+0+0+0)*3 + Flavor(3)*5 = 40 + 24 + 15 = 79
    },
    {
        id: "foods_045", name: "竹筒饭", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 28, effects: { hunger: 56 }, desc: "竹子的清香完全融入米饭，回味悠长。",
        recipe: [["foodMaterial_002", "foodMaterial_032", "foodMaterial_008"]]
        // R(1+1+1)*10 + H(3+0+0)*3 + Flavor(1)*5 = 30 + 9 + 5 = 44 (修正: 加上火烤风味)
    },
    {
        id: "foods_046", name: "干锅狼肉", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 49, effects: { hunger: 99 }, desc: "重油重辣，极大程度提升了狼肉的口感。",
        recipe: [["foodMaterial_053", "foodMaterial_026", "foodMaterial_068", "foodMaterial_070", "foodMaterial_074"]]
        // R(1+1+1+1+1)*10 + H(15+0+1+0+0)*3 + Flavor(4)*5 = 50 + 48 + 20 = 118
    },
    {
        id: "foods_047", name: "荷叶蒸鸡", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 36, effects: { hunger: 73 }, desc: "荷叶包裹下的鸡肉，鲜嫩多汁，不油不腻。",
        recipe: [["foodMaterial_029", "foodMaterial_031", "foodMaterial_008", "foodMaterial_062"]]
        // R(2+1+1+1)*10 + H(2+0+0+0)*3 + Flavor(2)*5 = 50 + 6 + 10 = 66
    },
    {
        id: "foods_048", name: "剁椒鱼头", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 30, effects: { hunger: 60 }, desc: "火辣的剁椒覆在鲜嫩鱼头上，极度开胃。",
        recipe: [["foodMaterial_024", "foodMaterial_026", "foodMaterial_071", "foodMaterial_059"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_049", name: "酱焖茄子", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 47 }, desc: "茄子吸饱了咸鲜的酱汁，非常下饭。",
        recipe: [["foodMaterial_040", "foodMaterial_025", "foodMaterial_070", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_050", name: "宫保鸡丁", type: "food", cookType: "Sauteing", grade: 1, rarity: 2, obtain: "craft",
        value: 41, effects: { hunger: 82 }, desc: "鸡丁滑嫩，花生酥脆，酸甜略带微辣。",
        recipe: [["foodMaterial_029", "foodMaterial_028", "foodMaterial_018", "foodMaterial_060", "foodMaterial_026"]]
        // R(2+1+1+1+1)*10 + H(2+2+0+0+0)*3 + Flavor(3)*5 = 60 + 12 + 15 = 87
    },
    {
        id: "foods_051", name: "蜂蜜扒鸭", type: "food", cookType: "Roasting", grade: 2, rarity: 2, obtain: "craft",
        value: 48, effects: { hunger: 97 }, desc: "鸭皮刷上蜂蜜烤至金黄，甜而不腻，滋味入骨。",
        recipe: [["foodMaterial_049", "foodMaterial_075", "foodMaterial_059", "foodMaterial_062", "foodMaterial_065"]]
        // 计算: R(2+2+1+1+1)*10 + H(2+5+0+0+0)*3 + Flavor(4)*5 = 70 + 21 + 20 = 111 (计算结果供参考)
    },
    {
        id: "foods_052", name: "鱼香肉丝", type: "food", cookType: "Sauteing", grade: 1, rarity: 2, obtain: "craft",
        value: 39, effects: { hunger: 79 }, desc: "虽无鱼肉，却有鱼味。酸辣鲜甜，极为下饭。",
        recipe: [["foodMaterial_005", "foodMaterial_060", "foodMaterial_018", "foodMaterial_068", "foodMaterial_026"]]
        // R(2+1+1+1+1)*10 + H(2+0+0+1+0)*3 + Flavor(4)*5 = 60 + 9 + 20 = 89
    },
    {
        id: "foods_053", name: "葱油饼", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 47 }, desc: "层层酥脆，满口都是葱香和芝麻香。",
        recipe: [["foodMaterial_001", "foodMaterial_020", "foodMaterial_072", "foodMaterial_008"]]
        // R(1+1+2+1)*10 + H(3+0+0+0)*3 + Flavor(3)*5 = 50 + 9 + 15 = 74
    },
    {
        id: "foods_054", name: "白灼生鱼片", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 27, effects: { hunger: 54 }, desc: "快速汆烫保留鱼肉极佳弹性，蘸点蚝油最是美味。",
        recipe: [["foodMaterial_057", "foodMaterial_067", "foodMaterial_071", "foodMaterial_020"]]
        // R(1+1+1+1)*10 + H(8+0+0+0)*3 + Flavor(3)*5 = 40 + 24 + 15 = 79
    },
    {
        id: "foods_055", name: "红烧羊肉煲", type: "food", cookType: "Boiling", grade: 2, rarity: 2, obtain: "craft",
        value: 54, effects: { hunger: 109 }, desc: "羊肉炖至酥烂，加入八角桂皮后香气扑鼻。",
        recipe: [["foodMaterial_048", "foodMaterial_065", "foodMaterial_066", "foodMaterial_059", "foodMaterial_071"]]
        // R(2+1+1+1+1)*10 + H(2+0+0+0+0)*3 + Flavor(4)*5 = 60 + 6 + 20 = 86
    },
    {
        id: "foods_056", name: "椒盐蝎子", type: "food", cookType: "Frying", grade: 2, rarity: 2, obtain: "craft",
        value: 39, effects: { hunger: 79 }, desc: "去毒后深海油炸，酥脆无比，是极佳的下酒菜。",
        recipe: [["foodMaterial_058", "foodMaterial_008", "foodMaterial_063", "foodMaterial_064"]]
        // R(2+1+1+1)*10 + H(5+0+0+0)*3 + Flavor(3)*5 = 50 + 15 + 15 = 80
    },
    {
        id: "foods_057", name: "滑蛋虾仁", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 34, effects: { hunger: 69 }, desc: "蛋液包裹着Q弹的鱼片碎，口感丝滑。",
        recipe: [["foodMaterial_004", "foodMaterial_057", "foodMaterial_008", "foodMaterial_061"]]
        // R(1+1+1+1)*10 + H(1+8+0+0)*3 + Flavor(2)*5 = 40 + 27 + 10 = 77
    },
    {
        id: "foods_058", name: "五香烧鹅", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 41, effects: { hunger: 82 }, desc: "利用鸭肉模拟鹅肉口感，五香粉的味道沁人心脾。",
        recipe: [["foodMaterial_049", "foodMaterial_073", "foodMaterial_008", "foodMaterial_071", "foodMaterial_018"]]
        // R(2+1+1+1+1)*10 + H(2+0+0+0+0)*3 + Flavor(4)*5 = 60 + 6 + 20 = 86
    },
    {
        id: "foods_059", name: "麻辣鱼干", type: "food", cookType: "Frying", grade: 1, rarity: 1, obtain: "craft",
        value: 29, effects: { hunger: 58 }, desc: "生鱼炸干水份，又麻又辣，越嚼越香。",
        recipe: [["foodMaterial_024", "foodMaterial_026", "foodMaterial_064", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_060", name: "糖醋鱼", type: "food", cookType: "Frying", grade: 1, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "外皮酥脆，酸甜的芡汁包裹着鲜嫩的鱼肉。",
        recipe: [["foodMaterial_024", "foodMaterial_018", "foodMaterial_060", "foodMaterial_059", "foodMaterial_001"]]
        // R(1+1+1+1+1)*10 + H(1+0+0+0+3)*3 + Flavor(3)*5 = 50 + 12 + 15 = 77
    },
    {
        id: "foods_061", name: "生滚小米粥", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "金黄粘稠的小米粥，最是养人肠胃。",
        recipe: [["foodMaterial_019", "foodMaterial_007", "foodMaterial_071", "foodMaterial_008"]]
        // 计算: R(1+1+1+1)*10 + H(3+0+0+0)*3 + Flavor(2)*5 = 40 + 9 + 10 = 59 / 2 = 29
    },
    {
        id: "foods_062", name: "麻辣狗肉火锅", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 55, effects: { hunger: 110 }, desc: "俗话说‘狗肉滚三滚，神仙站不稳’，大补驱寒。",
        recipe: [["foodMaterial_050", "foodMaterial_026", "foodMaterial_064", "foodMaterial_071", "foodMaterial_008"]]
        // R(1+1+1+1+1)*10 + H(15+0+0+0+0)*3 + Flavor(4)*5 = 50 + 45 + 20 = 115
    },
    {
        id: "foods_063", name: "脆皮烤乳猪", type: "food", cookType: "Roasting", grade: 2, rarity: 1, obtain: "craft",
        value: 63, effects: { hunger: 126 }, desc: "野猪肉烤至表皮红润酥脆，肉质细嫩。",
        recipe: [["foodMaterial_051", "foodMaterial_018", "foodMaterial_072", "foodMaterial_073", "foodMaterial_008"]]
        // R(1+1+2+1+1)*10 + H(20+0+0+0+0)*3 + Flavor(4)*5 = 60 + 60 + 20 = 140
    },
    {
        id: "foods_064", name: "荷叶包裹烤肉", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 36, effects: { hunger: 73 }, desc: "用荷叶包住鲜肉烘烤，肉香中带着阵阵清香。",
        recipe: [["foodMaterial_005", "foodMaterial_031", "foodMaterial_008", "foodMaterial_063"]]
        // R(2+1+1+1)*10 + H(2+0+0+0)*3 + Flavor(2)*5 = 50 + 6 + 10 = 66
    },
    {
        id: "foods_065", name: "爆炒蚕豆", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "简单的家常做法，却有着浓郁的豆香。",
        recipe: [["foodMaterial_016", "foodMaterial_070", "foodMaterial_020", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(2+0+0+0)*3 + Flavor(3)*5 = 40 + 6 + 15 = 61
    },
    {
        id: "foods_066", name: "孜然炒面", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 28, effects: { hunger: 57 }, desc: "街头风味，火气十足，孜然味重。",
        recipe: [["foodMaterial_021", "foodMaterial_074", "foodMaterial_020", "foodMaterial_059", "foodMaterial_026"]]
        // R(1+1+1+1+1)*10 + H(3+0+0+0+0)*3 + Flavor(4)*5 = 50 + 9 + 20 = 79
    },
    {
        id: "foods_067", name: "紫菜鱼丸汤", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 36, effects: { hunger: 72 }, desc: "将生鱼剁碎制丸，汤头鲜美，老少皆宜。",
        recipe: [["foodMaterial_024", "foodMaterial_039", "foodMaterial_007", "foodMaterial_061", "foodMaterial_072"]]
        // R(1+1+1+1+2)*10 + H(1+1+0+0+0)*3 + Flavor(2)*5 = 60 + 6 + 10 = 76
    },
    {
        id: "foods_068", name: "炸臭豆腐", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 24, effects: { hunger: 49 }, desc: "闻着臭，吃着香，配上辣椒酱一绝。",
        recipe: [["foodMaterial_027", "foodMaterial_026", "foodMaterial_008", "foodMaterial_070"]]
        // R(1+1+1+1)*10 + H(2+0+0+0)*3 + Flavor(3)*5 = 40 + 6 + 15 = 61
    },
    {
        id: "foods_069", name: "酱爆鸭片", type: "food", cookType: "Sauteing", grade: 1, rarity: 2, obtain: "craft",
        value: 39, effects: { hunger: 79 }, desc: "鸭肉片大火快炒，锁住肉汁，酱香浓郁。",
        recipe: [["foodMaterial_049", "foodMaterial_025", "foodMaterial_070", "foodMaterial_062"]]
        // R(2+1+1+1)*10 + H(2+0+0+0)*3 + Flavor(3)*5 = 50 + 6 + 15 = 71
    },
    {
        id: "foods_070", name: "八宝饭", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "多种材料汇聚，软糯香甜，富含层次感。",
        recipe: [["foodMaterial_047", "foodMaterial_015", "foodMaterial_018", "foodMaterial_037", "foodMaterial_007"]]
        // R(1+1+1+1+1)*10 + H(3+2+0+0+0)*3 + Flavor(2)*5 = 50 + 15 + 10 = 75
    },
    {
        id: "foods_071", name: "生菜拌肉片", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 36, effects: { hunger: 73 }, desc: "野菜的爽脆中和了鲜肉的油腻，简单且健康。",
        recipe: [["foodMaterial_005", "foodMaterial_006", "foodMaterial_072", "foodMaterial_008", "foodMaterial_070"]]
        // 计算: R(2+1+2+1+1)*10 + H(2+1+0+0+0)*3 + Flavor(3)*5 = 70 + 9 + 15 = 94 / 2 = 47 (修正结果)
    },
    {
        id: "foods_072", name: "麦麸红薯粥", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "虽然口感略显粗糙，但极度耐饿，是生存良品。",
        recipe: [["foodMaterial_023", "foodMaterial_012", "foodMaterial_007", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(1+2+0+0)*3 + Flavor(1)*5 = 40 + 9 + 5 = 54
    },
    {
        id: "foods_073", name: "脆皮炸鲜奶", type: "food", cookType: "Frying", grade: 1, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 53 }, desc: "外层酥脆，内里如丝绸般顺滑甜香。",
        recipe: [["foodMaterial_001", "foodMaterial_018", "foodMaterial_007", "foodMaterial_004"]]
        // R(1+1+1+1)*10 + H(3+0+0+1)*3 + Flavor(1)*5 = 40 + 12 + 5 = 57
    },
    {
        id: "foods_074", name: "凉拌皮蛋", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 29, effects: { hunger: 58 }, desc: "晶莹剔透的皮蛋配上特制酱汁，鲜美开胃。",
        recipe: [["foodMaterial_030", "foodMaterial_059", "foodMaterial_060", "foodMaterial_072", "foodMaterial_020"]]
        // R(1+1+1+2+1)*10 + H(2+0+0+0+0)*3 + Flavor(4)*5 = 60 + 6 + 20 = 86
    },
    {
        id: "foods_075", name: "蚂蚁上树", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "肉末吸附在粉条上，形似蚂蚁上树，咸鲜适口。",
        recipe: [["foodMaterial_045", "foodMaterial_005", "foodMaterial_068", "foodMaterial_071", "foodMaterial_020"]]
        // R(1+2+1+1+1)*10 + H(3+2+1+0+0)*3 + Flavor(3)*5 = 60 + 18 + 15 = 93
    },
    {
        id: "foods_076", name: "挂糊炸茄盒", type: "food", cookType: "Frying", grade: 1, rarity: 2, obtain: "craft",
        value: 38, effects: { hunger: 77 }, desc: "茄子夹着鲜肉裹面油炸，口感层次极其丰富。",
        recipe: [["foodMaterial_040", "foodMaterial_005", "foodMaterial_001", "foodMaterial_008", "foodMaterial_059"]]
        // R(1+2+1+1+1)*10 + H(1+2+3+0+0)*3 + Flavor(2)*5 = 60 + 18 + 10 = 88
    },
    {
        id: "foods_077", name: "糖醋荷包蛋", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 27, effects: { hunger: 55 }, desc: "炸过的蛋皮吸满了酸甜的汁水，咬一口就爆浆。",
        recipe: [["foodMaterial_004", "foodMaterial_018", "foodMaterial_060", "foodMaterial_059"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_078", name: "辣炒蛇肉片", type: "food", cookType: "Sauteing", grade: 2, rarity: 1, obtain: "craft",
        value: 41, effects: { hunger: 82 }, desc: "蛇肉的脆爽与辣椒的火热完美融合，越吃越过瘾。",
        recipe: [["foodMaterial_052", "foodMaterial_026", "foodMaterial_070", "foodMaterial_071", "foodMaterial_067"]]
        // R(1+1+1+1+1)*10 + H(10+0+0+0+0)*3 + Flavor(4)*5 = 50 + 30 + 20 = 100
    },
    {
        id: "foods_079", name: "酸菜氽白肉", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 46, effects: { hunger: 93 }, desc: "酸菜解了白肉的腻，肉片入口即化，汤头鲜美。",
        recipe: [["foodMaterial_046", "foodMaterial_005", "foodMaterial_007", "foodMaterial_071", "foodMaterial_008"]]
        // R(1+2+1+1+1)*10 + H(1+2+0+0+0)*3 + Flavor(2)*5 = 60 + 9 + 10 = 79
    },
    {
        id: "foods_080", name: "蜜汁烤排骨", type: "food", cookType: "Roasting", grade: 2, rarity: 2, obtain: "craft",
        value: 48, effects: { hunger: 97 }, desc: "刷上厚厚一层蜂蜜，烤出的排骨色泽红亮，香甜可口。",
        recipe: [["foodMaterial_005", "foodMaterial_075", "foodMaterial_073", "foodMaterial_062", "foodMaterial_008"]]
        // R(2+2+1+1+1)*10 + H(2+5+0+0+0)*3 + Flavor(3)*5 = 70 + 21 + 15 = 106
    },
    {
        id: "foods_081", name: "柿子饼", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "柿子去皮与面粉混合煎制，软糯香甜，满口果香。",
        recipe: [["foodMaterial_017", "foodMaterial_001", "foodMaterial_018"]]
        // 计算: R(1+1+1)*10 + H(1+3+0)*3 + Flavor(1)*5 = 30 + 12 + 5 = 47 / 2 = 23
    },
    {
        id: "foods_082", name: "炭烤鲜玉米", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 19, effects: { hunger: 39 }, desc: "最原始的美味，外皮焦香，内里甜脆。",
        recipe: [["foodMaterial_011", "foodMaterial_008", "foodMaterial_020"]]
        // R(1+1+1)*10 + H(2+0+0)*3 + Flavor(2)*5 = 30 + 6 + 10 = 46
    },
    {
        id: "foods_083", name: "干炒花生仁", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 18, effects: { hunger: 37 }, desc: "不用一滴油，干炒出的花生仁香气最是纯正。",
        recipe: [["foodMaterial_028", "foodMaterial_008", "foodMaterial_018"]]
        // R(1+1+1)*10 + H(2+0+0)*3 + Flavor(2)*5 = 30 + 6 + 10 = 46
    },
    {
        id: "foods_084", name: "蚝油杏鲍菇", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 25, effects: { hunger: 51 }, desc: "蘑菇的鲜味被蚝油完美激发，口感厚实如肉。",
        recipe: [["foodMaterial_044", "foodMaterial_067", "foodMaterial_070", "foodMaterial_059"]]
        // R(1+1+1+1)*10 + H(1+0+0+0)*3 + Flavor(3)*5 = 40 + 3 + 15 = 58
    },
    {
        id: "foods_085", name: "乱炖狗肉", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 51, effects: { hunger: 102 }, desc: "大锅慢炖，各种香料的味道透进每一丝肉理。",
        recipe: [["foodMaterial_050", "foodMaterial_065", "foodMaterial_066", "foodMaterial_071", "foodMaterial_008"]]
        // R(1+1+1+1+1)*10 + H(15+0+0+0+0)*3 + Flavor(4)*5 = 50 + 45 + 20 = 115
    },
    {
        id: "foods_086", name: "拔丝苹果", type: "food", cookType: "Sauteing", grade: 1, rarity: 1, obtain: "craft",
        value: 21, effects: { hunger: 43 }, desc: "虽然没有苹果，但用柿子代替也别有一番风味。",
        recipe: [["foodMaterial_017", "foodMaterial_018", "foodMaterial_007", "foodMaterial_072"]]
        // R(1+1+1+2)*10 + H(1+0+0+0)*3 + Flavor(2)*5 = 50 + 3 + 10 = 63
    },
    {
        id: "foods_087", name: "五香炸鱼块", type: "food", cookType: "Frying", grade: 1, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "裹上一层薄薄的面粉，炸得酥酥脆脆。",
        recipe: [["foodMaterial_024", "foodMaterial_001", "foodMaterial_073", "foodMaterial_008"]]
        // R(1+1+1+1)*10 + H(1+3+0+0)*3 + Flavor(2)*5 = 40 + 12 + 10 = 62
    },
    {
        id: "foods_088", name: "红烧鳄鱼掌", type: "food", cookType: "Boiling", grade: 2, rarity: 2, obtain: "craft",
        value: 64, effects: { hunger: 129 }, desc: "珍贵的野味，胶质丰富，强筋壮骨。",
        recipe: [["foodMaterial_056", "foodMaterial_059", "foodMaterial_065", "foodMaterial_066", "foodMaterial_062"]]
        // R(2+1+1+1+1)*10 + H(20+0+0+0+0)*3 + Flavor(4)*5 = 60 + 60 + 20 = 140
    },
    {
        id: "foods_089", name: "麻辣烫粉条", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 36, effects: { hunger: 73 }, desc: "粉条Q弹爽滑，汤底又麻又辣，吃完出一身汗。",
        recipe: [["foodMaterial_045", "foodMaterial_026", "foodMaterial_064", "foodMaterial_008", "foodMaterial_007"]]
        // R(1+1+1+1+1)*10 + H(3+0+0+0+0)*3 + Flavor(3)*5 = 50 + 9 + 15 = 74
    },
    {
        id: "foods_090", name: "虎骨清汤", type: "food", cookType: "Boiling", grade: 3, rarity: 3, obtain: "craft",
        value: 77, effects: { hunger: 155 }, desc: "虽然是用虎肉熬制，但这清汤依然气势磅礴。",
        recipe: [["foodMaterial_055", "foodMaterial_007", "foodMaterial_071", "foodMaterial_062"]]
        // R(3+1+1+1)*10 + H(25+0+0+0)*3 + Flavor(2)*5 = 60 + 75 + 10 = 145
    },
    {
        id: "foods_091", name: "艾草香煎饼", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 47 }, desc: "艾草的苦甜与面粉的焦香在舌尖交织。",
        recipe: [["foodMaterial_035", "foodMaterial_001", "foodMaterial_008", "foodMaterial_072"]]
        // R(1+1+1+2)*10 + H(0+3+0+0)*3 + Flavor(2)*5 = 50 + 9 + 10 = 69 / 2 = 34 (调整价值保持平衡)
    },
    {
        id: "foods_092", name: "皮蛋豆腐", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 30, effects: { hunger: 61 }, desc: "咸鲜爽口，是夏季最受欢迎的凉拌菜。",
        recipe: [["foodMaterial_030", "foodMaterial_027", "foodMaterial_059", "foodMaterial_072", "foodMaterial_020"]]
        // R(1+1+1+2+1)*10 + H(2+2+0+0+0)*3 + Flavor(3)*5 = 60 + 12 + 15 = 87
    },
    {
        id: "foods_093", name: "虎肉叉烧", type: "food", cookType: "Roasting", grade: 3, rarity: 3, obtain: "craft",
        value: 82, effects: { hunger: 165 }, desc: "涂满蜂蜜烤制的虎肉，每一口都是力量的证明。",
        recipe: [["foodMaterial_055", "foodMaterial_075", "foodMaterial_059", "foodMaterial_018", "foodMaterial_073"]]
        // R(3+2+1+1+1)*10 + H(25+5+0+0+0)*3 + Flavor(4)*5 = 80 + 90 + 20 = 190
    },
    {
        id: "foods_094", name: "芝麻南瓜饼", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 52 }, desc: "虽然没有南瓜，但红薯与芝麻的组合同样软糯。",
        recipe: [["foodMaterial_012", "foodMaterial_001", "foodMaterial_034", "foodMaterial_018"]]
        // R(1+1+1+1)*10 + H(2+3+0+0)*3 + Flavor(2)*5 = 40 + 15 + 10 = 65
    },
    {
        id: "foods_095", name: "黑芝麻糊", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 23, effects: { hunger: 46 }, desc: "浓郁顺滑，充满黑芝麻独特的醇厚香气。",
        recipe: [["foodMaterial_036", "foodMaterial_007", "foodMaterial_018"]]
        // R(1+1+1)*10 + H(2+0+0)*3 + Flavor(2)*5 = 30 + 6 + 10 = 46
    },
    {
        id: "foods_096", name: "油炸蚕豆", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 18, effects: { hunger: 37 }, desc: "嚼劲十足，咸鲜酥脆，绝佳的干粮。",
        recipe: [["foodMaterial_016", "foodMaterial_008", "foodMaterial_026"]]
        // R(1+1+1)*10 + H(2+0+0)*3 + Flavor(2)*5 = 30 + 6 + 10 = 46
    },
    {
        id: "foods_097", name: "熊掌焖面", type: "food", cookType: "Boiling", grade: 2, rarity: 2, obtain: "craft",
        value: 71, effects: { hunger: 143 }, desc: "熊肉油脂浸透面条，分外鲜美，极其扎实。",
        recipe: [["foodMaterial_054", "foodMaterial_021", "foodMaterial_059", "foodMaterial_071", "foodMaterial_065"]]
        // R(2+1+1+1+1)*10 + H(30+3+0+0+0)*3 + Flavor(3)*5 = 60 + 99 + 15 = 174
    },
    {
        id: "foods_098", name: "酱香鳄鱼丁", type: "food", cookType: "Sauteing", grade: 2, rarity: 2, obtain: "craft",
        value: 58, effects: { hunger: 117 }, desc: "豆瓣酱与鳄鱼肉的激情碰撞，咸辣浓郁。",
        recipe: [["foodMaterial_056", "foodMaterial_068", "foodMaterial_070", "foodMaterial_071"]]
        // R(2+1+1+1)*10 + H(20+1+0+0)*3 + Flavor(3)*5 = 50 + 63 + 15 = 128
    },
    {
        id: "foods_099", name: "桂花糖藕", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 26, effects: { hunger: 53 }, desc: "利用粘米模拟糯米，辅以桂花与蜂蜜，甜入心扉。",
        recipe: [["foodMaterial_047", "foodMaterial_037", "foodMaterial_075", "foodMaterial_007"]]
        // R(1+1+2+1)*10 + H(3+0+5+0)*3 + Flavor(2)*5 = 50 + 24 + 10 = 84
    },
    {
        id: "foods_400", name: "至尊百味锅", type: "food", cookType: "Boiling", grade: 3, rarity: 3, obtain: "craft",
        value: 110, effects: { hunger: 220 }, desc: "汇聚了虎肉与熊肉的顶级乱炖，食之可立地成神。",
        recipe: [["foodMaterial_055", "foodMaterial_054", "foodMaterial_070", "foodMaterial_059", "foodMaterial_072"]]
        // R(3+2+1+1+2)*10 + H(25+30+0+0+0)*3 + Flavor(3)*5 = 90 + 165 + 15 = 270
    },
    {
        id: "foods_401", name: "烤红薯", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "最简单的美味，冬日里的温暖慰藉。",
        recipe: [["foodMaterial_012"]]
        // 计算: R(1)*10 + H(2)*3 + Flavor(0)*5 = 10 + 6 + 0 = 16 (基础分提升以防数值过低)
    },
    {
        id: "foods_402", name: "白米饭", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 10, effects: { hunger: 20 }, desc: "晶莹剔透，虽然没有配菜也能吃下一大碗。",
        recipe: [["foodMaterial_002", "foodMaterial_007"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(0)*5 = 20 + 9 + 0 = 29
    },
    {
        id: "foods_403", name: "清炒野菜", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 9, effects: { hunger: 18 }, desc: "保留了山野间的清新气息。",
        recipe: [["foodMaterial_006", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_404", name: "煎蛋", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 12, effects: { hunger: 24 }, desc: "边缘焦脆，内里蛋黄还带着流心。",
        recipe: [["foodMaterial_004", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_405", name: "烤鱼", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 12, effects: { hunger: 25 }, desc: "架在火上烘烤的鲜鱼，香气四溢。",
        recipe: [["foodMaterial_024", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_406", name: "水煮蛋", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "剥开壳后，是洁白滑嫩的蛋清。",
        recipe: [["foodMaterial_004", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 + 0 = 23
    },
    {
        id: "foods_407", name: "油炸花生", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 15, effects: { hunger: 31 }, desc: "每一粒都金黄酥脆。",
        recipe: [["foodMaterial_015", "foodMaterial_008"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(1)*5 = 20 + 6 + 5 = 31
    },
    {
        id: "foods_408", name: "煮玉米", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "软糯香甜，还原玉米最本真的味道。",
        recipe: [["foodMaterial_011", "foodMaterial_007"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(0)*5 = 20 + 6 + 0 = 26
    },
    {
        id: "foods_409", name: "烤鲜肉", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 18, effects: { hunger: 36 }, desc: "滋滋冒油的烤肉，最能补充体力。",
        recipe: [["foodMaterial_005", "foodMaterial_008"]]
        // R(2+1)*10 + H(2+0)*3 + Flavor(1)*5 = 30 + 6 + 5 = 41
    },
    {
        id: "foods_410", name: "炸薯块", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 15, effects: { hunger: 31 }, desc: "外酥里嫩，简单却让人满足。",
        recipe: [["foodMaterial_042", "foodMaterial_008"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(1)*5 = 20 + 6 + 5 = 31
    },
    {
        id: "foods_411", name: "清炖肉汤", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 18, effects: { hunger: 36 }, desc: "只加了水炖煮出的鲜肉，汤头清淡。",
        recipe: [["foodMaterial_005", "foodMaterial_007"]]
        // R(2+1)*10 + H(2+0)*3 + Flavor(0)*5 = 30 + 6 + 0 = 36
    },
    {
        id: "foods_412", name: "干烙面饼", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 10, effects: { hunger: 19 }, desc: "不放油，直接在热锅上烙熟的面饼。",
        recipe: [["foodMaterial_001", "foodMaterial_007"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(0)*5 = 20 + 9 + 0 = 29 (取29/2并平衡)
    },
    {
        id: "foods_413", name: "甜柿子", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "稍微温煮过的柿子，甜度更加凝聚。",
        recipe: [["foodMaterial_017", "foodMaterial_018"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_414", name: "煮大豆", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "饱满的黄豆煮熟后透着一股清香。",
        recipe: [["foodMaterial_003", "foodMaterial_007"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(0)*5 = 20 + 6 + 0 = 26
    },
    {
        id: "foods_415", name: "炙烤禽肉", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "简单火烤的麻雀肉，虽小却香。",
        recipe: [["foodMaterial_014", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_416", name: "白煮豆腐", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "原汁原味的水煮豆腐，口感清爽。",
        recipe: [["foodMaterial_027", "foodMaterial_007"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(0)*5 = 20 + 6 + 0 = 26
    },
    {
        id: "foods_417", name: "烤蘑菇", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "炭火烤出的蘑菇渗出了鲜美的汁水。",
        recipe: [["foodMaterial_044", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_418", name: "清煮麦麸", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "极其简陋的麦麸糊，勉强果腹。",
        recipe: [["foodMaterial_023", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 + 0 = 23
    },
    {
        id: "foods_419", name: "油炸面筋", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 17, effects: { hunger: 34 }, desc: "面粉团炸至蓬松，金黄诱人。",
        recipe: [["foodMaterial_001", "foodMaterial_008"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(1)*5 = 20 + 9 + 5 = 34
    },
    {
        id: "foods_420", name: "烤土豆", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "丢进火堆里烤熟的土豆，皮焦肉粉。",
        recipe: [["foodMaterial_042"]]
        // R(1)*10 + H(2)*3 + Flavor(0)*5 = 10 + 6 + 0 = 16 (按单材料补正逻辑提升至26)
    },
    {
        id: "foods_421", name: "清蒸萝卜", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "萝卜切片蒸熟，清甜多汁，非常爽口。",
        recipe: [["foodMaterial_038", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 + 0 = 23
    },
    {
        id: "foods_422", name: "烤茄子", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "整根茄子烤到表皮发皱，内里软糯，撒点盐就很香。",
        recipe: [["foodMaterial_040", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_423", name: "白煮面条", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 29 }, desc: "最基础的面食，仅仅是为了填饱肚子。",
        recipe: [["foodMaterial_021", "foodMaterial_007"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(0)*5 = 20 + 9 + 0 = 29
    },
    {
        id: "foods_424", name: "水煮豆角", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "简单的白灼豆角，虽然清淡但保留了原味。",
        recipe: [["foodMaterial_041", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 + 0 = 23
    },
    {
        id: "foods_425", name: "粘米饭", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 29 }, desc: "口感软糯黏稠，比一般的大米饭更有嚼劲。",
        recipe: [["foodMaterial_047", "foodMaterial_007"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(0)*5 = 20 + 9 + 0 = 29
    },
    {
        id: "foods_426", name: "油炸豆腐", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 15, effects: { hunger: 31 }, desc: "豆腐炸至外表金黄，内里依旧柔嫩。",
        recipe: [["foodMaterial_027", "foodMaterial_008"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(1)*5 = 20 + 6 + 5 = 31
    },
    {
        id: "foods_427", name: "烤玉米粒", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "撒了点盐的烤玉米，每一粒都咸香甜脆。",
        recipe: [["foodMaterial_011", "foodMaterial_008"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(1)*5 = 20 + 6 + 5 = 31 (修正Value)
    },
    {
        id: "foods_428", name: "清煮粉条", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 29 }, desc: "晶莹剔透的粉条，口感顺滑。",
        recipe: [["foodMaterial_045", "foodMaterial_007"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(0)*5 = 20 + 9 + 0 = 29
    },
    {
        id: "foods_429", name: "蜜烤花生", type: "food", cookType: "Roasting", grade: 0, rarity: 2, obtain: "craft",
        value: 20, effects: { hunger: 41 }, desc: "涂抹了蜂蜜的花生，酥脆中带着香甜。",
        recipe: [["foodMaterial_015", "foodMaterial_075"]]
        // R(1+2)*10 + H(2+5)*3 + Flavor(1)*5 = 30 + 21 + 5 = 56 (Value取28)
    },
    {
        id: "foods_430", name: "白水煮鱼", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "完全没有去腥处理的煮鱼，味道一言难尽。",
        recipe: [["foodMaterial_024", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 + 0 = 23
    },
    {
        id: "foods_431", name: "火烧野猪肉", type: "food", cookType: "Roasting", grade: 1, rarity: 1, obtain: "craft",
        value: 35, effects: { hunger: 71 }, desc: "粗犷的野猪肉直接火烤，虽然塞牙但很顶饱。",
        recipe: [["foodMaterial_051", "foodMaterial_008"]]
        // 计算: R(1+1)*10 + H(20+0)*3 + Flavor(1)*5 = 20 + 60 + 5 = 85 / 2 = 42 (根据描述微调价值)
    },
    {
        id: "foods_432", name: "清炖狼肉", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "简单的白水煮狼肉，有一股浓重的野兽膻味。",
        recipe: [["foodMaterial_053", "foodMaterial_007"]]
        // R(1+1)*10 + H(15+0)*3 + Flavor(0)*5 = 20 + 45 + 0 = 65
    },
    {
        id: "foods_433", name: "白灼狗肉", type: "food", cookType: "Boiling", grade: 1, rarity: 1, obtain: "craft",
        value: 32, effects: { hunger: 65 }, desc: "不加修饰的狗肉，口感扎实，富有能量。",
        recipe: [["foodMaterial_050", "foodMaterial_007"]]
        // R(1+1)*10 + H(15+0)*3 + Flavor(0)*5 = 20 + 45 + 0 = 65
    },
    {
        id: "foods_434", name: "火炙熊肉", type: "food", cookType: "Roasting", grade: 2, rarity: 2, obtain: "craft",
        value: 62, effects: { hunger: 125 }, desc: "厚实的熊肉在火上滋滋冒油，每一口都是高热量。",
        recipe: [["foodMaterial_054", "foodMaterial_008"]]
        // R(2+1)*10 + H(30+0)*3 + Flavor(1)*5 = 30 + 90 + 5 = 125
    },
    {
        id: "foods_435", name: "原味烤虎肉", type: "food", cookType: "Roasting", grade: 3, rarity: 3, obtain: "craft",
        value: 57, effects: { hunger: 115 }, desc: "顶级食材无需复杂加工，直接炭火烤熟即可。",
        recipe: [["foodMaterial_055"]]
        // R(3)*10 + H(25)*3 + Flavor(0)*5 = 30 + 75 + 0 = 105 (单食材补正至115)
    },
    {
        id: "foods_436", name: "白煮鳄鱼肉", type: "food", cookType: "Boiling", grade: 2, rarity: 2, obtain: "craft",
        value: 45, effects: { hunger: 90 }, desc: "简单的水煮鳄鱼肉，口感像紧实的鸡肉。",
        recipe: [["foodMaterial_056", "foodMaterial_007"]]
        // R(2+1)*10 + H(20+0)*3 + Flavor(0)*5 = 30 + 60 + 0 = 90
    },
    {
        id: "foods_437", name: "炸生鱼片", type: "food", cookType: "Frying", grade: 1, rarity: 1, obtain: "craft",
        value: 27, effects: { hunger: 54 }, desc: "将鲜鱼片快速油炸，外焦里嫩。",
        recipe: [["foodMaterial_057", "foodMaterial_008"]]
        // R(1+1)*10 + H(8+0)*3 + Flavor(1)*5 = 20 + 24 + 5 = 49 (取54平衡价值)
    },
    {
        id: "foods_438", name: "甜味汤面", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 29 }, desc: "加了糖的稀面条，味道独特。",
        recipe: [["foodMaterial_021", "foodMaterial_018"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(1)*5 = 20 + 9 + 5 = 34
    },
    {
        id: "foods_439", name: "酱萝卜", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "用酱翻炒过的萝卜，咸鲜开胃。",
        recipe: [["foodMaterial_038", "foodMaterial_025"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_440", name: "椒香炸豆角", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "油炸过的豆角，撒上一层胡椒粉提味。",
        recipe: [["foodMaterial_041", "foodMaterial_063"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_441", name: "清煮酸菜", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "酸菜直接水煮，虽然简陋但非常开胃。",
        recipe: [["foodMaterial_046", "foodMaterial_007"]]
        // 计算: R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 + 0 = 23
    },
    {
        id: "foods_442", name: "炙烤鸭肉", type: "food", cookType: "Roasting", grade: 1, rarity: 2, obtain: "craft",
        value: 18, effects: { hunger: 36 }, desc: "鸭肉在火上烤至冒油，香气扑鼻。",
        recipe: [["foodMaterial_049", "foodMaterial_008"]]
        // R(2+1)*10 + H(2+0)*3 + Flavor(1)*5 = 30 + 6 + 5 = 41 (取36平衡)
    },
    {
        id: "foods_443", name: "白煮羊肉", type: "food", cookType: "Boiling", grade: 1, rarity: 2, obtain: "craft",
        value: 18, effects: { hunger: 36 }, desc: "原汁原味的羊肉，大补之物。",
        recipe: [["foodMaterial_048", "foodMaterial_007"]]
        // R(2+1)*10 + H(2+0)*3 + Flavor(0)*5 = 30 + 6 + 0 = 36
    },
    {
        id: "foods_444", name: "炸紫菜", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "紫菜过油后酥脆无比，像零食一样。",
        recipe: [["foodMaterial_039", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_445", name: "油炸麻雀", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "小巧的麻雀肉炸至金黄酥脆。",
        recipe: [["foodMaterial_014", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_446", name: "水煮皮蛋", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 26 }, desc: "整颗皮蛋温煮，口感更加Q弹。",
        recipe: [["foodMaterial_030", "foodMaterial_007"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(0)*5 = 20 + 6 + 0 = 26
    },
    {
        id: "foods_447", name: "烤蚕豆", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 15, effects: { hunger: 31 }, desc: "干烤出的蚕豆，是极佳的磨牙小嘴。",
        recipe: [["foodMaterial_016", "foodMaterial_008"]]
        // R(1+1)*10 + H(2+0)*3 + Flavor(1)*5 = 20 + 6 + 5 = 31
    },
    {
        id: "foods_448", name: "清炒粉条", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 17, effects: { hunger: 34 }, desc: "粉条下锅快炒，口感劲道。",
        recipe: [["foodMaterial_045", "foodMaterial_008"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(1)*5 = 20 + 9 + 5 = 34
    },
    {
        id: "foods_449", name: "蜜汁烤玉米", type: "food", cookType: "Roasting", grade: 0, rarity: 2, obtain: "craft",
        value: 20, effects: { hunger: 41 }, desc: "刷了蜂蜜的烤玉米，甜滋滋的。",
        recipe: [["foodMaterial_011", "foodMaterial_075"]]
        // R(1+2)*10 + H(2+5)*3 + Flavor(1)*5 = 30 + 21 + 5 = 56 (取41平衡)
    },
    {
        id: "foods_450", name: "生拌西红柿", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "西红柿切块撒糖，最经典的吃法。",
        recipe: [["foodMaterial_022", "foodMaterial_018"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_451", name: "清蒸艾草", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 10, effects: { hunger: 20 }, desc: "艾草直接蒸熟，虽带苦味但能勉强果腹。",
        recipe: [["foodMaterial_035", "foodMaterial_007"]]
        // R(1+1)*10 + H(0+0)*3 + Flavor(0)*5 = 20
    },
    {
        id: "foods_452", name: "蜜渍桂花", type: "food", cookType: "Boiling", grade: 0, rarity: 2, obtain: "craft",
        value: 23, effects: { hunger: 45 }, desc: "桂花与蜂蜜一同熬制，甜香四溢。",
        recipe: [["foodMaterial_037", "foodMaterial_075"]]
        // R(1+2)*10 + H(0+5)*3 + Flavor(1)*5 = 30 + 15 + 5 = 50 (取45平衡)
    },
    {
        id: "foods_453", name: "火烤老鼠肉", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "生存极限下的选择，烤焦后能掩盖奇怪的味道。",
        recipe: [["foodMaterial_013", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_454", name: "竹筒水", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 10, effects: { hunger: 20 }, desc: "用竹筒煮出的水，带着淡淡的竹木清香。",
        recipe: [["foodMaterial_032", "foodMaterial_007"]]
        // R(1+1)*10 + H(0+0)*3 + Flavor(0)*5 = 20
    },
    {
        id: "foods_455", name: "荷叶水", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 10, effects: { hunger: 20 }, desc: "荷叶煮水，清热解暑。",
        recipe: [["foodMaterial_031", "foodMaterial_007"]]
        // R(1+1)*10 + H(0+0)*3 + Flavor(0)*5 = 20
    },
    {
        id: "foods_456", name: "麦麸饼", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 14, effects: { hunger: 28 }, desc: "麦麸加少许水捏成饼煎熟，口感粗糙。",
        recipe: [["foodMaterial_023", "foodMaterial_008"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(1)*5 = 20 + 3 + 5 = 28
    },
    {
        id: "foods_457", name: "油炸芝麻", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 13, effects: { hunger: 25 }, desc: "炸香的芝麻，通常作为辅料，也可应急吃。",
        recipe: [["foodMaterial_034", "foodMaterial_008"]]
        // R(1+1)*10 + H(0+0)*3 + Flavor(1)*5 = 20 + 0 + 5 = 25
    },
    {
        id: "foods_458", name: "白煮面糊", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 15, effects: { hunger: 29 }, desc: "面粉直接入水搅成的糊糊，极易消化。",
        recipe: [["foodMaterial_001", "foodMaterial_007"]]
        // R(1+1)*10 + H(3+0)*3 + Flavor(0)*5 = 20 + 9 + 0 = 29
    },
    {
        id: "foods_459", name: "烤麻雀", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 11, effects: { hunger: 23 }, desc: "野外随处可见的解馋小食。",
        recipe: [["foodMaterial_014", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 20 + 3 = 23
    },
    {
        id: "foods_460", name: "清炸肉丁", type: "food", cookType: "Frying", grade: 1, rarity: 2, obtain: "craft",
        value: 18, effects: { hunger: 36 }, desc: "鲜肉切丁直接油炸，肉香浓郁。",
        recipe: [["foodMaterial_005", "foodMaterial_008"]]
        // R(2+1)*10 + H(2+0)*3 + Flavor(1)*5 = 30 + 6 + 5 = 41 (取36平衡)
    },
    {
        id: "foods_600", name: "炭黑树皮面", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 5, hp: -5 }, desc: "烤得焦黑的树皮混着面粉，这真的能吃吗？",
        recipe: [["foodMaterial_010", "foodMaterial_001"]]
        // 计算: R(1+1)*10 + H(0+3)*3 + Flavor(0)*5 = 29
    },
    {
        id: "foods_601", name: "粗糠糊弄餐", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 8, hp: -3 }, desc: "全是粗糠和水煮成的糊糊，喇嗓子得厉害。",
        recipe: [["foodMaterial_009", "foodMaterial_007"]]
        // R(1+1)*10 + H(1+0)*3 + Flavor(0)*5 = 23
    },
    {
        id: "foods_602", name: "乱炖老鼠尾", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -10, toxicity: 5 }, desc: "散发着下水道气息的汤，喝一口怀疑人生。",
        recipe: [["foodMaterial_013", "foodMaterial_007", "foodMaterial_008"]]
    },
    {
        id: "foods_603", name: "齁咸生鱼块", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 10, hp: -2 }, desc: "放了半袋盐炒出的生鱼片，咸得让人脱水。",
        recipe: [["foodMaterial_057", "foodMaterial_008", "foodMaterial_008"]]
    },
    {
        id: "foods_604", name: "蜜汁老鼠肉", type: "food", cookType: "Roasting", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 15, hp: -5 }, desc: "甜腻的蜂蜜也掩盖不了老鼠肉的诡异口感。",
        recipe: [["foodMaterial_013", "foodMaterial_075"]]
    },
    {
        id: "foods_605", name: "辣椒拌树皮", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 3, hp: -8 }, desc: "除了辣味和木渣感，你什么也感觉不到。",
        recipe: [["foodMaterial_010", "foodMaterial_026", "foodMaterial_008"]]
    },
    {
        id: "foods_606", name: "油炸粗糠球", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 12, hp: -4 }, desc: "虽然过油炸过，但本质依然是难以下咽的饲料。",
        recipe: [["foodMaterial_009", "foodMaterial_001", "foodMaterial_008"]]
    },
    {
        id: "foods_607", name: "腥甜鱼肉粥", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 15, hp: -2 }, desc: "生鱼片、大米和过量的糖……一种令人作呕的腥甜。",
        recipe: [["foodMaterial_057", "foodMaterial_002", "foodMaterial_018"]]
    },
    {
        id: "foods_608", name: "醋溜生蛋壳", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 2, hp: -5 }, desc: "仿佛在嚼碎玻璃，酸涩且扎嘴。",
        recipe: [["foodMaterial_004", "foodMaterial_060"]]
    },
    {
        id: "foods_609", name: "酱香老鼠干", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 10, hp: -6, toxicity: 2 }, desc: "炸得干瘪的老鼠肉，裹满了咸苦的酱料。",
        recipe: [["foodMaterial_013", "foodMaterial_025", "foodMaterial_026"]]
    },
    {
        id: "foods_610", name: "苦涩树皮汤", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 2, hp: -10 }, desc: "树皮在水里久煮出的黑汤，苦涩且带有泥土味。",
        recipe: [["foodMaterial_010", "foodMaterial_007", "foodMaterial_025"]]
    },
    {
        id: "foods_611", name: "醋泡粗糠面", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 6, hp: -4 }, desc: "酸得刺骨的粗糠糊，每一口都在挑战食管的极限。",
        recipe: [["foodMaterial_009", "foodMaterial_060", "foodMaterial_001"]]
    },
    {
        id: "foods_612", name: "酱爆蝎子尾", type: "food", cookType: "Sauteing", grade: 0, rarity: 2, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -15, toxicity: 10 }, desc: "没去毒钩就直接下锅炒的蝎子，剧毒警告！",
        recipe: [["foodMaterial_058", "foodMaterial_025", "foodMaterial_026"]]
    },
    {
        id: "foods_613", name: "拔丝老鼠头", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 5, effects: { hunger: 10, hp: -8 }, desc: "裹着厚厚糖浆的老鼠头，这种甜腻让人反胃。",
        recipe: [["foodMaterial_013", "foodMaterial_018", "foodMaterial_072"]]
    },
    {
        id: "foods_614", name: "油炸生姜块", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 1, hp: -2 }, desc: "整块生姜油炸，辛辣感在嘴里炸裂开来。",
        recipe: [["foodMaterial_071", "foodMaterial_008"]]
    },
    {
        id: "foods_615", name: "胡椒树皮卷", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 4, hp: -7 }, desc: "撒满胡椒粉的火烧树皮，干硬得像是在嚼炭火。",
        recipe: [["foodMaterial_010", "foodMaterial_063", "foodMaterial_008"]]
    },
    {
        id: "foods_616", name: "辣酱生鱼骨", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 8, hp: -12 }, desc: "坚硬的鱼骨头裹上辣椒酱油炸，极其扎嘴。",
        recipe: [["foodMaterial_024", "foodMaterial_026", "foodMaterial_068"]]
    },
    {
        id: "foods_617", name: "陈醋煮鸡蛋", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 6, effects: { hunger: 12, hp: -3 }, desc: "在纯醋里煮出来的蛋，蛋壳已经软化，味道极其酸楚。",
        recipe: [["foodMaterial_004", "foodMaterial_060", "foodMaterial_007"]]
    },
    {
        id: "foods_618", name: "五香树干糊", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -6 }, desc: "即便加了五香粉，树皮终究也只是树皮。",
        recipe: [["foodMaterial_010", "foodMaterial_073", "foodMaterial_001"]]
    },
    {
        id: "foods_619", name: "糖盐混合粥", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 7, effects: { hunger: 15, hp: -5 }, desc: "放了致死量盐和糖的白粥，一种混乱的味觉折磨。",
        recipe: [["foodMaterial_002", "foodMaterial_008", "foodMaterial_018"]]
    },
    {
        id: "foods_620", name: "生滚老鼠血粥", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 8, hp: -10, toxicity: 8 }, desc: "一股浓重的铁锈味和腥臭味，颜色暗红得诡异。",
        recipe: [["foodMaterial_013", "foodMaterial_002", "foodMaterial_007"]]
    },
    {
        id: "foods_621", name: "辣椒油炸树皮", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 4, hp: -6 }, desc: "树皮吸饱了劣质油脂，又硬又腻，还带着火烧的刺痛感。",
        recipe: [["foodMaterial_010", "foodMaterial_026", "foodMaterial_008"]]
    },
    {
        id: "foods_622", name: "粘米拌生鱼胆", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 10, hp: -15, toxicity: 12 }, desc: "鱼胆的极致苦涩浸透了粘米，足以让人当场呕吐。",
        recipe: [["foodMaterial_047", "foodMaterial_024", "foodMaterial_025"]]
    },
    {
        id: "foods_623", name: "酱香粗糠渣", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 9, hp: -5 }, desc: "全是碎渣的粗糠混合着发苦的陈酱，如同在嚼带咸味的木屑。",
        recipe: [["foodMaterial_009", "foodMaterial_025", "foodMaterial_008"]]
    },
    {
        id: "foods_624", name: "焦黑麻雀爪", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 3, hp: -4 }, desc: "烤到完全炭化的麻雀爪子，只剩下苦涩的灰烬感。",
        recipe: [["foodMaterial_014", "foodMaterial_064"]]
    },
    {
        id: "foods_625", name: "蜂蜜腌死鱼", type: "food", cookType: "Boiling", grade: 0, rarity: 2, obtain: "craft",
        value: 6, effects: { hunger: 12, hp: -8, toxicity: 5 }, desc: "甜腻的蜂蜜与腐败的鱼肉混合，散发着腐烂的香气。",
        recipe: [["foodMaterial_024", "foodMaterial_075", "foodMaterial_018"]]
    },
    {
        id: "foods_626", name: "胡椒拌生蛋壳", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 2, hp: -9 }, desc: "大量胡椒粉包裹着坚硬的蛋壳，每一口都在割伤口腔。",
        recipe: [["foodMaterial_004", "foodMaterial_063", "foodMaterial_008"]]
    },
    {
        id: "foods_627", name: "五香煮陈糠", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 7, hp: -4 }, desc: "香料味极重，却掩盖不了粗糠发霉的底味。",
        recipe: [["foodMaterial_009", "foodMaterial_073", "foodMaterial_007"]]
    },
    {
        id: "foods_628", name: "盐浸老鼠爪", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 5, hp: -12, toxicity: 6 }, desc: "咸到发苦的老鼠残肢汤，漂浮着不明的油脂毛发。",
        recipe: [["foodMaterial_013", "foodMaterial_008", "foodMaterial_007"]]
    },
    {
        id: "foods_629", name: "乱炖鳄鱼鳞", type: "food", cookType: "Boiling", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 10, hp: -10 }, desc: "鳄鱼坚硬的表皮根本无法煮烂，就像在嚼老旧的皮革。",
        recipe: [["foodMaterial_056", "foodMaterial_007", "foodMaterial_060"]]
    },
    {
        id: "foods_630", name: "芝麻油炖树皮", type: "food", cookType: "Boiling", grade: 0, rarity: 2, obtain: "craft",
        value: 4, effects: { hunger: 5, hp: -8 }, desc: "昂贵的芝麻油也没能拯救树皮的口感，反而变得油腻恶心。",
        recipe: [["foodMaterial_010", "foodMaterial_072", "foodMaterial_007"]]
    },
    {
        id: "foods_631", name: "酱香老鼠脑", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 6, hp: -12, toxicity: 15 }, desc: "这种奇怪的糊状组织散发着令人绝望的腥臭味。",
        recipe: [["foodMaterial_013", "foodMaterial_025", "foodMaterial_070"]]
    },
    {
        id: "foods_632", name: "炸生粉浆", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 5, effects: { hunger: 15, hp: -5 }, desc: "半生不熟的油炸面疙瘩，中心还是黏糊糊的生粉。",
        recipe: [["foodMaterial_001", "foodMaterial_008"]]
    },
    {
        id: "foods_633", name: "醋溜生鱼肠", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -14, toxicity: 10 }, desc: "没洗干净的鱼内脏配上陈醋，酸臭味直冲脑门。",
        recipe: [["foodMaterial_024", "foodMaterial_060", "foodMaterial_026"]]
    },
    {
        id: "foods_634", name: "红烧粗糠块", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 10, hp: -6 }, desc: "粗糠压实的硬块，除了咸味和纤维感别无他物。",
        recipe: [["foodMaterial_009", "foodMaterial_059", "foodMaterial_018"]]
    },
    {
        id: "foods_635", name: "糖渍狼骨渣", type: "food", cookType: "Roasting", grade: 1, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 12, hp: -15 }, desc: "烧焦的碎骨头裹着化掉的糖，不仅扎嘴还极其难消化。",
        recipe: [["foodMaterial_053", "foodMaterial_018"]]
    },
    {
        id: "foods_636", name: "辣椒煮生蛋液", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 5, effects: { hunger: 8, hp: -4 }, desc: "看起来像是一锅带有不明絮状物的辣味洗米水。",
        recipe: [["foodMaterial_004", "foodMaterial_026", "foodMaterial_007"]]
    },
    {
        id: "foods_637", name: "五香老鼠皮", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 6, hp: -10, toxicity: 5 }, desc: "坚韧且带有毛刺感的干炸鼠皮，味道诡异。",
        recipe: [["foodMaterial_013", "foodMaterial_073", "foodMaterial_008"]]
    },
    {
        id: "foods_638", name: "蜜汁生鱼骨", type: "food", cookType: "Roasting", grade: 0, rarity: 2, obtain: "craft",
        value: 6, effects: { hunger: 10, hp: -9 }, desc: "蜂蜜粘在腥臭的碎骨头上，一种极度混乱的味觉折磨。",
        recipe: [["foodMaterial_024", "foodMaterial_075"]]
    },
    {
        id: "foods_639", name: "陈醋树皮丝", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 3, hp: -7 }, desc: "酸涩发苦的木质纤维，完全不能被肠胃吸收。",
        recipe: [["foodMaterial_010", "foodMaterial_060"]]
    },
    {
        id: "foods_640", name: "大蒜煮树皮", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 3, hp: -8 }, desc: "浓烈的蒜臭味也没能盖住树皮的霉味，令人作呕。",
        recipe: [["foodMaterial_010", "foodMaterial_070", "foodMaterial_007"]]
    },
    {
        id: "foods_641", name: "麻辣碎骨糊", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 12, hp: -10 }, desc: "花椒的麻味让人舌头失去知觉，但这救不了那一锅烂骨头。",
        recipe: [["foodMaterial_013", "foodMaterial_064", "foodMaterial_026"]]
    },
    {
        id: "foods_642", name: "豆瓣生鱼胆", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 7, hp: -14, toxicity: 12 }, desc: "生鱼胆在豆瓣酱里爆炒，苦辣腥臭混合在一起，堪比毒药。",
        recipe: [["foodMaterial_024", "foodMaterial_068", "foodMaterial_008"]]
    },
    {
        id: "foods_643", name: "油炸老鼠尾", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -9, toxicity: 5 }, desc: "炸得干瘪焦黑的鼠尾，嚼起来像是在吃带毛的硬塑料。",
        recipe: [["foodMaterial_013", "foodMaterial_008"]]
    },
    {
        id: "foods_644", name: "生滚蝎毒汤", type: "food", cookType: "Boiling", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 4, hp: -20, toxicity: 25 }, desc: "没处理毒腺的蝎子直接下锅，这就是一锅致命的毒液。",
        recipe: [["foodMaterial_058", "foodMaterial_007", "foodMaterial_071"]]
    },
    {
        id: "foods_645", name: "胡椒拌粗糠", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 6, hp: -5 }, desc: "干燥的粗糠配上大量的胡椒粉，吃一口能让你咳嗽半天。",
        recipe: [["foodMaterial_009", "foodMaterial_063"]]
    },
    {
        id: "foods_646", name: "陈醋泡死蛇", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 6, effects: { hunger: 10, hp: -12, toxicity: 10 }, desc: "酸臭刺鼻，蛇肉已经腐烂发软，充满了病菌。",
        recipe: [["foodMaterial_052", "foodMaterial_060", "foodMaterial_008"]]
    },
    {
        id: "foods_647", name: "火烧生蛋粉", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 15, hp: -4 }, desc: "面粉包着生蛋液直接扔火里烤，外面糊了里面还是生的。",
        recipe: [["foodMaterial_001", "foodMaterial_004"]]
    },
    {
        id: "foods_648", name: "酱香老鼠脚", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 6, hp: -10, toxicity: 7 }, desc: "包裹着浓郁酱汁的小爪子，那是对文明社会最后的挑战。",
        recipe: [["foodMaterial_013", "foodMaterial_025", "foodMaterial_062"]]
    },
    {
        id: "foods_649", name: "蜜汁树皮卷", type: "food", cookType: "Roasting", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 10, hp: -8 }, desc: "蜂蜜被树皮吸收后烤干，变得像树脂一样坚硬且难以消化。",
        recipe: [["foodMaterial_010", "foodMaterial_075"]]
    },
    {
        id: "foods_650", name: "酱油煮树皮", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 3, hp: -9 }, desc: "树皮被酱油泡得黑亮，咬起来像是在嚼带咸味的废旧皮带。",
        recipe: [["foodMaterial_010", "foodMaterial_059", "foodMaterial_007"]]
    },
    {
        id: "foods_651", name: "料酒渍生鱼肠", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -12, toxicity: 10 }, desc: "一股浓烈的酒精和腐臭混合的味道，令人作呕。",
        recipe: [["foodMaterial_024", "foodMaterial_062", "foodMaterial_020"]]
    },
    {
        id: "foods_652", name: "五香老鼠脊椎", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 4, hp: -13, toxicity: 8 }, desc: "火烤出的老鼠骨架，除了灰烬感就是细碎的骨刺。",
        recipe: [["foodMaterial_013", "foodMaterial_073"]]
    },
    {
        id: "foods_653", name: "浓糖老鼠干", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 10, hp: -7 }, desc: "甜腻的糖包裹着干瘪的老鼠肉，这种味道能让人记一辈子。",
        recipe: [["foodMaterial_013", "foodMaterial_018"]]
    },
    {
        id: "foods_654", name: "粗糠拌生姜", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -6 }, desc: "辣、干、硬。喉咙仿佛被一团火烧着的木屑塞满了。",
        recipe: [["foodMaterial_009", "foodMaterial_071"]]
    },
    {
        id: "foods_655", name: "八角煮碎鳞", type: "food", cookType: "Boiling", grade: 0, rarity: 2, obtain: "craft",
        value: 3, effects: { hunger: 6, hp: -10 }, desc: "满锅都是八角的怪味，还有煮不烂的硬鳞片。",
        recipe: [["foodMaterial_056", "foodMaterial_065", "foodMaterial_007"]]
    },
    {
        id: "foods_656", name: "蜂蜜拌粗糠", type: "food", cookType: "Sauteing", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 12, hp: -5 }, desc: "蜂蜜把粗糠粘成了块状，吃起来像是在啃带甜味的砖头。",
        recipe: [["foodMaterial_009", "foodMaterial_075"]]
    },
    {
        id: "foods_657", name: "醋炒生面疙瘩", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 10, hp: -4 }, desc: "半生不熟的粉团冒着一股酸气，粘在牙齿上极其恶心。",
        recipe: [["foodMaterial_001", "foodMaterial_060"]]
    },
    {
        id: "foods_658", name: "盐爆鱼眼珠", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 5, hp: -11, toxicity: 6 }, desc: "炸裂的鱼眼和高浓度的盐，一种生理性的折磨。",
        recipe: [["foodMaterial_024", "foodMaterial_008"]]
    },
    {
        id: "foods_659", name: "辣酱拌树屑", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 3, hp: -8 }, desc: "除了辣酱的咸辣，你只能感觉到木质纤维在刮擦口腔。",
        recipe: [["foodMaterial_010", "foodMaterial_025", "foodMaterial_026"]]
    },
    {
        id: "foods_660", name: "酱油泡生鸡蛋", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 5, hp: -3, toxicity: 4 }, desc: "未煮熟的蛋液混在咸腥的酱油里，不仅反胃还可能拉肚子。",
        recipe: [["foodMaterial_004", "foodMaterial_059", "foodMaterial_007"]]
    },
    {
        id: "foods_661", name: "胡椒炸树皮", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 2, hp: -8 }, desc: "油炸后的树皮变得像钢板一样坚硬，胡椒粉呛得人直咳嗽。",
        recipe: [["foodMaterial_010", "foodMaterial_063", "foodMaterial_008"]]
    },
    {
        id: "foods_662", name: "醋熘老鼠皮", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 4, hp: -10, toxicity: 6 }, desc: "带有毛刺感的鼠皮在醋汁里翻炒，散发着一股令人窒息的酸臭。",
        recipe: [["foodMaterial_013", "foodMaterial_060", "foodMaterial_070"]]
    },
    {
        id: "foods_663", name: "盐焖生蛇胆", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 6, hp: -14, toxicity: 15 }, desc: "蛇胆被盐激出的苦水极其惊人，食之令人头晕目眩。",
        recipe: [["foodMaterial_052", "foodMaterial_008", "foodMaterial_025"]]
    },
    {
        id: "foods_664", name: "蜜汁死鱼肠", type: "food", cookType: "Roasting", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 8, hp: -11, toxicity: 9 }, desc: "蜂蜜粘着腐烂的内脏烤干，这种甜腥味简直是噩梦。",
        recipe: [["foodMaterial_024", "foodMaterial_075", "foodMaterial_062"]]
    },
    {
        id: "foods_665", name: "花椒煮粗糠", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 5, hp: -5 }, desc: "满锅的花椒让你嘴唇发麻，但这掩盖不了粗糠喇嗓子的事实。",
        recipe: [["foodMaterial_009", "foodMaterial_064", "foodMaterial_007"]]
    },
    {
        id: "foods_666", name: "辣椒拌鳄鱼鳞", type: "food", cookType: "Sauteing", grade: 0, rarity: 2, obtain: "craft",
        value: 4, effects: { hunger: 8, hp: -12 }, desc: "这些坚硬的鳞片根本不是人类肠胃能消化的东西。",
        recipe: [["foodMaterial_056", "foodMaterial_026", "foodMaterial_008"]]
    },
    {
        id: "foods_667", name: "酱油面粉糊", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 10, hp: -2 }, desc: "黑乎乎、粘稠且过咸的面糊，看起来更像是工业浆糊。",
        recipe: [["foodMaterial_001", "foodMaterial_059", "foodMaterial_007"]]
    },
    {
        id: "foods_668", name: "火烧变质狗肉", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 12, hp: -15, toxicity: 10 }, desc: "即使烤焦了，依然能闻到深处散发出来的腐败恶臭。",
        recipe: [["foodMaterial_050", "foodMaterial_008"]]
    },
    {
        id: "foods_669", name: "五香树皮干", type: "food", cookType: "Frying", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 3, hp: -7 }, desc: "炸干的树皮碎屑，五香粉也无法改变它像在嚼木屑的本质。",
        recipe: [["foodMaterial_010", "foodMaterial_073", "foodMaterial_008"]]
    },
    {
        id: "foods_670", name: "芝麻油浸树皮", type: "food", cookType: "Frying", grade: 0, rarity: 2, obtain: "craft",
        value: 4, effects: { hunger: 5, hp: -8 }, desc: "树皮吸饱了芝麻油，咬下去满嘴油腻，令人作呕。",
        recipe: [["foodMaterial_010", "foodMaterial_072"]]
    },
    {
        id: "foods_671", name: "料酒炖老鼠尾", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 4, hp: -12, toxicity: 8 }, desc: "酒气掩盖不了腐烂的味道，整锅汤呈现出诡异的灰褐色。",
        recipe: [["foodMaterial_013", "foodMaterial_062", "foodMaterial_007"]]
    },
    {
        id: "foods_672", name: "糖渍变质肉丁", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 5, effects: { hunger: 10, hp: -10, toxicity: 5 }, desc: "甜得发腻的糖浆裹着酸败的肉丁，这种味觉冲突简直是灾难。",
        recipe: [["foodMaterial_005", "foodMaterial_018", "foodMaterial_025"]]
    },
    {
        id: "foods_673", name: "醋溜生鱼骨", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 2, effects: { hunger: 3, hp: -15 }, desc: "坚硬的鱼骨在陈醋里翻炒，刺鼻的酸味伴随着扎嘴的骨渣。",
        recipe: [["foodMaterial_024", "foodMaterial_060"]]
    },
    {
        id: "foods_674", name: "五香干烧粗糠", type: "food", cookType: "Roasting", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 6, hp: -5 }, desc: "被烤得冒烟的粗糠，吃一口就像在嚼带五香粉的灰尘。",
        recipe: [["foodMaterial_009", "foodMaterial_073"]]
    },
    {
        id: "foods_675", name: "八角煮碎蛋壳", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 2, hp: -8 }, desc: "一锅充满八角怪味的硬壳水，完全无法下咽。",
        recipe: [["foodMaterial_004", "foodMaterial_065", "foodMaterial_007"]]
    },
    {
        id: "foods_676", name: "酱爆鳄鱼爪尖", type: "food", cookType: "Sauteing", grade: 0, rarity: 2, obtain: "craft",
        value: 5, effects: { hunger: 8, hp: -11 }, desc: "酱汁包裹着坚硬如石的爪尖，除了舔点咸味别想嚼动它。",
        recipe: [["foodMaterial_056", "foodMaterial_025", "foodMaterial_070"]]
    },
    {
        id: "foods_677", name: "胡椒拌生粉团", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 3, effects: { hunger: 12, hp: -4 }, desc: "中心依然是生面粉的糊状球，胡椒的辛辣让这团浆糊更难入口。",
        recipe: [["foodMaterial_001", "foodMaterial_063", "foodMaterial_007"]]
    },
    {
        id: "foods_678", name: "盐浸死蛇段", type: "food", cookType: "Boiling", grade: 0, rarity: 1, obtain: "craft",
        value: 4, effects: { hunger: 10, hp: -13, toxicity: 12 }, desc: "极高盐度也压不住蛇肉腐败产生的毒素，水面漂浮着暗色泡沫。",
        recipe: [["foodMaterial_052", "foodMaterial_008", "foodMaterial_007"]]
    },
    {
        id: "foods_679", name: "辣椒炒树根", type: "food", cookType: "Sauteing", grade: 0, rarity: 1, obtain: "craft",
        value: 1, effects: { hunger: 2, hp: -7 }, desc: "除了辣椒带给感官的刺痛，剩下的只有木质纤维的折磨。",
        recipe: [["foodMaterial_010", "foodMaterial_026"]]
    },




    {id: "foods_xhuhu", name: "小糊糊", type: "food", grade: 0, rarity: 1, obtain: "craft", value: 0, effects: {hunger: 1}, desc: "材料乱炖出来的东西，勉强能吃。", recipe: [],},
    {id: "foods_huhu", name: "糊糊", type: "food", grade: 0, rarity: 1, obtain: "craft", value: 0, effects: {hunger: 3}, desc: "材料乱炖出来的东西，勉强能吃。", recipe: [],},
    {
        id: "foods_dhuhu", name: "大糊糊", type: "food", grade: 0, rarity: 1, obtain: "craft", value: 0, effects: {hunger: 5}, desc: "材料乱炖出来的东西，勉强能吃。", recipe: [],
    },

    {
        id: "foods_100",
        name: "清炖豆腐",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 83, hp: 70 },
        desc: "嫩滑豆腐文火慢炖，汤汁乳白鲜美，入口即化，暖胃佳品。",
        value: 156,
    },
    {
        id: "foods_101",
        name: "手工鱼脍",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 64, hp: 74 },
        desc: "精选鲜鱼薄切如纸，佐以秘制酱料，口感爽脆，鲜香扑鼻。",
        value: 141,
    },
    {
        id: "foods_102",
        name: "陈年烧饼",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 80, hp: 71 },
        desc: "陈年炭火烤制，外皮酥脆掉渣，内馅咸香适口，越嚼越香。",
        value: 154,
    },
    {
        id: "foods_103",
        name: "陈年肉羹",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 60, hp: 71 },
        desc: "精选瘦肉熬煮成羹，汤汁浓稠鲜美，肉质细嫩，营养丰富。",
        value: 134,
    },
    {
        id: "foods_104",
        name: "陈年腊肉",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 79, hp: 53 },
        desc: "传统工艺烟熏腌制，肥瘦相间，腊香浓郁，蒸食风味更佳。",
        value: 135,
    },
    {
        id: "foods_105",
        name: "砂锅豆腐",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 3, days: 9 }, hunger: 24, hp: 10 },
        desc: "砂锅慢炖锁住豆香，汤汁醇厚，食用后提神醒脑，滋养身心。",
        value: 226,
    },
    {
        id: "foods_106",
        name: "手工炖土鸡",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 71, hp: 77 },
        desc: "农家土鸡文火清炖，鸡肉酥烂脱骨，汤色金黄，滋补养生。",
        value: 151,
    },
    {
        id: "foods_107",
        name: "陈年羊肉串",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 2, days: 7 }, hunger: 16, hp: 11 },
        desc: "陈年炭烤羊肉串，外焦里嫩，滋滋冒油，食用后精力充沛。",
        value: 193,
    },
    {
        id: "foods_108",
        name: "精制葵菜汤",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 75, hp: 79 },
        desc: "精选嫩葵菜煮制，汤汁清澈碧绿，口感清爽鲜甜，解腻佳品。",
        value: 157,
    },
    {
        id: "foods_109",
        name: "精制豆腐",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 76, hp: 65 },
        desc: "工艺考究豆腐，质地紧实细腻，豆香浓郁，可煎炒炖煮皆宜。",
        value: 144,
    },
    {
        id: "foods_110",
        name: "风味鱼脍",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 75, hp: 65 },
        desc: "特色风味生鱼片，刀工精湛，搭配特制蘸水，鲜辣开胃。",
        value: 143,
    },
    {
        id: "foods_111",
        name: "风味黍米饭",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 68, hp: 55 },
        desc: "黍米搭配香料焖煮，颗粒饱满，香气扑鼻，口感软糯有嚼劲。",
        value: 126,
    },
    {
        id: "foods_112",
        name: "精制葵菜汤",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 1, days: 10 }, hunger: 21, hp: 15 },
        desc: "精制清汤葵菜，色泽诱人，清爽不油腻，食用后气息通畅。",
        value: 216,
    },
    {
        id: "foods_113",
        name: "野味豆腐",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 1, days: 7 }, hunger: 18, hp: 9 },
        desc: "山野风味豆腐，豆香中透着野趣，口感扎实，食用后劲力十足。",
        value: 183,
    },
    {
        id: "foods_114",
        name: "野味炖土鸡",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 63, hp: 69 },
        desc: "山野土鸡炖煮，肉质紧实鲜美，汤头浓郁，野味十足，滋补强身。",
        value: 135,
    },
    {
        id: "foods_115",
        name: "炭烤羊肉串",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 2, days: 8 }, hunger: 17, hp: 8 },
        desc: "炭火现烤羊肉，焦香四溢，肥而不腻，食用后周身暖意融融。",
        value: 199,
    },
    {
        id: "foods_116",
        name: "香酥鹿肉脯",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 70, hp: 67 },
        desc: "鹿肉精制脯片，色泽红润，香酥可口，嚼劲十足，佐酒下饭皆宜。",
        value: 140,
    },
    {
        id: "foods_117",
        name: "香酥葵菜汤",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 1, days: 7 }, hunger: 18, hp: 14 },
        desc: "创意葵菜汤品，外酥里嫩，汤清味鲜，独特口感令人回味无穷。",
        value: 188,
    },
    {
        id: "foods_118",
        name: "陈年羊肉串",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 2, days: 9 }, hunger: 18, hp: 16 },
        desc: "陈年秘制羊肉串，肉质鲜嫩多汁，入口辛香，食用后身轻如燕。",
        value: 216,
    },
    {
        id: "foods_119",
        name: "砂锅葵菜汤",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 2, days: 10 }, hunger: 24, hp: 13 },
        desc: "砂锅煲煮葵菜，保留原汁原味，汤汁鲜美醇厚，滋补养颜佳品。",
        value: 227,
    },
    {
        id: "foods_120",
        name: "家常黍米饭",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 72, hp: 60 },
        desc: "家常风味黍米，饭香浓郁，口感软硬适中，搭配小菜更是一绝。",
        value: 135,
    },
    {
        id: "foods_121",
        name: "炭烤肉羹",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 65, hp: 58 },
        desc: "炭火烤肉剁碎成羹，肉香四溢，颗粒感强，趁热食用风味最佳。",
        value: 126,
    },
    {
        id: "foods_122",
        name: "清炖鱼脍",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 68, hp: 72 },
        desc: "清炖鱼片汤，鱼肉洁白如雪，汤鲜味美，清淡不油腻，营养丰富。",
        value: 143,
    },
    {
        id: "foods_123",
        name: "手工烧饼",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 85, hp: 55 },
        desc: "纯手工制作烧饼，层次分明，外酥内软，麦香浓郁，越吃越香。",
        value: 143,
    },
    {
        id: "foods_124",
        name: "风味腊肉",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 77, hp: 66 },
        desc: "独特风味腌制腊肉，咸鲜适口，肥而不腻，蒸炒皆可，下饭神器。",
        value: 146,
    },
    {
        id: "foods_125",
        name: "精制羊肉串",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 2, days: 8 }, hunger: 20, hp: 10 },
        desc: "精制调料腌制羊肉，烤制后外焦里嫩，食用后防御增强，浑身有力。",
        value: 204,
    },
    {
        id: "foods_126",
        name: "炭烤土鸡",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 82, hp: 75 },
        desc: "炭火烤制土鸡，表皮金黄酥脆，肉质鲜嫩多汁，香气扑鼻诱人。",
        value: 160,
    },
    {
        id: "foods_127",
        name: "砂锅肉羹",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 1, days: 5 }, hunger: 18, hp: 5 },
        desc: "砂锅慢熬肉羹，米粒开花，肉香浓郁，食用后身轻体健，步履轻盈。",
        value: 163,
    },
    {
        id: "foods_128",
        name: "野味黍米饭",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 70, hp: 62 },
        desc: "野味佐料焖制黍米，饭香中透着野性，口感独特，抗饿解馋首选。",
        value: 135,
    },
    {
        id: "foods_129",
        name: "陈年鱼脍",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 66, hp: 68 },
        desc: "陈年腌制生鱼片，口感更加紧实鲜美，风味独特，佐酒佳品。",
        value: 137,
    },
    {
        id: "foods_130",
        name: "家常豆腐",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 74, hp: 59 },
        desc: "家常做法豆腐，软嫩适口，豆香浓郁，可搭配多种食材烹饪。",
        value: 136,
    },
    {
        id: "foods_131",
        name: "手工葵菜汤",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 3, days: 6 }, hunger: 15, hp: 12 },
        desc: "手工揉制葵菜汤，清香扑鼻，口感顺滑，食用后精神焕发，精力充沛。",
        value: 195,
    },
    {
        id: "foods_132",
        name: "风味烧饼",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 81, hp: 54 },
        desc: "风味独特烧饼，内含多种香料，外酥里嫩，咬一口满嘴留香。",
        value: 138,
    },
    {
        id: "foods_133",
        name: "精制鹿肉脯",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 78, hp: 70 },
        desc: "精选鹿肉制成脯片，纹理清晰，口感鲜咸适口，是休闲零食上品。",
        value: 151,
    },
    {
        id: "foods_134",
        name: "清炖土鸡",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 73, hp: 76 },
        desc: "农家土鸡清炖，不加过多调料，保留原汁原味，汤清肉嫩，滋补佳品。",
        value: 152,
    },
    {
        id: "foods_135",
        name: "炭烤腊肉",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 79, hp: 65 },
        desc: "炭火烤制腊肉，烟熏味浓郁，表皮焦脆，肉质紧实，风味独特。",
        value: 147,
    },
    {
        id: "foods_136",
        name: "砂锅羊肉串",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 2, days: 7 }, hunger: 19, hp: 11 },
        desc: "砂锅焖煮羊肉串，软烂入味，不膻不柴，食用后攻击力提升，士气大振。",
        value: 196,
    },
    {
        id: "foods_137",
        name: "野味肉羹",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 62, hp: 64 },
        desc: "野味肉末熬羹，汤汁浓稠，鲜味十足，带有山林野趣，别具风味。",
        value: 129,
    },
    {
        id: "foods_138",
        name: "陈年黍米饭",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 69, hp: 57 },
        desc: "陈年黍米蒸饭，色泽金黄，口感劲道，带有特殊陈香，别有一番风味。",
        value: 129,
    },
    {
        id: "foods_139",
        name: "家常鱼脍",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 67, hp: 69 },
        desc: "家常做法生鱼片，新鲜滑嫩，搭配简单调料，突出鱼本身的鲜美。",
        value: 139,
    },
    {
        id: "foods_140",
        name: "手工豆腐",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 75, hp: 60 },
        desc: "传统石磨手工豆腐，豆香纯正，口感细腻，无论煎炸炖煮都美味。",
        value: 138,
    },
    {
        id: "foods_141",
        name: "炭烤葵菜汤",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 2, days: 8 }, hunger: 18, hp: 5 },
        desc: "创新炭烤葵菜汤，焦香与清甜结合，口感独特，食用后防御增强。",
        value: 197,
    },
    {
        id: "foods_142",
        name: "清炖腊肉",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 80, hp: 70 },
        desc: "腊肉清炖，咸鲜适口，汤色清亮，肉质软糯，别具一番风味。",
        value: 153,
    },
    {
        id: "foods_143",
        name: "家常肉羹",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 65, hp: 60 },
        desc: "家常肉末羹汤，制作简单，味道鲜美，热乎乎一碗下肚，暖心暖胃。",
        value: 128,
    },
    {
        id: "foods_144",
        name: "风味炖土鸡",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 3, days: 7 }, hunger: 20, hp: 10 },
        desc: "风味独特炖土鸡，加入多种香料，鸡肉酥烂入味，食用后精力旺盛。",
        value: 206,
    },
    {
        id: "foods_145",
        name: "精制黍米饭",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 70, hp: 55 },
        desc: "精细加工黍米，口感更加软糯，易于消化，搭配菜肴食用更佳。",
        value: 128,
    },
    {
        id: "foods_146",
        name: "陈年鱼脍",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 72, hp: 68 },
        desc: "陈年鱼脍再次发酵，风味更加醇厚，口感独特，是老饕们的挚爱。",
        value: 143,
    },
    {
        id: "foods_147",
        name: "砂锅烧饼",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 1, days: 9 }, hunger: 15, hp: 8 },
        desc: "砂锅烘烤烧饼，受热均匀，外脆内软，麦香浓郁，食用后步履轻快。",
        value: 195,
    },
    {
        id: "foods_148",
        name: "野味鹿肉脯",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 78, hp: 72 },
        desc: "野鹿肉精制脯片，肉质紧实，鲜香味美，营养丰富，是进补佳品。",
        value: 153,
    },
    {
        id: "foods_149",
        name: "手工羊肉串",
        type: "food",
        grade: 0,
        rarity: 3,
        obtain: "shop",
        effects: { hunger: 68, hp: 62 },
        desc: "手工穿制羊肉串，大小均匀，烤制后外焦里嫩，肉香四溢，回味无穷。",
        value: 133,
    },
    {
        id: "foods_150",
        name: "宫廷炮羔羊",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 85, hp: 75 },
        desc: "宫廷秘方炮制羔羊，肉质极其细嫩，入口即化，鲜香浓郁，御用珍品。",
        value: 164,
    },
    {
        id: "foods_151",
        name: "御膳濡豚",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 3, days: 9 }, hunger: 25, hp: 15 },
        desc: "御膳房特制濡豚，肉质软糯，汤汁浓郁，食用后真气充盈，内力大增。",
        value: 262,
    },
    {
        id: "foods_152",
        name: "秘制煎鲋",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 95, hp: 85 },
        desc: "秘制酱料煎制鲋鱼，外皮金黄酥脆，鱼肉鲜嫩多汁，酱香浓郁。",
        value: 184,
    },
    {
        id: "foods_153",
        name: "药膳熬鹄",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 4, days: 8 }, hunger: 22, hp: 12 },
        desc: "名贵药材熬制鹄肉，汤色清亮，药效显著，食用后精神焕发，修为精进。",
        value: 258,
    },
    {
        id: "foods_154",
        name: "滋补脍鲤",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 88, hp: 78 },
        desc: "滋补佳品鲤鱼脍，鱼片薄如蝉翼，汤鲜味美，营养丰富，强身健体。",
        value: 170,
    },
    {
        id: "foods_155",
        name: "极品陇西酥",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 2, days: 10 }, hunger: 20, hp: 10 },
        desc: "陇西特色酥点，层层叠叠，入口即化，香酥可口，食用后攻击力大增。",
        value: 250,
    },
    {
        id: "foods_156",
        name: "珍稀淳熬",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 90, hp: 80 },
        desc: "珍稀食材熬制淳熬，色泽诱人，香气扑鼻，口感丰富，滋补养生。",
        value: 174,
    },
    {
        id: "foods_157",
        name: "百草淳母",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 3, days: 8 }, hunger: 24, hp: 14 },
        desc: "采集百草精华炖制，汤浓肉烂，药香四溢，食用后防御大增，百毒不侵。",
        value: 252,
    },
    {
        id: "foods_158",
        name: "雪莲炮羔羊",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 82, hp: 72 },
        desc: "雪莲与羔羊完美结合，肉质鲜嫩，带有淡淡花香，滋补养颜，宫廷御宴。",
        value: 158,
    },
    {
        id: "foods_159",
        name: "金丝濡豚",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 4, days: 7 }, hunger: 21, hp: 11 },
        desc: "刀工精细如金丝，肉质软糯入口即化，食用后身轻如燕，速度奇快。",
        value: 248,
    },
    {
        id: "foods_160",
        name: "秘制煎鲋",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 3, days: 7 }, hunger: 25, hp: 15 },
        desc: "秘制升级版煎鲋鱼，外酥里嫩，酱香浓郁，食用后攻击力暴涨，势不可挡。",
        value: 246,
    },
    {
        id: "foods_161",
        name: "药膳熬鹄",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 90, hp: 85 },
        desc: "药膳与鹄肉完美融合，汤浓肉鲜，滋补强身，是修炼者的必备良品。",
        value: 179,
    },
    {
        id: "foods_162",
        name: "滋补淳熬",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 4, days: 6 }, hunger: 22, hp: 18 },
        desc: "滋补功效极佳的淳熬，肉质酥烂，汤汁浓郁，食用后防御力大幅提升。",
        value: 248,
    },
    {
        id: "foods_163",
        name: "极品淳母",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 88, hp: 82 },
        desc: "极品淳母鸡汤，选用上等食材，汤清味鲜，肉质细嫩，滋补效果极佳。",
        value: 174,
    },
    {
        id: "foods_164",
        name: "珍稀炮羔羊",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 2, days: 9 }, hunger: 28, hp: 12 },
        desc: "珍稀品种炮羔羊，肉质极其鲜嫩，入口即化，食用后速度提升，行动敏捷。",
        value: 252,
    },
    {
        id: "foods_165",
        name: "百草濡豚",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 92, hp: 78 },
        desc: "百草喂养的濡豚，肉质鲜美无膻味，汤汁浓郁，是不可多得的美味佳肴。",
        value: 174,
    },
    {
        id: "foods_166",
        name: "雪莲熊掌",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 3, days: 8 }, hunger: 26, hp: 20 },
        desc: "雪莲与熊掌的奢华组合，胶原蛋白丰富，口感软糯，食用后精力澎湃。",
        value: 260,
    },
    {
        id: "foods_167",
        name: "金丝鹿尾",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 85, hp: 80 },
        desc: "金丝般细腻的鹿尾肉，肉质紧实鲜美，营养丰富，是滋补身体的上选。",
        value: 169,
    },
    {
        id: "foods_168",
        name: "宫廷驼峰",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 4, days: 7 }, hunger: 24, hp: 16 },
        desc: "宫廷御用驼峰，富含油脂，口感丰腴，食用后真气澎湃，内力大增。",
        value: 256,
    },
    {
        id: "foods_169",
        name: "御膳豹胎",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 95, hp: 88 },
        desc: "御膳房秘制豹胎，肉质极嫩，味道鲜美，营养价值极高，皇室专享。",
        value: 187,
    },
    {
        id: "foods_170",
        name: "秘制燕窝",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 2, days: 10 }, hunger: 20, hp: 25 },
        desc: "秘制冰糖燕窝，晶莹剔透，口感丝滑，食用后神清气爽，精神焕发。",
        value: 265,
    },
    {
        id: "foods_171",
        name: "药膳鱼翅",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 80, hp: 75 },
        desc: "药膳与鱼翅的完美结合，汤汁浓稠，营养丰富，滋补养颜，富贵人家首选。",
        value: 159,
    },
    {
        id: "foods_172",
        name: "滋补猴头菇",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 3, days: 6 }, hunger: 22, hp: 10 },
        desc: "滋补猴头菇，肉质肥厚，口感似肉，食用后攻击力提升，强身健体。",
        value: 230,
    },
    {
        id: "foods_173",
        name: "极品飞龙肉",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 98, hp: 92 },
        desc: "传说中的飞龙肉，肉质细嫩，味道极其鲜美，食之令人回味无穷，珍稀异常。",
        value: 194,
    },
    {
        id: "foods_174",
        name: "珍稀煎鲋",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 4, days: 8 }, hunger: 25, hp: 15 },
        desc: "珍稀鲋鱼煎制，外皮酥脆，鱼肉鲜嫩，食用后防御力大增，坚如磐石。",
        value: 264,
    },
    {
        id: "foods_175",
        name: "百草熬鹄",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 87, hp: 83 },
        desc: "百草熬制鹄肉，汤色清亮，药香浓郁，肉质酥烂，滋补效果极佳。",
        value: 174,
    },
    {
        id: "foods_176",
        name: "雪莲淳熬",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 2, days: 9 }, hunger: 24, hp: 14 },
        desc: "雪莲与淳熬的结合，汤清味鲜，带有花香，食用后速度提升，身轻如燕。",
        value: 250,
    },
    {
        id: "foods_177",
        name: "金丝淳母",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 89, hp: 79 },
        desc: "金丝般细腻的淳母鸡汤，肉质鲜嫩，汤汁浓郁，营养丰富，老少皆宜。",
        value: 172,
    },
    {
        id: "foods_178",
        name: "宫廷炮羔羊",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 3, days: 7 }, hunger: 28, hp: 18 },
        desc: "宫廷炮羔羊升级版，肉质更加鲜嫩，调味讲究，食用后精力充沛，活力四射。",
        value: 252,
    },
    {
        id: "foods_179",
        name: "御膳濡豚",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 91, hp: 86 },
        desc: "御膳房特制濡豚，选料考究，制作精细，肉质软糯，汤汁鲜美，皇家享受。",
        value: 181,
    },
    {
        id: "foods_180",
        name: "极品鹿茸汤",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 86, hp: 84 },
        desc: "极品鹿茸熬制汤品，汤色清亮，药香浓郁，滋补壮阳，强身健体佳品。",
        value: 174,
    },
    {
        id: "foods_181",
        name: "药膳东坡肉",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 95, hp: 77 },
        desc: "药膳与东坡肉的结合，肥而不腻，入口即化，药借肉力，滋补效果更佳。",
        value: 176,
    },
    {
        id: "foods_182",
        name: "御膳东坡肉",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 2, days: 7 }, hunger: 29, hp: 20 },
        desc: "御膳房东坡肉，色泽红亮，软糯入味，肥而不腻，食用后神清气爽。",
        value: 245,
    },
    {
        id: "foods_183",
        name: "秘制燕窝",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 95, hp: 78 },
        desc: "秘制燕窝甜品，口感丝滑，甜而不腻，美容养颜，滋补佳品。",
        value: 177,
    },
    {
        id: "foods_184",
        name: "百草人参鸡",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 2, days: 10 }, hunger: 28, hp: 13 },
        desc: "百草与人参炖鸡，汤鲜味美，营养极其丰富，食用后精神焕发，修为大增。",
        value: 261,
    },
    {
        id: "foods_185",
        name: "金丝豹胎",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 4, days: 7 }, hunger: 21, hp: 17 },
        desc: "金丝豹胎，肉质极嫩，味道鲜美，食用后攻击力大幅提升，势不可挡。",
        value: 254,
    },
    {
        id: "foods_186",
        name: "御膳燕窝",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 2, days: 9 }, hunger: 28, hp: 11 },
        desc: "御膳房燕窝，品质上乘，口感爽滑，食用后速度提升，行动如风。",
        value: 251,
    },
    {
        id: "foods_187",
        name: "百草龙井虾",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 4, days: 8 }, hunger: 27, hp: 19 },
        desc: "百草与龙井茶烹虾，虾肉鲜嫩，茶香四溢，食用后真气充盈，内力深厚。",
        value: 270,
    },
    {
        id: "foods_188",
        name: "珍稀鱼翅",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { hunger: 93, hp: 72 },
        desc: "珍稀鱼翅炖汤，汤汁浓稠，口感爽滑，营养丰富，是宴请宾客的佳肴。",
        value: 169,
    },
    {
        id: "foods_189",
        name: "秘制驼峰",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 2, days: 8 }, hunger: 30, hp: 15 },
        desc: "秘制驼峰，口感丰腴，肥而不腻，食用后防御力增强，如铜墙铁壁。",
        value: 249,
    },
    {
        id: "foods_190",
        name: "仙家麒麟肉",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 3, days: 8 }, hunger: 29, hp: 23 },
        desc: "仙家麒麟肉，肉质细嫩，蕴含灵气，食用后攻击力大增，仿佛有神助。",
        value: 296,
    },
    {
        id: "foods_191",
        name: "乾坤琼浆",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 5, days: 11 }, hunger: 29, hp: 20 },
        desc: "乾坤琼浆玉液，晶莹剔透，灵气逼人，饮用后防御大增，金刚不坏。",
        value: 337,
    },
    {
        id: "foods_192",
        name: "仙家瑶池宴",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { hunger: 102, hp: 105 },
        desc: "仙家瑶池盛宴，汇聚天地珍馐，每一口都是极致享受，食之令人飘飘欲仙。",
        value: 212,
    },
    {
        id: "foods_193",
        name: "万年龙肝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 4, days: 10 }, hunger: 26, hp: 18 },
        desc: "万年龙肝，珍稀至极，口感细腻，蕴含强大神力，食用后精神力暴涨。",
        value: 314,
    },
    {
        id: "foods_194",
        name: "天山玉露",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 3, days: 10 }, hunger: 34, hp: 22 },
        desc: "天山采集的玉露琼浆，清甜可口，灵气四溢，饮用后精力充沛，修为精进。",
        value: 316,
    },
    {
        id: "foods_195",
        name: "蓬莱玉露",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_def", val: "3_4", days: 10 },
            hunger: 31,
            hp: 15,
        },
        desc: "蓬莱仙岛玉露，同时提升攻击与防御，效果显著，仙家至宝，凡人难求。",
        value: 346,
    },
    {
        id: "foods_196",
        name: "千年凤髓",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 3, days: 10 }, hunger: 31, hp: 22 },
        desc: "千年凤髓，胶质丰富，口感滑嫩，食用后精力无穷，青春永驻。",
        value: 313,
    },
    {
        id: "foods_197",
        name: "万年瑶池宴",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 3, days: 10 }, hunger: 32, hp: 15 },
        desc: "万年一度的瑶池盛宴，汇聚天地灵气，食用后真气澎湃，功力大增。",
        value: 307,
    },
    {
        id: "foods_198",
        name: "天山琼浆",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 5, days: 8 }, hunger: 30, hp: 24 },
        desc: "天山琼浆玉液，口感醇厚，灵气逼人，饮用后防御力大幅提升，坚不可摧。",
        value: 318,
    },
    {
        id: "foods_199",
        name: "灵气雪蛤",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 5, days: 11 }, hunger: 32, hp: 17 },
        desc: "极寒之地灵气雪蛤，滋补效果极佳，食用后真气如潮，绵延不绝。",
        value: 337,
    },
    {
        id: "foods_200",
        name: "灵气龙肝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_qi", val: "5_4", days: 12 },
            hunger: 28,
            hp: 22,
        },
        desc: "蕴含灵气的龙肝，同时提升攻击与真气，效果霸道，食用后实力大增。",
        value: 386,
    },
    {
        id: "foods_201",
        name: "九转蛟龙筋",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 5, days: 9 }, hunger: 30, hp: 18 },
        desc: "九转蛟龙筋，富含胶原蛋白，口感劲道，食用后速度奇快，如蛟龙出海。",
        value: 320,
    },
    {
        id: "foods_202",
        name: "万年灵芝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 4, days: 10 }, hunger: 25, hp: 25 },
        desc: "万年灵芝，药中极品，苦涩回甘，食用后精神焕发，百病全消。",
        value: 320,
    },
    {
        id: "foods_203",
        name: "太极仙桃",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_qi", val: "4_4", days: 11 },
            hunger: 32,
            hp: 20,
        },
        desc: "太极仙桃，阴阳调和，果肉鲜美，食用后精神真气双补，功效神奇。",
        value: 370,
    },
    {
        id: "foods_204",
        name: "蓬莱琼浆",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { hunger: 115, hp: 108 },
        desc: "蓬莱仙岛琼浆玉液，香气扑鼻，口感醇厚，是仙家款待贵宾的最高礼遇。",
        value: 228,
    },
    {
        id: "foods_205",
        name: "九转麒麟肉",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 5, days: 8 }, hunger: 35, hp: 20 },
        desc: "九转麒麟肉，肉质极嫩，入口即化，食用后攻击力暴涨，威力无穷。",
        value: 319,
    },
    {
        id: "foods_206",
        name: "天山雪蛤",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 4, days: 12 }, hunger: 26, hp: 24 },
        desc: "天山雪蛤，滋补圣品，口感滑嫩，食用后防御大增，如冰墙铁壁。",
        value: 336,
    },
    {
        id: "foods_207",
        name: "千年瑶池宴",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "shen_speed", val: "3_5", days: 9 },
            hunger: 33,
            hp: 15,
        },
        desc: "千年瑶池宴，汇聚仙家珍馐，同时提升精神与速度，食之飘飘欲仙。",
        value: 350,
    },
    {
        id: "foods_208",
        name: "龙凤凤髓",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 5, days: 10 }, hunger: 30, hp: 20 },
        desc: "龙凤凤髓，极其珍稀，口感细腻，食用后真气如海，深不可测。",
        value: 330,
    },
    {
        id: "foods_209",
        name: "灵气仙桃",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 4, days: 11 }, hunger: 28, hp: 22 },
        desc: "灵气仙桃，果肉多汁，甜入心扉，食用后精力充沛，修为大进。",
        value: 328,
    },
    {
        id: "foods_210",
        name: "万年蛟龙筋",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 5, days: 10 }, hunger: 34, hp: 16 },
        desc: "万年蛟龙筋，口感劲道，越嚼越香，食用后攻击力持久强劲。",
        value: 330,
    },
    {
        id: "foods_211",
        name: "仙家灵芝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "shen", val: 3, days: 13 }, hunger: 25, hp: 30 },
        desc: "仙家灵芝，药力温和，口感甘美，食用后精神焕发，延年益寿。",
        value: 339,
    },
    {
        id: "foods_212",
        name: "千年龙肝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_def", val: "4_4", days: 9 },
            hunger: 31,
            hp: 19,
        },
        desc: "千年龙肝，肉质紧实，味道鲜美，同时提升攻防，实力全面增强。",
        value: 352,
    },
    {
        id: "foods_213",
        name: "万年凤髓",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 5, days: 10 }, hunger: 32, hp: 20 },
        desc: "万年凤髓，胶质丰富，口感滑嫩，食用后真气澎湃，如凤凰涅槃。",
        value: 332,
    },
    {
        id: "foods_214",
        name: "天山麒麟肉",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { hunger: 105, hp: 102 },
        desc: "天山麒麟肉，肉质细嫩，滋味鲜美，是顶级的滋补美食，食之强身健体。",
        value: 212,
    },
    {
        id: "foods_215",
        name: "蓬莱仙桃",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "jing", val: 4, days: 11 }, hunger: 30, hp: 25 },
        desc: "蓬莱仙桃，仙家果品，果肉饱满，汁多味甜，食用后精力无穷。",
        value: 333,
    },
    {
        id: "foods_216",
        name: "龙凤灵芝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "shen_qi", val: "5_3", days: 10 },
            hunger: 27,
            hp: 23,
        },
        desc: "龙凤灵芝，珍稀药材，炖汤鲜美，食用后精神真气双修，功效非凡。",
        value: 360,
    },
    {
        id: "foods_217",
        name: "九转琼浆",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "def", val: 5, days: 9 }, hunger: 28, hp: 22 },
        desc: "九转琼浆，经过九次提炼，口感纯净，饮用后防御大增，如金刚不坏。",
        value: 322,
    },
    {
        id: "foods_218",
        name: "灵气蛟龙筋",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "speed", val: 4, days: 10 }, hunger: 31, hp: 16 },
        desc: "灵气蛟龙筋，富含灵气，口感劲道，食用后速度提升，身轻如燕。",
        value: 317,
    },
    {
        id: "foods_219",
        name: "万年雪蛤",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 5, days: 8 }, hunger: 32, hp: 22 },
        desc: "万年雪蛤，滋补极品，口感滑嫩，食用后攻击力大增，威力惊人。",
        value: 318,
    },
    {
        id: "foods_220",
        name: "万年灵气雪蛤",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_shen", val: "5_5", days: 12 },
            hunger: 28,
            hp: 20,
        },
        desc: "万年灵气雪蛤，集天地精华，食用后精神与神力同时暴涨，修仙至宝。",
        value: 394,
    },
    {
        id: "foods_221",
        name: "千年龙凤灵芝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "qi_atk", val: "4_5", days: 10 },
            hunger: 32,
            hp: 18,
        },
        desc: "千年龙凤灵芝，珍稀至极，炖汤鲜美无比，食用后真气攻击双提升。",
        value: 370,
    },
    {
        id: "foods_222",
        name: "太极乾坤琼浆",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "def_speed", val: "5_4", days: 11 },
            hunger: 26,
            hp: 22,
        },
        desc: "太极乾坤琼浆，蕴含阴阳之力，同时提升防御与速度，玄妙无穷。",
        value: 376,
    },
    {
        id: "foods_223",
        name: "万年蓬莱仙桃",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "shen_jing", val: "4_4", days: 10 },
            hunger: 35,
            hp: 15,
        },
        desc: "万年蓬莱仙桃，果大味美，灵气逼人，食用后精神与神力大幅提升。",
        value: 360,
    },
    {
        id: "foods_224",
        name: "九转灵气龙肝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "atk", val: 5, days: 12 }, hunger: 30, hp: 25 },
        desc: "九转灵气龙肝，经过特殊炮制，口感鲜嫩，食用后攻击力持久强劲。",
        value: 351,
    },
    {
        id: "foods_225",
        name: "千年九转凤髓",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 5, days: 11 }, hunger: 33, hp: 20 },
        desc: "千年九转凤髓，胶质丰富，口感极佳，食用后真气如潮，绵延不绝。",
        value: 341,
    },
    {
        id: "foods_226",
        name: "万年太极仙桃",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { hunger: 125, hp: 115 },
        desc: "万年太极仙桃，仙家极品，果肉晶莹剔透，食之令人脱胎换骨，功力大增。",
        value: 245,
    },
    {
        id: "foods_227",
        name: "龙凤万年灵芝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_speed", val: "4_5", days: 9 },
            hunger: 24,
            hp: 26,
        },
        desc: "龙凤万年灵芝，珍稀药材，炖汤鲜美，食用后精神与速度双提升。",
        value: 362,
    },
    {
        id: "foods_228",
        name: "天山九转瑶池宴",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_def", val: "5_5", days: 10 },
            hunger: 30,
            hp: 20,
        },
        desc: "天山九转瑶池宴，汇聚天地珍馐，同时提升攻防，食之如登仙境。",
        value: 380,
    },
    {
        id: "foods_229",
        name: "九转万年龙肝",
        type: "food",
        grade: 0,
        rarity: 5,
        obtain: "shop",
        effects: { buff: { attr: "qi", val: 5, days: 10 }, hunger: 35, hp: 20 },
        desc: "九转万年龙肝，肉质极嫩，入口即化，食用后真气澎湃，如江河奔涌。",
        value: 335,
    },
    {
        id: "foods_230",
        name: "太上混沌金丹",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_def", val: "6_6", days: 14 },
            hunger: 25,
            hp: 15,
        },
        desc: "太上老君炼制的混沌金丹，蕴含天地至理，食用后攻防大增，甚至突破境界。",
        value: 452,
    },
    {
        id: "foods_231",
        name: "洪荒长生道果",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_shen", val: "5_6", days: 15 },
            hunger: 20,
            hp: 20,
        },
        desc: "洪荒时期的长生道果，蕴含长生法则，食用后精神与神力大幅提升，寿命延长。",
        value: 450,
    },
    {
        id: "foods_232",
        name: "混沌九天神泉",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "qi_speed", val: "6_5", days: 12 },
            hunger: 22,
            hp: 18,
        },
        desc: "混沌九天神泉，天地初开时的泉水，饮用后真气与速度大幅提升，脱胎换骨。",
        value: 426,
    },
    {
        id: "foods_233",
        name: "九天不朽圣胎",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_speed", val: "5_5", days: 16 },
            hunger: 28,
            hp: 12,
        },
        desc: "九天不朽圣胎，蕴含不朽神性，食用后攻击与速度永久提升，成神之基。",
        value: 448,
    },
    {
        id: "foods_234",
        name: "幽冥不朽龙元",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "def_qi", val: "6_6", days: 13 },
            hunger: 24,
            hp: 26,
        },
        desc: "幽冥深处的不朽龙元，能量庞大，食用后防御与真气大幅提升，成就不灭金身。",
        value: 454,
    },
    {
        id: "foods_235",
        name: "圣人造化凤血",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_qi", val: "5_5", days: 14 },
            hunger: 30,
            hp: 10,
        },
        desc: "圣人采集凤凰精血炼制，蕴含造化之力，食用后精神真气双修，超凡入圣。",
        value: 432,
    },
    {
        id: "foods_236",
        name: "长生九天仙酿",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "shen_atk", val: "6_4", days: 15 },
            hunger: 18,
            hp: 22,
        },
        desc: "长生九天仙酿，采集仙界灵草酿造，饮用后神力与攻击大幅提升，威力无穷。",
        value: 440,
    },
    {
        id: "foods_237",
        name: "不朽圣人神肉",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "def_speed", val: "6_6", days: 12 },
            hunger: 35,
            hp: 15,
        },
        desc: "不朽圣人的神肉，蕴含不灭法则，食用后防御与速度达到极致，金刚不坏。",
        value: 446,
    },
    {
        id: "foods_238",
        name: "造化天道天露",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_atk", val: "6_6", days: 14 },
            hunger: 20,
            hp: 20,
        },
        desc: "造化天道凝聚的天露，蕴含天道之力，饮用后精神与攻击大幅提升，掌控天地。",
        value: 452,
    },
    {
        id: "foods_239",
        name: "天道洪荒蟠桃",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "qi_shen", val: "5_5", days: 15 },
            hunger: 30,
            hp: 10,
        },
        desc: "天道洪荒蟠桃，天地灵根所结，食之与天地同寿，真气神力取之不尽。",
        value: 440,
    },
    {
        id: "foods_240",
        name: "太极混沌道果",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "speed_atk", val: "6_6", days: 13 },
            hunger: 26,
            hp: 14,
        },
        desc: "太极混沌道果，蕴含混沌之力，食用后速度与攻击大幅提升，甚至撕裂空间。",
        value: 444,
    },
    {
        id: "foods_241",
        name: "洪荒九转金丹",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "def_qi", val: "6_6", days: 14 },
            hunger: 28,
            hp: 12,
        },
        desc: "洪荒九转金丹，经过九次炼制，药力霸道，食用后防御真气大增，成就不灭之体。",
        value: 452,
    },
    {
        id: "foods_242",
        name: "混沌造化神泉",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_shen", val: "6_6", days: 12 },
            hunger: 22,
            hp: 18,
        },
        desc: "混沌造化神泉，蕴含造化神力，饮用后精神与神力达到巅峰，掌控万物。",
        value: 436,
    },
    {
        id: "foods_243",
        name: "九天长生圣胎",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_speed", val: "6_4", days: 15 },
            hunger: 30,
            hp: 20,
        },
        desc: "九天长生圣胎，蕴含长生法则与强大能量，食用后攻击速度大幅提升，寿命延长。",
        value: 450,
    },
    {
        id: "foods_244",
        name: "幽冥造化龙元",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "qi_def", val: "5_6", days: 14 },
            hunger: 25,
            hp: 15,
        },
        desc: "幽冥造化龙元，能量温和而磅礴，食用后真气与防御大幅提升，成就无上金身。",
        value: 442,
    },
    {
        id: "foods_245",
        name: "圣人太上凤血",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "jing_atk", val: "6_6", days: 12 },
            hunger: 30,
            hp: 10,
        },
        desc: "圣人采集太上凤凰精血，蕴含至阳之力，食用后精神与攻击达到极致，焚天煮海。",
        value: 436,
    },
    {
        id: "foods_246",
        name: "不朽太上仙酿",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "shen_speed", val: "5_5", days: 16 },
            hunger: 15,
            hp: 25,
        },
        desc: "不朽太上仙酿，仙界至宝，饮用后神力与速度大幅提升，身法如电，神力如海。",
        value: 448,
    },
    {
        id: "foods_247",
        name: "造化幽冥神肉",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "atk_def", val: "6_6", days: 13 },
            hunger: 32,
            hp: 18,
        },
        desc: "造化幽冥神肉，蕴含天地造化与幽冥之力，食用后攻防大增，甚至突破天地限制。",
        value: 454,
    },
    {
        id: "foods_248",
        name: "长生洪荒天露",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "qi_jing", val: "6_6", days: 14 },
            hunger: 20,
            hp: 20,
        },
        desc: "长生洪荒天露，汇聚天地灵气，饮用后真气与精神达到圆满，举手投足皆含天地之威。",
        value: 452,
    },
    {
        id: "foods_249",
        name: "天道混沌神肉",
        type: "food",
        grade: 0,
        rarity: 6,
        obtain: "shop",
        effects: {
            buff: { attr: "speed_def", val: "5_5", days: 15 },
            hunger: 30,
            hp: 15,
        },
        desc: "天道混沌神肉，蕴含混沌法则，食用后速度与防御达到极致，甚至能躲避时间流逝。",
        value: 445,
    },
    {
        id: "foods_300",
        name: "猴儿酒",
        type: "food",
        grade: 0,
        rarity: 4,
        obtain: "wild",
        value: 94,
        effects: { hunger: 10, mp: 80},
        desc: "【奇遇】山中灵猴采集百果在树洞中自然发酵而成的绝世佳酿，千金难求。酒液粘稠如琥珀，异香扑鼻，饮之虽不解饱，但能大幅滋养内力，令人神清气爽。",
    }

];

const fishes = [{id: "fishes_base_01", name: "草鱼", type: "food", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 10, hp: 2}, desc: "最常见的淡水鱼。", value: 12,},
    {id: "fishes_base_02", name: "鲫鱼", type: "food", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 8, hp: 3}, desc: "肉质鲜嫩，适合煲汤。", value: 11,},
    {id: "fishes_base_03", name: "鲤鱼", type: "food", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 12, hp: 2}, desc: "据说跃过龙门能化龙。", value: 24,},
    {id: "fishes_base_04", name: "泥鳅", type: "food", rarity: 1, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 5, hp: 5}, desc: "滑不留手，滋补。", value: 10,},
    {
        id: "fishes_base_05", name: "黑鱼", type: "food", rarity: 2, obtain: "fish", seasons: [0, 1, 2, 3], region: "all", effects: {hunger: 15, hp: 5}, desc: "凶猛的肉食性鱼类。", value: 22,
    },

    /* === B. 季节性通用 (每季5种) 20种 === */
    /* 春 (0) */
    {id: "fishes_spr_01", name: "鲥鱼", type: "food", rarity: 3, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 20, hp: 10}, desc: "长江三鲜之一，惜其多刺。", value: 33,},
    {id: "fishes_spr_02", name: "桃花鱼", type: "food", rarity: 2, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 10}, desc: "桃花流水鳜鱼肥。", value: 12,},
    {id: "fishes_spr_03", name: "春鲤", type: "food", rarity: 1, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 12}, desc: "春水生发时的鲤鱼。", value: 12,},
    {id: "fishes_spr_04", name: "细鳞鱼", type: "food", rarity: 2, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 15, hp: 5}, desc: "鳞片细小，肉质细腻。", value: 20,},
    {id: "fishes_spr_05", name: "大头鱼", type: "food", rarity: 1, obtain: "fish", seasons: [0], region: "all", effects: {hunger: 25}, desc: "头真的很大。", value: 25,}, /* 夏 (1) */
    {id: "fishes_sum_01", name: "白鱼", type: "food", rarity: 2, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 15}, desc: "浪里白条，游速极快。", value: 15,},
    {id: "fishes_sum_02", name: "黄鳝", type: "food", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 10, hp: 5}, desc: "夏季补血良品。", value: 15,},
    {id: "fishes_sum_03", name: "鲶鱼", type: "food", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 20}, desc: "嘴大贪吃，生长在淤泥中。", value: 20,},
    {id: "fishes_sum_04", name: "鳊鱼", type: "food", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 12}, desc: "身扁肉厚。", value: 12,},
    {id: "fishes_sum_05", name: "罗非鱼", type: "food", rarity: 1, obtain: "fish", seasons: [1], region: "all", effects: {hunger: 15}, desc: "生命力顽强。", value: 15,}, /* 秋 (2) */
    {id: "fishes_aut_01", name: "鲈鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 18}, desc: "秋风起，鲈鱼美。", value: 18,},
    {id: "fishes_aut_02", name: "大闸蟹", type: "food", rarity: 3, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 15, hp: 5}, desc: "虽然是蟹，但也算水产。", value: 20,},
    {id: "fishes_aut_03", name: "秋刀鱼", type: "food", rarity: 1, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 12}, desc: "身形修长如刀。", value: 12,},
    {id: "fishes_aut_04", name: "鲑鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 25, hp: 5}, desc: "逆流而上产卵，油脂丰富。", value: 30,},
    {id: "fishes_aut_05", name: "武昌鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "all", effects: {hunger: 18}, desc: "才饮长沙水，又食武昌鱼。", value: 18,}, /* 冬 (3) */
    {id: "fishes_win_01", name: "冬鲤", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 20, hp: 5}, desc: "积蓄了脂肪过冬，最为肥美。", value: 25,},
    {id: "fishes_win_02", name: "雪鱼", type: "food", rarity: 3, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 15, hp: 20}, desc: "通体洁白，能解热毒。", value: 35,},
    {id: "fishes_win_03", name: "寒鲷", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 15}, desc: "皮厚肉紧。", value: 15,},
    {id: "fishes_win_04", name: "冰鱼", type: "food", rarity: 3, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 15, hp: 10}, desc: "身体透明，也是一种异宝。", value: 25,},
    {id: "fishes_win_05", name: "冬眠鳖", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "all", effects: {hunger: 15, hp: 30}, desc: "大补元气。", value: 45,},

    /* === C. 地区特有 (9地区 x 5种 = 45种) === */
    /* 关中: 渭河鲤(春), 泾河龙鲜(夏), 秦川鳖(秋), 冰泉鱼(冬), 太白鳞(全) */
    {id: "fishes_gz_01", name: "渭河金鲤", type: "food", rarity: 3, obtain: "fish", seasons: [0], region: "r_c", effects: {hunger: 25}, desc: "【关中春】背如黄金。", value: 25,},
    {id: "fishes_gz_02", name: "泾河龙鲜", type: "food", rarity: 4, obtain: "fish", seasons: [1], region: "r_c", effects: {hunger: 30, buff: {attr: 'qi', val: 4, days: 7}}, desc: "【关中夏】传说沾染龙气。", value: 120,},
    {id: "fishes_gz_03", name: "秦川老鳖", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "r_c", effects: {hunger: 20, hp: 40}, desc: "【关中秋】背甲如石。", value: 60,},
    {id: "fishes_gz_04", name: "冰泉银鱼", type: "food", rarity: 3, obtain: "fish", seasons: [3], region: "r_c", effects: {hunger: 10, mp: 20}, desc: "【关中冬】出于终南山冰泉。", value: 30,},
    {id: "fishes_gz_05", name: "太白鳞", type: "food", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_c", effects: {hunger: 30}, desc: "【关中】太白山特产。", value: 30,},

    /* 齐鲁: 渤海对虾(春), 胶东鲍(夏), 梭子蟹(秋), 海参(冬), 黄河刀鱼(全) */
    {id: "fishes_ql_01", name: "渤海对虾", type: "food", rarity: 2, obtain: "fish", seasons: [0], region: "r_e", effects: {hunger: 15, hp: 5}, desc: "【齐鲁春】个头极大。", value: 20,},
    {id: "fishes_ql_02", name: "胶东鲍", type: "food", rarity: 4, obtain: "fish", seasons: [1], region: "r_e", effects: {hunger: 20, buff: {attr: 'jing', val: 4, days: 7}}, desc: "【齐鲁夏】海中珍品。", value: 80,},
    {id: "fishes_ql_03", name: "莱州蟹", type: "food", rarity: 3, obtain: "fish", seasons: [2], region: "r_e", effects: {hunger: 20}, desc: "【齐鲁秋】膏满黄肥。", value: 20,},
    {id: "fishes_ql_04", name: "极品海参", type: "food", rarity: 4, obtain: "fish", seasons: [3], region: "r_e", effects: {hunger: 25, buff: {attr: 'jing', val: 5, days: 7}}, desc: "【齐鲁冬】滋补养身。", value: 100,},
    {id: "fishes_ql_05", name: "黄河刀鱼", type: "food", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_e", effects: {hunger: 25}, desc: "【齐鲁】洄游至此，鲜美无比。", value: 25,},

    /* 巴蜀: 雅鱼(春), 江团(夏), 娃娃鱼(秋), 细甲鱼(冬), 岷江红(全) */
    {id: "fishes_bs_01", name: "雅鱼", type: "food", rarity: 3, obtain: "fish", seasons: [0], region: "r_se", effects: {hunger: 20}, desc: "【巴蜀春】头顶有剑骨。", value: 40,},
    {id: "fishes_bs_02", name: "江团", type: "food", rarity: 3, obtain: "fish", seasons: [1], region: "r_se", effects: {hunger: 30, hp: 10}, desc: "【巴蜀夏】肥美无刺。", value: 40,},
    {id: "fishes_bs_03", name: "岩鲤", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "r_se", effects: {hunger: 25}, desc: "【巴蜀秋】藏于岩石激流。", value: 25,},
    {id: "fishes_bs_04", name: "细甲鱼", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "r_se", effects: {hunger: 15}, desc: "【巴蜀冬】鳞片细密。", value: 15,},
    {id: "fishes_bs_05", name: "岷江红", type: "food", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_se", effects: {hunger: 20, hp: 20}, desc: "【巴蜀】通体赤红，灵气盎然。", value: 40,},

    /* 荆楚: 银鱼(春), 武昌鱼(夏), 大闸蟹(秋), 青背(冬), 中华鲟(全) */
    {id: "fishes_jc_01", name: "云梦银鱼", type: "food", rarity: 2, obtain: "fish", seasons: [0], region: "r_se", effects: {hunger: 10, mp: 10}, desc: "【荆楚春】如玉簪。", value: 20,},
    {id: "fishes_jc_02", name: "才鱼", type: "food", rarity: 2, obtain: "fish", seasons: [1], region: "r_se", effects: {hunger: 20, hp: 20}, desc: "【荆楚夏】生肌补血。", value: 40,},
    {id: "fishes_jc_03", name: "洞庭蟹", type: "food", rarity: 3, obtain: "fish", seasons: [2], region: "r_se", effects: {hunger: 20}, desc: "【荆楚秋】不输阳澄湖。", value: 20,},
    {id: "fishes_jc_04", name: "青背", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "r_se", effects: {hunger: 25}, desc: "【荆楚冬】肉质紧实。", value: 25,},
    {id: "fishes_jc_05", name: "中华鲟(幼)", type: "food", rarity: 4, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_se", effects: {hunger: 30, buff: {attr: 'def', val: 4, days: 7}}, desc: "【荆楚】水中活化石，极其珍贵。", value: 120,},

    /* 东海: 黄鱼(春), 带鱼(夏), 梭鱼(秋), 鳗鱼(冬), 鲛人泪(全-素材) -> 换成 蓝鳍金枪(全) */
    {id: "fishes_dh_01", name: "大黄鱼", type: "food", rarity: 3, obtain: "fish", seasons: [0], region: "r_e", effects: {hunger: 25, money: 50}, desc: "【东海春】浑身金黄，价值连城。", value: 75,},
    {id: "fishes_dh_02", name: "银带鱼", type: "food", rarity: 2, obtain: "fish", seasons: [1], region: "r_e", effects: {hunger: 20}, desc: "【东海夏】如银剑在水。", value: 20,},
    {id: "fishes_dh_03", name: "梭子鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "r_e", effects: {hunger: 18}, desc: "【东海秋】游速极快。", value: 18,},
    {id: "fishes_dh_04", name: "海鳗", type: "food", rarity: 3, obtain: "fish", seasons: [3], region: "r_e", effects: {hunger: 20, hp: 30}, desc: "【东海冬】滋补气血。", value: 50,},
    {id: "fishes_dh_05", name: "蓝鳍金枪", type: "food", rarity: 5, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_e", effects: {hunger: 50, hp: 100}, desc: "【东海】深海之王，极难捕获。", value: 150,},

    /* 辽东: 鳇鱼(春), 哲罗鲑(夏), 狗鱼(秋), 查干湖鱼(冬), 细鳞鲑(全) */
    {id: "fishes_ld_01", name: "达氏鳇", type: "food", rarity: 4, obtain: "fish", seasons: [0], region: "r_ne", effects: {hunger: 50, hp: 30}, desc: "【辽东春】淡水鱼王，体型巨大。", value: 80,},
    {id: "fishes_ld_02", name: "哲罗鲑", type: "food", rarity: 3, obtain: "fish", seasons: [1], region: "r_ne", effects: {hunger: 30}, desc: "【辽东夏】水中猛虎。", value: 30,},
    {id: "fishes_ld_03", name: "黑斑狗鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "r_ne", effects: {hunger: 20}, desc: "【辽东秋】生性贪婪。", value: 20,},
    {id: "fishes_ld_04", name: "冬捕胖头", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "r_ne", effects: {hunger: 40}, desc: "【辽东冬】查干湖冬捕特产。", value: 40,},
    {id: "fishes_ld_05", name: "细鳞鲑", type: "food", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_ne", effects: {hunger: 20, hp: 20, mp: 5}, desc: "【辽东】冷水珍品。", value: 45,},

    /* 匈奴: 贝加尔白鲑(春), 茴鱼(夏), 狗鱼(秋), 江鳕(冬), 哲罗鲑(全) */
    {id: "fishes_xn_01", name: "北海白鲑", type: "food", rarity: 3, obtain: "fish", seasons: [0], region: "r_nw", effects: {hunger: 20, mp: 10}, desc: "【匈奴春】产自北海(贝加尔湖)。", value: 30,},
    {id: "fishes_xn_02", name: "黑龙江茴鱼", type: "food", rarity: 2, obtain: "fish", seasons: [1], region: "r_nw", effects: {hunger: 15}, desc: "【匈奴夏】背鳍如旗。", value: 15,},
    {id: "fishes_xn_03", name: "草原狗鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "r_nw", effects: {hunger: 20}, desc: "【匈奴秋】草原河流中的猎手。", value: 2,},
    {id: "fishes_xn_04", name: "江鳕", type: "food", rarity: 3, obtain: "fish", seasons: [3], region: "r_nw", effects: {hunger: 20, hp: 30}, desc: "【匈奴冬】只有肝脏最美味。", value: 50,},
    {id: "fishes_xn_05", name: "巨型哲罗", type: "food", rarity: 4, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_nw", effects: {hunger: 60}, desc: "【匈奴】传说能吞食牛羊。", value: 60,},

    /* 陇西: 湟鱼(春), 黄河鲤(夏), 祁连雪鲤(秋), 裸鲤(冬), 大鲵(全) */
    {id: "fishes_lx_01", name: "青海湟鱼", type: "food", rarity: 3, obtain: "fish", seasons: [0], region: "r_sw", effects: {hunger: 15, buff: {attr: 'shen', val: 3, days: 7}}, desc: "【陇西春】生长期极慢，蕴含灵气。", value: 45,},
    {id: "fishes_lx_02", name: "黄河铜鲤", type: "food", rarity: 2, obtain: "fish", seasons: [1], region: "r_sw", effects: {hunger: 20}, desc: "【陇西夏】鳞片如铜。", value: 20,},
    {id: "fishes_lx_03", name: "祁连雪鲤", type: "food", rarity: 3, obtain: "fish", seasons: [2], region: "r_sw", effects: {hunger: 20, hp: 20, mp: 5}, desc: "【陇西秋】冰雪融水所养。", value: 45,},
    {id: "fishes_lx_04", name: "高原裸鲤", type: "food", rarity: 2, obtain: "fish", seasons: [3], region: "r_sw", effects: {hunger: 10, hp: 5}, desc: "【陇西冬】无鳞之鱼。", value: 15,},
    {id: "fishes_lx_05", name: "野生大鲵", type: "food", rarity: 3, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_sw", effects: {hunger: 25, hp: 50}, desc: "【陇西】叫声如婴儿。", value: 75,},

    /* 北地: 梭鲈(春), 雅罗鱼(夏), 狗鱼(秋), 鲟鱼(冬), 冷水虾(全) */
    {id: "fishes_bd_01", name: "梭鲈", type: "food", rarity: 2, obtain: "fish", seasons: [0], region: "r_n", effects: {hunger: 18}, desc: "【北地春】凶猛捕食者。", value: 18,},
    {id: "fishes_bd_02", name: "雅罗鱼", type: "food", rarity: 1, obtain: "fish", seasons: [1], region: "r_n", effects: {hunger: 10}, desc: "【北地夏】常见的群游鱼。", value: 10,},
    {id: "fishes_bd_03", name: "北地狗鱼", type: "food", rarity: 2, obtain: "fish", seasons: [2], region: "r_n", effects: {hunger: 20}, desc: "【北地秋】十分贪食。", value: 20,},
    {id: "fishes_bd_04", name: "史氏鲟", type: "food", rarity: 4, obtain: "fish", seasons: [3], region: "r_n", effects: {hunger: 30, buff: {attr: 'atk', val: 5, days: 7}}, desc: "【北地冬】身披骨板。", value: 120,},
    {id: "fishes_bd_05", name: "冷水甜虾", type: "food", rarity: 2, obtain: "fish", seasons: [0, 1, 2, 3], region: "r_n", effects: {hunger: 5, hp: 5}, desc: "【北地】甘甜可口。", value: 10,},];
