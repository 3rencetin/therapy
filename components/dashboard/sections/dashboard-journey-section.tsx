"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Compass, Moon, PenLine } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

const cards = [
  {
    titleKey: "dashboard.sections.journeyCardRefineTitle",
    bodyKey: "dashboard.sections.journeyCardRefineBody",
    href: "/onboarding",
    icon: Compass,
    className: "border-emerald-500/15 bg-gradient-to-br from-white/[0.05] to-transparent",
  },
  {
    titleKey: "dashboard.sections.journeyCardNightTitle",
    bodyKey: "dashboard.sections.journeyCardNightBody",
    href: "/dashboard/journey",
    icon: Moon,
    className: "border-indigo-500/12 bg-gradient-to-br from-indigo-500/[0.06] to-transparent",
  },
  {
    titleKey: "dashboard.sections.journeyCardNotesTitle",
    bodyKey: "dashboard.sections.journeyCardNotesBody",
    href: "/dashboard/sessions",
    icon: PenLine,
    className: "border-rose-500/12 bg-gradient-to-br from-rose-500/[0.05] to-transparent",
  },
] as const;

export function DashboardJourneySection() {
  const { t } = useI18n();
  return (
    <section id="yolculuk" className="scroll-mt-24 space-y-4">
      <div className="space-y-1">
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">
          {t("dashboard.sections.journeyKicker")}
        </p>
        <h2 className="font-display text-2xl tracking-[-0.02em] sm:text-[1.65rem]">{t("dashboard.sections.journeyTitle")}</h2>
        <p className="max-w-lg text-[0.9rem] text-muted-foreground">{t("dashboard.sections.journeySubtitle")}</p>
      </div>
      <motion.div
        variants={onboardingListContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-8%" }}
        className="grid gap-3 sm:grid-cols-3"
      >
        {cards.map((card) => (
          <motion.div key={card.href} variants={onboardingListItem}>
            <Link
              href={card.href}
              className={cn(
                "group flex h-full flex-col justify-between rounded-[var(--radius-lg)] border p-5 transition-colors duration-200 hover:border-border",
                card.className,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-border/55 bg-background/30 text-muted-foreground transition-colors group-hover:text-foreground">
                  <card.icon className="size-5 stroke-[1.35]" />
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </div>
              <div className="mt-6 space-y-2">
                <h3 className="font-display text-[1.05rem] tracking-[-0.015em]">{t(card.titleKey)}</h3>
                <p className="text-[0.82rem] leading-relaxed text-muted-foreground">{t(card.bodyKey)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
