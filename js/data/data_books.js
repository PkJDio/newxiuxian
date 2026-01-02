// 功法书：外功/内功/知识
console.log("加载 功法书")
/* --- 11. 书籍 (Books) --- */
/* 书籍数据 */
/* ================= 书籍数据 (v3.0 系统化版) ================= */

/* --- 1. 外功功法 (50本) --- */
/* 设定：只加 攻击(atk)/防御(def)/速度(speed)。 */
/* 机制：需满足学习值才能学会。学会后初始熟练度0。 */
/* 熟练度加成：<100(10%), <400(50%), <1000(100%), >=1000(150%) */
/* ================= 书籍数据 (v3.1 特色数值版) ================= */
// 定义分篇配置
const partsConfig = [
  { suffix: "·上篇", idKey: "upper", descAdd: "【基础篇】", ratio: 0.3 },
  { suffix: "·中篇", idKey: "middle", descAdd: "【进阶篇】", ratio: 0.3 },
  { suffix: "·下篇", idKey: "lower", descAdd: "【精通篇】", ratio: 0.4 }
]
const booksBody = []

/* --- 1. R1 入门武学 (20本) --- */
/* 强度基准：总属性约 3~5 点 */
/* 特点：各有侧重，不再是死板循环 */
const body_r1_list = [
  { n: "五禽戏", a: 1, d: 1, s: 1, cost: 100, desc: "模仿虎鹿熊猿鸟，属性均衡，强身健体。" },
  { n: "太祖长拳", a: 2, d: 1, s: 0, cost: 110, desc: "招式朴实无华，但根基扎实。" },
  { n: "罗汉拳", a: 1, d: 2, s: 0, cost: 120, desc: "佛门基础拳法，注重防守反击。" },
  { n: "谭腿", a: 2, d: 0, s: 2, cost: 130, desc: "南拳北腿，出腿如风，攻守兼备。" },
  { n: "开山掌", a: 3, d: 0, s: 0, cost: 140, desc: "放弃防守，全力一击，掌力刚猛。" },
  { n: "摔跤术", a: 1, d: 2, s: 0, cost: 110, desc: "近身缠斗技巧，下盘稳固。" },
  { n: "齐眉棍", a: 2, d: 2, s: 0, cost: 150, desc: "棍扫一大片，攻防一体。" },
  { n: "柴刀法", a: 2, d: 0, s: 1, cost: 100, desc: "樵夫砍柴悟出的刀法，胜在实用。" },
  { n: "基础剑招", a: 1, d: 1, s: 1, cost: 120, desc: "刺、挑、劈、砍，剑法基础。" },
  { n: "铁线拳", a: 1, d: 3, s: 0, cost: 160, desc: "双臂套铁环练拳，硬桥硬马，防守极强。" },
  { n: "梅花桩", a: 0, d: 1, s: 3, cost: 140, desc: "练习平衡和步法，身形灵活。" },
  { n: "碎石掌", a: 3, d: 0, s: 0, cost: 150, desc: "苦练掌缘，可开碑裂石。" },
  { n: "蛮牛劲", a: 2, d: 2, s: 0, cost: 180, desc: "力大无穷，如蛮牛冲撞。" },
  { n: "灵猴步", a: 0, d: 0, s: 4, cost: 160, desc: "模仿灵猴跳跃，虽无杀伤力但跑得快。" },
  { n: "黑虎掏心", a: 3, d: 0, s: 1, cost: 150, desc: "招式狠辣，直取要害。" },
  { n: "锁喉手", a: 2, d: 0, s: 2, cost: 140, desc: "以快制胜，专攻咽喉。" },
  { n: "劈挂掌", a: 2, d: 0, s: 2, cost: 150, desc: "大开大合，长击冷抽。" },
  { n: "通背拳", a: 2, d: 1, s: 1, cost: 160, desc: "放长击远，发力通透。" },
  { n: "地躺拳", a: 1, d: 2, s: 1, cost: 130, desc: "跌扑滚翻，利用地面进行防御和反击。" },
  { n: "八卦刀", a: 2, d: 1, s: 2, cost: 190, desc: "刀随身转，步法玄妙。" }
]

