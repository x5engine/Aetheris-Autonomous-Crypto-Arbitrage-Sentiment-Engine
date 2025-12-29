import axios from 'axios';
import { getWeeXHeaders } from './weexAuth.js';

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';

/**
 * Upload AI log to WEEX
 * Required for AI Wars competition compliance
 * @param {object} logData - AI log data
 * @param {number} logData.orderId - Order ID (optional)
 * @param {string} logData.stage - Trading stage where AI participated (e.g., "Strategy Generation", "Decision Making")
 * @param {string} logData.model - AI model name or version (e.g., "GPT-4-turbo", "distilbert-base-uncased")
 * @param {object} logData.input - Input data (prompt, query, or input text given to AI)
 * @param {object} logData.output - AI model output (predictions, decision recommendations, inference process)
 * @param {string} logData.explanation - Concise explanation of AI's analysis (max 1000 characters)
 * @returns {Promise<object>} Upload result
 */
export async function uploadAiLog(logData) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    // Validate required fields
    if (!logData.stage || !logData.model || !logData.input || !logData.output || !logData.explanation) {
      throw new Error('Missing required AI log fields: stage, model, input, output, explanation');
    }

    // Validate explanation length
    if (logData.explanation.length > 1000) {
      throw new Error('Explanation exceeds maximum length of 1000 characters');
    }

    const requestPath = '/capi/v2/order/uploadAiLog';
    const body = {
      orderId: logData.orderId || null,
      stage: logData.stage,
      model: logData.model,
      input: logData.input,
      output: logData.output,
      explanation: logData.explanation
    };

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, {
      headers
    });

    if (response.data && response.data.code === '00000') {
      return {
        success: true,
        message: response.data.data || 'Upload successful',
        requestTime: response.data.requestTime
      };
    }

    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    console.error('Error uploading AI log:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate AI log data from trade opportunity and sentiment analysis
 * @param {object} opportunity - Trade opportunity data
 * @param {object} sentimentResult - Sentiment analysis result
 * @param {string} orderId - Order ID (if trade was executed)
 * @returns {object} Formatted AI log data
 */
export function generateAiLogFromTrade(opportunity, sentimentResult, orderId = null) {
  const stage = orderId ? 'Decision Making' : 'Strategy Generation';
  const model = 'distilbert-base-uncased-finetuned-sst-2-english'; // Transformers.js model used
  
  const input = {
    prompt: 'Analyze market sentiment for arbitrage opportunity',
    data: {
      symbol: opportunity.symbol,
      spread_pct: opportunity.spread_pct,
      exchange_a_price: opportunity.exchange_a_price,
      exchange_b_price: opportunity.exchange_b_price,
      projected_profit: opportunity.projected_profit,
      risk_level: opportunity.risk_level,
      news_headlines: sentimentResult.headlines || []
    }
  };

  const output = {
    sentiment_score: sentimentResult.sentiment_score,
    confidence: sentimentResult.confidence,
    approval: sentimentResult.approval,
    recommendation: sentimentResult.approval ? 'Execute trade' : 'Reject trade',
    reasoning: sentimentResult.reasoning || 'Sentiment analysis indicates market conditions'
  };

  const explanation = `AI sentiment analysis of market conditions for ${opportunity.symbol} arbitrage opportunity. ` +
    `Spread of ${opportunity.spread_pct.toFixed(2)}% detected with projected profit of $${opportunity.projected_profit.toFixed(2)}. ` +
    `Sentiment score: ${sentimentResult.sentiment_score.toFixed(2)} (${sentimentResult.approval ? 'positive' : 'negative'}). ` +
    `AI recommendation: ${sentimentResult.approval ? 'Approve trade execution' : 'Reject due to negative sentiment'}.`;

  return {
    orderId: orderId,
    stage: stage,
    model: model,
    input: input,
    output: output,
    explanation: explanation.substring(0, 1000) // Ensure max length
  };
}

