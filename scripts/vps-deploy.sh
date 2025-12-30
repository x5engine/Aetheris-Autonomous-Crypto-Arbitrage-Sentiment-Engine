#!/bin/bash

# Aetheris VPS Deployment Script
# Deploys the engine code to the VPS server
# Uses credentials from .env file

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS Deployment Script                    ║${NC}"
echo -e "${BLUE}║     Deploying engine code to Hetzner VPS              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables from .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Loading credentials from .env file...${NC}"
source .env

# Validate credentials
if [ -z "$server" ] || [ -z "$IPv4" ] || [ -z "$User" ] || [ -z "$Password" ]; then
    echo -e "${RED}❌ Error: Missing credentials in .env file${NC}"
    exit 1
fi

# Extract IP from IPv4
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
VPS_USER="$User"
VPS_PASSWORD="$Password"
PROJECT_DIR="~/aetheris-engine"

echo -e "${GREEN}✅ Credentials loaded${NC}"
echo -e "${BLUE}   Deploying to: ${VPS_USER}@${VPS_IP}${NC}"
echo ""

# Check if engine directory exists
if [ ! -d "engine" ]; then
    echo -e "${RED}❌ Error: engine/ directory not found${NC}"
    exit 1
fi

# Check for service-account.json (multiple locations)
SERVICE_ACCOUNT_FILE=""
if [ -f "engine/service-account.json" ]; then
    SERVICE_ACCOUNT_FILE="engine/service-account.json"
elif [ -f "hackathon-project-245ba-firebase-adminsdk-fbsvc-f56e7f796a.json" ]; then
    SERVICE_ACCOUNT_FILE="hackathon-project-245ba-firebase-adminsdk-fbsvc-f56e7f796a.json"
elif ls hackathon-project-245ba-firebase-adminsdk-*.json 1> /dev/null 2>&1; then
    SERVICE_ACCOUNT_FILE=$(ls hackathon-project-245ba-firebase-adminsdk-*.json | head -1)
elif ls *-firebase-adminsdk-*.json 1> /dev/null 2>&1; then
    SERVICE_ACCOUNT_FILE=$(ls *-firebase-adminsdk-*.json | head -1)
fi

if [ -z "$SERVICE_ACCOUNT_FILE" ]; then
    echo -e "${YELLOW}⚠️  WARNING: service-account.json not found${NC}"
    echo "   The bot will not work without this file."
    echo "   Looking for:"
    echo "   - engine/service-account.json"
    echo "   - hackathon-project-245ba-firebase-adminsdk-*.json"
    echo "   - *-firebase-adminsdk-*.json"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Found service account: $SERVICE_ACCOUNT_FILE${NC}"
    # Copy to engine/ for deployment if not already there
    if [ "$SERVICE_ACCOUNT_FILE" != "engine/service-account.json" ]; then
        cp "$SERVICE_ACCOUNT_FILE" engine/service-account.json 2>/dev/null || true
    fi
fi

# Check SSH connection method (SSH keys first, then sshpass fallback)
echo -e "${YELLOW}🔌 Testing SSH connection to VPS...${NC}"

# Try SSH with keys first (BatchMode=yes prevents password prompt)
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful (using SSH keys)${NC}"
    USE_SSHPASS=false
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
    SCP_CMD="scp -o StrictHostKeyChecking=no"
# If SSH keys don't work, try with sshpass (password)
elif command -v sshpass &> /dev/null; then
    if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$VPS_USER@$VPS_IP" "echo 'Connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ SSH connection successful (using password)${NC}"
        USE_SSHPASS=true
        SSH_CMD="sshpass -p \"$VPS_PASSWORD\" ssh -o StrictHostKeyChecking=no"
        SCP_CMD="sshpass -p \"$VPS_PASSWORD\" scp -o StrictHostKeyChecking=no"
    else
        echo -e "${RED}❌ Failed to connect to VPS${NC}"
        echo "   Please verify:"
        echo "   - IP address: $VPS_IP"
        echo "   - Username: $VPS_USER"
        echo "   - Password is correct"
        echo "   - VPS is accessible from your network"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to connect to VPS${NC}"
    echo ""
    echo "   SSH keys don't work and sshpass is not installed."
    echo "   Options:"
    echo "   1. Set up SSH keys: ssh-copy-id $VPS_USER@$VPS_IP"
    echo "   2. Install sshpass: sudo apt-get install -y sshpass"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Creating deployment package...${NC}"
