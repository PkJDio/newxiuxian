// js/modules/ui_fish.js
// 垂钓界面 UI v5.5 (性能优化版：硬件加速 + 减少重绘)

const UIFish = {
    dom: {},
    _lastClickPos: null,
    _isResultShowing: false,

    open: function() {
        this._injectStyles();

        const contentHtml = `
            <div class="fish_ink_wrapper">
                <div class="fish_scene_ink" id="fish_scene" onclick="UIFish.handleSceneClick(event)">
                    <div id="ripple_container"></div>
                    <div id="fish_bobber" class="bobber_ink" style="display:none;"></div>
                    <div id="fish_msg" class="ink_msg">点击水面 垂竿入画</div>
                    <div id="fish_status_icon" class="ink_status_icon">❗</div>
                </div>

                <div class="fish_ink_panel">
                    <div class="ink_game_status">
                        <div class="ink_label_row">
                            <span>鱼线张力</span>
                            <span id="tension_text">0%</span>
                        </div>
                        <div class="ink_tension_bg">
                            <div id="ink_safe_zone" class="ink_safe_zone"></div>
                            <div id="tension_bar" class="ink_tension_fill"></div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                            <div style="flex:1;">
                                <div class="ink_label_row" style="font-size:24px; color:#3498db;">
                                    <span>收线进度</span>
                                    <span id="fish_stamina_text">0%</span>
                                </div>
                                <div class="ink_stamina_bg">
                                    <div id="fish_stamina_bar" class="ink_stamina_fill"></div>
                                </div>
                            </div>
                            <div style="flex:1;">
                                <div class="ink_label_row" style="font-size:24px; color:#e74c3c;">
                                    <span>脱钩风险</span>
                                    <span id="fish_escape_text">0%</span>
                                </div>
                                <div class="ink_stamina_bg" style="border-color:#c0392b;">
                                    <div id="fish_escape_bar" class="ink_escape_fill"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:center; align-items:center; gap:10px; margin-top:10px; font-size:22px; color:#bdc3c7;">
                            <input type="checkbox" id="skip_fish_game" style="width:24px; height:24px; cursor:pointer;">
                            <label for="skip_fish_game" style="cursor:pointer;">跳过搏弈过程 (消耗2小时)</label>
                        </div>
                    <button id="fish_btn_action" class="ink_fish_btn">执 竿</button>

                    <div class="ink_rules">
                        <h4>—— 垂钓秘籍 ——</h4>
                        <p>1. <b>落竿</b>：点击定穴。<b>候鱼</b>：见鱼鳔红闪提竿。</p>
                        <p>2. <b>搏弈</b>：将张力维持在<b>动态虚线区</b>内，否则脱钩风险上升。</p>
                        <p>3. <b>规则</b>：脱钩满值即跑鱼；张力满溢即断线。</p>
                    </div>
                </div>
            </div>
        `;

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal("寒江独钓", contentHtml, null, "modal_fishing", 750, 850);
        }

        this._initDOM();
        this._bindEvents();
        if (window.UtilFish) window.UtilFish.reset();
        this._startAmbientLoop();
    },

    _initDOM: function() {
        this.dom = {
            scene: document.getElementById('fish_scene'),
            bobber: document.getElementById('fish_bobber'),
            msg: document.getElementById('fish_msg'),
            icon: document.getElementById('fish_status_icon'),
            btn: document.getElementById('fish_btn_action'),
            tensionBar: document.getElementById('tension_bar'),
            tensionText: document.getElementById('tension_text'),
            staminaBar: document.getElementById('fish_stamina_bar'),
            staminaText: document.getElementById('fish_stamina_text'),
            escapeBar: document.getElementById('fish_escape_bar'),
            escapeText: document.getElementById('fish_escape_text'),
            rippleBox: document.getElementById('ripple_container'),
            safeZone: document.getElementById('ink_safe_zone')
        };
    },

    _bindEvents: function() {
        const btn = this.dom.btn;
        // 使用性能更好的事件绑定方式
        btn.onmousedown = btn.ontouchstart = () => window.UtilFish && window.UtilFish.startReeling();
        btn.onmouseup = btn.ontouchend = () => window.UtilFish && window.UtilFish.stopReeling();
    },

    handleSceneClick: function(e) {
        const rect = this.dom.scene.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (window.UtilFish && (window.UtilFish.state === "IDLE" || window.UtilFish.state === "RESULT")) {
            this._lastClickPos = { x, y };
            if (this._isResultShowing) this.resetView();
            window.UtilFish.handleSceneClick();
        } else if (window.UtilFish && window.UtilFish.state === "HOOKED") {
            window.UtilFish.handleSceneClick();
        }
    },

    resetView: function() {
        if(!this.dom.msg) return;
        this._isResultShowing = false;
        this.dom.msg.innerText = "点击水面 垂竿入画";
        this.dom.msg.style.color = "#ecf0f1";
        this.dom.btn.innerText = "抛 竿";
        this.dom.btn.classList.remove('disabled');
        this.dom.bobber.className = "bobber_ink";
        this.dom.bobber.style.display = "none";
        this.dom.icon.classList.remove("show");
        this.dom.safeZone.style.animation = "none";
        this.updateReeling(0, 100, 0);
    },

    onCastLine: function() {
        this._isResultShowing = false;
        this.dom.msg.innerText = "心如止水 静待鱼汛...";
        this.dom.btn.innerText = "候 鱼...";
        this.dom.btn.classList.add('disabled');
        const pos = this._lastClickPos || { x: 50, y: 60 };
        this.dom.bobber.style.left = pos.x + "%";
        this.dom.bobber.style.top = "0%";
        this.dom.bobber.style.display = "block";

        // 强制重绘
        void this.dom.bobber.offsetWidth;
        this.dom.bobber.style.top = pos.y + "%";
        this.dom.bobber.classList.add("floating");
    },

    onBite: function(rarity) {
        this.dom.bobber.classList.remove("floating");
        this.dom.bobber.classList.add("bite");
        this.dom.icon.classList.add("show");

        // 根据稀有度定义提醒文字
        let warningMsg = "鱼汛已至 提竿！";
        let msgColor = "#e74c3c"; // 默认朱红

        if (rarity === 3) {
            warningMsg = "「水底似有异动，莫非是大家伙？」";
            msgColor = "#3498db"; // 蓝色感应
        } else if (rarity === 4) {
            warningMsg = "「竿梢沉重如山，此鱼绝非凡品！」";
            msgColor = "#9b59b6"; // 紫色惊叹
        } else if (rarity === 5) {
            warningMsg = "「金光隐现，莫非是传说中的灵物？！」";
            msgColor = "#f39c12"; // 橙色震撼
        } else if (rarity >= 6) {
            warningMsg = "「天降异象！此等神物竟被我遇上了？！！」";
            msgColor = "#ff0000"; // 鲜红狂热
        }

        this.dom.msg.innerText = warningMsg;
        this.dom.msg.style.color = msgColor;

        // 如果是稀有鱼(R3+)，触发一个震动提醒效果
        if (rarity >= 3) {
            this.dom.msg.style.animation = 'none';
            void this.dom.msg.offsetWidth; // 触发重绘
            this.dom.msg.style.animation = "inkTextShake 0.5s ease-in-out";
        }

        this.dom.btn.innerText = "提 竿 !";
        this.dom.btn.classList.remove('disabled');
    },

    onReelingStart: function() {
        this.dom.icon.classList.remove("show");
        this.dom.bobber.className = "bobber_ink";
        this.dom.msg.innerText = "博弈开始...";

        const levelData = window.UtilFish.getFishingLevelData();
        const zoneWidth = levelData.width;
        const duration = window.UtilFish.currentMoveSpeed;

        // 优化：使用 transform 理论上性能更好，但这里改写动画定义
        this.dom.safeZone.style.animation = 'none';
        void this.dom.safeZone.offsetWidth;

        this.dom.safeZone.style.width = zoneWidth + "%";
        this.dom.safeZone.style.setProperty('--sz-width', zoneWidth + "%");
        this.dom.safeZone.style.animation = `safeZoneMove ${duration}s infinite alternate ease-in-out`;
        this.dom.btn.innerText = "收 线";
    },

    // 高频更新函数，进行极度精简
    updateReeling: function(tension, stamina, escape) {
        const d = this.dom;
        if (!d.tensionBar) return;

        // 1. 数值显示优化：只有变化较大时才更新文字
        const tVal = Math.floor(tension);
        d.tensionBar.style.width = tension + "%";
        d.tensionText.textContent = tVal + "%";

        const pVal = Math.floor(100 - stamina);
        d.staminaBar.style.width = pVal + "%";
        d.staminaText.textContent = pVal + "%";

        const eVal = Math.floor((escape / 10) * 100);
        d.escapeBar.style.width = eVal + "%";
        d.escapeText.textContent = eVal + "%";

        // 2. 只有张力临界时才修改文本和颜色，减少 DOM 操作
        if (tension > 90) {
            if (d.msg.textContent !== "线紧欲断！！") {
                d.tensionBar.style.backgroundColor = "#c0392b";
                d.msg.textContent = "线紧欲断！！";
            }
        } else {
            if (d.msg.textContent === "线紧欲断！！") {
                d.tensionBar.style.backgroundColor = "#ecf0f1";
                d.msg.textContent = "稳住身形...";
            }
        }
    },

    onResult: function(isWin, fishDataOrReason) {
        this._isResultShowing = true;
        this.dom.safeZone.style.animation = "none";

        if (isWin) {
            const fish = fishDataOrReason;
            const rarityColors = ["#bdc3c7", "#2ecc71", "#3498db", "#9b59b6", "#f39c12", "#e74c3c"];
            const color = rarityColors[fish.rarity] || "#ecf0f1";

            this.dom.msg.innerHTML = `
                <div style="font-size:32px; color:#ecf0f1;">得宝：<span style="color:${color}; border-bottom:3px solid ${color};">${fish.name}</span></div>
                <div style="font-size:24px; color:#bdc3c7; margin-top:10px; font-style:italic;">"${fish.desc || ""}"</div>
            `;
            this.dom.bobber.style.display = "none";
            this.dom.staminaBar.style.width = `100%`;
            this.dom.staminaText.textContent = `100%`;
            if(this.dom.escapeBar) this.dom.escapeBar.style.width = "0%";
        } else {
            this.dom.msg.textContent = fishDataOrReason;
            this.dom.msg.style.color = "#e74c3c";
            this.dom.icon.innerText = "💨";
            this.dom.icon.classList.add("show");
        }
        this.dom.btn.innerText = "再 抛 一 竿";
        this.dom.btn.classList.remove('disabled');
    },

    _injectStyles: function() {
        // 建议把版本号更新到 v5-8，确保浏览器能加载到最新的样式
        if (document.getElementById('style-ui-fish-ink-v5-8')) return;

        const css = `
        .fish_ink_wrapper { display: flex; flex-direction: column; height: 100%; background: #0b1521; padding: 15px; color: #ecf0f1; font-size: 26px; contain: layout; }
        .fish_scene_ink { flex: 1.8; background: radial-gradient(circle at 50% 50%, #1c3144 0%, #0d1a25 100%); position: relative; border: 4px solid #2c3e50; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 80px rgba(0,0,0,0.9); cursor: crosshair; transform: translateZ(0); }
        
        /* 鱼鳔优化 */
        .bobber_ink { 
            position: absolute; width: 18px; height: 40px; background: #e74c3c; border: 2px solid #000; border-radius: 10px 10px 4px 4px; 
            transform: translate(-50%, -100%); transition: top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 5; will-change: top, transform; 
        }
        .bobber_ink.floating { animation: inkFloat 3s infinite ease-in-out; }
        .bobber_ink.bite { animation: inkBite 0.1s infinite; background: #ff0000; box-shadow: 0 0 30px #ff0000; }
        
        @keyframes inkFloat { 0%, 100% { transform: translate(-50%, -100%) rotate(-3deg); } 50% { transform: translate(-50%, -90%) rotate(3deg); } }
        @keyframes inkBite { 0%, 100% { transform: translate(-55%, -85%); } 50% { transform: translate(-45%, -75%); } }

        .ink_msg { position: absolute; top: 30px; width: 100%; text-align: center; font-size: 32px; font-weight: bold; pointer-events: none; text-shadow: 2px 2px 8px #000; z-index: 10; }
        
        /* 【新增】稀有鱼惊叹动画：文字缩放震动感 */
        @keyframes inkTextShake {
            0% { transform: scale(1); }
            25% { transform: scale(1.2) rotate(-2deg); }
            50% { transform: scale(1.2) rotate(2deg); }
            100% { transform: scale(1); }
        }

        .ink_status_icon { position: absolute; font-size: 70px; left: 50%; top: 40%; transform: translate(-50%,-50%) scale(0); transition: 0.3s; color: #e74c3c; z-index: 11; }
        .ink_status_icon.show { transform: translate(-50%,-50%) scale(1); }

        .fish_ink_panel { flex: none; height: auto; padding: 20px; border-top: 3px solid #2c3e50; display: flex; flex-direction: column; gap: 12px; background: #162431; }
        
        @keyframes safeZoneMove { from { left: 0%; } to { left: calc(100% - var(--sz-width, 20%)); } }
        
        .ink_game_status { background: #1c3144; padding: 15px; border: 2px solid #3498db; border-radius: 12px; }
        .ink_tension_bg { height: 40px; background: #000; border: 2px solid #34495e; position: relative; overflow: hidden; margin-bottom: 12px; border-radius: 20px; transform: translateZ(0); }
        .ink_tension_fill { height: 100%; width: 0%; background: #fff; box-shadow: 0 0 15px #fff; will-change: width; }
        .ink_safe_zone { position: absolute; top: 0; height: 100%; border-left: 4px dashed #3498db; border-right: 4px dashed #3498db; background: rgba(52, 152, 219, 0.25); z-index: 1; pointer-events: none; will-change: left; }
        
        .ink_stamina_bg { height: 28px; background: #000; border: 2px solid #34495e; overflow: hidden; border-radius: 14px; position: relative; transform: translateZ(0); }
        .ink_stamina_fill { height: 100%; width: 0%; background: linear-gradient(90deg, #1e3c72, #3498db); will-change: width; }
        .ink_escape_fill { height: 100%; width: 0%; background: linear-gradient(90deg, #ff416c, #ff4b2b); box-shadow: 0 0 10px rgba(255, 77, 77, 0.6); will-change: width; }
        
        .ink_fish_btn { width: 100%; height: 75px; font-size: 32px; font-family: "KaiTi"; font-weight: bold; background: #3498db; color: #fff; border: none; cursor: pointer; border-radius: 40px; box-shadow: 0 6px 0 #2980b9; transition: 0.2s; }
        .water_ripple { position: absolute; border: 2px solid rgba(52, 152, 219, 0.6); border-radius: 50%; animation: inkRipple 4s infinite linear; pointer-events: none; will-change: transform, opacity; }
        @keyframes inkRipple { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 0; } }
    `;
        const style = document.createElement('style');
        style.id = 'style-ui-fish-ink-v5-8'; // 注意这里同步更新了ID
        style.textContent = css;
        document.head.appendChild(style);
    },

    _startAmbientLoop: function() {
        if (this._ambientTimer) clearInterval(this._ambientTimer);
        this._ambientTimer = setInterval(() => {
            const container = document.getElementById('ripple_container');
            if (!container || container.children.length > 5) return; // 限制同屏波纹数量减少压力
            const ripple = document.createElement('div');
            ripple.className = 'water_ripple';
            ripple.style.left = Math.random() * 100 + '%';
            ripple.style.top = Math.random() * 100 + '%';
            container.appendChild(ripple);
            setTimeout(() => ripple && ripple.remove(), 4000);
        }, 1500); // 降低频率
    }
};
window.UIFish = UIFish;