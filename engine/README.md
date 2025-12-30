# Aetheris Engine - VPS Bot

This is the VPS bot that runs on Hetzner (or any VPS with static IP) to poll WEEX API and write data to Firestore.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

1. Copy `.env.example` to `.env`
2. Add your WEEX API credentials:
   ```env
   WEEX_API_KEY=your_key
   WEEX_SECRET_KEY=your_secret
   WEEX_PASSPHRASE=your_passphrase
   WEEX_API_DOMAIN=https://api-contract.weex.com
   ```

### 3. Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `service-account.json` in this directory
4. **IMPORTANT**: Never commit this file to git!

### 4. Run the Bot

#### Development
```bash
npm run dev
```

#### Production (with PM2)
```bash
npm install -g pm2
pm2 start bot.js --name "aetheris-engine"
pm2 save
pm2 startup  # Set up PM2 to start on boot
```

## What It Does

1. **Polls WEEX API** every 3 seconds for market prices
2. **Writes to Firestore** `live_feed` collection
3. **Detects arbitrage** opportunities (spread > 1%)
4. **Creates alerts** in Firestore `alerts` collection

## Monitoring

```bash
# View logs
pm2 logs aetheris-engine

# Check status
pm2 status

# Restart
pm2 restart aetheris-engine

# Stop
pm2 stop aetheris-engine
```

## Firestore Collections

### `live_feed`
Real-time market data:
```json
{
  "docId": "BTC_USDT",
  "price": 42050.00,
  "exchange": "WEEX",
  "other_exchange_price": 42100.00,
  "spread_pct": 1.19,
  "last_updated": "Timestamp",
  "symbol": "cmt_btcusdt"
}
```

### `alerts`
Arbitrage opportunities:
```json
{
  "type": "ARBITRAGE",
  "spread": 1.2,
  "buy_at": "WEEX",
  "sell_at": "OTHER",
  "status": "PENDING",
  "created_at": "Timestamp"
}
```

