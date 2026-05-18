"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n/i18n-provider";

export function TherapistUnlinkedPlaceholder() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-[var(--radius-xl)] border border-amber-500/20 bg-amber-500/[0.06] p-8 text-[0.9rem] text-amber-50/95">
      <p className="font-display text-lg tracking-[-0.02em] text-foreground">{t("therapist.unlinkedCard.title")}</p>
      <p className="leading-relaxed text-muted-foreground">
        {t("therapist.unlinkedCard.bodyBefore")}
        <span className="text-foreground/90">{t("therapist.unlinkedCard.highlight")}</span>
        {t("therapist.unlinkedCard.bodyAfter")}
      </p>
      <Link
        href="/therapist"
        className="inline-block text-[0.85rem] font-medium text-violet-300/95 underline-offset-4 hover:underline"
      >
        {t("therapist.unlinkedCard.backToWorkspace")}
      </Link>
    </div>
  );
}
