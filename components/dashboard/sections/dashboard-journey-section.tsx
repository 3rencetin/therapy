"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Compass, Moon, PenLine } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { softSpring } from "@/lib/animations/easing";
import { cn } from "@/lib/utils";

const cards = [
  {
    titleKey: "dashboard.sections.journeyCardRefineTitle",
    bodyKey: "dashboard.sections.journeyCardRefineBody",
    href: "/onboarding",
    icon: Compass,
    className:
      "border-emerald-500/18 bg-gradient-to-br from-emerald-500/[0.07] via-card/40 to-transparent dark:from-emerald-400/[0.07]",
    iconClass: "text-emerald-700/90 dark:text-emerald-200/90",
  },
  {
    titleKey: "dashboard.sections.journeyCardNightTitle",
    bodyKey: "dashboard.sections.journeyCardNightBody",
    href: "/dashboard/journey",
    icon: Moon,
    className:
      "border-indigo-400/16 bg-gradient-to-br from-indigo-500/[0.08] via-card/40 to-transparent dark:from-indigo-400/[0.06]",
    iconClass: "text-indigo-700/90 dark:text-indigo-200/85",
  },
  {
    titleKey: "dashboard.sections.journeyCardNotesTitle",
    bodyKey: "dashboard.sections.journeyCardNotesBody",
    href: "/dashboard/sessions",
    icon: PenLine,
    className:
      "border-rose-400/16 bg-gradient-to-br from-rose-500/[0.07] via-card/40 to-transparent dark:from-rose-400/[0.06]",
    iconClass: "text-rose-700/90 dark:text-rose-200/85",
  },
] as const;

export function DashboardJourneySection() {
  const { t } = useI18n();
  return (
    <section id="yolculuk" className="scroll-mt-24 space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-[#0070E8] uppercase">
          {t("dashboard.sections.journeyKicker")}
        </p>
        <h2 className="font-display text-2xl tracking-[-0.02em] sm:text-[1.65rem]">{t("dashboard.sections.journeyTitle")}</h2>
        <p className="max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">{t("dashboard.sections.journeySubtitle")}</p>
      </div>
      <motion.div
        variants={onboardingListContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-8%" }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {cards.map((card) => (
          <motion.div key={card.href} variants={onboardingListItem} whileHover={{ y: -4, transition: softSpring }}>
            <Link
              href={card.href}
              className={cn(
                "group relative flex h-full flex-col justify-between overflow-hidden rounded-[var(--radius-xl)] border p-5 shadow-[var(--shadow-glass)] backdrop-blur-[14px] transition-[border-color,box-shadow] duration-300",
                "hover:border-border/70 hover:shadow-[0_18px_40px_-28px_oklch(0_0_0/0.35)] dark:hover:shadow-[0_22px_50px_-36px_oklch(0_0_0/0.65)]",
                card.className,
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-60" />
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-2xl border border-border/50 bg-background/55 text-muted-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)] backdrop-blur-md transition-all duration-300",
                    "group-hover:scale-[1.04] group-hover:border-border/70 group-hover:text-foreground",
                  )}
                >
                  <card.icon className={cn("size-[1.35rem] stroke-[1.35] transition-colors duration-300", card.iconClass)} />
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/45 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </div>
              <div className="mt-7 space-y-2">
                <h3 className="font-display text-[1.06rem] tracking-[-0.015em]">{t(card.titleKey)}</h3>
                <p className="text-[0.82rem] leading-relaxed text-muted-foreground">{t(card.bodyKey)}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
