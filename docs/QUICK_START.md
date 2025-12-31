# Aetheris Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
- ✅ Node.js 20+ installed (`nvm use 20`)
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ WEEX API credentials (from AI Wars registration)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Configure Environment

#### Frontend Configuration
Create `.env` file in root:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend Configuration (Firebase Functions)
Set WEEX API credentials:
```bash
firebase functions:secrets:set WEEX_API_KEY
firebase functions:secrets:set WEEX_SECRET_KEY
firebase functions:secrets:set WEEX_PASSPHRASE
firebase functions:secrets:set WEEX_API_DOMAIN
```

Or for local development, create `functions/.env`:
```env
WEEX_API_KEY=your_weex_api_key
WEEX_SECRET_KEY=your_weex_secret_key
WEEX_PASSPHRASE=your_weex_passphrase
WEEX_API_DOMAIN=https://api-contract.weex.com
```

### Step 3: Initialize Firebase

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select:
# - Firestore
# - Functions
# - Use existing project
```

### Step 4: Start Development

#### Option A: Local Development with Emulators
```bash
# Start Firebase emulators
npm run serve

# In another terminal, start React dev server
npm run dev
```

#### Option B: Deploy to Firebase
```bash
# Deploy everything
firebase deploy

# Or deploy separately
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Step 5: Access the Application

- **Local**: http://localhost:3000
- **Firebase Hosting**: https://your-project.web.app

## 📋 Verification Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Firebase project initialized
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Frontend builds successfully
- [ ] WEEX API credentials set
- [ ] Test trade executed (10 USDT on cmt_btcusdt)

## 🧪 Test WEEX API Connection

```bash
curl -s --max-time 10 "https://api-contract.weex.com/capi/v2/market/time"
```

Should return server time if connection is working.

## 🐛 Troubleshooting

### Functions won't deploy
- Check Node.js version: `node --version` (should be 20+)
- Verify Firebase project: `firebase projects:list`
- Check function logs: `firebase functions:log`

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Vite version: `npm list vite`
- Verify environment variables in `.env`

### WEEX API errors
- Verify credentials are correct
- Check network connectivity
- Review API rate limits
- Check WEEX API status

## 📚 Next Steps

1. Read [README_SETUP.md](./README_SETUP.md) for detailed setup
2. Review [WEEX_API_ENDPOINTS.md](./WEEX_API_ENDPOINTS.md) for API reference
3. Check [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for architecture

## 🆘 Need Help?

- Check Firebase Console for function logs
- Review Firestore data in Firebase Console
- Verify WEEX API credentials
- Check browser console for frontend errors

