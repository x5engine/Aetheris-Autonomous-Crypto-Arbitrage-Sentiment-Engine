# WEEX API Easy Wins - Feature Planning

## 🎯 Top 3 Easiest WEEX API Features (High Impact, Low Effort)

### 1. **Account Balance & Portfolio Display** ⭐⭐⭐
**Impact**: 🔥🔥🔥 Very High - Users see their money, builds trust
**Effort**: 🟢 Very Low - We already have auth, just need to call the endpoint
**WEEX API**: `GET /capi/v2/account/assets` (already implemented in utils)

**What It Does:**
- Display total account balance
- Show available balance vs. used margin
- Display asset breakdown (USDT, BTC, etc.)
- Real-time balance updates

**Implementation:**
```javascript
// engine/utils/weexApi.js (add function)
export async function getAccountBalance(accountId) {
  const requestPath = `/capi/v2/account/assets?accountId=${accountId}`;
  const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, { headers });
  return response.data; // { available, margin, total, assets: [...] }
}

// Frontend: client/src/components/Portfolio/BalanceCard.jsx
// Display balance in dashboard
```

**Files to Create:**
- `client/src/components/Portfolio/BalanceCard.jsx`
- `client/src/hooks/useAccountBalance.js`
- Add to Dashboard

**Time Estimate**: 1-2 hours

---

### 2. **Order Book Depth Visualization** ⭐⭐⭐
**Impact**: 🔥🔥🔥 Very High - Shows market liquidity, helps decision making
**Effort**: 🟢 Low - Public endpoint, simple visualization
**WEEX API**: `GET /capi/v2/market/depth` (public, no auth needed)

**What It Does:**
- Display buy/sell order book
- Show market depth (liquidity)
- Visualize bid/ask spread
- Real-time order book updates

**Implementation:**
```javascript
// engine/utils/weexApi.js (add function)
export async function getOrderBook(symbol, limit = 20) {
  const requestPath = `/capi/v2/market/depth?symbol=${symbol}&limit=${limit}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data; // { bids: [[price, size]], asks: [[price, size]] }
}

// Frontend: client/src/components/Market/OrderBook.jsx
// Visualize with bars or table
```

**Files to Create:**
- `engine/utils/weexApi.js` (add `getOrderBook`)
- `client/src/components/Market/OrderBook.jsx`
- Add to ArbitrageCard or new Market Detail page

**Time Estimate**: 2-3 hours

---

### 3. **Trade History & Open Positions** ⭐⭐
**Impact**: 🔥🔥 High - Track performance, see what's open
**Effort**: 🟢 Low - We have auth, endpoints already exist
**WEEX API**: 
- `GET /capi/v2/trade/orders/history` (already implemented)
- `GET /capi/v2/account/positions` (already implemented)

**What It Does:**
- Show executed trade history
- Display open positions with P&L
- Track win/loss ratio
- Show entry/exit prices

**Implementation:**
```javascript
// engine/utils/weexApi.js (functions already exist, just need to call them)
import { getHistoryOrders, getAllPositions } from './weexTrade.js';

