import { redirect } from "next/navigation";

import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { deriveDisplayName } from "@/lib/dashboard/derive-display-name";
import { loadDashboardBootstrap } from "@/lib/dashboard/load-dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaName = typeof meta?.full_name === "string" ? meta.full_name : undefined;
  const displayName = deriveDisplayName(user.email ?? undefined, metaName);

  const bootstrap = await loadDashboardBootstrap(supabase, user.id);

  return (
    <DashboardHome
      displayName={displayName}
      userId={user.id}
      bootstrap={bootstrap}
    />
  );
}
