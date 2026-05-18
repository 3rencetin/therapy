export const ONBOARDING_TOTAL_STEPS = 5;

export const FEELING_IDS = [
  "anxiety",
  "stress",
  "burnout",
  "relationship",
  "loneliness",
  "sleep",
  "confidence",
] as const;
export type FeelingId = (typeof FEELING_IDS)[number];

export const SUPPORT_IDS = ["long_term", "weekly", "quick", "ai_assisted", "couples"] as const;
export type SupportTypeId = (typeof SUPPORT_IDS)[number];

export const GENDER_PREF_IDS = ["female", "male", "any"] as const;
export type GenderPrefId = (typeof GENDER_PREF_IDS)[number];

export const LANGUAGE_PREF_IDS = ["tr", "en", "other"] as const;
export type LanguagePrefId = (typeof LANGUAGE_PREF_IDS)[number];

export const AVAILABILITY_IDS = ["morning", "afternoon", "evening", "late_night"] as const;
export type AvailabilitySlotId = (typeof AVAILABILITY_IDS)[number];
