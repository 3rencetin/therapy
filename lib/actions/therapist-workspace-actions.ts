"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";
import {
  sanitizeTherapistAvailabilityTags,
  sanitizeTherapistLanguages,
  sanitizeTherapistSpecialization,
} from "@/lib/therapist/profile-field-options";
import { generateAvailabilitySlots, iterateYmdInclusive } from "@/lib/therapist/generate-availability-slots";

export type TherapistPublicProfileInput = {
  full_name: string;
  professional_title: string | null;
  avatar_url: string | null;
  bio: string;
  gender: "male" | "female";
  languages: string[];
  specialization: string[];
  availability: string[];
  years_of_experience: number;
  session_duration_minutes: number;
  session_fee_try: number;
};

export async function therapistUpdatePublicProfileAction(
  input: TherapistPublicProfileInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const tp = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!tp) return { ok: false, message: "Hesabın bir terapist profiline bağlı değil." };

  const name = input.full_name.trim();
  if (!name) return { ok: false, message: "Görünen ad gerekli." };

  if (input.gender !== "male" && input.gender !== "female") {
    return { ok: false, message: "Cinsiyet erkek veya kadın olarak seçilmeli." };
  }

  const yoe = Math.min(80, Math.max(0, Math.floor(Number(input.years_of_experience) || 0)));
  const duration = Math.min(180, Math.max(15, Math.floor(Number(input.session_duration_minutes) || 50)));
  const feeTry = Math.min(1000000, Math.max(0, Math.floor(Number(input.session_fee_try) || 0)));

  const languages = sanitizeTherapistLanguages(input.languages, 12);
  const specialization = sanitizeTherapistSpecialization(input.specialization, 12);
  const availability = sanitizeTherapistAvailabilityTags(input.availability, 8);

  const { error } = await supabase
    .from("therapist_profiles")
    .update({
      full_name: name,
      professional_title: input.professional_title?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
      bio: input.bio.trim(),
      gender: input.gender,
      languages,
      specialization,
      availability,
      years_of_experience: yoe,
      session_duration_minutes: duration,
      session_fee_try: feeTry,
    })
    .eq("profile_id", tp.profile_id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/therapist");
  revalidatePath("/therapist/profile");
  revalidatePath("/therapist/availability");
  revalidatePath("/therapist/sessions");
  revalidatePath("/dashboard/therapists");
  revalidatePath(`/dashboard/therapists/${tp.profile_id}`);
  return { ok: true };
}

export async function therapistUploadAvatarAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const tp = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!tp) return { ok: false, message: "Profil bağlantısı yok." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Dosya seçilmedi." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, message: "Dosya 5 MB'dan küçük olmalı." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${tp.profile_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const service = createSupabaseServiceClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { data, error } = await service.storage.from("therapist-avatars").upload(path, buffer, {
    contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) return { ok: false, message: error.message };

  const objectPath = data?.path ?? path;
  const { data: urlData } = service.storage.from("therapist-avatars").getPublicUrl(objectPath);
  return { ok: true, url: urlData.publicUrl };
}