body_r1_list.forEach((item, index) => {
  // 使用 padStart 补零，保证 ID 长度一致，例如 index 0 变成 "00"
  const indexStr = String(index).padStart(2, "0")

  partsConfig.forEach(part => {
    booksBody.push({
      // 新 ID 格式：booksBody_r1_{索引}_{部位} -> 例如：booksBody_r1_00_upper
      id: `booksBody_r1_${indexStr}_${part.idKey}`,

      // 名称：五禽戏·上篇
      name: item.n + part.suffix,

      type: "book",
      subType: "body",
      grade: 0,
      rarity: 1,

      // 价值：基础值 + 浮动值，这里我没有乘 ratio，你可以根据需要改成 value: Math.floor((30 + index * 5) * part.ratio)
      value: 30 + index * 5,

      // 学习消耗：按比例分配，取整
      studyCost: Math.floor(item.cost * part.ratio),

      // 属性：因为拆成了3本，通常属性是集齐才生效，或者是单本只有微量属性
      // 这里依然保留原属性，你可以根据游戏逻辑决定是否要除以3
      effects: {
        atk: item.a,
        def: item.d,
        speed: item.s
      },

      // 描述：原描述 + 分篇补充描述
      desc: `${item.desc} ${part.descAdd}`
    })
  })
})

/* --- 2. R2 进阶武学 (20本) --- */
/* 强度基准：总属性约 9~12 点 */
/* 特点：流派鲜明，有明显的偏科 */
const body_r2_list = [
  { n: "分筋错骨手", a: 5, d: 2, s: 3, cost: 500, desc: "专攻关节要害，阴狠毒辣。" },
  { n: "狂风刀法", a: 6, d: 0, s: 5, cost: 600, desc: "刀出如狂风，快如闪电，以攻代守。" },
  { n: "越女剑法", a: 5, d: 2, s: 5, cost: 650, desc: "姿态优美，招招致命，轻灵迅捷。" },
  { n: "大力金刚掌", a: 8, d: 2, s: 0, cost: 700, desc: "少林绝技，至刚至阳，力大砖飞。" },
  { n: "无影脚", a: 4, d: 1, s: 7, cost: 600, desc: "出脚无影，快到让人看不清。" },
  { n: "一苇渡江", a: 0, d: 2, s: 9, cost: 550, desc: "轻功绝技，踏水而行，极速之选。" },
  { n: "铁布衫", a: 1, d: 8, s: 0, cost: 500, desc: "凡俗横练功夫之顶峰，刀枪不入。" },
  { n: "十三太保横练", a: 2, d: 7, s: 1, cost: 600, desc: "外练筋骨皮，极其耐揍。" },
  { n: "杨家枪", a: 6, d: 4, s: 2, cost: 650, desc: "战场杀伐之术，去势如龙，攻守平衡。" },
  { n: "七伤拳", a: 10, d: 0, s: 0, cost: 550, desc: "未伤人先伤己，威力巨大，放弃防御。" },
  { n: "摧心掌", a: 7, d: 1, s: 2, cost: 580, desc: "掌力阴毒，震碎内脏。" },
  { n: "化骨绵掌", a: 4, d: 3, s: 3, cost: 620, desc: "外柔内刚，劲力连绵不绝。" },
  { n: "草上飞", a: 1, d: 1, s: 7, cost: 500, desc: "提气轻身，踏草而行。" },
  { n: "流星锤法", a: 8, d: 0, s: 1, cost: 550, desc: "软兵器技巧，威力极大但难以控制。" },
  { n: "千手如来掌", a: 5, d: 5, s: 2, cost: 750, desc: "掌影漫天，虚实难辨，攻防滴水不漏。" },
  { n: "鹰爪功", a: 6, d: 2, s: 4, cost: 600, desc: "指力惊人，专破硬功。" },
  { n: "混元掌", a: 4, d: 4, s: 4, cost: 700, desc: "配合混元功使用，无明显短板。" },
  { n: "雪山剑法", a: 5, d: 5, s: 3, cost: 680, desc: "剑招古朴，带着森森寒意，防御严密。" },
  { n: "两仪剑法", a: 5, d: 5, s: 5, cost: 800, desc: "阴阳调和，攻防一体，完美无瑕。" },
  { n: "达摩棍", a: 5, d: 6, s: 1, cost: 650, desc: "佛门护法棍法，沉稳厚重。" }
]

body_r2_list.forEach((item, index) => {
  // 补零操作，例如第5本变成 "05"
  const indexStr = String(index).padStart(2, "0")

  partsConfig.forEach(part => {
    booksBody.push({
      // 新 ID 格式：booksBody_r2_{索引}_{部位} -> 例如：booksBody_r2_05_upper
      id: `booksBody_r2_${indexStr}_${part.idKey}`,

      name: item.n + part.suffix,

      type: "book",
      subType: "body",
      grade: 0,

      // 稀有度修改为 2
      rarity: 2,

      // 价值：保留原本逻辑 120 + i * 10
      value: 120 + index * 10,

      // 学习消耗：应用 partsConfig 中的比例 (0.3/0.3/0.4)
      studyCost: Math.floor(item.cost * part.ratio),

      effects: {
        atk: item.a,
        def: item.d,
        speed: item.s
      },

      desc: `${item.desc} ${part.descAdd}`
    })
  })
})

