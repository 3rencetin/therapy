import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TherapistPrepNoteEditor } from "@/components/therapist/therapist-prep-note-editor";
import { getServerTranslator } from "@/lib/i18n/server";
import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTherapistPrepNoteBody } from "@/lib/supabase/therapist-prep-note-repository";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("therapist.prep.title"),
    description: t("therapist.prep.subtitle"),
  };
}

export default async function TherapistPrepNotePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, user.id);
  if (!staff) notFound();

  const { data: session } = await supabase
    .from("booked_sessions")
    .select("id, profile_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.profile_id !== staff.profile_id) {
    notFound();
  }

  const body = (await fetchTherapistPrepNoteBody(supabase, sessionId).catch(() => null)) ?? "";

  return <TherapistPrepNoteEditor sessionId={sessionId} initialBody={body} />;
}
