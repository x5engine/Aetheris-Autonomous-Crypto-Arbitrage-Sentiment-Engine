#!/usr/bin/env node
// nvm use 20

/**
 * Aetheris Local Bot (for testing)
 * Generates test arbitrage data and writes to Firestore Emulator
 * Use this for local development and testing
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { backendAIService } from './utils/aiService.js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set Firestore emulator host if using emulator
if (process.env.USE_EMULATOR !== 'false') {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8090';
  console.log('🔧 Setting FIRESTORE_EMULATOR_HOST=127.0.0.1:8090');
}

// Initialize Firebase Admin
let db;
try {
  // Try to use service account if available, otherwise use default credentials
  const serviceAccountPath = join(__dirname, 'service-account.json');
  
  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'hackathon-project-245ba'
    });
    console.log('✅ Firebase Admin initialized with service account');
  } else {
    // Use default credentials (for emulator)
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'hackathon-project-245ba'
    });
    console.log('✅ Firebase Admin initialized with default credentials');
  }
  
  db = getFirestore();
  
  if (process.env.USE_EMULATOR !== 'false') {
    console.log('✅ Will connect to Firestore Emulator (127.0.0.1:8090)');
  } else {
    console.log('✅ Will connect to production Firestore');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// Configuration
const POLL_INTERVAL = 3000; // 3 seconds
const SYMBOLS = ['cmt_btcusdt', 'cmt_ethusdt', 'cmt_bnbusdt', 'cmt_solusdt', 'cmt_adausdt'];
const MIN_SPREAD_PCT = 1.0;

// Test data generator - simulates market prices
const BASE_PRICES = {
  'cmt_btcusdt': 42000,
  'cmt_ethusdt': 2500,
  'cmt_bnbusdt': 300,
  'cmt_solusdt': 100,
  'cmt_adausdt': 0.5
};

const SIMULATED_EXCHANGE_PRICES = {};

/**
 * Generate test price data
 */
function generateTestPrice(symbol) {
  const basePrice = BASE_PRICES[symbol] || 100;
  // Add random variation (-2% to +2%)
  const variation = (Math.random() * 0.04 - 0.02);
  return basePrice * (1 + variation);
}

/**
 * Calculate spread percentage
 */
function calculateSpread(price1, price2) {
  return Math.abs((price1 - price2) / Math.min(price1, price2)) * 100;
}

/**
 * Check if spread is profitable
 */
function isProfitable(spread, minSpread) {
  return spread >= minSpread;
}

/**
 * Calculate projected profit
 */
function calculateProjectedProfit(spread, tradeSize) {
  return (tradeSize * spread) / 100;
}

/**
 * Calculate risk level
 */
