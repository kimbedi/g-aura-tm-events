-- Create a storage bucket for the gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Allow public access to read gallery images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gallery' );

-- 2. Allow authenticated users (Staff) to upload images
CREATE POLICY "Staff Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' AND
  (auth.role() = 'authenticated')
);

-- 3. Allow Staff to delete images
CREATE POLICY "Staff Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' AND
  (auth.role() = 'authenticated')
);
