/**
 * Calculate spread percentage between two prices
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
 */
export function calculateProjectedProfit(spreadPct, amount, fees = 0.001) {
  const grossProfit = (spreadPct / 100) * amount;
  const totalFees = amount * fees * 2;
  return grossProfit - totalFees;
}

/**
 * Check if arbitrage opportunity is profitable
 */
export function isProfitable(spreadPct, minSpreadPct = 1.0, amount = 100, fees = 0.001) {
  if (spreadPct < minSpreadPct) {
    return false;
  }
  const profit = calculateProjectedProfit(spreadPct, amount, fees);
  return profit > 0;
}

/**
 * Calculate risk level based on spread
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

