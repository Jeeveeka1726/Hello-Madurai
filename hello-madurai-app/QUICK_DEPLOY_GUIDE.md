# 🚀 Quick Deployment Guide for Hello Madurai

## ✅ BUILD COMPLETE! Your app is production-ready!

---

## 🎯 **Recommended: Deploy to Hostinger using Their Application Manager**

Since you have Hostinger Premium hosting, here's the easiest way:

### **Step 1: Check if Hostinger Supports Node.js**

1. Log in to **Hostinger hPanel**
2. Go to **"Websites"** → **hellomadurai.com**
3. Look for one of these:
   - "Application Manager"
   - "Node.js"
   - "Node.js Application"
   - "Website Builder" → "Node.js"

**If you see Node.js options:** Continue to Step 2
**If you DON'T see Node.js:** Skip to **Alternative: Deploy to Vercel** (below)

---

### **Step 2: Upload Your Files to Hostinger**

#### **Option A: Using Hostinger File Manager (Easiest)**

1. **Go to:** Hostinger hPanel → Files → File Manager
2. **Navigate to:** `public_html` or `domains/hellomadurai.com/public_html`
3. **Create a new folder:** `hello-madurai-app` (or upload directly to `public_html`)
4. **Upload these files/folders:**

   ✅ **Essential Files:**
   ```
   .next/                  (entire folder after build)
   public/                 (entire folder)
   prisma/                 (entire folder)
   src/                    (entire folder - for reference, not required for production)
   package.json
   package-lock.json
   next.config.ts
   tsconfig.json
   ```

   ❌ **DON'T Upload:**
   ```
   .env.local              (Create .env directly on server)
   .git/
   node_modules/           (Install on server)
   *.md files
   ```

5. **Compress files** on your Mac to speed up upload:
   ```bash
   cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app
   
   # Zip essential folders
   zip -r next-build.zip .next/
   zip -r public-files.zip public/
   zip -r prisma-files.zip prisma/
   ```
   
   Then upload the ZIP files and extract them in File Manager.

---

### **Step 3: Create `.env` File on Server**

1. In Hostinger File Manager, click **"New File"** → Name it `.env`
2. **Paste this content:**

   ```env
   # Production Environment Variables
   DATABASE_URL="mysql://u449309789_hellomadurai25:HelloMadurai123@localhost:3306/u449309789_hello_madurai?connection_limit=10&pool_timeout=20"
   
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://hellomadurai.com
   ```

   **Important:** Use `localhost` (not `srv1990.hstgr.io`) because MySQL is on the same server!

---

### **Step 4: Install Dependencies on Hostinger**

#### **If Hostinger has Terminal/SSH Access:**

1. Go to **Hostinger hPanel** → **Advanced** → **SSH Access** or **Terminal**
2. Connect and run:

   ```bash
   cd ~/domains/hellomadurai.com/public_html/hello-madurai-app
   # Or wherever you uploaded files
   
   # Install dependencies
   npm install --production
   
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema (if first time)
   npx prisma db push
   ```

#### **If NO Terminal Access:**

You'll need to upload `node_modules` from your Mac:
```bash
# This will take time! (~500MB)
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app
zip -r node_modules.zip node_modules/
```

Upload `node_modules.zip` to Hostinger and extract it.

---

### **Step 5: Set Up Node.js Application in Hostinger**

1. **Go to:** Hostinger hPanel → Websites → hellomadurai.com → **Application Manager** or **Node.js**
2. **Click:** "Create Application" or "Setup Node.js Application"
3. **Fill in:**
   - **Application Root:** `/domains/hellomadurai.com/public_html/hello-madurai-app`
   - **Application URL:** `hellomadurai.com` (or leave blank for main domain)
   - **Application Startup File:** `node_modules/next/dist/bin/next` with argument `start`
     OR create `server.js` (see below)
   - **Node.js Version:** 18.x or 20.x (latest LTS)

