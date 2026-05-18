"use client";

import { motion } from "framer-motion";

import { useI18n } from "@/components/i18n/i18n-provider";
import { ONBOARDING_TOTAL_STEPS } from "@/config/onboarding";
import { premiumEase } from "@/lib/animations/easing";

export function OnboardingProgress({ currentStep }: { currentStep: number }) {
  const { t } = useI18n();
  const pct = ((currentStep + 1) / ONBOARDING_TOTAL_STEPS) * 100;
  const si = Math.min(Math.max(currentStep, 0), 4);
  const mood = t(`onboarding.progressMood.s${si}`);

  return (
    <div className="w-full space-y-3">
      <div className="relative h-[3px] overflow-hidden rounded-full bg-white/[0.06] shadow-[inset_0_1px_0_oklch(1_0_0/0.04)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/[0.55] via-white/[0.28] to-white/[0.12]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.72, ease: premiumEase }}
        />
      </div>
      <div className="flex flex-col gap-0.5 text-[0.72rem] leading-snug sm:flex-row sm:items-center sm:justify-between">
        <span className="tracking-[0.12em] text-muted-foreground/80 uppercase">
          {currentStep + 1} / {ONBOARDING_TOTAL_STEPS}
        </span>
        <span className="text-muted-foreground/90">{mood}</span>
      </div>
    </div>
  );
}
