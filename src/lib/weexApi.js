/**
 * WEEX API client wrapper for frontend
 * Note: Actual API calls should be made from backend for security
 * This is a utility for formatting and displaying WEEX data
 */

/**
 * Format WEEX symbol for display
 * @param {string} symbol - WEEX symbol (e.g., 'cmt_btcusdt')
 * @returns {string} Formatted symbol (e.g., 'BTC/USDT')
 */
export function formatWeeXSymbol(symbol) {
  if (!symbol) return '';
  
  // Remove 'cmt_' prefix and format
  const cleanSymbol = symbol.replace('cmt_', '').toUpperCase();
  const base = cleanSymbol.replace('USDT', '');
  return `${base}/USDT`;
}

/**
 * Get asset name from symbol
 * @param {string} symbol - WEEX symbol
 * @returns {string} Asset name
 */
export function getAssetFromSymbol(symbol) {
  if (!symbol) return '';
  return symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
}

/**
 * Format price with appropriate decimals
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
export function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined) return '0.00';
  return parseFloat(price).toFixed(decimals);
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) return '0.00';
  return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Get color based on spread value
 * @param {number} spreadPct - Spread percentage
 * @returns {string} Color code
 */
export function getSpreadColor(spreadPct) {
  if (spreadPct >= 3) return '#10b981'; // Green - high profit
  if (spreadPct >= 1.5) return '#3b82f6'; // Blue - good profit
  if (spreadPct >= 1) return '#f59e0b'; // Orange - minimal profit
  return '#6b7280'; // Gray - low/no profit
}

