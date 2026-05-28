-- Bilgi köşesi: locale bazlı çeviri önbelleği (ör. { "en": { "title", "excerpt", "body" } })

ALTER TABLE public.guide_articles
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.guide_articles.translations IS
  'Locale anahtarlı çeviri: { "en": { "title", "excerpt", "body" } }. Birincil dil TR alanlarında.';

ALTER TABLE public.guide_articles
  ADD CONSTRAINT guide_articles_translations_object
  CHECK (jsonb_typeof(translations) = 'object');
