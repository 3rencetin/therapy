import type { AvailabilitySlotId, FeelingId } from "@/config/onboarding";

export type AvailabilityId = AvailabilitySlotId;

export type { FeelingId };

export type WizardAnswers = {
  feelings: FeelingId[];
  supportId: string | null;
  genderPref: "male" | "female" | "any" | null;
  languages: string[];
  availability: AvailabilityId[];
};