/* --- 3. R3/R4 绝世神功 (10本) --- */
/* 强度基准：总属性约 20~25 点 */
/* 特点：江湖传说级别，获得一本即可横行一方 */
const body_r3_list = [
  { n: "降龙十八掌", a: 15, d: 5, s: 2, cost: 2000, desc: "天下第一阳刚掌法，无坚不摧。" },
  { n: "独孤九剑", a: 18, d: 0, s: 5, cost: 2200, desc: "只攻不守，破尽天下武学。" },
  { n: "打狗棒法", a: 10, d: 5, s: 8, cost: 1800, desc: "丐帮镇帮绝技，变化精微，以巧破千斤。" },
  { n: "太极拳", a: 8, d: 15, s: 2, cost: 2000, desc: "以柔克刚，四两拨千斤，防御无敌。" },
  { n: "凌波微步", a: 2, d: 5, s: 18, cost: 2500, desc: "步法玄妙，罗袜生尘，万花丛中过，片叶不沾身。" },
  { n: "乾坤大挪移", a: 5, d: 15, s: 5, cost: 2300, desc: "激发潜力，转移劲力，借力打力之极致。" },
  { n: "六脉神剑", a: 20, d: 2, s: 5, cost: 3000, desc: "以气御剑，无形剑气，远程杀伤第一。" },
  { n: "如来神掌", a: 22, d: 5, s: 0, cost: 3500, desc: "从天而降的掌法，范围巨大，威力绝伦。" },
  { n: "葵花宝典", a: 15, d: 2, s: 20, cost: 3200, desc: "天下武功，无坚不摧，唯快不破。" },
  { n: "金刚不坏神功", a: 5, d: 25, s: 0, cost: 2800, desc: "佛门至高护体神功，身如金刚，万法不侵。" }
]

body_r3_list.forEach((item, index) => {
  // 1. 判断稀有度：前5个是 R3，后5个是 R4
  const isR4 = index >= 5
  const rarity = isR4 ? 4 : 3

  // 2. 计算基础价值 (根据你原始代码的公式)
  // R3: 350 + i * 30
  // R4: 650 + (i-5) * 60
  let baseValue
  if (isR4) {
    baseValue = 650 + (index - 5) * 60
  } else {
    baseValue = 350 + index * 30
  }

  // 3. 补零索引
  const indexStr = String(index).padStart(2, "0")

  partsConfig.forEach(part => {
    booksBody.push({
      // ID 动态生成：根据 rarity 自动切换 r3 或 r4
      // 结果示例: "booksBody_r3_00_upper" 或 "booksBody_r4_05_middle"
      id: `booksBody_r${rarity}_${indexStr}_${part.idKey}`,

      name: item.n + part.suffix,
      type: "book",
      subType: "body",
      grade: 0,

      // 动态稀有度
      rarity: rarity,

      // 价值：使用上面计算好的 baseValue
      value: baseValue,

      // 学习消耗：应用分篇比例
      studyCost: Math.floor(item.cost * part.ratio),

      effects: {
        atk: item.a,
        def: item.d,
        speed: item.s
      },

      desc: `${item.desc} ${part.descAdd}`
    })
  })
})

