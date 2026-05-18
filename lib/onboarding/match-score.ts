import { AVAILABILITY_IDS } from "@/config/onboarding";
import type { TherapistProfileRow } from "@/types/database";

import type { FeelingId, WizardAnswers } from "@/lib/onboarding/types";

const feelingToKeywords: Record<FeelingId, string[]> = {
  anxiety: ["Kaygı", "Anxiety", "Stres", "Stress"],
  stress: ["Stres", "Stress", "Performans", "Performance"],
  burnout: ["Tükenmişlik", "Burnout", "Stres", "Stress"],
  relationship: ["İlişkiler", "Çift", "Yakınlık", "Relationships", "Couple"],
  loneliness: ["Yalnızlık", "Yakınlık", "Loneliness"],
  sleep: ["Uyku", "Sleep"],
  confidence: ["Özgüven", "Confidence"],
};

type AvailabilityId = (typeof AVAILABILITY_IDS)[number];

const availabilityLabels: Record<AvailabilityId, string[]> = {
  morning: ["Sabah", "Morning"],
  afternoon: ["Öğleden sonra", "Afternoon"],
  evening: ["Akşam", "Evening"],
  late_night: ["Gece geç", "Late night", "Night"],
};

function languageOk(t: TherapistProfileRow, selected: string[]) {
  if (selected.includes("other")) return true;
  if (selected.includes("tr") && !t.languages.some((l) => l.includes("Türk"))) return false;
  if (selected.includes("en") && !t.languages.some((l) => l.includes("İngiliz"))) return false;
  return true;
}

export function rankTherapistProfiles(
  answers: WizardAnswers,
  pool: TherapistProfileRow[],
): TherapistProfileRow[] {
  if (!pool.length) return [];

  const { feelings, supportId, genderPref, languages, availability } = answers;

  const keywordSet = new Set<string>();
  feelings.forEach((f) => {
    feelingToKeywords[f].forEach((k) => keywordSet.add(k));
  });
  if (supportId === "couples") {
    keywordSet.add("Çift");
    keywordSet.add("Couple");
  }

  const wantSlots = availability.flatMap((id) => availabilityLabels[id]);

  const eligible = pool
    .filter((t) => {
      if (genderPref === "male") return t.gender === "male";
      if (genderPref === "female") return t.gender === "female";
      return true;
    })
    .filter((t) => languageOk(t, languages));

  const basePool = eligible.length > 0 ? eligible : pool;

  const scored = basePool.map((row) => {
    let score = 0;
    row.specialization.forEach((s) => {
      keywordSet.forEach((k) => {
        if (s.includes(k) || k.includes(s)) score += 3;
      });
    });
    const overlap = row.availability.filter((slot) => wantSlots.includes(slot)).length;
    score += overlap * 2;
    if (supportId === "weekly" && row.professional_title?.includes("Psikoterapist")) score += 2;
    if (supportId === "long_term" && row.full_name.startsWith("Dr.")) score += 1;
    score += Number(row.rating) * 0.35;
    score += Math.min(row.years_of_experience, 20) * 0.08;
    return { t: row, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).map((x) => x.t);
  const top = sorted.slice(0, 3);
  if (top.length > 0) return top;

  return [...pool].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);
}
