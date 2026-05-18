"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

import { fadeUp } from "@/lib/animations";
import { useI18n } from "@/components/i18n/i18n-provider";

export function DashboardWellnessInsightSection({ text }: { text: string }) {
  const { t } = useI18n();
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border/45 bg-[color-mix(in_oklch,var(--color-card),transparent_18%)] p-7 backdrop-blur-[18px]"
    >
      <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,oklch(0.62_0.05_145/0.1),transparent_65%)] blur-2xl" />
      <div className="relative flex gap-4">
        <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl border border-border/50 bg-white/[0.04] text-muted-foreground">
          <Leaf className="size-5 stroke-[1.4]" />
        </span>
        <div className="min-w-0 space-y-2">
          <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">
            {t("dashboard.sections.wellnessKicker")}
          </p>
          <h3 className="font-display text-lg tracking-[-0.02em] text-foreground sm:text-xl">
            {t("dashboard.sections.wellnessTitle")}
          </h3>
          <p className="text-pretty text-[0.92rem] leading-[1.75] text-muted-foreground">{text}</p>
        </div>
      </div>
    </motion.section>
  );
}
