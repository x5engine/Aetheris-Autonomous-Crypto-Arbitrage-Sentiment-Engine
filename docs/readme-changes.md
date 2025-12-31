

# Aetheris: Hybrid AI Trading & Sentiment Engine

**Version:** 1.1.0 (Hackathon Edition)  
**Architecture:** Hybrid (Client-Side AI + VPS Execution Node)  

## 1. Executive Summary
Aetheris is a real-time arbitrage and sentiment analysis platform. It overcomes strict API IP-whitelisting constraints by utilizing a **Hybrid Architecture**:
1.  **The Intelligence Layer (Frontend):** Runs local AI models in the browser for zero-latency sentiment analysis.
2.  **The Execution Layer (VPS):** A dedicated, static-IP Node.js engine hosted on Hetzner that handles sensitive API polling (WEEX) and arbitrage logic.
3.  **The Sync Layer (Firebase):** Acts as a real-time message bus, syncing the VPS state to the User Dashboard instantly.

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
*   **Static IP Requirement:** WEEX requires a fixed IP for API access. Serverless functions (Lambda/GCP) rotate IPs. We use a lightweight Hetzner VPS to guarantee a static identity.
*   **Real-time Sync:** Firestore acts as the bridge. The VPS writes data, and the React frontend updates automatically without manual refreshing.

---

## 3. Project Structure

The repository is split into two distinct environments:

```text
aetheris-protocol/
├── client/                     # THE DASHBOARD (React + Vite)
│   ├── src/
│   │   ├── ai/                 # Transformers.js sentiment logic
│   │   ├── components/         # UI Visuals
│   │   └── lib/firebase.js     # Client SDK config
│   └── package.json
│
├── engine/                     # THE BOT (Runs on Hetzner VPS)
│   ├── bot.js                  # Main loop (Polling + Logic)
│   ├── service-account.json    # Secret Key (Do NOT commit this)
│   └── package.json            # Deps: firebase-admin, axios, ccxt
│
└── README.md
```

---

## 4. Technical Implementation

### A. The Engine (VPS / Backend)
A persistent Node.js process managed by `PM2`.
*   **Role:** Market Maker & Data Ingestor.
*   **Permissions:** Uses `firebase-admin` service account to write to the DB with privileged access.
*   **Logic:**
    *   Polls WEEX API every 3 seconds.
    *   Calculates arbitrage spreads.
    *   Writes to `market_data` collection.

### B. The Client (React / Frontend)
*   **Role:** Decision Support & Visualization.
*   **Permissions:** Standard Firebase Client SDK (Read-Only on market data).
*   **AI:** Uses `@xenova/transformers` to analyze news feeds locally.
*   **Auth:** Firebase Auth for user login.

---

## 5. Deployment Guide

### Phase 1: Database & Auth (Firebase)
1.  Create Firebase Project.
2.  Enable **Firestore Database**.
3.  **Generate Private Key:** Project Settings -> Service Accounts -> Generate New Private Key. Save as `service-account.json`.

### Phase 2: The Bot (Hetzner)
1.  SSH into VPS.
2.  Clone repo and navigate to `/engine`.
3.  Upload `service-account.json` to this folder.
4.  Install & Run:
    ```bash
    npm install
    npm install -g pm2
    pm2 start bot.js --name "aetheris-engine"
    ```

### Phase 3: The Dashboard (Vercel/Netlify)
1.  Navigate to `/client`.
2.  Create `.env.local` with your public Firebase Config.
3.  Deploy:
    ```bash
    npm run build
    # Upload 'dist' folder or git push to Vercel
    ```

---

## 6. Data Schema (Firestore)

**Collection: `live_feed`** (Written by VPS)
```json
{
  "docId": "BTC_USDT",
  "price": 42050.00,
  "exchange": "WEEX",
  "last_updated": "Timestamp"
}
```

**Collection: `alerts`** (Written by VPS)
```json
{
  "type": "ARBITRAGE",
  "spread": 1.2,
  "buy_at": "WEEX",
  "sell_at": "BINANCE",
  "status": "PENDING"
}
```

---

## 7. Vision (Hackathon Pitch)
**Aetheris** replaces complex, expensive institutional trading infrastructures with a $5 VPS and browser-based AI. We prove that you don't need a hedge fund's budget to run a high-frequency, sentiment-aware arbitrage desk—just smart architecture.