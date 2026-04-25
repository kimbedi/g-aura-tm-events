-- Update policies to include 'manager' role

-- 1. Events: Manager can manage everything
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins and Managers can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'manager'))
);

-- 2. Issued Tickets: Manager can scan (update status)
DROP POLICY IF EXISTS "Admins and Scanners can update tickets" ON public.issued_tickets;
CREATE POLICY "Staff can update tickets" ON public.issued_tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'scanner', 'manager'))
);

-- 3. Gallery: Manager can manage
DROP POLICY IF EXISTS "Admins can manage gallery items" ON public.gallery_items;
CREATE POLICY "Admins and Managers can manage gallery items" ON public.gallery_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'manager'))
);

-- 4. Merch Products: Manager can manage
DROP POLICY IF EXISTS "Admins can manage merch products" ON public.merch_products;
CREATE POLICY "Admins and Managers can manage merch products" ON public.merch_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'manager'))
);
