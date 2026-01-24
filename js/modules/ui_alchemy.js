// js/modules/ui_alchemy.js

console.log("【AlchemyUI】加载：材料保留 & 连炼优化版");

const UIAlchemy = {
    selectedHerbId: null,
    recipeFilter: 'all',
    bagFilter: 'all',

    open: function() {
        if (!window.UtilAlchemy) return;
        this._injectStyles();
        this._renderBaseLayout();

        if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
            window.UtilsModal.showInteractiveModal("🔮 九宫灵阵", this.lastContentHtml, null, "modal_alchemy_grid", 95, 95);
        }

        setTimeout(() => {
            this.updateRecipeList();
            if(window.UtilAlchemy.session.pill) {
                this._renderGrid(window.UtilAlchemy.session.pill);
            }
        }, 50);
    },

        _renderBaseLayout: function() {
            // 【修改点】使用新版数据获取等级和境界名
            let skillLevel = 0;
            let realmName = "未入门";
            let expInfo = "";

            if (window.UtilsLifeSkills) {
                const skillData = UtilsLifeSkills.getSkillData('alchemy');
                skillLevel = skillData.level;

                // 获取境界名称 (0-3对应四个境界)
                // 假设 UtilsLifeSkills.REALM_NAMES = ["初窥门径", "略有小成", "融会贯通", "登峰造极"]
                // 简单映射逻辑：
                const realmNames = ["初窥门径", "略有小成", "融会贯通", "登峰造极", "返璞归真"];
                const idx = Math.min(Math.floor(skillLevel / 3), realmNames.length - 1);
                realmName = realmNames[idx];

                const maxExp = UtilsLifeSkills.getNextLevelExp(skillLevel);
                expInfo = skillLevel >= 10 ? "已臻化境" : `${skillData.exp}/${maxExp}`;
            }

            // 构建显示字符串，例如: "Lv.3 略有小成"
            const displayTag = `Lv.${skillLevel} ${realmName}`;

            this.lastContentHtml = `
            <div class="alchemy_container">
                <div class="alchemy_side">
                    <div class="side_header_row">
                        <span>📜 丹方</span>
                        <select class="ink_select" onchange="UIAlchemy.onRecipeFilterChange(this.value)">
                            <option value="all">全部</option>
                            <option value="reply">恢复类</option>
                            <option value="battle">战斗类</option>
                            <option value="growth">修行类</option>
                        </select>
                    </div>
                    <div id="alchemy-recipe-list" class="recipe_list_box"></div>
                </div>

                <div class="alchemy_center">
                    <div class="forge_header">
                        <div class="境界_tag">${displayTag} (熟练:${expInfo})</div>
                    </div>
                    
                    <div id="forge-stage" class="forge_stage">
                        <div class="empty_hint">
                            <div class="ink_smoke">🏺</div>
                            <p>请从左侧选择丹方以开启阵法</p>
                        </div>
                    </div>

                    <div class="rules_container">
                        <div class="static_rules rules_left">
                            <h4>❓ 炼丹法则</h4>
                            <ul>
                                <li><b>阵眼定性：</b>中央主药决定成丹的核心属性。</li>
                                <li><b>同属共鸣 <span class="legend_line l_gold"></span>：</b>相邻同属性药材，药效 <b>+20%</b>。</li>
                                <li><b>灵压镇压 <span class="legend_line l_green"></span>：</b>稳定剂与任意药材相邻，减少损耗。</li>
                                <li><b>多倍法则：</b>药力溢出倍数 = 产出量 (需灵压达标)。</li>
                            </ul>
                        </div>
                        <div class="static_rules rules_right">
                            <h4>🌿 药性与图鉴</h4>
                            <ul>
                                <li><span class="dot c_attr">●</span> <b>属性药 (蓝)</b>：提供核心数值 (如:攻击/防御)。</li>
                                <li><span class="dot c_stab">●</span> <b>稳定剂 (绿)</b>：增加灵压上限，镇压相邻躁动。</li>
                                <li><span class="dot c_cat">●</span> <b>药引子 (橙)</b>：全局增幅，每10点总效+1%。</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="alchemy_bag">
                    <div class="side_header_row">
                        <span>🌿 药材</span>
                        <select class="ink_select" onchange="UIAlchemy.onBagFilterChange(this.value)">
                            <option value="all">全部显示</option>
                            <option value="stabilizer">【稳定】(绿)</option>
                            <option value="catalyst">【药引】(橙)</option>
                            <option value="heal">愈合 (HP)</option>
                            <option value="qi">灵气 (MP)</option>
                            <option value="atk">攻击 (Atk)</option>
                            <option value="def">防御 (Def)</option>
                            <option value="speed">极速 (Spd)</option>
                            <option value="jing">精元 (Body)</option>
                            <option value="shen">神识 (Mind)</option>
                            <option value="qiMax">气海 (MaxMP)</option>
                        </select>
                    </div>
                    <div id="alchemy-bag-list" class="bag_list_box"></div>
                </div>
            </div>
        `;
        },

    onRecipeFilterChange: function(val) {
        this.recipeFilter = val;
        this.updateRecipeList();
    },

    onBagFilterChange: function(val) {
        this.bagFilter = val;
        this.updateBagList();
    },

    updateRecipeList: function() {
        const listEl = document.getElementById('alchemy-recipe-list');
        if (!listEl || !window.pills) return;

        // 获取所有背包材料用于ID查找和主材名称匹配
        const allMaterials = window.player.inventory.filter(i => i.type === "material");
        const invIds = new Set(allMaterials.map(i => i.id));
        const history = window.player.alchemyHistory || {};

        let available = window.pills.filter(p => {
            return p.canDo && (invIds.has(p.formula.primary) || history[p.id] !== undefined);
        });

        if (this.recipeFilter !== 'all') {
            available = available.filter(p => {
                if (this.recipeFilter === 'reply') return p.subType === 'reply';
                if (this.recipeFilter === 'battle') {
                    if (p.subType !== 'buff') return false;
                    const attr = p.effects.buff ? p.effects.buff.attr : '';
                    return ['atk', 'def', 'speed'].includes(attr);
                }
                if (this.recipeFilter === 'growth') {
                    if (p.subType !== 'buff') return false;
                    const attr = p.effects.buff ? p.effects.buff.attr : '';
                    return ['jing', 'qi', 'shen', 'studyEff', 'qiMax'].includes(attr);
                }
                return true;
            });
        }

        // 排序逻辑保持不变...
        available.sort((a, b) => {
            const getSortData = (p) => {
                if (p.effects.hp) return { key: '1_hp', val: p.effects.hp };
                if (p.effects.mp) return { key: '2_mp', val: p.effects.mp };
                if (p.effects.buff) return { key: '3_' + p.effects.buff.attr, val: p.effects.buff.val };
                return { key: '9_other', val: 0 };
            };
            const dataA = getSortData(a);
            const dataB = getSortData(b);
            if (dataA.key !== dataB.key) return dataA.key.localeCompare(dataB.key);
            return dataB.val - dataA.val;
        });

        listEl.innerHTML = available.map(p => {
            let effectText = [];
            if(p.effects.hp) effectText.push(`生命+${p.effects.hp}`);
            if(p.effects.mp) effectText.push(`法力+${p.effects.mp}`);
            if(p.effects.buff) effectText.push(`${this._getPropName(p.effects.buff.attr)}+${p.effects.buff.val}`);

            let reqText = [];
            for(let key in p.formula.requirements) {
                reqText.push(`${this._getPropName(key)}≥${p.formula.requirements[key]}`);
            }

            // 【新增】查找主药名称
            // 注意：因为 pill.formula.primary 存的是 ID，我们需要去物品库或者背包找名字
            // 这里假设背包里有这个 ID 就能找到名字，如果没有，尝试从全局 pills 数据或者预定义的 herbs 数据找
            // 为了简单，我们先从背包找。如果背包没有（例如历史做过但现在没材料），可能显示 ID
            // *最佳实践*：你应该有一个全局的 ItemDatabase。这里假设 player.inventory 包含了所有可能的物品引用，或者你有一个 window.herbs 数组。
            // 如果没有全局 herbs，我们只能尝试从背包找。
            let mainHerbName = p.formula.primary;


                const h = herbs.find(x => x.id === p.formula.primary);
                if (h) mainHerbName = h.name;


            return `
                <div class="recipe_item rarity_${p.rarity}" onclick="UIAlchemy.onSelectRecipe('${p.id}')">
                    <div class="r_header">
                        <span class="r_name">${p.name}</span>
                        <span class="r_count">炼:${history[p.id] || 0}</span>
                    </div>
                    <div class="r_detail_row" style="color:#795548; font-weight:bold;">
                        <span class="label">【主】</span> ${mainHerbName}
                    </div>
                    <div class="r_detail_row"><span class="label">【效】</span> ${effectText.join(' ')}</div>
                    <div class="r_detail_row req_row"><span class="label">【需】</span> ${reqText.join(' ')}</div>
                </div>
            `;
        }).join('') || '<div class="ink_tip">无符合条件的丹方</div>';
    },

    updateBagList: function() {
        const listEl = document.getElementById('alchemy-bag-list');
        if (!listEl) return;

        let herbs = window.player.inventory.filter(i => i.subType === 'herbs' && i.count > 0);

        if (this.bagFilter !== 'all') {
            herbs = herbs.filter(h => {
                return h.properties && h.properties[this.bagFilter] !== undefined;
            });
        }

        // 排序：先按字段，再按数值降序
        herbs.sort((a, b) => {
            const getData = (item) => {
                let k = 'z';
                let v = 0;
                if (this.bagFilter !== 'all' && item.properties[this.bagFilter] !== undefined) {
                    k = this.bagFilter;
                    v = item.properties[this.bagFilter];
                } else {
                    const keys = Object.keys(item.properties);
                    if (keys.length > 0) { k = keys[0]; v = item.properties[k]; }
                }
                return { k, v };
            };
            const dataA = getData(a);
            const dataB = getData(b);
            if (dataA.k !== dataB.k) return dataA.k.localeCompare(dataB.k);
            return dataB.v - dataA.v;
        });

        listEl.innerHTML = herbs.map(h => {
            const isSelected = this.selectedHerbId === h.id ? 'selected' : '';
            let propsHtml = '';
            let count = 0;
            let keys = Object.keys(h.properties);
            if (this.bagFilter !== 'all' && keys.includes(this.bagFilter)) {
                keys = [this.bagFilter, ...keys.filter(k => k !== this.bagFilter)];
            }

            for(let key of keys) {
                if(count++ >= 2) break;
                let val = h.properties[key];
                let colorClass = key === 'stabilizer' ? 'c_stab' : (key === 'catalyst' ? 'c_cat' : 'c_attr');
                propsHtml += `<span class="prop_tag ${colorClass}">${this._getPropName(key)}:${val}</span> `;
            }

            return `
                <div class="bag_item ${isSelected}" onclick="UIAlchemy.onSelectBagItem('${h.id}')">
                    <div class="b_row_top">
                        <span class="b_name">${h.name}</span>
                        <span class="b_count">x${h.count}</span>
                    </div>
                    <div class="b_row_bot">${propsHtml}</div>
                </div>
            `;
        }).join('') || '<div class="ink_tip">无符合条件的药材</div>';
    },

    onSelectRecipe: function(pillId) {
        const pill = window.pills.find(p => p.id === pillId);
        if (!pill) return;
        window.UtilAlchemy.initSession(pill);
        this.selectedHerbId = null;
        this._renderGrid(pill);
        this.updateBagList();
    },

    onSelectBagItem: function(id) {
        this.selectedHerbId = (this.selectedHerbId === id) ? null : id;
        this.updateBagList();
    },

    onGridSlotClick: function(index) {
        if (index === 4) {
            if(window.showToast) window.showToast("🚫 阵眼主药不可移动");
            return;
        }
        if (this.selectedHerbId) {
            window.UtilAlchemy.placeHerb(index, this.selectedHerbId);
        } else if (window.UtilAlchemy.grid[index]) {
            window.UtilAlchemy.placeHerb(index, null);
        }
        this._renderGrid(window.UtilAlchemy.session.pill);
        this.updateBagList();
    },

    _renderGrid: function(pill) {
        const stage = document.getElementById('forge-stage');
        const s = window.UtilAlchemy.session;
        const targetReq = pill.formula.requirements;
        const mainKey = Object.keys(targetReq)[0];
        const targetVal = targetReq[mainKey];
        const stabReq = targetReq.stabilizer || 0;

        let gridHtml = '';
        for (let i = 0; i < 9; i++) {
            const item = window.UtilAlchemy.grid[i];
            let content = '';
            let slotClass = i === 4 ? 'slot_core' : 'slot_normal';
            if (item) {
                let propsHtml = '';
                let count = 0;
                for(let k in item.properties) {
                    if(count++ > 1) break;
                    let pVal = item.properties[k];
                    let kName = this._getPropName(k);
                    let color = k === 'stabilizer' ? '#2e7d32' : (k === 'catalyst' ? '#ef6c00' : '#1565c0');
                    propsHtml += `<div style="color:${color}">${kName} ${pVal}</div>`;
                }
                content = `<div class="herb_token"><div class="t_name">${item.name}</div><div class="t_props">${propsHtml}</div></div>`;
            } else {
                content = i === 4 ? '<span class="core_txt">阵眼</span>' : '<span class="plus">+</span>';
            }
            gridHtml += `<div class="grid_slot ${slotClass}" onclick="UIAlchemy.onGridSlotClick(${i})">${content}</div>`;
        }

        let svgLines = this._generateLinkLines();
        const potPct = Math.min(100, (s.currentPotency / targetVal) * 100);
        let stabMaxDisplay = 200;
        if (s.currentPotency > targetVal && s.currentStability < stabReq) {
            stabMaxDisplay = `${stabReq} (需)`;
        }
        const stabPct = Math.min(100, (s.currentStability / 200) * 100);
        let catalystText = s.catalystBonus > 0 ? `<span class="bonus_text">(引+${s.catalystBonus})</span>` : '';

        let multi = Math.floor(s.currentPotency / targetVal);
        if (multi < 1) multi = 1;
        let multiText = '';
        if (s.currentPotency > targetVal) {
            if (s.currentStability >= stabReq) {
                multiText = `<span class="multi_tag valid">x${multi}倍</span>`;
            } else {
                multiText = `<span class="multi_tag invalid">灵压不足(需${stabReq})</span>`;
            }
        }

        let btnText = "🔥 凝 丹 🔥";
        let btnClass = "";
        let btnDisabled = false;
        if (s.successRate >= 100) {
            btnText = `🔥 完美 (100%)`;
            btnClass = "btn_perfect";
        } else if (s.successRate > 0) {
            btnText = `🔥 凝丹 (${Math.floor(s.successRate)}%)`;
        } else {
            btnText = "❌ 无法凝丹";
            btnClass = "btn_disabled";
            btnDisabled = true;
        }

        stage.innerHTML = `
            <div class="matrix_panel">
                <div class="matrix_header">
                    <span class="target_label">目标: <b>${pill.name}</b> (需${targetVal}) ${multiText}</span>
                </div>

                <div class="grid_wrapper">
                    <div class="grid_container">
                        ${gridHtml}
                        <svg class="grid_overlay" viewBox="0 0 100 100" preserveAspectRatio="none">${svgLines}</svg>
                    </div>
                </div>
                
                <div class="dashboard_container" id="dash_board">
                    <div class="dash_row_group">
                        <div class="dash_block">
                            <div class="dash_label">
                                <span>🧪 药力${catalystText}</span>
                                <span class="val_text">${s.currentPotency} / ${targetVal}</span>
                            </div>
                            <div class="bar_track"><div class="bar_fill p_fill" style="width:${potPct}%"></div></div>
                        </div>
                        <div class="dash_block">
                            <div class="dash_label">
                                <span>⚖️ 灵压</span>
                                <span class="val_text" id="stab_val_txt">${s.currentStability} / ${stabMaxDisplay}</span>
                            </div>
                            <div class="bar_track"><div class="bar_fill s_fill" id="stab_fill_anim" style="width:${stabPct}%"></div></div>
                        </div>
                    </div>
                    
                    <button class="fire_btn ${btnClass}" ${btnDisabled ? 'disabled' : ''} onclick="UIAlchemy.onRefine()">${btnText}</button>
                </div>
            </div>
        `;
    },

    _generateLinkLines: function() {
        const links = window.UtilAlchemy.session.resonanceLinks || [];
        if (links.length === 0) return '';
        const getPct = (idx) => ({ x: ((idx%3)*33.33 + 16.66).toFixed(2), y: (Math.floor(idx/3)*33.33 + 16.66).toFixed(2) });

        return links.map(link => {
            const p1 = getPct(link.from), p2 = getPct(link.to);
            const color = link.type === 'stabilize' ? '#4caf50' : '#ffb300';
            const width = link.type === 'stabilize' ? '3' : '5';
            return `<line x1="${p1.x}%" y1="${p1.y}%" x2="${p2.x}%" y2="${p2.y}%" stroke="${color}" stroke-width="${width}" stroke-opacity="0.6" stroke-linecap="round" />`;
        }).join('');
    },

    onRefine: function() {
        const stabBar = document.getElementById('stab_fill_anim');
        const stabTxt = document.getElementById('stab_val_txt');

        if (stabBar) {
            stabBar.style.transition = "width 0.5s ease-in";
            stabBar.style.width = "0%";
            stabTxt.innerText = "消耗中...";
        }

        setTimeout(() => {
            const res = window.UtilAlchemy.finalizeRefine();

            if (res.success) {
                // 成功逻辑保持不变
                if(window.showToast) window.showToast(`✨ 丹成！获得 [${res.pillName}] x${res.count} (熟练度+${res.count})`);

                this.updateRecipeList();
                this.updateBagList();
                window.UtilAlchemy.recalculateArray();
                this._renderGrid(window.UtilAlchemy.session.pill);

                if (window.saveGame) window.saveGame();
            } else {
                // === 失败弹窗美化 ===
                // 1. 生成不带按钮的纯净 HTML
                const failHtml = `
                    <div class="alchemy_result_box fail">
                        <div class="result_icon">💥</div>
                        <div class="result_title">炼 制 失 败</div>
                        <div class="result_msg">${res.msg}</div>
                    </div>
                `;

                // 2. 调用弹窗：调整尺寸为 45宽, 35高，更加精致
                if (window.UtilsModal && window.UtilsModal.showInteractiveModal) {
                    window.UtilsModal.showInteractiveModal("炼制结果", failHtml, null, "modal_alchemy_result", 45, 35);
                } else {
                    alert(`炼制失败！\n原因：${res.msg}`);
                }

                // 失败后刷新一下界面数据（例如扣除材料），但不重置配方
                window.UtilAlchemy.recalculateArray();
                this._renderGrid(window.UtilAlchemy.session.pill);
                this.updateBagList();
            }
        }, 600);
    },

    _getPropName: function(key) {
        const map = {
            heal:'愈合', qi:'灵气', atk:'攻击', def:'防御', speed:'极速', jing:'精元', shen:'神识',
            stabilizer:'稳定', catalyst:'药引', qiMax:'气海'
        };
        return map[key] || key;
    },

    _injectStyles: function() {
        if (document.getElementById('style-alchemy-grid')) return;
        const css = `
            .modal_alchemy_grid .modal_body { padding: 0 !important; background: #fcf9f2; display: flex; flex-direction: column; overflow: hidden !important; }
            .alchemy_container { display: flex; width: 100%; height: 100%; font-family: "KaiTi", "楷体", serif; color: #3e2723; font-size: 18px; overflow: hidden; }
            .alchemy_container * { box-sizing: border-box; }
            
            .alchemy_side { flex: 0 0 300px; background: #fdfbf7; border-right: 3px solid #8d6e63; display: flex; flex-direction: column; height: 100%; }
            .side_header_row { background: #5d4037; color: #fff; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3e2723; flex-shrink: 0; }
            .side_header_row span { font-size: 20px; font-weight: bold; }
            
            .ink_select { background: #fdfbf7; border: 1px solid #8d6e63; border-radius: 4px; padding: 4px; font-family: "KaiTi"; font-size: 16px; color: #3e2723; cursor: pointer; outline: none; }

            .recipe_list_box { flex: 1; overflow-y: auto; padding: 12px; overscroll-behavior: contain; }
            .recipe_list_box::-webkit-scrollbar { width: 6px; }
            .recipe_list_box::-webkit-scrollbar-thumb { background: rgba(141, 110, 99, 0.5); border-radius: 3px; }

            .recipe_item { padding: 15px; border-bottom: 2px dashed #ccc; cursor: pointer; background: #fff; margin-bottom: 8px; border-radius: 6px; transition: 0.2s; }
            .recipe_item:hover { background: #efebe9; border-left: 6px solid #8d6e63; }
            .r_header { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; margin-bottom: 6px; }
            .r_count { font-size: 16px; color: #888; }
            .r_detail_row { font-size: 16px; color: #5d4037; margin-bottom: 4px; line-height: 1.4; }
            .req_row { color: #d84315; font-weight: bold; }

            .alchemy_center { flex: 1; display: flex; flex-direction: column; align-items: center; background: url('https://www.transparenttextures.com/patterns/rice-paper-2.png'); position: relative; height: 100%; overflow: hidden; }
            .forge_header { width: 100%; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
            .境界_tag { background: #3e2723; color: #fff; padding: 8px 25px; border-radius: 20px; font-size: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
            
            .matrix_panel { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 100%; width: 100%; padding-top: 10px; overflow: hidden; }
            .matrix_header { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-bottom: 10px; }
            .target_label { font-size: 26px; color: #3e2723; background: rgba(255,255,255,0.9); padding: 8px 26px; border-radius: 10px; border: 2px solid #8d6e63; }
            
            .multi_tag { font-size: 20px; color: #fff; padding: 4px 10px; border-radius: 4px; margin-left: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); white-space: nowrap; }
            .multi_tag.valid { background: #d84315; animation: pulse 1s infinite; }
            .multi_tag.invalid { background: #757575; font-size: 16px; }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

            .grid_wrapper { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; position: relative; min-height: 0; }
            .grid_container { width: 50vh; height: 50vh; max-width: 550px; max-height: 550px; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 10px; background: #8d6e63; padding: 10px; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); position: relative; z-index: 5; }
            .grid_overlay { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events: none; z-index: 10; }
            .grid_slot { background: #fffaf0; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 6px; font-size: 18px; transition: 0.2s; position: relative; }
            .grid_slot:hover { filter: brightness(0.95); }
            .slot_core { background: #efebe9; border: 3px solid #5d4037; }
            .core_txt { font-size: 28px; font-weight: bold; color: #bcaaa4; }
            .plus { font-size: 50px; color: #e0e0e0; }
            /* 【修改处】草药名称样式 */
            .herb_token { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; }
            .t_name { 
                font-size: 20px; /* 字体改小 */
                font-weight: bold; 
                color: #3e2723; 
                margin-bottom: 2px; 
                text-align: center;
                line-height: 1.1;
                word-break: break-all; /* 允许换行 */
                white-space: normal; /* 允许换行 */
                padding: 0 2px;
            }
            .t_props { font-size: 14px; line-height: 1.2; text-align: center; }

            /* 规则区域：垂直居中 */
            .rules_container { 
                width: 100%; 
                display: flex; 
                justify-content: space-between; 
                padding: 0 20px; 
                position: absolute; 
                top: 50%; 
                transform: translateY(-50%); 
                pointer-events: none; 
            }
            .static_rules { 
                width: 26%; 
                background: rgba(255,255,255,0.85); 
                border: 2px solid #8d6e63; 
                border-radius: 8px; 
                padding: 12px; 
                color: #5d4037; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
                pointer-events: auto; 
            }
            .static_rules h4 { margin: 0 0 8px 0; border-bottom: 2px dashed #8d6e63; padding-bottom: 5px; font-size: 26px; font-weight: bold; text-align: center; }
            .static_rules ul { padding-left: 20px; margin: 0; }
            .static_rules li { margin-bottom: 4px; font-size: 20px; line-height: 1.4; }
            
            /* 图例线段样式 */
            .legend_line { display: inline-block; width: 30px; height: 3px; vertical-align: middle; margin: 0 5px; }
            .l_gold { background: #ffb300; }
            .l_green { border-bottom: 2px dashed #4caf50; height: 0; }
            .dot { font-size: 16px; margin-right: 5px; }

            .dashboard_container { 
                width: 95%; 
                background: rgba(255,255,255,0.95); 
                padding: 15px 25px; 
                border-radius: 12px; 
                border: 2px solid #bcaaa4; 
                margin-bottom: 20px; 
                display: flex; 
                flex-direction: column; 
                gap: 15px; 
                z-index: 5; 
                flex-shrink: 0; 
            }
            .dash_row_group { display: flex; gap: 20px; width: 100%; }
            .dash_block { flex: 1; min-width: 0; }
            .dash_label { display: flex; justify-content: space-between; align-items: baseline; font-size: 20px; font-weight: bold; margin-bottom: 8px; white-space: nowrap; }
            .val_text { color: #d84315; font-size: 22px; font-family: monospace; margin-left: 10px; }
            .bonus_text { color: #ef6c00; font-size: 14px; font-weight: normal; margin-left: 5px; }
            .bar_track { height: 24px; background: #ddd; border-radius: 12px; overflow: hidden; border: 1px solid #999; }
            .p_fill { background: linear-gradient(90deg, #8d6e63, #5d4037); height: 100%; }
            .s_fill { background: linear-gradient(90deg, #a5d6a7, #2e7d32); height: 100%; }

            .fire_btn { width: 100%; padding: 12px; background: linear-gradient(to bottom, #bf360c, #870000); color: #fff; border: none; font-size: 26px; font-family: "KaiTi"; border-radius: 30px; cursor: pointer; box-shadow: 0 4px 10px rgba(191, 54, 12, 0.5); }
            .fire_btn:hover { transform: scale(1.02); }
            .btn_perfect { background: linear-gradient(to bottom, #4caf50, #2e7d32); box-shadow: 0 4px 10px rgba(46, 125, 50, 0.5); }
            .btn_disabled { background: #9e9e9e; cursor: not-allowed; box-shadow: none; opacity: 0.8; }

            .alchemy_bag { flex: 0 0 300px; display: flex; flex-direction: column; border-left: 2px solid #8d6e63; background: #fff8e1; z-index: 2; height: 100%; }
            .bag_list_box { flex: 1; overflow-y: auto; padding: 12px; overscroll-behavior: contain; }
            .bag_list_box::-webkit-scrollbar { width: 6px; }
            .bag_list_box::-webkit-scrollbar-thumb { background: rgba(141, 110, 99, 0.5); border-radius: 3px; }

            .bag_item { padding: 12px; border: 1px solid #ccc; margin-bottom: 8px; cursor: pointer; background: #fff; border-radius: 6px; transition: 0.1s; }
            .bag_item.selected { background: #d7ccc8; border-color: #5d4037; border-left: 6px solid #5d4037; }
            .b_row_top { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-bottom: 6px; }
            .b_row_bot { display: flex; flex-wrap: wrap; gap: 6px; }
            .prop_tag { font-size: 14px; padding: 2px 6px; border-radius: 4px; background: #f0f0f0; }
            .c_stab { color: #2e7d32; background: #e8f5e9; }
            .c_cat { color: #ef6c00; background: #fff3e0; }
            .c_attr { color: #1565c0; background: #e3f2fd; }

            /* 失败弹窗专用样式 */
            .modal_alchemy_result .modal_body { 
                padding: 0 !important; 
                background-color: #fdfbf7;
                background-image: radial-gradient(#d7ccc8 1px, transparent 1px);
                background-size: 15px 15px;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                overflow: hidden;
            }
            .alchemy_result_box { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; box-sizing: border-box; }
            .result_icon { font-size: 60px; margin-bottom: 15px; animation: explode 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-shadow: 0 5px 10px rgba(0,0,0,0.2); }
            @keyframes explode { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
            .result_title { font-size: 28px; font-weight: bold; color: #d32f2f; margin-bottom: 15px; border-bottom: 2px solid #d32f2f; padding-bottom: 5px; letter-spacing: 2px; font-family: "KaiTi"; }
            .result_msg { font-size: 18px; color: #5d4037; line-height: 1.6; font-weight: bold; max-width: 90%; }
        `;
        const style = document.createElement('style');
        style.id = 'style-alchemy-grid';
        style.textContent = css;
        document.head.appendChild(style);
    }
};

window.UIAlchemy = UIAlchemy;