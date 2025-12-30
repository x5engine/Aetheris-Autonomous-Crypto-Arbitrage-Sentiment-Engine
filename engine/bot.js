#!/usr/bin/env node
// nvm use 20

/**
 * Aetheris VPS Bot
 * Polls WEEX API and writes market data to Firestore
 * Runs continuously on Hetzner VPS with static IP
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { fetchWeeXTicker, fetchMultipleTickers } from './utils/weexApi.js';
import { calculateSpread, isProfitable, calculateProjectedProfit, calculateRiskLevel } from './utils/math.js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Start the bot
 */
async function startBot() {
  console.log('🚀 Aetheris VPS Bot Starting...');
  console.log(`📡 Polling interval: ${POLL_INTERVAL}ms (${POLL_INTERVAL/1000}s)`);
  console.log(`📊 Monitoring symbols: ${SYMBOLS.join(', ')}`);
  console.log(`💰 Minimum spread: ${MIN_SPREAD_PCT}%`);
  console.log('');

  // Initial poll
  await pollMarketData();

  // Set up interval
  setInterval(async () => {
    await pollMarketData();
  }, POLL_INTERVAL);

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

