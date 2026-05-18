import type { PostgrestError } from "@supabase/supabase-js";

import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import type { AssignableProfileRole } from "@/lib/auth/app-role";

/**
 * profiles.role değişince therapist_profiles ile eşleşmeyi tutar.
 * profile_id = auth kullanıcı id (profiles.id) kullanılır; user_id aynı değere bağlanır.
 */
export async function syncTherapistDirectoryForProfile(
  supabase: AppSupabaseClient,
  profileId: string,
  role: AssignableProfileRole,
): Promise<PostgrestError | null> {
  if (role === "therapist") {
    const { error: orphanErr } = await supabase
      .from("therapist_profiles")
      .update({ user_id: null })
      .eq("user_id", profileId)
      .neq("profile_id", profileId);

    if (orphanErr) return orphanErr;

    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", profileId).maybeSingle();
    const name = prof?.full_name?.trim() || "Terapist";

    const { error } = await supabase.from("therapist_profiles").upsert(
      {
        profile_id: profileId,
        user_id: profileId,
        full_name: name,
        gender: "female",
        verified: false,
        active: true,
      },
      { onConflict: "profile_id" },
    );

    return error;
  }

  const { error } = await supabase
    .from("therapist_profiles")
    .update({ user_id: null, active: false })
    .eq("profile_id", profileId);

  return error;
}
