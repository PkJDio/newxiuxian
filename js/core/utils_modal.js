// js/core/utils_modal.js
// 弹窗管理模块 v3.1 (纯逻辑优化版：保留原有样式，仅修复堆栈逻辑)

const ModalManager = {
    _modalStack: [],  // 弹窗堆栈
    _baseZIndex: 1000,
    _lastOpenTime: 0, // 防连点计时器

    // ================= 初始化 =================
    init: function() {
        // 自动清理页面上残留的旧版遮罩
        const legacyOverlay = document.getElementById('modal_overlay');
        // 只清理没有 dynamic_modal 标记的旧元素，防止误删
        if (legacyOverlay && !legacyOverlay.classList.contains('dynamic_modal')) {
            legacyOverlay.remove();
        }
    },

    // 1. Toast 提示 (逻辑保持不变)
    showToast: function(msg, duration = 2000) {
        document.querySelectorAll('.ink_toast').forEach(el => el.remove());
        const toast = document.createElement('div');
        toast.className = 'ink_toast';
        toast.innerHTML = msg;
        document.body.appendChild(toast);

        // 强制重绘触发动画
        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 300);
            }
        }, duration);
    },

    // 2. 通用交互弹窗
    showInteractiveModal: function(title, contentHtml, footerHtml = null, extraClass = "", width = null, height = null) {
        const result = this._showBaseModal('modal_interactive', title, contentHtml, footerHtml, extraClass, width, height);
        return result.body;
    },

    // 3. 技能弹窗
    showSkillModal: function(title, contentHtml) {
        return this._showBaseModal('modal_skill', title, contentHtml, null).body;
    },

    // 4. 事件弹窗
    showEventModal: function(title, contentHtml) {
        return this._showBaseModal('modal_event', title, contentHtml, null).body;
    },

    // 5. 警告弹窗
    showWarningModal: function(title, contentHtml, callback) {
        this._createTempCallback(callback, (funcName) => {
            const footer = `<button class="ink_btn_danger" onclick="window['${funcName}']()">确认</button>`;
            this._showBaseModal('modal_warning', title, contentHtml, footer);
        });
    },

    // 6. 确认/取消弹窗 (保留你原有的按钮样式结构)
    showConfirmModal: function(title, contentHtml, onConfirm) {
        this._createTempCallback(onConfirm, (funcName) => {
            const footer = `
                <div class="ink_modal_footer">
                    <button class="ink_btn_cancel" onclick="window.closeModal()">
                        <span class="btn_icon">↩</span><span class="btn_text">尘缘未了</span>
                    </button>
                    <button class="ink_btn_destruct" onclick="window['${funcName}']()">
                        <span class="btn_icon">⚔</span><span class="btn_text">兵解转世</span>
                    </button>
                </div>`;
            this._showBaseModal('modal_warning', title, contentHtml, footer);
        });
    },

    // 7. 选项列表
    showSelectionModal: function(title, options, onConfirm = null) {
        let listHtml = `<div class="modal_selection_list" style="display:flex; flex-direction:column; gap:10px; padding: 5px;">`;
        options.forEach((opt) => {
            const btnStyle = opt.style || 'ink_btn_long';
            listHtml += `<button class="${btnStyle}" style="padding:12px; text-align:left; border:1px solid #ccc; background:#fff; cursor:pointer; border-radius:4px;">${opt.text}</button>`;
        });
        listHtml += `</div>`;

        const wrapRender = (funcName) => {
            let footerHtml = funcName ? `<button class="ink_btn" onclick="window['${funcName}']()">确认</button>` : '';
            footerHtml += `<button class="ink_btn_normal" onclick="window.closeModal()">关闭</button>`;

            const { box } = this._showBaseModal('modal_selection', title, listHtml, footerHtml);

            // 绑定事件
            const container = box.querySelector('.modal_selection_list');
            if (container) {
                const buttons = container.querySelectorAll('button');
                buttons.forEach((btn, idx) => {
                    if (options[idx] && options[idx].onClick) {
                        btn.onclick = () => {
                            options[idx].onClick();
                            if (options[idx].autoClose) window.closeModal();
                        };
                        // 简单的 hover 效果，防止 CSS 没覆盖到
                        btn.onmouseover = () => { btn.style.borderColor = '#333'; btn.style.background = '#fafafa'; };
                        btn.onmouseout =  () => { btn.style.borderColor = '#ccc'; btn.style.background = '#fff'; };
                    }
                });
            }
        };

        if (onConfirm) this._createTempCallback(onConfirm, wrapRender);
        else wrapRender(null);
    },

    // 8. 大地图 (完全保留原有 DOM 结构，只增加防重逻辑)
    showMapModal: function(onOpenCallback) {
        if (this._modalStack.length > 0 && this._modalStack[this._modalStack.length - 1].title === '九州舆图') {
            this.closeTopModal(); // 防止重复打开
        }

        const { overlay, box } = this._createModalStructure('九州舆图');

        // 关键：保留原有的 class 名，确保 style.css 能选中它
        box.className = `modal_content ink_modal_box ink_card modal_map_box`;

        // 这里的 HTML 结构是你原有的，不要动
        box.innerHTML = `
            <div class="modal_header" style="background:#e0e0e0; border-bottom:1px solid #ccc; padding: 8px 20px; display:flex; justify-content:space-between; align-items:center; flex-shrink: 0; height: 50px;">
                <div style="display:flex; align-items:center; gap: 15px;">
                    <div class="modal_title" style="color:#333; font-weight:bold; font-size:18px; margin:0;">🌏 九州舆图</div>
                    <div id="map_level_indicator" style="background:#333; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px;">世界级</div>
                </div>
                <div id="map_mouse_coord" style="font-family: monospace; font-size:14px; color:#555; font-weight:bold;">(0, 0)</div>
                <button class="modal_close" onclick="window.closeModal()" style="color:#333; font-size:24px; background:none; border:none; cursor:pointer; line-height:1;">×</button>
            </div>
            <div class="map_layout_wrapper">
                <div id="full_map_container" class="map_view_container"><canvas id="full_map_canvas"></canvas><div id="map_view_tooltip"></div></div>
                <div id="map_sidebar" class="map_sidebar">
                    <div class="map_empty_state"><div style="font-size:40px; margin-bottom:10px;">🗺️</div><p>点击地图上的地点<br>查看详细信息</p></div>
                </div>
            </div>`;

        // 移除 hidden 类显示 (如果你的 CSS 是用 .hidden 控制显示的)
        overlay.classList.remove('hidden');

        this._bindEscKey();
        if (onOpenCallback) setTimeout(onOpenCallback, 50);
        return box;
    },

    // ================= 核心逻辑 (不包含样式注入) =================

    _createTempCallback: function(callback, renderFn) {
        const tempName = 'temp_cb_' + Date.now();
        window[tempName] = function() {
            try { if (typeof callback === 'function') callback(); }
            catch (e) { console.error(e); }
            finally { window.closeModal(); delete window[tempName]; }
        };
        renderFn(tempName);
    },

    // 创建最基础的 DOM 骨架
    _createModalStructure: function(title) {
        const zIndex = this._baseZIndex + (this._modalStack.length * 10);

        const overlay = document.createElement('div');
        // 这里的 id 和 class 必须和你原有的 style.css 匹配
        overlay.id = 'modal_overlay';
        overlay.className = 'modal_overlay dynamic_modal';

        // 仅设置必要的层级，布局样式交给 style.css
        overlay.style.zIndex = zIndex;
        // 如果原 CSS 没有 display:flex，这里补救一下，确保居中
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        // 强制固定定位，防止页面滚动跑偏
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.5)'; // 默认半透明黑，会被 CSS 覆盖

        const box = document.createElement('div');
        // 加上这一长串 class 是为了匹配你原有的样式
        box.className = 'modal_content ink_modal_box ink_card';

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeSpecificModal(overlay);
        };

        this._modalStack.push({ overlay, box, title: title });
        return { overlay, box };
    },

    _showBaseModal: function(typeClass, title, content, footer, extraClass = "", width = null, height = null) {
        // 1. 防重：复用同名窗口
        const topItem = this._modalStack[this._modalStack.length - 1];
        if (topItem && topItem.title === title) {
            console.warn(`[Modal] 复用窗口: "${title}"`);
            const existingBody = topItem.box.querySelector('.modal_body');
            if (existingBody) {
                existingBody.innerHTML = content;
                return { overlay: topItem.overlay, box: topItem.box, body: existingBody };
            }
        }

        // 2. 防连点
        const now = Date.now();
        if (now - this._lastOpenTime < 200) {
            if (topItem) return { overlay: topItem.overlay, box: topItem.box, body: topItem.box.querySelector('.modal_body') };
            const dummy = document.createElement('div');
            return { overlay: dummy, box: dummy, body: dummy };
        }
        this._lastOpenTime = now;

        // 3. 创建窗口
        const { overlay, box } = this._createModalStructure(title);

        // 追加类型 class，例如 modal_warning
        box.classList.add(typeClass);
        if (extraClass) box.classList.add(extraClass);

        if (width) box.style.width = typeof width === 'number' ? `${width}vw` : width;
        if (height) box.style.height = typeof height === 'number' ? `${height}vh` : height;

        // 内部结构
        box.innerHTML = `
            <div class="modal_header" style="font-size:18px; font-weight:bold; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">${title || '提示'}</div>
            <div class="modal_body" style="overflow-y:auto; flex:1;">${content}</div>
            <div class="modal_footer ink_modal_footer" style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; text-align:right;"></div>
        `;

        const footerEl = box.querySelector('.modal_footer');
        if (footerEl) {
            if (footer) {
                footerEl.style.display = 'flex'; // 确保 flex 布局生效
                footerEl.innerHTML = footer;
            } else {
                footerEl.style.display = 'block';
                footerEl.innerHTML = `<button onclick="window.closeModal()" class="ink_btn_normal">关闭</button>`;
            }
        }

        if (typeClass !== 'modal_warning') this._bindEscKey();

        return {
            overlay,
            box,
            body: box.querySelector('.modal_body')
        };
    },

    _bindEscKey: function() {
        if (this._escHandler) document.removeEventListener('keydown', this._escHandler);
        this._escHandler = (e) => {
            const top = this._modalStack[this._modalStack.length-1];
            if (e.key === 'Escape' && top && !top.box.classList.contains('modal_warning')) {
                window.closeModal();
            }
        };
        document.addEventListener('keydown', this._escHandler);
    },

    // 彻底销毁逻辑：必须使用 remove()
    closeTopModal: function() {
        if (this._modalStack.length === 0) return;

        // 【核心修复】窗口关闭时，强制清理任何残留的悬浮窗
        if (window.hideTooltip) window.hideTooltip();

        const topItem = this._modalStack.pop();
        if (topItem && topItem.overlay) {
            topItem.overlay.remove(); // 关键：从 DOM 树移除
        }
        if (this._modalStack.length === 0) this._cleanup();
    },

    closeSpecificModal: function(targetOverlay) {
        // 【核心修复】窗口关闭时，强制清理任何残留的悬浮窗
        if (window.hideTooltip) window.hideTooltip();

        const index = this._modalStack.findIndex(item => item.overlay === targetOverlay);
        if (index !== -1) {
            this._modalStack[index].overlay.remove(); // 关键
            this._modalStack.splice(index, 1);
            if (this._modalStack.length === 0) this._cleanup();
        }
    },

    _cleanup: function() {
        if (window.MapView && window.MapView.stopLoop) window.MapView.stopLoop();
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        // 顺便通知 Combat 清理缓存
        if (window.Combat && window.Combat.clearCache) window.Combat.clearCache();
    }
};

// 初始化
ModalManager.init();

// 暴露接口
window.UtilsModal = ModalManager;
window.showToast = ModalManager.showToast.bind(ModalManager);
window.showGeneralModal = ModalManager.showInteractiveModal.bind(ModalManager);
window.showWarningModal = ModalManager.showWarningModal.bind(ModalManager);
window.showConfirmModal = ModalManager.showConfirmModal.bind(ModalManager);
window.showSelectionModal = ModalManager.showSelectionModal.bind(ModalManager);
window.closeModal = () => ModalManager.closeTopModal();