#!/bin/bash

# Aetheris VPS Logs Script
# Shows real-time logs from the bot

# Colors
BLUE='\033[0;34m'
NC='\033[0m'

# Load credentials
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

source .env
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
VPS_USER="$User"
VPS_PASSWORD="$Password"

LINES=${1:-50}

echo -e "${BLUE}📋 Showing last $LINES lines of bot logs...${NC}"
echo ""

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
    pm2 logs aetheris-engine --lines $LINES --nostream
ENDSSH

