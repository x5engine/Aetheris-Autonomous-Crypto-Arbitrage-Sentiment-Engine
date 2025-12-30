# ✅ SSH Keys Working - Next Steps

Since SSH keys are working, you can skip `sshpass` and proceed directly!

## Step 1: Create User on VPS (if not done)

```bash
# SSH to VPS as root
ssh root@46.224.114.187

# Create user
useradd -m -s /bin/bash aetheris
usermod -aG sudo aetheris
passwd aetheris
# (Enter password when prompted)

# Configure sudo
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user

# Exit
exit
```

## Step 2: Copy SSH Key to New User

```bash
# Copy your SSH key to the new user
ssh-copy-id aetheris@46.224.114.187

# Test connection (should NOT ask for password)
ssh aetheris@46.224.114.187
exit
```

## Step 3: Update .env File

```bash
# Edit .env
nano .env

# Update these lines:
# User=aetheris
# Password=<password you set>  (optional, since SSH keys work)
```

## Step 4: Run Setup

```bash
# Setup VPS (installs Node.js, PM2)
npm run vps:setup

# Upload secrets (service-account.json, .env)
npm run vps:upload-secrets

# Deploy code
npm run vps:deploy

# Start bot
npm run vps:start
```

## Step 5: Verify

```bash
# Check status
npm run vps:status

# View logs
npm run vps:logs
```

## All Commands in One Go

```bash
# 1. Create user (if needed - run on VPS)
ssh root@46.224.114.187
useradd -m -s /bin/bash aetheris
usermod -aG sudo aetheris
passwd aetheris
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user
exit

# 2. Copy SSH key
ssh-copy-id aetheris@46.224.114.187

# 3. Update .env (User=aetheris)

# 4. Run setup
npm run vps:setup
npm run vps:upload-secrets
npm run vps:deploy
npm run vps:start

# 5. Verify
npm run vps:status
npm run vps:logs
```

Done! ✅

