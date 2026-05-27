"use server";

import { RoomServiceClient } from "livekit-server-sdk";

import { getLiveKitCredentials, getLiveKitHttpHost } from "@/lib/livekit/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { therapistLiveKitRoomName } from "@/lib/video/livekit-room";
import { isUserTherapistForProfile } from "@/lib/video/video-access";

/**
 * Terapist odasındaki katılımcı sayısı; seansa yetkili kullanıcılar okuyabilir.
 */
export async function getSessionVideoRoomParticipantCountAction(sessionId: string): Promise<number | null> {
  const host = getLiveKitHttpHost();
  const creds = getLiveKitCredentials();
  if (!host || !creds) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: booking, error } = await supabase
    .from("booked_sessions")
    .select("user_id, profile_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !booking) return null;

  let allowed = booking.user_id === user.id;
  if (!allowed) {
    allowed = await isUserTherapistForProfile(supabase, user.id, booking.profile_id);
  }
  if (!allowed) return null;

  try {
    const roomSvc = new RoomServiceClient(host, creds.apiKey, creds.apiSecret);
    const participants = await roomSvc.listParticipants(therapistLiveKitRoomName(booking.profile_id));
    return participants.length;
  } catch {
    return 0;
  }
}

export async function getTherapistRoomParticipantCountAction(profileId: string): Promise<number | null> {
  const host = getLiveKitHttpHost();
  const creds = getLiveKitCredentials();
  if (!host || !creds) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("therapist_profiles")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!profile) return null;

  let allowed = await isUserTherapistForProfile(supabase, user.id, profileId);
  if (!allowed) {
    const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    allowed = p?.role === "admin" || p?.role === "moderator";
  }
  if (!allowed) return null;

  try {
    const roomSvc = new RoomServiceClient(host, creds.apiKey, creds.apiSecret);
    const participants = await roomSvc.listParticipants(therapistLiveKitRoomName(profileId));
    return participants.length;
  } catch {
    return 0;
  }
}
