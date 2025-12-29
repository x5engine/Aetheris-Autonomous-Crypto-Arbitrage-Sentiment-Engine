# WEEX API Endpoints Implementation

This document lists all WEEX API endpoints implemented in the Aetheris system.

## Market API Endpoints

All market endpoints are implemented in `functions/utils/weexMarket.js`:

1. ✅ **Get Server Time** - `getServerTime()`
   - Endpoint: `GET /capi/v2/market/time`
   - Public endpoint

2. ✅ **Get Futures Information** - `getFuturesInformation()`
   - Endpoint: `GET /capi/v2/market/instruments`
   - Public endpoint

3. ✅ **Get OrderBook Depth** - `getOrderBookDepth(symbol, limit)`
   - Endpoint: `GET /capi/v2/market/depth`
   - Public endpoint

4. ✅ **Get All Ticker** - `getAllTickers()`
   - Endpoint: `GET /capi/v2/market/tickers`
   - Public endpoint

5. ✅ **Get Single Ticker** - `getSingleTicker(symbol)`
   - Endpoint: `GET /capi/v2/market/ticker`
   - Public endpoint (with optional auth)

6. ✅ **Get Trades** - `getTrades(symbol, limit)`
   - Endpoint: `GET /capi/v2/market/trades`
   - Public endpoint

7. ✅ **Get Candlestick Data** - `getCandlestickData(symbol, interval, limit)`
   - Endpoint: `GET /capi/v2/market/candles`
   - Public endpoint

8. ✅ **Get Cryptocurrency Index** - `getCryptocurrencyIndex(symbol)`
   - Endpoint: `GET /capi/v2/market/index`
   - Public endpoint

9. ✅ **Get Open Interest** - `getOpenInterest(symbol)`
   - Endpoint: `GET /capi/v2/market/openInterest`
   - Public endpoint

10. ✅ **Get Next Funding Time** - `getNextFundingTime(symbol)`
    - Endpoint: `GET /capi/v2/market/fundingTime`
    - Public endpoint

11. ✅ **Get Historical Funding Rates** - `getHistoricalFundingRates(symbol, limit)`
    - Endpoint: `GET /capi/v2/market/fundingRate/history`
    - Public endpoint

12. ✅ **Get Current Funding Rate** - `getCurrentFundingRate(symbol)`
    - Endpoint: `GET /capi/v2/market/fundingRate/current`
    - Public endpoint

## Account API Endpoints

All account endpoints are implemented in `functions/utils/weexAccount.js`:

1. ✅ **Get Account List** - `getAccountList()`
   - Endpoint: `GET /capi/v2/account/list`
   - Private endpoint (requires authentication)

2. ✅ **Get Single Account** - `getSingleAccount(accountId)`
   - Endpoint: `GET /capi/v2/account/get`
   - Private endpoint

3. ✅ **Get Account Assets** - `getAccountAssets(accountId)`
   - Endpoint: `GET /capi/v2/account/assets`
   - Private endpoint

4. ✅ **Get Contract Account Bills** - `getContractAccountBills(params)`
   - Endpoint: `GET /capi/v2/account/bills`
   - Private endpoint

5. ✅ **Get User Settings Of One Single Futures** - `getUserSettingsOfFutures(symbol)`
   - Endpoint: `GET /capi/v2/account/settings`
   - Private endpoint

6. ✅ **Change Leverage** - `changeLeverage(params)`
   - Endpoint: `POST /capi/v2/account/leverage`
   - Private endpoint

7. ✅ **Adjust Position Margin** - `adjustPositionMargin(params)`
   - Endpoint: `POST /capi/v2/account/margin`
   - Private endpoint

8. ✅ **Automatic Margin Top-Up** - `automaticMarginTopUp(params)`
   - Endpoint: `POST /capi/v2/account/autoTopUp`
   - Private endpoint

9. ✅ **Get All Positions** - `getAllPositions(accountId)`
   - Endpoint: `GET /capi/v2/account/positions`
   - Private endpoint

10. ✅ **Get Single Position** - `getSinglePosition(params)`
    - Endpoint: `GET /capi/v2/account/position`
    - Private endpoint

11. ✅ **Modify User Account Mode** - `modifyUserAccountMode(params)`
    - Endpoint: `POST /capi/v2/account/mode`
    - Private endpoint

## Trade API Endpoints

All trade endpoints are implemented in `functions/utils/weexTrade.js`:

1. ✅ **Place Order** - `placeWeeXOrder(orderParams)`
   - Endpoint: `POST /capi/v2/trade/order`
   - Private endpoint

2. ✅ **Cancel Order** - `cancelWeeXOrder(orderId, symbol)`
   - Endpoint: `POST /capi/v2/trade/cancel`
   - Private endpoint

3. ✅ **Get Order Info** - `getWeeXOrderStatus(orderId, symbol)`
   - Endpoint: `GET /capi/v2/trade/order`
   - Private endpoint

