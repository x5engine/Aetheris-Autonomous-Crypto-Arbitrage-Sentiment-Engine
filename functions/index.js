import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { scanArbitrageOpportunity } from './scanners/priceScanner.js';
import { complianceCheck } from './scanners/walletSecurity.js';
import { placeWeeXOrder, getWeeXOrderStatus, getWeeXBalance } from './utils/weexTrade.js';
import { uploadAiLog, generateAiLogFromTrade } from './utils/weexAiLog.js';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

/**
 * Scheduled function to scan for arbitrage opportunities every 60 seconds
 * Uses WEEX API to fetch prices and detect arbitrage opportunities
 */
export const scanArbitrageOpportunities = onSchedule(
  {
    schedule: 'every 60 seconds',
    timeZone: 'UTC',
    memory: '512MiB',
    timeoutSeconds: 540
  },
  async (event) => {
    console.log('Starting arbitrage scan...');

    // Target trading pairs to monitor
    const symbols = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_bnbusdt'];
    const opportunities = [];

    for (const symbol of symbols) {
      try {
        const opportunity = await scanArbitrageOpportunity(symbol);
        
        if (opportunity) {
          // Write market tick data
          await db.collection('market_ticks').add({
            asset: symbol.split('_')[1].replace('usdt', '').toUpperCase(),
            exchange_a_price: opportunity.exchange_a_price,
            exchange_b_price: opportunity.exchange_b_price,
            timestamp: new Date().toISOString(),
            symbol: symbol
          });

          // Create opportunity document
          const opportunityRef = await db.collection('opportunities').add({
            status: 'DETECTED',
            symbol: symbol,
            spread_pct: opportunity.spread_pct,
            projected_profit: opportunity.projected_profit,
            risk_level: opportunity.risk_level,
            exchange_a_price: opportunity.exchange_a_price,
            exchange_b_price: opportunity.exchange_b_price,
            volume: opportunity.volume,
            timestamp: new Date().toISOString(),
            ai_validation: {
              sentiment_score: null, // Will be updated by frontend
              approval: null
            }
          });

          opportunities.push(opportunityRef.id);
          console.log(`Arbitrage opportunity detected for ${symbol}: ${opportunity.spread_pct.toFixed(2)}% spread`);
        }
      } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
        
        // Log error to audit logs
        await db.collection('audit_logs').add({
          action: 'SCAN_ERROR',
          symbol: symbol,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    console.log(`Scan complete. Found ${opportunities.length} opportunities.`);
    return { opportunities: opportunities.length };
  }
);

/**
 * Triggered when a new opportunity is created
 * Performs compliance check and updates opportunity status
 */
export const validateOpportunity = onDocumentCreated(
  {
    document: 'opportunities/{opportunityId}',
    memory: '256MiB'
  },
  async (event) => {
    const opportunity = event.data.data();
    const opportunityId = event.params.opportunityId;

    console.log(`Validating opportunity ${opportunityId}...`);

    try {
      // Perform compliance check
      const compliance = await complianceCheck(opportunity);

      if (!compliance.approved) {
        // Update opportunity status
        await event.data.ref.update({
          status: 'BLOCKED',
          compliance_check: compliance,
          updated_at: new Date().toISOString()
        });

        // Log to audit
        await db.collection('audit_logs').add({
          action: 'TRADE_BLOCKED',
          opportunity_id: opportunityId,
          reason: compliance.checks.walletRisk?.reason || 'Compliance check failed',
          timestamp: new Date().toISOString()
        });

        console.log(`Opportunity ${opportunityId} blocked by compliance check`);
        return;
      }

      // Update opportunity with compliance approval
      await event.data.ref.update({
        compliance_check: compliance,
        updated_at: new Date().toISOString()
      });

      console.log(`Opportunity ${opportunityId} passed compliance check`);
    } catch (error) {
      console.error(`Error validating opportunity ${opportunityId}:`, error);
      
      await db.collection('audit_logs').add({
        action: 'VALIDATION_ERROR',
        opportunity_id: opportunityId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * HTTP callable function to execute a trade via WEEX API
 * This function should be called from the frontend when user confirms trade execution
 */
export const executeTrade = onCall(
  {
    memory: '512MiB',
    timeoutSeconds: 60
  },
  async (request) => {
    const { opportunityId, tradeSize } = request.data;

    if (!opportunityId) {
      throw new Error('Opportunity ID is required');
    }

    try {
      // Get opportunity from Firestore
      const opportunityDoc = await db.collection('opportunities').doc(opportunityId).get();
      
      if (!opportunityDoc.exists) {
        throw new Error('Opportunity not found');
      }

      const opportunity = opportunityDoc.data();

      // Validate opportunity is ready for execution
      if (opportunity.status !== 'ANALYZING' && opportunity.status !== 'DETECTED') {
        throw new Error(`Opportunity status ${opportunity.status} is not executable`);
      }

      if (!opportunity.ai_validation?.approval) {
        throw new Error('Opportunity not approved by AI validation');
      }

      // Determine order side based on price difference
      const weexPrice = opportunity.exchange_a_price;
      const otherPrice = opportunity.exchange_b_price;
      const side = weexPrice < otherPrice ? 'buy' : 'sell';
      const size = tradeSize || 10; // Default 10 USDT

      // Place order on WEEX
      const orderResult = await placeWeeXOrder({
        symbol: opportunity.symbol,
        side: side,
        type: 'market', // Use market order for immediate execution
        size: size
      });

      if (!orderResult.success) {
        throw new Error(`Failed to place order: ${orderResult.error}`);
      }

      // Update opportunity status
      await db.collection('opportunities').doc(opportunityId).update({
        status: 'EXECUTED',
        executed_at: new Date().toISOString(),
        order_id: orderResult.orderId,
        trade_size: size,
        trade_side: side
      });

      // Log to audit
      await db.collection('audit_logs').add({
        action: 'TRADE_EXECUTED',
        opportunity_id: opportunityId,
        order_id: orderResult.orderId,
        symbol: opportunity.symbol,
        trade_size: size,
        trade_side: side,
        projected_profit: opportunity.projected_profit,
        timestamp: new Date().toISOString()
      });

      // Upload AI log for compliance (required for AI Wars)
      try {
        const aiLogData = generateAiLogFromTrade(
          opportunity,
          {
            sentiment_score: opportunity.ai_validation?.sentiment_score || 0,
            confidence: opportunity.ai_validation?.confidence || 0,
            approval: opportunity.ai_validation?.approval || false,
            reasoning: 'AI sentiment analysis approved trade execution',
            headlines: [] // Could be populated from actual news sources
          },
          orderResult.orderId
        );

        const aiLogResult = await uploadAiLog(aiLogData);
        
        if (aiLogResult.success) {
          console.log(`AI log uploaded successfully for order ${orderResult.orderId}`);
          
          // Update opportunity with AI log upload status
          await db.collection('opportunities').doc(opportunityId).update({
            ai_log_uploaded: true,
            ai_log_uploaded_at: new Date().toISOString()
          });
        } else {
          console.warn(`Failed to upload AI log: ${aiLogResult.error}`);
          // Log warning but don't fail the trade
        }
      } catch (aiLogError) {
        console.error('Error uploading AI log:', aiLogError);
        // Log error but don't fail the trade execution
      }

      return {
        success: true,
        orderId: orderResult.orderId,
        message: 'Trade executed successfully'
      };
    } catch (error) {
      console.error('Error executing trade:', error);

      // Log error to audit
      await db.collection('audit_logs').add({
        action: 'TRADE_EXECUTION_ERROR',
        opportunity_id: opportunityId,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }
);

/**
 * HTTP callable function to get account balance from WEEX
 */
export const getAccountBalance = onCall(
  {
    memory: '256MiB',
    timeoutSeconds: 30
  },
  async (request) => {
    try {
      const balanceResult = await getWeeXBalance();

      if (!balanceResult.success) {
        throw new Error(`Failed to fetch balance: ${balanceResult.error}`);
      }

      return {
        success: true,
        data: balanceResult.data
      };
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }
);

