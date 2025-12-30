# Aetheris New Architecture Deployment Guide

## 🎯 New Architecture Overview

**Hybrid Architecture:**
- **Client** (`client/`): React dashboard with client-side AI
- **Engine** (`engine/`): VPS bot running on Hetzner (static IP)
- **Firebase**: Firestore only (no Functions)

## 📋 Deployment Steps

### Step 1: Deploy Firestore Rules & Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Step 2: Set Up VPS Bot (Hetzner)

1. **SSH into your Hetzner VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd aetheris-protocol/engine
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Set up Firebase Service Account:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file
   - Upload to VPS: `scp service-account.json user@vps:/path/to/engine/`

5. **Configure WEEX API credentials:**
   ```bash
   # Create .env file
   nano .env
   ```
   
   Add:
   ```env
   WEEX_API_KEY=your_weex_api_key
   WEEX_SECRET_KEY=your_weex_secret_key
   WEEX_PASSPHRASE=your_weex_passphrase
   WEEX_API_DOMAIN=https://api-contract.weex.com
   ```

6. **Whitelist VPS IP in WEEX:**
   - Get your VPS IP: `curl ifconfig.me`
   - Add IP to WEEX API whitelist in WEEX dashboard

7. **Install PM2 and start bot:**
   ```bash
   npm install -g pm2
   pm2 start bot.js --name "aetheris-engine"
   pm2 save
   pm2 startup  # Set up auto-start on boot
   ```

8. **Monitor bot:**
   ```bash
   pm2 logs aetheris-engine
   pm2 status
   ```

### Step 3: Deploy Client Dashboard

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   # .env is already configured with your Firebase credentials
   # If needed, create .env.local for overrides
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

   **Your app will be live at:** `https://hackathon-project-245ba.web.app`

### Alternative: Deploy to Vercel/Netlify

```bash
# Vercel
cd client
vercel deploy

# Netlify
cd client
netlify deploy --prod
```

## ✅ Verification

### Check VPS Bot
```bash
# SSH into VPS
pm2 logs aetheris-engine --lines 50

# Should see:
# ✅ Firebase Admin initialized
# 📊 BTC_USDT: WEEX=42050.00, Other=42100.00, Spread=1.19%
```

### Check Firestore Data
1. Go to Firebase Console → Firestore Database
2. Check `live_feed` collection (should update every 3 seconds)
3. Check `alerts` collection (should have entries when spread > 1%)

### Check Dashboard
1. Visit `https://hackathon-project-245ba.web.app`
2. Should see live market feed updating
3. Should see alerts when arbitrage detected
4. AI sentiment analysis should work

## 🔧 Troubleshooting

### Bot Not Writing to Firestore
- ✅ Check `service-account.json` exists and is valid
- ✅ Verify Firebase project ID matches
- ✅ Check VPS can reach Firebase (test: `curl https://firestore.googleapis.com`)

### Dashboard Not Updating
- ✅ Check Firestore rules allow read access
- ✅ Verify Firebase config in client
- ✅ Check browser console for errors

### WEEX API Errors
- ✅ Verify API credentials in `.env`
- ✅ Check IP is whitelisted in WEEX dashboard
- ✅ Test API connection: `curl https://api-contract.weex.com/capi/v2/market/time`

## 📊 Monitoring

### VPS Bot Logs
```bash
pm2 logs aetheris-engine
pm2 monit
```

### Firestore Data
- Firebase Console → Firestore Database
- Monitor `live_feed` and `alerts` collections

### Dashboard
- Check browser console
- Verify real-time updates working

## 🚀 Quick Commands

```bash
# Root level
npm run setup              # Install all dependencies
npm run client:dev        # Run client dev server
npm run client:build      # Build client
npm run deploy:hosting    # Deploy client to Firebase

# Engine (on VPS)
cd engine
npm run dev               # Development mode
pm2 start bot.js          # Production mode
pm2 logs                  # View logs
```

## 📝 Next Steps

1. ✅ Deploy Firestore rules
2. ✅ Set up VPS bot
3. ✅ Deploy client dashboard
4. ✅ Monitor and verify everything works
5. ✅ Test arbitrage detection
6. ✅ Test AI sentiment analysis