4. ✅ **Get History Orders** - `getHistoryOrders(params)`
   - Endpoint: `GET /capi/v2/trade/orders/history`
   - Private endpoint

5. ✅ **Get Current Orders** - `getCurrentOrders(symbol)`
   - Endpoint: `GET /capi/v2/trade/orders/current`
   - Private endpoint

6. ✅ **Get Fills** - `getFills(params)`
   - Endpoint: `GET /capi/v2/trade/fills`
   - Private endpoint

7. ✅ **Place Trigger Order** - `placeTriggerOrder(params)`
   - Endpoint: `POST /capi/v2/trade/trigger/order`
   - Private endpoint

8. ✅ **Cancel Trigger Order** - `cancelTriggerOrder(orderId, symbol)`
   - Endpoint: `POST /capi/v2/trade/trigger/cancel`
   - Private endpoint

9. ✅ **Get Current Plan Orders** - `getCurrentPlanOrders(symbol)`
   - Endpoint: `GET /capi/v2/trade/trigger/orders/current`
   - Private endpoint

10. ✅ **Get History Plan Orders** - `getHistoryPlanOrders(params)`
    - Endpoint: `GET /capi/v2/trade/trigger/orders/history`
    - Private endpoint

11. ✅ **Close All Positions** - `closeAllPositions(symbol)`
    - Endpoint: `POST /capi/v2/trade/closeAll`
    - Private endpoint

12. ✅ **Cancel All Orders** - `cancelAllOrders(symbol)`
    - Endpoint: `POST /capi/v2/trade/cancelAll`
    - Private endpoint

13. ✅ **Place TP/SL Order** - `placeTPSLOrder(params)`
    - Endpoint: `POST /capi/v2/trade/tpsl/order`
    - Private endpoint

14. ✅ **Modify TP/SL Order** - `modifyTPSLOrder(params)`
    - Endpoint: `POST /capi/v2/trade/tpsl/modify`
    - Private endpoint

## Upload AI Log

Implemented in `functions/utils/weexAiLog.js`:

1. ✅ **Upload AI Log** - `uploadAiLog(logData)`
   - Endpoint: `POST /capi/v2/order/uploadAiLog`
   - Private endpoint
   - **Required for AI Wars competition compliance**

### AI Log Requirements

According to WEEX AI Wars requirements, the AI log must contain:

- **Model version**: Name or version of AI model used
- **Input and output data**: Prompt/query and AI-generated output
- **Order execution details**: Information about the trade decision

### Automatic AI Log Upload

The system automatically uploads AI logs after trade execution in the `executeTrade` Cloud Function. The log includes:

- Trading stage: "Decision Making" or "Strategy Generation"
- Model: "distilbert-base-uncased-finetuned-sst-2-english" (Transformers.js model)
- Input: Market data, spread, prices, sentiment analysis inputs
- Output: Sentiment score, confidence, approval decision
- Explanation: Natural language explanation of AI reasoning (max 1000 characters)

## Usage Examples

### Market Data
```javascript
import { getSingleTicker, getOrderBookDepth } from './utils/weexMarket.js';

// Get ticker price
const ticker = await getSingleTicker('cmt_btcusdt');

// Get order book
const orderBook = await getOrderBookDepth('cmt_btcusdt', 20);
```

### Account Management
```javascript
import { getAccountAssets, getAllPositions } from './utils/weexAccount.js';

// Get account assets
const assets = await getAccountAssets('account_id');

// Get all positions
const positions = await getAllPositions('account_id');
```

### Trading
```javascript
import { placeWeeXOrder, cancelWeeXOrder } from './utils/weexTrade.js';

// Place order
const order = await placeWeeXOrder({
  symbol: 'cmt_btcusdt',
  side: 'buy',
  type: 'market',
  size: 10
});

// Cancel order
const cancel = await cancelWeeXOrder(order.orderId, 'cmt_btcusdt');
```

### AI Log Upload
```javascript
import { uploadAiLog, generateAiLogFromTrade } from './utils/weexAiLog.js';

// Generate and upload AI log
const aiLog = generateAiLogFromTrade(opportunity, sentimentResult, orderId);
const result = await uploadAiLog(aiLog);
```

## Authentication

All private endpoints use WEEX signature authentication:
- HMAC-SHA256 signature generation
- Required headers: ACCESS-KEY, ACCESS-PASSPHRASE, ACCESS-TIMESTAMP, ACCESS-SIGN
- Implemented in `functions/utils/weexAuth.js`

## Error Handling

All functions return a consistent response format:
```javascript
{
  success: true/false,
  data: {...}, // On success
  error: "error message" // On failure
}
```

## References

- [WEEX Market API Documentation](https://www.weex.com/api-doc/ai/marketAPI)
- [WEEX Account API Documentation](https://www.weex.com/api-doc/ai/accountAPI)
- [WEEX Trade API Documentation](https://www.weex.com/api-doc/ai/orderAPI)
- [WEEX Upload AI Log Documentation](https://www.weex.com/api-doc/ai/UploadAiLog)

