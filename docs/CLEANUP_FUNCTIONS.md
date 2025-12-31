# Cleanup Firebase Functions

## Status

There is still one Firebase Function deployed:
- `scanArbitrageOpportunities` (scheduled function)

## Manual Cleanup

Since we're moving to VPS architecture, you can manually delete this function:

### Option 1: Firebase Console
1. Go to: https://console.firebase.google.com/project/hackathon-project-245ba/functions
2. Click on `scanArbitrageOpportunities`
3. Click "Delete" button

### Option 2: Firebase CLI
```bash
firebase functions:delete scanArbitrageOpportunities --region us-central1
```

### Option 3: Google Cloud Console
1. Go to: https://console.cloud.google.com/functions
2. Select project: `hackathon-project-245ba`
3. Find and delete the function

## Note

This function won't interfere with the new architecture since:
- The VPS bot handles all API polling
- The function is not called by the frontend
- It can be safely deleted

The new system works independently of Firebase Functions.

