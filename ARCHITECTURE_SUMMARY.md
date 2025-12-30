# Aetheris Architecture Summary

## ✅ Migration Complete - Hybrid Architecture Implemented

### What Was Changed

1. **❌ Removed Firebase Functions**
   - Deleted entire `functions/` directory
   - Removed all Cloud Functions code
   - Removed Functions deployment configuration

2. **✅ Implemented Hybrid Architecture**
   - **Client** (React Frontend) - Browser-based AI + Dashboard
   - **Engine** (VPS Bot) - Node.js bot on Hetzner VPS
   - **Firebase** - Only Firestore (database) + Hosting (optional)

## Architecture Components

### 1. Client (Frontend)
**Location**: `client/` or root `src/`

**Technology**:
- React + Vite
- Transformers.js (browser-based AI)
- Firebase Client SDK (read-only Firestore)

**Responsibilities**:
- Display real-time market data from `live_feed` collection
- Show arbitrage alerts from `alerts` collection
- Run sentiment analysis using Transformers.js
- Update alerts with AI validation results

**Collections Used**:
- `live_feed` - Real-time prices (read-only)
- `alerts` - Arbitrage opportunities (read + update for AI validation)

### 2. Engine (VPS Bot)
**Location**: `engine/`

**Technology**:
- Node.js
- Firebase Admin SDK
- Axios (WEEX API)
- PM2 (process manager)

**Responsibilities**:
- Poll WEEX API every 3 seconds (static IP requirement)
- Calculate arbitrage spreads
- Write to `live_feed` collection
- Create `alerts` when opportunities detected

**Collections Written**:
- `live_feed` - Market prices
- `alerts` - Arbitrage opportunities

### 3. Firebase
**Services Used**:
- **Firestore** - Real-time database
- **Hosting** - Optional, for frontend deployment

**Services NOT Used**:
- ❌ Cloud Functions (removed)
- ❌ Authentication (optional, can be added later)

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    WEEX API                             │
│              (Requires Static IP)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Polls every 3s
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Hetzner VPS (Static IP)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  engine/bot.js                                    │  │
│  │  - Fetches WEEX prices                           │  │
│  │  - Calculates spreads                            │  │
│  │  - Detects arbitrage                             │  │
│  └──────────────────┬───────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────┘
                     │
                     │ Writes via Admin SDK
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Firebase Firestore                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │ live_feed    │         │ alerts       │            │
│  │ (prices)     │         │ (opportunities)          │
│  └──────────────┘         └──────────────┘            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Real-time listeners (onSnapshot)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              React Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Dashboard                                        │  │
│  │  - Displays live_feed data                       │  │
│  │  - Shows alerts                                  │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                    │
│  ┌──────────────────▼──────────────────────────────┐  │
│  │  Transformers.js (AI)                          │  │
│  │  - Analyzes sentiment                          │  │
│  │  - Validates trades                           │  │
│  │  - Updates alerts with AI results             │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Key Benefits

1. **Static IP Compliance**: VPS provides fixed IP for WEEX API whitelisting
2. **Zero-Latency AI**: Transformers.js runs in browser, no server costs
3. **Real-Time Sync**: Firestore provides instant updates to frontend
4. **Cost Effective**: $5 VPS vs expensive serverless functions
5. **Scalable**: Can add more VPS nodes if needed

## File Structure

```
aetheris-protocol/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # UI Components
│   │   ├── hooks/            # useLiveFeed, useAlerts
│   │   ├── lib/              # Firebase, strategies
│   │   └── ai/               # Transformers.js logic
│   └── package.json
│
├── engine/                    # VPS Bot
│   ├── bot.js                # Main polling loop
│   ├── utils/                 # WEEX API, math
│   ├── service-account.json  # Firebase Admin (secret)
│   └── package.json
│
├── firestore.rules            # Security rules
├── firestore.indexes.json     # Database indexes
├── firebase.json              # Firebase config (no functions)
└── README.md                  # Updated architecture docs
```

## Deployment Status

✅ **Firestore Rules & Indexes**: Deployed
✅ **Client Code**: Ready for deployment
✅ **Engine Bot**: Ready for VPS deployment
❌ **Firebase Functions**: Removed (not needed)

## Next Steps

1. **Deploy Firestore** (already done)
2. **Set up VPS Bot** on Hetzner
3. **Deploy Client** to Firebase Hosting/Vercel/Netlify
4. **Monitor** bot logs and Firestore data

## Migration Checklist

- [x] Remove Firebase Functions directory
- [x] Remove Functions references from code
- [x] Update Firestore rules for new collections
- [x] Update Firestore indexes
- [x] Create new hooks (useLiveFeed, useAlerts)
- [x] Update trade execution logic
- [x] Update README.md
- [x] Deploy Firestore rules and indexes
- [x] Update verification script
- [x] Create deployment guide

## Status: ✅ COMPLETE

The migration to hybrid architecture is complete. The system is ready for:
- VPS bot deployment on Hetzner
- Client deployment to hosting platform
- Production use

