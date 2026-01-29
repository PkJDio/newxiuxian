// js/core/utils_audio.js
// 音频管理器 (增强版：自动创建标签 + 防报错)
console.log("加载 音频系统 (v1.1 Safe Mode)");

const UtilsAudio = {
    audioEl: null,
    btnEl: null,
    isPlaying: false,
    defaultVolume: 0.3, // 默认音量

    init: function() {
        // 1. 尝试获取现有标签
        this.audioEl = document.getElementById('bgm_audio');
        this.btnEl = document.getElementById('music_control_btn');

        // 2. 【核心修复】如果没找到 audio 标签，自动创建一个
        if (!this.audioEl) {
            console.warn("⚠️ 未找到 #bgm_audio 标签，正在自动创建...");
            this.audioEl = document.createElement('audio');
            this.audioEl.id = 'bgm_audio';
            this.audioEl.src = 'assets/music/bgm.mp3'; // 确保路径正确
            this.audioEl.loop = true;
            this.audioEl.preload = 'auto';
            document.body.appendChild(this.audioEl);
        }

        // 设置音量
        if (this.audioEl) {
            this.audioEl.volume = this.defaultVolume;
        }
    },

    // 播放音乐
    playBgm: function() {
        // 确保已初始化
        if (!this.audioEl) this.init();

        // 双重检查：如果初始化后还是 null (极少见)，直接返回，防止报错
        if (!this.audioEl) {
            console.error("❌ 无法创建音频元素，播放失败。");
            return;
        }

        // 尝试播放
        const playPromise = this.audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this._updateUI();
                console.log("🎵 BGM 开始播放");
            }).catch(error => {
                // 常见的浏览器拦截报错，改为警告，不红字报错
                console.warn("⚠️ 自动播放等待交互:", error.message);
                this.isPlaying = false;
                this._updateUI();
            });
        }
    },

    // 暂停音乐
    pauseBgm: function() {
        if (!this.audioEl) return;
        this.audioEl.pause();
        this.isPlaying = false;
        this._updateUI();
    },

    // 切换开关
    toggleBgm: function() {
        if (this.isPlaying) {
            this.pauseBgm();
        } else {
            this.playBgm();
        }
    },

    // 更新按钮样式
    _updateUI: function() {
        // 如果连按钮都没找到，就不更新 UI，防止报错
        if (!this.btnEl) return;

        if (this.isPlaying) {
            this.btnEl.classList.add('music-rotating');
            this.btnEl.classList.remove('music-paused');
        } else {
            this.btnEl.classList.remove('music-rotating');
            this.btnEl.classList.add('music-paused');
        }
    }
};

// 暴露给全局
window.UtilsAudio = UtilsAudio;