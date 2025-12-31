# 🧪 API Testing Guide

## Quick Tests

### 1. Test Bot Status
```bash
npm run test:bot
```

This will:
- ✅ Check PM2 status
- ✅ View recent logs
- ✅ Check bot files
- ✅ Test WEEX API connection

### 2. Test Firestore Data
```bash
npm run test:firestore
```

This will:
- ✅ Check `live_feed` collection for price data
- ✅ Check `alerts` collection for arbitrage opportunities
- ✅ Show recent entries

### 3. View Live Logs
```bash
npm run vps:logs
```

### 4. Check Bot Status
```bash
npm run vps:status
```

## Manual Firestore Check

1. Go to: https://console.firebase.google.com/project/hackathon-project-245ba/firestore
2. Check `live_feed` collection:
   - Should have entries like `BTC_USDT`, `ETH_USDT`
   - Should update every 3 seconds
   - Should have `price`, `exchange`, `last_updated` fields

3. Check `alerts` collection:
   - Should have entries when arbitrage detected
   - Should have `type: "ARBITRAGE"`, `spread`, `status` fields

## Expected Bot Logs

When bot is working, you should see:
```
✅ Firebase Admin initialized
📊 BTC_USDT: WEEX=42050.00, Other=42100.00, Spread=0.12%
✅ Poll complete at 2025-12-30T12:00:00Z
```

## Troubleshooting

### No Data in Firestore?
1. Check bot logs: `npm run vps:logs`
2. Check service-account.json exists on VPS
3. Check WEEX credentials in .env on VPS
4. Check bot is running: `npm run vps:status`

### Bot Not Polling?
1. Check WEEX API credentials
2. Check VPS IP is whitelisted in WEEX
3. Check bot logs for errors

### PM2 Shows Error?
1. Check logs: `npm run vps:logs`
2. Restart bot: `npm run vps:restart`
3. Check Node.js version: Should be 20.x

