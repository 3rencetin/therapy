"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { ONBOARDING_TOTAL_STEPS } from "@/config/onboarding";

export function WizardFooter({
  stepIndex,
  onBack,
  onContinue,
  onSkip,
  continueLabel,
  continueDisabled,
  isLastStep,
}: {
  stepIndex: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  continueLabel: string;
  continueDisabled: boolean;
  isLastStep: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="mt-auto border-t border-border/35 bg-[color-mix(in_oklch,var(--color-background),transparent_12%)] px-4 py-5 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="order-2 text-center text-[0.8125rem] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:order-1 sm:text-left"
        >
          {t("onboarding.skipFooter")}
        </button>

        <div className="order-1 flex w-full gap-3 sm:order-2 sm:w-auto">
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 sm:flex-none">
              <ArrowLeft className="size-4" />
              {t("common.back")}
            </Button>
          ) : (
            <span className="hidden w-24 sm:block" aria-hidden />
          )}
          <Button
            type="button"
            disabled={continueDisabled}
            onClick={onContinue}
            className="min-h-11 flex-1 gap-2 sm:min-w-[11rem]"
          >
            {continueLabel}
            {!isLastStep ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>
      </div>
      <p className="mx-auto mt-3 max-w-xl text-center text-[0.68rem] leading-relaxed text-muted-foreground/60 sm:text-left">
        {t("onboarding.footerProgress", { current: stepIndex + 1, total: ONBOARDING_TOTAL_STEPS })}
      </p>
    </div>
  );
}
