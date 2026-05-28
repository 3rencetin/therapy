import type { AppLocale } from "@/lib/i18n/locale";

export type GuideArticleLocaleBlock = {
  title: string;
  excerpt: string;
  body: string;
};

export type GuideArticleTranslations = Partial<Record<Exclude<AppLocale, "tr">, GuideArticleLocaleBlock>>;

export type GuideArticleLocalizable = {
  title: string;
  excerpt: string;
  body: string;
  translations?: GuideArticleTranslations | null;
};

export function resolveGuideArticleForLocale(
  article: GuideArticleLocalizable,
  locale: AppLocale,
): { title: string; excerpt: string; body: string; usedFallback: boolean } {
  if (locale === "tr") {
    return { title: article.title, excerpt: article.excerpt, body: article.body, usedFallback: false };
  }

  const localized = article.translations?.[locale];
  if (localized?.title?.trim() && localized.body?.trim()) {
    return {
      title: localized.title,
      excerpt: localized.excerpt?.trim() ? localized.excerpt : article.excerpt,
      body: localized.body,
      usedFallback: false,
    };
  }

  return { title: article.title, excerpt: article.excerpt, body: article.body, usedFallback: true };
}
