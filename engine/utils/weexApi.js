import axios from 'axios';
import { getWeeXHeaders } from './weexAuth.js';

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';

/**
 * Fetch ticker price from WEEX API
 */
export async function fetchWeeXTicker(symbol) {
  try {
    // Try public endpoint first (no auth required for market data)
    const requestPath = `/capi/v2/market/ticker?symbol=${symbol}`;
    
    // First try without authentication (public endpoint)
    let response;
    try {
      response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'locale': 'en-US'
        }
      });
    } catch (publicError) {
      // If public fails, try with authentication
      const apiKey = process.env.WEEX_API_KEY;
      const secretKey = process.env.WEEX_SECRET_KEY;
      const passphrase = process.env.WEEX_PASSPHRASE;

      if (!apiKey || !secretKey || !passphrase) {
        throw new Error('WEEX API credentials not configured and public endpoint failed');
      }

      const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);
      response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
        headers,
        timeout: 10000
      });
    }

    // WEEX API returns data directly (not wrapped in {code, msg, data})
    // Response format: { symbol, last, best_ask, best_bid, ... }
    if (response.status === 200 && response.data) {
      // Extract price from 'last' field
      const price = parseFloat(response.data.last || response.data.best_ask || response.data.best_bid || 0);
      
      if (price > 0) {
        return {
          success: true,
          data: response.data,
          price: price
        };
      } else {
        console.error(`WEEX API returned success but no valid price for ${symbol}:`, JSON.stringify(response.data, null, 2));
        throw new Error(`WEEX API error: No valid price in response`);
      }
    }

    // If we get here, something is wrong
    console.error(`WEEX API unexpected response for ${symbol}:`, {
      status: response.status,
      data: response.data
    });
    throw new Error(`WEEX API error: Unexpected response format`);
  } catch (error) {
    // Enhanced error logging
    if (error.response) {
      console.error(`Error fetching WEEX ticker for ${symbol}:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
      return {
        success: false,
        error: `HTTP ${error.response.status}: ${error.response.data?.msg || error.response.data?.message || error.response.statusText || 'Unknown error'}`,
        price: null
      };
    } else if (error.request) {
      console.error(`Error fetching WEEX ticker for ${symbol}: No response received`, {
        message: error.message,
        code: error.code
      });
      return {
        success: false,
        error: `Network error: ${error.message || error.code || 'Connection failed'}`,
        price: null
      };
    } else {
      console.error(`Error fetching WEEX ticker for ${symbol}:`, error.message);
      return {
        success: false,
        error: error.message,
        price: null
      };
    }
  }
}

/**
 * Fetch multiple tickers
 */
export async function fetchMultipleTickers(symbols) {
  const results = {};
  
  for (const symbol of symbols) {
    const result = await fetchWeeXTicker(symbol);
    if (result.success && result.price) {
      results[symbol] = result.price;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Get order book depth (public endpoint)
 */
export async function getOrderBook(symbol, limit = 20) {
  try {
    const requestPath = `/capi/v2/market/depth?symbol=${symbol}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'locale': 'en-US'
      }
    });
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get account balance (private endpoint)
 */
export async function getAccountBalance(accountId) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;
    
    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }
    
    const requestPath = `/capi/v2/account/assets?accountId=${accountId}`;
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      headers,
      timeout: 10000
    });
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error fetching account balance:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get recent trades (public endpoint)
 */
export async function getRecentTrades(symbol, limit = 20) {
  try {
    const requestPath = `/capi/v2/market/trades?symbol=${symbol}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'locale': 'en-US'
      }
    });
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error fetching recent trades for ${symbol}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get open interest (public endpoint)
 */
export async function getOpenInterest(symbol) {
  try {
    const requestPath = `/capi/v2/market/openInterest?symbol=${symbol}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'locale': 'en-US'
      }
    });
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error fetching open interest for ${symbol}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get candlestick data (public endpoint)
 */
export async function getCandles(symbol, interval = '1h', limit = 100) {
  try {
    const requestPath = `/capi/v2/market/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'locale': 'en-US'
      }
    });
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error fetching candles for ${symbol}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current funding rate (public endpoint)
 */
export async function getFundingRate(symbol) {
  try {
    const requestPath = `/capi/v2/market/fundingRate/current?symbol=${symbol}`;
    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'locale': 'en-US'
      }
    });
    
    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data
      };
    }
    
    return {
      success: false,
      error: 'Unexpected response format'
    };
  } catch (error) {
    console.error(`Error fetching funding rate for ${symbol}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

