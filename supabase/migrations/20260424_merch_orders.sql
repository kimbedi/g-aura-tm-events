-- Merch Orders Table
CREATE TABLE public.merch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.merch_products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES public.merch_variants(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price_usd NUMERIC(10, 2) NOT NULL,
  payment_method payment_method_type NOT NULL,
  payment_reference TEXT,
  status order_status_type DEFAULT 'pending_validation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own merch orders" ON public.merch_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own merch orders" ON public.merch_orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage merch orders" ON public.merch_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);
