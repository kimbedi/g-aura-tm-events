-- Initial Schema for G-Aura TM Events

-- Enums
CREATE TYPE payment_method_type AS ENUM ('mpesa', 'airtel_money', 'orange_money', 'cash');
CREATE TYPE ticket_status_type AS ENUM ('available', 'reserved', 'sold_out');
CREATE TYPE order_status_type AS ENUM ('pending_validation', 'completed', 'cancelled');

-- Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  language_pref TEXT DEFAULT 'fr',
  currency_pref TEXT DEFAULT 'CDF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles Table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_key TEXT UNIQUE NOT NULL, -- 'super_admin', 'admin', 'scanner', 'finance', 'user'
  description TEXT
);

-- User Roles Mapping
CREATE TABLE public.user_roles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Insert Default Roles
INSERT INTO public.roles (name_key, description) VALUES
  ('super_admin', 'Accès complet absolu'),
  ('admin', 'Gestion des événements et validations'),
  ('scanner', 'Accès uniquement au scan des billets (PWA Mobile)'),
  ('finance', 'Validation des paiements manuels et vue ledger'),
  ('user', 'Client standard');

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by admins." ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Roles Policies
CREATE POLICY "Roles are viewable by everyone." ON public.roles FOR SELECT USING (true);

-- User Roles Policies
CREATE POLICY "User roles viewable by admins." ON public.user_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);
CREATE POLICY "Users can view own roles." ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- Trigger to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Assign 'user' role by default
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT new.id, id FROM public.roles WHERE name_key = 'user' LIMIT 1;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
