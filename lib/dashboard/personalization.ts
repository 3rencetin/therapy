import type { WizardAnswers } from "@/lib/onboarding/types";
import type { TranslateFn } from "@/lib/i18n/translate";

function feelingLabelsForWizard(wizard: WizardAnswers | null, t: TranslateFn): string[] {
  if (!wizard?.feelings.length) return [];
  return wizard.feelings.map((id) => t(`onboarding.feelings.${id}.label`));
}

function supportLabel(wizard: WizardAnswers | null, t: TranslateFn): string | null {
  if (!wizard?.supportId) return null;
  const path = `onboarding.support.${wizard.supportId}.label`;
  const v = t(path);
  if (v !== path) return v;
  return wizard.supportId;
}

export function buildWelcomeSubtitle(wizard: WizardAnswers | null, t: TranslateFn): string {
  const themes = feelingLabelsForWizard(wizard, t);
  const support = supportLabel(wizard, t);
  if (themes.length && support) {
    const pair = t("dashboard.personalization.pairJoiner");
    const themePart =
      themes.slice(0, 2).join(pair) + (themes.length > 2 ? t("dashboard.personalization.andMore") : "");
    return t("dashboard.personalization.themesAndSupport", {
      themes: themePart,
      support: support.toLowerCase(),
    });
  }
  if (themes.length) {
    const themePart = themes.slice(0, 3).join(t("dashboard.personalization.themeJoiner"));
    return t("dashboard.personalization.themesOnly", { themes: themePart });
  }
  if (support) {
    return t("dashboard.personalization.supportOnly", { support });
  }
  return t("dashboard.personalization.defaultWelcome");
}

export function insightParagraph(wizard: WizardAnswers | null, t: TranslateFn): string {
  const themes = feelingLabelsForWizard(wizard, t);
  if (!themes.length) {
    return t("dashboard.personalization.insightEmpty");
  }
  const lead = themes[0] ?? t("dashboard.personalization.insightLeadFallback");
  return t("dashboard.personalization.insightWithTheme", { lead });
}
