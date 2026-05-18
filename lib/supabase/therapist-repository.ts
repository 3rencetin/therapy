import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { TherapistProfileRow } from "@/types/database";

export async function fetchVerifiedTherapistProfiles(
  client: AppSupabaseClient,
): Promise<TherapistProfileRow[]> {
  const { data, error } = await client
    .from("therapist_profiles")
    .select("*")
    .order("rating", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTherapistProfileById(
  client: AppSupabaseClient,
  profileId: string,
): Promise<TherapistProfileRow | null> {
  const { data, error } = await client
    .from("therapist_profiles")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchTherapistProfileByUserId(
  client: AppSupabaseClient,
  userId: string,
): Promise<TherapistProfileRow | null> {
  const byStaffLink = await client
    .from("therapist_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (byStaffLink.error) throw byStaffLink.error;
  if (byStaffLink.data) return byStaffLink.data;

  const byProfileId = await client
    .from("therapist_profiles")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  if (byProfileId.error) throw byProfileId.error;
  return byProfileId.data;
}
