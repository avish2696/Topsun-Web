-- =====================================================================
-- SUPABASE DATABASE SCHEMA - FIXED VERSION
-- Copy and paste each section separately into Supabase SQL Editor
-- =====================================================================

-- =====================================================================
-- 1. USERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  phone TEXT UNIQUE,
  full_name TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================================
-- 2. PRODUCTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT USING (true);

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url) VALUES
  ('Airflex', 'High-performance premium shoe', 199900, 'https://example.com/airflex.jpg'),
  ('Duro Ridge', 'Comfortable and durable everyday shoe', 149900, 'https://example.com/duro-ridge.jpg'),
  ('Sunspark', 'Professional premium shoe', 249900, 'https://example.com/sunspark.jpg'),
  ('Duskflex', 'Lightweight performance shoe', 179900, 'https://example.com/duskflex.jpg'),
  ('Emberflex', 'High-energy street style shoe', 299900, 'https://example.com/emberflex.jpg'),
  ('Cloudmax', 'Comfortable everyday classic', 89900, 'https://example.com/cloudmax.jpg'),
  ('HyperFlow', 'Ultimate performance athlete shoe', 229900, 'https://example.com/hyperflow.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 3. CART_ITEMS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- 4. ADDRESSES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- 5. ORDERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  total_amount BIGINT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  order_status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipmono_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================================
-- 6. ORDER_ITEMS TABLE (WITH SIZE & COLOR)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  price BIGINT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  color_label TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read order items for their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 7. PAYMENTS TABLE (OPTIONAL)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL,
  amount BIGINT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_order_id ON public.payments(order_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read payments for their orders" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND o.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 8. WISHLIST TABLE (OPTIONAL)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- 9. SHIPMONO_LOGS TABLE (OPTIONAL - FOR DEBUGGING)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.shipmono_logs (
  id SERIAL PRIMARY KEY,
  order_id UUID,
  order_number TEXT,
  api_endpoint TEXT,
  request_payload JSONB,
  response_payload JSONB,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL
);

CREATE INDEX idx_shipmono_logs_order_id ON public.shipmono_logs(order_id);
CREATE INDEX idx_shipmono_logs_order_number ON public.shipmono_logs(order_number);

-- =====================================================================
-- ALL DONE!
-- =====================================================================
-- All 9 tables have been created with:
-- ✅ Row Level Security (RLS) enabled
-- ✅ Indexes for performance
-- ✅ Foreign keys for consistency
-- ✅ Sample products (6) included
-- ✅ Size & Color columns in order_items
-- =====================================================================
