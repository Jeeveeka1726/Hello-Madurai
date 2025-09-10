# 🗄️ DATABASE SETUP - COPY & PASTE INSTRUCTIONS

## 📋 **STEP-BY-STEP GUIDE:**

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project: **hello-madurai**
3. Click on **SQL Editor** in the left sidebar

### **Step 2: Create New Query**
1. Click **"New Query"** button
2. Delete any existing content in the editor

### **Step 3: Copy & Paste Schema**
1. Copy the ENTIRE content from `supabase/schema.sql` file
2. Paste it into the SQL Editor
3. Click **"Run"** button

### **Step 4: Copy & Paste Policies**
1. Create another new query
2. Copy the ENTIRE content from `supabase/rls-policies.sql` file  
3. Paste it into the SQL Editor
4. Click **"Run"** button

---

## 📁 **FILES TO COPY:**

### **File 1: schema.sql** (Copy this ENTIRE content)
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE news_category AS ENUM ('collector', 'corporation', 'police', 'agriculture', 'cinema', 'articles', 'jobs');
CREATE TYPE video_category AS ENUM ('business', 'agriculture', 'hotel', 'medical', 'vehicle', 'pets');
CREATE TYPE directory_category AS ENUM ('medical', 'education', 'business', 'restaurant', 'transport', 'government', 'shops', 'services');
CREATE TYPE event_type AS ENUM ('festival', 'exhibition', 'cultural', 'government', 'business');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    content TEXT NOT NULL,
    content_ta TEXT,
    excerpt TEXT,
    excerpt_ta TEXT,
    category news_category NOT NULL,
    featured_image TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    description TEXT,
    description_ta TEXT,
    category video_category NOT NULL,
    youtube_url TEXT,
    vimeo_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    description TEXT,
    description_ta TEXT,
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    location_ta TEXT,
    featured_image TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Directory table
CREATE TABLE directory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_name TEXT NOT NULL,
    business_name_ta TEXT,
    description TEXT,
    description_ta TEXT,
    category directory_category NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    address_ta TEXT,
    website TEXT,
    featured_image TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine Issues table
CREATE TABLE magazine_issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    issue_number INTEGER NOT NULL,
    publication_date DATE NOT NULL,
    pdf_url TEXT NOT NULL,
    cover_image_url TEXT,
    description TEXT,
    description_ta TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FCM Tokens table (for push notifications)
CREATE TABLE fcm_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    body TEXT NOT NULL,
    body_ta TEXT,
    image_url TEXT,
    action_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_created_at ON news(created_at DESC);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_directory_category ON directory(category);
CREATE INDEX idx_directory_status ON directory(status);
CREATE INDEX idx_magazine_publication_date ON magazine_issues(publication_date DESC);
CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_directory_updated_at BEFORE UPDATE ON directory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_magazine_issues_updated_at BEFORE UPDATE ON magazine_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fcm_tokens_updated_at BEFORE UPDATE ON fcm_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO magazine_issues (title, title_ta, issue_number, publication_date, pdf_url, description, description_ta, status) VALUES
('Hello Madurai February 2019', 'ஹலோ மதுரை பிப்ரவரி 2019', 1, '2019-02-01', '/01.02.19-hello-madurai.pdf', 'February 2019 issue of Hello Madurai magazine', 'ஹலோ மதுரை பத்திரிகையின் பிப்ரவரி 2019 இதழ்', 'published'),
('Hello Madurai September 2019', 'ஹலோ மதுரை செப்டம்பர் 2019', 2, '2019-09-01', '/01.09.19-hello-madurai.pdf', 'September 2019 issue of Hello Madurai magazine', 'ஹலோ மதுரை பத்திரிகையின் செப்டம்பர் 2019 இதழ்', 'published'),
('Hello Madurai October 2019', 'ஹலோ மதுரை அக்டோபர் 2019', 3, '2019-10-01', '/01.10.19-hello-madurai.pdf', 'October 2019 issue of Hello Madurai magazine', 'ஹலோ மதுரை பத்திரிகையின் அக்டோபர் 2019 இதழ்', 'published');
```

```

### **File 2: rls-policies.sql** (Copy this ENTIRE content AFTER running schema.sql)
```sql
-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (is_admin(auth.uid()));

-- News policies
CREATE POLICY "Anyone can view published news" ON news FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on news" ON news FOR ALL USING (is_admin(auth.uid()));

-- Videos policies
CREATE POLICY "Anyone can view published videos" ON videos FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on videos" ON videos FOR ALL USING (is_admin(auth.uid()));

-- Events policies
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on events" ON events FOR ALL USING (is_admin(auth.uid()));

-- Directory policies
CREATE POLICY "Anyone can view published directory entries" ON directory FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on directory" ON directory FOR ALL USING (is_admin(auth.uid()));

-- Magazine policies
CREATE POLICY "Anyone can view published magazines" ON magazine_issues FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on magazines" ON magazine_issues FOR ALL USING (is_admin(auth.uid()));

-- FCM tokens policies
CREATE POLICY "Users can manage own FCM tokens" ON fcm_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all FCM tokens" ON fcm_tokens FOR SELECT USING (is_admin(auth.uid()));

-- Notifications policies
CREATE POLICY "Anyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on notifications" ON notifications FOR ALL USING (is_admin(auth.uid()));
```

---

## ⚠️ **IMPORTANT NOTES:**
- Copy the ENTIRE content above (all 200+ lines)
- Don't miss any part of the SQL
- Run it in Supabase SQL Editor
- Wait for "Success" message before proceeding

---

## 🔄 **AFTER SCHEMA SETUP:**
1. Run the verification script: `node start-complete.js`
2. Should show "✅ Database connection successful!"
3. Create admin user at: http://localhost:3000/auth/register
4. Update user role to "admin" in Supabase dashboard

---

## 📞 **NEED HELP?**
If you encounter any errors:
1. Check the error message in Supabase
2. Make sure you copied the ENTIRE SQL content
3. Try running each section separately if needed