/* --- 2. 知识类 (210本) --- */
/* 机制：无属性加成。解锁草药/丹药/地图。 */
/* 学习难度低：50~200。不随轮回重置。 */
/* --- [数据更新] 地理图志 (37本) --- */
/* 前10本: 全局解锁 (rarity: 4) */
/* 后27本: 区域解锁 (rarity: 2~3) */
const booksKnowledge = [
  { id: "booksKnowledge_map_global_01", name: "秦皇一统山河图", studyCost: 100, effects: { map: true }, desc: "大秦官方绘制的天下总图，详尽无遗。", value: 300 },
  { id: "booksKnowledge_map_global_02", name: "禹贡·九州志", studyCost: 120, effects: { map: true }, desc: "上古大禹治水所划九州，乃地理之祖。", value: 320 },
  { id: "booksKnowledge_map_global_03", name: "山海经·五藏山经", studyCost: 150, effects: { map: true }, desc: "记载了天下名山大川与奇异怪兽。", value: 400 },
  { id: "booksKnowledge_map_global_04", name: "水经注·全本", studyCost: 100, effects: { map: true }, desc: "天下水系脉络图，路痴必备。", value: 280 },
  { id: "booksKnowledge_map_global_05", name: "穆天子传", studyCost: 110, effects: { map: true }, desc: "周穆王西巡天下的路线图。", value: 310 },
  { id: "booksKnowledge_map_global_06", name: "鬼谷子·纵横图", studyCost: 130, effects: { map: true }, desc: "纵横家眼中的天下大势图。", value: 350 },
  { id: "booksKnowledge_map_global_07", name: "大秦驰道图", studyCost: 90, effects: { map: true }, desc: "标注了通往各地的官方驰道网络。", value: 270 },
  { id: "booksKnowledge_map_global_08", name: "六国疆域旧图", studyCost: 80, effects: { map: true }, desc: "虽是旧图，但地形地貌依然可信。", value: 250 },
  { id: "booksKnowledge_map_global_09", name: "客卿游记", studyCost: 80, effects: { map: true }, desc: "无数游士汇编而成的天下见闻。", value: 260 },
  { id: "booksKnowledge_map_global_10", name: "太史公行记", studyCost: 100, effects: { map: true }, desc: "史官考察四方所留下的珍贵记录。", value: 290 },
  { id: "booksKnowledge_map_xn_01", name: "草原水源图", studyCost: 50, effects: { unlockRegion: "xiongnu" }, desc: "标注了漠北珍贵的水源地。", value: 80 },
  { id: "booksKnowledge_map_xn_02", name: "狼居胥山径", studyCost: 60, effects: { unlockRegion: "xiongnu" }, desc: "通往匈奴圣山的隐秘小路。", value: 90 },
  { id: "booksKnowledge_map_xn_03", name: "胡人牧马图", studyCost: 50, effects: { unlockRegion: "xiongnu" }, desc: "记载了各部落的放牧范围。", value: 75 },
  { id: "booksKnowledge_map_bd_01", name: "长城布防图", studyCost: 60, effects: { unlockRegion: "beidi" }, desc: "详尽标注了长城沿线的烽火台。", value: 90 },
  { id: "booksKnowledge_map_bd_02", name: "直道工程图", studyCost: 50, effects: { unlockRegion: "beidi" }, desc: "秦直道的详细施工路线。", value: 85 },
  { id: "booksKnowledge_map_bd_03", name: "河套沃野志", studyCost: 50, effects: { unlockRegion: "beidi" }, desc: "记载了黄河百害，唯富一套的地理。", value: 80 },
  { id: "booksKnowledge_map_ld_01", name: "燕山雪岭图", studyCost: 50, effects: { unlockRegion: "liaodong" }, desc: "标注了燕山深处的猎户小径。", value: 85 },
  { id: "booksKnowledge_map_ld_02", name: "辽水水文录", studyCost: 50, effects: { unlockRegion: "liaodong" }, desc: "辽河泛滥规律与渡口位置。", value: 80 },
  { id: "booksKnowledge_map_ld_03", name: "箕子朝鲜志", studyCost: 60, effects: { unlockRegion: "liaodong" }, desc: "关于东方半岛的风土人情。", value: 95 },
  { id: "booksKnowledge_map_lx_01", name: "西域丝路草图", studyCost: 70, effects: { unlockRegion: "longxi" }, desc: "通往西域的商路雏形。", value: 100 },
  { id: "booksKnowledge_map_lx_02", name: "祁连山矿脉图", studyCost: 60, effects: { unlockRegion: "longxi" }, desc: "记载了山中产玉之处。", value: 95 },
  { id: "booksKnowledge_map_lx_03", name: "羌人聚落图", studyCost: 50, effects: { unlockRegion: "longxi" }, desc: "西羌各部的分布情况。", value: 85 },
  { id: "booksKnowledge_map_gz_01", name: "咸阳城坊图", studyCost: 40, effects: { unlockRegion: "guanzhong" }, desc: "帝都咸阳的详细街道图。", value: 70 },
  { id: "booksKnowledge_map_gz_02", name: "郑国渠水利图", studyCost: 50, effects: { unlockRegion: "guanzhong" }, desc: "关中沃野千里的灌溉网络。", value: 80 },
  { id: "booksKnowledge_map_gz_03", name: "终南捷径", studyCost: 60, effects: { unlockRegion: "guanzhong" }, desc: "终南山中隐士居住的幽僻之处。", value: 90 },
  { id: "booksKnowledge_map_ql_01", name: "泰山封禅路", studyCost: 60, effects: { unlockRegion: "qilu" }, desc: "历代帝王登山封禅的御道。", value: 95 },
  { id: "booksKnowledge_map_ql_02", name: "孔孟游学图", studyCost: 50, effects: { unlockRegion: "qilu" }, desc: "圣人周游列国留下的遗迹。", value: 85 },
  { id: "booksKnowledge_map_ql_03", name: "海滨盐场志", studyCost: 50, effects: { unlockRegion: "qilu" }, desc: "东方沿海产盐重地的分布。", value: 80 },
  { id: "booksKnowledge_map_bs_01", name: "蜀道难", studyCost: 70, effects: { unlockRegion: "bashu" }, desc: "详细描绘了入蜀的艰难栈道。", value: 105 },
  { id: "booksKnowledge_map_bs_02", name: "都江堰图解", studyCost: 60, effects: { unlockRegion: "bashu" }, desc: "李冰父子治水的千古奇迹。", value: 95 },
  { id: "booksKnowledge_map_bs_03", name: "巴山夜雨录", studyCost: 50, effects: { unlockRegion: "bashu" }, desc: "西南山林的气候与毒瘴分布。", value: 85 },
  { id: "booksKnowledge_map_jc_01", name: "云梦泽水系图", studyCost: 60, effects: { unlockRegion: "jingchu" }, desc: "浩瀚云梦泽的行船路线。", value: 95 },
  { id: "booksKnowledge_map_jc_02", name: "衡山登临志", studyCost: 50, effects: { unlockRegion: "jingchu" }, desc: "南岳衡山的地理风貌。", value: 85 },
  { id: "booksKnowledge_map_jc_03", name: "楚辞·地名考", studyCost: 50, effects: { unlockRegion: "jingchu" }, desc: "屈原诗歌中提到的香草与地名。", value: 80 },
  { id: "booksKnowledge_map_dh_01", name: "徐福东渡图", studyCost: 80, effects: { unlockRegion: "donghai" }, desc: "方士出海寻找仙山的航海图。", value: 110 },
  { id: "booksKnowledge_map_dh_02", name: "吴越春秋地志", studyCost: 50, effects: { unlockRegion: "donghai" }, desc: "江南水乡的古城遗址。", value: 85 },
  { id: "booksKnowledge_map_dh_03", name: "近海岛礁录", studyCost: 60, effects: { unlockRegion: "donghai" }, desc: "渔民世代相传的避风港。", value: 95 }
].map((b, i) => ({
  ...b,
  type: "book",
  subType: "knowledge",
  grade: 0,
  rarity: i < 10 ? 4 : 2 /* 前10本紫色，后面蓝色 */
}))

