// js/core/utils_modal.js
// 弹窗管理模块 (修复类名丢失问题 + 新增地图弹窗)

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
     * 2. 通用交互弹窗
     */
    showInteractiveModal: function(title, contentHtml, footerHtml = null, extraClass = "", width = null, height = null) {
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
            this._showBaseModal('modal_warning', title, contentHtml, footer);
        });
    },

    // 6. 确认/取消弹窗
    showConfirmModal: function(title, contentHtml, onConfirm) {
        this._createTempCallback(onConfirm, (funcName) => {
            // 使用专门的类名 ink_modal_footer 和 ink_btn_...
            const footer = `
        <div class="ink_modal_footer">
            <button class="ink_btn_cancel" onclick="window.closeModal()">
                <span class="btn_icon">↩</span>
                <span class="btn_text">尘缘未了</span>
            </button>
            
            <button class="ink_btn_destruct" onclick="window['${funcName}']()">
                <span class="btn_icon">⚔</span> 
                <span class="btn_text">兵解转世</span>
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

    // 8. 大地图专用弹窗 (带侧边栏布局)
    showMapModal: function(onOpenCallback) {
        if (!document.getElementById('modal_overlay')) {
            this._injectModalHTML();
        }

        const overlay = document.getElementById('modal_overlay');
        const box = document.getElementById('modal_content');

        box.className = `modal_content ink_modal_box ink_card modal_map_box`;
        box.style.width = '';
        box.style.height = '';

        const html = `
            <div class="modal_header" style="background:#e0e0e0; border-bottom:1px solid #ccc; padding: 8px 20px; display:flex; justify-content:space-between; align-items:center; flex-shrink: 0; height: 50px;">
                <div style="display:flex; align-items:center; gap: 15px;">
                    <div class="modal_title" style="color:#333; font-weight:bold; font-size:18px; margin:0;">🌏 九州舆图</div>
                    <div id="map_level_indicator" style="background:#333; color:#fff; padding:2px 8px; border-radius:4px; font-size:12px;">世界级</div>
                </div>
                
                <div id="map_mouse_coord" style="font-family: monospace; font-size:14px; color:#555; font-weight:bold;">
                    (0, 0)
                </div>

                <button class="modal_close" onclick="window.closeModal()" style="color:#333; font-size:24px; background:none; border:none; cursor:pointer; line-height:1;">×</button>
            </div>

            <div class="map_layout_wrapper">
                <div id="full_map_container" class="map_view_container">
                    <canvas id="full_map_canvas"></canvas>
                    <div id="map_view_tooltip"></div>
                </div>
                
                <div id="map_sidebar" class="map_sidebar">
                    <div class="map_empty_state">
                        <div style="font-size:40px; margin-bottom:10px;">🗺️</div>
                        <p>点击地图上的地点<br>查看详细信息</p>
                    </div>
                </div>
            </div>
        `;

        box.innerHTML = html;
        overlay.classList.remove('hidden');

        this._bindEscKey();

        if (onOpenCallback) {
            setTimeout(onOpenCallback, 50);
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

    _showBaseModal: function(typeClass, title, content, footer, extraClass = "", customWidth = null, customHeight = null) {
        let overlay = document.getElementById('modal_overlay');
        let box = document.getElementById('modal_content');

        if (!overlay || !box) {
            this._injectModalHTML();
            overlay = document.getElementById('modal_overlay');
            box = document.getElementById('modal_content');
        }

        // 【核心修复】必须包含 ink_modal_box 类名，否则 CSS 选择器无法生效！
        box.className = `modal_content ink_modal_box ink_card ${typeClass} ${extraClass || ''}`;

        // 动态设置宽高
        box.style.width = '';
        box.style.height = '';
        if (customWidth) {
            box.style.width = (typeof customWidth === 'number') ? `${customWidth}vw` : customWidth;
        }
        if (customHeight) {
            box.style.height = (typeof customHeight === 'number') ? `${customHeight}vh` : customHeight;
        }

        // 恢复标准结构
        // 如果之前被 showMapModal 修改过结构，这里需要重建标准结构吗？
        // _injectModalHTML 只在不存在时创建。
        // 所以我们需要检查内部结构是否完整，如果不完整（比如被地图覆盖了），需要重置内部 HTML
        if (!document.getElementById('modal_header')) {
            box.innerHTML = `
                <div id="modal_header" style="font-size:18px; font-weight:bold; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;"></div>
                <div id="modal_body" style="overflow-y:auto; flex:1;"></div>
                <div id="modal_footer" class="ink_modal_footer" style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; text-align:right;"></div>
             `;
        }

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
            <div id="modal_content" class="ink_modal_box ink_card" style="background:#fff; border-radius:8px; padding:20px; display:flex; flex-direction:column; max-height:95vh; min-width:300px;">
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
            if (e.key === 'Escape') window.closeModal();
        };
        document.addEventListener('keydown', this._escHandler);
    }
};

window.UtilsModal = ModalManager;
window.showToast = ModalManager.showToast.bind(ModalManager);
window.showGeneralModal = ModalManager.showInteractiveModal.bind(ModalManager);
window.showWarningModal = ModalManager.showWarningModal.bind(ModalManager);
window.showConfirmModal = ModalManager.showConfirmModal.bind(ModalManager);
window.showSelectionModal = ModalManager.showSelectionModal.bind(ModalManager);

window.closeModal = function() {
    const overlay = document.getElementById('modal_overlay');
    if (overlay) overlay.classList.add('hidden');

    // 如果有地图预览在运行，停止它
    if (window.MapView && window.MapView.stopLoop) {
        window.MapView.stopLoop();
    }

    if (ModalManager._escHandler) document.removeEventListener('keydown', ModalManager._escHandler);
};