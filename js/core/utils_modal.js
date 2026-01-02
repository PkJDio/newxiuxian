// js/utils_modal.js
// 弹窗管理模块 (UI优化版)

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
   * [修改] 新增 extraClass 参数，用于传入 "modal_bag" 等自定义样式类
   */
  showInteractiveModal: function(title, contentHtml, footerHtml = null, extraClass = "") {
    this._showBaseModal('modal_interactive', title, contentHtml, footerHtml, extraClass);
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

  // 6. 确认/取消弹窗 (双选)
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

  // ==========================================
  // 7. 选项列表弹窗 (Selection) - UI优化版
  // ==========================================
  showSelectionModal: function(title, options, onConfirm = null) {
    // 生成选项列表 HTML
    let listHtml = `<div class="modal_selection_list" style="display:flex; flex-direction:column; gap:10px; padding: 5px;">`;
    options.forEach((opt, index) => {
      const btnStyle = opt.style || 'ink_btn_long'; // 假设 style.css 里有这个长按钮样式，如果没有也没事
      // 这里我们直接用内联样式保证长按钮效果
      listHtml += `<button class="${btnStyle}" style="padding:12px; text-align:left; border:1px solid #ccc; background:#fff; cursor:pointer; border-radius:4px;">${opt.text}</button>`;
    });
    listHtml += `</div>`;

    // 逻辑封装
    let confirmAction = onConfirm;

    const wrapRender = (funcName) => {
      // 【UI优化】底部按钮 HTML
      let footerHtml = ``;

      // 如果有确认回调，显示“确认”按钮 (深色主按钮)
      if (funcName) {
        footerHtml += `<button class="ink_btn" onclick="window['${funcName}']()">确认</button>`;
      }

      // 始终显示“关闭”按钮 (浅色次级按钮)
      footerHtml += `<button class="ink_btn_normal" onclick="window.closeModal()">关闭</button>`;

      // 【关键】传入 'modal_selection' 类名，触发 CSS 中的宽度设置
      this._showBaseModal('modal_selection', title, listHtml, footerHtml);

      // 绑定选项点击事件
      const container = document.querySelector('.modal_selection_list');
      if (container) {
        const buttons = container.querySelectorAll('button');
        buttons.forEach((btn, idx) => {
          if (options[idx] && options[idx].onClick) {
            btn.onclick = () => {
              options[idx].onClick();
              if (options[idx].autoClose) {
                window.closeModal();
              }
            };
            // hover 效果补充
            btn.onmouseover = () => { btn.style.borderColor = '#333'; btn.style.background = '#fafafa'; };
            btn.onmouseout =  () => { btn.style.borderColor = '#ccc'; btn.style.background = '#fff'; };
          }
        });
      }
    };

    if (confirmAction) {
      this._createTempCallback(confirmAction, wrapRender);
    } else {
      wrapRender(null);
    }
  },

  // ==========================================
  // 内部辅助
  // ==========================================
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
   * [修改] 增加 extraClass 参数
   */
  _showBaseModal: function(typeClass, title, content, footer, extraClass = "") {
    const overlay = document.getElementById('modal_overlay');
    const box = document.getElementById('modal_content');

    if (!overlay || !box) {
      this._injectModalHTML();
      return this._showBaseModal(typeClass, title, content, footer, extraClass);
    }

    // [核心修改] 将 extraClass 拼接到 className 中
    box.className = `modal_content ink_card ${typeClass} ${extraClass}`;

    document.getElementById('modal_header').innerHTML = title || '提示';
    document.getElementById('modal_body').innerHTML = content;

    const footerEl = document.getElementById('modal_footer');
    footerEl.className = 'ink_modal_footer';

    if (footer) {
      footerEl.style.display = 'flex';
      footerEl.innerHTML = footer;
    } else {
      footerEl.style.display = 'block';
      footerEl.innerHTML = `<button onclick="closeModal()" class="ink_btn_normal">关闭</button>`;
    }

    overlay.classList.remove('hidden');

    if (typeClass !== 'modal_warning') {
      this._bindEscKey();
    }
  },

  // 自动注入 HTML 结构 (如果 index.html 没写)
  _injectModalHTML: function() {
    if(document.getElementById('modal_overlay')) return;
    const html = `
        <div id="modal_overlay" class="modal_overlay hidden" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; display:flex; justify-content:center; align-items:center;">
            <div id="modal_content" class="ink_card" style="background:#fff; border-radius:8px; padding:20px; display:flex; flex-direction:column; max-height:80vh;">
                <div id="modal_header" style="font-size:18px; font-weight:bold; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;"></div>
                <div id="modal_body" style="overflow-y:auto; flex:1;"></div>
                <div id="modal_footer" class="ink_modal_footer"></div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    // 绑定点击遮罩关闭
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

// 全局暴露
window.showToast = ModalManager.showToast.bind(ModalManager);
// [注意] 这里的绑定也更新了，确保参数透传
window.showGeneralModal = ModalManager.showInteractiveModal.bind(ModalManager);
window.showWarningModal = ModalManager.showWarningModal.bind(ModalManager);
window.showConfirmModal = ModalManager.showConfirmModal.bind(ModalManager);
window.showSelectionModal = ModalManager.showSelectionModal.bind(ModalManager);
window.closeModal = function() {
  const overlay = document.getElementById('modal_overlay');
  if (overlay) overlay.classList.add('hidden');
  if (ModalManager._escHandler) document.removeEventListener('keydown', ModalManager._escHandler);
};