/* --- 3. 内功功法 (200本) --- */
/* 设定：只加 精(jing)/气(qi)/神(shen)。 */
/* 机制：有熟练度上限 (max_skill_level)。 */
/* 熟练度加成比例同外功。 */
const booksCultivation = []

/* ================= [Tier 1] 残篇/伪本 (100本) ================= */
/* 上限：只能修至【入门】(max_skill_level: 1) */
/* 强度：总属性约 3~5 点 */
/* 风格：涵盖各种入门流派，名称和描述更具修仙风味 */
const t1_styles = [
  { suffix: "强身诀", j: 3, q: 0, s: 0, desc: "市井流传的粗浅法门，专修肉身气力。" },
  { suffix: "引气书", j: 0, q: 3, s: 0, desc: "入门练气口诀，能感应天地灵气。" },
  { suffix: "观想图", j: 0, q: 0, s: 3, desc: "需观想简陋图画，略微提升精神力。" },
  { suffix: "导引术", j: 1, q: 2, s: 0, desc: "配合呼吸吐纳，疏通经络。" },
  { suffix: "吐纳法", j: 1, q: 1, s: 1, desc: "最中正平和的入门功夫，基础扎实。" },
  { suffix: "铁牛劲", j: 4, q: 0, s: 0, desc: "模仿耕牛发力，皮糙肉厚，力大无穷。" },
  { suffix: "流云诀", j: 0, q: 4, s: 0, desc: "气息如流云般绵长，回气速度尚可。" },
  { suffix: "凝神册", j: 0, q: 0, s: 4, desc: "记载着收摄心神的方法，让人头脑清醒。" },
  { suffix: "血气录", j: 3, q: 1, s: 0, desc: "以自身气血引动灵气，偏重炼体。" },
  { suffix: "明目法", j: 0, q: 1, s: 3, desc: "灵气洗练双目，主要提升感知能力。" },
  { suffix: "磐石功", j: 3, q: 0, s: 1, desc: "心如磐石，身如坚岩，不动如山。" },
  { suffix: "龟息功", j: 2, q: 1, s: 1, desc: "模仿灵龟呼吸，降低消耗，延年益寿。" },
  { suffix: "锻骨篇", j: 5, q: 0, s: 0, desc: "虽是残篇，但对骨骼的淬炼极为有效。" },
  { suffix: "聚灵解", j: 0, q: 5, s: 0, desc: "对灵气聚集有独到见解，法力大增。" },
  { suffix: "止水经", j: 0, q: 0, s: 5, desc: "心如止水，波澜不惊，极大提升悟性。" },
  { suffix: "小周天", j: 1, q: 3, s: 1, desc: "打通任督二脉，灵气在体内运行一个小循环。" },
  { suffix: "五行纳", j: 2, q: 2, s: 1, desc: "粗略吸收五行之气，胜在全面。" },
  { suffix: "枯木功", j: 4, q: 1, s: 0, desc: "身如枯木，生机内敛，防御力不俗。" },
  { suffix: "赤火简", j: 1, q: 4, s: 0, desc: "这残简上带着一丝火气，修炼后灵力燥热。" },
  { suffix: "入梦经", j: 0, q: 2, s: 3, desc: "在睡梦中修炼，主要增长神识与灵气。" },
  { suffix: "风行术", j: 1, q: 3, s: 0, desc: "灵力主要用于加持双腿，身轻如燕。" }
]

