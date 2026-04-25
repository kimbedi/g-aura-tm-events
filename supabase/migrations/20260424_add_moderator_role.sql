-- Add 'moderator' role to the system

-- 1. Update RLS on gallery_items to include moderator
DROP POLICY IF EXISTS "Admins can delete/update gallery items" ON public.gallery_items;
CREATE POLICY "Admins and Mods can delete/update gallery items" ON public.gallery_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin', 'moderator'))
);

-- 2. Update RLS on orders (for validation)
-- (Assuming current policies use profile.role or ur.role_id)

-- 3. Update RLS on events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins and Mods can manage events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin', 'moderator'))
);

-- 4. Update RLS on merch
DROP POLICY IF EXISTS "Admins can manage merch" ON public.merch_products;
CREATE POLICY "Admins and Mods can manage merch" ON public.merch_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin', 'moderator'))
);
