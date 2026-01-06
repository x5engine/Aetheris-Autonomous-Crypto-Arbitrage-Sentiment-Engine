#!/usr/bin/env node
// nvm use 20
/**
 * WEEX API Test - Place Order
 * 
 * This script places a market order for approximately 10 USDT on cmt_btcusdt
 * to pass the WEEX API gateway test.
 * 
 * Requirements:
 * - Execute a trade for approximately 10 USDT on cmt_btcusdt
 * - Use the order placement endpoint
 * 
 * Run: node test-api-order.js
 */

import { fetchWeeXTicker, placeMarketOrder } from './utils/weexApi.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from both engine directory and root directory
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '..', '.env') });

const SYMBOL = 'cmt_btcusdt';
const TARGET_USDT = 10; // Approximately 10 USDT
const ACCOUNT_ID = process.env.WEEX_ACCOUNT_ID || 'default';

console.log('🧪 WEEX API Gateway Test - Order Placement\n');
console.log(`Symbol: ${SYMBOL}`);
console.log(`Target Value: ~${TARGET_USDT} USDT`);
console.log(`Account ID: ${ACCOUNT_ID}\n`);

async function placeTestOrder() {
  try {
    // Step 1: Get current price
    console.log('📊 Step 1: Fetching current price...');
    const tickerResult = await fetchWeeXTicker(SYMBOL);
    
    if (!tickerResult.success || !tickerResult.price) {
      throw new Error(`Failed to fetch price: ${tickerResult.error || 'Unknown error'}`);
    }
    
    const currentPrice = tickerResult.price;
    console.log(`✅ Current price: $${currentPrice.toFixed(2)}\n`);
    
    // Step 2: Calculate order size
    // For futures contracts, size is typically in contracts
    // Size = Target USDT / Price
    let orderSize = TARGET_USDT / currentPrice;
    
    // Round to 6 decimal places (common precision for BTC contracts)
    // WEEX API may require specific precision, adjust if needed
    orderSize = Math.round(orderSize * 1000000) / 1000000;
    
    // Ensure minimum size (some exchanges have minimum order sizes)
    if (orderSize < 0.000001) {
      throw new Error(`Calculated order size (${orderSize}) is too small. Price may be invalid.`);
    }
    
    console.log(`📐 Step 2: Calculating order size...`);
    console.log(`   Target: ${TARGET_USDT} USDT`);
    console.log(`   Price: $${currentPrice.toFixed(2)}`);
    console.log(`   Size: ${orderSize} contracts`);
    console.log(`   Actual Value: ~$${(orderSize * currentPrice).toFixed(2)} USDT\n`);
    
    // Step 3: Place market order (buy)
    console.log('🚀 Step 3: Placing market order...');
    console.log(`   Symbol: ${SYMBOL}`);
    console.log(`   Side: buy`);
    console.log(`   Order Type: market`);
    console.log(`   Size: ${orderSize.toFixed(6)}`);
    console.log(`   Account ID: ${ACCOUNT_ID}\n`);
    
    const orderResult = await placeMarketOrder({
      symbol: SYMBOL,
      side: 'buy',
      size: orderSize,
      accountId: ACCOUNT_ID
    });
    
    if (!orderResult.success) {
      console.error('❌ Order placement failed:');
      console.error(`   Error: ${orderResult.error}`);
      if (orderResult.details) {
        console.error(`   Details: ${JSON.stringify(orderResult.details, null, 2)}`);
      }
      throw new Error(`Order placement failed: ${orderResult.error || 'Unknown error'}`);
    }
    
    // Step 4: Display results
    console.log('✅ Order placed successfully!\n');
    console.log('📋 Order Details:');
    console.log(JSON.stringify(orderResult.data, null, 2));
    
    if (orderResult.orderId) {
      console.log(`\n🆔 Order ID: ${orderResult.orderId}`);
    }
    
    console.log('\n✅ API Gateway Test Complete!');
    console.log('   The order has been placed and should be visible in your WEEX account.');
    
    return orderResult;
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    process.exit(1);
  }
}

// Run the test
placeTestOrder();

