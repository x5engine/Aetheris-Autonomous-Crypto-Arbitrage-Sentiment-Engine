# Aetheris Feature Planning & Social Signals Implementation

## 🚀 Running Everything Locally

### Quick Start Commands

```bash
# 1. Start Firebase Emulators (Firestore + Auth)
npm run emulators:start

# 2. In another terminal - Start local bot (generates test data)
npm run bot:local

# 3. In another terminal - Start frontend dev server
npm run client:dev
```

### What Each Component Does

1. **Firebase Emulators** (`emulators:start`)
   - Firestore on `127.0.0.1:8090`
   - Auth on `127.0.0.1:9099`
   - Provides local database for testing

2. **Local Bot** (`bot:local`)
   - Generates simulated market data
   - Creates arbitrage alerts
   - Processes alerts with AI
   - Writes to local Firestore emulator

3. **Frontend Dev** (`client:dev`)
   - React dev server on `http://localhost:5173`
   - Connects to local Firestore emulator
   - Real-time updates from bot

---

## 🎯 Top 3 Features to Add (High Impact, Medium Effort)

### 1. **Social Signals Integration** ⭐⭐⭐
**Impact**: 🔥🔥🔥 Very High - Differentiates from competitors, adds real value
**Effort**: 🟡 Medium - Requires API integrations and data processing

**What It Does:**
- Aggregates social media sentiment (Twitter/X, Reddit)
- News sentiment analysis
- Community buzz tracking
- Influencer mentions
- Social volume indicators

**Implementation Plan:**
- See detailed plan below ⬇️

---

### 2. **Historical Performance Dashboard** ⭐⭐⭐
**Impact**: 🔥🔥🔥 Very High - Builds trust, shows ROI
**Effort**: 🟢 Low-Medium - Query Firestore, build charts

**What It Does:**
- Track all executed trades
- Profit/loss over time (line chart)
- Win rate percentage
- Best performing pairs (bar chart)
- Total ROI calculation
- Daily/weekly/monthly breakdowns

**Implementation:**
```javascript
// Firestore Collection: trades
{
  userId: string,
  alertId: string,
  symbol: string,
  spread: number,
  profit: number,
  executedAt: timestamp,
  status: 'SUCCESS' | 'FAILED',
  ai_confidence: number
}

// Components Needed:
- PerformanceChart.jsx (recharts)
- TradeHistory.jsx (table)
- StatsCards.jsx (KPIs)
```

**Files to Create:**
- `client/src/components/Performance/PerformanceChart.jsx`
- `client/src/components/Performance/TradeHistory.jsx`
- `client/src/hooks/useTradeHistory.js`
- `client/src/pages/Performance.jsx`

---

### 3. **Real-Time Push Notifications** ⭐⭐
**Impact**: 🔥🔥 High - Users don't miss opportunities
**Effort**: 🟢 Low - Browser Notification API + Firebase Cloud Messaging

**What It Does:**
- Browser notifications for high-value opportunities (>2% spread)
- Alert when trades execute
- AI approval notifications
- Customizable thresholds

**Implementation:**
```javascript
// Request permission
Notification.requestPermission()

// Listen to Firestore alerts
onSnapshot(query(alertsRef, where('spread', '>', 2)), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      new Notification('Arbitrage Alert!', {
        body: `${change.doc.data().asset}: ${change.doc.data().spread}% spread`,
        icon: '/icon.png'
      })
    }
  })
})
```

**Files to Create:**
- `client/src/hooks/useNotifications.js`
- `client/src/components/Settings/NotificationSettings.jsx`

---

## 📱 Social Signals Implementation Plan

### Overview
Social signals add a **massive competitive advantage** by incorporating real-world sentiment into trading decisions. This is what makes Aetheris truly "AI-powered" beyond just price analysis.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Social Signals Aggregator                  │
│  (New VPS Service or Engine Extension)                  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Twitter │         │ Reddit  │         │  News   │
    │   API   │         │   API   │         │   API   │
    └─────────┘         └─────────┘         └─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  AI Sentiment   │
                    │   Analysis      │
                    │  (Gemini 3 Pro) │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Firestore     │
                    │ social_signals  │
                    │   collection    │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Dashboard     │
                    │  Displays       │
                    │  Social Sentiment│
                    └─────────────────┘
```

### Phase 1: Data Collection (Backend - VPS Bot)

#### 1.1 Twitter/X Integration

**Options:**
- **Option A: Twitter API v2** (Official, requires paid tier)
  - Cost: $100/month for basic access
  - Pros: Reliable, official
  - Cons: Expensive
  
- **Option B: Twitter Scraping** (Unofficial, free)
  - Libraries: `twitter-api-v2`, `twit`, or web scraping
  - Pros: Free
  - Cons: May violate ToS, less reliable

- **Option C: Third-Party Aggregator** (Recommended for MVP)
  - Services: SocialData, Brandwatch, Mention
  - Pros: Pre-processed data, multiple sources
  - Cons: Cost per API call

**Implementation (Option B - Free):**
```javascript
// engine/utils/socialSignals.js
import axios from 'axios';

