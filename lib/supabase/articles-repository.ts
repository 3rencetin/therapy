import type { AppSupabaseClient } from "@/lib/supabase/app-client";

export type GuideArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  body: string;
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
    .select(
      "id, slug, title, excerpt, cover_image_url, category, tags, body, status, is_featured, published_at, author_id, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GuideArticleRow[];
}

export async function fetchPublishedGuideArticleBySlug(
  client: AppSupabaseClient,
  slug: string,
): Promise<GuideArticleRow | null> {
  const { data, error } = await client
    .from("guide_articles")
    .select(
      "id, slug, title, excerpt, cover_image_url, category, tags, body, status, is_featured, published_at, author_id, created_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return (data as GuideArticleRow | null) ?? null;
}

export async function fetchAdminGuideArticles(client: AppSupabaseClient): Promise<GuideArticleRow[]> {
  const { data, error } = await client
    .from("guide_articles")
    .select(
      "id, slug, title, excerpt, cover_image_url, category, tags, body, status, is_featured, published_at, author_id, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GuideArticleRow[];
}

export async function fetchGuideArticleById(
  client: AppSupabaseClient,
  id: string,
): Promise<GuideArticleRow | null> {
  const { data, error } = await client
    .from("guide_articles")
    .select(
      "id, slug, title, excerpt, cover_image_url, category, tags, body, status, is_featured, published_at, author_id, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as GuideArticleRow | null) ?? null;
}
