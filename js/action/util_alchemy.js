// js/utils/util_alchemy.js

console.log("【AlchemyUtil】逻辑核心加载 (稳定剂共鸣修复版)");

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

    getSkillLevel: function() {
        if (!window.player || !window.player.lifeSkills) return 0;
        let val = window.player.lifeSkills.alchemy;
        return (typeof val === 'object' && val !== null) ? (val.level || 0) : (Number(val) || 0);
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

        const skill = this.getSkillLevel();
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
                    stabilityAdd += v; // 只要放入，基础稳定性就生效
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

        // 2. 阵法连携 (计算相邻关系)
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

                // === A. 主属性共鸣 (同属性相邻 +20%) ===
                if (itemA.properties[mainKey] && itemB.properties[mainKey]) {
                    let bonus = Math.floor((itemA.properties[mainKey] + itemB.properties[mainKey]) * 0.2);
                    totalPotency += bonus;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'resonance' });
                }

                // === B. 稳定剂-烈性药 镇压 (减少损耗) ===
                if (itemA.properties.stabilizer && !itemB.properties.stabilizer) {
                    stabilityCost -= 5;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'stabilize' });
                }
                if (itemB.properties.stabilizer && !itemA.properties.stabilizer) {
                    stabilityCost -= 5;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'stabilize' });
                }

                // === C. 稳定剂-稳定剂 强固 (【新增逻辑】) ===
                // 如果两个稳定剂相邻，它们会连接，并额外提供少量稳定性 (比如两者之和的10%)
                if (itemA.properties.stabilizer && itemB.properties.stabilizer) {
                    let stabBonus = Math.floor((itemA.properties.stabilizer + itemB.properties.stabilizer) * 0.1);
                    stabilityAdd += stabBonus;
                    resonanceLinks.push({ from: i, to: nIdx, type: 'stabilize' }); // 同样画绿色线
                }
            }
        }

        if (skill >= 400) stabilityCost = Math.floor(stabilityCost * 0.8);

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

        // 暂存成功率
        const currentSuccessRate = s.successRate;

        const roll = Math.random() * 100;

        if (roll < currentSuccessRate) {
            this.consumeMaterials();

            if (window.UtilsItem) window.UtilsItem.addItem(s.pill.id, multiplier);

            if(!window.player.alchemyHistory) window.player.alchemyHistory = {};
            window.player.alchemyHistory[s.pill.id] = (window.player.alchemyHistory[s.pill.id] || 0) + multiplier;

            window.player.lifeSkills.alchemy = (Number(window.player.lifeSkills.alchemy)||0) + multiplier;

            return {
                success: true,
                pillName: s.pill.name,
                count: multiplier,
                finalStability: s.currentStability
            };
        } else {
            this.consumeMaterials();
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
                        this.grid[i] = null; // 用完才清空
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