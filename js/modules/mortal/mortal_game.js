// js/modules/mortal/mortal_game.js
// 凡尘闭关小游戏核心逻辑模块

const MortalMinigame = {
    // --- 内部状态 ---
    state: {
        isRunning: false,
        time: 0,
        score: 0,
        bubbles: [],
        playerX: 50,
        keys: { left: false, right: false },
        greenSpawnCount: 0,
        totalElapsedTime: 0
    },

    // --- DOM 缓存 ---
    ui: {
        $area: null,
        $timer: null,
        $score: null,
        $container: null,
        $paddle: null,
        $overlay: null
    },

    // --- 回调函数 ---
    onFinish: null,

    /**
     * 初始化：绑定 DOM 元素
     * @param {jQuery} $gameArea - 游戏区域的 jQuery 对象
     */
    init: function($gameArea) {
        this.ui.$area = $gameArea;
        this.ui.$timer = $gameArea.find('.game-timer-num');
        this.ui.$score = $gameArea.find('.game-score-num');
        this.ui.$container = $gameArea.find('.game-bubbles-container');
        this.ui.$paddle = $gameArea.find('.game-player-shadow');
        this.ui.$overlay = $gameArea.find('.game-rules-overlay');

        // 预先绑定键盘事件处理函数，方便后续移除
        this._handleKeyDown = this._onKeyDown.bind(this);
        this._handleKeyUp = this._onKeyUp.bind(this);
    },

    /**
     * 显示规则并准备开始
     * @param {Number} duration - 游戏时长（秒）
     * @param {Function} onFinishCallback - 结束回调 (score) => {}
     */
    showRules: function(duration, onFinishCallback) {
        this.onFinish = onFinishCallback;

        // 重置界面
        this.ui.$area.fadeIn(200);
        this.ui.$container.empty();
        this.ui.$timer.text(duration);
        this.ui.$score.text("0");

        // 初始化挡板样式
        this.ui.$paddle.css({
            'width': '50px',
            'height': '6px',
            'background': '#333',
            'border-radius': '3px',
            'filter': 'none',
            'opacity': '1',
            'bottom': '30px',
            'box-shadow': '0 2px 5px rgba(0,0,0,0.2)',
            'left': '50%',
            'transition': 'none'
        });

        // 显示遮罩
        this.ui.$overlay.fadeIn(200);

        // 绑定一次性点击开始
        this.ui.$overlay.off('click').on('click', () => {
            this.ui.$overlay.fadeOut(200);
            this.start(duration);
        });
    },

    /**
     * 正式开始游戏
     */
    start: function(duration) {
        // 重置状态
        this.state.isRunning = true;
        this.state.time = duration;
        this.state.score = 0;
        this.state.bubbles = [];
        this.state.playerX = 50;
        this.state.greenSpawnCount = 0;
        this.state.totalElapsedTime = 0;
        this.state.keys = { left: false, right: false };

        // 绑定事件
        this._bindEvents();

        // 启动循环
        this.lastFrame = Date.now();
        this._gameLoop();
    },

    /**
     * 停止游戏
     */
    stop: function() {
        if (!this.state.isRunning) return;
        this.state.isRunning = false;

        // 停止动画
        cancelAnimationFrame(this.gameLoopRef);

        // 解绑事件
        this._unbindEvents();

        // 隐藏界面
        this.ui.$area.fadeOut(200);

        // 执行回调：传入 分数 和 总耗时(秒)
        if (this.onFinish) {
            // 【修改点】这里增加了第二个参数 this.state.totalElapsedTime
            this.onFinish(this.state.score, this.state.totalElapsedTime);
        }
    },

    // --- 内部逻辑 ---

    _bindEvents: function() {
        // 鼠标移动
        this.ui.$area.off('mousemove').on('mousemove', (e) => this._onMouseMove(e));
        // 键盘控制 (全局)
        document.addEventListener('keydown', this._handleKeyDown);
        document.addEventListener('keyup', this._handleKeyUp);
    },

    _unbindEvents: function() {
        this.ui.$area.off('mousemove');
        document.removeEventListener('keydown', this._handleKeyDown);
        document.removeEventListener('keyup', this._handleKeyUp);
    },

    _onKeyDown: function(e) {
        if (!this.state.isRunning) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.state.keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.state.keys.right = true;
    },

    _onKeyUp: function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.state.keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.state.keys.right = false;
    },

    _onMouseMove: function(e) {
        if (!this.state.isRunning) return;
        const rect = this.ui.$area[0].getBoundingClientRect();
        const relX = e.clientX - rect.left;
        let pct = (relX / rect.width) * 100;
        pct = Math.max(5, Math.min(95, pct));

        this.state.playerX = pct;
        this.ui.$paddle[0].style.left = pct + '%';
    },

    _gameLoop: function() {
        if (!this.state.isRunning) return;

        const now = Date.now();
        const dt = (now - this.lastFrame) / 1000;
        this.lastFrame = now;

        // 1. 键盘移动处理
        if (this.state.keys.left) this.state.playerX -= 80 * dt;
        if (this.state.keys.right) this.state.playerX += 80 * dt;
        this.state.playerX = Math.max(5, Math.min(95, this.state.playerX));

        // 如果有键盘输入，同步更新位置
        if (this.state.keys.left || this.state.keys.right) {
            this.ui.$paddle[0].style.left = this.state.playerX + '%';
        }

        // 2. 时间处理
        this.state.time -= dt;
        this.state.totalElapsedTime += dt;

        if (this.state.time <= 0) {
            this.stop();
            return;
        }

        // 3. UI 更新
        this.ui.$timer.text(Math.ceil(this.state.time));
        this.ui.$score.text(Math.floor(this.state.score));

        // 4. 生成球逻辑
        this._handleSpawning();

        // 5. 更新球位置
        this._updateBubbles(dt);

        this.gameLoopRef = requestAnimationFrame(() => this._gameLoop());
    },

    _handleSpawning: function() {
        // 绿球：每5秒
        const nextGreenTime = (this.state.greenSpawnCount + 1) * 5;
        if (this.state.greenSpawnCount < 5 && this.state.totalElapsedTime >= nextGreenTime) {
            this._spawnBubble('green');
            this.state.greenSpawnCount++;
        }

        // 普通球：随机
        if (Math.random() < 0.05) this._spawnBubble();
    },

    _spawnBubble: function(forceType) {
        let type = forceType;
        let scoreVal = 0;
        let visualClass = '';
        let speed = 20 + (Math.random() * 15);
        const rank = window.player.mortal_rank || 0;

        // 决定类型
        if (!type) {
            // Rank 4+: 2% 概率出现 +10 稀有金球
            if (rank >= 4 && Math.random() < 0.02) {
                type = 'gold-rare';
            } else {
                type = Math.random() < 0.75 ? 'blue' : 'red';
            }
        }

        // 设置属性 (数值全部 X10)
        if (type === 'gold-rare') {
            scoreVal = 100; // 原 10 -> 100
            visualClass = 'bubble-gold-rare'; speed += 30;
        } else if (type === 'blue') {
            const r = Math.random();
            if (rank >= 3 && r < 0.15) { // Rank 3+ 金球
                type = 'gold'; scoreVal = 50; visualClass = 'bubble-gold'; speed += 20; // 原 5 -> 50
            } else if (rank >= 2 && r < 0.30) { // Rank 2+ 紫球
                type = 'purple'; scoreVal = 40; visualClass = 'bubble-purple'; speed += 15; // 原 4 -> 40
            } else { // 蓝球
                const r2 = Math.random();
                if (r2 < 0.6) { scoreVal = 10; visualClass = 'bubble-blue-1'; } // 原 1 -> 10
                else if (r2 < 0.9) { scoreVal = 20; visualClass = 'bubble-blue-2'; speed += 5; } // 原 2 -> 20
                else { scoreVal = 30; visualClass = 'bubble-blue-3'; speed += 10; } // 原 3 -> 30
            }
        } else if (type === 'red') {
            scoreVal = -10; // 原 -1 -> -10 (建议同步放大惩罚，保持平衡)
            visualClass = 'bubble-red';
        } else if (type === 'green') {
            scoreVal = 0; visualClass = 'bubble-green'; speed = 35;
        }

        const el = $(`<div class="g-bubble ${visualClass}"></div>`);
        if (scoreVal > 0) el.text(`+${scoreVal}`);
        if (scoreVal < 0) el.text(scoreVal);
        if (type === 'green') el.text(`+T`);

        const x = Math.random() * 90 + 5;
        el.css({ left: x + '%', top: '-10%' });

        this.ui.$container.append(el);
        this.state.bubbles.push({ el: el, x: x, y: -10, type: type, val: scoreVal, speed: speed });
    },

    _updateBubbles: function(dt) {
        const scoreTypes = ['blue', 'purple', 'gold', 'gold-rare'];

        for (let i = this.state.bubbles.length - 1; i >= 0; i--) {
            const b = this.state.bubbles[i];

            b.y += b.speed * dt;
            b.el.css('top', b.y + '%');

            // 碰撞检测
            if (b.y > 80 && b.y < 90) {
                if (Math.abs(b.x - this.state.playerX) < 8) {
                    if (scoreTypes.includes(b.type)) {
                        this.state.score += b.val;
                        let color = 'green';
                        // 【修改点】颜色阈值同步 X10
                        if (b.val >= 40) color = '#ab47bc'; // 原 4 -> 40
                        if (b.val >= 50) color = '#ffca28'; // 原 5 -> 50
                        if (b.val >= 100) color = '#ff6f00';// 原 10 -> 100
                        this._showFloatText(`+${b.val}`, color);
                    } else if (b.type === 'red') {
                        // 【修改点】扣分逻辑同步
                        this.state.score = Math.max(0, this.state.score - 10);
                        this._showFloatText("-10", "red");
                    } else if (b.type === 'green') {
                        this.state.time += 6;
                        this._showFloatText("时间+6s", "#66bb6a");
                    }
                    b.el.remove();
                    this.state.bubbles.splice(i, 1);
                    continue;
                }
            }

            // 出界
            if (b.y > 100) {
                b.el.remove();
                this.state.bubbles.splice(i, 1);
            }
        }
    },

    _showFloatText: function(text, color) {
        const $float = $(`<div style="position:absolute; bottom:25%; left:${this.state.playerX}%; color:${color}; font-weight:bold; font-size:24px; pointer-events:none; z-index:20; text-shadow:1px 1px 0 #fff; white-space:nowrap;">${text}</div>`);
        this.ui.$area.append($float);
        $float.animate({ bottom: '35%', opacity: 0 }, 600, function() { $(this).remove(); });
    }
};

// 导出到全局
window.MortalMinigame = MortalMinigame;