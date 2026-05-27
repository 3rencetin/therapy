-- Bilgi köşesi makaleleri + kapak görselleri

CREATE TABLE IF NOT EXISTS public.guide_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  cover_image_url text,
  category text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guide_articles_slug_key UNIQUE (slug),
  CONSTRAINT guide_articles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT guide_articles_title_len CHECK (char_length(title) <= 300),
  CONSTRAINT guide_articles_excerpt_len CHECK (char_length(excerpt) <= 600),
  CONSTRAINT guide_articles_body_len CHECK (char_length(body) <= 200000)
);

CREATE INDEX IF NOT EXISTS guide_articles_published_idx
  ON public.guide_articles (status, published_at DESC NULLS LAST)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS guide_articles_category_idx ON public.guide_articles (category)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS guide_articles_featured_idx ON public.guide_articles (is_featured)
  WHERE status = 'published' AND is_featured = true;

DROP TRIGGER IF EXISTS guide_articles_updated ON public.guide_articles;
CREATE TRIGGER guide_articles_updated
  BEFORE UPDATE ON public.guide_articles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

COMMENT ON TABLE public.guide_articles IS 'Bilgi köşesi — psikoloji ve terapi odaklı okuma içerikleri.';

ALTER TABLE public.guide_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY guide_articles_select_published ON public.guide_articles
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND published_at <= now()
  );

CREATE POLICY guide_articles_select_staff ON public.guide_articles
  FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY guide_articles_insert_admin ON public.guide_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY guide_articles_update_admin ON public.guide_articles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY guide_articles_delete_admin ON public.guide_articles
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Kapak görselleri (public okuma)
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

CREATE POLICY article_covers_public_read ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-covers');

CREATE POLICY article_covers_admin_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-covers' AND public.is_admin(auth.uid()));

CREATE POLICY article_covers_admin_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-covers' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'article-covers' AND public.is_admin(auth.uid()));

CREATE POLICY article_covers_admin_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-covers' AND public.is_admin(auth.uid()));
