# 🚀 Production Deployment Guide - Hostinger

## ✅ **Production Database Configuration**

---

## 🎯 **Environment Variables for Production**

When deployed on **Hostinger**, use:

```env
# Production .env file on Hostinger server
DATABASE_URL="mysql://u449309789_hellomadurai25:8YOm%3Fywb%7C@localhost:3306/u449309789_hello_madurai"
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hellomadurai.com
```

**Why localhost?** 
- Your Next.js app runs on Hostinger server
- MySQL database is on the same Hostinger server
- They can communicate via `localhost` (internal network)
- No remote connection needed! ✅

---

## 📂 **Deployment Methods**

### **Method 1: Git Deployment (Recommended)**

**Step 1: Push to GitHub/GitLab**

```bash
# In your local project
git add .
git commit -m "Ready for production"
git push origin main
```

**Step 2: Connect Repository in Hostinger**

1. Login to Hostinger hPanel
2. Go to your website dashboard
3. Look for: "Git" or "GitHub" or "Deploy"
4. Connect your repository
5. Set branch: `main` or `master`
6. Set build command: `npm run build`
7. Set start command: `npm start`

**Step 3: Set Environment Variables in Hostinger**

In Hostinger deployment settings, add:
```
DATABASE_URL=mysql://u449309789_hellomadurai25:8YOm%3Fywb%7C@localhost:3306/u449309789_hello_madurai
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hellomadurai.com
```

**Step 4: Deploy**

Click "Deploy" - Hostinger will:
- Clone your repository
- Run `npm install`
- Run `npm run build`
- Start your app

---

### **Method 2: FTP/File Manager Upload**

**Step 1: Build Your App Locally**

```bash
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app

# Install dependencies
npm install

# Build for production
npm run build
```

**Step 2: Upload Files via FTP**

Upload these files/folders to your Hostinger domain folder:
```
✅ .next/              (build output)
✅ public/             (static files)
✅ node_modules/       (or run npm install on server)
✅ package.json
✅ package-lock.json
✅ prisma/             (database schema)
✅ next.config.ts
✅ .env.production     (rename to .env on server)
```

**Step 3: SSH into Hostinger**

```bash
ssh your_username@your-server.hostinger.com
```

**Step 4: Setup on Server**

```bash
# Navigate to your site folder
cd public_html/your-site

# Install dependencies (if not uploaded)
npm install

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Start the app
npm start
# or
node server.js
```

---

### **Method 3: Node.js App Manager (If Available)**

Some Hostinger plans have Node.js App Manager:

1. Go to: Hostinger hPanel → Node.js
2. Click "Create Application"
3. Fill in:
   - **Application Root**: `/public_html/your-app`
   - **Application URL**: `https://hellomadurai.com`
   - **Application Startup File**: `server.js` or `npm start`
   - **Node.js Version**: 18.x or 20.x
4. Set Environment Variables (same as above)
5. Click "Create"

---

## 🔧 **Database Setup on Production**

After deploying, run migrations:

```bash
# SSH into Hostinger
ssh your_username@your-server.hostinger.com

# Go to your app directory
cd public_html/your-site

# Create database tables
npx prisma generate
npx prisma db push

# Verify
npx prisma studio
```

---

## 📋 **Production Checklist**

### **Before Deployment:**

- [ ] Build succeeds locally (`npm run build`)
- [ ] All features tested locally
- [ ] Database schema finalized
- [ ] Environment variables prepared
- [ ] Domain configured in Hostinger

### **During Deployment:**

- [ ] Upload all files to Hostinger
- [ ] Set environment variables
- [ ] Run `npm install` on server
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Start the application

### **After Deployment:**

- [ ] Website loads at https://hellomadurai.com
- [ ] Database connection works
- [ ] Can create news articles
- [ ] Images upload successfully
- [ ] Comments work
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] SSL certificate active

---

## 🔐 **Security Best Practices**

### **1. Environment Variables**

**NEVER commit `.env` files to Git!**

