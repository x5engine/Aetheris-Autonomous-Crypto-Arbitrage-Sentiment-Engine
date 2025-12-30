import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Mark alert for execution (VPS bot will handle actual trade execution)
 * @param {string} alertId - Alert document ID
 * @returns {Promise<object>} Update result
 */
export async function requestTradeExecution(alertId) {
  try {
    // Update alert status to request execution
    // The VPS bot will monitor this and execute the trade
    await updateDoc(doc(db, 'alerts', alertId), {
      status: 'EXECUTING',
      execution_requested_at: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Trade execution requested. VPS bot will process it.'
    };
  } catch (error) {
    console.error('Error requesting trade execution:', error);
    throw error;
  }
}

/**
 * Update alert with AI validation results
 * @param {string} alertId - Alert document ID
 * @param {object} aiValidation - AI validation data
 * @returns {Promise<object>} Update result
 */
export async function updateAIValidation(alertId, aiValidation) {
  try {
    await updateDoc(doc(db, 'alerts', alertId), {
      ai_validation: aiValidation,
      analyzed_at: new Date().toISOString(),
      status: aiValidation.approval ? 'APPROVED' : 'REJECTED'
    });

    return {
      success: true,
      message: 'AI validation updated'
    };
  } catch (error) {
    console.error('Error updating AI validation:', error);
    throw error;
  }
}

