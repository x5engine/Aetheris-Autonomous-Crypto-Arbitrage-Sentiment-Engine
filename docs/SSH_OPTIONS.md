# SSH Authentication Options

## Why sshpass?

The scripts use `sshpass` because they need to **automate SSH connections with passwords**. 

**Current setup:**
- Uses password authentication (from `.env` file)
- `sshpass` allows scripts to pass passwords automatically
- Without it, scripts would prompt for password interactively

## Better Alternatives

### Option 1: SSH Keys (Recommended - No Password Needed!)

**Benefits:**
- ✅ More secure
- ✅ No password needed
- ✅ No sshpass required
- ✅ Standard practice

**Setup:**

```bash
# 1. Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "aetheris-vps"

# 2. Copy public key to VPS
ssh-copy-id aetheris@46.224.114.187

# Or manually:
cat ~/.ssh/id_rsa.pub | ssh aetheris@46.224.114.187 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 3. Test (should not ask for password)
ssh aetheris@46.224.114.187

# 4. Update scripts to use SSH keys instead of sshpass
```

**Update scripts to use SSH keys:**
- Remove `sshpass -p "$VPS_PASSWORD"` 
- Use just `ssh` commands
- Scripts will use your SSH key automatically

### Option 2: Keep sshpass (Current)

**Why it's used:**
- Scripts need to automate SSH without interaction
- Password is stored in `.env` file
- `sshpass` passes password automatically

**Install:**
```bash
sudo apt-get install -y sshpass
```

### Option 3: Manual SSH (No Automation)

**If you don't want automation:**
- SSH manually to VPS
- Run commands manually
- No scripts needed

## Recommendation

**Use SSH Keys!** It's:
- More secure
- Standard practice
- No password management
- No sshpass dependency

Would you like me to:
1. Update scripts to use SSH keys instead of sshpass?
2. Keep sshpass but explain it better?
3. Create a hybrid version that supports both?

