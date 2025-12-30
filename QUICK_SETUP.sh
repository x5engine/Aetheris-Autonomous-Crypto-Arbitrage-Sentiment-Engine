#!/bin/bash

# Quick Setup Script - Run all setup steps in sequence
# This script guides you through the complete VPS setup

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS Quick Setup                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Step 0: Checking prerequisites...${NC}"

# Check .env file
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env file found${NC}"

# Check sshpass
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass not found${NC}"
    echo "   Please install: sudo apt-get install -y sshpass"
    exit 1
fi
echo -e "${GREEN}✅ sshpass installed${NC}"

# Check service-account.json
if [ ! -f "engine/service-account.json" ]; then
    echo -e "${YELLOW}⚠️  service-account.json not found${NC}"
    echo "   Download it from Firebase Console first"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ service-account.json found${NC}"
fi

echo ""
echo -e "${BLUE}Ready to start setup!${NC}"
echo ""
read -p "Press Enter to continue..."

# Step 1: Create user (optional)
echo ""
echo -e "${YELLOW}📋 Step 1: Create non-root user (optional)${NC}"
read -p "Do you want to create a non-root user? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run vps:create-user
    echo ""
    echo -e "${YELLOW}⚠️  Remember to update .env with new user credentials!${NC}"
    read -p "Press Enter after updating .env..."
fi

# Step 2: Setup VPS
echo ""
echo -e "${YELLOW}📋 Step 2: Initial VPS setup${NC}"
npm run vps:setup

# Step 3: Upload secrets
echo ""
echo -e "${YELLOW}📋 Step 3: Upload secrets${NC}"
npm run vps:upload-secrets

# Step 4: Deploy
echo ""
echo -e "${YELLOW}📋 Step 4: Deploy engine code${NC}"
npm run vps:deploy

# Step 5: Start bot
echo ""
echo -e "${YELLOW}📋 Step 5: Start bot${NC}"
npm run vps:start

# Step 6: Verify
echo ""
echo -e "${YELLOW}📋 Step 6: Verify setup${NC}"
npm run vps:status

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  - View logs: npm run vps:logs"
echo "  - Check Firestore: https://console.firebase.google.com/project/hackathon-project-245ba/firestore"
echo "  - Deploy client: npm run deploy:hosting"
echo ""

