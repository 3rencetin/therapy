"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PROFILE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setProfileBannedAction(
  profileId: string,
  banned: boolean,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireRole("admin");

  if (!PROFILE_ID_RE.test(profileId)) {
    return { ok: false, message: "Geçersiz kullanıcı kimliği." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === profileId) {
    return { ok: false, message: "Kendi hesabınızı engelleyemezsiniz." };
  }

  const banned_at = banned ? new Date().toISOString() : null;
  const { error } = await supabase.from("profiles").update({ banned_at }).eq("id", profileId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { ok: true };
}
