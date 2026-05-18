import { requireRole } from "@/lib/auth/require-session";
import { TherapistSessionsClient } from "@/components/therapist/therapist-sessions-client";
import { TherapistUnlinkedPlaceholder } from "@/components/therapist/therapist-unlinked-placeholder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchPendingRescheduleRequestsForTherapist } from "@/lib/supabase/reschedule-repository";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";
import { fetchBookingsForTherapistProfile } from "@/lib/supabase/therapist-workspace-repository";

export default async function TherapistSessionsPage() {
  const { user } = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, user.id);

  if (!staff) {
    return (
      <div className="mx-auto max-w-4xl space-y-10">
        <TherapistUnlinkedPlaceholder />
      </div>
    );
  }

  const [bookings, pendingList] = await Promise.all([
    fetchBookingsForTherapistProfile(supabase, staff.profile_id),
    fetchPendingRescheduleRequestsForTherapist(supabase, staff.profile_id).catch(() => []),
  ]);

  const pendingBySessionId = Object.fromEntries(pendingList.map((p) => [p.session_id, p]));
  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => new Date(b.starts_at).getTime() >= now && (b.status === "pending" || b.status === "confirmed"),
  );
  const upcomingIds = new Set(upcoming.map((b) => b.id));
  const other = bookings.filter((b) => !upcomingIds.has(b.id));

  return (
    <TherapistSessionsClient
      profileId={staff.profile_id}
      therapistUserId={user.id}
      upcoming={upcoming}
      other={other}
      pendingBySessionId={pendingBySessionId}
    />
  );
}
