import type { TherapistProfileRow } from "@/types/database";
import { sanitizeTherapistLanguages } from "@/lib/therapist/profile-field-options";

import { availabilityBucketsForSlotStart } from "./slot-buckets";

export type TherapistLayoutMode = "grid" | "list";

export type TherapistDiscoveryFilters = {
  query: string;
  specialties: string[];
  languages: string[];
  genders: Array<"male" | "female">;
  /** therapist_profiles.availability metinleri (ör. Sabah, Akşam) */
  availabilityLabels: string[];
  onlyWithOpenSlot: boolean;
};

export const defaultTherapistDiscoveryFilters: TherapistDiscoveryFilters = {
  query: "",
  specialties: [],
  languages: [],
  genders: [],
  availabilityLabels: [],
  onlyWithOpenSlot: false,
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function matchesQuery(profile: TherapistProfileRow, query: string): boolean {
  if (!query) return true;
  const q = normalizeText(query);
  const haystack = [
    profile.full_name,
    profile.professional_title ?? "",
    profile.bio ?? "",
    ...(profile.specialization ?? []),
    ...(profile.languages ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function arrayIntersectsSelected(selected: string[], values: string[] | null | undefined): boolean {
  if (selected.length === 0) return true;
  const set = new Set(values ?? []);
  return selected.some((s) => set.has(s));
}

export function collectDiscoveryFacets(profiles: TherapistProfileRow[]): {
  specialties: string[];
  languages: string[];
  availability: string[];
} {
  const specialties = new Set<string>();
  const languages = new Set<string>();
  const availability = new Set<string>();
  for (const p of profiles) {
    (p.specialization ?? []).forEach((s) => specialties.add(s));
    for (const lang of sanitizeTherapistLanguages(p.languages, 12)) languages.add(lang);
    (p.availability ?? []).forEach((s) => availability.add(s));
  }
  return {
    specialties: [...specialties].sort((a, b) => a.localeCompare(b, "tr")),
    languages: [...languages].sort((a, b) => a.localeCompare(b, "tr")),
    availability: [...availability].sort((a, b) => a.localeCompare(b, "tr")),
  };
}

export function filterTherapistProfiles(
  profiles: TherapistProfileRow[],
  filters: TherapistDiscoveryFilters,
  openSlotByProfileId: Set<string>,
  openSlotsUtc?: { profileId: string; startsAt: string }[],
): TherapistProfileRow[] {
  return profiles.filter((p) => {
    if (!matchesQuery(p, filters.query)) return false;
    if (!arrayIntersectsSelected(filters.specialties, p.specialization)) return false;
    if (!arrayIntersectsSelected(filters.languages, sanitizeTherapistLanguages(p.languages, 12)))
      return false;
    if (filters.genders.length > 0 && !filters.genders.includes(p.gender as "male" | "female")) return false;
    if (filters.onlyWithOpenSlot && !openSlotByProfileId.has(p.profile_id)) return false;

    if (filters.availabilityLabels.length === 0) return true;

    const selected = new Set(filters.availabilityLabels);
    const profileAvail = p.availability ?? [];
    if (profileAvail.some((x) => selected.has(x))) return true;

    const slotsForProfile = openSlotsUtc?.filter((s) => s.profileId === p.profile_id) ?? [];
    if (slotsForProfile.length === 0) return false;

    return slotsForProfile.some((s) => {
      const buckets = availabilityBucketsForSlotStart(s.startsAt);
      return buckets.some((b) => selected.has(b));
    });
  });
}
