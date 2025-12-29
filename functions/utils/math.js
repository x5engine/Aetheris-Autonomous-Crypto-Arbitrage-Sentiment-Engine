/**
 * Calculate spread percentage between two prices
 * @param {number} priceA - First exchange price
 * @param {number} priceB - Second exchange price
 * @returns {number} Spread percentage
 */
export function calculateSpread(priceA, priceB) {
  if (!priceA || !priceB || priceA === 0 || priceB === 0) {
    return 0;
  }
  const higher = Math.max(priceA, priceB);
  const lower = Math.min(priceA, priceB);
  return ((higher - lower) / lower) * 100;
}

/**
 * Calculate projected profit from arbitrage
 * @param {number} spreadPct - Spread percentage
 * @param {number} amount - Trade amount
 * @param {number} fees - Total fees (maker + taker)
 * @returns {number} Projected profit after fees
 */
export function calculateProjectedProfit(spreadPct, amount, fees = 0.001) {
  const grossProfit = (spreadPct / 100) * amount;
  const totalFees = amount * fees * 2; // Fees for both buy and sell
  return grossProfit - totalFees;
}

/**
 * Check if arbitrage opportunity is profitable
 * @param {number} spreadPct - Spread percentage
 * @param {number} minSpreadPct - Minimum required spread (default 1%)
 * @param {number} amount - Trade amount
 * @param {number} fees - Total fees
 * @returns {boolean} True if profitable
 */
export function isProfitable(spreadPct, minSpreadPct = 1.0, amount = 100, fees = 0.001) {
  if (spreadPct < minSpreadPct) {
    return false;
  }
  const profit = calculateProjectedProfit(spreadPct, amount, fees);
  return profit > 0;
}

/**
 * Calculate risk level based on spread and volatility
 * @param {number} spreadPct - Spread percentage
 * @param {number} volatility - Historical volatility (optional)
 * @returns {string} Risk level: LOW, MEDIUM, HIGH
 */
export function calculateRiskLevel(spreadPct, volatility = 0) {
  if (spreadPct > 5 || volatility > 0.1) {
    return 'HIGH';
  }
  if (spreadPct > 2 || volatility > 0.05) {
    return 'MEDIUM';
  }
  return 'LOW';
}

