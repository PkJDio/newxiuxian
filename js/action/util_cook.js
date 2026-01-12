/**
 * js/action/util_cook.js
 * 烹饪核心逻辑 - 逻辑分级版
 */
window.UtilCook = {
    /**
     * 核心校验：鼎内必须至少包含一种【基础食材】
     */
    /**
     * 核心校验：鼎内不能只有“水” (foodMaterial_007)
     */
    checkValidity: function(selectedMaterials) {
        if (!selectedMaterials || selectedMaterials.length === 0) {
            return { valid: false, msg: "鼎内空空如也" };
        }

        // 检查是否全部都是“水”
        const allWater = selectedMaterials.every(m => m.id === "foodMaterial_007");

        if (allWater) {
            return { valid: false, msg: "只有清水入锅，难成席面（请加入主食或肉菜）" };
        }

        return { valid: true };
    },
    /**
     * 匹配配方并返回对应的食物对象（包含逻辑类型判断）
     */
    getMatchResult: function(selectedMaterials, cookType) {

        const validity = this.checkValidity(selectedMaterials);
        if (!validity.valid) return null; // 不合法的组合不返回任何预览

        if (!selectedMaterials || selectedMaterials.length === 0) return null;

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
            // 返回匹配成功的料理，标记为正式配方
            return { ...matched, isRecipe: true };
        }

        // 2. 未匹配到正式配方，根据数量返回“糊糊”
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

    /**
     * 执行烹饪动作
     */
    executeCook: function(selectedMaterials, cookType) {
        const result = this.getMatchResult(selectedMaterials, cookType);
        if (!result) return null;
        // 点击“起锅”时的强制校验
        const validity = this.checkValidity(selectedMaterials);
        if (!validity.valid) {
            if (window.showToast) window.showToast(validity.msg);
            return null;
        }

        // 校验 sid 库存
        for (const mat of selectedMaterials) {
            const invItem = player.inventory.find(slot => slot.sid === mat.sid);
            if (!invItem || invItem.count < 1) {
                if (window.showToast) window.showToast(`素材 [${mat.name}] 已用尽`);
                return null;
            }
        }

        return {
            success: true,
            food: JSON.parse(JSON.stringify(result))
        };
    }
};