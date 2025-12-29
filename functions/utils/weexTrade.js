import axios from 'axios';
import { getWeeXHeaders } from './weexAuth.js';

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';

/**
 * Place an order on WEEX exchange
 * @param {object} orderParams - Order parameters
 * @param {string} orderParams.symbol - Trading pair symbol (e.g., 'cmt_btcusdt')
 * @param {string} orderParams.side - Order side ('buy' or 'sell')
 * @param {string} orderParams.type - Order type ('market' or 'limit')
 * @param {number} orderParams.size - Order size
 * @param {number} orderParams.price - Order price (required for limit orders)
 * @returns {Promise<object>} Order response
 */
export async function placeWeeXOrder(orderParams) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/order';
    const body = {
      symbol: orderParams.symbol,
      side: orderParams.side,
      type: orderParams.type,
      size: orderParams.size.toString()
    };

    if (orderParams.type === 'limit' && orderParams.price) {
      body.price = orderParams.price.toString();
    }

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, {
      headers
    });

    if (response.data && response.data.code === 0) {
      return {
        success: true,
        orderId: response.data.data?.orderId,
        data: response.data.data
      };
    }

    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    console.error('Error placing WEEX order:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get account balance from WEEX
 * @returns {Promise<object>} Account balance data
 */
export async function getWeeXBalance() {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/account/balance';
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      headers
    });

    if (response.data && response.data.code === 0) {
      return {
        success: true,
        data: response.data.data
      };
    }

    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    console.error('Error fetching WEEX balance:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get order status from WEEX
 * @param {string} orderId - Order ID
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Order status data
 */
export async function getWeeXOrderStatus(orderId, symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/trade/order?orderId=${orderId}&symbol=${symbol}`;
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

    const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, {
      headers
    });

    if (response.data && response.data.code === 0) {
      return {
        success: true,
        data: response.data.data
      };
    }

    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    console.error('Error fetching WEEX order status:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel an order on WEEX
 * @param {string} orderId - Order ID
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Cancel response
 */
export async function cancelWeeXOrder(orderId, symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/cancel';
    const body = {
      orderId: orderId,
      symbol: symbol
    };

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, {
      headers
    });

    if (response.data && response.data.code === 0) {
      return {
        success: true,
        data: response.data.data
      };
    }

    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    console.error('Error canceling WEEX order:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get history orders
 * @param {object} params - Query parameters
 * @param {string} params.symbol - Trading pair symbol
 * @param {number} params.limit - Number of records
 * @returns {Promise<object>} History orders data
 */
export async function getHistoryOrders(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    let requestPath = `/capi/v2/trade/orders/history?symbol=${params.symbol}`;
    if (params.limit) requestPath += `&limit=${params.limit}`;

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

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
 * Get current orders
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Current orders data
 */
export async function getCurrentOrders(symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/trade/orders/current?symbol=${symbol}`;
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

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
 * Get fills (trade history)
 * @param {object} params - Query parameters
 * @param {string} params.symbol - Trading pair symbol
 * @param {number} params.limit - Number of records
 * @returns {Promise<object>} Fills data
 */
export async function getFills(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    let requestPath = `/capi/v2/trade/fills?symbol=${params.symbol}`;
    if (params.limit) requestPath += `&limit=${params.limit}`;

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

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
 * Place trigger order
 * @param {object} params - Trigger order parameters
 * @returns {Promise<object>} Trigger order result
 */
export async function placeTriggerOrder(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/trigger/order';
    const body = {
      symbol: params.symbol,
      side: params.side,
      triggerPrice: params.triggerPrice.toString(),
      size: params.size.toString()
    };

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancel trigger order
 * @param {string} orderId - Trigger order ID
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Cancel result
 */
export async function cancelTriggerOrder(orderId, symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/trigger/cancel';
    const body = {
      orderId: orderId,
      symbol: symbol
    };

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current plan orders (trigger orders)
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} Current plan orders
 */
export async function getCurrentPlanOrders(symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/trade/trigger/orders/current?symbol=${symbol}`;
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

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
 * Get history plan orders
 * @param {object} params - Query parameters
 * @param {string} params.symbol - Trading pair symbol
 * @param {number} params.limit - Number of records
 * @returns {Promise<object>} History plan orders
 */
export async function getHistoryPlanOrders(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    let requestPath = `/capi/v2/trade/trigger/orders/history?symbol=${params.symbol}`;
    if (params.limit) requestPath += `&limit=${params.limit}`;

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);

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
 * Close all positions
 * @param {string} symbol - Trading pair symbol (optional, if not provided closes all)
 * @returns {Promise<object>} Close positions result
 */
export async function closeAllPositions(symbol = null) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/closeAll';
    const body = symbol ? { symbol } : {};

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancel all orders
 * @param {string} symbol - Trading pair symbol (optional, if not provided cancels all)
 * @returns {Promise<object>} Cancel all orders result
 */
export async function cancelAllOrders(symbol = null) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/cancelAll';
    const body = symbol ? { symbol } : {};

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Place TP/SL order (Take Profit/Stop Loss)
 * @param {object} params - TP/SL order parameters
 * @returns {Promise<object>} TP/SL order result
 */
export async function placeTPSLOrder(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/tpsl/order';
    const body = {
      symbol: params.symbol,
      side: params.side,
      tpPrice: params.tpPrice?.toString(),
      slPrice: params.slPrice?.toString(),
      size: params.size.toString()
    };

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Modify TP/SL order
 * @param {object} params - TP/SL modification parameters
 * @returns {Promise<object>} Modification result
 */
export async function modifyTPSLOrder(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/trade/tpsl/modify';
    const body = {
      orderId: params.orderId,
      symbol: params.symbol,
      tpPrice: params.tpPrice?.toString(),
      slPrice: params.slPrice?.toString()
    };

    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'POST', requestPath, body);

    const response = await axios.post(`${WEEX_API_DOMAIN}${requestPath}`, body, { headers });
    
    if (response.data && response.data.code === 0) {
      return { success: true, data: response.data.data };
    }
    throw new Error(`WEEX API error: ${response.data?.msg || 'Unknown error'}`);
  } catch (error) {
    return { success: false, error: error.message };
  }
}

