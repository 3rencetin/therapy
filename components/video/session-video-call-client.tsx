"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, CameraOff, Clock, Mic, MicOff } from "lucide-react";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  useChat,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState, RoomEvent, type Participant } from "livekit-client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extendSessionVideoAction } from "@/lib/actions/extend-session-video-action";
import { getSessionVideoTimingAction } from "@/lib/actions/session-video-timing-action";
import { issueVideoCallToken, type VideoCallTokenRequest } from "@/lib/actions/video-call-token-action";
import { getSessionVideoEffectiveEndMs, VIDEO_WRAPUP_WARN_MS } from "@/lib/video/join-window";
import type { SessionVideoCallPageTiming } from "@/lib/video/load-session-video-call";
import { playParticipantJoinChime } from "@/lib/video/play-participant-join-chime";
import { cn } from "@/lib/utils";

const TOKEN_ERR_MAP: Record<string, string> = {
  LIVEKIT_NOT_CONFIGURED: "sessions.video.errLivekit",
  UNAUTHORIZED: "sessions.video.errUnauthorized",
  SESSION_NOT_FOUND: "sessions.video.errNotFound",
  THERAPIST_NOT_FOUND: "sessions.video.errNotFound",
  FORBIDDEN: "sessions.video.errForbidden",
  SESSION_CANCELLED: "sessions.video.errCancelled",
  SESSION_NOT_JOINABLE: "sessions.video.errNotJoinable",
  SESSION_ENDED: "sessions.video.errEnded",
  SESSION_TOO_EARLY: "sessions.video.errTooEarly",
  OTHER_SESSION_ACTIVE: "sessions.video.errOtherSessionActive",
  INVITE_NOT_FOUND: "sessions.video.errInviteNotFound",
  INVITE_EXPIRED: "sessions.video.errInviteExpired",
  INVITE_USED: "sessions.video.errInviteUsed",
  INVITE_WRONG_USER: "sessions.video.errInviteWrongUser",
};

const EXTEND_ERR_MAP: Record<string, string> = {
  INVALID_MINUTES: "sessions.video.extendErrInvalidMinutes",
  FORBIDDEN: "sessions.video.extendErrForbidden",
  BAD_STATUS: "sessions.video.extendErrBadStatus",
  NOT_FOUND: "sessions.video.extendErrNotFound",
  RPC_ERROR: "sessions.video.extendErrRpc",
};

