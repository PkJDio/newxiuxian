// js/data/data_world.js
// 地图数据 v6.0：坐标修正(上北下南)、全境填充、新地形
//console.log("加载 地图数据");

// 1. 修改总尺寸
const MAP_SIZE = 5100;

// 2. 修改大网格和小网格（为了保持 3x3 的区域划分，5100 / 3 = 1700）
const GRID_LARGE = 1700; // 原 900 -> 1700
const GRID_SMALL = 566;  // 原 300 -> 566 (约等于 1700/3)

/* ================= 1. 区域网格配置 (重新计算边界) ================= */
// 所有的边界值需要按照 1700 的倍数重新填写，确保覆盖 0-5100
const REGION_LAYOUT = [
    // --- 北部 (y: 0-1700) ---
    { id: "r_nw", name: "北疆",   x: [0, 1700], y: [0, 1700] },
    { id: "r_n",  name: "漠北",   x: [1700, 3400], y: [0, 1700] },
    { id: "r_ne", name: "东胡",   x: [3400, 5100], y: [0, 1700] },

    // --- 中部 (y: 1700-3400) ---
    { id: "r_w",  name: "西域",   x: [0, 1700], y: [1700, 3400] },
    { id: "r_c",  name: "中原",   x: [1700, 3400], y: [1700, 3400] },
    { id: "r_e",  name: "齐鲁",   x: [3400, 5100], y: [1700, 3400] },

    // --- 南部 (y: 3400-5100) ---
    { id: "r_sw", name: "巴蜀",   x: [0, 1700], y: [3400, 5100] },
    { id: "r_s",  name: "南蛮",   x: [1700, 3400], y: [3400, 5100] },
    { id: "r_se", name: "百越",   x: [3400, 5100], y: [3400, 5100] }
];

/* ================= 2. 子区域 (用于显示名字) ================= */
const SUB_REGIONS = {
    // 北部
    "r_nw_0_0": { name: "金山", p: 2 }, "r_nw_1_0": { name: "北庭", p: 3 }, "r_nw_2_0": { name: "准噶尔", p: 2 },
    "r_n_1_1":  { name: "龙城", p: 5 }, "r_n_1_0":  { name: "瀚海", p: 1 }, // 贝加尔湖
    "r_ne_0_1": { name: "鲜卑", p: 3 }, "r_ne_1_1": { name: "扶余", p: 3 }, "r_ne_2_1": { name: "肃慎", p: 2 },

    // 中部
    "r_w_2_1":  { name: "河西", p: 5 }, "r_w_1_1":  { name: "塔里木", p: 3 }, "r_w_0_1": { name: "葱岭", p: 2 },
    "r_c_1_1":  { name: "关中", p: 10 }, "r_c_2_1": { name: "中原", p: 9 }, "r_c_0_1": { name: "陇西", p: 6 },
    "r_c_0_2":  { name: "巴蜀", p: 8 }, "r_c_1_2":  { name: "荆楚", p: 7 }, "r_c_2_2": { name: "吴越", p: 8 }, // 修正位置到长江流域
    "r_c_0_0":  { name: "河套", p: 6 }, "r_c_1_0":  { name: "北地", p: 5 }, "r_c_2_0": { name: "燕赵", p: 7 },

    // 东部/南部
    "r_e_0_1":  { name: "齐鲁", p: 9 }, "r_e_1_1":  { name: "东海", p: 4 }, "r_e_2_1": { name: "蓬莱", p: 1 },
    "r_s_1_1":  { name: "苍梧", p: 4 }, "r_s_2_1":  { name: "南越", p: 5 },
    "r_se_1_1": { name: "南海", p: 2 }, "r_se_2_1": { name: "万山", p: 1 }
};

/* ================= 3. 地形配置 ================= */
// 新增类型: grass (草原), desert (荒漠), ocean (大海)
// js/data/data_world.js - 补充湖泊地形数据

