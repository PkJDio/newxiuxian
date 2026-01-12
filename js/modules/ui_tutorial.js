// js/modules/ui_tutorial.js
// 新手引导系统：完整版 (包含主页、怪物、战斗引导)

window.UITutorial = {
    currentStep: 0,
    steps: [],
    tutorialType: 'main', // 'main', 'monster', 'combat'

    // ================== 1. 主页引导配置 (根据 index.html 最新按钮更新) ==================
    mainSteps: [
        {
            target: 'left_profile_box',
            title: '1. 道友档案',
            text: '这里显示你的道号、境界和寿元。修仙逆天而行，寿元耗尽若未突破，则需兵解轮回。'
        },
        {
            target: 'left_attr_combat',
            title: '2. 生存状态',
            text: '时刻关注【饱食】和【疲劳】。状态不佳时，你的修炼效率和战斗能力会大打折扣。'
        },
        {
            target: 'center_toolbar',
            title: '3. 功能行囊',
            text: '【行囊】装纳万物，【技艺】可查看生活技能，【地图】则用于周游列国，寻找机缘。'
        },
        {
            target: 'btn_action_gather',
            title: '4. 寻幽探秘',
            text: '【资源来源】在当前地图进行探索。这是获取草药、矿石等炼丹炼器材料的主要途径。'
        },
        {
            target: 'btn_action_train',
            title: '5. 打坐修炼',
            text: '【修为根本】将天地灵气转化为自身修为。当进度条满时，即可尝试突破境界。'
        },
        {
            target: 'btn_action_study',
            title: '6. 研读功法',
            text: '【提升战力】阅读行囊中的秘籍。可提升悟性，学会强大的被动技能或战斗招式。'
        },
        {
            target: 'btn_action_rest',
            title: '7. 休憩养神',
            text: '【消除疲劳】恢复血量、法力并消除疲劳值。客栈比野外更安全，但需要花费银两。'
        },
        {
            target: 'btn_action_fish',
            title: '8. 垂钓之乐',
            text: '【食材获取】装备鱼竿和鱼饵后可进行垂钓。除了鱼，有时还能钓到意想不到的宝物。'
        },
        {
            target: 'btn_action_water',
            title: '9. 汲水',
            text: '【基础资源】前往水源处打水。水是生存的必需品，也是烹饪的重要材料。'
        },
        {
            target: 'btn_action_cook',
            title: '10. 烹饪美食',
            text: '【生活技艺】使用食材和水制作佳肴。烹饪出的食物不仅更美味，恢复效果也更佳。'
        },
        {
            target: 'btn_action_eat',
            title: '11. 进食果腹',
            text: '【补充体力】当饱食度低时，记得点击此按钮。它会自动消耗行囊里的食物。'
        },
        {
            target: 'btn_action_market',
            title: '12. 城镇集市',
            text: '【交易买卖】身处城镇时可进入集市。在这里购买物资，或出售多余的战利品换取盘缠。'
        },
        {
            target: 'right_log_container',
            title: '13. 江湖传闻',
            text: '你的修仙之路会被记录在此。战斗结果、奇遇事件都会在这里实时更新。'
        }
    ],

    // ================== 2. 战斗引导配置 ==================
    combatSteps: [
        {
            target: 'combat_e_hp_bar',
            title: '知己知彼',
            text: '这里显示敌人的气血。如果遇到境界（名字颜色）远高于你的敌人，请务必小心！'
        },
        {
            target: 'combat_p_hp_bar',
            title: '自身状态',
            text: '时刻关注自己的气血和法力。法力耗尽将无法释放技能。'
        },
        {
            target: 'sidebar_consumables',
            title: '丹药补给',
            text: '战斗中可以使用背包里的丹药恢复状态。合理使用丹药往往能扭转战局。'
        },
        {
            target: 'sidebar_skills',
            title: '功法技能',
            text: '这里列出你装备的主动功法。点击即可释放，技能有冷却时间，请择机使用。'
        },
        {
            target: 'combat_logs_realtime',
            title: '战斗推演',
            text: '战斗过程自动进行，你可以在这里观察每一招一式的详细判定。'
        }
    ],
    // ================== 3. 建筑引导配置 ==================
    buildingSteps: {
        'inn': [
            { target: 'inn_panel_main', title: '悦来客栈', text: '【休憩】花费银两在客栈休息，可以安全地恢复全状态并消除疲劳。\n【打听】或许能听到一些特殊的传闻或任务线索。' }
        ],
        'bounty': [
            { target: 'bounty_board_panel', title: '悬赏榜', text: '【接取悬赏】这里发布着官府或个人的委托。完成悬赏可获得灵石和声望。' },
            { target: 'bounty_task_list', title: '任务列表', text: '接取前请留意任务的【难度】（骷髅头）和【时限】。量力而行，切勿贪功冒进。' }
        ],
        'blacksmith': [
            { target: 'blacksmith_panel_main', title: '铁匠铺', text: '你可以在这里出售多余的装备换取铜板。' },
            { target: 'btn_smith_buy', title: '兵甲买卖', text: '如果有神兵利器出售，不妨买下来武装自己。' }
        ],
        'medical': [
            { target: 'medical_panel_main', title: '回春堂', text: '【治疗】花费银两恢复气血。高级治疗甚至能消除顽疾（疲劳Buff）。' },
            { target: 'btn_medical_buy', title: '丹药购买', text: '行走江湖，金疮药和回气丹是必备之物。' }
        ],
        'alchemy': [
            { target: 'alchemy_panel_main', title: '丹房', text: '这里高价回收各类药材。如果你采集到了珍稀草药，不妨来这里换取灵石。' }
        ],
        'market': [
            { target: 'market_panel_main', title: '集市/黑市', text: '这里鱼龙混杂，经常会有稀奇古怪的宝物出售。' },
            { target: 'black-buy-list', title: '淘货', text: '看中什么就买下来吧，机会难得，过时不候！' }
        ]
    },
    buildingSteps: {
        'bag': [
            {target: 'bag_equipment_row', title: '穿戴装备', text: '上方显示你已穿戴的神兵利器及随身丹药。'},
            {target: 'bag_grid_content', title: '行囊格目', text: '这里存放着你所有的资源。点击物品可以查看详细属性，进行使用或丢弃。'},
            {target: 'bag_toolbar_container', title: '行囊管理', text: '点击【整理】可自动分类，【批量丢弃】则能快速清理不需要的杂物。'}
        ],
        'skill': [
            {
                target: 'tab_body',
                title: '外功招式',
                text: '外功主要提升攻击、防御、速度等战斗属性。点击左侧卡片可进行“运功”装备。'
            },
            {
                target: 'tab_cultivation',
                title: '内功心法',
                text: '内功主要提升精、气、神等人物基础属性。高深内功是修仙境界突破的基石。'
            },
            {
                target: 'slots_dynamic_container',
                title: '当前运功',
                text: '这里显示你正在运行的功法。功法只有在此处激活，其加成属性才会正式生效。'
            }
        ],
        'bounty_list': [
            {
                target: 'bounty_list_container', // 指向整个弹窗容器
                title: '任务书卷',
                text: '这里记录了你当前接取的所有悬赏任务。点击【快捷键 T】可随时查看。'
            },
            {
                target: 'bounty_progress_container', // 指向第一个任务的进度条（如果存在）
                title: '任务进度',
                text: '务必关注这里的进度。当显示“可交付”时，需返回任务所属城镇的告示牌领取奖励。'
            },
            {
                target: 'bounty_deadline',
                title: '期限与惩罚',
                text: '注意任务截止日期。若逾期未完成，任务将判定失败，可能会扣除一定的声望。'
            }
        ],
    },
    /**
     * 检查并触发建筑引导
     * @param {string} buildingKey 建筑标识，如 'inn', 'bounty'
     */
    checkBuilding: function(buildingKey) {
        const storageKey = 'xiuxian_tut_build_' + buildingKey;
        if (localStorage.getItem(storageKey) === 'true') return;

        const steps = this.buildingSteps[buildingKey];
        if (!steps) return;

        this.tutorialType = 'building_' + buildingKey;
        this.steps = steps;
        this.currentStep = 0;

        setTimeout(() => {
            const overlay = document.getElementById('tutorial_overlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                this.render();
                localStorage.setItem(storageKey, 'true');
            }
        }, 600);
    },

    init: function() {
        // 绑定主页不再提醒的 checkbox 事件
        const check = document.getElementById('tut_check_ignore');
        if(check) {
            const isIgnored = localStorage.getItem('xiuxian_tutorial_ignore') === 'true';
            check.checked = isIgnored;
            check.onchange = function() {
                localStorage.setItem('xiuxian_tutorial_ignore', this.checked);
            };
        }
    },

    // 检查是否需要自动开始 (在轮回/新游戏时调用)
    checkAutoStart: function() {
        const isIgnored = localStorage.getItem('xiuxian_tutorial_ignore') === 'true';
        if (!isIgnored) {
            this.start(false, 'main');
        }
    },

    /**
     * 启动引导
     * @param {boolean} force 是否强制开启
     * @param {string} type 引导类型：'main' | 'monster' | 'combat'
     * @param {object} extraData 额外数据，用于 'monster' 类型传入虚拟坐标 {left, top, width, height}
     */
    start: function(force = false, type = 'main', extraData = null) {
        // 检查是否已忽略
        if (!force) {
            if (type === 'main' && localStorage.getItem('xiuxian_tutorial_ignore') === 'true') return;
            if (type === 'monster' && localStorage.getItem('xiuxian_tut_monster_ignore') === 'true') return;
            if (type === 'combat' && localStorage.getItem('xiuxian_tut_combat_ignore') === 'true') return;
        }

        this.tutorialType = type;
        this.currentStep = 0;

        // 根据类型加载数据
        if (type === 'combat') {
            this.steps = this.combatSteps;
        } else if (type === 'monster') {
            // 动态生成怪物引导
            if (!extraData) return;
            this.steps = [{
                target: extraData, // 直接使用虚拟坐标对象
                title: '发现敌人！',
                text: '地图上的红点代表敌人或猎物。点击图标即可拔剑迎敌！'
            }];
        } else {
            this.steps = this.mainSteps;
        }

        const overlay = document.getElementById('tutorial_overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            this.render();
        } else {
            console.error("未找到 id='tutorial_overlay' 的元素，请在 index.html 添加");
        }
    },

    render: function() {
        if (this.currentStep >= this.steps.length) {
            this.finish();
            return;
        }

        const stepData = this.steps[this.currentStep];
        let rect = null;

        // 1. 获取目标区域坐标
        if (typeof stepData.target === 'string') {
            const el = document.getElementById(stepData.target);
            if (!el) {
                console.warn(`引导目标 ID [${stepData.target}] 未找到，跳过`);
                this.next();
                return;
            }
            rect = el.getBoundingClientRect();
        } else if (typeof stepData.target === 'object') {
            rect = stepData.target;
        }

        if (!rect) return;

        // 2. 更新文字内容
        const titleEl = document.getElementById('tut_title');
        const contentEl = document.getElementById('tut_content');
        const stepEl = document.getElementById('tut_step');
        const totalEl = document.getElementById('tut_total');

        if(titleEl) titleEl.innerText = stepData.title;
        if(contentEl) contentEl.innerText = stepData.text;
        if(stepEl) stepEl.innerText = this.currentStep + 1;
        if(totalEl) totalEl.innerText = this.steps.length;

        // 3. 更新按钮状态
        const btnNext = document.getElementById('tut_btn_next');
        const btnPrev = document.getElementById('tut_btn_prev');
        if (btnNext) btnNext.innerText = (this.currentStep === this.steps.length - 1) ? "完成" : "下一步";
        if (btnPrev) btnPrev.disabled = (this.currentStep === 0);

        // 4. 定位聚光灯 (Spotlight)
        const spotlight = document.getElementById('tutorial_spotlight');
        const box = document.getElementById('tutorial_box');
        const padding = 8;

        if (spotlight) {
            spotlight.style.width = (rect.width + padding * 2) + 'px';
            spotlight.style.height = (rect.height + padding * 2) + 'px';
            spotlight.style.top = (rect.top - padding) + 'px';
            spotlight.style.left = (rect.left - padding) + 'px';
        }

        // ================= 智能定位说明框 =================
        if (box) {
            const boxH = box.offsetHeight || 200;
            const boxW = box.offsetWidth || 320;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const gap = 20;
            const edgePadding = 20;

            // 1. 水平定位：优先尝试“居中对齐”目标
            let left = rect.left + (rect.width / 2) - (boxW / 2);

            // 边界修正
            if (left < edgePadding) left = edgePadding;
            if (left + boxW > screenW - edgePadding) left = screenW - boxW - edgePadding;

            // 2. 垂直定位：优先“目标下方”，次选“目标上方”
            let top = rect.bottom + gap;

            if (top + boxH > screenH - edgePadding) {
                top = rect.top - boxH - gap;
                if (top < edgePadding) {
                    // 上下都放不下，强制固定底部中央
                    top = screenH - boxH - 60;
                    left = (screenW - boxW) / 2;
                }
            }

            box.style.top = top + 'px';
            box.style.left = left + 'px';
        }

        // 显示 checkbox (仅在主引导时显示)
        const checkContainer = document.querySelector('.tut_footer');
        if (checkContainer) {
            checkContainer.style.display = (this.tutorialType === 'main') ? 'block' : 'none';
        }
    },

    next: function() {
        this.currentStep++;
        this.render();
    },

    prev: function() {
        this.currentStep--;
        this.render();
    },

    finish: function() {
        const overlay = document.getElementById('tutorial_overlay');
        if (overlay) overlay.classList.add('hidden');

        // 记录状态
        if (this.tutorialType === 'monster') {
            localStorage.setItem('xiuxian_tut_monster_ignore', 'true');
        } else if (this.tutorialType === 'combat') {
            localStorage.setItem('xiuxian_tut_combat_ignore', 'true');
        }
    }
};

// 页面加载后初始化
window.addEventListener('load', function() {
    if(window.UITutorial) window.UITutorial.init();
});