# 🚀 VPS Setup - Copy & Paste Commands

## Quick Start (All-in-One)

```bash
# Run the automated setup script
npm run vps:quick-setup
```

---

## Manual Step-by-Step

### Step 1: Install sshpass (Local Machine)

```bash
sudo apt-get install -y sshpass
```

### Step 2: Create User on VPS

```bash
# SSH as root
ssh root@46.224.114.187

# Create user
useradd -m -s /bin/bash aetheris
usermod -aG sudo aetheris
passwd aetheris

# Configure sudo
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user

# Exit
exit
```

### Step 3: Update .env

```bash
nano .env
# Change: User=aetheris
# Change: Password=<password you set>
```

### Step 4: Setup VPS

```bash
npm run vps:setup
```

### Step 5: Upload Secrets

```bash
npm run vps:upload-secrets
```

### Step 6: Deploy Code

```bash
npm run vps:deploy
```

### Step 7: Start Bot

```bash
npm run vps:start
```

### Step 8: Verify

```bash
npm run vps:status
npm run vps:logs
```

---

## All Commands Reference

```bash
# Setup
npm run vps:create-user      # Create non-root user
npm run vps:setup            # Install Node.js, PM2
npm run vps:upload-secrets   # Upload service-account.json
npm run vps:deploy           # Deploy engine code
npm run vps:start            # Start bot

# Management
npm run vps:status           # Check status
npm run vps:logs             # View logs
npm run vps:restart          # Restart bot
npm run vps:stop             # Stop bot

# Quick
npm run vps:quick-setup      # Run all setup steps
```

---

## Troubleshooting

```bash
# Check bot status
ssh aetheris@46.224.114.187 "pm2 list"

# View logs
ssh aetheris@46.224.114.187 "pm2 logs aetheris-engine --lines 50"

# Restart bot
ssh aetheris@46.224.114.187 "cd ~/aetheris-engine && pm2 restart aetheris-engine"

# Check files
ssh aetheris@46.224.114.187 "cd ~/aetheris-engine && ls -la"
```

