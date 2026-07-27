-- ==========================================
-- SHOP KHATTABOOK - SUPABASE DATABASE SCHEMA
-- ==========================================
-- Copy and paste this script into your Supabase SQL Editor (https://supabase.com/dashboard/project/rlubzemockqflxwutszx/sql) and click "Run".

-- 1. SHOPS TABLE
CREATE TABLE IF NOT EXISTS public.shops (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    category TEXT DEFAULT 'Kirana & General Store',
    door_no TEXT,
    street TEXT,
    area TEXT,
    village_town TEXT NOT NULL,
    mandal TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT,
    gstin TEXT,
    pan TEXT,
    upi_id TEXT,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    village TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT ARRAY['Regular']::TEXT[],
    credit_limit NUMERIC DEFAULT 50000,
    credit_score INT DEFAULT 750,
    last_payment_date TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS / INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT,
    name TEXT NOT NULL,
    barcode TEXT,
    selling_price NUMERIC NOT NULL DEFAULT 0,
    purchase_price NUMERIC NOT NULL DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_alert INT DEFAULT 5,
    supplier_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREDIT SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    balance_due NUMERIC DEFAULT 0,
    bill_photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0
);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT,
    sale_id TEXT REFERENCES public.sales(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    method TEXT NOT NULL DEFAULT 'CASH',
    reference_no TEXT,
    bank_name TEXT,
    screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. KHATTA LEDGER ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT,
    entry_type TEXT NOT NULL, -- 'SALE' or 'PAYMENT'
    sale_id TEXT REFERENCES public.sales(id) ON DELETE SET NULL,
    payment_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    running_balance NUMERIC DEFAULT 0,
    description TEXT,
    entry_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES FOR FAST SEARCH
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_customer_id ON public.ledger_entries(customer_id);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR PUBLIC ACCESS (OR TAILORED AUTH POLICIES)
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- ANONYMOUS/AUTHENTICATED ACCESS POLICIES FOR DEMO AND APP USE
CREATE POLICY "Allow anon read/write shops" ON public.shops FOR ALL USING (true);
CREATE POLICY "Allow anon read/write customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Allow anon read/write categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow anon read/write products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow anon read/write sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow anon read/write sale_items" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Allow anon read/write payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow anon read/write ledger_entries" ON public.ledger_entries FOR ALL USING (true);

-- SEED INITIAL SHOP & CUSTOMER DATA
INSERT INTO public.shops (id, owner_id, name, category, village_town, district, state, pincode, upi_id)
VALUES ('shop-1', 'user-1', 'Sri Laxmi Traders', 'Kirana & General Store', 'Anantapur', 'Anantapur', 'Andhra Pradesh', '515001', 'srilaxmi@ybl')
ON CONFLICT (id) DO NOTHING;

-- 9. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read/write profiles" ON public.profiles FOR ALL USING (true);

INSERT INTO public.customers (id, shop_id, name, phone, village, credit_limit, credit_score)
VALUES 
  ('cust-1', 'shop-1', 'Venkatesh Rao', '9440112345', 'Tadipatri', 50000, 820),
  ('cust-2', 'shop-1', 'Kavitha Reddy', '9885067890', 'Dharmavaram', 30000, 750),
  ('cust-3', 'shop-1', 'Srinivasulu', '9949954321', 'Anantapur', 15000, 610)
ON CONFLICT (id) DO NOTHING;
