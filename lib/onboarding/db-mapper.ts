import type { OnboardingAnswersInsert, OnboardingAnswersRow } from "@/types/database";

import { AVAILABILITY_IDS, FEELING_IDS } from "@/config/onboarding";
import type { AvailabilityId, FeelingId, WizardAnswers } from "@/lib/onboarding/types";

const feelingSet = new Set<string>(FEELING_IDS);
const availabilitySet = new Set<string>(AVAILABILITY_IDS);

function sanitizeFeelings(raw: string[] | null): FeelingId[] {
  if (!raw?.length) return [];
  return raw.filter((x): x is FeelingId => feelingSet.has(x));
}

function sanitizeAvailability(raw: string[] | null): AvailabilityId[] {
  if (!raw?.length) return [];
  return raw.filter((x): x is AvailabilityId => availabilitySet.has(x));
}

export function onboardingRowToWizard(row: OnboardingAnswersRow): WizardAnswers {
  const gender = row.therapist_gender_preference;
  return {
    feelings: sanitizeFeelings(row.emotions),
    supportId: row.support_type,
    genderPref:
      gender === "male" || gender === "female" || gender === "any"
        ? gender
        : null,
    languages: row.preferred_languages?.length ? [...row.preferred_languages] : [],
    availability: sanitizeAvailability(row.availability_preferences),
  };
}

export function wizardToOnboardingUpsert(userId: string, answers: WizardAnswers): OnboardingAnswersInsert {
  return {
    user_id: userId,
    emotions: [...answers.feelings],
    support_type: answers.supportId,
    therapist_gender_preference: answers.genderPref,
    preferred_languages: [...answers.languages],
    availability_preferences: [...answers.availability],
  };
}

export function mergeOnboardingUpsertWithCompletion(
  base: OnboardingAnswersInsert,
  row: OnboardingAnswersRow | null,
  markComplete: boolean,
): OnboardingAnswersInsert {
  if (!markComplete && row?.completed_at) {
    return { ...base, completed_at: row.completed_at };
  }
  if (markComplete) {
    return { ...base, completed_at: new Date().toISOString() };
  }
  return base;
}

export function inferResumeStep(answers: WizardAnswers): number {
  if (answers.feelings.length === 0) return 0;
  if (!answers.supportId) return 1;
  if (!answers.genderPref || answers.languages.length === 0) return 2;
  if (answers.availability.length === 0) return 3;
  return 4;
}
