# 🚀 Full-Stack RTSP Streaming Platform

Professional enterprise-grade system for streaming RTSP cameras through HLS in the browser.

## 📋 What's Included

### Frontend (React + Vite)
- Modern dark mode UI with shadcn/ui
- HLS.js video player
- Real-time WebSocket updates
- Stream management dashboard
- Responsive design

### Backend (Node.js + Express)
- RTSP to HLS conversion (FFmpeg)
- Multiple stream support
- RESTful API
- WebSocket server
- Health monitoring
- Docker ready
- Railway/Render deployment configs

## 🏗 Architecture

```
RTSP Camera
    ↓
Backend (Node.js + FFmpeg)
    │
    ├─ Converts RTSP → HLS
    ├─ Serves HLS files
    ├─ REST API
    └─ WebSocket notifications
    ↓
Frontend (React + HLS.js)
    │
    ├─ Stream management UI
    ├─ Video player
    └─ Real-time updates
```

## 🚀 Quick Start (Development)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Backend will run at: `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to root (or frontend directory)
cd ..

# Install dependencies (if not already done)
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
# Set VITE_API_URL=http://localhost:3000

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

### 3. Test the System

1. Open frontend at `http://localhost:5173`
2. Enter stream name: "Test Camera"
3. Enter RTSP URL (your camera or use a test stream)
4. Click "Create Stream"
5. Wait for status to become "active"
6. Click on the stream to view it

## 🐳 Docker Deployment

### Build and Run Backend

```bash
cd backend
docker build -t rtsp-backend .
docker run -p 3000:3000 rtsp-backend
```

### Frontend with Docker (Optional)

```bash
# In root directory
docker build -t rtsp-frontend .
docker run -p 8080:80 rtsp-frontend
```

### Docker Compose (Both Services)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./streams:/usr/src/app/streams

  frontend:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend
```

## ☁️ Production Deployment

### Option 1: Railway (Recommended)

**Backend:**
1. Push code to GitHub
2. Go to railway.app
3. New Project → Deploy from GitHub
4. Select `backend` folder
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   API_KEY=your-secret-key
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Deploy

**Frontend:**
1. Go to vercel.com
2. Import GitHub repository
3. Framework: Vite
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_API_KEY=your-secret-key
   ```
5. Deploy

### Option 2: Render

**Backend:**
1. Push code to GitHub
2. Go to render.com
3. New Web Service
4. Connect repository
5. Root Directory: `backend`
6. Build Command: `npm install && npm run build`
7. Start Command: `npm start`
8. Add environment variables
9. Add Persistent Disk: `/usr/src/app/streams` (10GB)
10. Deploy

**Frontend:**
Same as Railway option

### Option 3: DigitalOcean App Platform

**Backend:**
1. Create new app from GitHub
2. Select backend folder
3. Configure build settings
4. Add environment variables
5. Deploy

**Frontend:**
Same as Railway option

## 🔧 Configuration

### Backend Environment Variables

```env
# Required
PORT=3000
NODE_ENV=production

# Security
API_KEY=generate-a-strong-key-here
FRONTEND_URL=https://your-frontend-domain.com

# Stream Settings
MAX_STREAMS=10
HLS_OUTPUT_DIR=./streams

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-domain.com
VITE_API_KEY=same-as-backend-api-key
```

## 📡 API Usage Examples

### Create a Stream

```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "Front Door Camera",
    "rtspUrl": "rtsp://admin:password@192.168.1.100:554/stream1",
    "quality": "high"
  }'
```

### Get All Streams

```bash
curl http://localhost:3000/api/streams \
  -H "X-API-Key: your-api-key"
```

### Delete a Stream

```bash
curl -X DELETE http://localhost:3000/api/streams/stream-id \
  -H "X-API-Key: your-api-key"
```

## 🎯 Features Showcase for Client

### Real-Time Features
- ✅ Live RTSP to HLS conversion
- ✅ Multiple concurrent camera streams
- ✅ Instant status updates via WebSocket
- ✅ Auto-retry on connection errors

### Management Features
- ✅ Create/Delete streams via UI
- ✅ Stream health monitoring
- ✅ Quality presets (low/medium/high)
- ✅ Error handling and recovery

### Technical Excellence
- ✅ RESTful API design
- ✅ WebSocket real-time updates
- ✅ Docker containerization
- ✅ Production-ready deployment
- ✅ Security (API keys, rate limiting)
- ✅ Comprehensive logging
- ✅ Health check endpoints

### UI/UX
- ✅ Modern dark mode design
- ✅ Responsive layout
- ✅ Intuitive stream management
- ✅ Real-time status indicators
- ✅ Professional error messages

## 🧪 Testing

### Test RTSP URLs

If you don't have a real camera, use these test RTSP streams:

```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

Or use public HLS streams to test the player without backend:
```
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Test API
artillery quick --count 10 --num 50 http://localhost:3000/health
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

```bash
# Development
npm run dev

# Production (using PM2)
pm2 logs rtsp-backend
```

### Metrics to Track

- Active streams count
- Stream health status
- API response times
- CPU/Memory usage per stream
- Error rates
- WebSocket connections

## 🔐 Security Checklist

- [ ] Change default API_KEY
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set rate limits appropriately
- [ ] Secure RTSP credentials
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Set up firewalls

## 🚨 Troubleshooting

### Backend Won't Start

1. Check FFmpeg is installed: `ffmpeg -version`
2. Check port 3000 is available
3. Verify .env file exists
4. Check logs for errors

### Stream Won't Play

1. Verify RTSP URL is correct
2. Check camera is accessible
3. Look at backend logs
4. Check network connectivity
5. Verify HLS files are generated in streams folder

### WebSocket Not Connecting

1. Check backend is running
2. Verify WebSocket URL is correct
3. Check browser console for errors
4. Ensure no firewall blocking

## 💰 Cost Estimate

### Railway (Recommended)
- Backend: $5-10/month
- Frontend: Free (Vercel)
- Total: $5-10/month

### Render
- Backend: $7/month (Starter)
- Frontend: Free (Vercel)
- Total: $7/month

### DigitalOcean
- Backend: $5-10/month (Basic Droplet)
- Frontend: Free (Vercel)
- Total: $5-10/month

## 📚 Documentation

- [Backend API Reference](./backend/README.md)
- [Frontend Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🎓 Next Steps

1. ✅ Test locally (both frontend and backend)
2. ✅ Test with real RTSP camera
3. ✅ Deploy backend to Railway/Render
4. ✅ Deploy frontend to Vercel
5. ✅ Configure production URLs
6. ✅ Test production deployment
7. ✅ Show to client 🎉

## 🤝 Support

For issues:
1. Check backend logs
2. Check frontend browser console
3. Verify environment variables
4. Test health endpoint
5. Check FFmpeg installation

## 🎉 Success!

You now have a professional, production-ready RTSP streaming platform that will impress your client!

**Key Selling Points:**
- ✅ Converts any RTSP camera to web-viewable HLS
- ✅ No browser limitations
- ✅ Scalable architecture
- ✅ Real-time updates
- ✅ Professional UI
- ✅ Production-ready
- ✅ Easy deployment
- ✅ Comprehensive monitoring
