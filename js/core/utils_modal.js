// js/core/utils_modal.js
// 弹窗管理模块 v3.2 (增强版：支持通过参数控制 ESC 和遮罩点击行为)

const ModalManager = {
    _modalStack: [],  // 弹窗堆栈
    _baseZIndex: 1000,
    _lastOpenTime: 0, // 防连点计时器

    // ================= 初始化 =================
    init: function() {
        // 自动清理页面上残留的旧版遮罩
        const legacyOverlay = document.getElementById('modal_overlay');
        if (legacyOverlay && !legacyOverlay.classList.contains('dynamic_modal')) {
            legacyOverlay.remove();
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
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 300);
            }
        }, duration);
    },

    // 2. 通用交互弹窗 (修改：支持传入 options)
    showInteractiveModal: function(title, contentHtml, footerHtml = null, extraClass = "", width = null, height = null, options = {}) {
        // options 示例: { allowOutsideClick: false, allowEsc: false, onClose: function(){} }
        const result = this._showBaseModal('modal_interactive', title, contentHtml, footerHtml, extraClass, width, height, options);
        return result.body;
    },

    // 3. 技能弹窗 (默认允许关闭)
    showSkillModal: function(title, contentHtml) {
        return this._showBaseModal('modal_skill', title, contentHtml, null, "", null, null, { allowOutsideClick: true, allowEsc: true }).body;
    },

    // 4. 事件弹窗 (默认允许关闭)
    showEventModal: function(title, contentHtml) {
        const { box, body } = this._showBaseModal('history_modal_box', title, contentHtml, null);

        // DOM 结构后处理
        const header = box.querySelector('.modal_header');
        if (header) {
            header.className = 'history_modal_header';
            header.innerHTML = title;
        }

        const bodyEl = box.querySelector('.modal_body');
        if (bodyEl) {
            bodyEl.className = 'history_modal_body';
        }

        const footer = box.querySelector('.modal_footer');
        if (footer) {
            footer.className = 'history_modal_footer';
            footer.innerHTML = `<button class="history_btn_confirm" onclick="window.closeModal()">阅毕</button>`;
        }

        return body;
    },

    // 5. 警告弹窗 (强制禁止 ESC 和 点击外部关闭)
    showWarningModal: function(title, contentHtml, callback) {
        this._createTempCallback(callback, (funcName) => {
            const footer = `<button class="ink_btn_danger" onclick="window['${funcName}']()">确认</button>`;
            // 强制覆盖 options
            const strictOptions = { allowOutsideClick: false, allowEsc: false };
            this._showBaseModal('modal_warning', title, contentHtml, footer, "", null, null, strictOptions);
        });
    },

    // 6. 确认/取消弹窗 (强制禁止 ESC 和 点击外部关闭)
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
            const strictOptions = { allowOutsideClick: false, allowEsc: false };
            this._showBaseModal('modal_warning', title, contentHtml, footer, "", null, null, strictOptions);
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
        if (this._modalStack.length > 0 && this._modalStack[this._modalStack.length - 1].title === '九州舆图') {
            this.closeTopModal();
        }

        // 大地图默认允许 ESC 和 点击外部关闭
        const mapOptions = { allowOutsideClick: true, allowEsc: true };
        const { overlay, box } = this._createModalStructure('九州舆图', mapOptions);

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

    // 9. 对话框弹窗
    showDialogueModal: function(speakerName, contentHtml, side = 'left', onNext = null, isFinished = false) {
        this._injectDialogueStyles();
        const btnText = isFinished ? "结束对话" : "继续对话";
        const footerHtml = `<button class="ink_btn_next">${btnText}</button>`;

        // 对话框通常不允许随便点外部关闭，防止误触跳过剧情，这里设为 false
        const dialogueOptions = { allowOutsideClick: false, allowEsc: true };

        const { box, body } = this._showBaseModal('modal_dialogue', speakerName, contentHtml, footerHtml, `side_${side}`, 60, 30, dialogueOptions);

        const avatarHtml = `<div class="dialogue_avatar_wrap"><div class="ink_avatar"></div></div>`;
        box.insertAdjacentHTML('afterbegin', avatarHtml);

        const btn = box.querySelector('.ink_btn_next');
        if (btn) {
            btn.onclick = () => {
                window.closeModal();
                if (typeof onNext === 'function') onNext();
            };
        }

        return body;
    },

    _injectDialogueStyles: function() {
        if (document.getElementById('ink_dialogue_style')) return;
        const style = document.createElement('style');
        style.id = 'ink_dialogue_style';
        style.innerHTML = `
            .modal_dialogue { background: #fffdfb !important; border: 2px solid #333 !important; padding-top: 40px !important; position: relative; overflow: visible !important; display: flex; flex-direction: column; }
            .modal_dialogue .modal_footer { justify-content: flex-end !important; padding-right: 30px !important; border-top: 1px dashed #ccc !important; display: flex !important; }
            .dialogue_avatar_wrap { position: absolute; bottom: 0; width: 180px; height: 220px; pointer-events: none; z-index: 0; }
            .side_left .dialogue_avatar_wrap { left: -110px; }
            .side_right .dialogue_avatar_wrap { right: -110px; transform: scaleX(-1); }
            .ink_avatar { width: 100%; height: 100%; background: linear-gradient(to bottom, #444 0%, #111 80%, transparent 100%); clip-path: polygon(50% 0%, 65% 5%, 70% 20%, 65% 35%, 55% 40%, 90% 50%, 100% 100%, 0% 100%, 10% 50%, 45% 40%, 35% 35%, 30% 20%, 35% 5%); opacity: 0.9; filter: blur(1px); }
            .modal_dialogue .modal_body { position: relative; z-index: 1; font-size: 20px; line-height: 1.8; padding: 15px 25px; font-family: "KaiTi", serif; min-height: 100px; }
            .ink_btn_next { padding: 8px 25px; background: #222; color: #fff; border: 1px solid #000; cursor: pointer; font-family: "KaiTi"; font-size: 18px; transition: all 0.2s; }
            .ink_btn_next:hover { background: #a94442; box-shadow: 2px 2px 0 #333; }
        `;
        document.head.appendChild(style);
    },

    // ================= 核心逻辑 =================

    _createTempCallback: function(callback, renderFn) {
        const tempName = 'temp_cb_' + Date.now();
        window[tempName] = function() {
            try { if (typeof callback === 'function') callback(); }
            catch (e) { console.error(e); }
            finally { window.closeModal(); delete window[tempName]; }
        };
        renderFn(tempName);
    },

    // 创建 DOM 骨架
    // 新增：options 参数
    _createModalStructure: function(title, options) {
        const zIndex = this._baseZIndex + (this._modalStack.length * 10);

        const overlay = document.createElement('div');
        overlay.id = 'modal_overlay';
        overlay.className = 'modal_overlay dynamic_modal';

        overlay.style.zIndex = zIndex;
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.5)';

        const box = document.createElement('div');
        box.className = 'modal_content ink_modal_box ink_card';

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // 【核心修改】根据 options 控制遮罩点击是否关闭
        if (options.allowOutsideClick) {
            overlay.onclick = (e) => {
                if (e.target === overlay) this.closeSpecificModal(overlay);
            };
        } else {
            // 如果不允许关闭，可以加一个抖动效果提示用户（可选，这里暂留白）
            overlay.onclick = null;
        }

        // 将 options 存入堆栈，以便 ESC 判断使用
        this._modalStack.push({ overlay, box, title: title, options: options });
        return { overlay, box };
    },

    // 新增：options 参数，默认全允许
    _showBaseModal: function(typeClass, title, content, footer, extraClass = "", width = null, height = null, options = {}) {

        // 合并默认配置
        const finalOptions = Object.assign({
            allowOutsideClick: true,
            allowEsc: true,
            onClose: null
        }, options);

        // 1. 防重：复用同名窗口
        const topItem = this._modalStack[this._modalStack.length - 1];
        if (topItem && topItem.title === title) {
            console.warn(`[Modal] 复用窗口: "${title}"，正在更新配置...`);

            // ============ 【核心修复开始】 ============
            // 修复：复用时必须强制更新 options，否则会继承上一次的“允许关闭”状态
            topItem.options = finalOptions;

            // 修复：同步更新遮罩层的点击事件
            if (finalOptions.allowOutsideClick) {
                topItem.overlay.onclick = (e) => {
                    if (e.target === topItem.overlay) this.closeSpecificModal(topItem.overlay);
                };
            } else {
                // 如果禁止关闭，必须移除点击事件，否则复用的窗口还会保留旧的点击关闭逻辑
                topItem.overlay.onclick = null;
            }
            // ============ 【核心修复结束】 ============

            const existingBody = topItem.box.querySelector('.modal_body');
            if (existingBody) {
                existingBody.innerHTML = content;
                // 同时更新 footer (因为战斗逃跑按钮在 footer 里)
                const existingFooter = topItem.box.querySelector('.modal_footer');
                if (existingFooter && footer) {
                    existingFooter.innerHTML = footer;
                    existingFooter.style.display = 'flex';
                }

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

        // 3. 创建窗口 (传入 finalOptions)
        const { overlay, box } = this._createModalStructure(title, finalOptions);

        box.classList.add(typeClass);
        if (extraClass) box.classList.add(extraClass);

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

        // 重新绑定 ESC 监听（逻辑在内部已更新）
        this._bindEscKey();

        return {
            overlay,
            box,
            body: box.querySelector('.modal_body')
        };
    },

    _bindEscKey: function() {
        if (this._escHandler) document.removeEventListener('keydown', this._escHandler);

        this._escHandler = (e) => {
            if (e.key !== 'Escape') return;

            const top = this._modalStack[this._modalStack.length-1];
            if (!top) return;

            // 【核心修改】逻辑判定优先级
            // 1. 如果有 options 配置，以 allowEsc 为准
            // 2. 兼容旧逻辑：如果是 modal_warning 且没有明确配置 true，则禁止
            let canClose = true;

            if (top.options && typeof top.options.allowEsc === 'boolean') {
                canClose = top.options.allowEsc;
            } else if (top.box.classList.contains('modal_warning')) {
                // 如果没有 options 但有 warning class，默认不关闭
                canClose = false;
            }

            if (canClose) {
                window.closeModal();
            }
        };
        document.addEventListener('keydown', this._escHandler);
    },

    closeTopModal: function() {
        if (this._modalStack.length === 0) return;

        if (window.hideTooltip) window.hideTooltip();

        const topItem = this._modalStack.pop();

        // 触发关闭回调
        if (topItem.options && typeof topItem.options.onClose === 'function') {
            try { topItem.options.onClose(); } catch(e) { console.error(e); }
        }

        if (topItem && topItem.overlay) {
            topItem.overlay.remove();
        }
        if (this._modalStack.length === 0) this._cleanup();

        // 如果还有弹窗，重新绑定 ESC 逻辑给新的顶层窗口
        if (this._modalStack.length > 0) this._bindEscKey();
    },

    closeSpecificModal: function(targetOverlay) {
        if (window.hideTooltip) window.hideTooltip();

        const index = this._modalStack.findIndex(item => item.overlay === targetOverlay);
        if (index !== -1) {
            const item = this._modalStack[index];

            // 触发关闭回调
            if (item.options && typeof item.options.onClose === 'function') {
                try { item.options.onClose(); } catch(e) { console.error(e); }
            }

            item.overlay.remove();
            this._modalStack.splice(index, 1);
            if (this._modalStack.length === 0) this._cleanup();
            else this._bindEscKey(); // 刷新 ESC 绑定对象
        }
    },

    _cleanup: function() {
        if (window.MapView && window.MapView.stopLoop) window.MapView.stopLoop();
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
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
window.showDialogue = ModalManager.showDialogueModal.bind(ModalManager);