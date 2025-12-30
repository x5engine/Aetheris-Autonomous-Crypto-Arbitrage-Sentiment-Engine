# 🚀 Run Now - User Already Created

Since the user is already created and SSH works, just run these:

## Step 1: Update .env (if needed)

```bash
nano .env
```

Make sure:
- `User=aetheris` (or whatever user you created)
- `Password=<your-password>` (optional since SSH keys work)

## Step 2: Run Setup & Deploy

```bash
# Setup VPS (Node.js, PM2)
npm run vps:setup

# Upload secrets (service-account.json, .env)
npm run vps:upload-secrets

# Deploy code
npm run vps:deploy

# Start bot
npm run vps:start
```

## Step 3: Verify

```bash
npm run vps:status
npm run vps:logs
```

## All in One Command

```bash
npm run vps:setup && npm run vps:upload-secrets && npm run vps:deploy && npm run vps:start
```

Done! ✅

