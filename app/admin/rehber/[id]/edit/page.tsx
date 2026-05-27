import { notFound } from "next/navigation";

import { ArticleEditorForm } from "@/components/admin/article-editor-form";
import { requireRole } from "@/lib/auth/require-session";
import { fetchGuideArticleById } from "@/lib/supabase/articles-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminEditGuideArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const article = await fetchGuideArticleById(supabase, id).catch(() => null);
  if (!article) notFound();

  return <ArticleEditorForm article={article} />;
}
