# Firebase Configuration

## Project Information

- **Project ID**: `hackathon-project-245ba`
- **Project Name**: hackathon-project
- **Project Number**: 13696281360
- **Firebase Console**: [https://console.firebase.google.com/project/hackathon-project-245ba](https://console.firebase.google.com/project/hackathon-project-245ba)

## Configuration Files

### 1. `.firebaserc`
Contains the Firebase project ID:
```json
{
  "projects": {
    "default": "hackathon-project-245ba"
  }
}
```

### 2. `.env`
Contains Firebase configuration for the frontend:
```env
VITE_FIREBASE_API_KEY=AIzaSyA5wjZM78tGyAVDlv2Yy95HKl0kjFvjkLk
VITE_FIREBASE_AUTH_DOMAIN=hackathon-project-245ba.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hackathon-project-245ba
VITE_FIREBASE_STORAGE_BUCKET=hackathon-project-245ba.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=13696281360
VITE_FIREBASE_APP_ID=1:13696281360:web:07952d00bbbf12d8c0d395
```

### 3. `src/lib/firebase.js`
Uses environment variables with fallback to project defaults.

## Services Enabled

Make sure the following services are enabled in Firebase Console:

1. **Firestore Database**
   - Go to: Firestore Database → Create database
   - Start in production mode (rules will be deployed)
   - Choose a location

2. **Cloud Functions**
   - Go to: Functions → Get started
   - Enable billing if required

3. **Firebase Hosting** (optional, for frontend deployment)
   - Go to: Hosting → Get started

## Quick Setup Commands

```bash
# Verify project is set
firebase use

# Should show: hackathon-project-245ba (current)

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy everything
firebase deploy
```

## Environment Variables

The project uses environment variables for configuration:

- **Frontend**: Uses `.env` file (already configured)
- **Backend**: Uses Firebase Functions secrets (set via CLI)

### Setting Backend Secrets

```bash
# Set WEEX API credentials
firebase functions:secrets:set WEEX_API_KEY
firebase functions:secrets:set WEEX_SECRET_KEY
firebase functions:secrets:set WEEX_PASSPHRASE
firebase functions:secrets:set WEEX_API_DOMAIN
```

## Verification

Check that everything is configured:

```bash
# Verify Firebase project
firebase projects:list

# Should show hackathon-project-245ba as current

# Test Firestore connection
firebase firestore:indexes

# Test Functions
firebase functions:list
```

## Troubleshooting

### Project Not Found
```bash
# Set the project explicitly
firebase use hackathon-project-245ba

# Or login again
firebase login
```

### Environment Variables Not Loading
- Make sure `.env` file exists in root directory
- Restart the dev server after changing `.env`
- Check that variables start with `VITE_`

### Functions Not Deploying
- Check Node.js version: `node --version` (should be 20)
- Verify project: `firebase use`
- Check billing is enabled (if required)

## Security Notes

⚠️ **Important**:
- `.env` file is in `.gitignore` (not committed)
- Firebase API keys are safe to expose in frontend code
- WEEX API credentials should ONLY be in Functions secrets
- Never commit `.env` or secrets to version control

## Next Steps

1. Enable Firestore Database in Firebase Console
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Set WEEX API secrets: `firebase functions:secrets:set WEEX_API_KEY`
4. Deploy Functions: `firebase deploy --only functions`
5. Start development: `npm run dev`

