import { ArticleEditorForm } from "@/components/admin/article-editor-form";
import { requireRole } from "@/lib/auth/require-session";

export default async function AdminNewGuideArticlePage() {
  await requireRole("admin");
  return <ArticleEditorForm />;
}
