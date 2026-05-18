"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";
import { fetchRescheduleSlotsForProfile } from "@/lib/supabase/reschedule-repository";
import type { TherapistAvailabilityRow } from "@/types/database";

export type RescheduleOk = { ok: true };
export type RescheduleFail = { ok: false; message: string };
export type RescheduleSlotsResult = { ok: true; slots: TherapistAvailabilityRow[] } | RescheduleFail;

export async function fetchRescheduleSlotsAction(profileId: string): Promise<RescheduleSlotsResult> {
  await requireRole(["user", "therapist"]);
  const supabase = await createSupabaseServerClient();
  try {
    const slots = await fetchRescheduleSlotsForProfile(supabase, profileId);
    return { ok: true, slots };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Müsaitlik yüklenemedi." };
  }
}

export async function createRescheduleRequestAction(input: {
  sessionId: string;
  proposedAvailabilityId: string;
}): Promise<RescheduleOk | RescheduleFail> {
  const { user } = await requireRole("user");
  const supabase = await createSupabaseServerClient();

  const { data: session, error: sErr } = await supabase
    .from("booked_sessions")
    .select("id, user_id, profile_id, status")
    .eq("id", input.sessionId)
    .maybeSingle();

  if (sErr) return { ok: false, message: sErr.message };
  if (!session || session.user_id !== user.id) {
    return { ok: false, message: "Seans bulunamadı." };
  }
  if (session.status !== "pending" && session.status !== "confirmed") {
    return { ok: false, message: "Bu seans için yeninden planlama yapılamaz." };
  }

  const { error } = await supabase.from("session_reschedule_requests").insert({
    session_id: input.sessionId,
    proposed_by: user.id,
    proposed_availability_id: input.proposedAvailabilityId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Zaten bekleyen bir yeniden planlama var." };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/therapist/sessions");
  return { ok: true };
}

export async function createTherapistRescheduleRequestAction(input: {
  sessionId: string;
  proposedAvailabilityId: string;
}): Promise<RescheduleOk | RescheduleFail> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const tp = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!tp) return { ok: false, message: "Profil bağlantısı yok." };

  const { data: session, error: sErr } = await supabase
    .from("booked_sessions")
    .select("id, profile_id, status")
    .eq("id", input.sessionId)
    .maybeSingle();

  if (sErr) return { ok: false, message: sErr.message };
  if (!session || session.profile_id !== tp.profile_id) {
    return { ok: false, message: "Seans bulunamadı." };
  }
  if (session.status !== "pending" && session.status !== "confirmed") {
    return { ok: false, message: "Bu seans için öneri gönderilemez." };
  }

  const { error } = await supabase.from("session_reschedule_requests").insert({
    session_id: input.sessionId,
    proposed_by: user.id,
    proposed_availability_id: input.proposedAvailabilityId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Zaten bekleyen bir talep var." };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/therapist/sessions");
  return { ok: true };
}

export async function cancelRescheduleRequestAction(requestId: string): Promise<RescheduleOk | RescheduleFail> {
  const { user } = await requireRole(["user", "therapist"]);
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("session_reschedule_requests")
    .update({ status: "cancelled", resolved_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("proposed_by", user.id)
    .eq("status", "pending");

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/sessions");
  revalidatePath("/therapist/sessions");
  return { ok: true };
}

export async function resolveRescheduleRequestAction(
  requestId: string,
  accept: boolean,
): Promise<RescheduleOk | RescheduleFail> {
  await requireRole(["user", "therapist"]);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("resolve_session_reschedule_request", {
    p_request_id: requestId,
    p_accept: accept,
  });

  if (error) return { ok: false, message: error.message };

  const payload = data as { ok?: boolean; error?: string } | null;
  if (!payload?.ok) {
    const code = payload?.error ?? "unknown";
    const map: Record<string, string> = {
      auth: "Oturum gerekli.",
      not_found: "Talep bulunamadı.",
      not_pending: "Bu talep artık geçerli değil.",
      cannot_resolve_own: "Kendi önerini onaylayamazsın.",
      forbidden: "İşlem yetkisi yok.",
      slot_gone: "Seçilen saat artık yok.",
      slot_mismatch: "Geçersiz müsaitlik.",
      slot_past: "Geçmiş bir saat seçildi.",
      slot_taken: "Bu saat dolu.",
      session_missing: "Seans bulunamadı.",
    };
    return { ok: false, message: map[code] ?? "İşlem tamamlanamadı." };
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/therapist/sessions");
  revalidatePath("/dashboard/therapists");
  return { ok: true };
}
