#!/bin/bash

# Aetheris Deployment Script
# Deploys both frontend and backend to Firebase

set -e  # Exit on error

echo "🚀 Aetheris Deployment Script"
echo "=============================="
echo ""

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ required. Current: $(node --version)"
    echo "   Run: nvm use 20"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found"
    echo "   Install: npm install -g firebase-tools"
    exit 1
fi
echo "✅ Firebase CLI installed"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase"
    echo "   Run: firebase login"
    exit 1
fi
echo "✅ Firebase authenticated"

# Check project
CURRENT_PROJECT=$(firebase use 2>&1 | grep -o 'hackathon-project-245ba' || echo "")
if [ -z "$CURRENT_PROJECT" ]; then
    echo "⚠️  Warning: Project not set. Setting to hackathon-project-245ba"
    firebase use hackathon-project-245ba
fi
echo "✅ Firebase project: hackathon-project-245ba"

echo ""
echo "📦 Step 1: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "   Dependencies already installed"
fi

if [ ! -d "functions/node_modules" ]; then
    cd functions && npm install && cd ..
else
    echo "   Functions dependencies already installed"
fi

echo ""
echo "🔒 Step 2: Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

echo ""
echo "🏗️  Step 3: Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist folder not found"
    exit 1
fi
echo "✅ Frontend built successfully"

echo ""
echo "⚙️  Step 4: Deploying Cloud Functions..."
firebase deploy --only functions

echo ""
echo "🌐 Step 5: Deploying web app to Firebase Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📱 Your app is live at: https://hackathon-project-245ba.web.app"
echo "📊 Firebase Console: https://console.firebase.google.com/project/hackathon-project-245ba"
echo ""
echo "🔍 Next steps:"
echo "   1. Check function logs: firebase functions:log"
echo "   2. Verify Firestore data in Firebase Console"
echo "   3. Test the web app"
echo ""