function calculateRiskLevel(spread) {
  if (spread >= 3) return 'LOW';
  if (spread >= 1.5) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Main polling loop - generates test data
 */
async function pollMarketData() {
  console.log(`[${new Date().toISOString()}] Generating test market data...`);

  try {
    // Generate test prices for each symbol
    for (const symbol of SYMBOLS) {
      const asset = symbol.replace('cmt_', '').replace('usdt', '').toUpperCase();
      const docId = `${asset}_USDT`;
      
      // Generate WEEX price
      const weexPrice = generateTestPrice(symbol);
      
      // Generate other exchange price with intentional spread
      if (!SIMULATED_EXCHANGE_PRICES[docId]) {
        // Start with a price that might create arbitrage
        SIMULATED_EXCHANGE_PRICES[docId] = weexPrice * (1 + (Math.random() * 0.03 - 0.015));
      } else {
        // Add variation, sometimes creating arbitrage opportunities
        const spreadDirection = Math.random() > 0.5 ? 1 : -1;
        const spreadAmount = (Math.random() * 0.03) * spreadDirection;
        SIMULATED_EXCHANGE_PRICES[docId] = weexPrice * (1 + spreadAmount);
      }

      const otherPrice = SIMULATED_EXCHANGE_PRICES[docId];
      const spread = calculateSpread(weexPrice, otherPrice);

      // Generate random 24h volume for testing
      const volume_24h = Math.random() * 1000000 + 50000; // 50k - 1M

      // Write to live_feed collection
      await db.collection('live_feed').doc(docId).set({
        docId: docId,
        price: weexPrice,
        asset: asset,
        exchange: 'WEEX',
        other_exchange_price: otherPrice,
        spread_pct: spread,
        last_updated: new Date(),
        symbol: symbol,
        volume_24h: volume_24h
      }, { merge: true });

      console.log(`📊 ${docId}: WEEX=$${weexPrice.toFixed(2)}, Other=$${otherPrice.toFixed(2)}, Spread=${spread.toFixed(2)}%`);

      // Check for arbitrage opportunity (randomly create some to test)
      // Force create an opportunity every 5-10 polls for testing
      const shouldCreateAlert = isProfitable(spread, MIN_SPREAD_PCT) || Math.random() > 0.85;

      if (shouldCreateAlert) {
        // Ensure spread is profitable for the alert
        const alertSpread = spread >= MIN_SPREAD_PCT ? spread : MIN_SPREAD_PCT + Math.random() * 0.5;
        const projectedProfit = calculateProjectedProfit(alertSpread, 100);
        const riskLevel = calculateRiskLevel(alertSpread);

        // Check if we already created an alert for this symbol recently
        const recentAlerts = await db.collection('alerts')
          .where('symbol', '==', symbol)
          .where('status', 'in', ['PENDING', 'ANALYZING', 'APPROVED'])
          .limit(1)
          .get();

        if (recentAlerts.empty) {
          // Generate random 24h volume for testing
          const alertVolume_24h = Math.random() * 1000000 + 50000; // 50k - 1M

          // Create alert
          const alertRef = await db.collection('alerts').add({
            type: 'ARBITRAGE',
            spread: alertSpread,
            buy_at: weexPrice < otherPrice ? 'WEEX' : 'OTHER',
            sell_at: weexPrice < otherPrice ? 'OTHER' : 'WEEX',
            weex_price: weexPrice,
            other_price: otherPrice,
            projected_profit: projectedProfit,
            risk_level: riskLevel,
            status: 'PENDING',
            symbol: symbol,
            asset: asset,
            volume_24h: alertVolume_24h,
            created_at: new Date(),
            timestamp: new Date().toISOString()
          });

          console.log(`🚨 ARBITRAGE ALERT: ${docId} - Spread: ${alertSpread.toFixed(2)}%, Profit: $${projectedProfit.toFixed(2)}`);
          console.log(`   Alert ID: ${alertRef.id}`);
        }
      }
    }

    console.log(`✅ Test data generated at ${new Date().toISOString()}\n`);
  } catch (error) {
    console.error('❌ Error in polling loop:', error);
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
 * Start the local bot
 */
async function startBot() {
  console.log('🚀 Aetheris Local Bot Starting (Test Mode)...');
  console.log(`📡 Polling interval: ${POLL_INTERVAL}ms (${POLL_INTERVAL/1000}s)`);
  console.log(`📊 Generating test data for: ${SYMBOLS.join(', ')}`);
  console.log(`💰 Minimum spread: ${MIN_SPREAD_PCT}%`);
  console.log(`🔧 Using Firestore Emulator: ${process.env.USE_EMULATOR !== 'false' ? 'Yes' : 'No'}`);
  console.log('');

  // Initialize AI service
  try {
    await backendAIService.initialize();
    console.log('✅ AI Service ready for analysis\n');
  } catch (error) {
    console.warn('⚠️  AI Service not available:', error.message);
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

  console.log('✅ Local bot is running. Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down local bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down local bot...');
  process.exit(0);
});

// Start the bot
startBot().catch(error => {
  console.error('❌ Fatal error starting bot:', error);
  process.exit(1);
});

