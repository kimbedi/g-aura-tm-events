-- Restrict gallery deletion to Admins only

-- 1. Redefine Gallery Manage policy (Split into Select/Insert and Delete)
DROP POLICY IF EXISTS "Admins and Managers can manage gallery items" ON public.gallery_items;

-- All staff (Manager, Scanner, Admin) can Add
CREATE POLICY "Staff can add gallery items" ON public.gallery_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin', 'manager', 'scanner'))
);

-- Only Admins can Delete or Update
CREATE POLICY "Admins can delete/update gallery items" ON public.gallery_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name_key IN ('super_admin', 'admin'))
);

-- 2. Storage Policies: Restrict file deletion too
DROP POLICY IF EXISTS "Staff Delete" ON storage.objects;
CREATE POLICY "Admins Delete Storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('super_admin', 'admin')
  )
);
