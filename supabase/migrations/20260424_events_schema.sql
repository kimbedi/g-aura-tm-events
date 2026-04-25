-- Events, Tickets, and Orders Schema for G-Aura TM Events

-- Events Table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket Categories Table
CREATE TABLE public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'VIP', 'Standard'
  price_usd NUMERIC(10, 2) NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table (When someone initiates checkout)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for guest checkouts if needed
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_category_id UUID REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price_usd NUMERIC(10, 2) NOT NULL,
  payment_method payment_method_type NOT NULL,
  payment_reference TEXT, -- SMS reference code from Mobile Money
  status order_status_type DEFAULT 'pending_validation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id)
);

-- Issued Tickets Table (Created ONLY after an order is validated)
CREATE TABLE public.issued_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_category_id UUID REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
  owner_name TEXT NOT NULL,
  qr_code_hash TEXT UNIQUE NOT NULL, -- The unique string embedded in the QR
  status ticket_status_type DEFAULT 'available', -- 'available' means not yet scanned
  scanned_at TIMESTAMPTZ,
  scanned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Events are public
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);

-- Ticket Categories are public
CREATE POLICY "Ticket categories viewable by everyone" ON public.ticket_categories FOR SELECT USING (true);

-- Orders
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (true); -- Allow public inserts for checkout
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view and update all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'finance'))
);

-- Issued Tickets
CREATE POLICY "Users can view their own tickets" ON public.issued_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = issued_tickets.order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins and Scanners can update tickets" ON public.issued_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'scanner'))
);
CREATE POLICY "Admins and Scanners can view all tickets" ON public.issued_tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'scanner'))
);

-- Insert Dummy Event for Testing
INSERT INTO public.events (title, location, date_time, is_premium) VALUES 
('G-Aura Exclusive Night', 'Pullman Kinshasa Grand Hotel', NOW() + INTERVAL '30 days', true);

INSERT INTO public.ticket_categories (event_id, name, price_usd, capacity)
SELECT id, 'VIP', 100.00, 50 FROM public.events WHERE title = 'G-Aura Exclusive Night';
