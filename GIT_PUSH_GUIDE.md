# 🚀 Git Push Guide

## Step-by-Step Instructions

### 1. Initialize Git (if not already done)

Open **Git Bash** or **Command Prompt** in your project folder and run:

```bash
# Check if git is initialized
git status

# If not initialized, run:
git init
```

### 2. Add Remote Repository

```bash
# Add your GitHub repository
git remote add origin git@github.com:BhaweshB/stream.git

# Or if using HTTPS:
git remote add origin https://github.com/BhaweshB/stream.git

# Verify remote
git remote -v
```

### 3. Check Current Status

```bash
git status
```

You should see all your new files listed.

### 4. Add All Files

```bash
# Add all files
git add .

# Verify what will be committed
git status
```

**Important:** Make sure `.env` files are NOT listed (they should be gitignored)

### 5. Commit Changes

```bash
git commit -m "Initial commit: Real-time streaming platform with low-latency support"
```

### 6. Push to GitHub

```bash
# Push to main branch
git push -u origin main

# Or if your default branch is master:
git push -u origin master
```

### 7. Verify on GitHub

Go to: https://github.com/BhaweshB/stream

You should see all your files!

## Using SSH (Recommended)

### Setup SSH Key (One-time)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

### Add SSH Key to GitHub

1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste your public key
4. Save

### Use SSH Remote

```bash
# Remove HTTPS remote (if exists)
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:BhaweshB/stream.git

# Push
git push -u origin main
```

## Troubleshooting

### Issue: "fatal: not a git repository"

```bash
git init
git remote add origin git@github.com:BhaweshB/stream.git
```

### Issue: "remote origin already exists"

```bash
git remote remove origin
git remote add origin git@github.com:BhaweshB/stream.git
```

### Issue: "Permission denied (publickey)"

```bash
# Use HTTPS instead
git remote set-url origin https://github.com/BhaweshB/stream.git
```

### Issue: ".env files are being tracked"

```bash
# Remove from git
git rm --cached .env
git rm --cached backend/.env
git rm --cached .env.production

# Commit
git commit -m "Remove .env files from git"
```

## Verify Before Pushing

### Check Gitignore

```bash
# These should NOT appear in git status:
# - .env
# - backend/.env
# - .env.production
# - node_modules/
# - dist/

git status
```

### Check What Will Be Pushed

```bash
# See all files that will be pushed
git ls-files
```

## Quick Commands Reference

```bash
# Status
git status

# Add all
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main

# View remotes
git remote -v

# View branches
git branch -a
```

## After Successful Push

### Next Steps:

1. ✅ **Verify on GitHub:** https://github.com/BhaweshB/stream
2. ✅ **Deploy Backend:** Follow `DEPLOY_CHECKLIST.md` for Railway
3. ✅ **Deploy Frontend:** Follow `DEPLOY_CHECKLIST.md` for Vercel

## Files That Should Be Pushed

✅ **Source Code:**
- `src/` folder
- `backend/src/` folder
- `public/` folder

✅ **Configuration:**
- `package.json`
- `backend/package.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.js`

✅ **Deployment:**
- `vercel.json`
- `backend/nixpacks.toml`
- `backend/railway.json`

✅ **Documentation:**
- `README.md`
- `DEPLOYMENT.md`
- `DEPLOY_CHECKLIST.md`
- All other `.md` files

✅ **Templates:**
- `.env.example`
- `backend/.env.example`

✅ **Gitignore:**
- `.gitignore`
- `backend/.gitignore`

## Files That Should NOT Be Pushed

❌ **Sensitive:**
- `.env`
- `backend/.env`
- `.env.production`

❌ **Generated:**
- `node_modules/`
- `dist/`
- `backend/dist/`
- `backend/streams/`

❌ **IDE:**
- `.vscode/` (except extensions.json)
- `.idea/`

## Success!

Once pushed, your repository will be ready for deployment! 🎉

Go to:
- **GitHub:** https://github.com/BhaweshB/stream
- **Deploy:** Follow `DEPLOY_CHECKLIST.md`
