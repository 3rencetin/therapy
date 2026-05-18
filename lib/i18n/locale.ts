export type AppLocale = "tr" | "en";

export function parseLocale(raw: string | null | undefined): AppLocale {
  return raw === "en" ? "en" : "tr";
}

export function intlLocaleForApp(locale: AppLocale): string {
  return locale === "en" ? "en-US" : "tr-TR";
}
