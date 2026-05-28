import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { Database } from "@/types/database";

type NotebookRow = Database["public"]["Tables"]["booked_session_notebook_pages"]["Row"];

export type SessionNotebookPageDTO = Pick<
  NotebookRow,
  "id" | "sort_order" | "title" | "body" | "therapist_can_view" | "updated_at"
>;

export type ClientSessionNotebookContext = {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  therapist: { full_name: string; professional_title: string | null } | null;
};

export async function fetchClientSessionForNotebook(
  client: AppSupabaseClient,
  userId: string,
  sessionId: string,
): Promise<ClientSessionNotebookContext | null> {
  const { data, error } = await client
    .from("booked_sessions")
    .select(
      `
      id,
      status,
      starts_at,
      ends_at,
      therapist_profiles (
        full_name,
        professional_title
      )
    `,
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const rawTp = data.therapist_profiles;
  const tpRaw = Array.isArray(rawTp) ? rawTp[0] : rawTp;
  const tp =
    tpRaw && typeof tpRaw === "object"
      ? {
          full_name: typeof (tpRaw as { full_name?: unknown }).full_name === "string" ? (tpRaw as { full_name: string }).full_name : "",
          professional_title:
            typeof (tpRaw as { professional_title?: unknown }).professional_title === "string"
              ? (tpRaw as { professional_title: string }).professional_title
              : null,
        }
      : null;
  return {
    id: data.id,
    status: data.status,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    therapist: tp,
  };
}

export async function fetchNotebookPagesForSession(
  client: AppSupabaseClient,
  sessionId: string,
): Promise<SessionNotebookPageDTO[]> {
  const { data, error } = await client
    .from("booked_session_notebook_pages")
    .select("id, sort_order, title, body, therapist_can_view, updated_at")
    .eq("session_id", sessionId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SessionNotebookPageDTO[];
}
