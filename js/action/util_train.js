//console.log("加载 修炼模块 (外功/内功)");
window.doTrain = function(type) {
    const label = type === 'ext' ? '外功' : '内功';
    //console.log(`>>> [Action] 点击了 修炼${label}`);
    if(window.showToast) window.showToast(`开始修炼${label}...`);
};