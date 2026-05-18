import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOnboardingAnswersRow } from "@/lib/supabase/onboarding-repository";

export const metadata = {
  title: "Eşleştirme",
  description: "Size uygun terapist deneyimini birlikte şekillendirelim.",
};

export default async function OnboardingPage() {
  const { user } = await requireRole("user");
  const supabase = await createSupabaseServerClient();

  let onboardingRow: Awaited<ReturnType<typeof fetchOnboardingAnswersRow>> = null;
  try {
    onboardingRow = await fetchOnboardingAnswersRow(supabase, user.id);
  } catch {
    onboardingRow = null;
  }

  return <OnboardingWizard userId={user.id} initialOnboardingRow={onboardingRow} />;
}
