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

    // Enhanced error logging
    if (response.status !== 200) {
      console.error(`WEEX API HTTP ${response.status} for ${symbol}:`, response.data);
    }

    // Check multiple response code formats
    if (response.data) {
      const code = response.data.code;
      const isSuccess = code === 0 || code === '0' || code === '00000' || code === 200;
      
      if (isSuccess) {
        // Try different price field names
        const price = parseFloat(
          response.data.data?.lastPrice || 
          response.data.data?.price || 
          response.data.data?.last || 
          response.data.lastPrice ||
          response.data.price ||
          0
        );
        
        if (price > 0) {
          return {
            success: true,
            data: response.data.data || response.data,
            price: price
          };
        } else {
          console.error(`WEEX API returned success but no valid price for ${symbol}:`, JSON.stringify(response.data, null, 2));
        }
      }
      
      // Log actual response for debugging
      console.error(`WEEX API response for ${symbol}:`, {
        code: response.data.code,
        msg: response.data.msg || response.data.message,
        data: response.data.data ? 'present' : 'missing'
      });
      
      throw new Error(`WEEX API error: ${response.data.msg || response.data.message || `Code: ${response.data.code}` || 'Unknown error'}`);
    }

    throw new Error(`WEEX API error: Empty response`);
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

