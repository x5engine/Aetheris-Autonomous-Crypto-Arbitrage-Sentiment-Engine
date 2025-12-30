#!/bin/bash

# Aetheris VPS Stop Script
# Stops the bot on the VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping Aetheris bot...${NC}"

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
    echo "❌ Cannot connect"
    exit 1
fi

eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    pm2 stop aetheris-engine
    echo "✅ Bot stopped"
ENDSSH

echo -e "${GREEN}✅ Bot stopped${NC}"

