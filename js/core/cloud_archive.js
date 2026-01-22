/**
 * js/core/cloud_archive.js - 云同步逻辑 v6.0
 * 包含：主动保存、身份认证、存档切换与对比
 */
const CloudArchive = {
    // 环境检测
    _isServerEnv: function() {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname === '';
        return !isLocal;
    },

    // ================= 1. 初始化与渲染 =================
    initSync: function() {
        // 渲染主页右上角（无论是否联网，先读本地显示）
        this.renderMenuProfile();

        if (!this._isServerEnv()) {
            console.log("[CloudArchive] 本地环境，云同步禁用");
            return;
        }

        // 自动检查同步
        const localDataStr = localStorage.getItem(window.SAVE_KEY);
        if (!localDataStr) {
            // 首次无存档，不强制弹窗，等玩家点击开始或切换
            return;
        }

        let localData = JSON.parse(localDataStr);
        if (localData.account) {
            // 后台静默同步一次，不打扰玩家
            this.syncWithCloud(localData, true);
        }
    },

    // 【新增】渲染主页右上角的存档胶囊
    renderMenuProfile: function() {
        const elAccount = document.getElementById('menu_save_account');
        const elGen = document.getElementById('menu_save_gen');
        const elDate = document.getElementById('menu_save_date');

        if (!elAccount) return; // 不在主页场景

        const localDataStr = localStorage.getItem(window.SAVE_KEY);
        if (!localDataStr) {
            elAccount.innerText = "点击建立仙缘";
            elGen.innerText = "无存档";
            elDate.innerText = "";
            return;
        }

        try {
            const data = JSON.parse(localDataStr);
            elAccount.innerText = data.account || "未命名道友";
            elGen.innerText = `第 ${data.generation || 1} 世`;

            // 格式化时间
            if (data.time) {
                const y = data.time.year || 1;
                const m = data.time.month || 1;
                const d = data.time.day || 1;
                elDate.innerText = `${y}年${m}月${d}日`;
            } else {
                elDate.innerText = "初入仙途";
            }
        } catch (e) {
            console.error("存档解析失败", e);
            elAccount.innerText = "存档损坏";
        }
    },

    // ================= 2. 存档切换 UI =================

    // 点击右上角触发：打开输入账号弹窗
    uiOpenSwitchModal: function() {
        const contentHtml = `
            <div style="padding:15px; font-family:'KaiTi'; text-align:center;">
                <p style="font-size:18px; color:#5d4037; margin-bottom:10px;">🔮 <b>存档切换 / 读取</b></p>
                <p style="font-size:14px; color:#666; margin-bottom:15px;">输入【名号】以读取云端记录。<br>若名号不存在，则视为新建。</p>
                <input type="text" id="switch_account_input" 
                    style="width:80%; padding:10px; font-size:20px; border:2px solid #8d6e63; border-radius:4px; text-align:center;"
                    placeholder="输入名号..." maxlength="20">
            </div>
        `;

        const footerHtml = `
            <button class="ink_btn" id="btn_check_account" onclick="CloudArchive.handleAccountCheck()" style="width:100%;">🔍 读取并对比</button>
        `;

        window.UtilsModal.showInteractiveModal("🔁 切换存档", contentHtml, footerHtml, "modal_switch_acc", 40, 35);

        // 自动填入当前账号方便修改
        setTimeout(() => {
            const local = JSON.parse(localStorage.getItem(window.SAVE_KEY) || "{}");
            if(local.account) document.getElementById('switch_account_input').value = local.account;
        }, 50);
    },

    // 核心逻辑：从云端拉取数据，并弹出对比窗口
    handleAccountCheck: function() {
        const inputVal = document.getElementById('switch_account_input').value.trim();
        if (!inputVal) return window.showToast("名号不能为空");

        const btn = document.getElementById('btn_check_account');
        btn.disabled = true;
        btn.innerText = "正在搜寻天道记录...";

        // 1. 获取本地当前数据（作为对比方A）
        const localData = JSON.parse(localStorage.getItem(window.SAVE_KEY) || "{}");

        // 2. 从云端获取目标账号数据（作为对比方B）
        fetch('/newgame/api/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: inputVal })
        })
            .then(res => res.json())
            .then(res => {
                btn.disabled = false;
                btn.innerText = "🔍 读取并对比";

                // 关闭输入弹窗
                if(window.closeModal) window.closeModal();

                const cloudData = res.data; // 可能为 null (新账号)

                // 弹出对比决策窗口
                this.showConflictDecisionModal(inputVal, localData, cloudData);
            })
            .catch(err => {
                console.error(err);
                btn.disabled = false;
                btn.innerText = "重试";
                window.showToast("❌ 网络连接失败");
            });
    },

    // 显示对比窗口：左边本地，右边云端（目标账号）
    showConflictDecisionModal: function(targetAccount, localData, cloudData) {
        // 格式化信息的辅助函数
        const formatInfo = (data) => {
            if (!data) return `<div style="padding:20px; color:#999;">无记录<br>(将新建)</div>`;
            const dateStr = new Date(data.update_time || 0).toLocaleString();
            const gameTime = data.time ? `${data.time.year}年${data.time.month}月` : "初始";
            return `
                <div class="compare_row">名号 <span class="compare_val">${data.account || "未知"}</span></div>
                <div class="compare_row">轮回 <span class="compare_val">第 ${data.generation || 1} 世</span></div>
                <div class="compare_row">修为 <span class="compare_val">${data.player?.level?.name || "凡人"}</span></div>
                <div class="compare_row">时间 <span class="compare_val">${gameTime}</span></div>
                <div class="compare_row" style="font-size:12px; color:#999; margin-top:5px;">存档时间: ${dateStr}</div>
            `;
        };

        const html = `
            <div style="padding:10px; font-family:'KaiTi';">
                <p style="text-align:center; font-size:16px; color:#5d4037; margin-bottom:15px;">
                    目标名号：<b style="font-size:20px; color:#d84315;">${targetAccount}</b>
                </p>
                
                <div class="compare_container">
                    <div class="compare_box local">
                        <div class="compare_title" style="color:#2e7d32;">💻 当前本地存档</div>
                        ${formatInfo(localData.account ? localData : null)}
                    </div>

                    <div class="compare_box cloud">
                        <div class="compare_title" style="color:#1565c0;">☁️ 目标云端存档</div>
                        ${formatInfo(cloudData)}
                    </div>
                </div>

                <div style="margin-top:20px; text-align:center; font-size:14px; color:#666;">
                    请选择操作方向：
                </div>
            </div>
        `;

        const footerHtml = `
            <div style="display:flex; gap:10px; width:100%;">
                <button class="ink_btn" style="flex:1; background:#ef5350; font-size:16px;" 
                    onclick="CloudArchive.confirmOverwriteCloud('${targetAccount}')">
                    📤 本地覆盖云端<br><span style="font-size:12px; opacity:0.8">(视为以此存档覆盖${targetAccount})</span>
                </button>
                
                <button class="ink_btn" style="flex:1; background:#42a5f5; font-size:16px;" 
                    onclick="CloudArchive.confirmLoadCloud('${targetAccount}')">
                    📥 云端覆盖本地<br><span style="font-size:12px; opacity:0.8">(读取${targetAccount}的进度)</span>
                </button>
            </div>
        `;

        // 临时存储云端数据以便后续读取使用
        this._tempCloudData = cloudData;
        window.UtilsModal.showInteractiveModal("⚖️ 存档裁决", html, footerHtml, "modal_conflict", 70, 60);
    },

    // 操作 A: 本地覆盖云端 (Save As / Upload)
    confirmOverwriteCloud: function(targetAccount) {
        if (!confirm(`确定要用当前本地进度覆盖云端【${targetAccount}】的记录吗？\n云端原有数据将丢失！`)) return;

        // 1. 获取本地数据
        let localData = JSON.parse(localStorage.getItem(window.SAVE_KEY) || "{}");

        // 2. 修改 Account 为目标账号
        localData.account = targetAccount;
        localData.update_time = Date.now();

        // 3. 保存回本地 (先改名)
        localStorage.setItem(window.SAVE_KEY, JSON.stringify(localData));

        // 4. 上传
        this.executeSave(false, () => {
            window.showToast(`✅ 已将当前进度保存至【${targetAccount}】`);
            this.renderMenuProfile(); // 刷新右上角
            window.closeModal();
        });
    },

    // 操作 B: 云端覆盖本地 (Load Game)
    confirmLoadCloud: function(targetAccount) {
        if (!this._tempCloudData) {
            window.showToast("云端该名号无记录，无法读取！");
            return;
        }

        if (!confirm(`确定要读取云端【${targetAccount}】的进度吗？\n当前未保存的本地进度将丢失！`)) return;

        // 1. 写入本地
        localStorage.setItem(window.SAVE_KEY, JSON.stringify(this._tempCloudData));

        // 2. 刷新页面以重载
        window.showToast("🔄 读取成功，正在重塑世界...");
        window.closeModal();
        setTimeout(() => location.reload(), 1000);
    },

    // ================= 3. 基础功能 =================

    // 主动保存 UI (左下角按钮)
    uiSave: function() {
        const localDataStr = localStorage.getItem(window.SAVE_KEY);
        if (!localDataStr) return window.showToast("无数据");
        const localData = JSON.parse(localDataStr);

        if (!localData.account) {
            this.uiOpenSwitchModal(); // 如果没账号，引导去起名/切换
            return;
        }

        if (confirm(`将当前进度保存至【${localData.account}】的云端记录？`)) {
            this.executeSave(false);
        }
    },

    // 执行保存 API
    executeSave: function(isSilent = false, callback = null) {
        let localData = JSON.parse(localStorage.getItem(window.SAVE_KEY));
        localData.update_time = Date.now();
        localStorage.setItem(window.SAVE_KEY, JSON.stringify(localData));

        fetch('/newgame/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: localData.account, data: localData })
        })
            .then(res => res.json())
            .then(res => {
                if (!isSilent) window.showToast("☁️ 云端同步完成");
                if (callback) callback();
            })
            .catch(() => {
                if (!isSilent) window.showToast("❌ 同步失败");
            });
    },

    // 静默同步 (仅对比时间，若云端更新则提示)
    syncWithCloud: function(localData, isSilent) {
        fetch('/newgame/api/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: localData.account })
        })
            .then(res => res.json())
            .then(res => {
                if (res.data && res.data.update_time > (localData.update_time || 0)) {
                    console.log("发现云端有更新的存档");
                    // 可以在这里加一个红点提示，暂时不强制弹窗
                }
            });
    }
};

window.addEventListener('load', () => {
    if (window.CloudArchive) CloudArchive.initSync();
});