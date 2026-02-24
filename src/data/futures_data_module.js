/**
 * 期货行情数据桥接文件
 * 原文件 futures_data.js 使用 var FUTURES_DATA = {...}，
 * 本文件将其转为 ES 模块，直接 require 原文件再 export
 *
 * 使用方式：在 pages/futures/index.vue 中 import { FUTURES_DATA } from '@/data/futures_data_module.js'
 *
 * 注意：如果直接 import @/data/futures_data.js 不行，
 *       可将原 futures_data.js 手动在末尾添加：
 *       export { FUTURES_DATA };
 */

// 在 uni-app 构建中，直接 require 脚本会执行里面的代码并挂载全局变量
// 这里先尝试动态加载，降级返回空对象
let data = {};
try {
    // 如果 futures_data.js 已改为 export default 或 export { FUTURES_DATA }
    const mod = require('./futures_data.js');
    data = mod.FUTURES_DATA || mod.default || {};
} catch (e) {
    console.warn('[futures_data_module] 加载失败，请确认文件路径:', e);
}

export const FUTURES_DATA = data;
