/* js/app_main.js */
console.log("=== 水墨版修仙应用启动 ===");

// 模拟更新日志数据
const UPDATE_LOGS = `
<p><strong>v2.0.0 重铸凡尘</strong></p>
<p>1. 界面全面重构，采用黑白水墨风格，适配移动端。</p>
<p>2. 优化了弹窗系统，操作更流畅。</p>
<p>3. 移除了旧版冗余代码，提升性能。</p>
<br>
<p><strong>v1.5.0 (历史)</strong></p>
<p>- 增加了很多新功能...</p>
`;

window.onload = function() {
    initApp();
};

function initApp() {
    // 确保弹窗样式已加载 (如果在 index_app.html 里加了 link 就不用管，这里只是保险)

    renderHomeScreen();
}

function renderHomeScreen() {
    const uiLayer = document.getElementById('app_ui_layer_ui');
    if (!uiLayer) return;

    uiLayer.innerHTML = ''; // 清空当前UI

    // 创建首页容器
    const homeDiv = document.createElement('div');
    homeDiv.style.cssText = `
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
    `;

    // 标题
    const title = document.createElement('h1');
    title.className = 'app_ui_title_large';
    title.innerText = '文字修仙';
    title.style.marginBottom = '60px';
    homeDiv.appendChild(title);

    // 按钮区域
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; flex-direction: column; gap: 20px; width: 60%; max-width: 240px;';

    // 1. 判断存档状态
    const hasSave = checkSaveExists();

    // 按钮1: 开始游戏 / 继续游戏
    const btnStart = createInkButton(hasSave ? "继续游戏" : "开始游戏", () => {
        if (hasSave) {
            // 继续游戏的逻辑
            AppUtilsModal.showToast("正在读取天地法则...", { position: 'center' });
            setTimeout(startGameplay, 1000);
        } else {
            // 开始新游戏
            AppUtilsModal.showConfirm("开启新篇章", "确定要重新开始修仙之路吗？<br>若有旧存档将被覆盖。", {
                style: 'history',
                confirmText: '踏入仙途',
                onConfirm: () => {
                    startGameplay();
                }
            });
        }
    });

    // 按钮2: 更新日志
    const btnLog = createInkButton("更新日志", () => {
        AppUtilsModal.showAlert("更新日志", UPDATE_LOGS, {
            isLarge: true, // 占据 3/4 屏幕
            confirmText: "阅毕",
            style: "normal"
        });
    });

    // 按钮3: (测试用或预留) 这里你可以加设置或者其他，目前按照要求只显示必要的
    // 如果只需要2个主入口，上面已经够了。用户需求说是 "3个按钮"。
    // 假设第3个是 "游戏设置" 或者 "更多功能"
    // 但用户描述是: Start/Continue 和 Update Log。可能只有2行按钮？
    // "显示3个按钮...其中开始游戏和继续游戏是冲突的" -> 这意味着总共显示 2 个按钮视觉上？
    // 不，通常意思是位置1是开始/继续，位置2是日志，位置3可能是一个设置或者退出。
    // 如果只要2个视觉按钮，那就只加这俩。
    // 如果必须凑齐3个，我加一个 "离线收益" 或者是 "重置存档" 的入口作为示例。
    // 按照文字描述: "显示3个按钮...其中...是冲突的" -> 意思是总数是 2 个 (1个动态 + 1个固定)。
    // 除非还有一个隐藏的第3个。我这里先放2个，如果需要第3个请告诉我。
    // 修正：仔细读题 "显示3个按钮...其中开始游戏和继续游戏是冲突的" -> 意思是：
    // Button A: Start OR Continue
    // Button B: Update Log
    // Button C: ??? (用户没说第3个是什么，通常是 设置 或者 制作组)
    // 我先补一个 "系统设置" 作为第3个。
    const btnSettings = createInkButton("系统设置", () => {
        AppUtilsModal.showToast("功能开发中...", { style: 'black' });
    });

    btnContainer.appendChild(btnStart);
    btnContainer.appendChild(btnLog);
    btnContainer.appendChild(btnSettings);

    homeDiv.appendChild(btnContainer);
    uiLayer.appendChild(homeDiv);
}

// 辅助：检查存档 (暂时用 localStorage 简单判断)
function checkSaveExists() {
    // 你的旧代码存档key可能是 'xiuxian_save_data' 之类的
    // 这里先简单模拟，或者你可以接入 cloud_archive.js 的逻辑
    return localStorage.getItem('xiuxian_save') !== null;
}

// 辅助：创建按钮 DOM
function createInkButton(text, onClick) {
    const btn = document.createElement('button');
    btn.className = 'app_ui_btn'; // 引用 layout.css 里的样式
    btn.innerText = text;
    btn.onclick = onClick;
    // 稍微加宽一点适应首页
    btn.style.width = "100%";
    btn.style.marginBottom = "10px";
    return btn;
}

function startGameplay() {
    // 隐藏首页，进入游戏主界面
    // 这里就是之前的 startGameplay 逻辑
    const uiLayer = document.getElementById('app_ui_layer_ui');
    uiLayer.innerHTML = '';
    AppUtilsModal.showToast("进入游戏世界", { duration: 1000 });

    // 初始化底部导航栏等...
    // initGameUI();
}