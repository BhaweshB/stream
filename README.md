# 🎥 Real-Time Video Streaming Platform

A low-latency video streaming solution that converts RTSP, HTTP, and HTTPS camera streams to browser-compatible format with **2-3 second latency**.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Latency](https://img.shields.io/badge/latency-2--3s-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🚀 **Low Latency:** 2-3 seconds (vs 6-10s with standard HLS)
- 📹 **Universal Support:** RTSP, HTTP, HTTPS, HLS
- ⚡ **Real-Time:** VLC-like performance
- 🔄 **Auto-Cleanup:** Streams stop when viewers disconnect
- 🎯 **Quality Presets:** Low, Medium, High, Auto
- 🌐 **Production Ready:** Deploy to Vercel + Railway

## 🎯 Quick Start

### Prerequisites

- Node.js 18+
- FFmpeg installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start backend
cd backend
npm run dev

# Start frontend (new terminal)
npm run dev
```

Open `http://localhost:5173` and enter a stream URL!

## 📖 Documentation

- **[QUICK_START_REALTIME.md](QUICK_START_REALTIME.md)** - Get started in 5 minutes
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to Vercel + Railway
- **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** - Quick deployment guide
- **[SUCCESS.md](SUCCESS.md)** - Technical details
- **[START.md](START.md)** - How to run locally

## 🚀 Deployment

### Frontend: Vercel

```bash
# Deploy to Vercel
vercel

# Or connect GitHub repo in Vercel dashboard
```

### Backend: Railway

```bash
# Push to GitHub
git push origin main

# Deploy via Railway dashboard
# Railway auto-detects configuration
```

See [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) for step-by-step guide.

## 🏗️ Architecture

```
Camera (RTSP/HTTP/HTTPS)
         ↓
Backend (FFmpeg + Node.js)
  • Protocol detection
  • Ultra-fast encoding
  • 1-second HLS segments
         ↓
HLS Files (Disk)
         ↓
Frontend (HLS.js)
  • Low-latency mode
  • 2-3s latency
```

## 🎬 Usage

1. Enter stream URL (RTSP, HTTP, or HTTPS)
2. Click "Connect"
3. Stream starts in 2-3 seconds
4. Click "Disconnect" to stop

### Example URLs

```
RTSP: rtsp://username:password@camera-ip:554/stream
HTTP: http://camera-ip/video.mjpg
HTTPS: https://stream-server.com/live
HLS: https://example.com/stream.m3u8
```

## ⚙️ Configuration

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_STREAMS=10
API_KEY=dev-key-12345
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=dev-key-12345
```

## 📊 Performance

| Metric | Standard HLS | Our Solution |
|--------|-------------|--------------|
| Latency | 6-10 seconds | **2-3 seconds** |
| Startup | 4-8 seconds | **2-3 seconds** |
| Segments | 2-4 seconds | **1 second** |
| Protocols | HLS only | **All formats** |

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- FFmpeg (ultra-fast encoding)
- TypeScript
- WebSocket

### Frontend
- React 18
- TypeScript
- Vite
- HLS.js (low-latency mode)
- Tailwind CSS + shadcn/ui

## 🔐 Security

- API key authentication
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation

## 💰 Cost

### Development
- **Free** (local)

### Production
- **Vercel:** Free (personal projects)
- **Railway:** $5-10/month
- **Total:** ~$5-10/month

## 🐛 Troubleshooting

### FFmpeg not found

```bash
# Windows
choco install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

### Stream won't start

1. Test URL in VLC first
2. Check backend logs
3. Verify FFmpeg is installed
4. Check firewall settings

### High latency

1. Use "low" quality preset
2. Check network bandwidth
3. Reduce concurrent streams
4. Use wired connection

## 📈 Monitoring

- Backend logs: Railway dashboard
- Frontend analytics: Vercel dashboard
- Health endpoint: `/health`

## 🤝 Contributing

Contributions welcome! This is an educational project.

## 📄 License

MIT

## 🎉 Success!

You now have a production-ready real-time streaming platform with:

✅ 2-3 second latency  
✅ RTSP/HTTP/HTTPS support  
✅ Auto-cleanup  
✅ Production deployment  
✅ VLC-like performance  

**Enjoy your real-time streaming! 🚀**
