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
        "inline-flex rounded-xl border border-border bg-muted/80 p-1 text-[0.72rem] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm",
        className,
      )}
      role="group"
      aria-label={t("language.switch")}
    >
      <button
        type="button"
        onClick={() => setLocale("tr")}
        className={cn(
          "rounded-lg px-2.5 py-1.5 transition-all duration-200",
          locale === "tr"
            ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("language.tr")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-lg px-2.5 py-1.5 transition-all duration-200",
          locale === "en"
            ? "bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("language.en")}
      </button>
    </div>
  );
}
