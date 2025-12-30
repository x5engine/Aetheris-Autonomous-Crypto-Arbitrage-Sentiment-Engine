# VPS Setup - Step by Step Commands

## Prerequisites Check

```bash
# 1. Verify you have .env file with VPS credentials
cat .env | grep -E "server|IPv4|User|Password"

# 2. Install sshpass on your LOCAL machine (if not installed)
sudo apt-get install -y sshpass

# 3. Verify sshpass is installed
which sshpass
```

---

## Step 1: Create Non-Root User on VPS

### Option A: Automated (Recommended)

```bash
# Run the automated script
npm run vps:create-user
```

### Option B: Manual Commands

```bash
# 1. SSH to VPS as root (use credentials from .env)
ssh root@46.224.114.187

# 2. Create new user
useradd -m -s /bin/bash aetheris

# 3. Add to sudo group
usermod -aG sudo aetheris

# 4. Set password for new user
passwd aetheris
# (Enter password when prompted - remember this!)

# 5. Configure passwordless sudo for npm/node (optional but recommended)
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user

# 6. Exit root session
exit

# 7. Test new user connection
ssh aetheris@46.224.114.187
# (Enter password you set)

# 8. Test sudo (should work without password for npm/node)
sudo npm --version
exit
```

### Update .env File

After creating the user, update your `.env` file:

```bash
# Edit .env file
nano .env

# Change these lines:
# User=aetheris
# Password=<the password you set in step 4>
```

---

## Step 2: Initial VPS Setup

```bash
# Run the setup script (installs Node.js, PM2, creates directories)
npm run vps:setup
```

**What this does:**
- ✅ Tests SSH connection
- ✅ Installs Node.js 20
- ✅ Installs PM2 globally
- ✅ Creates project directory `~/aetheris-engine`

**Expected output:**
```
✅ SSH connection successful
✅ Node.js installed: v20.x.x
✅ npm installed: x.x.x
✅ PM2 installed: x.x.x
✅ Created directory: ~/aetheris-engine
```

---

## Step 3: Upload Secrets

### 3a. Get Firebase Service Account

```bash
# Check if you have service-account.json
ls -la engine/service-account.json

# If not, download it from Firebase Console:
# 1. Go to: https://console.firebase.google.com/project/hackathon-project-245ba/settings/serviceaccounts/adminsdk
# 2. Click "Generate New Private Key"
# 3. Save as: engine/service-account.json
```

### 3b. Upload Secrets to VPS

```bash
# Run the upload script
npm run vps:upload-secrets
```

**What this does:**
- ✅ Uploads `service-account.json` to VPS
- ✅ Helps create `.env` file with WEEX credentials

**When prompted for WEEX credentials, enter:**
- `WEEX_API_KEY`: Your WEEX API key
- `WEEX_SECRET_KEY`: Your WEEX secret key
- `WEEX_PASSPHRASE`: Your WEEX passphrase

---

## Step 4: Deploy Engine Code

```bash
# Deploy the bot code to VPS
npm run vps:deploy
```

**What this does:**
- ✅ Packages engine files
- ✅ Uploads to VPS via rsync/scp
- ✅ Installs npm dependencies
- ✅ Verifies deployment

**Expected output:**
```
✅ Package created
✅ Files uploaded
✅ Dependencies installed
✅ bot.js found
✅ package.json found
✅ service-account.json found
✅ .env file found
```

---

## Step 5: Start the Bot

```bash
# Start the bot with PM2
npm run vps:start
```

**What this does:**
- ✅ Starts bot with PM2
- ✅ Enables auto-start on reboot
- ✅ Shows bot status

**Expected output:**
```
✅ Bot started
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ aetheris-engine │ online  │ 0       │ 0s       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

---

## Step 6: Verify Everything Works

### 6a. Check Bot Status

```bash
# Check if bot is running
npm run vps:status
```

### 6b. View Bot Logs

```bash
# View last 50 lines of logs
npm run vps:logs

# View last 100 lines
npm run vps:logs 100
```

**Expected log output:**
```
✅ Firebase Admin initialized
📊 BTC_USDT: WEEX=42050.00, Other=42100.00, Spread=0.12%
✅ Poll complete at 2025-12-30T12:00:00Z
```

### 6c. Check Firestore Data

1. Go to: https://console.firebase.google.com/project/hackathon-project-245ba/firestore
2. Check `live_feed` collection - should have price data
3. Check `alerts` collection - should have opportunities when detected

---

## Troubleshooting Commands

### Bot Not Starting?

```bash
# SSH to VPS and check manually
ssh aetheris@46.224.114.187
cd ~/aetheris-engine

# Check if files exist
ls -la

# Check if service-account.json exists
test -f service-account.json && echo "✅ Found" || echo "❌ Missing"

# Check if .env exists
test -f .env && echo "✅ Found" || echo "❌ Missing"

# Try running bot manually
node bot.js
# (Press Ctrl+C to stop)
```

### Bot Crashed?

```bash
# Check PM2 logs
npm run vps:logs

# Restart bot
npm run vps:restart

# Check PM2 status
ssh aetheris@46.224.114.187 "pm2 list"
```

### No Data in Firestore?

```bash
# Check bot logs for errors
npm run vps:logs

# Check if Firebase credentials are correct
ssh aetheris@46.224.114.187 "cd ~/aetheris-engine && test -f service-account.json && echo '✅ Found' || echo '❌ Missing'"

# Check if WEEX credentials are set
ssh aetheris@46.224.114.187 "cd ~/aetheris-engine && grep -q WEEX_API_KEY .env && echo '✅ Found' || echo '❌ Missing'"
```

---

## Quick Reference Commands

```bash
# Setup
npm run vps:setup              # Initial VPS setup
npm run vps:upload-secrets      # Upload secrets
npm run vps:deploy              # Deploy code
npm run vps:start               # Start bot

# Management
npm run vps:status              # Check status
npm run vps:logs                # View logs
npm run vps:restart             # Restart bot
npm run vps:stop                # Stop bot

# Manual SSH
ssh aetheris@46.224.114.187    # Connect to VPS
```

---

## Complete Setup Checklist

- [ ] Install sshpass on local machine
- [ ] Create non-root user on VPS (aetheris)
- [ ] Update .env with new user credentials
- [ ] Run `npm run vps:setup`
- [ ] Download service-account.json from Firebase
- [ ] Run `npm run vps:upload-secrets`
- [ ] Run `npm run vps:deploy`
- [ ] Run `npm run vps:start`
- [ ] Verify bot is running: `npm run vps:status`
- [ ] Check logs: `npm run vps:logs`
- [ ] Verify Firestore data in Firebase Console

---

## Next Steps

After bot is running:

1. **Deploy Client** (Frontend)
   ```bash
   npm run deploy:hosting
   ```

2. **Monitor Bot**
   - Check logs regularly: `npm run vps:logs`
   - Monitor Firestore data
   - Check for arbitrage opportunities

3. **Set Up Monitoring** (Optional)
   - PM2 monitoring: `ssh aetheris@46.224.114.187 "pm2 monit"`
   - Set up alerts for bot failures

