"use server";

import { RoomServiceClient } from "livekit-server-sdk";

import { getLiveKitCredentials, getLiveKitHttpHost } from "@/lib/livekit/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { liveKitRoomName } from "@/lib/video/livekit-room";

/**
 * Oda adı session ile eşleşir; sadece seansa yetkili kullanıcı sayımı alabilir.
 * Oda yoksa veya hata olursa 0 döner.
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
    const { data: staff } = await supabase
      .from("therapist_profiles")
      .select("profile_id")
      .eq("profile_id", booking.profile_id)
      .eq("user_id", user.id)
      .maybeSingle();
    allowed = Boolean(staff);
  }
  if (!allowed) return null;

  try {
    const roomSvc = new RoomServiceClient(host, creds.apiKey, creds.apiSecret);
    const participants = await roomSvc.listParticipants(liveKitRoomName(sessionId));
    return participants.length;
  } catch {
    return 0;
  }
}
