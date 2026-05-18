"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import type { TherapistProfileRow } from "@/types/database";
import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { onboardingListContainer, onboardingListItem } from "@/lib/animations";

import { TherapistPremiumCard } from "../therapist-premium-card";

export function DashboardTherapistsSection({
  recommended,
  therapistTotal,
}: {
  recommended: TherapistProfileRow[];
  therapistTotal: number;
}) {
  const { t } = useI18n();
  return (
    <section id="terapistler" className="scroll-mt-24 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.72rem] tracking-[0.16em] text-muted-foreground/85 uppercase">
            {t("dashboard.sections.therapistsKicker")}
          </p>
          <h2 className="font-display text-2xl tracking-[-0.02em] sm:text-[1.75rem]">
            {t("dashboard.sections.therapistsTitle")}
          </h2>
          <p className="max-w-md text-[0.9rem] leading-relaxed text-muted-foreground">
            {t("dashboard.sections.therapistsBody", { total: therapistTotal })}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-auto">
            <Link href="/dashboard/therapists">{t("dashboard.sections.therapistsAll")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="shrink-0 self-start sm:self-auto text-muted-foreground">
            <Link href="/onboarding">{t("dashboard.sections.therapistsUpdatePrefs")}</Link>
          </Button>
        </div>
      </div>

      {recommended.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-border/55 bg-white/[0.02] px-6 py-14 text-center">
          <p className="font-display text-lg text-foreground">{t("dashboard.sections.therapistsEmptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {t("dashboard.sections.therapistsEmptyBody")}
          </p>
        </div>
      ) : (
        <motion.div
          variants={onboardingListContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4"
        >
          {recommended.map((profile, i) => (
            <motion.div key={profile.profile_id} variants={onboardingListItem}>
              <TherapistPremiumCard
                profile={profile}
                featured={i === 0}
                variant={i % 2 === 0 ? "hero" : "compact"}
                href={`/dashboard/therapists/${profile.profile_id}`}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
