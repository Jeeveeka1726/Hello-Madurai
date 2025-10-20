# 🚀 Production Deployment Guide for Hostinger

## 🎯 **Your Domain: hellomadurai.com**

---

## 📋 **Current Setup:**

### **Database Info:**
- **Host (Production):** `localhost` (when deployed on Hostinger)
- **Host (Development):** `srv1022.hstgr.io` (remote access)
- **Database:** `u449309789_hello_madurai`
- **Username:** `u449309789_hellomadurai25`
- **Password:** `Ramesh7hello$madurai`
- **Port:** `3306`

---

## ✅ **Step 1: Fix Password Issue First**

**IMPORTANT:** Your database connection is currently failing!

**Please verify:**
1. Go to Hostinger hPanel
2. Go to "Databases" → "MySQL Databases"  
3. Click "Enter phpMyAdmin"
4. Try logging in with:
   - Username: `u449309789_hellomadurai25`
   - Password: `Ramesh7hello$madurai`

**If it fails:** Reset the password in Hostinger hPanel and tell me the new one.

---

## 🌐 **Step 2: Production Environment Variables**

### **Create `.env` file on Hostinger:**

When you deploy to Hostinger, create a file named `.env` (NOT `.env.local`) with:

```bash
# Production Database (uses localhost when on Hostinger server)
DATABASE_URL="mysql://u449309789_hellomadurai25:Ramesh7hello$madurai@localhost:3306/u449309789_hello_madurai?connection_limit=10&pool_timeout=20"

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://hellomadurai.com
```

**Key Difference:**
- **Local Dev:** Uses `srv1022.hstgr.io` (remote MySQL)
- **Production:** Uses `localhost` (MySQL on same server)

---

## 📦 **Step 3: Build for Production**

### **On Your Local Machine:**

```bash
cd /Users/jeeveeka.ps/Documents/Projects/Hello_madurai/Hello-Madurai/hello-madurai-app

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build for production
npm run build

# Test production build locally (optional)
npm start
```

---

## 🚀 **Step 4: Deploy to Hostinger**

### **Option A: Using Node.js Hosting (Recommended)**

**If Hostinger supports Node.js:**

1. **Upload Files via FTP/File Manager:**
   - Upload entire `hello-madurai-app` folder
   - Include `node_modules` OR run `npm install` on server

2. **Set up Environment Variables:**
   - Create `.env` file on server (see Step 2)

3. **Run Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start Application:**
   ```bash
   npm start
   # Or use PM2:
   pm2 start npm --name "hello-madurai" -- start
   ```

5. **Configure Domain:**
   - Point `hellomadurai.com` to your Node.js app
   - Set up in Hostinger's "Websites" section

### **Option B: Using Static Export (If No Node.js)**

If Hostinger only supports static hosting:

```bash
# Build static export
npm run build
npx next export

# Upload the 'out' folder to public_html
```

**Note:** This won't work with API routes. You'll need Node.js hosting.

---

## 🔧 **Step 5: Database Migration**

### **Push Schema to Hostinger MySQL:**

```bash
# From your local machine (after fixing password):
npx prisma db push
```

This will create all tables in your Hostinger MySQL database.

---

## 🌍 **Step 6: Domain Configuration**

### **In Hostinger hPanel:**

1. Go to **"Websites"** section
2. Find **hellomadurai.com**
3. Configure to point to your Next.js app
4. Enable SSL/HTTPS (free Let's Encrypt)

### **Update URLs in Code:**

Make sure all URLs use your domain:
- API calls should use relative URLs (`/api/...`) - already done ✅
- Public URL: `https://hellomadurai.com`

---

## 🔐 **Step 7: Security Checklist**

### **Production Security:**

✅ **Environment Variables:**
- Never commit `.env` to Git
- Use strong passwords
- Enable SSL/HTTPS

✅ **Database:**
- Change MySQL password after setup
- Disable Remote MySQL after deployment (use localhost)
- Enable firewall rules

✅ **Next.js:**
- Use `NODE_ENV=production`
- Enable compression
- Set up proper caching headers

---

## 📊 **Step 8: Test Production Deployment**

### **After Deployment:**

1. **Visit:** `https://hellomadurai.com`
2. **Test:**
   - Home page loads ✅
   - News articles display ✅
   - Admin panel works ✅
   - Can create/edit news ✅
   - Comments work ✅
   - Ads display ✅

3. **Check Database:**
   - phpMyAdmin shows all tables ✅
   - Data is being saved ✅

---

## 🐛 **Troubleshooting:**

### **Issue: Database Connection Failed**

**Symptoms:**
```
Authentication failed against database server
```

**Solutions:**
1. Verify password in phpMyAdmin
2. Check `.env` file on server
3. Make sure using `localhost` not `srv1022.hstgr.io` in production
4. Verify MySQL user permissions

### **Issue: 502 Bad Gateway**

**Solutions:**
1. Check if Node.js process is running
2. Verify port configuration
3. Check Hostinger logs

### **Issue: Static Files Not Loading**

**Solutions:**
1. Check file permissions (755 for folders, 644 for files)
2. Verify `public` folder is uploaded
3. Check Next.js static file configuration

---

## 📝 **Production Checklist:**

Before going live:

- [ ] Fix database password issue
- [ ] Test database connection from production server
- [ ] Push database schema with `prisma db push`
- [ ] Upload all files to Hostinger
- [ ] Create `.env` file on server with production settings
- [ ] Run `npm install` on server
- [ ] Build application: `npm run build`
- [ ] Start application: `npm start` or use PM2
- [ ] Configure domain: hellomadurai.com
- [ ] Enable SSL/HTTPS
- [ ] Test all features on live site
- [ ] Set up monitoring/error tracking
- [ ] Configure automated backups

---

## 🎯 **Your Production URLs:**

After deployment:

- **Website:** `https://hellomadurai.com`
- **Admin:** `https://hellomadurai.com/admin`
- **API:** `https://hellomadurai.com/api/*`
- **Database:** Hostinger MySQL (localhost on server)

---

## 💡 **Important Notes:**

1. **Database Access:**
   - **Development:** Remote access via `srv1022.hstgr.io`
   - **Production:** Local access via `localhost`

2. **Environment Files:**
   - **Local:** `.env.local` (uses remote MySQL)
   - **Production:** `.env` (uses localhost MySQL)

3. **Domain:**
   - Make sure DNS points to Hostinger servers
   - Can take 24-48 hours for DNS propagation

4. **Backups:**
   - Hostinger auto-backs up databases
   - Manually backup before major updates

---

## 🚀 **Next Steps:**

1. **Fix Password First** - Verify in phpMyAdmin
2. **Test Local Connection** - Make sure it works
3. **Deploy to Hostinger** - Follow steps above
4. **Configure Domain** - Point hellomadurai.com to app
5. **Go Live!** 🎉

**Once password is fixed, everything will work!**


