-- =====================================================================
-- SUPABASE DATABASE SCHEMA - E-Commerce Topsun
-- =====================================================================
-- This file contains all SQL statements to create the database tables
-- Copy and paste these into Supabase SQL Editor to create the schema
-- =====================================================================

-- 1. USERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT auth.uid(),
  phone TEXT,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  UNIQUE(phone),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================================
-- 2. PRODUCTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,  -- Stored in paise/cents (100 = 1 rupee)
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read products
CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT USING (true);

-- =====================================================================
-- 3. CART_ITEMS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own cart
CREATE POLICY "Users can read own cart" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own cart items
CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- 4. ADDRESSES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own addresses
CREATE POLICY "Users can read own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = false);

-- RLS Policy: Users can insert their own addresses
CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete (soft delete) their own addresses
CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- 5. ORDERS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,  -- Short ID like "TOPSUN-234567-892"
  total_amount BIGINT NOT NULL,  -- Stored in paise/cents
  payment_status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed
  payment_method TEXT NOT NULL DEFAULT 'razorpay',  -- razorpay, cod, card, wallet, etc.
  order_status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, shipped, delivered, cancelled
  items JSONB NOT NULL,  -- Array of ordered items with: product_id, product_name, price, quantity, size, color_label, image_url
  shipping_address JSONB NOT NULL,  -- Shipping address details
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shipmono_order_id TEXT,  -- Shipmono order ID when pushed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id)
);

-- Create index for order_number (frequently searched)
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own orders
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own orders
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================================
-- 6. ORDER_ITEMS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  price BIGINT NOT NULL,  -- Stored in paise/cents
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,  -- Size of the product (e.g., "UK 9")
  color_label TEXT,  -- Color of the product (e.g., "Black")
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for order_id (frequently joined)
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read order items for their orders
CREATE POLICY "Users can read order items for their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert order items for their orders
CREATE POLICY "Users can insert order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 7. PAYMENTS TABLE (Optional - for tracking payment details)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,  -- Stored in paise/cents
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for order_id
CREATE INDEX idx_payments_order_id ON public.payments(order_id);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read payments for their orders
CREATE POLICY "Users can read payments for their orders" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND o.user_id = auth.uid()
    )
  );

-- =====================================================================
-- 8. WISHLIST TABLE (Optional - if you have wishlist feature)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id SERIAL NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own wishlist
CREATE POLICY "Users can read own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can manage their own wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can remove from their own wishlist
CREATE POLICY "Users can remove from own wishlist" ON public.wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================================
-- 9. SHIPMONO_LOGS TABLE (Optional - for debugging)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.shipmono_logs (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number TEXT,
  api_endpoint TEXT,
  request_payload JSONB,
  response_payload JSONB,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for order_id and order_number
CREATE INDEX idx_shipmono_logs_order_id ON public.shipmono_logs(order_id);
CREATE INDEX idx_shipmono_logs_order_number ON public.shipmono_logs(order_number);

-- =====================================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================================

-- Sample Products
INSERT INTO public.products (name, description, price, image_url) VALUES
  ('Running Shoes', 'High-performance running shoes', 199900, 'https://example.com/running.jpg'),
  ('Casual Sneakers', 'Comfortable casual sneakers', 149900, 'https://example.com/casual.jpg'),
  ('Formal Shoes', 'Professional formal shoes', 249900, 'https://example.com/formal.jpg'),
  ('Sports Shoes', 'Lightweight sports shoes', 179900, 'https://example.com/sports.jpg'),
  ('Hiking Boots', 'Durable hiking boots', 299900, 'https://example.com/hiking.jpg'),
  ('Beach Sandals', 'Comfortable beach sandals', 89900, 'https://example.com/beach.jpg')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- VIEWS (Optional - useful for queries)
-- =====================================================================

-- View: User Orders with Item Count
CREATE OR REPLACE VIEW public.user_orders_summary AS
SELECT
  o.id,
  o.user_id,
  o.order_number,
  o.total_amount,
  o.payment_status,
  o.order_status,
  COUNT(oi.id) as item_count,
  o.created_at
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View: User Cart with Product Details
CREATE OR REPLACE VIEW public.user_cart_details AS
SELECT
  ci.id,
  ci.user_id,
  ci.product_id,
  p.name as product_name,
  p.price,
  p.image_url,
  ci.quantity,
  (p.price * ci.quantity) as total_price,
  ci.created_at
FROM public.cart_items ci
JOIN public.products p ON ci.product_id = p.id;

-- =====================================================================
-- FUNCTIONS (Optional - useful for common operations)
-- =====================================================================

-- Function: Get user's total spending
CREATE OR REPLACE FUNCTION get_user_total_spending(user_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN COALESCE(SUM(total_amount), 0)
  FROM public.orders
  WHERE user_id = $1 AND payment_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's order count
CREATE OR REPLACE FUNCTION get_user_order_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COUNT(*)::INTEGER
  FROM public.orders
  WHERE user_id = $1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- NOTES
-- =====================================================================
-- 1. All prices are stored in paise/cents (multiply by 100)
--    Example: 1999 rupees = 199900 paise
--
-- 2. JSONB fields (items, shipping_address, etc.) allow flexible data storage
--
-- 3. UUIDs are used for better security and distribution
--
-- 4. All tables have RLS (Row Level Security) enabled
--
-- 5. Indexes are created for frequently searched/joined columns
--
-- 6. Foreign keys use ON DELETE CASCADE to maintain referential integrity
--
-- 7. Timestamps are automatically updated with CURRENT_TIMESTAMP
--
-- 8. Sample products are inserted with ON CONFLICT DO NOTHING
--
-- =====================================================================
