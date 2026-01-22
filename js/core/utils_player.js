/**
 * js/core/utils_player.js
 * 玩家信息获取工具类 v1.0
 * 负责统一获取玩家的属性、位置、区域等信息
 */

const UtilsPlayer = {
    /**
     * 获取玩家当前坐标对象
     * @returns {Object} {x, y}
     */
    getCoord: function() {
        // 兼容存档中可能存在的不同结构，确保返回 {x,y}
        if (!window.player) return { x: 0, y: 0 };
        // 如果 player.coord 存在则使用，否则尝试使用根目录下的 x, y (旧档兼容)
        return window.player.coord || { x: window.player.x || 0, y: window.player.y || 0 };
    },

    /**
     * 获取玩家当前所在的城镇对象
     * @returns {Object|null} 城镇配置对象 或 null
     */
    getCurrentTown: function() {
        const { x, y } = this.getCoord();

        // 依赖 data_world.js 中的全局城镇数据
        if (!window.WORLD_TOWNS) {
            console.warn("UtilsPlayer: WORLD_TOWNS data not loaded.");
            return null;
        }

        // 判定点是否在矩形范围内
        const town = window.WORLD_TOWNS.find(t =>
            x >= t.x && x <= t.x + t.w &&
            y >= t.y && y <= t.y + t.h
        );
        console.log(town);
        return town || null;
    },

    /**
     * 判断玩家是否在城镇中
     * @returns {boolean}
     */
    isInTown: function() {
        return !!this.getCurrentTown();
    },

    /**
     * 获取玩家当前位置的详细描述（用于UI显示）
     * 复用了 data_world.js 的逻辑，但返回结构化数据
     * @returns {Object} { regionName, subRegionName, localName, chainString }
     */
    getLocationInfo: function() {
        const { x, y } = this.getCoord();

        // 依赖 data_world.js 的常量配置
        const GRID_LARGE = window.GRID_LARGE || 1700;
        const GRID_SMALL = window.GRID_SMALL || 566;
        const REGION_LAYOUT = window.REGION_LAYOUT || [];
        const SUB_REGIONS = window.SUB_REGIONS || {};
        const TERRAIN_ZONES = window.TERRAIN_ZONES || [];

        // 1. 大区域
        const region = REGION_LAYOUT.find(r =>
            x >= r.x[0] && x < r.x[1] && y >= r.y[0] && y < r.y[1]
        );
        const regionName = region ? region.name : "荒野";

        // 2. 小区域
        const sX = Math.floor((x % GRID_LARGE) / GRID_SMALL);
        const sY = Math.floor((y % GRID_LARGE) / GRID_SMALL);
        let subName = "野外";

        if (region) {
            const key = `${region.id}_${sX}_${sY}`;
            if (SUB_REGIONS[key]) subName = SUB_REGIONS[key].name;
        }

        // 3. 具体地点 (城镇 或 地形)
        let localName = "";
        const town = this.getCurrentTown();

        if (town) {
            localName = town.name;
        } else {
            // 如果不在城镇，检查地形
            for (let i = TERRAIN_ZONES.length - 1; i >= 0; i--) {
                const z = TERRAIN_ZONES[i];
                if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) {
                    localName = z.name;
                    break;
                }
            }
        }

        // 拼接字符串
        let chain = regionName;
        if (subName !== "野外") chain += ` - ${subName}`;
        if (localName) chain += ` - ${localName}`;

        return {
            region: regionName,
            subRegion: subName,
            location: localName,
            fullDesc: chain,
            isSafe: !!town // 城镇内视为安全区
        };
    }
};

window.UtilsPlayer = UtilsPlayer;