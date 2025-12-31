#!/bin/bash

# Aetheris VPS Upload Secrets Script
# Securely uploads service-account.json and .env to VPS

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS Secrets Upload                     ║${NC}"
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

# Check SSH connection method (SSH keys first, then sshpass fallback)
echo -e "${YELLOW}🔌 Testing SSH connection...${NC}"
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_IP" "echo 'test'" 2>/dev/null; then
    echo -e "${GREEN}✅ Using SSH keys${NC}"
    USE_SSHPASS=false
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
    SCP_CMD="scp -o StrictHostKeyChecking=no"
elif command -v sshpass &> /dev/null; then
    if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$VPS_USER@$VPS_IP" "echo 'test'" 2>/dev/null; then
        echo -e "${GREEN}✅ Using password authentication${NC}"
        USE_SSHPASS=true
        SSH_CMD="sshpass -p \"$VPS_PASSWORD\" ssh -o StrictHostKeyChecking=no"
        SCP_CMD="sshpass -p \"$VPS_PASSWORD\" scp -o StrictHostKeyChecking=no"
    else
        echo -e "${RED}❌ Failed to connect to VPS${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ SSH keys don't work and sshpass not installed${NC}"
    exit 1
fi

# Upload service-account.json (check multiple locations)
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

if [ -n "$SERVICE_ACCOUNT_FILE" ]; then
    echo -e "${YELLOW}📤 Uploading service account file: $SERVICE_ACCOUNT_FILE...${NC}"
    eval "$SCP_CMD $SERVICE_ACCOUNT_FILE $VPS_USER@$VPS_IP:~/aetheris-engine/service-account.json"
    echo -e "${GREEN}✅ service-account.json uploaded${NC}"
else
    echo -e "${RED}❌ service-account.json not found${NC}"
    echo "   Looking for:"
    echo "   - engine/service-account.json"
    echo "   - hackathon-project-245ba-firebase-adminsdk-*.json"
    echo "   - *-firebase-adminsdk-*.json"
    echo ""
    echo "   Please download it from Firebase Console:"
    echo "   1. Go to Firebase Console → Project Settings → Service Accounts"
    echo "   2. Click 'Generate New Private Key'"
    echo "   3. Save in project root or engine/ directory"
fi

echo ""

# Create .env file on VPS with WEEX credentials
echo -e "${YELLOW}📝 Setting up .env file on VPS...${NC}"
echo "   You need to add WEEX API credentials manually"
echo ""
read -p "Do you want to create .env file now? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Enter WEEX API credentials:"
    read -p "WEEX_API_KEY: " WEEX_API_KEY
    read -p "WEEX_SECRET_KEY: " WEEX_SECRET_KEY
    read -sp "WEEX_PASSPHRASE: " WEEX_PASSPHRASE
    echo
    
    read -p "EMBEDAPI_KEY (for AI analysis): " EMBEDAPI_KEY
    echo
    
    eval "$SSH_CMD $VPS_USER@$VPS_IP" << ENDSSH
        cat > ~/aetheris-engine/.env << EOF
WEEX_API_KEY=$WEEX_API_KEY
WEEX_SECRET_KEY=$WEEX_SECRET_KEY
WEEX_PASSPHRASE=$WEEX_PASSPHRASE
WEEX_API_DOMAIN=https://api-contract.weex.com
EMBEDAPI_KEY=$EMBEDAPI_KEY
EOF
        chmod 600 ~/aetheris-engine/.env
        echo "✅ .env file created on VPS with WEEX and EmbedAPI keys"
ENDSSH
else
    echo -e "${YELLOW}⚠️  Skipping .env creation${NC}"
    echo "   You can create it manually:"
    echo "   ssh $VPS_USER@$VPS_IP"
    echo "   cd ~/aetheris-engine"
    echo "   nano .env"
fi

echo ""
echo -e "${GREEN}✅ Secrets upload complete!${NC}"

