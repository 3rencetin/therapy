import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SessionVideoCallClient } from "@/components/video/session-video-call-client";
import { getServerTranslator } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTherapistProfileForUser } from "@/lib/video/video-access";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("therapist.office.callTitle"),
  };
}

export default async function TherapistOfficeCallPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const staff = await getTherapistProfileForUser(supabase, user.id);
  if (!staff) redirect("/therapist");

  return (
    <SessionVideoCallClient
      tokenSource={{ type: "therapist_office" }}
      backHref="/therapist/office"
      headerTitleKey="therapist.office.callTitle"
    />
  );
}
