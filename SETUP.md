# 🚀 Setup Instructions

Quick setup guide for the Professional RTSP Streaming Platform.

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn**
- **FFmpeg** installed (for backend mode)

## Step 1: Install Frontend Dependencies

```bash
npm install
```

## Step 2: Choose Your Mode

### Option A: Frontend-Only (Simpler)

Perfect if you:
- Have pre-converted HLS streams
- Use external tools like MediaMTX
- Want zero backend costs

**Setup:**
```bash
# Just run the frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

Use the original `App.tsx` component.

---

### Option B: Full-Stack (Professional)

Perfect if you:
- Want to convert RTSP directly
- Need impressive demo for client
- Want complete stream management

**Setup:**

#### 1. Install Backend Dependencies
```bash
npm run backend:install
```

#### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env if needed
cd ..
```

#### 3. Configure Frontend
```bash
cp .env.local.example .env.local
# Edit .env.local to set VITE_API_URL=http://localhost:3000
```

#### 4. Switch to Full-Stack App
Edit `src/main.tsx`:

```typescript
// Change this line:
import App from './App.tsx'

// To this:
import App from './AppWithBackend.tsx'
```

#### 5. Run Both Services
```bash
# Option 1: Run together
npm run dev:fullstack

# Option 2: Run separately
# Terminal 1:
npm run backend:dev

# Terminal 2:
npm run dev
```

**URLs:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Backend Health: `http://localhost:3000/health`
- WebSocket: `ws://localhost:3000/ws`

---

## Step 3: Test the Application

### Frontend-Only Mode

1. Open `http://localhost:5173`
2. Click on an example HLS URL
3. Click "Connect"
4. Video should play!

### Full-Stack Mode

1. Open `http://localhost:5173`
2. Verify "Backend Connected" shows green
3. Enter stream name: "Test Camera"
4. Enter RTSP URL (test or real camera)
5. Click "Create Stream"
6. Wait for status to become "active"
7. Click on the stream
8. Video plays!

**Test RTSP URL:**
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

---

## Step 4: Deploy to Production

### Frontend to Vercel

```bash
# Build first
npm run build

# Deploy
npm install -g vercel
vercel
```

### Backend to Railway

```bash
cd backend

# Login to Railway
railway login

# Deploy
railway up
```

Or use the Railway dashboard to deploy from GitHub.

### Update Frontend Environment

After deploying backend, update frontend:

```env
# .env.local (for local dev)
VITE_API_URL=https://your-backend.railway.app

# In Vercel dashboard, add environment variable:
VITE_API_URL=https://your-backend.railway.app
```

Redeploy frontend.

---

## Common Issues

### "FFmpeg not found"

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
# Add to PATH
```

### "Backend Not Connected"

**Checklist:**
1. Is backend running? (`npm run backend:dev`)
2. Check console for errors
3. Verify VITE_API_URL in .env.local
4. Test backend health: `curl http://localhost:3000/health`

### "Stream won't play"

**Checklist:**
1. Is RTSP URL correct?
2. Is camera accessible on network?
3. Check backend logs for errors
4. Wait for stream status to become "active"
5. Try the test RTSP URL first

### "Port already in use"

**Solution:**
```bash
# Find and kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## Project Structure

```
ui/
├── src/                          # Frontend
│   ├── App.tsx                   # Frontend-only version
│   ├── AppWithBackend.tsx        # Full-stack version
│   └── services/api.ts           # API client
├── backend/                      # Backend
│   ├── src/
│   │   ├── server.ts             # Main server
│   │   ├── routes/streams.ts     # API routes
│   │   └── services/             # Business logic
│   └── package.json
├── package.json                  # Frontend dependencies
├── FULLSTACK_GUIDE.md            # Complete guide
└── README_MAIN.md                # Overview
```

---

## Quick Commands Reference

```bash
# Frontend only
npm run dev                    # Start frontend dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Backend only
npm run backend:install        # Install backend deps
npm run backend:dev            # Start backend dev server
npm run backend:build          # Build backend

# Full-stack
npm run dev:fullstack          # Run both together
```

---

## Next Steps

1. ✅ Complete setup (this file)
2. ✅ Test locally
3. ✅ Test with real RTSP camera
4. ✅ Deploy to production
5. ✅ Configure custom domains
6. ✅ Show to client
7. ✅ Celebrate! 🎉

---

## Need Help?

- **Full-Stack Guide:** [FULLSTACK_GUIDE.md](./FULLSTACK_GUIDE.md)
- **Backend API Docs:** [backend/README.md](./backend/README.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

## Support

Check logs for errors:
```bash
# Frontend (browser console)
Press F12 in browser

# Backend
npm run backend:dev
# Logs appear in terminal
```

---

**You're all set! Start impressing your client! 🚀**