t1_styles.forEach((style, index) => {
  // 补零索引，例如 0 -> "00"
  const indexStr = String(index).padStart(2, "0")

  partsConfig.forEach(part => {
    booksCultivation.push({
      // 新 ID 格式：booksCultivation_r1_{索引}_{部位}
      // 例如：booksCultivation_r1_00_upper
      id: `booksCultivation_r1_${indexStr}_${part.idKey}`,

      // 名字：基础强身诀·上篇
      name: `基础${style.suffix}${part.suffix}`,

      type: "book",
      subType: "cultivation", // 内功类型
      grade: 1,
      rarity: 1, // R1 等级

      // 价值：基础值60 + 列表位置加成 (越靠后的功法越值钱)
      value: 60 + index * 5,

      // 学习成本：基础200 + 列表加成，并应用分篇比例
      studyCost: Math.floor((200 + index * 10) * part.ratio),

      effects: {
        jing: style.j,
        qi: style.q,
        shen: style.s,
        // 这里保留了最大技能等级限制，
        // 如果你想让每本书提供不同的等级上限，可以在这里改成 max_skill_level: part.idKey === 'upper' ? 1 : ...
        max_skill_level: 1
      },

      // 描述
      desc: `${style.desc} ${part.descAdd}`
    })
  })
})

