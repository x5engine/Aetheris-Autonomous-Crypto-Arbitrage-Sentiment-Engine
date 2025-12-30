#!/usr/bin/env node

/**
 * Test script to check Firestore data
 * Verifies bot is writing to Firestore correctly
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5wjZM78tGyAVDlv2Yy95HKl0kjFvjkLk",
  authDomain: "hackathon-project-245ba.firebaseapp.com",
  projectId: "hackathon-project-245ba",
  storageBucket: "hackathon-project-245ba.firebasestorage.app",
  messagingSenderId: "13696281360",
  appId: "1:13696281360:web:07952d00bbbf12d8c0d395"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  console.log('🧪 Testing Firestore Connection...\n');

  try {
    // Test 1: Check live_feed collection
    console.log('📊 Test 1: Checking live_feed collection...');
    const liveFeedRef = collection(db, 'live_feed');
    const liveFeedQuery = query(liveFeedRef, orderBy('last_updated', 'desc'), limit(5));
    const liveFeedSnapshot = await getDocs(liveFeedQuery);
    
    if (liveFeedSnapshot.empty) {
      console.log('   ⚠️  No data in live_feed collection yet');
      console.log('   (Bot may need more time to start writing data)');
    } else {
      console.log(`   ✅ Found ${liveFeedSnapshot.size} entries in live_feed`);
      liveFeedSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`      - ${doc.id}: ${data.price || 'N/A'} (${data.exchange || 'N/A'})`);
      });
    }

    console.log('');

    // Test 2: Check alerts collection
    console.log('🚨 Test 2: Checking alerts collection...');
    const alertsRef = collection(db, 'alerts');
    const alertsQuery = query(alertsRef, orderBy('created_at', 'desc'), limit(5));
    const alertsSnapshot = await getDocs(alertsQuery);
    
    if (alertsSnapshot.empty) {
      console.log('   ⚠️  No alerts found yet');
      console.log('   (Alerts are created when arbitrage opportunities are detected)');
    } else {
      console.log(`   ✅ Found ${alertsSnapshot.size} alerts`);
      alertsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`      - ${doc.id}: ${data.type || 'N/A'} - Spread: ${data.spread || 'N/A'}% - Status: ${data.status || 'N/A'}`);
      });
    }

    console.log('');
    console.log('✅ Firestore connection successful!');
    console.log('');
    console.log('📝 View data in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/hackathon-project-245ba/firestore');

  } catch (error) {
    console.error('❌ Error testing Firestore:', error.message);
    process.exit(1);
  }
}

testFirestore();