class SocialSignalsCollector {
  async collectTwitterSignals(symbol) {
    // Search for tweets mentioning the crypto
    const query = `${symbol} OR ${symbol.toLowerCase()} crypto`;
    
    // Use Twitter API v2 or scraping
    const tweets = await this.fetchTweets(query);
    
    return {
      volume: tweets.length,
      sentiment: this.analyzeSentiment(tweets),
      mentions: tweets.length,
      influencers: this.detectInfluencers(tweets)
    };
  }
}
```

#### 1.2 Reddit Integration

**API:** Reddit API (free, no auth needed for public data)

```javascript
async collectRedditSignals(symbol) {
  const subreddits = ['cryptocurrency', 'CryptoMarkets', 'BitcoinMarkets'];
  const posts = [];
  
  for (const subreddit of subreddits) {
    const response = await axios.get(
      `https://www.reddit.com/r/${subreddit}/search.json?q=${symbol}&sort=hot&limit=10`
    );
    posts.push(...response.data.data.children);
  }
  
  return {
    volume: posts.length,
    upvotes: posts.reduce((sum, p) => sum + p.data.ups, 0),
    comments: posts.reduce((sum, p) => sum + p.data.num_comments, 0),
    sentiment: this.analyzeSentiment(posts.map(p => p.data.title + ' ' + p.data.selftext))
  };
}
```

#### 1.3 News Integration

**APIs:**
- **CryptoCompare News API** (free tier available)
- **NewsAPI** (free tier: 100 requests/day)
- **Alpha Vantage News** (free tier available)

```javascript
async collectNewsSignals(symbol) {
  const response = await axios.get(
    `https://min-api.cryptocompare.com/data/v2/news/?categories=${symbol}&lang=EN`
  );
  
  return {
    articles: response.data.Data.length,
    sentiment: this.analyzeSentiment(
      response.data.Data.map(article => article.title + ' ' + article.body)
    ),
    sources: [...new Set(response.data.Data.map(a => a.source))]
  };
}
```

### Phase 2: AI Sentiment Analysis

**Use existing Gemini 3 Pro service:**

```javascript
// engine/utils/aiService.js (extend existing)
async analyzeSocialSentiment(texts) {
  const prompt = `Analyze the sentiment of these social media posts about cryptocurrency:
  
${texts.join('\n\n')}

Return JSON:
{
  "sentiment_score": <number -1 to 1>,
  "confidence": <number 0 to 1>,
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary of sentiment"
}`;

  return await this.generate(prompt);
}
```

### Phase 3: Firestore Schema

```javascript
// Collection: social_signals
{
  symbol: "BTC_USDT",
  asset: "BTC",
  timestamp: Timestamp,
  
  // Twitter Data
  twitter: {
    mentions: 150,
    sentiment: 0.65,
    volume_24h: 1200,
    top_influencers: ["@elonmusk", "@VitalikButerin"]
  },
  
  // Reddit Data
  reddit: {
    posts: 45,
    upvotes: 1250,
    comments: 320,
    sentiment: 0.72
  },
  
  // News Data
  news: {
    articles: 12,
    sentiment: 0.58,
    sources: ["CoinDesk", "The Block"]
  },
  
  // Aggregated
  overall_sentiment: 0.65,
  social_volume: 1407,
  confidence: 0.82,
  
  // AI Analysis
  ai_analysis: {
    reasoning: "Strong positive sentiment across all platforms...",
    recommendation: "BULLISH",
    confidence: 0.85
  }
}
```

### Phase 4: VPS Bot Integration

**Add to `engine/bot.js`:**

```javascript
import { SocialSignalsCollector } from './utils/socialSignals.js';

const socialCollector = new SocialSignalsCollector();

async function collectSocialSignals(symbol) {
  try {
    const [twitter, reddit, news] = await Promise.all([
      socialCollector.collectTwitterSignals(symbol),
      socialCollector.collectRedditSignals(symbol),
      socialCollector.collectNewsSignals(symbol)
    ]);
    
    // Aggregate sentiment
    const overallSentiment = (
      twitter.sentiment * 0.4 +
      reddit.sentiment * 0.4 +
      news.sentiment * 0.2
    );
    
    // AI analysis
    const aiAnalysis = await backendAIService.analyzeSocialSentiment([
      ...twitter.texts,
      ...reddit.texts,
      ...news.texts
    ]);
    
    // Write to Firestore
    await db.collection('social_signals').doc(symbol).set({
      symbol,
      asset: symbol.replace('_USDT', ''),
      timestamp: new Date(),
      twitter,
      reddit,
      news,
      overall_sentiment: overallSentiment,
      social_volume: twitter.mentions + reddit.posts + news.articles,
      ai_analysis: aiAnalysis
    }, { merge: true });
    
  } catch (error) {
    console.error('Error collecting social signals:', error);
  }
}

