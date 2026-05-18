import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SessionsHub } from "@/components/sessions/sessions-hub";
import { getServerTranslator } from "@/lib/i18n/server";
import { fetchBookingsForUser } from "@/lib/supabase/booking-repository";
import { fetchPendingRescheduleRequestsForClient } from "@/lib/supabase/reschedule-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("sessions.hub.title"),
    description: t("sessions.hub.intro"),
  };
}

export default async function SessionsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [bookings, pendingList] = await Promise.all([
    fetchBookingsForUser(supabase, user.id).catch(() => []),
    fetchPendingRescheduleRequestsForClient(supabase, user.id).catch(() => []),
  ]);

  const pendingBySessionId = Object.fromEntries(pendingList.map((p) => [p.session_id, p]));

  return (
    <SessionsHub bookings={bookings} pendingBySessionId={pendingBySessionId} viewerUserId={user.id} />
  );
}
