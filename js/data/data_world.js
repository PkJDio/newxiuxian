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
const TERRAIN_ZONES = [
    /* === 1. 北方边疆 (y: 0-1700) === */
    // 瀚海 (贝加尔湖)
    { type: "river", name: "北海", x: [2267, 2833], y: [189, 378] },
    // 蒙古大草原
    { type: "grass", name: "漠北草原", x: [1511, 3022], y: [378, 1133] },
    // 东北林海
    { type: "mountain", name: "大兴安岭", x: [3022, 3211], y: [189, 1511] },
    { type: "grass", name: "呼伦贝尔", x: [2644, 3022], y: [378, 944] },

    /* === 2. 西北/西域 (y: 1700附近) === */
    // 塔克拉玛干沙漠
    { type: "desert", name: "塔克拉玛干", x: [378, 1511], y: [1889, 2644] },
    // 天山
    { type: "mountain", name: "天山", x: [189, 1511], y: [1700, 1889] },
    // 昆仑山
    { type: "mountain", name: "昆仑山", x: [189, 1700], y: [2644, 2833] },
    // 祁连山
    { type: "mountain", name: "祁连山", x: [1322, 1889], y: [2267, 2456] },
    // 河西走廊 (绿洲路)
    { type: "grass", name: "河西牧场", x: [1511, 2078], y: [2361, 2550] },

    /* === 3. 中原核心 (y: 1700-2833) === */
    // 黄河几字弯
    { type: "river", name: "黄河", x: [1889, 1983], y: [1889, 2267] }, // 上游
    { type: "river", name: "黄河", x: [1983, 2928], y: [1889, 1983] }, // 河套顶端
    { type: "river", name: "黄河", x: [2833, 2928], y: [1983, 2550] }, // 晋陕峡谷
    { type: "river", name: "黄河", x: [2928, 3400], y: [2456, 2550] }, // 下游入海

    // 秦岭
    { type: "mountain", name: "秦岭", x: [1889, 2644], y: [2607, 2739] },
    // 渭水 (关中)
    { type: "river", name: "渭水", x: [2078, 2739], y: [2550, 2607] },

    // 太行山
    { type: "mountain", name: "太行山", x: [2739, 2833], y: [2078, 2456] },

    /* === 4. 南方/长江 (y: 2833-3400) === */
    // 长江
    { type: "river", name: "长江", x: [1700, 3400], y: [2928, 3117] },
    // 洞庭/鄱阳
    { type: "river", name: "云梦泽", x: [2456, 2739], y: [3117, 3306] },
    // 巫山
    { type: "mountain", name: "巫山", x: [2172, 2267], y: [2833, 3022] },

    /* === 5. 岭南/西南 (y: 3400+) === */
    // 五岭
    { type: "mountain", name: "五岭", x: [2078, 2833], y: [3400, 3494] },
    // 珠江
    { type: "river", name: "珠江", x: [2267, 2833], y: [3589, 3683] },
    // 西南大山
    { type: "mountain", name: "横断山脉", x: [944, 1700], y: [2833, 3778] },

    /* === 6. 大海 (边缘) === */
    // 东海
    { type: "ocean", name: "东海", x: [3400, 5100], y: [2500, 3778] },
    // 南海
    { type: "ocean", name: "南海", x: [0, 5100], y: [3778, 5100] },
    // 渤海
    { type: "ocean", name: "渤海", x: [3022, 3400], y: [1889, 2267] },
    { type: "ocean", name: "渤海", x: [3400, 5100], y: [1700, 2500] },

    /* === 7. 道路网 === */
    // 秦直道
    { type: "road", name: "秦直道", x: [2522, 2531], y: [1889, 2559] },
    // 丝绸之路
    { type: "road", name: "丝绸之路", x: [567, 2456], y: [2578, 2588] },
    // 驰道 (向东)
    { type: "road", name: "东方驰道", x: [2399, 3211], y: [2559, 2569] },
    // 栈道 (入蜀)
    { type: "road", name: "金牛道", x: [2040, 2049], y: [2739, 2928] }
];

