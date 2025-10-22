# RTSP Streaming Backend

Professional Node.js backend for converting RTSP camera streams to HLS format for browser playback.

## 🚀 Features

- ✅ **RTSP to HLS Conversion** - Real-time transcoding using FFmpeg
- ✅ **Multiple Stream Support** - Handle up to 10 concurrent camera streams
- ✅ **WebSocket Updates** - Real-time stream status notifications
- ✅ **RESTful API** - Complete CRUD operations for stream management
- ✅ **Health Monitoring** - Track stream status, bitrate, and errors
- ✅ **Production Ready** - Docker, Railway, and Render deployment configs
- ✅ **Auto-Recovery** - Intelligent error handling and stream restart
- ✅ **Rate Limiting** - Protection against API abuse
- ✅ **API Key Auth** - Secure endpoints in production

## 📋 Prerequisites

- **Node.js** 18+ 
- **FFmpeg** installed on system
- **npm** or **yarn**

## 🛠 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your settings
```

## 🔧 Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_STREAMS=10
API_KEY=your-secret-key
```

## 🚀 Running Locally

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## 🐳 Docker

```bash
# Build image
docker build -t rtsp-backend .

# Run container
docker run -p 3000:3000 rtsp-backend
```

## ☁️ Deployment

### Railway

1. Push code to GitHub
2. Connect repository in Railway
3. Add environment variables
4. Deploy automatically

### Render

1. Push code to GitHub
2. Create new Web Service in Render
3. Connect repository
4. Use `render.yaml` config
5. Deploy

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### **GET /health**
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "streams": {
    "total": 5,
    "active": 3,
    "error": 0
  }
}
```

#### **GET /api/streams**
Get all streams

**Headers:**
```
X-API-Key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "streams": [
    {
      "id": "uuid",
      "name": "Front Door Camera",
      "rtspUrl": "rtsp://...",
      "hlsUrl": "/streams/uuid/index.m3u8",
      "status": "active",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### **POST /api/streams**
Create new stream

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "name": "My Camera",
  "rtspUrl": "rtsp://username:password@192.168.1.100:554/stream1",
  "quality": "high"
}
```

**Quality Options:** `low`, `medium`, `high`, `auto`

**Response:**
```json
{
  "success": true,
  "stream": {
    "id": "uuid",
    "name": "My Camera",
    "hlsUrl": "/streams/uuid/index.m3u8",
    "status": "pending"
  }
}
```

#### **GET /api/streams/:id**
Get single stream

**Response:**
```json
{
  "success": true,
  "stream": { ... }
}
```

#### **DELETE /api/streams/:id**
Stop and remove stream

**Response:**
```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

#### **GET /api/streams/:id/stats**
Get stream statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "streamId": "uuid",
    "viewers": 5,
    "bitrate": 2000,
    "fps": 30,
    "uptime": 3600,
    "errors": 0
  }
}
```

## 🔌 WebSocket

Connect to real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Message types:
// - streamUpdate: Stream status changed
// - streams: List of all streams
// - subscribed: Subscription confirmed
```

## 🎨 Quality Presets

| Quality | Resolution | Bitrate | Use Case |
|---------|-----------|---------|----------|
| **low** | 640x480 | 500k | Mobile, bandwidth constrained |
| **medium** | 1280x720 | 1500k | Standard desktop viewing |
| **high** | 1920x1080 | 3000k | High quality, good bandwidth |
| **auto** | 1280x720 | 2000k | Balanced default |

## 🔐 Security

- API key authentication in production
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation

## 📊 Monitoring

Access health endpoint for monitoring:

```bash
curl http://localhost:3000/health
```

Integrate with monitoring services:
- Uptime Robot
- Pingdom
- New Relic
- DataDog

## 🐛 Troubleshooting

### FFmpeg Not Found

**Error:** `spawn ffmpeg ENOENT`

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from ffmpeg.org and add to PATH
```

### Stream Won't Start

**Check:**
1. RTSP URL is correct
2. Camera is accessible
3. Network allows RTSP traffic
4. FFmpeg is installed
5. Check logs: `npm run dev`

### Permission Denied on Streams Folder

```bash
mkdir -p streams
chmod 777 streams
```

## 📈 Performance

- **Latency:** 6-10 seconds (HLS standard)
- **CPU Usage:** ~20% per stream (1080p)
- **Memory:** ~100MB per stream
- **Max Streams:** Configurable (default: 10)

## 🏗 Architecture

```
RTSP Camera
    ↓
Node.js Backend (FFmpeg)
    ↓
HLS Segments (.m3u8 + .ts files)
    ↓
Served via Express Static
    ↓
Frontend Player (HLS.js)
```

## 📝 License

MIT

## 🤝 Support

For issues or questions, check the logs:
```bash
npm run dev  # Development logs
```

## 🎯 Production Checklist

- [ ] Set strong API_KEY in .env
- [ ] Configure FRONTEND_URL
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure log aggregation
- [ ] Set resource limits (MAX_STREAMS)
- [ ] Test with actual camera streams
- [ ] Document camera credentials securely
- [ ] Set up automated backups (if storing configs)
