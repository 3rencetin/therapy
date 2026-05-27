import type { Metadata } from "next";

import { GuideHub } from "@/components/guide/guide-hub";
import { getServerTranslator } from "@/lib/i18n/server";
import { fetchPublishedGuideArticles } from "@/lib/supabase/articles-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("guide.metaTitle"),
    description: t("guide.metaDescription"),
  };
}

export default async function GuideListPage() {
  const { t } = await getServerTranslator();
  const supabase = await createSupabaseServerClient();
  const articles = await fetchPublishedGuideArticles(supabase).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-[#007AFF] uppercase">{t("guide.kicker")}</p>
        <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.35rem)] tracking-[-0.03em]">{t("guide.title")}</h1>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">{t("guide.subtitle")}</p>
      </header>
      <GuideHub articles={articles} />
    </div>
  );
}
