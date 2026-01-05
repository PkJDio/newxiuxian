console.log("加载 进食模块");
window.doEat = function() {
    console.log(">>> [Action] 点击了 进食");
    if(window.showToast) window.showToast("准备进食...");
};