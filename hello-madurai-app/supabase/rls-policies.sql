-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourism_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpline_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

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

-- Helper function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Only admins can delete profiles" ON profiles
  FOR DELETE USING (is_admin(auth.uid()));

-- News policies
CREATE POLICY "Published news are viewable by everyone" ON news
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert news" ON news
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their news" ON news
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete news" ON news
  FOR DELETE USING (is_admin(auth.uid()));

-- Videos policies
CREATE POLICY "Published videos are viewable by everyone" ON videos
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert videos" ON videos
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their videos" ON videos
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete videos" ON videos
  FOR DELETE USING (is_admin(auth.uid()));

-- Radio content policies
CREATE POLICY "Published radio content viewable by everyone" ON radio_content
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert radio content" ON radio_content
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their radio content" ON radio_content
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete radio content" ON radio_content
  FOR DELETE USING (is_admin(auth.uid()));

-- Events policies
CREATE POLICY "Published events are viewable by everyone" ON events
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert events" ON events
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their events" ON events
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete events" ON events
  FOR DELETE USING (is_admin(auth.uid()));

-- Magazines policies
CREATE POLICY "Published magazines are viewable by everyone" ON magazines
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert magazines" ON magazines
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their magazines" ON magazines
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete magazines" ON magazines
  FOR DELETE USING (is_admin(auth.uid()));

-- Directory policies
CREATE POLICY "Published directory entries are viewable by everyone" ON directory
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert directory entries" ON directory
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their directory entries" ON directory
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete directory entries" ON directory
  FOR DELETE USING (is_admin(auth.uid()));

-- Directory images policies
CREATE POLICY "Directory images are viewable by everyone" ON directory_images
  FOR SELECT USING (true);

CREATE POLICY "Admins and moderators can insert directory images" ON directory_images
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins can update directory images" ON directory_images
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete directory images" ON directory_images
  FOR DELETE USING (is_admin(auth.uid()));

-- Directory videos policies
CREATE POLICY "Directory videos are viewable by everyone" ON directory_videos
  FOR SELECT USING (true);

CREATE POLICY "Admins and moderators can insert directory videos" ON directory_videos
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins can update directory videos" ON directory_videos
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete directory videos" ON directory_videos
  FOR DELETE USING (is_admin(auth.uid()));

-- Jobs policies
CREATE POLICY "Published jobs are viewable by everyone" ON jobs
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert jobs" ON jobs
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their jobs" ON jobs
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete jobs" ON jobs
  FOR DELETE USING (is_admin(auth.uid()));

-- Tourism policies
CREATE POLICY "Published tourism entries are viewable by everyone" ON tourism
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert tourism entries" ON tourism
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update their tourism entries" ON tourism
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete tourism entries" ON tourism
  FOR DELETE USING (is_admin(auth.uid()));

-- Tourism images policies
CREATE POLICY "Tourism images are viewable by everyone" ON tourism_images
  FOR SELECT USING (true);

CREATE POLICY "Admins and moderators can insert tourism images" ON tourism_images
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins can update tourism images" ON tourism_images
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete tourism images" ON tourism_images
  FOR DELETE USING (is_admin(auth.uid()));

-- Weather updates policies
CREATE POLICY "Weather updates are viewable by everyone" ON weather_updates
  FOR SELECT USING (true);

CREATE POLICY "Admins and moderators can insert weather updates" ON weather_updates
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update weather updates" ON weather_updates
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete weather updates" ON weather_updates
  FOR DELETE USING (is_admin(auth.uid()));

-- Transport schedules policies
CREATE POLICY "Transport schedules are viewable by everyone" ON transport_schedules
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert transport schedules" ON transport_schedules
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update transport schedules" ON transport_schedules
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete transport schedules" ON transport_schedules
  FOR DELETE USING (is_admin(auth.uid()));

-- Helpline services policies
CREATE POLICY "Helpline services are viewable by everyone" ON helpline_services
  FOR SELECT USING (status = 'published' OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Admins and moderators can insert helpline services" ON helpline_services
  FOR INSERT WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Authors and admins can update helpline services" ON helpline_services
  FOR UPDATE USING (author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete helpline services" ON helpline_services
  FOR DELETE USING (is_admin(auth.uid()));

-- Comments policies
CREATE POLICY "Published comments are viewable by everyone" ON comments
  FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid() OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Users can delete their own comments, admins can delete any" ON comments
  FOR DELETE USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Reactions policies
CREATE POLICY "Reactions are viewable by everyone" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reactions" ON reactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON reactions
  FOR DELETE USING (user_id = auth.uid());

-- FCM tokens policies
CREATE POLICY "Users can view their own FCM tokens" ON fcm_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own FCM tokens" ON fcm_tokens
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own FCM tokens" ON fcm_tokens
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own FCM tokens" ON fcm_tokens
  FOR DELETE USING (user_id = auth.uid());

-- Notification logs policies
CREATE POLICY "Admins can view all notification logs" ON notification_logs
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert notification logs" ON notification_logs
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update notification logs" ON notification_logs
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete notification logs" ON notification_logs
  FOR DELETE USING (is_admin(auth.uid()));
