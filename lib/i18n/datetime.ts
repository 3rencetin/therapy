import type { AppLocale } from "@/lib/i18n/locale";
import { intlLocaleForApp } from "@/lib/i18n/locale";

const istanbul: Intl.DateTimeFormatOptions = {
  timeZone: "Europe/Istanbul",
};

export function formatIstanbulDate(iso: string, locale: AppLocale = "tr"): string {
  return new Intl.DateTimeFormat(intlLocaleForApp(locale), {
    ...istanbul,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function formatIstanbulTime(iso: string, locale: AppLocale = "tr"): string {
  return new Intl.DateTimeFormat(intlLocaleForApp(locale), {
    ...istanbul,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatIstanbulSessionWindow(startIso: string, endIso: string, locale: AppLocale = "tr"): string {
  const d = formatIstanbulDate(startIso, locale);
  const t0 = formatIstanbulTime(startIso, locale);
  const t1 = formatIstanbulTime(endIso, locale);
  return `${d} · ${t0} – ${t1}`;
}

/** İstanbul takvim günü YYYY-MM-DD (rezervasyon / müsaitlik formları için). */
export function istanbulDateYmd(date: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  let y = "";
  let m = "";
  let d = "";
  for (const p of parts) {
    if (p.type === "year") y = p.value;
    if (p.type === "month") m = p.value;
    if (p.type === "day") d = p.value;
  }
  return `${y}-${m}-${d}`;
}