function SessionRemainingCountdown({
  endsAt,
  videoExtendedUntil,
}: {
  endsAt: string;
  videoExtendedUntil: string | null;
}) {
  const { t } = useI18n();
  const [, bump] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => bump((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const endMs = getSessionVideoEffectiveEndMs(endsAt, videoExtendedUntil);
  const remSec = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
  const hh = Math.floor(remSec / 3600);
  const mm = Math.floor((remSec % 3600) / 60);
  const ss = remSec % 60;
  const digits =
    hh > 0
      ? `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
      : `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
      <span className="text-[0.68rem] font-medium tracking-wide text-muted-foreground uppercase">
        {t("sessions.video.remainingLabel")}
      </span>
      <span className="text-[0.88rem] font-semibold tracking-tight text-foreground/95">{digits}</span>
    </span>
  );
}

function CallChrome({
  backHref,
  countdown,
  title,
}: {
  backHref: string;
  countdown: ReactNode;
  title: string;
}) {
  const { t } = useI18n();
  const room = useRoomContext();
  const router = useRouter();

  const leave = useCallback(() => {
    room.disconnect();
    router.push(backHref);
  }, [backHref, room, router]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur-md">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.72rem] font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
      </div>
      <div className="order-3 flex w-full justify-center sm:order-none sm:w-auto sm:justify-end">{countdown}</div>
      <Button type="button" variant="outline" size="sm" className="order-2 shrink-0 rounded-xl sm:order-none" onClick={leave}>
        {t("sessions.video.leave")}
      </Button>
    </div>
  );
}

function VideoSessionLifecycle({
  endsAt,
  videoExtendedUntil,
  isTherapist,
  sessionId,
  backHref,
  setVideoExtendedUntil,
  onNeedTokenRefresh,
}: {
  endsAt: string;
  videoExtendedUntil: string | null;
  isTherapist: boolean;
  sessionId: string;
  backHref: string;
  setVideoExtendedUntil: (v: string | null) => void;
  onNeedTokenRefresh: () => Promise<void>;
}) {
  const { t } = useI18n();
  const room = useRoomContext();
  const router = useRouter();
  const closedRef = useRef(false);
  const [showWrapupWarn, setShowWrapupWarn] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState("15");
  const [extendBusy, setExtendBusy] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [extendAckMinutes, setExtendAckMinutes] = useState<number | null>(null);

  const effectiveEndMs = useMemo(
    () => getSessionVideoEffectiveEndMs(endsAt, videoExtendedUntil),
    [endsAt, videoExtendedUntil],
  );

  useEffect(() => {
    if (extendAckMinutes == null) return;
    const id = window.setTimeout(() => setExtendAckMinutes(null), 6000);
    return () => window.clearTimeout(id);
  }, [extendAckMinutes]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      if (now >= effectiveEndMs) {
        if (!closedRef.current) {
          closedRef.current = true;
          room.disconnect();
          router.push(backHref);
        }
        return;
      }
      setShowWrapupWarn(now >= effectiveEndMs - VIDEO_WRAPUP_WARN_MS);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [effectiveEndMs, room, router, backHref]);

  async function submitExtend() {
    setExtendError(null);
    const raw = Number.parseInt(extendMinutes.trim(), 10);
    if (!Number.isFinite(raw)) {
      setExtendError(t("sessions.video.extendErrInvalidMinutes"));
      return;
    }
    setExtendBusy(true);
    try {
      const res = await extendSessionVideoAction(sessionId, raw);
      if (!res.ok) {
        const key = EXTEND_ERR_MAP[res.message];
        setExtendError(key ? t(key) : t("sessions.video.extendErrRpc"));
        return;
      }
      setVideoExtendedUntil(res.extendedUntil);
      setExtendAckMinutes(raw);
      await onNeedTokenRefresh();
    } finally {
      setExtendBusy(false);
    }
  }

  return (
    <>
      {showWrapupWarn ? (
        <div
          className={cn(
            "pointer-events-auto absolute right-3 left-3 top-3 z-10 rounded-xl border border-amber-400/35 bg-amber-500/15 px-3 py-2.5 text-[0.82rem] text-amber-50/95 shadow-lg backdrop-blur-md sm:right-4 sm:left-4",
          )}
        >
          <p className="flex items-start gap-2 leading-relaxed">
            <Clock className="mt-0.5 size-4 shrink-0 opacity-90" />
            <span>{t("sessions.video.wrapupWarning")}</span>
          </p>
        </div>
      ) : null}

      {extendAckMinutes != null ? (
        <div
          className={cn(
            "pointer-events-none absolute right-3 left-3 z-10 rounded-xl border border-emerald-400/30 bg-emerald-500/[0.14] px-3 py-2 text-center text-[0.78rem] leading-relaxed text-emerald-50/95 shadow-md backdrop-blur-md sm:left-auto sm:max-w-md sm:text-left",
            showWrapupWarn ? "top-[5.75rem] sm:top-[5rem]" : "top-3",
          )}
        >
          {t("sessions.video.extendAdded", { minutes: extendAckMinutes })}
        </div>
      ) : null}

      {isTherapist ? (
        <div className="pointer-events-auto absolute right-3 bottom-3 left-3 z-10 sm:right-4 sm:bottom-4 sm:left-auto sm:max-w-[280px]">
          <details className="rounded-xl border border-border/50 bg-background/92 p-3 shadow-lg backdrop-blur-md">
            <summary className="cursor-pointer select-none text-[0.8rem] font-medium text-foreground/95">
              {t("sessions.video.extendTitle")}
            </summary>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">{t("sessions.video.extendHint")}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex min-w-0 flex-1 flex-col gap-1 text-[0.68rem] text-muted-foreground">
                <span>{t("sessions.video.extendMinutesLabel")}</span>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  inputMode="numeric"
                  value={extendMinutes}
                  onChange={(e) => setExtendMinutes(e.target.value)}
                  className="h-10 rounded-lg text-[0.85rem]"
                  disabled={extendBusy}
                />
              </label>
              <Button
                type="button"
                size="sm"
                className="mt-1 shrink-0 rounded-xl sm:mt-5"
                disabled={extendBusy}
                onClick={() => void submitExtend()}
              >
                {extendBusy ? t("sessions.video.extending") : t("sessions.video.extendSubmit")}
              </Button>
            </div>
            {extendError ? <p className="mt-2 text-[0.75rem] text-rose-200/95">{extendError}</p> : null}
          </details>
        </div>
      ) : null}
    </>
  );
}

function VideoConferenceStage({ children }: { children?: ReactNode }) {
  return (
    <div
      className="terapi-video-room relative h-full min-h-0 w-full flex-1"
      data-lk-theme="default"
    >
      {children}
      <VideoConference />
      <MediaQuickControls />
    </div>
  );
}

function MediaQuickControls() {
  const room = useRoomContext();
  const [busy, setBusy] = useState<"mic" | "cam" | null>(null);
  const [, bump] = useState(0);
  const canPublish = room.localParticipant.permissions?.canPublish ?? true;

  useEffect(() => {
    const sync = () => bump((n) => n + 1);
    room.on(RoomEvent.LocalTrackPublished, sync);
    room.on(RoomEvent.LocalTrackUnpublished, sync);
    room.on(RoomEvent.TrackMuted, sync);
    room.on(RoomEvent.TrackUnmuted, sync);
    return () => {
      room.off(RoomEvent.LocalTrackPublished, sync);
      room.off(RoomEvent.LocalTrackUnpublished, sync);
      room.off(RoomEvent.TrackMuted, sync);
      room.off(RoomEvent.TrackUnmuted, sync);
    };
  }, [room]);

  if (!canPublish) return null;

  const micOn = room.localParticipant.isMicrophoneEnabled;
  const camOn = room.localParticipant.isCameraEnabled;

  async function toggleMic() {
    setBusy("mic");
    try {
      await room.localParticipant.setMicrophoneEnabled(!micOn);
    } finally {
      setBusy(null);
    }
  }

  async function toggleCam() {
    setBusy("cam");
    try {
      await room.localParticipant.setCameraEnabled(!camOn);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pointer-events-none absolute right-4 bottom-[4.6rem] z-[9] flex items-center gap-2">
      <button
        type="button"
        className="pointer-events-auto inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 disabled:opacity-60"
        onClick={() => void toggleMic()}
        disabled={busy != null}
        aria-label={micOn ? "Mikrofonu kapat" : "Mikrofonu ac"}
        title={micOn ? "Mikrofon acik" : "Mikrofon kapali"}
      >
        {micOn ? <Mic className="size-4.5" /> : <MicOff className="size-4.5 text-rose-300" />}
      </button>
      <button
        type="button"
        className="pointer-events-auto inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 disabled:opacity-60"
        onClick={() => void toggleCam()}
        disabled={busy != null}
        aria-label={camOn ? "Kamerayi kapat" : "Kamerayi ac"}
        title={camOn ? "Kamera acik" : "Kamera kapali"}
      >
        {camOn ? <Camera className="size-4.5" /> : <CameraOff className="size-4.5 text-rose-300" />}
      </button>
    </div>
  );
}

function SoloRoomHint() {
  const { t } = useI18n();
  const room = useRoomContext();
  const participants = useParticipants();
  const [, bump] = useState(0);

  useEffect(() => {
    const bumpState = () => bump((n) => n + 1);
    room.on(RoomEvent.LocalTrackPublished, bumpState);
    room.on(RoomEvent.LocalTrackUnpublished, bumpState);
    room.on(RoomEvent.TrackMuted, bumpState);
    room.on(RoomEvent.TrackUnmuted, bumpState);
    return () => {
      room.off(RoomEvent.LocalTrackPublished, bumpState);
      room.off(RoomEvent.LocalTrackUnpublished, bumpState);
      room.off(RoomEvent.TrackMuted, bumpState);
      room.off(RoomEvent.TrackUnmuted, bumpState);
    };
  }, [room]);

  const remoteCount = participants.filter((p) => !p.isLocal).length;
  const camOn = room.localParticipant.isCameraEnabled;

  if (remoteCount > 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[6] flex items-center justify-center p-6">
      <p className="max-w-md text-center text-[0.95rem] leading-relaxed text-white/85">
        {!camOn ? t("sessions.video.enableCameraHint") : t("sessions.video.waitingForGuest")}
      </p>
    </div>
  );
}

function ParticipantJoinChatAndChime() {
  const { t } = useI18n();
  const room = useRoomContext();
  const { send } = useChat();
  const announcedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      for (const id of timersRef.current) {
        window.clearTimeout(id);
      }
      timersRef.current = [];
    };

    const trySendJoinMessage = () => {
      if (announcedRef.current) return;
      if (room.state !== ConnectionState.Connected) return;
      if (room.remoteParticipants.size === 0) return;
      announcedRef.current = true;
      const name =
        room.localParticipant.name?.trim() ||
        room.localParticipant.identity ||
        t("sessions.video.participantFallbackName");
      void send(t("sessions.video.userJoinedChat", { name }));
    };

    const onRoomConnected = () => {
      clearTimers();
      timersRef.current.push(
        window.setTimeout(trySendJoinMessage, 350),
        window.setTimeout(trySendJoinMessage, 1_600),
      );
    };

    if (room.state === ConnectionState.Connected) {
      onRoomConnected();
    } else {
      room.on(RoomEvent.Connected, onRoomConnected);
    }

    const onParticipantConnected = (participant: Participant) => {
      if (participant.isLocal) return;
      const joinedMs = participant.joinedAt?.getTime();
      if (joinedMs == null || Date.now() - joinedMs > 12_000) return;
      playParticipantJoinChime();
    };
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);

    return () => {
      clearTimers();
      room.off(RoomEvent.Connected, onRoomConnected);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
    };
  }, [room, send, t]);

  return null;
}

