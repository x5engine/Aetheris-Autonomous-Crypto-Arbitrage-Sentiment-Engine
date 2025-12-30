#!/bin/bash

# Simple commands to create a user on the VPS
# Run these commands manually or use this script

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Manual User Creation Commands                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load credentials
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

source .env
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
ROOT_USER="$User"
ROOT_PASSWORD="$Password"
NEW_USER="aetheris"

echo -e "${YELLOW}📋 Commands to run on VPS:${NC}"
echo ""
echo -e "${GREEN}# 1. SSH to VPS as root${NC}"
echo "ssh $ROOT_USER@$VPS_IP"
echo ""
echo -e "${GREEN}# 2. Create new user${NC}"
echo "useradd -m -s /bin/bash $NEW_USER"
echo ""
echo -e "${GREEN}# 3. Add to sudo group${NC}"
echo "usermod -aG sudo $NEW_USER"
echo ""
echo -e "${GREEN}# 4. Set password for new user${NC}"
echo "passwd $NEW_USER"
echo ""
echo -e "${GREEN}# 5. Configure passwordless sudo for npm/node (optional)${NC}"
echo "echo '$NEW_USER ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user"
echo "sudo chmod 0440 /etc/sudoers.d/aetheris-user"
echo ""
echo -e "${YELLOW}📝 After creating user, update .env file:${NC}"
echo "   User=$NEW_USER"
echo "   Password=<password you set>"
echo ""
echo -e "${BLUE}Or run the automated script:${NC}"
echo "   ./scripts/vps-create-user.sh"
echo ""

