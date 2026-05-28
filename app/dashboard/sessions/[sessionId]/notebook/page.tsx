import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SessionNotebookEditor } from "@/components/sessions/session-notebook-editor";
import { SessionReflectionCard } from "@/components/sessions/session-reflection-card";
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
  const { data: reflection } = await supabase
    .from("session_reflections")
    .select("mood, note")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  const reflectionEnabled = context.status === "completed" || new Date(context.ends_at).getTime() <= Date.now();

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <SessionNotebookEditor sessionId={sessionId} context={context} initialPages={pages} />
      <SessionReflectionCard
        sessionId={sessionId}
        initialMood={reflection?.mood ?? null}
        initialNote={reflection?.note ?? ""}
        enabled={reflectionEnabled}
      />
    </div>
  );
}
