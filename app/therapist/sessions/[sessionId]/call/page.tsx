import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SessionVideoCallClient } from "@/components/video/session-video-call-client";
import { getServerTranslator } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadSessionVideoCallPageContext } from "@/lib/video/load-session-video-call";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("sessions.video.roomTitle"),
    description: t("sessions.video.join"),
  };
}

export default async function TherapistSessionVideoCallPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ctx = await loadSessionVideoCallPageContext(supabase, sessionId, user.id);
  if (!ctx.ok) {
    redirect("/therapist/sessions");
  }

  return (
    <SessionVideoCallClient
      sessionId={sessionId}
      backHref="/therapist/sessions"
      initialTiming={ctx.timing}
      isTherapist={ctx.isTherapist}
    />
  );
}
