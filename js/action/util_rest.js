console.log("加载 休憩模块");
window.doRest = function() {
    console.log(">>> [Action] 点击了 休憩");
    if(window.showToast) window.showToast("准备休息...");
};