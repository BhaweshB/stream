# Quick Start - Real-Time Streaming

Get your real-time streaming solution running in 5 minutes!

## Prerequisites

- Node.js 18+
- FFmpeg installed
- npm or yarn

## Step 1: Install FFmpeg

### Windows
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
# Add to PATH
```

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

## Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 3: Configure Backend

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit if needed (defaults work for local development)
```

## Step 4: Start Servers

### Option A: Run Both (Recommended)

```bash
# From project root
npm run dev:fullstack
```

This starts:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173`

### Option B: Run Separately

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (in new terminal)
npm run dev
```

## Step 5: Test the Stream

1. Open browser to `http://localhost:5173`
2. Enter a stream URL:
   - **RTSP:** `rtsp://username:password@camera-ip:554/stream`
   - **HTTP:** `http://camera-ip/video.mjpeg`
   - **Test HLS:** `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
3. Check "Use real-time backend conversion" for RTSP
4. Click **Connect**
5. Stream starts in <2 seconds!

## Example RTSP URLs

### Generic IP Camera
```
rtsp://admin:password@192.168.1.100:554/stream1
rtsp://admin:password@192.168.1.100:554/h264
```

### Hikvision
```
rtsp://admin:password@192.168.1.100:554/Streaming/Channels/101
```

### Dahua
```
rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
```

### Axis
```
rtsp://root:password@192.168.1.100/axis-media/media.amp
```

## Troubleshooting

### Backend Won't Start

**Error:** `spawn ffmpeg ENOENT`

**Solution:** FFmpeg not in PATH
```bash
# Windows: Add FFmpeg to system PATH
# Or set in backend/.env:
FFMPEG_PATH=C:\path\to\ffmpeg.exe
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Change port in `backend/.env`:
```env
PORT=3001
```

Then update frontend API calls to use new port.

### Stream Won't Connect

1. **Test in VLC first:**
   ```bash
   vlc rtsp://your-camera-url
   ```

2. **Check camera is accessible:**
   ```bash
   ping camera-ip
   ```

3. **Verify credentials** (username/password)

4. **Check firewall** allows RTSP (port 554)

### High Latency

1. Lower quality: Use "low" preset
2. Check network: Run speed test
3. Reduce GOP size in code (change `-g 30` to `-g 15`)

## API Testing

### Create Stream via API

```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-12345" \
  -d '{
    "name": "Test Camera",
    "rtspUrl": "rtsp://admin:password@192.168.1.100:554/stream1",
    "quality": "auto"
  }'
```

### List All Streams

```bash
curl http://localhost:3000/api/streams \
  -H "X-API-Key: dev-key-12345"
```

### Check Health

```bash
curl http://localhost:3000/health
```

## Performance Tips

### For Best Latency (<1 second)
- Use wired network connection
- Use "low" or "medium" quality
- Close other bandwidth-heavy applications
- Position camera close to router

### For Best Quality
- Use "high" quality preset
- Ensure 5+ Mbps upload from camera
- Use modern browser (Chrome/Edge recommended)

## Next Steps

- Read [REALTIME_STREAMING.md](REALTIME_STREAMING.md) for detailed documentation
- Check [backend/README.md](backend/README.md) for API reference
- Deploy to production (Railway, Render, or Docker)

## Common Use Cases

### Home Security
```javascript
// Multiple cameras
const cameras = [
  { name: 'Front Door', url: 'rtsp://192.168.1.100:554/stream1' },
  { name: 'Backyard', url: 'rtsp://192.168.1.101:554/stream1' },
  { name: 'Garage', url: 'rtsp://192.168.1.102:554/stream1' }
];
```

### Baby Monitor
```javascript
// Low latency, low quality for mobile
{
  quality: 'low',  // 640x480, 500k bitrate
  rtspUrl: 'rtsp://baby-cam/stream'
}
```

### Professional Surveillance
```javascript
// High quality, multiple streams
{
  quality: 'high',  // 1080p, 3000k bitrate
  rtspUrl: 'rtsp://pro-camera/stream'
}
```

## Support

Having issues? Check:
1. Backend logs in terminal
2. Browser console (F12)
3. FFmpeg is installed: `ffmpeg -version`
4. Camera works in VLC

## Success!

You now have a real-time streaming solution with VLC-like performance! 🎉

Latency: **0.5-2 seconds** (vs 6-10 seconds with traditional HLS)
