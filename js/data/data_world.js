// js/data/data_world.js
// 地图数据 v6.0：坐标修正(上北下南)、全境填充、新地形
console.log("加载 地图数据");

const MAP_SIZE = 2700;
const GRID_LARGE = 900;
const GRID_SMALL = 300;

/* ================= 1. 区域网格配置 (900x900) ================= */
// 坐标系：y=0 是最北边，y=2700 是最南边
const REGION_LAYOUT = [
    // --- 北部 (y: 0-900) ---
    { id: "r_nw", name: "北疆",   x: [0, 900], y: [0, 900], desc: "阿尔泰山，极北苦寒，游牧部落。" },
    { id: "r_n",  name: "漠北",   x: [900, 1800], y: [0, 900], desc: "匈奴王庭，狼居胥山，大漠风沙。" },
    { id: "r_ne", name: "东胡",   x: [1800, 2700], y: [0, 900], desc: "白山黑水，鲜卑乌桓，林海雪原。" },

    // --- 中部 (y: 900-1800) ---
    { id: "r_w",  name: "西域",   x: [0, 900], y: [900, 1800], desc: "大漠孤烟，丝路驼铃，三十六国。" },
    { id: "r_c",  name: "中原",   x: [900, 1800], y: [900, 1800], desc: "大秦帝畿，天下之中，沃野千里。" },
    { id: "r_e",  name: "东海",   x: [1800, 2700], y: [900, 1800], desc: "齐鲁大地，蓬莱仙境，海客谈瀛。" },

    // --- 南部 (y: 1800-2700) ---
    { id: "r_sw", name: "西南夷", x: [0, 900], y: [1800, 2700], desc: "崇山峻岭，夜郎古国，瘴气弥漫。" },
    { id: "r_s",  name: "百越",   x: [900, 1800], y: [1800, 2700], desc: "岭南湿热，蛮荒之地，奇珍异兽。" },
    { id: "r_se", name: "南海",   x: [1800, 2700], y: [1800, 2700], desc: "万里波涛，岛礁罗列，鲛人传说。" }
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
    /* === 1. 北方边疆 (y: 0-900) === */
    // 瀚海 (贝加尔湖)
    { type: "river", name: "北海", x: [1200, 1500], y: [100, 200] },
    // 蒙古大草原
    { type: "grass", name: "漠北草原", x: [800, 1600], y: [200, 600] },
    // 东北林海
    { type: "mountain", name: "大兴安岭", x: [1600, 1700], y: [100, 800] },
    { type: "grass", name: "呼伦贝尔", x: [1400, 1600], y: [200, 500] },

    /* === 2. 西北/西域 (y: 900附近) === */
    // 塔克拉玛干沙漠
    { type: "desert", name: "塔克拉玛干", x: [200, 800], y: [1000, 1400] },
    // 天山
    { type: "mountain", name: "天山", x: [100, 800], y: [900, 1000] },
    // 昆仑山
    { type: "mountain", name: "昆仑山", x: [100, 900], y: [1400, 1500] },
    // 祁连山
    { type: "mountain", name: "祁连山", x: [700, 1000], y: [1200, 1300] },
    // 河西走廊 (绿洲路)
    { type: "grass", name: "河西牧场", x: [800, 1100], y: [1250, 1350] },

    /* === 3. 中原核心 (y: 900-1500) === */
    // 黄河几字弯 (y轴反转调整)
    { type: "river", name: "黄河", x: [1000, 1050], y: [1000, 1200] }, // 上游
    { type: "river", name: "黄河", x: [1050, 1550], y: [1000, 1050] }, // 河套顶端
    { type: "river", name: "黄河", x: [1500, 1550], y: [1050, 1350] }, // 晋陕峡谷
    { type: "river", name: "黄河", x: [1550, 1800], y: [1300, 1350] }, // 下游入海

    // 秦岭
    { type: "mountain", name: "秦岭", x: [1000, 1400], y: [1380, 1450] },
    // 渭水 (关中)
    { type: "river", name: "渭水", x: [1100, 1450], y: [1350, 1380] },

    // 太行山
    { type: "mountain", name: "太行山", x: [1450, 1500], y: [1100, 1300] },

    /* === 4. 南方/长江 (y: 1500-1800) === */
    // 长江
    { type: "river", name: "长江", x: [900, 1800], y: [1550, 1650] },
    // 洞庭/鄱阳
    { type: "river", name: "云梦泽", x: [1300, 1450], y: [1650, 1750] },
    // 巫山
    { type: "mountain", name: "巫山", x: [1150, 1200], y: [1500, 1600] },

    /* === 5. 岭南/西南 (y: 1800+) === */
    // 五岭
    { type: "mountain", name: "五岭", x: [1100, 1500], y: [1800, 1850] },
    // 珠江
    { type: "river", name: "珠江", x: [1200, 1500], y: [1900, 1950] },
    // 西南大山
    { type: "mountain", name: "横断山脉", x: [500, 900], y: [1500, 2000] },

    /* === 6. 大海 (边缘) === */
    // 东海
    { type: "ocean", name: "东海", x: [1800, 2700], y: [900, 2000] },
    // 南海
    { type: "ocean", name: "南海", x: [0, 2700], y: [2000, 2700] },
    // 渤海
    { type: "ocean", name: "渤海", x: [1600, 1800], y: [1000, 1200] },

    /* === 7. 道路网 === */
    // 秦直道 (咸阳向北)
    { type: "road", name: "秦直道", x: [1330, 1350], y: [1000, 1350] },
    // 丝绸之路
    { type: "road", name: "丝绸之路", x: [300, 1300], y: [1350, 1380] },
    // 驰道 (向东)
    { type: "road", name: "东方驰道", x: [1350, 1700], y: [1350, 1370] },
    // 栈道 (入蜀)
    { type: "road", name: "金牛道", x: [1050, 1150], y: [1400, 1550] }
];

