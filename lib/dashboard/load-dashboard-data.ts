import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { fetchOnboardingAnswersRow } from "@/lib/supabase/onboarding-repository";
import { fetchVerifiedTherapistProfiles } from "@/lib/supabase/therapist-repository";
import type { TherapistProfileRow } from "@/types/database";
import { onboardingRowToWizard } from "@/lib/onboarding/db-mapper";
import { rankTherapistProfiles } from "@/lib/onboarding/match-score";
import type { WizardAnswers } from "@/lib/onboarding/types";

const emptyWizard: WizardAnswers = {
  feelings: [],
  supportId: null,
  genderPref: null,
  languages: [],
  availability: [],
};

export type DashboardBootstrap = {
  wizard: WizardAnswers;
  onboardingCompletedAt: string | null;
  onboardingUpdatedAt: string | null;
  recommended: TherapistProfileRow[];
  therapistTotal: number;
};

export async function loadDashboardBootstrap(
  client: AppSupabaseClient,
  userId: string,
): Promise<DashboardBootstrap> {
  const [onboardingRow, pool] = await Promise.all([
    fetchOnboardingAnswersRow(client, userId).catch(() => null),
    fetchVerifiedTherapistProfiles(client).catch(() => []),
  ]);

  const wizard = onboardingRow ? onboardingRowToWizard(onboardingRow) : emptyWizard;
  const recommended = rankTherapistProfiles(wizard, pool);

  return {
    wizard,
    onboardingCompletedAt: onboardingRow?.completed_at ?? null,
    onboardingUpdatedAt: onboardingRow?.updated_at ?? null,
    recommended,
    therapistTotal: pool.length,
  };
}
