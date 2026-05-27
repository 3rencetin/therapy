"use client";

import type { GuideArticleRow } from "@/lib/supabase/articles-repository";

import { useI18n } from "@/components/i18n/i18n-provider";

import { GuideArticleCard } from "./article-card";

export function GuideHub({ articles }: { articles: GuideArticleRow[] }) {
  const { t } = useI18n();

  if (articles.length === 0) {
    return (
      <div className="surface-premium rounded-[var(--radius-xl)] p-10 text-center">
        <p className="font-display text-lg tracking-[-0.02em]">{t("guide.emptyTitle")}</p>
        <p className="mt-2 text-[0.9rem] text-muted-foreground">{t("guide.emptyBody")}</p>
      </div>
    );
  }

  const featured =
    articles.find((a) => a.is_featured) ?? articles[0];
  const rest = articles.filter((a) => a.id !== featured.id);
  const side = rest.slice(0, 3);
  const grid = rest.slice(3);

  return (
    <div className="space-y-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <GuideArticleCard article={featured} variant="featured" />
        <div className="flex flex-col gap-4">
          {side.map((a) => (
            <GuideArticleCard key={a.id} article={a} variant="compact" />
          ))}
        </div>
      </div>

      {grid.length > 0 ? (
        <section className="space-y-6">
          <h2 className="font-display text-[1.35rem] tracking-[-0.02em]">{t("guide.allArticles")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((a) => (
              <GuideArticleCard key={a.id} article={a} variant="grid" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