Your `.gitignore` already includes:
```
.env
.env.local
.env.production
.env*.local
```

### **2. Use Strong Passwords**

Your MySQL password is already strong: `8YOm?ywb|` ✅

### **3. Enable HTTPS**

Hostinger provides free SSL. Make sure it's enabled:
- Go to: Hostinger hPanel → SSL
- Enable SSL for hellomadurai.com

### **4. Secure File Permissions**

On server, set proper permissions:
```bash
chmod 600 .env
chmod 755 public/
chmod 644 *.js *.json *.ts
```

---

## 🌐 **Domain Configuration**

### **If using hellomadurai.com:**

**DNS Settings (in Hostinger):**
```
Type: A Record
Host: @
Points to: [Your Hostinger server IP]

Type: A Record  
Host: www
Points to: [Your Hostinger server IP]
```

**Verify:** https://hellomadurai.com should load your site

---

## 🐛 **Production Troubleshooting**

### **Issue: "Cannot connect to database"**

**Solution:**
1. SSH into server
2. Check `.env` file exists with correct DATABASE_URL
3. Verify password encoding: `8YOm%3Fywb%7C`
4. Test connection: `npx prisma db push`

### **Issue: "Module not found"**

**Solution:**
1. SSH into server
2. Run `npm install`
3. Run `npx prisma generate`
4. Restart app

### **Issue: "502 Bad Gateway"**

**Solution:**
1. Check if Node.js is running: `ps aux | grep node`
2. Check logs: `npm run dev` (see errors)
3. Restart app: `pm2 restart all` (if using PM2)

### **Issue: Images not uploading**

**Solution:**
1. Check folder permissions: `chmod 755 public/uploads`
2. Create folder if missing: `mkdir -p public/uploads/news-images`
3. Check disk space: `df -h`

---

## 📊 **Production vs Development**

| Setting | Development (Local) | Production (Hostinger) |
|---------|-------------------|----------------------|
| **Host** | 127.0.0.1 or remote | `localhost` |
| **Connection** | May fail (remote) | ✅ Works (same server) |
| **URL** | http://localhost:3000 | https://hellomadurai.com |
| **Database** | Can use SQLite | Use MySQL |
| **NODE_ENV** | development | production |
| **Build** | npm run dev | npm run build + npm start |

---

## 🚀 **Quick Deployment Commands**

**On Your Local Computer:**
```bash
# Build and test
npm run build
npm start

# Commit and push
git add .
git commit -m "Production ready"
git push origin main
```

**On Hostinger Server (via SSH):**
```bash
# Clone (if using Git)
git clone your-repo-url
cd your-app

# Or upload via FTP and navigate
cd public_html/your-site

# Setup
npm install
npx prisma generate
npx prisma db push

# Start
npm start
# or
pm2 start npm --name "hellomadurai" -- start
```

---

## 🎉 **After Successful Deployment**

Your website will be live at:
- ✅ https://hellomadurai.com
- ✅ Connected to Hostinger MySQL
- ✅ All features working
- ✅ SSL enabled
- ✅ Production ready!

---

## 📞 **Need Help?**

**Hostinger Support:**
- 24/7 Live Chat in hPanel
- Knowledge Base: https://support.hostinger.com
- Email: support@hostinger.com

**Common Questions to Ask:**
1. "How do I deploy a Next.js app on my hosting?"
2. "Where do I set environment variables?"
3. "How do I connect my GitHub repository?"
4. "What's the best way to run Node.js on your servers?"

---

## ✅ **Production Database URL - Final Answer**

```env
DATABASE_URL="mysql://u449309789_hellomadurai25:8YOm%3Fywb%7C@localhost:3306/u449309789_hello_madurai"
```

**This works in production because:**
- ✅ App runs ON Hostinger server
- ✅ MySQL runs ON same Hostinger server
- ✅ `localhost` = internal connection (fast & secure)
- ✅ No remote connection issues!

---

**Ready to deploy? Let me know if you need help with any deployment step!** 🚀

