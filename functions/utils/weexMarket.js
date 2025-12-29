import axios from 'axios';
import { getWeeXHeaders } from './weexAuth.js';

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';

/**
 * Get server time from WEEX
 * @returns {Promise<object>} Server time data
 */
export async function getServerTime() {
  try {
    const requestPath = '/capi/v2/market/time';
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get futures information
 * @returns {Promise<object>} Futures information
 */
export async function getFuturesInformation() {
  try {
    const requestPath = '/capi/v2/market/instruments';
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get order book depth
 * @param {string} symbol - Trading pair symbol
 * @param {number} limit - Depth limit (optional)
 * @returns {Promise<object>} Order book data
 */
export async function getOrderBookDepth(symbol, limit = 20) {
  try {
    const requestPath = `/capi/v2/market/depth?symbol=${symbol}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all tickers
 * @returns {Promise<object>} All ticker data
 */
export async function getAllTickers() {
  try {
    const requestPath = '/capi/v2/market/tickers';
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get single ticker (already exists in priceScanner, but keeping for consistency)
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Ticker data
 */
export async function getSingleTicker(symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    // Market endpoints may be public, but using auth for consistency
    const requestPath = `/capi/v2/market/ticker?symbol=${symbol}`;
    
    let headers = {};
    if (apiKey && secretKey && passphrase) {
      headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);
    }

    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get trades
 * @param {string} symbol - Trading pair symbol
 * @param {number} limit - Number of trades to return
 * @returns {Promise<object>} Trades data
 */
export async function getTrades(symbol, limit = 100) {
  try {
    const requestPath = `/capi/v2/market/trades?symbol=${symbol}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get candlestick data
 * @param {string} symbol - Trading pair symbol
 * @param {string} interval - Time interval (1m, 5m, 15m, 30m, 1h, 4h, 1d)
 * @param {number} limit - Number of candles
 * @returns {Promise<object>} Candlestick data
 */
export async function getCandlestickData(symbol, interval = '1h', limit = 100) {
  try {
    const requestPath = `/capi/v2/market/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get cryptocurrency index
 * @param {string} symbol - Index symbol
 * @returns {Promise<object>} Index data
 */
export async function getCryptocurrencyIndex(symbol) {
  try {
    const requestPath = `/capi/v2/market/index?symbol=${symbol}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get open interest
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Open interest data
 */
export async function getOpenInterest(symbol) {
  try {
    const requestPath = `/capi/v2/market/openInterest?symbol=${symbol}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get next funding time
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Next funding time data
 */
export async function getNextFundingTime(symbol) {
  try {
    const requestPath = `/capi/v2/market/fundingTime?symbol=${symbol}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get historical funding rates
 * @param {string} symbol - Trading pair symbol
 * @param {number} limit - Number of records
 * @returns {Promise<object>} Historical funding rates
 */
export async function getHistoricalFundingRates(symbol, limit = 100) {
  try {
    const requestPath = `/capi/v2/market/fundingRate/history?symbol=${symbol}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current funding rate
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Current funding rate
 */
export async function getCurrentFundingRate(symbol) {
  try {
    const requestPath = `/capi/v2/market/fundingRate/current?symbol=${symbol}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

