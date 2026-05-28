import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleDetailView } from "@/components/guide/article-detail-view";
import { resolveGuideArticleForLocale } from "@/lib/articles/localized-content";
import { getServerLocale } from "@/lib/i18n/server";
import { fetchPublishedGuideArticleBySlug } from "@/lib/supabase/articles-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const article = await fetchPublishedGuideArticleBySlug(supabase, slug).catch(() => null);
  if (!article) return { title: "Bilgi köşesi" };
  const locale = await getServerLocale();
  const content = resolveGuideArticleForLocale(article, locale);
  return { title: content.title, description: content.excerpt };
}

export default async function GuideArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const article = await fetchPublishedGuideArticleBySlug(supabase, slug).catch(() => null);
  if (!article) notFound();

  return (
    <div className="pb-16 pt-2">
      <ArticleDetailView article={article} />
    </div>
  );
}
