import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SessionVideoCallClient } from "@/components/video/session-video-call-client";
import { getServerTranslator } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("sessions.video.inviteTitle"),
  };
}

export default async function JoinInviteVideoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/invite/${token}`)}`);
  }

  return (
    <SessionVideoCallClient
      tokenSource={{ type: "invite", inviteToken: token }}
      backHref="/dashboard/sessions"
      headerTitleKey="sessions.video.inviteTitle"
    />
  );
}