const TERRAIN_ZONES = [
    /* ================= 1. 水系 (修正版：黄河入渤海) ================= */
    { type: "river", name: "黄河上游", x: [800, 1400], y: [2400, 2350] },
    { type: "river", name: "黄河(河套西)", x: [1350, 1400], y: [1350, 2350] },
    { type: "river", name: "黄河(河套北)", x: [1400, 2400], y: [1350, 1400] },
    { type: "river", name: "黄河(龙门段)", x: [2400, 2450], y: [1350, 2400] },
    { type: "river", name: "黄河中游", x: [2400, 3300], y: [2400, 2450] },
    { type: "river", name: "黄河下游", x: [3300, 3350], y: [1800, 2450] },
    { type: "river", name: "渭水", x: [1800, 2550], y: [2550, 2600] },
    { type: "river", name: "金沙江", x: [800, 1500], y: [3000, 3400] },
    { type: "river", name: "长江(川江)", x: [1500, 2300], y: [3300, 3350] },
    { type: "river", name: "长江下游", x: [2800, 3800], y: [3300, 3350] },
    { type: "river", name: "珠江", x: [2500, 3200], y: [4200, 4400] },
    { type: "river", name: "辽河", x: [3600, 3800], y: [1200, 1600] },

    /* ================= 2. 湖泊与大泽 (新增分类) ================= */
    // 关中地区：始皇模拟仙境之作
    { type: "lake", name: "兰池", x: [2100, 2300], y: [2500, 2550] },

    // 西北地区：高山雪水汇聚
    { type: "lake", name: "积石天池", x: [1000, 1200], y: [2200, 2350] },

    // 中原/赵地：古九泽之首
    { type: "lake", name: "大陆泽", x: [2700, 2900], y: [1800, 2000] },

    // 齐鲁/东海：海边巨淀
    { type: "lake", name: "巨淀湖", x: [3500, 3700], y: [2100, 2250] },

    // 荆楚地区：灵气复苏的中心大泽
    { type: "lake", name: "云梦大泽", x: [2300, 2800], y: [3100, 3500] },
    { type: "lake", name: "洞庭湖", x: [2400, 2700], y: [3500, 3700] },

    // 江南地区：水乡核心
    { type: "lake", name: "震泽(太湖)", x: [3800, 4100], y: [3300, 3550] },
    { type: "lake", name: "镜湖", x: [4200, 4350], y: [3600, 3750] },

    // 南岭地区：瘴气中的毒池
    { type: "lake", name: "罗浮天池", x: [2700, 2900], y: [4150, 4300] },

    /* ================= 3. 海洋 ================= */
    { type: "ocean", name: "渤海", x: [3200, 5100], y: [1600, 2100] },
    { type: "ocean", name: "东海", x: [4000, 5100], y: [2100, 4000] },
    { type: "ocean", name: "南海", x: [2000, 5100], y: [4500, 5100] },

    /* ================= 4. 山脉 (骨架) ================= */
    { type: "mountain", name: "昆仑山脉", x: [200, 1500], y: [2400, 2800] },
    { type: "mountain", name: "天山山脉", x: [200, 1500], y: [1200, 1500] },
    { type: "mountain", name: "祁连山", x: [1000, 1600], y: [2000, 2200] },
    { type: "mountain", name: "秦岭", x: [1600, 2600], y: [2650, 2850] },
    { type: "mountain", name: "太行山", x: [2600, 2800], y: [1800, 2400] },
    { type: "mountain", name: "泰山", x: [3400, 3600], y: [2200, 2400] },
    { type: "mountain", name: "巫山", x: [2200, 2400], y: [3000, 3200] },
    { type: "mountain", name: "南岭", x: [2400, 3200], y: [3900, 4100] },

    /* ================= 5. 特殊地形 ================= */
    { type: "desert", name: "大漠", x: [1200, 3000], y: [200, 1200] },
    { type: "desert", name: "塔克拉玛干", x: [400, 1200], y: [1600, 2200] },
    { type: "grass", name: "河套平原", x: [1500, 2300], y: [1400, 1700] },

    /* ================= 6. 道路 ================= */
    { type: "road", name: "秦直道", x: [2500, 2550], y: [1500, 2500] },
    { type: "road", name: "东方驰道", x: [2800, 3800], y: [2600, 2650] },
    { type: "road", name: "金牛道", x: [2250, 2300], y: [2700, 3000] }
];

