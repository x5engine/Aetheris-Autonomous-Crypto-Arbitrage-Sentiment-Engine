# Aetheris Deployment Guide - Hybrid Architecture

## Overview

Aetheris uses a hybrid architecture:
- **VPS Bot** (Hetzner) - Polls WEEX API, writes to Firestore
- **Client** (React) - Reads from Firestore, runs AI sentiment analysis
- **Firebase** - Firestore database + Hosting (optional)

## Step 1: Deploy Firestore Rules & Indexes

```bash
# Deploy security rules and indexes
firebase deploy --only firestore
```

This deploys:
- Security rules for `live_feed` and `alerts` collections
- Database indexes for efficient queries

## Step 2: Set Up VPS Bot (Hetzner)

### Prerequisites
- Hetzner VPS with static IP
- Node.js 20+ installed
- PM2 installed globally

### Setup Steps

1. **Generate Firebase Service Account**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `engine/service-account.json`
   - ⚠️ **DO NOT COMMIT THIS FILE**

2. **SSH into VPS**
   ```bash
   ssh user@your-vps-ip
   ```

3. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd aetheris-protocol/engine
   
   # Upload service-account.json to this directory
   # (use scp or sftp)
   
   # Install dependencies
   npm install
   
   # Install PM2
   npm install -g pm2
   ```

4. **Configure Environment**
   Create `.env` file in `engine/`:
   ```env
   WEEX_API_KEY=your_weex_api_key
   WEEX_SECRET_KEY=your_weex_secret_key
   WEEX_PASSPHRASE=your_weex_passphrase
   WEEX_API_DOMAIN=https://api-contract.weex.com
   ```

5. **Start Bot**
   ```bash
   pm2 start bot.js --name "aetheris-engine"
   pm2 save
   pm2 startup  # Enable auto-start on reboot
   ```

6. **Monitor Bot**
   ```bash
   pm2 logs aetheris-engine
   pm2 status
   ```

## Step 3: Deploy Client (Frontend)

### Option A: Firebase Hosting

```bash
cd client
npm install
npm run build
cd ..
firebase deploy --only hosting
```

Your app will be at: `https://hackathon-project-245ba.web.app`

### Option B: Vercel

```bash
cd client
npm install
npm run build

# Deploy to Vercel
vercel deploy
```

### Option C: Netlify

```bash
cd client
npm install
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## Verification

### Check VPS Bot
```bash
# SSH into VPS
pm2 logs aetheris-engine --lines 50

# Should see:
# ✅ Firebase Admin initialized
# 📊 BTC_USDT: WEEX=42050.00, Other=42100.00, Spread=0.12%
```

### Check Firestore Data
1. Go to Firebase Console → Firestore Database
2. Check `live_feed` collection - should have real-time price data
3. Check `alerts` collection - should have arbitrage opportunities

### Check Frontend
1. Open deployed URL
2. Should see real-time market data updating
3. Should see alerts appearing when arbitrage detected

## Troubleshooting

### Bot Not Writing to Firestore
- Check `service-account.json` exists in `engine/` directory
- Check Firebase service account has Firestore write permissions
- Check bot logs: `pm2 logs aetheris-engine`

### Frontend Not Showing Data
- Check Firestore rules allow read access
- Check browser console for errors
- Verify Firebase config in `.env` file

### WEEX API Errors
- Verify API credentials in `engine/.env`
- Check VPS IP is whitelisted in WEEX
- Check bot logs for specific error messages

## Architecture Diagram

```
┌─────────────────┐
│  Hetzner VPS    │
│  (Static IP)    │
│                 │
│  bot.js         │───Polls every 3s───▶ WEEX API
│  (PM2)          │
└────────┬────────┘
         │
         │ Writes via Admin SDK
         ▼
┌─────────────────┐
│  Firebase       │
│  Firestore      │
│  - live_feed    │
│  - alerts       │
└────────┬────────┘
         │
         │ Real-time listeners (onSnapshot)
         ▼
┌─────────────────┐
│  React Client   │
│  (Browser)      │
│                 │
│  - Dashboard    │
│  - AI Analysis  │
│  - Trade UI     │
└─────────────────┘
```

## Maintenance

### Update Bot
```bash
# SSH to VPS
cd aetheris-protocol/engine
git pull
npm install
pm2 restart aetheris-engine
```

### View Bot Logs
```bash
pm2 logs aetheris-engine
pm2 logs aetheris-engine --lines 100
```

### Restart Bot
```bash
pm2 restart aetheris-engine
```

### Stop Bot
```bash
pm2 stop aetheris-engine
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `service-account.json` to git
- Never commit `.env` files with API keys
- Use Firebase service account with minimal required permissions
- Keep VPS updated and secured
- Monitor bot logs regularly

