"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Compass, Heart, Moon, PenLine, Sprout, Sunrise } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { fadeUp, onboardingListContainer, onboardingListItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

const rituals = [
  {
    titleKey: "dashboard.journeyPage.ritual1Title",
    bodyKey: "dashboard.journeyPage.ritual1Body",
    icon: Sunrise,
    tint: "border-emerald-500/15 from-emerald-500/[0.07] to-transparent",
  },
  {
    titleKey: "dashboard.journeyPage.ritual2Title",
    bodyKey: "dashboard.journeyPage.ritual2Body",
    icon: Moon,
    tint: "border-indigo-500/14 from-indigo-500/[0.06] to-transparent",
  },
  {
    titleKey: "dashboard.journeyPage.ritual3Title",
    bodyKey: "dashboard.journeyPage.ritual3Body",
    icon: Sprout,
    tint: "border-rose-500/14 from-rose-500/[0.05] to-transparent",
  },
] as const;

export function JourneyHub() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-24">
      <motion.header variants={fadeUp} initial="hidden" animate="show" className="space-y-5">
        <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">{t("dashboard.journeyPage.kicker")}</p>
        <h1 className="max-w-3xl font-display text-[2.2rem] leading-[1.05] tracking-[-0.035em] text-balance sm:text-[2.55rem]">
          {t("dashboard.journeyPage.title")}
        </h1>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">{t("dashboard.journeyPage.intro")}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/therapists">{t("dashboard.journeyPage.ctaTherapists")}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/onboarding">
              <Compass className="size-4" />
              {t("dashboard.journeyPage.ctaMatching")}
            </Link>
          </Button>
        </div>
      </motion.header>

      <motion.section variants={fadeUp} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border/55 bg-white/[0.02] p-8 shadow-[var(--shadow-glass)] backdrop-blur-[14px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_30%_-30%,oklch(0.74_0.09_95/0.1),transparent_55%)]" />
          <div className="relative flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl border border-border/55 bg-white/[0.04] text-muted-foreground">
              <Heart className="size-6 stroke-[1.35]" />
            </span>
            <div className="space-y-3">
              <h2 className="font-display text-[1.45rem] tracking-[-0.02em]">{t("dashboard.journeyPage.trustTitle")}</h2>
              <p className="text-[0.92rem] leading-relaxed text-muted-foreground">{t("dashboard.journeyPage.trustBody")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[var(--radius-xl)] border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-transparent to-transparent p-7">
          <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {t("dashboard.journeyPage.todayKicker")}
          </p>
          <p className="font-display text-[1.2rem] tracking-[-0.015em]">{t("dashboard.journeyPage.todayTitle")}</p>
          <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{t("dashboard.journeyPage.todayQuestion")}</p>
          <div className="rounded-xl border border-border/45 bg-background/40 px-4 py-3 text-[0.82rem] text-muted-foreground">
            {t("dashboard.journeyPage.todayHint")}
          </div>
          <Button asChild variant="subtle" className="w-full rounded-xl sm:w-auto">
            <Link href="/dashboard/sessions" className="inline-flex items-center justify-center gap-2">
              <PenLine className="size-4" />
              {t("dashboard.journeyPage.ctaSessions")}
            </Link>
          </Button>
        </div>
      </motion.section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {t("dashboard.journeyPage.ritualsKicker")}
          </p>
          <h3 className="font-display text-[1.55rem] tracking-[-0.02em]">{t("dashboard.journeyPage.ritualsTitle")}</h3>
        </div>
        <motion.div
          variants={onboardingListContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-10%" }}
          className="grid gap-3 md:grid-cols-3"
        >
          {rituals.map((ritual) => (
            <motion.div
              key={ritual.titleKey}
              variants={onboardingListItem}
              className={cn(
                "flex h-full flex-col justify-between rounded-[var(--radius-lg)] border bg-gradient-to-br p-6 transition-colors duration-200",
                ritual.tint,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-border/55 bg-background/30 text-muted-foreground">
                  <ritual.icon className="size-5 stroke-[1.35]" />
                </span>
              </div>
              <div className="mt-6 space-y-2">
                <p className="font-display text-[1.05rem] tracking-[-0.015em]">{t(ritual.titleKey)}</p>
                <p className="text-[0.82rem] leading-relaxed text-muted-foreground">{t(ritual.bodyKey)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
