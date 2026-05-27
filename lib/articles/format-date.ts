import type { AppLocale } from "@/lib/i18n/locale";

export function formatGuideDate(iso: string | null, locale: AppLocale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
