# Vercel Deployment Guide for Frontend (Vite + React)

This guide helps you deploy the `apps/web` application to Vercel.

## Prerequisites
1. **GitHub Repo**: Ensure your latest changes are pushed to GitHub.
2. **Railway Backend**: Ensure your backend is running and you have its public URL.

## Step 1: Create a New Project on Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/).
2. Click **"Add New"** -> **"Project"**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
    - **Framework Preset**: Vite (should be auto-detected).
    - **Root Directory**: Click "Edit" and select **`apps/web`**.
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `dist` (default).

## Step 2: Configure Environment Variables
Expand the **Environment Variables** section and add:

| Variable | Value |
| :--- | :--- |
| **`VITE_API_URL`** | `https://your-railway-url.up.railway.app/api` |

> [!IMPORTANT]
> Make sure the URL ends with `/api` and has **no trailing slash** at the very end.

## Step 3: Deploy
1. Click **"Deploy"**.
2. Once finished, Vercel will provide a production URL (e.g., `https://presensi-trimulyo.vercel.app`).

## Step 4: Final Backend Security Check (CORS)
Now that your frontend has a real URL, you should update your Backend to allow it.

1. Go to your Railway **Variables**.
2. Update `CORS_ORIGINS` or update the code in `apps/api/src/app.js`:
   ```javascript
   origin: [
       'http://localhost:5173',
       'https://your-frontend.vercel.app' // Add your new Vercel URL here
   ]
   ```
   *(Currently, we set it to `*` or a list; make sure your Vercel URL is permitted).*

## Troubleshooting
- **White Screen on Load**: Check the Browser Console (F12). If you see `404` for files, ensure the "Root Directory" was set to `apps/web`.
- **API Errors**: Ensure `VITE_API_URL` is set correctly in Vercel **and** that you pushed the `api.js` change that uses `import.meta.env.VITE_API_URL`.
- **PWA Issues**: Vercel handles HTTPS by default, which is required for PWA features to work.
