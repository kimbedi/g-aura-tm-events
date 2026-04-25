-- Final Schema Setup for G-Aura TM Events

-- 1. Platform Commissions (Ledger for Quebec Koho Account)
CREATE TABLE public.platform_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  gross_amount_usd NUMERIC(10, 2) NOT NULL,
  commission_amount_usd NUMERIC(10, 2) NOT NULL, -- 15%
  net_amount_usd NUMERIC(10, 2) NOT NULL, -- 85%
  payout_status TEXT DEFAULT 'pending', -- 'pending', 'paid_to_koho'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage commissions" ON public.platform_commissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key = 'super_admin')
);

-- 2. Auth Trigger to Auto-Create Profiles on Signup
-- This ensures when someone registers via the /register page, they get a profile
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number'
  );
  
  -- By default, give them a 'user' role or nothing. If you want the first user to be super_admin:
  -- You can manually assign roles in the DB later.
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Function to automatically calculate 15% commission when an order is completed
CREATE OR REPLACE FUNCTION public.calculate_commission()
RETURNS trigger AS $$
BEGIN
  -- If order status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.platform_commissions (order_id, gross_amount_usd, commission_amount_usd, net_amount_usd)
    VALUES (
      NEW.id,
      NEW.total_price_usd,
      NEW.total_price_usd * 0.15, -- 15% for Koho
      NEW.total_price_usd * 0.85  -- 85% for Kinshasa
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_completed ON public.orders;
CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.calculate_commission();
