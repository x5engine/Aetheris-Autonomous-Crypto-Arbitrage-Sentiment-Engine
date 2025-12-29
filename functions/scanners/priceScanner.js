import axios from 'axios';
import { getWeeXHeaders } from '../utils/weexAuth.js';
import { calculateSpread, isProfitable, calculateProjectedProfit, calculateRiskLevel } from '../utils/math.js';

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';

/**
 * Fetch ticker price from WEEX API
 * @param {string} symbol - Trading pair symbol (e.g., 'cmt_btcusdt')
 * @returns {Promise<object>} Ticker data
 */
export async function fetchWeeXTicker(symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/market/ticker?symbol=${symbol}`;
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      headers
    });

    if (response.data && response.data.code === 0) {
      return response.data.data;
    }

    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    console.error(`Error fetching WEEX ticker for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Fetch multiple ticker prices for arbitrage comparison
 * @param {string[]} symbols - Array of trading pair symbols
 * @returns {Promise<object>} Map of symbol to price data
 */
export async function fetchMultipleTickers(symbols) {
  const tickers = {};
  
  for (const symbol of symbols) {
    try {
      const ticker = await fetchWeeXTicker(symbol);
      if (ticker && ticker.lastPrice) {
        tickers[symbol] = {
          price: parseFloat(ticker.lastPrice),
          volume: parseFloat(ticker.volume24h || 0),
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error(`Failed to fetch ticker for ${symbol}:`, error.message);
    }
  }

  return tickers;
}

/**
 * Scan for arbitrage opportunities between WEEX and another exchange
 * For demo purposes, we'll compare WEEX prices with a simulated second exchange
 * In production, you would fetch from another exchange API
 * @param {string} symbol - Trading pair symbol
 * @param {number} simulatedPrice - Simulated price from another exchange
 * @returns {Promise<object|null>} Arbitrage opportunity or null
 */
export async function scanArbitrageOpportunity(symbol, simulatedPrice = null) {
  try {
    const weexTicker = await fetchWeeXTicker(symbol);
    
    if (!weexTicker || !weexTicker.lastPrice) {
      return null;
    }

    const weexPrice = parseFloat(weexTicker.lastPrice);
    
    // For demo: use simulated price or add small random variation
    // In production, fetch from another exchange API
    const exchangeBPrice = simulatedPrice || weexPrice * (1 + (Math.random() * 0.02 - 0.01));
    
    const spreadPct = calculateSpread(weexPrice, exchangeBPrice);
    const amount = 100; // Default trade amount in USDT
    const fees = 0.001; // 0.1% fee
    const projectedProfit = calculateProjectedProfit(spreadPct, amount, fees);
    const riskLevel = calculateRiskLevel(spreadPct);

    if (isProfitable(spreadPct, 1.0, amount, fees)) {
      return {
        symbol,
        exchange_a_price: weexPrice,
        exchange_b_price: exchangeBPrice,
        spread_pct: spreadPct,
        projected_profit: projectedProfit,
        risk_level: riskLevel,
        timestamp: new Date().toISOString(),
        volume: parseFloat(weexTicker.volume24h || 0)
      };
    }

    return null;
  } catch (error) {
    console.error(`Error scanning arbitrage for ${symbol}:`, error.message);
    return null;
  }
}

