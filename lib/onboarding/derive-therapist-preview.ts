import type { TherapistProfileRow } from "@/types/database";

import type { TherapistPreview } from "@/lib/data/therapist-previews";
import { sanitizeTherapistLanguages } from "@/lib/therapist/profile-field-options";

const ACCENT_CLASSES = [
  "bg-gradient-to-br from-[#007AFF] via-[#5856D6] to-[#AF52DE] ring-1 ring-[#007AFF33] text-white",
  "bg-gradient-to-br from-[#5856D6] via-[#007AFF] to-[#5AC8FA] ring-1 ring-[#5856D633] text-white",
  "bg-gradient-to-br from-[#007AFF] via-[#5AC8FA] to-[#34C759] ring-1 ring-[#007AFF33] text-white",
  "bg-gradient-to-br from-[#AF52DE] via-[#5856D6] to-[#007AFF] ring-1 ring-[#AF52DE44] text-white",
  "bg-gradient-to-br from-[#007AFF] to-[#5856D6] ring-1 ring-[#007AFF33] text-white",
  "bg-gradient-to-br from-[#5856D6] to-[#AF52DE] ring-1 ring-[#5856D633] text-white",
  "bg-gradient-to-br from-[#5AC8FA] via-[#007AFF] to-[#5856D6] ring-1 ring-[#5AC8FA44] text-white",
  "bg-gradient-to-br from-[#007AFF] via-[#AF52DE] to-[#FF2D55] ring-1 ring-[#007AFF33] text-white",
] as const;

function hashToAccent(profileId: string): string {
  let n = 0;
  for (let i = 0; i < profileId.length; i += 1) n += profileId.charCodeAt(i);
  return ACCENT_CLASSES[n % ACCENT_CLASSES.length] ?? ACCENT_CLASSES[0];
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

function toneFromBio(bio: string): string {
  const t = bio.trim();
  if (t.length <= 120) return t;
  return `${t.slice(0, 117)}…`;
}

export function therapistRowToPreview(row: TherapistProfileRow, gender: "male" | "female"): TherapistPreview {
  return {
    id: row.profile_id,
    name: row.full_name,
    role: row.professional_title?.trim() || "Terapist",
    initials: initialsFromName(row.full_name),
    accentClass: hashToAccent(row.profile_id),
    gender,
    specialties: row.specialization?.length ? [...row.specialization] : [],
    languages: sanitizeTherapistLanguages(row.languages, 24),
    availability: row.availability?.length ? [...row.availability] : [],
    tone: toneFromBio(row.bio || "Profil üzerinden kısa bir tanıtım yakında eklenecek."),
  };
}
