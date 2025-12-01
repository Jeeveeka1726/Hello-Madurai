# 🚀 Hybrid Setup Guide - Hello Madurai

This guide explains how to set up the **hybrid architecture** where:
- **Next.js app** runs on **Vercel** (fast, global CDN, auto-deploy)
- **Upload API** runs on **Hostinger** (handles large file uploads 100MB+)

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Browse Website (Fast Global CDN)       │
        │  ↓                                       │
        │  VERCEL (Next.js App)                   │
        │  - Public pages                         │
        │  - Admin panel UI                       │
        │  - API routes (except uploads)          │
        └─────────────────────────────────────────┘
                              │
                              │ (reads data)
                              ▼
        ┌─────────────────────────────────────────┐
        │  HOSTINGER MySQL DATABASE               │
        │  - All data stored here                 │
        │  - Audio files (binary)                 │
        │  - Images (binary)                      │
        │  - Metadata                             │
        └─────────────────────────────────────────┘
                              ▲
                              │ (writes large files)
                              │
        ┌─────────────────────────────────────────┐
        │  Upload Large Files (100MB+)            │
        │  ↓                                       │
        │  HOSTINGER (Upload API)                 │
        │  - Node.js/Express API                  │
        │  - Handles audio uploads                │
        │  - No file size limits                  │
        └─────────────────────────────────────────┘
```

---

## 🎯 Part 1: Local Development Setup

### Step 1: Set Up Upload API Locally

```bash
# Navigate to upload API folder
cd Hello-Madurai/hostinger-upload-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://u449309789_hellomadurai25:HelloMadurai123@srv1990.hstgr.io:3306/u449309789_hello_madurai"
PORT=3001
ALLOWED_ORIGINS="http://localhost:3000,https://your-app.vercel.app"
```

Generate Prisma client:
```bash
npx prisma generate
```

Start the upload API:
```bash
npm run dev
```

✅ Upload API should now be running on `http://localhost:3001`

### Step 2: Configure Next.js App

Your `.env.local` should already have:
```env
NEXT_PUBLIC_UPLOAD_API_URL=http://localhost:3001
```

### Step 3: Test Locally

1. Start Next.js app:
   ```bash
   cd Hello-Madurai/hello-madurai-app
   npm run dev
   ```

2. Open `http://localhost:3000/admin/radio-music`

3. Try uploading an audio file (up to 100MB)

4. Check upload API logs - you should see:
   ```
   📥 Uploading audio: song.mp3 (45.23MB)
   ✅ Audio uploaded successfully: clxxx...
   ```

---

## 🌐 Part 2: Production Deployment

### Step 1: Deploy Next.js to Vercel (Already Done!)

Your Next.js app is already on Vercel. Just add the environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   Name: NEXT_PUBLIC_UPLOAD_API_URL
   Value: https://api.yourdomain.com (or http://your-hostinger-ip:3001)
   ```
3. Redeploy

### Step 2: Deploy Upload API to Hostinger

#### Option A: Using cPanel File Manager (Easiest)

1. **Zip the upload API folder:**
   ```bash
   cd Hello-Madurai
   zip -r hostinger-upload-api.zip hostinger-upload-api/
   ```

2. **Upload via cPanel:**
   - Login to Hostinger cPanel
   - Go to File Manager
   - Navigate to `/home/u449309789/` (or your home directory)
   - Upload `hostinger-upload-api.zip`
   - Extract it

3. **SSH into Hostinger and install:**
   ```bash
   ssh u449309789@srv1990.hstgr.io
   cd hostinger-upload-api
   npm install --production
   ```

4. **Create .env file:**
   ```bash
   nano .env
   ```
   
   Add:
   ```env
   DATABASE_URL="mysql://u449309789_hellomadurai25:HelloMadurai123@localhost:3306/u449309789_hello_madurai"
   PORT=3001
   ALLOWED_ORIGINS="https://your-app.vercel.app"
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

6. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name hello-madurai-upload-api
   pm2 save
   pm2 startup
   ```

#### Option B: Using Git (Recommended)

1. **Push to GitHub:**
   ```bash
   cd Hello-Madurai
   git add hostinger-upload-api/
   git commit -m "Add Hostinger upload API"
   git push
   ```

2. **Clone on Hostinger:**
   ```bash
   ssh u449309789@srv1990.hstgr.io
   git clone https://github.com/yourusername/Hello-Madurai.git
   cd Hello-Madurai/hostinger-upload-api
   npm install --production
   ```

3. **Follow steps 4-6 from Option A**

---

## 🔧 Part 3: Configure Reverse Proxy (Optional but Recommended)

If you want to use a subdomain like `api.hellomadurai.com` instead of IP:port:

### Using Hostinger cPanel

1. Go to cPanel → Domains → Subdomains
2. Create subdomain: `api.hellomadurai.com`
3. Go to cPanel → Advanced → Apache Configuration (or contact support)
4. Add reverse proxy configuration

---

## ✅ Part 4: Testing Production Setup

1. **Test Upload API health:**
   ```bash
   curl https://api.yourdomain.com/health
   # or
   curl http://your-hostinger-ip:3001/health
   ```

   Should return:
   ```json
   {"status":"ok","message":"Upload API is running"}
   ```

2. **Test file upload:**
   - Go to your Vercel app: `https://your-app.vercel.app/admin/radio-music`
   - Upload an audio file
   - Check it works!

---

## 📊 Monitoring

### Check Upload API Status

```bash
ssh u449309789@srv1990.hstgr.io
pm2 status
pm2 logs hello-madurai-upload-api
```

### Restart Upload API

```bash
pm2 restart hello-madurai-upload-api
```

### Stop Upload API

```bash
pm2 stop hello-madurai-upload-api
```

---

## 🎉 Benefits of This Setup

✅ **Fast website** - Vercel's global CDN  
✅ **No upload limits** - Hostinger handles large files  
✅ **Easy deployments** - Vercel auto-deploys from GitHub  
✅ **Cost effective** - Use what you already have  
✅ **Scalable** - Best of both worlds  

---

## 🆘 Troubleshooting

### CORS Errors
- Make sure `ALLOWED_ORIGINS` in Hostinger `.env` includes your Vercel domain
- Check browser console for exact error

### Upload API Not Reachable
- Check if PM2 is running: `pm2 status`
- Check firewall: Port 3001 should be open
- Check logs: `pm2 logs hello-madurai-upload-api`

### Database Connection Errors
- On Hostinger, use `localhost` instead of `srv1990.hstgr.io` in DATABASE_URL
- Check credentials are correct

---

## 📝 Summary

**Local Development:**
- Upload API: `http://localhost:3001`
- Next.js App: `http://localhost:3000`

**Production:**
- Upload API: `https://api.yourdomain.com` (or `http://ip:3001`)
- Next.js App: `https://your-app.vercel.app`

**Both connect to:** Hostinger MySQL Database