/* ================= 4. 城镇配置 (对应新坐标) ================= */
const WORLD_TOWNS_PART_1 = [
    // === 1. 关中 (帝都核心圈 Center: 2512, 2569) ===
    { id: "t_xianyang", name: "咸阳", level: "city", x: 2512, y: 2569, w: 151, h: 113, subRegion: "r_c_1_1", desc: "大秦帝都，渭水之北，八水绕长安。" },
    { id: "t_yong", name: "雍城", level: "city", x: 2342, y: 2569, w: 113, h: 113, subRegion: "r_c_1_1", desc: "秦国旧都，宗庙所在，穆公霸业之地。" },
    { id: "t_chencang", name: "陈仓", level: "town", x: 1150, y: 1360, w: 76, h: 76, subRegion: "r_c_1_1", desc: "关中西大门，明修栈道暗度陈仓。" },
    { id: "t_lantian", name: "蓝田", level: "town", x: 2607, y: 2739, w: 76, h: 76, subRegion: "r_c_1_1", desc: "美玉产地，军事重镇，秦楚蓝田之战。" },
    { id: "t_meixian", name: "白家庄", level: "village", x: 2267, y: 2720, w: 57, h: 57, subRegion: "r_c_1_1", desc: "武安君白起故里，民风彪悍，尚武之乡。" },
    { id: "t_liquan", name: "甘泉村", level: "village", x: 2456, y: 2399, w: 57, h: 57, subRegion: "r_c_1_1", desc: "泉水甘甜如醴，旁有甘泉宫遗址。" },

    // === 2. 豫州/三晋 (East of Guanzhong) ===
    { id: "t_hangu", name: "函谷关", level: "town", x: 2758, y: 2569, w: 94, h: 94, subRegion: "r_c_2_1", desc: "天下第一险关，锁钥重地，一夫当关。" },
    { id: "t_luoyang", name: "洛阳", level: "city", x: 2928, y: 2569, w: 132, h: 113, subRegion: "r_c_2_1", desc: "周室故都，天下之中，九鼎所在。" },
    { id: "t_xinzheng", name: "新郑", level: "town", x: 2984, y: 2739, w: 94, h: 94, subRegion: "r_c_2_1", desc: "韩国故都，法家申不害变法之地。" },
    { id: "t_handan", name: "邯郸", level: "city", x: 2984, y: 2399, w: 113, h: 113, subRegion: "r_c_2_0", desc: "赵国故都，胡服骑射，慷慨悲歌。" },
    { id: "t_jinyang", name: "晋阳", level: "city", x: 2796, y: 2267, w: 113, h: 113, subRegion: "r_c_2_0", desc: "赵氏龙兴之地，太原古城，汾水之畔。" },
    { id: "t_pingyang", name: "平阳", level: "town", x: 2644, y: 2418, w: 76, h: 76, subRegion: "r_c_2_1", desc: "尧都平阳，河东大郡。" },
    { id: "t_shangdang", name: "上党", level: "town", x: 2796, y: 2437, w: 76, h: 76, subRegion: "r_c_2_0", desc: "天下之脊，地势高险，长平之战前线。" },
    { id: "t_changping", name: "冤魂谷", level: "village", x: 2890, y: 2474, w: 57, h: 57, subRegion: "r_c_2_0", desc: "昔日长平古战场，夜半常闻兵戈之声。" },

    // === 3. 齐鲁 (Far East) ===
    { id: "t_linzi", name: "临淄", level: "city", x: 3306, y: 2418, w: 132, h: 113, subRegion: "r_e_0_1", desc: "齐国故都，稷下学宫，海内第一繁华。" },
    { id: "t_qufu", name: "曲阜", level: "town", x: 3173, y: 2607, w: 94, h: 94, subRegion: "r_e_0_1", desc: "鲁国故都，孔圣故里，礼乐之邦。" },
    { id: "t_langya", name: "琅琊", level: "town", x: 3400, y: 2607, w: 94, h: 94, subRegion: "r_e_0_1", desc: "东海胜境，秦皇勒石，徐福出海处。" },
    { id: "t_dengzhou", name: "芝罘渔村", level: "village", x: 3494, y: 2361, w: 57, h: 57, subRegion: "r_e_0_1", desc: "半岛顶端，始皇三次登临，海市蜃楼。" },
    { id: "t_taishan", name: "岱麓村", level: "village", x: 3117, y: 2493, w: 57, h: 57, subRegion: "r_e_0_1", desc: "泰山脚下的古村落，历代封禅必经之地。" },
    { id: "t_jimo", name: "即墨", level: "town", x: 3457, y: 2493, w: 76, h: 76, subRegion: "r_e_0_1", desc: "齐国东都，田单火牛阵复国。" }
];
const WORLD_TOWNS_PART_2 = [
    // === 4. 荆楚 (Central South) ===
    { id: "t_ying", name: "郢都", level: "city", x: 2550, y: 3022, w: 132, h: 113, subRegion: "r_c_1_2", desc: "楚国故都，长江要冲，云梦大泽之畔。" },
    { id: "t_shouchun", name: "寿春", level: "city", x: 2928, y: 2928, w: 113, h: 113, subRegion: "r_c_1_2", desc: "战国后期楚都，淮南重镇。" },
    { id: "t_wancheng", name: "宛城", level: "city", x: 2550, y: 2833, w: 113, h: 113, subRegion: "r_c_1_2", desc: "南阳大郡，冶铁中心，商贾云集。" },
    { id: "t_changsha", name: "长沙", level: "town", x: 2550, y: 3306, w: 94, h: 94, subRegion: "r_c_1_2", desc: "湘楚之地，屈贾之乡，星沙古城。" },
    { id: "t_jiangling", name: "江陵", level: "town", x: 2361, y: 3022, w: 76, h: 76, subRegion: "r_c_1_2", desc: "千里江陵一日还，兵家必争之地。" },
    { id: "t_chibi", name: "乌林寨", level: "village", x: 2739, y: 3060, w: 57, h: 57, subRegion: "r_c_1_2", desc: "长江边的小水寨，背靠乌林，地势险要。" },
    { id: "t_xiangyang", name: "襄阳", level: "town", x: 2418, y: 2871, w: 76, h: 76, subRegion: "r_c_1_2", desc: "南船北马，汉水重镇。" },

    // === 5. 吴越 (South East) ===
    { id: "t_wu", name: "吴城", level: "city", x: 3211, y: 2984, w: 132, h: 113, subRegion: "r_c_2_2", desc: "姑苏城外寒山寺，阖闾大城。" },
    { id: "t_kuaiji", name: "会稽", level: "city", x: 3211, y: 3173, w: 113, h: 113, subRegion: "r_c_2_2", desc: "越王勾践卧薪尝胆之地，兰亭集序。" },
    { id: "t_yuzhang", name: "豫章", level: "town", x: 2833, y: 3173, w: 76, h: 76, subRegion: "r_c_2_2", desc: "落霞与孤鹜齐飞，秋水共长天一色。" },
    { id: "t_jinling", name: "金陵", level: "town", x: 3060, y: 2871, w: 94, h: 94, subRegion: "r_c_2_2", desc: "虎踞龙盘，六朝古都，秦淮风月。" },
    { id: "t_guangling", name: "广陵", level: "town", x: 3211, y: 2796, w: 76, h: 76, subRegion: "r_c_2_2", desc: "烟花三月下扬州，广陵散绝响。" },

    // === 6. 巴蜀 (South West) ===
    { id: "t_chengdu", name: "成都", level: "city", x: 1983, y: 2928, w: 132, h: 113, subRegion: "r_c_0_2", desc: "天府之国，锦官城，沃野千里。" },
    { id: "t_jiangzhou", name: "江州", level: "town", x: 2172, y: 3022, w: 94, h: 94, subRegion: "r_c_0_2", desc: "巴国故地，两江交汇，山城重庆。" },
    { id: "t_hanzhong", name: "汉中", level: "town", x: 2078, y: 2739, w: 94, h: 94, subRegion: "r_c_0_2", desc: "汉水之滨，秦蜀咽喉，兵家必争。" },
    { id: "t_jianmen", name: "剑阁道", level: "village", x: 1983, y: 2796, w: 57, h: 57, subRegion: "r_c_0_2", desc: "蜀道难，难于上青天，一夫当关万夫莫开。" },
    { id: "t_zigong", name: "公井寨", level: "village", x: 1983, y: 3117, w: 57, h: 57, subRegion: "r_c_0_2", desc: "村中遍布盐井，卤水长流。" },

    // === 7. 岭南/西南 (Far South) ===
    { id: "t_panyu", name: "番禺", level: "city", x: 2739, y: 3778, w: 113, h: 113, subRegion: "r_s_2_1", desc: "岭南都会，海上丝路起点，广州。" },
    { id: "t_guilin", name: "桂林", level: "town", x: 2456, y: 3589, w: 76, h: 76, subRegion: "r_s_1_1", desc: "山水甲天下，灵渠沟通湘漓。" },
    { id: "t_cangwu", name: "苍梧", level: "town", x: 2607, y: 3683, w: 76, h: 76, subRegion: "r_s_1_1", desc: "舜帝南巡崩于苍梧之野。" },
    { id: "t_dian", name: "滇国", level: "town", x: 1700, y: 3400, w: 76, h: 76, subRegion: "r_s_1_1", desc: "彩云之南，青铜文明，滇池之畔。" },
    { id: "t_yelang", name: "夜郎", level: "town", x: 2078, y: 3400, w: 76, h: 76, subRegion: "r_s_1_1", desc: "崇山峻岭，夜郎自大，竹崇拜。" },
    { id: "t_jiaozhi", name: "交趾", level: "town", x: 2361, y: 4061, w: 76, h: 76, subRegion: "r_s_2_1", desc: "极南之地，象郡所在。" },
    { id: "t_hepu", name: "珠母村", level: "village", x: 2550, y: 3967, w: 57, h: 57, subRegion: "r_s_2_1", desc: "海边采珠人聚居之地，南珠产地。" }
];
const WORLD_TOWNS_PART_3 = [
    // === 7. 北境 (North of Guanzhong) ===
    // 九原
    { id: "t_jiuyuan", name: "九原", level: "city", x: 2456, y: 2078, w: 132, h: 113, subRegion: "r_c_0_0", desc: "秦直道北端，北击匈奴前线大本营。" },
    // 云中
    { id: "t_yunzhong", name: "云中", level: "town", x: 2644, y: 2078, w: 94, h: 94, subRegion: "r_c_0_0", desc: "魏尚守云中，匈奴不敢南下。" },
    // 雁门关
    { id: "t_yanmen", name: "雁门关", level: "town", x: 2833, y: 2116, w: 94, h: 94, subRegion: "r_c_2_0", desc: "中华第一关，飞将军李广驻地。" },
    // 代郡
    { id: "t_dai", name: "代郡", level: "town", x: 2984, y: 2116, w: 76, h: 76, subRegion: "r_c_2_0", desc: "赵国北境，李牧大破匈奴处。" },
    // 蓟城
    { id: "t_jicheng", name: "蓟城", level: "city", x: 3117, y: 2172, w: 132, h: 113, subRegion: "r_c_2_0", desc: "燕国故都，幽燕之地，北京。" },
    // 渔阳
    { id: "t_yuyang", name: "渔阳", level: "town", x: 3249, y: 2116, w: 76, h: 76, subRegion: "r_c_2_0", desc: "渔阳鼙鼓动地来，边防重地。" },
    // 右北平
    { id: "t_beiping", name: "右北平", level: "town", x: 3400, y: 2116, w: 76, h: 76, subRegion: "r_c_2_0", desc: "飞将军射石处，苦寒之地。" },

    // === 8. 辽东/东胡 (North East) ===
    // 襄平
    { id: "t_xiangping", name: "襄平", level: "city", x: 3589, y: 2172, w: 113, h: 113, subRegion: "r_ne_0_1", desc: "辽东郡治，公孙氏割据之地。" },
    // 扶余
    { id: "t_fuyu", name: "扶余", level: "town", x: 3589, y: 1889, w: 76, h: 76, subRegion: "r_ne_1_1", desc: "东北古国，松嫩平原。" },
    // 鲜卑山 -> 鲜卑帐 (部落营地)
    { id: "t_xianbei", name: "鲜卑帐", level: "village", x: 3306, y: 1794, w: 57, h: 57, subRegion: "r_ne_0_1", desc: "鲜卑族发源地，大兴安岭深处的游牧营地。" },
    // 肃慎 -> 挹娄寨 (古民族聚居点)
    { id: "t_sushen", name: "挹娄寨", level: "village", x: 3778, y: 1983, w: 57, h: 57, subRegion: "r_ne_2_1", desc: "白山黑水，女真先祖，穴居而野处。" },
    // 王险城
    { id: "t_chaoxian", name: "王险城", level: "town", x: 3627, y: 2361, w: 76, h: 76, subRegion: "r_ne_0_1", desc: "卫满朝鲜都城，平壤。" },

    // === 9. 漠北 (Far North) ===
    // 龙城
    { id: "t_longcheng", name: "龙城", level: "town", x: 2456, y: 1322, w: 94, h: 94, subRegion: "r_n_1_1", desc: "匈奴单于庭，祭天圣地，奇袭龙城。" },
    // 狼居胥 -> 封狼台 (祭坛遗址)
    { id: "t_langjuxu", name: "封狼台", level: "village", x: 2456, y: 1039, w: 57, h: 57, subRegion: "r_n_1_1", desc: "霍去病封狼居胥，大漠深处的祭天高台。" },
    // 北海 -> 牧羊地 (苏武牧羊处)
    { id: "t_beihai", name: "牧羊地", level: "village", x: 2644, y: 567, w: 57, h: 57, subRegion: "r_n_1_0", desc: "苏武牧羊十九年，苦寒之地的简陋羊圈。" },
    // 燕然山 -> 燕然寨
    { id: "t_yanran", name: "燕然寨", level: "village", x: 2078, y: 1228, w: 57, h: 57, subRegion: "r_n_1_1", desc: "勒石燕然，汉军留下的驻屯营寨。" },

    // === 10. 海外仙山 (Far East Ocean) ===
    // 蓬莱
    { id: "t_penglai", name: "蓬莱", level: "city", x: 4156, y: 2456, w: 113, h: 113, subRegion: "r_e_2_1", desc: "传说中的海外仙山，徐福东渡寻找长生药。" },
    // 瀛洲
    { id: "t_yingzhou", name: "瀛洲", level: "town", x: 4533, y: 2644, w: 76, h: 76, subRegion: "r_e_2_1", desc: "海外三仙山之一，虚无缥缈。" },
    // 方丈
    { id: "t_fangzhang", name: "方丈", level: "town", x: 4344, y: 2078, w: 76, h: 76, subRegion: "r_e_2_1", desc: "海外三仙山之一，不可接近。" }
];
const WORLD_TOWNS_PART_4 = [
    // === 10. 河西走廊 (West of Chencang/Guanzhong) ===
    { id: "t_wuwei", name: "武威", level: "town", x: 1794, y: 2456, w: 76, h: 76, subRegion: "r_w_2_1", desc: "凉州重镇，霍去病击败匈奴休屠王处。" },
    { id: "t_zhangye", name: "张掖", level: "town", x: 1624, y: 2418, w: 76, h: 76, subRegion: "r_w_2_1", desc: "张国臂掖，以通西域，黑水国所在。" },
    { id: "t_jiuquan", name: "酒泉", level: "town", x: 1473, y: 2380, w: 76, h: 76, subRegion: "r_w_2_1", desc: "城下有泉，其水若酒，霍去病倒酒入泉犒赏三军。" },
    { id: "t_dunhuang", name: "敦煌", level: "town", x: 1284, y: 2361, w: 94, h: 94, subRegion: "r_w_2_1", desc: "西出阳关无故人，莫高窟，丝路西端枢纽。" },
    { id: "t_yumenguan", name: "玉门屯", level: "village", x: 1171, y: 2267, w: 57, h: 57, subRegion: "r_w_2_1", desc: "羌笛何须怨杨柳，关下屯田的小村落。" },
    { id: "t_yangguan", name: "阳关屯", level: "village", x: 1171, y: 2456, w: 57, h: 57, subRegion: "r_w_2_1", desc: "西出阳关无故人，大漠边缘的歇脚地。" },

    // === 11. 西域南道 (Southern Route) ===
    { id: "t_ruoqiang", name: "若羌", level: "town", x: 1039, y: 2550, w: 76, h: 76, subRegion: "r_w_1_1", desc: "楼兰古国旧地，若羌国王城。" },
    { id: "t_qiemo", name: "且末", level: "town", x: 850, y: 2607, w: 76, h: 76, subRegion: "r_w_1_1", desc: "沙漠绿洲，且末国王城。" },
    { id: "t_niya", name: "精绝村", level: "village", x: 718, y: 2644, w: 57, h: 57, subRegion: "r_w_1_1", desc: "精绝古国遗民聚居地，五星出东方。" },
    { id: "t_yutian", name: "于阗", level: "town", x: 529, y: 2682, w: 76, h: 76, subRegion: "r_w_0_1", desc: "美玉之乡，佛教东传第一站，尉迟家族。" },
    { id: "t_shache", name: "莎车", level: "town", x: 340, y: 2720, w: 76, h: 76, subRegion: "r_w_0_1", desc: "叶尔羌河畔，莎车国王城。" },

    // === 12. 西域北道 (Northern Route) ===
    { id: "t_loulan", name: "楼兰", level: "town", x: 1039, y: 2229, w: 76, h: 76, subRegion: "r_w_1_1", desc: "罗布泊旁，丝路枢纽，黄沙百战穿金甲。" },
    { id: "t_yanqi", name: "焉耆", level: "town", x: 850, y: 2191, w: 76, h: 76, subRegion: "r_w_1_1", desc: "博斯腾湖畔，焉耆马闻名天下。" },
    { id: "t_qiuci", name: "龟兹", level: "city", x: 661, y: 2153, w: 94, h: 94, subRegion: "r_w_1_1", desc: "西域乐舞之都，鸠摩罗什故里。" },
    { id: "t_gumo", name: "姑墨", level: "town", x: 472, y: 2172, w: 76, h: 76, subRegion: "r_w_1_1", desc: "阿克苏，白水之城。" },
    { id: "t_shule", name: "疏勒", level: "town", x: 283, y: 2267, w: 94, h: 94, subRegion: "r_w_0_1", desc: "丝路交汇点，喀什，盘橐城。" },

    // === 13. 天山以北 (Far North West) ===
    { id: "t_wusun", name: "赤谷城", level: "town", x: 378, y: 1889, w: 76, h: 76, subRegion: "r_nw_2_0", desc: "乌孙国都，伊犁河谷，天马故乡。" },
    { id: "t_dayuan", name: "大宛", level: "city", x: 151, y: 2456, w: 94, h: 94, subRegion: "r_w_0_1", desc: "汗血宝马产地，贰师城。" }
];
// ================= 合并所有城镇数据 =================
// 注意：请将之前发送的 WORLD_TOWNS_PART_1, PART_2, PART_3 和上面的 PART_4
// 按顺序合并到最终的 WORLD_TOWNS 数组中。

const WORLD_TOWNS = [
    ...WORLD_TOWNS_PART_1,
    ...WORLD_TOWNS_PART_2,
    ...WORLD_TOWNS_PART_3,
    ...WORLD_TOWNS_PART_4
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