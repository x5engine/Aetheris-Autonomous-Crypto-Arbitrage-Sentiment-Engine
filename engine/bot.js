#!/usr/bin/env node
// nvm use 20

/**
 * Aetheris VPS Bot
 * Polls WEEX API and writes market data to Firestore
 * Runs continuously on Hetzner VPS with static IP
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  fetchWeeXTicker,
  fetchMultipleTickers,
  getOrderBook,
  getAccountBalance,
  getRecentTrades,
  getOpenInterest,
  getFundingRate,
  placeTriggerOrder,
  placeMarketOrder
} from './utils/weexApi.js';
import { calculateSpread, isProfitable, calculateProjectedProfit, calculateRiskLevel } from './utils/math.js';
import { backendAIService } from './utils/aiService.js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from both engine and root directories
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '..', '.env') });

// Initialize Firebase Admin with service account
let db;
try {
  const serviceAccountPath = join(__dirname, 'service-account.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  db = getFirestore();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.error('   Make sure service-account.json exists in engine/ directory');
  process.exit(1);
}

// Configuration
const POLL_INTERVAL = 3000; // 3 seconds as per requirements
const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_bnbusdt'];
const MIN_SPREAD_PCT = 1.0; // Minimum 1% spread to trigger alert

// Simulated second exchange prices (in production, fetch from another exchange)
const SIMULATED_EXCHANGE_PRICES = {};

/**
 * Main polling loop
 */
async function pollMarketData() {
  console.log(`[${new Date().toISOString()}] Starting market data poll...`);

  try {
    // Fetch prices from WEEX
    const weexPrices = await fetchMultipleTickers(SYMBOLS);
    
    if (Object.keys(weexPrices).length === 0) {
      console.warn('⚠️  No prices fetched from WEEX');
      return;
    }

    // Update live_feed collection
    for (const [symbol, price] of Object.entries(weexPrices)) {
      const asset = symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
      const docId = `${asset}_USDT`;
      
      // Simulate second exchange price (add small random variation)
      // In production, fetch from Binance/Coinbase/etc
      if (!SIMULATED_EXCHANGE_PRICES[docId]) {
        SIMULATED_EXCHANGE_PRICES[docId] = price * (1 + (Math.random() * 0.02 - 0.01));
      } else {
        // Add slight variation to simulate real market
        SIMULATED_EXCHANGE_PRICES[docId] = price * (1 + (Math.random() * 0.02 - 0.01));
      }

      const otherPrice = SIMULATED_EXCHANGE_PRICES[docId];
      const spread = calculateSpread(price, otherPrice);

      // Write to live_feed collection
      await db.collection('live_feed').doc(docId).set({
        docId: docId,
        price: price,
        exchange: 'WEEX',
        other_exchange_price: otherPrice,
        spread_pct: spread,
        last_updated: new Date(),
        symbol: symbol
      }, { merge: true });

      console.log(`📊 ${docId}: WEEX=${price.toFixed(2)}, Other=${otherPrice.toFixed(2)}, Spread=${spread.toFixed(2)}%`);

      // Check for arbitrage opportunity
      if (isProfitable(spread, MIN_SPREAD_PCT)) {
        const projectedProfit = calculateProjectedProfit(spread, 100); // 100 USDT default
        const riskLevel = calculateRiskLevel(spread);

        // Create alert
        const alertRef = await db.collection('alerts').add({
          type: 'ARBITRAGE',
          spread: spread,
          buy_at: price < otherPrice ? 'WEEX' : 'OTHER',
          sell_at: price < otherPrice ? 'OTHER' : 'WEEX',
          weex_price: price,
          other_price: otherPrice,
          projected_profit: projectedProfit,
          risk_level: riskLevel,
          status: 'PENDING',
          symbol: symbol,
          asset: asset,
          volume_24h: 0, // Will be updated when trades execute
          auto_execute: true, // Enable auto-execution for approved trades
          created_at: new Date(),
          timestamp: new Date().toISOString()
        });

        console.log(`🚨 ARBITRAGE ALERT: ${docId} - Spread: ${spread.toFixed(2)}%, Profit: $${projectedProfit.toFixed(2)}`);
        console.log(`   Alert ID: ${alertRef.id}`);
      }
    }

    console.log(`✅ Poll complete at ${new Date().toISOString()}\n`);
  } catch (error) {
    console.error('❌ Error in polling loop:', error);
    
    // Log error to Firestore
    try {
      await db.collection('alerts').add({
        type: 'ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        created_at: new Date()
      });
    } catch (logError) {
      console.error('Failed to log error to Firestore:', logError);
    }
  }
}

