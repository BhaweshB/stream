# Deployment Guide

## Overview

- **Frontend:** Vercel (static hosting)
- **Backend:** Railway (Node.js + FFmpeg)

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Railway account (free tier works)

## Part 1: Deploy Backend to Railway

### Step 1: Prepare Backend

1. Make sure your backend code is in the `backend/` folder
2. Ensure `backend/package.json` has the correct scripts:
   ```json
   {
     "scripts": {
       "dev": "nodemon src/server.ts",
       "build": "tsc",
       "start": "node dist/server.js"
     }
   }
   ```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect the backend

### Step 4: Configure Railway

1. **Set Root Directory:**
   - Go to Settings → Service Settings
   - Set "Root Directory" to `backend`

2. **Add Environment Variables:**
   - Go to Variables tab
   - Add these variables:
   ```
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-app.vercel.app
   MAX_STREAMS=10
   API_KEY=your-secure-api-key-here
   ```

3. **FFmpeg is automatically installed** via `nixpacks.toml`

4. **Get your Railway URL:**
   - Go to Settings → Domains
   - Copy the Railway URL (e.g., `https://your-app.railway.app`)

### Step 5: Test Backend

```bash
curl https://your-app.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "uptime": 123,
  "streams": { "total": 0, "active": 0, "error": 0 }
}
```

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Environment File

Create `.env.production` in the root:

```env
VITE_API_URL=https://your-app.railway.app
```

Replace `your-app.railway.app` with your actual Railway URL.

### Step 2: Update Frontend Code

Update `src/App.tsx` to use environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Replace all instances of 'http://localhost:3000' with API_URL
const response = await fetch(`${API_URL}/api/streams`, {
  // ...
})
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Vite configuration

### Step 4: Configure Vercel

1. **Framework Preset:** Vite (auto-detected)
2. **Root Directory:** Leave as `.` (root)
3. **Build Command:** `npm run build` (auto-detected)
4. **Output Directory:** `dist` (auto-detected)

5. **Environment Variables:**
   - Add `VITE_API_URL` = `https://your-app.railway.app`

6. Click "Deploy"

### Step 5: Update Railway CORS

Go back to Railway and update `FRONTEND_URL`:

```
FRONTEND_URL=https://your-app.vercel.app
```

Replace with your actual Vercel URL.

## Part 3: Update Code for Production

### Update Frontend API Calls

Create `src/config.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const API_KEY = 'your-secure-api-key-here' // Same as Railway
```

Update `src/App.tsx`:

```typescript
import { API_URL, API_KEY } from './config'

// Replace all fetch calls:
const response = await fetch(`${API_URL}/api/streams`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  // ...
})
```

### Update WebSocket URL

In `src/components/WebRTCPlayer.tsx` (if still using):

```typescript
const wsUrl = API_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/webrtc'
```

## Part 4: Test Production Deployment

### Test Backend

```bash
curl https://your-app.railway.app/health
```

### Test Frontend

1. Open `https://your-app.vercel.app`
2. Enter a stream URL
3. Click Connect
4. Stream should start playing

### Test Stream Creation

```bash
curl -X POST https://your-app.railway.app/api/streams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-api-key-here" \
  -d '{
    "name": "Test Stream",
    "rtspUrl": "http://pendelcam.kip.uni-heidelberg.de/mjpg/video.mjpg",
    "quality": "auto"
  }'
```

## Troubleshooting

### Backend Issues

**FFmpeg not found:**
- Check Railway logs
- Verify `nixpacks.toml` is in `backend/` folder
- Redeploy if needed

**CORS errors:**
- Verify `FRONTEND_URL` in Railway matches your Vercel URL
- Check Railway logs for CORS errors

**Port issues:**
- Railway automatically sets `PORT` environment variable
- Make sure your code uses `process.env.PORT`

### Frontend Issues

**API calls failing:**
- Check `VITE_API_URL` is set correctly in Vercel
- Verify Railway backend is running
- Check browser console for errors

**Environment variables not working:**
- Vercel requires `VITE_` prefix for client-side variables
- Redeploy after adding environment variables

## Cost Estimates

### Railway (Backend)
- **Free Tier:** $5 credit/month
- **Estimated usage:** $5-10/month for light usage
- **Includes:** FFmpeg, Node.js, 512MB RAM

### Vercel (Frontend)
- **Free Tier:** Unlimited for personal projects
- **Bandwidth:** 100GB/month
- **Builds:** Unlimited

### Total Cost
- **Development:** Free (both free tiers)
- **Light Production:** $5-10/month (Railway only)
- **Heavy Production:** $10-20/month

## Scaling

### Railway
- Upgrade to Pro plan for more resources
- Add horizontal scaling for multiple instances
- Use Railway's built-in metrics

### Vercel
- Automatic CDN and edge caching
- Scales automatically with traffic
- No configuration needed

## Security Checklist

- [ ] Change default API key
- [ ] Enable HTTPS only
- [ ] Set strong API_KEY in Railway
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Monitor logs regularly
- [ ] Set up error tracking (Sentry)
- [ ] Regular security updates

## Monitoring

### Railway
- Built-in logs and metrics
- Set up alerts for downtime
- Monitor CPU and memory usage

### Vercel
- Analytics dashboard
- Real-time logs
- Performance insights

## Backup Strategy

### Code
- GitHub repository (automatic)
- Regular commits

### Configuration
- Document all environment variables
- Keep `.env.example` updated
- Store API keys securely (1Password, etc.)

## Updates and Maintenance

### Update Backend
```bash
git add backend/
git commit -m "Update backend"
git push
```
Railway auto-deploys on push.

### Update Frontend
```bash
git add src/
git commit -m "Update frontend"
git push
```
Vercel auto-deploys on push.

## Support

- **Railway:** [railway.app/help](https://railway.app/help)
- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **FFmpeg:** [ffmpeg.org/documentation](https://ffmpeg.org/documentation.html)

## Success! 🎉

Your app is now deployed and accessible worldwide:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

Enjoy your production-ready real-time streaming platform!
