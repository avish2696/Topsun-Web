-- ============================================================================
-- TOPSUN DEFINITIVE DATABASE & FOREIGN KEY FIX (RUN IN SUPABASE SQL EDITOR)
-- ============================================================================

-- 1. REMOVE FOREIGN KEY CONSTRAINT ON ORDERS (Allows Phone & Guest Checkouts)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. ENSURE ALL TABLES EXIST
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  total_amount BIGINT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  price BIGINT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color_label TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_banner_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  offer_title TEXT NOT NULL DEFAULT 'Flash Deal',
  offer_subtitle TEXT DEFAULT 'Grab your pair before the deal ends',
  end_time TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '2 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. UNLOCK RLS POLICIES FOR ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

-- 4. UNLOCK RLS POLICIES FOR ORDER_ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public select order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can read order items for their orders" ON public.order_items;

CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select order_items" ON public.order_items FOR SELECT USING (true);

-- 5. UNLOCK RLS POLICIES FOR PAYMENTS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert payments" ON public.payments;
DROP POLICY IF EXISTS "Allow public select payments" ON public.payments;
DROP POLICY IF EXISTS "Users can read payments for their orders" ON public.payments;

CREATE POLICY "Allow public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select payments" ON public.payments FOR SELECT USING (true);

-- 6. UNLOCK RLS POLICIES FOR SALES_BANNER_SETTINGS
ALTER TABLE public.sales_banner_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select sales_banner_settings" ON public.sales_banner_settings;
DROP POLICY IF EXISTS "Allow public update sales_banner_settings" ON public.sales_banner_settings;
DROP POLICY IF EXISTS "Allow public insert sales_banner_settings" ON public.sales_banner_settings;

CREATE POLICY "Allow public select sales_banner_settings" ON public.sales_banner_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update sales_banner_settings" ON public.sales_banner_settings FOR UPDATE USING (true);
CREATE POLICY "Allow public insert sales_banner_settings" ON public.sales_banner_settings FOR INSERT WITH CHECK (true);

-- 7. INSERT DEFAULT SALES BANNER IF NOT PRESENT
INSERT INTO public.sales_banner_settings (id, offer_title, offer_subtitle, end_time, is_active)
VALUES ('default', 'Flash Deal', 'Grab your pair before the deal ends', NOW() + INTERVAL '2 days', true)
ON CONFLICT (id) DO NOTHING;
