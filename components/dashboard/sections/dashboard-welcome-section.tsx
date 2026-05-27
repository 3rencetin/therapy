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
      className="relative overflow-hidden surface-hero rounded-[var(--radius-xl)] p-8 backdrop-blur-[var(--blur-glass)] sm:p-10"
    >
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,#007AFF28,transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,#5856D622,transparent_68%)] blur-2xl" />
      <div className="relative max-w-2xl space-y-4">
        <motion.p variants={fadeUp} className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[#007AFF] uppercase">
          {t("dashboard.sections.welcomeKicker")}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="font-display text-balance text-[clamp(1.85rem,4.5vw,2.65rem)] leading-[1.05] tracking-[-0.02em] text-foreground"
        >
          {t("dashboard.sections.welcomeHello", { name: first })}
        </motion.h1>
        <motion.p variants={fadeUp} className="max-w-xl text-pretty text-[1.02rem] leading-[1.7] text-[#48484a]">
          {subtitle}
        </motion.p>
      </div>
    </motion.section>
  );
}
