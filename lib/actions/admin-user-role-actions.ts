"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-session";
import { normalizeAppRole, isAssignableProfileRole, type AssignableProfileRole } from "@/lib/auth/app-role";
import { syncTherapistDirectoryForProfile } from "@/lib/supabase/admin/sync-therapist-directory";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PROFILE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateProfileRoleAction(
  profileId: string,
  role: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireRole("admin");

  if (!PROFILE_ID_RE.test(profileId)) {
    return { ok: false, message: "Geçersiz kullanıcı kimliği." };
  }
  if (!isAssignableProfileRole(role)) {
    return { ok: false, message: "Geçersiz rol." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { ok: false, message: error.message };

  const syncErr = await syncTherapistDirectoryForProfile(supabase, profileId, role as AssignableProfileRole);
  if (syncErr) return { ok: false, message: syncErr.message };

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Rolü zaten terapist ama therapist_profiles eşlemesi eksik / hatalıysa (eski veri). */
export async function repairTherapistStaffRowAction(
  profileId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireRole("admin");

  if (!PROFILE_ID_RE.test(profileId)) {
    return { ok: false, message: "Geçersiz kullanıcı kimliği." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: prof, error: readErr } = await supabase.from("profiles").select("role").eq("id", profileId).maybeSingle();
  if (readErr) return { ok: false, message: readErr.message };
  if (normalizeAppRole(prof?.role) !== "therapist") {
    return { ok: false, message: "Bu satırın rolü terapist değil." };
  }

  const syncErr = await syncTherapistDirectoryForProfile(supabase, profileId, "therapist");
  if (syncErr) return { ok: false, message: syncErr.message };

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { ok: true };
}
