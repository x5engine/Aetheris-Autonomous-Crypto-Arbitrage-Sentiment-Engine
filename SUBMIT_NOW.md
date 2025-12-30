# ⚡ SUBMIT NOW - Quick Commands

## Option 1: Automated (Recommended)

```bash
./DEPLOY_NOW.sh
```

## Option 2: Manual Steps

### Step 1: Deploy Bot
```bash
npm run vps:deploy
npm run vps:start
```

### Step 2: Deploy Frontend
```bash
npm run deploy:hosting
```

### Step 3: Verify
```bash
npm run vps:status
npm run vps:logs
```

## Quick Verification

1. **Bot Running?**
   ```bash
   npm run vps:status
   ```

2. **Firestore Data?**
   - Go to: https://console.firebase.google.com/project/hackathon-project-245ba/firestore
   - Check `live_feed` collection

3. **Frontend Live?**
   - Go to: https://hackathon-project-245ba.web.app

## Submission Checklist

- [ ] Bot deployed and running
- [ ] Frontend deployed
- [ ] Firestore has data
- [ ] Frontend shows real-time updates

## If Something Fails

```bash
# Check bot logs
npm run vps:logs

# Restart bot
npm run vps:restart

# Check status
npm run vps:status
```

