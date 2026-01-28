// js/modules/ui_mortal.js
// 凡尘武学UI管理模块 v3.1 (布局调整 + 粒子特效增强)

const UI_Mortal = {
    // --- DOM 缓存对象 ---
    ui: {
        $container: null,
        $rankName: null, $rankDesc: null, $progBar: null, $progText: null,
        $buffList: null, $btnBreak: null, $btnRetreat: null,
        $taskInfo: null,
        $gongfaStage: null,
        $headerContainer: null, // 改名为 Container，包含球和书
        $orb: null,
        $gameArea: null,

        // 食物选择窗口缓存
        $foodModal: null, $foodProgress: null, $foodGrid: null, $foodBtn: null, $foodText: null
    },

    // --- 状态变量 ---
    state: {
        isOpen: false,
        selectedFoods: {},
        requiredHunger: 0,
        currentHunger: 0,
        animationInterval: null,
        liquidInstance: null // 新增
    },

    /**
     * 打开界面 (入口)
     */
    open: function() {
        if (!window.player) return;

        if (typeof window.player.mortal_rank === 'undefined') {
            window.player.mortal_rank = 0;
            window.player.mortal_exp = 0;
            window.player.mortal_path_history = {};
        }

        this.state.isOpen = true;
        const htmlContent = this._buildTemplate();

        const bodyEl = window.UtilsModal.showInteractiveModal(
            "凡尘武学", htmlContent, null, "modal_mortal_theme", null, 80,
            { onClose: () => this.close() }
        );

        const $el = $(bodyEl);
        this.ui.$container = $el;

        // 重新获取 DOM 引用
        this.ui.$headerContainer = $el.find('.mortal-header-container');

        // 【修改】获取球体容器
        this.ui.$orb = $el.find('#mortal-orb-container');
        // 【修改】获取液体填充层
        this.ui.$orbLiquid = $el.find('.orb-liquid-fill');

        this.ui.$rankName = $el.find('.mortal-rank-name');
        this.ui.$rankDesc = $el.find('.mortal-rank-desc');
        this.ui.$gongfaStage = $el.find('.mortal-gongfa-stage');

        this.ui.$progBar = $el.find('.mortal-bar-inner');
        this.ui.$progText = $el.find('.mortal-bar-text');
        this.ui.$taskInfo = $el.find('#mortal-task-info');
        this.ui.$buffList = $el.find('.mortal-buff-list');
        this.ui.$btnBreak = $el.find('.btn-breakthrough');
        this.ui.$btnRetreat = $el.find('.btn-retreat');
        this.ui.$gameArea = $el.find('.mortal-game-area');

        if (window.MortalMinigame) {
            window.MortalMinigame.init(this.ui.$gameArea);
        }

        this._bindEvents();
        // 【新增】初始化 Canvas 液体
        // 稍微延迟确保 DOM 已渲染
        setTimeout(() => {
            if (this.state.liquidInstance) this.state.liquidInstance.stop();
            this.state.liquidInstance = new InkLiquidWave('liquid-canvas');
            this.state.liquidInstance.start();
            this.render(); // 重新渲染一次以更新进度
        }, 50);

        // 启动增强版粒子动画
        this.startParticleEffect();
    },

    close: function() {
        this.state.isOpen = false;
        if (this.state.animationInterval) {
            clearInterval(this.state.animationInterval);
            this.state.animationInterval = null;
        }
        // 【新增】停止 Canvas 动画
        if (this.state.liquidInstance) {
            this.state.liquidInstance.stop();
            this.state.liquidInstance = null;
        }
        if (window.MortalMinigame) window.MortalMinigame.stop();
        this.ui.$container = null;
        if (window.TooltipManager && window.TooltipManager.hide) window.TooltipManager.hide();
    },

    _buildTemplate: function() {
        return `
            <style>
                /* --- 基础样式 --- */
                .mortal-history-row { margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
                .mortal-history-title { font-size: 16px; font-weight: bold; color: #5d4037; margin-bottom: 8px; font-family: "KaiTi", serif; }
                .mortal-history-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
                .mortal-path-item { padding: 8px 2px; text-align: center; border-radius: 4px; cursor: help; font-family: "KaiTi", serif; font-size: 18px !important; transition: all 0.2s; border: 1px solid transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .mortal-path-item.active { background: linear-gradient(to bottom, #fff8e1, #ffecb3); border-color: #ffd700; color: #d84315; font-weight: bold; box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3); }
                .mortal-path-item.inactive { background: #f5f5f5; color: #bdbdbd; border-color: #e0e0e0; }
                .mortal-path-item.inactive:hover { background: #eeeeee; color: #757575; }
                /* 【修改点】背景改为纯白 #ffffff */
                .mortal-header-wrapper { padding: 10px 20px 5px 20px;  border-bottom: 1px solid #e0e0e0; }
                .mortal-header-container { position: relative; display: flex; align-items: center; justify-content: flex-start; height: 120px; }

                /* === 境界球容器 === */
                .mortal-rank-badge {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    /* 磨砂玻璃背景 */
                    background: rgba(255, 255, 255, 0.1);
                    /* 玻璃光泽 */
                    box-shadow: 
                        inset 0 0 10px rgba(0,0,0,0.2),
                        inset 2px 5px 10px rgba(255,255,255,0.3), 
                        0 5px 15px rgba(0,0,0,0.3);
                    position: relative;
                    z-index: 5;
                    flex-shrink: 0;
                    margin-right: 30px;
                    border: 4px solid #546e7a;
                    /* 【修改点1】改为 visible，允许显示外部虚线框 */
                    overflow: visible; 
                }

                /* 【修改点2】新增背后旋转的虚线框 */
                .mortal-rank-badge::before {
                    content: '';
                    position: absolute;
                    /* 比球体大一圈 (上下左右各扩展8px) */
                    top: -8px; left: -8px; right: -8px; bottom: -8px;
                    border: 1px dashed #90a4ae; /* 灰蓝色虚线 */
                    border-radius: 50%;
                    z-index: -1; /* 位于球体之后 */
                    opacity: 0.6;
                    animation: dashedSpin 60s linear infinite; /* 缓慢旋转 */
                }

                @keyframes dashedSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* === Canvas 液体层 === */
                #liquid-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    opacity: 0.9;
                    /* 【修改点3】必须给Canvas加圆角，否则液体会变成方形 */
                    border-radius: 50%;
                }

                /* 文字容器 */
                .mortal-rank-text-container {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: 20;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-shadow: 0 0 3px #000, 0 0 5px #000;
                    pointer-events: none;
                }

                /* ... 保持其他原有样式 ... */
                .mortal-rank-name { font-size: 30px; font-weight: bold; text-align: center; line-height: 1.1; color: #fff; white-space: nowrap; }
                .bottleneck-tag { font-size: 25px; color: #ff5252; margin-top: 2px; display: block; font-weight: bold; text-shadow: 1px 1px 0 #000; }
                .mortal-gongfa-stage { flex: 1; height: 100%; display: flex; align-items: center; justify-content: space-around; padding: 0 10px; position: relative; }
                .mortal-rank-desc { text-align: center; font-size: 13px; color: #5d4037; font-style: italic; margin-top: -5px; margin-bottom: 10px; font-family: "KaiTi"; }
                .mortal-afk-tip { text-align: center; font-size: 14px; color: #795548; margin-top: 5px; margin-bottom: 5px; padding: 4px; background: rgba(0,0,0,0.03); border-radius: 4px; border: 1px dashed #d7ccc8; }
                .gongfa-book { width: 50px; height: 70px; border-radius: 2px 4px 4px 2px; box-shadow: 2px 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; writing-mode: vertical-rl; font-family: "KaiTi", serif; font-size: 14px; font-weight: bold; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); position: relative; border: 1px solid rgba(255,255,255,0.3); transition: transform 0.3s; cursor: help; z-index: 10; }
                .gongfa-book:hover { transform: translateY(-5px); }
                .gongfa-book::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: rgba(0,0,0,0.2); border-radius: 2px 0 0 2px; }
                .gongfa-book::after { content: '修'; position: absolute; top: 5px; right: 8px; width: 14px; height: 14px; background: rgba(255,255,255,0.8); font-size: 10px; color: #333; text-align: center; line-height: 14px; border-radius: 50%; }
                .mortal-particle { position: absolute; font-size: 15px !important; font-weight: bold !important; color: #000 !important; font-family: "KaiTi", "SimSun", serif; pointer-events: none; opacity: 0; z-index: 20; text-shadow: 0 0 2px rgba(255, 255, 255, 0.8); animation: particleFlow var(--dur) cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards; }
                @keyframes particleFlow { 0% { opacity: 0; transform: translate(0, 0) scale(0.2); } 15% { opacity: 1; transform: translate(var(--sx), var(--sy)) scale(1.2); } 80% { opacity: 0.8; transform: translate(calc(var(--tx) * 0.8), calc(var(--ty) * 0.8)) scale(0.8) rotate(var(--rot)); } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); } }
            
                /* ============================================================ */
                /* 【核心修改】为道途感悟列表添加固定高度和滚动条 */
                /* ============================================================ */
                .mortal-buff-list {
                    max-height: 200px; /* 固定最大高度，超过此高度出现滚动条 */
                    overflow-y: auto;  /* 允许垂直滚动 */
                    padding: 5px;
                    border: 1px solid #f0f0f0;
                    border-radius: 4px;
                    background: #fdfdfd;
                }
                
                /* 美化滚动条 (Webkit内核) */
                .mortal-buff-list::-webkit-scrollbar {
                    width: 6px;
                }
                .mortal-buff-list::-webkit-scrollbar-thumb {
                    background-color: #ccc;
                    border-radius: 3px;
                }
                .mortal-buff-list::-webkit-scrollbar-track {
                    background-color: transparent;
                }
                /* ============================================================ */
            </style>

            <div class="mortal-layout">
                <div class="mortal-header-wrapper">
                    <div class="mortal-header-container">
                        <div class="mortal-rank-badge" id="mortal-orb-container">
                            <canvas id="liquid-canvas" width="100" height="100"></canvas>
                            <div class="mortal-rank-text-container">
                                <div class="mortal-rank-name">--</div>
                            </div>
                        </div>
                        <div class="mortal-gongfa-stage">
                            <div style="color:#aaa; font-size:14px;">暂未装备功法</div>
                        </div>
                    </div>
                    <div class="mortal-rank-desc">--</div>
                </div>
                <div class="mortal-progress-wrap"><div class="mortal-bar-bg"><div class="mortal-bar-inner" style="width: 0%"></div><div class="mortal-bar-text">0 / 0</div></div></div>
                <div class="mortal-afk-tip"><span style="font-weight:bold;">⏳ 岁月流转</span> 时间流逝时，将根据<span style="color:#d84315">已装备功法的总稀有度</span>自动积累修为进度</div>
                <div id="mortal-task-info" style="text-align:center; font-size:13px; color:#d84315; margin-top:5px; min-height:24px; font-weight:bold;"></div>
                
                <div class="mortal-buff-section">
                    <div class="section-title">道途感悟</div>
                    <div class="mortal-buff-list"></div>
                </div>
                
                <div class="mortal-actions"><button class="ink-btn btn-retreat">深度闭关</button><button class="ink-btn btn-breakthrough" style="display:none;">突破瓶颈</button></div>
                <div class="mortal-game-area" style="display:none;">
                    <div class="game-hud"><span>心神: <b class="game-timer-num">30</b>s</span><span>感悟: <b class="game-score-num">0</b></span></div>
                    <div class="game-bubbles-container"></div><div class="game-player-shadow"></div>
                    <div class="game-rules-overlay" style="display:none;">
                        <div class="rules-content">
                            <h3>✦ 闭关法则 ✦</h3>
                            <div style="text-align:left; font-size:16px; line-height:1.8; color:#ccc9c9; padding:0 20px;"><p>1. 移动鼠标或按 <b style="color:#d84315">A/D</b> 控制【心神】守御灵台。</p><p>2. 接引飘落的 <b style="color:#1e88e5">灵光</b> (彩球) 以积累感悟。</p><p>3. 避开纷扰的 <b style="color:#e53935">杂念</b> (红球)，否则修为流失。</p><p>4. 若遇 <b style="color:#43a047">机缘</b> (绿球)，可延缓出关时间。</p></div>
                            <div class="rules-start-btn">点击任意处开始</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _bindEvents: function() { if (!this.ui.$container) return; },

    render: function() {
        if (!this.state.isOpen || !this.ui.$container) return;

        const p = window.player;
        const rank = p.mortal_rank || 0;
        const ranksConfig = window.DATA_MORTAL.RANKS;
        const currentConfig = ranksConfig[rank] || { name: "未知", maxExp: 9999, desc: "..." };

        let nameHtml = currentConfig.name;
        if (p.is_bottleneck) nameHtml += `<span class="bottleneck-tag"> (瓶颈)</span>`;
        this.ui.$rankName.html(nameHtml);
        this.ui.$rankDesc.text(currentConfig.desc);

        this._renderBooks();

        const task = p.mortal_task;
        if (task) {
            this.renderTaskMode(task);
        } else {
            this.renderNormalMode(p, rank, currentConfig);
        }

        this._renderHistory(p, ranksConfig);
    },

    _renderBooks: function() {
        if (!window.UtilsGongfa) {
            this.ui.$gongfaStage.html('UtilsGongfa missing');
            return;
        }

        const books = window.UtilsGongfa.getEquippedGongfaDetail();
        const displayBooks = books.slice(0, 6);

        if (displayBooks.length === 0) {
            this.ui.$gongfaStage.html('<div style="color:#bbb; font-size:14px; font-style:italic;">身无长物，唯有一腔热血</div>');
            return;
        }

        let html = '';
        displayBooks.forEach(book => {
            const shortName = book.name.substring(0, 2);
            // 记录 rarity 到 data 属性，供粒子系统读取
            html += `
                <div class="gongfa-book" 
                     style="background:${book.rarityColor}; border-color:${book.rarityBg};"
                     data-id="${book.id}"
                     data-rarity="${book.rarity || 1}"
                     onmouseenter="window.showSkillTooltip && window.showSkillTooltip(event, '${book.id}')"
                     onmouseleave="window.hideTooltip && window.hideTooltip()">
                    ${shortName}
                </div>
            `;
        });
        this.ui.$gongfaStage.html(html);
    },

    // 增强版粒子动画 (黑色加粗 + 扩散吸入效果)
    startParticleEffect: function() {
        if (this.state.animationInterval) clearInterval(this.state.animationInterval);

        // 扩充字库 (100+字)
        const charsString = "天地玄黄宇宙洪荒日月盈昃辰宿列张寒暑往来秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐坐朝问道垂拱平章爱育黎首臣伏戎羌遐迩一体率宾归王鸣凤在竹白驹食场化被草木赖及万方盖此身发四大五常恭惟鞠养岂敢毁伤女慕贞洁男效才良知过必改得能莫忘罔谈彼短靡恃己长信使可覆器欲难量墨悲丝染诗赞羊羔";
        const chars = charsString.split('');

        // 定义单次爆发逻辑
        const spawnWave = () => {
            if (!this.state.isOpen || !this.ui.$gongfaStage) return;

            const $books = this.ui.$gongfaStage.find('.gongfa-book');
            if ($books.length === 0) return;

            const parentOffset = this.ui.$headerContainer.offset();
            const orbOffset = this.ui.$orb.offset();
            if (!parentOffset || !orbOffset) return;

            // 终点：球体中心 (相对于容器)
            const endX = (orbOffset.left - parentOffset.left) + 50; // +50 是球半径
            const endY = (orbOffset.top - parentOffset.top) + 50;

            // 遍历每一本书 (一起触发)
            $books.each((i, el) => {
                const $book = $(el);
                const rarity = parseInt($book.data('rarity')) || 1;
                const bookOffset = $book.offset();

                // 起点：书本中心
                const startX = (bookOffset.left - parentOffset.left) + 25; // +25 是书宽一半
                const startY = (bookOffset.top - parentOffset.top) + 35; // +35 是书高一半

                // 计算终点位移向量
                const tx = endX - startX;
                const ty = endY - startY;

                // 根据稀有度生成 N 个粒子 (R6 -> 6个字)
                for (let k = 0; k < rarity; k++) {

                    // 稍微错开一点生成时间，不要完全重叠，但要看起来是一波出来的
                    const spawnDelay = Math.random() * 300;

                    setTimeout(() => {
                        if (!this.state.isOpen) return;

                        const char = chars[Math.floor(Math.random() * chars.length)];
                        const duration = 2.0 + Math.random() * 1.0; // 2.0s ~ 3.0s 飞行时间

                        // --- 计算扩散阶段的坐标 (扩散) ---
                        // 随机扩散半径 30px ~ 60px
                        const spreadDist = 30 + Math.random() * 30;
                        // 随机扩散角度
                        const angle = Math.random() * 2 * Math.PI;
                        const sx = Math.cos(angle) * spreadDist;
                        const sy = Math.sin(angle) * spreadDist;

                        // 随机旋转
                        const rot = Math.random() * 360 + 'deg';

                        const $p = $(`<div class="mortal-particle">${char}</div>`);
                        $p.css({
                            left: startX + 'px',
                            top: startY + 'px',
                            '--sx': `${sx}px`, // 扩散X
                            '--sy': `${sy}px`, // 扩散Y
                            '--tx': `${tx}px`, // 终点X
                            '--ty': `${ty}px`, // 终点Y
                            '--dur': `${duration}s`,
                            '--rot': rot
                        });

                        this.ui.$headerContainer.append($p);

                        // 动画结束后销毁
                        setTimeout(() => { $p.remove(); }, duration * 1000);
                    }, spawnDelay);
                }
            });
        };

        // 1. 立即执行一次
        spawnWave();

        // 2. 之后每 2.5 秒执行一次
        this.state.animationInterval = setInterval(spawnWave, 2500);
    },

    // --- 以下逻辑保持 v2.6 的功能 (Grid布局 + 悬浮窗 + 任务显示 + 时间流逝) ---
    _renderHistory: function(p, ranksConfig) {
        let listHtml = '';
        const history = p.mortal_path_history || {};
        const historyRanks = Object.keys(history).map(Number).sort((a, b) => a - b);

        if (historyRanks.length === 0) {
            listHtml = '<div class="no-buff">暂无感悟，请先进行突破。</div>';
        } else {
            historyRanks.forEach(rIdx => {
                const record = history[rIdx];
                const rankName = ranksConfig[rIdx] ? ranksConfig[rIdx].name : `Rank${rIdx}`;
                let rowHtml = `<div class="mortal-history-row"><div class="mortal-history-title">${rankName} 突破</div><div class="mortal-history-grid">`;

                for (let i = 1; i <= 6; i++) {
                    const cfg = window.DATA_MORTAL.PATHS[i];
                    let variantName = "未知";
                    if (cfg.name_variants && cfg.name_variants.length > 0) {
                        const safeIdx = Math.min(rIdx, cfg.name_variants.length - 1);
                        variantName = cfg.name_variants[safeIdx];
                    }
                    const fullName = `${rankName}·${variantName}`;
                    const isSelected = (record.name === fullName);
                    const statusClass = isSelected ? 'active' : 'inactive';

                    let rewardText = "";
                    if (cfg.reward) {
                        const attrNames = cfg.reward.attr.split(',').map(key => {
                            return (window.ATTR_MAPPING && window.ATTR_MAPPING[key]) ? window.ATTR_MAPPING[key] : key;
                        }).join("、");
                        let valStr = "";
                        const isPercent = (cfg.reward.val <= 1 && !cfg.reward.attr.includes('nums')) || cfg.reward.attr.includes('Pct') || cfg.reward.attr.includes('all');
                        valStr = isPercent ? `+${(cfg.reward.val * 100).toFixed(0)}%` : `+${cfg.reward.val}`;
                        rewardText = (cfg.reward.attr === 'all' || cfg.reward.attr === 'all2') ? `全属性 ${valStr}` : `${attrNames} ${valStr}`;
                    } else { rewardText = cfg.attr_desc || "未知奖励"; }

                    const tooltipArgs = `event, '${fullName}', '${cfg.desc}', '${rewardText}', ${isSelected}`;
                    rowHtml += `<div class="mortal-path-item ${statusClass}" onmouseenter="window.showMortalPathTooltip && window.showMortalPathTooltip(${tooltipArgs})" onmouseleave="window.hideTooltip && window.hideTooltip()">${fullName}</div>`;
                }
                rowHtml += `</div></div>`;
                listHtml += rowHtml;
            });
        }
        this.ui.$buffList.html(listHtml);
    },

    renderNormalMode: function(p, rank, config) {
        this.ui.$taskInfo.text("");
        this.ui.$progBar.removeClass('task-bar');
        const max = config.maxExp;
        const cur = p.mortal_exp || 0;
        let pct = (max > 0) ? Math.min(100, (cur / max) * 100) : 0;
        pct = pct.toFixed(1);

        this.ui.$progBar.css('width', pct + '%');
        this.ui.$progText.text(`${Math.floor(cur)} / ${max}`);

        // 【核心修改】更新 Canvas 液体高度
        if (this.state.liquidInstance) {
            if (p.is_bottleneck) {
                this.state.liquidInstance.setProgress(100);
            } else {
                this.state.liquidInstance.setProgress(pct);
            }
        }

        if (p.is_bottleneck) {
            this.ui.$btnBreak.show().text("突破瓶颈").removeClass('disabled').addClass('ink-pulse')
                .off('click').on('click', () => this.onBreakthroughClick());
            this.ui.$btnRetreat.hide();
        } else {
            this.ui.$btnBreak.hide().removeClass('ink-pulse');
            const cost = window.DATA_MORTAL.RETREAT_COST[rank] || 500;
            this.ui.$btnRetreat.show().text(`深度闭关 (需 ${cost} 饱食)`).removeClass('btn-danger')
                .off('click').on('click', () => this.onRetreatClick());
        }
    },

    renderTaskMode: function(task) {
        const pct = Math.min(100, (task.mainCurrent / task.mainTarget) * 100);
        this.ui.$progBar.css('width', pct + '%').addClass('task-bar');
        this.ui.$progText.text(`${task.mainDesc}: ${Math.floor(task.mainCurrent)} / ${task.mainTarget}`);

        // ============================================================
        // 【核心修复】任务/突破模式下，强制让液体填满
        // ============================================================
        if (this.state.liquidInstance) {
            this.state.liquidInstance.setProgress(100);
        }
        // ============================================================


        let descInfo = `正在进行【${task.name}】试炼`;
        if (task.minSpeed > 0) {
            let realSpeed = 10;
            if (window.player.derived && window.player.derived.speed) realSpeed = window.player.derived.speed;
            const color = realSpeed > task.minSpeed ? 'green' : 'red';
            descInfo += ` <span style='color:#757575; font-size:12px;'>(需速度>${task.minSpeed} 当前:<span style="color:${color}">${realSpeed}</span>)</span>`;
        }
        if (task.extra) {
            const exPct = Math.min(100, (task.extra.current / task.extra.target) * 100).toFixed(0);
            descInfo += `<br>额外: ${task.extra.desc} (${exPct}%)`;
        }
        if (task.costMoney > 0) {
            const color = player.money >= task.costMoney ? 'green' : 'red';
            descInfo += `<br>突破需消耗: <span style="color:${color}">${task.costMoney} 钱</span>`;
        }
        this.ui.$taskInfo.html(descInfo);

        this.ui.$btnRetreat.show().text("放弃试炼").addClass('btn-danger')
            .off('click').on('click', () => {
            if (window.UtilsMortalTask && window.UtilsMortalTask.abandonTask) {
                window.UtilsMortalTask.abandonTask();
                this.render();
            }
        });

        this.ui.$btnBreak.show();
        if (task.state === "completed") {
            this.ui.$btnBreak.text("完成突破 !").removeClass('disabled').addClass('ink-pulse')
                .off('click').on('click', () => {
                if (window.UtilsMortalTask && window.UtilsMortalTask.finishTask) {
                    const success = window.UtilsMortalTask.finishTask();
                    if (success) this.render();
                }
            });
            this.ui.$taskInfo.html(`<span style="color:green">★ 试炼圆满，心境通明，可以突破！</span>`);
        } else {
            this.ui.$btnBreak.text("试炼进行中...").addClass('disabled').removeClass('ink-pulse').off('click');
        }
    },

    onBreakthroughClick: function() {
        if (!window.DATA_MORTAL) return;
        const rank = window.player.mortal_rank || 0;
        const paths = window.DATA_MORTAL.PATHS;
        const ranks = window.DATA_MORTAL.RANKS;
        const currentRankName = (ranks[rank] && ranks[rank].name) ? ranks[rank].name : `Rank${rank}`;
        const nextRankObj = ranks[rank + 1];
        const nextRankName = nextRankObj ? nextRankObj.name : "未知境界";
        const title = `选择突破方向 (${currentRankName} ➝ ${nextRankName})`;

        const options = [];
        for (let i = 1; i <= 6; i++) {
            const cfg = paths[i];
            if (!cfg) continue;

            let taskText = "";
            const mainVal = cfg.formula(rank);
            taskText += `${cfg.task_desc} <span style="color:#d32f2f">${mainVal}</span>`;

            if (cfg.min_speed_formula) {
                const minSpd = cfg.min_speed_formula(rank);
                taskText += ` <span style="color:#757575; font-size:12px;">(需速度>${minSpd})</span>`;
            }
            if (cfg.extra && cfg.extra[rank]) {
                const ex = cfg.extra[rank];
                taskText += `<br>➕ ${ex.desc} <span style="color:#d32f2f">${ex.target}</span>`;
            }
            if (cfg.cost_money_formula) {
                const cost = cfg.cost_money_formula(rank);
                taskText += `<br>💸 需消耗 <span style="color:#f57f17">${cost}</span> 钱`;
            }

            let rewardText = "";
            if (cfg.reward) {
                const attrNames = cfg.reward.attr.split(',').map(key => {
                    return (window.ATTR_MAPPING && window.ATTR_MAPPING[key]) ? window.ATTR_MAPPING[key] : key;
                }).join("、");
                let valStr = "";
                const isPercent = (cfg.reward.val <= 1 && !cfg.reward.attr.includes('nums')) || cfg.reward.attr.includes('Pct') || cfg.reward.attr.includes('all');
                valStr = isPercent ? `+${(cfg.reward.val * 100).toFixed(0)}%` : `+${cfg.reward.val}`;
                rewardText = (cfg.reward.attr === 'all' || cfg.reward.attr === 'all2') ? `全属性 ${valStr}` : `${attrNames} ${valStr}`;
            } else { rewardText = cfg.attr_desc || "未知奖励"; }

            let variantName = "";
            if (cfg.name_variants && cfg.name_variants.length > 0) {
                let safeIndex = Math.min(rank, cfg.name_variants.length - 1);
                variantName = cfg.name_variants[safeIndex];
            } else { variantName = cfg.suffix || "试炼"; }
            let finalName = `${currentRankName}·${variantName}`;

            options.push({
                text: `
                    <div style="text-align:left; padding:5px;">
                        <div style="font-weight:bold; font-size:16px; color:#333;">${finalName} <span style="font-size:12px; color:#666; font-weight:normal;">(${cfg.desc})</span></div>
                        <div style="margin-top:6px; font-size:13px; color:#555; line-height:1.5;">🎯 试炼: ${taskText}</div>
                        <div style="margin-top:4px; font-size:13px; color:#4caf50;">🎁 奖励: ${rewardText}</div>
                    </div>
                `,
                onClick: () => {
                    if (window.UtilsMortalTask) {
                        window.UtilsMortalTask.acceptTask(rank, i, finalName);
                        setTimeout(() => window.UI_Mortal.render(), 50);
                    } else { console.error("UtilsMortalTask 未加载"); }
                },
                autoClose: true
            });
        }
        window.UtilsModal.showSelectionModal(title, options);
    },

    onRetreatClick: function() {
        const rank = window.player.mortal_rank || 0;
        const cost = window.DATA_MORTAL.RETREAT_COST[rank] || 500;
        this.state.requiredHunger = cost;
        this.state.currentHunger = 0;
        this.state.selectedFoods = {};
        this.openFoodSelectModal();
    },

    openFoodSelectModal: function() {
        const html = `
            <div class="mortal-food-layout">
                <div class="food-progress-section">
                    <div class="food-bar-bg">
                        <div class="food-bar-inner" id="food-select-bar" style="width:0%"></div>
                        <div class="food-bar-text" id="food-select-text">0 / ${this.state.requiredHunger}</div>
                    </div>
                    <div class="food-tip-text">请选择食物 (左键选入/右键移出)</div>
                </div>
                <div class="food-grid-section" id="food-select-grid"></div>
                <div class="food-action-section">
                    <button class="ink-btn disabled" id="btn-start-retreat">进入闭关</button>
                </div>
            </div>
        `;
        const bodyEl = window.UtilsModal.showInteractiveModal("闭关准备", html, null, "modal_food_select", null, null);
        const $el = $(bodyEl);
        this.ui.$foodModal = $el;
        this.ui.$foodProgress = $el.find('#food-select-bar');
        this.ui.$foodText = $el.find('#food-select-text');
        this.ui.$foodGrid = $el.find('#food-select-grid');
        this.ui.$foodBtn = $el.find('#btn-start-retreat');
        this.renderFoodGrid();
        this.ui.$foodBtn.on('click', () => {
            if (this.state.currentHunger >= this.state.requiredHunger) {
                this.startRetreatWithFood();
                window.UtilsModal.closeTopModal();
            }
        });
    },

    renderFoodGrid: function() {
        const inv = window.player.inventory || [];
        this.ui.$foodGrid.empty();
        const validItems = inv.filter(item => {
            if (!item) return false;
            const validTypes = ['food', 'fish', 'foodMaterial'];
            const hunger = (item.effects && item.effects.hunger) ? item.effects.hunger : 0;
            return validTypes.includes(item.type) && hunger > 0;
        });
        if (validItems.length === 0) {
            this.ui.$foodGrid.html('<div class="no-food-tip">背包空空如也。</div>');
            return;
        }
        validItems.forEach(item => {
            const selCount = this.state.selectedFoods[item.id] || 0;
            const hunger = item.effects.hunger;
            const $card = $(`
                <div class="food-item-card ${selCount > 0 ? 'selected' : ''}">
                    <div class="item-icon">${'🍱'}</div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-count">${selCount} / ${item.count}</div>
                    <div class="item-hunger">饱食+${hunger}</div>
                </div>
            `);
            $card.on('click', () => this.selectFood(item, 1));
            $card.on('contextmenu', (e) => { e.preventDefault(); this.selectFood(item, -1); });
            $card.on('mouseenter', () => { if (window.showItemTooltip) window.showItemTooltip(item, $card[0]); });
            $card.on('mouseleave', () => { if (window.hideTooltip) window.hideTooltip(); });
            this.ui.$foodGrid.append($card);
        });
    },

    selectFood: function(item, change) {
        const current = this.state.selectedFoods[item.id] || 0;
        let next = current + change;
        if (next < 0) next = 0;
        if (next > item.count) next = item.count;
        if (next === 0) delete this.state.selectedFoods[item.id];
        else this.state.selectedFoods[item.id] = next;
        this._recalcFoodState();
        this.renderFoodGrid();
    },

    _recalcFoodState: function() {
        let total = 0;
        const inv = window.player.inventory;
        for (let id in this.state.selectedFoods) {
            const count = this.state.selectedFoods[id];
            const item = inv.find(i => i.id === id);
            if (item) total += item.effects.hunger * count;
        }
        this.state.currentHunger = total;
        const req = this.state.requiredHunger;
        const pct = Math.min(100, (total / req) * 100);
        this.ui.$foodProgress.css('width', pct + '%');
        if (total >= req) {
            this.ui.$foodText.text(`${total} / ${req} (满足)`);
            this.ui.$foodProgress.addClass('full');
            this.ui.$foodBtn.removeClass('disabled').text('进入闭关');
        } else {
            this.ui.$foodText.text(`${total} / ${req}`);
            this.ui.$foodProgress.removeClass('full');
            this.ui.$foodBtn.addClass('disabled').text('饱食度不足');
        }
    },

    startRetreatWithFood: function() {
        const inv = window.player.inventory;
        let consumedAny = false;
        for (let itemId in this.state.selectedFoods) {
            let countToRemove = this.state.selectedFoods[itemId];
            if (window.UtilsItem && window.UtilsItem.removeItem) {
                const slots = inv.filter(i => i.id === itemId);
                for (let slot of slots) {
                    if (countToRemove <= 0) break;
                    let deduct = Math.min(slot.count, countToRemove);
                    window.UtilsItem.removeItem(slot.sid, deduct);
                    countToRemove -= deduct;
                    consumedAny = true;
                }
            } else {
                const idx = inv.findIndex(i => i.id === itemId);
                if (idx !== -1) {
                    inv[idx].count -= countToRemove;
                    if (inv[idx].count <= 0) inv.splice(idx, 1);
                    consumedAny = true;
                }
            }
        }
        if (consumedAny && window.MortalMinigame) {
            if(window.showToast) window.showToast("开始闭关，请做好准备！");

            // 【新增】暂停动画逻辑：清除定时器 + 移除现有粒子
            if (this.state.animationInterval) {
                clearInterval(this.state.animationInterval);
                this.state.animationInterval = null;
            }
            if (this.ui.$headerContainer) {
                this.ui.$headerContainer.find('.mortal-particle').remove();
            }

            window.MortalMinigame.showRules(30, (score, duration) => {
                const realDuration = (typeof duration === 'number') ? duration : 30;
                this.handleGameFinish(score, realDuration);
            });
        } else {
            if(window.showToast) window.showToast("未消耗任何食物或启动失败");
        }
    },

    handleGameFinish: function(score, duration = 30) {
        const p = window.player;
        const rank = p.mortal_rank || 0;
        const rankConfig = (window.DATA_MORTAL && window.DATA_MORTAL.RANKS[rank]) ?
            window.DATA_MORTAL.RANKS[rank] : { maxExp: 99999 };
        if (score > 0) {
            if (!p.is_bottleneck) {
                p.mortal_exp = (p.mortal_exp || 0) + score;
                const max = rankConfig.maxExp;
                if (p.mortal_exp >= max) {
                    p.mortal_exp = max;
                    p.is_bottleneck = true;
                }
                if(window.showToast) window.showToast(`闭关结束，获得 ${Math.floor(score)} 修为`);
                this.render();
            }
        } else {
            if(window.showToast) window.showToast(`闭关结束，心有杂念，未获寸进。`);
        }
        if (window.TimeSystem && typeof window.TimeSystem.passTime === 'function') {
            const hoursPassed = Math.floor(duration);
            if (hoursPassed > 0) {
                window.TimeSystem.passTime(hoursPassed);
                if (window.LogManager && window.LogManager.add) {
                    window.LogManager.add(`闭关耗时 <span style="color:#29b6f6">${hoursPassed} 时辰</span>，获得 ${Math.floor(score)} 修为。`);
                }
            }
        }
        if (window.saveGame) {
            window.saveGame();
            console.log("闭关结束，自动保存。");
        }

        // 【新增】游戏结束，恢复动画
        this.startParticleEffect();
    }
};

window.UI_Mortal = UI_Mortal;


// --- 水墨液体波浪绘制类 ---
class InkLiquidWave {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.progress = 0; // 0.0 ~ 1.0
        this.wavePhase = 0;
        this.isRunning = false;

        // 配置：双层波浪参数
        // 颜色采用 rgba，方便叠加
        // 后层：深灰
        // 前层：带一点透明度的墨色
        this.waves = [
            { height: 10, speed: 0.007, offset: 0, color: 'rgba(60, 70, 75, 0.9)' },
            { height: 12, speed: 0.009, offset: 2, color: 'rgba(30, 30, 30, 0.8)' }
        ];
    }

    // 设置进度 (0-100)
    setProgress(pct) {
        // 目标进度，缓慢过渡可以用 tween，这里直接赋值
        this.progress = pct / 100;
        if (!this.isRunning) this.start();
    }

    start() {
        this.isRunning = true;
        this._loop();
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
    }

    _loop() {
        if (!this.isRunning) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.wavePhase += 1;

        // 计算当前液面高度 (Canvas y轴向下，所以是 height * (1-progress))
        // 增加一个缓动，让液面不会瞬间跳变 (可选)
        const liquidY = this.height * (1 - this.progress);

        // 绘制每一层波浪
        this.waves.forEach((wave, idx) => {
            this.ctx.fillStyle = wave.color;
            this.ctx.beginPath();

            // 移动相位
            const phase = this.wavePhase * wave.speed + wave.offset;

            // 绘制正弦波
            // x 从 0 到 width
            for (let x = 0; x <= this.width; x++) {
                // y = A * sin(Wx + Q) + H
                // 振幅(A) = wave.height
                // 频率(W) = 0.05 左右
                const y = wave.height * Math.sin(0.013 * x + phase) + liquidY;

                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }

            // 封闭路径：绘制到底部
            this.ctx.lineTo(this.width, this.height);
            this.ctx.lineTo(0, this.height);
            this.ctx.closePath();
            this.ctx.fill();
        });

        this.rafId = requestAnimationFrame(this._loop.bind(this));
    }
}