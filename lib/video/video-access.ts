import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { getSessionVideoEffectiveEndMs, getVideoJoinPhase } from "@/lib/video/join-window";

export type BookedSessionVideoRow = {
  id: string;
  user_id: string;
  profile_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  video_call_extended_until: string | null;
};

export async function getTherapistProfileForUser(
  supabase: AppSupabaseClient,
  userId: string,
): Promise<{ profile_id: string; full_name: string } | null> {
  const { data } = await supabase
    .from("therapist_profiles")
    .select("profile_id, full_name")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function isUserTherapistForProfile(
  supabase: AppSupabaseClient,
  userId: string,
  profileId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("therapist_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function isUserAdminOrModerator(supabase: AppSupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin" || data?.role === "moderator";
}

export function getClientJoinPhase(booking: BookedSessionVideoRow, nowMs = Date.now()) {
  return getVideoJoinPhase(
    booking.starts_at,
    booking.ends_at,
    booking.status,
    nowMs,
    booking.video_call_extended_until,
  );
}

/** Aynı terapist odasında başka bir danışanın aktif seans penceresi varsa engelle. */
export async function assertNoOtherActiveClientSession(
  supabase: AppSupabaseClient,
  booking: BookedSessionVideoRow,
  nowMs = Date.now(),
): Promise<{ ok: true } | { ok: false; code: "OTHER_SESSION_ACTIVE" }> {
  const { data: siblings, error } = await supabase
    .from("booked_sessions")
    .select("id, user_id, starts_at, ends_at, status, video_call_extended_until")
    .eq("profile_id", booking.profile_id)
    .neq("id", booking.id)
    .in("status", ["pending", "confirmed"]);

  if (error) return { ok: true };

  for (const row of siblings ?? []) {
    if (row.user_id === booking.user_id) continue;
    const phase = getVideoJoinPhase(
      row.starts_at,
      row.ends_at,
      row.status,
      nowMs,
      row.video_call_extended_until,
    );
    if (phase === "open") return { ok: false, code: "OTHER_SESSION_ACTIVE" };
  }
  return { ok: true };
}

export function tokenTtlSecondsForSessionEnd(endMs: number, nowMs = Date.now()): number {
  return Math.min(6 * 60 * 60, Math.max(180, Math.ceil((endMs - nowMs) / 1000) + 300));
}

export const THERAPIST_OFFICE_TTL_SEC = 8 * 60 * 60;
export const ADMIN_OBSERVE_TTL_SEC = 2 * 60 * 60;
