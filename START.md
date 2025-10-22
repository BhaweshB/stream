# How to Start the Application

## Quick Start

### 1. Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ WebRTC WebSocket server initialized on /webrtc

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎥  RTSP Streaming Server                              ║
║                                                           ║
║   Server:     http://localhost:3000                      ║
║   WebRTC WS:  ws://localhost:3000/webrtc                 ║
║   Health:     http://localhost:3000/health               ║
║   Environment: development                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 2. Start Frontend (Terminal 2)

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Open Browser

Navigate to: `http://localhost:5173`

## Test the Application

### Test 1: Backend Health Check

Open a new terminal:
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "uptime": 10,
  "streams": {
    "total": 0,
    "active": 0,
    "error": 0
  }
}
```

### Test 2: Create a Stream

In the browser:
1. Enter URL: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
2. Check "Use real-time backend conversion"
3. Click "Connect"

**Backend should show:**
```
POST /api/streams 201
[stream-id] Starting real-time stream with FFmpeg
[stream-id] Protocol: HTTP/HTTPS
[stream-id] Quality: auto (1280x720 @ 2000k)
```

**Frontend should show:**
```
✅ WebSocket connected successfully
📡 Subscribing to stream: [stream-id]
```

### Test 3: WebSocket Connection

Open browser console (F12) and check for:
```
✅ WebSocket connected successfully
📡 Subscribing to stream: xxx-xxx-xxx
```

## Troubleshooting

### Backend won't start

**Error:** `Port 3000 is already in use`

**Fix:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

### Frontend can't connect to backend

**Error:** `Backend not available`

**Fix:**
1. Verify backend is running on port 3000
2. Check `http://localhost:3000/health` in browser
3. Check CORS settings in `backend/src/server.ts`

### WebSocket connection fails

**Error:** `WebSocket connection failed`

**Fix:**
1. Restart backend server
2. Check backend logs for WebSocket initialization
3. Verify no firewall blocking port 3000
4. Check browser console for exact error

### FFmpeg not found

**Error:** `spawn ffmpeg ENOENT`

**Fix:**
```bash
# Verify FFmpeg is installed
ffmpeg -version

# If not installed:
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
```

## Stop the Application

### Stop Backend
Press `Ctrl+C` in backend terminal

### Stop Frontend
Press `Ctrl+C` in frontend terminal

## Restart

If you make changes to the code:

**Backend changes:**
- Nodemon will auto-restart
- Or manually: `Ctrl+C` then `npm run dev`

**Frontend changes:**
- Vite will auto-reload
- Or manually: `Ctrl+C` then `npm run dev`

## Production Mode

### Build

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

### Run

```bash
# Start backend
cd backend
npm start

# Serve frontend (use a static server)
npx serve -s dist
```

## Logs

### Backend Logs

All logs appear in the terminal where you ran `npm run dev`

Look for:
- `✅` Success messages
- `❌` Error messages
- `[stream-id]` Stream-specific logs

### Frontend Logs

Open browser console (F12) to see:
- WebSocket connection status
- Stream subscription status
- Video chunk reception
- Errors

## Success Indicators

✅ Backend shows: `WebRTC WebSocket server initialized`  
✅ Frontend loads without errors  
✅ Health endpoint returns `{"status": "healthy"}`  
✅ WebSocket connects: `WebSocket connected successfully`  
✅ Stream plays with minimal latency  

## Next Steps

Once everything is running:
1. Test with your RTSP camera
2. Adjust quality settings
3. Monitor performance
4. Deploy to production

## Need Help?

Check:
- [QUICK_START_REALTIME.md](QUICK_START_REALTIME.md)
- [TEST_BACKEND.md](TEST_BACKEND.md)
- [INSTALL.md](INSTALL.md)
- Backend terminal logs
- Browser console (F12)
