#!/usr/bin/env node

/**
 * Test WEEX API directly
 * Run this on VPS to see actual API response
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { getWeeXHeaders } from './utils/weexAuth.js';

dotenv.config();

const WEEX_API_DOMAIN = process.env.WEEX_API_DOMAIN || 'https://api-contract.weex.com';
const SYMBOL = 'cmt_btcusdt';

console.log('🧪 Testing WEEX API...\n');
console.log(`Domain: ${WEEX_API_DOMAIN}`);
console.log(`Symbol: ${SYMBOL}\n`);

// Test 1: Public endpoint (no auth)
console.log('📡 Test 1: Public endpoint (no authentication)...');
try {
  const publicPath = `/capi/v2/market/ticker?symbol=${SYMBOL}`;
  const publicResponse = await axios.get(`${WEEX_API_DOMAIN}${publicPath}`, {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'locale': 'en-US'
    }
  });
  
  console.log('✅ Public request successful');
  console.log('Status:', publicResponse.status);
  console.log('Headers:', JSON.stringify(publicResponse.headers, null, 2));
  console.log('Full Response:', JSON.stringify(publicResponse.data, null, 2));
  console.log('Response Type:', typeof publicResponse.data);
  console.log('Response Keys:', Object.keys(publicResponse.data || {}));
  console.log('');
} catch (error) {
  console.error('❌ Public request failed:');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error:', error.message);
  }
  console.log('');
}

// Test 2: With authentication
console.log('📡 Test 2: Authenticated endpoint...');
try {
  const apiKey = process.env.WEEX_API_KEY;
  const secretKey = process.env.WEEX_SECRET_KEY;
  const passphrase = process.env.WEEX_PASSPHRASE;

  if (!apiKey || !secretKey || !passphrase) {
    console.log('⚠️  WEEX credentials not configured, skipping authenticated test');
  } else {
    const authPath = `/capi/v2/market/ticker?symbol=${SYMBOL}`;
    const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', authPath);
    
    console.log('Headers:', {
      'ACCESS-KEY': headers['ACCESS-KEY'] ? '***' : 'missing',
      'ACCESS-PASSPHRASE': headers['ACCESS-PASSPHRASE'] ? '***' : 'missing',
      'ACCESS-TIMESTAMP': headers['ACCESS-TIMESTAMP'],
      'ACCESS-SIGN': headers['ACCESS-SIGN'] ? '***' : 'missing'
    });
    
    const authResponse = await axios.get(`${WEEX_API_DOMAIN}${authPath}`, {
      headers,
      timeout: 10000
    });
    
    console.log('✅ Authenticated request successful');
    console.log('Status:', authResponse.status);
    console.log('Headers:', JSON.stringify(authResponse.headers, null, 2));
    console.log('Full Response:', JSON.stringify(authResponse.data, null, 2));
    console.log('Response Type:', typeof authResponse.data);
    console.log('Response Keys:', Object.keys(authResponse.data || {}));
  }
} catch (error) {
  console.error('❌ Authenticated request failed:');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data, null, 2));
    console.error('Headers:', error.response.headers);
  } else {
    console.error('Error:', error.message);
  }
}

console.log('\n✅ Test complete');

