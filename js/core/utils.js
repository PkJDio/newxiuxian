// 工具箱：随机数, 日志, 弹窗, 时间格式化
console.log("加载 工具箱")

/* ================= 核心工具箱 ================= */

/**
 * 模块 1: 高级随机系统 (基于种子)
 * 使用 MurmurHash3 算法变体，确保同一存档、同一地点、同一时间的结果固定
 */
const RandomSystem = {
  // 核心哈希算法
  _hash: function(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0) / 4294967296; // 转为 0.0 ~ 1.0
  },

  // 基础：获取随机数 (0.0 - 1.0)
  // 参数可以是任意数量的字符串或数字
  get: function(...args) {
    // 自动加入玩家世界种子，确保存档隔离
    const seed = (typeof player !== 'undefined' && player.worldSeed) ? player.worldSeed : 12345;
    const key = `${seed}_${args.join('_')}`;
    return this._hash(key);
  },

  // 场景 A: 基于【坐标 + 周数】(用于野外资源/天气刷新)
  // 传入: x, y
  getByWeekAndCoord: function(x, y, extraKey = "") {
    const week = typeof player !== 'undefined' ? Math.floor(player.dayCount / 7) : 0;
    return this.get("week", week, "coord", x, y, extraKey);
  },

  // 场景 B: 基于【月数 + 城镇】(用于商店刷新)
  // 传入: townId (如 "t_xianyang")
  getByMonthAndTown: function(townId, extraKey = "") {
    const month = typeof player !== 'undefined' ? Math.floor(player.dayCount / 30) : 0;
    return this.get("month", month, "town", townId, extraKey);
  },

  // 场景 C: 基于【城镇固定】(用于NPC姓名/性格生成，永久不变)
  getByTownFixed: function(townId, extraKey = "") {
    return this.get("fixed", "town", townId, extraKey);
  },

  // 辅助：获取范围整数 [min, max]
  getInt: function(min, max, ...seedArgs) {
    const r = this.get(...seedArgs);
    return Math.floor(r * (max - min + 1)) + min;
  }
};

// 暴露简便调用接口
window.getSeededRandom = (...args) => RandomSystem.get(...args);


/**
 * 模块 2: 弹窗管理器 (5种类型)
 * 依赖 css/components.css 中的样式
 */
const ModalManager = {
  // 1. 小弹窗 (Toast) - 自动消失，无按钮
  showToast: function(msg, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'ink_toast'; // 需在 CSS 定义动画
    toast.innerHTML = msg;
    document.body.appendChild(toast);

    // 动画进入
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300); // 等待淡出动画结束
    }, duration);
  },

  // 2. 交互大弹窗 (Inventory/Shop) - 3/4 屏幕, 复杂交互
  showInteractiveModal: function(title, contentHtml, footerHtml = null) {
    this._showBaseModal('modal_interactive', title, contentHtml, footerHtml);
  },

  // 3. 技能/功法弹窗 (Skills) - 3/4 屏幕, 简洁样式
  showSkillModal: function(title, contentHtml) {
    // 复用大弹窗结构，但可以加个特殊的类名控制内部样式
    this._showBaseModal('modal_skill', title, contentHtml, null);
  },

  // 4. 历史大事件弹窗 (History) - 1/2 屏幕, 长方形
  showEventModal: function(title, contentHtml) {
    this._showBaseModal('modal_event', title, contentHtml, null);
  },

  // 5. 警告/死亡弹窗 (Warning) - 红色风格, 强制性
  showWarningModal: function(title, contentHtml, callback) {
    const footer = `<button class="ink_btn_danger" onclick="(${callback.toString()})()">确认</button>`;
    this._showBaseModal('modal_warning', title, contentHtml, footer);
  },

  // --- 内部通用渲染方法 ---
  _showBaseModal: function(typeClass, title, content, footer) {
    const overlay = document.getElementById('modal_overlay');
    const box = document.getElementById('modal_content');

    // 1. 重置并设置类型类名
    box.className = `ink_modal_box ${typeClass}`;

    // 2. 填充内容
    document.getElementById('modal_header').innerHTML = title;
    document.getElementById('modal_body').innerHTML = content;

    const footerEl = document.getElementById('modal_footer');
    if (footer) {
      footerEl.style.display = 'block';
      footerEl.innerHTML = footer;
    } else {
      // 默认只有一个关闭按钮
      footerEl.style.display = 'block';
      footerEl.innerHTML = `<button onclick="closeModal()" class="ink_btn_medium">关闭</button>`;
    }

    // 3. 显示
    overlay.classList.remove('hidden');

    // 4. 绑定 ESC 关闭 (对于非警告类)
    if (typeClass !== 'modal_warning') {
      this._bindEscKey();
    }
  },

  _bindEscKey: function() {
    // 防止重复绑定
    if (this._escHandler) document.removeEventListener('keydown', this._escHandler);

    this._escHandler = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', this._escHandler);
  }
};

// 暴露全局简便接口
window.showToast = ModalManager.showToast.bind(ModalManager);
window.showGeneralModal = ModalManager.showInteractiveModal.bind(ModalManager); // 兼容旧代码
window.closeModal = function() {
  document.getElementById('modal_overlay').classList.add('hidden');
  // 解绑 ESC，防止关闭了还在监听
  if (ModalManager._escHandler) document.removeEventListener('keydown', ModalManager._escHandler);
};


