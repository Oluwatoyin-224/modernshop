/*
# Create shop schema: products, orders, order_items

1. New Tables
- `products`: id (uuid PK), name (text), description (text), price (numeric), image_url (text), created_at (timestamptz)
- `orders`: id (uuid PK), customer_name (text), email (text), phone (text), address (text), total (numeric), status (text default 'pending'), created_at (timestamptz)
- `order_items`: id (uuid PK), order_id (uuid FK -> orders), product_id (uuid FK -> products), quantity (int), price (numeric)

2. Relationships
- order_items.order_id -> orders.id (CASCADE delete)
- order_items.product_id -> products.id (RESTRICT delete)

3. Security
- RLS enabled on all tables.
- products: public read (anon + authenticated), no public write (seeded via service role).
- orders: public insert (anon + authenticated) so guests can place orders; public read so the success page can display order details; no update/delete from the client.
- order_items: public insert + read (anon + authenticated), no update/delete from the client.
- This is a single-tenant shop with no per-user data isolation requirement.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity int NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: public read only
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT
TO anon, authenticated USING (true);

-- Orders: public insert and read (guest checkout)
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Order items: public insert and read
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
