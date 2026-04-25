-- Switch every RLS policy that still queried public.user_roles over to
-- public.profiles.role, the single source of truth the application code
-- already uses. user_roles ended up empty for every account, so the old
-- policies silently denied all admin/scanner SELECT/UPDATE traffic — that's
-- why /admin/tickets, /admin/payments and the dashboard all read 0 rows.

-- 1. Helper that runs SECURITY DEFINER so it bypasses RLS on profiles itself
--    (avoids the classic "infinite recursion in policy" trap).
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role = ANY(allowed_roles)
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role(text[]) TO anon, authenticated;

-- 2. Drop every policy that depended on the legacy user_roles model.
DROP POLICY IF EXISTS "Admins can manage events"            ON public.events;
DROP POLICY IF EXISTS "Admins and Managers can manage events" ON public.events;
DROP POLICY IF EXISTS "Admins and Mods can manage events"   ON public.events;
DROP POLICY IF EXISTS "Admins and Scanners can view all tickets" ON public.issued_tickets;
DROP POLICY IF EXISTS "Admins and Scanners can update tickets"   ON public.issued_tickets;
DROP POLICY IF EXISTS "Staff can update tickets"            ON public.issued_tickets;
DROP POLICY IF EXISTS "Admins can view and update all orders"    ON public.orders;
DROP POLICY IF EXISTS "Admins can manage merch products"    ON public.merch_products;
DROP POLICY IF EXISTS "Admins and Managers can manage merch products" ON public.merch_products;
DROP POLICY IF EXISTS "Admins can manage merch variants"    ON public.merch_variants;
DROP POLICY IF EXISTS "Super Admins can manage commissions" ON public.platform_commissions;
DROP POLICY IF EXISTS "Public profiles are viewable by admins." ON public.profiles;

-- 3. Recreate using profiles.role via has_role().

-- events: super_admin / admin / manager / moderator can manage everything
CREATE POLICY "Admins manage events"
  ON public.events FOR ALL
  USING (public.has_role(ARRAY['super_admin','admin','manager','moderator']));

-- issued_tickets: scanners need read + update; admins need full read
CREATE POLICY "Admins and scanners view all tickets"
  ON public.issued_tickets FOR SELECT
  USING (public.has_role(ARRAY['super_admin','admin','scanner','manager','moderator']));

CREATE POLICY "Admins and scanners update tickets"
  ON public.issued_tickets FOR UPDATE
  USING (public.has_role(ARRAY['super_admin','admin','scanner','manager','moderator']));

-- orders: admins + finance can read and mutate everything
CREATE POLICY "Admins manage all orders"
  ON public.orders FOR ALL
  USING (public.has_role(ARRAY['super_admin','admin','finance','manager','moderator']));

-- merch_products / merch_variants: admins + managers
CREATE POLICY "Admins manage merch products"
  ON public.merch_products FOR ALL
  USING (public.has_role(ARRAY['super_admin','admin','manager','moderator']));

CREATE POLICY "Admins manage merch variants"
  ON public.merch_variants FOR ALL
  USING (public.has_role(ARRAY['super_admin','admin','manager','moderator']));

-- platform_commissions: only super_admin can read/write
CREATE POLICY "Super admins manage commissions"
  ON public.platform_commissions FOR ALL
  USING (public.has_role(ARRAY['super_admin']));

-- profiles: keep "Users can view own profile" + the existing
-- profiles_admin_policy/profiles_update_admin (those use check_is_admin()).
-- We just remove the obsolete user_roles-based duplicate.