// Run every 5 minutes (less frequent than price polling)
setInterval(() => {
  SYMBOLS.forEach(symbol => collectSocialSignals(symbol));
}, 5 * 60 * 1000);
```

### Phase 5: Frontend Display

**New Component: `SocialSignalsCard.jsx`**

```javascript
// client/src/components/SocialSignalsCard.jsx
import { useSocialSignals } from '../hooks/useSocialSignals';

export function SocialSignalsCard({ symbol }) {
  const signals = useSocialSignals(symbol);
  
  return (
    <div className="glass">
      <h3>Social Sentiment</h3>
      
      {/* Overall Sentiment */}
      <div>
        <span>Overall: {signals.overall_sentiment}</span>
        <SentimentGauge value={signals.overall_sentiment} />
      </div>
      
      {/* Platform Breakdown */}
      <div>
        <div>Twitter: {signals.twitter.sentiment} ({signals.twitter.mentions} mentions)</div>
        <div>Reddit: {signals.reddit.sentiment} ({signals.reddit.posts} posts)</div>
        <div>News: {signals.news.sentiment} ({signals.news.articles} articles)</div>
      </div>
      
      {/* AI Analysis */}
      <div>
        <p>{signals.ai_analysis.reasoning}</p>
        <span>Confidence: {signals.ai_analysis.confidence}</span>
      </div>
    </div>
  );
}
```

**Hook: `useSocialSignals.js`**

```javascript
// client/src/hooks/useSocialSignals.js
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function useSocialSignals(symbol) {
  const [signals, setSignals] = useState(null);
  
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'social_signals', symbol),
      (doc) => {
        if (doc.exists()) {
          setSignals(doc.data());
        }
      }
    );
    
    return unsub;
  }, [symbol]);
  
  return signals;
}
```

### Phase 6: Integration with Arbitrage Alerts

**Enhance AI analysis to include social signals:**

```javascript
// engine/utils/aiService.js
async analyzeOpportunity(alert, context = []) {
  // Get social signals for this symbol
  const socialDoc = await db.collection('social_signals')
    .doc(alert.symbol || alert.asset + '_USDT')
    .get();
  
  const socialSignals = socialDoc.exists() ? socialDoc.data() : null;
  
  const prompt = `Analyze this arbitrage opportunity:
  
Spread: ${alert.spread}%
Risk Level: ${alert.risk_level}
Projected Profit: $${alert.projected_profit}

${socialSignals ? `
Social Sentiment:
- Overall: ${socialSignals.overall_sentiment}
- Twitter: ${socialSignals.twitter.sentiment} (${socialSignals.twitter.mentions} mentions)
- Reddit: ${socialSignals.reddit.sentiment} (${socialSignals.reddit.posts} posts)
- News: ${socialSignals.news.sentiment} (${socialSignals.news.articles} articles)
` : ''}

${context.join('\n')}

Return JSON with recommendation, sentiment_score, confidence, and reasoning.`;

  return await this.generate(prompt);
}
```

---

## 📋 Implementation Checklist

### Social Signals
- [ ] Create `engine/utils/socialSignals.js`
- [ ] Implement Twitter data collection
- [ ] Implement Reddit data collection
- [ ] Implement News data collection
- [ ] Add AI sentiment analysis for social data
- [ ] Create Firestore `social_signals` collection
- [ ] Integrate into VPS bot polling loop
- [ ] Create `useSocialSignals` hook
- [ ] Create `SocialSignalsCard` component
- [ ] Add to Dashboard
- [ ] Integrate into AI opportunity analysis
- [ ] Update Firestore rules

### Performance Dashboard
- [ ] Create `trades` collection schema
- [ ] Track executed trades
- [ ] Create `useTradeHistory` hook
- [ ] Create `PerformanceChart` component
- [ ] Create `TradeHistory` component
- [ ] Create Performance page
- [ ] Add routing

### Push Notifications
- [ ] Request browser notification permission
- [ ] Create `useNotifications` hook
- [ ] Listen to Firestore alerts
- [ ] Create notification settings component
- [ ] Add to Settings page

---

## 🎯 Priority Order

1. **Social Signals** (Differentiator, high value)
2. **Performance Dashboard** (Builds trust, shows ROI)
3. **Push Notifications** (User engagement)

---

## 💡 Quick Wins (Can Add Today)

1. **Social Signals MVP**: Start with Reddit only (free API, no auth)
2. **Performance Dashboard MVP**: Just show trade count and total profit
3. **Notifications MVP**: Just browser notifications, no settings needed

---

*Last Updated: 2025-12-31*
*Status: Planning Phase*

