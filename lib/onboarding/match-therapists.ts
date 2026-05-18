import type { TherapistProfileRow } from "@/types/database";

import { therapistRowToPreview } from "@/lib/onboarding/derive-therapist-preview";
import { rankTherapistProfiles } from "@/lib/onboarding/match-score";
import type { TherapistPreview } from "@/lib/data/therapist-previews";

import type { WizardAnswers } from "./types";

export type { AvailabilityId, FeelingId, WizardAnswers } from "./types";

export function rankTherapistMatches(
  answers: WizardAnswers,
  pool: TherapistProfileRow[],
): TherapistPreview[] {
  const rows = rankTherapistProfiles(answers, pool);
  return rows.map((r) => {
    const g = r.gender === "male" || r.gender === "female" ? r.gender : "female";
    return therapistRowToPreview(r, g);
  });
}
