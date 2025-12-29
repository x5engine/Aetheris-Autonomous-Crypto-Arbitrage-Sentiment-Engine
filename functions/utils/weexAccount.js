import axios from 'axios';
import { getWeeXHeaders } from './weexAuth.js';

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';

/**
 * Get account list
 * @returns {Promise<object>} Account list data
 */
export async function getAccountList() {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/account/list';
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
 * Get single account
 * @param {string} accountId - Account ID
 * @returns {Promise<object>} Account data
 */
export async function getSingleAccount(accountId) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/account/get?accountId=${accountId}`;
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
 * Get account assets
 * @param {string} accountId - Account ID
 * @returns {Promise<object>} Account assets data
 */
export async function getAccountAssets(accountId) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/account/assets?accountId=${accountId}`;
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
 * Get contract account bills
 * @param {object} params - Query parameters
 * @param {string} params.accountId - Account ID
 * @param {string} params.symbol - Trading pair (optional)
 * @param {number} params.limit - Number of records (optional)
 * @returns {Promise<object>} Account bills data
 */
export async function getContractAccountBills(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    let requestPath = `/capi/v2/account/bills?accountId=${params.accountId}`;
    if (params.symbol) requestPath += `&symbol=${params.symbol}`;
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
 * Get user settings of one single futures
 * @param {string} symbol - Trading pair symbol
 * @returns {Promise<object>} User settings data
 */
export async function getUserSettingsOfFutures(symbol) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/account/settings?symbol=${symbol}`;
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
 * Change leverage
 * @param {object} params - Leverage parameters
 * @param {string} params.symbol - Trading pair symbol
 * @param {number} params.leverage - Leverage value
 * @returns {Promise<object>} Change leverage result
 */
export async function changeLeverage(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/account/leverage';
    const body = {
      symbol: params.symbol,
      leverage: params.leverage.toString()
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
 * Adjust position margin
 * @param {object} params - Margin adjustment parameters
 * @param {string} params.symbol - Trading pair symbol
 * @param {string} params.side - Position side (long/short)
 * @param {string} params.amount - Adjustment amount
 * @param {string} params.type - Adjustment type
 * @returns {Promise<object>} Margin adjustment result
 */
export async function adjustPositionMargin(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/account/margin';
    const body = {
      symbol: params.symbol,
      side: params.side,
      amount: params.amount,
      type: params.type
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
 * Automatic margin top-up
 * @param {object} params - Top-up parameters
 * @param {string} params.symbol - Trading pair symbol
 * @param {boolean} params.autoTopUp - Enable/disable auto top-up
 * @returns {Promise<object>} Top-up result
 */
export async function automaticMarginTopUp(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/account/autoTopUp';
    const body = {
      symbol: params.symbol,
      autoTopUp: params.autoTopUp
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
 * Get all positions
 * @param {string} accountId - Account ID
 * @returns {Promise<object>} All positions data
 */
export async function getAllPositions(accountId) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/account/positions?accountId=${accountId}`;
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
 * Get single position
 * @param {object} params - Position parameters
 * @param {string} params.accountId - Account ID
 * @param {string} params.symbol - Trading pair symbol
 * @returns {Promise<object>} Position data
 */
export async function getSinglePosition(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = `/capi/v2/account/position?accountId=${params.accountId}&symbol=${params.symbol}`;
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
 * Modify user account mode
 * @param {object} params - Account mode parameters
 * @param {string} params.mode - Account mode
 * @returns {Promise<object>} Account mode change result
 */
export async function modifyUserAccountMode(params) {
  try {
    const apiKey = process.env.WEEX_API_KEY;
    const secretKey = process.env.WEEX_SECRET_KEY;
    const passphrase = process.env.WEEX_PASSPHRASE;

    if (!apiKey || !secretKey || !passphrase) {
      throw new Error('WEEX API credentials not configured');
    }

    const requestPath = '/capi/v2/account/mode';
    const body = {
      mode: params.mode
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

