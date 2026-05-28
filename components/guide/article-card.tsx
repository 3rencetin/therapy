"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { formatGuideDate } from "@/lib/articles/format-date";
import { resolveGuideArticleForLocale } from "@/lib/articles/localized-content";
import type { GuideArticleRow } from "@/lib/supabase/articles-repository";
import { cn } from "@/lib/utils";

function CoverImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div
        className={cn(
          "bg-[linear-gradient(135deg,var(--apple-tint-sky),var(--apple-tint-indigo))]",
          className,
        )}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("object-cover", className)} loading="lazy" />
  );
}

export function GuideArticleCard({
  article,
  variant = "grid",
}: {
  article: GuideArticleRow;
  variant?: "grid" | "compact" | "featured";
}) {
  const { t, locale } = useI18n();
  const content = resolveGuideArticleForLocale(article, locale);
  const href = `/dashboard/rehber/${article.slug}`;
  const date = formatGuideDate(article.published_at, locale);

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex gap-4 rounded-2xl border border-border/55 bg-card p-3 transition hover:border-[#007AFF]/25 hover:shadow-md"
      >
        <CoverImage
          src={article.cover_image_url}
          alt=""
          className="size-[5.5rem] shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
            <span className="font-medium text-[#007AFF]">#{article.category.replace(/\s+/g, "")}</span>
            {date ? <span>{date}</span> : null}
          </div>
          <h3 className="mt-1 line-clamp-2 font-display text-[1rem] leading-snug tracking-[-0.02em] group-hover:text-[#007AFF]">
            {content.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-muted-foreground">
            {content.excerpt}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[1.25rem] border border-border/55 bg-card">
        <CoverImage src={article.cover_image_url} alt="" className="aspect-[16/10] w-full" />
        <div className="space-y-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.72rem] text-muted-foreground">
            <span className="rounded-full bg-[#007AFF]/10 px-2.5 py-0.5 font-semibold text-[#007AFF]">
              {article.category}
            </span>
            {date ? <span>{date}</span> : null}
          </div>
          <h2 className="font-display text-[clamp(1.35rem,2.5vw,1.75rem)] leading-tight tracking-[-0.03em] group-hover:text-[#007AFF]">
            {content.title}
          </h2>
          <p className="line-clamp-3 text-[0.9rem] leading-relaxed text-muted-foreground">{content.excerpt}</p>
          <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[#007AFF]">
            {t("guide.readMore")}
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-border/55 bg-card transition hover:border-[#007AFF]/22 hover:shadow-[var(--shadow-card-hover)]"
    >
      <CoverImage src={article.cover_image_url} alt="" className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-[0.7rem]">
          <span className="rounded-full bg-[#0d3b66] px-2 py-0.5 font-semibold text-white">{article.category}</span>
          {date ? <span className="text-muted-foreground">{date}</span> : null}
        </div>
        <h3 className="mt-3 line-clamp-2 font-display text-[1.05rem] leading-snug tracking-[-0.02em] group-hover:text-[#007AFF]">
          {content.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-muted-foreground">
          {content.excerpt}
        </p>
        <span className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#0d3b66] px-4 text-[0.8rem] font-semibold text-white transition group-hover:bg-[#007AFF]">
          {t("guide.readMore")}
          <ArrowRight className="ml-1.5 size-3.5" />
        </span>
      </div>
    </Link>
  );
}
