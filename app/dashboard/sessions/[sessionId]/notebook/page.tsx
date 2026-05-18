import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SessionNotebookEditor } from "@/components/sessions/session-notebook-editor";
import {
  fetchClientSessionForNotebook,
  fetchNotebookPagesForSession,
} from "@/lib/supabase/session-notebook-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Seans not defteri",
  description: "Seans öncesi notlarını sayfa sayfa kaydet.",
};

export default async function SessionNotebookPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const context = await fetchClientSessionForNotebook(supabase, user.id, sessionId);
  if (!context) {
    notFound();
  }

  const pages = await fetchNotebookPagesForSession(supabase, sessionId);

  return <SessionNotebookEditor sessionId={sessionId} context={context} initialPages={pages} />;
}
