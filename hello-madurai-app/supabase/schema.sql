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
    video_file_url TEXT,
    thumbnail_url TEXT,
    is_self_uploaded BOOLEAN DEFAULT false,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Radio/Audio table
CREATE TABLE radio_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    description TEXT,
    description_ta TEXT,
    audio_file_url TEXT NOT NULL,
    duration INTEGER, -- in seconds
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    plays_count INTEGER DEFAULT 0,
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
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    location_ta TEXT,
    location_map_url TEXT,
    featured_image TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Magazine/E-Paper table
CREATE TABLE magazines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    description TEXT,
    description_ta TEXT,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    pdf_file_url TEXT NOT NULL,
    cover_image_url TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, year)
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
    phone_number TEXT,
    email TEXT,
    address TEXT NOT NULL,
    address_ta TEXT,
    location_map_url TEXT,
    website_url TEXT,
    featured_image TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Directory images table (multiple images per directory entry)
CREATE TABLE directory_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    directory_id UUID REFERENCES directory(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    caption_ta TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Directory videos table (multiple videos per directory entry)
CREATE TABLE directory_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    directory_id UUID REFERENCES directory(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    title TEXT,
    title_ta TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    title_ta TEXT,
    description TEXT NOT NULL,
    description_ta TEXT,
    company_name TEXT NOT NULL,
    company_name_ta TEXT,
    location TEXT NOT NULL,
    location_ta TEXT,
    salary_range TEXT,
    experience_required TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    application_url TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tourism table
CREATE TABLE tourism (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ta TEXT,
    description TEXT NOT NULL,
    description_ta TEXT,
    category TEXT NOT NULL, -- temple, historical, museum, etc.
    address TEXT NOT NULL,
    address_ta TEXT,
    location_map_url TEXT,
    featured_image TEXT,
    visiting_hours TEXT,
    visiting_hours_ta TEXT,
    entry_fee TEXT,
    contact_info TEXT,
    status content_status DEFAULT 'draft',
    author_id UUID REFERENCES profiles(id),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tourism images table
CREATE TABLE tourism_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tourism_id UUID REFERENCES tourism(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    caption_ta TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather updates table (manual entry)
CREATE TABLE weather_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    temperature_max INTEGER,
    temperature_min INTEGER,
    weather_condition TEXT NOT NULL,
    weather_condition_ta TEXT,
    humidity INTEGER,
    rainfall DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    description TEXT,
    description_ta TEXT,
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Transport schedules table (manual entry)
CREATE TABLE transport_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    transport_type TEXT NOT NULL, -- bus, train
    route_name TEXT NOT NULL,
    route_name_ta TEXT,
    departure_time TIME NOT NULL,
    arrival_time TIME,
    departure_location TEXT NOT NULL,
    departure_location_ta TEXT,
    arrival_location TEXT NOT NULL,
    arrival_location_ta TEXT,
    frequency TEXT, -- daily, weekly, etc.
    fare DECIMAL(10,2),
    contact_info TEXT,
    status content_status DEFAULT 'published',
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helpline/Emergency services table
CREATE TABLE helpline_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name TEXT NOT NULL,
    service_name_ta TEXT,
    category TEXT NOT NULL, -- hospital, blood_bank, elder_care, etc.
    description TEXT,
    description_ta TEXT,
    phone_number TEXT NOT NULL,
    alternate_phone TEXT,
    email TEXT,
    address TEXT,
    address_ta TEXT,
    availability TEXT, -- 24/7, business hours, etc.
    availability_ta TEXT,
    status content_status DEFAULT 'published',
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table (for all content types)
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL, -- news, video, event, etc.
    content_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id),
    user_name TEXT, -- for anonymous comments
    comment_text TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id), -- for replies
    status content_status DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions table (likes, emojis)
CREATE TABLE reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    user_id UUID REFERENCES profiles(id),
    reaction_type TEXT NOT NULL, -- like, love, laugh, angry, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, user_id, reaction_type)
);

-- FCM tokens table for push notifications
CREATE TABLE fcm_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'ta')),
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Notification logs table
CREATE TABLE notification_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    title_ta TEXT,
    body_ta TEXT,
    target_type TEXT NOT NULL, -- token, topic, all
    target_value TEXT, -- token value or topic name
    content_type TEXT, -- news, event, job, emergency
    content_id UUID,
    image_url TEXT,
    click_action TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    sent_by UUID REFERENCES profiles(id)
);

-- Create indexes for better performance
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_created_at ON news(created_at DESC);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_directory_category ON directory(category);
CREATE INDEX idx_jobs_expires_at ON jobs(expires_at);
CREATE INDEX idx_comments_content ON comments(content_type, content_id);
CREATE INDEX idx_reactions_content ON reactions(content_type, content_id);
CREATE INDEX idx_fcm_tokens_user ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_active ON fcm_tokens(is_active);
CREATE INDEX idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX idx_notification_logs_content ON notification_logs(content_type, content_id);

-- Full text search indexes
CREATE INDEX idx_news_search ON news USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_news_search_ta ON news USING gin(to_tsvector('simple', COALESCE(title_ta, '') || ' ' || COALESCE(content_ta, '')));
CREATE INDEX idx_directory_search ON directory USING gin(to_tsvector('english', business_name || ' ' || description));
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_radio_content_updated_at BEFORE UPDATE ON radio_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_magazines_updated_at BEFORE UPDATE ON magazines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_directory_updated_at BEFORE UPDATE ON directory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tourism_updated_at BEFORE UPDATE ON tourism FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_schedules_updated_at BEFORE UPDATE ON transport_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_helpline_services_updated_at BEFORE UPDATE ON helpline_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fcm_tokens_updated_at BEFORE UPDATE ON fcm_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
