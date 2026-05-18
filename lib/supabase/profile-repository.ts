import type { AppSupabaseClient } from "@/lib/supabase/app-client";
import { normalizeAppRole, type AppRole } from "@/lib/auth/app-role";
import type { ProfileRow } from "@/types/database";

export async function fetchProfileForUser(
  client: AppSupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export function roleFromProfile(row: ProfileRow | null): AppRole {
  return normalizeAppRole(row?.role);
}
