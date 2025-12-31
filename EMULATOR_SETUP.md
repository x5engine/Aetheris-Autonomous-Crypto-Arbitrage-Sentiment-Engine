# Firebase Emulator Setup Guide

## 🚀 Quick Start

### 1. Start Firebase Emulators
```bash
npm run emulators:start
# or
firebase emulators:start
```

This will start:
- **Firestore Emulator**: `localhost:8080`
- **Auth Emulator**: `localhost:9099`
- **Emulator UI**: `http://localhost:4000`

### 2. Configure Client to Use Emulators

Create or update `client/.env`:
```env
# Use emulators in dev mode (default: auto-connects)
VITE_USE_EMULATOR=true

# Or disable emulators (use production)
VITE_USE_EMULATOR=false
```

### 3. Start Dev Server
```bash
npm run client:dev
```

Check the console for:
```
✅ Connected to Firebase Emulators
   📍 Firestore: localhost:8080
   📍 Auth: localhost:9099
   📍 UI: http://localhost:4000
```

## ⚙️ How It Works

The app **automatically connects to emulators** in development mode unless explicitly disabled.

### Auto-Connection Logic:
- ✅ **Dev mode** (`npm run dev`) → Auto-connects to emulators
- ❌ **Production build** → Uses production Firebase
- 🔧 **Manual override**: Set `VITE_USE_EMULATOR=false` to use production in dev

## 📋 Environment Variables

### `client/.env`
```env
# EmbedAPI Key
VITE_EMBEDAPI_KEY=your_key_here

# Firebase Emulators
# true = use emulators (default in dev)
# false = use production Firebase
VITE_USE_EMULATOR=true
```

## 🎯 Testing with Emulators

### 1. Create Test Users
- Open Emulator UI: `http://localhost:4000`
- Go to Authentication → Users
- Add test users manually or via the UI

### 2. Add Test Data
- Go to Firestore in Emulator UI
- Create collections: `live_feed`, `alerts`, `users`
- Add test documents

### 3. Test Authentication
- Sign up/login will use the Auth emulator
- Users are stored locally (not in production)
- No real Firebase quota used

## 🔍 Troubleshooting

### Emulators Not Connecting?

1. **Check if emulators are running:**
   ```bash
   # Should see output like:
   # ✔  firestore: Emulator running at localhost:8080
   # ✔  auth: Emulator running at localhost:9099
   ```

2. **Check console for errors:**
   - Look for "✅ Connected to Firebase Emulators"
   - If you see warnings, emulators might not be running

3. **Verify ports are available:**
   - Firestore: 8080
   - Auth: 9099
   - UI: 4000

4. **Check `client/.env`:**
   - Make sure `VITE_USE_EMULATOR=true` (or unset for auto-connect)

### Using Production Instead?

If you want to use production Firebase in dev mode:
```env
# client/.env
VITE_USE_EMULATOR=false
```

## 📚 Emulator UI Features

Access at `http://localhost:4000`:

- **Firestore**: View/edit collections and documents
- **Authentication**: Manage users, test sign-in flows
- **Logs**: See all emulator activity
- **Data Export**: Export emulator data for testing

## 🎨 Development Workflow

1. **Start emulators** (in one terminal):
   ```bash
   npm run emulators:start
   ```

2. **Start dev server** (in another terminal):
   ```bash
   npm run client:dev
   ```

3. **Develop & Test**:
   - All Firebase operations use emulators
   - Data is local (not synced to production)
   - Fast iteration, no quota usage

4. **Deploy to Production**:
   ```bash
   npm run client:build
   firebase deploy
   ```
   Production builds automatically use production Firebase.

---

*Happy coding! 🚀*

