// 工具：含斧镐、fishingRods
//console.log("加载 工具");
const tools = [
        { id: "tools_001", name: "初级纳戒", type: "tool", grade: 1, rarity: 4, value: 500, effects: { space: 10 }, desc: "内有小空间。" },
    ];

const fishingRods = [
        { id: "fishingRods_001", name: "柳条竿", type: "fishing_rod", rarity: 1, value: 5, effects: { catchRate: 5 }, desc: "路边折的柳条，勉强能钓。" },
        { id: "fishingRods_002", name: "细竹竿", type: "fishing_rod", rarity: 1, value: 10, effects: { catchRate: 8 }, desc: "普通的细竹子，弹性一般。" },
        { id: "fishingRods_003", name: "芦苇竿", type: "fishing_rod", rarity: 1, value: 8, effects: { catchRate: 6 }, desc: "轻便但易断。" },
        { id: "fishingRods_004", name: "斑竹竿", type: "fishing_rod", rarity: 1, value: 20, effects: { catchRate: 10 }, desc: "带点花纹的竹竿，手感尚可。" },
        { id: "fishingRods_005", name: "陈年老竹竿", type: "fishing_rod", rarity: 1, value: 30, effects: { catchRate: 12 }, desc: "也就是放得久了点。" },
        { id: "fishingRods_006", name: "直木竿", type: "fishing_rod", rarity: 1, value: 15, effects: { catchRate: 9 }, desc: "直是直，就是有点硬。" },
        { id: "fishingRods_007", name: "桑木竿", type: "fishing_rod", rarity: 1, value: 25, effects: { catchRate: 11 }, desc: "桑木柔韧。" },
        { id: "fishingRods_008", name: "新手钓竿", type: "fishing_rod", rarity: 1, value: 50, effects: { catchRate: 15 }, desc: "渔具店的入门产品。" },
        { id: "fishingRods_009", name: "拼接竿", type: "fishing_rod", rarity: 1, value: 10, effects: { catchRate: 7 }, desc: "两截木头接起来的。" },
        { id: "fishingRods_010", name: "弯曲的树枝", type: "fishing_rod", rarity: 1, value: 2, effects: { catchRate: 2 }, desc: "这也能钓鱼？" },
        { id: "fishingRods_011", name: "紫竹竿", type: "fishing_rod", rarity: 2, value: 80, effects: { catchRate: 20 }, desc: "名贵紫竹制作，手感极佳。" },
        { id: "fishingRods_012", name: "铁木竿", type: "fishing_rod", rarity: 2, value: 100, effects: { catchRate: 22 }, desc: "坚硬如铁，大鱼也拉不断。" },
        { id: "fishingRods_013", name: "罗汉竹竿", type: "fishing_rod", rarity: 2, value: 120, effects: { catchRate: 25 }, desc: "竹节怪异，却意外地顺手。" },
        { id: "fishingRods_014", name: "溪流竿", type: "fishing_rod", rarity: 2, value: 90, effects: { catchRate: 18 }, desc: "专为溪流环境设计。" },
        { id: "fishingRods_015", name: "韧藤竿", type: "fishing_rod", rarity: 2, value: 110, effects: { catchRate: 24 }, desc: "百年老藤，韧性十足。" },
        { id: "fishingRods_016", name: "黑漆竿", type: "fishing_rod", rarity: 2, value: 150, effects: { catchRate: 28 }, desc: "表面刷了黑漆，防腐耐用。" },
        { id: "fishingRods_017", name: "铜稍竿", type: "fishing_rod", rarity: 2, value: 130, effects: { catchRate: 26 }, desc: "竿头包铜，重心靠前。" },
        { id: "fishingRods_018", name: "渔夫之傲", type: "fishing_rod", rarity: 2, value: 200, effects: { catchRate: 30 }, desc: "老渔夫的得意之作。" },
        { id: "fishingRods_019", name: "碧水竿", type: "fishing_rod", rarity: 3, value: 500, effects: { catchRate: 40 }, req: { jing: 10, shen: 10 }, desc: "通体碧绿，入水无声。" },
        { id: "fishingRods_020", name: "寒铁竿", type: "fishing_rod", rarity: 3, value: 600, effects: { catchRate: 45 }, req: { jing: 12, shen: 10 }, desc: "散发寒气，能吸引喜寒鱼类。" },
        { id: "fishingRods_021", name: "赤炎竿", type: "fishing_rod", rarity: 3, value: 600, effects: { catchRate: 45 }, req: { jing: 10, shen: 12 }, desc: "温热之竿，冬钓神器。" },
        { id: "fishingRods_022", name: "灵犀竿", type: "fishing_rod", rarity: 3, value: 800, effects: { catchRate: 50 }, req: { jing: 15, shen: 15 }, desc: "心有灵犀，鱼动先知。" },
        { id: "fishingRods_023", name: "墨玉竿", type: "fishing_rod", rarity: 3, value: 700, effects: { catchRate: 48 }, req: { jing: 14, shen: 14 }, desc: "墨玉雕琢，奢华内敛。" },
        { id: "fishingRods_024", name: "白骨竿", type: "fishing_rod", rarity: 3, value: 750, effects: { catchRate: 52 }, req: { jing: 15, shen: 10 }, desc: "不知名巨兽肋骨磨制。" },
        { id: "fishingRods_025", name: "姜太公直钩", type: "fishing_rod", rarity: 4, value: 2000, effects: { catchRate: 70 }, req: { jing: 20, shen: 20 }, desc: "愿者上钩，因果律钓鱼。" },
        { id: "fishingRods_026", name: "游龙戏珠竿", type: "fishing_rod", rarity: 4, value: 2500, effects: { catchRate: 75 }, req: { jing: 22, shen: 22 }, desc: "竿身隐有龙吟，万鱼朝拜。" },
        { id: "fishingRods_027", name: "北冥鲲鹏刺", type: "fishing_rod", rarity: 4, value: 2800, effects: { catchRate: 80 }, req: { jing: 25, shen: 25 }, desc: "取鲲鹏之羽为竿，可钓深海巨物。" },
        { id: "fishingRods_028", name: "定海神珍(伪)", type: "fishing_rod", rarity: 4, value: 3000, effects: { catchRate: 85 }, req: { jing: 30, shen: 15 }, desc: "虽然不是真的金箍棒，但也很重。" },
        { id: "fishingRods_029", name: "万物归一竿", type: "fishing_rod", rarity: 5, value: 8000, effects: { catchRate: 100 }, req: { jing: 40, shen: 40 }, desc: "【神话】一竿垂下，诸天万界皆可钓。" },
        { id: "fishingRods_030", name: "因果钓竿", type: "fishing_rod", rarity: 5, value: 9999, effects: { catchRate: 120 }, req: { jing: 50, shen: 50 }, desc: "【神话】钓的不是鱼，是命运。" }
    ];    