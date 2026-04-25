-- Merch E-commerce Schema for G-Aura TM Events

-- Merch Products Table
CREATE TABLE public.merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- e.g., 'T-Shirt', 'Hoodie', 'Accessory'
  base_price_usd NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Merch Variants Table (Sizes, Colors, Stock)
CREATE TABLE public.merch_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.merch_products(id) ON DELETE CASCADE,
  size TEXT, -- e.g., 'S', 'M', 'L', 'XL'
  color TEXT,
  sku TEXT UNIQUE NOT NULL,
  stock_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Products are public
CREATE POLICY "Merch products are viewable by everyone" ON public.merch_products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage merch products" ON public.merch_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);

-- Variants are public
CREATE POLICY "Merch variants viewable by everyone" ON public.merch_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage merch variants" ON public.merch_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);

-- Insert Dummy Merch Data
INSERT INTO public.merch_products (id, name, description, category, base_price_usd, image_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'G-Aura Oversized Heavyweight Tee', 'T-shirt premium 100% coton lourd. Coupe oversized avec logo G-Aura brodé.', 'T-Shirt', 45.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'),
('22222222-2222-2222-2222-222222222222', 'G-Aura Exclusive Cap', 'Casquette noire avec logo Gold minimaliste.', 'Accessory', 30.00, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80');

INSERT INTO public.merch_variants (product_id, size, color, sku, stock_count) VALUES 
('11111111-1111-1111-1111-111111111111', 'M', 'Black', 'TSH-GA-BLK-M', 50),
('11111111-1111-1111-1111-111111111111', 'L', 'Black', 'TSH-GA-BLK-L', 50),
('22222222-2222-2222-2222-222222222222', 'One Size', 'Black/Gold', 'CAP-GA-BLK-OS', 100);