/* ================= 4. 城镇配置 (对应新坐标) ================= */
const WORLD_TOWNS_PART_1 = [
    // === 1. 关中 (帝都核心圈 Center: 1330, 1360) ===
    // 咸阳 (Center)
    { id: "t_xianyang", name: "咸阳", level: "city", x: 1330, y: 1360, w: 80, h: 60, desc: "大秦帝都，渭水之北，八水绕长安。" },
    // 雍城 (West of Xianyang)
    { id: "t_yong",     name: "雍城", level: "city", x: 1240, y: 1360, w: 60, h: 60, desc: "秦国旧都，宗庙所在，穆公霸业之地。" },
    // 陈仓 (West of Yong)
    { id: "t_chencang", name: "陈仓", level: "town", x: 1150, y: 1360, w: 40, h: 40, desc: "关中西大门，明修栈道暗度陈仓。" },
    // 蓝田 (South East of Xianyang)
    { id: "t_lantian",  name: "蓝田", level: "town", x: 1380, y: 1450, w: 40, h: 40, desc: "美玉产地，军事重镇，秦楚蓝田之战。" },
    // 郿县 -> 白家庄 (村级就要像个村子，白起故里)
    { id: "t_meixian",  name: "白家庄", level: "village", x: 1200, y: 1440, w: 30, h: 30, desc: "武安君白起故里，民风彪悍，尚武之乡。" },
    // 醴泉 -> 甘泉村 (避暑行宫旁的小村)
    { id: "t_liquan",   name: "甘泉村", level: "village", x: 1300, y: 1270, w: 30, h: 30, desc: "泉水甘甜如醴，旁有甘泉宫遗址。" },

    // === 2. 豫州/三晋 (East of Guanzhong) ===
    // 函谷关
    { id: "t_hangu",    name: "函谷关", level: "town", x: 1460, y: 1360, w: 50, h: 50, desc: "天下第一险关，锁钥重地，一夫当关。" },
    // 洛阳
    { id: "t_luoyang",  name: "洛阳", level: "city", x: 1550, y: 1360, w: 70, h: 60, desc: "周室故都，天下之中，九鼎所在。" },
    // 新郑
    { id: "t_xinzheng", name: "新郑", level: "town", x: 1580, y: 1450, w: 50, h: 50, desc: "韩国故都，法家申不害变法之地。" },
    // 邯郸
    { id: "t_handan",   name: "邯郸", level: "city", x: 1580, y: 1270, w: 60, h: 60, desc: "赵国故都，胡服骑射，慷慨悲歌。" },
    // 晋阳
    { id: "t_jinyang",  name: "晋阳", level: "city", x: 1480, y: 1200, w: 60, h: 60, desc: "赵氏龙兴之地，太原古城，汾水之畔。" },
    // 平阳
    { id: "t_pingyang", name: "平阳", level: "town", x: 1400, y: 1280, w: 40, h: 40, desc: "尧都平阳，河东大郡。" },
    // 上党
    { id: "t_shangdang",name: "上党", level: "town", x: 1480, y: 1290, w: 40, h: 40, desc: "天下之脊，地势高险，长平之战前线。" },
    // 长平 -> 冤魂谷 (古战场改为村级聚集点)
    { id: "t_changping",name: "冤魂谷", level: "village", x: 1530, y: 1310, w: 30, h: 30, desc: "昔日长平古战场，夜半常闻兵戈之声。" },

    // === 3. 齐鲁 (Far East) ===
    // 临淄
    { id: "t_linzi",    name: "临淄", level: "city", x: 1750, y: 1280, w: 70, h: 60, desc: "齐国故都，稷下学宫，海内第一繁华。" },
    // 曲阜
    { id: "t_qufu",     name: "曲阜", level: "town", x: 1680, y: 1380, w: 50, h: 50, desc: "鲁国故都，孔圣故里，礼乐之邦。" },
    // 琅琊
    { id: "t_langya",   name: "琅琊", level: "town", x: 1800, y: 1380, w: 50, h: 50, desc: "东海胜境，秦皇勒石，徐福出海处。" },
    // 登州(唐代名) -> 芝罘渔村 (秦代名胜)
    { id: "t_dengzhou", name: "芝罘渔村", level: "village", x: 1850, y: 1250, w: 30, h: 30, desc: "半岛顶端，始皇三次登临，海市蜃楼。" },
    // 泰安(明代名) -> 岱麓村 (泰山脚下)
    { id: "t_taishan",  name: "岱麓村", level: "village", x: 1650, y: 1320, w: 30, h: 30, desc: "泰山脚下的古村落，历代封禅必经之地。" },
    // 即墨
    { id: "t_jimo",     name: "即墨", level: "town", x: 1830, y: 1320, w: 40, h: 40, desc: "齐国东都，田单火牛阵复国。" }
];
const WORLD_TOWNS_PART_2 = [
    // === 4. 荆楚 (Central South) ===
    // 郢都
    { id: "t_ying",     name: "郢都", level: "city", x: 1350, y: 1600, w: 70, h: 60, desc: "楚国故都，长江要冲，云梦大泽之畔。" },
    // 寿春
    { id: "t_shouchun", name: "寿春", level: "city", x: 1550, y: 1550, w: 60, h: 60, desc: "战国后期楚都，淮南重镇。" },
    // 宛城
    { id: "t_wancheng", name: "宛城", level: "city", x: 1350, y: 1500, w: 60, h: 60, desc: "南阳大郡，冶铁中心，商贾云集。" },
    // 长沙
    { id: "t_changsha", name: "长沙", level: "town", x: 1350, y: 1750, w: 50, h: 50, desc: "湘楚之地，屈贾之乡，星沙古城。" },
    // 江陵
    { id: "t_jiangling",name: "江陵", level: "town", x: 1250, y: 1600, w: 40, h: 40, desc: "千里江陵一日还，兵家必争之地。" },
    // 赤壁 -> 乌林寨 (赤壁对岸曹操扎营处，更像村寨名)
    { id: "t_chibi",    name: "乌林寨", level: "village", x: 1450, y: 1620, w: 30, h: 30, desc: "长江边的小水寨，背靠乌林，地势险要。" },
    // 襄阳
    { id: "t_xiangyang",name: "襄阳", level: "town", x: 1280, y: 1520, w: 40, h: 40, desc: "南船北马，汉水重镇。" },

    // === 5. 吴越 (South East) ===
    // 吴城
    { id: "t_wu",       name: "吴城", level: "city", x: 1700, y: 1580, w: 70, h: 60, desc: "姑苏城外寒山寺，阖闾大城。" },
    // 会稽
    { id: "t_kuaiji",   name: "会稽", level: "city", x: 1700, y: 1680, w: 60, h: 60, desc: "越王勾践卧薪尝胆之地，兰亭集序。" },
    // 豫章
    { id: "t_yuzhang",  name: "豫章", level: "town", x: 1500, y: 1680, w: 40, h: 40, desc: "落霞与孤鹜齐飞，秋水共长天一色。" },
    // 金陵
    { id: "t_jinling",  name: "金陵", level: "town", x: 1620, y: 1520, w: 50, h: 50, desc: "虎踞龙盘，六朝古都，秦淮风月。" },
    // 广陵
    { id: "t_guangling",name: "广陵", level: "town", x: 1700, y: 1480, w: 40, h: 40, desc: "烟花三月下扬州，广陵散绝响。" },

    // === 6. 巴蜀 (South West) ===
    // 成都
    { id: "t_chengdu",  name: "成都", level: "city", x: 1050, y: 1550, w: 70, h: 60, desc: "天府之国，锦官城，沃野千里。" },
    // 江州
    { id: "t_jiangzhou",name: "江州", level: "town", x: 1150, y: 1600, w: 50, h: 50, desc: "巴国故地，两江交汇，山城重庆。" },
    // 汉中
    { id: "t_hanzhong", name: "汉中", level: "town", x: 1100, y: 1450, w: 50, h: 50, desc: "汉水之滨，秦蜀咽喉，兵家必争。" },
    // 剑门 -> 剑阁道 (古道旁的小驿站)
    { id: "t_jianmen",  name: "剑阁道", level: "village", x: 1050, y: 1480, w: 30, h: 30, desc: "蜀道难，难于上青天，一夫当关万夫莫开。" },
    // 自贡(现代名) -> 公井寨 (古名公井/富世)
    { id: "t_zigong",   name: "公井寨", level: "village", x: 1050, y: 1650, w: 30, h: 30, desc: "村中遍布盐井，卤水长流。" },

    // === 7. 岭南/西南 (Far South) ===
    // 番禺
    { id: "t_panyu",    name: "番禺", level: "city", x: 1450, y: 2000, w: 60, h: 60, desc: "岭南都会，海上丝路起点，广州。" },
    // 桂林
    { id: "t_guilin",   name: "桂林", level: "town", x: 1300, y: 1900, w: 40, h: 40, desc: "山水甲天下，灵渠沟通湘漓。" },
    // 苍梧
    { id: "t_cangwu",   name: "苍梧", level: "town", x: 1380, y: 1950, w: 40, h: 40, desc: "舜帝南巡崩于苍梧之野。" },
    // 滇国
    { id: "t_dian",     name: "滇国", level: "town", x: 900, y: 1800, w: 40, h: 40, desc: "彩云之南，青铜文明，滇池之畔。" },
    // 夜郎
    { id: "t_yelang",   name: "夜郎", level: "town", x: 1100, y: 1800, w: 40, h: 40, desc: "崇山峻岭，夜郎自大，竹崇拜。" },
    // 交趾
    { id: "t_jiaozhi",  name: "交趾", level: "town", x: 1250, y: 2150, w: 40, h: 40, desc: "极南之地，象郡所在。" },
    // 合浦 -> 珠母村 (采珠人的村落)
    { id: "t_hepu",     name: "珠母村", level: "village", x: 1350, y: 2100, w: 30, h: 30, desc: "海边采珠人聚居之地，南珠产地。" }
];
const WORLD_TOWNS_PART_3 = [
    // === 7. 北境 (North of Guanzhong) ===
    // 九原
    { id: "t_jiuyuan",  name: "九原", level: "city", x: 1300, y: 1100, w: 70, h: 60, desc: "秦直道北端，北击匈奴前线大本营。" },
    // 云中
    { id: "t_yunzhong", name: "云中", level: "town", x: 1400, y: 1100, w: 50, h: 50, desc: "魏尚守云中，匈奴不敢南下。" },
    // 雁门关
    { id: "t_yanmen",   name: "雁门关", level: "town", x: 1500, y: 1120, w: 50, h: 50, desc: "中华第一关，飞将军李广驻地。" },
    // 代郡
    { id: "t_dai",      name: "代郡", level: "town", x: 1580, y: 1120, w: 40, h: 40, desc: "赵国北境，李牧大破匈奴处。" },
    // 蓟城
    { id: "t_jicheng",  name: "蓟城", level: "city", x: 1650, y: 1150, w: 70, h: 60, desc: "燕国故都，幽燕之地，北京。" },
    // 渔阳
    { id: "t_yuyang",   name: "渔阳", level: "town", x: 1720, y: 1120, w: 40, h: 40, desc: "渔阳鼙鼓动地来，边防重地。" },
    // 右北平
    { id: "t_beiping",  name: "右北平", level: "town", x: 1800, y: 1120, w: 40, h: 40, desc: "飞将军射石处，苦寒之地。" },

    // === 8. 辽东/东胡 (North East) ===
    // 襄平
    { id: "t_xiangping",name: "襄平", level: "city", x: 1900, y: 1150, w: 60, h: 60, desc: "辽东郡治，公孙氏割据之地。" },
    // 扶余
    { id: "t_fuyu",     name: "扶余", level: "town", x: 1900, y: 1000, w: 40, h: 40, desc: "东北古国，松嫩平原。" },
    // 鲜卑山 -> 鲜卑帐 (部落营地)
    { id: "t_xianbei",  name: "鲜卑帐", level: "village", x: 1750, y: 950, w: 30, h: 30, desc: "鲜卑族发源地，大兴安岭深处的游牧营地。" },
    // 肃慎 -> 挹娄寨 (古民族聚居点)
    { id: "t_sushen",   name: "挹娄寨", level: "village", x: 2000, y: 1050, w: 30, h: 30, desc: "白山黑水，女真先祖，穴居而野处。" },
    // 王险城
    { id: "t_chaoxian", name: "王险城", level: "town", x: 1920, y: 1250, w: 40, h: 40, desc: "卫满朝鲜都城，平壤。" },

    // === 9. 漠北 (Far North) ===
    // 龙城
    { id: "t_longcheng",name: "龙城", level: "town", x: 1300, y: 700, w: 50, h: 50, desc: "匈奴单于庭，祭天圣地，奇袭龙城。" },
    // 狼居胥 -> 封狼台 (祭坛遗址)
    { id: "t_langjuxu", name: "封狼台", level: "village", x: 1300, y: 550, w: 30, h: 30, desc: "霍去病封狼居胥，大漠深处的祭天高台。" },
    // 北海 -> 牧羊地 (苏武牧羊处)
    { id: "t_beihai",   name: "牧羊地", level: "village", x: 1400, y: 300, w: 30, h: 30, desc: "苏武牧羊十九年，苦寒之地的简陋羊圈。" },
    // 燕然山 -> 燕然寨
    { id: "t_yanran",   name: "燕然寨", level: "village", x: 1100, y: 650, w: 30, h: 30, desc: "勒石燕然，汉军留下的驻屯营寨。" },

    // === 10. 海外仙山 (Far East Ocean) ===
    // 蓬莱
    { id: "t_penglai",  name: "蓬莱", level: "city", x: 2200, y: 1300, w: 60, h: 60, desc: "传说中的海外仙山，徐福东渡寻找长生药。" },
    // 瀛洲
    { id: "t_yingzhou", name: "瀛洲", level: "town", x: 2400, y: 1400, w: 40, h: 40, desc: "海外三仙山之一，虚无缥缈。" },
    // 方丈
    { id: "t_fangzhang",name: "方丈", level: "town", x: 2300, y: 1100, w: 40, h: 40, desc: "海外三仙山之一，不可接近。" }
];
const WORLD_TOWNS_PART_4 = [
    // === 10. 河西走廊 (West of Chencang/Guanzhong) ===
    // 武威 (汉名，秦时为休屠/匈奴地，保留武威辨识度高)
    { id: "t_wuwei",    name: "武威", level: "town", x: 950, y: 1300, w: 40, h: 40, desc: "凉州重镇，霍去病击败匈奴休屠王处。" },
    // 张掖
    { id: "t_zhangye",  name: "张掖", level: "town", x: 860, y: 1280, w: 40, h: 40, desc: "张国臂掖，以通西域，黑水国所在。" },
    // 酒泉
    { id: "t_jiuquan",  name: "酒泉", level: "town", x: 780, y: 1260, w: 40, h: 40, desc: "城下有泉，其水若酒，霍去病倒酒入泉犒赏三军。" },
    // 敦煌
    { id: "t_dunhuang", name: "敦煌", level: "town", x: 680, y: 1250, w: 50, h: 50, desc: "西出阳关无故人，莫高窟，丝路西端枢纽。" },
    // 玉门关 -> 玉门屯 (关隘旁的屯兵村)
    { id: "t_yumenguan",name: "玉门屯", level: "village", x: 620, y: 1200, w: 30, h: 30, desc: "羌笛何须怨杨柳，关下屯田的小村落。" },
    // 阳关 -> 阳关屯
    { id: "t_yangguan", name: "阳关屯", level: "village", x: 620, y: 1300, w: 30, h: 30, desc: "西出阳关无故人，大漠边缘的歇脚地。" },

    // === 11. 西域南道 (Southern Route) ===
    // 若羌
    { id: "t_ruoqiang", name: "若羌", level: "town", x: 550, y: 1350, w: 40, h: 40, desc: "楼兰古国旧地，若羌国王城。" },
    // 且末
    { id: "t_qiemo",    name: "且末", level: "town", x: 450, y: 1380, w: 40, h: 40, desc: "沙漠绿洲，且末国王城。" },
    // 尼雅 -> 精绝村 (小说/历史常用名)
    { id: "t_niya",     name: "精绝村", level: "village", x: 380, y: 1400, w: 30, h: 30, desc: "精绝古国遗民聚居地，五星出东方。" },
    // 于阗
    { id: "t_yutian",   name: "于阗", level: "town", x: 280, y: 1420, w: 40, h: 40, desc: "美玉之乡，佛教东传第一站，尉迟家族。" },
    // 莎车
    { id: "t_shache",   name: "莎车", level: "town", x: 180, y: 1440, w: 40, h: 40, desc: "叶尔羌河畔，莎车国王城。" },

    // === 12. 西域北道 (Northern Route) ===
    // 楼兰
    { id: "t_loulan",   name: "楼兰", level: "town", x: 550, y: 1180, w: 40, h: 40, desc: "罗布泊旁，丝路枢纽，黄沙百战穿金甲。" },
    // 焉耆
    { id: "t_yanqi",    name: "焉耆", level: "town", x: 450, y: 1160, w: 40, h: 40, desc: "博斯腾湖畔，焉耆马闻名天下。" },
    // 龟兹
    { id: "t_qiuci",    name: "龟兹", level: "city", x: 350, y: 1140, w: 50, h: 50, desc: "西域乐舞之都，鸠摩罗什故里。" },
    // 姑墨
    { id: "t_gumo",     name: "姑墨", level: "town", x: 250, y: 1150, w: 40, h: 40, desc: "阿克苏，白水之城。" },
    // 疏勒
    { id: "t_shule",    name: "疏勒", level: "town", x: 150, y: 1200, w: 50, h: 50, desc: "丝路交汇点，喀什，盘橐城。" },

    // === 13. 天山以北 (Far North West) ===
    // 赤谷城
    { id: "t_wusun",    name: "赤谷城", level: "town", x: 200, y: 1000, w: 40, h: 40, desc: "乌孙国都，伊犁河谷，天马故乡。" },
    // 大宛
    { id: "t_dayuan",   name: "大宛", level: "city", x: 80, y: 1300, w: 50, h: 50, desc: "汗血宝马产地，贰师城。" }
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
    const rX = Math.floor(x / 900);
    const rY = Math.floor(y / 900);
    const region = REGION_LAYOUT.find(r =>
        x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]
    );
    const regionName = region ? region.name : "荒野";

    const sX = Math.floor((x % 900) / 300);
    const sY = Math.floor((y % 900) / 300);
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