/* ================= 模块 4: 日志管理器 (虚拟滚动与渲染分离版) ================= */
const LogManager = {
    el: null,

    // 数据层：这里可以存很多，用来存档
    cache: [],

    // 视图配置：DOM 最大只保留多少行（超过的会被删掉，保持页面轻量）
    // 进游戏时只渲染最近的 50 条，避免卡顿
    MAX_DOM_NODES: 60,
    // 存档配置：最大存储多少条历史记录
    MAX_CACHE_NODES: 250,

    SAVE_KEY: (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default',
    _saveTimer: null,

    init: function() {
        this.el = document.getElementById('game_log_content');
        if (this.el) {
            // CSS 性能优化注入
            this.el.style.contain = "strict";
            this.el.style.contentVisibility = "auto";
            this.el.style.overflowAnchor = "auto"; // 防止插入日志时发生视窗跳动

            this.loadFromCache();
        }
    },

    loadFromCache: function() {
        const savedLogs = localStorage.getItem(this.SAVE_KEY);
        if (savedLogs) {
            try {
                this.cache = JSON.parse(savedLogs);
                if (!Array.isArray(this.cache)) this.cache = [];

                this.el.innerHTML = '';
                const fragment = document.createDocumentFragment();

                // 【核心优化】：只渲染最后 N 条数据到 DOM
                // 即使 Cache 里有 1000 条，我们也只渲染最后 50 条
                // 这样进游戏瞬间是 0 卡顿的
                const startIndex = Math.max(0, this.cache.length - this.MAX_DOM_NODES);
                const logsToRender = this.cache.slice(startIndex);

                logsToRender.forEach(log => {
                    const node = this._createLogNode(log.time, log.msg);
                    fragment.appendChild(node);
                });

                this.el.appendChild(fragment);
                this._scrollToBottom();
            } catch (e) {
                console.error("日志读取异常", e);
                this.cache = [];
            }
        }
    },

    _createLogNode: function(timeStr, msgHtml) {
        // 使用单层 div 结构，减少 DOM 深度
        const div = document.createElement('div');
        // 内联样式比 class 更快一点点（在极大数量下），也可以用 class="log_row"
        div.style.cssText = "line-height:1.4; margin-bottom:2px; font-size:18px; word-wrap:break-word;";
        // 这里的 innerHTML 是性能瓶颈所在，尽量保持 msgHtml 简短
        div.innerHTML = `<span style="color:#999; margin-right:4px; font-size:16px; font-family:monospace;">${timeStr}</span>${msgHtml}`;
        return div;
    },

    add: function(msg) {
        if (!this.el) this.init();
        if (!this.el) return;

        const now = new Date();
        // 简单的时间格式化，比 padStart 稍微快微乎其微，主要是为了减少函数调用栈
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const timeStr = `[${h<10?'0'+h:h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}]`;

        // 1. 更新数据层 (Cache)
        this.cache.push({ time: timeStr, msg: msg });
        if (this.cache.length > this.MAX_CACHE_NODES) {
            // 批量删除头部溢出数据（比 shift 高效）
            this.cache.splice(0, this.cache.length - this.MAX_CACHE_NODES);
        }

        // 2. 更新视图层 (DOM)
        const node = this._createLogNode(timeStr, msg);
        this.el.appendChild(node);

        // 3. 视图层剪枝：如果 DOM 节点太多，删掉上面的
        // 这里是保证页面不卡顿的关键
        if (this.el.childElementCount > this.MAX_DOM_NODES) {
            // 一次删掉顶部多余的，保持 DOM 总数稳定
            this.el.removeChild(this.el.firstElementChild);
        }

        // 4. 滚动与保存
        this._scrollToBottom();
        this._triggerSave();
    },

    _scrollToBottom: function() {
        if (this.el) this.el.scrollTop = this.el.scrollHeight;
    },

    // 防抖保存：1秒内多次写入只执行一次 IO 操作
    _triggerSave: function() {
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            try {
                localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.cache));
            } catch (e) {}
        }, 1000);
    },
// 新增：带 UI 交互的清空方法
    uiClear: function() {
        const title = "焚毁记录";
        const content = `
            <div style="text-align:center; padding:20px; font-family:'Kaiti'; line-height:1.6;">
                <p style="font-size:20px; color:#3e2723; margin-bottom:10px;">确定要将过往传闻悉数焚毁吗？</p>
                <p style="font-size:16px; color:#888;">此举将使尘缘尽散，不可追回。</p>
            </div>
        `;

        const confirmCallbackName = 'confirm_clear_logs_cb';
        window[confirmCallbackName] = () => {
            // 1. 执行清空逻辑
            this.clear();

            // 2. 视觉反馈
            if (window.showToast) window.showToast("往事已随风消散...");
            if (this.el) {
                this.el.innerHTML = '<div style="color:#bbb; font-size:16px; text-align:center; margin-top:20px; font-style:italic;">—— 旧闻已去，新章待续 ——</div>';
            }

            // 3. 【关键：关闭弹窗】
            if (window.closeModal) window.closeModal();

            // 4. 清理全局函数
            delete window[confirmCallbackName];
        };

        // 按钮样式（保留之前的红色警告样式）
        const footerHtml = `
            <div style="display:flex; justify-content:flex-end; gap:10px; width:100%;">
                <button class="ink_btn_medium" onclick="window.closeModal()" 
                        style="background:#f5f5f5; color:#666; border:1px solid #ccc; cursor:pointer; padding:6px 15px; font-family:'Kaiti';">
                    再想想
                </button>
                <button class="ink_btn_medium" onclick="window['${confirmCallbackName}']()" 
                        style="background:#a94442; color:#fff; border:1px solid #8b0000; cursor:pointer; padding:6px 15px; font-weight:bold; border-radius:4px; font-family:'Kaiti';">
                    确认焚毁
                </button>
            </div>
        `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal(title, content, footerHtml, "modal_clear_log", 40, 30);
        }
    },
    clear: function() {
        if (this.el) this.el.innerHTML = '';
        this.cache = [];
        localStorage.removeItem(this.SAVE_KEY);
    }
};

window.LogManager = LogManager;