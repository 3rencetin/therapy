import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleDetailView } from "@/components/guide/article-detail-view";
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
  return { title: article.title, description: article.excerpt };
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
