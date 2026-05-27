"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { ArticleBody } from "@/components/guide/article-body";
import { formatGuideDate } from "@/lib/articles/format-date";
import type { GuideArticleRow } from "@/lib/supabase/articles-repository";

export function ArticleDetailView({ article }: { article: GuideArticleRow }) {
  const { t, locale } = useI18n();
  const date = formatGuideDate(article.published_at, locale);

  return (
    <article className="mx-auto max-w-3xl">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[0.8rem] text-muted-foreground">
        <Link href="/dashboard" className="hover:text-[#007AFF]">
          {t("guide.breadcrumbHome")}
        </Link>
        <ChevronRight className="size-3.5 opacity-60" />
        <Link href="/dashboard/rehber" className="hover:text-[#007AFF]">
          {t("guide.breadcrumbGuide")}
        </Link>
        <ChevronRight className="size-3.5 opacity-60" />
        <span className="truncate text-foreground/80">{article.title}</span>
      </nav>

      <div className="relative">
        <header className="overflow-hidden rounded-t-[1.35rem] bg-[#0d3b66] px-6 pb-[4.5rem] pt-8 text-white sm:px-10 sm:pb-[5.5rem] sm:pt-10">
          <p className="text-[0.72rem] font-semibold tracking-[0.14em] text-[#7ec8e8] uppercase">
            {article.category}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-[clamp(1.55rem,4vw,2.2rem)] leading-[1.12] tracking-[-0.03em]">
            {article.title}
          </h1>
        </header>

        {article.cover_image_url ? (
          <div className="relative z-10 -mt-[3.25rem] mb-8 px-4 sm:-mt-[4.25rem] sm:px-8">
            <div className="overflow-hidden rounded-[1.15rem] border border-white/20 bg-card shadow-[0_20px_50px_-12px_rgba(13,59,102,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.cover_image_url}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="h-4 rounded-b-[1.35rem] bg-[#0d3b66]" />
        )}
      </div>

      <div className="space-y-4 px-1 sm:px-2">
        {date ? <p className="text-[0.85rem] text-muted-foreground">{date}</p> : null}
        {article.tags.length > 0 ? (
          <p className="flex flex-wrap gap-2 text-[0.75rem] text-muted-foreground">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5">
                #{tag}
              </span>
            ))}
          </p>
        ) : null}
        <ArticleBody body={article.body} />
      </div>
    </article>
  );
}
