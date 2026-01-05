// js/data/data_world.js
// 地图数据 v4.2：精准对齐、桥梁贯通、全境覆盖
console.log("加载 地图数据");

const MAP_SIZE = 2700;
const GRID_LARGE = 900;
const GRID_SMALL = 300;

/* ================= 1. 区域网格配置 (900x900) ================= */
const REGION_LAYOUT = [
    // --- 南部 (y: 0-900) ---
    { id: "r_sw", name: "西南夷", x: [0, 900], y: [0, 900], desc: "崇山峻岭，夜郎古国" },
    { id: "r_s",  name: "百越",   x: [900, 1800], y: [0, 900], desc: "岭南瘴气，蛮荒之地" },
    { id: "r_se", name: "南海",   x: [1800, 2700], y: [0, 900], desc: "万里波涛，岛礁罗列" },

    // --- 中部 (y: 900-1800) ---
    { id: "r_w",  name: "西域",   x: [0, 900], y: [900, 1800], desc: "大漠孤烟，丝路驼铃" },
    { id: "r_c",  name: "中原",   x: [900, 1800], y: [900, 1800], desc: "大秦帝畿，天下之中" },
    { id: "r_e",  name: "东海",   x: [1800, 2700], y: [900, 1800], desc: "齐鲁大地，蓬莱仙境" },

    // --- 北部 (y: 1800-2700) ---
    { id: "r_nw", name: "北疆",   x: [0, 900], y: [1800, 2700], desc: "阿尔泰山，极北苦寒" },
    { id: "r_n",  name: "漠北",   x: [900, 1800], y: [1800, 2700], desc: "匈奴王庭，狼居胥山" },
    { id: "r_ne", name: "东胡",   x: [1800, 2700], y: [1800, 2700], desc: "白山黑水，鲜卑乌桓" }
];

/* ================= 2. 子区域名称映射 (300x300) ================= */
// 格式："大区ID_子区X_子区Y" (子区坐标0-2)
const SUB_REGION_NAMES = {
    // 中原 (r_c) 900-1800
    "r_c_0_0": "巴蜀", "r_c_1_0": "荆楚", "r_c_2_0": "吴越",
    "r_c_0_1": "陇西", "r_c_1_1": "关中", "r_c_2_1": "中原腹地",
    "r_c_0_2": "河套", "r_c_1_2": "北地", "r_c_2_2": "燕赵",

    // 西域 (r_w) 0-900
    "r_w_2_1": "河西走廊", "r_w_1_1": "流沙", "r_w_0_1": "葱岭",

    // 东海 (r_e) 1800-2700
    "r_e_0_1": "齐鲁", "r_e_1_1": "东海", "r_e_2_1": "蓬莱海域"
};

