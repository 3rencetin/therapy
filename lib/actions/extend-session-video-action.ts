"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ExtendSessionVideoResult =
  | { ok: true; extendedUntil: string }
  | { ok: false; message: string };

export async function extendSessionVideoAction(sessionId: string, minutes: number): Promise<ExtendSessionVideoResult> {
  const m = Math.floor(Number(minutes));
  if (!Number.isFinite(m) || m < 1 || m > 120) {
    return { ok: false, message: "INVALID_MINUTES" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "UNAUTHORIZED" };

  const { data, error } = await supabase.rpc("extend_booked_session_video", {
    p_session_id: sessionId,
    p_minutes: m,
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("forbidden")) return { ok: false, message: "FORBIDDEN" };
    if (msg.includes("bad_status")) return { ok: false, message: "BAD_STATUS" };
    if (msg.includes("invalid_minutes")) return { ok: false, message: "INVALID_MINUTES" };
    if (msg.includes("not_found")) return { ok: false, message: "NOT_FOUND" };
    return { ok: false, message: "RPC_ERROR" };
  }

  if (typeof data !== "string" || !data) {
    return { ok: false, message: "RPC_ERROR" };
  }

  return { ok: true, extendedUntil: data };
}
