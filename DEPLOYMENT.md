# Aetheris Deployment Guide

## Pre-Deployment Checklist

- [ ] All dependencies installed (`npm run setup`)
- [ ] Environment variables configured
- [ ] Firebase project created and initialized
- [ ] WEEX API credentials obtained
- [ ] Verification script passes (`npm run verify`)

## Step-by-Step Deployment

### 1. Initial Setup

```bash
# Use Node.js 20
nvm use 20

# Install all dependencies
npm run setup

# Verify setup
npm run verify
```

### 2. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Select:
# - Firestore
# - Functions
# - Use existing project (or create new)
```

### 3. Environment Variables

#### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend (Firebase Functions Secrets)
```bash
# Set WEEX API credentials as secrets
firebase functions:secrets:set WEEX_API_KEY
firebase functions:secrets:set WEEX_SECRET_KEY
firebase functions:secrets:set WEEX_PASSPHRASE
firebase functions:secrets:set WEEX_API_DOMAIN
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:scanArbitrageOpportunities
firebase deploy --only functions:executeTrade
```

### 6. Build and Deploy Frontend

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting (if configured)
firebase deploy --only hosting
```

### 7. Verify Deployment

1. Check Firebase Console:
   - Functions are deployed and running
   - Firestore rules are active
   - No errors in function logs

2. Test WEEX API:
   ```bash
   curl -s --max-time 10 "https://api-contract.weex.com/capi/v2/market/time"
   ```

3. Test Trade Execution:
   - Place test order (10 USDT on cmt_btcusdt)
   - Verify AI log upload

## Post-Deployment

### Monitor Function Logs

```bash
# View real-time logs
firebase functions:log

# View logs for specific function
firebase functions:log --only scanArbitrageOpportunities
```

### Monitor Firestore

- Check `market_ticks` collection for price data
- Check `opportunities` collection for arbitrage opportunities
- Check `audit_logs` for trading actions

### Monitor WEEX API

- Check API rate limits
- Monitor API response times
- Verify AI log uploads are successful

## Troubleshooting

### Functions Not Deploying

1. Check Node.js version: `node --version` (must be 20)
2. Verify Firebase project: `firebase projects:list`
3. Check function syntax: `cd functions && npm run lint`
4. Review function logs: `firebase functions:log`

### Functions Not Executing

1. Check scheduled function: Verify cron expression
2. Check triggers: Verify Firestore triggers are set up
3. Check permissions: Verify service account has proper roles
4. Check environment variables: Verify secrets are set

### Frontend Not Loading

1. Check build: `npm run build` should succeed
2. Check Firebase config: Verify environment variables
3. Check browser console: Look for errors
4. Check network: Verify Firebase services are accessible

### WEEX API Errors

1. Verify credentials: Check API keys are correct
2. Check network: Verify connectivity to WEEX API
3. Check rate limits: Monitor API usage
4. Review error logs: Check function logs for details

## Rollback Procedure

If deployment fails:

```bash
# Rollback functions to previous version
firebase functions:delete FUNCTION_NAME
firebase deploy --only functions:FUNCTION_NAME

# Rollback Firestore rules
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

## Production Best Practices

1. **Monitoring**: Set up alerts for function errors
2. **Logging**: Enable detailed logging for debugging
3. **Backup**: Regular Firestore backups
4. **Security**: Regularly rotate API keys
5. **Testing**: Test in staging before production
6. **Documentation**: Keep deployment docs updated

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm run setup
      - run: npm run verify
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Support

For issues:
1. Check function logs
2. Review Firestore data
3. Verify WEEX API status
4. Check Firebase status page

