import { AVAILABILITY_BUCKET_LABELS, orderAvailabilityBuckets } from "@/lib/therapists/slot-buckets";

/** Veritabanında saklanan etiket = görünen metin (tutarlı filtre / kart) */

export const THERAPIST_LANGUAGE_OPTIONS = [
  { value: "Türkçe" },
  { value: "İngilizce" },
  { value: "Almanca" },
  { value: "Fransızca" },
  { value: "İspanyolca" },
  { value: "İtalyanca" },
  { value: "Rusça" },
  { value: "Arapça" },
  { value: "Farsça" },
  { value: "Japonca" },
  { value: "Çince (Mandarin)" },
] as const;

export const THERAPIST_SPECIALIZATION_OPTIONS = [
  { value: "Anksiyete" },
  { value: "Depresyon" },
  { value: "Travma / PTSD" },
  { value: "Panik bozukluğu" },
  { value: "OKB" },
  { value: "İlişki ve çift terapisi" },
  { value: "Aile terapisi" },
  { value: "Öfke yönetimi" },
  { value: "Yas ve kayıp" },
  { value: "Tükenmişlik ve stres" },
  { value: "Özgüven ve benlik" },
  { value: "Uyku sorunları" },
  { value: "Yeme bozuklukları" },
  { value: "Bağımlılık" },
  { value: "Dikkat / ADHD" },
  { value: "Kişilik ve ilişki örüntüleri" },
  { value: "Kronik hastalık ve psikosomatik" },
  { value: "LGBTQIA+ dostu yaklaşım" },
  { value: "Yaşam geçişleri" },
] as const;

/** Slot zaman dilimi etiketleri (slot-buckets ile aynı) + Hafta sonu */
export const THERAPIST_AVAILABILITY_TAG_OPTIONS = [
  ...AVAILABILITY_BUCKET_LABELS.map((v) => ({ value: v })),
  { value: "Hafta sonu" },
] as const;

function normKey(s: string): string {
  return s
    .trim()
    .normalize("NFC")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

function buildIndex(options: readonly { readonly value: string }[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const { value } of options) {
    m.set(normKey(value), value);
  }
  return m;
}

const LANG_INDEX = buildIndex(THERAPIST_LANGUAGE_OPTIONS);
const SPEC_INDEX = buildIndex(THERAPIST_SPECIALIZATION_OPTIONS);
const AVAIL_INDEX = buildIndex(THERAPIST_AVAILABILITY_TAG_OPTIONS);

const LANG_SET = new Set<string>();
for (const { value } of THERAPIST_LANGUAGE_OPTIONS) LANG_SET.add(value);

const SPEC_SET = new Set<string>();
for (const { value } of THERAPIST_SPECIALIZATION_OPTIONS) SPEC_SET.add(value);

const AVAIL_SET = new Set<string>();
for (const { value } of THERAPIST_AVAILABILITY_TAG_OPTIONS) AVAIL_SET.add(value);

const LANG_ALIASES: Record<string, string> = {
  turkce: "Türkçe",
  türkçe: "Türkçe",
  english: "İngilizce",
  ingilizce: "İngilizce",
  german: "Almanca",
  almanca: "Almanca",
};

/** Eski serbest metin → takvim dilimleri ile aynı isimler */
const AVAIL_ALIASES: Record<string, string> = {
  gece: "Gece geç",
  "gece geç": "Gece geç",
  "gece gec": "Gece geç",
  "hafta sonu": "Hafta sonu",
  haftasonu: "Hafta sonu",
  öğleden: "Öğleden sonra",
  ogleden: "Öğleden sonra",
};

function resolveAllowed(raw: string, index: Map<string, string>, aliases: Record<string, string>): string | null {
  const t = raw.trim();
  if (!t) return null;
  const direct = index.get(normKey(t));
  if (direct) return direct;
  const aliasHit = aliases[normKey(t)];
  if (aliasHit) return index.get(normKey(aliasHit)) ?? null;
  return null;
}

export function sanitizeTherapistLanguages(values: string[] | null | undefined, max = 12): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values ?? []) {
    const canon = LANG_ALIASES[normKey(v)] ?? resolveAllowed(v, LANG_INDEX, {});
    if (!canon || !LANG_SET.has(canon) || seen.has(canon)) continue;
    seen.add(canon);
    out.push(canon);
    if (out.length >= max) break;
  }
  return out;
}

export function sanitizeTherapistSpecialization(values: string[] | null | undefined, max = 12): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values ?? []) {
    const canon = resolveAllowed(v, SPEC_INDEX, {});
    if (!canon || !SPEC_SET.has(canon) || seen.has(canon)) continue;
    seen.add(canon);
    out.push(canon);
    if (out.length >= max) break;
  }
  return out.sort((a, b) => a.localeCompare(b, "tr"));
}

export function sanitizeTherapistAvailabilityTags(values: string[] | null | undefined, max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values ?? []) {
    const canon = resolveAllowed(v, AVAIL_INDEX, AVAIL_ALIASES);
    if (!canon || !AVAIL_SET.has(canon) || seen.has(canon)) continue;
    seen.add(canon);
    out.push(canon);
    if (out.length >= max) break;
  }
  return orderAvailabilityBuckets(out as Parameters<typeof orderAvailabilityBuckets>[0]).filter((x) =>
    AVAIL_SET.has(x),
  );
}

export function initialSelectionFromStored(
  stored: string[] | null | undefined,
  kind: "lang" | "spec" | "avail",
): Set<string> {
  const raw = stored ?? [];
  if (kind === "lang") return new Set(sanitizeTherapistLanguages(raw, 24));
  if (kind === "spec") return new Set(sanitizeTherapistSpecialization(raw, 24));
  return new Set(sanitizeTherapistAvailabilityTags(raw, 16));
}
