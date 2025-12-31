# 🚀 Deploy Aetheris to Firebase - Step by Step

## Quick Deployment Guide

Follow these steps to deploy both the **web app (frontend)** and **Cloud Functions (backend)** to Firebase.

## Prerequisites Check ✅

- ✅ Firebase project: `hackathon-project-245ba` (already set)
- ✅ Firestore Database: Enabled
- ✅ Node.js 20: Use `nvm use 20`
- ✅ Dependencies: Run `npm run setup` if not done

## Step 1: Install Dependencies

```bash
# Make sure you're using Node.js 20
nvm use 20

# Install all dependencies
npm run setup
```

## Step 2: Set WEEX API Secrets (Backend)

**IMPORTANT**: You need WEEX API credentials before deploying functions.

```bash
# Set each secret (you'll be prompted to enter the value)
firebase functions:secrets:set WEEX_API_KEY
firebase functions:secrets:set WEEX_SECRET_KEY
firebase functions:secrets:set WEEX_PASSPHRASE
firebase functions:secrets:set WEEX_API_DOMAIN
```

**Note**: If you don't have WEEX credentials yet, you can deploy functions later. They just won't work until secrets are set.

## Step 3: Deploy Firestore Rules & Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy database indexes
firebase deploy --only firestore:indexes
```

## Step 4: Build Frontend

```bash
# Build React app for production
npm run build
```

This creates the `dist/` folder with optimized production files.

## Step 5: Deploy Cloud Functions

```bash
# Deploy all Cloud Functions
firebase deploy --only functions
```

**Expected output**: You should see 4 functions deployed:
- `scanArbitrageOpportunities` (scheduled)
- `validateOpportunity` (trigger)
- `executeTrade` (callable)
- `getAccountBalance` (callable)

## Step 6: Deploy Web App (Frontend)

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Your app will be live at**: `https://hackathon-project-245ba.web.app`

## Step 7: Deploy Everything at Once (Alternative)

If you want to deploy everything in one command:

```bash
# Build first
npm run build

# Then deploy all
firebase deploy
```

This deploys:
- Firestore rules
- Firestore indexes
- Cloud Functions
- Hosting (web app)

## Verification

### Check Deployment Status

```bash
# List deployed functions
firebase functions:list

# Check hosting
firebase hosting:sites:list
```

### Test Your Deployment

1. **Web App**: Visit `https://hackathon-project-245ba.web.app`
2. **Functions**: Check Firebase Console → Functions
3. **Firestore**: Check Firebase Console → Firestore Database
4. **Logs**: `firebase functions:log`

## Troubleshooting

### Functions Won't Deploy

```bash
# Check Node.js version
node --version  # Should be 20.x

# Check functions directory
cd functions
npm install
cd ..

# Try deploying again
firebase deploy --only functions
```

### Hosting Won't Deploy

```bash
# Make sure dist folder exists
ls -la dist/

# If not, build first
npm run build

# Then deploy
firebase deploy --only hosting
```

### Missing Secrets Error

If functions fail because of missing secrets:
```bash
# Set the secrets (see Step 2)
firebase functions:secrets:set WEEX_API_KEY
# ... etc
```

## Post-Deployment

### 1. Enable Scheduled Function

The `scanArbitrageOpportunities` function runs on a schedule. Check it's enabled:
- Firebase Console → Functions → `scanArbitrageOpportunities`
- Should show "Enabled" status

### 2. Monitor Function Logs

```bash
# Watch logs in real-time
firebase functions:log --only scanArbitrageOpportunities
```

### 3. Test the System

1. Wait 60 seconds for first scan
2. Check Firestore for `market_ticks` data
3. Check for `opportunities` if arbitrage found
4. Test trade execution from dashboard

## Quick Commands Reference

```bash
# Build frontend
npm run build

# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore
firebase deploy --only firestore

# View logs
firebase functions:log

# List functions
firebase functions:list
```

## Next Steps After Deployment

1. ✅ Set up WEEX API credentials (if not done)
2. ✅ Test WEEX API connection
3. ✅ Monitor function execution
4. ✅ Test trade execution
5. ✅ Verify AI log uploads

## Support

- Firebase Console: https://console.firebase.google.com/project/hackathon-project-245ba
- Function Logs: `firebase functions:log`
- Firestore Data: Firebase Console → Firestore Database

