# 🚀 Deploy Hello Madurai to Hostinger - Complete Guide

## ✅ **Your Setup:**

- **Domain:** hellomadurai.com
- **Hosting:** Hostinger Premium
- **Database:** Hostinger MySQL (already configured!)
- **Goal:** Deploy Next.js app to hellomadurai.com

---

## 📋 **Step-by-Step Deployment:**

### **Step 1: Build Your Application**

First, let's build the production version:

```bash
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app

# Build for production
npm run build

# This creates an optimized .next folder
```

---

### **Step 2: Check if Hostinger Supports Node.js**

**Important:** Hostinger needs to have **Node.js hosting** enabled.

1. Go to Hostinger hPanel
2. Look for **"Websites"** → **hellomadurai.com**
3. Check if you see options like:
   - "Node.js"
   - "Application Manager"
   - "Node.js Version"

**Do you see Node.js options?**
- ✅ **YES** → Great! Continue to Step 3
- ❌ **NO** → You may need to upgrade your plan or use Option B below

---

### **Step 3: Upload Files to Hostinger**

#### **Option A: Using File Manager (Easier)**

1. **Login to Hostinger hPanel**
2. Go to **"Files"** → **"File Manager"**
3. **Navigate to your website root** (usually `public_html` or `domains/hellomadurai.com/public_html`)
4. **Delete** everything in the folder (or create a subfolder like `app`)
5. **Upload these files/folders:**

**Essential Files to Upload:**
```
✅ .next/              (entire folder - after build)
✅ node_modules/       (entire folder)
✅ public/             (entire folder)
✅ src/                (entire folder)
✅ prisma/             (entire folder)
✅ package.json
✅ package-lock.json
✅ next.config.ts
✅ tsconfig.json
✅ tailwind.config.js
✅ postcss.config.mjs
```

**DON'T Upload:**
```
❌ .git/
❌ .env.local (we'll create .env on server)
❌ node_modules/.cache/
❌ README files
```

#### **Option B: Using FTP (FileZilla)**

1. **Get FTP Credentials from Hostinger:**
   - Go to hPanel → Files → FTP Accounts
   - Note: Hostname, Username, Password

2. **Connect with FileZilla:**
   - Host: ftp.hellomadurai.com (or from Hostinger)
   - Username: your FTP username
   - Password: your FTP password
   - Port: 21

3. **Upload all files** (same as Option A list)

---

### **Step 4: Create `.env` File on Server**

**IMPORTANT:** Don't upload `.env.local`! Create `.env` directly on the server.

1. In Hostinger File Manager, go to your app folder
2. Click **"New File"** → Name it `.env`
3. **Paste this content:**

```bash
# Production Environment Variables for Hostinger
DATABASE_URL="mysql://u449309789_hellomadurai25:HelloMadurai123@localhost:3306/u449309789_hello_madurai?connection_limit=10&pool_timeout=20"

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hellomadurai.com
```

**Note:** We use `localhost` because MySQL is on the same server!

---

### **Step 5: Install Dependencies on Hostinger**

#### **Using Hostinger Terminal (if available):**

1. Go to **Hostinger hPanel**
2. Look for **"Terminal"** or **"SSH Access"**
3. If available, run:

```bash
cd ~/domains/hellomadurai.com/public_html
# Or wherever you uploaded files

npm install
npx prisma generate
```

#### **If NO Terminal Access:**

You need to upload `node_modules` from your computer:
```bash
# On your Mac, zip node_modules
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app
zip -r node_modules.zip node_modules/

# Upload node_modules.zip to Hostinger
# Extract it in File Manager
```

---

### **Step 6: Set Up Node.js Application**

#### **In Hostinger hPanel:**

1. Go to **"Websites"** → **hellomadurai.com**
2. Look for **"Node.js"** or **"Application Manager"**
3. Click **"Create Application"** or **"Add Application"**
4. **Fill in:**
   - **Application Root:** `/domains/hellomadurai.com/public_html` (or your path)
   - **Application URL:** `hellomadurai.com`
   - **Application Startup File:** `server.js` or `next start`
   - **Node.js Version:** Choose latest (18 or 20)