/* ================= [Tier 2] 正本/进阶 (75本) ================= */
/* 上限：只能修至【进阶】(max_skill_level: 2) */
/* 强度：总属性约 6~8 点 */
/* 风格：根据功法名称前缀决定侧重 (金木水火土阴阳等) */
/* ================= [Tier 2] 正本/进阶 (75本) ================= */
/* 上限：只能修至【进阶】(max_skill_level: 2) */
/* 强度：总属性约 9~12 点 */
/* 风格：涵盖五行、异种属性、诸子百家流派 */
const t2_prefixes = [
  { n: "长春", j: 8, q: 2, s: 1, desc: "木系正宗，生机盎然，体质恢复极快。" },
  { n: "烈火", j: 2, q: 8, s: 1, desc: "火系正宗，灵力如火，破坏力惊人。" },
  { n: "厚土", j: 7, q: 3, s: 1, desc: "土系正宗，身如大地，防御力极强。" },
  { n: "庚金", j: 3, q: 7, s: 1, desc: "金系正宗，攻伐第一，无坚不摧。" },
  { n: "弱水", j: 2, q: 4, s: 5, desc: "水系正宗，至柔克刚，滋养神识。" },
  { n: "青木", j: 6, q: 4, s: 0, desc: "乙木灵气，专注于疗伤与解毒。" },
  { n: "赤炎", j: 3, q: 7, s: 0, desc: "比烈火功更狂暴，容易伤及经脉。" },
  { n: "流沙", j: 5, q: 4, s: 2, desc: "土之变种，灵力厚重且变化多端。" },
  { n: "寒冰", j: 2, q: 5, s: 4, desc: "水之变种，寒气逼人，迟缓敌人。" },
  { n: "锐金", j: 4, q: 6, s: 0, desc: "金之变种，专修一口锐利之气。" },
  { n: "纯阳", j: 3, q: 8, s: 0, desc: "至阳至刚，诸邪不侵，气血旺盛。" },
  { n: "玄阴", j: 1, q: 4, s: 6, desc: "至阴至柔，诡异莫测，主修神魂。" },
  { n: "混元", j: 4, q: 4, s: 4, desc: "混元一气，中正平和，没有任何短板。" },
  { n: "太极", j: 4, q: 3, s: 5, desc: "阴阳调和，以静制动，后劲绵长。" },
  { n: "两仪", j: 3, q: 5, s: 3, desc: "分化阴阳，灵力运转速度极快。" },
  { n: "紫霞", j: 2, q: 5, s: 5, desc: "朝采紫气，温养神魂，绵绵不绝。" },
  { n: "惊雷", j: 3, q: 8, s: 1, desc: "雷属性功法，爆发力最强，但难以持久。" },
  { n: "疾风", j: 2, q: 6, s: 3, desc: "风属性功法，灵力轻灵，身法加成高。" },
  { n: "星辰", j: 1, q: 5, s: 6, desc: "引星光入体，大幅增强感知与悟性。" },
  { n: "血煞", j: 7, q: 4, s: -1, desc: "以杀证道，气血极其强大，但容易影响心智。" },
  { n: "金刚", j: 9, q: 1, s: 1, desc: "佛门外家护体神功，肉身硬扛法宝。" },
  { n: "菩提", j: 2, q: 3, s: 7, desc: "佛门心法，明心见性，悟性极高。" },
  { n: "浩然", j: 3, q: 4, s: 5, desc: "儒家养气功夫，诸邪辟易，神识坚定。" },
  { n: "剑意", j: 1, q: 9, s: 2, desc: "剑修专用，舍弃防御，追求极致的攻击灵力。" },
  { n: "五毒", j: 4, q: 5, s: 2, desc: "苗疆秘传，修出的灵力带有剧毒。" },
  { n: "天刀", j: 5, q: 6, s: 0, desc: "以身化刀，气势磅礴，霸道无匹。" },
  { n: "灵兽", j: 6, q: 2, s: 3, desc: "模仿妖兽修炼，体魄强健，野性十足。" },
  { n: "幽冥", j: 1, q: 4, s: 6, desc: "鬼道功法，森罗万象，神出鬼没。" },
  { n: "枯荣", j: 5, q: 3, s: 4, desc: "半枯半荣，生死流转，极难修炼。" },
  { n: "逍遥", j: 2, q: 5, s: 5, desc: "道家旁支，追求自由自在，灵力飘逸。" }
]

t2_prefixes.forEach((style, index) => {
  // 1. 稀有度逻辑：前20个(0-19)为R2，后10个(20-29)为R3
  const isR3 = index >= 20
  const rarity = isR3 ? 3 : 2

  // 2. 价值计算逻辑 (保留原有价值区间并平滑化)
  // R2: 基础220 + 增量
  // R3: 基础550 + 增量 (因为是特殊流派，起步价高)
  let baseValue = isR3 ? 550 + (index - 20) * 20 : 220 + index * 10

  // 3. 学习消耗
  let baseCost = 800 + index * 20

  const indexStr = String(index).padStart(2, "0")

  partsConfig.forEach(part => {
    booksCultivation.push({
      // ID: booksCultivation_r2_19_lower 或 booksCultivation_r3_20_upper
      id: `booksCultivation_r${rarity}_${indexStr}_${part.idKey}`,

      // 名字：长春功·上篇
      name: `${style.n}功${part.suffix}`,

      type: "book",
      subType: "cultivation",
      grade: 2, // 保持原有的 grade 2
      rarity: rarity,

      value: baseValue,

      // 学习消耗：应用分篇比例
      studyCost: Math.floor(baseCost * part.ratio),

      effects: {
        jing: style.j,
        qi: style.q,
        shen: style.s,
        max_skill_level: 2 // 限制：可进阶
      },

      desc: `${style.desc} ${part.descAdd}`
    })
  })
})