/**
 * 模块 3: 悬浮窗管理器 (分离逻辑)
 * 分为: 状态数值(Stat), 物品(Item), 技能(Skill)
 */
const TooltipManager = {
  el: null,

  _init: function() {
    if (!this.el) this.el = document.getElementById('global_tooltip');
  },

  // 显示位置跟随鼠标
  _move: function(e) {
    if (!this.el) return;
    const x = e.clientX + 15;
    const y = e.clientY + 15;

    const rect = this.el.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    this.el.style.left = (x + rect.width > winW ? x - rect.width - 15 : x) + 'px';
    this.el.style.top = (y + rect.height > winH ? y - rect.height - 15 : y) + 'px';
  },

  // 1. 状态数值悬浮窗
  showStatus: function(e, key, label) {
    this._init();
    const breakdown = window.player && window.player.statBreakdown ? window.player.statBreakdown[key] : [];

    let html = `<div class="tt_title">${label}详情</div>`;
    if (breakdown && breakdown.length > 0) {
      breakdown.forEach(b => {
        html += `<div class="tt_row"><span>${b.label}</span><span class="${b.val > 0 ? 'tt_pos' : 'tt_neg'}">${b.val > 0 ? '+' : ''}${b.val}</span></div>`;
      });
    } else {
      html += `<div class="tt_desc">暂无加成</div>`;
    }

    this.el.className = 'ink_tooltip tt_status';
    this.el.innerHTML = html;
    this.el.classList.remove('hidden');
    this._move(e);
  },

  // 2. 物品悬浮窗 (已升级：支持功法学习状态显示)
  // 2. 物品悬浮窗 (升级版：支持不同模式)
  // 参数: e(事件), itemId(ID), instance(实体对象), mode(模式字符串)
  // 2. 物品悬浮窗 (优化版：隐藏0值属性，自动管理分割线)
  showItem: function(e, itemId, instance = null, mode = 'normal') {
    this._init();
    const item = instance || GAME_DB.items.find(i => i.id === itemId);
    if (!item) return;

    const color = (RARITY_CONFIG[item.rarity] || { color: '#ccc' }).color;

    // --- 基础信息 ---
    let html = `<div class="tt_header" style="color:${color}">${item.name}</div>`;
    html += `<div class="tt_sub">${TYPE_MAPPING[item.type] || '未知'} · ${item.rarity}品</div>`;
    html += `<div class="tt_desc">${item.desc}</div>`;

    // --- 动态信息 (图鉴模式下隐藏) ---
    if (mode !== 'gallery') {
      // 1. 功法/配方 学习状态
      if (item.type === 'book' && typeof player !== 'undefined') {
        const isLearned = (player.skills && player.skills[item.id]) ||
          (player.learnedRecipes && player.learnedRecipes.includes(item.id));

        html += `<div class="tt_sep"></div>`;
        html += `<div class="tt_row">
                <span>修习状态</span>
                <span style="${isLearned ? 'color:#5cff5c' : 'color:#888'}">
                    ${isLearned ? '已研读' : '未研读'}
                </span>
            </div>`;
      }

      // 2. 价格显示
      if (item.price) {
        html += `<div class="tt_row"><span>参考价</span><span style="color:gold">${item.price} 灵石</span></div>`;
      }
    }

    // --- 属性效果 (Effects) ---
    if (item.effects) {
      let effectRows = ""; // 先缓存 HTML，确认有内容后再拼接

      for (let k in item.effects) {
        const val = item.effects[k];

        // 【关键修改】数值为0直接跳过
        if (val === 0) continue;

        // 获取中文名
        const attrName = (typeof ATTR_MAPPING !== 'undefined' && ATTR_MAPPING[k]) ? ATTR_MAPPING[k] : k;

        // 格式化数值
        const valStr = val > 0 ? `+${val}` : `${val}`;
        const valColor = val > 0 ? '#5cff5c' : '#ff5555';

        effectRows += `
            <div class="tt_row">
                <span style="color:#aaa">${attrName}</span>
                <span style="color:${valColor}">${valStr}</span>
            </div>
        `;
      }

      // 只有当有有效属性时，才添加分割线和内容
      if (effectRows !== "") {
        html += `<div class="tt_sep"></div>`;
        html += effectRows;
      }
    }

    this.el.className = 'ink_tooltip tt_item';
    this.el.innerHTML = html;
    this.el.classList.remove('hidden');
    this._move(e);
  },
  // 3. 技能悬浮窗 (纯技能面板用)
  showSkill: function(e, skillId) {
    this._init();
    const item = GAME_DB.items.find(i => i.id === skillId);
    const skillData = player.skills[skillId];

    let name = item ? item.name : skillId;
    let desc = item ? item.desc : "未知技能";
    let level = skillData ? SKILL_CONFIG.levelNames[skillData.level] : "未入门";

    let html = `<div class="tt_header_skill">${name}</div>`;
    html += `<div class="tt_sub">境界: ${level}</div>`;
    html += `<div class="tt_desc">${desc}</div>`;

    this.el.className = 'ink_tooltip tt_skill';
    this.el.innerHTML = html;
    this.el.classList.remove('hidden');
    this._move(e);
  },

  hide: function() {
    if (this.el) this.el.classList.add('hidden');
  }
};

// 暴露全局简便接口
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);

// 绑定全局鼠标移动事件
document.addEventListener('mousemove', (e) => {
  const tt = document.getElementById('global_tooltip');
  if (tt && !tt.classList.contains('hidden')) {
    TooltipManager._move(e);
  }
});
