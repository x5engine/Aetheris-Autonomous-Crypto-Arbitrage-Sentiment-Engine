# VPS User Setup Guide

## Why Use a Non-Root User?

Using a non-root user is a security best practice:
- ✅ Reduces risk of accidental system damage
- ✅ Limits attack surface if compromised
- ✅ Follows principle of least privilege
- ✅ Better for production environments

## Quick Setup (Automated)

### Option 1: Automated Script

```bash
npm run vps:create-user
```

This script will:
1. Connect to VPS as root
2. Create user `aetheris` (or custom name)
3. Add to sudo group
4. Set up password
5. Configure sudo permissions

### Option 2: Manual Commands

If you prefer to do it manually, here are the commands:

```bash
# 1. SSH to VPS as root
ssh root@46.224.114.187

# 2. Create new user
useradd -m -s /bin/bash aetheris

# 3. Add to sudo group
usermod -aG sudo aetheris

# 4. Set password for new user
passwd aetheris
# (Enter password when prompted)

# 5. Configure passwordless sudo for npm/node (optional but recommended)
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user

# 6. Exit and test connection
exit
ssh aetheris@46.224.114.187
```

## Update .env File

After creating the user, update your `.env` file:

```env
server="ubuntu-4gb-nbg1-2"
IPv4=46.224.114.187/32
User=aetheris          # Changed from root
Password=your_password # The password you set
```

## Verify Setup

Test the new user:

```bash
# Test SSH connection
ssh aetheris@46.224.114.187

# Test sudo (should work without password for npm/node)
sudo npm --version

# Test sudo for apt (should work without password)
sudo apt-get update
```

## Custom Username

To use a different username, set it before running the script:

```bash
export VPS_USER=myusername
npm run vps:create-user
```

Or edit the script and change `NEW_USER` variable.

## SSH Key Setup (Optional but Recommended)

For better security, set up SSH key authentication:

```bash
# On your local machine, generate key if you don't have one
ssh-keygen -t rsa -b 4096

# Copy public key to VPS
ssh-copy-id aetheris@46.224.114.187

# Or manually:
cat ~/.ssh/id_rsa.pub | ssh aetheris@46.224.114.187 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

After setting up SSH keys, you can remove password authentication from `.env` and use keys instead.

## Sudo Configuration

The script configures passwordless sudo for:
- `/usr/bin/apt-get` - Package management
- `/usr/bin/apt` - Package management
- `/usr/bin/npm` - Node package manager
- `/usr/bin/node` - Node.js runtime

This allows the deployment scripts to run without prompting for passwords, while still requiring passwords for other sudo commands.

## Troubleshooting

### User Already Exists

If the user already exists, the script will ask if you want to delete and recreate it. Choose:
- `y` - Delete and recreate (use with caution)
- `n` - Keep existing user

### Permission Denied

If you get permission errors:
1. Verify user is in sudo group: `groups aetheris`
2. Check sudoers file: `sudo cat /etc/sudoers.d/aetheris-user`
3. Test sudo: `sudo -v`

### Can't Install Packages

If npm/node installation fails:
1. Check if user has sudo access: `sudo whoami`
2. Verify sudoers configuration
3. Try running with explicit sudo: `sudo npm install -g pm2`

## Next Steps

After creating the user:

1. **Update .env** with new user credentials
2. **Run setup**: `npm run vps:setup`
3. **Deploy**: `npm run vps:deploy`
4. **Start bot**: `npm run vps:start`

## Security Best Practices

1. ✅ Use non-root user (done)
2. ✅ Set up SSH keys (recommended)
3. ✅ Disable password login (after SSH keys work)
4. ✅ Use strong passwords
5. ✅ Keep system updated
6. ✅ Monitor logs regularly

## Commands Reference

```bash
# Create user (automated)
npm run vps:create-user

# Show manual commands
./scripts/vps-create-user-simple.sh

# Test connection
ssh aetheris@46.224.114.187

# Check user info
id aetheris
groups aetheris

# Check sudo access
sudo -l
```

