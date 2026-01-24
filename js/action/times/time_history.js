// js/action/times/time_history.js
// 职责：处理大秦历史线与法力复苏背景 (逻辑优化版)

const TimeHistory = {
    /** 检查重大历史转折 (Major) */
    checkMajor: function() {
        const Timeline = window.DataTimeline;
        if (!Timeline || !Timeline.Major) return;

        const t = player.time;
        // 读取旧阶段
        const currentStage = player.timeStart || 0;

        for (let event of Timeline.Major) {
            if (event.stage > currentStage) {
                // 触发条件
                const condition1 = t.year > event.year;
                const condition2 = (t.year === event.year && t.month > event.month);
                const condition3 = (t.year === event.year && t.month === event.month && t.day >= event.day);

                if (condition1 || condition2 || condition3) {
                    console.warn(`[TimeHistory] ⏳ 触发 Major 事件预备: ${event.title}`);

                    // 【核心修改】构建确认回调
                    const onConfirmHistory = function() {
                        console.log(`[TimeHistory] 📜 玩家确认历史事件，推进阶段 -> ${event.stage}`);

                        // 1. 推进时间阶段
                        player.timeStart = event.stage;

                        // 2. 开启危机开关 (0 -> 1)
                        // 当天 checkRaid 会因为 startDanger 为 0 而跳过
                        // 次日 checkRaid 会因为 startDanger 为 1 而触发剧情杀
                        if (!player.startDanger) {
                            player.startDanger = 1;
                            console.log("[TimeHistory] ⚠️ 乱世已至，危机计数器启动 (startDanger = 1)");
                            LogManager.add(" 乱世已至,危险即将到来！")
                        }

                        // 3. 保存
                        if(window.saveGame) window.saveGame();
                    };

                    // 2. 弹窗显示 (支持回调)
                    if (window.UtilsModal && window.UtilsModal.showEventModal) {
                        window.UtilsModal.showEventModal(event.title, event.desc, onConfirmHistory);
                    } else {
                        // 降级兼容
                        onConfirmHistory();
                    }

                    // 3. 记录日志
                    if (window.LogManager) {
                        window.LogManager.add(`【历史洪流】${event.title}：${event.desc}`, "important");
                    }

                    break;
                }
            }
        }
    },

    /** 检查每日民间传闻 (Minor) */
    checkMinor: function() {
        const Timeline = window.DataTimeline;
        if (!Timeline || !Timeline.Minor) return;

        const t = player.time;
        const events = Timeline.Minor.filter(e => e.year === t.year && e.month === t.month && e.day === t.day);

        events.forEach(event => {
            const typeMap = { 'court': '【朝廷】', 'nature': '【天象】', 'world': '【天下】', 'rumor': '【传闻】' };
            const prefix = typeMap[event.type] || "【传闻】";

            // if (window.showToast) window.showToast(`${prefix} ${event.text}`);
            if (window.LogManager) window.LogManager.add(`${prefix} ${event.text}`, "normal");
            ModalManager.showEventModal('民间传闻', event.text);
        });
    }
};