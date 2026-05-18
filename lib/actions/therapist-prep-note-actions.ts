"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertTherapistPrepNoteBody } from "@/lib/supabase/therapist-prep-note-repository";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";

export async function saveTherapistPrepNoteAction(
  sessionId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!staff) return { ok: false, message: "Profil bulunamadı." };

  const { data: session, error: sErr } = await supabase
    .from("booked_sessions")
    .select("id, profile_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (sErr) return { ok: false, message: sErr.message };
  if (!session || session.profile_id !== staff.profile_id) {
    return { ok: false, message: "Seans bulunamadı." };
  }

  if (body.length > 50_000) return { ok: false, message: "Not çok uzun." };

  try {
    await upsertTherapistPrepNoteBody(supabase, sessionId, body);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Kaydedilemedi." };
  }

  revalidatePath("/therapist/sessions");
  revalidatePath(`/therapist/sessions/${sessionId}/prep`);
  return { ok: true };
}
