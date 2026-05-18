"use client";

import { motion } from "framer-motion";

import { containerRise, fadeUp } from "@/lib/animations";
import { useI18n } from "@/components/i18n/i18n-provider";

export function DashboardWelcomeSection({
  displayName,
  subtitle,
}: {
  displayName: string;
  subtitle: string;
}) {
  const { t } = useI18n();
  const first = displayName.split(/\s+/)[0] ?? displayName;

  return (
    <motion.section
      variants={containerRise}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border/50 bg-[color-mix(in_oklch,var(--color-card),transparent_14%)] p-8 shadow-[var(--shadow-glass)] backdrop-blur-[var(--blur-glass)] sm:p-10"
    >
      <div className="pointer-events-none absolute -right-24 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.08_255/0.12),transparent_68%)] blur-2xl" />
      <div className="relative max-w-2xl space-y-4">
        <motion.p variants={fadeUp} className="text-[0.8125rem] tracking-[0.14em] text-muted-foreground/90 uppercase">
          {t("dashboard.sections.welcomeKicker")}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="font-display text-balance text-[clamp(1.85rem,4.5vw,2.65rem)] leading-[1.05] tracking-[-0.02em] text-foreground"
        >
          {t("dashboard.sections.welcomeHello", { name: first })}
        </motion.h1>
        <motion.p variants={fadeUp} className="max-w-xl text-pretty text-[1.02rem] leading-[1.7] text-muted-foreground">
          {subtitle}
        </motion.p>
      </div>
    </motion.section>
  );
}
