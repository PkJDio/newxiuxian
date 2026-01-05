// js/modules/ink_generator.js
// 水墨素材生成器：程序化生成 花/草/石/苔藓
console.log("加载 水墨生成器");

const InkSpriteGenerator = {
    // 配置：生成的图集大小
    tileSize: 64,
    cols: 4,
    rows: 4,

    /**
     * 生成图集 Canvas
     * @returns {HTMLCanvasElement} 返回生成的 Canvas 对象
     */
    generateSpriteSheet: function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize * this.cols;
        canvas.height = this.tileSize * this.rows;
        const ctx = canvas.getContext('2d');

        // 遍历网格生成不同元素
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = c * this.tileSize;
                const y = r * this.tileSize;
                const cx = x + this.tileSize / 2;
                const cy = y + this.tileSize / 2;

                ctx.save();
                // 限制绘制区域，防止画出格子
                ctx.beginPath();
                ctx.rect(x, y, this.tileSize, this.tileSize);
                ctx.clip();

                // 每一行的主题不同
                if (r === 0) this._drawMoss(ctx, cx, cy);      // 第1行：苔藓/墨点
                else if (r === 1) this._drawGrass(ctx, cx, cy + 20); // 第2行：草丛
                else if (r === 2) this._drawRock(ctx, cx, cy + 10);  // 第3行：石头
                else if (r === 3) this._drawFlower(ctx, cx, cy);     // 第4行：简单的花

                ctx.restore();
            }
        }

        return canvas;
    },

    // --- 绘图算法：模拟毛笔笔触 ---

    // 1. 苔藓/墨点 (利用多层模糊圆)
    _drawMoss: function(ctx, x, y) {
        const count = 3 + Math.random() * 5;
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            const size = 2 + Math.random() * 6;

            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
            // 核心：利用 shadowBlur 模拟墨水晕染
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = size * 2;
            ctx.fillStyle = `rgba(30, 40, 30, ${0.3 + Math.random() * 0.4})`; // 淡墨绿
            ctx.fill();
        }
    },

    // 2. 草丛 (贝塞尔曲线 + 宽度渐变)
    _drawGrass: function(ctx, x, y) {
        const blades = 5 + Math.random() * 5;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 2;

        for (let i = 0; i < blades; i++) {
            const height = 15 + Math.random() * 20;
            const lean = (Math.random() - 0.5) * 20; // 倾斜度
            const offsetX = (Math.random() - 0.5) * 20;

            ctx.beginPath();
            ctx.moveTo(x + offsetX, y);
            // 二次贝塞尔曲线：起点 -> 控制点 -> 终点
            ctx.quadraticCurveTo(x + offsetX + lean / 2, y - height / 2, x + offsetX + lean, y - height);

            // 笔触颜色：深灰到黑
            ctx.strokeStyle = `rgba(20, 30, 20, ${0.6 + Math.random() * 0.4})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.stroke();
        }
    },

    // 3. 石头 (多边形 + 内部噪点)
    _drawRock: function(ctx, x, y) {
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#2a2a2a";

        // 画一个不规则的圆
        ctx.beginPath();
        const r = 10 + Math.random() * 8;
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
            const rOffset = r + (Math.random() - 0.5) * 5;
            const px = x + Math.cos(a) * rOffset;
            const py = y + Math.sin(a) * rOffset * 0.6; // 压扁一点
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // 加上几笔高光/皴法
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.stroke();
    },

    // 4. 小花 (中心点 + 模糊花瓣)
    _drawFlower: function(ctx, x, y) {
        // 花茎
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.quadraticCurveTo(x + 5, y, x, y);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 花瓣 (淡红/淡白)
        const petals = 5;
        ctx.fillStyle = `rgba(200, 100, 100, ${0.4 + Math.random() * 0.3})`; // 淡朱砂色
        ctx.shadowColor = "rgba(200, 50, 50, 0.5)";
        ctx.shadowBlur = 5;

        for (let i = 0; i < petals; i++) {
            const angle = (Math.PI * 2 / petals) * i;
            const px = x + Math.cos(angle) * 8;
            const py = y + Math.sin(angle) * 8;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

// 暴露给全局
window.InkSpriteGenerator = InkSpriteGenerator;