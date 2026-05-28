"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveSessionReflectionAction(input: {
  sessionId: string;
  mood: number;
  note: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Oturum gerekli." };

  const mood = Math.max(1, Math.min(5, Math.floor(input.mood)));
  const note = input.note.trim().slice(0, 2000);

  const { data: session, error: sessionErr } = await supabase
    .from("booked_sessions")
    .select("id, user_id, status, starts_at, ends_at")
    .eq("id", input.sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (sessionErr) return { ok: false, message: "Seans doğrulanamadı." };
  if (!session) return { ok: false, message: "Seans bulunamadı." };

  const ended = new Date(session.ends_at).getTime() <= Date.now();
  const completed = session.status === "completed";
  if (!ended && !completed) {
    return { ok: false, message: "Mini değerlendirme seans sonrası açılır." };
  }

  const { error } = await supabase.from("session_reflections").upsert(
    {
      session_id: input.sessionId,
      user_id: user.id,
      mood,
      note,
    },
    { onConflict: "session_id,user_id" },
  );
  if (error) return { ok: false, message: "Değerlendirme kaydedilemedi." };

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${input.sessionId}/notebook`);
  revalidatePath("/therapist/sessions");
  return { ok: true };
}
