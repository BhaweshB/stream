# 🖥️ GitHub Desktop Push Guide

## Step-by-Step Instructions

### 1. Open GitHub Desktop

Make sure you're logged in to your GitHub account.

### 2. Add Repository

**Option A: If this is a new repository**
1. Click **File** → **Add Local Repository**
2. Browse to your project folder: `C:\Users\Bhawesh\Desktop\ui`
3. Click **Add Repository**

**Option B: If git is not initialized**
1. Click **File** → **Create Repository**
2. Browse to your project folder
3. Click **Create Repository**

### 3. Check Changes

You should see all your files listed in the "Changes" tab on the left.

**Important:** Verify that `.env` files are NOT listed:
- ❌ `.env` should NOT appear
- ❌ `backend/.env` should NOT appear
- ❌ `.env.production` should NOT appear
- ✅ `.env.example` SHOULD appear
- ✅ `backend/.env.example` SHOULD appear

If `.env` files appear, they're not being ignored properly.

### 4. Review Files

Look through the changes and make sure:
- ✅ All source code files are included
- ✅ Configuration files are included
- ✅ Documentation files are included
- ❌ No sensitive files (`.env`, `node_modules`, etc.)

### 5. Commit Changes

1. In the bottom left, enter commit message:
   ```
   Initial commit: Real-time streaming platform
   ```

2. Add description (optional):
   ```
   - Low-latency streaming (2-3s)
   - RTSP/HTTP/HTTPS support
   - Auto-cleanup on disconnect
   - Ready for Vercel + Railway deployment
   ```

3. Click **Commit to main** (or **Commit to master**)

### 6. Publish Repository

1. Click **Publish repository** button at the top
2. Repository name: `stream`
3. Description: `Real-time video streaming platform with low-latency support`
4. ✅ Keep code private (or uncheck for public)
5. Click **Publish repository**

### 7. Verify on GitHub

1. Click **View on GitHub** button
2. Or go to: https://github.com/BhaweshB/stream
3. Verify all files are there

## Alternative: Push to Existing Repository

If the repository already exists on GitHub:

### 1. Add Remote

1. Click **Repository** → **Repository Settings**
2. Click **Remote** tab
3. Click **Add**
4. Name: `origin`
5. URL: `https://github.com/BhaweshB/stream.git`
6. Click **Save**

### 2. Push

1. Click **Push origin** button at the top
2. Wait for upload to complete
3. Click **View on GitHub** to verify

## Troubleshooting

### Issue: .env files are showing in changes

**Solution:**
1. Right-click on `.env` file
2. Select **Ignore file**
3. Repeat for all `.env` files
4. Commit the `.gitignore` changes

### Issue: "Repository not found"

**Solution:**
1. Make sure you're logged in to GitHub Desktop
2. Check repository name is correct: `stream`
3. Verify you have access to the repository

### Issue: Too many files (node_modules showing)

**Solution:**
1. Make sure `.gitignore` is in the root folder
2. Right-click on `node_modules` folder
3. Select **Ignore file**
4. Commit the `.gitignore` changes

### Issue: "Failed to publish"

**Solution:**
1. Check your internet connection
2. Make sure you're logged in to GitHub Desktop
3. Try **Repository** → **Push** instead

## What Should Be Pushed

### ✅ Should See These Files:

**Source Code:**
- `src/` folder (all files)
- `backend/src/` folder (all files)
- `public/` folder

**Configuration:**
- `package.json`
- `backend/package.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.js`
- `vercel.json`
- `backend/nixpacks.toml`
- `backend/railway.json`

**Documentation:**
- `README.md`
- `DEPLOYMENT.md`
- `DEPLOY_CHECKLIST.md`
- All other `.md` files

**Templates:**
- `.env.example`
- `backend/.env.example`

**Gitignore:**
- `.gitignore`
- `backend/.gitignore`

### ❌ Should NOT See These:

**Sensitive:**
- `.env`
- `backend/.env`
- `.env.production`

**Generated:**
- `node_modules/`
- `dist/`
- `backend/dist/`
- `backend/streams/`

**IDE:**
- `.vscode/` (except extensions.json)
- `.idea/`

## After Successful Push

### ✅ Verify on GitHub

1. Go to: https://github.com/BhaweshB/stream
2. Check all files are there
3. Check `.env` files are NOT there

### 🚀 Next Steps: Deploy

1. **Deploy Backend to Railway:**
   - See `DEPLOY_CHECKLIST.md`
   - Section: "Deploy Backend to Railway"

2. **Deploy Frontend to Vercel:**
   - See `DEPLOY_CHECKLIST.md`
   - Section: "Deploy Frontend to Vercel"

## Quick Reference

### Common Actions in GitHub Desktop

| Action | How To |
|--------|--------|
| **View changes** | Click "Changes" tab |
| **Commit** | Enter message → Click "Commit to main" |
| **Push** | Click "Push origin" button |
| **Pull** | Click "Fetch origin" → "Pull origin" |
| **View on GitHub** | Click "View on GitHub" button |
| **Undo commit** | Right-click commit → "Revert commit" |

## Success! 🎉

Once you see your files on GitHub, you're ready to deploy!

**Next:** Follow `DEPLOY_CHECKLIST.md` to deploy to Vercel and Railway.

---

**Repository:** https://github.com/BhaweshB/stream  
**Status:** Ready for deployment! 🚀