const t3_cults = [
  { n: "龙象般若功", j: 15, q: 2, s: 1, cost: 3000, desc: "每练一层增加一龙一象之力，肉身成圣。" },
  { n: "真龙九变", j: 12, q: 5, s: 3, cost: 3500, desc: "化身真龙，体魄强悍无匹。" },
  { n: "金刚不坏禅", j: 18, q: 0, s: 2, cost: 3200, desc: "佛门护体神功，万法不侵。" },
  { n: "神魔炼体诀", j: 14, q: 4, s: 2, cost: 3100, desc: "上古神魔的炼体法门。" },
  // [法修]
  { n: "紫霄神雷诀", j: 2, q: 15, s: 3, cost: 3500, desc: "驾驭天地雷霆，灵力最为霸道。" },
  { n: "嫁衣神功", j: 1, q: 18, s: 1, cost: 3000, desc: "真气如烈火，需破而后立。" },
  { n: "北冥神功", j: 3, q: 14, s: 3, cost: 3300, desc: "海纳百川，吞噬天下灵气。" },
  { n: "焚诀", j: 2, q: 16, s: 2, cost: 3400, desc: "吞噬异火，灵力可无限进化。" },
  // [魂修]
  { n: "大衍决", j: 1, q: 3, s: 16, cost: 3200, desc: "推演万物，神识浩瀚如海。" },
  { n: "太上感应篇", j: 2, q: 4, s: 14, cost: 3100, desc: "感应天道，提升悟性与神识。" },
  { n: "炼神诀", j: 0, q: 2, s: 18, cost: 3000, desc: "专修神魂，甚至可出窍神游。" },
  { n: "天魔策", j: 3, q: 5, s: 12, cost: 3500, desc: "魔道至高宝典，诡异莫测。" },
  // [双修/正宗]
  { n: "九转金丹术", j: 6, q: 8, s: 6, cost: 3800, desc: "内丹派正宗，精气神混元如一。" },
  { n: "洗髓经", j: 10, q: 2, s: 8, cost: 3600, desc: "易筋洗髓，重塑根骨与神魂。" },
  { n: "易筋经", j: 8, q: 8, s: 4, cost: 3600, desc: "达摩祖师所创，调和阴阳。" },
  { n: "长生诀", j: 10, q: 10, s: 0, cost: 4000, desc: "道家奇书，夺天地造化，回气极快。" },

  /* --- Rarity 5: 绝世/偏科 (Indices 16-19) --- */
  { n: "葵花宝典", j: 2, q: 10, s: 8, cost: 3500, desc: "剑走偏锋，速度与灵力并重。" },
  { n: "玉女心经", j: 4, q: 8, s: 8, cost: 3200, desc: "古墓派绝学，需清心寡欲。" },
  { n: "先天功", j: 7, q: 7, s: 6, cost: 3300, desc: "道家正宗，先天真气，生生不息。" },
  { n: "蛤蟆功", j: 8, q: 8, s: 4, cost: 3100, desc: "以静制动，蓄力爆发。" },

  /* --- Rarity 6: 神话/至尊 (Indices 20-23) --- */
  { n: "八九玄功", j: 12, q: 12, s: 6, cost: 5000, desc: "【神话】肉身成圣，有七十二般变化。" },
  { n: "太清道法", j: 10, q: 10, s: 10, cost: 6000, desc: "【神话】圣人传承，完美无瑕的修仙根基。" },
  { n: "吞天魔功", j: 8, q: 15, s: 7, cost: 5500, desc: "【神话】吞噬万物本源以养己身。" },
  { n: "无字天书", j: 15, q: 15, s: 15, cost: 8000, desc: "【神话】大道无形，记载了修仙的终极奥秘。" }
]

t3_cults.forEach((item, index) => {
  // 1. 确定稀有度 (根据索引区间)
  let rarity = 4
  if (index >= 20) rarity = 6 // 神话级
  else if (index >= 16) rarity = 5 // 绝世级

  // 2. 计算基础价值 (保留原有的价值阶梯)
  let baseValue
  if (rarity === 4) {
    baseValue = 1200 + index * 80 // 1200 ~ 2400
  } else if (rarity === 5) {
    baseValue = 3000 + (index - 16) * 150 // 3000 ~ 3450
  } else {
    baseValue = 9000 + (index - 20) * 1000 // 9000 ~ 12000
  }

  // 3. 处理索引补零
  // 为了让每个 rarity 内部的索引看起来整洁，我们可以重置索引 (可选，这里我选择保留全局唯一索引，方便查错)
  const indexStr = String(index).padStart(2, "0")

  partsConfig.forEach(part => {
    booksCultivation.push({
      // ID: booksCultivation_r4_00_upper 或 booksCultivation_r6_23_lower
      id: `booksCultivation_r${rarity}_${indexStr}_${part.idKey}`,

      // 名字：八九玄功·上篇
      name: `${item.n}${part.suffix}`,

      type: "book",
      subType: "cultivation",
      grade: 3, // 统一为 Tier 3 (可修至大成)
      rarity: rarity,

      value: baseValue,

      // 学习消耗：应用分篇比例
      studyCost: Math.floor(item.cost * part.ratio),

      effects: {
        jing: item.j,
        qi: item.q,
        shen: item.s,
        max_skill_level: 3 // 限制：可修至大成
      },

      // 描述：神话描述 + 篇章描述
      desc: `${item.desc} ${part.descAdd}`
    })
  })
})
