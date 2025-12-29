/**
 * Client-side trade logic and strategy validation
 */

/**
 * Validate if a trade should be executed based on profit and sentiment
 * @param {object} opportunity - Trade opportunity data
 * @param {number} minProfit - Minimum profit threshold in USDT
 * @param {number} minSentiment - Minimum sentiment score (-1 to 1)
 * @returns {boolean} True if trade should be executed
 */
export function shouldExecuteTrade(opportunity, minProfit = 10, minSentiment = 0.5) {
  if (!opportunity) return false;

  const { projected_profit, ai_validation } = opportunity;

  // Check profit threshold
  if (projected_profit < minProfit) {
    return false;
  }

  // Check sentiment approval
  if (ai_validation && ai_validation.sentiment_score !== null) {
    if (ai_validation.sentiment_score < minSentiment) {
      return false;
    }
    if (ai_validation.approval === false) {
      return false;
    }
  }

  // Check risk level
  if (opportunity.risk_level === 'HIGH') {
    return false;
  }

  // Check status
  if (opportunity.status !== 'DETECTED' && opportunity.status !== 'ANALYZING') {
    return false;
  }

  return true;
}

/**
 * Calculate trade size based on available balance and risk
 * @param {number} availableBalance - Available balance in USDT
 * @param {number} riskPercentage - Risk percentage (0-100)
 * @param {number} minTradeSize - Minimum trade size
 * @param {number} maxTradeSize - Maximum trade size
 * @returns {number} Recommended trade size
 */
export function calculateTradeSize(availableBalance, riskPercentage = 5, minTradeSize = 10, maxTradeSize = 1000) {
  const riskAmount = (availableBalance * riskPercentage) / 100;
  const tradeSize = Math.max(minTradeSize, Math.min(riskAmount, maxTradeSize));
  return Math.floor(tradeSize);
}

/**
 * Get sentiment label from score
 * @param {number} sentimentScore - Sentiment score (-1 to 1)
 * @returns {string} Sentiment label
 */
export function getSentimentLabel(sentimentScore) {
  if (sentimentScore === null || sentimentScore === undefined) {
    return 'Pending';
  }
  
  if (sentimentScore >= 0.7) return 'Very Positive';
  if (sentimentScore >= 0.3) return 'Positive';
  if (sentimentScore >= -0.3) return 'Neutral';
  if (sentimentScore >= -0.7) return 'Negative';
  return 'Very Negative';
}

/**
 * Get sentiment color from score
 * @param {number} sentimentScore - Sentiment score (-1 to 1)
 * @returns {string} Color code
 */
export function getSentimentColor(sentimentScore) {
  if (sentimentScore === null || sentimentScore === undefined) {
    return '#6b7280';
  }
  
  if (sentimentScore >= 0.5) return '#10b981'; // Green
  if (sentimentScore >= 0) return '#3b82f6'; // Blue
  if (sentimentScore >= -0.5) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
}

