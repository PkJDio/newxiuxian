/* js/core/app_utils_modal.js */
/**
 * 新版弹窗管理器 - 移动端水墨风专用
 * 所有的 ID 和 Class 均以 util_app_modal_ 开头
 */

let AppUtilsModal = {
    // 容器层 ID (对应 index_app.html 中的 layer-modal)
    layerId: 'app_ui_layer_modal',

    // ==========================================
    // 3-1: 迷你提醒 (Toast)
    // ==========================================
    showToast: function(content, options = {}) {
        const {
            position = 'top',   // top, center
            duration = 3000,
            style = 'white'     // white, black
        } = options;

        const toast = document.createElement('div');
        toast.className = `util_app_modal_toast util_app_modal_toast_${position} util_app_modal_toast_${style}`;
        toast.innerHTML = content; // 支持HTML

        this._addToLayer(toast);

        // 定时销毁
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if(toast.parentNode) toast.parentNode.removeChild(toast);
            }, 500);
        }, duration);
    },

    // ==========================================
    // 3-2: 接收式弹窗 (Alert) - 只有一个确认按钮
    // ==========================================
    showAlert: function(title, content, options = {}) {
        const {
            confirmText = '确认',
            style = 'normal', // normal, good, bad, history
            onConfirm = null,
            isLarge = false   // 是否为大尺寸窗口(如更新日志)
        } = options;

        const htmlConfig = {
            title,
            content,
            styleClass: `util_app_modal_style_${style} ${isLarge ? 'util_app_modal_large' : ''}`,
            buttons: [
                { text: confirmText, class: '', onClick: onConfirm, close: true }
            ]
        };

        this._createAndShowModal(htmlConfig);
    },

    // ==========================================
    // 3-3: 确认式弹窗 (Confirm) - 确认/取消
    // ==========================================
    showConfirm: function(title, content, options = {}) {
        const {
            confirmText = '确认',
            cancelText = '取消',
            style = 'normal',
            onConfirm = null,
            onCancel = null
        } = options;

        const htmlConfig = {
            title,
            content,
            styleClass: `util_app_modal_style_${style}`,
            buttons: [
                { text: cancelText, class: 'util_app_modal_btn_cancel', onClick: onCancel, close: true },
                { text: confirmText, class: '', onClick: onConfirm, close: true }
            ]
        };

        this._createAndShowModal(htmlConfig);
    },

    // ==========================================
    // 3-4: 列表式弹窗 (List)
    // ==========================================
    showList: function(title, listData, options = {}) {
        // listData 格式: [{ label: "名称", value: "数值/内容", color: "#333" }, ...]
        // 或者简单的字符串数组

        let listHtml = '<ul class="util_app_modal_list_ul">';
        listData.forEach(item => {
            if (typeof item === 'string') {
                listHtml += `<li class="util_app_modal_list_li">${item}</li>`;
            } else {
                const valStyle = item.color ? `style="color:${item.color}"` : '';
                listHtml += `
                    <li class="util_app_modal_list_li">
                        <span>${item.label}</span>
                        <span ${valStyle}>${item.value || ''}</span>
                    </li>`;
            }
        });
        listHtml += '</ul>';

        const htmlConfig = {
            title,
            content: listHtml,
            styleClass: 'util_app_modal_style_normal',
            buttons: [
                { text: '关闭', class: '', onClick: null, close: true }
            ]
        };

        this._createAndShowModal(htmlConfig);
    },

    // ==========================================
    // 内部私有方法：构建 DOM
    // ==========================================
    _createAndShowModal: function(config) {
        // 1. 创建遮罩
        const overlay = document.createElement('div');
        overlay.className = 'util_app_modal_overlay';

        // 2. 创建窗口
        const windowDiv = document.createElement('div');
        windowDiv.className = `util_app_modal_window ${config.styleClass || ''}`;

        // 3. 组装 HTML
        // Header
        const header = document.createElement('div');
        header.className = 'util_app_modal_header';
        header.innerHTML = config.title;

        // Content
        const content = document.createElement('div');
        content.className = 'util_app_modal_content';
        content.innerHTML = config.content;

        // Footer & Buttons
        const footer = document.createElement('div');
        footer.className = 'util_app_modal_footer';

        config.buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.className = `util_app_modal_btn ${btnConfig.class || ''}`;
            btn.innerText = btnConfig.text;

            btn.onclick = () => {
                if (btnConfig.onClick) btnConfig.onClick();
                if (btnConfig.close) this._closeModal(overlay);
            };
            footer.appendChild(btn);
        });

        // 4. 插入结构
        windowDiv.appendChild(header);
        windowDiv.appendChild(content);
        windowDiv.appendChild(footer);
        overlay.appendChild(windowDiv);

        this._addToLayer(overlay);
    },

    _closeModal: function(overlayDom) {
        if(overlayDom && overlayDom.parentNode) {
            // 这里可以加一个淡出动画，目前直接移除
            overlayDom.parentNode.removeChild(overlayDom);
        }
    },

    _addToLayer: function(element) {
        const layer = document.getElementById(this.layerId);
        if (layer) {
            layer.appendChild(element);
        } else {
            console.error("找不到弹窗层:", this.layerId);
            document.body.appendChild(element); // 降级处理
        }
    }
};

// 挂载到 window 方便调用
window.AppUtilsModal = AppUtilsModal;