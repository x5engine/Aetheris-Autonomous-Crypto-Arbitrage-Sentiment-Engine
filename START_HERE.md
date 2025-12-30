# 🚀 Start Here - VPS Setup Steps

## ✅ Prerequisites
- ✅ SSH keys working (you're here!)
- ✅ Can SSH without password

## Step-by-Step Commands

### Step 1: Create User on VPS (One-Time)

```bash
# SSH as root
ssh root@46.224.114.187

# Run these commands on VPS:
useradd -m -s /bin/bash aetheris
usermod -aG sudo aetheris
passwd aetheris
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user
exit
```

### Step 2: Copy SSH Key to New User

```bash
ssh-copy-id aetheris@46.224.114.187
```

### Step 3: Update .env File

```bash
nano .env
```

Change:
- `User=aetheris`
- `Password=<password you set>` (optional, SSH keys work)

### Step 4: Run Setup Scripts

```bash
# Install Node.js, PM2, create directories
npm run vps:setup

# Upload service-account.json and create .env on VPS
npm run vps:upload-secrets

# Deploy engine code
npm run vps:deploy

# Start the bot
npm run vps:start
```

### Step 5: Verify Everything Works

```bash
# Check bot status
npm run vps:status

# View logs (should see price updates)
npm run vps:logs
```

## Expected Output

After `npm run vps:start`, you should see:
```
✅ Bot started
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ aetheris-engine  │ online  │ 0       │ 0s       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

After `npm run vps:logs`, you should see:
```
✅ Firebase Admin initialized
📊 BTC_USDT: WEEX=42050.00, Other=42100.00, Spread=0.12%
✅ Poll complete at 2025-12-30T12:00:00Z
```

## Troubleshooting

### Bot Not Starting?
```bash
# Check manually
ssh aetheris@46.224.114.187
cd ~/aetheris-engine
ls -la  # Check if files exist
pm2 list  # Check PM2 status
```

### No Data in Firestore?
1. Check logs: `npm run vps:logs`
2. Verify service-account.json exists on VPS
3. Check WEEX credentials in .env on VPS

## Quick Reference

```bash
npm run vps:setup        # Initial setup
npm run vps:upload-secrets  # Upload secrets
npm run vps:deploy      # Deploy code
npm run vps:start       # Start bot
npm run vps:status      # Check status
npm run vps:logs        # View logs
npm run vps:restart     # Restart bot
npm run vps:stop        # Stop bot
```

## Next Steps After Bot is Running

1. **Deploy Client** (Frontend)
   ```bash
   npm run deploy:hosting
   ```

2. **Monitor Bot**
   - Check Firestore: https://console.firebase.google.com/project/hackathon-project-245ba/firestore
   - View `live_feed` collection for price data
   - View `alerts` collection for arbitrage opportunities

Done! 🎉

