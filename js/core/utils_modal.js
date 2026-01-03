// js/core/utils_modal.js
// 弹窗管理模块 (支持自定义宽高)

const ModalManager = {
    // 1. Toast 提示
    showToast: function(msg, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'ink_toast';
        toast.innerHTML = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * 2. 通用交互弹窗 (核心)
     * [新增] width/height 参数，单位默认为 vw/vh，也可以传 "500px" 字符串
     * @param {string} title 标题
     * @param {string} contentHtml 内容HTML
     * @param {string|null} footerHtml 底部按钮HTML
     * @param {string} extraClass 额外的CSS类名
     * @param {number|string} width 宽度 (数字代表百分比，如 50 => 50vw)
     * @param {number|string} height 高度 (数字代表百分比，如 30 => 30vh)
     */
    showInteractiveModal: function(title, contentHtml, footerHtml = null, extraClass = "", width = null, height = null) {
        // 强制指定一个基础类名 'modal_interactive'
        this._showBaseModal('modal_interactive', title, contentHtml, footerHtml, extraClass, width, height);
    },

    // 3. 技能弹窗
    showSkillModal: function(title, contentHtml) {
        this._showBaseModal('modal_skill', title, contentHtml, null);
    },

    // 4. 事件弹窗
    showEventModal: function(title, contentHtml) {
        this._showBaseModal('modal_event', title, contentHtml, null);
    },

    // 5. 警告弹窗
    showWarningModal: function(title, contentHtml, callback) {
        this._createTempCallback(callback, (funcName) => {
            const footer = `<button class="ink_btn_danger" onclick="window['${funcName}']()">确认</button>`;
            // 警告弹窗通常比较小，我们可以给个默认稍宽一点，比如 400px，或者由 CSS 控制
            this._showBaseModal('modal_warning', title, contentHtml, footer);
        });
    },

    // 6. 确认/取消弹窗
    showConfirmModal: function(title, contentHtml, onConfirm) {
        this._createTempCallback(onConfirm, (funcName) => {
            const footer = `
            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="ink_btn_normal" onclick="window.closeModal()">
                    <span>↩</span> 尘缘未了
                </button>
                <button class="ink_btn_danger" onclick="window['${funcName}']()">
                    <span>⚔</span> 兵解转世
                </button>
            </div>
        `;
            this._showBaseModal('modal_warning', title, contentHtml, footer);
        });
    },

    // 7. 选项列表弹窗
    showSelectionModal: function(title, options, onConfirm = null) {
        let listHtml = `<div class="modal_selection_list" style="display:flex; flex-direction:column; gap:10px; padding: 5px;">`;
        options.forEach((opt) => {
            const btnStyle = opt.style || 'ink_btn_long';
            listHtml += `<button class="${btnStyle}" style="padding:12px; text-align:left; border:1px solid #ccc; background:#fff; cursor:pointer; border-radius:4px;">${opt.text}</button>`;
        });
        listHtml += `</div>`;

        const wrapRender = (funcName) => {
            let footerHtml = ``;
            if (funcName) {
                footerHtml += `<button class="ink_btn" onclick="window['${funcName}']()">确认</button>`;
            }
            footerHtml += `<button class="ink_btn_normal" onclick="window.closeModal()">关闭</button>`;

            this._showBaseModal('modal_selection', title, listHtml, footerHtml);

            // 绑定点击
            const container = document.querySelector('.modal_selection_list');
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

        if (onConfirm) {
            this._createTempCallback(onConfirm, wrapRender);
        } else {
            wrapRender(null);
        }
    },

    // ================= 内部核心 =================

    _createTempCallback: function(callback, renderFn) {
        const tempName = 'temp_cb_' + Date.now();
        window[tempName] = function() {
            try {
                if (typeof callback === 'function') callback();
            } catch (e) {
                console.error("[Modal] 回调执行出错:", e);
            } finally {
                window.closeModal();
                delete window[tempName];
            }
        };
        renderFn(tempName);
    },

    /**
     * 基础显示方法
     * [修改] 增加 customWidth, customHeight 参数
     */
    _showBaseModal: function(typeClass, title, content, footer, extraClass = "", customWidth = null, customHeight = null) {
        let overlay = document.getElementById('modal_overlay');
        let box = document.getElementById('modal_content');

        if (!overlay || !box) {
            this._injectModalHTML();
            overlay = document.getElementById('modal_overlay');
            box = document.getElementById('modal_content');
        }

        // 1. 设置 CSS 类名 (作为基础样式)
        box.className = `modal_content ink_card ${typeClass} ${extraClass || ''}`;

        // 2. [核心] 动态设置宽高
        // 重置之前的样式，防止污染
        box.style.width = '';
        box.style.height = '';

        // 应用自定义宽高
        if (customWidth) {
            // 如果是数字，默认为 vw (视口宽度百分比)
            // 如果是字符串 (如 "500px"), 直接使用
            box.style.width = (typeof customWidth === 'number') ? `${customWidth}vw` : customWidth;
        }
        if (customHeight) {
            // 如果是数字，默认为 vh (视口高度百分比)
            box.style.height = (typeof customHeight === 'number') ? `${customHeight}vh` : customHeight;
        }

        // 3. 填充内容
        const headerEl = document.getElementById('modal_header');
        if (headerEl) headerEl.innerHTML = title || '提示';

        const bodyEl = document.getElementById('modal_body');
        if (bodyEl) bodyEl.innerHTML = content;

        const footerEl = document.getElementById('modal_footer');
        if (footerEl) {
            footerEl.className = 'ink_modal_footer';
            if (footer) {
                footerEl.style.display = 'flex';
                footerEl.innerHTML = footer;
            } else {
                footerEl.style.display = 'block';
                footerEl.innerHTML = `<button onclick="closeModal()" class="ink_btn_normal">关闭</button>`;
            }
        }

        overlay.classList.remove('hidden');

        if (typeClass !== 'modal_warning') {
            this._bindEscKey();
        }
    },

    _injectModalHTML: function() {
        if(document.getElementById('modal_overlay')) return;
        const html = `
        <div id="modal_overlay" class="modal_overlay hidden" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; display:flex; justify-content:center; align-items:center;">
            <div id="modal_content" class="ink_card" style="background:#fff; border-radius:8px; padding:20px; display:flex; flex-direction:column; max-height:95vh; min-width:300px;">
                <div id="modal_header" style="font-size:18px; font-weight:bold; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;"></div>
                <div id="modal_body" style="overflow-y:auto; flex:1;"></div>
                <div id="modal_footer" class="ink_modal_footer" style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; text-align:right;"></div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);

        document.getElementById('modal_overlay').onclick = function(e){
            if(e.target === this) window.closeModal();
        }
    },

    _bindEscKey: function() {
        if (this._escHandler) document.removeEventListener('keydown', this._escHandler);
        this._escHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', this._escHandler);
    }
};

// ================= 全局暴露 =================
window.UtilsModal = ModalManager;

window.showToast = ModalManager.showToast.bind(ModalManager);
window.showGeneralModal = ModalManager.showInteractiveModal.bind(ModalManager); // 保持别名
window.showWarningModal = ModalManager.showWarningModal.bind(ModalManager);
window.showConfirmModal = ModalManager.showConfirmModal.bind(ModalManager);
window.showSelectionModal = ModalManager.showSelectionModal.bind(ModalManager);

window.closeModal = function() {
    const overlay = document.getElementById('modal_overlay');
    if (overlay) overlay.classList.add('hidden');
    if (ModalManager._escHandler) document.removeEventListener('keydown', ModalManager._escHandler);
};