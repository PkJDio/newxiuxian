// js/core/utils_modal.js
// 弹窗管理模块 (修复版：防双击、防重复堆叠、自动清理残留)

const ModalManager = {
    _modalStack: [],  // 弹窗堆栈
    _baseZIndex: 1000,
    _lastOpenTime: 0, // 用于防止极速连点

    // ================= 初始化清理 =================
    init: function() {
        // 自动清理页面上可能残留的旧版静态遮罩（如果有的话）
        const legacyOverlay = document.getElementById('modal_overlay');
        if (legacyOverlay && !legacyOverlay.classList.contains('dynamic_modal')) {
            legacyOverlay.remove();
            console.log("已清理旧版静态弹窗遮罩");
        }
    },

    // 1. Toast 提示
    showToast: function(msg, duration = 2000) {
        document.querySelectorAll('.ink_toast').forEach(el => el.remove());
        const toast = document.createElement('div');
        toast.className = 'ink_toast';
        toast.innerHTML = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.classList.remove('show');
                setTimeout(() => { if (document.body.contains(toast)) toast.remove(); }, 300);
            }
        }, duration);
    },

    // 2. 通用交互弹窗 (返回 body 容器)
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

    // 6. 确认/取消弹窗
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
                        btn.onmouseover = () => { btn.style.borderColor = '#333'; btn.style.background = '#fafafa'; };
                        btn.onmouseout =  () => { btn.style.borderColor = '#ccc'; btn.style.background = '#fff'; };
                    }
                });
            }
        };

        if (onConfirm) this._createTempCallback(onConfirm, wrapRender);
        else wrapRender(null);
    },

    // 8. 大地图
    showMapModal: function(onOpenCallback) {
        // 地图比较特殊，如果已经开了地图，先关闭旧的
        if (this._modalStack.length > 0 && this._modalStack[this._modalStack.length - 1].title === '九州舆图') {
            this.closeTopModal();
        }

        const { overlay, box } = this._createModalStructure('九州舆图');
        box.className = `modal_content ink_modal_box ink_card modal_map_box`;

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

        overlay.classList.remove('hidden');
        this._bindEscKey();
        if (onOpenCallback) setTimeout(onOpenCallback, 50);
        return box;
    },

    // ================= 内部核心 =================

    _createTempCallback: function(callback, renderFn) {
        const tempName = 'temp_cb_' + Date.now();
        window[tempName] = function() {
            try { if (typeof callback === 'function') callback(); }
            catch (e) { console.error(e); }
            finally { window.closeModal(); delete window[tempName]; }
        };
        renderFn(tempName);
    },

    // 创建 DOM 结构
    _createModalStructure: function(title) {
        const zIndex = this._baseZIndex + (this._modalStack.length * 10);

        const overlay = document.createElement('div');
        overlay.className = 'modal_overlay dynamic_modal'; // 标记为动态生成的
        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: zIndex, display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        });

        const box = document.createElement('div');
        box.className = 'modal_content ink_modal_box ink_card';
        Object.assign(box.style, {
            background: '#fff', borderRadius: '8px', padding: '20px',
            display: 'flex', flexDirection: 'column', maxHeight: '95vh', minWidth: '300px'
        });

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // 点击阴影关闭
        overlay.onclick = (e) => {
            if (e.target === overlay) this.closeSpecificModal(overlay);
        };

        // 存入堆栈时记录标题，用于防重检测
        this._modalStack.push({ overlay, box, title: title });
        return { overlay, box };
    },

    _showBaseModal: function(typeClass, title, content, footer, extraClass = "", width = null, height = null) {
        // 【核心修复1】防重检测：如果最顶层的弹窗标题和现在一样，说明是重复调用
        // 比如按钮连点，或者刷新界面时重复打开
        const topItem = this._modalStack[this._modalStack.length - 1];
        if (topItem && topItem.title === title) {
            console.warn(`[Modal] 检测到重复打开 "${title}"，已复用现有窗口。`);
            // 更新现有窗口的内容，而不是创建新的
            const existingBody = topItem.box.querySelector('.modal_body');
            if (existingBody) {
                // 仅更新内容
                existingBody.innerHTML = content;
                // 如果需要，也可以更新 footer，这里简单处理直接返回
                return { overlay: topItem.overlay, box: topItem.box, body: existingBody };
            }
        }

        // 【核心修复2】防极速连点：200ms 内禁止连续打开新窗口
        const now = Date.now();
        if (now - this._lastOpenTime < 200) {
            console.warn("[Modal] 点击过快，已拦截。");
            // 如果堆栈有窗口，返回顶层窗口防止报错；否则返回空对象
            if (topItem) return { overlay: topItem.overlay, box: topItem.box, body: topItem.box.querySelector('.modal_body') };
            // 实在不行创建一个隐藏的 dummy 防止报错（极端情况）
            const dummy = document.createElement('div');
            return { overlay: dummy, box: dummy, body: dummy };
        }
        this._lastOpenTime = now;

        // 创建新窗口
        const { overlay, box } = this._createModalStructure(title);

        box.className = `modal_content ink_modal_box ink_card ${typeClass} ${extraClass || ''}`;

        if (width) box.style.width = typeof width === 'number' ? `${width}vw` : width;
        if (height) box.style.height = typeof height === 'number' ? `${height}vh` : height;

        box.innerHTML = `
            <div class="modal_header" style="font-size:18px; font-weight:bold; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">${title || '提示'}</div>
            <div class="modal_body" style="overflow-y:auto; flex:1;">${content}</div>
            <div class="modal_footer ink_modal_footer" style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; text-align:right;"></div>
        `;

        const footerEl = box.querySelector('.modal_footer');
        if (footerEl) {
            if (footer) {
                footerEl.style.display = 'flex';
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
        this._escHandler = (e) => { if (e.key === 'Escape') window.closeModal(); };
        document.addEventListener('keydown', this._escHandler);
    },

    closeTopModal: function() {
        if (this._modalStack.length === 0) return;
        const topItem = this._modalStack.pop();
        if (topItem && topItem.overlay) topItem.overlay.remove();
        if (this._modalStack.length === 0) this._cleanup();
    },

    closeSpecificModal: function(targetOverlay) {
        const index = this._modalStack.findIndex(item => item.overlay === targetOverlay);
        if (index !== -1) {
            this._modalStack[index].overlay.remove();
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
    }
};

// 立即运行初始化清理
ModalManager.init();

window.UtilsModal = ModalManager;
window.showToast = ModalManager.showToast.bind(ModalManager);
window.showGeneralModal = ModalManager.showInteractiveModal.bind(ModalManager);
window.showWarningModal = ModalManager.showWarningModal.bind(ModalManager);
window.showConfirmModal = ModalManager.showConfirmModal.bind(ModalManager);
window.showSelectionModal = ModalManager.showSelectionModal.bind(ModalManager);
window.closeModal = () => ModalManager.closeTopModal();