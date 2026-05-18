import type { AppSupabaseClient } from "@/lib/supabase/app-client";

export async function fetchTherapistPrepNoteBody(
  client: AppSupabaseClient,
  sessionId: string,
): Promise<string | null> {
  const { data, error } = await client
    .from("booked_session_therapist_private_notes")
    .select("body")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data?.body ?? null;
}

export async function upsertTherapistPrepNoteBody(
  client: AppSupabaseClient,
  sessionId: string,
  body: string,
): Promise<void> {
  const { error } = await client.from("booked_session_therapist_private_notes").upsert(
    {
      session_id: sessionId,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" },
  );
  if (error) throw error;
}