export async function therapistAddAvailabilityAction(input: {
  starts_at: string;
  ends_at: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const tp = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!tp) return { ok: false, message: "Profil bağlantısı yok." };

  if (new Date(input.ends_at).getTime() <= new Date(input.starts_at).getTime()) {
    return { ok: false, message: "Bitiş, başlangıçtan sonra olmalı." };
  }

  const { error } = await supabase.from("therapist_availability").insert({
    profile_id: tp.profile_id,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Bu başlangıç zamanı zaten kayıtlı." };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/therapist/availability");
  revalidatePath(`/dashboard/therapists/${tp.profile_id}`);
  return { ok: true };
}

export async function therapistDeleteAvailabilityAction(
  slotId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const tp = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!tp) return { ok: false, message: "Profil bağlantısı yok." };

  const { error } = await supabase
    .from("therapist_availability")
    .delete()
    .eq("id", slotId)
    .eq("profile_id", tp.profile_id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/therapist/availability");
  revalidatePath("/dashboard/therapists");
  return { ok: true };
}

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 56;
const MAX_BULK_SLOTS = 480;

function countDaysInclusive(fromYmd: string, toYmd: string): number {
  let n = 0;
  for (const day of iterateYmdInclusive(fromYmd, toYmd)) {
    void day;
    n += 1;
  }
  return n;
}

export async function therapistBulkGenerateAvailabilityAction(input: {
  fromYmd: string;
  toYmd: string;
  weekdaysSun0: number[];
  dayStartHHmm: string;
  dayEndHHmm: string;
  sessionMinutes: number;
  breakMinutes: number;
}): Promise<
  { ok: true; created: number; skippedExisting: number; totalGenerated: number } | { ok: false; message: string }
> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const tp = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!tp) return { ok: false, message: "Profil bağlantısı yok." };

  const fromYmd = input.fromYmd.trim();
  const toYmd = input.toYmd.trim();
  if (!YMD_RE.test(fromYmd) || !YMD_RE.test(toYmd)) {
    return { ok: false, message: "Tarihleri YYYY-AA-GG formatında seç." };
  }
  if (fromYmd > toYmd) {
    return { ok: false, message: "Bitiş tarihi başlangıçtan önce olamaz." };
  }
  if (countDaysInclusive(fromYmd, toYmd) > MAX_RANGE_DAYS) {
    return { ok: false, message: `En fazla ${MAX_RANGE_DAYS} günlük aralık seçebilirsin.` };
  }

  const weekdays = [...new Set(input.weekdaysSun0)].filter((d) => d >= 0 && d <= 6);
  if (weekdays.length === 0) {
    return { ok: false, message: "En az bir hafta günü seç." };
  }

  const generated = generateAvailabilitySlots({
    fromYmd,
    toYmd,
    weekdaysSun0: weekdays,
    dayStartHHmm: input.dayStartHHmm.trim(),
    dayEndHHmm: input.dayEndHHmm.trim(),
    sessionMinutes: input.sessionMinutes,
    breakMinutes: input.breakMinutes,
    maxSlots: MAX_BULK_SLOTS + 1,
  });

  if (generated.length === 0) {
    return { ok: false, message: "Bu ayarlarda oluşan gelecek dilim yok. Saat aralığını veya süreleri kontrol et." };
  }
  if (generated.length > MAX_BULK_SLOTS) {
    return {
      ok: false,
      message: `Tek seferde en fazla ${MAX_BULK_SLOTS} dilim eklenebilir. Aralığı daralt veya süreyi artır.`,
    };
  }

  const minIso = generated.reduce((a, b) => (a.starts_at < b.starts_at ? a : b)).starts_at;
  const maxIso = generated.reduce((a, b) => (a.starts_at > b.starts_at ? a : b)).starts_at;

  const { data: existing, error: exErr } = await supabase
    .from("therapist_availability")
    .select("starts_at")
    .eq("profile_id", tp.profile_id)
    .gte("starts_at", minIso)
    .lte("starts_at", maxIso);

  if (exErr) return { ok: false, message: exErr.message };

  const taken = new Set((existing ?? []).map((r) => r.starts_at));
  const fresh = generated.filter((g) => !taken.has(g.starts_at));
  const skippedExisting = generated.length - fresh.length;

  if (fresh.length === 0) {
    return {
      ok: true,
      created: 0,
      skippedExisting,
      totalGenerated: generated.length,
    };
  }

  const rows = fresh.map((r) => ({
    profile_id: tp.profile_id,
    starts_at: r.starts_at,
    ends_at: r.ends_at,
  }));

  const CHUNK = 100;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from("therapist_availability").insert(chunk);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, message: "Bazı dilimler zaten vardı; sayfayı yenileyip tekrar dene." };
      }
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/therapist/availability");
  revalidatePath(`/dashboard/therapists/${tp.profile_id}`);
  revalidatePath("/dashboard/therapists");

  return {
    ok: true,
    created: fresh.length,
    skippedExisting,
    totalGenerated: generated.length,
  };
}
