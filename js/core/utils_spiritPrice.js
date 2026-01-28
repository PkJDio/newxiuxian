// js/core/utils_spiritPrice.js
// 灵石核心工具类 v2.2 (修复扣费不生效BUG)

const UtilsSpiritPrice = {
    RATES: { low: 10, mid: 100, high: 1000, top: 10000 },
    IDS: { low: "spirit_stone_1", mid: "spirit_stone_2", high: "spirit_stone_3", top: "spirit_stone_4" },

    /**
     * 格式化价格 (用于商品标价)
     */
    format: function(price) {
        if (!price || price <= 0) return '<span style="color:#999">免费</span>';
        let val = parseInt(price);
        const top = Math.floor(val / 10000); val %= 10000;
        const high = Math.floor(val / 1000); val %= 1000;
        const mid = Math.floor(val / 100);   val %= 100;
        const low = Math.floor(val / 10);    val %= 10;
        const energy = val;

        let html = '';
        const numStyle = 'color:#009688; font-weight:bold; margin-right:1px;';
        const txtStyle = 'color:#555; margin-right:4px; font-size:12px;';

        if (top > 0)  html += `<span style="${numStyle}">${top}</span><span style="${txtStyle}">极</span>`;
        if (high > 0) html += `<span style="${numStyle}">${high}</span><span style="${txtStyle}">上</span>`;
        if (mid > 0)  html += `<span style="${numStyle}">${mid}</span><span style="${txtStyle}">中</span>`;
        if (low > 0)  html += `<span style="${numStyle}">${low}</span><span style="${txtStyle}">下</span>`;
        if (html === '' && energy > 0) html += `<span style="${numStyle}">${energy}</span><span style="${txtStyle}">灵</span>`;

        return html || `<span style="${numStyle}">0</span>`;
    },

    /**
     * 完整显示玩家持有的各级灵石
     */
    formatHoldingsFull: function() {
        const h = this.getPlayerHoldings();
        const numStyle = 'color:#009688; font-weight:bold; margin-left:2px;';
        const txtStyle = 'color:#888; font-size:12px; margin-right:6px;';

        return `
            <span style="${numStyle}">${h.top}</span><span style="${txtStyle}">极</span>
            <span style="${numStyle}">${h.high}</span><span style="${txtStyle}">上</span>
            <span style="${numStyle}">${h.mid}</span><span style="${txtStyle}">中</span>
            <span style="${numStyle}">${h.low}</span><span style="${txtStyle}">下</span>
        `;
    },

    getPlayerHoldings: function() {
        if (!window.player || !player.inventory) return { low: 0, mid: 0, high: 0, top: 0, totalValue: 0 };
        const count = (id) => { const item = player.inventory.find(i => i.id === id); return item ? (item.count || 0) : 0; };
        const low = count(this.IDS.low);
        const mid = count(this.IDS.mid);
        const high = count(this.IDS.high);
        const top = count(this.IDS.top);
        const totalValue = (low * this.RATES.low) + (mid * this.RATES.mid) + (high * this.RATES.high) + (top * this.RATES.top);
        return { low, mid, high, top, totalValue };
    },

    addStones: function(low, mid, high, top) {
        if (window.UtilsAdd) {
            if (low > 0) window.UtilsAdd.addItem(this.IDS.low, low);
            if (mid > 0) window.UtilsAdd.addItem(this.IDS.mid, mid);
            if (high > 0) window.UtilsAdd.addItem(this.IDS.high, high);
            if (top > 0) window.UtilsAdd.addItem(this.IDS.top, top);
        }
    },

    /**
     * 【修复】扣除灵石
     * 必须先找到物品的 sid (唯一实例ID)，再调用 removeItem
     */
    removeStones: function(low, mid, high, top) {
        if (!window.UtilsItem || !window.player || !window.player.inventory) return;

        // 内部辅助函数：根据模板ID查找背包里的实例ID并删除
        const doRemove = (templateId, count) => {
            const item = window.player.inventory.find(i => i.id === templateId);
            if (item && item.sid) {
                // 使用 sid 进行删除，确保 UtilsItem 能找到它
                window.UtilsItem.removeItem(item.sid, count);
            }
        };

        if (low > 0) doRemove(this.IDS.low, low);
        if (mid > 0) doRemove(this.IDS.mid, mid);
        if (high > 0) doRemove(this.IDS.high, high);
        if (top > 0) doRemove(this.IDS.top, top);
    },

    /**
     * 智能扣费 (双向兑换版)
     */
    smartDeduct: function(costValue) {
        const holdings = this.getPlayerHoldings();

        if (holdings.totalValue < costValue) return false;

        let remainCost = costValue;
        let needTop = Math.floor(remainCost / 10000); remainCost %= 10000;
        let needHigh = Math.floor(remainCost / 1000); remainCost %= 1000;
        let needMid = Math.floor(remainCost / 100);   remainCost %= 100;
        let needLow = Math.ceil(remainCost / 10);

        let simLow = holdings.low - needLow;
        let simMid = holdings.mid - needMid;
        let simHigh = holdings.high - needHigh;
        let simTop = holdings.top - needTop;

        // 平账逻辑
        if (simLow < 0) {
            const borrow = Math.ceil(Math.abs(simLow) / 10);
            simMid -= borrow;
            simLow += borrow * 10;
        } else if (simLow >= 10) {
            const carry = Math.floor(simLow / 10);
            simMid += carry;
            simLow %= 10;
        }

        if (simMid < 0) {
            const borrow = Math.ceil(Math.abs(simMid) / 10);
            simHigh -= borrow;
            simMid += borrow * 10;
        } else if (simMid >= 10) {
            const carry = Math.floor(simMid / 10);
            simHigh += carry;
            simMid %= 10;
        }

        if (simHigh < 0) {
            const borrow = Math.ceil(Math.abs(simHigh) / 10);
            simTop -= borrow;
            simHigh += borrow * 10;
        } else if (simHigh >= 10) {
            const carry = Math.floor(simHigh / 10);
            simTop += carry;
            simHigh %= 10;
        }

        if (simTop < 0) return false;

        // 计算差值并执行
        const dLow = holdings.low - simLow;
        const dMid = holdings.mid - simMid;
        const dHigh = holdings.high - simHigh;
        const dTop = holdings.top - simTop;

        if (dLow > 0) this.removeStones(dLow, 0, 0, 0); else if (dLow < 0) this.addStones(Math.abs(dLow), 0, 0, 0);
        if (dMid > 0) this.removeStones(0, dMid, 0, 0); else if (dMid < 0) this.addStones(0, Math.abs(dMid), 0, 0);
        if (dHigh > 0) this.removeStones(0, 0, dHigh, 0); else if (dHigh < 0) this.addStones(0, 0, Math.abs(dHigh), 0);
        if (dTop > 0) this.removeStones(0, 0, 0, dTop); else if (dTop < 0) this.addStones(0, 0, 0, Math.abs(dTop));

        return true;
    }
};

window.UtilsSpiritPrice = UtilsSpiritPrice;