import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { BookedSessionRow, TherapistProfileRow } from "@/types/database";

export type BookedSessionListRow = Pick<
  BookedSessionRow,
  "id" | "profile_id" | "availability_id" | "starts_at" | "ends_at" | "status" | "payment_status"
> & {
  therapist_profiles: Pick<TherapistProfileRow, "full_name" | "professional_title" | "verified"> | null;
};

export async function fetchBookingsForUser(
  client: AppSupabaseClient,
  userId: string,
): Promise<BookedSessionListRow[]> {
  const { data, error } = await client
    .from("booked_sessions")
    .select(
      `
        id,
        profile_id,
        availability_id,
        starts_at,
        ends_at,
        status,
        payment_status,
        therapist_profiles (
          full_name,
          professional_title,
          verified
        )
      `,
    )
    .eq("user_id", userId)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BookedSessionListRow[];
}
