"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import { fadeUp } from "@/lib/animations";
import { useI18n } from "@/components/i18n/i18n-provider";

export function DashboardPrivacySection() {
  const { t } = useI18n();
  return (
    <motion.footer
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="rounded-[var(--radius-xl)] border border-border/40 bg-gradient-to-br from-white/[0.04] to-transparent px-6 py-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-border/55 bg-white/[0.03] text-muted-foreground">
            <Lock className="size-5 stroke-[1.4]" />
          </span>
          <div className="max-w-xl space-y-2">
            <h3 className="font-display text-lg tracking-[-0.02em]">{t("dashboard.sections.privacyTitle")}</h3>
            <p className="text-[0.9rem] leading-[1.7] text-muted-foreground">{t("dashboard.sections.privacyBody")}</p>
          </div>
        </div>
        <p className="text-[0.72rem] leading-relaxed text-muted-foreground/70 sm:max-w-[12rem] sm:text-right">
          {t("dashboard.sections.privacyFootnote")}
        </p>
      </div>
    </motion.footer>
  );
}
