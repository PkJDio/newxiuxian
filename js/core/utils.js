// 工具箱：随机数, 日志, 弹窗, 时间格式化
console.log("加载 工具箱")

/* ================= 核心工具箱 ================= */

/**
 * 模块 1: 高级随机系统 (基于种子)
 */
const RandomSystem = {
  _hash: function(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0) / 4294967296;
  },
  get: function(...args) {
    const seed = (typeof player !== 'undefined' && player.worldSeed) ? player.worldSeed : 12345;
    const key = `${seed}_${args.join('_')}`;
    return this._hash(key);
  },
  getByWeekAndCoord: function(x, y, extraKey = "") {
    const week = typeof player !== 'undefined' ? Math.floor(player.dayCount / 7) : 0;
    return this.get("week", week, "coord", x, y, extraKey);
  },
  getByMonthAndTown: function(townId, extraKey = "") {
    const month = typeof player !== 'undefined' ? Math.floor(player.dayCount / 30) : 0;
    return this.get("month", month, "town", townId, extraKey);
  },
  getByTownFixed: function(townId, extraKey = "") {
    return this.get("fixed", "town", townId, extraKey);
  },
  getInt: function(min, max, ...seedArgs) {
    const r = this.get(...seedArgs);
    return Math.floor(r * (max - min + 1)) + min;
  }
};
window.getSeededRandom = (...args) => RandomSystem.get(...args);




/**
 * 模块 3: 悬浮窗管理器
 */
const TooltipManager = {
  el: null,
  _init: function() {
    if (!this.el) this.el = document.getElementById('global_tooltip');
  },
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
  showItem: function(e, itemId, instance = null, mode = 'normal') {
    this._init();
    const item = instance || (typeof GAME_DB !== 'undefined' ? GAME_DB.items.find(i => i.id === itemId) : null);
    if (!item) return;

    const rarityConf = (typeof RARITY_CONFIG !== 'undefined') ? RARITY_CONFIG[item.rarity] : {};
    const color = rarityConf.color || '#ccc';
    const typeName = (typeof TYPE_MAPPING !== 'undefined') ? TYPE_MAPPING[item.type] : item.type;

    let html = `<div class="tt_header" style="color:${color}">${item.name}</div>`;
    html += `<div class="tt_sub">${typeName || '未知'} · ${item.rarity}品</div>`;
    html += `<div class="tt_desc">${item.desc}</div>`;

    if (mode !== 'gallery') {
      if (item.type === 'book' && typeof player !== 'undefined') {
        const isLearned = (player.skills && player.skills[item.id]) ||
          (player.learnedRecipes && player.learnedRecipes.includes(item.id));
        html += `<div class="tt_sep"></div>`;
        html += `<div class="tt_row"><span>修习状态</span><span style="${isLearned ? 'color:#5cff5c' : 'color:#888'}">${isLearned ? '已研读' : '未研读'}</span></div>`;
      }
      if (item.price) {
        html += `<div class="tt_row"><span>参考价</span><span style="color:gold">${item.price} 灵石</span></div>`;
      }
    }
    if (item.effects) {
      let effectRows = "";
      for (let k in item.effects) {
        const val = item.effects[k];
        if (val === 0) continue;
        const attrName = (typeof ATTR_MAPPING !== 'undefined' && ATTR_MAPPING[k]) ? ATTR_MAPPING[k] : k;
        const valStr = val > 0 ? `+${val}` : `${val}`;
        const valColor = val > 0 ? '#5cff5c' : '#ff5555';
        effectRows += `<div class="tt_row"><span style="color:#aaa">${attrName}</span><span style="color:${valColor}">${valStr}</span></div>`;
      }
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
  showSkill: function(e, skillId) {
    this._init();
    const item = GAME_DB.items.find(i => i.id === skillId);
    const skillData = player.skills[skillId];
    let name = item ? item.name : skillId;
    let desc = item ? item.desc : "未知技能";
    let level = (skillData && typeof SKILL_CONFIG !== 'undefined') ? SKILL_CONFIG.levelNames[skillData.level] : "未入门";
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
window.showStatusTooltip = TooltipManager.showStatus.bind(TooltipManager);
window.showItemTooltip = TooltipManager.showItem.bind(TooltipManager);
window.showSkillTooltip = TooltipManager.showSkill.bind(TooltipManager);
window.hideTooltip = TooltipManager.hide.bind(TooltipManager);
window.moveTooltip = TooltipManager._move.bind(TooltipManager);
document.addEventListener('mousemove', (e) => {
  const tt = document.getElementById('global_tooltip');
  if (tt && !tt.classList.contains('hidden')) {
    TooltipManager._move(e);
  }
});


/* ================= 模块 4: 日志管理器 ================= */
const LogManager = {
  el: null,
  cache: [],

  init: function() {
    this.el = document.getElementById('game_log_content');
    if(this.el) {
      this.loadFromCache();
    }
  },
  loadFromCache: function() {
    const key = (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default';
    const savedLogs = localStorage.getItem(key);
    if (savedLogs) {
      try {
        this.cache = JSON.parse(savedLogs);
        this.el.innerHTML = '';
        this.cache.forEach(log => {
          this._renderLogItem(log.time, log.msg);
        });
        this.el.scrollTop = this.el.scrollHeight;
      } catch (e) {
        console.error("日志缓存读取失败", e);
        this.cache = [];
      }
    }
  },
  saveToCache: function() {
    const key = (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default';
    localStorage.setItem(key, JSON.stringify(this.cache));
  },
  _renderLogItem: function(timeStr, msgHtml) {
    if (!this.el) return;
    const timeP = document.createElement('p');
    timeP.className = 'log_time';
    timeP.innerText = timeStr;
    const msgP = document.createElement('p');
    msgP.innerHTML = msgHtml;
    this.el.appendChild(timeP);
    this.el.appendChild(msgP);
  },
  add: function(msg) {
    if (!this.el) this.init();
    if (!this.el) return;
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `[${h}:${m}:${s}]`;
    this._renderLogItem(timeStr, msg);
    this.cache.push({ time: timeStr, msg: msg });
    this.el.scrollTop = this.el.scrollHeight;
    const maxEntries = (typeof LOG_MAX_ENTRIES !== 'undefined') ? LOG_MAX_ENTRIES : 250;
    while (this.cache.length > maxEntries) {
      this.cache.shift();
    }
    const maxDomLines = maxEntries * 2;
    while (this.el.children.length > maxDomLines) {
      this.el.removeChild(this.el.firstChild);
      this.el.removeChild(this.el.firstChild);
    }
    this.saveToCache();
  },
  clear: function() {
    if (!this.el) this.init();
    if (this.el) this.el.innerHTML = '';
    this.cache = [];
    const key = (typeof LOG_SAVE_KEY !== 'undefined') ? LOG_SAVE_KEY : 'xiuxian_logs_default';
    localStorage.removeItem(key);
  }
};
window.LogManager = LogManager;
