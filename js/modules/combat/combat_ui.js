// js/modules/combat/combat_ui.js
// 职责：战斗界面的实时更新、日志输出、动画效果
// 修复：适配属性拆分后的 Buff 显示 + 动态刷新行动时间文字

const CombatUI = {
    /** 向日志容器添加一行记录 */
    log: function(ctx, msg) {
        const container = ctx.uiRefs.logContainer;
        if (!container) return;

        const line = document.createElement('div');
        // 样式已在 ui_combat_modal.js 中定义 (border-bottom, padding等)
        line.innerHTML = msg;

        container.appendChild(line);

        // 自动滚动到底部
        if (container.children.length > 60) {
            container.removeChild(container.firstChild);
        }
        setTimeout(() => {
            line.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 0);
    },

    /** 更新 UI 上的数值 (血量、蓝量、属性、Buff) */
    updateStats: function(ctx) {
        const ui = ctx.uiRefs;
        if (!ui.pHp) return; // 容错

        // 1. 更新血蓝条
        const pMaxHp = ctx.player.derived.hpMax;
        const pMaxMp = ctx.player.derived.mpMax || 100;

        ui.pHp.innerText = Math.floor(ctx.currentPHp);
        ui.pHpBar.style.width = `${Math.min(100, (ctx.currentPHp / pMaxHp) * 100)}%`;

        ui.pMp.innerText = Math.floor(ctx.currentPMp);
        ui.pMpBar.style.width = `${Math.min(100, (ctx.currentPMp / pMaxMp) * 100)}%`;

        ui.eHp.innerText = Math.floor(ctx.currentEHp);
        ui.eHpBar.style.width = `${Math.min(100, (ctx.currentEHp / ctx.enemy.maxHp) * 100)}%`;

        // 2. 更新属性 Buff 显示 (红/绿字)
        this._updateAttrStyle(ctx, 'player', ctx.buffs.player);
        this._updateAttrStyle(ctx, 'enemy', ctx.buffs.enemy);

        // 3. 【新增】动态更新“速度时间”文字 (让减速肉眼可见)
        this._updateActionTimeText(ctx, 'player');
        this._updateActionTimeText(ctx, 'enemy');
    },

    /** 更新行动条 (由 CombatCore 的 _tick 高频调用) */
    updateGauges: function(ctx, pPct, ePct) {
        const ui = ctx.uiRefs;
        // 注意：ui_combat_modal.js 里的 ID 是 combat_p_ap_bar / combat_e_ap_bar
        // 如果 init 里没有绑定，这里要做安全检查
        if (ui.pApBar) ui.pApBar.style.width = `${pPct}%`;
        if (ui.eApBar) ui.eApBar.style.width = `${ePct}%`;
    },

    /** 刷新物品快捷栏 CD */
    refreshItemCD: function(ctx) {
        for(let i=0; i<3; i++) {
            // 查找按钮和遮罩 (适配 danyao_cd_overlay)
            const btn = document.getElementById(`combat_btn_use_${i}`);
            const overlay = document.getElementById(`combat_cd_overlay_${i}`);

            if (!overlay || !btn) continue;

            if (ctx.itemCDs[i] > 0) {
                overlay.style.display = "flex";
                overlay.innerText = ctx.itemCDs[i];
                btn.disabled = true;
            } else {
                overlay.style.display = "none";
                // 只有非空槽位才启用
                if (!btn.disabled && btn.innerHTML.includes('空')) {
                    // 保持禁用 (如果是通过 innerHTML 判断空槽的话，或者由 modal 控制)
                } else {
                    btn.disabled = false;
                }
            }
        }
    },

    /** 刷新功法技能 CD */
    refreshSkillCD: function(ctx) {
        // 查找所有功法槽 (适配 gongfa_slot_wrapper)
        const containers = document.querySelectorAll('#sidebar_skills .gongfa_slot_wrapper');

        containers.forEach((wrapper) => {
            const btn = wrapper.querySelector('button[id^="combat_btn_skill_"]');
            if (!btn) return;

            // 从 onclick 属性解析 skillId
            const match = btn.getAttribute('onclick').match(/'([^']+)'/);
            if (!match) return;
            const skillId = match[1];
            const cd = ctx.skillCDs[skillId] || 0;

            // 查找新的类名 .gongfa_cd_overlay
            const overlay = wrapper.querySelector('.gongfa_cd_overlay');

            if (overlay) {
                if (cd > 0) {
                    // 强制覆盖样式以显示
                    overlay.style.cssText = "display: flex !important; align-items: center; justify-content: center; background: rgba(255,255,255,0.75); color: #333; font-weight: bold; font-size: 20px; position: absolute; top:0; left:0; width:100%; height:100%; z-index: 10;";
                    overlay.innerText = cd;
                    btn.disabled = true;
                } else {
                    overlay.style.display = "none";
                    btn.disabled = false;
                }
            }
        });
    },

    updateTox: function(ctx) {
        if (ctx.uiRefs.eToxBar) {
            ctx.uiRefs.eToxBar.style.width = `${ctx.enemy.toxicity}%`;
            ctx.uiRefs.eToxVal.innerText = `${ctx.enemy.toxicity}`;
        }
        if (ctx.uiRefs.pToxBar) {
            ctx.uiRefs.pToxBar.style.width = `${window.player.toxicity}%`;
            ctx.uiRefs.pToxVal.innerText = `${window.player.toxicity}`;
        }
    },

    renderEnd: function(ctx, resultType, extraHtml = "") {
        const container = ctx.uiRefs.logContainer;
        if (container && extraHtml) {
            const div = document.createElement('div');
            div.innerHTML = extraHtml;
            container.appendChild(div);
            setTimeout(() => { div.scrollIntoView({ behavior: "smooth", block: "end" }); }, 0);
        }
    },

    // ================= 内部辅助方法 =================

    /** * 【修复】适配拆分后的属性面板显示Buff
     * 将 atk/def 等通用属性映射到 phy_atk/mag_atk 等具体格子上
     */
    _updateAttrStyle: function(ctx, target, buffs) {
        // ID 前缀: 玩家 p_attr_, 敌人 e_attr_
        const prefix = target === 'player' ? 'p_attr_' : 'e_attr_';

        // 1. 清理旧的 buff 显示
        const allBoxes = document.querySelectorAll(`[id^="${prefix}"]`);
        allBoxes.forEach(box => {
            const buffSpan = box.querySelector('.attr-buff-val');
            if (buffSpan) buffSpan.remove();
        });

        if (!buffs) return;

        // 2. 定义映射关系: Buff属性名 -> UI后缀列表
        const map = {
            'atk': ['phy_atk', 'mag_atk'],      // 攻击 -> 物攻 + 法攻
            'def': ['phy_def', 'mag_def'],      // 防御 -> 物防 + 法防
            'phy_atk': ['phy_atk'],
            'mag_atk': ['mag_atk'],
            'phy_def': ['phy_def'],
            'mag_def': ['mag_def'],
            'speed': ['spd'],                   // 速度 -> 速
            'spd': ['spd']                      // 兼容写法
        };

        // 3. 遍历生效的 Buff
        for (let attr in buffs) {
            const buff = buffs[attr];
            const targetSuffixes = map[attr]; // 找到对应的 UI 盒子后缀

            if (targetSuffixes) {
                targetSuffixes.forEach(suffix => {
                    const elId = prefix + suffix;
                    const el = document.getElementById(elId);
                    if (el) {
                        const isDebuff = (buff.val < 0);
                        const color = isDebuff ? '#d32f2f' : '#388e3c'; // 红/绿
                        const sign = buff.val > 0 ? "+" : ""; // 负数自带符号

                        // 插入 span
                        const html = `<span class="attr-buff-val" style="color:${color}; margin-left:4px; font-size:12px; font-weight:bold;">${sign}${buff.val}</span>`;
                        el.insertAdjacentHTML('beforeend', html);
                    }
                });
            }
        }
    },

    /** * 【新增】动态更新行动时间文字 (如 "2.4秒")
     */
    _updateActionTimeText: function(ctx, target) {
        // 1. 获取当前速度
        // 这里必须用 CombatCalc 获取实时速度（含Buff），不能只读面板
        const stats = CombatCalc.getDynamicStats(ctx, target);
        const speed = stats.speed;

        // 2. 计算秒数 (使用 Core 的配置，确保一致)
        const config = (window.CombatCore && window.CombatCore.CONFIG) ? window.CombatCore.CONFIG : { BASE_TIME: 3.0, SPD_FACTOR: 0.01 };
        const factor = config.SPD_FACTOR;
        const baseTime = config.BASE_TIME;

        // 公式: Time = Base / (1 + speed * factor)
        // 保护：最慢 0.1倍速 (防止除以0或负数)
        const multiplier = 1 + (speed * factor);
        const safeMult = Math.max(0.1, multiplier);
        const actTime = (baseTime / safeMult).toFixed(1);

        // 3. 更新 UI
        const prefix = target === 'player' ? 'p_attr_' : 'e_attr_';
        const box = document.getElementById(prefix + 'spd');
        if (box) {
            // 找到括号里的 .attr-extra 元素
            const extra = box.querySelector('.attr-extra');
            if (extra) {
                extra.innerText = `(${actTime}秒)`;

                // 可选：如果速度被减了，让时间文字变红提示
                if (multiplier < 1.0) extra.style.color = '#d32f2f'; // 变慢了，红色警示
                else if (multiplier > 1.0) extra.style.color = '#388e3c'; // 变快了，绿色
                else extra.style.color = '#aaa'; // 原色
            }
        }
    }
};

window.CombatUI = CombatUI;