// Frontend: client/src/components/Trades/TradeHistory.jsx
// Display in table format
```

**Files to Create:**
- `client/src/components/Trades/TradeHistory.jsx`
- `client/src/components/Portfolio/OpenPositions.jsx`
- `client/src/hooks/useTradeHistory.js`
- Add to Dashboard or new Trades page

**Time Estimate**: 2-3 hours

---

## 🚀 Additional Easy Wins (Can Add Later)

### 4. **Candlestick Price Charts** ⭐⭐
**Impact**: 🔥🔥 High - Visual price history, helps analysis
**Effort**: 🟢 Low - Public endpoint + recharts library
**WEEX API**: `GET /capi/v2/market/candles` (public)

**What It Does:**
- Display price charts (1m, 5m, 1h, 1d intervals)
- Show OHLC (Open, High, Low, Close) data
- Visualize price trends

**Implementation:**
```javascript
// engine/utils/weexApi.js
export async function getCandles(symbol, interval = '1h', limit = 100) {
  const requestPath = `/capi/v2/market/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data; // [[timestamp, open, high, low, close, volume], ...]
}

// Frontend: Use recharts or TradingView widget
```

**Time Estimate**: 3-4 hours

---

### 5. **Funding Rates Display** ⭐
**Impact**: 🔥 Medium - Important for futures trading
**Effort**: 🟢 Low - Public endpoint
**WEEX API**: `GET /capi/v2/market/fundingRate/current` (public)

**What It Does:**
- Show current funding rate
- Display next funding time
- Historical funding rate chart

**Implementation:**
```javascript
// engine/utils/weexApi.js
export async function getFundingRate(symbol) {
  const requestPath = `/capi/v2/market/fundingRate/current?symbol=${symbol}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data; // { fundingRate, nextFundingTime }
}
```

**Time Estimate**: 1-2 hours

---

### 6. **Recent Trades Display** ⭐
**Impact**: 🔥 Medium - Shows market activity
**Effort**: 🟢 Very Low - Public endpoint
**WEEX API**: `GET /capi/v2/market/trades` (public)

**What It Does:**
- Show recent trades (last 20-50)
- Display buy/sell activity
- Real-time trade feed

**Implementation:**
```javascript
// engine/utils/weexApi.js
export async function getRecentTrades(symbol, limit = 20) {
  const requestPath = `/capi/v2/market/trades?symbol=${symbol}&limit=${limit}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data; // [{ price, size, side, time }, ...]
}
```

**Time Estimate**: 1 hour

---

### 7. **Open Interest Display** ⭐
**Impact**: 🔥 Medium - Shows market sentiment
**Effort**: 🟢 Very Low - Public endpoint
**WEEX API**: `GET /capi/v2/market/openInterest` (public)

**What It Does:**
- Display open interest (number of open contracts)
- Show market participation
- Trend indicator

**Implementation:**
```javascript
// engine/utils/weexApi.js
export async function getOpenInterest(symbol) {
  const requestPath = `/capi/v2/market/openInterest?symbol=${symbol}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data; // { openInterest, timestamp }
}
```

**Time Estimate**: 1 hour

---

## 📋 Implementation Priority

### Phase 1: Quick Wins (Do Today)
1. ✅ **Account Balance Display** - 1-2 hours
2. ✅ **Recent Trades Display** - 1 hour
3. ✅ **Open Interest Display** - 1 hour

### Phase 2: High Value (This Week)
4. ✅ **Order Book Depth** - 2-3 hours
5. ✅ **Trade History & Positions** - 2-3 hours

### Phase 3: Nice to Have (Next Week)
6. ✅ **Candlestick Charts** - 3-4 hours
7. ✅ **Funding Rates** - 1-2 hours

---

## 🛠️ Implementation Details

### Backend Changes (engine/)

**File: `engine/utils/weexApi.js`**
```javascript
// Add these functions:

// 1. Order Book
export async function getOrderBook(symbol, limit = 20) {
  const requestPath = `/capi/v2/market/depth?symbol=${symbol}&limit=${limit}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data;
}

// 2. Account Balance
export async function getAccountBalance(accountId) {
  const apiKey = process.env.WEEX_API_KEY;
  const secretKey = process.env.WEEX_SECRET_KEY;
  const passphrase = process.env.WEEX_PASSPHRASE;
  
  if (!apiKey || !secretKey || !passphrase) {
    throw new Error('WEEX API credentials not configured');
  }
  
  const requestPath = `/capi/v2/account/assets?accountId=${accountId}`;
  const headers = getWeeXHeaders(apiKey, secretKey, passphrase, 'GET', requestPath);
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`, { headers });
  return response.data;
}

