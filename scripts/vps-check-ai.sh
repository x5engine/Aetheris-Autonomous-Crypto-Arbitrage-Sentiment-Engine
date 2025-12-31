#!/bin/bash

# Check AI Service setup on VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS AI Service Check                    ║${NC}"
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

# Check SSH connection
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_IP" "echo 'test'" 2>/dev/null; then
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
elif command -v sshpass &> /dev/null; then
    SSH_CMD="sshpass -p \"$VPS_PASSWORD\" ssh -o StrictHostKeyChecking=no"
else
    echo -e "${RED}❌ Cannot connect to VPS${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Checking AI Service setup on VPS...${NC}"
echo ""

# Check .env file
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    
    echo "📋 Checking .env file..."
    if [ -f ".env" ]; then
        echo "✅ .env file exists"
        
        if grep -q "EMBEDAPI_KEY" .env; then
            KEY_VALUE=$(grep "EMBEDAPI_KEY" .env | cut -d'=' -f2)
            if [ -z "$KEY_VALUE" ] || [ "$KEY_VALUE" = "" ]; then
                echo -e "⚠️  EMBEDAPI_KEY found but is empty"
            else
                echo -e "✅ EMBEDAPI_KEY is set (length: ${#KEY_VALUE} chars)"
            fi
        else
            echo -e "❌ EMBEDAPI_KEY not found in .env"
        fi
    else
        echo -e "❌ .env file not found"
    fi
    
    echo ""
    echo "📦 Checking @embedapi/core package..."
    if [ -d "node_modules/@embedapi" ]; then
        echo "✅ @embedapi/core is installed"
    else
        echo -e "❌ @embedapi/core not installed"
        echo "   Run: cd ~/aetheris-engine && npm install"
    fi
    
    echo ""
    echo "🤖 Checking bot status..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20 > /dev/null 2>&1 || true
    
    if command -v pm2 &> /dev/null; then
        PM2_STATUS=$(pm2 list | grep "aetheris-engine" || echo "")
        if [ -n "$PM2_STATUS" ]; then
            echo "✅ Bot is running (PM2)"
        else
            echo "⚠️  Bot is not running in PM2"
        fi
    else
        echo "⚠️  PM2 not found"
    fi
ENDSSH

echo ""
echo -e "${BLUE}💡 To fix missing EMBEDAPI_KEY:${NC}"
echo "   1. ssh $VPS_USER@$VPS_IP"
echo "   2. cd ~/aetheris-engine"
echo "   3. echo 'EMBEDAPI_KEY=your_key_here' >> .env"
echo "   4. pm2 restart aetheris-engine"
echo ""
echo -e "${BLUE}📋 Or use the upload script:${NC}"
echo "   npm run vps:upload-secrets"

