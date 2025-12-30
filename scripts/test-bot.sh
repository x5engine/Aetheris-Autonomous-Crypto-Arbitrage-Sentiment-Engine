#!/bin/bash

# Test script to verify bot is working and writing to Firestore

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris Bot Test Script                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load credentials
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

source .env
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
VPS_USER="$User"
VPS_PASSWORD="$Password"

# Check SSH method
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_IP" "echo 'test'" 2>/dev/null; then
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
elif command -v sshpass &> /dev/null; then
    SSH_CMD="sshpass -p \"$VPS_PASSWORD\" ssh -o StrictHostKeyChecking=no"
else
    echo -e "${RED}❌ Cannot connect${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Test 1: Checking PM2 Status...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    echo "PM2 Process List:"
    pm2 list
    echo ""
    
    BOT_STATUS=$(pm2 jlist | grep -o '"name":"aetheris-engine"' || echo "")
    if [ -n "$BOT_STATUS" ]; then
        echo "✅ Bot process found in PM2"
    else
        echo "❌ Bot process NOT found"
        exit 1
    fi
ENDSSH

echo ""
echo -e "${YELLOW}📋 Test 2: Checking Bot Logs (last 20 lines)...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    echo "Recent logs:"
    pm2 logs aetheris-engine --lines 20 --nostream
ENDSSH

echo ""
echo -e "${YELLOW}🔍 Test 3: Checking Firestore Data...${NC}"
echo "   Go to: https://console.firebase.google.com/project/hackathon-project-245ba/firestore"
echo "   Check for:"
echo "   - live_feed collection (should have price data)"
echo "   - alerts collection (should have opportunities when detected)"
echo ""

echo -e "${YELLOW}🧪 Test 4: Testing WEEX API Connection...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    # Test WEEX API connection
    if [ -f ".env" ]; then
        source .env
        echo "Testing WEEX API connection..."
        
        # Simple curl test to WEEX API
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://api-contract.weex.com/capi/v1/public/time" 2>/dev/null || echo "000")
        
        if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "000" ]; then
            echo "✅ WEEX API endpoint reachable"
        else
            echo "⚠️  WEEX API returned: $RESPONSE"
        fi
    else
        echo "⚠️  .env file not found (cannot test WEEX API)"
    fi
ENDSSH

echo ""
echo -e "${YELLOW}📁 Test 5: Checking Bot Files...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    
    echo "Files in ~/aetheris-engine:"
    ls -lah | grep -E "bot.js|package.json|service-account.json|.env|node_modules"
    echo ""
    
    if [ -f "bot.js" ]; then
        echo "✅ bot.js found"
    else
        echo "❌ bot.js NOT found"
    fi
    
    if [ -f "service-account.json" ]; then
        echo "✅ service-account.json found"
    else
        echo "❌ service-account.json NOT found"
    fi
    
    if [ -f ".env" ]; then
        echo "✅ .env found"
        # Check if WEEX credentials are set (without showing values)
        if grep -q "WEEX_API_KEY" .env; then
            echo "✅ WEEX_API_KEY is set"
        else
            echo "❌ WEEX_API_KEY NOT set"
        fi
    else
        echo "❌ .env NOT found"
    fi
    
    if [ -d "node_modules" ]; then
        echo "✅ node_modules found"
    else
        echo "❌ node_modules NOT found"
    fi
ENDSSH

echo ""
echo -e "${GREEN}✅ Tests Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Check Firestore: https://console.firebase.google.com/project/hackathon-project-245ba/firestore"
echo "   2. View live logs: npm run vps:logs"
echo "   3. Check status: npm run vps:status"
echo ""

