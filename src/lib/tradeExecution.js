import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Execute a trade via WEEX API through Cloud Function
 * @param {string} opportunityId - Opportunity document ID
 * @param {number} tradeSize - Trade size in USDT (default: 10)
 * @returns {Promise<object>} Trade execution result
 */
export async function executeTrade(opportunityId, tradeSize = 10) {
  try {
    const executeTradeFunction = httpsCallable(functions, 'executeTrade');

    const result = await executeTradeFunction({
      opportunityId,
      tradeSize
    });

    return result.data;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
}

/**
 * Get account balance from WEEX
 * @returns {Promise<object>} Account balance data
 */
export async function getAccountBalance() {
  try {
    const getBalanceFunction = httpsCallable(functions, 'getAccountBalance');

    const result = await getBalanceFunction();
    return result.data;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
}