5. **Environment Variables** (if there's a section for this):
   Add these:
   ```
   DATABASE_URL=mysql://u449309789_hellomadurai25:HelloMadurai123@localhost:3306/u449309789_hello_madurai
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://hellomadurai.com
   ```

---

### **Step 7: Create Startup Script (if needed)**

If Hostinger asks for a startup file, create `server.js`:

1. In File Manager, create **`server.js`** in your app root
2. **Paste this:**

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

---

### **Step 8: Start the Application**

#### **In Hostinger Node.js Manager:**

1. Click **"Start Application"** or **"Run"**
2. The app should start on the specified port

#### **Or via Terminal (if available):**

```bash
cd ~/domains/hellomadurai.com/public_html
npm start
# Or: node server.js
# Or: npx next start
```

---

### **Step 9: Point Domain to Application**

1. In Hostinger hPanel, go to **"Websites"** → **hellomadurai.com**
2. Go to **"Manage"**
3. Make sure the domain points to your application folder
4. **Enable SSL/HTTPS** (usually automatic with Hostinger)

---

### **Step 10: Test Your Live Site!**

Visit:
```
https://hellomadurai.com
```

**Test these:**
- ✅ Home page loads
- ✅ News section works
- ✅ Admin panel: `https://hellomadurai.com/admin`
- ✅ Can create/edit news
- ✅ Database saves data
- ✅ Images upload
- ✅ Comments work

---

##  🔄 **How to Make Future Updates:**

### **Method 1: Quick File Update (Small Changes)**

1. **Make changes locally**
2. **Build:**
   ```bash
   npm run build
   ```
3. **Upload ONLY changed files** via FTP or File Manager:
   - `.next/` folder (after new build)
   - Any modified files in `src/`
   - `package.json` (if dependencies changed)

4. **Restart app** in Hostinger Node.js Manager

### **Method 2: Full Re-Deploy (Major Changes)**

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload all files** again (except `node_modules` if no dependency changes)

3. **Restart application**

### **Method 3: Using Git (Best for Future)**

**Set up once:**
```bash
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/hello-madurai.git
git push -u origin main
```

**Then for updates:**
1. Make changes locally
2. Commit and push to GitHub
3. Pull on Hostinger server (via SSH/Terminal)
4. Build and restart

---

## 🆘 **If Hostinger DOESN'T Support Node.js:**

You have 2 options:

### **Option A: Deploy to Vercel (Recommended)**

Vercel is **FREE** and perfect for Next.js:

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your project
4. Add environment variables:
   ```
   DATABASE_URL=mysql://u449309789_hellomadurai25:HelloMadurai123@srv1990.hstgr.io:3306/u449309789_hello_madurai
   ```
   (Use `srv1990.hstgr.io` for remote access, not localhost!)
5. Deploy!
6. You'll get a URL like: `https://hellomadurai.vercel.app`

**Then point hellomadurai.com to Vercel:**
- In Hostinger, go to DNS settings
- Add CNAME: `hellomadurai.com` → `cname.vercel-dns.com`

### **Option B: Upgrade Hostinger Plan**

Contact Hostinger support and ask:
- "Does my plan support Node.js applications?"
- If not, "Which plan do I need to run a Next.js app?"

---

## 📞 **Need Help?**

### **Check These:**

1. **Node.js Available?**
   - Look for "Node.js" in Hostinger hPanel
   - Or "Application Manager"

2. **MySQL Connection:**
   - Use `localhost` in production
   - Password: `HelloMadurai123`

3. **File Permissions:**
   - Files: 644
   - Folders: 755

4. **SSL/HTTPS:**
   - Should be automatic with Hostinger
   - Enable in hPanel if not

---

## ✅ **Quick Checklist:**

Before you start:
- [ ] Build app locally (`npm run build`)
- [ ] Have FTP credentials ready
- [ ] Know your Hostinger app folder path
- [ ] MySQL credentials confirmed
- [ ] Node.js available on Hostinger?

Deployment:
- [ ] Upload all files
- [ ] Create `.env` file on server
- [ ] Install dependencies (or upload node_modules)
- [ ] Set up Node.js application in hPanel
- [ ] Start the application
- [ ] Point domain to app
- [ ] Test live site

---

## 🎯 **Next Steps:**

**Option 1:** If Hostinger has Node.js support:
→ Follow Steps 1-10 above

**Option 2:** If Hostinger DOESN'T have Node.js:
→ Deploy to Vercel (5 minutes, FREE!)

**Which do you want to try first?** Let me know and I'll guide you through it! 🚀

