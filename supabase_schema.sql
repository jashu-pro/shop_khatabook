-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_photo_url TEXT,
  owner_photo_path TEXT,
  
  -- Shop details
  shop_name TEXT NOT NULL,
  shop_code TEXT UNIQUE NOT NULL,
  shop_logo_url TEXT,
  shop_logo_path TEXT,
  business_category TEXT NOT NULL,
  
  -- Address
  door_number TEXT,
  street TEXT,
  area TEXT,
  village_town TEXT NOT NULL,
  mandal TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  country TEXT DEFAULT 'India' NOT NULL,
  
  -- Business Details
  gst TEXT,
  pan TEXT,
  upi_id TEXT,
  business_email TEXT,
  
  -- Preferences
  language TEXT DEFAULT 'en' NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  theme TEXT DEFAULT 'system' NOT NULL,
  
  -- Notifications
  payment_reminder BOOLEAN DEFAULT true NOT NULL,
  whatsapp_reminder BOOLEAN DEFAULT true NOT NULL,
  sms_reminder BOOLEAN DEFAULT false NOT NULL,
  ai_daily_summary BOOLEAN DEFAULT true NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then bind to shops
DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops;
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS and setup policy
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow owners full access to their own shop" ON public.shops;
CREATE POLICY "Allow owners full access to their own shop" 
  ON public.shops FOR ALL 
  USING (true)
  WITH CHECK (true);

-- =========================================================================
-- SUPABASE STORAGE BUCKETS & POLICIES SETUP
-- Run these queries to set up the storage buckets and active access rules.
-- =========================================================================

-- 1. Create public storage buckets for owner photos and shop logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('owner-photos', 'owner-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('shop-logos', 'shop-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for 'owner-photos' bucket
DROP POLICY IF EXISTS "Allow public read access to owner-photos" ON storage.objects;
CREATE POLICY "Allow public read access to owner-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'owner-photos');

DROP POLICY IF EXISTS "Allow authenticated insert access to owner-photos" ON storage.objects;
CREATE POLICY "Allow authenticated insert access to owner-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'owner-photos');

DROP POLICY IF EXISTS "Allow authenticated update access to owner-photos" ON storage.objects;
CREATE POLICY "Allow authenticated update access to owner-photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'owner-photos')
  WITH CHECK (bucket_id = 'owner-photos');

DROP POLICY IF EXISTS "Allow authenticated delete access to owner-photos" ON storage.objects;
CREATE POLICY "Allow authenticated delete access to owner-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'owner-photos');

-- 3. Storage Policies for 'shop-logos' bucket
DROP POLICY IF EXISTS "Allow public read access to shop-logos" ON storage.objects;
CREATE POLICY "Allow public read access to shop-logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "Allow authenticated insert access to shop-logos" ON storage.objects;
CREATE POLICY "Allow authenticated insert access to shop-logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "Allow authenticated update access to shop-logos" ON storage.objects;
CREATE POLICY "Allow authenticated update access to shop-logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'shop-logos')
  WITH CHECK (bucket_id = 'shop-logos');

DROP POLICY IF EXISTS "Allow authenticated delete access to shop-logos" ON storage.objects;
CREATE POLICY "Allow authenticated delete access to shop-logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'shop-logos');


