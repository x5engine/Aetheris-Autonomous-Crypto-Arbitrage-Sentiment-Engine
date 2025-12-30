#!/bin/bash

# Helper script to install sshpass (optional)
# Run this manually if you want to install sshpass

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Installing sshpass...${NC}"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Detected Linux. Installing via apt-get..."
    sudo apt-get update && sudo apt-get install -y sshpass
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ sshpass installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install sshpass${NC}"
        exit 1
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS. Installing via Homebrew..."
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}❌ Homebrew not found. Please install Homebrew first.${NC}"
        exit 1
    fi
    brew install hudochenkov/sshpass/sshpass
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ sshpass installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install sshpass${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Unsupported OS. Please install sshpass manually.${NC}"
    exit 1
fi

