import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { deriveDisplayName } from "@/lib/dashboard/derive-display-name";
import { requireRole } from "@/lib/auth/require-session";

export const metadata = {
  title: "Akış",
  description: "Kişiselleştirilmiş terapi ve wellness akışınız.",
};

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, profile } = await requireRole("user");
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaName = typeof meta?.full_name === "string" ? meta.full_name : undefined;
  const displayName = deriveDisplayName(user.email ?? undefined, profile?.full_name || metaName);

  return <DashboardShell displayName={displayName}>{children}</DashboardShell>;
}
