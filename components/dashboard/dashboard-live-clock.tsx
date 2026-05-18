"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { formatIstanbulLiveParts } from "@/lib/i18n/datetime";
import { cn } from "@/lib/utils";

export function DashboardLiveClock({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className={cn("min-w-0", className)} aria-busy="true" aria-label={t("dashboard.shell.clockLoading")}>
        <p className="text-[0.72rem] tracking-[0.06em] text-muted-foreground/50">
          <span className="text-[0.68rem] tracking-[0.12em] uppercase">{t("dashboard.shell.clockTzShort")}</span>
          <span className="mx-1.5 text-border">·</span>
          <span>…</span>
        </p>
        <p className="mt-0.5 font-display text-[1.05rem] tabular-nums tracking-[-0.02em] text-muted-foreground/40 sm:text-[1.125rem]">
          --:--:--
        </p>
      </div>
    );
  }

  const { dateLine, timeLine } = formatIstanbulLiveParts(now, locale);

  return (
    <div className={cn("min-w-0", className)}>
      <p className="truncate text-[0.72rem] tracking-[0.06em] text-muted-foreground" title={t("dashboard.shell.clockTzTitle")}>
        <span className="text-[0.68rem] tracking-[0.12em] uppercase text-muted-foreground/90">{t("dashboard.shell.clockTzShort")}</span>
        <span className="mx-1.5 text-border">·</span>
        <span>{dateLine}</span>
      </p>
      <p className="mt-0.5 font-display text-[1.05rem] tabular-nums tracking-[-0.02em] text-foreground sm:text-[1.125rem]">
        <time dateTime={now.toISOString()}>{timeLine}</time>
      </p>
    </div>
  );
}
