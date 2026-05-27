"use client";

import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";

export function DashboardSessionsSection() {
  const { t } = useI18n();
  return (
    <motion.section
      id="seanslar"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12%" }}
      className="scroll-mt-24 surface-premium rounded-[var(--radius-xl)] p-7 backdrop-blur-[14px]"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-border/55 bg-white/[0.04] text-muted-foreground">
            <CalendarClock className="size-6 stroke-[1.4]" />
          </span>
          <div className="space-y-1.5">
            <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-[#0070E8] uppercase">
              {t("dashboard.sessionsSection.kicker")}
            </p>
            <h2 className="font-display text-xl tracking-[-0.02em] sm:text-2xl">
              {t("dashboard.sessionsSection.title")}
            </h2>
            <p className="max-w-md text-[0.9rem] leading-relaxed text-muted-foreground">
              {t("dashboard.sessionsSection.body")}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/sessions">{t("dashboard.sessionsSection.openCalendar")}</Link>
          </Button>
          <Button asChild type="button" variant="subtle" className="rounded-xl text-[0.85rem]">
            <Link href="/dashboard/therapists">{t("dashboard.sessionsSection.planNew")}</Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
