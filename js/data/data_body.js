// 盔甲
console.log("加载 盔甲")

const body = [
        { id: "body_001", name: "粗麻衣", type: "body", grade: 0, rarity: 1, value: 2, durability: 20, effects: { def: 2 }, desc: "手感像砂纸，勉强遮体。" },
        { id: "body_002", name: "破布袍", type: "body", grade: 0, rarity: 1, value: 1, durability: 10, effects: { def: 1 }, desc: "补丁摞补丁，风一吹就透。" },
        { id: "body_003", name: "渔夫蓑衣", type: "body", grade: 0, rarity: 1, value: 3, durability: 25, effects: { def: 2, hp_max: 5 }, desc: "防雨效果很好。" },
        { id: "body_004", name: "旧葛衫", type: "body", grade: 0, rarity: 1, value: 4, durability: 15, effects: { def: 2 }, desc: "透气凉爽。" },
        { id: "body_005", name: "乞丐装", type: "body", grade: 0, rarity: 1, value: 0, durability: 50, effects: { def: 1 }, desc: "不仅破，还很脏。" },
        { id: "body_006", name: "羊皮袄", type: "body", grade: 0, rarity: 1, value: 10, durability: 30, effects: { def: 3, hp_max: 10 }, desc: "穿上很暖和，适合过冬。" },
        { id: "body_007", name: "猎户背心", type: "body", grade: 0, rarity: 1, value: 8, durability: 20, effects: { def: 3 }, desc: "露出胳膊，方便射箭。" },
        { id: "body_008", name: "厚棉袍", type: "body", grade: 0, rarity: 1, value: 6, durability: 20, effects: { def: 4 }, desc: "厚实，能缓冲一点点打击。" },
        { id: "body_009", name: "秦军黑衣", type: "body", grade: 0, rarity: 2, value: 20, durability: 30, effects: { def: 6 }, desc: "秦人尚黑，这是普通士兵的便服。" },
        { id: "body_010", name: "硬木甲", type: "body", grade: 0, rarity: 2, value: 40, durability: 40, effects: { def: 7 }, desc: "把硬木片串在身上，能挡钝器。" },
        { id: "body_011", name: "生牛皮甲", type: "body", grade: 0, rarity: 2, value: 50, durability: 45, effects: { def: 8, hp_max: 10 }, desc: "简单的皮甲，有些僵硬。" },
        { id: "body_012", name: "藤甲", type: "body", grade: 0, rarity: 2, value: 60, durability: 50, effects: { def: 9 }, desc: "桐油浸泡过的藤条，坚韧轻便，但怕火。" },
        { id: "body_013", name: "纸甲", type: "body", grade: 0, rarity: 2, value: 35, durability: 20, effects: { def: 5 }, desc: "多层坚韧纸张压制，意外地能防箭。" },
        { id: "body_014", name: "镶钉皮甲", type: "body", grade: 0, rarity: 2, value: 70, durability: 55, effects: { def: 10 }, desc: "在皮甲关键部位镶嵌了铜钉。" },
        { id: "body_015", name: "野猪皮甲", type: "body", grade: 0, rarity: 2, value: 80, durability: 60, effects: { def: 12, hp_max: 20 }, desc: "野猪皮极其厚实，防御力不错。" },
        { id: "body_016", name: "秦军漆甲", type: "body", grade: 0, rarity: 3, value: 120, durability: 70, effects: { def: 15, hp_max: 20 }, req: { jing: 18 }, desc: "表面刷漆防锈，甲片细密。" },
        { id: "body_017", name: "鱼鳞甲", type: "body", grade: 0, rarity: 3, value: 150, durability: 65, effects: { def: 18 }, req: { jing: 18 }, desc: "甲片如鱼鳞般排列，活动自如。" },
        { id: "body_018", name: "锁子甲", type: "body", grade: 0, rarity: 3, value: 180, durability: 60, effects: { def: 16, hp_max: 30 }, req: { jing: 18 }, desc: "细铁环相扣，对刀剑防御极好，怕钝器。" },
        { id: "body_019", name: "犀牛皮甲", type: "body", grade: 0, rarity: 3, value: 200, durability: 80, effects: { def: 20, hp_max: 40 }, req: { jing: 18 }, desc: "比铁甲还坚韧的皮甲，且更轻便。" },
        { id: "body_020", name: "步人甲", type: "body", grade: 0, rarity: 3, value: 220, durability: 90, effects: { def: 22 }, req: { jing: 18 }, desc: "重步兵装备，防御力极强但很重。" },
        { id: "body_021", name: "夜行衣", type: "body", grade: 0, rarity: 3, value: 100, durability: 30, effects: { def: 8, hp_max: 10 }, req: { jing: 18 }, desc: "虽然防御不高，但适合潜行。" },
        { id: "body_022", name: "精铁护心镜", type: "body", grade: 0, rarity: 3, value: 130, durability: 50, effects: { def: 12, hp_max: 50 }, req: { jing: 18 }, desc: "重点保护心脏部位，大幅增加生命。" },
        { id: "body_023", name: "明光铠", type: "body", grade: 0, rarity: 4, value: 600, durability: 100, effects: { def: 30, hp_max: 50 }, req: { jing: 24 }, desc: "胸前有抛光金属圆护，阳光下耀眼夺目。" },
        { id: "body_024", name: "乌金甲", type: "body", grade: 0, rarity: 4, value: 700, durability: 120, effects: { def: 35, hp_max: 60 }, req: { jing: 24 }, desc: "混入乌金打造，坚不可摧。" },
        { id: "body_025", name: "软猬甲", type: "body", grade: 0, rarity: 4, value: 800, durability: 80, effects: { def: 25, hp_max: 80 }, req: { jing: 24 }, desc: "桃花岛至宝，满布倒刺，攻防一体。" },
        { id: "body_026", name: "天蚕衣", type: "body", grade: 0, rarity: 4, value: 900, durability: 60, effects: { def: 20, hp_max: 120 }, req: { jing: 24 }, desc: "天蚕丝织就，刀枪不入且水火不侵，极轻。" },
        { id: "body_027", name: "黑曜石战甲", type: "body", grade: 0, rarity: 4, value: 650, durability: 110, effects: { def: 32, hp_max: 40 }, req: { jing: 24 }, desc: "厚重的黑曜石片编织，极重。" },
        { id: "body_028", name: "兽面吞头连环铠", type: "body", grade: 0, rarity: 5, value: 2500, durability: 150, effects: { def: 50, hp_max: 150 }, req: { jing: 30 }, desc: "【传世】吕布之铠，威风凛凛，防御惊人。" },
        { id: "body_029", name: "金缕玉衣", type: "body", grade: 0, rarity: 5, value: 3000, durability: 50, effects: { def: 30, hp_max: 300 }, req: { jing: 30 }, desc: "【传世】王侯入葬之衣，蕴含神秘力量，大幅延寿。" }
    ];
