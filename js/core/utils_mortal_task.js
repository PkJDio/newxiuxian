// js/core/utils_mortal_task.js

const UtilsMortalTask = {

    acceptTask: function(rank, pathId, customName) {
        if (!window.player) return;

        const config = window.DATA_MORTAL.PATHS[pathId];
        if (!config) return;

        const targetVal = config.formula(rank);
        const taskName = customName || config.name || "试炼";

        const task = {
            pathId: pathId,
            name: taskName,
            rank: rank,
            state: "active",

            mainType: config.task_type,
            mainTarget: targetVal,
            mainCurrent: 0,
            mainDesc: config.task_desc,

            // 记录特殊要求 (速度限制 / 金钱消耗)
            minSpeed: config.min_speed_formula ? config.min_speed_formula(rank) : 0,
            costMoney: config.cost_money_formula ? config.cost_money_formula(rank) : 0,

            extra: null
        };

        if (config.extra && config.extra[rank]) {
            const exConf = config.extra[rank];
            task.extra = {
                type: exConf.type,
                target: exConf.target,
                current: 0,
                desc: exConf.desc,
                params: exConf.params // 传递参数(如物品类型、稀有度)
            };
        }

        player.mortal_task = task;
        if(window.saveGame) window.saveGame();
        // 【新增】立即刷新地图界面，显示右上角任务框
        if (window.MapCamera) window.MapCamera.requestRender();
        if (window.showToast) window.showToast(`已立下【${taskName}】之志，开始试炼！`);
    },

    updateProgress: function(type, value = 1, context = {}) {
        // console.log("updateProgress",type, value, context);
        if (!window.player || !player.mortal_task || player.mortal_task.state !== "active") return;
        // 【新增】立即刷新地图界面，显示右上角任务框
        if (window.MapCamera) window.MapCamera.requestRender();
        const task = player.mortal_task;
        let updated = false;

        // --- 1. 主任务检查 ---
        if (task.mainType === type) {
            let valid = true;

            // [逐影踪] 检查速度是否达标
            if (type === 'move_distance' && task.minSpeed > 0) {
                const currentSpeed = context.speed || 0;
                if (currentSpeed <= task.minSpeed) {
                    valid = false; // 速度不足，不计入进度
                }
            }

            if (valid) {
                if (task.mainCurrent < task.mainTarget) {
                    task.mainCurrent += value;
                    if (task.mainCurrent > task.mainTarget) task.mainCurrent = task.mainTarget;
                    updated = true;
                }
            }
        }

        // --- 2. 额外任务检查 ---
        if (task.extra && task.extra.type === type) {
            let valid = true;

            // [磐石固/载道躯] 检查物品是否符合要求
            if (type === 'use_specific_item' && task.extra.params) {
                const req = task.extra.params;
                const item = context.item;

                if (!item) valid = false;
                else {
                    // 类型匹配 (pill/fish)
                    if (req.type && item.type !== req.type) valid = false;

                    if(item.type!="fish"){
                        // 属性匹配 (def/atk/hp...)
                        if (req.attr && (!item.effects || item.effects.buff.attr!=req.attr)) valid = false;
                    }


                    // 稀有度匹配 (兼容上级物品: 物品稀有度 >= 要求稀有度)
                    if (req.rarity && (item.rarity || 1) < req.rarity) valid = false;

                }
            }
            console.log("valid", valid);
            if (valid) {
                if (task.extra.current < task.extra.target) {
                    task.extra.current += value;
                    if (task.extra.current > task.extra.target) task.extra.current = task.extra.target;
                    updated = true;
                }
            }
        }

        if (updated) {
            this.checkCompletion();
        }
    },

    checkCompletion: function() {
        const task = player.mortal_task;
        if (!task) return;

        const mainDone = task.mainCurrent >= task.mainTarget;
        const extraDone = task.extra ? (task.extra.current >= task.extra.target) : true;

        if (mainDone && extraDone) {
            task.state = "completed";
            // if (window.showToast) window.showToast("瓶颈试炼已完成，请前往突破！", "success");
            ModalManager.showMortalBreakthroughModal("试炼通知","瓶颈试炼已完成，请前往突破！");
            if (window.saveGame) window.saveGame();
            if (window.UI_Mortal && window.UI_Mortal.render) {
                window.UI_Mortal.render();
            }
        }
    },

    finishTask: function() {
        if (!player.mortal_task || player.mortal_task.state !== "completed") return;

        const task = player.mortal_task;

        // [混元志] 检查金钱消耗
        if (task.costMoney > 0) {
            if (player.money < task.costMoney) {
                if(window.showToast) window.showToast(`突破需消耗 ${task.costMoney} 钱财，当前不足！`);
                return false;
            }
            UtilsMoney.removeMoney(task.costMoney);
        }

        const config = window.DATA_MORTAL.PATHS[task.pathId];
        const rank = task.rank;
        const fullName = task.name;

        // 1. 记录到历史 (先记录，方便recalcSlots读取)
        if (!player.mortal_path_history) player.mortal_path_history = {};
        player.mortal_path_history[rank] = {
            name: fullName,
            attr: config.reward.attr,
            value: config.reward.val,
            isBuff: config.reward.isBuff
        };

        // 2. 发放奖励
        if (config.reward.isBuff) {
            if (window.addBuff) {

                window.addBuff(`mortal_r${rank}`, {
                    name: fullName,
                    attr: ATTR_MAPPING[config.reward.attr],
                    val: config.reward.attr=="all2"?"+5%":"+20%",
                    desc: config.attr_desc,
                    days: 999999,
                    source: "凡尘武学",
                    isDebuff: false,
                    effects: this._parseAttr(config.reward.attr, config.reward.val)
                });
            }
        } else {
            // 【修改】属性发放逻辑
            const attrs = config.reward.attr.split(',');
            let needRecalcSlots = false;

            attrs.forEach(key => {
                // 如果是槽位奖励，不直接+=，而是标记需要重算
                if (key === 'gongfa_nums' || key === 'zhaoshi_nums') {
                    needRecalcSlots = true;
                } else {
                    // 其他属性正常增加
                    if (player[key] !== undefined) player[key] += config.reward.val;
                }
            });

            // 如果涉及槽位奖励，统一执行重算逻辑 (覆盖老数据)
            if (needRecalcSlots) {
                this.recalcSlots();
            }
        }

        // 3. 扣除经验，晋升等级
        const rankData = window.DATA_MORTAL.RANKS[rank];
        if (rankData) {
            player.mortal_exp -= rankData.maxExp;
            if (player.mortal_exp < 0) player.mortal_exp = 0;
        }

        player.mortal_rank = rank + 1;
        player.is_bottleneck = false;
        player.mortal_task = null;

        if (window.recalcStats) window.recalcStats();
        if (window.saveGame) window.saveGame();

        if (window.showToast) window.showToast(`突破成功！晋升 ${window.DATA_MORTAL.RANKS[player.mortal_rank].name}`);

        return true;
    },

    /**
     * 【新增】根据历史记录修正槽位数量
     * 规则：基础1 + 历史记录中对应奖励的次数
     * 如果发现当前槽位多于历史记录应有的数量，则强制卸下所有装备并重置槽位
     */
    recalcSlots: function() {
        if (!window.player || !player.mortal_path_history) return;

        // 1. 计算理论应有的槽位数
        let gongfaBase = 1;
        let zhaoshiBase = 1;

        for (let rank in player.mortal_path_history) {
            const record = player.mortal_path_history[rank];
            const attr = record.attr || "";

            // 只要历史奖励中包含该属性，就增加1点
            if (attr.indexOf('gongfa_nums') !== -1) {
                gongfaBase++;
            }
            if (attr.indexOf('zhaoshi_nums') !== -1) {
                zhaoshiBase++;
            }
        }

        // 2. 检测功法槽是否需要回退 (当前 > 理论)
        const currentGongfa = player.gongfa_nums || 1;
        if (currentGongfa > gongfaBase) {
            console.warn(`[UtilsMortalTask] 功法槽位数据异常(${currentGongfa} > ${gongfaBase})，执行重置。`);

            // 强制卸下/清空已装备功法 (根据您的要求：设置为初始空状态)
            if (player.equipment) {
                // 创建对应数量的空槽位 [null, null, ...]
                player.equipment.gongfa = new Array(gongfaBase).fill(null);
            }

            if (window.showToast) window.showToast("检测到功法槽位异常，已自动修正并卸下功法。");
        }
        // 更新数值
        player.gongfa_nums = gongfaBase;


        // 3. 检测招式槽是否需要回退
        const currentZhaoshi = player.zhaoshi_nums || 1;
        if (currentZhaoshi > zhaoshiBase) {
            console.warn(`[UtilsMortalTask] 招式槽位数据异常(${currentZhaoshi} > ${zhaoshiBase})，执行重置。`);

            // 强制卸下/清空已装备招式
            // 根据您的指示 zhaoshi_equipped={}，如果是数组则重置为数组，对象则重置为对象
            if (player.zhaoshi_equipped) {
                if (Array.isArray(player.zhaoshi_equipped)) {
                    player.zhaoshi_equipped = new Array(zhaoshiBase).fill(null);
                } else {
                    player.zhaoshi_equipped = {};
                }
            }

            // if (window.showToast) window.showToast("检测到招式槽位异常，已自动修正并卸下招式。");
        }
        // 更新数值
        player.zhaoshi_nums = zhaoshiBase;

        console.log(`[UtilsMortalTask] 槽位校准完成: 功法=${gongfaBase}, 招式=${zhaoshiBase}`);
    },

    /**
     * 放弃任务
     */
    abandonTask: function() {
        if (!player.mortal_task) return;

        const doAbandon = () => {
            player.mortal_task = null;
            if (window.saveGame) window.saveGame();
            if (window.UI_Mortal) window.UI_Mortal.render();
            if (window.showToast) window.showToast("已放弃当前试炼");
            if (window.MapCamera) window.MapCamera.requestRender();
        };

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            const tempName = 'cb_abandon_' + Date.now();
            window[tempName] = () => {
                window.closeModal();
                doAbandon();
                delete window[tempName];
            };

            const footerHtml = `
                <div style="display:flex; justify-content:center; gap:20px; width:100%; padding-bottom:10px;">
                    <button class="ink_btn_normal" onclick="window.closeModal()">再想想</button>
                    <button class="ink_btn_danger" onclick="window['${tempName}']()">确定放弃</button>
                </div>
            `;

            const contentHtml = `
                <div style="text-align:center; padding:15px; font-size:18px; line-height:1.6;">
                    确定要放弃当前的突破试炼吗？<br>
                    <span style="color:#d32f2f; font-weight:bold; font-size:16px;">⚠️ 警告：当前积累的进度将完全丢失！</span>
                </div>
            `;

            window.UtilsModal.showInteractiveModal(
                "放弃试炼",
                contentHtml,
                footerHtml,
                "modal_warning",
                null, null,
                { allowOutsideClick: false }
            );

        } else {
            if (confirm("确定要放弃当前的突破试炼吗？进度将丢失。")) {
                doAbandon();
            }
        }
    },

    _parseAttr: function(attrStr, val) {
        let effects = {};
        if (attrStr === 'all2') {
            effects = { atkPct: val, defPct: val, spdPct: val };
        } else {
            if(attrStr=="atkPct"){
                effects = { atkPct: val };
            }else if(attrStr=="defPct"){
                effects = {defPct: val };
            }else if(attrStr=="spdPct"){
                effects = {spdPct: val };
            }
        }
        return effects;
    }
};

window.UtilsMortalTask = UtilsMortalTask;