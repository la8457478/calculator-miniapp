/**
 * 核心计算逻辑（纯函数，无 DOM / 平台依赖）
 * 从 script.js 提取，可在 H5 和小程序复用
 */

/**
 * 期货仓位计算
 * @param {number} buy      买入价
 * @param {number} stop     止损价
 * @param {number} risk     最大风险金额
 * @param {object} product  期货品种规格 { tickSize, multiplier }
 * @returns {object} 计算结果
 */
export function calcFutures(buy, stop, risk, product) {
    const priceDiff = Math.abs(buy - stop);
    const isLong = buy > stop;
    const directionMultiplier = isLong ? 1 : -1;

    const riskPerPoint = priceDiff / product.tickSize;
    const valuePerTick = product.tickSize * product.multiplier;
    const riskPerContract = riskPerPoint * valuePerTick;

    const contracts = Math.floor(risk / riskPerContract);
    const totalMargin = contracts * buy * product.multiplier * 0.1;
    const actualRisk = contracts * riskPerContract;
    const target1 = buy + priceDiff * directionMultiplier;
    const target3 = buy + priceDiff * 3 * directionMultiplier;

    return {
        isLong,
        contracts,
        totalMargin,
        actualRisk,
        target1,
        target3,
    };
}

/**
 * 股票仓位计算
 * @param {number} buy   买入价
 * @param {number} stop  止损价
 * @param {number} risk  最大风险金额
 * @returns {object} 计算结果
 */
export function calcStock(buy, stop, risk) {
    const priceDiff = Math.abs(buy - stop);
    const isLong = buy > stop;
    const directionMultiplier = isLong ? 1 : -1;

    const maxShares = Math.floor(risk / priceDiff);
    const shares = Math.floor(maxShares / 100) * 100; // 整手（100股）
    const totalInvestment = shares * buy;
    const actualRisk = shares * priceDiff;
    const target1 = buy + priceDiff * directionMultiplier;
    const target3 = buy + priceDiff * 3 * directionMultiplier;

    return {
        isLong,
        shares,
        totalInvestment,
        actualRisk,
        target1,
        target3,
    };
}

/**
 * 蓄势品种内联计算（期货）
 * @param {number} entryPrice  突破买入价
 * @param {number} stopPrice   止损价格
 * @param {number} risk        风险金额
 * @param {object} product     期货品种规格
 */
export function calcPendingPosition(entryPrice, stopPrice, risk, product) {
    const priceDiff = Math.abs(entryPrice - stopPrice);
    if (priceDiff === 0 || !product) return null;

    const riskPerPoint = priceDiff / product.tickSize;
    const valuePerTick = product.tickSize * product.multiplier;
    const riskPerContract = riskPerPoint * valuePerTick;

    const contracts = Math.floor(risk / riskPerContract);
    const actualRisk = contracts * riskPerContract;
    const margin = contracts * entryPrice * product.multiplier * 0.1;

    return { contracts, actualRisk, margin };
}

/**
 * 期货平仓盈亏计算
 */
export function calcFuturesProfit(position, closePrice, productSpec) {
    const isLong = position.buyPrice > position.stopLoss;
    const directionM = isLong ? 1 : -1;
    const diff = (closePrice - position.buyPrice) * directionM;
    const ticks = diff / productSpec.tickSize;
    const tickValue = productSpec.tickSize * productSpec.multiplier;
    return ticks * tickValue * position.quantity;
}

/**
 * 股票平仓盈亏计算
 */
export function calcStockProfit(position, closePrice) {
    return (closePrice - position.buyPrice) * position.quantity;
}
