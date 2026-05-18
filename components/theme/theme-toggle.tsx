"use client";

import { useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { THEME_STORAGE_KEY } from "@/lib/theme/constants";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("dark");

  useLayoutEffect(() => {
    setTheme(readTheme());
  }, []);

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border/50 bg-white/[0.03] p-0.5 text-[0.72rem] font-medium",
        className,
      )}
      role="group"
      aria-label={t("theme.switch")}
    >
      <button
        type="button"
        onClick={() => {
          setTheme("dark");
          applyTheme("dark");
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors",
          theme === "dark" ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Moon className="size-3.5 opacity-90" strokeWidth={1.75} aria-hidden />
        {t("theme.dark")}
      </button>
      <button
        type="button"
        onClick={() => {
          setTheme("light");
          applyTheme("light");
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors",
          theme === "light" ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Sun className="size-3.5 opacity-90" strokeWidth={1.75} aria-hidden />
        {t("theme.light")}
      </button>
    </div>
  );
}
