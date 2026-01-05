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
