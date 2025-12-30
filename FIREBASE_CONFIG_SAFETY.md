# Firebase Config Safety

## ✅ Safe to Commit: `firebase-config.js`

**Why it's safe:**
- Contains **public** Firebase configuration
- API key is **designed to be public** (used in client-side code)
- Firebase security is enforced by **Firestore Security Rules**, not API keys
- These values are already exposed in the browser when the app runs

**What's in it:**
- `apiKey` - Public API key (safe)
- `authDomain` - Public domain (safe)
- `projectId` - Public project ID (safe)
- `storageBucket` - Public bucket (safe)
- `messagingSenderId` - Public ID (safe)
- `appId` - Public app ID (safe)

## ❌ NEVER Commit: Service Account JSON

**Why it's dangerous:**
- Contains **private key** with admin privileges
- Can bypass all Firestore security rules
- Can read/write/delete all data
- Can access all Firebase services

**Already protected:**
- ✅ `engine/service-account.json` in `.gitignore`
- ✅ `hackathon-project-245ba-firebase-adminsdk-*.json` in `.gitignore`
- ✅ `*-firebase-adminsdk-*.json` in `.gitignore`

## Best Practice

For production, consider using environment variables:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

But for hackathon/demo projects, committing `firebase-config.js` is **perfectly fine**.

## Summary

- ✅ **Commit**: `firebase-config.js` (public config)
- ❌ **Never commit**: Service account JSON files (private keys)

