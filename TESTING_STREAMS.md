# Testing HTTP/HTTPS Streams

## Issue Identified

The stream URL you're trying to use is **OFFLINE/UNREACHABLE**:
```
http://retro.newscam.com:50000/vga/Motorino/cgi?Resolution=640x480&Quality=Clarity
```

When I tested this URL, it times out. FFmpeg cannot connect to it.

## Test with Working Streams

Try these **verified working** test streams instead:

### 1. Big Buck Bunny (HTTP HLS - Direct)
```
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```
**Note:** This is already HLS format, so it should work directly in the player without FFmpeg conversion.

### 2. Sintel (HTTP MP4)
```
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

### 3. RTSP Test Stream (if you have access)
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

## How to Test

1. **Delete the failed stream** from your UI (stream ID: `a0b75ea0-8444-45c3-8e21-9497c9d0e936`)
2. **Create a new stream** with one of the URLs above
3. **Check backend console** for FFmpeg logs to see if it's processing
4. **Wait 5-10 seconds** for FFmpeg to generate HLS files
5. **Play the stream**

## Backend Logs to Watch

The backend should show logs like:
```
[stream-id] Starting FFmpeg with command: ffmpeg -timeout 5000000 -reconnect 1...
[stream-id] FFmpeg: Opening 'http://...' for reading
[stream-id] FFmpeg: Stream mapping:...
```

If you see errors like "Connection refused" or "timed out", the source stream is not accessible.
