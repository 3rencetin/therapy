import type { TherapistProfileRow } from "@/types/database";

import type { TherapistPreview } from "@/lib/data/therapist-previews";
import { sanitizeTherapistLanguages } from "@/lib/therapist/profile-field-options";

const ACCENT_CLASSES = [
  "bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-cyan-950/30 ring-1 ring-white/10",
  "bg-gradient-to-br from-indigo-500/22 via-violet-600/10 to-slate-950/35 ring-1 ring-white/10",
  "bg-gradient-to-br from-amber-500/18 via-rose-500/10 to-orange-950/28 ring-1 ring-white/10",
  "bg-gradient-to-br from-sky-500/20 via-blue-600/10 to-indigo-950/32 ring-1 ring-white/10",
  "bg-gradient-to-br from-fuchsia-500/16 via-purple-600/10 to-pink-950/26 ring-1 ring-white/10",
  "bg-gradient-to-br from-lime-500/15 via-emerald-600/10 to-green-950/28 ring-1 ring-white/10",
  "bg-gradient-to-br from-rose-500/18 via-red-500/8 to-rose-950/30 ring-1 ring-white/10",
  "bg-gradient-to-br from-cyan-500/20 via-blue-500/8 to-slate-900/35 ring-1 ring-white/10",
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
