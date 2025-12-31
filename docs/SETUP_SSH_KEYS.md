# Setup SSH Keys (No sshpass Needed!)

## Quick Setup

```bash
# 1. Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096 -C "aetheris-vps"
# Press Enter to accept defaults (or set a passphrase)

# 2. Copy public key to VPS
ssh-copy-id aetheris@46.224.114.187
# Enter password when prompted (one time only)

# 3. Test (should NOT ask for password)
ssh aetheris@46.224.114.187

# 4. Done! No more passwords needed
```

## After SSH Keys Setup

Once SSH keys are set up, you can:
- Remove `Password` from `.env` (optional)
- Scripts will use SSH keys automatically
- No `sshpass` needed!

## Update Scripts to Use SSH Keys

I can update all scripts to:
1. Check for SSH keys first
2. Fall back to sshpass if keys not available
3. Prefer SSH keys (more secure)

Would you like me to update the scripts to support SSH keys?

