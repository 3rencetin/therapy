"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users, Video } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { getSessionVideoRoomParticipantCountAction } from "@/lib/actions/session-video-room-presence-action";
import { getVideoJoinPhase, type VideoJoinPhase } from "@/lib/video/join-window";
import { cn } from "@/lib/utils";

function RoomPresencePill({ sessionId, poll }: { sessionId: string; poll: boolean }) {
  const { t } = useI18n();
  const [roomCount, setRoomCount] = useState<number | null>(null);

  useEffect(() => {
    if (!poll) {
      setRoomCount(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      const n = await getSessionVideoRoomParticipantCountAction(sessionId);
      if (cancelled) return;
      setRoomCount(n);
    };
    void run();
    const id = window.setInterval(run, 7000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [sessionId, poll]);

  if (roomCount == null || roomCount < 1) return null;

  const text =
    roomCount === 1
      ? t("sessions.video.roomParticipantsOne")
      : t("sessions.video.roomParticipantsMany", { count: roomCount });

  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-border/50 bg-white/[0.04] px-2.5 py-1 text-[0.72rem] font-medium text-muted-foreground tabular-nums"
      title={t("sessions.video.roomCountTitle")}
    >
      <Users className="size-3.5 shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{text}</span>
    </span>
  );
}

function joinShell(phase: VideoJoinPhase): boolean {
  return phase === "open" || phase === "too_early";
}

export function SessionJoinVideoControl({
  sessionId,
  startsAt,
  endsAt,
  status,
  videoExtendedUntil,
  callHref,
  className,
}: {
  sessionId?: string;
  startsAt: string;
  endsAt: string;
  status: string;
  videoExtendedUntil?: string | null;
  callHref: string;
  className?: string;
}) {
  const { t } = useI18n();
  const phase = useMemo(
    () => getVideoJoinPhase(startsAt, endsAt, status, Date.now(), videoExtendedUntil),
    [startsAt, endsAt, status, videoExtendedUntil],
  );

  const pollPresence = Boolean(sessionId) && joinShell(phase);
  const presence = sessionId ? <RoomPresencePill sessionId={sessionId} poll={pollPresence} /> : null;

  if (phase === "cancelled" || phase === "invalid_status") return null;

  if (phase === "ended") {
    return (
      <Button type="button" disabled variant="outline" size="sm" className={cn("rounded-xl", className)}>
        {t("sessions.video.endedShort")}
      </Button>
    );
  }

  if (phase === "too_early") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <Button type="button" disabled variant="outline" size="sm" className={cn("rounded-xl opacity-80")}>
          <Video className="mr-1.5 size-4 opacity-70" />
          {t("sessions.video.joinSoon")}
        </Button>
        {presence}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button asChild size="sm" className="rounded-xl">
        <Link href={callHref}>
          <Video className="mr-1.5 size-4" />
          {t("sessions.video.join")}
        </Link>
      </Button>
      {presence}
    </div>
  );
}
