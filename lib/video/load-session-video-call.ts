import type { AppSupabaseClient } from "@/lib/supabase/app-client";

export type SessionVideoCallPageTiming = {
  startsAt: string;
  endsAt: string;
  videoExtendedUntil: string | null;
  status: string;
};

/**
 * Görüşme sayfası: seans satırını ve terapist mi danışan mı olduğunu doğrular.
 */
export async function loadSessionVideoCallPageContext(
  supabase: AppSupabaseClient,
  sessionId: string,
  userId: string,
): Promise<
  | { ok: true; timing: SessionVideoCallPageTiming; isTherapist: boolean }
  | { ok: false; reason: "not_found" | "forbidden" }
> {
  const { data: booking, error } = await supabase
    .from("booked_sessions")
    .select("user_id, profile_id, starts_at, ends_at, video_call_extended_until, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !booking) return { ok: false, reason: "not_found" };

  let allowed = booking.user_id === userId;
  if (!allowed) {
    const { data: staff } = await supabase
      .from("therapist_profiles")
      .select("profile_id")
      .eq("profile_id", booking.profile_id)
      .eq("user_id", userId)
      .maybeSingle();
    allowed = Boolean(staff);
  }

  if (!allowed) return { ok: false, reason: "forbidden" };

  const isTherapist = booking.user_id !== userId;

  return {
    ok: true,
    isTherapist,
    timing: {
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      videoExtendedUntil: booking.video_call_extended_until,
      status: booking.status,
    },
  };
}
