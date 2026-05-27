"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Video } from "lucide-react";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTherapistVideoInviteAction } from "@/lib/actions/therapist-video-invite-actions";
import { getTherapistRoomParticipantCountAction } from "@/lib/actions/session-video-room-presence-action";
import { therapistLiveKitRoomName } from "@/lib/video/livekit-room";

export function TherapistOfficeClient({
  profileId,
  therapistName,
}: {
  profileId: string;
  therapistName: string;
}) {
  const { t } = useI18n();
  const [sessionId, setSessionId] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCount, setRoomCount] = useState<number | null>(null);

  async function refreshCount() {
    const n = await getTherapistRoomParticipantCountAction(profileId);
    setRoomCount(n);
  }

  async function createInvite() {
    setBusy(true);
    setError(null);
    setInviteUrl(null);
    const res = await createTherapistVideoInviteAction({
      sessionId: sessionId.trim() || undefined,
      expiresInHours: 24,
    });
    setBusy(false);
    if (!res.ok) {
      setError(t("therapist.office.inviteError"));
      return;
    }
    setInviteUrl(res.inviteUrl);
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-[#0070E8] uppercase">
          {t("therapist.office.kicker")}
        </p>
        <h1 className="section-heading">{t("therapist.office.title")}</h1>
        <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{t("therapist.office.description")}</p>
      </header>

      <div className="surface-premium space-y-4 rounded-[var(--radius-xl)] p-6">
        <p className="text-[0.85rem] text-muted-foreground">
          {t("therapist.office.roomLabel")}{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-[0.78rem] text-foreground">
            {therapistLiveKitRoomName(profileId)}
          </code>
        </p>
        <p className="text-[0.82rem] text-muted-foreground">{t("therapist.office.roomHint", { name: therapistName })}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-xl">
            <Link href="/therapist/office/call">
              <Video className="size-4" />
              {t("therapist.office.enterRoom")}
            </Link>
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => void refreshCount()}>
            {t("therapist.office.refreshCount")}
          </Button>
        </div>
        {roomCount != null && roomCount > 0 ? (
          <p className="text-[0.82rem] font-medium text-[#0070E8]">
            {t("sessions.video.roomParticipantsMany", { count: roomCount })}
          </p>
        ) : null}
      </div>

      <div className="surface-premium space-y-4 rounded-[var(--radius-xl)] p-6">
        <h2 className="font-display text-lg tracking-[-0.02em]">{t("therapist.office.inviteTitle")}</h2>
        <p className="text-[0.85rem] leading-relaxed text-muted-foreground">{t("therapist.office.inviteHint")}</p>
        <label className="block space-y-1.5 text-[0.8rem]">
          <span className="text-muted-foreground">{t("therapist.office.sessionIdOptional")}</span>
          <Input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder={t("therapist.office.sessionIdPlaceholder")}
            className="rounded-xl"
          />
        </label>
        <Button type="button" className="rounded-xl" disabled={busy} onClick={() => void createInvite()}>
          {busy ? t("therapist.office.inviteCreating") : t("therapist.office.createInvite")}
        </Button>
        {error ? <p className="text-[0.82rem] text-rose-600">{error}</p> : null}
        {inviteUrl ? (
          <div className="space-y-2 rounded-xl border border-border bg-muted/50 p-3">
            <p className="break-all text-[0.78rem] text-foreground">{inviteUrl}</p>
            <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => void copyInvite()}>
              <Copy className="size-3.5" />
              {t("therapist.office.copyInvite")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
