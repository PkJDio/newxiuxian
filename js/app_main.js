/* js/app_main.js */
console.log("=== 水墨版修仙应用启动 ===");

window.onload = function() {
    initApp();
};

function initApp() {
    // 1. 获取核心容器
    const container = document.getElementById('app_ui_container');

    // 2. 绑定入口按钮事件
    const enterBtn = document.getElementById('app_ui_btn_enter');
    if(enterBtn) {
        enterBtn.onclick = function() {
            console.log("点击进入游戏");

            // 可以在这里写淡出效果，或者切换界面
            enterBtn.innerText = "正在加载...";

            // 模拟加载延迟
            setTimeout(() => {
                startGameplay();
            }, 500);
        };
    }
}

function startGameplay() {
    // 这里我们将移除首页，加载游戏主界面
    const startScreen = document.getElementById('app_ui_start_screen');
    if(startScreen) {
        startScreen.style.display = 'none'; // 隐藏首页
    }

    // 这里以后会调用你的 updateMap() 或者 renderMainUI()
    // 比如：
    const uiLayer = document.getElementById('app_ui_layer_ui');

    // 插入一个临时的游戏内界面
    const gameHUD = document.createElement('div');
    gameHUD.id = 'app_ui_hud';
    gameHUD.innerHTML = `
        <div style="position: absolute; bottom: 0; width: 100%; height: 60px; border-top: 2px solid #333; display: flex; justify-content: space-around; align-items: center; background: #f7f7f2;">
            <span>状态</span>
            <span>背包</span>
            <span style="font-weight: bold; font-size: 20px;">修炼</span>
            <span>地图</span>
            <span>更多</span>
        </div>
    `;
    uiLayer.appendChild(gameHUD);

    alert("欢迎来到新版水墨界面！数据层已就绪。");
}