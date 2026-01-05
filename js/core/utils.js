// 工具箱：随机数, 日志, 弹窗, 时间格式化
console.log("加载 工具箱")

/* ================= 核心工具箱 ================= */

/**
 * 模块 1: 高级随机系统 (基于种子)
 */
const RandomSystem = {
    _hash: function(str) {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return (h >>> 0) / 4294967296;
    },
    get: function(...args) {
        const seed = (typeof player !== 'undefined' && player.worldSeed) ? player.worldSeed : 12345;
        const key = `${seed}_${args.join('_')}`;
        return this._hash(key);
    },
    getByWeekAndCoord: function(x, y, extraKey = "") {
        const week = typeof player !== 'undefined' ? Math.floor(player.dayCount / 7) : 0;
        return this.get("week", week, "coord", x, y, extraKey);
    },
    getByMonthAndTown: function(townId, extraKey = "") {
        const month = typeof player !== 'undefined' ? Math.floor(player.dayCount / 30) : 0;
        return this.get("month", month, "town", townId, extraKey);
    },
    getByTownFixed: function(townId, extraKey = "") {
        return this.get("fixed", "town", townId, extraKey);
    },
    getInt: function(min, max, ...seedArgs) {
        const r = this.get(...seedArgs);
        return Math.floor(r * (max - min + 1)) + min;
    }
};
window.getSeededRandom = (...args) => RandomSystem.get(...args);




