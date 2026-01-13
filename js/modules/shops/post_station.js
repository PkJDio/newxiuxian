/**
 * js/modules/buildings/post_station.js
 * 驿站功能模块 v2.0 (包含分段计费与时间流逝)
 */

// 注入样式
const postStyles = `
<style id="post-custom-styles">
    .post-direction-btn {
        width: 120px; height: 120px; border-radius: 50%;
        border: 4px solid #795548; background: #fff3e0;
        font-size: 24px; font-weight: bold; color: #5d4037;
        cursor: pointer; transition: all 0.2s;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        display: flex; flex-direction: column; justify-content: center; align-items: center;
    }
    .post-direction-btn:hover { transform: scale(1.05); background: #ffe0b2; border-color: #d84315; }
    .post-direction-btn:active { transform: scale(0.95); }
    .post-icon { font-size: 36px; margin-bottom: 5px; }
</style>
`;
if (!document.getElementById('post-custom-styles')) {
    document.head.insertAdjacentHTML('beforeend', postStyles);
}

const PostStation = {
    currentTown: null,
    modalBody: null,

    // ================= 核心计算逻辑 =================

    // 1. 计算路费 (分段计价)
    // 150以内: 1文/里
    // 150-300: 3文/里
    // 300以上: 5文/里
    _calcCost: function(dist) {
        let cost = 0;
        if (dist <= 150) {
            cost = dist * 1;
        } else if (dist <= 300) {
            cost = (150 * 1) + ((dist - 150) * 2);
        } else {
            cost = (150 * 1) + (150 * 3) + ((dist - 300) * 3);
        }
        return Math.floor(cost);
    },

    // 2. 计算时间 (每50距离24小时)
    _calcTime: function(dist) {
        // 向上取整
        return Math.ceil((dist / 75) * 24);
    },

    // 3. 格式化时间显示 (把小时转为 天+时)
    _formatTime: function(hours) {
        const days = Math.floor(hours / 24);
        const leftHours = hours % 24;
        if (days > 0) {
            return `${days}天${leftHours > 0 ? leftHours + "时" : ""}`;
        }
        return `${leftHours}时`;
    },

    // ================= 入口 =================
    enter: function(town) {
        this.currentTown = town;
        this.renderMainMenu();
    },

    _updateContent: function(html) {
        if (this.modalBody) {
            this.modalBody.innerHTML = html;
        } else {
            this.renderMainMenu();
        }
    },

    // ================= 主界面 =================
    renderMainMenu: function() {
        if (!window.showGeneralModal) return;
        const townName = this.currentTown.name;

        const html = `
            <div id="post_panel_main" class="inn-layout" style="display:flex; flex-direction:column; height:100%; padding: 10px;">
                <div class="inn-greeting" style="flex:0 0 auto; border-bottom:2px dashed #5d4037; margin-bottom:20px; padding:15px; font-family:'Kaiti'; font-size:28px; color:#3e2723; background:rgba(255,255,255,0.5); border-radius:8px;">
                    <p style="margin:5px 0;">车夫：客官，咱这千里马日行千里！</p>
                    <p style="margin:5px 0;">您这又是要去往何方啊？</p>
                </div>

                <div style="flex:1; display:flex; justify-content:center; align-items:center; position:relative;">
                    <div style="position:relative; width: 300px; height: 300px;">
                        <button class="post-direction-btn" style="position:absolute; top:0; left:50%; margin-left:-60px;" onclick="PostStation.showDestinations('north')">
                            <span class="post-icon">⬆️</span>往北
                        </button>
                        <button class="post-direction-btn" style="position:absolute; bottom:0; left:50%; margin-left:-60px;" onclick="PostStation.showDestinations('south')">
                            <span class="post-icon">⬇️</span>往南
                        </button>
                        <button class="post-direction-btn" style="position:absolute; left:0; top:50%; margin-top:-60px;" onclick="PostStation.showDestinations('west')">
                            <span class="post-icon">⬅️</span>往西
                        </button>
                        <button class="post-direction-btn" style="position:absolute; right:0; top:50%; margin-top:-60px;" onclick="PostStation.showDestinations('east')">
                            <span class="post-icon">➡️</span>往东
                        </button>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-weight:bold; color:#aaa; font-size: 20px;">
                            ${townName}
                        </div>
                    </div>
                </div>

                <div class="inn-footer" style="text-align:right; margin-top:20px; font-size: 18px; font-weight:bold; color:#d84315;">
                    当前盘缠: ${player.money} 文
                </div>
            </div>
        `;

        this.modalBody = window.showGeneralModal(`${townName} - 驿站`, html);
    },

    // ================= 目的地列表 =================
    showDestinations: function(direction) {
        if (!window.UtilsTransmit) {
            window.showToast("地图数据未加载！");
            return;
        }

        const targets = window.UtilsTransmit.getTownsInDirection(this.currentTown, direction, 5);
        const dirName = { 'north': '北', 'south': '南', 'west': '西', 'east': '东' }[direction];

        let listHtml = '';
        if (targets.length === 0) {
            listHtml = `<div style="padding:50px; text-align:center; color:#888; font-size:20px;">
                车夫：客官，往${dirName}边走就是荒郊野岭了，没路啦！
            </div>`;
        } else {
            listHtml = targets.map(t => {
                const town = t.town;
                const dist = Math.floor(t.dist);

                // 计算费用和时间
                const cost = this._calcCost(dist);
                const timeHours = this._calcTime(dist);
                const timeStr = this._formatTime(timeHours);

                const canAfford = player.money >= cost;

                const btnStyle = canAfford
                    ? "background: linear-gradient(to bottom, #8d6e63, #5d4037); color:white; cursor:pointer;"
                    : "background: #ccc; color:#666; cursor:not-allowed;";
                // 传参增加时间 cost
                const onclick = canAfford ? `PostStation.confirmTravel('${town.id}', '${town.name}', ${cost}, ${timeHours})` : "";

                const nameColor = town.level === 'city' ? '#d84315' : (town.level === 'town' ? '#f57c00' : '#388e3c');
                const levelName = town.level === 'city' ? '大城' : (town.level === 'town' ? '市镇' : '村落');

                return `
                <div class="shop-item" style="display:flex; justify-content:space-between; align-items:center; padding:18px; border-bottom:1px solid #eee; background:#fff; transition:0.2s;">
                    <div style="flex:1;">
                        <div style="font-size:22px; font-weight:bold; color:${nameColor}; margin-bottom:5px;">
                            ${town.name} <span style="font-size:14px; color:#999; font-weight:normal; border:1px solid #ddd; padding:1px 4px; border-radius:4px;">${levelName}</span>
                        </div>
                        <div style="color:#666; font-size:16px;">
                            距离: ${dist} 里 <span style="margin:0 10px; color:#ccc;">|</span> 
                            <span style="color:#0288d1;">⏳ ${timeStr}</span>
                        </div>
                    </div>
                    <div style="text-align:right; margin-right:20px;">
                        <div style="font-size:20px; font-weight:bold; color:${canAfford ? '#d84315' : 'red'};">
                            ${cost} 文
                        </div>
                    </div>
                    <div>
                        <button style="padding:8px 20px; border:none; border-radius:4px; font-size:18px; ${btnStyle}" onclick="${onclick}">
                            ${canAfford ? '出发' : '钱不够'}
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        const html = `
            <div style="height:100%; display:flex; flex-direction:column; background:#fdfbf7;">
                <div style="padding:15px; border-bottom:1px solid #d7ccc8; background:#fff8e1; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:22px; font-weight:bold; color:#5d4037;">往${dirName}方去</span>
                    <button class="ink_btn" onclick="PostStation.renderMainMenu()" style="font-size:16px; padding:5px 15px;">返回</button>
                </div>
                <div style="flex:1; overflow-y:auto; padding:10px;">
                    ${listHtml}
                </div>
            </div>
        `;
        this._updateContent(html);
    },

    // ================= 确认弹窗 =================
    confirmTravel: function(targetId, targetName, cost, timeHours) {
        const timeStr = this._formatTime(timeHours);

        const overlay = document.createElement('div');
        overlay.id = 'post-confirm-modal';
        overlay.className = 'inn-confirm-overlay';

        overlay.innerHTML = `
            <div class="inn-confirm-box">
                <div style="font-family:'Kaiti'; font-size:28px; font-weight:bold; margin-bottom:20px; color:#3e2723; border-bottom: 1px solid #d7ccc8; padding-bottom:10px;">
                    行程确认
                </div>
                <div style="font-size:20px; color:#5d4037; line-height:1.6; margin-bottom:30px; text-align:left; padding: 0 20px;">
                    <div>目的地：<span style="color:#d84315; font-weight:bold;">${targetName}</span></div>
                    <div>车马费：<span style="font-weight:bold;">${cost}</span> 文</div>
                    <div>预计耗时：<span style="color:#0288d1; font-weight:bold;">${timeStr}</span></div>
                    <div style="margin-top:10px; font-size:16px; color:#888;">(路途遥远，请备好干粮)</div>
                </div>
                <div style="display:flex; justify-content:space-around;">
                    <button onclick="document.body.removeChild(document.getElementById('post-confirm-modal'))" 
                        style="padding:10px 30px; font-size:18px; cursor:pointer; background:#eee; border:1px solid #999; border-radius:4px; color:#666;">
                        再等等
                    </button>
                    <button onclick="PostStation.executeTravel('${targetId}', ${cost}, ${timeHours})" 
                        style="padding:10px 30px; font-size:18px; cursor:pointer; background:#d84315; border:1px solid #bf360c; border-radius:4px; color:#fff; font-weight:bold; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
                        出发
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    // ================= 执行传送 =================
    executeTravel: function(targetId, cost, timeHours) {
        // 1. 关闭确认弹窗（这是手动创建的 DOM，必须先关）
        const overlay = document.getElementById('post-confirm-modal');
        if (overlay) document.body.removeChild(overlay);

        if (player.money < cost) {
            window.showToast("盘缠不够了！");
            return;
        }

        const towns = Array.isArray(window.WORLD_TOWNS) ? window.WORLD_TOWNS : Object.values(window.WORLD_TOWNS);
        const targetTown = towns.find(t => t.id === targetId);

        if (!targetTown) return;

        // 2. 扣钱 & 增加时间
        player.money -= cost;

        // 使用 TimeSystem (如果存在) 或手动增加
        if (window.TimeSystem && typeof TimeSystem.passTime === 'function') {
            TimeSystem.passTime(timeHours);
        } else {
            // 手动增加时间的兜底逻辑
            if (!player.time) player.time = { year: 1, month: 1, day: 1, hour: 0 };
            player.time.hour += timeHours;
            while (player.time.hour >= 24) { player.time.hour -= 24; player.time.day += 1; }
            while (player.time.day > 30) { player.time.day -= 30; player.time.month += 1; }
            while (player.time.month > 12) { player.time.month -= 12; player.time.year += 1; }
        }

        // 3. 移动坐标
        const tx = Math.floor(targetTown.x + targetTown.w / 2);
        const ty = Math.floor(targetTown.y + targetTown.h / 2);
        player.coord.x = tx;
        player.coord.y = ty;

        // 4. 【核心修复】强制关闭所有弹窗
        // 我们连续调用多次 closeModal，以防有叠在一起的窗口（比如：行动指令 -> 驿站 -> 确认框）
        // 或者直接清空 modal 容器
        if (window.closeModal) {
            window.closeModal(); // 关闭驿站主界面
            // 延时一小会儿再次尝试关闭，确保底层的“行动指令”窗口也被关掉
            setTimeout(() => {
                if (document.querySelector('.modal_overlay')) {
                    window.closeModal();
                }
            }, 50);
        }

        // 暴力清理：如果你的行动指令窗口有特定的 ID (比如 'modal_action_menu')，可以直接移除
        // const actionMenu = document.getElementById('modal_action_menu');
        // if (actionMenu) actionMenu.remove();

        // 5. 刷新世界与UI
        if (window.updateUI) window.updateUI();
        if (window.MapView && window.MapView.render) window.MapView.render();
        if (window.MapCamera && window.MapCamera.update) window.MapCamera.update();

        const timeStr = this._formatTime(timeHours);
        window.showToast(`经过 ${timeStr} 的颠簸，终于抵达了 ${targetTown.name}`);

        // 6. 自动保存

        setTimeout(() => {
            if (window.saveGame) window.saveGame();
            showDialogue("车夫", "客官，目的地到了！这一路颠簸辛苦，快下车活络下筋骨吧，咱们后会有期！", "left", () => {

            }, true);
        }, 1000);
    }
};

if (window.ShopSystem) {
    ShopSystem.register("驿站", PostStation);
}

window.PostStation = PostStation;