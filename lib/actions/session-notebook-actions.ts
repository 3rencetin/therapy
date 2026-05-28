"use server";

import { revalidatePath } from "next/cache";

import {
  clampNotebookBody,
  clampNotebookTitle,
  SESSION_NOTEBOOK_MAX_PAGES,
} from "@/lib/sessions/notebook-limits";
import {
  fetchNotebookPagesForSession,
} from "@/lib/supabase/session-notebook-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type NotebookActionResult = { ok: true } | { ok: false; message: string };

async function ensureClientSession(client: Awaited<ReturnType<typeof createSupabaseServerClient>>, sessionId: string) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { user: null as null, session: null as null };

  const { data: session, error } = await client
    .from("booked_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return { user, session };
}

function editableSessionStatus(status: string): boolean {
  return status === "pending" || status === "confirmed" || status === "completed";
}

export async function saveSessionNotebookPageAction(input: {
  sessionId: string;
  pageId: string;
  title: string;
  body: string;
  therapistCanView: boolean;
}): Promise<NotebookActionResult> {
  const client = await createSupabaseServerClient();
  const { user, session } = await ensureClientSession(client, input.sessionId);
  if (!user) return { ok: false, message: "Oturum gerekli." };
  if (!session) return { ok: false, message: "Seans bulunamadı." };
  if (!editableSessionStatus(session.status)) return { ok: false, message: "Bu seans için not düzenlenemez." };

  const title = clampNotebookTitle(input.title);
  const body = clampNotebookBody(input.body);

  const { error } = await client
    .from("booked_session_notebook_pages")
    .update({ title, body, therapist_can_view: input.therapistCanView })
    .eq("id", input.pageId)
    .eq("session_id", input.sessionId);

  if (error) return { ok: false, message: "Sayfa kaydedilemedi." };

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${input.sessionId}/notebook`);
  revalidatePath("/therapist/sessions");
  return { ok: true };
}

export async function createSessionNotebookPageAction(
  sessionId: string,
): Promise<{ ok: true; pageId: string } | { ok: false; message: string }> {
  const client = await createSupabaseServerClient();
  const { user, session } = await ensureClientSession(client, sessionId);
  if (!user) return { ok: false, message: "Oturum gerekli." };
  if (!session) return { ok: false, message: "Seans bulunamadı." };
  if (!editableSessionStatus(session.status)) return { ok: false, message: "Bu seans için sayfa eklenemez." };

  const existing = await fetchNotebookPagesForSession(client, sessionId);
  if (existing.length >= SESSION_NOTEBOOK_MAX_PAGES) {
    return { ok: false, message: `En fazla ${SESSION_NOTEBOOK_MAX_PAGES} sayfa ekleyebilirsin.` };
  }

  const nextOrder = existing.length === 0 ? 0 : Math.max(...existing.map((p) => p.sort_order)) + 1;

  const { data, error } = await client
    .from("booked_session_notebook_pages")
    .insert({
      session_id: sessionId,
      sort_order: nextOrder,
      title: "",
      body: "",
      therapist_can_view: true,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: "Sayfa oluşturulamadı." };

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${sessionId}/notebook`);
  revalidatePath("/therapist/sessions");
  return { ok: true, pageId: data.id };
}

export async function deleteSessionNotebookPageAction(sessionId: string, pageId: string): Promise<NotebookActionResult> {
  const client = await createSupabaseServerClient();
  const { user, session } = await ensureClientSession(client, sessionId);
  if (!user) return { ok: false, message: "Oturum gerekli." };
  if (!session) return { ok: false, message: "Seans bulunamadı." };
  if (!editableSessionStatus(session.status)) return { ok: false, message: "Bu seans için sayfa silinemez." };

  const { error: delErr } = await client
    .from("booked_session_notebook_pages")
    .delete()
    .eq("id", pageId)
    .eq("session_id", sessionId);

  if (delErr) return { ok: false, message: "Sayfa silinemedi." };

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${sessionId}/notebook`);
  revalidatePath("/therapist/sessions");
  return { ok: true };
}
