# Aetheris Quick Start - New Architecture

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
# Install all dependencies (client + engine)
npm run setup

# Or install separately:
npm run client:install
npm run engine:install
```

### Step 2: Deploy Firestore

```bash
# Deploy rules and indexes
firebase deploy --only firestore
```

### Step 3: Run Locally (Development)

#### Client Dashboard
```bash
cd client
npm run dev
# Opens at http://localhost:3000
```

#### Engine Bot (Local Testing)
```bash
cd engine
# Add service-account.json and .env first
npm run dev
```

## 📦 Production Deployment

### VPS Bot Setup
1. SSH into Hetzner VPS
2. Clone repo: `git clone <repo>`
3. Navigate to `engine/`
4. Add `service-account.json` and `.env`
5. Install PM2: `npm install -g pm2`
6. Start: `pm2 start bot.js --name "aetheris-engine"`

### Client Dashboard
```bash
cd client
npm run build
firebase deploy --only hosting
```

## ✅ Verification

- **Firestore**: Check `live_feed` and `alerts` collections
- **VPS Bot**: `pm2 logs aetheris-engine`
- **Dashboard**: Visit deployed URL

## 📚 Documentation

- **Full Deployment**: See `DEPLOYMENT_NEW.md`
- **VPS Bot**: See `engine/README.md`
- **Architecture**: See `README.md`