function RoomSessionBody({
  sessionId,
  backHref,
  endsAt,
  videoExtendedUntil,
  setVideoExtendedUntil,
  isTherapist,
  setCredentials,
  headerTitle,
  tokenSource,
}: {
  sessionId: string;
  backHref: string;
  endsAt: string;
  videoExtendedUntil: string | null;
  setVideoExtendedUntil: (v: string | null) => void;
  isTherapist: boolean;
  setCredentials: (url: string, token: string) => void;
  headerTitle: string;
  tokenSource: VideoCallTokenRequest;
}) {
  const room = useRoomContext();
  const pendingMediaRestoreRef = useRef<{ mic: boolean; cam: boolean } | null>(null);
  const extRef = useRef(videoExtendedUntil);

  useEffect(() => {
    extRef.current = videoExtendedUntil;
  }, [videoExtendedUntil]);

  const refreshAccessTokenPreservingMedia = useCallback(async () => {
    pendingMediaRestoreRef.current = {
      mic: room.localParticipant.isMicrophoneEnabled,
      cam: room.localParticipant.isCameraEnabled,
    };
    const res = await issueVideoCallToken(tokenSource);
    if (!res.ok) {
      pendingMediaRestoreRef.current = null;
      return;
    }
    await room.disconnect();
    setCredentials(res.url, res.token);
  }, [room, tokenSource, setCredentials]);

  useEffect(() => {
    const onConnected = () => {
      const pending = pendingMediaRestoreRef.current;
      if (!pending) return;
      pendingMediaRestoreRef.current = null;
      void Promise.all([
        room.localParticipant.setMicrophoneEnabled(pending.mic),
        room.localParticipant.setCameraEnabled(pending.cam),
      ]);
    };
    room.on(RoomEvent.Connected, onConnected);
    return () => {
      room.off(RoomEvent.Connected, onConnected);
    };
  }, [room]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void (async () => {
        const timing = await getSessionVideoTimingAction(sessionId);
        if (!timing) return;
        const prev = extRef.current;
        const next = timing.videoExtendedUntil;
        const canon = (s: string | null) => {
          if (s == null) return "";
          const ms = new Date(s).getTime();
          return Number.isFinite(ms) ? String(ms) : s;
        };
        if (canon(prev) !== canon(next)) {
          setVideoExtendedUntil(next);
          await refreshAccessTokenPreservingMedia();
        }
      })();
    }, 12_000);
    return () => window.clearInterval(id);
  }, [sessionId, refreshAccessTokenPreservingMedia, setVideoExtendedUntil]);

  return (
    <>
      <CallChrome
        backHref={backHref}
        title={headerTitle}
        countdown={<SessionRemainingCountdown endsAt={endsAt} videoExtendedUntil={videoExtendedUntil} />}
      />
      <ParticipantJoinChatAndChime />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#111]">
        <div className="pointer-events-none absolute inset-0 z-[5]">
          <VideoSessionLifecycle
            endsAt={endsAt}
            videoExtendedUntil={videoExtendedUntil}
            isTherapist={isTherapist}
            sessionId={sessionId}
            backHref={backHref}
            setVideoExtendedUntil={setVideoExtendedUntil}
            onNeedTokenRefresh={refreshAccessTokenPreservingMedia}
          />
        </div>
        <VideoConferenceStage>
          <SoloRoomHint />
        </VideoConferenceStage>
      </div>
      <RoomAudioRenderer />
    </>
  );
}

