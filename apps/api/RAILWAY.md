# Railway Deployment Guide for Node.js (Express) + Prisma + Supabase

This guide assumes you have a **Railway account**, a **GitHub repository** for this project, and a **Supabase project**.

## Prerequisites
1. **GitHub Repo**: Ensure this project is pushed to GitHub.
2. **Supabase**: Have your Supabase project ready and get the `DATABASE_URL` and `DIRECT_URL`.

## Step 1: Create a Service on Railway
1. Go to your [Railway Dashboard](https://railway.app/).
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. If asked, choose **"Monorepo"** settings:
    - **Root Directory**: `apps/api`
    - It's important to set the root directory so Railway knows where the backend lives.

## Step 2: Configure Environment Variables
In your Railway project settings, go to the **Variables** tab and add the following (copy from your `.env`):

| Variable | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `3000` (Railway provides this automatically, but good to have fallback) |
| `DATABASE_URL` | Your Supabase Transaction Pooler URL (usually port 6543) |
| `DIRECT_URL` | Your Supabase Direct Connection URL (usually port 5432) |
| `JWT_SECRET` | A strong random string for JWT signing |
| `JWT_EXPIRES_IN` | e.g. `24h` |
| `OFFICE_LAT` | e.g. `-7.682067` |
| `OFFICE_LNG` | e.g. `110.357559` |
| `MAX_DISTANCE_KM` | e.g. `2.0` |
| `UPLOAD_DIR` | `/app/uploads` (for persistent storage, see Note below) |

> **Note on File Uploads**: Railway file system is ephemeral. Uploaded files will be lost on redeploy. for production, consider using a storage service like Supabase Storage, AWS S3, or Cloudinary.

## Step 3: Configure Build & Start Commands
Go to **Settings** -> **Build & Deploy** section.

- **Build Command**: `prisma generate`
    - *Why?* This ensures the Prisma Client is generated for the linux environment Railway uses.
- **Start Command**: `node src/app.js`
    - *Why?* This launches your Express server.
- **Watch Paths** (Optional): `/apps/api/**`

## Step 4: Deploy
1. Once variables are set, Railway might automatically trigger a deploy. If not, go to **Deployments** and click **Redeploy**.
2. Watch the **Build Logs** to ensure `prisma generate` runs successfully.
3. Watch the **Deploy Logs** to see "🚀 Server running on port...".

## Step 5: Database Migration (Important)
You need to apply your schema to the production database. You have two options:

**Option A: Run locally (Easiest)**
From your local machine, run:
```bash
npx dotenv -e .env.production -- prisma migrate deploy
```
(Make sure you have a `.env.production` with your PROD database credentials, or just temporarily replace your `.env` credentials).

**Option B: Add to Build Command (Automated)**
Change the **Build Command** in Railway to:
```bash
prisma generate && prisma migrate deploy
```
*Caution*: This runs migrations on every deploy. Ensure your migrations are safe.

## Troubleshooting
- **"Prepared statement already exists" Error**:
    - This happens when using Supabase's **Transaction Pooler** (port 6543).
    - **Fix**: Append `?pgbouncer=true` to your `DATABASE_URL` in Railway Variables.
    - Example: `postgres://...:6543/postgres?pgbouncer=true`
- **"No workspaces found" Error**: 
    - This happens if your **Start Command** tries to use `--workspace` (e.g., `npm run start --workspace=...`) but you have set your **Root Directory** to `apps/api`.
    - **Fix**: Change **Start Command** to `npm start` (or `node src/app.js`).
- **"Client is not generated"**: 
    - You **MUST** run `prisma generate` in your Build Command.
    - **Clarification**: `prisma generate` **does NOT** touch your database or delete data. It only creates the JavaScript files needed for your code to talk to the database. If you skip this, your app will crash with `Error: @prisma/client did not initialize yet`.
- **Connection Refused**: Ensure `app.listen` uses `process.env.PORT`.

