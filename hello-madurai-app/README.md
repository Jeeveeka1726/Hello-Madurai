# Hello Madurai - Local News & Information Hub

A comprehensive web application for Madurai's local news, events, directory, and community information with bilingual support (Tamil & English).

## 🚀 Features

### ✅ Completed Features

1. **Project Setup & Architecture**
   - Next.js 14 with TypeScript
   - Tailwind CSS for styling
   - Internationalization (Tamil/English)
   - Supabase backend integration
   - Authentication system

2. **Core UI Components**
   - Responsive layout with header/footer
   - Language switcher
   - Reusable Card and Button components
   - Mobile-friendly navigation

3. **Home Page**
   - Hero section with call-to-action
   - Featured sections grid
   - Quick stats display
   - Responsive design

4. **News Section**
   - News listing with categories
   - Individual article pages
   - Category filtering
   - Sharing functionality
   - Bilingual content support

### 🔄 In Progress / Planned Features

5. **Video Section** - Categories: தொழில், விவசாயம், ஹோட்டல், மருத்துவம், வாகனம், பெட்ஸ்
6. **Radio Section** - Audio player for uploaded files
7. **E-Magazine** - Monthly PDF magazines with download
8. **Directory** - Business listings with photos, videos, contact info
9. **Events Calendar** - Festival and event management with notifications
10. **Tourism Guide** - Temples, historical places with maps
11. **Jobs Portal** - Local job listings with apply functionality
12. **Weather & Transport** - Manual entry system for updates
13. **Helpline Services** - Emergency contacts and services
14. **Admin Dashboard** - Content management system
15. **Comments & Social Features** - User engagement features

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Internationalization**: next-intl
- **UI Components**: Headless UI, Heroicons
- **File Storage**: Supabase Storage
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
hello-madurai-app/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── news/          # News section
│   │   │   └── layout.tsx     # Locale layout
│   │   ├── auth/              # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── layout/            # Header, Footer, Navigation
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── supabase/          # Supabase client configuration
│   │   └── auth.ts            # Authentication utilities
│   ├── i18n/                  # Internationalization
│   │   ├── config.ts
│   │   └── messages/          # Translation files
│   └── types/
│       └── database.ts        # TypeScript types
├── supabase/
│   ├── schema.sql             # Database schema
│   └── rls-policies.sql       # Row Level Security policies
└── public/                    # Static assets
```

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- `profiles` - User profiles with role management
- `news` - News articles with categories
- `videos` - Video content with YouTube integration
- `radio_content` - Audio files for radio section
- `events` - Event calendar and management
- `magazines` - Monthly PDF magazines
- `directory` - Business directory with multimedia
- `jobs` - Job listings and applications
- `tourism` - Tourist attractions and guides
- `weather_updates` - Manual weather information
- `transport_schedules` - Bus/train schedules
- `helpline_services` - Emergency services
- `comments` - User comments across all content
- `reactions` - Like/emoji reactions

## 🚀 Complete Setup Guide

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20+)
- **npm or yarn**
- **Supabase account** (free tier available)
- **Firebase account** (for push notifications)

### Step 1: Project Setup

1. **Navigate to the project directory**
   ```bash
   cd hello-madurai-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Step 2: Supabase Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project: `hello-madurai`
   - Note your project URL and anon key

2. **Set up Database Schema**
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/schema.sql` (creates all tables)
   - Run `supabase/rls-policies.sql` (sets up security)

3. **Configure Storage Buckets**
   - Go to Storage → Create buckets:
     - `news-images` (public)
     - `videos` (public)
     - `audio` (public)
     - `pdfs` (public)
     - `directory-images` (public)

### Step 3: Firebase Setup (Push Notifications)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create project: `hello-madurai`
   - Enable Cloud Messaging

2. **Get Firebase Config**
   - Project Settings → General → Web apps
   - Copy the config object

3. **Generate VAPID Key**
   - Project Settings → Cloud Messaging
   - Generate Web Push certificates
   - Copy VAPID key

### Step 4: Environment Configuration

Update `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# Firebase Configuration (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyArpImyXLh-t6JgmPRZeKOeyiCM8lse_nM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hello-madurai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hello-madurai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hello-madurai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=941758481973
NEXT_PUBLIC_FIREBASE_APP_ID=1:941758481973:web:2150ada47abefaf896937c
NEXT_PUBLIC_FCM_VAPID_KEY=your_vapid_key

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=c:\Users\HP\Documents\freelancing\hello_madurai\hello-madurai-firebase-adminsdk-fbsvc-b5d2a45be2.json
```

### Step 5: Create Admin User

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Register first admin user**
   - Go to `http://localhost:3000/auth/register`
   - Create account with your email
   - Go to Supabase Dashboard → Authentication → Users
   - Find your user and note the UUID

3. **Set admin role**
   - Go to Supabase Dashboard → Table Editor → profiles
   - Find your user record
   - Change `role` from `user` to `admin`

### Step 6: Access Admin Panel

1. **Login as admin**
   - Go to `http://localhost:3000/auth/login`
   - Login with your admin credentials

2. **Access admin dashboard**
   - Go to `http://localhost:3000/admin`
   - You should see the admin interface

### Step 7: Test the Application

1. **Frontend (Public Site)**
   - Home: `http://localhost:3000`
   - News: `http://localhost:3000/en/news`
   - Tamil: `http://localhost:3000/ta`

2. **Admin Panel**
   - Dashboard: `http://localhost:3000/admin`
   - Add content through admin interface
   - Test notifications

### Step 8: Add Sample Content

1. **Add News Articles**
   - Go to Admin → News → Add New
   - Create sample articles in both languages
   - Publish to test notifications

2. **Add Events**
   - Go to Admin → Events → Add New
   - Create upcoming events
   - Test event notifications

3. **Test Notifications**
   - Go to Admin → Notifications
   - Send test notification to "all" topic
   - Check browser notifications
