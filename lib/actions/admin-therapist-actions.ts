"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function adminToggleTherapistVerifiedAction(
  profileId: string,
  verified: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireRole(["admin", "moderator"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("therapist_profiles").update({ verified }).eq("profile_id", profileId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/therapists");
  revalidatePath("/dashboard/therapists");
  return { ok: true };
}

export async function adminToggleTherapistActiveAction(
  profileId: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireRole(["admin", "moderator"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("therapist_profiles").update({ active }).eq("profile_id", profileId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/therapists");
  revalidatePath("/dashboard/therapists");
  return { ok: true };
}
