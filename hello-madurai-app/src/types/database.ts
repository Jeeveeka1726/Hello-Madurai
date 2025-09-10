export type UserRole = 'user' | 'admin' | 'moderator';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type NewsCategory = 'collector' | 'corporation' | 'police' | 'agriculture' | 'cinema' | 'articles' | 'jobs';
export type VideoCategory = 'business' | 'agriculture' | 'hotel' | 'medical' | 'vehicle' | 'pets';
export type DirectoryCategory = 'medical' | 'education' | 'business' | 'restaurant' | 'transport' | 'government' | 'shops' | 'services';
export type EventType = 'festival' | 'exhibition' | 'cultural' | 'government' | 'business';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  title: string;
  title_ta?: string;
  content: string;
  content_ta?: string;
  excerpt?: string;
  excerpt_ta?: string;
  category: NewsCategory;
  featured_image?: string;
  status: ContentStatus;
  author_id?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Video {
  id: string;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  category: VideoCategory;
  youtube_url?: string;
  video_file_url?: string;
  thumbnail_url?: string;
  is_self_uploaded: boolean;
  status: ContentStatus;
  author_id?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface RadioContent {
  id: string;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  audio_file_url: string;
  duration?: number;
  status: ContentStatus;
  author_id?: string;
  plays_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Event {
  id: string;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  event_type: EventType;
  event_date: string;
  end_date?: string;
  location?: string;
  location_ta?: string;
  location_map_url?: string;
  featured_image?: string;
  status: ContentStatus;
  author_id?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Magazine {
  id: string;
  title: string;
  title_ta?: string;
  description?: string;
  description_ta?: string;
  month: number;
  year: number;
  pdf_file_url: string;
  cover_image_url?: string;
  status: ContentStatus;
  author_id?: string;
  download_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Directory {
  id: string;
  business_name: string;
  business_name_ta?: string;
  description?: string;
  description_ta?: string;
  category: DirectoryCategory;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address: string;
  address_ta?: string;
  location_map_url?: string;
  website_url?: string;
  featured_image?: string;
  status: ContentStatus;
  author_id?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  images?: DirectoryImage[];
  videos?: DirectoryVideo[];
}

export interface DirectoryImage {
  id: string;
  directory_id: string;
  image_url: string;
  caption?: string;
  caption_ta?: string;
  sort_order: number;
  created_at: string;
}

export interface DirectoryVideo {
  id: string;
  directory_id: string;
  video_url: string;
  title?: string;
  title_ta?: string;
  sort_order: number;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  title_ta?: string;
  description: string;
  description_ta?: string;
  company_name: string;
  company_name_ta?: string;
  location: string;
  location_ta?: string;
  salary_range?: string;
  experience_required?: string;
  contact_email?: string;
  contact_phone?: string;
  application_url?: string;
  status: ContentStatus;
  author_id?: string;
  views_count: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Tourism {
  id: string;
  name: string;
  name_ta?: string;
  description: string;
  description_ta?: string;
  category: string;
  address: string;
  address_ta?: string;
  location_map_url?: string;
  featured_image?: string;
  visiting_hours?: string;
  visiting_hours_ta?: string;
  entry_fee?: string;
  contact_info?: string;
  status: ContentStatus;
  author_id?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  images?: TourismImage[];
}

export interface TourismImage {
  id: string;
  tourism_id: string;
  image_url: string;
  caption?: string;
  caption_ta?: string;
  sort_order: number;
  created_at: string;
}

export interface WeatherUpdate {
  id: string;
  date: string;
  temperature_max?: number;
  temperature_min?: number;
  weather_condition: string;
  weather_condition_ta?: string;
  humidity?: number;
  rainfall?: number;
  wind_speed?: number;
  description?: string;
  description_ta?: string;
  author_id?: string;
  created_at: string;
}

export interface TransportSchedule {
  id: string;
  transport_type: string;
  route_name: string;
  route_name_ta?: string;
  departure_time: string;
  arrival_time?: string;
  departure_location: string;
  departure_location_ta?: string;
  arrival_location: string;
  arrival_location_ta?: string;
  frequency?: string;
  fare?: number;
  contact_info?: string;
  status: ContentStatus;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HelplineService {
  id: string;
  service_name: string;
  service_name_ta?: string;
  category: string;
  description?: string;
  description_ta?: string;
  phone_number: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  address_ta?: string;
  availability?: string;
  availability_ta?: string;
  status: ContentStatus;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content_type: string;
  content_id: string;
  user_id?: string;
  user_name?: string;
  comment_text: string;
  parent_comment_id?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface Reaction {
  id: string;
  content_type: string;
  content_id: string;
  user_id?: string;
  reaction_type: string;
  created_at: string;
}

// Database response types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      news: {
        Row: News;
        Insert: Omit<News, 'id' | 'created_at' | 'updated_at' | 'views_count'>;
        Update: Partial<Omit<News, 'id' | 'created_at' | 'updated_at'>>;
      };
      videos: {
        Row: Video;
        Insert: Omit<Video, 'id' | 'created_at' | 'updated_at' | 'views_count'>;
        Update: Partial<Omit<Video, 'id' | 'created_at' | 'updated_at'>>;
      };
      // Add other table types as needed
    };
  };
}
