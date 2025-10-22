# ✅ Environment Setup Verification

## Files Status

### ✅ Root Directory

**Environment Files:**
- ✅ `.env` - Local development (gitignored)
- ✅ `.env.example` - Template for developers
- ✅ `.env.production` - Production template (gitignored)

**Configuration:**
- ✅ `.gitignore` - Properly configured
- ✅ `vercel.json` - Vercel deployment config
- ✅ `src/config.ts` - Environment variable handler

### ✅ Backend Directory

**Environment Files:**
- ✅ `backend/.env` - Local development (gitignored)
- ✅ `backend/.env.example` - Template for developers

**Configuration:**
- ✅ `backend/.gitignore` - Properly configured
- ✅ `backend/nixpacks.toml` - Railway FFmpeg config
- ✅ `backend/railway.json` - Railway deployment config

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=dev-key-12345
```

**Usage in code:**
```typescript
// src/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const API_KEY = import.meta.env.VITE_API_KEY || 'dev-key-12345'
```

### Backend (backend/.env)

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_STREAMS=10
API_KEY=dev-key-12345
FFMPEG_PATH=
FFPROBE_PATH=
```

**Usage in code:**
```typescript
// backend/src/config/index.ts
export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // ...
}
```

## Gitignore Configuration

### Root .gitignore

```gitignore
# Environment files
.env
.env.production
.env*.local

# Build output
node_modules
dist
dist-ssr
*.local
```

**Status:** ✅ Correctly configured

### Backend .gitignore

```gitignore
# Environment
.env
.env.local
.env.production

# Streams (generated files)
streams/
*.m3u8
*.ts

# Build output
dist/
node_modules/
```

**Status:** ✅ Correctly configured

## Production Environment Variables

### Vercel (Frontend)

Set these in Vercel dashboard:

```env
VITE_API_URL=https://your-app.railway.app
VITE_API_KEY=your-secure-api-key-here
```

### Railway (Backend)

Set these in Railway dashboard:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-app.vercel.app
MAX_STREAMS=10
API_KEY=your-secure-api-key-here
```

**Important:** Use the same `API_KEY` for both!

## Security Checklist

- [x] `.env` files are in `.gitignore`
- [x] `.env.example` files don't contain secrets
- [x] Production uses different API keys
- [x] HTTPS enabled in production
- [x] CORS configured correctly
- [x] API key authentication enabled
- [x] Rate limiting enabled

## Verification Steps

### 1. Check Gitignore

```bash
# These should NOT be tracked by git:
git status | grep .env
# Should return nothing

# These SHOULD be tracked:
git ls-files | grep .env.example
# Should show .env.example files
```

### 2. Check Environment Variables

**Local Development:**
```bash
# Frontend
cat .env
# Should show VITE_API_URL and VITE_API_KEY

# Backend
cat backend/.env
# Should show PORT, NODE_ENV, etc.
```

**Production:**
- Vercel: Settings → Environment Variables
- Railway: Settings → Variables

### 3. Test Configuration

**Frontend:**
```bash
npm run dev
# Check console for: "🔧 Config loaded: { API_URL: 'http://localhost:3000' }"
```

**Backend:**
```bash
cd backend
npm run dev
# Check console for server startup message
```

## Common Issues

### Issue: Environment variables not loading

**Solution:**
```bash
# Restart dev server after changing .env
# Vercel: Redeploy after adding variables
# Railway: Redeploy after adding variables
```

### Issue: .env file tracked by git

**Solution:**
```bash
# Remove from git
git rm --cached .env
git rm --cached backend/.env

# Commit
git commit -m "Remove .env files from git"
```

### Issue: CORS errors in production

**Solution:**
```bash
# Verify FRONTEND_URL in Railway matches Vercel URL
# Check Railway logs for CORS errors
```

## File Structure

```
project/
├── .env                          # ✅ Gitignored
├── .env.example                  # ✅ Tracked
├── .env.production               # ✅ Gitignored
├── .gitignore                    # ✅ Tracked
├── vercel.json                   # ✅ Tracked
├── src/
│   └── config.ts                 # ✅ Tracked
└── backend/
    ├── .env                      # ✅ Gitignored
    ├── .env.example              # ✅ Tracked
    ├── .gitignore                # ✅ Tracked
    ├── nixpacks.toml             # ✅ Tracked
    └── railway.json              # ✅ Tracked
```

## Environment Variable Flow

### Development

```
.env → src/config.ts → App.tsx
backend/.env → backend/src/config/index.ts → server.ts
```

### Production

```
Vercel Environment Variables → Build → src/config.ts → App.tsx
Railway Environment Variables → Build → backend/src/config/index.ts → server.ts
```

## Best Practices

1. **Never commit `.env` files**
2. **Always update `.env.example` when adding new variables**
3. **Use different API keys for development and production**
4. **Document all environment variables**
5. **Test locally before deploying**
6. **Keep secrets in environment variables, not in code**

## Quick Reference

### Add New Environment Variable

1. **Add to `.env`:**
   ```env
   NEW_VARIABLE=value
   ```

2. **Add to `.env.example`:**
   ```env
   NEW_VARIABLE=example-value
   ```

3. **Use in code:**
   ```typescript
   const newVar = import.meta.env.VITE_NEW_VARIABLE
   ```

4. **Add to production:**
   - Vercel: Settings → Environment Variables
   - Railway: Settings → Variables

5. **Redeploy**

## ✅ All Set!

Your environment is correctly configured:

- ✅ All `.env` files are gitignored
- ✅ Example files are tracked
- ✅ Configuration files are in place
- ✅ Security best practices followed
- ✅ Ready for deployment

**You're good to go!** 🚀