/* ================= 3. 地形配置 (精准对齐版) ================= */
const TERRAIN_ZONES = [
    /* === 阻挡层：山脉 === */
    { type: "mountain", name: "昆仑山", x: [100, 800], y: [1100, 1200] },
    { type: "mountain", name: "天山",   x: [100, 700], y: [1600, 1680] },
    // 秦岭：位于咸阳(y=1360)以南，渭水(y=1320)以南，设为 y=1150-1250
    { type: "mountain", name: "秦岭",   x: [950, 1300], y: [1150, 1250] },
    // 太行山：南北走向，阻隔山西与河北
    { type: "mountain", name: "太行山", x: [1450, 1500], y: [1400, 1600] },

    /* === 流动层：水系 === */
    // 1. 渭水：横贯关中，位于咸阳城正南
    // y范围 [1320, 1350] (宽30)，咸阳在 y=1360，中间留 10px 河滩
    { type: "river", name: "渭水", x: [1100, 1480], y: [1320, 1350] },

    // 2. 黄河几字弯
    // 西段南北向 (陇西东侧)
    { type: "river", name: "黄河", x: [1050, 1100], y: [1400, 1600] },
    // 北段东西向 (河套)
    { type: "river", name: "黄河", x: [1100, 1500], y: [1600, 1640] },
    // 东段南北向 (晋陕峡谷，太行山西侧) - 关键点：蒲津渡位置
    // x范围 [1500, 1540] (宽40)
    { type: "river", name: "黄河", x: [1500, 1540], y: [1350, 1600] },
    // 下游东西向 (入海)
    { type: "river", name: "黄河", x: [1540, 1800], y: [1350, 1390] },

    // 3. 长江
    { type: "river", name: "长江", x: [1000, 1800], y: [1050, 1100] },

    /* === 连接层：桥梁 (必须在水之上，连接路与城) === */
    // [修正] 渭水桥：连接渭水南岸与咸阳城
    // 河流 y: 1320-1350 | 咸阳 y: 1360
    // 桥梁 y: 1310 (南岸路头) -> 1360 (城门口)
    // 咸阳中心 x ≈ 1370 (1330+80/2)，桥宽 20
    { type: "bridge", name: "渭水桥", x: [1360, 1380], y: [1310, 1360], desc: "横跨渭水，直通帝都" },

    // [修正] 蒲津渡：横跨黄河东段 (x: 1500-1540)
    // 桥梁 x: 1490 (西岸) -> 1550 (东岸)
    // y 位置设在 1380 左右
    { type: "bridge", name: "蒲津渡", x: [1490, 1550], y: [1370, 1390], desc: "天下黄河第一桥，铁牛镇守" },

    /* === 通行层：道路 (宽15) === */
    // 1. 秦直道：从咸阳北门 (1370, 1420) 直达九原 (1370, 1650)
    // 避开咸阳城内部，从城上沿开始画
    { type: "road", name: "秦直道", x: [1365, 1380], y: [1420, 1650] },

    // 2. 丝绸之路：从咸阳西门 (1330, 1390) 向西延伸
    // 穿过陈仓 -> 陇西 -> 河西走廊
    { type: "road", name: "丝路东段", x: [1100, 1330], y: [1355, 1370] },
    { type: "road", name: "河西走廊", x: [800, 1100], y: [1360, 1375] }, // 敦煌方向

    // 3. 东方驰道：出函谷关 (1450, 1350) 向东
    // 连接 咸阳 -> 函谷关
    { type: "road", name: "函谷道", x: [1410, 1450], y: [1360, 1375] }, // 咸阳东到函谷
    // 函谷关 -> 洛阳 -> 临淄
    { type: "road", name: "东方驰道", x: [1500, 1750], y: [1360, 1375] },

    // 4. 秦蜀栈道：翻越秦岭，连接陈仓与汉中
    // 纵向穿越秦岭 (y: 1150-1250)
    { type: "road", name: "陈仓道", x: [1150, 1165], y: [1150, 1330] }
];

