# 🚀 Quick Deploy Guide - Aetheris VPS

## One-Command Deployment

Deploy everything to your VPS in 5 steps:

```bash
# 0. Create non-root user (one-time, recommended)
npm run vps:create-user
# Then update .env with new user credentials

# 1. Setup VPS (Node.js, PM2)
npm run vps:setup

# 2. Upload secrets (service-account.json, .env)
npm run vps:upload-secrets

# 3. Deploy code
npm run vps:deploy

# 4. Start bot
npm run vps:start
```

That's it! Your bot is now running on the VPS.

## What Each Script Does

### `npm run vps:setup`
- ✅ Tests SSH connection to VPS
- ✅ Installs Node.js 20
- ✅ Installs PM2 globally
- ✅ Creates project directory
- ✅ Verifies setup

**Time**: ~2-3 minutes

### `npm run vps:upload-secrets`
- ✅ Uploads `service-account.json` to VPS
- ✅ Helps create `.env` file with WEEX credentials
- ✅ Sets proper file permissions

**Time**: ~30 seconds

### `npm run vps:deploy`
- ✅ Packages engine code
- ✅ Uploads to VPS via rsync/scp
- ✅ Installs npm dependencies
- ✅ Verifies deployment

**Time**: ~1-2 minutes

### `npm run vps:start`
- ✅ Starts bot with PM2
- ✅ Enables auto-start on reboot
- ✅ Shows bot status

**Time**: ~10 seconds

## Management Commands

```bash
# View logs
npm run vps:logs

# Check status
npm run vps:status

# Restart bot
npm run vps:restart

# Stop bot
npm run vps:stop
```

## Verification

After deployment, verify everything works:

1. **Check Bot Status**
   ```bash
   npm run vps:status
   ```

2. **Check Logs**
   ```bash
   npm run vps:logs
   ```
   Should see: `✅ Firebase Admin initialized` and price updates

3. **Check Firestore**
   - Go to Firebase Console → Firestore
   - Check `live_feed` collection for price data
   - Check `alerts` collection for opportunities

## Troubleshooting

### Script Fails at SSH Connection
- Verify `.env` file has correct credentials
- Check VPS is running and accessible
- Test manually: `ssh root@46.224.114.187`

### Bot Not Starting
- Check `service-account.json` exists on VPS
- Check `.env` file on VPS has WEEX credentials
- View logs: `npm run vps:logs`

### No Data in Firestore
- Check bot logs for errors
- Verify Firebase service account permissions
- Check WEEX API credentials

## Security Reminder

⚠️ **NEVER COMMIT**:
- `.env` file (VPS credentials)
- `service-account.json` (Firebase credentials)
- Any file with passwords or API keys

All sensitive files are in `.gitignore`.

## Next Steps

After VPS bot is running:

1. **Deploy Client** (Frontend)
   ```bash
   npm run deploy:hosting
   ```

2. **Monitor Bot**
   - Check logs regularly: `npm run vps:logs`
   - Monitor Firestore data
   - Check for arbitrage opportunities

3. **Set Up Monitoring** (Optional)
   - PM2 monitoring: `pm2 monit`
   - Set up alerts for bot failures
   - Monitor VPS resources

## Support

For detailed information, see:
- `VPS_DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_GUIDE.md` - Full architecture deployment
- `README.md` - Project overview

