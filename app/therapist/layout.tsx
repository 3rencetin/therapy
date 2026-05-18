import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TherapistShell } from "@/components/therapist/therapist-shell";
import { deriveDisplayName } from "@/lib/dashboard/derive-display-name";
import { requireRole } from "@/lib/auth/require-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTherapistProfileByUserId } from "@/lib/supabase/therapist-repository";

export const metadata: Metadata = {
  title: "Terapist çalışma alanı",
  description: "Seanslar, müsaitlik ve profil yönetimi.",
};

export default async function TherapistLayout({ children }: Readonly<{ children: ReactNode }>) {
  const ctx = await requireRole("therapist");
  const supabase = await createSupabaseServerClient();
  const staff = await fetchTherapistProfileByUserId(supabase, ctx.user.id);
  const displayName = deriveDisplayName(ctx.user.email ?? undefined, staff?.full_name ?? ctx.profile?.full_name);

  return (
    <TherapistShell staffProfile={staff} displayName={displayName}>
      {children}
    </TherapistShell>
  );
}