TEMP_DIR=$(mktemp -d)
DEPLOY_DIR="$TEMP_DIR/aetheris-engine"

mkdir -p "$DEPLOY_DIR"

# Copy engine files
echo "   Copying engine files..."
cp -r engine/* "$DEPLOY_DIR/" 2>/dev/null || true
cp engine/.gitignore "$DEPLOY_DIR/" 2>/dev/null || true

# Remove node_modules if exists (will reinstall on VPS)
rm -rf "$DEPLOY_DIR/node_modules" 2>/dev/null || true

echo -e "${GREEN}✅ Package created${NC}"

echo ""
echo -e "${YELLOW}📤 Step 2: Uploading files to VPS...${NC}"
echo "   This may take a moment..."

# Create .env file on VPS with WEEX credentials
echo "   Creating .env file on VPS..."
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    mkdir -p ~/aetheris-engine
ENDSSH

# Upload files using rsync or scp
if command -v rsync &> /dev/null; then
    echo "   Using rsync for efficient transfer..."
    if [ "$USE_SSHPASS" = true ]; then
        sshpass -p "$VPS_PASSWORD" rsync -avz --progress \
            -e "ssh -o StrictHostKeyChecking=no" \
            "$DEPLOY_DIR/" "$VPS_USER@$VPS_IP:~/aetheris-engine/" \
            --exclude 'node_modules' \
            --exclude '*.log'
    else
        rsync -avz --progress \
            -e "ssh -o StrictHostKeyChecking=no" \
            "$DEPLOY_DIR/" "$VPS_USER@$VPS_IP:~/aetheris-engine/" \
            --exclude 'node_modules' \
            --exclude '*.log'
    fi
else
    echo "   Using scp for transfer..."
    if [ "$USE_SSHPASS" = true ]; then
        sshpass -p "$VPS_PASSWORD" scp -r -o StrictHostKeyChecking=no \
            "$DEPLOY_DIR"/* "$VPS_USER@$VPS_IP:~/aetheris-engine/"
    else
        scp -r -o StrictHostKeyChecking=no \
            "$DEPLOY_DIR"/* "$VPS_USER@$VPS_IP:~/aetheris-engine/"
    fi
fi

echo -e "${GREEN}✅ Files uploaded${NC}"

echo ""
echo -e "${YELLOW}📦 Step 3: Installing dependencies on VPS...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    echo "Installing npm dependencies..."
    npm install --production
    echo "✅ Dependencies installed"
ENDSSH

echo ""
echo -e "${YELLOW}🔍 Step 4: Verifying deployment...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    cd ~/aetheris-engine
    echo "Checking files..."
    if [ -f "bot.js" ]; then
        echo "✅ bot.js found"
    else
        echo "❌ bot.js not found"
        exit 1
    fi
    
    if [ -f "package.json" ]; then
        echo "✅ package.json found"
    else
        echo "❌ package.json not found"
        exit 1
    fi
    
    if [ -f "service-account.json" ]; then
        echo "✅ service-account.json found"
    else
        echo "⚠️  service-account.json not found (bot will not work)"
    fi
    
    if [ -f ".env" ]; then
        echo "✅ .env file found"
    else
        echo "⚠️  .env file not found (WEEX credentials needed)"
    fi
    
    # Load nvm for version check
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    echo ""
    echo "Node.js version: $(node --version)"
    echo "npm version: $(npm --version)"
ENDSSH

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Configure WEEX credentials on VPS:"
echo "      ssh $VPS_USER@$VPS_IP"
echo "      cd ~/aetheris-engine"
echo "      nano .env  # Add WEEX_API_KEY, WEEX_SECRET_KEY, WEEX_PASSPHRASE"
echo ""
echo "   2. Start the bot:"
echo "      ./scripts/vps-start.sh"
echo ""

