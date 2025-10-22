# 🚀 Deployment Checklist

## ✅ Files Created

All deployment files are ready:

- ✅ `backend/nixpacks.toml` - Railway FFmpeg configuration
- ✅ `backend/railway.json` - Railway deployment settings
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.example` - Environment template
- ✅ `.env` - Local development (gitignored)
- ✅ `.env.production` - Production template (gitignored)
- ✅ `src/config.ts` - Frontend configuration
- ✅ `DEPLOYMENT.md` - Full deployment guide

## 📋 Pre-Deployment Steps

### 1. Test Locally

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
npm run dev
```

Visit `http://localhost:5173` and test a stream.

### 2. Commit to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## 🚂 Deploy Backend to Railway

### Quick Steps:

1. **Go to [railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Settings:**
   - Root Directory: `backend`
   - Build Command: Auto-detected
   - Start Command: `npm start`

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   FRONTEND_URL=https://your-app.vercel.app
   MAX_STREAMS=10
   API_KEY=your-secure-random-key-here
   ```

6. **Generate Domain:**
   - Settings → Networking → Generate Domain
   - Copy your Railway URL: `https://your-app-xxxxx.railway.app`

7. **Test:**
   ```bash
   curl https://your-app-xxxxx.railway.app/health
   ```

## ▲ Deploy Frontend to Vercel

### Quick Steps:

1. **Go to [vercel.com](https://vercel.com)**
2. **New Project** → **Import Git Repository**
3. **Select your repository**
4. **Settings:**
   - Framework: Vite (auto-detected)
   - Root Directory: `.` (leave empty)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-app-xxxxx.railway.app
   VITE_API_KEY=your-secure-random-key-here
   ```
   (Use the same API_KEY as Railway)

6. **Deploy**

7. **Copy Vercel URL:** `https://your-app.vercel.app`

## 🔄 Update CORS

Go back to Railway and update:

```
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy if needed.

## ✅ Test Production

### 1. Test Backend Health

```bash
curl https://your-app-xxxxx.railway.app/health
```

Expected:
```json
{
  "status": "healthy",
  "uptime": 123,
  "streams": { "total": 0, "active": 0, "error": 0 }
}
```

### 2. Test Frontend

1. Open `https://your-app.vercel.app`
2. Enter stream URL: `http://pendelcam.kip.uni-heidelberg.de/mjpg/video.mjpg`
3. Click Connect
4. Stream should play in 2-3 seconds

### 3. Test Stream Creation

```bash
curl -X POST https://your-app-xxxxx.railway.app/api/streams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-random-key-here" \
  -d '{
    "name": "Test",
    "rtspUrl": "http://pendelcam.kip.uni-heidelberg.de/mjpg/video.mjpg",
    "quality": "auto"
  }'
```

## 🔐 Security

- [ ] Changed default API_KEY
- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] `.env` files in `.gitignore`

## 💰 Cost

### Free Tier Limits:

**Railway:**
- $5 free credit/month
- 512MB RAM
- Shared CPU
- Enough for 5-10 concurrent streams

**Vercel:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic CDN
- Free for personal projects

**Total:** Free for development, ~$5-10/month for production

## 🐛 Troubleshooting

### Backend Issues

**FFmpeg not found:**
```bash
# Check Railway logs
# Verify nixpacks.toml is in backend/ folder
```

**CORS errors:**
```bash
# Verify FRONTEND_URL matches Vercel URL
# Check Railway logs
```

### Frontend Issues

**API calls failing:**
```bash
# Check VITE_API_URL in Vercel
# Verify Railway backend is running
# Check browser console
```

**Environment variables not working:**
```bash
# Redeploy after adding variables
# Clear browser cache
```

## 📊 Monitoring

### Railway
- View logs: Project → Deployments → Logs
- Metrics: Project → Metrics
- Set up alerts for downtime

### Vercel
- Analytics: Project → Analytics
- Logs: Project → Deployments → Logs
- Performance insights

## 🎉 Success!

Your app is now live:

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-app-xxxxx.railway.app`
- **Latency:** 2-3 seconds
- **Protocols:** RTSP, HTTP, HTTPS, HLS
- **Auto-cleanup:** Streams stop when viewers disconnect

## 📝 Next Steps

- [ ] Test with your actual camera streams
- [ ] Monitor usage and costs
- [ ] Set up custom domain (optional)
- [ ] Add error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Share with users!

## 🆘 Need Help?

- **Railway:** [railway.app/help](https://railway.app/help)
- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **Full Guide:** See `DEPLOYMENT.md`

---

**Ready to deploy? Follow the steps above!** 🚀
