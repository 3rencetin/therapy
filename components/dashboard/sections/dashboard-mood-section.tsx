"use client";

import { motion } from "framer-motion";

import type { MoodMetricId, MoodSnapshot } from "@/lib/dashboard/mood-snapshot";
import { onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { premiumEase } from "@/lib/animations/easing";
import { useI18n } from "@/components/i18n/i18n-provider";
import { cn } from "@/lib/utils";

const METRIC_STYLES: Record<
  MoodMetricId,
  { card: string; bar: string; glow: string }
> = {
  balance: {
    card:
      "from-emerald-500/[0.06] via-transparent to-cyan-500/[0.04] dark:from-emerald-400/[0.08] dark:to-cyan-400/[0.03]",
    bar: "from-emerald-400/90 via-teal-400/70 to-cyan-500/50 dark:from-emerald-300/85 dark:via-teal-400/55 dark:to-cyan-500/35",
    glow:
      "shadow-[0_0_42px_-8px_oklch(0.72_0.14_175/0.22)] dark:shadow-[0_0_48px_-10px_oklch(0.75_0.12_175/0.28)]",
  },
  energy: {
    card:
      "from-amber-500/[0.08] via-transparent to-orange-500/[0.04] dark:from-amber-400/[0.09] dark:to-orange-400/[0.03]",
    bar: "from-amber-400/90 via-amber-500/75 to-orange-400/45 dark:from-amber-300/80 dark:via-amber-400/60 dark:to-orange-400/35",
    glow:
      "shadow-[0_0_42px_-8px_oklch(0.78_0.14_75/0.2)] dark:shadow-[0_0_48px_-10px_oklch(0.82_0.12_75/0.22)]",
  },
  connection: {
    card:
      "from-violet-500/[0.07] via-transparent to-fuchsia-500/[0.04] dark:from-violet-400/[0.08] dark:to-fuchsia-400/[0.03]",
    bar: "from-violet-400/88 via-fuchsia-400/72 to-purple-500/48 dark:from-violet-300/78 dark:via-fuchsia-400/58 dark:to-purple-500/36",
    glow:
      "shadow-[0_0_42px_-8px_oklch(0.68_0.18_305/0.2)] dark:shadow-[0_0_48px_-10px_oklch(0.72_0.16_305/0.24)]",
  },
};

function moodLabels(id: MoodMetricId, t: (key: string) => string) {
  switch (id) {
    case "balance":
      return { title: t("dashboard.sections.moodMetricBalanceTitle"), hint: t("dashboard.sections.moodMetricBalanceHint") };
    case "energy":
      return { title: t("dashboard.sections.moodMetricEnergyTitle"), hint: t("dashboard.sections.moodMetricEnergyHint") };
    case "connection":
      return {
        title: t("dashboard.sections.moodMetricConnectionTitle"),
        hint: t("dashboard.sections.moodMetricConnectionHint"),
      };
  }
}

export function DashboardMoodSection({ snapshots }: { snapshots: MoodSnapshot[] }) {
  const { t } = useI18n();
  return (
    <section className="space-y-5">
      <div>
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">
          {t("dashboard.sections.moodKicker")}
        </p>
        <h3 className="font-display text-lg tracking-[-0.02em] sm:text-xl">{t("dashboard.sections.moodTitle")}</h3>
        <p className="mt-1.5 max-w-md text-[0.82rem] leading-relaxed text-muted-foreground">
          {t("dashboard.sections.moodSubtitle")}
        </p>
      </div>
      <motion.div
        variants={onboardingListContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-5%" }}
        className="grid gap-3.5"
      >
        {snapshots.map((m, index) => {
          const labels = moodLabels(m.id, t);
          const styles = METRIC_STYLES[m.id];
          return (
            <motion.div
              key={m.id}
              variants={onboardingListItem}
              className={cn(
                "relative overflow-hidden rounded-[var(--radius-xl)] border border-border/40 bg-gradient-to-br p-4 shadow-[var(--shadow-glass)] backdrop-blur-[14px] transition-[box-shadow,transform] duration-500 ease-out hover:border-border/55",
                styles.card,
                styles.glow,
                "motion-safe:hover:-translate-y-0.5",
              )}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-white/25 to-transparent opacity-40 blur-2xl dark:from-white/10" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8rem] font-semibold tracking-tight text-foreground">{labels.title}</p>
                  <p className="mt-1 text-[0.72rem] leading-snug text-muted-foreground">{labels.hint}</p>
                </div>
                <motion.span
                  className="font-display text-[1.65rem] tabular-nums tracking-tight text-foreground sm:text-[1.85rem]"
                  initial={{ opacity: 0.35, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.12 * index, duration: 0.55, ease: premiumEase }}
                >
                  {m.value}
                </motion.span>
              </div>
              <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-foreground/[0.07] dark:bg-white/[0.08]">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r", styles.bar)}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${m.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.25, delay: 0.08 * index, ease: premiumEase }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
