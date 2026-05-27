import type { Metadata } from "next";

import { AdminRoomsClient } from "@/components/admin/admin-rooms-client";
import { requireRole } from "@/lib/auth/require-session";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("admin.rooms.title"),
    description: t("admin.rooms.description"),
  };
}

export default async function AdminRoomsPage() {
  await requireRole(["admin", "moderator"]);
  return <AdminRoomsClient />;
}
