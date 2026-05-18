import { redirect } from "next/navigation";

import { homePathForRole } from "@/lib/auth/home-for-role";
import { fetchProfileForUser, roleFromProfile } from "@/lib/supabase/profile-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/auth/app-role";
import type { ProfileRow } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export type SessionContext = {
  user: User;
  profile: ProfileRow | null;
  role: AppRole;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await fetchProfileForUser(supabase, user.id).catch(() => null);
  const role = roleFromProfile(profile);
  return { user, profile, role };
}

/** Sunucuda rol doğrula; yanlış paneldeyse kendi köküne yönlendir. */
export async function requireRole(allowed: AppRole | AppRole[]): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) {
    redirect("/login");
  }
  if (ctx.profile?.banned_at) {
    redirect("/hesap-engellendi");
  }
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(ctx.role)) {
    redirect(homePathForRole(ctx.role));
  }
  return ctx;
}
