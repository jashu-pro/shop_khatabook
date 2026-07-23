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

-- =========================================================================
-- CUSTOMERS SCHEMA & POLICIES SETUP
-- =========================================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  photo_path TEXT,
  village TEXT,
  address TEXT,
  notes TEXT,
  credit_limit NUMERIC DEFAULT 0 NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent duplicate customer phone numbers within the same shop (allows multiple nulls/empty)
  CONSTRAINT unique_shop_customer_phone UNIQUE (shop_id, phone)
);

-- Trigger function to automatically update updated_at timestamp on edit
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS and setup policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow owners access to their own shop's customers" ON public.customers;
CREATE POLICY "Allow owners access to their own shop's customers"
  ON public.customers FOR ALL
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Create public storage bucket for customer-photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('customer-photos', 'customer-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'customer-photos' bucket
DROP POLICY IF EXISTS "Allow public read access to customer-photos" ON storage.objects;
CREATE POLICY "Allow public read access to customer-photos"
  ON storage.objects FOR SELECT USING (bucket_id = 'customer-photos');

DROP POLICY IF EXISTS "Allow authenticated insert access to customer-photos" ON storage.objects;
CREATE POLICY "Allow authenticated insert access to customer-photos"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'customer-photos');

DROP POLICY IF EXISTS "Allow authenticated update access to customer-photos" ON storage.objects;
CREATE POLICY "Allow authenticated update access to customer-photos"
  ON storage.objects FOR UPDATE USING (bucket_id = 'customer-photos') WITH CHECK (bucket_id = 'customer-photos');

DROP POLICY IF EXISTS "Allow authenticated delete access to customer-photos" ON storage.objects;
CREATE POLICY "Allow authenticated delete access to customer-photos"
  ON storage.objects FOR DELETE USING (bucket_id = 'customer-photos');

-- =========================================================================
-- SALES & PAYMENTS SCHEMA SETUP
-- =========================================================================

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  sale_number TEXT NOT NULL,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  notes TEXT,
  bill_photo_url TEXT,
  bill_photo_path TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table (Pre-work for Phase 6)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  payment_amount NUMERIC NOT NULL CHECK (payment_amount > 0),
  payment_method TEXT DEFAULT 'cash' NOT NULL, -- cash, upi, bank_transfer
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger functions to automatically update updated_at timestamps
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database Indexes for high performance searches and joins
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON public.sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales(sale_date);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_shop_id ON public.payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

-- Enable RLS and setup policies
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow owners access to their own shop's sales" ON public.sales;
CREATE POLICY "Allow owners access to their own shop's sales"
  ON public.sales FOR ALL
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Allow owners access to their own shop's payments" ON public.payments;
CREATE POLICY "Allow owners access to their own shop's payments"
  ON public.payments FOR ALL
  USING (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM public.shops WHERE owner_id = auth.uid()));

-- Storage Bucket Policies for 'bill-attachments' (public bucket for bills pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('bill-attachments', 'bill-attachments', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read access to bill-attachments" ON storage.objects;
CREATE POLICY "Allow public read access to bill-attachments"
  ON storage.objects FOR SELECT USING (bucket_id = 'bill-attachments');

DROP POLICY IF EXISTS "Allow authenticated insert access to bill-attachments" ON storage.objects;
CREATE POLICY "Allow authenticated insert access to bill-attachments"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bill-attachments');

DROP POLICY IF EXISTS "Allow authenticated update access to bill-attachments" ON storage.objects;
CREATE POLICY "Allow authenticated update access to bill-attachments"
  ON storage.objects FOR UPDATE USING (bucket_id = 'bill-attachments') WITH CHECK (bucket_id = 'bill-attachments');

DROP POLICY IF EXISTS "Allow authenticated delete access to bill-attachments" ON storage.objects;
CREATE POLICY "Allow authenticated delete access to bill-attachments"
  ON storage.objects FOR DELETE USING (bucket_id = 'bill-attachments');




