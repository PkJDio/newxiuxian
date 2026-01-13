// js/action/times/time_history.js
// 职责：处理大秦历史线与灵气复苏背景

const TimeHistory = {
    /** 检查重大历史转折 (Major) */
    checkMajor: function() {
        const Timeline = window.DataTimeline;
        if (!Timeline || !Timeline.Major) return;

        const t = player.time;
        let currentStage = player.timeStart || 0;

        for (let event of Timeline.Major) {
            if (event.stage > currentStage) {
                // 判断逻辑：是否已经到了或过了该事件的预定日期
                if (t.year > event.year ||
                    (t.year === event.year && t.month > event.month) ||
                    (t.year === event.year && t.month === event.month && t.day >= event.day)) {

                    // 1. 推进阶段
                    player.timeStart = event.stage;

                    // 2. 触发全屏历史事件弹窗
                    if (window.UtilsModal && window.UtilsModal.showEventModal) {
                        window.UtilsModal.showEventModal(event.title, event.desc);
                    }

                    // 3. 记录重要日志
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
        // 筛选出今天的传闻
        const events = Timeline.Minor.filter(e => e.year === t.year && e.month === t.month && e.day === t.day);

        events.forEach(event => {
            const typeMap = { 'court': '【朝廷】', 'nature': '【天象】', 'world': '【天下】', 'rumor': '【传闻】' };
            const prefix = typeMap[event.type] || "【传闻】";

            if (window.showToast) window.showToast(`${prefix} ${event.text}`);
            if (window.LogManager) window.LogManager.add(`${prefix} ${event.text}`, "normal");
        });
    }
};