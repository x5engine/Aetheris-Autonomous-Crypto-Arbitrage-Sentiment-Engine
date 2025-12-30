#!/bin/bash

# Aetheris VPS User Creation Script
# Creates a non-root user with sudo privileges for running the bot

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS User Creation Script              ║${NC}"
echo -e "${BLUE}║     Creating non-root user with sudo privileges     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables from .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

source .env

# Validate root credentials
if [ -z "$server" ] || [ -z "$IPv4" ] || [ -z "$User" ] || [ -z "$Password" ]; then
    echo -e "${RED}❌ Error: Missing credentials in .env file${NC}"
    exit 1
fi

# Extract IP from IPv4
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
ROOT_USER="$User"
ROOT_PASSWORD="$Password"

# Default username (can be overridden)
NEW_USER="${VPS_USER:-aetheris}"

echo -e "${YELLOW}📋 Creating user: ${NEW_USER}${NC}"
echo -e "${BLUE}   Server: ${VPS_IP}${NC}"
echo -e "${BLUE}   Root User: ${ROOT_USER}${NC}"
echo ""

# Check if sshpass is available
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass not found. Please install it first.${NC}"
    exit 1
fi

# Test root connection first
echo -e "${YELLOW}🔌 Testing root connection...${NC}"
if ! sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$ROOT_USER@$VPS_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Failed to connect to VPS as root${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Root connection successful${NC}"
echo ""

# Create user and configure
echo -e "${YELLOW}👤 Step 1: Creating user '${NEW_USER}'...${NC}"
sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no "$ROOT_USER@$VPS_IP" << ENDSSH
    # Check if user already exists
    if id "$NEW_USER" &>/dev/null; then
        echo "⚠️  User '$NEW_USER' already exists"
        read -p "Delete and recreate? (y/n) " -n 1 -r
        echo
        if [[ \$REPLY =~ ^[Yy]\$ ]]; then
            userdel -r "$NEW_USER" 2>/dev/null || true
        else
            echo "Keeping existing user"
            exit 0
        fi
    fi
    
    # Create user with home directory
    useradd -m -s /bin/bash "$NEW_USER"
    echo "✅ User '$NEW_USER' created"
    
    # Add to sudo group
    usermod -aG sudo "$NEW_USER"
    echo "✅ Added to sudo group"
    
    # Set up passwordless sudo for specific commands (optional, more secure)
    echo "$NEW_USER ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node" > /etc/sudoers.d/aetheris-user
    chmod 0440 /etc/sudoers.d/aetheris-user
    echo "✅ Configured sudo permissions"
    
    # Create .ssh directory for the new user
    mkdir -p /home/$NEW_USER/.ssh
    chmod 700 /home/$NEW_USER/.ssh
    chown -R $NEW_USER:$NEW_USER /home/$NEW_USER/.ssh
    echo "✅ Created .ssh directory"
ENDSSH

echo ""
echo -e "${YELLOW}🔐 Step 2: Setting up SSH key authentication (optional)...${NC}"
read -p "Do you want to set up SSH key authentication? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f ~/.ssh/id_rsa.pub ]; then
        echo "   Copying your public key to the new user..."
        sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no "$ROOT_USER@$VPS_IP" << ENDSSH
            cat >> /home/$NEW_USER/.ssh/authorized_keys << 'KEY'
$(cat ~/.ssh/id_rsa.pub)
KEY
            chmod 600 /home/$NEW_USER/.ssh/authorized_keys
            chown -R $NEW_USER:$NEW_USER /home/$NEW_USER/.ssh
            echo "✅ SSH key added"
ENDSSH
    else
        echo -e "${YELLOW}⚠️  No SSH public key found at ~/.ssh/id_rsa.pub${NC}"
        echo "   You can add it manually later"
    fi
fi

echo ""
echo -e "${YELLOW}🔑 Step 3: Setting password for new user...${NC}"
read -sp "Enter password for user '$NEW_USER': " NEW_USER_PASSWORD
echo
read -sp "Confirm password: " NEW_USER_PASSWORD_CONFIRM
echo

if [ "$NEW_USER_PASSWORD" != "$NEW_USER_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Passwords don't match${NC}"
    exit 1
fi

sshpass -p "$ROOT_PASSWORD" ssh -o StrictHostKeyChecking=no "$ROOT_USER@$VPS_IP" << ENDSSH
    echo "$NEW_USER:$NEW_USER_PASSWORD" | chpasswd
    echo "✅ Password set for user '$NEW_USER'"
ENDSSH

echo ""
echo -e "${GREEN}✅ User creation complete!${NC}"
echo ""
echo -e "${BLUE}📝 User Information:${NC}"
echo "   Username: $NEW_USER"
echo "   Home: /home/$NEW_USER"
echo "   Sudo: Enabled"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. Update .env file:"
echo "      User=$NEW_USER"
echo "      Password=<the password you just set>"
echo ""
echo "   2. Test connection:"
echo "      ssh $NEW_USER@$VPS_IP"
echo ""
echo "   3. Run setup:"
echo "      npm run vps:setup"
echo ""