function RoomOfficeBody({
  backHref,
  headerTitle,
}: {
  backHref: string;
  headerTitle: string;
}) {
  return (
    <>
      <CallChrome backHref={backHref} title={headerTitle} countdown={null} />
      <ParticipantJoinChatAndChime />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#111]">
        <VideoConferenceStage>
          <SoloRoomHint />
        </VideoConferenceStage>
      </div>
      <RoomAudioRenderer />
    </>
  );
}

export type VideoCallClientProps = {
  tokenSource: VideoCallTokenRequest;
  backHref: string;
  headerTitleKey?: string;
  /** Seans görüşmesi: geri sayım ve uzatma */
  sessionMode?: {
    sessionId: string;
    initialTiming: SessionVideoCallPageTiming;
    isTherapist: boolean;
  };
};

export function SessionVideoCallClient({ tokenSource, backHref, headerTitleKey, sessionMode }: VideoCallClientProps) {
  const { t } = useI18n();
  const headerTitle = headerTitleKey ? t(headerTitleKey) : t("sessions.video.roomTitle");
  const [url, setUrl] = useState<string | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [failCode, setFailCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoExtendedUntil, setVideoExtendedUntil] = useState<string | null>(
    sessionMode?.initialTiming.videoExtendedUntil ?? null,
  );

  const setCredentials = useCallback((nextUrl: string, nextToken: string) => {
    setUrl(nextUrl);
    setToken(nextToken);
  }, []);

  const tokenKey = JSON.stringify(tokenSource);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setFailCode(null);
      const res = await issueVideoCallToken(tokenSource);
      if (cancelled) return;
      if (res.ok) {
        setUrl(res.url);
        setToken(res.token);
      } else {
        setFailCode(res.message);
        const msgKey = TOKEN_ERR_MAP[res.message];
        setError(msgKey ? t(msgKey) : t("sessions.video.errGeneric"));
        setUrl(undefined);
        setToken(undefined);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenKey]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[0.9rem] text-muted-foreground">{t("sessions.video.connecting")}</p>
      </div>
    );
  }

  if (error || !url || !token) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
        <p className="font-display text-lg">
          {failCode === "LIVEKIT_NOT_CONFIGURED" ? t("sessions.video.configTitle") : headerTitle}
        </p>
        <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{error ?? t("sessions.video.errGeneric")}</p>
        {failCode === "LIVEKIT_NOT_CONFIGURED" ? (
          <p className="text-[0.82rem] leading-relaxed text-muted-foreground/90">{t("sessions.video.configBody")}</p>
        ) : null}
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={backHref} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            {t("sessions.video.backSessions")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex h-dvh flex-col bg-[#111]">
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        <LiveKitRoom
          serverUrl={url}
          token={token}
          connect
          audio={false}
          video={false}
          onDisconnected={() => {}}
          className="flex h-full min-h-0 flex-1 flex-col"
        >
          {sessionMode ? (
            <RoomSessionBody
              sessionId={sessionMode.sessionId}
              backHref={backHref}
              endsAt={sessionMode.initialTiming.endsAt}
              videoExtendedUntil={videoExtendedUntil}
              setVideoExtendedUntil={setVideoExtendedUntil}
              isTherapist={sessionMode.isTherapist}
              setCredentials={setCredentials}
              headerTitle={headerTitle}
              tokenSource={tokenSource}
            />
          ) : (
            <RoomOfficeBody backHref={backHref} headerTitle={headerTitle} />
          )}
        </LiveKitRoom>
      </div>
    </div>
  );
}
