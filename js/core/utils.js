// js/core/utils.js
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





/* ================= 模块 4: 日志管理器 ================= */
const LogManager = {
    el: null,
    cache: [],

    init: function() {
        this.el = document.getElementById('game_log_content');
        if(this.el) {
            this.loadFromCache();
        }
    },
    loadFromCache: function() {
        const key = (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default';
        const savedLogs = localStorage.getItem(key);
        if (savedLogs) {
            try {
                this.cache = JSON.parse(savedLogs);
                this.el.innerHTML = '';
                this.cache.forEach(log => {
                    this._renderLogItem(log.time, log.msg);
                });
                this.el.scrollTop = this.el.scrollHeight;
            } catch (e) {
                console.error("日志缓存读取失败", e);
                this.cache = [];
            }
        }
    },
    saveToCache: function() {
        const key = (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default';
        localStorage.setItem(key, JSON.stringify(this.cache));
    },
    _renderLogItem: function(timeStr, msgHtml) {
        if (!this.el) return;
        const timeP = document.createElement('p');
        timeP.className = 'log_time';
        timeP.innerText = timeStr;
        const msgP = document.createElement('p');
        msgP.innerHTML = msgHtml;
        this.el.appendChild(timeP);
        this.el.appendChild(msgP);
    },
    add: function(msg) {
        if (!this.el) this.init();
        if (!this.el) return;
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        const timeStr = `[${h}:${m}:${s}]`;
        this._renderLogItem(timeStr, msg);
        this.cache.push({ time: timeStr, msg: msg });
        this.el.scrollTop = this.el.scrollHeight;
        const maxEntries = (typeof LOG_MAX_ENTRIES !== 'undefined') ? LOG_MAX_ENTRIES : 250;
        while (this.cache.length > maxEntries) {
            this.cache.shift();
        }
        const maxDomLines = maxEntries * 2;
        while (this.el.children.length > maxDomLines) {
            this.el.removeChild(this.el.firstChild);
            this.el.removeChild(this.el.firstChild);
        }
        this.saveToCache();
    },
    clear: function() {
        if (!this.el) this.init();
        if (this.el) this.el.innerHTML = '';
        this.cache = [];
        const key = (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default';
        localStorage.removeItem(key);
    }
};
window.LogManager = LogManager;