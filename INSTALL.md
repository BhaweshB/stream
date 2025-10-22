# Installation Guide

## System Requirements

- **Node.js:** 18.0.0 or higher
- **FFmpeg:** Latest version
- **npm:** 8.0.0 or higher
- **OS:** Windows, macOS, or Linux
- **RAM:** 2GB minimum (4GB recommended)
- **Network:** Stable internet connection

## Step-by-Step Installation

### 1. Install FFmpeg

FFmpeg is required for video transcoding.

#### Windows

**Option A: Using Chocolatey (Recommended)**
```powershell
# Install Chocolatey if not installed
# Then run:
choco install ffmpeg
```

**Option B: Manual Installation**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to system PATH
4. Restart terminal

**Verify:**
```powershell
ffmpeg -version
```

#### macOS

```bash
# Using Homebrew
brew install ffmpeg

# Verify
ffmpeg -version
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install ffmpeg

# Verify
ffmpeg -version
```

#### Linux (CentOS/RHEL)

```bash
sudo yum install epel-release
sudo yum install ffmpeg

# Verify
ffmpeg -version
```

### 2. Clone or Download Project

```bash
# If using git
git clone <your-repo-url>
cd rtsp-stream-viewer

# Or download and extract ZIP
```

### 3. Install Frontend Dependencies

```bash
# In project root
npm install
```

This installs:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- UI components
- WebSocket client

### 4. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

This installs:
- Express
- WebSocket server
- FFmpeg wrapper
- Security middleware
- CORS support

### 5. Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit if needed (defaults work for local dev)
```

**Default Configuration:**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_STREAMS=10
API_KEY=dev-key-12345
```

### 6. Verify Installation

```bash
# Check Node.js
node --version
# Should be 18.0.0 or higher

# Check npm
npm --version
# Should be 8.0.0 or higher

# Check FFmpeg
ffmpeg -version
# Should show version info

# Check dependencies
npm list --depth=0
cd backend && npm list --depth=0 && cd ..
```

## Running the Application

### Option 1: Run Both Servers (Recommended)

```bash
npm run dev:fullstack
```

This starts:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 3: Production Build

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
npm start
```

## Testing Installation

### 1. Check Backend Health

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

### 2. Test Frontend

Open browser to http://localhost:5173

You should see the Stream Viewer interface.

### 3. Test with Sample Stream

1. Click on example URL:
   ```
   https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
   ```
2. Click "Connect"
3. Video should start playing

### 4. Test Real-Time Backend

1. Check "Use real-time backend conversion"
2. Enter any HTTP stream URL
3. Click "Connect"
4. Backend should create stream and start playback

## Common Installation Issues

### Issue: FFmpeg Not Found

**Error:**
```
spawn ffmpeg ENOENT
```

**Solution:**
1. Verify FFmpeg is installed: `ffmpeg -version`
2. Add FFmpeg to PATH
3. Or set explicit path in `backend/.env`:
   ```env
   FFMPEG_PATH=C:\path\to\ffmpeg.exe
   FFPROBE_PATH=C:\path\to\ffprobe.exe
   ```

### Issue: Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::3000
```

**Solution:**
1. Change port in `backend/.env`:
   ```env
   PORT=3001
   ```
2. Update frontend API calls to use new port

### Issue: Module Not Found

**Error:**
```
Cannot find module 'express'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission Denied (Linux/macOS)

**Error:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER .

# Or use sudo (not recommended)
sudo npm install
```

### Issue: TypeScript Errors

**Error:**
```
TS2307: Cannot find module
```

**Solution:**
```bash
# Reinstall TypeScript
npm install -D typescript
cd backend && npm install -D typescript
```

## Updating

### Update Dependencies

```bash
# Update frontend
npm update

# Update backend
cd backend
npm update
```

### Update FFmpeg

```bash
# Windows (Chocolatey)
choco upgrade ffmpeg

# macOS
brew upgrade ffmpeg

# Linux
sudo apt-get update
sudo apt-get upgrade ffmpeg
```

## Uninstallation

### Remove Project

```bash
# Delete project folder
rm -rf rtsp-stream-viewer
```

### Remove FFmpeg (Optional)

```bash
# Windows (Chocolatey)
choco uninstall ffmpeg

# macOS
brew uninstall ffmpeg

# Linux
sudo apt-get remove ffmpeg
```

## Next Steps

After successful installation:

1. **Read Quick Start:** [QUICK_START_REALTIME.md](QUICK_START_REALTIME.md)
2. **Test with Camera:** Use your RTSP camera URL
3. **Configure Quality:** Adjust presets for your needs
4. **Deploy:** Follow deployment guide for production

## Getting Help

If you encounter issues:

1. Check this installation guide
2. Review [QUICK_START_REALTIME.md](QUICK_START_REALTIME.md)
3. Check backend logs in terminal
4. Check browser console (F12)
5. Verify FFmpeg: `ffmpeg -version`
6. Test stream in VLC first

## System-Specific Notes

### Windows

- Use PowerShell (not CMD) for better compatibility
- FFmpeg path may need backslashes: `C:\\ffmpeg\\bin\\ffmpeg.exe`
- Firewall may block ports 3000 and 5173

### macOS

- May need to allow terminal in Security & Privacy settings
- Use Homebrew for easiest FFmpeg installation
- Port 5173 should work without issues

### Linux

- May need `sudo` for port 80/443
- Check SELinux/AppArmor if having permission issues
- Ensure FFmpeg has execute permissions

## Production Deployment

For production deployment, see:
- [REALTIME_STREAMING.md](REALTIME_STREAMING.md) - Deployment section
- Docker configuration
- Railway/Render guides

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] FFmpeg installed and in PATH
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Environment configured
- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Test stream plays successfully
- [ ] Real-time backend conversion works

## Congratulations! 🎉

Your real-time streaming solution is now installed and ready to use!

Open http://localhost:5173 and start streaming with VLC-like performance!
