# Deployment Guide — Railway

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Team Task Manager"
git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
git push -u origin main
```

## Step 2: Deploy Backend on Railway

1. Go to https://railway.app and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Click **Add Service** → choose the repo again → set **Root Directory** to `backend`
5. Click **Add Plugin** → choose **MongoDB** (Railway provisions it automatically)
6. Go to your backend service → **Variables** tab → add:
   - `MONGODB_URI` → click "Insert Reference" → select MongoDB `MONGO_URL`
   - `JWT_SECRET` → any long random string (e.g. `mysupersecretkey12345`)
   - `NODE_ENV` → `production`
   - `PORT` → `5000`
7. Railway will auto-deploy. Copy the generated URL (e.g. `https://backend-xxx.railway.app`)

## Step 3: Deploy Frontend on Railway (or Vercel)

### Option A — Railway (same project)

1. In same Railway project → **New Service** → GitHub repo
2. Set **Root Directory** to `frontend`
3. Add Variable:
   - `REACT_APP_API_URL` → `https://YOUR_BACKEND_URL.railway.app/api`
4. Set **Build Command**: `npm run build`
5. Set **Start Command**: `npx serve -s build -l 3000`
6. Deploy and copy the frontend URL

### Option B — Vercel (recommended)

1. Go to https://vercel.com → **Import Git Repository**
2. Select your repo → set **Root Directory** to `frontend`
3. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://YOUR_BACKEND_URL.railway.app/api`
4. Click **Deploy**
5. Copy the Vercel URL

## Step 4: Update CORS

In Railway backend Variables, add:
- `CLIENT_URL` → your frontend URL (Vercel or Railway)

Redeploy backend (Railway auto-redeploys on variable change).

## Done! ✅

Your app is live. Use the frontend URL as your **Live Application URL** in the submission form.
