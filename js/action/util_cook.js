/**
 * js/action/util_cook.js
 * 烹饪核心逻辑 v3.0 - 适配新版技艺等级 (Lv.0 - Lv.10)
 */
window.UtilCook = {

    /**
     * 获取当前等级对应的加成属性
     * @param {number} level 传入等级，如果不传则自动获取
     */
    getCookStats: function(level) {
        if (level === undefined) {
            level = (window.UtilsLifeSkills) ? UtilsLifeSkills.getLevel('cooking') : 0;
        }

        // 1. 双倍产出概率：每级 3%，最高 30%
        const doubleProb = Math.min(0.30, level * 0.03);

        // 2. 食材保留概率：每级 1.5%，最高 15%
        const saveProb = Math.min(0.15, level * 0.015);

        return {
            level: level,
            doubleProb: doubleProb,
            saveProb: saveProb
        };
    },

    /**
     * 核心校验：鼎内不能只有“水” (foodMaterial_007)
     */
    checkValidity: function(selectedMaterials) {
        if (!selectedMaterials || selectedMaterials.length === 0) {
            return { valid: false, msg: "鼎内空空如也" };
        }

        const allWater = selectedMaterials.every(m => m.id === "foodMaterial_007");
        if (allWater) {
            return { valid: false, msg: "只有清水入锅，难成席面（请加入主食或肉菜）" };
        }

        return { valid: true };
    },

    /**
     * 匹配配方并返回对应的食物对象 (保持原有逻辑不变)
     */
    getMatchResult: function(selectedMaterials, cookType) {
        const validity = this.checkValidity(selectedMaterials);
        if (!validity.valid) return null;

        const inputIds = selectedMaterials.map(m => m.id).sort();

        // 1. 尝试匹配正式配方
        let matched = foods.find(f => {
            if (f.cookType !== cookType) return false;
            if (!f.recipe || f.recipe.length === 0) return false;
            const recipeIds = [...f.recipe[0]].sort();
            if (recipeIds.length !== inputIds.length) return false;
            return recipeIds.every((id, idx) => id === inputIds[idx]);
        });

        if (matched) {
            return { ...matched, isRecipe: true };
        }

        // 2. 未匹配到正式配方返回“糊糊”
        let failedData = {
            isRecipe: false,
            type: "food",
            icon: "🥣",
            desc: "一锅难以言喻的物质，勉强能塞进肚子。"
        };

        const count = selectedMaterials.length;
        if (count >= 4) {
            failedData.id = "foods_dhuhu";
            failedData.name = "大糊糊";
            failedData.effects = { hunger: 5 };
        } else if (count >= 3) {
            failedData.id = "foods_huhu";
            failedData.name = "糊糊";
            failedData.effects = { hunger: 3 };
        } else {
            failedData.id = "foods_xhuhu";
            failedData.name = "小糊糊";
            failedData.effects = { hunger: 1 };
        }

        return failedData;
    },
// 【新增】根据当前食材推演最接近的配方
    getRecipeHint: function(selectedMaterials) {
        if (!selectedMaterials || selectedMaterials.length === 0) return null;
        // 假设全局变量 foods 存在 (这是之前的逻辑里就在用的)
        if (typeof foods === 'undefined') return null;

        const selectedIds = selectedMaterials.map(m => m.id);

        // 1. 筛选：必须包含至少一个当前选中的食材
        let candidates = foods.filter(f => {
            if (!f.recipe || f.recipe.length === 0) return false;
            const rec = f.recipe[0];
            return rec.some(id => selectedIds.includes(id));
        });

        if (candidates.length === 0) return null;

        // 2. 排序：优先显示匹配度最高的
        candidates.sort((a, b) => {
            const recA = a.recipe[0];
            const recB = b.recipe[0];

            // 计算匹配的食材数量
            const matchA = recA.filter(id => selectedIds.includes(id)).length;
            const matchB = recB.filter(id => selectedIds.includes(id)).length;

            // 规则1：匹配数量多的优先
            if (matchA !== matchB) return matchB - matchA;

            // 规则2：如果匹配数一样，配方总长度短的优先 (越简单的菜越容易猜中)
            return recA.length - recB.length;
        });

        // 返回匹配度最高的那个配方
        return candidates[0];
    },
    /**
     * 执行烹饪动作 (核心修改：接入新版经验和概率)
     */
    executeCook: function(selectedMaterials, cookType) {
        const result = this.getMatchResult(selectedMaterials, cookType);
        if (!result) return null;

        const validity = this.checkValidity(selectedMaterials);
        if (!validity.valid) {
            if (window.showToast) window.showToast(validity.msg);
            return null;
        }

        // 校验库存
        for (const mat of selectedMaterials) {
            const invItem = player.inventory.find(slot => slot.sid === mat.sid);
            if (!invItem || invItem.count < 1) {
                if (window.showToast) window.showToast(`素材 [${mat.name}] 已用尽`);
                return null;
            }
        }

        // --- 逻辑处理：技能与概率 ---
        // 获取基于等级的属性
        const stats = this.getCookStats();

        let finalCount = 1;
        let isDouble = false;
        let savedMaterials = [];

        // 1. 熟练度增长 (统一调用新接口，固定+1)
        if (window.UtilsLifeSkills) {
            UtilsLifeSkills.addExp('cooking', 1);
        }

        // 2. 双倍产出概率判定
        if (Math.random() < stats.doubleProb) {
            finalCount = 2;
            isDouble = true;
        }

        // 3. 食材不消耗概率判定 (针对每个食材独立判定)
        const finalMaterialsToConsume = [];
        selectedMaterials.forEach(mat => {
            if (Math.random() < stats.saveProb) {
                savedMaterials.push(mat.name);
            } else {
                finalMaterialsToConsume.push(mat);
            }
        });

        // --- 弹窗反馈逻辑 ---
        if (isDouble && window.showToast) {
            setTimeout(() => {
                window.showToast(`💥 妙手偶得！这一锅竟然出了两份成品，真是神乎其技！`, 4000);
            }, 500);
        }

        if (savedMaterials.length > 0 && window.showToast) {
            setTimeout(() => {
                window.showToast(`✨ 游刃有余！处理食材手法精妙，[${savedMaterials.join("、")}] 竟然完好如初！`, 4000);
            }, 1200);
        }

        // 消耗食材逻辑
        finalMaterialsToConsume.forEach(mat => {
            if (window.UtilsItem && window.UtilsItem.removeItem) {
                window.UtilsItem.removeItem(mat.sid, 1);
            }
        });

        return {
            success: true,
            food: JSON.parse(JSON.stringify(result)),
            count: finalCount // 返回产出数量
        };
    }
};