import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { OnboardingAnswersInsert, OnboardingAnswersRow } from "@/types/database";

import { mergeOnboardingUpsertWithCompletion, wizardToOnboardingUpsert } from "@/lib/onboarding/db-mapper";
import type { WizardAnswers } from "@/lib/onboarding/types";

export async function fetchOnboardingAnswersRow(
  client: AppSupabaseClient,
  userId: string,
): Promise<OnboardingAnswersRow | null> {
  const { data, error } = await client
    .from("onboarding_answers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertOnboardingAnswers(
  client: AppSupabaseClient,
  args: {
    userId: string;
    answers: WizardAnswers;
    previous: OnboardingAnswersRow | null;
    markComplete: boolean;
  },
): Promise<OnboardingAnswersRow> {
  const base: OnboardingAnswersInsert = wizardToOnboardingUpsert(args.userId, args.answers);
  const payload = mergeOnboardingUpsertWithCompletion(base, args.previous, args.markComplete);

  const { data, error } = await client
    .from("onboarding_answers")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
