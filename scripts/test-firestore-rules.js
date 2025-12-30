#!/usr/bin/env node

/**
 * Test script to validate Firestore rules
 * Run with: node scripts/test-firestore-rules.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Testing Firestore Rules...\n');

// Read rules file
let rulesContent;
try {
  rulesContent = readFileSync(join(rootDir, 'firestore.rules'), 'utf8');
  console.log('✅ firestore.rules file found\n');
} catch (error) {
  console.error('❌ Error reading firestore.rules:', error.message);
  process.exit(1);
}

// Basic syntax checks
const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  checks.push({ name, condition, message });
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    failed++;
  }
}

// Check for required components
check(
  'Rules version declared',
  rulesContent.includes("rules_version = '2'"),
  'Missing rules_version declaration'
);

check(
  'Service declaration',
  rulesContent.includes('service cloud.firestore'),
  'Missing service declaration'
);

check(
  'Database match',
  rulesContent.includes('match /databases/{database}/documents'),
  'Missing database match'
);

// Check for collection rules
check(
  'Market ticks rules',
  rulesContent.includes('market_ticks'),
  'Missing market_ticks rules'
);

check(
  'Opportunities rules',
  rulesContent.includes('opportunities'),
  'Missing opportunities rules'
);

check(
  'Audit logs rules',
  rulesContent.includes('audit_logs'),
  'Missing audit_logs rules'
);

// Check for security features
check(
  'Read access control',
  rulesContent.includes('allow read:'),
  'Missing read access control'
);

check(
  'Write access control',
  rulesContent.includes('allow write:') || 
  (rulesContent.includes('allow create:') && 
   rulesContent.includes('allow update:')),
  'Missing write access control'
);

// Check for validation functions
check(
  'Data validation',
  rulesContent.includes('isValid') || rulesContent.includes('function'),
  'Missing data validation functions'
);

// Check for default deny
check(
  'Default deny rule',
  rulesContent.includes('allow read, write: if false') ||
  rulesContent.includes('match /{document=**}'),
  'Missing default deny rule'
);

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Total: ${checks.length}\n`);

if (failed === 0) {
  console.log('🎉 Firestore rules structure looks good!');
  console.log('\n📝 Next steps:');
  console.log('1. Test rules with Firebase emulator: firebase emulators:start --only firestore');
  console.log('2. Use Firebase Console Rules Playground to test specific scenarios');
  console.log('3. Deploy rules: firebase deploy --only firestore:rules');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review the rules file.');
  process.exit(1);
}

