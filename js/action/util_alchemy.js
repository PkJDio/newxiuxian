// js/utils/util_alchemy.js
// 炼丹逻辑核心 v2.0 - 适配新版技艺等级系统

console.log("【AlchemyUtil】逻辑核心加载 (新版技艺适配)");

const UtilAlchemy = {
    grid: new Array(9).fill(null),

    session: {
        pill: null,
        currentPotency: 0,
        currentStability: 100,
        resonanceLinks: [],
        catalystBonus: 0,
        successRate: 0,
        isRefining: false
    },

    neighbors: {
        0: [1, 3], 1: [0, 2, 4], 2: [1, 5],
        3: [0, 4, 6], 4: [1, 3, 5, 7], 5: [2, 4, 8],
        6: [3, 7], 7: [4, 6, 8], 8: [5, 7]
    },

    // 【修改点 1】统一获取等级接口 (0-10)
    getSkillLevel: function() {
        if (window.UtilsLifeSkills) {
            return UtilsLifeSkills.getLevel('alchemy');
        }
        return 0; // 默认值
    },

    initSession: function(pill) {
        this.session.pill = pill;
        this.session.isRefining = true;
        this.grid.fill(null);

        const mainHerbId = pill.formula.primary;
        const invIdx = window.player.inventory.findIndex(i => i.id === mainHerbId);
        if (invIdx !== -1) {
            this.grid[4] = window.player.inventory[invIdx];
        }
        this.recalculateArray();
    },

    placeHerb: function(index, herbId) {
        if (index === 4) return false;
        if (!herbId) {
            this.grid[index] = null;
        } else {
            const herb = window.player.inventory.find(i => i.id === herbId);
            if (herb) this.grid[index] = herb;
        }
        this.recalculateArray();
        return true;
    },

    recalculateArray: function() {
        let totalPotency = 0;
        let stabilityCost = 0;
        let stabilityAdd = 0;
        let totalCatalyst = 0;
        let resonanceLinks = [];

        // 获取当前等级 (0-10)
        const skillLevel = this.getSkillLevel();

        const targetReq = this.session.pill.formula.requirements;
        const mainKey = Object.keys(targetReq)[0];
        const targetVal = targetReq[mainKey];

        // 1. 基础遍历 (计算单体数值)
        for (let i = 0; i < 9; i++) {
            const item = this.grid[i];
            if (!item) continue;

            for (let k in item.properties) {
                let v = item.properties[k];
                if (k === 'stabilizer') {
                    stabilityAdd += v;
                } else if (k === 'catalyst') {
                    totalCatalyst += v;
                } else if (k === mainKey) {
                    totalPotency += v;
                    stabilityCost += Math.floor(v * 0.3);
                }
            }
        }

        // 药引增幅
        let catalystBonusRate = Math.min(0.5, totalCatalyst / 1000);
        let catalystBonusVal = Math.floor(totalPotency * catalystBonusRate);
        totalPotency += catalystBonusVal;

        // 2. 阵法连携
        let processed = new Set();
        for (let i = 0; i < 9; i++) {
            if (!this.grid[i]) continue;
            let itemA = this.grid[i];

            for (let nIdx of this.neighbors[i]) {
                if (!this.grid[nIdx]) continue;
                let pairId = i < nIdx ? `${i}-${nIdx}` : `${nIdx}-${i}`;
                if (processed.has(pairId)) continue;
                processed.add(pairId);

                let itemB = this.grid[nIdx];

                // A. 主属性共鸣
                if (itemA.properties[mainKey] && itemB.properties[mainKey]) {
                    let bonus = Math.floor((itemA.properties[mainKey] + itemB.properties[mainKey]) * 0.2);
                    totalPotency += bonus;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'resonance' });
                }

                // B. 稳定剂-烈性药 镇压
                if ((itemA.properties.stabilizer && !itemB.properties.stabilizer) ||
                    (itemB.properties.stabilizer && !itemA.properties.stabilizer)) {
                    stabilityCost -= 5;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'stabilize' });
                }

                // C. 稳定剂-稳定剂 强固
                if (itemA.properties.stabilizer && itemB.properties.stabilizer) {
                    let stabBonus = Math.floor((itemA.properties.stabilizer + itemB.properties.stabilizer) * 0.1);
                    stabilityAdd += stabBonus;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'stabilize' });
                }
            }
        }

        // 【修改点 2】技能减免公式化：每级减少 2% 损耗 (Lv10 = 20%)
        // 旧逻辑：if (skill >= 400) stabilityCost *= 0.8
        const costReduction = skillLevel * 0.02; // 0.0 ~ 0.2
        stabilityCost = Math.floor(stabilityCost * (1 - costReduction));

        this.session.currentPotency = totalPotency;
        this.session.currentStability = Math.max(0, 100 + stabilityAdd - stabilityCost);
        this.session.resonanceLinks = resonanceLinks;
        this.session.catalystBonus = catalystBonusVal;

        // 3. 计算成功率
        let rate = 0;
        if (this.session.currentStability <= 0) {
            rate = 0;
        } else if (totalPotency < targetVal) {
            rate = 0;
        } else {
            rate = Math.min(100, this.session.currentStability);
        }
        this.session.successRate = rate;
    },

    finalizeRefine: function() {
        const s = this.session;
        if (!s.pill || !this.grid[4]) return { success: false, msg: "阵眼空虚" };

        const targetReq = s.pill.formula.requirements;
        const mainKey = Object.keys(targetReq)[0];
        const reqVal = targetReq[mainKey];
        const stabReq = targetReq.stabilizer || 0;

        if (s.currentStability <= 0) {
            this.consumeMaterials();
            return { success: false, msg: "灵压归零，丹炉炸裂！", exploded: true };
        }

        if (s.currentPotency < reqVal) {
            this.consumeMaterials();
            return { success: false, msg: `药力不足！当前${s.currentPotency}，需求${reqVal}` };
        }

        let multiplier = 1;
        if (s.currentStability >= stabReq) {
            multiplier = Math.floor(s.currentPotency / reqVal);
            if (multiplier < 1) multiplier = 1;
        }

        const currentSuccessRate = s.successRate;
        const roll = Math.random() * 100;

        if (roll < currentSuccessRate) {
            this.consumeMaterials();

            if (window.UtilsItem) window.UtilsItem.addItem(s.pill.id, multiplier);

            if(!window.player.alchemyHistory) window.player.alchemyHistory = {};
            window.player.alchemyHistory[s.pill.id] = (window.player.alchemyHistory[s.pill.id] || 0) + multiplier;

            // 【修改点 3】调用新版接口增加经验 (产出几颗加几点)
            if (window.UtilsLifeSkills) {
                UtilsLifeSkills.addExp('alchemy', multiplier);
            }

            return {
                success: true,
                pillName: s.pill.name,
                count: multiplier,
                finalStability: s.currentStability
            };
        } else {
            this.consumeMaterials();
            // 失败也可以加一点安慰经验
            if (window.UtilsLifeSkills) UtilsLifeSkills.addExp('alchemy', 1);

            return { success: false, msg: `凝丹失败 (成功率 ${Math.floor(currentSuccessRate)}%)，火候未到...` };
        }
    },

    consumeMaterials: function() {
        for (let i = 0; i < 9; i++) {
            const item = this.grid[i];
            if (item) {
                const idx = window.player.inventory.findIndex(x => x.id === item.id);
                if (idx !== -1) {
                    window.player.inventory[idx].count--;
                    if (window.player.inventory[idx].count <= 0) {
                        window.player.inventory.splice(idx, 1);
                        this.grid[i] = null;
                    }
                } else {
                    this.grid[i] = null;
                }
            }
        }
        this.recalculateArray();
    }
};

window.UtilAlchemy = UtilAlchemy;