/* ================= 4. 城镇配置 (对应新坐标) ================= */
const WORLD_TOWNS_PART_1 = [
    // === 帝都圈 (关中平原) ===
    { id: "t_xianyang", name: "咸阳", level: "city", x: 2520, y: 2580, w: 160, h: 120, subRegion: "r_c_1_1", desc: "【大秦帝都】天下之中，八水绕长安，金城千里。" },
    { id: "t_yong", name: "雍城", level: "city", x: 2300, y: 2550, w: 100, h: 100, subRegion: "r_c_1_1", desc: "秦国旧都，宗庙所在，穆公霸业肇始之地。" },
    { id: "t_lantian", name: "蓝田", level: "town", x: 2650, y: 2750, w: 80, h: 80, subRegion: "r_c_1_1", desc: "秦岭北麓，美玉产地，扼守东南要道。" },
    { id: "t_chencang", name: "陈仓", level: "town", x: 2150, y: 2600, w: 80, h: 80, subRegion: "r_c_1_1", desc: "关中西大门，暗度陈仓之地。" },
    { id: "t_weinan", name: "渭南", level: "town", x: 2700, y: 2530, w: 60, h: 60, subRegion: "r_c_1_1", desc: "渭水之南，粮草转运要津。" },
    { id: "t_meixian", name: "郿县", level: "village", x: 2250, y: 2650, w: 50, h: 50, subRegion: "r_c_1_1", desc: "白起故里，民风彪悍。" },
    { id: "t_liquan", name: "甘泉宫", level: "village", x: 2520, y: 2400, w: 50, h: 50, subRegion: "r_c_1_1", desc: "林木葱郁，秦皇避暑祭天胜地。" },
    { id: "t_huayin", name: "华阴", level: "village", x: 2750, y: 2620, w: 50, h: 50, subRegion: "r_c_1_1", desc: "华山脚下，游侠聚集之地。" },

    // === 三晋之地 (山西/河南北部) ===
    { id: "t_hangu", name: "函谷关", level: "town", x: 2850, y: 2600, w: 90, h: 90, subRegion: "r_c_2_1", desc: "【天下第一关】一夫当关，万夫莫开，锁钥重地。" },
    { id: "t_luoyang", name: "洛阳", level: "city", x: 3050, y: 2620, w: 120, h: 100, subRegion: "r_c_2_1", desc: "周室故都，九鼎所在，天下交通枢纽。" },
    { id: "t_jinyang", name: "晋阳", level: "city", x: 2900, y: 2100, w: 100, h: 100, subRegion: "r_c_2_0", desc: "赵国龙兴之地，汾水之畔，太原古城。" },
    { id: "t_handan", name: "邯郸", level: "city", x: 3200, y: 2200, w: 110, h: 100, subRegion: "r_c_2_0", desc: "赵国都城，胡服骑射，慷慨悲歌之士云集。" },
    { id: "t_daliang", name: "大梁", level: "city", x: 3300, y: 2650, w: 100, h: 100, subRegion: "r_c_2_1", desc: "魏国都城，引黄河水灌溉，极其繁华。" },
    { id: "t_shangdang", name: "上党", level: "town", x: 2950, y: 2300, w: 70, h: 70, subRegion: "r_c_2_0", desc: "天下之脊，地势极高，兵家必争。" },
    { id: "t_changping", name: "长平", level: "village", x: 3100, y: 2450, w: 50, h: 50, subRegion: "r_c_2_0", desc: "古战场遗址，夜闻鬼哭，杀气未散。" }
];
const WORLD_TOWNS_PART_2 = [
    // === 齐鲁大地 (山东半岛 - 修正版) ===
    // 临淄：靠北，临近渤海湾
    { id: "t_linzi", name: "临淄", level: "city", x: 3500, y: 2250, w: 140, h: 120, subRegion: "r_e_0_1", desc: "【海内第一城】北临渤海，齐国故都，稷下学宫。" },
    // 泰山：在临淄西南
    { id: "t_taishan", name: "泰山", level: "village", x: 3350, y: 2350, w: 60, h: 60, subRegion: "r_e_0_1", desc: "五岳独尊，封禅之地，俯瞰齐鲁。" },
    // 曲阜：在泰山以南
    { id: "t_qufu", name: "曲阜", level: "town", x: 3450, y: 2500, w: 90, h: 90, subRegion: "r_e_0_1", desc: "鲁国故都，孔孟之乡。" },
    // 琅琊：在东南沿海（东海）
    { id: "t_langya", name: "琅琊", level: "town", x: 3800, y: 2600, w: 80, h: 80, subRegion: "r_e_0_1", desc: "东海胜境，秦皇登临勒石，徐福出海处。" },
    // 即墨：半岛东端
    { id: "t_jimo", name: "即墨", level: "town", x: 3900, y: 2300, w: 80, h: 80, subRegion: "r_e_0_1", desc: "齐国东都，田单火牛阵复国传奇之地。" },

    // ... (荆楚和吴越的代码保持不变，之前发的可以用)
    // === 荆楚之地 (两湖/长江中游) ===
    { id: "t_ying", name: "郢都", level: "city", x: 2600, y: 3200, w: 120, h: 100, subRegion: "r_c_1_2", desc: "楚国故都，江汉平原，云梦大泽之畔。" },
    { id: "t_shouchun", name: "寿春", level: "city", x: 3200, y: 3000, w: 100, h: 100, subRegion: "r_c_1_2", desc: "楚国最后都城，淮南重镇。" },
    { id: "t_changsha", name: "长沙", level: "town", x: 2600, y: 3500, w: 80, h: 80, subRegion: "r_c_1_2", desc: "星沙古城，屈贾之乡，湘水北去。" },
    { id: "t_xiangyang", name: "襄阳", level: "town", x: 2500, y: 2900, w: 80, h: 80, subRegion: "r_c_1_2", desc: "南船北马，汉水锁钥，兵家必争。" },
    { id: "t_jiangling", name: "江陵", level: "town", x: 2550, y: 3300, w: 70, h: 70, subRegion: "r_c_1_2", desc: "朝辞白帝彩云间，千里江陵一日还。" },

    // === 吴越 (江南) ===
    { id: "t_wu", name: "吴城", level: "city", x: 3600, y: 3100, w: 110, h: 100, subRegion: "r_c_2_2", desc: "姑苏城，小桥流水，干将莫邪铸剑处。" },
    { id: "t_kuaiji", name: "会稽", level: "city", x: 3700, y: 3300, w: 100, h: 100, subRegion: "r_c_2_2", desc: "越王勾践卧薪尝胆，兰亭修禊。" },
    { id: "t_jinling", name: "金陵", level: "town", x: 3400, y: 3050, w: 90, h: 90, subRegion: "r_c_2_2", desc: "楚威王埋金以镇王气，虎踞龙盘。" },
    { id: "t_guangling", name: "广陵", level: "town", x: 3500, y: 2900, w: 80, h: 80, subRegion: "r_c_2_2", desc: "邗沟入江处，烟花三月下扬州。" }
];
const WORLD_TOWNS_PART_3 = [
    // === 巴蜀 (四川盆地) ===
    { id: "t_chengdu", name: "成都", level: "city", x: 1800, y: 3000, w: 120, h: 100, subRegion: "r_c_0_2", desc: "【天府之国】沃野千里，李冰治水，锦官城。" },
    { id: "t_jiangzhou", name: "江州", level: "town", x: 2100, y: 3150, w: 90, h: 90, subRegion: "r_c_0_2", desc: "巴国故地，两江交汇，山城重庆。" },
    { id: "t_hanzhong", name: "汉中", level: "town", x: 2000, y: 2800, w: 80, h: 80, subRegion: "r_c_0_2", desc: "秦蜀咽喉，栈道连云，刘邦兴汉之地。" },
    { id: "t_jianmen", name: "剑门关", level: "village", x: 1900, y: 2900, w: 50, h: 50, subRegion: "r_c_0_2", desc: "蜀道之难，难于上青天。" },
    { id: "t_zigong", name: "公井", level: "village", x: 1850, y: 3200, w: 50, h: 50, subRegion: "r_c_0_2", desc: "盐井林立，火井煮盐。" },

    // === 北境防线 (长城沿线) ===
    { id: "t_jiuyuan", name: "九原", level: "city", x: 2400, y: 1750, w: 100, h: 100, subRegion: "r_c_0_0", desc: "秦直道终点，蒙恬北击匈奴大本营。" },
    { id: "t_yunzhong", name: "云中", level: "town", x: 2700, y: 1800, w: 80, h: 80, subRegion: "r_c_0_0", desc: "赵武灵王所置，魏尚守云中。" },
    { id: "t_yanmen", name: "雁门关", level: "town", x: 2900, y: 1900, w: 80, h: 80, subRegion: "r_c_2_0", desc: "中华第一关，飞将军李广驻守。" },
    { id: "t_jicheng", name: "蓟城", level: "city", x: 3300, y: 1950, w: 110, h: 100, subRegion: "r_c_2_0", desc: "燕国故都，幽燕之地，通往辽东的咽喉。" },
    { id: "t_liaodong", name: "襄平", level: "city", x: 3900, y: 1800, w: 90, h: 90, subRegion: "r_ne_0_1", desc: "辽东重镇，公孙氏割据之地。" },
    { id: "t_longcheng", name: "龙城", level: "town", x: 2200, y: 1200, w: 80, h: 80, subRegion: "r_n_1_1", desc: "匈奴单于庭，祭天圣地。" }
];
const WORLD_TOWNS_PART_4 = [
    // === 西域 (丝绸之路) ===
    { id: "t_dunhuang", name: "敦煌", level: "town", x: 1200, y: 2200, w: 90, h: 90, subRegion: "r_w_2_1", desc: "西出阳关无故人，丝路西端枢纽。" },
    { id: "t_wuwei", name: "武威", level: "town", x: 1600, y: 2300, w: 80, h: 80, subRegion: "r_w_2_1", desc: "凉州词，霍去病击败匈奴休屠王处。" },
    { id: "t_loulan", name: "楼兰", level: "town", x: 800, y: 2200, w: 70, h: 70, subRegion: "r_w_1_1", desc: "罗布泊旁，黄沙百战穿金甲。" },
    { id: "t_qiuci", name: "龟兹", level: "city", x: 600, y: 1900, w: 80, h: 80, subRegion: "r_w_1_1", desc: "西域乐舞之都，佛音袅袅。" },
    { id: "t_shule", name: "疏勒", level: "town", x: 200, y: 2100, w: 80, h: 80, subRegion: "r_w_0_1", desc: "喀什，丝路交汇，盘橐城。" },

    // === 南蛮/百越 ===
    { id: "t_panyu", name: "番禺", level: "city", x: 2800, y: 4300, w: 100, h: 100, subRegion: "r_s_2_1", desc: "岭南都会，南越王赵佗建都处。" },
    { id: "t_guilin", name: "桂林", level: "town", x: 2600, y: 4000, w: 70, h: 70, subRegion: "r_s_1_1", desc: "灵渠沟通湘漓，山水甲天下。" },
    { id: "t_dian", name: "滇国", level: "town", x: 1500, y: 3800, w: 70, h: 70, subRegion: "r_s_1_1", desc: "彩云之南，青铜文明，滇池。" },
    { id: "t_yelang", name: "夜郎", level: "town", x: 2000, y: 3600, w: 60, h: 60, subRegion: "r_s_1_1", desc: "崇山峻岭，夜郎自大。" },
    { id: "t_jiaozhi", name: "交趾", level: "town", x: 2200, y: 4600, w: 70, h: 70, subRegion: "r_s_2_1", desc: "极南之地，象郡所在。" }
];
const WORLD_TOWNS_PART_5 = [
    { id: "t_v_1", name: "桃源村", level: "village", x: 1112, y: 404, w: 40, h: 40, subRegion: "r_nw_1_0", desc: "民风淳朴，世外桃源，桃花盛开之季美不胜收。" },
    { id: "t_v_2", name: "杏花村", level: "village", x: 2453, y: 2206, w: 40, h: 40, subRegion: "r_c_1_0", desc: "酿酒名村，十里飘香，过往客商必饮之所。" },
    { id: "t_v_3", name: "垂柳里", level: "village", x: 2028, y: 1343, w: 40, h: 40, subRegion: "r_n_0_2", desc: "河岸柳树成荫，风景如画，文人墨客常聚于此。" },
    { id: "t_v_4", name: "枫叶坞", level: "village", x: 1039, y: 4667, w: 40, h: 40, subRegion: "r_sw_1_2", desc: "满山红叶，如火如荼，隐世高人出没之所。" },
    { id: "t_v_5", name: "青竹堡", level: "village", x: 912, y: 3656, w: 40, h: 40, subRegion: "r_sw_1_0", desc: "翠竹环绕，清爽宜人，盛产上等竹材。" },
    { id: "t_v_6", name: "云来镇", level: "village", x: 460, y: 444, w: 40, h: 40, subRegion: "r_nw_0_0", desc: "云雾缭绕，仿若仙境，常有仙家子弟落脚。" },
    { id: "t_v_7", name: "落霞村", level: "village", x: 967, y: 1991, w: 40, h: 40, subRegion: "r_w_1_0", desc: "夕阳余晖，美轮美奂，因晚霞绚烂而闻名。" },
    { id: "t_v_8", name: "寒江里", level: "village", x: 2105, y: 4339, w: 40, h: 40, subRegion: "r_s_0_1", desc: "江水寒彻入骨，盛产寒潭之鱼，远近闻名。" },
    { id: "t_v_9", name: "古槐里", level: "village", x: 417, y: 4797, w: 40, h: 40, subRegion: "r_sw_0_2", desc: "村口千年古槐，枝繁叶茂，为村中守护之神。" },
    { id: "t_v_10", name: "百花村", level: "village", x: 1828, y: 4664, w: 40, h: 40, subRegion: "r_s_0_2", desc: "百花齐放，香气袭人，宛如人间花园。" },
    { id: "t_v_11", name: "卧龙里", level: "village", x: 3636, y: 2005, w: 40, h: 40, subRegion: "r_e_0_0", desc: "相传曾有神龙在此卧眠，地灵人杰之所。" },
    { id: "t_v_12", name: "栖凤坞", level: "village", x: 253, y: 1507, w: 40, h: 40, subRegion: "r_nw_0_2", desc: "梧桐成林，传闻有金凤曾来此栖息。" },
    { id: "t_v_13", name: "灵泉村", level: "village", x: 2476, y: 1473, w: 40, h: 40, subRegion: "r_n_1_2", desc: "泉水甘甜，饮之延年益寿，村人皆长寿。" },
    { id: "t_v_14", name: "石碾里", level: "village", x: 1037, y: 959, w: 40, h: 40, subRegion: "r_nw_1_1", desc: "古老的石碾见证了数代人的劳作与欢笑。" },
    { id: "t_v_15", name: "桑梓村", level: "village", x: 3312, y: 992, w: 40, h: 40, subRegion: "r_n_2_1", desc: "家乡桑梓之地，在外游子魂牵梦绕之所。" },
    { id: "t_v_16", name: "鹿鸣坞", level: "village", x: 2366, y: 555, w: 40, h: 40, subRegion: "r_n_1_0", desc: "林深处偶闻鹿鸣，宛如仙音，恬静淡雅。" },
    { id: "t_v_17", name: "鹤羽里", level: "village", x: 3963, y: 4592, w: 40, h: 40, subRegion: "r_se_0_2", desc: "白鹤常聚之地，羽翼如雪，祥瑞之兆。" },
    { id: "t_v_18", name: "龙吟坞", level: "village", x: 1222, y: 3300, w: 40, h: 40, subRegion: "r_w_2_2", desc: "峡谷回响若龙吟，因奇特的风声而得名。" },
    { id: "t_v_19", name: "潜龙里", level: "village", x: 845, y: 4722, w: 40, h: 40, subRegion: "r_sw_1_2", desc: "深潭无底，传有潜龙在渊，深不可测。" },
    { id: "t_v_20", name: "瑞雪村", level: "village", x: 1775, y: 769, w: 40, h: 40, subRegion: "r_n_0_1", desc: "终年积雪不化，别有一番寒岭风情。" },
];
const WORLD_TOWNS_PART_6 = [
    { id: "t_v_21", name: "清风里", level: "village", x: 3824, y: 1412, w: 40, h: 40, subRegion: "r_ne_0_2", desc: "清风徐来，水波不兴，环境极佳的隐居地。" },
    { id: "t_v_22", name: "红泥岗", level: "village", x: 2788, y: 2843, w: 40, h: 40, subRegion: "r_c_1_2", desc: "红泥小火炉，晚来天欲雪。以产优质陶土闻名。" },
    { id: "t_v_23", name: "织星坞", level: "village", x: 1456, y: 4231, w: 40, h: 40, subRegion: "r_sw_2_1", desc: "地势极高，夜晚繁星似锦，宛如伸手可摘。" },
    { id: "t_v_24", name: "鸣蝉里", level: "village", x: 3122, y: 3876, w: 40, h: 40, subRegion: "r_s_2_0", desc: "古木参天，盛夏蝉鸣阵阵，富有山野情趣。" },
    { id: "t_v_25", name: "半坡村", level: "village", x: 2145, y: 2367, w: 40, h: 40, subRegion: "r_c_0_1", desc: "坐落在黄河古道半坡之上，古老且神秘。" },
    { id: "t_v_26", name: "望海墩", level: "village", x: 4450, y: 1823, w: 40, h: 40, subRegion: "r_e_1_0", desc: "东海边缘的高地村落，可远眺碧波万顷。" },
    { id: "t_v_27", name: "牧马滩", level: "village", x: 832, y: 1245, w: 40, h: 40, subRegion: "r_w_1_2", desc: "水草丰美，曾是秦人祖先牧马繁衍之地。" },
    { id: "t_v_28", name: "翠微坞", level: "village", x: 1956, y: 3456, w: 40, h: 40, subRegion: "r_s_0_0", desc: "群山环抱，翠色欲滴，云雾缭绕其间。" },
    { id: "t_v_29", name: "灵犀里", level: "village", x: 3345, y: 4821, w: 40, h: 40, subRegion: "r_s_2_2", desc: "相传村中有一通灵石，常有异兽出没。" },
    { id: "t_v_30", name: "稻香里", level: "village", x: 2890, y: 3654, w: 40, h: 40, subRegion: "r_s_2_0", desc: "江南水乡，稻浪翻滚，一派丰收景象。" },
    { id: "t_v_31", name: "断桥里", level: "village", x: 3712, y: 3102, w: 40, h: 40, subRegion: "r_e_0_2", desc: "古桥半残，流水人家，透着一股凄美之感。" },
    { id: "t_v_32", name: "金沙滩", level: "village", x: 456, y: 2845, w: 40, h: 40, subRegion: "r_w_0_2", desc: "河岸遍布金色的细沙，落日下熠熠生辉。" },
    { id: "t_v_33", name: "白鸽坞", level: "village", x: 1234, y: 845, w: 40, h: 40, subRegion: "r_nw_2_1", desc: "白鸽翔集，象征着此地永恒的安宁。" },
    { id: "t_v_34", name: "清泉里", level: "village", x: 4123, y: 2245, w: 40, h: 40, subRegion: "r_e_1_0", desc: "村中清泉常涌，水质甘冽，远近客商争相取水。" },
    { id: "t_v_35", name: "铁匠堡", level: "village", x: 2845, y: 1567, w: 40, h: 40, subRegion: "r_n_2_2", desc: "民风剽悍，人人尚武，村中铁匠铺日夜开工。" },
    { id: "t_v_36", name: "渔舟坞", level: "village", x: 2234, y: 4890, w: 40, h: 40, subRegion: "r_s_0_2", desc: "南海渔民的聚居地，桅杆林立，海味飘香。" },
    { id: "t_v_37", name: "幽兰里", level: "village", x: 4789, y: 356, w: 40, h: 40, subRegion: "r_ne_2_0", desc: "深谷之中多生幽兰，香气清远，沁人心脾。" },
    { id: "t_v_38", name: "听涛哨", level: "village", x: 3567, y: 4234, w: 40, h: 40, subRegion: "r_se_0_1", desc: "建立在海边断崖上的哨所村落，波涛声不绝于耳。" },
    { id: "t_v_39", name: "沉香坞", level: "village", x: 1567, y: 1789, w: 40, h: 40, subRegion: "r_nw_2_2", desc: "因盛产名贵香料而得名，空气中常带幽香。" },
    { id: "t_v_40", name: "斜阳里", level: "village", x: 678, y: 4234, w: 40, h: 40, subRegion: "r_sw_1_1", desc: "西山斜阳照入村中，将村落镀上一层古铜色。" }
];