/* ================= 4. 城镇配置 ================= */
// 城镇坐标 (x, y) 指左上角。需与道路端点吻合。
// 咸阳：x:1330, y:1360, w:80, h:60 -> 中心(1370, 1390) -> 底部y:1420
const WORLD_TOWNS = [
    // === 核心关中 ===
    // 渭水桥北端接 (1370, 1360)，直道起点接 (1370, 1420)
    { id: "t_xianyang", name: "咸阳", level: "city", x: 1330, y: 1360, w: 80, h: 60, desc: "大秦帝都，渭水之北" },

    // 函谷关：扼守关中东大门 (道路 1450 处)
    { id: "t_hangu",    name: "函谷关", level: "town", x: 1450, y: 1350, w: 50, h: 50, desc: "天险雄关" },

    // 雍城：咸阳以西
    { id: "t_yong",     name: "雍城", level: "city", x: 1200, y: 1350, w: 60, h: 60, desc: "秦国旧都" },

    // 陈仓：栈道起点
    { id: "t_chencang", name: "陈仓", level: "town", x: 1120, y: 1340, w: 40, h: 40, desc: "明修栈道之地" },

    // === 中原 ===
    // 洛阳：函谷关以东
    { id: "t_luoyang",  name: "洛阳", level: "city", x: 1500, y: 1350, w: 70, h: 60, desc: "周室故都" },
    // 邯郸：太行山东麓
    { id: "t_handan",   name: "邯郸", level: "city", x: 1540, y: 1450, w: 60, h: 60, desc: "赵国故都" },
    // 大梁：黄河南岸
    { id: "t_daliang",  name: "大梁", level: "city", x: 1560, y: 1340, w: 60, h: 60, desc: "魏国故都" },

    // === 齐鲁 ===
    // 临淄：驰道东端
    { id: "t_linzi",    name: "临淄", level: "city", x: 1650, y: 1360, w: 70, h: 60, desc: "海内繁华之地" },

    // === 北境 ===
    // 九原：直道终点 (1370, 1650)
    { id: "t_jiuyuan",  name: "九原", level: "city", x: 1340, y: 1650, w: 60, h: 60, desc: "北击匈奴前线" },
    // 雁门关
    { id: "t_yanmen",   name: "雁门关", level: "town", x: 1420, y: 1600, w: 40, h: 40, desc: "飞将军驻地" },

    // === 西域 ===
    // 敦煌：丝路西端
    { id: "t_dunhuang", name: "敦煌", level: "town", x: 800, y: 1350, w: 50, h: 50, desc: "西出阳关" },
    { id: "t_wuwei",    name: "武威", level: "town", x: 950, y: 1350, w: 40, h: 40, desc: "凉州重镇" },

    // === 巴蜀 ===
    // 汉中：栈道南端
    { id: "t_hanzhong", name: "汉中", level: "town", x: 1150, y: 1150, w: 50, h: 50, desc: "汉水之滨" },
    { id: "t_chengdu",  name: "成都", level: "city", x: 1000, y: 1050, w: 70, h: 60, desc: "天府之国" },

    // === 荆楚/吴越 ===
    { id: "t_ying",     name: "郢都", level: "city", x: 1300, y: 1080, w: 60, h: 60, desc: "楚国故都" },
    { id: "t_kuaiji",   name: "会稽", level: "city", x: 1700, y: 1050, w: 60, h: 60, desc: "越王勾践之地" }
];

// 辅助函数：获取当前位置的层级描述
function getLocationChain(x, y) {
    // 1. 查找大区
    const rX = Math.floor(x / 900);
    const rY = Math.floor(y / 900);
    const region = REGION_LAYOUT.find(r =>
        x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]
    );
    const regionName = region ? region.name : "荒野";

    // 2. 查找子区
    const sX = Math.floor((x % 900) / 300);
    const sY = Math.floor((y % 900) / 300);
    let subName = "野外";
    if (region) {
        // 构建 Key: "r_c_1_1"
        const key = `${region.id}_${sX}_${sY}`;
        if (SUB_REGION_NAMES[key]) subName = SUB_REGION_NAMES[key];
    }

    // 3. 查找具体地点 (优先城镇 > 桥梁 > 道路/河流/山脉)
    let localName = "";

    // 城镇检测
    const town = WORLD_TOWNS.find(t => x >= t.x && x <= t.x+t.w && y >= t.y && y <= t.y+t.h);
    if (town) {
        localName = town.name;
    } else {
        // 地形检测
        // 倒序查找，确保 Bridge (如果定义在后面) 覆盖 River
        for (let i = TERRAIN_ZONES.length - 1; i >= 0; i--) {
            const z = TERRAIN_ZONES[i];
            if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) {
                localName = z.name;
                break;
            }
        }
    }

    // 拼接链条
    let chain = regionName;
    if (subName !== "野外") chain += ` - ${subName}`;
    if (localName) chain += ` - ${localName}`;

    return chain;
}

window.getLocationChain = getLocationChain;
window.WORLD_TOWNS = WORLD_TOWNS;
window.TERRAIN_ZONES = TERRAIN_ZONES;
window.REGION_LAYOUT = REGION_LAYOUT;