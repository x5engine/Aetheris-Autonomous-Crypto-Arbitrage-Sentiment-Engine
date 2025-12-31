# Aetheris Implementation Plan - WEEX API Integration

## Overview
This document outlines the detailed implementation plan for integrating the Aetheris trading system with the WEEX API, following the official WEEX API documentation.

## 1. WEEX API Integration Requirements

### 1.1 Authentication
- **API Domain**: `http://api-contract.weex.com`
- **Required Credentials**:
  - `APIKey`: Unique identifier for API authentication
  - `SecretKey`: Private key for signature encryption
  - `Passphrase`: User-defined access phrase
- **Signature Method**: HMAC-SHA256 with timestamp
- **Headers Required**:
  - `ACCESS-KEY`: APIKey
  - `ACCESS-PASSPHRASE`: Passphrase
  - `ACCESS-TIMESTAMP`: Unix timestamp in milliseconds
  - `ACCESS-SIGN`: HMAC-SHA256 signature
  - `Content-Type`: application/json
  - `locale`: en-US

### 1.2 API Endpoints to Implement
- **Market Data** (Public):
  - Get ticker prices
  - Get order book
  - Get market time
- **Account** (Private):
  - Get account balance
  - Get positions
- **Trade** (Private):
  - Place order
  - Cancel order
  - Get order status
  - Get order history

## 2. Project Structure Implementation

### 2.1 Frontend (React + Vite)
```
src/
├── components/
│   ├── Dashboard/
│   │   └── Dashboard.jsx          # Main trading dashboard
│   ├── ArbitrageCard.jsx          # Price spread visualizer
│   └── SentimentGauge.jsx         # AI sentiment visualization
├── hooks/
│   ├── useMarketData.js           # Firestore real-time listeners
│   └── useTextModel.js            # Transformers.js model loader
├── lib/
│   ├── firebase.js                # Firebase initialization
│   ├── strategies.js              # Client-side trade logic
│   └── weexApi.js                 # WEEX API client wrapper
└── App.jsx                         # Root component
```

### 2.2 Backend (Firebase Cloud Functions)
```
functions/
├── index.js                        # Entry point
├── scanners/
│   ├── priceScanner.js            # WEEX API price fetcher
│   └── walletSecurity.js          # Risk assessment
├── utils/
│   ├── math.js                    # Spread & fee calculations
│   └── weexAuth.js                # WEEX signature generator
└── package.json
```

### 2.3 Configuration Files
- `package.json` (root & functions)
- `firebase.json`
- `.env.example`
- `vite.config.js`
- `.gitignore`

## 3. Implementation Steps

### Phase 1: Core Infrastructure
1. ✅ Initialize project structure
2. ✅ Set up package.json files
3. ✅ Configure Firebase
4. ✅ Create WEEX API client with authentication

### Phase 2: Backend Implementation
1. ✅ Implement WEEX signature authentication
2. ✅ Create price scanner using WEEX Market API
3. ✅ Implement arbitrage detection logic
4. ✅ Set up scheduled Cloud Functions
5. ✅ Create Firestore data models

### Phase 3: Frontend Implementation
1. ✅ Set up React + Vite
2. ✅ Integrate Transformers.js for sentiment analysis
3. ✅ Create Firestore real-time hooks
4. ✅ Build dashboard components
5. ✅ Implement trade execution UI

### Phase 4: Integration & Testing
1. ✅ Connect frontend to backend
2. ✅ Test WEEX API connectivity
3. ✅ Validate arbitrage detection
4. ✅ Test sentiment analysis pipeline
5. ✅ End-to-end trade execution flow

## 4. WEEX API Client Implementation Details

### 4.1 Signature Generation
```javascript
// Signature = Base64(HMAC-SHA256(timestamp + method + requestPath + body, SecretKey))
const timestamp = Date.now().toString();
const method = 'GET' | 'POST';
const requestPath = '/capi/v2/...';
const body = JSON.stringify(data) || '';
const message = timestamp + method + requestPath + body;
const signature = crypto.createHmac('sha256', secretKey)
  .update(message)
  .digest('base64');
```

### 4.2 API Request Structure
```javascript
const headers = {
  'ACCESS-KEY': apiKey,
  'ACCESS-PASSPHRASE': passphrase,
  'ACCESS-TIMESTAMP': timestamp,
  'ACCESS-SIGN': signature,
  'Content-Type': 'application/json',
  'locale': 'en-US'
};
```

## 5. Data Flow

1. **Price Scanning** (Cloud Function - every 60s):
   - Fetch prices from WEEX API
   - Calculate spreads
   - Write to Firestore `market_ticks`

2. **Arbitrage Detection**:
   - Monitor `market_ticks` for spreads > 1%
   - Create `opportunities` document

3. **Sentiment Analysis** (Frontend):
   - Load news/social feeds
   - Run Transformers.js model
   - Update `opportunities` with sentiment score

4. **Trade Execution**:
   - Validate: `Profit > Fees` AND `Sentiment > 0`
   - Call WEEX Trade API
   - Log to `audit_logs`

## 6. Security Considerations

- Store WEEX credentials in Firebase Functions environment variables
- Never expose API keys in frontend code
- Implement rate limiting for API calls
- Add request validation and error handling
- Log all trading actions for audit trail

## 7. Testing Strategy

- Unit tests for signature generation
- Integration tests for WEEX API calls
- Mock WEEX responses for development
- Test arbitrage detection logic
- Validate sentiment analysis accuracy

## 8. Deployment Checklist

- [ ] Configure Firebase project
- [ ] Set environment variables
- [ ] Deploy Cloud Functions
- [ ] Build and deploy frontend
- [ ] Test with WEEX testnet (if available)
- [ ] Monitor API rate limits
- [ ] Set up error alerting