4. **Environment Variables** (if there's a section for this):
   ```
   DATABASE_URL=mysql://u449309789_hellomadurai25:HelloMadurai123@localhost:3306/u449309789_hello_madurai
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://hellomadurai.com
   PORT=3000
   ```

5. **Click:** "Create" or "Start Application"

---

### **Step 6: Create `server.js` (If Needed)**

If Hostinger asks for a startup file, create `/hello-madurai-app/server.js`:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = false
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

### **Step 7: Configure Domain & SSL**

1. **Go to:** Hostinger hPanel → Websites → hellomadurai.com → **Manage**
2. **Domain Settings:**
   - Make sure `hellomadurai.com` points to your application folder
3. **Enable SSL:**
   - Should be automatic with Hostinger
   - If not, go to **Security** → **SSL** → Enable for `hellomadurai.com`

---

### **Step 8: Test Your Live Site!**

Visit:
```
https://hellomadurai.com
```

**Test Everything:**
- ✅ Home page loads
- ✅ News section works
- ✅ Can read articles
- ✅ Comments appear and can be posted
- ✅ Ads display correctly
- ✅ Admin panel: `https://hellomadurai.com/admin`
- ✅ Can create/edit news in admin
- ✅ Images upload properly
- ✅ Rich text editor works
- ✅ Views/likes increment correctly

---

## 🔄 **How to Make Future Updates**

### **Method 1: Small Changes (Recommended)**

1. **Make changes locally**
2. **Build:**
   ```bash
   npm run build
   ```
3. **Upload ONLY changed files:**
   - New `.next/` folder (after build)
   - Any modified files in `src/` (if needed for reference)
   - `package.json` (if dependencies changed)

4. **Restart app** in Hostinger Application Manager or via Terminal:
   ```bash
   pm2 restart hello-madurai
   # Or whatever restart command Hostinger provides
   ```

### **Method 2: Full Re-Deploy (Major Changes)**

1. Build locally
2. Upload all files again (except `node_modules` if no dependency changes)
3. Restart application

### **Method 3: Using Git (Best Practice - Set Up Once)**

**On your Mac:**
```bash
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app

# Initialize git (if not already)
git init
git add .
git commit -m "Production ready"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/hello-madurai.git
git push -u origin main
```

**On Hostinger (via SSH/Terminal):**
```bash
cd ~/domains/hellomadurai.com/public_html

# Clone or pull latest
git clone https://github.com/YOUR_USERNAME/hello-madurai.git hello-madurai-app
# Or: cd hello-madurai-app && git pull

# Install & build
npm install
npx prisma generate
npm run build

# Restart
pm2 restart hello-madurai
```

---

## 🆘 **If Hostinger DOESN'T Support Node.js**

No problem! Deploy to **Vercel** (FREE, perfect for Next.js):

### **Deploy to Vercel in 5 Minutes**

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub/GitLab/email
3. **Click:** "Import Project"
4. **Choose:** Upload files or connect GitHub
5. **Add Environment Variables:**
   ```
   DATABASE_URL=mysql://u449309789_hellomadurai25:HelloMadurai123@srv1990.hstgr.io:3306/u449309789_hello_madurai
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://hellomadurai.com
   ```
   **Note:** Use `srv1990.hstgr.io` (NOT `localhost`) for Vercel!

6. **Click:** "Deploy"
7. **Done!** You'll get a URL like: `https://hello-madurai.vercel.app`

### **Point hellomadurai.com to Vercel**

1. **In Vercel:**
   - Go to Project Settings → Domains
   - Add `hellomadurai.com`
   - Copy the CNAME record shown

2. **In Hostinger hPanel:**
   - Go to Domains → hellomadurai.com → **DNS/Nameservers**
   - Click "Manage DNS Records"
   - Add CNAME record:
     - Name: `@` or `www`
     - Points to: `cname.vercel-dns.com`
   - Save

3. **Wait 5-30 minutes** for DNS propagation
4. **Done!** `https://hellomadurai.com` now points to your Vercel app!

---

## 📞 **Need Help?**

### **Common Issues:**

1. **"Cannot connect to database"**
   - Check `.env` file exists on server
   - Use `localhost` if on same server as MySQL
   - Use `srv1990.hstgr.io` if deploying elsewhere (like Vercel)

2. **"Application won't start"**
   - Check Node.js version (needs 18+ or 20+)
   - Check `node_modules` are installed
   - Check `npx prisma generate` was run

3. **"404 errors"**
   - Make sure application root path is correct
   - Make sure `.next` folder uploaded
   - Restart application

4. **"Images not loading"**
   - Make sure `public/` folder uploaded
   - Check file permissions (755 for folders, 644 for files)

5. **"SSL/HTTPS not working"**
   - Enable SSL in Hostinger SSL settings
   - Wait for certificate generation (can take up to 24 hours)

---

## ✅ **Your App is Ready!**

**Local Build:** ✅ Complete
**Production Files:** ✅ Ready in `.next/` folder
**Database:** ✅ Connected to Hostinger MySQL
**All Features:** ✅ Tested and working

**Next Step:** Choose your deployment method:
- **Hostinger Node.js** → Follow Steps 1-8 above
- **Vercel** → Follow "If Hostinger DOESN'T Support Node.js" section

**Estimated time to deploy:** 15-30 minutes

Good luck! 🚀

