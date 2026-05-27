import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TherapistOfficeClient } from "@/components/therapist/therapist-office-client";
import { getServerTranslator } from "@/lib/i18n/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTherapistProfileForUser } from "@/lib/video/video-access";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("therapist.office.title"),
    description: t("therapist.office.description"),
  };
}

export default async function TherapistOfficePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const staff = await getTherapistProfileForUser(supabase, user.id);
  if (!staff) redirect("/therapist");

  return <TherapistOfficeClient profileId={staff.profile_id} therapistName={staff.full_name} />;
}
