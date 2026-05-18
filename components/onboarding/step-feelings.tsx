"use client";

import { motion } from "framer-motion";

import { FEELING_IDS } from "@/config/onboarding";
import { useI18n } from "@/components/i18n/i18n-provider";
import { onboardingListContainer, onboardingListItem, onboardingStepIn } from "@/lib/animations";
import type { FeelingId } from "@/lib/onboarding/match-therapists";

import { SelectableFieldCard } from "./selectable-field-card";

export function StepFeelings({
  value,
  onChange,
}: {
  value: FeelingId[];
  onChange: (next: FeelingId[]) => void;
}) {
  const { t } = useI18n();

  function toggle(id: FeelingId) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <motion.div variants={onboardingStepIn} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <header className="space-y-3">
        <p className="text-[0.8125rem] tracking-[0.14em] text-muted-foreground/90 uppercase">
          {t("onboarding.feelings.kicker")}
        </p>
        <h2 className="font-display text-balance text-[clamp(1.65rem,4.2vw,2.35rem)] leading-[1.08] tracking-[-0.02em]">
          {t("onboarding.feelings.title")}
        </h2>
        <p className="max-w-lg text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
          {t("onboarding.feelings.body")}
        </p>
      </header>

      <motion.div
        variants={onboardingListContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3 sm:grid-cols-2"
      >
        {FEELING_IDS.map((id) => (
          <motion.div key={id} variants={onboardingListItem}>
            <SelectableFieldCard
              label={t(`onboarding.feelings.${id}.label`)}
              hint={t(`onboarding.feelings.${id}.hint`)}
              selected={value.includes(id)}
              onSelect={() => toggle(id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
