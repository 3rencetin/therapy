import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { countUpcomingSessions, pickNextUpcomingSession } from "@/lib/dashboard/next-session";
import { fetchOnboardingAnswersRow } from "@/lib/supabase/onboarding-repository";
import { fetchBookingsForUser, type BookedSessionListRow } from "@/lib/supabase/booking-repository";
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
  nextSession: BookedSessionListRow | null;
  upcomingSessionCount: number;
};

export async function loadDashboardBootstrap(
  client: AppSupabaseClient,
  userId: string,
): Promise<DashboardBootstrap> {
  const [onboardingRow, pool, bookings] = await Promise.all([
    fetchOnboardingAnswersRow(client, userId).catch(() => null),
    fetchVerifiedTherapistProfiles(client).catch(() => []),
    fetchBookingsForUser(client, userId).catch(() => []),
  ]);

  const wizard = onboardingRow ? onboardingRowToWizard(onboardingRow) : emptyWizard;
  const recommended = rankTherapistProfiles(wizard, pool);
  const nextSession = pickNextUpcomingSession(bookings);

  return {
    wizard,
    onboardingCompletedAt: onboardingRow?.completed_at ?? null,
    onboardingUpdatedAt: onboardingRow?.updated_at ?? null,
    recommended,
    therapistTotal: pool.length,
    nextSession,
    upcomingSessionCount: countUpcomingSessions(bookings),
  };
}
