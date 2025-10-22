# Quick Start Guide

## What You Have

A **frontend-only** React app that plays HLS camera streams directly in your browser. No backend server required!

## Getting Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

App will open at: `http://localhost:5173`

### 3. Test with Example Stream

1. Click on one of the example URLs in the app
2. Click "Connect"
3. Watch the stream play! 🎉

## Using Your Own Camera

### If Your Camera Supports HLS

1. Find your camera's HLS stream URL (usually ends in `.m3u8`)
2. Enter the URL in the app
3. Click Connect

### If Your Camera Only Has RTSP

You need to convert RTSP to HLS first. Easiest way:

**Use MediaMTX (Free, Open Source)**

1. Download: https://github.com/bluenviron/mediamtx/releases
2. Run MediaMTX
3. It converts RTSP to HLS automatically
4. Access stream at: `http://localhost:8888/stream_name/index.m3u8`

**Quick FFmpeg Alternative**
```bash
ffmpeg -i rtsp://your-camera-url -f hls -hls_time 2 stream.m3u8
```

## Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or push to GitHub and import in Vercel dashboard.

See `DEPLOYMENT.md` for detailed instructions.

## Common Issues

### ❌ "RTSP protocol is not supported"
- Browsers can't play RTSP directly
- Convert to HLS first (see above)

### ❌ Stream won't load
- Check if stream URL is accessible
- Try example streams to verify app works
- Check browser console for CORS errors
- Ensure stream is publicly accessible or on same network

### ❌ "Network error"
- Stream might require authentication
- CORS might be blocking the request
- Check if stream is live and accessible

## What's Next?

- ✅ App works with any HLS stream
- ✅ Deployed on Vercel as static site
- ✅ No backend needed
- ✅ Access from anywhere

## Architecture

```
Browser → HLS Stream URL → HLS.js → HTML5 Video

No Server Required!
```

The app downloads HLS chunks directly from the stream source. All processing happens in your browser using HLS.js library.

## Need Help?

- Check example streams work first
- Read `README.md` for more details
- See `DEPLOYMENT.md` for Vercel setup
- Browser console shows detailed errors
