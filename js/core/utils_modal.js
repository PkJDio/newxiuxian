// js/core/utils_modal.js
// 弹窗管理模块 v3.2 (增强版：支持通过参数控制 ESC 和遮罩点击行为)

const ModalManager = {
    _modalStack: [],  // 弹窗堆栈
    _baseZIndex: 1000,
    _lastOpenTime: 0, // 防连点计时器

    // ================= 初始化 =================
    init: function() {
        const legacyOverlay = document.getElementById('modal_overlay');
        if (legacyOverlay && !legacyOverlay.classList.contains('dynamic_modal')) {
            legacyOverlay.remove();
        }
        this._injectQingyunStyles(); // 注入青云赛专用样式
        this._injectMortalStyles();
    },
    // =========================================================================
    //  新增：凡尘武学突破/任务完成 专用提醒弹窗
    // =========================================================================
    /**
     * 显示凡尘突破/任务完成提醒
     * @param {string} title 标题 (如: "瓶颈突破")
     * @param {string} content 内容 (如: "试炼圆满，可前往突破！")
     * @param {Function} onConfirm 点击按钮后的回调 (可选)
     */
    showMortalBreakthroughModal: function(title, content, onConfirm = null) {
        // 创建临时回调
        const tempName = 'mortal_cb_' + Date.now();
        window[tempName] = () => {
            window.closeModal();
            if (onConfirm) onConfirm();
            delete window[tempName];
        };

        const footer = `
            <div style="text-align:center; padding-bottom:10px;">
                <button class="mortal_btn_confirm" onclick="window['${tempName}']()">前往查看</button>
            </div>
        `;

        // 使用专用样式类 modal_mortal_alert
        // 禁止点击外部关闭，必须点按钮确认
        this._showBaseModal('modal_mortal_alert', title, content, footer, "", 35, null, { allowOutsideClick: false, allowEsc: true });
    },

    _injectMortalStyles: function() {
        if (document.getElementById('style-modal-mortal')) return;
        const style = document.createElement('style');
        style.id = 'style-modal-mortal';
        style.innerHTML = `
            /* 凡尘突破弹窗：深色金边风格 */
            .modal_mortal_alert {
                background: linear-gradient(135deg, #263238 0%, #37474f 100%) !important;
                border: 2px solid #ffd700 !important;
                box-shadow: 0 0 25px rgba(255, 215, 0, 0.4), inset 0 0 50px rgba(0,0,0,0.5) !important;
                color: #eceff1;
                font-family: "KaiTi", serif;
                border-radius: 8px !important;
                overflow: visible !important;
                animation: mortal-pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
            }
            
            .modal_mortal_alert .modal_header {
                background: transparent !important;
                border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
                color: #ffd700 !important;
                font-size: 24px !important;
                text-align: center !important;
                padding: 15px !important;
                letter-spacing: 2px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }

            .modal_mortal_alert .modal_body {
                font-size: 18px;
                line-height: 1.6;
                text-align: center;
                padding: 30px 20px !important;
                color: #fff;
            }

            /* 确认按钮：金色流光 */
            .mortal_btn_confirm {
                background: linear-gradient(to bottom, #ffca28, #ff6f00);
                color: #3e2723;
                border: 1px solid #ff8f00;
                padding: 10px 40px;
                font-size: 20px;
                font-family: "KaiTi";
                font-weight: bold;
                border-radius: 4px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.4);
                transition: all 0.1s;
            }
            .mortal_btn_confirm:hover {
                filter: brightness(1.1);
                transform: scale(1.05);
            }
            .mortal_btn_confirm:active {
                transform: scale(0.95);
            }

            /* 动画 */
            @keyframes mortal-pop {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    },
    /**
     * 样式1：互动式决策弹窗 (确认/取消/自定义双按钮)
     * @param {string} title 标题
     * @param {string} content 内容
     * @param {string} btn1Text 左侧主按钮文字 (如：阳谋)
     * @param {string} btn2Text 右侧主按钮文字 (如：阴谋)
     * @param {Function} onBtn1 点击左侧回调
     * @param {Function} onBtn2 点击右侧回调
     */
    showQingyunDecision: function(title, content, btn1Text, btn2Text, onBtn1, onBtn2) {
        const tempName1 = 'qy_cb_1_' + Date.now();
        const tempName2 = 'qy_cb_2_' + Date.now();

        window[tempName1] = () => { window.closeModal(); if(onBtn1) onBtn1(); delete window[tempName1]; delete window[tempName2]; };
        window[tempName2] = () => { window.closeModal(); if(onBtn2) onBtn2(); delete window[tempName1]; delete window[tempName2]; };

        const footer = `
            <div class="qy_modal_footer">
                <button class="qy_btn_choice yang" onclick="window['${tempName1}']()">${btn1Text}</button>
                <button class="qy_btn_choice yin" onclick="window['${tempName2}']()">${btn2Text}</button>
            </div>
            <div style="margin-top:15px; text-align:center;">
                <button class="qy_btn_cancel" onclick="window.closeModal()">取消操作</button>
            </div>
        `;

        this._showBaseModal('modal_qingyun_decision', title, content, footer, "", 30, null, { allowOutsideClick: false });
    },

    /**
     * 样式2：中央提醒 Toast (3秒消失)
     * @param {string} msg 消息内容
     */
    showQingyunToast: function(msg) {
        // 清理旧的
        document.querySelectorAll('.qy_center_toast').forEach(el => el.remove());

        const toast = document.createElement('div');
        toast.className = 'qy_center_toast';
        toast.innerHTML = msg;
        document.body.appendChild(toast);

        // 动画进入
        requestAnimationFrame(() => toast.classList.add('visible'));

        // 3秒后移除
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    /**
     * 样式3：消息告知弹窗 (单按钮确认)
     * @param {string} title 标题
     * @param {string} content 内容
     * @param {Function} onClose 关闭回调(可选)
     */
    showQingyunNotice: function(title, content, onClose = null) {
        const tempName = 'qy_cb_close_' + Date.now();
        window[tempName] = () => {
            window.closeModal();
            if(onClose) onClose();
            delete window[tempName];
        };

        const footer = `
            <div class="qy_modal_footer" style="justify-content:center;">
                <button class="qy_btn_confirm" onclick="window['${tempName}']()">知晓</button>
            </div>
        `;

        this._showBaseModal('modal_qingyun_notice', title, content, footer, "", 35, null, { allowOutsideClick: false });
    },

    /**
     * 【额外】颜色选择器 (替代 prompt)
     */
    showQingyunColorSelect: function(onSelect) {
        const colors = [
            { id: 'red', name: '赤 (红)', color: '#ef5350' },
            { id: 'blue', name: '青 (蓝)', color: '#42a5f5' },
            { id: 'green', name: '翠 (绿)', color: '#66bb6a' },
            { id: 'yellow', name: '金 (黄)', color: '#ffee58', text: '#333' },
            { id: 'white', name: '白 (白)', color: '#eceff1', text: '#333' }
        ];

        let html = `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:10px;">`;
        colors.forEach(c => {
            const textColor = c.text || '#fff';
            html += `<button onclick="window.selectQyColor('${c.id}')" 
                style="background:${c.color}; color:${textColor}; padding:15px; border:none; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer; font-family:'KaiTi'; box-shadow:0 3px 5px rgba(0,0,0,0.2);">
                ${c.name}
            </button>`;
        });
        html += `</div>`;

        // 挂载临时全局函数
        window.selectQyColor = (colorId) => {
            window.closeModal();
            delete window.selectQyColor;
            if (onSelect) onSelect(colorId);
        };

        this._showBaseModal('modal_qingyun_select', "请选择下注颜色", html, null, "", 30, null, { allowOutsideClick: false });
    },

    // 注入样式
    _injectQingyunStyles: function() {
        if (document.getElementById('style-qingyun-modals')) return;
        const style = document.createElement('style');
        style.id = 'style-qingyun-modals';
        style.innerHTML = `
            /* 通用弹窗容器 */
            .modal_qingyun_decision, .modal_qingyun_notice, .modal_qingyun_select {
                background: #263238 !important; border: 2px solid #546e7a !important; 
                box-shadow: 0 0 30px rgba(0,0,0,0.8) !important; color: #eceff1;
                font-family: "KaiTi", serif; border-radius: 8px !important;
            }
            .modal_qingyun_decision .modal_header, .modal_qingyun_notice .modal_header {
                border-bottom: 1px solid #37474f !important; font-size: 22px !important;
                text-align: center !important; padding: 15px !important; color: #b0bec5;
            }
            .modal_qingyun_decision .modal_body, .modal_qingyun_notice .modal_body {
                font-size: 18px; line-height: 1.6; text-align: center; padding: 20px !important;
            }

            /* 按钮样式 */
            .qy_modal_footer { display: flex; gap: 15px; justify-content: space-around; padding: 10px 20px 20px; }
            .qy_btn_choice, .qy_btn_cancel, .qy_btn_confirm {
                padding: 10px 25px; font-size: 18px; font-family: "KaiTi"; border-radius: 4px;
                cursor: pointer; border: none; transition: transform 0.1s; font-weight: bold;
            }
            .qy_btn_choice.yang { background: #d32f2f; color: #fff; box-shadow: 0 4px 0 #b71c1c; }
            .qy_btn_choice.yin { background: #1976d2; color: #fff; box-shadow: 0 4px 0 #0d47a1; }
            .qy_btn_choice:active { transform: translateY(4px); box-shadow: none; }
            
            .qy_btn_cancel { background: transparent; border: 1px solid #546e7a; color: #90a4ae; font-size: 16px; padding: 8px 20px; }
            .qy_btn_cancel:hover { background: #37474f; color: #fff; }

            .qy_btn_confirm { background: #ffd700; color: #3e2723; padding: 10px 40px; box-shadow: 0 4px 0 #f57f17; }
            .qy_btn_confirm:active { transform: translateY(4px); box-shadow: none; }

            /* 中央提醒 Toast */
            .qy_center_toast {
                position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%) scale(0.8);
                background: rgba(0, 0, 0, 0.85); color: #ffd700; border: 1px solid #ffd700;
                padding: 20px 40px; font-size: 24px; font-family: "KaiTi"; font-weight: bold;
                border-radius: 8px; z-index: 2000; pointer-events: none; opacity: 0;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center;
                text-shadow: 1px 1px 0 #000;
            }
            .qy_center_toast.visible { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        `;
        document.head.appendChild(style);
    },
    // =========================================================================
    //  新增：装备强化成功专属特效弹窗 (+8 ~ +14)
    // =========================================================================
    /**
     * 显示强化成功特效弹窗
     * @param {number} level 当前强化等级
     * @param {string} itemName 装备名称
     * @param {Function} onConfirm 确认回调
     */
    showReinforceSuccessModal: function(level, itemName, onConfirm) {
        this._injectReinforceStyles();

        // 根据等级选择样式类 (8-14)
        // 如果超过14，默认使用14的样式
        const styleIndex = Math.min(14, Math.max(8, level));
        const styleClass = `modal_reinforce_lv${styleIndex}`;

        // 不同等级的标题文案
        const titles = {
            8: "⚡ 异 象 初 现 ⚡",
            9: "🌊 撼 动 天 地 🌊",
            10: "👹 鬼 斧 神 工 👹",
            11: "🌟 夺 天 造 化 🌟",
            12: "🔥 神 鬼 皆 惊 🔥",
            13: "⚡ 逆 转 乾 坤 ⚡",
            14: "👑 举 世 无 双 👑"
        };
        const titleText = titles[styleIndex] || "强 化 成 功";

        // 创建临时回调
        const tempName = 'reinforce_cb_' + Date.now();
        window[tempName] = () => {
            window.closeModal();
            if (onConfirm) onConfirm();
            delete window[tempName];
        };

        const content = `
            <div class="reinforce_success_body">
                <div class="reinforce_item_name">${itemName}</div>
                <div class="reinforce_level_tag">强化等级 <span class="num">+${level}</span></div>
                <div class="reinforce_desc">器灵觉醒，威能大增！</div>
            </div>
        `;

        const footer = `
            <div style="text-align:center; padding-bottom:15px;">
                <button class="reinforce_btn_confirm" onclick="window['${tempName}']()">收下神兵</button>
            </div>
        `;

        // 这里的 40 是宽度 vw
        this._showBaseModal(styleClass, titleText, content, footer, "modal_reinforce_base", 40, null, { allowOutsideClick: false, allowEsc: false });
    },

    _injectReinforceStyles: function() {
        if (document.getElementById('style-modal-reinforce')) return;
        const style = document.createElement('style');
        style.id = 'style-modal-reinforce';
        style.innerHTML = `
            /* 基础布局 */
            .modal_reinforce_base {
                font-family: "KaiTi", serif;
                text-align: center;
                overflow: visible !important;
                border-radius: 12px !important;
                transition: transform 0.3s;
                animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .reinforce_success_body { padding: 20px; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
            .reinforce_item_name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .reinforce_level_tag { font-size: 36px; font-weight: bold; color: #ffd700; margin: 15px 0; }
            .reinforce_level_tag .num { font-size: 48px; }
            .reinforce_desc { font-size: 18px; opacity: 0.8; }
            .reinforce_btn_confirm {
                background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.5);
                color: #fff; padding: 10px 40px; font-size: 20px; font-family: "KaiTi";
                cursor: pointer; border-radius: 30px; transition: all 0.2s;
            }
            .reinforce_btn_confirm:hover { background: #fff; color: #000; transform: scale(1.05); }

            @keyframes pop-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            @keyframes breathe { 0%, 100% { box-shadow: 0 0 20px currentColor; } 50% { box-shadow: 0 0 40px currentColor; } }
            @keyframes shake-hard { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
            @keyframes rainbow-border { 0% { border-color: #ff0000; box-shadow: 0 0 40px #ff0000; } 20% { border-color: #ff00ff; box-shadow: 0 0 40px #ff00ff; } 40% { border-color: #0000ff; box-shadow: 0 0 40px #0000ff; } 60% { border-color: #00ffff; box-shadow: 0 0 40px #00ffff; } 80% { border-color: #00ff00; box-shadow: 0 0 40px #00ff00; } 100% { border-color: #ffff00; box-shadow: 0 0 40px #ffff00; } }

            /* ================= 样式分级 (+8 ~ +14) ================= */
            
            /* Lv.8: 异象初现 (青色悬浮) */
            .modal_reinforce_lv8 {
                background: linear-gradient(135deg, #006064 0%, #0097a7 100%) !important;
                border: 2px solid #84ffff !important;
                box-shadow: 0 0 20px #00bcd4 !important;
            }
            .modal_reinforce_lv8 .modal_header { background: rgba(0,0,0,0.2) !important; color: #84ffff !important; }

            /* Lv.9: 撼动天地 (翠绿脉动) */
            .modal_reinforce_lv9 {
                background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%) !important;
                border: 2px solid #69f0ae !important;
                color: #69f0ae;
                animation: breathe 3s infinite alternate !important;
            }
            .modal_reinforce_lv9 .modal_header { background: rgba(0,0,0,0.2) !important; color: #69f0ae !important; }

            /* Lv.10: 鬼斧神工 (深紫幽冥) */
            .modal_reinforce_lv10 {
                background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%) !important;
                border: 3px solid #e040fb !important;
                box-shadow: 0 0 30px #d500f9 !important;
            }
            .modal_reinforce_lv10 .modal_header { background: transparent !important; color: #e040fb !important; font-size: 24px !important; letter-spacing: 4px; }

            /* Lv.11: 夺天造化 (纯金圣光) */
            .modal_reinforce_lv11 {
                background: linear-gradient(to bottom, #ff6f00, #ff8f00) !important;
                border: 3px solid #ffff00 !important;
                box-shadow: 0 0 50px rgba(255, 215, 0, 0.8) !important;
            }
            .modal_reinforce_lv11 .modal_header { color: #fff !important; text-shadow: 0 0 10px #ffff00; font-size: 26px !important; }
            .modal_reinforce_lv11 .reinforce_level_tag { color: #fff !important; text-shadow: 0 0 20px #ffd700; }

            /* Lv.12: 神鬼皆惊 (血红震颤) */
            .modal_reinforce_lv12 {
                background: #b71c1c !important;
                border: 4px solid #ff1744 !important;
                box-shadow: 0 0 60px #ff1744 !important;
                animation: shake-hard 0.5s infinite !important;
            }
            .modal_reinforce_lv12 .modal_header { color: #000 !important; background: #ff5252 !important; font-weight: 900 !important; }

            /* Lv.13: 逆转乾坤 (黑洞雷霆 - 反色) */
            .modal_reinforce_lv13 {
                background: #000 !important;
                border: 4px double #fff !important;
                box-shadow: 0 0 40px #fff, inset 0 0 40px #2196f3 !important;
            }
            .modal_reinforce_lv13 .modal_header { color: #fff !important; border-bottom: 2px dashed #2196f3 !important; }
            .modal_reinforce_lv13 .reinforce_item_name { color: #2196f3; text-shadow: 0 0 10px #fff; }

            /* Lv.14: 举世无双 (彩虹流光 - 终极) */
            .modal_reinforce_lv14 {
                background: #1a1a1a !important;
                border: 5px solid transparent !important;
                animation: rainbow-border 2s linear infinite !important;
            }
            .modal_reinforce_lv14 .modal_header { 
                background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff) !important;
                -webkit-background-clip: text !important;
                color: transparent !important;
                font-size: 32px !important;
                font-weight: 900 !important;
            }
            .modal_reinforce_lv14 .reinforce_level_tag { font-size: 50px !important; text-shadow: 0 0 30px #fff; }
        `;
        document.head.appendChild(style);
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
        return this._showBaseModal('modal_skill', title, contentHtml, null, "", null, null, { allowOutsideClick: false, allowEsc: true }).body;
    },

    // 4. 事件弹窗 (默认允许关闭)
    // 4. 事件弹窗 (修改：支持回调 + 强制互动)
    showEventModal: function(title, contentHtml, onConfirm = null) {

        // 内部渲染函数，接受临时的回调函数名 (如果有)
        const renderWithCallback = (funcName) => {
            // 如果有回调名，则调用它；否则直接关闭
            const clickAction = funcName ? `window['${funcName}']()` : "window.closeModal()";

            // 强制禁止点击外部关闭 (options = { allowOutsideClick: false })
            // 确保玩家只能点击按钮，保证回调一定执行
            const { box, body } = this._showBaseModal('history_modal_box', title, contentHtml, null, "", null, null, { allowOutsideClick: false });

            // --- DOM 样式后处理 (保持原有的历史事件样式) ---
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
                // 绑定点击事件
                footer.innerHTML = `<button class="history_btn_confirm" onclick="${clickAction}">阅毕</button>`;
            }
        };

        // 如果传入了回调，使用 ModalManager 自带的临时回调生成器
        if (onConfirm) {
            this._createTempCallback(onConfirm, renderWithCallback);
        } else {
            renderWithCallback(null);
        }

        // 注意：showEventModal 通常不需要返回 body，因为它主要是展示
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

    /**
     * 显示选择弹窗 (最终修正版：宽窗口 + 黑色气泡 + 允许自定义HTML颜色)
     * @param {String} title 标题
     * @param {Array} options 选项数组
     * @param {String} [contentText] (可选) 对话内容
     */
    showSelectionModal: function(title, options, contentText = null) {
        // 1. 构建按钮列表
        const callbacks = {};
        let buttonsHtml = options.map((opt, index) => {
            const cbName = `modal_sel_cb_${Date.now()}_${index}`;
            window[cbName] = () => {
                if (opt.autoClose !== false) this.closeTopModal();
                if (opt.onClick) opt.onClick();
                delete window[cbName];
            };
            const btnStyle = opt.style || "";
            return `
                <button onclick="window['${cbName}']()" class="ink_btn_normal" style="
                    width:100%; padding: 10px 15px; font-size: 15px; margin-bottom: 8px; 
                    min-height: auto; height: auto; line-height: 1.4; ${btnStyle}
                ">
                    ${opt.text}
                </button>
            `;
        }).join('');

        // 2. 显示基础弹窗
        const modalBody = this.showInteractiveModal(title, buttonsHtml, null, "modal_compact");

        // 3. 样式调整 & 气泡挂载
        if (modalBody) {
            const modalBox = modalBody.closest('.ink_modal_box');

            if (modalBox) {
                // === A. 窗口样式 (宽版) ===
                modalBox.style.width = '550px';
                modalBox.style.maxWidth = '95%';
                modalBox.style.height = 'auto';
                modalBox.style.minHeight = 'auto';
                modalBox.style.overflow = 'visible';
                modalBox.style.position = 'relative';

                modalBody.style.padding = '15px 20px';
                modalBody.style.overflow = 'visible';

                // === B. 气泡挂载 ===
                if (contentText) {
                    const bubble = document.createElement('div');
                    bubble.className = 'npc-outside-bubble';

                    Object.assign(bubble.style, {
                        position: 'absolute',
                        bottom: '100%',
                        left: '0',
                        width: '100%',
                        marginBottom: '15px',
                        zIndex: '10',
                        pointerEvents: 'none'
                    });

                    // 这里只设置默认颜色为白，不强制覆盖子元素
                    bubble.innerHTML = `
                        <div style="
                            background: #111; 
                            color: #fff;  /* 默认白色 */
                            padding: 15px 20px;
                            border-radius: 8px;
                            border: 1px solid #555;
                            box-shadow: 0 5px 20px rgba(0,0,0,0.6);
                            font-size: 16px;
                            line-height: 1.6;
                            text-align: left;
                            position: relative;
                            pointer-events: auto;
                            text-shadow: none; /* 去掉阴影，防止模糊 */
                        ">
                            ${contentText}
                            
                            <div style="
                                position: absolute;
                                bottom: -8px; left: 40px; 
                                width: 0; height: 0; 
                                border-left: 8px solid transparent;
                                border-right: 8px solid transparent;
                                border-top: 8px solid #111;
                            "></div>
                        </div>
                    `;
                    modalBox.appendChild(bubble);
                }
            }
        }
    },

    // 8. 大地图
    showMapModal: function(onOpenCallback) {
        if (this._modalStack.length > 0 && this._modalStack[this._modalStack.length - 1].title === '九州舆图') {
            this.closeTopModal();
        }

        // 大地图默认允许 ESC 和 点击外部关闭
        const mapOptions = { allowOutsideClick: false, allowEsc: true };
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
// ===============================================
    // 10. 死亡通知弹窗 (带防双击)
    // ===============================================
    showDeathModal: function(title, contentHtml, onConfirm) {
        this._injectDeathStyles();

        // 【检查轮回条件】
        const canCarry = window.player && (window.player.timeStart || 0) > 0;
        const btnText = canCarry ? "选择物品开始下一次轮回" : "重新来过";
        const btnStyle = canCarry ? 'background: linear-gradient(to bottom, #d84315, #bf360c);' : '';

        this._createTempCallback(onConfirm, (funcName) => {
            const footer = `
                <div class="ink_modal_footer" style="justify-content: center !important; border-top: none !important;">
                    <button class="ink_btn_death" style="${btnStyle}" onclick="this.disabled=true; window['${funcName}']()">
                        <span class="btn_icon">🕯️</span><span class="btn_text">${btnText}</span>
                    </button>
                </div>`;

            this._showBaseModal('modal_death', title, contentHtml, footer, "", 45, null, { allowOutsideClick: false, allowEsc: false });
        });
    },

    // ===============================================
    // 11. 轮回装备选择弹窗 (完整版)
    // ===============================================
    showSamsaraSelectionModal: function(items, onSelect) {
        console.log(">>> [Modal] 打开轮回装备选择界面, 物品数:", items.length);

        // 生成网格 HTML
        let gridHtml = `
            <div style="padding:10px; text-align:center; font-family:'KaiTi';">
                <p style="font-size:18px; color:#d32f2f; margin-bottom:15px; font-weight:bold;">魂牵梦萦：请选择一件装备随你入轮回</p>
                <div class="samsara_grid" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:10px; max-height:300px; overflow-y:auto; padding:5px; background:#f0f0f0; border-radius:4px;">
        `;

        items.forEach((item, index) => {
            const rarityColor = window.RARITY_CONFIG && window.RARITY_CONFIG[item.rarity] ? window.RARITY_CONFIG[item.rarity].color : "#333";

            // 【核心修改】检查是否为轮回遗物，生成左上角标记
            const samsaraMark = item.samsaraItem ?
                `<div style="position:absolute; top:2px; left:2px; font-size:14px; color:#9c27b0; z-index:5; line-height:1; text-shadow: 1px 1px 0 #fff;">☯️</div>`
                : '';

            gridHtml += `
                <div class="samsara_item_slot" 
                     onclick="window.selectSamsaraItem(${index})"
                     id="samsara_slot_${index}"
                     style="border:2px solid #ccc; background:#fff; padding:5px; cursor:pointer; position:relative; min-height:80px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:4px; transition:all 0.2s;"
                     onmouseenter="window.showItemTooltip && window.showItemTooltip(event, '${item.sid}')"
                     onmouseleave="window.hideTooltip && window.hideTooltip()">
                    
                    ${samsaraMark} <div style="font-size:24px; margin-bottom:4px;">${getItemIcon(item)}</div>
                    <div style="color:${rarityColor}; font-weight:bold; font-size:13px; line-height:1.2; word-break:break-all;">${item.name}</div>
                </div>
            `;
        });

        gridHtml += `</div></div>`;

        // 绑定选择逻辑
        window.selectSamsaraItem = (idx) => {
            // 重置所有边框
            document.querySelectorAll('.samsara_item_slot').forEach(el => {
                el.style.borderColor = '#ccc';
                el.style.backgroundColor = '#fff';
                el.style.boxShadow = 'none';
            });
            // 高亮选中
            const el = document.getElementById(`samsara_slot_${idx}`);
            if (el) {
                el.style.borderColor = '#d32f2f';
                el.style.backgroundColor = '#ffebee';
                el.style.boxShadow = '0 0 8px rgba(211, 47, 47, 0.5)';
            }
            window._tempSamsaraIdx = idx;
        };

        // 绑定确认逻辑
        window.confirmSamsaraSelection = () => {
            if (window._tempSamsaraIdx === undefined) {
                if(window.showToast) window.showToast("请先点击选择一件遗物");
                return;
            }
            const selected = items[window._tempSamsaraIdx];
            console.log(">>> [Modal] 确认选择:", selected.name);

            // 清理
            delete window._tempSamsaraIdx;
            delete window.selectSamsaraItem;
            delete window.confirmSamsaraSelection;

            // 关闭当前弹窗
            window.closeModal();

            // 执行回调
            if(onSelect) onSelect(selected);
        };

        const footer = `
            <button class="ink_btn" style="width:100%; background:#5d4037; color:#fff; padding:12px; font-size:18px;" onclick="this.disabled=true; window.confirmSamsaraSelection()">确认带走</button>
        `;

        this._showBaseModal('modal_samsara', "轮回契约", gridHtml, footer, "", 50, null, { allowOutsideClick: false, allowEsc: false });
    },

    _injectDeathStyles: function() {
        if (document.getElementById('style-modal-death')) return;
        const style = document.createElement('style');
        style.id = 'style-modal-death';
        style.innerHTML = `
            .modal_death { border: 2px solid #5d4037 !important; background-color: #fdfbf7 !important; box-shadow: 0 0 25px rgba(0,0,0,0.85) !important; min-width: 450px !important; }
            .modal_death .modal_header { background: #1a1a1a !important; color: #d32f2f !important; border-bottom: 2px solid #5d4037 !important; text-align: center !important; font-family: "KaiTi", serif; font-size: 26px !important; letter-spacing: 4px; padding: 15px 0 !important; }
            .modal_death .modal_body { text-align: center; font-family: "KaiTi", serif; font-size: 22px; padding: 40px 30px !important; color: #333; display: flex; flex-direction: column; justify-content: center; align-items: center; line-height: 1.6; }
            .ink_btn_death { background: linear-gradient(to bottom, #b71c1c, #800000); color: #fce4ec; border: 1px solid #500; padding: 12px 60px; font-size: 22px; font-family: "KaiTi"; font-weight: bold; cursor: pointer; box-shadow: 0 4px 5px rgba(0,0,0,0.3); border-radius: 4px; transition: transform 0.1s; text-shadow: 1px 1px 0 #000; margin-bottom: 10px; }
            .ink_btn_death:hover { background: linear-gradient(to bottom, #c62828, #b71c1c); color: #fff; }
            .ink_btn_death:active { transform: translateY(2px); box-shadow: 0 2px 3px rgba(0,0,0,0.3); }
            .btn_icon { margin-right: 10px; font-size: 24px; vertical-align: middle; }
            .btn_text { vertical-align: middle; }
        `;
        document.head.appendChild(style);
    },
// 11. 战败通知弹窗 (灰色颓废风，只有确认按钮)
    // 11. 战败通知弹窗 (修复版：加宽布局)
    showDefeatModal: function(title, contentHtml, onConfirm) {
        // 1. 注入战败专属样式
        this._injectDefeatStyles();

        // 2. 创建回调
        this._createTempCallback(onConfirm, (funcName) => {
            const footer = `
                <div class="ink_modal_footer" style="justify-content: center !important; border-top: none !important;">
                    <button class="ink_btn_defeat" onclick="window['${funcName}']()">
                        <span class="btn_icon">🤕</span><span class="btn_text">黯然离去</span>
                    </button>
                </div>`;

            // 3. 强制锁定
            const strictOptions = { allowOutsideClick: false, allowEsc: false };

            // 【核心修改】这里第6个参数从 null 改为 45，表示宽度设为 45vw (屏幕宽度的45%)
            // 这样它就是一个横向的矩形了
            this._showBaseModal('modal_defeat', title, contentHtml, footer, "", 45, null, strictOptions);
        });
    },

    _injectDefeatStyles: function() {
        if (document.getElementById('style-modal-defeat')) return;
        const style = document.createElement('style');
        style.id = 'style-modal-defeat';
        style.innerHTML = `
            /* 战败弹窗：灰色调，表现挫败感 */
            .modal_defeat {
                border: 2px solid #757575 !important;
                background-color: #f5f5f5 !important;
                box-shadow: 0 0 20px rgba(0,0,0,0.6) !important;
                /* 【核心修改】增加最小宽度，防止内容少时太窄 */
                min-width: 450px !important; 
            }
            .modal_defeat .modal_header {
                background: #616161 !important;
                color: #e0e0e0 !important;
                border-bottom: 2px solid #9e9e9e !important;
                text-align: center !important;
                font-family: "KaiTi", serif;
                font-size: 24px !important; /* 标题字号加大 */
                letter-spacing: 2px;
                padding: 12px 0 !important;
            }
            .modal_defeat .modal_body {
                text-align: center;
                font-family: "KaiTi", serif;
                font-size: 20px;
                /* 【核心修改】增加内边距，让布局更宽松 */
                padding: 40px 30px !important; 
                color: #555;
                line-height: 1.6;
            }
            /* 按钮样式优化 */
            .ink_btn_defeat {
                background: linear-gradient(to bottom, #8d6e63, #5d4037);
                color: #fff;
                border: 1px solid #4e342e;
                padding: 12px 50px; /* 按钮也加宽 */
                font-size: 20px;
                font-family: "KaiTi";
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.25);
                border-radius: 4px;
                transition: all 0.2s;
                text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
            }
            .ink_btn_defeat:hover {
                background: linear-gradient(to bottom, #a1887f, #6d4c41);
                transform: translateY(-2px);
                box-shadow: 0 6px 8px rgba(0,0,0,0.3);
            }
            .ink_btn_defeat:active {
                transform: translateY(1px);
            }
            .btn_icon { margin-right: 8px; font-size: 22px; vertical-align: middle; }
            .btn_text { vertical-align: middle; }
        `;
        document.head.appendChild(style);
    },

    // 12. 钓鱼奇遇弹窗 (1/5 长宽比，水墨主题)
    showFortuneModal: function(eventData) {
        this._injectFortuneStyles();

        const isGood = eventData.type === 'good';
        const titlePrefix = isGood ? "✨ 祥瑞降世" : "⚠️ 偶生波折";
        const themeClass = isGood ? "fortune_good" : "fortune_bad";

        const contentHtml = `
            <div class="fortune_body">
                <div class="fortune_event_name">${eventData.name}</div>
                <div class="fortune_desc">${eventData.desc}</div>
            </div>
        `;

        const footerHtml = `<button class="ink_btn_fortune" onclick="window.closeModal()">顺应天命</button>`;

        // 计算 1/5 的尺寸 (约 20vw)
        this._showBaseModal('modal_fortune', titlePrefix, contentHtml, footerHtml, themeClass, 25, 35, { allowOutsideClick: false });
    },

    _injectFortuneStyles: function() {
        if (document.getElementById('style-modal-fortune')) return;
        const style = document.createElement('style');
        style.id = 'style-modal-fortune';
        style.innerHTML = `
            /* 基础容器 */
            .modal_fortune { border: 2px solid #5d4037 !important; border-radius: 8px !important; overflow: visible !important; }
            
            /* 祥瑞：喜庆红金 */
            .fortune_good.modal_fortune { background: #fff9f0 !important; box-shadow: 0 0 20px rgba(216, 67, 21, 0.4) !important; }
            .fortune_good .modal_header { background: #d84315 !important; color: #fff !important; }
            .fortune_good .fortune_event_name { color: #b71c1c; }

            /* 波折：压抑灰墨 */
            .fortune_bad.modal_fortune { background: #f5f5f5 !important; box-shadow: 0 0 15px rgba(0,0,0,0.3) !important; }
            .fortune_bad .modal_header { background: #424242 !important; color: #eee !important; }
            .fortune_bad .fortune_event_name { color: #333; }

            /* 内容样式 */
            .fortune_body { text-align: center; padding: 10px; font-family: "KaiTi", serif; }
            .fortune_event_name { font-size: 24px; font-weight: bold; margin-bottom: 15px; letter-spacing: 2px; }
            .fortune_desc { font-size: 18px; line-height: 1.6; color: #5d4037; }
            
            .ink_btn_fortune { 
                width: 100%; padding: 10px; background: #5d4037; color: #fff; 
                border: none; cursor: pointer; font-family: "KaiTi"; font-size: 18px; 
            }
        `;
        document.head.appendChild(style);
    },
    // 13. 赌坊结算弹窗 (新增)
    // 13. 赌坊结算弹窗 (增强版：支持自定义文本)
    showGambleResultModal: function(isWin, amount, onConfirm, customMsg = null, customTitle = null) {
        this._injectGambleResultStyles();

        // 支持自定义标题和内容
        const title = customTitle || (isWin ? "✨ 大 获 全 胜 ✨" : "💀 棋 差 一 着 💀");
        const themeClass = isWin ? "gamble_win" : "gamble_loss";
        const icon = isWin ? "🀄" : "💸";

        // 默认文本 vs 自定义文本
        let msg = isWin ? `技高一筹，赢取筹码` : `技不如人，损失筹码`;
        if (customMsg) msg = customMsg;

        const amountClass = isWin ? "win_amount" : "loss_amount";
        const amountPrefix = isWin ? "+" : "-";

        const contentHtml = `
            <div class="gamble_result_body">
                <div class="gamble_icon ${isWin ? 'anim_bounce' : 'anim_shake'}">${icon}</div>
                <div class="gamble_msg">${msg}</div>
                <div class="${amountClass}">${amountPrefix}${amount} 文</div>
            </div>
        `;

        this._createTempCallback(onConfirm, (funcName) => {
            const btnText = isWin ? "收钱离场" : "黯然离场";
            const btnStyle = isWin ? "ink_btn_win" : "ink_btn_loss";

            const footer = `
                <div style="text-align:center; width:100%;">
                    <button class="${btnStyle}" onclick="window['${funcName}']()">${btnText}</button>
                </div>`;

            this._showBaseModal('modal_gamble_result', title, contentHtml, footer, themeClass, 40, 45, { allowOutsideClick: false, allowEsc: false });
        });
    },

    _injectGambleResultStyles: function() {
        if (document.getElementById('style-modal-gamble-result')) return;
        const style = document.createElement('style');
        style.id = 'style-modal-gamble-result';
        style.innerHTML = `
            /* 基础弹窗结构 */
            .modal_gamble_result { border-radius: 12px !important; overflow: visible !important; min-width: 300px; }
            .modal_gamble_result .modal_header { 
                text-align: center !important; font-family: "LiSu", "隶书", cursive; 
                font-size: 32px !important; letter-spacing: 4px; padding: 20px 0 !important; 
                border: none !important; margin-bottom: 0 !important;
            }
            
            /* === 胜利主题 (金红) === */
            .gamble_win { background: #fff8e1 !important; border: 4px solid #fbc02d !important; box-shadow: 0 0 30px rgba(255, 193, 7, 0.6) !important; }
            .gamble_win .modal_header { 
                color: #d84315 !important; 
                background: linear-gradient(to bottom, #fffde7, #fff9c4); 
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1); 
                border-bottom: 2px dashed #fbc02d !important;
            }
            .win_amount { font-size: 48px; font-weight: bold; color: #d84315; font-family: "KaiTi"; text-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-top: 10px; }
            
            /* 胜利按钮 */
            .ink_btn_win { 
                background: linear-gradient(to bottom, #fbc02d, #f57f17); color: #3e2723; 
                border: 2px solid #f9a825; padding: 12px 50px; font-size: 24px; font-weight: bold; 
                border-radius: 30px; cursor: pointer; box-shadow: 0 4px 5px rgba(0,0,0,0.2); font-family: "KaiTi"; 
                transition: transform 0.1s;
            }
            .ink_btn_win:hover { transform: scale(1.05); filter: brightness(1.1); }
            .ink_btn_win:active { transform: scale(0.95); }

            /* === 失败主题 (灰暗) === */
            .gamble_loss { background: #eceff1 !important; border: 4px solid #78909c !important; filter: grayscale(0.2); box-shadow: 0 0 20px rgba(0,0,0,0.5) !important; }
            .gamble_loss .modal_header { 
                color: #455a64 !important; background: #cfd8dc; 
                border-bottom: 2px solid #b0bec5 !important;
            }
            .loss_amount { font-size: 48px; font-weight: bold; color: #546e7a; font-family: "KaiTi"; margin-top: 10px; text-decoration: line-through; opacity: 0.6; }
            
            /* 失败按钮 */
            .ink_btn_loss { 
                background: #90a4ae; color: #fff; border: 2px solid #607d8b; 
                padding: 12px 50px; font-size: 22px; border-radius: 4px; cursor: pointer; font-family: "KaiTi"; 
                transition: background 0.2s;
            }
            .ink_btn_loss:hover { background: #78909c; }

            /* 内容布局 */
            .gamble_result_body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; font-family: "KaiTi"; padding: 20px; }
            .gamble_icon { font-size: 80px; margin-bottom: 10px; line-height: 1; }
            .gamble_msg { font-size: 22px; color: #555; font-weight: bold; }
            
            /* 动画 */
            @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
            .anim_bounce { animation: bounce 1s; }
            
            @keyframes shakeX { 0%, 100% {transform: translateX(0);} 10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);} 20%, 40%, 60%, 80% {transform: translateX(5px);} }
            .anim_shake { animation: shakeX 0.5s; }
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
            allowOutsideClick: false,
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
// 新增这一行
window.showDeathModal = ModalManager.showDeathModal.bind(ModalManager);
window.showDefeatModal = ModalManager.showDefeatModal.bind(ModalManager);
window.showFortuneModal = ModalManager.showFortuneModal.bind(ModalManager);
// 新增这一行
window.showGambleResultModal = ModalManager.showGambleResultModal.bind(ModalManager);
// 新增接口
window.showMortalBreakthroughModal = ModalManager.showMortalBreakthroughModal.bind(ModalManager);
// 新增接口 (添加到文件末尾)
window.showReinforceSuccessModal = ModalManager.showReinforceSuccessModal.bind(ModalManager);
