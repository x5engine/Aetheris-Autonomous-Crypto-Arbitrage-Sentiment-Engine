# VPS Deployment Guide

## Overview

This guide explains how to deploy the Aetheris engine bot to your Hetzner VPS using the automated scripts.

## Prerequisites

1. **VPS Credentials in `.env`**
   ```env
   server="ubuntu-4gb-nbg1-2"
   IPv4=46.224.114.187/32
   User=aetheris
   Password=your_password
   ```

2. **Required Tools**
   - `sshpass` (for password-based SSH) - Install manually:
     ```bash
     # Ubuntu/Debian
     sudo apt-get install -y sshpass
     
     # macOS
     brew install hudochenkov/sshpass/sshpass
     
     # Or use helper script
     ./scripts/install-sshpass.sh
     ```
   - `rsync` or `scp` (for file transfer) - Usually pre-installed

3. **Firebase Service Account**
   - Download `service-account.json` from Firebase Console
   - Place it in `engine/service-account.json`

## Quick Start

### Step 1: Initial VPS Setup

```bash
# Install dependencies and configure VPS
npm run vps:setup
```

This script will:
- ✅ Test SSH connection
- ✅ Install Node.js 20
- ✅ Install PM2 globally
- ✅ Create project directory
- ✅ Verify setup

### Step 2: Upload Secrets

```bash
# Upload service-account.json and configure .env
npm run vps:upload-secrets
```

This will:
- ✅ Upload `service-account.json` to VPS
- ✅ Help you create `.env` file with WEEX credentials

### Step 3: Deploy Engine Code

```bash
# Deploy bot code to VPS
npm run vps:deploy
```

This will:
- ✅ Package engine files
- ✅ Upload to VPS
- ✅ Install dependencies
- ✅ Verify deployment

### Step 4: Start the Bot

```bash
# Start the bot with PM2
npm run vps:start
```

The bot will:
- ✅ Start polling WEEX API every 3 seconds
- ✅ Write to Firestore `live_feed` collection
- ✅ Create `alerts` for arbitrage opportunities

## Management Commands

### View Logs
```bash
npm run vps:logs          # Last 50 lines
npm run vps:logs 100      # Last 100 lines
```

### Check Status
```bash
npm run vps:status
```

### Restart Bot
```bash
npm run vps:restart
```

### Stop Bot
```bash
npm run vps:stop
```

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. SSH to VPS
```bash
ssh root@46.224.114.187
```

### 2. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

### 3. Install PM2
```bash
npm install -g pm2
```

### 4. Clone/Upload Code
```bash
mkdir -p ~/aetheris-engine
cd ~/aetheris-engine
# Upload files here
```

### 5. Install Dependencies
```bash
npm install --production
```

### 6. Configure Environment
```bash
nano .env
# Add:
# WEEX_API_KEY=your_key
# WEEX_SECRET_KEY=your_secret
# WEEX_PASSPHRASE=your_passphrase
# WEEX_API_DOMAIN=https://api-contract.weex.com
```

### 7. Start Bot
```bash
pm2 start bot.js --name "aetheris-engine"
pm2 save
pm2 startup
```

## Verification

### Check Bot is Running
```bash
npm run vps:status
```

### Check Firestore Data
1. Go to Firebase Console → Firestore
2. Check `live_feed` collection - should have price data
3. Check `alerts` collection - should have opportunities when detected

### Check Bot Logs
```bash
npm run vps:logs
```

Should see:
```
✅ Firebase Admin initialized
📊 BTC_USDT: WEEX=42050.00, Other=42100.00, Spread=0.12%
```

## Troubleshooting

### SSH Connection Failed
- Verify IP address in `.env`
- Check VPS is running
- Verify firewall allows SSH (port 22)

### Bot Not Starting
- Check `service-account.json` exists on VPS
- Check `.env` file has WEEX credentials
- Check Node.js version: `node --version` (should be 20+)

### No Data in Firestore
- Check bot logs: `npm run vps:logs`
- Verify Firebase service account has write permissions
- Check WEEX API credentials are correct

### PM2 Issues
```bash
# SSH to VPS and run:
pm2 list
pm2 logs aetheris-engine
pm2 restart aetheris-engine
```

## Security Notes

⚠️ **IMPORTANT**:
- `.env` file is in `.gitignore` - NEVER COMMIT IT
- `service-account.json` is in `.gitignore` - NEVER COMMIT IT
- VPS credentials are sensitive - keep them secure
- Use SSH keys instead of passwords in production (recommended)

## Production Recommendations

1. **Use SSH Keys** instead of passwords
2. **Set up firewall** on VPS
3. **Monitor bot** with PM2 monitoring
4. **Set up alerts** for bot failures
5. **Regular backups** of service-account.json
6. **Rotate credentials** periodically

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `vps-setup.sh` | Initial VPS setup (Node.js, PM2) |
| `vps-deploy.sh` | Deploy engine code to VPS |
| `vps-start.sh` | Start bot with PM2 |
| `vps-stop.sh` | Stop bot |
| `vps-restart.sh` | Restart bot |
| `vps-logs.sh` | View bot logs |
| `vps-status.sh` | Check bot status |
| `vps-upload-secrets.sh` | Upload secrets securely |

## Support

For issues:
1. Check bot logs: `npm run vps:logs`
2. Check VPS status: `npm run vps:status`
3. Verify Firestore data in Firebase Console
4. Check WEEX API credentials