// 3. Recent Trades
export async function getRecentTrades(symbol, limit = 20) {
  const requestPath = `/capi/v2/market/trades?symbol=${symbol}&limit=${limit}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data;
}

// 4. Open Interest
export async function getOpenInterest(symbol) {
  const requestPath = `/capi/v2/market/openInterest?symbol=${symbol}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data;
}

// 5. Candlesticks
export async function getCandles(symbol, interval = '1h', limit = 100) {
  const requestPath = `/capi/v2/market/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data;
}

// 6. Funding Rate
export async function getFundingRate(symbol) {
  const requestPath = `/capi/v2/market/fundingRate/current?symbol=${symbol}`;
  const response = await axios.get(`${WEEX_API_DOMAIN}${requestPath}`);
  return response.data;
}
```

**File: `engine/bot.js` (optional - poll and store in Firestore)**
```javascript
// Add to polling loop (every 30 seconds for order book, etc.)
async function pollMarketDepth() {
  for (const symbol of SYMBOLS) {
    const orderBook = await getOrderBook(symbol);
    await db.collection('order_books').doc(symbol).set({
      symbol,
      bids: orderBook.bids,
      asks: orderBook.asks,
      timestamp: new Date()
    }, { merge: true });
  }
}

// Run every 30 seconds
setInterval(pollMarketDepth, 30000);
```

### Frontend Changes (client/)

**File: `client/src/components/Portfolio/BalanceCard.jsx`**
```javascript
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function BalanceCard() {
  const [balance, setBalance] = useState(null);
  
  useEffect(() => {
    // Listen to Firestore or call API directly
    const unsub = onSnapshot(doc(db, 'account_balance', 'main'), (doc) => {
      if (doc.exists()) setBalance(doc.data());
    });
    return unsub;
  }, []);
  
  if (!balance) return <div>Loading...</div>;
  
  return (
    <div className="glass">
      <h3>Account Balance</h3>
      <div>Total: ${balance.total}</div>
      <div>Available: ${balance.available}</div>
      <div>Margin: ${balance.margin}</div>
    </div>
  );
}
```

**File: `client/src/components/Market/OrderBook.jsx`**
```javascript
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function OrderBook({ symbol }) {
  const [orderBook, setOrderBook] = useState(null);
  
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'order_books', symbol), (doc) => {
      if (doc.exists()) setOrderBook(doc.data());
    });
    return unsub;
  }, [symbol]);
  
  if (!orderBook) return <div>Loading...</div>;
  
  return (
    <div className="glass">
      <h3>Order Book - {symbol}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h4>Sell Orders (Asks)</h4>
          {orderBook.asks.slice(0, 10).map(([price, size], i) => (
            <div key={i}>{price} - {size}</div>
          ))}
        </div>
        <div>
          <h4>Buy Orders (Bids)</h4>
          {orderBook.bids.slice(0, 10).map(([price, size], i) => (
            <div key={i}>{price} - {size}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Recommended Implementation Order

### Today (2-3 hours total):
1. **Account Balance** - Users see their money ✅
2. **Recent Trades** - Shows market activity ✅
3. **Open Interest** - Market sentiment indicator ✅

### This Week (4-6 hours):
4. **Order Book Depth** - Market liquidity visualization
5. **Trade History** - Performance tracking

### Next Week (4-6 hours):
6. **Candlestick Charts** - Price history
7. **Funding Rates** - Futures trading info

---

## 💡 Quick Start Commands

```bash
# 1. Add functions to engine/utils/weexApi.js
# 2. Update bot.js to poll new data (optional)
# 3. Create frontend components
# 4. Add to Dashboard

# Test locally:
npm run bot:local
npm run client:dev
```

---

## 📊 Expected Results

After implementing these features:
- ✅ Users see their account balance
- ✅ Market depth visualization
- ✅ Trade history tracking
- ✅ Better decision making with order book
- ✅ Professional trading interface

**Total Time**: ~10-15 hours for all features
**Impact**: 🔥🔥🔥 Very High - Makes Aetheris a complete trading platform

---

*Last Updated: 2025-12-31*
*Status: Ready to Implement*

