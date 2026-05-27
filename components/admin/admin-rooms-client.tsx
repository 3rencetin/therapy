"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCw, Users } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { listAdminTherapistRoomsAction, type AdminTherapistRoomRow } from "@/lib/actions/admin-video-rooms-actions";
import { therapistLiveKitRoomName } from "@/lib/video/livekit-room";

export function AdminRoomsClient() {
  const { t } = useI18n();
  const [rooms, setRooms] = useState<AdminTherapistRoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await listAdminTherapistRoomsAction();
    setLoading(false);
    if (!res.ok) {
      setError(t("admin.rooms.loadError"));
      return;
    }
    setRooms(res.rooms);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-[#0070E8] uppercase">{t("admin.rooms.kicker")}</p>
          <h1 className="section-heading">{t("admin.rooms.title")}</h1>
          <p className="text-[0.9rem] text-muted-foreground">{t("admin.rooms.description")}</p>
        </div>
        <Button type="button" variant="outline" className="rounded-xl" disabled={loading} onClick={() => void load()}>
          <RefreshCw className="size-4" />
          {t("admin.rooms.refresh")}
        </Button>
      </header>

      {error ? <p className="text-[0.85rem] text-rose-600">{error}</p> : null}

      <ul className="space-y-3">
        {loading ? (
          <li className="surface-premium rounded-[var(--radius-xl)] px-5 py-8 text-center text-muted-foreground">
            {t("admin.rooms.loading")}
          </li>
        ) : rooms.length === 0 ? (
          <li className="surface-premium rounded-[var(--radius-xl)] px-5 py-8 text-center text-muted-foreground">
            {t("admin.rooms.empty")}
          </li>
        ) : (
          rooms.map((room) => (
            <li
              key={room.profileId}
              className="surface-premium flex flex-col gap-3 rounded-[var(--radius-xl)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">{room.fullName}</p>
                <p className="text-[0.78rem] text-muted-foreground">
                  {room.professionalTitle ?? "—"} ·{" "}
                  <code className="text-[0.72rem]">{therapistLiveKitRoomName(room.profileId)}</code>
                </p>
                <p className="inline-flex items-center gap-1 text-[0.78rem] text-[#0070E8]">
                  <Users className="size-3.5" />
                  {room.participantCount > 0
                    ? t("sessions.video.roomParticipantsMany", { count: room.participantCount })
                    : t("admin.rooms.noParticipants")}
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 rounded-xl">
                <Link href={`/admin/rooms/${room.profileId}/call`}>
                  <Eye className="size-4" />
                  {t("admin.rooms.observe")}
                </Link>
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
