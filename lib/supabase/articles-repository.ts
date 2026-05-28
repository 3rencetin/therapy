import type { GuideArticleTranslations } from "@/lib/articles/localized-content";
import type { AppSupabaseClient } from "@/lib/supabase/app-client";

const GUIDE_ARTICLE_COLUMNS =
  "id, slug, title, excerpt, cover_image_url, category, tags, body, translations, status, is_featured, published_at, author_id, created_at, updated_at";

export type GuideArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  body: string;
  translations: GuideArticleTranslations;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchPublishedGuideArticles(
  client: AppSupabaseClient,
): Promise<GuideArticleRow[]> {
  const { data, error } = await client
    .from("guide_articles")
    .select(GUIDE_ARTICLE_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return normalizeGuideArticles(data);
}

export async function fetchPublishedGuideArticleBySlug(
  client: AppSupabaseClient,
  slug: string,
): Promise<GuideArticleRow | null> {
  const { data, error } = await client
    .from("guide_articles")
    .select(GUIDE_ARTICLE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeGuideArticle(data) : null;
}

export async function fetchAdminGuideArticles(client: AppSupabaseClient): Promise<GuideArticleRow[]> {
  const { data, error } = await client
    .from("guide_articles")
    .select(GUIDE_ARTICLE_COLUMNS)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return normalizeGuideArticles(data);
}

export async function fetchGuideArticleById(
  client: AppSupabaseClient,
  id: string,
): Promise<GuideArticleRow | null> {
  const { data, error } = await client
    .from("guide_articles")
    .select(GUIDE_ARTICLE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeGuideArticle(data) : null;
}

function normalizeGuideArticles(rows: unknown): GuideArticleRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => normalizeGuideArticle(row));
}

function normalizeGuideArticle(row: unknown): GuideArticleRow {
  const article = row as GuideArticleRow;
  return {
    ...article,
    translations: article.translations ?? {},
  };
}
