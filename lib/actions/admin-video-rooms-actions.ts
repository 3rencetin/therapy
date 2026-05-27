"use server";

import { RoomServiceClient } from "livekit-server-sdk";

import { getLiveKitCredentials, getLiveKitHttpHost } from "@/lib/livekit/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { therapistLiveKitRoomName } from "@/lib/video/livekit-room";
import { isUserAdminOrModerator } from "@/lib/video/video-access";

export type AdminTherapistRoomRow = {
  profileId: string;
  fullName: string;
  professionalTitle: string | null;
  active: boolean;
  participantCount: number;
};

export async function listAdminTherapistRoomsAction(): Promise<
  { ok: true; rooms: AdminTherapistRoomRow[] } | { ok: false; message: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "UNAUTHORIZED" };
  if (!(await isUserAdminOrModerator(supabase, user.id))) {
    return { ok: false, message: "FORBIDDEN" };
  }

  const { data: therapists, error } = await supabase
    .from("therapist_profiles")
    .select("profile_id, full_name, professional_title, active")
    .order("full_name", { ascending: true });

  if (error) return { ok: false, message: "LOAD_FAILED" };

  const host = getLiveKitHttpHost();
  const creds = getLiveKitCredentials();
  let roomSvc: RoomServiceClient | null = null;
  if (host && creds) {
    roomSvc = new RoomServiceClient(host, creds.apiKey, creds.apiSecret);
  }

  const rooms: AdminTherapistRoomRow[] = [];
  for (const tp of therapists ?? []) {
    let participantCount = 0;
    if (roomSvc) {
      try {
        const participants = await roomSvc.listParticipants(therapistLiveKitRoomName(tp.profile_id));
        participantCount = participants.length;
      } catch {
        participantCount = 0;
      }
    }
    rooms.push({
      profileId: tp.profile_id,
      fullName: tp.full_name,
      professionalTitle: tp.professional_title,
      active: tp.active,
      participantCount,
    });
  }

  return { ok: true, rooms };
}
