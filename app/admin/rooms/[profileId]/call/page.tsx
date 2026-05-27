import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SessionVideoCallClient } from "@/components/video/session-video-call-client";
import { getServerTranslator } from "@/lib/i18n/server";
import { requireRole } from "@/lib/auth/require-session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslator();
  return {
    title: t("admin.rooms.observeTitle"),
  };
}

export default async function AdminRoomObservePage({ params }: { params: Promise<{ profileId: string }> }) {
  await requireRole(["admin", "moderator"]);
  const { profileId } = await params;

  return (
    <SessionVideoCallClient
      tokenSource={{ type: "admin_observe", profileId }}
      backHref="/admin/rooms"
      headerTitleKey="admin.rooms.observeTitle"
    />
  );
}
