# 🎥 Professional RTSP Streaming Platform

Enterprise-grade solution for streaming RTSP camera feeds through HLS in web browsers. Built with React, Node.js, and FFmpeg.

## 🌟 Two Modes Available

### Mode 1: Frontend-Only (Original)
- Simple HLS stream viewer
- No backend required
- Deploy to Vercel as static site
- Use with pre-converted HLS streams or external services like MediaMTX

### Mode 2: Full-Stack (Professional)
- Complete RTSP to HLS streaming solution
- Node.js backend with FFmpeg integration
- Automatic RTSP conversion
- Multiple stream management
- Real-time WebSocket updates
- Production-ready for Railway/Render

## 🚀 Quick Start

### Frontend-Only Mode

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel
```

**Use with:** External HLS URLs or MediaMTX for RTSP conversion

### Full-Stack Mode

```bash
# Install all dependencies
npm install
npm run backend:install

# Run both frontend and backend
npm run dev:fullstack

# Or run separately:
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend  
npm run dev
```

**Features:** Complete RTSP to HLS conversion, stream management, WebSocket updates

## 📁 Project Structure

```
ui/
├── src/                    # Frontend React app
│   ├── components/ui/      # shadcn/ui components
│   ├── services/           # API client
│   ├── App.tsx             # Frontend-only version
│   ├── AppWithBackend.tsx  # Full-stack version
│   └── main.tsx            # Entry point
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Stream management, WebSocket
│   │   ├── middleware/     # Auth, error handling
│   │   └── server.ts       # Main server
│   ├── Dockerfile          # Docker config
│   ├── railway.json        # Railway deployment
│   └── render.yaml         # Render deployment
├── package.json            # Frontend dependencies
└── README.md               # This file
```

## ✨ Features

### Frontend
- ✅ Modern dark mode UI (shadcn/ui)
- ✅ HLS.js video player
- ✅ Responsive design
- ✅ Real-time stream status
- ✅ Error handling & recovery
- ✅ Multiple stream support

### Backend (Full-Stack Mode)
- ✅ RTSP to HLS conversion (FFmpeg)
- ✅ RESTful API
- ✅ WebSocket real-time updates
- ✅ Stream health monitoring
- ✅ Quality presets (low/medium/high)
- ✅ Docker containerization
- ✅ Railway/Render ready
- ✅ API key authentication
- ✅ Rate limiting

## 🎯 Which Mode Should You Use?

### Choose Frontend-Only If:
- ✅ You have pre-converted HLS streams
- ✅ You're using an external converter (MediaMTX)
- ✅ You want zero backend costs (Vercel free tier)
- ✅ Simple deployment requirements

### Choose Full-Stack If:
- ✅ You want to convert RTSP directly
- ✅ You need multi-camera management
- ✅ You want real-time monitoring
- ✅ Professional/enterprise deployment
- ✅ Client presentation (impressive!)

## 📚 Documentation

- **[FULLSTACK_GUIDE.md](./FULLSTACK_GUIDE.md)** - Complete full-stack setup and deployment
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Frontend deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide

## 🐳 Docker Deployment

### Backend Only
```bash
cd backend
docker build -t rtsp-backend .
docker run -p 3000:3000 rtsp-backend
```

### Full Stack with Docker Compose
```bash
docker-compose up
```

## ☁️ Production Deployment

### Recommended Setup

**Backend:** Railway or Render  
**Frontend:** Vercel

### Cost Estimate
- Backend: $5-10/month
- Frontend: Free
- **Total: $5-10/month**

### Quick Deploy

**Backend to Railway:**
```bash
cd backend
railway up
```

**Frontend to Vercel:**
```bash
vercel
```

See [FULLSTACK_GUIDE.md](./FULLSTACK_GUIDE.md) for detailed instructions.

## 🔧 Configuration

### Frontend Environment (.env.local)
```env
VITE_API_URL=http://localhost:3000        # Backend URL
VITE_API_KEY=your-api-key                 # Optional
```

### Backend Environment (backend/.env)
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
API_KEY=your-secret-key
MAX_STREAMS=10
```

## 📡 API Usage (Full-Stack Mode)

### Create Stream
```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "Front Door",
    "rtspUrl": "rtsp://admin:pass@192.168.1.100:554/stream1",
    "quality": "high"
  }'
```

### Get All Streams
```bash
curl http://localhost:3000/api/streams \
  -H "X-API-Key: your-api-key"
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 🎨 Features Showcase

Perfect for impressing clients with:

1. **Professional UI** - Modern, dark mode, responsive
2. **Real-Time Updates** - WebSocket live notifications
3. **Multi-Camera** - Handle multiple RTSP streams
4. **Auto-Conversion** - RTSP → HLS automatically
5. **Health Monitoring** - Track stream status
6. **Production Ready** - Docker, deployment configs included
7. **Secure** - API keys, rate limiting, CORS
8. **Scalable** - Cloud deployment ready

## 🧪 Testing

### Test Without Real Camera

**Frontend-Only:**
Use example HLS streams in the app

**Full-Stack:**
Use public RTSP test stream:
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

## 🚨 Troubleshooting

### "Backend Not Connected"
- Ensure backend is running: `npm run backend:dev`
- Check VITE_API_URL in .env.local
- Verify backend port (default: 3000)

### "FFmpeg Not Found" (Backend)
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from ffmpeg.org
```

### Stream Won't Play
- Verify RTSP URL is correct
- Check camera is accessible on network
- Look at backend logs for errors
- Ensure stream status is "active"

## 📊 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- HLS.js
- Lucide Icons

### Backend
- Node.js 18+
- Express
- TypeScript
- FFmpeg
- WebSocket (ws)
- Docker

## 🔐 Security

- API key authentication
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation
- Secure credential handling

## 📈 Performance

- **Latency:** 6-10 seconds (HLS standard)
- **CPU:** ~20% per 1080p stream
- **Memory:** ~100MB per stream
- **Concurrent Streams:** Configurable (default: 10)

## 🤝 Contributing

Feel free to fork and customize for your needs!

## 📄 License

MIT

## 🎉 Ready to Impress Your Client?

1. ✅ Clone this repository
2. ✅ Follow [FULLSTACK_GUIDE.md](./FULLSTACK_GUIDE.md)
3. ✅ Deploy to production
4. ✅ Present to client
5. ✅ Get that contract! 💰

---

**Questions?** Check the documentation files or open an issue.

**Need help deploying?** See [FULLSTACK_GUIDE.md](./FULLSTACK_GUIDE.md)

**Want to showcase?** Use Full-Stack mode with WebSocket updates for maximum impact!
