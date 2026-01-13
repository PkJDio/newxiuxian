/**
 * js/action/util_cook.js
 * 烹饪核心逻辑 - 技艺关联增强版
 */
window.UtilCook = {
    // 境界配置
    LEVELS: [
        { minExp: 999, name: "大成", doubleProb: 0.3, saveProb: 0.10 },
        { minExp: 400, name: "进阶", doubleProb: 0.2, saveProb: 0.05 },
        { minExp: 100, name: "入门", doubleProb: 0.1, saveProb: 0.00 },
        { minExp: 0,   name: "未入门", doubleProb: 0.0, saveProb: 0.00 }
    ],

    /**
     * 获取当前烹饪境界数据
     */
    getCookingLevelData: function() {
        const exp = (player.lifeSkills && player.lifeSkills.cooking) ? player.lifeSkills.cooking.exp : 0;
        return this.LEVELS.find(l => exp >= l.minExp) || this.LEVELS[this.LEVELS.length - 1];
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
     * 匹配配方并返回对应的食物对象
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

    /**
     * 执行烹饪动作
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
        const levelData = this.getCookingLevelData();
        let finalCount = 1;
        let toastMsgs = [];
        let isDouble = false;
        let savedMaterials = [];

        // 1. 熟练度增长 (正式配方才增加)
        if (result.isRecipe) {
            if (!player.lifeSkills.cooking) {
                player.lifeSkills.cooking = { name: "烹饪", exp: 0 };
            }
            player.lifeSkills.cooking.exp += 1;
            // 检查境界提升提示
            const newLevel = this.getCookingLevelData();
            if (newLevel.name !== levelData.name && window.showToast) {
                window.showToast(`【烹饪】技艺精进，已达《${newLevel.name}》之境！`);
            }
        }

        // 2. 双倍产出概率判定
        if (Math.random() < levelData.doubleProb) {
            finalCount = 2;
            isDouble = true;
        }

        // 3. 食材不消耗概率判定 (针对每个食材独立判定)
        const finalMaterialsToConsume = [];
        selectedMaterials.forEach(mat => {
            if (Math.random() < levelData.saveProb) {
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