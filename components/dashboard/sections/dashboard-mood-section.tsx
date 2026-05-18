"use client";

import { motion } from "framer-motion";

import type { MoodSnapshot } from "@/lib/dashboard/mood-snapshot";
import { onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { premiumEase } from "@/lib/animations/easing";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n/i18n-provider";

export function DashboardMoodSection({ snapshots }: { snapshots: MoodSnapshot[] }) {
  const { t } = useI18n();
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">{t("dashboard.sections.moodKicker")}</p>
        <h3 className="font-display text-lg tracking-[-0.02em] sm:text-xl">{t("dashboard.sections.moodTitle")}</h3>
        <p className="mt-1 text-[0.8rem] text-muted-foreground/85">{t("dashboard.sections.moodSubtitle")}</p>
      </div>
      <motion.div
        variants={onboardingListContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid gap-3"
      >
        {snapshots.map((m) => (
          <motion.div
            key={m.label}
            variants={onboardingListItem}
            className="rounded-[var(--radius-lg)] border border-border/45 bg-white/[0.03] px-4 py-3.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.78rem] font-medium text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-[0.72rem] leading-snug text-muted-foreground/75">{m.hint}</p>
              </div>
              <span className="font-display text-2xl tabular-nums tracking-tight text-foreground">{m.value}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r from-white/35 to-white/10")}
                initial={{ width: 0 }}
                whileInView={{ width: `${m.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: premiumEase }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
