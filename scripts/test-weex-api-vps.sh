#!/bin/bash

# Test WEEX API directly on VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     WEEX API Test on VPS                            ║${NC}"
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

echo -e "${YELLOW}📤 Uploading test script to VPS...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    # Check if test script exists
    if [ ! -f "test-weex-api.js" ]; then
        echo "⚠️  test-weex-api.js not found on VPS"
        echo "   Will create it..."
    fi
ENDSSH

# Upload test script
scp -o StrictHostKeyChecking=no engine/test-weex-api.js "$VPS_USER@$VPS_IP:~/aetheris-engine/test-weex-api.js" 2>/dev/null || \
eval "$SSH_CMD $VPS_USER@$VPS_IP" "cat > ~/aetheris-engine/test-weex-api.js" < engine/test-weex-api.js

echo -e "${GREEN}✅ Test script uploaded${NC}"
echo ""

echo -e "${YELLOW}🧪 Running WEEX API test on VPS...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    node test-weex-api.js
ENDSSH

echo ""
echo -e "${GREEN}✅ Test complete${NC}"

