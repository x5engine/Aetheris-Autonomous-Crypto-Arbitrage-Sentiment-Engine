#!/bin/bash

# Aetheris VPS Start Script
# Starts the bot on the VPS using PM2

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS Start Script                       ║${NC}"
echo -e "${BLUE}║     Starting Aetheris bot on Hetzner VPS             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables from .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

source .env

# Validate credentials
if [ -z "$server" ] || [ -z "$IPv4" ] || [ -z "$User" ] || [ -z "$Password" ]; then
    echo -e "${RED}❌ Error: Missing credentials in .env file${NC}"
    exit 1
fi

VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
VPS_USER="$User"
VPS_PASSWORD="$Password"

# Check SSH connection method
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_IP" "echo 'test'" 2>/dev/null; then
    USE_SSHPASS=false
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
elif command -v sshpass &> /dev/null; then
    USE_SSHPASS=true
    SSH_CMD="sshpass -p \"$VPS_PASSWORD\" ssh -o StrictHostKeyChecking=no"
else
    echo -e "${RED}❌ Cannot connect: SSH keys don't work and sshpass not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}🚀 Starting Aetheris bot on VPS...${NC}"

# Check if bot is already running
echo "   Checking if bot is already running..."
EXISTING_PROCESS=$(eval "$SSH_CMD $VPS_USER@$VPS_IP" "export NVM_DIR=\"\$HOME/.nvm\" && [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\" && nvm use 20 && pm2 list | grep aetheris-engine || echo ''" 2>/dev/null)

if [ ! -z "$EXISTING_PROCESS" ]; then
    echo -e "${YELLOW}⚠️  Bot is already running. Restarting...${NC}"
    eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
        cd ~/aetheris-engine
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use 20
        
        # Ensure PM2 is available
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        
        pm2 restart aetheris-engine || pm2 start bot.js --name "aetheris-engine"
        pm2 save
        echo "✅ Bot restarted"
ENDSSH
else
    echo "   Starting new bot instance..."
    eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
        cd ~/aetheris-engine
        
        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use 20
        
        # Ensure PM2 is installed and available
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        
        # Check if service-account.json exists
        if [ ! -f "service-account.json" ]; then
            echo "❌ ERROR: service-account.json not found!"
            echo "   Please upload it to ~/aetheris-engine/"
            exit 1
        fi
        
        # Check if .env exists
        if [ ! -f ".env" ]; then
            echo "⚠️  WARNING: .env file not found"
            echo "   Bot may not work without WEEX credentials"
        fi
        
        # Start bot with PM2
        pm2 start bot.js --name "aetheris-engine"
        pm2 save
        pm2 startup
        echo "✅ Bot started"
ENDSSH
fi

echo ""
echo -e "${YELLOW}📊 Bot Status:${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    # Ensure PM2 is available
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    pm2 list | grep aetheris-engine || pm2 list
ENDSSH

echo ""
echo -e "${GREEN}✅ Bot is running!${NC}"
echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo "   View logs:     ./scripts/vps-logs.sh"
echo "   Stop bot:      ./scripts/vps-stop.sh"
echo "   Restart bot:   ./scripts/vps-restart.sh"
echo "   Status:        ./scripts/vps-status.sh"
echo ""

