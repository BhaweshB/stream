# Backend Testing Guide

## Step 1: Verify Backend is Running

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎥  RTSP Streaming Server                              ║
║                                                           ║
║   Server:     http://localhost:3000                      ║
║   WebSocket:  ws://localhost:3000/ws                     ║
║   WebRTC:     ws://localhost:3000/webrtc                 ║
║   Health:     http://localhost:3000/health               ║
║   Environment: development                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## Step 2: Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "streams": {
    "total": 0,
    "active": 0,
    "error": 0
  }
}
```

## Step 3: Test WebSocket Connection

Create a file `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
</head>
<body>
    <h1>WebSocket Test</h1>
    <div id="status">Connecting...</div>
    <div id="messages"></div>

    <script>
        const ws = new WebSocket('ws://localhost:3000/webrtc');
        const statusDiv = document.getElementById('status');
        const messagesDiv = document.getElementById('messages');

        ws.onopen = () => {
            statusDiv.textContent = '✅ Connected!';
            console.log('WebSocket connected');
            
            // Test subscribe message
            ws.send(JSON.stringify({
                type: 'subscribe',
                streamId: 'test-stream-id'
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            messagesDiv.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        };

        ws.onerror = (error) => {
            statusDiv.textContent = '❌ Error!';
            console.error('WebSocket error:', error);
        };

        ws.onclose = (event) => {
            statusDiv.textContent = '🔌 Disconnected';
            console.log('WebSocket closed:', event.code, event.reason);
        };
    </script>
</body>
</html>
```

Open this file in your browser and check the console.

## Step 4: Test Stream Creation

```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-12345" \
  -d '{
    "name": "Test Stream",
    "rtspUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    "quality": "auto"
  }'
```

Expected response:
```json
{
  "success": true,
  "stream": {
    "id": "some-uuid",
    "name": "Test Stream",
    "rtspUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    "hlsUrl": "/webrtc/some-uuid",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastUpdate": "2025-01-01T00:00:00.000Z"
  }
}
```

## Step 5: Check Backend Logs

When you create a stream, you should see in the backend terminal:

```
[stream-id] Starting real-time stream with FFmpeg
[stream-id] Protocol: HTTP/HTTPS
[stream-id] Quality: auto (1280x720 @ 2000k)
[stream-id] Stream active - broadcasting to peers
```

## Common Issues

### Issue: Backend won't start

**Check:**
1. Port 3000 is not in use: `netstat -ano | findstr :3000` (Windows)
2. FFmpeg is installed: `ffmpeg -version`
3. Dependencies installed: `npm install`

### Issue: WebSocket won't connect

**Check:**
1. Backend is running
2. No firewall blocking port 3000
3. Correct URL: `ws://localhost:3000/webrtc` (not `/ws`)

### Issue: Stream creation fails

**Check:**
1. API key is correct: `dev-key-12345`
2. URL format is valid (rtsp://, http://, or https://)
3. Backend logs for FFmpeg errors

## Debug Mode

Add this to `backend/.env`:

```env
DEBUG=*
```

This will show detailed logs for debugging.
