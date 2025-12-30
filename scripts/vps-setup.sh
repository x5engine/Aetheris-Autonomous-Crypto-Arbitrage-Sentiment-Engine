#!/bin/bash

# Aetheris VPS Setup Script
# Sets up the VPS server with all required dependencies and configurations
# Uses credentials from .env file

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Aetheris VPS Setup Script                       ║${NC}"
echo -e "${BLUE}║     Setting up Hetzner VPS for Aetheris Bot         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Load environment variables from .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "   Please create .env file with VPS credentials:"
    echo "   server=\"your-server-name\""
    echo "   IPv4=your-ip-address"
    echo "   User=your-username"
    echo "   Password=your-password"
    exit 1
fi

echo -e "${YELLOW}📋 Loading credentials from .env file...${NC}"
source .env

# Validate credentials
if [ -z "$server" ] || [ -z "$IPv4" ] || [ -z "$User" ] || [ -z "$Password" ]; then
    echo -e "${RED}❌ Error: Missing credentials in .env file${NC}"
    echo "   Required: server, IPv4, User, Password"
    exit 1
fi

# Extract IP from IPv4 (remove /32 if present)
VPS_IP=$(echo "$IPv4" | cut -d'/' -f1)
VPS_USER="$User"
VPS_PASSWORD="$Password"
VPS_HOST="$VPS_IP"

echo -e "${GREEN}✅ Credentials loaded${NC}"
echo -e "${BLUE}   Server: ${server}${NC}"
echo -e "${BLUE}   IP: ${VPS_IP}${NC}"
echo -e "${BLUE}   User: ${VPS_USER}${NC}"
echo ""

# Check SSH connection method (SSH keys first, then sshpass fallback)
echo -e "${YELLOW}🔌 Testing SSH connection to VPS...${NC}"

# Try SSH with keys first (no password needed)
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_IP" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful (using SSH keys)${NC}"
    USE_SSHPASS=false
    SSH_CMD="ssh"
# If SSH keys don't work, try with sshpass (password)
elif command -v sshpass &> /dev/null; then
    if sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$VPS_USER@$VPS_IP" "echo 'Connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ SSH connection successful (using password)${NC}"
        USE_SSHPASS=true
        SSH_CMD="sshpass -p \"$VPS_PASSWORD\" ssh"
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

echo ""
echo -e "${YELLOW}📦 Step 1: Installing Node.js 20 on VPS...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    # Configure passwordless sudo first (if not root)
    if [ "$(id -u)" -ne 0 ]; then
        echo "Configuring passwordless sudo for apt-get and npm..."
        echo "$USER ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node" | sudo tee /etc/sudoers.d/aetheris-user > /dev/null 2>&1
        sudo chmod 0440 /etc/sudoers.d/aetheris-user 2>/dev/null || true
    fi
    
    # Update system (use sudo if not root)
    echo "Updating system packages..."
    export DEBIAN_FRONTEND=noninteractive
    if [ "$(id -u)" -eq 0 ]; then
        apt-get update -qq
    else
        sudo apt-get update -qq
    fi
    
    # Install nvm if not already installed
    if [ ! -d "$HOME/.nvm" ]; then
        echo "Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        # Add to .bashrc for persistence
        echo '' >> "$HOME/.bashrc"
        echo 'export NVM_DIR="$HOME/.nvm"' >> "$HOME/.bashrc"
        echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> "$HOME/.bashrc"
        echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> "$HOME/.bashrc"
    fi
    
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Install Node.js 20 using nvm
    if ! command -v node &> /dev/null || [ "$(node --version | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
        echo "Installing Node.js 20 via nvm..."
        nvm install 20
        nvm use 20
        nvm alias default 20
    else
        echo "Node.js already installed, ensuring nvm is set up..."
        nvm use 20 2>/dev/null || nvm install 20 && nvm use 20
        nvm alias default 20
    fi
    
    # Verify installation
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node --version)
        NPM_VERSION=$(npm --version)
        echo "✅ Node.js installed: $NODE_VERSION"
        echo "✅ npm installed: $NPM_VERSION"
    else
        echo "❌ Node.js/npm installation failed"
        exit 1
    fi
ENDSSH

echo ""
echo -e "${YELLOW}📦 Step 2: Installing PM2 globally...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20
    
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
        
        # Add PM2 to PATH for current session
        export PATH="$HOME/.nvm/versions/node/$(nvm current)/bin:$PATH"
        
        # Verify PM2 was actually installed
        if command -v pm2 &> /dev/null; then
            PM2_VERSION=$(pm2 --version)
            echo "✅ PM2 installed: $PM2_VERSION"
        else
            echo "❌ PM2 installation failed"
            exit 1
        fi
    else
        PM2_VERSION=$(pm2 --version)
        echo "✅ PM2 already installed: $PM2_VERSION"
    fi
    
    # Set up PM2 startup script
    pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || echo "⚠️  PM2 startup script setup skipped (may need manual setup)"
ENDSSH

echo ""
echo -e "${YELLOW}📁 Step 3: Creating project directory on VPS...${NC}"
eval "$SSH_CMD $VPS_USER@$VPS_IP" << 'ENDSSH'
    PROJECT_DIR="$HOME/aetheris-engine"
    if [ ! -d "$PROJECT_DIR" ]; then
        mkdir -p "$PROJECT_DIR"
        echo "✅ Created directory: $PROJECT_DIR"
    else
        echo "✅ Directory already exists: $PROJECT_DIR"
    fi
ENDSSH

echo ""
echo -e "${YELLOW}📋 Step 4: Checking for service-account.json...${NC}"
# Check multiple locations for service account file
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
    echo ""
    echo "   Please download it from Firebase Console:"
    echo "   1. Go to Firebase Console → Project Settings → Service Accounts"
    echo "   2. Click 'Generate New Private Key'"
    echo "   3. Save in project root or engine/ directory"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ service-account.json found: $SERVICE_ACCOUNT_FILE${NC}"
fi

echo ""
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Upload service-account.json to VPS (if not done)"
echo "   2. Run deployment script: ./scripts/vps-deploy.sh"
echo "   3. Start the bot: ./scripts/vps-start.sh"
echo ""

