-- article-covers bucket ve politikaları (00014 atlanmış veya kısmen uygulanmışsa)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-covers',
  'article-covers',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS article_covers_public_read ON storage.objects;
CREATE POLICY article_covers_public_read ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-covers');

DROP POLICY IF EXISTS article_covers_admin_insert ON storage.objects;
CREATE POLICY article_covers_admin_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-covers' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS article_covers_admin_update ON storage.objects;
CREATE POLICY article_covers_admin_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-covers' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'article-covers' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS article_covers_admin_delete ON storage.objects;
CREATE POLICY article_covers_admin_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-covers' AND public.is_admin(auth.uid()));
