-- The 'gallery' bucket is used by /admin/gallery (event photos) and
-- /admin/merch (product images, stored under the merch/ prefix).
-- It was never created in the linked project, which is why every
-- upload from those pages silently failed.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 10485760, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read so the rendered <img src="..."> works for everyone.
DROP POLICY IF EXISTS "Public read on gallery" ON storage.objects;
CREATE POLICY "Public read on gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Only admin / manager / moderator can upload, replace and delete.
-- Uses the same has_role() helper introduced for the rest of the app.
DROP POLICY IF EXISTS "Staff Upload" ON storage.objects;
DROP POLICY IF EXISTS "Staff write to gallery" ON storage.objects;
CREATE POLICY "Staff write to gallery"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery'
  AND public.has_role(ARRAY['super_admin','admin','manager','moderator'])
);

DROP POLICY IF EXISTS "Staff Delete" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete on gallery" ON storage.objects;
CREATE POLICY "Staff delete on gallery"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery'
  AND public.has_role(ARRAY['super_admin','admin','manager','moderator'])
);

DROP POLICY IF EXISTS "Staff update on gallery" ON storage.objects;
CREATE POLICY "Staff update on gallery"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery'
  AND public.has_role(ARRAY['super_admin','admin','manager','moderator'])
);
