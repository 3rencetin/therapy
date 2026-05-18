"use client";

import { motion } from "framer-motion";

import { GENDER_PREF_IDS, LANGUAGE_PREF_IDS } from "@/config/onboarding";
import { useI18n } from "@/components/i18n/i18n-provider";
import { onboardingListContainer, onboardingListItem, onboardingStepIn } from "@/lib/animations";
import { cn } from "@/lib/utils";

import { SelectableFieldCard } from "./selectable-field-card";

function languageLabelKey(id: string): string {
  if (id === "tr") return "lang_tr";
  if (id === "en") return "lang_en";
  return "lang_other";
}

export function StepPreferences({
  gender,
  onGenderChange,
  languages,
  onLanguagesChange,
}: {
  gender: "male" | "female" | "any" | null;
  onGenderChange: (g: "male" | "female" | "any") => void;
  languages: string[];
  onLanguagesChange: (ids: string[]) => void;
}) {
  const { t } = useI18n();

  function toggleLang(id: string) {
    if (languages.includes(id)) {
      onLanguagesChange(languages.filter((x) => x !== id));
    } else {
      onLanguagesChange([...languages, id]);
    }
  }

  return (
    <motion.div variants={onboardingStepIn} initial="initial" animate="animate" exit="exit" className="space-y-10">
      <header className="space-y-3">
        <p className="text-[0.8125rem] tracking-[0.14em] text-muted-foreground/90 uppercase">
          {t("onboarding.preferences.kicker")}
        </p>
        <h2 className="font-display text-balance text-[clamp(1.65rem,4.2vw,2.35rem)] leading-[1.08] tracking-[-0.02em]">
          {t("onboarding.preferences.title")}
        </h2>
        <p className="max-w-lg text-pretty text-[0.95rem] leading-relaxed text-muted-foreground">
          {t("onboarding.preferences.body")}
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-[0.8125rem] font-medium tracking-wide text-muted-foreground">
          {t("onboarding.preferences.genderHeading")}
        </h3>
        <motion.div
          variants={onboardingListContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 sm:grid-cols-3"
        >
          {GENDER_PREF_IDS.map((id) => (
            <motion.div key={id} variants={onboardingListItem}>
              <SelectableFieldCard
                label={t(`onboarding.preferences.${id}.label`)}
                selected={gender === id}
                onSelect={() => onGenderChange(id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="space-y-4">
        <h3 className="text-[0.8125rem] font-medium tracking-wide text-muted-foreground">
          {t("onboarding.preferences.languageHeading")}
        </h3>
        <motion.div
          variants={onboardingListContainer}
          initial="initial"
          animate="animate"
          className="flex flex-wrap gap-2.5"
        >
          {LANGUAGE_PREF_IDS.map((id) => {
            const active = languages.includes(id);
            const lk = languageLabelKey(id);
            return (
              <motion.button
                key={id}
                type="button"
                variants={onboardingListItem}
                onClick={() => toggleLang(id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[0.875rem] transition-colors duration-200",
                  active
                    ? "border-white/25 bg-white/[0.1] text-foreground shadow-[0_1px_0_oklch(1_0_0/0.04)_inset]"
                    : "border-border/60 bg-white/[0.02] text-muted-foreground hover:border-border hover:bg-white/[0.04] hover:text-foreground",
                )}
              >
                {t(`onboarding.preferences.${lk}.label`)}
              </motion.button>
            );
          })}
        </motion.div>
      </section>
    </motion.div>
  );
}
