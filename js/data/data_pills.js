// 丹药
//console.log("加载 丹药");
 const pills = [
     // --- Batch 1 (HP) ---
     { id: "pills_001", name: "止血散", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { hp: 90 }, desc: "由止血草研磨而成，洁白细腻，止血效果更佳。" },
     { id: "pills_003", name: "消肿膏", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 30, effects: { hp: 45 }, desc: "蒲公英熬制的药膏，涂抹患处凉飕飕的。" },
     { id: "pills_006", name: "地丁胶", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 72, effects: { hp: 108 }, desc: "紫花地丁熬制的胶状物，拔毒消肿。" },
     { id: "pills_011", name: "地榆炭", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 120, effects: { hp: 180 }, desc: "炒制成炭，专治烧伤烫伤。" },
     { id: "pills_012", name: "生肌散", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 180, effects: { hp: 270 }, desc: "白及提炼，伤口愈合速度加快。" },
     { id: "pills_013", name: "三七粉", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 240, effects: { hp: 360 }, desc: "名贵金疮药的原料，止血神神效。" },
     { id: "pills_017", name: "行气散", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 120, effects: { hp: 180 }, desc: "川芎制成，止痛行气。" },
     { id: "pills_019", name: "白芍丹", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 150, effects: { hp: 225 }, desc: "柔肝止痛，缓和拘急。" },

// --- Batch 2 (HP) ---
     { id: "pills_032", name: "祛风丹", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 180, effects: { hp: 270 }, desc: "鹿衔草制成，强筋骨。" },
     { id: "pills_033", name: "止痢丸", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 72, effects: { hp: 108 }, desc: "仙鹤草制成，收敛止血。" },
     { id: "pills_034", name: "紫珠散", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { hp: 90 }, desc: "外敷内服皆可，清热解毒。" },
     { id: "pills_035", name: "血炭粉", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 30, effects: { hp: 45 }, desc: "止血化瘀。" },
     { id: "pills_039", name: "生肌玉红膏", subType: "reply", type: "pill", grade: 1, rarity: 3, value: 1080, effects: { hp: 1620 }, desc: "玉肌花炼制，抹上后伤口不留疤。" },


     // --- Batch 1 (MP) ---
     { id: "pills_002", name: "甘草片", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 36, effects: { mp: 54 }, desc: "蜜炙甘草，甜味浓郁，调和体内真气。" },
     { id: "pills_005", name: "茅根粉", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { mp: 90 }, desc: "凉血生津，饮后顿感灵台清明，法力恢复。" },
     { id: "pills_008", name: "清热散", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { mp: 90 }, desc: "驱除心中燥火，快速回复枯竭的灵力。" },
     { id: "pills_009", name: "芦根露", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 36, effects: { mp: 54 }, desc: "甘甜清冽，专治施法过度后的神志困顿。" },
     { id: "pills_015", name: "黄芪口服液", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 90, effects: { mp: 135 }, desc: "补气固表，极大增强体内的真气循环。" },

// --- Batch 2 (MP) ---
     { id: "pills_021", name: "玉竹饮", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 72, effects: { mp: 108 }, desc: "养阴润燥，滋养丹田灵根。" },
     { id: "pills_022", name: "麦冬颗粒", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { mp: 90 }, desc: "清心润肺，回复损耗的法力。" },
     { id: "pills_023", name: "天冬膏", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { mp: 90 }, desc: "清火生津，化解真气运行产生的燥毒。" },
     { id: "pills_024", name: "百合干", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 48, effects: { mp: 72 }, desc: "安神助眠，平复战斗中波动不安的神识。" },
     { id: "pills_029", name: "莲子心茶", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 36, effects: { mp: 54 }, desc: "清心去火，稳定体内的灵力流动。" },

     // --- Batch 1 (HP & MP) ---
     { id: "pills_004", name: "艾绒丸", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 48, effects: { hp: 36, mp: 36 }, desc: "艾火温经，不仅滋养肉身，更能贯通经络真气。" },
     { id: "pills_007", name: "长寿丸", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 36, effects: { hp: 27, mp: 27 }, desc: "延年益寿之方，全面均衡回复精气神。" },
     { id: "pills_010", name: "通淋丸", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 48, effects: { hp: 36, mp: 36 }, desc: "利水排毒，舒缓经脉，使气血法力双双充盈。" },
     { id: "pills_014", name: "红景天胶囊", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 210, effects: { hp: 158, mp: 157 }, desc: "抗劳耐乏，均衡补益气血与真元。" },
     { id: "pills_016", name: "当归养血丸", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 150, effects: { hp: 113, mp: 112 }, desc: "活血养髓，兼顾肉身治愈与法力运行。" },
     { id: "pills_018", name: "六味地黄丸", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 180, effects: { hp: 135, mp: 135 }, desc: "三补三泻，滋阴补肾，是修士调理气血与真气的首选。" },
     { id: "pills_020", name: "茯苓糕", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 90, effects: { hp: 68, mp: 67 }, desc: "健脾祛湿，气血与灵力共济。" },

// --- Batch 2 (HP & MP) ---
     { id: "pills_025", name: "枸杞原浆", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 60, effects: { hp: 45, mp: 45 }, desc: "浓缩精华，明目滋身，对法力亦有裨益。" },
     { id: "pills_026", name: "淮山粉", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 36, effects: { hp: 27, mp: 27, hunger: 8 }, desc: "药食同源，在填饱肚子的同时稳固根基。" },
     { id: "pills_027", name: "红枣浓缩汁", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 30, effects: { hp: 23, mp: 22, hunger: 3 }, desc: "滋补气血法力，口感甘甜。" },
     { id: "pills_028", name: "桂圆膏", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 48, effects: { hp: 36, mp: 36 }, desc: "益智宁神，法力与体能双重补益。" },
     { id: "pills_030", name: "参王丹", subType: "reply", type: "pill", grade: 0, rarity: 3, value: 600, effects: { hp: 450, mp: 450 }, desc: "野山参精粹，瞬间激发生命潜能与浩瀚灵力。" },
     { id: "pills_031", name: "虫草胶囊", subType: "reply", type: "pill", grade: 0, rarity: 3, value: 540, effects: { hp: 405, mp: 405 }, desc: "补肺益肾，全方位调理修士的内息与外伤。" },
     { id: "pills_036", name: "九转还魂丹(残)", subType: "reply", type: "pill", grade: 2, rarity: 5, value: 15000, effects: { hp: 1463, mp: 1462 }, desc: "【稀世】生死肉骨，真气重聚。纵是残篇，亦能逆转阴阳。" },
     { id: "pills_037", name: "赤血丹", subType: "reply", type: "pill", grade: 1, rarity: 3, value: 1440, effects: { hp: 1080, mp: 1080 }, desc: "炽热药力，同步重塑体魄与灵核。" },
     { id: "pills_038", name: "雪莲丹", subType: "reply", type: "pill", grade: 1, rarity: 3, value: 1200, effects: { hp: 900, mp: 900 }, desc: "极寒之地的圣物，兼具疗伤与补气的奇效。" },
     { id: "pills_040", name: "回春丹", subType: "reply", type: "pill", grade: 1, rarity: 3, value: 1320, effects: { hp: 990, mp: 990}, desc: "枯木逢春之效，气血法力共振再生。" },




     // --- Batch 3 ---
     { id: "pills_041", name: "大力丸", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 240, effects: { buff: { attr: 'atk', val: 10, days: 4 }, toxicity: 1 }, desc: "街头卖艺的也吃这个。临时攻击+10(4天)。" },
     { id: "pills_042", name: "龙葵丹", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 300, effects: { buff: { attr: 'atk', val: 10, days: 7 }, toxicity: 1 }, desc: "刺激潜能。临时攻击+10(7天)。" },
     { id: "pills_043", name: "剑气散", subType: "buff", type: "pill", grade: 0, rarity: 3, value: 600, effects: { buff: { attr: 'atk', val: 15, days: 7 }, toxicity: 2 }, desc: "服用后举手投足带有锐气。临时攻击+15(7天)。" },
     { id: "pills_044", name: "雷元丹", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1200, effects: { buff: { attr: 'atk', val: 15, days: 10 }, toxicity: 3 }, desc: "雷击木提炼，爆发力极强。临时攻击+15(10天)。" },
     { id: "pills_045", name: "烈阳丹", subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1800, effects: { buff: { attr: 'atk', val: 20, days: 7 }, toxicity: 4 }, desc: "全身如火炉。临时攻击+20(7天)。" },
     { id: "pills_046", name: "铁皮散", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 240, effects: { buff: { attr: 'def', val: 10, days: 4 }, toxicity: 1 }, desc: "皮肤变得坚韧。临时防御+10(4天)。" },
     { id: "pills_047", name: "龟甲丹", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 300, effects: { buff: { attr: 'def', val: 10, days: 7 }, toxicity: 1 }, desc: "增强抗击打能力。临时防御+10(7天)。" },
     { id: "pills_048", name: "石化药剂", subType: "buff", type: "pill", grade: 0, rarity: 3, value: 480, effects: { buff: { attr: 'def', val: 15, days: 4 }, toxicity: 2 }, desc: "虽然行动略显僵硬，但很硬。临时防御+15(4天)。" },
     { id: "pills_049", name: "岩心丸", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 960, effects: { buff: { attr: 'def', val: 15, days: 10 }, toxicity: 2 }, desc: "如岩石般坚固。临时防御+15(10天)。" },
     { id: "pills_050", name: "玄冰丹", subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1440, effects: { buff: { attr: 'def', val: 20, days: 7 }, toxicity: 3 }, desc: "寒冰护体。临时防御+20(7天)。" },
     { id: "pills_051", name: "神行粉", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 240, effects: { buff: { attr: 'speed', val: 10, days: 4 }, toxicity: 1 }, desc: "腿脚轻便。临时速度+10(4天)。" },
     { id: "pills_052", name: "云雀丹", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360, effects: { buff: { attr: 'speed', val: 10, days: 7 }, toxicity: 1 }, desc: "身轻如燕。临时速度+10(7天)。" },
     { id: "pills_053", name: "极速水", subType: "buff", type: "pill", grade: 0, rarity: 3, value: 720, effects: { buff: { attr: 'speed', val: 15, days: 4 }, toxicity: 2 }, desc: "闪电藤提炼。临时速度+15(4天)。" },
     { id: "pills_054", name: "幻影丹", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1080, effects: { buff: { attr: 'speed', val: 15, days: 10 }, toxicity: 3 }, desc: "移动带残影。临时速度+15(10天)。" },
     { id: "pills_055", name: "踏云丹", subType: "buff", type: "pill", grade: 1, rarity: 4, value: 1800, effects: { buff: { attr: 'speed', val: 20, days: 7 }, toxicity: 3 }, desc: "御风而行。临时速度+20(7天)。" },
     { id: "pills_056", name: "接骨丸", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360, effects: { buff: { attr: 'jing', val: 10, days: 7 }, toxicity: 1 }, desc: "骨骼强健。临时体质+10(7天)。" },
     { id: "pills_057", name: "大力牛魔丸", subType: "buff", type: "pill", grade: 0, rarity: 3, value: 600, effects: { buff: { attr: 'jing', val: 15, days: 4 }, toxicity: 2 }, desc: "名字很霸气。临时体质+15(4天)。" },
     { id: "pills_058", name: "龙血散", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1200, effects: { buff: { attr: 'jing', val: 15, days: 10 }, toxicity: 3 }, desc: "气血充盈。临时体质+15(10天)。" },
     { id: "pills_059", name: "精元丹", subType: "buff", type: "pill", grade: 2, rarity: 4, value: 2400, effects: { buff: { attr: 'jing', val: 20, days: 7 }, toxicity: 4 }, desc: "固本培元。临时体质+20(7天)。" },
     { id: "pills_060", name: "百年首乌丹", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 960, effects: { buff: { attr: 'jing', val: 15, days: 7 }, toxicity: 2 }, desc: "须发皆黑。临时体质+15(7天)。" },

     // --- Batch 4 ---
     { id: "pills_061", name: "聚气丹", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360, effects: { buff: { attr: 'qi', val: 10, days: 7 }, toxicity: 1 }, desc: "最基础的修炼辅助药。临时能量+10(7天)。" },
     { id: "pills_062", name: "星光散", subType: "buff", type: "pill", grade: 0, rarity: 3, value: 720, effects: { buff: { attr: 'qi', val: 15, days: 4 }, toxicity: 2 }, desc: "点点星光。临时能量+15(4天)。" },
     { id: "pills_063", name: "地脉丹", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1440, effects: { buff: { attr: 'qi', val: 15, days: 10 }, toxicity: 3 }, desc: "厚德载物。临时能量+15(10天)。" },
     { id: "pills_064", name: "蕴灵丹", subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2400, effects: { buff: { attr: 'qi', val: 20, days: 7 }, toxicity: 5 }, desc: "灵气逼人。临时能量+20(7天)。" },
     { id: "pills_065", name: "朱果丹", subType: "buff", type: "pill", grade: 2, rarity: 4, value: 3000, effects: { buff: { attr: 'qi', val: 20, days: 10 }, toxicity: 6 }, desc: "火属性灵力。临时能量+20(10天)。" },
     { id: "pills_066", name: "安神丸", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360, effects: { buff: { attr: 'shen', val: 10, days: 7 }, toxicity: 1 }, desc: "脑子清醒。临时悟性+10(7天)。" },
     { id: "pills_067", name: "忘忧丹", subType: "buff", type: "pill", grade: 0, rarity: 3, value: 720, effects: { buff: { attr: 'shen', val: 15, days: 4 }, toxicity: 2 }, desc: "心无杂念。临时悟性+15(4天)。" },
     { id: "pills_068", name: "紫烟丹", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1440, effects: { buff: { attr: 'shen', val: 15, days: 10 }, toxicity: 3 }, desc: "神识敏锐。临时悟性+15(10天)。" },
     { id: "pills_069", name: "七窍丹", subType: "buff", type: "pill", grade: 1, rarity: 4, value: 2400, effects: { buff: { attr: 'shen', val: 20, days: 7 }, toxicity: 5 }, desc: "思维敏捷。临时悟性+20(7天)。" },
     { id: "pills_070", name: "悟道丹", subType: "buff", type: "pill", grade: 2, rarity: 5, value: 6000, effects: { buff: { attr: 'shen', val: 20, days: 13 }, toxicity: 2 }, desc: "极为珍贵。临时悟性+20(13天)。" },


// --- R1: 凡品 (4个) ---
     { id: "pills_301", name: "清心茶饼", subType: "buff", type: "pill", grade: 0, rarity: 1, value: 80, effects: { buff: { attr: 'studyEff', val: 0.1, days: 4 }, toxicity: 1 }, desc: "粗制的茶饼，虽略显苦涩，但能清心去火。研读效率+10%(4天)。" },
     { id: "pills_302", name: "薄荷含片", subType: "buff", type: "pill", grade: 0, rarity: 1, value: 100, effects: { buff: { attr: 'studyEff', val: 0.1, days: 7 }, toxicity: 1 }, desc: "清凉通窍，能让人在书案前坐得更久。研读效率+10%(7天)。" },
     { id: "pills_303", name: "醒脑散", subType: "buff", type: "pill", grade: 0, rarity: 1, value: 120, effects: { buff: { attr: 'studyEff', val: 0.12, days: 4 }, toxicity: 2 }, desc: "草药研磨的粉末，闻之精神一振。研读效率+12%(4天)。" },
     { id: "pills_304", name: "檀木熏香", subType: "buff", type: "pill", grade: 0, rarity: 1, value: 150, effects: { buff: { attr: 'studyEff', val: 0.15, days: 5 }, toxicity: 1 }, desc: "安神助眠后的产物，利于沉浸书中。研读效率+15%(5天)。" },

// --- R2: 精品 (3个) ---
     { id: "pills_305", name: "明目丹", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 360, effects: { buff: { attr: 'studyEff', val: 0.2, days: 7 }, toxicity: 2 }, desc: "萃取灵草精华，视力与思维双重提升。研读效率+20%(7天)。" },
     { id: "pills_306", name: "慧心丸", subType: "buff", type: "pill", grade: 0, rarity: 2, value: 450, effects: { buff: { attr: 'studyEff', val: 0.25, days: 5 }, toxicity: 3 }, desc: "据说参考了前代文圣的方子。研读效率+25%(5天)。" },
     { id: "pills_307", name: "青灯丹", subType: "buff", type: "pill", grade: 1, rarity: 2, value: 540, effects: { buff: { attr: 'studyEff', val: 0.2, days: 10 }, toxicity: 2 }, desc: "蕴含一丝枯寂真意，极耐寂寞。研读效率+20%(10天)。" },

// --- R3: 珍品 (2个) ---
     { id: "pills_308", name: "灵犀露", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1200, effects: { buff: { attr: 'studyEff', val: 0.35, days: 7 }, toxicity: 3 }, desc: "心有灵犀一点通，专破晦涩难解之语。研读效率+35%(7天)。" },
     { id: "pills_309", name: "悟神丹", subType: "buff", type: "pill", grade: 1, rarity: 3, value: 1800, effects: { buff: { attr: 'studyEff', val: 0.4, days: 10 }, toxicity: 4 }, desc: "药力直达识海，极大缩短参悟周期。研读效率+40%(10天)。" },

// --- R4: 极品 (1个) ---
     { id: "pills_310", name: "大衍神丹", subType: "buff", type: "pill", grade: 2, rarity: 4, value: 4800, effects: { buff: { attr: 'studyEff', val: 0.5, days: 14 }, toxicity: 5 }, desc: "【传世】大衍之数五十，其用四十有九，服之如天助。研读效率+50%(14天)。" },



     { id: "pills_071", name: "断肠散", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 60, effects: { hp: -20, toxicity: 40 }, desc: "提炼后的断肠草，剧毒无比。" },
     { id: "pills_072", name: "乌头毒丸", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 40, effects: { hp: -20, toxicity: 20 }, desc: "即死级心脏麻痹毒药。" },
     { id: "pills_073", name: "封喉毒砂", subType: "poison", type: "pill", grade: 1, rarity: 4, value: 1000, effects: { hp: -300, toxicity: 100 }, desc: "见血封喉的提炼物，沾之即死。" },
     { id: "pills_074", name: "夹竹桃液", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 30, effects: { hp: -20, toxicity: 10 }, desc: "浓缩的毒液。" },
     { id: "pills_075", name: "曼陀罗粉", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 60, effects: { hp: -10, toxicity: 50 }, desc: "强力迷幻药，过量致死。" },
     { id: "pills_076", name: "红信石散", subType: "poison", type: "pill", grade: 1, rarity: 3, value: 200, effects: { hp: -150, toxicity: 50 }, desc: "纯度极高的砒霜。" },
     { id: "pills_077", name: "钩吻毒膏", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 50, effects: { hp: -50  }, desc: "涂抹在兵器上的毒膏。" },
     { id: "pills_078", name: "雷公藤丸", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 50, effects: { hp: -0, toxicity: 50 }, desc: "破坏脏器的剧毒。" },
     { id: "pills_079", name: "马钱子粉", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 50, effects: { hp: -25, toxicity: 25 }, desc: "令人极度痛苦地死去。" },
     { id: "pills_080", name: "疯魔丹", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 60, effects: { hp: -20, toxicity: 40 }, desc: "天仙子提炼，致人发狂。" },


     // --- Batch 5 ---
     { id: "pills_081", name: "商陆毒水", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 32, effects: { hp: -16, toxicity: 16 }, desc: "无色无味。" },
     { id: "pills_082", name: "半夏哑药", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 40, effects: { hp: -30, toxicity: 10 }, desc: "专毁嗓子。" },
     { id: "pills_083", name: "红竹毒", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 20, effects: { hp: -10, toxicity: 10 }, desc: "南天竹提炼。" },
     { id: "pills_084", name: "狼毒膏", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 70, effects: { hp: -30, toxicity: 40 }, desc: "腐蚀性毒药。" },
     { id: "pills_085", name: "巴豆油", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 20, effects: { hp: -7, toxicity: 13, hunger: -40 }, desc: "强力泻药，拉到虚脱。" },
     { id: "pills_086", name: "鹤顶红", subType: "poison", type: "pill", grade: 0, rarity: 3, value: 100, effects: { hp: -70, toxicity: 30 }, desc: "宫廷赐死常用毒药。" },
     { id: "pills_087", name: "水银毒", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 80, effects: { hp: -20, toxicity: 60 }, desc: "朱砂提炼，慢性中毒。" },
     { id: "pills_088", name: "千金断", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 90, effects: { hp: -70, toxicity: 20 }, desc: "千金藤制成，神经毒素。" },
     { id: "pills_089", name: "莽草水", subType: "poison", type: "pill", grade: 0, rarity: 1, value: 10, effects: { hp: -5, toxicity: 10 }, desc: "混在香料里很难发现。" },
     { id: "pills_090", name: "鬼臼毒", subType: "poison", type: "pill", grade: 0, rarity: 2, value: 60, effects: { hp: -0, toxicity: 60 }, desc: "极阴之毒。" },
     { id: "pills_091", name: "绿豆糕(药用)", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 10, effects: { toxicity: -10, hp: 2 }, desc: "浓缩绿豆精华，解百毒。" },
     { id: "pills_092", name: "甘草解毒丸", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 16, effects: { toxicity: -16, hp: 3 }, desc: "最通用的低级解毒药。" },
     { id: "pills_093", name: "土茯苓丸", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 20, effects: { toxicity: -40, hp: 4 }, desc: "专解重金属毒素。" },
     { id: "pills_094", name: "银花解毒汤", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 16, effects: { toxicity: -32, hp: 3 }, desc: "清热解毒，去火。" },
     { id: "pills_095", name: "连翘败毒丸", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 24, effects: { toxicity: -48, hp: 4 }, desc: "治疗疮毒效果好。" },
     { id: "pills_096", name: "板蓝根颗粒", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 10, effects: { toxicity: -20, hp: 2 }, desc: "包治百病(误)，清热解毒。" },
     { id: "pills_097", name: "蛇药片", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 30, effects: { toxicity: -60, hp: 7 }, desc: "白花蛇舌草提炼，专治蛇毒。" },
     { id: "pills_098", name: "半边莲散", subType: "reply", type: "pill", grade: 0, rarity: 2, value: 36, effects: { toxicity: -72, hp: 6 }, desc: "利水消肿，解蛇虫毒。" },
     { id: "pills_099", name: "地丁清毒丸", subType: "reply", type: "pill", grade: 0, rarity: 1, value: 12, effects: { toxicity: -24, hp: 3 }, desc: "基础解毒丹药。" },
     { id: "pills_100", name: "犀角化毒散", subType: "reply", type: "pill", grade: 1, rarity: 4, value: 1000, effects: { toxicity: -100, hp: 13 }, desc: "【珍贵】几乎能解世间大部分奇毒。" },
     {
         id: "pills_101",
         name: "尸丹",
         subType: "poison",
         type: "pill",
         grade: 1,
         rarity: 4,
         value: 1500,
         effects: { hp: -100, toxicity: 200 },
         desc: "由千年古尸体内凝结而成的内丹，集至阴至邪之气，蕴含恐怖的尸毒，触之即腐。"
     },
     {
         id: "pills_102",
         name: "失败的长生药",
         type: "pill",
         subType: "poison",
         grade: 0,
         rarity: 4,
         value: 444,
         effects: { hp: -500, hp_max: -5 },
         desc: "方士为求长生而炼制的丹药，色泽红艳如血，重如金石。虽然未能让人羽化登仙，但其猛烈的金石药性足以瞬间摧毁凡人的五脏六腑。"
     }
 ];