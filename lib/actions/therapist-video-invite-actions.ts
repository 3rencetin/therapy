"use server";

import { headers } from "next/headers";
import { randomBytes } from "crypto";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTherapistProfileForUser } from "@/lib/video/video-access";

export type CreateVideoInviteResult =
  | { ok: true; inviteUrl: string; expiresAt: string }
  | { ok: false; message: string };

async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function createTherapistVideoInviteAction(input: {
  sessionId?: string;
  invitedUserId?: string;
  expiresInHours?: number;
}): Promise<CreateVideoInviteResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "UNAUTHORIZED" };

  const staff = await getTherapistProfileForUser(supabase, user.id);
  if (!staff) return { ok: false, message: "FORBIDDEN" };

  const sessionId: string | null = input.sessionId ?? null;
  let invitedUserId: string | null = input.invitedUserId ?? null;

  if (sessionId) {
    const { data: booking } = await supabase
      .from("booked_sessions")
      .select("id, profile_id, user_id")
      .eq("id", sessionId)
      .maybeSingle();
    if (!booking || booking.profile_id !== staff.profile_id) {
      return { ok: false, message: "SESSION_NOT_FOUND" };
    }
    invitedUserId = booking.user_id;
  }

  const hours = Math.min(72, Math.max(1, input.expiresInHours ?? 24));
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const token = randomBytes(24).toString("base64url");

  const { error } = await supabase.from("therapist_video_invites").insert({
    profile_id: staff.profile_id,
    session_id: sessionId,
    invited_user_id: invitedUserId,
    created_by: user.id,
    token,
    expires_at: expiresAt,
  });

  if (error) return { ok: false, message: "INSERT_FAILED" };

  return {
    ok: true,
    inviteUrl: `${await appOrigin()}/join/invite/${token}`,
    expiresAt,
  };
}
