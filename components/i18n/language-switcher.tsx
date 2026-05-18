"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_LOCALE_COOKIE } from "@/lib/i18n/cookie";
import type { AppLocale } from "@/lib/i18n/locale";

import { useI18n } from "./i18n-provider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();

  function setLocale(next: AppLocale) {
    document.cookie = `${APP_LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border/50 bg-white/[0.03] p-0.5 text-[0.72rem] font-medium",
        className,
      )}
      role="group"
      aria-label={t("language.switch")}
    >
      <button
        type="button"
        onClick={() => setLocale("tr")}
        className={cn(
          "rounded-md px-2.5 py-1 transition-colors",
          locale === "tr" ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("language.tr")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-md px-2.5 py-1 transition-colors",
          locale === "en" ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("language.en")}
      </button>
    </div>
  );
}
