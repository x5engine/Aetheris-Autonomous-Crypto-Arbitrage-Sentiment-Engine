#!/bin/bash

# Aetheris VPS Status Script
# Shows bot status and system information

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Load credentials
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

source .env
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
VPS_USER="$User"
VPS_PASSWORD="$Password"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS Status                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
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
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    echo "📊 PM2 Process Status:"
    echo "─────────────────────"
    pm2 list | grep -E "aetheris-engine|name|status|uptime" || pm2 list
    echo ""
    
    echo "💻 System Information:"
    echo "─────────────────────"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "PM2: $(pm2 --version)"
    echo "Uptime: $(uptime -p 2>/dev/null || uptime)"
    echo ""
    
    echo "📁 Project Directory:"
    echo "─────────────────────"
    if [ -d ~/aetheris-engine ]; then
        cd ~/aetheris-engine
        echo "Location: ~/aetheris-engine"
        echo "Files:"
        ls -lah | grep -E "bot.js|package.json|service-account.json|.env" || echo "   (checking...)"
    else
        echo "❌ Project directory not found"
    fi
    echo ""
    
    echo "📊 Recent Logs (last 10 lines):"
    echo "─────────────────────"
    pm2 logs aetheris-engine --lines 10 --nostream 2>/dev/null || echo "   No logs available"
ENDSSH

