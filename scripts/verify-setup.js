#!/usr/bin/env node

/**
 * Verification script to check if Aetheris setup is complete
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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

console.log('🔍 Verifying Aetheris Setup...\n');

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
check('Node.js Version', majorVersion >= 20, `Node.js ${nodeVersion} detected. Need 20+`);

// Check required files
check('package.json exists', existsSync(join(rootDir, 'package.json')), 'Missing package.json');
check('firebase.json exists', existsSync(join(rootDir, 'firebase.json')), 'Missing firebase.json');
check('firestore.rules exists', existsSync(join(rootDir, 'firestore.rules')), 'Missing firestore.rules');

// Check client files
check('Client directory', existsSync(join(rootDir, 'client')), 'Missing client directory');
check('Client src/App.jsx', existsSync(join(rootDir, 'client/src/App.jsx')) || existsSync(join(rootDir, 'src/App.jsx')), 'Missing App.jsx');
check('Client package.json', existsSync(join(rootDir, 'client/package.json')), 'Missing client/package.json');

// Check key components
check('Dashboard component', existsSync(join(rootDir, 'src/components/Dashboard/Dashboard.jsx')), 'Missing Dashboard component');
check('ArbitrageCard component', existsSync(join(rootDir, 'src/components/ArbitrageCard.jsx')), 'Missing ArbitrageCard component');
check('SentimentGauge component', existsSync(join(rootDir, 'src/components/SentimentGauge.jsx')), 'Missing SentimentGauge component');

// Check engine (VPS bot)
check('Engine bot.js', existsSync(join(rootDir, 'engine/bot.js')), 'Missing engine/bot.js');
check('Engine package.json', existsSync(join(rootDir, 'engine/package.json')), 'Missing engine/package.json');

// Check client
check('Client src directory', existsSync(join(rootDir, 'client/src')), 'Missing client/src');
check('Client package.json', existsSync(join(rootDir, 'client/package.json')), 'Missing client/package.json');

// Check root package.json (should be minimal, main deps in client/)
try {
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  check('Root package.json readable', true, '');
} catch (e) {
  check('package.json readable', false, 'Cannot read package.json');
}

// Check engine directory (VPS bot)
try {
  const enginePackageJson = JSON.parse(readFileSync(join(rootDir, 'engine/package.json'), 'utf8'));
  check('Engine package.json exists', true, '');
  check('Firebase Admin in engine', enginePackageJson.dependencies?.['firebase-admin'], 'firebase-admin not in engine dependencies');
  check('Axios in engine', enginePackageJson.dependencies?.axios, 'axios not in engine dependencies');
} catch (e) {
  check('engine/package.json readable', false, 'Cannot read engine/package.json');
}

// Check client directory
try {
  const clientPackageJson = JSON.parse(readFileSync(join(rootDir, 'client/package.json'), 'utf8'));
  check('Client package.json exists', true, '');
  check('React in client', clientPackageJson.dependencies?.react, 'React not in client dependencies');
  check('Transformers.js in client', clientPackageJson.dependencies?.['@xenova/transformers'], 'Transformers.js not in client dependencies');
} catch (e) {
  check('client/package.json readable', false, 'Cannot read client/package.json');
}

// Check environment files (optional)
const envExists = existsSync(join(rootDir, '.env'));
check('Environment file', envExists, '.env file not found (create from .env.example)');

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Total: ${checks.length}\n`);

if (failed === 0) {
  console.log('🎉 All checks passed! Setup is complete.');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please fix the issues above.');
  process.exit(1);
}

