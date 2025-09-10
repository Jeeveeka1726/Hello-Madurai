# 🚀 Hello Madurai - Complete Startup Guide

This guide will help you start both the frontend and admin panel for the Hello Madurai application.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed ([Download here](https://nodejs.org/))
- [ ] **Supabase project** created and configured
- [ ] **Firebase project** set up for notifications
- [ ] **Environment variables** configured in `.env.local`
- [ ] **Database schema** imported to Supabase
- [ ] **Admin user** created in the system

## 🔧 Quick Setup (First Time)

### 1. Install Dependencies
```bash
cd hello-madurai-app
npm install
```

### 2. Configure Environment
Ensure your `.env.local` file has all required variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase (for notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyArpImyXLh-t6JgmPRZeKOeyiCM8lse_nM
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hello-madurai
# ... other Firebase config
```

### 3. Set Up Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Run `supabase/schema.sql`
4. Run `supabase/rls-policies.sql`

### 4. Create Admin User
1. Start the app (see below)
2. Register at `/auth/register`
3. Go to Supabase → Authentication → Users
4. Change user role to `admin` in the `profiles` table

## 🚀 Starting the Application

### Option 1: Using Startup Scripts

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

```bash
npm run dev
```

## 🌐 Accessing the Application

Once started, the application will be available at:

### 🏠 **Frontend (Public Site)**
- **English**: http://localhost:3000/en
- **Tamil**: http://localhost:3000/ta
- **Auto-redirect**: http://localhost:3000 (redirects to /en)

### ⚙️ **Admin Panel**
- **Admin Dashboard**: http://localhost:3000/admin
- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register

### 📱 **Main Sections**
- **News**: http://localhost:3000/en/news
- **Videos**: http://localhost:3000/en/videos
- **Events**: http://localhost:3000/en/events
- **Directory**: http://localhost:3000/en/directory
- **Jobs**: http://localhost:3000/en/jobs
- **Radio**: http://localhost:3000/en/radio
- **Magazine**: http://localhost:3000/en/magazine
- **Tourism**: http://localhost:3000/en/tourism
- **Weather**: http://localhost:3000/en/weather
- **Helpline**: http://localhost:3000/en/helpline

## 🔐 Admin Panel Features

### 📊 **Dashboard** (`/admin`)
- Overview statistics
- Quick actions
- Recent activity
- Navigation to all admin sections

### 📰 **Content Management**
- **News**: `/admin/news` - Create and manage news articles
- **Events**: `/admin/events` - Manage events and festivals
- **Videos**: `/admin/videos` - Upload and organize videos
- **Directory**: `/admin/directory` - Business listings management
- **Jobs**: `/admin/jobs` - Job postings management

### 🔔 **Notifications** (`/admin/notifications`)
- Send push notifications
- Topic-based messaging
- Bilingual support
- Emergency alerts

### 👥 **User Management**
- View registered users
- Manage user roles
- Monitor user activity

## 🧪 Testing the Application

### 1. Test Frontend
1. Visit http://localhost:3000
2. Navigate through different sections
3. Test language switching (EN ↔ TA)
4. Check responsive design on mobile

### 2. Test Admin Panel
1. Login as admin at `/auth/login`
2. Access admin dashboard at `/admin`
3. Try creating sample content
4. Test notification system

### 3. Test Notifications
1. Go to `/admin/notifications`
2. Send test notification to "all" topic
3. Check browser notifications
4. Test both English and Tamil messages

## 🛠️ Development Workflow

### Adding New Content
1. **Login as Admin** → `/auth/login`
2. **Go to Admin Dashboard** → `/admin`
3. **Choose Content Type** → Click on relevant section
4. **Create Content** → Fill forms with English and Tamil content
5. **Publish** → Set status to "published"
6. **Test** → View on frontend

### Managing Users
1. **View Users** → Supabase Dashboard → Authentication
2. **Change Roles** → Table Editor → profiles → Update role
3. **Monitor Activity** → Check admin dashboard

### Sending Notifications
1. **Go to Notifications** → `/admin/notifications`
2. **Choose Type** → Topic, Token, or Content
3. **Write Message** → Both English and Tamil
4. **Send** → Notification delivered to users

## 🔧 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

**2. Database Connection Error**
- Check Supabase URL and keys in `.env.local`
- Verify database schema is imported
- Check RLS policies are applied

**3. Admin Access Denied**
- Ensure user role is set to `admin` in profiles table
- Clear browser cache and cookies
- Check authentication status

**4. Notifications Not Working**
- Verify Firebase configuration
- Check service worker is loaded
- Ensure HTTPS in production

**5. Build Errors**
- Run `npm install` to update dependencies
- Check TypeScript errors
- Verify all environment variables

### Debug Commands

```bash
# Check dependencies
npm list

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment
npm run build
```

## 📱 Mobile Testing

### Browser Testing
- **Chrome DevTools** → Toggle device toolbar
- **Firefox** → Responsive Design Mode
- **Safari** → Develop → Enter Responsive Design Mode

### Real Device Testing
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access from mobile: `http://YOUR_IP:3000`
3. Test touch interactions and responsive design

## 🚀 Production Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
```

## 📞 Support

### Getting Help
1. **Check Console** → Browser DevTools → Console tab
2. **Check Network** → DevTools → Network tab
3. **Check Database** → Supabase Dashboard → Logs
4. **Check Server** → Terminal output

### Useful Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🎉 You're Ready!

Your Hello Madurai application is now running with:
- ✅ **Bilingual frontend** (Tamil/English)
- ✅ **Complete admin panel**
- ✅ **Push notifications**
- ✅ **Content management**
- ✅ **User authentication**

**Happy coding!** 🚀
