"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionVideoTiming = {
  startsAt: string;
  endsAt: string;
  videoExtendedUntil: string | null;
  status: string;
};

export async function getSessionVideoTimingAction(sessionId: string): Promise<SessionVideoTiming | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: booking, error } = await supabase
    .from("booked_sessions")
    .select("user_id, profile_id, starts_at, ends_at, video_call_extended_until, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !booking) return null;

  let allowed = booking.user_id === user.id;
  if (!allowed) {
    const { data: staff } = await supabase
      .from("therapist_profiles")
      .select("profile_id")
      .eq("profile_id", booking.profile_id)
      .eq("user_id", user.id)
      .maybeSingle();
    allowed = Boolean(staff);
  }
  if (!allowed) return null;

  return {
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    videoExtendedUntil: booking.video_call_extended_until,
    status: booking.status,
  };
}
