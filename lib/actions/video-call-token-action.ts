"use server";

import { AccessToken } from "livekit-server-sdk";

import { getLiveKitCredentials, getLiveKitWsUrl } from "@/lib/livekit/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { therapistLiveKitRoomName } from "@/lib/video/livekit-room";
import {
  ADMIN_OBSERVE_TTL_SEC,
  assertNoOtherActiveClientSession,
  getClientJoinPhase,
  getTherapistProfileForUser,
  isUserAdminOrModerator,
  isUserTherapistForProfile,
  THERAPIST_OFFICE_TTL_SEC,
  tokenTtlSecondsForSessionEnd,
  type BookedSessionVideoRow,
} from "@/lib/video/video-access";
import { getSessionVideoEffectiveEndMs } from "@/lib/video/join-window";

export type VideoCallTokenResult =
  | { ok: true; token: string; url: string; roomName: string }
  | { ok: false; message: string };

export type VideoCallTokenRequest =
  | { type: "session"; sessionId: string }
  | { type: "therapist_office" }
  | { type: "admin_observe"; profileId: string }
  | { type: "invite"; inviteToken: string };

async function displayNameForUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  email?: string | null,
): Promise<string> {
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();
  return profile?.full_name?.trim() || email?.trim() || userId.slice(0, 8);
}

async function buildToken(opts: {
  roomName: string;
  identity: string;
  name: string;
  ttlSec: number;
  canPublish: boolean;
  canSubscribe: boolean;
}): Promise<VideoCallTokenResult> {
  const wsUrl = getLiveKitWsUrl();
  const creds = getLiveKitCredentials();
  if (!wsUrl || !creds) return { ok: false, message: "LIVEKIT_NOT_CONFIGURED" };

  const token = new AccessToken(creds.apiKey, creds.apiSecret, {
    identity: opts.identity,
    name: opts.name,
    ttl: opts.ttlSec,
  });
  token.addGrant({
    room: opts.roomName,
    roomJoin: true,
    canPublish: opts.canPublish,
    canSubscribe: opts.canSubscribe,
  });
  const jwt = await token.toJwt();
  return { ok: true, token: jwt, url: wsUrl, roomName: opts.roomName };
}

