import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { deriveDisplayName } from "@/lib/dashboard/derive-display-name";
import { requireRole } from "@/lib/auth/require-session";

export const metadata: Metadata = {
  title: "Yönetim",
  description: "Platform denetimi ve moderasyon.",
};

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, profile } = await requireRole(["admin", "moderator"]);
  const displayName = deriveDisplayName(user.email ?? undefined, profile?.full_name);

  return <AdminShell displayName={displayName}>{children}</AdminShell>;
}
