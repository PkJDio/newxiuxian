// js/modules/ink_generator.js
// 水墨素材生成器 v2.1 (修复树木被裁切问题)
//console.log("加载 水墨生成器");

const InkSpriteGenerator = {
    tileSize: 64,
    cols: 4,
    rows: 5,

    generateSpriteSheet: function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize * this.cols;
        canvas.height = this.tileSize * this.rows;
        const ctx = canvas.getContext('2d');

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;
                const cx = x + this.tileSize / 2;
                const cy = y + this.tileSize / 2;

                ctx.save();
                // 限制绘制区域
                ctx.beginPath();
                ctx.rect(x, y, this.tileSize, this.tileSize);
                ctx.clip();

                if (r === 0) this._drawMoss(ctx, cx, cy);
                else if (r === 1) this._drawGrass(ctx, cx, cy + 20);
                else if (r === 2) this._drawRock(ctx, cx, cy + 10);
                else if (r === 3) this._drawFlower(ctx, cx, cy);
                // 【修改点1】树根位置下移到 cy + 28 (接近格子底部)，给树冠留出更多顶部空间
                else if (r === 4) this._drawTree(ctx, cx, cy + 28);

                ctx.restore();
            }
        }
        return canvas;
    },

    // --- 绘图算法 ---

    _drawMoss: function(ctx, x, y) {
        const count = 3 + Math.random() * 5;
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            const size = 2 + Math.random() * 6;
            ctx.beginPath(); ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
            ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = size * 2;
            ctx.fillStyle = `rgba(30, 40, 30, ${0.3 + Math.random() * 0.4})`; ctx.fill();
        }
    },

    _drawGrass: function(ctx, x, y) {
        const blades = 5 + Math.random() * 5;
        ctx.lineCap = "round"; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 2;
        for (let i = 0; i < blades; i++) {
            const height = 15 + Math.random() * 20;
            const lean = (Math.random() - 0.5) * 20;
            const offsetX = (Math.random() - 0.5) * 20;
            ctx.beginPath(); ctx.moveTo(x + offsetX, y);
            ctx.quadraticCurveTo(x + offsetX + lean / 2, y - height / 2, x + offsetX + lean, y - height);
            ctx.strokeStyle = `rgba(20, 30, 20, ${0.6 + Math.random() * 0.4})`;
            ctx.lineWidth = 1 + Math.random() * 2; ctx.stroke();
        }
    },

    _drawRock: function(ctx, x, y) {
        ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 10; ctx.fillStyle = "#2a2a2a";
        ctx.beginPath();
        const r = 10 + Math.random() * 8;
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
            const rOffset = r + (Math.random() - 0.5) * 5;
            const px = x + Math.cos(a) * rOffset; const py = y + Math.sin(a) * rOffset * 0.6;
            if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.stroke();
    },

    _drawFlower: function(ctx, x, y) {
        ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.quadraticCurveTo(x + 5, y, x, y);
        ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1; ctx.stroke();
        const petals = 5;
        ctx.fillStyle = `rgba(200, 100, 100, ${0.4 + Math.random() * 0.3})`;
        ctx.shadowColor = "rgba(200, 50, 50, 0.5)"; ctx.shadowBlur = 5;
        for (let i = 0; i < petals; i++) {
            const angle = (Math.PI * 2 / petals) * i;
            const px = x + Math.cos(angle) * 8; const py = y + Math.sin(angle) * 8;
            ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
        }
    },

    // 【修改点2】修复树木绘制参数，防止出界
    _drawTree: function(ctx, x, y) {
        // 树干高度：控制在 20-32 之间 (之前是 35-45)
        const height = 20 + Math.random() * 12;

        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(20, 20, 20, 0.8)";
        ctx.lineWidth = 2 + Math.random() * 2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        const bend = (Math.random() - 0.5) * 10;
        ctx.quadraticCurveTo(x + bend, y - height / 2, x, y - height);
        ctx.stroke();

        // 树冠
        const clusters = 4 + Math.random() * 3;
        ctx.fillStyle = `rgba(10, 20, 10, ${0.3 + Math.random() * 0.2})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(0,0,0,0.5)";

        for(let i=0; i<clusters; i++) {
            const cx = x + (Math.random() - 0.5) * 24; // 稍微收窄横向范围

            // 垂直随机范围控制：(y-height) 是树顶
            // 让树叶主要分布在树顶稍微偏下的位置，防止向上飘出格子
            const cy = (y - height) + (Math.random() - 0.2) * 12;

            // 半径缩小到 4-9 (之前是 8-14)
            const r = 4 + Math.random() * 5;

            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI*2);
            ctx.fill();
        }
    }
};
window.InkSpriteGenerator = InkSpriteGenerator;