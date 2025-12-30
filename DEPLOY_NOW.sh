#!/bin/bash

# Quick deployment script for submission

set -e

echo "🚀 Deploying Aetheris for Submission..."
echo ""

# Deploy bot
echo "📦 Step 1: Deploying bot to VPS..."
npm run vps:deploy

echo ""
echo "▶️  Step 2: Starting bot..."
npm run vps:start

echo ""
echo "⏳ Waiting 5 seconds for bot to initialize..."
sleep 5

echo ""
echo "📊 Step 3: Checking bot status..."
npm run vps:status

echo ""
echo "🌐 Step 4: Deploying frontend..."
npm run deploy:hosting

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Check bot logs: npm run vps:logs"
echo "   2. Check Firestore: https://console.firebase.google.com/project/hackathon-project-245ba/firestore"
echo "   3. Open frontend: https://hackathon-project-245ba.web.app"
echo ""

