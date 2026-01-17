/**
 * js/core/cloud_archive.js - 云同步逻辑 v5.0
 * 包含：主动保存、身份认证、价值判定同步
 */
const CloudArchive = {
    // 【新增】环境检测：判断是否在生产服务器运行
    _isServerEnv: function() {
        const hostname = window.location.hostname;
        // 如果是本地 IP 或 localhost，返回 false
        const isLocal = hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.startsWith('192.168.') ||
            hostname === ''; // 本地文件直接打开
        return !isLocal;
    },

    // ================= 1. 游戏启动初始化 =================
    initSync: function() {
        // 【环境检查】
        if (!this._isServerEnv()) {
            console.log("[CloudArchive] 检测到本地环境，云同步已禁用");
            return;
        }
        // 强制重新从存储中获取，防止内存变量不同步
        const localDataStr = localStorage.getItem(window.SAVE_KEY);

        // 如果完全没数据，或者有数据但 account 字段为空白/不存在
        if (!localDataStr) {
            this.showAccountBindingModal();
            return;
        }

        let localData = JSON.parse(localDataStr);
        console.log("本地存档数据：", localData);
        if (!localData.account || localData.account.trim() === "") {
            this.showAccountBindingModal();
        } else {
            this.syncWithCloud(localData);
        }
    },

    // ================= 2. 主动保存 UI (手动点击按钮触发) =================
    uiSave: function() {
        const localDataStr = localStorage.getItem(window.SAVE_KEY);
        if (!localDataStr) {
            window.showToast("❌ 本地暂无存档数据");
            return;
        }
        const localData = JSON.parse(localDataStr);

        // 如果用户还没起名号，提示去绑定
        if (!localData.account) {
            this.showAccountBindingModal();
            return;
        }

        const contentHtml = `
            <div style="padding:15px; font-family:'KaiTi'; text-align:center;">
                <p style="font-size:20px; color:#5d4037; margin-bottom:10px;">名号：<b>${localData.account}</b></p>
                <p style="font-size:16px; color:#666;">是否将当前进度（第${localData.generation || 1}世）同步至云端魂灯？</p>
                <p style="font-size:14px; color:#d84315; margin-top:10px;">※ 此操作将覆盖该名号在云端的旧存档。</p>
            </div>
        `;
        const footerHtml = `
            <div style="display:flex; gap:10px; width:100%;">
                <button class="ink_btn_normal" onclick="window.closeModal()" style="flex:1;">暂缓</button>
                <button class="ink_btn" onclick="CloudArchive.executeSave(false)" style="flex:1; background:#d84315; color:#fff; border:none;">确认同步</button>
            </div>
        `;
        window.UtilsModal.showInteractiveModal("💾 存档同步", contentHtml, footerHtml, "modal_cloud_sync", 30,30);
    },

    // ================= 3. 核心同步与逻辑比对 =================
    syncWithCloud: function(localData) {
        fetch('/newgame/api/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: localData.account })
        })
            .then(res => res.json())
            .then(res => {
                if (res.data) {
                    const decision = this._compareArchiveValue(localData, res.data);
                    if (decision === 'CLOUD_BETTER') {
                        console.log("云端存档价值更高，执行拉取...");
                        this._applyCloudData(res.data);
                    } else if (decision === 'LOCAL_BETTER') {
                        console.log("本地进度领先，自动备份...");
                        this.executeSave(true);
                    }
                } else {
                    this.executeSave(true);
                }
            });
    },

    /**
     * 判定存档价值：轮回次数 > 游戏时长 > 现实更新时间
     */
    _compareArchiveValue: function(local, cloud) {
        // 1. 比较轮回次数
        const genL = local.generation || 1;
        const genC = cloud.generation || 1;
        if (genC > genL) return 'CLOUD_BETTER';
        if (genL > genC) return 'LOCAL_BETTER';

        // 2. 比较游戏内总时间 (换算为小时)
        const timeL = this._getGameTotalHours(local.time);
        const timeC = this._getGameTotalHours(cloud.time);
        if (timeC > timeL) return 'CLOUD_BETTER';
        if (timeL > timeC) return 'LOCAL_BETTER';

        // 3. 比较同步更新时间
        const upL = local.update_time || 0;
        const upC = cloud.update_time || 0;
        if (upC > upL) return 'CLOUD_BETTER';
        if (upL > upC) return 'LOCAL_BETTER';

        return 'EQUAL';
    },

    _getGameTotalHours: function(t) {
        if (!t) return 0;
        // 1年=12月, 1月=30日, 1日=24时 (用于比对大小的粗略权重)
        return (t.year * 8640) + (t.month * 720) + (t.day * 24) + (t.hour || 0);
    },

    // ================= 4. 账号绑定流程 =================
    showAccountBindingModal: function() {
        const contentHtml = `
            <div style="padding:15px; font-family:'KaiTi'; text-align:center;">
                <p style="font-size:18px; color:#5d4037; margin-bottom:15px;">初次见面，请刻下您的<b>名号 (账号)</b><br><small>用于云端同步，不可更改</small></p>
                <input type="text" id="bind_account_input" 
                    style="width:100%; padding:12px; font-size:20px; border:2px solid #8d6e63; border-radius:4px; background:#fdfbf7; box-sizing:border-box;"
                    placeholder="输入账号名..." maxlength="20">
                <p style="font-size:14px; color:#d32f2f; margin-top:10px;">※ 若已有存档，输入旧名号即可接续仙缘。</p>
            </div>
        `;
        const footerHtml = `
            <button class="ink_btn" id="confirm_bind_btn" onclick="CloudArchive.confirmBinding()" style="width:100%;">确认身份</button>
        `;
        window.UtilsModal.showInteractiveModal("📜 身份认证", contentHtml, footerHtml, "modal_bind", 35, 30, { allowOutsideClick: false, allowEsc: false });
    },

    confirmBinding: function() {
        const acc = document.getElementById('bind_account_input').value.trim();
        if (!acc) return window.showToast("名号不可为空");

        const btn = document.getElementById('confirm_bind_btn');
        btn.disabled = true;
        btn.innerText = "正在感应魂灯...";

        fetch('/newgame/api/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: acc })
        })
            .then(res => res.json())
            .then(res => {
                let localData = JSON.parse(localStorage.getItem(window.SAVE_KEY) || "{}");
                if (res.data) {
                    const decision = this._compareArchiveValue(localData, res.data);
                    if (decision === 'CLOUD_BETTER') {
                        window.closeModal();
                        window.showWarningModal("发现旧识", `寻得名号【${acc}】的旧日残影（第${res.data.generation || 1}世），是否以此重塑真身？`, () => {
                            this._applyCloudData(res.data);
                        });
                    } else {
                        this._completeBinding(acc, localData);
                    }
                } else {
                    this._completeBinding(acc, localData);
                }
            })
            .catch(err => {
                btn.disabled = false;
                btn.innerText = "确认身份";
                window.showToast("❌ 无法连接魂灯");
            });
    },

    _completeBinding: function(acc, localData) {
        localData.account = acc;
        localData.update_time = Date.now();
        localStorage.setItem(window.SAVE_KEY, JSON.stringify(localData));
        window.closeModal();
        this.executeSave(false);
    },

    // ================= 5. 执行读写 =================
    _applyCloudData: function(data) {
        localStorage.setItem(window.SAVE_KEY, JSON.stringify(data));
        window.showToast("🔄 仙缘已接续，即将重塑真身...");
        setTimeout(() => location.reload(), 1500);
    },

    executeSave: function(isSilent = false) {
        let localDataStr = localStorage.getItem(window.SAVE_KEY);
        if (!localDataStr) return;
        let localData = JSON.parse(localDataStr);
        if (!localData.account) return;

        // 每次保存强制刷新更新时间
        localData.update_time = Date.now();
        localStorage.setItem(window.SAVE_KEY, JSON.stringify(localData));

        fetch('/newgame/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: localData.account, data: localData })
        })
            .then(res => res.json())
            .then(res => {
                if (window.closeModal) window.closeModal();
                if (!isSilent) window.showToast("✨ 云端留影完成");
            });
    }
};

// 页面加载自动运行同步
window.addEventListener('load', () => {
    if (window.CloudArchive) CloudArchive.initSync();
});