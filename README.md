# Aetheris: Hybrid AI Trading & Sentiment Engine

**Version:** 1.1.0 (Hackathon Edition)  
**Architecture:** Hybrid (Client-Side AI + VPS Execution Node)  
**Submission Date:** 2025/12/01  
**Category:** DeFi / AI / Fintech  

## 1. Executive Summary

Aetheris is a real-time arbitrage and sentiment analysis platform. It overcomes strict API IP-whitelisting constraints by utilizing a **Hybrid Architecture**:

1. **The Intelligence Layer (Frontend):** Runs local AI models in the browser for zero-latency sentiment analysis.
2. **The Execution Layer (VPS):** A dedicated, static-IP Node.js engine hosted on Hetzner that handles sensitive API polling (WEEX) and arbitrage logic.
3. **The Sync Layer (Firebase):** Acts as a real-time message bus, syncing the VPS state to the User Dashboard instantly.

---

## 2. System Architecture

```mermaid
graph LR
    A[Hetzner VPS (Node.js)] -->|1. Polls WEEX API (Static IP)| B(External Crypto Exchanges)
    A -->|2. Pushes Market Data| C(Firebase Firestore)
    D[React Dashboard] -->|3. Listens (onSnapshot)| C
    D -->|4. Runs Local AI| E[Transformers.js]
    E -->|5. Validates Trade| D
```

### Why this stack?

* **Static IP Requirement:** WEEX requires a fixed IP for API access. Serverless functions (Lambda/GCP) rotate IPs. We use a lightweight Hetzner VPS to guarantee a static identity.
* **Real-time Sync:** Firestore acts as the bridge. The VPS writes data, and the React frontend updates automatically without manual refreshing.
* **Zero-Latency AI:** Transformers.js runs directly in the browser, eliminating network round-trips for sentiment analysis.

---

## 3. Project Structure

The repository is split into two distinct environments:

```text
aetheris-protocol/
├── client/                     # THE DASHBOARD (React + Vite)
│   ├── src/
│   │   ├── ai/                 # Transformers.js sentiment logic
│   │   ├── components/         # UI Visuals
│   │   ├── hooks/              # Firestore real-time listeners
│   │   └── lib/firebase.js    # Client SDK config
│   ├── package.json
│   └── vite.config.js
│
├── engine/                     # THE BOT (Runs on Hetzner VPS)
│   ├── bot.js                  # Main loop (Polling + Logic)
│   ├── utils/                  # WEEX API, math utilities
│   ├── service-account.json    # Secret Key (Do NOT commit this)
│   └── package.json            # Deps: firebase-admin, axios
│
├── firestore.rules             # Security rules
├── firestore.indexes.json      # Database indexes
├── firebase.json               # Firebase config
└── README.md
```

---

## 4. Technical Implementation

### A. The Engine (VPS / Backend)

A persistent Node.js process managed by `PM2`.

* **Role:** Market Maker & Data Ingestor.
* **Permissions:** Uses `firebase-admin` service account to write to the DB with privileged access.
* **Logic:**
  * Polls WEEX API every 3 seconds.
  * Calculates arbitrage spreads.
  * Writes to `live_feed` collection (real-time prices).
  * Creates `alerts` collection entries when arbitrage opportunities are detected.

### B. The Client (React / Frontend)

* **Role:** Decision Support & Visualization.
* **Permissions:** Standard Firebase Client SDK (Read-Only on market data, can update alerts for AI validation).
* **AI:** Uses `@xenova/transformers` to analyze news feeds locally.
* **Real-time:** Listens to Firestore `live_feed` and `alerts` collections via `onSnapshot`.

---

## 5. Data Schema (Firestore)

### Collection: `live_feed` (Written by VPS)
Stores real-time market prices from WEEX.
```json
{
  "docId": "BTC_USDT",
  "price": 42050.00,
  "exchange": "WEEX",
  "last_updated": "2025-12-01T12:00:00Z"
}
```

### Collection: `alerts` (Written by VPS, Updated by Frontend)
Arbitrage opportunities detected by the VPS bot.
```json
{
  "type": "ARBITRAGE",
  "spread": 1.2,
  "buy_at": "WEEX",
  "sell_at": "BINANCE",
  "status": "PENDING",
  "ai_validation": {
    "sentiment_score": 0.88,
    "approval": true
  },
  "created_at": "2025-12-01T12:00:00Z"
}
```

---

## 6. Deployment Guide

### Phase 1: Database & Auth (Firebase)

1. Create Firebase Project: `hackathon-project-245ba` (already done)
2. Enable **Firestore Database**.
3. **Generate Private Key:** 
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `engine/service-account.json` (DO NOT COMMIT)

### Phase 2: The Bot (Hetzner VPS)

1. SSH into VPS.
2. Clone repo and navigate to `/engine`.
3. Upload `service-account.json` to this folder.
4. Install & Run:
   ```bash
   npm install
   npm install -g pm2
   pm2 start bot.js --name "aetheris-engine"
   pm2 save
   pm2 startup
   ```

### Phase 3: The Dashboard (Firebase Hosting / Vercel / Netlify)

1. Navigate to `/client`.
2. Create `.env.local` with your public Firebase Config (already in `.env`).
3. Build:
   ```bash
   npm run build
   ```
4. Deploy:
   ```bash
   # Firebase Hosting
   firebase deploy --only hosting
   
   # Or Vercel/Netlify
   # Upload 'dist' folder or git push
   ```

---

## 7. Feature Breakdown

1. **Arbitrage Opportunity Detector:** Implemented via VPS bot polling WEEX API every 3 seconds.
2. **Sentiment Analysis Trading Bot:** Implemented via in-browser Transformers.js analyzing text inputs.
3. **Real-Time Market Sentiment Dashboard:** Visualized in the React frontend using real-time Firestore listeners.
4. **AI-Enhanced Security / Risk Management:** Implemented as a pre-trade check that prevents execution if volatility or negative sentiment exceeds a threshold.
5. **Hybrid Architecture:** VPS handles API calls (static IP), frontend handles AI (zero latency).

---

## 8. Vision (Hackathon Pitch)

**Aetheris** replaces complex, expensive institutional trading infrastructures with a $5 VPS and browser-based AI. We prove that you don't need a hedge fund's budget to run a high-frequency, sentiment-aware arbitrage desk—just smart architecture.

---

## 9. Quick Start

```bash
# 1. Install dependencies
cd client && npm install
cd ../engine && npm install

# 2. Configure Firebase
# Add service-account.json to engine/ directory

# 3. Start VPS bot
cd engine
pm2 start bot.js --name "aetheris-engine"

# 4. Start frontend
cd ../client
npm run dev
```

---

## 10. Technology Stack

- **Frontend:** React + Vite + Transformers.js
- **Backend:** Node.js (VPS) + Firebase Admin SDK
- **Database:** Firebase Firestore
- **Deployment:** Hetzner VPS (bot) + Firebase Hosting/Vercel (frontend)
- **API:** WEEX Trading API

---

## License

MIT