/**
 * Poll order book data (every 30 seconds)
 */
async function pollOrderBooks() {
  try {
    for (const symbol of SYMBOLS) {
      const result = await getOrderBook(symbol, 20);
      if (result.success && result.data) {
        const asset = symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
        await db.collection('order_books').doc(symbol).set({
          symbol,
          asset: `${asset}_USDT`,
          bids: result.data.bids || [],
          asks: result.data.asks || [],
          timestamp: new Date(),
          last_updated: new Date()
        }, { merge: true });
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error('❌ Error polling order books:', error.message);
  }
}

/**
 * Poll recent trades (every 30 seconds)
 */
async function pollRecentTrades() {
  try {
    for (const symbol of SYMBOLS) {
      const result = await getRecentTrades(symbol, 20);
      if (result.success && result.data) {
        const asset = symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
        await db.collection('recent_trades').doc(symbol).set({
          symbol,
          asset: `${asset}_USDT`,
          trades: Array.isArray(result.data) ? result.data : (result.data.trades || []),
          timestamp: new Date(),
          last_updated: new Date()
        }, { merge: true });
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error('❌ Error polling recent trades:', error.message);
  }
}

/**
 * Poll open interest (every 60 seconds)
 */
async function pollOpenInterest() {
  try {
    for (const symbol of SYMBOLS) {
      const result = await getOpenInterest(symbol);
      if (result.success && result.data) {
        const asset = symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
        await db.collection('open_interest').doc(symbol).set({
          symbol,
          asset: `${asset}_USDT`,
          openInterest: result.data.openInterest || result.data.open_interest || 0,
          timestamp: new Date(),
          last_updated: new Date()
        }, { merge: true });
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error('❌ Error polling open interest:', error.message);
  }
}

/**
 * Poll funding rates (every 60 seconds)
 */
async function pollFundingRates() {
  try {
    for (const symbol of SYMBOLS) {
      const result = await getFundingRate(symbol);
      if (result.success && result.data) {
        const asset = symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
        await db.collection('funding_rates').doc(symbol).set({
          symbol,
          asset: `${asset}_USDT`,
          fundingRate: result.data.fundingRate || result.data.funding_rate || 0,
          nextFundingTime: result.data.nextFundingTime || result.data.next_funding_time || null,
          timestamp: new Date(),
          last_updated: new Date()
        }, { merge: true });
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error('❌ Error polling funding rates:', error.message);
  }
}

/**
 * Poll account balance (every 60 seconds, if credentials available)
 */
async function pollAccountBalance() {
  try {
    const accountId = process.env.WEEX_ACCOUNT_ID || 'default';
    const result = await getAccountBalance(accountId);
    if (result.success && result.data) {
      await db.collection('account_balance').doc('main').set({
        accountId,
        available: result.data.available || 0,
        margin: result.data.margin || 0,
        total: result.data.total || (result.data.available || 0) + (result.data.margin || 0),
        assets: result.data.assets || [],
        timestamp: new Date(),
        last_updated: new Date()
      }, { merge: true });
      console.log(`💰 Account balance updated: $${((result.data.available || 0) + (result.data.margin || 0)).toFixed(2)}`);
    }
  } catch (error) {
    // Silently fail if credentials not configured
    if (!error.message.includes('credentials not configured')) {
      console.error('❌ Error polling account balance:', error.message);
    }
  }
}

/**
 * Process pending alerts with AI analysis
 */
async function processPendingAlerts() {
  try {
    // Get pending alerts that need AI analysis
    const pendingAlerts = await db.collection('alerts')
      .where('status', '==', 'PENDING')
      .limit(5) // Process up to 5 at a time
      .get();

    if (pendingAlerts.empty) {
      return;
    }

    console.log(`🤖 [AI] Processing ${pendingAlerts.size} pending alerts...`);

    for (const alertDoc of pendingAlerts.docs) {
      const alert = { id: alertDoc.id, ...alertDoc.data() };
      
      try {
        // Update status to ANALYZING
        await db.collection('alerts').doc(alert.id).update({
          status: 'ANALYZING'
        });

        console.log(`🤖 [AI] Analyzing alert ${alert.id} for ${alert.asset || alert.symbol}...`);

        // Analyze with AI
        const analysis = await backendAIService.analyzeOpportunity(alert, [
          `Market spread: ${alert.spread?.toFixed(2)}%`,
          `Risk level: ${alert.risk_level}`,
          `Projected profit: $${alert.projected_profit?.toFixed(2)}`
        ]);

        // Determine approval
        const approval = analysis.recommendation === 'APPROVE' || 
                        (analysis.sentiment_score > 0.3 && analysis.confidence > 0.6);

        // Update alert with AI analysis
        await db.collection('alerts').doc(alert.id).update({
          status: approval ? 'APPROVED' : 'REJECTED',
          ai_validation: {
            sentiment_score: analysis.sentiment_score,
            confidence: analysis.confidence,
            reasoning: analysis.reasoning,
            recommendation: analysis.recommendation
          },
          analyzed_at: new Date()
        });

        console.log(`✅ [AI] Alert ${alert.id} analyzed:`);
        console.log(`   📊 Sentiment: ${analysis.sentiment_score.toFixed(2)}`);
        console.log(`   🎯 Confidence: ${analysis.confidence.toFixed(2)}`);
        console.log(`   💡 Recommendation: ${analysis.recommendation}`);
        console.log(`   📝 Reasoning: ${analysis.reasoning.substring(0, 100)}...`);
        console.log(`   ✅ Status: ${approval ? 'APPROVED' : 'REJECTED'}`);

        // If AI approves, immediately execute the trade
        if (approval) {
          // Check if any user has auto-execute enabled
          const userPrefsSnapshot = await db.collection('user_preferences')
            .where('auto_execute_enabled', '==', true)
            .limit(1)
            .get();

          if (!userPrefsSnapshot.empty) {
            // Get the most permissive risk level
            const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
            let maxAllowedRisk = 'LOW';
            userPrefsSnapshot.forEach(doc => {
              const prefs = doc.data();
              const userRisk = prefs.auto_execute_max_risk || 'MEDIUM';
              const userRiskIndex = riskLevels.indexOf(userRisk);
              const currentRiskIndex = riskLevels.indexOf(maxAllowedRisk);
              if (userRiskIndex > currentRiskIndex) {
                maxAllowedRisk = userRisk;
              }
            });

            // Check if alert's risk level is within permitted range
            const riskLevelOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
            const alertRiskIndex = riskLevelOrder[alert.risk_level] || 2;
            const maxRiskIndex = riskLevelOrder[maxAllowedRisk];

            if (alertRiskIndex <= maxRiskIndex) {
              console.log(`🚀 [AI-EXECUTE] AI approved trade! Executing immediately...`);
              
              try {
                // Get current price to calculate order size
                const currentPriceResult = await fetchWeeXTicker(alert.symbol);
                if (!currentPriceResult.success || !currentPriceResult.price) {
                  console.warn(`⚠️  [AI-EXECUTE] Could not fetch price for ${alert.symbol}, skipping execution`);
                  continue;
                }

                const currentPrice = currentPriceResult.price;
                const tradeValue = alert.requested_trade_size || 10; // Default 10 USDT
                const orderSize = tradeValue / currentPrice;
                
                // Round to 6 decimal places
                const roundedSize = Math.round(orderSize * 1000000) / 1000000;

                if (roundedSize < 0.000001) {
                  console.warn(`⚠️  [AI-EXECUTE] Order size too small (${roundedSize}), skipping`);
                  continue;
                }

                // Determine order side based on arbitrage direction
                const side = alert.buy_at === 'WEEX' ? 'buy' : 'sell';
                const accountId = process.env.WEEX_ACCOUNT_ID || process.env.ACCOUNT_ID || 'default';

                console.log(`📊 [AI-EXECUTE] Placing market order:`);
                console.log(`   Symbol: ${alert.symbol}`);
                console.log(`   Side: ${side}`);
                console.log(`   Size: ${roundedSize} contracts (~$${tradeValue} USDT)`);
                console.log(`   Price: $${currentPrice.toFixed(2)}`);

                // Place market order immediately
                const orderResult = await placeMarketOrder({
                  symbol: alert.symbol,
                  side: side,
                  size: roundedSize,
                  accountId: accountId
                });

                if (orderResult.success) {
                  // Update alert to EXECUTED
                  await db.collection('alerts').doc(alert.id).update({
                    status: 'EXECUTED',
                    order_id: orderResult.orderId,
                    executed_at: new Date(),
                    execution_method: 'AI_AUTO_MARKET_ORDER',
                    execution_price: currentPrice,
                    execution_size: roundedSize
                  });

                  console.log(`✅ [AI-EXECUTE] Trade executed successfully!`);
                  console.log(`   Order ID: ${orderResult.orderId}`);
                  console.log(`   Method: AI Auto-Execute (Market Order)`);
                } else {
                  console.error(`❌ [AI-EXECUTE] Order placement failed: ${orderResult.error}`);
                  // Keep as APPROVED for retry by auto-execute function
                  await db.collection('alerts').doc(alert.id).update({
                    execution_error: orderResult.error,
                    execution_attempts: 1
                  });
                }
              } catch (error) {
                console.error(`❌ [AI-EXECUTE] Error executing trade: ${error.message}`);
                // Keep as APPROVED for retry
                await db.collection('alerts').doc(alert.id).update({
                  execution_error: error.message,
                  execution_attempts: 1
                });
              }
            } else {
              console.log(`⚠️  [AI-EXECUTE] Alert risk (${alert.risk_level}) exceeds max permitted risk (${maxAllowedRisk}). Keeping as APPROVED.`);
            }
          } else {
            console.log(`ℹ️  [AI-EXECUTE] No users have auto-execute enabled. Keeping alert as APPROVED.`);
          }
        }
      } catch (error) {
        console.error(`❌ [AI] Error analyzing alert ${alert.id}:`, error.message);
        // Mark as rejected on error
        await db.collection('alerts').doc(alert.id).update({
          status: 'REJECTED',
          ai_validation: {
            sentiment_score: 0,
            confidence: 0.3,
            reasoning: `Error during analysis: ${error.message}`,
            recommendation: 'REJECT'
          },
          analyzed_at: new Date()
        });
      }
    }
  } catch (error) {
    console.error('❌ [AI] Error processing pending alerts:', error);
  }
}

/**
 * Auto-execute APPROVED trades using trigger orders
 * This implements smart contract-like behavior: trades execute automatically when conditions are met
 * Respects user preferences for auto-execute and max risk level
 */
async function autoExecuteApprovedTrades() {
  try {
    // Get all users with auto-execute enabled
    const userPrefsSnapshot = await db.collection('user_preferences')
      .where('auto_execute_enabled', '==', true)
      .get();

    if (userPrefsSnapshot.empty) {
      // No users have auto-execute enabled
      return;
    }

    // Get the most permissive risk level (lowest restriction)
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
    let maxAllowedRisk = 'LOW';
    userPrefsSnapshot.forEach(doc => {
      const prefs = doc.data();
      const userRisk = prefs.auto_execute_max_risk || 'MEDIUM';
      const userRiskIndex = riskLevels.indexOf(userRisk);
      const currentRiskIndex = riskLevels.indexOf(maxAllowedRisk);
      if (userRiskIndex > currentRiskIndex) {
        maxAllowedRisk = userRisk;
      }
    });

    console.log(`⚡ [AUTO-EXECUTE] Users have auto-execute enabled. Max risk level: ${maxAllowedRisk}`);

    // Get APPROVED alerts that match risk criteria
    const approvedAlerts = await db.collection('alerts')
      .where('status', '==', 'APPROVED')
      .where('auto_execute', '==', true)
      .limit(5)
      .get();

    if (approvedAlerts.empty) {
      return;
    }

    // Filter by risk level
    const riskLevelOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    const maxRiskIndex = riskLevelOrder[maxAllowedRisk];
    const eligibleAlerts = approvedAlerts.docs.filter(doc => {
      const alert = doc.data();
      const alertRiskIndex = riskLevelOrder[alert.risk_level] || 2;
      return alertRiskIndex <= maxRiskIndex;
    });

    if (eligibleAlerts.length === 0) {
      return;
    }

    console.log(`⚡ [AUTO-EXECUTE] Processing ${eligibleAlerts.length} eligible alerts (risk <= ${maxAllowedRisk})...`);

    const accountId = process.env.WEEX_ACCOUNT_ID || 'default';

    for (const alertDoc of eligibleAlerts) {
      const alert = { id: alertDoc.id, ...alertDoc.data() };
      
      try {
        // Check if conditions are still met
        const currentPrice = await fetchWeeXTicker(alert.symbol);
        if (!currentPrice.success || !currentPrice.price) {
          console.warn(`⚠️  [AUTO-EXECUTE] Could not fetch current price for ${alert.symbol}`);
          continue;
        }

        // Update status to EXECUTING
        await db.collection('alerts').doc(alert.id).update({
          status: 'EXECUTING',
          execution_started_at: new Date()
        });

        console.log(`⚡ [AUTO-EXECUTE] Executing trade for ${alert.asset || alert.symbol}...`);

        // Determine order side based on arbitrage direction
        const side = alert.buy_at === 'WEEX' ? 'buy' : 'sell';
        const tradeSize = alert.requested_trade_size || 10; // Default 10 USDT

        // Use trigger order for automated execution when price conditions are met
        // Trigger price is the current WEEX price (where we want to buy/sell)
        const triggerResult = await placeTriggerOrder({
          symbol: alert.symbol,
          side: side,
          orderType: 'market', // Market order executes immediately when triggered
          size: tradeSize,
          triggerPrice: alert.weex_price, // Execute when price reaches this level
          accountId: accountId
        });

        if (triggerResult.success) {
          // Update alert with order details
          await db.collection('alerts').doc(alert.id).update({
            status: 'EXECUTED',
            order_id: triggerResult.orderId,
            executed_at: new Date(),
            execution_method: 'AUTO_TRIGGER_ORDER',
            trigger_order_id: triggerResult.orderId
          });

          console.log(`✅ [AUTO-EXECUTE] Trade executed for ${alert.asset || alert.symbol}`);
          console.log(`   Order ID: ${triggerResult.orderId}`);
          console.log(`   Method: Trigger Order (automated)`);
        } else {
          // Fallback to immediate market order if trigger order fails
          console.warn(`⚠️  [AUTO-EXECUTE] Trigger order failed, trying market order...`);
          const marketResult = await placeMarketOrder({
            symbol: alert.symbol,
            side: side,
            size: tradeSize,
            accountId: accountId
          });

          if (marketResult.success) {
            await db.collection('alerts').doc(alert.id).update({
              status: 'EXECUTED',
              order_id: marketResult.orderId,
              executed_at: new Date(),
              execution_method: 'AUTO_MARKET_ORDER'
            });
            console.log(`✅ [AUTO-EXECUTE] Trade executed via market order`);
          } else {
            throw new Error(marketResult.error || 'Market order failed');
          }
        }
      } catch (error) {
        console.error(`❌ [AUTO-EXECUTE] Error executing trade for alert ${alert.id}:`, error.message);
        // Mark as failed but keep APPROVED status for retry
        await db.collection('alerts').doc(alert.id).update({
          status: 'APPROVED',
          execution_error: error.message,
          execution_attempts: (alert.execution_attempts || 0) + 1
        });
      }
    }
  } catch (error) {
    console.error('❌ [AUTO-EXECUTE] Error processing approved trades:', error);
  }
}

/**
 * Start the bot
 */
async function startBot() {
  console.log('🚀 Aetheris VPS Bot Starting...');
  console.log(`📡 Polling interval: ${POLL_INTERVAL}ms (${POLL_INTERVAL/1000}s)`);
  console.log(`📊 Monitoring symbols: ${SYMBOLS.join(', ')}`);
  console.log(`💰 Minimum spread: ${MIN_SPREAD_PCT}%`);
  console.log('');

  // Initialize AI service
  console.log('🤖 Initializing AI Service...');
  try {
    await backendAIService.initialize();
    if (backendAIService.initialized) {
      console.log('✅ AI Service ready for analysis\n');
    } else {
      console.warn('⚠️  AI Service initialization skipped (EMBEDAPI_KEY missing?)');
      console.warn('   Bot will continue without AI analysis\n');
    }
  } catch (error) {
    console.error('❌ AI Service initialization failed:', error.message);
    console.error('   Stack:', error.stack);
    console.warn('   Bot will continue without AI analysis\n');
  }

  // Initial poll
  await pollMarketData();

  // Set up interval for market polling
  setInterval(async () => {
    await pollMarketData();
  }, POLL_INTERVAL);

  // Set up interval for AI analysis (every 10 seconds)
  setInterval(async () => {
    await processPendingAlerts();
  }, 10000);

  // Set up interval for order books (every 30 seconds)
  setInterval(async () => {
    await pollOrderBooks();
  }, 30000);

  // Set up interval for recent trades (every 30 seconds)
  setInterval(async () => {
    await pollRecentTrades();
  }, 30000);

  // Set up interval for open interest (every 60 seconds)
  setInterval(async () => {
    await pollOpenInterest();
  }, 60000);

  // Set up interval for funding rates (every 60 seconds)
  setInterval(async () => {
    await pollFundingRates();
  }, 60000);

  // Set up interval for account balance (every 60 seconds)
  setInterval(async () => {
    await pollAccountBalance();
  }, 60000);

  // Set up interval for auto-execution (every 15 seconds)
  // This checks for APPROVED alerts and executes them automatically using trigger orders
  setInterval(async () => {
    await autoExecuteApprovedTrades();
  }, 15000);

  // Initial polls
  setTimeout(async () => {
    await pollOrderBooks();
    await pollRecentTrades();
    await pollOpenInterest();
    await pollFundingRates();
    await pollAccountBalance();
  }, 5000); // Wait 5 seconds after start

  console.log('✅ Bot is running. Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down bot...');
  process.exit(0);
});

// Start the bot
startBot().catch(error => {
  console.error('❌ Fatal error starting bot:', error);
  process.exit(1);
});

