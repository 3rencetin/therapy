"use client";

import { motion } from "framer-motion";

import { SUPPORT_IDS } from "@/config/onboarding";
import { useI18n } from "@/components/i18n/i18n-provider";
import { onboardingListContainer, onboardingListItem, onboardingStepIn } from "@/lib/animations";

import { SelectableFieldCard } from "./selectable-field-card";

export function StepSupport({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string) => void;
}) {
  const { t } = useI18n();

  return (
    <motion.div variants={onboardingStepIn} initial="initial" animate="animate" exit="exit" className="space-y-8">
      <header className="space-y-3">
        <p className="text-[0.8125rem] tracking-[0.14em] text-muted-foreground/90 uppercase">
          {t("onboarding.support.kicker")}
        </p>
        <h2 className="font-display text-balance text-[clamp(1.65rem,4.2vw,2.35rem)] leading-[1.08] tracking-[-0.02em]">
          {t("onboarding.support.title")}
        </h2>
        <p className="max-w-lg text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
          {t("onboarding.support.body")}
        </p>
      </header>

      <motion.div variants={onboardingListContainer} initial="initial" animate="animate" className="grid gap-3">
        {SUPPORT_IDS.map((id) => (
          <motion.div key={id} variants={onboardingListItem}>
            <SelectableFieldCard
              label={t(`onboarding.support.${id}.label`)}
              hint={t(`onboarding.support.${id}.hint`)}
              selected={value === id}
              onSelect={() => onChange(id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
