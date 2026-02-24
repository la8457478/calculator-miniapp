/**
 * 格式化工具函数（纯函数，无平台依赖）
 */

export function formatNumber(num, maxDecimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    const val = parseFloat(Number(num).toFixed(maxDecimals));
    return val.toLocaleString('zh-CN', { maximumFractionDigits: maxDecimals });
}

export function formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
}