export async function issueVideoCallToken(request: VideoCallTokenRequest): Promise<VideoCallTokenResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "UNAUTHORIZED" };

  const displayName = await displayNameForUser(supabase, user.id, user.email);

  if (request.type === "therapist_office") {
    const staff = await getTherapistProfileForUser(supabase, user.id);
    if (!staff) return { ok: false, message: "FORBIDDEN" };
    return buildToken({
      roomName: therapistLiveKitRoomName(staff.profile_id),
      identity: `therapist_${user.id}`,
      name: displayName,
      ttlSec: THERAPIST_OFFICE_TTL_SEC,
      canPublish: true,
      canSubscribe: true,
    });
  }

  if (request.type === "admin_observe") {
    const allowed = await isUserAdminOrModerator(supabase, user.id);
    if (!allowed) return { ok: false, message: "FORBIDDEN" };
    const { data: tp } = await supabase
      .from("therapist_profiles")
      .select("profile_id")
      .eq("profile_id", request.profileId)
      .maybeSingle();
    if (!tp) return { ok: false, message: "THERAPIST_NOT_FOUND" };
    return buildToken({
      roomName: therapistLiveKitRoomName(request.profileId),
      identity: `admin_${user.id}`,
      name: `${displayName} (Admin)`,
      ttlSec: ADMIN_OBSERVE_TTL_SEC,
      canPublish: true,
      canSubscribe: true,
    });
  }

  if (request.type === "invite") {
    const { data: invite, error } = await supabase
      .from("therapist_video_invites")
      .select("id, profile_id, session_id, invited_user_id, expires_at, used_at")
      .eq("token", request.inviteToken)
      .maybeSingle();

    if (error || !invite) return { ok: false, message: "INVITE_NOT_FOUND" };
    if (invite.used_at) return { ok: false, message: "INVITE_USED" };
    if (new Date(invite.expires_at).getTime() <= Date.now()) return { ok: false, message: "INVITE_EXPIRED" };

    if (invite.invited_user_id && invite.invited_user_id !== user.id) {
      return { ok: false, message: "INVITE_WRONG_USER" };
    }

    if (invite.session_id) {
      const { data: booking } = await supabase
        .from("booked_sessions")
        .select("id, user_id, profile_id, starts_at, ends_at, status, video_call_extended_until")
        .eq("id", invite.session_id)
        .maybeSingle();
      if (!booking || booking.profile_id !== invite.profile_id) return { ok: false, message: "FORBIDDEN" };
      if (booking.user_id !== user.id) {
        const isTherapist = await isUserTherapistForProfile(supabase, user.id, booking.profile_id);
        if (!isTherapist) return { ok: false, message: "FORBIDDEN" };
      }

      const isClient = booking.user_id === user.id;
      if (isClient) {
        const phase = getClientJoinPhase(booking as BookedSessionVideoRow);
        if (phase === "cancelled") return { ok: false, message: "SESSION_CANCELLED" };
        if (phase === "invalid_status") return { ok: false, message: "SESSION_NOT_JOINABLE" };
        if (phase === "ended") return { ok: false, message: "SESSION_ENDED" };
        if (phase === "too_early") return { ok: false, message: "SESSION_TOO_EARLY" };
        const clash = await assertNoOtherActiveClientSession(supabase, booking as BookedSessionVideoRow);
        if (!clash.ok) return { ok: false, message: clash.code };
      }

      await supabase
        .from("therapist_video_invites")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invite.id);

      const endMs = getSessionVideoEffectiveEndMs(booking.ends_at, booking.video_call_extended_until);
      const isTherapist = booking.user_id !== user.id;
      return buildToken({
        roomName: therapistLiveKitRoomName(booking.profile_id),
        identity: `${isClient ? "client" : "therapist"}_${user.id}`,
        name: displayName,
        ttlSec: isTherapist ? THERAPIST_OFFICE_TTL_SEC : tokenTtlSecondsForSessionEnd(endMs),
        canPublish: true,
        canSubscribe: true,
      });
    }

    const isTherapist = await isUserTherapistForProfile(supabase, user.id, invite.profile_id);
    if (invite.invited_user_id) {
      if (invite.invited_user_id !== user.id) return { ok: false, message: "INVITE_WRONG_USER" };
    } else if (!isTherapist) {
      return { ok: false, message: "FORBIDDEN" };
    }

    await supabase
      .from("therapist_video_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invite.id);

    return buildToken({
      roomName: therapistLiveKitRoomName(invite.profile_id),
      identity: `${isTherapist ? "therapist" : "client"}_${user.id}`,
      name: displayName,
      ttlSec: THERAPIST_OFFICE_TTL_SEC,
      canPublish: true,
      canSubscribe: true,
    });
  }

  // session
  const { data: booking, error: bookingErr } = await supabase
    .from("booked_sessions")
    .select("id, user_id, profile_id, starts_at, ends_at, status, video_call_extended_until")
    .eq("id", request.sessionId)
    .maybeSingle();

  if (bookingErr || !booking) return { ok: false, message: "SESSION_NOT_FOUND" };

  const isClient = booking.user_id === user.id;
  const isTherapist = await isUserTherapistForProfile(supabase, user.id, booking.profile_id);
  if (!isClient && !isTherapist) return { ok: false, message: "FORBIDDEN" };

  if (isClient) {
    const phase = getClientJoinPhase(booking as BookedSessionVideoRow);
    if (phase === "cancelled") return { ok: false, message: "SESSION_CANCELLED" };
    if (phase === "invalid_status") return { ok: false, message: "SESSION_NOT_JOINABLE" };
    if (phase === "ended") return { ok: false, message: "SESSION_ENDED" };
    if (phase === "too_early") return { ok: false, message: "SESSION_TOO_EARLY" };
    const clash = await assertNoOtherActiveClientSession(supabase, booking as BookedSessionVideoRow);
    if (!clash.ok) return { ok: false, message: clash.code };
  }

  const endMs = getSessionVideoEffectiveEndMs(booking.ends_at, booking.video_call_extended_until);
  const ttlSec = isTherapist
    ? THERAPIST_OFFICE_TTL_SEC
    : tokenTtlSecondsForSessionEnd(endMs);

  return buildToken({
    roomName: therapistLiveKitRoomName(booking.profile_id),
    identity: `${isClient ? "client" : "therapist"}_${user.id}`,
    name: displayName,
    ttlSec,
    canPublish: true,
    canSubscribe: true,
  });
}

/** Geriye dönük uyumluluk */
export async function issueSessionVideoToken(sessionId: string): Promise<VideoCallTokenResult> {
  return issueVideoCallToken({ type: "session", sessionId });
}
