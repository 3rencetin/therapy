import { AdminArticlesClient } from "@/components/admin/admin-articles-client";
import { requireRole } from "@/lib/auth/require-session";
import { getServerTranslator } from "@/lib/i18n/server";
import { fetchAdminGuideArticles } from "@/lib/supabase/articles-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminGuidePage() {
  await requireRole("admin");
  const { t } = await getServerTranslator();
  const supabase = await createSupabaseServerClient();
  const articles = await fetchAdminGuideArticles(supabase).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.14em] text-muted-foreground uppercase">{t("admin.guide.kicker")}</p>
        <h1 className="font-display text-[1.85rem] tracking-[-0.03em]">{t("admin.guide.title")}</h1>
        <p className="text-[0.9rem] text-muted-foreground">{t("admin.guide.description")}</p>
      </header>
      <AdminArticlesClient articles={articles} />
    </div>
  );
}
