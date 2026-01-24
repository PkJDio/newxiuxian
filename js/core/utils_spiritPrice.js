/**
 * 灵石价格转换工具类 v1.0
 * 比例：灵气(1) : 下品(10) : 中品(100) : 上品(1000) : 极品(10000)
 */
let UtilsSpiritPrice = {
    // 将数值转换为各级灵石数量
    convert: function(price) {
        let val = parseInt(price) || 0;
        const top = Math.floor(val / 10000);   // 极品
        val %= 10000;
        const high = Math.floor(val / 1000);  // 上品
        val %= 1000;
        const mid = Math.floor(val / 100);    // 中品
        val %= 100;
        const low = Math.floor(val / 10);     // 下品
        const energy = val % 10;              // 剩余灵气

        return { top, high, mid, low, energy };
    },

    // 返回带颜色的 HTML 格式化字符串
    format: function(price) {
        if (!price || price <= 0) return '<span style="color:#888">免费</span>';

        const p = this.convert(price);
        let html = "";

        // 按照从高到低的顺序显示
        if (p.top > 0) html += `<span style="color:rgba(255,0,255,0.53); margin-right:2px;">${p.top}极品灵石</span>`;
        if (p.high > 0) html += `<span style="color:rgba(255,68,68,0.68); margin-right:2px;">${p.high}上品灵石</span>`;
        if (p.mid > 0) html += `<span style="color:rgba(68,68,255,0.78); margin-right:2px;">${p.mid}中品灵石</span>`;
        if (p.low > 0) html += `<span style="color:rgba(68,255,68,0.72); margin-right:2px;">${p.low}下品灵石</span>`;
        if (p.energy > 0) html += `<span style="color:#888888; margin-right:2px;">${p.energy}灵气</span>`;

        return html;
    }
};

window.UtilsSpiritPrice = UtilsSpiritPrice;