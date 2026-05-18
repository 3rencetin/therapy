"use server";

import { AccessToken } from "livekit-server-sdk";

import { getLiveKitCredentials, getLiveKitWsUrl } from "@/lib/livekit/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionVideoEffectiveEndMs, getVideoJoinPhase } from "@/lib/video/join-window";
import { liveKitRoomName } from "@/lib/video/livekit-room";

export type IssueSessionVideoTokenResult =
  | { ok: true; token: string; url: string; roomName: string }
  | { ok: false; message: string };

export async function issueSessionVideoToken(sessionId: string): Promise<IssueSessionVideoTokenResult> {
  const wsUrl = getLiveKitWsUrl();
  const creds = getLiveKitCredentials();
  if (!wsUrl || !creds) {
    return { ok: false, message: "LIVEKIT_NOT_CONFIGURED" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "UNAUTHORIZED" };
  }

  const { data: booking, error: bookingErr } = await supabase
    .from("booked_sessions")
    .select("id, user_id, profile_id, starts_at, ends_at, status, video_call_extended_until")
    .eq("id", sessionId)
    .maybeSingle();

  if (bookingErr || !booking) {
    return { ok: false, message: "SESSION_NOT_FOUND" };
  }

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

  if (!allowed) {
    return { ok: false, message: "FORBIDDEN" };
  }

  const phase = getVideoJoinPhase(
    booking.starts_at,
    booking.ends_at,
    booking.status,
    Date.now(),
    booking.video_call_extended_until,
  );
  if (phase === "cancelled") return { ok: false, message: "SESSION_CANCELLED" };
  if (phase === "invalid_status") return { ok: false, message: "SESSION_NOT_JOINABLE" };
  if (phase === "ended") return { ok: false, message: "SESSION_ENDED" };
  if (phase === "too_early") return { ok: false, message: "SESSION_TOO_EARLY" };

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const displayName = profile?.full_name?.trim() || user.email?.trim() || user.id.slice(0, 8);

  const roomName = liveKitRoomName(booking.id);
  const participantIdentity = `${booking.user_id === user.id ? "client" : "therapist"}_${user.id}`;

  const endMs = getSessionVideoEffectiveEndMs(booking.ends_at, booking.video_call_extended_until);
  const now = Date.now();
  const ttlSec = Math.min(6 * 60 * 60, Math.max(180, Math.ceil((endMs - now) / 1000) + 300));

  const token = new AccessToken(creds.apiKey, creds.apiSecret, {
    identity: participantIdentity,
    name: displayName,
    ttl: ttlSec,
  });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await token.toJwt();

  return { ok: true, token: jwt, url: wsUrl, roomName };
}
