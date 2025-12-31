# ⚡ Setup Right Now - Copy These Commands

## 1. Install sshpass (one-time, on your local machine)

```bash
sudo apt-get install -y sshpass
```

## 2. Create user on VPS (one-time)

```bash
ssh root@46.224.114.187
```

Then run these on the VPS:
```bash
useradd -m -s /bin/bash aetheris
usermod -aG sudo aetheris
passwd aetheris
echo 'aetheris ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/npm, /usr/bin/node' | sudo tee /etc/sudoers.d/aetheris-user
sudo chmod 0440 /etc/sudoers.d/aetheris-user
exit
```

## 3. Update .env file

```bash
nano .env
```

Change:
- `User=aetheris`
- `Password=<password you set>`

## 4. Run setup (all in one)

```bash
npm run vps:setup
npm run vps:upload-secrets
npm run vps:deploy
npm run vps:start
```

## 5. Verify

```bash
npm run vps:status
npm run vps:logs
```

Done! ✅