// ================= 合并所有城镇数据 =================
// 注意：请将之前发送的 WORLD_TOWNS_PART_1, PART_2, PART_3 和上面的 PART_4
// 按顺序合并到最终的 WORLD_TOWNS 数组中。

const WORLD_TOWNS = [
    ...WORLD_TOWNS_PART_1,
    ...WORLD_TOWNS_PART_2,
    ...WORLD_TOWNS_PART_3,
    ...WORLD_TOWNS_PART_4,
    ...WORLD_TOWNS_PART_5,
    ...WORLD_TOWNS_PART_6 // 加入新的村落数据
];
// 将 WORLD_TOWNS 暴露给全局 (如果是最后一段代码)
window.WORLD_TOWNS = WORLD_TOWNS;




// ... (getLocationChain 保持不变)
function getLocationChain(x, y) {
    // 将 900 改为变量 GRID_LARGE (1700)
    const rX = Math.floor(x / GRID_LARGE);
    const rY = Math.floor(y / GRID_LARGE);

    const region = REGION_LAYOUT.find(r =>
        x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]
    );
    const regionName = region ? region.name : "荒野";

    // 将 900 和 300 改为变量
    const sX = Math.floor((x % GRID_LARGE) / GRID_SMALL);
    const sY = Math.floor((y % GRID_LARGE) / GRID_SMALL);
    let subName = "野外";

    if (region) {
        const key = `${region.id}_${sX}_${sY}`;
        if (SUB_REGIONS[key]) subName = SUB_REGIONS[key].name;
    }

    let localName = "";
    const town = WORLD_TOWNS.find(t => x >= t.x && x <= t.x+t.w && y >= t.y && y <= t.y+t.h);
    if (town) {
        localName = town.name;
    } else {
        for (let i = TERRAIN_ZONES.length - 1; i >= 0; i--) {
            const z = TERRAIN_ZONES[i];
            if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) {
                localName = z.name;
                break;
            }
        }
    }

    let chain = regionName;
    if (subName !== "野外") chain += ` - ${subName}`;
    if (localName) chain += ` - ${localName}`;
    return chain;
}

window.getLocationChain = getLocationChain;
window.WORLD_TOWNS = WORLD_TOWNS;
window.TERRAIN_ZONES = TERRAIN_ZONES;
window.REGION_LAYOUT = REGION_LAYOUT;
window.SUB_REGIONS = SUB_REGIONS;