# Aetheris Setup Guide

## Prerequisites

- Node.js 20+ (use `nvm use 20`)
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- WEEX API credentials (APIKey, SecretKey, Passphrase) from AI Wars registration

## Installation

### 1. Install Dependencies

```bash
# Root dependencies (React frontend)
npm install

# Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 2. Firebase Configuration

1. Login to Firebase:
```bash
firebase login
```

2. Firebase project is already configured:
   - **Project ID**: `hackathon-project-245ba`
   - **Project is set as current** in Firebase CLI
   
   If you need to reinitialize:
   ```bash
   firebase use hackathon-project-245ba
   ```

   Or initialize from scratch:
   ```bash
   firebase init
   ```
   
   Select:
   - Firestore
   - Functions
   - Use existing project: `hackathon-project-245ba`

### 3. Environment Variables

#### Frontend (.env file in root)
The `.env` file has been pre-configured with your Firebase project credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSyA5wjZM78tGyAVDlv2Yy95HKl0kjFvjkLk
VITE_FIREBASE_AUTH_DOMAIN=hackathon-project-245ba.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hackathon-project-245ba
VITE_FIREBASE_STORAGE_BUCKET=hackathon-project-245ba.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=13696281360
VITE_FIREBASE_APP_ID=1:13696281360:web:07952d00bbbf12d8c0d395
VITE_USE_EMULATOR=false
```

**Note**: The `.env` file is already created with your project configuration. If you need to modify it, edit `.env` directly.

#### Backend (Firebase Functions environment variables)
```bash
firebase functions:config:set \
  weex.api_key="your_weex_api_key" \
  weex.secret_key="your_weex_secret_key" \
  weex.passphrase="your_weex_passphrase" \
  weex.api_domain="https://api-contract.weex.com"
```

Or for Firebase Functions v2, use:
```bash
firebase functions:secrets:set WEEX_API_KEY
firebase functions:secrets:set WEEX_SECRET_KEY
firebase functions:secrets:set WEEX_PASSPHRASE
firebase functions:secrets:set WEEX_API_DOMAIN
```

### 4. Firestore Setup

1. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

2. Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## Running the Application

### Development Mode

1. Start Firebase Emulators (optional, for local development):
```bash
firebase emulators:start
```

2. Start React development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

Or deploy separately:
```bash
# Deploy functions only
firebase deploy --only functions

# Deploy hosting (if configured)
firebase deploy --only hosting
```

## WEEX API Integration

### Getting WEEX Credentials

1. Register for [AI Wars: WEEX Alpha Awakens](https://www.weex.com/api-doc/ai/QuickStart/IntegrationPreparation)
2. Wait for team approval
3. Receive API credentials:
   - APIKey
   - SecretKey
   - Passphrase

### Testing WEEX API Connection

Test the connection:
```bash
curl -s --max-time 10 "https://api-contract.weex.com/capi/v2/market/time"
```

### Test Trade

As per WEEX requirements, perform a test trade:
- Place an order of approximately 10 USDT on the `cmt_btcusdt` pair
- This validates system compatibility

## Project Structure

```
aetheris-protocol/
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── hooks/             # React hooks
│   └── lib/               # Utilities
├── functions/             # Firebase Cloud Functions
│   ├── scanners/          # Price scanning logic
│   └── utils/             # Helper functions
├── firebase.json          # Firebase configuration
└── package.json           # Dependencies
```

## Features

- ✅ Real-time arbitrage opportunity detection
- ✅ WEEX API integration for market data and trading
- ✅ AI-powered sentiment analysis (Transformers.js)
- ✅ Automated compliance checks
- ✅ Real-time dashboard with Firestore listeners
- ✅ Trade execution via WEEX API

## Troubleshooting

### Firebase Functions Errors

- Ensure Node.js 20 is being used: `nvm use 20`
- Check environment variables are set correctly
- Verify Firebase project is initialized

### WEEX API Errors

- Verify API credentials are correct
- Check network connectivity to `api-contract.weex.com`
- Ensure API keys have proper permissions
- Review WEEX API rate limits

### Frontend Errors

- Check Firebase config in `.env` file
- Verify Firestore rules allow read/write
- Ensure Transformers.js model loads correctly (may take time on first load)

## Security Notes

⚠️ **IMPORTANT**: Never commit API keys or secrets to version control!

- WEEX credentials should only be stored in Firebase Functions environment variables
- Frontend should never have access to WEEX API keys
- Use Firebase Security Rules to protect Firestore data
- Regularly rotate API credentials

## Support

For WEEX API issues, refer to:
- [WEEX API Documentation](https://www.weex.com/api-doc/ai/QuickStart/IntegrationPreparation)
- [WEEX API Error Codes](https://www.weex.com/api-doc/contract/ErrorCodes/ExampleOfErrorCode)

