"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { useI18n } from "@/components/i18n/i18n-provider";
import type { OnboardingAnswersRow, TherapistProfileRow } from "@/types/database";
import { siteConfig } from "@/config/site";
import { inferResumeStep, onboardingRowToWizard } from "@/lib/onboarding/db-mapper";
import type { AvailabilityId, WizardAnswers } from "@/lib/onboarding/match-therapists";
import { rankTherapistMatches } from "@/lib/onboarding/match-therapists";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { upsertOnboardingAnswers } from "@/lib/supabase/onboarding-repository";
import { fetchVerifiedTherapistProfiles } from "@/lib/supabase/therapist-repository";

import { OnboardingAmbient } from "./onboarding-ambient";
import { OnboardingProgress } from "./onboarding-progress";
import { RedirectOverlay } from "./redirect-overlay";
import { StepAvailability } from "./step-availability";
import { StepFeelings } from "./step-feelings";
import { StepMatchPreview } from "./step-match-preview";
import { StepPreferences } from "./step-preferences";
import { StepSupport } from "./step-support";
import { WizardFooter } from "./wizard-footer";

const emptyAnswers: WizardAnswers = {
  feelings: [],
  supportId: null,
  genderPref: null,
  languages: [],
  availability: [],
};

function canProceed(step: number, a: WizardAnswers): boolean {
  switch (step) {
    case 0:
      return a.feelings.length > 0;
    case 1:
      return a.supportId !== null;
    case 2:
      return a.genderPref !== null && a.languages.length > 0;
    case 3:
      return a.availability.length > 0;
    default:
      return true;
  }
}

export function OnboardingWizard({
  userId,
  initialOnboardingRow,
}: {
  userId: string;
  initialOnboardingRow: OnboardingAnswersRow | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const hydrated = initialOnboardingRow ? onboardingRowToWizard(initialOnboardingRow) : emptyAnswers;
  const [step, setStep] = useState(() => inferResumeStep(hydrated));
  const [answers, setAnswers] = useState<WizardAnswers>(hydrated);
  const [remoteRow, setRemoteRow] = useState<OnboardingAnswersRow | null>(initialOnboardingRow);
  const [therapistRows, setTherapistRows] = useState<TherapistProfileRow[]>([]);
  const [therapistsLoading, setTherapistsLoading] = useState(true);
  const [therapistsError, setTherapistsError] = useState<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const rows = await fetchVerifiedTherapistProfiles(supabase);
        if (alive) {
          setTherapistRows(rows);
          setTherapistsError(null);
        }
      } catch {
        if (alive) {
          setTherapistsError(t("onboarding.therapistsLoadError"));
          setTherapistRows([]);
        }
      } finally {
        if (alive) setTherapistsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [t]);

  const matches = useMemo(
    () => rankTherapistMatches(answers, therapistRows),
    [answers, therapistRows],
  );

  const goDashboard = useCallback(() => {
    setRedirecting(true);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 900);
  }, [router]);

  const flushSave = useCallback(
    async (markComplete: boolean) => {
      setPersistError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const row = await upsertOnboardingAnswers(supabase, {
          userId,
          answers,
          previous: remoteRow,
          markComplete,
        });
        setRemoteRow(row);
      } catch {
        setPersistError(t("onboarding.persistError"));
      }
    },
    [answers, remoteRow, t, userId],
  );

  const continueDisabled = !canProceed(step, answers);
  const isLast = step === 4;

  async function handleContinue() {
    if (continueDisabled) return;
    await flushSave(isLast);
    if (isLast) {
      goDashboard();
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  async function handleBack() {
    await flushSave(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSkip() {
    await flushSave(false);
    goDashboard();
  }

  return (
    <div className="relative flex min-h-dvh flex-col text-foreground">
      <OnboardingAmbient />

      <header className="relative z-10 border-b border-border/40 bg-background/20 px-4 py-5 backdrop-blur-[12px] sm:px-8">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <span className="font-display text-[1.125rem] tracking-[-0.02em]">{siteConfig.name}</span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-[0.8125rem] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {t("onboarding.skip")}
          </button>
        </div>
        <div className="mx-auto mt-6 max-w-xl">
          <OnboardingProgress currentStep={step} />
        </div>
      </header>

      {persistError ? (
        <div className="relative z-10 mx-auto w-full max-w-xl px-4 pt-4 sm:px-8">
          <p className="rounded-lg border border-border/60 bg-white/[0.04] px-3 py-2 text-[0.85rem] text-[oklch(0.78_0.12_22)]">
            {persistError}
          </p>
        </div>
      ) : null}

      <main className="relative z-10 flex flex-1 flex-col px-4 pb-6 pt-8 sm:px-8 sm:pt-10">
        <div className="mx-auto w-full max-w-xl flex-1">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <StepFeelings
                key="feelings"
                value={answers.feelings}
                onChange={(feelings) => setAnswers((p) => ({ ...p, feelings }))}
              />
            ) : null}
            {step === 1 ? (
              <StepSupport
                key="support"
                value={answers.supportId}
                onChange={(supportId) => setAnswers((p) => ({ ...p, supportId }))}
              />
            ) : null}
            {step === 2 ? (
              <StepPreferences
                key="prefs"
                gender={answers.genderPref}
                onGenderChange={(genderPref) => setAnswers((p) => ({ ...p, genderPref }))}
                languages={answers.languages}
                onLanguagesChange={(languages) => setAnswers((p) => ({ ...p, languages }))}
              />
            ) : null}
            {step === 3 ? (
              <StepAvailability
                key="avail"
                value={answers.availability}
                onChange={(availability: AvailabilityId[]) => setAnswers((p) => ({ ...p, availability }))}
              />
            ) : null}
            {step === 4 ? (
              <StepMatchPreview
                key="preview"
                therapists={matches}
                loading={therapistsLoading}
                errorMessage={therapistsError}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      <WizardFooter
        stepIndex={step}
        onBack={handleBack}
        onContinue={handleContinue}
        onSkip={handleSkip}
        continueLabel={isLast ? t("onboarding.toPanel") : t("common.continue")}
        continueDisabled={continueDisabled}
        isLastStep={isLast}
      />

      <RedirectOverlay
        open={redirecting}
        title={t("onboarding.redirectTitle")}
        subtitle={t("onboarding.redirectSubtitle")}
      />
    </div>
  );
}
